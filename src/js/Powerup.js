(function() {
  'use strict';

  /**
  * Takes a gameobject and applies effects on it for a defined period
  */
  function Powerup( main, x, y ) {
    Phaser.Sprite.call(this, main.game, x, y, 'powerup');
    this.main = main;

    this.animations.add('glow', [0, 1, 2], 20, true);
    this.animations.play('glow');
  }

  Powerup.prototype = Object.create(Phaser.Sprite.prototype);
  Powerup.prototype.constructor = Powerup;



  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].Powerup = Powerup;
}());
