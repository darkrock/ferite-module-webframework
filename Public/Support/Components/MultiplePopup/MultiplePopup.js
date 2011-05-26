function ComponentMultiplePopup( id ) {
	var self = ComponentPopup(id);
	
	self.bind = function() {};
	
	self._requiresSelection = true;

	self.buttonNode = $( id + '_button' );
	self.listNode = $( id + '_list' );
	self.doneNode = $(id + '.Done');
	self.selectAllNode = $(id + '.SelectAll');
	
	self.showingList = false;

	self._multiple = true;
	self.setState('multiple-items-text', 'Multiple Items');
	self.setState('all-items-text', 'All Items');
	
	self._createItem = function( value, label ) {
		var itemID = id + '.' + value;
		var li = document.createElement('li');
		li.id = itemID + '.Row';
		li.value = value;
		if( self._multiple ) {
			li.appendChild((function() {
				var input = document.createElement('input');
				input.id = itemID + '.Selected';
				input.setAttribute('type', 'checkbox');
				return input;
			})());
		}
		li.appendChild((function() {
			var span = document.createElement('span');
			span.id = itemID + '.Label';
			span.appendChild(document.createTextNode(label));
			return span;
		})());
		return li;
	};
	self.items = function() {
		var items = new Array();
		var list = self.node().getElementsByTagName("li");
		for( i = 0; i < list.length; i++ ) {
			if( !list[i].seperator ) {
				items.push(list[i]);
			}
		}
    	return items;
	};
	self.firstItem = function() {
		var list = self.items();
		var item;
		for( i = 0; i < list.length; i++ ) {
			if( !list[i].seperator ) {
				item = list[i];
				break;
			}
		}
		return item;
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
		
		// This needs to be set before Position.clone() is called otherwise self.node()'s parent element
		// will flash under some circumstances in Linux/Firefox (3.5.9)
		self.listNode.style.display = 'block';
		
		var extra = (Prototype.Browser.WebKit ? 0 : 1)
		Position.clone( self.buttonNode, self.listNode, { setWidth: false, setHeight: false, offsetTop: Element.getHeight(self.buttonNode) - extra } );
		self.listNode.style.minWidth = self.node().offsetWidth + iconWidth - 1 + 'px';
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
		
		var cumulativeOffset = Element.cumulativeOffset(self.node());
		
		var viewportHeight = document.viewport.getDimensions().height;
		
		var maxHeight = (viewportHeight - cumulativeOffset.top - 50);
		var actualHeight = Element.getDimensions(self.node()).height;
		var actualWidth = Element.getDimensions(self.node()).width;
		
		self._active = false;
		self.setState('reset-width', actualWidth);
		self.setState('reset-height', actualHeight);
		self._active = true;

		//self.node().style.maxHeight = '' + maxHeight + 'px'; // Tobias 2011-05-26: Anyone know why this is commented?
		if( maxHeight < actualHeight ) {
			var id = self.idOfFirstSelected();
			if( id ) {
				$(id).top = 0;
			}
		}

		//< added by raihan for FS#2556 >
		var list = self.node().getElementsByTagName("li");
		
		if( (cumulativeOffset.top + 24 * list.length) > viewportHeight ) {
			if( cumulativeOffset.top > 24 * list.length ) {
				var maxHeight = viewportHeight - cumulativeOffset.top + 430;
				var bottom = viewportHeight - cumulativeOffset.top + 18;
				
				self.listNode.style.position = 'absolute';
				self.listNode.style.bottom = bottom +'px';
				self.listNode.style.top = '';
				self.node().style.maxHeight = '' + maxHeight + 'px';
			}
		} else {
			if( Prototype.Browser.IE == false ) {
				self.node().style.maxHeight = '' + maxHeight + 'px';
			}
		}
		//< added by raihan for FS#2556 >
		
		/* Tobias 2011-05-26: Setting the width sometimes causes strange problems in IE - disable it for now
		self.node().style.width = '' + (actualWidth + (browser == 'Internet Explorer' ? 30 : 20)) + 'px'; */
		
		if( (cumulativeOffset.left + actualWidth + 40) > document.viewport.getDimensions().width ) {
			self.listNode.style.left = '' + (cumulativeOffset.left - ((cumulativeOffset.left + actualWidth + 40) - document.viewport.getDimensions().width)) + 'px';
		}
	};
	self.hideList = function() {
		self.listNode.style.display = 'none';
		self.showingList = false;
		// This causes browser window to flash in Linux/Firefox (3.5.9)
		//self.node().style.maxHeight = '' + 1024 + 'px';
		/* Tobias 2011-05-26: Setting the width sometimes causes strange problems in IE - disable it for now
		self.node().style.width = '' + self.getState('reset-width') + 'px'; */
		self.node().style.height = '' + self.getState('reset-height') + 'px';
		document.body.onclick = null;
	};
	self.registerEventHandler = function( value, callback ) {
		$(self.identifier() + '.' + value + '.Row').customSelect = callback;
	};
	self.applyEventHandlers = function() {
		var items = self.node().getElementsByTagName("li");
		$A(items).each(function(item) {
			var prefix = self.identifier() + '.' +  item.value;
			var row = $(prefix + '.Row');
			var checkbox = $(prefix + '.Selected');
			var label = $(prefix + '.Label');
			var value = item.value;

			if( checkbox ) {
				checkbox.onclick = function(event) {
					CancelEvent(event);
				};
				checkbox.onchange = function(event) {
					self._selectItemsByValue(value);
					self.doneNode.className = 'donewaiting';
					CancelEvent(event);
				};
			}

			if( label ) {
				var on_click = function(event) {
					self.resetSelected();
					if( item.customSelect ) {
						item.customSelect();
					} else {
						self.selectItemsByValue(value);
					}
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
					title = self.itemTitle(item).replace(/<[\/a-zA-Z]+>/, '');
				}
			}
		});
		
		if( self._multiple ) {
			if( count > 1 ) {
				title = self.getState('multiple-items-text');
			}
			if( count == totalCount ) {
				title = self.getState('all-items-text');
			}
		}
		
		self.buttonNode.innerHTML = "";
		self.buttonNode.appendChild((function() {
			var span = document.createElement('span');
			span.onmousedown = span.onselectstart = function() { return false; };
			span.unselectable = true;
			span.innerHTML = title;
			return span;
		})());
		self.buttonNode.appendChild((function() {
			var img = document.createElement('img');
			img.src = WFServerURI + 'Resources/Images/arrow_down.gif';
			return img;
		})());
		self.buttonNode.onmouseover = function() {
			self.buttonNode.childNodes[1].className = 'onmouseover';
		};
		self.buttonNode.onmouseout = function() {
			self.buttonNode.childNodes[1].className = '';
		};
	};
	
	return self;
}
