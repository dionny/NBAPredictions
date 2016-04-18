/**
 * Created by Dionny on 4/17/2016.
 */
angular.module("app", ['ngResource', 'ui.router', 'ngMessages', 'ui.bootstrap']);

angular.module('app').config(function ($urlRouterProvider, $stateProvider, $httpProvider, $locationProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state("main", {
            url: '/',
            templateUrl: "/partials/csv/csvView",
            controller: "csvCtrl"
        });
});