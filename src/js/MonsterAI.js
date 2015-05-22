(function(){
  'use strict';

  function MonsterAI(game, x, y){
    Phaser.Sprite.call(this, game, x, y, 'ghost');
    this.animations.add('munch', [0, 1, 2, 1], 20, true);
    this.animations.play('munch');

    console.log('Monster');
  }

  MonsterAI.prototype = Object.create(Phaser.Sprite.prototype);
  MonsterAI.prototype.constructor = MonsterAI;

  MonsterAI.prototype.move = function(){
    this.body.velocity.x = 4;
  };

  MonsterAI.prototype.update = function(){
    this.move();
  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].MonsterAI = MonsterAI;
}());
