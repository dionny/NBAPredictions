/**
 * Created by dionnys on 4/16/16.
 */
var mongoose = require('mongoose');

var Stat = mongoose.model('Stat',
    {
        player: String,
        name: String,
        position: String,
        height: Number,
        weight: Number,
        birth: Date,
        forty: Number,
        bench: Number,
        vertical: Number,
        broad: Number,
        shuttle: Number,
        cone: Number,
        draft: Number,
        college: String,
        start_year: Number,
        team: String,
        touchdowns: Number
    });

module.exports = Stat;