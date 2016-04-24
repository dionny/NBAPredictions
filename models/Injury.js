/**
 * Created by dionnys on 4/16/16.
 */
var mongoose = require('mongoose');

var Injury = mongoose.model('Injury',
    {
        date: String,
        team: String,
        name: String,
        status: String
    });

module.exports = Injury;