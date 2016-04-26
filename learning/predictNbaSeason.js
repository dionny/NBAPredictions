/**
 * Created by dionnys on 4/23/16.
 */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var SVMClassifier = require('../learning/classifiers/svm');
var LinearClassifier = require('../learning/classifiers/linearRegression');
var WekaClassifier = require('../learning/classifiers/wekaClassifiers');
var GameRecordForPrediction = require('../models/GameRecordForPrediction');
var GamePrediction = require('../models/GamePrediction');

mongoose.connect('mongodb://127.0.0.1:27017/NBAStats');

function findMajorityElement(arr, size) {
    var count = 0, i, majorityElement;
    for (i = 0; i < size; i++) {
        if (count == 0)
            majorityElement = arr[i];
        if (arr[i] == majorityElement)
            count++;
        else
            count--;
    }
    count = 0;
    for (i = 0; i < size; i++)
        if (arr[i] == majorityElement)
            count++;
    if (count > size / 2)
        return majorityElement;
    return -1;
}

function getGamesForSeason(season, callback) {
    GameRecordForPrediction.find({season: season}, {_id: 0, season: 0, home: 0, visiting: 0, gameId: 0},
        function (err, games) {
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

function predictSeason(season, group, finished) {

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

                // var knn = new KNNClassifier(40);
                // knn.load(currentSeason, lastSeason);

                var weka = new WekaClassifier();
                weka.load(currentSeason, lastSeason);

                var tests = [
                    function (callback) {
                        weka.runSeason(season).then(function (results) {
                            callback(null, results);
                        });
                    },
                    function (callback) {
                        lr.runSeason(season).then(function (results) {
                            callback(null, results);
                        });
                    },
                    // function (callback) {
                    //     knn.runSeason(season).then(function (results) {
                    //         callback(null, results);
                    //     });
                    // },
                    function (callback) {
                        svm.runSeason(season).then(function (results) {
                            callback(null, results);
                        });
                    }
                ];

                async.series(tests, function (err, results) {
                    if (err) {
                        waterfallCallback(err);

                    } else {
                        var ensemblePredictions = [];

                        var timesRun = 0;
                        var timesCorrect = 0;
                        var accuracy = 0;

                        for (var i = 0; i < results[0].length; i++) {
                            var currentGame = currentSeason[i];

                            var nestedPredictions = _.map(results, function (clf) {
                                return clf[i];
                            });

                            var currentGamePredictions = [];
                            _.forEach(nestedPredictions, function (p) {
                                if (p.constructor === Array) {
                                    var predictions = _.map(p, function (o) {
                                        return o.prediction;
                                    });
                                    currentGamePredictions = currentGamePredictions.concat(predictions);
                                } else {
                                    currentGamePredictions.push(p);
                                }
                            });

                            var prediction =
                                findMajorityElement(currentGamePredictions, currentGamePredictions.length);

                            if (prediction === currentGame.winningTeam) {
                                timesCorrect++;
                            }

                            timesRun++;

                            accuracy = (timesCorrect / timesRun).toFixed(6);

                            console.log('[%s] Predicting game: %d. Correct? %s -- Number of Predictions: %d. Correct Predictions: %d. Accuracy: %d',
                                "Ensemble",
                                (i + 1),
                                prediction === currentGame.winningTeam ? "Yes" : "No",
                                timesRun,
                                timesCorrect,
                                accuracy);

                            prediction = {
                                clf: "Ensemble",
                                prediction: prediction,
                                actual: currentGame.winningTeam,
                                gameIndex: i,
                                gameId: currentGame.gameId,
                                accuracy: accuracy,
                                season: season
                            };

                            ensemblePredictions.push(prediction);
                        }

                        var allPredictions = _.flattenDeep(results).concat(ensemblePredictions);

                        _.forEach(allPredictions, function (prediction) {
                            prediction.group = group;
                        });

                        GamePrediction.remove({season: season, group: group}, function (err) {
                            GamePrediction.collection.insert(allPredictions, function (err) {
                                waterfallCallback(null, results);
                            })
                        });
                    }
                });
            }
        ],

        function (err, results) {
            if (err) {
                console.log(err);
            } else {
                // console.log(results);
                finished();
            }
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

var group = 'entire_last_season';
predictSeason(2011, group, function () {
    predictSeason(2012, group, function () {
        predictSeason(2013, group, function () {
            predictSeason(2014, group, function () {
                predictSeason(2015, group, function () {
                    mongoose.connection.close();
                });
            });
        });
    });
});
// predictGame(2015, 100);

module.exports = {
    predictSeason: predictSeason
};