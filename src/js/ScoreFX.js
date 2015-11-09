(function(){
'use strict';

function ScoreFX(main, x, y){
  Phaser.Sprite.call(this, main.game, x, y);


  this.titleTxt = this.add.bitmapText(0, 0, 'minecraftia', 'Yo, Pacman with a Teleporter!' );
  this.titleTxt.align = 'center';
  this.titleTxt.x = main.game.width / 2;
}

ScoreFX.prototype = Object.create(Phaser.Sprite.prototype);
ScoreFX.prototype.constructor = ScoreFX;

window['pacdungeon'] = window['pacdungeon'] || {};
window['pacdungeon'].ScoreFX = ScoreFX;
}());
