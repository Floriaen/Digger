/*

	color=
	'#9BA59A'
	'#7F6369'
	'#F0D070'
	'#DEE4CA'
	'#D9835F'
	'#E9E1AF'

*/

/*

// RANDOM EXPLOSION
				var pos = Game.getCoordForTile(tx, ty); // real coords
				var idx = Game.getIndexForTile(tx, ty);
				var tile = TILES.get(Game.world[idx]);

				if (Game.world[idx] === TILES.BOMB) {
					Game.setTile(tx, ty, TILES.GHOST);
					Game.explode2(tx, ty);
				}

				if (tile) { // GHOST tile is solid but don't have associated data

					Game.setTile(tx, ty, TILES.GHOST); // set tile as ghost tile
					var t = Game.add(new Tile(pos.x, pos.y, tile.c));
					t.shake(0.5 + M.random() * 0.4, (function(t, tx, ty) { // 0.5 + M.random() * 0.4
						return function() {
							Game.setTile(tx, ty, 0);
							Game.remove(t);
						};
					})(t, tx, ty));
				}
				*/



				/*

				// explode with black halo and general shake
				explode: function(x, y) {
		this.shake = 1;
		this.miner.v.y *= -1;
		this.miner.v.x *= -1;
		this.add(
			new Explosion(x * Map.TILE, y * Map.TILE, function() {

				var center = ~~(Game.EXPLOSION_WIDTH / 2);
				//var c = this.getIndexForTile(x - center, y - center);
				var i = Game.EXPLOSION.length;
				var xr = 0, yr = 0;
				while (i--) {
					yr = ~~(i / Game.EXPLOSION_WIDTH);
					xr = i - yr * Game.EXPLOSION_WIDTH;
					if (Game.EXPLOSION[i] === 1) {
						Game.setTile(x + xr - center, y + yr - center, 0);
					}
				}

			})
		);
	},
