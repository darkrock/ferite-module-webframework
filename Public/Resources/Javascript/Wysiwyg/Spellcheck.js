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
	check_button = editor.addToolbarItem(toolbar, 'spellcheck', 'Perform Spell Check', uriForServerImageResource('Wysiwyg/check.png'), false, function( item ) {
		Element.hide(check_button);
		Element.show(finish_button);
		spell_check_mode = true;
		editor.spellcheck.check(editor.contentElement);
	});
	finish_button = editor.addToolbarItem(toolbar, 'finishspellcheck', 'Finish Spell Check', uriForServerImageResource('Wysiwyg/done.png'), true, function( item ) {
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
			var container = editor.selectionContainer();
			if( container && container.className == 'wysiwyg-spell-check-word' ) {
				var word = container.innerHTML;
				word = word.trim();
				if( editor.spellcheck.words[word] ) {
					var mainSuggestions = 0;
					var moreSuggestionsGroup = null;
					editor.spellcheck.words[word].suggestions.each(function(suggestion) {
						if( mainSuggestions < 5 ) {
							editor.contextMenu.addGroup(function( group ) {
								group.addItem(uriForServerImageResource('Wysiwyg/replace.png'), suggestion, function() {
									Element.replace(container, suggestion);
								});
							});
							mainSuggestions++;
						} else {
							if( ! moreSuggestionsGroup ) {
								
							}
						}
					});
				}
			}
		}
	});
	Element.show(check_button);
	Element.hide(finish_button);
}
