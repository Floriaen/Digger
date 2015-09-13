function Map() {
	this.w = 0;
	this.h = 0;
	this.tiles = null;

	this.init();
	this.addBlocks();

	for (var m = 10; m < this.w; m += 40) {
		for (var n = 20; n < this.h; n += 40) {
			this.addCaves(m, n);
		}
	}
}
Map.TILE = 32;
Map.CAVE_WIDTH = 9;
Map.CAVE =  [
	2, 1, 2, 2, 2, 2, 2, 1, 2,
	1, 1, 1, 1, 1, 1, 1, 1, 1,
	2, 1, 0, 0, 0, 0, 0, 1, 2,
	2, 1, 0, 0, 0, 0, 0, 1, 2,
	2, 1, 0, 0, 0, 0, 0, 1, 2,
	2, 1, 0, 0, 0, 0, 0, 1, 2,
	2, 1, 0, 0, 0, 0, 0, 1, 2,
	2, 1, 0, 0, 0, 0, 0, 1, 2,
	2, 1, 0, 0, 0, 0, 0, 1, 2,
	1, 1, 1, 1, 1, 1, 1, 1, 1,
	2, 1, 2, 2, 2, 2, 2, 1, 2,
];
Map.BLOCK_SIZE = 4;
Map.blocks = [
	[
		1, 1, 1, 1,
		1, 0, 1, 1,
		27, 0, 27, 1,
		1, 33, 1, 1
	],
	[
		1, 1, 0, 0,
		1, 0, 0, 1,
		0, 0, 22, 1,
		1, 25, 27, 1
	],
	[
		1, 1, 0, 0,
		1, 0, 0, 25,
		0, 0, 25, 1,
		1, 25, 1, 1
	],
	[
		27, 22, 1, 1,
		1, 1, 1, 1,
		1, 0, 1, 1,
		1, 25, 1, 1
	],
	[
		27, 0, 1, 1,
		1, 0, 1, 1,
		1, 0, 1, 1,
		1, 25, 1, 1
	],
	[
		1, 1, 1, 1,
		1, 0, 0, 1,
		27, 35, 35, 27,
		1, 1, 1, 1
	],
	[
		1, 1, 1, 1,
		1, 34, 27, 1,
		1, 1, 1, 1,
		1, 1, 1, 1
	],
	[
		1, 1, 1, 1,
		1, 1, 0, 1,
		1, 22, 27, 1,
		1, 1, 1, 1
	],
	[
		1, 1, 1, 1,
		1, 1, 1, 1,
		1, 34, 27, 1,
		1, 1, 33, 22
	],
	[
		1, 1, 1, 1,
		1, 0, 0, 1,
		27, 22, 22, 27,
		1, 25, 1, 1
	]
];
Map.prototype = {

	init: function() {
		// build a terrain:
		var t = new Terrain(8);
		t.generate(1.5);

		// erode it
		for (var y = 0; y < t.size; y++) {
			for (var x = 0; x < t.size; x++) {
				var val = t.get(x, y);
				val = getValue(x, y, val)
				t.set(x, y, val);
			}
		}

		this.w = t.size;
		this.h = t.size - 1;
		// add sky:
		this.tiles = new Float32Array(this.w * this.h);
		for (var y = 0; y < 10; y++) {
			for (var x = 0; x < t.size; x++) {
				this.tiles[x + t.size * y] = 0;
			}
		}

		// grass
		for (var y = 10; y < 11; y++) {
			for (var x = 0; x < t.size; x++) {
				this.tiles[x + t.size * y] = TILES.GRASS;
			}
		}

		// and finally underground
		for (var y = 11; y < this.h; y++) {
			for (var x = 0; x < t.size; x++) {
				this.tiles[x + t.size * y] = t.get(x, y);
			}
		}

		for (var y = 11; y < 21; y++) {
			for (var x = 0; x < t.size; x++) {
				if (y <= 13 || M.random() > 0.8 * y / 21) {
					if (M.random() > 0.3) {
						this.tiles[x + t.size * y] = TILES.DIRT1;
					} else {
						this.tiles[x + t.size * y] = TILES.DIRT2;
					}
				}
			}
		}

		// erode some regions:
		function getValue(x, y, val) {
			if (y === t.max || x === t.max) return 0;
			var max = (t.max * 2 * t.roughness);
			var b = M.abs(~~val) / max;

			b = ~~(10 * b) + 1; // 7 different type of tiles
			return b;
		}
	},

	addBlocks: function() {
		var w = this.w / 2;
		// addBlock
		for (var x = 0; x < this.w; x += Map.BLOCK_SIZE) {
			for (var y = 13; y < this.h; y += Map.BLOCK_SIZE) {
				var l = M.abs(w - x) / this.w; // horizontal
				var ly = y / this.h / 2; // vertical
				if (ly > l) l = ly;
				if (M.random() > 0.8 - l) {
					this.addBlock(x, y);
				}
			}
		}
	},

	addBlock: function(x, y)  {
		// pick up a random one:
		var r = ~~(M.random() * Map.blocks.length);
		var b = Map.blocks[r];
		var i = b.length,
			tx = 0,
			ty = 0,
			f = M.random() > 0.5; // flip
		while (i--) {
			ty = ~~(i / Map.BLOCK_SIZE);
			tx = i - ty * Map.BLOCK_SIZE;
			if (f) tx = (Map.BLOCK_SIZE) - tx; // flip
			var v = b[i];
			if (v !== 1) {
				this.setTile(x + tx, y + ty, v);
			}
		}
	},

	addCaves: function(x, y) {
		x -= ~~(Map.CAVE_WIDTH / 2);
		var tx = 0,
			ty = 0,
			v = 0,
			i = Map.CAVE.length;
		while (i--) {
			ty = ~~(i / Map.CAVE_WIDTH);
			tx = i - ty *  Map.CAVE_WIDTH;
			v =  Map.CAVE[i];
			if (v === 1)  {
				this.setTile(x + tx, y + ty, TILES.REDWOOD);
			} else if (v === 0) {
				this.setTile(x + tx, y + ty, 0);
			}
		}
	},

	getTile: function(x, y) {
		if (!this.isValidTile(x, y)) return undefined;
		return this.tiles[y * this.w + x];
	},

	setTile: function(x, y, val) {
		if (!this.isValidTile(x, y)) return;
		this.tiles[y * this.w + x] = val;
	},

	isTileSolid: function(x, y) {
		if (!this.isValidTile(x, y)) return true;
		var v = this.tiles[y * this.w + x];
		var t = TILES.get(v);
		return v === TILES.GHOST || t !== undefined;
	},

	// same as isTileSolid + take in account unbreakable tiles:
	isDiggable: function(x, y) {
		if (!this.isValidTile(x, y)) return true;
		var v = this.tiles[y * this.w + x];
		var t = TILES.get(v);
		return v === TILES.GHOST || t !== undefined && v !== TILES.CELL && v !== TILES.SPIKES;
	},

	isDiggableAndSafe: function(x, y) {
		if (!this.isValidTile(x, y)) return true;
		var v = this.tiles[y * this.w + x];
		var t = TILES.get(v);
		if (v === TILES.BOMB1 || v === TILES.BOMB2) return false;
		return v === TILES.GHOST || t !== undefined && v !== TILES.CELL && v !== TILES.SPIKES;
	},

	isValidTile: function(x, y) {
		return (x >= 0 && y >= 0 && x < this.w && y < this.h);
	},

	getIndexForTile: function(x, y) {
		return y * this.w + x;
	},

	getTileForIndex: function(i) {
		var y = ~~(i / this.w);
		var x = i - y * this.w;
		return {
			x: x,
			y: y
		};
	},

	getCoordForTile: function(x, y) {
		return {
			x: ~~(x * Map.TILE),
			y: ~~(y * Map.TILE),
		};
	},
};
