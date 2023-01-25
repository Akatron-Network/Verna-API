export var current_create_schema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    name: { 
      type: "string",
      minLength: 2,
      maxLength: 50
    },
    address: { 
      type: "string", 
      maxLength: 500
    },
    province: { 
      type: "string", 
      maxLength: 100
    },
    district: { 
      type: "string", 
      maxLength: 100
    },
    tax_office: { 
      type: "string", 
      maxLength: 150
    },
    tax_no: { 
      type: "string", 
      maxLength: 50
    },
    identification_no: { 
      type: "string", 
      maxLength: 50
    },
    phone: { 
      type: "string", 
      maxLength: 50
    },
    mail: { 
      type: "string", 
      format: "email"
    },
  },
  required: ['name']
}


export var current_get_schema = { type: "integer" }

export var current_update_schema = {
  type: "object",
  properties: {
    name: { 
      type: "string",
      minLength: 2,
      maxLength: 50
    },
    address: { 
      type: "string", 
      maxLength: 500
    },
    province: { 
      type: "string", 
      maxLength: 100
    },
    district: { 
      type: "string", 
      maxLength: 100
    },
    tax_office: { 
      type: "string", 
      maxLength: 150
    },
    tax_no: { 
      type: "string", 
      maxLength: 50
    },
    identification_no: { 
      type: "string", 
      maxLength: 50
    },
    phone: { 
      type: "string", 
      maxLength: 50
    },
    mail: { 
      type: "string", 
      format: "email"
    },
  },
  not: {
    required: [ "id" ]
  }
}
