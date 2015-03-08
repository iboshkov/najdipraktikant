var express		= require('express')
var bodyParser	= require('body-parser')
var bcrypt		= require('bcrypt-nodejs');
var mysql		= require('mysql');
var fs			= require('fs');
var connect		= require("connect");
var app			= express();

// parse application/x-www-form-urlencoded
var urlEncParser = bodyParser.urlencoded({ extended: false })

var connection = mysql.createConnection({
	host		: 'localhost',
	user		: 'root',
	password	: '',
	database	: 'np'
});


app.use("/sliki", express.static(__dirname + '/sliki'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(function(req,res,next){
	return next();
});



app.get('/', function (req, res) {
	bcrypt.hash("bacon", null, null, function(errHash, hash) {
		// Load hash from your password DB.
		bcrypt.compare("12345", hash, function(err, bres) 
		{
			res.send("Logged in ? " + bres + "<br/>" + hash);
		});
	});
})

app.post("/login", urlEncParser, function(req, res){
	console.log("Dobi login: ", req.body);
	var korisnik = req.body;
	
	var query = connection.query ('SELECT * FROM `korisnici` WHERE `mail` = ' + connection.escape(korisnik.mail), function(err, result)
	{
		/*if (err)
		{
			console.log("Ne postoe");
			res.status(403).end("Except - /login");
			//throw err;
		}*/

		if (result.length == 0)
		{
			res.send("Except - /login").status(403);
		}
		else if (result.length > 1)
		{
			res.send("What ?").status(403);	
		}
		else
		{
			console.log(result[0]);
			bcrypt.compare(korisnik.pass, result[0].pass, function(err, bres) 
			{
				console.log("Pass check: " + bres);
				if (bres)
					res.json(result[0]);
				else
					res.send("Wrong password.").status(403);
			});
		}
	});
});

app.get("/register", function(req, res)
{
	connection.query('SELECT * FROM `korisnici`', function(err, rows, fields) {
		if (err) throw err;
		var iminja = "";
		for (var row in rows)
			iminja += rows[row].ime + "<br/>";
		res.send(iminja);
	});
});

app.post("/register", urlEncParser, function(req, res){
	//INSERT INTO `np`.`korisnici` (`id`, `ime`, `pass`, `mail`, `tip`, `slika`) VALUES (NULL, 'Lazar Nikolov', '$2a$10$5PcBomN43vvtCH2qgoxJk.M1SVcMSun2oXeXgCx/FqgrugqN3IQUO', 'lazar.nikolov.94@gmail.com', '0', 'sliki/default.jpg');
	console.log("Dobi register: ", typeof(req.body));
	var korisnik = req.body;
	
	bcrypt.hash(korisnik.pass, null, null, function(errHash, hash) {
		korisnik.pass = hash;
		var query = connection.query ('INSERT INTO `korisnici` SET ?', korisnik, function(err, result)
		{
			console.log("Result: " + result);
			// tood proveri dali postoe
		});
  		console.log("Vnesuvam vo db: " + query.sql);
	});
	res.send("Test");
});

app.post("/smeniSlika", function(req, res)
{
	console.log(req.body.userId, " smeni slika");

	require("fs").writeFile("sliki/" + req.body.userId + ".jpg", req.body.slika, 'base64', function(err) {
		console.log(err);
	});

	res.json({poraka: "nisto"});
});

app.post("/obnoviProfil", function(req, res){
	var data = JSON.parse(req.body.user); 

	var query = connection.query ('UPDATE `korisnici` SET ? WHERE `korisnici`.`id`=' + data.id, data, function(err, result)
	{
		console.log(query.sql);
		//if (err) throw err;
		if (result.changedRows == 0)
		{
			res.send("Except - /obnoviProfil - ne postoe korisnikot ili greska id").status(403);
		}
		else if (result.changedRows > 1)
		{
			res.send("What ?").status(403);	
		}
		else
		{
			res.json({response: "success"});
		}
	});
});

app.post("/zemiProfil", function(req, res){
	var data = req.body; 
	var query = connection.query ('SELECT * FROM `korisnici` WHERE `id`=' + data.userId, function(err, result)
	{
		if (err) throw err;
		res.json(result[0]);
	});
	console.log(data);
});

app.post("/zemiKompanii", function(req, res){
	var niza = [];
	console.log("/Zemi kompanii");
	var query = connection.query ('SELECT * FROM `korisnici` WHERE `tip`=1', function(err, result)
	{
		if (err) throw err;
		for(var red in result)
		{
			console.log("Red " + red + ": ", result[red]);
		}
		res.json(result);
	});
});

app.post("/zemiOglasi", function(req, res)
{
	var filter  = req.body;
	console.log(filter);
	var q = 'SELECT * FROM `oglasi` WHERE 1 ';
	if (filter.kompanija.length > 0)
		q += 'AND `idKompanija`=' + filter.kompanija; 

	console.log("Vracam oglasi");
	var query = connection.query (q, function(err, result)
	{
		console.log(result);
		res.json(result);
	});
	console.log(query.sql);
});
app.post("/dodajOglas", function(req, res)
{
	var oglas = req.body;
	console.log(oglas);
	var query = connection.query ('INSERT INTO `oglasi` SET ?', oglas, function(err, result)
	{
		console.log(oglas.tagovi.split(","))
		res.json({response: "niso"});
	});
});

var server = app.listen(1337, function () {
	var host = server.address().address
	var port = server.address().port
	connection.connect(); 
	console.log("Server started.");
})