<?php
//if (substr_count($_SERVER['HTTP_ACCEPT_ENCODING'], 'gzip')) ob_start("ob_gzhandler"); else ob_start();
include_once 'includes/constants.php';
if (!isset($_GET['accion'])) {
    echo $twig->render('index.html.twig');
} else {
    echo $twig->render($_GET['accion'].'.html.twig');
}