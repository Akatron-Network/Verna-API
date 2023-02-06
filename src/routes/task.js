import { Response } from "../libraries/response.js";
import { Task } from "../models/task.js";
import { Route } from "./route.js";
import * as dotenv from 'dotenv'

dotenv.config()

export class Route_Task extends Route {
  constructor() {
    //* Register the route info
    super('/task', 'Task', 'Manage Tasks')

    //* Register methods and permissions
    this.setMethod('GET', this.get)
    this.setPermission('GET', { login: true, permission: "TASK_VIEW"})
  }

  async get (res, user, body = {}) {
    if (body.id) {
      //todo control permission

      let task = await Task.get(body.id)
      return Response.success(res, task, {Meta: Route.generateMeta(res.req)})
    }
    if (body.query) {
      //todo control permission

      if (typeof(body.query) === 'string') body.query = JSON.parse(body.query)

      if (body.skip) body.query.skip = parseInt(body.skip)
      if (body.take) body.query.take = parseInt(body.take)

      let tasks = await Task.getMany(body.query)

      let meta = {
        total: await Task.count(body.query),
        showing: tasks.length,
        skip: body.query.skip || 0,
        take: body.query.take || parseInt(process.env.QUERY_LIMIT),
        ...Route.generateMeta(res.req)
      }

      return Response.success(res, tasks, {Meta: meta})
    }
    else {
      let q = {}
      if (body.skip) q.skip = parseInt(body.skip)
      if (body.take) q.take = parseInt(body.take)

      q.where =  { assigned_username: user.username }
      if (body.state) q.where.state = body.state

      let tasks = await Task.getMany(q)

      let meta = {
        total: await Task.count(q),
        showing: tasks.length,
        skip: q.skip || 0,
        take: q.take || parseInt(process.env.QUERY_LIMIT),
        ...Route.generateMeta(res.req)
      }

      
      return Response.success(res, tasks, {Meta: meta})
    }
  }
}
