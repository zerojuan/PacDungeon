(function() {
  'use strict';

  var ns = window['pacdungeon'];
  var that;

  function Game() {
    that = this;
    this.livesLeft = 3;
    this.offset = new Phaser.Point(-30,-30);
    this.map = null;
    this.layers = [];
    this.layer = null;
    this.ghostLayer = null;
    this.pacman = null;
    this.resurrectTimer = 0;
    this.resurrectPoint = new Phaser.Point(0,0);
    this.resurrectCell = new Phaser.Point(0,0);
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

      //initialize cells based on this format
      var initialLevel = [
        [0,1,2],
        [1,2,1],
        [2,1,0]
      ];
      var i = 0, j = 0;
      for (i = 0; i < this.squareSize; i++) {
        for (j = 0; j < this.squareSize; j++) {
          var level = this.DungeonGenerator.loadLevel(initialLevel[i][j]);
          this.cells[i][j] = new ns.Cell(i,j,level, this.timerContainer, this);
        }
      }

      this.timerContainer = this.add.group();

      //so that ghosts can move between cells but not out of bounds
      this.createGhostPrison();
      this.ghostLayer.visible = false;
      this.map.setLayer(this.layer);

      this.dots = this.add.physicsGroup();
      this.map.createFromTiles(7, this.safetile, 'dot', this.layer, this.dots);

      //  The dots will need to be offset by 6px to put them back in the middle of the grid
      this.dots.setAll('x', 6, false, false, 1);
      this.dots.setAll('y', 6, false, false, 1);

      //add dots to Cells
      var setDotPosition = function(cell){
        return function(d){
          var gPosition = this.toGridPosition(d.x, d.y);
          var cPosition = this.toCellPosition(gPosition.x, gPosition.y);
          if(cell.x === cPosition.x && cell.y === cPosition.y){
            cell.dots.push(d);
          }
        };
      };
      for(i = 0; i < this.cells.length; i++){
        for(j = 0; j < this.cells[i].length; j++){
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

      this.createPacman((this.squareSize * 16) + 8, (this.squareSize * 16) + 8);

      this.livesGroup = this.add.group();
      this.updateLives();

      //spawn 2 monsters
      for(i = 0; i < this.cells.length; i++){
        for(j = 0; j < this.cells[i].length; j++){
          var cell1 = this.cells[j][i];
          this.spawnMonsters(cell1.monsters);
          //empty monsters array immediately
          cell1.monsters = [];
        }
      }


      //create 3 graves
      for(i = 0; i < 3; i++){
        var grave = new ns.Grave(this, i*30, 160*3);
        grave.kill();
        this.graves.add(grave);
      }

      this.physics.arcade.enable(this.pacman);
      this.pacman.body.setSize(16, 16, 0, 0);
      // this.jumpToSquare(0, 0);
      this.pacman.gotoLimbo();

      this.cursors = this.input.keyboard.createCursorKeys();

      this.input.keyboard.onUpCallback = function(event) {
        that.pacman.processInput(event);
      };

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

      this.scoreTxt = this.add.bitmapText(0, 0, 'minecraftia', '0' );
      this.scoreTxt.align = 'left';
      this.scoreTxt.x = 0;
      this.scoreTxt.y = -40;
    },

    updateLives: function(){
      //remove all sprites
      this.livesGroup.removeAll();
      for(var i = 0; i < this.livesLeft; i++){
        var spr = new ns.Pacman(this, i*30, 160*3);
        spr.play('idle');
        this.livesGroup.add(spr);
      }
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

    resurrect: function(){
      this.livesLeft -= 1;
      this.updateLives();
      this.moveToSquare(this.resurrectCell.x, this.resurrectCell.y);
      var targetPosition = this.toWorldPosition(this.resurrectCell.x, this.resurrectCell.y, this.resurrectPoint.x, this.resurrectPoint.y);
      this.pacman.x = targetPosition.x;
      this.pacman.y = targetPosition.y;
      this.pacman.resurrect();
    },

    teleport: function() {
      this.teleportEmitter.x = this.pacman.x;
      this.teleportEmitter.y = this.pacman.y;
      this.teleportEmitter.start(true, 250, null, 20);
      this.jumpToSquare(this.teleportZone.x, this.teleportZone.y);
      this.appearEmitter.x = this.pacman.x;
      this.appearEmitter.y = this.pacman.y - 15;
      this.appearEmitter.start(true, 250, null, 20);
    },

    createPacman: function(x, y) {
      this.pacman = new ns.Pacman(this, x, y);
      this.game.add.existing(this.pacman);
    },

    spawnMonsters: function(monsters) {
      var that = this;
      monsters.forEach(function(m){
          var p = that.toWorldPosition(m.row, m.col, m.x, m.y);
          that.createMonster(p.x, p.y, m.type);
      });
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
      var targetPosition = this.toWorldPosition(this.teleportZone.x, this.teleportZone.y, marker.x % 10, marker.y % 10);
      var targetGridPosition = this.toGridPosition(targetPosition.x, targetPosition.y);
      //target position is not clear,
      //something
      var tile = this.map.getTile(targetGridPosition.x, targetGridPosition.y, 0);
      if(tile.index !== this.safetile && this.pacman.previousTarget){
        targetPosition = this.pacman.previousTarget;
      }else{
        this.pacman.previousTarget = targetPosition;
      }
      return targetPosition;
    },

    jumpToSquare: function(row, col){
      //  Position Pacman at grid location 14x17 (the +8 accounts for his anchor)
      var targetPosition = this.getJumpTargetPosition();
      this.pacman.x = targetPosition.x;
      this.pacman.y = targetPosition.y;

      this.moveToSquare(row, col);
    },

    moveToSquare: function(row, col) {
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

    updateResurrectPoint: function(){
      this.resurrectTimer++;
      var moveToNextTile = function(){
        this.resurrectPoint.x++;
        if(this.resurrectPoint.x > 8){
          this.resurrectPoint.x = 1;
          this.resurrectPoint.y++;
          if(this.resurrectPoint.y > 8){
            this.resurrectPoint.x = 1;
            this.resurrectPoint.y = 1;
          }
        }

        //check if resurrect point is dead
        var targetGridPosition = new Phaser.Point((this.resurrectCell.x*this.size)+this.resurrectPoint.x,
          (this.resurrectCell.y*this.size)+this.resurrectPoint.y);
        var tile = this.map.getTile(targetGridPosition.x, targetGridPosition.y, 0);
        if(tile.index !== this.safetile){
          moveToNextTile.call(this);
        }
      };
      if(this.resurrectTimer > 5){
        this.resurrectTimer = 0;
        //move to next tile
        moveToNextTile.call(this);
      }
    },

    updateResurrectZone: function(direction){
      var next = new Phaser.Point(this.resurrectCell.x, this.resurrectCell.y);
      console.log('Updating resurrect zone');
      if(direction === Phaser.LEFT){
        next.x--;
      } else if(direction === Phaser.RIGHT){
        next.x++;
      } else if(direction === Phaser.UP){
        next.y--;
      } else if(direction === Phaser.DOWN){
        next.y++;
      }

      if(next.x > 2){
        next.x = 2;
      }else if(next.x < 0){
        next.x = 0;
      }

      if(next.y > 2){
        next.y = 2;
      }else if(next.y < 0){
        next.y = 0;
      }
      this.resurrectCell.x = next.x;
      this.resurrectCell.y = next.y;
    },

    updateTeleportZone: function(direction) {
      //if freshjump, the next zone should be relative to the active zone
      if (this.isFreshJump) {
        this.teleportZone.x = this.activeZone.x;
        this.teleportZone.y = this.activeZone.y;
        this.isFreshJump = false;
      }

      var next = new Phaser.Point(this.teleportZone.x, this.teleportZone.y);

      //if direction lands you on the same active cell, try the one next to it
      var tryNextCell = function(n, effect){
        if(Phaser.Point.equals(n, this.activeZone)){
          return effect;
        }
        return 0;
      };
      if (direction === Phaser.LEFT) {
        next.x--;
        next.x += tryNextCell.call(this,next,-1);
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

      if (this.teleportZone.x === this.activeZone.x &&
        this.teleportZone.y === this.activeZone.y) {
        this.teleportZone.x = prevZone.x;
        this.teleportZone.y = prevZone.y;
      }

      this.clipTeleportZone();
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

      this.score += 10;
      this.scoreTxt.text = this.score;

      //get dots in this area
      this.isCellCleared(dot);
    },

    isCellCleared: function(dot){
      var position = this.toGridPosition(dot.x, dot.y);
      var cellPosition = this.toCellPosition(position.x, position.y);
      this.cells[cellPosition.x][cellPosition.y].isCleared();
    },

    touchMonsters: function(pacman, monster) {
      if(this.pacman.fsm.current !== 'limbo' || this.pacman.fsm.current !== 'dead'){
        monster.addKill(1);
        //put a grave here
        var grave = this.graves.getFirstDead();
        if(grave){
          grave.revive();
          grave.play('die').setFrame(0);
          grave.x = pacman.x;
          grave.y = pacman.y;
          //pacman is in limbo
          pacman.gotoLimbo(this.livesLeft);
          this.graphics.clear();
          this.resurrectCell.x = this.activeZone.x;
          this.resurrectCell.y = this.activeZone.y;
          this.resurrectPoint.x = 1;
          this.resurrectPoint.y = 1;
        }else{
          //TODO: Gameover screen!
          //TODO: show pacman dying
          this.graphics.clear();
        }

      }
    },

    //called by Cell
    explodeCell: function(cell){
      //search for ghosts who are in this cell and make them explode
      this.monsters.forEachAlive(function(monster){
        //am i inside the cell?
        var gridPos = this.toGridPosition(monster.x, monster.y);
        var cellPos = this.toCellPosition(gridPos.x, gridPos.y);

        if(cell.x === cellPos.x && cell.y === cellPos.y){
          monster.explode();
        }
      }, this);

      //TODO: Show explosion graphics

      //screen shake
      this.shakeWorld = 30;
    },

    shakeScreen: function() {
      if (this.shakeWorld > 0) {
        var rand1 = this.rnd.integerInRange(this.offset.x-5, this.offset.x+5);
        var rand2 = this.rnd.integerInRange(this.offset.y-5, this.offset.y+5);
        this.game.world.setBounds(rand1, rand2, this.game.width + rand1, this.game.height + rand2);
        this.shakeWorld--;
        if (this.shakeWorld === 0) {
          this.game.world.setBounds(this.offset.x, this.offset.y, this.game.width, this.game.height); // normalize after shake?
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
      if(this.pacman.alive){
        this.physics.arcade.overlap(this.pacman, this.monsters, this.touchMonsters, null, this);
      }

      this.pacman.marker = this.pacman.getGridPosition();

      if(this.pacman.fsm.current === 'limbo'){
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

      for(var i = 0; i < this.cells.length; i++){
        for(var j = 0; j < this.cells[i].length; j++){
          this.cells[i][j].update(game.time);
        }
      }


      this.drawTeleportPath();

      this.shakeScreen();
    },
    render: function() {
      this.monsters.callAll('render');
      this.pacman.render();

      if(this.pacman.fsm.current === 'limbo'){
        var pos = this.toWorldPosition(this.resurrectCell.x, this.resurrectCell.y, this.resurrectPoint.x, this.resurrectPoint.y);
        this.game.debug.geom(new Phaser.Rectangle(pos.x-(this.gridsize/2), pos.y-(this.gridsize/2),
         this.gridsize, this.gridsize), 'rgba(120,120,120,0.5)', true);
      }

    },
    toggleDebug: function(){
      this.monsters.forEach(function(m){
        m.debug = !m.debug;
      });
      this.pacman.debug = !this.pacman.debug;
      this.game.debug.reset();
    }

  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].Game = Game;

}());
