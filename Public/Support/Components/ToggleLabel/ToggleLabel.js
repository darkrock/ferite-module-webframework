function ComponentToggleLabel( id ) {
	var self = ComponentLabel(id);

	self.setState(self._defaultState, 'off');
	
	var previousUpdateVisual = self.updateVisual;
	self.updateVisual = function() {
		if( self.getState(self._defaultState) == 'on' ) {
			self.applyHighlightColouring(self.node());
		} else {
			self.applyLowlightColouring(self.node());
		}
		previousUpdateVisual();
	};
	self.setToggle = function( value ) {
		self.setState( self._defaultState, (value ? 'on' : 'off'));
	};
	self.toggleState = function() {
		self.flipState( self._defaultState, 'off', 'on');
	};
	self.registerAction('click', function( event ) {
		self.toggleState();
		CancelEvent(event);
	});
	return self;
}