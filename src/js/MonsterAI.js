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
    this.speed = this.main.speed * 0.60;
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

    this.current = Math.floor(Math.random()*3)+1;
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


  }

  MonsterAI.prototype = Object.create(Phaser.Sprite.prototype);
  MonsterAI.prototype.constructor = MonsterAI;

  MonsterAI.prototype.feelForward = function(){
    this.marker.x = this.main.game.math.snapToFloor(Math.floor(this.x), this.main.gridsize) / this.main.gridsize;
    this.marker.y = this.main.game.math.snapToFloor(Math.floor(this.y), this.main.gridsize) / this.main.gridsize;
    console.log('Position:', this.marker.x, this.marker.y);
    if(this.marker.x < 0 || this.marker.y < 0){
      return;
    }
    //  Update our grid sensors
    this.directions[1] = this.main.map.getTileLeft(this.main.layer.index, this.marker.x, this.marker.y);
    this.directions[2] = this.main.map.getTileRight(this.main.layer.index, this.marker.x, this.marker.y);
    this.directions[3] = this.main.map.getTileAbove(this.main.layer.index, this.marker.x, this.marker.y);
    this.directions[4] = this.main.map.getTileBelow(this.main.layer.index, this.marker.x, this.marker.y);

  };

  MonsterAI.prototype.update = function(){
    this.feelForward();

    this.move(this.current);
  };

  MonsterAI.prototype.render = function(){
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
        }

        if (t === this.current)
        {
            color = 'rgba(255,255,255,0.3)';
        }

        this.game.debug.geom(new Phaser.Rectangle(this.directions[t].worldX, this.directions[t].worldY, this.gridsize, this.gridsize), color, true);
    }
  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].MonsterAI = MonsterAI;
}());
