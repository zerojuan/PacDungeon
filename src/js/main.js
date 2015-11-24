window.onload = function () {
  'use strict';

  var game
    , ns = window['pac_dungeon'];

  game = new Phaser.Game(640, 640, Phaser.AUTO, 'pacdungeon-game');
  game.state.add('boot', ns.Boot);
  game.state.add('preloader', ns.Preloader);
  game.state.add('menu', ns.Menu);
  game.state.add('game', ns.Game);
  game.state.add('gameover', ns.GameOver);
  /* yo phaser:state new-state-files-put-here */

  game.state.start('boot');
};
