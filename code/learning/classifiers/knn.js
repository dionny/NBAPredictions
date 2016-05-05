/**
 * Created by dionnys on 4/24/16.
 */
var _ = require('lodash');
var NBAClassifier = require('../classifiers/nbaClassifier');
var kNN = require('k.n.n');
var q = require('q');

function NearestNeighborClassifier(k) {
    var clf = {};
    clf.__proto__ = NBAClassifier();

    clf.identifier = function () {
        return "Nearest Neighbor Classifier K=" + k;
    };

    clf.lastSeasonAmount = function (lastSeasonLength, currentSeasonLength) {
        return Math.max(0, 300 - currentSeasonLength / 4);
    };

    clf.load = function (currentSeason, lastSeason) {
        this.currentSeason = currentSeason;
        this.lastSeason = lastSeason;
        this.timesRun = 0;
        this.timesCorrect = 0;
        this.series = [];
    };

    clf.train = function (identity, data) {
        var defer = q.defer();

        var clonedData = JSON.parse(JSON.stringify(data));

        var trainingData = _.map(clonedData, function (example) {
            if (example.winningTeam === 1) {
                example.type = "HOME";
            } else {
                example.type = "VISITING";
            }
            delete example.winningTeam;
            return new kNN.Node(example);
        });

        var model = new kNN(trainingData);
        defer.resolve(model);

        return defer.promise;
    };

    clf.predict = function (identity, model, example) {
        var defer = q.defer();

        var exampleClone = JSON.parse(JSON.stringify(example));
        delete exampleClone.winningTeam;

        var results = model.launch(k, new kNN.Node(exampleClone));
        defer.resolve(results.type == "HOME" ? 1 : 0);

        return defer.promise;
    };

    clf.getExampleLabel = function (game) {
        return game.winningTeam;
    };

    return clf;
}

module.exports = NearestNeighborClassifier;