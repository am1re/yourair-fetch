import express from 'express'
import { connect } from "mongoose"

import intizializeFetching from './fetch'
import indexRouter from './routes/index'

connect("mongodb://localhost:27017/yourairdb1", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        const app = express()
        app.use('/', indexRouter)
        app.listen(5001, () => {
            console.log("Fetch service started! Health chcek localhost:5001/health")
        })

        intizializeFetching()
    })
