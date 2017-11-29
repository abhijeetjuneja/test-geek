// defining a mongoose schema 
// including the module
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var titlize = require('mongoose-title-case');
// declare schema object.
var Schema = mongoose.Schema;

//Declare answer model
var answerSchema = new Schema({

    testId            : {type:String,required:true},
    userId            : {type:String,default:'',required:true},
    questionId        : {type:String,default:'',required:true},
	question          : {type:String,default:'',required:true},
	givenAnswer       : {type:String,default:'',required:true},
    correctAnswer     : {type:String,default:'',required:true},
	timeTaken         : {type:Number,default:'',required:true},
    createdAt         : {type:Date,default:Date.now()}

});

// Attach titlize
answerSchema.plugin(titlize, {
  paths: [ 'givenAnswer','correctAnswer']
});

//Export model
module.exports = mongoose.model('Answer',answerSchema);

