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
                    $location.path('/');
                    return $log.log('notLogged');    
                }
                else
                {
                    return $log.log('Logged');    
                }
        }}
    })
    .when('/forgotpassword', {
        templateUrl: './forgotpassword',
        controller: 'forgotpasswordController'       
    })
    .when('/logout', {
        resolve: {
            message: function($location,$log,$rootScope,$cookies,$http){                  
               $log.log('fnc - resolve logout');           
                var host = location.host;  
                              
                var req = {
                    method: 'POST',            
                    url: 'http://'+ host +'/logout/',
                    headers: {
                                'Content-Type': 'application/json'
                             },
                    data: { 
                            username: $rootScope.email              

                          }
                        }
                        $log.log(req);  
                $http(req).then(function(data, status, headers, config){

                    $cookies.remove('accessToken');
                    $rootScope.email = '';
                    $location.path('/');
                    $log.log('success'); 
                    window.location.reload();

                }, function(data, status, headers, config){
                    $cookies.remove('accessToken');
                    $rootScope.email = '';
                    $location.path('/');
                    $log.log('error'); 
                    window.location.reload();
                });
        }}
    })
    .when('/register', {
        templateUrl: './register',
        controller: 'registerController'
       
    })
});




myApp.controller('mainController', ['$scope','$http','$log','$location','$route','$rootScope','$window', function($scope,$http,$log,$location,$route,$rootScope,$window) {
   
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
            $rootScope.email =  $scope.email;       
            $log.log(data.data.message);            
            //$window.open(data.data.message, "_blank")  
            $window.open(data.data.message, "_self")             

        }, function(data, status, headers, config)
        {            
              Scoperef.hide_error=0;
              $log.log('error');
        });
    }    


    
}]);



myApp.controller('forgotpasswordController', ['$scope','$http','$log','$rootScope','$location','$timeout', function($scope,$http,$log,$rootScope,$location,$timeout) {
  
    
    $rootScope.g_forgotpassword_success=0;
    $rootScope.g_forgotpassword_error=0;
    $scope.email ="";        
    
    $scope.submit = function(form) { 
        
        

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
            $rootScope.g_forgotpassword_success=1; 
            $rootScope.g_forgotpassword_error=0;
            $timeout(function(){$location.url('/');},3000);

        }, function(data, status, headers, config){
            $rootScope.g_forgotpassword_error=1;
           $log.log('error');                      
        });

    }

}]);





myApp.controller('registerController', ['$scope','$route','$log','$cookies','$window','$rootScope','$http','$location','$timeout', function($scope,$route,$log,$cookies,$window,$rootScope,$http,$location,$timeout) {    

$rootScope.g_register_error=0;
$rootScope.g_register_show=1;

  $scope.submit = function(form) {    
    $rootScope.g_register_error=0;
    $rootScope.g_register_show=1;
    if(($scope.name===undefined)||($scope.lastname===undefined)||($scope.email===undefined)||($scope.password===undefined)||($scope.passwordcheck===undefined))
    {
        $scope.message="Fill all the the registration form";
        $rootScope.g_register_error=1;
    }
    else
    {
        
        if($scope.password===$scope.passwordcheck)
        {
            if($scope.appkey===undefined)
            {
                $scope.appkey='msg';
 
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
                $rootScope.g_register_show=0;
                $timeout(function(){$location.url('/');},3000);                

            }, function(data, status, headers, config)
            {            
                $scope.message=data.data.message;
                $rootScope.g_register_error=1;
                $log.log('error');
            });                  
        }
        else
        {
            $scope.message="Password dont match";
            $rootScope.g_register_error=1;
        }

    }
    $log.log('register pressed');
  }

}]);