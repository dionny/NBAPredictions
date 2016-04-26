var _ = require('lodash');
var express = require('express');
var router = express.Router();
var assert = require('assert');
var json2csv = require('json2csv');
var mongoose = require('mongoose');
var GamePrediction = require('../models/GamePrediction');
var fs = require('fs');

mongoose.connect('mongodb://127.0.0.1:27017/NBAStats');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

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

router.get('/api/seasons', function (req, res, next) {
    return GamePrediction.find({}, "-_id season", function (err, docs) {
        if (err) {
            res.send(err);
        } else {
            res.json(_.sortBy(_.uniqBy(docs, function (d) {
                return d.season;
            }), function (d) {
                return d.season;
            }));
        }
    })
});

router.get('/api/predictions/:season', function (req, res, next) {
    return GamePrediction.find({season: req.params.season}, "-_id -gameId -group", function (err, docs) {
        if (err) {
            res.send(err);
        } else {
            res.json(_.groupBy(docs, function (d) {
                return d.gameIndex;
            }));
        }
    })
});

module.exports = router;