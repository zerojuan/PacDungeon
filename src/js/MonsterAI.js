(function(){
  'use strict';

  var LEFT = 2,
      RIGHT = 0,
      DOWN = 1,
      UP = 3;


  function MonsterAI(game, x, y){
    // Phaser.Group.call(this, game);
    Phaser.Sprite.call(this, game, x, y, 'ghost');
    // this.ghostBody = this.create(0,0,'ghost');
    // Phaser.Sprite.call(this, game, x+8, y+8, 'ghost-eyes');
    this.tint = 0xff00ff;
    this.animations.add('munch', [0, 1, 2, 3], 20, true);
    this.animations.play('munch');

    this.ghostEyes = new Phaser.Sprite(game, 0,0,'ghost-eyes');
    this.ghostEyes.frame = UP;
    this.ghostEyes.anchor.set(0.5);
    this.addChild(this.ghostEyes);

    console.log('Monster');
  }

  MonsterAI.prototype = Object.create(Phaser.Sprite.prototype);
  MonsterAI.prototype.constructor = MonsterAI;

  MonsterAI.prototype.move = function(){
    this.body.velocity.x = 20;
  };

  MonsterAI.prototype.update = function(){
    this.move();
  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].MonsterAI = MonsterAI;
}());
