(function() {
  'use strict';

  var ns = window['pacdungeon'];
  var that;
  function Game() {
    that = this;
    this.map = null;
    this.layers = [];
    this.layer = null;
    this.pacman = null;
    this.monsters = null;

    this.safetile = 14;
    this.gridsize = 16;

    this.speed = 100;
    this.threshold = 10;

    this.size = 10;
    this.squareSize = 3;

    this.DungeonGenerator = new ns.DungeonGenerator(this.size);

    this.marker = new Phaser.Point();
    this.turnPoint = new Phaser.Point();

    this.directions = [ null, null, null, null, null ];
    this.opposites = [ Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP ];

    this.current = Phaser.NONE;
    this.turning = Phaser.NONE;

    this.score = 0;
    this.teleportZone = new Phaser.Point(0,0);
    this.activeZone = new Phaser.Point(0,0);

    this.graphics = null;

    this.teleportEmitter = null;
    this.appearEmitter = null;

    this.c1 = new Phaser.Point();
    this.c2 = new Phaser.Point();
  }

  Game.prototype = {

    create: function () {
      this.stage.backgroundColor = '#2d2d2d';




      this.map = this.add.tilemap();
      this.map.addTilesetImage('tiles', 'tiles', 16, 16, 0, 0, 1);
      this.layer = this.map.create('main', this.size * 4, this.size * 4, 16, 16);

      for(var i = 0; i < this.squareSize; i++){
        for(var j = 0; j < this.squareSize; j++){
          this.createSquare(i, j);
        }
      }

      this.dots = this.add.physicsGroup();
      this.map.createFromTiles(7, this.safetile, 'dot', this.layer, this.dots);

      //  The dots will need to be offset by 6px to put them back in the middle of the grid
      this.dots.setAll('x', 6, false, false, 1);
      this.dots.setAll('y', 6, false, false, 1);

      //  Pacman should collide with everything except the safe tile
      this.map.setCollisionByExclusion([this.safetile], true, this.layer);

      this.graphics = this.add.graphics(0, 0);

      this.createPacman((this.squareSize * 16) + 8,
                        (this.squareSize * 16) + 8);

      this.monsters = this.add.group();

      //spawn 4 monsters
      this.spawnMonsters(4);



      this.physics.arcade.enable(this.pacman);
      this.pacman.body.setSize(16, 16, 0, 0);
      this.moveToSquare(0,1);

      this.cursors = this.input.keyboard.createCursorKeys();

      this.input.keyboard.onUpCallback = function(event){
        console.log('OnUp: ', event.keyCode, 'Key:', Phaser.Keyboard.UP);
        if(event.keyCode === Phaser.Keyboard.SPACEBAR){
          that.teleport();
        }else if(event.keyCode === Phaser.Keyboard.UP){
          that.updateTeleportZone(Phaser.UP);
        }else if(event.keyCode === Phaser.Keyboard.DOWN){
          that.updateTeleportZone(Phaser.DOWN);
        }else if(event.keyCode === Phaser.Keyboard.LEFT){
          that.updateTeleportZone(Phaser.LEFT);
        }else if(event.keyCode === Phaser.Keyboard.RIGHT){
          that.updateTeleportZone(Phaser.RIGHT);
        }
      };

      this.pacman.animations.add('munch', [0, 1, 2, 1], 20, true);
      this.pacman.play('munch');
      this.move(Phaser.LEFT);

      this.teleportEmitter = this.add.emitter();
      this.appearEmitter = this.add.emitter();
      var initEmitter = function(emitter){
        emitter.makeParticles('pacman', [0,1,2]);
        emitter.maxParticleScale = 0.1;
        emitter.minParticleScale = 0.01;
        emitter.width = 20;
        emitter.setYSpeed(-20, -100);
        emitter.setXSpeed(-5,5);
        emitter.gravity = -200;
      };

      initEmitter(this.teleportEmitter);
      initEmitter(this.appearEmitter);
      this.appearEmitter.setYSpeed(100, -20);
      this.appearEmitter.gravity = 200;

    },

    createSquare: function(row, col){
      var level = this.DungeonGenerator.createCross();
      for(var i =0; i < this.size; i++){
        for(var j =0; j < this.size; j++){
          this.map.putTile(level[j][i], (row * this.size) + j, (col * this.size) + i, this.layer);
        }
      }
    },

    pickRandomSquare: function(){
      var row = Math.floor(Math.random() * (this.squareSize));
      var col = Math.floor(Math.random() * (this.squareSize));
      return {
        row: row,
        col: col
      };
    },

    teleport: function(){
      this.teleportEmitter.x = this.pacman.x;
      this.teleportEmitter.y = this.pacman.y;
      this.teleportEmitter.start(true, 250, null, 20);
      this.moveToSquare(this.teleportZone.x,this.teleportZone.y);
      this.appearEmitter.x = this.pacman.x;
      this.appearEmitter.y = this.pacman.y - 15;
      this.appearEmitter.start(true, 250, null, 20);
    },

    createPacman: function(x,y){
      this.pacman = this.add.sprite(x,y,'pacman',0);
    },

    spawnMonsters: function(num){
      for(var i = 0; i < num; i++){
        //pick random col and row

        var pos = this.pickRandomSquare();
        var p = this.toWorldPosition(pos.row, pos.col, 1, 1);
        console.log('Spawning ...' , pos);
        this.createMonster(p.x, p.y);
      }
    },

    createMonster: function(x,y){
      var monster = new ns.MonsterAI(this.game, x, y);
      monster.player = this.pacman;
      this.physics.arcade.enable(monster);
      //add it to the group immediately
      this.monsters.add(monster);

      return monster;
    },

    toWorldPosition: function(squareRow, squareCol, row, col){
      //+8 is the offset
      return new Phaser.Point(
        (16 * (row)) + 8 + (squareRow * this.size * this.gridsize),
        (16 * (col)) + 8 + (squareCol* this.size * this.gridsize)
      );
    },

    getJumpTargetPosition: function(){
      var marker = new Phaser.Point();
      marker.x = this.math.snapToFloor(Math.floor(this.pacman.x), this.gridsize) / this.gridsize;
      marker.y = this.math.snapToFloor(Math.floor(this.pacman.y), this.gridsize) / this.gridsize;
      return this.toWorldPosition(this.teleportZone.x, this.teleportZone.y, marker.x % 10, marker.y % 10);
    },

    moveToSquare: function(row, col){
      //  Position Pacman at grid location 14x17 (the +8 accounts for his anchor)
      var marker = new Phaser.Point();
      marker.x = this.math.snapToFloor(Math.floor(this.pacman.x), this.gridsize) / this.gridsize;
      marker.y = this.math.snapToFloor(Math.floor(this.pacman.y), this.gridsize) / this.gridsize;
      console.log('Marker: ', marker);
      var p = this.toWorldPosition(row, col, marker.x % 10, marker.y % 10);
      this.pacman.x = p.x;
      this.pacman.y = p.y;

      this.activeZone.x = row;
      this.activeZone.y = col;

      this.pacman.anchor.set(0.5);
      // this.move(this.turning);
      //move to square based on angle
      this.current = Phaser.NONE;

    },

    checkKeys: function () {

      if (this.cursors.left.isDown && this.current !== Phaser.LEFT)
      {
          this.checkDirection(Phaser.LEFT);
      }
      else if (this.cursors.right.isDown && this.current !== Phaser.RIGHT)
      {
          this.checkDirection(Phaser.RIGHT);
      }
      else if (this.cursors.up.isDown && this.current !== Phaser.UP)
      {
          this.checkDirection(Phaser.UP);
      }
      else if (this.cursors.down.isDown && this.current !== Phaser.DOWN)
      {
          this.checkDirection(Phaser.DOWN);
      }
      else
      {
          //  This forces them to hold the key down to turn the corner
          this.turning = Phaser.NONE;
      }

    },

    updateTeleportZone: function(direction){
      var next = new Phaser.Point(0,0);
      if(direction === Phaser.LEFT){
        next.x--;
      }else if(direction === Phaser.RIGHT){
        next.x++;
      }else if(direction === Phaser.DOWN){
        next.y++;
      }else if(direction === Phaser.UP){
        next.y--;
      }

      this.teleportZone.x += next.x;
      this.teleportZone.y += next.y;

      this.clipTeleportZone();

      if(this.teleportZone.x === this.activeZone.x &&
        this.teleportZone.y === this.activeZone.y){
        if(next.x > 0){
          this.teleportZone.x++;
        }else if(next.x < 0){
          this.teleportZone.x--;
        }
        if(next.y > 0){
          this.teleportZone.y++;
        }else if(next.y < 0){
          this.teleportZone.y--;
        }
      }

      this.clipTeleportZone();


      console.log('Teleport Zone:',this.teleportZone.x + ',' + this.teleportZone.y);
    },

    clipTeleportZone: function(){
      if(this.teleportZone.x < 0){
        this.teleportZone.x = this.squareSize-1;
      }else if(this.teleportZone.x > this.squareSize-1){
        this.teleportZone.x = 0;
      }

      if(this.teleportZone.y < 0){
        this.teleportZone.y = this.squareSize-1;
      }else if(this.teleportZone.y > this.squareSize-1){
        this.teleportZone.y = 0;
      }
    },

    checkDirection: function (turnTo) {
        if (this.turning === turnTo || this.directions[turnTo] === null || this.directions[turnTo].index !== this.safetile)
        {
            //  Invalid direction if they're already set to turn that way
            //  Or there is no tile there, or the tile isn't index 1 (a floor tile)
            return;
        }

        //  Check if they want to turn around and can
        if (this.current === this.opposites[turnTo])
        {
            this.move(turnTo);
        }
        else
        {
            this.turning = turnTo;

            this.turnPoint.x = (this.marker.x * this.gridsize) + (this.gridsize / 2);
            this.turnPoint.y = (this.marker.y * this.gridsize) + (this.gridsize / 2);
        }

    },

    turn: function () {

        var cx = Math.floor(this.pacman.x);
        var cy = Math.floor(this.pacman.y);

        //  This needs a threshold, because at high speeds you can't turn because the coordinates skip past
        if (!this.math.fuzzyEqual(cx, this.turnPoint.x, this.threshold) || !this.math.fuzzyEqual(cy, this.turnPoint.y, this.threshold))
        {
            return false;
        }

        //  Grid align before turning
        this.pacman.x = this.turnPoint.x;
        this.pacman.y = this.turnPoint.y;

        this.pacman.body.reset(this.turnPoint.x, this.turnPoint.y);

        this.move(this.turning);

        this.turning = Phaser.NONE;

        return true;

    },

    move: function (direction) {

        var speed = this.speed;

        if (direction === Phaser.LEFT || direction === Phaser.UP)
        {
            speed = -speed;
        }

        if (direction === Phaser.LEFT || direction === Phaser.RIGHT)
        {
            this.pacman.body.velocity.x = speed;
        }
        else
        {
            this.pacman.body.velocity.y = speed;
        }

        //  Reset the scale and angle (Pacman is facing to the right in the sprite sheet)
        this.pacman.scale.x = 1;
        this.pacman.angle = 0;

        if (direction === Phaser.LEFT)
        {
            this.pacman.scale.x = -1;
        }
        else if (direction === Phaser.UP)
        {
            this.pacman.angle = 270;
        }
        else if (direction === Phaser.DOWN)
        {
            this.pacman.angle = 90;
        }

        this.current = direction;

    },

    eatDot: function (pacman, dot) {

        dot.kill();
        this.score++;

        if (this.dots.total === 0)
        {

            this.dots.callAll('revive');
        }

    },

    drawTeleportPath: function(){
      // set a fill and line style again
      this.graphics.clear();
      this.graphics.lineStyle(1, 0xFF0000, 0.8);

      // draw a second shape
      var targetPosition = this.getJumpTargetPosition();
      this.graphics.moveTo(this.pacman.x,this.pacman.y);
      //calculate control points
      this.c1.x = this.pacman.x;
      this.c1.y = this.pacman.y-15;
      this.c2.x = targetPosition.x;
      this.c2.y = targetPosition.y-15;

      if(this.pacman.y > targetPosition.y){
        this.c1.y = targetPosition.y;
      }else if(this.pacman.y === targetPosition.y){

      }else{
        this.c2.y = this.pacman.y;
      }
      this.graphics.bezierCurveTo(this.c1.x, this.c1.y, this.c2.x, this.c2.y, targetPosition.x, targetPosition.y);
    },

    update: function () {
        this.physics.arcade.collide(this.monsters, this.layer);
        this.physics.arcade.collide(this.pacman, this.layer);
        this.physics.arcade.overlap(this.pacman, this.dots, this.eatDot, null, this);

        this.marker.x = this.math.snapToFloor(Math.floor(this.pacman.x), this.gridsize) / this.gridsize;
        this.marker.y = this.math.snapToFloor(Math.floor(this.pacman.y), this.gridsize) / this.gridsize;
        console.log('Position:', this.marker.x, this.marker.y);
        if(this.marker.x < 0 || this.marker.y < 0){
          return;
        }
        //  Update our grid sensors
        this.directions[1] = this.map.getTileLeft(this.layer.index, this.marker.x, this.marker.y);
        this.directions[2] = this.map.getTileRight(this.layer.index, this.marker.x, this.marker.y);
        this.directions[3] = this.map.getTileAbove(this.layer.index, this.marker.x, this.marker.y);
        this.directions[4] = this.map.getTileBelow(this.layer.index, this.marker.x, this.marker.y);

        this.checkKeys();

        if (this.turning !== Phaser.NONE)
        {
            this.turn();
        }

        //update graphics
        this.drawTeleportPath();

    },
    render: function () {

            //  Un-comment this to see the debug drawing

            // for (var t = 1; t < 5; t++)
            // {
            //     if (this.directions[t] === null)
            //     {
            //         continue;
            //     }
            //
            //     var color = 'rgba(0,255,0,0.3)';
            //
            //     if (this.directions[t].index !== this.safetile)
            //     {
            //         color = 'rgba(255,0,0,0.3)';
            //     }
            //
            //     if (t === this.current)
            //     {
            //         color = 'rgba(255,255,255,0.3)';
            //     }
            //
            //     this.game.debug.geom(new Phaser.Rectangle(this.directions[t].worldX, this.directions[t].worldY, this.gridsize, this.gridsize), color, true);
            // }

            // this.game.debug.geom(new Phaser.Rectangle(this.teleportZone.x * this.gridsize * this.size,
              // this.teleportZone.y * this.gridsize * this.size, this.gridsize * this.size, this.gridsize * this.size), 'rgba(255,255,255,0.3)', true);
          // this.game.debug.geom(this.teleportZone, '#ffff00');
          this.game.debug.geom(new Phaser.Circle(this.c1.x, this.c1.y, 10), 'rgba(255,0,0,1)', true);
          this.game.debug.geom(new Phaser.Circle(this.c2.x, this.c2.y, 10), 'rgba(0,255,0,1)', true);
        }

  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].Game = Game;

}());
