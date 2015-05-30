(function(){
  'use strict';

  function AIStrategy(pacman, ghost, safetile, opposites){
    this.pacman = pacman;
    this.ghost = ghost;
    this.safetile = safetile;
    this.opposites = opposites;
  }

  function doShadow(directions, current){
    //stalks pacman everywhere
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

  function doSpeedy(directions, current){
    //look forward four squares
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

  function doBashful(directions, current){
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

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].AIStrategy = AIStrategy;
}());
