import * as dotenv from 'dotenv'
dotenv.config()

//* Gives Date as yyyy-mm-dd
//. Returns string
export function getDateString () {

  var now = new Date();
  var dd = String(now.getDate()).padStart(2, '0');        //. day
  var mm = String(now.getMonth() + 1).padStart(2, '0');   //. month
  var yyyy = now.getFullYear();                           //. year

  return yyyy + "-" + mm + "-" + dd                       //r YYYY-MM-DD

}


//* Gives Time as hh:mm:ss
//. Returns string
export function getTimeString () {

  var now = new Date();
  var hour = String(now.getHours()).padStart(2, '0')      //. hour
  var min = String(now.getMinutes()).padStart(2, '0')     //. minute
  var sec = String(now.getSeconds()).padStart(2, '0')     //. second

  return hour + ":" + min + ":" + sec                     //r HH:MM:SS

}

//-- Json Key Control
//. Throws error if not ok
export function jsonKeyControl(json_object, required_keys, forbidden_keys) {
  
  if (required_keys) for (let k of required_keys) {         //? loop required keys
    if (!Object.keys(json_object).includes(k))              //. control the key
      throw new Error(k + ' not found.')                    //! throw error
  }
  if (forbidden_keys) for (let k of forbidden_keys) {       //? Loop forbidden keys
    if (Object.keys(json_object).includes(k))               //. control the key
      throw new Error(k + ' cannot use.')                   //! throw error
  }

}

//* Random string generator
//. Example use:
//. var random = randstr(5) // gives 5 chars random string
//  Returns string

export function randStr(length, enableSymbols = true) {
  
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  if (enableSymbols) { characters += '_-*+()[]{}|&%!'; }
  var charactersLength = characters.length;
  
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;

}
