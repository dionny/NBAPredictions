var weka = require('node-weka');
var Arff = require('arff-utils');

var arff = new Arff.ArffWriter("parsearf");
arff.addNumericAttribute("num");
arff.addStringAttribute("str");
arff.addNominalAttribute("nom");
arff.addDateAttribute("dt");

//read lines 1 - 4 from test.csv and auto insert nominal values according to data:
arff.parseCsv('test.csv', process.stdout, {
    autoNominals: true,
    start: 1,
    count: 3
});

//See Weka Documentation
var options = {
    //'classifier': 'weka.classifiers.bayes.NaiveBayes',
    'classifier': 'weka.classifiers.functions.SMO',
    'params'    : ''
};

var testData = {
    outlook    : 'sunny',
    windy      : 'TRUE',
    temperature: 30,
    humidity   : 2,
    play       : 'no' // last is class attribute
};

weka.classify(data, testData, options, function (err, result) {

    console.log(result); //{ predicted: 'yes', prediction: '1' }

});