function ComponentBackgroundFileUploader( id ) {
	var self = new Component(id);
	
	self._items = new Array();
	
	self.form = function() {
		var iframeName = id + 'BackgroundFileUploadIFrame';
		var formName = id + 'BackgroundFileUploadForm';
		var form = document.getElementById(formName);
		if( !form ) {
			var form = document.createElement('form');
			form.id = formName;
			form.method = 'POST';
			form.enctype = 'multipart/form-data';
			form.encoding = 'multipart/form-data';
			form.action = self.getState('form-action');
			form.target = iframeName;
			document.body.appendChild(form);
			form.appendChild((function() {
				var input = document.createElement('input');
				input.type = 'hidden';
				input.id = id + 'uieventcomponent';
				input.name = 'uieventcomponent';
				input.value = self.getState('file-input-id');
				return input;
			})());
			form.appendChild((function() {
				var input = document.createElement('input');
				input.type = 'hidden';
				input.name = 'FileUploadHelperName';
				input.value = self.identifier();
				return input;
			})());
		}
		return form;
	};

	self.uploadFile = function() {
		var fileInput = byId(self.getState('file-input-id'));
		var fileInputParent = fileInput.parentNode;
		
		var fileNameMatch = fileInput.value.match('([^\\/]*)$');
		var fileName = fileNameMatch[0];
		
		self.action('startUpload', fileName);
		
		var form = self.form();
		/*var input = byId(self.identifier() + 'uieventcomponent');
		input.value = self.getState('file-input-id'); */
		form.appendChild(fileInput);
		form.submit();
		form.reset();
		
		fileInputParent.appendChild(fileInput);
	};
	
	self.finishUpload = function( id ) {
		if( id ) {
			self._items.push(id);
			self.updateFormValue();
		}
		self.action('finishUpload', id);
	};
	
	self.formValue = function() {
		var output = '';
		for( i = 0; i < self._items.length; i++ ) {
			var item = self._items[i];
			output += encodeURIComponent(item);
			if( (i + 1) < self._items.length ) {
				output += ',';
			}
		}
		return '[' + output + ']';
	};
	/*
	self.updateFormValue = function() {
		var node = byId('FormValue_' + self.identifier());
		if( node ) {
			node.value = self.formValue();
		}
	};
	self.submission = function() {
		return self.identifier() + '=' + encodeURIComponent(self.formValue());
	};
	*/
	
	self.clear = function() {
		self._items = new Array();
	};
	
	return self;
}
