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