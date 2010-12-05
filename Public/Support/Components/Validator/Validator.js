
function RequiredFieldValidation( message_node, target_node ) {
	var n = document.getElementById(target_node);
	var e = document.getElementById(message_node);
	e.style.display = 'none';	
	if(_(target_node))
	   	{	
		if(_(target_node).formValue() == '') {
					e.style.display = 'block';
			return false;   
		}
		}
	else
	{
		if(( n && SerializeFormValue('', n) == '')) {	
			e.style.display = 'block';
			return false;
		}
	}
	return true;
}
function RegularExpressionFieldValidation( message_node, target_node, expression ) {
	var n = document.getElementById(target_node);
	var e = document.getElementById(message_node);
	e.style.display = 'none';
	if( n ) {
		var r = new RegExp(expression);
		var value = SerializeFormValue('', n);
		if( !(r && r.test(value)) && !(r && r.test(n.value)) ) {
			e.style.display = 'block';
			return false;
		}
	}
	return true;
}
// object HTMLTextAreaElement