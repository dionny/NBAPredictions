var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var async = require('async');

var mongoose = require('mongoose');
var Injury = require('../models/Injury.js');
mongoose.connect('mongodb://localhost/NBAStats');

var request_list = [];

function buildlist(startpage) {
        var call = function(callback) {
            var url = "http://www.prosportstransactions.com/basketball/Search/SearchResults.php?" + 
                "Player=&Team=&BeginDate=&EndDate=&ILChkBx=yes&Submit=Search&start=" + startpage;

            request(url, function(error, response, html) {
                if(error) {
                    console.log("Error on start page " + startpage + ": " + error);
                    callback(null);
                } else {
                    var dom = cheerio.load(html);
                    var injury = [];

                    dom('.datatable.center').filter(function(){
                        var data = dom(this);
                        var body = data.children();
                        //console.log("Interim results: " + body);
                        body.each(function() {
                            //console.log(this.name);
                            for(var i = 0; i < this.children.length; i++) {
                                if(this.children[i].type === 'tag' && this.children[i].name === 'td') {
                                    //console.log(this.children[i].children);
                                    injury.push(this.children[i].children[0].data);
                                }
                            }
                        });
                    });

                    //console.log(injury);
                    callback(null, injury);
                }
            });
        };

        request_list.push(call);
}

for(i = 0; i <= 50; i+=25) {
    buildlist(i);
}

console.log("READY");

function isEmpty(str) {
    return (!str || 0 === str.length || !str.trim());
}

async.series(request_list, function (err, results) {
    if(err) {
        console.log("Async failure: " + err);
    } else {
        for(var i = 1; i < results.length; i++) {
            var list = results[i];
            //console.log(list.length);

            for(var j = 5; j < list.length; j+=5) {
                var injury = {
                    date: list[j],
                    team: list[j+1]
                };

                if(!isEmpty(list[j+3])) {
                    injury.name = list[j+3].replace("\u2022", "");
                    injury.status = "off";
                } else {
                    injury.name = list[j+2].replace("\u2022", "");
                    injury.status = "on";
                }

                Injury.collection.insert(injury, onInsert);

                function onInsert(err, docs) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.info('injuries were successfully stored.');
                    }
                }
            }
        }
    }
});

