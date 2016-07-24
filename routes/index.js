module.exports = function (app) {
	require('./site')(app);
	require('./api')(app);
	require('./admin')(app);
}