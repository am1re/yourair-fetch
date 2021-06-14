import express from 'express'
import { connect } from "mongoose"

import intizializeFetching from './fetch'
import indexRouter from './routes/index'

connect("mongodb+srv://dbUser:Lw0wwRiysffGOams@cluster0.vxgoq.mongodb.net/yourairdb1?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        const app = express()
        app.use('/', indexRouter)
        app.listen(process.env.PORT || 5001, () => {
            console.log("Fetch service started! Health chcek localhost:5001/health")
        })

        intizializeFetching()
    })
