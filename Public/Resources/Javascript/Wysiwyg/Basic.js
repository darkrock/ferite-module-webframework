function WysiwygEditorBoldToolbarItem( editor, group ) {
	editor.addToolbarItem(group, 'bold', '', uriForServerImageResource('Wysiwyg/bold.png'), false, function( item ) {
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
	editor.addToolbarItem(group, 'italic', '', uriForServerImageResource('Wysiwyg/italic.png'), false, function( item ) {
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
	editor.addToolbarItem(group, 'underline', '', uriForServerImageResource('Wysiwyg/underline.png'), false, function( item ) {
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
	editor.addToolbarItem(group, 'strikethrough', '', uriForServerImageResource('Wysiwyg/strikethrough.png'), true, function( item ) {
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
	editor.addToolbarItem(group, 'ol', '', uriForServerImageResource('Wysiwyg/ol.png'), false, function( item ) {
		editor.contentElement.focus();
		editor.iframeDocument.execCommand('insertorderedlist', false, false);
		item.active = (item.active ? false : true);
		item.className = (item.active ? 'WysiwygEditorToolbarItemActive' : 'WysiwygEditorToolbarItem');
	}, function( editor, item, container ) {
		var found = false;
		var node = container;
		while( node && (node != editor.contentElement) ) {
			if( node.tagName.toLowerCase() == 'ol' ) {
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
	editor.addToolbarItem(group, 'ul', '', uriForServerImageResource('Wysiwyg/ul.png'), true, function( item ) {
		editor.contentElement.focus();
		editor.iframeDocument.execCommand('insertunorderedlist', false, false);
		item.active = (item.active ? false : true);
		item.className = (item.active ? 'WysiwygEditorToolbarItemActive' : 'WysiwygEditorToolbarItem');
	}, function( editor, item, container ) {
		var found = false;
		var node = container
		while( node && (node != editor.contentElement) ) {
			if( node.tagName.toLowerCase() == 'ul' ) {
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
	editor.addToolbarItem(group, 'outdent', '', uriForServerImageResource('Wysiwyg/outdent.png'), false, function( item ) {
		editor.contentElement.focus();
		editor.iframeDocument.execCommand('outdent', false, false);
	});
}
function WysiwygEditorIndentToolbarItem( editor, group ) {
	editor.addToolbarItem(group, 'indent', '', uriForServerImageResource('Wysiwyg/indent.png'), true, function( item ) {
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
	editor.addToolbarItem(group, 'leftjustify', '', uriForServerImageResource('Wysiwyg/leftjustify.png'), false, function( item ) {
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
	editor.addToolbarItem(group, 'centerjustify', '', uriForServerImageResource('Wysiwyg/centerjustify.png'), false, function( item ) {
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
	editor.addToolbarItem(group, 'rightjustify', '', uriForServerImageResource('Wysiwyg/rightjustify.png'), false, function( item ) {
		editor.justifyItemClicked(item, 'justifyright');
	}, function( editor, item, container ) {
		if( container && Element.getStyle(container, 'text-align') == 'right' )
			return true;
		return false;
	});
}

function WysiwygEditorHorizontalLineToolbarItem( editor, group ) {
	editor.addToolbarItem(group, 'horizontalline', '', uriForServerImageResource('Wysiwyg/hr.png'), true, function( item ) {
		editor.contentElement.focus();
		editor.iframeDocument.execCommand('inserthorizontalrule', false, false);
	});
}

function WysiwygEditorFontToolbarDropDown( editor, toolbar ) {
	var list = [
			{ name: 'Arial',               label: '<span style="font-family:arial">Arial</span>',                             font: 'arial' },
			{ name: 'Arial black',         label: '<span style="font-family:arial black">Arial black</span>',                 font: 'arial black' },
			{ name: 'Comic Sans MS',       label: '<span style="font-family:comic sans ms">Comic Sans MS</span>',             font: 'comic sans ms' },
			{ name: 'Courier New',         label: '<span style="font-family:courier new">Courier New</span>',                 font: 'courier new' },
			{ name: 'Georgia',             label: '<span style="font-family:georgia">Georgia</span>',                         font: 'georgia' },
			{ name: 'Impact',              label: '<span style="font-family:impact">Impact</span>',                           font: 'Impact' },
			{ name: 'Lucida Console',      label: '<span style="font-family:lucida console">Lucida Console</span>',           font: 'lucida console' },
			{ name: 'Lucida Sans Unicode', label: '<span style="font-family:lucida sans unicode">Lucida Sans Unicode</span>', font: 'lucida sans unicode' },
			{ name: 'Tahoma',              label: '<span style="font-family:tahoma">Tahoma</span>',                           font: 'tahoma' },
			{ name: 'Times New Roman',     label: '<span style="font-family:times new roman">Times New Roman</span>',         font: 'times new roman' },
			{ name: 'Trebuchet MS',        label: '<span style="font-family:trebuchet ms">Trebuchet MS</span>',               font: 'trebuchet ms' },
			{ name: 'Verdana',             label: '<span style="font-family:verdana">Verdana</span>',                         font: 'verdana' }
		];
	editor.addToolbarDropDown(toolbar, 'Font', 155, list, function(item) {
		//editor.contentElement.focus();
		editor.iframeDocument.execCommand('fontname', false, item.font);
	}, function( itemLabel, container ) {
		if( container ) {
			var found = false;
			var fontFamily;
			if( Prototype.Browser.WebKit ) {
				if( container.tagName.toLowerCase() == 'font' && container.className.toLowerCase() == 'apple-style-span' ) {
					fontFamily = container.getAttribute('face').replace(/'/g, '');
				}
			} else if( Prototype.Browser.IE ) {
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
			{ name: '10', label: '<font size="1">10</font>', size: 1 },
			{ name: '12', label: '<font size="2">12</font>', size: 2 },
			{ name: '14', label: '<font size="3">14</font>', size: 3 },
			{ name: '18', label: '<font size="4">18</font>', size: 4 },
			{ name: '24', label: '<font size="5">24</font>', size: 5 },
			{ name: '32', label: '<font size="6">32</font>', size: 6 },
			{ name: '48', label: '<font size="7">48</font>', size: 7 }
		];
	editor.addToolbarDropDown(toolbar, 'Size', 70, list, function(item) {
		//editor.contentElement.focus();
		editor.iframeDocument.execCommand('FontSize', false, item.size);
	}, function( itemLabel, container ) {
		if( container ) {
			var found = false;
			var fontSize;
			if( Prototype.Browser.WebKit ) {
				if( container.tagName.toLowerCase() == 'font' && container.className.toLowerCase() == 'apple-style-span' ) {
					fontSize = container.getAttribute('size').replace(/'/g, '');
				}
			} else if( Prototype.Browser.IE ) {
				if( container.tagName.toLowerCase() == 'font' ) {
					fontSize = container.getAttribute('size');
				}
				if( !fontSize ) {
					fontSize = Element.getStyle(container, 'font-size');
				}
			} else {
				fontSize = Element.getStyle(container, 'font-size');
			}
			if( fontSize ) {
				var size = list.length;
				for( var i = 0; i < size; i++ ) {
					var item = list[i];
					if( item.size == fontSize ) {
						if( fontSize != editor.previousSelectionFontSize ) {
							itemLabel.innerHTML = item.name;
						}
						editor.previousSelectionFontSize = item.font;
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

