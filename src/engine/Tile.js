function Tile(x, y, c) {
	this.x = x;
	this.y = y;
	this.c = c;
	this.val = 0;

	this.d = {
		count: 0,
		max: 0
	};

	this.shakeDuration = 0;
	// buffer:
	this.sprite = document.createElement('canvas');
	this.sprite.width = Game.TILE;
	this.sprite.height = Game.TILE + 18;
	this.buffer = this.sprite.getContext('2d');

	this.onShakeComplete = null;
	this.bypassHardness = false;
	this.onDigComplete = undefined;
}
Tile.prototype = {
	reset: function() {
		this.d.count = 0;
		this.d.max = 0;
		this.x = 0;
		this.y = 0;
		this.val = 0;
		this.c = 0;
	},

	shake: function(d, onShakeComplete) {
		var s = this;
		this.onShakeComplete = onShakeComplete;
		this.shakeDuration = d;
	},

	update: function(dt) {
		if (this.shakeDuration > 0 && (this.shakeDuration -= dt) < 0) {
			this.shakeDuration = 0;
			if (this.onShakeComplete) {
				this.onShakeComplete();
			}
		}
	},

	dig: function(tileX, tileY, digger) {
		if (!Game.isDiggable(tileX, tileY)) {
			this.reset();
			return false;
		}
		// same tile
		if (this.x === tileX && this.y === tileY) {
			if (this.bypassHardness || this.d.count++ > this.d.max) {

				if (this.val === TILES.BOMB1 || this.val === TILES.BOMB2) {
					Game.explode(tileX, tileY);
				} else if (this.val === TILES.CRATE) {
					if (Game.miner === digger) {
						Game.score += 1;
						Game.add(new Gain(this.x * Game.TILE + Game.TILE / 2, this.y * Game.TILE + Game.TILE / 2));
					}
				}

				Game.setTile(this.x, this.y, 0);
				this.val = 0;
			}
		} else {
			this.val = Game.getTile(tileX, tileY);
			var tile = TILES.get(this.val);
			if (tile) {
				this.x = tileX;
				this.y = tileY;

				this.d.max = tile.h || 1;
				this.d.count = 1;
			} else {
				this.reset();
			}
		}
		return true;
	},

	select: function(ctx, showBorder) {
		if (Game.isDiggable(this.x, this.y)) {
			rx = M.floor(this.x * Game.TILE) - Camera.x;
			ry = M.floor(this.y * Game.TILE) - Camera.y;

			var alpha = this.d.count / this.d.max;
			ctx.fillStyle = "rgba(0, 0, 0," + alpha * 0.2 + ")";
			ctx.lineWidth = 1;
			ctx.strokeStyle = "white";

			ctx.beginPath();
			if (!Game.isTileSolid(this.x, this.y - 1)) {
				ctx.fillRect(rx, ry - 18, Game.TILE, Game.TILE + 18);
				if (showBorder) {
					ctx.rect(rx, ry - 18, Game.TILE, Game.TILE + 18);
				}
			} else {
				ctx.fillRect(rx, ry, Game.TILE, Game.TILE);
				if (showBorder) {
					ctx.rect(rx, ry, Game.TILE, Game.TILE);
				}
			}
			ctx.stroke();
		}
	},

	render: function(ctx) {
		this.buffer.clearRect(0, 0, Game.TILE, Game.TILE + 18);
		this.buffer.fillStyle = this.c;
		this.buffer.fillRect(0, 18, Game.TILE, Game.TILE);
		if (!Game.isTileSolid(M.floor(this.x / Game.TILE), M.floor(this.y / Game.TILE) - 1)) {
			this.buffer.fillStyle = colorLuminance(this.c, -0.2);
			this.buffer.fillRect(0, 0, Game.TILE, 18);
		}
		ctx.save();
		if (this.shakeDuration > 0) {
			// shake:
			ctx.translate(M.floor((0.5 - M.random()) * 6), M.floor((0.5 - M.random()) * 3));
		}
		ctx.fillStyle = 'white';
		ctx.drawImage(this.sprite, M.floor(this.x - Camera.x), M.floor(this.y - Camera.y) - 18);
		ctx.restore();
	}
}
