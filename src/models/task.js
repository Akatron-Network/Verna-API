import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { validate } from '../libraries/validation.js'

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
    
  }

  
}
