/**
 * Created by Dionny on 4/17/2016.
 */
angular.module("app").factory("csvResource", function ($http) {
    return {
        downloadCsv: function (name, data) {
            return $http.post('/csv/' + name, JSON.parse(data));
        }
    }
});