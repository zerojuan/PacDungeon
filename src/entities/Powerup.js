
'use strict';

/**
* Takes a gameobject and applies effects on it for a defined period
*/
function Powerup( main, x, y, type ) {
  this.main = main;
  this.type = type;

  Phaser.Sprite.call( this, main.game, x, y, 'powerup-' + type );

  this.alive = true;

  if ( type === 'fruit' ) {
    // show fruit sprite
  } else {
    this.animations.add( 'glow', [ 0, 1, 2 ], 20, true );
    this.animations.play( 'glow' );
  }
}

Powerup.prototype = Object.create( Phaser.Sprite.prototype );
Powerup.prototype.constructor = Powerup;

Powerup.prototype.kill = function() {
  this.alive = false;
  this.alpha = 0;
  this.x = -100;
  this.y = -100;
};

module.exports = Powerup;
