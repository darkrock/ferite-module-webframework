function ComponentPopup( id ) {
	var self = _ComponentFormSelect(id);
	self._requiresSelection = true;
	self.setMultiple(false);
	self.updateSelected();
	
	self.selectedItem = function() {
		var selected = self.getState('selected.list');
		return selected[0];
	};
	return self;
}
