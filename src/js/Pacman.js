(function(){
  'use strict';

  function Pacman(main, x, y){
    Phaser.Sprite.call(this, main.game, x, y, 'pacman');

    this.debug = false;

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
    this.animations.add('die', [2,3,4,], 10, false);
    this.play('munch');
  }

  Pacman.prototype = Object.create(Phaser.Sprite.prototype);
  Pacman.prototype.constructor = Pacman;

  Pacman.prototype.onDie = function(){
    this.angle = 0;
    this.play('die', null, false, true);

  };

  Pacman.prototype.getGridPosition = function(){
    return this.main.toGridPosition(this.x, this.y);
  };

  Pacman.prototype.getForwardPosition = function(howFar){
    var marker = this.getGridPosition();
    if(this.current === Phaser.LEFT){
      marker.x -= howFar;
    }else if(this.current === Phaser.RIGHT){
      marker.x += howFar;
    }else if(this.current === Phaser.UP){
      marker.y -= howFar;
    }else if(this.current === Phaser.DOWN){
      marker.y += howFar;
    }

    return marker;
  };

  Pacman.prototype.move = function(direction){
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

  Pacman.prototype.turn = function(){
    var cx = Math.floor(this.x);
    var cy = Math.floor(this.y);

    //  This needs a threshold, because at high speeds you can't turn because the coordinates skip past
    if (!this.main.math.fuzzyEqual(cx, this.turnPoint.x, this.threshold) ||
        !this.main.math.fuzzyEqual(cy, this.turnPoint.y, this.threshold)) {
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


  Pacman.prototype.checkDirection = function(turnTo){
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

      this.turnPoint.x = (this.marker.x * this.main.gridsize) + (this.main.gridsize / 2);
      this.turnPoint.y = (this.marker.y * this.main.gridsize) + (this.main.gridsize / 2);
    }
  };

  Pacman.prototype.update = function(){


  };

  Pacman.prototype.render = function(){
    if(this.debug){
      for (var t = 1; t < 5; t++)
      {
          if (this.directions[t] === null)
          {
              continue;
          }

          var color = 'rgba(0,255,0,0.3)';

          if (this.directions[t].index !== this.main.safetile)
          {
              color = 'rgba(255,0,0,0.3)';
              // console.log('Tile is: ', this.directions[t].index);
          }

          if (t === this.current)
          {
              color = 'rgba(255,255,255,0.3)';
          }

          this.main.game.debug.geom(new Phaser.Rectangle(this.directions[t].worldX, this.directions[t].worldY, this.main.gridsize, this.main.gridsize), color, true);
      }
    }
  };


  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].Pacman = Pacman;
}());
