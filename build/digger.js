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
    data: [ {
        c: "#B68956",
        h: 3
    }, {
        c: "#CFA26F",
        h: 2
    }, {
        c: "#E9BC89",
        h: 2
    }, {
        c: "#845724",
        h: 1
    }, {
        c: "#808752",
        h: 2
    }, {
        c: "#ca9607",
        h: 2
    }, {
        c: "#c57ea8",
        h: 2
    }, {
        c: "#54d0ba",
        h: 2
    }, {
        c: "#a93dd0",
        h: 2
    }, {
        c: "#2ca90d",
        h: 2
    }, {
        c: "#e1fb58",
        h: 2
    }, {
        c: "#D9835F",
        h: 2
    } ],
    get: function(v) {
        if (v <= 0) return undefined;
        if (this.data[v] && this.data[v].y === undefined) this.data[v].y = 0;
        return this.data[v];
    }
};

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

TILES.data[TILES.CRATE] = {
    h: 6,
    p: 4
};

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
        this.tileHeight = this.h / Map.TILE;
        this.tileCountForWidth = ~~(this.w / Map.TILE);
        this.tileCount = ~~(this.w / Map.TILE * (this.h / Map.TILE)) + Camera.tileCountForWidth * 6;
    },
    set follow(e) {
        this._follow = e;
        this.x = this._follow.x - this.w / 2;
        this.y = this._follow.y - this.h / 2;
    },
    update: function(dt) {
        if (this._follow) {
            this.x = ~~M.lerp(this.x, this._follow.x - this.w / 2, dt * 4);
            this.y = ~~M.lerp(this.y, this._follow.y - this.h / 2, dt * 4);
        }
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x > Game.map.w * Map.TILE - this.w) {
            this.x = Game.map.w * Map.TILE - this.w;
        }
        if (this.y < 96) {
            this.y = 96;
        } else if (this.y > Game.map.h * Map.TILE - this.h) {
            this.y = Game.map.h * Map.TILE - this.h;
        }
        this.tile.x = ~~(this.x / Map.TILE);
        this.tile.y = ~~(this.y / Map.TILE);
    },
    onCamera: function(x, y, margin) {
        margin = margin || 0;
        return x > this.x + margin && y > this.y + margin && x < this.x + this.w - margin && y < this.y + this.h - margin;
    }
};

var Input = {
    keyMap: {
        37: "left",
        65: "left",
        81: "left",
        38: "up",
        90: "up",
        87: "up",
        83: "down",
        40: "down",
        39: "right",
        68: "right",
        32: "space",
        27: "esc",
        13: "enter"
    },
    keys: {},
    onKey: function(d, e) {
        if (!e) e = window.e;
        var c = e.keyCode;
        if (e.charCode && c === 0) c = e.charCode;
        var key = this.keyMap[c];
        if (key) {
            this.keys[key] = d;
        }
    }
};

function Map() {
    this.w = 0;
    this.h = 0;
    this.tiles = null;
    this.init();
    this.addBlocks();
    for (var m = 10; m < this.w; m += 40) {
        for (var n = 20; n < this.h; n += 40) {
            this.addCaves(m, n);
        }
    }
}

Map.TILE = 32;

Map.CAVE_WIDTH = 9;

Map.CAVE = [ 2, 1, 2, 2, 2, 2, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 0, 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 2, 2, 2, 2, 1, 2 ];

Map.BLOCK_SIZE = 4;

Map.blocks = [ [ 1, 1, 1, 1, 1, 0, 1, 1, 27, 0, 27, 1, 1, 33, 1, 1 ], [ 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 22, 1, 1, 25, 27, 1 ], [ 1, 1, 0, 0, 1, 0, 0, 25, 0, 0, 25, 1, 1, 25, 1, 1 ], [ 27, 22, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 25, 1, 1 ], [ 27, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 25, 1, 1 ], [ 1, 1, 1, 1, 1, 0, 0, 1, 27, 35, 35, 27, 1, 1, 1, 1 ], [ 1, 1, 1, 1, 1, 34, 27, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], [ 1, 1, 1, 1, 1, 1, 0, 1, 1, 22, 27, 1, 1, 1, 1, 1 ], [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 34, 27, 1, 1, 1, 33, 22 ], [ 1, 1, 1, 1, 1, 0, 0, 1, 27, 22, 22, 27, 1, 25, 1, 1 ] ];

Map.prototype = {
    init: function() {
        var t = new Terrain(9);
        t.generate(1.5);
        for (var y = 0; y < t.size; y++) {
            for (var x = 0; x < t.size; x++) {
                var val = t.get(x, y);
                val = getValue(x, y, val);
                t.set(x, y, val);
            }
        }
        this.w = t.size;
        this.h = t.size;
        this.tiles = new Float32Array(this.w * this.h);
        for (var y = 0; y < 10; y++) {
            for (var x = 0; x < t.size; x++) {
                this.tiles[x + t.size * y] = 0;
            }
        }
        for (var y = 10; y < 11; y++) {
            for (var x = 0; x < t.size; x++) {
                this.tiles[x + t.size * y] = TILES.GRASS;
            }
        }
        for (var y = 11; y < this.h - 10; y++) {
            for (var x = 0; x < t.size; x++) {
                this.tiles[x + t.size * y] = t.get(x, y);
            }
        }
        for (var y = this.h - 6; y < this.h; y++) {
            for (var x = 0; x < t.size; x++) {
                var v = 0;
                if (y === this.h - 1) {
                    v = TILES.SPIKES;
                } else if (y === this.h - 2) {
                    if (M.random() < .6) {
                        v = TILES.SPIKES;
                    }
                }
                this.tiles[x + t.size * y] = v;
            }
        }
        for (var y = 11; y < 21; y++) {
            for (var x = 0; x < t.size; x++) {
                if (y <= 13 || M.random() > .8 * y / 21) {
                    if (M.random() > .3) {
                        this.tiles[x + t.size * y] = TILES.DIRT1;
                    } else {
                        this.tiles[x + t.size * y] = TILES.DIRT2;
                    }
                }
            }
        }
        function getValue(x, y, val) {
            if (y === t.max || x === t.max) return 0;
            var max = t.max * 2 * t.roughness;
            var b = M.abs(~~val) / max;
            b = ~~(10 * b) + 1;
            return b;
        }
    },
    addBlocks: function() {
        var w = this.w / 2;
        for (var x = 0; x < this.w; x += Map.BLOCK_SIZE) {
            for (var y = 13; y < this.h; y += Map.BLOCK_SIZE) {
                var l = M.abs(w - x) / this.w;
                var ly = y / this.h / 2;
                if (ly > l) l = ly;
                if (M.random() > .8 - l) {
                    this.addBlock(x, y);
                }
            }
        }
    },
    addBlock: function(x, y) {
        var r = ~~(M.random() * Map.blocks.length);
        var b = Map.blocks[r];
        var i = b.length, tx = 0, ty = 0, f = M.random() > .5;
        while (i--) {
            ty = ~~(i / Map.BLOCK_SIZE);
            tx = i - ty * Map.BLOCK_SIZE;
            if (f) tx = Map.BLOCK_SIZE - tx;
            var v = b[i];
            if (v !== 1) {
                this.setTile(x + tx, y + ty, v);
            }
        }
    },
    addCaves: function(x, y) {
        x -= ~~(Map.CAVE_WIDTH / 2);
        var tx = 0, ty = 0, v = 0, i = Map.CAVE.length;
        while (i--) {
            ty = ~~(i / Map.CAVE_WIDTH);
            tx = i - ty * Map.CAVE_WIDTH;
            v = Map.CAVE[i];
            if (v === 1) {
                this.setTile(x + tx, y + ty, TILES.REDWOOD);
            } else if (v === 0) {
                this.setTile(x + tx, y + ty, 0);
            }
        }
    },
    getTile: function(x, y) {
        if (!this.isValidTile(x, y)) return undefined;
        return this.tiles[y * this.w + x];
    },
    setTile: function(x, y, val) {
        if (!this.isValidTile(x, y)) return;
        this.tiles[y * this.w + x] = val;
    },
    isTileSolid: function(x, y) {
        if (!this.isValidTile(x, y)) return true;
        var v = this.tiles[y * this.w + x];
        var t = TILES.get(v);
        return v === TILES.GHOST || t !== undefined;
    },
    isDiggable: function(x, y) {
        if (!this.isValidTile(x, y)) return true;
        var v = this.tiles[y * this.w + x];
        var t = TILES.get(v);
        return v === TILES.GHOST || t !== undefined && v !== TILES.CELL && v !== TILES.SPIKES;
    },
    isDiggableAndSafe: function(x, y) {
        if (!this.isValidTile(x, y)) return true;
        var v = this.tiles[y * this.w + x];
        var t = TILES.get(v);
        if (v === TILES.BOMB1 || v === TILES.BOMB2) return false;
        return v === TILES.GHOST || t !== undefined && v !== TILES.CELL && v !== TILES.SPIKES;
    },
    isValidTile: function(x, y) {
        return x >= 0 && y >= 0 && x < this.w && y < this.h;
    },
    getIndexForTile: function(x, y) {
        return y * this.w + x;
    },
    getTileForIndex: function(i) {
        var y = ~~(i / this.w);
        var x = i - y * this.w;
        return {
            x: x,
            y: y
        };
    },
    getCoordForTile: function(x, y) {
        return {
            x: ~~(x * Map.TILE),
            y: ~~(y * Map.TILE)
        };
    }
};

function Terrain(detail) {
    this.size = M.pow(2, detail) + 1;
    this.max = this.size - 1;
    this.map = new Float32Array(this.size * this.size);
}

Terrain.prototype.get = function(x, y) {
    if (x < 0 || x > this.max || y < 0 || y > this.max) return -1;
    return this.map[x + this.size * y];
};

Terrain.prototype.set = function(x, y, val) {
    this.map[x + this.size * y] = val;
};

Terrain.prototype.generate = function(roughness) {
    var self = this;
    self.roughness = roughness;
    this.set(0, 0, self.max);
    this.set(this.max, 0, self.max / 2);
    this.set(this.max, this.max, 0);
    this.set(0, this.max, self.max / 2);
    divide(this.max);
    function divide(size) {
        var x, y, half = size / 2;
        var scale = roughness * size;
        if (half < 1) return;
        for (y = half; y < self.max; y += size) {
            for (x = half; x < self.max; x += size) {
                square(x, y, half, M.random() * scale * 2 - scale);
            }
        }
        for (y = 0; y <= self.max; y += half) {
            for (x = (y + half) % size; x <= self.max; x += size) {
                diamond(x, y, half, M.random() * scale * 2 - scale);
            }
        }
        divide(size / 2);
    }
    function average(values) {
        var valid = values.filter(function(val) {
            return val !== -1;
        });
        var total = valid.reduce(function(sum, val) {
            return sum + val;
        }, 0);
        return total / valid.length;
    }
    function square(x, y, size, offset) {
        var ave = average([ self.get(x - size, y - size), self.get(x + size, y - size), self.get(x + size, y + size), self.get(x - size, y + size) ]);
        self.set(x, y, ave + offset);
    }
    function diamond(x, y, size, offset) {
        var ave = average([ self.get(x, y - size), self.get(x + size, y), self.get(x, y + size), self.get(x - size, y) ]);
        self.set(x, y, ave + offset);
    }
};

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
    this.sprite = document.createElement("canvas");
    this.sprite.width = Map.TILE;
    this.sprite.height = Map.TILE + 18;
    this.buffer = this.sprite.getContext("2d");
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
        if (!Game.map.isDiggable(tileX, tileY)) {
            this.reset();
            return false;
        }
        if (this.x === tileX && this.y === tileY) {
            if (this.bypassHardness || this.d.count++ > this.d.max) {
                if (this.val === TILES.BOMB1 || this.val === TILES.BOMB2) {
                    Game.explode(tileX, tileY);
                } else if (this.val === TILES.CRATE) {
                    if (Game.miner === digger) {
                        Game.score += 1;
                        Game.add(new Gain(this.x * Map.TILE + Map.TILE / 2, this.y * Map.TILE + Map.TILE / 2));
                    }
                }
                Game.map.setTile(this.x, this.y, 0);
                this.val = 0;
            }
        } else {
            this.val = Game.map.getTile(tileX, tileY);
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
        if (Game.map.isDiggable(this.x, this.y)) {
            rx = ~~(this.x * Map.TILE) - Camera.x;
            ry = ~~(this.y * Map.TILE) - Camera.y;
            var alpha = this.d.count / this.d.max;
            ctx.fillStyle = "rgba(0, 0, 0," + alpha * .2 + ")";
            ctx.lineWidth = 1;
            ctx.strokeStyle = "white";
            ctx.beginPath();
            if (!Game.map.isTileSolid(this.x, this.y - 1)) {
                ctx.fillRect(rx, ry - 18, Map.TILE, Map.TILE + 18);
                if (showBorder) {
                    ctx.rect(rx, ry - 18, Map.TILE, Map.TILE + 18);
                }
            } else {
                ctx.fillRect(rx, ry, Map.TILE, Map.TILE);
                if (showBorder) {
                    ctx.rect(rx, ry, Map.TILE, Map.TILE);
                }
            }
            ctx.stroke();
        }
    },
    render: function(ctx) {
        this.buffer.clearRect(0, 0, Map.TILE, Map.TILE + 18);
        this.buffer.fillStyle = this.c;
        this.buffer.fillRect(0, 18, Map.TILE, Map.TILE);
        if (!Game.map.isTileSolid(~~(this.x / Map.TILE), ~~(this.y / Map.TILE) - 1)) {
            this.buffer.fillStyle = colorLuminance(this.c, -.2);
            this.buffer.fillRect(0, 0, Map.TILE, 18);
        }
        ctx.save();
        if (this.shakeDuration > 0) {
            ctx.translate(~~((.5 - M.random()) * 6), ~~((.5 - M.random()) * 3));
        }
        ctx.fillStyle = "white";
        ctx.drawImage(this.sprite, ~~(this.x - Camera.x), ~~(this.y - Camera.y) - 18);
        ctx.restore();
    }
};

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
        ctx.drawImage(Game.sprite, 96, 25, 16, 16, this.x - 16 - Camera.x + M.sin(ctx.globalAlpha * Math.PI * 10) * 30, this.y - Camera.y, 32, 32);
        ctx.globalAlpha = 1;
    }
};

Entity = {
    XCAP: .3,
    YCAP: .7,
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
            x: .91,
            y: .97
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
        return distSqr <= maxDist * maxDist;
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
        var ox = this.x, oy = this.y;
        this.x = ~~((this.tile.x + this.xr) * Map.TILE);
        this.y = ~~((this.tile.y + this.yr) * Map.TILE);
        this.moving = ox !== this.x || oy !== this.y;
    }
};

function Gain(x, y) {
    this.x = x;
    this.y = y;
    this.delay = 0;
}

Gain.DELAY = .6;

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

Miner.DIG_DELAY = .06;

Miner.EXPLODE_DELAY = .8;

Miner.HELP_DELAY = .8;

Miner.prototype = {
    update: function(dt) {
        if (Game.map.isTileSolid(this.tile.x, this.tile.y)) {
            Game.remove(this);
        } else if (Game.map.getTile(this.tile.x, this.tile.y + 1) === TILES.SPIKES) {
            Game.remove(this);
        }
        var resetDelay = false;
        if ((this.digDelay -= dt) < 0) this.digDelay = 0;
        if ((this.direction === 1 || Input.keys.left === 1) && Game.map.isTileSolid(this.tile.x - 1, this.tile.y)) {
            this.direction = 1;
            this.showHelpDelay = Miner.HELP_DELAY;
            this.v.x = -this.speed;
            if (this.digDelay === 0 && this.onLeft && this.onGround) {
                this.digDelay = Miner.DIG_DELAY;
                if (!this.currentTile.dig(this.tile.x - 1, this.tile.y, this)) {
                    this.direction = 0;
                }
            }
        } else if ((this.direction === 2 || Input.keys.right === 1) && Game.map.isTileSolid(this.tile.x + 1, this.tile.y)) {
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
            this.showHelpDelay = this.showHelpDelay > 0 && (this.showHelpDelay -= dt) < 0 ? 0 : this.showHelpDelay;
        } else {
            this.showHelpDelay = Miner.HELP_DELAY;
        }
    },
    render: function(ctx) {
        this.currentTile.select(ctx, true);
        var tileYBelow = null;
        if (Game.map.isTileSolid(this.tile.x, this.tile.y + 1)) {
            tileYBelow = 1;
        } else if (Game.map.isTileSolid(this.tile.x, this.tile.y + 2)) {
            tileYBelow = 2;
        } else if (Game.map.isTileSolid(this.tile.x, this.tile.y + 3)) {
            tileYBelow = 3;
        }
        if (tileYBelow) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            Canvas.drawEllipse(ctx, this.x - Camera.x - this.size / 2, (this.tile.y + tileYBelow) * Map.TILE - Camera.y - Map.TILE * .43, this.size, 6);
        }
        ctx.beginPath();
        ctx.arc(this.x - Camera.x, this.y - Camera.y - Map.TILE * .3, this.size / 2, 2 * M.PI, false);
        ctx.fillStyle = "#FF0000";
        ctx.fill();
        if (this.showHelpDelay === 0) {
            var stuck = true;
            if (Game.map.isDiggableAndSafe(this.tile.x, this.tile.y + 1)) {
                stuck = false;
                ctx.drawImage(Game.sprite, 16, 50, 16, 16, this.tile.x * Map.TILE - Camera.x, (this.tile.y + 1) * Map.TILE - Camera.y, 32, 32);
            }
            if (Game.map.isDiggableAndSafe(this.tile.x - 1, this.tile.y)) {
                stuck = false;
                ctx.drawImage(Game.sprite, 0, 50, 16, 16, (this.tile.x - 1) * Map.TILE - Camera.x, this.tile.y * Map.TILE - Camera.y, 32, 32);
            }
            if (Game.map.isDiggableAndSafe(this.tile.x + 1, this.tile.y)) {
                stuck = false;
                ctx.drawImage(Game.sprite, 32, 50, 16, 16, (this.tile.x + 1) * Map.TILE - Camera.x, this.tile.y * Map.TILE - Camera.y, 32, 32);
            }
            if (stuck) {
                Game.stuck = true;
                Game.remove(this);
            }
        }
    }
};

function Walker(x, y) {
    Entity.init.call(this, x, y);
    this.size = 20;
    this.f = {
        x: .93,
        y: .93
    };
    this.follow = undefined;
    this.digDelay = 0;
    this.currentTile = new Tile();
    this.animatedDeath = true;
    this.follow = undefined;
    this.digDown = M.random() > .5;
}

Walker.DIG_DELAY = .1;

Walker.prototype = {
    update: function(dt) {
        Entity.update.call(this, dt);
        if (Game.map.isTileSolid(this.tile.x, this.tile.y)) {
            Game.remove(this);
        } else if (Game.map.getTile(this.tile.x, this.tile.y + 1) === TILES.SPIKES) {
            Game.remove(this);
        }
        if (Entity.overlaps.call(this, Game.miner)) {
            Game.remove(Game.miner);
        }
        if ((this.digDelay -= dt) < 0) this.digDelay = 0;
        var d = Entity.distance.call(this, Game.miner);
        if (this.follow === undefined && d < 140) {
            this.follow = Game.miner;
        }
        if (this.follow && d < 192) {
            var fx = this.follow.tile.x, fy = this.follow.tile.y;
            var diffX = fx - this.tile.x, diffY = fy - this.tile.y;
            diffX = diffX > 0 ? 1 : diffX < 0 ? -1 : 0;
            diffY = diffY > 0 ? 1 : diffY < 0 ? -1 : 0;
            this.v.x = diffX;
            if (this.onGround && this.digDelay === 0) {
                this.digDelay = Walker.DIG_DELAY;
                if (this.digDown) {
                    if (diffY > 0) {
                        this.currentTile.dig(this.tile.x, this.tile.y + 1, 0);
                    } else if (this.onLeft && diffX < 0) {
                        if (!Game.map.isDiggable(this.tile.x - 1, this.tile.y)) {
                            this.currentTile.dig(this.tile.x, this.tile.y + 1, 0);
                        } else {
                            this.currentTile.dig(this.tile.x - 1, this.tile.y, 0);
                        }
                    } else if (this.onRight && diffX > 0) {
                        if (!Game.map.isDiggable(this.tile.x + 1, this.tile.y)) {
                            this.currentTile.dig(this.tile.x, this.tile.y + 1, 0);
                        } else {
                            this.currentTile.dig(this.tile.x + 1, this.tile.y, 0);
                        }
                    }
                } else {
                    if (this.onLeft && diffX < 0) {
                        if (!Game.map.isDiggable(this.tile.x - 1, this.tile.y)) {
                            this.currentTile.dig(this.tile.x, this.tile.y + 1, 0);
                        } else {
                            this.currentTile.dig(this.tile.x - 1, this.tile.y, 0);
                        }
                    } else if (this.onRight && diffX > 0) {
                        if (!Game.map.isDiggable(this.tile.x + 1, this.tile.y)) {
                            this.currentTile.dig(this.tile.x, this.tile.y + 1, 0);
                        } else {
                            this.currentTile.dig(this.tile.x + 1, this.tile.y, 0);
                        }
                    } else if (diffY > 0) {
                        this.currentTile.dig(this.tile.x, this.tile.y + 1, 0);
                    }
                }
            }
        }
    },
    render: function(ctx) {
        this.currentTile.select(ctx, false);
        if (Game.map.isTileSolid(this.tile.x, this.tile.y + 1)) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            Canvas.drawEllipse(ctx, this.x - Camera.x - this.size / 2, (this.tile.y + 1) * Map.TILE - Camera.y - Map.TILE * .43, this.size, 6);
        }
        ctx.beginPath();
        ctx.arc(this.x - Camera.x, this.y - Camera.y - Map.TILE * .3, this.size / 2, 2 * M.PI, false);
        ctx.fillStyle = "#000";
        ctx.fill();
    }
};

function colorLuminance(hex, lum) {
    hex = String(hex).replace(/[^0-9a-f]/gi, "");
    if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;
    var rgb = "#", c, i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
        rgb += ("00" + c).substr(c.length);
    }
    return rgb;
}

var Stats = function() {
    var l = Date.now(), m = l, g = 0, n = Infinity, o = 0, h = 0, p = Infinity, q = 0, r = 0, s = 0, f = document.createElement("div");
    f.id = "stats";
    f.addEventListener("mousedown", function(b) {
        b.preventDefault();
        t(++s % 2);
    }, !1);
    f.style.cssText = "width:80px;opacity:0.9;cursor:pointer";
    var a = document.createElement("div");
    a.id = "fps";
    a.style.cssText = "padding:0 0 3px 3px;text-align:left;background-color:#002";
    f.appendChild(a);
    var i = document.createElement("div");
    i.id = "fpsText";
    i.style.cssText = "color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";
    i.innerHTML = "FPS";
    a.appendChild(i);
    var c = document.createElement("div");
    c.id = "fpsGraph";
    c.style.cssText = "position:relative;width:74px;height:30px;background-color:#0ff";
    for (a.appendChild(c); 74 > c.children.length; ) {
        var j = document.createElement("span");
        j.style.cssText = "width:1px;height:30px;float:left;background-color:#113";
        c.appendChild(j);
    }
    var d = document.createElement("div");
    d.id = "ms";
    d.style.cssText = "padding:0 0 3px 3px;text-align:left;background-color:#020;display:none";
    f.appendChild(d);
    var k = document.createElement("div");
    k.id = "msText";
    k.style.cssText = "color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";
    k.innerHTML = "MS";
    d.appendChild(k);
    var e = document.createElement("div");
    e.id = "msGraph";
    e.style.cssText = "position:relative;width:74px;height:30px;background-color:#0f0";
    for (d.appendChild(e); 74 > e.children.length; ) j = document.createElement("span"), 
    j.style.cssText = "width:1px;height:30px;float:left;background-color:#131", e.appendChild(j);
    var t = function(b) {
        s = b;
        switch (s) {
          case 0:
            a.style.display = "block";
            d.style.display = "none";
            break;

          case 1:
            a.style.display = "none", d.style.display = "block";
        }
    };
    return {
        REVISION: 12,
        domElement: f,
        setMode: t,
        begin: function() {
            l = Date.now();
        },
        end: function() {
            var b = Date.now();
            g = b - l;
            n = Math.min(n, g);
            o = Math.max(o, g);
            k.textContent = g + " MS (" + n + "-" + o + ")";
            var a = Math.min(30, 30 - 30 * (g / 200));
            e.appendChild(e.firstChild).style.height = a + "px";
            r++;
            b > m + 1e3 && (h = Math.round(1e3 * r / (b - m)), p = Math.min(p, h), q = Math.max(q, h), 
            i.textContent = h + " FPS (" + p + "-" + q + ")", a = Math.min(30, 30 - 30 * (h / 100)), 
            c.appendChild(c.firstChild).style.height = a + "px", m = b, r = 0);
            return b;
        },
        update: function() {
            l = this.end();
        }
    };
};

"object" === typeof module && (module.exports = Stats);

(function() {
    var lastTime = 0;
    var vendors = [ "webkit", "moz" ];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
        window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] || window[vendors[x] + "CancelRequestAnimationFrame"];
    }
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
})();

document.onkeyup = function(e) {
    Input.onKey(0, e);
};

document.onkeydown = function(e) {
    Input.onKey(1, e);
};

document.onkeypress = function(e) {};

var start = 0;

function update(dt) {
    var p = (dt - start) / 1e3;
    start = dt;
    Game.update(p);
    Game.render();
    window.requestAnimationFrame(update);
}

M = Math;

window.onload = function() {
    Game.canvas = document.getElementById("game");
    Game.ctx = Game.canvas.getContext("2d");
    Game.ctx["imageSmoothingEnabled"] = false;
    Game.ctx["mozImageSmoothingEnabled"] = false;
    Game.ctx["oImageSmoothingEnabled"] = false;
    Game.ctx["msImageSmoothingEnabled"] = false;
    Game.width = Game.canvas.width;
    Game.height = Game.canvas.height;
    Camera.setDimension(Game.canvas.width, Game.canvas.height);
    Game.load(function() {
        window.requestAnimationFrame(update);
    });
};

var Game = {
    EXPLOSION_SIZE_1: 7,
    EXPLOSION_1: [ 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0 ],
    EXPLOSION_SIZE: 9,
    EXPLOSION: [ 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 1, 2, 3, 2, 1, 0, 0, 0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1, 0, 0, 0, 1, 2, 3, 2, 1, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0 ],
    ctx: null,
    es: [],
    _toRemove: false,
    width: 0,
    height: 0,
    checkGravityDelay: .2,
    terrain: null,
    gameOver: false,
    stuck: false,
    sprite: document.getElementById("sprite"),
    load: function(onLoaded) {
        this.score = 0;
        this.es = [];
        this.map = new Map();
        this.miner = new Miner(~~(this.map.w / 2) * Map.TILE + Map.TILE / 2, 9 * Map.TILE + Map.TILE / 2);
        this.add(this.miner);
        Camera.follow = this.miner;
        this.shake = 0;
        this.dialogContainer = document.getElementById("dialog-container");
        this.dialog = document.getElementById("dialog");
        if (onLoaded) {
            onLoaded();
        }
    },
    explode: function(x, y) {
        var center = ~~(Game.EXPLOSION_SIZE / 2);
        var i = Game.EXPLOSION.length;
        var xr = 0, yr = 0;
        while (i--) {
            yr = ~~(i / Game.EXPLOSION_SIZE);
            xr = i - yr * Game.EXPLOSION_SIZE;
            var tx = x + xr - center;
            var ty = y + yr - center;
            if (Game.EXPLOSION[i] !== 0 && Game.map.isTileSolid(tx, ty)) {
                setTimeout(function(tx, ty) {
                    return function() {
                        var pos = Game.map.getCoordForTile(tx, ty);
                        var idx = Game.map.getIndexForTile(tx, ty);
                        var tile = TILES.get(Game.map.tiles[idx]);
                        if (Game.map.tiles[idx] === TILES.BOMB1 || Game.map.tiles[idx] === TILES.BOMB2) {
                            Game.map.setTile(tx, ty, TILES.GHOST);
                            Game.explode(tx, ty);
                        }
                        if (tile) {
                            Game.map.setTile(tx, ty, TILES.GHOST);
                            var t = Game.add(new Tile(pos.x, pos.y, tile.c));
                            t.shake(.2, function(t, tx, ty) {
                                return function() {
                                    Game.map.setTile(tx, ty, 0);
                                    Game.remove(t);
                                };
                            }(t, tx, ty));
                        }
                    };
                }(tx, ty), (6 - Game.EXPLOSION[i]) * 40);
            }
        }
        i = this.es.length, e = undefined;
        var gap = 4;
        while (i--) {
            e = this.es[i];
            if (e.tile) {
                if (e.tile.x > x - (center - gap / 2) && e.tile.x < x + Game.EXPLOSION_SIZE - gap && (e.tile.y > y - (center - gap / 2) && e.tile.y < y + Game.EXPLOSION_SIZE - gap)) {
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
            this.checkGravityDelay = .2;
            var tileX = 0, tileY = 0;
            for (var it = 0; it < Camera.tileCount; it++) {
                tileX = it % Camera.tileCountForWidth;
                if (Camera.tile.x > 0) tileX += Camera.tile.x;
                tileY = ~~(it / Camera.tileCountForWidth);
                if (Camera.tile.y > 0) tileY += Camera.tile.y;
                val = this.map.getTile(tileX, tileY);
                if (val === TILES.CELL || val === TILES.BOMB1 || val === TILES.BOMB2 || val === TILES.SPIKES || val === TILES.CRATE) {
                    if (!this.map.isTileSolid(tileX, tileY + 1)) {
                        this.map.setTile(tileX, tileY, 0);
                        this.map.setTile(tileX, tileY + 1, val);
                    }
                } else if (val === TILES.WALKER) {
                    this.add(new Walker(tileX * Map.TILE, tileY * Map.TILE));
                    this.map.setTile(tileX, tileY, 0);
                }
            }
        }
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
        this.ctx.fillStyle = "#202020";
        this.ctx.fillRect(0, 0, this.width, this.height);
        if (Camera.y > 10 * Map.TILE) {
            var gradient = this.ctx.createRadialGradient(this.miner.x - Camera.x, this.miner.y - Camera.y, 200, this.miner.x - Camera.x, this.miner.y - Camera.y, 30);
            gradient.addColorStop(0, "#0A1419");
            gradient.addColorStop(1, "#11232c");
        } else {
            _drawSkyCanvas(this.ctx, this.width, 10 * Map.TILE - Camera.y);
        }
        if (this.shake > 0) {
            this.ctx.save();
            this.ctx.translate(~~((.5 - M.random()) * 6), ~~((.5 - M.random()) * 3.4));
        }
        var selectionX = null;
        var selectionY = null;
        var extraTile = new Array();
        var i = 0, tx = 0, ty = 0, rx = 0, ry = 0;
        for (var it = 0; it < Camera.tileCount; it++) {
            tx = it % (Camera.tileCountForWidth + 2);
            if (Camera.tile.x > 0) tx += Camera.tile.x;
            ty = ~~(it / (Camera.tileCountForWidth + 2));
            if (Camera.tile.y > 0) ty += Camera.tile.y;
            i = this.map.getIndexForTile(tx, ty);
            var idx = this.map.tiles[i];
            if (idx !== undefined) {
                var tile = TILES.get(idx);
                if (tile) {
                    rx = ~~(tx * Map.TILE) - Camera.x;
                    ry = ~~(ty * Map.TILE) - Camera.y;
                    if (tile.p !== undefined) {
                        var p = tile.p, sy = tile.y;
                        if (idx === TILES.BOMB1 || idx === TILES.BOMB2) {
                            extraTile.push({
                                x: rx,
                                y: ry,
                                tx: tx,
                                ty: ty
                            });
                        }
                        if (!this.map.isTileSolid(tx, ty - 1)) {
                            this.ctx.drawImage(Game.sprite, p * 16, sy * 25, 16, 25, rx, ry - 18, 32, 50);
                        } else {
                            this.ctx.drawImage(Game.sprite, p * 16, sy * 25 + 9, 16, 16, rx, ry, 32, 32);
                        }
                    } else {
                        this.ctx.fillStyle = tile.c;
                        this.ctx.fillRect(rx, ry, Map.TILE, Map.TILE);
                        if (!this.map.isTileSolid(tx, ty - 1)) {
                            this.ctx.fillStyle = colorLuminance(tile.c, -.2);
                            this.ctx.fillRect(rx, ry - 18, Map.TILE, 18);
                        }
                        this.ctx.beginPath();
                        this.ctx.globalAlpha = .1;
                        this.ctx.strokeStyle = "#000";
                        this.ctx.rect(rx, ry, Map.TILE, Map.TILE);
                        this.ctx.stroke();
                        this.ctx.globalAlpha = 1;
                    }
                }
            }
            this.ctx.fillStyle = "#000";
        }
        var l = extraTile.length;
        while (l--) {
            var t = extraTile[l];
            if (!this.map.isTileSolid(t.tx, t.ty - 1)) {
                this.ctx.drawImage(Game.sprite, 0, 25, 48, 25, t.x - Map.TILE, t.y - 18, 96, 50);
            } else {
                this.ctx.drawImage(Game.sprite, 0, 34, 48, 16, t.x - Map.TILE, t.y, 96, 32);
            }
            if (!this.map.isTileSolid(tx, ty + 1)) {
                this.ctx.globalCompositeOperation = "overlay";
                this.ctx.fillStyle = "rgb(0, 0, 0, 0.3)";
                this.ctx.fillRect(rx, ry + Map.TILE - 1, Map.TILE, 1);
                this.ctx.globalCompositeOperation = "source-over";
            }
        }
        i = this.es.length;
        while (i--) {
            if (Camera.onCamera(this.es[i].x, this.es[i].y)) {
                this.es[i].render(this.ctx);
            }
        }
        if (this.gameOver) {
            this.dialogContainer.style.display = "block";
            this.dialog.innerHTML = this.stuck ? "STUCK" : "GAME OVER";
            if (Input.keys.space) {
                this.load();
                this.dialogContainer.style.display = "none";
                this.gameOver = false;
                this.stuck = false;
            }
        }
        this.ctx.beginPath();
        this.ctx.arc(18, 22, 6, 0, 2 * Math.PI, true);
        this.ctx.fillStyle = "yellow";
        this.ctx.fill();
        this.ctx.font = "24px Arial, sans-serif";
        this.ctx.fillStyle = "white";
        this.ctx.fillText(this.score, 32, 30);
    }
};

function _drawSkyCanvas(ctx, width, horizonY) {
    ctx.save();
    ctx.fillStyle = "#FF8601";
    ctx.beginPath();
    ctx.rect(0, 0, width, horizonY);
    ctx.fill();
    ctx.clip();
    ctx.fillStyle = "#FFE7CA";
    var sunRadius = width / 4;
    ctx.beginPath();
    ctx.arc(width / 2, horizonY - (sunRadius + 24) + Camera.y * .4, sunRadius, 0, M.PI, true);
    ctx.fill();
    ctx.restore();
    ctx.beginPath();
    ctx.fillStyle = "#202020";
    var mountainMaxHeight = 40;
    var points = [ 0, .7, .1, .3, .2, 1, .3, .5, .35, .8, .42, .5, .55, .9, .7, .45, .8, 1.1, .88, .4, 1, .8 ];
    var mountainX = 0;
    for (var i = 0; i < points.length; i += 2) {
        var x = points[i] * width;
        var y = Camera.y * .2 - 78 + horizonY - mountainMaxHeight * points[i + 1];
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

var Canvas = {
    drawEllipse: function(ctx, x, y, w, h) {
        var kappa = .5522848, ox = w / 2 * kappa, oy = h / 2 * kappa, xe = x + w, ye = y + h, xm = x + w / 2, ym = y + h / 2;
        ctx.beginPath();
        ctx.moveTo(x, ym);
        ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
        ctx.fill();
    }
};

Math.lerp = function(a, b, t) {
    return (1 - t) * a + t * b;
};

Math.sqrtDistance = function(x, y, a, b) {
    return (x - a) * (a - x) + (b - y) * (b - y);
};

Math.angle = function(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
};

(function() {
    var lastTime = 0;
    var vendors = [ "webkit", "moz" ];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
        window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] || window[vendors[x] + "CancelRequestAnimationFrame"];
    }
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
})();