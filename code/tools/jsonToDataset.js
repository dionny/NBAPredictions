/**
 * Created by dionnys on 4/21/16.
 */

var args = process.argv.slice(2);
var jsonFile = args[0];
var json = require('../' + jsonFile);
var fs = require('fs');
var _ = require('lodash');

var output = [];
_.forEach(json, function(game) {
    var vals = _.values(game);
    var last = vals[vals.length - 1];
    vals = vals.slice(0, vals.length - 1);
    
    if(last === 'HOME') {
        last = 1;
    } else {
        last = 0;
    }
    
    output.push([vals,last]);
});

var resultFile = "datasets/" + args[1] + ".json";
fs.writeFile(resultFile, JSON.stringify(output, null, 2), function (err) {
    if (err) {
        return console.log(err);
    }

    console.log('Done. Wrote ' + resultFile);
});