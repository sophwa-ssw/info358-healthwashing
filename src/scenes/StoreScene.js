import { productsData } from '../data/products.js';

const TRIGGER_DISTANCE = 40;

export class StoreScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StoreScene' });
    this.modalOpen = false;
    this.modalCooldown = false;
  }

  create() {
    this.hotspotsData = {};
    this.drawStore();
    this.createPlayer();
    this.createProducts();
    this.setupModal();
    this.setupHUD();
    this.loadHotspots();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
  }

  loadHotspots() {
    fetch('src/data/hotspots.json')
      .then(r => r.json())
      .then(data => { this.hotspotsData = data; })
      .catch(() => { this.hotspotsData = {}; });
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
    this.phaseSelect = document.getElementById('phase-select');
    this.phaseReveal = document.getElementById('phase-reveal');
    this.phaseEmpty = document.getElementById('phase-empty');
    this.imageContainer = document.getElementById('image-container');
    this.frontImgWrapper = document.getElementById('front-img-wrapper');
    this.imagesRow = document.querySelector('.images-row');
    this.splitter = document.getElementById('modal-splitter');
    this.modalImage = document.getElementById('modal-image');
    this.btnSubmit = document.getElementById('btn-submit');
    this.btnContinue = document.getElementById('btn-continue');
    this.btnEmptyClose = document.getElementById('btn-empty-close');
    this.revealUser = document.getElementById('reveal-user');
    this.revealOurs = document.getElementById('reveal-ours');
    this.revealSummary = document.getElementById('reveal-summary');

    this.selectedHotspots = new Set();
    this.individualSelections = new Set();
    this.userReasons = {};
    this.currentProductData = null;
    this.selectionGroups = [];
    this.pendingGroup = [];
    this.groupCounter = 0;
    this.hotspotGroupMap = {};
    this.reasoningArea = document.getElementById('reasoning-area');
    this.inReveal = false;

    this._shiftUpHandler = (e) => {
      if (e.key === 'Shift' && this.modalOpen) this.finalizePendingGroup();
    };
    window.addEventListener('keyup', this._shiftUpHandler);

    this.setupZoom();
    this.setupSplitter();

    this.modalCloseBtn.addEventListener('click', () => this.closeModal());
    this.btnSubmit.addEventListener('click', () => this.submitSelections());
    this.btnContinue.addEventListener('click', () => this.closeModal());
    this.btnEmptyClose.addEventListener('click', () => this.closeModal());
  }

  setupZoom() {
    const container = this.frontImgWrapper;
    const inner = document.getElementById('zoom-inner');
    this.zoomed = false;
    this.panState = null;

    const applyZoom = (origin, transform) => {
      inner.style.transformOrigin = origin;
      inner.style.transform = transform;
    };

    container.addEventListener('dblclick', (e) => {
      e.preventDefault();
      if (e.target.closest('.hotspot')) return;

      this.zoomed = !this.zoomed;

      if (this.zoomed) {
        const rect = container.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) / rect.width;
        const clickY = (e.clientY - rect.top) / rect.height;
        const origin = `${clickX * 100}% ${clickY * 100}%`;
        applyZoom(origin, 'scale(2.5)');
        container.classList.add('zoomed');
      } else {
        applyZoom('center center', 'scale(1)');
        container.classList.remove('zoomed');
      }
    });

    container.addEventListener('mousedown', (e) => {
      if (!this.zoomed) return;
      if (e.target.closest('.hotspot')) return;
      e.preventDefault();
      this.panState = { startX: e.clientX, startY: e.clientY, origOrigin: inner.style.transformOrigin };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.panState) return;
      const rect = container.getBoundingClientRect();
      const dx = (e.clientX - this.panState.startX) / rect.width * 100;
      const dy = (e.clientY - this.panState.startY) / rect.height * 100;

      const orig = this.panState.origOrigin.split(' ');
      const ox = parseFloat(orig[0]) - dx;
      const oy = parseFloat(orig[1]) - dy;
      const newOrigin = `${ox}% ${oy}%`;
      applyZoom(newOrigin, inner.style.transform);
      this.panState.startX = e.clientX;
      this.panState.startY = e.clientY;
      this.panState.origOrigin = newOrigin;
    });

    window.addEventListener('mouseup', () => {
      this.panState = null;
    });
  }

  setupSplitter() {
    if (!this.splitter || !this.imagesRow) return;

    let dragging = false;
    let startY = 0;
    let startHeight = 0;

    const minHeight = 140;

    const onMouseMove = (e) => {
      if (!dragging) return;
      const dy = e.clientY - startY;
      let newH = startHeight + dy;
      const maxH = this.imagesRowNaturalHeight ?? 999;
      if (newH < minHeight) newH = minHeight;
      if (newH >= maxH) {
        this.imagesRow.style.height = '';
      } else {
        this.imagesRow.style.height = `${newH}px`;
      }
    };

    const onMouseUp = () => {
      if (!dragging) return;
      dragging = false;
      document.body.style.cursor = '';
      if (this.modalOpen) this.updateLeaderCircleAspectRatios();
    };

    this.splitter.addEventListener('mousedown', (e) => {
      e.preventDefault();
      dragging = true;
      startY = e.clientY;
      startHeight = this.imagesRow.getBoundingClientRect().height;
      if (!this.imagesRow.style.height) this.imagesRowNaturalHeight = startHeight;
      document.body.style.cursor = 'row-resize';
    });

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  openModal(productData, sprite) {
    this.modalOpen = true;
    this.inReveal = false;
    this.currentProductSprite = sprite;
    this.currentProductData = productData;
    this.selectedHotspots.clear();
    this.individualSelections.clear();
    this.userReasons = {};
    this.selectionGroups = [];
    this.pendingGroup = [];
    this.groupCounter = 0;
    this.hotspotGroupMap = {};
    this.reasoningArea.innerHTML = '';
    this.modalNameEl.textContent = productData.name;

    this.phaseSelect.classList.add('hidden');
    this.phaseReveal.classList.add('hidden');
    this.phaseEmpty.classList.add('hidden');

    this.modalEl.classList.remove(...Array.from(this.modalEl.classList).filter(c => c.startsWith('product-')));
    this.modalEl.classList.add('product-' + productData.id);

    const Keys = Phaser.Input.Keyboard.KeyCodes;
    this._capturedKeys = [Keys.W, Keys.A, Keys.S, Keys.D, Keys.SPACE, Keys.UP, Keys.DOWN, Keys.LEFT, Keys.RIGHT];
    this.input.keyboard.removeCapture(this._capturedKeys);

    if (document.activeElement && document.activeElement.closest?.('#game-container')) {
      document.activeElement.blur();
    }

    if (!productData.images) {
      this.phaseEmpty.classList.remove('hidden');
      this.modalEl.classList.remove('hidden');
      return;
    }

    const hs = this.hotspotsData[productData.id] || { front: [], ingredients: [], nutrition: [] };
    this.allHotspotRefs = [];

    this.modalImage.src = productData.images.front;
    this.buildHotspots(hs.front);
    this.buildExtraImages(productData.images, hs);
    this.imagesRow.style.height = '';
    this.splitter.classList.add('hidden');
    this.phaseSelect.classList.remove('hidden');
    this.modalEl.classList.remove('hidden');

    this.time.delayedCall(50, () => {
      if (this.imagesRow) this.imagesRowNaturalHeight = this.imagesRow.getBoundingClientRect().height;
      this.updateLeaderCircleAspectRatios();
      this._leaderResizeObserver?.disconnect();
      this._leaderResizeObserver = new ResizeObserver(() => this.updateLeaderCircleAspectRatios());
      if (this.imagesRow) this._leaderResizeObserver.observe(this.imagesRow);
    });
  }

  updateLeaderCircleAspectRatios() {
    const baseR = 1.8;
    this.modalEl.querySelectorAll('.leader-overlay').forEach((svg) => {
      const rect = svg.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w <= 0 || h <= 0) return;
      const minSvg = Math.min(w, h);
      const wrapper = svg.closest('.extra-img-wrapper');
      let effectiveMin = minSvg;
      if (wrapper) {
        const wr = wrapper.getBoundingClientRect();
        const minWrap = Math.min(wr.width, wr.height);
        if (minWrap > 0) {
          effectiveMin = Math.min(minWrap, minSvg * 2);
        }
      }
      const rx = (baseR * effectiveMin) / w;
      const ry = (baseR * effectiveMin) / h;
      svg.querySelectorAll('.leader-number ellipse').forEach((el) => {
        el.setAttribute('rx', String(rx));
        el.setAttribute('ry', String(ry));
      });
    });
  }

  buildExtraImages(images, hs) {
    const container = document.getElementById('extra-images');
    container.innerHTML = '';
    const entries = [
      { src: images.ingredients, hotspots: hs.ingredients || [] },
      { src: images.nutrition, hotspots: hs.nutrition || [] }
    ];
    const bySrc = new Map();
    for (const { src, hotspots } of entries) {
      if (!src) continue;
      if (!bySrc.has(src)) bySrc.set(src, { src, hotspots: [] });
      bySrc.get(src).hotspots.push(...hotspots);
    }
    const pairs = Array.from(bySrc.values());
    if (pairs.length === 1) {
      this.imagesRow.classList.add('images-row--equal-panels');
    } else {
      this.imagesRow.classList.remove('images-row--equal-panels');
    }
    pairs.forEach(({ src, hotspots }) => {
      if (!src) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'extra-img-wrapper';

      const inner = document.createElement('div');
      inner.className = 'extra-zoom-inner';
      const img = document.createElement('img');
      img.src = src;
      img.alt = 'Product info';
      inner.appendChild(img);
      wrapper.appendChild(inner);

      if (hotspots.length) {
        this.buildExtraHotspots(wrapper, inner, hotspots);
      }

      this.setupExtraZoom(wrapper, inner);
      container.appendChild(wrapper);
    });
  }

  setupExtraZoom(wrapper, inner) {
    let zoomed = false;
    let panState = null;

    const applyZoom = (origin, transform) => {
      inner.style.transformOrigin = origin;
      inner.style.transform = transform;
    };

    wrapper.addEventListener('dblclick', (e) => {
      e.preventDefault();
      if (e.target.closest('.hotspot')) return;

      zoomed = !zoomed;
      if (zoomed) {
        const rect = wrapper.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) / rect.width;
        const clickY = (e.clientY - rect.top) / rect.height;
        const origin = `${clickX * 100}% ${clickY * 100}%`;
        applyZoom(origin, 'scale(2.5)');
        wrapper.classList.add('zoomed');
      } else {
        applyZoom('center center', 'scale(1)');
        wrapper.classList.remove('zoomed');
      }
    });

    wrapper.addEventListener('mousedown', (e) => {
      if (!zoomed) return;
      if (e.target.closest('.hotspot')) return;
      e.preventDefault();
      panState = { startX: e.clientX, startY: e.clientY, origOrigin: inner.style.transformOrigin };
    });

    const onMove = (e) => {
      if (!panState) return;
      const rect = wrapper.getBoundingClientRect();
      const dx = (e.clientX - panState.startX) / rect.width * 100;
      const dy = (e.clientY - panState.startY) / rect.height * 100;
      const orig = panState.origOrigin.split(' ');
      const ox = parseFloat(orig[0]) - dx;
      const oy = parseFloat(orig[1]) - dy;
      const newOrigin = `${ox}% ${oy}%`;
      applyZoom(newOrigin, inner.style.transform);
      panState.startX = e.clientX;
      panState.startY = e.clientY;
      panState.origOrigin = newOrigin;
    };

    const onUp = () => { panState = null; };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  buildExtraHotspots(wrapper, inner, hotspots) {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.classList.add('leader-overlay');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');

    const r = 1.8;
    const lineLen = 4;
    const placed = [];
    const globalOffset = this.allHotspotRefs.length;
    const leaderData = [];

    hotspots.forEach((h, i) => {
      const globalIdx = globalOffset + i;
      const div = document.createElement('div');
      div.className = 'hotspot';
      div.dataset.id = h.id;
      div.dataset.globalIdx = globalIdx;
      div.style.left = h.left + '%';
      div.style.top = h.top + '%';
      div.style.width = h.width + '%';
      div.style.height = h.height + '%';

      div.addEventListener('click', (e) => {
        if (this.inReveal) return;
        e.stopPropagation();
        this.handleHotspotClick(h.id, globalIdx, e);
      });

      div.addEventListener('mouseenter', () => {
        if (this.inReveal) return;
        const ln = svg.querySelector(`.leader-line[data-index="${globalIdx}"]`);
        const nm = svg.querySelector(`.leader-number[data-index="${globalIdx}"]`);
        if (ln) ln.classList.add('hovered');
        if (nm) nm.classList.add('hovered');
      });

      div.addEventListener('mouseleave', () => {
        if (this.inReveal) return;
        const ln = svg.querySelector(`.leader-line[data-index="${globalIdx}"]`);
        const nm = svg.querySelector(`.leader-number[data-index="${globalIdx}"]`);
        if (ln) ln.classList.remove('hovered');
        if (nm) nm.classList.remove('hovered');
      });

      inner.appendChild(div);
      this.allHotspotRefs.push({ id: h.id, el: div, container: wrapper });

      const cx = h.left + h.width / 2;
      const cy = h.top + h.height / 2;

      const candidates = [
        { nx: h.left - lineLen - r, ny: cy, lx: h.left, ly: cy },
        { nx: h.left + h.width + lineLen + r, ny: cy, lx: h.left + h.width, ly: cy },
        { nx: cx, ny: h.top - lineLen - r, lx: cx, ly: h.top },
        { nx: cx, ny: h.top + h.height + lineLen + r, lx: cx, ly: h.top + h.height },
      ];

      let best = null;
      let bestScore = -Infinity;

      for (const c of candidates) {
        if (c.nx < 1 || c.nx > 99 || c.ny < 1 || c.ny > 99) continue;
        let score = 0;
        for (const other of hotspots) {
          if (c.nx > other.left - r && c.nx < other.left + other.width + r &&
              c.ny > other.top - r && c.ny < other.top + other.height + r) {
            score -= 10;
          }
        }
        for (const p of placed) {
          const dist = Math.sqrt((c.nx - p.x) ** 2 + (c.ny - p.y) ** 2);
          if (dist < 4) score -= (4 - dist) * 3;
        }
        if (best === null || score > bestScore) {
          best = c;
          bestScore = score;
        }
      }

      if (!best) best = candidates[0];
      placed.push({ x: best.nx, y: best.ny });

      const dx = best.nx - best.lx;
      const dy = best.ny - best.ly;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const endX = dist > 0 ? best.nx - (dx / dist) * r : best.nx;
      const endY = dist > 0 ? best.ny - (dy / dist) * r : best.ny;

      leaderData.push({ globalIdx, lx: best.lx, ly: best.ly, nx: best.nx, ny: best.ny, endX, endY });

      const line = document.createElementNS(NS, 'line');
      line.classList.add('leader-line');
      line.dataset.index = globalIdx;
      line.setAttribute('x1', best.lx);
      line.setAttribute('y1', best.ly);
      line.setAttribute('x2', endX);
      line.setAttribute('y2', endY);
      line.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(line);

      const g = document.createElementNS(NS, 'g');
      g.classList.add('leader-number');
      g.dataset.index = globalIdx;
      g.dataset.id = h.id;

      const ellipse = document.createElementNS(NS, 'ellipse');
      ellipse.setAttribute('cx', best.nx);
      ellipse.setAttribute('cy', best.ny);
      ellipse.setAttribute('rx', String(r));
      ellipse.setAttribute('ry', String(r));
      ellipse.setAttribute('vector-effect', 'non-scaling-stroke');
      g.appendChild(ellipse);

      const text = document.createElementNS(NS, 'text');
      text.setAttribute('x', best.nx);
      text.setAttribute('y', best.ny);
      text.textContent = globalIdx + 1;
      text.setAttribute('vector-effect', 'non-scaling-stroke');
      g.appendChild(text);

      g.addEventListener('click', (e) => {
        if (this.inReveal) return;
        e.stopPropagation();
        this.handleHotspotClick(h.id, globalIdx, e);
      });

      svg.appendChild(g);
    });

    inner.appendChild(svg);
  }

  buildHotspots(hotspots) {
    const zoomInner = document.getElementById('zoom-inner');
    zoomInner.querySelectorAll('.hotspot').forEach(el => el.remove());
    const oldSvg = this.frontImgWrapper.querySelector('.leader-overlay') || zoomInner.querySelector('.leader-overlay');
    if (oldSvg) oldSvg.remove();

    this.zoomed = false;
    zoomInner.style.transform = 'scale(1)';
    zoomInner.style.transformOrigin = 'center center';
    this.frontImgWrapper.classList.remove('zoomed');

    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.classList.add('leader-overlay');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');

    const r = 1.8;
    const lineLen = 4;
    const placed = [];
    const mainLeaderData = [];

    hotspots.forEach((hs, index) => {
      const div = document.createElement('div');
      div.className = 'hotspot';
      div.dataset.id = hs.id;
      div.style.left = hs.left + '%';
      div.style.top = hs.top + '%';
      div.style.width = hs.width + '%';
      div.style.height = hs.height + '%';

      div.addEventListener('click', (e) => {
        if (this.inReveal) return;
        e.stopPropagation();
        this.handleHotspotClick(hs.id, index, e);
      });

      div.addEventListener('mouseenter', () => {
        if (this.inReveal) return;
        const ln = svg.querySelector(`.leader-line[data-index="${index}"]`);
        const nm = svg.querySelector(`.leader-number[data-index="${index}"]`);
        if (ln) ln.classList.add('hovered');
        if (nm) nm.classList.add('hovered');
      });

      div.addEventListener('mouseleave', () => {
        if (this.inReveal) return;
        const ln = svg.querySelector(`.leader-line[data-index="${index}"]`);
        const nm = svg.querySelector(`.leader-number[data-index="${index}"]`);
        if (ln) ln.classList.remove('hovered');
        if (nm) nm.classList.remove('hovered');
      });

      zoomInner.appendChild(div);
      this.allHotspotRefs.push({ id: hs.id, el: div, container: this.frontImgWrapper });

      const cx = hs.left + hs.width / 2;
      const cy = hs.top + hs.height / 2;

      // Try placing the number at each side of the box, pick best
      const candidates = [
        { nx: hs.left - lineLen - r, ny: cy, lx: hs.left, ly: cy },                          // left
        { nx: hs.left + hs.width + lineLen + r, ny: cy, lx: hs.left + hs.width, ly: cy },    // right
        { nx: cx, ny: hs.top - lineLen - r, lx: cx, ly: hs.top },                             // top
        { nx: cx, ny: hs.top + hs.height + lineLen + r, lx: cx, ly: hs.top + hs.height },    // bottom
      ];

      // Pick candidate with least overlap with already placed numbers and other boxes
      let best = null;
      let bestScore = -Infinity;

      for (const c of candidates) {
        if (c.nx < 1 || c.nx > 99 || c.ny < 1 || c.ny > 99) continue;

        let score = 0;
        // Penalize overlap with other boxes
        for (const other of hotspots) {
          if (c.nx > other.left - r && c.nx < other.left + other.width + r &&
              c.ny > other.top - r && c.ny < other.top + other.height + r) {
            score -= 10;
          }
        }
        // Penalize closeness to already placed numbers
        for (const p of placed) {
          const dist = Math.sqrt((c.nx - p.x) ** 2 + (c.ny - p.y) ** 2);
          if (dist < 4) score -= (4 - dist) * 3;
        }

        if (best === null || score > bestScore) {
          best = c;
          bestScore = score;
        }
      }

      if (!best) best = candidates[0];
      placed.push({ x: best.nx, y: best.ny });

      // Shorten line so it stops at the circle edge, not the center
      const dx = best.nx - best.lx;
      const dy = best.ny - best.ly;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const endX = dist > 0 ? best.nx - (dx / dist) * r : best.nx;
      const endY = dist > 0 ? best.ny - (dy / dist) * r : best.ny;

      mainLeaderData.push({ globalIdx: index, lx: best.lx, ly: best.ly, nx: best.nx, ny: best.ny, endX, endY });

      const line = document.createElementNS(NS, 'line');
      line.classList.add('leader-line');
      line.dataset.index = index;
      line.setAttribute('x1', best.lx);
      line.setAttribute('y1', best.ly);
      line.setAttribute('x2', endX);
      line.setAttribute('y2', endY);
      line.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(line);

      const g = document.createElementNS(NS, 'g');
      g.classList.add('leader-number');
      g.dataset.index = index;
      g.dataset.id = hs.id;

      const ellipse = document.createElementNS(NS, 'ellipse');
      ellipse.setAttribute('cx', best.nx);
      ellipse.setAttribute('cy', best.ny);
      ellipse.setAttribute('rx', String(r));
      ellipse.setAttribute('ry', String(r));
      ellipse.setAttribute('vector-effect', 'non-scaling-stroke');
      g.appendChild(ellipse);

      const text = document.createElementNS(NS, 'text');
      text.setAttribute('x', best.nx);
      text.setAttribute('y', best.ny);
      text.textContent = index + 1;
      text.setAttribute('vector-effect', 'non-scaling-stroke');
      g.appendChild(text);

      g.addEventListener('click', (e) => {
        if (this.inReveal) return;
        e.stopPropagation();
        this.handleHotspotClick(hs.id, index, e);
      });

      svg.appendChild(g);
    });

    zoomInner.appendChild(svg);
  }

  handleHotspotClick(id, globalIdx, event) {
    if (event.shiftKey) {
      this.handleGroupClick(id, globalIdx);
    } else {
      this.finalizePendingGroup();
      this.handleIndividualClick(id, globalIdx);
    }
  }

  handleGroupClick(id, globalIdx) {
    const pendingIdx = this.pendingGroup.indexOf(id);
    if (pendingIdx >= 0) {
      this.pendingGroup.splice(pendingIdx, 1);
      if (!this.individualSelections.has(id)) {
        this.selectedHotspots.delete(id);
      }
      this.updateHotspotVisual(id, globalIdx);
      return;
    }

    if (this.hotspotGroupMap[id]) {
      this.removeFromGroup(id);
    }

    this.pendingGroup.push(id);
    this.selectedHotspots.add(id);
    this.updateHotspotVisual(id, globalIdx);
  }

  handleIndividualClick(id, globalIdx) {
    const isIndividual = this.individualSelections.has(id);
    if (isIndividual) {
      this.individualSelections.delete(id);
      this.removeReasoningInput(id);
      if (!this.hotspotGroupMap[id] && !this.pendingGroup.includes(id)) {
        this.selectedHotspots.delete(id);
      }
    } else {
      this.individualSelections.add(id);
      this.selectedHotspots.add(id);
      this.addReasoningInput(id, globalIdx);
    }
    this.updateHotspotVisual(id, globalIdx);
  }

  finalizePendingGroup() {
    if (this.pendingGroup.length === 0) return;

    const pending = [...this.pendingGroup];
    this.pendingGroup = [];

    if (pending.length === 1) {
      const id = pending[0];
      const gi = this.allHotspotRefs.findIndex(r => r.id === id);
      if (!this.individualSelections.has(id)) {
        this.individualSelections.add(id);
        this.addReasoningInput(id, gi);
      }
      this.updateHotspotVisual(id, gi);
    } else {
      const groupKey = `group-${this.groupCounter++}`;
      const group = { ids: [...pending], key: groupKey };
      this.selectionGroups.push(group);

      for (const gid of group.ids) {
        this.hotspotGroupMap[gid] = groupKey;
        const gi = this.allHotspotRefs.findIndex(r => r.id === gid);
        this.updateHotspotVisual(gid, gi);
      }

      this.addGroupReasoningInput(group);
    }
  }

  updateHotspotVisual(id, globalIdx) {
    const ref = this.allHotspotRefs[globalIdx];
    if (!ref) return;

    const isIndividual = this.individualSelections.has(id);
    const isGrouped = !!this.hotspotGroupMap[id];
    const isPending = this.pendingGroup.includes(id);

    ref.el.classList.remove('selected', 'grouping', 'grouped');
    if (isPending) ref.el.classList.add('grouping');
    if (isGrouped) ref.el.classList.add('grouped');
    if (isIndividual) ref.el.classList.add('selected');

    const svg = ref.container.querySelector('.leader-overlay');
    if (!svg) return;

    const line = svg.querySelector(`.leader-line[data-index="${globalIdx}"]`);
    const numG = svg.querySelector(`.leader-number[data-index="${globalIdx}"]`);

    for (const el of [line, numG]) {
      if (!el) continue;
      el.classList.remove('selected', 'grouping', 'grouped');
      if (isPending) el.classList.add('grouping');
      if (isGrouped) el.classList.add('grouped');
      if (isIndividual) el.classList.add('selected');
    }
  }

  removeFromGroup(id) {
    const groupKey = this.hotspotGroupMap[id];
    if (!groupKey) return;

    const groupIdx = this.selectionGroups.findIndex(g => g.key === groupKey);
    if (groupIdx < 0) return;

    const group = this.selectionGroups[groupIdx];
    group.ids = group.ids.filter(gid => gid !== id);
    delete this.hotspotGroupMap[id];

    if (!this.individualSelections.has(id)) {
      this.selectedHotspots.delete(id);
    }

    const savedReason = this.userReasons[groupKey];
    this.removeReasoningInput(groupKey);

    if (group.ids.length <= 1) {
      if (group.ids.length === 1) {
        const remainId = group.ids[0];
        delete this.hotspotGroupMap[remainId];
        const ri = this.allHotspotRefs.findIndex(r => r.id === remainId);
        if (!this.individualSelections.has(remainId)) {
          this.individualSelections.add(remainId);
          this.selectedHotspots.add(remainId);
          this.addReasoningInput(remainId, ri);
        }
        this.updateHotspotVisual(remainId, ri);
      }
      this.selectionGroups.splice(groupIdx, 1);
    } else {
      this.userReasons[groupKey] = savedReason;
      this.addGroupReasoningInput(group);
    }

    const gi = this.allHotspotRefs.findIndex(r => r.id === id);
    this.updateHotspotVisual(id, gi);
  }

  addGroupReasoningInput(group) {
    const entry = document.createElement('div');
    entry.className = 'reasoning-entry group-entry';
    entry.dataset.id = group.key;

    const nums = group.ids.map(gid => {
      const idx = this.allHotspotRefs.findIndex(r => r.id === gid);
      return idx + 1;
    }).sort((a, b) => a - b);

    const minIdx = Math.min(...nums) - 1;
    entry.dataset.order = minIdx;

    const label = document.createElement('span');
    label.className = 'reason-label group-label';
    label.textContent = nums.join('+');

    const textarea = document.createElement('textarea');
    textarea.placeholder = 'How do these elements work together to mislead?';
    textarea.rows = 2;
    textarea.value = this.userReasons[group.key] || '';
    textarea.addEventListener('input', () => {
      this.userReasons[group.key] = textarea.value;
    });

    entry.appendChild(label);
    entry.appendChild(textarea);

    const existing = this.reasoningArea.querySelectorAll('.reasoning-entry');
    let inserted = false;
    for (const el of existing) {
      if (Number(el.dataset.order) > minIdx) {
        this.reasoningArea.insertBefore(entry, el);
        inserted = true;
        break;
      }
    }
    if (!inserted) this.reasoningArea.appendChild(entry);
  }

  getUserReason(id) {
    const parts = [];
    if (this.userReasons[id]) parts.push(this.userReasons[id]);
    const groupKey = this.hotspotGroupMap[id];
    if (groupKey && this.userReasons[groupKey]) {
      parts.push(`[Group] ${this.userReasons[groupKey]}`);
    }
    return parts.join(' — ');
  }

  addReasoningInput(id, index) {
    const entry = document.createElement('div');
    entry.className = 'reasoning-entry';
    entry.dataset.id = id;
    entry.dataset.order = index;

    const label = document.createElement('span');
    label.className = 'reason-label';
    label.textContent = index + 1;

    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Why do you think this is healthwashing?';
    textarea.rows = 1;
    textarea.value = this.userReasons[id] || '';
    textarea.addEventListener('input', () => {
      this.userReasons[id] = textarea.value;
    });

    entry.appendChild(label);
    entry.appendChild(textarea);

    const existing = this.reasoningArea.querySelectorAll('.reasoning-entry');
    let inserted = false;
    for (const el of existing) {
      if (Number(el.dataset.order) > index) {
        this.reasoningArea.insertBefore(entry, el);
        inserted = true;
        break;
      }
    }
    if (!inserted) this.reasoningArea.appendChild(entry);
  }

  removeReasoningInput(id) {
    const entry = this.reasoningArea.querySelector(`.reasoning-entry[data-id="${id}"]`);
    if (entry) entry.remove();
    delete this.userReasons[id];
  }

  submitSelections() {
    this.finalizePendingGroup();
    const data = this.currentProductData;
    if (!data) return;

    this.inReveal = true;

    // Disable direct hotspot interaction but keep zoom/pan
    document.querySelectorAll('.extra-img-wrapper').forEach(w => w.classList.add('in-reveal'));

    this.buildRevealUser(data);
    this.buildRevealOurs(data);

    if (data.summary) {
      this.revealSummary.innerHTML = data.summary;
      this.revealSummary.style.display = '';
    } else {
      this.revealSummary.style.display = 'none';
    }

    this.phaseSelect.classList.add('hidden');
    this.phaseReveal.classList.remove('hidden');

    this.time.delayedCall(50, () => {
      const body = this.phaseReveal;
      const hasOverflow = body && body.scrollHeight > body.clientHeight;
      if (this.splitter) this.splitter.classList.toggle('hidden', !hasOverflow);
    });
  }

  buildRevealUser(data) {
    this.revealUser.innerHTML = '';

    const entries = [];

    for (const id of this.individualSelections) {
      const globalIdx = this.allHotspotRefs.findIndex(r => r.id === id);
      const num = globalIdx + 1;
      const reason = this.userReasons[id] || '';
      entries.push({ nums: [num], reason, sortKey: num });
    }

    for (const group of this.selectionGroups) {
      const nums = group.ids.map(gid => {
        const gi = this.allHotspotRefs.findIndex(r => r.id === gid);
        return gi + 1;
      }).sort((a, b) => a - b);
      const reason = this.userReasons[group.key] || '';
      entries.push({ nums, reason, sortKey: Math.min(...nums), isGroup: true });
    }

    entries.sort((a, b) => a.sortKey - b.sortKey);

    if (entries.length === 0) {
      this.revealUser.innerHTML = '<p class="reveal-empty">You didn\'t select any areas — no worries, take a look at what we found.</p>';
      return;
    }

    entries.forEach(entry => {
      const el = document.createElement('div');
      el.className = 'reveal-entry';
      el.dataset.nums = entry.nums.join(',');

      const label = document.createElement('span');
      label.className = 'reveal-entry-label' + (entry.isGroup ? ' group' : '');
      label.textContent = entry.nums.join('+');

      const text = document.createElement('div');
      text.className = 'reveal-entry-text';
      if (entry.reason) {
        text.innerHTML = `<p>${entry.reason}</p>`;
      } else {
        text.innerHTML = '<p class="no-reason">No reasoning provided</p>';
      }

      el.appendChild(label);
      el.appendChild(text);

      el.addEventListener('mouseenter', () => this.highlightRevealHotspots(entry.nums, true));
      el.addEventListener('mouseleave', () => this.highlightRevealHotspots(entry.nums, false));

      this.revealUser.appendChild(el);
    });
  }

  buildRevealOurs(data) {
    this.revealOurs.innerHTML = '';

    const entries = [];

    const individualPicks = new Set(data.ourPicks || []);
    const ourGroups = data.ourGroups || [];
    const groupedNums = new Set();
    ourGroups.forEach(g => g.ids.forEach(n => groupedNums.add(n)));

    for (const num of individualPicks) {
      const explanation = data.explanations?.[num] || '';
      if (!explanation) continue;
      const citation = data.citations?.[num] || '';
      entries.push({ nums: [num], explanation, citation, sortKey: num });
    }

    for (const group of ourGroups) {
      const nums = [...group.ids].sort((a, b) => a - b);
      entries.push({ nums, explanation: group.explanation, sortKey: Math.min(...nums), isGroup: true });
    }

    entries.sort((a, b) => a.sortKey - b.sortKey);

    if (entries.length === 0) {
      this.revealOurs.innerHTML = '<p class="reveal-empty">No annotations for this product yet.</p>';
      return;
    }

    entries.forEach(entry => {
      const el = document.createElement('div');
      el.className = 'reveal-entry';
      el.dataset.nums = entry.nums.join(',');

      const label = document.createElement('span');
      label.className = 'reveal-entry-label' + (entry.isGroup ? ' group' : '');
      label.textContent = entry.nums.join('+');

      const text = document.createElement('div');
      text.className = 'reveal-entry-text';
      let html = `<p>${entry.explanation}</p>`;
      if (entry.citation) {
        html += `<a class="reveal-citation" href="${entry.citation}" target="_blank" rel="noopener">View source ↗</a>`;
      }
      text.innerHTML = html;

      el.appendChild(label);
      el.appendChild(text);

      el.addEventListener('mouseenter', () => this.highlightRevealHotspots(entry.nums, true));
      el.addEventListener('mouseleave', () => this.highlightRevealHotspots(entry.nums, false));

      this.revealOurs.appendChild(el);
    });
  }

  highlightRevealHotspots(nums, on) {
    nums.forEach(n => {
      const idx = n - 1;
      const ref = this.allHotspotRefs[idx];
      if (!ref) return;

      ref.el.classList.toggle('hovered', on);

      const svg = ref.container.querySelector('.leader-overlay');
      if (svg) {
        const line = svg.querySelector(`.leader-line[data-index="${idx}"]`);
        const numG = svg.querySelector(`.leader-number[data-index="${idx}"]`);
        if (line) line.classList.toggle('hovered', on);
        if (numG) numG.classList.toggle('hovered', on);
      }
    });
  }

  formatId(id) {
    return id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  closeModal() {
    this.modalEl.classList.remove(...Array.from(this.modalEl.classList).filter(c => c.startsWith('product-')));
    this.modalEl.classList.add('hidden');
    this.modalOpen = false;
    this.inReveal = false;
    this.modalCooldown = true;

    if (this.currentProductSprite) {
      const data = this.currentProductSprite.getData('productData');
      this.inspectedProducts.add(data.id);
      this.currentProductSprite = null;
    }
    this.currentProductData = null;
    this.allHotspotRefs = [];
    this.individualSelections.clear();
    this.selectionGroups = [];
    this.pendingGroup = [];
    this.hotspotGroupMap = {};
    document.getElementById('extra-images').innerHTML = '';
    document.querySelectorAll('.extra-img-wrapper').forEach(w => w.classList.remove('in-reveal'));
    this._leaderResizeObserver?.disconnect();
    this._leaderResizeObserver = null;
    if (this._capturedKeys) {
      this.input.keyboard.addCapture(this._capturedKeys);
    }
    this.revealUser.innerHTML = '';
    this.revealOurs.innerHTML = '';
    if (this.imagesRow) this.imagesRow.style.height = '';

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
