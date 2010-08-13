(function()
{	
	CKEDITOR.plugins.CentionSpellCheck = {
		instances : {},
		setup : function ( id )
		{
			if ( !this.instances[id] )
			{
				this.instances[id] = {};
				this.instances[id].list = new Array();
				this.instances[id].words = {};
				this.instances[id].misspelled_words = {};
				this.instances[id].language = 0;
			}
		},
		reset: function ( id )
		{
			this.instances[id].list = new Array();
			this.instances[id].words = {};
		},
		setLanguage: function ( id, language )
		{
			this.setup( id );
			this.instances[id].language = language;
		},
		check: function ( id, element )
		{
			var wordNodes = new Array();
		
			this.setup(id);
		
			var node = element.firstChild;
			while ( node )
			{
				if ( (node.nodeType == 1) && (node.className == 'ckeditor-spell-check-word') )
				{
					node.className = '';
					wordNodes.push(node);
				}
				else if( node.nodeType == 3 )
				{
					wordNodes.push(node);
				}
			
				if ( node.firstChild )
				{
					node = node.firstChild;
				}
				else if ( node.nextSibling )
				{
					node = node.nextSibling;
				}
				else
				{
					for ( node = node.parentNode; node; node = node.parentNode )
					{
						if ( node.nextSibling )
						{
							node = node.nextSibling;
							break;
						}
					}
				}
			}

			var i;
			var wordNodesLength = wordNodes.length;
		
			for ( i = 0; i < wordNodesLength; i++ )
				this.setWord(id, wordNodes[i], this.getInnerText(wordNodes[i]));
			
			var captured_this = this;
			mcam.fireCallbackRequest( 'spellCheckWordList', function ( value )
			{
				var data = JSON.parse(value);
				var i;
				var j;
				captured_this.instances[id].misspelled_words = {};
				for ( i = 0; i < data.misspelled_words.length; i++ )
				{
					var item = data.misspelled_words[i];
					captured_this.instances[id].misspelled_words[item.word] = true;
					if ( captured_this.instances[id].words[item.word] && !captured_this.instances[id].words[item.word].ignore )
					{
						for ( j = 0; j < captured_this.instances[id].words[item.word].nodes.length; j++ )
						{
							var node = captured_this.instances[id].words[item.word].nodes[j];
							node.style.backgroundColor = 'red';
							if ( item.suggestions.length > 0 )
								 node.style.backgroundColor = 'yellow';
							captured_this.instances[id].words[item.word].suggestions = item.suggestions;
						}
					}
				}
			}, { words: this.instances[id].list, language: this.instances[id].language });
		},
		finish: function ( id, node )
		{
			var i;
		
			this.setup(id);
		
			for ( i = 0; i < this.instances[id].list.length; i++ )
			{
				var word = this.instances[id].list[i];
				this.instances[id].words[word].nodes = new Array();
			}
		
			var nodes = new Array();
		
			while ( node )
			{
				if ( (node.nodeType == 1) && (node.className == 'ckeditor-spell-check-word') )
				{
					nodes.push(node);
				}
				if ( node.firstChild )
				{
					node = node.firstChild;
				}
				else if ( node.nextSibling )
				{
					node = node.nextSibling;
				}
				else
				{
					for ( node = node.parentNode; node; node = node.parentNode )
					{
						if( node.nextSibling ) {
							node = node.nextSibling;
							break;
						}
					}
				}
			}
		
			var nodesLength = nodes.length;
			var j;
		
			for ( i = 0; i < nodesLength; i++ )
			{
				node = nodes[i];
				var childNodesLength = node.childNodes.length;
				for ( j = 0; j < childNodesLength; j++ )
				{
					node.parentNode.insertBefore( node.childNodes[j], node );
				}
				node.parentNode.removeChild( node );
			}
		},
		ignore: function ( id, word )
		{
			if( this.instances[id] && this.instances[id].words[word] ) {
				this.instances[id].words[word].ignore = true;
				var i;
				var nodesLength = this.instances[id].words[word].nodes.length;
				for ( i = 0; i < nodesLength; i++ )
				{
					var node = this.instances[id].words[word].nodes[i];
					node.style.backgroundColor = '';
				}
			}
		},
		learn: function ( id, word )
		{
			if ( this.instances[id] && this.instances[id].words[word] )
			{
				mcam.fireCallbackRequest( 'spellCheckLearnWord', null, { word: word, language: this.instances[id].language } );
				this.ignore( id, word );
			}
		},
		suggestions: function ( id, word )
		{
			return this.instances[id].words[word].suggestions;
		},
		isWordMisspelled: function ( id, word )
		{
			return ( this.instances[id].misspelled_words[word] ? true : false );
		},
		isWordIgnored: function ( id, word )
		{
			return this.instances[id].words[word].ignore;
		},
		getInnerText: function ( node )
		{
			if ( !node )
			{
				return '';
			}
		
			switch ( node.nodeType )
			{
				case 1:
					if ( node.tagName == 'BR' )
					{
						return '\n';
					}
					else
					{
						var string = '';
						var i;
						for ( i = 0; i < node.childNodes.length; i++ )
						{
							string += this.getInnerText( node.childNodes[i] );
						}
						return string;
					}
					break;
				case 3:
					return node.nodeValue;
					break;
			};
		},
		setWord: function ( id, element, word )
		{
			var doc = element.ownerDocument || element.document;
			var wordLength = word.length;
			var string = '';
			var n = 0;
			var i;

			for ( i = 0; i < wordLength; i++ )
			{
				var character = word.substr( i, 1 );
			
				// Match all but numbers, letters, - and '
				if ( !character.match( /[\wÅåÄäÖöÜüßÆæØøÀàÁáÂâÇçÈèÉéÊêËëÎîÏïÍíÔôÓóŒœÙùÚúÛûÑñĄąĘęÓóĆćŁłŃńŚśŹźŻż\']/ ) )
				{
					var newNode;
				
					if ( string )
					{
						element.parentNode.insertBefore( this.createWordNode( id, string, doc ), element );
					}
				
					if ( character == '\n' )
					{
						newNode = doc.createElement( 'br' );
					}
					else
					{
						newNode = doc.createTextNode( character );
					}
				
					element.parentNode.insertBefore( newNode, element );
					string = '';
					n++;
				}
				else
				{
					string += character;
				}
			}

			if ( string )
			{
				element.parentNode.insertBefore( this.createWordNode( id, string, doc ), element );
			}

			element.parentNode.removeChild( element );

			return n;
		},
		createWordNode: function ( id, word, doc )
		{
			var node = doc.createElement( 'span' );
			node.className = 'ckeditor-spell-check-word';
			node.appendChild( doc.createTextNode( word ) );
		
			if ( !this.instances[id].words[word] )
			{
				this.instances[id].list.push(word);
				this.instances[id].words[word] = {};
				this.instances[id].words[word].ignore = false;
				this.instances[id].words[word].suggestions = new Array();
				this.instances[id].words[word].nodes = new Array();
			}
			this.instances[id].words[word].nodes.push(node);
		
			return node;
		}
	};
	
	// Context menu constructing.
	var addButtonCommand = function( plugin, editor, buttonName, buttonLabel, commandName, command, menugroup, menuOrder, buttonIcon )
	{
		editor.addCommand( commandName, command );

		// If the "menu" plugin is loaded, register the menu item.
		editor.addMenuItem( commandName,
			{
				label : buttonLabel,
				command : commandName,
				group : menugroup,
				order : menuOrder,
				icon : plugin.path + buttonIcon
			});
	};
	
	var plugin = CKEDITOR.plugins.CentionSpellCheck;
	
	// Add scayt plugin.
	CKEDITOR.plugins.add( 'centionspellcheck',
	{
		requires : [ 'menubutton', 'richcombo' ],

		init : function( editor )
		{
			CKEDITOR.toggleToolbarItem = function( itemName )
			{
				if ( editor.toolbox )
				{
					var toolbarsLength = editor.toolbox.toolbars.length;
					var i;
					var j;
					var foundItem = false;
			
					for ( i = 0; i < toolbarsLength; i++ )
					{
						var toolbar = editor.toolbox.toolbars[i];
						var itemsLength = toolbar.items.length;
				
						for ( j = 0; j < itemsLength; j++ )
						{
							var item = toolbar.items[ j ];
					
							if ( item.itemName == itemName )
							{
								var element = CKEDITOR.document.getById( item.id );
								var parent = element.getParent();
						
								if ( parent.isVisible() )
								{
									parent.hide();
								}
								else
								{
									parent.show();
								}
						
								foundItem = true;
								break;								
							}
						}

						if ( foundItem )
							break;
					}
				}
			};
			
			var mainSuggestions = {};
			var moreSuggestions = {};

			// If the "contextmenu" plugin is loaded, register the listeners.
			if ( editor.contextMenu && editor.addMenuItems )
			{
				editor.contextMenu.addListener( function( element )
					{
						var i;
						var word;
						var itemSuggestions;
						var moreSuggestions;
						
						if ( !element )
							return null;
						
						// Remove unused commands and menuitems
						for ( i in mainSuggestions )
						{
							delete editor._.menuItems[ i ];
							delete editor._.commands[ i ];
						}
						for ( i in moreSuggestions )
						{
							delete editor._.menuItems[ i ];
							delete editor._.commands[ i ];
						}
						mainSuggestions = {};
						moreSuggestions = {};
						
						if ( element.hasClass( 'ckeditor-spell-check-word' ) )
							word = element.getText();
						
						if ( !word || !plugin.isWordMisspelled( editor.name, word) || plugin.isWordIgnored( editor.name, word ) )
						{
							editor.addMenuItem( 'cention_spellcheck_no_errors',
								{
									label : editor.lang.CentionSpellCheck.noErrors,
									command : 'cention_spellcheck_no_errors',
									group : 'cention_spellcheck_suggestions',
									order : 1
								});
							mainSuggestions[ 'cention_spellcheck_no_errors' ] = CKEDITOR.TRISTATE_DISABLED;
						}
						else
						{
							itemSuggestions = plugin.suggestions(editor.name, word);
							
							var moreSuggestionsExist = false;

							for ( i = 0; i < itemSuggestions.length; i++ )
							{
								var commandName = 'cention_spellcheck_suggestion_' + itemSuggestions[i].replace( ' ', '_' );
								var command = ( function( e, s )
									{
										return {
											exec: function()
											{
												e.insertBeforeMe(editor.document.createText(s));
												e.remove();
											}
										};
									})( element, itemSuggestions[i] );
							
								if ( i < 5 )
								{
									addButtonCommand( editor.plugins.centionspellcheck, editor, 'button_' + commandName, itemSuggestions[i],
										commandName, command, 'cention_spellcheck_suggestions', i + 1, 'images/replace.png' );
								
									mainSuggestions[ commandName ] = CKEDITOR.TRISTATE_OFF;
								}
								else
								{
									addButtonCommand( editor.plugins.centionspellcheck, editor, 'button_' + commandName, itemSuggestions[i],
										commandName, command, 'cention_spellcheck_more_suggestions', i + 1, 'images/replace.png' );
								
									moreSuggestions[ commandName ] = CKEDITOR.TRISTATE_OFF;
								
									moreSuggestionsExist = true;
								}
							}
						
							if ( moreSuggestionsExist )
							{
								// Rgister the More suggestions group;
								editor.addMenuItem( 'cention_spellcheck_more_suggestions',
									{
										label : editor.lang.CentionSpellCheck.moreSuggestions,
										group : 'cention_spellcheck_more_suggestions',
										order : 10,
										getItems : function()
										{
											return moreSuggestions;
										}
									});
							}

							var learn_command =
							{
								exec: function()
								{
									plugin.learn(editor.name, element.getText());
								}
							};						
							var ignore_command =
							{
								exec: function()
								{
									plugin.ignore(editor.name, element.getText());
								}
							};
						
							addButtonCommand( editor.plugins.centionspellcheck, editor, 'learn', editor.lang.CentionSpellCheck.learnSpelling,
								'cention_spellcheck_learn', learn_command, 'cention_spellcheck_control', 1, 'images/add.png');
							addButtonCommand( editor.plugins.centionspellcheck, editor, 'ignore', editor.lang.CentionSpellCheck.ignoreSpelling,
								'cention_spellcheck_ignore', ignore_command, 'cention_spellcheck_control', 2, 'images/ignore.png');
						
							mainSuggestions[ 'cention_spellcheck_more_suggestions' ] = CKEDITOR.TRISTATE_OFF;
							mainSuggestions[ 'cention_spellcheck_learn' ] = CKEDITOR.TRISTATE_OFF;
							mainSuggestions[ 'cention_spellcheck_ignore' ] = CKEDITOR.TRISTATE_OFF;
						}
						
						return mainSuggestions;
					});
			}
			
			editor.ui.addRichCombo( 'CentionSpellCheckLanguage',
				{
					label : editor.lang.CentionSpellCheck.language.label,
					title : editor.lang.CentionSpellCheck.language.panelTitle,
					voiceLabel : editor.lang.CentionSpellCheck.language.voiceLabel,
					className : 'cke_font',
					multiSelect : false,
					modes : { wysiwyg : 1, plaintext: 1 },

					panel :
					{
						css : [ CKEDITOR.getUrl( editor.skinPath + 'editor.css' ) ].concat( editor.config.contentsCss ),
						voiceLabel : editor.lang.CentionSpellCheck.language.panelVoiceLabel
					},

					init : function()
					{
						var languages = { list: [] };
						
						if ( typeof CkeditorSpellCheckPluginDataSource == 'function' )
							languages = CkeditorSpellCheckPluginDataSource();
						
						this.startGroup( editor.lang.CentionSpellCheck.language.panelTitle );
						
						for ( var i = 0 ; i < languages.list.length ; i++ )
						{
							var language = languages.list[ i ];
							
							this.add( language.id, '<span>' + language.value + '</span>', language.value );
						}
					},

					onClick : function( value )
					{
						plugin.setLanguage( editor.name, value );
					},
					
					onRender : function( self )
					{
						var languages = { list: [] };
						
						if ( typeof CkeditorSpellCheckPluginDataSource == 'function' )
							languages = CkeditorSpellCheckPluginDataSource();
						
						if ( languages.preferred_id )
						{
							plugin.setLanguage( editor.name, languages.preferred_id );
						}
						else
						{
							if ( languages.list.length > 0 )
								plugin.setLanguage( editor.name, languages.list[ 0 ].id );
						}
					}
				});
			
			editor.addCommand( 'centionSpellCheck', new CKEDITOR.centionSpellCheckCommand() );
			editor.addCommand( 'centionSpellCheckDone', new CKEDITOR.centionSpellCheckDoneCommand() );

			editor.ui.addButton( 'CentionSpellCheck',
				{
					label : editor.lang.CentionSpellCheck.toolbarCheck,
					command : 'centionSpellCheck',
					icon : this.path + 'images/check.png'
				});
			editor.ui.addButton( 'CentionSpellCheckDone',
				{
					label : editor.lang.CentionSpellCheck.toolbarDone,
					command : 'centionSpellCheckDone',
					icon : this.path + 'images/done.png'
				});
			
			editor.on( 'key', function ()
				{
					if ( editor.getCommand( 'centionSpellCheckDone' ).state == CKEDITOR.TRISTATE_OFF ) {
						var selection = editor.getSelection();
						var ranges = selection.getRanges();
						editor.inSpellCheckMode = false;
						plugin.finish( editor.name, editor.document.getBody().$ );
						ranges[0].select();
						editor.getCommand( 'centionSpellCheck' ).setState( CKEDITOR.TRISTATE_OFF );
						editor.getCommand( 'centionSpellCheckDone' ).setState( CKEDITOR.TRISTATE_DISABLED );
						CKEDITOR.toggleCentionSpellCheckToolbarButtons();
					}
				});
		}
	});
})();

CKEDITOR.centionSpellCheckCommand = function(){};
CKEDITOR.centionSpellCheckCommand.prototype =
{
	modes: { 'wysiwyg': 1, 'source': 0 },
	/** @ignore */
	exec : function( editor )
	{
		CKEDITOR.plugins.CentionSpellCheck.check( editor.name, editor.document.getBody().$ );
		editor.getCommand( 'centionSpellCheck' ).setState( CKEDITOR.TRISTATE_DISABLED );
		editor.getCommand( 'centionSpellCheckDone' ).setState( CKEDITOR.TRISTATE_OFF );
		editor.inSpellCheckMode = true;
	}
};

CKEDITOR.centionSpellCheckDoneCommand = function(){};
CKEDITOR.centionSpellCheckDoneCommand.prototype =
{
	modes: { 'wysiwyg': 0, 'source': 0 },
	/** @ignore */
	exec : function( editor )
	{
		editor.inSpellCheckMode = false;
		CKEDITOR.plugins.CentionSpellCheck.finish( editor.name, editor.document.getBody().$ );
		editor.getCommand( 'centionSpellCheck' ).setState( CKEDITOR.TRISTATE_OFF );
		editor.getCommand( 'centionSpellCheckDone' ).setState( CKEDITOR.TRISTATE_DISABLED );
	}
};
