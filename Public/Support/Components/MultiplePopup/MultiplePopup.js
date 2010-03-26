function ComponentMultiplePopup( id ) {
	var self = ComponentPopup(id);
	self._requiresSelection = true;

	self.buttonNode = $( id + '_button' );
	self.listNode = $( id + '_list' );
	self.doneNode = $(id + '.Done');
	self.selectAllNode = $(id + '.SelectAll');
	
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
		item.className = 'selected';
		var checkbox = $(self.identifier() + '.' + item.value + '.Selected')
		if( checkbox ) {
			checkbox.checked = true;
		}
	};
	self.itemDeselect = function( item ) {
		item.selected = 'no';
		item.className = '';
		var checkbox = $(self.identifier() + '.' + item.value + '.Selected')
		if( checkbox ) {
			checkbox.checked = false;
		}
	};
	self.itemTitle = function( item ) {
		var id = self.identifier() + '.' + item.value + '.Label';
		var node = $(id);
		if( node ) {
			return node.innerHTML;
		}
		return 'Unable to find: ' + id;
	};
	self.idOfFirstSelected = function() {
		var id = '';
		self.itemsEach(function( index, item ) {
			if( !id && self.itemIsSelected(item)  ) {
				id = item.id;
			}
		});
		return id;
	};
	self.showList = function() {
		var iconWidth = 0;
		
		if( self.doneNode ) {
			self.doneNode.className = 'done';
		}
		
		Position.clone( self.buttonNode, self.listNode, { setWidth: false, setHeight: false, offsetTop: 0 + self.buttonNode.clientHeight + 1 } );
		self.listNode.style.minWidth = self.node().offsetWidth + iconWidth - 1 + 'px';
		self.listNode.style.display = 'block';
		self.showingList = true;
		
		if( document.body.onclick ) {
			document.body.onclick(null);
		}
		
		var currently_selected = self.getState('selected.list');
		document.body.onclick = function(event) {
			self.hideList();
			self.itemsEach(function(index, item) {
				self.itemDeselect(item);
				for( var i = 0; i < currently_selected.length; i++ ) {
					if( item.value == currently_selected[i] ) {
						self.itemSelect(item);
						break;
					}
				}
			});
		};
		
		var maxHeight = (document.viewport.getDimensions().height - self.node().viewportOffset()[1] - 50);
		var actualHeight = self.node().getDimensions().height;
		var actualWidth = self.node().getDimensions().width;
		
		self.setState('reset-width', actualWidth);
		self.setState('reset-height', actualHeight);

		self.node().style.maxHeight = '' + maxHeight + 'px';
		if( maxHeight < actualHeight ) {
			self.node().style.width = '' + (actualWidth + 20) + 'px';
			var id = self.idOfFirstSelected();
			if( id ) {
				$(id).top = 0;
			}
		}
	};
	self.hideList = function() {
		self.listNode.style.display = 'none';
		self.showingList = false;
		self.node().style.maxHeight = '' + 1024 + 'px';
		self.node().style.width = '' + self.getState('reset-width') + 'px';
		self.node().style.height = '' + self.getState('reset-height') + 'px';
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
					self.doneNode.className = 'donewaiting';
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
	if( self.doneNode ) {
		self.doneNode.onclick = function(event) {
			self.action('change');
			self.hideList();
			CancelEvent(event);
		};
	}
	if( self.selectAllNode ) {
		self.selectAllNode.onclick = function(event) {
			self.hideList();
			self.selectAll();
			CancelEvent(event);
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
		self.buttonNode.value = title + ' ▼';
	};
	return self;
}
