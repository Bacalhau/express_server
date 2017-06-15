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


var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'bacalhau',
  password        : '123456',
  database        : 'datahub'
});
 
var query_username = 'baca';
var new_user = {
      name:'Isa',
      lastname:'bacalhau',
      username:'joaomarcusbacalhau@hotmail.com',
      password:'123456',
      application:'default'
};

pool.getConnection(function(err, connection) {
  // Use the connection 
  if (err) throw err;
  console.log('GET 1');
    connection.query("SELECT * FROM Usuario WHERE uname=?",query_username ,function (error, results, fields) 
    {
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
    
    connection.release();
 
    // Handle error after the release. 
    if (err) throw err;
 
    // Don't use the connection here, it has been returned to the pool. 
  });
    console.log('Connection 2');
pool.getConnection(function(err, connection) {
  // Use the connection 
  if (err) throw err;
  console.log('GET 2');
    connection.query("SELECT * FROM Usuario WHERE uname=?",query_username ,function (error, results, fields) 
    {
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
    
    connection.release();
 
    // Handle error after the release. 
    if (err) throw err;
 
    // Don't use the connection here, it has been returned to the pool. 
  });
     console.log('Connection 3');
pool.getConnection(function(err, connection) {
  // Use the connection 
  if (err) throw err;
  console.log('GET 3');
    connection.query("SELECT * FROM Usuario WHERE uname=?",query_username ,function (error, results, fields) 
    {
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
    
    connection.release();
 
    // Handle error after the release. 
    if (err) throw err;
 
    // Don't use the connection here, it has been returned to the pool. 
  });

     console.log('Connection 4');
pool.getConnection(function(err, connection) {
  // Use the connection 
  if (err) throw err;
  console.log('GET 4');
    connection.query("SELECT * FROM Usuario WHERE uname=?",query_username ,function (error, results, fields) 
    {
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
    
    connection.release();
 
    // Handle error after the release. 
    if (err) throw err;
 
    // Don't use the connection here, it has been returned to the pool. 
  });


/*
pool.end(function (err) {
  // all connections in the pool have ended 
});
*/