function ComponentMultiplePopup( id ) {
	var self = ComponentPopup(id);
	self._requiresSelection = true;

	self.buttonNode = document.getElementById( id + '_button' );
	self.listNode = document.getElementById( id + '_list' );
	self.showingList = false;

	self._multiple = true;
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
		var checkbox = $(self.identifier() + '.' + item.value + '.Selected')
		if( checkbox )
			checkbox.checked = true;
	};
	self.itemDeselect = function( item ) {
		item.selected = 'no';
		var checkbox = $(self.identifier() + '.' + item.value + '.Selected')
		if( checkbox )
			checkbox.checked = false;
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
		
		if( document.body.onclick ) {
			document.body.onclick(null);
		}
		document.body.onclick = function(event) {
			self.hideList();
		};
	};
	self.hideList = function() {
		self.listNode.style.display = 'none';
		self.showingList = false;
		document.body.onclick = null;
	};
	self.applyEventHandlers = function() {
		self.itemsEach(function( index, item ){
			var prefix = self.identifier() + '.' +  item.value;
			var row = $(prefix + '.Row');
			var checkbox = $(prefix + '.Selected');
			var label = $(prefix + '.Label');
			var value = item.value;

			if( checkbox ) {
				checkbox.onclick = CancelEvent;
				checkbox.onchange = function(event) {
					self._selectItemsByValue(value);
					CancelEvent(event);
				};
			}

			if( label ) {
				var on_click = function(event) {
					self.resetSelected();
					self.selectItemsByValue(value);
					self.hideList();
					CancelEvent(event);
				};
				label.onclick = on_click;
				row.onclick = on_click;
			}
		});
	};
	self.buttonNode.onclick = function(event) {
		if( self.showingList ) {
			self.hideList();
		} else {
			self.showList();
		}
		CancelEvent(event);
	};
	if( $(self.identifier() + '.Done') ) {
		$(self.identifier() + '.Done').onclick = function(event) {
			self.hideList();
			self.action('change');
		};
	}
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
