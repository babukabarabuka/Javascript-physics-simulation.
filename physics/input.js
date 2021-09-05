	var mousePressed = false;
		rightMousePressed = false;
		draggingPoint = false;
		mX = 0;
		mY = 0;
		lastPressedX = 0;
		lastPressedY = 0;
		setMass = 20;
		defaultAnchorStatus = false;
		pressedButtons = [];
		size = 1;

		
	var	selectedPoint;

	for (var i = 0; i < 255; i ++) {
		pressedButtons.push(false);
	}

	updateUI = function () {

		if (snapToGrid) {
	  		mX = 20 * Math.round(mX/20);
	  		mY = 20 * Math.round(mY/20);
	  	}

		if (mousePressed && rightMousePressed) {
			rightMousePressed = false;
		}
		if (draggingPoint && !pressedButtons[16] && !pressedButtons[18]) {
  			selectedPoint.x = mX;
  			selectedPoint.y = mY;
  		}
  		//console.log();
	}

	make2dArray = function (length) {
		var out = new Array(length);
		for (var i = 0; i < out.length; i ++) {
			out[i] = [];
		}
		return out;
	}

	var savedPoints = make2dArray(10);
		savedConnections = make2dArray(10);

	copyArray = function (array) {
		var to = [];
		for (var i = 0; i < array.length; i ++) {
			to.push(array[i]);
		}
		return to;
	}

	getSize = function (argument) {
		return size;
	}
	getMass = function () {
		return setMass;
	}

	getSelected = function () {
		return selectedPoint;
	}
	getMouse = function () {
		return {
			x:mX,
			y:mY
		};
	}

	window.addEventListener('keydown',this.check,false);

	function check(e) {
    	pressedButtons[e.keyCode] = true;

    	var code = e.keyCode;

    	switch (code) {
        	case 8: 
				if (selectedPoint == null) {
    				deleted = true;
    			}
    			else {
    				selectedPoint.deleted = true
    			}
        		break; 
        	case 32: 
        		addPoint(mX, mY, setMass, defaultAnchorStatus);
        		break; 
        	case 70: 
        		doFloor = !doFloor;
        		break;         		
        	case 71: 
        		snapToGrid = !snapToGrid;
        		break;        		
        	case 72: 
        		showHelp = !showHelp;
        		break;
        	case 73: 
        		if (selectedPoint == null) {
        			defaultAnchorStatus = !defaultAnchorStatus;
        		}
        		else {
        			selectedPoint.anchor = !selectedPoint.anchor;
        		}
        		break;
        	case 77: 
        		showMenu = !showMenu;
        		break;
        	case 80: 
        		paused = !paused;
        		break;

        	case 49:	
        	case 50:
        	case 51:
        	case 52:
        	case 53:
        	case 54:
        	case 55:
        	case 56:
        	case 57:
        		if (!pressedButtons[83] &&  !pressedButtons[76]) {
        			clear();
					makeCloth(40 * size, 16 * size, 40 / size);
				}
				else if (pressedButtons[83]){
					console.log("saved at slot " + (code - 48));
					savedPoints[code - 49] = copyArray(getPointsArray());
					savedConnections[code - 49] = copyArray(getConnectionsArray());
				}
				else {
					console.log("loaded slot " + (code - 48));
					setPoints(savedPoints[code - 49]);
					setConnections(savedConnections[code - 49]);
				}
        		break;


        	case 189:
        		if (pressedButtons[16]) {
        			setMass --;
        		}
        		else {
        			size -= 0.25;
        		}
        		break; 
        	case 187: 
        		if (pressedButtons[16]) {
        			setMass ++;
        		}
        		else {
        			size += 0.25;
        		}
        		break;
        	case 40:
        		if (!pressedButtons[16]) {
        			changeGravity(-0.05);
        		}
        		else {
        			changeBounce(0.04);
        		}
        		break; 
        	case 38: 
        		if (!pressedButtons[16]) {
        			changeGravity(0.05);
        		}
        		else {
        			changeBounce(-0.04);
        		}
        		break;
        	case 37:
        		if (!pressedButtons[16]) {
        			changeFriction(0.01);
        		}
        		else {
        			changeConnIters(-1);
        		}
        		break; 
        	case 39:
        		if (!pressedButtons[16]) {
        			changeFriction(-0.01);
        		}
        		else {
        			changeConnIters(1);
        		}        	
        		break;       		
        	default: console.log(code); //Everything else
   		}
	}

	window.addEventListener('keyup',this.checkUp,false);

	function checkUp(e) {
    	pressedButtons[e.keyCode] = false;
	}

    window.addEventListener('mousedown', e => {

    	mX = e.offsetX;
	  	mY = e.offsetY;

	  	if (snapToGrid) {
	  		mX = 20 * Math.round(mX/20);
	  		mY = 20 * Math.round(mY/20);
	  	}

    	if (e.button == 0) {
	  		lastPressedX = e.offsetX;
	  		lastPressedY = e.offsetY;
	  		mousePressed = true;
	  		if (!pressedButtons[18]) {
		  		selectedPoint = getClosestPoint(mX, mY);
		  		if (selectedPoint != null) {
		  			draggingPoint = true;
		  		}
	  		}
  		}
  		else if (e.button == 2) {
  			rightMousePressed = true;
  		}
	});

	window.addEventListener('mousemove', e => {
		mX = e.offsetX;
  		mY = e.offsetY;

  		if (snapToGrid) {
	  		mX = 20 * Math.round(mX/20);
	  		mY = 20 * Math.round(mY/20);
	  	}

	});

	window.addEventListener('mouseup', e => {
		mX = e.offsetX;
  		mY = e.offsetY;

  		if (snapToGrid) {
	  		mX = 20 * Math.round(mX/20);
	  		mY = 20 * Math.round(mY/20);
	  	}
  		if (e.button == 0) {
    		mousePressed = false;

    		if (!draggingPoint && pressedButtons[18]) {
    			cutConnection(lastPressedX, lastPressedY, mX, mY);
    		}
    		else if (pressedButtons[16]) {
    			var p = getClosestPoint(mX, mY);
    			if (p.id != selectedPoint.id) {
    				addConnection(selectedPoint, p, -1, 'stick', null);
    			}
    		}
    		draggingPoint = false;
    	}
    	else if (e.button == 2) {
    		rightMousePressed = false;
    	}
	});










