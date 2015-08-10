(function(){
  'use strict';

  function Pacman(main, x, y){
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

    this.fsm = StateMachine.create({
      events: [
        { name: 'toLimbo', from: ['none','alive'], to: 'limbo'},
        { name: 'resurrect', from: 'limbo', to: 'alive'},
        { name: 'die', from: 'limbo', to: 'dead'}
      ],
      callbacks: {
        onlimbo: function(event, from, to, context){
          context.disappear();
          context.executeInput = context.moveLimbo;
        },
        ondead: function(event, from, to, context){
          context.disappear();
          this.executeInput = null;
        },
        onalive: function(event, from, to, context){
          context.executeInput = context.moveAlive;
        }
      }
    });
  }

  Pacman.prototype = Object.create(Phaser.Sprite.prototype);
  Pacman.prototype.constructor = Pacman;

  Pacman.prototype.processInput = function(event){
    if(this.executeInput){ //because some states disables inputs
      this.executeInput(event);
    }
  };

  Pacman.prototype.moveLimbo = function(event){
    if (event.keyCode === Phaser.Keyboard.SPACEBAR) {
      this.main.resurrect();
    } else if (event.keyCode === Phaser.Keyboard.UP) {
      this.main.updateResurrectZone(Phaser.UP);
    } else if (event.keyCode === Phaser.Keyboard.DOWN) {
      this.main.updateResurrectZone(Phaser.DOWN);
    } else if (event.keyCode === Phaser.Keyboard.LEFT) {
      this.main.updateResurrectZone(Phaser.LEFT);
    } else if (event.keyCode === Phaser.Keyboard.RIGHT) {
      this.main.updateResurrectZone(Phaser.RIGHT);
    } else if (event.keyCode === Phaser.Keyboard.Z){
      this.main.toggleDebug();
    }
  };

  Pacman.prototype.moveAlive = function(event){
    if (event.keyCode === Phaser.Keyboard.SPACEBAR) {
      this.main.teleport();
    } else if (event.keyCode === Phaser.Keyboard.UP) {
      this.main.updateTeleportZone(Phaser.UP);
    } else if (event.keyCode === Phaser.Keyboard.DOWN) {
      this.main.updateTeleportZone(Phaser.DOWN);
    } else if (event.keyCode === Phaser.Keyboard.LEFT) {
      this.main.updateTeleportZone(Phaser.LEFT);
    } else if (event.keyCode === Phaser.Keyboard.RIGHT) {
      this.main.updateTeleportZone(Phaser.RIGHT);
    } else if (event.keyCode === Phaser.Keyboard.Z){
      this.main.toggleDebug();
    }
  };

  Pacman.prototype.disappear = function(){
    this.angle = 0;
    this.x = -100;
    if(this.body){
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;
    }
  };

  Pacman.prototype.gotoLimbo = function(livesLeft){
    this.fsm.toLimbo(this);
    if(livesLeft === 0){
      this.fsm.die(this);
    }
  };
  Pacman.prototype.resurrect = function(){
    this.fsm.resurrect(this);
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
          this.main.game.debug.body(this);
          // this.main.game.debug.geom(new Phaser.Rectangle(this.directions[t].worldX, this.directions[t].worldY, this.main.gridsize, this.main.gridsize), color, true);
      }
    }
  };


  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].Pacman = Pacman;
}());
