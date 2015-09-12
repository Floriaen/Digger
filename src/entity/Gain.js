function Gain(x, y) {
	this.x = x;
	this.y = y;
	this.delay = 0;
}
Gain.DELAY = 0.6;
Gain.prototype = {
	update: function(dt) {
		this.delay += dt;
		if (this.delay > Gain.DELAY) {
			this.delay = Gain.DELAY;
			Game.remove(this);
		}
		this.y -= dt * 70;
	},
	render: function(ctx) {
		ctx.globalAlpha = 1 - this.delay / Gain.DELAY;
		ctx.beginPath();
        ctx.arc(this.x - Camera.x, this.y - Camera.y, 6, 0, 2 * Math.PI, true);
        ctx.fillStyle = "yellow";
        ctx.fill();
		ctx.globalAlpha = 1;
	}
};
