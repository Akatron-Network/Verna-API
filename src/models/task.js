import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { validate } from '../libraries/validation.js'
import { arraySortByKey } from '../libraries/misc.js'
import { 
  task_cancel_schema,
  task_create_schema, 
  task_get_schema, 
  task_step_cancel_schema, 
  task_step_complate_schema, 
  task_update_schema 
} from '../schemas/task.schema.js'

const prisma = new PrismaClient()
dotenv.config()

export class Task {

  //* Manual construction
  //! not effects the database, use create or get
  constructor(id, details) {
    this.id = id
    if (details) this.details = details
  }

  //* Initiate details
  async init () {
    this.details = await prisma.Task.findUnique({
      where: { id: this.id },
      include: {
        task_steps: true,
        previous_step: true,
        current_step: true,
        next_step: true,
        logs: true,
        order: { include: { items: true } }
      }
    })
    if (this.details === null) throw new Error('Task not found: ' + this.id)
    return this;
  }

  //* Update the Task
  //r returns Task object with updated details
  async update (details) {
    validate(details, task_update_schema)

    let upres = await prisma.Task.update({
      where: { id: this.id },
      data: details,
      include: {
        task_steps: true,
        previous_step: true,
        current_step: true,
        next_step: true,
        logs: true,
        order: { include: { items: true } }
      }
    })

    this.details = upres
    return this
  }

  //* Get Step by Row
  async getStepByRow(row) {
    if (!this.details) await this.init()
    for (let step of this.details.task_steps) {
      if (step.row === row) return step
    }
    return null
  }

  //* Complate current step
  async complateStep (details) {
    validate(details, task_step_complate_schema)
    if (!this.details) await this.init()

    let next_step_id = this.details.next_step_id                      //. get next step id
    let current_step_id = this.details.current_step_id                //. get current step id
    if (!current_step_id) throw new Error('Current step not found')   //r if not have current throw error

    let new_next_step_id = await this.getStepByRow(this.details.current_step.row + 2)
    let new_resp_user = (this.details.next_step) ? this.details.next_step.responsible_username : undefined

    let log = {
      explanation: this.details.current_step.row + ". adım tamamlandı",     //. log explanation
      registry_date: new Date(),                                            //. log date
      registry_username: details.registry_username                          //. log registry
    }

    let upres = await prisma.Task.update({                            //d update task with new step status
      where: { id: this.id },
      data: {
        assigned_username: new_resp_user,
        current_step_id: next_step_id,
        previous_step_id: current_step_id,
        next_step_id: new_next_step_id,
        task_steps: {
          update: {
            where: { id: current_step_id },
            data: { complate_description: details.complate_description, complate_date: new Date() }
          }
        },
        logs: { create: [log] }
      },
      include: {
        task_steps: true,
        previous_step: true,
        current_step: true,
        next_step: true,
        logs: true,
        order: { include: { items: true } }
      }
    })

    this.details = upres
    if (this.details.current_step_id === null) await this.complateTask()    //d complate task if no more steps
    return this
  }

  //* Cancel current step
  async cancelStep (details) {
    validate(details, task_step_cancel_schema)
    if (!this.details) await this.init()

    if (this.details.previous_step_id === null || !this.details.previous_step_id) throw new Error('No previous step found, cant cancel the step')

    let prev_step_id = this.details.previous_step_id
    let current_step_id = this.details.current_step_id
    let new_prev_step_row = (this.details.current_step) ? this.details.current_step.row - 2 : this.details.previous_step.row - 1
    let new_prev_step_id = (new_prev_step_row > 0) ? (await this.getStepByRow(new_prev_step_row)).id : null
    let new_resp_user = this.details.previous_step.responsible_username

    let log = {
      explanation: this.details.previous_step.row + ". adıma geri dönüldü. " + details.description,
      registry_date: new Date(),
      registry_username: details.registry_username
    }

    let upres = await prisma.Task.update({
      where: { id: this.id },
      data: {
        assigned_username: new_resp_user,
        current_step_id: prev_step_id,
        previous_step_id: new_prev_step_id,
        next_step_id: current_step_id,
        closed: false,
        state: "Aktif",
        logs: { create: [log]}
      },
      include: {
        task_steps: true,
        previous_step: true,
        current_step: true,
        next_step: true,
        logs: true,
        order: { include: { items: true } }
      }
    })

    this.details = upres
    return this
  }

  //* Complate Task
  async complateTask () {
    let log = {
      explanation: "Görev tamamlandı.",
      registry_date: new Date()
    }
    let upres = await prisma.Task.update({
      where: { id: this.id },
      data: {
        closed: true,
        state: "Tamamlandı",
        previous_step_id: (this.details.current_step_id !== null ? this.details.current_step_id : undefined),
        current_step_id: null,
        logs: { create: [log] }
      },
      include: {
        task_steps: true,
        previous_step: true,
        current_step: true,
        next_step: true,
        logs: true,
        order: { include: { items: true } }
      }
    })
    this.details = upres
    return this
  }

  //* Cancel Task
  async cancelTask  (details) {
    validate(details, task_cancel_schema)

    let log = {
      explanation: "Görev iptal edildi. " + details.description,
      registry_date: new Date(),
      registry_username: details.registry_username
    }
    let upres = await prisma.Task.update({
      where: { id: this.id },
      data: {
        closed: true,
        state: "İptal Edildi",
        logs: { create: [log] }
      },
      include: {
        task_steps: true,
        previous_step: true,
        current_step: true,
        next_step: true,
        logs: true,
        order: { include: { items: true } }
      }
    })
    this.details = upres
    return this
  }

  //* ReOpen Task
  async reOpenTask (details) {
    validate(details, task_cancel_schema)

    let log = {
      explanation: "Görev tekrar açıldı. " + details.description,
      registry_date: new Date(),
      registry_username: details.registry_username
    }
    let upres = await prisma.Task.update({
      where: { id: this.id },
      data: {
        closed: false,
        state: "Aktif",
        previous_step_id: null,
        current_step_id: this.details.task_steps[0].id,
        next_step_id: (this.details.task_steps[1] ? this.details.task_steps[1].id : null),
        logs: { create: [log] }
      },
      include: {
        task_steps: true,
        previous_step: true,
        current_step: true,
        next_step: true,
        logs: true,
        order: { include: { items: true } }
      }
    })
    this.details = upres
    return this
  }

  //* Delete Task
  async remove () {
    if (!this.details) await this.init()
    return await prisma.Task.delete({where: {id: this.id}})
  }


  //-- Static Construct Methods

  //* Create new Task
  //r Returns Task object with steps
  static async create (details) {
    validate(details, task_create_schema)

    let control_order = await prisma.Task.findUnique({             //d control the order has a task
      where: { order_id: details.order_id }
    })
    if (control_order !== null) throw new Error('Order\'s task has been already created. Task id: ' + control_order.id )

    let steps = [...details.task_steps]                           //. get steps to a variable
    delete details.task_steps                                     //. delete it from details

    steps = arraySortByKey(steps, 'row')                          //. Sort by row
    for (let i in steps) { steps[i].row = parseInt(i) + 1 }       //. Re make row keys
    steps[0].start_date = new Date()                              //. set the first step start date

    details.assigned_username = steps[0].responsible_username                                 //. make first assignment
    details.planned_finish_date = steps[steps.length-1].planned_finish_date || new Date()     //. generate finish date

    let log = {
      explanation: "Görev oluşturuldu",                           //. log explanation
      registry_date: new Date(),                                  //. log date
      registry_username: details.registry_username                //. log registry
    }

    let n_task = await prisma.Task.create({                       //d create task record with steps and log
      data: {
        ...details, 
        task_steps: { create: steps }, 
        logs: { create: [log]} },
      include: { task_steps: true, logs: true, order: { include: { items: true } } }
    })

    let curr_step = n_task.task_steps[0].id                                                 //. get first step as current
    let next_step = (n_task.task_steps.length > 1) ? n_task.task_steps[1].id : undefined    //. get second step as next
    
    await prisma.Task.update({                                    //d update the task record for current and next step
      where: { id: n_task.id },
      data: {
        current_step_id: curr_step,
        next_step_id: next_step
      }
    })

    n_task.current_step_id = curr_step                            //. set the updated results
    n_task.current_step = n_task.task_steps[0]
    n_task.next_step_id = next_step
    n_task.next_step = (steps.length > 1) ? n_task.task_steps[1] : null
    n_task.previous_step = null
    
    return new Task(n_task.id, n_task)                            //r return Task object

  }

  //* Get a Task by id
  //r Returns Task object
  static async get (id) {
    validate(id, task_get_schema)

    let task = new Task(id)
    await task.init()

    return task
  }
  
  //* Get Tasks with query
  //r Returns array of Task objects
  static async getMany (query, pagination = true) {
    if (pagination) {
      if (!query.skip) query.skip = 0
      if (!query.take) query.take = parseInt(process.env.QUERY_LIMIT)
    }

    if (!query.select || !query.include) {
      query.include = {
        task_steps: true,
        previous_step: true,
        current_step: true,
        next_step: true,
        logs: true,
        order: { include: { items: true, credit_current_act: true, debt_current_act: true } }
      }
    }

    let resps = await prisma.Task.findMany(query)
    return resps.map(r => new Task(r.id, r))
  }

  
  //-- Static util methods

  //* Get count of results
  //r Return integer
  static async count(extra_query = {}) {
    delete extra_query['include']
    let resp = await prisma.Task.aggregate({
      _count: true,
      ...extra_query
    })
    if (resp === null) return 0
    return resp['_count']
  }

}
