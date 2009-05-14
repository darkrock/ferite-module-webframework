function ComponentTextfield( id ) {
	var self = _ComponentFormControl(id);
	
	self.setDefaultState('text-value');
	self.bind = function() {
		self.attachChangeAction( self.node(), self.identifier() );
	};
	self.registerAction('change', function() {
		self.setState('text-value', self.node().value);
	});
	self.select = function() {
		if( self.node() ) {
			self.node().select();
		}
	};
	self.textValue = function() {
		self.setState('text-value', self.node().value);
		return self.getState('text-value');
	};
	return self;
}