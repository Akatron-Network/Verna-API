import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { validate } from '../libraries/validation.js'
import { 
  orderItem_create_schema,
  orderItem_get_schema,
  orderItem_update_schema,
  order_create_schema
} from '../schemas/order.js'

const prisma = new PrismaClient()
dotenv.config()

export class Order {

  //* Manual construction
  //! not effects the database, use create or get
  constructor(id, details, items) {
    this.id = id
    if (details) this.details = details
    if (items) this.items = items
  }

  //* Initiate details and items
  async init() {
    await this.initDetails()
    await this.initItems()
  }

  //* Initiate details
  async initDetails() {
    this.details = await prisma.Order.findUnique({
      where: { id: this.id }
    })
    if (this.details === null) throw new Error('Order ' + this.id + ' not found')
  }

  //* Initiate items
  async initItems() {
    this.items = await OrderItem.getMany({
      where: { order_id: this.id }
    }, false)
  }

  async remove() {
    if (!this.details) await this.init()
    return await prisma.Order.delete({ where: { id: this.id } })
  }

  //-- Static Construct Methods

  static async create(new_order) {
    validate(new_order, order_create_schema)

    if (new_order.id) {
      let control_data = await prisma.Order.findUnique({ where: { id: this.id } })
      if (control_data !== null) throw new Error('Order id is not empty')
    }

    new_order.registry_date = new Date()

    let cresp = await prisma.Order.create({data: details})
    let order = new Order(cresp.id, cresp)
    order.items = []

    try {
      for (let item of new_order.items) {
        let ordItem = await OrderItem.create({...item, order_id: order.id})
        order.items.push(ordItem)
      }
    }
    catch (e) {
      await order.remove()
      throw new Error('Order creation failed. \n' + e.message)
    }

    return order
  }

}




export class OrderItem {

  //* Manual construction
  //! not effects the database, use create or get
  constructor(id, details) {
    this.id = id
    if (details) this.details = details
  }

  //* Initiate Details
  async initDetails() {
    this.details = await prisma.OrderItem.findUnique({
      where: { id: this.id }
    })
    if (this.details === null) throw new Error('orderItem ' + this.id + ' not found')
  }

  //* Get Details of OrderItem
  //r Returns this.details
  getDetails() {
    if (this.details) return this.details
    else throw new Error('OrderItem details not initialized. first use initDetails() (async)')
  }

  //* Update the OrderItem
  //r Returns updated OrderItem object
  async update(update_data) {
    validate(update_data, orderItem_update_schema)

    update_data.update_date = new Date()

    let upres = await prisma.OrderItem.update({
      where: { id: this.id },
      data: update_data
    })

    this.details = upres
    return this
  }

  //* Remove the OrderItem
  //r Returns prisma response
  async remove() {
    if (!this.details) await this.initDetails()
    return await prisma.OrderItem.delete({ where: { id: this.id } })
  }

  //-- Static Construct Methods

  //* Get a OrderItem by Id
  //r Returns OrderItem object
  static async get(id) {
    validate(id, orderItem_get_schema)

    let orderItem = new OrderItem(id)
    await orderItem.initDetails()

    return orderItem
  }

  //* Create new OrderItem with details
  //r Returns OrderItem object
  static async create(details) {
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
  static async getMany(query = {}, pagination = true) {
    if (pagination) {
      if (!query.skip) query.skip = 0
      if (!query.take) query.take = parseInt(process.env.QUERY_LIMIT)
    }

    let resps = await prisma.OrderItem.findMany(query)
    return resps.map(r => new OrderItem(r.id, r))
  }

}
