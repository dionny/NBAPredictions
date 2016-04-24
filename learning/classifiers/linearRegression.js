var NBAClassifier = require('../classifiers/nbaClassifier');
var LinearRegression = require('shaman').LinearRegression;
var q = require('q');

function LinearClassifier(algorithm) {
    var clf = {};
    clf.__proto__ = NBAClassifier();

    clf.identifier = function () {
        return "Linear Classifier";
    };

    clf.lastSeasonIncludeAmount = function (lastSeasonLength) {
        return 300;
    };

    clf.train = function (identity, data) {
        var defer = q.defer();

        // Train.
        if (!data.length) {
            callback(null, {});
            return;
        }

        var X = data.map(function (r) {
            return r[0];
        });

        var y = data.map(function (r) {
            return r[1];
        });

        var lr = new LinearRegression(X, y, algorithm);

        lr.train(function (err) {
            if (err) {
                defer.reject(err);
            } else {
                defer.resolve(lr);
            }
        });

        return defer.promise;
    };

    clf.predict = function (identity, model, data) {
        var defer = q.defer();
        if (model.predict(data[0]) < 0.5) {
            defer.resolve(0);
        } else {
            defer.resolve(1);
        }
        return defer.promise;
    };

    return clf;
}

module.exports = LinearClassifier;