/**
 * Created by dionnys on 4/16/16.
 */
var mongoose = require("mongoose");

var classifierSchema = new mongoose.Schema({
    key:  String,
    data: String,
    type: String
});

module.exports = mongoose.model('classifier', classifierSchema);