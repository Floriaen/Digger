var Input = {

	keyMap: {
		37: "left", // left arrow
		65: "left", // a
		81: "left", // q
		38: "up", // up arrow
		90: "up", // z
		87: "up", // w
		83: "down", // s
		40: "down", // down arrow
		39: "right", // right arrow
		68: "right", // d
		32: "space",
		27: "esc",
		13: "enter"
	},

	keys: {},

	onKey: function(d, e) {
		if (!e) e = window.e;
		var c = e.keyCode;
		if (e.charCode && c === 0) c = e.charCode;

		var key = this.keyMap[c];
		if (key) {
			this.keys[key] = d;
		}
	}
};
