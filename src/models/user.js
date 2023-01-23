import { jsonKeyControl } from '../libraries/misc.js'
import { PrismaClient } from '@prisma/client'
import { user_register_schema, user_login_schema } from '../schemas/user.js'
import { validate } from '../libraries/validation.js';
import { getDateString, getTimeString } from '../libraries/misc.js';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv'

const prisma = new PrismaClient()
dotenv.config()

export class User {

  constructor(username, user_details) {
    this.username = username.toLowerCase()
    if (user_details) this.user_details = user_details
  }

  async initDetails() {
    this.user_details = await prisma.User.findUnique(
      { where: { username: this.username } }
    )
    if (this.user_details === null) throw new Error('user ' + this.username + ' not found!')
  }

  getDetails() { 
    if (this.user_details) return this.user_details
    else throw new Error('User details not initialized. first use initDetails() (async)')
  }

  generateToken() {
    
  }
  
  async removeUser() {
    if (!this.user_details) await this.initDetails()
    return await prisma.User.delete({
      where: { username: this.username }
    })
  }


  static async createUser(user_details) {
    validate(user_details, user_register_schema)

    user_details.displayname = user_details.username
    user_details.username = user_details.username.toLowerCase()
    user_details.password = bcrypt.hashSync(user_details.password, parseInt(process.env.HASH_SALT_ROUNDS))

    let control_resp = await prisma.User.findUnique(
      { where: { username: user_details.username } }
    )
    if (control_resp !== null) throw new Error('User already exists')

    await prisma.User.create({data: user_details})
    
    return new User(user_details.username, user_details)
  }

  static async login(login_details) {
    validate(login_details, user_login_schema)

    let user_details = await prisma.User.findUnique(
      { where: { username: login_details.username } }
    )
    if (user_details === null) throw new Error('User not found')
    
    let is_password_correct = bcrypt.compareSync(login_details.password, user_details.password)
    if (!is_password_correct) throw new Error('Password is not correct')

    return new User(user_details.username, user_details)
  }
  

}
