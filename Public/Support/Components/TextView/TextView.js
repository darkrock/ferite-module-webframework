CKEDITOR.on('instanceReady', function( event ) {
	event.editor.instanceReady = true;
});

function ComponentTextView( id ) {
	var self = ComponentTextfield(id);
	
	self._ckeditor_config = null;
	
	self.rows = function() { return self.node().rows; };
	self.columns = function() { return self.node().cols; };
	
	self.focus = function() {
		if( self.getState('rich-text') ) {
			var editor = CKEDITOR.instances[id];
			editor.focus();
		} else {
			self.node().focus();
		}
	};
	
	self.clear = function() {
		if( CKEDITOR.instances[id] ) {
			var editor = CKEDITOR.instances[id];
			editor.setData('');
		} else {
			self.node().value = '';
		}
	};
	
	self.updateFormValue = function() {
		if( CKEDITOR.instances[id] ) {
			var editor = CKEDITOR.instances[id];
			editor.setData(self.formValue());
			editor.updateElement();
		} else {
			self.node().value = self.formValue();
		}
	};
	
	self.textValue = function() {
		if( CKEDITOR.instances[id] ) {
			var editor = CKEDITOR.instances[id];
			editor.updateElement();
		}
		self.setState('text-value', self.node().value);
		return self.getState('text-value');
	};
	
	self.empty = function() {
		var value = self.textValue();
		if( CKEDITOR.instances[id] ) {
			value = value.replace('<br />', '').strip();
		}
		return (value ? false : true);
	};
	
	self.setTextValue = function( value ) {
		var editor = CKEDITOR.instances[id];
		if( editor && (editor.mode == 'wysiwyg' || editor.mode == 'source') ) {
			value = value.escapeHTML().replace(/(\r\n|[\r\n])/g, '<br />');
		}
		self.setState('text-value', value);
	};
	
	self.setRichTextValue = function( value ) {
		var editor = CKEDITOR.instances[id];
		if( !editor || editor.mode == 'plain' ) {
			value = value.stripTags().unescapeHTML().strip();
		}
		self.setState('text-value', value);
	};

	self.appendText = function( value ) {
		var editor = CKEDITOR.instances[id];
		if( editor && (editor.mode == 'wysiwyg' || editor.mode == 'source') ) {
			value = value.escapeHTML().replace(/(\r\n|[\r\n])/g, '<br />');
		}
		self.setState('text-value', self.textValue() + value);
	};
	
	self.appendRichText = function( value ) {
		var editor = CKEDITOR.instances[id];
		if( !editor || editor.mode == 'plain' ) {
			value = value.stripTags().unescapeHTML().strip();
		}
		self.setState('text-value', self.textValue() + value);
	};
	
	self.setRichText = function( value, config ) {
		if( value ) {
			self.enableRichText(config);
		} else {
			self.disableRichText();
		}
	};
	
	self.enableRichText = function( config ) {
		if( config ) {
			self._ckeditor_config = config;
		}
		if( !CKEDITOR.instances[id] ) {
			CKEDITOR.replace(self.node(), self._ckeditor_config);
		}
		self.setState('rich-text', true);
	}
	
	self.disableRichText = function() {
		var editor = CKEDITOR.instances[id];
		if( editor ) {
			var data = editor.getData();
			if( editor.mode == 'wysiwyg' || editor.mode == 'source' ) {
				data = data.stripTags().unescapeHTML().strip();
			}
			self.node().value = data;
			editor.destroy(true);
		}
		self.setState('rich-text', false);
	};
	
	return self;
}
