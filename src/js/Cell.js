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
    var dotIndex = 0;

    //foreach safetile
    for(var i = 0; i < this.data.length; i++){
      for(var j = 0; j < this.data[i].length; j++){
        if(this.data[i][j] === 7){
          this.data[i][j] = 14;
          var dot = this.dots[dotIndex];
          if(!dot){
            dot = this.main.createDot();
            this.dots.push(dot);
          }
          var pos = this.main.toWorldPosition(this.x, this.y, i, j);

          dot.revive();
          dotIndex++;
          dot.x = pos.x - 3;
          dot.y = pos.y - 3;
        }
      }
    }
      //get dot
      //if ran out of dots
        //create a dot
      //put dot on safetile location



    // for(var i = 0; i < this.dots.length; i++){
    //   this.dots[i].revive();
    // }
  };

  Cell.prototype.nextLevel = function(){
    //load a different level data
    this.level++;
    this.data = this.main.DungeonGenerator.loadLevel(this.level);
    this.revive(); //check where '7' is, and revive our dot sprites there

    this.main.createCellData(this.x, this.y, this.data);
    this.main.doShakeScreen();
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
