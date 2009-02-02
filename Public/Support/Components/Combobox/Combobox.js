function ComponentCombobox( id ) {
	var self = ComponentTextfield(id);
	
	self.listNode = document.getElementById( id + '_list' );
	self.showingList = false;
	
	self.showList = function() {
		Position.clone( self.node(), self.listNode, { setWidth: false, setHeight: false, offsetTop: 0 + self.node().clientHeight + 1 } );
		self.listNode.style.width = self.node().offsetWidth - 2 + 'px';
		self.listNode.style.display = 'block';
		self.showingList = true;
	};
	
	self.hideList = function() {
		self.listNode.style.display = 'none';
		self.showingList = false;
	};
	
	var previousActivate = self.activate;
	self.activate = function activate() {
		if( self.getState('list-enabled') ) {
			self.node().onclick = function( event ) {
				if( self.showingList ) {
					self.hideList();
				} else {
					self.showList();
				}
			};
		}
		previousActivate();
	};
	
	return self;
}
