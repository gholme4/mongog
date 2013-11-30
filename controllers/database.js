var $ = require('jquery');

/* Database controller */
var Database = require('../models/database');

/* Databases will be retrieved on every page request, so declare a function for this operation and use it in every router */
function getStats (callback) {

	/* Get list of databases and stats and display them on the overview page*/
	var database = new Database();
	var databaseList = [];

	/* Get list of all databases */
	database.allDatabases(function (error, dbs){

		if (!error)
		{
			databaseList = dbs.databases;

			/* Use list of database names to get stats of all databases */
			database.allDatabasesStats(databaseList, function (stats) {
				if (!stats)
				{
					databaseError(req, res);
					return;
				}
				callback(stats);

			});
			
		}
		else
		{
			console.log(error);
			databaseError(req, res);
		}
	});
}

/* Render home page */
var index =  function(req, res){

	/* Get list of all databases */
	getStats(function (stats) {
		
		var params = {
			title: 'Home',
			databases: stats
		};
		
		res.render('index.ejs', params);

	});

};

exports.index = index;

/* Render database page */
var databasePage =  function(req, res){
	
	var databaseName = req.param('database');

	/* Get list of all databases */
	getStats(function(stats) {

		var thisDatabase;

		/* Find selected database in the stats list */
		for (var i = 0; i <stats.length; i++)
		{

			if (stats[i].db == databaseName)
			{
				/* If database is found render the database view */
				thisDatabase = stats[i];

			}

		}

		if (!thisDatabase)
		{
			/* Database not found so render error view */
			databaseError(req, res);
			return;
		}

		var database = new Database();

		/* Get selected database collections*/
		database.getCollections(databaseName, function (collections) {
			if (!collections)
			{
				/* Error getting database collections */
				databaseError(req, res);
				return;
			}

			thisDatabase.collectionsList = collections;
			var params = {
				title: databaseName,
				databases: stats,
				database: thisDatabase
			};
			
			res.render('database.ejs', params);


		});
		
	});

	
	
};

exports.database = databasePage;

/* Render error page if there is a problem permforming a database operation */
var databaseError =  function(req, res){
	
	var params = {
		title: 'Error',
		databases: null
	};

	/* Get list of all databases */
	getStats( function (stats) {
		params.databases = stats;
		res.render('error.ejs', params);

	});

	
};

exports.error = databaseError;

/* Render system view */
var system =  function(req, res){
	
	var params = {
		title: 'System',
		databases: null,
		serverStatus: null,
		hostInfo: null
	};

	/* Get list of all databases */
	getStats( function (stats) {
		params.databases = stats;
		var database = new Database();

		database.getSystemData(function (serverStatus, buildInfo, replInfo){
			if (buildInfo && serverStatus)
			{
				
				params.serverStatus = serverStatus;
				params.buildInfo = buildInfo;
				params.replInfo = replInfo;
				res.render('system.ejs', params);
			}
			else
			{
				databaseError(req, res);
			}
			

		});
		
	});

	
};

exports.system = system;

/* Render log view */
var log =  function(req, res){
	
	var params = {
		title: 'Log',
		log: null,
		databases: null
		
	};

	/* Get list of all databases */
	getStats( function (stats) {
		var database = new Database();

		/* Get MongoDB log */
		database.getLog(function (log){
			if (!log)
			{
				databaseError(req, res);
			}
			else
			{
				params.databases = stats;
				params.log = log;
				res.render('log.ejs', params);
			}
			
		});
	});

	
};

exports.log = log;


/* Render collection stats view */
var collectionStats =  function(req, res){
	var databaseName = req.param('database');
	var collectionName = req.param('collection');

	var params = {
		title: databaseName + "/" + collectionName,
		databases: null,
		databaseName: databaseName,
		collectionName: collectionName
	};

	/* Get list of all databases */
	getStats( function (stats) {
		var database = new Database();
		params.databases = stats;
		/* Get collection stats */
		database.getCollectionStats(databaseName, collectionName, function (colStats) {
			if (colStats)
			{
				params.collectionStats = colStats;
				res.render('collection-stats.ejs', params);
			}
			else
			{
				databaseError(req, res);
			}
		});
		

	});

	
};

exports.collectionStats = collectionStats;

/* Render database export view */
var databaseExport =  function(req, res){
	var databaseName = req.param('database');
	var collectionName = req.param('collection');

	var params = {
		title: databaseName + ": Export",
		databases: null,
		databaseName: databaseName,
		collectionName: collectionName
	};

	/* Get list of all databases */
	getStats( function (stats) {
		var database = new Database();
		params.databases = stats;
		/* Get collection stats */
		database.getCollectionStats(databaseName, collectionName, function (colStats) {
			if (colStats)
			{
				params.collectionStats = colStats;
				res.render('database-export.ejs', params);
			}
			else
			{
				databaseError(req, res);
			}
		});
		

	});

	
};

exports.export = databaseExport;

/* Render database import view */
var databaseImport =  function(req, res){
	var databaseName = req.param('database');
	var collectionName = req.param('collection');

	var params = {
		title: databaseName + ": Import",
		databases: null,
		databaseName: databaseName,
		collectionName: collectionName
	};

	/* Get list of all databases */
	getStats( function (stats) {
		var database = new Database();
		params.databases = stats;
		/* Get collection stats */
		database.getCollectionStats(databaseName, collectionName, function (colStats) {
			if (colStats)
			{
				params.collectionStats = colStats;
				res.render('database-import.ejs', params);
			}
			else
			{
				databaseError(req, res);
			}
		});
		

	});

	
};

exports.import = databaseImport;

/* Render collection document view */
var collectionDocuments =  function(req, res){
	
	var databaseName = req.param('database');
	var collectionName = req.param('collection');
	var limit = req.param('limit') ? req.param('limit') : 50;
	var skip = req.param('skip') ? req.param('skip') : 0;
	var sort = req.param('sort') ? req.param('sort') : "_id";
	var order = req.param('order') ? req.param('order') : 1;

	var params = {
		title: databaseName + "/" + collectionName,
		databases: null,
		skip: skip,
		limit: limit,
		sort: sort,
		order: order,
		databaseName: databaseName,
		collectionName: collectionName,
		document: null
	};

	/* Get list of all databases */
	getStats( function (stats) {
		params.databases = stats;

		var database = new Database();

		/* Get all documents of this collection */
		database.getCollectionDocuments(databaseName, collectionName, limit, skip, sort, order, function (collectionStats, items, documents) {
			if (collectionStats && documents)
			{

				params.collectionStats = collectionStats;
				params.documents = documents;
				params.items = items;

				res.render('collection-documents.ejs', params);
			}
			else
			{
				databaseError(req, res);
			}
		});

		

	});

	
};

exports.collectionDocuments = collectionDocuments;

/* Render modify document view */
var modifyDocumentView =  function(req, res){
	
	var databaseName = req.param('database');
	var collectionName = req.param('collection');
	var documentId = req.param('documentId');

	var params = {
		title: databaseName + "/" + collectionName + ' - Modify ' + documentId,
		databases: null,
		databaseName: databaseName,
		collectionName: collectionName,
		documentId: documentId
	};

	/* Get list of all databases */
	getStats( function (stats) {
		params.databases = stats;

		var database = new Database();

		/* Get document by id */
		database.getDocument(databaseName, collectionName, documentId, function (doc) {
			if (doc)
			{
				delete doc._id;
				params.document = doc;
				res.render('modify-document.ejs', params);
			}
			else
			{
				databaseError(req, res);
			}
		});


	});

	
};

exports.modifyDocumentView = modifyDocumentView;

/* Modify a document and render result view */
var modifyDocument =  function(req, res){
	
	var databaseName = req.param('database');
	var collectionName = req.param('collection');
	var documentId = req.param('documentId');
	var data = req.param('modify-data');

	var params = {
		title: databaseName + "/" + collectionName + ' -  Result Modify ' + documentId,
		databases: null,
		databaseName: databaseName,
		collectionName: collectionName,
		documentId: documentId
	};

	/* Get list of all databases */
	getStats( function (stats) {
		params.databases = stats;

		var database = new Database();

		/* Modify document by id */
		database.modifyDocument(databaseName, collectionName, documentId, data, function (doc, error) {
		
			params.document = doc;
			params.error = error;
			
			res.render('modify-document-result.ejs', params);
		});


	});
	
};

exports.modifyDocument = modifyDocument;

/* Render insert document view */
var insertDocumentView =  function(req, res){
	
	var databaseName = req.param('database');
	var collectionName = req.param('collection');

	var params = {
		title: databaseName + "/" + collectionName + ' - Insert ',
		databases: null,
		databaseName: databaseName,
		collectionName: collectionName
	};

	/* Get list of all databases */
	getStats( function (stats) {
		params.databases = stats;
		
		res.render('insert-document.ejs', params);
	
	});

	
};

exports.insertDocumentView = insertDocumentView;

/* Insert document and render results view */
var insertDocument =  function(req, res){
	
	var databaseName = req.param('database');
	var collectionName = req.param('collection');
	var data = req.param('insert-data');

	var params = {
		title: databaseName + "/" + collectionName + ' - Result Insert ',
		databases: null,
		databaseName: databaseName,
		collectionName: collectionName
	};

	/* Get list of all databases */
	getStats( function (stats) {
		params.databases = stats;

		var database = new Database();

		/* Insert new document */
		database.insertDocument(databaseName, collectionName, data, function (doc, error) {
		
			params.document = doc;
			params.error = error;
			
			res.render('insert-document-result.ejs', params);
		});
		
			


	});

	
};

exports.insertDocument = insertDocument;

/* Delete document*/
var deleteDocument =  function(req, res){
	
	var databaseName = req.param('database');
	var collectionName = req.param('collection');
	var limit = req.param('limit') ? req.param('limit') : 50;
	var skip = req.param('skip') ? req.param('skip') : 0;
	var sort = req.param('sort') ? req.param('sort') : "_id";
	var order = req.param('order') ? req.param('order') : 1;
	var deleteId = req.param('delete_id');

	var params = {
		title: databaseName + "/" + collectionName,
		databases: null,
		skip: skip,
		limit: limit,
		sort: sort,
		order: order,
		databaseName: databaseName,
		collectionName: collectionName
	};

	/* Get list of all databases */
	getStats( function (stats) {
		params.databases = stats;

		var database = new Database();

		/* Delete document */
		database.deleteDocument(databaseName, collectionName, deleteId, function (doc, error) {
		
			params.document = doc;
			params.error = error;

			/* Get all documents of this collection */
			database.getCollectionDocuments(databaseName, collectionName, limit, skip, sort, order, function (collectionStats, items, documents) {
				if (collectionStats && documents)
				{

					params.collectionStats = collectionStats;
					params.documents = documents;
					params.items = items;

					res.render('collection-documents.ejs', params);
				
				}
				else
				{
					databaseError(req, res);
				}
			});
			
		});
		

	});

	
};

exports.deleteDocument = deleteDocument;

/* Create new collection */
var createCollection =  function(req, res){
	
	var databaseName = req.param('database');
	var collectionName = req.param('collection_name');
	collectionName = collectionName.replace(" ","_");
	var capped = req.param('capped');
	var size = req.param('size');
	var max = req.param('max');
	
	var database = new Database();

	/* Create collection */
	database.createCollection(databaseName, collectionName, capped, size, max, function (results) {
		if (results)
		{

			res.redirect("/database/" + databaseName + "/" + collectionName + "/documents");
			
		}
		else
		{
			databaseError(req, res);
		}
	});

};

exports.createCollection = createCollection;

/* Drop collection and render results view */
var dropCollection =  function(req, res){
	
	var databaseName = req.param('database');
	var collectionName = req.param('collection_drop');

	var params = {
		title: databaseName + "/" + collectionName + ' - Result Drop Collection',
		databases: null,
		databaseName: databaseName,
		collectionName: collectionName
	};

	/* Get list of all databases */
	getStats( function (stats) {
		params.databases = stats;

		var database = new Database();

		/* Drop collection */
		database.dropCollection(databaseName, collectionName, function (error, reply) {
			params.error = error;
			if (reply)
			{
				res.render('drop-collection-result.ejs', params);
			}
			else
			{
				databaseError(req, res);
			}
			
		});

	});
	
};

exports.dropCollection = dropCollection;


/* Render error page if there is a problem permforming a database operation */
var createDatabaseView =  function(req, res){
	
	var params = {
		title: 'Create Database',
		databases: null
	};

	/* Get list of all databases */
	getStats( function (stats) {
		params.databases = stats;
		res.render('create-database.ejs', params);

	});
	
};

exports.createDatabaseView = createDatabaseView;

/* Create new database */
var createDatabase =  function(req, res){
	
	var databaseName = req.param('database');
	databaseName = databaseName.replace(" ","_");

	var database = new Database();

	/* Create database */
	database.createDatabase(databaseName, function (result) {
		if (result)
		{

			res.redirect("/database/" + databaseName);
			
		}
		else
		{
			databaseError(req, res);
		}
	});

};

exports.createDatabase = createDatabase;

/* Drop database */
var dropDatabase =  function(req, res){
	
	var databaseName = req.param('drop_database');
	var params = {
		title: "Dropped Database",
		databaseName: databaseName,
		error: null
	};

	/* Get list of all databases */
	getStats( function (stats) {
		params.databases = stats;
		
		var database = new Database();

		/* Drop database */
		database.dropDatabase(databaseName, function (result, error) {
			params.error = error;
			res.render('drop-database-result.ejs', params);
				
			
		});

	});

};

exports.dropDatabase = dropDatabase;