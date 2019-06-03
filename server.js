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



var address = mongoose.model('address', webAddressSchema); 

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: false })); 
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
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
    var urlExists = function(urlAddress) {
      address.find({url:urlAddress}, function(err, data) {
        if(err) {
          console.log("There was an error checking the already added addresses: "+err);
          //return false;
        } else {
          console.log(data);
          if (data) {
            console.log("address added previously");
            createAndSaveWebAddress();
          }
        }
      });
    };
    
    var createAndSaveWebAddress = function(){
      var addr = new address({url: url});
      
      addr.save(function(err, data){
        if(err) {
          console.log("There is an error: "+err);
          
        }
        else {
          
          console.log("new address created in db: "+addr);
          console.log("sending web addr in json");
          // TODO - return json with retrieved _id for the website
          res.json({
            original_url: req.body.url,
            short_url: addr._id
          });
        }
      });
    };
    //if (!urlExists(url)) {
    //  createAndSaveWebAddress();
    //}
    
    
  });
  //res.json({original_url: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});