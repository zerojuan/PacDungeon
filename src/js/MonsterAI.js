(function(){
  'use strict';

  var LEFT = 2,
      RIGHT = 0,
      DOWN = 1,
      UP = 3;


  var RED = 0xff0000,
      PINK = 0xff69b4,
      CYAN = 0x00ffff,
      ORANGE = 0xff0500;

  var types = [
    'shadow',
    'speedy',
    'bashful',
    'pokey'
  ];


  function MonsterAI(main, x, y, type){
    // Phaser.Group.call(this, game);
    Phaser.Sprite.call(this, main.game, x, y, 'ghost');

    this.main = main;
    this.speed = this.main.speed * 0.50;
    this.type = type || types[Math.floor(Math.random() * 4)];
    this.directions = [ null, null, null, null, null ];
    switch(this.type){
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

    this.ghostEyes = new Phaser.Sprite(main.game, 0,0,'ghost-eyes');
    this.ghostEyes.frame = UP;
    this.ghostEyes.anchor.set(0.5);
    this.addChild(this.ghostEyes);

    this.marker = new Phaser.Point(0,0);
    this.forwardMarker = new Phaser.Point(0,0);

    this.current = Phaser.DOWN;
    this.nextDirection = Phaser.NONE;
    this.turnPoint = new Phaser.Point();
    this.futurePoint = new Phaser.Point();
    this.threshold = 3;

    this.targetFound = false;

    //override move function
    this.move = function(direction){
      // this.marker
      var speed = this.speed;

      if (direction === Phaser.LEFT || direction === Phaser.UP)
      {
          speed = -speed;
      }

      if (direction === Phaser.LEFT || direction === Phaser.RIGHT)
      {
          this.body.velocity.x = speed;
      }
      else
      {
          this.body.velocity.y = speed;
      }

      //set the eyes
      if(direction === Phaser.UP){
        this.ghostEyes.frame = UP;
      }else if(direction === Phaser.DOWN){
        this.ghostEyes.frame = DOWN;
      }else if(direction === Phaser.LEFT){
        this.ghostEyes.frame = LEFT;
      }else if(direction === Phaser.RIGHT){
        this.ghostEyes.frame = RIGHT;
      }

      this.current = direction;
    };

    this.changeDirection = false;
  }

  MonsterAI.prototype = Object.create(Phaser.Sprite.prototype);
  MonsterAI.prototype.constructor = MonsterAI;

  MonsterAI.prototype.getForward = function(marker){
    if(this.current === Phaser.RIGHT){
      marker.x += 1;
    }else if(this.current === Phaser.LEFT){
      marker.x -= 1;
    }else if(this.current === Phaser.UP){
      marker.y -= 1;
    }else if(this.current === Phaser.DOWN){
      marker.y += 1;
    }
    return marker;
  };

  MonsterAI.prototype.getNextDirection = function(){
    for(var t = 1; t < 5; t++){
      if(!this.directions[t]){
        continue;
      }
      if(t === this.main.opposites[this.current]){
        //ghost can't move back yo
        continue;
      }

      if(this.directions[t].index === this.main.safetile){
        break;
      }
    }
    return t;
  };



  MonsterAI.prototype.feelForward = function(){
    this.marker.x = this.main.game.math.snapToFloor(Math.floor(this.x), this.main.gridsize) / this.main.gridsize;
    this.marker.y = this.main.game.math.snapToFloor(Math.floor(this.y), this.main.gridsize) / this.main.gridsize;

    //move marker forward (see forward)
    this.forwardMarker = this.getForward(new Phaser.Point(this.marker.x, this.marker.y));

    if(this.marker.x < 0 || this.marker.y < 0){
      return;
    }
    this.futurePoint.x = (this.forwardMarker.x * this.gridsize) + (this.gridsize / 2);
    this.futurePoint.y = (this.forwardMarker.y * this.gridsize) + (this.gridsize / 2);
    this.turnPoint.x = (this.forwardMarker.x * this.gridsize) + (this.gridsize / 2);
    this.turnPoint.y = (this.forwardMarker.y * this.gridsize) + (this.gridsize / 2);

    //  Update our grid sensors
    this.directions[0] = this.main.map.getTile(this.forwardMarker.x, this.forwardMarker.y, this.main.layer.index);
    this.directions[1] = this.main.map.getTileLeft(this.main.layer.index, this.forwardMarker.x, this.forwardMarker.y);
    this.directions[2] = this.main.map.getTileRight(this.main.layer.index, this.forwardMarker.x, this.forwardMarker.y);
    this.directions[3] = this.main.map.getTileAbove(this.main.layer.index, this.forwardMarker.x, this.forwardMarker.y);
    this.directions[4] = this.main.map.getTileBelow(this.main.layer.index, this.forwardMarker.x, this.forwardMarker.y);

    //calculate next direction
    this.nextDirection = this.getNextDirection();

    this.targetFound = true;
  };

  MonsterAI.prototype.turn = function(){

    // Grid align before turning
    this.x = this.turnPoint.x;
    this.y = this.turnPoint.y;

    this.body.reset(this.turnPoint.x, this.turnPoint.y);
  };

  MonsterAI.prototype.reachedGoal = function(){
    var cx = Math.floor(this.x);
    var cy = Math.floor(this.y);

    //if current position is almost equal to the turnpoint
    if(this.main.math.fuzzyEqual(cx, this.turnPoint.x, this.threshold) &&
      this.main.math.fuzzyEqual(cy, this.turnPoint.y, this.threshold)){
        return true;
      }
    return false;
  };

  MonsterAI.prototype.update = function(){
    //look for next direction if you don't have any
    if(!this.targetFound){
      this.feelForward();
      this.move(this.current);
    }

    if(this.reachedGoal()){
      //if you reached the goal, move to next goal based on nextDirection
      this.targetFound = false;
      this.turn();
      this.current = this.nextDirection;
    }
  };

  MonsterAI.prototype.render = function(){
    // for (var t = 0; t < 5; t++)
    // {
    //     if (this.directions[t] === null)
    //     {
    //         continue;
    //     }
    //
    //     var color = 'rgba(0,255,0,0.3)';
    //
    //     if (this.directions[t].index !== this.main.safetile)
    //     {
    //         color = 'rgba(255,0,0,0.3)';
    //     }
    //
    //     if (t === this.current)
    //     {
    //         color = 'rgba(255,255,255,0.3)';
    //     }
    //
    //     this.game.debug.geom(new Phaser.Rectangle(this.directions[t].worldX, this.directions[t].worldY,
    //      this.gridsize, this.gridsize), color, true);
    // }
    // // this.game.debug.geom(new Phaser.Line())
    // this.game.debug.geom(new Phaser.Circle(this.turnPoint.x, this.turnPoint.y, 5), 'rgba(255,0,0,1)');
    // // this.game.debug.geom(new Phaser.Circle(this.futurePoint.x, this.futurePoint.y, 5), 'rgba(0,255,0,1)');
    // this.game.debug.geom(new Phaser.Circle(this.x, this.y, 5), 'rgba(0,0,0,1)');
    // this.game.debug.geom(new Phaser.Circle(this.marker.x, this.marker.y, 5), 'rgba(0,255,0,1)');
    // // this.game.debug.geom(new Phaser.Rectangle(this.body.x, this.body.y, this.body.width, this.body.height), 0xffffff, true);
  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].MonsterAI = MonsterAI;
}());
