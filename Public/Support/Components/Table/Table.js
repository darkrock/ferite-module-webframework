function ComponentTable( id ) {
	var self = new Component( id );
	
	self.setState('ignore-list', {});
	
	self.setColumns = function( columns ) {
		var real_columns = [];
		for( i = 0; i < (columns.length - 1); i++ ) {
			var column = columns[i];
			real_columns.push(column);
		}
		self.setState('columns', real_columns);
	};
	self.setColumnMap = function( map ) {
		self.setState('columns.map', map);
	};
	self.setSortColumn = function( id, direction ) {
		var map = self.getState('columns.map');
		self.setState('columns.sort', id);
		self.setState('columns.sort-mapped', (map[id] ? map[id] : ''));
		self.setState('columns.sort-direction', direction);
	};
	self._setSortColumn = function( id ) {
		var currentColumn = self.getState('columns.sort');
		var currentDirection = self.getState('columns.sort-direction');
		var direction = 'asc';
		
		if( currentColumn == id ) {
			direction = (currentDirection == 'asc' ? 'desc' : 'asc');
		}
		self.setSortColumn( id, direction );
		self.setState('columns.sort-active', true);
		self.action('sort-changed', id, direction);
	};
	
	self.setRows = function( rows, order ) {
		self.setState('rows.map', rows);
		self.setState('rows.order', order);
		self._releaseKeyboardIfFocusGone();
	};
	self.setRowDefaultStyle = function( style ) {
		self.setState('rows.default-style', style);
	};
	self.registerColumnCallback = function( column, functor ) {
		var callbacks = self.getState('columns.callbacks');
		
		if( !callbacks )
			callbacks = {};
		
		callbacks[column] = functor;
		
		self.setState('columns.callbacks', callbacks);
	};
	self.addIgnore = function( id ) {
		var list = self.getState('ignore-list');
		list['' + id] = true;
	};
	self.resetIgnores = function() {
		self.setState('ignore-list', {});
	};
	self.updateHeaders = function() {
		var columns = self.getState('columns');
		var map = self.getState('columns.map');
		
		var sortedColumn = self.getState('columns.sort');
		var sortedColumnDirection = self.getState('columns.sort-direction');
		
		columns.each(function(column){
			var label = column.label;
			if( sortedColumn == column.id ) {
				if( sortedColumnDirection == 'asc' ) {
					label += '<img src="/root/Skeleton.app/Resources/Templates/Master.template/Images/sort_up.gif" style="vertical-align:middle" border="0" alt="">';
				} else {
					label += '<img src="/root/Skeleton.app/Resources/Templates/Master.template/Images/sort_down.gif" style="vertical-align:middle" border="0" alt="">';
				}
			}
			$(column.id).innerHTML = label;
			$(column.id).style.backgroundColor = (sortedColumn == column.id ? '#FFC' : '#EEF');
			$(column.id).style.textAlign = column.align;
		});
	};
	self.forceUpdate = function() {
		var columns = self.getState('columns');
		var map = self.getState('columns.map');
		var callbacks = self.getState('columns.callbacks');
		var rows = self.getState('rows.map');
		var rowsOrder = self.getState('rows.order');
		var defaultStyle = self.getState('rows.default-style');
		var sortActive = self.getState('columns.sort-active');
		var ignoreList = self.getState('ignore-list');
		
		self.updateHeaders();
		
		var node = $(self.identifier());
		var body = null;
		var keptRows = {};
		var keptCount = 0;
		
		for( i = 0; i < node.childNodes.length; i++ ) {
			var childNode = node.childNodes[i];
			if( childNode.tagName && childNode.tagName.toLowerCase() == 'tbody' ) {
				body = childNode;
				break;
			}
		}
		
		if( !body ) {
			alert(self.identifier() + ': Unable to update table as it had no body');
		}
		
		for( i = 0; i < body.childNodes.length; i++ ) {
			var row = body.childNodes[i];
			if( row && row.tagName && row.tagName.toLowerCase() == 'tr' && row.id != (self.identifier() + '.Headers') ){
				if( sortActive || ignoreList['' + row.sourceObjectID] || (!sortActive && !rows['' + row.sourceObjectID]) ) {
					body.removeChild(row);
					i--;
				} else {
					keptRows['' + row.sourceObjectID] = row;
					keptCount++;
				}
			}
		}
		
		var previousRow = null;
		rowsOrder.each(function(rowid){
			if( !ignoreList['' + rowid] ) {
				if( !keptRows['' + rowid] ) {
					var row = rows['' + rowid];
					var html = '';
					var id = row.id;
					var rowStyle = {};
					var styles = '';
			
					[ 'fg', 'bg', 'bold', 'underline', 'italic', 'strike', 'smallcaps' ].each(function( attr ){
						if( defaultStyle[attr] ) rowStyle[attr] = defaultStyle[attr];
						if( row.style && row.style[attr] ) rowStyle[attr] = row.style[attr];
					});
						
					if( rowStyle.fg ) styles += "color:" + rowStyle.fg + ";";
					if( rowStyle.bg ) styles += "background-color:" + rowStyle.bg + ";";
					if( rowStyle.bold ) style += "font-weight:bold;";
					if( rowStyle.italic ) style += "font-style:italic;";
					if( rowStyle.underline ) style += "text-decoration:underline;";
					if( rowStyle.strike ) style += "text-decoration:line-through;";
					if( rowStyle.smallcaps ) style += "font-variant:small-caps;";

					if( styles ) {
						styles = ' style="' + styles + ';padding:2px;padding-left:4px;padding-right:4px;" nowrap="nowrap"';
					}
			
					for( j = 0; j < columns.length; j++ ) {
						var cancelClickEvent = '';
						var column = columns[j];
						var item;
						
						if( callbacks[column.id] ) {
							item = callbacks[column.id](row.data, column);
						} else {
							item = row.data[map[column.id]]
							if( column.maxlength && item.length > column.maxlength ) {
								item = item.substr(0, column.maxlength) + '<b>...</b>';
							}
						}
						
						if( column.ignoreClicks ) {
							cancelClickEvent = ' onclick="CancelEvent(event); return false"';
						}
						
						html += '<td id="' + self.identifier() + '.row.' + id + '.' + map[column.id] + '"' + cancelClickEvent + styles + '>' + (item ? item : '') + '</td>';
					}

					var div = document.createElement('div');
					div.innerHTML = '<table><tbody><tr id="' + self.identifier() + '.row.' + id + '" style="display:none">' + html + '</tr></tbody></table>';
					var newTableRow = div.childNodes[0].childNodes[0].childNodes[0];
					newTableRow.sourceObjectID = row.id;
			
					if( previousRow == null ) {
						if( body.childNodes.length == 1 ) {
							body.appendChild(newTableRow);
						} else {
							body.insertBefore(newTableRow,body.firstChild.nextSibling);
						}
					} else {
						if (previousRow.nextSibling) 
							previousRow.parentNode.insertBefore(newTableRow,previousRow.nextSibling);
						else 
							previousRow.parentNode.appendChild(newTableRow);
					}
					if( keptCount ) {
						newTableRow.appear({duration:1});
					} else {
						newTableRow.style.display = '';
					}
				
					newTableRow.onclick = function(event) {
						self.action('row-clicked', row.id);
					};
					previousRow = newTableRow;
				} else {
					previousRow = keptRows[''+rowid];
				}
			}
		});

		self.setState('columns.sort-active', false);
	};
	
	self.setState('keyboard-capture', false);
	self.setState('keyboard-capture.focus', 0);
	
	self._highlightRow = function( id ) {
		var node = $(self.identifier() + '.row.' + id);
		if( node ) {
			var i = 0;
			for( i = 0; i < node.childNodes.length; i++ ) {
				node.childNodes[i].style.backgroundColor = '#FFFF33';
				node.childNodes[i].style.color = '#000';
			}
		}
	};
	self._lowlightRow = function( id ) {
		var node = $(self.identifier() + '.row.' + id);
		if( node ) {
			var rows = self.getState('rows.map');
			var defaultStyle = self.getState('rows.default-style');
			var rowStyle = {};
			var row = rows['' + id];
	
			[ 'fg', 'bg' ].each(function( attr ){
				if( defaultStyle[attr] ) rowStyle[attr] = defaultStyle[attr];
				if( row && row.style && row.style[attr] ) rowStyle[attr] = row.style[attr];
			});
				
			var i = 0;
			for( i = 0; i < node.childNodes.length; i++ ) {
				node.childNodes[i].style.backgroundColor = rowStyle.bg;
				node.childNodes[i].style.color = rowStyle.fg;
			}
		}
	};
	
	self._releaseKeyboardIfFocusGone = function() {
		if( self.getState('keyboard-capture') ) {
			var ignores = self.getState('ignore-list');
			var rows = self.getState('rows.map');
			var current_focus = self.getState('keyboard-capture.focus');
			
			if( ignores['' + current_focus] || !rows['' + current_focus] ) {
				self._releaseKeyboard();
			}
		}
	};
	self._releaseKeyboard = function() {
		if( self.getState('keyboard-capture') && self.getState('keyboard-capture.active') ) {
			mcam.log("Releasing keyboard");
			self.setState('keyboard-capture.active', false);
		
			self._lowlightRow(self.getState('keyboard-capture.focus'));
		
			Hotkeys.remove(self.getState('keyboard-capture.escape'));
			Hotkeys.remove(self.getState('keyboard-capture.navigate'));
			Hotkeys.remove('Shift+' + self.getState('keyboard-capture.navigate'));
			Hotkeys.remove(self.getState('keyboard-capture.select'));
			Hotkeys.remove(self.getState('keyboard-capture.custom'));
			Hotkeys.add(self.getState('keyboard-capture.enter'), function() {
				self._captureKeyboard();
			});
		}
	};
	self._captureKeyboard = function() {
		var order = self.getState('rows.order');
		if( order.length > 0 ) {
			mcam.log("Capturing keyboard");
			self.setState('keyboard-capture.active', true);
		
			Hotkeys.remove(self.getState('keyboard-capture.enter'));
			
			Hotkeys.add(self.getState('keyboard-capture.escape'), function() {
				self._releaseKeyboard();
			});
			
			Hotkeys.add(self.getState('keyboard-capture.navigate'), function() {
				var order = self.getState('rows.order');
				var ignores = self.getState('ignore-list');
				var current_focus = self.getState('keyboard-capture.focus');
				var new_focus = 0;
				var i = 0;
				
				for( i = 0; i < (order.length - 1); i++ ) {
					if( order[i] == current_focus && !ignores['' + order[i]] ) {
						new_focus = order[i+1];
					}
				}
				
				if( new_focus == 0 ) {
					new_focus = order[0];
				}
				
				self.setState('keyboard-capture.focus', new_focus);
				mcam.log("navigate to " + self.getState('keyboard-capture.focus'));

				self._lowlightRow(current_focus);
				self._highlightRow(new_focus);
			}, {'disable_in_input': true} );
			
			Hotkeys.add('Shift+' + self.getState('keyboard-capture.navigate'), function() {
				var order = self.getState('rows.order');
				var ignores = self.getState('ignore-list');
				var current_focus = self.getState('keyboard-capture.focus');
				var new_focus = 0;
				var i = 0;
				
				for( i = (order.length - 1); i > 0; i-- ) {
					if( order[i] == current_focus && !ignores['' + order[i]] ) {
						new_focus = order[i-1];
					}
				}
				
				if( new_focus == 0 ) {
					new_focus = order[order.length - 1];
				}
				
				self.setState('keyboard-capture.focus', new_focus);
				mcam.log("navigate to " + self.getState('keyboard-capture.focus'));

				self._lowlightRow(current_focus);
				self._highlightRow(new_focus);
			}, {'disable_in_input': true} );
			
			Hotkeys.add(self.getState('keyboard-capture.select'), function() {
				mcam.log("select: " + self.getState('keyboard-capture.focus'));
				self.action('row-clicked', self.getState('keyboard-capture.focus'));
			}, {'disable_in_input': true} );
			
			Hotkeys.add(self.getState('keyboard-capture.custom'), function() {
				var id = self.getState('keyboard-capture.focus');
				var callback = self.getState('keyboard-capture.custom-callback');
				callback(id);
				mcam.log("custom: " + id);
			}, {'disable_in_input': true} );
		
			self.setState('keyboard-capture.focus', order[0]);
			mcam.log("navigate to " + self.getState('keyboard-capture.focus'));
			self._highlightRow(self.getState('keyboard-capture.focus'));
		}
	};
	self.enableKeyboardNavigation = function( enter, escape, navigate, select, custom, callback ) {
		self.setState('keyboard-capture', true);
		self.setState('keyboard-capture.enter', enter);
		self.setState('keyboard-capture.escape', escape);
		self.setState('keyboard-capture.navigate', navigate);
		self.setState('keyboard-capture.select', select);
		self.setState('keyboard-capture.custom', custom);
		self.setState('keyboard-capture.custom-callback', callback);
		self._releaseKeyboard();
	};
	
	return self;
}

