function _ComponentFormControl( id ) {
	var self = new Component(id);

	self.setDefaultState('text-value');
	self.setState('text-value', '');
	self.setEnabled = function( value ) {
		if( value ) {
			self.enable();
		} else {
			self.disable();
		}
	};
	self.enable = function() { self.node().disabled = false; };
	self.disable = function() { self.node().disabled = true; };
	
	var previousUpdateVisual = self.updateVisual;
	self.updateVisual = function() {
		if( self.getState('text-value') ) {
			self.node().value = self.getState('text-value');
		}
		previousUpdateVisual();
	};
	self.focus = function() {
		if( self.node() ) {
			self.node().focus();
			return true;
		}
		return false;
	};
	self.blur = function() {
		if( self.node() ) {
			self.node().blur();
			return true;
		}
		return false;
	};
	
	return self;
}