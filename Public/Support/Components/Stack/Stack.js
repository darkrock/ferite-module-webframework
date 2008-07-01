function ComponentStackGroupItem( id, label ) {
	var self = this;
	self.id = id;
	self.label = label;
	self.render = function() {
		return '<div class="wfStackGroupItem" id="' + self.id + '">' + self.label + '</div>';
	};
	return self;
}

function ComponentStackGroup( id, label ) {
	var self = this;
	self.id = id;
	self.label = label;
	self.items = new Array();
	self.registerItem = function( id, label ) {
		self.items.push(new ComponentStackGroupItem(id,label));
	};
	self.render = function() {
		var r = '<div class="wfStackGroup" id="' + self.id + '">' + self.label + '</div>';
		var i = 0;
		for( i = 0; i < self.items.length; i++ ) {
			r += self.items[i].render();
		}
		return r;
	};
	return self;
}

function ComponentStack( id ) {
	var self = new Component(id);
	
	self.groupList = new Array();
	self.registerGroup = function( id, label ) {
		var group = new ComponentStackGroup(id, label);
		self.groupList.push(group);
		return group;
	};
	self.registerItem = function( group, id, label ) {
		group.registerItem( id, label );
	};
	self.updateVisual = function() {
		var i = 0, r = '';
		for( i = 0; i < self.groupList.length; i++ ) {
			r += self.groupList[i].render();
		}
		self.node().innerHTML = r;
	};
	return self;
}