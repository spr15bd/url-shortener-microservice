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



app.use(cors());
/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI, { useNewUrlParser: true });
var Schema = mongoose.Schema;



var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  console.log('Connected to MongoDB');
  
});


var webAddressSchema = new Schema({
  url: {
    type: String,
    required: true,
    unique:true
  },
  shortUrl: {
    type: Number
    //required: true
  }
});

var checkWhetherUrlExists = function(urlAddress, res, req) {
  address.find({url:urlAddress}, function(err, data) {
    if(err) {
      console.log("There was an error checking the already added addresses: "+err);
    } else {
      console.log("Data length is: "+data.length);
      //console.log(data[0].url);
      if (data.length>0) {
        console.log("address added previously");
        res.json({
          original_url: req.body.url,
          short_url: data[0]._id
        });
      } else {
        createAndSaveWebAddress(urlAddress, res, req);
      }
    }
  });
};

var createAndSaveWebAddress = function(url, res, req){
      var addr = new address({url: url});
      
      addr.save(function(err, data){
        if(err) {
          console.log("There is an error: "+err);
        } else {
          console.log("new address created in db: "+addr);
          console.log("sending web addr in json");
          res.json({
            original_url: req.body.url,
            short_url: addr._id
          });
        }
      });
    };

var address = mongoose.model('address', webAddressSchema); 

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: false })); 
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


app.get('/api/shorturl/:url', function(req, res){
  console.log("endpoint to redirect to shortUrl's website");
  console.log("req params: "+req.params.url);
  // if req.params.url is a valid id in db, redirect user there
  //res.sendFile(process.cwd() + '/views/index.html');
  address.find({_id:req.params.url}, function(err, data) {
    if(err) {
      console.log("There was an error finding the shorturl in the database: "+err);
    } else {
      console.log("Found the shorturl");
      console.log("This is the shorturl for "+data[0].url);
      // redirect to db
      //res.redirect('/api/shorturl/'+data[0].url);
      res.redirect('http://'+data[0].url);
    }
  });
});

 
// your first API endpoint... 
app.post("/api/shorturl/new", function (req, res) {
  console.log("url is: "+req.body.url);
  let url = req.body.url.replace(/(^\w+:|^)\/\//, '');
  console.log("url is now "+url);
  dns.lookup(url, function (err, addresses, family) {
    if (err) {
      res.json({error: 'invalid URL'});
    }
    //
    
    //
    checkWhetherUrlExists(url, res, req);
    
    
    
  });
  //res.json({original_url: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});