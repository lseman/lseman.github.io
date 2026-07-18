// Smith Chart — interactive pedagogical component for EMC Wave Studio

export class SmithChart {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.width = options.width || 520;
    this.height = options.height || 420;
    this.padding = options.padding || 40;
    this.radius = Math.min(this.width, this.height) / 2 - this.padding;
    this.cx = this.width / 2;
    this.cy = this.height / 2;

    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`SmithChart: container #${containerId} not found`);
      return;
    }

    // Check if container is already a canvas
    if (this.container.tagName === 'CANVAS') {
      this.canvas = this.container;
    } else {
      this.canvas = document.createElement('canvas');
      this.container.appendChild(this.canvas);
    }

    this.canvas.width = this.width * (devicePixelRatio || 1);
    this.canvas.height = this.height * (devicePixelRatio || 1);
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.canvas.style.cursor = 'crosshair';
    this.canvas.hidden = options.hidden !== undefined ? options.hidden : false;

    this.ctx = this.canvas.getContext('2d');
    this.ctx.scale(devicePixelRatio || 1, devicePixelRatio || 1);

    this.hoverPoint = null; // {zReal, zImag} normalized impedance
    this.currentPoint = null; // {zReal, zImag} current measured impedance

    this.resistanceCircles = [0, 0.2, 0.5, 1, 2, 5, 10];
    this.reactanceCircles = [0.2, 0.5, 1, 2, 5];

    this.setupEvents();
    this.draw();
  }

  setupEvents() {
    const getPointFromEvent = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left);
      const y = (e.clientY - rect.top);

      // Convert to reflection coefficient coordinates
      // Smith chart: real axis is horizontal, imaginary is vertical
      // Γ = u + jv, where u = (x - cx)/radius, v = (cy - y)/radius
      const u = (x - this.cx) / this.radius;
      const v = (this.cy - y) / this.radius;

      const r2 = u * u + v * v;
      if (r2 > 1.05) return null; // Outside Smith chart

      // Convert reflection coefficient to normalized impedance
      // z = (1 + Γ) / (1 - Γ)
      // Γ = u + jv
      const onePlusGammaReal = 1 + u;
      const onePlusGammaImag = v;
      const oneMinusGammaReal = 1 - u;
      const oneMinusGammaImag = -v;

      const denom = oneMinusGammaReal * oneMinusGammaReal + oneMinusGammaImag * oneMinusGammaImag;
      if (denom < 1e-10) return null;

      const zReal = (onePlusGammaReal * oneMinusGammaReal + onePlusGammaImag * oneMinusGammaImag) / denom;
      const zImag = (onePlusGammaImag * oneMinusGammaReal - onePlusGammaReal * oneMinusGammaImag) / denom;

      return { zReal, zImag, u, v, r2 };
    };

    this.canvas.addEventListener('mousemove', (e) => {
      const point = getPointFromEvent(e);
      if (point) {
        this.hoverPoint = point;
      } else {
        this.hoverPoint = null;
      }
      this.draw();
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hoverPoint = null;
      this.draw();
    });

    this.canvas.addEventListener('click', (e) => {
      const point = getPointFromEvent(e);
      if (point) {
        this.currentPoint = { zReal: point.zReal, zImag: point.zImag };
        this.draw();
      }
    });
  }

  setMeasuredImpedance(zReal, zImag) {
    this.currentPoint = { zReal, zImag };
    this.draw();
  }

  clearMeasuredImpedance() {
    this.currentPoint = null;
    this.draw();
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.padding = 40;
    this.radius = Math.min(this.width, this.height) / 2 - this.padding;
    this.cx = this.width / 2;
    this.cy = this.height / 2;

    const dpr = devicePixelRatio || 1;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.scale(dpr, dpr);

    this.draw();
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // Background
    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw Smith chart grid
    this.drawSmithGrid(ctx);

    // Draw current measured point
    if (this.currentPoint) {
      this.drawPoint(ctx, this.currentPoint.zReal, this.currentPoint.zImag, '#fb7185', 'Medida');
    }

    // Draw hover point
    if (this.hoverPoint) {
      this.drawPoint(ctx, this.hoverPoint.zReal, this.hoverPoint.zImag, '#67e8f9', 'Hover');
      this.drawHoverInfo(ctx, this.hoverPoint);
    }

    // Draw title and pedagogical info
    this.drawInfo(ctx);
  }

  drawSmithGrid(ctx) {
    const r = this.radius;
    const cx = this.cx;
    const cy = this.cy;

    // Outer circle (|Γ| = 1)
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Horizontal axis (real Γ axis, from -1 to 1)
    ctx.beginPath();
    ctx.moveTo(cx - r, cy);
    ctx.lineTo(cx + r, cy);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Vertical axis (imaginary Γ axis)
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx, cy + r);
    ctx.stroke();

    // Draw constant resistance circles
    for (const rVal of this.resistanceCircles) {
      if (rVal === 0) {
        // r = 0 circle is the outer circle
        continue;
      }
      // Center: (r/(r+1), 0) in Γ plane
      // x_c = r/(r+1), y_c = 0
      // Radius in Γ plane: 1/(r+1)
      const centerU = rVal / (rVal + 1);
      const centerV = 0;
      const circleR = 1 / (rVal + 1);

      ctx.beginPath();
      ctx.arc(cx + centerU * r, cy - centerV * r, circleR * r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(167, 139, 250, ${0.3 + (rVal > 1 ? 0.2 : 0.1)})`;
      ctx.lineWidth = rVal === 1 ? 1.5 : 1;
      ctx.stroke();

      // Label
      if (rVal <= 5) {
        const labelX = cx + (centerU - circleR) * r - 20;
        const labelY = cy + 3;
        ctx.fillStyle = '#a78bfa';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`r=${rVal}`, labelX, labelY);
      }
    }

    // Draw constant reactance circles (upper half - inductive)
    for (const xVal of this.reactanceCircles) {
      // Center: (1, 1/x) in Γ plane
      // Radius: 1/x
      const centerU = 1;
      const centerV = -1 / xVal; // Negative because canvas Y is inverted
      const circleR = 1 / xVal;

      ctx.beginPath();
      // Only draw the arc that's within the Smith chart
      const startAngle = Math.PI / 2;
      const endAngle = -Math.PI / 2;

      ctx.arc(cx + centerU * r, cy - centerV * r, circleR * r, startAngle, endAngle, true);
      ctx.strokeStyle = `rgba(52, 211, 153, ${0.3 + (xVal > 1 ? 0.1 : 0.15)})`;
      ctx.lineWidth = xVal === 1 ? 1.5 : 1;
      ctx.stroke();

      // Label
      if (xVal <= 2) {
        const labelX = cx + r - 3;
        const labelY = cy - circleR * r + 10;
        ctx.fillStyle = '#34d399';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`x=${xVal}`, labelX, labelY);
      }
    }

    // Draw constant reactance circles (lower half - capacitive)
    for (const xVal of this.reactanceCircles) {
      const xNeg = -xVal;
      const centerU = 1;
      const centerV = -1 / xNeg; // Positive for capacitive
      const circleR = 1 / Math.abs(xNeg);

      ctx.beginPath();
      const startAngle = -Math.PI / 2;
      const endAngle = Math.PI / 2;

      ctx.arc(cx + centerU * r, cy - centerV * r, circleR * r, startAngle, endAngle, false);
      ctx.strokeStyle = `rgba(251, 191, 36, ${0.3 + (xVal > 1 ? 0.1 : 0.15)})`;
      ctx.lineWidth = xVal === 1 ? 1.5 : 1;
      ctx.stroke();

      // Label
      if (xVal <= 2) {
        const labelX = cx + r - 3;
        const labelY = cy + circleR * r - 5;
        ctx.fillStyle = '#fbbf24';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`x=-${xVal}`, labelX, labelY);
      }
    }

    // Key points labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('Curto-circuito', cx - r, cy + 8);
    ctx.fillText('Ajuste', cx, cy - 10);
    ctx.fillText('Circuito aberto', cx + r, cy + 8);

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('j∞', cx + 8, cy - r + 10);
    ctx.fillText('-j∞', cx + 8, cy + r - 10);
  }

  drawPoint(ctx, zReal, zImag, color, label) {
    // Convert normalized impedance to reflection coefficient
    // Γ = (z - 1) / (z + 1)
    const numReal = zReal - 1;
    const numImag = zImag;
    const denReal = zReal + 1;
    const denImag = zImag;

    const denom = denReal * denReal + denImag * denImag;
    if (denom < 1e-10) return;

    const u = (numReal * denReal + numImag * denImag) / denom;
    const v = (numImag * denReal - numReal * denImag) / denom;

    const r = this.radius;
    const cx = this.cx;
    const cy = this.cy;

    const px = cx + u * r;
    const py = cy - v * r;

    // Check if point is within Smith chart
    const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
    if (dist > r + 2) return;

    // Draw point
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fillStyle = color + 'cc';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Glow effect
    ctx.beginPath();
    ctx.arc(px, py, 10, 0, Math.PI * 2);
    ctx.fillStyle = color + '33';
    ctx.fill();
  }

  drawHoverInfo(ctx, point) {
    const { zReal, zImag, u, v } = point;

    // Calculate reflection coefficient magnitude and angle
    const mag = Math.sqrt(u * u + v * v);
    const angle = Math.atan2(v, u) * 180 / Math.PI;

    const infoY = this.height - 25;

    // Info box background
    ctx.fillStyle = 'rgba(10, 15, 26, 0.9)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    const boxWidth = 220;
    const boxHeight = 70;
    const boxX = this.cx - boxWidth / 2;
    const boxY = infoY - boxHeight - 10;

    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 6) : ctx.rect(boxX, boxY, boxWidth, boxHeight);
    ctx.fill();
    ctx.stroke();

    // Info text
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const lines = [
      `Γ = ${mag.toFixed(3)}∠${angle.toFixed(1)}°`,
      `Re{Z} = ${zReal.toFixed(3)}`,
      `Im{Z} = ${zImag.toFixed(3)}j`,
      `Z = ${zReal.toFixed(3)} + ${zImag.toFixed(3)}j`
    ];

    lines.forEach((line, i) => {
      ctx.fillText(line, boxX + 12, boxY + 12 + i * 14);
    });
  }

  drawInfo(ctx) {
    // Title
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px DM Sans, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Gráfico de Smith — Impedância Normalizada', this.padding, this.padding - 20);

    // Pedagogical description
    ctx.fillStyle = '#64748b';
    ctx.font = '10px DM Sans, sans-serif';
    const desc = 'Círculos de resistência constante (roxo) · Reatância indutiva (verde) / capacitiva (amarelo)';
    ctx.fillText(desc, this.padding, this.padding - 5);

    // Instructions
    ctx.fillStyle = '#475569';
    ctx.font = '9px DM Sans, sans-serif';
    ctx.fillText('Clique para definir ponto · Passe o mouse para inspecionar', this.padding, this.padding + 10);
  }

  // Helper to convert impedance to Smith chart coordinates
  impedanceToGamma(zReal, zImag) {
    const numReal = zReal - 1;
    const numImag = zImag;
    const denReal = zReal + 1;
    const denImag = zImag;

    const denom = denReal * denReal + denImag * denImag;
    if (denom < 1e-10) return { u: 1, v: 0 };

    const u = (numReal * denReal + numImag * denImag) / denom;
    const v = (numImag * denReal - numReal * denImag) / denom;

    return { u, v };
  }

  // Helper to convert reflection coefficient to normalized impedance
  gammaToImpedance(u, v) {
    const onePlusGammaReal = 1 + u;
    const onePlusGammaImag = v;
    const oneMinusGammaReal = 1 - u;
    const oneMinusGammaImag = -v;

    const denom = oneMinusGammaReal * oneMinusGammaReal + oneMinusGammaImag * oneMinusGammaImag;
    if (denom < 1e-10) return { zReal: Infinity, zImag: 0 };

    const zReal = (onePlusGammaReal * oneMinusGammaReal + onePlusGammaImag * oneMinusGammaImag) / denom;
    const zImag = (onePlusGammaImag * oneMinusGammaReal - onePlusGammaReal * oneMinusGammaImag) / denom;

    return { zReal, zImag };
  }
}
