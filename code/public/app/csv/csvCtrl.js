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

        csvResource.getSeasons().then(function (payload) {
            csvResource.getGroups().then(function (groups) {
                $scope.seasons = _.map(payload.data, function (d) {
                    return {label: d, value: d}
                });

                $scope.groups = _.map(groups.data, function (d) {
                    return {label: d, value: d}
                });

                $scope.formData.chosenSeason = $scope.seasons[0];
                $scope.formData.chosenGroup = $scope.groups[0];

                $scope.$watch('formData.chosenSeason', function () {
                    $scope.predictions = [];
                    csvResource.getPredictions($scope.formData.chosenSeason.value, $scope.formData.chosenGroup.value).then(function (payload) {
                        var data = _.toArray(payload.data);
                        data = fixEnsemble(data);
                        $scope.predictions = data.reverse();
                    });
                });

                $scope.$watch('formData.chosenGroup', function () {
                    $scope.predictions = [];
                    csvResource.getPredictions($scope.formData.chosenSeason.value, $scope.formData.chosenGroup.value).then(function (payload) {
                        var data = _.toArray(payload.data);
                        data = fixEnsemble(data);
                        $scope.predictions = data.reverse();
                    });
                });
            });
        });

        var fixEnsemble = function (data) {
            var timesCorrect = 0;
            var timesRun = 0;

            _.forEach(data, function (p) {
                var slice = p.slice(0, -1);

                if (p.length < 12) {
                    p.push({
                        actual: p[0].actual
                    });
                }

                var home = _.filter(slice, {prediction: 1}).length;
                var away = _.filter(slice, {prediction: 0}).length;
                if (home > away) {
                    p[11].prediction = 1;
                } else {
                    p[11].prediction = 0;
                }

                if (p[11].prediction === p[11].actual) {
                    timesCorrect++;
                }
                timesRun++;
                p[11].accuracy = timesCorrect / timesRun;
            });

            return data;
        }
    });