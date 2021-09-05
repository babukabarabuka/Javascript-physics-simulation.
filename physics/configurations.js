makeCloth = function (horizontal, vertical, spacing) {
for (var i = 0; i < horizontal; i ++) {
	var x = spacing + i * spacing;
	if (i % 2 == 0) {
		addPoint(x, spacing/2, 20, true);
	}
}

for (var i = 0; i < horizontal; i ++) {
	var x = spacing + i * spacing;
	for (var j = 1; j < vertical; j ++) {
		var y = spacing/2 + j * spacing;
		addPoint(x, y, 20, false);
	}
}
for (var i = horizontal/2; i < horizontal * (vertical - 1) + horizontal/2; i ++) {

	if ( !( (i - (horizontal/2) + 1) % (vertical - 1) == 0 ) && !(i > horizontal/2 + horizontal * (vertical - 1) - vertical ) ) {
		var p = getPoint(i);
		addConnection(p, getPoint(i + 1), -1, 'stick, null');
		addConnection(p, getPoint(i + vertical - 1), -1, 'stick, null');
	}
	else {
		var p = getPoint(i);
		p.deleted = true;
	}

}
for (var i = 0; i < horizontal/2; i ++) {
	var p = getPoint(i);
	addConnection(p, getPoint(horizontal/2 + i * (2 * vertical - 1 * 2)), -1, 'stick, null');
}


}