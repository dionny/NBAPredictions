/**
 * Created by Dionny on 4/17/2016.
 */
angular.module("app")
    .controller("csvCtrl", function ($scope, csvResource) {
        $scope.convertToCsv = function () {
            csvResource.downloadCsv($scope.fileName, $scope.json).then(function (data) {
                var blob = new Blob([data.data], {type: "text/plain;charset=utf-8"});
                saveAs(blob, $scope.fileName + ".csv");
            });
        }
    });