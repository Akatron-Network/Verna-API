import { PrismaClient } from '@prisma/client'
import { user_register_schema, user_login_schema } from '../schemas/user.js'
import { validate } from '../libraries/validation.js';
import { randStr } from '../libraries/misc.js';
import { Globals } from '../libraries/globals.js';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv'

const prisma = new PrismaClient()
dotenv.config()

export class User {

  //* Manual construction
  //! not effects the database, use createUser or login
  constructor(username, user_details) {
    this.username = username.toLowerCase()
    if (user_details) this.user_details = user_details
  }

  //* Initiate Details
  async initDetails() {
    this.user_details = await prisma.User.findUnique(
      { where: { username: this.username } }
    )
    if (this.user_details === null) throw new Error('user ' + this.username + ' not found!')
  }

  //* Get Details of user
  //r Returns this.user_details
  getDetails() { 
    if (this.user_details) return this.user_details
    else throw new Error('User details not initialized. first use initDetails() (async)')
  }

  //* Logout from user
  logout() {
    if (!this.token) throw new Error('Not logged in')
    delete Globals.auth_tokens[this.token]
  }

  //* Generate new token
  async generateToken() {
    if (!this.user_details) await this.initDetails()
    this.token = 'RT-Token_' + randStr(parseInt(process.env.TOKEN_LENGTH))

    //* Delete the token if user logged in already
    for (let t in Globals.auth_tokens) {                                //? Loop the auth tokens
      if (Globals.auth_tokens[t].username === this.username) {          //. control the username
        delete Globals.auth_tokens[t]                                   //. delete the token record
        break;
      }
    }

    this.token_expiration = Date.now() + parseInt(process.env.TOKEN_TIMEOUT)
    Globals.auth_tokens[this.token] = this;

  }
  
  //* Remove the user from database
  async removeUser() {
    if (!this.user_details) await this.initDetails()
    if (this.token) delete Globals.auth_tokens[this.token]
    return await prisma.User.delete({ where: { username: this.username } })
  }


  //* Create new user
  //r Returns User
  static async createUser(user_details) {
    validate(user_details, user_register_schema)

    user_details.displayname = user_details.username
    user_details.username = user_details.username.toLowerCase()
    user_details.password = await bcrypt.hash(user_details.password, parseInt(process.env.HASH_SALT_ROUNDS))

    let control_resp = await prisma.User.findUnique(
      { where: { username: user_details.username } }
    )
    if (control_resp !== null) throw new Error('User already exists')

    await prisma.User.create({data: user_details})

    let user = new User(user_details.username, user_details)
    await user.generateToken()

    return user
  }

  //* Login to a user
  //r Returns User
  static async login(login_details) {
    validate(login_details, user_login_schema)

    let user_details = await prisma.User.findUnique(
      { where: { username: login_details.username } }
    )
    if (user_details === null) throw new Error('User not found')
    
    let is_password_correct = await bcrypt.compare(login_details.password, user_details.password)
    if (!is_password_correct) throw new Error('Password is not correct')

    let user = new User(user_details.username, user_details)
    await user.generateToken()

    return user
  }

  //* Login using a token
  //r Return User
  static tokenLogin(token) {
    if (!Object.keys(Globals.auth_tokens).includes(token)) throw new Error('Incorrect token')

    let exp_time = Globals.auth_tokens[token].token_expiration
    if (exp_time < Date.now()) {
      delete Globals.auth_tokens[token]
      throw new Error('Token is expired')
    }

    return Globals.auth_tokens[token]
  }
  

}
