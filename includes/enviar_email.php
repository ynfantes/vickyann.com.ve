<?php
$message="Contacto Inmobiliario grupoveneto.com<br/>";
$message.=$_POST["email"]."<br>";
$message.=$_POST["nombre"]."<br>";
$message.=$_POST["mensaje"];
$message = utf8_decode(stripslashes($message));
$headers = "Content-Language:es-ve\n";
$headers .= "Content-Type: text/html; charset=iso-8859-1\n";
$headers .= "bcc:ynfantes@gmail.com\n";

$subject = "Contacto Inmobiliario grupoveneto.com";
$headers .= 'From: Contacto <inmobiliaria@grupoveneto.com>'."\r\n".'Reply-To:'.$_POST["email"]."\r\n" ;
$email = "inmobiliaria@grupoveneto.com";

//$email = isset($_POST['token']) ? "info@sistemavaloriza.com" : "ynfantes@gmail.com";
if (mail($email,$subject,$message,$headers)) {
    echo "<div class=\"alert alert-success fade in\">\n<button id=\"alert-success\" data-dismiss=\"alert\" class=\"close\" 
    type=\"button\">×</button>\n<strong>¡Mensaje enviando con éxito!</strong><br> A la brevedad
    nos estaremos poniendo en contacto con usted.<br>Gracias por contactarnos.\n</div>";
} else {
    echo "<div class=\"alert alert-error fade in\">\n<button id=\"alert-error\" data-dismiss=\"alert\" class=\"close\" 
    type=\"button\">×</button>\n<strong>¡Ups! Ocurrió un error al tratar de enviar el mensaje</strong>
    Inténtelo nuevamente.<br>Gracias por contactarnos.\n</div>";
    
}
