/* User Model */

var Mongo = require('mongodb');
var MongoClient =  new require('mongodb').MongoClient;
var mongoConfig = new require('../config/mongo-config');
var async = require("async");
var Database = new require('../models/database');

var User = function () {

	/* Connect to admin database when user logs in */
	this.connect = function (username, password, done) {
		global.gDatabases = null;
		global.gDatabases = [];
		var doneFunction = done;
		MongoClient.connect("mongodb://" + username + ":" + password + "@" + mongoConfig.hostname + ":" + mongoConfig.port, function(err, db) {
			if (err)
			{
				console.log(err.errmsg);
				return done(null,false);
			}

			/* Declare global variable of MongoDB connection URL for later database connections */
			global.mongoUrl = "mongodb://" + mongoConfig.hostname + ":" + mongoConfig.port;

			/* Declare  variable for admin database connection */
			var adminDb = db;

			var databaseList = [];

			function nullCallback () {
				return;
			}

			/* Get list of all databases */
			adminDb.admin().listDatabases(function (error, dbs){
				
				if (error)
				{
					
					console.log(error);
					return;
					
				}

				databaseList = dbs.databases;

				/* Loop through all database names and create a connection for each */
				async.each(
					databaseList,
					function (database, nullCallback) {
						/* Connect to this database */
						MongoClient.connect(mongoUrl + "/" + database.name, { db : {numberOfRetries: 2} }, function(err1, db) {
							if (err1)
							{
								console.log(err1);
								nullCallback();
								return;
							}
							
							/* Push database name and connection on array */
							gDatabases.push({ "dbName" : database.name, "dbConn" : db});
							nullCallback();

						});
				
					},
					function (err2) {
						if (err2);
						{
							console.log(err2);
						}
						adminDb.close();
						return done(null, {username: username});
						
					}
				);
				/* End async.each */
				
			});
			/* End database.allDatabases(function (error, dbs) */

			
	
		});
		/* End MongoClient.connect() */
	};

	/* Connect to admin database when running unit tests */
	this.testConnect = function (username, password, callback) {
		global.gDatabases = null;
		global.gDatabases = [];

		MongoClient.connect("mongodb://" + username + ":" + password + "@" + mongoConfig.hostname + ":" + mongoConfig.port, function(err, db) {

			if (err)
			{
				console.log(err.errmsg);

			}



			/* Declare global variable of MongoDB connection URL for later database connections */
			global.mongoUrl = "mongodb://" + mongoConfig.hostname + ":" + mongoConfig.port;

			/* Declare  variable for admin database connection */
			var adminDb = db;

			var databaseList = [];

			function nullCallback () {
				return;
			}

			/* Get list of all databases */
			adminDb.admin().listDatabases(function (error, dbs){
				
				if (error)
				{
					
					console.log(error);
					return;
					
				}

				databaseList = dbs.databases;

				/* Loop through all database names and create a connection for each */
				async.each(
					databaseList,
					function (database, nullCallback) {
						/* Connect to this database */
						MongoClient.connect(mongoUrl + "/" + database.name, { db : {numberOfRetries: 2} }, function(err1, db) {
							if (err1)
							{
								console.log(err1);
								nullCallback();
								return;
							}
							
							/* Push database name and connection on array */
							gDatabases.push({ "dbName" : database.name, "dbConn" : db});
							nullCallback();

						});
				
					},
					function (err2) {
						
						adminDb.close();
						callback();
						
					}
				);
				/* End async.each */
				
			});
			/* End database.allDatabases(function (error, dbs) */

			
	
		});
		/* End MongoClient.connect() */

	};


};

module.exports = User;