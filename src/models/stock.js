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
  constructor(company_code, id, details) {
    this.id = id
    this.company_code = company_code
    if (details) this.details = details
  }

  //* Initiate Details
  async initDetails() {
    this.details = await prisma.Stock.findUnique({
      where: { id: this.id }
    })
    if (this.details === null || this.company_code !== this.details.company_code) throw new Error('stock ' + this.id + ' not found')  //r if cant get details give error
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
  static async create (company_code, details = {}) {
    validate(details, stock_create_schema)

    details.registry_date = new Date()

    let cresp = await prisma.Stock.create({data: {...details, company_code}})
    return new Stock(cresp.id, cresp)
  }

  //* Get a Stock by Id
  //r Returns Stock object
  static async get(company_code, id) {
    validate(id, stock_get_schema)

    let stock = new Stock(company_code, id)
    await stock.initDetails()

    return stock
  }

  //* Get Stocks with query
  //r Returns array of Stock objects
  static async getMany(company_code, query = {}, pagination = true) {
    if (pagination) {
      if (!query.skip) query.skip = 0
      if (!query.take) query.take = parseInt(process.env.QUERY_LIMIT)
    }

    if (!query.where) query.where = { company_code }
    else query.where.company_code = company_code

    let resps = await prisma.Stock.findMany(query)
    return resps.map(r => new Stock(company_code, r.id, r))
  }

  //-- Static util methods

  //* Get count of results
  //r Return integer
  static async count(company_code, extra_query = {}) {
    if (!extra_query.where) extra_query.where = { company_code }
    else extra_query.where.company_code = company_code
    delete extra_query['include']

    let resp = await prisma.Stock.aggregate({
      _count: true,
      ...extra_query
    })
    if (resp === null) return 0
    return resp['_count']
  }

}
