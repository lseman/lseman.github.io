// ─── §7 LOCAL SEARCH ─────────────────────────────
    // 6-variable example with sliding window
    const localInc = [4, 4, 2, 1, 3, 1];
    const localLP = [4.67, 4.67, 2.1, 1.3, 3.0, 0.8];
    const localNames = ['x₁', 'x₂', 'x₃', 'x₄', 'x₅', 'x₆'];
    let localIter = 0;

    // Ranked by |LP - inc|
    function localRanked() {
      return localInc.map((v, i) => ({ i, dis: Math.abs(localLP[i] - v) }))
        .sort((a, b) => b.dis - a.dis);
    }

    function localW() { return parseInt(document.getElementById('localW').value); }

    function localGetWindow() {
      const ranked = localRanked();
      const w = localW();
      const window = new Set();
      for (let k = 0; k < w; k++) window.add(ranked[(localIter + k) % localNames.length].i);
      return window;
    }

    function localDraw() {
      const canvas = document.getElementById('localCanvas');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, canvas.width, canvas.height);

      const n = localNames.length, W = canvas.width, H = canvas.height;
      const cellW = 90, cellH = 110, startX = (W - n * cellW) / 2, startY = (H - cellH) / 2;
      const window = localGetWindow();
      const ranked = localRanked();

      ranked.forEach((r, rank) => {
        const i = r.i, x = startX + i * cellW + 5, y = startY;
        const inW = window.has(i);
        const dis = r.dis;

        // Cell background
        ctx.fillStyle = inW ? 'rgba(232,169,74,0.15)' : 'rgba(255,255,255,0.03)';
        ctx.strokeStyle = inW ? C.lp : 'rgba(255,255,255,0.08)';
        ctx.lineWidth = inW ? 2 : 1;
        ctx.beginPath(); ctx.roundRect(x, y, cellW - 10, cellH, 6); ctx.fill(); ctx.stroke();

        // Value
        ctx.fillStyle = inW ? C.lp : C.text;
        ctx.font = `bold 24px JetBrains Mono`;
        ctx.textAlign = 'center';
        ctx.fillText(localInc[i], x + (cellW - 10) / 2, y + 42);

        // LP hint
        ctx.fillStyle = C.blue; ctx.font = '11px JetBrains Mono';
        ctx.fillText('LP:' + localLP[i].toFixed(1), x + (cellW - 10) / 2, y + 60);

        // Disagreement
        ctx.fillStyle = dis > 0.3 ? C.orange : C.green; ctx.font = '10px JetBrains Mono';
        ctx.fillText('Δ=' + dis.toFixed(2), x + (cellW - 10) / 2, y + 76);

        // Status
        ctx.fillStyle = inW ? C.gold : 'rgba(255,255,255,0.2)';
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.fillText(inW ? 'FREE' : 'FIXED', x + (cellW - 10) / 2, y + 92);

        // Rank badge
        ctx.fillStyle = C.muted; ctx.font = '10px JetBrains Mono';
        ctx.fillText(`rank ${rank + 1}`, x + (cellW - 10) / 2, y + 106);

        // Name
        ctx.fillStyle = inW ? C.lp : C.muted; ctx.font = '14px JetBrains Mono';
        ctx.fillText(localNames[i], x + (cellW - 10) / 2, y - 8);
        ctx.textAlign = 'left';
      });

      document.getElementById('localStatus').innerHTML =
        `Iter ${localIter}: Window W = {${Array.from(window).map(i => localNames[i]).join(', ')}} (gold). All others fixed to incumbent values.<br>
Sliding window selects variables with largest LP–incumbent disagreement Δ.`;
    }

    function localStep() {
      localIter = (localIter + 1) % localNames.length;
      localDraw();
    }

    function localReset() { localIter = 0; localDraw(); }
