import express from 'express'
import { getDateString, getTimeString } from './libraries/misc.js'
import * as dotenv from 'dotenv'
import { Route_Login } from './routes/auth.js'
dotenv.config()

const app = express()

var server = app.listen(8000, function () {
  (new Route_Login()).registerRoute(app);
  console.log('Server listening on: 127.0.0.1:8000')

})

process.on('uncaughtException', function (err) {
  console.error(getDateString() + ' ' + getTimeString() + ' uncaughtException:', err.message)
  console.error(err.stack)
})



async function test() {
  
}

test()
