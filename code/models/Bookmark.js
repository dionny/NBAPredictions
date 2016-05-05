/**
 * Created by dionnys on 4/16/16.
 */
var mongoose = require('mongoose');

var Bookmark = mongoose.model('Bookmark',
    {
        gameId: String,
        mark: String
    });

module.exports = Bookmark;