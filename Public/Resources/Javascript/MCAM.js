
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

function MCAM() { // Multiple Channel AJAX Mechanism
	this.requester = null;
	this.handlers = new Array();
	this.dirtyList = new Array();
	this._dirtyList = new Array();
	this.callbacks = new Array();
	this.url = uriForCurrentAction();

	this.requestObject = function() {
		try { 
			return new XMLHttpRequest(); 
		} catch (error) { 
			try { 
				return new ActiveXObject("Microsoft.XMLHTTP"); 
			} catch (error) {
				return null;
			}
		}
		return null;
	};
	this.registerType = function( handlerType, handler ) {
		this.handlers[handlerType] = handler;
	};
	this.registerCallback = function( requestName, handler ) {
		this.callbacks[requestName] = handler;
	};
	// Parses an XJSON data item. XJSON is a completely non-standard
	// XML format with roughly the expressive power of JSON: <object>,
	// <array>, <string>, <number> and <boolean> tags behave as you would
	// expect. Arbitrary XML data can be added using <xml> or <html> tags
	// (which are currently synonymous with one another).
	//
	// data ::= <string> string </string>
	//		| <number> number-as-string </number>
	//		| <boolean> true-or-false </boolean>
	//		| <null />
	//		| <array> data ... </array>
	//		| <object> <field1> data </field1> <field2> data </field2> ... </object>
	//		| <html> any ... </html>
	//		| <xml> any ... </xml>
	//
	// Lylux uses this format for two reasons:
	//   - no need for extra rendering code on the server
	//	 (just like outputting a web page)
	//   - easy to embed HTML data (all the parsing is done for free)

	this.parseXjson = function (node) {

		var ans = null;

		switch (node.tagName) {
			case "string":
				ans = node.textContent;
				break;

			case "number":
				ans = parseFloat (node.textContent);
				break;

			case "boolean":
				ans = node.textContent == "true" ? true : false;
				break;

			case "null":
				ans = null;
				break;

			case "array":
				ans = [];
				unlib.forEach (function (child) {
					if (child.tagName) {
						ans [ans.length] = this.parseXjson(child);
					}
				}, node.childNodes);
				break;
			case "object":
				ans = {};
				unlib.forEach (function (child) {
					if(child.tagName) {
						var name = child.tagName;

						// Skip text nodes to find the first child element:
						var grandchild = child.firstChild;
						while (!grandchild.tagName) {
							grandchild = grandchild.nextSibling;
						}

						ans [name] = this.parseXjson (grandchild);
					}
				}, node.childNodes);
				break;

			case "html":
			case "xml":
				ans = node.childNodes;
				break

			default:
				throw ["Unrecognised XJSON data type", node];
		}
		return ans;
	};
	this.handleChannel = function( node ) {
		var id = '';
		var type = '';
		var content = '';
		var i = 0;

		for( i = 0; i < node.childNodes.length; i++ ) {
			switch( node.childNodes[i].tagName ) {
				case 'id':
					id = node.childNodes[i].firstChild.nodeValue;
					break;
				case 'type':
					type = node.childNodes[i].firstChild.nodeValue;
					break;
				case 'content':
					content = node.childNodes[i];
					break;
			}
		}
		
		try {
			return this.handlers[type]( id, type, content );
		} catch( e ) {
			return false;
		}
	};
	this.handleEvent = function() {
		switch( this.requester.readyState ) {
			case 4: {
				if( this.requester.status == 200 ) {
					var i = 0, lastChannel = 0;
					var successful = true;
					try {
						var root = this.requester.responseXML.firstChild;
						if( this.requester.responseXML.documentElement )
							root = this.requester.responseXML.documentElement;
						for( i = 0; i < root.childNodes.length; i++ ) {
							lastChannel = 0;
							if( root.childNodes[i].tagName == 'channel' && !this.handleChannel( root.childNodes[i] ) && successful ) {
								successful = false;
								break;
							}
						}
					} catch ( e ) {
						alert( 'Error Decoding MCAM Packet: (channel #' + lastChannel + ')\n' + e + '\n' + this.requester.responseText );
					}
					if( !successful ) {
						alert( 'Error Decoding MCAM Packet:\n' + this.requester.responseText );
					}
				} else {
					alert('All going wrong -> ' + this.requester.status + ' : ' + this.url);
				}
				this.dirtyList = new Array();
				this._dirtyList = new Array();
				break;
			}
		}
	};
	this.registerDirtyComponent = function ( id ) {
		this.dirtyList.push(id);
	};
	this.setComponentIsDirty = function( object ) {
		this._dirtyList.push( object );
	};
	this.toggleLoading = function( onoff) {
		var node = document.getElementById('mcam_status');
		if( node ) {
			if( onoff ) {
				var s = windowSize();
				node.style.display = 'block';
				node.style.top = '5px';
				node.style.left = (s[0] - node.offsetWidth - 10) + 'px';
			}
			else
				node.style.display = 'none';
		}
	}
	this.fireBackgroundEvent = function( component, event_type, extra ) {
		var url = this.url;
		var self = this;
		var parameters = '';
		var i = 0;
		
		/* Old lists */
		for( i = 0; i < this.dirtyList.length; i++ ) {
			var nodeid = this.dirtyList[i];
			var node = document.getElementById(nodeid);
			if( node && IsValidFormComponent(node) ) {
				parameters += SerializeFormComponent( nodeid, node );
			}
		}
		/* New list */
		for( i = 0; i < this._dirtyList.length; i++ ) {
			parameters += '&' + this._dirtyList[i].submission();
			this._dirtyList[i].setClean();
		}
		this.toggleLoading(true);
		this.requester = this.requestObject();
		this.requester.open( "POST", url ); 
		this.requester.setRequestHeader( 'Content-Type','application/x-www-form-urlencoded' );
		this.requester.onreadystatechange = function() { 
			self.toggleLoading(false);
			self.handleEvent(); 
		};
		this.requester.send(  'uieventcomponent='+ component +
								'&uieventdata=' + event_type +
								'&uieventextra=' + encodeURIComponent(extra) +
								parameters );
	};
	this.fireForegroundEvent = function( component, event_type, extra ) {
		submitComponentForm( component, event_type, extra );
	};
	this.setTargetURL = function( url ) {
		this.url = url;
	};
	this.fireReplaceRequest = function( request, target, new_parameters ) {
		this.fireReplaceRequestWithCallback( request, null, target, new_parameters );
	};
	this.fireCallbackRequest = function( request, callback, new_parameters ) {
		this.fireReplaceRequestWithCallback( request, callback, '', new_parameters );
	};
	this.createProgressDiv = function( node, label ) {
		var pos = findPos(node);
		var div = document.createElement('div');
		div.innerHTML = '<img src="' + uriForServerImageResource('loading_animation_liferay.gif') + '" />';
		div.id = label + '_status';
		div.style.display = 'block';
		div.style.position = 'absolute';
		div.style.zIndex = 100;
		div.style.left = (pos[0] + node.offsetWidth - 70) + 'px';
		div.style.top = pos[1] + 'px';
		return div;
	};
	this.fireReplaceRequestWithCallback = function( request, callback, target, new_parameters ) {
		var url = this.url + '/-/MCAM/' + request;
		var self = this;
		var parameters = '';
		var i = 0;

		for( i = 0; i < this.dirtyList.length; i++ ) {
			var nodeid = this.dirtyList[i];
			var node = document.getElementById(nodeid);
			if( node && IsValidFormComponent(node) ) {
				parameters += SerializeFormComponent( nodeid, node );
			}
		}

		for( key in new_parameters ) {
			parameters += '&' + key + "=" + encodeURIComponent(new_parameters[key]);
		}
		
		this.toggleLoading(true);
		this.requester = this.requestObject();
		this.requester.open( "POST", url ); 
		this.requester.setRequestHeader( 'Content-Type','application/x-www-form-urlencoded' );
		this.requester.onreadystatechange = function() { 
			self.toggleLoading(false);
			self.handleEvent(); 
		};

		var status_div;
		if( target != '' ) {
			var target_node = document.getElementById(target);
			status_div = this.createProgressDiv( target_node, target );
			wfinsertAdjacentElement( target_node, "afterEnd", status_div );
		}
		this.registerCallback( request, function( id, type, content ) {
			if( callback )
				callback( (content.firstChild ? content.firstChild.nodeValue : '') );
			if( target ) {
				status_div.parentNode.removeChild(status_div);
				return self.handlers['SetContent']( target, '', content );
			}
			return true;
		});
		
		this.requester.send( parameters );
	};
	this.componentRequest = function( c, r ) {
		return '' + c + '.' + r;
	};
	/*** SETUP ***/
	var self = this;
	this.registerType( 'Result', function( id, type, content ) {
		try {
			return self.callbacks[id]( id, type, content );
		} catch(e) {
			return false;
		}
	});
	this.registerType( 'Replace', function( id, type, content ) { 
		var node = document.getElementById(id);
		if( node ) {
			if( content.firstChild )
				wfinsertAdjacentHTML( node, 'replace', content.firstChild.nodeValue );
			else
				node.parentNode.removeChild( node );
			return true;
		} 
		return false;
	} );
	this.registerType( 'SetContent', function( id, type, content ) {
		var node = document.getElementById(id);
		if( node ) {
			node.innerHTML = '';
			if( content.firstChild )
				wfinsertAdjacentHTML( node, 'beforeEnd', content.firstChild.nodeValue );
			return true;
		}
		return false;
	});
	this.registerType( 'SetValue', function( id, type, content ) {
		var node = document.getElementById(id);
		if( node ) {
			document.getElementById(id).value = content.firstChild.nodeValue;
			return true;
		}
		return false;
	});
	this.registerType( 'Script', function( id, type, content ) {
		try {
			eval( content.firstChild.nodeValue );
			return true;
		} catch( e ) {
			return false;
		}
	});
	this.registerType( 'Error', function( id, type, content ) {
		var errorMessage = content.firstChild.nodeValue;
		alert( 'MCAM.Error: ' + errorMessage );
		return true;
	});
};

var mcam = new MCAM();

registerLoadFunction(function() {
	registerLoadFunction(function() {
		var s = windowSize();
		var n = document.createElement('div');
		n.id = 'mcam_status';
		n.style.top = '5px';
		n.style.left = (s[0] - 95 - 10) + 'px';
		n.style.display = 'none';
		n.style.width = '160px';
		n.style.backgroundColor = '#FFF';
		n.style.border = '2px dashed #000';
		n.style.padding = '5px';
		n.style.color = '#33F';
		n.style.position = 'absolute';
		n.style.zIndex = 100;
		n.innerHTML = 'Loading &middot; <img src="' + uriForServerImageResource('loading_animation_liferay.gif') + '" />';
		wfinsertAdjacentElement( document.getElementsByName('uicomponentform')[0], "afterEnd", n ); 
	});
});