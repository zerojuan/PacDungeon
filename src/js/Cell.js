(function(){
  'use strict';

  function Cell(x,y,data, timerContainer, main){
    this.x = x;
    this.y = y;
    this.data = data;
    this.main = main;
    this.timerContainer = timerContainer;

    this.dots = [];
    var pos = main.toWorldPosition(this.x, this.y, 0, 0);
    this.countdown = new Phaser.BitmapText(main.game, pos.x,pos.y, 'minecraftia', '0');
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
