
window.onload = function() {
	var canvas = document.getElementById("canvas"),
		context = canvas.getContext("2d"),
		width = canvas.width = window.innerWidth,
		height = canvas.height = window.innerHeight;

	var points = [],
		connections = [],
		gravity = 0.2
		friction = 0.998,
		bounce = 0.99;
		paused = false;
		deleted = false;
		connIters = 5;
		doFloor = true;
		counter = 0;
		lastId = 0;
		lastConnId = 0;
		showMenu = false;
		showHelp = false;
		snapToGrid = true;
		lastCalledTime = performance.now();
		fps = 0;
		desiredFPS = 30;
		millisecondsPerFrame = 1000 / desiredFPS;

	function requestAnimFrame() {

  		while ((performance.now() - lastCalledTime) < millisecondsPerFrame) {}

  		delta = (performance.now() - lastCalledTime)/1000;
  		lastCalledTime = performance.now();
  		fps = 1/delta;
	} 	

	cutConnection = function (x1, y1, x2, y2) {
    	for (var i = 0; i < connections.length; i ++) {
    		var c = connections[i];
    		if (intersects(c.p1.x, c.p1.y, c.p2.x, c.p2.y, x1, y1, x2, y2)) {
    			connections[i].deleted = true;
    		}
    	}
	}
	function calculateVelocity (point) {
		return {
			x: (point.x - point.oldx) * friction,
			y: (point.y - point.oldy) * friction
		}

	}
	clear = function () {
		deleted = false;
		points = [];
		connections = [];
	}
	getPoint = function (index) {
		return points[index];
	}
	getLastId = function (amount) {
		if (amount == -1) {
			return lastId;
		}
		else {
			lastId = amount;
		}	
	}
	getLastConnId = function (amount) {
		if (amount == -1) {
			return lastConnId;
		}
		else {
			lastConnId = amount;
		}
	}
	changeGravity = function (amount) {
		gravity += amount;
	}
	changeBounce = function (amount) {
		bounce += amount;
	}
	changeFriction = function (amount) {
		if (amount > 0 && friction < 1.01) {
			friction += amount;
		}
		else if (amount < 0) {
			friction += amount;
		}
	}
	changeConnIters = function (amount) {
		connIters += amount;
		connIters = Math.max(connIters, 1);
	}
	getPointsArray = function () {
		return points;
	}
	getConnectionsArray = function () {
		return connections;
	}
	setPoints = function (thing) {
		points = thing;
	}
	setConnections = function (thing) {
		connections = thing;
	}

	update();

	function update() {

		counter++;

		requestAnimFrame();

		if (deleted) {
			clear();
		}

		if (!paused) {
			updatePoints();
			collidePoints();
			for (var i = 0; i < connIters; i ++) {
				updateConnections();
			}
			collideLines();
		}

		updateUI();

		context.clearRect(0, 0, width, height);
		renderGrid(20);
		renderPoints();
		renderLines();
		renderUI();


		requestAnimationFrame(update);
	}

	function updatePoints () {
		for (var i = 0; i < points.length; i ++) {
			var p = points[i];

			if (p.anchor) {
				p.mass = 1000;
			}

			if (!p.anchor && !p.deleted) {

				v = calculateVelocity(p);
				v.y += gravity;

				p.oldx = p.x;
				p.oldy = p.y;

				p.x += v.x;
				p.y += v.y;

			}
		}
	}

	function collidePoints () {

		for (var i = 0; i < points.length; i ++) {
			var p = points[i];

			if (!p.anchor && !p.deleted) {

				v = calculateVelocity(p);

				if (doFloor) {
					if(p.x > width) {
						p.x = width;
						p.oldx = p.x + v.x * bounce;
					}
					else if(p.x < 0) {
						p.x = 0;
						p.oldx = p.x + v.x * bounce;
					}
					if(p.y > height) {
						p.y = height;
						p.oldy = p.y + v.y * bounce;
					}
					else if(p.y < 0) {
						p.y = 0;
						p.oldy = p.y + v.y * bounce;
					}
				}
			}
		}
	}

	function updateConnections () {
		for (var i = 0; i < connections.length; i ++) {
			var c = connections[i];

			if (c.p1.deleted || c.p2.deleted) {
				connections[i].deleted = true;
				c.deleted = true;
			}

			if (c.p1.anchor && c.p2.anchor) {
				c.immovable = true;
			}
			else {
				c.immovable = false;
			}

			if (!c.deleted){
				var	dx = c.p2.x - c.p1.x;
					dy = c.p2.y - c.p1.y;
					distance = Math.sqrt(dx * dx + dy * dy);
					difference = c.length - distance,
					percent = difference / distance / 2,
					sumMass = c.p1.mass + c.p2.mass;
					offsetX1 = dx * percent * c.p2.mass / sumMass,
					offsetY1 = dy * percent * c.p2.mass / sumMass,
					offsetX2 = dx * percent * c.p1.mass / sumMass,
					offsetY2 = dy * percent * c.p1.mass / sumMass;

				if (!c.p1.anchor) {
					c.p1.x -= offsetX1;
					c.p1.y -= offsetY1;
				}
				if (!c.p2.anchor) {
					c.p2.x += offsetX2;
					c.p2.y += offsetY2;
				}
			}
		}
	}
	function collideLines () {

		for (var i = 0; i < connections.length; i ++) {
			var c = connections[i];
			if (!c.deleted && !c.immovable) {
				for (var j = 0; j < connections.length; j ++) {
					var g = connections[j];
					if (g.immovable && connectionsIntersect(c, g)) {
						var lineC = getLine(c.p1.x, c.p1.y, c.p2.x, c.p2.y);
							lineG = getLine(g.p1.x, g.p1.y, g.p2.x, g.p2.y);
							intersection = intersectionGivenEquations(lineC.slope, lineC.b, lineG.slope, lineG.b);
							surface1 = getClosestPointOnALine(lineG.slope, lineG.b, c.p1.x, c.p1.y);
							distToSurface1 = getDist(c.p1.x, c.p1.y, surface1.x, surface1.y);
							surface2 = getClosestPointOnALine(lineG.slope, lineG.b, c.p2.x, c.p2.y);
							distToSurface2 = getDist(c.p2.x, c.p2.y, surface2.x, surface2.y);

						if (distToSurface1 <= distToSurface2) {
							c.p1.x = surface1.x;
							c.p1.y = surface1.y;
						}
						else {
							c.p2.x = surface2.x;
							c.p2.y = surface2.y;
						}
					}
				}
			}
		}
	}
	function renderPoints () {
		for(var i = 0; i < points.length; i++) {
			var p = points[i];

			if (!p.deleted){
				context.beginPath();
	  			context.arc(p.x, p.y, 4, 0, 2 * Math.PI, false);
	  			if (p.anchor) {
	    			context.fillStyle = 'black';
	    		}
	    		else {
	    			context.fillStyle = 'gray';
	    		}
	    		context.fill()
    		}
		}
	}
	function renderLines () {
		context.beginPath();
		for(var i = 0; i < connections.length; i++) {
			var c = connections[i];

			if (!c.deleted) {
				context.moveTo(c.p1.x, c.p1.y);
				context.lineTo(c.p2.x, c.p2.y);
			}
		}
		context.strokeStyle = 'rgb(50,50,50, 0.9)';
		context.stroke();
	}
	function renderUI () {
		var mouse = getMouse();

		context.beginPath();
	  	context.arc(mouse.x, mouse.y, 5, 0, 2 * Math.PI, false);
	   	context.fillStyle = 'rgb(80, 80, 80, 0.1)';
	   	context.fill()

		if (selectedPoint != null) {
			if (!selectedPoint.deleted) {
				context.beginPath();
	  			context.arc(selectedPoint.x, selectedPoint.y, 5, 0, 2 * Math.PI, false);
	   			context.fillStyle = 'rgb(255, 25, 25, 0.8)';
	   			context.fill()
	   		}
   		}

   		if (showHelp) {
   			context.beginPath();
   			context.textAlign = "center";
   			context.fillStyle = "rgb(0, 0, 0, 1)";

   			context.font = "lighter 30px VGA";
   			context.fillText("Mouse Controls", width/2, 100);
   			context.font = "lighter 25px VGA";
   			context.fillText("Click A Point To Select It", width/2, 140);
   			context.fillText("Click Somewhere Else To Deselect it", width/2, 170);

   			context.fillText("Click And Drag A Point To Move It", width/2, 200);

   			context.fillText("Click And Drag From A Point To Another One While Holding Shift To Connect Them", width/2, 230);

   			context.fillText("Drag Your Mouse Through A Connection While Holding ALT To Cut It", width/2, 260);

   			context.font = "lighter 30px VGA";

   			context.fillText("KeyBoard Controls", width/2, 300);

   			context.font = "lighter 25px VGA";

   			context.fillText("Press Spacebar To Make A New Point", width/2, 340);

   			context.fillText("Press Delete Without Selecting A Point To Delete Everything", width/2, 370);
   			context.fillText("Press Delete When A Point Is Selected To Delete It", width/2, 400);

   			context.fillText("Press I Without Selecting A Point To Toggle If Points Placed Are Immovable", width/2, 430);
   			context.fillText("Press I When A Point Is Selected To Change It From Immovable To Movable And Vice Versa", width/2, 460);

   			context.fillText("Press G To Toggle Snap To Grid", width/2, 490);

   			context.fillText("Press H To Show Help", width/2, 520);

   			context.fillText("Press M To See Extra Information", width/2, 550);

   			context.fillText("Press P To Pause", width/2, 580);

   			context.fillText("Press F To Toggle The Walls", width/2, 610);   			

   			context.fillText("Press Buttons From 1 To 9 To Load Premade Scenarios", width/2, 640);

   			context.fillText("Press Buttons From 1 To 9 And Hold S To Save Your Current Gamestate", width/2, 670);

   			context.fillText("Press Buttons From 1 To 9 And Hold L To Load Saved Gamestates", width/2, 700);

   			context.fillText("Press - And Shift Or + And Shift To Change The Mass Of Points You Place", width/2, 730);

   			context.fillText("Press - And Shift Or + And Shift To Change The Scale Of Pre-Loaded Scenarios", width/2, 760);

   			context.fillText("Press UP And DOWN Arrow Keys To Change The Strength Of Gravity", width/2, 790);

   			context.fillText("Press UP And DOWN Arrow Keys And Hold Shift To Change The Bouncyness", width/2, 820);

   			context.fillText("Press LEFT And RIGHT Arrow Keys To Change The Force Of Friction", width/2, 850);

   			context.fillText("Press LEFT And RIGHT Arrow Keys And Hold Shift To Change The Number Of Iterations Per Frame", width/2, 880);

   		}
   		else if (showMenu) {
   			context.beginPath();
   			var y = 20;
   			context.textAlign = "left";
   			context.fillStyle = "rgb(0, 0, 0, 1)";
   			context.font = "lighter 20px VGA";
			context.fillText("gravity: " + gravity, 10, y);
			y += 20;
			context.fillText("friction: " + friction, 10, y);
			y += 20;
			context.fillText("iterations: "+ connIters, 10, y);
			y += 20;
			context.fillText("default mass: " + getMass(), 10, y);
			y += 20;
			context.fillText("paused: " + paused, 10, y);
			y += 20;
			context.fillText("default immovable: " + defaultAnchorStatus, 10, y);
			y += 20;
			context.fillText("snap to grid: " + snapToGrid, 10, y);
			y += 20;
			context.fillText("preload scale: " + getSize(), 10, y);
			y += 20;
			context.fillText("fps: " + Math.round(fps), 10, y);

			var p = getSelected();
			if (p != null) {
				y = 20;
				context.textAlign = "right";
				context.fillText("mass: " + p.mass, width - 5, y);
				y += 20;
				context.fillText("id: " + p.id, width - 5, y);
				y += 20;
				context.fillText("velocity x: " + Math.round(calculateVelocity(p).x), width - 5, y);
				y += 20;
				context.fillText("velocity y: " + Math.round(calculateVelocity(p).y), width - 5, y);
				y += 20;
				context.fillText("pos x: " + Math.round(p.x), width - 5, y);
				y += 20;
				context.fillText("pos y: " + Math.round(p.y), width - 5, y);
				y += 20;
			}
		}
	}		
	function renderGrid (spacing) {
		context.beginPath();
		for (var i = 0; i < Math.round(width / spacing) + 1; i ++) {
			context.moveTo(i * spacing, 0);
			context.lineTo(i * spacing, height);
		}
		for (var i = 0; i < Math.round(height / spacing) + 1; i ++) {
			context.moveTo(0, i * spacing);
			context.lineTo(width, i * spacing);
		}
		context.strokeStyle = 'rgb(255,100,100, 0.3)';
		context.stroke();
	}

};


