/* --------------------------------------------------------------------------
   CubeSat Assembly / Disassembly Animation — Canvas 2D version
   Ported from Spacelab (UFSC) — spacelab.ufsc.br hero drawing.
   Uses Canvas for far faster per-frame rendering vs SVG DOM manipulation.
   -------------------------------------------------------------------------- */

(() => {
  const canvas = document.getElementById("cubesat-canvas");
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  // Scale canvas for crisp rendering on high-DPI displays
  const baseW = 940, baseH = 1640;
  canvas.width = baseW * dpr;
  canvas.height = baseH * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);

  const S = 0.5; // isometric depth ratio
  const CX = 470; // center X

  /* ------------------------------------------------------------------ */
  /* Shade helper                                                       */
  /* ------------------------------------------------------------------ */
  const shade = (hex, f) => {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.round(((n >> 16) & 255) * f);
    const g = Math.round(((n >> 8) & 255) * f);
    const b = Math.round((n & 255) * f);
    return `rgb(${r},${g},${b})`;
  };

  /* ------------------------------------------------------------------ */
  /* Drawing primitives — all draw at ABSOLUTE coordinates              */
  /* Layer transform is applied OUTSIDE the draw function               */
  /* ------------------------------------------------------------------ */

  const drawIsoBoard = (cx, cy, w, t, col, drawExtra) => {
    const h = w * S;
    ctx.fillStyle = shade(col, 0.62);
    ctx.beginPath();
    ctx.moveTo(cx - w, cy); ctx.lineTo(cx, cy + h);
    ctx.lineTo(cx, cy + h + t); ctx.lineTo(cx - w, cy + t);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = shade(col, 0.8);
    ctx.beginPath();
    ctx.moveTo(cx + w, cy); ctx.lineTo(cx, cy + h);
    ctx.lineTo(cx, cy + h + t); ctx.lineTo(cx + w, cy + t);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = col;
    ctx.strokeStyle = shade(col, 0.5);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - h); ctx.lineTo(cx + w, cy);
    ctx.lineTo(cx, cy + h); ctx.lineTo(cx - w, cy);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    if (drawExtra) drawExtra(cx, cy, w);
  };

  const drawChip = (cx, cy, w, h, col) => {
    const d = w * S;
    ctx.fillStyle = shade(col, 0.6);
    ctx.beginPath();
    ctx.moveTo(cx - w, cy - h); ctx.lineTo(cx, cy - h + d);
    ctx.lineTo(cx, cy + d); ctx.lineTo(cx - w, cy);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = shade(col, 0.78);
    ctx.beginPath();
    ctx.moveTo(cx + w, cy - h); ctx.lineTo(cx, cy - h + d);
    ctx.lineTo(cx, cy + d); ctx.lineTo(cx + w, cy);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(cx, cy - h - d); ctx.lineTo(cx + w, cy - h);
    ctx.lineTo(cx, cy - h + d); ctx.lineTo(cx - w, cy - h);
    ctx.closePath(); ctx.fill();
  };

  const drawCyl = (cx, cy, r, h, col) => {
    ctx.fillStyle = shade(col, 0.75);
    ctx.fillRect(cx - r, cy - h, r * 2, h);
    ctx.fillStyle = shade(col, 0.6);
    ctx.beginPath(); ctx.ellipse(cx, cy, r, r * S, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.ellipse(cx, cy - h, r, r * S, 0, 0, Math.PI * 2); ctx.fill();
  };

  const drawRing = (cx, cy) => {
    ctx.fillStyle = "#15181f";
    ctx.beginPath(); ctx.ellipse(cx, cy, 7, 3.4, 0, 0, Math.PI * 2); ctx.fill();
  };

  const drawScrew = (cx, cy, col) => drawCyl(cx, cy, 5, 16, col);

  const drawCellsTop = (cx, cy, w) => {
    const h = w * S;
    const k = 0.78;
    ctx.fillStyle = "#111420"; ctx.strokeStyle = "#2a3a66"; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy - h * k + 3); ctx.lineTo(cx + w * k, cy + 3);
    ctx.lineTo(cx, cy + h * k + 3); ctx.lineTo(cx - w * k, cy + 3);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    ctx.strokeStyle = "#2a3a66"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - w * k, cy + 3); ctx.lineTo(cx + w * k, cy + 3);
    ctx.stroke();

    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - w * k * 0.5, cy - h * k * 0.5 + 3);
    ctx.lineTo(cx + w * k * 0.5, cy + h * k * 0.5 + 3);
    ctx.stroke();
  };

  const drawSidePanel = (x, y, w, h, dir, col) => {
    const yAt = (u) => y + (dir < 0 ? u * S : (w - u) * S);
    ctx.fillStyle = col;
    ctx.strokeStyle = shade(col, 0.55);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, yAt(0)); ctx.lineTo(x + w, yAt(w));
    ctx.lineTo(x + w, yAt(w) + h); ctx.lineTo(x, yAt(0) + h);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    const m = 12, mv = 12;
    const u1 = x + m, u2 = x + w - m;
    const t1 = yAt(m) + mv, t2 = yAt(w - m) + mv;
    const b1 = yAt(m) + h - mv, b2 = yAt(w - m) + h - mv;

    ctx.fillStyle = "#101320"; ctx.strokeStyle = "#2a3a66"; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(u1, t1); ctx.lineTo(u2, t2);
    ctx.lineTo(u2, b2); ctx.lineTo(u1, b1);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    ctx.strokeStyle = "#2a3a66"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(u1, (t1 + b1) / 2); ctx.lineTo(u2, (t2 + b2) / 2);
    ctx.stroke();

    ctx.strokeStyle = "#1d2a4d"; ctx.lineWidth = 1;
    for (let frac of [0.25, 0.75]) {
      const ly1 = t1 * (1 - frac) + b1 * frac;
      const ly2 = t2 * (1 - frac) + b2 * frac;
      ctx.beginPath(); ctx.moveTo(u1, ly1); ctx.lineTo(u2, ly2); ctx.stroke();
    }
  };

  const drawStandoffs = (cx, cy, col) => {
    drawCyl(cx - 108, cy - 4, 6, 26, col);
    drawCyl(cx + 108, cy - 4, 6, 26, col);
    drawRing(cx - 108, cy + 30);
    drawRing(cx + 108, cy + 30);
  };

  const drawAnt = (x2, y2, ox, oy) => {
    ctx.strokeStyle = "#8a8f2e"; ctx.lineWidth = 4; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.strokeStyle = "#d6dd5a"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(x2, y2); ctx.stroke();
  };

  const drawRail = (x, y, H) => {
    ctx.fillStyle = "#B9C0CB";
    ctx.strokeStyle = shade("#B9C0CB", 0.6);
    ctx.lineWidth = 1;
    const rx = x - 7, ry = y, rw = 14, rh = H, rr = 3;
    ctx.beginPath();
    ctx.moveTo(rx + rr, ry); ctx.lineTo(rx + rw - rr, ry);
    ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rr);
    ctx.lineTo(rx + rw, ry + rh - rr);
    ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rr, ry + rh);
    ctx.lineTo(rx + rr, ry + rh);
    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rr);
    ctx.lineTo(rx, ry + rr);
    ctx.quadraticCurveTo(rx, ry, rx + rr, ry);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  };

  const drawDia = (y, w) => {
    ctx.strokeStyle = "#B9C0CB"; ctx.lineWidth = 9; ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(CX, y - w * S); ctx.lineTo(CX + w, y);
    ctx.lineTo(CX, y + w * S); ctx.lineTo(CX - w, y);
    ctx.closePath(); ctx.stroke();
  };

  const drawRod = (y, c) => {
    ctx.strokeStyle = c; ctx.lineWidth = 9; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(CX - 165 + 26, y);
    ctx.lineTo(CX - 16, y + (165 - 42) * S);
    ctx.stroke();
  };

  const drawCell = (x, y, col) => {
    ctx.fillStyle = col;
    ctx.strokeStyle = shade(col, 0.6); ctx.lineWidth = 1.5;
    const rx = x, ry = y, rw = 88, rh = 24, rr = 12;
    ctx.beginPath();
    ctx.moveTo(rx + rr, ry); ctx.lineTo(rx + rw - rr, ry);
    ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rr);
    ctx.lineTo(rx + rw, ry + rh - rr);
    ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rr, ry + rh);
    ctx.lineTo(rx + rr, ry + rh);
    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rr);
    ctx.lineTo(rx, ry + rr);
    ctx.quadraticCurveTo(rx, ry, rx + rr, ry);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    ctx.fillStyle = shade(col, 0.75);
    ctx.beginPath(); ctx.ellipse(x + 10, y + 12, 7, 11, 0, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#9AA1AC";
    ctx.fillRect(x + 80, y + 7, 8, 10);
  };

  /* ------------------------------------------------------------------ */
  /* Layer geometry data                                                */
  /* ------------------------------------------------------------------ */
  const layers = [];

  const addLayer = (drawFn, exploded, collapsed, idx) => {
    layers.push({
      drawFn,
      ex: exploded.x, ey: exploded.y,
      cx: collapsed.x, cy: collapsed.y,
      dx: collapsed.x - exploded.x,
      dy: collapsed.y - exploded.y,
      idx,
      fade: false,
    });
  };

  /* ------------------------------------------------------------------ */
  /* Build layers — all coords are ABSOLUTE, transform applied outside  */
  /* ------------------------------------------------------------------ */

  // Layer 0: Top plate with antennas + isoBoard
  addLayer(
    () => {
      const cy = 180;
      const w = 170;
      // Antennas stay fully extended and visible in both assembly states.
      drawAnt(CX - 430, cy - 130, CX - w + 30, cy - 14);
      drawAnt(CX + 430, cy - 130, CX + w - 30, cy - 14);
      drawAnt(CX - 430, cy + 215, CX - w + 30, cy + 16);
      drawAnt(CX + 430, cy + 215, CX + w - 30, cy + 16);
      drawIsoBoard(CX, cy, w, 14, "#2E4172", (bcx, bcy, bw) => {
        drawCellsTop(bcx, bcy, bw);
      });
    },
    { x: 0, y: 180 },
    { x: 0, y: 400 },
    0,
  );

  // Layer 1: Side panel left + screws
  addLayer(
    (e) => {
      drawSidePanel(70, 250, 165, 255, -1, "#2E4172");
      ctx.globalAlpha *= Math.max(0, e * 1.4 - 0.4);
      drawScrew(44, 240, "#8a8f2e");
      drawScrew(258, 618, "#8a8f2e");
    },
    { x: 0, y: 0 },
    { x: 235, y: 150 },
    1,
  );

  // Layer 2: Side panel right + screws
  addLayer(
    (e) => {
      drawSidePanel(700, 250, 165, 255, 1, "#2E4172");
      ctx.globalAlpha *= Math.max(0, e * 1.4 - 0.4);
      drawScrew(892, 240, "#8a8f2e");
      drawScrew(676, 618, "#8a8f2e");
    },
    { x: 0, y: 0 },
    { x: -230, y: 150 },
    1,
  );

  // Structural rails (idx 0 reused) — no displacement
  addLayer(
    () => {
      const cy = 400;
      const w = 165;
      const H = 255;
      drawRail(CX, cy - w * S, H);
      drawDia(cy, w);
      drawRail(CX - w, cy, H);
      drawRail(CX + w, cy, H);
      drawRod(cy + 92, "#6FBF73");
      ctx.strokeStyle = "#6FBF73"; ctx.lineWidth = 9; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(CX + 18, cy + 150);
      ctx.lineTo(CX + w - 26, cy + 150 - (w - 44) * S);
      ctx.stroke();
      drawRail(CX, cy + w * S, H);
      drawDia(cy + H, w);
      drawCyl(CX - w, cy + H + 16, 5, 12, "#B565C9");
      drawCyl(CX + w, cy + H + 16, 5, 12, "#B565C9");
    },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    0,
  );

  // Layer 3 (side panel left lower) + loose cyl
  addLayer(
    (e) => {
      drawSidePanel(150, 435, 145, 175, -1, "#26365f");
      ctx.globalAlpha *= Math.max(0, e * 1.4 - 0.4);
      drawCyl(126, 462, 5, 20, "#B565C9");
    },
    { x: 0, y: 0 },
    { x: 170, y: 35 },
    2,
  );

  // Layer 4 (side panel right lower) + loose screw
  addLayer(
    (e) => {
      drawSidePanel(645, 435, 145, 175, 1, "#26365f");
      ctx.globalAlpha *= Math.max(0, e * 1.4 - 0.4);
      drawScrew(814, 462, "#8a8f2e");
    },
    { x: 0, y: 0 },
    { x: -170, y: 35 },
    2,
  );

  // Layers 5-10: Battery/PCB boards (6 layers)
  const W = 148;
  const TH = 9;
  [
    [740, 452, "#57A773", (c) => {
      drawChip(CX - 8, c - 10, 42, 20, "#9AA1AC");
      drawChip(CX + 58, c + 18, 30, 14, "#9AA1AC");
      drawChip(CX - 70, c + 8, 18, 10, "#15181f");
      drawStandoffs(CX, c - 46, "#6FBF73");
    }, 11],
    [842, 478, "#C64545", (c) => {
      drawChip(CX + 76, c + 34, 36, 14, "#D9B44A");
      drawChip(CX - 20, c - 6, 34, 12, "#9AA1AC");
      drawChip(CX - 78, c + 14, 14, 16, "#dfe6f5");
      drawStandoffs(CX, c - 44, "#5FB7C4");
    }, 10],
    [938, 504, "#A89B3C", (c) => {
      drawChip(CX + 14, c + 4, 26, 12, "#15181f");
      drawChip(CX - 58, c - 8, 16, 8, "#9AA1AC");
      drawChip(CX + 76, c + 34, 36, 14, "#E8D44D");
      drawStandoffs(CX, c - 42, "#6FBF73");
    }, 9],
    [1046, 530, "#3D6BB3", (c) => {
      drawChip(CX, c - 14, 56, 30, "#9AA1AC");
      drawChip(CX - 64, c + 10, 20, 12, "#15181f");
      drawChip(CX + 66, c + 16, 18, 10, "#B26B3F");
      drawStandoffs(CX, c - 48, "#6FBF73");
    }, 8],
    [1150, 556, "#33589B", (c) => {
      drawCyl(CX - 30, c - 8, 13, 22, "#15181f");
      drawChip(CX + 40, c + 2, 26, 16, "#B26B3F");
      drawChip(CX - 78, c + 14, 14, 8, "#dfe6f5");
      drawStandoffs(CX, c - 44, "#8a6d3b");
    }, 7],
    [1252, 582, "#57A773", (c) => {
      drawChip(CX + 30, c - 4, 20, 8, "#9AA1AC");
      drawCyl(CX - 40, c + 6, 7, 14, "#dfe6f5");
    }, 6],
  ].forEach(([ey, ky, col, deco, idx]) => {
    addLayer(
      () => {
        drawIsoBoard(CX, ey, W, TH, col, () => deco(ey));
      },
      { x: 0, y: ey },
      { x: 0, y: ky },
      idx,
    );
  });

  // Battery module with cells + cylinders
  addLayer(
    () => {
      const ey = 1330;
      drawCyl(CX - 84, ey + 2, 6, 26, "#B565C9");
      drawCyl(CX + 84, ey + 2, 6, 26, "#B565C9");

      ctx.fillStyle = "#BFD8B0";
      ctx.strokeStyle = shade("#BFD8B0", 0.6);
      ctx.lineWidth = 1.5;
      const rx = CX - 62, ry = ey - 34, rw = 124, rh = 58, rr = 8;
      ctx.beginPath();
      ctx.moveTo(rx + rr, ry); ctx.lineTo(rx + rw - rr, ry);
      ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rr);
      ctx.lineTo(rx + rw, ry + rh - rr);
      ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rr, ry + rh);
      ctx.lineTo(rx + rr, ry + rh);
      ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rr);
      ctx.lineTo(rx, ry + rr);
      ctx.quadraticCurveTo(rx, ry, rx + rr, ry);
      ctx.closePath(); ctx.fill(); ctx.stroke();

      drawCell(CX - 46, ey - 28, "#C2559A");
      drawCell(CX - 46, ey - 2, "#e6ebf5");
    },
    { x: 0, y: 1330 },
    { x: 0, y: 612 },
    5,
  );

  // Solar panel (path with hole)
  addLayer(
    () => {
      const ey = 1424;
      const w = W;
      const h = w * S;
      const wi = w * 0.62;
      const hi = wi * S;
      const col = "#7FD8D8";
      ctx.save();
      ctx.fillStyle = col;
      ctx.strokeStyle = shade(col, 0.55);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(CX, ey - h); ctx.lineTo(CX + w, ey);
      ctx.lineTo(CX, ey + h); ctx.lineTo(CX - w, ey);
      ctx.closePath();
      ctx.moveTo(CX, ey - hi); ctx.lineTo(CX - wi, ey);
      ctx.lineTo(CX, ey + hi); ctx.lineTo(CX + wi, ey);
      ctx.closePath();
      ctx.fill("evenodd");
      ctx.stroke();
      ctx.restore();
    },
    { x: 0, y: 1424 },
    { x: 0, y: 640 },
    4,
  );

  // Bottom PCB board with chip
  addLayer(
    () => {
      drawIsoBoard(CX, 1520, 165, 14, "#2E4172", () => {
        drawChip(CX + 70, 1546, 26, 10, "#dfe6f5");
      });
    },
    { x: 0, y: 1520 },
    { x: 0, y: 668 },
    3,
  );

  /* ------------------------------------------------------------------ */
  /* Mark fade layers                                                   */
  /* ------------------------------------------------------------------ */
  // Match the reference's painter order: frame behind the stack, panels
  // and top plate in front. Array order is separate from animation timing.
  const drawOrder = [3, 14, 13, 12, 11, 10, 9, 8, 7, 6, 4, 5, 1, 2, 0]
    .map((index) => layers[index]);
  layers[4].fade = true;
  layers[5].fade = true;

  /* ------------------------------------------------------------------ */
  /* Animation loop                                                     */
  /* ------------------------------------------------------------------ */
  const MAXIDX = 11;
  const STAG = 0.045;
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
  const easeOut = (x) => 1 - (1 - x) ** 3;
  const LOOP_MS = 7200;

  let loopStart = null;
  let current = 1;
  let target = 1;
  let rendered = NaN;

  function loopTarget(now) {
    const p = ((now - loopStart) % LOOP_MS) / LOOP_MS;
    if (p < 0.16) return 1;
    if (p < 0.44) return 1 - easeOut((p - 0.16) / 0.28);
    if (p < 0.62) return 0;
    if (p < 0.9) return easeOut((p - 0.62) / 0.28);
    return 1;
  }

  function render(t) {
    if (Math.abs(t - rendered) < 1e-4) return;
    rendered = t;

    ctx.clearRect(0, 0, baseW, baseH);

    for (const L of drawOrder) {
      const local = Math.min(
        1,
        Math.max(0, t * (1 + MAXIDX * STAG) - L.idx * STAG),
      );
      const e = ease(local);
      const k = 1 - e;

      // Current position
      const tx = L.dx * k;
      const ty = L.dy * k;

      // Opacity for fade layers
      let opacity = 1;
      if (L.fade) {
        opacity = Math.max(0, e * 1.6 - 0.6);
      }

      // Draw layer with transform and opacity
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(tx, ty);
      L.drawFn(e);
      ctx.restore();
    }
  }

  /* ------------------------------------------------------------------ */
  /* Frame loop with pause/resume                                       */
  /* ------------------------------------------------------------------ */
  let raf = 0;
  let lastNow = null;
  let pausedAt = null;

  function frame(now) {
    if (pausedAt !== null) {
      if (loopStart !== null) loopStart += now - pausedAt;
      pausedAt = null;
      lastNow = now;
    }
    if (loopStart === null) loopStart = now;
    const dt = lastNow === null ? 16.67 : Math.min(now - lastNow, 100);
    lastNow = now;
    target = loopTarget(now);
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
    }).observe(canvas);
  document.addEventListener("visibilitychange", sync);

  render(current);
  sync();
})();
