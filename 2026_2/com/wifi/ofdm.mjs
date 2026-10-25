// Baseband OFDM link with 802.11 numerology: QAM per subcarrier → IFFT → CP → multipath/CFO/AWGN →
// FFT → channel estimate (ideal or LTF) → pilot phase tracking → ZF/MMSE → decisions.
// Mapping and decisions reuse the Block Studio processors so both tools share one QAM definition.
import { createProcessors, defs } from '../sim/blocks.js';
import { radix2FFT, rng, gaussian } from '../sim/utils.js';
import { STANDARDS, uncodedBer } from './phy.mjs';

const proc = createProcessors([]);
const node = (type, config = {}) => ({ type, config: { ...Object.fromEntries(Object.entries(defs[type].config).map(([k, s]) => [k, s.value])), ...config } });

// IEEE 802.11 TGn models: exponential power delay profile (rms spread τ, truncated at the maximum excess delay).
export const MULTIPATH_PROFILES = {
    none: { label: 'Sem multipercurso (só AWGN)', rms: 0, max: 0 },
    B: { label: 'TGn B · residencial (τrms 15 ns)', rms: 15, max: 80 },
    C: { label: 'TGn C · escritório pequeno (30 ns)', rms: 30, max: 200 },
    D: { label: 'TGn D · escritório típico (50 ns)', rms: 50, max: 390 },
    E: { label: 'TGn E · escritório grande (100 ns)', rms: 100, max: 730 },
    F: { label: 'TGn F · galpão / externo (150 ns)', rms: 150, max: 1050 },
    tworay: { label: 'Dois raios: eco em 400 ns', taps: [[0, 1], [400, .8]] },
    echo: { label: 'Eco forte em 2 µs (maior que o CP)', taps: [[0, 1], [2000, .7]] },
};

const PILOTS = {
    'HT:20': [7, 21], 'HT:40': [11, 25, 53], 'HT:80': [11, 39, 75, 103],
    'HE:20': [22, 48, 90, 116], 'HE:40': [10, 36, 78, 104, 144, 170, 212, 238], 'HE:80': [24, 92, 158, 226, 266, 334, 400, 468],
};
const PILOT_COUNT = { HT: { 20: 4, 40: 6, 80: 8, 160: 16 }, HE: { 20: 8, 40: 16, 80: 16, 160: 32, 320: 64 } };
const DC_NULLS = { HT: { 20: 1 }, HE: { 20: 3 } };

export function numerology(standard, width, gi) {
    const family = STANDARDS[standard].rank >= 6 ? 'HE' : 'HT', N = (family === 'HE' ? 256 : 64) * width / 20;
    const nsd = STANDARDS[standard].subcarriers[width], nsp = PILOT_COUNT[family][width], dc = DC_NULLS[family][width] ?? (family === 'HE' ? 5 : 3);
    const side = (nsd + nsp) / 2, first = (dc + 1) / 2;
    const used = [];
    for (let k = first; k < first + side; k++) used.push(-k, k);
    used.sort((a, b) => a - b);
    let pilots = PILOTS[`${family}:${width}`]?.flatMap(p => [-p, p]);
    if (!pilots) { const step = used.length / nsp; pilots = Array.from({ length: nsp }, (_, i) => used[Math.floor((i + .5) * step)]); }
    const pilotSet = new Set(pilots), data = used.filter(k => !pilotSet.has(k));
    const tsym = family === 'HE' ? 12.8 : 3.2, cp = Math.round(gi * width);
    return { family, standard, width, gi, N, cp, fs: width, spacing: width / N, tsym, used, pilots: [...pilotSet].sort((a, b) => a - b), data, nsd: data.length, nsp: pilotSet.size, guards: N - used.length - dc, dc, efficiency: tsym / (tsym + gi) };
}

// Sample-spaced channel taps (Σ|h|² = 1) from a profile, at the OFDM sampling rate.
export function channelTaps(profileKey, fsMhz, seed = 1) {
    const p = MULTIPATH_PROFILES[profileKey], r = rng(seed * 7919 + 3), ts = 1000 / fsMhz;
    let raw;
    if (p.taps) raw = p.taps.map(([tau, a], i) => { const ph = i ? 2 * Math.PI * r() : 0; return [tau, { re: a * Math.cos(ph), im: a * Math.sin(ph) }]; });
    else if (!p.rms) raw = [[0, { re: 1, im: 0 }]];
    else { raw = []; for (let tau = 0; tau <= p.max; tau += 10) { const s = Math.sqrt(Math.exp(-tau / p.rms) / 2); raw.push([tau, { re: s * gaussian(r), im: s * gaussian(r) }]); } }
    const h = [];
    for (const [tau, g] of raw) { const i = Math.round(tau / ts); h[i] ||= { re: 0, im: 0 }; h[i].re += g.re; h[i].im += g.im; }
    for (let i = 0; i < h.length; i++) h[i] ||= { re: 0, im: 0 };
    const energy = h.reduce((s, z) => s + z.re ** 2 + z.im ** 2, 0) || 1, norm = 1 / Math.sqrt(energy);
    const taps = h.map(z => ({ re: z.re * norm, im: z.im * norm }));
    const power = taps.map(z => z.re ** 2 + z.im ** 2), mean = power.reduce((s, q, i) => s + q * i, 0), meanSq = power.reduce((s, q, i) => s + q * i * i, 0);
    const lastSignificant = power.reduce((last, q, i) => q > 1e-4 ? i : last, 0);
    return { taps, ts, delays: taps.map((_, i) => i * ts), power, rmsNs: Math.sqrt(Math.max(0, meanSq - mean * mean)) * ts, maxNs: lastSignificant * ts, maxSamples: lastSignificant };
}

const bin = (k, N) => (k + N) % N;
const cmul = (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
const cdiv = (a, b) => { const d = b.re * b.re + b.im * b.im || 1e-30; return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d }; };
function unitaryFft(re, im, inverse) { radix2FFT(re, im, inverse); const s = inverse ? Math.sqrt(re.length) : 1 / Math.sqrt(re.length); for (let i = 0; i < re.length; i++) { re[i] *= s; im[i] *= s; } }

function mapSymbols(M, bits) {
    return (M === 2 ? proc.bpsk(node('bpsk'), { bits }) : proc.qam(node('qam', { M }), { bits })).symbols.data;
}
function decide(M, symbols) {
    return M === 2 ? proc.hard_bpsk(node('hard_bpsk'), { symbols }).bits : proc.hard_qam(node('hard_qam', { M }), { symbols }).bits;
}

// params: { standard, width, gi, M, snrDb, profile, cfo (fraction of Δf), estimation: 'ideal'|'ltf', equalizer: 'none'|'zf'|'mmse', pilotTracking, symbols, seed }
export function simulateOfdm(params) {
    const num = numerology(params.standard, +params.width, +params.gi), { N, cp, data, pilots, used } = num;
    const M = +params.M, k = Math.log2(M), nSym = Math.max(1, +params.symbols || 12), r = rng(params.seed * 131 + 17);
    const channel = channelTaps(params.profile, num.fs, params.seed), h = channel.taps;
    const sigma2 = 10 ** (-params.snrDb / 10), ltf = params.estimation === 'ltf';
    // Frequency response of the (circular) channel on every bin.
    const Hre = new Float64Array(N), Him = new Float64Array(N);
    h.forEach((z, n) => { if (n < N) { Hre[n] = z.re; Him[n] = z.im; } });
    radix2FFT(Hre, Him, false);
    const H = k_ => ({ re: Hre[bin(k_, N)], im: Him[bin(k_, N)] });

    const bits = Array.from({ length: nSym * data.length * k }, () => r() < .5 ? 1 : 0);
    const dataSymbols = mapSymbols(M, bits), ltfSign = used.map(() => r() < .5 ? -1 : 1);
    const frames = [];   // frequency-domain grids
    if (ltf) frames.push(Object.fromEntries(used.map((kk, i) => [kk, { re: ltfSign[i], im: 0 }])));
    for (let s = 0; s < nSym; s++) {
        const grid = {};
        data.forEach((kk, i) => { grid[kk] = dataSymbols[s * data.length + i]; });
        pilots.forEach(kk => { grid[kk] = { re: 1, im: 0 }; });
        frames.push(grid);
    }
    // Transmit: IFFT + cyclic prefix.
    const tx = [];
    for (const grid of frames) {
        const re = new Float64Array(N), im = new Float64Array(N);
        for (const [kk, z] of Object.entries(grid)) { re[bin(+kk, N)] = z.re; im[bin(+kk, N)] = z.im; }
        unitaryFft(re, im, true);
        for (let n = N - cp; n < N; n++) tx.push({ re: re[n], im: im[n] });
        for (let n = 0; n < N; n++) tx.push({ re: re[n], im: im[n] });
    }
    // Channel: linear convolution, carrier frequency offset, AWGN (noise-free copy kept to measure ISI/ICI).
    const L = tx.length, clean = new Array(L), rx = new Array(L), eps = +params.cfo || 0, nr = rng(params.seed * 977 + 5), sd = Math.sqrt(sigma2 / 2);
    for (let n = 0; n < L; n++) {
        let re = 0, im = 0;
        for (let m = 0; m < h.length && m <= n; m++) { const a = tx[n - m], b = h[m]; re += a.re * b.re - a.im * b.im; im += a.re * b.im + a.im * b.re; }
        const ph = 2 * Math.PI * eps * n / N, c = Math.cos(ph), s = Math.sin(ph);
        clean[n] = { re: re * c - im * s, im: re * s + im * c };
        rx[n] = { re: clean[n].re + sd * gaussian(nr), im: clean[n].im + sd * gaussian(nr) };
    }
    // Receive: drop CP, FFT each symbol.
    const fft = (signal, f) => { const start = f * (N + cp) + cp, re = new Float64Array(N), im = new Float64Array(N); for (let n = 0; n < N; n++) { re[n] = signal[start + n].re; im[n] = signal[start + n].im; } unitaryFft(re, im, false); return kk => ({ re: re[bin(kk, N)], im: im[bin(kk, N)] }); };
    const Yall = frames.map((_, f) => fft(rx, f)), Yclean = frames.map((_, f) => fft(clean, f));
    const Hest = {};
    for (const kk of used) Hest[kk] = ltf ? cdiv(Yall[0](kk), frames[0][kk]) : H(kk);
    // Distortion power (ISI + ICI) relative to the ideal circular model H·X.
    // The common phase rotation of each symbol (CFO) is removed first: what remains is true ISI + ICI.
    let dist = 0, sig = 0;
    for (let f = ltf ? 1 : 0; f < frames.length; f++) {
        let cr = 0, ci = 0;
        for (const kk of used) { const ideal = cmul(H(kk), frames[f][kk]), y = Yclean[f](kk); cr += y.re * ideal.re + y.im * ideal.im; ci += y.im * ideal.re - y.re * ideal.im; }
        const phi = Math.atan2(ci, cr), c = Math.cos(phi), sn = Math.sin(phi);
        for (const kk of used) { const ideal = cmul(H(kk), frames[f][kk]), y = Yclean[f](kk), re = y.re * c + y.im * sn, im = y.im * c - y.re * sn; dist += (re - ideal.re) ** 2 + (im - ideal.im) ** 2; sig += ideal.re ** 2 + ideal.im ** 2; }
    }

    const rxRaw = [], eq = [], phases = [], perSc = data.map(() => ({ errors: 0, bits: 0, evm: 0 }));
    let errors = 0;
    for (let s = 0; s < nSym; s++) {
        const f = s + (ltf ? 1 : 0), Y = Yall[f];
        let phi = 0;
        if (params.pilotTracking) { let re = 0, im = 0; for (const kk of pilots) { const ref = cmul(Hest[kk], frames[f][kk]), y = Y(kk); re += y.re * ref.re + y.im * ref.im; im += y.im * ref.re - y.re * ref.im; } phi = Math.atan2(im, re); }
        phases.push(phi);
        const rot = { re: Math.cos(-phi), im: Math.sin(-phi) }, symEq = [];
        data.forEach((kk, i) => {
            const y = cmul(Y(kk), rot), hk = Hest[kk];
            let z;
            if (params.equalizer === 'zf') z = cdiv(y, hk);
            else if (params.equalizer === 'mmse') { const g = hk.re ** 2 + hk.im ** 2 + sigma2; z = { re: (y.re * hk.re + y.im * hk.im) / g, im: (y.im * hk.re - y.re * hk.im) / g }; }
            else z = y;
            rxRaw.push({ k: kk, z: Y(kk) }); eq.push({ k: kk, z, i }); symEq.push(z);
            const x = frames[f][kk]; perSc[i].evm += (z.re - x.re) ** 2 + (z.im - x.im) ** 2;
        });
        const decided = decide(M, symEq);
        for (let i = 0; i < data.length; i++) for (let b = 0; b < k; b++) {
            const e = decided[i * k + b] !== bits[(s * data.length + i) * k + b];
            errors += e; perSc[i].errors += e; perSc[i].bits++;
        }
    }
    const gamma = 1 / sigma2, snrPerSc = data.map(kk => { const z = H(kk); return 10 * Math.log10((z.re ** 2 + z.im ** 2) * gamma + 1e-30); });
    const fadedTheory = data.reduce((s, kk) => { const z = H(kk); return s + uncodedBer(M, (z.re ** 2 + z.im ** 2) * gamma / k); }, 0) / data.length;
    return {
        params, num, channel, M, k, sigma2, frames, tx, rx, clean, ltf,
        H: used.map(kk => ({ k: kk, h: H(kk), est: Hest[kk] })), snrPerSc,
        rxRaw, eq, phases, perSc: perSc.map((p, i) => ({ k: data[i], ber: p.errors / p.bits, evm: Math.sqrt(p.evm / nSym) })),
        ber: errors / bits.length, bits: bits.length, errors,
        evm: Math.sqrt(perSc.reduce((s, p) => s + p.evm, 0) / (nSym * data.length)),
        distortionDb: sig ? 10 * Math.log10(dist / sig + 1e-30) : -Infinity,
        theory: { awgn: uncodedBer(M, gamma / k), faded: fadedTheory },
        coherenceBandwidth: channel.rmsNs > 0 ? 1000 / (5 * channel.rmsNs) : Infinity,
    };
}

// Time-domain view of one symbol: a few individual subcarriers and their sum (the transmitted OFDM symbol).
export function subcarrierWaveforms(sim, symbolIndex = 0, count = 4) {
    const { N, cp } = sim.num, grid = sim.frames[symbolIndex + (sim.ltf ? 1 : 0)];
    const chosen = sim.num.data.filter(k => k > 0).slice(0, count);
    const wave = kk => Array.from({ length: N + cp }, (_, i) => { const n = i - cp, ph = 2 * Math.PI * kk * n / N, x = grid[kk]; return [n, (x.re * Math.cos(ph) - x.im * Math.sin(ph)) / Math.sqrt(N)]; });
    const offset = (symbolIndex + (sim.ltf ? 1 : 0)) * (N + cp);
    return { chosen, waves: chosen.map(wave), sum: Array.from({ length: N + cp }, (_, i) => [i - cp, sim.tx[offset + i].re]) };
}

// Averaged periodogram (Hann) of the transmitted signal; frequency in MHz around the carrier.
export function txSpectrum(sim, size = 4) {
    const { N, fs } = sim.num, nfft = N * size, acc = new Float64Array(nfft), tx = sim.tx;
    let segments = 0;
    for (let start = 0; start + nfft <= tx.length; start += nfft / 2, segments++) {
        const re = new Float64Array(nfft), im = new Float64Array(nfft);
        for (let n = 0; n < nfft; n++) { const w = .5 - .5 * Math.cos(2 * Math.PI * n / (nfft - 1)); re[n] = tx[start + n].re * w; im[n] = tx[start + n].im * w; }
        radix2FFT(re, im, false);
        for (let i = 0; i < nfft; i++) acc[i] += re[i] ** 2 + im[i] ** 2;
    }
    if (!segments) return [];
    const peak = Math.max(...acc);
    return Array.from({ length: nfft }, (_, i) => { const j = (i + nfft / 2) % nfft; return [(i - nfft / 2) * fs / nfft, 10 * Math.log10(acc[j] / peak + 1e-12)]; });
}
