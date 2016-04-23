/**
 * Created by dionnys on 4/23/16.
 */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var svm = require('../learning/svm');
var GameRecord = require('../models/GameRecord');

mongoose.connect('mongodb://127.0.0.1:27017/NBAStats');

function prepare(games) {
    var output = [];
    _.forEach(games, function (game) {
        var vals = _.values(game);
        var last = vals[vals.length - 1];
        vals = vals.slice(0, vals.length - 1);

        if (last === 'HOME') {
            last = 1;
        } else {
            last = 0;
        }

        output.push([vals, last]);
    });
    return output;
}

function getGamesForSeason(season, callback) {
    GameRecord.find({season: season}, {_id: 0, season: 0, home: 0, visiting: 0}, function (err, games) {
        if (err) {
            callback(err);
        } else {
            var mapped = _.map(games, function (game) {
                return game.toObject();
            });

            callback(prepare(mapped));
        }
    });
}

function predictSeason(season) {

    async.waterfall([
            function (callback) {
                getGamesForSeason(season, function (data) {
                    callback(null, data);
                });
            },

            function (currentSeason, callback) {
                getGamesForSeason(season - 1, function (data) {
                    callback(null, currentSeason, data);
                });
            },

            // Train on one game at a time.
            function (currentSeason, lastSeason, waterfallCallback) {
                var series = [];
                var timesRun = 0;
                var timesCorrect = 0;

                for (var i = 0; i < currentSeason.length; i++) {
                    (function (e) {
                        var gamesThusFar = lastSeason.concat(currentSeason.slice(0, e));
                        var thisGame = currentSeason[i];
                        series.push(function (callback) {

                            svm.train(season, gamesThusFar).then(function (model) {

                                svm.predict(season, thisGame).then(function (prediction) {

                                    timesRun++;
                                    if (prediction === thisGame[1]) {
                                        timesCorrect++;
                                    }

                                    accuracy = (timesCorrect / timesRun).toFixed(6);

                                    console.log('Season: %d, Training based on first %d games, Accuracy: %d',
                                        season,
                                        gamesThusFar.length,
                                        accuracy);

                                    callback(null, prediction);
                                });

                            });

                        });
                    })(i);
                }

                async.series(series, function (err, results) {
                    console.log('done');
                    waterfallCallback(null, results);
                });
            }
        ],

        function (err, results) {
            if (err) {
                console.log(err);
            } else {
                // console.log(results);
            }

            mongoose.connection.close();
        });
}

predictSeason(2015);

module.exports = {
    predictSeason: predictSeason
};