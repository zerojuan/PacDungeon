(function(){
  'use strict';

  function DungeonGenerator(size, tilemap){
    this.tilemap = tilemap;
    console.log('tilemap?', tilemap);
    this.size = size || 10;
    this.TOPLEFTCORNER = 1;
    this.TOPWALL = 2;
    this.TOPRIGHTCORNER = 5;
    this.LEFTWALL = 6;
    this.RIGHTWALL = 10;
    this.BOTTOMLEFTCORNER = 20;
    this.BOTTOMRIGHTCORNER = 24;
    this.BOTTOMWALL = 21;
    this.SAFE = 14;
  }

  DungeonGenerator.TOPLEFTCORNER = 1;
  DungeonGenerator.TOPWALL = 2;
  DungeonGenerator.TOPRIGHTCORNER = 5;
  DungeonGenerator.LEFTWALL = 6;
  DungeonGenerator.RIGHTWALL = 10;
  DungeonGenerator.BOTTOMLEFTCORNER = 20;
  DungeonGenerator.BOTTOMRIGHTCORNER = 24;
  DungeonGenerator.BOTTOMWALL = 21;

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
      loadLevel: function(level){
        var row = level % 3;
        var col = Math.floor(level / 3);
        var data = [];
        for(var i = 0; i < this.size; i++){
          data.push([]);
          for(var j = 0; j < this.size; j++){
            var x = (row * 10) + i;
            var y = (col * 10) + j;
            data[i][j] = this.tilemap.getTile(x,y,0).index;
          }
        }
        return data;
      }
  };

  window['pac_dungeon'] = window['pac_dungeon'] || {};
  window['pac_dungeon'].DungeonGenerator = DungeonGenerator;
}());
