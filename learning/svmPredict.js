/**
 * Created by dionnys on 4/21/16.
 */

var svm = require('node-svm');
var args = process.argv.slice(2);
var model = require('../datasets/' + args[0]);
var data = require('../datasets/' + args[1]);

var newClf = svm.restore(model[0]);
var totalCorrect = 0;
data.forEach(function (ex) {
    var prediction = newClf.predictSync(ex[0]);
    var actual = ex[1];
    if(prediction === actual) {
        totalCorrect++;
    }
});

console.log("Accuracy: " + (totalCorrect * 1.0 / data.length * 1.0));