import { User } from "../models/user.js";
import { Route_Login, Route_Register } from "../routes/auth.js";
import { Route_Current } from "../routes/current.js";

export class Globals {
  static auth_tokens = {
    // "RT-Token_Admin": new User('admin', {admin: true})
  }

  static routes = [
    new Route_Login(),
    new Route_Register(),
    new Route_Current(),
  ]
}
