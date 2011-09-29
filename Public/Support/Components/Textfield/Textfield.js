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
	self.setTextValue = function( value ) {
		self.setState('text-value', value);
		self.node().value = value;
	};
	self.enable = function() {
		self._enabled = true;
		self.node().removeAttribute('readonly');
		self.node().style.backgroundColor = (self.__previousBackgroundColor ? self.__previousBackgroundColor : '#fff');
	};
	self.disable = function() {
		self._enabled = false;
		self.node().setAttribute('readonly', 'true');
		self.__previousBackgroundColor = self.node().style.backgroundColor;
		self.node().style.backgroundColor = '#ddd';
	};
	return self;
}
