(function(){
  'use strict';

  function Grave(main, x, y){
    Phaser.Sprite.call(this, main.game, x, y, 'grave');

    this.animations.add('die', [2,3,4,], 10, false);
  }

  Grave.prototype = Object.create(Phaser.Sprite.prototype);
  Grave.prototype.constructor = Grave;

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].Grave = Grave;
}());
