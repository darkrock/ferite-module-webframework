function ComponentHotkeys( id ) {
	var self = new Component(id);

	self.setState('press-key-combo', "<i18n>Press Key Combination</i18n>");
	self.setState('advice-polite', "<i18n>Press Enter ↵ to Confirm, Escape to Cancel</i18n>");
	self.setState('advice-terse', "<i18n>You must chose a key combination to perform an action</i18n>");
	self.setState('show-window', "Alt+Space");
	
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
			
			setTimeout("_('" + self.identifier() + "').cancelHotkeyAction()", 30000);
		}
	}
	
	self.registerHotkeyAction = function( keycombo, action, description, block ) {
		Hotkeys.add(keycombo, function(e, shortcut, options) {
			$(self.identifier() + '_Advice').style.display = "none";
			self.displayHotkeyWindow();
			$(self.identifier() + '_Shortcut').innerHTML = keycombo;
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