
var ns = window[ 'pac_dungeon' ];

function GameOver() {
  this.score = 0;
}

GameOver.prototype = {
  init: function init( score ) {
    this.score = score;
  },
  create: function create() {
    let x = this.game.width / 2;
    let y = this.game.height / 2;


    this.titleTxt = this.add.bitmapText( x, y,
      'minecraftia', 'Game Over Man: ' + this.score );
    this.titleTxt.align = 'center';
    this.titleTxt.x = this.game.width / 2 - this.titleTxt.textWidth / 2;

    this.input.onDown.add( this.onDown, this );
    this.input.keyboard.callbackContext = this;
    const that = this;
    this.input.keyboard.onUpCallback = () => {
      that.onDown();
    };
  },

  update: function update( game ) {
  },

  render: function render() {
  },

  onDown: function onDown() {
    const tween = this.game.add.tween( this.titleTxt );
    tween.to({ x: -900 }, 300 );

    const that = this;
    tween.onComplete.addOnce(() => {
      that.game.state.start( 'menu' );
    }, this );

    tween.start();
  }

};

module.exports = GameOver;
