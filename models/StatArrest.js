/**
 * Created by dionnys on 4/16/16.
 */
var mongoose = require('mongoose');

var StatArrest = mongoose.model('StatArrest',
    {
        player: String,
        name: String,
        position: String,
        height: Number,
        weight: Number,
        age: Number,
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
        touchdowns: Number,
        times_arrested: Number,
        arrested: String
    });

module.exports = StatArrest;