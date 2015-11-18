(function() {
  'use strict';

  /** ======================================
  * LIST OF POWERUP EFFECTS
  *** =====================================*/
  function freeze(){

  }


  /**
  * Takes a gameobject and applies effects on it for a defined period
  */
  function Powerup( type ) {
    
  }

  Powerup.prototype.setHost = function( host ) {
    this.host = host;
  };

  Powerup.prototype.update = function(){

  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].Powerup = Powerup;
}());
