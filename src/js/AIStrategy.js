(function(){
  'use strict';

  var ns = window['pacdungeon'];

  function AIStrategy(pacman, ghost, safetile, opposites){
    this.pacman = pacman;
    this.ghost = ghost;
    this.safetile = safetile;
    this.opposites = opposites;
  }

  function doShadow(directions, current){
    /*jshint validthis:true */

    var pacmanPos = this.pacman.getGridPosition();
    var t = 0;
    var min = 1000;
    var nextDirection = Phaser.NONE;
    //stalks pacman everywhere
    for(t = 5; t > 0; t--){
      if(!directions[t]){
        continue;
      }
      if(t === this.opposites[current]){
        //ghost can't move back yo
        continue;
      }

      if(directions[t].index === this.safetile ||
        directions[t].index === ns.DungeonGenerator.TOPWALL ||
        directions[t].index === ns.DungeonGenerator.RIGHTWALL ||
        directions[t].index === ns.DungeonGenerator.BOTTOMWALL ||
        directions[t].index === ns.DungeonGenerator.LEFTWALL){

        if(!this.isAtEdge(directions[t].index)){
          //which of the directions is closer to the pacman?
          var distance = Phaser.Math.distance(pacmanPos.x, pacmanPos.y, directions[t].x, directions[t].y);
          if(distance < min){
            nextDirection = t;
            min = distance;
          }
        }

      }
    }
    return nextDirection;
  }

  function doSpeedy(directions, current){
    /*jshint validthis:true */
    //get where pacman is facing
    var pacmanPos = this.pacman.getForwardPosition(4);
    var t = 0;
    var min = 1000;
    var nextDirection = Phaser.NONE;

    //look forward four squares
    for(t = 1; t < 5; t++){
      if(!directions[t]){
        continue;
      }
      if(t === this.opposites[current]){
        //ghost can't move back yo
        continue;
      }

      if(directions[t].index === this.safetile ||
        directions[t].index === ns.DungeonGenerator.TOPWALL ||
        directions[t].index === ns.DungeonGenerator.RIGHTWALL ||
        directions[t].index === ns.DungeonGenerator.BOTTOMWALL ||
        directions[t].index === ns.DungeonGenerator.LEFTWALL){

        if(!this.isAtEdge(directions[t].index)){
          //which of the directions is closer to the pacman?
          var distance = Phaser.Math.distance(pacmanPos.x, pacmanPos.y, directions[t].x, directions[t].y);
          if(distance < min){
            nextDirection = t;
            min = distance;
          }
        }
      }
    }

    return nextDirection;
  }

  function doBashful(directions, current){
    /*jshint validthis:true */

    //two tiles forward, but consider shadow's position
    for(var t = 1; t < 5; t++){
      if(!directions[t]){
        continue;
      }
      if(t === this.opposites[current]){
        //ghost can't move back yo
        continue;
      }

      if(directions[t].index === this.safetile){
        break;
      }
    }
    return t;
  }

  function doPokey(directions, current){
    /*jshint validthis:true */

    //if far away from pacman, be like blinky
    //if close, scatter mode
    for(var t = 1; t < 5; t++){
      if(!directions[t]){
        continue;
      }
      if(t === this.opposites[current]){
        //ghost can't move back yo
        continue;
      }

      if(directions[t].index === this.safetile){
        break;
      }
    }
    return t;
  }

  AIStrategy.prototype.setStrategy = function(strategy){
    switch(strategy){
      case 'shadow':
        this.getNextDirection = doShadow;
        break;
      case 'speedy':
        this.getNextDirection = doSpeedy;
        break;
      case 'bashful':
        this.getNextDirection = doBashful;
        break;
      case 'pokey':
        this.getNextDirection = doPokey;
        break;
    }
  };

  AIStrategy.prototype.isAtEdge = function(tile){
    if(tile === ns.DungeonGenerator.TOPWALL){

      return this.ghost.forwardMarker.y === 1;
    }else if(tile === ns.DungeonGenerator.RIGHTWALL){
      console.log('Ghost Marker: ', this.ghost.forwardMarker.x, this.ghost.forwardMarker.x === 38);
      return this.ghost.forwardMarker.x === 28;
    }else if(tile === ns.DungeonGenerator.BOTTOMWALL){
      return this.ghost.forwardMarker.y === 28;
    }else if(tile === ns.DungeonGenerator.LEFTWALL){
      return this.ghost.forwardMarker.x === 1;
    }

    return false;

  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].AIStrategy = AIStrategy;
}());
