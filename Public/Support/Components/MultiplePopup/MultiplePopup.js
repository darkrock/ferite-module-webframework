function ComponentMultiplePopup( id ) {
	var self = ComponentPopup(id);
	
	self.bind = function() {};
	
	self.buttonNode = $(id + '_button'); // For some reason this element must be fetched with $() for IE7/8.
	self.listNode = document.getElementById(id + '_list');
	self.doneNode = document.getElementById(id + '.Done');
	self.selectAllNode = document.getElementById(id + '.SelectAll');
	self.selectNoneNode = document.getElementById(id + '.SelectNone');
	
	self.showingList = false;

	self._requiresSelection = true;
	self._multiple = true;
	self.setState('multiple-items-text', 'Multiple Items');
	self.setState('all-items-text', 'All Items');
	self.setState('no-items-text', 'No Items');
	
	self.setVisible = function( status ) {
		if( status )
			self.buttonNode.show();
		else
			self.buttonNode.hide();
	};
	self.enable = function() {
		self._enabled = true;
		self.buttonNode.style.backgroundColor = '#FFF';
	};
	self.disable = function() {
		self._enabled = false;
		self.buttonNode.style.backgroundColor = '#F2F2F2';
	};
	self._selectNone = function() {
		self.itemsEach(function( index, item ) {
			if( self.itemIsSelected(item) ) {
				self.itemDeselect(item);
			}
		});
	};
	self.selectNone = function() {
		self._selectNone();
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
					if( item.active == 'undefined' )
					    item.active = true;
					node.appendChild(self._createItem(item.id, item.value, item.display, item.separator, item.active));
				});
				items.each(function(item){
				    if( item.active  == 'undefined' )
					    item.active = true;
					node.appendChild(self._createItem(item.id, item.value, item.display, item.separator, item.active));
				});
				self.setEnabled(true);
			} else if( items.length == 0 ) {
				node.appendChild(self._createItem(noItemsItem.id, noItemsItem.value, false));
				self.setEnabled(false);
			}
		}
		
		self.updateSelected();
	};
	
	self._createItem = function( value, label, display, separator, active ) {
		var itemID = id + '.' + value;
		var li = document.createElement('li');
		li.id = itemID + '.Row';
		li.setAttribute('itemvalue', value);
		li.setAttribute('itemdisplay', (display ? display : ''));
		li.setAttribute('itemseparator', (separator ? 'true' : 'false'));
		li.setAttribute('unselectable', 'on');
		if( active == false )
                   li.setAttribute('style', 'color: #FF0000');
		else
                  li.setAttribute('style', 'color: #000000'); 
		
		if( self._multiple && !separator ) {
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
			span.setAttribute('unselectable', 'on');
			if( separator ) {
				span.className = 'separator';
			}
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
		var checkbox = document.getElementById(self.identifier() + '.' + item.getAttribute('itemvalue') + '.Selected');
		if( checkbox ) {
			checkbox.checked = true;
		}
	};
	self.itemDeselect = function( item ) {
		item.selected = 'no';
		item.className = '';
		var checkbox = document.getElementById(self.identifier() + '.' + item.getAttribute('itemvalue') + '.Selected');
		if( checkbox ) {
			checkbox.checked = false;
		}
	};
	self.itemTitle = function( item ) {
		var display = item.getAttribute('itemdisplay');
		if( display ) {
			return display;
		} else {
			var id = self.identifier() + '.' + item.getAttribute('itemvalue') + '.Label';
			var node = document.getElementById(id);
			if( node ) {
				return node.innerHTML;
			}
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
		
		// Tobias 2012-07-05: It is important this is performed before
		// the height calculations.
		self.node().style.minWidth = '';
		self.node().style.maxHeight = '';
		
		var viewportDimensions = document.viewport.getDimensions();
		var viewportHeight = viewportDimensions.height;
		
		var nodeDimensions = Element.getDimensions(self.node());
		var nodeCumulativeOffset = Element.cumulativeOffset(self.node());
		var maxHeight = (viewportHeight - nodeCumulativeOffset.top - 35);
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
		
		if( maxHeight < actualHeight ) {
			self.node().style.maxHeight = '' + maxHeight + 'px';
			var id = self.idOfFirstSelected();
			if( id ) {
				document.getElementById(id).top = 0;
			}
		}
		
		// Tobias 2011-05-26: Setting the width sometimes causes strange problems in IE - disable it for now
		//self.node().style.width = '' + (actualWidth + (browser == 'Internet Explorer' ? 30 : 20)) + 'px';
		self.node().style.minWidth = '' + (actualWidth) + 'px';
		
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
		document.getElementById(self.identifier() + '.' + value + '.Row').customSelect = callback;
	};
	self.applyEventHandlers = function() {
		var items = self.node().getElementsByTagName("li");
		$A(items).each(function(item) {
			var prefix = self.identifier() + '.' +  item.getAttribute('itemvalue');
			var row = document.getElementById(prefix + '.Row');
			var checkbox = document.getElementById(prefix + '.Selected');
			var label = document.getElementById(prefix + '.Label');
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
							var next = Element.next(item, 'li');
							while( next && next.getAttribute('itemseparator') == 'false' ) {
								self._forceSelectItemsByValue(next.getAttribute('itemvalue'));
								next = Element.next(next, 'li');
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
		if( self._enabled ) {
			if( self.showingList ) {
				self.hideList();
			} else {
				self.showList();
			}
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
	if( self.selectNoneNode ) {
		self.selectNoneNode.onclick = function(event) {
			self.selectNone();
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
			if( count == 0 ) {
				title = self.getState('no-items-text');
			}
		}
		
        while( self.buttonNode.hasChildNodes() ) {
                self.buttonNode.removeChild(self.buttonNode.lastChild);
        }
		self.buttonNode.appendChild((function() {
			var span = document.createElement('span');
			span.setAttribute('unselectable', 'on');
			span.innerHTML = title;
			return span;
		})());
		self.buttonNode.appendChild((function() {
			var img = document.createElement('img');
			img.src = WFServerURI + 'Resources/Images/arrow_down.gif';
			return img;
		})());
		self.buttonNode.onmouseover = function() {
			if( self._enabled ) {
				self.buttonNode.childNodes[1].className = 'onmouseover';
			}
		};
		self.buttonNode.onmouseout = function() {
			if( self._enabled ) {
				self.buttonNode.childNodes[1].className = '';
			}
		};
	};
	
	return self;
}
