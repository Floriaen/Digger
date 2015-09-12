// Game
var Game = {
	EXPLOSION_SIZE_1: 7,
	EXPLOSION_1: [
		0, 0, 0, 1, 0, 0, 0,
		0, 0, 1, 2, 1, 0, 0,
		0, 1, 2, 3, 2, 1, 0,
		1, 2, 3, 4, 3, 2, 1,
		0, 1, 2, 3, 2, 1, 0,
		0, 0, 1, 2, 1, 0, 0,
		0, 0, 0, 1, 0, 0, 0
	],
	EXPLOSION_SIZE: 9,
	EXPLOSION: [
		0, 0, 0, 0, 1, 0, 0, 0, 0,
		0, 0, 0, 1, 2, 1, 0, 0, 0,
		0, 0, 1, 2, 3, 2, 1, 0, 0,
		0, 1, 2, 3, 4, 3, 2, 1, 0,
		1, 2, 3, 4, 5, 4, 3, 2, 1,
		0, 1, 2, 3, 4, 3, 2, 1, 0,
		0, 0, 1, 2, 3, 2, 1, 0, 0,
		0, 0, 0, 1, 2, 1, 0, 0, 0,
		0, 0, 0, 0, 1, 0, 0, 0, 0
	],
	TILE: 32,

	ctx: null,
	world: null, //new Float32Array(6 * 32 * 6 * 32),

	es: [],
	_toRemove: false,

	width: 0,
	height: 0,
	// Map size
	worldW: 0, //6 * 32,
	worldH: 0, //6 * 32,

	checkGravityDelay: 0.2,

	terrain: null,
	gameOver: false,
	stuck: false,

	sprite: document.getElementById('sprite'),

	load: function(onLoaded) {
		this.score = 0;
		this.es = [];

		this.terrain = new Terrain(8);
		this.terrain.generate(1.5);

		var map = new Map();


		// TODO: in generate:
		this.world = this.terrain.getMap();
		this.worldW = this.terrain.size - 1;
		this.worldH = this.terrain.size;

		var tile = this.getTile(10, 10);
		this.world[tile] = 0;
		tile = this.getTile(11, 10);
		this.world[tile] = 0;
		tile = this.getTile(10, 11);
		this.world[tile] = 0;
		tile = this.getTile(11, 11);
		this.world[tile] = 0;

		this.setTile(10, 11, 1);

		map.addBlocks();

		for (var m = 10; m < this.worldW; m += 40) {
			for (var n = 20; n < this.worldH; n += 40) {
				map.addCaves(m, n);
			}
		}

		this.miner = new Miner(
			M.floor(this.worldW / 2) * Game.TILE + (Game.TILE) / 2,
			9 * Game.TILE + (Game.TILE) / 2
		);

		this.add(this.miner);

		Camera.follow = this.miner;

		this.shake = 0;

		this.dialogContainer = document.getElementById('dialog-container');
		this.dialog = document.getElementById('dialog');

		if (onLoaded) {
			onLoaded();
		}
	},

	getTheFarestTile: function(x, y, tile) {
		//console.log('getTheFarestTile', x, y, tile);
		var tx = 0,
			ty = 0,
			foundTile = null,
			tileDistance = 0;
		for (var i = 0; i < Camera.tileCount; i++) {
			tx = i % (Camera.tileCountForWidth + 2);
			if (Camera.tile.x > 0) tx += Camera.tile.x;
			ty = M.floor(i / (Camera.tileCountForWidth + 2));
			if (Camera.tile.y > 0) ty += Camera.tile.y;


			var t = this.getTile(tx, ty);
			if (t === tile) {
				var d = Math.sqrtDistance(x, y, tx, ty);
				if (d > tileDistance) {
					tileDistance = d;
					foundTile = {tile: {x: tx, y: ty}};
				}
			}
		}
		return foundTile;
	},

	getTile: function(x, y) {
		if (!this.isValidTile(x, y)) return undefined;
		return this.world[this.getIndexForTile(x, y)];
	},

	setTile: function(x, y, val) {
		if (!this.isValidTile(x, y)) return;
		this.world[this.getIndexForTile(x, y)] = val;
	},

	isTileSolid: function(x, y) {
		if (!this.isValidTile(x, y)) return true;
		var v = this.world[this.getIndexForTile(x, y)];
		var t = TILES.get(v);
		return v === TILES.GHOST || t !== undefined;
	},

	// same as isTileSolid + take in account unbreakable tiles:
	isDiggable: function(x, y) {
		if (!this.isValidTile(x, y)) return true;
		var v = this.world[this.getIndexForTile(x, y)];
		var t = TILES.get(v);
		return v === TILES.GHOST || t !== undefined && v !== TILES.CELL && v !== TILES.SPIKES;
	},

	isDiggableAndSafe: function(x, y) {
		if (!this.isValidTile(x, y)) return true;
		var v = this.world[this.getIndexForTile(x, y)];
		var t = TILES.get(v);
		if (v === TILES.BOMB1 || v === TILES.BOMB2) return false;
		return v === TILES.GHOST || t !== undefined && v !== TILES.CELL && v !== TILES.SPIKES;
	},

	isValidTile: function(x, y) {
		return (x >= 0 && y >= 0 && x < this.worldW && y < this.worldH);
	},

	getIndexForTile: function(x, y) {
		return y * this.worldW + x;
	},

	getTileForIndex: function(i) {
		var y = M.floor(i / this.worldW);
		var x = i - y * this.worldW;
		return {
			x: x,
			y: y
		};
	},

	getCoordForTile: function(x, y) {
		return {
			x: M.floor(x * Game.TILE),
			y: M.floor(y * Game.TILE),
		};
	},

	explode: function(x, y) {
		var center = M.floor(Game.EXPLOSION_SIZE / 2);

		var i = Game.EXPLOSION.length;
		var xr = 0,
			yr = 0;
		while (i--) {
			yr = M.floor(i / Game.EXPLOSION_SIZE);
			xr = i - yr * Game.EXPLOSION_SIZE;

			// some usefull informations:
			var tx = x + xr - center; // tile x
			var ty = y + yr - center; // tile y

			// this tile must disappear:
			if (Game.EXPLOSION[i] !== 0 && this.isTileSolid(tx, ty)) {
				// it hurts really hard :)
				setTimeout((function(tx, ty) {
					return function() {
						//console.log((new Date()).getTime());
						var pos = Game.getCoordForTile(tx, ty); // real coords
						var idx = Game.getIndexForTile(tx, ty);
						var tile = TILES.get(Game.world[idx]);

						if (Game.world[idx] === TILES.BOMB1 || Game.world[idx] === TILES.BOMB2) {
							Game.setTile(tx, ty, TILES.GHOST);
							Game.explode(tx, ty);
						}

						if (tile) { // GHOST tile is solid but don't have associated data
							Game.setTile(tx, ty, TILES.GHOST); // set tile as ghost tile
							var t = Game.add(new Tile(pos.x, pos.y, tile.c));
							t.shake(0.2, (function(t, tx, ty) {
								return function() {
									Game.setTile(tx, ty, 0);
									Game.remove(t);
								};
							})(t, tx, ty));
						}
					}
				})(tx, ty), (6 - Game.EXPLOSION[i]) * 40);
			}
		}

		// entities:
		i = this.es.length, e = undefined;
		var gap = 4;
		while (i--) {
			e = this.es[i];
			if (e.tile) {
				// check the eplosion bounds:
				if ((e.tile.x > x - (center - gap / 2) && e.tile.x < x + Game.EXPLOSION_SIZE - gap) &&
					(e.tile.y > y - (center - gap / 2) && e.tile.y < y + Game.EXPLOSION_SIZE - gap)) {
					Game.remove(e);
				}
			}
		}
	},

	add: function(e) {
		this.es.push(e);
		return e;
	},

	remove: function(e) {
		this._toRemove = true;
		e._toRemove = true;
		if (e === this.miner) {
			this.gameOver = true;
		}
	},

	update: function(dt) {
		Camera.update(dt);

		if ((this.shake -= dt) < 0) this.shake = 0;

		var val = 0, i = 0;
		this.checkGravityDelay = this.checkGravityDelay - dt;
		if (this.checkGravityDelay < 0) {
			this.checkGravityDelay = 0.2;

			var tileX = 0,
				tileY = 0;
			for (var it = 0; it < Camera.tileCount; it++) {

				tileX = it % (Camera.tileCountForWidth);
				if (Camera.tile.x > 0) tileX += Camera.tile.x;
				tileY = M.floor(it / (Camera.tileCountForWidth));
				if (Camera.tile.y > 0) tileY += Camera.tile.y;

				val = this.getTile(tileX, tileY);
				if (val === TILES.CELL || val === TILES.BOMB1 || val === TILES.BOMB2 || val === TILES.SPIKES || val === TILES.CRATE) {
					if (!this.isTileSolid(tileX, tileY + 1))  {
						this.setTile(tileX, tileY, 0);
						this.setTile(tileX, tileY + 1, val);
					}
				} else if (val === TILES.WALKER) {
					console.log('create walker', tileX, tileY);
					this.add(new Walker(tileX * Game.TILE, tileY * Game.TILE));
					this.setTile(tileX, tileY, 0);
				}
			}
		}

		// removed
		if (this._toRemove) {
			this._toRemove = false;
			var nes = [];
			var l = this.es.length;
			for (i = 0; i < l; i++) {
				var e = this.es[i];
				if (e._toRemove !== true) {
					nes.push(e);
				} else {
					if (e.animatedDeath) {
						nes.push(new Death(e.x, e.y - e.size));
					}
				}
			}
			this.es = nes;
		}

		i = this.es.length;
		while (i--) {
			if (Camera.onCamera(this.es[i].x, this.es[i].y)) {
				this.es[i].update(dt);
			}
		}
	},

	render: function() {
		this.ctx.fillStyle = '#202020';
		this.ctx.fillRect(0, 0, this.width, this.height);

		if (Camera.y > 10 * Game.TILE) {
			// halo
			var gradient = this.ctx.createRadialGradient(
				this.miner.x - Camera.x, this.miner.y - Camera.y, 200,
				this.miner.x - Camera.x, this.miner.y - Camera.y, 30
			);
			gradient.addColorStop(0, "#0A1419");
			gradient.addColorStop(1, "#11232c");
		} else {
			_drawSkyCanvas(this.ctx, this.width, 10 * Game.TILE - Camera.y);
		}

		if (this.shake > 0) {
			this.ctx.save();
			this.ctx.translate(M.floor((0.5 - M.random()) * 6), M.floor((0.5 - M.random()) * 3.4));
		}

		var selectionX = null;
		var selectionY = null;

		var extraTile = new Array();
		// process only visible tile:
		var i = 0,
			tileX = 0,
			tileY = 0,
			rx = 0,
			ry = 0; //  + 2 * Camera.tileHeight

		for (var it = 0; it < Camera.tileCount; it++) {

			tileX = it % (Camera.tileCountForWidth + 2);
			if (Camera.tile.x > 0) tileX += Camera.tile.x;
			tileY = M.floor(it / (Camera.tileCountForWidth + 2));
			if (Camera.tile.y > 0) tileY += Camera.tile.y;

			i = this.getIndexForTile(tileX, tileY);

			var idx = this.world[i];
			if (idx !== undefined) {
				// get back tile property
				var tile = TILES.get(idx);
				if (tile) { // if tile is defined
					rx = M.floor(tileX * Game.TILE) - Camera.x;
					ry = M.floor(tileY * Game.TILE) - Camera.y;

					if (tile.p !== undefined) {
						var p = tile.p, ty = tile.y;
						if (idx === TILES.BOMB1 || idx === TILES.BOMB2) { // draw later
							extraTile.push({
								x: rx,
								y: ry,
								tx: tileX,
								ty: tileY
							});
						}

						if (!this.isTileSolid(tileX, tileY - 1)) {
							this.ctx.drawImage(Game.sprite, p * 16, ty * 25, 16, 25, rx, ry - 18, 32, 50);
						} else {
							this.ctx.drawImage(Game.sprite, p * 16, ty * 25 + 9, 16, 16, rx, ry, 32, 32); // half
						}
					} else {
						// old way draw colored tile
						this.ctx.fillStyle = tile.c;
						this.ctx.fillRect(rx, ry, Game.TILE, Game.TILE);
						if (!this.isTileSolid(tileX, tileY - 1)) {
							this.ctx.fillStyle = colorLuminance(tile.c, -0.2);
							this.ctx.fillRect(rx, ry - 18, Game.TILE, 18);
						}

						// draw grid
						this.ctx.beginPath();
						this.ctx.globalAlpha = 0.1;
						this.ctx.strokeStyle = "#000";
						this.ctx.rect(rx, ry, Game.TILE,  Game.TILE);
						this.ctx.stroke();
						this.ctx.globalAlpha = 1;
					}
				}
			}
			this.ctx.fillStyle = '#000'; // default
		}

		// draw front tiles
		var l = extraTile.length;
		while (l--) {
			var t = extraTile[l];
			if (!this.isTileSolid(t.tx, t.ty - 1)) {
				this.ctx.drawImage(Game.sprite, 0, 25, 48, 25, t.x - Game.TILE, t.y - 18, 96, 50);
			} else {
				this.ctx.drawImage(Game.sprite, 0, 34, 48, 16, t.x - Game.TILE, t.y, 96, 32); // half
			}
			// TODO: does it work?
			if (!this.isTileSolid(tileX, tileY + 1)) {
				this.ctx.globalCompositeOperation = 'overlay';
				this.ctx.fillStyle = 'rgb(0, 0, 0, 0.3)';
				this.ctx.fillRect(rx, ry + Game.TILE - 1, Game.TILE, 1);
				this.ctx.globalCompositeOperation = 'source-over';
			}
		}

		// entities:
		i = this.es.length;
		while (i--) {
			if (Camera.onCamera(this.es[i].x, this.es[i].y)) {
				this.es[i].render(this.ctx);
			}
		}

		if (this.gameOver) {
			this.dialogContainer.style.display = 'block';
			this.dialog.innerHTML = (this.stuck ? 'STUCK': 'GAME OVER');
			if (Input.keys.space) {
				this.load();
				this.dialogContainer.style.display = 'none';
				this.gameOver = false;
				this.stuck = false;
			}
		}

		// score:
		this.ctx.beginPath();
		this.ctx.arc(18, 22, 6, 0, 2 * Math.PI, true);
		this.ctx.fillStyle = "yellow";
		this.ctx.fill();

		this.ctx.font = "24px Arial, sans-serif";
        this.ctx.fillStyle = "white";
        this.ctx.fillText(this.score, 32, 30);

		this.ctx.restore();
	}
};

function _drawSkyCanvas(ctx, width, horizonY) {
	ctx.save();

	//Draw sky
	ctx.fillStyle = '#FF8601';
	ctx.beginPath();
	ctx.rect(0, 0, width, horizonY);
	ctx.fill();
	ctx.clip();

	//Draw sun
	ctx.fillStyle = '#FFE7CA';
	var sunRadius = width / 4;
	ctx.beginPath();
	ctx.arc(width / 2, horizonY - (sunRadius + 24) + Camera.y * 0.4, sunRadius, 0, M.PI, true);
	ctx.fill();
	ctx.restore();

	//Draw Mountains
	ctx.beginPath();
	ctx.fillStyle = '#202020';

	var mountainMaxHeight = 40;
	var points = [
		0, 0.7,
		0.1, 0.3,
		0.2, 1,
		0.3, 0.5,
		0.35, 0.8,
		0.42, 0.5,
		0.55, 0.9,
		0.7, 0.45,
		0.8, 1.1,
		0.88, 0.4,
		1, 0.8
	];
	var mountainX = 0;
	for (var i = 0; i < points.length; i += 2) {
		var x = points[i] * width;
		var y = (Camera.y * 0.2 - 78) + horizonY - (mountainMaxHeight * points[i + 1]);
		if (i === 0) {
			ctx.moveTo(x, y);
		} else {
			ctx.lineTo(x, y);
		}
	}
	ctx.lineTo(width, horizonY);
	ctx.lineTo(0, horizonY);
	ctx.fill();
	ctx.restore();

	ctx.save();
}
