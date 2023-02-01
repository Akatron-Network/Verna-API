export var stock_create_schema = {
  type: "object",
  properties: {
    id                : { type: "integer" },
    name              : { type: "string", minLength: 2, maxLength: 50 },
    material          : { type: "string", maxLength: 50 },
    product_group     : { type: "string", maxLength: 50 },
    unit              : { type: "string", maxLength: 50 },
    unit_2            : { type: "string", maxLength: 50 },
    conversion_rate   : { type: "number" },
    buy_price         : { type: "number" },
    sell_price        : { type: "number" },
    code_1            : { type: "string", maxLength: 50 },
    code_2            : { type: "string", maxLength: 50 },
    code_3            : { type: "string", maxLength: 50 },
    code_4            : { type: "string", maxLength: 50 },
    registry_date     : { type: "string", format: "date-time" },
    registry_username : { type: "string" },
  },
  required: ['name'],
  additionalProperties: false
}

export var stock_get_schema = { type: "integer" }


export var stock_update_schema = {
  type: "object",
  properties: {
    name              : { type: "string", minLength: 2, maxLength: 50 },
    material          : { type: "string", maxLength: 50 },
    product_group     : { type: "string", maxLength: 50 },
    unit              : { type: "string", maxLength: 50 },
    unit_2            : { type: "string", maxLength: 50 },
    conversion_rate   : { type: "number" },
    buy_price         : { type: "number" },
    sell_price        : { type: "number" },
    code_1            : { type: "string", maxLength: 50 },
    code_2            : { type: "string", maxLength: 50 },
    code_3            : { type: "string", maxLength: 50 },
    code_4            : { type: "string", maxLength: 50 },
    update_date       : { type: "string", format: "date-time" },
    update_username   : { type: "string" },
  },
  additionalProperties: false
}
