function ComponentTextView( id ) {
	var self = ComponentTextfield(id);
	
	self.rows = function() { return self.node().rows; };
	self.columns = function() { return self.node().cols; };
	
	return self;
}
