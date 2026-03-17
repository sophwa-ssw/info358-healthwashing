import { productsData } from '../data/products.js';

const TRIGGER_DISTANCE = 120;

export class StoreScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StoreScene' });
    this.modalOpen = false;
    this.modalCooldown = false;
  }

  preload() {
    this.load.image('player', 'assets/graphics/info358_topdown.png');
    this.load.image('bkg', 'assets/graphics/test_bkg.png');
  }

  create() {
    this.hotspotsData = {};
    this.shoppingChoices = {}; // productId -> 'buy' | 'dont_buy'
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
    fetch('/get-hotspots')
      .then(r => r.json())
      .then(data => { this.hotspotsData = data; })
      .catch(() => {
        fetch('src/data/hotspots.json')
          .then(r => r.json())
          .then(data => { this.hotspotsData = data; })
          .catch(() => { this.hotspotsData = {}; });
      });
  }

  /* ── Store Layout ── */

  drawStore() {
    const bkg = this.add.image(400, 300, 'bkg');
    bkg.setDisplaySize(800, 600);

    this.shelves = [];
  }

  /* ── Player ── */

  createPlayer() {
    this.player = this.add.sprite(400, 550, 'player');
    this.player.setDisplaySize(150, 150);
    this.player.setDepth(1000);
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

      const pad = 5;
      const labelY = product.position.y + 34;
      const nameText = this.add.text(product.position.x, labelY, product.name, {
        fontSize: '9px',
        fontFamily: 'sans-serif',
        color: '#636e72',
        align: 'center'
      }).setOrigin(0.5);

      const bw = Math.max((nameText.width || 50) + pad * 2, 50);
      const bh = Math.max((nameText.height || 14) + pad * 2, 22);
      const bg = this.add.graphics();
      bg.fillStyle(0xffffff, 0.92);
      bg.fillRoundedRect(
        product.position.x - bw / 2,
        labelY - bh / 2,
        bw,
        bh,
        6
      );
      bg.setDepth(0);
      nameText.setDepth(1);

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

    let didBuild = false;
    const doBuild = () => {
      if (didBuild) return;
      didBuild = true;
      this.modalImage.onload = null;
      requestAnimationFrame(() => {
        this.buildHotspots(hs.front);
        this.buildExtraImages(productData.images, hs);
      });
    };
    this.modalImage.onload = doBuild;
    this.modalImage.src = productData.images.front;
    if (this.modalImage.complete) doBuild();
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
    // Circles use aspect-ratio viewBox + meet, so they stay round; no runtime adjustment needed
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
    const frontCount = this.allHotspotRefs.length;
    let nextOffset = frontCount;
    const items = pairs.map(({ src, hotspots }) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'extra-img-wrapper';
      const inner = document.createElement('div');
      inner.className = 'extra-zoom-inner';
      const img = document.createElement('img');
      img.alt = 'Product info';
      inner.appendChild(img);
      wrapper.appendChild(inner);
      container.appendChild(wrapper);
      return { wrapper, inner, img, src, hotspots };
    });

    const loadNext = (idx) => {
      if (idx >= items.length) return;
      const { wrapper, inner, img, src, hotspots } = items[idx];
      if (!src) {
        loadNext(idx + 1);
        return;
      }
      const offset = nextOffset;
      if (hotspots.length) {
        const build = () => {
          requestAnimationFrame(() => {
            this.buildExtraHotspots(wrapper, inner, hotspots, offset);
            nextOffset += hotspots.length;
            this.setupExtraZoom(wrapper, inner);
            loadNext(idx + 1);
          });
        };
        img.onload = build;
        img.src = src;
        if (img.complete) build();
      } else {
        img.src = src;
        this.setupExtraZoom(wrapper, inner);
        loadNext(idx + 1);
      }
    };
    loadNext(0);
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

  buildExtraHotspots(wrapper, inner, hotspots, globalOffset = this.allHotspotRefs.length) {
    const oldSvg = wrapper.querySelector('.leader-overlay') || inner.querySelector('.leader-overlay');
    if (oldSvg) oldSvg.remove();
    const oldRegion = inner.querySelector('.extra-image-region');
    if (oldRegion) {
      const imgInside = oldRegion.querySelector('img');
      if (imgInside) inner.appendChild(imgInside);
      oldRegion.remove();
    }

    const img = inner.querySelector('img');
    const imageRegion = document.createElement('div');
    imageRegion.className = 'extra-image-region';
    if (img) {
      inner.removeChild(img);
      imageRegion.appendChild(img);
      const nw = img.naturalWidth || img.width;
      const nh = img.naturalHeight || img.height;
      if (nw > 0 && nh > 0) {
        imageRegion.style.aspectRatio = `${nw} / ${nh}`;
      }
    }
    inner.appendChild(imageRegion);

    const innerRect = inner.getBoundingClientRect();
    const imgRect = imageRegion.getBoundingClientRect();
    const coordMax = 100;
    const innerX0 = innerRect.width ? ((imgRect.left - innerRect.left) / innerRect.width) * coordMax : 0;
    const innerY0 = innerRect.height ? ((imgRect.top - innerRect.top) / innerRect.height) * coordMax : 0;
    const innerW = innerRect.width ? (imgRect.width / innerRect.width) * coordMax : coordMax;
    const innerH = innerRect.height ? (imgRect.height / innerRect.height) * coordMax : coordMax;

    const w = inner.offsetWidth || 1;
    const h = inner.offsetHeight || 1;
    const aspect = w / h;
    const vbW = aspect >= 1 ? 100 : 100 * aspect;
    const vbH = aspect >= 1 ? 100 / aspect : 100;
    const toSvg = (x, y) => ({ x: (x / coordMax) * vbW, y: (y / coordMax) * vbH });

    const imgToInner = (imgX, imgY) => ({
      x: innerX0 + (innerW * imgX) / 100,
      y: innerY0 + (innerH * imgY) / 100
    });

    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.classList.add('leader-overlay');
    svg.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    const targetRenderedPx = 8;
    const targetFontPx = 8;
    const scale = Math.min(w / vbW, h / vbH) || 1;
    const r = Math.max(0.9, targetRenderedPx / scale);
    const fontSize = targetFontPx / scale;
    const lineLen = 4;
    const maxLineLen = 6;
    const placed = [];
    const margin = r + 1;
    const minExcess = margin + lineLen;

    hotspots.forEach((h, i) => {
      const globalIdx = globalOffset + i;
      const boxL = innerX0 + (innerW * h.left) / 100;
      const boxT = innerY0 + (innerH * h.top) / 100;
      const boxR = innerX0 + (innerW * (h.left + h.width)) / 100;
      const boxB = innerY0 + (innerH * (h.top + h.height)) / 100;

      const div = document.createElement('div');
      div.className = 'hotspot';
      div.dataset.id = h.id;
      div.dataset.globalIdx = globalIdx;
      div.style.left = h.left + '%';
      div.style.top = h.top + '%';
      div.style.width = h.width + '%';
      div.style.height = h.height + '%';
      div.style.zIndex = String(globalIdx + 1);

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

      imageRegion.appendChild(div);
      this.allHotspotRefs.push({ id: h.id, el: div, container: wrapper });

      const cx = (boxL + boxR) / 2;
      const cy = (boxT + boxB) / 2;

      const rawCandidates = [
        { nx: h.left - lineLen - r, ny: h.top + h.height / 2, lx: h.left, ly: h.top + h.height / 2 },
        { nx: h.left + h.width + lineLen + r, ny: h.top + h.height / 2, lx: h.left + h.width, ly: h.top + h.height / 2 },
        { nx: h.left + h.width / 2, ny: h.top - lineLen - r, lx: h.left + h.width / 2, ly: h.top },
        { nx: h.left + h.width / 2, ny: h.top + h.height + lineLen + r, lx: h.left + h.width / 2, ly: h.top + h.height },
      ];
      const boxCenterX = h.left + h.width / 2;
      const preferRight = boxCenterX > 50;
      const order = preferRight ? [1, 0, 3, 2] : [0, 1, 2, 3];
      let candidates = order.map(idx => {
        const c = rawCandidates[idx];
        const n = imgToInner(c.nx, c.ny);
        const l = imgToInner(c.lx, c.ly);
        return { nx: n.x, ny: n.y, lx: l.x, ly: l.y };
      });
      if (innerX0 >= minExcess) {
        candidates.push({ nx: innerX0 / 2, ny: cy, lx: boxL, ly: cy });
      }
      if (coordMax - (innerX0 + innerW) >= minExcess) {
        candidates.push({ nx: innerX0 + innerW + (coordMax - innerX0 - innerW) / 2, ny: cy, lx: boxR, ly: cy });
      }
      if (innerY0 >= minExcess) {
        candidates.push({ nx: cx, ny: innerY0 / 2, lx: cx, ly: boxT });
      }
      if (coordMax - (innerY0 + innerH) >= minExcess) {
        candidates.push({ nx: cx, ny: innerY0 + innerH + (coordMax - innerY0 - innerH) / 2, lx: cx, ly: boxB });
      }

      const buffer = r + 0.5;
      const insideCurrent = (nx, ny) => nx >= boxL - buffer && nx <= boxR + buffer && ny >= boxT - buffer && ny <= boxB + buffer;
      const insideAnyBox = (nx, ny) => {
        for (const other of hotspots) {
          const oL = innerX0 + (innerW * other.left) / 100 - buffer;
          const oT = innerY0 + (innerH * other.top) / 100 - buffer;
          const oR = innerX0 + (innerW * (other.left + other.width)) / 100 + buffer;
          const oB = innerY0 + (innerH * (other.top + other.height)) / 100 + buffer;
          if (nx >= oL && nx <= oR && ny >= oT && ny <= oB) return true;
        }
        return false;
      };

      let best = null;
      let bestScore = -Infinity;
      for (const c of candidates) {
        if (c.nx < 0 || c.nx > coordMax || c.ny < 0 || c.ny > coordMax) continue;
        if (insideCurrent(c.nx, c.ny)) continue;
        if (insideAnyBox(c.nx, c.ny)) continue;
        let score = 0;
        const inLetterbox = c.nx < innerX0 || c.nx > innerX0 + innerW || c.ny < innerY0 || c.ny > innerY0 + innerH;
        if (inLetterbox) {
          score += 25;
          const boxOnLeft = cx < innerX0 + innerW / 2;
          const boxOnRight = cx >= innerX0 + innerW / 2;
          const boxOnTop = cy < innerY0 + innerH / 2;
          const boxOnBottom = cy >= innerY0 + innerH / 2;
          const candOnLeft = c.nx < innerX0;
          const candOnRight = c.nx > innerX0 + innerW;
          const candOnTop = c.ny < innerY0;
          const candOnBottom = c.ny > innerY0 + innerH;
          if ((boxOnLeft && candOnLeft) || (boxOnRight && candOnRight) || (boxOnTop && candOnTop) || (boxOnBottom && candOnBottom)) {
            score += 30;
          }
        }
        for (const other of hotspots) {
          const oL = innerX0 + (innerW * other.left) / 100;
          const oT = innerY0 + (innerH * other.top) / 100;
          const oW = (innerW * other.width) / 100;
          const oH = (innerH * other.height) / 100;
          if (c.nx > oL - r && c.nx < oL + oW + r && c.ny > oT - r && c.ny < oT + oH + r) score -= 10;
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

      const validCandidates = candidates.filter(c =>
        c.nx >= 0 && c.nx <= coordMax && c.ny >= 0 && c.ny <= coordMax &&
        !insideCurrent(c.nx, c.ny) && !insideAnyBox(c.nx, c.ny)
      );
      if (!best && validCandidates.length) best = validCandidates[0];
      if (!best) best = candidates[0];
      let nx = Math.max(0, Math.min(coordMax, best.nx));
      let ny = Math.max(0, Math.min(coordMax, best.ny));

      const nudge = 0.5;
      const getNudgeDir = (px, py) => {
        let cx = (boxL + boxR) / 2, cy = (boxT + boxB) / 2;
        if (!insideCurrent(px, py) && insideAnyBox(px, py)) {
          for (const other of hotspots) {
            const oL = innerX0 + (innerW * other.left) / 100 - buffer;
            const oT = innerY0 + (innerH * other.top) / 100 - buffer;
            const oR = innerX0 + (innerW * (other.left + other.width)) / 100 + buffer;
            const oB = innerY0 + (innerH * (other.top + other.height)) / 100 + buffer;
            if (px >= oL && px <= oR && py >= oT && py <= oB) {
              cx = innerX0 + (innerW * (other.left + other.width / 2)) / 100;
              cy = innerY0 + (innerH * (other.top + other.height / 2)) / 100;
              break;
            }
          }
        }
        return { dx: px - cx, dy: py - cy };
      };
      for (let step = 0; step < 20 && (insideCurrent(nx, ny) || insideAnyBox(nx, ny)); step++) {
        const { dx, dy } = getNudgeDir(nx, ny);
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        nx = Math.max(0, Math.min(coordMax, nx + (dx / len) * nudge));
        ny = Math.max(0, Math.min(coordMax, ny + (dy / len) * nudge));
      }
      let dx = nx - best.lx;
      let dy = ny - best.ly;
      let dist = Math.sqrt(dx * dx + dy * dy);
      const inLetterbox = nx < innerX0 || nx > innerX0 + innerW || ny < innerY0 || ny > innerY0 + innerH;
      if (inLetterbox && dist > maxLineLen) {
        const scale = (maxLineLen + r) / dist;
        nx = best.lx + dx * scale;
        ny = best.ly + dy * scale;
        dx = nx - best.lx;
        dy = ny - best.ly;
        dist = maxLineLen + r;
      }
      placed.push({ x: nx, y: ny });

      const endX = dist > 0 ? nx - (dx / dist) * r : nx;
      const endY = dist > 0 ? ny - (dy / dist) * r : ny;

      const p1 = toSvg(best.lx, best.ly);
      const p2 = toSvg(endX, endY);
      const circ = toSvg(nx, ny);

      const line = document.createElementNS(NS, 'line');
      line.classList.add('leader-line');
      line.dataset.index = globalIdx;
      line.setAttribute('x1', p1.x);
      line.setAttribute('y1', p1.y);
      line.setAttribute('x2', p2.x);
      line.setAttribute('y2', p2.y);
      line.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(line);

      const g = document.createElementNS(NS, 'g');
      g.classList.add('leader-number');
      g.dataset.index = globalIdx;
      g.dataset.id = h.id;

      const circle = document.createElementNS(NS, 'circle');
      circle.setAttribute('cx', circ.x);
      circle.setAttribute('cy', circ.y);
      circle.setAttribute('r', String(r));
      circle.setAttribute('vector-effect', 'non-scaling-stroke');
      g.appendChild(circle);

      const text = document.createElementNS(NS, 'text');
      text.setAttribute('x', circ.x);
      text.setAttribute('y', circ.y);
      text.setAttribute('font-size', String(fontSize));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      text.textContent = globalIdx + 1;
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

    const w = zoomInner.offsetWidth || 1;
    const h = zoomInner.offsetHeight || 1;
    const aspect = w / h;
    const vbW = aspect >= 1 ? 100 : 100 * aspect;
    const vbH = aspect >= 1 ? 100 / aspect : 100;
    const scaleX = vbW / 100;
    const scaleY = vbH / 100;

    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.classList.add('leader-overlay');
    svg.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    const targetRenderedPx = 8;
    const targetFontPx = 8;
    const scale = Math.min(w / vbW, h / vbH) || 1;
    const r = Math.max(0.9, targetRenderedPx / scale);
    const fontSize = targetFontPx / scale;
    const lineLen = 4;
    const placed = [];
    const mainLeaderData = [];
    const globalOffset = this.allHotspotRefs.length;

    hotspots.forEach((hs, index) => {
      const globalIdx = globalOffset + index;
      const div = document.createElement('div');
      div.className = 'hotspot';
      div.dataset.id = hs.id;
      div.dataset.globalIdx = globalIdx;
      div.style.left = hs.left + '%';
      div.style.top = hs.top + '%';
      div.style.width = hs.width + '%';
      div.style.height = hs.height + '%';
      div.style.zIndex = String(globalIdx + 1);

      div.addEventListener('click', (e) => {
        if (this.inReveal) return;
        e.stopPropagation();
        this.handleHotspotClick(hs.id, globalIdx, e);
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

      zoomInner.appendChild(div);
      this.allHotspotRefs.push({ id: hs.id, el: div, container: this.frontImgWrapper });

      const cx = hs.left + hs.width / 2;
      const cy = hs.top + hs.height / 2;

      const rawCandidates = [
        { nx: hs.left - lineLen - r, ny: cy, lx: hs.left, ly: cy },
        { nx: hs.left + hs.width + lineLen + r, ny: cy, lx: hs.left + hs.width, ly: cy },
        { nx: cx, ny: hs.top - lineLen - r, lx: cx, ly: hs.top },
        { nx: cx, ny: hs.top + hs.height + lineLen + r, lx: cx, ly: hs.top + hs.height },
      ];
      const order = globalIdx % 2 === 0 ? [0, 1, 2, 3] : [1, 0, 3, 2];
      const candidates = order.map(idx => {
        const c = rawCandidates[idx];
        return { nx: c.nx * scaleX, ny: c.ny * scaleY, lx: c.lx * scaleX, ly: c.ly * scaleY };
      });

      const boxL = hs.left * scaleX, boxT = hs.top * scaleY, boxR = boxL + hs.width * scaleX, boxB = boxT + hs.height * scaleY;
      const buffer = r + 0.5;
      const insideCurrent = (nx, ny) => nx >= boxL - buffer && nx <= boxR + buffer && ny >= boxT - buffer && ny <= boxB + buffer;
      const insideAnyBox = (nx, ny) => {
        for (const other of hotspots) {
          const oL = other.left * scaleX - buffer, oT = other.top * scaleY - buffer, oR = other.left * scaleX + other.width * scaleX + buffer, oB = other.top * scaleY + other.height * scaleY + buffer;
          if (nx >= oL && nx <= oR && ny >= oT && ny <= oB) return true;
        }
        return false;
      };

      let best = null;
      let bestScore = -Infinity;
      const margin = r + 1;

      for (const c of candidates) {
        if (c.nx < margin || c.nx > vbW - margin || c.ny < margin || c.ny > vbH - margin) continue;
        if (insideCurrent(c.nx, c.ny)) continue;
        if (insideAnyBox(c.nx, c.ny)) continue;
        let score = 0;
        for (const other of hotspots) {
          const oL = other.left * scaleX, oT = other.top * scaleY, oW = other.width * scaleX, oH = other.height * scaleY;
          if (c.nx > oL - r && c.nx < oL + oW + r && c.ny > oT - r && c.ny < oT + oH + r) score -= 10;
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

      const validCandidates = candidates.filter(c =>
        c.nx >= margin && c.nx <= vbW - margin && c.ny >= margin && c.ny <= vbH - margin &&
        !insideCurrent(c.nx, c.ny) && !insideAnyBox(c.nx, c.ny)
      );
      if (!best && validCandidates.length) best = validCandidates[0];
      if (!best) best = candidates[0];
      let nx = Math.max(margin, Math.min(vbW - margin, best.nx));
      let ny = Math.max(margin, Math.min(vbH - margin, best.ny));

      const nudge = 0.5;
      const getNudgeDir = (px, py) => {
        let cx = (boxL + boxR) / 2, cy = (boxT + boxB) / 2;
        if (!insideCurrent(px, py) && insideAnyBox(px, py)) {
          for (const other of hotspots) {
            const oL = other.left * scaleX - buffer, oT = other.top * scaleY - buffer, oR = other.left * scaleX + other.width * scaleX + buffer, oB = other.top * scaleY + other.height * scaleY + buffer;
            if (px >= oL && px <= oR && py >= oT && py <= oB) {
              cx = (other.left + other.width / 2) * scaleX;
              cy = (other.top + other.height / 2) * scaleY;
              break;
            }
          }
        }
        return { dx: px - cx, dy: py - cy };
      };
      for (let step = 0; step < 20 && (insideCurrent(nx, ny) || insideAnyBox(nx, ny)); step++) {
        const { dx: dnx, dy: dny } = getNudgeDir(nx, ny);
        const len = Math.sqrt(dnx * dnx + dny * dny) || 1;
        nx = Math.max(margin, Math.min(vbW - margin, nx + (dnx / len) * nudge));
        ny = Math.max(margin, Math.min(vbH - margin, ny + (dny / len) * nudge));
      }
      placed.push({ x: nx, y: ny });

      const dx = nx - best.lx;
      const dy = ny - best.ly;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const endX = dist > 0 ? nx - (dx / dist) * r : nx;
      const endY = dist > 0 ? ny - (dy / dist) * r : ny;

      mainLeaderData.push({ globalIdx, lx: best.lx, ly: best.ly, nx, ny, endX, endY });

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
      g.dataset.id = hs.id;

      const circle = document.createElementNS(NS, 'circle');
      circle.setAttribute('cx', nx);
      circle.setAttribute('cy', ny);
      circle.setAttribute('r', String(r));
      circle.setAttribute('vector-effect', 'non-scaling-stroke');
      g.appendChild(circle);

      const text = document.createElementNS(NS, 'text');
      text.setAttribute('x', nx);
      text.setAttribute('y', ny);
      text.setAttribute('font-size', String(fontSize));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      text.textContent = globalIdx + 1;
      g.appendChild(text);

      g.addEventListener('click', (e) => {
        if (this.inReveal) return;
        e.stopPropagation();
        this.handleHotspotClick(hs.id, globalIdx, e);
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
      const citationMla = data.citationMla?.[num] || '';
      entries.push({ nums: [num], explanation, citation, citationMla, sortKey: num });
    }

    for (const group of ourGroups) {
      const nums = [...group.ids].sort((a, b) => a - b);
      entries.push({ nums, explanation: group.explanation, citation: group.citation || '', citationMla: group.citationMla || '', sortKey: Math.min(...nums), isGroup: true });
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
      if (entry.citation || entry.citationMla) {
        let citationHtml = '';
        if (entry.citationMla) {
          const mlaText = entry.citation
            ? entry.citationMla.replace(entry.citation, `\x00LINK\x00`)
            : entry.citationMla;
          const parts = mlaText.split('\x00LINK\x00');
          citationHtml = parts[0] + (entry.citation ? `<a href="${entry.citation}" target="_blank" rel="noopener">${entry.citation}</a>` : '') + (parts[1] || '');
        } else {
          citationHtml = `<a href="${entry.citation}" target="_blank" rel="noopener">${entry.citation}</a>`;
        }
        html += `
          <div class="reveal-citation-dropdown">
            <button class="reveal-citation-toggle" type="button">
              <span class="arrow">▸</span> Citation
            </button>
            <div class="reveal-citation-content">${citationHtml}</div>
          </div>`;
      }
      text.innerHTML = html;

      const dropdown = text.querySelector('.reveal-citation-dropdown');
      if (dropdown) {
        dropdown.querySelector('.reveal-citation-toggle').addEventListener('click', (e) => {
          e.stopPropagation();
          dropdown.classList.toggle('expanded');
        });
      }

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
    // Bottom-right corner; avoids player (400, 550) and products (200,500), (300,250), (550,400)
    const panelW = 230;
    const panelH = 205;
    const panelLeft = 800 - panelW - 10;
    const panelY = 600 - panelH - 10;
    const depth = 1001;
    const collapsedH = 46;
    this.shoppingListCollapsed = false;

    const bg = this.add.graphics();
    bg.setDepth(depth);

    const titleBox = this.add.graphics().setDepth(depth);

    const title = this.add.text(800 - panelW + 55, panelY + 14, 'Shopping List', {
      fontSize: '14px',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      color: '#2d3436',
      lineSpacing: 4,
      fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(depth);

    const toggle = this.add.graphics().setDepth(depth);
    const toggleZone = this.add.zone(panelLeft + panelW - 30, panelY + 10, 20, 20)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(depth);

    const buyTitle = this.add.text(800 - panelW + 165, panelY + 14, 'Buy?', {
      fontSize: '14px',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      color: '#2d3436',
      lineSpacing: 4,
      fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(depth);

    const left = panelLeft + 10;
    const rowHeight = 25;
    const boxSize = 12;
    const labelStyle = { fontSize: '12px', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', color: '#2d3436' };

    // Header row: Buy / Don't buy at top, with padding below so it doesn't overlap first row
    const headerY = panelY + 32;
    const headerToFirstRowPadding = 25;
    const buyColX = panelLeft + panelW - 80;
    const dontBuyColX = panelLeft + panelW - 40;
    const dividerX = buyColX - 12;
    const divider = this.add.graphics().setDepth(depth);
    divider.lineStyle(1.5, 0x636e72, 0.35);
    divider.lineBetween(dividerX, headerY + 2, dividerX, panelY + panelH - 54);
    const yesHeader = this.add.text(buyColX, headerY + 5, 'Y', { ...labelStyle }).setOrigin(0, 0).setDepth(depth);
    const noHeader = this.add.text(dontBuyColX, headerY + 5, 'N', { ...labelStyle }).setOrigin(0, 0).setDepth(depth);

    this.shoppingListCollapsible = [buyTitle, divider, yesHeader, noHeader];
    this.shoppingListRows = [];

    productsData.forEach((product, index) => {
      const rowY = headerY + headerToFirstRowPadding + index * rowHeight;
      const boxY = rowY - 2;

      const nameText = this.add.text(left, rowY - 2, product.name, {
        ...labelStyle,
        fontSize: '12px'
      }).setOrigin(0, 0).setDepth(depth);

      const buyBoxX = buyColX - 2;
      const dontBuyBoxX = dontBuyColX - 2;

      const buyGraphic = this.add.graphics().setDepth(depth);
      const dontBuyGraphic = this.add.graphics().setDepth(depth);

      const drawRowCheckboxes = () => {
        const choice = this.shoppingChoices[product.id];
        buyGraphic.clear();
        dontBuyGraphic.clear();

        [buyGraphic, dontBuyGraphic].forEach((g, i) => {
          const x = i === 0 ? buyBoxX : dontBuyBoxX;
          g.lineStyle(1.5, 0x636e72, 0.8);
          g.strokeRect(x, boxY, boxSize, boxSize);
          const selected = (i === 0 && choice === 'buy') || (i === 1 && choice === 'dont_buy');
          if (selected) {
            g.fillStyle(0x00b894, 0.9);
            g.fillRect(x + 2, boxY + 2, boxSize - 4, boxSize - 4);
          }
        });
      };

      drawRowCheckboxes();

      const hitH = boxSize + 6;
      const hitW = 28;
      const buyZone = this.add.zone(buyBoxX, boxY, hitW, hitH).setOrigin(0, 0).setInteractive({ useHandCursor: true }).setDepth(depth);
      const dontBuyZone = this.add.zone(dontBuyBoxX, boxY, hitW, hitH).setOrigin(0, 0).setInteractive({ useHandCursor: true }).setDepth(depth);

      buyZone.on('pointerdown', () => {
        this.shoppingChoices[product.id] = this.shoppingChoices[product.id] === 'buy' ? null : 'buy';
        drawRowCheckboxes();
        this.updateCheckoutButtonState();
      });
      dontBuyZone.on('pointerdown', () => {
        this.shoppingChoices[product.id] = this.shoppingChoices[product.id] === 'dont_buy' ? null : 'dont_buy';
        drawRowCheckboxes();
        this.updateCheckoutButtonState();
      });

      this.shoppingListCollapsible.push(nameText, buyGraphic, dontBuyGraphic, buyZone, dontBuyZone);
      this.shoppingListRows.push({ productId: product.id, drawRowCheckboxes });
    });

    const checkoutButton = this.add.graphics().setDepth(depth);
    const checkoutLabel = this.add.text(panelLeft + panelW - 52, panelY + panelH - 24, 'Checkout', {
      fontSize: '11px',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5).setDepth(depth);
    const checkoutZone = this.add.zone(panelLeft + panelW - 94, panelY + panelH - 36, 84, 24)
      .setOrigin(0, 0)
      .setDepth(depth);

    this.shoppingListCollapsible.push(checkoutButton, checkoutLabel, checkoutZone);

    this.shoppingListUI = {
      bg,
      titleBox,
      title,
      toggle,
      toggleZone,
      checkoutButton,
      checkoutLabel,
      checkoutZone,
      panelLeft,
      panelY,
      panelW,
      panelH,
      collapsedH
    };

    toggleZone.on('pointerdown', () => {
      this.shoppingListCollapsed = !this.shoppingListCollapsed;
      this.updateShoppingListVisibility();
    });

    this.updateShoppingListVisibility();
    this.updateCheckoutButtonState();
  }

  updateHUD() {
  }

  updateShoppingListVisibility() {
    if (!this.shoppingListUI) return;

    const {
      bg,
      titleBox,
      title,
      toggle,
      toggleZone,
      checkoutButton,
      checkoutLabel,
      checkoutZone,
      panelLeft,
      panelY,
      panelW,
      panelH,
      collapsedH
    } = this.shoppingListUI;

    const isCollapsed = this.shoppingListCollapsed;
    const currentPanelY = isCollapsed ? panelY + panelH - collapsedH : panelY;

    bg.clear();
    bg.fillStyle(0xffffff, 0.95);
    bg.lineStyle(2, 0x636e72, 0.6);
    bg.fillRoundedRect(panelLeft, currentPanelY, panelW, isCollapsed ? collapsedH : panelH, 8);
    bg.strokeRoundedRect(panelLeft, currentPanelY, panelW, isCollapsed ? collapsedH : panelH, 8);

    titleBox.clear();
    titleBox.lineStyle(1.5, 0x636e72, 0.7);
    titleBox.strokeRoundedRect(panelLeft + 10, currentPanelY + 10, 108, 26, 6);

    title.setPosition(800 - panelW + 50, currentPanelY + 14);
    toggleZone.setPosition(panelLeft + panelW - 30, currentPanelY + 10);
    checkoutLabel.setPosition(panelLeft + panelW - 52, currentPanelY + panelH - 24);
    checkoutZone.setPosition(panelLeft + panelW - 94, currentPanelY + panelH - 36);

    toggle.clear();
    toggle.fillStyle(0x636e72, 0.85);
    if (isCollapsed) {
      toggle.fillTriangle(
        panelLeft + panelW - 24, currentPanelY + 15,
        panelLeft + panelW - 24, currentPanelY + 31,
        panelLeft + panelW - 14, currentPanelY + 23
      );
    } else {
      toggle.fillTriangle(
        panelLeft + panelW - 26, currentPanelY + 18,
        panelLeft + panelW - 12, currentPanelY + 18,
        panelLeft + panelW - 19, currentPanelY + 28
      );
    }

    if (this.shoppingListCollapsible) {
      this.shoppingListCollapsible.forEach(item => item.setVisible(!isCollapsed));
    }

    this.updateCheckoutButtonState();
  }

  updateCheckoutButtonState() {
    if (!this.shoppingListUI) return;

    const {
      checkoutButton,
      checkoutLabel,
      checkoutZone,
      panelLeft,
      panelY,
      panelW,
      panelH,
      collapsedH
    } = this.shoppingListUI;

    const isReady = productsData.every(product => Boolean(this.shoppingChoices[product.id]));
    const currentPanelY = this.shoppingListCollapsed ? panelY + panelH - collapsedH : panelY;
    const buttonX = panelLeft + panelW - 94;
    const buttonY = currentPanelY + panelH - 36;
    const buttonW = 84;
    const buttonH = 24;

    checkoutButton.clear();
    checkoutButton.fillStyle(isReady ? 0x00b894 : 0xb2bec3, 1);
    checkoutButton.lineStyle(1.5, isReady ? 0x009874 : 0x95a5a6, 0.9);
    checkoutButton.fillRoundedRect(buttonX, buttonY, buttonW, buttonH, 6);
    checkoutButton.strokeRoundedRect(buttonX, buttonY, buttonW, buttonH, 6);

    checkoutLabel.setColor(isReady ? '#ffffff' : '#f5f6fa');

    if (this.shoppingListCollapsed) {
      checkoutZone.disableInteractive();
      return;
    }

    checkoutZone.removeAllListeners('pointerdown');
    if (isReady) {
      checkoutZone.setInteractive({ useHandCursor: true });
      checkoutZone.on('pointerdown', () => {
        this.submitCheckout();
      });
    } else {
      checkoutZone.disableInteractive();
    }
  }

  buildCheckoutDocument() {
    return Object.fromEntries(
      productsData.map(product => [
        product.id,
        this.shoppingChoices[product.id] === 'buy'
      ])
    );
  }

  async submitCheckout() {
    const payload = this.buildCheckoutDocument();

    try {
      const response = await fetch('/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text || 'Checkout failed'}`);
      }

      const result = await response.json();
      console.log('Checkout saved:', result);
    } catch (error) {
      console.error('Failed to save checkout:', error);
    } finally {
      this.scene.start('EndingScene');
    }
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
