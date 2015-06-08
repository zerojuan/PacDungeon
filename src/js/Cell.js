(function(){
  'use strict';

  function Cell(x,y,data){
    this.x = x;
    this.y = y;
    this.data = data;

    this.dots = [];
  }

  Cell.prototype.isCleared = function(){
    for(var i in this.dots){
      if(this.dots[i].alive){
        return false;
      }
    }

    return true;
  };

  Cell.prototype.revive = function(){
    for(var i = 0; i < this.dots.length; i++){
      this.dots[i].revive();
    }
  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].Cell = Cell;
}());
