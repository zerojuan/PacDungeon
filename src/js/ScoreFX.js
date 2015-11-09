(function(){
'use strict';

function ScoreFX(main, x, y){
  Phaser.Group.call(this, main.game, null);

  this.x = x;
  this.y = y;

  this.titleTxt = new Phaser.BitmapText(main.game, 0,0 , 'minecraftia', '0');
  this.titleTxt.align = 'center';
  this.titleTxt.x = 0;

  this.addChild(this.titleTxt);
}

ScoreFX.prototype = Object.create(Phaser.Group.prototype);
ScoreFX.prototype.constructor = ScoreFX;

window['pacdungeon'] = window['pacdungeon'] || {};
window['pacdungeon'].ScoreFX = ScoreFX;
}());
