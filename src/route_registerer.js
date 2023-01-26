import { Globals } from "./libraries/globals.js";
import { Route_Login, Route_Register } from "./routes/auth.js";
import { Route_Current } from "./routes/current.js";

var routes = [
  new Route_Login(),
  new Route_Register(),
  new Route_Current(),
]

//-- Route Registerer
//! Register in globals.js in libraries
//. using when app starts in main.js
export function registerAllRoutes(app) {
  for (let route of routes) {
    route.registerRoute(app)
  }

  //! Add route registirations here!
}
