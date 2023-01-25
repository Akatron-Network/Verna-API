import { Globals } from "./libraries/globals.js";

//-- Route Registerer
//! Register in globals.js in libraries
//. using when app starts in main.js
export function registerAllRoutes(app) {
  for (let route of Globals.routes) {
    route.registerRoute(app)
  }

  //! Add route registirations here!
}
