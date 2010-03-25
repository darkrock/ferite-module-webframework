function ComponentMultiplePopup( id ) {
	var self = ComponentPopup(id);
	self._requiresSelection = true;

	self.buttonNode = document.getElementById( id + '_button' );
	self.listNode = document.getElementById( id + '_list' );
	self.showingList = false;

	self.setState('multiple-items-text', 'Multiple Items');
	self.setState('all-items-text', 'All Items');
	
	self.items = function() { 
	    return self.node().getElementsByTagName("li");
	};
	self.itemIsSelected = function( item ) {
		if( item.selected == 'yes')
			return true;
		return false; 
	};
	self.itemValue = function( item ) { return item.value; };
	self.itemSelect = function( item ) {
		item.selected = 'yes';
		$(self.identifier() + '.' + item.value + '.Selected').checked = true;
	};
	self.itemDeselect = function( item ) {
		item.selected = 'no';
		$(self.identifier() + '.' + item.value + '.Selected').checked = false;
	};
	self.itemTitle = function( item ) {
		return $(self.identifier() + '.' + item.value + '.Label').innerHTML;
	};
	self.showList = function() {
		var iconWidth = 0;
		if( self.iconNode ) {
			iconWidth = self.iconNode.offsetWidth;
		}
		Position.clone( self.buttonNode, self.listNode, { setWidth: false, setHeight: false, offsetTop: 0 + self.buttonNode.clientHeight + 1 } );
		self.listNode.style.minWidth = self.node().offsetWidth + iconWidth - 1 + 'px';
		self.listNode.style.display = 'block';
		self.showingList = true;
	};
	
	self.hideList = function() {
		self.listNode.style.display = 'none';
		self.showingList = false;
	};
	
	self.buttonNode.onclick = function() {
		if( self.showingList ) {
			self.hideList();
		} else {
			self.showList();
		}
	};
	$(self.identifier() + '.Apply').onclick = function(event) {
		self.hideList();
		self.action('change');
	};
	if( $(self.identifier() + '.SelectAll') ) {
		$(self.identifier() + '.SelectAll').onclick = function(event) {
			self.hideList();
			self.selectAll();
		};
	}
	
	var previousUpdateSelected = self.updateSelected;
	self.updateSelected = function() {
		previousUpdateSelected();

		var title = '';
		var count = 0, totalCount = 0;
		
		self.itemsEach(function( index, item ) {
			totalCount++;
			if( self.itemIsSelected(item) ) {
				count++;
				if( count == 1 ) {
					title = self.itemTitle(item);
				}
			}
		});
		
		if( count > 1 ) {
			title = self.getState('multiple-items-text');
		}
		if( count == totalCount ) {
			title = self.getState('all-items-text');
		}
		self.buttonNode.value = title;
	};
	
	return self;
}
