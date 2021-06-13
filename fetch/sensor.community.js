import request from 'request'

import doSynchronousLoop from '../helpers/doSynchronousLoop'

import Station from '../models/Station'
import StationValue from '../models/StationValue'
import StationFetchInfo from '../models/StationFetchInfo'
import StationSource from '../models/StationSource'

const fetchSensorCommunity = function () {
    request('https://data.sensor.community/static/v2/data.json', { json: true }, async (err, res, body) => {
    // request('http://localhost:3000/test111', { json: true }, async (err, res, body) => {
        if (err) return console.log(err)
        
        console.log("received new data ...")

        const data = res.body
        doSynchronousLoop(data, processDataItem, () => console.log("new data processed !"));
    })
}

const processDataItem = async function (dataItem, i, next) {
    const humidity = dataItem.sensordatavalues.find(x => x.value_type == 'humidity')?.value
    const pressure = dataItem.sensordatavalues.find(x => x.value_type == 'pressure')?.value
    const temperature = dataItem.sensordatavalues.find(x => x.value_type == 'temperature')?.value
    const pm10 = dataItem.sensordatavalues.find(x => x.value_type == 'P1')?.value
    const pm25 = dataItem.sensordatavalues.find(x => x.value_type == 'P2')?.value

    const fetchInfo = await StationFetchInfo.findOne({
        station_source: 1,
        data: JSON.stringify({ location_id: dataItem.location.id })
    })
        .map(x => x?.toObject())
        .map(x => x ? ({ ...x, location_id: JSON.parse(x?.data)?.location_id }) : x)

    if (fetchInfo) { //update values or insert new value record
        const stationValue = await StationValue.findOne({
            station_id: fetchInfo.station_id,
            timestamp: new Date(dataItem.timestamp + ' UTC'),
        })
        if (stationValue) { // update missing data
            stationValue.humidity ??= humidity
            stationValue.pressure ??= pressure
            stationValue.temperature ??= temperature
            stationValue.pm10 ??= pm10
            stationValue.pm25 ??= pm25

            await stationValue.save().catch(err => console.log(err.message))
            console.log("values were updated")
        }
        else { // insert new value record
            const stationValue = new StationValue({
                station_id: fetchInfo.station_id,
                timestamp: new Date(dataItem.timestamp + ' UTC'),
                humidity,
                pressure,
                temperature,
                pm10,
                pm25
            })

            await stationValue.save().catch(err => console.log(err.message))
            console.log("inserted new StationValue")
        }
    }
    else { // create new station of not exist and create stationFetchInfo with values
        const station = new Station({
            latitude: dataItem.location.latitude,
            longitude: dataItem.location.longitude
        })

        const stationFetchInfo = new StationFetchInfo({
            station_id: station._id,
            station_source: 1,
            data: JSON.stringify({ location_id: dataItem.location.id })
        })

        const stationValue = new StationValue({
            station_id: station._id,
            timestamp: new Date(dataItem.timestamp + ' UTC'),
            humidity,
            pressure,
            temperature,
            pm10,
            pm25
        })

        await Promise.all([
            station.save(),
            stationFetchInfo.save(),
            stationValue.save()
        ]).catch(err => console.log(err.message))

        console.log("inserted new StationFetchInfo (station id: " + station._id + ")")
    }

    next()
}

export default fetchSensorCommunity