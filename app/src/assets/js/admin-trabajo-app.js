window.$ = window.jQuery = require('jquery');
var DOMBuilder = require('dom-builder');

var trabajoId = window.location.pathname.split('/')[3];

var request = new XMLHttpRequest();
request.open('GET', '/api/trabajos/'+trabajoId);

request.onload = function (revt) {
	if (request.status == 200) {
		var trabajo = JSON.parse(request.response);

		var trabajoBuilder = new DOMBuilder()
			.ele('div', {class:'post'})
				.ele('div', {class:'title'}, trabajo.title)
				.ele('div', {class:'author'})
					.ele('b', 'Institucion: ').val(trabajo.institution)
					.ele('b', ' Fecha: ').val(trabajo.date)
				.cl()
			.cl();

		for (var i=0; i < trabajo.images.length; i++) {
			var trabajoImage = trabajo.images[i];

			trabajoBuilder
				.ele('div', {class:'comment'})
					.ele('div', {class:'author'}, trabajoImage.description)
					.ele('div', {class:'content', style:'text-align:center'})
						.ele('img', {src:'/public/imagenes/'+trabajoImage.filename, style:'height:300px'})
					.cl()
				.cl();
		}

		var wrapper = document.getElementById('trabajo');
		wrapper.insertAdjacentHTML('beforeend', trabajoBuilder.body);

	} else {
		alert(request.response.message);
	}
}

request.send(new FormData());


var opcionesBuilder = new DOMBuilder()
	.ele('li').ele('a', {href:'/admin/trabajos'}, 'Volder').cl()
	.ele('li').ele('a', {href:'/admin/trabajos/'+trabajoId+'/editar'}, 'Editar').cl()
	.ele('li').ele('a', {href:'#', class:'delete'}, 'Eliminar').cl();

var wrapper = document.getElementById('opciones');
wrapper.insertAdjacentHTML('beforeend', opcionesBuilder.body);


$(document).on('click', ".delete", function () {
	var request = new XMLHttpRequest();
	request.open('DELETE', '/api/trabajos/' + trabajoId);

	request.onload = function (revt) {
		if (request.status == 200) {
			window.location = '/admin/trabajos';
		} else {
			alert(request.response.message);
		}
	}

	request.send(new FormData());
});