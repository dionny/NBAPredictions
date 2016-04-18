/**
 * Created by Dionny on 4/17/2016.
 */
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var Arrest = require('../models/Arrest.js');
var Stat = require('../models/Stat.js');
var StatArrests = require('../models/StatArrest.js');

mongoose.connect('mongodb://localhost/NFLCrimes');

function _calculateAge(birthday) { // birthday is a date
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

async.waterfall([
    // First, get all of the player stats.
    function (callback) {
        Stat.find().exec(function (err, stats) {

            // Remove extra Mongoose decorations.
            stats = _.map(stats, function (stat) {
                if (!stat.touchdowns) {
                    stat.touchdowns = 0;
                }

                var age = _calculateAge(new Date(stat.birth, 1, 1));
                var clean = stat.toObject();
                clean.age = age;
                delete clean.id;
                delete clean._id;
                delete clean.birth;
                return clean;
            });

            callback(null, stats);
        });
    },

    // Then, get the crime information for each player.
    function (stats, callback) {
        Arrest.find().exec(function (err, arrests) {

            // Remove extra Mongoose decorations.
            arrests = _.map(arrests, function (arrest) {
                return arrest.toObject();
            });

            callback(null, stats, arrests);
        });
    },

    // Now, combine the data.
    function (stats, arrests, callback) {
        var numberOfPlayersArrested = 0;
        _.forEach(stats, function (stat) {
            var playerArrests = _.filter(arrests, function (arrest) {
                return arrest.Name.trim() === stat.name.trim();
            });

            stat.times_arrested = playerArrests.length;
            stat.arrested = "N";

            if (stat.times_arrested > 0) {
                stat.arrested = "Y";
                numberOfPlayersArrested++;
                console.info('%s has been arrested %d times.', stat.name.trim(), stat.times_arrested);
            }
        });

        StatArrests.collection.insert(stats, onInsert);

        function onInsert(err, docs) {
            if (err) {
                console.log(err);
            } else {
                console.info('Processed %d players, of which %d have been arrested. Successfully stored this information in the StatArrests collection.', stats.length, numberOfPlayersArrested);
                callback(null);
            }
        }
    }

], function (err, result) {
    mongoose.connection.close();
});

