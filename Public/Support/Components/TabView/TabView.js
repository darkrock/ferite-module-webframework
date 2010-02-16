function _ComponentTabViewItem( tabview, id, contents ) {
	var self = ComponentToggleLabel( id );
	
	self._updateOnActivate = true;
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
		
		var checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.style.margin = '0px';
		checkbox.style.marginRight = '5px';
		checkbox.style.verticalAlign = 'middle';
		self.node().insertBefore(checkbox, self.node().childNodes[0]);
		
		if( self.getState(self._defaultState) == 'on' && GetComponent(self.getState('tabview')).getState('close-tab') && GetComponent(self.getState('tabview'))._tablist.length > 1 ) {
			closeImage = document.createElement('img');
			closeImage.src = uriForApplicationImageResource('black_cross.gif');
			closeImage.width = 6;
			closeImage.height = 6;
			closeImage.style.verticalAlign = 'middle';
			closeImage.style.marginLeft = '5px';
			closeImage.onclick = function() {
				GetComponent(self.getState('tabview')).action('remove-tab');
			};
			self.node().appendChild(closeImage);
		}
	};
	self.registerAction('click', function() {
		if( self.getState(self._defaultState) == 'off' ) {
			GetComponent(self.getState('tabview')).action('switch-tab', self.identifier());
		}
	});
	return self;
}
function ComponentTabView( id ) {
	var self = new Component(id);
	
	self._updateOnActivate = false;
	self._tablist = new Array();
	
	self.setState('close-tab', false);
	self.setState('new-tab', false);
	
	self.bind = function(){};
	
	self.registerTab = function( name, contents, label ) {
		SetComponent(name, _ComponentTabViewItem(self.identifier(), name, contents));
		_(name).setState('text-value', label);
		_(name).updateVisual();
		self._tablist.push(GetComponent(name));
	};
	self.removeSelectedTab = function() {
		if( self._tablist.length > 1 ) {
			for( i = 0; i < self._tablist.length; i++ ) {
				var tab = self._tablist[i];
				if( tab.getState(tab._defaultState) == 'on' ) {
					var other_tab = self._tablist[i + 1];
					if( i == (self._tablist.length - 1) ) {
						other_tab = self._tablist[i - 1];
					}
					self._tablist = self._tablist.without(tab);
					tab.node().parentNode.removeChild(tab.node());
					var contents = byId(tab.identifier() + '.contents')
					contents.parentNode.removeChild(contents);
					self.action('switch-tab', other_tab.identifier());
					break;
				}
			}
		}
	};
	self.addTab = function( name, label ) {
		var wrapper = byId(self.identifier() + 'Wrapper');
		var tab;
		var content;
		
		tab = document.createElement('li');
		tab.id = name;
		tab.appendChild(document.createTextNode(label));
		
		content = document.createElement('div');
		content.id = name + '.contents';
		content.className = 'tabviewcontents';
		content.style.display = 'none';
		
		wrapper.appendChild(content);

		if( self.getState('new-tab') ) {
			var newTabTab = byId(self.identifier() + '.NewTab');
			self.node().insertBefore(tab, newTabTab);
		} else {
			self.node().appendChild(tab);
		}
		
		self.registerTab(name, name + '.contents', label);
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
