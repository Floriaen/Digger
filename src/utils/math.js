Math.lerp = function(a, b, t) {
	return (1 - t) * a + t * b;
};
Math.sqrtDistance = function(x, y, a, b) {
	return (x - a) * (a - x) + (b - y) * (b - y);
};
Math.angle = function(x1, y1, x2, y2) {
	return Math.atan2(y2 - y1, x2 - x1);
};
