function Miner(x, y) {
	Entity.init.call(this, x, y);
	this.digDelay = 0;
	this.size = 16;
	this.canJump = true;
	this.canExplode = 0;
	this.currentTile = new Tile();
	this.showHelpDelay = 0;
	this.animatedDeath = true;

	this.direction = 0;
	this.speed = 5;
}

Miner.DIG_DELAY = 0.06;
Miner.EXPLODE_DELAY = 0.8;
Miner.HELP_DELAY = 0.8;

Miner.prototype = {
	update: function(dt) {

		if (Game.isTileSolid(this.tile.x, this.tile.y)) {
			Game.remove(this);
		} else if (Game.getTile(this.tile.x, this.tile.y + 1) === TILES.SPIKES) {
			Game.remove(this);
		}

		var resetDelay = false;

		if ((this.digDelay -= dt) < 0) this.digDelay = 0;

		if ((this.direction === 1 || Input.keys.left === 1) && Game.isTileSolid(this.tile.x - 1, this.tile.y)) {
			this.direction = 1;

			this.showHelpDelay = Miner.HELP_DELAY;
			this.v.x = -this.speed;
			if (this.digDelay === 0 && this.onLeft && this.onGround) {
				this.digDelay = Miner.DIG_DELAY;
				if (!this.currentTile.dig(this.tile.x - 1, this.tile.y, this)) {
					this.direction = 0;
				}
			}
		} else if ((this.direction === 2 || Input.keys.right === 1) && Game.isTileSolid(this.tile.x + 1, this.tile.y)) {
			this.direction = 2;

			this.showHelpDelay = Miner.HELP_DELAY;
			this.v.x = this.speed;
			if (this.digDelay === 0 && this.onRight && this.onGround) {
				this.digDelay = Miner.DIG_DELAY;
				if (!this.currentTile.dig(this.tile.x + 1, this.tile.y, this)) {
					this.direction = 0;
				}
			}
		} else {
			resetDelay = true;
		}

		if ((this.direction === 3 || Input.keys.down === 1) && this.onGround) {
			this.direction = 3;

			this.showHelpDelay = Miner.HELP_DELAY;
			if (this.digDelay === 0) {
				this.digDelay = Miner.DIG_DELAY;
				if (!this.currentTile.dig(this.tile.x, this.tile.y + 1, this)) {
					this.direction = 0;
				}
			}
		} else {
			if (resetDelay) {
				this.digDelay = Miner.DIG_DELAY;
				this.currentTile.reset();
			}
		}

		Entity.update.call(this, dt);

		if (!this.moving) {
			this.showHelpDelay = (this.showHelpDelay > 0 && (this.showHelpDelay -= dt) < 0) ? 0 : this.showHelpDelay;
		} else {
			this.showHelpDelay = Miner.HELP_DELAY;
		}
	},

	render: function(ctx) {
		// render the selection:
		this.currentTile.select(ctx, true);

		// draw shadow:
		var tileYBelow = null;
		if (Game.isTileSolid(this.tile.x, this.tile.y + 1)) {
			tileYBelow = 1;
		} else if (Game.isTileSolid(this.tile.x, this.tile.y + 2)) {
			tileYBelow = 2;
		} else if (Game.isTileSolid(this.tile.x, this.tile.y + 3)) {
			tileYBelow = 3;
		}
		if (tileYBelow) {
			ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
			Canvas.drawEllipse(ctx,
				this.x - Camera.x - this.size / 2, (this.tile.y + tileYBelow) * Game.TILE - Camera.y - (Game.TILE * 0.43),
				this.size,
				6
			);
		}

		// body
		ctx.beginPath();
		ctx.arc(this.x - Camera.x, this.y - Camera.y - (Game.TILE * 0.3), this.size / 2, 2 * M.PI, false);
		ctx.fillStyle = '#FF0000';
		ctx.fill();

		if (this.showHelpDelay === 0) {
			var stuck = true; // TODO game logic, should not be there
			if (Game.isDiggableAndSafe(this.tile.x, this.tile.y + 1)) {
				stuck = false;
				ctx.drawImage(
					Game.sprite, 16, 50, 16, 16,
					this.tile.x * Game.TILE - Camera.x, (this.tile.y + 1) * Game.TILE - Camera.y,
					32, 32
				);
			}

			if (Game.isDiggableAndSafe(this.tile.x - 1, this.tile.y)) {
				stuck = false;
				ctx.drawImage(
					Game.sprite, 0, 50, 16, 16, (this.tile.x - 1) * Game.TILE - Camera.x,
					this.tile.y * Game.TILE - Camera.y,
					32, 32
				);
			}

			if (Game.isDiggableAndSafe(this.tile.x + 1, this.tile.y)) {
				stuck = false;
				ctx.drawImage(
					Game.sprite, 32, 50, 16, 16, (this.tile.x + 1) * Game.TILE - Camera.x,
					this.tile.y * Game.TILE - Camera.y,
					32, 32
				);
			}

			if (stuck) {
				Game.stuck = true;
				Game.remove(this);
			}
		}
	}
};
