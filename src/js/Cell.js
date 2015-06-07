(function(){
  'use strict';

  function Cell(data){
    this.data = data;
  }

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].Cell = Cell;
}());
