export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add.rectangle(400, 300, width, height, 0xf5f0e1);

    const paragraph1 = this.add.text(0, 0, 'Walking into a grocery store can feel overwhelming for young adults, especially when trying to make healthier choices in an unfamiliar environment like a new college campus. Store shelves are filled from top to bottom with packaged products that claim to provide a variety of health benefits, making it difficult to know which options to choose and which claims to trust. With marketing techniques like healthwashing, it can become confusing to know what benefits you are actually receiving from the food you eat.', {
      fontSize: '14px',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      color: '#2d3436',
      align: 'center',
      lineSpacing: 4,
      wordWrap: { width: 680, useAdvancedWrap: true }
    }).setOrigin(0.5, 0);

    const paragraph2 = this.add.text(0, 0, 'Healthwashing is widely known as the collective use of misleading marketing of food and beverage products to make them appear healthier than they actually are. These tactics can be subtle and easy to overlook, but with the help of this game and the sources provided below, you will be better equipped to identify healthwashing strategies in your local grocery store.', {
      fontSize: '14px',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      color: '#2d3436',
      align: 'center',
      lineSpacing: 4,
      wordWrap: { width: 680, useAdvancedWrap: true }
    }).setOrigin(0.5, 0);

    const gap = 24;
    const totalHeight = paragraph1.height + gap + paragraph2.height;
    const topY = -totalHeight / 2;

    const content = this.add.container(width / 2, height / 2);
    content.add(paragraph1);
    paragraph1.setPosition(0, topY);
    content.add(paragraph2);
    paragraph2.setPosition(0, topY + paragraph1.height + gap);

    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x00b894, 1);
    btnBg.fillRoundedRect(width / 2 - 80, height - 80, 160, 44, 8);

    const startBtn = this.add.text(width / 2, height - 58, 'Start', {
      fontSize: '18px',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const hitArea = this.add.zone(width / 2, height - 58, 160, 44).setOrigin(0.5).setInteractive({ useHandCursor: true });

    hitArea.on('pointerover', () => {
      btnBg.clear();
      btnBg.fillStyle(0x00a381, 1);
      btnBg.fillRoundedRect(width / 2 - 80, height - 80, 160, 44, 8);
    });

    hitArea.on('pointerout', () => {
      btnBg.clear();
      btnBg.fillStyle(0x00b894, 1);
      btnBg.fillRoundedRect(width / 2 - 80, height - 80, 160, 44, 8);
    });

    hitArea.on('pointerdown', () => {
      this.scene.start('StoreScene');
    });
  }
}
