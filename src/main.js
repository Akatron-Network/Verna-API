import express from 'express'
import { getDateString, getTimeString } from './libraries/misc.js'
import * as dotenv from 'dotenv'
import { registerAllRoutes } from './route_registerer.js'
import { Current } from './models/current.js'
import { User } from './models/user.js'
import { Globals } from './libraries/globals.js'
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

//* Tester admin debug token
//! dont forget to delete before production
Globals.auth_tokens['RT-Token_Admin'] = new User('admin', {admin: true})



//* async function to test
async function test() {
  
}
test()


