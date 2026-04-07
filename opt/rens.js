// ─── §5 RENS DEMO ────────────────────────────────
    // 8-variable example for RENS visualization
    const rensLP = [4.67, 4.67, 2.0, 1.3, 3.0, 0.7, 2.5, 1.8];
    const rensNames = ['x₁', 'x₂', 'x₃', 'x₄', 'x₅', 'x₆', 'x₇', 'x₈'];
    let rensState = { ratio: 0.70, fixed: null };

    function rensIsInt(v) { return Math.abs(v - Math.round(v)) < 0.05; }

    function rensUpdateRatio(val) {
      rensState.ratio = val / 100;
      document.getElementById('rensRatioVal').textContent = rensState.ratio.toFixed(2);
    }

    function rensApply() {
      // Sort fractional by closeness to integer
      const fracs = [];
      for (let i = 0; i < rensLP.length; i++) {
        if (!rensIsInt(rensLP[i])) fracs.push({ i, dist: Math.abs(rensLP[i] - Math.round(rensLP[i])) });
      }
      fracs.sort((a, b) => a.dist - b.dist);

      const intCount = rensLP.filter(v => rensIsInt(v)).length;
      const fracCount = rensLP.length - intCount;
      const totalFixed = Math.round(rensState.ratio * rensLP.length);
      const extraFix = Math.max(0, totalFixed - intCount);

      rensState.fixed = new Array(rensLP.length).fill(null).map((_, i) => ({
        type: rensIsInt(rensLP[i]) ? 'fixed_int' : 'free'
      }));
      fracs.slice(0, Math.min(extraFix, fracs.length)).forEach(f => {
        rensState.fixed[f.i].type = 'fixed_frac';
      });

      const fixedCount = rensState.fixed.filter(f => f.type !== 'free').length;
      document.getElementById('rensStatus').innerHTML =
        `<span class="highlight">Fix ratio ${(rensState.ratio * 100).toFixed(0)}%</span>: fixed ${fixedCount}/${rensLP.length} variables.<br>
<span class="good">■ Green</span> = fixed (LP already integer). <span style="color:var(--orange)">■ Orange</span> = fixed by proximity. <span class="info">■ Blue</span> = free (sub-MIP will optimise).`;
      rensDraw();
    }

    function rensReset() {
      rensState.fixed = null;
      document.getElementById('rensStatus').innerHTML =
        'Each bar shows the LP value of a variable. Green = already integer (fixed). Orange = fractional (bounded or fixed by priority).';
      rensDraw();
    }

    function rensDraw() {
      const canvas = document.getElementById('rensCanvas');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const n = rensLP.length, W = canvas.width, H = canvas.height;
      const barW = 52, gap = 14, startX = (W - n * (barW + gap) + gap) / 2;
      const maxV = 6, scaleH = (H - 70) / maxV;

      // Grid lines
      for (let i = 0; i <= maxV; i++) {
        const y = H - 40 - i * scaleH;
        ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(startX - 5, y); ctx.lineTo(W - 10, y); ctx.stroke();
        ctx.fillStyle = C.muted; ctx.font = '10px JetBrains Mono';
        ctx.fillText(i, startX - 22, y + 4);
      }

      for (let i = 0; i < n; i++) {
        const x = startX + i * (barW + gap);
        const v = rensLP[i];
        const bH = v / maxV * (H - 70);
        const isInt = rensIsInt(v);

        let col, label;
        if (rensState.fixed === null) {
          col = isInt ? 'rgba(126,200,160,0.75)' : 'rgba(91,156,246,0.6)';
          label = isInt ? 'INT' : 'FRAC';
        } else {
          const ft = rensState.fixed[i].type;
          if (ft === 'fixed_int') { col = 'rgba(126,200,160,0.85)'; label = 'FIX'; }
          else if (ft === 'fixed_frac') { col = 'rgba(224,140,74,0.85)'; label = 'FIX'; }
          else { col = 'rgba(91,156,246,0.7)'; label = 'FREE'; }
        }

        // Bar
        ctx.fillStyle = col;
        ctx.fillRect(x, H - 40 - bH, barW, bH);
        // Integer floor/ceil lines
        const fH = Math.floor(v) / maxV * (H - 70);
        const cH = Math.ceil(v) / maxV * (H - 70);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        if (!isInt) {
          ctx.beginPath(); ctx.moveTo(x, H - 40 - fH); ctx.lineTo(x + barW, H - 40 - fH); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x, H - 40 - cH); ctx.lineTo(x + barW, H - 40 - cH); ctx.stroke();
        }
        ctx.setLineDash([]);

        // Value label
        ctx.fillStyle = C.text; ctx.font = 'bold 12px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(v.toFixed(2), x + barW / 2, H - 40 - bH - 6);
        ctx.fillStyle = col; ctx.font = '10px JetBrains Mono';
        ctx.fillText(label, x + barW / 2, H - 40 - bH - 18);

        // Variable name
        ctx.fillStyle = C.muted; ctx.font = '12px JetBrains Mono';
        ctx.fillText(rensNames[i], x + barW / 2, H - 22);
        ctx.textAlign = 'left';
      }
    }
