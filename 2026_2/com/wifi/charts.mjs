// Minimal canvas plotting: linear/log axes, line and step series, filled areas, labelled markers.
const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
export const PALETTE = ['#51d5e6', '#f4b860', '#45d39a', '#a78bfa', '#fb7185', '#60a5fa', '#f472b6', '#facc15', '#2dd4bf', '#c084fc'];

function niceTicks(min, max, count = 6) {
    const span = max - min, raw = span / count, mag = 10 ** Math.floor(Math.log10(raw)), step = [1, 2, 5, 10].map(f => f * mag).find(s => span / s <= count) || mag * 10;
    const out = []; for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(+v.toFixed(10));
    return out;
}
const fmt = v => Math.abs(v) >= 1000 ? `${+(v / 1000).toFixed(1)}k` : String(+v.toFixed(2));

// spec: { title, x: {min,max,label,log}, y: {min,max,label,log}, series: [{points, color, width, dash, step, fill, label}], markers: [{x,y,color,label,hollow,size}], vlines, hlines, legend }
export function plot(canvas, spec) {
    const dpr = window.devicePixelRatio || 1, cssW = canvas.clientWidth || 400, cssH = canvas.clientHeight || 240;
    if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) { canvas.width = Math.round(cssW * dpr); canvas.height = Math.round(cssH * dpr); }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = cssW, H = cssH, pad = { l: 52, r: 12, t: spec.title ? 24 : 10, b: 34 };
    const text = cssVar('--text'), muted = cssVar('--muted'), dim = cssVar('--dim'), line = cssVar('--line'), bg = cssVar('--panel2');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    let { x, y } = spec;
    if (spec.equalAspect) { const cx = (x.min + x.max) / 2, half = (y.max - y.min) * (W - pad.l - pad.r) / (H - pad.t - pad.b) / 2; x = { ...x, min: cx - half, max: cx + half }; }
    const tx = v => x.log ? Math.log10(v) : v, ty = v => y.log ? Math.log10(Math.max(v, 10 ** (y.min - 1))) : v;
    const x0 = x.log ? Math.log10(x.min) : x.min, x1 = x.log ? Math.log10(x.max) : x.max, y0 = y.log ? y.min : y.min, y1 = y.log ? y.max : y.max;
    const px = v => pad.l + (tx(v) - x0) / (x1 - x0) * (W - pad.l - pad.r);
    const py = v => H - pad.b - (Math.min(Math.max(ty(v), y0), y1) - y0) / (y1 - y0) * (H - pad.t - pad.b);
    ctx.font = '10px JetBrains Mono, monospace'; ctx.lineWidth = 1;
    // grid + ticks
    const yticks = y.log ? Array.from({ length: y1 - y0 + 1 }, (_, i) => y0 + i) : niceTicks(y0, y1, y.ticks || 5);
    for (const t of yticks) {
        const yy = y.log ? H - pad.b - (t - y0) / (y1 - y0) * (H - pad.t - pad.b) : py(t);
        ctx.strokeStyle = line; ctx.beginPath(); ctx.moveTo(pad.l, yy); ctx.lineTo(W - pad.r, yy); ctx.stroke();
        ctx.fillStyle = dim; ctx.textAlign = 'right'; ctx.fillText(y.log ? (t >= 0 ? fmt(10 ** t) : `1e${t}`) : (y.format || fmt)(t), pad.l - 5, yy + 3);
    }
    const xticks = x.log ? Array.from({ length: Math.floor(Math.log10(x.max)) - Math.ceil(Math.log10(x.min)) + 1 }, (_, i) => 10 ** (Math.ceil(Math.log10(x.min)) + i)) : niceTicks(x.min, x.max, x.ticks || 7);
    for (const t of xticks) {
        const xx = px(t); ctx.strokeStyle = line; ctx.beginPath(); ctx.moveTo(xx, pad.t); ctx.lineTo(xx, H - pad.b); ctx.stroke();
        ctx.fillStyle = dim; ctx.textAlign = 'center'; ctx.fillText((x.format || fmt)(t), xx, H - pad.b + 13);
    }
    ctx.fillStyle = muted; ctx.textAlign = 'center'; ctx.fillText(x.label || '', pad.l + (W - pad.l - pad.r) / 2, H - 5);
    ctx.save(); ctx.translate(12, pad.t + (H - pad.t - pad.b) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(y.label || '', 0, 0); ctx.restore();
    if (spec.title) { ctx.fillStyle = text; ctx.textAlign = 'left'; ctx.font = '600 12px DM Sans, sans-serif'; ctx.fillText(spec.title, pad.l, 15); ctx.font = '10px JetBrains Mono, monospace'; }
    ctx.save(); ctx.beginPath(); ctx.rect(pad.l, pad.t, W - pad.l - pad.r, H - pad.t - pad.b); ctx.clip();
    for (const h of spec.hlines || []) { ctx.strokeStyle = h.color || dim; ctx.setLineDash(h.dash || [4, 4]); ctx.beginPath(); ctx.moveTo(pad.l, py(h.y)); ctx.lineTo(W - pad.r, py(h.y)); ctx.stroke(); ctx.setLineDash([]); if (h.label) { ctx.fillStyle = h.color || dim; ctx.textAlign = 'left'; ctx.fillText(h.label, pad.l + 4, py(h.y) - 4); } }
    for (const v of spec.vlines || []) { ctx.strokeStyle = v.color || dim; ctx.setLineDash(v.dash || [4, 4]); ctx.beginPath(); ctx.moveTo(px(v.x), pad.t); ctx.lineTo(px(v.x), H - pad.b); ctx.stroke(); ctx.setLineDash([]); }
    for (const band of spec.xbands || []) {
        ctx.fillStyle = band.color; ctx.globalAlpha = band.alpha ?? .15; ctx.fillRect(px(band.x0), pad.t, px(band.x1) - px(band.x0), H - pad.t - pad.b); ctx.globalAlpha = 1;
        if (band.label) { ctx.fillStyle = band.color; ctx.textAlign = 'left'; ctx.fillText(band.label, px(band.x0) + 3, pad.t + 11); }
    }
    for (const st of spec.stems || []) {
        ctx.strokeStyle = st.color; ctx.fillStyle = st.color; ctx.lineWidth = st.width || 1.2;
        const base = py(st.base ?? (y.log ? 10 ** y0 : y0));
        for (const [a, b] of st.points) { if (!Number.isFinite(b) || a < x.min || a > x.max) continue; const X = px(a), Y = py(b); ctx.beginPath(); ctx.moveTo(X, base); ctx.lineTo(X, Y); ctx.stroke(); if (st.dots) ctx.fillRect(X - 1.5, Y - 1.5, 3, 3); }
        ctx.lineWidth = 1;
    }
    for (const sc of spec.scatter || []) {
        ctx.fillStyle = sc.color; ctx.globalAlpha = sc.alpha ?? .6; const d = sc.size || 2;
        for (const p of sc.points) { const [a, b, c] = p; if (c) ctx.fillStyle = c; ctx.fillRect(px(a) - d / 2, py(b) - d / 2, d, d); }
        ctx.globalAlpha = 1;
    }
    for (const s of spec.series || []) {
        const pts = s.points.filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b) && (!y.log || b > 0) && a >= x.min && a <= x.max);
        if (!pts.length) continue;
        ctx.beginPath();
        pts.forEach(([a, b], i) => {
            const X = px(a), Y = py(b);
            if (i === 0) ctx.moveTo(X, Y); else if (s.step) { ctx.lineTo(X, py(pts[i - 1][1])); ctx.lineTo(X, Y); } else ctx.lineTo(X, Y);
        });
        if (s.fill) { const last = pts.at(-1), first = pts[0]; ctx.lineTo(px(last[0]), py(y.log ? 10 ** y0 : y0)); ctx.lineTo(px(first[0]), py(y.log ? 10 ** y0 : y0)); ctx.closePath(); ctx.globalAlpha = s.alpha ?? .25; ctx.fillStyle = s.color; ctx.fill(); ctx.globalAlpha = 1; }
        else { ctx.strokeStyle = s.color; ctx.lineWidth = s.width || 1.6; ctx.setLineDash(s.dash || []); ctx.globalAlpha = s.alpha ?? 1; ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; ctx.lineWidth = 1; }
        if (s.labelAt) { ctx.fillStyle = s.color; ctx.textAlign = 'left'; ctx.fillText(s.labelText, px(s.labelAt[0]) + 3, py(s.labelAt[1]) - 3); }
        if (s.endLabel) { const [a, b] = pts.at(-1); ctx.fillStyle = s.color; ctx.textAlign = 'right'; ctx.fillText(s.endLabel, Math.min(px(a), W - pad.r - 2), py(b) - 4); }
    }
    for (const b of spec.bars || []) { ctx.fillStyle = b.color; ctx.globalAlpha = b.alpha ?? .85; ctx.fillRect(px(b.x0), py(b.y), px(b.x1) - px(b.x0), py(y.log ? 10 ** y0 : y0) - py(b.y)); ctx.globalAlpha = 1; }
    // Filled rectangles in data coordinates (time–frequency grids), with an optional centred label.
    for (const r of spec.rects || []) {
        const X0 = px(r.x0), X1 = px(r.x1), Y0 = py(r.y1), Y1 = py(r.y0);
        ctx.fillStyle = r.color; ctx.globalAlpha = r.alpha ?? .8; ctx.fillRect(X0, Y0, X1 - X0, Y1 - Y0); ctx.globalAlpha = 1;
        if (r.stroke) { ctx.strokeStyle = r.stroke; ctx.strokeRect(X0 + .5, Y0 + .5, X1 - X0 - 1, Y1 - Y0 - 1); }
        if (r.label && X1 - X0 > ctx.measureText(r.label).width + 4 && Y1 - Y0 > 11) { ctx.fillStyle = bg; ctx.textAlign = 'center'; ctx.fillText(r.label, (X0 + X1) / 2, (Y0 + Y1) / 2 + 3); }
    }
    ctx.restore();
    for (const m of spec.markers || []) {
        if (!Number.isFinite(m.x) || !Number.isFinite(m.y) || m.x < x.min || m.x > x.max) continue;
        const X = px(m.x), Y = py(m.y), r = m.size || 4.5;
        ctx.beginPath(); ctx.arc(X, Y, r, 0, 2 * Math.PI);
        if (m.hollow) { ctx.strokeStyle = m.color; ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 1; } else { ctx.fillStyle = m.color; ctx.fill(); ctx.strokeStyle = bg; ctx.stroke(); }
        if (m.label) { ctx.fillStyle = m.color; ctx.textAlign = 'left'; ctx.font = '600 10px DM Sans, sans-serif'; ctx.fillText(m.label, X + r + 3, Y - r); ctx.font = '10px JetBrains Mono, monospace'; }
    }
    for (const seg of spec.segments || []) { ctx.strokeStyle = seg.color; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(px(seg.x0), py(seg.y0)); ctx.lineTo(px(seg.x1), py(seg.y1)); ctx.stroke(); ctx.setLineDash([]); }
    if (spec.legend?.length) {
        ctx.font = '10px DM Sans, sans-serif';
        let lx = W - pad.r - 6, ly = pad.t + 10;
        const widths = spec.legend.map(l => ctx.measureText(l.label).width + 20), total = Math.max(...widths);
        ctx.fillStyle = bg; ctx.globalAlpha = .85; ctx.fillRect(lx - total - 6, ly - 10, total + 10, spec.legend.length * 13 + 6); ctx.globalAlpha = 1;
        for (const l of spec.legend) { ctx.fillStyle = l.color; ctx.fillRect(lx - total, ly - 6, 10, l.dash ? 2 : 4); ctx.fillStyle = muted; ctx.textAlign = 'left'; ctx.fillText(l.label, lx - total + 14, ly); ly += 13; }
    }
    return { px, py };
}
