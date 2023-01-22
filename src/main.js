import express from 'express'
import { User } from './models/user.js'
import { getDateString, getTimeString } from './libraries/misc.js'

const app = express()

var server = app.listen(8000, function () {
  console.log('Server listening on: 127.0.0.1:8000')

})

process.on('uncaughtException', function (err) {
  console.error(getDateString() + ' ' + getTimeString() + ' uncaughtException:', err.message)
  console.error(err.stack)
})


async function test() {
  let new_user = await User.createUser({
    username: "TEST_USER",
    password: "12345678a"
  })
}

test()
