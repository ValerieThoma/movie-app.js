var express = require('express');
var router = express.Router();
var config = require('../config.js/config.js');
var request = require('request'); //imported from npm
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var connection = mysql.createConnection(config.db);
connection.connect((error)=>{
	console.log(error);
}) ;


const apiBaseUrl = 'http://api.themoviedb.org/3';
const nowPlayingUrl = apiBaseUrl + '/movie/now_playing?api_key='+config.apiKey
const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';

/* GET home page. */
router.get('/', function(req, res, next) {
	var message = req.query.msg;
	if(message == "registered"){
		message = "Congratulations! You are regsitered! Enjoy the site."
	}else if(message == "fail"){
		message = "That user/password combination is not recognzed. please try again"
	}
	request.get(nowPlayingUrl,(error,response,movieData)=>{
		var parsedData = JSON.parse(movieData);
		console.log(parsedData);
		res.render('index',{
			parsedData: parsedData.results,
			imageBaseUrl: imageBaseUrl,
			title : parsedData.results.original_title,
			date : parsedData.results.release_date,
			synopsis: parsedData.results.overview,
			message : message
		})
	});
});



router.post('/search', (req, res)=>{
	// res.send("Search route here.");
	// ANYTHING in a form that has a name sent through post 
	// is available inside the req.body object
	// req.query
	// res.json(req.body)
	var userSearchTerm = req.body.movieSearch;
	var userSearchActor = req.body.actorSearch;
	var queryString = req.query.key;
	var searchUrl = `${apiBaseUrl}/search/movie?query=${userSearchTerm}&api_key=${config.apiKey}`; 
	request.get(searchUrl,(error,response,movieData)=>{
		var parsedData = JSON.parse(movieData);
		// res.json(parsedData);
		res.render('index',{ 
			parsedData: parsedData.results,
			imageBaseUrl: imageBaseUrl 
		})
	});
});

router.get('/search', (req, res)=>{
	// ANYTHING in a form that has a name sent through 
	// a GET request, is availabel inside the req.query object
	// res.json(req.query)	
	var userSearchTerm = req.query.movieSearch;
	var userSearchActor = req.query.actorSearch;
	res.send("Hey, this is the get route. Nobody is listening.")
})

router.get('/movie/:movieId',(req, res)=>{
	// res.json(req.params);
	// somewhere, in the movieAPI backend, they made some JSON then did...
	// jsonToSend = JSON.stringify(jsonData);
	var movieId = req.params.movieId;
	var thisMovieUrl = `${apiBaseUrl}/movie/${movieId}?api_key=${config.apiKey}`;
	request.get(thisMovieUrl,(error, response, movieData)=>{
		var parsedData = JSON.parse(movieData);
		// res.writeHead(200,{contentType:'txt/html'})
		// res.json(parsedData);
		res.render('single-movie',{
			movieData: parsedData,
			imageBaseUrl:imageBaseUrl
		})
	})
})

router.get('/register', (req,res, next)=>{
	res.render('register', {

	});
});

router.get('/login',(req,res)=>{
	res.render('login',{});
});

router.post('/loginProcess', (req, res, next)=>{
	var email = req.body.email;
	var password = req.body.password;
	var selectQuery = "SELECT * FROM users WHERE email = ?;";
	connection.query(selectQuery, [email], (error, results)=>{
		if(results.length == 0){
			res.redirect('/login?msg=badROBOT');
		}else{
			var doTheyMatch = bcrypt.compareSync(password, results[0].password)
			if(doTheyMatch){
				res.redirect('/?msg=loggedIn');
			}else{
				res.redirect('/login?msg="baspass');
			}
		}
	});
});

router.post('/registerProcess', (req, res, next)=>{
	// res.json(req.body);
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	var hash = bcrypt.hashSync(password);
	// first of all, check to see if this user is registered...
	// we need a select statement...
	const selectQuery = "SELECT * FROM users WHERE email = ?;";
	connection.query(selectQuery,[email],(error, results)=>{
	// if the email already exists, stop, send them an error
		if(results.length == 0){
			// this user is not in the DB! Insert them...
			var insertQuery = "INSERT INTO users (name, email, password) VALUES (?,?,?);";
			connection.query(insertQuery,[name, email, hash],(error, results)=>{
				if (error){
					throw error;
				}else{
					res.redirect("/?msg=registered");
				}
			});
		}else{
			res.redirect("/?msg=fail");
		}
	});
	
	// if the email doesn't exist, insert it into the database

});

module.exports = router;
