import { Response } from "../libraries/response.js";
import { Stock } from "../models/stock.js";
import { Route } from "./route.js";
import * as dotenv from 'dotenv'

dotenv.config()


export class Route_Stock extends Route {
  constructor() {
    //* Register the route info
    super('/stock', 'Stock', 'Manage stocks')

    //* Register methods and permissions
    this.setMethod('GET', this.get)
    this.setPermission('GET', { login: true, permission: "STOCK_VIEW" })
    this.setMethod('POST', this.post)
    this.setPermission('POST', { login: true, permission: "STOCK_EDIT" })
    this.setMethod('PUT', this.put)
    this.setPermission('PUT', { login: true, permission: "STOCK_EDIT" })
    this.setMethod('DELETE', this.del)
    this.setPermission('DELETE', { login: true, permission: "STOCK_EDIT" })
  }
  
  //* Show single or multiple Stocks
  async get (res, user, body = {}) {
    if (body.id) {
      
      let stock = await Stock.get(parseInt(body.id))
      return Response.success(res, stock, {Meta: Route.generateMeta(res.req)})
    }

    if (!body.query) body.query = {}
    if (typeof(body.query) === 'string') body.query = JSON.parse(body.query)

    if (body.skip) body.query.skip = parseInt(body.skip)
    if (body.take) body.query.take = parseInt(body.take)

    let stocks = await Stock.getMany(body.query)

    let meta = {
      total: await Stock.count(body.query),
      showing: stocks.length,
      skip: body.query.skip || 0,
      take: body.query.take || parseInt(process.env.QUERY_LIMIT),
      ...Route.generateMeta(res.req)
    }

    return Response.success(res, stocks, {Meta: meta})
  }

  //* Create a new Stock
  async post (res, user, body) {
    if (!body) throw new Error('Body cannot be empty')

    body.registry_username = user.username

    let stock = await Stock.create(body)
    
    return Response.success(res, stock, {Meta: Route.generateMeta(res.req)})
  }

  //* Update a Stock
  async put (res, user, body) {
    if (!body || !body.id || !body.data) throw new Error('Body cannot be empty')

    let stock = await Stock.get(body.id)

    stock = await stock.update({
      ...body.data,
      update_username: user.username
    })
    
    return Response.success(res, stock, {Meta: Route.generateMeta(res.req)})
  }

  //* Remove a Stock
  async del (res, user, body) {
    if (!body || !body.id) throw new Error('Body cannot be empty')

    let stock = await Stock.get(body.id)
    let remresp = await stock.remove()

    return Response.success(res, remresp, {Meta: Route.generateMeta(res.req)})
  }


}
