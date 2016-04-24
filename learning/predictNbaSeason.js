/**
 * Created by dionnys on 4/23/16.
 */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var SVMClassifier = require('../learning/classifiers/svm');
var LinearClassifier = require('../learning/classifiers/linearRegression');
var GameRecord = require('../models/GameRecord');

mongoose.connect('mongodb://127.0.0.1:27017/NBAStats');

function getGamesForSeason(season, callback) {
    GameRecord.find({season: season}, {_id: 0, season: 0, home: 0, visiting: 0}, function (err, games) {
        if (err) {
            callback(err);
        } else {
            var mapped = _.map(games, function (game) {
                return game.toObject();
            });

            callback(mapped);
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
                getGamesForSeason(season - 1, function (lastSeason) {
                    callback(null, currentSeason, lastSeason);
                });
            },

            // Train on one game at a time.
            function (currentSeason, lastSeason, waterfallCallback) {
                var svm = new SVMClassifier();
                svm.load(currentSeason, lastSeason);

                var lr = new LinearClassifier({
                    algorithm: 'NormalEquation'
                });

                lr.load(currentSeason, lastSeason);

                async.parallel([
                    function (callback) {
                        lr.runSeason(season).then(function (results) {
                            callback(null, results);
                        });
                    },
                    function (callback) {
                        svm.runSeason(season).then(function (results) {
                            callback(null, results);
                        });
                    }
                ], function (err, results) {
                    if (err) {
                        waterfallCallback(err);
                    } else {
                        waterfallCallback(null, results);
                    }
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

function predictGame(season, gameIndex) {

    async.waterfall([
            function (callback) {
                getGamesForSeason(season, function (data) {
                    callback(null, data);
                });
            },

            function (currentSeason, callback) {
                getGamesForSeason(season - 1, function (lastSeason) {
                    lastSeason = lastSeason.slice(-100);
                    callback(null, currentSeason, lastSeason);
                });
            },

            // Train on one game at a time.
            function (currentSeason, lastSeason, waterfallCallback) {
                var svm = new SVMClassifier(currentSeason, lastSeason);

                async.parallel([
                    function (callback) {
                        svm.runGame(season, gameIndex).then(function (results) {
                            callback(null, results);
                        });
                    }
                ], function (err, results) {
                    if (err) {
                        waterfallCallback(err);
                    } else {
                        waterfallCallback(null, results);
                    }
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

predictSeason(2014);
// predictGame(2015, 100);

module.exports = {
    predictSeason: predictSeason
};