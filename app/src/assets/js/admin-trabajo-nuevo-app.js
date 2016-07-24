window.$ = window.jQuery = require('jquery');
var DOMBuilder = require('dom-builder');

$(document).on('click', ".agregar-mas-imagenes", function () {
	var agregarMasImagenes = new DOMBuilder();

	agregarMasImagenes
		.ele('tr')
			.ele('td').ele('label', 'Archivos').cl()
			.ele('td').ele('input', {type: 'file', name: 'images[]'}).cl()
		.cl()
		.ele('tr')
			.ele('td').ele('label', 'Descripcion').cl()
			.ele('td').ele('input', {type: 'text', name: 'images_descrip[]', size: '67'}).cl()
		.cl()
		.ele('tr', {class: 'tr-border'})
			.ele('td').cl()
			.ele('td').ele('a', {class: 'quitar-subir-imagen'}, 'Quitar').cl()
		.cl()
		.ele('tr')
			.ele('td').ele('a', {class: 'agregar-mas-imagenes'}, 'Agregar').cl()
		.cl();
	
	var tr_tag = $(this).parent().parent();

	tr_tag.parent().append(agregarMasImagenes.body);
	tr_tag.remove();
});

$(document).on('click', ".quitar-subir-imagen", function () {
	var tr_tag = $(this).parent().parent();
	tr_tag.prev().remove();
	tr_tag.prev().remove();
	tr_tag.remove();
});

var form = document.getElementById('trabajo-nuevo');

form.onsubmit = function (evt) {
	evt.preventDefault();

	var formData = new FormData(form);
	
	var request = new XMLHttpRequest();
	request.open('POST', '/api/trabajos');

	request.onload = function (revt) {
		if (request.status == 201) {
			window.location = '/admin/trabajos';
		} else {
			alert(request.response.message);
		}
	}

	request.send(formData);
}