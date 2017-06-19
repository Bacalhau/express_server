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
    .when('/', {
        templateUrl: './main_chart',
        controller: 'mainController'
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
   

var ctx = document.getElementById("myChart").getContext('2d');
var ctx2 = document.getElementById("myChart2").getContext('2d');


var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: false, 
        maintainAspectRatio: false,
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});


var myChart2 = new Chart(ctx2, {
    type: 'bar',
    data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: false, 
        maintainAspectRatio: false,
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});



    
}]);

