(function() {
  'use strict';

  var ns = window['pacdungeon'];
  var that;

  function Game() {
    that = this;
    this.map = null;
    this.layers = [];
    this.layer = null;
    this.ghostLayer = null;
    this.pacman = null;
    this.monsters = null;

    this.safetile = 14;
    this.gridsize = 16;

    this.speed = 100;
    this.size = 10;
    this.squareSize = 3;

    this.DungeonGenerator = new ns.DungeonGenerator(this.size);
    this.cells = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
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

    create: function() {
      this.stage.backgroundColor = '#2d2d2d';

      this.map = this.add.tilemap();
      this.map.addTilesetImage('tiles', 'tiles', 16, 16, 0, 0, 1);
      this.layer = this.map.create('main', this.size * 4, this.size * 4, 16, 16);
      this.ghostLayer = this.map.createBlankLayer('ghostLayer', this.size * 4, this.size * 4, 16, 16);

      this.timerContainer = this.add.group();

      var i = 0, j = 0;
      for (i = 0; i < this.squareSize; i++) {
        for (j = 0; j < this.squareSize; j++) {
          var level = this.DungeonGenerator.createCross();
          var cellData = this.createCellData(i, j, level);
          this.cells[i][j] = new ns.Cell(i,j,cellData, this.timerContainer, this);
        }
      }

      this.createGhostPrison();
      this.ghostLayer.visible = false;
      this.map.setLayer(this.layer);

      this.dots = this.add.physicsGroup();
      this.map.createFromTiles(14, this.safetile, 'dot', this.layer, this.dots);

      //  The dots will need to be offset by 6px to put them back in the middle of the grid
      this.dots.setAll('x', 6, false, false, 1);
      this.dots.setAll('y', 6, false, false, 1);

      //add dots to Cells
      for(i = 0; i < this.cells.length; i++){
        for(j = 0; j < this.cells[i].length; j++){
          var cell = this.cells[j][i];
          this.dots.forEach(function(d){
            var gPosition = this.toGridPosition(d.x, d.y);
            var cPosition = this.toCellPosition(gPosition.x, gPosition.y);
            if(cell.x === cPosition.x && cell.y === cPosition.y){
              // d.alive = true;
              cell.dots.push(d);
            }
          }, this);
        }
      }

      //  Pacman should collide with everything except the safe tile
      this.map.setCollisionByExclusion([this.safetile], true, this.layer);
      // Ghosts should collide with the ghost layer
      this.map.setCollisionByExclusion([this.safetile], true, this.ghostLayer);
      console.log(this.map);
      this.graphics = this.add.graphics(0, 0);

      this.monsters = this.add.group();

      this.createPacman((this.squareSize * 16) + 8, (this.squareSize * 16) + 8);



      //spawn 2 monsters
      this.spawnMonsters(['shadow']);//, 'speedy']);

      this.physics.arcade.enable(this.pacman);
      this.pacman.body.setSize(16, 16, 0, 0);
      this.moveToSquare(0, 0);

      this.cursors = this.input.keyboard.createCursorKeys();

      this.input.keyboard.onUpCallback = function(event) {
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
        }
      };

      this.pacman.animations.add('munch', [0, 1, 2, 1], 20, true);
      this.pacman.play('munch');
      this.pacman.move(Phaser.LEFT);

      this.teleportEmitter = this.add.emitter();
      this.appearEmitter = this.add.emitter();
      var initEmitter = function(emitter) {
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

    },

    createDot: function(){
      var dot = this.add.sprite(0,0,'dot',this.dots);
      this.dots.add(dot);
      return dot;
    },

    createCellData: function(row, col, level) {
      for (var i = 0; i < this.size; i++) {
        for (var j = 0; j < this.size; j++) {
          this.map.putTile(level[j][i], (row * this.size) + j, (col * this.size) + i, this.layer);
        }
      }
      return level;
    },

    createGhostPrison: function(){
      var width = this.size * 3;
      var height = this.size * 3;
      for(var i = 0; i < width; i++){
        this.map.putTile(this.DungeonGenerator.TOPWALL, i, 0, this.ghostLayer);
        this.map.putTile(this.DungeonGenerator.BOTTOMWALL, i, height-1, this.ghostLayer);
      }
      for(var j = 0; j < height; j++){
        this.map.putTile(this.DungeonGenerator.RIGHTWALL, 0, j, this.ghostLayer);
        this.map.putTile(this.DungeonGenerator.LEFTWALL, width-1, j, this.ghostLayer);
      }
    },

    pickRandomSquare: function() {
      var row = Math.floor(Math.random() * (this.squareSize));
      var col = Math.floor(Math.random() * (this.squareSize));
      return {
        row: row,
        col: col
      };
    },

    teleport: function() {
      this.teleportEmitter.x = this.pacman.x;
      this.teleportEmitter.y = this.pacman.y;
      this.teleportEmitter.start(true, 250, null, 20);
      this.moveToSquare(this.teleportZone.x, this.teleportZone.y);
      this.appearEmitter.x = this.pacman.x;
      this.appearEmitter.y = this.pacman.y - 15;
      this.appearEmitter.start(true, 250, null, 20);
    },

    createPacman: function(x, y) {
      this.pacman = new ns.Pacman(this, x, y);
      // this.game.add(this.pacman);
      this.game.add.existing(this.pacman);
    },

    spawnMonsters: function(types) {
      for (var i = 0; i < types.length; i++) {
        //pick random col and row

        var pos = this.pickRandomSquare();
        var p = this.toWorldPosition(pos.row, pos.col, 6, 7);
        console.log('Spawning ...', pos);
        this.createMonster(p.x, p.y, types[i]);
      }
    },

    createMonster: function(x, y, type) {
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

    toWorldPosition: function(cellRow, cellCol, row, col) {
      //+8 is the offset
      return new Phaser.Point(
        (16 * (row)) + 8 + (cellRow * this.size * this.gridsize), (16 * (col)) + 8 + (cellCol * this.size * this.gridsize)
      );
    },

    toGridPosition: function(x,y){
      var marker = new Phaser.Point();
      marker.x = this.math.snapToFloor(Math.floor(x), this.gridsize) / this.gridsize;
      marker.y = this.math.snapToFloor(Math.floor(y), this.gridsize) / this.gridsize;
      return marker;
    },

    toCellPosition: function(gridX, gridY){
      var marker = new Phaser.Point();
      marker.x =Math.floor(gridX / this.size);
      marker.y = Math.floor(gridY / this.size);
      return marker;
    },

    getJumpTargetPosition: function() {
      var marker = this.pacman.getGridPosition();
      return this.toWorldPosition(this.teleportZone.x, this.teleportZone.y, marker.x % 10, marker.y % 10);
    },

    moveToSquare: function(row, col) {
      //  Position Pacman at grid location 14x17 (the +8 accounts for his anchor)
      var marker = this.pacman.getGridPosition();

      var p = this.toWorldPosition(row, col, marker.x % 10, marker.y % 10);
      this.pacman.x = p.x;
      this.pacman.y = p.y;

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

    checkKeys: function() {

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

    updateTeleportZone: function(direction) {
      var next = new Phaser.Point(0, 0);
      if (direction === Phaser.LEFT) {
        next.x--;
      } else if (direction === Phaser.RIGHT) {
        next.x++;
      } else if (direction === Phaser.DOWN) {
        next.y++;
      } else if (direction === Phaser.UP) {
        next.y--;
      }

      var prevZone = new Phaser.Point(this.teleportZone.x, this.teleportZone.y);
      if (this.isFreshJump) {
        this.teleportZone.x = this.activeZone.x;
        this.teleportZone.y = this.activeZone.y;
        this.isFreshJump = false;
      }

      this.teleportZone.x += next.x;
      this.teleportZone.y += next.y;

      this.clipTeleportZone();

      if (this.teleportZone.x === this.activeZone.x &&
        this.teleportZone.y === this.activeZone.y) {
        this.teleportZone.x = prevZone.x;
        this.teleportZone.y = prevZone.y;
      }

      this.clipTeleportZone();


      // console.log('Teleport Zone:', this.teleportZone.x + ',' + this.teleportZone.y);
    },

    clipTeleportZone: function() {
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

    eatDot: function(pacman, dot) {

      dot.kill();

      this.score++;

      //get dots in this area
      this.isCellCleared(dot);

      // if (cell) {
      //   //TODO: add a timer to this cell
      //   this.reviveCell(cell);
      // }

    },

    isCellCleared: function(dot){
      var position = this.toGridPosition(dot.x, dot.y);
      var cellPosition = this.toCellPosition(position.x, position.y);
      // console.log('Grid Eaten:',position);
      //loop through the elements in the dots
      this.cells[cellPosition.x][cellPosition.y].isCleared();
    },

    touchMonsters: function(pacman, monster) {
      //console.log('touched the monster', monster);
    },

    shakeScreen: function() {
      if (this.shakeWorld > 0) {
        var rand1 = this.rnd.integerInRange(-5, 5);
        var rand2 = this.rnd.integerInRange(-5, 5);
        this.game.world.setBounds(rand1, rand2, this.game.width + rand1, this.game.height + rand2);
        this.shakeWorld--;
        if (this.shakeWorld === 0) {
          this.game.world.setBounds(0, 0, this.game.width, this.game.height); // normalize after shake?
        }
      }
    },

    drawTeleportPath: function() {
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

    update: function(game) {
      this.physics.arcade.collide(this.monsters, this.ghostLayer);
      this.physics.arcade.collide(this.pacman, this.layer);
      this.physics.arcade.overlap(this.pacman, this.dots, this.eatDot, null, this);
      this.physics.arcade.overlap(this.pacman, this.monsters, this.touchMonsters, null, this);

      this.pacman.marker = this.pacman.getGridPosition();

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

      for(var i = 0; i < this.cells.length; i++){
        for(var j = 0; j < this.cells[i].length; j++){
          this.cells[i][j].update(game.time);
        }
      }

      //update graphics
      this.drawTeleportPath();

      this.shakeScreen();

    },
    render: function() {
      this.monsters.callAll('render');
      this.pacman.render();
    }

  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].Game = Game;

}());
