'use strict';

function ScoreFX( main, x, y ) {
  Phaser.Group.call( this, main.game, null );

  this.x = x;
  this.y = y;

  this.titleTxt = new Phaser.BitmapText( main.game, 0, 0, 'minecraftia', '0' );
  this.titleTxt.align = 'center';
  this.titleTxt.x = 0;
  this.titleTxt.scale.x = 0.5;
  this.titleTxt.scale.y = 0.5;
  this.alive = false;

  this.tween = main.game.add.tween( this ).to({ alpha: 0 }, 800, Phaser.Easing.Exponential.In );

  this.tween.onComplete.add(function() {
    this.kill();
  }, this );

  this.addChild( this.titleTxt );
}

ScoreFX.prototype = Object.create( Phaser.Group.prototype );
ScoreFX.prototype.constructor = ScoreFX;

ScoreFX.prototype.setText = function( str ) {
  this.titleTxt.text = str;
};

ScoreFX.prototype.kill = function() {
  this.alive = false;
  this.alpha = 0;
};

ScoreFX.prototype.revive = function() {
  this.alive = true;
  this.alpha = 1;

  this.tween.start();
};

module.exports = ScoreFX;
