// ─── §4 FEASIBILITY JUMP ─────────────────────────
    // For 2D example: simulate FJ moves
    let jumpState = {
      current: [5, 5], // start from infeasible nearest-rounded point
      lam: [1.0, 1.0],
      iter: 0,
      done: false
    };
    let jumpTimer = null;

    function jumpViolations(x1, x2) {
      return [Math.max(0, 2 * x1 + x2 - 14), Math.max(0, x1 + 2 * x2 - 14)];
    }

    function jumpScore(x1, x2, lam) {
      const v = jumpViolations(x1, x2);
      const obj = -(11 * x1 + 6 * x2) / 79.33; // normalised (minimise = negate max)
      return lam[0] * v[0] + lam[1] * v[1] + 0.15 * obj;
    }

    function jumpGetMoves(x1, x2) {
      const moves = [];
      for (const [nx1, nx2] of [[x1 - 1, x2], [x1 + 1, x2], [x1, x2 - 1], [x1, x2 + 1], [x1 - 1, x2 + 1], [x1 + 1, x2 - 1]]) {
        if (nx1 < 0 || nx2 < 0 || nx1 > 10 || nx2 > 10) continue;
        const s = jumpScore(nx1, nx2, jumpState.lam);
        const v = jumpViolations(nx1, nx2);
        moves.push({ x1: nx1, x2: nx2, score: s, viol: v[0] + v[1] });
      }
      return moves.sort((a, b) => a.score - b.score);
    }

    function jumpReset() {
      jumpState = { current: [5, 5], lam: [1.0, 1.0], iter: 0, done: false };
      if (jumpTimer) { clearInterval(jumpTimer); jumpTimer = null; }
      jumpDraw();
    }

    function jumpDraw() {
      const canvas = document.getElementById('jumpCanvas');
      const ctx = canvas.getContext('2d');
      drawBase(ctx, canvas, true);

      // Current point
      const p = toC(jumpState.current[0], jumpState.current[1], canvas);
      const v = jumpViolations(jumpState.current[0], jumpState.current[1]);
      const feasible = v[0] < 1e-6 && v[1] < 1e-6;
      const col = feasible ? C.intopt : C.orange;
      drawDot(ctx, p.x, p.y, 9, col, ` x=(${jumpState.current[0]},${jumpState.current[1]})`);

      // Show violations visually — color the violated constraints red
      if (v[0] > 1e-6) {
        // constraint 1: 2x1+x2=14 line
        const pa = toC(0, 14, canvas), pb = toC(7, 0, canvas);
        ctx.strokeStyle = 'rgba(224,108,117,0.6)'; ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
      }
      if (v[1] > 1e-6) {
        const pa = toC(0, 7, canvas), pb = toC(14, 0, canvas);
        const pb2 = toC(Math.min(14, 8.3), 0, canvas);
        ctx.strokeStyle = 'rgba(224,108,117,0.4)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb2.x, pb2.y); ctx.stroke();
      }

      // LP optimal
      const lp = toC(LP_OPT[0], LP_OPT[1], canvas);
      drawStar(ctx, lp.x, lp.y, 7, C.lp, '');

      // Moves
      const moves = jumpGetMoves(jumpState.current[0], jumpState.current[1]);
      moves.slice(0, 4).forEach((m, i) => {
        const mp = toC(m.x1, m.x2, canvas);
        const mc = i === 0 ? C.teal : 'rgba(255,255,255,0.2)';
        drawDot(ctx, mp.x, mp.y, i === 0 ? 6 : 4, mc, '');
      });

      document.getElementById('lam1').textContent = jumpState.lam[0].toFixed(2);
      document.getElementById('lam2').textContent = jumpState.lam[1].toFixed(2);

      const curScore = jumpScore(jumpState.current[0], jumpState.current[1], jumpState.lam);
      const status = document.getElementById('jumpStatus');
      if (feasible) {
        status.innerHTML = `<span class="good">✓ FEASIBLE! x=(${jumpState.current[0]},${jumpState.current[1]}), obj=${11 * jumpState.current[0] + 6 * jumpState.current[1]}</span><br>Feasibility Jump found a MIP solution in ${jumpState.iter} steps.`;
      } else {
        status.innerHTML = `Iter ${jumpState.iter} | Current: (${jumpState.current[0]},${jumpState.current[1]})<br>
Violations: v₁=${v[0].toFixed(1)}, v₂=${v[1].toFixed(1)}<br>
Score f_λ = ${curScore.toFixed(3)}<br>
<span class="info">Best move: (${moves[0].x1},${moves[0].x2})</span> score=${moves[0].score.toFixed(3)}`;
      }

      // Move table
      let mhtml = `<div style="font-family:JetBrains Mono,monospace;font-size:11px">
  <div style="color:var(--muted);margin-bottom:4px">CANDIDATE MOVES (top 5)</div>
  <table style="width:100%;border-collapse:collapse">
  <tr><th style="text-align:left;padding:2px 6px;color:var(--muted)">MOVE</th><th style="padding:2px 6px;color:var(--muted)">VIOL</th><th style="padding:2px 6px;color:var(--muted)">SCORE</th><th style="padding:2px 6px;color:var(--muted)">BEST?</th></tr>`;
      moves.slice(0, 5).forEach((m, i) => {
        const bg = i === 0 ? 'rgba(76,201,168,0.07)' : '';
        mhtml += `<tr style="background:${bg}">
      <td style="padding:2px 6px">(${m.x1},${m.x2})</td>
      <td style="padding:2px 6px;color:${m.viol < 1e-6 ? 'var(--green)' : 'var(--red)'}">${m.viol.toFixed(1)}</td>
      <td style="padding:2px 6px">${m.score.toFixed(4)}</td>
      <td style="padding:2px 6px;color:var(--teal)">${i === 0 ? '★' : ''}</td>
    </tr>`;
      });
      mhtml += '</table></div>';
      document.getElementById('jumpMoveTable').innerHTML = mhtml;
    }

    function jumpStep() {
      if (jumpState.done) { jumpReset(); return; }
      const moves = jumpGetMoves(jumpState.current[0], jumpState.current[1]);
      if (moves.length === 0) return;
      const best = moves[0];
      jumpState.current = [best.x1, best.x2];
      jumpState.iter++;

      // Update multipliers
      const v = jumpViolations(best.x1, best.x2);
      jumpState.lam[0] = Math.min(1e4, jumpState.lam[0] * (v[0] > 0 ? 1.15 : 0.99) + (v[0] > 0 ? 0.05 : 0));
      jumpState.lam[1] = Math.min(1e4, jumpState.lam[1] * (v[1] > 0 ? 1.15 : 0.99) + (v[1] > 0 ? 0.05 : 0));

      const feasible = v[0] < 1e-6 && v[1] < 1e-6;
      if (feasible) jumpState.done = true;
      jumpDraw();
    }

    function jumpAuto() {
      if (jumpTimer) { clearInterval(jumpTimer); jumpTimer = null; return; }
      jumpTimer = setInterval(() => {
        if (jumpState.done) { clearInterval(jumpTimer); jumpTimer = null; return; }
        jumpStep();
      }, 700);
    }
