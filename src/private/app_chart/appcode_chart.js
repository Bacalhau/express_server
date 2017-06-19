var myApp = angular.module('myApp', ['ngRoute','ngCookies']);
 

myApp.config(function ($routeProvider) {
    
    $routeProvider
    .when('/logout', {
        resolve: {
            message: function($location,$log,$rootScope,$cookies,$http,$window){                  
               $log.log('fnc - resolve logout');          
               $log.log($cookies.get('accessToken')); 
                var host = location.host;  
                var token_send = $cookies.get('accessToken');
                var req = {
                    method: 'POST',            
                    url: 'http://'+ host +'/logout/',
                    headers: {
                                'Content-Type': 'application/json'
                             },
                    data: { 
                            token: token_send        
                          }
                }
                $log.log(req);  
                $http(req).then(function(data, status, headers, config){

                    $cookies.remove('accessToken');
                    $log.log('success'); 
                    $window.open('http://localhost:8443', "_self");    

                }, function(data, status, headers, config){
                    $cookies.remove('accessToken');
                    $window.open('http://localhost:8443', "_self");   
                    $log.log('error'); 
                });
        }}
    })
    .when('/renewaccess', {
        resolve: {
            message: function($location,$log,$rootScope,$cookies,$http,$window){                  
               $log.log('fnc - Renew Access');          
                var host = location.host;  
                var req = {
                    method: 'GET',            
                    url: 'http://'+ host +'/renewaccess/',
                    headers: {
                                'Content-Type': 'application/json'
                             },
                    data: { 
                            token: 'renew'       
                          }
                }
                $log.log(req);  
                $http(req).then(function(data, status, headers, config){
                    $log.log('success');
                    $location.path('/');
                }, function(data, status, headers, config){
                    $log.log('error'); 
                    $location.path('/');
                });
        }}
    })     
    .when('/myaccount', {
        templateUrl: './myaccount',
        controller: 'myaccount'
    })  
    .when('/', {
        templateUrl: './main_chart',
        controller: 'mainController',
        resolve: {
            getdata: function($location,$log,$rootScope,$cookies,$http,$window){

                $rootScope.data = [];
                $rootScope.$watch('data');
                var host = location.host;        
                var req = {
                        method: 'GET',
                        url: 'http://'+ host +'/api/app_chart/',
                        headers:{
                            'Content-Type': 'application/json'
                        },
                        data:{ 
                                
                        }
                }
        
        
                $http(req).then(function(data, status, headers, config){

                    $rootScope.data = data.data;
                    $log.log('success');                                 

                }, function(data, status, headers, config)
                {            
                    $log.log('error');
                });
            }
        }
    });

    
    
});

myApp.controller('navController', ['$scope','$http','$log','$location','$route','$rootScope','$window','$cookies','$interval', function($scope,$http,$log,$location,$route,$rootScope,$window,$cookies,$interval){

$rootScope.g_counter_renew = 0;
$interval(function() {
    console.log("Interval occurred");
    $rootScope.g_counter_renew = $rootScope.g_counter_renew + 1;
}, 1000);


}]);

myApp.controller('mainController', ['$scope','$http','$log','$location','$route','$rootScope','$window','$cookies','$interval', function($scope,$http,$log,$location,$route,$rootScope,$window,$cookies,$interval) {
   
$rootScope.g_insert_lock_fields=0;


$scope.remove = function (task_id){

$log.log('Remove Task: ' + task_id);    
        var host = location.host;        
        var req = {
                    method: 'POST',
                    url: 'http://'+ host +'/api/app_chart/',
                    headers:    {
                                    'Content-Type': 'application/json'
                                },
                    data:       { 
                                    type:'remove',
                                    remove_task:task_id
                                }
                }
        
        
        $http(req).then(function(data, status, headers, config){

            $log.log('success');           
            $route.reload();                 

        }, function(data, status, headers, config)
        {            
              $log.log('error');
        });

}
    



$scope.submit = function(form) {    
    $rootScope.g_insert_lock_fields=1;      
        var host = location.host;        
        var req = {
                    method: 'POST',
                    url: 'http://'+ host +'/api/app_chart/',
                    headers:    {
                                    'Content-Type': 'application/json'
                                },
                    data:       { 
                                    type:'add',
                                    new_task:$scope.task
                                }
                }
        
        
        $http(req).then(function(data, status, headers, config){

            $log.log('success');          
            $rootScope.g_insert_lock_fields=0;   
            $route.reload();                 

        }, function(data, status, headers, config)
        {            
              $log.log('error');
              $rootScope.g_insert_lock_fields=0;  
        });
    }    

    
}]);


myApp.controller('myaccount', ['$scope','$http','$log','$location','$route','$rootScope','$window','$cookies','$interval', function($scope,$http,$log,$location,$route,$rootScope,$window,$cookies,$interval){

$rootScope.g_myaccount_lock_fields=0;
$rootScope.g_myaccount_show=1;

$scope.g_myaccount_name = "name";
$scope.g_myaccount_lastname = "lastname";
$scope.g_myaccount_email = "email";
$scope.g_myaccount_oldpassword = "";
$scope.g_myaccount_newpassword = "";
$scope.g_myaccount_newpasswordcheck = "";
$scope.g_myaccount_appkey = "";




}]);
