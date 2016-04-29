var express = require("express");
var app = express();
var http = require('http').Server(app);
var path = require("path");

var fs = require("fs");
var request = require("request");
var cheerio = require("cheerio");

var port = process.env.PORT || 5000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


//get a list of stations by zipcode
app.get('/stations/:zip', function(req, res){  
  zip = req.params.zip;
  zipapiurl = "http://ziptasticapi.com/" + zip;
  var city = "";
  var state = "";
  var request = require("request");
  request({
      url: zipapiurl,
      json: true
  }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
          console.log(body) // Print the json response
          city = body.city;
          state = body.state;
          console.log("city " + city);
          console.log("state: " + state);
          console.log("zip: " + zip);
          url = "http://gasprices.mapquest.com/station/us/" + state + "/" + city + "/" + zip;
          console.log(url);
          request(url, function(error, response, html) {
            if (!error) {
              var $ = cheerio.load(html);
              var prices;
              var json = {stations : []};
              var prices = [];
              var station_names = [];
              var street_addresses = [];
              var cities = [];
              var states = [];
              var zip_codes = [];
              $('.price').each(function() {
                var data = $(this);
                price = data.text();
                price = price.trim();
                prices.push(price);
              })
              $('.name.link').each(function() {
                var data = $(this);
                station_name = data.text();
                station_names.push(station_name);
              })
              $('.street-address').each(function() {
                var data = $(this);
                street_address = data.text();
                street_addresses.push(street_address);
              })
              $('.locality').each(function() {
                var data = $(this);
                city = data.text();
                cities.push(city);
              })
              $('.region').each(function() {
                var data = $(this);
                region = data.text();
                states.push(region);
              })
              $('.postal-code').each(function() {
                var data = $(this);
                zip_code = data.text();
                zip_codes.push(zip_code);
              })
              for (var i=0; i< prices.length; i++) {
                console.log(prices[i] + " at " + station_names[i]);
                console.log(street_addresses[i]);
                console.log(cities[i] + states[i] + " " + zip_codes[i]);
                price = prices[i];
                name = station_names[i];
                address = street_addresses[i] + " " + cities[i] + states[i] + " " + zip_codes[i];
                json.stations.push({"name": name, "price": price, "address": address});
              }
              console.log(json);
              fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
                console.log('File successfully written! - Check your project directory for the output.json file');
              })
              res.json(json);

            }
          })
      }
  });
});


//if city is two words, separate with a + (e.g. palo+alto)
//state is the 2 letter state code (e.g. ca)
//zip is the 5 digit zip code (e.g. 94305)
app.get('/stations/:city/:state/:zip', function(req, res){  
  city = req.params.city;
  state = req.params.state;
  zip = req.params.zip;
  console.log("city " + city);
  console.log("state: " + state);
  console.log("zip: " + zip);
  url = "http://gasprices.mapquest.com/station/us/" + state + "/" + city + "/" + zip;
  console.log(url);
  request(url, function(error, response, html) {
    if (!error) {
      var $ = cheerio.load(html);
      var prices;
      var json = {stations : []};
      var prices = [];
      var station_names = [];
      var street_addresses = [];
      var cities = [];
      var states = [];
      var zip_codes = [];
      $('.price').each(function() {
        var data = $(this);
        price = data.text();
        prices.push(price);
      })
      $('.name.link').each(function() {
        var data = $(this);
        station_name = data.text();
        station_names.push(station_name);
      })
      $('.street-address').each(function() {
        var data = $(this);
        street_address = data.text();
        street_addresses.push(street_address);
      })
      $('.locality').each(function() {
        var data = $(this);
        city = data.text();
        cities.push(city);
      })
      $('.region').each(function() {
        var data = $(this);
        region = data.text();
        states.push(region);
      })
      $('.postal-code').each(function() {
        var data = $(this);
        zip_code = data.text();
        zip_codes.push(zip_code);
      })
      for (var i=0; i< prices.length; i++) {
        console.log(prices[i] + " at " + station_names[i]);
        console.log(street_addresses[i]);
        console.log(cities[i] + states[i] + " " + zip_codes[i]);
        price = prices[i];
        name = station_names[i];
        address = street_addresses[i] + " " + cities[i] + states[i] + " " + zip_codes[i];
        json.stations.push({"name": name, "price": price, "address": address});
      }
      console.log(json);
      fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
        console.log('File successfully written! - Check your project directory for the output.json file');
      })
      res.json(json);

    }
  })

});


http.listen(port, function(){
  console.log('listening on *:5000');
});
// app.listen(port);