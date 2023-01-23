import { Response } from "../libraries/response.js";
import { Route_Login } from "./auth.js"

export class Route {

  constructor(url, name, description) {
    this.url = url
    this.name = name
    this.description = description
  }

  getRequestBody(req) {
    var method = req.method
  
    if (method === 'GET') { 
      if (req.query.body) { return JSON.parse(req.query.body) }
      else if (Object.keys(req.query).length > 0) { return req.query }
    }
    return req.body
  }


  methods = {
    "GET":     (req, res) => this.emptyMethod(req, res, getRequestBody(req)),
    "POST":    (req, res) => this.emptyMethod(req, res, getRequestBody(req)),
    "PUT":     (req, res) => this.emptyMethod(req, res, getRequestBody(req)),
    "DELETE":  (req, res) => this.emptyMethod(req, res, getRequestBody(req))
  }

  setMethod(method, func) { this.methods[method] = func }

  emptyMethod(req, res, body) { Response.error(res, 'Method not found') }

  permissions = {
    "GET":    undefined,
    "POST":   undefined,
    "PUT":    undefined,
    "DELETE": undefined,
  }

  setPermission(method, perm) { this.permissions[method] = perm }

  registerRoute(app) {
    app.all(this.url, (req, res, next) => {
      this.methods[req.method](req, res);
    })
  }



}
