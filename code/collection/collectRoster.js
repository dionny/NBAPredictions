var unirest = require('unirest');
var express = require('express');
var fs = require('fs');
var app     = express();
var async = require('async');

var mongoose = require('mongoose');
var GameRecord = require('../models/GameRecord.js');
var Roster = require('../models/Roster.js');
var Bookmark = require('../models/Bookmark.js');
mongoose.connect('mongodb://localhost/NBAStats');

var functions = [];
var bookmark;

var teamMapping = {
    "ATL": 1610612737,
    "BOS": 1610612738,
    "BKN": 1610612751,
    "CHA": 1610612766,
    "CHI": 1610612741,
    "CLE": 1610612739,
    "DAL": 1610612742,
    "DEN": 1610612743,
    "DET": 1610612765,
    "GSW": 1610612744,
    "HOU": 1610612745,
    "IND": 1610612754,
    "LAC": 1610612746,
    "LAL": 1610612747,
    "WAS": 1610612764,
    "UTA": 1610612762,
    "TOR": 1610612761,
    "SAS": 1610612759,
    "SAC": 1610612758,
    "POR": 1610612757,
    "PHX": 1610612756,
    "PHI": 1610612755,
    "MEM": 1610612763,
    "MIA": 1610612748,
    "MIL": 1610612749,
    "MIN": 1610612750,
    "NOP": 1610612740,
    "NYK": 1610612752,
    "OKC": 1610612760,
    "ORL": 1610612753
};

function execute() {
	async.series(functions, function (err, results) {
		if(err) {
			console.log("Error: " + err);
			process.exit(1);
		} else {
			// console.log("has results");

			// for(var i = 0; i < results.length; i++) {
			// 	console.log("Result Loop: " + i);

			// 	if(!results[i])
			// 		continue;

			// 	console.log(results[i].resultSets[1].rowSet);

			// 	if(results[i].resultSets[1].rowSet.length > 0) {
			// 		var names = {};
			// 		var rows = results[i].resultSets[1].rowSet;

			// 		for(var j = 0; j < rows.length; j++) {
			// 			var row = rows[j];
			// 			var players = row[2];
			// 			var player_list = players.split("-");

			// 			for(var k = 0; k < player_list.length; k++) {
			// 				names[player_list[k].trim()] = true;
			// 			}
			// 		}

			// 		var roster = {
			// 			gameId: results[i].parameters.GameID,
			// 			teamId: results[i].parameters.TeamID,
			// 			players: names
			// 		}

			// 		Roster.collection.insert(roster, onInsert);

	  //               function onInsert(err, docs) {
	  //                   if (err) {
	  //                       console.log(err);
	  //                   } else {
	  //                       console.info('roster was successfully stored.');
	  //                   }
	  //               }
			// 	} 
			// }
		}
	});
}

function updateBookmark(gameId) {
	if(bookmark === null) {
		bookmark = gameId;
		var newbookmark = {mark: gameId, name: "roster"}
		Bookmark.collection.insert(newbookmark, function(err, doc) {
			if(err) {
				console.log(err);
			}
		});
	} else {
		Bookmark.collection.update({name: "roster"}, {$set : {mark: gameId}}, function(err, doc) {
			if(err) {
				console.log(err);
			}
		});
	}
}

function make_function(gameId, home, visiting, fullSeason) {
			var url_home = "http://stats.nba.com/stats/teamdashlineups?PlusMinus=N&pageNo=1&GroupQuantity=5"
				+ "&TeamID=" + home + "&GameID=" + gameId + "&Location=&SeasonType=Regular+Season&Season=" + fullSeason
				+ "&PaceAdjust=N&DateFrom=&sortOrder=DES&VsConference=&OpponentTeamID=0&DateTo=&GameSegment="
				+ "&LastNGames=0&VsDivision=&LeagueID=00&Outcome=&GameScope=&MeasureType=Base&PerMode=Per48"
				+ "&sortField=MIN&SeasonSegment=&Period=0&Rank=N&Month=0&rowsPerPage=100";

			var url_visiting = "http://stats.nba.com/stats/teamdashlineups?PlusMinus=N&pageNo=1&GroupQuantity=5"
				+ "&TeamID=" + visiting + "&GameID=" + gameId + "&Location=&SeasonType=Regular+Season&Season=" + fullSeason
				+ "&PaceAdjust=N&DateFrom=&sortOrder=DES&VsConference=&OpponentTeamID=0&DateTo=&GameSegment="
				+ "&LastNGames=0&VsDivision=&LeagueID=00&Outcome=&GameScope=&MeasureType=Base&PerMode=Per48"
				+ "&sortField=MIN&SeasonSegment=&Period=0&Rank=N&Month=0&rowsPerPage=100";

			console.log(url_home);

			var homecall = function(callback) {
				console.log("homecall: " + gameId);
				unirest.get(url_home).end(function (response) {
					if(response.body) {
						if(response.body.resultSets[1].rowSet.length > 0) {
							var names = {};
							var rows = response.body.resultSets[1].rowSet;

							for(var j = 0; j < rows.length; j++) {
								var row = rows[j];
								var players = row[2];
								var player_list = players.split("-");

								for(var k = 0; k < player_list.length; k++) {
									names[player_list[k].trim()] = true;
								}
							}

							var name_list = [];

							for (var key in names) {
							  if (names.hasOwnProperty(key)) {
							    name_list.push(key);
							  }
							}

							var roster = {
								gameId: response.body.parameters.GameID,
								teamId: response.body.parameters.TeamID,
								players: name_list
							}

							console.info('roster will be stored.');

							Roster.collection.insert(roster, onInsert);

							updateBookmark(gameId)

			                function onInsert(err, docs) {
			                    if (err) {
			                        console.log(err);
			                        callback(null);
			                    } else {
			                        console.info('roster was successfully stored.');
			                        callback(null);
			                    }
			                }

							//callback(null, roster);
						} else {
							updateBookmark(gameId)
							callback(null);
						}
					} else {
						updateBookmark(gameId)
						callback(null);
					}
				});
			}

			var visitcall = function(callback) {
				console.log("visitcall: " + gameId);
				unirest.get(url_visiting).end(function (response) {
					if(response.body) {
						if(response.body.resultSets[1].rowSet.length > 0) {
							var names = {};
							var rows = response.body.resultSets[1].rowSet;

							for(var j = 0; j < rows.length; j++) {
								var row = rows[j];
								var players = row[2];
								var player_list = players.split("-");

								for(var k = 0; k < player_list.length; k++) {
									names[player_list[k].trim()] = true;
								}
							}

							var name_list = [];

							for (var key in names) {
							    if (names.hasOwnProperty(key)) {
							        name_list.push(key);
							    }
							}

							var roster = {
								gameId: response.body.parameters.GameID,
								teamId: response.body.parameters.TeamID,
								players: name_list
							}

							console.info('roster will be stored.');

							Roster.collection.insert(roster, onInsert);

							updateBookmark(gameId)

			                function onInsert(err, docs) {
			                    if (err) {
			                        console.log(err);
			                        callback(null);
			                    } else {
			                        console.info('roster was successfully stored.');
			                        callback(null);
			                    }
			                }

							//callback(null, roster);
						} else {
							updateBookmark(gameId)
							callback(null);
						}
					} else {
						updateBookmark(gameId)
						callback(null);
					}
				});
			}

			functions.push(homecall);
			functions.push(visitcall);
}

function sort_data(err, docs) {
	if(err) {
			console.log("Error: " + err);
			process.exit(1);
	} else {
		for(var i = 0; i < docs.length; i++) {
			//console.log("DOC: " + docs);
			if(bookmark !== null && docs[i].gameId <= bookmark)
				continue;

			var gameId = docs[i].gameId;
			var home = teamMapping[docs[i].home];
			var visiting = teamMapping[docs[i].visiting];
			var fullSeason = docs[i].season + "-" + (docs[i].season + 1).toString().substr(2);

			make_function(gameId, home, visiting,fullSeason);
		}

		execute();
	}
}

function read_games() {
	// GameRecord.find({}).limit(1000).exec(function(err, docs) {
	// 	sort_data(err, docs);
	// });

	Bookmark.find({}).exec(function(err, doc) {
		if(err) {
			console.log("Got err");
			bookmark = null;
		} else if(doc.length > 0) {
			bookmark = doc[0].mark;
			console.log("Got bookmark " + bookmark);
		} else {
			console.log("Got nothing");
			bookmark = null;
		}

		GameRecord.find({}).sort({ gameId: 1 }).exec(function(errs, docs) {
			sort_data(errs, docs);
		});
	});
}

read_games();

















































