
//-- Order

export var order_create_schema = {
  type: "object",
  properties: {
    id                : { type: "integer" },
    current_id        : { type: "integer" },
    date              : { type: "string", format: "date-time" },
    delivery_date     : { type: "string", format: "date-time" },
    order_source      : { type: "string" },
    invoiced          : { type: "boolean" },
    printed           : { type: "boolean" },
    total_fee         : { type: "number" },
    code_1            : { type: "string" },
    code_2            : { type: "string" },
    code_3            : { type: "string" },
    code_4            : { type: "string" },
    registry_date     : { type: "string", format: "date-time" },
    registry_username : { type: "string" },
    items             : { type: "array" },
  },
  required: ['current_id', 'total_fee', 'items'],
  additionalProperties: false
}

export var order_get_schema = { type: "integer" }

export var order_update_schema = {
  type: "object",
  properties: {
    current_id        : { type: "integer" },
    date              : { type: "string", format: "date-time" },
    delivery_date     : { type: "string", format: "date-time" },
    order_source      : { type: "string" },
    invoiced          : { type: "boolean" },
    printed           : { type: "boolean" },
    total_fee         : { type: "number" },
    code_1            : { type: "string" },
    code_2            : { type: "string" },
    code_3            : { type: "string" },
    code_4            : { type: "string" },
    update_date       : { type: "string", format: "date-time" },
    update_username   : { type: "string" },
    items             : { type: "array" },
  },
  required: ['current_id', 'total_fee', 'items'],
  additionalProperties: false
}


//-- Order Item

export var orderItem_create_schema = {
  type: "object",
  properties: {
    id                : { type: "integer" },
    row               : { type: "integer" },
    order_id          : { type: "integer" },
    stock_id          : { type: "integer" },
    unit              : { type: "string", maxLength: 50 },
    amount            : { type: "number" },
    price             : { type: "number" },
    tax_rate          : { type: "number" },
    description       : { type: "string", maxLength: 500 },
    registry_date     : { type: "string", format: "date-time" },
    registry_username : { type: "string" },
  },
  required: ['order_id', 'stock_id', 'amount', 'price'],
  additionalProperties: false
}


export var orderItem_get_schema = { type: "integer" }

export var orderItem_update_schema = {
  type: "object",
  properties: {
    row               : { type: "integer" },
    order_id          : { type: "integer" },
    stock_id          : { type: "integer" },
    unit              : { type: "string", maxLength: 50 },
    amount            : { type: "number" },
    price             : { type: "number" },
    tax_rate          : { type: "number" },
    description       : { type: "string", maxLength: 500 },
  },
  additionalProperties: false
}
