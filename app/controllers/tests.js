var mongoose = require('mongoose');
var express = require('express');
var app         = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
mongoose.Promise = require('bluebird');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var testRouter  = express.Router();
var testModel = mongoose.model('Test');
var questionModel = mongoose.model('Question');
var answerModel = mongoose.model('Answer');
var testResultModel = mongoose.model('Test-Result');
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var secret = 'a232fr45c66#$%%T5tv6NSJNSD12J@HU3SN';
var responseGenerator = require('./../../libs/responseGenerator');
var detail = require('./../../middlewares/getDetails');
var resetMailer = require('./../../libs/resetMailer');

//Export controller function
module.exports.controllerFunction = function(app) {

    //Create a test
    testRouter.post('/create',function(req,res){

        //Verify body parameters
        if(req.body.testName!=undefined && req.body.testCategory!=undefined && req.body.testDescription!=undefined && req.body.timeLimit !=undefined  && req.body.marksPerQuestion!=undefined ){

            var newTest = new testModel({
                testName            : req.body.testName,
                testCategory        : req.body.testCategory,
                testDescription     : req.body.testDescription,
                marksPerQuestion    : req.body.marksPerQuestion,
                timeLimit           : req.body.timeLimit,
                createdAt           : Date.now(),
                modifiedAt          : Date.now()

            });// end new test 

            //Save test
            newTest.save(function(err,newTest){
                if(err){
                        var myResponse = responseGenerator.generate(true,err.errmsg,err.code,null);
                        console.log(myResponse);
                        res.json(myResponse);                                                
                }
                else{
                    var myResponse = responseGenerator.generate(false,"test created Successfully",200,null,null);
                    console.log(myResponse);
                    res.json(myResponse);
                }

            });//end new test save


        }
        //Fields not filled up
        else{
            var myResponse = {
                error: true,
                message: "Please fill up all the fields",
                status: 403,
                data: null
            };

            //res.send(myResponse);
            console.log(myResponse);
            res.json(myResponse);

        }
        

    });//end create test


    //Create a question
    testRouter.post('/:testId/questions/create',function(req,res){

        //Verify body parameters
        if(req.body.question !=undefined && req.body.option1 !=undefined && req.body.option2!=undefined && req.body.option3!=undefined&& req.body.option4!=undefined && req.body.answer!=undefined){

            var newQuestion= new questionModel({
                testId              : req.params.testId,
                question            : req.body.question,
                option1             : req.body.option1,
                option2             : req.body.option2,
                option3             : req.body.option3,
                option4             : req.body.option4,
                answer              : req.body.answer,
                createdAt           : Date.now(),
                modifiedAt          : Date.now()

            });// end new question 

            //Save question
            newQuestion.save(function(err,newQuestion){
                if(err){
                        var myResponse = responseGenerator.generate(true,err.errmsg,err.code,null);
                        console.log(myResponse);
                        res.json(myResponse);                                                
                }
                else{
                    var myResponse = responseGenerator.generate(false,"Question created Successfully",200,null,null);
                    console.log(myResponse);

                    //Add to test
                    testModel.findOne({'_id':req.params.testId},function(err,test){

                        //Push question to questions array
                        test.questions.push(newQuestion);

                        //Save new test
                        test.save(function(err){
                            if(err){
                                var myResponse = responseGenerator.generate(true,err.errmsg,err.code,null);
                                console.log(myResponse);
                                res.json(myResponse);
                            } 
                            else{
                                var myResponse = responseGenerator.generate(false,'Question created and added to test',200,null,null);
                                console.log(myResponse);
                                res.json(myResponse);
                            }
                        });
                    
                    });
                }

            });//end new test save


        }
        //Fields not filled up
        else{
            var myResponse = {
                error: true,
                message: "Please fill up all the fields",
                status: 403,
                data: null
            };

            //res.send(myResponse);
            console.log(myResponse);
            res.json(myResponse);

        }
        

    });//end create test


    //Create an answer
    testRouter.post('/:testId/questions/:questionId/answers/create',function(req,res){

        //Verify body parameters
        if(req.body.question !=undefined && req.body.givenAnswer !=undefined && req.body.correctAnswer!=undefined && req.body.timeTaken!=undefined && req.body.userId !=undefined && req.body.questionId !=undefined){

            var newAnswer= new answerModel({
                testId              : req.params.testId,
                userId              : req.body.userId,
                questionId          : req.body.questionId,
                question            : req.body.question,
                givenAnswer         : req.body.givenAnswer,
                correctAnswer       : req.body.correctAnswer,
                timeTaken           : req.body.timeTaken,
                createdAt           : Date.now()

            });// end new answer 

            //Save answer
            newAnswer.save(function(err,newAnswer){
                if(err){
                    var myResponse = responseGenerator.generate(true,err.errmsg,err.code,null,null);
                    console.log(myResponse);
                    res.json(myResponse);                                                
                }
                else{
                    var myResponse = responseGenerator.generate(false,'Answer created successfully',200,null,null);
                    console.log(myResponse);
                    res.json(myResponse);                          
                }

            });//end new answer save


        }
        //Fields not filled up
        else{
            var myResponse = {
                error: true,
                message: "Please fill up all the fields",
                status: 403,
                data: null
            };

            //res.send(myResponse);
            console.log(myResponse);
            res.json(myResponse);

        }
        

    });//end create answer


    //Create a test result
    testRouter.post('/:testId/results/create',function(req,res){

        //Verify body parameters
        if(req.body.testScore !=undefined && req.body.testPercentage !=undefined && req.body.correctAnswers!=undefined && req.body.incorrectAnswers!=undefined && req.body.testTotalMarks!=undefined && req.body.timeTaken!=undefined && req.body.unattempted != undefined){

            var newTestResult= new testResultModel({
                testId              : req.params.testId,
                userId              : req.body.userId,
                testScore           : req.body.testScore,
                testTotalMarks      : req.body.testTotalMarks,
                testPercentage      : req.body.testPercentage,
                correctAnswers      : req.body.correctAnswers,
                incorrectAnswers    : req.body.incorrectAnswers,
                unattempted         : req.body.unattempted,
                timeTaken           : req.body.timeTaken,
                createdAt           : Date.now()

            });// end new test result 

            //Save test result
            newTestResult.save(function(err,newTestResult){
                if(err){
                        var myResponse = responseGenerator.generate(true,err.errmsg,err.code,null);
                        console.log(myResponse);
                        res.json(myResponse);                                                
                }
                else{
                    var myResponse = responseGenerator.generate(false,"Test Result created Successfully",200,null,newTestResult);
                    console.log(myResponse);
                    res.json(myResponse);
                }

            });//end new test save


        }
        //Fields not filled up
        else{
            var myResponse = {
                error: true,
                message: "Please fill up all the fields",
                status: 403,
                data: null
            };

            //res.send(myResponse);
            console.log(myResponse);
            res.json(myResponse);

        }
        

    });//end create test result



    //Edit test
    testRouter.put('/edit/:testId',function(req,res){        

        //begin test find and update
        testModel.findOneAndUpdate({'_id':req.params.testId},req.body,function(err,test){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error",err.code,null,null);      
                console.log(myResponse);   
                res.json( {myResponse});
            }
            else{
                //If test not found
                if(test == null || test == undefined)
                {
                    var myResponse = responseGenerator.generate(false,"No test found",200,null,null);
                    console.log(myResponse);
                    res.json(myResponse);
                }
                //If test found
                else
                {
                    var myResponse = responseGenerator.generate(false,"test changed",200,null,null);
                    console.log(myResponse);
                    res.json(myResponse);
                }                        
            }

        });//end test model find 

    });//end test change


    //Edit question
    testRouter.put('/questions/edit/:questionId',function(req,res){

        //begin question find and update
        questionModel.findOneAndUpdate({'_id':req.params.questionId},req.body,{new: true},function(err,question){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error",err.code,null,null);      
                console.log(myResponse);   
                res.json( {myResponse});
            }
            else{
                //If question not found
                if(question == null || question == undefined)
                {
                    var myResponse = responseGenerator.generate(false,"No question found",200,null,null);
                    console.log(myResponse);
                    res.json(myResponse);
                }
                //If question found
                else
                {
                    var myResponse = responseGenerator.generate(false,"Question changed",200,null,question);
                    console.log(myResponse);

                    //find test by id
                    testModel.findOne({'_id':question.testId},function(err,test){

                        //find index of question
                        var questionIndex = _.findIndex(test.questions, function(o) { return o._id == req.params.questionId; });

                        //change question
                        test.questions.splice(questionIndex,1,question);
                        //Save test
                        test.save(function(err){
                            if(err){
                                var myResponse = responseGenerator.generate(true,"Could not change test question",err.code,null,null);
                                console.log(myResponse);   
                                res.json(myResponse);
                            } else{
                                var myResponse = responseGenerator.generate(false,"Test question changed",200,null,test);      
                                console.log(myResponse);   
                                res.json(myResponse);

                            }
                        });
                    });//end test model find
                }                        
            }

        });//end question model find 

    });//end question change


    //Delete test by id
    testRouter.post('/delete/:testId',function(req,res){
        
        //Remove test
        testModel.remove({'_id':req.params.testId},function(err,test){
            if(err){
                var myResponse = responseGenerator.generate(true,err.message,err.code,null,null);
                console.log(myResponse);
                res.json(myResponse);
             }
            else
            {
                var myResponse = responseGenerator.generate(false,"Successfully deleted test",200,null,null);
                console.log(myResponse);
                
                questionModel.remove({'testId':req.params.testId},function(err,test){
                    if(err){
                        var myResponse = responseGenerator.generate(true,err.message,err.code,null,null);
                        console.log(myResponse);
                        res.json(myResponse);
                    } else{
                        var myResponse = responseGenerator.generate(false,"Successfully deleted test and Questions",200,null,null);
                        console.log(myResponse);
                    }
                });
            }
        });//end remove


    });//end delete test


    //Delete question by id
    testRouter.post('/:testId/questions/delete/:questionId',function(req,res){

        testModel.findOne({'_id':req.params.testId},function(err,test){
            if(err){
                var myResponse = responseGenerator.generate(true,err.message,err.code,null,null);
                console.log(myResponse);
                res.json(myResponse);
            } else if(test==null || test ==undefined){
                var myResponse = responseGenerator.generate(false,"No test found",200,null,null);
                console.log(myResponse);
                res.json(myResponse);
            } else {
                //find index of question
                var questionIndex = _.findIndex(test.questions, function(o) { return o._id == req.params.questionId; });
                test.questions.splice(questionIndex,1);

                //Save test
                test.save(function(err){
                    if(err){
                        var myResponse = responseGenerator.generate(true,"Could not delete test question",err.code,null,null);
                        console.log(myResponse);   
                    } else{
                        var myResponse = responseGenerator.generate(false,"Test question deleted",200,null,null);      
                        console.log(myResponse);   
                    }
                });

                //Remove question
                questionModel.remove({'_id':req.params.questionId},function(err,question){
                    if(err){
                        var myResponse = responseGenerator.generate(true,err.message,err.code,null,null);
                        console.log(myResponse);
                        res.json(myResponse);
                     }
                    else
                    {
                        var myResponse = responseGenerator.generate(false,"Successfully deleted question",200,null,null);
                        console.log(myResponse);
                        res.json(myResponse);
                    }
                });//end remove
            }
        });

    });//end delete question

    //Delete all tests
    testRouter.post('/all/delete',function(req,res){
        
        //Remove test
        testModel.remove(function(err,test){
            if(err){
                var myResponse = responseGenerator.generate(true,err.message,err.code,null,null);
                console.log(myResponse);
                res.json(myResponse);
             }
            else
            {
                var myResponse = responseGenerator.generate(false,"Successfully deleted tests",200,null,null);
                console.log(myResponse);
                res.json(myResponse);
            }
        });//end remove


    });//end delete test

    //Delete all questions
    testRouter.post('/questions/all/delete',function(req,res){
        
        //Remove questions
        questionModel.remove(function(err,test){
            if(err){
                var myResponse = responseGenerator.generate(true,err.message,err.code,null,null);
                console.log(myResponse);
                res.json(myResponse);
             }
            else
            {
                var myResponse = responseGenerator.generate(false,"Successfully deleted questions",200,null,null);
                console.log(myResponse);
                res.json(myResponse);
            }
        });//end remove


    });//end delete questions



    //Delete all answers
    testRouter.post('/answers/all/delete',function(req,res){
        
        //Remove answer
        answerModel.remove(function(err,test){
            if(err){
                var myResponse = responseGenerator.generate(true,err.message,err.code,null,null);
                console.log(myResponse);
                res.json(myResponse);
             }
            else
            {
                var myResponse = responseGenerator.generate(false,"Successfully deleted questions",200,null,null);
                console.log(myResponse);
                res.json(myResponse);
            }
        });//end remove


    });//end delete answers



    //Delete all results
    testRouter.post('/results/all/delete',function(req,res){
        
        //Remove test result
        testResultModel.remove(function(err,test){
            if(err){
                var myResponse = responseGenerator.generate(true,err.message,err.code,null,null);
                console.log(myResponse);
                res.json(myResponse);
             }
            else
            {
                var myResponse = responseGenerator.generate(false,"Successfully deleted questions",200,null,null);
                console.log(myResponse);
                res.json(myResponse);
            }
        });//end remove


    });//end delete result


    //Get test by id
    testRouter.get('/view/:testId',function(req,res){

        //begin test find
        testModel.findOne({'_id':req.params.testId},function(err,test){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error",err.code,null,null);          
                res.json( {myResponse});
            }
            else{
                //If test not found
                if(test == null || test == undefined)
                {
                    var myResponse = responseGenerator.generate(false,"No tests found",200,null,null);
                    console.log(myResponse);
                    res.json(myResponse);
                }
                else
                {
                    //If successfully found return response
                    var myResponse = responseGenerator.generate(false,"Fetched tests",200,null,test);
                    console.log(myResponse);
                    res.json(myResponse);
                }                     
            }

        });//end test model find 

    });//end get test by id



    //Get all results by user Id
    testRouter.get('/results/users/:userId',function(req,res){

        //begin test result find
        testResultModel.find({'userId':req.params.userId},function(err,allTestResults){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error",err.code,null,null);          
                res.json( {myResponse});
            }
            else{
                if(allTestResults == null || allTestResults == undefined || allTestResults.length == 0)
                {
                    var myResponse = responseGenerator.generate(false,"No tests found",200,null,null);
                    console.log(myResponse);
                    res.json(myResponse);
                }
                else
                {
                    var myResponse = responseGenerator.generate(false,"Fetched test results",200,null,allTestResults);
                    console.log(myResponse);
                    res.json(myResponse);
                }         
            }

        });//end test result model find 

    });//end get all tests results



    //Get result by Id 
    testRouter.get('/results/view/:resultId',function(req,res){

        //begin test result find
        testResultModel.findOne({'_id':req.params.resultId},function(err,allTestResults){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error",err.code,null,null);          
                res.json( {myResponse});
            }
            else{
                if(allTestResults == null || allTestResults == undefined || allTestResults.length == 0)
                {
                    var myResponse = responseGenerator.generate(false,"No results found",200,null,null);
                    console.log(myResponse);
                    res.json(myResponse);
                }
                else
                {
                    var myResponse = responseGenerator.generate(false,"Fetched test results",200,null,allTestResults);
                    console.log(myResponse);
                    res.json(myResponse);
                }         
            }

        });//end test result model find 

    });//end get test result



    //Get all tests
    testRouter.get('/all',function(req,res){

        //begin test find
        testModel.find({},function(err,alltests){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error",err.code,null,null);          
                res.json( {myResponse});
            }
            else{
                if(alltests == null || alltests == undefined || alltests.length == 0)
                {
                    var myResponse = responseGenerator.generate(false,"No tests found",200,null,null);
                    console.log(myResponse);
                    res.json(myResponse);
                }
                else
                {
                    var myResponse = responseGenerator.generate(false,"Fetched tests",200,null,alltests);
                    console.log(myResponse);
                    res.json(myResponse);
                }         
            }

        });//end test model find 

    });//end get all tests



    //Get all questions
    testRouter.get('/questions/all',function(req,res){

        //begin question find
        questionModel.find({},function(err,allquestions){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error",err.code,null,null);          
                res.json( {myResponse});
            }
            else{
                if(allquestions == null || allquestions == undefined || allquestions.length == 0)
                {
                    var myResponse = responseGenerator.generate(false,"No questions found",200,null,null);
                    console.log(myResponse);
                    res.json(myResponse);
                }
                else
                {
                    var myResponse = responseGenerator.generate(false,"Fetched questions",200,null,allquestions);
                    console.log(myResponse);
                    res.json(myResponse);
                }         
            }

        });//end question model find 

    });//end get all questions



    //Get all answers
    testRouter.get('/answers/all',function(req,res){

        //begin answer find
        answerModel.find({},function(err,allAnswers){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error",err.code,null,null);          
                res.json( {myResponse});
            }
            else{
                if(allAnswers == null || allAnswers == undefined || allAnswers.length == 0)
                {
                    var myResponse = responseGenerator.generate(false,"No tests found",200,null,null);
                    console.log(myResponse);
                    res.json(myResponse);
                }
                else
                {
                    var myResponse = responseGenerator.generate(false,"Fetched tests",200,null,allAnswers);
                    console.log(myResponse);
                    res.json(myResponse);
                }         
            }

        });//end answer model find 

    });//end get all answer


    //Get all test results
    testRouter.get('/results/all',function(req,res){

        //begin test results find
        resultModel.find({},function(err,allTestResults){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error",err.code,null,null);          
                res.json( {myResponse});
            }
            else{
                if(allTestResults == null || allTestResults == undefined || allTestResults.length == 0)
                {
                    var myResponse = responseGenerator.generate(false,"No tests found",200,null,null);
                    console.log(myResponse);
                    res.json(myResponse);
                }
                else
                {
                    var myResponse = responseGenerator.generate(false,"Fetched test results",200,null,allTestResults);
                    console.log(myResponse);
                    res.json(myResponse);
                }         
            }

        });//end test result model find 

    });//end get all test results


    //name api
    app.use('/tests', testRouter);



 
};//end contoller code
