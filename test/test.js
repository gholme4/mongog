/* Mongo-G tests */

/* Require dependencies */
var app = require("../app");
var http = require("http");
var UserModel = require("../models/user");
var DatabaseModel = require("../models/database");
var config = require("./config");
var assert = require("chai").assert;
var expect = require("chai").expect;
/*var async = require("async");*/



var server;


var user = new UserModel ();
var database = new DatabaseModel ();
var databaseList;

describe("Mongo-G Tests", function() {
	this.timeout(5000);
	it("Log user in and connect to admin database", function(done) {
		/* Start the server */
		server = http.createServer(app).listen(config.nodePort, function(){
			console.log('Express server listening on port ' + config.nodePort);

			user.testConnect(config.mongoUsername, config.mongoPassword, function () {
				assert.isArray(gDatabases, 'gDatabase should be an array');
				done();
			});
		});
		
	});

	it("Connect to a database", function(done) {

		var dbConnection = database.db("admin");
		assert.property(dbConnection, 'serverConfig', "Should be a database connection object");
		done();
		
	});

	it("List all databases and get stats of each", function(done) {
		database.allDatabases(function (err, dbs) {
			
			if (!err)
			{
				databaseList = dbs.databases;

				/* Use list of database names to get stats of all databases */
				database.allDatabasesStats(databaseList, function (stats) {
					
					assert.isArray(stats, "Stats should be an array");
					assert.property(dbs, 'databases', "Should be a database list object");
					done();

				});
				
			}

		});

	});

	it("Get collections of a database", function(done) {
		database.getCollections("admin", function (collections) {
			assert.isArray(collections, "Collections should be an array");
			done();
		});

	});

	it("Get system info", function(done) {
		database.getSystemData (function (serverStatus, buildInfo, repStatus) {
			assert.isObject(serverStatus, "serverStatus should be an object");
			assert.property(serverStatus, 'host', "serverStatus object should have property, hosts");
			assert.isObject(buildInfo, "buildInfo should be an object");
			assert.property(buildInfo, 'version', "buildInfo object should have property, version");
			done();
		});

	});

	it("Get MongoDB log", function(done) {
		database.getLog(function (log) {
			assert.isObject(log, "Log should be an object");
			done();
		});

	});

	it("Get a collection's stats", function(done) {
		database.getCollectionStats("admin", "system.users", function (colStats) {
			assert.isObject(colStats, "Collection stats should be an object");
			assert.property(colStats, 'count', "Collection stats object should have property, count");
			done();
		});

	});

	it("Get a collection's documents and get a single document from that collection", function(done) {
		database.getCollectionDocuments("admin", "system.users", 50, 0, "_id", 1, function (collectionStats, items, documents) {
		
			assert.isObject(collectionStats, "Collection stats should be an object");
			assert.isArray(items, "Items should be an array");
			assert.isArray(documents, "Documents stats should be an array");
			database.getDocument("admin", "system.users", documents[0]._id, function (document) {
				assert.isString(document, "Document should be a string");
				done();
			});
			
		});

	});


	
});