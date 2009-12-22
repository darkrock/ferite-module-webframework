CKEDITOR.dialog.add( 'centionlink', function( editor )
{
	return {
		title : 'Link',
		minWidth : 500,
		minHeight : 150,
		contents : [
			{
				id : 'tab1',
				label : '',
				title : '',
				elements : [
					{
						type : 'vbox',
						children : [
							{
								type : 'text',
								id : 'link',
								label : 'Text to display:',
								commit : function( data )
								{
									data.text = this.getValue();
								}
							},
							{
								type : 'hbox',
								widths : [ '1%', '99%' ],
								style : 'vertical-align: middle;',
								children : [
									{
										type : 'html',
										html : 'Link to:'
									},
									{
										type : 'hbox',
										widths : [ '25%', '75%' ],
										style : 'vertical-align: middle;',
										children : [
											{
												type : 'radio',
												id : 'type',
												'default' : 'web',
												style : 'vertical-align: middle;',
												items : [
													[ 'Web address', 'web' ],
													[ 'Email address', 'email' ]
												],
												onChange : function()
												{
													var dialog = this.getDialog();
													var href = dialog.getContentElement( 'tab1', 'href' );
													
													if ( this.getValue() == 'web' )
													{
														href.setLabel( 'To what URL should this link go?' );
													}
													else
													{
														href.setLabel( 'To what email address should this link?' );
													}
												}
											},
											{
												type : 'html',
												html : '&nbsp;'
											}
										]
									}
								]
							},
							{
								type : 'text',
								id : 'href',
								label : 'To what URL should this link go?',
								commit : function( data )
								{
									data.href = this.getValue();
								}
							}
						]
					}
				]
			}
		],
		onShow : function()
		{
			var editor = this.getParentEditor();
			var selection = editor.getSelection();
			var ranges = selection.getRanges();
			var element = null;
			
			// Fill in all the relevant fields if there's already one link selected.
			if ( ranges.length == 1 )
			{
				var rangeRoot = ranges[0].getCommonAncestor( true );
				element = rangeRoot.getAscendant( 'a', true );
				if ( element && element.getAttribute( 'href' ) )
				{
					selection.selectElement( element );
				}
				else
				{
					element = null;
				}
			}

			this.getContentElement( 'tab1', 'link' ).setValue( '' );
			this.getContentElement( 'tab1', 'href' ).setValue( '' );
			
			if ( ranges.length == 1 && ranges[0].collapsed && element == null )
			{
				this.getContentElement( 'tab1', 'link' ).enable();
			}
			else
			{
				var rangeRoot = ranges[0].getCommonAncestor( true );
				this.getContentElement( 'tab1', 'link' ).disable();
				this.getContentElement( 'tab1', 'link' ).setValue( rangeRoot.getText() );
			}
			
			
			if ( element )
			{
				var href = element.getAttribute( 'href' );
				var type = 'web';
				
				var r = new RegExp('^mailto:(.+)$');
				var m = r.exec( href );
				
				if ( m )
				{
					href = m[1];
					type = 'email';
				}
				
				this.getContentElement( 'tab1', 'type' ).setValue( type );
				this.getContentElement( 'tab1', 'href' ).setValue( href );
				
				// Record down the selected element in the dialog.
				this._.selectedElement = element;
			}
		},
		onOk : function()
		{
			var editor = this.getParentEditor();
			var attributes = { href : 'javascript:void(0)/*' + CKEDITOR.tools.getNextNumber() + '*/' };
			
			var link = this.getContentElement( 'tab1', 'link' ).getValue();
			var type = this.getContentElement( 'tab1', 'type' ).getValue();
			var href = this.getContentElement( 'tab1', 'href' ).getValue();
			
			if ( type == 'email' )
			{
				href = 'mailto:' + href;
			}
			
			attributes.href = href;
			attributes._cke_saved_href = href;

			if ( href )
			{
				if ( !link )
				{
					link = href;
				}
				
				if ( !this._.selectedElement )
				{
					// Create element if current selection is collapsed.
					var selection = editor.getSelection();
					var ranges = selection.getRanges();
					
					if ( ranges.length == 1 && ranges[0].collapsed )
					{
						var text = new CKEDITOR.dom.text( link, editor.document );
						ranges[0].insertNode( text );
						ranges[0].selectNodeContents( text );
						selection.selectRanges( ranges );
					}

					// Apply style.
					var style = new CKEDITOR.style( { element : 'a', attributes : attributes } );
					style.type = CKEDITOR.STYLE_INLINE;	// need to override... dunno why.
					style.apply( editor.document );
				}
				else
				{
					// We're only editing an existing link, so just overwrite the attributes.
					var element = this._.selectedElement;
					element.setAttributes( attributes );
					delete this._.selectedElement;
				}
				
				return true;
			}
			
			return false;
		}
	}
});
