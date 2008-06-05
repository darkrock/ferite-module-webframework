function ComponentHidden( id ) {
	var self = _ComponentFormControl(id);
	self.bind = function() { };
	return self;
}