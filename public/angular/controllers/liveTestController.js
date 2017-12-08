app.controller('liveTestController',['$location','authService','$timeout','$scope','$q','testService','$window','$routeParams','socket',function($location,authService,$timeout,$scope,$q,testService,$window,$routeParams,socket){
    
    var main=this;

    this.pageSize=1;
    this.currentPage=0;
    this.testStarted=false;
    this.testFinished=false;
    this.playing=false;
    this.correct=0;
    this.incorrect=0;
    this.unattempted=0;
    this.socketData={};
    
    //Initialize previous time as count
    this.previousTime = this.count;

    //Set navbar
    this.setNavbar = function(){
        $('nav').addClass('second-navbar');
    };

    main.setNavbar();

    

    //Submit form if window closed or back button clicked
    window.onbeforeunload = function() {

      //Emit clear screen
      socket.emit('clear-screen',main.userId);

      //Open submit window
      main.openSubmitWindow($scope.live.liveTestData);
      return null;
    }


    //Get test by id
    this.getTest = function(){

            //Call test service
            testService.getTestById($routeParams.testId).then(function(data){
                if(data.data.error){
                    main.errorMessage=data.data.message;
                } 
                else
                {
                    main.successMessage=data.data.message;
                    main.testScore = main.getScore(data.data.data.questions.length,data.data.data.marksPerQuestion);
                    main.testData=data.data.data;
                    main.testId= main.testData._id;
                    main.count=data.data.data.timeLimit*10*60;
                    main.previousTime = main.count;
                    main.timeTakenAnswers = new Array(data.data.data.questions.length);
                    main.timeViewFirstAnswers = new Array(data.data.data.questions.length);
                    main.answerData = new Array(data.data.data.questions.length);
                    for(var i=0;i<data.data.data.questions.length;i++)
                    {
                        main.timeTakenAnswers[i]=0;
                        main.timeViewFirstAnswers[i]=0;
                        main.answerData[i]={testId:null,userId:null,questionId:null,question:null,givenAnswer:null,correctAnswer:null,timeTaken:null};
                    }
                    
                }
        });
    };

    //Get User and Test
    this.getUserAndTest= function(){
        authService.getUser().then(function(data){

            //If error
            if(data.data.error){
                main.loggedIn=false;
            } 
            else
            {    
                //Set logged in as true
                main.loggedIn=true;
                main.userId= data.data.userId;
                if($location.path()=='/test/live/'+$routeParams.testId)
                    socket.emit('on-test',main.userId);
                main.name = data.data.firstName + data.data.lastName;
                main.email = data.data.email;
                main.getTest();
            }          
        });
    };

    main.getUserAndTest();


    this.createResult = function(){

        //Call service
        testService.createTestResult(main.testData,main.testId).then(function(data){
            if(data.data.error){
                console.log(data.data.message);
            } else{
                console.log(data.data.message);
            }
        });
    };

    //Calculate result
    this.calculateResult = function(data){

        for(var i =0;i<main.timeViewFirstAnswers.length;i++)
        {
            if(main.answerData[i].questionId!=null){

                Object.keys(data.answer[i]).forEach(function(key) {
                    // key is the key
                    // x[key] is the value
                    if(data.answer[i][key]!=null)
                    main.answerData[i].givenAnswer=data.answer[i][key];
                });
                if(main.answerData[i].givenAnswer == main.testData.questions[i].answer)
                    main.correct++;
                else
                    main.incorrect++;  

                main.answerData[i].testId=main.testId;
                main.answerData[i].userId=main.userId;  
                main.answerData[i].timeTaken=(main.timeTakenAnswers[i] - main.timeViewFirstAnswers[i])/10;

                //Call service
                testService.createAnswer(main.answerData[i],main.testId,main.answerData[i].questionId).then(function(data)
                {
                    if(data.data.error){
                        main.answerErrorMessage = data.data.message;
                    } else{
                        main.answerSuccessMessage = data.data.message;
                    }
                });                                 
            }
        }
        main.unattempted = main.testData.questions.length - main.correct -main.incorrect;
        main.testScore = main.correct*main.testData.marksPerQuestion;
        main.outOf  = main.testData.questions.length*main.testData.marksPerQuestion;
        main.percentage = ((main.testScore/main.outOf)*100).toFixed(2);
        main.testData = {testId:main.testId,userId:main.userId,testScore:main.testScore,testTotalMarks:main.outOf,testPercentage:main.percentage,incorrectAnswers:main.incorrect,correctAnswers:main.correct,unattempted:main.unattempted,timeTaken:main.testTime};

        //Call result function
        main.createResult();
        main.testFinished=true;

        //Set success toast
        toastr.success('Test Submitted ! Your Result is show below') ;

    };


    //Set default value for answers in ng-model
    this.setDefault = function(index,index1,index2,index3){
        $scope.live.liveTestData.answer[index][index1] = null;
        $scope.live.liveTestData.answer[index][index2] = null;
        $scope.live.liveTestData.answer[index][index3] = null;
    };

    //Calculate number of page for page filter
    this.numberOfPages=function(l){
        return Math.ceil(l/main.pageSize);
    };


    //Calculate time for answer
    this.calTime = function(index,question){

        main.answerData[index].question = question.question;
        main.answerData[index].correctAnswer = question.answer;
        main.answerData[index].questionId = question._id;
        main.timeTakenAnswers[index]=main.timeTakenAnswers[index] + main.previousTime - main.count;
        main.socketData = {'index' : index+1,time : main.timeTakenAnswers[index] - main.timeViewFirstAnswers[index],'testName' : main.testData.testName,'userId' : main.userId};
        
        //Emit answered question
        socket.emit('answered-question',main.socketData);

    };

    //Save time at which user opened the question
    this.setFirstViewTime = function(index){
        main.timeViewFirstAnswers[index]=main.testData.timeLimit*10*60 - main.count;
        
    };  

    
    //Calculate test total marks
    this.getScore = function(ques,marks){
        return ques*marks;
    };

    //STart test
    this.startTest = function(){
        main.testStarted=true;
        main.socketData = {'userId' : main.userId , 'testId' : $routeParams.testId,'testName' : main.testData.testName};
        
        //Test start emit
        socket.emit('test-started',main.socketData);
        main.playing=true;
        main.countdown();
    };



    this.LeadingZero = function(Time) {
        return (Time < 10) ? "0" + Time : + Time;
    };

    //Convert time to mins hours seconds
    this.displayTime = function(count) {
  
        var tenths = count;  
        var sec = Math.floor(tenths / 10);
        var hours = Math.floor(sec / 3600);
        sec -= hours * (3600);
        var mins = Math.floor(sec / 60);
        sec -= mins * (60);

        if (hours < 1) {
            document.getElementById('time_left').innerHTML = main.LeadingZero(mins)+':'+main.LeadingZero(sec);
        }
        else {
            document.getElementById('time_left').innerHTML = hours+':'+main.LeadingZero(mins)+':'+main.LeadingZero(sec);
        }
    };


    //Count down function
    this.countdown = function(){

        //Call display time
        main.displayTime(main.count); 
        if (main.count == 0) {
            main.playing = false;

            //Submit answers if time limit reached
            main.openSubmitWindow($scope.live.liveTestData);
            $scope.$apply(function(){
                main.testFinished=true;
            });
        }   else if (main.playing) {
                setTimeout(main.countdown, 100);
            main.count--;
        }   else {
                setTimeout(main.countdown, 100); 
        }
    };


    //Submit window function
    this.openSubmitWindow = function(liveTestData){
        main.socketData = {'name' : main.name,'testName' : main.testData.testName,'userId' : main.userId};

        //Test finish emit
        socket.emit('finish-test',main.socketData);
        main.testTime = (main.testData.timeLimit*10*60 - main.count)/600;
        main.testTime = +main.testTime.toFixed(2);
        if(main.testStarted)
            main.calculateResult(liveTestData);
    };



    



}]);
