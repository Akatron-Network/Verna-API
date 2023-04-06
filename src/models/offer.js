import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { validate } from '../libraries/validation.js'
import { 
  offerItem_create_schema,
  offerItem_get_schema,
  offerItem_update_schema,
  offer_get_schema,
  offer_update_schema,
  offer_create_schema 
} from "../schemas/offer.schema.js"

const prisma = new PrismaClient()
dotenv.config()


export class Offer {

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
    this.details = await prisma.Offer.findUnique({
      where: { id: this.id }
    })
    if (this.details === null) throw new Error('Offer ' + this.id + ' not found')
  }

  //* Initiate items
  async initItems () {
    this.items = await OfferItem.getMany({
      where: { offer_id: this.id }
    }, false)
  }

  //* Remove the Offer
  //r Returns prisma response
  async remove () {
    if (!this.details) await this.init()
    return await prisma.Offer.delete({ where: { id: this.id } })
  }

  //* Update the Offer
  //r Returns updated Offer object
  async update(update_data) {
    validate(update_data, offer_update_schema)

    let old_details = {...this.details}
    let old_items = [...this.items]
    let old_item_ids = old_items.map(i => i.id)

    update_data.update_date = new Date()

    let upres = this.details

    upres = await prisma.Offer.update({
      where: { id: this.id },
      data: {
        ...update_data, 
        items: undefined,
      }
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
      else await OfferItem.create({
        ...item, 
        offer_id: this.id,
        registry_username: this.details.registry_username
      })
    }

    await this.initItems()
    await this.calculateFee()
    return this
  }

  //* Calculate the total_fee
  //r Returns updated Offer object
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

  //* Create new Offer with details and items
  //r Returns Offer object
  static async create (new_offer) {
    validate(new_offer, offer_create_schema)

    if (new_offer.id) {
      let control_data = await prisma.Offer.findUnique({ where: { id: this.id } })
      if (control_data !== null) throw new Error('Offer id is not empty')
    }

    new_offer.registry_date = new Date()

    let cresp = await prisma.Offer.create({
      data: {
        ...new_offer, 
        items: undefined,
      }
    })
    let offer = new Offer(cresp.id, cresp)
    offer.items = []

    try {
      for (let item of new_offer.items) {
        let ordItem = await OfferItem.create({
          ...item, 
          offer_id: offer.id, 
          registry_username: offer.details.registry_username
        })
        offer.items.push(ordItem)
      }
    }
    catch (e) {
      await offer.remove()
      throw new Error('Offer creation failed. \n' + e.message)
    }

    await offer.calculateFee()

    return offer
  }

  //* Get a Offer by Id
  //r Returns Offer object
  static async get (id) {
    validate(id, offer_get_schema)

    let offer = new Offer(id)
    await offer.init()
    await offer.calculateFee()
    return offer
  }

  //* Get Offer with query
  //r Returns array of Offer objects
  static async getMany (query = {}, pagination = true) {
    if (pagination) {
      if (!query.skip) query.skip = 0
      if (!query.take) query.take = parseInt(process.env.QUERY_LIMIT)
    }

    if (!query.select && !query.include) query.include = {items: true}

    let resps = await prisma.Offer.findMany(query)
    return resps.map(r => new Offer(r.id, r))
  }
  
  //-- Static util methods

  //* Get count of results
  //r Returns integer
  static async count(extra_query = {}) {
    delete extra_query['include']
    let resp = await prisma.Offer.aggregate({
      _count: true,
      ...extra_query
    })
    if (resp === null) return 0
    return resp['_count']
  }

}






export class OfferItem {

  //* Manual construction
  //! not effects the database, use create or get
  constructor (id, details) {
    this.id = id
    if (details) this.details = details
  }

  //* Initiate Details
  async initDetails () {
    this.details = await prisma.OfferItem.findUnique({
      where: { id: this.id }
    })
    if (this.details === null) throw new Error('OfferItem ' + this.id + ' not found')
  }

  //* Get Details of OfferItem
  //r Returns this.details
  getDetails () {
    if (this.details) return this.details
    else throw new Error('OfferItem details not initialized. first use initDetails() (async)')
  }

  //* Update the OfferItem
  //r Returns updated OfferItem object
  async update (update_data) {
    validate(update_data, offerItem_update_schema)

    let upres = await prisma.OfferItem.update({
      where: { id: this.id },
      data: update_data
    })

    this.details = upres
    return this
  }

  //* Remove the OfferItem
  //r Returns prisma response
  async remove () {
    if (!this.details) await this.initDetails()
    return await prisma.OfferItem.delete({ where: { id: this.id } })
  }

  //* Get the Offer from item
  //r Returns Offer object
  async getOffer() {
    if (!this.details) await this.initDetails()
    return Offer.get(this.details.offer_id)
  }

  //-- Static Construct Methods

  //* Get a OfferItem by Id
  //r Returns OfferItem object
  static async get (id) {
    validate(id, offerItem_get_schema)

    let offerItem = new OfferItem(id)
    await offerItem.initDetails()

    return offerItem
  }

  //* Create new OfferItem with details
  //r Returns OfferItem object
  static async create (details) {
    validate(details, offerItem_create_schema)

    if (details.id) {
      let control_data = await prisma.OfferItem.findUnique({
        where: { id: details.id }
      })
      if (control_data !== null) throw new Error('OfferItem id is not empty')
    }

    details.registry_date = new Date()

    let cresp = await prisma.OfferItem.create({data: details})
    return new OfferItem(cresp.id, cresp)
  }

  //* Get OfferItems with query
  //r Returns array of OfferItem objects
  static async getMany (query = {}, pagination = true) {
    if (pagination) {
      if (!query.skip) query.skip = 0
      if (!query.take) query.take = parseInt(process.env.QUERY_LIMIT)
    }

    let resps = await prisma.OfferItem.findMany(query)
    return resps.map(r => new OfferItem(r.id, r))
  }

  //-- Static util methods

  //* Get count of results
  //r Returns integer
  static async count(extra_query = {}) {
    delete extra_query['include']
    let resp = await prisma.OfferItem.aggregate({
      _count: true,
      ...extra_query
    })
    if (resp === null) return 0
    return resp['_count']
  }

}
