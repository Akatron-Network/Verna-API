import { Response } from "../libraries/response.js";
import { Route } from "./route.js";


export class Route_Login extends Route {
  constructor() {
    super('/login', 'login', 'Get user token')
    this.setMethod('GET', this.get)
  }

  get(req, res, body) {
    console.log(body);
    return Response.success(res, 'a')
  }
}
