/*

	c - color
	h - hardness


*/
TILES = {

	GRASS: 30,
	DIRT1: 31,
	DIRT2: 26,
	CELL: 27,
	SAND: 112,
	REDWOOD: 29,
	SPIKES: 25,
	GHOST: 36,
	BOMB1: 35,
	BOMB2: 33,
	WALKER: 34,
	CRATE: 22,

	data: [{
			c: '#B68956',
			h: 3
		}, {
			c: '#CFA26F',
			h: 2
		}, {
			c: '#E9BC89',
			h: 2
		}, {
			c: '#845724',
			h: 1
		}, {
			c: '#808752',
			h: 2
		}, // 4
		{
			c: '#ca9607',
			h: 2
		}, {
			c: '#c57ea8',
			h: 2
		}, // 6
		{
			c: '#54d0ba',
			h: 2
		}, {
			c: '#a93dd0',
			h: 2
		}, // 8
		{
			c: '#2ca90d',
			h: 2
		}, {
			c: '#e1fb58',
			h: 2
		}, {
			c: '#D9835F',
			h: 2
		}
	],

	get: function(v) {
		if (v <= 0) return undefined;
		if (this.data[v] && this.data[v].y === undefined) this.data[v].y = 0;
		return this.data[v];
	}
}

TILES.data[TILES.GRASS] = {
	p: 0
};
TILES.data[TILES.DIRT1] = {
	p: 1
};
TILES.data[TILES.DIRT2] = {
	p: 5
};
TILES.data[TILES.REDWOOD] = {
	p: 2
};
TILES.data[TILES.CELL] = {
	p: 3
};
TILES.data[TILES.BOMB1] = {
	p: 3,
	y: 1
};
TILES.data[TILES.BOMB2] = {
	p: 5,
	y: 1
};
TILES.data[TILES.SPIKES] = {
	p: 6
};
//TILES.data[TILES.INVADER] = {p: 4, y: 1};
TILES.data[TILES.CRATE] = {
	h: 6,
	p: 4
};
