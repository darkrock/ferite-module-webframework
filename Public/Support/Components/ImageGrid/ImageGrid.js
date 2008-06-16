function ComponentImageGrid( id ) {
	var self = new Component(id);
	
	self.setState('width', 500);
	self.setState('height', 500);
	self.setState('piece', 50 );
	
	self.startPos = 0;
 	self.dragOn = false;
	self.pieceCount = 0;
	self.xPosArray = new Array(36);
	self.yPosArray = new Array(36);
	self.tileArray = new Array(36);
	for (i=0; i<36; ++i) { 
		self.tileArray[i] = i 
	}
	
	self.mouseCoordinates = function( event ) {
		if (event.pageX || event.pageY) {
			return {x:event.pageX, y:event.pageY};
		}
		else if (event.clientX || event.clientY) {
			var posX = event.clientX;
			var posY = event.clientY;
			if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
				posX += document.body.scrollLeft - document.body.clientLeft;
				posY += document.body.scrollTop - document.body.clientTop;
			}
			else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
				posX += document.documentElement.scrollLeft - document.documentElement.clientLeft;
				posY += document.documentElement.scrollTop - document.documentElement.clientTop;
			}
			return {x:posX, y:posY};

		}
	}

	self.startDrag = function( event, obj ) {
		self.startPos = self.mouseCoordinates(event);
		for( i=0; i< self.pieceCount; ++i) {
			var xPos = document.getElementById(self.identifier() + '_' + i + '_div').style.left;
			var yPos = document.getElementById(self.identifier() + '_' + i + '_div').style.top;
			xPos = xPos.substring(0,xPos.length-2);
			yPos = yPos.substring(0,yPos.length-2);
			self.xPosArray[i] = xPos;
			self.yPosArray[i] = yPos;
		}
		self.dragOn = true;
	}

	self.prototypeMouseMove = function( event ) {
		if (self.dragOn) {
			event = event || window.event;

			var width = self.getState('width');
			var height = self.getState('height');
			var piece = self.getState('piece');
			var mousePos = self.mouseCoordinates(event);
			var xMove = mousePos.x - self.startPos.x
			var yMove = mousePos.y - self.startPos.y

			for( i=0; i<self.pieceCount; ++i ) {
				if (self.xPosArray[i] - 0 + xMove < ((0 - piece) * 1.5) ) // too far off the left hand edge of the page move to the right
				{
					var rightCell = (i - (i % 6)) + ((i + 5) % 6);
					self.xPosArray[i] = self.xPosArray[rightCell] - 0 + piece;
					self.tileArray[i] = self.tileArray[i] + 6;

				}
				else if (self.xPosArray[i] - 0 + xMove > (width + (piece/2)) ) // too far of the right hand edge of the page move to the left
				{
					var leftCell = (i - (i % 6)) + ((i - 5 + 6) % 6);
					self.xPosArray[i] = self.xPosArray[leftCell] - piece;
					self.tileArray[i] = self.tileArray[i] - 6;
				}
				if (self.yPosArray[i] - 0 + yMove < ((0 - piece) * 1.5)) // too far off the top edge of the page move to the bottom
				{
					var remainder = (i % 6)
					var whole = i - remainder;
					var bottomCell = ((whole/6 + 5 ) % 6) * 6 + remainder;
					self.yPosArray[i] = self.yPosArray[bottomCell] - 0 + piece;
					self.tileArray[i] = self.tileArray[i] + 36;
				}
				else if (self.yPosArray[i] - 0 + yMove > (height + (piece/2))) // too far of the bottom edge of the pafe move to the top
				{
					var remainder = (i % 6)
					var whole = i - remainder;
					var topCell = ((whole/6 - 5 + 6) % 6) * 6 + remainder;
					self.yPosArray[i] = self.yPosArray[topCell] - piece;
					self.tileArray[i] = self.tileArray[i] - 36;
				}
				document.getElementById(self.identifier() + '_' + i + '_div').style.left = (self.xPosArray[i] - 0 + xMove) + 'px';
				document.getElementById(self.identifier() + '_' + i + '_div').style.top = (self.yPosArray[i] - 0 + yMove) + 'px';
			}
		}
	}

	self.prototypeMouseUp = function(event) {
		if(self.dragOn) {
			self.dragOn = false;
			self.startPos = {x:0, y:0};
		}
	}
	self.createGrid = function( container ) {
		var width = self.getState('width');
		var height = self.getState('height');
		var piece = self.getState('piece');
		var count = 0;
				
		for (var i = (0 - piece); i <= height; i = i + piece) {
			for (var j = (0 - piece); j <= width; j = j + piece)
			{
				newDiv = document.createElement('div');
				newDiv.id = self.identifier() + '_' + count + '_div';
				newDiv.width = piece;
				newDiv.height = piece;
				newDiv.style.border = '1px solid #555555';
				newDiv.style.backgroundColor = '#CCC';
				newDiv.style.position = 'absolute';
				newDiv.style.top = i + 'px';
				newDiv.style.left = j + 'px';
				newDiv.style.width = '' + piece + 'px';
				newDiv.style.height = '' + piece + 'px';
				newDiv.style.textAlign = 'center';
				self.disableSelection(newDiv);
				newDiv.style.cursor = 'move';
				newDiv.onmousedown = function(event) { self.startDrag(event, this) };
				newDiv.appendChild(document.createTextNode(count));
				container.appendChild(newDiv);
				++count;
			}
		}
		return count;
	}
	self.setupPage = function() {
		if (document.captureEvents && Event.MOUSEMOVE) {
	 		document.captureEvents(Event.MOUSEMOVE);
		}
		document.onmousemove = self.prototypeMouseMove;
		document.onmouseup   = self.prototypeMouseUp;
	}
	self.pieceCount = self.createGrid( self.node() );
	self.setupPage();
	return self;
}