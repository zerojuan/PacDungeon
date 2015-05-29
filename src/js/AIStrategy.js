(function(){
  'use strict';

  function AIStrategy(monster, ghost, safetile){
    this.monster = monster;
    this.ghost = ghost;
    this.safetile = safetile;
  }

  function doShadow(directions, opposites){
    //stalks pacman everywhere
  }

  function doSpeedy(directions, opposites){
    //look forward four squares
  }

  function doBashful(directions, opposites){
    //two tiles forward, but consider shadow's position
  }

  function doPokey(directions, opposites){
    //if far away from pacman, be like blinky
    //if close, scatter mode
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

  AIStrategy.prototype.getNextDirection = function(directions, opposites){
    //default
    for(var t = 1; t < 5; t++){
      if(!directions[t]){
        continue;
      }
      if(t === opposites[this.current]){
        //ghost can't move back yo
        continue;
      }

      if(this.directions[t].index === this.safetile){
        break;
      }
    }
    return t;
  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].AIStrategy = AIStrategy;
}());
