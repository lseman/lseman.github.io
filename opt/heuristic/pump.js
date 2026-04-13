// ─── §3 FEASIBILITY PUMP ─────────────────────────
    // Pre-computed pump trace (approximate for pedagogical purposes)
    const pumpTrace = [
      { ref: [14 / 3, 14 / 3], rounded: [5, 5], action: 'Round LP → (5,5)', note: 'INFEASIBLE — constraint 2x₁+x₂≤14 violated: 15>14', ok: false },
      { ref: [4.6, 4.8], rounded: [5, 5], action: 'Project (5,5) onto LP → (4.6,4.8)', note: 'Moved towards (5,5) inside LP region', ok: false },
      { ref: [4.6, 4.8], rounded: [5, 5], action: 'Round → (5,5) again — CYCLE DETECTED', note: 'Signature matches previous. Applying perturbation...', ok: false, cycle: true },
      { ref: [4.8, 4.3], rounded: [5, 4], action: 'Perturbed reference → (4.8, 4.3)', note: 'After perturbation, round to (5,4)', ok: false },
      { ref: [4.8, 4.3], rounded: [5, 4], action: 'Round → (5,4) ✓ FEASIBLE!', note: '2(5)+4=14≤14 ✓, 5+2(4)=13≤14 ✓', ok: true },
    ];
    let pumpIdx = 0;
    let pumpTimer = null;

    function pumpReset() {
      pumpIdx = 0;
      if (pumpTimer) { clearInterval(pumpTimer); pumpTimer = null; }
      const canvas = document.getElementById('pumpCanvas');
      const ctx = canvas.getContext('2d');
      drawBase(ctx, canvas, true);
      const lp = toC(LP_OPT[0], LP_OPT[1], canvas);
      drawStar(ctx, lp.x, lp.y, 8, C.lp, ' x_LP=(4.67,4.67)');
      document.getElementById('pumpStatus').innerHTML = 'Press <strong>Step</strong> to start the Feasibility Pump.';
      document.getElementById('pumpTable').innerHTML = '';
    }

    function pumpDraw(idx) {
      if (idx >= pumpTrace.length) return;
      const t = pumpTrace[idx];
      const canvas = document.getElementById('pumpCanvas');
      const ctx = canvas.getContext('2d');
      drawBase(ctx, canvas, true);

      // Draw all previous reference points
      for (let i = 0; i <= idx; i++) {
        const prev = pumpTrace[i];
        const rp = toC(prev.ref[0], prev.ref[1], canvas);
        ctx.beginPath(); ctx.arc(rp.x, rp.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(91,156,246,0.3)'; ctx.fill();
      }

      // Current reference
      const ref = toC(t.ref[0], t.ref[1], canvas);
      drawDot(ctx, ref.x, ref.y, 7, C.ref, ` ref=(${t.ref[0].toFixed(2)},${t.ref[1].toFixed(2)})`);

      // Arrow to rounded
      const rnd = toC(t.rounded[0], t.rounded[1], canvas);
      drawArrowLine(ctx, ref.x, ref.y, rnd.x, rnd.y, t.cycle ? C.purple : C.orange);

      // Rounded point
      const col = t.ok ? C.intopt : (t.cycle ? C.purple : C.cand);
      drawDot(ctx, rnd.x, rnd.y, 8, col, ` (${t.rounded[0]},${t.rounded[1]})`);

      // LP star
      const lp = toC(LP_OPT[0], LP_OPT[1], canvas);
      drawStar(ctx, lp.x, lp.y, 7, C.lp, '');

      document.getElementById('pumpStatus').innerHTML =
        `<span class="highlight">Iter ${idx + 1}/${pumpTrace.length}</span><br>
<span class="info">${t.action}</span><br>
${t.cycle ? '<span class="bad">⟳ CYCLE — applying perturbation</span><br>' : ''}
${t.note}<br>
${t.ok ? '<span class="good">✓ Feasibility Pump succeeded!</span>' : ''}`;

      // Table
      let thtml = '<table style="width:100%;border-collapse:collapse">';
      thtml += '<tr><th style="text-align:left;padding:2px 6px;font-size:11px;color:var(--muted)">ITER</th><th style="padding:2px 6px;font-size:11px;color:var(--muted)">REFERENCE</th><th style="padding:2px 6px;font-size:11px;color:var(--muted)">ROUNDED</th><th style="padding:2px 6px;font-size:11px;color:var(--muted)">STATUS</th></tr>';
      for (let i = 0; i <= idx; i++) {
        const tr = pumpTrace[i];
        const sc = i === idx ? 'color:var(--text)' : 'color:var(--muted)';
        thtml += `<tr style="${sc}">
      <td style="padding:2px 6px">${i + 1}</td>
      <td style="padding:2px 6px">(${tr.ref[0].toFixed(2)},${tr.ref[1].toFixed(2)})</td>
      <td style="padding:2px 6px">(${tr.rounded[0]},${tr.rounded[1]})</td>
      <td style="padding:2px 6px">${tr.ok ? '<span style="color:var(--green)">✓ MIP Feasible</span>' : tr.cycle ? '<span style="color:var(--purple)">⟳ Cycle</span>' : '<span style="color:var(--red)">✗ Infeasible</span>'}</td>
    </tr>`;
      }
      thtml += '</table>';
      document.getElementById('pumpTable').innerHTML = thtml;
    }

    function pumpStep() {
      if (pumpIdx < pumpTrace.length) {
        pumpDraw(pumpIdx);
        pumpIdx++;
      } else {
        pumpReset();
        pumpDraw(0);
        pumpIdx = 1;
      }
    }

    function pumpAuto() {
      if (pumpTimer) { clearInterval(pumpTimer); pumpTimer = null; return; }
      pumpTimer = setInterval(() => {
        if (pumpIdx >= pumpTrace.length) { clearInterval(pumpTimer); pumpTimer = null; return; }
        pumpDraw(pumpIdx); pumpIdx++;
      }, 1100);
    }
