/**
 * Created by dionnys on 4/19/16.
 */
var mongoose = require('mongoose');

var gameRecordSchema = new mongoose.Schema({
    gameId: String,
    date: String,
    season: Number,
    home: String,
    visiting: String,
    homeInjuries: Number,
    visitingInjuries: Number,
    homeWLP: Number,
    visitingWLP: Number,
    homeDiff: Number,
    visitingDiff: Number,
    homeLast8WLP: Number,
    visitingLast8WLP: Number,
    visitingWLPAsVisitor: Number,
    homeWLPAsHome: Number,
    winningTeam: Number,
    gameId: String
});

module.exports = mongoose.model('gamerecord', gameRecordSchema);