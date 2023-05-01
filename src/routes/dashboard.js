import { Response } from "../libraries/response.js";
import { Current, CurrentActivity } from "../models/current.js";
import { Order, OrderItem } from "../models/order.js";
import { Task } from "../models/task.js";
import { Route } from "./route.js";

export class Route_Dashboard extends Route {

  constructor () {
    //* Register the route info
    super('/dashboard', 'Dashboard', 'User General View')

    //* Register methods and permissions
    this.setMethod('GET', this.get)
    this.setPermission('GET', { login: true, permission: "DASHBOARD_VIEW" })
  }

  async get (res, user, body = {}) {

    let content = {
      active_task_count: await Task.count({ where: { state: "Aktif" } }),
      not_created_task_count: await Order.count({ where: { task: null } }),
      overdue_task_count: await Task.count({ where: { current_step: { planned_finish_date: { lt: new Date() } }, state: "Aktif" } }),
      complated_order_count_month: await Task.count({ where: { finish_date: { gt: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }}}),
      active_tasks: await Task.getMany({ where: { state: "Aktif", closed: false }}),
      sales_data_month: (await CurrentActivity.getMany({
        where: { balance: { gt: 0 } },
        select: { registry_date: true, balance: true }
      })).map(r => {r = r.details; r.cumulative_balance = undefined; return r}),
      current_final_balances: (await Current.getFinalBalances())
    }

    return Response.success(res, content, Route.generateMeta(res.req))
  }

}
