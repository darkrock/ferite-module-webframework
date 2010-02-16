/**
 * @file Cention image plugin
 */

CKEDITOR.plugins.add( 'centionimage',
{
	requires : [ 'dialog' ],
	
	init : function( editor )
	{
		var pluginName = 'centionimage';

		// Register the dialog.
		CKEDITOR.dialog.add( pluginName, this.path + 'dialogs/centionimage.js' );

		// Register the command.
		editor.addCommand( pluginName, new CKEDITOR.dialogCommand( pluginName ) );

		// Register the toolbar button.
		editor.ui.addButton( 'CentionImage',
			{
				label : editor.lang.CentionImage.label,
				command : pluginName,
				icon : this.path + 'images/centionimage.png'
			});
	}
} );
