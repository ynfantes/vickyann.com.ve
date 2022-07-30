/**	CONTACT FORM
*************************************************** **/
var _hash = window.location.hash;
/**
BROWSER HASH - from php/contact.php redirect!

#alert_success 		= credenciales enviadas al correo
#alert_email		= correo no registrado
#alert_mandatory	= email not sent - required fields empty
**/	
jQuery(_hash).show();