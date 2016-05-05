/**
 * Created by dionnys on 4/16/16.
 */
var mongoose = require('mongoose');

var Arrest = mongoose.model('Arrest',
    {
        arrest_stats_id: Number,
        Date: Date,
        Team: String,
        Name: String,
        Position: String,
        Encounter: String,
        Category: String,
        Description: String,
        Outcome: String,
        general_category_id: Number,
        legal_level_id: Number,
        resolution_category_id: Number
    });

module.exports = Arrest;