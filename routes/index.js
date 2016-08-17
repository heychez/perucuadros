module.exports = function (app) {
	require('./site')(app);
	require('./admin')(app);
	require('./api')(app);
}