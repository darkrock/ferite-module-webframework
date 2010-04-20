(function()
{
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
	
	// Add scayt plugin.
	CKEDITOR.plugins.add( 'centionspellcheck',
	{
		requires : [ 'menubutton', 'richcombo' ],

		init : function( editor )
		{
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
							
						if ( element.hasClass( 'cention-spell-check-word' ) )
							word = element.getText();
						
						if ( !word )
							return null;
						
						if ( SpellCheck.isWordIgnored( editor.name, word ) )
							return null;
						
						itemSuggestions = SpellCheck.suggestions(editor.name, word);
						
						if ( !itemSuggestions || ( itemSuggestions && itemSuggestions.length == 0 ) )
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
								SpellCheck.learn(editor.name, element.getText());
							}
						};						
						var ignore_command =
						{
							exec: function()
							{
								SpellCheck.ignore(editor.name, element.getText());
							}
						};
						
						addButtonCommand( editor.plugins.centionspellcheck, editor, 'learn', 'Learn Spelling',
							'cention_spellcheck_learn', learn_command, 'cention_spellcheck_control', 1, 'images/add.png');
						addButtonCommand( editor.plugins.centionspellcheck, editor, 'ignore', 'Ignore Spelling',
							'cention_spellcheck_ignore', ignore_command, 'cention_spellcheck_control', 2, 'images/ignore.png');
						
						mainSuggestions[ 'cention_spellcheck_more_suggestions' ] = CKEDITOR.TRISTATE_OFF;
						mainSuggestions[ 'cention_spellcheck_learn' ] = CKEDITOR.TRISTATE_OFF;
						mainSuggestions[ 'cention_spellcheck_ignore' ] = CKEDITOR.TRISTATE_OFF;
						
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
						SpellCheck.setLanguage( editor.name, value );
					},
					
					onRender : function( self )
					{
						var languages = { list: [] };
						
						if ( typeof CkeditorSpellCheckPluginDataSource == 'function' )
							languages = CkeditorSpellCheckPluginDataSource();
						
						if ( languages.preferred_id )
						{
							SpellCheck.setLanguage( editor.name, languages.preferred_id );
						}
						else
						{
							if ( languages.list.length > 0 )
								SpellCheck.setLanguage( editor.name, languages.list[ 0 ].id );
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
		SpellCheck.check( editor.name, editor.document.getBody().$ );
		editor.getCommand( 'centionSpellCheck' ).setState( CKEDITOR.TRISTATE_DISABLED );
		editor.getCommand( 'centionSpellCheckDone' ).setState( CKEDITOR.TRISTATE_OFF );
	}
};

CKEDITOR.centionSpellCheckDoneCommand = function(){};
CKEDITOR.centionSpellCheckDoneCommand.prototype =
{
	modes: { 'wysiwyg': 0, 'source': 0 },
	/** @ignore */
	exec : function( editor )
	{
		SpellCheck.done( editor.name, editor.document.getBody().$ );
		editor.getCommand( 'centionSpellCheck' ).setState( CKEDITOR.TRISTATE_OFF );
		editor.getCommand( 'centionSpellCheckDone' ).setState( CKEDITOR.TRISTATE_DISABLED );
	}
};
