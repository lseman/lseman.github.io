// ─── §9 TIMELINE DEMO ────────────────────────────
    const timePhases = [
      { phase: 'Root LP', heuristic: 'Rounding', result: '(4,4)', obj: 68, note: 'Feasible but suboptimal' },
      { phase: 'Root Node', heuristic: 'Diving', result: '(5,4)', obj: 79, note: 'Found a feasible incumbent via LP re-solves' },
      { phase: 'Root Node', heuristic: 'Feasibility Pump', result: '(5,4)', obj: 79, note: 'Confirmed the incumbent with repair iterations' },
      { phase: 'Root Node', heuristic: 'RENS', result: '(5,4)', obj: 79, note: 'Confirmed — no improvement' },
      { phase: 'Node 3', heuristic: 'Feasibility Jump', result: '(5,4)', obj: 79, note: 'Same best solution' },
      { phase: 'Node 7', heuristic: 'RINS', result: '(5,4)', obj: 79, note: 'LP agrees with incumbent — no change' },
      { phase: 'Node 12', heuristic: 'Local Branching', result: '(5,4)', obj: 79, note: 'Neighborhood searched — optimal' },
    ];
    let timeIdx = 0;
    let timeBestObj = 0;

    function timeReset() {
      timeIdx = 0; timeBestObj = 0;
      const canvas = document.getElementById('timeCanvas');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = C.muted; ctx.font = '13px Crimson Pro'; ctx.textAlign = 'center';
      ctx.fillText('Press "Advance B&B →" to simulate the heuristic timeline', canvas.width / 2, canvas.height / 2);
      ctx.textAlign = 'left';
      document.getElementById('timeStatus').innerHTML = 'Simulated B&amp;B tree exploration with heuristic calls. Press <strong>Advance B&amp;B →</strong> to start.';
    }

    function timeStep() {
      if (timeIdx >= timePhases.length) { timeReset(); return; }
      const ph = timePhases[timeIdx];
      const canvas = document.getElementById('timeCanvas');
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      const improved = ph.obj > timeBestObj;
      if (ph.obj > timeBestObj) timeBestObj = ph.obj;

      // Draw timeline bars
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      const rowH = 28, startY = 20, rowsToShow = timeIdx + 1;
      for (let i = 0; i < rowsToShow; i++) {
        const p = timePhases[i];
        const y = startY + i * rowH;
        const isLatest = i === timeIdx;

        // Phase label
        ctx.fillStyle = isLatest ? C.gold : C.muted; ctx.font = (isLatest ? 'bold ' : '') + '11px JetBrains Mono';
        ctx.fillText(p.phase, 10, y + 16);

        // Heuristic badge
        const hx = 100;
        ctx.fillStyle = isLatest ? 'rgba(76,201,168,0.2)' : 'rgba(255,255,255,0.05)';
        ctx.beginPath(); ctx.roundRect(hx, y + 2, 110, 22, 4); ctx.fill();
        ctx.fillStyle = isLatest ? C.teal : C.muted; ctx.font = '11px JetBrains Mono';
        ctx.fillText(p.heuristic, hx + 6, y + 17);

        // Arrow
        ctx.fillStyle = C.muted; ctx.font = '12px JetBrains Mono';
        ctx.fillText('→', 216, y + 16);

        // Solution
        ctx.fillStyle = isLatest ? C.text : C.muted; ctx.font = (isLatest ? 'bold ' : '') + '12px JetBrains Mono';
        ctx.fillText(`x=${p.result}`, 232, y + 16);

        // Obj
        const objX = 310;
        const isNew = i === 0 || p.obj > timePhases[i - 1].obj;
        ctx.fillStyle = isNew && isLatest ? C.green : C.muted; ctx.font = '12px JetBrains Mono';
        ctx.fillText(`z=${p.obj}${isNew && i > 0 ? ' ★' : ''}`, objX, y + 16);

        // Obj bar
        const bx = 370, bW = (W - bx - 10), bH = 14;
        ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(bx, y + 4, bW, bH);
        ctx.fillStyle = isLatest ? 'rgba(76,201,168,0.5)' : 'rgba(91,156,246,0.25)';
        ctx.fillRect(bx, y + 4, bW * p.obj / 90, bH);
      }

      document.getElementById('timeStatus').innerHTML =
        `<span class="highlight">${ph.phase}</span> → <span class="info">${ph.heuristic}</span><br>
Found solution x=${ph.result}, obj=${ph.obj}<br>
${ph.obj > 0 && timeIdx > 0 && ph.obj > timePhases[timeIdx - 1].obj ? '<span class="good">★ New incumbent!</span><br>' : ''}
${ph.note}`;

      timeIdx++;
    }

// ─── INITIALISE ALL ──────────────────────────────
    window.addEventListener('load', () => {
      drawExample();
      resetRounding();
      pumpReset();
      jumpDraw();
      fpDraw();
      rensDraw();
      rinsDraw();
      localDraw();
      lbDraw();
      timeReset();

      // Sidebar active link on scroll
      const sections = document.querySelectorAll('.section');
      const links = document.querySelectorAll('#sidebar a');
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            links.forEach(l => {
              l.classList.remove('active');
              if (l.getAttribute('href') === '#' + e.target.id) l.classList.add('active');
            });
          }
        });
      }, { rootMargin: '-20% 0px -70% 0px' });
      sections.forEach(s => obs.observe(s));

      const updateProgress = () => {
        const scrollTop = window.scrollY;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = scrollHeight > 0 ? Math.max(0, Math.min(100, scrollTop / scrollHeight * 100)) : 0;
        const progress = document.getElementById('progress');
        progress.style.width = pct + '%';
        progress.setAttribute('aria-valuenow', pct.toFixed(0));
      };

      updateProgress();
      window.addEventListener('scroll', updateProgress, { passive: true });
    });
