function ComponentCombobox( id ) {
	var self = ComponentTextfield(id);
	
	self.iconNode = document.getElementById( id + '_icon' );
	self.listNode = document.getElementById( id + '_list' );
	self.showingList = false;
	
	self.showList = function() {
		var iconWidth = 0;
		if( self.iconNode ) {
			iconWidth = self.iconNode.offsetWidth;
		}
		Position.clone( self.node(), self.listNode, { setWidth: false, setHeight: false, offsetTop: 0 + self.node().clientHeight + 1 } );
		self.listNode.style.width = self.node().offsetWidth + iconWidth - 1 + 'px';
		self.listNode.style.display = 'block';
		self.showingList = true;
	};
	
	self.hideList = function() {
		self.listNode.style.display = 'none';
		self.showingList = false;
	};
	
	self.clearTextfield = function() {
		self.node().value = '';
	};
	
	var previousActivate = self.activate;
	self.activate = function activate() {
		if( self.getState('list-enabled') ) {
			if( self.iconNode ) {
				self.iconNode.onclick = function( event ) {
					if( self.showingList ) {
						self.hideList();
					} else {
						self.showList();
					}
				};
			} else {
				self.node().onclick = function( event ) {
					if( self.showingList ) {
						self.hideList();
					} else {
						self.showList();
					}
				};
			}
		}
		if( ! self.getState('textfield-enabled') ) {
			self.node().onfocus = function( event ) {
				Hotkeys.add('Backspace', function() {
					self.clearTextfield();
				});
				Hotkeys.add('Delete', function() {
					self.clearTextfield();
				});
			};
			self.node().onblur = function( event ) {
				Hotkeys.remove('Backspace');
				Hotkeys.remove('Delete');
			};
		}
		previousActivate();
	};
	
	return self;
}
