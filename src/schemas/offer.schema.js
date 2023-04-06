
export var offer_create_schema = {
  type: "object",
  properties: {
    id                    : { type: "integer" },
    current_id            : { type: "integer" },
    unregistered_current  : { type: "object" },
    date                  : { type: "string", format: "date-time" },
    delivery_date         : { type: "string", format: "date-time" },
    order_source          : { type: ["string", "null"] },
    invoiced              : { type: "boolean" },
    printed               : { type: "boolean" },
    total_fee             : { type: "number" },
    code_1                : { type: ["string", "null"] },
    code_2                : { type: ["string", "null"] },
    code_3                : { type: ["string", "null"] },
    code_4                : { type: ["string", "null"] },
    registry_date         : { type: "string", format: "date-time" },
    registry_username     : { type: "string" },
    items                 : { type: "array" },
  },
  required: ['total_fee', 'items'],
  additionalProperties: false
}

export var offer_get_schema = { type: "integer" }

export var offer_update_schema = {
  type: "object",
  properties: {
    current_id            : { type: "integer" },
    unregistered_current  : { type: "object" },
    date                  : { type: "string", format: "date-time" },
    delivery_date         : { type: "string", format: "date-time" },
    order_source          : { type: "string" },
    invoiced              : { type: "boolean" },
    printed               : { type: "boolean" },
    total_fee             : { type: "number" },
    code_1                : { type: "string" },
    code_2                : { type: "string" },
    code_3                : { type: "string" },
    code_4                : { type: "string" },
    update_date           : { type: "string", format: "date-time" },
    update_username       : { type: "string" },
    items                 : { type: "array" },
  },
  additionalProperties: false
}






export var offerItem_create_schema = {
  type: "object",
  properties: {
    id                : { type: "integer" },
    row               : { type: "integer" },
    offer_id          : { type: "integer" },
    stock_id          : { type: "integer" },
    unit              : { type: ["string", "null"], maxLength: 50 },
    amount            : { type: "number" },
    price             : { type: "number" },
    tax_rate          : { type: "number" },
    description       : { type: ["string", "null"], maxLength: 500 },
    registry_date     : { type: "string", format: "date-time" },
    registry_username : { type: "string" },
  },
  required: ['offer_id', 'stock_id', 'amount', 'price'],
  additionalProperties: false
}


export var offerItem_get_schema = { type: "integer" }

export var offerItem_update_schema = {
  type: "object",
  properties: {
    row               : { type: "integer" },
    offer_id          : { type: "integer" },
    stock_id          : { type: "integer" },
    unit              : { type: ["string", "null"], maxLength: 50 },
    amount            : { type: "number" },
    price             : { type: "number" },
    tax_rate          : { type: "number" },
    description       : { type: ["string", "null"], maxLength: 500 },
  },
  additionalProperties: false
}
