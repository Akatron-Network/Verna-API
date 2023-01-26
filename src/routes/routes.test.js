import { PrismaClient } from '@prisma/client'
import { Route_Login, Route_Register } from "./auth";
import { Route_Current } from './current';
import { Globals } from '../libraries/globals';
import { User } from '../models/user';

describe('Route Tests', () => {
  
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

    login() {
      Globals.auth_tokens['RT-Token_Test'] = new User('admin', {admin: true})
      this.req.headers = { token: 'RT-Token_Test' }
      return Globals.auth_tokens['RT-Token_Test']
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

    //-- Logout & login

    let login_route = new Route_Login()
    fresp = new FakeResp()
    fresp.req.headers = { token }

    //. logout from registered user
    let loreg_resp = await login_route.methods.DELETE(fresp, Route_Login.getUser(fresp.req))
    expect(loreg_resp.status).toBe(200)

    //. login again
    fresp = new FakeResp()
    let lreg_resp = await login_route.methods.GET(fresp, undefined, {...nuser})

    token = lreg_resp.json.Data.token
    expect(token.length).toBeGreaterThan(20)


    //-- Unregister user

    fresp = new FakeResp()
    fresp.req.headers = { token }
    let ureg_resp = await register_route.methods.DELETE(fresp, Route_Login.getUser(fresp.req))

    expect(ureg_resp.status).toBe(200)

  });


  test('Current', async () => {
    let fresp = new FakeResp();
    let current_route = new Route_Current()


    //-- Wrong inputs to current route

    await expect(current_route.methods.POST(fresp, fresp.login(), {}))
      .rejects.toThrow('instance requires property "name"')

    //todo make current route tests


  });
});


