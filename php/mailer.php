<?php
include_once '../includes/constants.php';
include_once '../includes/mailto.php';
$message="Contacto Administradora Vick&Ann\n";
$message.=$_POST["email"]."\n";
$message.=$_POST["nombre"]."\n";
$message.=$_POST["mensaje"];
$message = stripcslashes(nl2br(htmlentities($message)));

$subject = "Contacto administradora-vickyann.com.ve";
//$headers .= 'From: Contacto <info@administradora-vickyann.com.ve>'."\r\n".'Reply-To:'.$_POST["email"]."\r\n" ;
//$email = "ynfantes@gmail.com";
$email = "vickann26@gmail.com";

if ($_POST["email"]!='' && $_POST["nombre"]!='' && $_POST["mensaje"]!='') {
    
    $mail = new mailto();
    $result = $mail->enviar_email($subject, $message,"", $email,$_POST['nombre']);
    
    if ($result=="") {
        $result['suceed'] = true;
        $result['mensaje'] = "Mensaje enviado con éxito!\r\nLo estaremos contactando a la brevedad. Gracias por contactarnos.";
    } else {
        $result['suceed'] = false;
        $result['mensaje'] = "¡Ups! Ocurrió un error al tratar de enviar el mensaje</strong>
        Inténtelo nuevamente. Gracias por contactarnos.";    
    }
    echo json_encode($result);
}