
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var engine = require('ejs-locals');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var app = express();

/* all environments */
app.set('port', process.env.PORT || 3000);
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon(path.join(__dirname, "public/images/favicon.png")));
app.use(express.cookieParser());
app.use(express.session({ secret: 'mongog'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.methodOverride());



/* development only */
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

/* Set up configuration */
var config = require('./config')(app, passport, LocalStrategy);


module.exports = app;


