import { IntroScene } from './scenes/IntroScene.js';
import { StoreScene } from './scenes/StoreScene.js';
import { EndingScene } from './scenes/EndingScene.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#f0ece2',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  input: {
    keyboard: {
      capture: []
    }
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [IntroScene, StoreScene, EndingScene]
};

const game = new Phaser.Game(config);
