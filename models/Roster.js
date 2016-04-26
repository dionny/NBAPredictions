/**
 * Created by dionnys on 4/16/16.
 */
var mongoose = require('mongoose');

var Roster = mongoose.model('Roster',
    {
        gameId: String,
        teamId: String,
        players: Array
    });

module.exports = Roster;