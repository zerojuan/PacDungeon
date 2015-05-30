(function(){
  'use strict';

  function Pacman(main, x, y){
    Phaser.Sprite.call(this, main.game, x, y, 'pacman');
  }

  Pacman.prototype = Object.create(Phaser.Sprite.prototype);
  Pacman.prototype.constructor = Pacman;


  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].Pacman = Pacman;
}());
