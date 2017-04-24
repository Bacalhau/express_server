var myApp = angular.module('myApp', ['ngRoute','chart.js']);

myApp.config(function ($routeProvider) {
    
    
    $routeProvider    
    .when('/', {
        templateUrl: '../views/login.html',
        controller: 'mainController'
    })
    
    .when('/admin', {
        templateUrl: 'pages/admin.html',
        controller: 'adminController'
    })
        .when('/forgotpassword', {
        templateUrl: 'pages/forgotpassword.html',
        controller: 'forgotpasswordController'
    })
   
    
});


myApp.controller('mainController', ['$scope', function($scope,$log) {
    
    
    
}]);

myApp.controller('adminController', ['$scope', function($scope) {
    

}]);


myApp.controller('forgotpasswordController', ['$scope', function($scope) {
    
}]);