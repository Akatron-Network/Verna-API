
export var task_step_create_schema = {
  type: "object",
  properties: {
    row                   : { type: "integer" },
    name                  : { type: "string", maxLength: 100 },
    responsible_username  : { type: "string" },
    planned_finish_date   : { type: "string", format: "date-time" }
  },
  required: ['name', 'responsible_username', 'planned_finish_date'],
  additionalProperties: false
}


export var task_create_schema = {
  type: "object",
  properties: {
    id                    : { type: "integer" },
    order_id              : { type: "integer" },
    description           : { type: "string", maxLength: 500 },
    planned_finish_date   : { type: "string", format: "date-time" },
    assigned_username     : { type: "string" },
    task_steps            : { type: "array", items: task_step_create_schema },
    registry_date         : { type: "string", format: "date-time" },
    registry_username     : { type: "string" },
  },
  required: ['order_id', 'task_steps'],
  additionalProperties: false
}




export var task_get_schema = { type: "integer" }



export var task_step_update_schema = {
  type: "object",
  properties: {
    row                   : { type: "integer" },
    name                  : { type: "string", maxLength: 100 },
    state                 : { type: "string" },
    responsible_username  : { type: "string" },
    planned_finish_date   : { type: "string", format: "date-time" },
    complate_description  : { type: "string", maxLength: 500 },
    start_date            : { type: "string", format: "date-time" },
    complate_date         : { type: "string", format: "date-time" },
  },
  additionalProperties: false
}

export var task_log_update_schema = {
  type: "object",
  properties: {
    explanation           : { type: "string" }
  }
}


export var task_update_schema = {
  type: "object",
  properties: {
    description           : { type: "string", maxLength: 500 },
    planned_finish_date   : { type: "string", format: "date-time" },
    assigned_username     : { type: "string" },
    previous_step_id      : { type: "integer" },
    current_step_id       : { type: "integer" },
    next_step_id          : { type: "integer" },
    update_date           : { type: "string", format: "date-time" },
    update_username       : { type: "string" },
  },
  additionalProperties: false
}



export var task_step_complate_schema = {
  type: "object",
  properties: {
    complate_description  : { type: "string", maxLength: 500 },
    registry_username     : { type: "string" },
  },
  additionalProperties: false
}


export var task_step_cancel_schema = {
  type: "object",
  properties: {
    description           : { type: "string", maxLength: 500 },
    registry_username     : { type: "string" },
  },
  additionalProperties: false
}


export var task_cancel_schema = {
  type: "object",
  properties: {
    description           : { type: "string", maxLength: 500 },
    registry_username     : { type: "string" },
  },
  additionalProperties: false
}
