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

var database = [
    {   
        username:"gatekeeper@datahub",
        password:"joao",
        application: 'admin'        
    },
    {   
        username:"baca@baca",
        password:"baca",
        application: 'app1',        
    }

];


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


var port = process.env.PORT || 8443;


// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mynodeservermail@gmail.com',
        pass: 'mailpassword'
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
  if (search(freeAccess,req.path)) 
  {
        console.log("ON FREE ACCESS LIST");
        next();        
  }
  else
  {
      console.log(req.cookies.accessToken);
        console.log("Restricted area");        
        //if(search(TokenOnline,req.cookies.accessToken))//Search for token. if Logged and has access
        if(searchUser(LoggedUsers,{ token:req.cookies.accessToken}))//Search for token. if Logged and has access
        {
            console.log('User on list');

            try {
                var decoded = jwt.verify(req.cookies.accessToken, configParameter.secret);
                console.log(decoded) // bar                                 
                var payload = jwt.decode(req.cookies.accessToken);
                console.log(payload) // bar                 
                next();  
                
            } catch(err) 
            {
                    console.log('token expired');
                    res.sendStatus(404);  
            }            
        }
        else
        {
            if(searchUser(LoggedUsers,{ token:req.query.id}))//Search for token. if Logged and has access
            {
                 console.log('first workspace');
                 next();  
            }
            else
            {
                console.log('tokenlist');
                res.sendStatus(404); 
            }
            
        }        
  }  
});

app.get('/main_chart', function(req,res) {
    res.render('./app_chart/main_chart');
});

app.get('/', function(req,res) {
    res.render('index');
});

app.get('/code/app_chart/appcode_chart.js', function(req,res) {
   res.sendFile(__dirname + '/private/app_chart/appcode_chart.js');
});

app.get('/workspace', function(req,res) {



    res.cookie('accessToken', req.query.id , { expires: new Date(Date.now() + 900000)});// IF HTTPS put , secure: true  parameter
    res.render('./app_chart/index2');   


    /*
    //find on a vector the user application and return it
    var user = _.where(LoggedUsers,{ token:req.cookies.accessToken}) || [];
    if(_.isEmpty(user))//User not Found
    {
        console.log('User expired');
         res.sendStatus(404); 
    }
    else
    {
        if(user[0].application ==='msg')
        {
            res.render('msg',{label:'Warning',type:'alert alert-warning',msg:'The gatekeeper did not assign an application for you yet.'});
        }
        else
        {
            var app_files = './'+ user[0].application + '/' + user[0].application;
            console.log(app_files);
            res.render(app_files);
        }
        
    }
    */


});

app.get('/login', function(req,res) {
    res.render('login');
});

app.get('/forgotpassword', function(req,res) {
    res.render('forgotpassword');
});

app.get('/register', function(req,res) {
    res.render('register');
});

//https://localhost:8443/confirmation/?id=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiam9hbyIsImlhdCI6MTQ5NDgxNDE2Mn0.mse9BRZx-j1SXRDfeCCzwAnW-dmozeQtky7E8iGA6II
app.get('/confirmation/', function (req, res) {
  console.log('confirmation link');
  console.log(req.query);

   var user = _.where(NewUsers,{ confirmationId:req.query.id}) || [];
    if(_.isEmpty(user))//token not found
    {
        console.log('Token not found');
        res.render('confirmation',{type:'alert alert-danger',msg:'Your account could not be confirmed.'});
    }
    else
    {
        console.log(Date.now()-user[0].expire);
        if((Date.now()-user[0].expire)>900000)//15min
        {
             res.render('confirmation',{type:'alert alert-danger',msg:'Your account could not be confirmed.'});
             
        }
        else
        {
            database.push(user[0]);
            console.log(database);
            res.render('confirmation',{type:'alert alert-success',msg:'Your account is confirmed.'});
        }
    }
    
   
});


app.post('/login',function(req,res){

    console.log("POST RECEIVED");
    var user = _.where(database,{ username:req.body.username,password:req.body.password }) || [];
 
    if(_.isEmpty(user))//User not Found
    {
        console.log("user not found");   
        res.sendStatus(404);  
    }
    else
    {        
        console.log(user[0]);        
        if(_.isEmpty(_.where(LoggedUsers,user[0])||[]))
        {
            //Generate token
            var newtoken = jwt.sign({
                     username: user[0].username,
                     application: user[0].application
            }, configParameter.secret , { expiresIn: '10m' });
            
            user[0].token = newtoken;                        
                      
            LoggedUsers.push(user[0]);
            //res.cookie('accessToken', newtoken , { expires: new Date(Date.now() + 900000)});// IF HTTPS put , secure: true  parameter
            //res.status(200).end();   
            //res.status(200).send({ message: newtoken });
            res.status(200).send({ message: 'http://localhost:8443/workspace?id=' + newtoken });
            console.log("TOKEN SENT");                       
        }
        else
        {
            res.status(404).end(); 
        }       
    }
});

app.post('/forgotpassword',function(req,res){

    console.log("POST RECEIVED PASSWORD FORGOT");
    console.log(req.body.username);

    var user = _.where(database,{ username:req.body.username}) || [];
 
    if(_.isEmpty(user))//User not Found
    {
        console.log("user not found");   
        res.sendStatus(404);    
    }
    else
    {        
          
        fs.readFile(__dirname + '/views/emailRecovery.ejs','utf8',function (err, data) {
            if (err) throw err;

            var html_string = my_ejs.render(data, { name:user[0].name,lastname:user[0].lastname,password:user[0].password});
            console.log(html_string);
            var mailOptions = {
                from: '"DataHub" <mynodeservermail@gmail.com>', // sender address
                to: user[0].username, // list of receivers
                subject: 'Password Recovery', // Subject line
                html: html_string
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    res.status(404);
                    return console.log(error);
                }        
                    res.status(200).send({ message: 'email sent' });
                    console.log('email sent');
                console.log('Message %s sent: %s', info.messageId, info.response);
            });

                
            });    
    }

});


app.post('/register',function(req,res){
    console.log(req.body);
    var user = _.where(database,{ username:req.body.username}) || [];
    if(_.isEmpty(user))//User not Found can be created
    {   

        var token = jwt.sign({ user: req.body.name }, 'confirmationId');
        var app_req = _.where(configParameter.applications,{ key:req.body.appkey}) || [];

        var new_user = {
            name:req.body.name,
            lastname:req.body.lastname,
            username:req.body.username,
            password:req.body.password,
            expire:Date.now(),
            confirmationId:token,
            application: 'msg'
        };


        if((_.isEmpty(app_req))===false)
        {
            new_user.application = app_req.name;
            console.log('Application Found')
        }
       
        NewUsers.push(new_user);
        var confirmation_link = 'http://localhost:8443/confirmation/?id=' + token;
        // setup email data with unicode symbols
       
        fs.readFile(__dirname + '/views/email.ejs','utf8',function (err, data) {
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
                    res.status(404);
                    return console.log(error);
                }        
                    res.status(200).send({ message: 'email sent' });
                    console.log('email sent');
                console.log('Message %s sent: %s', info.messageId, info.response);
            });

                
            });
        

        
    }
    else//user exists
    {
        res.status(404).send({ message: 'User Already exist!' });
         console.log('user exist');
    }      
});



app.post('/logout',function(req,res){


var remove_user = _.findWhere(LoggedUsers, {username:req.body.username})
if(remove_user===undefined)
{
    res.status(404).send({ message: 'User not found' });
}
else
{
    LoggedUsers = _.without(LoggedUsers,remove_user);
    res.status(200).send({ message: 'User logged out' });
}

});


var httpServer = http.createServer(app);

httpServer.listen(port);