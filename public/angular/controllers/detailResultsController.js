app.controller('detailResultsController',['$http','userService','$location','authService','$timeout','$scope','$q','testService','$routeParams','socket',function($http,userService,$location,authService,$timeout,$scope,$q,testService,$routeParams,socket){
    $scope.query={};
    var main=this;
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
    this.percentages = [];
    this.ids=[];
    this.result={};

    //Set navbar
    this.setNavbar = function(){
        $('nav').addClass('second-navbar');
    };

    main.setNavbar();

    

    this.getUser = function(){
        //Call authService to get User
        authService.getUser().then(function(data){

            //If error
            if(data.data.error){
            } 
            else
            {    
                main.userId=data.data.userId;

                //Result route emit
                if($location.path()=='/results/'+$routeParams.resultId)
                    socket.emit('on-result',main.result.userId);
            }          
        });
    };

    main.getUser();


    //Plot doughnut graph
    this.drawDoughnut = function(){
    	main.ctx = document.getElementById("myChart");
    	var myDoughnutChart = new Chart(main.ctx, {
		    type: 'doughnut',
		    data: {
		    	datasets: [{
        			data: [main.result.correctAnswers, main.result.incorrectAnswers, main.result.unattempted],
        			backgroundColor :['Green','Red','Yellow']
    			}],

			    // These labels appear in the legend and in the tooltips when hovering different arcs
			    labels: [
			        'Correct',
			        'Incorrect',
			        'Unattempted'
			    ]
		    },
		    options: {
		    	cutoutPercentage : 50,
		    	responsive:true
		    }
		});
    };
    
    //Get result by Id
    this.getResult = function(){

    	//Call test service to get result by Id
        testService.getResultById($routeParams.resultId).then(function(data){
            if(data.data.error){
                main.errorMessage=data.data.message;
            }else{
                main.successMessage=data.data.message;
                main.result = data.data.data;
                main.result.attempted = main.result.correctAnswers + main.result.incorrectAnswers;
                main.result.total = main.result.correctAnswers+main.result.incorrectAnswers+main.result.unattempted;

                //Call draw Doughnut function
                main.drawDoughnut();
            }
        });
    };
    

    main.getResult();
    

    //Calculate number of page for page filter
    this.numberOfPages=function(l){
        return Math.ceil(l/main.pageSize);
    };


    

}]);











