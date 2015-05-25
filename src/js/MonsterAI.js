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
    // this.ghostBody = this.create(0,0,'ghost');
    // Phaser.Sprite.call(this, game, x+8, y+8, 'ghost-eyes');
    this.main = main;
    this.speed = this.main.speed * 0.10;
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
    this.nextDirection = this.current;

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
    // for(var t = 1; t < 5; t++){
    //   if(!this.directions[t]){
    //     continue;
    //   }
    //   // if(t !== this.main.opposites[this.current]){
    //   //   continue;
    //   // }
    //   if(this.directions[t].index === this.main.safeTile){
    //     t = Phaser.RIGHT;
    //     break;
    //   }
    // }
    return Phaser.RIGHT;
  };

  MonsterAI.prototype.feelForward = function(){
    this.changeDirection = false;
    this.marker.x = this.main.game.math.snapToFloor(Math.floor(this.x), this.main.gridsize) / this.main.gridsize;
    this.marker.y = this.main.game.math.snapToFloor(Math.floor(this.y), this.main.gridsize) / this.main.gridsize;

    //move marker forward (see forward)
    this.prevMarker = new Phaser.Point(this.forwardMarker.x, this.forwardMarker.y);
    this.forwardMarker = this.getForward(new Phaser.Point(this.marker.x, this.marker.y));

    //if my position matches the previous position, move to next direction
    if(this.prevMarker.x > 0 || this.prevMarker > 0){
      if(this.marker.x === this.prevMarker.x &&
        this.marker.y === this.prevMarker.y){
          //wait till almost at the center before deciding to change direction
          this.changeDirection = true;
        }
    }


    if(this.marker.x < 0 || this.marker.y < 0){
      return;
    }

    //  Update our grid sensors
    this.directions[0] = this.main.map.getTile(this.forwardMarker.x, this.forwardMarker.y, this.main.layer.index);
    this.directions[1] = this.main.map.getTileLeft(this.main.layer.index, this.forwardMarker.x, this.forwardMarker.y);
    this.directions[2] = this.main.map.getTileRight(this.main.layer.index, this.forwardMarker.x, this.forwardMarker.y);
    this.directions[3] = this.main.map.getTileAbove(this.main.layer.index, this.forwardMarker.x, this.forwardMarker.y);
    this.directions[4] = this.main.map.getTileBelow(this.main.layer.index, this.forwardMarker.x, this.forwardMarker.y);

    //calculate next direction
    this.nextDirection = this.getNextDirection();
  };

  MonsterAI.prototype.update = function(){
    this.feelForward();

    this.move(this.current);
    if(this.changeDirection){
      this.current = this.nextDirection;
    }
  };

  MonsterAI.prototype.render = function(){
    for (var t = 0; t < 5; t++)
    {
        if (this.directions[t] === null)
        {
            continue;
        }

        var color = 'rgba(0,255,0,0.3)';

        if (this.directions[t].index !== this.main.safetile)
        {
            color = 'rgba(255,0,0,0.3)';
        }

        if (t === this.current)
        {
            color = 'rgba(255,255,255,0.3)';
        }

        this.game.debug.geom(new Phaser.Rectangle(this.directions[t].worldX, this.directions[t].worldY,
          this.gridsize, this.gridsize), color, true);
    }
    this.game.debug.geom(new Phaser.Rectangle(this.body.x, this.body.y, this.body.width, this.body.height), 0xffffff, true);
  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].MonsterAI = MonsterAI;
}());
