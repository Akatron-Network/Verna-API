import { PrismaClient } from '@prisma/client'
import { Response } from "../libraries/response.js";
import { Current, CurrentActivity } from "../models/current.js";
import { Order, OrderItem } from "../models/order.js";
import { Task } from "../models/task.js";
import { Route } from "./route.js";

const prisma = new PrismaClient()

export class Route_Dashboard extends Route {

  constructor () {
    //* Register the route info
    super('/dashboard', 'Dashboard', 'User General View')

    //* Register methods and permissions
    this.setMethod('GET', this.get)
    this.setPermission('GET', { login: true, permission: "DASHBOARD_VIEW" })
  }

  async get (res, user, body = {}) {

    // let monthly_total_sales = await prisma.$queryRaw`SELECT (EXTRACT(MONTH FROM date)) AS month, (EXTRACT(YEAR FROM date)) AS year, SUM(balance) as balance FROM "CurrentActivity" WHERE balance > 0 GROUP BY (EXTRACT(MONTH FROM date)), (EXTRACT(YEAR FROM date)) ORDER BY (EXTRACT(YEAR FROM date)), (EXTRACT(MONTH FROM date))`

    let sales_daily = await prisma.$queryRaw`SELECT (EXTRACT(YEAR FROM date)) AS year, (EXTRACT(MONTH FROM date)) AS month, (EXTRACT(DAY FROM date)) AS day, sum(total_fee) FROM "Order" GROUP BY EXTRACT(DAY FROM date), EXTRACT(MONTH FROM date), EXTRACT(YEAR FROM date)`
    let sales_monthly = await prisma.$queryRaw`SELECT (EXTRACT(YEAR FROM date)) AS year, (EXTRACT(MONTH FROM date)) AS month, sum(total_fee) FROM "Order" GROUP BY EXTRACT(MONTH FROM date), EXTRACT(YEAR FROM date)`

    let content = {
      active_task_count: await Task.count({ where: { state: "Aktif" } }),
      not_created_task_count: await Order.count({ where: { task: null } }),
      overdue_task_count: await Task.count({ where: { current_step: { planned_finish_date: { lt: new Date() } }, state: "Aktif" } }),
      complated_order_count_month: await Task.count({ where: { finish_date: { gt: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }}}),
      active_tasks: await Task.getMany({ where: { state: "Aktif", closed: false }}),
      sales_daily,
      sales_monthly,
      current_final_balances: (await Current.getFinalBalances())
    }

    return Response.success(res, content, Route.generateMeta(res.req))
  }

}
