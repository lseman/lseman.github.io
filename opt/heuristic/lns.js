// lns.js
// Large Neighborhood Search (LNS) demo
// Depends on shared.js utilities such as drawAxes, drawMipRegion, drawLattice,
// drawPoint, objective, feasiblePt, and drawChip if available.

(function () {
  const LNS = {
    incumbent: [1, 0, 1, 1, 0, 0, 1, 0],
    current: [1, 0, 1, 1, 0, 0, 1, 0],
    fractionalRef: [0.92, 0.31, 0.61, 0.48, 0.12, 0.76, 0.55, 0.08],
    freeSet: [],
    rate: 0.30,
    repaired: false,
    step: 0,
  };

  function lnsCanvas() {
    return document.getElementById("lnsCanvas");
  }

  function lnsStatus() {
    return document.getElementById("lnsStatus");
  }

  function lnsTrace() {
    return document.getElementById("lnsTrace");
  }

  function lnsMode() {
    const el = document.getElementById("lnsMode");
    return el ? el.value : "random";
  }

  function setStatus(html) {
    const el = lnsStatus();
    if (el) el.innerHTML = html;
  }

  function appendTrace(line) {
    const el = lnsTrace();
    if (!el) return;
    const prefix = el.innerHTML ? "<br>" : "";
    el.innerHTML += `${prefix}${line}`;
  }

  function setTrace(lines) {
    const el = lnsTrace();
    if (el) el.innerHTML = lines.join("<br>");
  }

  function fmtBits(bits, freeSet) {
    const free = new Set(freeSet || []);
    return bits
      .map((b, i) => {
        const color = free.has(i) ? "var(--amber)" : "var(--text-dim)";
        const weight = free.has(i) ? "700" : "500";
        return `<span style="color:${color};font-weight:${weight}">${b}</span>`;
      })
      .join(" ");
  }

  function destroyCount() {
    return Math.max(1, Math.min(LNS.current.length - 1, Math.round(LNS.rate * LNS.current.length)));
  }

  function chooseRandomFreeSet(k, n) {
    const idx = Array.from({ length: n }, (_, i) => i);
    for (let i = idx.length - 1; i > 0; --i) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx.slice(0, k).sort((a, b) => a - b);
  }

  function chooseFractionalFreeSet(k) {
    const scores = LNS.fractionalRef.map((v, i) => ({
      i,
      s: Math.abs(v - 0.5), // smaller => more fractional / uncertain
    }));
    scores.sort((a, b) => a.s - b.s);
    return scores.slice(0, k).map(o => o.i).sort((a, b) => a - b);
  }

  function chooseBlockFreeSet(k, n) {
    const start = Math.max(0, Math.min(n - k, Math.floor(Math.random() * n)));
    return Array.from({ length: k }, (_, d) => (start + d) % n).sort((a, b) => a - b);
  }

  function chooseFreeSet() {
    const n = LNS.current.length;
    const k = destroyCount();
    const mode = lnsMode();
    if (mode === "fractional") return chooseFractionalFreeSet(k);
    if (mode === "block") return chooseBlockFreeSet(k, n);
    return chooseRandomFreeSet(k);
  }

  function bitStringToPair(bits) {
    // Interpret first four bits as x1, last four as x2 using binary weights.
    const x1 = bits[0] * 1 + bits[1] * 2 + bits[2] * 1 + bits[3] * 1;
    const x2 = bits[4] * 1 + bits[5] * 2 + bits[6] * 1 + bits[7] * 1;
    // Clamp into visible world bounds used elsewhere in the page.
    return [Math.max(0, Math.min(7, x1)), Math.max(0, Math.min(7, x2))];
  }

  function pairObj(pair) {
    return 11 * pair[0] + 6 * pair[1];
  }

  function pairFeasible(pair) {
    return 2 * pair[0] + pair[1] <= 14 && pair[0] + 2 * pair[1] <= 14 && pair[0] >= 0 && pair[1] >= 0;
  }

  function bestRepair(bits, freeSet) {
    const free = Array.from(freeSet);
    const incumbentPair = bitStringToPair(bits);
    const incumbentObj = pairObj(incumbentPair);

    let bestBits = bits.slice();
    let bestScore = -Infinity;
    let bestMeta = {
      pair: incumbentPair,
      feasible: pairFeasible(incumbentPair),
      obj: incumbentObj,
      improved: false,
      enumerated: 0,
    };

    const total = 1 << free.length;
    for (let mask = 0; mask < total; ++mask) {
      const cand = bits.slice();
      for (let t = 0; t < free.length; ++t) {
        cand[free[t]] = (mask >> t) & 1;
      }
      const pair = bitStringToPair(cand);
      const feas = pairFeasible(pair);
      const obj = pairObj(pair);

      // Strong preference for feasible points, then better objective.
      const score = (feas ? 1000 : 0) + obj;
      if (score > bestScore) {
        bestScore = score;
        bestBits = cand;
        bestMeta = {
          pair,
          feasible: feas,
          obj,
          improved: feas && obj > incumbentObj,
          enumerated: total,
        };
      }
    }

    return { bits: bestBits, meta: bestMeta };
  }

  function drawBitRow(ctx, bits, y, label, freeSet) {
    const c = lnsCanvas();
    const left = 40;
    const boxW = 62;
    const boxH = 44;
    const gap = 12;
    const free = new Set(freeSet || []);

    ctx.save();
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillStyle = "rgba(40,40,40,0.9)";
    ctx.fillText(label, left, y - 12);

    for (let i = 0; i < bits.length; ++i) {
      const x = left + i * (boxW + gap);
      const isFree = free.has(i);

      ctx.beginPath();
      ctx.roundRect(x, y, boxW, boxH, 12);
      ctx.fillStyle = isFree ? "rgba(183,147,103,0.18)" : "rgba(120,120,120,0.08)";
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = isFree ? "rgba(183,147,103,0.95)" : "rgba(160,160,160,0.65)";
      ctx.stroke();

      ctx.font = '700 18px "JetBrains Mono", monospace';
      ctx.fillStyle = isFree ? "#8f5f2a" : "rgba(50,50,50,0.95)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(bits[i]), x + boxW / 2, y + boxH / 2 - 2);

      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = "rgba(80,80,80,0.75)";
      ctx.fillText(`x${i + 1}`, x + boxW / 2, y + boxH + 14);
    }
    ctx.restore();
  }

  function drawSummary(ctx) {
    const incPair = bitStringToPair(LNS.incumbent);
    const curPair = bitStringToPair(LNS.current);

    ctx.save();
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillStyle = "rgba(50,50,50,0.92)";
    const y = 232;

    ctx.fillText(
      `incumbent pair = (${incPair[0]}, ${incPair[1]}) | obj = ${pairObj(incPair)} | feasible = ${pairFeasible(incPair) ? "yes" : "no"}`,
      40,
      y,
    );
    ctx.fillText(
      `current pair   = (${curPair[0]}, ${curPair[1]}) | obj = ${pairObj(curPair)} | feasible = ${pairFeasible(curPair) ? "yes" : "no"}`,
      40,
      y + 20,
    );
    ctx.restore();
  }

  function lnsDraw() {
    const canvas = lnsCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background.
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "rgba(255,253,248,0.98)");
    grad.addColorStop(1, "rgba(247,241,230,0.98)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBitRow(ctx, LNS.incumbent, 42, "Incumbent", []);
    drawBitRow(ctx, LNS.current, 126, LNS.repaired ? "Repaired candidate" : "Current neighborhood", LNS.freeSet);
    drawSummary(ctx);
  }

  function lnsUpdateRate(value) {
    LNS.rate = Number(value) / 100;
    const el = document.getElementById("lnsRateVal");
    if (el) el.textContent = LNS.rate.toFixed(2);
  }

  function lnsDestroy() {
    LNS.freeSet = chooseFreeSet();
    LNS.current = LNS.incumbent.slice();
    LNS.repaired = false;
    LNS.step += 1;

    const modeName =
      lnsMode() === "fractional"
        ? "fractional-guided"
        : lnsMode() === "block"
        ? "block"
        : "random";

    setStatus(
      `Neighborhood built by <span class="highlight">${modeName}</span> destroy. ` +
        `<span class="highlight">${LNS.freeSet.length}</span> variables were released into the sub-MIP. ` +
        `Press <strong>Repair</strong> to solve the restricted neighborhood.`,
    );

    setTrace([
      `step ${LNS.step}: destroy`,
      `mode       = ${modeName}`,
      `free set   = {${LNS.freeSet.map(i => i + 1).join(", ")}}`,
      `incumbent  = ${fmtBits(LNS.incumbent, [])}`,
      `candidate  = ${fmtBits(LNS.current, LNS.freeSet)}`,
    ]);

    lnsDraw();
  }

  function lnsRepair() {
    if (!LNS.freeSet.length) {
      setStatus(
        `No neighborhood is active yet. Press <strong>Destroy</strong> first to free a subset of variables.`,
      );
      return;
    }

    const res = bestRepair(LNS.current, LNS.freeSet);
    LNS.current = res.bits.slice();
    LNS.repaired = true;

    const incPair = bitStringToPair(LNS.incumbent);
    const incumbentObj = pairObj(incPair);

    const verdict = res.meta.feasible
      ? res.meta.improved
        ? `<span class="good">improved feasible candidate found</span>`
        : `<span class="info">feasible candidate found</span>`
      : `<span class="bad">best candidate in neighborhood is still infeasible</span>`;

    setStatus(
      `Repair solved the restricted neighborhood over <span class="highlight">${LNS.freeSet.length}</span> free variables. ` +
        `${verdict}. Current pair = <span class="highlight">(${res.meta.pair[0]}, ${res.meta.pair[1]})</span>, ` +
        `objective = <span class="highlight">${res.meta.obj}</span>.`,
    );

    const lines = [
      `step ${LNS.step}: repair`,
      `free set    = {${LNS.freeSet.map(i => i + 1).join(", ")}}`,
      `enumerated  = ${res.meta.enumerated} local assignments`,
      `incumbent   = ${fmtBits(LNS.incumbent, [])}  | obj = ${incumbentObj}`,
      `best local  = ${fmtBits(LNS.current, LNS.freeSet)}  | obj = ${res.meta.obj}`,
      `pair        = (${res.meta.pair[0]}, ${res.meta.pair[1]})`,
      `feasible    = ${res.meta.feasible ? "yes" : "no"}`,
      `improvement = ${res.meta.improved ? "yes" : "no"}`,
    ];
    setTrace(lines);

    lnsDraw();
  }

  function lnsReset() {
    LNS.current = LNS.incumbent.slice();
    LNS.freeSet = [];
    LNS.repaired = false;
    LNS.step = 0;
    setStatus(
      `Incumbent solution shown as a bit string. <span style="color:var(--gold)">Gold</span> variables are freed ` +
        `into the neighborhood. <span style="color:var(--muted)">Grey</span> variables remain fixed.<br>` +
        `Choose a destroy strategy and a destroy rate, then press <strong>Destroy</strong> or <strong>Repair</strong>.`,
    );
    setTrace([
      `ready`,
      `incumbent = ${fmtBits(LNS.incumbent, [])}`,
      `pair      = (${bitStringToPair(LNS.incumbent)[0]}, ${bitStringToPair(LNS.incumbent)[1]})`,
    ]);
    lnsDraw();
  }

  // Export globally for inline onclick handlers.
  window.lnsUpdateRate = lnsUpdateRate;
  window.lnsDestroy = lnsDestroy;
  window.lnsRepair = lnsRepair;
  window.lnsReset = lnsReset;

  function bootLNS() {
    if (!lnsCanvas()) return;
    lnsUpdateRate(30);
    lnsReset();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootLNS);
  } else {
    bootLNS();
  }
})();
