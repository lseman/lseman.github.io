// ─── CROSSOVER & MUTATION DEMO ─────────────────────────────
    let parentA = [5, 4];           // good solution
    let parentB = [4, 5];           // another feasible but different solution
    let crossoverResult = null;

    function crossoverReset() {
      parentA = [5, 4];
      parentB = [4, 5];
      crossoverResult = null;
      crossoverDraw();
    }

    function crossoverDraw() {
      const canvas = document.getElementById('crossoverCanvas');
      const ctx = canvas.getContext('2d');
      drawBase(ctx, canvas, true);

      // Parent A
      const pa = toC(parentA[0], parentA[1], canvas);
      drawDot(ctx, pa.x, pa.y, 9, '#4cc9a8', ' Parent A (5,4)');

      // Parent B
      const pb = toC(parentB[0], parentB[1], canvas);
      drawDot(ctx, pb.x, pb.y, 9, '#e8a94a', ' Parent B (4,5)');

      // Agreement highlights
      const agreeX = parentA[0] === parentB[0];
      const agreeY = parentA[1] === parentB[1];

      ctx.strokeStyle = '#a8e6cf';
      ctx.lineWidth = 2.5;
      if (agreeX) {
        const p = toC(parentA[0], 0, canvas);
        ctx.beginPath(); ctx.moveTo(p.x, 40); ctx.lineTo(p.x, canvas.height - 50); ctx.stroke();
      }
      if (agreeY) {
        const p = toC(0, parentA[1], canvas);
        ctx.beginPath(); ctx.moveTo(40, p.y); ctx.lineTo(canvas.width - 40, p.y); ctx.stroke();
      }

      // Result if available
      if (crossoverResult) {
        const pr = toC(crossoverResult[0], crossoverResult[1], canvas);
        drawStar(ctx, pr.x, pr.y, 11, '#b48acd', ' Child');
      }

      let info = `Parent A: (${parentA[0]},${parentA[1]}) obj=${11 * parentA[0] + 6 * parentA[1]}<br>`;
      info += `Parent B: (${parentB[0]},${parentB[1]}) obj=${11 * parentB[0] + 6 * parentB[1]}<br>`;
      info += `Agreement: x₁ ${agreeX ? '✓' : '✗'}, x₂ ${agreeY ? '✓' : '✗'}<br>`;

      if (crossoverResult) {
        const obj = 11 * crossoverResult[0] + 6 * crossoverResult[1];
        info += `<span class="good">Crossover produced (${crossoverResult[0]},${crossoverResult[1]}) — obj ${obj}</span>`;
      }

      document.getElementById('crossoverTrace').innerHTML = info;
    }

    function runCrossover() {
      // Simulate crossover: fix agreeing variables, solve small subproblem → tends to (5,4)
      const agreeX = parentA[0] === parentB[0];
      const agreeY = parentA[1] === parentB[1];

      if (agreeX && agreeY) {
        crossoverResult = [...parentA];
      } else if (agreeX) {
        crossoverResult = [parentA[0], 4];   // guided toward good region
      } else if (agreeY) {
        crossoverResult = [5, parentA[1]];
      } else {
        crossoverResult = [5, 4];            // best compromise
      }

      // Ensure feasibility
      while (!checkFeasible(crossoverResult[0], crossoverResult[1]) && crossoverResult[0] > 0) {
        crossoverResult[0]--;
      }
      crossoverDraw();
    }

    function runMutation() {
      // Mutate Parent A lightly
      let mutated = [...parentA];
      const varToChange = Math.random() < 0.5 ? 0 : 1;
      mutated[varToChange] += (Math.random() < 0.5 ? -1 : 1);

      // Repair toward feasible region
      if (!checkFeasible(mutated[0], mutated[1])) {
        mutated[0] = Math.max(0, Math.min(5, mutated[0]));
        mutated[1] = Math.max(0, Math.min(4, mutated[1]));
      }
      parentA = mutated;   // replace parent A with mutated version
      crossoverResult = null;
      crossoverDraw();
    }

    function initCrossover() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', crossoverReset);
      } else {
        crossoverReset();
      }
    }

    initCrossover();
