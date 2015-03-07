var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var bcrypt = require('bcrypt-nodejs');

app.get('/', function (req, res) {
	bcrypt.hash("bacon", null, null, function(errHash, hash) {
		// Load hash from your password DB.
		bcrypt.compare("bacon", hash, function(err, bres) 
		{
			res.send("Logged in ? " + bres + "<br/>" + hash);
		});
	});
})

// parse application/x-www-form-urlencoded
var urlEncParser = bodyParser.urlencoded({ extended: false })

obj = {
	id: "0",
	pass: "neso",
	success: 0,
}


app.post("/login", urlEncParser, function(req, res){
	  console.log("Dobi login: ", req.body);
	  
	  res.json(obj);
});


app.post("/register", urlEncParser, function(req, res){
	  res.json(obj);
	  console.log("Dobi register: ", req.body);
});

var server = app.listen(1337, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Server started.");
})
