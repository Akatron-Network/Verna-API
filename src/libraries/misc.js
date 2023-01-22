
//* Gives Date as yyyy-mm-dd
//. Returns string
export function getDateString () {
  var now = new Date();
  var dd = String(now.getDate()).padStart(2, '0');
  var mm = String(now.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = now.getFullYear();

  return yyyy + "-" + mm + "-" + dd
}


//* Gives Time as hh:mm:ss
//. Returns string
export function getTimeString () {
  var now = new Date();
  var hour = String(now.getHours()).padStart(2, '0')
  var min = String(now.getMinutes()).padStart(2, '0')
  var sec = String(now.getSeconds()).padStart(2, '0')

  return hour + ":" + min + ":" + sec
}

//-- Json Key Control
//. Throws error if not ok
export function jsonKeyControl(json_object, required_keys, forbidden_keys) {
  if (required_keys) for (let k of required_keys) {     //? loop required keys
    if (!Object.keys(json_object).includes(k))          //. control the key
      throw new Error(k + ' not found.')                //! throw error
  }
  if (forbidden_keys) for (let k of forbidden_keys) {   //? Loop forbidden keys
    if (Object.keys(json_object).includes(k))           //. control the key
      throw new Error(k + ' cannot use.')               //! throw error
  }
}
