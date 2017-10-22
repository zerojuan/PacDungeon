
var that,
  DungeonGenerator = require( './entities' ).DungeonGenerator,
  Pacman = require( './entities' ).Pacman,
  MonsterAI = require( './entities' ).MonsterAI,
  Cell = require( './entities' ).Cell,
  ScoreFX = require( './entities' ).ScoreFX,
  Powerup = require( './entities' ).Powerup,
  Grave = require( './entities' ).Grave;

function Game() {
  that = this;
  this.debug = true;
  this.livesLeft = 1;
  this.offset = new Phaser.Point( -30, -30 );
  this.map = null;
  this.layers = [];
  this.layer = null;
  this.ghostLayer = null;
  this.pacman = null;
  this.resurrectTimer = 0;
  this.resurrectPoint = new Phaser.Point( 0, 0 );
  this.resurrectCell = new Phaser.Point( 0, 0 );
  this.monsters = null;
  this.powerups = null;
  this.graves = null;
  this.scoreFxs = null;
  this.safetile = 14;
  this.gridsize = 16;

  this.scoreTxt = null;
  this.livesGroup = null;

  this.speed = 100;
  this.size = 10;
  this.squareSize = 3;

  this.DungeonGenerator = null;
  this.cells = [
    [ null, null, null ],
    [ null, null, null ],
    [ null, null, null ]
  ];
  this.timerContainer = null;

  this.opposites = [ Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP ];

  this.score = 0;
  this.teleportZone = new Phaser.Point( 0, 0 );
  this.activeZone = new Phaser.Point( 0, 0 );
  // flag if pacman jumped and hasn't moved yet
  this.isFreshJump = false;

  this.graphics = null;

  this.teleportEmitter = null;
  this.appearEmitter = null;
  this.shakeWorld = 0;

  this.c1 = new Phaser.Point();
  this.c2 = new Phaser.Point();
  this.state = 'Game';
}

Game.prototype = {

  create: function create() {
    this.state = 'Game';

    // normalize after shake?
    this.game.world.setBounds(
      this.offset.x, this.offset.y, this.game.width, this.game.height );

    this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.NO_SCALE;

    this.stage.backgroundColor = '#2d2d2d';

    this.onPowerUp = new Phaser.Signal();

    this.livesLeft = 3;
    this.score = 0;

    this.map = this.add.tilemap();
    this.map.addTilesetImage( 'tiles', 'tiles', 16, 16, 0, 0, 1 );
    this.layer = this.map.create( 'main', this.size * 4, this.size * 4, 16, 16 );
    this.ghostLayer = this.map.createBlankLayer(
      'ghostLayer', this.size * 4, this.size * 4, 16, 16 );

    this.timerContainer = this.add.group();

    this.graves = this.add.group();

    this.scoreFxs = this.add.group();

    let levelTilemap = this.game.add.tilemap( 'levels' );
    this.DungeonGenerator = new DungeonGenerator( this.size, levelTilemap );

    // initialize cells based on this format
    let initialLevel = [
      [ 0, 0, 0 ],
      [ 0, 0, 0 ],
      [ 0, 1, 0 ]
    ];
    let i = 0,
      j = 0;
    for ( i = 0; i < this.squareSize; i++ ) {
      for ( j = 0; j < this.squareSize; j++ ) {
        let level = this.DungeonGenerator.loadLevel( initialLevel[ j ][ i ]);
        this.cells[ i ][ j ] = new Cell( i, j, level, this.timerContainer, this );
      }
    }

    this.timerContainer = this.add.group();

    // so that ghosts can move between cells but not out of bounds
    this.createGhostPrison();
    this.ghostLayer.visible = false;
    this.map.setLayer( this.layer );

    this.dots = this.add.physicsGroup();
    this.map.createFromTiles( 7, this.safetile, 'dot', this.layer, this.dots );

    //  The dots will need to be offset by 6px to put them back in the middle of the grid
    this.dots.setAll( 'x', 6, false, false, 1 );
    this.dots.setAll( 'y', 6, false, false, 1 );

    // add dots to Cells
    let setDotPosition = ( cell ) => {
      return ( d ) => {
        var gPosition = this.toGridPosition( d.x, d.y );
        var cPosition = this.toCellPosition( gPosition.x, gPosition.y );
        if ( cell.x === cPosition.x && cell.y === cPosition.y ) {
          cell.dots.push( d );
        }
      };
    };
    for ( i = 0; i < this.cells.length; i++ ) {
      for ( j = 0; j < this.cells[ i ].length; j++ ) {
        let cell = this.cells[ j ][ i ];
        this.dots.forEach( setDotPosition( cell ), this );
      }
    }

    //  Pacman should collide with everything except the safe tile
    this.map.setCollisionByExclusion([ this.safetile ], true, this.layer );
    // Ghosts should collide with the ghost layer
    this.map.setCollisionByExclusion([ this.safetile ], true, this.ghostLayer );

    this.graphics = this.add.graphics( 0, 0 );

    this.monsters = this.add.group();
    this.powerups = this.add.group();

    this.createPacman((
      this.squareSize * 16 ) + 8, ( this.squareSize * 16 ) + 8 );

    this.livesGroup = this.add.group();
    this.updateLives();

    // spawn 2 monsters
    for ( i = 0; i < this.cells.length; i++ ) {
      for ( j = 0; j < this.cells[ i ].length; j++ ) {
        const cell1 = this.cells[ j ][ i ];
        this.spawnObjects( cell1.monstersData, 'createMonster', cell1 );
        this.spawnObjects( cell1.powerupsData, 'createPowerup', cell1 );
        // empty monsters array immediately
        cell1.monstersData = [];
        cell1.powerupsData = [];
      }
    }


    // create 3 graves
    for ( i = 0; i < 3; i++ ) {
      let grave = new Grave( this, i * 30, 160 * 3 );
      grave.kill();
      this.graves.add( grave );
    }

    for ( i = 0; i < 5; i++ ) {
      let scoreFX = new ScoreFX( this, i * 30, 160 * 3 );
      scoreFX.kill();
      this.scoreFxs.add( scoreFX );
    }

    this.physics.arcade.enable( this.pacman );
    this.pacman.body.setSize( 16, 16, 0, 0 );
    // this.jumpToSquare(0, 0);
    this.pacman.gotoLimbo();

    this.cursors = this.input.keyboard.createCursorKeys();

    this.input.keyboard.onUpCallback = ( event ) => {
      if ( event.keyCode === Phaser.Keyboard.Z ) {
        that.toggleDebug();
      } else if ( event.keyCode === Phaser.Keyboard.X ) {
        that.game.scale.startFullScreen( true );
      } else if ( event.keyCode === Phaser.Keyboard.A ) {
        // Show slowdown powerup
        that.onPowerUp.dispatch( 'slow' );
      } else {
        that.pacman.processInput( event );
      }
    };

    this.input.keyboard.onDownCallback = ( event ) => {
      if ( event.keyCode === Phaser.Keyboard.SPACEBAR ) {
        that.pacman.processInput( event );
      }
    };

    this.game.input.gamepad.pad1.onUpCallback = ( event ) => {
      that.pacman.processInput( event );
    };

    this.onPowerUp.add(( type ) => {
      if ( type === 'normal' ) {
        // slow down all monsters
        console.log( 'Powerup happened!', type );
        this.monsters.callAllExists( 'applyStatus', true, type );
      }
    }, this );

    this.pacman.move( Phaser.LEFT );

    this.teleportEmitter = this.add.emitter();
    this.appearEmitter = this.add.emitter();
    let initEmitter = ( emitter ) => {
      emitter.makeParticles( 'pacman', [ 0, 1, 2 ]);
      emitter.maxParticleScale = 0.1;
      emitter.minParticleScale = 0.01;
      emitter.width = 20;
      emitter.setYSpeed( -20, -100 );
      emitter.setXSpeed( -5, 5 );
      emitter.gravity = -200;
    };

    initEmitter( this.teleportEmitter );
    initEmitter( this.appearEmitter );
    this.appearEmitter.setYSpeed( 100, -20 );
    this.appearEmitter.gravity = 200;

    this.scoreTxt = this.add.bitmapText( 0, 0, 'minecraftia', '0' );
    this.scoreTxt.align = 'left';
    this.scoreTxt.x = 0;
    this.scoreTxt.y = -40;

    // double toggle so that the initialization is normalized
    this.toggleDebug();
    this.toggleDebug();

    // For fading out
    this.rectangle = this.game.add.graphics( 0, 0 );
    this.rectangle.beginFill( 0x000000 );
    this.rectangle.drawRect( this.offset.x, this.offset.y, this.game.width, this.game.height );
    this.rectangle.endFill();
    this.rectangle.alpha = 0;

    this.fadeOutTween = this.game.add.tween( this.rectangle )
      .to({
        alpha: 1
      }, 300, Phaser.Easing.Linear.None, false, 0, 0, false );

    this.fadeOutTween.onComplete.addOnce(() => {
      that.game.state.start( 'gameover', true, false, that.score );
    }, this );
  },

  leaveCell: function leaveCell( monster ) {
    monster.cell.leaveMonster( monster );
  },

  enterCell: function enterCell( monster ) {
    // get cell from where I'm standing
    var gridPos = this.toGridPosition( monster.x, monster.y );
    var cellPos = this.toCellPosition( gridPos.x, gridPos.y );


    for ( let i = 0; i < this.cells.length; i++ ) {
      for ( let j = 0; j < this.cells[ i ].length; j++ ) {
        const cell = this.cells[ j ][ i ];
        if ( cell.x === cellPos.x && cell.y === cellPos.y ) {
          monster.cell = cell;
          monster.cell.enterMonster( monster );
        }
      }
    }
  },

  updateLives: function updateLives() {
    // remove all sprites
    this.livesGroup.removeAll();
    for ( let i = 0; i < this.livesLeft; i++ ) {
      let spr = new Pacman( this, i * 30, 160 * 3 );
      spr.play( 'idle' );
      this.livesGroup.add( spr );
    }
  },

  createDot: function createDot() {
    var dot = this.add.sprite( 0, 0, 'dot', this.dots );
    this.dots.add( dot );
    return dot;
  },

  createCellData: function createCellData( row, col, level ) {
    for ( let i = 0; i < this.size; i++ ) {
      for ( let j = 0; j < this.size; j++ ) {
        this.map.putTile( level[ j ][ i ],
          ( row * this.size ) + j, ( col * this.size ) + i, this.layer );
      }
    }
    return level;
  },

  createGhostPrison: function createGhostPrison() {
    var width = this.size * 3,
      height = this.size * 3;
    for ( let i = 0; i < width; i++ ) {
      this.map.putTile( this.DungeonGenerator.TOPWALL, i, 0, this.ghostLayer );
      this.map.putTile( this.DungeonGenerator.BOTTOMWALL, i, height - 1, this.ghostLayer );
    }
    for ( let j = 0; j < height; j++ ) {
      this.map.putTile( this.DungeonGenerator.RIGHTWALL, 0, j, this.ghostLayer );
      this.map.putTile( this.DungeonGenerator.LEFTWALL, width - 1, j, this.ghostLayer );
    }
  },

  pickRandomSquare: function pickRandomSquare() {
    var row = Math.floor( Math.random() * ( this.squareSize ));
    var col = Math.floor( Math.random() * ( this.squareSize ));
    return {
      row: row,
      col: col
    };
  },

  resurrect: function resurrect() {
    this.livesLeft -= 1;
    this.updateLives();
    if ( this.livesLeft < 0 ) {
      return;
    }
    this.moveToSquare( this.resurrectCell.x, this.resurrectCell.y );
    const targetPosition = this.toWorldPosition(
      this.resurrectCell.x, this.resurrectCell.y, this.resurrectPoint.x, this.resurrectPoint.y );
    this.pacman.x = targetPosition.x;
    this.pacman.y = targetPosition.y;
    this.pacman.resurrect();
  },

  teleport: function teleport() {
    this.teleportEmitter.x = this.pacman.x;
    this.teleportEmitter.y = this.pacman.y;
    this.teleportEmitter.start( true, 250, null, 20 );
    this.jumpToSquare( this.teleportZone.x, this.teleportZone.y );
    this.appearEmitter.x = this.pacman.x;
    this.appearEmitter.y = this.pacman.y - 15;
    this.appearEmitter.start( true, 250, null, 20 );
  },

  createPacman: function createPacman( x, y ) {
    this.pacman = new Pacman( this, x, y );
    this.game.add.existing( this.pacman );
  },

  spawnObjects: function spawnObjects( objects, createAction, cell ) {
    var that = this;
    objects.forEach(( m ) => {
      const p = that.toWorldPosition( m.col, m.row, m.x, m.y );
      that[ createAction ]( p.x, p.y, m.type, cell );
    });
  },

  createMonster: function createMonster( x, y, type, cell ) {
    var monster = new MonsterAI( this, x, y, type );
    monster.player = this.pacman;
    monster.layer = this.layer;
    monster.gridsize = this.gridsize;
    monster.map = this.map;
    this.physics.arcade.enable( monster );
    // add it to the group immediately
    monster.body.setSize( 16, 16, 0, 0 );
    monster.anchor.set( 0.5 );
    this.monsters.add( monster );
    monster.cell = cell;
    monster.cell.enterMonster( monster );

    return monster;
  },

  createPowerup: function createPowerup( x, y, type, cell ) {
    var powerup = new Powerup( this, x, y, type );
    this.physics.arcade.enable( powerup );
    powerup.body.setSize( 16, 16, 0, 0 );
    powerup.anchor.set( 0.5 );
    this.powerups.add( powerup );
    powerup.cell = cell;
    powerup.cell.enterPowerup( powerup );
    return powerup;
  },

  toWorldPosition: function toWorldPosition( cellRow, cellCol, row, col ) {
    // +8 is the offset
    return new Phaser.Point(
      ( 16 * ( row )) + 8 + ( cellRow * this.size * this.gridsize ),
      ( 16 * ( col )) + 8 + ( cellCol * this.size * this.gridsize ));
  },

  toGridPosition: function toGridPosition( x, y ) {
    var marker = new Phaser.Point();
    marker.x = this.math.snapToFloor( Math.floor( x ), this.gridsize ) / this.gridsize;
    marker.y = this.math.snapToFloor( Math.floor( y ), this.gridsize ) / this.gridsize;
    return marker;
  },

  toCellPosition: function toCellPosition( gridX, gridY ) {
    var marker = new Phaser.Point();
    marker.x = Math.floor( gridX / this.size );
    marker.y = Math.floor( gridY / this.size );
    return marker;
  },

  getNextVacantPosition: function getNextVacantPosition( teleportZone, marker, direction ) {
    marker.x = marker.x % 10;
    marker.y = marker.y % 10;
    const targetPosition = this.toWorldPosition(
      teleportZone.x, teleportZone.y, marker.x % 10, marker.y % 10 );
    const targetGridPosition = this.toGridPosition(
      targetPosition.x, targetPosition.y );

    const tile = this.map.getTile(
      targetGridPosition.x, targetGridPosition.y );

    if ( !tile ) {
      return null;
    }
    this.game.debug.geom( new Phaser.Rectangle(
      targetPosition.x - ( this.gridsize / 2 ),
      targetPosition.y - ( this.gridsize / 2 ), this.gridsize,
      this.gridsize ), 'rgba(120,120,120,0.5)', true );
    if ( tile.index !== this.safetile ) {
      const next = new Phaser.Point();
      next.x = marker.x;
      next.y = marker.y;

      switch ( direction ) {
      // 1
      case Phaser.LEFT: next.x -= 1;
        break;
        // 2
      case Phaser.RIGHT: next.x += 1;
        break;
        // 3
      case Phaser.UP: next.y -= 1;
        break;
        // 4
      case Phaser.DOWN: next.y += 1;
        break;
      }

      if ( next.y < 0 ) {
        next.y = 9;
      }
      if ( next.x < 0 ) {
        next.x = 9;
      }
      return this.getNextVacantPosition( teleportZone, next, direction );
    } else {
      return targetPosition;
    }

  },

  getJumpTargetPosition: function getJumpTargetPosition() {
    var marker = this.pacman.getGridPosition();
    var targetPosition = this.getNextVacantPosition(
      this.teleportZone, marker, this.pacman.facing );

    return targetPosition;
  },

  jumpToSquare: function jumpToSquare( row, col ) {
    //  Position Pacman at grid location 14x17 (the +8 accounts for his anchor)
    var targetPosition = this.getJumpTargetPosition();
    this.pacman.x = targetPosition.x;
    this.pacman.y = targetPosition.y;

    this.moveToSquare( row, col );
  },

  moveToSquare: function moveToSquare( row, col ) {
    this.teleportZone.x = this.activeZone.x;
    this.teleportZone.y = this.activeZone.y;
    this.activeZone.x = row;
    this.activeZone.y = col;
    this.isFreshJump = true;

    this.pacman.anchor.set( 0.5 );

    // this.move(this.turning);
    // move to square based on angle
    this.pacman.current = Phaser.NONE;
  },

  updateResurrectPoint: function updateResurrectPoint() {
    this.resurrectTimer++;
    function moveToNextTile() {
      this.resurrectPoint.x++;
      if ( this.resurrectPoint.x > 8 ) {
        this.resurrectPoint.x = 1;
        this.resurrectPoint.y++;
        if ( this.resurrectPoint.y > 8 ) {
          this.resurrectPoint.x = 1;
          this.resurrectPoint.y = 1;
        }
      }

      // check if resurrect point is dead
      const targetGridPosition = new Phaser.Point(
        ( this.resurrectCell.x * this.size ) + this.resurrectPoint.x,
        ( this.resurrectCell.y * this.size ) + this.resurrectPoint.y );
      const tile = this.map.getTile( targetGridPosition.x, targetGridPosition.y, 0 );
      if ( tile.index !== this.safetile ) {
        moveToNextTile.call( this );
      }
    };

    if ( this.resurrectTimer > 5 ) {
      this.resurrectTimer = 0;
      // move to next tile
      moveToNextTile.call( this );
    }
  },

  updateResurrectZone: function updateResurrectZone( direction ) {
    const next = new Phaser.Point( this.resurrectCell.x, this.resurrectCell.y );

    if ( direction === Phaser.LEFT ) {
      next.x--;
    } else if ( direction === Phaser.RIGHT ) {
      next.x++;
    } else if ( direction === Phaser.UP ) {
      next.y--;
    } else if ( direction === Phaser.DOWN ) {
      next.y++;
    }

    if ( next.x > 2 ) {
      next.x = 2;
    } else if ( next.x < 0 ) {
      next.x = 0;
    }

    if ( next.y > 2 ) {
      next.y = 2;
    } else if ( next.y < 0 ) {
      next.y = 0;
    }
    this.resurrectCell.x = next.x;
    this.resurrectCell.y = next.y;
  },

  updateTeleportZone: function updateTeleportZone( direction ) {
    // if freshjump, the next zone should be relative to the active zone
    if ( this.isFreshJump ) {
      this.teleportZone.x = this.activeZone.x;
      this.teleportZone.y = this.activeZone.y;
      this.isFreshJump = false;
    }

    const next = new Phaser.Point( this.teleportZone.x, this.teleportZone.y );

    // if direction lands you on the same active cell, try the one next to it
    function tryNextCell( n, effect ) {
      if ( Phaser.Point.equals( n, this.activeZone )) {
        return effect;
      }
      return 0;
    };
    if ( direction === Phaser.LEFT ) {
      next.x--;
      next.x += tryNextCell.call( this, next, -1 );
    } else if ( direction === Phaser.RIGHT ) {
      next.x++;
      next.x += tryNextCell.call( this, next, 1 );
    } else if ( direction === Phaser.DOWN ) {
      next.y++;
      next.y += tryNextCell.call( this, next, 1 );
    } else if ( direction === Phaser.UP ) {
      next.y--;
      next.y += tryNextCell.call( this, next, -1 );
    }

    const prevZone = new Phaser.Point( this.teleportZone.x, this.teleportZone.y );
    this.teleportZone.copyFrom( next );

    this.clipTeleportZone();

    if ( this.teleportZone.x === this.activeZone.x &&
      this.teleportZone.y === this.activeZone.y ) {
      this.teleportZone.x = prevZone.x;
      this.teleportZone.y = prevZone.y;
    }

    this.clipTeleportZone();
  },

  clipTeleportZone: function clipTeleportZone() {
    if ( this.teleportZone.x < 0 ) {
      this.teleportZone.x = 0;
    } else if ( this.teleportZone.x > this.squareSize - 1 ) {
      this.teleportZone.x = this.squareSize - 1;
    }

    if ( this.teleportZone.y < 0 ) {
      this.teleportZone.y = 0;
    } else if ( this.teleportZone.y > this.squareSize - 1 ) {
      this.teleportZone.y = this.squareSize - 1;
    }
  },

  updateScore: function updateScore( increment ) {
    this.score += increment;
    this.scoreTxt.text = this.score;
  },

  eatPowerup: function eatPowerup( pacman, powerup ) {
    powerup.kill();

    this.onPowerUp.dispatch( 'normal' );
  },

  eatDot: function eatDot( pacman, dot ) {
    dot.kill();

    this.updateScore( 10 );

    // get dots in this area
    this.isCellCleared( dot );
  },

  isCellCleared: function isCellCleared( dot ) {
    const position = this.toGridPosition( dot.x, dot.y );
    const cellPosition = this.toCellPosition( position.x, position.y );
    this.cells[ cellPosition.x ][ cellPosition.y ].isCleared();
  },

  showScoreOnEat: function showScoreOnEat( sc, monster ) {
    var score = this.scoreFxs.getFirstDead();
    score.x = monster.x - 16;
    score.y = monster.y - 16;
    score.setText( sc.toString());
    score.revive();
  },

  touchMonsters: function touchMonsters( pacman, monster ) {
    if ( this.pacman.fsm.current !== 'limbo' || this.pacman.fsm.current !== 'dead' ) {
      if ( monster.fsm.current.startsWith( 'flee' )) {
        this.updateScore( 100 );
        this.showScoreOnEat( 100, monster );
        monster.die();
      } else if ( monster.fsm.current.startsWith( 'baby' )) {
        this.updateScore( 200 );
        this.showScoreOnEat( 200, monster );
        monster.die();
      } else {
        monster.addKill( 1 );
        // put a grave here
        const grave = this.graves.getFirstDead();
        if ( grave ) {
          grave.revive();
          grave.play( 'die' ).setFrame( 0 );
          grave.x = pacman.x;
          grave.y = pacman.y;
          // pacman is in limbo
          pacman.gotoLimbo( this.livesLeft );
          this.graphics.clear();
          this.resurrectCell.x = this.activeZone.x;
          this.resurrectCell.y = this.activeZone.y;
          this.resurrectPoint.x = 1;
          this.resurrectPoint.y = 1;
        } else {
          // TODO: Gameover screen!
          // TODO: show pacman dying

          this.graphics.clear();
        }
      }
    }
  },

  gotoGameOver: function gotoGameOver() {
    console.log( 'Game over?' );
    this.state = 'GameOver';
    this.fadeOutTween.start();
  },

  // called by Cell
  explodeCell: function explodeCell( cell ) {
    // search for ghosts who are in this cell and make them explode
    console.info( 'Killing monsters:', cell.monsters.length );
    cell.monsters.forEach(( monster ) => {
      if ( !monster.alive ) {
        return;
      }

      monster.explode();
    }, this );

    // search for powerups in the cell
    console.info( 'Removing powerups: ', cell.powerups.length );
    cell.powerups.forEach(( powerup ) => {
      if ( !powerup.alive ) {
        return;
      }

      powerup.kill();
    }, this );

    // TODO: Show explosion graphics

    // screen shake
    this.shakeWorld = 30;
  },

  shakeScreen: function shakeScreen() {
    if ( this.shakeWorld > 0 ) {
      const rand1 = this.rnd.integerInRange( this.offset.x - 5, this.offset.x + 5 );
      const rand2 = this.rnd.integerInRange( this.offset.y - 5, this.offset.y + 5 );
      this.game.world.setBounds( rand1, rand2,
        this.game.width + rand1, this.game.height + rand2 );
      this.shakeWorld--;
      if ( this.shakeWorld === 0 ) {
        // normalize after shake?
        this.game.world.setBounds(
          this.offset.x, this.offset.y, this.game.width, this.game.height );
      }
    }
  },

  drawTeleportPath: function drawTeleportPath() {
    // set a fill and line style again
    this.graphics.clear();
    this.graphics.lineStyle( 1, 0xFF0000, 0.8 );

    // draw a second shape
    const targetPosition = this.getJumpTargetPosition();
    this.graphics.moveTo( this.pacman.x, this.pacman.y );
    // calculate control points
    this.c1.x = this.pacman.x;
    this.c1.y = this.pacman.y - 15;
    this.c2.x = targetPosition.x;
    this.c2.y = targetPosition.y - 15;

    if ( this.pacman.y > targetPosition.y ) {
      this.c1.y = targetPosition.y;
    } else if ( this.pacman.y === targetPosition.y ) {
      this.c1.y -= 30;
      this.c2.y -= 30;
    } else {
      this.c2.y = this.pacman.y;
    }
    this.graphics.bezierCurveTo(
      this.c1.x, this.c1.y,
      this.c2.x, this.c2.y,
      targetPosition.x, targetPosition.y );
  },

  update: function update( game ) {
    this.physics.arcade.collide( this.monsters, this.ghostLayer );
    this.physics.arcade.collide( this.pacman, this.layer );
    this.physics.arcade.overlap( this.pacman, this.dots, this.eatDot, null, this );
    this.physics.arcade.overlap( this.pacman, this.powerups, this.eatPowerup, null, this );
    if ( this.pacman.alive ) {
      this.physics.arcade.overlap( this.pacman, this.monsters, this.touchMonsters, null, this );
    }

    this.pacman.marker = this.pacman.getGridPosition();

    if ( this.pacman.fsm.current === 'limbo' ) {
      // move resurrect point
      this.updateResurrectPoint();
    } else {
      if ( this.pacman.marker.x < 0 || this.pacman.marker.y < 0 ) {
        return;
      }
      //  Update our grid sensors
      const index = this.map.getLayer( this.layer );
      this.pacman.directions[ 1 ] =
        this.map.getTileLeft( index, this.pacman.marker.x, this.pacman.marker.y );
      this.pacman.directions[ 2 ] =
        this.map.getTileRight( index, this.pacman.marker.x, this.pacman.marker.y );
      this.pacman.directions[ 3 ] =
        this.map.getTileAbove( index, this.pacman.marker.x, this.pacman.marker.y );
      this.pacman.directions[ 4 ] =
        this.map.getTileBelow( index, this.pacman.marker.x, this.pacman.marker.y );

      this.pacman.checkKeys( this.cursors );

      if ( this.pacman.turning !== Phaser.NONE ) {
        this.pacman.turn();
      }

      this.drawTeleportPath();
    }

    for ( let i = 0; i < this.cells.length; i++ ) {
      for ( let j = 0; j < this.cells[ i ].length; j++ ) {
        this.cells[ i ][ j ].update( game.time );
      }
    }
    this.shakeScreen();
  },

  render: function render() {
    this.monsters.callAll( 'render' );
    this.pacman.render();

    if ( this.pacman.fsm.current === 'limbo' ) {
      const pos = this.toWorldPosition(
        this.resurrectCell.x, this.resurrectCell.y,
        this.resurrectPoint.x, this.resurrectPoint.y );
      this.game.debug.geom( new Phaser.Rectangle(
        pos.x - ( this.gridsize / 2 ), pos.y - ( this.gridsize / 2 ),
        this.gridsize, this.gridsize ), 'rgba(120,120,120,0.5)', true );
    }
  },

  toggleDebug: function toggleDebug() {
    this.debug = !this.debug;
    if ( this.monsters ) {
      this.monsters.forEach(( m ) => {
        m.debug = that.debug;
      });
    }

    this.pacman.debug = this.debug;
    this.game.debug.reset();
  }

};

module.exports = Game;
