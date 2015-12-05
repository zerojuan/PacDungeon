
'use strict';

var RED = 35,
    PINK = 36,
    CYAN = 37,
    ORANGE = 38,
    BLUE = 39,
    POWERUP = 39,
    BLANK = 14,
    DOT = 7;

function Cell( x, y, data, timerContainer, main ) {
  this.level = 0;

  this.x = x;
  this.y = y;
  this.data = data;
  this.monstersData = [];
  this.powerupsData = [];
  this.monsters = [];
  this.powerups = [];
  this.parseObjects();
  this.main = main;
  this.timerContainer = timerContainer;

  this.dots = [];
  var pos = main.toWorldPosition( this.x, this.y, 0, 0 );
  this.countdown = new Phaser.BitmapText( main.game, pos.x, pos.y, 'minecraftia', '0' );
  this.countdown.alpha = 0;
  timerContainer.add( this.countdown );

  this.CELLREFRESHTIME = 3000;
  this.cellRefresh = -1;

  this.main.createCellData( this.x, this.y, this.data );
}

Cell.prototype.enterObject = function( array, object ) {
  if ( array.indexOf( object ) >= 0 ) {
    return;
  }
  array.push( object );
};

Cell.prototype.leaveObject = function( array, object ) {
  var index = array.indexOf( object );
  array.splice( index, 1 );
  object.cell = null;
};

Cell.prototype.enterMonster = function( monster ) {
  this.enterObject( this.monsters, monster );
  // TODO: set monster based on cell level
  monster.cellSpeed = 1;
  // TODO: set monster sprite based on cell level
};

Cell.prototype.leaveMonster = function( monster ) {
  this.leaveObject( this.monsters, monster );
};

Cell.prototype.enterPowerup = function( powerup ) {
  this.enterObject( this.powerups, powerup );
};

Cell.prototype.leavePowerup = function( powerup ) {
  this.leaveObject( this.powerups, powerup );
};

Cell.prototype.isCleared = function() {
  for ( var i in this.dots ) {
    if ( this.dots[ i ].alive ) {
      return false;
    }
  }

  this.cellRefresh = this.CELLREFRESHTIME;
  this.countdown.alpha = 0.3;
  return true;
};

Cell.prototype.parseObjects = function() {

  function putObject( context, type, container, x, y, i, j ) {
    context[ container ].push({
      type: type,
      row: y,
      col: x,
      x: i,
      y: j
    });
  }


  // loop through the data and see if there are spawn points
  for ( var i = 0; i < this.data.length; i++ ) {
    for ( var j = 0; j < this.data[ i ].length; j++ ) {
      var t = this.data[ i ][ j ];
      switch ( t ) {
        case RED:
          putObject( this, 'shadow', 'monstersData', this.x, this.y, i, j );
          this.data[ i ][ j ] = DOT;
          break;
        case PINK:
          putObject( this, 'speedy', 'monstersData', this.x, this.y, i, j );
          this.data[ i ][ j ] = DOT;
          break;
        case CYAN:
          putObject( this, 'bashful', 'monstersData', this.x, this.y, i, j );
          this.data[ i ][ j ] = DOT;
          break;
        case ORANGE:
          putObject( this, 'pokey', 'monstersData', this.x, this.y, i, j );
          this.data[ i ][ j ] = DOT;
          break;
        case POWERUP:
          putObject( this, 'normal', 'powerupsData', this.x, this.y, i, j );
          this.data[ i ][ j ] = BLANK;
          break;
      }
    }
  }
};

Cell.prototype.revive = function() {
  var dotIndex = 0;

  // foreach safetile
  for ( var i = 0; i < this.data.length; i++ ) {
    for ( var j = 0; j < this.data[ i ].length; j++ ) {
      if ( this.data[ i ][ j ] === 7 ) {
        this.data[ i ][ j ] = 14;
        var dot = this.dots[ dotIndex ];
        if ( !dot ) {
          dot = this.main.createDot();
          this.dots.push( dot );
        }
        var pos = this.main.toWorldPosition( this.x, this.y, i, j );

        dot.revive();
        dotIndex++;
        dot.x = pos.x - 3;
        dot.y = pos.y - 3;
      }
    }
  }
};

Cell.prototype.nextLevel = function() {
  // load a different level data
  this.countdown.alpha = 0;
  this.level++;
  this.data = this.main.DungeonGenerator.loadLevel( this.level );
  this.parseObjects();

  // check where '7' is, and revive our dot sprites there
  this.revive();

  this.main.spawnObjects( this.monstersData, 'createMonster', this );

  this.monstersData = [];

  this.main.createCellData( this.x, this.y, this.data );
  this.main.explodeCell( this );

  this.main.spawnObjects( this.powerupsData, 'createPowerup', this );
  this.powerupsData = [];
};

Cell.prototype.update = function( time ) {
  if ( this.cellRefresh < 0 ) {
    return;
  }

  this.cellRefresh -= time.elapsed;
  if ( this.cellRefresh > 0 ) {
    this.countdown.text = Math.round( this.cellRefresh / 1000 );
  } else if ( this.cellRefresh < 0 ) {
    this.nextLevel();
  }
};

module.exports = Cell;
