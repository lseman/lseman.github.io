// ─── §2 ROUNDING DEMO ────────────────────────────
    let roundPoint = null;

    function runRounding() {
      const mode = document.getElementById('roundMode').value;
      const x1_lp = 14 / 3, x2_lp = 14 / 3;
      let x1, x2, label;
      if (mode === 'nearest') { x1 = Math.round(x1_lp); x2 = Math.round(x2_lp); label = 'Nearest'; }
      else if (mode === 'down') { x1 = Math.floor(x1_lp); x2 = Math.floor(x2_lp); label = 'Floor'; }
      else if (mode === 'up') { x1 = Math.ceil(x1_lp); x2 = Math.ceil(x2_lp); label = 'Ceil'; }
      else {
        // Objective-guided: coefficient 11 for x1, 6 for x2
        // For max: prefer rounding up variables with positive large coefficient
        x1 = Math.ceil(x1_lp);  // c1=11, prefer up
        x2 = Math.floor(x2_lp); // c2=6, round down to satisfy constraint
        label = 'Guided';
      }
      roundPoint = { x1, x2, label };

      const canvas = document.getElementById('roundCanvas');
      const ctx = canvas.getContext('2d');
      drawBase(ctx, canvas, true);
      // LP point
      const lp = toC(LP_OPT[0], LP_OPT[1], canvas);
      drawStar(ctx, lp.x, lp.y, 8, C.lp, '');
      // Arrow
      const rp = toC(x1, x2, canvas);
      drawArrowLine(ctx, lp.x, lp.y, rp.x, rp.y, C.purple);
      // Rounded point
      const feasible = checkFeasible(x1, x2);
      const col = feasible ? C.intopt : C.cand;
      drawDot(ctx, rp.x, rp.y, 8, col, '');
      ctx.fillStyle = col;
      ctx.font = 'bold 12px JetBrains Mono';
      ctx.fillText(`(${x1},${x2})`, rp.x + 11, rp.y - 3);

      const obj = 11 * x1 + 6 * x2;
      const status = document.getElementById('roundStatus');
      status.innerHTML = `<span class="highlight">${label} rounding</span><br>
LP: (${x1_lp.toFixed(3)}, ${x2_lp.toFixed(3)}) → Rounded: (${x1}, ${x2})<br>
Obj = 11·${x1} + 6·${x2} = <span class="highlight">${obj}</span><br>
2x₁+x₂ = ${2 * x1 + x2} ≤ 14? ${2 * x1 + x2 <= 14 ? '<span class="good">✓</span>' : '<span class="bad">✗ INFEASIBLE</span>'}<br>
x₁+2x₂ = ${x1 + 2 * x2} ≤ 14? ${x1 + 2 * x2 <= 14 ? '<span class="good">✓</span>' : '<span class="bad">✗ INFEASIBLE</span>'}<br>
${feasible ? '<span class="good">✓ Feasible solution found!</span>' : '<span class="bad">✗ Constraint violated — need another strategy.</span>'}`;
    }

    function resetRounding() {
      roundPoint = null;
      const canvas = document.getElementById('roundCanvas');
      const ctx = canvas.getContext('2d');
      drawBase(ctx, canvas, true);
      const lp = toC(LP_OPT[0], LP_OPT[1], canvas);
      drawStar(ctx, lp.x, lp.y, 8, C.lp, ' LP optimal');
      document.getElementById('roundStatus').innerHTML = 'Click a rounding strategy to see the result.';
    }
