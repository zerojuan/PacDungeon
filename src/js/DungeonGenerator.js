(function(){
  'use strict';

  function DungeonGenerator(size){
    this.size = size || 10;
    this.TOPLEFTCORNER = 1;
    this.TOPWALL = 2;
    this.TOPRIGHTCORNER = 5;
    this.LEFTWALL = 6;
    this.RIGHTWALL = 10;
    this.BOTTOMLEFTCORNER = 20;
    this.BOTTOMRIGHTCORNER = 24;
    this.BOTTOMWALL = 21;
    this.SAFE = 7;
  }


  DungeonGenerator.prototype = {
      createSquare : function(){
          var data = [];
          for(var i = 0; i < this.size; i++){
            data.push([]);
            for(var j = 0; j < this.size; j++){
              //TOP WALL
              if(i === 0){
                if(j === 0){
                  data[j][i] = this.TOPLEFTCORNER;
                }else if(j === this.size -1){
                  data[i][j] = this.BOTTOMLEFTCORNER;
                }else{
                  data[i][j] = this.LEFTWALL;
                }
              }else if(i === this.size -1){
                if(j === 0){
                  data[i][j] = this.TOPRIGHTCORNER;
                }else if(j === this.size -1){
                  data[i][j] = this.BOTTOMRIGHTCORNER;
                }else{
                  data[i][j] = this.RIGHTWALL;
                }
              }else{
                if(j === 0){
                  data[i][j] = this.TOPWALL;
                }else if(j === this.size -1){
                  data[i][j] = this.BOTTOMWALL;
                }else{
                  data[i][j] = this.SAFE;
                }
              }
            }
          }
          return data;
      },
      createCross: function(){
        var data = this.createSquare();
        data[4][3] = 10+1;
        data[5][3] = 12+1;
        data[5][4] = 8+1;
        data[5][5] = 21+1;
        data[6][5] = 12+1;
        data[6][6] = 16+1;
        data[5][6] = 18+1;
        data[5][7] = 16+1;
        data[4][7] = 14+1;
        data[4][6] = 17+1;
        data[3][6] = 14+1;
        data[3][5] = 10+1;
        data[4][5] = 22+1;
        data[4][4] = 7+1;
        data[4][3] = 10+1;

        return data;
      }
  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].DungeonGenerator = DungeonGenerator;
}());
