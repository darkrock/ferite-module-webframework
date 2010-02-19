function _ComponentTabViewItem( tabview, id, contents ) {
	var self = new Component( id );
	
	self._updateOnActivate = true;
	self._initialVisualUpdatePerformed = false;
	self._hasCloseButton = false;
	self.setState('tabview', tabview);
	self.setState('content', contents);
	
	self.labelNode = function() {
		return byId(id + '.label');
	};
	self.closeButtonNode = function() {
		return byId(id + '.CloseTabButton');
	};
	self.contentsNode = function() {
		return byId(id + '.contents');
	};
	
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

		self.labelNode().innerHTML = self.getState('text-value');
		
		if( self.getState(self._defaultState) == 'on' ) {
			self.applyHighlightColouring(self.node());
		} else {
			self.applyLowlightColouring(self.node());
		}
		
		if( GetComponent(self.getState('tabview')).getState('show-close-tab-button') ) {
			if( self._hasCloseButton == false && GetComponent(self.getState('tabview'))._tablist.length > 1 ) {
				var closeButton = document.createElement('img');
				closeButton.id = id + '.CloseTabButton';
				closeButton.src = uriForApplicationImageResource('black_cross.gif');
				closeButton.width = 6;
				closeButton.height = 6;
				closeButton.style.verticalAlign = 'middle';
				closeButton.style.marginLeft = '5px';
				closeButton.onclick = function( event ) {
					GetComponent(self.getState('tabview')).action('remove-tab', self.identifier());
					CancelEvent(event || window.event);
				};
				self.node().appendChild(closeButton);
				self._hasCloseButton = true;
			} else if( self._hasCloseButton == true && GetComponent(self.getState('tabview'))._tablist.length == 1 ) {
				var closeButton = byId(id + '.CloseTabButton');
				self.node().removeChild(closeButton);
				self._hasCloseButton = false;
			}
		}
		
		previousUpdateVisual();
		
		if( ! self._initialVisualUpdatePerformed ) {
			GetComponent(self.getState('tabview')).action('custom-tab-render', self);
			self._initialVisualUpdatePerformed = true;
		}
	};
	self.registerAction('click', function() {
		if( self.getState(self._defaultState) == 'off' ) {
			GetComponent(self.getState('tabview')).action('switch-tab', self.identifier());
		}
	});
	self.disableSelection(self.node());
	return self;
}
function ComponentTabView( id ) {
	var self = new Component(id);
	
	self._updateOnActivate = false;
	self._tablist = new Array();
	
	self.setState('show-close-tab-button', false);
	self.setState('show-add-tab-button', false);
	
	self.bind = function(){};
	
	self.registerTab = function( tabName, contents, label ) {
		SetComponent(tabName, _ComponentTabViewItem(self.identifier(), tabName, contents));
		_(tabName).setState('text-value', label);
		_(tabName).updateVisual();
		self._tablist.push(GetComponent(tabName));
	};
	self.removeTab = function( tabName ) {
		// We need at least one tab
		if( self._tablist.length > 1 ) {
			var tabCurrentSelected = null;
			var tabNewSelected = null;
			var tabRemove = null;
			var tabRemoveListPositon = 0;
			// Find the current selected tab and the tab that is going to be removed
			for( i = 0; i < self._tablist.length; i++ ) {
				var tab = self._tablist[i];
				if( tabCurrentSelected == null && tab.getState(tab._defaultState) == 'on' ) {
					tabCurrentSelected = tab;
				}
				if( tabRemove == null && tab.identifier() == tabName ) {
					tabRemove = tab;
					tabRemoveListPositon = i;
				}
				if( tabCurrentSelected && tabRemove )
					break;
			}
			// Check if we are removing the current selected tab
			if( tabCurrentSelected.identifier() == tabRemove.identifier() ) {
				// Find new tab to select
				var tabNewSelected = self._tablist[tabRemoveListPositon + 1];
				if( tabRemoveListPositon == (self._tablist.length - 1) ) {
					tabNewSelected = self._tablist[tabRemoveListPositon - 1];
				}
			}
			self._tablist = self._tablist.without(tabRemove);
			tabRemove.node().parentNode.removeChild(tabRemove.node());
			var contents = byId(tabRemove.identifier() + '.contents')
			contents.parentNode.removeChild(contents);
			if( tabNewSelected ) {
				self.action('switch-tab', tabNewSelected.identifier());
			} else if( self._tablist.length == 1 ) {
				// Update the current selected tabs visuals to remove
				// a potential close button
				tabCurrentSelected.updateVisual();
			}
		}
	};
	self.addTab = function( tabName, label ) {
		var wrapper = byId(self.identifier() + 'Wrapper');
		var tab;
		var tabLabel;
		var content;
		
		tab = document.createElement('li');
		tab.id = tabName;
		tab.className = 'tab';
		
		tabLabel = document.createElement('span');
		tabLabel.id = tabName + '.label';
		tabLabel.innerHTML = label;
		
		tab.appendChild(tabLabel);
		
		content = document.createElement('div');
		content.id = tabName + '.contents';
		content.className = 'tabviewcontents';
		content.style.display = 'none';
		
		wrapper.appendChild(content);

		if( self.getState('show-add-tab-button') ) {
			var addTabButton = byId(self.identifier() + '.AddTabButton');
			self.node().insertBefore(tab, addTabButton);
		} else {
			self.node().appendChild(tab);
		}
		
		self.registerTab(tabName, tabName + '.contents', label);
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
	self.registerAction('remove-tab', function( tab_name ) {
		self.removeTab(tab_name);
	});
	return self;
}
