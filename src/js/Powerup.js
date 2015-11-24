(function() {
  'use strict';

  /**
  * Takes a gameobject and applies effects on it for a defined period
  */
  function Powerup( main, x, y, type ) {
    Phaser.Sprite.call( this, main.game, x, y, 'powerup' );
    this.main = main;
    this.type = type;

    this.alive = true;

    this.animations.add( 'glow', [ 0, 1, 2 ], 20, true );
    this.animations.play( 'glow' );
  }

  Powerup.prototype = Object.create( Phaser.Sprite.prototype );
  Powerup.prototype.constructor = Powerup;

  Powerup.prototype.kill = function() {
    this.alive = false;
    this.alpha = 0;
  };

  window[ 'pac_dungeon' ] = window[ 'pac_dungeon' ] || {};
  window[ 'pac_dungeon' ].Powerup = Powerup;
}());
