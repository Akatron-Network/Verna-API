import { Response } from "../libraries/response.js";
import { Route } from "./route.js";
import { User } from "../models/user.js";
import { Globals } from "../libraries/globals.js";

//-- Get/Remove user token
export class Route_Login extends Route {
  constructor() {
    //* Register the route info
    super('/login', 'login', 'Get/Remove user token')

    //* Register methods and permissions
    this.setMethod('GET', this.get)
    this.setMethod('DELETE', this.del)
    this.setPermission('DELETE', {login: true})
  }

  //* Login
  async get(res, user, body) {
    let ip = res.req.ip.replaceAll('::ffff:', '')
    let usr = await User.login({...body, ip})
    
    return Response.success(res, usr)
  }

  //* Logout
  async del(res, user, body) {
    user.logout()
    return Response.success(res)
  }
}


//-- Create new user
export class Route_Register extends Route {
  constructor() {
    //* Register the route info
    super('/register', 'register', 'Create new user')

    //* Register methods and permissions
    this.setMethod('POST', this.post)
    this.setMethod('DELETE', this.delete)
    this.setPermission('DELETE', {login: true})
  }

  //* Register
  async post(res, user, body) {
    let register_ip = res.req.ip.replaceAll('::ffff:', '')
    let usr = await User.createUser({...body, register_ip})

    return Response.success(res, usr)
  }

  //* Delete user
  async delete(res, user, body) {
    let deluser = await user.removeUser()
    return Response.success(res, deluser)
  }

}
