var express = require('express');
var router = express.Router();
var config = require('../config.js/config.js');
var request = require('request'); //imported from npm
var synopsis = [];
var title = [];
var date = [];

const apiBaseUrl = 'http://api.themoviedb.org/3';
const nowPlayingUrl = apiBaseUrl + '/movie/now_playing?api_key='+config.apiKey
const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';

/* GET home page. */
router.get('/', function(req, res, next) {
	request.get(nowPlayingUrl,(error,response,movieData)=>{
		var parsedData = JSON.parse(movieData);
		console.log(parsedData);
		res.render('index',{
			parsedData: parsedData.results,
			imageBaseUrl: imageBaseUrl,
			title : parsedData.results.original_title,
			date : parsedData.results.release_date,
			synopsis: parsedData.results.overview
		})
	});
});

module.exports = router;
