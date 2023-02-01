import express from 'express'
import { getDateString, getTimeString } from './libraries/misc.js'
import * as dotenv from 'dotenv'
import { registerAllRoutes } from './route_registerer.js'
import { User } from './models/user.js'
import { Globals } from './libraries/globals.js'
import { morganMiddleware } from './middlewares/morgan.middleware.js'
import { logger } from './libraries/logger.js'
import { Task } from './models/task.js'
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




async function test() {
  let task = {
    order_id: 31,
    assigned_username: "admin",
    task_steps: [
      {
        order: 1,
        name: "İlk İşlem",
        responsible_username: "admin",
        planned_finish_date: "2023-02-10T00:00:00Z"
      },
      {
        order: 2,
        name: "İkinci İşlem",
        responsible_username: "admin",
        planned_finish_date: "2023-02-10T00:00:00Z"
      }
    ]
  }

  console.log(Task.create(task));
}

test()
