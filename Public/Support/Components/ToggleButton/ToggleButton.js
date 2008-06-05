function ComponentToggleButton( id ) {
	var self = ComponentToggleLabel(id);

	self.setState('text-value', '');
	self.enable = function() { self.node().disabled = false; };
	self.disable = function() { self.node().disabled = true; };
	
	var previousUpdateVisual = self.updateVisual;
	self.updateVisual = function() {
		if( self.getState('text-value') ) {
			self.node().value = self.getState('text-value');
		}
		previousUpdateVisual();
	};
	return self;
}