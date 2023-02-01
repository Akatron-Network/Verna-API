
export var task_step_create_schema = {
  type: "object",
  properties: {
    id                    : { type: "integer" },
    task_id               : { type: "integer" },
    order                 : { type: "integer" },
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
    planned_finish_date   : { type: "string", format: "date-time" },
    assigned_username     : { type: "string" },
    task_steps            : { type: "array", items: task_step_create_schema },
    registry_date         : { type: "string", format: "date-time" },
    registry_username     : { type: "string" },
  },
  required: ['order_id', 'task_steps'],
  additionalProperties: false
}


