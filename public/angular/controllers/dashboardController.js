app.controller('dashboardController',['$http','userService','$location','authService','$timeout','$scope','$q','testService','$routeParams',function($http,userService,$location,authService,$timeout,$scope,$q,testService,$routeParams){
    $scope.query={};
    var main=this;
    this.pageSize=7;
    this.currentPage=0;
    this.reverse=false;
    this.loading=true;
    this.statsCompleted = false;
    this.count=0;
    this.pagearray=[];
    this.tests=[];
    this.averageTimeTaken = 0;
    this.averagePercentage=0;
    this.correctAnswers=0;
    this.incorrectAnswers=0;
    this.unattempted=0;
    this.percentages = [];
    this.colors=[];
    this.ids=[];
    this.promises=[];
    this.index=0;
    this.testNames=[];

    //Resize chart on orientation change
    $( window ).resize(function() {
        if(main.testsTaken!=0)
        main.myChart.destroy();
        main.drawGraph();

    });

    //Calculate number of page for page filter
    this.numberOfPages=function(l){
        return Math.ceil(l/main.pageSize);
    };


    //Set navbar
    this.setNavbar = function(){
        $('nav').addClass('second-navbar');
        $('body').removeClass('first-body');
        $('body').addClass('second-body');
    };

    main.setNavbar();

    //Get all users
    this.getAllUsers = function(){

        //Call user service to get all users
        userService.getAllUsers().then(function(data){
            if(data.data.error){
                //Set error message
                console.log(data.data.message);
            } else{
                //Set error message
                main.allUsers = data.data.data;
                console.log(data.data.message);
            }
        });
    };


    //Get colors for plotting graph points
    this.getRandomColor = function() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    //Draw percentage graph
    this.drawGraph = function(){
        main.myChart = new Chart(main.ctx,{
            type:'line',
            data:{
                labels:main.testNames,
                datasets: [{
                    label: 'Percentage',
                    data: main.percentages,
                    pointBackgroundColor:main.colors,
                    borderColor:main.colors,
                    borderWidth: 1,
                    fontSize:20
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                },
                responsive:true,
                maintainAspectRatio: true,
                layout: {
                    padding: {
                        left: 15,
                        right: 15,
                        top: 15,
                        bottom: 15
                    }
                }
            }
        });   
    };

    //Initialize graph
    this.initGraph = function(){
        main.ctx = document.getElementById("myChart").getContext('2d');
        main.drawGraph();
        setTimeout(function(){
            $(window).trigger('resize');
        },500);
    };
    

    //Calculate stats for results
    this.calculateStats = function(results){

        //Calculate stats
        for(var i=0;i<results.length;i++){
            main.averagePercentage = main.averagePercentage + results[i].testPercentage;
            main.averageTimeTaken = main.averageTimeTaken + results[i].timeTaken;
            main.correctAnswers = main.correctAnswers + results[i].correctAnswers;
            main.incorrectAnswers = main.incorrectAnswers + results[i].incorrectAnswers;
            main.unattempted = main.unattempted + results[i].unattempted;
            main.percentages[i] = results[i].testPercentage;
            main.colors[i]=main.getRandomColor();
        }

        //Call inititialize function
        main.initGraph();
        main.averagePercentage = (main.averagePercentage / results.length).toFixed(2);
        main.averageTimeTaken = (main.averageTimeTaken / results.length).toFixed(2);
    };



    //Get Results by user id
    this.getResultsByUserId = function(id){

        //Call test service to get results by id
        testService.getResultsByUserId(id).then(function(data){
            //Set loading to false
            main.loading = false;
            if(data.data.error)
            {
                //Set error message
                main.errorMessage=data.data.message;
            }
            else
            {   
                //Set all queries
                main.allResults=data.data.data;

                //Check if user has given any test
                if(main.allResults != null)
                {
                    main.testsTaken = main.allResults.length;

                    //Call calculate stats function
                    main.calculateStats(main.allResults);

                    for(var i=0;i<main.allResults.length;i++)
                    {
                        //Call test service to get test by id
                        main.promises[i]=testService.getTestById(main.allResults[i].testId).then(function(data){
                            //Set loading to false
                            main.loading = false;
                            if(data.data.error)
                            {
                                //Set error message
                                main.errorMessage=data.data.message;
                            }
                            else
                            {   
                                //Push test data into results array
                                main.allResults[main.index].test=data.data.data;
                                main.testNames.push(main.allResults[main.index].test.testName);    
                                main.index++;                   
                            }
                        });  
                    }
                    $q.all(main.promises).then(function(){
                        
                    });
                //Get all tickets
                }

                //If not tests taken
                else
                    main.testsTaken = 0;
            }
        });
    };



    //Get User details    
    this.getUser = function(){
        //Set loading on
        main.loading=true;

        //Check if individual user page
        if($location.path() == '/user/'+$routeParams.userId)

            //Call user service to get user by Id
            userService.getUserById($routeParams.userId).then(function(data){
                if(data.data.error)
                {
                    main.errorMessage = data.data.message;
                }
                else
                {
                    main.user = data.data.data;

                    //Call get results by user id function
                    main.getResultsByUserId($routeParams.userId);
                }
            });
        else
        //Call authService for user details
        authService.getUser().then(function(data){
            var main1=this;
            main.userName=data.data.firstName + ' ' + data.data.lastName;
            main.userId=data.data.userId;
            main.email = data.data.email;

            //Assign admin or user
            if(main.email == 'admin@testgeek.com')
                main.admin = true;
            else
                main.admin = false;
            if($location.path() == '/dashboard' && !main.admin)
            main.getResultsByUserId(main.userId);
            if($location.path() == '/admin/users/all')
            main.getAllUsers();     
        });
         
    };

    //Call getUser
    main.getUser();

    this.getResult = function(id){
        $location.path('/results/'+id);
    };

    

    //Calculate number of page for page filter
    this.numberOfPages=function(l){
        return Math.ceil(l/main.pageSize);
    };

    //filter for created At
    $scope.predicate = 'createdAt';
  
    //filter for sorting
    $scope.sort = function(predicate) {
        $scope.predicate = predicate;
    };
    

    //Redirect to query details
    this.getUserDetail = function(id){
    	$location.path('/user/'+id);
    };


}]);











