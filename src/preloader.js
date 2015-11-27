
'use strict';

var pacmanMaze = require( './assets/pacman-maze.json' );
require( './assets/minecraftia.xml' );
// require( './assets/pacman-small.json' );
var testMaze = require( './assets/testMaze.json' );
var pacmanSmall = 'dist/assets/pacman-small.json';
var minecraftiaXML = 'dist/assets/minecraftia.xml';

var minecraftia = require( './assets/minecraftia.png' );
var ghosts = require( './assets/ghosts.png' );
var ghostEyes = require( './assets/ghost-eyes.png' );
var title = require( './assets/title.png' );
var dot = require( './assets/dot.png' );
var pacmanTiles = require( './assets/pacman-tiles.png' );
var pacman = require( './assets/pacman.png' );
var grave = require( './assets/grave.png' );
var powerup = require( './assets/powerup.png' );

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
      minecraftia, minecraftiaXML );
    this.load.spritesheet( 'ghost', ghosts, 32, 32 );
    this.load.spritesheet( 'ghost-eyes', ghostEyes, 32, 32 );
    this.load.image( 'background-menu', title );
    this.load.image( 'dot', dot );
    this.load.image( 'tiles', pacmanTiles );
    this.load.spritesheet( 'pacman', pacman, 32, 32 );
    this.load.spritesheet( 'grave', grave, 32, 32 );
    // this.load.tilemap( 'map', pacmanSmall, null, Phaser.Tilemap.TILED_JSON );
    this.load.tilemap( 'levels', testMaze, null, Phaser.Tilemap.TILED_JSON );
    this.load.spritesheet( 'powerup', powerup, 32, 32 );
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
