<?php
header ('Content-type: text/html; charset=utf-8');

include_once '../includes/constants.php';
include_once '../includes/file.php';

usuario::esUsuarioLogueado();

$session = $_SESSION;

$id_inmueble = isset($_GET['inmueble']) ? $_GET['inmueble']:"";
$total = 0;
$recibos=0;
$inmueble = new inmueble();

$propiedades = $inmueble->listarInmueblesAutorizados($session['usuario']['id']);
$aut=false;
if ($propiedades['suceed']) {
     foreach ($propiedades['data'] as $p) {
         
         if ($id_inmueble == $p['id']) {
             $aut = true;
             break;
         }
         
     }
    
}
if (!$aut) {
    die("Está tratando de ver una información que no está asociada a su cuenta de condominio.");
}
if ($id_inmueble!= "") {
    $archivo = '../'.ACTUALIZ . ARCHIVO_ACTUALIZACION;
    $fecha_actualizacion = JFile::read($archivo);
    $inmuebles = new inmueble();
    $cuentas = Array();
//    $bitacora->insertar(Array(
//        "id_sesion"=>$session['id_sesion'],
//        "id_accion"=>6,
//        "descripcion"=>$propiedad['id_inmueble']." - ".$propiedad['apto'],
//    ));
    $inm = $inmuebles->ver($id_inmueble);
    $cuenta = $inmuebles->estadoDeCuenta($id_inmueble);
} else {
    die("No se puede generar la información solicitada.");
}
?>
<page  style="font-size: 10pt;">
    <img src="../assets/images/logo-app.png" alt="Logo" width=150 /><br><br>
<div data-widget-editbutton="false" id="wid-id-3" class="jarviswidget  jarviswidget-sortable jarviswidget-color-white" role="widget" data-widget-attstyle="jarviswidget-color-white">
<div role="heading">
    <span style="font-size: 20px; font-weight: bold">Estado de Cuenta Inmueble</span><br>
    <span style="font-size: 14px; font-weight: bold"><?php echo $inm['data'][0]['nombre_inmueble'] ?></span><br>
    <span style="font-size: 10px;color:#333">Información actualizada al: <?php echo $fecha_actualizacion ?></span><br>
    <br>
    
</div>
<div role="content" style="display: block;">

<div class="widget-body no-padding">
    <table  style="width: 60%;border: solid 1px #5544DD; border-collapse: collapse" align="center">
        <thead>
            <tr>
                <th style="width: 30%; text-align: center; border: solid 1px #337AB7; background: #337AB7;padding: 2mm; color: #fff">Apartamento</th>
                <th style="width: 30%; text-align: center; border: solid 1px #337AB7; background: #337AB7;padding: 2mm; color: #fff">Nº Recibos</th>
                <th style="width: 30%; text-align: center; border: solid 1px #337AB7; background: #337AB7;padding: 2mm; color: #fff">Deuda</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($cuenta['data'] as $r) {
                $total += $r['deuda'];
                $recibos += 1;
                ?>
            <tr>
                <td style="text-align: center;border: solid 1px #cfcfcf;"><?php echo $r['apto']; ?></td>
                <td style="text-align: center;border: solid 1px #cfcfcf;"><?php echo $r['recibos']; ?></td>
                <td style="text-align: right;border: solid 1px #cfcfcf;"><?php echo number_format($r['deuda'], 2, ",","."); ?>&nbsp;&nbsp;</td>
            </tr>
            <?php } ?>
            <tr>
                <td style="text-align: right;border: solid 1px #cfcfcf;"><strong>Total</strong>&nbsp;&nbsp;</td>
                <td style="text-align: center;border: solid 1px #cfcfcf;"><strong><?php echo $recibos; ?></strong>&nbsp;&nbsp;</td>
                <td style="text-align: right;border: solid 1px #cfcfcf;"><strong><?php echo number_format($total, 2, ",","."); ?></strong>&nbsp;&nbsp;</td>
            </tr>
        </tbody>
</table>
</div>  
</div>
</div>
</page>

