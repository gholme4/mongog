/* These are parameters required to run the unit tests. 

* Specify a Node port that doesn't have a process running on it. 
* Make sure a mongod instance is running. 
* To successfully run the tests, the admin database should be created with a user having the username and password below.
*/
var params = {
	nodePort : 8080,
	mongoUsername : "MONGOUSERNAME",
	mongoPassword : "MONGOPASSWORD",
	mongoPort : "MONGOPORT",
	mongoHostname : "HOSTNAME"
};

module.exports = params;