/**
 * Created by dionnys on 4/16/16.
 */

var unirest = require('unirest');
var _ = require('lodash');

var method = GameDataCollection.prototype;

function GameDataCollection() {
}

method.GetPlayerByName = function(first_name, last_name, callback, error_handler) {
	unirest.get('http://armchairanalysis.com/api/1.0/player/' + first_name + '_' + last_name)
		.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
		.end(function (response) {
		  	console.log(response.body);

		  	if(response.code === 200) {
		  		callback(response.body);
		  	} else {
		  		error_handler(response.body);
		  	}
		}
	);
}

method.GetPlayerOffensiveStats = function(player_id, callback, error_handler) {
	unirest.get('http://armchairanalysis.com/api/1.0/player/' + player_id + '/offense')
		.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
		.end(function (response) {
		  	console.log(response.body);

		  	if(response.code === 200) {
		  		callback(response.body);
		  	} else {
		  		error_handler(response.body);
		  	}
		}
	);
}

method.GetPlayerDefensiveStats = function(player_id, callback, error_handler) {
	unirest.get('http://armchairanalysis.com/api/1.0/player/' + player_id + '/defense')
		.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
		.end(function (response) {
		  	console.log(response.body);

		  	if(response.code === 200) {
		  		callback(response.body);
		  	} else {
		  		error_handler(response.body);
		  	}
		}
	);
}

method.GetPlayerPenalties = function(player_id, callback, error_handler) {
	unirest.get('http://armchairanalysis.com/api/1.0/player/' + player_id + '/penalties')
		.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
		.end(function (response) {
		  	console.log(response.body);

		  	if(response.code === 200) {
		  		callback(response.body);
		  	} else {
		  		error_handler(response.body);
		  	}
		}
	);
}

method.ExtractOffensiveData = function(offensive_stats) {
	var offensive_stats_list = offensive_stats.data;
	var touchdown_count = 0;

	for(var games = 0; games < offensive_stats_list.length; games++) {
		var offensive_stat = offensive_stats_list[games];
		touchdown_count += offensive_stat.tdp;
		touchdown_count += offensive_stat.tdr;
		touchdown_count += offensive_stat.tdrec;
		touchdown_count += offensive_stat.tdret;
	}

	var average_touchdowns = touchdown_count / offensive_stats_list.length;
	return average_touchdowns;
}

method.ExtractDefensiveData = function(defensive_stats) {
	var defensive_stats_list = defensive_stats.data;
	var touchdown_count = 0;

	for(var games = 0; games < defensive_stats_list.length; games++) {
		var defensive_stat = defensive_stats_list[games];
		touchdown_count += defensive_stat.tdd;
		touchdown_count += defensive_stat.tdret;
	}
}

module.exports = GameDataCollection;
















































