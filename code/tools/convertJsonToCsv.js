/**
 * Created by Dionny on 4/17/2016.
 */
var json2csv = require('json2csv');
var fs = require('fs');

var args = process.argv.slice(2);
var jsonFile = args[0];

var resultFile = "";
if(args.length == 1) {
    resultFile = jsonFile.replace(".json", ".csv");
} else {
    resultFile = args[1];
}

fs.readFile(jsonFile, 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }

    json2csv({data: JSON.parse(data)}, function (err, csv) {
        if (err) {
            console.log(err);
        } else {
            fs.writeFile(resultFile, csv, function (err) {
                if (err) {
                    return console.log(err);
                }

                console.log('Done. Wrote ' + resultFile);
            });
        }
    });
});

