import { Globals } from "../libraries/globals.js";
import { Response } from "../libraries/response.js";
import bodyParser from 'body-parser'


//-- Route parent class

export class Route {

  constructor(url, name, description) {
    this.url = url                      //. 0.0.0.0/url
    this.name = name                    //. name of the route
    this.description = description      //. description of the route
  }

  //* Route methods
  methods = {
    "GET":     async (res, user, data) => await this.emptyMethod(res, user, data),
    "POST":    async (res, user, data) => await this.emptyMethod(res, user, data),
    "PUT":     async (res, user, data) => await this.emptyMethod(res, user, data),
    "DELETE":  async (res, user, data) => await this.emptyMethod(res, user, data)
  }

  //* Method setter
  setMethod(method, func) { this.methods[method] = func }

  //* Empty method function
  async emptyMethod(res, data) { return Response.error(res, 'Method not found') }

  //* Route method permissions
  permissions = {
    "GET":    {
      login: false,
      permission: undefined
    },
    "POST":   {
      login: false,
      permission: undefined
    },
    "PUT":    {
      login: false,
      permission: undefined
    },
    "DELETE": {
      login: false,
      permission: undefined
    },
  }

  //* Permission setter
  setPermission(method, perm) { this.permissions[method] = perm }


  //* Route registerer (use in registerAllRoutes function)
  registerRoute(app) {
    app.all(this.url, bodyParser.json(), async (req, res, next) => {
      try { await this.router(req, res) } 
      catch (e) { console.error(e.stack); Response.error(res, e.message) }
    })
  }

  //* Route activator (using in registerRoute function)
  async router(req, res) {
    let perms = this.permissions[req.method]
    let method = this.methods[req.method]

    let user = (perms.login) ? Route.getUser(req) : undefined

    await method(res, user, Route.getRequestBody(req))
  }



  //-- Static methods

  //* Get body of the request
  static getRequestBody(req) {
    var method = req.method
    if (method === 'GET') { 
      if (req.query.body) { return JSON.parse(req.query.body) }
      else if (Object.keys(req.query).length > 0) { return req.query }
    }
    return req.body
  }

  //* Get user from token in request header
  static getUser(req) {
    let token = req.headers.Token || req.headers.token
    let user = Globals.auth_tokens[token]
    if (!user) throw new Error('User not authorized')
    return user
  }

  //* Generate base meta
  static generateMeta(req) {
    return {
      url_path: req.url,
      method: req.method,
      user: this.getUser(req)
    }
  }

}


