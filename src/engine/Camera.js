var Camera = {

	x: 0,
	y: 0,
	w: 0,
	h: 0,
	_follow: null,

	tile: {
		x: 0,
		y: 0
	},

	setDimension: function(width, height) {
		this.w = width;
		this.h = height;
		this.tileHeight = this.h / Game.TILE;
		this.tileCount = M.floor(this.w * this.h / Game.TILE);
		this.tileCountForWidth = M.floor(this.w / Game.TILE);
	},

	set follow(e) {
		this._follow = e;
		this.x = this._follow.x - this.w / 2;
		this.y = this._follow.y - this.h / 2;
	},

	update: function(dt) {
		// TODO when miner die follow the nearest walker we found.
		if (this._follow) {
			this.x = ~~M.lerp(this.x, this._follow.x - this.w / 2, dt * 4);
			this.y = ~~M.lerp(this.y, this._follow.y - this.h / 2, dt * 4);
		}

		if (this.x < 0) {
			this.x = 0;
		} else if (this.x > Game.worldW * Game.TILE - this.w) {
			this.x = Game.worldW * Game.TILE - this.w;
		}

		if (this.y < 96) {
			this.y = 96;
		} else if (this.y > Game.worldH * Game.TILE - this.h) {
			this.y = Game.worldH * Game.TILE - this.h;
		}

		this.tile.x = M.floor(this.x / Game.TILE);
		this.tile.y = M.floor(this.y / Game.TILE);
	},

	onCamera: function(x, y, margin) {
		margin = margin || 0;
		return (x > this.x + margin &&
			y > this.y + margin &&
			x < this.x + this.w - margin &&
			y < this.y + this.h - margin);
	}
};
