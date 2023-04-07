import { Response } from "../libraries/response.js";
import { Order, OrderItem } from "../models/order.js";
import { Route } from "./route.js";


export class Route_Order extends Route {
  constructor() {
    //* Register the route info
    super('/order', 'Order', 'Manage orders')

    //* Register methods and permissions
    this.setMethod('GET', this.get)
    this.setPermission('GET', { login: true, permission: "ORDER_VIEW" })
    this.setMethod('POST', this.post)
    this.setPermission('POST', { login: true, permission: "ORDER_EDIT" })
    this.setMethod('PUT', this.put)
    this.setPermission('PUT', { login: true, permission: "ORDER_EDIT" })
    this.setMethod('DELETE', this.del)
    this.setPermission('DELETE', { login: true, permission: "ORDER_EDIT" })
  }

  //* Show orders
  async get (res, user, body = {}) {
    if (body.id) {
      let order = await Order.get(parseInt(body.id))
      return Response.success(res, order, {Meta: Route.generateMeta(res.req)})
    }
    
    if (!body.query) body.query = {}
    if (typeof(body.query) === 'string') body.query = JSON.parse(body.query)

    if (body.skip) body.query.skip = parseInt(body.skip)
    if (body.take) body.query.take = parseInt(body.take)

    let orders = await Order.getMany(body.query)

    let meta = {
      total: await Order.count(body.query),
      showing: orders.length,
      skip: body.query.skip || 0,
      take: body.query.take || parseInt(process.env.QUERY_LIMIT),
      ...Route.generateMeta(res.req)
    }

    return Response.success(res, orders, {Meta: meta})
  }

  //* Create an Order
  async post (res, user, body) {
    if (!body) throw new Error('Body cannot be empty')

    body.registry_username = user.username

    let order = await Order.create(body)

    return Response.success(res, order, {Meta: Route.generateMeta(res.req)})
  }

  //* Update an Order
  async put (res, user, body) {
    if (!body || !body.id || !body.data) throw new Error('Body cannot be empty')

    let order = await Order.get(body.id)

    order = await order.update({
      ...body.data,
      update_username: user.username
    })

    return Response.success(res, order, {Meta: Route.generateMeta(res.req)})
  }

  //* Remove an Order
  async del (res, user, body) {
    if (!body || !body.id) throw new Error('Body cannot be empty')

    let order = await Order.get(body.id)
    let remresp = await order.remove()

    return Response.success(res, remresp, {Meta: Route.generateMeta(res.req)})
  }

}


export class Route_OrderItem extends Route {
  constructor() {
    //* Register the route info
    super('/orderitem', 'Order Item', 'Manage order items')

    //* Register methods and permissions
    this.setMethod('GET', this.get)
    this.setPermission('GET', { login: true, permission: "ORDER_VIEW" })
    this.setMethod('POST', this.post)
    this.setPermission('POST', { login: true, permission: "ORDER_EDIT" })
    this.setMethod('PUT', this.put)
    this.setPermission('PUT', { login: true, permission: "ORDER_EDIT" })
    this.setMethod('DELETE', this.del)
    this.setPermission('DELETE', { login: true, permission: "ORDER_EDIT" })
  }

  //* Show order items
  async get (res, user, body = {}) {
    if (body.id) {
      let orderitem = await OrderItem.get(parseInt(body.id))
      return Response.success(res, orderitem, {Meta: Route.generateMeta(res.req)})
    }
    
    if (!body.query) body.query = {}
    if (typeof(body.query) === 'string') body.query = JSON.parse(body.query)

    if (body.skip) body.query.skip = parseInt(body.skip)
    if (body.take) body.query.take = parseInt(body.take)

    let orderitems = await OrderItem.getMany(body.query)

    let meta = {
      total: await OrderItem.count(body.query),
      showing: orderitems.length,
      skip: body.query.skip || 0,
      take: body.query.take || parseInt(process.env.QUERY_LIMIT),
      ...Route.generateMeta(res.req)
    }

    return Response.success(res, orderitems, {Meta: meta})
  }

  //* Create an OrderItem
  async post (res, user, body) {
    if (!body) throw new Error('Body cannot be empty')

    body.registry_username = user.username

    let orderItem = await OrderItem.create(body)
    await (await orderItem.getOrder()).calculateFee()

    return Response.success(res, orderItem, {Meta: Route.generateMeta(res.req)})
  }

  //* Update an OrderItem
  async put (res, user, body) {
    if (!body || !body.id || !body.data) throw new Error('Body cannot be empty')

    let orderItem = await OrderItem.get(body.id)
    orderItem = await orderItem.update({...body.data})
    (await orderItem.getOrder()).calculateFee()

    return Response.success(res, orderItem, {Meta: Route.generateMeta(res.req)})
  }

  //* Remove an OrderItem
  async del (res, user, body) {
    if (!body || !body.id) throw new Error('Body cannot be empty')

    let orderItem = await OrderItem.get(body.id)
    let order = await orderItem.getOrder()
    let remresp = await orderItem.remove()
    await order.calculateFee()

    return Response.success(res, remresp, {Meta: Route.generateMeta(res.req)})
  }

}


export class Route_OrderTrack extends Route {
  constructor() {
    //* Register the route info
    super('/ordertrack', 'OrderTrack', 'Track orders from outside authentication')

    //* Register methods and permissions
    this.setMethod('GET', this.get)
  }

  async get (res, user, body = {}) {
    if (!body.token_key) throw new Error('Token key (token_key) not found')

    let order = await Order.getByToken(body.token_key)

    for (let i of order.details.items) {
      i.price = undefined
      i.tax_rate = undefined
      i.stock.buy_price = undefined
      i.stock.sell_price = undefined
    }

    order.details.total_fee = undefined
    order.details.current = {
      name: order.details.current.name,
      current_type: order.details.current.current_type
    }

    return Response.success(res, order)
  }
}
