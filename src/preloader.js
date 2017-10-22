
'use strict';

require( './assets/minecraftia.xml' );
// require( './assets/pacman-small.json' );
const pacmanMaze = require( './assets/pacman-maze.json' );
const testMaze = require( './assets/testMaze.json' );
const pacmanSmall = 'dist/assets/pacman-small.json';
const minecraftiaXML = 'dist/assets/minecraftia.xml';

const minecraftia = require( './assets/minecraftia.png' );
const ghosts = require( './assets/ghosts.png' );
const ghostEyes = require( './assets/ghost-eyes.png' );
const title = require( './assets/title.png' );
const dot = require( './assets/dot.png' );
const pacmanTiles = require( './assets/pacman-tiles.png' );
const pacman = require( './assets/pacman.png' );
const grave = require( './assets/grave.png' );
const powerup = require( './assets/powerup.png' );

function Preloader() {
  this.asset = null;
  this.ready = false;
}

Preloader.prototype = {

  preload: function preload() {
    this.asset = this.add.sprite( this.game.width * 0.5 - 110,
      this.game.height * 0.5 - 10, 'preloader' );

    this.load.onLoadComplete.addOnce( this.onLoadComplete, this );
    this.load.setPreloadSprite( this.asset );

    this.loadResources();
  },

  loadResources: function loadResources() {
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
    this.load.spritesheet( 'powerup-normal', powerup, 32, 32 );
  },

  create: function create() {
    this.asset.cropEnabled = false;
  },

  update: function update() {
    if ( !!this.ready ) {
      this.game.state.start( 'menu' );
    }
  },

  onLoadComplete: function onLoadComplete() {
    this.ready = true;
  }
};

module.exports = Preloader;
