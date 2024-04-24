import { PrismaClient } from '@prisma/client'
import { validate } from '../libraries/validation.js'
import { 
  current_activity_create_schema, 
  current_activity_get_schema, 
  current_activity_update_schema, 
  current_create_schema, 
  current_get_schema, 
  current_update_schema 
} from '../schemas/current.schema.js'
import * as dotenv from 'dotenv'

const prisma = new PrismaClient()
dotenv.config()


export class Current {
  
  //* Manual construction
  //! not effects the database, use create or get
  constructor(company_code, id, current_details) {
    this.id = id
    this.company_code = company_code
    if (current_details) this.details = current_details
  }

  //* Initiate Details
  async initDetails() {
    this.details = await prisma.Current.findUnique({
      where: { id: this.id }
    })
    if (this.details === null || this.company_code !== this.details.company_code) throw new Error('current ' + this.id + ' not found')  //r if cant get details give error
  }

  //* Get Details of Current
  //r Returns this.details
  getDetails() { 
    if (this.details) return this.details                                         //. try to get details
    else throw new Error('Current details not initialized. first use initDetails() (async)')   //. if not saved give error
  }

  //* Update the Current
  //r Returns updated Current object
  async update(current_details) {
    validate(current_details, current_update_schema)

    current_details.update_date = new Date()
    
    let upres = await prisma.Current.update({
      where: { id: this.id },
      data: current_details
    })

    this.details = upres
    return this
  }

  //* Remove the Current
  //r Returns prisma response
  async remove() {
    if (!this.details) await this.initDetails()
    return await prisma.Current.delete({ where: { id: this.id }})
  }

  //-- Static construct methods

  //* Create new Current with details
  //r Returns Current object
  static async create(company_code, current_details) {
    validate(current_details, current_create_schema)

    current_details.registry_date = new Date()

    let cresp = await prisma.Current.create({data: {...current_details, company_code}})

    return new Current(company_code, cresp.id, cresp)
  }

  //* Get a Current by Id
  //r Returns Current Object
  static async get(company_code, id) {
    validate(id, current_get_schema)

    let current = new Current(company_code, id)
    await current.initDetails()

    return current
  }

  //* Get currents with query
  //r Returns array of Current objects
  static async getMany(company_code, query = {}) {
    if (!query.skip) query.skip = 0
    if (!query.take) query.take = parseInt(process.env.QUERY_LIMIT)

    if (!query.where) query.where = { company_code }
    else query.where.company_code = company_code

    let resps = await prisma.Current.findMany(query)
    return resps.map(r => new Current(company_code, r.id, r))
  }

  //-- Static util methods

  static async count(company_code, extra_query = {}) {
    if (!extra_query.where) extra_query.where = { company_code }
    else extra_query.where.company_code = company_code

    delete extra_query['include']
    let resp = await prisma.Current.aggregate({
      _count: true,
      ...extra_query
    })
    if (resp === null) return 0
    return resp['_count']
  }

  static async getFinalBalances(company_code, extra_query = {}) {
    delete extra_query['include']
    let resp = await prisma.CurrentActivity.groupBy({
      by: ['current_id'],
      _sum: {
        balance: true
      },
      orderBy: {
        _sum: {
          balance: "desc"
        }
      },
      having: {
        balance: {
          _sum: {
            not: 0,
          },
        },
      },
      where: { company_code }
    })

    for (let r of resp) {
      r.current = await Current.get(company_code, r.current_id)

      r.balance = r._sum.balance
      delete r._sum
    }

    return resp
  }
}




export class CurrentActivity {

  //* Manual construction
  //! not effects the database, use create or get
  constructor(company_code, id, act_details) {
    this.id = id
    this.company_code = company_code
    if (act_details) this.details = act_details
  }

  //* Initiate Details
  async initDetails() {
    this.details = await prisma.CurrentActivity.findUnique({
      where: { id: this.id}
    })
    if (this.details === null || this.company_code !== this.details.company_code) throw new Error('Current activity ' + this.id + ' not found')
  }

  //* Get Details of CurrentActivity
  //r Returns this.details
  getDetails() { 
    if (this.details) return this.details                                         //. try to get details
    else throw new Error('CurrentActivity details not initialized. first use initDetails() (async)')   //. if not saved give error
  }

  //* Update the CurrentActivity
  //r Returns updated CurrentActivity object
  async update(update_data) {
    validate(update_data, current_activity_update_schema)

    update_data.update_date = new Date()

    let upres = await prisma.CurrentActivity.update({
      where: { id: this.id },
      data: update_data
    })

    this.details = upres
    return this
  }

  //* Remove the CurrentActivity
  //r Returns prisma response
  async remove() {
    if (!this.details) await this.initDetails()
    return await prisma.CurrentActivity.delete({ where: { id: this.id } })
  }

  //-- Static construct methods

  //* Create new Current with details
  //r Returns Current object
  static async create(company_code, details) {
    validate(details, current_activity_create_schema)

    details.registry_date = new Date()
    if (!details.expiry_date) details.expiry_date = new Date()
    if (!details.date) details.date = new Date()

    let cresp = await prisma.CurrentActivity.create({data: {...details, company_code}})
    return new CurrentActivity(company_code, cresp.id, cresp)
  }

  //* Get a CurrentActivity by Id
  //r Returns CurrentActivity object
  static async get(company_code, id) {
    validate(id, current_activity_get_schema)

    let curr_act = new CurrentActivity(company_code, id)
    await curr_act.initDetails()

    return curr_act
  }

  //* Get CurrentActivities with query
  //r Returns array of CurrentActivity objects
  static async getMany(company_code, query = {}, pagination = true) {
    if (pagination) {
      if (!query.skip) query.skip = 0
      if (!query.take) query.take = parseInt(process.env.QUERY_LIMIT)
    }

    if (!query.orderBy) query.orderBy = []
    query.orderBy = [...query.orderBy, {date: "asc"}, {id: "asc"}]

    if (!query.where) query.where = { company_code }
    else query.where.company_code = company_code

    let resps = await prisma.CurrentActivity.findMany(query)

    //* First cumulative balance calculation
    if (resps.length > 0) {
      let first_cu_bal = await prisma.CurrentActivity.aggregate({
        _sum: {
          balance: true
        },
        where: {
          current_id: resps[0].current_id,
          date: { lte: resps[0].date },
          registry_date: { lte: resps[0].registry_date }
        }
      })
      resps[0].cumulative_balance = first_cu_bal['_sum'].balance
    }
    
    //* Rest cumulative balance calculation
    for (let ri in resps) {
      if (parseInt(ri) === 0) continue
      resps[ri].cumulative_balance = resps[parseInt(ri)-1].cumulative_balance + resps[ri].balance
    }

    return resps.map((r) => new CurrentActivity(company_code, r.id, r))
  }

  //-- Static util methods

  //* Get count of results
  //r Return integer
  static async count(company_code, extra_query = {}) {
    if (!extra_query.where) extra_query.where = { company_code }
    else extra_query.where.company_code = company_code

    delete extra_query['include']
    let resp = await prisma.CurrentActivity.aggregate({
      _count: true,
      ...extra_query
    })
    if (resp === null) return 0
    return resp['_count']
  }

}
