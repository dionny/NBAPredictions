/**
 * Created by Dionny on 4/17/2016.
 */
angular.module("app").factory("csvResource", function ($http, $q) {
    return {
        getSeasons: function() {
            var prom = $q.defer();
            prom.resolve({data: api_seasons});
            return prom.promise;
        },

        getGroups: function() {
            var prom = $q.defer();
            prom.resolve({data: api_groups});
            return prom.promise;
        },

        getPredictions: function(season, group) {
            var key = season + '/' + group;
            var data = window.data[key];
            var prom = $q.defer();
            prom.resolve({data: data});
            return prom.promise;
        }
    }
});