window.$ = window.jQuery = require('jquery');
var DOMBuilder = require('dom-builder');

var request = new XMLHttpRequest();
request.open('GET', '/api/trabajos');

request.onload = function (revt) {
	if (request.status == 200) {
		var trabajos = JSON.parse(request.response);

		for (var i = 0; i < trabajos.length; i++) {
			var trabajoBuilder = new DOMBuilder()
				.ele('tr', {'trabajo-id': trabajos[i]._id})
					.ele('td').ele('a', {href: '/admin/trabajos/'+trabajos[i]._id, title: 'Ver'}, trabajos[i].title).cl()
					.ele('td', trabajos[i].institution)
					.ele('td', trabajos[i].date)
					.ele('td', {class: 'button-column'})
						.ele('a', {href: '/admin/trabajos/'+trabajos[i]._id, class: 'view', title: 'Ver'})
							.ele('img', {src: '/assets/img/view.png'})
						.cl()
						.ele('a', {href: '/admin/trabajos/'+trabajos[i]._id+'/editar', class: 'update', title: 'Editar'})
							.ele('img', {src: '/assets/img/update.png'})
						.cl()
						.ele('a', {href: '#', class: 'delete', title: 'Eliminar'})
							.ele('img', {src: '/assets/img/delete.png'})
						.cl()
					.cl()
				.cl();

			var trabajosWrapper = document.getElementById('trabajos-wrapper');
			trabajosWrapper.insertAdjacentHTML('beforeend', trabajoBuilder.body);
		}

		$('.grid-view table.items tbody tr:nth-child(odd)').addClass('odd');
		$('.grid-view table.items tbody tr:nth-child(even)').addClass('even');

		$('table.items tbody tr').click(function(){
			if ($(this).hasClass('selected')) {
				$(this).removeClass('selected');
			}else{
				$(this).siblings('tr').removeClass('selected');
				$(this).addClass('selected');
			}
		});
	} else {
		alert(request.response.message);
	}
}

request.send(new FormData());

/*
$('table.items thead tr.head-sort th a').click(function(){
	if ($(this).hasClass('desc')) {
		$(this).removeClass('desc');
		$(this).addClass('asc');
	}else if ($(this).hasClass('asc')) {
		$(this).removeClass('asc');
		$(this).addClass('desc');
	}else{
		$(this).parent().parent().find('th a').removeClass('sort-link asc desc');
		$(this).addClass('sort-link asc');
	}
});

$('table.items thead tr.head-sort th a').click(function(){
	var crit = '';
	if ($(this).hasClass('asc')) crit = 'asc';
	else crit = 'desc';

	var data_obj = {
		"field": $(this).attr('id'),
		"crit": crit
	};
	$.ajax({
		type		: "post",
		url 		: "<?php echo base_url('admin/getTrabajosOrderBy') ?>",
		data		: data_obj,
		success		: successSort
	});
	function successSort(resp){
		var data = JSON.parse(resp);
		var trabajos = data.trabajos;
		for (var i = 0; i < trabajos.length; i++) {
			var tr = $('table.items tbody tr:nth-child('+(i+1)+')');
			tr.find('td:nth-child(1) a')
				.attr("href", "<?php echo base_url('admin/trabajos') ?>"+"/"+trabajos[i].id)
				.html(trabajos[i].title);
			tr.children('td:nth-child(2)')
				.html(trabajos[i].institution);
			tr.children('td:nth-child(3)')
				.html(trabajos[i].date);
			tr.find('td:nth-child(4) a')
				.attr('categoria-id', trabajos[i].id);
			tr.find('td:nth-child(4) a:nth-child(1)')
				.attr("href", "<?php echo base_url('admin/trabajos') ?>"+"/"+trabajos[i].id);
			tr.find('td:nth-child(4) a:nth-child(2)')
				.attr("href", "<?php echo base_url('admin/editarTrabajo') ?>"+"/"+trabajos[i].id);
		}
		$('table.items tbody tr.hide').removeClass('hide');
	}
});

$('table.items thead tr.filters input.filter').keypress(function (e){
	if (e.which!=13) return;
	var this_input = $(this);
	var data_obj = {};
	data_obj[this_input.attr('name')] = this_input.val();
	$.ajax({
		type		: "post",
		url 		: "<?php echo base_url('admin/filtrarTrabajosPor') ?>",
		data		: data_obj,
		success		: successFiltrar
	});
	function successFiltrar(resp){
		var data = JSON.parse(resp);
		var trabajos = data.trabajos;
		for (var i = 0; i < trabajos.length; i++) {
			var tr = $('table.items tbody tr:nth-child('+(i+1)+')');
			tr.find('td:nth-child(1) a')
				.attr("href", "<?php echo base_url('admin/trabajos') ?>"+"/"+trabajos[i].id)
				.html(trabajos[i].title);
			tr.children('td:nth-child(2)')
				.html(trabajos[i].institution);
			tr.children('td:nth-child(3)')
				.html(trabajos[i].date);
			tr.find('td:nth-child(4) a')
				.attr('trabajo-id', trabajos[i].id);
			tr.find('td:nth-child(4) a:nth-child(1)')
				.attr("href", "<?php echo base_url('admin/trabajos') ?>"+"/"+trabajos[i].id);
			tr.find('td:nth-child(4) a:nth-child(2)')
				.attr("href", "<?php echo base_url('admin/editarTrabajo') ?>"+"/"+trabajos[i].id);
		}
		$('table.items tbody tr.hide').removeClass('hide');
		var num_of_trs = $('table.items tbody tr').size();
		for (var i = num_of_trs; i >= trabajos.length+1; i--) {
			$('table.items tbody tr:nth-child('+i+')').addClass('hide');
		}
		this_input.val('');
	}
});
*/

$(document).on('click', ".delete", function () {
	var tagTr = $(this).parent('td').parent('tr');

	var request = new XMLHttpRequest();
	request.open('DELETE', '/api/trabajos/' + tagTr.attr("trabajo-id"));

	request.onload = function (revt) {
		if (request.status == 200) {
			tagTr.remove();
		} else {
			alert(request.response.message);
		}
	}

	request.send(new FormData());
});