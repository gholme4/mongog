/* Database Model */

var Db = require('mongodb').Db;
var mongoConfig = require('../config/mongo-config');
var MongoClient =  new require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var bson = require('../models/bson');
var async = require("async");
var $ = require('jquery');

/* BSON HTML formatter */
var prettyBson = {};
prettyBson.bson = {
    replacer: function(match, pIndent, pKey, pVal, pEnd) {
        var key = '<span class=json-key>';
        var val = '<span class=json-value>';
        var str = '<span class=json-string>';
        var r = pIndent || '';
        if (pKey)
            r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
        if (pVal)
            r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
        return r + (pEnd || '');
    },
    prettyPrint: function(bsonString) {
        var bsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg;
        return bsonString.replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
            .replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(bsonLine, prettyBson.bson.replacer);
    }
};

var Database = function () {
	var $this = this;

	/* Loop through array of databases and return the selected database's connection */
	this.db = function (dbName) {
		for (var i = 0; i < gDatabases.length; i++)
		{
			if (dbName == gDatabases[i].dbName)
			{
				return gDatabases[i].dbConn;
			}
		}

	};

	/* Get list of databases */
	this.allDatabases = function (callback) {
		$this.db("admin").admin().listDatabases(callback);
	};
	/* End this.allDatabases */

	/* Get stats of all databases */
	this.allDatabasesStats = function (databases, callback) {
		var stats = [];
		var seriesFunctions = [];

		function nullCallback () {
			return;
		}

		/* Loop through all databases and get stats of each */
		async.each(
			gDatabases,
			function (database, nullCallback) {

				/* Get stats of this database */
				$this.db(database.dbName).stats(function (thisError, thisStats) {
					if (thisError)
					{
						nullCallback();
						return;
					}

					/* Add this databases's stats to an array */
					stats.push(thisStats);
					nullCallback();
					return;
				});

		
			},
			function (err) {
				if (!err)
				{
					/* Sort databases by name */
					stats.sort(function(a, b){
						var keyA = a.db,
						keyB = b.db;
						
						if(keyA < keyB) return -1;
						if(keyA > keyB) return 1;
						return 0;
					});
					callback(stats);
				}
				
			}
		);
		/* End async.each */

	};
	/* End this.allDatabasesStats */

	/* Get collections of single database */
	this.getCollections = function (databaseName, callback) {
		/* Get collections of this database */
		$this.db(databaseName).collections(function(error, collections) {
			if(error)
			{
				console.log(error);
				return;
			}

			callback(collections);
		});

	};
	/* End this.getCollections */

	/* Get system data */
	this.getSystemData = function (callback) {
		var serverStatus = {};
		var buildInfo = {};

		/* Get the server status */
		$this.db("admin").admin().serverStatus( function(err, status) {
			if (err)
			{
				callback(null,null,null);
				return;

			}
			
			/* Convert server status object values into pretty BSON */
			for (var key in status) {
				var value = status[key];
				var valueString = bson.toString(value, null, 3);
				serverStatus[key] = prettyBson.bson.prettyPrint(valueString);
			}
	
			/* Get build info */
			$this.db("admin").admin().buildInfo( function(error, info) {
				if (error)
				{
					callback(null,null,null);
					return;
					
				}

				/* Convert system info object values into pretty BSON */
				for (var key in info) {
					var value = info[key];
					var valueString = bson.toString(value, null, 3);
					buildInfo[key] = prettyBson.bson.prettyPrint(valueString);
				}

				/* Get replication info */
				$this.db("admin").admin().replSetGetStatus(function(repError, repStatus) {

					callback(serverStatus, buildInfo, repStatus);
					
				});
				
			});

		});
     
	};
	/* End this.getSystemData */

	/* Get the MongoDB log */
	this.getLog = function (callback) {
		/* Retrive the build information using the admin command */
		$this.db("admin").command({getLog: 'global'}, function(err, log) {
			callback(log);
		});
	};
	/* End this.getLog */

	/* Get stats and documents of a single collection */
	this.getCollectionStats = function (databaseName, collectionName, callback) {
		/* Get selected collection */
		$this.db(databaseName).collection(collectionName, function(err1, col) {
			if (err1)
			{
				callback(null);
				return;
			}

			/* Get stats for this collection */
			col.stats(function (err2, colStats) {
				if (err2 || colStats.errmsg)
				{
					callback(null);
				}
				else
				{
					callback(colStats);
				}
				
			});
			
		});
		
	};
	/* End this.getCollectionStats */

	/* Get documents for selected collection */
	this.getCollectionDocuments = function (databaseName, collectionName, limit, skip, sort, order, callback) {
		var collectionStats;
		var thisCollection;
		
		/* Get selected collection */
		$this.db(databaseName).collection(collectionName, function(err1, col) {
			if (err1)
			{
				callback(null, null);
				return;
			}

			thisCollection = col;
			/* Get stats for this collection */
			thisCollection.stats(function (err2, colStats) {
				if (err2 || colStats.errmsg)
				{
					
					callback(null, null);
					return;
				}
				
				collectionStats = colStats;
				/* Get documents for this collection */
				thisCollection.find({}, {limit: limit, skip: skip, sort: [[sort, order]]}).toArray(function(err3, items) {
					if (err3)
					{
						callback(null, null);
						return;
					}

					var documents = [];
					
					for(var i in items) {
						documents[i] = items[i];
						var thisString = bson.toString(items[i], null, 3);

						items[i] = prettyBson.bson.prettyPrint(thisString);
					}

					callback(collectionStats, items, documents);
					
				});
				
				
			});
			
		});
	
	};
	/* End this.getCollectionDocuments */


	/* Get document by id */
	this.getDocument = function (databaseName, collectionName, documentId, callback) {
		var collectionStats;
		var thisCollection;
		
		/* Get selected collection */
		$this.db(databaseName).collection(collectionName, function(err1, col) {
			if (err1)
			{
				callback(null);
				return;
			}

			var id;

			/* Convert id string to mongodb object ID if it has 24 characters*/
			if (documentId.length == 24) {
				
				try {
					id = new ObjectID.createFromHexString(documentId);
				}
				catch (err) {
					id = documentId;
				}
			}
			/* Leave id as a string */
			else
			{
				id = documentId;
			}

			/* Find document by id */
			col.findOne({_id: id}, function (err2, doc) {
				if (err2)
				{
					callback(null);
					return;

				}

				/* Convert json object to string with BSON datatypes */
				delete doc._id;
				doc = bson.toString(doc, null, '\t');
				callback(doc);
				
			});
				
		});
				
	};
	/* End this.getDocument */

	/* Find and modify document by id */
	this.modifyDocument = function (databaseName, collectionName, documentId, data, callback) {
		var collectionStats;
		var thisCollection;
		
		/* Get selected collection */
		$this.db(databaseName).collection(collectionName, function(err1, col) {
			if (err1)
			{
				callback(null, null);
				return;
			}

			var id;

			if (documentId.length == 24) {
			/*Convert id string to mongodb object ID */
				try {
					id = new ObjectID.createFromHexString(documentId);
				}
				catch (err) {
					
				}
			}
			else
			{
				id = documentId;
			}

			try {
				/* Update document */
				col.findAndModify({_id: id}, [], bson.toBSON(data), {new: true}, function (err2, doc) {

					if (err2)
					{
						callback(null, null);
						return;
					}

					/* Convert returned document to BSON formatted string */
					var docString = bson.toString(doc, null, 3);

					/* Convert BSON string to pretty HTML */
					docString = prettyBson.bson.prettyPrint(docString);
					callback(docString, err2);
					
				});
			}
			catch(throwError)
			{
				callback(null, throwError);
			}
			
		});

	};
	/* End this.modifyDocument */

	/* Insert new document into collection */
	this.insertDocument = function (databaseName, collectionName, data, callback) {
		var collectionStats;
		var thisCollection;
		
		/* Get selected collection */
		$this.db(databaseName).collection(collectionName, function(err1, col) {
			
			if (err1)
			{
				callback(null, null);
				return;
			}

			try {
				/* Insert new document into collection */
				col.insert(bson.toBSON(data), {}, function (err2, doc) {
					if (err2)
					{
						callback(null, null);
						return;
					}

					var docString = bson.toString(doc, null, 3);

					docString = prettyBson.bson.prettyPrint(docString);
					callback(docString, err2);
					
				});
			}
			catch(throwError)
			{
				callback(null, throwError);
			}
			
		});
				
	};
	/* End this.insertDocument */

	/* Find and delete document by id */
	this.deleteDocument = function (databaseName, collectionName, documentId, callback) {
		var collectionStats;
		var thisCollection;
		
		/* Get selected collection */
		$this.db(databaseName).collection(collectionName, function(err1, col) {
			if (err1)
			{
				callback(null, null);
				return;
			}

			var id;
			/* Convert id string to mongodb object ID */
			if (documentId.length == 24) {
				try {
					id = new ObjectID.createFromHexString(documentId);
				}
				catch (err) {
					
				}
			}
			else
			{
				id = documentId;
			}

			try {
				/* Delete document from collection */
				col.findAndRemove({_id: id}, function (err2, doc) {

					if (err2)
					{
						callback(null, null);
						return;
					}

					var docString = bson.toString(doc, null, 3);

					docString = prettyBson.bson.prettyPrint(docString);
					callback(docString, err2);
					
				});
			}
			catch(throwError)
			{
				callback(null, null);
			}
			
		});
			
	};
	/* End this.deleteDocument */

	/* Create a new collection */
	this.createCollection = function (databaseName, collectionName, capped, size, max, callback) {
		
		var options = {};
		if (capped == "yes")
		{
			options.capped = true;
			options.size = Number(size);
			options.strict = true;

			if ($.trim(max) != "")
			{
				options.max = Number(max);
			}
			
		}

		/* Create collection */
		$this.db(databaseName).createCollection(collectionName, options, function(err1, results) {
			if (err1)
			{
				callback(null);
				return;
			}

			callback(results);
			
		});
				
	};
	/* End this.createCollection */

	/* Drop a collection */
	this.dropCollection = function (databaseName, collectionName, callback) {
		
		/* Get this collection */
		$this.db(databaseName).collection(collectionName, function(err1, col) {
			if (err1)
			{
				callback(null, null);
				return;
			}

			/* Drop collection */
			col.drop(function (err2, reply) {

				if (err2)
				{
					callback(null, null);
					return;
				}
				
				callback(err2, reply);

			});
			
		});

	};
	/* End this.dropCollection */

	/* Create a new database */
	this.createDatabase = function (databaseName, callback) {
		/* Connect to new database */
		MongoClient.connect(mongoUrl + "/" + databaseName, function(err, db) {
			if (err)
			{
				
				callback(null);
				return;
			}

			gDatabases.push({ dbName: databaseName, dbConn: db});
			
			db.createCollection('system.indexes', function (err1, result){
				if (err1)
				{
					callback(null);
					return;
				}

				callback(result);
			});
			
		});
	};
	/* End this.createDatabase */

	/* Drop a database */
	this.dropDatabase = function (databaseName, callback) {
	
		$this.db(databaseName).dropDatabase(function (err1, result){
			if (err1)
			{
				console.log(err1);
				callback(null, null);
				return;

			}

			for (var i = 0; i < gDatabases.length; i++)
			{
				if (databaseName == gDatabases[i].dbName)
				{
					gDatabases.splice(i,1);
					callback(result, err1);
					return;
				}
			}
			
		});
	
	};
	/* End this.dropDatabase */

};
/* End var Database */

module.exports = Database;