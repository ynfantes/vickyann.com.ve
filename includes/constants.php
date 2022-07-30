<?php
date_default_timezone_set("America/La_Paz");
define("mailPHP",0);
define("sendMail",1);
define("SMTP",2);

$debug = false;
$sistema = "/vickyann.com.ve/";
$email_error = false;
$mostrar_error = true;
$programa_correo = mailPHP;

if ($_SERVER['SERVER_NAME'] == "www.administradora-vikyann.com.ve" | $_SERVER['SERVER_NAME'] == "www.administradora-vickyann.com.ve" ) {
    $user = "";
    $password = "";
    $db = "";
    $email_error = true;
    $mostrar_error = false;
    $debug = false;
    $sistema = "/";
    $programa_correo = SMTP;
} else {
    $user = "";
    $password = "";
    $db = "";
}


define("HOST", "localhost");
define("USER", $user);
define("PASSWORD", $password);
define("DB", $db);
define("SISTEMA", $sistema);
define("EMAIL_ERROR", $email_error);
define("EMAIL_CONTACTO", "ynfantes@gmail.com");
define("MOSTRAR_ERROR", $mostrar_error);
define("DEBUG", $debug);
define("TITULO", "Administradora Vick&Ann");
define("EMAIL_TITULO", "[Error] ".TITULO);
define("ROOT", 'http://' . $_SERVER['SERVER_NAME'] . SISTEMA);
define("URL_SISTEMA", ROOT . "enlinea");
define("URL_INTRANET", ROOT . "intranet");
define("SERVER_ROOT", $_SERVER['DOCUMENT_ROOT'] . SISTEMA);
define("TEMPLATE", SERVER_ROOT . "/template/");
define("PROGRAMA_CORREO",$programa_correo);
include_once dirname(dirname(dirname(__FILE__))).'/framework/twig/lib/Twig/Autoloader.php';
include_once SERVER_ROOT . 'includes/extensiones.php';
Twig_Autoloader::register();

$loader = new Twig_Loader_Filesystem(SERVER_ROOT . 'template');
$twig = new Twig_Environment($loader, array(
            'debug' => true,
            //'cache' => SERVER_ROOT . 'cache',
            'cache' => false,
            "auto_reload" => true)
);
if (isset($_SESSION)){
    $twig->addGlobal("session", $_SESSION);
}
$twig->addExtension(new extensiones());
$twig->addExtension(new Twig_Extension_Debug());

spl_autoload_register( function($class) {
    include_once SERVER_ROOT.'/includes/'.$class.'.php';
});

if (isset($_GET['logout']) && $_GET['logout'] == true) {
    $user_logout = new propietario();
    $user_logout->logout();
}

define("NOMBRE_APLICACION","Vick&ann en Línea");
define("ACTUALIZ","data/");
define("ARCHIVO_INMUEBLE","INMUEBLE.txt");
define("ARCHIVO_CUENTAS","CUENTAS.txt");
define("ARCHIVO_FACTURA","FACTURA.txt");
define("ARCHIVO_FACTURA_DETALLE","FACTURA_DETALLE.txt");
define("ARCHIVO_JUNTA_CONDOMINIO","JUNTA_CONDOMINIO.txt");
define("ARCHIVO_PROPIEDADES","PROPIEDADES.txt");
define("ARCHIVO_PROPIETARIOS","PROPIETARIOS.txt");
define("ARCHIVO_EDO_CTA_INM","EDO_CUENTA_INMUEBLE.txt");
define("ARCHIVO_CUENTAS_DE_FONDO","CUENTAS_FONDO.txt");
define("ARCHIVO_MOVIMIENTOS_DE_FONDO","MOVIMIENTO_FONDO.txt");
define("ARCHIVO_ACTUALIZACION","ACTUALIZACION.txt");
define("ARCHIVO_MOVIMIENTO_CAJA","MOVIMIENTO_CAJA.txt");
define("SMTP_SERVER","mail.administradora-vickyann.com.ve");
define("PORT",25);
define("USER_MAIL","info@administradora-vickyann.com.ve");
define("MAIL_CAJERO_WEB","intranet@grupoveneto.com");
define("PASS_MAIL","vickyann5231");
define("MESES_COBRANZA",1000);
define("GRAFICO_FACTURACION",1);
define("GRAFICO_COBRANZA",1);
define("DEMO",0);
define("RECIBO_GENERAL",0);
define("GRUPOS",1);