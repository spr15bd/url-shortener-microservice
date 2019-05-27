'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');

var app = express();
var dns = require('dns');

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI);
var Schema = mongoose.Schema;
app.use(cors());

var webAddressSchema = new Schema({
  url: {
    type: String,
    required: true
  },
  shrtUrl: {
    type: Number,
    required: true
  }
});

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

app.use(bodyParser.urlencoded({ extended: false }));  
// your first API endpoint... 
app.post("/api/shorturl/new", function (req, res) {
  console.log("url is: "+req.body.url);
  let url = req.body.url.replace(/(^\w+:|^)\/\//, '');
  console.log("url is now "+url);
  dns.lookup(url, function (err, addresses, family) {
    if (err) {
      res.json({error: 'invalid URL'});
    }
    res.json({original_url: req.body.url});
    
  });
  //res.json({original_url: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});