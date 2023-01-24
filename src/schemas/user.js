export var user_register_schema = {
  type: "object",
  properties: {
    username: { 
      type: "string", 
      minLength: 4,
      maxLength: 15 
    },
    password: { 
      type: "string",
      minLength: 8,
      maxLength: 25 
    },
    displayname: { type: "string" },
    permissions: { type: "object" },
    admin: { type: "boolean" },
    register_ip: {
      type: "string",
      format: "ipv4"
    }
  },
  required: ['username', 'password']
}


export var user_login_schema = {
  type: "object",
  properties: {
    username: { 
      type: "string", 
      minLength: 4,
      maxLength: 15 
    },
    password: { 
      type: "string",
      minLength: 8,
      maxLength: 25 
    },
    ip: {
      type: "string",
      format: "ipv4"
    }
  },
  required: ['username', 'password']
}
