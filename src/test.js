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
var mysql      = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'bacalhau',
  password : '123456',
  database : 'datahub'
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
 
var query_username = 'baca';
var new_user = {
      name:'Isa',
      lastname:'bacalhau',
      username:'joaomarcusbacalhau@hotmail.com',
      password:'123456',
      application:'default'
};
connection.query("SELECT * FROM Usuario WHERE uname=?",query_username ,function (error, results, fields) {
  if (error) throw error;
  if(_.isEmpty(results))
  {
        console.log('Not Found!');
  }
  else
  {
        console.log('The result is: ', results);
  }
});
var insert_vector = [new_user.name,new_user.lastname,new_user.username,new_user.password,new_user.application];
connection.query("INSERT INTO Usuario (uname, ulastname, username, pass, application) VALUES (?,?,?,?,?)",insert_vector,function (error, results, fields) {
  if (error)
  {
      console.log(error);
  }
  else
  {
      if(_.isEmpty(results))
      {
            console.log('Not Found!');
      }
      else
      {
            console.log('The result is: ', results);
      }
  }

});



connection.end();

  console.log('connected as id ' + connection.threadId);
});

