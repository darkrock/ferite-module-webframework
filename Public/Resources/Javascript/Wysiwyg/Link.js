function WysiwygEditorLinkToolbarItem( editor, group ) {
	editor.addToolbarItem(group, 'link', '', uriForServerImageResource('Wysiwyg/link.png'), false, function( item ) {
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
							var selection = rangy.getSelection(editor.iframeWindow);
							selection.setSingleRange(editor.linkSelectedRange);
							editor.iframeDocument.execCommand('createLink', false, editor.linkTextfieldURL.value);
						} else {
							var node = editor.createElement('a', function( a ) {
								a.href = editor.linkTextfieldURL.value;
								a.innerHTML = editor.linkTextfieldText.value;
							}, editor.iframeDocument);
							var selection = rangy.getSelection(editor.iframeWindow);
							var range = editor.linkSelectedRange;
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
			var selection = rangy.getSelection(editor.iframeWindow);
			var range = selection.getRangeAt(0).cloneRange();
			var selectedText = selection.toString();
			var selectedContainer = range.startContainer;
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
			editor.linkSelectedRange = range;
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

