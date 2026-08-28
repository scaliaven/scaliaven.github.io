(function () {
  'use strict';

  const TRIGGER = 'submod';

  let buffer = '';
  let modal = null;
  let demo = null;
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
    modal.className = 'sm-egg-backdrop';
    modal.innerHTML = `
      <div class="sm-egg-card" role="dialog" aria-label="Submodular coreset selection">
        <div class="sm-egg-header">
          <span class="sm-egg-title">Submodular coreset · greedy vs random · facility location</span>
          <button class="sm-egg-reset" aria-label="Reset">↻</button>
          <button class="sm-egg-close" aria-label="Close">×</button>
        </div>
        <div class="sm-egg-body">
          <canvas class="sm-egg-points"></canvas>
          <canvas class="sm-egg-curve"></canvas>
        </div>
        <div class="sm-egg-legend">
          <span><span class="sm-egg-dot sm-egg-greedy"></span> greedy <span class="sm-egg-val sm-egg-gval">0.000</span></span>
          <span><span class="sm-egg-dot sm-egg-random"></span> random <span class="sm-egg-val sm-egg-rval">0.000</span></span>
          <span class="sm-egg-bound">┄ (1 − 1/e) · f<sub>opt</sub></span>
          <span class="sm-egg-step">k = <span class="sm-egg-kval">0</span> / <span class="sm-egg-kmax">0</span></span>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const pCanvas = modal.querySelector('.sm-egg-points');
    const cCanvas = modal.querySelector('.sm-egg-curve');
    const dpr = window.devicePixelRatio || 1;
    setupCanvas(pCanvas, 400, 400, dpr);
    setupCanvas(cCanvas, 220, 400, dpr);

    const labels = {
      g: modal.querySelector('.sm-egg-gval'),
      r: modal.querySelector('.sm-egg-rval'),
      k: modal.querySelector('.sm-egg-kval'),
      kmax: modal.querySelector('.sm-egg-kmax'),
    };

    demo = new SubmodDemo(pCanvas, cCanvas, labels);
    demo.start();

    modal.querySelector('.sm-egg-reset').addEventListener('click', () => demo.reset());

    const close = () => {
      if (demo) { demo.stop(); demo = null; }
      if (modal) { modal.remove(); modal = null; }
      if (escHandler) { document.removeEventListener('keydown', escHandler); escHandler = null; }
    };
    modal.querySelector('.sm-egg-close').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    escHandler = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', escHandler);
  }

  function setupCanvas(c, w, h, dpr) {
    c.style.width = w + 'px';
    c.style.height = h + 'px';
    c.width = w * dpr;
    c.height = h * dpr;
    c.getContext('2d').scale(dpr, dpr);
  }

  class SubmodDemo {
    constructor(pCanvas, cCanvas, labels) {
      this.pCanvas = pCanvas;
      this.cCanvas = cCanvas;
      this.pCtx = pCanvas.getContext('2d');
      this.cCtx = cCanvas.getContext('2d');
      this.labels = labels;
      this.pW = 400; this.pH = 400;
      this.cW = 220; this.cH = 400;
      this.K = 25;
      this.kernelSigma = 0.075;
      this.pickIntervalMs = 170;
      this.running = false;
      this.timer = null;
      this.labels.kmax.textContent = String(this.K);
    }

    start() { this.reset(); }

    reset() {
      this.stop();
      this.makeData();
      this.greedyMaxCov = new Float64Array(this.N);
      this.randomMaxCov = new Float64Array(this.N);
      this.greedySelected = [];
      this.randomSelected = [];
      this.greedyCurve = [0];
      this.randomCurve = [0];
      this.k = 0;
      this.fOptApprox = this.estimateOpt();
      this.draw();
      this.running = true;
      this.timer = setInterval(() => this.tick(), this.pickIntervalMs);
    }

    stop() {
      this.running = false;
      if (this.timer) { clearInterval(this.timer); this.timer = null; }
    }

    makeData() {
      const numClusters = 5 + Math.floor(Math.random() * 3); // 5..7
      const minSep = 0.24;
      const margin = 0.13;
      const centers = [];
      for (let attempt = 0; attempt < 400 && centers.length < numClusters; attempt++) {
        const cx = margin + (1 - 2 * margin) * Math.random();
        const cy = margin + (1 - 2 * margin) * Math.random();
        let ok = true;
        for (const c of centers) {
          const dx = cx - c.x, dy = cy - c.y;
          if (dx * dx + dy * dy < minSep * minSep) { ok = false; break; }
        }
        if (ok) centers.push({ x: cx, y: cy });
      }
      this.points = [];
      for (const c of centers) {
        // Skewed cluster size: occasional large, mostly small/medium → submodular punchline
        const count = 14 + Math.floor(62 * Math.pow(Math.random(), 1.7));
        const sx = 0.025 + Math.random() * 0.040;
        const sy = 0.025 + Math.random() * 0.040;
        const theta = Math.random() * 2 * Math.PI;
        const cs = Math.cos(theta), sn = Math.sin(theta);
        for (let i = 0; i < count; i++) {
          const u = randn() * sx;
          const v = randn() * sy;
          const x = c.x + u * cs - v * sn;
          const y = c.y + u * sn + v * cs;
          this.points.push({ x: clamp01(x), y: clamp01(y) });
        }
      }
      const outliers = 12 + Math.floor(Math.random() * 14);
      for (let i = 0; i < outliers; i++) {
        this.points.push({ x: 0.04 + 0.92 * Math.random(), y: 0.04 + 0.92 * Math.random() });
      }
      this.N = this.points.length;
    }

    kernel(i, j) {
      const dx = this.points[i].x - this.points[j].x;
      const dy = this.points[i].y - this.points[j].y;
      const r2 = dx * dx + dy * dy;
      return Math.exp(-r2 / (2 * this.kernelSigma * this.kernelSigma));
    }

    coverage(maxCov) {
      let s = 0;
      for (let i = 0; i < this.N; i++) s += maxCov[i];
      return s;
    }

    estimateOpt() {
      // Run a deeper greedy (K + 10) silently to approximate f_opt
      const cov = new Float64Array(this.N);
      const picked = new Set();
      const targetK = Math.min(this.N, this.K + 10);
      for (let step = 0; step < targetK; step++) {
        let best = -1, bestGain = -Infinity;
        for (let s = 0; s < this.N; s++) {
          if (picked.has(s)) continue;
          let gain = 0;
          for (let p = 0; p < this.N; p++) {
            const k = this.kernel(p, s);
            if (k > cov[p]) gain += (k - cov[p]);
          }
          if (gain > bestGain) { bestGain = gain; best = s; }
        }
        if (best < 0) break;
        picked.add(best);
        for (let p = 0; p < this.N; p++) {
          const k = this.kernel(p, best);
          if (k > cov[p]) cov[p] = k;
        }
      }
      return this.coverage(cov);
    }

    addGreedy() {
      let best = -1, bestGain = -Infinity;
      const taken = new Set(this.greedySelected);
      for (let s = 0; s < this.N; s++) {
        if (taken.has(s)) continue;
        let gain = 0;
        for (let p = 0; p < this.N; p++) {
          const k = this.kernel(p, s);
          if (k > this.greedyMaxCov[p]) gain += (k - this.greedyMaxCov[p]);
        }
        if (gain > bestGain) { bestGain = gain; best = s; }
      }
      if (best < 0) return;
      this.greedySelected.push(best);
      for (let p = 0; p < this.N; p++) {
        const k = this.kernel(p, best);
        if (k > this.greedyMaxCov[p]) this.greedyMaxCov[p] = k;
      }
      this.greedyCurve.push(this.coverage(this.greedyMaxCov));
    }

    addRandom() {
      const taken = new Set(this.randomSelected);
      let s;
      do { s = Math.floor(Math.random() * this.N); } while (taken.has(s));
      this.randomSelected.push(s);
      for (let p = 0; p < this.N; p++) {
        const k = this.kernel(p, s);
        if (k > this.randomMaxCov[p]) this.randomMaxCov[p] = k;
      }
      this.randomCurve.push(this.coverage(this.randomMaxCov));
    }

    tick() {
      if (this.k >= this.K) { this.stop(); this.draw(); return; }
      this.addGreedy();
      this.addRandom();
      this.k++;
      this.draw();
    }

    draw() {
      this.drawPoints();
      this.drawCurve();
      const norm = Math.max(1e-6, this.fOptApprox);
      const gv = (this.greedyCurve[this.greedyCurve.length - 1] || 0) / norm;
      const rv = (this.randomCurve[this.randomCurve.length - 1] || 0) / norm;
      this.labels.g.textContent = gv.toFixed(3);
      this.labels.r.textContent = rv.toFixed(3);
      this.labels.k.textContent = String(this.k);
    }

    drawPoints() {
      const ctx = this.pCtx, W = this.pW, H = this.pH;
      ctx.fillStyle = '#0f1116';
      ctx.fillRect(0, 0, W, H);

      const drawDisks = (selected, color) => {
        ctx.globalAlpha = 0.08;
        for (const s of selected) {
          const p = this.points[s];
          const r = this.kernelSigma * 2.4 * W;
          const grad = ctx.createRadialGradient(p.x * W, p.y * H, 0, p.x * W, p.y * H, r);
          grad.addColorStop(0, color);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x * W, p.y * H, r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      };
      drawDisks(this.randomSelected, 'rgba(94, 221, 242, 1)');
      drawDisks(this.greedySelected, 'rgba(255, 138, 76, 1)');

      ctx.fillStyle = 'rgba(180,180,190,0.55)';
      for (const p of this.points) {
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, 1.9, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#5eddf2';
      ctx.strokeStyle = '#0f1116';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < this.randomSelected.length; i++) {
        const p = this.points[this.randomSelected[i]];
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = '#ff8a4c';
      for (let i = 0; i < this.greedySelected.length; i++) {
        const p = this.points[this.greedySelected[i]];
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, 4.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Pulse the latest greedy pick
      if (this.greedySelected.length > 0) {
        const last = this.points[this.greedySelected[this.greedySelected.length - 1]];
        ctx.strokeStyle = 'rgba(255,138,76,0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(last.x * W, last.y * H, 9, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    drawCurve() {
      const ctx = this.cCtx, W = this.cW, H = this.cH;
      ctx.fillStyle = '#0f1116';
      ctx.fillRect(0, 0, W, H);

      const padL = 28, padR = 8, padT = 10, padB = 22;
      const plotW = W - padL - padR;
      const plotH = H - padT - padB;
      const yMax = Math.max(this.fOptApprox, ...this.greedyCurve, ...this.randomCurve, 1e-6);

      ctx.strokeStyle = 'rgba(180,180,190,0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, padT);
      ctx.lineTo(padL, padT + plotH);
      ctx.lineTo(padL + plotW, padT + plotH);
      ctx.stroke();

      // f_opt line (top reference)
      const optY = padT + plotH - (this.fOptApprox / yMax) * plotH;
      ctx.strokeStyle = 'rgba(180,180,190,0.35)';
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(padL, optY);
      ctx.lineTo(padL + plotW, optY);
      ctx.stroke();

      // (1 - 1/e) f_opt
      const boundY = padT + plotH - ((1 - 1 / Math.E) * this.fOptApprox / yMax) * plotH;
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padL, boundY);
      ctx.lineTo(padL + plotW, boundY);
      ctx.stroke();
      ctx.setLineDash([]);

      const plotLine = (arr, color) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let i = 0; i < arr.length; i++) {
          const x = padL + (i / this.K) * plotW;
          const y = padT + plotH - (arr[i] / yMax) * plotH;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        if (arr.length > 0) {
          const i = arr.length - 1;
          const x = padL + (i / this.K) * plotW;
          const y = padT + plotH - (arr[i] / yMax) * plotH;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      };
      plotLine(this.randomCurve, '#5eddf2');
      plotLine(this.greedyCurve, '#ff8a4c');

      ctx.fillStyle = 'rgba(180,180,190,0.7)';
      ctx.font = '10px -apple-system, sans-serif';
      ctx.fillText('f(S)', 4, padT + 8);
      ctx.fillText('|S|', padL + plotW - 14, padT + plotH + 14);
      ctx.fillText('f_opt', padL + plotW - 28, optY - 3);
    }
  }

  function randn() {
    let u, v, s;
    do {
      u = 2 * Math.random() - 1;
      v = 2 * Math.random() - 1;
      s = u * u + v * v;
    } while (s >= 1 || s === 0);
    return u * Math.sqrt(-2 * Math.log(s) / s);
  }

  function clamp01(x) { return Math.max(0.02, Math.min(0.98, x)); }

  let styleInjected = false;
  function injectStyle() {
    if (styleInjected) return;
    styleInjected = true;
    const style = document.createElement('style');
    style.textContent = `
      .sm-egg-backdrop {
        position: fixed; inset: 0;
        background: rgba(0, 0, 0, 0.55);
        display: flex; align-items: center; justify-content: center;
        z-index: 99999;
        animation: sm-egg-fade 0.16s ease-out;
      }
      @keyframes sm-egg-fade { from { opacity: 0 } to { opacity: 1 } }
      .sm-egg-card {
        background: var(--global-bg-color, #fff);
        color: var(--global-text-color, #111);
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      .sm-egg-header {
        display: flex; align-items: center; gap: 10px;
        padding: 2px 4px 10px 4px;
        font-size: 11px; letter-spacing: 0.04em;
        color: var(--global-text-color-light, #888);
      }
      .sm-egg-title { flex: 1; }
      .sm-egg-reset, .sm-egg-close {
        background: transparent; border: none; cursor: pointer;
        color: inherit; opacity: 0.55;
        line-height: 1; padding: 0 4px;
      }
      .sm-egg-reset { font-size: 14px; }
      .sm-egg-close { font-size: 20px; }
      .sm-egg-reset:hover, .sm-egg-close:hover { opacity: 1; }
      .sm-egg-body {
        display: flex; gap: 6px;
        background: #0f1116; border-radius: 4px; padding: 4px;
      }
      .sm-egg-points, .sm-egg-curve { display: block; border-radius: 2px; }
      .sm-egg-legend {
        display: flex; align-items: center; gap: 18px;
        font-size: 11px; color: var(--global-text-color-light, #888);
        padding: 8px 4px 0 4px;
        font-variant-numeric: tabular-nums;
      }
      .sm-egg-legend > span { display: inline-flex; align-items: center; }
      .sm-egg-dot {
        display: inline-block; width: 8px; height: 8px; border-radius: 50%;
        margin-right: 6px;
      }
      .sm-egg-greedy { background: #ff8a4c; }
      .sm-egg-random { background: #5eddf2; }
      .sm-egg-val { margin-left: 6px; opacity: 0.85; }
      .sm-egg-bound { font-style: italic; opacity: 0.7; }
      .sm-egg-step { margin-left: auto; opacity: 0.7; }
    `;
    document.head.appendChild(style);
  }
})();
