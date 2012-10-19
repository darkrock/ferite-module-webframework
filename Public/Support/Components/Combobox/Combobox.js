function ComponentCombobox( id ) {
	var self = ComponentTextfield(id);
	
	self.wrapperNode = document.getElementById( id + '_wrapper' );
	self.iconNode = document.getElementById( id + '_icon' );
	self.listNode = document.getElementById( id + '_list' );
	self.showingList = false;
	self.selectedItem = -1;
	self.allowedToHideList = true;
	
	self.show = function() {
		Element.show(self.wrapperNode);
	};
	self.hide = function() {
		Element.hide(self.wrapperNode);
		Element.hide(self.listNode);
	};
	
	self.enable = function() {
		self._enabled = true;
		self.node().readOnly = false;
		self.node().className = 'wfComboboxTextfield';
		self.iconNode.className = 'wfComboboxIcon';
	};
	self.disable = function() {
		self._enabled = false;
		self.node().readOnly = true;
		self.node().className = 'wfComboboxTextfieldDisabled';
		self.iconNode.className = 'wfComboboxIconDisabled';
	};
	self.enabled = function() {
		return self._enabled;
	};
	
	self.showList = function( searchTerm ) {
		var foundMatch = false;
		var iconWidth = 0;
		if( self.iconNode ) {
			iconWidth = self.iconNode.offsetWidth;
		}
		self.selectedItem = -1;
		if( searchTerm ) {
			var size = self.listNode.childNodes[0].childNodes.length;
			for( var i = 0; i < size; i++ ) {
				var text = self.listNode.childNodes[0].childNodes[i]._itemLabel;
				var index = text.toLowerCase().search(searchTerm);
				var display = 'none';
				var className = '';
				if( index > -1 ) {
					var start = text.substring(0, index);
					var middle = text.substring(index, index + searchTerm.length);
					var end = text.substring(index + searchTerm.length, text.length);
					// Tobias 2012-10-19: For debugging uncomment this:
					//alert('Search term: ' + searchTerm + ', Search term length: ' + searchTerm.length + ', Index: ' + index + ', Start: ' + start + ', Middle: ' + middle + ', End: ' + end);
					text = start + '<b>' + middle + '</b>' + end;
					display = '';
					if( self.selectedItem == -1 ) {
						className = 'selected';
						self.selectedItem = i;
					}
					foundMatch = true;
				}
				self.listNode.childNodes[0].childNodes[i].style.display = display;
				self.listNode.childNodes[0].childNodes[i].className = className;
				self.listNode.childNodes[0].childNodes[i].innerHTML = text;
			}
		} else {
			var size = self.listNode.childNodes[0].childNodes.length;
			for( var i = 0; i < size; i++ ) {
				self.listNode.childNodes[0].childNodes[i].style.display = '';
				self.listNode.childNodes[0].childNodes[i].className = '';
				self.listNode.childNodes[0].childNodes[i].innerHTML = self.listNode.childNodes[0].childNodes[i]._itemLabel;
			}
		}
		if( !searchTerm || foundMatch ) {
			Position.clone( self.node(), self.listNode, { setWidth: false, setHeight: false, offsetTop: 0 + self.node().clientHeight + 1 } );
			self.listNode.style.minWidth = self.node().offsetWidth + iconWidth - 1 + 'px';
			self.listNode.style.display = 'block';
			self.showingList = true;
		} else {
			self.hideList();
		}
	};
	
	self.hideList = function() {
		self.listNode.style.display = 'none';
		self.showingList = false;
	};
	
	self.clearTextfield = function() {
		self.node().value = '';
	};
	
	var previousActivate = self.activate;
	self.activate = function activate() {
		self.node().style.cursor = 'text';
		if( self.getState('list-enabled') ) {
			if( self.iconNode ) {
				self.iconNode.onclick = function( event ) {
					if( self._enabled ) {
						if( self.showingList ) {
							self.hideList();
						} else {
							self.showList();
						}
					}
				};
			}
		}
		if( self.getState('textfield-enabled') == false ) {
			// TODO: Do something here.
		} else if( self.getState('autocomplete') == true ) {
			var getCaretPosition = function( o ) {
				if( o.createTextRange ) {
					var r = document.selection.createRange().duplicate();
					r.moveEnd('character', o.value.length);
					if( r.text == '' )
						return o.value.length
					return o.value.lastIndexOf(r.text)
				}
				return o.selectionStart;
			};
			self.node().onkeydown = function( keyEvent ) {
				keyEvent = keyEvent || window.event;
				if( keyEvent.keyCode != 9 /* tab */ &&
					keyEvent.keyCode != 38 /* up */ &&
					keyEvent.keyCode != 40 /* down */ &&
					keyEvent.keyCode != 13 /* return/enter */ )
				{
					if( keyEvent.keyCode != 27 /* esc */ ) {
						setTimeout(function() {
							var value = self.node().value;
							if( getCaretPosition(self.node()) == value.length /* at the end of the text */ ) {
								var items = value.split(',');
								var lastItem = items.length - 1;
								var searchTerm = items[lastItem].strip();
								if( searchTerm ) {
									self.showList(searchTerm.toLowerCase());
								} else {
									self.hideList();
								}
							} else {
								self.hideList();
							}
						}, 100);
					} else {
						self.hideList();
						CancelEvent(keyEvent);
						return false;
					}
				} else if( keyEvent.keyCode == 13 /* return/enter */ ) {
					if( self.showingList ) {
						if( self.selectedItem > -1 ) {
							var option = self.listNode.childNodes[0].childNodes[self.selectedItem];
							self._selectItem(option);
						}
						self.hideList();
					}
				} else if( keyEvent.keyCode == 38 /* up */ ) {
					if( self.showingList ) {
						if( self.selectedItem > 0 ) {
							var previousItem = self.selectedItem - 1;
							// Find the previous visible item in the list.
							while( self.listNode.childNodes[0].childNodes[previousItem].style.display == 'none' ) {
								previousItem--;
							}
							if( previousItem > -1 ) {
								if( self.selectedItem > -1 ) {
									self.listNode.childNodes[0].childNodes[self.selectedItem].className = '';
								}
								self.listNode.childNodes[0].childNodes[previousItem].className = 'selected';
								self.selectedItem = previousItem;
							}
						}
						CancelEvent(keyEvent);
						return false;
					}
				} else if( keyEvent.keyCode == 40 /* down */ ) {
					if( self.showingList ) {
						var size = self.listNode.childNodes[0].childNodes.length;
						var lastItem = size - 1;
						if( self.selectedItem < lastItem ) {
							var nextItem = self.selectedItem + 1;
							// Find the next visible item in the list.
							while( self.listNode.childNodes[0] &&
							       self.listNode.childNodes[0].childNodes[nextItem] &&
							       self.listNode.childNodes[0].childNodes[nextItem].style.display == 'none' )
							{
								nextItem++;
							}
							if( nextItem < size ) {
								if( self.selectedItem > -1 ) {
									self.listNode.childNodes[0].childNodes[self.selectedItem].className = '';
								}
								self.listNode.childNodes[0].childNodes[nextItem].className = 'selected';
								self.selectedItem = nextItem;
							}
						}
						CancelEvent(keyEvent);
						return false;
					}
				}
				return true;
			};
			self.node().onblur = function( event ) {
				if( self.allowedToHideList ) {
					self.hideList();
				}
			};
			self.listNode.onmouseover = function() {
				self.allowedToHideList = false;
			};
			self.listNode.onmouseout = function() {
				self.allowedToHideList = true;
			};
		}
		previousActivate();
	};
	
	self._selectItem = function( option ) {
		if( option ) {
			if( self.getState('multiple') == true ) {
				var value = self.node().value;
				var items = value.split(self.getState('item-separator'));
				var lastItem = items.length - 1;
				items[lastItem] = option._itemValue;
				value = '';
				items.each(function(item) {
					value += item.strip() + self.getState('item-separator') + ' ';
				});
				self.node().value = value;
				self.setState('text-value', value);
			} else {
				self.node().value = option._itemValue;
				self.setState('text-value', option._itemValue);
			}
		}
	};
	
	self._createItem = function( value, label, id ) {
		var option = document.createElement('li');
		option.appendChild(document.createTextNode(label));
		option._itemID = id;
		option._itemValue = value;
		option._itemLabel = label;
		option.onclick = function( event ) {
			self._selectItem(option);
			self.hideList();
			self.node().focus();
			if( self.node().createTextRange ) {
				var length = self.node().value.length;
				var range = self.node().createTextRange();
				range.moveStart('character', length);
				range.moveEnd('character', length);
				range.select();
			} else if( self.node().setSelectionRange ) {
				var length = self.node().value.length;
				self.node().setSelectionRange(length, length);
			}
		};
		option.onmouseover = function( event ) {
			if( self.selectedItem > -1 ) {
				var previousSelectedOption = self.listNode.childNodes[0].childNodes[self.selectedItem];
				if( previousSelectedOption ) {
					previousSelectedOption.className = '';
				}
			}
			option.className = 'selected';
			self.selectedItem = option._itemID;
		};
		return option;
	};
	self.setItems = function( items ) {
		var node = $(self.identifier() + '_list');
		
		while( node.childNodes.length ) {
			node.removeChild(node.childNodes[0]);
		}
		
		var itemID = 0;
		
		var ul = document.createElement('ul');
		items.each(function(item){
			ul.appendChild(self._createItem(item.id, item.value, itemID));
			itemID++;
		});
		node.appendChild(ul);
		
		node.style.height = '';
		node.style.overflow = '';
		node.style.overflowX = 'hidden';
		if( items.length > 10 ) {
			node.style.height = '200px';
			node.style.overflowY = 'scroll';
		}
	};
	
	return self;
}
