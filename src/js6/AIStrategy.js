import {DungeonGenerator} from 'all.js';

export class AIStrategy{
  //This is a class
  constructor(pacman, ghost, safetile, opposites){
    this.pacman = pacman;
    this.ghost = ghost;
    this.safetile = safetile;
    this.opposites = opposites;
  }

  doShadow(directions, current){
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
        directions[t].index === DungeonGenerator.TOPWALL ||
        directions[t].index === DungeonGenerator.RIGHTWALL ||
        directions[t].index === DungeonGenerator.BOTTOMWALL ||
        directions[t].index === DungeonGenerator.LEFTWALL){

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

  doSpeedy(directions, current){
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
        directions[t].index === DungeonGenerator.TOPWALL ||
        directions[t].index === DungeonGenerator.RIGHTWALL ||
        directions[t].index === DungeonGenerator.BOTTOMWALL ||
        directions[t].index === DungeonGenerator.LEFTWALL){

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

  doBashful(directions, current){
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

  doPokey(directions, current){
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

  setStrategy(strategy){
    switch(strategy){
      case 'shadow':
        this.getNextDirection = this.doShadow;
        break;
      case 'speedy':
        this.getNextDirection = this.doSpeedy;
        break;
      case 'bashful':
        this.getNextDirection = this.doBashful;
        break;
      case 'pokey':
        this.getNextDirection = this.doPokey;
        break;
    }
  }

  isAtEdge(tile){
    if(tile === DungeonGenerator.TOPWALL){
      return this.ghost.forwardMarker.y === 1;
    }else if(tile === DungeonGenerator.RIGHTWALL){
      return this.ghost.forwardMarker.x === 28;
    }else if(tile === DungeonGenerator.BOTTOMWALL){
      return this.ghost.forwardMarker.y === 28;
    }else if(tile === DungeonGenerator.LEFTWALL){
      return this.ghost.forwardMarker.x === 1;
    }

    return false;
  }
}
