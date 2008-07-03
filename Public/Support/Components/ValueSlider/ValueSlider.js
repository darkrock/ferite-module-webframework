function ComponentValueSlider( id ) {
	var self = new Component(id);
	
	self._defaultState = 'value';
	self.setState('units', 'seconds');
	self.setState('partial', false);
	self.setState('value', 0);
	self.setState('maximum', 60 * 60 * 24);
	self.setState('minimum', 0);
	self.dragging = false;
	self.startPos = 0;
	self.lastPos = 0;

	self.incrementValue = function() {
		if( self.getState('units') == 'seconds' ) {
			return 1;
		} else if( self.getState('units') == 'minutes' ) {
			return 60;
		} else if( self.getState('units') == 'hours' ) {
			return (60*60);
		}
		return 1;
	};
	self.two = function(x) {
		return ((x>9)?"":"0")+x;
	};
	self.breakdownTime = function( sec ) {
		var s = sec % 60;
		var m = Math.floor(sec/60);
		var h = Math.floor(m/60);
		var d = Math.floor(h/24);
		return {
			seconds: s,
			minutes: m % 60,
			hours: h % 24,
			days: d
		};
	};
	self.formatTime = function( sec ) {
		var bd = self.breakdownTime(sec);
		return '' + 
			((self.getState('maximum') > (60 * 60 * 24)) ? bd.days + ' days' : '') + 
			(self.incrementValue() < (60 * 60 * 24) && (self.getState('maximum') > (60 * 60)) ? ' ' + self.two(bd.hours) + ' hours' : '') + 
			(self.incrementValue() < (60 * 60) && (self.getState('maximum') > (60)) ? ' ' + self.two(bd.minutes) + ' minutes' : '') + 
			(self.incrementValue() < 60 ? ' ' + self.two(bd.seconds) + ' seconds' : '');
	};
	self.formatOutput = self.formatTime;
	self.updateVisual = function() {
		self.node().innerHTML = self.formatOutput(self.getState('value'));
	};
	self.prototypeMouseMove = function( event ) {
		if (self.dragging) {
			var coords = self.mouseCoordinates(event);
			var diff = (coords.x - self.startPos.x);
			self.setState('value', self.getState('initial-value') + (diff * self.incrementValue()) );
			if( self.getState('value') < self.getState('minimum') ) {
				self.setState('value', self.getState('minimum') + 1);
			}
			if( self.getState('value') > self.getState('maximum') ) {
				self.setState('value', self.getState('maximum') - 1);
			}
			self.lastPos = coords;
			self.updateFormValue();
			self.updateVisual();
		}
	};
	self.prototypeMouseUp = function(event) {
		if(self.dragging) {
			self.dragging = false;
			self.startPos = {x:0, y:0};
			self.node().className = 'wfValueSliderInactive';
		}
	};
	self.setupPage = function() {
		if (document.captureEvents && Event.MOUSEMOVE) {
	 		document.captureEvents(Event.MOUSEMOVE);
		}
		document.onmousemove = self.prototypeMouseMove;
		document.onmouseup   = self.prototypeMouseUp;
	};
	self.node().onmousedown = function(event) { 
		self.setState('initial-value', self.getState('value'));
		self.startPos = self.mouseCoordinates(event);
		self.dragging = true;
		self.setupPage();
		self.node().className = 'wfValueSliderActive';
	};
	self.disableSelection(self.node());
	self.node().style.cursor = 'move';
	return self;
}