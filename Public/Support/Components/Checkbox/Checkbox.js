function ComponentCheckbox( id, checkbox, label ) {
	var self = new Component(id);
	
	self._target = checkbox;
	self.setDefaultState('checked');
	self.setState('checked', 'no');
	self._labelComponent = ComponentLabel(label);
	
	self.bind = function() {
		self.attachClickAction( self._labelComponent.node(), self.identifier() );
		self.attachClickAction( self.node(), self.identifier() );
	};
	var previousSetState = self.setState;
	self.setState = function( name, value ) {
		if( name == 'text-value' ) {
			self._labelComponent.setState('text-value', value);
		}
		previousSetState( name, value );
	};
	self.enable = function() {
		self.node().disabled = false; 
		self._labelComponent.enable();
		self.registerAction('click', function() {
			self.toggleState();
		});
	};
	self.disable = function() { 
		self.node().disabled = true; 
		self._labelComponent.disable();
		self.registerAction('click', function() { });
	};
	
	var previousUpdateVisual = self.updateVisual;
	self.updateVisual = function() {
		self.node().checked = (self.getState('checked') == 'yes' ? true : false);
		self._labelComponent.updateVisual();
		previousUpdateVisual();
	};
	self.toggleState = function() {
		self.flipState(self._defaultState, 'no', 'yes');
	};
	self.registerAction('click', function() {
		self.toggleState();
	});
	
	self.defaultAction = function() {
		self.toggleState();
	};
	return self;
}