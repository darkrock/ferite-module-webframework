function ComponentTable( id ) {
	var self = new Component( id );
	
	self.rows = function() {
		return new Array();
	}
	
	return self;
}

