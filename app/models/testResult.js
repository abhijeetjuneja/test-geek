// defining a mongoose schema 
// including the module
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var titlize = require('mongoose-title-case');
// declare schema object.
var Schema = mongoose.Schema;

//Declare test result model
var testResultSchema = new Schema({

	testId            : {type:String,default:'',required:true},
	testName          : {type:String,default:'',required:true},
	userId		      : {type:String,default:'',required:true},
	testScore         : {type:Number,default:''},
	testTotalMarks	  : {type:Number,default:''},
	testPercentage    : {type:Number},
    correctAnswers    : {type:Number,default:'',required:true},
	incorrectAnswers  : {type:Number,default:'',required:true},
	unattempted       : {type:Number,default:'',required:true},
	timeTaken         : {type:Number},
    createdAt         : {type:Date,default:Date.now()}

});

// Attach titlize
testResultSchema.plugin(titlize, {
  paths: [ 'testName' ]
});


//Export model
mongoose.model('Test-Result',testResultSchema);

