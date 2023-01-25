import { User } from "./user";
import { PrismaClient } from '@prisma/client'
import { Globals } from "../libraries/globals";
import { Current } from "./current";

describe('Model Tests', () => {

  //-- Clear test users
  afterAll(async () => {
    const prisma = new PrismaClient()
    await prisma.User.deleteMany({ where: { username: { startsWith: "test_" } } })    //d clear user data
    await prisma.Current.deleteMany({ where: { name: { startsWith: "RT-TEST_" } } })  //d clear current data

    await prisma.$disconnect()
  })


  test('User', async () => {

    //-- Wrong inputs to create user

    let wuser = {
      username: "a",
      password: "b"
    }
    await expect(User.create(wuser)).rejects.toThrow()      //? try with short username and password
    
    wuser.username = "abcdef"
    await expect(User.create(wuser)).rejects.toThrow()      //? try with short password only

    wuser.password = undefined
    await expect(User.create(wuser)).rejects.toThrow()      //? try without password

    wuser.password = "12345678"
    wuser.username = "a"
    await expect(User.create(wuser)).rejects.toThrow()      //? try with short username only
    

    //-- Create a normal user

    let nuser = {                                               //. Normal user data
      username: "TEST_" + 
                  (new Date()).valueOf().toString().substring(5),
      password: "12345678"
    }

    let user = await User.create(nuser)                     //. create a user with data
    expect(user).toBeDefined()                                  //? control is it defined
    await expect(User.create(nuser)).rejects.toThrow()      //? try to recreate same user


    //-- Login with new user
    nuser.password = "12345678"
    let cuser = await User.login(nuser)
    expect(cuser).toBeDefined()                                 //? try to login with created user
    expect(Object.keys(Globals.auth_tokens).length).toBe(1)     //? control the saved token length
    expect(Globals.auth_tokens[cuser.token]).toBeDefined()      //? control the token exists

    expect(User.tokenLogin(cuser.token)).toBeDefined()          //? try to login with token

    nuser.password = "1234"
    await expect(User.login(nuser)).rejects.toThrow()           //? try to login with wrong pass

    expect(await user.removeUser()).toBeDefined()               //? try to delete user

  });



  test('Current', async () => {

    //-- Try to create with wrong inputs

    await expect(Current.create()).rejects.toThrow()                    //? try without detail
    await expect(Current.create({id: 1})).rejects.toThrow()             //? try without name
    await expect(Current.create({name: 1})).rejects.toThrow()           //? try with integer name

    //-- Try to create and update a current

    let current = await Current.create({name: "RT-TEST_"})
    expect(current).toBeDefined()                                       //? control the current
    expect(await Current.get(current.id)).toStrictEqual(current)        //? compare with get current

    await expect(Current.create({id: current.id, name:"RT-TEST_"}))     //? try to create with same id
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

});


