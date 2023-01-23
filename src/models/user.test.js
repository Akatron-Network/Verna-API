import { User } from "./user";
import { PrismaClient } from '@prisma/client'

//-- Clear test users
afterAll(async () => {
  const prisma = new PrismaClient()
  await prisma.User.deleteMany({ where: { username: { startsWith: "test_" } } })

  await prisma.$disconnect()
})


test('User', async () => {

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
  expect(await User.login(nuser)).toBeDefined()               //? try to login with created user

  nuser.password = "1234"
  await expect(User.login(nuser)).rejects.toThrow()           //? try to login with wrong pass

  expect(await user.removeUser()).toBeDefined()               //? try to delete user

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
  

  
});

