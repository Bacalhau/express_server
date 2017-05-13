var myApp = angular.module('myApp', ['ngRoute','ngCookies']);
 

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
    .when('/logout', {
        resolve: {
            message: function($location,$log,$rootScope,$cookies){
                $cookies.remove('accessToken');
                $rootScope.g_logout_hide=1;
                $location.path('/');
                return $log.log('RESOLVE');
        }
        }
    })
});




myApp.controller('mainController', ['$scope','$http','$log','$location','$route','$rootScope', function($scope,$http,$log,$location,$route,$rootScope) {
   
    $rootScope.g_logout_hide=1;    
    $scope.hide_error=1;
    $scope.showError = false;
    $scope.email ="";
    $scope.password = "";       
    $log.log($scope);        

    var Scoperef = $scope;
    

    $scope.submit = function(form) {          
        
        var host = location.host;        
        var req = {
                    method: 'POST',
                    url: 'https://'+ host +'/login/',
                    headers:    {
                                    'Content-Type': 'application/json'
                                },
                    data:       { 
                                    username: $scope.email,
                                    password: $scope.password

                                }
                }
        
        
        $http(req).then(function(data, status, headers, config){

            $log.log('success');                
                       
            $location.url('/admin');            

        }, function(data, status, headers, config)
        {            
              Scoperef.hide_error=0;
              $log.log('error');
        });
    }    


    
}]);

myApp.controller('adminController', ['$scope','$route','$log','$cookies','$window','$rootScope', function($scope,$route,$log,$cookies,$window,$rootScope) {    
 

$rootScope.g_logout_hide=0;
$scope.Mybutton = function(){


$log.log('Pressed');
$log.log($cookies.getAll());
$log.log('REMOVE');
$cookies.remove('accessToken');
$log.log($cookies.getAll());


};


}]);


myApp.controller('forgotpasswordController', ['$scope','$http','$log','$rootScope', function($scope,$http,$log,$rootScope) {
  
    $rootScope.g_logout_hide=1;
    $scope.email ="";    
    $scope.submit = function(form) { 

        
        
        $scope.isDisabled=true;

        var host = location.host;             
        var req = {
            method: 'POST',            
            url: 'https://'+ host +'/forgotpassword/',
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
