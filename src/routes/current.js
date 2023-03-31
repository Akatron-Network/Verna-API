import { Response } from "../libraries/response.js";
import { Current, CurrentActivity } from "../models/current.js";
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
    this.setPermission('POST', { login: true, permission: "CURRENT_EDIT" })
    this.setMethod('PUT', this.put)
    this.setPermission('PUT', { login: true, permission: "CURRENT_EDIT" })
    this.setMethod('DELETE', this.del)
    this.setPermission('DELETE', { login: true, permission: "CURRENT_EDIT" })
  }

  //* Show single or multiple Currents
  async get (res, user, body = {}) {
    if (body.id) {
      let current = await Current.get(parseInt(body.id))
      return Response.success(res, current, {Meta: Route.generateMeta(res.req)})
    }
    
    if (!body.query) body.query = {}
    if (typeof(body.query) === 'string') body.query = JSON.parse(body.query)

    if (body.skip) body.query.skip = parseInt(body.skip)
    if (body.take) body.query.take = parseInt(body.take)

    let currents = await Current.getMany(body.query)

    let meta = {
      total: await Current.count(body.query),
      showing: currents.length,
      skip: body.query.skip || 0,
      take: body.query.take || parseInt(process.env.QUERY_LIMIT),
      ...Route.generateMeta(res.req)
    }

    return Response.success(res, currents, {Meta: meta})
  }

  //* Create a new Current
  async post (res, user, body) {
    if (!body) throw new Error('Body cannot be empty')

    body.registry_username = user.username

    let current = await Current.create(body)

    return Response.success(res, current, {Meta: Route.generateMeta(res.req)})
  }

  //* Update a current
  async put (res, user, body) {
    if (!body || !body.id || !body.data) throw new Error('Body cannot be empty')

    let current = await Current.get(body.id)

    current = await current.update({
      ...body.data,
      update_username: user.username
    })

    return Response.success(res, current, {Meta: Route.generateMeta(res.req)})
  }

  //* Remove a current
  async del (res, user, body) {
    if (!body || !body.id) throw new Error('Body cannot be empty')

    let current = await Current.get(body.id)
    let remresp = await current.remove()

    return Response.success(res, remresp, {Meta: Route.generateMeta(res.req)})
  }

}



export class Route_CurrentActivity extends Route {
  constructor() {
    //* Register the route info
    super('/current_act', 'Current_Activity', 'Manage current activities')

    //* Register methods and permissions
    this.setMethod('GET', this.get)
    this.setPermission('GET', {login: true, permission: "CURRENT_ACT_VIEW"})
    this.setMethod('POST', this.post)
    this.setPermission('POST', {login: true, permission: "CURRENT_ACT_EDIT"})
    this.setMethod('PUT', this.put)
    this.setPermission('PUT', {login: true, permission: "CURRENT_ACT_EDIT"})
    this.setMethod('DELETE', this.del)
    this.setPermission('DELETE', {login: true, permission: "CURRENT_ACT_EDIT"})
  }
  
  //* Show single or multiple CurrentActs
  async get (res, user, body = {}) {
    if (body.id) {
      let current_act = await CurrentActivity.get(parseInt(body.id))
      return Response.success(res, current_act, {Meta: Route.generateMeta(res.req)})
    }

    if (body.current_id) {
      let q = {
        where: {current_id: parseInt(body.current_id)},
        skip: parseInt(body.skip) || 0,
        take: parseInt(body.take) || parseInt(process.env.QUERY_LIMIT),
      }
      let current_acts = await CurrentActivity.getMany(q)

      let meta = {
        total: await CurrentActivity.count(q),
        showing: current_acts.length,
        skip: q.skip,
        take: q.take,
        url_path: res.req.url,
        method: res.req.method,
        user
      }
  
      return Response.success(res, current_acts, {Meta: meta})
    }
    
    if (!body.query) body.query = {}
    if (typeof(body.query) === 'string') body.query = JSON.parse(body.query)

    if (body.skip) body.query.skip = parseInt(body.skip)
    if (body.take) body.query.take = parseInt(body.take)

    let current_acts = await CurrentActivity.getMany(body.query)

    let meta = {
      total: await CurrentActivity.count(body.query),
      showing: current_acts.length,
      skip: body.query.skip || 0,
      take: body.query.take || parseInt(process.env.QUERY_LIMIT),
      url_path: res.req.url,
      method: res.req.method,
      user
    }

    return Response.success(res, current_acts, {Meta: meta})
  }

  //* Create a new CurrentAct
  async post (res, user, body) {
    if (!body) throw new Error('Body cannot be empty')

    body.registry_username = user.username
    
    let current = await CurrentActivity.create(body)

    return Response.success(res, current, {Meta: Route.generateMeta(res.req)})
  }
  
  //* Update a CurrentAct
  async put (res, user, body) {
    if (!body || !body.id || !body.data) throw new Error('Body cannot be empty')

    let current = await CurrentActivity.get(body.id)

    current = await current.update({
      ...body.data,
      update_username: user.username
    })
    
    return Response.success(res, current, {Meta: Route.generateMeta(res.req)})
  }

  //* Remove a CurrentAct
  async del (res, user, body) {
    if (!body || !body.id) throw new Error('Body cannot be empty')

    let current = await CurrentActivity.get(body.id)
    let remresp = await current.remove()

    return Response.success(res, remresp, {Meta: Route.generateMeta(res.req)})
  }
}
