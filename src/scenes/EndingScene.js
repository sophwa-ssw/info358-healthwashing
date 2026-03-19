export class EndingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndingScene' });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add.rectangle(400, 300, width, height, 0xf5f0e1);

    this.pages = [
      {
        title: 'Thanks for Shopping with Alex!',
        content: [
          "You've reached the end of Alex's grocery trip. Along the way, you explored how food and drink packages can use healthwashing—claims, imagery, and buzzwords that make products seem healthier than they really are.",
          "By slowing down to notice specific words, symbols, and design choices, you practiced looking beyond the front of the package and thinking about the full nutritional picture."
        ]
      },
      {
        title: 'Bringing It Back to Real Life',
        content: [
          "The next time you're in a store (or scrolling through delivery apps), try using the same lens you used here:",
          "• Ask what the package is trying to make you feel or assume.",
          "• Look for what information is missing or minimized, especially around added sugars, sodium, and serving sizes.",
          "• Treat health buzzwords as starting points for questions, not proof that something is a healthy choice."
        ]
      },
      {
        title: 'Where to Go From Here',
        content: [
          "If this experience helped you notice new things about packaging, consider sharing what you learned with a friend or roommate the next time you shop together.",
          "Thank you for taking the time to explore healthwashing with Alex. We hope this gives you a bit more confidence—and a few more tools—for navigating the store on your own."
        ]
      },
      {
        title: 'About Us',
        content: [
          "This project was created by a group of college students learning how to navigate food and health on our own for the first time. Many of us grew up in households where food was deeply connected to culture, family, and home-cooked meals. Moving away for college meant suddenly being responsible for grocery shopping and daily food choices in a completely different environment.",
          "For the first time, many of us were relying on packaged foods, grocery store aisles, and quick decisions about what seemed like the \"healthiest\" options. Like a lot of students, it was easy to trust what appeared on the front of a package without thinking too much about it. Those choices sometimes came with uncertainty about whether the foods we were buying actually matched the healthy habits we were trying to build.",
          "Working on this project gave us the chance to slow down and look more closely at the kinds of messages we see every day when we shop for food. It also made us reflect on our own experiences as students balancing culture, convenience, health goals, and limited time.",
          "This game grew out of that shared experience. It represents our attempt to turn something we struggled with into something interactive and useful for others who might be navigating the same challenges."
        ]
      },
      {
        title: 'AI Use',
        content: [
          "Given that we had no experience coding games or really any website with this level of interactivity, we wanted to spin up a minimal viable product as quickly as possible which AI and 'vibe coding' is really good for. We mostly used Cursor and had it help us understand concepts, decide on a tech stack, generate starter code, and debugging, which allowed us to focus on core functionality and iterate more quickly."
        ]
      }
    ];

    this.currentPage = 0;
    this.scrollOffset = 0;

    this.contentAreaTop = 55;
    this.contentAreaHeight = height - 130;
    this.contentContainer = this.add.container(width / 2, this.contentAreaTop);
    this.add.existing(this.contentContainer);

    const maskShape = this.make.graphics({ add: false });
    maskShape.fillStyle(0xffffff, 1);
    maskShape.fillRect(0, this.contentAreaTop, width, this.contentAreaHeight);
    this.contentMask = maskShape.createGeometryMask();
    this.contentContainer.setMask(this.contentMask);

    this.input.on('wheel', (pointer, gameObjects, dx, dy) => {
      const max = this.maxScroll ?? 0;
      this.scrollOffset = Phaser.Math.Clamp(this.scrollOffset - dy, 0, max);
      this.contentContainer.setPosition(width / 2, this.contentAreaTop - this.scrollOffset);
      this.updateScrollbar();
    });

    this.scrollbarRightEdge = width - 19;
    this.scrollbarTrack = this.add.graphics().setDepth(50);
    this.scrollbarThumb = this.add.graphics().setDepth(51);

    this.buildNavigation();
    this.showPage(0);
    this.loadCheckoutStats();
  }

  buildNavigation() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const contentBottom = this.contentAreaTop + this.contentAreaHeight;
    const gapHeight = height - contentBottom;
    this.buttonsY = contentBottom + gapHeight / 2;
    const btnSize = 44;
    this.btnMargin = 50;
    this.prevBtnCenterX = this.btnMargin + btnSize / 2;
    this.nextBtnCenterX = width - this.btnMargin - btnSize / 2;
    const arrowStyle = {
      fontSize: '24px',
      fontFamily: 'Segoe UI, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    };

    this.prevBtnBg = this.add.graphics();
    this.prevBtn = this.add.text(this.prevBtnCenterX, this.buttonsY, '←', arrowStyle).setOrigin(0.5);
    this.prevHit = this.add.zone(this.prevBtnCenterX, this.buttonsY, btnSize, btnSize).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.prevHit.on('pointerdown', () => {
      if (this.currentPage > 0) {
        this.showPage(this.currentPage - 1);
      }
    });

    this.nextBtnBg = this.add.graphics();
    this.finishBtnBg = this.add.graphics();
    this.nextBtn = this.add.text(this.nextBtnCenterX, this.buttonsY, '→', arrowStyle).setOrigin(0.5);
    this.nextHit = this.add.zone(this.nextBtnCenterX, this.buttonsY, btnSize, btnSize).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.nextHit.on('pointerdown', () => {
      if (this.currentPage < this.pages.length - 1) {
        this.showPage(this.currentPage + 1);
      } else {
        this.scene.start('IntroScene');
      }
    });

    this.pageDotsContainer = this.add.container(width / 2, this.buttonsY);
    this.pageDots = [];
    this.pageDotHits = [];
    const dotRadius = 5;
    const dotSpacing = 14;
    const hitSize = 20;
    const totalPages = this.pages.length;
    const startX = -((totalPages - 1) * dotSpacing) / 2;
    for (let i = 0; i < totalPages; i++) {
      const g = this.add.graphics();
      this.pageDots.push(g);
      this.pageDotsContainer.add(g);
      const dotX = startX + i * dotSpacing;
      const hit = this.add.zone(dotX, 0, hitSize, hitSize).setOrigin(0.5).setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => this.showPage(i));
      this.pageDotHits.push(hit);
      this.pageDotsContainer.add(hit);
    }
    this.pageDotRadius = dotRadius;
    this.pageDotSpacing = dotSpacing;

    this.prevHit.on('pointerover', () => this.updateButtonHover(true, true));
    this.prevHit.on('pointerout', () => this.updateButtonHover(false, true));
    this.nextHit.on('pointerover', () => this.updateButtonHover(true, false));
    this.nextHit.on('pointerout', () => this.updateButtonHover(false, false));

    this.updateButtons();
  }

  updateButtons() {
    const width = this.cameras.main.width;
    const isFirst = this.currentPage === 0;
    const isLast = this.currentPage === this.pages.length - 1;
    const btnSize = 44;
    const finishBtnWidth = 100;

    this.prevBtn.setVisible(!isFirst);
    this.prevHit.setVisible(!isFirst);
    this.prevBtnBg.setVisible(!isFirst);

    this.nextBtnBg.setVisible(false);
    this.finishBtnBg.setVisible(false);

    const prevBtnLeft = this.prevBtnCenterX - btnSize / 2;
    const nextBtnLeft = this.nextBtnCenterX - btnSize / 2;
    const finishBtnLeft = this.nextBtnCenterX - finishBtnWidth / 2;

    if (isLast) {
      this.nextBtn.setText('Start Over').setFontSize(16);
      this.nextHit.setSize(finishBtnWidth, btnSize);
      this.finishBtnBg.setVisible(true);
      this.drawButton(this.finishBtnBg, finishBtnLeft, this.buttonsY - btnSize / 2, finishBtnWidth, btnSize, 0x00b894);
    } else {
      this.nextBtn.setText('→').setFontSize(24);
      this.nextHit.setSize(btnSize, btnSize);
      this.nextBtnBg.setVisible(true);
      this.drawButton(this.nextBtnBg, nextBtnLeft, this.buttonsY - btnSize / 2, btnSize, btnSize, 0x636e72);
    }

    if (!isFirst) {
      this.drawButton(this.prevBtnBg, prevBtnLeft, this.buttonsY - btnSize / 2, btnSize, btnSize, 0x636e72);
    } else {
      this.prevBtnBg.clear();
    }

    const r = this.pageDotRadius;
    const spacing = this.pageDotSpacing;
    const startX = -((this.pages.length - 1) * spacing) / 2;
    this.pageDots.forEach((g, i) => {
      g.clear();
      const x = startX + i * spacing;
      const isActive = i === this.currentPage;
      if (isActive) {
        g.fillStyle(0x636e72, 1);
        g.fillCircle(x, 0, r);
      } else {
        g.fillStyle(0xb2bec3, 0.7);
        g.fillCircle(x, 0, r);
      }
    });
  }

  drawButton(graphics, x, y, w, h, color) {
    graphics.clear();
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(x, y, w, h, 8);
  }

  updateButtonHover(hover, isPrev) {
    const btnSize = 44;
    const finishBtnWidth = 100;
    const prevBtnLeft = this.prevBtnCenterX - btnSize / 2;
    const nextBtnLeft = this.nextBtnCenterX - btnSize / 2;
    const finishBtnLeft = this.nextBtnCenterX - finishBtnWidth / 2;
    if (isPrev && this.currentPage > 0) {
      const color = hover ? 0x4a5568 : 0x636e72;
      this.drawButton(this.prevBtnBg, prevBtnLeft, this.buttonsY - btnSize / 2, btnSize, btnSize, color);
    } else if (!isPrev && this.currentPage < this.pages.length - 1) {
      const color = hover ? 0x4a5568 : 0x636e72;
      this.drawButton(this.nextBtnBg, nextBtnLeft, this.buttonsY - btnSize / 2, btnSize, btnSize, color);
    } else if (!isPrev) {
      this.drawButton(this.finishBtnBg, finishBtnLeft, this.buttonsY - btnSize / 2, finishBtnWidth, btnSize, hover ? 0x00997a : 0x00b894);
    }
  }

  showPage(index) {
    this.currentPage = index;
    this.scrollOffset = 0;
    this.contentContainer.removeAll(true);

    const width = this.cameras.main.width;
    const page = this.pages[index];

    const textWidth = 680;
    const bulletPrefix = '• ';
    const textStyle = {
      fontSize: '20px',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      color: '#2d3436',
      align: 'left',
      lineSpacing: 10,
      wordWrap: { width: textWidth, useAdvancedWrap: true }
    };

    let y = 20;
    const blockLeft = -textWidth / 2;

    if (page.title) {
      const title = this.add.text(0, y, page.title, {
        fontSize: '32px',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        color: '#2d3436',
        fontStyle: 'bold',
        align: 'center'
      }).setOrigin(0.5, 0);
      this.contentContainer.add(title);
      y += title.height + 28;
    }

    const bulletMeasurer = this.add.text(0, 0, bulletPrefix, textStyle).setVisible(false);
    const bulletWidth = bulletMeasurer.width;
    const bulletGap = 12;

    for (const item of page.content) {
      if (typeof item === 'string' && item.startsWith(bulletPrefix)) {
        const bullet = this.add.text(blockLeft, y, bulletPrefix, textStyle).setOrigin(0, 0);
        this.contentContainer.add(bullet);
        const content = item.slice(bulletPrefix.length);
        const contentStyle = {
          ...textStyle,
          wordWrap: { width: textWidth - bulletWidth - bulletGap, useAdvancedWrap: true }
        };
        const contentText = this.add.text(blockLeft + bulletWidth + bulletGap, y, content, contentStyle).setOrigin(0, 0);
        this.contentContainer.add(contentText);
        y += contentText.height + 24;
      } else if (typeof item === 'string') {
        const text = this.add.text(blockLeft, y, item, textStyle).setOrigin(0, 0);
        this.contentContainer.add(text);
        y += text.height + 24;
      }
    }

    bulletMeasurer.destroy();

    // Append checkout stats on first page
    if (index === 0) {
      const summary = this.buildStatsSummary();
      if (this.statsText) {
        this.statsText.setText(summary);
        this.statsText.setPosition(blockLeft, y);
      } else {
        this.statsText = this.add.text(blockLeft, y, summary, {
          ...textStyle,
          fontSize: 16,
          color: '#636e72'
        }).setOrigin(0, 0);
        this.contentContainer.add(this.statsText);
      }
      y += this.statsText.height + 24;
    }

    this.contentHeight = y + 20;
    this.maxScroll = Math.max(0, this.contentHeight - this.contentAreaHeight);
    this.contentContainer.setPosition(width / 2, this.contentAreaTop - this.scrollOffset);

    this.updateButtons();
    this.updateScrollbar();
  }

  buildStatsSummary() {
    if (!this.checkoutStats) {
      return 'Loading checkout choices...';
    }

    const total = this.checkoutStats.total ?? 0;
    const products = this.checkoutStats.products ?? {};
    const lines = [];

    lines.push(`Total checkouts recorded: ${total}`);

    Object.entries(products).forEach(([id, count]) => {
      const pretty = id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      lines.push(`${pretty}: ${count} chose "Buy"`);
    });

    return lines.join('\n');
  }

  async loadCheckoutStats() {
    try {
      const response = await fetch('/checkout-stats');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || 'Failed to load stats');
      }
      this.checkoutStats = { total: data.total || 0, products: data.products || {} };

      // If we're on the first page, refresh the stats text in place
      if (this.currentPage === 0 && this.statsText) {
        const summary = this.buildStatsSummary();
        this.statsText.setText(summary);

        // Recompute layout and scrollbar
        const width = this.cameras.main.width;
        this.contentHeight = this.statsText.y + this.statsText.height + 44;
        this.maxScroll = Math.max(0, this.contentHeight - this.contentAreaHeight);
        this.contentContainer.setPosition(width / 2, this.contentAreaTop - this.scrollOffset);
        this.updateScrollbar();
      }
    } catch (error) {
      console.error('Failed to load checkout stats:', error);
    }
  }

  updateScrollbar() {
    const width = this.cameras.main.width;
    const hasScroll = (this.maxScroll ?? 0) > 0;

    this.scrollbarTrack.setVisible(hasScroll);
    this.scrollbarThumb.setVisible(hasScroll);

    if (!hasScroll) return;

    const trackX = width - 22;
    const trackW = 6;
    const trackH = this.contentAreaHeight;
    const minThumbH = 40;
    const thumbH = Math.max(minThumbH, (this.contentAreaHeight / this.contentHeight) * trackH);
    const thumbRange = trackH - thumbH;
    const thumbY = this.contentAreaTop + (this.scrollOffset / this.maxScroll) * thumbRange;

    this.scrollbarTrack.clear();
    this.scrollbarTrack.fillStyle(0xd1d8e0, 0.5);
    this.scrollbarTrack.fillRoundedRect(trackX - trackW / 2, this.contentAreaTop, trackW, trackH, 3);

    this.scrollbarThumb.clear();
    this.scrollbarThumb.fillStyle(0x636e72, 0.8);
    this.scrollbarThumb.fillRoundedRect(trackX - trackW / 2 + 1, thumbY, trackW - 2, thumbH, 3);
  }
}

