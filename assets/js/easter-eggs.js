(function () {
  'use strict';

  const TRIGGER = 'md';

  let buffer = '';
  let modal = null;
  let sim = null;
  let escHandler = null;

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && t.matches && t.matches('input, textarea, [contenteditable], [contenteditable="true"]')) return;
    if (e.key.length !== 1) return;
    buffer = (buffer + e.key.toLowerCase()).slice(-TRIGGER.length);
    if (buffer === TRIGGER) {
      buffer = '';
      openModal();
    }
  });

  function openModal() {
    if (modal) return;
    injectStyle();
    modal = document.createElement('div');
    modal.className = 'md-egg-backdrop';
    modal.innerHTML = `
      <div class="md-egg-card" role="dialog" aria-label="Lennard-Jones molecular dynamics">
        <div class="md-egg-header">
          <span class="md-egg-title">Lennard-Jones · Langevin NVT · drag to perturb · T</span>
          <input type="range" class="md-egg-slider" min="0.15" max="3" step="0.01" value="1.0" aria-label="Temperature">
          <span class="md-egg-tval">1.00</span>
          <button class="md-egg-close" aria-label="Close">×</button>
        </div>
        <canvas class="md-egg-canvas"></canvas>
      </div>
    `;
    document.body.appendChild(modal);

    const canvas = modal.querySelector('.md-egg-canvas');
    const slider = modal.querySelector('.md-egg-slider');
    const tval = modal.querySelector('.md-egg-tval');
    const closeBtn = modal.querySelector('.md-egg-close');

    const dpr = window.devicePixelRatio || 1;
    const cssSize = 400;
    canvas.style.width = cssSize + 'px';
    canvas.style.height = cssSize + 'px';
    canvas.width = cssSize * dpr;
    canvas.height = cssSize * dpr;
    canvas.getContext('2d').scale(dpr, dpr);

    sim = new MDSimulation(canvas, cssSize, () => parseFloat(slider.value));
    sim.start();

    slider.addEventListener('input', () => { tval.textContent = parseFloat(slider.value).toFixed(2); });

    const close = () => {
      if (sim) { sim.stop(); sim = null; }
      if (modal) { modal.remove(); modal = null; }
      if (escHandler) { document.removeEventListener('keydown', escHandler); escHandler = null; }
    };
    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    escHandler = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', escHandler);
  }

  let _hasSpare = false;
  let _spare = 0;
  function gaussian() {
    if (_hasSpare) {
      _hasSpare = false;
      return _spare;
    }
    let u, v, s;
    do {
      u = 2 * Math.random() - 1;
      v = 2 * Math.random() - 1;
      s = u * u + v * v;
    } while (s >= 1 || s === 0);
    const f = Math.sqrt(-2 * Math.log(s) / s);
    _spare = v * f;
    _hasSpare = true;
    return u * f;
  }

  class MDSimulation {
    constructor(canvas, displaySize, getT) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.W = displaySize;
      this.H = displaySize;
      this.getT = getT;
      this.N = 49;
      this.L = 10.0;
      this.dt = 0.005;
      this.gamma = 1.0;
      this.rcut = 2.5;
      this.rcut2 = this.rcut * this.rcut;
      this.r2floor = 0.49;
      this.vmax = 8.0;
      this.subSteps = 3;
      this.x = new Float64Array(this.N);
      this.y = new Float64Array(this.N);
      this.vx = new Float64Array(this.N);
      this.vy = new Float64Array(this.N);
      this.fx = new Float64Array(this.N);
      this.fy = new Float64Array(this.N);
      this.mouse = null;
      this.running = false;
      this.init();
      this.bindMouse();
    }

    init() {
      const cols = Math.ceil(Math.sqrt(this.N));
      const spacing = this.L / cols;
      let i = 0;
      for (let r = 0; r < cols && i < this.N; r++) {
        for (let c = 0; c < cols && i < this.N; c++) {
          this.x[i] = (c + 0.5) * spacing + (Math.random() - 0.5) * 0.05;
          this.y[i] = (r + 0.5) * spacing + (Math.random() - 0.5) * 0.05;
          this.vx[i] = Math.random() - 0.5;
          this.vy[i] = Math.random() - 0.5;
          i++;
        }
      }
      let cmx = 0, cmy = 0;
      for (let k = 0; k < this.N; k++) { cmx += this.vx[k]; cmy += this.vy[k]; }
      cmx /= this.N; cmy /= this.N;
      for (let k = 0; k < this.N; k++) { this.vx[k] -= cmx; this.vy[k] -= cmy; }
      this.computeForces();
    }

    bindMouse() {
      const c = this.canvas;
      const toSim = (e) => {
        const rect = c.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        return { x: px * this.L, y: py * this.L };
      };
      this._down = (e) => { this.mouse = toSim(e); e.preventDefault(); };
      this._move = (e) => { if (this.mouse) this.mouse = toSim(e); };
      this._up = () => { this.mouse = null; };
      c.addEventListener('mousedown', this._down);
      window.addEventListener('mousemove', this._move);
      window.addEventListener('mouseup', this._up);
    }

    unbindMouse() {
      this.canvas.removeEventListener('mousedown', this._down);
      window.removeEventListener('mousemove', this._move);
      window.removeEventListener('mouseup', this._up);
    }

    computeForces() {
      const N = this.N, L = this.L, rcut2 = this.rcut2, r2floor = this.r2floor;
      for (let i = 0; i < N; i++) { this.fx[i] = 0; this.fy[i] = 0; }
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          let dx = this.x[i] - this.x[j];
          let dy = this.y[i] - this.y[j];
          dx -= L * Math.round(dx / L);
          dy -= L * Math.round(dy / L);
          let r2 = dx * dx + dy * dy;
          if (r2 < rcut2) {
            if (r2 < r2floor) r2 = r2floor;
            const r2inv = 1.0 / r2;
            const r6inv = r2inv * r2inv * r2inv;
            const f = 24.0 * r2inv * r6inv * (2.0 * r6inv - 1.0);
            this.fx[i] += f * dx;
            this.fy[i] += f * dy;
            this.fx[j] -= f * dx;
            this.fy[j] -= f * dy;
          }
        }
      }
      if (this.mouse) {
        for (let i = 0; i < N; i++) {
          let dx = this.x[i] - this.mouse.x;
          let dy = this.y[i] - this.mouse.y;
          dx -= L * Math.round(dx / L);
          dy -= L * Math.round(dy / L);
          const r2 = dx * dx + dy * dy + 0.4;
          const f = 25.0 / (r2 * Math.sqrt(r2));
          this.fx[i] += f * dx;
          this.fy[i] += f * dy;
        }
      }
    }

    step() {
      const dt = this.dt, N = this.N, L = this.L;
      const T = this.getT();
      const c1 = Math.exp(-this.gamma * dt);
      const c2 = Math.sqrt(T * (1 - c1 * c1));
      const halfdt = 0.5 * dt;
      const vmax2 = this.vmax * this.vmax;

      for (let i = 0; i < N; i++) {
        this.vx[i] += halfdt * this.fx[i];
        this.vy[i] += halfdt * this.fy[i];
      }
      for (let i = 0; i < N; i++) {
        this.x[i] += halfdt * this.vx[i];
        this.y[i] += halfdt * this.vy[i];
        if (this.x[i] < 0) this.x[i] += L; else if (this.x[i] >= L) this.x[i] -= L;
        if (this.y[i] < 0) this.y[i] += L; else if (this.y[i] >= L) this.y[i] -= L;
      }
      for (let i = 0; i < N; i++) {
        this.vx[i] = c1 * this.vx[i] + c2 * gaussian();
        this.vy[i] = c1 * this.vy[i] + c2 * gaussian();
      }
      for (let i = 0; i < N; i++) {
        this.x[i] += halfdt * this.vx[i];
        this.y[i] += halfdt * this.vy[i];
        if (this.x[i] < 0) this.x[i] += L; else if (this.x[i] >= L) this.x[i] -= L;
        if (this.y[i] < 0) this.y[i] += L; else if (this.y[i] >= L) this.y[i] -= L;
      }
      this.computeForces();
      for (let i = 0; i < N; i++) {
        this.vx[i] += halfdt * this.fx[i];
        this.vy[i] += halfdt * this.fy[i];
        const v2 = this.vx[i] * this.vx[i] + this.vy[i] * this.vy[i];
        if (v2 > vmax2) {
          const s = this.vmax / Math.sqrt(v2);
          this.vx[i] *= s;
          this.vy[i] *= s;
        }
      }
    }

    draw() {
      const ctx = this.ctx;
      ctx.fillStyle = '#0f1116';
      ctx.fillRect(0, 0, this.W, this.H);
      const sx = this.W / this.L;
      const radius = 0.5 * sx;
      for (let i = 0; i < this.N; i++) {
        const speed = Math.sqrt(this.vx[i] * this.vx[i] + this.vy[i] * this.vy[i]);
        const t = Math.min(1, speed / 3.5);
        const hue = 220 - 220 * t;
        ctx.fillStyle = `hsl(${hue}, 75%, 60%)`;
        ctx.beginPath();
        ctx.arc(this.x[i] * sx, this.y[i] * sx, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    start() {
      this.running = true;
      const loop = () => {
        if (!this.running) return;
        for (let s = 0; s < this.subSteps; s++) this.step();
        this.draw();
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }

    stop() {
      this.running = false;
      this.unbindMouse();
    }
  }

  let styleInjected = false;
  function injectStyle() {
    if (styleInjected) return;
    styleInjected = true;
    const style = document.createElement('style');
    style.textContent = `
      .md-egg-backdrop {
        position: fixed; inset: 0;
        background: rgba(0, 0, 0, 0.55);
        display: flex; align-items: center; justify-content: center;
        z-index: 99999;
        animation: md-egg-fade 0.16s ease-out;
      }
      @keyframes md-egg-fade { from { opacity: 0 } to { opacity: 1 } }
      .md-egg-card {
        background: var(--global-bg-color, #fff);
        color: var(--global-text-color, #111);
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      .md-egg-header {
        display: flex; align-items: center; gap: 10px;
        padding: 2px 4px 10px 4px;
        font-size: 11px; letter-spacing: 0.04em;
        color: var(--global-text-color-light, #888);
        font-variant-numeric: tabular-nums;
      }
      .md-egg-title { flex: 1; }
      .md-egg-slider { width: 100px; accent-color: #6fa8ff; }
      .md-egg-tval { width: 32px; text-align: right; opacity: 0.8; }
      .md-egg-close {
        background: transparent; border: none;
        color: inherit; opacity: 0.6;
        font-size: 20px; line-height: 1; cursor: pointer; padding: 0 4px;
      }
      .md-egg-close:hover { opacity: 1; }
      .md-egg-canvas {
        display: block; border-radius: 4px;
        cursor: crosshair;
        background: #0f1116;
      }
    `;
    document.head.appendChild(style);
  }
})();
