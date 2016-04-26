var _ = require('lodash');
var process = require('child_process');
var json2csv = require('json2csv');
var NBAClassifier = require('../classifiers/nbaClassifier');
var q = require('q');
var fs = require('fs');

function WekaClassifiers() {
    var clf = {};
    clf.__proto__ = NBAClassifier();

    clf.identifier = function () {
        return "Weka Classifier";
    };

    clf.load = function (currentSeason, lastSeason) {
        this.currentSeason = currentSeason;
        this.lastSeason = lastSeason;
        this.timesRun = 0;
        this.timesCorrect = 0;
        this.series = [];
        this.results = {};
    };

    clf.lastSeasonAmount = function (lastSeasonLength, currentSeasonLength) {
        return lastSeasonLength;
    };

    clf.train = function (identity, data) {
        var defer = q.defer();

        var clonedData = JSON.parse(JSON.stringify(data));

        var trainingData = _.map(clonedData, function (example) {
            if (example.winningTeam === 1) {
                example.winningTeam = "HOME";
            } else {
                example.winningTeam = "VISITING";
            }
            return example;
        });

        defer.resolve(trainingData);

        return defer.promise;
    };

    clf.predict = function (identity, model, data) {
        var defer = q.defer();

        var clonedData = JSON.parse(JSON.stringify(data));
        if (clonedData.winningTeam === 1) {
            clonedData.winningTeam = "HOME";
        } else {
            clonedData.winningTeam = "VISITING";
        }

        var allData = model.concat(clonedData);
        var first = allData[0].winningTeam;
        var opposite = first === "HOME" ? "VISITING" : "HOME";

        // Convert data to CSV.
        json2csv({data: allData}, function (err, csv) {
            if (err) {
                defer.reject(err);
            } else {
                fs.writeFile("wekaDecisionTree.csv", csv, function (err) {
                    if (err) {
                        defer.reject(err);
                    } else {
                        var child = require('child_process').spawn(
                            'java', ['-jar', 'WekaClassifier.jar', 'wekaDecisionTree.csv']
                        );

                        child.stderr.on('data', function (data) {
                            defer.reject(data.toString());
                        });

                        var predictions = [];
                        child.stdout.on('data', function (data) {
                            var output = data.toString().trim().split(' ');
                            var clf = output[0];
                            if (clf !== "") {
                                var prediction = output[1];

                                if (prediction === "0.0") {
                                    prediction = first;
                                } else {
                                    prediction = opposite;
                                }

                                if (clf.trim() === "") {
                                    console.log('the fuck?');
                                }

                                predictions.push({
                                    clf: clf,
                                    prediction: prediction == "HOME" ? 1 : 0
                                });
                            }
                        });

                        child.on('exit', function (data) {
                            defer.resolve(predictions);
                        });
                    }
                });
            }
        });

        return defer.promise;
    };

    clf.getExampleLabel = function (game) {
        return game.winningTeam;
    };

    return clf;
}

module.exports = WekaClassifiers;