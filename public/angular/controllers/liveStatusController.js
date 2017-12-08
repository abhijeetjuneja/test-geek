app.controller('liveStatusController',['$http','userService','$location','authService','$timeout','$scope','$q','testService','$routeParams','socket','$window',function($http,userService,$location,authService,$timeout,$scope,$q,testService,$routeParams,socket,$window){
    $scope.query={};
    var main=this;
    this.socketData = {};

    //Set navbar
    this.setNavbar = function(){
        $('nav').addClass('second-navbar');
        $('body').removeClass('first-body');
        $('body').addClass('second-body');
    };

    main.setNavbar();


    //Get already online users
    this.getAlreadyOnline = function(){
        socket.emit('already-online',0,function(data){
            main.online = data;
            for(var i=0;i<main.online.length;i++){
                if(main.online[i]==main.user._id)
                    $('.live').html('<h4><strong><i class="fa fa-ticket"></i>Live Status ('+main.user.firstName + ' ' + main.user.lastName+' is online)</strong></h4>');
                else
                    $('.live').html('<h4><strong><i class="fa fa-ticket"></i>Live Status ('+main.user.firstName + ' ' + main.user.lastName+' is offline)</strong></h4>');
                
            }
        });
    };

    
    //Listener for get-online
    socket.on('get-online',function(data){
        main.online  = data;
        for(var i=0;i<main.online.length;i++){
            if(main.online[i]==main.user._id)
                $('.live').html('<h4><strong><i class="fa fa-ticket"></i>Live Status ('+main.user.firstName + ' ' + main.user.lastName+' is online)</strong></h4>');
            else
                $('.live').html('<h4><strong><i class="fa fa-ticket"></i>Live Status ('+main.user.firstName + ' ' + main.user.lastName+' is offline)</strong></h4>');
            
        }
    });


    //Check whether online or not
    this.checkStatus = function(id){
        for(var i=0;i<main.online.length;i++)
        {
            if(main.online[i] == id)
                return 'Online';
        }
        return 'Offline';
    };

    //Get test by Id
    this.getTestById = function(testId){

        //Call test service
        testService.getTestById(testId).then(function(data){
            if(data.data.error){
                main.errorMessage=data.data.message;
            } else{
                
            }
        });
    };

    //Get user
    this.getUserById = function(){
        //Call user service to get user by Id
        userService.getUserById($routeParams.userId).then(function(data){
            if(data.data.error)
            {
                main.errorMessage = data.data.message;
            }
            else
            {
                main.user = data.data.data;
                main.getAlreadyOnline();
            }
        });
    };

    main.getUserById();

    //Listener for dashboard route
    socket.on('dashboard', function(data){
        if(main.user._id == data){
            $('.dashboard-page').css({'background-color' : 'green','color':'white'});
            $('.results-page').css({'background-color' : 'red','color':'white'});
            $('.tests-page').css({'background-color' : 'red','color':'white'});
            $('.test-taking-page').css({'background-color' : 'red','color':'white'});
        }  
        else
       {
            $('.dashboard-page').css({'background-color' : 'red','color':'white'});
            $('.results-page').css({'background-color' : 'red','color':'white'});
            $('.tests-page').css({'background-color' : 'red','color':'white'});
            $('.test-taking-page').css({'background-color' : 'red','color':'white'});
       }
      
      

    });

    //Listener for result route
    socket.on('result', function(data){

        if(main.user._id == data){
            $('.dashboard-page').css({'background-color' : 'red','color':'white'});
            $('.results-page').css({'background-color' : 'green','color':'white'});
            $('.tests-page').css({'background-color' : 'red','color':'white'});
            $('.test-taking-page').css({'background-color' : 'red','color':'white'});
        }
       else
       {
            $('.dashboard-page').css({'background-color' : 'red','color':'white'});
            $('.results-page').css({'background-color' : 'red','color':'white'});
            $('.tests-page').css({'background-color' : 'red','color':'white'});
            $('.test-taking-page').css({'background-color' : 'red','color':'white'});
       }
      

    });

    //Listener for tests route
    socket.on('tests', function(data){

        if(main.user._id == data){
            $('.dashboard-page').css({'background-color' : 'red','color':'white'});
            $('.results-page').css({'background-color' : 'red','color':'white'});
            $('.tests-page').css({'background-color' : 'green','color':'white'});
            $('.test-taking-page').css({'background-color' : 'red','color':'white'});
        }
        else
       {
            $('.dashboard-page').css({'background-color' : 'red','color':'white'});
            $('.results-page').css({'background-color' : 'red','color':'white'});
            $('.tests-page').css({'background-color' : 'red','color':'white'});
            $('.test-taking-page').css({'background-color' : 'red','color':'white'});
       }
      
    });

    //Listener for test route
    socket.on('test', function(data){

        if(main.user._id == data){
            $('.dashboard-page').css({'background-color' : 'red','color':'white'});
            $('.results-page').css({'background-color' : 'red','color':'white'});
            $('.tests-page').css({'background-color' : 'red','color':'white'});
            $('.test-taking-page').css({'background-color' : 'green','color':'white'});
        }
        else
       {
            $('.dashboard-page').css({'background-color' : 'red','color':'white'});
            $('.results-page').css({'background-color' : 'red','color':'white'});
            $('.tests-page').css({'background-color' : 'red','color':'white'});
            $('.test-taking-page').css({'background-color' : 'red','color':'white'});
       }

    });

    //Listener for test start
    socket.on('started-test', function(data){

        if(main.user._id == data.userId){
            main.socketData=data;
            main.getTestById(data.testId);
            main.testStartMessage = main.user.firstName + ' ' + main.user.lastName + ' started ' + data.testName + ' test.';
            $('.start').html('<h4>'+main.testStartMessage+'</h4>');
        }
        else
        {
            $('.start').empty();
            $('.screen').empty();
            $('.answer').empty();
            $('.finish').empty();
        }
      

    });

    //Listener for answer
    socket.on('answer', function(data){

        if(main.user._id == data.userId){
            main.socketData=data;
            main.getTestById(data.testId);
            main.testStartMessage = main.user.firstName + ' ' + main.user.lastName + ' started ' + data.testName + ' test.';
            main.answerMessage = 'Answered Question ' + data.index + ' in '+(data.time/10)+' seconds';
            $('.start').html('<h4>'+main.testStartMessage+'</h4>');
            $('.answer').append('<h4>'+main.answerMessage+'</h4>');
        }
        else
        {
            $('.start').empty();
            $('.answer').empty();
        }
      

    });

    //Listener for test finish
    socket.on('finish', function(data){

        if(main.user._id == data.userId){
            main.socketData=data;
            main.getTestById(data.testId);
            main.testStartMessage = main.user.firstName + ' ' + main.user.lastName + ' started ' + data.testName + ' test.';
            main.finishMessage = main.user.firstName + ' ' + main.user.lastName + ' finished ' + data.testName + ' test.Refreshing for new Test tracking...';
            $('.start').html('<h4>'+main.testStartMessage+'</h4>');
            $('.finish').html('<h4>'+main.finishMessage+'</h4>');
            setTimeout(function(){
                $('.start').empty();
                $('.screen').empty();
                $('.answer').empty();
                $('.finish').empty();
            },3000);
        }
        else
        {
            $('.start').empty();
            $('.finish').empty();
        }
      

    });

    //Listener for clearing screen
    socket.on('clear',function(data){
        if(main.user._id == data)
        {
            main.refreshMessage = main.user.firstName + ' ' + main.user.lastName + ' left or reloaded or pressed back button.Refreshing User Status...';
            $('.screen').append('<h4>'+main.refreshMessage+'</h4>');
            setTimeout(function(){
                $window.location.reload();
            },3000);

        }
        else{
            $('.start').empty();
            $('.screen').empty();
      }
    });


    //Calculate number of page for page filter
    this.numberOfPages=function(l){
        return Math.ceil(l/main.pageSize);
    };


    

}]);











