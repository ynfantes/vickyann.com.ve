<?php
$archivo='';
ob_start();

include(dirname(__FILE__).'/estadoDeCuentaInmueble.php');
$content = ob_get_clean();
//die($content);
require_once('../includes/html2pdf/html2pdf.class.php');

try
{
    $html2pdf = new HTML2PDF('P', 'Letter', 'fr',true,'UTF-8',array(20, 10, 20, 10));
//      $html2pdf->setModeDebug();
    $html2pdf->pdf->SetDisplayMode('fullpage');
    $html2pdf->setDefaultFont('arial');
    $html2pdf->writeHTML($content);
    
    if (isset($_GET['email'])) {
        $archivo = $html2pdf->Output('','S');
        
        $mail = new mailto();

        $r = $mail->enviar_email("Reporte de Transacciones Web", "Adunto le estoy enviando de transacciones.<br><br>".$session['usuario']['nombre_completo'], '', MAIL_CAJERO_WEB, "",null,null,$archivo);
        $archivo='';
        //if ($r=='') {
        echo $r;
        //} else {
        //    echo 'envio fallido';
        //}
    } else {
         $html2pdf->Output('ReporteTransacciones.pdf');
    }
}

catch(HTML2PDF_exception $e) {
    echo $e;
    exit;
}