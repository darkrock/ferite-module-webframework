function WysiwygEditor() {
	var self = this;
	self.iframe = null;
	self.iframeDocument = null;
	self.iframeWindow = null;
	self.contentElement = null;
	self.eventCallbacks = {};
	self.contextMenu = null;
	self.languages = [];
	self.onEvent = function( type, callback ) {
		if( self.eventCallbacks[type] == undefined )
			self.eventCallbacks[type] = [];
		self.eventCallbacks[type].push(callback);
	};
	self.fireEvent = function( type, event ) {
		/*
		var lenght = self.eventCallbacks[type].length;
		for( var i = 0; i < length; i++ ) {
			self.eventCallbacks[type][i](self);
		}
		*/
		if( self.eventCallbacks[type] ) {
			event = (event ? event : {});
			event.editor = self;
			self.eventCallbacks[type].each(function(callback){
				callback(event);
			});
		}
	};
	self.selectionContainer = function() {
		var selection = rangy.getSelection(self.iframeWindow);
		var range = selection.getRangeAt(0);
		var container = range.startContainer;
		if( container.nodeType == 3 )
			container = container.parentNode;
		return container;
	};
	self.setLanguages = function( list ) {
		self.languages = list;
	};
	self.getLanguages = function() {
		return self.languages;
	};
	self.createElement = function( tagName, creator, otherDocument ) {
		var useDocument = (otherDocument ? otherDocument : document);
		var element = useDocument.createElement(tagName);
		if( creator ) {
			creator(element);
		}
		return element;
	};
	self.createTable = function( creator ) {
		var table = document.createElement('table');
		var tbody = document.createElement('tbody');
		table.cellSpacing = 0;
		table.cellPadding = 0;
		table.setAttribute('cellpadding', 0),
		table.setAttribute('cellspacing', 0);
		table.setAttribute('border', 0);
		table.appendChild(tbody);
		if( creator ) {
			creator(table, tbody);
		}
		return table;
	};
	self.createTableRow = function( table, creator ) {
		var row = document.createElement('tr');
		table.appendChild(row);
		if( creator ) {
			creator(row);
		}
		return row;
	};
	self.createTableColumn = function( row, creator ) {
		var column = document.createElement('td');
		row.appendChild(column);
		if( creator ) {
			creator(column);
		}
		return column;
	};
	self.addToolbarItemGroup = function( toolbar, callback ) {
		var group = document.createElement('td');
		var table = document.createElement('table');
		var tbody = document.createElement('tbody');
		var row = document.createElement('tr');
		row.items = 0;
		tbody.appendChild(row);
		table.appendChild(tbody);
		toolbar.appendChild(group);
		group.appendChild(table);
		table.className = 'WysiwygEditorToolbarItemGroup';
		table.setAttribute('cellpadding', 0);
		table.setAttribute('cellspacing', 0);
		callback(row);
	};
	self.addToolbarItem = function( group, name, label, icon, lastItem, onclick, onselectionchange ) {
		var column = document.createElement('td');
		var item = document.createElement('div')
		var iconImage;
		if( icon ) {
			iconImage = document.createElement('img');
			iconImage.src = icon;
			item.appendChild(iconImage);
		}
		if( label ) {
			item.appendChild(self.createElement('span', function( span ) {
				span.appendChild(document.createTextNode(label));
			}));
		}
		item.onmousedown = item.onselectstart = function() { return false; };
		item.unselectable = true;
		item.active = false;
		item.className = 'WysiwygEditorToolbarItem';
		item.onclick = function() {
			onclick(item);
		};
		column.className = 'WysiwygEditorToolbarItemContainer';
		if( lastItem && group.items == 0 ) {
			column.className = 'WysiwygEditorToolbarItemContainerFirstLast';
		} else if( lastItem ) {
			column.className = 'WysiwygEditorToolbarItemContainerLast';
		} else if( group.items == 0 ) {
			column.className = 'WysiwygEditorToolbarItemContainerFirst';
		}
		column.appendChild(item);
		group.appendChild(column);
		group.items++;
		if( onselectionchange ) {
			self.onEvent('selectionchange', function( event ) {
				var container = event.editor.selectionContainer();
				var active = onselectionchange(event.editor, item, container);
				if( item.active != active ) {
					item.className = (active ? 'WysiwygEditorToolbarItemActive' : 'WysiwygEditorToolbarItem');
					item.active = active;
				}
			});
		}
		return column;
	};
	self.addToolbarDropDown = function( toolbar, label, width, items, callback, onselectionchange ) {
		var selectedItem = null;
		var itemLabel = null;
		var list = self.createTable(function(table, tbody){
			table.className = 'WysiwygEditorToolbarDropDown';
			self.createTableRow(tbody, function(row){
				self.createTableColumn(row, function(column){
					column.innerHTML = label;
					column.className = 'WysiwygEditorToolbarDropDownItemHeader';
					column.onmousedown = column.onselectstart = function() { return false; };
					column.unselectable = true;
				});
			});
			items.each(function(item){
				self.createTableRow(tbody, function(row){
					self.createTableColumn(row, function(column){
						column.innerHTML = item.label;
						column.className = 'WysiwygEditorToolbarDropDownItem';
						column.onmousedown = column.onselectstart = function() { return false; };
						column.unselectable = true;
						column.onclick = function() {
							var selection = rangy.getSelection(self.iframeWindow);
							selection.setSingleRange(self.dropDownSavedRange);
							callback(item, itemLabel);
							Element.hide(list);
							self.toolbarOpenedDropDownList = null;
							self.dropDownSavedRange = null;
							return false;
						};
					});
				});
				if( item.selected ) {
					selectedItem = item;
				}
			});
		});
		var container = document.createElement('td');
		/*container.appendChild(self.createElement('div', function(element){
			element.className = 'WysiwygEditorToolbarItemDropDown';
			element.style.width = width + 'px';
			element.onmousedown = element.onselectstart = function() { return false; };
			element.unselectable = true;
			itemLabel = editor.createElement('span', function( span ) {
				span.innerHTML = (selectedItem ? selectedItem.label : label);
			});
			element.appendChild(itemLabel);
			element.appendChild(editor.createElement('img', function(img){
				img.src = 'dropdownbutton.png';
				//img.align = 'right';
				//img.style.cssFloat = 'right';
				img.style.verticalAlign = 'bottom';
				img.style.marginLeft = '4px';
			}));
		}));*/
		container.appendChild(self.createTable(function(table, tbody) {
			table.className = 'WysiwygEditorToolbarItemDropDown';
			table.style.width = width + 'px';
			self.createTableRow(tbody, function(row) {
				self.createTableColumn(row, function(column) {
					column.onmousedown = column.onselectstart = function() { return false; };
					column.unselectable = true;
					column.style.width = '100%';
					itemLabel = self.createElement('span', function( span ) {
						span.innerHTML = (selectedItem ? selectedItem.label : label);
					});
					column.appendChild(itemLabel);
				});
				self.createTableColumn(row, function(column) {
					column.appendChild(self.createElement('img', function(img){
						img.src = uriForServerImageResource('Wysiwyg/dropdownbutton.png');
						img.style.verticalAlign = 'bottom';
						img.style.marginLeft = '4px';
					}));
				});
			});
		}));
		container.onclick = function() {
			var selection = rangy.getSelection(self.iframeWindow);
			self.dropDownSavedRange = selection.getRangeAt(0).cloneRange();
			if( Element.visible(list) ) {
				Element.hide(list);
				self.toolbarOpenedDropDownList = null;
				self.dropDownSavedRange = null;
			} else {
				if( self.toolbarOpenedDropDownList ) {
					Element.hide(self.toolbarOpenedDropDownList);
				}
				Element.clonePosition(list, container, {
						setWidth: false,
						setHeight: false,
						offsetLeft: 2,
						offsetTop: Element.getHeight(container) - 2
					});
				Element.show(list);
				self.toolbarOpenedDropDownList = list;
			}
		};
		toolbar.appendChild(container);
		document.body.appendChild(list);
		if( Element.getHeight(list) > 260 ) {
			list.style.height = '260px';
		}
		Element.hide(list);
		if( onselectionchange ) {
			self.onEvent('selectionchange', function( event ) {
				var container = event.editor.selectionContainer();
				var active = onselectionchange(itemLabel, container);
				/*if( item.active != active ) {
					item.className = (active ? 'WysiwygEditorToolbarItemActive' : 'WysiwygEditorToolbarItem');
					item.active = active;
				}*/
			});
		}
	};
	self.createItemPopupFooter = function( creator ) {
		var footer = self.createTable(function( table, tbody ) {
			table.className = 'WysiwygEditorItemPopupFooter';
			self.createTableRow(tbody, function( row ) {
				self.createTableColumn(row, function( column ) {
					column.style.width = '100%';
				});
				if( creator ) {
					creator(row);
				}
			});
		});
		return footer;
	};
	self.addItemPopupFooterButton = function( footer, label, icon, colour, onclick ) {
		self.createTableColumn(footer, function( baseColumn ) {
			table = self.createTable(function( table, tbody ) {
				self.createTableRow(tbody, function( row ) {
					self.createTableColumn(row, function( column ) {
						column.style.border = '0px';
						column.style.padding = '0px';
						column.style.background = '#F2F2F2';
						column.appendChild(document.createTextNode(' '));
					});
					self.createTableColumn(row, function( column ) {
						column.style.border = '0px';
						column.style.padding = '0px';
						column.style.background = colour;
						column.appendChild(self.createElement('img', function( img ) {
							img.src = icon;
							img.style.verticalAlign = 'top';
							img.setAttribute('border', 0);
						}));
					});
					self.createTableColumn(row, function( column ) {
						column.style.border = '0px';
						column.style.padding = '0px';
						column.style.whiteSpace = 'nowrap';
						column.style.background = '#F2F2F2';
						column.style.fontSize = '12px';
						column.appendChild(document.createTextNode('\u00a0'));
						column.appendChild(self.createElement('span', function( span ) {
							span.style.verticalAlign = 'middle';
							span.style.color = '#717171';
							span.innerHTML = label;
						}));
						column.appendChild(document.createTextNode('\u00a0\u00a0'));
					});
				});
			});
			baseColumn.style.height = '20px';
			baseColumn.style.padding = (Prototype.Browser.IE ? '2px' : '5px');
			baseColumn.style.cursor = 'pointer';
			baseColumn.style.whiteSpace = 'nowrap';
			baseColumn.appendChild(table);
			baseColumn.onclick = function() {
				onclick();
			};
		});
	};
	self.init = function( textareaName ) {
		setTimeout(function() {
			var textarea = document.getElementById(textareaName);
			
			self.iframe = document.getElementById(textareaName + '.IFrame');
			self.iframe.style.width = (textarea.offsetWidth > 0 ? textarea.offsetWidth + 'px' : '200px');
			self.iframe.style.height = (textarea.offsetHeight > 0 ? textarea.offsetHeight + 'px' : '200px');
			self.iframe.className = 'WysiwygEditor';
			
			self.iframeWindow = (self.iframe.contentDocument ? self.iframe.contentDocument.defaultView : self.iframe.contentWindow);
			self.iframeDocument = self.iframe.contentWindow || self.iframe.contentDocument;
			if( self.iframeDocument.document ) {
				self.iframeDocument = self.iframeDocument.document;
			}
			
			if( Prototype.Browser.IE ) {
				self.iframeDocument.open();
				self.iframeDocument.write('<html>' +
					'<head>' +
					'<title>Wysiwyg Editor</title>' +
					'<style type="text/css">' +
					'</style>' +
					'</head>' +
					'<body>' +
					'</body>' +
					'</html>');
				self.iframeDocument.close();
			}
			
			self.contentElement = self.iframeDocument.body;
			self.contentElement.style.padding = '0px';
			self.contentElement.style.margin = '0px';
			self.contentElement.contentEditable = true;
			self.contentElement.hideFocus = true;
			self.contentElement.style.width = ((textarea.offsetWidth > 0 ? textarea.offsetWidth : 200) - 1) + 'px';;
			self.contentElement.style.height = ((textarea.offsetHeight > 0 ? textarea.offsetHeight : 200) - 1) + 'px';;
			
			Element.hide(textarea);
			Element.show(self.iframe);
			
			self.contentElement.onmouseup = function() {
				self.fireEvent('selectionchange');
			};
			self.contentElement.onkeyup = function() {
				self.fireEvent('selectionchange');
				self.fireEvent('keyup');
			};
			/*self.contentElement.onmousedown = function( event ) {
				var rightclick = false;
				if( !event ) {
					var event = window.event;
				}
				if( event.which ) {
					rightclick = (event.which == 3);
				} else if( event.button ) {
					rightclick = (event.button == 2);
				}
				if( rightclick ) {
					self.fireEvent('rightclick');
				}
			};*/
			self.contentElement.oncontextmenu = function( event ) {
				var editorEvent = {
					showBrowserContextMenu: true,
					mouseCursorPositionX: 0,
					mouseCursorPositionY: 0
				 };
				if( !event ) {
					var event = window.event;
				}
				if( event.pageX || event.pageY ) {
					var offset = Element.cumulativeOffset(self.iframe);
					editorEvent.mouseCursorPositionX = event.pageX + offset.left;
					editorEvent.mouseCursorPositionY = event.pageY + offset.top;
				}/* else if( event.clientX || event.clientY ) {
					editorEvent.mouseCursorPositionX = event.clientX;// + self.contentElement.scrollLeft + document.documentElement.scrollLeft;
					editorEvent.mouseCursorPositionY = event.clientY;// + self.contentElement.scrollTop + document.documentElement.scrollTop;
				}*/
				self.fireEvent('rightclick', editorEvent);
				return editorEvent.showBrowserContextMenu;
			};
			
			self.contextMenu = {
				element: null,
				show: function( x, y ) {
					this.element.style.left = x + 'px';
					this.element.style.top = y + 'px';
					Element.show(this.element);
				},
				hide: function() {
					Element.hide(this.element);
				},
				clear: function() {
					while( this.element.hasChildNodes() ) {
						this.element.removeChild(this.element.firstChild);       
					}
				},
				hasItems: function() {
					return this.element.hasChildNodes();
				},
				addGroup: function( creator ) {
					var group = {
						element: null,
						addItem: function( icon, label, callback ) {
							if( !this.element ) {
								this.element = self.createElement('div', function( div ) {
									div.className = 'WysiwygEditorContextMenuGroup';
								});
							}
							this.element.appendChild(self.createTable(function( table, tbody ) {
								table.className = 'WysiwygEditorContextMenuItem';
								self.createTableRow(tbody, function( row )  {
									row.onclick = function( event ) {
										callback(self);
										self.contextMenu.hide();
										CancelEvent((event ? event : window.event));
										return false;
									};
									self.createTableColumn(row, function( column ) {
										column.className = 'WysiwygEditorContextMenuItemLeft';
										column.appendChild(self.createElement('img', function( image ) {
											image.src = icon;
										}));
									});
									self.createTableColumn(row, function( column ) {
										column.className = 'WysiwygEditorContextMenuItemRight';
										column.innerHTML = label;
									});
								});
							}));
						}
					};
					creator(group);
					this.element.appendChild(group.element);
				}
			};
			
			self.onEvent('rightclick', function( event ) {
				if( event.editor.contextMenu.element == null ) {
					event.editor.contextMenu.element = event.editor.createElement('div', function( div ) {
						div.className = 'WysiwygEditorContextMenu';
						//div.style.zIndex = '99';
						//div.style.width = '320px';
						//div.style.height = '240px';
						//div.style.backgroundColor = '#000';
						//div.style.position = 'absolute';
						//alert('x: ' + event.mouseCursorPositionX + ', y: ' + event.mouseCursorPositionY);
						//div.style.top = event.mouseCursorPositionX + 'px';
						//div.style.left = event.mouseCursorPositionY + 'px';
						//div.innerHTML = 'Hello World!';
					});
					document.body.appendChild(event.editor.contextMenu.element);
				}
				event.editor.contextMenu.clear();
				event.editor.fireEvent('contextmenu');
				if( event.editor.contextMenu.hasItems() ) {
					event.showBrowserContextMenu = false;
					event.editor.contextMenu.show(event.mouseCursorPositionX, event.mouseCursorPositionY);
					var previous_onclick = document.body.onclick;
					document.body.onclick = function() {
						event.editor.contextMenu.hide();
						document.body.onclick = previous_onclick;
					};
					event.editor.contentElement.onclick = function() {
						event.editor.contextMenu.hide();
					};
				}
			});
			
			WysiwygEditorSpellCheckSetup(self);
			
			var toolbar = document.createElement('table');
			var tbody = document.createElement('tbody');
			var row = document.createElement('tr');
			var lastColumn = document.createElement('td');
			toolbar.id = textareaName + '.WysiwygEditorToolbar';
			toolbar.style.width = (textarea.offsetWidth + 12) + 'px';
			toolbar.className = 'WysiwygEditorToolbar';
			toolbar.setAttribute('cellpadding', 0);
			toolbar.setAttribute('cellspacing', 0);
			toolbar.appendChild(tbody);
			tbody.appendChild(row);
			
			self.addToolbarItemGroup(row, function( group ) {
				WysiwygEditorBoldToolbarItem(self, group);
				WysiwygEditorItalicToolbarItem(self, group),
				WysiwygEditorUnderlineToolbarItem(self, group);
				WysiwygEditorStrikethroughToolbarItem(self, group);
			});
			self.addToolbarItemGroup(row, function( group ) {
				WysiwygEditorOrderedListToolbarItem(self, group);
				WysiwygEditorUnorderedListToolbarItem(self, group);
			});
			self.addToolbarItemGroup(row, function( group ) {
				WysiwygEditorOutdentToolbarItem(self, group);
				WysiwygEditorIndentToolbarItem(self, group);
			});
			self.addToolbarItemGroup(row, function( group ) {
				WysiwygEditorJustifyLeftToolbarItem(self, group);
				WysiwygEditorJustifyCenterToolbarItem(self, group);
				WysiwygEditorJustifyRightToolbarItem(self, group);
			});
			self.addToolbarItemGroup(row, function( group ) {
				WysiwygEditorLinkToolbarItem(self, group);
				self.addToolbarItem(group, 'image', '', uriForServerImageResource('Wysiwyg/image.png'), false, function( item ) {
				});
				WysiwygEditorHorizontalLineToolbarItem(self, group);
			});
			WysiwygEditorFontToolbarDropDown(self, row);
			WysiwygEditorFontSizeToolbarDropDown(self, row);
			self.addToolbarItemGroup(row, function( group ) {
				WysiwygEditorColorToolbarItem(self, group, 	'textcolor', uriForServerImageResource('Wysiwyg/textcolor.png'), 'forecolor');
				WysiwygEditorColorToolbarItem(self, group, 	'backgroundcolor', uriForServerImageResource('Wysiwyg/backgroundcolor.png'), 'backcolor');
			});
			WysiwygEditorSpellCheckLanguageDropDown(self, row);
			self.addToolbarItemGroup(row, function( group ) {
				WysiwygEditorSpellCheckToolbarItems(self, group);
			});
			
			lastColumn.style.width = '100%';
			row.appendChild(lastColumn);
			
			textarea.parentNode.insertBefore(toolbar, self.iframe);
			
			setTimeout(function() {
				if( Element.getWidth(toolbar) > Element.getWidth(self.iframe) ) {
					self.iframe.style.width = Element.getWidth(toolbar) + 'px';
					self.iframeDocument.body.style.width = self.iframe.style.width;
				}
			}, 100);
		}, 100);
	};
}
