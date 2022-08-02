<?php
ini_set('max_execution_time', 600);

header ('Content-type: text/html; charset=utf-8');

include_once 'includes/db.php';
include_once 'includes/file.php';
include_once 'includes/inmueble.php';
include_once 'includes/junta_condominio.php';
include_once 'includes/propietario.php';
include_once 'includes/propiedades.php';
include_once 'includes/factura.php';

$db = new db();

$tablas = array("factura_detalle", "facturas", "propiedades", "propietarios", "junta_condominio", "inmueble", "inmueble_deuda_confidencial","movimiento_caja");

if (isset($_GET['codinm'])) {
    $codinm = $_GET['codinm'];
    $db->exec_query("delete from factura_detalle where id_factura in (select numero_factura from facturas wher id_inmueble='".$codinm."')");
    $db->exec_query("delete from facturas where id_inmueble='".$codinm."'");
    $db->exec_query("delete from propietarios where cedula in (select cedula from propiedades where id_inmueble='".$codinm."')");
    $db->exec_query("delete from junta_condominio where id_inmueble='".$codinm."'");
    $db->exec_query("delete from propiedades where id_inmueble='".$codinm."'");
    $db->exec_query("delete from inmueble where id='".$codinm."'");
    $db->exec_query("delete from inmueble_deuda_confidencial where id_inmueble='".$codinm."'");
    $db->exec_query("delete from movimiento_caja where id_inmueble='".$codinm."'");
    $mensaje = "Actualización inmueble ".$codinm."<br>";
} else {
    $mensaje = "Proceso de Actualización Ejecutado<br />";
    foreach ($tablas as $tabla) {
        $r = $db->exec_query("truncate table " . $tabla);
        if ($r["suceed"]==FALSE) {
            echo $r['stats']['error'];
        } else {
            echo "limpiar tabla: " .$tabla."<br />";
        }
        
    }
}

// <editor-fold defaultstate="collapsed" desc="Procesamos el archivo inmueble">
$archivo = ACTUALIZ . ARCHIVO_INMUEBLE;
$contenidoFichero = JFile::read($archivo);
$lineas = explode("\r\n", $contenidoFichero);
$inmueble = new inmueble();
$mensaje.= "procesar archivo inmueble (".count($lineas).")<br />";
echo $mensaje;

foreach ($lineas as $linea) {
    
    $registro = explode("\t", $linea);
    if ($registro[0] != "") {
        $registro = Array(
            "id" => $registro[0],            
            "nombre_inmueble" => $registro[1],
            "deuda" => $registro[2],
            "fondo_reserva" => $registro[3],
            "beneficiario" => $registro[4],
            "banco" => '',
            "numero_cuenta" => '',
            "supervision" => '0',
            "RIF" => $registro[5],
            "meses_mora"        => $registro[6],
            "porc_mora"         => $registro[7],
            "moneda"            => $registro[8],
            "unidad"            => $registro[9],
            "facturacion_usd"   => $registro[10],
            "tasa_cambio"       => $registro[11],
            "redondea_usd"      => $registro[12]
                );
        
        $r = $inmueble->insertar($registro);
        
        if($r["suceed"]==FALSE){
            echo ARCHIVO_INMUEBLE."<br/>".$r['stats']['error']." ".'<br/>'.$r['query'].'<br/>';
        }   
    }
}// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="procesamos el archivo cuentas">
$archivo = ACTUALIZ . ARCHIVO_CUENTAS;
$contenidoFichero = JFile::read($archivo);
$lineas = explode("\r\n", $contenidoFichero);
$inmueble = new inmueble();
$mensaje.= "actulizando cuentas inmuebles (" . count($lineas) . ")<br />";
echo "actualizando cuentas inmuebles (" . count($lineas) . ")<br />";

foreach ($lineas as $linea) {
    $id = '';
    $registro = explode("\t", $linea);
    
    if ($registro[0] != "") {
        $id=$registro[0];
        $registro = Array(
            "numero_cuenta" => $registro[1],
            "banco" => $registro[2]);


        $r = $inmueble->actualizar("'".$id."'",$registro);
        if ($r["suceed"] == FALSE) {
            //echo ARCHIVO_INMUEBLE."<br />".$r['stats']['errno']."<br />".$r['stats']['error'];
            echo $r['query'];
            die();
        }

    }
}// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="Procesamos el archivo Junta_Condominio">
$archivo = ACTUALIZ . ARCHIVO_JUNTA_CONDOMINIO;
$contenidoFichero = JFile::read($archivo);
$lineas = explode("\r\n", $contenidoFichero);
$junta_condominio = new junta_condominio();
echo "procesar archivo Junta Condominio (".count($lineas).")<br />";
$mensaje.= "procesar archivo Junta Condominio (".count($lineas).")<br />";
foreach ($lineas as $linea) {

    $registro = explode("\t", $linea);
    
    if ($registro[0] != "") {
        $registro = Array("id_cargo" => $registro[1],
            "id_inmueble" => $registro[0],
            "cedula" => $registro[2]);
        $r = $junta_condominio->insertar($registro);
        
        if($r["suceed"]==FALSE){
            echo ARCHIVO_JUNTA_CONDOMINIO."<br />".$r['stats']['errno']."<br />".$r['stats']['error'];
        }
    }
}
// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="Procesamos el archivo Propietarios">
$archivo = ACTUALIZ . ARCHIVO_PROPIETARIOS;
$contenidoFichero = JFile::read($archivo);
$lineas = explode("\r\n", $contenidoFichero);
$propietario = new propietario();
echo "procesar archivo Propietarios (".count($lineas).")<br />";
$mensaje.= "procesar archivo Propietarios (".count($lineas).")<br />";
foreach ($lineas as $linea) {

    $registro = explode("\t", $linea);

    if ($registro[0] != "") {
        
       $registro = Array(
                    'nombre' => utf8_encode($registro[0]),
                    'clave' => $registro[1],
                    'email' => $registro[2],
                    'cedula' => $registro[3],
                    'telefono1' => $registro[4],
                    'telefono2' => $registro[5],
                    'telefono3' => $registro[6],
                    'direccion' => utf8_encode($registro[7]),
                    'recibos' => $registro[8],
                    'email_alternativo' => $registro[9]
           );
       
       $r = $propietario->insertar($registro);
       
       if($r["suceed"]==FALSE){
            echo "<b>Archivo Propietario: ".$archivo.' - '.$r['stats']['errno']."-".$r['stats']['error']."</b>".'<br/>'.$r['query'].'<br/>';
            die($r['query']);
        }
            /*}
        }*/
    }
}
// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="Procesamos el archivo Propiedades">
$archivo = ACTUALIZ . ARCHIVO_PROPIEDADES;
$contenidoFichero = JFile::read($archivo);
$lineas = explode("\r\n", $contenidoFichero);
$propiedades = new propiedades();
echo "procesar archivo Propiedades (".count($lineas).")<br />";
$mensaje.= "procesar archivo Propiedades (".count($lineas).")<br />";
foreach ($lineas as $linea) {


    $registro = explode("\t", $linea);

    if ($registro[0] != "") {
        $registro = Array(
            'cedula'        => $registro[0],
            'id_inmueble'   => $registro[1],
            'apto'          => $registro[2],
            'alicuota'      => $registro[3],
            'meses_pendiente' => $registro[4],
            'deuda_total'   => $registro[5],
            'deuda_usd'     => str_replace("\r", "", $registro[6])
               );
        
        $r = $propiedades->insertar($registro);
        if($r["suceed"]==FALSE){
            echo "<b>Archivo Propiedades: ".$r['stats']['errno']."-".$r['stats']['error']."</b><br />".'<br/>'.$r['query'].'<br/>';
        }
    }
}// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="Procesamos el archivo Facturas">
$archivo = ACTUALIZ . ARCHIVO_FACTURA;
$contenidoFichero = JFile::read($archivo);
$lineas = explode("\r\n", $contenidoFichero);
$facturas = new factura();
echo "procesar archivo Facturas (".count($lineas).")<br />";
$mensaje.= "procesar archivo Facturas (".count($lineas).")<br />";
foreach ($lineas as $linea) {
    
    $registro = explode("\t", $linea);
    
    if ($registro[0] != "") {
        
        $registro = Array(
            'id_inmueble' => $registro[0],
            'apto' => $registro[1],
            'numero_factura' => $registro[2],
            'periodo' => $registro[3],
            'facturado' => $registro[4],
            'abonado' => $registro[5],
            'fecha' => $registro[6],
            'facturado_usd' => $registro[7]
                );
        
        $r = $facturas->insertar($registro);
                
        if(!$r["suceed"]){
            echo($r['stats']['errno']."-".$r['stats']['error'].'<br/>'.$r['query'].'<br/>');
        }
    }
}// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="Procesamos el archivo Detalle Factura">
$archivo = ACTUALIZ . ARCHIVO_FACTURA_DETALLE;
$contenidoFichero = JFile::read($archivo);
$lineas = explode("\r\n", $contenidoFichero);
echo "procesar archivo Detalle Factura (".count($lineas).")<br />";
$mensaje.="procesar archivo Detalle Factura (".count($lineas).")<br />";
foreach ($lineas as $linea) {

    $registro = explode("\t", $linea);


    if ($registro[0] != "") {

        $registro = Array(
            "id_factura" => $registro[0],
            "detalle" => utf8_encode($registro[1]),
            "codigo_gasto" => $registro[2],
            "comun" => $registro[3],
            "monto" => str_replace("\r","",$registro[4])
                );
        
        $r = $facturas->insertar_detalle_factura($registro);
        
        if($r["suceed"]==FALSE){
            die($r['stats']['errno']."-".$r['stats']['error'].'<br/>'.$r['query'].'<br/>');
        }
    }
}// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="Movimiento Caja">
$archivo = ACTUALIZ . ARCHIVO_MOVIMIENTO_CAJA;
$contenidoFichero = JFile::read($archivo);
$lineas = explode("\r\n", $contenidoFichero);
echo "procesar archivo movimiento caja (".count($lineas).")<br />";
$mensaje.="procesar archivo movimiento caja (".count($lineas).")<br />";
$pago = new pago();
foreach ($lineas as $linea) {

    $registro = explode("\t", $linea);

    if ($registro[0] != "") {

        $registro = Array(
            "numero_recibo" => $registro[0],
            "fecha_movimiento" => $registro[1],
            "forma_pago" => utf8_encode($registro[2]),
            "monto" => $registro[3],
            "cuenta" => utf8_encode($registro[4]),
            "descripcion" => utf8_encode($registro[5]),
            "id_inmueble" => $registro[6],
            "id_apto" => str_replace("\r","",$registro[7])
            
        );

        $r = $pago->insertarMovimientoCaja($registro);


        if ($r["suceed"] == FALSE) {
            die($r['stats']['errno'] . "<br />" . $r['stats']['error'] . '<br/>' . $r['query']);
        }
    }
}// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="Procesamos el archivo Inmueble Estado Cuenta">
    $archivo = ACTUALIZ . ARCHIVO_EDO_CTA_INM;
    $contenidoFichero = JFile::read($archivo);
    $lineas = explode("\r\n", $contenidoFichero);
    echo "procesar archivo estado de cuenta inmueble (".count($lineas).")<br />";
    $mensaje.="procesar archivo estado de cuenta inmueble (".count($lineas).")<br />";
    foreach ($lineas as $linea) {


        $registro = explode("\t", $linea);


        if ($registro[0] != "") {

            $registro = Array(
                "id_inmueble"   => $registro[0],
                "apto"          => $registro[1],
                "propietario"   => utf8_encode($registro[2]),
                "recibos"       => $registro[3],
                "deuda"         => $registro[4],
                "deuda_usd"     => str_replace("\r", "", $registro[5])
            );


            $r = $inmueble->insertarEstadoDeCuentaInmueble($registro);


            if ($r["suceed"] == FALSE) {
                die($r['stats']['errno'] . "<br />" . $r['stats']['error'] . '<br/>' . $r['query']);
            }
        }
    }// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="graficos">

// <editor-fold defaultstate="collapsed" desc="facturacion mensual">
if (GRAFICO_FACTURACION == 1) {
    $archivo = ACTUALIZ . "FACTURACION_MENSUAL.txt";
    $contenidoFichero = JFile::read($archivo);
    $lineas = explode("\r\n", $contenidoFichero);
    echo "procesar archivo grafico facturacion mensual (" . count($lineas) . ")<br />";
    $mensaje.="procesar archivo grafico facturación mensual (" . count($lineas) . ")<br />";
    foreach ($lineas as $linea) {
        $registro = explode("\t", $linea);

        if ($registro[0] != "") {

            $registro = Array(
                "id_inmueble" => $registro[0],
                "periodo" => $registro[1],
                "facturado" => $registro[2]
            );

            $r = $inmueble->insertarFacturacionMensual($registro);

            if ($r["suceed"] == FALSE) {
                die($r['stats']['errno'] . "<br />" . $r['stats']['error'] . '<br/>' . $r['query']);
            }
        }
    }
}
// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="cobranza mensual">
if (GRAFICO_COBRANZA == 1) {
    $archivo = ACTUALIZ . "COBRANZA_MENSUAL.txt";
    $contenidoFichero = JFile::read($archivo);
    $lineas = explode("\r\n", $contenidoFichero);
    echo "procesar archivo grafico cobranza mensual (" . count($lineas) . ")<br />";
    $mensaje.="procesar archivo grafico cobranza mensual (" . count($lineas) . ")<br />";
    foreach ($lineas as $linea) {
        $registro = explode("\t", $linea);

        if ($registro[0] != "") {

            $registro = Array(
                "id_inmueble" => $registro[0],
                "periodo" => $registro[1],
                "monto" => $registro[2]
            );

            $r = $inmueble->insertarCobranzaMensual($registro);

            if ($r["suceed"] == FALSE) {
                die($r['stats']['errno'] . "<br />" . $r['stats']['error'] . '<br/>' . $r['query']);
            }
        }
    }
}
// </editor-fold>

// </editor-fold>

$fecha = JFILE::read(ACTUALIZ."ACTUALIZACION.txt");
echo "****FIN DEL PROCESO DE ACTUALIZACION****<br />";
echo "Información actualizada al: ".$fecha."<br/>";
$mail = new mailto();
$r = $mail->enviar_email("Actualización Vicky & Ann en Línea ".$fecha,$mensaje, "", 'vickann26@gmail.com ',"");
        
if ($r=="") {
    echo "Email de confirmación enviado con éxito<br />";
} else {
    echo "Falló el envio del email de ejecución del proceso<br />";
}
echo "Cierre esta ventana para finalizar.";