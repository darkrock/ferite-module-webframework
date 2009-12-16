function ComponentTable( id ) {
	var self = new Component( id );
	
	self.setState('rows.ignore-list', {});
	self.setState('sorting.internal', false);
	self.setState('sorting.automatic-after-update', false);
	
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
		self.setState('columns.sort-direction', direction);
		self.setState('columns.sort-mapped', (map[id] ? map[id] : ''));
	};
	self._setSortColumn = function( id ) {
		if( self.getState('sorting.internal') ) {
			var currentColumn = self.getState('columns.sort');
			var currentDirection = self.getState('columns.sort-direction');
			var direction = 'asc';
		
			if( currentColumn == id ) {
				direction = (currentDirection == 'asc' ? 'desc' : 'asc');
			}
			self.setSortColumn( id, direction );
			self.setState('columns.sort-active', true);
			self.action('sort-changed', id, direction);
		}
	};
	
	self.sort = function() {
		var order = self.getState('rows.order');
		var list = self.getState('rows.map');
		var sortedColumn = self.getState('columns.sort');
		var sortedColumnDirection = self.getState('columns.sort-direction');
		var map = self.getState('columns.map');
		var attribute = map[sortedColumn];
		var callbacks = self.getState('sorting.callbacks');
		var callback = function( data, attribute, value ) { return value; };

		var s_column = self.getState('sorting.secondary');
		var s_attribute = (s_column && (sortedColumn != s_column) ? map[s_column] : '');
		var s_callback = function( data, attribute, value ) { return value; };
		
		if( callbacks && callbacks[sortedColumn] ) {
			callback = callbacks[sortedColumn];
		}
		if( s_column && callbacks && callbacks[s_column] ) {
			s_callback = callbacks[s_column];
		}
		
		self.setState('columns.sort-active', true);

		order.sort(function( left, right ) {
			var left_w = callback( list['' + left].data, attribute, list['' + left].data[attribute] );
			var right_w = callback( list['' + right].data, attribute, list['' + right].data[attribute] );

			if( typeof left_w == 'string' || typeof right_w == 'string' ) {
				left_w = left_w.toLowerCase();
				right_w = right_w.toLowerCase();
			}

			if( left_w < right_w )	
				return -1;
			else if( left_w == right_w ) {
				if( s_column && s_attribute ) {
					var left_s = s_callback( list['' + left].data, s_attribute, list['' + left].data[s_attribute] );
					var right_s = s_callback( list['' + right].data, s_attribute, list['' + right].data[s_attribute] );
					
					if( typeof left_s == 'string' || typeof right_s == 'string' ) {
						left_s = left_s.toLowerCase();
						right_s = right_s.toLowerCase();
					}
					if( left_s < right_s )	
						return (sortedColumnDirection == 'desc' ? 1 : -1);
					else if( left_s == right_s ) {
						return 0;
					} else if( left_s > right_s )
						return (sortedColumnDirection == 'desc' ? -1 : 1);
				} else {
					return 0;
				}
			} else if( left_w > right_w )
				return 1;
		});

		if( sortedColumnDirection == 'desc' ) {
			order.reverse();
		}

		self.setRows(list, order);
	};
	
	self.setRows = function( rows, order ) {
		self.setState('rows.map', rows);
		self.setState('rows.order', order);
		self.stopNavigationIfFocusGone();
		if( !self.getState('columns.sort-active') && self.getState('sorting.automatic-after-update') ) {
			self.setState('columns.sort-active', true);
			self.action('sort-changed', self.getState('columns.sort'), self.getState('columns.sort-direction'));
		} else {
			self.forceUpdate();
		}
	};
	self.getRow = function( id ) {
		var rows = self.getState('rows.map');
		return rows['' + id];
	};
	self.setTotals = function( data ) {
		var t = ({});
		t.id = 'Total';
		t.data = data;
		t.data.id = 'Total';
		t.style = { 'bold': true, 'fg': '#555', 'bg': '#F2F2F2' };
		self.setState('rows.total', t);
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
	self.registerSortCallback = function( column, functor ) {
		var callbacks = self.getState('sorting.callbacks');
		
		if( !callbacks )
			callbacks = {};
		
		callbacks[column] = functor;
		
		self.setState('sorting.callbacks', callbacks);
	};	
	self.addIgnore = function( id ) {
		var list = self.getState('rows.ignore-list');
		list['' + id] = true;
	};
	self.resetIgnores = function() {
		self.setState('rows.ignore-list', {});
	};
	self.updateHeaders = function() {
		var columns = self.getState('columns');
		var map = self.getState('columns.map');
		
		var sortedColumn = self.getState('columns.sort');
		var sortedColumnDirection = self.getState('columns.sort-direction');
		
		columns.each(function(column){
			var label = I(column.label);
			if( sortedColumn == column.id ) {
				if( sortedColumnDirection == 'asc' ) {
					label += '<img src="' + WFServerURI + 'Resources/Images/sort_up.gif" style="vertical-align:middle" border="0" alt="">';
				} else {
					label += '<img src="' + WFServerURI + 'Resources/Images/sort_down.gif" style="vertical-align:middle" border="0" alt="">';
				}
			}
			$(column.id).innerHTML = label;
			$(column.id).style.backgroundColor = (sortedColumn == column.id ? '#FFC' : '#CCF');
			$(column.id).style.paddingRight = (sortedColumn == column.id ? '0px' : (column.sortable ? '13px' : '4px'));
			$(column.id).style.textAlign = column.align;
		});
	};
	self.renderRow = function( body, row, previousRow, fancyAppear ) {
		var defaultStyle = self.getState('rows.default-style');
		var columns = self.getState('columns');
		var map = self.getState('columns.map');
		var callbacks = self.getState('columns.callbacks');

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
		if( rowStyle.bold ) styles += "font-weight:bold;";
		if( rowStyle.italic ) styles += "font-style:italic;";
		if( rowStyle.underline ) styles += "text-decoration:underline;";
		if( rowStyle.strike ) styles += "text-decoration:line-through;";
		if( rowStyle.smallcaps ) styles += "font-variant:small-caps;";

		for( j = 0; j < columns.length; j++ ) {
			var cancelClickEvent = '';
			var column = columns[j];
			var cellStyles = styles;
			var item;
			
			if( callbacks && callbacks[column.id] ) {
				item = callbacks[column.id](row.data, column);
			} else {
				item = row.data[map[column.id]];
				if( column.maxlength && item.length > column.maxlength ) {
					item = item.substr(0, column.maxlength) + '<b>...</b>';
				}
			}
			
			if( column.ignoreClicks ) {
				cancelClickEvent = ' onclick="CancelEvent(event); return false"';
				cellStyles += "cursor:default;";
			}
			
			if( cellStyles ) {
				cellStyles = ' style="' + cellStyles + (browser == 'Internet Explorer' ? 'padding:0px;padding-left:2px;padding-right:2px;' : 'padding:2px;padding-left:4px;padding-right:4px;') + '" nowrap="nowrap"';
			}
			
			html += '<td id="' + self.identifier() + '.row.' + id + '.' + map[column.id] + '"' + cancelClickEvent + cellStyles + '>' + (item != undefined ? item : '') + '</td>';
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

		if( self.getAction('row-clicked') ) {
			var click = function( target_row ) {
				return function() {
					self.action('row-clicked', target_row.id);
				};
			};
			newTableRow.onclick = click(row);
			newTableRow.style.cursor = "pointer";
		} else {
			newTableRow.style.cursor = "default";
		}

		if( fancyAppear ) {
			newTableRow.appear({duration:1});
		} else {
			newTableRow.style.display = '';
		}
		
		return newTableRow;
	}
	self.updateRow = function( row ) {
		var columns = self.getState('columns');
		var map = self.getState('columns.map');
		var callbacks = self.getState('columns.callbacks');

		var id = row.id;

		for( j = 0; j < columns.length; j++ ) {
			var column = columns[j];
			var item;

			if( callbacks && callbacks[column.id] ) {
				item = callbacks[column.id](row.data, column);
			} else {
				item = row.data[map[column.id]];
				if( column.maxlength && item.length > column.maxlength ) {
					item = item.substr(0, column.maxlength) + '<b>...</b>';
				}
			}

			if( $(self.identifier() + '.row.' + id + '.' + map[column.id]) )
				$(self.identifier() + '.row.' + id + '.' + map[column.id]).innerHTML = (item != undefined ? item : '');
		}
	};
	self.forceUpdate = function() {
		var rows = self.getState('rows.map');
		var rowsOrder = self.getState('rows.order');
		var sortActive = self.getState('columns.sort-active');
		var ignoreList = self.getState('rows.ignore-list');
		var i = 0;
		
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
				if( sortActive || ignoreList['' + row.sourceObjectID] || (!sortActive && !rows['' + row.sourceObjectID]) || row.id == (self.identifier() + '.row.Total') ) {
					body.removeChild(row);
					i--;
				} else {
					keptRows['' + row.sourceObjectID] = row;
					keptCount++;
				}
			}
		}
		
		var previousRow = null;
		for( i = 0; i < rowsOrder.length; i++ ) {
			var rowid = rowsOrder[i];
			if( !ignoreList['' + rowid] ) {
				var row = rows['' + rowid];
				if( !keptRows['' + rowid] ) {
					previousRow = self.renderRow(body, row, previousRow, (keptCount && browser != "Internet Explorer"));
				} else {
					previousRow = keptRows[''+rowid];
					self.updateRow(row);
				}
			}
		}
		
		if( self.getState('rows.total') ) {
			self.renderRow(body, self.getState('rows.total'), previousRow, false);
		}
		self.setState('columns.sort-active', false);
	};
	
	self.setState('keyboard-navigation', false);
	self.setState('keyboard-navigation.focus', 0);
	
	self._highlightRow = function( id ) {
		var node = $(self.identifier() + '.row.' + id);
		if( node ) {
			var i = 0;
			for( i = 0; i < node.childNodes.length; i++ ) {
				node.childNodes[i].style.backgroundColor = '#FFA';
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
	
	self.stopNavigationIfFocusGone = function() {
		if( self.getState('keyboard-navigation') ) {
			var ignores = self.getState('rows.ignore-list');
			var rows = self.getState('rows.map');
			var current_focus = self.getState('keyboard-navigation.focus');
			
			if( ignores['' + current_focus] || !rows['' + current_focus] ) {
				self.stopNavigation();
			}
		}
	};
	self.navigationActive = function() {
		return self.getState('keyboard-navigation.active');
	};
	self.stopNavigation = function() {
		if( self.getState('keyboard-navigation.active') ) {
			self.setState('keyboard-navigation.active', false);
			self._lowlightRow(self.getState('keyboard-navigation.focus'));
			if( self.getState('keyboard-navigation.escape') ) {
				Hotkeys.remove(self.getState('keyboard-navigation.escape'));
			}
			Hotkeys.remove(self.getState('keyboard-navigation.navigate'));
			Hotkeys.remove('Shift+' + self.getState('keyboard-navigation.navigate'));
			Hotkeys.remove(self.getState('keyboard-navigation.select'));
			Hotkeys.remove(self.getState('keyboard-navigation.custom'));
		} else {
			if( self.getState('keyboard-navigation.enter') ) {
				Hotkeys.remove(self.getState('keyboard-navigation.enter'));
			}
		}
			
		if( self.getState('keyboard-navigation') ) {
			if( self.getState('keyboard-navigation.enter') ) {
				Hotkeys.add(self.getState('keyboard-navigation.enter'), function() {
					self.startNavigation();
				});
			}
		}
	};
	self.startNavigation = function( from_bottom ) {
		var order = self.getState('rows.order');

		if( self.navigationActive() ) {
			self.stopNavigation();
		}

		if( order.length > 0 ) {
			self.setState('keyboard-navigation.active', true);
		
			Hotkeys.remove(self.getState('keyboard-navigation.enter'));
			
			if( self.getState('keyboard-navigation.escape') ) {
				Hotkeys.add(self.getState('keyboard-navigation.escape'), function() {
					self.stopNavigation();
				});
			}
			
			Hotkeys.add(self.getState('keyboard-navigation.navigate'), function() {
				var order = self.getState('rows.order');
				var ignores = self.getState('rows.ignore-list');
				var current_focus = self.getState('keyboard-navigation.focus');
				var new_focus = 0;
				var i = 0;
				
				for( i = 0; i < (order.length - 1); i++ ) {
					if( order[i] == current_focus && !ignores['' + order[i]] ) {
						new_focus = order[i+1];
					}
				}
				
				if( new_focus == 0 ) {
					var off_top = self.getState('keyboard-navigation.off-bottom');
					if( off_top ) {
						return off_top();
					} else {
						new_focus = order[0];
					}
				}
				
				self.setState('keyboard-navigation.focus', new_focus);

				self._lowlightRow(current_focus);
				self._highlightRow(new_focus);
			}, {'disable_in_input': true} );
			
			Hotkeys.add('Shift+' + self.getState('keyboard-navigation.navigate'), function() {
				var order = self.getState('rows.order');
				var ignores = self.getState('rows.ignore-list');
				var current_focus = self.getState('keyboard-navigation.focus');
				var new_focus = 0;
				var i = 0;
				
				for( i = (order.length - 1); i > 0; i-- ) {
					if( order[i] == current_focus && !ignores['' + order[i]] ) {
						new_focus = order[i-1];
					}
				}
				
				if( new_focus == 0 ) {
					var off_top = self.getState('keyboard-navigation.off-top');
					if( off_top ) {
						return off_top();
					} else {
						new_focus = order[order.length - 1];
					}
				}
				
				self.setState('keyboard-navigation.focus', new_focus);

				self._lowlightRow(current_focus);
				self._highlightRow(new_focus);
			}, {'disable_in_input': true} );
			
			Hotkeys.add(self.getState('keyboard-navigation.select'), function() {
				self.action('row-clicked', self.getState('keyboard-navigation.focus'));
			}, {'disable_in_input': true} );
			
			Hotkeys.add(self.getState('keyboard-navigation.custom'), function() {
				var id = self.getState('keyboard-navigation.focus');
				var callback = self.getState('keyboard-navigation.custom-callback');
				callback(id);
			}, {'disable_in_input': true} );
		
			self.setState('keyboard-navigation.focus', order[(from_bottom ? order.length - 1 : 0)]);
			self._highlightRow(self.getState('keyboard-navigation.focus'));
		}
	};
	self.enableKeyboardNavigation = function( enter, escape, navigate, select, custom, callback ) {
		self.setState('keyboard-navigation', true);
		self.setState('keyboard-navigation.enter', enter);
		self.setState('keyboard-navigation.escape', escape);
		self.setState('keyboard-navigation.navigate', navigate);
		self.setState('keyboard-navigation.select', select);
		self.setState('keyboard-navigation.custom', custom);
		self.setState('keyboard-navigation.custom-callback', callback);
		self.setState('keyboard-navigation.active', false);
		self.stopNavigation();
	};
	self.disableKeyboardNavigation = function() {
		self.setState('keyboard-navigation', false);
		self.stopNavigation();
	};
	self.enableKeyboardFollow = function( off_top, off_bottom ) {
		self.setState('keyboard-navigation.off-top', off_top);
		self.setState('keyboard-navigation.off-bottom', off_bottom);
	};

	self.enableKeyboardFollow( null, null );
	self.registerAction('sort-changed', function( column, direction ){
		self.sort();
		self.forceUpdate();
	});
	
	return self;
}

