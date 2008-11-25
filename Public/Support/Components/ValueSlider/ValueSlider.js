function BasicFormatter( slider ) {
	var self = this;
	self.slider = slider;
	self.increment = function() {
		return 1;
	};
	self.format= function( value ) {
		return '' + value + ' ' + self.slider.getState('units');
	}
}
function TimeFormatter( slider ) {
	var self = this;
	self.slider = slider;
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
	self.increment = function() {
		if( self.slider.getState('units') == 'seconds' ) {
			return 1;
		} else if( self.slider.getState('units') == 'minutes' ) {
			return 60;
		} else if( self.slider.getState('units') == 'hours' ) {
			return (60*60);
		} else if( self.slider.getState('units') == 'days' ) {
			return (60*60*24);
		}
		return 1;
	};

	self.format = function( sec ) {
		var bd = self.breakdownTime(sec);
		return '' + 
			((self.slider.getState('maximum') > (60 * 60 * 24)) ? bd.days + ' days' : '') + 
			(self.increment() < (60 * 60 * 24) && (self.slider.getState('maximum') > (60 * 60)) ? ' ' + self.two(bd.hours) + ' hours' : '') + 
			(self.increment() < (60 * 60) && (self.slider.getState('maximum') > (60)) ? ' ' + self.two(bd.minutes) + ' minutes' : '') + 
			(self.increment() < 60 ? ' ' + self.two(bd.seconds) + ' seconds' : '');
	};
	return self;
}
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

	self.formatHelper = new BasicFormatter(self);
	self.setFormatHelper = function( f ) {
		self.formatHelper = f;
	};
	self.updateVisual = function() {
		self.node().innerHTML = self.formatHelper.format(self.getState('value'));
		self.node().style.cursor = 'move';
	};
	self.prototypeMouseMove = function( event ) {
		if (self.dragging) {
			var coords = self.mouseCoordinates(event);
			var diff = (coords.x - self.startPos.x);
			self.setState('value', self.getState('initial-value') + (diff * self.formatHelper.increment()) );
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
			$('' + self.identifier() + '.hiddenMovementCatch').style.display = "none";
			self.node().className = 'wfValueSliderInactive';
			self.node().style.cursor = 'move';
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
		$('' + self.identifier() + '.hiddenMovementCatch').style.display = "block";
		self.node().className = 'wfValueSliderActive';
		self.node().style.cursor = 'move';
	};
	self.disableSelection(self.node());
	self.node().className = 'wfValueSliderInactive';
	self.node().style.cursor = 'move';
	return self;
}
