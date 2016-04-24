/**
 * Created by dionnys on 4/24/16.
 */

var _ = require('lodash');
var async = require('async');
var q = require('q');

function NBAClassifier() {

    function load(currentSeason, lastSeason) {
        this.currentSeason = prepare(currentSeason);
        this.lastSeason = prepare(lastSeason);
        this.timesRun = 0;
        this.timesCorrect = 0;
        this.series = [];
    }

    function runGame(season, gameIndex) {
        var defer = q.defer();

        var gamesThusFar = this.lastSeason.concat(this.currentSeason.slice(0, gameIndex));
        var thisGame = this.currentSeason[gameIndex];

        train(season, gamesThusFar).then(function (model) {

            predict(season, model, thisGame).then(function (prediction) {

                this.timesRun++;
                if (prediction === thisGame[1]) {
                    this.timesCorrect++;
                }

                accuracy = (this.timesCorrect / this.timesRun).toFixed(6);

                console.log('[%s] Predicting game: %d. Correct? %s -- Number of Predictions: %d. Correct Predictions: %d. Accuracy: %d',
                    this.identifier(),
                    (gameIndex + 1),
                    prediction === thisGame[1] ? "Yes" : "No",
                    this.timesRun,
                    this.timesCorrect,
                    accuracy);

                defer.resolve(prediction);
            });

        });

        return defer.promise;
    }

    function runSeason(season) {
        var defer = q.defer();
        var self = this;
        for (var i = 0; i < this.currentSeason.length; i++) {
            (function (e) {
                var lastSeasonSlice = self.lastSeasonAmount(self.lastSeason.length, e);

                var gamesThusFar = self.lastSeason.slice(-lastSeasonSlice).concat(self.currentSeason.slice(0, e));
                var thisGame = self.currentSeason[i];
                self.series.push(function (callback) {

                    self.train(season, gamesThusFar).then(function (model) {

                        self.predict(season, model, thisGame).then(function (prediction) {

                            self.timesRun++;
                            if (prediction === thisGame[1]) {
                                self.timesCorrect++;
                            }

                            accuracy = (self.timesCorrect / self.timesRun).toFixed(6);

                            console.log('[%s] Predicting game: %d. Correct? %s -- Number of Predictions: %d. Correct Predictions: %d. Accuracy: %d',
                                self.identifier(),
                                (e + 1),
                                prediction === thisGame[1] ? "Yes" : "No",
                                self.timesRun,
                                self.timesCorrect,
                                accuracy);

                            callback(null, prediction);
                        });

                    });

                });
            })(i);
        }

        async.series(this.series, function (err, results) {
            if (err) {
                defer.reject(err);
            } else {
                defer.resolve(results);
            }
        });

        return defer.promise;
    }

    function prepare(data) {
        var output = [];
        _.forEach(data, function (example) {
            var vals = _.values(example);
            var last = vals[vals.length - 1];
            vals = vals.slice(0, vals.length - 1);
            output.push([vals, last]);
        });
        return output;
    }

    return {
        load: load,
        runGame: runGame,
        runSeason: runSeason
    }
}

module.exports = NBAClassifier;