/* User controller */
var User = require('../models/user');
var passport = require('passport');

/* Render login page */
var login = function (req, res) {
	var params;
	/* If user is logged in, redirect him to the homepage */
	if (req.user)
	{
		params = {
			title: 'Home'
		};

		res.redirect('/');
	}
	else
	{
		params = {
			title: 'Login'
		};

		res.render('login.ejs', params);
	}

};

exports.login = login;

/* Authenticate user from post data sent from login page */
var loginUser = passport.authenticate('local', {
	failureRedirect: '/login',
	successRedirect: '/login-success'

});

exports.loginUser = loginUser;

/* Send login success message to login page*/
var loginSuccess = function (req, res) {
	res.type("text");
	res.send("success");

};

exports.loginSuccess = loginSuccess;

/* Logout user */
var logout = function (req, res) {

	for (var i = 0; i < gDatabases.length; i++)
	{
	
		/* Close all open databases */
		gDatabases[i].dbConn.close(true, function (error, result) {
			if ( i == (gDatabases.length - 1))
			{

				req.logout();
				res.redirect("/login");
			}

		});

	}

};

exports.logout = logout;