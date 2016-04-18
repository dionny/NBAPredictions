var express = require('express');
var router = express.Router();
var assert = require('assert');
var json2csv = require('json2csv');
var fs = require('fs');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

var mongoUrl = 'mongodb://localhost:27017/NFLCrimes';

router.post('/csv/:name', function (req, res, next) {
    json2csv({data: req.body}, function (err, csv) {
        if (err) {
            res.send(err);
        } else {
            fs.writeFile(req.params.name + ".csv", csv, function (err) {
                if (err) {
                    return console.log(err);
                }
                res.download(req.params.name + ".csv");
            });
        }
    });
});

module.exports = router;