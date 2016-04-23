var svm = require('node-svm');
var async = require('async');
var q = require('q');
var Classifier = require('../models/Classifier');

function train(identity, data) {
    var defer = q.defer();

    async.waterfall([
            // Remove this classifier from Mongo.
            function (callback) {
                Classifier.remove({key: identity}, function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null);
                    }
                });
            },

            // Train.
            function (callback) {
                if (!data.length) {
                    callback(null, {});
                    return;
                }

                var clf = new svm.CSVC({
                    // gamma: [0.01],
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
                    var classifier = new Classifier({type: 'svm', key: identity, data: JSON.stringify(model)});
                    classifier.save(function (err, doc) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, doc);
                        }
                    })
                });
            }
        ],

        function (err, results) {
            if (err) {
                defer.reject(err);
            } else {
                defer.resolve(results);
            }
        });

    return defer.promise;
}

function predict(identity, data) {
    var defer = q.defer();

    async.waterfall([
            function (callback) {
                Classifier.findOne({key: identity, type: 'svm'}, function (err, doc) {
                    if (err) {
                        callback(err);
                    } else {
                        if (!doc) {
                            callback(null, null);
                        } else {
                            callback(null, JSON.parse(doc.toObject().data));
                        }
                    }
                });
            },

            function (model, callback) {
                if (!model) {
                    callback(null, 1);
                } else {
                    var clf = svm.restore(model[0]);
                    callback(null, clf.predictSync(data[0]));
                }
            }
        ],
        function (err, results) {
            if (err) {
                defer.reject(err);
            } else {
                defer.resolve(results);
            }
        });

    return defer.promise;
}

module.exports = {
    train: train,
    predict: predict
};