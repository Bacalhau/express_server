var myApp = angular.module('myApp', ['ngRoute','ngCookies']);
 

myApp.config(function ($routeProvider) {
    
   
    $routeProvider        
    .when('/', {
        templateUrl: './login',
        controller: 'mainController',
        resolve: {
            message: function($location,$log,$rootScope,$cookies){                
                if($cookies.get('accessToken')===undefined)
                {
                    return $log.log('Clear');    
                }
                else
                {
                    $cookies.remove('accessToken');
                    return $log.log('Now is Clear');    
                }
        }}
    })
    .when('/forgotpassword', {
        templateUrl: './forgotpassword',
        controller: 'forgotpasswordController'       
    })
    .when('/register', {
        templateUrl: './register',
        controller: 'registerController'
       
    })
});




myApp.controller('mainController', ['$scope','$http','$log','$location','$route','$rootScope','$window', function($scope,$http,$log,$location,$route,$rootScope,$window) {
   
    $rootScope.g_login_error=0;
    $rootScope.g_login_wait=0;
    $rootScope.g_login_lock_fields=0;

    $scope.email ="";
    $scope.password = "";       
    

    $scope.submit = function(form) {          
        $rootScope.g_login_error=0;
        $rootScope.g_login_lock_fields=1;
        $rootScope.g_login_wait=1;
        var host = location.host;        
        var req = {
                    method: 'POST',
                    url: 'http://'+ host +'/login/',
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
            $log.log(data.data.message);             
            $window.open(data.data.message, "_self");             

        }, function(data, status, headers, config)
        {            
              $rootScope.g_login_lock_fields=0;
              $rootScope.g_login_wait=0;
              $rootScope.g_login_error=1;
              $scope.message=data.data.message;
              $log.log('error');
              $log.log(data.data.message); 
        });
    }    


    
}]);



myApp.controller('forgotpasswordController', ['$scope','$http','$log','$rootScope','$location','$timeout', function($scope,$http,$log,$rootScope,$location,$timeout) {
  
    
    $rootScope.g_forgotpassword_success=0;
    $rootScope.g_forgotpassword_error=0;
    $rootScope.g_forgotpassword_wait=0;
    $rootScope.g_forgotpassword_lock_fields=0;
    $scope.email ="";        
    
    $scope.submit = function(form) { 
        $rootScope.g_forgotpassword_success=0;
        $rootScope.g_forgotpassword_error=0;
        $rootScope.g_forgotpassword_wait=1;
        $rootScope.g_forgotpassword_lock_fields=1;
        var host = location.host;             
        var req = {
            method: 'POST',            
            url: 'http://'+ host +'/forgotpassword/',
            headers: {
                        'Content-Type': 'application/json'
                    },
            data: { 
                username: $scope.email                

                  }
                }

        $http(req).then(function(data, status, headers, config){

            $log.log('success');  
            $rootScope.g_forgotpassword_wait=0;          
            $rootScope.g_forgotpassword_success=1; 
            $rootScope.g_forgotpassword_error=0;
            $rootScope.g_forgotpassword_lock_fields=1;
            $timeout(function(){$location.url('/');},3000);

        }, function(data, status, headers, config){
            $scope.message=data.data.message;
            $rootScope.g_forgotpassword_wait=0;
            $rootScope.g_forgotpassword_error=1;
            $rootScope.g_forgotpassword_lock_fields=0;
            $rootScope.g_forgotpassword_success=0; 
           $log.log('error');                      
        });

    }

}]);





myApp.controller('registerController', ['$scope','$route','$log','$cookies','$window','$rootScope','$http','$location','$timeout', function($scope,$route,$log,$cookies,$window,$rootScope,$http,$location,$timeout) {    

$rootScope.g_register_error=0;
$rootScope.g_register_show=1;
$rootScope.g_register_wait=0;
$rootScope.g_register_lock_fields=0;

  $scope.submit = function(form) {    
    $rootScope.g_register_error=0;
    $rootScope.g_register_show=1;
    if(($scope.name===undefined)||($scope.lastname===undefined)||($scope.email===undefined)||($scope.password===undefined)||($scope.passwordcheck===undefined))
    {
        $scope.message="Fill all the the registration form except for the application key if your are not sure.";
        $rootScope.g_register_error=1;
    }
    else
    {
        $rootScope.g_register_lock_fields=1;
        if($scope.password===$scope.passwordcheck)
        {
            $rootScope.g_register_wait=1;
            if($scope.appkey===undefined)
            {
                $scope.appkey='default';
 
            }
            $log.log($scope.appkey);
            var host = location.host;        
            var req = {
                        method: 'POST',
                        url: 'http://'+ host +'/register/',
                        headers:    {
                                        'Content-Type': 'application/json'
                                    },
                        data:       { 
                                        name:     $scope.name,
                                        lastname: $scope.lastname,
                                        username: $scope.email,
                                        password: $scope.password,
                                        appkey:   $scope.appkey
                                    }
                    }
            
            $log.log(req);
            $http(req).then(function(data, status, headers, config){

                $log.log('success');   
                $rootScope.g_register_wait=0;                                                             
                $rootScope.g_register_show=0;
                $timeout(function(){$location.url('/');},3000);                

            }, function(data, status, headers, config)
            {            
                $scope.message=data.data.message;
                $rootScope.g_register_wait=0;
                $rootScope.g_register_error=1;
                $rootScope.g_register_lock_fields=0;
                $log.log('error');
            });                  
        }
        else
        {
            $scope.message="Password dont match";
            $rootScope.g_register_error=1; 
            $rootScope.g_register_lock_fields=0;                                                          
        }

    }
    $log.log('register pressed');
  }

}]);