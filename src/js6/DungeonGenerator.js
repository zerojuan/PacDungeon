export class DungeonGenerator{
  constructor(size, tilemap){
    this.tilemap = tilemap;
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


}
