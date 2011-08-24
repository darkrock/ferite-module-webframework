function ComponentTextView( id ) {
	var self = ComponentTextfield(id);
	
	self.rows = function() { return self.node().rows; };
	self.columns = function() { return self.node().cols; };
	
	/*
	self.focus = function() {
		self.node().focus();
	};
	
	self.updateFormValue = function() {
		var value = self.formValue();
		self.node().value = value;
		return self.formValue();
	};
	
	self.textValue = function() {
		var value = self.node().value;
		self._states['text-value'] = value;
		return value;
	};
	
	self.setTextValue = function( value ) {
		self.setState('text-value', value);
		self.node().value = value;
	};
	
   	self.formValue = function() {
   		return self._states['text-value'];	
   	};
   	*/

	return self;
}
