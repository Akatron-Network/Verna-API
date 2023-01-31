import express from 'express'
import { getDateString, getTimeString } from './libraries/misc.js'
import * as dotenv from 'dotenv'
import { registerAllRoutes } from './route_registerer.js'
import { User } from './models/user.js'
import { Globals } from './libraries/globals.js'
import { morganMiddleware } from './middlewares/morgan.middleware.js'
import { logger } from './libraries/logger.js'
dotenv.config()


const app = express()
app.use(morganMiddleware)

var server = app.listen(8000, function () {
  registerAllRoutes(app);
  logger.info('Server listening on: :8000')

})

process.on('uncaughtException', function (err) {
  logger.error('uncaughtException: ' + err.stack)
})

//* Tester admin debug token
//! dont forget to delete before production
Globals.auth_tokens['RT-Token_Admin'] = new User('admin', {admin: true})

