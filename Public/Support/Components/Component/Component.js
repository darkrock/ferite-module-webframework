var WFComponentTypeRegistry = new Array();
var WFComponentInstanceRegistry = new Array();
var WFComponentStack = new Array();

function GetComponent( name ) {
	return WFComponentInstanceRegistry[name];
}
function _( name ) {
	return GetComponent(name);
}
function SetComponent( name, object ) {
	WFComponentInstanceRegistry[name] = object;
	object.bind();
	return object;
}

function ComponentOpen( name ) {
	WFComponentStack.push(name);
}
function ComponentClose( name ) {
	WFComponentStack.pop();
}

function SetupComponentVisual( self ) {
	self.setState('background.active', '#EEF');
	self.setState('foreground.active', '#000');
	self.applyHighlightColouring = function( node ) {
		node.style.backgroundColor = self.getState('background.active');
		node.style.color = self.getState('foreground.active');
	};
	self.setState('background.inactive', '#BBB');
	self.setState('foreground.inactive', '#353');
	self.applyLowlightColouring = function( node ) {
		node.style.backgroundColor = self.getState('background.inactive');
		node.style.color = self.getState('foreground.inactive');
	};
	self.setState('background.content', '#EEE');
	self.setState('foreground.content', '#393');
	self.applyContentColouring = function( node ) {
		node.style.borderTop = '5px solid ' + self.getState('background.active');
		node.style.backgroundColor = self.getState('background.content');
		node.style.color = self.getState('foreground.content');
	};
}
function Component( identifier ) {
	var self = this;
	
	self._identifier = identifier;
	self._container = '';
	self._target = identifier;
	self._highlight = false;
	self._enabled = true;
	self._defaultState = 'default';
	self._states = new Array();
	self._actions = new Array();
	self._children = new Array();
	self._active = false;
	self._updateOnActivate = true;
	self._formValue = 'FormValue_' + self._identifier;
	self._dirty = false;
		
	self.setClean = function() {
		self._dirty = false;
	};
	self.activate = function() {
		self._active = true;
		if( self._updateOnActivate ) {
			self.updateFormValue();
			self.updateVisual();
		}
	};
	self.active = function() {
		return self._active;
	};
	self.identifier = function() {
		return self._identifier;
	};
	self.target = function() {
		return self._target;
	};
	self.node = function() {
		return byId(self._target);
	};
	self.container = function() {
		return GetComponent(self._container);
	};
	self.attachChangeAction = function( node, target ) {
		if( node ) {
			node.style.cursor = 'pointer';
			node.onchange = function( event ) {
				return GetComponent(target).action('change', event);
			};
		}
	};
	self.disableSelection = function(element) {
		element.onselectstart = function() {
			return false;
		};
		element.unselectable = "on";
		element.style.MozUserSelect = "none";
		element.style.cursor = "default";
	}
	self.attachClickAction = function( node, target ) {
		return self.attachClickActionWithValue( node, target, null );
	};
	self.attachClickActionWithValue = function( node, target, value ) {
		if( node ) {
			node.style.cursor = 'pointer';
			node.onclick = function( event ) {
				return GetComponent(target).action('click', event, value);
			};
		}
	};
	self.bind = function() {
		self.attachClickAction( self.node(), self.identifier() );
	};
	self.registerChild = function( child ) {
		self._children.push(child);
	};
	self.action = function( action ) {
		if( self._enabled ) {
			try {
				handler = self._actions[action];
				if( handler ) {
					return handler.apply(self, Array.prototype.slice.apply(arguments, [1]));
				}
			} catch(e) {
				
			}
		}
	};
	self.getAction = function( action ) {
		return self._actions[action];
	};
	self.registerAction = function( action, handler ) {
		self._actions[action] = handler;
	};
	self.getState = function( state ) {
		return self._states[state];
	};
	self.propagateChange = function() {
		if( self._active ) {
			if( !self._dirty ) {
				self._dirty = true;
				mcam.setComponentIsDirty(self);
			}
			self.action('change');
		}
	};
	self.setState = function( state, value ) {
		if( self._states[state] != value ) {
			self._states[state] = value;
			if( self._active ) {
				self.updateFormValue();
				self.updateVisual();
			}
			self.propagateChange();
		}
	};
	self.flipState = function( state, left, right ) {
		(self.getState(state) == left ? self.setState(state, right) : self.setState(state, left));
	};
	self.setDefaultState = function( state ) {
		self._defaultState = state;
	};
	self.defaultState = function() {
		return self.getState(self._defaultState);
	};
	self.setEnabled = function( enable ) {
		if( self._enabled != enable ) {
			self._enabled = enable;
			if( self._enabled )
				self.enable();
			else
				self.disable();
		}
	};
	self.enable = function() {
		if( self._children.length ) {
			for( i = 0; i < self._children.length; i++ ) {
				self._children[i].enable();
			}	
		}
	};
	self.disable = function() {
		if( self._children.length ) {
			for( i = 0; i < self._children.length; i++ ) {
				self._children[i].disable();
			}
		}
	};
	self.setFormValueTarget = function( target ) {
		self._formValue = target;
	};
	self.formValue = function() {
		return self.getState(self._defaultState);
	};
	self.updateFormValue = function() {
		node = byId(self._formValue);
		if( node ) {
			node.value = self.formValue();
		}
	};
	self.submission = function() {
		return self._target + '=' + encodeURIComponent(self.formValue());
	};
	self.genericUpdateVisual = function() {

	};
	self.updateVisual = function() {
		self.genericUpdateVisual();
	};
	self.highlight = function() {
		self.node().style.border = '1px solid #F00';
	};
	self.lowlight = function() {
		self.node().style.border = '';
	};
	self.updateHighlight = function() {
		if( self.node() ) {
			if( self._highlight )
				self.highlight();
			else
				self.lowlight();
		}
	};
	self.toggleHighlight = function() {
		self._highlight = (self._highlight ? false : true);
		self.updateHighlight();
	};
	self.focus = function() {
		for( i = 0; i < self._children.length; i++ ) {
			if( self._children[i].focus() ) {
				return true;
			}
		}
		return false;
	};
	self.blur = function() {
		for( i = 0; i < self._children.length; i++ ) {
			self._children[i].blur();
		}
	};
	self.mouseCoordinates = function( event ) {
		if (event.pageX || event.pageY) {
			return {x:event.pageX, y:event.pageY};
		}
		else if (event.clientX || event.clientY) {
			var posX = event.clientX;
			var posY = event.clientY;
			if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
				posX += document.body.scrollLeft - document.body.clientLeft;
				posY += document.body.scrollTop - document.body.clientTop;
			}
			else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
				posX += document.documentElement.scrollLeft - document.documentElement.clientLeft;
				posY += document.documentElement.scrollTop - document.documentElement.clientTop;
			}
			return {x:posX, y:posY};

		}
	};
	self.fireCallbackRequest = function( name, callback, parameters ) {
		mcam.fireCallbackRequest( mcam.componentRequest(self.identifier(), name), callback, parameters );
	};
	self.setState('locked', false);
	self.lock = function() { self.setState('locked', true); }
	self.unlock = function() { self.setState('locked', false); }
	
	self.show = function() {
		if( self.node() ) {
			self.node().style.display = 'block';
		}
	};
	self.hide = function() {
		if( self.node() ) {
			self.node().style.display = 'none';
		}
	};
	
	
	self.defaultAction = function() {
		if( self.node() ) {
			self.node().focus();
		}
	};

	// Construction
	SetupComponentVisual( self );
	if( WFComponentStack.length > 0 ) {
		self._container = WFComponentStack[WFComponentStack.length - 1];
		self.container().registerChild(self);
	}
}