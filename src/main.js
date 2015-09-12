// requestAnimationFrame
(function() {
	var lastTime = 0;
	var vendors = ['webkit', 'moz'];
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame =
			window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
	}
	//window.requestAnimationFrame = null;
	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = function(callback) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() {
					callback(currTime + timeToCall);
				},
				timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}
	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}
}());

// setup the listeners:
document.onkeyup = function(e) {
	Input.onKey(0, e);
};

document.onkeydown = function(e) {
	Input.onKey(1, e);
};

document.onkeypress = function(e) {
	//Input.onKey(1, e);
};

var start = 0;

// STATS
var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms, 2: mb
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '120px';
document.body.appendChild(stats.domElement);

function update(dt) {
	stats.begin();

	var p = (dt - start) / 1000;
	start = dt;
	Game.update(p);
	Game.render();
	window.requestAnimationFrame(update);

	stats.end();
}

M = Math;
window.onload = function() {
	Game.canvas = document.getElementById('game');

	Game.ctx = Game.canvas.getContext("2d");
	Game.ctx["imageSmoothingEnabled"] = false;
	Game.ctx["mozImageSmoothingEnabled"] = false;
	Game.ctx['oImageSmoothingEnabled'] = false;
	Game.ctx['msImageSmoothingEnabled'] = false;


	Game.width = Game.canvas.width;
	Game.height = Game.canvas.height;

	Camera.setDimension(Game.canvas.width, Game.canvas.height);

	Game.load(function() {
		window.requestAnimationFrame(update);
	});
};
