// ─── §5 FIX-AND-PROPAGATE DEMO ────────────────────────
    const fpNames = ['x1', 'x2', 'x3', 'x4', 'x5', 'x6'];
    const fpLP = [0.35, 0.72, 1.0, 0.48, 2.95, 0.63];
    let fpState = {
      iter: 0,
      fixed: [],
      free: []
    };

    function fpDraw() {
      const canvas = document.getElementById('fpCanvas');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const n = fpLP.length, W = canvas.width, H = canvas.height;
      const barW = 52, gap = 28, startX = (W - n * (barW * 2 + gap + 8) + 8) / 2;
      const maxV = 4, scaleH = (H - 70) / maxV;

      // Legend
      ctx.fillStyle = 'rgba(91,156,246,0.8)'; ctx.fillRect(20, 16, 12, 12);
      ctx.fillStyle = C.text; ctx.font = '12px JetBrains Mono'; ctx.fillText('LP', 38, 26);
      ctx.fillStyle = 'rgba(126,200,160,0.8)'; ctx.fillRect(120, 16, 12, 12);
      ctx.fillStyle = C.text; ctx.fillText('Fixed', 138, 26);
      ctx.fillStyle = 'rgba(224,140,74,0.8)'; ctx.fillRect(240, 16, 12, 12);
      ctx.fillStyle = C.text; ctx.fillText('Free', 258, 26);

      let fixedCount = 0, freeCount = n;
      for (let i = 0; i < n; i++) {
        const x = startX + i * (barW * 2 + gap + 8);
        const isFixed = fpState.fixed.includes(i);
        if (isFixed) { fixedCount++; freeCount--; }

        // Background highlight
        ctx.fillStyle = isFixed ? 'rgba(126,200,160,0.07)' : 'rgba(224,140,74,0.07)';
        ctx.fillRect(x - 4, 52, barW * 2 + 16, H - 100);

        // LP bar
        const lpH = fpLP[i] / maxV * (H - 70);
        ctx.fillStyle = 'rgba(91,156,246,0.75)';
        ctx.fillRect(x, H - 42 - lpH, barW, lpH);
        ctx.fillStyle = C.blue; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'center';
        ctx.fillText(fpLP[i].toFixed(2), x + barW / 2, H - 42 - lpH - 4);

        // Fixed bar overlay
        if (isFixed) {
          ctx.fillStyle = 'rgba(126,200,160,0.85)';
          ctx.fillRect(x, H - 42 - lpH, barW, lpH);
          ctx.fillStyle = C.green; ctx.font = 'bold 10px JetBrains Mono';
          ctx.fillText('FIX', x + barW / 2 - 9, H - 42 - lpH + 10);
        }

        // Variable name
        ctx.fillStyle = C.muted; ctx.font = '12px JetBrains Mono';
        ctx.fillText(fpNames[i], x + barW / 2 + 4, H - 24);
        ctx.textAlign = 'left';
      }

      document.getElementById('fpStatus').innerHTML =
        `Iteration ${fpState.iter}: <strong>${fixedCount}</strong> fixed, <strong>${freeCount}</strong> free.<br>
      ${fpState.iter === 0 ? 'Press <strong>Step</strong> to apply LP fixing and constraint propagation.' :
            fpState.iter === 1 ? 'Press <strong>Step</strong> to run propagation and fix remaining fractional variables.' :
              'Press <strong>Step</strong> to extract final solution.'}`;

      const iterEl = document.getElementById('fpIter');
      const fixedEl = document.getElementById('fpFixed');
      const freeEl = document.getElementById('fpFree');
      if (iterEl) iterEl.textContent = fpState.iter;
      if (fixedEl) fixedEl.textContent = fixedCount;
      if (freeEl) freeEl.textContent = freeCount;
    }

    function fpStep() {
      if (fpState.iter === 0) {
        fpState.fixed = [];
        fpState.free = [];
        for (let i = 0; i < fpLP.length; i++) {
          const frac = Math.abs(fpLP[i] - Math.round(fpLP[i]));
          if (frac <= 0.5) fpState.fixed.push(i);
          else fpState.free.push(i);
        }
      } else if (fpState.iter === 1) {
        for (let i of fpState.free) {
          fpState.fixed.push(i);
        }
        fpState.free = [];
      } else {
        // Final solution extracted
      }
      fpState.iter++;
      fpDraw();
    }

    let fpTimer = null;
    function fpAuto() {
      if (fpTimer) { clearInterval(fpTimer); fpTimer = null; return; }
      fpTimer = setInterval(() => {
        if (fpState.iter >= 3) { clearInterval(fpTimer); fpTimer = null; return; }
        fpStep();
      }, 1200);
    }

    function fpReset() {
      if (fpTimer) { clearInterval(fpTimer); fpTimer = null; }
      fpState = { iter: 0, fixed: [], free: [] };
      fpDraw();
      const iterEl = document.getElementById('fpIter');
      const fixedEl = document.getElementById('fpFixed');
      const freeEl = document.getElementById('fpFree');
      if (iterEl) iterEl.textContent = '0';
      if (fixedEl) fixedEl.textContent = '0';
      if (freeEl) freeEl.textContent = String(fpLP.length);
    }
