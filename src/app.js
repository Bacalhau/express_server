var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('privatekey.key', 'utf8');
var certificate = fs.readFileSync('certificate.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var app = express();

app.set('view engine', 'ejs');

// your express configuration here
app.use('/assets', express.static(__dirname + '/public'));

app.get('/', function(req,res) {
    res.render('index');
});

app.get('/bye', function(req,res) {
    res.send('bye');
});

var httpsServer = https.createServer(credentials, app);

httpsServer.listen(8443);

