var myApp = angular.module('myApp', ['ngRoute','ngCookies']);
 

myApp.config(function ($routeProvider) {
    
   
    $routeProvider        
    .when('/admin', {
        templateUrl: './admin',
        controller: 'adminController',
         resolve: {
            message: function($location,$log,$rootScope,$cookies){                
                if($cookies.get('accessToken')===undefined)
                {
                    $rootScope.g_logout_hide=1;
                    $location.path('/');
                }
                else
                {
                    return $log.log('Logged');    
                }
        }}
    })
    .when('/', {
        templateUrl: './login',
        controller: 'mainController',
        resolve: {
            message: function($location,$log,$rootScope,$cookies){                
                if($cookies.get('accessToken')===undefined)
                {
                    $rootScope.g_logout_hide=1;
                    $location.path('/');
                    return $log.log('notLogged');    
                }
                else
                {
                    $location.path('/admin');
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
            message: function($location,$log,$rootScope,$cookies){                  
                          
                $cookies.remove('accessToken');
                $rootScope.g_logout_hide=1;
                $location.path('/');
                return $log.log('RESOLVE');
        }}
    })
    .when('/register', {
        templateUrl: './register',
        controller: 'registerController'
       
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
$log.log($cookies.get('accessToken'));
$log.log('REMOVE');
$cookies.remove('accessToken');
$log.log($cookies.get('accessToken'));
};


}]);


myApp.controller('forgotpasswordController', ['$scope','$http','$log','$rootScope', function($scope,$http,$log,$rootScope) {
  
    $rootScope.g_logout_hide=1;
    $rootScope.g_forgotpassword_show=1;
    $rootScope.g_forgotpassword_error=0;
    $scope.email ="";        
    
    $scope.submit = function(form) { 
        
        

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
            $rootScope.g_forgotpassword_show=0; 
            $rootScope.g_forgotpassword_error=0;           
        }, function(data, status, headers, config){
            $rootScope.g_forgotpassword_error=1;
           $log.log('error');                      
        });

    }

}]);





myApp.controller('registerController', ['$scope','$route','$log','$cookies','$window','$rootScope','$http','$location','$timeout', function($scope,$route,$log,$cookies,$window,$rootScope,$http,$location,$timeout) {    
 
$rootScope.g_logout_hide=1;
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
            var host = location.host;        
            var req = {
                        method: 'POST',
                        url: 'https://'+ host +'/register/',
                        headers:    {
                                        'Content-Type': 'application/json'
                                    },
                        data:       { 
                                        name: $scope.name,
                                        lastname: $scope.lastname,
                                        username: $scope.email,
                                        password: $scope.password
                                    }
                    }
            
            
            $http(req).then(function(data, status, headers, config){

                $log.log('success');                                                                  
                $rootScope.g_register_show=0;
                $timeout(function(){$location.url('/');},3000);                

            }, function(data, status, headers, config)
            {            
                $scope.message="The server could not send the e-mail.";
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
    $log.log($scope.name);
    $log.log($scope.lastname);
    $log.log($scope.email);
    $log.log($scope.password);
    $log.log($scope.passwordcheck);
  }

}]);