var mongoose = require('mongoose');
var GameRecord = require('../models/GameRecord.js');
var Roster = require('../models/Roster.js');
var Injury = require('../models/Injury.js');
var InjuryReport = require('../models/InjuryReport.js');
mongoose.connect('mongodb://localhost/NBAStats');

function injury_lookup(game, roster) {
    var players = roster.players;
    var time = game.date;

    for (var i = 0; i < players.length; i++) {
        var name = players[i];
        var name_array = name.split(",");
        var last_name = name_array[0];
        var first_name = name_array[1];
        var namex = RegExp(".*" + first_name + " " + last_name + ".*");
        console.log(namex);

        Injury.find({time: {$lte: time}, name: namex}).sort({time: -1}).limit(1).exec(function (err, docs) {
            if (err) {
                console.log(err);
                //callback(null);
            } else if (docs.length === 0) {
                //console.log("no matches");
            } else {
                console.log("Going Through");
                var report = docs[0];

                if (report.status === 'off') {
                    var result = {
                        gameId: game.gameId,
                        teamname: report.team,
                        player: name
                    }

                    InjuryReport.collection.insert(result, onInsert);

                    function onInsert(err, docs) {
                        if (err) {
                            console.log(err);
                            //callback(null);
                        } else {
                            console.info('roster was successfully stored.');
                            //callback(null);
                        }
                    }
                } else {
                    //callback(null);
                }
            }
        });
    }
}

function solve_game(doc) {
    //var game_rosters = function(callback){
    Roster.find({gameId: doc.gameId}).exec(function (err, docs) {
        if (err) {
            console.log(err);
            //callback(null);
        } else {
            for (var i = 0; i < docs.length; i++) {
                injury_lookup(doc, docs[i]);
            }
        }
    });
    //}
}

function calculate() {
    GameRecord.find({season: {$gte: "2011"}}).exec(function (err, docs) {
        if (err) {
            console.log(err);
            process.exit(1);
        } else {
            for (var i = 0; i < docs.length; i++) {
                solve_game(docs[i]);
            }
        }
    });
}

calculate();