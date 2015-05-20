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
                  data[i][j] = this.TOPLEFTCORNER;
                }else if(j === this.size -1){
                  data[i][j] = this.TOPRIGHTCORNER;
                }else{
                  data[i][j] = this.TOPWALL;
                }
              }else if(i === this.size -1){
                if(j === 0){
                  data[i][j] = this.BOTTOMLEFTCORNER;
                }else if(j === this.size -1){
                  data[i][j] = this.BOTTOMRIGHTCORNER;
                }else{
                  data[i][j] = this.BOTTOMWALL;
                }
              }else{
                if(j === 0){
                  data[i][j] = this.LEFTWALL;
                }else if(j === this.size -1){
                  data[i][j] = this.RIGHTWALL;
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
        
      }
  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].DungeonGenerator = DungeonGenerator;
}());
