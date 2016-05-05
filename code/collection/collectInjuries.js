var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var async = require('async');

var mongoose = require('mongoose');
var Injury = require('../models/Injury.js');
var Bookmark = require('../models/Bookmark.js');
mongoose.connect('mongodb://localhost/NBAStats');

var bookmark = null;
var request_list = [];
var max_pages = 23600;


function updateBookmark(page) {
    if(bookmark === null) {
        bookmark = page;
        var newbookmark = {mark: page, name: "injury"}
        Bookmark.collection.insert(newbookmark, function(err, doc) {
            if(err) {
                console.log(err);
            }
        });
    } else {
        Bookmark.collection.update({name: "injury"}, {$set : {mark: page}}, function(err, doc) {
            if(err) {
                console.log(err);
            }
        });
    }
}


function buildlist(startpage) {
        var call = function(callback) {
            var url = "http://www.prosportstransactions.com/basketball/Search/SearchResults.php?" + 
                "Player=&Team=&BeginDate=&EndDate=&ILChkBx=yes&Submit=Search&start=" + startpage;

            console.log("current: " + startpage);

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
                    //callback(null, injury);
                    console.log("Completing: " + startpage);


                    for(var j = 5; j < injury.length; j+=5) {
                        var date_string = injury[j];
                        var jsDate = Date.parse(date_string);
                        console.log("Loop: " + i);

                        var injuryobj = {
                            date: injury[j],
                            time: jsDate,
                            team: injury[j+1]
                        };

                        if(!isEmpty(injury[j+3])) {
                            injuryobj.name = injury[j+3].replace("\u2022", "");
                            injuryobj.status = "off";
                        } else {
                            injuryobj.name = injury[j+2].replace("\u2022", "");
                            injuryobj.status = "on";
                        }

                        Injury.collection.insert(injuryobj, onInsert);

                        function onInsert(err, docs) {
                            if (err) {
                                console.log(err);
                                //callback(null);
                            } else {
                                console.info('injuries were successfully stored.');
                                //callback(null);
                            }
                        }
                    }

                    updateBookmark(startpage);
                    callback(null);
                }
            });
        };

        console.log("Injecting: " + startpage);
        request_list.push(call);
}

function read_games() {
    Bookmark.find({name: "injury"}).exec(function(err, doc) {
        if(err) {
            console.log("Got err");
            bookmark = null;
        } else if(doc.length > 0) {
            bookmark = doc[0].mark;
            console.log("Got bookmark " + bookmark);
        } else {
            console.log("Got nothing");
            bookmark = null;
        }

        for(i = 0; i <= max_pages; i+=25) {
            if(bookmark != null && bookmark > i)
                continue;

            buildlist(i);
        }

        console.log("READY");
        runit();
    });
}

read_games();

function isEmpty(str) {
    return (!str || 0 === str.length || !str.trim());
}

function runit() {
    async.series(request_list, function (err, results) {
        if(err) {
            console.log("Async failure: " + err);
        } else {
            // for(var i = 1; i < results.length; i++) {
            //     var list = results[i];
            //     //console.log(list.length);

            //     for(var j = 5; j < list.length; j+=5) {
            //         var date_string = list[j];
            //         var jsDate = Date.parse(date_string);
            //         //console.log("Date: " + jsDate);

            //         var injury = {
            //             date: list[j],
            //             time: jsDate,
            //             team: list[j+1]
            //         };

            //         if(!isEmpty(list[j+3])) {
            //             injury.name = list[j+3].replace("\u2022", "");
            //             injury.status = "off";
            //         } else {
            //             injury.name = list[j+2].replace("\u2022", "");
            //             injury.status = "on";
            //         }

            //         Injury.collection.insert(injury, onInsert);

            //         function onInsert(err, docs) {
            //             if (err) {
            //                 console.log(err);
            //             } else {
            //                 console.info('injuries were successfully stored.');
            //             }
            //         }
            //     }
            // }
        }
    });
}

