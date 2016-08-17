window.$ = window.jQuery = require('jquery');
var DOMBuilder = require('dom-builder');

var trabajoId = window.location.pathname.split('/')[3];

var request = new XMLHttpRequest();
request.open('GET', '/api/trabajos/'+trabajoId);

request.onload = function (revt) {
	if (request.status == 200) {
		var trabajo = JSON.parse(request.response);

		var trabajoBuilder = new DOMBuilder()
			.ele('tr')
				.ele('td').ele('label', 'Titulo').cl()
				.ele('td').ele('input', {name:'title', size:'40', required:true, value: trabajo.title}).cl()
			.cl()
			.ele('tr')
				.ele('td').ele('label', 'Institucion').cl()
				.ele('td').ele('input', {name:'institution', size:'40', value: trabajo.institution}).cl()
			.cl()
			.ele('tr')
				.ele('td').ele('label', 'Fecha').cl()
				.ele('td').ele('input', {name:'date', size:'40', value: trabajo.date}).cl()
			.cl()
			.ele('tr')
				.ele('td').ele('label', 'Imagenes')
				.ele('td')
					.ele('table', {class:'table-form', style:'width:520px; background-color:#F5F5F5'})
						.ele('tr', {class:'tr-border'})
							.ele('td').ele('label', 'Actuales').cl()
							.ele('td')
								.val('Click en una imagen para eliminarla:').ele('br');

		for (var i = 0; i < trabajo.images.length; i++) {
			var trabajoImage = trabajo.images[i];

			trabajoBuilder
				.ele('img', {
					class: 'imagen-a-eliminar', 
					'image-id': trabajoImage._id, 
					src: '/public/imagenes/' + trabajoImage.thumb_filename, 
					style: 'width:125px; height:75px'
				})
		}

		trabajoBuilder.cl()
					.cl()
					.ele('tr').ele('td').ele('a', {class:'agregar-mas-imagenes'}, 'Agregar').cl().cl()
				.cl()
			.cl()
		.cl();

		var wrapper = document.getElementById('trabajo-editar-table');
		wrapper.insertAdjacentHTML('afterbegin', trabajoBuilder.body);

	} else {
		alert(request.response.message);
	}
}

request.send(new FormData());

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

var imagesToRemove = [];

$(document).on('click', "img.imagen-a-eliminar", function () {
	if ($(this).hasClass('remove')){
		$(this).removeClass('remove');
		
		var imageId = $(this).attr('image-id');
		if (imagesToRemove.indexOf(imageId) != -1) {
			imagesToRemove.splice(imagesToRemove.indexOf(imageId), 1);
		}
	}else{
		$(this).addClass('remove');
		imagesToRemove.push($(this).attr('image-id'));
	}
});


var form = document.getElementById('trabajo-editar');

form.onsubmit = function (evt) {
	evt.preventDefault();

	var formData = new FormData(form);

	for (var i = 0; i < imagesToRemove.length; i++) {
		formData.append('images_remove[]', imagesToRemove[i]);
	}
	
	var request = new XMLHttpRequest();
	request.open('PUT', '/api/trabajos/' + trabajoId);

	request.onload = function (revt) {
		if (request.status == 200) {
			window.location = '/admin/trabajos/'+ trabajoId;
		} else {
			alert(request.response.message);
		}
	}


	var fileSizeError = false;

	if (formData.has('images[]')) {
		var imagesInput = formData.getAll('images[]');

		for (var i = 0; i < imagesInput.length; i++) {
			if (imagesInput[i].size > 5000000) {
				alert('La imagen ' + imagesInput[i].name + ' es muy pesada, el tamaño maximo permitido es de 5mb.');
				fileSizeError = true;
			}
		}
	}

	if (!fileSizeError) {
		request.send(formData);
	}
}