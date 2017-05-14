var fs = require('fs');
var https = require('https');
var jwt    = require('jsonwebtoken');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var _ = require('underscore');
var configParameter =require('./config.js');
var privateKey  = fs.readFileSync('privatekey.key', 'utf8');
var certificate = fs.readFileSync('certificate.crt', 'utf8');


var port = process.env.PORT || 8443;

var credentials = {key: privateKey, cert: certificate};

var app = express();
app.use(cookieParser());
app.set('view engine', 'ejs');

var LoggedUsers = [];
var TokenOnline = [];

var database = [
    {   
        username:"joao@joao",
        password:"joao",
        HasAccess: [
            '/admin',
            '/api/routeB',
        ],        
    },
    {   
        username:"baca@baca",
        password:"baca",
        HasAccess: [],        
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
    '/register'
]; 

app.use('/assets', express.static(__dirname + '/public'));

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

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

app.use(function(req, res, next) {  
  console.log("MIDDLEWAR - Requested path: " + req.path);  
  if (search(freeAccess,req.path)) 
  {
        console.log("ON FREE ACCESS LIST");
        next();        
  }
  else
  {
        console.log("Restricted area");
        console.log('Cookies: ', req.cookies);
        if(search(TokenOnline,req.cookies.accessToken))//Search for token. if Logged and has access
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
             res.sendStatus(404);  
        }        
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

app.get('/register', function(req,res) {
    res.render('register');
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
        console.log(user);        
        if(_.isEmpty(_.where(LoggedUsers,user)||[]))
        {
            //Generate token
            var newtoken = jwt.sign({
                     username: 'user.username',
                     HasAccess: 'user.HasAccess'
            }, configParameter.secret , { expiresIn: '1m' });
            
            user[0].token = newtoken;                        
            TokenOnline.push(newtoken);           

            res.cookie('accessToken', newtoken , { expires: new Date(Date.now() + 900000), secure: true });
            res.status(200).end();                       
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


app.post('/register',function(req,res){
    res.sendStatus(200);       

});

var httpsServer = https.createServer(credentials, app);

httpsServer.listen(port);

