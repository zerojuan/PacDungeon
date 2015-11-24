(function() {
  'use strict';

  var ns = window[ 'pac_dungeon' ];
  var that;

  function GameOver() {
    this.score = 0;
  }

  GameOver.prototype = {
    init: function( score ) {
      this.score = score;
    },
    create: function() {
      var x = this.game.width / 2,
          y = this.game.height / 2;


      this.titleTxt = this.add.bitmapText( x, y,
        'minecraftia', 'Game Over Man: ' + this.score );
      this.titleTxt.align = 'center';
      this.titleTxt.x = this.game.width / 2 - this.titleTxt.textWidth / 2;

      this.input.onDown.add( this.onDown, this );
      this.input.keyboard.callbackContext = this;
      this.input.keyboard.onUpCallback = function() {
        this.onDown();
      };
    },

    update: function( game ) {

    },
    render: function() {

    },

    onDown: function() {
      var tween = this.game.add.tween( this.titleTxt );
      tween.to({ x: -900 }, 300 );


      tween.onComplete.addOnce(function() {
        this.game.state.start( 'menu' );
      }, this );

      tween.start();
    }

  };

  window[ 'pac_dungeon' ] = window[ 'pac_dungeon' ] || {};
  window[ 'pac_dungeon' ].GameOver = GameOver;

}());
