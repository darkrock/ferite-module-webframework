var WysiwygEditor = {
	createElement: function( tagName, creator, otherDocument ) {
		var useDocument = (otherDocument ? otherDocument : document);
		var element = useDocument.createElement(tagName);
		if( creator ) {
			creator(element);
		}
		return element;
	},
	createTable: function( creator ) {
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
	},
	createTableRow: function( table, creator ) {
		var row = document.createElement('tr');
		table.appendChild(row);
		if( creator ) {
			creator(row);
		}
		return row;
	},
	createTableColumn: function( row, creator ) {
		var column = document.createElement('td');
		row.appendChild(column);
		if( creator ) {
			creator(column);
		}
		return column;
	},
	addToolbarItemGroup: function( toolbar, callback ) {
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
	},
	addToolbarItem: function( group, name, label, icon, title, lastItem, editor, onclick, onselectionchange ) {
		var column = document.createElement('td');
		var item = document.createElement('div')
		var iconImage;
		if( icon ) {
			iconImage = document.createElement('img');
			iconImage.src = icon;
			iconImage.title = title;
			item.appendChild(iconImage);
		}
		if( label ) {
			item.appendChild(WysiwygEditor.createElement('span', function( span ) {
				span.appendChild(document.createTextNode(label));
				span.title = title;
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
			editor.onEvent('selectionchange', function( event ) {
				var container = event.editor.latestSelectionContainer();
				var active = onselectionchange(event.editor, item, container);
				if( item.active != active ) {
					item.className = (active ? 'WysiwygEditorToolbarItemActive' : 'WysiwygEditorToolbarItem');
					item.active = active;
				}
			});
		}
		return column;
	},
	addToolbarDropDown: function( toolbar, label, width, items, editor, callback, onselectionchange ) {
		var selectedItem = null;
		var itemLabel = null;
		var list = WysiwygEditor.createTable(function(table, tbody){
			table.className = 'WysiwygEditorToolbarDropDown';
			WysiwygEditor.createTableRow(tbody, function(row){
				WysiwygEditor.createTableColumn(row, function(column){
					column.innerHTML = label;
					column.className = 'WysiwygEditorToolbarDropDownItemHeader';
					column.onmousedown = column.onselectstart = function() { return false; };
					column.unselectable = true;
				});
			});
			items.each(function(item){
				WysiwygEditor.createTableRow(tbody, function(row){
					WysiwygEditor.createTableColumn(row, function(column){
						column.innerHTML = item.label;
						column.className = 'WysiwygEditorToolbarDropDownItem';
						column.onmousedown = column.onselectstart = function() { return false; };
						column.unselectable = true;
						column.onclick = function() {
							callback(item, itemLabel);
							Element.hide(list);
							WysiwygEditor.toolbarOpenedDropDownList = null;
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
		container.appendChild(WysiwygEditor.createTable(function(table, tbody) {
			table.className = 'WysiwygEditorToolbarItemDropDown';
			table.style.width = width + 'px';
			WysiwygEditor.createTableRow(tbody, function(row) {
				WysiwygEditor.createTableColumn(row, function(column) {
					column.onmousedown = column.onselectstart = function() { return false; };
					column.unselectable = true;
					column.style.width = '100%';
					itemLabel = WysiwygEditor.createElement('span', function( span ) {
						span.innerHTML = (selectedItem ? selectedItem.label : label);
					});
					column.appendChild(itemLabel);
				});
				WysiwygEditor.createTableColumn(row, function(column) {
					column.appendChild(WysiwygEditor.createElement('img', function(img){
						img.src = uriForServerImageResource('Components/WysiwygEditor/dropdownbutton.png');
						img.style.verticalAlign = 'bottom';
						img.style.marginLeft = '4px';
					}));
				});
			});
		}));
		container.onclick = function() {
			if( Element.visible(list) ) {
				Element.hide(list);
				WysiwygEditor.toolbarOpenedDropDownList = null;
			} else {
				if( WysiwygEditor.toolbarOpenedDropDownList ) {
					Element.hide(WysiwygEditor.toolbarOpenedDropDownList);
				}
				Element.clonePosition(list, container, {
						setWidth: false,
						setHeight: false,
						offsetLeft: 2,
						offsetTop: Element.getHeight(container) - 2
					});
				Element.show(list);
				WysiwygEditor.toolbarOpenedDropDownList = list;
			}
		};
		toolbar.appendChild(container);
		document.body.appendChild(list);
		if( Element.getHeight(list) > 260 ) {
			list.style.height = '260px';
		}
		Element.hide(list);
		if( onselectionchange ) {
			editor.onEvent('selectionchange', function( event ) {
				var active = onselectionchange(itemLabel);
				/*if( item.active != active ) {
					item.className = (active ? 'WysiwygEditorToolbarItemActive' : 'WysiwygEditorToolbarItem');
					item.active = active;
				}*/
			});
		}
	},
	createItemPopupFooter: function( creator ) {
		var footer = WysiwygEditor.createTable(function( table, tbody ) {
			table.className = 'WysiwygEditorItemPopupFooter';
			WysiwygEditor.createTableRow(tbody, function( row ) {
				WysiwygEditor.createTableColumn(row, function( column ) {
					column.style.width = '100%';
				});
				if( creator ) {
					creator(row);
				}
			});
		});
		return footer;
	},
	addItemPopupFooterButton: function( footer, label, icon, colour, onclick ) {
		WysiwygEditor.createTableColumn(footer, function( baseColumn ) {
			table = WysiwygEditor.createTable(function( table, tbody ) {
				WysiwygEditor.createTableRow(tbody, function( row ) {
					WysiwygEditor.createTableColumn(row, function( column ) {
						column.style.border = '0px';
						column.style.padding = '0px';
						column.style.background = '#F2F2F2';
						column.appendChild(document.createTextNode(' '));
					});
					WysiwygEditor.createTableColumn(row, function( column ) {
						column.style.border = '0px';
						column.style.padding = '0px';
						column.style.background = colour;
						column.appendChild(WysiwygEditor.createElement('img', function( img ) {
							img.src = icon;
							img.style.verticalAlign = 'top';
							img.setAttribute('border', 0);
						}));
					});
					WysiwygEditor.createTableColumn(row, function( column ) {
						column.style.border = '0px';
						column.style.padding = '0px';
						column.style.whiteSpace = 'nowrap';
						column.style.background = '#F2F2F2';
						column.style.fontSize = '12px';
						column.appendChild(document.createTextNode('\u00a0'));
						column.appendChild(WysiwygEditor.createElement('span', function( span ) {
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
	},
	ContextMenu: {
		editor: null,
		element: null,
		_previousGroup: null,
		_onHideCallbacks: [],
		_createElement: function() {
			if( this.element == null ) {
				this.element = WysiwygEditor.createElement('div', function( div ) {
					div.className = 'WysiwygEditorContextMenu';
					div.appendChild(WysiwygEditor.createTable());
					Element.hide(div);
				});
				document.body.appendChild(this.element);
			}
		},
		show: function( x, y ) {
			this._createElement();
			this.element.style.left = x + 'px';
			this.element.style.top = y + 'px';
			Element.show(this.element);
		},
		hide: function() {
			this._createElement();
			Element.hide(this.element);
			this._onHideCallbacks.each(function(callback) {
				callback();
			});
		},
		onHide: function( callback ) {
			this._onHideCallbacks.push(callback);
		},
		clear: function() {
			this._createElement();
			if( this.element && this.element.firstChild && this.element.firstChild.firstChild ) {
				while( this.element.firstChild.firstChild.hasChildNodes() ) {
					// Yes that is right, I'm not kidding, 3 firstChild in a row
					this.element.firstChild.firstChild.removeChild(this.element.firstChild.firstChild.firstChild);
				}
			}
			this._onHideCallbacks = [];
		},
		hasItems: function() {
			this._createElement();
			if( this.element && this.element.firstChild && this.element.firstChild.firstChild )
				return this.element.firstChild.firstChild.hasChildNodes();
			return false;
		},
		addGroup: function( creator ) {
			var group = {
				editor: null,
				element: null,
				addMenu: function( label, creator ) {
					var menu = Object.clone(WysiwygEditor.ContextMenu);
					menu.editor = this.editor;
					if( creator ) {
						creator(menu);
					}
					var captured_this = this;
					this.addItem('', label, function(e, item) {
						var itemCumulativeOffset = Element.cumulativeOffset(item);
						var itemWidth = Element.getWidth(item);
						var x = itemCumulativeOffset.left + itemWidth + 4 /* 4 is a good number I promise */;
						var y = itemCumulativeOffset.top;
						menu._createElement();
						menu.element.style.left = x + 'px';
						menu.element.style.top = y + 'px';
						Element.show(menu.element);
						captured_this.editor.contextMenu.onHide(function() {
							menu.hide();
						});
					});
					return menu;
				},
				addItem: function( icon, label, callback ) {
					var captured_this = this;
					WysiwygEditor.createTableRow(this.element, function( row )  {
						row.onclick = function( event ) {
							callback(captured_this.editor, row);
							CancelEvent((event ? event : window.event));
							return false;
						};
						WysiwygEditor.createTableColumn(row, function( column ) {
							column.className = 'WysiwygEditorContextMenuItemLeft';
							if( icon ) {
								column.appendChild(WysiwygEditor.createElement('img', function( image ) {
									image.src = icon;
								}));
							}
						});
						WysiwygEditor.createTableColumn(row, function( column ) {
							column.className = 'WysiwygEditorContextMenuItemRight';
							column.innerHTML = label;
						});
					});
				},
				end: function() {
					WysiwygEditor.createTableRow(this.element, function( row )  {
						row.className = 'WysiwygEditorContextMenuGroupEnd';
						WysiwygEditor.createTableColumn(row, function( column ) {
							column.className = 'WysiwygEditorContextMenuItemLeft';
						});
						WysiwygEditor.createTableColumn(row, function( column ) {
							column.className = 'WysiwygEditorContextMenuItemRight';
						});
					});
				}
			};
			if( this._previousGroup ) {
				this._previousGroup.end();
			}
			group.editor = this.editor;
			this._createElement();
			group.element = this.element.firstChild.firstChild;
			if( creator ) {
				creator(group);
			}
			this._previousGroup = group;
			return group;
		}
	}
};

function WysiwygEditorObject() {
	var self = this;
	self.iframe = null;
	self.iframeDocument = null;
	self.iframeWindow = null;
	self.contentElement = null;
	self.eventCallbacks = {};
	self.contextMenu = null;
	self.contentRendersWholeDocument = false;
	self.readOnly = false;
	self.twoRowToolbar = false;
	self.languages = [];
	self.onEvent = function( type, callback ) {
		if( self.eventCallbacks[type] == undefined )
			self.eventCallbacks[type] = [];
		self.eventCallbacks[type].push(callback);
	};
	self.fireEvent = function( type, event ) {
		if( self.eventCallbacks[type] ) {
			event = (event ? event : {});
			event.editor = self;
			var size = self.eventCallbacks[type].length;
			var i;
			for( i = 0; i < size; i++ ) {
				var callback = self.eventCallbacks[type][i];
				callback(event);
			}
		}
	};
	self.latestSelectionContainer = function() {
		var container;
		if( self.latestSelectionRange ) {
			container = self.latestSelectionRange.startContainer;
		} else {
			self.latestSelection = rangy.getIframeSelection(self.iframe);
			self.latestSelectionRange = self.latestSelection.getRangeAt(0).cloneRange();
			container = self.latestSelectionRange.startContainer;
		}
		if( container.nodeType == 3 )
			container = container.parentNode;
		return container;
	};
	self.setContentRendersWholeDocument = function( value ) {
		self.contentRendersWholeDocument = value;
	};
	self.setReadOnly = function( value ) {
		self.readOnly = value;
	};
	self.setTwoRowToolbar = function( value ) {
		self.twoRowToolbar = value;
	};
	self.setLanguages = function( list ) {
		self.languages = list;
	};
	self.getLanguages = function() {
		return self.languages;
	};
	self.restoreLatestSelection = function() {
		if( self.latestSelectionRange ) {
			var selection = rangy.getIframeSelection(self.iframe);
			selection.setSingleRange(self.latestSelectionRange);
		}
	};
	self.initContentElement = function() {
		self.contentElement = self.iframeDocument.body;
		self.contentElement.style.padding = '0px';
		self.contentElement.style.margin = '0px';
		self.contentElement.hideFocus = true;
		self.contentElement.style.width = self.iframe.style.width;
		self.contentElement.style.height = self.iframe.style.height;
		
		if( self.readOnly == false ) {
			// Tobias 2011-08-30: This is here as a reminder that there might
			// be old web browsers that needs to use this instead of contentEditable.
			//self.iframeDocument.designMode = 'on';
			self.contentElement.contentEditable = true;
			self.contentElement.onmousedown = function() {
				self.contentElementMouseDown = true;
			};
			self.contentElement.onmouseup = function() {
				self.latestSelection = rangy.getIframeSelection(self.iframe);
				self.latestSelectionRange = self.latestSelection.getRangeAt(0).cloneRange();
				self.fireEvent('selectionchange');
				self.contentElementMouseDown = false;
			};
			self.contentElement.onkeyup = function() {
				self.latestSelection = rangy.getIframeSelection(self.iframe);
				self.latestSelectionRange = self.latestSelection.getRangeAt(0).cloneRange();
				self.fireEvent('selectionchange');
				self.fireEvent('keyup');
				self.fireEvent('change');
			};
			var previousDocumentBodyOnMouseUp = document.body.onmouseup;
			document.body.onmouseup = function() {
				if( self.contentElementMouseDown ) {
					self.latestSelection = rangy.getIframeSelection(self.iframe);
					self.latestSelectionRange = self.latestSelection.getRangeAt(0).cloneRange();
					self.fireEvent('selectionchange');
					self.contentElementMouseDown = false;
				}
				if( previousDocumentBodyOnMouseUp ) {
					previousDocumentBodyOnMouseUp();
				}
			};
		}
		
		var oncontextmenu = function( event ) {
			self.latestSelection = rangy.getIframeSelection(self.iframe);
			self.latestSelectionRange = self.latestSelection.getRangeAt(0).cloneRange();
			var editorEvent = {
				showBrowserContextMenu: true,
				mouseCursorPositionX: 0,
				mouseCursorPositionY: 0
			};
			if( event.pageX || event.pageY ) {
				var offset = Element.cumulativeOffset(self.iframe);
				editorEvent.mouseCursorPositionX = event.pageX + offset.left;
				editorEvent.mouseCursorPositionY = event.pageY + offset.top;
			} else if( event.clientX || event.clientY ) {
				var offset = Element.cumulativeOffset(self.iframe);
				editorEvent.mouseCursorPositionX = event.clientX + offset.left;
				editorEvent.mouseCursorPositionY = event.clientY + offset.top;
			}
			self.fireEvent('rightclick', editorEvent);
			if( editorEvent.showBrowserContextMenu == false ) {
				CancelEvent(event);
			}
			return editorEvent.showBrowserContextMenu;
		};
		if( Prototype.Browser.IE ) {
			self.contentElement.attachEvent('oncontextmenu', function( event ) {
				return oncontextmenu(event);
			});
		} else {
			self.contentElement.oncontextmenu = function( event ) {
				return oncontextmenu(event);
			};
		}
	};
	self.init = function( textareaName, addToolbar ) {
		setTimeout(function() {
			//var textarea = document.getElementById(textareaName);
			
			self.iframe = document.getElementById(textareaName + '.IFrame');
			//self.iframe.style.width = (textarea.offsetWidth > 0 ? textarea.offsetWidth + 'px' : '200px');
			//self.iframe.style.height = (textarea.offsetHeight > 0 ? textarea.offsetHeight + 'px' : '200px');
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
			
			self.initContentElement();
			
			self.contextMenu = Object.clone(WysiwygEditor.ContextMenu);
			self.contextMenu.editor = self;
			
			self.onEvent('rightclick', function( event ) {
				event.editor.contextMenu.clear();
				event.editor.fireEvent('contextmenu');
				if( event.editor.contextMenu.hasItems() ) {
					event.showBrowserContextMenu = false;
					event.editor.contextMenu.show(event.mouseCursorPositionX, event.mouseCursorPositionY);
					var previous_document_onclick = document.body.onclick;
					var previous_contentElement_onclick = event.editor.contentElement.onclick;
					document.body.onclick = function() {
						event.editor.contextMenu.hide();
						event.editor.contentElement.onclick = previous_contentElement_onclick;
						document.body.onclick = previous_document_onclick;
					};
					event.editor.contentElement.onclick = function() {
						event.editor.contextMenu.hide();
						event.editor.contentElement.onclick = previous_contentElement_onclick;
						document.body.onclick = previous_document_onclick;
					};
				}
			});
			
			if( addToolbar ) {
				WysiwygEditorSpellCheckSetup(self);
			
				var toolbar = document.createElement('table');
				var toolbar_tbody = document.createElement('tbody');
				var toolbar_row = document.createElement('tr');
				var toolbar_column = document.createElement('td');
				toolbar.id = textareaName + '.WysiwygEditorToolbar';
				toolbar.style.width = self.iframe.style.width;
				toolbar.className = 'WysiwygEditorToolbar';
				toolbar.setAttribute('cellpadding', 0);
				toolbar.setAttribute('cellspacing', 0);
				toolbar.appendChild(toolbar_tbody);
				toolbar_tbody.appendChild(toolbar_row);
				toolbar_row.appendChild(toolbar_column);
			
				var row_table = document.createElement('table');
				row_table.setAttribute('cellpadding', 0);
				row_table.setAttribute('cellspacing', 0);
				var row_tbody = document.createElement('tbody');
				var row = document.createElement('tr');
				row_table.appendChild(row_tbody);
				row_tbody.appendChild(row);

				var lastColumn = document.createElement('td');
			
				toolbar_column.appendChild(row_table);
			
				WysiwygEditor.addToolbarItemGroup(row, function( group ) {
					WysiwygEditorBoldToolbarItem(self, group);
					WysiwygEditorItalicToolbarItem(self, group),
					WysiwygEditorUnderlineToolbarItem(self, group);
					WysiwygEditorStrikethroughToolbarItem(self, group);
				});
				WysiwygEditor.addToolbarItemGroup(row, function( group ) {
					WysiwygEditorOrderedListToolbarItem(self, group);
					WysiwygEditorUnorderedListToolbarItem(self, group);
				});
				WysiwygEditor.addToolbarItemGroup(row, function( group ) {
					WysiwygEditorOutdentToolbarItem(self, group);
					WysiwygEditorIndentToolbarItem(self, group);
				});
				WysiwygEditor.addToolbarItemGroup(row, function( group ) {
					WysiwygEditorJustifyLeftToolbarItem(self, group);
					WysiwygEditorJustifyCenterToolbarItem(self, group);
					WysiwygEditorJustifyRightToolbarItem(self, group);
				});
				WysiwygEditor.addToolbarItemGroup(row, function( group ) {
					WysiwygEditorLinkToolbarItem(self, group);
					WysiwygEditorImageToolbarItem(self, group);
					WysiwygEditorHorizontalLineToolbarItem(self, group);
				});
				WysiwygEditorFontToolbarDropDown(self, row);
				if( self.twoRowToolbar ) {
					lastColumn.style.width = '100%';
					row.appendChild(lastColumn);
				
					row_table = document.createElement('table');
					row_table.setAttribute('cellpadding', 0);
					row_table.setAttribute('cellspacing', 0);
					row_tbody = document.createElement('tbody');
					row = document.createElement('tr');
					row_table.appendChild(row_tbody);
					row_tbody.appendChild(row);
				
					toolbar_row = document.createElement('tr');
					toolbar_tbody.appendChild(toolbar_row);
					toolbar_column = document.createElement('td');
					toolbar_row.appendChild(toolbar_column);
					toolbar_column.appendChild(row_table);

					lastColumn = document.createElement('td');
				}
				WysiwygEditorFontSizeToolbarDropDown(self, row);
				WysiwygEditor.addToolbarItemGroup(row, function( group ) {
					WysiwygEditorColorToolbarItem(self, group, 	'textcolor', uriForServerImageResource('Components/WysiwygEditor/textcolor.png'), I('Change text colour'), 'forecolor');
					WysiwygEditorColorToolbarItem(self, group, 	'backgroundcolor', uriForServerImageResource('Components/WysiwygEditor/backgroundcolor.png'), I('Change highlight colour'), 'backcolor');
				});
				WysiwygEditorSpellCheckLanguageDropDown(self, row);
				WysiwygEditor.addToolbarItemGroup(row, function( group ) {
					WysiwygEditorSpellCheckToolbarItems(self, group);
				});
			
				lastColumn.style.width = '100%';
				row.appendChild(lastColumn);
			
				self.iframe.parentNode.insertBefore(toolbar, self.iframe);
				toolbar.style.display = self.iframe.style.display;
			}
			
			/*setTimeout(function() {
				if( Element.getWidth(toolbar) > Element.getWidth(self.iframe) ) {
					self.iframe.style.width = Element.getWidth(toolbar) + 'px';
					self.iframeDocument.body.style.width = self.iframe.style.width;
				}
			}, 100);*/
			
			self.fireEvent('loaded');
		}, 0);
	};
	self.setData = function( data ) {
		if( self.contentRendersWholeDocument ) {
			if( self.iframeDocument ) {
				self.iframeDocument.open();
				self.iframeDocument.write(data);
				self.iframeDocument.close();
				self.initContentElement();
			}
		} else {
			if( self.contentElement ) {
				self.contentElement.innerHTML = data;
			}
		}
	};
	self.getData = function() {
		if( self.contentElement ) {
			return self.contentElement.innerHTML;
		}
		return '';
	};
	self.enableEditableContent = function() {
		if( self.readOnly == false && self.contentElement ) {
			self.contentElement.contentEditable = true;
		}
	};
	self.disableEditableContent = function() {
		if( self.readOnly == false && self.contentElement ) {
			self.contentElement.contentEditable = false;
		}
	};
}

function WysiwygEditorBoldToolbarItem( editor, group ) {
	WysiwygEditor.addToolbarItem(group, 'bold', '', uriForServerImageResource('Components/WysiwygEditor/bold.png'), I('Make selection bold'), false, editor, function( item ) {
		editor.contentElement.focus();
		editor.iframeDocument.execCommand('bold', false, false);
		editor.fireEvent('change');
		item.active = (item.active ? false : true);
		item.className = (item.active ? 'WysiwygEditorToolbarItemActive' : 'WysiwygEditorToolbarItem');
	}, function( editor, item, container ) {
		if( container ) {
			var style = Element.getStyle(container, 'font-weight');
			if( style == '700' || style == 'bold' )
				return true;
		}
		return false;
	});
}
function WysiwygEditorItalicToolbarItem( editor, group ) {
	WysiwygEditor.addToolbarItem(group, 'italic', '', uriForServerImageResource('Components/WysiwygEditor/italic.png'), I('Make selection italic'), false, editor, function( item ) {
		editor.contentElement.focus();
		editor.iframeDocument.execCommand('italic', false, false);
		editor.fireEvent('change');
		item.active = (item.active ? false : true);
		item.className = (item.active ? 'WysiwygEditorToolbarItemActive' : 'WysiwygEditorToolbarItem');
	}, function( editor, item, container ) {
		if( container && Element.getStyle(container, 'font-style') == 'italic' )
			return true;
		return false;
	});
}
function WysiwygEditorUnderlineToolbarItem( editor, group ) {
	WysiwygEditor.addToolbarItem(group, 'underline', '', uriForServerImageResource('Components/WysiwygEditor/underline.png'), I('Underline selection'), false, editor, function( item ) {
		editor.contentElement.focus();
		editor.iframeDocument.execCommand('underline', false, false);
		editor.fireEvent('change');
		item.active = (item.active ? false : true);
		item.className = (item.active ? 'WysiwygEditorToolbarItemActive' : 'WysiwygEditorToolbarItem');
	}, function( editor, item, container ) {
		if( container && Element.getStyle(container, 'text-decoration').search('underline') > -1 )
			return true;
		return false;
	});
}
function WysiwygEditorStrikethroughToolbarItem( editor, group ) {
	WysiwygEditor.addToolbarItem(group, 'strikethrough', '', uriForServerImageResource('Components/WysiwygEditor/strikethrough.png'), I('Overline selection'), true, editor, function( item ) {
		editor.contentElement.focus();
		editor.iframeDocument.execCommand('strikethrough', false, false);
		editor.fireEvent('change');
		item.active = (item.active ? false : true);
		item.className = (item.active ? 'WysiwygEditorToolbarItemActive' : 'WysiwygEditorToolbarItem');
	}, function( editor, item, container ) {
		if( container && Element.getStyle(container, 'text-decoration').search('line-through') > -1 )
			return true;
		return false;
	});
}

function WysiwygEditorOrderedListToolbarItem( editor, group ) {
	WysiwygEditor.addToolbarItem(group, 'ol', '', uriForServerImageResource('Components/WysiwygEditor/ol.png'), I('Insert numbered list'), false, editor, function( item ) {
		editor.contentElement.focus();
		editor.iframeDocument.execCommand('insertorderedlist', false, false);
		editor.fireEvent('change');
		item.active = (item.active ? false : true);
		item.className = (item.active ? 'WysiwygEditorToolbarItemActive' : 'WysiwygEditorToolbarItem');
	}, function( editor, item, container ) {
		var found = false;
		var node = container;
		while( node && (node != editor.contentElement) ) {
			if( node.nodeType == 1 && node.tagName.toLowerCase() == 'ol' ) {
				found = true;
				break;
			}
			node = node.parentNode;
		}
		if( found )
			return true;
		return false;
	});
}
function WysiwygEditorUnorderedListToolbarItem( editor, group ) {
	WysiwygEditor.addToolbarItem(group, 'ul', '', uriForServerImageResource('Components/WysiwygEditor/ul.png'), I('Insert bullet list'), true, editor, function( item ) {
		editor.contentElement.focus();
		editor.iframeDocument.execCommand('insertunorderedlist', false, false);
		editor.fireEvent('change');
		item.active = (item.active ? false : true);
		item.className = (item.active ? 'WysiwygEditorToolbarItemActive' : 'WysiwygEditorToolbarItem');
	}, function( editor, item, container ) {
		var found = false;
		var node = container
		while( node && (node != editor.contentElement) ) {
			if( node.nodeType == 1 && node.tagName.toLowerCase() == 'ul' ) {
				found = true;
				break;
			}
			node = node.parentNode;
		}
		if( found )
			return true;
		return false;
	});
}

function WysiwygEditorOutdentToolbarItem( editor, group ) {
	WysiwygEditor.addToolbarItem(group, 'outdent', '', uriForServerImageResource('Components/WysiwygEditor/outdent.png'), I('Decrease indent'), false, editor, function( item ) {
		editor.contentElement.focus();
		editor.iframeDocument.execCommand('outdent', false, false);
		editor.fireEvent('change');
	});
}
function WysiwygEditorIndentToolbarItem( editor, group ) {
	WysiwygEditor.addToolbarItem(group, 'indent', '', uriForServerImageResource('Components/WysiwygEditor/indent.png'), I('Increase indent'), true, editor, function( item ) {
		editor.contentElement.focus();
		editor.iframeDocument.execCommand('indent', false, false);
		editor.fireEvent('change');
	});
}

function WysiwygEditorAddCommonJustifyFunction( editor ) {
	editor.previousJustifyItemClicked = null;
	editor.justifyItemClicked = function( item, command ) {
		if( editor.previousJustifyItemClicked )
			editor.previousJustifyItemClicked.className = 'WysiwygEditorToolbarItem';
		editor.previousJustifyItemClicked = item;
		editor.contentElement.focus();
		editor.iframeDocument.execCommand(command, false, false);
		editor.fireEvent('change');
		item.active = (item.active ? false : true);
		item.className = (item.active ? 'WysiwygEditorToolbarItemActive' : 'WysiwygEditorToolbarItem');
	};
}
function WysiwygEditorJustifyLeftToolbarItem( editor, group ) {
	if( editor.justifyItemClicked == undefined ) {
		WysiwygEditorAddCommonJustifyFunction(editor);
	}
	WysiwygEditor.addToolbarItem(group, 'leftjustify', '', uriForServerImageResource('Components/WysiwygEditor/leftjustify.png'), I('Left-align text'), false, editor, function( item ) {
		editor.justifyItemClicked(item, 'justifyleft');
	}, function( editor, item, container ) {
		if( container && Element.getStyle(container, 'text-align') == 'left' )
			return true;
		return false;
	});
}
function WysiwygEditorJustifyCenterToolbarItem( editor, group ) {
	if( editor.justifyItemClicked == undefined ) {
		WysiwygEditorAddCommonJustifyFunction(editor);
	}
	WysiwygEditor.addToolbarItem(group, 'centerjustify', '', uriForServerImageResource('Components/WysiwygEditor/centerjustify.png'), I('Center-align text'), false, editor, function( item ) {
		editor.justifyItemClicked(item, 'justifycenter');
	}, function( editor, item, container ) {
		if( container && Element.getStyle(container, 'text-align') == 'center' )
			return true;
		return false;
	});
}
function WysiwygEditorJustifyRightToolbarItem( editor, group ) {
	if( editor.justifyItemClicked == undefined ) {
		WysiwygEditorAddCommonJustifyFunction(editor);
	}
	WysiwygEditor.addToolbarItem(group, 'rightjustify', '', uriForServerImageResource('Components/WysiwygEditor/rightjustify.png'), I('Right-align text'), false, editor, function( item ) {
		editor.justifyItemClicked(item, 'justifyright');
	}, function( editor, item, container ) {
		if( container && Element.getStyle(container, 'text-align') == 'right' )
			return true;
		return false;
	});
}

function WysiwygEditorHorizontalLineToolbarItem( editor, group ) {
	WysiwygEditor.addToolbarItem(group, 'horizontalline', '', uriForServerImageResource('Components/WysiwygEditor/hr.png'), I('Insert horizontal line'), true, editor, function( item ) {
		editor.contentElement.focus();
		editor.iframeDocument.execCommand('inserthorizontalrule', false, false);
		editor.fireEvent('change');
	});
}

function WysiwygEditorFontToolbarDropDown( editor, toolbar ) {
	var list = [
			{ name: 'Arial',               label: '<span style="font-family:arial">Arial</span>',                             font: "Arial" },
			{ name: 'Arial black',         label: '<span style="font-family:arial black">Arial black</span>',                 font: "'Arial black'" },
			{ name: 'Comic Sans MS',       label: '<span style="font-family:comic sans ms">Comic Sans MS</span>',             font: "'Comic sans MS'" },
			{ name: 'Courier New',         label: '<span style="font-family:courier new">Courier New</span>',                 font: "'Courier New'" },
			{ name: 'Georgia',             label: '<span style="font-family:georgia">Georgia</span>',                         font: "Georgia" },
			{ name: 'Impact',              label: '<span style="font-family:impact">Impact</span>',                           font: "Impact" },
			{ name: 'Lucida Console',      label: '<span style="font-family:lucida console">Lucida Console</span>',           font: "'Lucida Console'" },
			{ name: 'Lucida Sans Unicode', label: '<span style="font-family:lucida sans unicode">Lucida Sans Unicode</span>', font: "'Lucida Sans Unicode'" },
			{ name: 'Tahoma',              label: '<span style="font-family:tahoma">Tahoma</span>',                           font: "Tahoma" },
			{ name: 'Times New Roman',     label: '<span style="font-family:times new roman">Times New Roman</span>',         font: "'Times New Roman'" },
			{ name: 'Trebuchet MS',        label: '<span style="font-family:trebuchet ms">Trebuchet MS</span>',               font: "'Trebuchet MS'" },
			{ name: 'Verdana',             label: '<span style="font-family:verdana">Verdana</span>',                         font: "Verdana" }
		];
	WysiwygEditor.addToolbarDropDown(toolbar, I('Font'), 155, list, editor, function(item, itemLabel) {
		editor.restoreLatestSelection();
		editor.iframeDocument.execCommand('fontname', false, item.font);
		editor.fireEvent('change');
	}, function( itemLabel ) {
		var container = editor.latestSelectionContainer();
		if( container ) {
			var found = false;
			var fontFamily;
			if( Prototype.Browser.IE ) {
				if( container.tagName.toLowerCase() == 'font' ) {
					fontFamily = container.getAttribute('face');
				}
				if( !fontFamily ) {
					fontFamily = Element.getStyle(container, 'font-family');
				}
			} else {
				fontFamily = Element.getStyle(container, 'font-family');
			}
			if( fontFamily ) {
				var size = list.length;
				for( var i = 0; i < size; i++ ) {
					var item = list[i];
					if( item.font == fontFamily ) {
						if( fontFamily != editor.previousSelectionFontFamily ) {
							itemLabel.innerHTML = item.name;
						}
						editor.previousSelectionFontFamily = item.font;
						found = true;
						break;
					}
				}
			}
			if( found == false && editor.previousSelectionFontFamily != I('Font') ) {
				itemLabel.innerHTML = I('Font');
				editor.previousSelectionFontFamily = I('Font');
			}
		}
	});
}
function WysiwygEditorFontSizeToolbarDropDown( editor, toolbar ) {
	var list = [
			{ name: '10', label: '<font size="1">10</font>', size: '1' },
			{ name: '13', label: '<font size="2">13</font>', size: '2' },
			{ name: '14', label: '<font size="3">14</font>', size: '3' },
			{ name: '16', label: '<font size="4">16</font>', size: '4' },
			{ name: '24', label: '<font size="5">24</font>', size: '5' },
			{ name: '32', label: '<font size="6">32</font>', size: '6' },
			{ name: '48', label: '<font size="7">48</font>', size: '7' }
		];
	WysiwygEditor.addToolbarDropDown(toolbar, I('Size'), 70, list, editor, function(item, itemLabel) {
		editor.restoreLatestSelection();
		editor.iframeDocument.execCommand('FontSize', false, item.size);
		editor.fireEvent('change');
	}, function( itemLabel ) {
		var container = editor.latestSelectionContainer();
		if( container ) {
			var found = false;
			var fontSize;
			if( Prototype.Browser.IE ) {
				if( container.tagName.toLowerCase() == 'font' ) {
					fontSize = container.getAttribute('size');
				}
				if( !fontSize ) {
					fontSize = Element.getStyle(container, 'font-size');
				}
			} else {
				fontSize = Element.getStyle(container, 'font-size');
				fontSize = fontSize.replace(/[px]/g, '');
			}
			if( fontSize ) {
				var size = list.length;
				for( var i = 0; i < size; i++ ) {
					var item = list[i];
					var compareTo = (Prototype.Browser.Gecko || Prototype.Browser.WebKit ? item.name : item.size);
					if( compareTo == fontSize ) {
						if( fontSize != editor.previousSelectionFontSize ) {
							itemLabel.innerHTML = item.name;
						}
						editor.previousSelectionFontSize = compareTo;
						found = true;
						break;
					}
				}
			}
			if( found == false && editor.previousSelectionFontSize != I('Size') ) {
				itemLabel.innerHTML = I('Size');
				editor.previousSelectionFontSize = I('Size');
			}
		}
	});
}

function WysiwygEditorLinkToolbarItem( editor, group ) {
	WysiwygEditor.addToolbarItem(group, 'link', '', uriForServerImageResource('Components/WysiwygEditor/link.png'), I('Insert link'), false, editor, function( item ) {
		if( editor.linkPopup == undefined ) {
			var textTextfield = null;
			var urlTextfield = null;
			var webAddressLabel = null;
			var webAddressRadioButton = null;
			var emailAddressLabel = null;
			var emailAddressRadioButton = null;
			var descriptionLabel = null;
			var table = WysiwygEditor.createTable(function( table, tbody ) {
				table.style.width = '100%';
				WysiwygEditor.createTableRow(tbody, function( row ) {
					WysiwygEditor.createTableColumn(row, function( column ) {
						column.style.padding = '5px';
						column.style.whiteSpace = 'nowrap';
						column.innerHTML = I('Text to display') + ':';
					});
					WysiwygEditor.createTableColumn(row, function( column ) {
						var input = document.createElement('input');
						input.setAttribute('type', 'text');
						input.style.width = '99%';
						column.style.padding = '5px';
						column.style.width = '100%';
						column.appendChild(input);
						textTextfield = input;
					});
				});
				WysiwygEditor.createTableRow(tbody, function( row ) {
					row.style.verticalAlign = 'bottom';
					WysiwygEditor.createTableColumn(row, function( column ) {
						column.style.padding = '5px';
						column.style.whiteSpace = 'nowrap';
						column.appendChild(WysiwygEditor.createElement('div', function( div ) {
							div.style.width = '120px';
							div.style.marginBottom = '2px';
							div.innerHTML = I('Link to') + ':';
						}));
						column.appendChild(WysiwygEditor.createElement('div', function( div ) {
							div.style.marginBottom = '2px';
							div.style.cursor = 'pointer';
							div.appendChild(WysiwygEditor.createElement('input', function( input ) {
								input.setAttribute('type', 'radio');
								input.style.verticalAlign = (Prototype.Browser.IE ? 'middle' : 'bottom');
								input.style.marginRight = '0px';
								webAddressRadioButton = input;
							}));
							div.appendChild(document.createTextNode('\u00a0'));
							div.appendChild(WysiwygEditor.createElement('span', function( span ) {
								span.innerHTML = I('Web address');
								webAddressLabel = span;
							}));
						}));
						column.appendChild(WysiwygEditor.createElement('div', function( div ) {
							div.style.cursor = 'pointer';
							div.appendChild(WysiwygEditor.createElement('input', function( input ) {
								input.setAttribute('type', 'radio');
								input.style.verticalAlign = (Prototype.Browser.IE ? 'middle' : 'bottom');
								input.style.marginRight = '0px';
								emailAddressRadioButton = input;
							}));
							div.appendChild(document.createTextNode('\u00a0'));
							div.appendChild(WysiwygEditor.createElement('span', function( span ) {
								span.innerHTML = I('Email address');
								emailAddressLabel = span;
							}));
						}));
					});
					WysiwygEditor.createTableColumn(row, function( column ) {
						column.style.width = '100%';
						column.style.padding = '5px';
						column.appendChild(WysiwygEditor.createElement('div', function( div ) {
							div.style.fontWeight = 'bold';
							div.style.marginBottom = '2px';
							div.innerHTML = I('To what URL should this link go?');
							descriptionLabel = div;
						}));
						column.appendChild(WysiwygEditor.createElement('input', function( input ) {
							input.setAttribute('type', 'text');
							input.style.width = '99%';
							urlTextfield = input;
						}));
					});
				});
			});
			editor.linkPopup = WysiwygEditor.createElement('div', function( div ) {
				div.className = 'WysiwygEditorItemPopup';
				div.style.display = 'none';
				div.style.width = '450px';
				div.appendChild(table);
				div.appendChild(WysiwygEditor.createItemPopupFooter(function( footer ) {
					WysiwygEditor.addItemPopupFooterButton(footer, I('Save'), uriForApplicationImageResource('submit_save.png'), '#96D754', function() {
						if( editor.linkSelectedContainer ) {
							editor.linkSelectedContainer.href = editor.linkTextfieldURL.value;
							editor.fireEvent('change');
						} else if( editor.linkSelectedText ) {
							editor.restoreLatestSelection();
							editor.iframeDocument.execCommand('createLink', false, editor.linkTextfieldURL.value);
							editor.fireEvent('change');
						} else {
							var node = WysiwygEditor.createElement('a', function( a ) {
								a.href = editor.linkTextfieldURL.value;
								a.innerHTML = editor.linkTextfieldText.value;
							}, editor.iframeDocument);
							var selection = rangy.getIframeSelection(editor.iframe);
							var range = editor.latestSelectionRange;
							range.collapse(false);
							range.insertNode(node);
							range.collapseAfter(node);
							selection.setSingleRange(range);
							editor.fireEvent('change');
						}
						editor.hideLinkPopup();
					});
					WysiwygEditor.addItemPopupFooterButton(footer, I('Cancel'), uriForApplicationImageResource('submit_arrow_right.png'), '#FCAB46', function() {
						editor.hideLinkPopup();
					});
				}));
			});
			editor.hideLinkPopup = function() {
				Element.hide(editor.linkPopup);
				item.className = 'WysiwygEditorToolbarItem';
			};
			document.body.appendChild(editor.linkPopup);
			editor.linkWebAddressRadioButton = webAddressRadioButton;
			editor.linkWebAddressLabel = webAddressLabel;
			editor.linkEmailAddressRadioButton = emailAddressRadioButton;
			editor.linkEmailAddressLabel = emailAddressLabel;
			editor.linkDescriptionLabel = descriptionLabel;
			editor.linkTextfieldText = textTextfield;
			editor.linkTextfieldURL = urlTextfield;
			webAddressRadioButton.onclick = webAddressLabel.onclick = function() {
				webAddressRadioButton.checked = true;
				webAddressLabel.style.fontWeight = 'bold';
				emailAddressRadioButton.checked = false;
				emailAddressLabel.style.fontWeight = 'normal';
				descriptionLabel.innerHTML = I('To what URL should this link go?');
			};
			emailAddressRadioButton.onclick = emailAddressLabel.onclick = function() {
				emailAddressRadioButton.checked = true;
				emailAddressLabel.style.fontWeight = 'bold';
				webAddressRadioButton.checked = false;
				webAddressLabel.style.fontWeight = 'normal';
				descriptionLabel.innerHTML = I('To what email address should this link?');
			};
		}
		if( editor.hideImagePopup ) {
			editor.hideImagePopup();
		}
		if( Element.visible(editor.linkPopup) ) {
			editor.hideLinkPopup();
		} else {
			if( !editor.latestSelection ) {
				editor.latestSelection = rangy.getIframeSelection(editor.iframe);
				editor.latestSelectionRange = editor.latestSelection.getRangeAt(0).cloneRange();
			}
			var selectedText = editor.latestSelection.toString();
			var selectedContainer = editor.latestSelectionRange.startContainer;
			if( selectedContainer.nodeType == 3 )
				selectedContainer = selectedContainer.parentNode;
			editor.linkSelectedText = selectedText;
			editor.linkWebAddressRadioButton.checked = true;
			editor.linkWebAddressLabel.style.fontWeight = 'bold';
			editor.linkEmailAddressRadioButton.checked = false;
			editor.linkEmailAddressLabel.style.fontWeight = 'normal';
			editor.linkDescriptionLabel = I('To what URL should this link go?');
			editor.linkSelectedContainer = null;
			editor.linkTextfieldURL.value = '';
			editor.linkTextfieldText.value = '';
			editor.linkTextfieldText.disabled = false;
			if( selectedText ) {
				editor.linkTextfieldText.disabled = true;
				editor.linkTextfieldText.value = selectedText;
			}
			editor.linkSelectedContainer = null;
			if( selectedContainer && selectedContainer.tagName.toLowerCase() == 'a' ) {
				editor.linkSelectedContainer = selectedContainer;
				editor.linkTextfieldURL.value = selectedContainer.href;
				editor.linkTextfieldText.disabled = true;
				editor.linkTextfieldText.value = selectedContainer.innerHTML.stripTags();
			} else if( selectedContainer && selectedContainer.parentNode && selectedContainer.parentNode.tagName.toLowerCase() == 'a' ) {
				editor.linkSelectedContainer = selectedContainer.parentNode;
				editor.linkTextfieldURL.value = selectedContainer.parentNode.href;
				editor.linkTextfieldText.disabled = true;
				editor.linkTextfieldText.value = selectedContainer.parentNode.innerHTML.stripTags();
			}
			Element.clonePosition(editor.linkPopup, item, {
					setWidth: false,
					setHeight: false,
					offsetLeft: 0 - (Element.getWidth(editor.linkPopup) / 2),
					offsetTop: Element.getHeight(item.parentNode) 
				});
			Element.show(editor.linkPopup);
			item.className = 'WysiwygEditorToolbarItemActive';
		}
	}, function( editor, item ) {
	});
}

function WysiwygEditorImageToolbarItem( editor, group ) {
	WysiwygEditor.addToolbarItem(group, 'image', '', uriForServerImageResource('Components/WysiwygEditor/image.png'), I('Insert image'), false, editor, function( item ) {
		if( editor.imagePopup == undefined ) {
			editor.imagePopup = WysiwygEditor.createElement('div', function( div ) {
				div.className = 'WysiwygEditorItemPopup';
				div.style.display = 'none';
				div.style.width = '450px';
				div.appendChild(WysiwygEditor.createTable(function( table, tbody ) {
					WysiwygEditor.createTableRow(tbody, function( row ) {
						WysiwygEditor.createTableColumn(row, function( column ) {
							column.style.padding = '5px';
							column.appendChild(WysiwygEditor.createElement('div', function( imageWrapper ) {
								imageWrapper.style.backgroundColor = '#a3d7ff';
								imageWrapper.appendChild(WysiwygEditor.createElement('div', function( imageContainer ) {
									imageContainer.style.width = '128px';
									imageContainer.style.height = '128px';
									imageContainer.style.padding = '5px';
									imageContainer.style.display = 'table-cell';
									imageContainer.style.verticalAlign = 'middle';
									imageContainer.appendChild(WysiwygEditor.createElement('img', function( image ) {
										image.src = 'http://wedogames.se/logo.png';
										image.style.maxWidth = '128px';
										image.style.maxHeight = '128px';

									}));
								}));
							}));
						});
						WysiwygEditor.createTableColumn(row, function( column ) {
							column.style.padding = '5px';
							column.appendChild(WysiwygEditor.createElement('div', function( imageContainer ) {
								imageContainer.appendChild(WysiwygEditor.createElement('img', function( image ) {
									image.src = 'http://laggarbo.net/images/laggarbo.gif';
									image.style.maxWidth = '128px';
									image.style.maxHeight = '128px';
									image.style.margin = '5px';
								}));
							}));
						});
						WysiwygEditor.createTableColumn(row, function( column ) {
							column.style.padding = '5px';
							column.appendChild(WysiwygEditor.createElement('div', function( imageContainer ) {
								imageContainer.appendChild(WysiwygEditor.createElement('img', function( image ) {
									image.src = 'http://tobias.laggarbo.net/iron_man.gif';
									image.style.maxWidth = '128px';
									image.style.maxHeight = '128px';
									image.style.margin = '5px';
								}));
							}));
						});
					});
				}));
				div.appendChild(WysiwygEditor.createItemPopupFooter(function( footer ) {
					WysiwygEditor.addItemPopupFooterButton(footer, I('Save'), uriForApplicationImageResource('submit_save.png'), '#96D754', function() {
						editor.hideImagePopup();
					});
					WysiwygEditor.addItemPopupFooterButton(footer, I('Cancel'), uriForApplicationImageResource('submit_arrow_right.png'), '#FCAB46', function() {
						editor.hideImagePopup();
					});
				}));
			});
			editor.hideImagePopup = function() {
				Element.hide(editor.imagePopup);
				item.className = 'WysiwygEditorToolbarItem';
			};
			document.body.appendChild(editor.imagePopup);
		}
		if( editor.hideLinkPopup ) {
			editor.hideLinkPopup();
		}
		if( Element.visible(editor.imagePopup) ) {
			editor.hideImagePopup();
		} else {
			Element.clonePosition(editor.imagePopup, item, {
					setWidth: false,
					setHeight: false,
					offsetLeft: 0 - (Element.getWidth(editor.imagePopup) / 2),
					offsetTop: Element.getHeight(item.parentNode) 
				});
			Element.show(editor.imagePopup);
			item.className = 'WysiwygEditorToolbarItemActive';
		}
	});
}

function WysiwygEditorColorToolbarItem( editor, group, name, icon, title, command ) {
	WysiwygEditor.addToolbarItem(group, name, '', icon, title, false, editor, function( item ) {
		if( editor.colorPopup == undefined ) {
			var colors = [
				[ '#000', '#800000', '#8B4513', '#2F4F4F', '#008080', '#000080', '#4B0082', '#696969' ],
				[ '#B22222', '#A52A2A', '#DAA520', '#006400', '#40E0D0', '#0000CD', '#800080', '#808080' ],
				[ '#F00', '#FF8C00', '#FFD700', '#008000', '#0FF', '#00F', '#EE82EE', '#A9A9A9' ],
				[ '#FFA07A', '#FFA500', '#FFFF00', '#00FF00', '#AFEEEE', '#ADD8E6', '#DDA0DD', '#D3D3D3' ],
				[ '#FFF0F5', '#FAEBD7', '#FFFFE0', '#F0FFF0', '#F0FFFF', '#F0F8FF', '#E6E6FA', '#FFF' ]
			];
			var moreColors = [
				[ "#000000", "#003300", "#006600", "#009900", "#00cc00", "#00ff00", "#330000", "#333300", "#336600", "#339900", "#33cc00", "#33ff00", "#660000", "#663300", "#666600", "#669900", "#66cc00", "#66ff00" ],
				[ "#000033", "#003333", "#006633", "#009933", "#00cc33", "#00ff33", "#330033", "#333333", "#336633", "#339933", "#33cc33", "#33ff33", "#660033", "#663333", "#666633", "#669933", "#66cc33", "#66ff33" ],
				[ "#000066", "#003366", "#006666", "#009966", "#00cc66", "#00ff66", "#330066", "#333366", "#336666", "#339966", "#33cc66", "#33ff66", "#660066", "#663366", "#666666", "#669966", "#66cc66", "#66ff66" ],
				[ "#000099", "#003399", "#006699", "#009999", "#00cc99", "#00ff99", "#330099", "#333399", "#336699", "#339999", "#33cc99", "#33ff99", "#660099", "#663399", "#666699", "#669999", "#66cc99", "#66ff99" ],
				[ "#0000cc", "#0033cc", "#0066cc", "#0099cc", "#00cccc", "#00ffcc", "#3300cc", "#3333cc", "#3366cc", "#3399cc", "#33cccc", "#33ffcc", "#6600cc", "#6633cc", "#6666cc", "#6699cc", "#66cccc", "#66ffcc" ],
				[ "#0000ff", "#0033ff", "#0066ff", "#0099ff", "#00ccff", "#00ffff", "#3300ff", "#3333ff", "#3366ff", "#3399ff", "#33ccff", "#33ffff", "#6600ff", "#6633ff", "#6666ff", "#6699ff", "#66ccff", "#66ffff" ],
				[ "#990000", "#993300", "#996600", "#999900", "#99cc00", "#99ff00", "#cc0000", "#cc3300", "#cc6600", "#cc9900", "#cccc00", "#ccff00", "#ff0000", "#ff3300", "#ff6600", "#ff9900", "#ffcc00", "#ffff00" ],
				[ "#990033", "#993333", "#996633", "#999933", "#99cc33", "#99ff33", "#cc0033", "#cc3333", "#cc6633", "#cc9933", "#cccc33", "#ccff33", "#ff0033", "#ff3333", "#ff6633", "#ff9933", "#ffcc33", "#ffff33" ],
				[ "#990066", "#993366", "#996666", "#999966", "#99cc66", "#99ff66", "#cc0066", "#cc3366", "#cc6666", "#cc9966", "#cccc66", "#ccff66", "#ff0066", "#ff3366", "#ff6666", "#ff9966", "#ffcc66", "#ffff66" ],
				[ "#990099", "#993399", "#996699", "#999999", "#99cc99", "#99ff99", "#cc0099", "#cc3399", "#cc6699", "#cc9999", "#cccc99", "#ccff99", "#ff0099", "#ff3399", "#ff6699", "#ff9999", "#ffcc99", "#ffff99" ],
				[ "#9900cc", "#9933cc", "#9966cc", "#9999cc", "#99cccc", "#99ffcc", "#cc00cc", "#cc33cc", "#cc66cc", "#cc99cc", "#cccccc", "#ccffcc", "#ff00cc", "#ff33cc", "#ff66cc", "#ff99cc", "#ffcccc", "#ffffcc" ],
				[ "#9900ff", "#9933ff", "#9966ff", "#9999ff", "#99ccff", "#99ffff", "#cc00ff", "#cc33ff", "#cc66ff", "#cc99ff", "#ccccff", "#ccffff", "#ff00ff", "#ff33ff", "#ff66ff", "#ff99ff", "#ffccff", "#ffffff" ]
			];
			var colorsTable = WysiwygEditor.createTable(function( table, tbody ) {
				//table.style.width = '100%';
				colors.each(function(colorRow) {
					WysiwygEditor.createTableRow(tbody, function( row ) {
						colorRow.each(function(color) {
							WysiwygEditor.createTableColumn(row, function( column ) {
								column.className = 'WysiwygEditorColorItemContainer';
								column.onmousedown = item.onselectstart = function() { return false; };
								column.unselectable = true;
								column.appendChild(WysiwygEditor.createElement('div', function(div) {
									div.className = 'WysiwygEditorColorItem';
									div.onmousedown = item.onselectstart = function() { return false; };
									div.unselectable = true;
									div.style.backgroundColor = color;
									div.onclick = function() {
										editor.colorSelectorOnclick(color);
									};
								}));
							});
						});
					});
				});
			});
			var moreColorsPreview = null;
			var moreColorsPreviewTable = WysiwygEditor.createTable(function( table, tbody ) {
				table.style.width = '100%';
				table.style.marginTop = '1px';
				table.style.marginBottom = '3px';
				table.style.marginLeft = '3px';
				table.style.marginRight = '3px';
				table.style.display = 'none',
				WysiwygEditor.createTableRow(tbody, function( row ) {
					moreColorsPreview = WysiwygEditor.createTableColumn(row, function( column ) {
						column.className = 'WysiwygEditorMoreColorsPreview';
						column.onmousedown = item.onselectstart = function() { return false; };
						column.unselectable = true;
					});
				});
			});
			var moreColorsTable = WysiwygEditor.createTable(function( table, tbody ) {
				table.style.margin = '2px';
				table.style.display = 'none';
				//table.style.border = '1px solid #999';
				table.onmouseout = function() {	
					moreColorsPreview.style.backgroundColor = '#FFF';
				};
				moreColors.each(function(colorRow) {
					WysiwygEditor.createTableRow(tbody, function( row ) {
						colorRow.each(function(color) {
							WysiwygEditor.createTableColumn(row, function( column ) {
								column.className = 'WysiwygEditorMoreColorItemContainer';
								column.onmousedown = item.onselectstart = function() { return false; };
								column.unselectable = true;
								column.appendChild(WysiwygEditor.createElement('div', function(div) {
									div.className = 'WysiwygEditorMoreColorItem';
									div.onmousedown = item.onselectstart = function() { return false; };
									div.unselectable = true;
									div.style.backgroundColor = color;
									div.onmouseover = function() {
										moreColorsPreview.style.backgroundColor = color;
									};
									div.onclick = function() {
										editor.colorSelectorOnclick(color);
									};
								}));
							});
						});
					});
				});
			});
			var popup = WysiwygEditor.createElement('div', function( div ) {
				div.className = 'WysiwygEditorItemPopup';
				div.align = 'center';
				div.style.display = 'none';
				//div.style.width = '150px';
				div.appendChild(colorsTable);
				div.appendChild(WysiwygEditor.createElement('div', function( div ) {
					div.className = 'WysiwygEditorMoreColorsButton';
					div.innerHTML = I('More Colours...');
					div.align = 'center';
					div.onmousedown = item.onselectstart = function() { return false; };
					div.unselectable = true;
					div.onclick = function() {
						if( Element.visible(moreColorsTable) ) {
							Element.hide(moreColorsTable);
							Element.hide(moreColorsPreviewTable);
						} else {
							Element.show(moreColorsTable);
							Element.show(moreColorsPreviewTable);
							moreColorsPreviewTable.style.width = Element.getWidth(moreColorsTable) + 'px';
						}
					};
				}));
				div.appendChild(moreColorsTable);
				div.appendChild(moreColorsPreviewTable);
			});
			editor.colorPopup = popup;
			Element.hide(editor.colorPopup);
			document.body.appendChild(popup);
		}
		
		if( editor.colorSelectorPreviousToolbarItem && editor.colorSelectorCurrentItem != name ) {
			Element.hide(editor.colorPopup);
			editor.colorSelectorPreviousToolbarItem.className = 'WysiwygEditorToolbarItem';
		}
		if( Element.visible(editor.colorPopup) ) {
			Element.hide(editor.colorPopup);
			item.className = 'WysiwygEditorToolbarItem';
			editor.colorSelectorSavedRange = null;
			editor.colorSelectorPreviousToolbarItem = null;
		} else {
			var selection = rangy.getSelection(editor.iframeWindow);
			editor.colorSelectorSavedRange = selection.getRangeAt(0).cloneRange();
			editor.colorSelectorPreviousToolbarItem = item;
			Element.clonePosition(editor.colorPopup, item, {
					setWidth: false,
					setHeight: false,
					offsetLeft: 0 - (Element.getWidth(editor.colorPopup) / 2),
					offsetTop: Element.getHeight(item.parentNode) 
				});
			Element.show(editor.colorPopup);
			item.className = 'WysiwygEditorToolbarItemActive';
			editor.colorSelectorCurrentItem = name;
			editor.colorSelectorOnclick = function( color ) {
				editor.restoreLatestSelection();
				editor.iframeDocument.execCommand(command, false, color);
				Element.hide(editor.colorPopup);
				item.className = 'WysiwygEditorToolbarItem';
				editor.colorSelectorSavedRange = null;
				editor.fireEvent('change');
			};
		}
	});
}

function WysiwygEditorSpellCheckSetup( editor ) {
	editor.spellcheck = {
		list: [],
		words: {},
		misspelled_words: {},
		language: 0,
		
		reset: function() {
			this.list = [];
			this.words = {};
		},
		setLanguage: function( language ) {
			this.language = language;
		},
		check: function( element ) {
			var wordNodes = new Array();
			var node = element.firstChild;
			while( node ) {
				if( (node.nodeType == 1) && (node.className == 'wysiwyg-spell-check-word') ) {
					node.className = '';
					wordNodes.push(node);
				} else if( node.nodeType == 3 ) {
					wordNodes.push(node);
				}

				if( node.firstChild ) {
					node = node.firstChild;
				} else if( node.nextSibling ) {
					node = node.nextSibling;
				} else {
					for( node = node.parentNode; node; node = node.parentNode ) {
						if( node == element ) {
							node = null;
							break;
						}
						if( node.nextSibling ) {
							node = node.nextSibling;
							break;
						}
					}
				}
			}

			var i;
			var wordNodesLength = wordNodes.length;

			for( i = 0; i < wordNodesLength; i++ ) {
				this.setWord(wordNodes[i], this.getInnerText(wordNodes[i]));
			}
		
			var captured_this = this;
			mcam.fireCallbackRequest('spell_check_perform', function( value ) {
				var data = JSON.parse(value);
				var i;
				var j;
				captured_this.misspelled_words = {};
				for( i = 0; i < data.misspelled_words.length; i++ ) {
					var item = data.misspelled_words[i];
					captured_this.misspelled_words[item.word] = true;
					if( captured_this.words[item.word] && !captured_this.words[item.word].ignore ) {
						for( j = 0; j < captured_this.words[item.word].nodes.length; j++ ) {
							var node = captured_this.words[item.word].nodes[j];
							node.style.backgroundColor = 'red';
							if( item.suggestions.length > 0 ) {
								node.style.backgroundColor = 'yellow';
							}
							captured_this.words[item.word].suggestions = item.suggestions;
						}
					}
				}
			}, { words: this.list, language: this.language });
		},
		finish: function( element ) {
			var i;
	
			for( i = 0; i < this.list.length; i++ ) {
				var word = this.list[i];
				this.words[word].nodes = new Array();
			}
	
			var nodes = new Array();
	
			var node = element;
			while( node ) {
				if( (node.nodeType == 1) && (node.className == 'wysiwyg-spell-check-word') ) {
					nodes.push(node);
				}
				if ( node.firstChild ) {
					node = node.firstChild;
				} else if( node.nextSibling ) {
					node = node.nextSibling;
				} else {
					for( node = node.parentNode; node; node = node.parentNode ) {
						if( node == element ) {
							node = null;
							break;
						}
						if( node.nextSibling ) {
							node = node.nextSibling;
							break;
						}
					}
				}
			}
	
			var nodesLength = nodes.length;
			var j;
	
			for ( i = 0; i < nodesLength; i++ ) {
				node = nodes[i];
				var childNodesLength = node.childNodes.length;
				for ( j = 0; j < childNodesLength; j++ ) {
					node.parentNode.insertBefore(node.childNodes[j], node);
				}
				node.parentNode.removeChild(node);
			}
		},
		ignore: function ( word ) {
			if( this.words[word] ) {
				this.words[word].ignore = true;
				var i;
				var nodesLength = this.words[word].nodes.length;
				for( i = 0; i < nodesLength; i++ ) {
					var node = this.words[word].nodes[i];
					node.style.backgroundColor = '';
				}
			}
		},
		learn: function( word ) {
			if( this.words[word] ) {
				mcam.fireCallbackRequest('spell_check_learn_word', null, { word: word, language: this.language });
				this.ignore(word);
			}
		},
		suggestions: function( word ) {
			return this.words[word].suggestions;
		},
		isWordMisspelled: function( word ) {
			return (this.misspelled_words[word] ? true : false);
		},
		isWordIgnored: function( word ) {
			return this.words[word].ignore;
		},
		getInnerText: function( node ) {
			if ( !node ) {
				return '';
			}
	
			switch ( node.nodeType ) {
				case 1:
					if ( node.tagName == 'BR' ) {
						return '\n';
					} else {
						var string = '';
						var i;
						for( i = 0; i < node.childNodes.length; i++ ) {
							string += this.getInnerText(node.childNodes[i]);
						}
						return string;
					}
					break;
				case 3:
					return node.nodeValue;
					break;
			};
		},
		setWord: function( element, word ) {
			var doc = element.ownerDocument || element.document;
			var wordLength = word.length;
			var string = '';
			var n = 0;
			var i;

			for( i = 0; i < wordLength; i++ ) {
				var character = word.substr( i, 1 );

				// Match all but numbers, letters, - and '
				if( !character.match( /[AaBbCcDdEeFfGgHhiiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZzÅåÄäÖöÜüßÆæØøÀàÁáÂâÇçÈèÉéÊêËëÎîÏïÍíÔôÓóŒœÙùÚúÛûÑñĄąĘęÓóĆćŁłŃńŚśŹźŻż\']/ ) ) {
					var newNode;

					if( string ) {
						element.parentNode.insertBefore(this.createWordNode(string, doc), element);
					}

					if( character == '\n' ) {
						newNode = doc.createElement('br');
					} else {
						newNode = doc.createTextNode(character);
					}

					element.parentNode.insertBefore(newNode, element);
					string = '';
					n++;
				} else {
					string += character;
				}
			}

			if( string ) {
				element.parentNode.insertBefore(this.createWordNode(string, doc), element);
			}

			element.parentNode.removeChild(element);

			return n;
		},
		createWordNode: function( word, doc ) {
			var node = doc.createElement('span');
			node.className = 'wysiwyg-spell-check-word';
			node.appendChild(doc.createTextNode(word));
	
			if( !this.words[word] ) {
				this.list.push(word);
				this.words[word] = {};
				this.words[word].ignore = false;
				this.words[word].suggestions = new Array();
				this.words[word].nodes = new Array();
			}
			this.words[word].nodes.push(node);
	
			return node;
		}
	};
}

function WysiwygEditorSpellCheckLanguageDropDown( editor, toolbar ) {
	var list = editor.getLanguages();
	var listLength = list.length
	WysiwygEditor.addToolbarDropDown(toolbar, I('Language'), 105, list, editor, function(item, itemLabel) {
		itemLabel.innerHTML = item.label;
		editor.spellcheck.setLanguage(item.language);
	});
	for( var i = 0; i < listLength; i++ ) {
		var item = list[i];
		if( item.selected ) {
			editor.spellcheck.setLanguage(item.language);
		}
	}
}

function WysiwygEditorSpellCheckToolbarItems( editor, toolbar ) {
	var check_button = null;
	var finish_button = null;
	var spell_check_mode = false;
	check_button = WysiwygEditor.addToolbarItem(toolbar, 'spellcheck', I('Perform Spell Check'), uriForServerImageResource('Components/WysiwygEditor/check.png'), I('Perform spell check'), false, editor, function( item ) {
		Element.hide(check_button);
		Element.show(finish_button);
		spell_check_mode = true;
		editor.spellcheck.check(editor.contentElement);
	});
	finish_button = WysiwygEditor.addToolbarItem(toolbar, 'finishspellcheck', I('Finish Spell Check'), uriForServerImageResource('Components/WysiwygEditor/done.png'), I('Finish spell check'), true, editor, function( item ) {
		Element.hide(finish_button);
		Element.show(check_button);
		spell_check_mode = false;
		editor.spellcheck.finish(editor.contentElement);
	});
	editor.onEvent('keyup', function() {
		if( spell_check_mode ) {
			Element.hide(finish_button);
			Element.show(check_button);
			spell_check_mode = false;
			editor.spellcheck.finish(editor.contentElement);
		}
	});
	editor.onEvent('contextmenu', function() {
		if( spell_check_mode ) {
			var container = editor.latestSelectionContainer();
			if( container && container.className == 'wysiwyg-spell-check-word' ) {
				var word = container.innerHTML;
				word = word.strip();
				if( editor.spellcheck.words[word] ) {
					var mainSuggestions = 0;
					var mainSuggestionsGroup = null;
					var moreSuggestionsGroup = null;
					editor.spellcheck.words[word].suggestions.each(function(suggestion) {
						if( mainSuggestions < 5 ) {
							if( ! mainSuggestionsGroup ) {
								mainSuggestionsGroup = editor.contextMenu.addGroup();
							}
							mainSuggestionsGroup.addItem(uriForServerImageResource('Components/WysiwygEditor/replace.png'), suggestion, function(e, i) {
								Element.replace(container, suggestion);
								e.contextMenu.hide();
								e.fireEvent('change');
							});
							mainSuggestions++;
						} else {
							if( ! moreSuggestionsGroup ) {
								editor.contextMenu.addGroup(function( group ) {
									group.addMenu(I('More'), function( menu ) {
										moreSuggestionsGroup = menu.addGroup();
									});
								});
							}
							moreSuggestionsGroup.addItem(uriForServerImageResource('Components/WysiwygEditor/replace.png'), suggestion, function(e, i) {
								Element.replace(container, suggestion);
								e.contextMenu.hide();
								e.fireEvent('change');
							});
						}
					});
					editor.contextMenu.addGroup(function(group) {
						group.addItem(uriForServerImageResource('Components/WysiwygEditor/add.png'), I('Add to word list'), function(e, i) {
							e.spellcheck.learn(word);
							e.contextMenu.hide();
						});
						group.addItem(uriForServerImageResource('Components/WysiwygEditor/ignore.png'), I('Ignore'), function(e, i) {
							e.spellcheck.ignore(word);
							e.contextMenu.hide();
						});
					});
				}
			}
		}
	});
	Element.show(check_button);
	Element.hide(finish_button);
}

function ComponentWyiswygEditor( id ) {
	var self = ComponentTextfield(id);
	
	self._editor = new WysiwygEditorObject();
	self._showToolbar = true;
	
	self.editor = function() {
		return self._editor;
	}
	self.setLanguages = function( languages ) {
		self._editor.setLanguages(languages);
	};
	self.setContentRendersWholeDocument = function( value ) {
		self._editor.setContentRendersWholeDocument(value);
	};
	self.setReadOnly = function( value ) {
		self._editor.setReadOnly(value);
	};
	self.enable = function() {
		self._enabled = true;
		self._editor.setReadOnly(false);
		self._editor.enableEditableContent();
	};
	self.disable = function() {
		self._enabled = false;
		self._editor.setReadOnly(true);
		self._editor.disableEditableContent();
	};
	self.setShowToolbar = function( value ) {
		self._showToolbar = value;
	};
	self.showToolbar = function() {
		Element.show(self.toolbarNode());
	};
	self.hideToolbar = function() {
		Element.hide(self.toolbarNode());
	};
	self.setTwoRowToolbar = function( value ) {
		self._editor.setTwoRowToolbar(value);
	};
	
	self.editorNode = function() {
		return document.getElementById(self.identifier() + '.IFrame');
	};
	self.toolbarNode = function() {
		return document.getElementById(self.identifier() + '.WysiwygEditorToolbar');
	};
	
	self.visible = function() {
		return Element.visible(self.editorNode());
	};
	self.show = function() {
		if( self.editorNode() ) {
			Element.show(self.editorNode());
			// Workaround for bug in Firefox.
			// (https://bugzilla.mozilla.org/show_bug.cgi?id=467333)
			// (https://bugzilla.mozilla.org/show_bug.cgi?id=504268)
			if( self._editor.readOnly == false ) {
				setTimeout(function() {
					self._editor.enableEditableContent();
				}, 100);
			}
		}
		if( self.toolbarNode() ) {
			Element.show(self.toolbarNode());
		}
	}
	self.hide = function() {
		if( self.editorNode() ) {
			Element.hide(self.editorNode());
			// Workaround for bug in Firefox.
			// (https://bugzilla.mozilla.org/show_bug.cgi?id=467333)
			// (https://bugzilla.mozilla.org/show_bug.cgi?id=504268)
			self._editor.disableEditableContent();
		}
		if( self.toolbarNode() ) {
			Element.hide(self.toolbarNode());
		}
	}
	self.focus = function() {
		if( self._editor.contentElement && self._editor.contentElement.focus ) {
			self._editor.contentElement.focus();
			return true;
		}
		return false;
	};
	self.blur = function() {
		if( self._editor.contentElement && self._editor.contentElement.blur ) {
			self._editor.contentElement.blur();
			return true;
		}
		return false;
	};
	
	var previousUpdateVisual = self.updateVisual;
	self.updateVisual = function() {
		if( self.getState('text-value') ) {
			self._editor.setData(self.getState('text-value'));
		}
		previousUpdateVisual();
	};
	self.updateFormValue = function() {
		self._editor.setData(self.formValue());
		self.node().value = self.formValue();
	}
	var previousActivate = self.activate;
	self.activate = function() {
		self._editor.init(self.identifier(), self._showToolbar);
		self._editor.onEvent('loaded', function() {
			self.updateVisual();
		});
		self._editor.onEvent('change', function() {
			// We do not want updateVisual() to be called evey time this happens
			// so we set the value directly in the _states list instead of calling
			// setState().
			// Calling updateVisual() sets the value in the editor again which
			// causes cursor to change position to the beginning of the document.
			self._states['text-value'] = self._editor.getData();
		});
		registerSubmitFunction(function() {
			self.node().value = self._editor.getData();
		});
		previousActivate();
	};
	
	return self;
}

