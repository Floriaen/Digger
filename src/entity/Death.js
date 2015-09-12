function Death(x, y) {
	this.x = x;
	this.y = y;
	this.delay = 0;
	this.speed = 30 + M.random() * 8;
}
Death.DELAY = 6;
Death.prototype = {
	update: function(dt) {
		this.delay += dt;
		if (this.delay > Death.DELAY) {
			this.delay = Death.DELAY;
			Game.remove(this);
		}

		this.y -= dt * this.speed;
	},
	render: function(ctx) {
		ctx.globalAlpha = 1 - this.delay / Death.DELAY;
		ctx.drawImage(Game.sprite, 96, 25, 16, 16, (this.x - 16 - Camera.x) + M.sin(ctx.globalAlpha * Math.PI * 10) * 30, this.y - Camera.y, 32, 32);
		ctx.globalAlpha = 1;
	}
};