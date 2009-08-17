// Register the related commands.
FCKCommands.RegisterCommand( 'CentionImage' , new FCKDialogCommand( 'Embed Image' , 'Embed Image' , FCKConfig.PluginsPath + 'centionimage/image.html', 340 , 200 ) ) ;

// Create the "Image" toolbar button.
var oCentionImageItem = new FCKToolbarButton( 'CentionImage', 'Image' ) ;
oCentionImageItem.IconPath = FCKConfig.PluginsPath + 'centionimage/image.gif' ;

FCKToolbarItems.RegisterItem( 'CentionImage', oCentionImageItem ) ; // 'CentionImage' is the name used in the Toolbar config.

