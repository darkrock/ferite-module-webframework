function ComponentHotkeys( id ) {
	var self = new Component(id);

	self.timeout = 0;
	self.setState('press-key-combo', "Press Key Combination");
	self.setState('advice-polite', "Press Enter to Confirm, Escape to Cancel");
	self.setState('advice-terse', "You must chose a key combination to perform an action");
	self.setState('show-window', "Space");
	self.setState('use-ctrl', false);
	self.setState('use-alt', true);
	self.setState('use-shift', true);
	self.setState('use-meta', true);
	self.registeredBeforeWindowHandlers = new Array();
	self.registeredAfterWindowHandlers = new Array();
	self.registeredKeysMap = {};
	
	self.performHotkeyAction = function() {
		if( self.getState('current-action') ) {
			self.cancelHotkeyAction();			
			var impl = self.getState('current-implementation');
			impl(self.getState('current-action'));
		} else {
			$(self.identifier() + '_Shortcut').innerHTML = (browser == "Internet Explorer" ? "-" : "☛");
			$(self.identifier() + '_Action').innerHTML = self.getState('press-key-combo');
			$(self.identifier() + '_Advice').innerHTML = "(" + self.getState('advice-terse') + ")";
			$(self.identifier() + '_Advice').appear({duration:0.5});
		}
	}
	
	self.registerBeforeWindowHandler = function( closure ) {
		self.registeredBeforeWindowHandlers.push(closure);
	};
	self.registerAfterWindowHandler = function( closure ) {
		self.registeredAfterWindowHandlers.push(closure);
	};
	self.cancelHotkeyAction = function() {
		if( self.timeout > 0 ) {
			clearTimeout(self.timeout);
			self.timeout = 0;
		}
		Hotkeys.remove("Esc");
		Hotkeys.remove("Enter");		
		for( action in self.registeredKeysMap ) {
			var target = self.registeredKeysMap[action];
			if( target.active ) {
				Hotkeys.remove(target.keycombo);
			}
		}
		$(self.identifier() + '_Dialog').fade({duration:0.5});
		
		self.registeredAfterWindowHandlers.each(function( closure ){
			closure();
		});
	};
	
	self.displayHotkeyWindow = function( direct ) {
		if( $(self.identifier() + '_Dialog').style.display == 'none' ) {
			mcam.log('showing dialog');
			$(self.identifier() + '_Available').innerHTML = '';
			$(self.identifier() + '_Available').style.display = 'none';
			$(self.identifier() + '_Shortcut').innerHTML = (browser == "Internet Explorer" ? "-" : "☛");
			$(self.identifier() + '_Action').innerHTML = self.getState('press-key-combo');
			$(self.identifier() + '_Advice').innerHTML = "";
			$(self.identifier() + '_Advice').style.display = 'none';
			$(self.identifier() + '_Dialog').style.display = 'block';
			
			self.setState('current-action', '');
			self.setState('current-implementation', function(e){});

			self.registeredBeforeWindowHandlers.each(function( closure ){
				closure();
			});
		
			if( !direct ) {
				var keyList = new Array();
				var keys = '';
				for( action in self.registeredKeysMap ) {
					var target = self.registeredKeysMap[action];
					if( target.active ) {
						keyList.push(self.keyModifiersMakePretty(target.keycombo));
						Hotkeys.add(target.keycombo, target.closure, {}, function() { self.performHotkeyAction(); });
					}
				}
				keyList.sort();
				var i = 0;
				for( i = 0; i < keyList.length; i++ ) {
					keys += keyList[i] + ' ';
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
	};
	self.deactivateAction = function( action ) {
		var target = self.registeredKeysMap[action];
		
		if( target ) {
			var keycombo = target.keycombo;
			var real_shortcut = self.keyModifiersToString() + keycombo;
			
			if( target.active ) {
				Hotkeys.remove(real_shortcut);
				target.active = false;
			}
		}
	};
	self.activateAction = function( action ) {
		var target = self.registeredKeysMap[action];
		
		if( target ) {
			var keycombo = target.keycombo;
			var description = target.description;
			var block = target.block;
			var real_shortcut = self.keyModifiersToString() + keycombo;
			
			if( target.active ) {
				self.deactivateAction(action);
			}

			target.closure = function(e, shortcut, options) {
				$(self.identifier() + '_Advice').style.display = "none";
				self.displayHotkeyWindow(true);
				$(self.identifier() + '_Shortcut').innerHTML = self.keyModifiersMakePretty(real_shortcut);
				$(self.identifier() + '_Action').innerHTML = description;
				$(self.identifier() + '_Advice').innerHTML = "(" + self.getState('advice-polite') + ")";
				$(self.identifier() + '_Advice').appear({duration:0.5});
				self.setState('current-action', action);
				self.setState('current-implementation', block);
			};
			
			Hotkeys.add(real_shortcut, target.closure, {}, function() {
				self.performHotkeyAction();
			});
		
			target.active = true;
		}
	};
	self.registerHotkeyAction = function( keycombo, action, description, block ) {
		var modifier = {};
		
		modifier.keycombo = keycombo;
		modifier.action = action;
		modifier.description = description;
		modifier.block = block;
		modifier.active = false;
		
		self.registeredKeysMap[action] = modifier;
		self.activateAction(action);
	}

	var previousActivate = self.activate;
	self.activate = function() {
		previousActivate();
		$(self.identifier() + '_Dialog').style.display = 'none';
		Hotkeys.add(self.keyModifiersToString() + self.getState('show-window'), function(e, shortcut) {
			self.displayHotkeyWindow(false);
		});
	};
	
	return self;
}
