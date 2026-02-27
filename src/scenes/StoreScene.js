import { productsData } from '../data/products.js';

const TRIGGER_DISTANCE = 40;

export class StoreScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StoreScene' });
    this.modalOpen = false;
    this.modalCooldown = false;
  }

  create() {
    this.drawStore();
    this.createPlayer();
    this.createProducts();
    this.setupModal();
    this.setupHUD();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
  }

  /* ── Store Layout ── */

  drawStore() {
    this.add.rectangle(400, 300, 800, 600, 0xf5f0e1);

    const tileGraphics = this.add.graphics();
    tileGraphics.lineStyle(1, 0xe0dbd0, 0.3);
    for (let x = 0; x <= 800; x += 50) {
      tileGraphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      tileGraphics.lineBetween(0, y, 800, y);
    }

    this.shelves = [];
  }

  /* ── Player ── */

  createPlayer() {
    const pg = this.make.graphics({ add: false });
    pg.fillStyle(0x636e72, 1);
    pg.fillCircle(16, 16, 16);
    pg.generateTexture('player', 32, 32);
    pg.destroy();

    this.player = this.add.sprite(400, 550, 'player');
    this.playerSpeed = 160;
  }

  /* ── Products ── */

  createProducts() {
    this.products = [];
    this.inspectedProducts = new Set();

    productsData.forEach(product => {
      const g = this.make.graphics({ add: false });
      g.fillStyle(product.color, 1);
      g.fillRoundedRect(0, 0, 36, 36, 6);
      const key = `product-${product.id}`;
      g.generateTexture(key, 36, 36);
      g.destroy();

      const sprite = this.add.sprite(product.position.x, product.position.y, key);
      sprite.setData('productData', product);

      this.add.text(product.position.x, product.position.y + 28, product.name, {
        fontSize: '9px',
        fontFamily: 'sans-serif',
        color: '#636e72',
        align: 'center'
      }).setOrigin(0.5);

      this.products.push(sprite);
    });
  }

  /* ── Modal (DOM) ── */

  setupModal() {
    this.modalEl = document.getElementById('product-modal');
    this.modalNameEl = document.getElementById('modal-product-name');
    this.modalCloseBtn = document.getElementById('modal-close');

    this.modalCloseBtn.addEventListener('click', () => this.closeModal());
  }

  openModal(productData, sprite) {
    this.modalOpen = true;
    this.modalNameEl.textContent = productData.name;
    this.modalEl.classList.remove('hidden');
    this.currentProductSprite = sprite;
  }

  closeModal() {
    this.modalEl.classList.add('hidden');
    this.modalOpen = false;
    this.modalCooldown = true;

    if (this.currentProductSprite) {
      const data = this.currentProductSprite.getData('productData');
      this.inspectedProducts.add(data.id);
      this.currentProductSprite = null;
    }

    this.time.delayedCall(800, () => {
      this.modalCooldown = false;
    });
  }

  /* ── HUD ── */

  setupHUD() {
  }

  updateHUD() {
  }

  /* ── Collision helpers ── */

  rectContains(rect, px, py, hw, hh) {
    const left = rect.x - rect.w / 2;
    const right = rect.x + rect.w / 2;
    const top = rect.y - rect.h / 2;
    const bottom = rect.y + rect.h / 2;

    const pLeft = px - hw;
    const pRight = px + hw;
    const pTop = py - hh;
    const pBottom = py + hh;

    return pRight > left && pLeft < right && pBottom > top && pTop < bottom;
  }

  resolveRect(rect, px, py, hw, hh) {
    const overlapLeft = (px + hw) - (rect.x - rect.w / 2);
    const overlapRight = (rect.x + rect.w / 2) - (px - hw);
    const overlapTop = (py + hh) - (rect.y - rect.h / 2);
    const overlapBottom = (rect.y + rect.h / 2) - (py - hh);

    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

    if (minOverlap === overlapLeft) return { x: px - overlapLeft, y: py };
    if (minOverlap === overlapRight) return { x: px + overlapRight, y: py };
    if (minOverlap === overlapTop) return { x: px, y: py - overlapTop };
    return { x: px, y: py + overlapBottom };
  }

  /* ── Game Loop ── */

  update(time, delta) {
    if (this.modalOpen) return;

    const speed = this.playerSpeed;
    const dt = delta / 1000;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) vx = -1;
    else if (this.cursors.right.isDown || this.wasd.right.isDown) vx = 1;

    if (this.cursors.up.isDown || this.wasd.up.isDown) vy = -1;
    else if (this.cursors.down.isDown || this.wasd.down.isDown) vy = 1;

    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    let nx = this.player.x + vx * speed * dt;
    let ny = this.player.y + vy * speed * dt;

    const hw = 12;
    const hh = 14;

    // Clamp to world bounds
    nx = Phaser.Math.Clamp(nx, hw, 800 - hw);
    ny = Phaser.Math.Clamp(ny, hh, 600 - hh);

    // Resolve shelf collisions
    for (const shelf of this.shelves) {
      if (this.rectContains(shelf, nx, ny, hw, hh)) {
        const resolved = this.resolveRect(shelf, nx, ny, hw, hh);
        nx = resolved.x;
        ny = resolved.y;
      }
    }

    // Resolve product collisions (always block, even after inspected)
    let triggeredProduct = null;
    for (const sprite of this.products) {
      const rect = { x: sprite.x, y: sprite.y, w: 36, h: 36 };
      if (this.rectContains(rect, nx, ny, hw, hh)) {
        const resolved = this.resolveRect(rect, nx, ny, hw, hh);
        nx = resolved.x;
        ny = resolved.y;

        if (!this.modalCooldown) {
          triggeredProduct = sprite;
        }
      }
    }

    this.player.x = nx;
    this.player.y = ny;

    if (triggeredProduct) {
      this.openModal(triggeredProduct.getData('productData'), triggeredProduct);
    }
  }
}
