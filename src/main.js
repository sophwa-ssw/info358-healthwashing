import { IntroScene } from './scenes/IntroScene.js';
import { StoreScene } from './scenes/StoreScene.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#f0ece2',
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
  scene: [IntroScene, StoreScene]
};

const game = new Phaser.Game(config);
