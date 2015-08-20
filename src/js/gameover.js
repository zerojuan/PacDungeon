(function() {
  'use strict';

  var ns = window['pacdungeon'];
  var that;

  function GameOver() {
    this.score = 0;
  }

  GameOver.prototype = {
    init: function(score){
      console.log('This is the score', score);
      this.score = score;
    },
    create: function() {
      var x = this.game.width / 2
        , y = this.game.height / 2;


      this.titleTxt = this.add.bitmapText(x, y, 'minecraftia', 'Game Over Man: ' + this.score );
      this.titleTxt.align = 'center';
      this.titleTxt.x = this.game.width / 2 - this.titleTxt.textWidth / 2;
      //
      y = y + this.titleTxt.height + 5;
      this.startTxt = this.add.bitmapText(x, y, 'minecraftia', 'START');
      this.startTxt.align = 'center';
      this.startTxt.x = this.game.width / 2 - this.startTxt.textWidth / 2;

      this.input.onDown.add(this.onDown, this);
    },

    update: function(game) {

    },
    render: function() {

    },

    onDown: function () {
      var tween = this.game.add.tween(this.titleTxt);
      tween.to({x: -900}, 300);


      tween.onComplete.addOnce(function(){
        this.game.state.start('menu');
      }, this);

      tween.start();
    }


  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].GameOver = GameOver;

}());
