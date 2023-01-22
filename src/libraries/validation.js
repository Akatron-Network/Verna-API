import { Validator } from "jsonschema";

export function validate(instance, valiation_schema) {
  const v = new Validator();
  const v_resp = v.validate(instance, valiation_schema)
  
  if (v_resp.errors.length == 0) return true
  else {
    throw new Error(v_resp.errors[0])
  }
}
