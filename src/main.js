
'use strict';

var game,
    Boot = require( './boot.js' ),

    ns = window[ 'pac_dungeon' ];

game = new Phaser.Game( 640, 640, Phaser.AUTO, 'pacdungeon-game' );
game.state.add( 'boot', require( './boot.js' ) );
game.state.add( 'preloader', require( './preloader.js' ) );
game.state.add( 'menu', require( './menu.js' ) );
game.state.add( 'game', require( './game.js' ) );
game.state.add( 'gameover', require( './gameover.js' ) );
/* yo phaser:state new-state-files-put-here */

game.state.start( 'boot' );
