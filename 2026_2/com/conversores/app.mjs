// Conversores CC-CA / CA-CC: guided power-electronics lessons (single-phase PWM, three-phase SVPWM, multilevel,
// line rectifiers, boost PFC) built on power.mjs, with the lesson shell and plotting of the CommsLab PHY page.
import { plot, PALETTE } from '../wifi/charts.mjs';
import * as P from './power.mjs';
import { THEORY } from './teoria.mjs';

const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const f1 = (v, d = 1) => Number.isFinite(v) ? v.toFixed(d) : '—';
const pct = (v, d = 1) => Number.isFinite(v) ? `${(100 * v).toFixed(d)}%` : '—';
const RED = '#fb7185', GREY = '#94a3b8';
const metric = (label, value, small = '') => `<div class="metric"><span>${label}</span><strong>${value}</strong>${small ? `<small>${small}</small>` : ''}</div>`;

const C = {
    range: (key, label, value, min, max, step, unit = '') => `<label class="range">${label}<input type="range" data-k="${key}" min="${min}" max="${max}" step="${step}" value="${value}" data-unit="${esc(unit)}"><output>${value}${unit}</output></label>`,
    select: (key, label, value, options) => `<label>${label} <select data-k="${key}">${options.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${String(v) === String(value) ? 'selected' : ''}>${esc(l)}</option>`; }).join('')}</select></label>`,
    check: (key, label, value) => `<label><input type="checkbox" data-k="${key}" ${value ? 'checked' : ''}> ${label}</label>`,
    group: (title, html) => `<div class="ctl-group"><span>${title}</span>${html}</div>`,
};
const card = ({ id, cap, cls = '', html = false }) => `<div class="plot-card ${cls}">${html ? `<div class="html" data-html="${id}"></div>` : `<canvas data-plot="${id}"></canvas>`}<div class="cap">${cap}</div></div>`;
const WINDOWS = [[1, '1 ciclo'], [.5, '½ ciclo'], [.25, '¼ ciclo'], [.1, '10% do ciclo']];

// ---------- trace helpers: one period of N samples, x in ms, only the first `win` of the period ----------
const msAxis = (N, f) => i => i / N * 1000 / f;
function line(arr, xs, win = 1, max = 2400, scale = 1) {
    const n = arr.length, i1 = Math.min(n, Math.ceil(win * n)), step = Math.max(1, Math.floor(i1 / max)), out = [];
    for (let i = 0; i < i1; i += step) out.push([xs(i), arr[i] * scale]);
    out.push([xs(i1), arr[i1 % n] * scale]);
    return out;
}
// Piecewise-constant signals: keep only the samples where the value changes (draw with step: true).
function steps(arr, xs, win = 1, scale = 1, offset = 0) {
    const n = arr.length, i1 = Math.min(n, Math.ceil(win * n)), out = [[xs(0), arr[0] * scale + offset]];
    for (let i = 1; i < i1; i++) if (arr[i] !== arr[i - 1]) out.push([xs(i), arr[i] * scale + offset]);
    out.push([xs(i1), arr[i1 - 1] * scale + offset]);
    return out;
}
const fundamental = (h, N) => Float64Array.from({ length: N }, (_, i) => h.amp[1] * Math.cos(P.TAU * i / N + h.phase[1]));
const peakAbs = (...arrs) => Math.max(1e-9, ...arrs.map(a => { let m = 0; for (const v of a) if (Math.abs(v) > m) m = Math.abs(v); return m; }));
const sym = (m, k = 1.15) => ({ min: -m * k, max: m * k });
const stemsOf = (amp, hmax, norm, from = 1) => { const out = []; for (let h = from; h <= hmax && h < amp.length; h++) out.push([h, amp[h] / norm]); return out; };
const memo = new Map();
const cached = (key, fn) => { if (!memo.has(key)) { if (memo.size > 60) memo.clear(); memo.set(key, fn()); } return memo.get(key); };

// ======================================================================
// 1. Single-phase H-bridge PWM
// ======================================================================
const SCHEMES = [['bipolar', 'SPWM bipolar'], ['unipolar', 'SPWM unipolar'], ['square', 'Onda quadrada'], ['qsquare', 'Quase-quadrada']];
const pwm = {
    id: 'pwm', nav: 'PWM monofásico', sub: 'CC-CA · ponte H',
    state: { scheme: 'bipolar', sampling: 'natural', ma: .8, mf: 15, vdc: 400, f1: 60, R: 10, Lm: 20, win: 1 },
    theory: THEORY.pwm,
    controls: s => C.select('scheme', 'Modulação', s.scheme, SCHEMES)
        + C.select('sampling', 'Amostragem', s.sampling, [['natural', 'natural'], ['regular', 'regular (digital)']])
        + C.range('ma', 'mₐ', s.ma, 0, 2.5, .01) + C.range('mf', 'm<sub>f</sub>', s.mf, 3, 61, 1)
        + C.range('vdc', 'V<sub>dc</sub>', s.vdc, 50, 800, 10, ' V') + C.select('f1', 'f₁', s.f1, [[50, '50 Hz'], [60, '60 Hz']])
        + C.select('win', 'Janela', s.win, WINDOWS)
        + C.group('CARGA R-L', C.range('R', 'R', s.R, 1, 50, .5, ' Ω') + C.range('Lm', 'L', s.Lm, 0, 100, 1, ' mH')),
    cards: () => [
        { id: 'mod', cap: 'Como os pulsos nascem: referência senoidal (azul) × portadora triangular (cinza). Em unipolar, o braço B compara −v<sub>r</sub> (âmbar) com a mesma portadora. Nas ondas quadradas não há portadora: cada braço comuta uma vez por ciclo.' },
        { id: 'gates', cap: 'Sinais de comando dos dois braços (S1 = chave superior do braço A, S3 = superior do braço B; as inferiores são complementares). v<sub>o</sub> = V<sub>dc</sub>·(S1 − S3).' },
        { id: 'vo', cap: 'Tensão de saída em pulsos, sua média móvel em um período da portadora (verde, segue a referência) e a fundamental extraída por FFT (âmbar).' },
        { id: 'io', cap: 'Corrente na carga R-L em regime (calculada harmônico a harmônico, I<sub>h</sub> = V<sub>h</sub>/Z<sub>h</sub>). O indutor filtra os pulsos.' },
        { id: 'spec', cap: 'Espectro de amplitudes da tensão, normalizado por V<sub>dc</sub>. Tracejado: múltiplos de m<sub>f</sub>. Bipolar: grupos em m<sub>f</sub>, 2m<sub>f</sub>…; unipolar: o grupo em m<sub>f</sub> some.' },
        { id: 'gain', cap: 'Ganho da fundamental V̂₁/V<sub>dc</sub> × mₐ: linear até 1 (PWM), sobremodulação e saturação em 4/π (onda quadrada). Ponto: valor medido nesta simulação.' },
    ],
    draw(s, ctx) {
        const r = P.singlePhase({ vdc: s.vdc, ma: s.ma, mf: s.mf, scheme: s.scheme, sampling: s.sampling }), N = r.N, xs = msAxis(N, s.f1), win = s.win, X = { min: 0, max: 1000 / s.f1 * win, label: 't (ms)' };
        const hv = P.harmonics(r.v), i = P.rlCurrent(r.v, s.R, s.Lm / 1e3, s.f1), hi = P.harmonics(i), pwmLike = s.scheme === 'bipolar' || s.scheme === 'unipolar';
        const v1 = fundamental(hv, N), i1 = fundamental(hi, N), hmax = pwmLike ? Math.min(N / 4, 4 * s.mf + 12) : 41;
        const thdV = P.thd(hv.amp), thdI = P.thd(hi.amp), V1t = P.singlePhaseV1(s.scheme, s.ma, s.vdc), Pload = P.mean(r.v.map((v, k) => v * i[k]));
        const label = SCHEMES.find(x => x[0] === s.scheme)[1];
        ctx.strip(metric('Fundamental V̂₁', `${f1(hv.amp[1])} V`, `teoria ${f1(V1t)} V · ${f1(hv.amp[1] / Math.SQRT2)} V<sub>rms</sub>`)
            + metric('THD tensão', pct(thdV), `WTHD ${pct(P.wthd(hv.amp), 2)}`)
            + metric('THD corrente', pct(thdI, 2), `I₁ = ${f1(hi.amp[1] / Math.SQRT2, 2)} A<sub>rms</sub>`)
            + metric('Chaveamento', pwmLike ? `${f1(s.mf * s.f1 / 1000, 2)} kHz` : `${s.f1} Hz`, s.scheme === 'unipolar' ? `frequência aparente na carga: ${f1(2 * s.mf * s.f1 / 1000, 2)} kHz` : pwmLike ? 'harmônicos a partir de m<sub>f</sub>·f₁' : 'uma comutação por ciclo por chave')
            + metric('Região', !pwmLike ? '—' : s.ma <= 1 ? 'linear' : 'sobremodulação', s.ma > 1 && pwmLike ? `pulsos perdidos, ganho ${f1(P.pwmGain(s.ma), 3)}` : `mₐ = ${s.ma}`)
            + metric('Potência na carga', `${f1(Pload)} W`, `cos φ₁ = ${f1(s.R / Math.hypot(s.R, P.TAU * s.f1 * s.Lm / 1e3), 3)}`));
        // Reference × carrier
        if (pwmLike) {
            const series = [{ points: line(r.car, xs, win, 3000), color: GREY, width: 1, alpha: .75 }, { points: line(r.ref, xs, win), color: PALETTE[0], width: 2.2 }];
            if (s.scheme === 'unipolar') series.push({ points: line(r.ref, xs, win, 2400, -1), color: PALETTE[1], width: 1.8 });
            if (s.sampling === 'regular') series.push({ points: steps(r.ref, xs, win), color: PALETTE[2], width: 1.2, step: true });
            plot(ctx.cv('mod'), { title: `${label} · mₐ = ${s.ma} · m_f = ${s.mf}`, x: X, y: { min: -Math.max(1.15, s.ma * 1.08), max: Math.max(1.15, s.ma * 1.08), label: 'normalizado' }, series,
                legend: [{ label: 'portadora', color: GREY }, { label: 'v_r (braço A)', color: PALETTE[0] }, ...(s.scheme === 'unipolar' ? [{ label: '−v_r (braço B)', color: PALETTE[1] }] : []), ...(s.sampling === 'regular' ? [{ label: 'v_r amostrada', color: PALETTE[2] }] : [])] });
        } else {
            plot(ctx.cv('mod'), { title: s.scheme === 'square' ? 'Onda quadrada: cada braço comuta no cruzamento por zero' : `Quase-quadrada: braços defasados, α = ${f1(P.quasiAlpha(s.ma) * 180 / Math.PI)}°`, x: X, y: { min: -1.3, max: 1.3, label: 'normalizado' },
                series: [{ points: line(Float64Array.from({ length: N }, (_, k) => Math.sin(P.TAU * k / N)), xs, win), color: PALETTE[0], width: 1.4, dash: [4, 3] }, { points: steps(r.gA, xs, win, 1.8, -.9), color: PALETTE[0], width: 2, step: true }, { points: steps(r.gB, xs, win, 1.8, -.9), color: PALETTE[1], width: 1.4, step: true, dash: [5, 3] }],
                legend: [{ label: 'sen ω₁t', color: PALETTE[0], dash: true }, { label: 'braço A', color: PALETTE[0] }, { label: 'braço B', color: PALETTE[1] }] });
        }
        plot(ctx.cv('gates'), { title: 'Comandos de gatilho', x: X, y: { min: -.3, max: 3.9, label: '', format: () => '' },
            series: [{ points: steps(r.gA, xs, win, 1, 2.4), color: PALETTE[0], width: 1.6, step: true }, { points: steps(r.gB, xs, win, 1, .5), color: PALETTE[1], width: 1.6, step: true }],
            hlines: [{ y: 3.55, label: 'S1 (braço A, superior)', color: PALETTE[0], dash: [1, 999] }, { y: 1.65, label: 'S3 (braço B, superior)', color: PALETTE[1], dash: [1, 999] }] });
        const avg = P.movingAverage(r.v, Math.max(1, Math.round(N / Math.max(1, s.mf))));
        plot(ctx.cv('vo'), { title: `v_o(t) · THD ${pct(thdV)}`, x: X, y: { ...sym(s.vdc, 1.12), label: 'V' },
            series: [{ points: steps(r.v, xs, win), color: PALETTE[0], width: 1, alpha: .55, step: true }, ...(pwmLike ? [{ points: line(avg, xs, win), color: PALETTE[2], width: 1.6 }] : []), { points: line(v1, xs, win), color: PALETTE[1], width: 2.2 }],
            legend: [{ label: 'v_o', color: PALETTE[0] }, ...(pwmLike ? [{ label: 'média local', color: PALETTE[2] }] : []), { label: 'fundamental', color: PALETTE[1] }] });
        const ipk = peakAbs(i);
        plot(ctx.cv('io'), { title: `i_o(t) · THD ${pct(thdI, 2)}`, x: X, y: { ...sym(ipk), label: 'A' },
            series: [{ points: line(i, xs, win, 3000), color: PALETTE[2], width: 1.8 }, { points: line(i1, xs, win), color: PALETTE[1], width: 1.2, dash: [5, 4] }],
            legend: [{ label: 'i_o', color: PALETTE[2] }, { label: 'fundamental', color: PALETTE[1] }] });
        plot(ctx.cv('spec'), { title: `Espectro de v_o · V̂₁/V_dc = ${f1(hv.amp[1] / s.vdc, 3)}`, x: { min: 0, max: hmax + 1, label: 'ordem harmônica h' }, y: { min: 0, max: Math.max(.2, Math.min(1.35, hv.amp[1] / s.vdc * 1.1)), label: 'V̂_h / V_dc' },
            stems: [{ points: stemsOf(hv.amp, hmax, s.vdc, 2), color: PALETTE[0], width: 1.4 }, { points: [[1, hv.amp[1] / s.vdc]], color: PALETTE[1], width: 3 }],
            vlines: pwmLike ? [1, 2, 3, 4].map(k => ({ x: k * s.mf, color: GREY, dash: [2, 4] })).filter(v => v.x <= hmax) : [] });
        const curve = Array.from({ length: 251 }, (_, k) => { const m = k / 100; return [m, P.singlePhaseV1(s.scheme, m, 1)]; });
        plot(ctx.cv('gain'), { title: 'Ganho da fundamental', x: { min: 0, max: 2.5, label: 'mₐ' }, y: { min: 0, max: 1.45, label: 'V̂₁ / V_dc' },
            series: [{ points: curve, color: PALETTE[0], width: 2 }, { points: [[0, 0], [1.4, 1.4]], color: GREY, width: 1, dash: [4, 4] }],
            hlines: [{ y: 4 / Math.PI, label: '4/π (onda quadrada)', color: PALETTE[1] }], vlines: [{ x: 1, color: GREY }],
            markers: [{ x: s.ma, y: hv.amp[1] / s.vdc, color: PALETTE[1], label: 'medido' }] });
    },
};

// ======================================================================
// 2. Three-phase inverter: SPWM, zero-sequence injection, SVPWM
// ======================================================================
const TRI_MODES = [['spwm', 'SPWM'], ['thi', 'SPWM + 3º harmônico'], ['svpwm', 'SVPWM (min-máx)'], ['dpwm', 'DPWM1 (descontínua)'], ['six', 'Six-step']];
const HEX = ['100', '110', '010', '011', '001', '101'];
const tri = {
    id: 'tri', nav: 'Inversor trifásico', sub: 'SPWM · SVPWM',
    state: { mode: 'svpwm', ma: .9, mf: 21, vdc: 600, f1: 60, R: 10, Lm: 15, vec: 20, win: 1 },
    theory: THEORY.tri,
    controls: s => C.select('mode', 'Modulação', s.mode, TRI_MODES) + C.range('ma', 'mₐ', s.ma, 0, 1.6, .01) + C.range('mf', 'm<sub>f</sub>', s.mf, 3, 51, 1)
        + C.range('vdc', 'V<sub>dc</sub>', s.vdc, 100, 1000, 10, ' V') + C.select('f1', 'f₁', s.f1, [[50, '50 Hz'], [60, '60 Hz']]) + C.select('win', 'Janela', s.win, WINDOWS)
        + C.group('VETOR', C.range('vec', 'ângulo γ', s.vec, 0, 359, 1, '°'))
        + C.group('CARGA R-L (Y)', C.range('R', 'R', s.R, 1, 50, .5, ' Ω') + C.range('Lm', 'L', s.Lm, 0, 100, 1, ' mH')),
    cards: () => [
        { id: 'refs', cap: 'Referências senoidais (finas), sequência zero v₀ (roxo, tracejado) e referência modificada da fase a (azul grosso) contra a portadora. A SVPWM e a THI achatam o pico e liberam 15,5% de tensão.' },
        { id: 'hex', cls: 'tall', cap: 'Hexágono dos vetores espaciais (estados abc). Círculo verde: limite linear V<sub>dc</sub>/√3. Azul: trajetória da referência. Pontos âmbar: vetor médio de cada período da portadora. Setas: decomposição T₁·V<sub>k</sub> + T₂·V<sub>k+1</sub> no ângulo γ.' },
        { id: 'seq', cls: 'tall', cap: 'Um período de chaveamento T<sub>s</sub> no ângulo γ: estados dos três braços e o vetor aplicado em cada trecho. A SVPWM gera a sequência simétrica 000 → V<sub>k</sub> → V<sub>k+1</sub> → 111 → …, mudando um braço por vez.' },
        { id: 'vab', cap: 'Tensão de linha v<sub>ab</sub> (3 níveis: 0, ±V<sub>dc</sub>) e sua fundamental. A sequência zero não aparece aqui.' },
        { id: 'van', cap: 'Tensão de fase no neutro da carga v<sub>an</sub> (5 níveis: 0, ±⅓, ±⅔ V<sub>dc</sub>) e correntes das três fases.' },
        { id: 'spec', cap: 'Espectro de v<sub>ab</sub> / V<sub>dc</sub>. Os harmônicos triplos da portadora (3m<sub>f</sub>…) se cancelam na tensão de linha.' },
        { id: 'gain', cap: 'Ganho V̂<sub>ab1</sub>/V<sub>dc</sub> × mₐ de cada modulação (m<sub>f</sub> grande). SPWM satura em mₐ = 1; THI, SVPWM e DPWM chegam a 2/√3. Topo: six-step, 2√3/π.' },
    ],
    draw(s, ctx) {
        const r = P.threePhase({ vdc: s.vdc, ma: s.ma, mf: s.mf, mode: s.mode }), N = r.N, xs = msAxis(N, s.f1), win = s.win, X = { min: 0, max: 1000 / s.f1 * win, label: 't (ms)' };
        const L = s.Lm / 1e3, ia = P.rlCurrent(r.van, s.R, L, s.f1), ib = P.rlCurrent(r.vbn, s.R, L, s.f1), ic = P.rlCurrent(r.vcn, s.R, L, s.f1);
        const hab = P.harmonics(r.vab), hi = P.harmonics(ia), hmax = Math.min(N / 4, 3 * s.mf + 12), lin = P.LINEAR_LIMIT[s.mode], label = TRI_MODES.find(m => m[0] === s.mode)[1];
        const dwell = P.svDwell(s.ma, s.vec), seq = P.seqWindow(s.mode, s.ma, s.mf, s.vec), Ts = 1e6 / (s.mf * s.f1);
        // Leg-a commutations relative to continuous carrier PWM (two per carrier period).
        let edges = 0; for (let k = 0; k < N; k++) edges += r.g[0][k] !== r.g[0][(k + 1) % N];
        const clampFrac = s.mode === 'six' ? 2 / (2 * s.mf) : edges / (2 * s.mf);
        ctx.strip(metric('V̂<sub>ab1</sub> (linha)', `${f1(hab.amp[1])} V`, `${f1(hab.amp[1] / Math.SQRT2)} V<sub>rms</sub> · teoria linear ${f1(Math.sqrt(3) / 2 * s.ma * s.vdc)} V`)
            + metric('Limite linear', Number.isFinite(lin) ? `mₐ ≤ ${f1(lin, 3)}` : '—', s.mode === 'six' ? 'onda quadrada, sem PWM' : s.ma <= lin + 1e-9 ? 'operando na região linear' : 'sobremodulação')
            + metric('THD v<sub>ab</sub> · i<sub>a</sub>', `${pct(P.thd(hab.amp))} · ${pct(P.thd(hi.amp), 2)}`, `WTHD ${pct(P.wthd(hab.amp), 2)}`)
            + metric('Setor · φ', `S${dwell.sector} · ${f1(dwell.phiDeg)}°`, `vetores ${HEX[dwell.sector - 1]} e ${HEX[dwell.sector % 6]}`)
            + metric('T₁ · T₂ · T₀', `${f1(dwell.t1 * Ts)} · ${f1(dwell.t2 * Ts)} · ${f1(dwell.t0 * Ts)} µs`, `T<sub>s</sub> = ${f1(Ts)} µs`)
            + metric('Comutações do braço a', `${f1(clampFrac * 100, 0)}%`, s.mode === 'dpwm' ? 'DPWM: ~⅓ do ciclo sem chavear' : 'em relação ao SPWM contínuo'));
        // References and carrier
        const series = [{ points: line(r.car, xs, win, 3000), color: GREY, width: 1, alpha: .4 }];
        r.raw.forEach((a, p) => series.push({ points: line(a, xs, win), color: PALETTE[p], width: 1, alpha: .55 }));
        if (s.mode !== 'six') series.push({ points: line(r.v0, xs, win), color: PALETTE[3], width: 1.4, dash: [5, 3] }, { points: line(r.refs[0], xs, win), color: PALETTE[0], width: 2.4 });
        plot(ctx.cv('refs'), { title: `${label} · referências e sequência zero`, x: X, y: { min: -Math.max(1.2, s.ma * 1.05), max: Math.max(1.2, s.ma * 1.05), label: 'normalizado (V_dc/2)' }, series,
            hlines: [{ y: 1, color: GREY, dash: [2, 3] }, { y: -1, color: GREY, dash: [2, 3] }],
            legend: [{ label: 'portadora', color: GREY }, { label: 'v_a*, v_b*, v_c*', color: PALETTE[1] }, ...(s.mode !== 'six' ? [{ label: 'v₀ (seq. zero)', color: PALETTE[3] }, { label: 'v_a* + v₀', color: PALETTE[0] }] : [])] });
        drawHex(ctx.cv('hex'), s, r, dwell);
        // Switching sequence in one Ts
        const rects = [], names = [];
        seq.segs.forEach((g, k) => {
            const x0 = g.x0 * Ts, x1 = g.x1 * Ts, name = P.SV_NAME[g.state];
            rects.push({ x0, x1, y0: 3.15, y1: 3.95, color: name === 'V0' || name === 'V7' ? GREY : PALETTE[3 + (HEX.indexOf(g.state) % 2)], alpha: .55, stroke: 'rgba(0,0,0,.25)', label: `${name} ${g.state}` });
            [...g.state].forEach((b, p) => { if (b === '1') rects.push({ x0, x1, y0: 2.1 - p, y1: 2.8 - p, color: PALETTE[p], alpha: .8 }); });
            names.push(`${name}:${f1((g.x1 - g.x0) * Ts)}`);
        });
        plot(ctx.cv('seq'), { title: `Período nº ${seq.carrierIndex + 1} · γ = ${s.vec}° · ${seq.segs.length} trechos`, x: { min: 0, max: Ts, label: 't dentro de T_s (µs)' }, y: { min: -.1, max: 4.2, label: '', format: () => '' }, rects,
            hlines: [{ y: 2.92, label: 'braço a', color: PALETTE[0], dash: [1, 999] }, { y: 1.92, label: 'braço b', color: PALETTE[1], dash: [1, 999] }, { y: .92, label: 'braço c', color: PALETTE[2], dash: [1, 999] }] });
        plot(ctx.cv('vab'), { title: `v_ab(t) · THD ${pct(P.thd(hab.amp))}`, x: X, y: { ...sym(s.vdc, 1.12), label: 'V' },
            series: [{ points: steps(r.vab, xs, win), color: PALETTE[0], width: 1, alpha: .55, step: true }, { points: line(fundamental(hab, N), xs, win), color: PALETTE[1], width: 2.2 }],
            legend: [{ label: 'v_ab', color: PALETTE[0] }, { label: 'fundamental', color: PALETTE[1] }] });
        const ipk = peakAbs(ia, ib, ic), sc = s.vdc * .62 / ipk;
        plot(ctx.cv('van'), { title: `v_an (5 níveis) e correntes · Î = ${f1(ipk, 2)} A`, x: X, y: { ...sym(s.vdc * .7, 1.08), label: 'V  (correntes em escala)' },
            series: [{ points: steps(r.van, xs, win), color: GREY, width: 1, alpha: .6, step: true }, ...[ia, ib, ic].map((c, p) => ({ points: line(c, xs, win, 2400, sc), color: PALETTE[p], width: 1.8 }))],
            legend: [{ label: 'v_an', color: GREY }, { label: 'i_a', color: PALETTE[0] }, { label: 'i_b', color: PALETTE[1] }, { label: 'i_c', color: PALETTE[2] }] });
        plot(ctx.cv('spec'), { title: `Espectro de v_ab · V̂₁/V_dc = ${f1(hab.amp[1] / s.vdc, 3)}`, x: { min: 0, max: hmax + 1, label: 'ordem harmônica h' }, y: { min: 0, max: Math.max(.2, Math.min(1.25, hab.amp[1] / s.vdc * 1.1)), label: 'V̂_h / V_dc' },
            stems: [{ points: stemsOf(hab.amp, hmax, s.vdc, 2), color: PALETTE[0], width: 1.4 }, { points: [[1, hab.amp[1] / s.vdc]], color: PALETTE[1], width: 3 }],
            vlines: [1, 2, 3].map(k => ({ x: k * s.mf, color: GREY, dash: [2, 4] })).filter(v => v.x <= hmax) });
        const curves = cached('tri-gain', () => TRI_MODES.filter(m => m[0] !== 'six').map(([m]) => Array.from({ length: 81 }, (_, k) => { const ma = k * .02; return [ma, P.threePhaseGain(m, ma)]; })));
        plot(ctx.cv('gain'), { title: 'Ganho da tensão de linha', x: { min: 0, max: 1.6, label: 'mₐ' }, y: { min: 0, max: 1.2, label: 'V̂_ab1 / V_dc' },
            series: curves.map((c, k) => ({ points: c, color: PALETTE[k], width: TRI_MODES[k][0] === s.mode ? 2.6 : 1.2, dash: TRI_MODES[k][0] === s.mode ? [] : [4, 3] })),
            hlines: [{ y: 2 * Math.sqrt(3) / Math.PI, label: 'six-step 2√3/π', color: PALETTE[4] }, { y: 1, color: GREY, dash: [2, 3] }],
            vlines: [{ x: 1, color: GREY }, { x: 2 / Math.sqrt(3), color: GREY }],
            markers: [{ x: s.mode === 'six' ? 1.55 : s.ma, y: hab.amp[1] / s.vdc, color: PALETTE[1], label: 'medido' }],
            legend: TRI_MODES.filter(m => m[0] !== 'six').map(([, l], k) => ({ label: l, color: PALETTE[k] })) });
    },
};
function drawHex(cv, s, r, dwell) {
    const verts = HEX.map((_, k) => [2 / 3 * Math.cos(k * Math.PI / 3), 2 / 3 * Math.sin(k * Math.PI / 3)]);
    const circle = (rad, n = 120) => Array.from({ length: n + 1 }, (_, k) => [rad * Math.cos(P.TAU * k / n), rad * Math.sin(P.TAU * k / n)]);
    const series = [{ points: [...verts, verts[0]], color: GREY, width: 1.4 }];
    verts.forEach(v => series.push({ points: [[0, 0], v], color: GREY, width: 1, dash: [2, 4], alpha: .6 }));
    series.push({ points: circle(1 / Math.sqrt(3)), color: PALETTE[2], width: 1.2, dash: [5, 4] }, { points: circle(s.ma / 2), color: PALETTE[0], width: 1.6, alpha: .8 });
    // Average output vector of each carrier period (Clarke of the averaged leg voltages, in Vdc units).
    const N = r.N, per = N / s.mf, dots = [];
    for (let j = 0; j < s.mf; j++) {
        const avg = [0, 1, 2].map(p => { let a = 0; for (let k = Math.round(j * per); k < Math.round((j + 1) * per); k++) a += r.g[p][k]; return a / (Math.round((j + 1) * per) - Math.round(j * per)) - .5; });
        dots.push([2 / 3 * (avg[0] - avg[1] / 2 - avg[2] / 2), 2 / 3 * Math.sqrt(3) / 2 * (avg[1] - avg[2])]);
    }
    const g = s.vec * Math.PI / 180, ref = [s.ma / 2 * Math.cos(g), s.ma / 2 * Math.sin(g)];
    const vk = verts[dwell.sector - 1], vk1 = verts[dwell.sector % 6], p1 = [dwell.t1 * vk[0], dwell.t1 * vk[1]], p2 = [p1[0] + dwell.t2 * vk1[0], p1[1] + dwell.t2 * vk1[1]];
    series.push({ points: [[0, 0], ref], color: PALETTE[0], width: 2.4 }, { points: [[0, 0], p1], color: PALETTE[3], width: 2.2 }, { points: [p1, p2], color: PALETTE[4], width: 2.2 });
    plot(cv, { title: `Vetores espaciais · |v*| = ${f1(s.ma / 2, 3)}·V_dc · setor ${dwell.sector}`, equalAspect: true, x: { min: -.85, max: .85, label: 'α (÷ V_dc)' }, y: { min: -.85, max: .85, label: 'β (÷ V_dc)' }, series,
        scatter: [{ points: dots, color: PALETTE[1], size: 4, alpha: .9 }],
        markers: [...verts.map((v, k) => ({ x: v[0], y: v[1], color: k === dwell.sector - 1 || k === dwell.sector % 6 ? PALETTE[1] : GREY, size: 3.5, label: `V${k + 1} ${HEX[k]}` })), { x: 0, y: 0, color: GREY, size: 3.5, label: 'V0/V7' }, { x: ref[0], y: ref[1], color: PALETTE[0], label: 'v*' }],
        legend: [{ label: `T₁·V${dwell.sector}`, color: PALETTE[3] }, { label: `T₂·V${dwell.sector % 6 + 1}`, color: PALETTE[4] }, { label: 'média por T_s', color: PALETTE[1] }] });
}

// ======================================================================
// 3. Multilevel cascaded H-bridge
// ======================================================================
const ML_METHODS = [['ps', 'PS-PWM (deslocadas em fase)'], ['pd', 'LS-PWM PD'], ['pod', 'LS-PWM POD'], ['apod', 'LS-PWM APOD'], ['nlc', 'Nível mais próximo (NLC)']];
const ml = {
    id: 'ml', nav: 'Multinível', sub: 'CHB · PS/LS-PWM',
    state: { levels: 5, method: 'ps', ma: .9, mf: 10, vcell: 100, f1: 60, R: 10, Lm: 10, win: 1 },
    theory: THEORY.ml,
    controls: s => C.select('levels', 'Níveis', s.levels, [3, 5, 7, 9, 11].map(l => [l, `${l} níveis (${(l - 1) / 2} células)`])) + C.select('method', 'Modulação', s.method, ML_METHODS)
        + C.range('ma', 'mₐ', s.ma, 0, 1.3, .01) + C.range('mf', 'm<sub>f</sub> (por portadora)', s.mf, 2, 40, 1)
        + C.range('vcell', 'V<sub>célula</sub>', s.vcell, 20, 400, 10, ' V') + C.select('win', 'Janela', s.win, WINDOWS)
        + C.group('CARGA R-L', C.range('R', 'R', s.R, 1, 50, .5, ' Ω') + C.range('Lm', 'L', s.Lm, 0, 100, 1, ' mH')),
    cards: () => [
        { id: 'carriers', cap: 'Portadoras e referência. PS-PWM: uma portadora triangular por célula, deslocadas de 180°/n, cada célula compara ±v<sub>r</sub>. LS-PWM: L−1 portadoras empilhadas em faixas de amplitude. NLC: sem portadora, arredonda para o nível mais próximo.' },
        { id: 'vo', cap: 'Tensão de saída em escada (soma das células) e fundamental. Cada degrau vale V<sub>célula</sub>: menos dv/dt que um inversor de dois níveis com o mesmo barramento.' },
        { id: 'cells', cls: 'tall', cap: 'Saída de cada ponte H (−1, 0, +1 × V<sub>célula</sub>). Em PS-PWM todas trabalham igual; em LS-PWM e NLC as células externas só atuam perto do pico.' },
        { id: 'spec', cap: 'Espectro de v<sub>o</sub> normalizado por n·V<sub>célula</sub>. Tracejado: m<sub>f</sub> e 2n·m<sub>f</sub> (primeiro grupo da PS-PWM).' },
        { id: 'share', html: true, cap: 'Potência ativa entregue por célula (média de v<sub>k</sub>·i) e frequência média de comutação por braço. Desequilíbrio exige rotação de portadoras ou de células.' },
        { id: 'levelsweep', cap: 'THD de tensão e de corrente × número de níveis, com a modulação e o mₐ atuais (escala log).' },
    ],
    draw(s, ctx) {
        const r = P.multilevel({ levels: s.levels, ma: s.ma, mf: s.mf, method: s.method, vcell: s.vcell }), N = r.v.length, n = r.n, xs = msAxis(N, s.f1), win = s.win, X = { min: 0, max: 1000 / s.f1 * win, label: 't (ms)' };
        const i = P.rlCurrent(r.v, s.R, s.Lm / 1e3, s.f1), hv = P.harmonics(r.v), hi = P.harmonics(i), Vmax = n * s.vcell, hmax = Math.min(N / 4, Math.max(2 * n * s.mf + 2 * s.mf + 10, 60));
        const used = new Set(r.v).size, power = r.cells.map(c => { let a = 0; for (let k = 0; k < N; k++) a += c[k] * s.vcell * i[k]; return a / N; }), Ptot = power.reduce((a, b) => a + b, 0);
        const fsw = r.trans.map(t => t * s.f1 / 4);
        ctx.strip(metric('Níveis usados', `${used} de ${s.levels}`, `${n} células × ${s.vcell} V`)
            + metric('Fundamental V̂₁', `${f1(hv.amp[1])} V`, `teoria mₐ·n·V<sub>cél</sub> = ${f1(s.ma * Vmax)} V`)
            + metric('THD tensão', pct(P.thd(hv.amp)), `WTHD ${pct(P.wthd(hv.amp), 2)}`)
            + metric('THD corrente', pct(P.thd(hi.amp), 2), `I₁ = ${f1(hi.amp[1] / Math.SQRT2, 2)} A<sub>rms</sub>`)
            + metric('f<sub>chave</sub> média por braço', `${f1(P.mean(fsw), 0)} Hz`, s.method === 'ps' ? `aparente ${f1(2 * n * s.mf * s.f1 / 1000, 2)} kHz` : `máx ${f1(Math.max(...fsw), 0)} · mín ${f1(Math.min(...fsw), 0)} Hz`)
            + metric('dv/dt por degrau', `${s.vcell} V`, `2 níveis: ${2 * Vmax} V`));
        const series = [];
        r.carriers.forEach((c, k) => series.push({ points: line(c, xs, win, 2000), color: PALETTE[(k % 8) + 2], width: 1, alpha: .6 }));
        series.push({ points: line(r.ref, xs, win), color: PALETTE[0], width: 2.4 });
        if (s.method === 'ps') series.push({ points: line(r.ref, xs, win, 2400, -1), color: PALETTE[1], width: 1.6, dash: [5, 3] });
        if (s.method === 'nlc') series.push({ points: steps(r.v, xs, win, 1 / Vmax), color: PALETTE[1], width: 1.6, step: true });
        plot(ctx.cv('carriers'), { title: `${ML_METHODS.find(m => m[0] === s.method)[1]} · ${r.carriers.length} portadoras`, x: X, y: { min: -Math.max(1.1, s.ma * 1.05), max: Math.max(1.1, s.ma * 1.05), label: 'normalizado' }, series,
            hlines: s.method === 'ps' ? [] : Array.from({ length: 2 * n - 1 }, (_, k) => ({ y: -1 + (k + 1) / n, color: GREY, dash: [1, 4] })) });
        plot(ctx.cv('vo'), { title: `v_o(t) · ${used} níveis · THD ${pct(P.thd(hv.amp))}`, x: X, y: { ...sym(Vmax, 1.12), label: 'V' },
            series: [{ points: steps(r.v, xs, win), color: PALETTE[0], width: 1.2, alpha: .7, step: true }, { points: line(fundamental(hv, N), xs, win), color: PALETTE[1], width: 2.2 }, { points: line(i, xs, win, 2400, Vmax * .8 / peakAbs(i)), color: PALETTE[2], width: 1.4, dash: [4, 3] }],
            legend: [{ label: 'v_o', color: PALETTE[0] }, { label: 'fundamental', color: PALETTE[1] }, { label: 'i_o (escala)', color: PALETTE[2] }] });
        const gap = 2.6;
        plot(ctx.cv('cells'), { title: 'Saída de cada célula', x: X, y: { min: -1.4, max: gap * (n - 1) + 1.4, label: '', format: () => '' },
            series: r.cells.map((c, k) => ({ points: steps(c, xs, win, 1, gap * (n - 1 - k)), color: PALETTE[k % 10], width: 1.5, step: true })),
            hlines: r.cells.map((_, k) => ({ y: gap * (n - 1 - k) + 1.12, label: `célula ${k + 1}`, color: PALETTE[k % 10], dash: [1, 999] })) });
        plot(ctx.cv('spec'), { title: `Espectro de v_o · V̂₁ = ${f1(hv.amp[1] / Vmax, 3)}·nV_cél`, x: { min: 0, max: hmax + 1, label: 'ordem harmônica h' }, y: { min: 0, max: Math.max(.15, Math.min(1.2, hv.amp[1] / Vmax * 1.1)), label: 'V̂_h / (n·V_cél)' },
            stems: [{ points: stemsOf(hv.amp, hmax, Vmax, 2), color: PALETTE[0], width: 1.4 }, { points: [[1, hv.amp[1] / Vmax]], color: PALETTE[1], width: 3 }],
            vlines: s.method === 'nlc' ? [] : [s.mf, 2 * n * s.mf].filter(x => x <= hmax).map(x => ({ x, color: GREY, dash: [2, 4] })) });
        const pmax = Math.max(...power.map(Math.abs), 1e-9);
        ctx.html('share', `<h4>Divisão de potência · total ${f1(Ptot)} W</h4><table class="mini"><tr><th>célula</th><th>potência</th><th></th><th>f<sub>chave</sub>/braço</th></tr>${power.map((p, k) => `<tr><td>${k + 1}</td><td>${f1(p)} W (${pct(Ptot ? p / Ptot : 0, 0)})</td><td style="width:45%"><div class="bar" style="width:${Math.max(0, 100 * p / pmax)}%;background:${PALETTE[k % 10]}"></div></td><td>${f1(fsw[k], 0)} Hz</td></tr>`).join('')}</table>`);
        const sweep = cached(`ml-${s.method}-${s.ma}-${s.mf}-${s.R}-${s.Lm}`, () => [3, 5, 7, 9, 11, 13].map(L => { const m = P.multilevel({ levels: L, ma: s.ma, mf: s.mf, method: s.method, vcell: 1, N: 1 << 13 }), h = P.harmonics(m.v), hc = P.harmonics(P.rlCurrent(m.v, s.R, s.Lm / 1e3, s.f1)); return [L, P.thd(h.amp), P.thd(hc.amp)]; }));
        plot(ctx.cv('levelsweep'), { title: 'THD × níveis', x: { min: 2, max: 14, label: 'níveis L', ticks: 6 }, y: { min: -2, max: 2, log: true, label: 'THD (%)' },
            bars: sweep.flatMap(([L, tv, ti]) => [{ x0: L - .7, x1: L - .05, y: Math.max(1e-2, tv * 100), color: PALETTE[0], alpha: L === s.levels ? 1 : .5 }, { x0: L + .05, x1: L + .7, y: Math.max(1e-2, ti * 100), color: PALETTE[2], alpha: L === s.levels ? 1 : .5 }]),
            legend: [{ label: 'THD tensão', color: PALETTE[0] }, { label: 'THD corrente', color: PALETTE[2] }] });
    },
};

// ======================================================================
// 4. Line rectifiers and power factor
// ======================================================================
const RECT_TOPOS = [['diode1', 'Ponte de diodos + C (1φ)'], ['scr1', 'Ponte tiristorizada (1φ)'], ['scr3', 'Ponte tiristorizada 6 pulsos (3φ)']];
function runRect(s, coarse = false) {
    const q = coarse ? { spc: 1024, sub: 4 } : {};
    if (s.topo === 'diode1') return P.diodeBridge({ vrms: s.vrms, f: s.f, Ls: s.Ls / 1e3, C: s.C / 1e6, R: s.R, ...(coarse ? { spc: 2048, sub: 4, cycles: 18 } : {}) });
    if (s.topo === 'scr1') return P.scrSingle({ vrms: s.vrms, f: s.f, alphaDeg: s.alpha, R: s.R, L: s.Lm / 1e3, ...q });
    return P.scrThree({ vll: s.vrms, f: s.f, alphaDeg: s.alpha, R: s.R, L: s.Lm / 1e3, ...q });
}
const ret = {
    id: 'ret', nav: 'Retificadores', sub: 'CA-CC · FP',
    state: { topo: 'diode1', vrms: 127, f: 60, C: 1000, Ls: .5, R: 20, alpha: 30, Lm: 100 },
    structural: ['topo'],
    onChange(s, key) { if (key === 'topo') { const three = s.topo === 'scr3'; if (three && s.vrms < 200) s.vrms = 220; if (!three && s.vrms > 220) s.vrms = 220; } },
    theory: THEORY.ret,
    controls: s => C.select('topo', 'Topologia', s.topo, RECT_TOPOS)
        + C.select('vrms', s.topo === 'scr3' ? 'V<sub>linha</sub>' : 'V<sub>rede</sub>', s.vrms, (s.topo === 'scr3' ? [220, 380] : [127, 220]).map(v => [v, `${v} V`])) + C.select('f', 'f', s.f, [[50, '50 Hz'], [60, '60 Hz']])
        + (s.topo === 'diode1' ? C.range('C', 'C', s.C, 47, 4700, 1, ' µF') + C.range('Ls', 'L<sub>s</sub> (linha)', s.Ls, .05, 30, .05, ' mH') + C.range('R', 'R<sub>carga</sub>', s.R, 5, 200, 1, ' Ω')
            : C.range('alpha', 'α (disparo)', s.alpha, 0, 170, 1, '°') + C.range('R', 'R', s.R, 1, 100, .5, ' Ω') + C.range('Lm', 'L', s.Lm, 0, 1000, 5, ' mH')),
    cards: s => [
        { id: 'line', cap: s.topo === 'diode1' ? 'Corrente da rede (verde) e tensão da rede em escala (cinza). Ela só flui em pulsos perto do pico, quando |v<sub>s</sub>| supera a tensão do capacitor. Âmbar: fundamental de i<sub>s</sub>.' : 'Tensão da fase a (escala) e corrente de linha i<sub>a</sub>: retangular quando L é grande, deslocada α da tensão. Âmbar: fundamental, atrasada de φ₁ ≈ α.' },
        { id: 'dc', cap: s.topo === 'diode1' ? 'Tensão no capacitor (saída CC) e |v<sub>s</sub>|. O capacitor carrega no pico e descarrega na carga: ripple ΔV ≈ V<sub>o</sub>/(2fRC).' : 'Tensão retificada v<sub>d</sub> (azul), sua média (tracejado) e a corrente da carga (verde, em escala). α atrasa a entrada de cada par de tiristores.' },
        { id: 'spec', cap: 'Harmônicos da corrente de linha (A<sub>rms</sub>). Círculos vermelhos: limites IEC 61000-3-2 classe A (equipamentos até 16 A por fase; a norma é definida para 230 V).' },
        { id: 'pq', html: true, cap: 'Decomposição do fator de potência: FP = fator de distorção (I₁/I<sub>rms</sub>) × fator de deslocamento (cos φ₁). S² = P² + Q₁² + D².' },
        { id: 'sweep', cap: s.topo === 'diode1' ? 'Varredura do indutor de linha L<sub>s</sub> (PFC passivo): FP sobe, mas V<sub>o</sub> cai e o indutor fica grande e pesado.' : 'Tensão média × ângulo de disparo: teoria em condução contínua (linha) e simulação com a carga atual (pontos). Abaixo de 0: só com fonte na carga (modo inversor).' },
    ],
    draw(s, ctx) {
        const r = runRect(s), N = r.vs.length, xs = msAxis(N, s.f), X = { min: 0, max: 1000 / s.f, label: 't (ms)' };
        const pq = P.powerQuality(Array.from(r.vs), Array.from(r.is)), three = s.topo === 'scr3', hi = P.harmonics(r.is);
        const Vo = P.mean(r.vd), ripple = Math.max(...r.vo) - Math.min(...r.vo), Io = P.mean(r.io), Ptot = three ? 3 * pq.P : pq.P;
        const ipk = peakAbs(r.is), Vm = peakAbs(r.vs), crest = ipk / pq.Irms;
        const vd0 = s.topo === 'diode1' ? NaN : P.scrVd0(s.topo, s.vrms) * Math.cos(s.alpha * Math.PI / 180);
        ctx.strip(metric('Fator de potência', f1(pq.PF, 3), `DPF ${f1(pq.DPF, 3)} × DF ${f1(pq.DF, 3)}`)
            + metric('THD da corrente', pct(pq.thdI), `fator de crista ${f1(crest, 2)} (senoide: 1,41)`)
            + metric('V<sub>o</sub> médio', `${f1(Vo)} V`, s.topo === 'diode1' ? `pico da rede ${f1(Vm)} V` : `teoria CCM ${f1(vd0)} V`)
            + metric('Ripple', `${f1(ripple)} V<sub>pp</sub>`, `${pct(ripple / Math.max(1e-9, Vo))} de V<sub>o</sub>`)
            + metric('Potência', `${f1(Ptot)} W`, `I<sub>o</sub> = ${f1(Io, 2)} A`)
            + metric('Corrente de linha', `${f1(pq.Irms, 2)} A<sub>rms</sub>`, `pico ${f1(ipk, 2)} A · I₁ = ${f1(pq.I1, 2)} A`));
        const sc = ipk / Vm;
        plot(ctx.cv('line'), { title: `Rede · FP ${f1(pq.PF, 3)} · THDi ${pct(pq.thdI)}`, x: X, y: { ...sym(ipk, 1.2), label: 'A' },
            series: [{ points: line(r.vs, xs, 1, 2400, sc), color: GREY, width: 1.2, dash: [4, 3] }, { points: line(r.is, xs), color: PALETTE[2], width: 2 }, { points: line(fundamental(hi, N), xs), color: PALETTE[1], width: 1.4 }],
            legend: [{ label: `${three ? 'v_a' : 'v_s'} (escala)`, color: GREY }, { label: three ? 'i_a' : 'i_s', color: PALETTE[2] }, { label: 'fundamental', color: PALETTE[1] }] });
        if (s.topo === 'diode1') {
            plot(ctx.cv('dc'), { title: `Saída CC · ${f1(Vo)} V ± ${f1(ripple / 2)} V`, x: X, y: { min: 0, max: Vm * 1.1, label: 'V' },
                series: [{ points: line(r.vs.map(Math.abs), xs), color: GREY, width: 1, dash: [3, 3] }, { points: line(r.vo, xs), color: PALETTE[0], width: 2.2 }],
                hlines: [{ y: Vo, label: 'média', color: PALETTE[1] }], legend: [{ label: '|v_s|', color: GREY }, { label: 'v_o', color: PALETTE[0] }] });
        } else {
            const vmax = three ? s.vrms * Math.SQRT2 : Vm, imax = peakAbs(r.io);
            plot(ctx.cv('dc'), { title: `v_d · média ${f1(Vo)} V · α = ${s.alpha}°`, x: X, y: { min: -vmax * 1.1, max: vmax * 1.15, label: 'V  (i_d em escala)' },
                series: [{ points: line(r.vd, xs), color: PALETTE[0], width: 1.8 }, { points: line(r.io, xs, 1, 2400, vmax * .5 / imax), color: PALETTE[2], width: 1.8 }],
                hlines: [{ y: Vo, label: `média ${f1(Vo)} V`, color: PALETTE[1] }, { y: 0, color: GREY, dash: [1, 2] }], legend: [{ label: 'v_d', color: PALETTE[0] }, { label: `i_d (pico ${f1(imax, 1)} A)`, color: PALETTE[2] }] });
        }
        const hm = 25, lim = [];
        for (let h = 2; h <= hm; h++) { const l = P.iecClassA(h); if (l) lim.push({ x: h, y: l, color: RED, hollow: true, size: 3 }); }
        const ymax = Math.ceil(Math.log10(Math.max(pq.I1, 1e-3) * 1.5)), ymin = ymax - 4;
        plot(ctx.cv('spec'), { title: `Harmônicos de ${three ? 'i_a' : 'i_s'} · I₁ = ${f1(pq.I1, 2)} A`, x: { min: 0, max: hm + 1, label: 'ordem harmônica h' }, y: { min: ymin, max: ymax, log: true, label: 'I_h (A rms)' },
            bars: pq.harm.slice(1, hm + 1).map((a, k) => ({ x0: k + 1 - .35, x1: k + 1 + .35, y: Math.max(a, 10 ** ymin), color: k === 0 ? PALETTE[1] : PALETTE[0] })), markers: lim,
            legend: [{ label: 'I_h medido', color: PALETTE[0] }, { label: 'limite IEC classe A', color: RED }] });
        const k3 = three ? 3 : 1;
        ctx.html('pq', `<h4>Potências${three ? ' (total trifásico)' : ''}</h4><table class="mini">
            <tr><td>Potência ativa P</td><td>${f1(k3 * pq.P)} W</td></tr><tr><td>Aparente S = V·I<sub>rms</sub></td><td>${f1(k3 * pq.S)} VA</td></tr>
            <tr><td>Reativa da fundamental Q₁</td><td>${f1(k3 * pq.Q1)} var</td></tr><tr><td>Distorção D</td><td>${f1(k3 * pq.D)} VA</td></tr>
            <tr><td>FP = P/S</td><td><b>${f1(pq.PF, 3)}</b></td></tr><tr><td>Deslocamento cos φ₁</td><td>${f1(pq.DPF, 3)} (φ₁ = ${f1(pq.phiDeg)}°)</td></tr>
            <tr><td>Distorção I₁/I<sub>rms</sub></td><td>${f1(pq.DF, 3)} = 1/√(1+THD²) = ${f1(1 / Math.sqrt(1 + pq.thdI ** 2), 3)}</td></tr>
            <tr><td>I₃ · I₅ · I₇</td><td>${f1(pq.harm[3], 2)} · ${f1(pq.harm[5], 2)} · ${f1(pq.harm[7], 2)} A</td></tr></table>
            <div class="pfbar"><span style="width:${100 * Math.max(0, pq.PF)}%">P</span><span style="width:${100 * Math.abs(pq.Q1) / pq.S}%">Q₁</span><span style="width:${100 * pq.D / pq.S}%">D</span></div><small>barras: P, |Q₁| e D como fração de S (não se somam linearmente: S² = P² + Q₁² + D²)</small>`);
        if (s.topo === 'diode1') {
            const lsList = [.05, .1, .2, .5, 1, 2, 5, 10, 20, 30];
            const sw = cached(`ls-${s.vrms}-${s.f}-${s.C}-${s.R}`, () => lsList.map(Ls => { const d = runRect({ ...s, Ls }, true), q = P.powerQuality(Array.from(d.vs), Array.from(d.is)); return [Ls, q.PF, P.mean(d.vo) / (s.vrms * Math.SQRT2), q.thdI]; }));
            plot(ctx.cv('sweep'), { title: 'PFC passivo: varredura de L_s', x: { min: .05, max: 30, log: true, label: 'L_s (mH)' }, y: { min: 0, max: 1.05, label: 'FP  ·  V_o/V_m' },
                series: [{ points: sw.map(p => [p[0], p[1]]), color: PALETTE[2], width: 2 }, { points: sw.map(p => [p[0], p[2]]), color: PALETTE[0], width: 1.6, dash: [5, 3] }],
                markers: [{ x: s.Ls, y: pq.PF, color: PALETTE[2], label: `FP ${f1(pq.PF, 2)}` }, { x: s.Ls, y: Vo / (s.vrms * Math.SQRT2), color: PALETTE[0] }],
                legend: [{ label: 'fator de potência', color: PALETTE[2] }, { label: 'V_o / V_m', color: PALETTE[0] }] });
        } else {
            const v0 = P.scrVd0(s.topo, s.vrms), pts = cached(`alpha-${s.topo}-${s.vrms}-${s.f}-${s.R}-${s.Lm}`, () => Array.from({ length: 12 }, (_, k) => { const a = k * 15; return [a, P.mean(runRect({ ...s, alpha: a }, true).vd)]; }));
            plot(ctx.cv('sweep'), { title: `V_d × α · V_d0 = ${f1(v0)} V`, x: { min: 0, max: 180, label: 'α (graus)' }, y: { min: -v0 * 1.05, max: v0 * 1.1, label: 'V_d (V)' },
                series: [{ points: Array.from({ length: 181 }, (_, a) => [a, v0 * Math.cos(a * Math.PI / 180)]), color: PALETTE[0], width: 2 }], hlines: [{ y: 0, color: GREY }],
                scatter: [{ points: pts, color: PALETTE[2], size: 6, alpha: .9 }], markers: [{ x: s.alpha, y: Vo, color: PALETTE[1], label: 'atual' }],
                legend: [{ label: 'teoria CCM: V_d0·cos α', color: PALETTE[0] }, { label: 'simulado (carga atual)', color: PALETTE[2] }] });
        }
    },
};

// ======================================================================
// 5. Boost PFC
// ======================================================================
const PFC_MODES = [['avg', 'Corrente média (PWM fixo)'], ['hyst', 'Histerese'], ['crm', 'Modo crítico (CrM)']];
const pfc = {
    id: 'pfc', nav: 'PFC ativo', sub: 'boost · malhas de controle',
    state: { mode: 'avg', vrms: 220, f: 60, P: 500, Vref: 400, Lm: 1, C: 330, fsw: 50, kc: .6, ff: true, fcv: 10, band: 20, zoomDeg: 90, compare: true },
    structural: ['mode'],
    onChange(s, key) { if (key === 'mode' && s.mode === 'crm' && s.Lm > .5) s.Lm = .3; if (key === 'mode' && s.mode !== 'crm' && s.Lm < .5) s.Lm = 1; },
    theory: THEORY.pfc,
    controls: s => C.select('mode', 'Controle de corrente', s.mode, PFC_MODES) + C.select('vrms', 'Rede', s.vrms, [[127, '127 V'], [220, '220 V']]) + C.select('f', 'f', s.f, [[50, '50 Hz'], [60, '60 Hz']])
        + C.range('P', 'P<sub>o</sub>', s.P, 100, 1500, 25, ' W') + C.range('Vref', 'V<sub>ref</sub>', s.Vref, 340, 450, 5, ' V')
        + C.range('Lm', 'L', s.Lm, .05, 5, .05, ' mH') + C.range('C', 'C', s.C, 47, 1000, 1, ' µF')
        + C.group('MALHA DE CORRENTE', s.mode === 'avg' ? C.range('fsw', 'f<sub>s</sub>', s.fsw, 10, 150, 5, ' kHz') + C.range('kc', 'k<sub>c</sub>', s.kc, 0, 1.5, .05) + C.check('ff', 'feedforward d = 1 − |v<sub>s</sub>|/V<sub>o</sub>', s.ff)
            : s.mode === 'hyst' ? C.range('band', 'banda h', s.band, 5, 60, 1, '% de Î') : '<span class="hint">t<sub>on</sub> definido pela malha de tensão</span>')
        + C.group('MALHA DE TENSÃO', C.range('fcv', 'banda', s.fcv, 1, 60, 1, ' Hz'))
        + C.group('VISUALIZAÇÃO', C.range('zoomDeg', 'zoom em', s.zoomDeg, 5, 175, 1, '°') + C.check('compare', 'comparar sem PFC', s.compare)),
    cards: () => [
        { id: 'line', cap: 'Corrente de entrada após o filtro EMI (azul) e referência i<sub>ref</sub> = Î·|sen ωt| com a polaridade da rede (âmbar). Faixa clara: envoltória do ripple do indutor. Cinza: ponte de diodos + capacitor sem PFC, mesma potência.' },
        { id: 'zoom', cap: 'Zoom em poucos períodos de chaveamento no ângulo escolhido: i<sub>L</sub> sobe com inclinação |v<sub>s</sub>|/L com a chave fechada e desce com (V<sub>o</sub> − |v<sub>s</sub>|)/L com ela aberta. Embaixo: comando da chave.' },
        { id: 'loop', html: true, cap: 'Diagrama das duas malhas com os valores atuais. A malha de tensão (lenta) define a amplitude; a de corrente (rápida) impõe a forma senoidal.' },
        { id: 'duty', cap: 'Razão cíclica média em cada instante (azul) × o feedforward ideal 1 − |v<sub>s</sub>|/V<sub>o</sub> (âmbar). Perto do cruzamento por zero, d → 1; no pico, d é mínimo.' },
        { id: 'vo', cap: 'Tensão de saída: ripple em 2f, porque a potência de entrada pulsa como sen² e a de saída é constante. Tracejado: V<sub>ref</sub>. Verde: Î de saída da malha de tensão (escala à direita no título).' },
        { id: 'spec', cap: 'Harmônicos da corrente de entrada (A<sub>rms</sub>, escala log) com e sem PFC, e limites IEC 61000-3-2 classe D (vermelho, mA/W × P) e classe A (âmbar).' },
    ],
    draw(s, ctx) {
        const L = s.Lm / 1e3, Cf = s.C / 1e6, Vm = s.vrms * Math.SQRT2;
        if (s.Vref <= Vm * 1.05) { ctx.strip(metric('Atenção', 'V<sub>ref</sub> ≤ V<sub>m</sub>', `o boost exige V<sub>o</sub> > ${f1(Vm)} V`)); }
        const r = cached(`pfc-${JSON.stringify(s)}`, () => P.boostPfc({ vrms: s.vrms, f: s.f, L, C: Cf, P: s.P, Vref: Math.max(s.Vref, Vm * 1.05), fsw: s.fsw * 1e3, mode: s.mode, kc: s.kc, ff: s.ff, fcv: s.fcv, band: s.band / 100, zoomDeg: s.zoomDeg }));
        const N = r.vs.length, xs = msAxis(N, s.f), X = { min: 0, max: 1000 / s.f, label: 't (ms)' };
        const pq = P.powerQuality(Array.from(r.vs), Array.from(r.is));
        const base = s.compare ? cached(`nopfc-${s.vrms}-${s.f}-${s.C}-${s.P}`, () => P.diodeBridge({ vrms: s.vrms, f: s.f, Ls: .2e-3, C: Cf, R: Vm * Vm / s.P, cycles: 20, spc: N, sub: 8 })) : null;
        const pqb = base && P.powerQuality(Array.from(base.vs), Array.from(base.is));
        const Vo = P.mean(r.vo), ripple = Math.max(...r.vo) - Math.min(...r.vo);
        ctx.strip(metric('Fator de potência', f1(pq.PF, 4), base ? `sem PFC: ${f1(pqb.PF, 3)}` : `DPF ${f1(pq.DPF, 4)}`)
            + metric('THD da corrente', pct(pq.thdI), base ? `sem PFC: ${pct(pqb.thdI, 0)}` : '')
            + metric('V<sub>o</sub>', `${f1(Vo)} V`, `ripple ${f1(ripple)} V<sub>pp</sub> · teoria ${f1(s.P / (P.TAU * s.f * Cf * Vo))} V`)
            + metric('Î (malha de tensão)', `${f1(r.ipk, 2)} A`, `ideal 2P/V<sub>m</sub> = ${f1(2 * s.P / Vm, 2)} A`)
            + metric('f<sub>s</sub> média', `${f1(r.fswAvg / 1000, 1)} kHz`, s.mode === 'avg' ? 'fixa' : 'varia ao longo do ciclo')
            + metric('Condução contínua', pct(r.ccm, 0), 'fração do ciclo em CCM')
            + metric('P de entrada', `${f1(pq.P)} W`, `I<sub>rms</sub> ${f1(pq.Irms, 2)} A`));
        const sg = Array.from(r.vs, Math.sign), ipk = Math.max(peakAbs(r.ilMax), base ? peakAbs(base.is) : 0);
        const env = arr => line(Float64Array.from(arr, (v, k) => v * sg[k]), xs, 1, 1600);
        const series = [];
        if (base) series.push({ points: line(base.is, xs), color: GREY, width: 1.4, alpha: .8 });
        series.push({ points: env(r.ilMax), color: PALETTE[0], width: 1, alpha: .35 }, { points: env(r.ilMin), color: PALETTE[0], width: 1, alpha: .35 },
            { points: line(r.vs, xs, 1, 1200, peakAbs(r.is) / Vm), color: GREY, width: 1, dash: [2, 3] },
            { points: line(r.is, xs), color: PALETTE[0], width: 2.2 }, { points: line(Float64Array.from(r.iref, (v, k) => v * sg[k]), xs), color: PALETTE[1], width: 1.4, dash: [5, 3] });
        plot(ctx.cv('line'), { title: `Corrente de entrada · FP ${f1(pq.PF, 4)} · THD ${pct(pq.thdI)}`, x: X, y: { ...sym(ipk, 1.12), label: 'A' }, series,
            vlines: [{ x: s.zoomDeg / 360 * 1000 / s.f, color: PALETTE[3] }, { x: (s.zoomDeg + 180) / 360 * 1000 / s.f, color: PALETTE[3] }],
            legend: [...(base ? [{ label: 'sem PFC', color: GREY }] : []), { label: 'i_s (filtrada)', color: PALETTE[0] }, { label: 'i_ref', color: PALETTE[1] }, { label: 'v_s (escala)', color: GREY, dash: true }] });
        const z = r.zoom, zt = z.t.map(t => t * 1e6), zmax = Math.max(1e-3, ...z.iL, ...z.iref) * 1.1, gate = z.g.map((g, k) => [zt[k], -zmax * .32 + g * zmax * .2]);
        plot(ctx.cv('zoom'), { title: `i_L em ${s.zoomDeg}° · |v_s| = ${f1(Vm * Math.abs(Math.sin(s.zoomDeg * Math.PI / 180)))} V`, x: { min: zt[0] ?? 0, max: zt.at(-1) ?? 1, label: 't (µs)' }, y: { min: -zmax * .38, max: zmax, label: 'A' },
            series: [{ points: zt.map((t, k) => [t, z.iref[k]]), color: PALETTE[1], width: 1.4, dash: [5, 3] }, ...(s.mode === 'hyst' ? [1, -1].map(sg2 => ({ points: zt.map((t, k) => [t, z.iref[k] + sg2 * s.band / 100 * 2 * s.P / Vm / 2]), color: PALETTE[1], width: 1, dash: [2, 3], alpha: .6 })) : []),
                { points: zt.map((t, k) => [t, z.iL[k]]), color: PALETTE[0], width: 2 }, { points: gate, color: PALETTE[2], width: 1.4, step: true }],
            hlines: [{ y: 0, color: GREY, dash: [1, 2] }, { y: -zmax * .06, label: 'chave', color: PALETTE[2], dash: [1, 999] }],
            legend: [{ label: 'i_L', color: PALETTE[0] }, { label: s.mode === 'crm' ? 'pico 2·i_ref' : 'i_ref', color: PALETTE[1] }, { label: 'gatilho', color: PALETTE[2] }] });
        drawLoop(ctx, s, r, Vo);
        const duty = P.movingAverage(r.duty, Math.max(1, Math.round(2 * N * s.f / Math.max(r.fswAvg, s.f))));
        plot(ctx.cv('duty'), { title: 'Razão cíclica ao longo do ciclo', x: X, y: { min: 0, max: 1.05, label: 'd' },
            series: [{ points: line(duty, xs), color: PALETTE[0], width: 1.8 }, { points: line(Float64Array.from(r.vs, (v, k) => 1 - Math.abs(v) / r.vo[k]), xs), color: PALETTE[1], width: 1.4, dash: [5, 3] }],
            legend: [{ label: 'd medida', color: PALETTE[0] }, { label: '1 − |v_s|/V_o', color: PALETTE[1] }] });
        plot(ctx.cv('vo'), { title: `v_o · ripple ${f1(ripple)} V_pp em ${2 * s.f} Hz`, x: X, y: { min: Math.min(...r.vo, s.Vref) - ripple * .4 - 1, max: Math.max(...r.vo, s.Vref) + ripple * .4 + 1, label: 'V' },
            series: [{ points: line(r.vo, xs), color: PALETTE[0], width: 2.2 }], hlines: [{ y: s.Vref, label: 'V_ref', color: PALETTE[1] }] });
        const hm = 39, lims = [];
        for (let h = 3; h <= hm; h += 2) { const d = P.iecClassD(h, s.P), a = P.iecClassA(h); if (d) lims.push({ x: h, y: d, color: RED, hollow: true, size: 3.2 }); if (a) lims.push({ x: h, y: a, color: PALETTE[1], hollow: true, size: 2.4 }); }
        const top = Math.ceil(Math.log10(Math.max(pq.I1, pqb?.I1 || 0) * 1.5));
        plot(ctx.cv('spec'), { title: `Harmônicos de i_s · I₃ = ${f1(pq.harm[3] * 1000, 0)} mA (limite D ${f1(P.iecClassD(3, s.P) * 1000, 0)} mA)`, x: { min: 0, max: hm + 1, label: 'ordem harmônica h' }, y: { min: top - 5, max: top, log: true, label: 'I_h (A rms)' },
            bars: [...(pqb ? pqb.harm.slice(1, hm + 1).map((a, k) => ({ x0: k + 1 - .45, x1: k + 1, y: Math.max(a, 10 ** (top - 5)), color: GREY, alpha: .6 })) : []),
                ...pq.harm.slice(1, hm + 1).map((a, k) => ({ x0: k + 1 - (pqb ? 0 : .35), x1: k + 1 + .4, y: Math.max(a, 10 ** (top - 5)), color: k === 0 ? PALETTE[1] : PALETTE[0] }))],
            markers: lims, legend: [{ label: 'com PFC', color: PALETTE[0] }, ...(pqb ? [{ label: 'sem PFC', color: GREY }] : []), { label: 'limite classe D', color: RED }, { label: 'limite classe A', color: PALETTE[1] }] });
    },
};
// Control block diagram (SVG) with live values.
function drawLoop(ctx, s, r, Vo) {
    const inner = { avg: [`PWM ${s.fsw} kHz`, s.ff ? 'd = d_ff + kc·e·Lfs/Vo' : 'd = kc·e·Lfs/Vo'], hyst: ['Histerese', `±${f1(s.band / 2, 0)}% de Î`], crm: ['Tempo ligado', 'religa em i_L = 0'] }[s.mode];
    const box = (x, y, w, h, t1, t2 = '', cls = '') => `<g class="${cls}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/><text x="${x + w / 2}" y="${y + (t2 ? h / 2 - 3 : h / 2 + 4)}">${t1}</text>${t2 ? `<text class="sub" x="${x + w / 2}" y="${y + h / 2 + 11}">${t2}</text>` : ''}</g>`;
    const sum = (x, y) => `<circle class="sum" cx="${x}" cy="${y}" r="9"/><text x="${x}" y="${y + 4}">Σ</text><text class="sign" x="${x - 14}" y="${y - 6}">+</text><text class="sign" x="${x + 12}" y="${y + 22}">−</text>`;
    const wire = pts => `<polyline class="wire" points="${pts}" marker-end="url(#ah)"/>`;
    const val = (x, y, t) => `<text class="val" x="${x}" y="${y}">${t}</text>`;
    ctx.html('loop', `<svg class="loop" viewBox="0 0 680 232" role="img" aria-label="Diagrama das malhas de controle do PFC">
        <defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z"/></marker></defs>
        ${val(6, 30, `V_ref = ${s.Vref} V`)}${wire('6,40 111,40')}${sum(120, 40)}
        ${wire('129,40 195,40')}${val(133, 32, `e = ${f1(s.Vref - Vo, 1)} V`)}
        ${box(195, 22, 100, 36, 'PI de tensão', `banda ${s.fcv} Hz`, 'slow')}
        ${wire('295,40 365,40')}${val(301, 32, `Î = ${f1(r.ipk, 2)} A`)}
        ${box(365, 22, 36, 36, '×')}
        ${box(333, 92, 100, 34, '|sen ωt|', `de v_s (${s.vrms} V)`)}${wire('383,92 383,58')}
        ${wire('401,40 455,40')}${val(409, 32, 'i_ref')}${sum(464, 40)}
        ${wire('473,40 505,40')}
        ${box(505, 22, 150, 36, inner[0], inner[1], 'fast')}
        ${wire('640,58 640,110')}${val(646, 88, 'gate')}
        ${box(545, 110, 120, 46, 'Boost', `L ${s.Lm} mH · C ${s.C} µF`)}
        ${wire('575,156 575,180 464,180 464,49')}${val(472, 174, `i_L (máx ${f1(Math.max(...r.ilMax), 1)} A)`)}
        ${wire('655,156 655,215 120,215 120,49')}${val(300, 209, `v_o = ${f1(Vo, 1)} V`)}
        <text class="tag slow" x="245" y="76">MALHA LENTA</text><text class="tag fast" x="580" y="76">MALHA RÁPIDA</text>
    </svg>`);
}

// ======================================================================
// Shell: navigation, controls, redraw
// ======================================================================
const LESSONS = [pwm, tri, ml, ret, pfc];
const main = $('#lesson');
let current = LESSONS[0], pending = 0;
const parseValue = el => el.type === 'checkbox' ? el.checked : el.value !== '' && Number.isFinite(+el.value) ? +el.value : el.value;

function renderNav() {
    $('#lesson-nav').innerHTML = LESSONS.map((l, i) => `<button data-lesson="${l.id}" class="${l === current ? 'active' : ''}">${i + 1} · ${l.nav}<small>${l.sub}</small></button>`).join('');
}
// KaTeX loads with defer before this module; without it (offline) the LaTeX source stays visible.
function typeset(el) {
    if (!window.renderMathInElement) return;
    window.renderMathInElement(el, { delimiters: [{ left: '\\[', right: '\\]', display: true }, { left: '\\(', right: '\\)', display: false }], throwOnError: false });
}
function renderLesson() {
    const L = current, s = L.state;
    main.className = `lesson lesson-${L.id}`;
    main.innerHTML = `<article class="theory">${L.theory(s)}</article><section class="work"><div class="ofdm-controls">${L.controls(s)}</div><div class="ofdm-strip" data-strip></div><div class="plots-grid">${L.cards(s).map(card).join('')}</div></section>`;
    typeset($('.theory', main));
    update();
}
function update() {
    current.draw(current.state, {
        cv: id => $(`[data-plot="${id}"]`, main),
        html: (id, h) => { const e = $(`[data-html="${id}"]`, main); if (e) e.innerHTML = h; },
        strip: h => { $('[data-strip]', main).innerHTML = h; },
    });
}
const scheduleUpdate = () => { if (!pending) pending = requestAnimationFrame(() => { pending = 0; update(); }); };
function show(id) {
    current = LESSONS.find(l => l.id === id) || LESSONS[0];
    renderNav(); renderLesson();
}

function init() {
    const root = document.documentElement;
    try { root.dataset.theme = localStorage.getItem('commslab-theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'); } catch { root.dataset.theme = 'dark'; }
    $('#theme-btn').onclick = () => { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('commslab-theme', root.dataset.theme); } catch { /* ignore */ } update(); };
    $('#lesson-nav').addEventListener('click', e => { const b = e.target.closest('[data-lesson]'); if (b) location.hash = b.dataset.lesson; });
    addEventListener('hashchange', () => show(location.hash.slice(1)));
    main.addEventListener('input', e => {
        const el = e.target;
        if (!el.dataset.k || el.type !== 'range') return;
        current.state[el.dataset.k] = +el.value;
        el.nextElementSibling.textContent = `${el.value}${el.dataset.unit || ''}`;
        scheduleUpdate();
    });
    main.addEventListener('change', e => {
        const el = e.target, L = current;
        if (!el.dataset.k || el.type === 'range') return;
        L.state[el.dataset.k] = parseValue(el);
        L.onChange?.(L.state, el.dataset.k);
        if (L.structural?.includes(el.dataset.k)) renderLesson(); else update();
    });
    let resize = 0;
    addEventListener('resize', () => { clearTimeout(resize); resize = setTimeout(update, 120); });
    addEventListener('load', () => typeset($('.theory', main)));
    show(location.hash.slice(1) || 'pwm');
}
init();
