(function() {
  'use strict';

  function Preloader() {
    this.asset = null;
    this.ready = false;
  }

  Preloader.prototype = {

    preload: function () {
      this.asset = this.add.sprite(this.game.width * 0.5 - 110, this.game.height * 0.5 - 10, 'preloader');

      this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
      this.load.setPreloadSprite(this.asset);

      this.loadResources();
    },

    loadResources: function () {
      this.load.spritesheet('ghost', 'assets/ghost.png', 32, 32);
      this.load.image('dot', 'assets/dot.png');
      this.load.image('tiles', 'assets/pacman-tiles.png');
      this.load.spritesheet('pacman', 'assets/pacman.png', 32, 32);
      this.load.tilemap('map', 'assets/pacman-small.json', null, Phaser.Tilemap.TILED_JSON);
    },

    create: function () {
      this.asset.cropEnabled = false;
    },

    update: function () {
      if (!!this.ready) {
        this.game.state.start('menu');
      }
    },

    onLoadComplete: function () {
      this.ready = true;
    }
  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].Preloader = Preloader;

}());
