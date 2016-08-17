var models = require('../models');
var cors = require('cors');

module.exports = function (app) {

    /* hook */
    app.use('/admin*', function (req, res, next) {
        var allowed = ['', '/', '/login'];
        var adminRequestPath = req.params[0];
        
        if (allowed.indexOf(adminRequestPath) == -1){
            if (!req.session.user) {
                return res.redirect('/admin');
            }
        }else{
            if (req.session.user) {
                return res.redirect('/admin/trabajos');
            }
        }

        next();
    });

    // cors config
    var corsWhitelist = ['http://perucuadros.net', 'https://perucuadros.net'];
    var corsOptions = {
        origin: function (origin, callback) {
            callback(null, corsWhitelist.indexOf(origin) !== -1);
        }
    };
    
    
    app.get('/admin', cors(corsOptions), function(req, res){
        var data = {msg: ''};

        if (req.query.msg)
            data.msg = 'error';

        res.render('admin/index', data);
    });

    app.get('/admin/trabajos', cors(corsOptions), function (req, res) {
        res.render('admin/trabajos');
    });

    app.get('/admin/trabajos/nuevo', cors(corsOptions), function (req, res) {
        res.render('admin/trabajo-nuevo');
    });
    
    app.get('/admin/trabajos/:id/editar', cors(corsOptions), function (req, res) {
        res.render('admin/trabajo-editar');
    });

    app.get('/admin/trabajos/:id', cors(corsOptions), function (req, res) {
        res.render('admin/trabajo');
    });

    app.get('/admin/opciones', cors(corsOptions), function (req, res) {
        var data = {msg: ''};

        if (req.query.msg)
            data.msg = 'error';

        data.username = req.session.user.username;

        res.render('admin/opciones', data);
    });

    app.post('/admin/opciones', cors(corsOptions), function (req, res) {
        var User = models.User;
        
        var username = req.session.user.username;
        var newUsername = req.body.new_username;
        var password = req.body.password;
        var newPassword = req.body.new_password;
        var newPasswordRe = req.body.new_password_re;

        if (password.length > 0 && password === req.session.user.password) {
            var newData = {};
            newData.username = newUsername.length > 0 ? newUsername : username;

            if (newPassword.length > 0 && newPasswordRe.length > 0 ) {
                if (newPassword === newPasswordRe) {
                    newData.password = newPassword;
                } else {
                    return res.redirect('/admin/opciones?msg=error');
                }
            }
            
            User.findOneAndUpdate({'username': username}, newData, {new: true}, function (err, user) {
                if (err) return console.error(err);

                if (user) {
                    req.session.user = user;
                    return res.redirect('/admin/trabajos');
                }
            });
        } else {
            res.redirect('/admin/opciones?msg=error');
        }
    });

    app.post('/admin/login', cors(corsOptions), function (req, res) {
        var User = models.User;

        User.findOne({'username': req.body.username, 'password': req.body.password}, function (err, doc) {
            if (err) return console.error(err);

            if (doc){
                req.session.user = doc;
                res.redirect('/admin/trabajos');
            }else{
                res.redirect('/admin?msg=error');
            }
        });
    });

    app.get('/admin/logout', cors(corsOptions), function (req, res) {
        req.session.destroy();
        res.redirect('/admin');
    });
}