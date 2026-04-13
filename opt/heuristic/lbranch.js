// ─── §8 LOCAL BRANCHING ──────────────────────────
    const LB_N = 10; // 10 binary variables
    let lbInc = [1, 0, 1, 1, 0, 0, 1, 0, 1, 0];
    let lbCurrent = [...lbInc];
    let lbK = 3;

    function lbUpdateK(v) {
      lbK = parseInt(v);
      document.getElementById('lbKval').textContent = lbK;
      lbDraw();
    }

    function lbHamming(a, b) {
      let d = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++; return d;
    }

    function lbReset() {
      lbCurrent = [...lbInc];
      lbDraw();
    }

    function lbRandomFlip() {
      // Random valid flip within radius k
      const eligible = [];
      for (let i = 0; i < LB_N; i++) {
        const newS = [...lbCurrent]; newS[i] = 1 - newS[i];
        if (lbHamming(newS, lbInc) <= lbK) eligible.push(i);
      }
      if (eligible.length === 0) return;
      const fi = eligible[Math.floor(Math.random() * eligible.length)];
      lbCurrent[fi] = 1 - lbCurrent[fi];
      lbDraw();
    }

    function lbDraw() {
      const canvas = document.getElementById('lbCanvas');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = C.bg; ctx.fillRect(0, 0, canvas.width, canvas.height);

      const W = canvas.width, H = canvas.height;
      const n = LB_N, cellW = 58, cellH = 58;
      const startX = (W - n * cellW) / 2;

      // Title rows
      ctx.fillStyle = C.muted; ctx.font = '11px JetBrains Mono'; ctx.textAlign = 'center';
      ctx.fillText('INCUMBENT  x̄', W / 2, 22);
      ctx.fillText('CURRENT  x', W / 2, 130);
      ctx.textAlign = 'left';

      const ham = lbHamming(lbCurrent, lbInc);

      for (let i = 0; i < n; i++) {
        const x = startX + i * cellW, y1 = 30, y2 = 140;

        // -- Incumbent row --
        const incV = lbInc[i];
        ctx.fillStyle = incV ? 'rgba(76,201,168,0.3)' : 'rgba(91,156,246,0.15)';
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(x + 3, y1, cellW - 6, cellH - 6, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = incV ? C.teal : C.blue; ctx.font = 'bold 20px JetBrains Mono'; ctx.textAlign = 'center';
        ctx.fillText(incV, x + cellW / 2, y1 + 35);
        ctx.fillStyle = C.muted; ctx.font = '10px JetBrains Mono';
        ctx.fillText('x̄₍' + (i + 1) + '₎', x + cellW / 2, y1 + 50);

        // -- Current row --
        const curV = lbCurrent[i];
        const flipped = curV !== incV;
        ctx.fillStyle = flipped ? 'rgba(232,169,74,0.3)' : 'rgba(126,200,160,0.1)';
        ctx.strokeStyle = flipped ? 'rgba(232,169,74,0.5)' : 'rgba(255,255,255,0.06)'; ctx.lineWidth = flipped ? 2 : 1;
        ctx.beginPath(); ctx.roundRect(x + 3, y2, cellW - 6, cellH - 6, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = flipped ? C.lp : C.green; ctx.font = 'bold 20px JetBrains Mono';
        ctx.fillText(curV, x + cellW / 2, y2 + 35);
        if (flipped) {
          ctx.fillStyle = C.orange; ctx.font = 'bold 11px JetBrains Mono';
          ctx.fillText('⟳', x + cellW / 2, y2 + 52);
        }
        ctx.textAlign = 'left';
      }

      // Hamming info
      const y3 = 210;
      ctx.fillStyle = C.muted; ctx.font = '12px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(`Hamming distance d(x, x̄) = ${ham}  |  Radius k = ${lbK}  |  Constraint: d ≤ k`, W / 2, y3);

      // Constraint bar
      const barX = startX, barY = 222, barW = n * cellW, barH = 16;
      ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(barX, barY, barW, barH);
      const filled = Math.min(ham / lbK, 1);
      const fillCol = ham <= lbK ? 'rgba(76,201,168,0.6)' : 'rgba(224,108,117,0.7)';
      ctx.fillStyle = fillCol; ctx.fillRect(barX, barY, barW * filled, barH);
      ctx.fillStyle = C.text; ctx.font = '11px JetBrains Mono';
      ctx.fillText(`${ham} / ${lbK}  ${ham <= lbK ? '✓ within neighborhood' : '✗ outside neighborhood (k=' + lbK + ')'}`, barX + 6, barY + 12);

      document.getElementById('lbStatus').innerHTML =
        `Hamming distance from incumbent: <span class="highlight">${ham}</span> / ${lbK}.<br>
<span style="color:var(--orange)">Gold cells</span> = flipped bits. The local branching cut allows at most k=${lbK} flips.<br>
${ham <= lbK ? '<span class="good">✓ This point is inside the local branching neighborhood.</span>' : '<span class="bad">✗ Outside neighborhood — constraint violated.</span>'}`;
      ctx.textAlign = 'left';
    }
