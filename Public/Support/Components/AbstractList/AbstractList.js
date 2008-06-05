function _ComponentAbstractList( id ) {
	var self = new Component(id);
	
	self._multiple = false;
	self.items = function() {
		return new Array();
	};
	self.setMultiple = function( type ) {
		if( self._multiple != type ) {
			self._multiple = type;
			self.resetSelected();
		}
	};
	self.mulitpleSelection = function() {
		return self._multiple;
	};
	self.itemsEach = function( deliver ) {
		var list = self.items();
		for( i = 0; i < list.length; i++ ) {
			deliver( i, list[i] );
		}
	};
	self.itemsByValue = function( value ) {
		var a = new Array();
		self.itemsEach(function( index, item ){
			if( self.itemValue(item) == value ) {
				a.push(item);
			}
		});
		return a;
	};
	self.selectItemsByValue = function( value ) {
		if( value ) {
			var items = self.itemsByValue(value);
			for( i = 0; i < items.length; i++ ) {
				self._selectItem( items[i] );
			}
			self.action('change');
		}
	}
	self.resetSelected = function() {
		self._active = false;
		self.setState('selected.count', 0);
		self.setState('selected.list', new Array());
		self.setState('selected.indices', new Array());
		self.itemsEach(function( index, item ) {
			self.itemDeselect(item);
		});
		self._active = true;
		self.updateVisual();
	};
	self.itemIsSelected = function( item ) { return false; };
	self.itemValue = function( item ) { return ''; };
	self.itemSelect = function( item ) {};
	self.itemDeselect = function( item ) {};
	self.formValue = function() {
		var output = '';
		var aoutput = new Array();
		self.itemsEach(function(index, item){
			if( self.itemIsSelected(item) ) {
				aoutput.push(item);
			}
		});
		for( i = 0; i < aoutput.length; i++ ) {
			var item = aoutput[i];
			output += encodeURIComponent(self.itemValue(item));
			if( (i + 1) < aoutput.length )
				output += ',';
		}
		return '[' + output + ']';
	};
	self._selectItem = function( item ) {
		if( self.mulitpleSelection() ) {
			if( self.itemIsSelected(item) ) {
				self.itemDeselect(item);
			} else {
				self.itemSelect(item);
			}
		} else {
			self.itemsEach( function( index, litem ){
				self.itemDeselect(litem);
				if( self.itemValue(litem) == self.itemValue(item) ) {
					self.itemSelect(litem);
				}
			});
		}
	};
	self.selectItem = function( item ) {
		self._selectItem( item );
		self.action('change');
	};
	self.updateSelected = function() {
		var count = 0;
		var list = new Array();
		var indices = new Array();
		self.itemsEach(function( index, node ){
			if( self.itemIsSelected(node) ) {
				count++;
				list.push( self.itemValue(node) );
				indices.push( index );
			}
		});
		self._active = false;
		self.setState('selected.count', count);
		self.setState('selected.list', list);
		self.setState('selected.indices', indices);
		self._active = true;
		self.updateFormValue();
		self.updateVisual();
	};
	self.registerAction('change', function( event ) {
		self.updateSelected();
	});
	return self;
}