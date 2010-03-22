var helperCurrent = '';

function HelperRegister( name, target ) {
	$(name).onclick = function() {
		HelperToggle(name);
	};
	if( target != '' ) {
		var node = $(target);
		node.onfocus = function() {
			HelperShow(name);
		};
		/* node.onblur = function() {
			HelperHide(name);
		}; */
	}
}

function HelperPopup( name ) {
	return $(name + '.popup');
}

function HelperToggle( name ) {
	var popup = HelperPopup(name);
	if( popup.style.display == 'none' ) {
		HelperShow(name);
	} else {
		HelperHide(name);
	}
}

function HelperHide( name ) {
	if( name && name == helperCurrent ) {
		helperCurrent = '';
		Element.hide(HelperPopup(name));
	}
}

function HelperShow( name ) {
	if( name != helperCurrent ) {
		var popup = HelperPopup(name);
		HelperHide(helperCurrent);
		helperCurrent = name;
		Element.clonePosition(popup, name, {
				setWidth: false,
				setHeight: false,
				offsetLeft: $(name).offsetWidth + 10
			});
		Element.show(popup);
	}
}

