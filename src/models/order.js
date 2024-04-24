import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { validate } from '../libraries/validation.js'
import { randStr } from '../libraries/misc.js';
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
  constructor (company_code, id, details, items) {
    this.id = id
    this.company_code = company_code
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
    if (this.details === null || this.company_code !== this.details.company_code) throw new Error('Order ' + this.id + ' not found')
  }

  //* Initiate items
  async initItems () {
    this.items = await OrderItem.getMany(this.company_code, {
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

    let upres = this.details

    try {
      upres = await prisma.Order.update({
        where: { id: this.id },
        data: {
          ...update_data, 
          items: undefined,
          debt_current_act: {
            update: {
              balance: update_data.total_fee
            }
          }
        }
      })
    }
    catch (e) {
      try {
        upres = await prisma.Order.update({
          where: { id: this.id },
          data: {
            ...update_data, 
            items: undefined
          }
        })
      }
      catch (e) {
        console.error(e);
      }
    }

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
        delete item['company_code']
        await old_items[old_item_ids.indexOf(itemid)].update({...item})
      }
      else await OrderItem.create(this.company_code, {
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
  static async create (company_code, new_order) {
    validate(new_order, order_create_schema)

    let token_key = "RT-Order-" + randStr(parseInt(process.env.ORDER_TOKEN_LENGTH), false)

    let token_control_data = await prisma.order.findUnique({ where: { token_key }})
    while (token_control_data !== null) {
      token_key = "RT-Order_" + randStr(parseInt(process.env.TOKEN_LENGTH))
      token_control_data = await prisma.order.findUnique({ where: { token_key }})
    }

    let current_control_data = await prisma.current.findFirstOrThrow({ where: { id: new_order.current_id, company_code}})
    if (current_control_data === null) throw new Error('Current not found')

    new_order.registry_date = new Date()

    let cresp = await prisma.Order.create({
      data: {
        ...new_order,
        token_key,
        items: undefined,
        company_code,
        debt_current_act: {
          create: {
            current_id: new_order.current_id,
            date: new Date(),
            expiry_date: new Date(),
            description: "Sipariş",
            balance: new_order.total_fee,
            registry_date: new Date(),
            registry_username: new_order.registry_username,
            company_code,
          }
        }
      },
      include: {debt_current_act: true}
    })
    let order = new Order(company_code, cresp.id, cresp)
    order.items = []

    try {
      for (let item of new_order.items) {
        let ordItem = await OrderItem.create(company_code, {
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
  static async get (company_code, id) {
    validate(id, order_get_schema)

    let order = new Order(company_code, id)
    await order.init()
    await order.calculateFee()
    return order
  }

  //* Get an Order by Token Key
  static async getByToken (token_key) {
    let order_data = await prisma.Order.findUnique({ 
      where: { token_key }, 
      include: {items: { include: {stock: true} }, task: true, current:true}
    })
    return new Order(order_data.id, order_data)
  }

  //* Get Order with query
  //r Returns array of Order objects
  static async getMany (company_code, query = {}, pagination = true) {
    if (pagination) {
      if (!query.skip) query.skip = 0
      if (!query.take) query.take = parseInt(process.env.QUERY_LIMIT)
    }

    if (!query.select && !query.include) query.include = {items: true, credit_current_act: true, debt_current_act: true}

    if (!query.where) query.where = { company_code }
    else query.where.company_code = company_code

    let resps = await prisma.Order.findMany(query)
    return resps.map(r => new Order(company_code, r.id, r))
  }
  
  //-- Static util methods

  //* Get count of results
  //r Returns integer
  static async count(company_code, extra_query = {}) {
    if (!extra_query.where) extra_query.where = { company_code }
    else extra_query.where.company_code = company_code
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
  constructor (company_code, id, details) {
    this.id = id
    this.company_code = company_code
    if (details) this.details = details
  }

  //* Initiate Details
  async initDetails () {
    this.details = await prisma.OrderItem.findUnique({
      where: { id: this.id }
    })
    if (this.details === null || this.company_code !== this.details.company_code) throw new Error('orderItem ' + this.id + ' not found')
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
    return Order.get(this.company_code, this.details.order_id)
  }

  //-- Static Construct Methods

  //* Get a OrderItem by Id
  //r Returns OrderItem object
  static async get (company_code, id) {
    validate(id, orderItem_get_schema)

    let orderItem = new OrderItem(company_code, id)
    await orderItem.initDetails()

    return orderItem
  }

  //* Create new OrderItem with details
  //r Returns OrderItem object
  static async create (company_code, details) {
    validate(details, orderItem_create_schema)

    details.registry_date = new Date()

    let cresp = await prisma.OrderItem.create({data: {...details, company_code}})
    return new OrderItem(company_code, cresp.id, cresp)
  }

  //* Get OrderItems with query
  //r Returns array of OrderItem objects
  static async getMany (company_code, query = {}, pagination = true) {
    if (pagination) {
      if (!query.skip) query.skip = 0
      if (!query.take) query.take = parseInt(process.env.QUERY_LIMIT)
    }

    if (!query.where) query.where = { company_code }
    else query.where.company_code = company_code

    let resps = await prisma.OrderItem.findMany(query)
    return resps.map(r => new OrderItem(company_code, r.id, r))
  }

  //-- Static util methods

  //* Get count of results
  //r Returns integer
  static async count(company_code, extra_query = {}) {
    if (!extra_query.where) extra_query.where = { company_code }
    else extra_query.where.company_code = company_code
    delete extra_query['include']

    let resp = await prisma.OrderItem.aggregate({
      _count: true,
      ...extra_query
    })
    if (resp === null) return 0
    return resp['_count']
  }

}
