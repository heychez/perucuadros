var multer = require('multer');
var fs = require('fs');
var jimp = require('jimp');
var cors = require('cors')
var models = require('../models');

module.exports = function (app) {

    /* hook */
	app.use('/api*', function (req, res, next) {
        var notAllowedMethods = ['POST', 'PUT', 'DELETE'];
        var reqPath = req.params[0];
        var reqMethod = req.method;
        
        if (notAllowedMethods.indexOf(reqMethod) != -1) {
        	if (!req.session.user) {
                return res.status(401).end();
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

	// multer config (files uploader)
	var allowedExts = ['.png', '.jpg', '.gif', '.svg'];
    var upload = multer({dest: 'app/data/imagenes', limits: {fileSize: 5000000}});
    var cpUpload = upload.array('images[]');


	app.get('/api/trabajos', cors(corsOptions), function (req, res) {
		var Trabajo = models.Trabajo;
		
		Trabajo.find()
			.then(function (docs) {
				res.json(docs);
			})
			.catch(function (err) {
				console.error(err);
				res.status(500).json({
					code: 1000,
					message: 'No se pudo obtener los datos de la BD'
				});
			});
	});

	app.post('/api/trabajos', cors(corsOptions), cpUpload, function (req, res) {
		var Trabajo = models.Trabajo;
		
		var trabajo = new Trabajo({
			title: req.body.title,
			institution: req.body.institution,
			date: req.body.date,
			images: []
		});

		for (var i in req.files){
			var ext = req.files[i].originalname.slice(-4);

			if (allowedExts.indexOf(ext) == -1) continue;

			var name = String(i).concat(new Date().getTime());
			var fname = name.concat(ext);
			var thumbFname = name.concat('_thumb').concat(ext);

			trabajo.images.push({
				description: req.body['images_descrip'][i],
				filename: fname,
				thumb_filename: thumbFname
			});

			(function (fname, thumbFname) {
				fs.rename('app/data/imagenes/'+req.files[i].filename, 'app/data/imagenes/'+fname, function (err) {
					if (err) {
						console.error(err);
					} else {
						console.log('jimp '+fname);
						jimp.read('app/data/imagenes/'+fname).then(function (img) {
							img.resize(330, jimp.AUTO)
								.write('app/data/imagenes/'+thumbFname);
						}).catch(function (rerr) {
							if (rerr) console.error(rerr);
						});
					}
				});
			})(fname, thumbFname);
		}

		trabajo.save()
			.then(function (doc) {
				res.status(201).end();
			})
			.catch(function (err) {
				console.error(err);
				res.status(500).json({
					code: 1000,
					message: 'No se pudo registrar el trabajo en la BD'
				});
			});
	});

	app.get('/api/trabajos/:id', cors(corsOptions), function (req, res) {
		var Trabajo = models.Trabajo;

		Trabajo.findById(req.params.id)
			.then(function (doc) {
				res.json(doc);
			})
            .catch(function (err) {
				console.error(err);
            	res.status(500).json({
					code: 1000,
					message: 'No se pudo obtener el trabajo de la BD'
				});
        	});
	});

	app.options('/api/trabajos/:id', cors(corsOptions));
	app.put('/api/trabajos/:id', cors(corsOptions), cpUpload, function (req, res) {
		var Trabajo = models.Trabajo;
		
		Trabajo.findById(req.params.id, function (err, doc) {
		  	if (err) {
		  		console.error(err);
		  		res.status(401).json({
					code: 1000,
					message: 'Datos incorrectos, trabajo no modificado'
				});
		  	} else {
				doc.title = req.body.title;
				doc.institution = req.body.institution;
				doc.date = req.body.date;

				var imagesToRemove = req.body['images_remove'];

				if (imagesToRemove) {
					for (var i = 0; i < imagesToRemove.length; i++) {
						for (var j = 0; j < doc.images.length; j++) {
							if (imagesToRemove[i] == doc.images[j]._id) {
								try {
									fs.unlinkSync('app/data/imagenes/'+doc.images[j].filename);
								} catch (err) {
									console.error(err);
								}
								
								try {
									fs.unlinkSync('app/data/imagenes/'+doc.images[j].thumb_filename);
								} catch (err) {
									console.error(err);
								}
								
								doc.images.splice(j, 1);
								break;
							}
						}
					}
				}

				for (var i in req.files){
					var ext = req.files[i].originalname.slice(-4);

					if (allowedExts.indexOf(ext) == -1) continue;

					var name = String(i).concat(new Date().getTime());
					var fname = name.concat(ext);
					var thumbFname = name.concat('_thumb').concat(ext);

					doc.images.push({
						description: req.body['images_descrip'][i],
						filename: fname,
						thumb_filename: thumbFname
					});

					(function (fname, thumbFname) {
						fs.rename('app/data/imagenes/'+req.files[i].filename, 'app/data/imagenes/'+fname, function (err) {
							if (err) {
								console.error(err);
							} else {
								jimp.read('app/data/imagenes/'+fname).then(function (img) {
									img.resize(330, jimp.AUTO)
										.write('app/data/imagenes/'+thumbFname);
								}).catch(function (rerr) {
									if (rerr) console.error(rerr);
								});
							}
						});
					})(fname, thumbFname);
				}

				doc.save()
					.then(function (doc) {
						res.status(200).end();
					})
					.catch(function (err) {
						console.error(err);
						res.status(500).json({
							code: 1000,
							message: 'No se pudo modificar el trabajo en la BD'
						});
					});
			}
		});
	});

	app.delete('/api/trabajos/:id', cors(corsOptions), function (req, res) {
		var Trabajo = models.Trabajo;

		Trabajo.findByIdAndRemove(req.params.id)
			.then(function (doc) {
				for (var i = 0; i < doc.images.length; i++) {
					fs.unlink('app/data/imagenes/' + doc.images[i].filename, function (err) {
						if (err)  console.error(err);
					});
					fs.unlink('app/data/imagenes/' + doc.images[i].thumb_filename, function (err) {
						if (err)  console.error(err);
					});
				}

				res.status(200).end();
			})
			.catch(function (err) {
				console.error(err);
            	res.status(500).json({
					code: 1000,
					message: 'No se pudo eliminar el trabajo de la BD'
				});
	        });
	});
}