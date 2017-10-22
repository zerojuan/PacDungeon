'use strict';

require( './assets/preloader.gif' );

function Boot() {}

Boot.prototype = {

  preload: function preload() {
    this.load.image( 'preloader', 'dist/assets/preloader.gif' );
  },

  create: function create() {
    this.game.input.maxPointers = 1;
    this.game.input.gamepad.start();

    if ( this.game.device.desktop ) {
      this.game.scale.pageAlignHorizontally = true;
    } else {
      this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      this.game.scale.minWidth = 480;
      this.game.scale.minHeight = 260;
      this.game.scale.maxWidth = 640;
      this.game.scale.maxHeight = 480;
      this.game.scale.forceOrientation( true );
      this.game.scale.pageAlignHorizontally = true;
      this.game.scale.setScreenSize( true );
    }
    this.game.state.start( 'preloader' );
  }
};

module.exports = Boot;
