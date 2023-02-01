import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { validate } from '../libraries/validation.js'
import { task_create_schema } from '../schemas/task.schema.js'

const prisma = new PrismaClient()
dotenv.config()

export class Task {

  //* Manual construction
  //! not effects the database, use create or get
  constructor(id, details) {
    this.id = id
    if (details) this.details = details
  }



  //-- Static Construct Methods

  //* Create new Task
  //r Returns Task object with steps
  static async create (details) {
    validate(details, task_create_schema)

    let steps = [...details.task_steps]
    delete details.task_steps

    //todo set assigned user from first step
    //todo set planned finish date from last step
    //todo set current step id and next step id
    //todo reorder steps to be sure

    let n_task = await prisma.Task.create({
      data: {...details, task_steps: { create: steps } },
      include: { task_steps: true }
    })
    
    return n_task

  }

  
}
