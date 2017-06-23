var crypto = require('crypto');
var configParameter =require('./config.js');

function encrypt(text){
  var cipher = crypto.createCipher(configParameter.algorithm,configParameter.password);
  var crypted = cipher.update(text,'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
}
 
function decrypt(text){
  var decipher = crypto.createDecipher(configParameter.algorithm,configParameter.password);
  var dec = decipher.update(text,'hex','utf8');
  dec += decipher.final('utf8');
  return dec;
}

console.log(encrypt('OLA MUNDO'));
console.log(encrypt('bacalhau'));
console.log(encrypt('1'));

console.log(decrypt(encrypt('OLA MUNDO')));
