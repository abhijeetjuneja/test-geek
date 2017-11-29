var mongoose = require('mongoose');
var express = require('express');
var app         = express();
mongoose.Promise = require('bluebird');

// express router // used to define routes 
var userRouter  = express.Router();
var userModel = mongoose.model('User');
var jwt = require('jsonwebtoken');
var passport = require('passport');
var secret = 'a232fr45c66#$%%T5tv6NSJNSD12J@HU3SN';
var responseGenerator = require('./../../libs/responseGenerator');
var detail = require('./../../middlewares/getDetails');
var resetMailer = require('./../../libs/resetMailer');



module.exports.controllerFunction = function(app) {


    //Get all users
    userRouter.get('/all',function(req,res){

        //begin user find
        userModel.find({}).select("email firstName lastName mobileNumber").exec(function(err,allUsers){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error",err.code,null,null);          
                res.json(myResponse);
            }
            else
            {
                if(allUsers == null || allUsers == undefined)
                {
                    var myResponse = responseGenerator.generate(false,"No users found",404,null,null); 
                    console.log(myResponse);         
                    res.json(myResponse);
                }
                else
                {
                    var myResponse = responseGenerator.generate(false,"Fetched users",200,null,allUsers); 
                    console.log(myResponse);         
                    res.json(myResponse);
                }           
            }

        });//end user model find 

    });//end get all users


    //Signup
    userRouter.post('/signup',function(req,res){

        //Verify body parameters
        if(req.body.firstName!=undefined && req.body.lastName!=undefined &&req.body.email!=undefined && req.body.password!=undefined && req.body.mobile !=undefined){

            var newUser = new userModel({
                firstName           : req.body.firstName,
                lastName            : req.body.lastName,
                email               : req.body.email,
                mobileNumber        : req.body.mobile,
                password            : req.body.password,
                joined              : Date.now()


            });// end new user 

            //Save user
            newUser.save(function(err,newUser){
                if(err){
                    if(err.errors!=null)
                    { 
                        //Check if name is valid
                        if(err.errors.firstName){
                            var myResponse = responseGenerator.generate(true,err.errors.name.message,err.code,null,null);
                            console.log(myResponse);
                            res.json(myResponse);
                        } else
                        if(err.errors.lastName){
                            var myResponse = responseGenerator.generate(true,err.errors.name.message,err.code,null,null);
                            console.log(myResponse);
                            res.json(myResponse);
                        }else
                        //Check if email is valid 
                        if(err.errors.email){
                            var myResponse = responseGenerator.generate(true,err.errors.email.message,err.code,null,null);
                            console.log(myResponse);
                            res.json(myResponse);
                        } else 
                        //Check if mobile number is valid
                        if(err.errors.mobileNumber){
                            var myResponse = responseGenerator.generate(true,err.errors.mobileNumber.message,err.code,null,null);
                            console.log(myResponse);
                            res.json(myResponse);
                        }
                        //Check if password is valid
                          else if(err.errors.password){
                            var myResponse = responseGenerator.generate(true,err.errors.password.message,err.code,null,null);
                            console.log(myResponse);
                            res.json(myResponse);
                        }
                    }
                    else if(err){
                        //If error code 11000 duplicate email
                        if(err.code==11000){
                            var myResponse = responseGenerator.generate(true,'Email already exists',err.code,null,null);
                            console.log(myResponse);
                            res.json(myResponse);
                        }
                        else{
                            var myResponse = responseGenerator.generate(true,err.errmsg,err.code,null,null);
                            console.log(myResponse);
                            res.json(myResponse);
                        } 
                        
                    }
                    
                    

                }
                //If no errors
                else{

                    //Sign JWT Token
                    var token = jwt.sign({userId:newUser._id,email:newUser.email, firstName : newUser.firstName,lastName:newUser.lastName},secret,{expiresIn:'24h'});
                    
                    var myResponse = responseGenerator.generate(false,"Signup Up Successfully",200,token,null);
                    console.log(myResponse);
                    res.json(myResponse);
                }

            });//end new user save


        }
        //Form fields not filled up
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
        

    });//end signup



    //Login
    userRouter.post('/login',function(req,res){

        //begin user find
        userModel.findOne({'email':req.body.email}).select('email password firstName lastName').exec(function(err,foundUser){
            if(err){
                var myResponse = responseGenerator.generate(true,"Some error occurred",err.code,null,null);
                console.log(myResponse);
                //res.send(myResponse);
                res.json(myResponse);

            }
            //If user not found
            else if(foundUser==null || foundUser==undefined || foundUser.email == undefined){

                var myResponse = responseGenerator.generate(true,"Could not authenticate user",404,null,null);
                console.log(myResponse.message);
                //res.send(myResponse);
                res.json(myResponse);

            }
            else
            {
                //Check if password exists
                if(req.body.password){

                    //Decrypt and compare password the Database
                    var validPassword = foundUser.comparePassword(req.body.password);
                }
                //No password provided 
                else {
                    var myResponse = responseGenerator.generate(true,"No password provided",404,null,null);
                    console.log(myResponse);
                    res.json(myResponse); 
                }
                //If password doesn't match
                if(!validPassword)
                {
                    var myResponse = responseGenerator.generate(true,"Could not authenticate password.Invalid password",404,null,null);
                    console.log(myResponse);
                    res.json(myResponse); 
                }
                //If password matches
                else
                {
                    //Sign JWT Token
                    console.log(foundUser);
                    var token = jwt.sign({userId:foundUser._id,email:foundUser.email, firstName : foundUser.firstName,lastName:foundUser.lastName},secret,{expiresIn:'24h'});
                    var myResponse = responseGenerator.generate(false,"Login Successfull",200,token,null);
                    console.log(myResponse);
                    res.json(myResponse); 
                }

            }
        });
    });


    //Delete test by id
    userRouter.get('/details/:userId',function(req,res){
        
        //Remove test
        userModel.findOne({'_id':req.params.userId}).select('email firstName lastName').exec(function(err,user){
            if(err){
                var myResponse = responseGenerator.generate(true,err.message,err.code,null,null);
                console.log(myResponse);
                res.json(myResponse);
             }
            else
            {
                if(user == null || user == undefined)
                {
                    var myResponse = responseGenerator.generate(true,"User not found",404,null,null);
                    console.log(myResponse);
                    res.json(myResponse);
                }
                else
                {
                    var myResponse = responseGenerator.generate(false,"User found",200,null,user);
                    console.log(myResponse);
                    res.json(myResponse);
                }
               
            }
        });//end remove


    });//end delete test



    //Check if email already exists
    userRouter.post('/checkemail',function(req,res){

        var main=this;
        //begin user find
        userModel.findOne({'email':req.body.email}).select('email').exec(function(err,foundUser){
            if(err){
                var myResponse = responseGenerator.generate(true,"Some error occurred",err.code,null,null);
                console.log(myResponse);
                //res.send(myResponse);
                res.json(myResponse);

            }
            //If user not found
            else if(foundUser==null || foundUser==undefined || foundUser.email == undefined){

                var myResponse = responseGenerator.generate(false,"Email available",200,null,null);
                console.log(myResponse.message);
                res.json(myResponse.message);

            }
            //If user found generate error that email already exists
            else
            {
                var myResponse = responseGenerator.generate(true,"Email already taken",200,null,null);
                console.log(myResponse.message);
                //res.send(myResponse);
                res.json(myResponse);
            }
        });

    });


    //Get email for password reset and assign reset token
    userRouter.put('/resetpassword',function(req,res){

        var main = this;
        //begin user find
        userModel.findOne({'email':req.body.email}).select('email firstName lastName mobileNumber resetToken').exec(function(err,foundUser){
            if(err){
                var myResponse = responseGenerator.generate(true,"Some error occurred",err.code,null,null);
                console.log(myResponse);
                //res.send(myResponse);
                res.json(myResponse);
            }
            else
            //If email not found
            if(foundUser==null || foundUser==undefined || foundUser.email == undefined){

                var myResponse = responseGenerator.generate(true,"Email not found",404,null,null);
                console.log(myResponse);
                res.json(myResponse);
            }
            //If email found
            else
            {
                //Assign Reset Token
                foundUser.resetToken=jwt.sign({email:foundUser.email},secret,{expiresIn:'24h'});

                var newToken=foundUser.resetToken;

                //Save new reset token
                foundUser.save(function(err){
                    if(err){
                        var myResponse = responseGenerator.generate(true,"Some error occurred",err.code,null,null);
                        console.log(myResponse);
                        res.json(myResponse);
                    }
                    else{
                        //Details for email notification
                        var name = foundUser.firstName + ' ' + foundUser.lastName;
                        var text='Hello '+name+'! You recently requested to change your password.Please click on the link below to change your password - http://localhost:3000/#newpassword/'+newToken;
                        var html='Hello '+name+'! You recently requested to change your password.Please click on the link below to change your password - <a href="http://localhost:3000/resetpassword/' + newToken+'">http://localhost:3000/reset/</a>';
                        
                        //Send email with password reset link
                        resetMailer.send('Localhost',foundUser.email,'Reset Password Link',text,html);
                        var myResponse = responseGenerator.generate(false,"Check email for password change link",200,null,null);
                        console.log(myResponse.message);
                        res.json(myResponse);
                    }

                });

            }
        });

     });//end reset password


    //Reset Password by reset Token
    userRouter.get('/resetpassword/:token',function(req,res){

        //begin user find by reset token
        userModel.findOne({'resetToken':req.params.token}).select().exec(function(err,foundUser){
            if(err){
                var myResponse = responseGenerator.generate(true,"Some error occurred",err.code,null,null);
                console.log(myResponse);
                //res.send(myResponse);
                res.json(myResponse);

            } else if(foundUser == null || foundUser == undefined){
                var myResponse = responseGenerator.generate(true,"Password link has expired",404,null,foundUser);
                console.log(myResponse);
                res.json(myResponse);

            } else{
                //Get token
                var token = req.params.token;

                //Verify reset token with secret
                jwt.verify(token,secret,function(err,decoded){
                    if(err){
                        var myResponse = responseGenerator.generate(true,"Password link has expired",err.code,null,null);
                        console.log(myResponse);
                        res.json(myResponse);
                    }
                    else{
                        //If user not found password link expired
                        if(foundUser == null || foundUser == undefined){
                            console.log(foundUser);
                            var myResponse = responseGenerator.generate(true,"Password link has expired",404,null,foundUser);
                            console.log(myResponse);
                            res.json(myResponse);
                        } 
                        //User found 
                        else{

                            //Send email as data in response
                            var data={email:foundUser.email};
                            var myResponse = responseGenerator.generate(false,"Success",200,null,data);
                            console.log(myResponse);
                            res.json(myResponse);
                        }
                        
                    }
                });
            }
            
        });
    });


    //Save new password
    userRouter.put('/savepassword',function(req,res){
        
        //Find user by email
        userModel.findOne({'email':req.body.email}).select().exec(function(err,foundUser){
            if(err){
                var myResponse = responseGenerator.generate(true,"Some error occurred",err.code,null);
                console.log(myResponse);
                res.json(myResponse);

            }
            else
            {
                //Set new password
                foundUser.password = req.body.password;

                //Set reset token as null
                foundUser.resetToken=null;

                //Save new model
                foundUser.save(function(){
                    if(err){
                        var myResponse = responseGenerator.generate(true,"Could not change Password",err.code,null,null);
                        console.log(myResponse);
                        res.json(myResponse);

                    } else {
                        var myResponse = responseGenerator.generate(false,"Changed Password",200,null,null);
                        console.log(myResponse);
                        res.json(myResponse);
                    }
                });
            }
                

        });// end find

    });//end save password




    //Get user details through middleware
    userRouter.post('/me',detail.getDetails,function(req,res){
        
        res.json(req.details);

    });



    //Delete user by id.Admin section
    userRouter.post('/:userId/delete',function(req,res){
        
        //Remove user
        userModel.remove({'_id':req.params.userId},function(err,user){
            if(err){
                var myResponse = responseGenerator.generate(true,"Some error.Check Id"+err,500,null,null);
                console.log(myResponse);
                res.json(myResponse);
             }
            else
            {
                var myResponse = responseGenerator.generate(false,"Successfully deleted user",200,null,null);
                console.log(myResponse);
                res.json(myResponse);
            }
        });//end remove


    });//end remove user

    //Delete all users for admin
    userRouter.post('/delete/all/123',function(req,res){
        
        //Remove test
        userModel.remove(function(err,test){
            if(err){
                var myResponse = responseGenerator.generate(true,err.message,err.code,null,null);
                console.log(myResponse);
                res.json(myResponse);
             }
            else
            {
                var myResponse = responseGenerator.generate(false,"Successfully deleted users",200,null,null);
                console.log(myResponse);
                res.json(myResponse);
            }
        });//end remove


    });//end delete test


    //name api
    app.use('/users', userRouter);



 
};//end contoller code
