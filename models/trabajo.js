var mongoose = require('mongoose');

var trabajoSchema = mongoose.Schema({
	title: String,
	institution: String,
	date: String,
	images: [{description: String, filename: String, thumb_filename: String}]
}, {
	timestamps: {
		createdAt: 'created_at', 
		updatedAt: 'updated_at'
	}
});

module.exports = mongoose.model('Trabajo', trabajoSchema);