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

///////////////////////////////////////////////////////////
// www.fortochka.com
// Alexander Babichev 2004 Copyright
// Hacked to be objectised and what not by ctr 2006
// this script is free for private use "as is"
// under the condition:
// the copyright notice should be left unchanged.
////////////////////////////////////////////////////////////
function CalendarFormat( human, seconds ) {
	if( seconds ) {
		var date = new Date();
		date.setTime((seconds + (date.getTimezoneOffset() * 60)) * 1000);
		var day = date.getDate();
		var month = (date.getMonth() + 1);
		if( day < 10 ) 
			day = '0' + day;
		if( month < 10 )
			month = '0' + month;
		human.value = '' + date.getFullYear() + '/' + month + '/' + day;
		return true;
	}
	return false;
}		

function Calendar( id, start ) {
	this.id = id;
	this.startDate = start;
	this.dayRef = new Array();
	
	this.maxDays = function (mm, yyyy) {
		var mDay;
		if((mm == 3) || (mm == 5) || (mm == 8) || (mm == 10)){ 
			mDay = 30;
		}
		else{
			mDay = 31;
			if(mm == 1){
				if (yyyy/4 - parseInt(yyyy/4) != 0){
					mDay = 28;
				}
				else{
					mDay = 29;
				}
			}
		}
		return mDay; 
	};
	
	this.changeBg = function (id, count) {
		var node = window.opener.document.getElementById(this.id);
		var human = window.opener.document.getElementById(this.id + 'Human');
		if( CalendarFormat( human, this.dayRef[count] ) ) {
			if (document.getElementById(id).style.backgroundColor != "yellow"){
				document.getElementById(id).style.backgroundColor = "yellow"
			}
			else{
				document.getElementById(id).style.backgroundColor = "#ffffff"
			}
			node.value = '' + this.dayRef[count];
			window.setTimeout('window.close()',100);
		}
	}
	
	this.writeCalendar = function(){
		var timezoneDate = new Date();
		var timezoneOffset = (timezoneDate.getTimezoneOffset() * 60); // This is given in minutes, so we need to multiply by 60
		var now = new Date();
		if( this.startDate > 0 )
			now.setTime((this.startDate + timezoneOffset) * 1000);
		
		var dd = now.getDate();
		var mm = now.getMonth();
		var dow = now.getDay();
		var yyyy = now.getFullYear();
		
		var arrM = new Array(I('January'),I('February'),I('March'),I('April'),I('May'),I('June'),I('July'),I('August'),I('September'),I('October'),I('November'),I('December'));
		var arrY = new Array();
		for (ii=0;ii<=8;ii++){
			arrY[ii] = yyyy + (ii - 4);
		}
		var arrD = new Array(I('Sun'),I('Mon'),I('Tue'),I('Wed'),I('Thu'),I('Fri'),I('Sat'));
		
		var text = "";
		text += "<table border=1>";
		
		text += "<tr><td>";
		text += "<table width=100%><tr>";
		text += "<td align=left>";
		text += "<select id=\"SelectedMonth\" onChange='" + this.id + ".changeCal()'>";
		for (ii=0;ii<=11;ii++){
			if (ii==mm){
				text += "<option value= " + ii + " Selected>" + arrM[ii] + "</option>";
			}
			else{
				text += "<option value= " + ii + ">" + arrM[ii] + "</option>";
			}
		}
		text += "</select>";
		text += "</td>";
		
		text += "<td align=right>";
		text += "<select id=\"SelectedYear\" onChange='" + this.id + ".changeCal()'>";
		for (ii=0;ii<arrY.length;ii++){
			if (arrY[ii]==yyyy){
				text += "<option value= " + arrY[ii] + " Selected>" + arrY[ii] + "</option>";
			}
			else{		
				text += "<option value= " + arrY[ii] + ">" + arrY[ii] + "</option>";
			}
		}
		text += "</select>";
		text += "</td>";
		text += "</tr></table>";
		text += "</td></tr>";
		
		text += "<tr><td>";
		text += "<table border=1>";
		text += "<tr>";
		for (ii=0;ii<=6;ii++){
			text += "<td align=center><span class=wfCalendarLabel>" + arrD[ii] + "</span></td>";
		}
		text += "</tr>";
		
		aa = 0;

		for (kk=0;kk<=5;kk++){
			text += "<tr>";
			for (ii=0;ii<=6;ii++){
				text += "<td align=center width=100%><span id=sp" + aa + " onClick='" + this.id + ".changeBg(this.id," + aa + ")' style=\"cursor:pointer;\">1</span></td>";
				aa += 1;
			}
			text += "</tr>";
		}
		text += "</table>";
		text += "</td></tr>";
		text += "</table>";
		text += "</form>";
		document.getElementById('CalendarContainer').innerHTML = text;
		this.changeCal();
	};
	
	this.changeCal = function (){
		var timezoneDate = new Date();
		var timezoneOffset = (timezoneDate.getTimezoneOffset() * 60); // This is given in minutes, so we need to multiply by 60
		var now = new Date();
		if( this.startDate > 0 )
			now.setTime((this.startDate + timezoneOffset) * 1000);

		
		var dd = now.getDate();
		var mm = now.getMonth();
		var dow = now.getDay();
		var yyyy = now.getFullYear();
		
		var currM = parseInt(document.getElementById('SelectedMonth').value);
		var prevM;
		
		if (currM!=0){
			prevM = currM - 1;
		}
		else{
			prevM = 11;
		}
		
		var currY = parseInt(document.getElementById('SelectedYear').value);
		
		var mmyyyy = new Date();
		mmyyyy.setFullYear(currY,currM,1);
		mmyyyy.setHours(0);
		mmyyyy.setMinutes(0);
		mmyyyy.setSeconds(0);
		
		var day1 = mmyyyy.getDay();
		if (day1 == 0){
			day1 = 7
		}
		
		var arrN = new Array(41);
		var aa;
		
		for (ii=0;ii<day1;ii++){
			arrN[ii] = this.maxDays((prevM),currY) - day1 + ii + 1;
		}
		
		this.dayRef = new Array();
	
		aa = 1;
		for( ii = day1; ii <= (day1 + this.maxDays(currM,currY) - 1); ii++ ) {
			this.dayRef[ii] = Math.round(mmyyyy.getTime() / 1000) + ((aa - 1) * 86400) - timezoneOffset; // We want the dates to be in GMT
			arrN[ii] = aa;
			aa += 1;
		}
		
		aa = 1;
		for (ii=day1+this.maxDays(currM,currY);ii<=41;ii++){
			arrN[ii] = aa;
			aa += 1;
		}
		
		for (ii=0;ii<=41;ii++){
			document.getElementById('sp'+ii).style.backgroundColor = "#FFFFFF";
		}
		
		var dCount = 0;
		for (ii=0;ii<=41;ii++){		
			if (((ii<7)&&(arrN[ii]>20))||((ii>27)&&(arrN[ii]<20))){
				document.getElementById('sp'+ii).innerHTML = arrN[ii];
				document.getElementById('sp'+ii).className = "wfC3";
			}
			else{
				document.getElementById('sp'+ii).innerHTML = arrN[ii];
				if ((dCount==0)||(dCount==6)){
					document.getElementById('sp'+ii).className = "wfC2";
				}
				else{
					document.getElementById('sp' + ii).className = "wfC1";
				}
				if ((arrN[ii]==dd)&&(mm==currM)&&(yyyy==currY)){
					document.getElementById('sp'+ii).style.backgroundColor="#90EE90";
				}
			}
			dCount += 1;
			if (dCount>6){
				dCount=0;
			}
		}
	}
	
	this.writeCalendar();
}

function CalendarPopup( id, start ) {
	var w = window.open('','Window' + id, 'toolbar=no,width=250,height=250,menubar=no');
	w.document.write('<html><head><title>Calendar</title><script src="' + WFServerURI + 'Resources/Javascript/General.js" type="text/javascript"></script>' +
					 (WFI18NCatalog ? '<script src="' + WFServerURI + 'Resources/Javascript/Generated/' + WFApplicationName + '.translation.' + WFI18NCatalog + '.js" type="text/javascript"></script>' : '') +
					 '<script type="text/javascript" language="javascript1.5">' +
					 '   var ' + id + ';' +
					 '   function init(){ ' + id + ' = new Calendar("' + id + '",' + start + '); }' +
					 '</script>' +
					 '<link rel="stylesheet" type="text/css" href="' + WFServerURI + 'Resources/CSS/DefaultGUIKit.css"></head>' +
					 '<body onload="init();" style="margin:0px;">' + 
						'<div style="text-align:center; margin-top:5px;" id="CalendarContainer"></div>' +
					 '</body></html>');
	w.document.close();
}


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
		$('uicomponentform').appendChild(element);
		element.click();
	} else {
		document.location.href = url;
	}
}

registerLoadFunction( function() { getBrowserInfo(); });
