// from https://github.com/hunterloftis/playfuljs-demos/blob/gh-pages/terrain/index.html
function Terrain(detail) {
	this.size = M.pow(2, detail) + 1;
	this.max = this.size - 1;
	this.map = new Float32Array(this.size * this.size);
}

Terrain.prototype.get = function(x, y) {
	if (x < 0 || x > this.max || y < 0 || y > this.max) return -1;
	return this.map[x + this.size * y];
};

Terrain.prototype.set = function(x, y, val) {
	this.map[x + this.size * y] = val;
};

Terrain.prototype.generate = function(roughness) {
	var self = this;
	self.roughness = roughness;

	this.set(0, 0, self.max);
	this.set(this.max, 0, self.max / 2);
	this.set(this.max, this.max, 0);
	this.set(0, this.max, self.max / 2);

	divide(this.max);

	function divide(size) {
		var x, y, half = size / 2;
		var scale = roughness * size;
		if (half < 1) return;

		for (y = half; y < self.max; y += size) {
			for (x = half; x < self.max; x += size) {
				square(x, y, half, M.random() * scale * 2 - scale);
			}
		}
		for (y = 0; y <= self.max; y += half) {
			for (x = (y + half) % size; x <= self.max; x += size) {
				diamond(x, y, half, M.random() * scale * 2 - scale);
			}
		}
		divide(size / 2);
	}

	function average(values) {
		var valid = values.filter(function(val) {
			return val !== -1;
		});
		var total = valid.reduce(function(sum, val) {
			return sum + val;
		}, 0);
		return total / valid.length;
	}

	function square(x, y, size, offset) {
		var ave = average([
			self.get(x - size, y - size), // upper left
			self.get(x + size, y - size), // upper right
			self.get(x + size, y + size), // lower right
			self.get(x - size, y + size) // lower left
		]);
		self.set(x, y, ave + offset);
	}

	function diamond(x, y, size, offset) {
		var ave = average([
			self.get(x, y - size), // top
			self.get(x + size, y), // right
			self.get(x, y + size), // bottom
			self.get(x - size, y) // left
		]);
		self.set(x, y, ave + offset);
	}
};

Terrain.prototype.getMap = function() {
	var self = this;
	var randomBase = 0.90;
	var trap = new Array();
	for (var y = 0; y < this.size; y++) {
		for (var x = 0; x < this.size; x++) {

			// increase the chance to have extra tile on the borders
			var m = (this.size / 2) * 0.6;
			if (x < m || x > this.size - m) {
				randomBase = 0.90 * x / m;
			}

			var val = this.get(x, y);
			val = getValue(x, y, val)
			this.set(x, y, val);
		}
	}

	// add sky:
	var map = new Float32Array(this.size * (this.size + 13));
	for (var y = 0; y < 10; y++) {
		for (var x = 0; x < this.size; x++) {
			map[x + this.size * y] = 0;
		}
	}

	// grass
	for (var y = 10; y < 11; y++) {
		for (var x = 0; x < this.size; x++) {
			map[x + this.size * y] = TILES.GRASS;
		}
	}

	// and finally underground
	for (var y = 11; y < this.size + 13; y++) {
		for (var x = 0; x < this.size; x++) {
			var val = this.get(x, y);
			map[x + this.size * y] = val;
		}
	}

	for (var y = 11; y < 21; y++) {
		for (var x = 0; x < this.size; x++) {
			if (y <= 13 || M.random() > 0.8 * y / 21) {
				if (M.random() > 0.3) {
					map[x + this.size * y] = TILES.DIRT1;
				} else {
					map[x + this.size * y] = TILES.DIRT2;
				}

			}
		}
	}

	this.map = map;

	// erode some regions:
	function getValue(x, y, val) {
		if (y === self.max || x === self.max) return 0;
		var max = (self.max * 2 * self.roughness);
		var b = M.abs(~~val) / max;

		b = ~~(10 * b) + 1; // 7 different type of tiles
		return b;
	}

	return this.map;
};
