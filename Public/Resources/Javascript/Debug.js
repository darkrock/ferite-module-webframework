var WFDebugCurrentDivID = 0;
var WFDebugOutputCount = 0;
var WFDebugComponentCount = 0;
var WFDebugTotalComponentCount = 0;

function AddDebugOutput( location, line, brief, message ) {
	var node = document.getElementById('WFDebugDivContents');
	if( node ) {
		var r = new RegExp('\.page\.fe$');
		var prefix = ( r.test(location) ? 'WFDebugSpecial' : 'WFDebugNormal');
		if( message != '' ) {
			node.innerHTML = node.innerHTML + 
			'<div id="WFDebugDiv'+ WFDebugCurrentDivID +'" class="' + prefix + '" style="cursor:pointer;" onclick="ToggleDebugDivContents(\'WFDebugDiv'+ WFDebugCurrentDivID + 'Contents\'); return false">' + 
				location + ':' + line + ' &middot; <b><u>' + brief + '</u></b>' +
				'<div id="WFDebugDiv'+ WFDebugCurrentDivID +'Contents" class="WFDebugDivContents">' + message + '</div>' + 
			'</div>';
			WFDebugCurrentDivID++;
		} else {
			node.innerHTML = node.innerHTML + '<div class="' + prefix + '">' + location + ':' + line + ' &middot; ' + brief + '</div>';			
		}
		document.getElementById('WFDebugDivContentsCount').innerHTML = '(' + ++WFDebugOutputCount + ')';
	}
}
function HighlightNode (id) {
	var node = document.getElementById(id)
	if( node.hasBeenHighlighted ) {
		if( node.previousBorder )
			node.style.border = node.previousBorder;
		else
			node.style.border = '';
		node.hasBeenHighlighted = false;
	} else {
		node.previousBorder = node.style.border;
		node.style.border = '2px solid #F00';
		node.hasBeenHighlighted = true;
	}
}
function AddDebugComponent ( id, type, nodehighlight, container ) {
	var node = document.getElementById('WFDebugComponentContents');
	if( node ) {
		var text = '';
		text += '<div>';
		text += id + ' : ' + 
				type + ( container ? ' : (<i>Container</i>)' : '' ) + 
				' &middot; ';
		if( _(id) ) {
			text += ' <a href="#" onclick="_(\'' + nodehighlight + '\').toggleHighlight(); return false">Toggle Component Highlight</a>';
		} else {
			text += (byId(nodehighlight) ?
					' <a href="#" onclick="HighlightNode(\'' + nodehighlight + '\'); return false">Toggle Highlight</a>' : 
					'Not Visible (or unable to find component node <i>' + nodehighlight + '</i>)' );
		}
		text += '</div>';
		text += node.innerHTML;
		node.innerHTML = text;
		WFDebugTotalComponentCount++;	
		if( document.getElementById(nodehighlight) )
			++WFDebugComponentCount;
		document.getElementById('WFDebugComponentContentsCount').innerHTML = '(' + WFDebugComponentCount + ' / ' + WFDebugTotalComponentCount + ')';
	}
}
function ToggleDebugDivContents( nodeid ) {
	var node = document.getElementById(nodeid);
	if( node.style.display == 'none' || node.style.display == '' )
		node.style.display = 'block';
	else
		node.style.display = 'none';
}