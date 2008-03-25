
function getAJAXObject() {
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
}
function PostAJAXEvent( r, url, id, extra, parameters ) {
	r.open("POST", url); 
	r.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
	r.send('uieventcomponent='+id+'&uieventdata=__GUIKit__.EvAJAX' + getViewState() + '&uieventextra='+encodeURIComponent(extra)+parameters);
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

function AJAXProgressBar_IntervalHandler( componentID ) {
    var self = window.AJAXProgressBarObjects[componentID];
    self.fireUpdate();
}

function AJAXProgressBar( componentID, updateUrl, showProgress, initialValue, updateFrequency ) {

    this.componentID = componentID;
    this.updateUrl = updateUrl;
    this.showProgress = showProgress;
    this.updateFrequency = updateFrequency;
    this.requester = null;
    this.value = initialValue;
    
    if( window.AJAXProgressBarObjects == null )
        window.AJAXProgressBarObjects = new Array();
    window.AJAXProgressBarObjects[componentID] = this;
    
    this.intervalHandler = AJAXProgressBar_IntervalHandler;
    this.timerID = window.setInterval( 'AJAXProgressBar_IntervalHandler(\'' + componentID + '\');', this.updateFrequency );
    
    this.renderComponent = function() {
        var node = document.getElementById(this.componentID);
        var progresscode = '<table cellpadding=1 cellspacing=0><tr><td style="background: #000"><table cellpadding=0 cellspacing=0><tr>';
 
        
        if( this.value > 0 )
            progresscode += '<td style="background:#fff;background-image: url(\''+uriForServerImageResource('blue.jpg')+'\');color: #fff;height:25px;width:'+(this.value * 2)+'px;" align=right><img src="'+uriForServerImageResource('1x1trans.gif')+'" /></td>';
            
        if( this.value < 100 )
            progresscode += '<td style="background:#fff;background-image: url(\''+uriForServerImageResource('brown.jpg')+'\');color:#fff;height:25px;width:'+((100 - this.value) * 2)+'px;" align=right><img src="'+uriForServerImageResource('1x1trans.gif')+'" /></td>';
            
        if( this.showProgress == true )
            progresscode += '<td style="background:#fff;background-image: url(\''+uriForServerImageResource('brown.jpg')+'\');height:25px;width:50px;" align="center">'+this.value+'%</td>';
            
        progresscode += '</tr></table></td></tr></table>';
        node.innerHTML = progresscode;
    };
    
    this.updateRecieved = function () {
        if( this.requester.readyState == 4 ) {
            if( this.requester.status == 200 ) {
                this.value = parseInt( this.requester.responseText, 10 );
				this.renderComponent();
            } else {
                this.value = 0;
            }
			this.requester = null;
        } 
        if( this.value == 100 ) {
            window.clearInterval( this.timerID );
        }
    };
    
    this.fireUpdate = function () {		
		var query = '';
		
        /* Check for running connections */ 
        if( this.requester == null ) {
			this.requester = getAJAXObject();
			var self = this;
			this.requester.onreadystatechange = function() {
				self.updateRecieved(); 
			};
			this.requester.open("POST", this.updateUrl); 
			this.requester.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
			
			query = 'uieventcomponent='+this.componentID+'&uieventdata=__GUIKit__.EvAJAX' + getViewState() + '&uieventextra='+this.value;
			this.requester.send(query);
		}
		return true;
	};
    
    this.renderComponent();
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

function AJAXMultipleEditLabel( componentID, statusName, updateUrl, width, components ) {

	if( components[components.length - 1] == '' )
		components.pop();
	
	this.componentID = componentID;
	this.statusName = statusName;
	this.updateUrl = updateUrl;
	this.width = width;
	this.components = components;
	this.previousValue = new Array();
	this.requester = null;
	
	this.showEditBoxes = function() {
		var display = '';
		var status = document.getElementById(this.statusName);
		status.innerHTML = '';
		
		// Go through all the edit boxes and open them out
		for( i = 0; i < this.components.length; i++ ) {
			var label = document.getElementById(this.components[i]);
			var parent = document.getElementById(this.components[i] + 'Parent');
			var realValue = label.innerHTML;

			this.previousValue[i] = label.innerHTML;
			parent.onclick = function() { return false; };
			label.onclick = function() { return false; };
			label.innerHTML = '<input style="margin:0px" autocomplete="off" id="'+this.componentID+this.components[i]+'" type="text" value="' + realValue + '">';
			
			var self = this;
			var edit = document.getElementById( this.componentID + this.components[i] );
			edit.style.width = '98%';

			if( i == 0 )
				edit.focus();
			
			if( i < (this.components.length - 1) ) {
				// Setup the enter key onto the next edit box
				var next = self.componentID + this.components[i+1];
				edit.onkeypress = function(e) {
					if( captureEnterKey(e) ) {
						var componentName = this.id.substring( self.componentID.length, this.id.length );
						for( i = 0; i < (self.components[i].length - 1); i++ ) {
							if( self.components[i] == componentName ) {
								document.getElementById( self.componentID + self.components[i+1] ).focus();
								return false;
							}
						}
					}
					return true;
				};
			} else {
				// Last edit box 
				edit.onkeypress = function(e) {
					if( captureEnterKey(e) ) {
						self.hideEditBoxes(true);
						return false;
					}
					return true;
				};
			}
		}
		
		document.getElementById( this.componentID + 'ButtonBox' ).style.display = 'block';
	};
	
	this.instateClickHandlers = function( restore_values ) {
		var self = this;
		var clickHandler = function() { self.showEditBoxes(); }; 
		
		for( i = 0; i < this.components.length; i++ ) {
			var label = document.getElementById( this.components[i] );
			var parent = document.getElementById( this.components[i] + 'Parent' );
			parent.className = 'wfAJAXLabel';
			parent.onclick = clickHandler;
			parent.style.cursor = 'pointer';
			if( restore_values ) {
				label.innerHTML = this.previousValue[i];
			}
		}		
	};
	
	this.requesterAction = function() {
        if( this.requester.readyState == 4 ) {
            if( this.requester.status == 200 ) {
                var self = this;
				if( this.statusName != '' ) {
					var status = document.getElementById(this.statusName);
					var self = this;
					// Set the new status
					status.innerHTML = this.requester.responseText;
					// Revoke it
					globalTickerManager.registerTimeout( function() {
						var status = document.getElementById(self.statusName);
						status.innerHTML = '';
					}, 5 );
				}
				this.instateClickHandlers(true);			
				for( i = 0; i < this.components.length; i++ ) {
					var component_name = this.components[i] + 'Parent';
					var component = document.getElementById(component_name);
					// Set the new class
					component.className = 'wfAJAXLabelJustUpdated';
					// Revoke it
					globalTickerManager.registerTimeout( function() {
						var node = document.getElementById(component_name);
						component.className = 'wfAJAXLabel';
					}, 5 );
				}
                return true;
            } else {
				var status = document.getElementById(this.statusName);
                status.innerHTML = 'Unable to get update edit field';
                status.style.background = '#faa';
                return false;
            }
			StatusStopProcessing();
        }
        return true;
    };	
	
	this.hideEditBoxes = function( submit_values ) {
		document.getElementById( this.componentID + 'ButtonBox' ).style.display = 'none';
		
		if( submit_values ) {
			var extra = '';
			var query_string = '';
			var self = this;
		
			StatusSetProcessing( 'Updating...' );
		
			if( this.components.length == 1 )
				extra = document.getElementById( this.componentID+this.components[0] ).value;
			// Lets pick up the values
			for( i = 0; i < this.components.length; i++ ) {
				var editContainer = document.getElementById( this.components[i] );
				var editBox = document.getElementById( this.componentID+this.components[i] );
				this.previousValue[i] = editBox.value;
				query_string += '&' + SerializeFormComponent(this.components[i], editBox);
				editContainer.innerHTML = this.previousValue[i];
			}
			this.requester = getAJAXObject();
			this.requester.onreadystatechange = function() {
				self.requesterAction(); 
			};
			PostAJAXEvent( this.requester, this.updateUrl, this.componentID, extra, query_string );
		} else
			this.instateClickHandlers(true);			
	};
	
	this.instateClickHandlers(false);
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

function AJAXPopupButton( componentID, statusName, updateUrl, width, items ) {

	if( items[items.length - 1][1] == '' )
		items.pop();
	
	this.componentID = componentID;
	this.statusName = statusName;
	this.updateUrl = updateUrl;
	this.width = width;
	this.items = items;
	this.previousValue = '';
	this.requester = null;
	
	this.showPopup = function() {
		var display = '';
		var status = document.getElementById(this.statusName);
		status.innerHTML = '';
		
		var label = document.getElementById(this.componentID);
		var parent = document.getElementById(this.componentID + 'Parent');
		var realValue = label.innerHTML;

		this.previousValue = label.innerHTML;
		parent.onclick = function() { return false; };
		label.onclick = function() { return false; };
		
		var render = '<select style="margin:0px" autocomplete="off" id="' + this.componentID + this.componentID + '">';
		for( i = 0; i < this.items.length; i++ ) {
			var selected = '';
			if( (realValue == '' && this.items[i][2] == true) || (realValue == this.items[i][1]) )
				selected = "selected";
			render += '<option ' + selected + ' value="' + this.items[i][0] + '">' + this.items[i][1] + '</option>';
		}
		render += '</select>';
		label.innerHTML = render;
		
		var self = this;
		var edit = document.getElementById( this.componentID+this.componentID );
		edit.style.width = '98%';
		
		document.getElementById( this.componentID + 'ButtonBox' ).style.display = 'block';
	};
	
	this.instateClickHandlers = function( restore_values ) {
		var self = this;
		var clickHandler = function() { self.showPopup(); }; 
		
		var label = document.getElementById( this.componentID );
		var parent = document.getElementById( this.componentID + 'Parent' );
		parent.className = 'wfAJAXPopupButton';
		parent.onclick = clickHandler;
		parent.style.cursor = 'pointer';
		if( restore_values ) {
			label.innerHTML = this.previousValue;
		}
	};
	
	this.requesterAction = function() {
        if( this.requester.readyState == 4 ) {
            if( this.requester.status == 200 ) {
                var self = this;
				if( this.statusName != '' ) {
					var status = document.getElementById(this.statusName);
					var self = this;
					// Set the new status
					status.innerHTML = this.requester.responseText;
					// Revoke it
					globalTickerManager.registerTimeout( function() {
						var status = document.getElementById(self.statusName);
						status.innerHTML = '';
					}, 5 );
				}
				this.instateClickHandlers(true);
				var component_name = this.componentID + 'Parent';
				var component = document.getElementById(component_name);
				// Set the new class
				component.className = 'wfAJAXPopupButtonJustUpdated';
				// Revoke it
				globalTickerManager.registerTimeout( function() {
					var node = document.getElementById(component_name);
					component.className = 'wfAJAXPopupButton';
				}, 5 );
                return true;
            } else {
				var status = document.getElementById(this.statusName);
                status.innerHTML = 'Unable to get update popup field';
                status.style.background = '#faa';
                return false;
            }
			StatusStopProcessing();
        }
        return true;
    };	
	
	this.hidePopup = function( submit_values ) {
		document.getElementById( this.componentID + 'ButtonBox' ).style.display = 'none';
		
		if( submit_values ) {
			var extra = '';
			var self = this;
			var editBox = document.getElementById( this.componentID + this.componentID );
			
			StatusSetProcessing( 'Updating...' );
			this.previousValue = editBox.options[editBox.selectedIndex].text;
			this.requester = getAJAXObject();
			this.requester.onreadystatechange = function() { self.requesterAction(); };
			PostAJAXEvent( this.requester, this.updateUrl, this.componentID, extra, SerializeFormComponent(this.componentID, editBox) );
		} else
			this.instateClickHandlers(true);			
	};
	
	this.instateClickHandlers(false);
}
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var PrependContent = 1;
var ReplaceContent = 2;
var AppendContent = 3;
var ReplaceComplete = 4;
var DeleteContent = 5;
var InsertAfterContent = 6;

function FetchContent( replacestrategy, id, extra, url, parameters, oncomplete, target ) {
	
	this.replacestrategy = replacestrategy;
	this.id = id;
	this.target = target;
	this.extra = extra;
	this.url = url;
	this.parameters = parameters;
	this.oncomplete = oncomplete;
	
	var self = this;
	this.requesterAction = function() {
		switch( self.requester.readyState ) {
			case 1: {
				var contents = document.getElementById( self.id + 'Contents' );
				if( contents )
					contents.style.backgroundColor = '#cccccc';	
				break;
			}
			case 4: {
				if( self.requester.status == 200 ) {
					// Success
					var node = document.getElementById( this.target );
					if( node ) {
						switch( self.replacestrategy ) {
							case PrependContent: {
								wfinsertAdjacentHTML( node, 'beforeBegin', this.requester.responseText );
								break;
							}
							case ReplaceContent: {
								node.innerHTML = this.requester.responseText;
								break;
							}
							case AppendContent: {
								wfinsertAdjacentHTML( node, 'beforeEnd', this.requester.responseText );
								break;
							}
							case ReplaceComplete: {
								wfinsertAdjacentHTML( node, 'replace', this.requester.responseText );
								break;
							}
							case DeleteContent: {
								node.parentNode.removeChild(node);
								break;
							}
							case InsertAfterContent: {
								wfinsertAdjacentHTML( node, 'afterEnd', this.requester.responseText );
								break;
							}
						}
					}
					StatusStopProcessing();
					if( this.oncomplete )
						this.oncomplete();
				} else {
					// Failed
				}
				break;
			}
		}
	};
	
	var self = this;
	this.requester = getAJAXObject();
	this.requester.onreadystatechange = function() { self.requesterAction(); };
	StatusSetProcessing( 'Loading...' );
	PostAJAXEvent( this.requester, this.url, this.id, this.extra, this.parameters );
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

var ajaxListManagerLastStart;

function AJAXList( id, url, container, selectedid, style_class, on_change_function, retains_active_on_new, deleteTimeout ) {
	this.active = false;
	this.id = id;
	this.url = url;
	this.location = PrependContent;
	this.activeElement = 'Note';
	this.selectedID = selectedid;
	this.container = container;
	this.interval_id = 0;
	this.style_class = style_class;
	this.on_change_function = on_change_function;
	this.retains_active_on_new = retains_active_on_new;
	this.deleteTimeout = deleteTimeout;
	
	this.setLocation = function( loc ) {
		this.location = loc;
	};
	this.setActiveElement = function( ele ) {
		this.activeElement = ele;
	};
	this.action = function( variant, query, activeState, container ) {
		if( canSubmitData() ) {
			var self = this;
			new FetchContent( ReplaceContent, this.id, variant, this.url, query, 
							  function() {
								  self.HighLightSelected();
								  self.active = activeState;
								  var element = document.getElementById(self.activeElement);
								  if( element ) element.focus();
							  
								  if( document.getElementById('CurrentDuration') ) {
									  ajaxListManagerLastStart = new Date();
									  self.interval_id = window.setInterval('AJAXListManagerIncrementDuration()',1000);
								  }
							  
								  if( self.on_change_function != null )
									  self.on_change_function();
							  }, container );		
		}
	}
	this.ListToQuery = function ( list ) {
		var query = '';
		
		// Lets have some action
		for( var i = 0; i < list.length; i++ ) {
			var node = document.getElementById( list[i] );
			if( node ) {
				query += SerializeFormComponent(this.id + 'WFListValues[' + list[i] + ']', node);
				query += SerializeFormComponent(list[i], node);
			} 
		}
		return query;
	};
	this.HighLightSelected = function() {
		if( this.container != '' ) {
			var node = document.getElementById(this.selectedID);
			if( node ) {
				node.className = this.style_class + 'SelectedItem';		
			}
		}
	};

	this.New = function( variant, container, id, location, list ) {				
		if( this.active && this.retains_active_on_new ) {
			alert( 'There is already an active list element!' );
		} else {
			if( canSubmitData() ) {
				var self = this;
				var query = '&Identifier=' + encodeURIComponent(id) + '&Type=new-item' + this.ListToQuery(list);
				this.active = this.retains_active_on_new;
				new FetchContent( location, this.id, variant, this.url, query, 
								  function() {
									  if( document.getElementById('CurrentDuration') ) {
										  ajaxListManagerLastStart = new Date();
										  self.interval_id = window.setInterval('AJAXListManagerIncrementDuration()',1000);
									  }
									  if( self.on_change_function != null )
										  self.on_change_function();
									  var element = document.getElementById(self.activeElement);
									  if( element ) 
										  element.focus();
								  }, container );
			}
		}
	};
	this.Insert = function( variant, container, id, location, list ) {				
		if( this.active && this.retains_active_on_new ) {
			alert( 'There is already an active list element!' );
		} else {
			if( canSubmitData() ) {
				var self = this;
				var query = '&Identifier=' + encodeURIComponent(id) + '&Type=new-item' + this.ListToQuery(list);
				this.active = this.retains_active_on_new;
				new FetchContent( location, this.id, variant, this.url, query, 
								  function() {
									  if( document.getElementById('CurrentDuration') ) {
										  ajaxListManagerLastStart = new Date();
										  self.interval_id = window.setInterval('AJAXListManagerIncrementDuration()',1000);
									  }
									  if( self.on_change_function != null )
										  self.on_change_function();
									  var element = document.getElementById(self.activeElement);
									  if( element ) 
										  element.focus();
								  }, container );
			}
		}
	};
	this.Edit = function( variant, container, id ) {
		if( this.active && this.retains_active_on_new ) {
			alert( 'There is already an active list element!' );
		} else {
			var query = '&Identifier=' + encodeURIComponent(id) + '&Type=edit-item';
			this.active = this.retains_active_on_new;
			this.action( variant, query, false, container );
		}
	};
	this.Delete = function( variant, container, id ) {
		var agree = confirm( "Are you sure you wish to delete this item ?");
		if( agree ) {
			this.DeleteNoConfirmation( variant, container, id );
		}
	};
	this.DeleteNoConfirmation = function( variant, container, id ) {
		var self = this;
		var targetContainer = document.getElementById(this.container);
		if( targetContainer )
			targetContainer.innerHTML = '<p />';
		if( id == '' ) {
			var selectedIDNode = document.getElementById(this.id + 'SelectedID');
			id = selectedIDNode.value;
			container = this.selectedID;
		}
		var query = '&Identifier=' + encodeURIComponent(id) + '&Type=delete-item';
		new FetchContent( ReplaceComplete, this.id, variant, this.url, query, 
						  function() {
							  if( self.interval_id ) {
								  window.clearInterval(self.interval_id);
								  self.interval_id = 0;
							  }
							  if( self.on_change_function != null )
								  self.on_change_function();
							  globalTickerManager.registerTimeout( function() {
								  var node = document.getElementById(container);
								  if( node )
									  node.parentNode.removeChild(node);
							  }, self.deleteTimeout );
							  self.active = false;
						  }, container );
	};
	this.ConfirmWithCallBack = function( variant, container, id, list, callback ) {
		if( canSubmitData() ) {
			var self = this;
			var query = '&Identifier=' + encodeURIComponent(id) + '&Type=confirm-item' + this.ListToQuery(list);
			new FetchContent( ReplaceComplete, this.id, variant, this.url, query, 
							  function() {
								  self.HighLightSelected();
								  if( self.interval_id ) {
									  window.clearInterval(self.interval_id);
									  self.interval_id = 0;
								  }
								  if( self.on_change_function != null )
									  self.on_change_function();
								  if( self.container != '' )
									  self.Select( variant, container, id );
								  if( callback ) callback();
								  self.active = false;
							  }, container );
		}
	};
	this.Confirm = function( variant, container, id, list ) {
		return this.ConfirmWithCallBack( variant, container, id, list, null );
	};
	this.Cancel = function( variant, container, id ) {
		var query = '&Identifier=' + encodeURIComponent(id) + '&Type=cancel-item';
		var self = this;
		if( id == '' ) {
			new FetchContent( DeleteContent, this.id, variant, this.url, query, 
							  function() {
								  self.HighLightSelected();
								  if( self.interval_id ) {
									  window.clearInterval(self.interval_id);
									  self.interval_id = 0;
								  }
								  if( self.on_change_function != null )
									  self.on_change_function();
								  if( self.container != '' )
									  self.Select( variant, container, id );
								  self.active = false;
							  }, container );			
		} else {
			this.action( variant, query, false, container );
		}
	};
	this.Select = function( variant, container, id ) {
		var query = '&Identifier=' + encodeURIComponent(id) + '&Type=select-item';
		var self = this;
		var list = document.getElementById(this.id);
		var selectedIDNode = document.getElementById(this.id + 'SelectedID');
		
		selectedIDNode.value = id;
		if( this.selectedID != '' ) {
			var child = document.getElementById(this.selectedID);
			if( child ) {
			   child.className = this.style_class + 'Item';
			}
		}
		this.selectedID = container;
		new FetchContent( ReplaceContent, this.id, variant, this.url, query, 
						  function() {
							  self.HighLightSelected();
							  self.active = false;
						  }, this.container );			
	};
	this.Search = function( criteria, list ) {
		if( canSubmitData() ) {
			var query = '&Identifier=&Type=search-item&AJAXListSearchCriteria' + this.id + '=' + encodeURIComponent(criteria) + this.ListToQuery(list);
			var node = document.getElementById(this.id + 'SelectedID');
			if( node )
				node.parentNode.removeChild(node);
			self.active = false;
			new FetchContent( ReplaceComplete, this.id, '', this.url, query, null, this.id );		
		}
	};
}