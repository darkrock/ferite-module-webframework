function ComponentHotkeys( id ) {
	var self = new Component(id);

	self.timeout = 0;
	self.setState('press-key-combo', "Press Key Combination");
	self.setState('advice-polite', "Press Enter ↵ to Confirm, Escape to Cancel");
	self.setState('advice-terse', "You must chose a key combination to perform an action");
	self.setState('show-window', "Alt+Space");
	self.setState('use-ctrl', false);
	self.setState('use-alt', true);
	self.setState('use-shift', true);
	self.setState('use-meta', true);
	
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
		Hotkeys.remove("Esc");
		Hotkeys.remove("Enter");
		clearTimeout(self.timeout);
		self.timeout = 0;
		$(self.identifier() + '_Dialog').fade({duration:0.5});
	}
	
	self.displayHotkeyWindow = function() {
		if( $(self.identifier() + '_Dialog').style.display == 'none' ) {
			$(self.identifier() + '_Shortcut').innerHTML = "☛";
			$(self.identifier() + '_Action').innerHTML = self.getState('press-key-combo');
			$(self.identifier() + '_Advice').innerHTML = "";
			$(self.identifier() + '_Advice').style.display = 'none';
			$(self.identifier() + '_Dialog').style.display = 'block';
			self.setState('current-action', '');
			self.setState('current-implementation', function(e){alert('cocks')});
			
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
			value += '⌘+';
		}
		return value;
	};
	
	self.registerHotkeyAction = function( keycombo, action, description, block ) {
		var real_shortcut = self.keyModifiersToString() + keycombo;
		Hotkeys.add(real_shortcut, function(e, shortcut, options) {
			$(self.identifier() + '_Advice').style.display = "none";
			self.displayHotkeyWindow();
			$(self.identifier() + '_Shortcut').innerHTML = real_shortcut;
			$(self.identifier() + '_Action').innerHTML = description;
			$(self.identifier() + '_Advice').innerHTML = "(" + self.getState('advice-polite') + ")";
			$(self.identifier() + '_Advice').appear({duration:0.5});
			self.setState('current-action', action);
			self.setState('current-implementation', block);
		} );
	}

	var previousActivate = self.activate;
	self.activate = function() {
		previousActivate();
		$(self.identifier() + '_Dialog').style.display = 'none';
		Hotkeys.add(self.getState('show-window'), function(e, shortcut) {
			self.displayHotkeyWindow();
		});
	};
	
	return self;
}