'use strict';

(function () {
  'use strict';

  var ns = window['pacdungeon'];

  function AIStrategy(pacman, ghost, safetile, opposites) {
    this.pacman = pacman;
    this.ghost = ghost;
    this.safetile = safetile;
    this.opposites = opposites;
  }

  function doShadow(directions, current) {
    /*jshint validthis:true */

    var pacmanPos = this.pacman.getGridPosition();
    var t = 0;
    var min = 1000;
    var nextDirection = Phaser.NONE;
    //stalks pacman everywhere
    for (t = 5; t > 0; t--) {
      if (!directions[t]) {
        continue;
      }
      if (t === this.opposites[current]) {
        //ghost can't move back yo
        continue;
      }

      if (directions[t].index === this.safetile || directions[t].index === ns.DungeonGenerator.TOPWALL || directions[t].index === ns.DungeonGenerator.RIGHTWALL || directions[t].index === ns.DungeonGenerator.BOTTOMWALL || directions[t].index === ns.DungeonGenerator.LEFTWALL) {

        if (!this.isAtEdge(directions[t].index)) {
          //which of the directions is closer to the pacman?
          var distance = Phaser.Math.distance(pacmanPos.x, pacmanPos.y, directions[t].x, directions[t].y);
          if (distance < min) {
            nextDirection = t;
            min = distance;
          }
        }
      }
    }
    return nextDirection;
  }

  function doSpeedy(directions, current) {
    /*jshint validthis:true */
    //get where pacman is facing
    var pacmanPos = this.pacman.getForwardPosition(4);
    var t = 0;
    var min = 1000;
    var nextDirection = Phaser.NONE;

    //look forward four squares
    for (t = 1; t < 5; t++) {
      if (!directions[t]) {
        continue;
      }
      if (t === this.opposites[current]) {
        //ghost can't move back yo
        continue;
      }

      if (directions[t].index === this.safetile || directions[t].index === ns.DungeonGenerator.TOPWALL || directions[t].index === ns.DungeonGenerator.RIGHTWALL || directions[t].index === ns.DungeonGenerator.BOTTOMWALL || directions[t].index === ns.DungeonGenerator.LEFTWALL) {

        if (!this.isAtEdge(directions[t].index)) {
          //which of the directions is closer to the pacman?
          var distance = Phaser.Math.distance(pacmanPos.x, pacmanPos.y, directions[t].x, directions[t].y);
          if (distance < min) {
            nextDirection = t;
            min = distance;
          }
        }
      }
    }

    return nextDirection;
  }

  function doBashful(directions, current) {
    /*jshint validthis:true */

    //two tiles forward, but consider shadow's position
    for (var t = 1; t < 5; t++) {
      if (!directions[t]) {
        continue;
      }
      if (t === this.opposites[current]) {
        //ghost can't move back yo
        continue;
      }

      if (directions[t].index === this.safetile) {
        break;
      }
    }
    return t;
  }

  function doPokey(directions, current) {
    /*jshint validthis:true */

    //if far away from pacman, be like blinky
    //if close, scatter mode
    for (var t = 1; t < 5; t++) {
      if (!directions[t]) {
        continue;
      }
      if (t === this.opposites[current]) {
        //ghost can't move back yo
        continue;
      }

      if (directions[t].index === this.safetile) {
        break;
      }
    }
    return t;
  }

  AIStrategy.prototype.setStrategy = function (strategy) {
    switch (strategy) {
      case 'shadow':
        this.getNextDirection = doShadow;
        break;
      case 'speedy':
        this.getNextDirection = doSpeedy;
        break;
      case 'bashful':
        this.getNextDirection = doBashful;
        break;
      case 'pokey':
        this.getNextDirection = doPokey;
        break;
    }
  };

  AIStrategy.prototype.isAtEdge = function (tile) {
    if (tile === ns.DungeonGenerator.TOPWALL) {

      return this.ghost.forwardMarker.y === 1;
    } else if (tile === ns.DungeonGenerator.RIGHTWALL) {
      console.log('Ghost Marker: ', this.ghost.forwardMarker.x, this.ghost.forwardMarker.x === 38);
      return this.ghost.forwardMarker.x === 28;
    } else if (tile === ns.DungeonGenerator.BOTTOMWALL) {
      return this.ghost.forwardMarker.y === 28;
    } else if (tile === ns.DungeonGenerator.LEFTWALL) {
      return this.ghost.forwardMarker.x === 1;
    }

    return false;
  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].AIStrategy = AIStrategy;
})();
'use strict';

(function () {
  'use strict';

  function Cell(x, y, data, timerContainer, main) {
    this.level = 0;

    this.x = x;
    this.y = y;
    this.data = data;
    this.main = main;
    this.timerContainer = timerContainer;

    this.dots = [];
    var pos = main.toWorldPosition(this.x, this.y, 0, 0);
    this.countdown = new Phaser.BitmapText(main.game, pos.x, pos.y, 'minecraftia', '0');
    timerContainer.add(this.countdown);

    this.CELLREFRESHTIME = 3000;
    this.cellRefresh = -1;
  }

  Cell.prototype.isCleared = function () {
    for (var i in this.dots) {
      if (this.dots[i].alive) {
        return false;
      }
    }

    this.cellRefresh = this.CELLREFRESHTIME;
    return true;
  };

  Cell.prototype.revive = function () {
    var dotIndex = 0;

    //foreach safetile
    for (var i = 0; i < this.data.length; i++) {
      for (var j = 0; j < this.data[i].length; j++) {
        if (this.data[i][j] === 7) {
          this.data[i][j] = 14;
          var dot = this.dots[dotIndex];
          if (!dot) {
            dot = this.main.createDot();
            this.dots.push(dot);
          }
          var pos = this.main.toWorldPosition(this.x, this.y, i, j);

          dot.revive();
          dotIndex++;
          dot.x = pos.x - 3;
          dot.y = pos.y - 3;
        }
      }
    }
    //get dot
    //if ran out of dots
    //create a dot
    //put dot on safetile location

    // for(var i = 0; i < this.dots.length; i++){
    //   this.dots[i].revive();
    // }
  };

  Cell.prototype.nextLevel = function () {
    //load a different level data
    this.level++;
    this.data = this.main.DungeonGenerator.loadLevel(this.level);
    this.revive(); //check where '7' is, and revive our dot sprites there

    this.main.createCellData(this.x, this.y, this.data);
    this.main.doShakeScreen();
  };

  Cell.prototype.update = function (time) {
    if (this.cellRefresh < 0) {
      return;
    }

    this.cellRefresh -= time.elapsed;
    if (this.cellRefresh > 0) {
      this.countdown.text = Math.round(this.cellRefresh / 1000);
    } else if (this.cellRefresh < 0) {
      this.nextLevel();
    }
  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].Cell = Cell;
})();
'use strict';

(function () {
  'use strict';

  function DungeonGenerator(size, tilemap) {
    this.tilemap = tilemap;
    console.log('tilemap?', tilemap);
    this.size = size || 10;
    this.TOPLEFTCORNER = 1;
    this.TOPWALL = 2;
    this.TOPRIGHTCORNER = 5;
    this.LEFTWALL = 6;
    this.RIGHTWALL = 10;
    this.BOTTOMLEFTCORNER = 20;
    this.BOTTOMRIGHTCORNER = 24;
    this.BOTTOMWALL = 21;
    this.SAFE = 14;
    // this is a comment
  }

  DungeonGenerator.TOPLEFTCORNER = 1;
  DungeonGenerator.TOPWALL = 2;
  DungeonGenerator.TOPRIGHTCORNER = 5;
  DungeonGenerator.LEFTWALL = 6;
  DungeonGenerator.RIGHTWALL = 10;
  DungeonGenerator.BOTTOMLEFTCORNER = 20;
  DungeonGenerator.BOTTOMRIGHTCORNER = 24;
  DungeonGenerator.BOTTOMWALL = 21;

  DungeonGenerator.prototype = {
    createSquare: function createSquare() {
      var data = [];
      for (var i = 0; i < this.size; i++) {
        data.push([]);
        for (var j = 0; j < this.size; j++) {
          //TOP WALL
          if (i === 0) {
            if (j === 0) {
              data[j][i] = this.TOPLEFTCORNER;
            } else if (j === this.size - 1) {
              data[i][j] = this.BOTTOMLEFTCORNER;
            } else {
              data[i][j] = this.LEFTWALL;
            }
          } else if (i === this.size - 1) {
            if (j === 0) {
              data[i][j] = this.TOPRIGHTCORNER;
            } else if (j === this.size - 1) {
              data[i][j] = this.BOTTOMRIGHTCORNER;
            } else {
              data[i][j] = this.RIGHTWALL;
            }
          } else {
            if (j === 0) {
              data[i][j] = this.TOPWALL;
            } else if (j === this.size - 1) {
              data[i][j] = this.BOTTOMWALL;
            } else {
              data[i][j] = this.SAFE;
            }
          }
        }
      }
      return data;
    },
    loadLevel: function loadLevel(level) {
      var row = level % 3;
      var col = Math.floor(level / 3);
      var data = [];
      for (var i = 0; i < this.size; i++) {
        data.push([]);
        for (var j = 0; j < this.size; j++) {
          var x = row * 10 + i;
          var y = col * 10 + j;
          data[i][j] = this.tilemap.getTile(x, y, 0).index;
        }
      }
      return data;
    }
  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].DungeonGenerator = DungeonGenerator;
})();
'use strict';

(function () {
  'use strict';

  function Grave(main, x, y) {
    Phaser.Sprite.call(this, main.game, x, y, 'grave');
    this.anchor.setTo(0.5, 0.5);
    this.animations.add('die', null, 10, false);
  }

  Grave.prototype = Object.create(Phaser.Sprite.prototype);
  Grave.prototype.constructor = Grave;

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].Grave = Grave;
})();
'use strict';

(function () {
  'use strict';

  var LEFT = 2,
      RIGHT = 0,
      DOWN = 1,
      UP = 3;

  var RED = 0xff0000,
      PINK = 0xff69b4,
      CYAN = 0x00ffff,
      ORANGE = 0xff0500;

  var types = ['shadow', 'speedy', 'bashful', 'pokey'];

  var ns = window['pacdungeon'];
  function MonsterAI(main, x, y, type) {
    Phaser.Sprite.call(this, main.game, x, y, 'ghost');
    this.debug = true;
    this.main = main;
    this.killCount = 0;
    this.speed = this.main.speed * 0.90;
    this.type = type || types[Math.floor(Math.random() * 4)];
    this.directions = [null, null, null, null, null];
    switch (this.type) {
      case 'shadow':
        this.tint = RED;
        break;
      case 'speedy':
        this.tint = PINK;
        break;
      case 'bashful':
        this.tint = CYAN;
        break;
      case 'pokey':
        this.tint = ORANGE;
        break;
    }

    this.animations.add('munch', [0, 1, 2, 3], 20, true);
    this.animations.play('munch');

    this.ghostEyes = new Phaser.Sprite(main.game, 0, 0, 'ghost-eyes');
    this.ghostEyes.frame = UP;
    this.ghostEyes.anchor.set(0.5);
    this.addChild(this.ghostEyes);

    this.marker = new Phaser.Point(0, 0);
    this.forwardMarker = new Phaser.Point(0, 0);

    this.current = Phaser.DOWN;
    this.nextDirection = Phaser.NONE;
    this.turnPoint = new Phaser.Point();
    this.futurePoint = new Phaser.Point();
    this.threshold = 3;

    this.targetFound = false;

    this.strategy = new ns.AIStrategy(main.pacman, this, main.safetile, main.opposites);
    this.strategy.setStrategy(this.type);

    this.changeDirection = false;
  }

  MonsterAI.prototype = Object.create(Phaser.Sprite.prototype);
  MonsterAI.prototype.constructor = MonsterAI;

  MonsterAI.prototype.move = function (direction) {
    var speed = this.speed;

    if (direction === Phaser.LEFT || direction === Phaser.UP) {
      speed = -speed;
    }

    if (direction === Phaser.LEFT || direction === Phaser.RIGHT) {
      this.body.velocity.x = speed;
    } else {
      this.body.velocity.y = speed;
    }

    //set the eyes
    if (direction === Phaser.UP) {
      this.ghostEyes.frame = UP;
    } else if (direction === Phaser.DOWN) {
      this.ghostEyes.frame = DOWN;
    } else if (direction === Phaser.LEFT) {
      this.ghostEyes.frame = LEFT;
    } else if (direction === Phaser.RIGHT) {
      this.ghostEyes.frame = RIGHT;
    }

    this.current = direction;
  };

  /**
  TODO: Use this to add nemesis system or something
  */
  MonsterAI.prototype.addKill = function (i) {
    this.killCount += i;
  };

  MonsterAI.prototype.getForward = function (marker) {
    if (this.current === Phaser.RIGHT) {
      marker.x += 1;
    } else if (this.current === Phaser.LEFT) {
      marker.x -= 1;
    } else if (this.current === Phaser.UP) {
      marker.y -= 1;
    } else if (this.current === Phaser.DOWN) {
      marker.y += 1;
    }
    return marker;
  };

  MonsterAI.prototype.feelForward = function () {
    this.marker.x = this.main.game.math.snapToFloor(Math.floor(this.x), this.main.gridsize) / this.main.gridsize;
    this.marker.y = this.main.game.math.snapToFloor(Math.floor(this.y), this.main.gridsize) / this.main.gridsize;

    //move marker forward (see forward)
    this.forwardMarker = this.getForward(new Phaser.Point(this.marker.x, this.marker.y));

    if (this.marker.x < 0 || this.marker.y < 0) {
      return;
    }
    this.futurePoint.x = this.forwardMarker.x * this.gridsize + this.gridsize / 2;
    this.futurePoint.y = this.forwardMarker.y * this.gridsize + this.gridsize / 2;
    this.turnPoint.x = this.forwardMarker.x * this.gridsize + this.gridsize / 2;
    this.turnPoint.y = this.forwardMarker.y * this.gridsize + this.gridsize / 2;

    //  Update our grid sensors
    this.directions[0] = this.main.map.getTile(this.forwardMarker.x, this.forwardMarker.y, this.main.layer.index);
    this.directions[1] = this.main.map.getTileLeft(this.main.layer.index, this.forwardMarker.x, this.forwardMarker.y);
    this.directions[2] = this.main.map.getTileRight(this.main.layer.index, this.forwardMarker.x, this.forwardMarker.y);
    this.directions[3] = this.main.map.getTileAbove(this.main.layer.index, this.forwardMarker.x, this.forwardMarker.y);
    this.directions[4] = this.main.map.getTileBelow(this.main.layer.index, this.forwardMarker.x, this.forwardMarker.y);

    //calculate next direction
    this.nextDirection = this.strategy.getNextDirection(this.directions, this.current);

    this.targetFound = true;
  };

  MonsterAI.prototype.turn = function () {

    // Grid align before turning
    this.x = this.turnPoint.x;
    this.y = this.turnPoint.y;

    this.body.reset(this.turnPoint.x, this.turnPoint.y);
  };

  MonsterAI.prototype.reachedGoal = function () {
    var cx = Math.floor(this.x);
    var cy = Math.floor(this.y);

    //if current position is almost equal to the turnpoint
    if (this.main.math.fuzzyEqual(cx, this.turnPoint.x, this.threshold) && this.main.math.fuzzyEqual(cy, this.turnPoint.y, this.threshold)) {
      return true;
    }
    return false;
  };

  MonsterAI.prototype.update = function () {
    //look for next direction if you don't have any
    if (!this.targetFound) {
      this.feelForward();
      this.move(this.current);
    }

    if (this.reachedGoal()) {
      //if you reached the goal, move to next goal based on nextDirection
      this.targetFound = false;
      this.turn();
      this.current = this.nextDirection;
    }
  };

  MonsterAI.prototype.render = function () {
    if (this.debug) {
      for (var t = 0; t < 5; t++) {
        if (this.directions[t] === null) {
          continue;
        }

        var color = 'rgba(0,255,0,0.3)';

        if (this.directions[t].index !== this.main.safetile) {
          color = 'rgba(255,0,0,0.3)';
        }

        if (t === this.current) {
          color = 'rgba(255,255,255,0.3)';
        }

        this.game.debug.geom(new Phaser.Rectangle(this.directions[t].worldX, this.directions[t].worldY, this.gridsize, this.gridsize), color, true);
      }
      // this.game.debug.geom(new Phaser.Line())
      this.game.debug.geom(new Phaser.Circle(this.turnPoint.x, this.turnPoint.y, 5), 'rgba(255,0,0,1)');
      // this.game.debug.geom(new Phaser.Circle(this.futurePoint.x, this.futurePoint.y, 5), 'rgba(0,255,0,1)');
      this.game.debug.geom(new Phaser.Circle(this.x, this.y, 5), 'rgba(0,0,0,1)');
      this.game.debug.geom(new Phaser.Circle(this.marker.x, this.marker.y, 5), 'rgba(0,255,0,1)');
      // this.game.debug.geom(new Phaser.Rectangle(this.body.x, this.body.y, this.body.width, this.body.height), 0xffffff, true);
      this.game.debug.body(this);
    }
  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].MonsterAI = MonsterAI;
})();
'use strict';

(function () {
  'use strict';

  function Pacman(main, x, y) {
    Phaser.Sprite.call(this, main.game, x, y, 'pacman');

    this.debug = true;

    this.main = main;

    this.speed = 100;
    this.threshold = 10;

    this.marker = new Phaser.Point();
    this.turnPoint = new Phaser.Point();

    this.current = Phaser.NONE;
    this.turning = Phaser.NONE;

    this.directions = [null, null, null, null, null];

    this.previousTarget = null;

    this.animations.add('munch', [0, 1, 2, 1], 20, true);
    this.animations.add('idle', [1], 20, true);
    this.play('munch');
  }

  Pacman.prototype = Object.create(Phaser.Sprite.prototype);
  Pacman.prototype.constructor = Pacman;

  Pacman.prototype.gotoLimbo = function () {
    this.angle = 0;
    this.x = -100;
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.inLimbo = true;
  };
  Pacman.prototype.resurrect = function () {
    this.inLimbo = false;
  };

  Pacman.prototype.getGridPosition = function () {
    return this.main.toGridPosition(this.x, this.y);
  };

  Pacman.prototype.getForwardPosition = function (howFar) {
    var marker = this.getGridPosition();
    if (this.current === Phaser.LEFT) {
      marker.x -= howFar;
    } else if (this.current === Phaser.RIGHT) {
      marker.x += howFar;
    } else if (this.current === Phaser.UP) {
      marker.y -= howFar;
    } else if (this.current === Phaser.DOWN) {
      marker.y += howFar;
    }

    return marker;
  };

  Pacman.prototype.move = function (direction) {
    var speed = this.speed;

    if (direction === Phaser.LEFT || direction === Phaser.UP) {
      speed = -speed;
    }

    if (direction === Phaser.LEFT || direction === Phaser.RIGHT) {
      this.body.velocity.x = speed;
    } else {
      this.body.velocity.y = speed;
    }

    //  Reset the scale and angle (Pacman is facing to the right in the sprite sheet)
    this.scale.x = 1;
    this.angle = 0;

    if (direction === Phaser.LEFT) {
      this.scale.x = -1;
    } else if (direction === Phaser.UP) {
      this.angle = 270;
    } else if (direction === Phaser.DOWN) {
      this.angle = 90;
    }

    this.current = direction;
  };

  Pacman.prototype.turn = function () {
    var cx = Math.floor(this.x);
    var cy = Math.floor(this.y);

    //  This needs a threshold, because at high speeds you can't turn because the coordinates skip past
    if (!this.main.math.fuzzyEqual(cx, this.turnPoint.x, this.threshold) || !this.main.math.fuzzyEqual(cy, this.turnPoint.y, this.threshold)) {
      return false;
    }

    //  Grid align before turning
    this.x = this.turnPoint.x;
    this.y = this.turnPoint.y;

    this.body.reset(this.turnPoint.x, this.turnPoint.y);

    this.move(this.turning);

    this.turning = Phaser.NONE;

    return true;
  };

  Pacman.prototype.checkDirection = function (turnTo) {
    if (this.turning === turnTo || this.directions[turnTo] === null || this.directions[turnTo].index !== this.main.safetile) {
      //  Invalid direction if they're already set to turn that way
      //  Or there is no tile there, or the tile isn't index 1 (a floor tile)
      return;
    }

    //  Check if they want to turn around and can
    if (this.current === this.main.opposites[turnTo]) {
      this.move(turnTo);
    } else {
      this.turning = turnTo;

      this.turnPoint.x = this.marker.x * this.main.gridsize + this.main.gridsize / 2;
      this.turnPoint.y = this.marker.y * this.main.gridsize + this.main.gridsize / 2;
    }
  };

  Pacman.prototype.update = function () {};

  Pacman.prototype.render = function () {
    if (this.debug) {
      for (var t = 1; t < 5; t++) {
        if (this.directions[t] === null) {
          continue;
        }

        var color = 'rgba(0,255,0,0.3)';

        if (this.directions[t].index !== this.main.safetile) {
          color = 'rgba(255,0,0,0.3)';
          // console.log('Tile is: ', this.directions[t].index);
        }

        if (t === this.current) {
          color = 'rgba(255,255,255,0.3)';
        }
        this.main.game.debug.body(this);
        // this.main.game.debug.geom(new Phaser.Rectangle(this.directions[t].worldX, this.directions[t].worldY, this.main.gridsize, this.main.gridsize), color, true);
      }
    }
  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].Pacman = Pacman;
})();
'use strict';

(function () {
  'use strict';

  function Boot() {}

  Boot.prototype = {

    preload: function preload() {
      this.load.image('preloader', 'assets/preloader.gif');
    },

    create: function create() {
      this.game.input.maxPointers = 1;

      if (this.game.device.desktop) {
        this.game.scale.pageAlignHorizontally = true;
      } else {
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.scale.minWidth = 480;
        this.game.scale.minHeight = 260;
        this.game.scale.maxWidth = 640;
        this.game.scale.maxHeight = 480;
        this.game.scale.forceOrientation(true);
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.setScreenSize(true);
      }
      this.game.state.start('preloader');
    }
  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].Boot = Boot;
})();
'use strict';

(function () {
  'use strict';

  var ns = window['pacdungeon'];
  var that;

  function Game() {
    that = this;
    this.livesLeft = 3;
    this.offset = new Phaser.Point(-30, -30);
    this.map = null;
    this.layers = [];
    this.layer = null;
    this.ghostLayer = null;
    this.pacman = null;
    this.resurrectTimer = 0;
    this.resurrectPoint = new Phaser.Point(0, 0);
    this.resurrectCell = new Phaser.Point(0, 0);
    this.monsters = null;
    this.graves = null;
    this.safetile = 14;
    this.gridsize = 16;

    this.scoreTxt = null;
    this.livesGroup = null;

    this.speed = 100;
    this.size = 10;
    this.squareSize = 3;

    this.DungeonGenerator = null;
    this.cells = [[null, null, null], [null, null, null], [null, null, null]];
    this.timerContainer = null;

    this.opposites = [Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP];

    this.score = 0;
    this.teleportZone = new Phaser.Point(0, 0);
    this.activeZone = new Phaser.Point(0, 0);
    //flag if pacman jumped and hasn't moved yet
    this.isFreshJump = false;

    this.graphics = null;

    this.teleportEmitter = null;
    this.appearEmitter = null;
    this.shakeWorld = 0;

    this.c1 = new Phaser.Point();
    this.c2 = new Phaser.Point();
  }

  Game.prototype = {

    create: function create() {
      this.game.world.setBounds(this.offset.x, this.offset.y, this.game.width, this.game.height); // normalize after shake?

      this.stage.backgroundColor = '#2d2d2d';

      this.map = this.add.tilemap();
      this.map.addTilesetImage('tiles', 'tiles', 16, 16, 0, 0, 1);
      this.layer = this.map.create('main', this.size * 4, this.size * 4, 16, 16);
      this.ghostLayer = this.map.createBlankLayer('ghostLayer', this.size * 4, this.size * 4, 16, 16);

      this.timerContainer = this.add.group();

      this.graves = this.add.group();

      var levelTilemap = this.game.add.tilemap('levels');
      this.DungeonGenerator = new ns.DungeonGenerator(this.size, levelTilemap);

      var i = 0,
          j = 0;
      for (i = 0; i < this.squareSize; i++) {
        for (j = 0; j < this.squareSize; j++) {
          var level = this.DungeonGenerator.loadLevel(0);
          var cellData = this.createCellData(i, j, level);
          this.cells[i][j] = new ns.Cell(i, j, cellData, this.timerContainer, this);
        }
      }

      this.timerContainer = this.add.group();

      this.createGhostPrison();
      this.ghostLayer.visible = false;
      this.map.setLayer(this.layer);

      this.dots = this.add.physicsGroup();
      this.map.createFromTiles(7, this.safetile, 'dot', this.layer, this.dots);

      //  The dots will need to be offset by 6px to put them back in the middle of the grid
      this.dots.setAll('x', 6, false, false, 1);
      this.dots.setAll('y', 6, false, false, 1);

      //add dots to Cells
      var setDotPosition = function setDotPosition(cell) {
        return function (d) {
          var gPosition = this.toGridPosition(d.x, d.y);
          var cPosition = this.toCellPosition(gPosition.x, gPosition.y);
          if (cell.x === cPosition.x && cell.y === cPosition.y) {
            cell.dots.push(d);
          }
        };
      };
      for (i = 0; i < this.cells.length; i++) {
        for (j = 0; j < this.cells[i].length; j++) {
          var cell = this.cells[j][i];
          this.dots.forEach(setDotPosition(cell), this);
        }
      }

      //  Pacman should collide with everything except the safe tile
      this.map.setCollisionByExclusion([this.safetile], true, this.layer);
      // Ghosts should collide with the ghost layer
      this.map.setCollisionByExclusion([this.safetile], true, this.ghostLayer);

      this.graphics = this.add.graphics(0, 0);

      this.monsters = this.add.group();

      this.createPacman(this.squareSize * 16 + 8, this.squareSize * 16 + 8);

      this.livesGroup = this.add.group();
      this.updateLives();

      //spawn 2 monsters
      this.spawnMonsters(['shadow', 'speedy']);

      //create 3 graves
      for (i = 0; i < 3; i++) {
        var grave = new ns.Grave(this, i * 30, 160 * 3);
        grave.kill();
        this.graves.add(grave);
      }

      this.physics.arcade.enable(this.pacman);
      this.pacman.body.setSize(16, 16, 0, 0);
      // this.jumpToSquare(0, 0);
      this.pacman.gotoLimbo();

      this.cursors = this.input.keyboard.createCursorKeys();

      this.input.keyboard.onUpCallback = function (event) {
        if (that.pacman.inLimbo) {
          //Do the selection screen
          that.moveLimbo(event);
        } else {
          if (event.keyCode === Phaser.Keyboard.SPACEBAR) {
            that.teleport();
          } else if (event.keyCode === Phaser.Keyboard.UP) {
            that.updateTeleportZone(Phaser.UP);
          } else if (event.keyCode === Phaser.Keyboard.DOWN) {
            that.updateTeleportZone(Phaser.DOWN);
          } else if (event.keyCode === Phaser.Keyboard.LEFT) {
            that.updateTeleportZone(Phaser.LEFT);
          } else if (event.keyCode === Phaser.Keyboard.RIGHT) {
            that.updateTeleportZone(Phaser.RIGHT);
          } else if (event.keyCode === Phaser.Keyboard.Z) {
            that.toggleDebug();
          }
        }
      };

      this.pacman.move(Phaser.LEFT);

      this.teleportEmitter = this.add.emitter();
      this.appearEmitter = this.add.emitter();
      var initEmitter = function initEmitter(emitter) {
        emitter.makeParticles('pacman', [0, 1, 2]);
        emitter.maxParticleScale = 0.1;
        emitter.minParticleScale = 0.01;
        emitter.width = 20;
        emitter.setYSpeed(-20, -100);
        emitter.setXSpeed(-5, 5);
        emitter.gravity = -200;
      };

      initEmitter(this.teleportEmitter);
      initEmitter(this.appearEmitter);
      this.appearEmitter.setYSpeed(100, -20);
      this.appearEmitter.gravity = 200;

      this.scoreTxt = this.add.bitmapText(0, 0, 'minecraftia', '0');
      this.scoreTxt.align = 'left';
      this.scoreTxt.x = 0;
      this.scoreTxt.y = -40;
    },

    updateLives: function updateLives() {
      //remove all sprites
      this.livesGroup.removeAll();
      for (var i = 0; i < this.livesLeft; i++) {
        var spr = new ns.Pacman(this, i * 30, 160 * 3);
        spr.play('idle');
        this.livesGroup.add(spr);
      }
    },

    moveLimbo: function moveLimbo(event) {
      if (event.keyCode === Phaser.Keyboard.SPACEBAR) {
        //resurrect here
        that.resurrect();
      } else if (event.keyCode === Phaser.Keyboard.UP) {
        that.updateResurrectZone(Phaser.UP);
      } else if (event.keyCode === Phaser.Keyboard.DOWN) {
        that.updateResurrectZone(Phaser.DOWN);
      } else if (event.keyCode === Phaser.Keyboard.LEFT) {
        that.updateResurrectZone(Phaser.LEFT);
      } else if (event.keyCode === Phaser.Keyboard.RIGHT) {
        that.updateResurrectZone(Phaser.RIGHT);
      } else if (event.keyCode === Phaser.Keyboard.Z) {
        that.toggleDebug();
      }
    },

    createDot: function createDot() {
      var dot = this.add.sprite(0, 0, 'dot', this.dots);
      this.dots.add(dot);
      return dot;
    },

    createCellData: function createCellData(row, col, level) {
      for (var i = 0; i < this.size; i++) {
        for (var j = 0; j < this.size; j++) {
          this.map.putTile(level[j][i], row * this.size + j, col * this.size + i, this.layer);
        }
      }
      return level;
    },

    createGhostPrison: function createGhostPrison() {
      var width = this.size * 3;
      var height = this.size * 3;
      for (var i = 0; i < width; i++) {
        this.map.putTile(this.DungeonGenerator.TOPWALL, i, 0, this.ghostLayer);
        this.map.putTile(this.DungeonGenerator.BOTTOMWALL, i, height - 1, this.ghostLayer);
      }
      for (var j = 0; j < height; j++) {
        this.map.putTile(this.DungeonGenerator.RIGHTWALL, 0, j, this.ghostLayer);
        this.map.putTile(this.DungeonGenerator.LEFTWALL, width - 1, j, this.ghostLayer);
      }
    },

    pickRandomSquare: function pickRandomSquare() {
      var row = Math.floor(Math.random() * this.squareSize);
      var col = Math.floor(Math.random() * this.squareSize);
      return {
        row: row,
        col: col
      };
    },

    resurrect: function resurrect() {
      this.livesLeft -= 1;
      this.updateLives();
      this.moveToSquare(this.resurrectCell.x, this.resurrectCell.y);
      var targetPosition = this.toWorldPosition(this.resurrectCell.x, this.resurrectCell.y, this.resurrectPoint.x, this.resurrectPoint.y);
      this.pacman.x = targetPosition.x;
      this.pacman.y = targetPosition.y;
      this.pacman.resurrect();
    },

    teleport: function teleport() {
      this.teleportEmitter.x = this.pacman.x;
      this.teleportEmitter.y = this.pacman.y;
      this.teleportEmitter.start(true, 250, null, 20);
      this.jumpToSquare(this.teleportZone.x, this.teleportZone.y);
      this.appearEmitter.x = this.pacman.x;
      this.appearEmitter.y = this.pacman.y - 15;
      this.appearEmitter.start(true, 250, null, 20);
    },

    createPacman: function createPacman(x, y) {
      this.pacman = new ns.Pacman(this, x, y);
      this.game.add.existing(this.pacman);
    },

    spawnMonsters: function spawnMonsters(types) {
      for (var i = 0; i < types.length; i++) {
        //pick random col and row
        var pos = this.pickRandomSquare();
        var p = this.toWorldPosition(pos.row, pos.col, 6, 7);
        this.createMonster(p.x, p.y, types[i]);
      }
    },

    createMonster: function createMonster(x, y, type) {
      var monster = new ns.MonsterAI(this, x, y, type);
      monster.player = this.pacman;
      monster.layer = this.layer;
      monster.gridsize = this.gridsize;
      monster.map = this.map;
      this.physics.arcade.enable(monster);
      //add it to the group immediately
      monster.body.setSize(16, 16, 0, 0);
      monster.anchor.set(0.5);
      monster.move(Phaser.DOWN);
      this.monsters.add(monster);

      return monster;
    },

    toWorldPosition: function toWorldPosition(cellRow, cellCol, row, col) {
      //+8 is the offset
      return new Phaser.Point(16 * row + 8 + cellRow * this.size * this.gridsize, 16 * col + 8 + cellCol * this.size * this.gridsize);
    },

    toGridPosition: function toGridPosition(x, y) {
      var marker = new Phaser.Point();
      marker.x = this.math.snapToFloor(Math.floor(x), this.gridsize) / this.gridsize;
      marker.y = this.math.snapToFloor(Math.floor(y), this.gridsize) / this.gridsize;
      return marker;
    },

    toCellPosition: function toCellPosition(gridX, gridY) {
      var marker = new Phaser.Point();
      marker.x = Math.floor(gridX / this.size);
      marker.y = Math.floor(gridY / this.size);
      return marker;
    },

    getJumpTargetPosition: function getJumpTargetPosition() {
      var marker = this.pacman.getGridPosition();
      var targetPosition = this.toWorldPosition(this.teleportZone.x, this.teleportZone.y, marker.x % 10, marker.y % 10);
      var targetGridPosition = this.toGridPosition(targetPosition.x, targetPosition.y);
      //target position is not clear,
      //something
      var tile = this.map.getTile(targetGridPosition.x, targetGridPosition.y, 0);
      if (tile.index !== this.safetile && this.pacman.previousTarget) {
        targetPosition = this.pacman.previousTarget;
      } else {
        this.pacman.previousTarget = targetPosition;
      }
      return targetPosition;
    },

    jumpToSquare: function jumpToSquare(row, col) {
      //  Position Pacman at grid location 14x17 (the +8 accounts for his anchor)
      var targetPosition = this.getJumpTargetPosition();
      this.pacman.x = targetPosition.x;
      this.pacman.y = targetPosition.y;

      this.moveToSquare(row, col);
    },

    moveToSquare: function moveToSquare(row, col) {
      this.teleportZone.x = this.activeZone.x;
      this.teleportZone.y = this.activeZone.y;
      this.activeZone.x = row;
      this.activeZone.y = col;
      this.isFreshJump = true;

      this.pacman.anchor.set(0.5);

      // this.move(this.turning);
      //move to square based on angle
      this.pacman.current = Phaser.NONE;
    },

    checkKeys: function checkKeys() {

      if (this.cursors.left.isDown && this.pacman.current !== Phaser.LEFT) {
        this.pacman.checkDirection(Phaser.LEFT);
      } else if (this.cursors.right.isDown && this.pacman.current !== Phaser.RIGHT) {
        this.pacman.checkDirection(Phaser.RIGHT);
      } else if (this.cursors.up.isDown && this.pacman.current !== Phaser.UP) {
        this.pacman.checkDirection(Phaser.UP);
      } else if (this.cursors.down.isDown && this.pacman.current !== Phaser.DOWN) {
        this.pacman.checkDirection(Phaser.DOWN);
      } else {
        //  This forces them to hold the key down to turn the corner
        this.pacman.turning = Phaser.NONE;
      }
    },

    updateResurrectPoint: function updateResurrectPoint() {
      this.resurrectTimer++;
      var moveToNextTile = function moveToNextTile() {
        this.resurrectPoint.x++;
        if (this.resurrectPoint.x > 8) {
          this.resurrectPoint.x = 1;
          this.resurrectPoint.y++;
          if (this.resurrectPoint.y > 8) {
            this.resurrectPoint.x = 1;
            this.resurrectPoint.y = 1;
          }
        }

        //check if resurrect point is dead
        var targetGridPosition = new Phaser.Point(this.resurrectCell.x * this.size + this.resurrectPoint.x, this.resurrectCell.y * this.size + this.resurrectPoint.y);
        var tile = this.map.getTile(targetGridPosition.x, targetGridPosition.y, 0);
        if (tile.index !== this.safetile) {
          moveToNextTile.call(this);
        }
      };
      if (this.resurrectTimer > 5) {
        this.resurrectTimer = 0;
        //move to next tile
        moveToNextTile.call(this);
      }
    },

    updateResurrectZone: function updateResurrectZone(direction) {
      var next = new Phaser.Point(this.resurrectCell.x, this.resurrectCell.y);
      console.log('Updating resurrect zone');
      if (direction === Phaser.LEFT) {
        next.x--;
      } else if (direction === Phaser.RIGHT) {
        next.x++;
      } else if (direction === Phaser.UP) {
        next.y--;
      } else if (direction === Phaser.DOWN) {
        next.y++;
      }

      if (next.x > 2) {
        next.x = 2;
      } else if (next.x < 0) {
        next.x = 0;
      }

      if (next.y > 2) {
        next.y = 2;
      } else if (next.y < 0) {
        next.y = 0;
      }
      this.resurrectCell.x = next.x;
      this.resurrectCell.y = next.y;
    },

    updateTeleportZone: function updateTeleportZone(direction) {
      //if freshjump, the next zone should be relative to the active zone
      if (this.isFreshJump) {
        this.teleportZone.x = this.activeZone.x;
        this.teleportZone.y = this.activeZone.y;
        this.isFreshJump = false;
      }

      var next = new Phaser.Point(this.teleportZone.x, this.teleportZone.y);

      //if direction lands you on the same active cell, try the one next to it
      var tryNextCell = function tryNextCell(n, effect) {
        if (Phaser.Point.equals(n, this.activeZone)) {
          return effect;
        }
        return 0;
      };
      if (direction === Phaser.LEFT) {
        next.x--;
        next.x += tryNextCell.call(this, next, -1);
      } else if (direction === Phaser.RIGHT) {
        next.x++;
        next.x += tryNextCell.call(this, next, 1);
      } else if (direction === Phaser.DOWN) {
        next.y++;
        next.y += tryNextCell.call(this, next, 1);
      } else if (direction === Phaser.UP) {
        next.y--;
        next.y += tryNextCell.call(this, next, -1);
      }

      //
      var prevZone = new Phaser.Point(this.teleportZone.x, this.teleportZone.y);
      this.teleportZone.copyFrom(next);

      this.clipTeleportZone();

      if (this.teleportZone.x === this.activeZone.x && this.teleportZone.y === this.activeZone.y) {
        this.teleportZone.x = prevZone.x;
        this.teleportZone.y = prevZone.y;
      }

      this.clipTeleportZone();
    },

    clipTeleportZone: function clipTeleportZone() {
      if (this.teleportZone.x < 0) {
        this.teleportZone.x = 0;
      } else if (this.teleportZone.x > this.squareSize - 1) {
        this.teleportZone.x = this.squareSize - 1;
      }

      if (this.teleportZone.y < 0) {
        this.teleportZone.y = 0;
      } else if (this.teleportZone.y > this.squareSize - 1) {
        this.teleportZone.y = this.squareSize - 1;
      }
    },

    eatDot: function eatDot(pacman, dot) {

      dot.kill();

      this.score += 10;
      this.scoreTxt.text = this.score;

      //get dots in this area
      this.isCellCleared(dot);
    },

    isCellCleared: function isCellCleared(dot) {
      var position = this.toGridPosition(dot.x, dot.y);
      var cellPosition = this.toCellPosition(position.x, position.y);
      this.cells[cellPosition.x][cellPosition.y].isCleared();
    },

    touchMonsters: function touchMonsters(pacman, monster) {
      if (!this.pacman.inLimbo) {
        monster.addKill(1);
        //put a grave here
        var grave = this.graves.getFirstDead();
        grave.revive();
        grave.play('die').setFrame(0);
        grave.x = pacman.x;
        grave.y = pacman.y;
        //pacman is in limbo
        pacman.gotoLimbo();
        this.graphics.clear();
        this.resurrectCell.x = this.activeZone.x;
        this.resurrectCell.y = this.activeZone.y;
        this.resurrectPoint.x = 1;
        this.resurrectPoint.y = 1;
      }
    },

    doShakeScreen: function doShakeScreen() {
      this.shakeWorld = 30;
    },

    shakeScreen: function shakeScreen() {
      if (this.shakeWorld > 0) {
        var rand1 = this.rnd.integerInRange(this.offset.x - 5, this.offset.x + 5);
        var rand2 = this.rnd.integerInRange(this.offset.y - 5, this.offset.y + 5);
        this.game.world.setBounds(rand1, rand2, this.game.width + rand1, this.game.height + rand2);
        this.shakeWorld--;
        if (this.shakeWorld === 0) {
          this.game.world.setBounds(this.offset.x, this.offset.y, this.game.width, this.game.height); // normalize after shake?
        }
      }
    },

    drawTeleportPath: function drawTeleportPath() {
      // set a fill and line style again
      this.graphics.clear();
      this.graphics.lineStyle(1, 0xFF0000, 0.8);

      // draw a second shape
      var targetPosition = this.getJumpTargetPosition();
      this.graphics.moveTo(this.pacman.x, this.pacman.y);
      //calculate control points
      this.c1.x = this.pacman.x;
      this.c1.y = this.pacman.y - 15;
      this.c2.x = targetPosition.x;
      this.c2.y = targetPosition.y - 15;

      if (this.pacman.y > targetPosition.y) {
        this.c1.y = targetPosition.y;
      } else if (this.pacman.y === targetPosition.y) {
        this.c1.y -= 30;
        this.c2.y -= 30;
      } else {
        this.c2.y = this.pacman.y;
      }
      this.graphics.bezierCurveTo(this.c1.x, this.c1.y, this.c2.x, this.c2.y, targetPosition.x, targetPosition.y);
    },

    update: function update(game) {
      this.physics.arcade.collide(this.monsters, this.ghostLayer);
      this.physics.arcade.collide(this.pacman, this.layer);
      this.physics.arcade.overlap(this.pacman, this.dots, this.eatDot, null, this);
      if (this.pacman.alive) {
        this.physics.arcade.overlap(this.pacman, this.monsters, this.touchMonsters, null, this);
      }

      this.pacman.marker = this.pacman.getGridPosition();

      if (this.pacman.inLimbo) {
        //move resurrect point
        this.updateResurrectPoint();
      }

      if (this.pacman.marker.x < 0 || this.pacman.marker.y < 0) {
        return;
      }
      //  Update our grid sensors
      var index = this.map.getLayer(this.layer);
      this.pacman.directions[1] = this.map.getTileLeft(index, this.pacman.marker.x, this.pacman.marker.y);
      this.pacman.directions[2] = this.map.getTileRight(index, this.pacman.marker.x, this.pacman.marker.y);
      this.pacman.directions[3] = this.map.getTileAbove(index, this.pacman.marker.x, this.pacman.marker.y);
      this.pacman.directions[4] = this.map.getTileBelow(index, this.pacman.marker.x, this.pacman.marker.y);

      this.checkKeys();

      if (this.pacman.turning !== Phaser.NONE) {
        this.pacman.turn();
      }

      for (var i = 0; i < this.cells.length; i++) {
        for (var j = 0; j < this.cells[i].length; j++) {
          this.cells[i][j].update(game.time);
        }
      }

      this.drawTeleportPath();

      this.shakeScreen();
    },
    render: function render() {
      this.monsters.callAll('render');
      this.pacman.render();

      if (this.pacman.inLimbo) {
        var pos = this.toWorldPosition(this.resurrectCell.x, this.resurrectCell.y, this.resurrectPoint.x, this.resurrectPoint.y);
        this.game.debug.geom(new Phaser.Rectangle(pos.x - this.gridsize / 2, pos.y - this.gridsize / 2, this.gridsize, this.gridsize), 'rgba(120,120,120,0.5)', true);
      }
    },
    toggleDebug: function toggleDebug() {
      this.monsters.forEach(function (m) {
        m.debug = !m.debug;
      });
      this.pacman.debug = !this.pacman.debug;
      this.game.debug.reset();
    }

  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].Game = Game;
})();
'use strict';

window.onload = function () {
  'use strict';

  var game,
      ns = window['pacdungeon'];

  game = new Phaser.Game(640, 640, Phaser.AUTO, 'pacdungeon-game');
  game.state.add('boot', ns.Boot);
  game.state.add('preloader', ns.Preloader);
  game.state.add('menu', ns.Menu);
  game.state.add('game', ns.Game);
  /* yo phaser:state new-state-files-put-here */

  game.state.start('boot');
};
'use strict';

(function () {
  'use strict';

  function Menu() {
    this.titleTxt = null;
    this.startTxt = null;
  }

  Menu.prototype = {

    create: function create() {
      var x = this.game.width / 2,
          y = this.game.height / 2;

      this.titleTxt = this.add.bitmapText(x, y, 'minecraftia', 'Yo, Pacman with a Teleporter!');
      this.titleTxt.align = 'center';
      this.titleTxt.x = this.game.width / 2 - this.titleTxt.textWidth / 2;
      //
      y = y + this.titleTxt.height + 5;
      this.startTxt = this.add.bitmapText(x, y, 'minecraftia', 'START');
      this.startTxt.align = 'center';
      this.startTxt.x = this.game.width / 2 - this.startTxt.textWidth / 2;

      this.input.onDown.add(this.onDown, this);
    },

    update: function update() {},

    onDown: function onDown() {
      var tween = this.game.add.tween(this.titleTxt);
      tween.to({ x: -900 }, 300);

      tween.onComplete.addOnce(function () {
        this.game.state.start('game');
      }, this);

      tween.start();
    }
  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].Menu = Menu;
})();
'use strict';

(function () {
  'use strict';

  function Preloader() {
    this.asset = null;
    this.ready = false;
  }

  Preloader.prototype = {

    preload: function preload() {
      this.asset = this.add.sprite(this.game.width * 0.5 - 110, this.game.height * 0.5 - 10, 'preloader');

      this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
      this.load.setPreloadSprite(this.asset);

      this.loadResources();
    },

    loadResources: function loadResources() {
      this.load.bitmapFont('minecraftia', 'assets/minecraftia.png', 'assets/minecraftia.xml');
      this.load.spritesheet('ghost', 'assets/ghosts.png', 32, 32);
      this.load.spritesheet('ghost-eyes', 'assets/ghost-eyes.png', 32, 32);
      this.load.image('dot', 'assets/dot.png');
      this.load.image('tiles', 'assets/pacman-tiles.png');
      this.load.spritesheet('pacman', 'assets/pacman.png', 32, 32);
      this.load.spritesheet('grave', 'assets/grave.png', 32, 32);
      this.load.tilemap('map', 'assets/pacman-small.json', null, Phaser.Tilemap.TILED_JSON);
      this.load.tilemap('levels', 'assets/pacman-maze.json', null, Phaser.Tilemap.TILED_JSON);
    },

    create: function create() {
      this.asset.cropEnabled = false;
    },

    update: function update() {
      if (!!this.ready) {
        this.game.state.start('menu');
      }
    },

    onLoadComplete: function onLoadComplete() {
      this.ready = true;
    }
  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].Preloader = Preloader;
})();
//# sourceMappingURL=all.js.map