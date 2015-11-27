
'use strict';

function Menu() {
  this.titleTxt = null;
  this.startTxt = null;
}

Menu.prototype = {

  create: function() {
    var x = this.game.width / 2,
        y = this.game.height / 2;

    this.game.world.setBounds( 0, 0, this.game.width, this.game.height );

    this.bg = this.add.image( 0, 0, 'background-menu' );

    this.titleTxt = this.add.bitmapText( x, y, 'minecraftia', 'Yo, Pacman with a Teleporter!' );
    this.titleTxt.align = 'center';
    this.titleTxt.x = this.game.width / 2 - this.titleTxt.textWidth / 2;
    //
    y = y + this.titleTxt.height + 5;
    this.startTxt = this.add.bitmapText( x, y, 'minecraftia', 'START' );
    this.startTxt.align = 'center';
    this.startTxt.x = this.game.width / 2 - this.startTxt.textWidth / 2;

    this.input.onDown.add( this.onDown, this );

    this.input.keyboard.callbackContext = this;
    this.input.keyboard.onUpCallback = function() {
      this.onDown();
    };

    this.pad = this.game.input.gamepad.pad1;

    var that = this;
    this.pad.onUpCallback = function() {
      that.onDown();
    };
  },

  update: function() {

  },

  onDown: function() {
    var tween = this.game.add.tween( this.titleTxt );
    tween.to({ x: -900 }, 300 );


    tween.onComplete.addOnce(function() {
      this.game.state.start( 'game' );
    }, this );

    tween.start();
    this.pad.onUpCallback = null;
  }
};

module.exports = Menu;
