/**
 * Created by Dionny on 4/17/2016.
 */
angular.module("app", ['ngResource', 'ui.router', 'ngMessages', 'ui.bootstrap', 'angularUtils.directives.dirPagination']);

angular.module('app').config(function ($urlRouterProvider, $stateProvider, $httpProvider, $locationProvider) {

    $urlRouterProvider.otherwise('/');

});