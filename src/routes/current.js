import { Response } from "../libraries/response.js";
import { Current } from "../models/current.js";
import { Route } from "./route.js";
import * as dotenv from 'dotenv'

dotenv.config()

export class Route_Current extends Route {
  constructor() {
    //* Register the route info
    super('/current', 'current', 'Manage currents')

    //* Register methods and permissions
    this.setMethod('GET', this.get)
    this.setPermission('GET', { login: true, permission: "CURRENT_VIEW" })
    this.setMethod('POST', this.post)
    this.setPermission('POST', { login: true, permission: "CURRENT_EDIT"})
  }

  //* Show single or multiple Currents
  async get(res, user, body) {
    if (body.id) {

      let meta = {
        url_path: res.req.url,
        method: res.req.method,
        user
      }

      let current = await Current.get(parseInt(body.id))
      return Response.success(res, current, {Meta: meta})
    }
    
    if (!body.query) body.query = {}
    if (typeof(body.query) === 'string') body.query = JSON.parse(body.query)
    let currents = await Current.getMany(body.query)

    let meta = {
      total: await Current.count(),
      showing: currents.length,
      skip: body.query.skip || 0,
      take: body.query.take || parseInt(process.env.QUERY_LIMIT),
      url_path: res.req.url,
      method: res.req.method,
      user
    }

    return Response.success(res, currents, {Meta: meta})
  }

  //* Create a new Current
  async post(res, user, body) {
    if (!body) throw new Error('Body cannot be empty')

    body.registry_date = new Date()
    body.registry_username = user.username

    let current = await Current.create(body)
    
    let meta = {
      url_path: res.req.url,
      method: res.req.method,
      user
    }

    return Response.success(res, current, {Meta: meta})
    
  }
}
