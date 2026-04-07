// ─── SHARED CANVAS UTILITIES ─────────────────────

    const WB = { min: -0.3, max: 8.3 }; // world bounds for 2D demos

    function toC(wx, wy, canvas) {
      const mx = 44, my = 22;
      const bw = canvas.width - mx - 14;
      const bh = canvas.height - my - 32;
      const range = WB.max - WB.min;
      return {
        x: mx + (wx - WB.min) / range * bw,
        y: canvas.height - my - (wy - WB.min) / range * bh
      };
    }

    const C = {
      bg: '#0a0e17',
      grid: 'rgba(255,255,255,0.05)',
      fill: 'rgba(91,156,246,0.10)',
      stroke: 'rgba(91,156,246,0.55)',
      intpt: 'rgba(126,200,160,0.55)',
      lp: '#e8a94a',
      intopt: '#4cc9a8',
      cand: '#e06c75',
      ref: '#5b9ed4',
      purple: '#b48acd',
      orange: '#e08c4a',
      green: '#4cc9a8',
      blue: '#5b9cf6',
      teal: '#3ec7c1',
      gold: '#d4a017',
      muted: '#7a7060',
      text: '#ddd5c0',
    };

    const POLY = [[0, 0], [7, 0], [14 / 3, 14 / 3], [0, 7]]; // LP feasible region vertices
    const LP_OPT = [14 / 3, 14 / 3];
    const INT_OPT = [5, 4];

    function drawBase(ctx, canvas, showLattice = true) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = C.grid;
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= 8; i++) {
        const p0 = toC(i, -0.3, canvas), p1 = toC(i, 8.3, canvas);
        ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
        const q0 = toC(-0.3, i, canvas), q1 = toC(8.3, i, canvas);
        ctx.beginPath(); ctx.moveTo(q0.x, q0.y); ctx.lineTo(q1.x, q1.y); ctx.stroke();
      }

      // Feasible region
      ctx.beginPath();
      POLY.forEach((v, i) => {
        const p = toC(v[0], v[1], canvas);
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fillStyle = C.fill;
      ctx.fill();
      ctx.strokeStyle = C.stroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Integer lattice
      if (showLattice) {
        for (let x1 = 0; x1 <= 7; x1++) for (let x2 = 0; x2 <= 7; x2++) {
          if (2 * x1 + x2 <= 14 && x1 + 2 * x2 <= 14) {
            const p = toC(x1, x2, canvas);
            ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
            ctx.fillStyle = C.intpt; ctx.fill();
          }
        }
      }

      // Axes labels
      ctx.fillStyle = C.muted;
      ctx.font = '11px JetBrains Mono';
      for (let i = 0; i <= 7; i++) {
        const p = toC(i, -0.3, canvas);
        ctx.fillText(i, p.x - 3, p.y + 13);
        const q = toC(-0.3, i, canvas);
        ctx.fillText(i, q.x - 18, q.y + 4);
      }
      // Axis labels
      ctx.fillStyle = C.text;
      ctx.font = 'italic 13px Crimson Pro';
      const ax = toC(7.5, -0.3, canvas);
      ctx.fillText('x₁', ax.x, ax.y + 12);
      const ay = toC(-0.3, 7.5, canvas);
      ctx.fillText('x₂', ay.x - 16, ay.y);
    }

    function drawStar(ctx, px, py, size, color, label) {
      ctx.fillStyle = color;
      ctx.strokeStyle = '#0a0e17';
      ctx.lineWidth = 1;
      const s = size;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? s : s * 0.45;
        const a = i * Math.PI / 5 - Math.PI / 2;
        i === 0 ? ctx.moveTo(px + r * Math.cos(a), py + r * Math.sin(a))
          : ctx.lineTo(px + r * Math.cos(a), py + r * Math.sin(a));
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      if (label) {
        ctx.fillStyle = color;
        ctx.font = '11px JetBrains Mono';
        ctx.fillText(label, px + s + 4, py - 2);
      }
    }

    function drawDot(ctx, px, py, r, color, label) {
      ctx.beginPath(); ctx.arc(px, py, r, 0, 2 * Math.PI);
      ctx.fillStyle = color; ctx.fill();
      if (label) {
        ctx.fillStyle = color;
        ctx.font = '11px JetBrains Mono';
        ctx.fillText(label, px + r + 4, py - 2);
      }
    }

    function drawArrowLine(ctx, x1, y1, x2, y2, color) {
      const dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy);
      if (len < 2) return;
      ctx.strokeStyle = color; ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.setLineDash([]);
      // arrowhead
      const angle = Math.atan2(dy, dx);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - 9 * Math.cos(angle - 0.4), y2 - 9 * Math.sin(angle - 0.4));
      ctx.lineTo(x2 - 9 * Math.cos(angle + 0.4), y2 - 9 * Math.sin(angle + 0.4));
      ctx.closePath(); ctx.fill();
    }

    function checkFeasible(x1, x2) {
      return 2 * x1 + x2 <= 14 + 1e-6 && x1 + 2 * x2 <= 14 + 1e-6 && x1 >= 0 && x2 >= 0;
    }

// ─── §1 EXAMPLE CANVAS ───────────────────────────
    let exShowLP = true, exShowInt = true, exShowLattice = true;

    function drawExample() {
      const canvas = document.getElementById('exCanvas');
      const ctx = canvas.getContext('2d');
      drawBase(ctx, canvas, exShowLattice);
      if (exShowLP) {
        const p = toC(LP_OPT[0], LP_OPT[1], canvas);
        drawStar(ctx, p.x, p.y, 9, C.lp, ' x*=(4.67,4.67)');
      }
      if (exShowInt) {
        const p = toC(INT_OPT[0], INT_OPT[1], canvas);
        drawStar(ctx, p.x, p.y, 9, C.intopt, ' x★=(5,4)');
      }
    }

    function exToggleLP() { exShowLP = !exShowLP; drawExample(); }
    function exToggleInt() { exShowInt = !exShowInt; drawExample(); }
    function exToggleLattice() { exShowLattice = !exShowLattice; drawExample(); }

