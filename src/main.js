import express from 'express'
import { getDateString, getTimeString } from './libraries/misc.js'
import * as dotenv from 'dotenv'
import { Route_Login, Route_Register } from './routes/auth.js'
import { User } from './models/user.js'
import { registerAllRoutes } from './routes/route.js'
dotenv.config()

const app = express()

var server = app.listen(8000, function () {
  registerAllRoutes(app);
  console.log('Server listening on: 127.0.0.1:8000')

})

process.on('uncaughtException', function (err) {
  console.error(getDateString() + ' ' + getTimeString() + ' uncaughtException:', err.message)
  console.error(err.stack)
})



async function test() {
  // User.createUser({username: "Ranork", password: "12345678"})
}

test()
