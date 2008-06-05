function _ComponentFormSelect( id ) {
	var self = new _ComponentAbstractList(id);
	
	self.bind = function() { 
		self.attachChangeAction(self.node(), self.identifier());
	};
	self.enable = function() { self.node().disabled = false; };
	self.disable = function() { self.node().disabled = true; };
	self.items = function( deliver ) {
	    return self.node().options;
	};
	self.itemIsSelected = function( item ) { return (item.selected ? true : false); };
	self.itemValue = function( item ) { return item.value; };
	self.itemSelect = function( item ) { item.selected = true; };
	self.itemDeselect = function( item ) { item.selected = false; };
	
	self.updateSelected();
	return self;
}