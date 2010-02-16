/*
Copyright (c) 2003-2009, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

CKEDITOR.editorConfig = function( config )
{
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
	
	config.skin = 'cention';
	config.uiColor = '#F2F2F2';
	config.toolbar = 'Cention';
	config.removePlugins = 'elementspath,image,resize,link,showblocks';
	config.extraPlugins = "centionimage,centionlink,centionspellcheck";
	config.enterMode = CKEDITOR.ENTER_BR;
	config.shiftEnterMode = CKEDITOR.ENTER_BR;
	config.toolbarCanCollapse = false;
	
	config.toolbar_Full =
	[
		['Source','-','Save','NewPage','Preview','-','Templates'],
		['Cut','Copy','Paste','PasteText','PasteFromWord','-','Print', 'SpellChecker', 'Scayt'],
		['Undo','Redo','-','Find','Replace','-','SelectAll','RemoveFormat'],
		['Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField'],
		'/',
		['Bold','Italic','Underline','Strike','-','Subscript','Superscript'],
		['NumberedList','BulletedList','-','Outdent','Indent','Blockquote'],
		['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],
		['Unlink','Anchor'],
		['Image','Flash','Table','HorizontalRule','Smiley','SpecialChar','PageBreak'],
		'/',
		['Styles','Format','Font','FontSize'],
		['TextColor','BGColor'],
		['Maximize', 'ShowBlocks','-','About']
	];

	config.toolbar_Empty =
	[
	];

	config.toolbar_Cention =
	[
		['Bold','Italic','Underline','Strike'],
		['NumberedList','BulletedList'],
		['Outdent','Indent','Blockquote'],
		['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],
		['CentionLink', 'Link'],
		['CentionImage','HorizontalRule'],
		['Font','FontSize'],
		['TextColor','BGColor'],
		['CentionSpellCheckLanguage', 'CentionSpellCheck', 'CentionSpellCheckDone'],
		['PlainText']
	];
	
	config.toolbar_CentionPlainText =
	[
		['CentionSpellCheckLanguage', 'CentionSpellCheck', 'CentionSpellCheckDone']
	];
	
	config.menu_groups = 'cention_spellcheck_suggestions,cention_spellcheck_more_suggestions,cention_spellcheck_control,clipboard,centionlink';
};
