var _ = require('lodash');
var svm = require('node-svm');
var async = require('async');
var q = require('q');
var NBAClassifier = require('../classifiers/nbaClassifier');

function SVMClassifier() {
    var clf = {};
    clf.__proto__ = NBAClassifier();

    clf.identifier = function () {
        return "SVM Classifier";
    };

    clf.lastSeasonAmount = function (lastSeasonLength, currentSeasonLength) {
        return lastSeasonLength - currentSeasonLength / 4;
    };

    clf.train = function (identity, data) {
        var defer = q.defer();

        // Train.
        var clf = new svm.CSVC({
            c: [1],
            // gamma: [0.001, 0.01, 0.1, 0.2, 0.5, 0.8, 1.0, 1.5, 2.0, 5.0, 10.0, 100.0],
            // c: [0.1, 0.5, 1, 2, 4, 5, 8, 10, 20, 30, 50, 100],
            kFold: data.length < 10 ? data.length : 10,
            normalize: true,
            reduce: true, // default value
            retainedVariance: 0.95,
            kernelType: 'LINEAR'
        });

        clf.train(data).then(function (model) {
            defer.resolve(clf);
        });

        return defer.promise;
    };

    clf.predict = function (identity, model, data) {
        var defer = q.defer();

        if (!model) {
            defer.resolve(1);
        } else {
            defer.resolve(model.predictSync(data[0]));
        }

        return defer.promise;
    };

    clf.getExampleLabel = function (game) {
        return game[1];
    };

    return clf;
}

module.exports = SVMClassifier;