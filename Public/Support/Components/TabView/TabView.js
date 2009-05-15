function _ComponentTabViewItem( tabview, id, contents ) {
	var self = ComponentToggleLabel( id );
	
	self._updateOnActivate = false;
	self.setState('tabview', tabview);
	self.setState('content', contents);
	
	self.updateVisual();
	
	var previousUpdateVisual = self.updateVisual;
	self.updateVisual = function() {
		var content = byId(self.getState('content'));
		if( content ) {
			if( content && self.getState(self._defaultState) == 'on' ) {
				self.applyContentColouring(content);
				content.style.display = 'block';
			} else {
				content.style.display = 'none';
			}
		}
		previousUpdateVisual();
	};
	self.registerAction('click', function() {
		GetComponent(self.getState('tabview')).action('switch-tab', self.identifier());
	});
	return self;
}
function ComponentTabView( id ) {
	var self = new Component(id);
	
	self._updateOnActivate = false;
	self._tablist = new Array();
	self.bind = function(){};
	self.registerTab = function( name, contents, label ) {
		SetComponent(name, _ComponentTabViewItem(self.identifier(), name, contents));
		_(name).setState('text-value', label);
		_(name).updateVisual();
		self._tablist.push(GetComponent(name));
	};
	self.registerAction('switch-tab', function( target_tab ) {
		if( target_tab == '' )
			target_tab = self._tablist[0].identifier();
		for( i = 0; i < self._tablist.length; i++ ) {
			var tab = self._tablist[i];
			tab.setState(tab._defaultState, 'off');
			if( tab.identifier() == target_tab ) {
				tab.setState(tab._defaultState, 'on');
			}
			if( !tab.active() )
				tab.activate();
		}
		self.setState(self._defaultState, target_tab);
	});
	return self;
}