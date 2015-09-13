Entity = {

	XCAP: 0.3,
	YCAP: 0.7,

	init: function(x, y) {
		this.tile = {
			x: 0,
			y: 0
		};
		this.xr = 0;
		this.yr = 0;
		this.x = x;
		this.y = y;
		this.v = {
			x: 0,
			y: 0
		};
		this.f = {
			x: 0.91,
			y: 0.97
		};
		this.gravity = 3;
		this.onGround = false;

		this.moving = false;

		Entity.updatePosition.call(this);
	},

	distance: function(e) {
		return M.sqrt((e.x - this.x) * (e.x - this.x) + (e.y - this.y) * (e.y - this.y));
	},

	overlaps: function(e) {
		var maxDist = this.size / 2 + e.size / 2;
		var distSqr = (e.x - this.x) * (e.x - this.x) + (e.y - this.y) * (e.y - this.y);
		return (distSqr <= maxDist * maxDist);
	},

	updatePosition: function() {
		this.tile.x = ~~(this.x / Map.TILE);
		this.tile.y = ~~(this.y / Map.TILE);
		this.xr = (this.x - this.tile.x * Map.TILE) / Map.TILE;
		this.yr = (this.y - this.tile.y * Map.TILE) / Map.TILE;
	},

	update: function(dt) {

		this.onGround = false;
		this.onLeft = false;
		this.onRight = false;

		this.v.x *= this.f.x;
		this.v.y *= this.f.y;

		// X component
		this.xr += this.v.x * dt;

		if (Game.map.isTileSolid(this.tile.x - 1, this.tile.y) && this.xr <= Entity.XCAP) {
			this.v.x = 0;
			this.xr = Entity.XCAP;
			this.onLeft = true;
		}

		if (Game.map.isTileSolid(this.tile.x + 1, this.tile.y) && this.xr >= Entity.YCAP) {
			this.v.x = 0;
			this.xr = Entity.YCAP;
			this.onRight = true;
		}

		while (this.xr < 0) {
			this.tile.x -= 1;
			this.xr += 1;
		}

		while (this.xr > 1) {
			this.tile.x += 1;
			this.xr -= 1;
		}

		this.v.y += this.gravity;
		this.yr += this.v.y * dt;

		if (Game.map.isTileSolid(this.tile.x, this.tile.y - 1) && this.yr <= Entity.XCAP) {
			this.v.y = 0;
			this.yr = Entity.XCAP;
		}

		if (Game.map.isTileSolid(this.tile.x, this.tile.y + 1) && this.yr >= Entity.YCAP) {
			this.v.y = 0;
			this.yr = Entity.YCAP;
			this.onGround = true;
		}

		while (this.yr < 0) {
			this.tile.y -= 1;
			this.yr += 1;
		}

		while (this.yr > 1) {
			this.tile.y += 1;
			this.yr -= 1;
		}

		var ox = this.x,
			oy = this.y;

		this.x = ~~((this.tile.x + this.xr) * Map.TILE);
		this.y = ~~((this.tile.y + this.yr) * Map.TILE);

		this.moving = ox !== this.x || oy !== this.y;
	}
};
