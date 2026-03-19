import { productsData } from '../data/products.js';

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
          "We hope you had fun helping Alex choose what food items to buy!",
          "Along the way, you learned more about healthwashing, specifically how certain marketing tactics and claims can make products seem more nutritious than they actually are, or rely on claims that aren’t very meaningful.",
          "Next time you’re shopping, you’re now better equipped to make informed decisions about the food you buy!"
        ]
      },
      {
        title: 'Compare Your Results',
        content: [
          "Compare your results with other players to see how popular certain products are!"
        ]
      },
      {
        title: 'Broader Implications',
        content: [
          "Understanding tactics like healthwashing helps consumers interpret food media and marketing more critically. When people are aware of how labels, nutrient claims, and packaging design can shape perception, they are better equipped to evaluate products beyond the quick messages presented on the front of the package.Educating consumers about these strategies can also encourage greater transparency in the food industry. When marketing practices are more widely recognized and discussed, companies may be more likely to present information clearly and responsibly. Projects like this contribute to building stronger media literacy around food, helping consumers make more informed decisions while also promoting more ethical communication within food marketing."
        ]
      },
      {
        title: 'Ethical Considerations',
        content: [
          "Our game encourages users to think critically about food products and the health-related claims displayed on their packaging. However, we recognized that focusing only on the “healthiness” of food can create a restrictive mindset that overlooks the many other values food provides, including culture, enjoyment, affordability, and personal preference. Because of this, we were careful not to frame foods as simply “healthy” or “unhealthy.” Instead, the goal of the game is to highlight how marketing strategies can influence perceptions of health. For each product, we provide research-backed annotations that explain the claims being made and the marketing techniques being used. Importantly, the game never explicitly tells users whether a product is healthy or whether they should or should not purchase it. Instead, it provides information that allows players to make their own informed decisions about whether a product fits their needs and priorities. By doing this, the project encourages critical thinking about food marketing without promoting restrictive ideas about what people should eat."
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
          "Given that we had no experience coding games in Phaser or websites with high levels of interactivity and the short timeframe, we wanted to spin up a minimal viable product as quickly as possible which AI and 'vibe coding' are very helpful for. We mostly used Cursor and had it help us understand concepts, decide on a tech stack, generate starter code, and debugging, which allowed us to focus on core functionality and iterate more quickly."
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
    this.statsText = null;

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

    // Append checkout stats on "Compare Your Results" page
    if (this.pages[index]?.title === 'Compare Your Results') {
      // Always refresh when user visits (or revisits) the page
      this.checkoutStats = null;
      this.loadCheckoutStats();

      const { nextY } = this.renderCompareStats(blockLeft, y, textStyle, textWidth);
      y = nextY;
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

  renderCompareStats(blockLeft, y, textStyle, textWidth) {
    // Clear any prior references (contentContainer is already rebuilt each page)
    this.compareStatsRows = [];

    const totalLine = this.add.text(blockLeft, y, 'Loading checkout choices...', {
      ...textStyle,
      fontSize: 18,
      color: '#2d3436',
      fontStyle: 'bold'
    }).setOrigin(0, 0);
    this.contentContainer.add(totalLine);
    this.totalStatsText = totalLine;
    y += totalLine.height + 22;

    const barW = Math.min(520, textWidth - 40);
    const barH = 10;
    const barRadius = 6;
    const gapAfterBar = 18;

    for (const product of productsData) {
      const pretty = product.id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const lineText = this.add.text(blockLeft, y, `${pretty}: ...`, {
        ...textStyle,
        fontSize: 16,
        color: '#636e72'
      }).setOrigin(0, 0);
      this.contentContainer.add(lineText);
      y += lineText.height + 8;

      const barX = blockLeft;
      const barY = y;

      const outline = this.add.graphics();
      outline.lineStyle(2, 0xffffff, 1);
      outline.strokeRoundedRect(barX, barY, barW, barH, barRadius);
      this.contentContainer.add(outline);

      const fill = this.add.graphics();
      fill.fillStyle(product.color, 1);
      // start empty; updated when stats load
      fill.fillRoundedRect(barX, barY, 0, barH, barRadius);
      this.contentContainer.add(fill);

      y += barH + gapAfterBar;

      this.compareStatsRows.push({
        id: product.id,
        color: product.color,
        text: lineText,
        outline,
        fill,
        barX,
        barY,
        barW,
        barH,
        barRadius
      });
    }

    // First render with whatever we have (likely loading state)
    this.updateCompareStatsUI();

    return { nextY: y };
  }

  updateCompareStatsUI() {
    if (!this.totalStatsText || !this.compareStatsRows) return;

    if (!this.checkoutStats) {
      this.totalStatsText.setText('Loading checkout choices...');
      for (const row of this.compareStatsRows) {
        row.text.setText(`${row.id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}: ...`);
        row.fill.clear();
      }
      return;
    }

    const total = this.checkoutStats.total ?? 0;
    const products = this.checkoutStats.products ?? {};
    this.totalStatsText.setText(`Total checkouts recorded: ${total}`);

    for (const row of this.compareStatsRows) {
      const buyCount = products[row.id] ?? 0;
      const pct = total > 0 ? Math.round((buyCount / total) * 100) : 0;
      const pretty = row.id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      row.text.setText(`${pretty}: ${buyCount} chose "Buy" (${pct}%)`);

      row.fill.clear();
      const w = Math.round((pct / 100) * row.barW);
      row.fill.fillStyle(row.color, 1);
      row.fill.fillRoundedRect(row.barX, row.barY, w, row.barH, row.barRadius);
    }
  }

  async loadCheckoutStats() {
    const requestedForPage = this.currentPage;
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

      // Refresh stats text if we're still on the compare page we requested for
      if (this.currentPage === requestedForPage && this.pages[this.currentPage]?.title === 'Compare Your Results') {
        this.updateCompareStatsUI();

        // Recompute layout and scrollbar (last bar + padding)
        const width = this.cameras.main.width;
        const lastRow = this.compareStatsRows?.[this.compareStatsRows.length - 1];
        const bottomY = lastRow ? (lastRow.barY + lastRow.barH + 44) : (this.totalStatsText?.y + this.totalStatsText?.height + 44);
        this.contentHeight = bottomY;
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

