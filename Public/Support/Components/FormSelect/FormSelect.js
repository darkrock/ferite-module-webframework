function _ComponentFormSelect( id ) {
	var self = new _ComponentAbstractList(id);
	
	self.setState('persistent-items', []);
	self.setState('no-items-item', null);
	
	self.bind = function() { 
		self.attachChangeAction(self.node(), self.identifier());
	};
	self.enable = function() { self.node().disabled = false; };
	self.disable = function() { self.node().disabled = true; };
	self.items = function() { return self.node().options; };
	self.itemIsSelected = function( item ) { return (item.selected ? true : false); };
	self.itemValue = function( item ) { return item.value; };
	self.itemSelect = function( item ) { item.selected = true; };
	self.itemDeselect = function( item ) { item.selected = false; };
	
	self._createItem = function( value, label ) {
		var option = document.createElement('option');
		option.setAttribute('value',value);
		option.appendChild(document.createTextNode(label));
		return option;
	};
	self.setPersistentItems = function( items ) {
		self.setState('persistent-items', items);
	};
	self.setNoItemsItem = function( item ) {
		self.setState('no-items-item', item);
	};
	self.setItems = function( items ) {
		var node = self.node();
		var persistentItems = self.getState('persistent-items');
		var noItemsItem = self.getState('no-items-item');
		
		while( node.childNodes.length ) {
			node.removeChild(node.childNodes[0]);
		}
		
		if( items ) {
			if( items.length > 0 || noItemsItem == null ) {
				persistentItems.each(function(item){
					node.appendChild(self._createItem(item.id,item.value));
				});
				items.each(function(item){
					node.appendChild(self._createItem(item.id,item.value));
				});
				self.setEnabled(true);
			} else if( items.length == 0 ) {
				node.appendChild(self._createItem(noItemsItem.id, noItemsItem.value));
				self.setEnabled(false);
			}
		}
		
		self.updateSelected();
	};
	
	var previousActivate = self.activate;
	self.activate = function() {
		previousActivate();
		self.updateSelected();
	};
	return self;
}