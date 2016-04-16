/**
 * Created by dionnys on 4/16/16.
 */
var unirest = require('unirest');
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var Arrest = require('../models/Arrest.js');

mongoose.connect('mongodb://localhost/NFLCrimes');

async.waterfall([
    function (callback) {
        console.log('Collecting crime categories...');
        unirest.get("http://nflarrest.com/api/v1/crime").end(function (response) {
            callback(null, response);
        });
    },
    function (response, callback) {
        var paths = _.map(JSON.parse(response.body), function (crime) {
            return "http://nflarrest.com/api/v1/crime/arrests/" + encodeURIComponent(crime.Category);
        });
        callback(null, paths);
    },
    function (paths, callback) {
        var requests = _.map(paths, function (path) {
            return function (callback) {
                unirest.get(path).end(function (response) {
                    callback(null, JSON.parse(response.body));
                });
            }
        });

        console.log('Collecting arrest information...');

        async.series(requests, function (err, results) {
            var flat = _.flatten(results);
            console.log('Collected %d results...', flat.length);

            Arrest.collection.insert(flat, onInsert);

            function onInsert(err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.info('%d arrests were successfully stored.', flat.length);
                    callback(null);
                }
            }
        });
    }
], function (err, result) {
    mongoose.connection.close();
});