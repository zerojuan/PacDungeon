(function(){
  'use strict';

  function Cell(x,y,data, timerContainer, main){
    this.level = 0;

    this.x = x;
    this.y = y;
    this.data = data;
    this.main = main;
    this.timerContainer = timerContainer;

    this.dots = [];
    var pos = main.toWorldPosition(this.x, this.y, 0, 0);
    this.countdown = new Phaser.BitmapText(main.game, pos.x,pos.y, 'minecraftia', '0');
    timerContainer.add(this.countdown);

    this.CELLREFRESHTIME = 3000;
    this.cellRefresh = -1;
  }

  Cell.prototype.isCleared = function(){
    for(var i in this.dots){
      if(this.dots[i].alive){
        return false;
      }
    }

    this.cellRefresh = this.CELLREFRESHTIME;
    return true;
  };

  Cell.prototype.revive = function(){
    for(var i = 0; i < this.dots.length; i++){
      this.dots[i].revive();
    }
  };

  Cell.prototype.nextLevel = function(){
    //load a different level data
    var level = this.main.DungeonGenerator.createSquare();
    this.main.createCellData(this.x, this.y, level);
    this.revive();
  };

  Cell.prototype.update = function(time){
    if(this.cellRefresh < 0){
      return;
    }

    this.cellRefresh -= time.elapsed;
    if(this.cellRefresh > 0){
      this.countdown.text = Math.round(this.cellRefresh/1000);
    }else if(this.cellRefresh < 0){
      this.nextLevel();
    }
  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].Cell = Cell;
}());
