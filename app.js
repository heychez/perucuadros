var express = require('express');
var mongoose = require('mongoose');
var config = require('config');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var routes = require('./routes');

var app = express();

if (app.get('env') === 'development'){
	app.use(logger('dev'));
}

var appPath = config.get('Application.directory.path');

app.set('views', './' + appPath + '/views');
app.set('view engine', 'ejs');
app.use(session({
	secret: '12edq1241ji12eqji12rfsdc2',
	resave: false,
	saveUninitialized: false,
	cookie: {maxAge: 3600000}
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/assets', express.static(appPath + '/assets'));
app.use('/public', express.static('app/data'));

var dbConfig = config.get('Database');
var dbConnectionUri = 'mongodb://' + dbConfig.host + ':' + dbConfig.port + '/' + dbConfig.db;
mongoose.connect(dbConnectionUri);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log('mongodb connection to '+ dbConnectionUri +' successfull.');
});


routes(app);

app.listen(3002);