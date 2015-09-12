function Map() {}
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
	caveWidth: 9,
	cave: [
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
	],

	addBlocks: function() {
		var w =  Game.terrain.size / 2;
		// addBlock
		for (var x = 0; x < Game.terrain.size; x += Map.BLOCK_SIZE) {
			for (var y = 13; y < Game.terrain.size; y += Map.BLOCK_SIZE) {
				var l = M.abs(w - x) / Game.terrain.size; // horizontal
				var ly = y / Game.terrain.size / 2; // vertical
				if (ly > l) l = ly;
				if (M.random() > 0.8 - l) {
					this.addBlock(x, y);
				}
			}
		}
	},

	addBlock: function(x, y) {
		// pick up a random one:
		var r = M.floor(M.random() * Map.blocks.length);
		var b = Map.blocks[r];
		var i = b.length, tx = 0, ty = 0, f = M.random() > 0.5; // flip
		while (i--) {
			ty = M.floor(i / Map.BLOCK_SIZE);
			tx = i - ty * Map.BLOCK_SIZE;
			if (f) tx = (Map.BLOCK_SIZE) - tx; // flip
			var v = b[i];
			if (v !== 1) {
				Game.setTile(x + tx, y + ty, v);
			}
		}
	},

	addCaves: function(x, y) {
		x -= M.floor(this.caveWidth / 2);
		var tx = 0, ty = 0, v = 0, i = this.cave.length;
		while (i--) {
			ty = M.floor(i / this.caveWidth);
			tx = i - ty * this.caveWidth;
			v = this.cave[i];
			if (v === 1)  {
				Game.setTile(x + tx, y + ty, TILES.REDWOOD);
			} else if (v === 0) {
				Game.setTile(x + tx, y + ty, 0);
			}
		}
	}
};
