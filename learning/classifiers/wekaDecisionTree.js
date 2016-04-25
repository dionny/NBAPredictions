var _ = require('lodash');
var process = require('child_process');
var json2csv = require('json2csv');
var NBAClassifier = require('../classifiers/nbaClassifier');
var q = require('q');
var fs = require('fs');

function DecisionTreeClassifier() {
    var clf = {};
    clf.__proto__ = NBAClassifier();

    clf.identifier = function () {
        return "Decision Tree Classifier";
    };

    clf.load = function (currentSeason, lastSeason) {
        this.currentSeason = currentSeason;
        this.lastSeason = lastSeason;
        this.timesRun = 0;
        this.timesCorrect = 0;
        this.series = [];
    };

    clf.lastSeasonAmount = function (lastSeasonLength, currentSeasonLength) {
        return lastSeasonLength - currentSeasonLength * 0.4;
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

                        child.stdout.on('data', function (data) {
                            var prediction = data.toString().trim();
                            if (prediction === "0.0") {
                                prediction = first;
                            } else {
                                prediction = opposite;
                            }
                            defer.resolve(prediction == "HOME" ? 1 : 0);
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

module.exports = DecisionTreeClassifier;