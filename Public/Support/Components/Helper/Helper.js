
var helperCurrent = '';

function ComponentHelper( id, target ) {
	var self = new Component(id);
	var popup = $(id + '.popup');
	var visible = false;
	
	self.highlight = null;

	var parent = self.node().parentNode;
	
	for( ; parent && parent.tagName.toLowerCase() != 'tr'; parent = parent.parentNode )
	 	;
	if( parent ) {
		self.highlight = parent;
	}
	
	self.show = function() {
		if( id != helperCurrent ) {
			if( helperCurrent ) {
				_(helperCurrent).hide();
			}
			Element.clonePosition(popup, id, {
					setWidth: false,
					setHeight: false,
					offsetLeft: self.node().offsetWidth + 10,
					offsetTop: 0 - self.node().offsetHeight 
				});
			Element.show(popup);

			if( self.highlight )
				self.highlight.style.backgroundColor = '#e1ffe4';
			if( $(target) ) {
				try {
					$(target).focus();
				} catch( e ) {
				}
			}

			helperCurrent = id;
			visible = true;
		}
	};
	
	self.hide = function() {
		helperCurrent = '';
		if( self.highlight )
			self.highlight.style.backgroundColor = '#FFF';
		if( $(target) )
			$(target).blur();
		Element.hide(popup);
		visible = false;
	};

	self.setHighlight = function( node ) {
		self.highlight = node;
	};

	self.registerAction('click', function(event) {
		if( visible ) {
			self.hide();
		} else {
			self.show();
		}
	});
	
	if( $(target) ) {
		$(target).onfocus = function(event) {
			self.show();
		};
		$(target).onblur = function(event) {
			self.hide();
		};
	}
	
	return self;
}
