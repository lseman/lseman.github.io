// ─── §6 RINS DEMO ────────────────────────────────
    const rinsLP = [4.67, 4.67, 2.0, 1.4, 3.1, 0.8, 2.4, 1.9];
    const rinsInc = [4.0, 4.0, 2.0, 1.0, 3.0, 1.0, 2.0, 2.0];
    const rinsNames = ['x₁', 'x₂', 'x₃', 'x₄', 'x₅', 'x₆', 'x₇', 'x₈'];
    let rinsTol = 0.5;

    function rinsUpdateTol(val) {
      rinsTol = val / 100 * 2; // 0 to 2
      document.getElementById('rinsTolVal').textContent = rinsTol.toFixed(2);
      rinsDraw();
    }

    function rinsAgree(i) {
      return Math.abs(rinsLP[i] - Math.round(rinsInc[i])) <= rinsTol;
    }

    function rinsDraw() {
      const canvas = document.getElementById('rinsCanvas');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const n = rinsLP.length, W = canvas.width, H = canvas.height;
      const barW = 34, gap = 22, startX = (W - n * (barW * 2 + gap + 8) + 8) / 2;
      const maxV = 6, scaleH = (H - 80) / maxV;

      // Legend
      ctx.fillStyle = 'rgba(91,156,246,0.8)'; ctx.fillRect(20, 14, 12, 12);
      ctx.fillStyle = C.text; ctx.font = '12px JetBrains Mono'; ctx.fillText('LP value', 38, 24);
      ctx.fillStyle = 'rgba(232,169,74,0.8)'; ctx.fillRect(120, 14, 12, 12);
      ctx.fillStyle = C.text; ctx.fillText('Incumbent', 138, 24);
      ctx.fillStyle = 'rgba(126,200,160,0.3)'; ctx.fillRect(250, 14, 12, 12);
      ctx.fillStyle = C.text; ctx.fillText('Agree (fix)', 268, 24);
      ctx.fillStyle = 'rgba(224,140,74,0.3)'; ctx.fillRect(380, 14, 12, 12);
      ctx.fillStyle = C.text; ctx.fillText('Disagree (free)', 398, 24);

      let fixCount = 0, freeCount = 0;
      for (let i = 0; i < n; i++) {
        const x = startX + i * (barW * 2 + gap + 8);
        const agree = rinsAgree(i);
        if (agree) fixCount++; else freeCount++;

        // Background highlight
        ctx.fillStyle = agree ? 'rgba(126,200,160,0.07)' : 'rgba(224,140,74,0.07)';
        ctx.fillRect(x - 4, 36, barW * 2 + 16, H - 80);

        // LP bar
        const lpH = rinsLP[i] / maxV * scaleH * (H - 80) / scaleH;
        ctx.fillStyle = 'rgba(91,156,246,0.75)';
        ctx.fillRect(x, H - 46 - lpH, barW, lpH);
        ctx.fillStyle = C.blue; ctx.font = '10px JetBrains Mono'; ctx.textAlign = 'center';
        ctx.fillText(rinsLP[i].toFixed(1), x + barW / 2, H - 46 - lpH - 4);

        // Incumbent bar
        const incH = rinsInc[i] / maxV * scaleH * (H - 80) / scaleH;
        ctx.fillStyle = 'rgba(232,169,74,0.75)';
        ctx.fillRect(x + barW + 8, H - 46 - incH, barW, incH);
        ctx.fillStyle = C.lp; ctx.font = '10px JetBrains Mono';
        ctx.fillText(rinsInc[i].toFixed(1), x + barW + 8 + barW / 2, H - 46 - incH - 4);

        // Agreement badge
        ctx.fillStyle = agree ? C.green : C.orange;
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.fillText(agree ? 'FIX' : 'FREE', x + barW / 2 + 4, H - 30);

        // Variable name
        ctx.fillStyle = C.muted; ctx.font = '12px JetBrains Mono';
        ctx.fillText(rensNames[i], x + barW / 2 + 4, H - 14);
        ctx.textAlign = 'left';
      }

      document.getElementById('rinsStatus').innerHTML =
        `Blue = LP values. Gold = Incumbent values. Tolerance τ=${rinsTol.toFixed(2)}.<br>
<span class="good">■ Fixed: ${fixCount}</span> variables agree. <span class="info">■ Free: ${freeCount}</span> form the RINS sub-MIP.`;
    }

    function rinsReset() { rinsTol = 0.5; document.getElementById('rinsTolVal').textContent = '0.50'; rinsDraw(); }
