import { User } from "../models/user.js";
import { Route } from "./route.js";
import { Response } from "../libraries/response.js";


export class Route_User extends Route {
  constructor() {
    //* Register the route info
    super('/user', 'User', 'Manage users')
    
    //* Register methods and permissions
    this.setMethod('GET', this.get)
    this.setPermission('GET', { login: true, permission: 'USER_VIEW' })
    this.setMethod('POST', this.post)
    this.setPermission('POST', { login: true, permission: 'USER_EDIT' })
    this.setMethod('PUT', this.put)
    this.setPermission('PUT', { login: true, permission: 'USER_EDIT' })
    this.setMethod('DELETE', this.del)
    this.setPermission('DELETE', { login: true, permission: 'USER_EDIT' })
  }

  //* Show single or multiple Users
  async get (res, user, body) {
    if (body.username) {
      
      let usr = await User.get(user.user_details.company_code, body.username)
      return Response.success(res, usr, {Meta: Route.generateMeta(res.req)})
    }

    if (!body.query) body.query = {}
    if (typeof(body.query) === 'string') body.query = JSON.parse(body.query)

    if (body.skip) body.query.skip = parseInt(body.skip)
    if (body.take) body.query.take = parseInt(body.take)

    let users = await User.getMany(user.user_details.company_code, body.query)

    let meta = {
      total: await User.count(user.user_details.company_code, body.query),
      showing: users.length,
      skip: body.query.skip || 0,
      take: body.query.take || parseInt(process.env.QUERY_LIMIT),
      ...Route.generateMeta(res.req)
    }

    return Response.success(res, users, {Meta: meta})
  }
  
  //* Create a new User
  async post (res, user, body) {
    if (!body) throw new Error('Body cannot be empty')

    body.register_ip = res.req.ip.replace(/::ffff:/, '')

    let usr = await User.create(user.user_details.company_code, body)
    
    return Response.success(res, usr, {Meta: Route.generateMeta(res.req)})
  }

  //* Update an User
  async put (res, user, body) {
    if (!body || !body.username || !body.data) throw new Error('Body cannot be empty')

    let usr = await User.get(user.user_details.company_code, body.username)
    usr = await usr.update({...body.data})
    
    return Response.success(res, usr, {Meta: Route.generateMeta(res.req)})
  }

  //* Delete an User
  async del (res, user, body) {
    if (!body || !body.username) throw new Error('Body cannot be empty')

    let usr = await User.get(user.user_details.company_code, body.username)
    let remresp = await usr.removeUser()

    return Response.success(res, remresp, {Meta: Route.generateMeta(res.req)})
  }

}
