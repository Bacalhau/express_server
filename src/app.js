var fs = require('fs');
var https = require('https');
var jwt    = require('jsonwebtoken');
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var configParameter =require('./config.js');
var privateKey  = fs.readFileSync('privatekey.key', 'utf8');
var certificate = fs.readFileSync('certificate.crt', 'utf8');


var port = process.env.PORT || 8443;

var credentials = {key: privateKey, cert: certificate};

var app = express();

app.set('view engine', 'ejs');

var LoggedUsers = [];
var database = [
    {   
        username:"joao@joao",
        password:"joao"
    },
    {   
        username:"baca@baca",
        password:"baca"
    }

];


var routesToSecure = [
  '/admin',
  '/api/routeB',
]; 

app.use('/assets', express.static(__dirname + '/public'));

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 


app.use(function(req, res, next) {
  // .. some logic here .. like any other middleware
  console.log("MIDDLEWARE");
  console.log(req.path);
  if (req.path === '/admin') 
  {
     res.sendStatus(404);
     
  }
  else
  {
      next();
  }  
});

app.get('/', function(req,res) {
    res.render('index');
});

app.get('/admin', function(req,res) {
    res.render('admin');
});

app.get('/login', function(req,res) {
    res.render('login');
});

app.get('/forgotpassword', function(req,res) {
    res.render('forgotpassword');
});

//Hidden URL
app.get('/bye', function(req,res) {
    res.send('bye');
});

app.post('/login',function(req,res){

    console.log("POST RECEIVED");
    console.log(req.body.username);
    console.log(req.body.password);


    var user = _.where(database,{ username:req.body.username,password:req.body.password }) || [];
 
    if(_.isEmpty(user))//User not Found
    {
        console.log("user not found");   
        res.sendStatus(404);
    }
    else
    {        
        console.log(user);        
        if(_.isEmpty(_.where(LoggedUsers,user)||[]))
        {
            LoggedUsers.push(user);
            res.redirect('/admin');
            console.log(LoggedUsers);
        }
        else
        {

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
        console.log(user);        
        res.sendStatus(200);       
    }

});

var httpsServer = https.createServer(credentials, app);

httpsServer.listen(port);

