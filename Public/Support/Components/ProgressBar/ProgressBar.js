function ComponentProgressBar( id ) {
	var self = new Component(id);

	self.setState('percent', 0);
	self.setState('transitional', false);
	
	var previousUpdateVisual = self.updateVisual;
	self.updateVisual = function() {
		self.applyLowlightColouring(self.node());

		if( self.getState('percent') > 0 ) {
			// Create the progress node
			var content = document.createElement('div');
			content.innerHTML = '<b>' + self.getState('percent') + '%</b>';
			content.style.width = '' + (self.getState('percent') * 2) + 'px';
			content.style.padding = '2px';
			self.applyHighlightColouring(content);
			// Add the progress node
			self.node().innerHTML = '';
			self.node().style.padding = '0px';
			self.node().style.width = '204px';
			self.node().appendChild(content);
		} else {
			self.node().style.width = '200px';
			self.node().style.padding = '2px';
			self.node().innerHTML = '0%';
		}
		
		self.node().style.border = '1px solid #333';
		previousUpdateVisual();
	};
	return self;
}
