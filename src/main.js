import express from 'express'
import { getDateString, getTimeString } from './libraries/misc.js'
import * as dotenv from 'dotenv'
import { registerAllRoutes } from './route_registerer.js'
import { User } from './models/user.js'
import { Globals } from './libraries/globals.js'
import { morganMiddleware } from './middlewares/morgan.middleware.js'
import { logger } from './libraries/logger.js'
import cors from 'cors'
import { Task } from './models/task.js'
dotenv.config()


const app = express()
app.use(morganMiddleware)
app.use(cors())

var server = app.listen(parseInt(process.env.APP_PORT), function () {
  registerAllRoutes(app);
  logger.info('Server listening on: :' + parseInt(process.env.APP_PORT))

})

process.on('uncaughtException', function (err) {
  logger.error('uncaughtException: ' + err.stack)
})

//* Tester admin debug token
//! dont forget to delete before production
Globals.auth_tokens['RT-Token_Admin'] = new User('admin', {admin: true})




async function test() {
  let task_details = {
    order_id: 31,
    description: "Test Görevi",
    assigned_username: "admin",
    task_steps: [
      {
        row: 1,
        name: "İlk İşlem",
        responsible_username: "admin",
        planned_finish_date: "2023-02-10T00:00:00Z"
      },
      {
        row: 2,
        name: "İkinci İşlem",
        responsible_username: "admin",
        planned_finish_date: "2023-02-10T00:00:00Z"
      }
    ]
  }

  // console.log(await Task.create(task_details));

  // let task = await Task.get(12)

  // await task.update({
  //   description: "Test Görevi Güncelleme"
  // })

  // console.log(task)

  // await task.complateStep({complate_description: "Tamam"})

  // console.log(task);
}

test()
