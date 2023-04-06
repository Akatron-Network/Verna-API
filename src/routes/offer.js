import { Response } from "../libraries/response.js";
import { Offer, OfferItem } from "../models/offer.js";
import { Route } from "./route.js";


export class Route_Offer extends Route {
  constructor() {
    //* Register the route info
    super('/offer', 'Offer', 'Manage offers')

    //* Register methods and permissions
    this.setMethod('GET', this.get)
    this.setPermission('GET', { login: true, permission: "OFFER_VIEW" })
    this.setMethod('POST', this.post)
    this.setPermission('POST', { login: true, permission: "OFFER_EDIT" })
    this.setMethod('PUT', this.put)
    this.setPermission('PUT', { login: true, permission: "OFFER_EDIT" })
    this.setMethod('DELETE', this.del)
    this.setPermission('DELETE', { login: true, permission: "OFFER_EDIT" })
  }

  //* Show offers
  async get (res, user, body = {}) {
    if (body.id) {
      let offer = await Offer.get(parseInt(body.id))
      return Response.success(res, offer, {Meta: Route.generateMeta(res.req)})
    }
    
    if (!body.query) body.query = {}
    if (typeof(body.query) === 'string') body.query = JSON.parse(body.query)

    if (body.skip) body.query.skip = parseInt(body.skip)
    if (body.take) body.query.take = parseInt(body.take)

    let offers = await Offer.getMany(body.query)

    let meta = {
      total: await Offer.count(body.query),
      showing: offers.length,
      skip: body.query.skip || 0,
      take: body.query.take || parseInt(process.env.QUERY_LIMIT),
      ...Route.generateMeta(res.req)
    }

    return Response.success(res, offers, {Meta: meta})
  }

  //* Create an Offer
  async post (res, user, body) {
    if (!body) throw new Error('Body cannot be empty')

    body.registry_username = user.username

    let offer = await Offer.create(body)

    return Response.success(res, offer, {Meta: Route.generateMeta(res.req)})
  }

  //* Update an Offer
  async put (res, user, body) {
    if (!body || !body.id || !body.data) throw new Error('Body cannot be empty')

    let offer = await Offer.get(body.id)

    offer = await offer.update({
      ...body.data,
      update_username: user.username
    })

    return Response.success(res, offer, {Meta: Route.generateMeta(res.req)})
  }

  //* Remove an Offer
  async del (res, user, body) {
    if (!body || !body.id) throw new Error('Body cannot be empty')

    let offer = await Offer.get(body.id)
    let remresp = await offer.remove()

    return Response.success(res, remresp, {Meta: Route.generateMeta(res.req)})
  }

}


export class Route_OfferItem extends Route {
  constructor() {
    //* Register the route info
    super('/offeritem', 'Offer Item', 'Manage offer items')

    //* Register methods and permissions
    this.setMethod('GET', this.get)
    this.setPermission('GET', { login: true, permission: "OFFER_VIEW" })
    this.setMethod('POST', this.post)
    this.setPermission('POST', { login: true, permission: "OFFER_EDIT" })
    this.setMethod('PUT', this.put)
    this.setPermission('PUT', { login: true, permission: "OFFER_EDIT" })
    this.setMethod('DELETE', this.del)
    this.setPermission('DELETE', { login: true, permission: "OFFER_EDIT" })
  }

  //* Show offer items
  async get (res, user, body = {}) {
    if (body.id) {
      let offeritem = await OfferItem.get(parseInt(body.id))
      return Response.success(res, offeritem, {Meta: Route.generateMeta(res.req)})
    }
    
    if (!body.query) body.query = {}
    if (typeof(body.query) === 'string') body.query = JSON.parse(body.query)

    if (body.skip) body.query.skip = parseInt(body.skip)
    if (body.take) body.query.take = parseInt(body.take)

    let offeritems = await OfferItem.getMany(body.query)

    let meta = {
      total: await OfferItem.count(body.query),
      showing: offeritems.length,
      skip: body.query.skip || 0,
      take: body.query.take || parseInt(process.env.QUERY_LIMIT),
      ...Route.generateMeta(res.req)
    }

    return Response.success(res, offeritems, {Meta: meta})
  }

  //* Create an OfferItem
  async post (res, user, body) {
    if (!body) throw new Error('Body cannot be empty')

    body.registry_username = user.username

    let offerItem = await OfferItem.create(body)
    await (await offerItem.getOffer()).calculateFee()

    return Response.success(res, offerItem, {Meta: Route.generateMeta(res.req)})
  }

  //* Update an OfferItem
  async put (res, user, body) {
    if (!body || !body.id || !body.data) throw new Error('Body cannot be empty')

    let offerItem = await OfferItem.get(body.id)
    offerItem = await offerItem.update({...body.data})
    (await offerItem.getOffer()).calculateFee()

    return Response.success(res, offerItem, {Meta: Route.generateMeta(res.req)})
  }

  //* Remove an OfferItem
  async del (res, user, body) {
    if (!body || !body.id) throw new Error('Body cannot be empty')

    let offerItem = await OfferItem.get(body.id)
    let offer = await offerItem.getOffer()
    let remresp = await offerItem.remove()
    await offer.calculateFee()

    return Response.success(res, remresp, {Meta: Route.generateMeta(res.req)})
  }

}
