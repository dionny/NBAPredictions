/**
 * Created by dionnys on 4/16/16.
 */
var unirest = require('unirest');
var _ = require('lodash');

unirest.get("http://nflarrest.com/api/v1/crime")
    .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
    .end(function (response) {
        var numberOfCrimes = 0;
        var crimes = JSON.parse(response.body);
        _.forEach(crimes, function (crime) {
            numberOfCrimes += Number(crime.arrest_count);
        });
    });