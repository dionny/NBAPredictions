/**
 * Created by dionnys on 4/19/16.
 */
var mongoose = require('mongoose');

var gamePredictionSchema = new mongoose.Schema({
    group: String,
    clf: String,
    season: Number,
    gameIndex: Number,
    prediction: Number,
    actual: Number,
    accuracy: Number
});

module.exports = mongoose.model('gameprediction', gamePredictionSchema);