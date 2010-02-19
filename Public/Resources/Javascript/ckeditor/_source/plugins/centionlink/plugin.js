/**
 * @file Cention link plugin
 */

CKEDITOR.plugins.add( 'centionlink',
{
	requires : [ 'fakeobjects' ],
	
	init : function( editor )
	{
		var pluginName = 'centionlink';

		// Register the dialog.
		CKEDITOR.dialog.add( pluginName, this.path + 'dialogs/centionlink.js' );

		// Register the command.
		editor.addCommand( pluginName, new CKEDITOR.dialogCommand( pluginName ) );
		editor.addCommand( 'centionunlink', new CKEDITOR.centionUnlinkCommand() );

		// Register the toolbar button.
		editor.ui.addButton( 'CentionLink',
			{
				label : editor.lang.CentionLink.toolbar,
				command : pluginName,
				icon : this.path + 'images/centionlink.png'
			});
			
		// Register selection change handler for the unlink button.
		editor.on( 'selectionChange', function( evt )
			{
				/*
				* Despite our initial hope, document.queryCommandEnabled() does not work
				* for this in Firefox. So we must detect the state by element paths.
				*/
				var command = editor.getCommand( 'centionunlink' );
				var element = ( evt.data.path && evt.data.path.lastElement ? evt.data.path.lastElement.getAscendant( 'a', true ) : null );
				if ( element && element.getName() == 'a' && element.getAttribute( 'href' ) )
					command.setState( CKEDITOR.TRISTATE_OFF );
				else
					command.setState( CKEDITOR.TRISTATE_DISABLED );
			} );
		
		// If the "menu" plugin is loaded, register the menu items.
		if ( editor.addMenuItems )
		{
			editor.addMenuItems(
				{
					centionlink :
					{
						label : editor.lang.CentionLink.menu,
						command : 'centionlink',
						icon : this.path + 'images/centionlink.png',
						group : 'centionlink',
						order : 1
					},

					centionunlink :
					{
						label : editor.lang.CentionLink.unlink,
						command : 'centionunlink',
						icon : this.path + 'images/centionunlink.png',
						group : 'centionlink',
						order : 5
					}
				});
		}
		
		// If the "contextmenu" plugin is loaded, register the listeners.
		if ( editor.contextMenu )
		{
			editor.contextMenu.addListener( function( element, selection )
				{
					if ( !element )
						return null;

					if ( !( element = element.getAscendant( 'a', true ) ) )
						return null;
					
					return { centionlink : CKEDITOR.TRISTATE_OFF, centionunlink : CKEDITOR.TRISTATE_OFF };
				});
		}
	}
} );

CKEDITOR.centionUnlinkCommand = function(){};
CKEDITOR.centionUnlinkCommand.prototype =
{
	/** @ignore */
	exec : function( editor )
	{
		/*
		 * execCommand( 'unlink', ... ) in Firefox leaves behind <span> tags at where
		 * the <a> was, so again we have to remove the link ourselves. (See #430)
		 *
		 * TODO: Use the style system when it's complete. Let's use execCommand()
		 * as a stopgap solution for now.
		 */
		var selection = editor.getSelection(),
			bookmarks = selection.createBookmarks(),
			ranges = selection.getRanges(),
			rangeRoot,
			element;

		for ( var i = 0 ; i < ranges.length ; i++ )
		{
			rangeRoot = ranges[i].getCommonAncestor( true );
			element = rangeRoot.getAscendant( 'a', true );
			if ( !element )
				continue;
			ranges[i].selectNodeContents( element );
		}

		selection.selectRanges( ranges );
		editor.document.$.execCommand( 'unlink', false, null );
		selection.selectBookmarks( bookmarks );
	}
};
