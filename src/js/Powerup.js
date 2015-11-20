(function() {
  'use strict';

  /** ======================================
  * LIST OF POWERUP EFFECTS
  *** =====================================*/
  function FreezeEffect(game){
    this.game = game;
    this.name = 'freeze';
    this.isDone = false;
  }

  FreezeEffect.prototype.update = function( entity ){
    console.log('Entity is now Frozen', this.game.time);
    entity.speed = 0;
    // this.isDone = true;
  };


  /**
  * Takes a gameobject and applies effects on it for a defined period
  */
  function Powerup( type, game ) {
    // inherits from display object
    this.game = game;

    switch( type ) {
      case 'freeze':
        this.effect = FreezeEffect;
    }
  }

  Powerup.prototype = Object.create(Phaser.Group.prototype);
  Powerup.prototype.constructor = Powerup;

  Powerup.prototype.makeEffect = function(){
    return new this.effect(this.game);
  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].Powerup = Powerup;
}());
