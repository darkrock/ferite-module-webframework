function ComponentList( id, multiple, mutable ) {
	var self = new _ComponentAbstractList(id);
	
	self.setState('mutable', mutable);
	
	self.bind = function() { };
	self.items = function() {
	    return self.node().getElementsByTagName("li");
	};
	self.itemIsSelected = function( item ) {
		return (item.selected ? true : false);
	};
	self.itemValue = function( item ) {
		return item.getAttribute('value');
	};
	self.itemSelect = function( item ) {
		item.selected = true;
	};
	self.itemDeselect = function( item ) {
		item.selected = false;
	};
	var previousUpdateVisual = self.updateVisual;
	self.updateVisual = function() {
		self.itemsEach(function( index, node ){
			self.applyLowlightColouring(node);
			if( self.itemIsSelected(node) ) {
				self.applyHighlightColouring(node);
			}
		});
		previousUpdateVisual();
	};
	self.setMultiple( multiple );
	if( self.getState('mutable') ) {
		self.itemsEach( function( index, item ) {
			self.attachClickActionWithValue(item, self.identifier(), item);
		});
		self.registerAction('click', function( event, item ) {
			self.selectItem(item);
		});
	}
	self.itemsEach( function( index, item ) {
		self.itemDeselect(item);
	});
	self.updateSelected();
	return self;
}
