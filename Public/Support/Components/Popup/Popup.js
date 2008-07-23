function ComponentPopup( id ) {
	var self = _ComponentFormSelect(id);
	self._requiresSelection = true;
	self.setMultiple(false);
	self.updateSelected();
	return self;
}
