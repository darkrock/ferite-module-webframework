/*-------------------------------GLOBAL VARIABLES------------------------------------*/

var detect = navigator.userAgent.toLowerCase();
var OS,browser,version,total,thestring;

/*-----------------------------------------------------------------------------------------------*/

window.WebframeworkFlag1 = true;

//Browser detect script origionally created by Peter Paul Koch at http://www.quirksmode.org/
function checkIt(string) {
	place = detect.indexOf(string) + 1;
	thestring = string;
	return place;
}
function getBrowserInfo() {
	if (checkIt('konqueror')) {
		browser = "Konqueror";
		OS = "Linux";
	}
	else if (checkIt('safari')) browser 	= "Safari"
	else if (checkIt('omniweb')) browser 	= "OmniWeb"
	else if (checkIt('opera')) browser 		= "Opera"
	else if (checkIt('webtv')) browser 		= "WebTV";
	else if (checkIt('icab')) browser 		= "iCab"
	else if (checkIt('msie')) browser 		= "Internet Explorer"
	else if (!checkIt('compatible')) {
		browser = "Netscape Navigator"
		version = detect.charAt(8);
	}
	else browser = "An unknown browser";

	if (!version) version = detect.charAt(place + thestring.length);

	if (!OS) {
		if (checkIt('linux')) OS 		= "Linux";
		else if (checkIt('x11')) OS 	= "Unix";
		else if (checkIt('mac')) OS 	= "Mac"
		else if (checkIt('win')) OS 	= "Windows"
		else OS 						= "an unknown operating system";
	}
}
function findPos(obj) {
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		curleft = obj.offsetLeft
		curtop = obj.offsetTop
		while (obj = obj.offsetParent) {
			if (obj.style.position == 'absolute' || obj.style.position == 'relative')
				break;
			curleft += obj.offsetLeft
			curtop += obj.offsetTop
		}
	}
	return [curleft,curtop];
}

function BrowserWindowSize() {
	var width = 0, height = 0;
	if( typeof( window.innerWidth ) == 'number' ) {
		width = window.innerWidth;
		height = window.innerHeight;
	} else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
		//IE 6+ in 'standards compliant mode'                                                                                                                                                        
		width = document.documentElement.clientWidth;
		height = document.documentElement.clientHeight;
	} else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
		//IE 4 compatible                                                                                                                                                                            
		width = document.body.clientWidth;
		height = document.body.clientHeight;
	}
	return [width, height];
}

/*-----------------------------------------------------------------------------------------------*/

var InitFunctionContainer = new Array();
function registerInitFunction( f ) {
	InitFunctionContainer.push( f );
}
var LoadFunctionContainer = new Array();
function registerLoadFunction( f ) {
	LoadFunctionContainer.push( f );
}
function runLoadFunctions() {
	for( var i = 0; i < InitFunctionContainer.length; i++ ) {
		var fnc = InitFunctionContainer[i];
		fnc();
	}
	for( var i = 0; i < LoadFunctionContainer.length; i++ ) {
		var fnc = LoadFunctionContainer[i];
		fnc();
	}
}
var SubmitFunctionContainer = new Array();
function registerSubmitFunction( f ) {
	SubmitFunctionContainer.push( f );
}
function runSubmitFunctions() {
	for( var i = 0; i < SubmitFunctionContainer.length; i++ ) {
		var fnc = SubmitFunctionContainer[i];
		fnc();
	}
}
var ValidateFunctionContainer = new Array();
function registerValidatorFunction( f ) {
	ValidateFunctionContainer.push( f );
}
function runValidators() {
	var valid = true;
	for( var i = 0; i < ValidateFunctionContainer.length; i++ ) {
		var fnc = ValidateFunctionContainer[i];
		var roi = fnc();
		if( !roi ) {
			valid = false;
		}
	}
	return valid;
}
var ComponentFormBeingSubmitted = false;
function submitComponentForm( compid, eventdata, eventextra ) {
	if( !ComponentFormBeingSubmitted ) {
		if( runValidators() ) {
			ComponentFormBeingSubmitted = true;
			document.uicomponentform.uieventcomponent.value = compid;
			document.uicomponentform.uieventdata.value = eventdata;
			if( eventextra != '' )
				document.uicomponentform.uieventextra.value = eventextra;
			runSubmitFunctions();
			ComponentFormBeingSubmitted = false;
			document.uicomponentform.submit();
		}
	}
}
function setComponentFormExtra( extra ) {
	document.uicomponentform.uieventdata.value = extra;
}
function submitComponentEvent( compid, eventdata, eventextra ) {
	if( !ComponentFormBeingSubmitted ) {
		ComponentFormBeingSubmitted = true;
		document.uicomponentform.uieventcomponent.value = compid;
		document.uicomponentform.uieventdata.value = eventdata;
		if( eventextra != '' )
			document.uicomponentform.uieventextra.value = eventextra;
		runSubmitFunctions();
		ComponentFormBeingSubmitted = false;
		document.uicomponentform.submit();
	}	
}

var WFApplicationName = '';
var WFApplicationURI = '';
var WFApplicationVirtualURI = '';
var WFServerURI = '';
var WFCurrentAction = '';
var WFI18NCatalog = '';

function SetupApplication( n, u, v, s ) {
	WFApplicationName = n;
	WFApplicationURI = u;
	WFApplicationVirtualURI = v;
	WFServerURI = s;
	
	mcam.setTargetURL(uriForCurrentAction());
}

function uriForCurrentAction() {
	return urlForApplicationAction(WFCurrentAction);
}
function uriForApplicationImageResource( i ) {
	return WFApplicationURI + 'Resources/Images/' + i;
}
function uriForServerImageResource( i ) {
	return WFServerURI + 'Resources/Images/' + i;
}

function urlForApplicationAction( i ) {
	return WFApplicationVirtualURI + (i != '' ? '/' + i : '');
}
function urlForApplicationCommand( i ) {
	return WFApplicationVirtualURI + '/' + WFCurrentAction + '/-/' + i;
}
function getViewState() {
	var viewstate = document.uicomponentform.____VIEWSTATE____
	if( viewstate )
		return '&____VIEWSTATE____=' + viewstate.value;
	return '';
}

var statusObject = null;

function Status( id ) {
	this.id = id;
	this.count = 0;
	
	this.setProcessing = function( status ) {
		if( this.count == 0 ) {
			var node = document.getElementById(this.id);
			node.innerHTML = '<img src="' + uriForServerImageResource('spinner_transparent.gif') + '" width="10" height="10" valign="middle" /> ' + status;
		}
		this.count++;
	};
	
	this.stopProcessing = function() {
		this.count--;
		if( this.count == 0 ) {
			var node = document.getElementById(this.id);
			node.innerHTML = '';		
		}
	};
};
function StatusSetProcessing( status ) {
	if( statusObject )
		statusObject.setProcessing( status );
}
function StatusStopProcessing() {
	if( statusObject )
		statusObject.stopProcessing();
}

function Ticker( closure, ticks ) {
	this.closure = closure;
	this.ticks = ticks;
}
function GlobalTickerManager_TickTock() {
	globalTickerManager.tickTock();
}
function GlobalTickerManager() {
	
	this.ticking = false;
	this.tickInterval = 0;
	this.tickers = new Array();
	
	this.registerTimeout = function( closure, ticks ) {
		var date = new Date();
		var ticker = new Ticker(closure, date.getTime() + (ticks * 1000));
		
		if( this.tickers.length == 0 ) {
			this.tickInterval = window.setInterval("GlobalTickerManager_TickTock()", 1000);
			this.ticking = true;
		}
		this.tickers.push(ticker);
	};
	this.tickTock = function() {
		var date = new Date();
		for (var i = 0; i < this.tickers.length; i++) {
			if( this.tickers[i].ticks < date.getTime() ) {
				var closure = this.tickers[i].closure;
				this.tickers.splice(i, 1);
				closure();
				continue;
			}
		}
		if( this.tickers.length == 0 ) {
			window.clearInterval(this.tickInterval);
			this.ticking = false;
		}
	};
}

var globalTickerManager = new GlobalTickerManager();

Array.each = function( f ) {
	var i = 0;
	for( i = 0; i < this.length; i++ ) {
		f( this[i] );
	}
}
Array.eachWithIndex = function( f ) {
	var i = 0;
	for( i = 0; i < this.length; i++ ) {
		f( i, this[i] );
	}
}

function DefaultAction( id ) {
	var component = _(id);
	if( component ) {
		component.defaultAction();
	} else {
		var node = document.getElementById(id);
		if( node ) {
			switch( node.tagName.toLowerCase() ) {
				case 'input': {
					switch( node.type.toLowerCase() ) {
						case 'button':
							node.click();
							break;
						default:
							node.focus();
					}
				}
				case 'textarea': {
					node.focus();
				}
				default:
					if( node.onclick )
						node.onclick();
					else
						node.focus();
			}
		}
	}
	return false;
}

function SelectRemoveItemByValue( nodeid, value ) {
	var node = document.getElementById(nodeid);
	for( var i = 0; i < node.length; i++ ) {
		if( node.options[i].value == value ) {
			node.options[i] = null;
			break;
		}
	}
}
function SelectAddItem( nodeid, value, text ) {
	var node = document.getElementById(nodeid);
	node.options[node.length] = new Option( text, value )
}
function SelectChooseItem( nodeid, value ) {
	var node = document.getElementById(nodeid);
	for( var i = 0; i < node.length; i++ ) {
		node.options[i].selected = false;
		if( node.options[i].value == value ) {
			node.options[i].selected = true;
		}		
	}	
}
function RegisterPopupOnMouseOver( owner, popup ) {
	document.getElementById(owner).onmouseover = function( event ) {
		var label = document.getElementById(owner);
		var description = document.getElementById(popup);
		if( description.style.display != 'block' ) {
			var ie = (document.all) ? true:false;
			var y = 0, x = 0;
			if (ie) {
				x = window.event.clientX + document.body.scrollLeft;
				y = window.event.clientY + document.body.scrollTop;
			} else {
				x = event.pageX;
				y = event.pageY;
			}
			description.style.left = x;
			description.style.top = y + 20;
			description.style.display = 'block';
		}
	};	
	document.getElementById(owner).onmouseout = function( event ) { 
		document.getElementById(popup).style.display='none';
	};
}
function RegisterPopupOnClick( owner, popup ) {
	document.getElementById(owner).onclick = function( event ) {
		var label = document.getElementById(owner);
		var description = document.getElementById(popup);
		if( description.style.display != 'block' ) {
			var ie = (document.all) ? true : false;
			var y = 0, x = 0;
			if (ie) {
				x = window.event.clientX + document.body.scrollLeft;
				y = window.event.clientY + document.body.scrollTop;
			} else {
				x = event.pageX;
				y = event.pageY;
			}
			description.style.left = x;
			description.style.top = y + 20;
			description.style.display = 'block';
		}
		return false;
	};
}
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
function IsValidFormComponent( element ) {
	if( element ) {
		switch( element.tagName.toLowerCase() ) {
			case 'input':
			case 'textarea':
			case 'select':
				return true;
		}
	}
	return false;
}
function FormValue( optional_name, element ) {
	switch( element.tagName.toLowerCase() ) {
		case 'input': {
			switch (element.type.toLowerCase()) {
				case 'submit':
				case 'hidden':
				case 'password':
				case 'text':
					return element.value;
				case 'checkbox':
				case 'radio':
					return (element.checked ? 'on' : 'off');
			}
			return '';
		}
		case 'textarea': {
			return element.value;
		}
		case 'select': {
			var value = '';
			switch( element.type.toLowerCase() ) {
				case 'select-one': {
					var index = element.selectedIndex;
					if (index >= 0)
						value = (element.options[index].value || element.options[index].text);
					return value;
				}
				case 'select-multiple': {
					for (var i = 0; i < element.length; i++) {
						var opt = element.options[i];
						if (opt.selected)
							value += '&' + optional_name + '=' + (opt.value || opt.text);
					}
					return value;
				}
			}
		}
	}
    return '';
}

function SerializeFormValue( optional_name, element ) {
	switch( element.tagName.toLowerCase() ) {
		case 'input': {
			switch (element.type.toLowerCase()) {
				case 'submit':
				case 'hidden':
				case 'password':
				case 'text':
					return encodeURIComponent(element.value);
				case 'checkbox':  
				case 'radio':
					return encodeURIComponent((element.checked ? 'on' : 'off'));
			}
			return '';
		}
		case 'textarea': {
			return encodeURIComponent(element.value);
		}
		case 'select': {
			var value = '';
			switch( element.type.toLowerCase() ) {
				case 'select-one': {
					var index = element.selectedIndex;
					if (index >= 0)
						value = (element.options[index].value || element.options[index].text);
					return encodeURIComponent(value);
				}
				case 'select-multiple': {
					for (var i = 0; i < element.length; i++) {
						var opt = element.options[i];
						if (opt.selected)
							value += '&' + optional_name + '=' + encodeURIComponent(opt.value || opt.text);
					}
					return value;
				}
			}
		}
	}
    return '';
}
function SerializeFormComponent( name, element ) {
	if( element.tagName.toLowerCase() == 'select' && element.type.toLowerCase() == 'select-multiple' )
		return SerializeFormValue(name, element);
	return '&' + name + '=' + SerializeFormValue(name,element);
}

function captureEnterKey( event ) {
	var key = 0;
	if( window.event ) {
		key = window.event.keyCode; 
	} else if( event ){
		key = (event.which ? event.which : event.keyCode);
	}
	if( key == 13 || key == 10 )
		return true; 
	return false;
}

function canSubmitData () {
	if( runValidators() ) {
		runSubmitFunctions();
		return true;
	}
	return false;
}

function CancelEvent( event ) {
	event = event || window.event;
	event.cancelBubble = true; 
}

// insertAdjacentHTML(), insertAdjacentText() and insertAdjacentElement()
// for Netscape 6/Mozilla by Thor Larholm me@jscript.dk
// Usage: include this code segment at the beginning of your document
// before any other Javascript contents.

wfinsertAdjacentElement = function (node, where,parsedNode) {
	if( where != 'replace' && node.insertAdjacentElement ) {
		node.insertAdjacentElement( where, parsedNode );
	} else {
		switch (where) {
			case 'beforeBegin':
				node.parentNode.insertBefore(parsedNode,node)
				break;
			case 'afterBegin':
				node.insertBefore(parsedNode,node.firstChild);
				break;
			case 'beforeEnd':
				node.appendChild(parsedNode);
				break;
			case 'afterEnd':
				if (node.nextSibling) 
					node.parentNode.insertBefore(parsedNode,node.nextSibling);
				else 
					node.parentNode.appendChild(parsedNode);
				break;
			case 'replace':
				node.parentNode.replaceChild(parsedNode,node);
				break;
		}
	}
}

function wfreplaceHTML( node, html ) {
	try {
		node.insertAdjacentHTML('afterEnd', html);
	} catch( e ) {
		var div = document.createElement('div');
		var tagName = node.tagName.toLowerCase();
		div.innerHTML = '<table><tbody>' + (tagName == 'td' ? '<tr>' : '') + html + (tagName == 'td' ? '</tr>' : '') + '</tbody></table>';
		var newNode = div.childNodes[0].childNodes[0].childNodes[0];
		if( tagName == 'td' )
			newNode = newNode.childNodes[0];
		if( node.nextSibling )
			node.parentNode.insertBefore(newNode,node.nextSibling);
		else
			node.parentNode.appendChild(newNode);
	}
	node.parentNode.removeChild(node);		
}

wfinsertAdjacentHTML = function(node,where,htmlStr) {
	if( where != 'replace' && node.insertAdjacentHTML ) {
		node.insertAdjacentHTML( where, htmlStr );
	} else if( where == 'replace' && node.insertAdjacentHTML ) {
		wfreplaceHTML( node, htmlStr );
	} else {
		var r = node.ownerDocument.createRange();
		r.setStartBefore(node);
		var parsedHTML = r.createContextualFragment(htmlStr);
		wfinsertAdjacentElement(node,where,parsedHTML)
	}
}
wfinsertAdjacentText = function (node, where,txtStr) {
	if( where != 'replace' && node.insertAdjacentText ) {
		node.insertAdjacentText( where, txtStr );
	} else if( where == 'replace' && node.insertAdjacentHTML ) {
		node.insertAdjacentText( 'beforeBegin', txtStr );
		node.parentNode.removeChild( node );
	} else {
		var parsedText = document.createTextNode(txtStr)
		wfinsertAdjacentElement(node,where,parsedText)
	}
}

function byId( id ) {
	return document.getElementById(id);
}

/*------------- MODAL DIALOG CODE --------------*/
var ModalDialog = function( dialog ) {
	this.yPos = 0;
	this.xPos = 0;
	this.dialog = dialog;
	this.defaultAction = '';
	
	// IE Work Arounds
	this.getScroll = function() {
		if (self.pageYOffset) {
			this.yPos = self.pageYOffset;
		} else if (document.documentElement && document.documentElement.scrollTop){
			this.yPos = document.documentElement.scrollTop; 
		} else if (document.body) {
			this.yPos = document.body.scrollTop;
		}
	};
	this.setScroll = function(x, y){
		window.scrollTo(x, y); 
	};
	this.prepareIE = function(height, overflow){
		var bod = document.getElementsByTagName('body')[0];
		bod.style.height = height;
		bod.style.overflow = overflow;

		var htm = document.getElementsByTagName('html')[0];
		htm.style.height = height;
		htm.style.overflow = overflow; 
	};
	this.hideSelects = function(visibility){
		selects = document.getElementsByTagName('select');
		for(i = 0; i < selects.length; i++) {
			selects[i].style.visibility = visibility;
		}
	};
	// END OF IE Work Arounds
	this.show = function() {
		if( !this.visible ) {
			if (browser == 'Internet Explorer'){
				this.getScroll();
				this.prepareIE('100%', 'hidden');
				this.setScroll(0,0);
				this.hideSelects('hidden');
			}
			this.visible = true;
			document.getElementById(this.dialog + "Wrapper").style.display = "block";
			document.getElementById(this.dialog + "Content").style.display = "block";
			if( this.defaultAction ) {
				DefaultAction(this.defaultAction);
			}
		}
	};
	this.hide = function() {
		if( this.visible ) {
			if (browser == "Internet Explorer"){
				this.setScroll(0,this.yPos);
				this.prepareIE("auto", "auto");
				this.hideSelects("visible");
			}
			document.getElementById(this.dialog + "Wrapper").style.display = "none";
			document.getElementById(this.dialog + "Content").style.display = "none";
			this.visible = false;
		} 
	};
	this.setDefaultAction = function( action ) {
		this.defaultAction = action;
	};
};

var TranslationDictionary = new Object();
function RegisterTranslation( k, v ) {
	TranslationDictionary[k] = v;
}
function I(k) {
	if( TranslationDictionary[k] ) {
		return TranslationDictionary[k];
	}
	return k;
}

function wfStringExpand( format ) {
	var i = 0;
	
	for( i = 0; i < 8; i++ ) {
		var o = new RegExp('{(' + i + ')(:(.*?))?}', 'g');
		var after = format.replace(o, arguments[i+1]);
		if( after == format ) {
			break;
		} else {
			format = after;
		}
	}
	return format;
}
function extractEmailAddresses( text ) {
	var r = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
	if( r ) {
		return r;
	}
	return [];
}

function navigateToLocation( url ) {
	if( browser == 'Internet Explorer' /* && version == '7' */ ) {
		var element = document.createElement('a');
		element.href = url;
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
	} else {
		document.location.href = url;
	}
}

registerLoadFunction( function() { getBrowserInfo(); });
