import { User } from "./user";

test('Create User', async () => {

  //-- Create a normal user

  let nuser = {                                                           //. Normal user data
    username: "TEST_" + (new Date()).valueOf().toString().substring(8),
    password: "12345678"
  }

  let user = await User.createUser(nuser)                     //. create a user with data
  expect(user).toBeDefined()                                  //? control is it defined

  await expect(User.createUser(nuser)).rejects.toThrow()      //? try to recreate same user
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
