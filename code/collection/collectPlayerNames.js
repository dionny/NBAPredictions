var fs = require('fs');
var csv = require("fast-csv");
var async = require('async');
var GameDataCollection = require('../collection/collectGameData.js');
var game_data = new GameDataCollection();
var mongoose = require('mongoose');
var Stat = require('../models/Stat.js');
// mongoose.connect('mongodb://localhost/NFLCrimes');

var method = PlayerCollection.prototype;

function PlayerCollection() {
}

method.LoadPlayers = function(filename, callback, error_handler) {
	var stream = fs.createReadStream(filename);
	var requests = [];
 
	var csvStream = csv()
	    .on("data", function(data){
	    	var start_year = data[19];

	    	if(start_year >= 2000) {
	    		var first_name = data[1];
	        	var last_name = data[2];

	    		var fetch = function(callback) {
	    			game_data.GetPlayerByName(first_name, last_name, function(result) {
		        		console.log(result);
		        		//callback(null, result);
		        		var player_id = result.data[0].player;

		        		game_data.GetPlayerOffensiveStats(player_id, function(result2) {
		        			console.log(result2);
		        			var average_td = game_data.ExtractOffensiveData(result2);
		        			var stat = {
		        				player: player_id,
		        				name: first_name + " " + last_name,
		        				position: result.data[0].pos1,
		        				height: result.data[0].height,
		        				weight: result.data[0].weight,
		        				birth: result.data[0].yob,
						        forty: result.data[0].forty,
						        bench: result.data[0].bench,
						        vertical: result.data[0].vertical,
						        broad: result.data[0].broad,
						        shuttle: result.data[0].shuttle,
						        cone: result.data[0].cone,
						        draft: result.data[0].dpos,
						        college: result.data[0].col,
						        start_year: result.data[0].start,
						        team: result.data[0].cteam,
						        touchdowns: average_td
		        			};

		        			/*Stat.collection.insert(stat, onInsert);

				            function onInsert(err, docs) {
				                if (err) {
				                    console.log(err);
				                    callback(null, err);
				                } else {
				                    console.info('stats were successfully stored.');
				                    callback(null, docs);
				                }
				            }*/
				            console.log(stat);
					        callback(null,stat);
		        		}, function(err) {
		        			game_data.GetPlayerDefensiveStats(player_id, function(result3) {
		        				console.log(result3);
		        				var average_td = game_data.ExtractDefensiveData(result3);
		        				var stat = {
			        				player: player_id,
			        				name: first_name + " " + last_name,
			        				position: result.data[0].pos1,
			        				height: result.data[0].height,
			        				weight: result.data[0].weight,
			        				birth: result.data[0].yob,
							        forty: result.data[0].forty,
							        bench: result.data[0].bench,
							        vertical: result.data[0].vertical,
							        broad: result.data[0].broad,
							        shuttle: result.data[0].shuttle,
							        cone: result.data[0].cone,
							        draft: result.data[0].dpos,
							        college: result.data[0].col,
							        start_year: result.data[0].start,
							        team: result.data[0].cteam,
							        touchdowns: average_td
			        			};

			        			/*Stat.collection.insert(stat, onInsert);

					            function onInsert(err, docs) {
					                if (err) {
					                    console.log(err);
					                    callback(null, err);
					                } else {
					                    console.info('stats were successfully stored.');
					                    callback(null);
					                }
					            }*/
					            console.log(stat);
					            callback(null,stat);
		        			}, function(err) {
		        				console.log(err);
		        				callback(null, err);
		        			});
		        		});
		        	}, function(err) {
		        		console.log(err);
		        		callback(null, err);
		        	});
	    		}

	    		requests.push(fetch);
	    	}
	    })
	    .on("end", function(){
	        async.series(requests, function (err, results) {
	        	if(err) {
	        		console.log(err);
	        	} else {
	        		//console.log(results);
	        		for(var i = 0; i < results.length; i++) {
	        			if(typeof results[i].error === 'undefined' || results[i].error === null) {
	        				Stat.collection.insert(results[i], onInsert);

					        function onInsert(err, docs) {
					            if (err) {
					                console.log(err);
					                //callback(null, err);
					            } else {
					                console.info('stats were successfully stored.');
					                //callback(null);
					            }
					        }
	        			}
	        		}
	        	}
	        });
	    });
	 
	stream.pipe(csvStream);
}

module.exports = PlayerCollection;