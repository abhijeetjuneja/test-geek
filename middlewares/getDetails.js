var jwt = require('jsonwebtoken');
var secret = 'a232fr45c66#$%%T5tv6NSJNSD12J@HU3SN';

//Send decoded data from json token
exports.getDetails = function(req,res,next){

	//Check for token in body and headers
	var token = req.body.token || req.body.query || req.headers['x-access-token'];

	//If token is provided
	if(token){

		jwt.verify(token,secret,function(err,decoded){
			if(err){
				console.log('Invalid Token');
				res.json({error:true,message:'Invalid Token'});
			}
			else{
				req.details=decoded;
				next();
			}
		});
	}

	//If token not found
	else{
		console.log('No token');
		res.json({error:true,message:'No token provided'});
	}

};