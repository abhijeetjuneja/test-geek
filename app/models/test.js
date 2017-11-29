// defining a mongoose schema 
// including the module
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var titlize = require('mongoose-title-case');
// declare schema object.
var Schema = mongoose.Schema;

//Declare test model
var testSchema = new Schema({

	testName         : {type:String,default:'',required:true},
	testCategory     : {type:String,default:'',required:true},
    testDescription  : {type:String,default:'',required:true},
	timeLimit        : {type:Number,default:'',required:true},
    marksPerQuestion : {type:Number,default:'',required:true},
    questions        : [],
    createdAt        : {type:Date},
    modifiedAt       : {type:Date,default:Date.now()}

});

// Attach titlize
testSchema.plugin(titlize, {
  paths: [ 'testName' ]
});


//Export model
mongoose.model('Test',testSchema);

