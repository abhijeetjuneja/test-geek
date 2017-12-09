
app.config(['$routeProvider','$locationProvider', function($routeProvider,$locationProvider){
    $routeProvider
        .when('/',{
            // location of the template
            templateUrl     : 'views/home-view.html',
            authenticated   :  false
            // Which controller it should use
        })
        .when('/register',{
            // location of the template
            templateUrl     : 'views/home-view.html',
            // Which controller it should use
            authenticated   :  false
        })
        .when('/login',{
            // location of the template
            templateUrl     : 'views/home-view.html',
            authenticated   :  false
        })
        .when('/resetpassword',{
            // location of the template
            templateUrl     : 'views/resetpassword.html',
            controller      : 'resetController',
            controllerAs    : 'reset',
            authenticated   :  false
        })
        .when('/resetpassword/:token',{
            // location of the template
            templateUrl     : 'views/newpassword.html',
            controller      : 'resetController',
            controllerAs    : 'reset',
            authenticated   :  false 
        })
        .when('/tests/create',{
            // location of the template
            templateUrl     : 'views/create-test-view.html',
            controller      : 'testController',
            controllerAs    : 'test',
            authenticated   :  true 
        })
        .when('/admin/tests/view',{
            // location of the template
            templateUrl     : 'views/admin-tests-view.html',
            controller      : 'testController',
            controllerAs    : 'test',
            authenticated   :  true 
        })
        .when('/admin/tests/:testId/details',{
            // location of the template
            templateUrl     : 'views/admin-test-detail-view.html',
            controller      : 'testController',
            controllerAs    : 'test',
            authenticated   :  true 
        })
        .when('/admin/users/all',{
            // location of the template
            templateUrl     : 'views/admin-users-view.html',
            controller      : 'dashboardController',
            controllerAs    : 'dashboard',
            authenticated   :  true 
        })
        .when('/tests/:testId/questions/create',{
            // location of the template
            templateUrl     : 'views/create-question-view.html',
            controller      : 'testController',
            controllerAs    : 'test',
            authenticated   :  true 
        })
        .when('/dashboard',{
            // location of the template
            templateUrl     : 'views/dashboard-view.html',
            controller      : 'dashboardController',
            controllerAs    : 'dashboard',
            authenticated   :  true 
        })
        .when('/user/:userId',{
            // location of the template
            templateUrl     : 'views/admin-user-detail-view.html',
            controller      : 'dashboardController',
            controllerAs    : 'dashboard' ,
            authenticated   :  true 
        })
        .when('/user/status/:userId',{
            // location of the template
            templateUrl     : 'views/admin-user-status-view.html',
            controller      : 'liveStatusController',
            controllerAs    : 'status' ,
            authenticated   :  true 
        })
        .when('/results/:resultId',{
            // location of the template
            templateUrl     : 'views/detail-result-view.html',
            controller      : 'detailResultsController',
            controllerAs    : 'detail' ,
            authenticated   :  true 
        })
        .when('/deleteresults/all',{
            // location of the template
            templateUrl     : 'views/delete-all-view.html',
            authenticated   :  true 
        })
        .when('/user/tests/all',{
            // location of the template
            templateUrl     : 'views/user-all-tests-view.html',
            controller      : 'testController',
            controllerAs    : 'test' ,
            authenticated   :  true 
        })
        .when('/test/live/:testId',{
            // location of the template
            templateUrl     : 'views/live-test-view.html',
            controller      : 'liveTestController',
            controllerAs    : 'live' ,
            authenticated   :  true 
        })
        .when('/facebook/:token',{
            // location of the template
            templateUrl     : 'views/facebook-view.html',
            controller      : 'facebookController',
            controllerAs    : 'facebook'
        })
        .when('/google/:token',{
            // location of the template
            templateUrl     : 'views/google-view.html',
            controller      : 'googleController',
            controllerAs    : 'google'
        })
        .otherwise(
            {
                //redirectTo:'/'
                templateUrl   : 'views/error404.html'
            }
        );
        $locationProvider.html5Mode({
  enabled: true,
  requireBase: false
}).hashPrefix('');
}]);

//Avoid unauthorized access to routes
app.run(['$rootScope','authService','$location',function($rootScope,authService,$location){
    $rootScope.$on('$routeChangeStart',function(event,next,current){

        if(next.hasOwnProperty('$$route')){
            //If logged In
            if(next.$$route.authenticated==true){

                if(authService.isLoggedIn()){
                    //Call authService to get User
                    authService.getUser().then(function(data){
                        //If error
                        if(data.data.error){
                            event.preventDefault();
                            $location.path('/');
                        }          
                    });
                }
                else
                {
                    event.preventDefault();
                    $location.path('/');
                }
                
            }
            //If not logged in
            if(next.$$route.authenticated==false){

                if(authService.isLoggedIn()){
                    //Call authService to get User
                    authService.getUser().then(function(data){

                        //If error
                        if(!data.data.error){
                            event.preventDefault();
                            $location.path('/dashboard');
                        }          
                    });
                }
                
            }
        }

    });
}]);