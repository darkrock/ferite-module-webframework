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
	self.hideItem = function( id ) {
		var items = self.items();
		for( var i = 0; i < items.length; i++ ) {
			if( items[i].value == id ) {
				items[i].style.display = 'none';
			} else {
				items[i].style.display = '';
			}
		}
	};
	return self;
}
