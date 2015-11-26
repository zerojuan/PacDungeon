
'use strict';

require( './assets/minecraftia.png' );
require( './assets/minecraftia.xml' );
require( './assets/ghosts.png' );
require( './assets/ghost-eyes.png' );
require( './assets/title.png' );
require( './assets/dot.png' );
require( './assets/pacman-tiles.png' );
require( './assets/pacman.png' );
require( './assets/grave.png' );
require( './assets/pacman-small.json' );
require( './assets/pacman-maze.json' );
require( './assets/powerup.png' );

function Preloader() {
  this.asset = null;
  this.ready = false;
}

Preloader.prototype = {

  preload: function() {
    this.asset = this.add.sprite( this.game.width * 0.5 - 110,
      this.game.height * 0.5 - 10, 'preloader' );

    this.load.onLoadComplete.addOnce( this.onLoadComplete, this );
    this.load.setPreloadSprite( this.asset );

    this.loadResources();
  },

  loadResources: function() {
    this.load.bitmapFont( 'minecraftia',
      'dist/assets/minecraftia.png', 'dist/assets/minecraftia.xml' );
    this.load.spritesheet( 'ghost', 'dist/assets/ghosts.png', 32, 32 );
    this.load.spritesheet( 'ghost-eyes', 'dist/assets/ghost-eyes.png', 32, 32 );
    this.load.image( 'background-menu', 'dist/assets/title.png' );
    this.load.image( 'dot', 'dist/assets/dot.png' );
    this.load.image( 'tiles', 'dist/assets/pacman-tiles.png' );
    this.load.spritesheet( 'pacman', 'dist/assets/pacman.png', 32, 32 );
    this.load.spritesheet( 'grave', 'dist/assets/grave.png', 32, 32 );
    this.load.tilemap( 'map', 'dist/assets/pacman-small.json', null, Phaser.Tilemap.TILED_JSON );
    this.load.tilemap( 'levels', 'dist/assets/pacman-maze.json', null, Phaser.Tilemap.TILED_JSON );
    this.load.spritesheet( 'powerup', 'dist/assets/powerup.png', 32, 32 );
  },

  create: function() {
    this.asset.cropEnabled = false;
  },

  update: function() {
    if ( !!this.ready ) {
      this.game.state.start( 'menu' );
    }
  },

  onLoadComplete: function() {
    this.ready = true;
  }
};

module.exports = Preloader;
