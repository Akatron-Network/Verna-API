import { User } from "./user";
import { PrismaClient } from '@prisma/client'
import { Globals } from "../libraries/globals";
import { Current, CurrentActivity } from "./current";
import { Stock } from "./stock";
import { Order, OrderItem } from "./order";
import { Task } from "./task";

describe('Model Tests', () => {

  //-- Clear test users
  afterAll(async () => {
    const prisma = new PrismaClient()
    await prisma.User.deleteMany({ where: { username: { startsWith: "test_" } } })    //d clear user data
    await prisma.Order.deleteMany({ where: { code_1: { startsWith: "RT-MTEST_" } } })
    await prisma.Current.deleteMany({ where: { name: { startsWith: "RT-MTEST_" } } })  //d clear current data
    await prisma.Stock.deleteMany({ where: { name: { startsWith: "RT-MTEST_" } } })  //d clear current data

    await prisma.$disconnect()
  })

  //* User Class Tests
  test('User', async () => {

    //-- Wrong inputs to create user

    let wuser = {
      username: "a",
      password: "b"
    }
    await expect(User.create(wuser)).rejects.toThrow()          //? try with short username and password
    
    wuser.username = "abcdef"
    await expect(User.create(wuser)).rejects.toThrow()          //? try with short password only

    wuser.password = undefined
    await expect(User.create(wuser)).rejects.toThrow()          //? try without password

    wuser.password = "12345678"
    wuser.username = "a"
    await expect(User.create(wuser)).rejects.toThrow()          //? try with short username only
    

    //-- Create a normal user

    let nuser = {                                               //. Normal user data
      username: "TEST_" + 
                  (new Date()).valueOf().toString().substring(5),
      password: "12345678"
    }

    let user = await User.create(nuser)                         //. create a user with data
    expect(user).toBeDefined()                                  //? control is it defined
    await expect(User.create(nuser)).rejects.toThrow()          //? try to recreate same user


    //-- Login with new user
    nuser.password = "12345678"
    let cuser = await User.login({username: nuser.username, password: nuser.password})
    expect(cuser).toBeDefined()                                 //? try to login with created user
    expect(Object.keys(Globals.auth_tokens).length).toBe(1)     //? control the saved token length
    expect(Globals.auth_tokens[cuser.token]).toBeDefined()      //? control the token exists

    expect(User.tokenLogin(cuser.token)).toBeDefined()          //? try to login with token

    nuser.password = "1234"
    await expect(User.login(nuser)).rejects.toThrow()           //? try to login with wrong pass

    expect(await user.removeUser()).toBeDefined()               //? try to delete user

  });

  //* Current Class Tests
  test('Current', async () => {

    //-- Try to create with wrong inputs

    await expect(Current.create()).rejects.toThrow()                    //? try without detail
    await expect(Current.create({id: 1})).rejects.toThrow()             //? try without name
    await expect(Current.create({name: 1})).rejects.toThrow()           //? try with integer name

    //-- Try to create and update a current

    let current = await Current.create({name: "RT-MTEST_"})
    expect(current).toBeDefined()                                       //? control the current
    expect(await Current.get(current.id)).toStrictEqual(current)        //? compare with get current

    await expect(Current.create({id: current.id, name:"RT-MTEST_"}))     //? try to create with same id
      .rejects.toThrow()

    expect((await Current.getMany()).length).toBeGreaterThan(0)         //? get all currents and control the length
    expect((await Current.getMany({                                     //? get current with getMany
      where: { name: current.details.name }
    })).length).toBeGreaterThan(0)

    current = await current.update({address: "T3tet3tet3st"})           //? update
    expect(await Current.get(current.id)).toStrictEqual(current)        //? compare with get

    expect(await current.remove()).toBeDefined()                        //? remove current
    await expect(Current.get(current.id))                               //? try to get the current again
      .rejects.toThrow('current ' + current.id + ' not found')

  });

  //* CurrentActivity Class Tests
  test('CurrentActivity', async () => {
    
    //-- First create a current

    let current = await Current.create({name: "RT-MTEST_"})
    expect(current.id).toBeDefined()                                       //? control the current id

    let curr_act_1 = await CurrentActivity.create({
      current_id: current.id,
      description: "test activity...",
      balance: Math.round(Math.random()*1000000)/100  //. sth like 9776,65
    })

    expect(curr_act_1).toBeDefined()

    await curr_act_1.update({
      balance: Math.round(Math.random()*1000000)/100  //. sth like 9776,65
    })

    expect((await CurrentActivity.get(curr_act_1.id)).details.balance)
      .toBe(curr_act_1.details.balance)

    expect(await curr_act_1.remove()).toBeDefined()
    
    let curr_act_2 = await CurrentActivity.create({
      current_id: current.id,
      description: "test activity 2...",
      balance: -1 * Math.round(Math.random()*1000000)/100  //. sth like -9776,65
    })

    expect(curr_act_2).toBeDefined()

    await expect(curr_act_2.update({balance: "aaa"}))
      .rejects.toThrow('instance.balance is not of a type(s) number')

    expect(await curr_act_2.remove()).toBeDefined()

  });

  //* Stock Class Tests
  test('Stock', async () => {
    
    //-- Try wrong inputs

    await expect(Stock.create()).rejects.toThrow('instance requires property "name"')
    await expect(Stock.create({name: 1})).rejects.toThrow('instance.name is not of a type(s) string')

    //-- Create a stock

    let stock = await Stock.create({
      name: "RT-MTEST_" + (new Date()).valueOf().toString().substring(5),
      unit: "M2",
      code_1: "TEST"
    })
    expect(stock.id).toBeDefined()
    expect(stock.details.code_1).toBe('TEST')
    expect(stock.details.unit).toBe('M2')

    //-- Update the stock

    expect(await stock.update({code_2: "TEST2"})).toBeDefined()
    expect(stock.details.code_2).toBe('TEST2')

    //-- Get stock

    expect((await Stock.get(stock.id)).details).toStrictEqual(stock.details)
    expect((await Stock.getMany({where: {id: stock.id}})).length).toBeGreaterThan(0)

    //-- Remove the stock

    expect(await stock.remove()).toBeDefined()

  });

  //* Order & OrderItem Class Tests
  test('Order & OrderItem', async () => {
    
    //-- Create new order

    let current = await Current.create({
      name: "RT-MTEST_" +  + (new Date()).valueOf().toString().substring(5)
    })

    let stock_1 = await Stock.create({
      name: "RT-MTEST_1" + (new Date()).valueOf().toString().substring(6),
      unit: "M2"
    })

    let stock_2 = await Stock.create({
      name: "RT-MTEST_2" + (new Date()).valueOf().toString().substring(6),
      unit: "PK"
    })

    let order = await Order.create({
      current_id: current.id,
      order_source: "WEBSITE",
      total_fee: 1100.20,
      code_1: "RT-MTEST_" + (new Date()).valueOf().toString().substring(6),
      registry_username: "admin",
      items: [
        {
          row: 1,
          stock_id: stock_1.id,
          unit: stock_1.details.unit,
          amount: 2,
          price: 100,
          tax_rate: 0.18
        },
        {
          row: 2,
          stock_id: stock_2.id,
          unit: stock_2.details.unit,
          amount: 3,
          price: 25,
          tax_rate: 0.18
        }
      ]
    })

    expect(order).toBeDefined()

    expect((await Order.getMany({where: { code_1: {startsWith: 'RT-MTEST_'}}})).length).toBe(1)
    expect((await OrderItem.getMany({where: { order_id: order.id}})).length).toBe(order.items.length)

    //-- Update the order

    let upd = {
      total_fee: 2200.40,
      items: [
        {...order.items[0].details},
        {
          row: 2,
          stock_id: stock_1.id,
          unit: stock_1.details.unit,
          amount: 5,
          price: 120,
          tax_rate: 0.18
        }
      ]
    }

    await order.update(upd)

    expect(order.items.length).toBe(upd.items.length)

    //-- Remove the order

    expect(order.remove()).toBeDefined()

  });

  test('Task', async () => {
    //-- Create new order

    let current = await Current.create({
      name: "RT-MTEST_" +  + (new Date()).valueOf().toString().substring(5)
    })

    let stock_1 = await Stock.create({
      name: "RT-MTEST_1" + (new Date()).valueOf().toString().substring(6),
      unit: "M2"
    })

    let stock_2 = await Stock.create({
      name: "RT-MTEST_2" + (new Date()).valueOf().toString().substring(6),
      unit: "PK"
    })

    let order = await Order.create({
      current_id: current.id,
      order_source: "WEBSITE",
      total_fee: 1100.20,
      code_1: "RT-MTEST_" + (new Date()).valueOf().toString().substring(6),
      registry_username: "admin",
      items: [
        {
          row: 1,
          stock_id: stock_1.id,
          unit: stock_1.details.unit,
          amount: 2,
          price: 100,
          tax_rate: 0.18
        },
        {
          row: 2,
          stock_id: stock_2.id,
          unit: stock_2.details.unit,
          amount: 3,
          price: 25,
          tax_rate: 0.18
        }
      ]
    })

    expect(order).toBeDefined()

    //-- Create a new task

    let task = await Task.create({
      order_id: order.id,
      description: "Test Task",
      assigned_username: "admin",
      task_steps: [
        {
          row: 1,
          name: "First Step to the moon",
          responsible_username: "admin",
          planned_finish_date: "2023-02-10T00:00:00Z"
        },
        {
          row: 2,
          name: "Second Step to the mars",
          responsible_username: "admin",
          planned_finish_date: "2023-02-10T00:00:00Z"
        }
      ]
    })

    expect(task).toBeDefined()
    expect(task.task_steps).toStrictEqual((await Task.get(task.id)).task_steps)

    await task.complateStep({
      complate_description: "I reached to the moon!",
      registry_username: "admin"
    })

    expect(task.details.current_step.row).toBe(2)
    expect(task.details.previous_step.row).toBe(1)
    expect(task.details.next_step).toBe(null)

    await task.complateStep({
      complate_description: "I finally reached to the mars OMG!",
      registry_username: "admin"
    })

    expect(task.details.current_step).toBe(null)
    expect(task.details.previous_step.row).toBe(2)
    expect(task.details.next_step).toBe(null)
    expect(task.details.closed).toBe(true)

  });
});
