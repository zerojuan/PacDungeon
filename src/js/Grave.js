(function() {
  'use strict';

  function Grave( main, x, y ) {
    Phaser.Sprite.call( this, main.game, x, y, 'grave' );
    this.anchor.setTo( 0.5, 0.5 );
    this.animations.add( 'die', null, 10, false );
  }

  Grave.prototype = Object.create( Phaser.Sprite.prototype );
  Grave.prototype.constructor = Grave;


  window[ 'pac_dungeon' ] = window[ 'pac_dungeon' ] || {};
  window[ 'pac_dungeon' ].Grave = Grave;
}());
