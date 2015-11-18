(function() {
  'use strict';

  /** ======================================
  * LIST OF POWERUP EFFECTS
  *** =====================================*/
  function FreezeEffect(){
    this.name = 'freeze';
    this.isDone = false;
  }

  FreezeEffect.prototype.update = function( entity ){
    console.log('Entity is now Frozen', entity);
    this.isDone = true;
  };


  /**
  * Takes a gameobject and applies effects on it for a defined period
  */
  function Powerup( type ) {
    // inherits from display object
    switch( type ) {
      case 'freeze':
        this.effect = FreezeEffect;
    }
  }

  Powerup.prototype = Object.create(Phaser.Group.prototype);
  Powerup.prototype.constructor = Powerup;

  Powerup.prototype.makeEffect = function(){
    return new this.effect();
  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].Powerup = Powerup;
}());
