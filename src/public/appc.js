var myApp = angular.module('myApp', ['ngRoute']);
 

myApp.config(function ($routeProvider) {
    
   
    $routeProvider        
    .when('/admin', {
        templateUrl: './admin',
        controller: 'adminController'
    })
    .when('/', {
        templateUrl: './login',
        controller: 'mainController'
    })
    .when('/forgotpassword', {
        templateUrl: './forgotpassword',
        controller: 'forgotpasswordController'
    })

   
    
});


myApp.controller('mainController', ['$scope','$http','$log', function($scope,$http,$log) {
   
    $scope.email ="";
    $scope.password = "";
    $scope.submit = function(form) { 

        
        $log.log($scope);
        //$scope.isDisabled=true;
        var req = {
            method: 'POST',
            url: 'https://localhost:8443/login/',
            headers: {
                        'Content-Type': 'application/json'
                    },
            data: { 
                username: $scope.email,
                password: $scope.password

                  }
                }

        $http(req).then(function(data, status, headers, config){

            $log.log('success');
        }, function(data, status, headers, config){

           $log.log('error');
        });

    }
    
    
}]);

myApp.controller('adminController', ['$scope', function($scope) {
    
 
}]);


myApp.controller('forgotpasswordController', ['$scope','$http','$log', function($scope,$http,$log) {
  

    $scope.email ="";    
    $scope.submit = function(form) { 

        
        $log.log($scope);
        $scope.isDisabled=true;
        var req = {
            method: 'POST',
            url: 'https://localhost:8443/forgotpassword/',
            headers: {
                        'Content-Type': 'application/json'
                    },
            data: { 
                username: $scope.email                

                  }
                }

        $http(req).then(function(data, status, headers, config){

            $log.log('success');
            $scope.isDisabled=false;
        }, function(data, status, headers, config){

           $log.log('error');
           $scope.isDisabled=false;
        });

    }



}]);
