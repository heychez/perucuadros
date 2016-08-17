var express = require('express');
var mongoose = require('mongoose');
var config = require('config');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var helmet = require('helmet');
var routes = require('./routes');

var app = express();

// enviroment config
if (app.get('env') === 'development'){
	app.use(logger('dev'));
}

// custom config (config/...)
var appPath = config.get('Application.directory.path');


// helmet (security)
app.use(helmet());

// session config
var sessionOptions = {
	secret: '12edq1241ji12eqji12rfsdc2',
	name: 'perucuadros-sess',
	resave: false,
	saveUninitialized: false,
	cookie: {maxAge: 3600000}
}

if (app.get('env') === 'production') {
	sessionOptions.cookie.httpOnly = true;
	sessionOptions.cookie.secure = true;
	sessionOptions.cookie.domain = 'perucuadros.net';
}

app.set('trust proxy', 1);
app.use(session(sessionOptions));

// bodyparser config (request data parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ejs view engine config
app.set('views', './' + appPath + '/views');
app.set('view engine', 'ejs');

// statics urls config
app.use('/assets', express.static(appPath + '/assets'));
app.use('/public', express.static('app/data'));

// mongodb config
var dbConfig = config.get('Database');
var dbConnectionUri = 'mongodb://' + dbConfig.host + ':' + dbConfig.port + '/' + dbConfig.db;

// mongodb connection
mongoose.connect(dbConnectionUri);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log('mongodb connection to '+ dbConnectionUri +' successfull.');
});

// set routes
routes(app);

// start app
app.listen(3002);