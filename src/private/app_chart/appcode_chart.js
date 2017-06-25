var myApp = angular.module('myApp', ['ngRoute','ngCookies']);
 

myApp.config(function ($routeProvider) {
    
    $routeProvider
    .when('/404', {
        templateUrl: './404',
        resolve: {
            message: function($location,$log,$rootScope,$cookies,$http,$window){       
              $log.log('Resolve 404');             
              $cookies.remove('accessToken');
        }}
    })
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
               $log.log($cookies.get('accessToken'));  
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
        controller: 'myaccount',
        resolve: {
            getdata: function($location,$log,$rootScope,$cookies,$http,$window){

                $rootScope.$watch('MyUser');
                var host = location.host;        
                var req = {
                        method: 'GET',
                        url: 'http://'+ host +'/api/userinfo/',
                        headers:{
                            'Content-Type': 'application/json'
                        },
                        data:{ 
                                
                        }
                }

        
                $http(req).then(function(data, status, headers, config,$scope){
                    $log.log('RESOLVE MY ACCOUNT');  
                    $rootScope.MyUser = data.data.userinfo;   
                    $rootScope.MyUser.old_password = "";
                    $rootScope.MyUser.new_password = "";
                    $rootScope.MyUser.new_passwordcheck = "";
                    $log.log($rootScope.MyUser);  
                    $log.log('success');                             

                }, function(data, status, headers, config)
                {            
                    $log.log('error');
                    $location.path('/404');
                });
            }
        }
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
                    $location.path('/404');
                      
                });
            }
        }
    });

    
    
});

myApp.controller('navController', ['$scope','$http','$log','$location','$route','$rootScope','$window','$cookies','$interval', function($scope,$http,$log,$location,$route,$rootScope,$window,$cookies,$interval){

$rootScope.g_counter_renew = '5:00';
$interval(function() {
    var time_now = new Date(Date.now());
    var time_expire = $cookies.get('date');
    var session_time_min = (($cookies.get('date')-time_now.getTime())/60000);
    var session_time_sec = ((($cookies.get('date')-time_now.getTime())/60000) - Math.floor(session_time_min))*60;
    //console.log(Math.floor(session_time_min) + ":"+Math.floor(session_time_sec));
    if((time_expire-time_now)>0)
    {
        if(Math.floor(session_time_sec)<10)
        {
            $rootScope.g_counter_renew = Math.floor(session_time_min) + ":0"+Math.floor(session_time_sec);
        }
        else
        {
            $rootScope.g_counter_renew = Math.floor(session_time_min) + ":"+Math.floor(session_time_sec);
        }
        
    }
    else
    {
        $rootScope.g_counter_renew = 'EXPIRED';
    }
    
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
              $location.path('/404');
        });

}
    



$scope.submit = function(form) {    
    $rootScope.g_insert_lock_fields=1;   
    $log.log($scope.due);   
        var host = location.host;        
        var req = {
                    method: 'POST',
                    url: 'http://'+ host +'/api/app_chart/',
                    headers:    {
                                    'Content-Type': 'application/json'
                                },
                    data:       { 
                                    type:'add',
                                    new_task:$scope.task,
                                    task_due:$scope.due
                                }
                }
        
        
        $http(req).then(function(data, status, headers, config){

            $log.log('success');          
            $rootScope.g_insert_lock_fields=0;   
            $route.reload();                 

        }, function(data, status, headers, config)
        {            
              $log.log('error');
              $location.path('/404');
        });
    }    

    
}]);


myApp.controller('myaccount', ['$scope','$http','$log','$location','$route','$rootScope','$window','$cookies','$interval', function($scope,$http,$log,$location,$route,$rootScope,$window,$cookies,$interval){

$rootScope.g_myaccount_lock_fields=0;
$rootScope.g_myaccount_show=1;
$rootScope.g_myaccount_error = 0;
$rootScope.g_myaccount_wait = 0;
$scope.message = ''


$log.log('SCOPE CREATED!');





$scope.submit = function(form) 
{    
    $rootScope.g_insert_lock_fields=1;
    $rootScope.g_myaccount_wait = 1;

    if(($rootScope.MyUser.old_password==="")&&($rootScope.MyUser.new_password==="")&&($rootScope.MyUser.new_passwordcheck===""))   
    {
        $log.log("No need to change the password.");
        var host = location.host;        
        var req = {
            method: 'POST',
            url: 'http://'+ host +'/api/userinfo/',
            headers:    {
                            'Content-Type': 'application/json'
                        },
            data:       { 
                            type:"modify",
                            uname:$rootScope.MyUser.name,
                            ulastname:$rootScope.MyUser.lastname,
                        }
        }
        
        
        $http(req).then(function(data, status, headers, config)
        {         
                $rootScope.g_myaccount_error = 0;
                $rootScope.g_insert_lock_fields=0;
                $rootScope.g_myaccount_wait = 0;
                $route.reload();   
                $log.log('success');      

        }, function(data, status, headers, config)
        {            
            $log.log('error');
            $location.path('/404');
        });
    }   
    else
    {
        $log.log("CHANGE PASSWORD REQUIRED.");
        $log.log($rootScope.MyUser);
        if(($rootScope.MyUser.old_password==="")||($rootScope.MyUser.new_password==="")||($rootScope.MyUser.new_passwordcheck===""))   
        {
            $rootScope.g_myaccount_error = 1;
            $rootScope.g_insert_lock_fields=0;
            $rootScope.g_myaccount_wait = 0;
            $scope.message = 'Password is missing.'
        }
        else
        {
            if($rootScope.MyUser.new_password===$rootScope.MyUser.new_passwordcheck)
             {
                $log.log("NEW PASSWORD OK");
                var host = location.host;        
                var req = {
                    method: 'POST',
                    url: 'http://'+ host +'/api/userinfo/',
                    headers:    {
                                    'Content-Type': 'application/json'
                                },
                    data:       { 
                                    type:"modify",
                                    uname:$rootScope.MyUser.name,
                                    ulastname:$rootScope.MyUser.lastname,
                                    old_password:$rootScope.MyUser.old_password,
                                    new_password:$rootScope.MyUser.new_password,
                                }
                }
                
                
                $http(req).then(function(data, status, headers, config)
                {           
                    $log.log(data.data.message);
                    if(data.data.message=== "OK")
                    {
                        $rootScope.g_myaccount_error = 0;
                        $rootScope.g_insert_lock_fields=0;
                        $rootScope.g_myaccount_wait = 0;
                        $route.reload();   
                        $log.log('success');      
                    }
                    else
                    {
                        $rootScope.g_myaccount_error = 1;
                        $rootScope.g_insert_lock_fields=0;
                        $rootScope.g_myaccount_wait = 0;
                        $scope.message = data.data.message;
                        $log.log('Error on OK');   
                    }
                }, function(data, status, headers, config)
                {            
                    $log.log('error');
                    $location.path('/404');
                });
             }
             else
             {
                $rootScope.g_myaccount_error = 1;
                $rootScope.g_insert_lock_fields=0;
                $rootScope.g_myaccount_wait = 0;
                $scope.message = 'Password do not match.'
             }
        }
    }   
}    





}]);
