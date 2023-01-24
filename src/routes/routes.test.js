import { PrismaClient } from '@prisma/client'
import { Route_Login, Route_Register } from "./auth";


//-- Clear test users
afterAll(async () => {
  const prisma = new PrismaClient()
  await prisma.User.deleteMany({ where: { username: { startsWith: "test_" } } })

  await prisma.$disconnect()
})

//-- Fake Response Class
class FakeResp {
  status(st) { this.status = st; return this; }
  json(js) { this.json = js; return this; }
  req = {
    ip: '::ffff:127.0.0.1'
  }
}


test('Auth', async () => {

  let fresp = new FakeResp();
  let register_route = new Route_Register()
  
  //-- Wrong inputs to register route

  await expect(register_route.methods.POST(fresp, undefined, {}))
    .rejects.toThrow('instance requires property "username"')
  
  await expect(register_route.methods.POST(fresp, undefined, {username: 'test_'}))
    .rejects.toThrow('instance requires property "password"')

  
  //-- Register with normal user

  let nuser = {                                               //. Normal user data
    username: "TEST_" + 
                (new Date()).valueOf().toString().substring(5),
    password: "12345678"
  }

  let reg_resp = await register_route.methods.POST(fresp, undefined, nuser)

  expect(reg_resp).toBeDefined()
  let token = reg_resp.json.Data.token
  expect(token).toBeDefined()
  expect(token.length).toBeGreaterThan(20)


  //todo login and logout test


  //-- Unregister user

  fresp = new FakeResp();
  fresp.req.headers = { token }
  let ureg_resp = await register_route.methods.DELETE(fresp, Route_Login.getUser(fresp.req))

  expect(ureg_resp.status).toBe(200)

});
