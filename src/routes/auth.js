import { Route } from "./route.js";
import { Response } from "../libraries/response.js";
import { User } from "../models/user.js";


/* //-- Get/Remove user token
  This class is used to handle the login and logout for a user. It extends the Route class, 
  which allows it to register route info and methods with permissions. The get() method handles 
  logging in a user by taking in the request, user, and body parameters. It then uses the User 
  class to log in the user with their ip address and body information. The del() method handles 
  logging out a user by using the User class's logout() method.
*/
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
  async get (res, user, body) {
    let ip = res.req.ip.replace(/::ffff:/, '')
    let usr = await User.login({...body, ip})
    
    return Response.success(res, usr)
  }

  //* Logout
  async del (res, user, body) {
    user.logout()
    return Response.success(res)
  }
}


/* //-- Create new user
  This class is used to register a route for the application. It extends the Route class 
  and sets up a route for '/register' with the title 'Create new user'. It also sets up 
  two methods, POST and DELETE, and sets the permission for DELETE to require a login. 
  The post method creates a new user with the given body and register_ip, while the delete 
  method removes an existing user.
*/
export class Route_Register extends Route {
  constructor() {
    //* Register the route info
    super('/register', 'register', 'Create new user')

    //* Register methods and permissions
    this.setMethod('GET', this.get)
    this.setPermission('GET', {login: true})
    this.setMethod('POST', this.post)
    this.setMethod('DELETE', this.delete)
    this.setPermission('DELETE', {login: true})
  }
  
  //* Show profile
  async get (res, user, body) {
    return Response.success(res, user)
  }

  //* Register
  async post (res, user, body) {
    let register_ip = res.req.ip.replace(/::ffff:/, '')
    let usr = await User.create({...body, register_ip})

    return Response.success(res, usr)
  }

  //* Delete user
  async delete (res, user, body) {
    let deluser = await user.removeUser()
    return Response.success(res, deluser)
  }

}



