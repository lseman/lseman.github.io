// Camada física: guided digital-communications lessons (modulation, BER, FEC, fading, beamforming, OFDM, MCS)
// built on dsp.mjs (theory + Monte Carlo) and the Wi-Fi PHY model shared with the network lab.
import { plot, PALETTE } from './charts.mjs';
import * as D from './dsp.mjs';
import { MCS, STANDARDS, STANDARD_ORDER, requiredSnr, packetErrorRate, dataRate, CODING_GAIN_DB, mcsValid } from './phy.mjs';
import { renderOfdm, defaultOfdmState } from './ofdm-view.mjs';
import { THEORY } from './fisica-teoria.mjs';

const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const sci = v => !Number.isFinite(v) ? '—' : v === 0 ? '0' : v >= .01 ? v.toFixed(3) : v.toExponential(1);
const f1 = (v, d = 1) => Number.isFinite(v) ? v.toFixed(d) : '—';
const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const RED = '#fb7185', GREY = '#94a3b8';
const metric = (label, value, small = '') => `<div class="metric"><span>${label}</span><strong>${value}</strong>${small ? `<small>${small}</small>` : ''}</div>`;
const sweep = (from, to, step, f) => { const out = []; for (let x = from; x <= to + 1e-9; x += step) out.push([x, f(x)]); return out; };
// Log axes clamp values below the floor onto the bottom edge; keep one point past it so the curve just exits the plot.
const aboveFloor = (points, minExp) => { const f = 10 ** minExp; return points.filter((p, i) => p[1] >= f || points[i - 1]?.[1] >= f || points[i + 1]?.[1] >= f); };
const parseMod = key => ({ family: key.slice(0, 3), M: +key.slice(3) });

const C = {
    range: (key, label, value, min, max, step, unit = '') => `<label class="range">${label}<input type="range" data-k="${key}" min="${min}" max="${max}" step="${step}" value="${value}" data-unit="${esc(unit)}"><output>${value}${unit}</output></label>`,
    select: (key, label, value, options) => `<label>${label} <select data-k="${key}">${options.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${String(v) === String(value) ? 'selected' : ''}>${esc(l)}</option>`; }).join('')}</select></label>`,
    check: (key, label, value) => `<label><input type="checkbox" data-k="${key}" ${value ? 'checked' : ''}> ${label}</label>`,
    button: (act, label, cls = '') => `<button class="btn ${cls}" data-act="${act}">${label}</button>`,
    group: (title, html) => `<div class="ctl-group"><span>${title}</span>${html}</div>`,
};
const card = ({ id, cap, cls = '', html = false }) => `<div class="plot-card ${cls}">${html ? `<div class="html" data-html="${id}"></div>` : `<canvas data-plot="${id}"></canvas>`}<div class="cap">${cap}</div></div>`;

// ---------- Monte Carlo job runner (time-sliced so the page stays responsive) ----------
let job = null;
function runJobs(list, onTick) {
    stopJobs();
    const token = job = { i: 0, st: null, cancelled: false };
    const tick = () => {
        if (token.cancelled) return;
        const t0 = performance.now();
        while (performance.now() - t0 < 45 && token.i < list.length) {
            const j = list[token.i];
            if (!token.st && j.skip?.()) { token.i++; continue; }
            token.st = j.run(token.st, 20);
            if (token.st.done) { j.result(token.st); token.st = null; token.i++; }
        }
        const finished = token.i >= list.length;
        if (finished) job = null;
        onTick(token.i, list.length, finished);
        if (!finished) setTimeout(tick, 0);
    };
    setTimeout(tick, 0);
}
function stopJobs() { if (job) job.cancelled = true; job = null; }
function progress(done, total, finished) {
    const p = $('[data-progress]'), b = $('[data-act="run"]');
    if (p) p.textContent = finished ? (total ? 'concluído' : '') : `simulando… ${done}/${total} pontos`;
    if (b) b.textContent = finished ? 'Rodar Monte Carlo' : 'Parar';
    update();
}
const mcButtons = () => `${C.button('run', job ? 'Parar' : 'Rodar Monte Carlo', 'primary')}${C.button('clear', 'Limpar pontos')}<span class="progress" data-progress></span>`;
const mcMarkers = (pts, color, hollow = false) => (pts || []).filter(p => p.errors > 0).map(p => ({ x: p.x, y: p.ber, color, size: 3.5, hollow }));
const mcSeries = (pts, color, dash = []) => ({ points: (pts || []).filter(p => p.errors > 0).map(p => [p.x, p.ber]), color, width: 1.2, dash, alpha: .7 });
// Eb/N0 where a measured curve crosses target (log-linear interpolation between neighbouring points).
// A point with no errors only bounds the crossing from above: { x, bound: true }.
function crossing(pts, target) {
    const p = (pts || []).slice().sort((a, b) => a.x - b.x);
    for (let i = 1; i < p.length; i++) if (p[i - 1].errors && p[i - 1].ber >= target && (!p[i].errors || p[i].ber < target)) {
        if (!p[i].errors) return { x: p[i].x, bound: true };
        const a = Math.log10(p[i - 1].ber), b = Math.log10(p[i].ber), t = (Math.log10(target) - a) / (b - a);
        return { x: p[i - 1].x + t * (p[i].x - p[i - 1].x), bound: false };
    }
    return null;
}
const gainCell = (ref, c) => c ? `${c.bound ? '≥ ' : ''}${f1(ref - c.x)} dB` : '—';

// ======================================================================
// 1. Modulation: constellations, Gray labelling, decision regions, impairments
// ======================================================================
const mod = {
    id: 'mod', nav: 'Modulação', sub: 'PSK · QAM · Gray',
    state: { family: 'qam', M: 16, mapping: 'gray', ref: 'es', snrDb: 18, symbols: 3000, phaseDeg: 0, cfoDeg: 0, iqGainDb: 0, iqPhaseDeg: 0, pa: 'off', labels: true, regions: true, seed: 1 },
    structural: ['family', 'ref'],
    normalize(s) { const list = D.FAMILIES[s.family]; if (!list.includes(s.M)) s.M = list.reduce((a, b) => Math.abs(Math.log2(b / s.M)) < Math.abs(Math.log2(a / s.M)) ? b : a); },
    onChange(s, key) { if (key === 'ref') { const k = D.lin2db(Math.log2(s.M)); s.snrDb = Math.round((s.ref === 'eb' ? s.snrDb - k : s.snrDb + k) * 2) / 2; } },
    theory: THEORY.mod,
    controls: s => C.select('family', 'Família', s.family, [['psk', 'PSK'], ['qam', 'QAM']])
        + C.select('M', 'Ordem', s.M, D.FAMILIES[s.family].map(M => [M, D.schemeLabel(s.family, M)]))
        + C.select('mapping', 'Rótulos', s.mapping, [['gray', 'Gray'], ['natural', 'Binário natural']])
        + C.select('ref', 'Referência', s.ref, [['es', 'Es/N0 (por símbolo)'], ['eb', 'Eb/N0 (por bit)']])
        + C.range('snrDb', s.ref === 'es' ? 'Es/N0' : 'Eb/N0', s.snrDb, -5, 40, .5, ' dB')
        + C.range('symbols', 'Símbolos', s.symbols, 200, 20000, 200)
        + C.check('regions', 'Regiões', s.regions) + C.check('labels', 'Bits', s.labels)
        + C.button('reseed', 'Nova realização')
        + C.group('IMPERFEIÇÕES', C.range('phaseDeg', 'Fase', s.phaseDeg, -45, 45, 1, '°') + C.range('cfoDeg', 'CFO', s.cfoDeg, 0, 1, .01, '°/símb')
            + C.range('iqGainDb', 'IQ ganho', s.iqGainDb, 0, 3, .1, ' dB') + C.range('iqPhaseDeg', 'IQ fase', s.iqPhaseDeg, 0, 20, .5, '°')
            + C.select('pa', 'PA', s.pa, [['off', 'linear'], [10, 'backoff 10 dB'], [6, 'backoff 6 dB'], [3, 'backoff 3 dB'], [1, 'backoff 1 dB'], [0, 'backoff 0 dB']])),
    cards: () => [
        { id: 'const', cls: 'tall', cap: 'Pontos recebidos: azul = decidido certo, vermelho = erro de símbolo. Círculos: pontos ideais com seus rótulos de bits. Tracejado: fronteiras de decisão (ponto mais próximo). Setas: alguns erros, do símbolo enviado até onde o ruído o levou.' },
        { id: 'wave', cls: 'tall', cap: 'Os mesmos símbolos no tempo. Cada intervalo carrega k bits: I(t) e Q(t) são as amplitudes em banda base e s(t) = I·cos − Q·sin é o sinal na portadora (aqui com 2 ciclos por símbolo). Em PSK a amplitude de s(t) é constante; em QAM ela varia.' },
        { id: 'ber', cap: 'Teoria AWGN (Gray) da modulação escolhida e de referências. Ponto cheio: BER medida nesta realização. Com imperfeições ligadas, o ponto se afasta da curva: a diferença horizontal é a perda de implementação em dB.' },
        { id: 'bitpos', cap: 'BER de cada posição do rótulo (bit mais significativo à esquerda). Em QAM Gray, a primeira metade dos bits vem do eixo I e a segunda do eixo Q; os bits de "sinal" são mais protegidos.' },
    ],
    actions: { reseed(s) { s.seed++; } },
    draw(s, ctx) {
        const k = Math.log2(s.M), esn0Db = s.ref === 'es' ? s.snrDb : s.snrDb + D.lin2db(k), ebn0Db = esn0Db - D.lin2db(k);
        const imp = { phaseDeg: s.phaseDeg, cfoDeg: s.cfoDeg, iqGainDb: s.iqGainDb, iqPhaseDeg: s.iqPhaseDeg, paBackoffDb: s.pa === 'off' ? Infinity : +s.pa };
        const run = D.constellationRun({ family: s.family, M: s.M, mapping: s.mapping, esn0Db, symbols: s.symbols, seed: s.seed, ...imp }), c = run.c;
        const serT = D.theorySer(s.family, s.M, D.db2lin(esn0Db)), berT = D.theoryBer(s.family, s.M, D.db2lin(ebn0Db));
        const label = D.schemeLabel(s.family, s.M);
        ctx.strip(metric('Bits por símbolo', `k = ${k}`, `${label} · ${s.mapping === 'gray' ? 'Gray' : 'binário natural'}`)
            + metric('Es/N0 · Eb/N0', `${f1(esn0Db)} / ${f1(ebn0Db)} dB`, `diferença 10·log₁₀(${k}) = ${f1(D.lin2db(k), 2)} dB`)
            + metric('SER medida · teórica', `${sci(run.ser)} · ${sci(serT)}`, `${run.symErr} símbolos errados em ${s.symbols}`)
            + metric('BER medida · teórica', `${sci(run.ber)} · ${sci(berT)}`, s.mapping === 'gray' ? 'teoria: Gray, aprox. vizinhos' : 'teoria vale só para Gray')
            + metric('BER/SER', run.symErr ? f1(run.bitErr / run.symErr, 2) + ' bit' : '—', 'bits errados por símbolo errado (Gray → ≈ 1)')
            + metric('EVM', `${f1(100 * run.evm)}%`, `SNR efetiva ${f1(-20 * Math.log10(run.evm))} dB`)
            + metric('d<sub>min</sub> (Es = 1)', f1(c.dmin, 3), `d²<sub>min</sub>/Es = ${f1(c.dmin ** 2, 3)}`)
            + metric('PAPR da constelação', `${f1(D.lin2db(D.papr(c)), 2)} dB`, s.family === 'psk' ? 'envoltória constante' : 'pico/média'));
        drawConstellation(ctx.cv('const'), run, s, label, esn0Db);
        drawWave(ctx.cv('wave'), c, run.out.slice(0, 8).map(o => o.label));
        // Position on the BER curve.
        {
            const top = s.M >= 256 ? 36 : s.M >= 32 ? 28 : 20, series = [], legend = [];
            const refs = [['psk', 2, 'BPSK / QPSK'], [s.family, s.M, label]];
            const alt = s.family === 'qam' ? (D.FAMILIES.psk.includes(s.M) && s.M > 4 ? ['psk', s.M] : null) : (D.FAMILIES.qam.includes(s.M) && s.M > 4 ? ['qam', s.M] : null);
            if (alt) refs.push([...alt, D.schemeLabel(...alt)]);
            refs.forEach(([f, M, l], i) => { const color = i === 0 ? GREY : i === 1 ? PALETTE[0] : PALETTE[3]; series.push({ points: aboveFloor(sweep(-2, top, .25, x => D.theoryBer(f, M, D.db2lin(x))), -6), color, width: i === 1 ? 2.2 : 1.3, dash: i === 1 ? [] : [5, 4] }); legend.push({ label: l, color }); });
            const floor = 1 / (s.symbols * k), measured = Math.max(run.ber, floor / 2);
            plot(ctx.cv('ber'), { title: `Onde você está na curva · ${label}`, x: { min: -2, max: top, label: 'Eb/N0 (dB)' }, y: { min: -6, max: 0, log: true, label: 'BER' }, series, legend,
                markers: [{ x: ebn0Db, y: Math.max(berT, 1e-7), color: PALETTE[0], hollow: true, label: 'teoria' }, { x: ebn0Db, y: measured, color: PALETTE[1], hollow: !run.bitErr, label: run.bitErr ? 'medida' : `0 erros (< ${sci(floor)})` }] });
        }
        // BER per bit position.
        {
            const errs = new Array(k).fill(0);
            for (const o of run.out) { const x = o.decided ^ o.label; for (let b = 0; b < k; b++) if ((x >> (k - 1 - b)) & 1) errs[b]++; }
            const ber = errs.map(e => e / s.symbols), floor = Math.floor(Math.log10(1 / s.symbols)) - 1;
            plot(ctx.cv('bitpos'), { title: `BER por posição de bit · média ${sci(run.ber)}`, x: { min: -.5, max: k - .5, ticks: k, label: 'posição no rótulo (b₁ = mais significativo)', format: v => Number.isInteger(v) ? `b${v + 1}` : '' }, y: { min: floor, max: 0, log: true, label: 'BER' },
                bars: ber.map((v, b) => ({ x0: b - .35, x1: b + .35, y: Math.max(v, 10 ** floor), color: s.family === 'qam' && b >= k / 2 ? PALETTE[1] : PALETTE[0] })),
                hlines: run.ber > 0 ? [{ y: run.ber, label: 'média', color: GREY }] : [], legend: s.family === 'qam' && k > 1 ? [{ label: 'bits do eixo I', color: PALETTE[0] }, { label: 'bits do eixo Q', color: PALETTE[1] }] : [] });
        }
    },
};

function drawConstellation(cv, run, s, label, esn0Db) {
    const c = run.c, maxCoord = Math.max(...c.points.map(p => Math.max(Math.abs(p.re), Math.abs(p.im))));
    const lim = c.family === 'psk' ? 1.5 : maxCoord + Math.max(c.dmin, .25);
    const step = Math.max(1, Math.ceil(run.out.length / 6000)), ok = [], bad = [];
    run.out.forEach((o, i) => { if (i % step) return; (o.decided === o.label ? ok : bad).push([o.y.re, o.y.im]); });
    const series = [], line = (x0, y0, x1, y1) => ({ points: Array.from({ length: 61 }, (_, i) => [x0 + (x1 - x0) * i / 60, y0 + (y1 - y0) * i / 60]), color: GREY, width: 1, dash: [3, 4], alpha: .7 });
    if (s.regions) {
        if (c.family === 'qam') for (let i = 1; i < c.L; i++) { const v = (2 * i - c.L) / c.norm; series.push(line(v, -3 * lim, v, 3 * lim), line(-3 * lim, v, 3 * lim, v)); }
        else for (let m = 0; m < c.M; m++) { const a = c.offset + (2 * m + 1) * Math.PI / c.M; series.push(line(0, 0, 3 * lim * Math.cos(a), 3 * lim * Math.sin(a))); }
    }
    const errors = run.out.filter(o => o.decided !== o.label).slice(0, 14);
    const dot = s.M >= 256 ? 1.6 : 2.4;
    const { px, py } = plot(cv, {
        title: `${label} · Es/N0 ${f1(esn0Db)} dB · ${run.symErr} erros`, equalAspect: true, x: { min: -lim, max: lim, label: 'I (em fase)' }, y: { min: -lim, max: lim, label: 'Q (quadratura)' },
        series, scatter: [{ points: ok, color: PALETTE[0], size: dot, alpha: .45 }, { points: bad, color: RED, size: dot + .8, alpha: .9 }],
        segments: errors.map(o => ({ x0: c.points[o.label].re, y0: c.points[o.label].im, x1: o.y.re, y1: o.y.im, color: RED })),
    });
    const g = cv.getContext('2d'), text = cssVar('--text');
    g.strokeStyle = text; g.lineWidth = 1.2;
    const showLabels = s.labels && s.M <= 64, font = s.M <= 8 ? 12 : s.M <= 16 ? 11 : s.M <= 32 ? 9 : 8;
    g.font = `600 ${font}px JetBrains Mono, monospace`; g.textAlign = 'center';
    c.points.forEach((p, lbl) => {
        const X = px(p.re), Y = py(p.im);
        g.beginPath(); g.arc(X, Y, s.M >= 256 ? 1.5 : 3.2, 0, 2 * Math.PI); g.stroke();
        if (showLabels) { g.fillStyle = text; g.fillText(D.bitsOf(lbl, c.k).join(''), X, Y + font + 3); }
    });
}

function drawWave(cv, c, labels) {
    const n = labels.length, sps = 80, fc = 2, A = Math.max(...c.points.map(p => Math.max(Math.abs(p.re), Math.abs(p.im)))) || 1;
    const I = [], Q = [], S = [];
    let smax = 0;
    for (let i = 0; i < n * sps; i++) { const t = i / sps, p = c.points[labels[Math.floor(t)]]; smax = Math.max(smax, Math.hypot(p.re, p.im)); }
    for (let i = 0; i <= n * sps; i++) {
        const t = i / sps, p = c.points[labels[Math.min(n - 1, Math.floor(t))]];
        I.push([t, 4.2 + p.re / A]); Q.push([t, 1.2 + p.im / A]);
        S.push([t, -2.2 + (p.re * Math.cos(2 * Math.PI * fc * t) - p.im * Math.sin(2 * Math.PI * fc * t)) / smax]);
    }
    const { px, py } = plot(cv, {
        title: `Forma de onda de ${n} símbolos (${n * c.k} bits)`, x: { min: 0, max: n, ticks: n, label: 'tempo (períodos de símbolo Ts)' }, y: { min: -3.6, max: 6.4, label: '', format: () => '' },
        series: [
            { points: I, color: PALETTE[0], width: 2, labelAt: [.02, 5.2], labelText: 'I(t)' },
            { points: Q, color: PALETTE[1], width: 2, labelAt: [.02, 2.2], labelText: 'Q(t)' },
            { points: S, color: PALETTE[2], width: 1.3, labelAt: [.02, -1.1], labelText: 's(t) = I·cos(2πfct) − Q·sin(2πfct)' },
        ],
        vlines: Array.from({ length: n - 1 }, (_, i) => ({ x: i + 1, color: cssVar('--line'), dash: [2, 3] })),
        hlines: [{ y: 4.2, color: cssVar('--line'), dash: [1, 3] }, { y: 1.2, color: cssVar('--line'), dash: [1, 3] }, { y: -2.2, color: cssVar('--line'), dash: [1, 3] }],
    });
    const g = cv.getContext('2d');
    g.fillStyle = cssVar('--amber'); g.font = `600 ${c.k > 6 ? 9 : 11}px JetBrains Mono, monospace`; g.textAlign = 'center';
    labels.forEach((l, i) => g.fillText(D.bitsOf(l, c.k).join(''), px(i + .5), py(6.0)));
}

// ======================================================================
// 2. Pulse shaping, Nyquist ISI criterion, matched filter and eye diagram
// ======================================================================
const PULSE_MODS = [['psk2', 'BPSK'], ['qam4', 'QPSK'], ['qam16', '16-QAM']];
const pulse = {
    id: 'pulse', nav: 'Pulsos & olho', sub: 'Nyquist · filtro casado',
    state: { mod: 'psk2', shape: 'rrc', rx: 'matched', alpha: .35, span: 8, ebn0Db: 12, tau: 0, echo: 0, echoDelay: .5, symbols: 3000, seed: 1 },
    theory: THEORY.pulse,
    controls: s => C.select('mod', 'Modulação', s.mod, PULSE_MODS)
        + C.select('shape', 'Pulso TX', s.shape, [['rect', 'Retangular'], ['rc', 'Cosseno levantado (RC)'], ['rrc', 'Raiz de cosseno levantado (RRC)']])
        + C.select('rx', 'Filtro RX', s.rx, [['matched', 'Casado'], ['lpf', 'Passa-baixa largo (±Rs)'], ['none', 'Nenhum']])
        + C.range('alpha', 'Roll-off α', s.alpha, 0, 1, .05) + C.range('span', 'Span', s.span, 2, 16, 1, ' símb')
        + C.range('ebn0Db', 'Eb/N0', s.ebn0Db, 0, 30, .5, ' dB') + C.range('tau', 'Erro de tempo τ', s.tau, -.5, .5, .02, ' Ts')
        + C.button('reseed', 'Nova realização')
        + C.group('CANAL', C.range('echo', 'Eco', s.echo, 0, .8, .05) + C.range('echoDelay', 'Atraso', s.echoDelay, .25, 3, .25, ' Ts')),
    cards: () => [
        { id: 'eye', cls: 'wide tall', cap: 'Diagrama de olho: a saída do filtro de recepção (componente I) sobreposta em janelas de 2 T<sub>s</sub> centradas nos instantes de decisão. A linha vertical âmbar é o instante de amostragem (τ). Tracejado: limiares de decisão.' },
        { id: 'pulse', cap: 'Pulso transmitido (fino) e pulso total TX ∗ canal ∗ RX (grosso), normalizado. As hastes marcam o pulso total nos instantes de amostragem dos vizinhos (kT<sub>s</sub> + τ): qualquer haste diferente de zero é ISI.' },
        { id: 'spec', cap: 'Espectro de potência do pulso transmitido e do total, em dB. Linhas verticais: banda de Nyquist ±R<sub>s</sub>/2 (cinza) e banda ocupada ±(1+α)R<sub>s</sub>/2 (verde). O retangular tem lobos laterais que decaem devagar.' },
        { id: 'samples', cap: 'Amostras na entrada do decisor (constelação). A ISI espalha os pontos mesmo sem ruído: compare com a nuvem gaussiana da aula 1.' },
    ],
    actions: { reseed(s) { s.seed++; } },
    draw(s, ctx) {
        const { family, M } = parseMod(s.mod), label = PULSE_MODS.find(m => m[0] === s.mod)[1], alpha = s.shape === 'rect' ? 0 : +s.alpha;
        const run = D.pulseLink({ family, M, shape: s.shape, rx: s.rx, alpha: +s.alpha, span: +s.span, ebn0Db: +s.ebn0Db, tau: +s.tau, echo: +s.echo, echoDelay: +s.echoDelay, symbols: +s.symbols, seed: s.seed });
        const c = run.c, maxA = Math.max(...c.points.map(p => Math.abs(p.re))), opening = 1 - run.peakDistortion / (c.dmin / 2), theory = D.theoryBer(family, M, D.db2lin(s.ebn0Db));
        const thresholds = c.family === 'qam' ? Array.from({ length: c.L - 1 }, (_, i) => (2 * (i + 1) - c.L) / c.norm) : [0];
        const lim = maxA * 1.9 + .2;
        plot(ctx.cv('eye'), { title: `Diagrama de olho · ${label} · ${s.shape.toUpperCase()} + ${s.rx === 'matched' ? 'casado' : s.rx === 'lpf' ? 'passa-baixa' : 'sem filtro'} · Eb/N0 ${s.ebn0Db} dB`, x: { min: -1, max: 1, label: 'tempo relativo ao instante ideal (T_s)' }, y: { min: -lim, max: lim, label: 'saída do filtro RX (I)' },
            series: run.traces.map(t => ({ points: t, color: PALETTE[0], width: 1, alpha: .22 })), vlines: [{ x: +s.tau, color: PALETTE[1], dash: [] }], hlines: thresholds.map(y => ({ y, color: RED })) });
        // Pulse in time with ISI samples.
        {
            const { tx, total, center, sps, gain, isiTaps } = run.pulse, peakTx = Math.max(...tx.map(Math.abs)), off = Math.round(s.tau * sps);
            const txPts = tx.map((v, i) => [(i - (tx.length - 1) / 2) / sps, v / peakTx]), totPts = Array.from(total, (v, i) => [(i - center) / sps, v / gain]);
            const half = Math.min(8, Math.ceil(total.length / sps / 2) + .5), stems = [];
            for (let m = -Math.floor(half); m <= Math.floor(half); m++) { const i = center + off + m * sps; if (i >= 0 && i < total.length) stems.push([m + off / sps, total[i] / gain]); }
            plot(ctx.cv('pulse'), { title: `Pulso total · ISI Σ|p_k|/p_0 = ${f1(run.isi, 3)}`, x: { min: -half, max: half, label: 't / T_s' }, y: { min: -.35, max: 1.15, label: 'amplitude', ticks: 4 },
                series: [{ points: txPts, color: GREY, width: 1.2 }, { points: totPts, color: PALETTE[0], width: 2.2 }], stems: [{ points: stems, color: PALETTE[1], width: 2, dots: true, base: 0 }], hlines: [{ y: 0, dash: [] }],
                legend: [{ label: 'pulso TX', color: GREY }, { label: 'pulso total', color: PALETTE[0] }, { label: 'amostras kTs + τ', color: PALETTE[1] }] });
            void isiTaps;
        }
        plot(ctx.cv('spec'), { title: 'Espectro do pulso', x: { min: -1.5, max: 1.5, label: 'f / R_s' }, y: { min: -60, max: 3, label: 'dB' },
            series: [{ points: run.spectrum.tx, color: GREY, width: 1.2 }, { points: run.spectrum.total, color: PALETTE[0], width: 2 }],
            vlines: [{ x: -.5, color: GREY }, { x: .5, color: GREY }, ...(s.shape !== 'rect' ? [{ x: -(1 + alpha) / 2, color: PALETTE[2] }, { x: (1 + alpha) / 2, color: PALETTE[2] }] : [])],
            legend: [{ label: 'TX', color: GREY }, { label: 'total', color: PALETTE[0] }] });
        {
            const ok = [], bad = [];
            run.samples.forEach(q => (q.decided === q.label ? ok : bad).push([q.z.re, q.z.im]));
            const L = maxA + Math.max(c.dmin, .6);
            plot(ctx.cv('samples'), { title: `Amostras no decisor · ${run.bitErr} bits errados`, equalAspect: true, x: { min: -L, max: L, label: 'I' }, y: { min: -L, max: L, label: 'Q' }, scatter: [{ points: ok, color: PALETTE[0], size: 2.2, alpha: .45 }, { points: bad, color: RED, size: 3, alpha: .9 }] });
        }
        const band = s.shape === 'rect' ? '≈ Rs (lobo principal)' : `${f1((1 + alpha) / 2, 3)}·Rs`;
        ctx.strip(metric('Banda (banda base)', band, s.shape === 'rect' ? 'lobos laterais decaem com 1/f²' : `na portadora: ${f1(1 + alpha, 2)}·Rs`)
            + metric('Eficiência espectral', s.shape === 'rect' ? '—' : `${f1(c.k / (1 + alpha), 2)} b/s/Hz`, `${c.k} bits / (1+α)`)
            + metric('ISI (distorção de pico)', f1(run.isi, 3), 'Σ |p(kTs+τ)| / p(τ), k ≠ 0')
            + metric('Abertura do olho', opening > 0 ? `${f1(100 * opening, 0)}%` : 'fechado', 'sem ruído, pior caso de ISI')
            + metric('Perda do filtro RX', `${f1(Math.max(0, run.snrLossDb), 2)} dB`, 'vs. filtro casado amostrado em τ = 0')
            + metric('BER medida · ideal', `${sci(run.ber)} · ${sci(theory)}`, `${run.bitErr} erros em ${run.bits} bits`));
    },
};

// ======================================================================
// 3. BER × Eb/N0 with Monte Carlo, Shannon limit and the bandwidth-efficiency plane
// ======================================================================
const BER_SCHEMES = [['psk', 2], ['psk', 4], ['psk', 8], ['psk', 16], ['qam', 16], ['qam', 64], ['qam', 256], ['qam', 1024]];
const schemeColor = key => PALETTE[BER_SCHEMES.findIndex(([f, M]) => f + M === key) % PALETTE.length];
const curveCache = new Map();
function theoryCurve(family, M, channel, top) {
    const key = `${family}${M}|${channel}|${top}`;
    if (!curveCache.has(key)) curveCache.set(key, sweep(-4, top, channel === 'awgn' ? .25 : .5, x => channel === 'awgn' ? D.theoryBer(family, M, D.db2lin(x)) : D.rayleighBer(family, M, D.db2lin(x))));
    return curveCache.get(key);
}
const theoryAt = (family, M, channel, ebn0) => channel === 'awgn' ? D.theoryBer(family, M, ebn0) : D.rayleighBer(family, M, ebn0);
const reqCache = new Map();
const requiredFor = (family, M, channel, target) => {
    const key = `${family}${M}|${channel}|${target}`;
    if (!reqCache.has(key)) reqCache.set(key, D.requiredEbn0Db(g => theoryAt(family, M, channel, g), target));
    return reqCache.get(key);
};

const ber = {
    id: 'ber', nav: 'BER × Eb/N0', sub: 'teoria · Monte Carlo',
    state: { show: { psk2: true, psk4: false, psk8: true, psk16: false, qam16: true, qam64: true, qam256: false, qam1024: false }, channel: 'awgn', target: 1e-5, mc: { awgn: {}, rayleigh: {} } },
    theory: THEORY.ber,
    controls: s => `<div class="checks">${BER_SCHEMES.map(([f, M]) => C.check(`show.${f}${M}`, D.schemeLabel(f, M), s.show[f + M])).join('')}</div>`
        + C.select('channel', 'Canal', s.channel, [['awgn', 'AWGN'], ['rayleigh', 'Rayleigh (sem diversidade)']])
        + C.select('target', 'BER alvo', s.target, [[1e-3, '10⁻³'], [1e-4, '10⁻⁴'], [1e-5, '10⁻⁵'], [1e-6, '10⁻⁶']])
        + mcButtons(),
    cards: () => [
        { id: 'curves', cls: 'wide tall', cap: 'Linhas: teoria (Gray). Pontos: Monte Carlo neste navegador. A faixa à esquerda é proibida pelo limite de Shannon (−1,59 dB). Em Rayleigh a inclinação é de uma década a cada 10 dB.' },
        { id: 'plane', cls: 'tall', cap: 'Plano eficiência espectral × E<sub>b</sub>/N<sub>0</sub> exigida para a BER alvo. Abaixo da curva de Shannon fica a região alcançável. Pontos âmbar: MCS do Wi-Fi com FEC (modelo do simulador de rede).' },
        { id: 'table', html: true, cap: 'E<sub>b</sub>/N<sub>0</sub> e E<sub>s</sub>/N<sub>0</sub> necessárias para a BER alvo e a distância até o limite de Shannon com a mesma eficiência η = log₂M.' },
    ],
    actions: {
        run(s) {
            if (job) { stopJobs(); progress(0, 0, true); return; }
            const ch = s.channel, list = [], last = {};
            for (const [family, M] of BER_SCHEMES) {
                const key = family + M;
                if (!s.show[key]) continue;
                s.mc[ch][key] = [];
                const cap = ch === 'awgn' ? 32 : 44;
                for (let x = -2; x <= cap; x += 2) {
                    if (theoryAt(family, M, ch, D.db2lin(x)) < s.target / 5) break;
                    list.push({
                        skip: () => last[key] !== undefined && last[key] < s.target / 5,
                        run: (st, b) => D.monteCarloBer({ family, M, ebn0Db: x, channel: ch, maxBits: 3e6, minErrors: 200, budgetMs: b, state: st, seed: 3 }),
                        result: st => { s.mc[ch][key].push({ x, ber: st.ber, errors: st.errors, bits: st.bits }); last[key] = st.errors ? st.ber : 0; },
                    });
                }
            }
            runJobs(list, progress);
        },
        clear(s) { stopJobs(); s.mc = { awgn: {}, rayleigh: {} }; },
    },
    draw(s, ctx) {
        const ch = s.channel, top = ch === 'awgn' ? 30 : 50, shown = BER_SCHEMES.filter(([f, M]) => s.show[f + M]);
        const series = [], markers = [], legend = [];
        for (const [f, M] of shown) {
            const key = f + M, color = schemeColor(key);
            series.push({ points: aboveFloor(theoryCurve(f, M, ch, top), -7), color, width: 1.8 });
            markers.push(...mcMarkers(s.mc[ch][key], color));
            legend.push({ label: D.schemeLabel(f, M) + (M === 2 ? ' (= QPSK)' : ''), color });
        }
        plot(ctx.cv('curves'), { title: `BER × Eb/N0 · canal ${ch === 'awgn' ? 'AWGN' : 'Rayleigh'}`, x: { min: -4, max: top, label: 'Eb/N0 (dB)' }, y: { min: -7, max: 0, log: true, label: 'BER' }, series, markers, legend,
            xbands: [{ x0: -4, x1: -1.59, color: RED, alpha: .12, label: 'Shannon' }], hlines: [{ y: s.target, label: `alvo ${sci(s.target)}` }] });
        // Bandwidth-efficiency plane.
        const req = BER_SCHEMES.map(([f, M]) => ({ f, M, key: f + M, eta: Math.log2(M), eb: requiredFor(f, M, ch, s.target) }));
        const shannon = Array.from({ length: 200 }, (_, i) => { const eta = .02 + i * .056; return [D.shannonEbn0Db(eta), eta]; });
        const mcsPts = ch === 'awgn' ? MCS.map((m, i) => ({ i, eta: Math.log2(m.M) * m.rate, eb: requiredFor('qam', m.M, 'awgn', s.target) - CODING_GAIN_DB[m.code] })) : [];
        plot(ctx.cv('plane'), { title: `Plano potência × banda · BER ${sci(s.target)}`, x: { min: -4, max: ch === 'awgn' ? 32 : 60, label: 'Eb/N0 exigida (dB)' }, y: { min: 0, max: 12.5, label: 'η (b/s/Hz)' },
            series: [{ points: shannon, color: PALETTE[2], width: 2, endLabel: 'Shannon' }, { points: shannon, color: PALETTE[2], fill: true, alpha: .07 }],
            markers: [...req.filter(r => Number.isFinite(r.eb)).map(r => ({ x: r.eb, y: r.eta, color: schemeColor(r.key), label: D.schemeLabel(r.f, r.M), hollow: !s.show[r.key] })), ...mcsPts.map(p => ({ x: p.eb, y: p.eta, color: PALETTE[1], size: 3, label: p.i % 2 ? '' : `MCS${p.i}` }))],
            vlines: [{ x: -1.59, color: RED }] });
        ctx.html('table', `<h4>Requisitos para BER ${sci(s.target)} · ${ch === 'awgn' ? 'AWGN' : 'Rayleigh'}</h4><table class="mini"><tr><th>Modulação</th><th>η</th><th>Eb/N0</th><th>Es/N0</th><th>Gap Shannon</th><th>MC</th></tr>${req.map(r => {
            const gap = r.eb - D.shannonEbn0Db(r.eta), pts = s.mc[ch][r.key];
            return `<tr class="${s.show[r.key] ? 'chosen' : ''}"><td>${D.schemeLabel(r.f, r.M)}</td><td>${r.eta}</td><td>${f1(r.eb)} dB</td><td>${f1(r.eb + D.lin2db(r.eta))} dB</td><td>${f1(gap)} dB</td><td>${pts?.length ? `${pts.length} pts · ${f1(pts.reduce((a, p) => a + p.bits, 0) / 1e6)} Mbit` : '—'}</td></tr>`;
        }).join('')}</table>`);
    },
};

// ======================================================================
// 4. Channel coding: the 802.11 BCC (K = 7) with puncturing and Viterbi decoding
// ======================================================================
const FEC_MODS = [['psk2', 'BPSK'], ['qam4', 'QPSK'], ['qam16', '16-QAM'], ['qam64', '64-QAM']];
const rateColor = r => PALETTE[[2, 1, 3, 4][D.CODE_RATES.indexOf(r)]];
const fec = {
    id: 'fec', nav: 'Codificação', sub: 'BCC 802.11 · Viterbi',
    state: { mod: 'qam4', rates: { '1/2': true, '2/3': false, '3/4': true, '5/6': false }, decision: 'soft', ldpc: true, model: true, mc: {}, ex: 1 },
    theory: THEORY.fec,
    controls: s => C.select('mod', 'Modulação', s.mod, FEC_MODS)
        + `<div class="checks">${D.CODE_RATES.map(r => C.check(`rates.${r}`, `R = ${r}`, s.rates[r])).join('')}</div>`
        + C.select('decision', 'Decisão', s.decision, [['soft', 'suave (LLR)'], ['hard', 'dura (Hamming)'], ['both', 'suave e dura']])
        + C.check('ldpc', 'LDPC n = 1296', s.ldpc) + C.check('model', 'Modelo do simulador de rede', s.model)
        + C.button('example', 'Novo exemplo') + mcButtons(),
    cards: () => [
        { id: 'coded', cls: 'wide tall', cap: 'Linha grossa: sem código (teoria). Cores: BCC 802.11 simulado bit a bit (codificador → mapeador Gray → AWGN → LLR → Viterbi). Linhas cheias: decisão suave; tracejadas: dura. Traço-ponto: LDPC (3, d<sub>c</sub>) n = 1296 com min-sum. Pontilhado fino: modelo de ganho fixo do Wi-Fi Lab. Linhas verticais: limite de Shannon para k·R bits/símbolo.' },
        { id: 'encoder', html: true, cap: 'Um exemplo de 12 bits: saídas A e B do codificador e a sequência transmitida em cada taxa. Os pontos vermelhos são bits roubados pelo puncionamento.' },
        { id: 'gain', html: true, cap: 'Ganho de codificação = (Eb/N0 sem código) − (Eb/N0 codificado) na mesma BER. O assintótico 10·log₁₀(R·d_free) é um limite superior para BER → 0.' },
    ],
    actions: {
        example(s) { s.ex++; },
        run(s) {
            if (job) { stopJobs(); progress(0, 0, true); return; }
            const { family, M } = parseMod(s.mod), decisions = s.decision === 'both' ? ['soft', 'hard'] : [s.decision], list = [], last = {};
            const top = M >= 64 ? 20 : M >= 16 ? 15 : 11;
            for (const rate of D.CODE_RATES) if (s.rates[rate]) for (const dec of decisions) {
                const key = `${s.mod}|${rate}|${dec}`;
                s.mc[key] = [];
                for (let x = 0; x <= top; x += 1) list.push({
                    x, skip: () => last[key] !== undefined && last[key] < 2e-6,
                    run: (st, b) => D.monteCarloCoded({ family, M, rate, ebn0Db: x, hard: dec === 'hard', maxBits: 2e6, minErrors: 100, budgetMs: b, state: st, seed: 5 }),
                    result: st => { s.mc[key].push({ x, ber: st.ber, errors: st.errors, bits: st.bits }); last[key] = st.errors ? st.ber : 0; },
                });
            }
            if (s.ldpc) for (const rate of D.CODE_RATES) if (s.rates[rate]) {
                const key = `${s.mod}|${rate}|ldpc`;
                s.mc[key] = [];
                for (let x = 0; x <= top; x += .5) list.push({
                    x, skip: () => last[key] !== undefined && last[key] < 2e-6,
                    run: (st, b) => D.monteCarloLdpc({ family, M, rate, ebn0Db: x, maxBits: 2e6, minErrors: 100, budgetMs: b, state: st, seed: 7 }),
                    result: st => { s.mc[key].push({ x, ber: st.ber, errors: st.errors, bits: st.bits }); last[key] = st.errors ? st.ber : 0; },
                });
            }
            // Interleave the curves' points so every curve grows from low Eb/N0 together.
            list.sort((a, b) => a.x - b.x);
            runJobs(list, progress);
        },
        clear(s) { stopJobs(); s.mc = {}; },
    },
    draw(s, ctx) {
        const { family, M } = parseMod(s.mod), k = Math.log2(M), top = M >= 64 ? 22 : M >= 16 ? 16 : 12, label = FEC_MODS.find(m => m[0] === s.mod)[1];
        const uncoded = aboveFloor(sweep(-1, top, .25, x => D.theoryBer(family, M, D.db2lin(x))), -6);
        const series = [{ points: uncoded, color: cssVar('--text'), width: 2 }], markers = [], vlines = [], legend = [{ label: `${label} sem código`, color: cssVar('--text') }];
        for (const rate of D.CODE_RATES) {
            if (!s.rates[rate]) continue;
            const color = rateColor(rate);
            for (const dec of ['soft', 'hard', 'ldpc']) {
                const pts = s.mc[`${s.mod}|${rate}|${dec}`];
                if (pts?.length) { series.push(mcSeries(pts, color, dec === 'hard' ? [6, 4] : dec === 'ldpc' ? [9, 3, 2, 3] : [])); markers.push(...mcMarkers(pts, color, dec === 'hard')); }
            }
            vlines.push({ x: D.shannonEbn0Db(k * D.rateValue(rate)), color, dash: [1, 3] });
            if (s.model) series.push({ points: aboveFloor(sweep(-1, top, .25, x => D.theoryBer('qam', Math.max(4, M), D.db2lin(x + CODING_GAIN_DB[rate]))), -6), color, width: .9, dash: [2, 3], alpha: .8 });
            legend.push({ label: `R = ${rate} · ${f1(k * D.rateValue(rate), 2)} b/símb`, color });
        }
        plot(ctx.cv('coded'), { title: `BCC K = 7 (133, 171)₈${s.ldpc ? ' e LDPC' : ''} · ${label} · Eb/N0 por bit de informação`, x: { min: -1, max: top, label: 'Eb/N0 (dB)' }, y: { min: -6, max: 0, log: true, label: 'BER pós-decodificação' }, series, markers, legend, vlines, hlines: [{ y: 1e-4, label: '10⁻⁴' }] });
        // Encoder example.
        {
            const r = D.prng(s.ex * 977), u = Array.from({ length: 12 }, () => r() < .5 ? 1 : 0), enc = D.bccEncode(u, '1/2', false);
            const row = (label, cells) => `<div><span class="lbl">${label}</span>${cells}</div>`;
            const stream = rate => {
                const P = D.PUNCTURE[rate], p = P.A.length;
                let html = '', count = 0;
                for (let i = 0; i < u.length; i++) {
                    const a = P.A[i % p] ? `<span class="a">${enc.A[i]}</span>` : '<span class="stolen">·</span>', b = P.B[i % p] ? `<span class="b">${enc.B[i]}</span>` : '<span class="stolen">·</span>';
                    count += P.A[i % p] + P.B[i % p];
                    html += `${a}${b} `;
                }
                return row(`R = ${rate}`, `${html} → ${count} bits`);
            };
            ctx.html('encoder', `<h4>Exemplo: 12 bits de informação</h4><div class="bits">
                ${row('u (entrada)', u.map(b => `${b}&nbsp;`).join(' '))}
                ${row('A (g₀ = 133₈)', enc.A.map(b => `<span class="a">${b}</span>&nbsp;`).join(' '))}
                ${row('B (g₁ = 171₈)', enc.B.map(b => `<span class="b">${b}</span>&nbsp;`).join(' '))}
                <br>${D.CODE_RATES.map(stream).join('')}</div>
                <p style="margin-top:8px">Padrões de puncionamento (1 = enviado) — ${D.CODE_RATES.slice(1).map(rt => `<b>${rt}</b>: A ${D.PUNCTURE[rt].A.join('')} / B ${D.PUNCTURE[rt].B.join('')}`).join(' · ')}</p>`);
        }
        // Coding gain table.
        {
            const target = 1e-4, ref = D.requiredEbn0Db(g => D.theoryBer(family, M, g), target);
            const rows = D.CODE_RATES.map(rate => {
                const soft = crossing(s.mc[`${s.mod}|${rate}|soft`], target), hard = crossing(s.mc[`${s.mod}|${rate}|hard`], target), ldpc = crossing(s.mc[`${s.mod}|${rate}|ldpc`], target);
                return `<tr class="${s.rates[rate] ? 'chosen' : ''}"><td>${rate}</td><td>${D.DFREE[rate]}</td><td>${f1(D.lin2db(D.rateValue(rate) * D.DFREE[rate]))} dB</td><td>${gainCell(ref, soft)}</td><td>${gainCell(ref, hard)}</td><td>${gainCell(ref, ldpc)}</td><td>${f1(ref - D.shannonEbn0Db(k * D.rateValue(rate)))} dB</td><td>${f1(CODING_GAIN_DB[rate])} dB</td><td>${f1(k * D.rateValue(rate), 2)}</td></tr>`;
            }).join('');
            ctx.html('gain', `<h4>Ganho de codificação em BER 10⁻⁴ · ${label} sem código precisa de ${f1(ref)} dB</h4><table class="mini"><tr><th>R</th><th>d<sub>free</sub></th><th>G<sub>∞</sub></th><th>BCC suave</th><th>BCC dura</th><th>LDPC</th><th>máx. (Shannon)</th><th>modelo Wi-Fi Lab</th><th>bits úteis/símb</th></tr>${rows}</table><p style="margin-top:6px">Rode o Monte Carlo para preencher as colunas medidas. "máx. (Shannon)": ganho que um código ideal com a mesma eficiência k·R teria.</p>`);
        }
    },
};

// ======================================================================
// 5. Fading and diversity
// ======================================================================
const FADE_MODS = [['psk2', 'BPSK'], ['psk4', 'QPSK'], ['qam16', '16-QAM']];
const fading = {
    id: 'fading', nav: 'Desvanecimento', sub: 'Rayleigh · diversidade',
    state: { mod: 'psk2', L: 2, combining: 'mrc', fd: 20, avgDb: 15, seed: 1, mc: {} },
    theory: THEORY.fading,
    controls: s => C.select('mod', 'Modulação', s.mod, FADE_MODS)
        + C.select('L', 'Ramos L', s.L, [1, 2, 3, 4])
        + C.select('combining', 'Combinação', s.combining, [['mrc', 'MRC (razão máxima)'], ['sc', 'Seleção (SC)']])
        + C.range('fd', 'Doppler f<sub>d</sub>', s.fd, 1, 200, 1, ' Hz')
        + C.range('avgDb', 'SNR média', s.avgDb, 0, 30, 1, ' dB')
        + C.button('reseed', 'Nova realização') + mcButtons(),
    cards: () => [
        { id: 'trace', cls: 'wide', cap: 'SNR instantânea de cada antena (finas) e após a combinação (grossa) ao longo de 0,5 s. A linha vermelha marca 10 dB abaixo da média por antena (desvanecimento profundo). O MRC soma as SNRs, por isso fica acima das antenas.' },
        { id: 'ber', cls: 'tall', cap: 'BER média × E<sub>b</sub>/N<sub>0</sub> média por antena. Curvas: integração numérica da BER AWGN sobre a distribuição da SNR combinada. Pontos: Monte Carlo com canal Rayleigh independente por símbolo e CSI ideal.' },
        { id: 'cdf', cls: 'tall', cap: 'Probabilidade de a SNR combinada ficar abaixo de um limiar (relativo à média por antena). A inclinação em escala log-log é a ordem de diversidade L: −10 dB → 10⁻ᴸ.' },
    ],
    actions: {
        reseed(s) { s.seed++; },
        run(s) {
            if (job) { stopJobs(); progress(0, 0, true); return; }
            const { family, M } = parseMod(s.mod), key = `${s.mod}|${s.combining}|${s.L}`, list = [];
            s.mc[key] = [];
            let last;
            for (let x = 0; x <= 40; x += 4) {
                if (D.rayleighBer(family, M, D.db2lin(x), s.L, s.combining) < 2e-6) break;
                list.push({ skip: () => last !== undefined && last < 2e-6, run: (st, b) => D.monteCarloBer({ family, M, ebn0Db: x, channel: 'rayleigh', L: s.L, combining: s.combining, maxBits: 2e6, minErrors: 200, budgetMs: b, state: st, seed: 9 }), result: st => { s.mc[key].push({ x, ber: st.ber, errors: st.errors, bits: st.bits }); last = st.errors ? st.ber : 0; } });
            }
            runJobs(list, progress);
        },
        clear(s) { stopJobs(); s.mc = {}; },
    },
    draw(s, ctx) {
        const { family, M } = parseMod(s.mod), L = +s.L, label = FADE_MODS.find(m => m[0] === s.mod)[1];
        const dur = .5, branches = D.fadingTrace({ fd: s.fd, duration: dur, samples: 1500, L, seed: s.seed });
        const comb = branches[0].map((_, i) => s.combining === 'mrc' ? branches.reduce((a, b) => a + b[i], 0) : Math.max(...branches.map(b => b[i])));
        const dB = v => s.avgDb + D.lin2db(Math.max(v, 1e-6)), t = i => 1000 * i * dur / comb.length;
        const below = arr => arr.filter(v => v < .1).length / arr.length;
        plot(ctx.cv('trace'), { title: `SNR instantânea · f_d = ${s.fd} Hz · T_c ≈ ${f1(423 / s.fd, 1)} ms`, x: { min: 0, max: 1000 * dur, label: 'tempo (ms)' }, y: { min: s.avgDb - 35, max: s.avgDb + 14, label: 'SNR (dB)' },
            series: [...branches.map((b, l) => ({ points: b.map((v, i) => [t(i), dB(v)]), color: PALETTE[(l + 3) % PALETTE.length], width: 1, alpha: L > 1 ? .55 : .9 })), ...(L > 1 ? [{ points: comb.map((v, i) => [t(i), dB(v)]), color: PALETTE[0], width: 2.2 }] : [])],
            hlines: [{ y: s.avgDb, label: 'média por antena' }, { y: s.avgDb - 10, color: RED, label: '−10 dB: desvanecimento profundo' }],
            legend: L > 1 ? [{ label: 'antenas', color: PALETTE[3] }, { label: s.combining === 'mrc' ? 'MRC' : 'seleção', color: PALETTE[0] }] : [] });
        const series = [{ points: aboveFloor(sweep(0, 40, .25, x => D.theoryBer(family, M, D.db2lin(x))), -6), color: cssVar('--text'), width: 1.6, dash: [5, 4] }], legend = [{ label: 'AWGN', color: cssVar('--text') }];
        for (let l = 1; l <= 4; l++) { const color = PALETTE[[4, 0, 2, 3][l - 1]]; series.push({ points: aboveFloor(sweep(0, 40, .5, x => D.rayleighBer(family, M, D.db2lin(x), l, s.combining)), -6), color, width: l === L ? 2.6 : 1.1, alpha: l === L ? 1 : .6 }); legend.push({ label: `L = ${l}`, color }); }
        const markers = [];
        for (let l = 1; l <= 4; l++) markers.push(...mcMarkers(s.mc[`${s.mod}|${s.combining}|${l}`], PALETTE[[4, 0, 2, 3][l - 1]]));
        plot(ctx.cv('ber'), { title: `${label} · ${s.combining === 'mrc' ? 'MRC' : 'seleção'} · Rayleigh`, x: { min: 0, max: 40, label: 'Eb/N0 média por antena (dB)' }, y: { min: -6, max: 0, log: true, label: 'BER média' }, series, markers, legend });
        plot(ctx.cv('cdf'), { title: 'Probabilidade de desvanecimento (outage)', x: { min: -30, max: 10, label: 'limiar relativo à SNR média por antena (dB)' }, y: { min: -5, max: 0, log: true, label: 'P(γ < limiar)' },
            series: [1, 2, 3, 4].map(l => ({ points: aboveFloor(sweep(-30, 10, .25, x => D.combinedCdf(D.db2lin(x), l, s.combining)), -5), color: PALETTE[[4, 0, 2, 3][l - 1]], width: l === L ? 2.6 : 1.1 })), vlines: [{ x: -10, color: RED }],
            legend: [1, 2, 3, 4].map(l => ({ label: `L = ${l}`, color: PALETTE[[4, 0, 2, 3][l - 1]] })) });
        const ebAvg = D.db2lin(s.avgDb), b1 = D.rayleighBer(family, M, ebAvg, 1), bL = D.rayleighBer(family, M, ebAvg, L, s.combining);
        const reqA = D.requiredEbn0Db(g => D.theoryBer(family, M, g), 1e-3), reqL = D.requiredEbn0Db(g => D.rayleighBer(family, M, g, L, s.combining), 1e-3);
        const slope = Math.log10(D.rayleighBer(family, M, D.db2lin(30), L, s.combining) / D.rayleighBer(family, M, D.db2lin(40), L, s.combining));
        ctx.strip(metric('Abaixo de −10 dB', `${f1(100 * below(branches[0]))}% → ${f1(100 * below(comb))}%`, `1 antena → combinado · teoria ${f1(100 * D.combinedCdf(.1, 1))}% → ${f1(100 * D.combinedCdf(.1, L, s.combining), 2)}%`)
            + metric('BER na SNR média', `${sci(b1)} → ${sci(bL)}`, `L = 1 → L = ${L} · AWGN ${sci(D.theoryBer(family, M, ebAvg))}`)
            + metric('Penalidade do fading', `${f1(reqL - reqA)} dB`, `Eb/N0 extra para 10⁻³ vs AWGN (L = ${L})`)
            + metric('Ordem de diversidade', f1(slope, 2), 'décadas de BER por 10 dB (30 → 40 dB)')
            + metric('Tempo de coerência', `${f1(423 / s.fd)} ms`, `≈ ${Math.round(423 / s.fd / .0128 / 1000 * 1000)} símbolos OFDM Wi-Fi 6`));
    },
};

// ======================================================================
// 6. Beamforming with a uniform linear array (MRT, ZF MU-MIMO)
// ======================================================================
const bf = {
    id: 'bf', nav: 'Beamforming', sub: 'arranjos · MU-MIMO',
    state: { N: 4, d: .5, K: 1, a1: 25, a2: -40, a3: 60, mode: 'mrt', rhoDb: 10, view: 'power' },
    structural: ['K'],
    theory: THEORY.bf,
    controls: s => C.range('N', 'Antenas N', s.N, 1, 16, 1) + C.range('d', 'Espaçamento', s.d, .1, 2, .05, ' λ')
        + C.select('mode', 'Pesos', s.mode, [['omni', 'Uma antena (sem BF)'], ['uniform', 'Iguais (feixe frontal)'], ['mrt', 'MRT (feixe casado)'], ['zf', 'Zero-forcing (MU)']])
        + C.select('K', 'Usuários', s.K, [1, 2, 3])
        + [1, 2, 3].slice(0, s.K).map(k => C.range(`a${k}`, `θ${k}`, s[`a${k}`], -90, 90, 1, '°')).join('')
        + C.range('rhoDb', 'SNR 1 antena', s.rhoDb, -10, 30, 1, ' dB')
        + C.select('view', 'Campo', s.view, [['power', 'intensidade'], ['wave', 'frente de onda (animada)']]),
    cards: () => [
        { id: 'polar', cls: 'tall', cap: 'Diagrama de radiação G(θ) em dB relativo a uma antena (0 dB). Cada cor é o feixe de um usuário; as linhas tracejadas apontam para os usuários. Com d > λ/2 surgem lobos de grade.' },
        { id: 'field', cls: 'tall', cap: 'Campo irradiado no plano (região de 16 λ de profundidade). Intensidade: soma das potências dos feixes. Frente de onda: Re{E} do feixe do usuário 1, animado; veja as cristas se alinharem na direção escolhida. Pontos brancos: antenas.' },
        { id: 'weights', cap: 'Fase aplicada em cada antena (graus). No MRT é uma rampa linear de inclinação −360°·(d/λ)·sinθ por antena. O ZF também altera as amplitudes para criar nulos.' },
        { id: 'sweep', cap: 'Com 1 usuário: ganho do MRT × número de antenas (10·log₁₀N). Com 2 ou mais: SINR do usuário 1 enquanto o usuário 2 varre todos os ângulos, para MRT e ZF. Perto do usuário 1, a interferência (MRT) ou a perda de ganho (ZF) derrubam a SINR.' },
    ],
    draw(s, ctx) {
        const N = +s.N, d = +s.d, K = +s.K, angles = [s.a1, s.a2, s.a3].slice(0, K).map(Number), rho = D.db2lin(s.rhoDb);
        const W = D.precoders(s.mode, N, d, angles), users = D.userSinr(W, N, d, angles, rho);
        const grating = d > 1 / (1 + Math.abs(Math.sin(angles[0] * Math.PI / 180)));
        const span = N * d * Math.cos(angles[0] * Math.PI / 180), hpbw = s.mode === 'mrt' && N > 1 && span > .5 ? 0.886 / span * 180 / Math.PI : NaN;
        ctx.strip(users.map((u, k) => metric(`Usuário ${k + 1} · ${angles[k]}°`, `SINR ${f1(D.lin2db(u.sinr))} dB`, `ganho ${f1(D.lin2db(u.signal * K))} dB · ${u.interference > 1e-9 ? `SIR ${f1(D.lin2db(u.signal / u.interference))} dB` : 'sem interferência'} · ${f1(Math.log2(1 + u.sinr), 2)} b/s/Hz`)).join('')
            + metric('Soma das taxas', `${f1(users.reduce((a, u) => a + Math.log2(1 + u.sinr), 0), 2)} b/s/Hz`, `vs 1 antena p/ 1 usuário: ${f1(Math.log2(1 + rho), 2)}`)
            + metric('Ganho ideal MRT', `${f1(D.lin2db(N))} dB`, `10·log₁₀(${N})`)
            + metric('Largura do feixe', Number.isFinite(hpbw) && hpbw < 180 ? `${f1(hpbw)}°` : '—', 'feixe principal, −3 dB')
            + metric('Espaçamento', `${f1(d, 2)} λ = ${f1(d * 6, 1)} cm`, `em 5 GHz${grating ? ' · <b style="color:var(--red)">lobos de grade!</b>' : ''}`));
        drawPolar(ctx.cv('polar'), { N, d, W, angles });
        drawField(ctx.cv('field'), { N, d, W, angles, view: s.view });
        {
            const stems = W.map((w, k) => ({ points: w.map((z, n) => [n + (k - (K - 1) / 2) * .12, Math.atan2(z.im, z.re) * 180 / Math.PI]), color: PALETTE[k], width: 2.2, dots: true, base: 0 }));
            plot(ctx.cv('weights'), { title: 'Fase dos pesos w_n', x: { min: -.6, max: N - .4, ticks: Math.min(N, 16), label: 'antena n', format: v => Number.isInteger(v) ? String(v) : '' }, y: { min: -180, max: 180, ticks: 4, label: 'fase (°)' }, stems, hlines: [{ y: 0, dash: [] }], legend: angles.map((a, k) => ({ label: `usuário ${k + 1} (${a}°)`, color: PALETTE[k] })) });
        }
        if (K === 1) {
            plot(ctx.cv('sweep'), { title: 'Ganho de arranjo × número de antenas', x: { min: 1, max: 16, label: 'N' }, y: { min: 0, max: 13, label: 'ganho (dB)' }, series: [{ points: sweep(1, 16, .1, n => D.lin2db(n)), color: PALETTE[0], width: 2 }], markers: [{ x: N, y: D.lin2db(N), color: PALETTE[1], label: `${N} antenas → ${f1(D.lin2db(N))} dB` }] });
        } else {
            const curve = mode => sweep(-90, 90, 1, a => { const ang = [angles[0], a, ...angles.slice(2)]; return D.lin2db(D.userSinr(D.precoders(mode, N, d, ang), N, d, ang, rho)[0].sinr); });
            plot(ctx.cv('sweep'), { title: `SINR do usuário 1 (${angles[0]}°) × posição do usuário 2`, x: { min: -90, max: 90, label: 'θ₂ (°)' }, y: { min: -15, max: s.rhoDb + D.lin2db(N) + 3, label: 'SINR (dB)' },
                series: [{ points: curve('mrt'), color: PALETTE[1], width: 1.8 }, { points: curve('zf'), color: PALETTE[2], width: 1.8 }], vlines: [{ x: angles[1], color: PALETTE[1] }, { x: angles[0], color: PALETTE[0] }],
                legend: [{ label: 'MRT', color: PALETTE[1] }, { label: 'zero-forcing', color: PALETTE[2] }] });
        }
    },
};

function canvasCtx(cv) {
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth || 400, H = cv.clientHeight || 300;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = cssVar('--panel2'); g.fillRect(0, 0, W, H);
    return { g, W, H };
}

function drawPolar(cv, { N, d, W: weights, angles }) {
    const { g, W, H } = canvasCtx(cv), text = cssVar('--text'), dim = cssVar('--dim'), line = cssVar('--line');
    g.fillStyle = text; g.font = '600 12px DM Sans, sans-serif'; g.textAlign = 'left'; g.fillText('Diagrama de radiação (plano do arranjo)', 12, 18);
    const top = Math.max(3, Math.ceil(D.lin2db(N) / 3) * 3 + 1), floor = -20, cx = W / 2, cy = H - 30, R = Math.min(W / 2 - 34, H - 64);
    const rad = db => R * Math.max(0, (db - floor) / (top - floor));
    g.font = '10px JetBrains Mono, monospace';
    for (let db = floor + 5; db <= top; db += 5) {
        g.strokeStyle = db === 0 ? dim : line; g.lineWidth = db === 0 ? 1.4 : 1; g.beginPath(); g.arc(cx, cy, rad(db), Math.PI, 2 * Math.PI); g.stroke();
        g.fillStyle = dim; g.textAlign = 'left'; g.fillText(`${db} dB`, cx + rad(db) + 2, cy + 12);
    }
    for (let a = -90; a <= 90; a += 30) {
        const t = a * Math.PI / 180; g.strokeStyle = line; g.lineWidth = 1; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + R * Math.sin(t), cy - R * Math.cos(t)); g.stroke();
        g.fillStyle = dim; g.textAlign = 'center'; g.fillText(`${a}°`, cx + (R + 14) * Math.sin(t), cy - (R + 14) * Math.cos(t) + 3);
    }
    weights.forEach((w, k) => {
        g.beginPath();
        for (let a = -90; a <= 90; a += .25) { const t = a * Math.PI / 180, r = rad(D.lin2db(Math.max(D.patternGain(w, N, d, a) * weights.length, 1e-6))); const x = cx + r * Math.sin(t), y = cy - r * Math.cos(t); a === -90 ? g.moveTo(x, y) : g.lineTo(x, y); }
        g.strokeStyle = PALETTE[k]; g.lineWidth = 2; g.stroke();
        g.lineTo(cx, cy); g.closePath(); g.globalAlpha = .1; g.fillStyle = PALETTE[k]; g.fill(); g.globalAlpha = 1;
    });
    angles.forEach((a, k) => {
        const t = a * Math.PI / 180; g.setLineDash([5, 4]); g.strokeStyle = PALETTE[k]; g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + R * Math.sin(t), cy - R * Math.cos(t)); g.stroke(); g.setLineDash([]);
        g.fillStyle = PALETTE[k]; g.font = '600 11px DM Sans, sans-serif'; g.textAlign = 'center'; g.fillText(`U${k + 1}`, cx + (R - 12) * Math.sin(t) + 10, cy - (R - 12) * Math.cos(t));
    });
    g.fillStyle = text; g.fillRect(cx - 30, cy - 1, 60, 2);
    g.fillStyle = dim; g.font = '10px DM Sans, sans-serif'; g.textAlign = 'center'; g.fillText(`arranjo de ${N} antenas · ganho relativo a 1 antena (por usuário)`, cx, H - 8);
}

let anim = null;
const viridis = t => { const st = [[68, 1, 84], [59, 82, 139], [33, 145, 140], [94, 201, 98], [253, 231, 37]], x = Math.max(0, Math.min(1, t)) * 4, i = Math.min(3, Math.floor(x)), f = x - i; return st[i].map((v, j) => v + (st[i + 1][j] - v) * f); };
function drawField(cv, { N, d, W: weights, angles, view }) {
    const { g, W, H } = canvasCtx(cv), depth = 16, width = depth * W / H, cell = 3, gw = Math.ceil(W / cell), gh = Math.ceil(H / cell);
    const xs = Array.from({ length: N }, (_, n) => (n - (N - 1) / 2) * d);
    const fields = (view === 'wave' ? weights.slice(0, 1) : weights).map(() => ({ re: new Float32Array(gw * gh), im: new Float32Array(gw * gh) }));
    let peak = 0;
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
        const x = (i / gw - .5) * width, y = (1 - j / gh) * depth + .05, idx = j * gw + i;
        let power = 0;
        fields.forEach((f, k) => {
            let re = 0, im = 0;
            for (let n = 0; n < N; n++) { const w = weights[k][n], ph = -2 * Math.PI * Math.hypot(x - xs[n], y), c = Math.cos(ph), s = Math.sin(ph); re += w.re * c - w.im * s; im += w.re * s + w.im * c; }
            f.re[idx] = re; f.im[idx] = im; power += re * re + im * im;
        });
        if (power > peak) peak = power;
    }
    const off = document.createElement('canvas'); off.width = gw; off.height = gh;
    const og = off.getContext('2d'), img = og.createImageData(gw, gh), bg = cssVar('--panel2'), light = document.documentElement.dataset.theme === 'light';
    const paint = phase => {
        const c = Math.cos(phase), s = Math.sin(phase);
        for (let idx = 0; idx < gw * gh; idx++) {
            let rgb;
            if (view === 'wave') {
                const v = (fields[0].re[idx] * c - fields[0].im[idx] * s) / Math.sqrt(peak || 1), a = Math.min(1, Math.abs(v) * 1.4), base = light ? [241, 245, 249] : [18, 26, 41], tone = v > 0 ? [244, 184, 96] : [81, 213, 230];
                rgb = base.map((b, q) => b + (tone[q] - b) * a);
            } else {
                let p = 0; for (const f of fields) p += f.re[idx] ** 2 + f.im[idx] ** 2;
                rgb = viridis((D.lin2db(p / (peak || 1) + 1e-9) + 30) / 30);
            }
            img.data[idx * 4] = rgb[0]; img.data[idx * 4 + 1] = rgb[1]; img.data[idx * 4 + 2] = rgb[2]; img.data[idx * 4 + 3] = 255;
        }
        og.putImageData(img, 0, 0);
        g.imageSmoothingEnabled = true; g.drawImage(off, 0, 0, gw * cell, gh * cell);
        const sx = W / width, ox = W / 2, oy = H;
        g.fillStyle = '#fff'; xs.forEach(x => { g.beginPath(); g.arc(ox + x * sx, oy - 4, 2.6, 0, 2 * Math.PI); g.fill(); });
        angles.forEach((a, k) => {
            const t = a * Math.PI / 180, r = depth * .82 * sx, X = ox + r * Math.sin(t), Y = oy - r * Math.cos(t);
            g.strokeStyle = '#fff'; g.lineWidth = 2; g.fillStyle = PALETTE[k]; g.beginPath(); g.arc(X, Y, 7, 0, 2 * Math.PI); g.fill(); g.stroke();
            g.fillStyle = '#fff'; g.font = '600 11px DM Sans, sans-serif'; g.textAlign = 'center'; g.fillText(`U${k + 1}`, X, Y - 11);
        });
        g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(8, 6, 250, 20); g.fillStyle = '#fff'; g.font = '600 12px DM Sans, sans-serif'; g.textAlign = 'left';
        g.fillText(view === 'wave' ? 'Frente de onda Re{E} · feixe do usuário 1' : 'Intensidade |E|² (dB, 30 dB de faixa)', 14, 20);
    };
    if (anim) cancelAnimationFrame(anim), anim = null;
    if (view === 'wave') { const t0 = performance.now(), loop = now => { if (!cv.isConnected) return; paint(-(now - t0) / 1000 * 2 * Math.PI * .6); anim = requestAnimationFrame(loop); }; anim = requestAnimationFrame(loop); }
    else paint(0);
}

// ======================================================================
// 7. OFDM (reuses the network lab's OFDM module in manual mode)
// ======================================================================
const ofdm = {
    id: 'ofdm', nav: 'OFDM', sub: 'subportadoras · CP', custom: true,
    state: { ...defaultOfdmState(), follow: false },
    theory: THEORY.ofdm,
    render(el, s) { renderOfdm(el, s, null, null); },
};

// ======================================================================
// 8. MCS selection and the Shannon gap
// ======================================================================
const mcsColor = i => `hsl(${210 - i * 15} 75% 60%)`;
const mcs = {
    id: 'mcs', nav: 'MCS & Shannon', sub: 'adaptação de enlace',
    state: { standard: 'wifi6', width: 80, gi: .8, nss: 1, snrDb: 25 },
    structural: ['standard'],
    normalize(s) { const std = STANDARDS[s.standard]; if (!std.widths.includes(+s.width)) s.width = std.widths[0]; if (!std.gis.includes(+s.gi)) s.gi = std.gis[0]; },
    theory: THEORY.mcs,
    controls: s => { const std = STANDARDS[s.standard]; return C.select('standard', 'Padrão', s.standard, STANDARD_ORDER.map(k => [k, STANDARDS[k].label]))
        + C.select('width', 'Largura', s.width, std.widths.map(w => [w, `${w} MHz`])) + C.select('gi', 'GI', s.gi, std.gis.map(g => [g, `${g} µs`]))
        + C.select('nss', 'Fluxos', s.nss, [1, 2, 3, 4]) + C.range('snrDb', 'SNR por fluxo', s.snrDb, -5, 55, .5, ' dB'); },
    cards: () => [
        { id: 'stairs', cap: 'Eficiência por subportadora (k·R<sub>c</sub> bits) × SNR: os degraus são os MCS (PER ≤ 10%); a curva é log₂(1 + SNR). A distância horizontal entre o degrau e a curva é o gap para Shannon.' },
        { id: 'per', cap: 'PER × SNR de cada MCS (MPDU 1538 B). A linha vertical é a SNR atual; o MCS escolhido é o mais alto com PER abaixo de 10%.' },
        { id: 'rate', cap: 'Taxa PHY do melhor MCS × SNR, comparada à capacidade de Shannon na mesma largura e número de fluxos.' },
        { id: 'table', html: true, cap: 'Tabela MCS do padrão escolhido. Destaque: MCS em uso na SNR atual.' },
    ],
    draw(s, ctx) {
        const std = STANDARDS[s.standard], max = std.maxMcs, w = +s.width, gi = +s.gi, nss = +s.nss, snr = +s.snrDb;
        const list = MCS.slice(0, max + 1).map((m, i) => ({ i, m, k: Math.log2(m.M), eta: Math.log2(m.M) * m.rate, req: requiredSnr(i), valid: mcsValid(s.standard, w, i, nss), rate: dataRate(s.standard, w, i, nss, gi) }));
        const best = x => list.filter(q => q.valid && q.req <= x).reduce((a, q) => !a || q.rate > a.rate ? q : a, null);
        const chosen = best(snr), cap = nss * w * Math.log2(1 + D.db2lin(snr));
        plot(ctx.cv('stairs'), { title: `Eficiência por subportadora · ${std.short}`, x: { min: -5, max: 50, label: 'SNR por fluxo (dB)' }, y: { min: 0, max: 12, label: 'bits por subportadora' },
            series: [{ points: sweep(-5, 50, .1, x => best(x)?.eta || 0), color: PALETTE[0], width: 2, step: true }, { points: sweep(-5, 50, .25, x => Math.log2(1 + D.db2lin(x))), color: PALETTE[2], width: 1.6, endLabel: 'Shannon' }],
            markers: [...list.filter(q => q.valid).map(q => ({ x: q.req, y: q.eta, color: mcsColor(q.i), size: 3, label: String(q.i) })), ...(chosen ? [{ x: snr, y: chosen.eta, color: PALETTE[1], size: 6, label: `MCS ${chosen.i}` }] : [])],
            vlines: [{ x: snr, color: PALETTE[1] }], segments: chosen ? [{ x0: D.lin2db(2 ** chosen.eta - 1), y0: chosen.eta, x1: chosen.req, y1: chosen.eta, color: RED }] : [] });
        plot(ctx.cv('per'), { title: 'PER × SNR por MCS', x: { min: -5, max: 50, label: 'SNR por fluxo (dB)' }, y: { min: -4, max: 0, log: true, label: 'PER' },
            series: list.filter(q => q.valid).map(q => ({ points: aboveFloor(sweep(-5, 50, .2, x => packetErrorRate(x, q.i)), -4), color: mcsColor(q.i), width: chosen?.i === q.i ? 2.6 : 1.1 })),
            hlines: [{ y: .1, label: 'PER 10%' }], vlines: [{ x: snr, color: PALETTE[1] }] });
        plot(ctx.cv('rate'), { title: `Taxa × SNR · ${w} MHz · ${nss} fluxo(s) · GI ${gi} µs`, x: { min: -5, max: 50, label: 'SNR por fluxo (dB)' }, y: { min: 0, max: nss * w * Math.log2(1 + D.db2lin(50)) * 1.05, label: 'Mb/s' },
            series: [{ points: sweep(-5, 50, .1, x => best(x)?.rate || 0), color: PALETTE[0], width: 2, step: true }, { points: sweep(-5, 50, .25, x => nss * w * Math.log2(1 + D.db2lin(x))), color: PALETTE[2], width: 1.6, endLabel: 'Shannon' }],
            markers: chosen ? [{ x: snr, y: chosen.rate, color: PALETTE[1], label: `${f1(chosen.rate, 0)} Mb/s` }] : [], vlines: [{ x: snr, color: PALETTE[1] }] });
        ctx.html('table', `<table class="mini"><tr><th>MCS</th><th>Modulação</th><th>R<sub>c</sub></th><th>bits/subp.</th><th>SNR mín.</th><th>Eb/N0 mín.</th><th>Gap</th><th>Mb/s</th><th>PER agora</th></tr>${list.map(q => `<tr class="${chosen?.i === q.i ? 'chosen' : ''} ${q.valid ? '' : 'invalid'}"><td>${q.i}</td><td>${q.m.label}</td><td>${q.m.code}</td><td>${f1(q.eta, 2)}</td><td>${f1(q.req)} dB</td><td>${f1(q.req - D.lin2db(q.eta))} dB</td><td>${f1(q.req - D.lin2db(2 ** q.eta - 1))} dB</td><td>${q.valid ? f1(q.rate) : '—'}</td><td>${sci(packetErrorRate(snr, q.i))}</td></tr>`).join('')}</table>`);
        ctx.strip(metric('MCS escolhido', chosen ? `MCS ${chosen.i}` : 'nenhum', chosen ? `${chosen.m.label} · R = ${chosen.m.code}` : 'SNR abaixo do MCS 0')
            + metric('Es/N0 · Eb/N0', chosen ? `${f1(snr)} / ${f1(snr - D.lin2db(chosen.eta))} dB` : '—', chosen ? `−10·log₁₀(${chosen.k}·${chosen.m.code}) = −${f1(D.lin2db(chosen.eta), 2)} dB` : '')
            + metric('Taxa PHY', chosen ? `${f1(chosen.rate)} Mb/s` : '0', chosen ? `${nss}·${std.subcarriers[w]}·${chosen.k}·${chosen.m.code}/(${std.symbol}+${gi}) µs` : '')
            + metric('Capacidade de Shannon', `${f1(cap, 0)} Mb/s`, `${nss}·${w} MHz·log₂(1+SNR)`)
            + metric('Eficiência', chosen ? `${f1(100 * chosen.rate / cap, 0)}%` : '—', 'taxa PHY / capacidade')
            + metric('Gap para Shannon', chosen ? `${f1(chosen.req - D.lin2db(2 ** chosen.eta - 1))} dB` : '—', chosen ? `SNR exigida ${f1(chosen.req)} vs mínimo ${f1(D.lin2db(2 ** chosen.eta - 1))} dB` : '')
            + metric('Margem', chosen ? `${f1(snr - chosen.req)} dB` : '—', 'acima do limiar do MCS'));
    },
};

// ======================================================================
// Page shell
// ======================================================================
const LESSONS = [mod, pulse, ber, fec, fading, bf, ofdm, mcs];
const main = $('#lesson');
let current = LESSONS[0], pending = 0;

function setKey(s, key, value) {
    const i = key.indexOf('.');
    if (i < 0) s[key] = value; else s[key.slice(0, i)][key.slice(i + 1)] = value;
}
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
    L.normalize?.(s);
    main.className = `lesson lesson-${L.id}`;
    main.innerHTML = `<article class="theory">${L.theory(s)}</article><section class="work">${L.custom ? '<div data-custom></div>'
        : `<div class="ofdm-controls">${L.controls(s)}</div><div class="ofdm-strip" data-strip></div><div class="plots-grid">${L.cards(s).map(card).join('')}</div>`}</section>`;
    typeset($('.theory', main));
    update();
}
function update() {
    const L = current;
    if (L.custom) { L.render($('[data-custom]', main), L.state); return; }
    L.draw(L.state, {
        cv: id => $(`[data-plot="${id}"]`, main),
        html: (id, h) => { const e = $(`[data-html="${id}"]`, main); if (e) e.innerHTML = h; },
        strip: h => { $('[data-strip]', main).innerHTML = h; },
    });
}
const scheduleUpdate = () => { if (!pending) pending = requestAnimationFrame(() => { pending = 0; update(); }); };

function show(id) {
    const next = LESSONS.find(l => l.id === id) || LESSONS[0];
    if (next !== current) stopJobs();
    current = next;
    if (anim) cancelAnimationFrame(anim), anim = null;
    renderNav(); renderLesson();
}

// Presets from the network lab: fisica.html?lesson=mcs&std=wifi6&w=80&gi=0.8&nss=2&snr=27.4&M=64&ntx=4&angle=23
function applyPresets() {
    const q = new URLSearchParams(location.search), num = k => q.has(k) && Number.isFinite(+q.get(k)) ? +q.get(k) : null;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v)), half = v => Math.round(v * 2) / 2;
    const snr = num('snr'), M = num('M'), std = q.get('std');
    if (M && (D.FAMILIES.qam.includes(M) || M === 2)) Object.assign(mod.state, { family: M === 2 ? 'psk' : 'qam', M });
    if (snr !== null) { Object.assign(mod.state, { ref: 'es', snrDb: half(clamp(snr, -5, 40)) }); mcs.state.snrDb = half(clamp(snr, -5, 55)); fading.state.avgDb = Math.round(clamp(snr, 0, 30)); ofdm.state.snrDb = Math.round(clamp(snr, -5, 60)); }
    if (std && STANDARDS[std]) { mcs.state.standard = std; ofdm.state.standard = std; }
    for (const [key, target] of [['w', 'width'], ['gi', 'gi']]) if (num(key) !== null) { mcs.state[target] = num(key); ofdm.state[target] = num(key); }
    if (num('nss') !== null) mcs.state.nss = clamp(num('nss'), 1, 4);
    if (M) ofdm.state.M = M;
    if (num('ntx') !== null) bf.state.N = clamp(Math.round(num('ntx')), 1, 16);
    if (num('angle') !== null) bf.state.a1 = Math.round(clamp(num('angle'), -90, 90));
    const lesson = q.get('lesson');
    if (lesson && !location.hash) history.replaceState(null, '', `${location.pathname}${location.search}#${lesson}`);
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
        setKey(current.state, el.dataset.k, +el.value);
        el.nextElementSibling.textContent = `${el.value}${el.dataset.unit || ''}`;
        scheduleUpdate();
    });
    main.addEventListener('change', e => {
        const el = e.target, L = current;
        if (L.custom) {
            const key = el.dataset.ofdm; if (!key) return;
            const o = L.state;
            if (key === 'pilotTracking') o.pilotTracking = el.checked;
            else if (key === 'cfo') o.cfo = Math.max(0, +el.value) / 100;
            else if (['width', 'gi', 'M', 'snrDb', 'symbols'].includes(key)) o[key] = +el.value;
            else if (key !== 'follow') o[key] = el.value;
            update();
            return;
        }
        if (!el.dataset.k || el.type === 'range') return;
        setKey(L.state, el.dataset.k, parseValue(el));
        L.onChange?.(L.state, el.dataset.k);
        if (L.structural?.includes(el.dataset.k)) renderLesson(); else update();
    });
    main.addEventListener('click', e => {
        if (current.custom) { if (e.target.closest('[data-ofdm-action="reseed"]')) { current.state.seed++; update(); } return; }
        const b = e.target.closest('[data-act]'); if (!b) return;
        current.actions?.[b.dataset.act]?.(current.state);
        update();
    });
    let resize = 0;
    addEventListener('resize', () => { clearTimeout(resize); resize = setTimeout(update, 120); });
    // KaTeX comes from a CDN: if it was not ready at the first render, typeset once it has loaded.
    addEventListener('load', () => typeset($('.theory', main)));
    applyPresets();
    show(location.hash.slice(1) || 'mod');
}
init();
