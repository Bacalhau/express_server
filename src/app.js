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

function search(array,item)
{
    for(var i = 0; i< array.length; i++ )
    {
        if(array[i] === item)
        {
            return true;
        }
    }
    return false;
}

function searchUser(array,obj)
{
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

function PopUser(array,username)
{
    for(var i = 0; array.length; i++) 
    {
        console.log('Iteration: ' + i);
        if(array[i].username === username)
        {   
            console.log('User found: ' + i);
            array = array.splice(i,1);
            break;
        }
        
    }
}

function UpdateToken(array,oldToken,newToken)
{
    for(var i = 0; array.length; i++) 
    {
        console.log('Iteration: ' + i);
        if(array[i].token === oldToken)
        {            
            array[i].token = newToken;
            break;
        }
        
    }
}

function indexSearch(array,item)
{
    for(var i = 0; i< array.length; i++ )
    {
        if(array[i] === item)
        {
            return i;
        }
    }
    return undefined;
}

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
    '/logout/'
]; 

//MySQL database connection
var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'bacalhau',
  password        : '123456',
  database        : 'datahub'
});

console.log('MySQL Pool created!');
var port = process.env.PORT || 8443;

//#g@a12*97H
//datahubserver@hotmail.com
// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: 'joaomarcusbacalhau@hotmail.com',
        pass: ''
    }
});

var app = express();
app.set('view engine', 'ejs');

//MIDDLEWARE
app.use(cookieParser());

app.use('/assets', express.static(__dirname + '/public'));

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
})); 

app.use(function(req, res, next) {  
    console.log("MIDDLEWAR - Requested path: " + req.path);  
    if(search(freeAccess,req.path)) 
    {
        console.log("ON FREE ACCESS LIST");
        next();        
    }
    else
    {
        console.log("Restricted area - Logged users: ");      
        console.log(LoggedUsers); 
        if(searchUser(LoggedUsers,{token:req.cookies.accessToken}))//Search for token. if Logged and has access
        {
            console.log('User on list');

            try {
                var decoded = jwt.verify(req.cookies.accessToken, configParameter.secret);                              
                var payload = jwt.decode(req.cookies.accessToken);             
                next();  
            } catch(err) 
            {
                    var remove_user = _.findWhere(LoggedUsers, {token:req.cookies.accessToken})
                    LoggedUsers = _.without(LoggedUsers,remove_user);
                    console.log('Token expired');
                    //IF LOGIN render page of token expire if not send message
                     res.render('./main/msg_server',{label:'Warning',type:'alert alert-warning',msg:'Your login has expired. Please login again.'});
            }            
        }
        else
        {
            if(searchUser(LoggedUsers,{token:req.query.id}))//Search for token. if Logged and has access
            {
                try {
                    console.log('First workspace request.');
                    var decoded = jwt.verify(req.query.id, configParameter.secret);                              
                    var payload = jwt.decode(req.query.id);                
                    next();  
                } catch(err) 
                {
                    var remove_user = _.findWhere(LoggedUsers, {token:req.query.id})
                    LoggedUsers = _.without(LoggedUsers,remove_user);
                    console.log('Token expired');
                    res.render('./main/msg_server',{label:'Warning',type:'alert alert-warning',msg:'Your login has expired. Please login again.'});
                }  
            }
            else
            {
                console.log('Tokenlist');
                res.render('./main/msg_server',{label:'Warning',type:'alert alert-warning',msg:'Something went wrong. Login again please.'});
            }
            
        }        
  }  
});

app.get('/main_chart', function(req,res) {
    res.render('./app_chart/main_chart');
});

app.get('/', function(req,res) {
    res.render('./main/index');
});

app.get('/myaccount', function(req,res) {
    res.render('./main/myaccount');
});

app.get('/code/app_chart/appcode_chart.js', function(req,res) {
   res.sendFile(__dirname + '/private/app_chart/appcode_chart.js');
});

app.get('/workspace', function(req,res) {

    if(req.cookies.accessToken===undefined)
    {
        res.cookie('accessToken', req.query.id , { expires: new Date(Date.now() + 300000)});// IF HTTPS put , secure: true  parameter
    } 
    res.render('./app_chart/index2');   
});

app.get('/login', function(req,res) {
    res.render('./main/login');
});

app.get('/forgotpassword', function(req,res) {
    res.render('./main/forgotpassword');
});

app.get('/register', function(req,res) {
    res.render('./main/register');
});

//https://localhost:8443/confirmation/?id=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiam9hbyIsImlhdCI6MTQ5NDgxNDE2Mn0.mse9BRZx-j1SXRDfeCCzwAnW-dmozeQtky7E8iGA6II
app.get('/confirmation/', function (req, res) {
    
    console.log('Confirmation link');
    console.log(req.query);

    var user = _.where(NewUsers,{ confirmationId:req.query.id}) || [];
    if(_.isEmpty(user))//token not found
    {
        console.log('Token not found');
        res.render('./email/confirmation',{type:'alert alert-danger',msg:'Your account could not be confirmed.'});
    }
    else
    {
        console.log(Date.now()-user[0].expire);
        if((Date.now()-user[0].expire)>900000)//15min-900000
        {
            console.log('Token expired. Removing from NewUsers List');
            NewUsers = _.without(NewUsers,user[0]);
            console.log('NewUsers List:');
            console.log(NewUsers);
            res.render('./email/confirmation',{type:'alert alert-danger',msg:'Your account could not be confirmed.'}); 
        }
        else
        {
            var insert_vector = [user[0].name,user[0].lastname,user[0].username,user[0].password,user[0].application];
            console.log(insert_vector);
            pool.getConnection(function(err, connection) {
                // Use the connection 
                if (err) throw err;
                console.log('Going to DataBase.');
                connection.query("INSERT INTO Usuario (uname, ulastname, username, pass, application) VALUES (?,?,?,?,?)",insert_vector,function (error, results, fields) 
                {
                    if (error) throw error;
                    if(_.isEmpty(results))
                    {
                        console.log('Not Insert');
                    }
                    else
                    {
                        console.log('The result is: ', results);
                    }
                });
                connection.release();
                if (err) throw err;
            });
            res.render('./email/confirmation',{type:'alert alert-success',msg:'Your account is confirmed.'});
        }
    }
});


app.post('/login',function(req,res){

    console.log("POST RECEIVED");
    pool.getConnection(function(err, connection) {
        // Use the connection 
        if (err) throw err;
        console.log('Going to DataBase.');
        connection.query("SELECT * FROM Usuario WHERE username=?",req.body.username ,function (error, results, fields) 
        {
            if (error) throw error;
            if(_.isEmpty(results))
            {
                console.log("user not found");   
                res.status(404).send({ message: 'E-mail or password not correct!' });
            }
            else
            {
                console.log('The result is: ', results);
                if(req.body.password === results[0].pass)
                {
                    console.log('PASSWORD CORRECT');
                    if(_.isEmpty(_.where(LoggedUsers,results[0])||[]))
                    {
                        //Generate token
                        var newtoken = jwt.sign({
                                username: results[0].username,
                                application: results[0].application
                        }, configParameter.secret , { expiresIn: '5m' });
                        
                        results[0].token = newtoken;                                 
                        LoggedUsers.push(results[0]);
                        res.status(200).send({ message: 'http://localhost:8443/workspace?id=' + newtoken });
                        console.log("TOKEN SENT");                       
                    }
                    else
                    {
                        console.log('User already looged');
                        PopUser(LoggedUsers,results[0].username);
                        console.log(LoggedUsers);
                        res.status(404).send({ message: 'User already logged. Close all windows and try again.' }); 
                    }   
                }
            }
        });
        connection.release();
        if (err) throw err;
    });
});

app.post('/forgotpassword',function(req,res){

    console.log("POST RECEIVED PASSWORD FORGOT");
    console.log(req.body.username);

    pool.getConnection(function(err, connection) {
        // Use the connection 
        if (err) throw err;
        console.log('Going to DataBase');
        connection.query("SELECT * FROM Usuario WHERE username=?",req.body.username ,function (error, results, fields) 
        {
            if (error) throw error;
            if(_.isEmpty(results))
            {
                console.log("user not found");   
                res.status(404).send({ message: 'This e-mail is not registered.' }); 
            }
            else
            {
                console.log('The result is: ', results);
                fs.readFile(__dirname + '/views/email/emailRecovery.ejs','utf8',function (err, data) {
                    if (err) throw err;

                    var html_string = my_ejs.render(data, { name:results[0].uname,lastname:results[0].ulastname,password:results[0].pass});
                    console.log(html_string);
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
                            return console.log(error);
                        }        
                            res.status(200).send({ message: 'email sent' });
                            console.log('email sent');
                        console.log('Message %s sent: %s', info.messageId, info.response);
                    });                
                }); 
            }
        });            
        connection.release();
        if (err) throw err;
    });
});


app.post('/register',function(req,res){
    console.log(req.body);
    pool.getConnection(function(err, connection) {
        // Use the connection 
        if (err) throw err;
        console.log('Going to DataBase.');
        connection.query("SELECT * FROM Usuario WHERE username=?",req.body.username ,function (error, results, fields) 
        {
            if (error) throw error;
            if(_.isEmpty(results))
            {
                console.log('User Free');
                var token = jwt.sign({ user: req.body.name }, 'confirmationId');
                var app_req = _.where(configParameter.applications,{ key:req.body.appkey}) || [];

                var new_user = {
                    name:req.body.name,
                    lastname:req.body.lastname,
                    username:req.body.username,
                    password:req.body.password,
                    expire:Date.now(),
                    confirmationId:token,
                    application: 'default'
                };


                if((_.isEmpty(app_req))===false)
                {
                    new_user.application = app_req.name;
                    console.log('Application Found')
                }
            
                NewUsers.push(new_user);
                var confirmation_link = 'http://localhost:8443/confirmation/?id=' + token;
                // setup email data with unicode symbols
            
                fs.readFile(__dirname + '/views/email/email.ejs','utf8',function (err, data) {
                    if (err) throw err;

                    var html_string = my_ejs.render(data, { name:new_user.name,lastname:new_user.lastname,link:confirmation_link});
                    console.log(html_string);
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
                            return console.log(error);
                        }        
                            res.status(200).send({ message: 'email sent' });
                            console.log('email sent');
                        console.log('Message %s sent: %s', info.messageId, info.response);
                    });                        
                });
            }
            else
            {
                res.status(404).send({ message: 'This e-mail is already in use!' });
                console.log('user exist');
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
        console.log('user not found');
    }
    else
    {
        console.log(LoggedUsers);
        PopUser(LoggedUsers,remove_user.username);
        res.status(200).send({ message: 'User logged out' });
        console.log('user logged out');
        console.log(LoggedUsers);
    }
});


app.get('/renewaccess',function(req,res){

    console.log("TOKEN RENEW");     
    var payload = jwt.decode(req.cookies.accessToken);      
    var newtoken = jwt.sign({
                username: payload.username,
                application: payload.application
    }, configParameter.secret , { expiresIn: '5m' });
     //UPDATE USER TOKEN ON USER LIST
    UpdateToken(LoggedUsers,req.cookies.accessToken,newtoken);
    res.cookie('accessToken', newtoken , { expires: new Date(Date.now() + 300000)});// IF HTTPS put , secure: true  parameter
    res.status(200).send({message: 'OK'});
});


app.get('/api/app_chart',function(req,res){

    console.log("API GET");     
    var data_user = _.findWhere(LoggedUsers, {token:req.cookies.accessToken});
     console.log(data_user);
    //console.log(data_user);
    
    pool.getConnection(function(err, connection) {
        // Use the connection 
        if (err) throw err;
        console.log('Going to DataBase');
        connection.query("SELECT * FROM Tarefas WHERE TaskOwner=?",data_user.id,function (error, results, fields) 
        {
            if (error) throw error;
            if(_.isEmpty(results))
            {
                console.log("No task for user");   
                res.status(404).send({ message: 'This e-mail is not registered.' }); 
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

    console.log("API POST");     
    var data_user = _.findWhere(LoggedUsers, {token:req.cookies.accessToken});

    if(req.body.type === 'add')
    {
        pool.getConnection(function(err, connection) {
        // Use the connection 
        if (err) throw err; 
        console.log('Going to DataBase');
        var insert_vector = [data_user.id,req.body.new_task];
        connection.query("INSERT INTO Tarefas (TaskOwner, tarefa) VALUES (?,?)",insert_vector,function (error, results, fields) 
        {
            if (error) throw error;
            if(_.isEmpty(results))
            {
                console.log("Can not insert");   
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
        console.log('Going to DataBase');
        connection.query("DELETE FROM Tarefas WHERE id=?",req.body.remove_task,function (error, results, fields) 
        {
            if (error) throw error;
            if(_.isEmpty(results))
            {
                console.log("Can not delete");   
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
        console.log("Type error");   
        res.status(404).send({ message: 'Error on type' }); 
    }



});


var httpServer = http.createServer(app);
httpServer.listen(port);