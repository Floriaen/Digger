function Walker(x, y) {
	Entity.init.call(this, x, y);
	this.size = 20;
	this.f = {
		x: 0.93,
		y: 0.93
	};

	this.follow = undefined;
	this.digDelay = 0;
	this.currentTile = new Tile();
	this.animatedDeath = true;

	this.follow = undefined;
	this.digDown = M.random() > 0.5;
}

Walker.DIG_DELAY = 0.1;

Walker.prototype = {
	update: function(dt) {
		Entity.update.call(this, dt);

		if (Game.isTileSolid(this.tile.x, this.tile.y)) {
			Game.remove(this);
		} else if (Game.getTile(this.tile.x, this.tile.y + 1) === TILES.SPIKES) {
			Game.remove(this);
		}

		// overlaps
		if (Entity.overlaps.call(this, Game.miner)) {
			Game.remove(Game.miner); // Game Over
			/*
			// TODO: this doesn't work
			if (Game.miner.y < this.y) {
				Game.remove(this);
			} else {
				Game.remove(Game.miner); // Game Over
			}
			*/
		}

		if ((this.digDelay -= dt) < 0) this.digDelay = 0;

		// distance from Miner
		var d = Entity.distance.call(this, Game.miner);
		if (this.follow === undefined && d < 140) {
			this.follow = Game.miner;
		}

		if (this.follow && d < 192)  {
			// get back the nea
			var fx = this.follow.tile.x,
				fy = this.follow.tile.y;

			var diffX = fx - this.tile.x,
				diffY = fy - this.tile.y;

			// normalize
			diffX = (diffX > 0) ? 1 : ((diffX < 0) ? -1 : 0);
			diffY = (diffY > 0) ? 1 : ((diffY < 0) ? -1 : 0);

			this.v.x = diffX; // decrease speed

			// this.onGround
			if (this.onGround && this.digDelay === 0) {
				this.digDelay = Walker.DIG_DELAY;
				if (this.digDown) {
					if (diffY > 0) { // if walker are on top
						this.currentTile.dig(this.tile.x, this.tile.y + 1, 0);
					} else if (this.onLeft && diffX < 0) { // if walker are on left
						if (!Game.isDiggable(this.tile.x - 1, this.tile.y)) {
							// try to dig down
							this.currentTile.dig(this.tile.x, this.tile.y + 1, 0);
						} else {
							this.currentTile.dig(this.tile.x - 1, this.tile.y, 0);
						}
					} else if (this.onRight && diffX > 0) { // if walker are on the right
						if (!Game.isDiggable(this.tile.x + 1, this.tile.y)) {
							// try to dig down
							this.currentTile.dig(this.tile.x, this.tile.y + 1, 0);
						} else {
							this.currentTile.dig(this.tile.x + 1, this.tile.y, 0);
						}
					}
				} else {
					if (this.onLeft && diffX < 0) { // if walker are on left
						if (!Game.isDiggable(this.tile.x - 1, this.tile.y)) {
							// try to dig down
							this.currentTile.dig(this.tile.x, this.tile.y + 1, 0);
						} else {
							this.currentTile.dig(this.tile.x - 1, this.tile.y, 0);
						}
					} else if (this.onRight && diffX > 0) { // if walker are on the right
						if (!Game.isDiggable(this.tile.x + 1, this.tile.y)) {
							// try to dig down
							this.currentTile.dig(this.tile.x, this.tile.y + 1, 0);
						} else {
							this.currentTile.dig(this.tile.x + 1, this.tile.y, 0);
						}
					} else if (diffY > 0) { // if walker are on top
						this.currentTile.dig(this.tile.x, this.tile.y + 1, 0);
					}
				}

			}
		}
	},

	render: function(ctx) {
		this.currentTile.select(ctx, false);
		// draw shadow:
		if (Game.isTileSolid(this.tile.x, this.tile.y + 1)) {
			ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
			Canvas.drawEllipse(ctx,
				this.x - Camera.x - this.size / 2, (this.tile.y + 1) * Game.TILE - Camera.y - (Game.TILE * 0.43),
				this.size,
				6
			);
		}

		ctx.beginPath();
		ctx.arc(this.x - Camera.x, this.y - Camera.y - (Game.TILE * 0.3), this.size / 2, 2 * M.PI, false);
		ctx.fillStyle = '#000'; //this.digDown ? 'gray': 'green';
		ctx.fill();
	}
};
