var fs = require('fs');
var https = require('https');
var jwt    = require('jsonwebtoken');
var express = require('express');
var bodyParser = require('body-parser')
var configParameter =require('./config.js');
var privateKey  = fs.readFileSync('privatekey.key', 'utf8');
var certificate = fs.readFileSync('certificate.crt', 'utf8');


var port = process.env.PORT || 8443;

var credentials = {key: privateKey, cert: certificate};

var app = express();

app.set('view engine', 'ejs');


var LoggedUsers = [];


app.use('/assets', express.static(__dirname + '/public'));

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

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
    res.setHeader('Content-Type', 'application/json');
    res.end();

});

app.post('/forgotpassword',function(req,res){

    console.log("POST RECEIVED PASSWORD FORGOT");
    console.log(req.body.username);
    res.setHeader('Content-Type', 'application/json');
    res.end();

});

var httpsServer = https.createServer(credentials, app);

httpsServer.listen(port);

