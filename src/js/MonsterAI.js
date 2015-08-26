(function(){
  'use strict';

  var LEFT = 2,
      RIGHT = 0,
      DOWN = 1,
      UP = 3;


  var RED = 0xff0000,
      PINK = 0xff69b4,
      CYAN = 0x00ffff,
      ORANGE = 0xff0500,
      BLUE = 0x0000ff;

  var types = [
    'shadow',
    'speedy',
    'bashful',
    'pokey'
  ];

  var ns = window['pacdungeon'];
  function MonsterAI(main, x, y, type){
    Phaser.Sprite.call(this, main.game, x, y, 'ghost');
    this.targetFSM = main.pacman.fsm;
    this.debug = main.debug;
    this.main = main;
    this.killCount = 0;
    this.speed = this.main.speed * 0.90;
    this.type = type || types[Math.floor(Math.random() * 4)];
    this.directions = [ null, null, null, null, null ];
    this.setTint();

    this.growTween = this.game.add.tween(this.scale)
      .to({
        x: 1,
        y: 1
      }, 100, Phaser.Easing.Linear.None, false, 0, 20, true);

    this.tintTween = this.game.add.tween(this)
      .to({
        tint: this.tint
      }, 100, Phaser.Easing.Linear.None, false, 0, 20, true);

    this.fsm = StateMachine.create({
      events: [
        { name: 'startup', from: 'none', to: 'baby'},
        { name: 'timerExpires', from: 'baby', to: 'babyblink'},
        { name: 'timerExpires', from: 'babyblink', to: 'wander'},
        { name: 'timerExpires', from: 'flee', to: 'fleeblink'},
        { name: 'timerExpires', from: 'fleeblink', to: 'wander'},
        { name: 'timerExpires', from: 'wander', to: 'chase'},
        { name: 'timerExpires', from: 'chase', to: 'wander'},
        { name: 'timerExpires', from: 'die', to: 'die'},
        { name: 'wanderExpires', from: 'wander', to: 'chase'},
        { name: 'exploded', from: ['chase', 'wander'], to: 'flee'  },
        { name: 'exploded', from: 'flee', to: 'die'},
        { name: 'exploded', from: 'baby', to: 'baby'},
        { name: 'exploded', from: 'babyblink', to: 'baby'},
        { name: 'explodeExpired', from: 'flee', to: 'wander'  },
        { name: 'eaten', from: ['flee', 'fleeblink', 'baby', 'babyblink'], to: 'die'}
      ],
      callbacks: {
        onstartup: function(event, from, to, context){
          context.seekTime = 3000;
          context.nextDirectionFinder = context.strategy.getWanderDirection;
        },
        onbaby: function(event, from, to, context){
          context.seekTime = 3000;
          context.nextDirectionFinder = context.strategy.getWanderDirection;
          context.speed = context.main.speed * 0.2;
          context.scale.setTo(0.5, 0.5);
        },
        onbabyblink: function(event, from, to, context){
          context.seekTime = 3000;

          // let the earthquake begins
          context.growTween.start();
        },
        onwander: function(event, from, to, context){
          context.seekTime = 3000;
          context.setTint();
          context.growTween.stop();
          context.scale.setTo(1, 1);
          context.speed = context.main.speed * 0.90;
          context.nextDirectionFinder = context.strategy.getWanderDirection;
        },
        onfleeblink: function(event, from, to, context){
          context.seekTime = 1000;
          context.tintTween.start();
        },
        onleavefleeblink: function(event, from, to, context){
          context.tintTween.stop();
        },
        onchase: function(event, from, to, context){
          //immediately move to wander if pacman is dead
          if(context.targetFSM.current === 'alive'){
            context.seekTime = 10000;
          }else{
            context.seekTime = 10;
          }

          context.nextDirectionFinder = context.strategy.getNextDirection;
        },
        onflee: function(event, from, to, context){
          context.seekTime = 10000;
          context.tint = BLUE;
          context.ghostEyes.frame = 4;
          context.speed = context.main.speed * 0.30;
          context.nextDirectionFinder = context.strategy.getFleeDirection;
        },
        ondie: function(event, from, to, context){
          context.kill();
        }
      }
      });

    this.animations.add('munch', [0, 1, 2, 3], 20, true);
    this.animations.play('munch');

    this.ghostEyes = new Phaser.Sprite(main.game, 0,0,'ghost-eyes');
    this.ghostEyes.frame = UP;
    this.ghostEyes.anchor.set(0.5);
    this.addChild(this.ghostEyes);

    this.marker = new Phaser.Point(0,0);
    this.forwardMarker = new Phaser.Point(0,0);

    this.current = Phaser.NONE;
    this.nextDirection = Phaser.NONE;
    this.turnPoint = new Phaser.Point();
    this.futurePoint = new Phaser.Point();
    this.threshold = 3;

    this.targetFound = false;

    this.strategy = new ns.AIStrategy(main.pacman, this, main.safetile, main.opposites);
    this.strategy.setStrategy(this.type);
    this.nextDirectionFinder = this.strategy.getWanderDirection;

    this.changeDirection = false;

    this.fsm.startup(this);
  }

  MonsterAI.prototype = Object.create(Phaser.Sprite.prototype);
  MonsterAI.prototype.constructor = MonsterAI;

  MonsterAI.prototype.explode = function(){
    this.fsm.exploded(this);
  };

  MonsterAI.prototype.die = function(){
    this.fsm.eaten(this);
  };

  MonsterAI.prototype.setTint = function(){
    switch(this.type){
      case 'shadow':
        this.tint = RED;
        break;
      case 'speedy':
        this.tint = PINK;
        break;
      case 'bashful':
        this.tint = CYAN;
        break;
      case 'pokey':
        this.tint = ORANGE;
        break;
    }
  };

  MonsterAI.prototype.move = function(direction){
    var speed = this.speed;

    if (direction === Phaser.LEFT || direction === Phaser.UP)
    {
        speed = -speed;
    }

    if (direction === Phaser.LEFT || direction === Phaser.RIGHT)
    {
        this.body.velocity.x = speed;
    }
    else
    {
        this.body.velocity.y = speed;
    }

    //set the eyes
    if(this.fsm.current === 'flee'){

    }else{
      if(direction === Phaser.UP){
        this.ghostEyes.frame = UP;
      }else if(direction === Phaser.DOWN){
        this.ghostEyes.frame = DOWN;
      }else if(direction === Phaser.LEFT){
        this.ghostEyes.frame = LEFT;
      }else if(direction === Phaser.RIGHT){
        this.ghostEyes.frame = RIGHT;
      }
    }

    this.current = direction;
  };

  /**
  TODO: Use this to add nemesis system or something
  */
  MonsterAI.prototype.addKill = function(i){
    this.killCount += i;
  };

  MonsterAI.prototype.getForward = function(marker){
    if(this.current === Phaser.RIGHT){
      marker.x += 1;
    }else if(this.current === Phaser.LEFT){
      marker.x -= 1;
    }else if(this.current === Phaser.UP){
      marker.y -= 1;
    }else if(this.current === Phaser.DOWN){
      marker.y += 1;
    }
    return marker;
  };

  MonsterAI.prototype.feelForward = function(){
    this.marker.x = this.main.game.math.snapToFloor(Math.floor(this.x), this.main.gridsize) / this.main.gridsize;
    this.marker.y = this.main.game.math.snapToFloor(Math.floor(this.y), this.main.gridsize) / this.main.gridsize;

    //move marker forward (see forward)
    this.forwardMarker = this.getForward(new Phaser.Point(this.marker.x, this.marker.y));

    if(this.marker.x < 0 || this.marker.y < 0){
      return;
    }
    this.futurePoint.x = (this.forwardMarker.x * this.gridsize) + (this.gridsize / 2);
    this.futurePoint.y = (this.forwardMarker.y * this.gridsize) + (this.gridsize / 2);
    this.turnPoint.x = (this.forwardMarker.x * this.gridsize) + (this.gridsize / 2);
    this.turnPoint.y = (this.forwardMarker.y * this.gridsize) + (this.gridsize / 2);

    //  Update our grid sensors
    this.directions[0] = this.main.map.getTile(this.forwardMarker.x, this.forwardMarker.y, this.main.layer.index);
    this.directions[1] = this.main.map.getTileLeft(this.main.layer.index, this.forwardMarker.x, this.forwardMarker.y);
    this.directions[2] = this.main.map.getTileRight(this.main.layer.index, this.forwardMarker.x, this.forwardMarker.y);
    this.directions[3] = this.main.map.getTileAbove(this.main.layer.index, this.forwardMarker.x, this.forwardMarker.y);
    this.directions[4] = this.main.map.getTileBelow(this.main.layer.index, this.forwardMarker.x, this.forwardMarker.y);

    //calculate next direction
    this.nextDirection = this.nextDirectionFinder(this.directions, this.current, this.strategy);

    this.targetFound = true;
  };

  MonsterAI.prototype.turn = function(){

    // Grid align before turning
    this.x = this.turnPoint.x;
    this.y = this.turnPoint.y;

    this.body.reset(this.turnPoint.x, this.turnPoint.y);
  };

  MonsterAI.prototype.reachedGoal = function(){
    var cx = Math.floor(this.x);
    var cy = Math.floor(this.y);

    //if current position is almost equal to the turnpoint
    if(this.main.math.fuzzyEqual(cx, this.turnPoint.x, this.threshold) &&
      this.main.math.fuzzyEqual(cy, this.turnPoint.y, this.threshold)){
        return true;
      }
    return false;
  };

  MonsterAI.prototype.updateTimers = function(time){
    if(this.seekTime < 0){
      return;
    }

    this.seekTime -= time.elapsed;
    if(this.seekTime < 0){
      this.fsm.timerExpires(this);
    }
  };

  MonsterAI.prototype.update = function(){
    this.updateTimers(this.main.game.time);

    //look for next direction if you don't have any
    if(!this.targetFound){
      this.feelForward();
      this.move(this.current);
    }

    if(this.reachedGoal()){
      //if you reached the goal, move to next goal based on nextDirection
      this.targetFound = false;
      this.turn();
      this.current = this.nextDirection;
    }
  };

  MonsterAI.prototype.render = function(){
    if(this.debug){
      for (var t = 0; t < 5; t++)
      {
          if (this.directions[t] === null)
          {
              continue;
          }

          var color = 'rgba(0,255,0,0.3)';

          if (this.directions[t].index !== this.main.safetile)
          {
              color = 'rgba(255,0,0,0.3)';
          }

          if (t === this.current)
          {
              color = 'rgba(255,255,255,0.3)';
          }

          this.game.debug.geom(new Phaser.Rectangle(this.directions[t].worldX, this.directions[t].worldY,
           this.gridsize, this.gridsize), color, true);
      }
      // this.game.debug.geom(new Phaser.Line())
      this.game.debug.geom(new Phaser.Circle(this.turnPoint.x, this.turnPoint.y, 5), 'rgba(255,0,0,1)');
      // this.game.debug.geom(new Phaser.Circle(this.futurePoint.x, this.futurePoint.y, 5), 'rgba(0,255,0,1)');
      this.game.debug.geom(new Phaser.Circle(this.x, this.y, 5), 'rgba(0,0,0,1)');
      this.game.debug.geom(new Phaser.Circle(this.marker.x, this.marker.y, 5), 'rgba(0,255,0,1)');
      // this.game.debug.geom(new Phaser.Rectangle(this.body.x, this.body.y, this.body.width, this.body.height), 0xffffff, true);
      this.game.debug.body(this);
    }
  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].MonsterAI = MonsterAI;
}());
