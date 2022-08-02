<?php
include './constants.php';
include 'mailto.php';
// se envia el email de confirmación
$mail = new mailto();

$propietario = "edgar";
$forma_pago = 'DEPOSITO';

$mensaje = 'Este es un mensaje de prueba';


$r = $mail->enviar_email("Pago de Condominio", $mensaje, "", "ynfantes@gmail.com");

if ($r=="") {
    echo "mensaje enviado con exito";
} else {

    echo $r;
}
?>
