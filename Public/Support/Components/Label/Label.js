function ComponentLabel( id ) {
	var self = new Component(id);

	self.setState('text-value', '');

	var previousUpdateVisual = self.updateVisual;
	self.updateVisual = function() {
		if( self.getState('text-value') ) {
			self.node().innerHTML = self.getState('text-value');
		}
		previousUpdateVisual();
	};
	return self;
}