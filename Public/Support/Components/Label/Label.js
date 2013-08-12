function ComponentLabel( id ) {
	var self = new Component(id);

	self.setState('text-value', '');

	var previousUpdateVisual = self.updateVisual;
	self.updateVisual = function() {
		self.node().innerHTML = self.getState('text-value');
		previousUpdateVisual();
	};
	self.textValue = function() {
		self.setState('text-value', self.node().innerHTML);
		return self.getState('text-value');
	};
	self.defaultAction = function() {
		self.action('click');
	};
	self.setVisible = function( status ) {
		if( status )
			self.node().style.display = 'inline';
		else
			self.node().style.display = 'none';
	};
	return self;
}
