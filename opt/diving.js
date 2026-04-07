// ─── § NEW — DIVING DEMO ─────────────────────────────
    let divingState = {
      depth: 0,
      lpPoint: [14 / 3, 14 / 3],
      fixed: {},           // j → fixed value
      trace: []
    };

    function divingReset() {
      divingState = { depth: 0, lpPoint: [14 / 3, 14 / 3], fixed: {}, trace: [] };
      if (divingTimer) clearInterval(divingTimer);
      divingDraw();
    }

    let divingTimer = null;

    function getDivingScore(mode, x_lp) {
      // x_lp = [x1, x2]
      const frac1 = Math.abs(x_lp[0] - Math.round(x_lp[0]));
      const frac2 = Math.abs(x_lp[1] - Math.round(x_lp[1]));
      if (mode === 'fractional') {
        return [frac1, frac2]; // smaller = better to fix
      } else if (mode === 'guided') {
        // toward (5,4)
        return [Math.abs(x_lp[0] - 5), Math.abs(x_lp[1] - 4)];
      } else { // coefficient: x1 has c=11 > c2=6 → prefer fix x1 when fractional
        return [frac1 * 0.6, frac2 * 1.0]; // bias toward x1
      }
    }

    function divingStep() {
      const mode = document.getElementById('divingMode').value;
      if (divingState.depth >= 8) { divingReset(); return; }

      const scores = getDivingScore(mode, divingState.lpPoint);
      let toFix = scores[0] < scores[1] ? 0 : 1;   // 0 = x1, 1 = x2

      // if already fixed, choose the other
      if (divingState.fixed.hasOwnProperty(toFix)) toFix = 1 - toFix;

      const value = Math.round(divingState.lpPoint[toFix]);
      divingState.fixed[toFix] = value;

      // Simulate new LP point (move toward feasible region)
      let newX = [...divingState.lpPoint];
      if (toFix === 0) newX[0] = value;
      else newX[1] = value;

      // Pull slightly toward feasibility / objective
      if (!checkFeasible(newX[0], newX[1])) {
        newX[0] = Math.min(newX[0], 5);
        newX[1] = Math.min(newX[1], 4);
      }
      divingState.lpPoint = newX;
      divingState.depth++;

      divingState.trace.push({
        depth: divingState.depth,
        fixedVar: toFix === 0 ? 'x₁' : 'x₂',
        value: value,
        lp: newX.map(v => v.toFixed(2)).join(', ')
      });

      divingDraw();
    }

    function divingDraw() {
      const canvas = document.getElementById('divingCanvas');
      const ctx = canvas.getContext('2d');
      drawBase(ctx, canvas, true);

      // LP point (current)
      const lp = toC(divingState.lpPoint[0], divingState.lpPoint[1], canvas);
      drawStar(ctx, lp.x, lp.y, 8, C.lp, ' current LP');

      // Fixed points
      Object.keys(divingState.fixed).forEach(j => {
        const val = divingState.fixed[j];
        const p = toC(j == 0 ? val : divingState.lpPoint[0], j == 1 ? val : divingState.lpPoint[1], canvas);
        drawDot(ctx, p.x, p.y, 6, C.intopt, '');
      });

      // Trace path
      if (divingState.trace.length > 1) {
        ctx.strokeStyle = C.purple;
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        let prev = toC(divingState.trace[0].lp.split(',')[0], divingState.trace[0].lp.split(',')[1], canvas);
        ctx.moveTo(prev.x, prev.y);
        for (let i = 1; i < divingState.trace.length; i++) {
          const curr = toC(parseFloat(divingState.trace[i].lp.split(',')[0]),
            parseFloat(divingState.trace[i].lp.split(',')[1]), canvas);
          ctx.lineTo(curr.x, curr.y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Status
      let html = `<strong>Dive depth: ${divingState.depth}</strong><br>`;
      divingState.trace.forEach(t => {
        html += `Step ${t.depth}: fixed ${t.fixedVar} = ${t.value} → LP ≈ (${t.lp})<br>`;
      });
      if (checkFeasible(divingState.lpPoint[0], divingState.lpPoint[1]) &&
        Math.abs(divingState.lpPoint[0] - Math.round(divingState.lpPoint[0])) < 1e-4 &&
        Math.abs(divingState.lpPoint[1] - Math.round(divingState.lpPoint[1])) < 1e-4) {
        html += '<span class="good">✓ Feasible integer solution reached!</span>';
      }
      document.getElementById('divingTrace').innerHTML = html;

      document.getElementById('divingStatus').innerHTML =
        `Mode: <span class="highlight">${document.getElementById('divingMode').options[document.getElementById('divingMode').selectedIndex].text}</span><br>
     Fixed variables: ${Object.keys(divingState.fixed).length}`;
    }

    function divingAuto() {
      if (divingTimer) { clearInterval(divingTimer); divingTimer = null; return; }
      divingTimer = setInterval(() => {
        if (divingState.depth >= 8) { clearInterval(divingTimer); divingTimer = null; return; }
        divingStep();
      }, 800);
    }

    function initDiving() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', divingReset);
      } else {
        divingReset();
      }
    }

    initDiving();
