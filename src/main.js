import express from 'express'
import { getDateString, getTimeString } from './libraries/misc.js'
import * as dotenv from 'dotenv'
import { registerAllRoutes } from './route_registerer.js'
import { User } from './models/user.js'
import { Globals } from './libraries/globals.js'
import { morganMiddleware } from './middlewares/morgan.middleware.js'
import { logger } from './libraries/logger.js'
import cors from 'cors'
dotenv.config()

var host = process.env.APP_HOST
var port = process.env.APP_PORT

for (let i in process.argv) {
  if (process.argv[i] === '--host') host = process.argv[parseInt(i)+1]
  if (process.argv[i] === '--port') port = process.argv[parseInt(i)+1]
}

const app = express()
app.use(morganMiddleware)
app.use(cors())

var server = app.listen(parseInt(port), host, function () {
  registerAllRoutes(app);
  logger.info('Server listening on: ' + host + ':' + port)

})

process.on('uncaughtException', function (err) {
  logger.error('uncaughtException: ' + err.stack)
})

async function test() {

  let usr = await User.create('NEFTAT', {
    username: 'yahya',
    password: '12345678a',
    admin: true,
  })

  console.log(usr);

}

// test()


//* Tester admin debug token
//! dont forget to delete before production
Globals.auth_tokens['RT-Token_Admin'] = new User('AKATRON', 'admin', {admin: true})


