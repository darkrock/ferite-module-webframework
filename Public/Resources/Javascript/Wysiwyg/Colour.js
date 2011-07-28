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
				var selection = rangy.getSelection(editor.iframeWindow);
				selection.setSingleRange(editor.colorSelectorSavedRange);
				editor.iframeDocument.execCommand(command, false, color);
				Element.hide(editor.colorPopup);
				item.className = 'WysiwygEditorToolbarItem';
				editor.colorSelectorSavedRange = null;
			};
		}
	});
}

