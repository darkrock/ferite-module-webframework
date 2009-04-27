function ComponentButton( id ) {
	var self = _ComponentFormControl( id );
	
	var previousRegisterAction = self.registerAction;
	self.registerAction = function( action, f ) {
		previousRegisterAction( action, f );
		if( action == 'click' ) {
			self.updateVisual();
		}
	};
	var previousUpdateVisual = self.updateVisual;
	self.updateVisual = function() {
		self.node().disabled = false;
		if( !self._enabled || !self.getAction('click') ) {
			self.node().disabled = true;
		}
		previousUpdateVisual();
	};
	self.defaultAction = function() {
		self.action('click');
	};
	self.show = function() {
		if( self.node() ) {
			self.node().style.display = 'inline';
		}
	};
	
	return self;
}