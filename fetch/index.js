import fetchSensorCommunity from './sensor.community'

export default function () {
    fetchSensorCommunity()
    setInterval(fetchSensorCommunity, 60000 * 30) // every 30 minutes
}