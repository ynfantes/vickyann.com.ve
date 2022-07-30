<?php
include_once '../includes/constants.php';

$db = new db();
if (isset($_POST['email'])) {
    // <editor-fold defaultstate="collapsed" desc="captura de variales post">
    if ($_POST['email'] == '') {
        $has = "alert_mandatory";
    } else {
        $query = "select p.*,pr.apto from propietarios p join propiedades pr on p.cedula = pr.cedula where p.email='" . $_POST['email'] . "'";

        $r = $db->dame_query($query);

        // <editor-fold defaultstate="collapsed" desc="envio credenciales">
        if ($r['suceed'] && count($r['data']) > 0) {
            $template = '../enlinea/plantillas/clave-servicio.html';
            if (file_exists($template)) {
                $contenido = file_get_contents($template);


                if ($contenido == '') {
                    $has = "alert_envio";
                } else {
                    $mail = new mailto();


                    // hacemos la personalizacion del contenido
                    foreach ($r['data'][0] as $key => $value) {
                        $contenido = str_replace("[" . $key . "]", $value, $contenido);
                    }


                    $destinatario = $r['data'][0]['email'];


                    $r = $mail->enviar_email('Credenciales de acceso', $contenido, '', $destinatario, $r['data'][0]['nombre']);


                    if ($r == '') {
                        $has = "alert_success";
                    } else {
                        $has = "alert_envio";
                    }
                }
            } else {
                $has = "alert_envio";
            }
        } else {
            $has = "alert_email";
        
    }
        // </editor-fold>
    }
    // </editor-fold>
    header("Location:".ROOT."recuperar-password.html#".$has);
    die();
} else {
    die("Acceso restringido");
    
}