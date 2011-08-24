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
				//var container = null;//event.editor.selectionContainer();
				var container = event.editor.latestSelectionContainer();
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
							//var selection = rangy.getSelection(self.iframeWindow);
							//selection.setSingleRange(self.dropDownSavedRange);
							callback(item, itemLabel);
							Element.hide(list);
							self.toolbarOpenedDropDownList = null;
							//self.dropDownSavedRange = null;
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
				self.toolbarOpenedDropDownList = null;
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
				var active = onselectionchange(itemLabel);
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
	self.restoreLatestSelection = function() {
		if( self.latestSelectionRange ) {
			var selection = rangy.getIframeSelection(self.iframe);
			selection.setSingleRange(self.latestSelectionRange);
		}
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
				self.latestSelection = rangy.getIframeSelection(self.iframe);
				self.latestSelectionRange = self.latestSelection.getRangeAt(0).cloneRange();
				self.fireEvent('selectionchange');
			};
			self.contentElement.onkeyup = function() {
				self.latestSelection = rangy.getIframeSelection(self.iframe);
				self.latestSelectionRange = self.latestSelection.getRangeAt(0).cloneRange();
				self.fireEvent('selectionchange');
				self.fireEvent('keyup');
			};
			
			// If you are looking at this and thinking:
			// "WHAT WAS THIS PERSON THINKING. IT COULD HAVE BEEN SO EASY TO AVOID DUPLICATING THE EVENT CODE".
			// Well then let me tell you a story about a browser engine called WebKit.
			// IT IS STUPID. End of story.
			// If you passed in the function as a variable the browser context menu was not suppressed.
			// Yes I tried different combinations of addEventListener().
			// I'm sure there is some way to get it to work nicely but I'm low on time so this is how
			// it will stay implemented for now. // Tobias 2011-08-24
			if( Prototype.Browser.IE ) {
				self.contentElement.attachEvent('oncontextmenu', function( event ) {
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
				});
			} else {
				self.contentElement.oncontextmenu = function( event ) {
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
			}
			
			var ContextMenu = {
				element: null,
				_previousGroup: null,
				_onHideCallbacks: [],
				_createElement: function() {
					if( this.element == null ) {
						this.element = self.createElement('div', function( div ) {
							div.className = 'WysiwygEditorContextMenu';
							div.appendChild(self.createTable());
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
						element: null,
						addMenu: function( label, creator ) {
							var menu = Object.clone(ContextMenu);
							if( creator ) {
								creator(menu);
							}
							this.addItem('', label, function(e, item) {
								var itemViewportOffset = Element.viewportOffset(item);
								var itemWidth = Element.getWidth(item);
								var x = itemViewportOffset.left + itemWidth + 4 /* 4 is a good number I promise */;
								var y = itemViewportOffset.top;
								menu._createElement();
								menu.element.style.left = x + 'px';
								menu.element.style.top = y + 'px';
								Element.show(menu.element);
								e.contextMenu.onHide(function() {
									menu.hide();
								});
							});
							return menu;
						},
						addItem: function( icon, label, callback ) {
							self.createTableRow(this.element, function( row )  {
								row.onclick = function( event ) {
									callback(self, row); // self = current instance of editor
									CancelEvent((event ? event : window.event));
									return false;
								};
								self.createTableColumn(row, function( column ) {
									column.className = 'WysiwygEditorContextMenuItemLeft';
									if( icon ) {
										column.appendChild(self.createElement('img', function( image ) {
											image.src = icon;
										}));
									}
								});
								self.createTableColumn(row, function( column ) {
									column.className = 'WysiwygEditorContextMenuItemRight';
									column.innerHTML = label;
								});
							});
						},
						end: function() {
							self.createTableRow(this.element, function( row )  {
								row.className = 'WysiwygEditorContextMenuGroupEnd';
								self.createTableColumn(row, function( column ) {
									column.className = 'WysiwygEditorContextMenuItemLeft';
								});
								self.createTableColumn(row, function( column ) {
									column.className = 'WysiwygEditorContextMenuItemRight';
								});
							});
						}
					};
					if( this._previousGroup ) {
						this._previousGroup.end();
					}
					this._createElement();
					group.element = this.element.firstChild.firstChild;
					if( creator ) {
						creator(group);
					}
					this._previousGroup = group;
					return group;
				}
			};
			
			self.contextMenu = Object.clone(ContextMenu);
			
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
				self.addToolbarItem(group, 'image', '', uriForServerImageResource('Components/WysiwygEditor/image.png'), false, function( item ) {
					// TODO: Implement the image importer.
				});
				WysiwygEditorHorizontalLineToolbarItem(self, group);
			});
			WysiwygEditorFontToolbarDropDown(self, row);
			WysiwygEditorFontSizeToolbarDropDown(self, row);
			self.addToolbarItemGroup(row, function( group ) {
				WysiwygEditorColorToolbarItem(self, group, 	'textcolor', uriForServerImageResource('Components/WysiwygEditor/textcolor.png'), 'forecolor');
				WysiwygEditorColorToolbarItem(self, group, 	'backgroundcolor', uriForServerImageResource('Components/WysiwygEditor/backgroundcolor.png'), 'backcolor');
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

function WysiwygEditorBoldToolbarItem( editor, group ) {
	editor.addToolbarItem(group, 'bold', '', uriForServerImageResource('Components/WysiwygEditor/bold.png'), false, function( item ) {
		editor.contentElement.focus();
		editor.iframeDocument.execCommand('bold', false, false);
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
	editor.addToolbarItem(group, 'italic', '', uriForServerImageResource('Components/WysiwygEditor/italic.png'), false, function( item ) {
		editor.contentElement.focus();
		editor.iframeDocument.execCommand('italic', false, false);
		item.active = (item.active ? false : true);
		item.className = (item.active ? 'WysiwygEditorToolbarItemActive' : 'WysiwygEditorToolbarItem');
	}, function( editor, item, container ) {
		if( container && Element.getStyle(container, 'font-style') == 'italic' )
			return true;
		return false;
	});
}
function WysiwygEditorUnderlineToolbarItem( editor, group ) {
	editor.addToolbarItem(group, 'underline', '', uriForServerImageResource('Components/WysiwygEditor/underline.png'), false, function( item ) {
		editor.contentElement.focus();
		editor.iframeDocument.execCommand('underline', false, false);
		item.active = (item.active ? false : true);
		item.className = (item.active ? 'WysiwygEditorToolbarItemActive' : 'WysiwygEditorToolbarItem');
	}, function( editor, item, container ) {
		if( container && Element.getStyle(container, 'text-decoration').search('underline') > -1 )
			return true;
		return false;
	});
}
function WysiwygEditorStrikethroughToolbarItem( editor, group ) {
	editor.addToolbarItem(group, 'strikethrough', '', uriForServerImageResource('Components/WysiwygEditor/strikethrough.png'), true, function( item ) {
		editor.contentElement.focus();
		editor.iframeDocument.execCommand('strikethrough', false, false);
		item.active = (item.active ? false : true);
		item.className = (item.active ? 'WysiwygEditorToolbarItemActive' : 'WysiwygEditorToolbarItem');
	}, function( editor, item, container ) {
		if( container && Element.getStyle(container, 'text-decoration').search('line-through') > -1 )
			return true;
		return false;
	});
}

function WysiwygEditorOrderedListToolbarItem( editor, group ) {
	editor.addToolbarItem(group, 'ol', '', uriForServerImageResource('Components/WysiwygEditor/ol.png'), false, function( item ) {
		editor.contentElement.focus();
		editor.iframeDocument.execCommand('insertorderedlist', false, false);
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
	editor.addToolbarItem(group, 'ul', '', uriForServerImageResource('Components/WysiwygEditor/ul.png'), true, function( item ) {
		editor.contentElement.focus();
		editor.iframeDocument.execCommand('insertunorderedlist', false, false);
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
	editor.addToolbarItem(group, 'outdent', '', uriForServerImageResource('Components/WysiwygEditor/outdent.png'), false, function( item ) {
		editor.contentElement.focus();
		editor.iframeDocument.execCommand('outdent', false, false);
	});
}
function WysiwygEditorIndentToolbarItem( editor, group ) {
	editor.addToolbarItem(group, 'indent', '', uriForServerImageResource('Components/WysiwygEditor/indent.png'), true, function( item ) {
		editor.contentElement.focus();
		editor.iframeDocument.execCommand('indent', false, false);
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
		item.active = (item.active ? false : true);
		item.className = (item.active ? 'WysiwygEditorToolbarItemActive' : 'WysiwygEditorToolbarItem');
	};
}
function WysiwygEditorJustifyLeftToolbarItem( editor, group ) {
	if( editor.justifyItemClicked == undefined ) {
		WysiwygEditorAddCommonJustifyFunction(editor);
	}
	editor.addToolbarItem(group, 'leftjustify', '', uriForServerImageResource('Components/WysiwygEditor/leftjustify.png'), false, function( item ) {
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
	editor.addToolbarItem(group, 'centerjustify', '', uriForServerImageResource('Components/WysiwygEditor/centerjustify.png'), false, function( item ) {
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
	editor.addToolbarItem(group, 'rightjustify', '', uriForServerImageResource('Components/WysiwygEditor/rightjustify.png'), false, function( item ) {
		editor.justifyItemClicked(item, 'justifyright');
	}, function( editor, item, container ) {
		if( container && Element.getStyle(container, 'text-align') == 'right' )
			return true;
		return false;
	});
}

function WysiwygEditorHorizontalLineToolbarItem( editor, group ) {
	editor.addToolbarItem(group, 'horizontalline', '', uriForServerImageResource('Components/WysiwygEditor/hr.png'), true, function( item ) {
		editor.contentElement.focus();
		editor.iframeDocument.execCommand('inserthorizontalrule', false, false);
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
	editor.addToolbarDropDown(toolbar, 'Font', 155, list, function(item, itemLabel) {
		editor.restoreLatestSelection();
		editor.iframeDocument.execCommand('fontname', false, item.font);
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
			if( found == false && editor.previousSelectionFontFamily != 'Font' ) {
				itemLabel.innerHTML = 'Font';
				editor.previousSelectionFontFamily = 'Font';
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
	editor.addToolbarDropDown(toolbar, 'Size', 70, list, function(item, itemLabel) {
		editor.restoreLatestSelection();
		editor.iframeDocument.execCommand('FontSize', false, item.size);
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
			if( found == false && editor.previousSelectionFontSize != 'Size' ) {
				itemLabel.innerHTML = 'Size';
				editor.previousSelectionFontSize = 'Size';
			}
		}
	});
}

function WysiwygEditorLinkToolbarItem( editor, group ) {
	editor.addToolbarItem(group, 'link', '', uriForServerImageResource('Components/WysiwygEditor/link.png'), false, function( item ) {
		if( editor.linkPopup == undefined ) {
			var textTextfield = null;
			var urlTextfield = null;
			var webAddressLabel = null;
			var webAddressRadioButton = null;
			var emailAddressLabel = null;
			var emailAddressRadioButton = null;
			var descriptionLabel = null;
			var table = editor.createTable(function( table, tbody ) {
				table.style.width = '100%';
				editor.createTableRow(tbody, function( row ) {
					editor.createTableColumn(row, function( column ) {
						column.style.padding = '5px';
						column.style.whiteSpace = 'nowrap';
						column.innerHTML = 'Text to display:';
					});
					editor.createTableColumn(row, function( column ) {
						var input = document.createElement('input');
						input.setAttribute('type', 'text');
						input.style.width = '99%';
						column.style.padding = '5px';
						column.style.width = '100%';
						column.appendChild(input);
						textTextfield = input;
					});
				});
				editor.createTableRow(tbody, function( row ) {
					row.style.verticalAlign = 'bottom';
					editor.createTableColumn(row, function( column ) {
						column.style.padding = '5px';
						column.style.whiteSpace = 'nowrap';
						column.appendChild(editor.createElement('div', function( div ) {
							div.style.width = '120px';
							div.style.marginBottom = '2px';
							div.innerHTML = 'Link to:';
						}));
						column.appendChild(editor.createElement('div', function( div ) {
							div.style.marginBottom = '2px';
							div.style.cursor = 'pointer';
							div.appendChild(editor.createElement('input', function( input ) {
								input.setAttribute('type', 'radio');
								input.style.verticalAlign = (Prototype.Browser.IE ? 'middle' : 'bottom');
								input.style.marginRight = '0px';
								webAddressRadioButton = input;
							}));
							div.appendChild(document.createTextNode('\u00a0'));
							div.appendChild(editor.createElement('span', function( span ) {
								span.innerHTML = 'Web address';
								webAddressLabel = span;
							}));
						}));
						column.appendChild(editor.createElement('div', function( div ) {
							div.style.cursor = 'pointer';
							div.appendChild(editor.createElement('input', function( input ) {
								input.setAttribute('type', 'radio');
								input.style.verticalAlign = (Prototype.Browser.IE ? 'middle' : 'bottom');
								input.style.marginRight = '0px';
								emailAddressRadioButton = input;
							}));
							div.appendChild(document.createTextNode('\u00a0'));
							div.appendChild(editor.createElement('span', function( span ) {
								span.innerHTML = 'Email address';
								emailAddressLabel = span;
							}));
						}));
					});
					editor.createTableColumn(row, function( column ) {
						column.style.width = '100%';
						column.style.padding = '5px';
						column.appendChild(editor.createElement('div', function( div ) {
							div.style.fontWeight = 'bold';
							div.style.marginBottom = '2px';
							div.innerHTML = 'To what URL should this link go?';
							descriptionLabel = div;
						}));
						column.appendChild(editor.createElement('input', function( input ) {
							input.setAttribute('type', 'text');
							input.style.width = '99%';
							urlTextfield = input;
						}));
					});
				});
			});
			var popup = editor.createElement('div', function( div ) {
				div.className = 'WysiwygEditorItemPopup';
				div.style.display = 'none';
				div.style.width = '450px';
				div.appendChild(table);
				div.appendChild(editor.createItemPopupFooter(function( footer ) {
					editor.addItemPopupFooterButton(footer, 'Save', 'http://10.42.2.181/webframework/Cention.app/Resources/Images/submit_save.png', '#96D754', function() {
						if( editor.linkSelectedContainer ) {
							editor.linkSelectedContainer.href = editor.linkTextfieldURL.value;
						} else if( editor.linkSelectedText ) {
							editor.restoreLatestSelection();
							editor.iframeDocument.execCommand('createLink', false, editor.linkTextfieldURL.value);
						} else {
							var node = editor.createElement('a', function( a ) {
								a.href = editor.linkTextfieldURL.value;
								a.innerHTML = editor.linkTextfieldText.value;
							}, editor.iframeDocument);
							var selection = rangy.getIframeSelection(editor.iframe);
							var range = editor.latestSelectionRange;
							range.collapse(false);
							range.insertNode(node);
							range.collapseAfter(node);
							selection.setSingleRange(range);
						}
						Element.hide(div);
						item.className = 'WysiwygEditorToolbarItem';
					});
					editor.addItemPopupFooterButton(footer, 'Cancel', 'http://10.42.2.181/webframework/Cention.app/Resources/Images/submit_arrow_right.png', '#FCAB46', function() {
						Element.hide(div);
						item.className = 'WysiwygEditorToolbarItem';
					});
				}));
			});
			document.body.appendChild(popup);
			editor.linkPopup = popup;
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
				descriptionLabel.innerHTML = 'To what URL should this link go?';
			};
			emailAddressRadioButton.onclick = emailAddressLabel.onclick = function() {
				emailAddressRadioButton.checked = true;
				emailAddressLabel.style.fontWeight = 'bold';
				webAddressRadioButton.checked = false;
				webAddressLabel.style.fontWeight = 'normal';
				descriptionLabel.innerHTML = 'To what email address should this link?';
			};
		}
		if( Element.visible(editor.linkPopup) ) {
			Element.hide(editor.linkPopup);
			item.className = 'WysiwygEditorToolbarItem';
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
			editor.linkDescriptionLabel = 'To what URL should this link go?';
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

function WysiwygEditorColorToolbarItem( editor, group, name, icon, command ) {
	editor.addToolbarItem(group, name, '', icon, false, function( item ) {
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
			var colorsTable = editor.createTable(function( table, tbody ) {
				//table.style.width = '100%';
				colors.each(function(colorRow) {
					editor.createTableRow(tbody, function( row ) {
						colorRow.each(function(color) {
							editor.createTableColumn(row, function( column ) {
								column.className = 'WysiwygEditorColorItemContainer';
								column.onmousedown = item.onselectstart = function() { return false; };
								column.unselectable = true;
								column.appendChild(editor.createElement('div', function(div) {
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
			var moreColorsPreviewTable = editor.createTable(function( table, tbody ) {
				table.style.width = '100%';
				table.style.marginTop = '1px';
				table.style.marginBottom = '3px';
				table.style.marginLeft = '3px';
				table.style.marginRight = '3px';
				table.style.display = 'none',
				editor.createTableRow(tbody, function( row ) {
					moreColorsPreview = editor.createTableColumn(row, function( column ) {
						column.className = 'WysiwygEditorMoreColorsPreview';
						column.onmousedown = item.onselectstart = function() { return false; };
						column.unselectable = true;
					});
				});
			});
			var moreColorsTable = editor.createTable(function( table, tbody ) {
				table.style.margin = '2px';
				table.style.display = 'none';
				//table.style.border = '1px solid #999';
				table.onmouseout = function() {	
					moreColorsPreview.style.backgroundColor = '#FFF';
				};
				moreColors.each(function(colorRow) {
					editor.createTableRow(tbody, function( row ) {
						colorRow.each(function(color) {
							editor.createTableColumn(row, function( column ) {
								column.className = 'WysiwygEditorMoreColorItemContainer';
								column.onmousedown = item.onselectstart = function() { return false; };
								column.unselectable = true;
								column.appendChild(editor.createElement('div', function(div) {
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
			var popup = editor.createElement('div', function( div ) {
				div.className = 'WysiwygEditorItemPopup';
				div.align = 'center';
				div.style.display = 'none';
				//div.style.width = '150px';
				div.appendChild(colorsTable);
				div.appendChild(editor.createElement('div', function( div ) {
					div.className = 'WysiwygEditorMoreColorsButton';
					div.innerHTML = 'More Colors...';
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
			mcam.fireCallbackRequest('wysiwyg_editor_spell_check_perform', function( value ) {
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
		finish: function( node ) {
			var i;
	
			for( i = 0; i < this.list.length; i++ ) {
				var word = this.list[i];
				this.words[word].nodes = new Array();
			}
	
			var nodes = new Array();
	
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
			if( this.words[word] )
			{
				mcam.fireCallbackRequest('WysiwygEditorSpellCheckLearnWord', null, { word: word, language: this.language });
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
	editor.addToolbarDropDown(toolbar, 'Language', 105, list, function(item, itemLabel) {
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
	check_button = editor.addToolbarItem(toolbar, 'spellcheck', 'Perform Spell Check', uriForServerImageResource('Components/WysiwygEditor/check.png'), false, function( item ) {
		Element.hide(check_button);
		Element.show(finish_button);
		spell_check_mode = true;
		editor.spellcheck.check(editor.contentElement);
	});
	finish_button = editor.addToolbarItem(toolbar, 'finishspellcheck', 'Finish Spell Check', uriForServerImageResource('Components/WysiwygEditor/done.png'), true, function( item ) {
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
							});
							mainSuggestions++;
						} else {
							if( ! moreSuggestionsGroup ) {
								editor.contextMenu.addGroup(function( group ) {
									group.addMenu('More', function( menu ) {
										moreSuggestionsGroup = menu.addGroup();
									});
								});
							}
							moreSuggestionsGroup.addItem(uriForServerImageResource('Components/WysiwygEditor/replace.png'), suggestion, function(e, i) {
								Element.replace(container, suggestion);
								e.contextMenu.hide();
							});
						}
					});
				}
			}
		}
	});
	Element.show(check_button);
	Element.hide(finish_button);
}

