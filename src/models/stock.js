import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { validate } from '../libraries/validation.js'
import { 
  stock_create_schema, 
  stock_get_schema, 
  stock_update_schema 
} from '../schemas/stock.schema.js'

const prisma = new PrismaClient()
dotenv.config()


export class Stock {

  //* Manual construction
  //! not effects the database, use create or get
  constructor(id, details) {
    this.id = id
    if (details) this.details = details
  }

  //* Initiate Details
  async initDetails() {
    this.details = await prisma.Stock.findUnique({
      where: { id: this.id }
    })
    if (this.details === null) throw new Error('stock ' + this.id + ' not found')  //r if cant get details give error
  }

  //* Get Details of Stock
  //r Returns this.details
  getDetails() {
    if (this.details) return this.details
    else throw new Error('Stock details not initialized. first use initDetails() (async)')
  }
  
  //* Update the Stock
  //r Returns updated Stock object
  async update(update_data) {
    validate(update_data, stock_update_schema)

    update_data.update_date = new Date()

    let upres = await prisma.Stock.update({
      where: { id: this.id },
      data: update_data
    })

    this.details = upres
    return this
  }

  //* Remove the Stock
  //r Returns prisma response
  async remove() {
    if (!this.details) await this.initDetails()
    return await prisma.Stock.delete({ where: { id: this.id } })
  }

  //-- Static construct methods

  //* Create new Stock with details
  //r Returns Stock object
  static async create (details = {}) {
    validate(details, stock_create_schema)

    if (details.id) {
      let last_stock = await prisma.Stock.findUnique({
        where: { id: details.id }
      })
      if (last_stock !== null) throw new Error('Stock id is not empty')
    }

    details.registry_date = new Date()

    let cresp = await prisma.Stock.create({data: details})
    return new Stock(cresp.id, cresp)
  }

  //* Get a Stock by Id
  //r Returns Stock object
  static async get(id) {
    validate(id, stock_get_schema)

    let stock = new Stock(id)
    await stock.initDetails()

    return stock
  }

  //* Get Stocks with query
  //r Returns array of Stock objects
  static async getMany(query = {}, pagination = true) {
    if (pagination) {
      if (!query.skip) query.skip = 0
      if (!query.take) query.take = parseInt(process.env.QUERY_LIMIT)
    }

    let resps = await prisma.Stock.findMany(query)
    return resps.map(r => new Stock(r.id, r))
  }

  //-- Static util methods

  //* Get count of results
  //r Return integer
  static async count(extra_query = {}) {
    delete extra_query['include']
    let resp = await prisma.Stock.aggregate({
      _count: true,
      ...extra_query
    })
    if (resp === null) return 0
    return resp['_count']
  }

}
