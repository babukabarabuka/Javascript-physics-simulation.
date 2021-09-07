	function calculateVelocity (point) {
		return {
			x: (point.x - point.oldx) * friction,
			y: (point.y - point.oldy) * friction
		}

	}

	constrain = function (num) {
		if (num == 0) {
			return 0.001;
		}
		else if (num == Infinity) {
			return 2_100_000;
		}
		else {
			return num;
		}
	}

	getDist = function (x1, y1, x2, y2) {
		var dX = x1 - x2;
		var dY = y1 - y2;
		return Math.sqrt(dX * dX + dY * dY);
	}

	getSlope = function (x1, y1, x2, y2) {
		var m = (y1 - y2) / (x1 - x2);
		m = constrain(m);
		return m;
	}
	getB = function (x1, y1, x2, y2) {
		var slope = getSlope(x1, y1, x2, y2);
		slope = constrain(slope);
		var b = - slope * x1 + y1;
		return b;
	}

	getLine = function (x1, y1, x2, y2) {
		var m = (y1 - y2) / (x1 - x2);
		m = constrain(m);
		var b = -m * x1 + y1;

		return {
			slope:m,
			b:b
		};
	} 

	intersects = function (a,b,c,d,p,q,r,s) {
  		var det, gamma, lambda;
  		det = (c - a) * (s - q) - (r - p) * (d - b);
  		if (det === 0) {
    	return false;
  		} else {
    	lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    	gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    	return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  		}
	}
	connectionsIntersect = function (c1, c2) {
		var a = c1.p1.x,
			b = c1.p1.y,
			c = c1.p2.x,
			d = c1.p2.y,
			p = c2.p1.x,
			q = c2.p1.y,
			r = c2.p2.x,
			s = c2.p2.y,
  			det,
  			gamma, 
  			lambda;
  		det = (c - a) * (s - q) - (r - p) * (d - b);
  		if (det === 0) {
    	return false;
  		} else {
    	lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    	gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    	return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  		}
	}

	intersectionGivenEquations = function (slope1, b1, slope2, b2) {
		slope1 = constrain(slope1);
		slope2 = constrain(slope2);

		var xAns = (b2 - b1) / (slope1 - slope2);
		var yAns = slope1 * xAns + b1;

		return {
		x:xAns,
		y:yAns
		};

	}
	getClosestPointOnALine = function (slope, b, pointX, pointY) {
		slope = constrain(slope);

		console.log(slope);

		var slope2 = -1 / slope;

		slope2 = constrain(slope2);

		var b2 = pointY - slope2 * pointX;

		return intersectionGivenEquations(slope, b, slope2, b2);

	}
	getClosestPoint = function (mX, mY) {
		var minDist = Infinity;
		var point;
		var points = getPointsArray();
		for (var i = 0; i < points.length; i ++) {
			var p = points[i];
			var tempDist = getDist(p.x, p.y, mX, mY);
			if (tempDist < minDist) {
				minDist = tempDist;
				point = points[i];
			}
		}
		if (minDist > 10)
			return null;
		return point;
	}

	addPoint = function (pointX, pointY, pointMass, pointAnchor) {
		lastId++;
		getPointsArray().push({
		x: pointX,
		y: pointY,
		oldx: pointX,
		oldy: pointY,
		mass: pointMass,
		anchor: pointAnchor,
		deleted: false,
		id:lastId
		});
	}

	addConnection = function (point1, point2, connectionLength, connectionType, extraInfo) {
		lastConnId++;
		if (connectionLength > 0) {
			getConnectionsArray().push({
			p1: point1,
			p2: point2,
			length: connectionLength,
			type: connectionType,
			info: extraInfo,
			deleted: false,
			immovable:false,
			id:lastConnId
			});
		}
		else {
			getConnectionsArray().push({
			p1: point1,
			p2: point2,
			length: getDist(point1.x, point1.y, point2.x, point2.y),
			type: connectionType,
			info: extraInfo,
			deleted: false,
			immovable:false,
			id:lastConnId
			});
		}
	}
