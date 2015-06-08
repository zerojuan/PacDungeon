(function(){
  'use strict';

  function Cell(x,y,data, timerContainer, game){
    this.x = x;
    this.y = y;
    this.data = data;
    this.timerContainer = timerContainer;

    this.dots = [];
    this.countdown = new Phaser.BitmapText(game, x * 16,y*16, 'minecraftia', 'START');
    timerContainer.add(this.countdown);
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
