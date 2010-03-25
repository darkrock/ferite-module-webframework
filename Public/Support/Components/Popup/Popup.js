function ComponentPopup( id ) {
	var self = _ComponentFormSelect(id);
	self._requiresSelection = true;
	self.setMultiple(false);
	
	self.selectedItem = function() {
		var selected = self.getState('selected.list');
		return selected[0];
	};
	self.setVisible = function( status ) {
		if( status )
			self.node().style.display = 'inline';
		else
			self.node().style.display = 'none';
	};
	return self;
}
