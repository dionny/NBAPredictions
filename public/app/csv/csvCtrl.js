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
        };

        $scope.formData = {};

        csvResource.getSeasons().then(function(payload){
            $scope.seasons = _.map(payload.data, function(d) {
                return { label: d.season, value: d.season }
            });

            $scope.formData.chosenSeason = $scope.seasons[0];

            $scope.$watch('formData.chosenSeason', function(){
                $scope.predictions = [];
                csvResource.getPredictions($scope.formData.chosenSeason.value).then(function(payload){
                    $scope.predictions = _.toArray(payload.data).reverse();
                });
            });
        });
    });