/* --------------------------------------------------------------------------
   CubeSat Assembly / Disassembly Animation
   Ported from Spacelab (UFSC) — spacelab.ufsc.br hero drawing.
   Markup is drawn in the exploded state; t = 1 shows the exploded technical
   drawing and t = 0 collapses every layer into the assembled CubeSat.
   -------------------------------------------------------------------------- */

(() => {
  const svg = document.getElementById("cubesat-svg");
  if (!svg) return;

  const S = 0.5;
  const CX = 470;
  const layers = [];
  const shade = (hex, f) => {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.round(((n >> 16) & 255) * f);
    const g = Math.round(((n >> 8) & 255) * f);
    const b = Math.round((n & 255) * f);
    return `rgb(${r},${g},${b})`;
  };
  const isoBoard = (cx, cy, w, t, col, extra = "") => {
    const h = w * S;
    return `
      <polygon points="${cx - w},${cy} ${cx},${cy + h} ${cx},${cy + h + t} ${cx - w},${cy + t}" fill="${shade(col, 0.62)}"/>
      <polygon points="${cx + w},${cy} ${cx},${cy + h} ${cx},${cy + h + t} ${cx + w},${cy + t}" fill="${shade(col, 0.8)}"/>
      <polygon points="${cx},${cy - h} ${cx + w},${cy} ${cx},${cy + h} ${cx - w},${cy}" fill="${col}" stroke="${shade(col, 0.5)}" stroke-width="1.5"/>
      ${extra}`;
  };
  const chip = (cx, cy, w, h, col) => {
    const d = w * S;
    return `
      <polygon points="${cx - w},${cy - h} ${cx},${cy - h + d} ${cx},${cy + d} ${cx - w},${cy}" fill="${shade(col, 0.6)}"/>
      <polygon points="${cx + w},${cy - h} ${cx},${cy - h + d} ${cx},${cy + d} ${cx + w},${cy}" fill="${shade(col, 0.78)}"/>
      <polygon points="${cx},${cy - h - d} ${cx + w},${cy - h} ${cx},${cy - h + d} ${cx - w},${cy - h}" fill="${col}"/>`;
  };
  const cyl = (cx, cy, r, h, col) => `
    <rect x="${cx - r}" y="${cy - h}" width="${r * 2}" height="${h}" fill="${shade(col, 0.75)}"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * S}" fill="${shade(col, 0.6)}"/>
    <ellipse cx="${cx}" cy="${cy - h}" rx="${r}" ry="${r * S}" fill="${col}"/>`;
  const oring = (cx, cy) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="7" ry="3.4" fill="#15181f"/>`;
  const screw = (cx, cy, col) => cyl(cx, cy, 5, 16, col);
  const cellsTop = (cx, cy, w) => {
    const h = w * S;
    const k = 0.78;
    return `
      <polygon points="${cx},${cy - h * k + 3} ${cx + w * k},${cy + 3} ${cx},${cy + h * k + 3} ${cx - w * k},${cy + 3}" fill="#111420" stroke="#2a3a66" stroke-width="1"/>
      <line x1="${cx - w * k}" y1="${cy + 3}" x2="${cx + w * k}" y2="${cy + 3}" stroke="#2a3a66" stroke-width="1.5"/>
      <line x1="${cx - w * k * 0.5}" y1="${cy - h * k * 0.5 + 3}" x2="${cx + w * k * 0.5}" y2="${cy + h * k * 0.5 + 3}" stroke="#2a3a66"/>`;
  };
  const sidePanel = (x, y, w, h, dir, col, withCells = true) => {
    const yAt = (u) => y + (dir < 0 ? u * S : (w - u) * S);
    const p = `${x},${yAt(0)} ${x + w},${yAt(w)} ${x + w},${yAt(w) + h} ${x},${yAt(0) + h}`;
    let cells = "";
    if (withCells) {
      const m = 12;
      const mv = 12;
      const u1 = x + m;
      const u2 = x + w - m;
      const t1 = yAt(m) + mv;
      const t2 = yAt(w - m) + mv;
      const b1 = yAt(m) + h - mv;
      const b2 = yAt(w - m) + h - mv;
      cells = `<polygon points="${u1},${t1} ${u2},${t2} ${u2},${b2} ${u1},${b1}" fill="#101320" stroke="#2a3a66"/>
        <line x1="${u1}" y1="${(t1 + b1) / 2}" x2="${u2}" y2="${(t2 + b2) / 2}" stroke="#2a3a66" stroke-width="2"/>
        <line x1="${u1}" y1="${(t1 * 3 + b1) / 4}" x2="${u2}" y2="${(t2 * 3 + b2) / 4}" stroke="#1d2a4d" stroke-width="1"/>
        <line x1="${u1}" y1="${(t1 + b1 * 3) / 4}" x2="${u2}" y2="${(t2 + b2 * 3) / 4}" stroke="#1d2a4d" stroke-width="1"/>`;
    }
    return `<polygon points="${p}" fill="${col}" stroke="${shade(col, 0.55)}" stroke-width="1.5"/>${cells}`;
  };
  const standoffs = (cx, cy, col) =>
    cyl(cx - 108, cy - 4, 6, 26, col) +
    cyl(cx + 108, cy - 4, 6, 26, col) +
    oring(cx - 108, cy + 30) +
    oring(cx + 108, cy + 30);
  const addLayer = (markup, exploded, collapsed, idx) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.innerHTML = markup;
    svg.appendChild(g);
    layers.push({
      el: g,
      dx: collapsed.x - exploded.x,
      dy: collapsed.y - exploded.y,
      idx,
      loose: [...g.querySelectorAll(".loose")],
    });
    return g;
  };

  (() => {
    const cy = 180;
    const w = 170;
    const ant = (
      x2,
      y2,
      ox,
      oy,
    ) => `<g class="ant" data-ox="${ox}" data-oy="${oy}">
      <line x1="${ox}" y1="${oy}" x2="${x2}" y2="${y2}" stroke="#8a8f2e" stroke-width="4" stroke-linecap="round"/>
      <line x1="${ox}" y1="${oy}" x2="${x2}" y2="${y2}" stroke="#d6dd5a" stroke-width="2" stroke-linecap="round"/></g>`;
    const g = addLayer(
      `
      ${ant(CX - 430, cy - 130, CX - w + 30, cy - 14)}
      ${ant(CX + 430, cy - 130, CX + w - 30, cy - 14)}
      ${ant(CX - 430, cy + 215, CX - w + 30, cy + 16)}
      ${ant(CX + 430, cy + 215, CX + w - 30, cy + 16)}
      ${isoBoard(CX, cy, w, 14, "#2E4172", cellsTop(CX, cy, w))}
    `,
      { x: 0, y: cy },
      { x: 0, y: 400 },
      0,
    );
    layers[layers.length - 1].ants = [...g.querySelectorAll(".ant")];
  })();

  addLayer(
    sidePanel(70, 250, 165, 255, -1, "#2E4172") +
      `<g class="loose">${screw(44, 240, "#8a8f2e")}${screw(258, 618, "#8a8f2e")}</g>`,
    { x: 0, y: 0 },
    { x: 235, y: 150 },
    1,
  );
  addLayer(
    sidePanel(700, 250, 165, 255, 1, "#2E4172") +
      `<g class="loose">${screw(892, 240, "#8a8f2e")}${screw(676, 618, "#8a8f2e")}</g>`,
    { x: 0, y: 0 },
    { x: -230, y: 150 },
    1,
  );

  (() => {
    const cy = 400;
    const w = 165;
    const H = 255;
    const sil = "#B9C0CB";
    const rail = (x, y) =>
      `<rect x="${x - 7}" y="${y}" width="14" height="${H}" rx="3" fill="${sil}" stroke="${shade(sil, 0.6)}"/>`;
    const dia = (y) =>
      `<polygon points="${CX},${y - w * S} ${CX + w},${y} ${CX},${y + w * S} ${CX - w},${y}" fill="none" stroke="${sil}" stroke-width="9" stroke-linejoin="round"/>`;
    const rod = (y, c) =>
      `<line x1="${CX - w + 26}" y1="${y}" x2="${CX - 16}" y2="${y + (w - 42) * S}" stroke="${c}" stroke-width="9" stroke-linecap="round"/>`;
    addLayer(
      `
      ${rail(CX, cy - w * S)} ${dia(cy)}
      ${rail(CX - w, cy)} ${rail(CX + w, cy)}
      ${rod(cy + 92, "#6FBF73")}
      <line x1="${CX + 18}" y1="${cy + 150}" x2="${CX + w - 26}" y2="${cy + 150 - (w - 44) * S}" stroke="#6FBF73" stroke-width="9" stroke-linecap="round"/>
      ${rail(CX, cy + w * S)} ${dia(cy + H)}
      ${cyl(CX - w, cy + H + 16, 5, 12, "#B565C9")} ${cyl(CX + w, cy + H + 16, 5, 12, "#B565C9")}
    `,
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      0,
    );
  })();

  addLayer(
    sidePanel(150, 435, 145, 175, -1, "#26365f") +
      `<g class="loose">${cyl(126, 462, 5, 20, "#B565C9")}</g>`,
    { x: 0, y: 0 },
    { x: 170, y: 35 },
    2,
  );
  addLayer(
    sidePanel(645, 435, 145, 175, 1, "#26365f") +
      `<g class="loose">${screw(814, 462, "#8a8f2e")}</g>`,
    { x: 0, y: 0 },
    { x: -170, y: 35 },
    2,
  );

  const W = 148;
  const TH = 9;
  [
    [
      740,
      452,
      "#57A773",
      (c) =>
        chip(CX - 8, c - 10, 42, 20, "#9AA1AC") +
        chip(CX + 58, c + 18, 30, 14, "#9AA1AC") +
        chip(CX - 70, c + 8, 18, 10, "#15181f") +
        standoffs(CX, c - 46, "#6FBF73"),
      11,
    ],
    [
      842,
      478,
      "#C64545",
      (c) =>
        chip(CX + 76, c + 34, 36, 14, "#D9B44A") +
        chip(CX - 20, c - 6, 34, 12, "#9AA1AC") +
        chip(CX - 78, c + 14, 14, 16, "#dfe6f5") +
        standoffs(CX, c - 44, "#5FB7C4"),
      10,
    ],
    [
      938,
      504,
      "#A89B3C",
      (c) =>
        chip(CX + 14, c + 4, 26, 12, "#15181f") +
        chip(CX - 58, c - 8, 16, 8, "#9AA1AC") +
        chip(CX + 76, c + 34, 36, 14, "#E8D44D") +
        standoffs(CX, c - 42, "#6FBF73"),
      9,
    ],
    [
      1046,
      530,
      "#3D6BB3",
      (c) =>
        chip(CX, c - 14, 56, 30, "#9AA1AC") +
        chip(CX - 64, c + 10, 20, 12, "#15181f") +
        chip(CX + 66, c + 16, 18, 10, "#B26B3F") +
        standoffs(CX, c - 48, "#6FBF73"),
      8,
    ],
    [
      1150,
      556,
      "#33589B",
      (c) =>
        cyl(CX - 30, c - 8, 13, 22, "#15181f") +
        chip(CX + 40, c + 2, 26, 16, "#B26B3F") +
        chip(CX - 78, c + 14, 14, 8, "#dfe6f5") +
        standoffs(CX, c - 44, "#8a6d3b"),
      7,
    ],
    [
      1252,
      582,
      "#57A773",
      (c) =>
        chip(CX + 30, c - 4, 20, 8, "#9AA1AC") +
        cyl(CX - 40, c + 6, 7, 14, "#dfe6f5"),
      6,
    ],
  ].forEach(([ey, ky, col, deco, idx]) =>
    addLayer(
      isoBoard(CX, ey, W, TH, col, deco(ey)),
      { x: 0, y: ey },
      { x: 0, y: ky },
      idx,
    ),
  );

  (() => {
    const ey = 1330;
    const ky = 612;
    const cell = (x, y, col) => `
      <rect x="${x}" y="${y}" width="88" height="24" rx="12" fill="${col}" stroke="${shade(col, 0.6)}" stroke-width="1.5"/>
      <ellipse cx="${x + 10}" cy="${y + 12}" rx="7" ry="11" fill="${shade(col, 0.75)}"/>
      <rect x="${x + 80}" y="${y + 7}" width="8" height="10" rx="2" fill="#9AA1AC"/>`;
    addLayer(
      `
      ${cyl(CX - 84, ey + 2, 6, 26, "#B565C9")} ${cyl(CX + 84, ey + 2, 6, 26, "#B565C9")}
      <rect x="${CX - 62}" y="${ey - 34}" width="124" height="58" rx="8" fill="#BFD8B0" stroke="${shade("#BFD8B0", 0.6)}" stroke-width="1.5"/>
      ${cell(CX - 46, ey - 28, "#C2559A")} ${cell(CX - 46, ey - 2, "#e6ebf5")}
    `,
      { x: 0, y: ey },
      { x: 0, y: ky },
      5,
    );
  })();

  (() => {
    const ey = 1424;
    const ky = 640;
    const w = W;
    const h = w * S;
    const wi = w * 0.62;
    const hi = wi * S;
    const col = "#7FD8D8";
    addLayer(
      `<path fill-rule="evenodd" fill="${col}" stroke="${shade(col, 0.55)}" stroke-width="1.5"
      d="M ${CX} ${ey - h} L ${CX + w} ${ey} L ${CX} ${ey + h} L ${CX - w} ${ey} Z
      M ${CX} ${ey - hi} L ${CX + wi} ${ey} L ${CX} ${ey + hi} L ${CX - wi} ${ey} Z"/>`,
      { x: 0, y: ey },
      { x: 0, y: ky },
      4,
    );
  })();

  addLayer(
    isoBoard(
      CX,
      1520,
      165,
      14,
      "#2E4172",
      chip(CX + 70, 1546, 26, 10, "#dfe6f5"),
    ),
    { x: 0, y: 1520 },
    { x: 0, y: 668 },
    3,
  );

  [
    layers[14],
    layers[13],
    layers[12],
    layers[11],
    layers[10],
    layers[9],
    layers[8],
    layers[7],
    layers[6],
    layers[4],
    layers[5],
    layers[1],
    layers[2],
    layers[0],
  ]
    .filter(Boolean)
    .forEach((L) => svg.appendChild(L.el));
  layers[4].fade = true;
  layers[5].fade = true;

  const MAXIDX = 11;
  const STAG = 0.045;
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
  const easeOut = (x) => 1 - (1 - x) ** 3;
  const LOOP_MS = 7200;
  let loopStart = null;
  let current = 1;
  let target = 1;

  function loopTarget(now) {
    const p = ((now - loopStart) % LOOP_MS) / LOOP_MS;
    if (p < 0.16) return 1;
    if (p < 0.44) return 1 - easeOut((p - 0.16) / 0.28);
    if (p < 0.62) return 0;
    if (p < 0.9) return easeOut((p - 0.62) / 0.28);
    return 1;
  }

  // Cache antenna geometry once and set DOM attributes — antennas never move.
  for (const L of layers)
    if (L.ants)
      L.ants = L.ants.map((a) => {
        const lines = [...a.querySelectorAll("line")];
        return {
          lines,
          ox: +a.dataset.ox,
          oy: +a.dataset.oy,
          x2: +lines[0].getAttribute("x2"),
          y2: +lines[0].getAttribute("y2"),
        };
      });

  // Write antenna coordinates once (they never change — always fully extended).
  for (const L of layers) {
    if (!L.ants) continue;
    for (const { lines, x2, y2 } of L.ants) {
      for (const ln of lines) {
        ln.setAttribute("x2", x2);
        ln.setAttribute("y2", y2);
      }
    }
  }

  let rendered = NaN;

  // Cache last written values to skip sub-pixel DOM writes.
  const prevTransform = new WeakMap();
  const prevOpacity = new WeakMap();
  const prevAntenna = new Map();

  function render(t) {
    // Hold phases converge asymptotically; skip DOM writes once settled.
    if (Math.abs(t - rendered) < 1e-4) return;
    rendered = t;
    for (const L of layers) {
      const local = Math.min(
        1,
        Math.max(0, t * (1 + MAXIDX * STAG) - L.idx * STAG),
      );
      const e = ease(local);
      const k = 1 - e;

      // Transform — use style.transform (compositor-only) instead of SVG attribute
      // which triggers full layout recalculation. Skip if displacement < 0.1 px.
      const tx = +(L.dx * k).toFixed(2);
      const ty = +(L.dy * k).toFixed(2);
      const lastT = prevTransform.get(L.el);
      if (!lastT || Math.abs(lastT[0] - tx) > 0.1 || Math.abs(lastT[1] - ty) > 0.1) {
        L.el.style.transform = `translate(${tx}px, ${ty}px)`;
        prevTransform.set(L.el, [tx, ty]);
      }

      // Loose element opacity — use style.opacity (compositor-only).
      if (L.loose) {
        const op = +(Math.max(0, e * 1.4 - 0.4)).toFixed(2);
        L.loose.forEach((el) => {
          const lastO = prevOpacity.get(el);
          if (lastO === undefined || Math.abs(lastO - op) > 0.02) {
            el.style.opacity = op;
            prevOpacity.set(el, op);
          }
        });
      }

      // Fade opacity — use style.opacity (compositor-only).
      if (L.fade) {
        const op = +(Math.max(0, e * 1.6 - 0.6)).toFixed(2);
        const lastO = prevOpacity.get(L.el);
        if (lastO === undefined || Math.abs(lastO - op) > 0.02) {
          L.el.style.opacity = op;
          prevOpacity.set(L.el, op);
        }
      }

      // Antenna tips — always fully extended, never stow.
      // (DOM attributes written once during init above — no per-frame writes)
    }
  }

  let raf = 0;
  let lastNow = null;
  let pausedAt = null;

  function frame(now) {
    // Resume where we left off instead of jumping after a pause.
    if (pausedAt !== null) {
      if (loopStart !== null) loopStart += now - pausedAt;
      pausedAt = null;
      lastNow = now;
    }
    if (loopStart === null) loopStart = now;
    const dt = lastNow === null ? 16.67 : Math.min(now - lastNow, 100);
    lastNow = now;
    target = loopTarget(now);
    // Same feel as a 0.11 lerp at 60 Hz, but independent of refresh rate,
    // so 120/144 Hz displays and dropped frames move at the same speed.
    current += (target - current) * (1 - (1 - 0.11) ** (dt / 16.67));
    render(current);
    raf = requestAnimationFrame(frame);
  }

  let onScreen = true;
  const sync = () => {
    const run = onScreen && !document.hidden;
    if (run && !raf) {
      raf = requestAnimationFrame(frame);
    } else if (!run && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
      pausedAt = performance.now();
    }
  };
  if ("IntersectionObserver" in window)
    new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    }).observe(svg);
  document.addEventListener("visibilitychange", sync);

  // Always animate: the slow assembly loop is the point of this decoration,
  // so it intentionally ignores prefers-reduced-motion.
  render(current);
  sync();
})();
