var colors = require('colors/safe');
var program = require('commander');
var configParameter = require('./config.js');

var enable_console = 0;

program
  .version('2.0.0')
  .option('-l, --log', 'Activate the log of actions on console.')
  .option('-p, --port [type]', 'Select port of HTTPS server [' + configParameter.port +'].', configParameter.port)
  .parse(process.argv);



//------------------SERVER STARTUP-----------------------//
console.log(colors.bgYellow("--------HTTPS SERVER-----------"));
console.log(" ");

if (program.log){

	console.log(colors.cyan(" - Server log active"));
	enable_console=program.log;
} 

if (program.port){

	configParameter.port = parseInt(program.port,10);
	console.log(colors.cyan(" - HTTPS server port: ") + configParameter.port);
}

console.log(" ");
console.log(colors.bgYellow("-------------------------------"));


console.log(new Date(Date.now() + 999999999999999));