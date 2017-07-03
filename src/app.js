'use strict';
var fs = require('fs');
var http = require('http');
var jwt    = require('jsonwebtoken');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var _ = require('underscore');
var configParameter =require('./config.js');
var nodemailer = require('nodemailer');
var my_ejs = require('ejs');
var mysql = require('mysql');
var crypto = require('crypto');
var colors = require('colors/safe');
var program = require('commander');

//------------------MAIN SYSTEM FUNCTIONS-----------------------//

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

function TimeExpire(){
    var expire = new Date(Date.now() + 300000);
    var stringtime = expire.getHours() + ":" + expire.getMinutes() + ":" + expire.getSeconds();
    return stringtime.toString().split(":");
}

function getDateTime_email() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    
	return    day + "/" + month + "/" + year + " - " + hour + ":" + min + ":" + sec;

}

function search(array,item){
    for(var i = 0; i< array.length; i++ )
    {
        if(array[i] === item)
        {
            return true;
        }
    }
    return false;
}

function searchUser(array,obj){
    var user = _.where(array,obj) || [];
    if(_.isEmpty(user))//token not found
    {
        return false;
    }
    else
    {
        return true;
    }
}

function PopUser(array,username){
    for(var i = 0; array.length; i++) 
    {
        if(array[i].username === username)
        {   
            array = array.splice(i,1);
            break;
        }
        
    }
}

function UpdateToken(array,oldToken,newToken){
    for(var i = 0; array.length; i++) 
    {
        if(array[i].token === oldToken)
        {            
            array[i].token = newToken;
            break;
        }
        
    }
}

function UpdateUser(array,token,new_data){
    for(var i = 0; array.length; i++) 
    {
        if(array[i].token === token)
        {            
            array[i].uname = new_data.uname;
            array[i].ulastname = new_data.ulastname;
            array[i].pass = new_data.pass;
            break;
        }
        
    }
}

function indexSearch(array,item){
    for(var i = 0; i< array.length; i++ )
    {
        if(array[i] === item)
        {
            return i;
        }
    }
    return undefined;
}

function consoleLogError(enable,part,description) {
	if(enable)
	{
		console.log(colors.red("->ERROR(") + colors.yellow(part) + colors.red("): ")+ colors.magenta(description));
	}	
	return;
}

function consoleLOG(enable,part,description) {
	if(enable)
	{
		console.log(colors.green("->LOG(") + colors.yellow(part) + colors.green("): ")+ colors.grey(description));
	}	
	return;
}

function PopExpired(array){
    for(var i = 0; array.length; i++) 
    {
        try 
        {
            var decoded = jwt.verify(array[i].token, configParameter.secret);                               
        } 
        catch(err) 
        {
                array = array.splice(i,1);
        }  
    }
}


//------------------MAIN SYSTEM VARIABLES-----------------------//

var NewUsers = [];
var LoggedUsers = [];
var freeAccess = [
    '/',
    '/forgotpassword',
    '/login',
    '/assets',
    '/login/',
    '/forgotpassword/',
    '/register/',
    '/register',
    '/confirmation/',
    '/logout',
    '/logout/',
    '/404',
    '/api/app_th/'
]; 


//------------------SERVER STARTUP-----------------------//

program
  .version('2.0.0')
  .option('-l, --log', 'Activate the log of actions on console.')
  .option('-m, --localhost', 'runs as local host')
  .option('-p, --port [type]', 'Select port of HTTPS server [' + configParameter.port +'].', configParameter.port)
  .parse(process.argv);

console.log(colors.bgYellow("--------HTTPS SERVER-----------"));
console.log(" ");


if (program.log){

	console.log(colors.cyan(" - Server log active"));
	configParameter.log=program.log;
} 

if (program.port){

	configParameter.port = parseInt(program.port,10);
	console.log(colors.cyan(" - HTTPS server port: ") + configParameter.port);
}

if (program.localhost)
{

	console.log(colors.cyan(" - Running as local"));
	configParameter.server_addres="http://localhost:8443";
}

//---------DATABASE CONNECTION---------//

var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : configParameter.mysqladress,
  user            : configParameter.mysqluser,
  password        : configParameter.mysqlpassword,
  database        : configParameter.mysqldatabase
});
console.log(colors.cyan(" - MySQL DataBase Pool created!"));

//---------E-MAIL CONNECTION---------//

var transporter = nodemailer.createTransport({
    service: configParameter.email_service,
    auth: {
        user: configParameter.email_user,
        pass: configParameter.email_password
    }
});

transporter.verify(function(error, success) {
   if (error) 
   {
        consoleLogError(1,"E-mail", error);
        console.log(" ");
        console.log(colors.bgYellow("-------------------------------"));
   } 
   else 
   {
        console.log(colors.cyan(" - E-mail server is ready to take messages."));
        console.log(" ");
        console.log(colors.bgYellow("-------------------------------"));
   }
});

//------------------EXPRESS SERVER-----------------------//

var app = express();
app.set('view engine', 'ejs');

app.use(cookieParser()); // PARSE COOKIE
app.use(bodyParser.json()); // PARSE JSON BODY
app.use(bodyParser.urlencoded({extended: true})); // PARSE URL DATA

app.use('/assets', express.static(__dirname + '/public'));


//------------------AUTHENTICAION MIDDLEWARE-----------------------//
app.use(function(req, res, next) {  
    if(search(freeAccess,req.path)) 
    {
        consoleLOG(configParameter.log,"FREE ROUTE - Requested path:",req.path);
        next();        
    }
    else
    {   
        consoleLOG(configParameter.log,"RESTRICTED ROUTE - Requested path:",req.path);  
        if(searchUser(LoggedUsers,{token:req.cookies.accessToken}))//Search for token. if Logged and has access
        {
            consoleLOG(configParameter.log,"RESTRICTED ROUTE - ","User on list");  
            
            try {
                var decoded = jwt.verify(req.cookies.accessToken, configParameter.secret);                              
                var payload = jwt.decode(req.cookies.accessToken);             
                next();  
            } catch(err) 
            {
                    var remove_user = _.findWhere(LoggedUsers, {token:req.cookies.accessToken})
                    PopUser(LoggedUsers,remove_user.username);
                    consoleLogError(configParameter.log,"RESTRICTED ROUTE - ","COOKIE TOKEN EXPIRE");
                    res.status(404).send({ message:'Your login has expired. Please login again.'});
                    console.log(LoggedUsers);
            }            
        }
        else
        {
            if(searchUser(LoggedUsers,{token:req.query.id}))//Search for token. if Logged and has access
            {
                consoleLOG(configParameter.log,"RESTRICTED ROUTE - ","First workspace request.");  
                try {
                    var decoded = jwt.verify(req.query.id, configParameter.secret);                              
                    var payload = jwt.decode(req.query.id);                
                    next();  
                } catch(err) 
                {
                    var remove_user = _.findWhere(LoggedUsers, {token:req.query.id})
                    PopUser(LoggedUsers,remove_user.username);
                    consoleLogError(configParameter.log,"RESTRICTED ROUTE - ","ID TOKEN EXPIRE");
                    res.status(404).send({ message:'Your login has expired. Please login again.'});
                    console.log(LoggedUsers);
                }  
            }
            else
            {
                PopExpired(LoggedUsers);
                console.log(LoggedUsers);
                consoleLOG(configParameter.log,"RESTRICTED ROUTE - ","User not on list");  
                res.status(404).send({ message:'Something went wrong. Login again please.'});

            }
        }        
  }  
});

//------------------MAIN SYSTEM ROUTES-----------------------//

app.get('/', function(req,res) {
    res.render('./main/index');
});

app.get('/workspace', function(req,res) {

    if(req.cookies.accessToken===undefined)
    {
        var data_user = _.findWhere(LoggedUsers, {token:req.query.id});
        for(var i=0;i<configParameter.applications.length;i++)
        {
            if(data_user.application === configParameter.applications[i].name)
            {
                var time_to_expire = configParameter.applications[i].expire_time;
                break;
            }
        }
        var date_expire = new Date(Date.now() + time_to_expire);
        res.cookie('accessToken', req.query.id , { expires: new Date(Date.now() + time_to_expire)});// IF HTTPS put , secure: true  parameter
        if(time_to_expire===9999999999)
        {
            res.cookie('date', 'forever', { expires: new Date(Date.now() + time_to_expire)});// IF HTTPS put , secure: true  parameter
        }
        else
        {
            res.cookie('date', date_expire.getTime(), { expires: new Date(Date.now() + time_to_expire)});// IF HTTPS put , secure: true  parameter
        }
    }
    else
    {
        var data_user = _.findWhere(LoggedUsers, {token:req.cookies.accessToken});
    }

    consoleLOG(configParameter.log,"App REQ - ",data_user.application); 
    if(data_user !== undefined)
    {
        for(var i=0;i<configParameter.applications.length;i++)
        {
            if(data_user.application === configParameter.applications[i].name)
            {
                var string_app_location = './app_' + configParameter.applications[i].entryPoint + '/index_' + configParameter.applications[i].entryPoint;
                res.render(string_app_location);
                break;
            }
        }
    }
    else
    {
        res.status(404).send({ message: 'Erro on get app' }); 
    }
});

app.get('/login', function(req,res) {
    res.render('./main/login');
});

app.get('/404', function(req,res) {
        consoleLogError(configParameter.log,"ROUTE MISS - ","404");

        res.render('./main/msg_server',{label:'Warning',type:'alert alert-warning',msg:'Something went wrong. Login again please.',address:configParameter.server_addres});
});

app.get('/forgotpassword', function(req,res) {
    res.render('./main/forgotpassword');
});

app.get('/register', function(req,res) {
    res.render('./main/register');
});

app.get('/confirmation/', function (req, res) {
    
    var user = _.where(NewUsers,{ confirmationId:req.query.id}) || [];
    if(_.isEmpty(user))//token not found
    {
        consoleLogError(configParameter.log,"ROUTE CONFIRMATION ACCOUNT- ","id not found.");
        res.render('./email/confirmation',{type:'alert alert-danger',msg:'Your account could not be confirmed.',address:configParameter.server_addres});
    }
    else
    {
        if((Date.now()-user[0].expire)>900000)//15min-900000
        {
            consoleLOG(configParameter.log,"ROUTE CONFIRMATION ACCOUNT- ","Token expired. Removing from NewUsers List");
            NewUsers = _.without(NewUsers,user[0]);
            res.render('./email/confirmation',{type:'alert alert-danger',msg:'Your account could not be confirmed.',address:configParameter.server_addres}); 
        }
        else
        {
            var insert_vector = [user[0].name,user[0].lastname,user[0].username,user[0].password,user[0].application];
            pool.getConnection(function(err, connection) {
                // Use the connection 
                if (err) throw err;
                consoleLOG(configParameter.log,"DATABASE","INSERT USER");
                connection.query("INSERT INTO Usuario (uname, ulastname, username, pass, application) VALUES (?,?,?,?,?)",insert_vector,function (error, results, fields) 
                {
                    if (error) throw error;
                    if(_.isEmpty(results))
                    {
                        consoleLogError(configParameter.log,"DATABASE","COULD NOT INSERT");
                    }
                    else
                    {
                        consoleLOG(configParameter.log,"DATABASE","DONE INSERTING USER");
                    }
                });
                connection.release();
                if (err) throw err;
            });
            res.render('./email/confirmation',{type:'alert alert-success',msg:'Your account is confirmed.',address:configParameter.server_addres});
        }
    }
});

app.post('/login',function(req,res){

    console.log(LoggedUsers);

    pool.getConnection(function(err, connection) {
        // Use the connection 
        if (err) throw err;
        consoleLOG(configParameter.log,"DATABASE","SELECT USER");
        connection.query("SELECT * FROM Usuario WHERE username=?",req.body.username ,function (error, results, fields) 
        {
            if (error) throw error;
            if(_.isEmpty(results))
            {
                consoleLogError(configParameter.log,"LOGIN","USER NOT FOUND."); 
                res.status(404).send({ message: 'E-mail or password not correct!' });
            }
            else
            {
                if(req.body.password === decrypt(results[0].pass))
                {
                    consoleLOG(configParameter.log,"LOGIN","GOT USER ON DB AND PASSWORD CORRECT");
                    if(_.isEmpty(_.where(LoggedUsers,results[0])||[]))
                    {
                        for(var i=0;i<configParameter.applications.length;i++)
                        {
                            if(results[0].application === configParameter.applications[i].name)
                            {
                                var time_to_expire = configParameter.applications[i].expire_time;
                                break;
                            }
                        }
                        var string_to_expire = (time_to_expire/60000) + 'm';
                        //Generate token
                        var newtoken = jwt.sign({
                                username: results[0].username,
                                application: results[0].application
                        }, configParameter.secret , { expiresIn: string_to_expire });
                        
                        results[0].token = newtoken;                                 
                        LoggedUsers.push(results[0]);
                        //res.status(200).send({ message: 'http://www.jmbacalhau.com.br:8443/workspace?id=' + newtoken });
                        var string_send = configParameter.server_addres + '/workspace?id=' + newtoken;
                        res.status(200).send({ message: string_send });                     
                    }
                    else
                    {
                        consoleLOG(configParameter.log,"LOGIN","User already looged");
                        PopUser(LoggedUsers,results[0].username);
                        res.status(404).send({ message: 'User already logged. Close all windows and try again.' }); 
                    }   
                }
                else
                {
                    consoleLogError(configParameter.log,"LOGIN","Password not correct!"); 
                    res.status(404).send({ message: 'E-mail or password not correct!' });
                }
            }
        });
        connection.release();
        if (err) throw err;
    });
});

app.post('/forgotpassword',function(req,res){

    consoleLOG(configParameter.log,"FORGOT PASSWORD ROUTE - ",req.body.username);

    pool.getConnection(function(err, connection) {
        // Use the connection 
        if (err) throw err;
        consoleLOG(configParameter.log,"DATABASE","SELECT USER.");
        connection.query("SELECT * FROM Usuario WHERE username=?",req.body.username ,function (error, results, fields) 
        {
            if (error) throw error;
            if(_.isEmpty(results))
            {
                consoleLOG(configParameter.log,"FORGOT PASSWORD ROUTE - ","USER NOT FOUND ON DATABASE");  
                res.status(404).send({ message: 'This e-mail is not registered.' }); 
            }
            else
            {
                fs.readFile(__dirname + '/views/email/emailRecovery.ejs','utf8',function (err, data) {
                    if (err) throw err;

                    var html_string = my_ejs.render(data, { address:configParameter.server_addres,name:results[0].uname,lastname:results[0].ulastname,password:decrypt(results[0].pass)});
                    
                    var mailOptions = {
                        from: '"DataHub" <mynodeservermail@gmail.com>', // sender address
                        to: results[0].username, // list of receivers
                        subject: 'Password Recovery', // Subject line
                        html: html_string
                    };

                    // send mail with defined transport object
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            res.status(404).send({ message: 'This e-mail could not be sent. Try again later.' });
                            return consoleLogError(configParameter.log,"FORGOT PASSWORD ROUTE - E-MAIl",error);
                        }        
                            res.status(200).send({ message: 'email sent' });
                            consoleLOG(configParameter.log,"FORGOT PASSWORD ROUTE - ","E-MAIL SENT.");  
                    });                
                }); 
            }
        });            
        connection.release();
        if (err) throw err;
    });
});

app.post('/register',function(req,res){
    consoleLOG(configParameter.log,"ROUTE REGISTER - ","POST");   
    pool.getConnection(function(err, connection) {
        // Use the connection 
        if (err) throw err;
        consoleLOG(configParameter.log,"DATABASE - ","SELECT USER");   
        connection.query("SELECT * FROM Usuario WHERE username=?",req.body.username ,function (error, results, fields) 
        {
            if (error) throw error;
            if(_.isEmpty(results))
            {
                consoleLOG(configParameter.log,"ROUTE REGISTER","USER FREE");   
                var token = jwt.sign({ user: req.body.name }, 'confirmationId');
                var app_req = _.where(configParameter.applications,{ key:req.body.appkey}) || [];

                var new_user = {
                    name:req.body.name,
                    lastname:req.body.lastname,
                    username:req.body.username,
                    password:encrypt(req.body.password),
                    expire:Date.now(),
                    confirmationId:token,
                    application: 'default'
                };


                if((_.isEmpty(app_req))===false)
                {
                    new_user.application = app_req.name;
                    consoleLOG(configParameter.log,"ROUTE REGISTER","APPLICATION FOUND");  
                }
            
                NewUsers.push(new_user);
                var string_send = configParameter.server_addres + '/confirmation/?id=' + token;
                //var confirmation_link = 'http://www.jmbacalhau.com.br:8443/confirmation/?id=' + token;
                //setup email data with unicode symbols
                var confirmation_link = string_send;
            
                fs.readFile(__dirname + '/views/email/email.ejs','utf8',function (err, data) {
                    if (err) throw err;

                    var html_string = my_ejs.render(data, { name:new_user.name,lastname:new_user.lastname,link:confirmation_link});
                    //console.log(html_string);
                    var mailOptions = {
                        from: '"DataHub" <mynodeservermail@gmail.com>', // sender address
                        to: new_user.username, // list of receivers
                        subject: 'DataHub Registration', // Subject line
                        html: html_string
                    };
                    // send mail with defined transport object
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            res.status(404).send({ message: 'This e-mail could not be sent. Try again later.' });
                            return consoleLogError(configParameter.log,"REGISTER ROUTE",error);
                        }        
                            res.status(200).send({ message: 'email sent' });
                            consoleLOG(configParameter.log,"REGISTER ROUTE","E-MAIL SENT.");  
                    });                        
                });
            }
            else
            {
                res.status(404).send({ message: 'This e-mail is already in use!' });
                consoleLogError(configParameter.log,"REGISTER ROUTE","User exist.");  
            }
        });
        connection.release();
        if (err) throw err;
    });
});

app.post('/logout',function(req,res){

    var remove_user = _.findWhere(LoggedUsers, {token:req.body.token})
    if(remove_user===undefined)
    {
        res.status(404).send({ message: 'User not found' });
        consoleLogError(configParameter.log,"ROUTE LOGOUT - ","User not found to be logged out.");   
    }
    else
    {
        PopUser(LoggedUsers,remove_user.username);
        res.status(200).send({ message: 'User logged out' });
        consoleLOG(configParameter.log,"ROUTE LOGOUT - ","User logged out.");   
    }
});

app.get('/renewaccess',function(req,res){

    consoleLOG(configParameter.log,"RENEW ACCESS - ","GET");      
    var payload = jwt.decode(req.cookies.accessToken);      

    for(var i=0;i<configParameter.applications.length;i++)
    {
        if(payload.application === configParameter.applications[i].name)
        {
            var time_to_expire = configParameter.applications[i].expire_time;
            break;
        }
    }
    var string_to_expire = (time_to_expire/60000) + 'm';

    var newtoken = jwt.sign({
                username: payload.username,
                application: payload.application
    }, configParameter.secret , { expiresIn: string_to_expire });
     //UPDATE USER TOKEN ON USER LIST
    UpdateToken(LoggedUsers,req.cookies.accessToken,newtoken);
    var date_expire = new Date(Date.now() + time_to_expire);
    res.cookie('accessToken', newtoken , { expires: new Date(Date.now() + time_to_expire)});// IF HTTPS put , secure: true  parameter 
    if(time_to_expire===9999999999)
    {
        res.cookie('date', 'forever', { expires: new Date(Date.now() + time_to_expire)});// IF HTTPS put , secure: true  parameter
    }
    else
    {
        res.cookie('date', date_expire.getTime(), { expires: new Date(Date.now() + time_to_expire)});// IF HTTPS put , secure: true  parameter
    }
    res.status(200).send({message: 'OK'});
});

app.get('/myaccount', function(req,res) {
    res.render('./main/myaccount');
});

app.get('/api/userinfo',function(req,res){

    consoleLOG(configParameter.log,"USER INFO - ","GET");      
    var data_user = _.findWhere(LoggedUsers, {token:req.cookies.accessToken});
     if(data_user===undefined)
     {
        consoleLogError(configParameter.log,"USER INFO - ",'Error on finding user on LoggedUsers. on userinfo GET');      
        res.status(404).send({ message: 'Error on finding user on LoggedUsers.' }); 
     }
     else
     {
        var send_user_info = {
            name:data_user.uname,
            lastname:data_user.ulastname,
            username:data_user.username,
            app:data_user.application
        };
        res.status(200).send({ userinfo:send_user_info}); 
     }
    
});

app.post('/api/userinfo',function(req,res){

    consoleLOG(configParameter.log,"USER INFO - ","POST"); 
    var data_user = _.findWhere(LoggedUsers, {token:req.cookies.accessToken});
    if(req.body.type === 'modify')
    {
        if((req.body.old_password===undefined)&&(req.body.new_password===undefined))//Apenas nome e sobrenome
        {
            pool.getConnection(function(err, connection) {
            // Use the connection 
            if (err) throw err; 
            consoleLOG(configParameter.log,"DATABASE - ","UPDADE USER"); 
            var modify_vector = [req.body.uname, req.body.ulastname,data_user.id];
            connection.query("UPDATE Usuario SET uname=?, ulastname=? WHERE id=?",modify_vector,function (error, results, fields)
            {
                if (error) throw error;
                if(_.isEmpty(results))
                {
                    consoleLogError(configParameter.log,"DATABASE - ","Error on modify task");  
                    res.status(200).send({ message: 'Error on modify task' });                 
                }
                else
                {
                    consoleLOG(configParameter.log,"DATABASE - ","Modify user ok."); 
                    UpdateUser(LoggedUsers,req.cookies.accessToken,{ uname:req.body.uname,ulastname:req.body.ulastname,pass:data_user.pass});
                    res.status(200).send({ message: 'OK' }); 
                }
            });            
            connection.release();
            if (err) throw err;
            });
        }
        else//nome, sobrenome  e password
        {
            if(req.body.old_password === decrypt(data_user.pass))
            {
                pool.getConnection(function(err, connection) {
                // Use the connection 
                if (err) throw err; 
                consoleLOG(configParameter.log,"DATABASE - ","UPDADE USER WITH PASSWORD"); 
                var modify_vector = [req.body.uname, req.body.ulastname,encrypt(req.body.new_password),data_user.id];
                connection.query("UPDATE Usuario SET uname=?, ulastname=?, pass=? WHERE id=?",modify_vector,function (error, results, fields) 
                {
                    if (error) throw error;
                    if(_.isEmpty(results))
                    {
                        consoleLogError(configParameter.log,"DATABASE - ","Error on modify task");
                        res.status(200).send({ message: 'Error on modify task' });                 
                    }
                    else
                    {
                        consoleLOG(configParameter.log,"DATABASE - ","Modify user ok."); 
                        UpdateUser(LoggedUsers,req.cookies.accessToken,{ uname:req.body.uname,ulastname:req.body.ulastname,pass:encrypt(req.body.new_password)});
                        res.status(200).send({ message: 'OK' }); 
                    }
                });            
                connection.release();
                if (err) throw err;
                });
            }
            else
            {
                consoleLogError(configParameter.log,"USER INFO - ","Old password Not Correct.");
                res.status(200).send({ message: 'Old password Not Correct.' });   
            }
        }
    }  
    else
    {
        consoleLogError(configParameter.log,"USER INFO - ","Type of req not found.");
        res.status(404).send({ message: 'type not found' }); 
    }
});

//------------------APPLICATION ROUTES-----------------------//

//------------------CHART------------------//
app.get('/main_chart', function(req,res) {
    res.render('./app_chart/main_chart');
});

app.get('/code/app_chart/appcode_chart.js', function(req,res) {
   res.sendFile(__dirname + '/private/app_chart/appcode_chart.js');
});

app.get('/api/app_chart',function(req,res){

    consoleLOG(configParameter.log,"APP CHART ROUTE - ","GET");
    var data_user = _.findWhere(LoggedUsers, {token:req.cookies.accessToken});

    pool.getConnection(function(err, connection) {
        // Use the connection 
        if (err) throw err;
        consoleLOG(configParameter.log,"DATABASE - ","SELECT USER TASK"); 
        connection.query("SELECT * FROM Tarefas WHERE TaskOwner=? ORDER BY tarefa_due ASC ",data_user.id,function (error, results, fields) 
        {
            if (error) throw error;
            if(_.isEmpty(results))
            {
                consoleLOG(configParameter.log,"DATABASE - ","No task found for the user."); 
                res.setHeader('Content-Type', 'application/json');
                res.status(200).send(JSON.stringify(results));
            }
            else
            {
                //console.log('The result is: ', results);
                res.setHeader('Content-Type', 'application/json');
                res.status(200).send(JSON.stringify(results));
            }
        });            
        connection.release();
        if (err) throw err;
    });
    
});

app.post('/api/app_chart',function(req,res){

    consoleLOG(configParameter.log,"APP CHART ROUTE - ","POST");
    var data_user = _.findWhere(LoggedUsers, {token:req.cookies.accessToken});

    if(req.body.type === 'add')
    {
        pool.getConnection(function(err, connection) {
        // Use the connection 
        if (err) throw err; 
        consoleLOG(configParameter.log,"DATABASE - ","INSERT TASK");
        var insert_vector = [data_user.id,req.body.new_task,req.body.task_due.slice(0, 10)];
        connection.query("INSERT INTO Tarefas (TaskOwner, tarefa,tarefa_due) VALUES (?,?,?)",insert_vector,function (error, results, fields) 
        {
            if (error) throw error;
            if(_.isEmpty(results))
            {
                consoleLogError(configParameter.log,"DATABASE - ","Could not insert task."); 
                res.status(404).send({ message: 'Error on insert task' }); 
            }
            else
            {
                res.status(200).send({ message: 'Insert OK' }); 
            }
        });            
        connection.release();
        if (err) throw err;
        });

    }
    else if (req.body.type === 'remove')
    {
        pool.getConnection(function(err, connection) {
        // Use the connection 
        if (err) throw err; 

        consoleLOG(configParameter.log,"DATABASE - ","DELETE TASK");
        connection.query("DELETE FROM Tarefas WHERE id=?",req.body.remove_task,function (error, results, fields) 
        {
            if (error) throw error;
            if(_.isEmpty(results))
            {
                consoleLogError(configParameter.log,"DATABASE - ","Could not delete task."); 
                res.status(404).send({ message: 'Error on delete task' }); 
            }
            else
            {
                res.status(200).send({ message: 'delete OK' }); 
            }
        });            
        connection.release();
        if (err) throw err;
        });

    }
    else
    {   
        consoleLogError(configParameter.log,"APP CHART - ","Type of req not found.");
        res.status(404).send({ message: 'Error on type' }); 
    }
});

//------------------TEMP HUM------------------//
var temperature= [];
var humidity= [];
var count_sample = 0;

app.post('/api/app_th',function(req,res){
      
    temperature[count_sample]=req.body[0].temp;
    humidity[count_sample]=req.body[0].hum;
    consoleLOG(configParameter.log,"SAMPLE: " + count_sample ," T: " + temperature[count_sample] +" H: "+ humidity[count_sample]); 
    if(count_sample<99)
    {
        count_sample=count_sample+1;
    }
    else
    {
        count_sample=0;
    }

});

//------------------SERVER INITIATION-----------------------//
var httpServer = http.createServer(app);
httpServer.listen(configParameter.port);