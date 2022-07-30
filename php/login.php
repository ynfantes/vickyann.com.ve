<?php
include_once '../includes/constants.php';

//echo $twig->render('mantenimiento.html.twig');
//die();

$result = array();
$password = '';
$apto = '';
$has = '';
if (isset($_POST['apto']) && isset($_POST['password'])) {
    
    $propietario = new propietario();    
    $apto = $_POST['apto'];
    $password = $_POST['password'];
    $result = $propietario->login($apto,$password, 0);
    
    if ($result['suceed']=='true') {
        
        if ($_SESSION['status'] == 'logueado') {
            header("location:" . URL_SISTEMA );
        }
        die();
    }
    $has = $result['error'];
}

header("Location:".ROOT."condominio-en-linea.html#".$has);
