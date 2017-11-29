//Declare the service

app.factory('authService',function allData($http,$window,tokenService,$q){

    var authFactory={};

    //Factory for login
    authFactory.login = function(loginData){
        return $http.post('/users/login',loginData).then(function(data){

            //Call tokenService factory to set token
        	tokenService.setToken(data.data.token);
        	return data;
        });
    };

    //Factory to check if logged in
    authFactory.isLoggedIn = function(){

        //Call tokenService to get token
      	if(tokenService.getToken())
      	{
            console.log("logged in");
      		return true;
      	} 
      	else
      	{
            console.log("nt logged in");
       		return false;
      	}
    };

    authFactory.facebook = function(token){
        tokenService.setToken(token);  
    };

    //Factory to get user details
    authFactory.getUser = function(){

        //Call tokenService to check if token exists
      	if(tokenService.getToken()){
            console.log("logged in");
      		return $http.post('/users/me');
      	}
      	else{
      		$q.reject({ message : 'User has no token' });
      	}
    };

    //Factory to logout
    authFactory.logout = function(){
      	
        //Call tokenService to set token
      	tokenService.setToken();
    };



  return authFactory;

});





