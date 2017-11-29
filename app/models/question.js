// defining a mongoose schema 
// including the module
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var titlize = require('mongoose-title-case');
// declare schema object.
var Schema = mongoose.Schema;

//Declare question model
var questionSchema = new Schema({

    testId           : {type:String,required:true},
    question         : {type:String,default:'',required:true},
	option1          : {type:String,default:'',required:true},
	option2          : {type:String,default:'',required:true},
	option3          : {type:String,default:'',required:true},
	option4          : {type:String,default:'',required:true},
    answer           : {type:String,default:'',required:true},
    createdAt        : {type:Date,default:Date.now()},
    modifiedAt       : {type:Date,default:Date.now()}

});

// Attach titlize
questionSchema.plugin(titlize, {
  paths: [ 'option1','option2','option3','option4','answer' ]
});

//Export model
module.exports = mongoose.model('Question',questionSchema);

