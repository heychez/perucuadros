var multer = require('multer');
var fs = require('fs');
var jimp = require('jimp');
var models = require('../models');

module.exports = function (app) {

    /* hook */
	app.use('/api*', function (req, res, next) {
        var notAllowedMethods = ['POST', 'PUT', 'DELETE'];
        var reqPath = req.params[0];
        var reqMethod = req.method;
        
        if (notAllowedMethods.indexOf(reqMethod) != -1) {
        	if (!req.session.user) {
                //return res.status(401).end();
            }
        }

        next();
	});

    var upload = multer({dest: 'app/data/imagenes'});
    var cpUpload = upload.any();

	app.get('/api/trabajos', function (req, res) {
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

	app.post('/api/trabajos', cpUpload, function (req, res) {
		var Trabajo = models.Trabajo;
		
		var trabajo = new Trabajo({
			title: req.body.title,
			institution: req.body.institution,
			date: req.body.date,
			images: []
		});

		for (var i in req.files){
			var fname = String(i).concat(new Date().getTime()).concat(req.files[i].originalname.slice(-4));
			trabajo.images.push({
				description: req.body['images_descrip'][i],
				filename: fname,
				thumb_filename: 'thumb_'+fname
			});

			(function (filename) {
				fs.rename('app/data/imagenes/'+req.files[i].filename, 'app/data/imagenes/'+filename, function (err) {
					if (err) {
						console.error(err);
					} else {
						console.log('jimp '+filename);
						jimp.read('app/data/imagenes/'+filename).then(function (img) {
							img.resize(330, jimp.AUTO)
								.write('app/data/imagenes/thumb_'+filename);
						}).catch(function (rerr) {
							if (rerr) console.error(rerr);
						});
					}
				});
			})(fname);
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

	app.get('/api/trabajos/:id', function (req, res) {
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

	app.put('/api/trabajos/:id', cpUpload, function (req, res) {
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
									fs.unlinkSync('app/data/imagenes/thumb_'+doc.images[j].filename);
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
					var fname = String(i).concat(new Date().getTime()).concat(req.files[i].originalname.slice(-4));
					doc.images.push({
						description: req.body['images_descrip'][i],
						filename: fname,
						thumb_filename: 'thumb_'+fname
					});

					(function (filename) {
						fs.rename('app/data/imagenes/'+req.files[i].filename, 'app/data/imagenes/'+filename, function (err) {
							if (err) {
								console.error(err);
							} else {
								jimp.read('app/data/imagenes/'+filename).then(function (img) {
									img.resize(330, jimp.AUTO)
										.write('app/data/imagenes/thumb_'+filename);
								}).catch(function (rerr) {
									if (rerr) console.error(rerr);
								});
							}
						});
					})(fname);
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

	app.delete('/api/trabajos/:id', function (req, res) {
		var Trabajo = models.Trabajo;

		Trabajo.findByIdAndRemove(req.params.id)
			.then(function (doc) {
				for (var i = 0; i < doc.images.length; i++) {
					fs.unlink('app/data/imagenes/' + doc.images[i].filename, function (err) {
						if (err)  console.error(err);
					});
					fs.unlink('app/data/imagenes/thumb_' + doc.images[i].filename, function (err) {
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