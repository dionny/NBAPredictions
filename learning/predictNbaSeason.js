/**
 * Created by dionnys on 4/23/16.
 */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var SVMClassifier = require('../learning/classifiers/svm');
var LinearClassifier = require('../learning/classifiers/linearRegression');
var KNNClassifier = require('../learning/classifiers/knn');
var DecisionTreeClassifier = require('../learning/classifiers/wekaDecisionTree');
var GameRecord = require('../models/GameRecord');

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
                // var svm = new SVMClassifier();
                // svm.load(currentSeason, lastSeason);
                //
                // var lr = new LinearClassifier({
                //     algorithm: 'NormalEquation'
                // });
                //
                // lr.load(currentSeason, lastSeason);
                //
                // var knn = new KNNClassifier(40);
                // knn.load(currentSeason, lastSeason);

                var knnTests = [];
                // for (var k = 1; k <= 10; k++) {
                //     (function(e) {
                //         knnTests.push(
                //             function (callback) {
                //                 var knn = new KNNClassifier(e);
                //                 knn.load(currentSeason, lastSeason);
                //                 knn.runSeason(season).then(function (results) {
                //                     callback(null, results);
                //                 });
                //             }
                //         );
                //     })(k);
                // }

                var dt = new DecisionTreeClassifier();
                dt.load(currentSeason, lastSeason);

                knnTests = knnTests.concat([
                    function (callback) {
                        dt.runSeason(season).then(function (results) {
                            callback(null, results);
                        });
                    },
                    // function (callback) {
                    //     lr.runSeason(season).then(function (results) {
                    //         callback(null, results);
                    //     });
                    // },
                    // function (callback) {
                    //     knn.runSeason(season).then(function (results) {
                    //         callback(null, results);
                    //     });
                    // },
                    // function (callback) {
                    //     svm.runSeason(season).then(function (results) {
                    //         callback(null, results);
                    //     });
                    // }
                ]);

                async.series(knnTests, function (err, results) {
                    if (err) {
                        waterfallCallback(err);
                    } else {

                        var timesRun = 0;
                        var timesCorrect = 0;
                        var accuracy = 0;

                        for (var i = 0; i < results[0].length; i++) {
                            var currentGame = currentSeason[i];

                            var currentGamePredictions = _.map(results, function (clf) {
                                return clf[i];
                            });

                            var prediction =
                                findMajorityElement(currentGamePredictions, currentGamePredictions.length);

                            if(prediction === currentGame.winningTeam) {
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
                        }

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