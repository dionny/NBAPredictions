/**
 * Created by dionnys on 4/23/16.
 */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var svm = require('../learning/svm');
var GameRecord = require('../models/GameRecord');

mongoose.connect('mongodb://127.0.0.1:27017/NBAStats');

function predictSeason(season) {

    async.waterfall([
            // Get all the games for this season.
            function (callback) {
                GameRecord.find({season: season}, {_id: 0, season: 0, home: 0, visiting: 0}, function (err, games) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, _.map(games, function (game) {
                            return game.toObject();
                        }));
                    }
                });
            },

            // Prepare training data.
            function (games, callback) {
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
                callback(null, output);
            },

            // Train on one game at a time.
            function (games, waterfallCallback) {
                var series = [];
                var runningAccuracy = 0;
                var timesRun = 0;

                for (var i = 0; i < games.length; i++) {
                    (function (e) {
                        var gamesThusFar = games.slice(0, e);
                        var thisGame = games[i];
                        series.push(function (callback) {

                            svm.train(season, gamesThusFar).then(function (model) {
                                var accuracy = 0;
                                if (model && model.data) {
                                    accuracy = JSON.parse(model.data)[1].accuracy;
                                }

                                timesRun++;
                                runningAccuracy += accuracy;
                                var avgAccuracy = runningAccuracy / timesRun;

                                console.log('Season: %d, Training based on first %d games, Accuracy: %d, Avg: %d',
                                    season,
                                    gamesThusFar.length,
                                    accuracy.toFixed(6),
                                    avgAccuracy.toFixed(6));

                                var prediction = svm.predict(season, thisGame);
                                callback(null, prediction);
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