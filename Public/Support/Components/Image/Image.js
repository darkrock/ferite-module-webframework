function ComponentImage( id ) {
	var self = new Component(id);

	self.switchToMainImage = function() {
		self.node().src = self.getState('main-image');
	};
	self.switchToAlternativeImage = function() {
		self.node().src = self.getState('alternative-image');
	};
	
	var previousActivate = self.activate;
	self.activate = function activate() {
		if( self.getState('alternative-image') ) {
			self.node().onmouseover = function() {
				if( !self.getState('locked') && self.getState('alternative-image') != '' ) {
					self.switchToAlternativeImage();
				}
			};
			self.node().onmouseout = function() {
				if( !self.getState('locked') && self.getState('alternative-image') != '' ) {
					self.switchToMainImage();
				}
			};
		}
		previousActivate();
	};
	
	self.defaultAction = function() {
		self.action('click');
	};
	
	return self;
}