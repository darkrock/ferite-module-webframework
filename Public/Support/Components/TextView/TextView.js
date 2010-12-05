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

	self.setReadOnly = function( value ) {
		self._readOnly = value;
	};	
	self.setRichText = function( value ) {
		self._richText = value;
	};
	self.setCkeditor = function( value ) {
		self._ckeditor = value;
	};
	self.setCkeditorToolbar = function( value ) {
		self._ckeditorToolbar = value;
	};
	
	self.focus = function() {
		if( self.ckeditor() ) {
			if( self.ckeditor().focus )
				self.ckeditor().focus();
		} else {
			self.node().focus();
		}
	};
	
	self.updateFormValue = function() {
		var value = self.formValue();
		if( self.node() ) {
			self.node().value = value;
		}
		if( self.iframe() ) {
			if( self.iframe().contentDocument ) {
				doc = self.iframe().contentDocument;
			} else if (self.iframe.contentWindow) {
				doc = self.iframe().contentWindow.document;
			} else {
				doc = self.iframe().document;
			}
		  
			doc.open();
			doc.write(value);
			doc.close();
			if(doc.body != null ) {
				Element.setStyle(doc.body, {
					'fontFamily': Element.getStyle(self.node(), 'fontFamily'),
					'fontSize':   Element.getStyle(self.node(), 'fontSize') });
			}
		}

		if( self.ckeditor() ) {
			self.ckeditor().setData(value);
			self.ckeditor().updateElement();
		}
		return self.formValue();
	};
	
	self.textValue = function() {
		var value;
		if( self._ckeditor == true ) {
			value = self.ckeditor().getData();
			self._states['text-value'] = value;
		} else {	
			value = self.node().value;
			self._states['text-value'] = value;
		}
		return value;
	};
	
	self.empty = function() {
		var value = self.textValue();
		if( self.ckeditor() ) {
			value = value.replace('<br />', '').strip(); /* Ckeditor always leaves a <br /> */
		}
		return (value ? false : true);
	};
	
	self.setTextValue = function( value ) {
		if( (self._ckeditor && !self._readOnly) || self._richText ) {
			value = value.escapeHTML().replace(/(\r\n|[\r\n])/g, '<br />');
		}
		self.setState('text-value', value);
		self.node().value = value;
	};
	
	self.setRichTextValue = function( value ) {
		if( ! self._richText && ! self._ckeditor ) {
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
	
	var previousActivate = self.activate;
	self.activate = function activate() {
		CKEDITOR.on('instanceReady', function( event ) {
			if( ! event.editor.textViewComponentBlurRegistered ) {
				event.editor.textViewComponentBlurRegistered = true;
				event.editor.on('blur', function( ) {
					self.action('blur');
				});
			}
		});
		if( self._ckeditor == true && self._richText == false ) {
			self._states['text-value'] = self.getState('text-value').escapeHTML().replace(/(\r\n|[\r\n])/g, '<br />');
		}
		self.reconfigure(self._ckeditor, self._richText, self._readOnly);
		previousActivate();
	};
	
	self.enableRichText = function() {
		self.reconfigure(self._ckeditor, true, self._readOnly);
	};
	self.disableRichText = function() {
		self.reconfigure(self._ckeditor, false, self._readOnly);
	};
	
	self.reconfigure = function( ckeditor, richText, readOnly ) {
		self._ckeditor = ckeditor;
		self._richText = richText;
		self._readOnly = readOnly;
		// Iframe
		if( readOnly && richText ) {
			self.updateFormValue();
			if( self.ckeditor() ) {
				self.ckeditor().destroy(true);
			}
			Element.hide(self.node());
			Element.show(self.iframe());
		}
		// Textarea (disabled)
		else if( readOnly && !richText ) {
			self.updateFormValue();
			if( self.ckeditor() ) {
				self.ckeditor().destroy(true);
			}
			Element.hide(self.iframe());
			Element.show(self.node());
			self.node().readOnly = true;
		}
		// Ckeditor (plain text mode)
		else if( ckeditor && !richText ) {
			self.updateFormValue();
			Element.hide(self.iframe());
			Element.hide(self.node());
			if( self.ckeditor() ) {
				self.ckeditor().setPlainTextMode(true);
			} else {
				var textarea_height = 200;
				if( self.node().style.height ) {
					textarea_height = self.node().style.height;
				} else if( Element.getHeight(self.node()) > 0 ) {
					textarea_height = Element.getHeight(self.node())
				}
				var callback = function( event ) {
					if( event.editor.name == id ) {
						event.editor.setPlainTextMode(true);
						CKEDITOR.removeListener('instanceReady', callback);
					}
				};
				CKEDITOR.on('instanceReady', callback);
				CKEDITOR.replace(self.node(), { toolbar: self._ckeditorToolbar, height: textarea_height });
			}
		}
		// Ckeditor
		else if( (ckeditor || richText) && !readOnly ) {
			var textarea_height = 200;
			if( self.node().style.height ) {
				textarea_height = self.node().style.height;
			} else if( Element.getHeight(self.node()) > 0 ) {
				textarea_height = Element.getHeight(self.node())
			}
			self.updateFormValue();
			Element.hide(self.iframe());
			Element.hide(self.node());
			if( self.ckeditor() ) {
				self.ckeditor().setPlainTextMode(false);
			} else {
				CKEDITOR.replace(self.node(), { toolbar: self._ckeditorToolbar, height: textarea_height });
			}
		}
		// Textarea
		else {
			self.updateFormValue();
			if( self.ckeditor() ) {
				self.ckeditor().destroy(true);
			}
			Element.hide(self.iframe());
			Element.show(self.node());
			self.node().readOnly = false;
		}
		return self.textValue();
	}

		self.formValue = function() {
			return self._states['text-value'];	
		};

	return self;
}
