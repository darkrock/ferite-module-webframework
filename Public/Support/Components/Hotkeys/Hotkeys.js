function ComponentHotkeys( id ) {
	var self = new Component(id);

	self.timeout = 0;
	self.setState('press-key-combo', "Press Key Combination");
	self.setState('advice-polite', "Press Enter ↵ to Confirm, Escape to Cancel");
	self.setState('advice-terse', "You must chose a key combination to perform an action");
	self.setState('show-window', "Space");
	self.setState('use-ctrl', false);
	self.setState('use-alt', true);
	self.setState('use-shift', true);
	self.setState('use-meta', true);
	self.registeredKeys = new Array();
	
	self.performHotkeyAction = function() {
		if( self.getState('current-action') ) {
			self.cancelHotkeyAction();			
			var impl = self.getState('current-implementation');
			impl(self.getState('current-action'));
		} else {
			$(self.identifier() + '_Shortcut').innerHTML = "☛";
			$(self.identifier() + '_Action').innerHTML = self.getState('press-key-combo');
			$(self.identifier() + '_Advice').innerHTML = "(" + self.getState('advice-terse') + ")";
			$(self.identifier() + '_Advice').appear({duration:0.5});
		}
	}
	
	self.cancelHotkeyAction = function() {
		if( self.timeout > 0 ) {
			clearTimeout(self.timeout);
			self.timeout = 0;
		}
		Hotkeys.remove("Esc");
		Hotkeys.remove("Enter");		
		for( i = 0; i < self.registeredKeys.length; i++ ) {
			Hotkeys.remove(self.registeredKeys[i][0]);
		}
		$(self.identifier() + '_Dialog').fade({duration:0.5});
	}
	
	self.displayHotkeyWindow = function( direct ) {
		if( $(self.identifier() + '_Dialog').style.display == 'none' ) {
			$(self.identifier() + '_Available').innerHTML = '';
			$(self.identifier() + '_Available').style.display = 'none';
			$(self.identifier() + '_Shortcut').innerHTML = "☛";
			$(self.identifier() + '_Action').innerHTML = self.getState('press-key-combo');
			$(self.identifier() + '_Advice').innerHTML = "";
			$(self.identifier() + '_Advice').style.display = 'none';
			$(self.identifier() + '_Dialog').style.display = 'block';
			self.setState('current-action', '');
			self.setState('current-implementation', function(e){alert('cocks')});
		
			if( !direct ) {
				var keys = '';
				for( i = 0; i < self.registeredKeys.length; i++ ) {
					keys += self.keyModifiersMakePretty(self.registeredKeys[i][0]) + ((i + 1) < self.registeredKeys.length ? ', ' : '');
					Hotkeys.add(self.registeredKeys[i][0], self.registeredKeys[i][1], {}, function() {
						self.performHotkeyAction();
					});
				}
				$(self.identifier() + '_Available').innerHTML = keys;
				$(self.identifier() + '_Available').appear({duration:0.5});
			}
			
			Hotkeys.add("Enter", function() {
				self.performHotkeyAction();
			});
			Hotkeys.add("Esc", function() {
				self.cancelHotkeyAction();
			});
		}
		if( self.timeout ) {
			clearTimeout(self.timeout);
			self.timeout = setTimeout("_('" + self.identifier() + "').cancelHotkeyAction()", 20000);
		}
	}
	
	self.keyModifiersToString = function() {
		var value = '';
		if( self.getState('use-ctrl') ) {
			value += 'Ctrl+';
		}
		if( self.getState('use-alt') ) {
			value += 'Alt+';
		}
		if( self.getState('use-shift') ) {
			value += 'Shift+';
		}
		if( self.getState('use-meta') ) {
			value += 'Meta+';
		}
		return value;
	};
	self.keyModifiersMakePretty = function( str ) {
		str = str.replace(/Left/,'←');
		str = str.replace(/Right/, '→');
		str = str.replace(/Up/, '↑');
		str = str.replace(/Down/, '↓');
		str = str.replace(/Meta/, '⌘');
		return str;
	}
	self.registerHotkeyAction = function( keycombo, action, description, block ) {
		var real_shortcut = self.keyModifiersToString() + keycombo;
		var closure = function(e, shortcut, options) {
			$(self.identifier() + '_Advice').style.display = "none";
			self.displayHotkeyWindow(true);
			$(self.identifier() + '_Shortcut').innerHTML = self.keyModifiersMakePretty(real_shortcut);
			$(self.identifier() + '_Action').innerHTML = description;
			$(self.identifier() + '_Advice').innerHTML = "(" + self.getState('advice-polite') + ")";
			$(self.identifier() + '_Advice').appear({duration:0.5});
			self.setState('current-action', action);
			self.setState('current-implementation', block);
		};
		Hotkeys.add(real_shortcut, closure, {}, function() {
			self.performHotkeyAction();
		});
		self.registeredKeys.push([ keycombo, closure ]);
	}

	var previousActivate = self.activate;
	self.activate = function() {
		previousActivate();
		$(self.identifier() + '_Dialog').style.display = 'none';
		Hotkeys.add(self.keyModifiersToString() + self.getState('show-window'), function(e, shortcut) {
			self.displayHotkeyWindow(false);
		});
		self.registeredKeys.sort(function( nameA, nameB ){
			if (nameA < nameB) 
				return -1;
			if (nameA > nameB) 
				return 1;
			return 0;
		});
	};
	
	return self;
}
