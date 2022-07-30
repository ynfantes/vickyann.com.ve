/**	CONTACT FORM
*************************************************** **/
var _hash = window.location.hash;
/**
BROWSER HASH - from php/obtener-credenciales.php redirect!
#alert_success 		= login ok
#alert_pass		= password inválido
#alert_apto             = apto inválido
#alert_user             = apto inválido
#alert_mandatory	= email not sent - required fields empty

**/
jQuery(_hash).show();