import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { validate } from '../libraries/validation.js'
import { 
  orderItem_create_schema,
  orderItem_get_schema,
  orderItem_update_schema,
  order_create_schema,
  order_get_schema,
  order_update_schema
} from '../schemas/order.schema.js'

const prisma = new PrismaClient()
dotenv.config()


export class Order {

  //* Manual construction
  //! not effects the database, use create or get
  constructor (id, details, items) {
    this.id = id
    if (details) this.details = details
    if (items) this.items = items
  }

  //* Initiate details and items
  async init () {
    await this.initDetails()
    await this.initItems()
  }

  //* Initiate details
  async initDetails () {
    this.details = await prisma.Order.findUnique({
      where: { id: this.id }
    })
    if (this.details === null) throw new Error('Order ' + this.id + ' not found')
  }

  //* Initiate items
  async initItems () {
    this.items = await OrderItem.getMany({
      where: { order_id: this.id }
    }, false)
  }

  //* Remove the Order
  //r Returns prisma response
  async remove () {
    if (!this.details) await this.init()
    return await prisma.Order.delete({ where: { id: this.id } })
  }

  //* Update the Order
  //r Returns updated Order object
  async update(update_data) {
    validate(update_data, order_update_schema)

    let old_details = {...this.details}
    let old_items = [...this.items]
    let old_item_ids = old_items.map(i => i.id)

    update_data.update_date = new Date()

    let upres = await prisma.Order.update({
      where: { id: this.id },
      data: {...update_data, items: undefined}
    })

    this.details = upres

    if (!update_data.items) return this

    //* control removed items
    for (let oitem of old_items) {
      if (!update_data.items.map(i => i.id).includes(oitem.id)) await oitem.remove()
    }

    //* update and create items
    for (let item of update_data.items) {
      if (item.id && old_item_ids.includes(item.id)) {
        let itemid = item.id
        delete item['id']
        delete item['registry_date']
        delete item['registry_username']
        delete item['update_date']
        delete item['update_username']
        await old_items[old_item_ids.indexOf(itemid)].update({...item})
      }
      else await OrderItem.create({
        ...item, 
        order_id: this.id,
        registry_username: this.details.registry_username
      })
    }

    await this.initItems()
    await this.calculateFee()
    return this
  }

  //* Calculate the total_fee
  //r Returns updated Order object
  async calculateFee() {
    if (!this.items || !this.details) await this.init()

    let total_fee = this.items.reduce( function (accVar, currVal) {
      let tax_rate = ((currVal.details.tax_rate !== null ? currVal.details.tax_rate : 0) + 1)
      return accVar + (currVal.details.amount * currVal.details.price * tax_rate)
    }, 0)

    await this.update({total_fee})
    return this
  }

  //-- Static Construct Methods

  //* Create new Order with details and items
  //r Returns Order object
  static async create (new_order) {
    validate(new_order, order_create_schema)

    if (new_order.id) {
      let control_data = await prisma.Order.findUnique({ where: { id: this.id } })
      if (control_data !== null) throw new Error('Order id is not empty')
    }

    new_order.registry_date = new Date()

    let cresp = await prisma.Order.create({data: {...new_order, items: undefined}})
    let order = new Order(cresp.id, cresp)
    order.items = []

    try {
      for (let item of new_order.items) {
        let ordItem = await OrderItem.create({
          ...item, 
          order_id: order.id, 
          registry_username: order.details.registry_username
        })
        order.items.push(ordItem)
      }
    }
    catch (e) {
      await order.remove()
      throw new Error('Order creation failed. \n' + e.message)
    }

    await order.calculateFee()

    return order
  }

  //* Get a Order by Id
  //r Returns Order object
  static async get (id) {
    validate(id, order_get_schema)

    let order = new Order(id)
    await order.init()
    await order.calculateFee()
    return order
  }

  //* Get Order with query
  //r Returns array of Order objects
  static async getMany (query = {}, pagination = true) {
    if (pagination) {
      if (!query.skip) query.skip = 0
      if (!query.take) query.take = parseInt(process.env.QUERY_LIMIT)
    }

    if (!query.select || !query.include) query.include = {items: true}

    let resps = await prisma.Order.findMany(query)
    return resps.map(r => new Order(r.id, r))
  }
  
  //-- Static util methods

  //* Get count of results
  //r Returns integer
  static async count(extra_query = {}) {
    delete extra_query['include']
    let resp = await prisma.Order.aggregate({
      _count: true,
      ...extra_query
    })
    if (resp === null) return 0
    return resp['_count']
  }

}




export class OrderItem {

  //* Manual construction
  //! not effects the database, use create or get
  constructor (id, details) {
    this.id = id
    if (details) this.details = details
  }

  //* Initiate Details
  async initDetails () {
    this.details = await prisma.OrderItem.findUnique({
      where: { id: this.id }
    })
    if (this.details === null) throw new Error('orderItem ' + this.id + ' not found')
  }

  //* Get Details of OrderItem
  //r Returns this.details
  getDetails () {
    if (this.details) return this.details
    else throw new Error('OrderItem details not initialized. first use initDetails() (async)')
  }

  //* Update the OrderItem
  //r Returns updated OrderItem object
  async update (update_data) {
    validate(update_data, orderItem_update_schema)

    let upres = await prisma.OrderItem.update({
      where: { id: this.id },
      data: update_data
    })

    this.details = upres
    return this
  }

  //* Remove the OrderItem
  //r Returns prisma response
  async remove () {
    if (!this.details) await this.initDetails()
    return await prisma.OrderItem.delete({ where: { id: this.id } })
  }

  //* Get the Order from item
  //r Returns Order object
  async getOrder() {
    if (!this.details) await this.initDetails()
    return Order.get(this.details.order_id)
  }

  //-- Static Construct Methods

  //* Get a OrderItem by Id
  //r Returns OrderItem object
  static async get (id) {
    validate(id, orderItem_get_schema)

    let orderItem = new OrderItem(id)
    await orderItem.initDetails()

    return orderItem
  }

  //* Create new OrderItem with details
  //r Returns OrderItem object
  static async create (details) {
    validate(details, orderItem_create_schema)

    if (details.id) {
      let control_data = await prisma.OrderItem.findUnique({
        where: { id: details.id }
      })
      if (control_data !== null) throw new Error('OrderItem id is not empty')
    }

    details.registry_date = new Date()

    let cresp = await prisma.OrderItem.create({data: details})
    return new OrderItem(cresp.id, cresp)
  }

  //* Get OrderItems with query
  //r Returns array of OrderItem objects
  static async getMany (query = {}, pagination = true) {
    if (pagination) {
      if (!query.skip) query.skip = 0
      if (!query.take) query.take = parseInt(process.env.QUERY_LIMIT)
    }

    let resps = await prisma.OrderItem.findMany(query)
    return resps.map(r => new OrderItem(r.id, r))
  }

  //-- Static util methods

  //* Get count of results
  //r Returns integer
  static async count(extra_query = {}) {
    delete extra_query['include']
    let resp = await prisma.OrderItem.aggregate({
      _count: true,
      ...extra_query
    })
    if (resp === null) return 0
    return resp['_count']
  }

}
