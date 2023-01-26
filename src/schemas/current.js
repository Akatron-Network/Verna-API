export var current_create_schema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    name: { type: "string", minLength: 2, maxLength: 50 },
    address: { type: "string", maxLength: 500 },
    province: { type: "string", maxLength: 100 },
    district: { type: "string", maxLength: 100 },
    tax_office: { type: "string", maxLength: 150 },
    tax_no: { type: "string", maxLength: 50 },
    identification_no: { type: "string", maxLength: 50 },
    phone: { type: "string", maxLength: 50 },
    phone_2: { type: "string", maxLength: 50 },
    mail: { type: "string", format: "email" },
    description: { type: "string", maxLength: 250 },
    code_1: { type: "string", maxLength: 50 },
    code_2: { type: "string", maxLength: 50 },
    code_3: { type: "string", maxLength: 50 },
    code_4: { type: "string", maxLength: 50 },
    registry_date: { type: "string", format: "date-time" },
    registry_username: { type: "string" },
  },
  required: ['name'],
  additionalProperties: false
}


export var current_get_schema = { type: "integer" }

export var current_update_schema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 2, maxLength: 50 },
    address: { type: "string", maxLength: 500 },
    province: { type: "string", maxLength: 100 },
    district: { type: "string", maxLength: 100 },
    tax_office: { type: "string", maxLength: 150 },
    tax_no: { type: "string", maxLength: 50 },
    identification_no: { type: "string", maxLength: 50 },
    phone: { type: "string", maxLength: 50 },
    phone_2: { type: "string", maxLength: 50 },
    mail: { type: "string", format: "email" },
    description: { type: "string", maxLength: 250 },
    code_1: { type: "string", maxLength: 50 },
    code_2: { type: "string", maxLength: 50 },
    code_3: { type: "string", maxLength: 50 },
    code_4: { type: "string", maxLength: 50 },
    update_date: { type: "string", format: "date-time" },
    update_username: { type: "string" },
  },
  additionalProperties: false
}
