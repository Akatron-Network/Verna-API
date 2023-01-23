import { User } from "./user";
import { PrismaClient } from '@prisma/client'
import { Globals } from "../libraries/globals";

//-- Clear test users
afterAll(async () => {
  const prisma = new PrismaClient()
  await prisma.User.deleteMany({ where: { username: { startsWith: "test_" } } })

  await prisma.$disconnect()
})


test('User', async () => {

  //-- Wrong inputs to create user

  let wuser = {
    username: "a",
    password: "b"
  }
  await expect(User.createUser(wuser)).rejects.toThrow()      //? try with short username and password
  
  wuser.username = "abcdef"
  await expect(User.createUser(wuser)).rejects.toThrow()      //? try with short password only

  wuser.password = undefined
  await expect(User.createUser(wuser)).rejects.toThrow()      //? try without password

  wuser.password = "12345678"
  wuser.username = "a"
  await expect(User.createUser(wuser)).rejects.toThrow()      //? try with short username only
  

  //-- Create a normal user

  let nuser = {                                               //. Normal user data
    username: "TEST_" + 
                (new Date()).valueOf().toString().substring(5),
    password: "12345678"
  }

  let user = await User.createUser(nuser)                     //. create a user with data
  expect(user).toBeDefined()                                  //? control is it defined
  await expect(User.createUser(nuser)).rejects.toThrow()      //? try to recreate same user


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
