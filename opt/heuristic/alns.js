
// Adaptive Large Neighborhood Search demo
// Standalone pedagogical simulator.

(function () {
  const ALNS = {
    incumbent: [1, 0, 1, 1, 0, 0, 1, 0],
    best: [1, 0, 1, 1, 0, 0, 1, 0],
    current: [1, 0, 1, 1, 0, 0, 1, 0],
    rate: 0.30,
    eta: 0.25,
    iter: 0,
    autoTimer: null,
    fractionalRef: [0.92, 0.31, 0.61, 0.48, 0.12, 0.76, 0.55, 0.08],
    destroyOps: [
      { name: "random", weight: 1.0, uses: 0, successes: 0 },
      { name: "block", weight: 1.0, uses: 0, successes: 0 },
      { name: "fractional", weight: 1.0, uses: 0, successes: 0 },
      { name: "worst", weight: 1.0, uses: 0, successes: 0 },
    ],
    repairOps: [
      { name: "greedy", weight: 1.0, uses: 0, successes: 0 },
      { name: "balanced", weight: 1.0, uses: 0, successes: 0 },
      { name: "objective", weight: 1.0, uses: 0, successes: 0 },
    ],
  };

  function q(id) {
    return document.getElementById(id);
  }

  function status(html) {
    const el = q("alnsStatus");
    if (el) el.innerHTML = html;
  }

  function trace(lines) {
    const el = q("alnsTrace");
    if (el) el.innerHTML = lines.join("<br>");
  }

  function appendTrace(line) {
    const el = q("alnsTrace");
    if (!el) return;
    el.innerHTML += (el.innerHTML ? "<br>" : "") + line;
  }

  function fmt(n) {
    return Number(n).toFixed(2);
  }

  function bitsToPair(bits) {
    const x1 = bits[0] * 1 + bits[1] * 2 + bits[2] * 1 + bits[3] * 1;
    const x2 = bits[4] * 1 + bits[5] * 2 + bits[6] * 1 + bits[7] * 1;
    return [Math.max(0, Math.min(7, x1)), Math.max(0, Math.min(7, x2))];
  }

  function pairObj(pair) {
    return 11 * pair[0] + 6 * pair[1];
  }

  function pairFeasible(pair) {
    return 2 * pair[0] + pair[1] <= 14 && pair[0] + 2 * pair[1] <= 14 && pair[0] >= 0 && pair[1] >= 0;
  }

  function score(bits) {
    const p = bitsToPair(bits);
    return { pair: p, obj: pairObj(p), feas: pairFeasible(p) };
  }

  function destroyCount() {
    return Math.max(1, Math.min(ALNS.current.length - 1, Math.round(ALNS.rate * ALNS.current.length)));
  }

  function weightedPick(ops) {
    const total = ops.reduce((s, o) => s + o.weight, 0);
    let u = Math.random() * total;
    for (const op of ops) {
      u -= op.weight;
      if (u <= 0) return op;
    }
    return ops[ops.length - 1];
  }

  function chooseDestroyFreeSet(name) {
    const n = ALNS.current.length;
    const k = destroyCount();

    if (name === "random") {
      const idx = Array.from({ length: n }, (_, i) => i);
      for (let i = idx.length - 1; i > 0; --i) {
        const j = Math.floor(Math.random() * (i + 1));
        [idx[i], idx[j]] = [idx[j], idx[i]];
      }
      return idx.slice(0, k).sort((a, b) => a - b);
    }

    if (name === "block") {
      const start = Math.floor(Math.random() * n);
      return Array.from({ length: k }, (_, d) => (start + d) % n).sort((a, b) => a - b);
    }

    if (name === "fractional") {
      const scored = ALNS.fractionalRef.map((v, i) => ({ i, s: Math.abs(v - 0.5) }));
      scored.sort((a, b) => a.s - b.s);
      return scored.slice(0, k).map(x => x.i).sort((a, b) => a - b);
    }

    // "worst": free bits whose current contribution seems weakest
    const badness = ALNS.current.map((b, i) => {
      const coeff = i < 4 ? 11 : 6;
      return { i, s: b === 0 ? coeff + 0.2 * Math.random() : 0.2 * Math.random() };
    });
    badness.sort((a, b) => b.s - a.s);
    return badness.slice(0, k).map(x => x.i).sort((a, b) => a - b);
  }

  function enumerateRepair(baseBits, freeSet, repairName) {
    const free = Array.from(freeSet);
    const total = 1 << free.length;
    const inc = score(ALNS.incumbent);

    let bestBits = baseBits.slice();
    let bestScore = -Infinity;
    let meta = null;

    for (let mask = 0; mask < total; ++mask) {
      const cand = baseBits.slice();
      for (let t = 0; t < free.length; ++t) {
        cand[free[t]] = (mask >> t) & 1;
      }

      const s = score(cand);
      let localScore = 0;

      if (repairName === "greedy") {
        localScore = (s.feas ? 1000 : 0) + s.obj;
      } else if (repairName === "balanced") {
        const hd = hamming(ALNS.incumbent, cand);
        localScore = (s.feas ? 1000 : 0) + s.obj - 2.0 * hd;
      } else {
        // objective-biased
        localScore = (s.feas ? 800 : 0) + 1.15 * s.obj;
      }

      if (localScore > bestScore) {
        bestScore = localScore;
        bestBits = cand;
        meta = {
          pair: s.pair,
          obj: s.obj,
          feas: s.feas,
          enumerated: total,
          hamming: hamming(ALNS.incumbent, cand),
          improved: s.feas && s.obj > inc.obj,
          globalBest: s.feas && s.obj > score(ALNS.best).obj,
        };
      }
    }

    return { bits: bestBits, meta };
  }

  function hamming(a, b) {
    let d = 0;
    for (let i = 0; i < a.length; ++i) if (a[i] !== b[i]) d++;
    return d;
  }

  function rewardFromOutcome(meta) {
    if (meta.globalBest) return 8.0;
    if (meta.improved) return 5.0;
    if (meta.feas) return 2.0;
    return 0.5;
  }

  function updateWeight(op, reward) {
    op.weight = (1 - ALNS.eta) * op.weight + ALNS.eta * reward;
    op.weight = Math.max(0.15, op.weight);
  }

  function accept(meta) {
    // Improving-only for pedagogical clarity.
    return meta.feas && meta.obj >= score(ALNS.incumbent).obj;
  }

  function bitColor(isBest, isChanged) {
    if (isBest) return "#1f7a4f";
    if (isChanged) return "#8f5f2a";
    return "rgba(40,40,40,0.92)";
  }

  function drawBitRow(ctx, bits, y, label, referenceBits, accent) {
    const left = 40;
    const boxW = 62;
    const boxH = 42;
    const gap = 12;

    ctx.save();
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillStyle = "rgba(40,40,40,0.92)";
    ctx.fillText(label, left, y - 12);

    for (let i = 0; i < bits.length; ++i) {
      const x = left + i * (boxW + gap);
      const changed = referenceBits ? bits[i] !== referenceBits[i] : false;

      ctx.beginPath();
      ctx.roundRect(x, y, boxW, boxH, 12);
      ctx.fillStyle = changed ? "rgba(183,147,103,0.16)" : "rgba(120,120,120,0.07)";
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = changed ? "rgba(183,147,103,0.95)" : "rgba(170,170,170,0.55)";
      ctx.stroke();

      ctx.font = '700 18px "JetBrains Mono", monospace';
      ctx.fillStyle = accent ? accent(i, changed) : bitColor(false, changed);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(bits[i]), x + boxW / 2, y + boxH / 2 - 1);

      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = "rgba(80,80,80,0.74)";
      ctx.fillText(`x${i + 1}`, x + boxW / 2, y + boxH + 13);
    }
    ctx.restore();
  }

  function drawBarGroup(ctx, x, y, title, ops) {
    ctx.save();
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillStyle = "rgba(40,40,40,0.92)";
    ctx.fillText(title, x, y - 24);

    const maxW = 220;
    const barH = 16;
    const gap = 20;
    const maxWeight = Math.max(...ops.map(o => o.weight), 1.0);

    ops.forEach((op, idx) => {
      const yy = y + idx * (barH + gap);
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = "rgba(70,70,70,0.92)";
      ctx.textAlign = "left";
      ctx.fillText(op.name, x, yy + 12);

      ctx.beginPath();
      ctx.roundRect(x + 92, yy, maxW, barH, 8);
      ctx.fillStyle = "rgba(120,120,120,0.10)";
      ctx.fill();

      ctx.beginPath();
      ctx.roundRect(x + 92, yy, maxW * (op.weight / maxWeight), barH, 8);
      ctx.fillStyle = "rgba(33,77,107,0.80)";
      ctx.fill();

      ctx.fillStyle = "rgba(50,50,50,0.95)";
      ctx.fillText(`w=${fmt(op.weight)}  use=${op.uses}  hit=${op.successes}`, x + 320, yy + 12);
    });

    ctx.restore();
    return ops.length * (barH + gap) - gap;
  }

  function drawSummary(ctx, y) {
    const inc = score(ALNS.incumbent);
    const best = score(ALNS.best);

    ctx.save();
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillStyle = "rgba(45,45,45,0.95)";
    ctx.fillText(
      `incumbent = (${inc.pair[0]}, ${inc.pair[1]}) | obj = ${inc.obj} | feasible = ${inc.feas ? "yes" : "no"}`,
      40,
      y
    );
    ctx.fillText(
      `best      = (${best.pair[0]}, ${best.pair[1]}) | obj = ${best.obj} | feasible = ${best.feas ? "yes" : "no"} | iter = ${ALNS.iter}`,
      40,
      y + 18
    );
    ctx.restore();
  }

  function draw() {
    const canvas = q("alnsCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "rgba(255,253,248,0.98)");
    grad.addColorStop(1, "rgba(247,241,230,0.98)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBitRow(ctx, ALNS.incumbent, 42, "Current incumbent", ALNS.best);
    drawBitRow(ctx, ALNS.best, 120, "Best solution", ALNS.incumbent, (_, changed) => changed ? "#1f7a4f" : "rgba(40,40,40,0.92)");
    const destroyHeight = drawBarGroup(ctx, 40, 210, "Destroy operator weights", ALNS.destroyOps);
    const repairHeight = drawBarGroup(ctx, 40, 210 + destroyHeight + 40, "Repair operator weights", ALNS.repairOps);
    drawSummary(ctx, 210 + destroyHeight + 40 + repairHeight + 34);
  }

  function alnsUpdateEta(value) {
    ALNS.eta = Number(value) / 100;
    const el = q("alnsEtaVal");
    if (el) el.textContent = ALNS.eta.toFixed(2);
  }

  function alnsUpdateRate(value) {
    ALNS.rate = Number(value) / 100;
    const el = q("alnsRateVal");
    if (el) el.textContent = ALNS.rate.toFixed(2);
  }

  function alnsStep() {
    ALNS.iter += 1;

    const d = weightedPick(ALNS.destroyOps);
    const r = weightedPick(ALNS.repairOps);
    d.uses += 1;
    r.uses += 1;

    const freeSet = chooseDestroyFreeSet(d.name);
    const base = ALNS.incumbent.slice();
    const res = enumerateRepair(base, freeSet, r.name);
    const accepted = accept(res.meta);
    const reward = rewardFromOutcome(res.meta);

    updateWeight(d, reward);
    updateWeight(r, reward);

    if (accepted) {
      ALNS.incumbent = res.bits.slice();
      d.successes += 1;
      r.successes += 1;
    }

    if (res.meta.feas && res.meta.obj > score(ALNS.best).obj) {
      ALNS.best = res.bits.slice();
    }

    status(
      `Iteration <span class="highlight">${ALNS.iter}</span>: selected destroy operator ` +
      `<span class="highlight">${d.name}</span> and repair operator <span class="highlight">${r.name}</span>. ` +
      `Candidate objective = <span class="highlight">${res.meta.obj}</span>, ` +
      `feasible = <span class="highlight">${res.meta.feas ? "yes" : "no"}</span>, ` +
      `accepted = <span class="highlight">${accepted ? "yes" : "no"}</span>.`
    );

    const inc = score(ALNS.incumbent);
    const best = score(ALNS.best);

    trace([
      `iter       = ${ALNS.iter}`,
      `destroy    = ${d.name} | weight -> ${fmt(d.weight)}`,
      `repair     = ${r.name} | weight -> ${fmt(r.weight)}`,
      `free set   = {${freeSet.map(i => i + 1).join(", ")}}`,
      `candidate  = (${res.meta.pair[0]}, ${res.meta.pair[1]}) | obj = ${res.meta.obj} | feasible = ${res.meta.feas ? "yes" : "no"}`,
      `accepted   = ${accepted ? "yes" : "no"}`,
      `incumbent  = (${inc.pair[0]}, ${inc.pair[1]}) | obj = ${inc.obj}`,
      `best       = (${best.pair[0]}, ${best.pair[1]}) | obj = ${best.obj}`,
      `reward     = ${fmt(reward)}`
    ]);

    draw();
  }

  function alnsAuto() {
    if (ALNS.autoTimer) {
      clearInterval(ALNS.autoTimer);
      ALNS.autoTimer = null;
      return;
    }

    let steps = 0;
    ALNS.autoTimer = setInterval(() => {
      alnsStep();
      steps += 1;
      if (steps >= 8) {
        clearInterval(ALNS.autoTimer);
        ALNS.autoTimer = null;
      }
    }, 650);
  }

  function alnsReset() {
    if (ALNS.autoTimer) {
      clearInterval(ALNS.autoTimer);
      ALNS.autoTimer = null;
    }

    ALNS.incumbent = [1, 0, 1, 1, 0, 0, 1, 0];
    ALNS.best = [1, 0, 1, 1, 0, 0, 1, 0];
    ALNS.current = [1, 0, 1, 1, 0, 0, 1, 0];
    ALNS.iter = 0;

    ALNS.destroyOps.forEach(op => {
      op.weight = 1.0;
      op.uses = 0;
      op.successes = 0;
    });
    ALNS.repairOps.forEach(op => {
      op.weight = 1.0;
      op.uses = 0;
      op.successes = 0;
    });

    status(
      `ALNS starts from one incumbent and maintains adaptive weights for destroy and repair operators. ` +
      `Press <strong>Step</strong> to run one adaptive iteration, or <strong>Auto</strong> to simulate several.`
    );

    trace([
      `ready`,
      `incumbent = (${bitsToPair(ALNS.incumbent)[0]}, ${bitsToPair(ALNS.incumbent)[1]})`,
      `all operator weights initialized to 1.00`
    ]);

    draw();
  }

  window.alnsUpdateEta = alnsUpdateEta;
  window.alnsUpdateRate = alnsUpdateRate;
  window.alnsStep = alnsStep;
  window.alnsAuto = alnsAuto;
  window.alnsReset = alnsReset;

  function boot() {
    if (!q("alnsCanvas")) return;
    alnsUpdateEta(25);
    alnsUpdateRate(30);
    alnsReset();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();


