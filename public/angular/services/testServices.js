//Declare the service

app.factory('testService',function allData($http){

    var testFactory={};

    //Factory to create test
    testFactory.create = function(testData){
        return $http.post('/tests/create',testData);
    };

    //Factory to create question
    testFactory.createQuestion = function(questionData,testId){
        return $http.post('/tests/'+testId+'/questions/create',questionData);
    };

    //Factory to create answer
    testFactory.createAnswer = function(answerData,testId,questionId){
        return $http.post('/tests/'+testId+'/questions/'+questionId+'/answers/create',answerData);
    };

    //Factory to create test result
    testFactory.createTestResult = function(resultData,testId){
        return $http.post('/tests/'+testId+'/results/create',resultData);
    };

    //Factory to get all tests
    testFactory.getAllTests = function(){
        return $http.get('/tests/all');
    };

    //Factory to get test by Id
    testFactory.getTestById = function(testId){
        return $http.get('/tests/view/'+ testId);
    }; 

    //Factory to get tests by user Id
    testFactory.getTestsByUserId = function(userId){
        return $http.get('/tests/users/'+ userId);
    };


    //Factory to get result by Id
    testFactory.getResultById = function(resultId){
        return $http.get('/tests/results/view/'+ resultId);
    }; 



    //Factory to get results by user Id
    testFactory.getResultsByUserId = function(userId){
        return $http.get('/tests/results/users/'+ userId);
    };

    //Factory to edit test
    testFactory.editTest = function(testData,testId){
        return $http.put('/tests/edit/'+testId,testData);
    };

    //Factory to edit question
    testFactory.editQuestion = function(questionData){
        return $http.put('/tests/questions/edit/'+questionData._id,questionData);
    };

    //Factory to delete question
    testFactory.deleteQuestion = function(testId,questionId){
        return $http.post('/tests/'+testId+'/questions/delete/'+questionId);
    };

    //Factory to delete test
    testFactory.deleteTest = function(testId){
        return $http.post('/tests/delete/'+testId);
    };

    //Factory to delete results
    testFactory.deleteResults = function(){
        return $http.post('/tests/results/delete/all');
    };

    return testFactory;

});