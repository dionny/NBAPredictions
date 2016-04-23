var args = process.argv.slice(2);
var jsonFile = args[0];
var so = require('stringify-object');
var Q = require('q');
var svm = require('node-svm');
var fs = require('fs');

var trainingFile = '../datasets/' + jsonFile;
var trainedModelFile = trainingFile.replace('.json', '.trained.json');

var clf = new svm.CSVC({
    gamma: [0.001, 0.01, 0.1, 0.2, 0.5, 0.8, 1.0, 1.5, 2.0, 5.0, 10.0, 100.0],
    c: [0.1, 0.5, 1, 2, 4, 5, 8, 10, 20, 30, 50, 100],
    kFold: 10,
    normalize: true,
    reduce: true, // default value
    retainedVariance: 0.95
});

Q.all([
    svm.read(trainingFile),
    svm.read('../datasets/2015.json')
]).spread(function (trainingSet, testSet) {
    return clf.train(trainingSet)
        .then(function (trainedModel) {
            // Save this model.
            fs.writeFile(trainedModelFile, JSON.stringify(trainedModel, null, 2), function (err) {
                if (err) {
                    return console.log(err);
                }

                console.log('Persisted training model: ' + trainedModelFile);
            });

            return clf.evaluate(testSet);
        });
}).done(function (evaluationReport) {
    console.log('Accuracy against the test set:\n', so(evaluationReport));
});