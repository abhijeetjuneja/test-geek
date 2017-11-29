//Import ngRoute and Animate
var app=angular.module('test',['ngRoute','ngAnimate'])

//Push authInterceptor in httpProvidor
.config(function($httpProvider){
	$httpProvider.interceptors.push('interceptorService');   
});

