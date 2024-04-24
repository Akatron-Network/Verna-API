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
    this.setMethod('POST', this.post)
    this.setPermission('POST', { login: true, permission: "TASK_EDIT"})
    this.setMethod('PUT', this.put)
    this.setPermission('PUT', { login: true, permission: "TASK_EDIT"})
    this.setMethod('DELETE', this.del)
    this.setPermission('DELETE', { login: true, permission: "TASK_EDIT"})
  }

  //* Show tasks
  async get (res, user, body = {}) {
    if (body.id) {
      //todo control permission

      let task = await Task.get(user.user_details.company_code, parseInt(body.id))
      return Response.success(res, task, {Meta: Route.generateMeta(res.req)})
    }
    if (body.query) {
      //todo control permission

      if (typeof(body.query) === 'string') body.query = JSON.parse(body.query)

      if (body.skip) body.query.skip = parseInt(body.skip)
      if (body.take) body.query.take = parseInt(body.take)

      let tasks = await Task.getMany(user.user_details.company_code, body.query)

      let meta = {
        total: await Task.count(user.user_details.company_code, body.query),
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

      let tasks = await Task.getMany(user.user_details.company_code, q)

      let meta = {
        total: await Task.count(user.user_details.company_code, q),
        showing: tasks.length,
        skip: q.skip || 0,
        take: q.take || parseInt(process.env.QUERY_LIMIT),
        ...Route.generateMeta(res.req)
      }

      return Response.success(res, tasks, {Meta: meta})
    }
  }

  //* Task Operations
  async post (res, user, body = {}) {
    if (!body.operation) throw new Error('Operation is not defined')

    let { operation, data } = body

    //* Create new Task
    if (operation === 'create') {
      data.registry_username = user.username
      let task = await Task.create(user.user_details.company_code, data)

      return Response.success(res, task, {Meta: Route.generateMeta(res.req)})
    }

    //* Complate Current Step
    else if (operation === 'complateStep') {
      if (!Object.keys(data).includes('id')) throw new Error('Id not found in data')
      
      let task = await Task.get(user.user_details.company_code, data.id)
      await task.complateStep({
        registry_username: user.username, 
        complate_description: data.complate_description
      })

      return Response.success(res, task, {Meta: Route.generateMeta(res.req)})
    }

    //* Cancel Current Step
    else if (operation === 'cancelStep') {
      if (!Object.keys(data).includes('id')) throw new Error('Id not found in data')
      
      let task = await Task.get(user.user_details.company_code, data.id)
      await task.cancelStep({
        registry_username: user.username, 
        description: data.description
      })

      return Response.success(res, task, {Meta: Route.generateMeta(res.req)})
    }

    //* Complate Task
    else if (operation === 'complateTask') {
      if (!Object.keys(data).includes('id')) throw new Error('Id not found in data')

      let task = await Task.get(data.id)
      await task.complateTask()

      return Response.success(res, task, {Meta: Route.generateMeta(res.req)})
    }

    //* Re Activate Task
    else if (operation === 'reOpenTask') {
      if (!Object.keys(data).includes('id')) throw new Error('Id not found in data')

      let task = await Task.get(user.user_details.company_code, data.id)
      await task.reOpenTask({
        registry_username: user.username, 
        description: data.description
      })

      return Response.success(res, task, {Meta: Route.generateMeta(res.req)})
    }

    //* Cancel Task
    else if (operation === 'cancelTask') {
      if (!Object.keys(data).includes('id')) throw new Error('Id not found in data')
      
      let task = await Task.get(user.user_details.company_code, data.id)
      await task.cancelTask({
        registry_username: user.username, 
        description: data.description
      })
      
      return Response.success(res, task, {Meta: Route.generateMeta(res.req)})
    }

    //* wrong operation input
    else return Response.error(res, 'Operation not found. Try: complateStep, cancelStep, ComplateTask, reOpenTask')
  }

  //* Update a Task
  async put (res, user, body) {
    if (!body || !body.id || !body.data) throw new Error('Body cannot be empty')

    let task = await Task.get(user.user_details.company_code, body.id)

    task = await task.update({
      ...body.data,
      update_username: user.username
    })
    
    return Response.success(res, task, {Meta: Route.generateMeta(res.req)})
  }

  //* Remove a Task
  async del (res, user, body) {
    if (!body || !body.id) throw new Error('Body cannot be empty')

    let task = await Task.get(user.user_details.company_code, body.id)
    let remresp = await task.remove()

    return Response.success(res, remresp, {Meta: Route.generateMeta(res.req)})
  }

}
