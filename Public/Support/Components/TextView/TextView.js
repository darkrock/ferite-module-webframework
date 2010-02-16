function ComponentTextView( id ) {
	var self = ComponentTextfield(id);
	
	self._readOnly = false;
	self._richText = false;
	self._ckeditor = false;
	self._ckeditorToolbar = 'Full';
	
	self.rows = function() { return self.node().rows; };
	self.columns = function() { return self.node().cols; };
	
	self.iframe = function() { return $(id + 'Iframe'); };
	self.ckeditor = function() { return CKEDITOR.instances[id]; };
	
	self.setCkeditorToolbar = function( value ) {
		self._ckeditorToolbar = value;
	};
	
	self.setReadOnly = function( value ) {
		self._readOnly = value;
	};
	
	self.focus = function() {
		if( self.ckeditor() ) {
			if( self.ckeditor().focus )
				self.ckeditor().focus();
		} else {
			self.node().focus();
		}
	};
	
	self.clear = function() {
		if( self.ckeditor() ) {
			self.ckeditor().setData('');
		} else {
			self.node().value = '';
		}
	};
	
	self.updateFormValue = function() {
		if( self._richText ) {
			if( ! self._readOnly ) {
				self.ckeditor().setData(self.formValue());
				self.ckeditor().updateElement();
			} else {
				var doc = self.iframe().contentWindow.document;
				doc.open();
				doc.write(self.formValue());
				doc.close();
				Element.setStyle(doc.body, {
					'fontFamily': Element.getStyle(self.node(), 'fontFamily'),
					'fontSize':   Element.getStyle(self.node(), 'fontSize') });
			}
		} else {
			self.node().value = self.formValue();
		}
	};
	
	self.textValue = function() {
		if( self.ckeditor() ) {
			self.ckeditor().updateElement();
		}
		self.setState('text-value', self.node().value);
		return self.getState('text-value');
	};
	
	self.empty = function() {
		var value = self.textValue();
		if( self.ckeditor ) {
			value = value.replace('<br />', '').strip(); /* Ckeditor always leaves a <br /> */
		}
		return (value ? false : true);
	};
	
	self.setTextValue = function( value ) {
		if( self._ckeditor || self._richText ) {
			value = value.escapeHTML().replace(/(\r\n|[\r\n])/g, '<br />');
		}
		self.setState('text-value', value);
	};
	
	self.setRichTextValue = function( value ) {
		if( ! self._richText ) {
			value = value.stripTags().unescapeHTML().strip();
		}
		self.setState('text-value', value);
	};
	
	self.appendText = function( value ) {
		if( self._richText ) {
			value = value.escapeHTML().replace(/(\r\n|[\r\n])/g, '<br />');
		}
		self.setState('text-value', self.textValue() + value);
	};
	
	self.appendRichText = function( value ) {
		if( ! self._richText ) {
			value = value.stripTags().unescapeHTML().strip();
		}
		self.setState('text-value', self.textValue() + value);
	};
	
	self.setCkeditor = function( value, activate ) {
		self._ckeditor = value;
		if( activate ) {
			if( value ) {
				self.enableCkeditor();
			} else {
				self.disableCkeditor();
			}
		}
	};
	
	self.enableCkeditor = function() {
		if( ! self.ckeditor() ) {
			if( ! self._richText ) {
				var callback = function( event ) {
					if( event.editor.name == id ) {
						self.disableRichText();
						CKEDITOR.removeListener('instanceReady', callback);
					}
				};
				CKEDITOR.on('instanceReady', callback);
			}
			CKEDITOR.replace(self.node(), { toolbar: self._ckeditorToolbar, height: self.node().style.height });
		}
	};
	
	self.disableCkeditor = function() {
		if( self.ckeditor() ) {
			self.node().value = self.ckeditor().getData().stripTags().unescapeHTML().strip();
			self.ckeditor().destroy(true);
		}
	};
	
	self.setRichText = function( value, activate ) {
		self._richText = value;
		if( activate ) {
			if( value ) {
				self.enableRichText();
			} else {
				self.disableRichText();
			}
		}
	};
	
	self.enableRichText = function() {
		self._richText = true;
		if( ! self._readOnly ) {
			if( ! self.ckeditor() ) {
				self.enableCkeditor();
			} else {
				self.ckeditor().plainTextMode(false);
			}
		} else {
			self.updateFormValue();
			Element.hide(self.node()); /* IE does not like self.node().hide() */
			self.iframe().show();
		}
	};
	
	self.disableRichText = function() {
		self._richText = false;
		if( ! self._readOnly ) {
			if( self._ckeditor ) {
				if( ! self.ckeditor() ) {
					self.enableCkeditor();
				} else {
					self.ckeditor().plainTextMode(true);
				}
			} else {
				self.disableCkeditor();
			}
		} else {
			self.updateFormValue();
			self.iframe().hide();
			Element.show(self.node());  /* IE does not like self.node().show() */
		}
	};
	
	var previousActivate = self.activate;
	self.activate = function activate() {
		if( ! self._readOnly ) {
			if( self._ckeditor || self._richText ) {
				self.enableCkeditor();
			}
		} else {
			if( self._richText ) {
				Element.hide(self.node()); /* IE does not like self.node().hide() */
				self.iframe().show();
			} else {
				self.node().readonly = true;
			}
		}
		previousActivate();
	};
	
	return self;
}
