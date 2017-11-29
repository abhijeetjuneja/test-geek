app.controller('testController',['userService','$location','authService','$timeout','$scope','$q','testService','$routeParams','$window',function(userService,$location,authService,$timeout,$scope,$q,testService,$routeParams,$window){

    var main=this;
    this.pageSize=3;
    this.currentPage=0;
    $scope.questionNumber=0;
    main.errorMessage=false;
    main.successMessage=false;
    main.testSubmitted= false;

    if($location.path() == '/admin/tests/'+$routeParams.testId+'/details')
        main.pageSize=1;

    this.setNavbar = function(){
        $('nav').addClass('second-navbar');
    };

    main.setNavbar();


    //Calculate number of page for page filter
    this.numberOfPages=function(l){
        return Math.ceil(l/main.pageSize);
    };

    this.setNavbar = function(){
        $('nav').addClass('second-navbar');
    };

    main.setNavbar();

    //Initialize comments array
    this.comments=[];


    $scope.getNumber = function(num) {
        return new Array(num);   
    }

    this.labelActive = function(){
        $('label').addClass('active');
    };
    

    //reset form
    this.reset = function(form,name,data) {
        document.getElementById(name).reset();
        form.$setPristine();
        data={};
        form.$setUntouched();
        form.$submitted = false;
    };

    //Hide Signup/Login Modal
    this.hideModal = function(name){
        main.getTestById();
        $(name).modal('hide');
        $('i').removeClass('active');
        main.reset($scope.questionCreateForm,'questionCreateForm',$scope.test.questionCreateData);
        
    };

    $scope.reset = function() {
        $scope.user = angular.copy($scope.master);
    };

    $scope.reset();


    //get tests
    this.getTests = function(){

        //Call test service
        testService.getAllTests().then(function(data){
            if(data.data.error){
                main.errorMessage=data.data.message;
            }else{
                main.successMessage=data.data.message;
                main.allTests = data.data.data;
            }
        });
    };

    this.getScore = function(ques,marks){
        return ques*marks;
    };

    //Get test by Id
    this.getTestById = function(){

        //Call test service
        testService.getTestById($routeParams.testId).then(function(data){
            if(data.data.error){
                main.errorMessage=data.data.message;
            } else{
                main.successMessage=data.data.message;
                main.test=data.data.data;
                main.testScore = main.getScore(data.data.data.questions.length,data.data.data.marksPerQuestion);

                //Set test data
                main.testData={ 'testName' : data.data.data.testName,
                                'testCategory':data.data.data.testCategory,
                                'testDescription':data.data.data.testDescription,
                                'timeLimit':data.data.data.timeLimit,
                                'marksPerQuestion':data.data.data.marksPerQuestion,
                                'testId':data.data.data._id
                                };
            }
        });
    };

    //Set edit question form with current question data
    this.setEditQuestionForm = function(questionData){
        main.questionEditData={ 'question' : questionData.question,
                                'option1':questionData.option1,
                                'option2':questionData.option2,
                                'option3':questionData.option3,
                                'option4':questionData.option4,
                                'answer':questionData.answer,
                                '_id':questionData._id,
                                'testId':questionData.testId
                                };
        $('#modalEditQuestionForm').modal('show');
    };

    //Get test detail
    this.getTestDetail = function(id){
        $location.path('/admin/tests/'+id+'/details');
    };

 
    //Create new test
    this.createTest = function(testData, valid){

        //Set loading and error message
        main.loading = true;
        main.errorMessage=false;
        var main1=this;
        if(valid){

            console.log(main1.testData);
            //Call test service for new test
            testService.create(main1.testData).then(function(data){
                console.log('in service');
                //Remove loader
                main.loading = false;
                if(data.data.error)
                {
                    //set error message
                    main.errorMessage=data.data.message;
                    toastr.error(main.errorMessage) ;
                }
                else
                {
                    //Set success message and redirect to dashboard
                    main.successMessage=data.data.message;
                    toastr.success(main.successMessage) ;
                    $location.path('/admin/tests/view');                      
                }
            });
        } 
        else
        {   
            //Set loading and error message
            main.loading = false;
            main.errorMessage="Please ensure the form is filled properly";
        }
    };


    //Create new question
    this.createQuestion = function(form,valid){
        //Set loading and error message
        main.loading = true;
        var main1=this;
        
        if(valid){
            //Call test service for new question
            testService.createQuestion($scope.test.questionCreateData,$routeParams.testId).then(function(data){

                //Remove loader
                main.loading = false;
                if(data.data.error)
                {
                    //set error message
                    main.questionCreateErrorMessage=data.data.message;
                    toastr.error(main.questionCreateErrorMessage);
                }
                else
                {
                    //Set success message and redirect to dashboard
                    main.questionCreateSuccessMessage=data.data.message;
                    toastr.success(main.questionCreateSuccessMessage) ;
                    main.reset($scope.questionCreateForm,'questionCreateForm',$scope.test.questionCreateData);
                    main.hideModal('#modalCreateQuestionForm');
                    main.getTestById();
                }
            });
        } 
        else
        {   
            //Set loading and error message
            main.loading = false;
            main.errorMessage="Please ensure the form is filled properly";
        }

    };

    //Edit Test
    this.editTest = function(testData, valid){

        //Set loading and error message
        main.loading = true;
        main.errorMessage=false;
        var main1=this;
        if(valid){

            //Call test service for new test
            testService.editTest(main1.testData,$routeParams.testId).then(function(data){

                //Remove loader
                main.loading = false;
                if(data.data.error)
                {
                    //set error message
                    main.errorMessage=data.data.message;
                    toastr.error(main.errorMessage) ;
                }
                else
                {
                    //Set success message and close modal
                    main.successMessage=data.data.message;
                    toastr.success(main.successMessage) ;
                    main.hideModal('#modalTestForm'); 
                    main.getTestById();                  
                }
            });
        } 
        else
        {   
            //Set loading and error message
            main.loading = false;
            main.errorMessage="Please ensure the form is filled properly";
        }
          
    };

    //Edit Question
    this.editQuestion = function(questionEditData,valid){

        //Set loading and error message
        var main1=this;
        main.loading = true;
        main.errorMessage=false;
        console.log(main1.questionEditData);
        
        if(valid){

            //Call test service for new test
            testService.editQuestion(main1.questionEditData).then(function(data){

                //Remove loader
                main.loading = false;
                if(data.data.error)
                {
                    //set error message
                    main.questionEditErrorMessage=data.data.message;
                    toastr.error(main.questionEditErrorMessage) ; 
                }
                else
                {
                    //Set success message and close modal
                    main.questionEditSuccessMessage=data.data.message;
                    toastr.success(main.questionEditSuccessMessage) ; 
                    main.hideModal('#modalEditQuestionForm'); 
                    main.getTestById();                  
                }
            });
        } 
        else
        {   
            //Set loading and error message
            main.loading = false;
            main.errorMessage="Please ensure the form is filled properly";
            toastr.error(main.errorMessage) ;
        }
          
    };

    //Delete test
    this.deleteTest = function(id){

        //Call test service
        testService.deleteTest(id).then(function(data){
            if(data.data.error)
                {
                    //set error message
                    main.questionDeleteErrorMessage=data.data.message;
                    toastr.error(main.questionDeleteErrorMessage) ;
                }
                else
                {
                    //Set success message and close modal
                    main.questionDeleteSuccessMessage=data.data.message;
                    toastr.success(main.questionDeleteSuccessMessage) ;
                    main.getTests();                  
                }
        });
    };

    //Delete question
    this.deleteQuestion = function(id){

        //Call test service
        testService.deleteQuestion($routeParams.testId,id).then(function(data){
            if(data.data.error)
                {
                    //set error message
                    main.questionDeleteErrorMessage=data.data.message;
                    toastr.error(main.questionDeleteErrorMessage) ;
                }
                else
                {
                    //Set success message and close modal
                    main.questionDeleteSuccessMessage=data.data.message;
                    toastr.success(main.questionDeleteSuccessMessage) ;
                    main.getTestById();
                    main.currentPage = main.currentPage - 1;                  
                }
        });
    };

    
    //Take test
    this.takeTest = function(id){
        $location.path('/test/live/'+id);
    };

    

    //Check route to call appropriate function
    this.routeCheck = function(){
        if($location.path()=='/admin/tests/view' || $location.path()=='/user/tests/all'){
            main.getTests();
        }
        if($location.path()=='/admin/tests/'+$routeParams.testId+'/details' || $location.path()=='/test/instructions/'+$routeParams.testId){
            main.getTestById();
        }
    };

    main.routeCheck();


}]);


