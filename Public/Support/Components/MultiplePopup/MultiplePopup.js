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
	
	self.setVisible = function( status ) {
		if( status )
			self.buttonNode.show();
		else
			self.buttonNode.hide();
	};
	
	self._forceSelectItemsByValue = function( value ) {
		var items = self.itemsByValue(value);
		if( items.length > 0 ) {
			for( i = 0; i < items.length; i++ ) {
				self.itemSelect( items[i] );
			}
			return true;
		}
		return false;
	};
	
	self._createItem = function( value, label ) {
		var itemID = id + '.' + value;
		var li = document.createElement('li');
		li.id = itemID + '.Row';
		li.setAttribute('itemvalue', value);
		li.setAttribute('itemseparator', 'false');
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
			if( list[i].getAttribute('itemseparator') == 'false' ) {
				items.push(list[i]);
			}
		}
    	return items;
	};
	self.firstItem = function() {
		var list = self.items();
		var item;
		for( i = 0; i < list.length; i++ ) {
			if( list[i].getAttribute('itemseparator') == 'false' ) {
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
	self.itemValue = function( item ) { return item.getAttribute('itemvalue'); };
	self.itemSelect = function( item ) {
		item.selected = 'yes';
		item.className = 'selected';
		var checkbox = $(self.identifier() + '.' + item.getAttribute('itemvalue') + '.Selected')
		if( checkbox ) {
			checkbox.checked = true;
		}
	};
	self.itemDeselect = function( item ) {
		item.selected = 'no';
		item.className = '';
		var checkbox = $(self.identifier() + '.' + item.getAttribute('itemvalue') + '.Selected')
		if( checkbox ) {
			checkbox.checked = false;
		}
	};
	self.itemTitle = function( item ) {
		var id = self.identifier() + '.' + item.getAttribute('itemvalue') + '.Label';
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
		
		var buttonNodeHeight = Element.getHeight(self.buttonNode);
		var extraTopOffset = (Prototype.Browser.WebKit ? 0 : 1)
		Position.clone(self.buttonNode, self.listNode, {
			setWidth: false,
			setHeight: false,
			offsetTop: buttonNodeHeight - extraTopOffset });
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
					if( item.getAttribute('itemvalue') == currently_selected[i] ) {
						self.itemSelect(item);
						break;
					}
				}
			});
		};
		
		
		var viewportDimensions = document.viewport.getDimensions();
		var viewportHeight = viewportDimensions.height;
		
		var nodeDimensions = Element.getDimensions(self.node());
		var nodeCumulativeOffset = Element.cumulativeOffset(self.node());
		var maxHeight = (viewportHeight - nodeCumulativeOffset.top - 25);
		var actualWidth = nodeDimensions.width;
		var actualHeight = nodeDimensions.height;
		
		// Tobias 2011-08-16: I think active is first set to false here and then to true
		// to prevent updateVisual function to run when the states are set.
		self._active = false;
		self.setState('reset-width', actualWidth);
		self.setState('reset-height', actualHeight);
		self._active = true;

		if( maxHeight < 100 ) { // List goes above button
			// Calculate new max height
			var buttonNodeCumulativeOffset = Element.cumulativeOffset(self.buttonNode);
			maxHeight = buttonNodeCumulativeOffset.top - 25;
			if( maxHeight < actualHeight ) {
				self.node().style.height = '' + maxHeight + 'px';
			}
			// Set new position above button
			Position.clone(self.buttonNode, self.listNode, {
				setWidth: false,
				setHeight: false,
				offsetTop: -(Element.getHeight(self.listNode)) });
		}
		
		self.node().style.maxHeight = '';
		if( maxHeight < actualHeight ) {
			self.node().style.maxHeight = '' + maxHeight + 'px';
			var id = self.idOfFirstSelected();
			if( id ) {
				$(id).top = 0;
			}
		}
		
		// Tobias 2011-05-26: Setting the width sometimes causes strange problems in IE - disable it for now
		//self.node().style.width = '' + (actualWidth + (browser == 'Internet Explorer' ? 30 : 20)) + 'px';
		
		if( (nodeCumulativeOffset.left + actualWidth + 40) > viewportDimensions.width ) {
			self.listNode.style.left = '' + (nodeCumulativeOffset.left - ((nodeCumulativeOffset.left + actualWidth + 40) - viewportDimensions.width)) + 'px';
		}
	};
	self.hideList = function() {
		self.listNode.style.display = 'none';
		self.showingList = false;
		// This causes browser window to flash in Linux/Firefox (3.5.9)
		//self.node().style.maxHeight = '' + 1024 + 'px';
		// Tobias 2011-05-26: Setting the width sometimes causes strange problems in IE - disable it for now
		//self.node().style.width = '' + self.getState('reset-width') + 'px';
		//self.node().style.height = '' + self.getState('reset-height') + 'px';
		document.body.onclick = null;
	};
	self.registerEventHandler = function( value, callback ) {
		$(self.identifier() + '.' + value + '.Row').customSelect = callback;
	};
	self.applyEventHandlers = function() {
		var items = self.node().getElementsByTagName("li");
		$A(items).each(function(item) {
			var prefix = self.identifier() + '.' +  item.getAttribute('itemvalue');
			var row = $(prefix + '.Row');
			var checkbox = $(prefix + '.Selected');
			var label = $(prefix + '.Label');
			var value = item.getAttribute('itemvalue');

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
				if( item.getAttribute('itemseparator') == 'true' ) {
					on_click = function(event) {
						self.hideList();
						CancelEvent(event);
					};
					if( self._multiple ) {
						on_click = function(event) {
							var next = item.next('li');
							while( next && next.getAttribute('itemseparator') == 'false' ) {
								self._forceSelectItemsByValue(next.getAttribute('itemvalue'));
								next = next.next('li');
							}
							self.action('change');
							self.hideList();
							CancelEvent(event);
						};
					}
				}
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
		
        while( self.buttonNode.hasChildNodes() ) {
                self.buttonNode.removeChild(self.buttonNode.lastChild);
        }
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
