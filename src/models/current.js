import { PrismaClient } from '@prisma/client'
import { validate } from '../libraries/validation.js'
import { 
  current_activity_create_schema, 
  current_activity_get_schema, 
  current_activity_update_schema, 
  current_create_schema, 
  current_get_schema, 
  current_update_schema 
} from '../schemas/current.js'
import * as dotenv from 'dotenv'

const prisma = new PrismaClient()
dotenv.config()


export class Current {
  
  //* Manual construction
  //! not effects the database, use create or get
  constructor(id, current_details) {
    this.id = id
    if (current_details) this.details = current_details
  }

  //* Initiate Details
  async initDetails() {
    this.details = await prisma.Current.findUnique({
      where: { id: this.id }
    })
    if (this.details === null) throw new Error('current ' + this.id + ' not found')  //r if cant get details give error
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
  static async create(current_details) {
    validate(current_details, current_create_schema)

    if (current_details.id) {
      let last_current = await prisma.Current.findUnique({
        where: { id: current_details.id }
      })
      if (last_current !== null) throw new Error('Current id is not empty')
    }

    current_details.registry_date = new Date()

    let cresp = await prisma.Current.create({data: current_details})

    return new Current(cresp.id, cresp)
  }

  //* Get a Current by Id
  //r Returns Current Object
  static async get(id) {
    validate(id, current_get_schema)

    let current = new Current(id)
    await current.initDetails()

    return current
  }

  //* Get currents with query
  //r Returns array of Current objects
  static async getMany(query = {}) {
    if (!query.skip) query.skip = 0
    if (!query.take) query.take = parseInt(process.env.QUERY_LIMIT)

    let resps = await prisma.Current.findMany(query)
    return resps.map(r => new Current(r.id, r))
  }

  //-- Static util methods

  static async count() {
    let resp = await prisma.Current.aggregate({
      _count: true
    })
    if (resp === null) return 0
    return resp['_count']
  }

}




export class CurrentActivity{

  //* Manual construction
  //! not effects the database, use create or get
  constructor(id, act_details) {
    this.id = id
    if (act_details) this.details = act_details
  }

  //* Initiate Details
  async initDetails() {
    this.details = await prisma.CurrentActivity.findUnique({
      where: { id: this.id }
    })
    if (this.details === null) throw new Error('Current activity ' + this.id + ' not found')
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
  static async create(details) {
    validate(details, current_activity_create_schema)

    if (details.id) {
      let last_act = await prisma.CurrentActivity.findUnique({
        where: { id: details.id }
      })
      if (last_act !== null) throw new Error('CurrentActivity id is not empty')
    }

    details.registry_date = new Date()
    if (!details.expiry_date) details.expiry_date = new Date()
    if (!details.date) details.date = new Date()

    let cresp = await prisma.CurrentActivity.create({data: details})
    return new CurrentActivity(cresp.id, cresp)
  }

  //* Get a CurrentActivity by Id
  //r Returns CurrentActivity object
  static async get(id) {
    validate(id, current_activity_get_schema)

    let curr_act = new CurrentActivity(id)
    await curr_act.initDetails()

    return curr_act
  }

  //* Get CurrentActivities with query
  //r Returns array of CurrentActivity objects
  static async getMany(query = {}, pagination = true) {
    if (pagination) {
      if (!query.skip) query.skip = 0
      if (!query.take) query.take = parseInt(process.env.QUERY_LIMIT)
    }

    let resps = await prisma.CurrentActivity.findMany(query)
    return resps.map(r => new CurrentActivity(r.id, r))
  }


}
