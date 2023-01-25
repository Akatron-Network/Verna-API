import express from 'express'
import { getDateString, getTimeString } from './libraries/misc.js'
import * as dotenv from 'dotenv'
import { registerAllRoutes } from './route_registerer.js'
import { Current } from './models/current.js'
import { User } from './models/user.js'
dotenv.config()


const app = express()

var server = app.listen(8000, function () {
  registerAllRoutes(app);
  console.log('Server listening on: 127.0.0.1:8000')

})

process.on('uncaughtException', function (err) {
  console.error(getDateString() + ' ' + getTimeString() + ' uncaughtException')
  console.error(err.stack)
})



async function test() {
  // await User.create({username: "Admin", password: "12345678"})
  // let current = await Current.get(1)
  // console.log(await current.update({name: "TESTTESTZ"}))
  // console.log(await Current.count())
}

test()


