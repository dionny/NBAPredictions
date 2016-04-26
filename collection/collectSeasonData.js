/**
 * Created by dionnys on 4/19/16.
 */
var unirest = require('unirest');
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var GameRecord = require('../models/GameRecord.js');
const assert = require('assert');

mongoose.connect('mongodb://localhost/NBAStats');

// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}

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

function get(headers, data, key) {
    return data[headers.indexOf(key)];
}

var seasons = [];
for (var i = 2000; i <= 2015; i++) {
    (function (e) {
        seasons.push(function (waterfallCallback) {
            var currentSeason = e;
            var gameInformation = [];

            async.waterfall([
                function (callback) {
                    var endingSeason = "-" + (currentSeason + 1).toString().substr(2);

                    var requests = [];
                    _.forOwn(teamMapping, function (teamId, team) {
                        var url = "http://stats.nba.com/stats/teamgamelog/?TeamID={0}&Season={1}&SeasonType=Regular%20Season"
                            .format(teamId, currentSeason + endingSeason);

                        requests.push(function (done) {
                            console.log('Collecting data for team: ' + team);
                            console.log('URL: ' + url);

                            unirest.get(url).end(function (response) {
                                var headers = response.body.resultSets[0].headers;
                                var games = response.body.resultSets[0].rowSet;

                                _.forEach(games, function (game) {
                                    var gameId = get(headers, game, "Game_ID");
                                    var matchup = get(headers, game, "MATCHUP");
                                    var wl = get(headers, game, "WL");
                                    var teamStats = {
                                        points: get(headers, game, "PTS")
                                    };

                                    var homeTeam;
                                    var visitingTeam;
                                    var newData;
                                    var winningTeam;

                                    if (matchup.indexOf(' vs. ') > -1) {
                                        homeTeam = team;
                                        visitingTeam = matchup.substr(8);
                                        newData = {
                                            homeStats: teamStats
                                        };
                                        winningTeam = wl === "W" ? "HOME" : "VISITING";
                                    } else {
                                        visitingTeam = team;
                                        homeTeam = matchup.substr(6);
                                        newData = {
                                            visitingStats: teamStats
                                        };
                                        winningTeam = wl === "W" ? "VISITING" : "HOME";
                                    }

                                    if (homeTeam === 'CHH') {
                                        homeTeam = "CHA";
                                    } else if (visitingTeam === 'CHH') {
                                        visitingTeam = 'CHA';
                                    }

                                    if (homeTeam === 'SEA') {
                                        homeTeam = "OKC";
                                    } else if (visitingTeam === 'SEA') {
                                        visitingTeam = 'OKC';
                                    }

                                    if (homeTeam === 'VAN') {
                                        homeTeam = "MEM";
                                    } else if (visitingTeam === 'VAN') {
                                        visitingTeam = 'MEM';
                                    }

                                    if (homeTeam === 'NJN') {
                                        homeTeam = "BKN";
                                    } else if (visitingTeam === 'NJN') {
                                        visitingTeam = 'BKN';
                                    }

                                    if (homeTeam === 'NOH') {
                                        homeTeam = "CHA";
                                    } else if (visitingTeam === 'NOH') {
                                        visitingTeam = 'CHA';
                                    }

                                    if (homeTeam === 'PHL') {
                                        homeTeam = "PHI";
                                    } else if (visitingTeam === 'PHL') {
                                        visitingTeam = 'PHI';
                                    }

                                    if (homeTeam === 'NOK') {
                                        homeTeam = "CHA";
                                    } else if (visitingTeam === 'NOK') {
                                        visitingTeam = 'CHA';
                                    }

                                    if (homeTeam === 'UTH') {
                                        homeTeam = "UTA";
                                    } else if (visitingTeam === 'UTH') {
                                        visitingTeam = 'UTA';
                                    }

                                    if (homeTeam === 'SAN') {
                                        homeTeam = "SAS";
                                    } else if (visitingTeam === 'SAN') {
                                        visitingTeam = 'SAS';
                                    }

                                    if (homeTeam === 'GOS') {
                                        homeTeam = "GSW";
                                    } else if (visitingTeam === 'GOS') {
                                        visitingTeam = 'GSW';
                                    }

                                    if (homeTeam === 'PHO') {
                                        homeTeam = "PHX";
                                    } else if (visitingTeam === 'PHO') {
                                        visitingTeam = 'PHX';
                                    }

                                    var matchingGame = _.find(gameInformation, {'id': gameId});
                                    if (!matchingGame) {
                                        matchingGame = {
                                            id: gameId,
                                            homeTeam: homeTeam,
                                            visitingTeam: visitingTeam,
                                            winningTeam: winningTeam,
                                            season: currentSeason,
                                            date: Date.parse(get(headers, game, "GAME_DATE"))
                                        };
                                        gameInformation.push(matchingGame);
                                    }

                                    _.extend(matchingGame, newData);
                                });

                                done(null);
                            });
                        });
                    });

                    async.series(requests, function (err, results) {
                        gameInformation = _.sortBy(gameInformation, 'date');
                        callback(null);
                    });
                },
                function (callback) {
                    GameRecord.remove({season: currentSeason}, function (err) {
                        if (err) {
                            console.log(err);
                            process.exit();
                        } else {
                            callback(null);
                        }
                    });
                },
                function (callback) {
                    /*
                     1. Win-Loss Percentage (Visitor Team)
                     2. Win-Loss Percentage (Home Team)
                     3. Point differential per game (Visitor Team)
                     4. Point differential per game (Home Team)
                     5. Win-loss percentage previous 8 games (Visitor Team)
                     6. Win-loss percentage previous 8 games (Home Team)
                     7. Visitor Team win-Loss percentage as visitor
                     8. Home Team win-Loss percentage at home
                     */

                    var teamStats = {};
                    _.forEach(_.keys(teamMapping), function (team) {
                        teamStats[team] = {
                            wins: 0,
                            gamesPlayed: 0,
                            scores: [],
                            gaveUp: [],
                            history: [],
                            winsAsVisitor: 0,
                            gamesAsVisitor: 0,
                            winsAsHome: 0,
                            gamesAsHome: 0
                        };
                    });

                    var gameRecords = [];

                    _.forEach(gameInformation, function (game) {
                        var homeStats = teamStats[game.homeTeam];
                        var visitingStats = teamStats[game.visitingTeam];

                        if (!homeStats) {
                            console.log(game.homeTeam);
                        }

                        if (!visitingStats) {
                            console.log(game.visitingTeam);
                        }

                        var last = 8;
                        var homeLastNGames = homeStats.history.slice(homeStats.history.length <= last ? 0 : homeStats.history.length - last);
                        var visitingLastNGames = visitingStats.history.slice(visitingStats.history.length <= last ? 0 : visitingStats.history.length - last);

                        var homeWinsLastNGames = _.filter(homeLastNGames, function (o) {
                            return o == 'W';
                        }).length;

                        var visitingWinsLastNGames = _.filter(visitingLastNGames, function (o) {
                            return o == 'W';
                        }).length;

                        var currentRecord = {
                            gameId: game.id,
                            date: game.date,
                            season: currentSeason,
                            gameId: game.id,
                            home: game.homeTeam,
                            visiting: game.visitingTeam,
                            homeWLP: (homeStats.wins / homeStats.gamesPlayed) || 0,
                            visitingWLP: (visitingStats.wins / visitingStats.gamesPlayed) || 0,
                            homeDiff: (_.sum(homeStats.scores) / homeStats.scores.length) - (_.sum(homeStats.gaveUp) / homeStats.gaveUp.length) || 0,
                            visitingDiff: (_.sum(visitingStats.scores) / visitingStats.scores.length) - (_.sum(visitingStats.gaveUp) / visitingStats.gaveUp.length) || 0,
                            homeLast8WLP: (homeWinsLastNGames / homeLastNGames.length) || 0,
                            visitingLast8WLP: (visitingWinsLastNGames / visitingLastNGames.length) || 0,
                            visitingWLPAsVisitor: (visitingStats.winsAsVisitor / visitingStats.gamesAsVisitor) || 0,
                            homeWLPAsHome: (homeStats.winsAsHome / homeStats.gamesAsHome) || 0,
                            winningTeam: game.winningTeam === "HOME" ? 1 : 0
                        };

                        assert(currentRecord.home);
                        assert(currentRecord.visiting);
                        assert(currentRecord.homeWLP >= 0 && currentRecord.homeWLP <= 1);
                        assert(currentRecord.visitingWLP >= 0 && currentRecord.visitingWLP <= 1);
                        assert(currentRecord.homeLast8WLP >= 0 && currentRecord.homeLast8WLP <= 1);
                        assert(currentRecord.visitingLast8WLP >= 0 && currentRecord.visitingLast8WLP <= 1);
                        assert(currentRecord.visitingWLPAsVisitor >= 0 && currentRecord.visitingWLPAsVisitor <= 1);
                        assert(currentRecord.homeWLPAsHome >= 0 && currentRecord.homeWLPAsHome <= 1);

                        var wp = game.winningTeam.toLowerCase() + 'Team';
                        var win = game[wp];
                        teamStats[win].wins++;

                        homeStats.gamesPlayed++;
                        visitingStats.gamesPlayed++;

                        homeStats.scores.push(game.homeStats.points);
                        homeStats.gaveUp.push(game.visitingStats.points);
                        homeStats.history.push(game.winningTeam === 'HOME' ? 'W' : 'L');
                        homeStats.gamesAsHome++;
                        homeStats.winsAsHome += (game.winningTeam === 'HOME') ? 1 : 0;

                        visitingStats.scores.push(game.visitingStats.points);
                        visitingStats.gaveUp.push(game.homeStats.points);
                        visitingStats.history.push(game.winningTeam === 'VISITING' ? 'W' : 'L');
                        visitingStats.gamesAsVisitor++;
                        visitingStats.winsAsVisitor += (game.winningTeam === 'VISITING') ? 1 : 0;

                        gameRecords.push(currentRecord);
                    });

                    GameRecord.collection.insert(gameRecords, function (err, docs) {
                        console.log("Season: " + currentSeason + ", Game Records saved: " + gameRecords.length);
                        callback(null);
                    });
                }
            ], function (err, result) {
                waterfallCallback(null);
            });
        });
    })(i);
}

async.series(seasons, function (err, results) {
    mongoose.connection.close();
});