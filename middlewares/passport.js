var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var userModel = require('./../app/models/user')
var session = require('express-session');
var jwt = require('jsonwebtoken');
var secret = 'a232fr45c66#$%%T5tv6NSJNSD12J@HU3SN';
                    
module.exports = function(app,passport){

    var main=this;

    //Use passport session as middleware
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(session({secret: 'keyboard cat',resave: false,saveUninitialized: true,cookie: { secure: false }}));


    //Serialize user
    passport.serializeUser(function(user, done) {

        //Sign JWT Token
        main.token = jwt.sign({userId:user._id,email:user.email, firstName : user.firstName,lastName:user.lastName},secret,{expiresIn:'24h'});
        done(null, user._id);
    });


    //Deserialize user
    passport.deserializeUser(function(id, done) {

        User.findById(id, function(err, user) {
            done(err, user);
        });
    });


    //Facebook Passport strategy
    passport.use(new FacebookStrategy({
        clientID: '522108081458087',
        clientSecret: '732c7ea2bfe0e95ef8d72b504d3d72fb',
        callbackURL: "http://localhost:3000/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'email']
    },
    function(accessToken, refreshToken, profile, done) {    

        //Find user by email
        userModel.findOne({'email':profile._json.email}).select('firstName lastName email mobileNumber _id').exec(function(err,user){
        if(err) done(err);

        if(user && user!=null){
            done(null,user);
        }
        else{
            user = new userModel({
                email : profile._json.email,
                firstName : profile._json.name
            });

            user.save(function(err,user){
                if(err) done(err);
                else done(null,user);
            });
        }
       });
    }
    ));


    //Passport Google Strategy
    passport.use(new GoogleStrategy({
        clientID: '14943672543-0moal3p6iindpba8i5uk6v31bnqpn7r6.apps.googleusercontent.com',
        clientSecret: 'tF-RAAs9xZWxhzF2I8VNJ3TY',
        callbackURL: "http://localhost:3000/auth/google/callback"
      },
      function(accessToken, refreshToken, profile, done) {

        //Find user by email
        userModel.findOne({'email':profile.emails[0].value}).select('firstName lastName email mobileNumber _id').exec(function(err,user){
            if(err) done(err);

            if(user && user!=null){
                done(null,user);
            }
            else {

                //If user not found register
                user = new userModel({
                    email : profile.emails[0].value,
                    firstName : profile.displayName
                });

                user.save(function(err,user){
                    if(err) done(err);
                    else done(null,user);
                });
            }
           });
      }
    ));

    //Google callback function
    app.get('/auth/google/callback', 
        passport.authenticate('google', { failureRedirect: '/googleerror' }),function(req, res) {
            res.redirect('/google/'+main.token);
    });


    app.get('/auth/google',passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login','profile','email'] }));

    

    //Facebook callback function
    app.get('/auth/facebook/callback',passport.authenticate('facebook', { failureRedirect: '/facebookerror' }),function(req,res){
        res.redirect('/facebook/'+main.token);
    });

    app.get('/auth/facebook',passport.authenticate('facebook', { scope: 'email' }));


    

    
    return passport;
};