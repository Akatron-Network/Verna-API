import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { validate } from '../libraries/validation.js'
import { arraySortByKey } from '../libraries/misc.js'
import { 
  task_create_schema, 
  task_get_schema, 
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
        last_step: true,
        current_step: true,
        next_step: true,
        logs: true
      }
    })
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
        last_step: true,
        current_step: true,
        next_step: true,
        logs: true
      }
    })

    this.details = upres
    return this
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
      include: { task_steps: true, logs: true }
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
  
}
