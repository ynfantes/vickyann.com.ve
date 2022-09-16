<?php
/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of pago
 *
 * @author emessia
 */
class pago extends db implements crud {
    const tabla = "pagos";

    public function actualizar($id, $data){
        return $this->update(self::tabla, $data, array("id" => $id));
    }

    public function borrar($id){
        return $this->delete(self::tabla, array("id" => $id));
    }

    public function insertar($data){
        return $this->insert(self::tabla, $data);
    }
    
    public function insertarDetallePago($data) {
        return $this->insert("detalle_pago", $data);
    }
    
    public function listar(){
       return $this->select("*", self::tabla);
    }
    
    public function ver($id){
        return $this->select("*",self::tabla,array("id"=>$id));
    }
    
    public function borrarTodo() {
        return $this->delete(self::tabla);
    }
    
    public function pagoYaRegistrado($data) {
        return $this->select("*", self::tabla, Array(
            "tipo_pago"=>$data['tipo_pago'],
            "numero_documento"=>$data['numero_documento'],
            "numero_cuenta"=>$data['numero_cuenta'],
            "banco_destino"=>$data['banco_destino']));
    }
    
    public function listarPagosPendientes($inmueble=null){
        
        if ($inmueble=='sac') {
            $condicion = Array("estatus"=>"'p'");
        } else  {
            $condicion = Array("estatus"=>"p","d.id_inmueble"=>$inmueble);
        }
        
        return $this->select("distinct p.*", "pagos p join pago_detalle d on p.id = d.id_pago", $condicion,null,Array("d.id_inmueble"=>"ASC"));
    }
    
    public function detallePagoPendiente($id_pago) {
        return $this ->select("*", "pago_detalle", Array("id_pago"=>$id_pago));
    }
    
    public function detalleTodosPagosPendientes($inmueble=null) {
        $query = "select * from pago_detalle where id_pago in 
            (select id from pagos where estatus='p')";
        if ($inmueble!='sac') {
            $query.= " and id_inmueble=".$inmueble;
        }
        return $this->dame_query($query);
        
    }
    
    public function listarPagosProcesadosRangoFechas($desde = null, $hasta = null, $codigo_inmueble = null) {
        $query = "select distinct p.* from pagos p join pago_detalle d on p.id = d.id_pago where estatus = 'a' ";
        if (!$codigo_inmueble==null) {
            $query.= " and d.id_inmueble ='".$codigo_inmueble."' ";
        }
        if (!$desde == null) {
           $query .= "and p.fecha >='".$desde."' ";
        }
        if (!$hasta == null){
            $query .= "and p.fecha <='".$hasta." 23:59:59'";
        }
        $query.="order by d.id_inmueble ASC, p.id";
        return $this->dame_query($query);
    }
    
    public function registrarPago($data) {
        $resultado = Array();
        $this->exec_query("START TRANSACTION");
        try {
            $res = $this->pagoYaRegistrado($data);
            
            if ($res['suceed'] && !count($res['data']) > 0 ) {
                
                $pago_detalle = Array();
                $pago_detalle['id_factura'] = $data['facturas'];
                $pago_detalle['id_inmueble'] = $data['id_inmueble'];
                $pago_detalle['apto'] = $data['id_apto'];
                $pago_detalle['monto'] = $data['montos'];
                $pago_detalle['periodo']= $data['periodo'];
                $pago_detalle['id']=$data['id'];
                if (isset($data['id_usuario'])) {
                    $id_usuario = $data['id_usuario'];
                    unset($data['id_usuario']);
                }
                unset($data['facturas'], $data['montos'], $data['id_inmueble'], $data['id_apto'],$data['periodo'],$data['id']);
                
                $data['fecha_documento'] = Misc::format_mysql_date($data['fecha_documento']);
                $data['monto'] = Misc::format_mysql_number($data['monto']);
                $data['tipo_pago'] = strtoupper($data['tipo_pago']);
                $data['banco_destino'] = strtoupper($data['banco_destino']);
                
                if (isset($data['banco_origen'])) {
                    $data['banco_origen'] = strtoupper($data['banco_origen']);
                }
                
                $data['numero_cuenta'] = str_replace(" ", "", $data['numero_cuenta']);
                
                $resultado['pago'] = $this->insertar($data);
                unset($resultado['pago']['query']);
                if ($resultado['pago']['suceed']) {

                    $id_pago = $resultado['pago']['insert_id'];
                    $resultado['pago_detalle'] = Array();
                    
                    if (isset($id_usuario)) {
                        $r = $this->insert("pago_usuario", Array("id_usuario"=>$id_usuario,"id_pago"=>$id_pago));
                    }
                    for ($i = 0; $i < count($pago_detalle['id']); $i++) {
                        
                        $j = (int)$pago_detalle['id'][$i];
                        
                        $resultado_detalle = $this->insert("pago_detalle", Array(
                            "id_pago" => $id_pago, 
                            "id_factura" => $pago_detalle['id_factura'][$j],
                            "id_inmueble" => $pago_detalle['id_inmueble'][$j],
                            "id_apto" => $pago_detalle['apto'][$j],
                            "monto" => $pago_detalle['monto'][$j],
                            "periodo"=>  Misc::format_mysql_date($pago_detalle['periodo'][$j])));
                        unset($resultado_detalle['query']);
                        array_push($resultado['pago_detalle'], $resultado_detalle);

                        $resultado['suceed'] = $resultado_detalle['suceed'];
                    }    
                    if (!$resultado_detalle['suceed']) {
                        $resultado['mensaje'] = "Ha ocurrido un error al procesar el pago";
                    } else {
                        $this->exec_query("COMMIT");
                        $resultado['suceed'] = true;
                        $resultado['mensaje'] = "Pago proceso con éxito!";
                        // se envia el email de confirmación
                        $ini = parse_ini_file('emails.ini');
                        $mail = new mailto();
                        if (isset($_SESSION['usuario']['directorio'])) {
                            $propietario = 'Propietario(a)';
                        } else {
                            $propietario = $_SESSION['usuario']['nombre'];
                        }

                        switch (strtoupper($data['tipo_pago'])) {
                            case 'D':
                                $forma_pago = 'DEPOSITO';
                                break;
                            case 'TDD':
                                $forma_pago = 'T.DEBITO';
                                break;
                            case 'TDC':
                                $forma_pago ='T.CREDITO';
                                break;

                            default:
                                $forma_pago = 'TRANSFERENCIA';
                                break;
                        }

                        $mensaje = sprintf($ini['CUERPO_MENSAJE_PAGO_RECEPCION_CONFIRMACION'], 
                            $propietario,
                            $forma_pago,
                            $data['numero_documento'],
                            $data['banco_destino'],
                            $data['numero_cuenta'],
                            Misc::number_format($data['monto']),
                            Misc::date_format($data['fecha_documento']),
                            $data['email'],$data['telefono'],
                            $propietario,
                            $id_pago,
                            date("d/m/Y")
                        );
                        
                        $mensaje.=$ini['PIE_MENSAJE_PAGO'];

                        $r = $mail->enviar_email("Pago de Condominio", $mensaje, "", $data['email']);

                        if ($r=="") {
                            $this->actualizar($id_pago, Array("enviado"=>1));
                        } else {
                            $resultado['envio']=$r;
                        }

                    }
                    
                } else {
                    $resultado = $resultado['pago'];
                    $this->exec_query("ROLLBACK");
                    $resultado['mensaje'] = "Error mientras se procesaba el pago maestro.";
                }
            } else {
                $resultado['suceed'] = false;
                $resultado['mensaje'] = "Estimado propietario:\n\nEste pago ya fue registrado con anterioridad, en fecha ".  Misc::date_format($res['data'][0]['fecha'].".");
                if ($res['data'][0]['estatus']=='p') {
                    $resultado['mensaje'].= "\nActualmente está pendiente de ser aplicado a su cuenta.";
                }
                if ($res['data'][0]['estatus']=='a') {
                    $resultado['mensaje'].= "\nEL pago ya fue aplicado a su cuenta.";
                }
                if ($res['data'][0]['estatus']=='a') {
                    $resultado['mensaje'].= "\nEl pago ya fue rechazado. Si considera que es un error nuestro, escríbanos a info@administradora-vickyann.com.ve";
                }
            }
        } catch (Exception $exc) {
            $resultado['suceed'] = false;
            $this->exec_query("ROLLBACK");
            $resultado['mensaje'] = "Error inesperado, contacte con el administrador del sistema";
            echo $exc->getTraceAsString();
        }
        return $resultado;
     }
    
    public function procesarPago($id,$estatus,$recibo=null) {
        
        if (!$recibo==null) {
            
            $this->insert("pago_recibo", array("id_pago"=>$id,"n_recibo"=>$recibo));
            return false;
            
        }
        $this->actualizar($id, array("estatus"=>$estatus));
        
        $r = $this->ver($id);
        
        if ($r['suceed']==true) {
            
            if (count($r['data'])>0) {
                
                // <editor-fold defaultstate="collapsed" desc="tipo de pago">
                switch (strtoupper($r['data'][0]['tipo_pago'])) {
                    case 'D':
                        $tipo_pago = 'DEPOSITO';
                        break;
                    case 'TDD':
                        $tipo_pago = 'T.DEBITO';
                        break;
                    case 'TDC':
                        $tipo_pago = 'T.CREDITO';
                        break;

                    default:
                        $tipo_pago = 'TRANSFERENCIA';
                        break;
                }// </editor-fold>

                $data = Array(
                    "administradora"=>TITULO,
                    "forma_pago"=>$tipo_pago,
                    "numero_documento"=>$r['data'][0]['numero_documento'],
                    "banco"=>$r['data'][0]['banco_destino'],
                    "cuenta"=>$r['data'][0]['numero_cuenta'],
                    "monto"=>$r['data'][0]['monto'],
                    "fecha"=>$r['data'][0]['fecha'],
                    "email"=>$r['data'][0]['email'],
                    "recibo"=>$recibo
                    );
                return $this->enviarEmailPagoProcesado($id, $estatus,$data);
            }
            
        }
        return "Falló";
        
    }
    
    public function enviarEmailPagoRegistrado($id) {
        
        $data = $this->ver($id);
        
        if ($data['suceed'] && count($data['data'])>0) {
            $ini = parse_ini_file('emails.ini');
            $mail = new mailto();
            $propietario = 'Propietario(a)';
            
            //$forma_pago = $data['data'][0]['tipo_pago']='D'? 'DEPOSITO':'TRANSFERENCIA';
            
            switch (strtoupper($data['data'][0]['tipo_pago'])) {
                case 'D':
                    $forma_pago = 'DEPOSITO';
                    break;
                case 'TDD':
                    $forma_pago = 'T.DEBITO';
                    break;
                case 'TDC':
                    $forma_pago ='T.CREDITO';
                    break;
                
                default:
                    $forma_pago = 'TRANSFERENCIA';
                    break;
            }
            $mensaje = sprintf($ini['CUERPO_MENSAJE_PAGO_RECEPCION_CONFIRMACION'], 
                    $propietario,
                    $forma_pago,
                    $data['data'][0]['numero_documento'],
                    $data['data'][0]['banco_destino'],
                    $data['data'][0]['numero_cuenta'],
                    Misc::number_format($data['data'][0]['monto']),
                    Misc::date_format($data['data'][0]['fecha_documento']),
                    $data['data'][0]['email'],$data['data'][0]['telefono'],
                    $propietario,
                    $id,
                    date("d/m/Y"));
            
                    $mensaje.=$ini['PIE_MENSAJE_PAGO'];
            
            $r = $mail->enviar_email("Pago de Condominio", $mensaje, "", $data['data'][0]['email']);

            if ($r=="") {
                $this->actualizar($id, Array("enviado"=>1));
                echo "Email enviado a ".$data['data'][0]['email']." Ok!";
            } else {
                echo($r);
            }
        } else {
            echo 'No se consigue la informaci&oacute;n del pago ID: '.$id;
        }
    }
    
    public function enviarEmailPagoProcesado($id,$estatus,$data) {
        $ini = parse_ini_file('emails.ini');
        $mail = new mailto();
        
        $s = strtoupper($estatus)=='A' ? "CONFIRMACION" : "RECHAZO";
        $m = strtoupper($estatus)=='A' ? "CONFIRMACION" : "RECHAZO";
        $destinatario = $data['email'];
        $subject = sprintf($ini['ASUNTO_MENSAJE_PAGO_PROCESADO_'.$s]);
        $mensaje = sprintf($ini['CUERPO_MENSAJE_PAGO_PROCESADO_'.$m],
                $data['administradora'],
                $data['forma_pago'],
                $data['numero_documento'],
                $data['banco'],
                $data['cuenta'],
                Misc::number_format($data['monto']),
                Misc::date_format($data['fecha']),
                $ini['CUENTA_PAGOS']
                );
        
        //$adjunto="";
        $can = array();
        
        // <editor-fold defaultstate="collapsed" desc="si el pago es aplicado">
        if ($estatus == 'A') {

            if (RECIBO_GENERAL==1) {
                $r = $this->detallePagoReciboGeneral($id);
            } else {
                $r = $this->detallePagoPendiente($id);
            }
            if ($r['suceed'] == true) {
                if (count($r['data']) > 0) {
                    $n = 0;
                    foreach ($r['data'] as $factura) {
                        
                        //$con = $adjunto == "" ? "" : ",";
                        $factura = '../../cancelacion.gastos/' . $factura["id_factura"] . '.pdf';
                        
                        $factura = realpath($factura);
                        
                        if ($factura != "") {
                            $n = $n + 1;
                            $can[] = $factura;
                        }
                        //$adjunto.= $con . $factura;
                    }
                    // $mensaje.= "Hemos adjuntado " . strval($n) . " factura(s).";
                    // if ($n < count($r['data'])) {
                    //     $mensaje . -"<br>Falta(ron) factura(s) por adjuntar.";
                    // }
                }
            }
        }// </editor-fold>
        $mensaje.= $ini['PIE_MENSAJE_PAGO'];
        
        $r = $mail->enviar_email($subject, $mensaje, "", $destinatario,"",$can);
        
        if ($r=="") {
            $this->actualizar($id, Array("confirmacion"=>1));
            return "Ok";
        }
        return "Falló";
        
    }
    
    public static function listarPagosProcesados($inmueble, $apartamento, $n) {
         if (RECIBO_GENERAL==1) {
            $consulta = "select p.*,d.n_recibo from pagos p join pago_recibo d on 
            p.id = d.id_pago where p.id in (select id_pago from pago_detalle d where d.id_inmueble='".$inmueble."' and id_apto='".$apartamento."' and p.estatus='a') order by 1 desc, n_recibo DESC LIMIT 0,$n ";
        } else {
        $consulta = "select p.*, d.* from pagos p join pago_detalle d on 
            p.id = d.id_pago where d.id_inmueble='".$inmueble."' and id_apto='".$apartamento."' 
               and p.estatus='a' order by 1 desc LIMIT 0,".$n;
        }
        
        return db::query($consulta);
    }
    
    public static function detalleCancelacionDeGastos($id_factura) {
         $consulta = "select f.*, d.*, i.nombre_inmueble, pro.nombre, p.alicuota
            from facturas f join factura_detalle d on f.numero_factura =
            d.id_factura join inmueble i on i.id = f.id_inmueble 
            JOIN propiedades p ON p.id_inmueble = i.id
            AND p.apto = f.apto
            JOIN propietarios pro ON pro.cedula = p.cedula
            where f.numero_factura ='".$id_factura."' order by d.codigo_gasto ";
        
        return db::query($consulta);
    }
    
    public static function numeroRecibosCanceladosPorPropitario($cedula) {
        $sql = "select count(p.id) as cantidad from pagos as p join pago_detalle as d on d.id_pago = p.id
            join propiedades as pro on pro.id_inmueble = d.id_inmueble and pro.apto = d.idapto
            where estatus='A' and pro.cedula=".$cedula;
        
        return db::query($sql);
    }
    
    public static function facturaPendientePorProcesar($periodo,$inmueble,$apto) {
        $sql = "SELECT * FROM pagos p join pago_detalle pd on p.id = pd.id_pago where p.estatus='p' and pd.periodo='".$periodo."' and id_inmueble='".$inmueble."' and id_apto='".$apto."'";
        
        $r = db::query($sql);
        
        return $r;
//        if ($r['suceed']) {
//            if (count($r['data'])>0) {
//                return 1;
//            } else {
//                return 0;
//            }
//        } else {
//            return 0;
//        }
        
    }
    
    public function detallePagoReciboGeneral($id_pago) {
        $consulta = "select id_pago,n_recibo,n_recibo as id_factura from pago_recibo where id_pago=$id_pago";
        return $this->query($consulta);
    }
    
    public function listadoPagosRegistradosPorUsuario($id,$fecha,$start=0, $limit=10,$perfil=null) {
        if ($start < 0) {   
            $start = 0;
        }
        $limit = $start + $limit;
        if ($limit < 1) {
            $limit = 1;
        }	
        if ($perfil=='ADMIN') {
            $sql = "select distinct p.*,pd.id_inmueble, pd.id_apto from pagos p join pago_usuario u on p.id = u.id_pago 
                join pago_detalle pd on p.id = pd.id_pago
                where date(p.fecha)='".$fecha ."' order by fecha ASC limit $start,$limit";
        } else {
            $sql = "select distinct p.*,pd.id_inmueble, pd.id_apto from pagos p join pago_usuario u on p.id = u.id_pago 
                join pago_detalle pd on p.id = pd.id_pago
                where u.id_usuario =".$id." and date(p.fecha)='".$fecha. "' order by fecha ASC limit $start,$limit";
        }
        return db::dame_query($sql);
        
    }
    
    public function eliminarPago($id) {
        // eliminar detalle
        $r = $this->delete("pago_detalle", array("id_pago"=>$id));
        if (!$r['suceed']) {
            $r['mensaje']='Ocurrió un error al eliminar el detalle de la transacción';
            return $r;
        }
        // eliminar pago usuario
        $r = $this->delete("pago_usuario", array("id_pago"=>$id));
        if (!$r['suceed']) {
            $r['mensaje']='Ocurrió un error al eliminar la información del usuario';
            return $r;
        }
        // eliminar pag maestro
        $this->borrar($id);
        if (!$r['suceed']) {
            $r['mensaje']='Ocurrió un error al eliminar el detalle de la transacción';
        } else {
            $r['mensaje']='Transacción eliminada con éxito!';
        }
        return $r;
    }
    
    public function insertarMovimientoCaja($data) {
        return db::insert("movimiento_caja",$data);
    }
    
    public function estadoDeCuenta($inmueble, $apto) {
        $consulta = "select * from movimiento_caja".
                " where id_inmueble='".$inmueble."' and id_apto='".$apto.
                "' order by fecha_movimiento DESC";
        
        return db::query($consulta);
    }
    
    public function actualizarFactura($inmueble,$apto,$factura,$monto) {
        $monto = misc::format_mysql_number($monto);
        $factura = "01/".$factura;
        $factura = misc::format_mysql_date($factura);
        
        $sql = 'update facturas set abonado = abonado + '.$monto.' where id_inmueble=\''.$inmueble.'\' and apto=\''.$apto.'\' and periodo=\''.$factura.'\'' ;
        
        return $this->exec_query($sql);
    }
    
    public static function listarPagosProcesadosWeb() {
        $consulta = "select d.id_factura,d.id_inmueble,d.id_apto from pagos p join pago_detalle d on p.id = d.id_pago "
                . "where p.estatus='a' and left(d.id_factura,1)='0' and d.id_inmueble in "
                . "(select id from inmueble) order by d.id_inmueble, d.id_apto, d.periodo DESC";
        
        return db::query($consulta);
    }
    
    public function listarPagosEmailRegisroNoEnviado() {
        return $this->select("*", self::tabla, Array("estatus"=>'p',"enviado"=>0));
    }
    
    public function cancelacionExisteEnBaseDeDatos($cancelacion) {
        $cancelacion = str_replace(".pdf","",$cancelacion);
        $query = "select numero_factura from cancelacion_gastos where numero_factura='".$cancelacion."'";
        $r=0;
        $result = $this->dame_query($query);
        if ($result['suceed']==true) {
            if (count($result['data'])>0) {
                $r=1;
            }
        }
        return $r;       
    }
}