/**
 * Based upon:
 * http://www.openjs.com/scripts/events/keyboard_shortcuts/
 * Version : 2.01.A
 * By Binny V A
 * License : BSD
 */

Hotkeys = {
	'all_shortcuts':{}, //All the shortcuts are stored in this array
	'log_keypress': function( message ) {
		if( $('hotkeydebug') ){
			$('hotkeydebug').innerHTML = $('hotkeydebug').innerHTML + '<div>' + message + '</div>';
		}
	},
	'add': function(shortcut_combination,callback,opt,held_callback) {
		//Provide a set of default options
		var default_options = {
			'type':'keydown',
			'propagate':false,
			'disable_in_input':false,
			'target':document,
			'keycode':false
		}
		if(!opt) opt = default_options;
		else {
			for(var dfo in default_options) {
				if(typeof opt[dfo] == 'undefined') opt[dfo] = default_options[dfo];
			}
		}

		var ele = opt.target
		if(typeof opt.target == 'string') ele = document.getElementById(opt.target);
		var ths = this;
		
		shortcut_combination = shortcut_combination.toLowerCase();
		shortcut_timeout = 0;
		var captured_this = this;
		
		var check_key_function = function( e, shortcut ) {
			e = e || window.event;
			
			if(opt['disable_in_input']) { //Don't enable shortcut keys in Input, Textarea fields
				var element;
				if(e.target) element=e.target;
				else if(e.srcElement) element=e.srcElement;
				if(element.nodeType==3) element=element.parentNode;

				if(element.tagName == 'INPUT' || element.tagName == 'TEXTAREA') return;
			}
	
			//Find Which key is pressed
			if (e.keyCode) code = e.keyCode;
			else if (e.which) code = e.which;
			var character = String.fromCharCode(code).toLowerCase();
			
			if(code == 188) character=","; //If the user presses , when the type is onkeydown
			if(code == 190) character="."; //If the user presses , when the type is onkeydown
	
			var keys = shortcut.split("+");
			//Key Pressed - counts the number of valid keypresses - if it is same as the number of keys, the shortcut function is invoked
			var kp = 0;
			
			//Work around for stupid Shift key bug created by using lowercase - as a result the shift+num combination was broken
			var shift_nums = {
				"`":"~",
				"1":"!",
				"2":"@",
				"3":"#",
				"4":"$",
				"5":"%",
				"6":"^",
				"7":"&",
				"8":"*",
				"9":"(",
				"0":")",
				"-":"_",
				"=":"+",
				";":":",
				"'":"\"",
				",":"<",
				".":">",
				"/":"?",
				"\\":"|"
			}
			//Special Keys - and their codes
			var special_keys = {
				'esc':27,
				'escape':27,
				'tab':9,
				'space':32,
				'return':13,
				'enter':13,
				'backspace':8,
	
				'scrolllock':145,
				'scroll_lock':145,
				'scroll':145,
				'capslock':20,
				'caps_lock':20,
				'caps':20,
				'numlock':144,
				'num_lock':144,
				'num':144,
				
				'pause':19,
				'break':19,
				
				'insert':45,
				'home':36,
				'delete':46,
				'end':35,
				
				'pageup':33,
				'page_up':33,
				'pu':33,
	
				'pagedown':34,
				'page_down':34,
				'pd':34,
	
				'left':37,
				'←':37,
				'up':38,
				'↑':38,
				'right':39,
				'→':39,
				'down':40,
				'↓':40,
	
				'f1':112,
				'f2':113,
				'f3':114,
				'f4':115,
				'f5':116,
				'f6':117,
				'f7':118,
				'f8':119,
				'f9':120,
				'f10':121,
				'f11':122,
				'f12':123
			}
	
			var modifiers = { 
				shift: { wanted:false, pressed:false},
				ctrl : { wanted:false, pressed:false},
				alt  : { wanted:false, pressed:false},
				meta : { wanted:false, pressed:false}	//Meta is Mac specific
			};
                        
			if(e.ctrlKey)	modifiers.ctrl.pressed = true;
			if(e.shiftKey)	modifiers.shift.pressed = true;
			if(e.altKey)	modifiers.alt.pressed = true;
			if(e.metaKey)   modifiers.meta.pressed = true;
                        
			for(var i=0; k=keys[i],i<keys.length; i++) {
				//Modifiers
				if(k == 'ctrl' || k == 'control') {
					kp++;
					modifiers.ctrl.wanted = true;

				} else if(k == 'shift') {
					kp++;
					modifiers.shift.wanted = true;

				} else if(k == 'alt') {
					kp++;
					modifiers.alt.wanted = true;
				} else if(k == 'meta' || k == '⌘') {
					kp++;
					modifiers.meta.wanted = true;
				} else if(k.length > 1) { //If it is a special key
					if(special_keys[k] == code) kp++;
					
				} else if(opt['keycode']) {
					if(opt['keycode'] == code) kp++;

				} else { //The special keys did not match
					if(character == k) kp++;
					else {
						if(shift_nums[character] && e.shiftKey) { //Stupid Shift key bug created by using lowercase
							character = shift_nums[character]; 
							if(character == k) kp++;
						}
					}
				}
			}

			if(kp == keys.length && 
						modifiers.ctrl.pressed == modifiers.ctrl.wanted &&
						modifiers.shift.pressed == modifiers.shift.wanted &&
						modifiers.alt.pressed == modifiers.alt.wanted &&
						modifiers.meta.pressed == modifiers.meta.wanted ) {
				return true;
			}
			return false;
		}
		//The function to be called at keypress
		var keydown_function = function(e) {
			if( check_key_function( e, shortcut_combination ) ) {
			
				if( captured_this.all_shortcuts[shortcut_combination] && captured_this.all_shortcuts[shortcut_combination]['timeout'] == 0 ) {

					captured_this.log_keypress('Calling callback for ' + shortcut_combination);
					callback(e, shortcut_combination, opt);

					if( held_callback ) {
						captured_this.log_keypress('Setting timer');
						captured_this.all_shortcuts[shortcut_combination]['timeout'] = setTimeout("Hotkeys.fireDuration('" + shortcut_combination + "');", 700);
					}
				
					if(!opt['propagate']) { //Stop the event
						//e.cancelBubble is supported by IE - this will kill the bubbling process.
						e.cancelBubble = true;
						e.returnValue = false;
	
						//e.stopPropagation works in Firefox.
						if (e.stopPropagation) {
							e.stopPropagation();
							e.preventDefault();
						}
						return false;
					}
				}
			}
		}
		var keyup_function = function( e ) {
			if( check_key_function( e, shortcut_combination ) ) {
				captured_this.log_keypress('Keyup: ' + shortcut_combination);
				captured_this.enableKeydown(shortcut_combination);
			}
		};
		
		if( this.all_shortcuts[shortcut_combination] ) {
			this.remove(shortcut_combination);
		}
		
		this.all_shortcuts[shortcut_combination] = {
			'callback': keydown_function,
			'keyup_callback': keyup_function,
			'held_callback': held_callback,
			'target': ele, 
			'event': opt['type'],
			'timeout': 0
		};

		//Attach the function with the event
		if( ele.addEventListener ) {
			ele.addEventListener(opt['type'], keydown_function, false);
			ele.addEventListener("keyup", keyup_function, false);
		}
		else if( ele.attachEvent ) {
			ele.attachEvent('on'+opt['type'], keydown_function);
			ele.attachEvent('onkeyup', keyup_function);
		} else {
			ele['on'+opt['type']] = keydown_function;
			ele['onkeyup'] = keyup_function;
		}
	},
	'enableKeydown': function( shortcut_combination ) {
		shortcut_combination = shortcut_combination.toLowerCase();
		this.log_keypress('Key release: ' + shortcut_combination);
		if( this.all_shortcuts[shortcut_combination] ) {
			clearTimeout( this.all_shortcuts[shortcut_combination]['timeout'] );
			this.all_shortcuts[shortcut_combination]['timeout'] = 0;
		}
	},
	'fireDuration':function(shortcut_combination) {
		shortcut_combination = shortcut_combination.toLowerCase();
		var binding = this.all_shortcuts[shortcut_combination];
		if( binding ) {
			this.log_keypress('Key held: ' + shortcut_combination);
			var held_callback = binding['held_callback'];
			held_callback();
			setTimeout("Hotkeys.enableKeydown('" + shortcut_combination + "');", 3000);
		} else {
			this.log_keypress("No fireDuration binding for " + shortcut_combination);
		}
	},

	//Remove the shortcut - just specify the shortcut and I will remove the binding
	'remove':function(shortcut_combination) {
		shortcut_combination = shortcut_combination.toLowerCase();
		var binding = this.all_shortcuts[shortcut_combination];
		delete(this.all_shortcuts[shortcut_combination])
		
		if(!binding)
			return;
		
		var type = binding['event'];
		var ele = binding['target'];
		var callback = binding['callback'];
		var keyup = binding['keyup_callback'];
		
		if( ele.detachEvent ) {
			ele.detachEvent('on'+type, callback);
			ele.detachEvent('onkeyup', keyup);
		} else if( ele.removeEventListener ) {
			ele.removeEventListener(type, callback, false);
			ele.removeEventListener('keyup', keyup, false);
		} else {
			ele['on'+type] = false;
			ele['onkeyup'] = false;
		}
	}
}


