window.$ = window.jQuery = require('jquery'); 
require('bootstrap');
require('./plugin.js');
var freewall = require('freewall');
var DOMBuilder = require('dom-builder');


$(document).ready(function(){
  $.scrollIt({
    upKey: 38,
    downKey: 40,
    easing: 'linear',
    scrollTime: 600,
    activeClass: 'active',
    onPageChange: null,
    topOffset: -80,
  });

  var config = {
    easing: 'hustle',
    //reset:  true,
    delay:  'onload',
    vFactor: 0.90
  };

  window.sr = new scrollReveal(config);

  /*var _height = $(window).height();
  if(_height > 680)
    $('.section-home').height(_height);*/
  var _nav = false;
  $('.nav-collapse').click(function(e) {
    e.preventDefault();
    if(!_nav){
      $('.navbar-right').addClass('nav-open');
      $('.all-content').addClass('nav-open');
      $('.logo').addClass('nav-open');
      _nav = true;
    }else if(_nav){
      $('.navbar-right').removeClass('nav-open');
      $('.all-content').removeClass('nav-open');
      $('.logo').removeClass('nav-open');
      _nav = false;
    }
  });

  $('.nav-collap').click(function(e) {
    e.preventDefault();
    $('.navbar-right').removeClass('nav-open');
    $('.all-content').removeClass('nav-open');
    $('.logo').removeClass('nav-open');
    _nav = false;
  });
  
    //wall.fitWidth();
});


var Freewall = freewall.freewall;
var wall = new Freewall("#freewall");

var request = new XMLHttpRequest();
request.open('GET', '/api/trabajos');

request.onload = function (revt) {
  if (request.status == 200) {
    var trabajos = JSON.parse(request.response);

    for (var i = 0; i < trabajos.length; i++) {
      var trabajoFirstImage = trabajos[i].images[0];

      if (!trabajoFirstImage) continue;

      var trabajoBuilder = new DOMBuilder()
        .ele('div', {class: 'freewall-item'})
          .ele('a', {href:'#', 'data-toggle':'modal', class:'boton-modal', 'lazy-class':'lazy-'+trabajos[i]._id, 'modal-id':'#modal-'+trabajos[i]._id})
            .ele('img', {src:'/public/imagenes/'+trabajoFirstImage.thumb_filename})
          .cl()
        .cl();

      var trabajosWrapper = document.getElementById('freewall');
      trabajosWrapper.insertAdjacentHTML('beforeend', trabajoBuilder.body);

      var modalBuilder = new DOMBuilder()
        .ele('div', {class:'modal fade', id:'modal-'+trabajos[i]._id, tabindex:'-1', role:'dialog', 'aria-labelledby':'myModalLabel', 'aria-hidden':'true'})
          .ele('div', {class:'modal-dialog modal-lg'})
            .ele('div', {class:'modal-content'})
              .ele('div', {class:'modal-body'})
                .ele('div', {id:'carousel-'+trabajos[i]._id, class:'carousel slide', 'data-ride':'carousel'})
                  .ele('div', {class:'carousel-inner', role:'listbox'});

      for (var j = 0; j < trabajos[i].images.length; j++) {
        var image = trabajos[i].images[j];
        var activeClass = j == 0 ? 'active':'';

        modalBuilder
          .ele('div', {class:'item '+activeClass})
            .ele('a', {href:'/public/imagenes/'+image.filename, target:'_blank'})
              .ele('img', {class:'lazy lazy-'+trabajos[i]._id, src:'/public/imagenes/'+image.thumb_filename, 'data-original':'/public/imagenes/'+image.filename})
            .cl()
            .ele('div', {class:'carousel-caption'}, image.description)
          .cl();
      }

      modalBuilder.
                cl()
                .ele('a', {class:'left carousel-control', href:'#carousel-'+trabajos[i]._id, role:'button', 'data-slide':'prev'})
                  .ele('span', {class:'glyphicon glyphicon-chevron-left', 'aria-hidden':'true'}).cl()
                  .ele('span', {class:'sr-only'}, 'Previous')
                .cl()
                .ele('a', {class:'right carousel-control', href:'#carousel-'+trabajos[i]._id, role:'button', 'data-slide':'next'})
                  .ele('span', {class:'glyphicon glyphicon-chevron-right', 'aria-hidden':'true'}).cl()
                  .ele('span', {class:'sr-only'}, 'Next')
                .cl()
              .cl()
            .cl()
            .ele('div', {class:'modal-footer', style:'display:none'})
              .ele('b', trabajos[i].title).ele('br')
              .val(trabajos[i].institution + '-' + trabajos[i].date)
            .cl()
          .cl()
        .cl()
      .cl();

      var modalsWrapper = document.getElementById('modals');
      modalsWrapper.insertAdjacentHTML('beforeend', modalBuilder.body);


      wall.reset({
        selector: '.freewall-item',
        animate: true,
        cellW: 250,
        cellH: 'auto',
        gutterX: 3,
        gutterY: 3,
        onResize: function() {
          wall.fitWidth();
        }
      });

      wall.container.find('.freewall-item img').load(function() {
        wall.fitWidth();
      });

      $(".boton-modal").click(function(){
          var lazy_class = $(this).attr('lazy-class');
          
          $("img."+lazy_class).each(function (index){
              var src = $(this).attr('data-original');
              $(this).attr('src', src);
              console.log(src);
          });
          
          var modal = $(this).attr('modal-id');
          $(modal).modal('show');
      });

      wall.fitWidth();
    }
  } else {
    alert(request.response.message);
  }
}

request.send(new FormData());







