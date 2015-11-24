(function() {
  'use strict';

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
      this.load.bitmapFont( 'minecraftia', 'assets/minecraftia.png', 'assets/minecraftia.xml' );
      this.load.spritesheet( 'ghost', 'assets/ghosts.png', 32, 32 );
      this.load.spritesheet( 'ghost-eyes', 'assets/ghost-eyes.png', 32, 32 );
      this.load.image( 'background-menu', 'assets/title.png' );
      this.load.image( 'dot', 'assets/dot.png' );
      this.load.image( 'tiles', 'assets/pacman-tiles.png' );
      this.load.spritesheet( 'pacman', 'assets/pacman.png', 32, 32 );
      this.load.spritesheet( 'grave', 'assets/grave.png', 32, 32 );
      this.load.tilemap( 'map', 'assets/pacman-small.json', null, Phaser.Tilemap.TILED_JSON );
      this.load.tilemap( 'levels', 'assets/pacman-maze.json', null, Phaser.Tilemap.TILED_JSON );
      this.load.spritesheet( 'powerup', 'assets/powerup.png', 32, 32 );
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

  window[ 'pac_dungeon' ] = window[ 'pac_dungeon' ] || {};
  window[ 'pac_dungeon' ].Preloader = Preloader;

}());
