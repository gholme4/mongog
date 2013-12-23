/* Config Module */


/* Load controllers */
var UserController = require('../controllers/user');
var DatabaseController = require('../controllers/database');
var auth = require('../middlewares/authentication');
var User = require('../models/user');

var configuration = function(app, passport, LocalStrategy){


	/* Set database routes */
	app.get('/', auth.requiresLogin, DatabaseController.index);
	app.get('/database/:database', DatabaseController.database);
	app.get('/database/:database/:collection/documents', DatabaseController.collectionDocuments);
	app.post('/database/:database/:collection/documents', DatabaseController.deleteDocument);
	app.get('/database/:database/:collection/stats', DatabaseController.collectionStats);
	app.get('/database/:database/export', DatabaseController.exportView);
	app.get('/database/:database/import', DatabaseController.importView);
	app.post('/database/:database/export-collections', DatabaseController.exportCollections);
	app.post('/database/:database/create-collection', DatabaseController.createCollection);
	app.post('/database/:database/drop-collection', DatabaseController.dropCollection);
	app.get('/database/:database/:collection/modify/:documentId', DatabaseController.modifyDocumentView);
	app.post('/database/:database/:collection/modify-document/:documentId', DatabaseController.modifyDocument);
	app.get('/database/:database/:collection/insert', DatabaseController.insertDocumentView);
	app.post('/database/:database/:collection/insert', DatabaseController.insertDocument);
	app.get('/create-database', DatabaseController.createDatabaseView);
	app.post('/create-database', DatabaseController.createDatabase);
	app.post('/drop-database', DatabaseController.dropDatabase);
	app.get('/error', DatabaseController.error);
	app.get('/system', DatabaseController.system);
	app.get('/log', DatabaseController.log);

	/* Set user routes */
	app.get('/login', UserController.login);
	app.post('/login-user', UserController.loginUser);
	app.get('/login-success', UserController.loginSuccess);
	app.get('/logout', UserController.logout);


	app.get('/tests', function (req, res) {
		var params = {
			title: "Tests"
		};

		res.render("tests", params);
	});


	/* Initialize passort authentication */
	passport.use(new LocalStrategy(
		function (username, password, done) {
			var user = new User();
			user.connect(username,password, done);
			
		}
	));

	passport.serializeUser(function(user, done) {
		done(null, user.username);
	});

	passport.deserializeUser(function(username, done) {
		done(null, {username: username});
	});
	

	/* Redirect 404 errors to home page */
	app.use(function(req, res) {
		var params = {
			title: 'Home'
		};

		res.redirect('/');
	});


};

module.exports = configuration;