function verificar_dominio(){
var caso = 0; // esCualquierDominio
var _hostname = document.location.hostname;

if(_hostname !== '') {
if(_hostname.search(/local.tusmetros.com/i) > -1) {  // esDominioDesarrolloLocal
caso = 4;
} else if(_hostname.search(/calidad.tusmetros.com/i) > -1) {  // esDominioCalidad
caso = 5;
} else if(_hostname.search(/desarrollo.tusmetros.com/i) > -1) {  // esDominioGrupoDesarrollo
caso = 6;
} else if(_hostname.search(/tusmetros.com/i) > -1) {  // esDominioTusMetros
caso = 2;
} else if(_hostname.search(/software-inmobiliario.com/i) > -1) { // esDominioSoftwareInmobiliario
caso = 1;
} else if(_hostname.search(/inmuebles.com/i) > -1) { // esDominioInmuebles
caso = 3;
}
}

return caso;
}


function plugin_hostname(){
var nombre = 'www.tusmetros.com';
var dominio = verificar_dominio();

if (dominio) {
nombre = location.hostname;
}

if(location.hostname.search(/local.tusmetros/i) > -1){
nombre = 'www.local.tusmetros.com:9080';
}

return nombre;
}


function plugin_si_modulo_inmueble(){
var modulo = false;

// Verificar los dominios propios para ver si ejecutan facebook o mercado inmobiliario
if(verificar_dominio() >= 1){
// Analizar parte del url para determinar si el modulo ejecutado es inmuebles
var url = document.location.href.split(".com");
var url_parte = url[1];

if( url_parte.search(/inmuebles/i) > -1){
modulo = true;

if( url_parte.search(/facebook/i) > -1) modulo = false;
}
}

return modulo;
}


function cargar_login_si(hostname) {
var dx=new Date();
var n=dx.getTime();
jQuery.getScript('http://'+hostname+'/site/comunes/login_si.js?t='+n,function(){
try {
jQuery.login_si('iniciar', { 'num' : ''});
} catch(err) {
alert(err);
}
});
}

var _plugin_hostname = plugin_hostname();


jQuery.getScript('http://'+_plugin_hostname+'/site/js/history/jquery.history.js');

//if(!jQuery.ui){
jQuery.getScript('http://'+_plugin_hostname+'/site/js/jqueryui/jquery-ui.min.js');
//}

/**
*  http://www.sofware-inmobiliario.com
*  original by: Julio Herrera
* jQuery.Timer
*/

jQuery.fn.extend({
everyTime: function(interval, label, fn, times, belay) {
return this.each(function() {
jQuery.timer.add(this, interval, label, fn, times, belay);
});
},
oneTime: function(interval, label, fn) {
return this.each(function() {
jQuery.timer.add(this, interval, label, fn, 1);
});
},
stopTime: function(label, fn) {
return this.each(function() {
jQuery.timer.remove(this, label, fn);
});
}
});

jQuery.extend({
timer: {
guid: 1,
global: {},
regex: /^([0-9]+)\s*(.*s)?$/,
powers: {
// Yeah this is major overkill...
'ms': 1,
'cs': 10,
'ds': 100,
's': 1000,
'das': 10000,
'hs': 100000,
'ks': 1000000
},
timeParse: function(value) {
if (value == undefined || value == null)
return null;
var result = this.regex.exec(jQuery.trim(value.toString()));
if (result[2]) {
var num = parseInt(result[1], 10);
var mult = this.powers[result[2]] || 1;
return num * mult;
} else {
return value;
}
},
add: function(element, interval, label, fn, times, belay) {
var counter = 0;

if (jQuery.isFunction(label)) {
if (!times)
times = fn;
fn = label;
label = interval;
}

interval = jQuery.timer.timeParse(interval);

if (typeof interval != 'number' || isNaN(interval) || interval <= 0)
return;

if (times && times.constructor != Number) {
belay = !!times;
times = 0;
}

times = times || 0;
belay = belay || false;

if (!element.$timers)
element.$timers = {};

if (!element.$timers[label])
element.$timers[label] = {};

fn.$timerID = fn.$timerID || this.guid++;

var handler = function() {
if (belay && this.inProgress)
return;
this.inProgress = true;
if ((++counter > times && times !== 0)
|| fn.call(element, counter) === false)
jQuery.timer.remove(element, label, fn);
this.inProgress = false;
};

handler.$timerID = fn.$timerID;

if (!element.$timers[label][fn.$timerID])
element.$timers[label][fn.$timerID] = window.setInterval(handler, interval);

if ( !this.global[label] )
this.global[label] = [];
this.global[label].push( element );
},
remove: function(element, label, fn) {
var timers = element.$timers, ret;

if ( timers ) {

if (!label) {
for ( label in timers )
this.remove(element, label, fn);
} else if ( timers[label] ) {
if ( fn ) {
if ( fn.$timerID ) {
    window.clearInterval(timers[label][fn.$timerID]);
    delete timers[label][fn.$timerID];
}
} else {
for ( var fn in timers[label] ) {
    window.clearInterval(timers[label][fn]);
    delete timers[label][fn];
}
}

for ( ret in timers[label] ) break;
if ( !ret ) {
ret = null;
delete timers[label];
}
}

for ( ret in timers ) break;
if ( !ret )
element.$timers = null;
}
}
}
});

/*if (jQuery.browser.msie)
jQuery(window).one("unload", function() {
var global = jQuery.timer.global;
for ( var label in global ) {
var els = global[label], i = els.length;
while ( --i )
jQuery.timer.remove(els[i], label);
}
});*/



/**
*	http://www.sofware-inmobiliario.com
*	original by: Julio Herrera
*	marquesinaInmuebles
*/


(function($){
var obj;
var metodos =
{
iniciar: function(opciones)
{
return this.each(function(){
obj = jQuery(this);

// Definir valores por defecto en la configuración de la marquesina
var idDominio = verificar_dominio();

var dominio_name = plugin_hostname();
var modulo = plugin_si_modulo_inmueble();

var defaults = {
id: 1
,num:idDominio
,dominio:dominio_name
,id_dominio:idDominio
,ancho:636
,tipo_buscador:3
,url_inmuebles:'http://'+dominio_name+'/site/inmuebles/'
,modulo_inmueble:modulo
,pagina_mostrada:1
,inmuebles_por_pagina:25
,inmuebles_por_bloque:3
,texto:'valor inicial'
,evenColor: '#ccc'
,oddColor: '#eee'
};

var o = jQuery.extend( defaults, opciones );

var datos = obj.data('marquesina');

var request = metodos.traer_request();

if ( ! datos ) {
jQuery.data(obj,'marquesina', {
opciones: o
,primera_ejecucion: plugin_si_modulo_inmueble()
,tipo_oferta: request.tipo_oferta
,tipo_inmueble: request.tipo_inmueble
,pais: request.pais
,estado: request.estado
,ciudad: request.ciudad
,id_inmueble: request.id_inmueble
,municipio: request.municipio
,zona: request.zona
,urbanizacion: request.urbanizacion
,uso: request.uso
,precio: request.precio
,pprecio: request.pprecio
,area: request.area
,parea: request.parea
,habitaciones: request.habitaciones
,banos: request.banos
,estacionamientos: request.estacionamientos
,ordenamiento: request.ordenamiento
,visualizacion: request.visualizacion
,visualizacion_previa: request.visualizacion
,id_empresa: ''
,dominio_inmueble: ''
,tipo_inmueble_d: ''
,pais_d: ''
,ciudad_d: ''
,marquesina_timer: null
,marquesina_timer_on: 0
,marquesina_contador: 0
,buscador_seccion: request.buscador_seccion
,estatus_inmuebles: ''
,nivel_filtro_actual: 0
});
}

jQuery.ajax({
url:o.url_inmuebles+'inmuebles_buscador_layout.php'
+'?d='+metodos.urlencode(o.num)
+'&t='+o.tipo_buscador
+'&w='+o.ancho
+'&sec='+request.buscador_seccion
+'&callback=?'
,cache:false
,async:false
,dataType:"jsonp"
,success:function(buscador){
var d = jQuery.data(obj,"marquesina");
var o = d.opciones;

if(metodos.vacio(buscador.layout)) return;

/* Cargar el layout solo si es un dominio de afiliado
o si es propio pero se carga desde otro modulo distinto al de
inmuebles
*/
if(o.id_dominio === 0 || !o.modulo_inmueble ){
jQuery(obj).html(buscador.layout);
}

d.visualizacion = buscador.visualizacion;
if(d.visualizacion == 2) {
d.opciones.inmuebles_por_bloque = 6;
d.opciones.inmuebles_por_pagina = 30;
}

d.tipo_inmueble_d = buscador.tipo_inmueble_d;
d.pais_d = buscador.pais_d;
d.ciudad_d = buscador.ciudad_d;

jQuery.data(obj,"marquesina", d);

// Cargar el plugin de login/publicar inmuebles si esta habilitado el
// botón de publicar inmuebles en la tabla dominio
if( buscador.publicar_inmuebles ) cargar_login_si(o.dominio);

// Agregar el listado de inmuebles y la forma de captura de los filtros
if(buscador.tipo_buscador > 2){
jQuery.ajax({
url:o.url_inmuebles+'inmuebles_forma_login.php?d='+metodos.urlencode(o.num)+'&callback=?'
,cache:false
,async:true
,dataType:"jsonp"
,success:function(loguear_home) {
    try {
            if (loguear_home !== null && typeof(loguear_home) == 'object') {
                    jQuery('.inm-login', obj).html(loguear_home.layout);
                    jQuery('.inm-login', obj).attr('display','block');

                    jQuery('.inm-login input[name=var_mail]', obj)
                    .removeAttr('onclick')
                    .on('click',{objeto: obj},function(event){
                            metodos.limpiar_error_login(event.data.objeto,'txt_error_email');
                    });

                    jQuery('.inm-login input[name=var_password]', obj)
                    .removeAttr('onclick')
                    .on('click',{objeto: obj},function(event){
                            metodos.limpiar_error_login(event.data.objeto,'txt_error_pass');
                    });

                    jQuery('.inm-login form[name=forma_login]', obj)
                    .removeAttr('onsubmit')
                    .removeAttr('action')
                    .on('submit',{objeto: obj},function(event){
                            var _plugin_obj = event.data.objeto;
                            var d = jQuery.data(_plugin_obj, "marquesina");
                            var o = d.opciones;

                            exito = metodos.validar_forma_login(obj, 'forma_login');
                            if(exito){
                                    jQuery.ajax({
                                    url:o.url_inmuebles+'inmuebles_forma_login.php'
                                            +'?d='+metodos.urlencode(o.num)+'&callback=?'
                                    ,cache:false
                                    ,async:false
                                    ,dataType:"jsonp"
                                    ,type: "POST"
                                    ,data: jQuery('#forma_login', _plugin_obj).serialize()
                                    ,context:_plugin_obj
                                    ,success:function(loguear_home){
                                            if(o.id_dominio > 0 && o.id_dominio < 4)
                                            {
                                                    window.location.reload();
                                            }

                                            jQuery('.inm-login').html(loguear_home.layout);
                                    }
                                    ,error:function(){alert('FALLO AJAX');}
                                    });
                            }

                            return false;
                    });

                    jQuery('#enlace-mis-favoritos, #enlace-mis-publicaciones, #enlace-regresar-busqueda-inmuebles, #enlace-administracion', obj)
                    .on('click',{objeto: obj},function(event){
                            var obj = event.data.objeto;

                            var d = jQuery.data(obj, 'marquesina');
                            var o = d.opciones;

                            if(this.id == 'enlace-mis-favoritos')
                                    d.buscador_seccion = "misfav";
                            else if(this.id == 'enlace-mis-publicaciones')
                                    d.buscador_seccion = "mispub";
                            else if(this.id == 'enlace-administracion')
                                    d.buscador_seccion = "admin";
                            else
                                    d.buscador_seccion = "mibusq";

                            if(d.buscador_seccion != 'mibusq')
                            {
                                    d.visualizacion_previa = d.visualizacion;
                                    d.visualizacion = '1';

                                    event.data.nivel_destino = -1;
                                    metodos.regresar_filtros(event);
                            }
                            else
                            {
                                    d.visualizacion = d.visualizacion_previa;
                            }

                            d.opciones.inmuebles_por_bloque = 3;
                            d.opciones.inmuebles_por_pagina = 25;
                            if(d.visualizacion == 2) {
                                    d.opciones.inmuebles_por_bloque = 6;
                                    d.opciones.inmuebles_por_pagina = 30;
                            }

                            jQuery.ajax({
                            url:o.url_inmuebles+'inmuebles_select_estatus.php'
                                    +'?sec='+metodos.urlencode(d.buscador_seccion)
                                    +'&callback=?'
                            ,cache:false
                            ,async:true
                            ,dataType:"jsonp"
                            ,success:function(container_visualizacion){
                                    jQuery('.inm-formas .inm-visualizacion')
                                    .html(container_visualizacion.data);
                            }
                            });

                            jQuery.data(obj,"marquesina", d);

                            metodos.click_quitar_filtros(obj);
                    });

                    jQuery('.eliminar-favorito',obj)
                    .on('click',{objeto: obj},function(event){
                            var obj = event.data.objeto;

                            var d = jQuery.data(obj, "marquesina");
                            var o = d.opciones;

                            var id_inmueble = jQuery(this).attr('i');

                            jQuery.ajax({
                            url:o.url_inmuebles
                                    +'inmuebles_eliminar_favorito.php?'
                                    +'i='+id_inmueble+'&callback=?'
                            ,cache:false
                            ,async:true
                            ,dataType:"jsonp"
                            ,success:function(favorito){
                                    if(favorito.eliminado)
                                            jQuery('#inm-detalle-listado-'+id_inmueble, obj)
                                            .hide(1000).remove();
                            }
                            });
                    });

                    jQuery('.renovar-publicacion',obj)
                    .on('click',{objeto: obj},function(event){
                            var obj = event.data.objeto;

                            var d = jQuery.data(obj, "marquesina");
                            var o = d.opciones;

                            var div_actual = jQuery(this);
                            var id_inmueble = div_actual.attr('i');

                            jQuery.ajax({
                                    url:o.url_inmuebles+'inmuebles_renovar_publicacion.php?callback=?'
                                    ,data:'i='+id_inmueble
                                    ,type:'POST'
                                    ,cache:false
                                    ,async:true
                                    ,dataType:'jsonp'
                                    ,success:function(inmueble){
                                            if(inmueble.modificado){
                                                    div_actual.hide(1000).remove();

                                                    var enlace_desactivar = '<span ></span>';

                                                    if(d.buscador_seccion == 'admin'){
                                                            var enlace_desactivar = '<span class="col-last etiqueta-6 enlace3 desactivar-publicacion" '
                                                                    +' i="'+id_inmueble+'" '
                                                                    +' ei="1"'
                                                                    +' >Desactivar por Inv&aacute;lido</span>';
                                                    }

                                                    jQuery('#estatus-inmueble-'+id_inmueble, obj)
                                                    .css('color','Green').html('ACTIVADO')
                                                    .closest('.tm-row')
                                                    .next()
                                                    .append(enlace_desactivar);

                                                    jQuery('#inm-detalle-listado-'+id_inmueble+ ' .eliminar-publicacion', obj)
                                                    .attr('ei','1');
                                            }
                                    }
                                    ,error:function(xhr, ajaxOptions, thrownError){
                                            jsonValue = 'Alert';
                                    }
                            });
                    });


                    jQuery('.eliminar-publicacion',obj)
                    .on('click',{objeto: obj},function(event){
                            var obj = event.data.objeto;

                            var d = jQuery.data(obj, "marquesina");
                            var o = d.opciones;

                            var div_actual = jQuery(this);
                            var id_inmueble = div_actual.attr('i');
                            var estatus_inmueble = div_actual.attr('ei');
                            var estatus_noactivado = div_actual.attr('ina');

                            if( d.buscador_seccion == 'mispub'
                                    || (d.buscador_seccion == 'admin' && estatus_inmueble == 0) ) {
                                    jQuery.ajax({
                                            url: o.url_inmuebles+'inmuebles_eliminar_publicacion.php?callback=?'
                                            ,data:'i='+id_inmueble+'&ei='+estatus_inmueble+'&sec='+d.buscador_seccion
                                            ,type:'POST'
                                            ,cache:false
                                            ,async:true
                                            ,dataType:"jsonp"
                                            ,success:function(inmueble){
                                                    if(inmueble.eliminado){
                                                            var inm_detalle_listado = '#inm-detalle-listado-'+id_inmueble;
                                                            var inm_estatus_inmueble = '#estatus-inmueble-'+id_inmueble;

                                                            if(estatus_inmueble != '1'){
                                                                    jQuery(inm_detalle_listado, obj).hide(1000).remove();

                                                                    if(estatus_noactivado == '0'){
                                                                            metodos.mostrar_inmuebles_lista(obj);
                                                                    }
                                                            } else {
                                                                    div_actual.attr('ei','2');

                                                                    jQuery(inm_estatus_inmueble, obj)
                                                                            .css('color','Black').html('VENCIDO');

                                                                    jQuery(inm_estatus_inmueble, obj)
                                                                            .after('<div class="col-last boton_gris renovar-publicacion" '
                                                                            +' i="'+id_inmueble+'" '
                                                                            +' style="margin:0px 5% 0 0;">&nbsp;&nbsp;RENOVAR &raquo;&nbsp;&nbsp;</div>')
                                                                    ;
                                                            }
                                                    }
                                            }
                                    });
                            } else if (d.buscador_seccion == 'admin') {
                                    metodos.abrir_dialogo_seguimiento_publicacion(obj, jQuery(this));
                            }
                    });


                    jQuery('.desactivar-publicacion, .info-seguimiento, .historial-seguimiento',obj)
                            .on('click',{objeto: obj},function(event){
                                    metodos.abrir_dialogo_seguimiento_publicacion(obj, jQuery(this));
                            });


                    jQuery('.asignar-urbanizacion',obj)
                    .on('click',{objeto: obj},function(event){
                            var obj = event.data.objeto;

                            var d = jQuery.data(obj, "marquesina");
                            var o = d.opciones;

                            var div_actual = jQuery(this);
                            var id_inmueble = div_actual.attr('i');

                            jQuery.ajax({
                            url:o.url_inmuebles+'inmuebles_forma_nueva_urbanizacion.php?'
                                    +'i='+id_inmueble+'&callback=?'
                            ,cache:false
                            ,async:true
                            ,dataType:"jsonp"
                            ,success:function(forma_nueva_urbanizacion){
                                    jQuery('#forma-asignar-urbanizacion')
                                    .data('div_actual', div_actual)
                                    .html(forma_nueva_urbanizacion.html)
                                    .dialog("open");
                            }
                            });
                    });

                    jQuery('.activar-publicacion',obj)
                    .on('click',{objeto: obj},function(event){
                            //var obj = event.data.objeto;

                            var d = jQuery.data(obj, "marquesina");
                            var o = d.opciones;

                            var div_actual = jQuery(this);
                            var id_inmueble = div_actual.attr('i');

                            jQuery.ajax({
                            url:o.url_inmuebles+'inmuebles_activar_publicacion.php?'
                                    +'i='+id_inmueble
                                    +'&callback=?'
                            ,cache:false
                            ,async:true
                            ,dataType:"jsonp"
                            ,success:function(publicacion){
                                    if(publicacion.activada){
                                            var inm_detalle_listado = '#inm-detalle-listado-'+id_inmueble;
                                            jQuery('#estatus-inmueble-'+id_inmueble, obj)
                                            .css('color','Green').html('ACTIVADO');

                                            jQuery(inm_detalle_listado+' .eliminar-publicacion', obj)
                                            .attr('ei','1');

                                            jQuery(inm_detalle_listado+' .info-seguimiento, '
                                                            +inm_detalle_listado+' .desactivar-publicacion ')
                                            .remove();

                                            div_actual.replaceWith('<span class="col-last etiqueta-6 enlace3 desactivar-publicacion" '
                                                    +' i="'+id_inmueble+'" '
                                                    +' ei="1"'
                                                    +' >Desactivar por Inv&aacute;lido</span>');
                                    }
                            }
                            });
                    });

                    jQuery('.filtrar-por-usuario',obj)
                    .on('click',{objeto: obj},function(event){
                            //var obj = event.data.objeto;

                            var d = jQuery.data(obj, "marquesina");
                            var o = d.opciones;

                            var div_actual = jQuery(this);

                            d.id_empresa = div_actual.attr('u');

                            $("form select[name='estatus']").val('');

                            d.estatus_inmuebles = ''; // Mostrar todos

                            jQuery.data(obj,"marquesina", d);

                            metodos.mostrar_inmuebles_lista(obj);
                    });

                    jQuery("#img-falsa-consulta-nombre").on('load',{ objeto: obj }, function () {
                            var obj = event.data.objeto;

                            var d = jQuery.data(obj, "marquesina");
                            var o = d.opciones;

                            jQuery('#consulta-nombre').autocomplete({
                                    source:o.url_inmuebles+'inmuebles_buscar_nombres_contactos.php'
                                    ,minLength: 3
                                    ,select: function( event, ui ) {
                                            alert( "Selected: " + ui.item.value + " aka " + ui.item.id );
                                    }
                            });
                    });

            }
    }
    catch(err) { }
}
});	/* Fin del ajax que invoca la forma del login */
}


if(buscador.tipo_buscador > 1){
metodos.mostrar_inmuebles_lista(obj);

var request_historial = metodos.crear_request(obj,null,'historial');

jQuery.ajax({
url:o.url_inmuebles+"inmuebles_forma_filtros.php?callback=?&"+request_historial
,cache:false
,async:true
,dataType:"jsonp"
,success:function(forma_filtros){
    try{
            if (forma_filtros !== null && typeof(forma_filtros) == 'object') {
                    jQuery('.inm-filtros', obj).html(forma_filtros.layout);
                    jQuery('.inm-filtros', obj).attr('display','block');

                    jQuery('.inm-btn-mostrar-inmueble', obj)
                    .on('click',{objeto: obj},function(event){
                            var obj = event.data.objeto;

                            var id_inmueble = jQuery('#id_inmueble', obj).attr('value');

                            if(metodos.vacio(id_inmueble)) return;

                            metodos.mostrar_inmuebles_detalle(obj, id_inmueble);
                     })


                    jQuery('.enlace1, .enlace3', obj)
                    .on('mouseover',{objeto: obj}, function(event) {
                            if(jQuery(this).hasClass('seleccionado')) return;

                            jQuery(this).css('text-decoration','none');
                    })
                    .on('mouseout',{objeto: obj},function(event){
                            if(jQuery(this).hasClass('seleccionado')) return;

                            jQuery(this).css('text-decoration','underline');
                     });
                    jQuery('.enlace1', obj)
                    .on('click',{objeto: obj},function(event){
                            var enlace = jQuery(this);
                            var obj = event.data.objeto;

                            jQuery('.enlace1.seleccionado',obj)
                            .removeClass('seleccionado')
                            .css('text-decoration','underline');

                            enlace.addClass('seleccionado');

                            metodos.click_ordenamiento(obj, enlace);
                    });

                    jQuery('.inm-visualizacion div[name=visualizacion]', obj)
                    .on('click',{objeto: obj},function(event){
                            var obj = event.data.objeto;

                            var d = jQuery.data(obj, "marquesina");

                            d.visualizacion = 1;
                            d.opciones.inmuebles_por_bloque = 3;
                            d.opciones.inmuebles_por_pagina = 25;
                            if(jQuery(this).hasClass('inm-icono-galeria')) {
                                    d.visualizacion = 2;
                                    d.opciones.inmuebles_por_bloque = 6;
                                    d.opciones.inmuebles_por_pagina = 30;
                            }

                            jQuery.data(obj,"marquesina", d);

                            metodos.mostrar_inmuebles_lista(obj);
                    });

                    jQuery('.inm-btn-quitar-filtros, .inm-quitar-filtros', obj)
                    .on('click',{objeto: obj},function(event){
                            metodos.click_quitar_filtros(event.data.objeto);
                    });

                    jQuery('.inm-btn-buscar-filtros', obj)
                    .on('click',{objeto: obj},function(event){
                            metodos.mostrar_inmuebles_lista(event.data.objeto);
                    });

                    jQuery('.caja-cod-inmueble input[id=id_inmueble]', obj)
                    .on('change',{objeto: obj},function(event){
                            jQuery('.inm-btn-mostrar-inmueble', obj).click();
                    });

                    jQuery('form[name=forma-filtros] input, form[name=forma-filtros] select, form[name=forma-estatus] select', obj)
                    .on('change',{objeto: obj},function(event){
                            var obj = event.data.objeto;

                            var d = jQuery.data(obj,"marquesina");

                            var campo = jQuery(this).attr('name');
                            var valor = jQuery(this).attr('value');

                            var mostrar_listado = true;

                            switch (campo) {
                                    case 'ubicacion':
                                            if(valor && valor != 'Mostrar todos' && valor != '-'
                                                    && valor != 'Zona' && valor != 'Municipio') {
                                                    d.urbanizacion = valor;
                                                    metodos.click_quitar_filtros(obj, 'select-ubicacion');
                                                    mostrar_listado = false;
                                            } else {
                                                    if(valor == 'Mostrar todos' || valor == 'Municipio' || valor == 'Zona') {
                                                            d.urbanizacion = '';
                                                            tipo_lista = valor;
                                                            if(valor == 'Mostrar todos') tipo_lista = 'Zona';
                                                            metodos.habilitar_lista_urbanizaciones(obj, tipo_lista);
                                                    }

                                                    if(valor != 'Mostrar todos')  mostrar_listado = false;
                                            }

                                            break
                                    case 'precio':
                                            d.precio = valor;
                                            break
                                    case 'uso':
                                            d.uso = valor;
                                            break
                                    case 'pprecio':
                                            d.pprecio = valor;
                                            break
                                    case 'area':
                                            d.area = valor;
                                            break
                                    case 'parea':
                                            d.parea = valor;
                                            break
                                    case 'habitaciones':
                                            d.habitaciones = valor;
                                            break
                                    case 'banos':
                                            d.banos = valor;
                                            break
                                    case 'estacionamientos':
                                            d.estacionamientos = valor;
                                            break
                                    case 'visualizacion':
                                            d.visualizacion = valor;
                                            break
                                    case 'estatus':
                                            d.estatus_inmuebles = valor;

                                            if(d.buscador_seccion == 'admin') // forzar el quitado de filtros
                                                    campo = 'estatusx';
                                            break
                            }

                            d.opciones.pagina_mostrada = 1;

                            jQuery.data(obj,"marquesina", d);

                            if( campo == 'estatusx' ){
                                    metodos.click_quitar_filtros(obj, 'select-estatus');
                            } else {
                                    if(mostrar_listado) metodos.mostrar_inmuebles_lista(obj);
                            }
                    });
            }
    }
    catch(err) { }
}
});
}

jQuery.ajax({
url:o.url_inmuebles+"inmuebles_buscador_marquesina.php?d="+metodos.urlencode(o.num)+'&callback=?'
,cache:false
,async:false
,dataType:"jsonp"
,success:function(marquesina){
var evento = new Object();
evento.data = new Object();
evento.data.objeto = obj;

jQuery('.inm-marquesina', obj).html(marquesina.data);

jQuery('.filtro-detalle', obj)
.on('mouseout',function(){ jQuery(this).toggleClass( 'navegacion' ); })
.on('mouseover',function(){ jQuery(this).toggleClass( 'navegacion' ); })
.on('click',{ objeto: obj },metodos.iniciar_filtro);

jQuery('.filtro-regresar', obj)
.on('click',{ objeto: obj },metodos.regresar_filtro);

jQuery('.filtro-navegacion', obj)
.on('click',{ objeto: obj },metodos.regresar_filtros);

jQuery('.detalle-inmueble')
.on('click',{ objeto: obj },metodos.detalle_inmueble);

jQuery('.celda-detalle, ul.pagination span', obj)
.on('mouseout',function(){ jQuery(this).toggleClass( 'navegacion' ); })
.on('mouseover',function(){ jQuery(this).toggleClass( 'navegacion' ); });

jQuery('#boton-publicar-inmuebles', obj)
.on('mouseout',function(){
    jQuery(this).css('background-position','-0px -0px');
})
.on('mouseover',function(){
    jQuery(this).css('background-position','-0px -21px');
});

jQuery('#paginador'+o.id+' span', obj)
.on('click',{objeto: obj, paginador_id: o.id},function(event){
    window.scrollTo(0,0);
    metodos.click_selector_pagina(this, event.data.objeto);
    jQuery('#paginador'+event.data.paginador_id+' span', event.data.objeto).toggleClass( 'navegacion' );
});

//jQuery('.enlace-ver-mas-grupo', obj)
jQuery('.enlace-ver-mas-grupo')
.on('click', {objeto: obj}, function(event){
    window.scrollTo(0,0);

    var obj = event.data.objeto;

    var d = jQuery.data(obj,"marquesina");

    var enlace = jQuery(this);

    d.tipo_oferta = enlace.attr('to');
    d.tipo_inmueble = enlace.attr('ti');
    d.pais = enlace.attr('p');
    d.estado = enlace.attr('e');
    d.ciudad = enlace.attr('c');

    metodos.iniciar_filtros(event, d, 'ver-mas-grupo');
});


jQuery('.pagina, .enlace-mas-publicaciones', obj)
.on('click',{objeto: obj},function(event){
    var obj = event.data.objeto;

    metodos.click_selector_pagina(this, obj);
});


// Si se ha especificado algun filtro a través del request
if(!request.esta_vacio) {
    metodos.iniciar_filtros(evento, request);
} else {
    metodos.iniciar_marquesina(obj);
}
}
});
}
});
});

var History = window.History;

History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
var State = History.getState(); // Note: We are using History.getState() instead of event.state
History.log(State.data, State.title, State.url);
});

}
,iniciar_buscador:function(obj)
{
var i=0;
}
,iniciar_marquesina: function(obj)
{
var d = jQuery.data(obj,"marquesina");

if(d.marquesina_timer_on == 0) // Entonces ENCENDER
{
metodos.marquesina_automatica(obj);
}
else
{
clearTimeout(d.marquesina_timer);
}

d = jQuery.data(obj,"marquesina");

d.marquesina_timer_on = !d.marquesina_timer_on;

jQuery.data(obj,"marquesina", d);
}
,marquesina_automatica: function(obj)
{
var d = jQuery.data(obj,"marquesina");

var paso = "-=163px";

if(d.marquesina_contador == 5)
{
paso = "0px";
d.marquesina_contador = 0;
}

if(d.marquesina_timer != null)
{
jQuery( ".bloque-inmueble:first", obj ).animate({
left: paso
}, {
duration: 1000,
step: function( now, fx ){
jQuery( ".bloque-inmueble:gt(0)", obj ).css( "left", now );
}
});
}

d.marquesina_contador += 1;

obj.oneTime('6s', "marquesina_automatica", function() {
metodos.marquesina_automatica(obj);
d.marquesina_timer = 1;
});

jQuery.data(obj,"marquesina",d);
}
,pausar_marquesina: function(evento)
{
var obj = evento.data.objeto;

metodos.iniciar_marquesina(obj);
}
,ir_izquierda_marquesina: function(evento)
{
var obj = evento.data.objeto;

var d = jQuery.data(obj,"marquesina");

if(d.marquesa_contador < 5)
{
jQuery( ".bloque-inmueble:first", obj ).animate({
left: "-=163px"
}, {
duration: 1500,
step: function( now, fx ){
jQuery( ".bloque-inmueble:gt(0)", obj ).css( "left", now );
}
});

d.marquesina_contador += 1;

jQuery.data(obj,"marquesina", d);
}
}
,ir_derecha_marquesina: function(evento)
{
var obj = evento.data.objeto;

var d = jQuery.data(obj,"marquesina");

if(d.marquesina_contador > 1)
{
jQuery( ".bloque-inmueble:first", obj ).animate({
left: "+=163px"
}, {
duration: 1500,
step: function( now, fx ){
jQuery( ".bloque-inmueble:gt(0)", obj ).css( "left", now );
}
});

d.marquesina_contador -= 1;

jQuery.data(obj,"marquesina", d);
}
}
,guardar_filtro: function(obj, nivel, filtro)
{
var d = jQuery.data(obj,"marquesina");

if(!filtro) filtro = '';

switch (nivel*1) {
case 1:
d.tipo_oferta = filtro;
if(filtro !='')
break;
case 2:
d.tipo_inmueble = filtro;
if(filtro !='')
break;
case 3:
d.pais = filtro;
if(filtro !='')
break;
case 4:
d.estado = filtro;
if(filtro !='')
break;
case 5:
d.ciudad = filtro;
if(filtro !='')
break;
default:
break;
}

jQuery.data(obj,"marquesina", d);
}
,traer_filtro: function (obj, nivel)
{
var d = jQuery.data(obj,"marquesina");

var valor = '';

switch (nivel*1) {
case 1:
valor = d.tipo_oferta;
break;
case 2:
valor = d.tipo_inmueble;
break;
case 3:
valor = d.pais;
break;
case 4:
valor = d.estado;
break;
case 5:
valor = d.ciudad;
break;
default:
break;
}

return valor;
}
,crear_request: function (obj, nivel, historial)
{
var url_inicio = ''
, url_medio = ''
, url_final = '';

var makeSortString = (function() {
var translate_re = /[ñéáűőúöüóíÑÉÁŰŐÚÖÜÓÍ/-_ ]/g;
var translate = { "ñ": "n", "é": "e", "á": "a", "ű": "u", "ő": "o", "ú": "u", "ö": "o", "ü": "u", "ó": "o", "í": "i", "Ñ": "N", "É": "E", "Á": "A", "Ű": "U", "Ő": "O", "Ú": "U", "Ö": "O", "Ü": "U", "Ó": "O", "Í": "I" , "/": "" , "-": "" , "_": "" , " ": "" };
return function(s) {
return ( s.replace(translate_re, function(match) {
return translate[match];
}) );
}
})();

var d = jQuery.data(obj,"marquesina");
var o = d.opciones;

var request = '';

var request_busqueda = true;

if(historial) request_busqueda = false;

if(!nivel)
{
var nivel = 5;

if(metodos.vacio(d.ciudad)) nivel = 4;
if(metodos.vacio(d.estado)) nivel = 3;
if(metodos.vacio(d.pais)) nivel = 2;
if(metodos.vacio(d.tipo_inmueble)) nivel = 1;
}

switch (nivel*1) {
case 5:
if(!metodos.vacio(d.urbanizacion))
if(request_busqueda)
    request = "&u="+metodos.urlencode(d.urbanizacion);
else
    request = "&u="+d.urbanizacion;
if(!metodos.vacio(d.ciudad))
if(request_busqueda)
    request = "&c="+metodos.urlencode(d.ciudad)+request;
else {
    request = "&c="+d.ciudad+request;
    url_final = '-en-'+d.ciudad.toLowerCase();
}

case 4:
if(!metodos.vacio(d.estado))
if(request_busqueda)
    request = "&e="+metodos.urlencode(d.estado)+request;
else
    request = "&e="+d.estado+request;

case 3:
if(!metodos.vacio(d.pais)){
if(request_busqueda)
    request = "&p="+metodos.urlencode(d.pais)+request;//metodos.urlencode(d.pais)+request;
else
    request = "&p="+d.pais+request;
}

case 2:
if(!metodos.vacio(d.tipo_inmueble)){
if(request_busqueda)
    request = "&ti="+metodos.urlencode(d.tipo_inmueble)+request;//metodos.urlencode(d.tipo_inmueble)+request;
else if(o.id_dominio === 0)
    request = "&ti="+d.tipo_inmueble+request;
else
    url_inicio = d.tipo_inmueble.toLowerCase();
}

case 1:
default:
if(!metodos.vacio(d.tipo_oferta)){
if(request_busqueda)
    request = "&to="+metodos.urlencode(d.tipo_oferta)+request;
else if(o.id_dominio === 0)
    request = "&to="+d.tipo_oferta+request;
else
    url_medio = '-en-'+d.tipo_oferta.toLowerCase();
}

if(request_busqueda)
request = "&d="+metodos.urlencode(d.opciones.num)+request;

break;
}

request = request.substring(1);

if(!request_busqueda){ // Si es un historial
if(o.id_dominio === 0){ // Si el dominio es un afilido o cliente
request = '?' + request;
} else { // Si es un dominios propio
var url = url_inicio + url_medio + url_final;
url = makeSortString(url);

request = '/inmuebles/' + url + '/?' + request;
}
}

var amp = (metodos.vacio(request))			 ? '' : '&';
request = (metodos.vacio(d.uso))				? request : request + amp + 'us=' + metodos.urlencode(d.uso);
amp = (metodos.vacio(request))				  ? '' : '&';
request = (metodos.vacio(d.precio))			? request : request + amp + 'pr=' + d.precio;
amp = (metodos.vacio(request))				  ? '' : '&';
request = (metodos.vacio(d.area))			  ? request : request + amp + 'a=' + d.area;
amp = (metodos.vacio(request))				  ? '' : '&';
request = (metodos.vacio(d.habitaciones))	? request : request + amp + 'h=' + d.habitaciones;
amp = (metodos.vacio(request))				  ? '' : '&';
request = (metodos.vacio(d.banos))			 ? request : request + amp + 'b=' + d.banos;
amp = (metodos.vacio(request))				  ? '' : '&';
request = (metodos.vacio(d.estacionamientos)) ? request : request + amp + 'est=' + d.estacionamientos;
amp = (metodos.vacio(request))				  ? '' : '&';
request = (metodos.vacio(d.id_empresa))	  ? request : request + amp + 'ie=' + d.id_empresa;

// Agregar si es un request de busqueda y no para el historial del borwser
if(request_busqueda)
{
amp = (metodos.vacio(request))				  ? '' : '&';
request = (metodos.vacio(d.tipo_inmueble_d)) ? request : request + amp + 'ti_d=' + metodos.urlencode(d.tipo_inmueble_d);
amp = (metodos.vacio(request))				  ? '' : '&';
request = (metodos.vacio(d.pais_d))			 ? request : request + amp + 'p_d=' + metodos.urlencode(d.pais_d);
amp = (metodos.vacio(request))				  ? '' : '&';
request = (metodos.vacio(d.ciudad_d))		  ? request : request + amp + 'c_d=' + metodos.urlencode(d.ciudad_d);

amp = (metodos.vacio(request))				  ? '' : '&';
request = (metodos.vacio(d.estatus_inmuebles) && d.estatus_inmuebles != '0') ? request : request + amp + 'ei=' + d.estatus_inmuebles;

amp = (metodos.vacio(request))				  ? '' : '&';
request = (metodos.vacio(d.dominio_inmueble)) ? request : request + amp + 'di=' +  metodos.urlencode(d.dominio_inmueble);

amp = (metodos.vacio(request))				  ? '' : '&';
request = (metodos.vacio(d.pprecio))		  ? request : request + amp + 'prpr=' + d.pprecio;
amp = (metodos.vacio(request))				  ? '' : '&';
request = (metodos.vacio(d.parea))			 ? request : request + amp + 'pra=' + d.parea;

amp = (metodos.vacio(request))				  ? '' : '&';
request = (metodos.vacio(d.visualizacion))  ? request : request + amp + 'v=' + d.visualizacion;
amp = (metodos.vacio(request))				  ? '' : '&';
request = (metodos.vacio(d.ordenamiento))	? request : request + amp + 'o=' + d.ordenamiento;

amp = (metodos.vacio(request))				  ? '' : '&';
request = request + amp + 't=' + d.opciones.tipo_buscador;
}

return request;
}
,iniciar_filtro: function(evento, nivel, filtro, automatico)
{
// Elemento padre o contexto
var obj = evento.data.objeto;

var d = jQuery.data(obj,"marquesina");
var o = d.opciones;
var total = 0;

if(!nivel)
{
var detalle = jQuery(this);

var nivel = detalle.attr('n') * 1;
var filtro = detalle.attr('f');
var id_inmueble = detalle.attr('i');
total = detalle.attr('t') * 1;
}

metodos.guardar_filtro(obj, nivel, filtro);

if(nivel==5 || (total>=1 && total<=d.opciones.inmuebles_por_pagina && !automatico))
{
if(total == 1)
{
metodos.mostrar_inmuebles_detalle(obj, id_inmueble);
}
else
{
if(!automatico || automatico == 'ver-mas-grupo')
metodos.click_quitar_filtros(obj, automatico);

if(nivel==5) metodos.habilitar_lista_urbanizaciones(obj);
}

return; // Salir del metodo y no continuar con la marquesina
}

jQuery('.inm-filtros select[name=ubicacion]',obj).attr("disabled","disabled");

metodos.mostrar_filtro(obj, nivel);

if(nivel==1)
{
jQuery( "#inmuebles-destacados", obj ).hide(1000);
jQuery( "#inmuebles-filtros", obj ).show(1000);
}

if(nivel==2) {
var etiqueta_habitaciones = false;

switch(filtro){
case 'Apartamento':
case 'Casa':
case 'Town House':
jQuery('#etiqueta-dependiente-tipo-inmueble-1', obj).show();
jQuery('#etiqueta-dependiente-tipo-inmueble-2', obj).hide();
etiqueta_habitaciones = true;
case 'Oficina':
case 'Local Comercial':
if(!etiqueta_habitaciones) {
    jQuery('#etiqueta-dependiente-tipo-inmueble-1', obj).hide();
    jQuery('#etiqueta-dependiente-tipo-inmueble-2', obj).show();
}

jQuery('#lista-dependiente-tipo-inmueble-1', obj).show();
jQuery('#lista-dependiente-tipo-inmueble-2', obj).hide();
break;
case 'Terreno':
case 'Galpón':
case 'Edificio':
case 'Urbanismo':
case 'Centro Comercial':
jQuery('#lista-dependiente-tipo-inmueble-1', obj).hide();
jQuery('#lista-dependiente-tipo-inmueble-2', obj).show();
break;
}
}

jQuery( ".bloque-buscador:first", obj )
.animate({ left: "-=326px" }
,{
duration: 1000,
step: function( now, fx ){
jQuery( ".bloque-buscador:gt(0)", obj ).css( "left", now );
}
});

d = jQuery.data(obj,"marquesina");

obj.stopTime("marquesina_automatica");

d.marquesina_timer = null;

jQuery.data(obj,"marquesina", d);
}
,iniciar_filtros: function(evento, filtros, origen_evento)
{
if(!origen_evento) origen_evento = 'auto';

obj = evento.data.objeto;

if(filtros.tipo_oferta != "")
{
metodos.iniciar_filtro(evento, 1, filtros.tipo_oferta, origen_evento);

if(filtros.pais != "")
{
metodos.iniciar_filtro(evento, 2, filtros.tipo_inmueble, origen_evento);
if(filtros.estado != "")
{
metodos.iniciar_filtro(evento, 3, filtros.pais, origen_evento);

if(filtros.ciudad != "")
{
    metodos.iniciar_filtro(evento, 4, filtros.estado, origen_evento);

    metodos.iniciar_filtro(evento, 5, filtros.ciudad, origen_evento);
}
else
{
    if(filtros.estado != "")
            metodos.guardar_filtro(obj, 4, filtros.estado);
}
}
else
{
if(filtros.pais != "")
    metodos.guardar_filtro(obj, 3, filtros.pais);
}
}
else
{
if(filtros.tipo_inmueble != "")
metodos.guardar_filtro(obj, 2, filtros.tipo_inmueble);
}
}
}
,mostrar_filtro: function(obj, nivel)
{
function span_tag(nivel, texto) {
return '<span class="filtro-navegacion" n="'+nivel+'">'+texto+'</span>';
}

var d = jQuery.data(obj,"marquesina");

var navegacion = '';
var union= '';

if(nivel > 3 && !metodos.vacio(d.estado))		  { navegacion = span_tag('4', d.estado) ; union = ' > '; }
if(nivel > 2 && !metodos.vacio(d.pais))			 { navegacion = span_tag('3', d.pais)  + union + navegacion; union = ' > '; }
if(nivel > 1 && !metodos.vacio(d.tipo_inmueble)) { navegacion = span_tag('2', d.tipo_inmueble) + union + navegacion; union = ' > '; }
navegacion = span_tag('0', 'Inicio') + ' > ' + span_tag('1', d.tipo_oferta) + union + navegacion;

jQuery('#celda-navegacion-'+nivel, obj).html(navegacion);

metodos.buscar_filtro(obj, nivel);
}
,buscar_filtro: function(obj, nivel)
{
var d = jQuery.data(obj,"marquesina");
var o = d.opciones;

var request = metodos.crear_request(obj, nivel);

jQuery.ajax({
url:o.url_inmuebles+"inmuebles_buscador_total_publicaciones.php?"+request
,cache:false
,async:false
,dataType:"jsonp"
,success:function(marquesina){
jQuery('#nivel-filtro-'+nivel, obj).html(marquesina.filtros);

d.nivel_filtro_actual = nivel;

jQuery.data(obj,"marquesina", d);
}
});
}
,regresar_filtro: function(evento)
{
// Elemento padre o contexto
var obj = evento.data.objeto;

var d = jQuery.data(obj,"marquesina");

if(!evento.data.nivel){
var detalle = jQuery(this);

var nivel = detalle.attr('n') * 1;
}
else
{
var nivel = evento.data.nivel;
}

if(nivel==4){
jQuery('.inm-filtros select[name=ubicacion]',obj).attr('disabled','disabled');
}

metodos.guardar_filtro(obj, nivel);

jQuery( ".bloque-buscador:first", obj ).animate({
left: "+=326px"
}, {
duration: 500,
step: function( now, fx ){
jQuery( ".bloque-buscador:gt(0)", obj ).css( "left", now );
}
});

d.nivel_filtro_actual = nivel - 1;

if(nivel==1)
{
d.marquesina_timer_on = 0;

jQuery.data(obj,"marquesina", d);

metodos.iniciar_marquesina( obj );

jQuery( "#inmuebles-destacados", obj ).show();
jQuery( '#inmuebles-filtros', obj).hide(1000);

return;
}

jQuery.data(obj,"marquesina", d);
}
,regresar_filtros: function(evento)
{
var obj = evento.data.objeto;

var d = jQuery.data(obj,"marquesina");

var nivel_actual = d.nivel_filtro_actual;

if(!evento.data.nivel_destino)
{
var filtro_navegacion = jQuery(this);

var nivel_destino = filtro_navegacion.attr('n') * 1;

} else if(evento.data.nivel_destino < 0) {
//if(nivel_actual > 0)
var nivel_destino = 0;
//else
//	var nivel_destion = 1;

} else {
var nivel_destino = evento.data.nivel_destino;
}


for ( nivel_en_curso=nivel_actual; nivel_destino < nivel_en_curso; nivel_en_curso-- ) {
evento.data.nivel = nivel_en_curso;

metodos.regresar_filtro(evento);
}
}
,detalle_inmueble: function(evento)
{
var obj = evento.data.objeto;

var detalle = jQuery(this);

var id_inmueble = detalle.attr('i') * 1;
var id_empresa = detalle.attr('u') * 1;

metodos.mostrar_inmuebles_detalle(obj, id_inmueble, id_empresa);
}
,mostrar_inmuebles_detalle: function(obj, id_inmueble, id_empresa)
{
var d = jQuery.data(obj,"marquesina");

if(id_empresa)
URL = 'http://'+d.opciones.dominio+'/site/i_detalle_inmueble.php?id_inmueble='+id_inmueble+'&num='+metodos.urlencode(d.opciones.num)+'&mostrar_favorito=1&id_usuario='+id_empresa+'&mispub=1'+'&sec='+d.buscador_seccion;
else if(d.buscador_seccion == 'admin')
URL = 'http://'+d.opciones.dominio+'/site/i_detalle_inmueble.php?id_inmueble='+id_inmueble+'&num='+metodos.urlencode(d.opciones.num)+'&mostrar_favorito=1&id_usuario=0&mispub=1'+'&sec='+d.buscador_seccion;
else
URL = 'http://'+d.opciones.dominio+'/site/i_detalle_inmueble.php?id_inmueble='+id_inmueble+'&num='+metodos.urlencode(d.opciones.num)+'&mostrar_favorito=1&id_usuario=0&mispub=undefined'+'&sec='+d.buscador_seccion;

ventana = window.open(URL, "ventana", "width=700,height=500,dependent=yes,top=20px,left=20px,screenX=0,screenY=0,titlebar=no,directories=no,menubars=no,status=no,scrollbars=yes,resizable=no");
if (ventana.opener == null) ventana.opener = self;
ventana.focus();
}
,mostrar_inmuebles_lista: function(obj)
{
var d = jQuery.data(obj, "marquesina");

var o = d.opciones;

if(o.tipo_buscador > 1)
{
metodos.buscar_inmuebles_listado(obj);
}
else
{
URL = jQuery('#url_resultado', obj).attr('href')+'?'+metodos.crear_request(obj);
window.open(URL,'_self');
}
}
,buscar_inmuebles_listado: function(obj, tipo_enlace)
{
var d = jQuery.data(obj,"marquesina");
var o = d.opciones;

var primer_vez = d.primera_ejecucion;

// Si el dominio es nuestro y es la primera ejecución, no se prosigue la ejecucion
if(o.id_dominio && d.primera_ejecucion ){
d.primera_ejecucion = false;

jQuery.data(obj,"marquesina", d);

return;
}

jQuery('#id_textos_varios', obj).hide();

if(tipo_enlace == 'maspub')
{
jQuery('#mas_publicaciones_img_ajax_loader', obj).show();
}
else
{
jQuery('#inm-listado', obj)
.html('<img src="http://'+o.dominio+'/images/ajax-loader.gif" border="0" style="margin-left:40%;" />');
}

var request = metodos.crear_request(obj)
+"&pagina="+o.pagina_mostrada
+"&el_p="+o.inmuebles_por_pagina
+"&el_b="+o.inmuebles_por_bloque
+"&w="+o.ancho
+"&sec="+d.buscador_seccion;

if(!tipo_enlace) tipo_enlace = '';

var url_inmuebles_listado = o.url_inmuebles+"inmuebles_listado.php"
                                              +'?'+request+'&callback=?';

jQuery.getJSON(url_inmuebles_listado
,function(listado)
{
try
{
if (listado !== null && typeof(listado) == 'object')
{
if(listado.total_muestras >= 0)
{
    if(tipo_enlace == 'maspub')
    {
            jQuery('#inm-mas-publicaciones', obj).replaceWith(listado.data);
    }
    else
    {
            jQuery('#inm-listado', obj).html(listado.data);
    }

    jQuery('#id_textos_varios', obj).show();

    var d = jQuery.data(obj,"marquesina");

    var request_historial = metodos.crear_request(obj,null,'historial');

    if( d.buscador_seccion == 'mibusq' )
    {
            var titulo = document.title;
            History.pushState(null, null, request_historial);
            //History.pushState(null, null, '?'+request);
            document.title = titulo;
    }

    total_muestras = listado.total_muestras;
}
}
}
catch(err)
{
total_elementos = 0;
}
});

}
,habilitar_lista_urbanizaciones: function(obj, tipo_agrupamiento)
{
var d = jQuery.data(obj,"marquesina");

var o = d.opciones;

var request = metodos.crear_request(obj);

if(!tipo_agrupamiento) tipo_agrupamiento = 'Zona';
tipo_agrupamiento = '&ta='+tipo_agrupamiento;

jQuery.ajax({
url:o.url_inmuebles+"inmuebles_urbanizaciones.php?"+request+tipo_agrupamiento
,cache:false
,async:true
,dataType:"jsonp"
,success:function(urbanizaciones){
jQuery('.inm-filtros div[id=ubicacion]',obj).html(urbanizaciones.data);

jQuery('.inm-filtros select[name=ubicacion]',obj).removeAttr("disabled");
}
});
}
,click_quitar_filtros: function(obj, origen_evento)
{
var d = jQuery.data(obj,"marquesina");

d.precio = '';
d.pprecio = '';
d.area = '';
d.parea = '';
d.habitaciones = '';
d.banos = '';
d.estacionamientos = '';
d.uso = '';
d.opciones.pagina_mostrada = 1;
d.id_empresa = '';

jQuery('.inm-filtros input, .inm-filtros select[name!=ubicacion]', obj).val('');
jQuery('.inm-filtros input[name=pprecio], .inm-filtros input[name=parea]', obj).val('10');
jQuery('.inm-filtros select[name=uso]', obj).val('Mostrar todos');

if(origen_evento != 'select-ubicacion')
{
d.urbanizacion = '';

jQuery('.inm-filtros select[name=ubicacion]', obj).val('Mostrar todos');
}

if(origen_evento != 'select-estatus') {
d.estatus_inmuebles = '';

//jQuery('.inm-filtros select[name=estatus]', obj).val('Mostrar todos');
jQuery('.inm-formas .inm-visualizacion select', obj).val('');
}

History.pushState(null, null, '');

jQuery.data(obj, "marquesina", d);

metodos.mostrar_inmuebles_lista(obj);
}
,click_ordenamiento: function(obj, enlace)
{
var d = jQuery.data(obj,"marquesina");

var campo = enlace.attr('name');

var valor = 1;

switch (campo) {
case 'orden_masreciente':  valor = 1;  break
case 'orden_porubicacion': valor = 3;  break
case 'orden_porprecio':	 valor = 5;  break
case 'orden_porarea':		valor = 7;  break
}

//valor = valor + parseInt(orden);

d.ordenamiento = valor;

jQuery.data(obj,"marquesina", d);

metodos.mostrar_inmuebles_lista(obj);
}
,click_selector_pagina: function(elemento, obj)
{
var partes_id = elemento.id.split('-');
var tipo_enlace = partes_id[0];

var consecutivo = partes_id[1];
var pagina = partes_id[2];

var d = jQuery.data(obj, "marquesina");

var o = d.opciones;

if(o.pagina_mostrada == pagina) return;

d.opciones.pagina_mostrada = pagina;

jQuery.data(obj, "marquesina", d);

metodos.buscar_inmuebles_listado(obj, tipo_enlace);

if(tipo_enlace == 'pag' || tipo_enlace == 'pre' )  window.scrollTo(0,0);
}
,buscar_contacto:function(parametros)
{
var d = jQuery.data(obj, "marquesina");

d.id_empresa = parametros.id;

jQuery.data(obj,"marquesina", d);

metodos.mostrar_inmuebles_lista(obj);
}
,buscar_dominio:function(parametros)
{
var d = jQuery.data(obj, "marquesina");

d.dominio_inmueble = parametros.id;

jQuery.data(obj,"marquesina", d);

metodos.mostrar_inmuebles_lista(obj);
}
,ignorarTeclaEnter: function(evt)
{
var evt = (evt) ? evt : ((event) ? event : null);
var node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null);
if ((evt.keyCode == 13) && (node.type=="text"))  {return false;}
}
,abrir_dialogo_seguimiento_publicacion:function(objeto, contenedor)
{
var d = jQuery.data(objeto, "marquesina");
var o = d.opciones;

var div_actual = contenedor;
var id_inmueble = div_actual.attr('i');
var estatus_inmueble = div_actual.attr('ei');
var request = 'i='+id_inmueble
+'&ei='+estatus_inmueble
+'&sec='+d.buscador_seccion;

if(contenedor.hasClass('desactivar-publicacion'))
request = request + '&s=1' + '&accion=desactivar';
else if(contenedor.hasClass('eliminar-publicacion'))
request = request + '&accion=eliminar';

jQuery.ajax({
url:o.url_inmuebles
+'inmuebles_forma_seguimiento_publicacion.php?'
+request+'&callback=?'
,cache:false
,async:true
,dataType:"jsonp"
,success:function(seguimiento){
if(seguimiento.dialogo_contenido){
jQuery('#forma-seguimiento-publicacion')
    .data('div_actual', div_actual)
    .html(seguimiento.dialogo_contenido)
    .dialog( 'option' , 'title', 'Seguimiento al inmueble con C&oacute;d. ' + id_inmueble)
    .dialog( 'open' );
}
}
});
}
,vacio: function(mixed_var)
{
var key;

if (mixed_var === '' || mixed_var === 0 || mixed_var === '0' || mixed_var === null || mixed_var === false || typeof mixed_var === 'undefined') {
return true;
}

if (typeof mixed_var == 'object') {
for (key in mixed_var) {
return false;
}
return true;
}

return false;
}
,urlencode: function(str)
{
str = (str + '').toString();

// Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
// PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').
replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
}
,urldecode: function (str)
{
return decodeURIComponent((str + '').replace(/\+/g, '%20'));
}
,utf8_decode: function (str_data)
{
var tmp_arr = [],
i = 0,
ac = 0,
c1 = 0,
c2 = 0,
c3 = 0;

str_data += '';

while (i < str_data.length) {
c1 = str_data.charCodeAt(i);
if (c1 < 128) {
tmp_arr[ac++] = String.fromCharCode(c1);
i++;
} else if (c1 > 191 && c1 < 224) {
c2 = str_data.charCodeAt(i + 1);
tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
i += 2;
} else {
c2 = str_data.charCodeAt(i + 1);
c3 = str_data.charCodeAt(i + 2);
tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
i += 3;
}
}

return tmp_arr.join('');
}
,limpiar_error_login:function(obj, id)
{
jQuery('#'+id, obj).css('display','none');
jQuery('#'+id, obj).html('');

if(id=='txt_error_email')
{
jQuery('#txt_registrese_aqui',obj).html('Reg&iacute;strese Aqu&iacute;');
}
else if(id=='txt_error_pass')
{
jQuery('#txt_recuperar_contrasena',obj).html('Recuperar Contrase&ntilde;a');
}
}
,validar_forma_login:function(obj, laforma)
{
var d = jQuery.data(obj, "marquesina");

var o = d.opciones;

var exito = true;

_dialogo_login_si_opened = jQuery('#dialogo-si', jQuery(document.body)).dialog('isOpen');

if( _dialogo_login_si_opened ){ //txt_error_form:nth-child(2)') ) { // si es el dialogo de login
var v_txt_error_form = jQuery('#txt_error_form').eq(2);
var v_txt_error_email = jQuery('#txt_error_email').eq(2);
var v_txt_error_pass =  jQuery('#txt_error_pass').eq(2);
var v_txt_registrese_aqui =  jQuery('#txt_error_pass').eq(2);
var v_txt_recuperar_contrasena =  jQuery('#txt_error_pass').eq(2);
} else { // si es la pagina principal de login
var v_txt_error_form = jQuery('#txt_error_form').first();
var v_txt_error_email = jQuery('#txt_error_email').first();
var v_txt_error_pass =  jQuery('#txt_error_pass').first();
var v_txt_registrese_aqui =  jQuery('#txt_registrese_aqui').first();
var v_txt_recuperar_contrasena =  jQuery('#txt_recuperar_contrasena').first();
}

v_txt_error_form.html('');
v_txt_error_email.html('');
v_txt_error_pass.html('');

jQuery('#'+laforma+' input').each(function() {
var child = jQuery(this);

if(child.attr('name') != 'pag_pagina' || child.attr('name'))
{
if(child.val() == '')
{
exito = false;
child.focus();
return false;
}
else if(child.val().indexOf ("'", 0) != -1 || child.val().indexOf ('"', 0) != -1)
{
exito = false;
v_txt_error_form.html("Elimine las comillas");
v_txt_error_form.css("display","block");
child.focus();
return false;
}
}
});

_var_mail = jQuery('#'+laforma+' input[name="var_mail"]');
_var_password = jQuery('#'+laforma+' input[name="var_password"]');

if (exito && _var_mail.val().length < 1)
{
v_txt_error_email.html("Ingrese Correo");
v_txt_error_email.css("display","block");
_var_mail.focus();
exito = false;
}
else if (exito && _var_mail.val().indexOf('@', 0) == -1)
{
v_txt_error_email.html("Correo no v&aacute;lido");
v_txt_error_email.css("display","block");
_var_mail.focus();
exito = false;
}
else if (exito && _var_password.val().length < 1)
{
v_txt_error_pass.html("Ingrese Contrase&ntilde;a");
v_txt_error_pass.css("display","block");
_var_password.focus();
exito = false;
} else if(exito) {
jQuery.ajax({
url: 'http://'+o.dominio+'/includes/validar_existencia_usuario.php?callback=?'
,cache:false
,async:false
,type: "POST"
,dataType:"jsonp"
,data: jQuery('#'+laforma).serialize()
,success:function(login, status){
try{
if (login !== null && typeof(login) == 'object'){
    if(login.error > 0){
            exito = false;

            if(login.error == 1) {
                    div_error = v_txt_error_email;
                    enlace_sugerencia = v_txt_registrese_aqui;
                    mensaje_enlace = 'Reg&iacute;strese Aqu&iacute;';
                    _var_mail.focus();
            } else if(login.error == 2) {
                    div_error = v_txt_error_pass;
                    enlace_sugerencia = v_txt_recuperar_contrasena;
                    mensaje_enlace = 'Recuperar Contrase&ntilde;a';
                    _var_password.focus();
            }

            mensaje_enlace = '<span style="text-decoration:underline;font-weight:bold;">'
                                + mensaje_enlace
                                + '</span>';

            div_error.html(login.mensaje);
            div_error.css('display','block');

            enlace_sugerencia.html(mensaje_enlace);
    }
}
}catch(err){
exito = false;

div_error = v_txt_error_email;

div_error.html("No se puede validar usuario.");
div_error.css("display","block");
}
}
,error:function(data, status, xhr){
exito = false;

div_error = v_txt_error_email;

div_error.html("No se puede validar usuario.");
div_error.css("display","block");
}
});
}

return exito;
}
,traer_request: function()
{
var request =
{
esta_vacio: true
,tipo_oferta: ''
,tipo_inmueble: ''
,pais: ''
,estado: ''
,ciudad: ''
,id_inmueble:''
,municipio:''
,zona:''
,urbanizacion:''
,uso:''
,precio:0
,area:0
,habitaciones:0
,banos:0
,estacionamientos:0
,ordenamiento:1
,buscador_seccion:'mibusq'
};

var url = document.location.href.split("?");

// Analizar parte del url
var url_parte = url[0].split('/');
if(url_parte[3] === 'inmuebles'){
if(!metodos.vacio(url_parte[4])){
url_inmueble_info = url_parte[4].split('-');

if(!metodos.vacio(url_inmueble_info[0])){
request.esta_vacio = false;
request.tipo_inmueble = url_inmueble_info[0];
if(!metodos.vacio(url_inmueble_info[2])){
    request.tipo_oferta = url_inmueble_info[2];
}
}
}
}

// Analizar el request
if(!metodos.vacio(url[1]))
{
var search = url[1].split("#");

var valor;
var x = search[0].split("&");
for (var i=0; i<x.length; i++)
{
var y = x[i].split("=");
valor = metodos.urldecode(y[1]);
switch(y[0])
{
case 'to':
    request.tipo_oferta = valor;
    if(request.esta_vacio && valor != "")
            request.esta_vacio = false;
    break;
case 'ti':
    request.tipo_inmueble = valor;
    if(request.esta_vacio && valor != "")
            request.esta_vacio = false;
    break;
case 'p':
    request.pais = valor;
    if(request.esta_vacio && valor != "")
            request.esta_vacio = false;
    break;
case 'e':
    request.estado = valor;
    if(request.esta_vacio && valor != "")
            request.esta_vacio = false;
    break;
case 'c':
    request.ciudad = valor;
    if(request.esta_vacio && valor != "")
            request.esta_vacio = false;
    break;
case 'i':
    request.id_inmueble = valor;
    if(request.esta_vacio && valor != "")
            request.esta_vacio = false;
    break;
case 'm':
    request.municipio = valor;
    if(request.esta_vacio && valor != "")
            request.esta_vacio = false;
    break;
case 'z':
    request.zona = valor;
    if(request.esta_vacio && valor != "")
            request.esta_vacio = false;
    break;
case 'u':
    request.urbanizacion = valor;
    if(request.esta_vacio && valor != "")
            request.esta_vacio = false;
    break;
case 'us':
    request.uso = valor;
    if(request.esta_vacio && valor != "")
            request.esta_vacio = false;
    break;
case 'pr':
    request.precio = valor;
    if(request.esta_vacio && valor != "")
            request.esta_vacio = false;
    break;
case 'ppr':
    request.pprecio = valor;
    if(request.esta_vacio && valor != "")
            request.esta_vacio = false;
    break;
case 'a':
    request.area = valor;
    if(request.esta_vacio && valor != "")
            request.esta_vacio = false;
    break;
case 'pa':
    request.parea = valor;
    if(request.esta_vacio && valor != "")
            request.esta_vacio = false;
    break;
case 'h':
    request.habitaciones = valor;
    if(request.esta_vacio && valor != "")
            request.esta_vacio = false;
    break;
case 'b':
    request.banos = valor;
    if(request.esta_vacio && valor != "")
            request.esta_vacio = false;
    break;
case 'est':
    request.estacionamientos = valor;
    if(request.esta_vacio && valor != "")
            request.esta_vacio = false;
    break;
case 'v':
    request.visualizacion = valor;
    if(request.esta_vacio && valor != "")
            request.esta_vacio = false;
    break;
case 'o':
    request.ordenamiento = valor;
    if(request.esta_vacio && valor != "")
            request.esta_vacio = false;
    break;
case 'sec':
    request.buscador_seccion = valor;
    if(request.esta_vacio && valor != "")
            request.esta_vacio = false;
    break;
default:
    break;
}
}
}

return request;
}
}


jQuery.fn.marquesinaInmuebles = function( metodo ) {
// Method calling logic
if ( metodos[metodo] )
{
return metodos[ metodo ].apply( this, Array.prototype.slice.call( arguments, 1 ));
}
else if ( typeof metodo === 'object' || ! metodo )
{
return metodos.init.apply( this, arguments );
}
else
{
jQuery.error( 'Method ' +  metodo + ' does not exist on jQuery.tooltip' );
}
}
})(jQuery);

