app.controller('facebookController',['$location','authService','$timeout','$scope','$q','$window','$routeParams',function($location,authService,$timeout,$scope,$q,$window,$routeParams){
    //Facebook login
    if($window.location.pathname == '/facebookerror'){
        main.errorMessage="User not Registered yet."
        $location.path('/');
        $('#modalLoginForm').modal('show');
    }
    else
    {
        authService.facebook($routeParams.token);
        $location.path('/dashboard');
    }

}]);











