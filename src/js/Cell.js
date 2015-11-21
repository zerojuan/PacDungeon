(function(){
  'use strict';

  var RED = 35,
      PINK = 36,
      CYAN = 37,
      ORANGE = 38,
      BLUE = 39;

  function Cell(x,y,data, timerContainer, main){
    this.level = 0;

    this.x = x;
    this.y = y;
    this.data = data;
    this.monsters = [];
    this.parseObjects();
    this.main = main;
    this.timerContainer = timerContainer;

    this.dots = [];
    var pos = main.toWorldPosition(this.x, this.y, 0, 0);
    this.countdown = new Phaser.BitmapText(main.game, pos.x,pos.y, 'minecraftia', '0');
    this.countdown.alpha = 0;
    timerContainer.add(this.countdown);

    this.CELLREFRESHTIME = 3000;
    this.cellRefresh = -1;

    this.main.createCellData(this.x, this.y, this.data);
  }

  Cell.prototype.isCleared = function(){
    for(var i in this.dots){
      if(this.dots[i].alive){
        return false;
      }
    }

    this.cellRefresh = this.CELLREFRESHTIME;
    this.countdown.alpha = 0.3;
    return true;
  };

  Cell.prototype.parseObjects = function(){
    //loop through the data and see if there are spawn points
    function putMonster( context, type, x, y, i, j ) {
      context.monsters.push({
        type: type,
        row: y,
        col: x,
        x: i,
        y: j
      });
      context.data[i][j] = 7;
    }

    for(var i = 0; i < this.data.length; i++){
      for(var j = 0; j < this.data[i].length; j++){
        var t = this.data[i][j];
        switch(t){
          case RED:
            putMonster( this, 'shadow', this.x, this.y, i, j );
            break;
          case PINK:
            putMonster( this, 'speedy', this.x, this.y, i, j );
            break;
          case CYAN:
            putMonster( this, 'bashful', this.x, this.y, i, j );
            break;
          case ORANGE:
            putMonster( this, 'pokey', this.x, this.y, i, j );
            break;
        }
      }
    }
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
  };

  Cell.prototype.nextLevel = function(){
    //load a different level data
    this.countdown.alpha = 0;
    this.level++;
    this.data = this.main.DungeonGenerator.loadLevel(this.level);
    this.parseObjects();
    this.revive(); //check where '7' is, and revive our dot sprites there

    this.main.spawnMonsters(this.monsters);
    this.monsters = [];
    this.main.createCellData(this.x, this.y, this.data);
    this.main.explodeCell(this);
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
