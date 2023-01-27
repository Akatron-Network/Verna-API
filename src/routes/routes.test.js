import { PrismaClient } from '@prisma/client'
import { Route_Login, Route_Register } from "./auth";
import { Route_Current, Route_CurrentActivity } from './current';
import { Globals } from '../libraries/globals';
import { User } from '../models/user';

describe('Route Tests', () => {
  
  //-- Clear test users
  afterAll(async () => {
    const prisma = new PrismaClient()
    await prisma.User.deleteMany({ where: { username: { startsWith: "rt-rtest_" } } })    //d clear user data
    await prisma.Current.deleteMany({ where: { name: { startsWith: "RT-RTEST" } } })  //d clear current data

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
    
    await expect(register_route.methods.POST(fresp, undefined, {username: 'rt-rtest_'}))
      .rejects.toThrow('instance requires property "password"')

    
    //-- Register with normal user

    let nuser = {                                               //. Normal user data
      username: "RT-RTEST_" + 
                  (new Date()).valueOf().toString().substring(7),
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
    let fresp = new FakeResp()
    let current_route = new Route_Current()


    //-- Wrong inputs to current route

    await expect(current_route.methods.POST(fresp, fresp.login(), {}))
      .rejects.toThrow('instance requires property "name"')

    await expect(current_route.methods.POST(fresp, fresp.login(), {name: "a"}))
      .rejects.toThrow('instance.name does not meet minimum length of 2')

    //-- Create a current

    let curr = {
      name: "RT-RTEST" + (new Date()).valueOf().toString().substring(5)
    }

    let post_resp = await current_route.methods.POST(fresp, fresp.login(), curr)
    expect(post_resp.status).toBe(200)
    curr.id = post_resp.json.Data.id

    fresp = new FakeResp()
    let get_resp = await current_route.methods.GET(
      fresp, fresp.login(), 
      {query: {where: {name: curr.name}}}
    )
    
    expect(get_resp.json.Data[0].id).toBe(curr.id)

    fresp = new FakeResp()
    let put_resp = await current_route.methods.PUT(
      fresp, fresp.login(),
      { id: curr.id, data: { mail: "test@akatron.net" }}
    )
    expect(put_resp.status).toBe(200)
    expect(put_resp.json.Data.details.mail).toBe('test@akatron.net')

  });


  test('CurrentActivity', async () => {
    
    let fresp = new FakeResp()
    let curract_route = new Route_CurrentActivity()
    let current_route = new Route_Current()

    //-- Wrong inputs

    await expect(curract_route.methods.POST(fresp, fresp.login(), {}))
      .rejects.toThrow('instance requires property "current_id"')
    await expect(curract_route.methods.POST(fresp, fresp.login(), {current_id: 1}))
      .rejects.toThrow('instance requires property "balance"')
    
    //-- Create a current

    fresp = new FakeResp()

    let curr = {
      name: "RT-RTEST" + (new Date()).valueOf().toString().substring(5)
    }

    let post_resp = await current_route.methods.POST(fresp, fresp.login(), curr)
    expect(post_resp.status).toBe(200)
    curr = post_resp.json.Data

    //-- Create an activity

    fresp = new FakeResp()

    let curr_act_1 = (await curract_route.methods.POST(fresp, fresp.login(), {
      current_id: curr.id, balance: Math.round(Math.random()*1000000)/100  //. sth like 9776,65
    })).json.Data

    expect(curr_act_1).toBeDefined()

    //-- Update the activity

    fresp = new FakeResp()
    let curr_act_2 = (await curract_route.methods.PUT(fresp, fresp.login(), {
      id: curr_act_1.id,
      data: { balance: -1 * Math.round(Math.random()*1000000)/100 }  //. sth like -9776,65
    })).json.Data

    expect(curr_act_2).toBeDefined()

    //-- Get acts from current

    fresp = new FakeResp()
    let acts = (await curract_route.methods.GET(fresp, fresp.login(), {current_id: curr.id})).json.Data

    expect(acts.length).toBe(1)

    //-- Remove the act

    fresp = new FakeResp()
    let remresp = (await curract_route.methods.DELETE(fresp, fresp.login(), {id: curr_act_2.id})).json.Data

    console.log(remresp);

    //-- Get acts from current

    fresp = new FakeResp()
    let acts2 = (await curract_route.methods.GET(fresp, fresp.login(), {current_id: curr.id})).json.Data

    expect(acts2.length).toBe(0)

  });
});


