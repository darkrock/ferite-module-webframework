CKEDITOR.dialog.add( 'centionimage', function( editor )
{
	var dialog;
	
	var imageSelector =
	{
		type : 'html',
		html : '',
		onLoad : function( event )
		{
			dialog = event.sender;
		},
		onShow : function()
		{
			var columns = 8;
			
			var images = CkeditorImagePluginDataSource();
			
			// Build the HTML for the images table.
			var html =
			[
				'<table cellspacing="2" cellpadding="2"><tbody>'
			];
			
			var i;
			
			for ( i = 0 ; i < images.length ; i++ )
			{
				var image = images[ i ];
				
				if ( i % columns === 0 )
					html.push( '<tr>' );
				
				html.push(
					'<td class="cke_hand cke_centered" style="vertical-align: middle; width: 50px; height: 50px;">' +
						'<img class="cke_hand" style="max-width: 40px; max-height: 40px;" title="' + image.name + '"' +
							 'alt="" src="' + CKEDITOR.tools.htmlEncode( image.url ) + '" />' +
					'</td>' );
				
				if ( i % columns == columns - 1 )
					html.push( '</tr>' );
			}

			if ( i < columns - 1 )
			{
				for ( ; i < columns - 1 ; i++ )
					html.push( '<td></td>' );
				html.push( '</tr>' );
			}

			html.push( '</tbody></table>' );
			
			this.getElement().setHtml( html.join( ' ' ) );
		},
		onClick : function( event )
		{
			var target = event.data.getTarget();
			var targetName = target.getName();

			if ( targetName == 'td' )
				target = target.getChild( [ 0 ] );
			else if ( targetName != 'img' )
				return;

			var src = target.getAttribute( 'src' );
			var title = target.getAttribute( 'title' );

			var img = editor.document.createElement( 'img',
			{
				attributes :
				{
					src : src,
					_cke_saved_src : src,
					title : title,
					alt : title,
					border : 0
				}
			});

			editor.insertElement( img );

			dialog.hide();
		},
		style : 'width: 100%; height: 100%;'
	};
	
	return {
		title : editor.lang.CentionImage.title,
		minWidth : 450,
		minHeight : 350,
		contents : [
			{
				id : 'tab1',
				label : '',
				title : '',
				padding : 0,
				expand : true,
				elements : [
					imageSelector
				]
			}
		],
		buttons : [ CKEDITOR.dialog.cancelButton ]
	}
});

