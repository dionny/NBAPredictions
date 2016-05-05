/**
 * Created by dionnys on 4/16/16.
 */
var mongoose = require('mongoose');

var InjuryReport = mongoose.model('InjuryReport',
    {
        gameId: String,
        teamname: String,
        player: String
    });

module.exports = InjuryReport;