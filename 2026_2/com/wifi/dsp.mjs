// Digital-communications core for the PHY lessons: constellations and mapping, AWGN/Rayleigh theory,
// Monte Carlo BER, the 802.11 BCC (K = 7, 133/171₈) with puncturing and Viterbi, diversity combining,
// and uniform-linear-array beamforming. Pure functions only (no DOM), so everything is testable in Node.
import { qFunction } from '../sim/utils.js';

export const db2lin = db => 10 ** (db / 10);
export const lin2db = x => 10 * Math.log10(x);
export { qFunction };

// ---------- random numbers ----------
// mulberry32 + polar Box–Muller: an LCG's consecutive pairs fall on lattices and bias low-BER estimates.
export function prng(seed = 1) {
    let a = (seed >>> 0) || 1, spare = null;
    const u = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    u.normal = () => {
        if (spare !== null) { const s = spare; spare = null; return s; }
        let x, y, s;
        do { x = 2 * u() - 1; y = 2 * u() - 1; s = x * x + y * y; } while (s >= 1 || s === 0);
        const f = Math.sqrt(-2 * Math.log(s) / s);
        spare = y * f;
        return x * f;
    };
    return u;
}

// ---------- constellations ----------
const gray = n => n ^ (n >> 1);
export const FAMILIES = { psk: [2, 4, 8, 16, 32], qam: [4, 16, 64, 256, 1024] };
export const schemeLabel = (family, M) => M === 2 ? 'BPSK' : M === 4 ? (family === 'psk' ? 'QPSK' : '4-QAM') : `${M}-${family === 'psk' ? 'PSK' : 'QAM'}`;

// points[label] = {re, im} with Es = 1. Gray: neighbours differ in one bit; natural: label = position index.
export function constellation(family, M, mapping = 'gray') {
    const k = Math.log2(M), points = new Array(M);
    const code = mapping === 'gray' ? gray : n => n;
    if (family === 'psk') {
        const offset = M === 4 ? Math.PI / 4 : 0;
        for (let m = 0; m < M; m++) points[code(m)] = { re: Math.cos(offset + 2 * Math.PI * m / M), im: Math.sin(offset + 2 * Math.PI * m / M) };
        const decide = z => { let m = Math.round((Math.atan2(z.im, z.re) - offset) * M / (2 * Math.PI)); m = ((m % M) + M) % M; return code(m); };
        return { family, M, k, mapping, points, decide, dmin: 2 * Math.sin(Math.PI / M), offset };
    }
    const L = Math.round(Math.sqrt(M)), half = k / 2, norm = Math.sqrt(2 * (M - 1) / 3);
    for (let i = 0; i < L; i++) for (let q = 0; q < L; q++) points[(code(i) << half) | code(q)] = { re: (2 * i - L + 1) / norm, im: (2 * q - L + 1) / norm };
    const slice = v => Math.min(L - 1, Math.max(0, Math.round((v * norm + L - 1) / 2)));
    const decide = z => (code(slice(z.re)) << half) | code(slice(z.im));
    return { family, M, k, mapping, points, decide, dmin: 2 / norm, L, norm };
}

export const bitsOf = (label, k) => Array.from({ length: k }, (_, i) => (label >> (k - 1 - i)) & 1);
export const popcount = v => { let c = 0; while (v) { v &= v - 1; c++; } return c; };
export function papr(c) {
    const p = c.points.map(z => z.re * z.re + z.im * z.im);
    return Math.max(...p) / (p.reduce((s, v) => s + v, 0) / p.length);
}

// ---------- AWGN theory (Es/N0 and Eb/N0 are linear) ----------
export function pskSer(M, esn0) {
    if (M === 2) return qFunction(Math.sqrt(2 * esn0));
    // Craig's form: Ps = 1/π ∫₀^{(M−1)π/M} exp(−γ sin²(π/M) / sin²θ) dθ
    const top = (M - 1) * Math.PI / M, n = 400, s2 = Math.sin(Math.PI / M) ** 2;
    let acc = 0;
    for (let i = 0; i < n; i++) { const t = (i + .5) * top / n; acc += Math.exp(-esn0 * s2 / Math.sin(t) ** 2); }
    return acc * top / n / Math.PI;
}
export function qamSer(M, esn0) {
    const p = 2 * (1 - 1 / Math.sqrt(M)) * qFunction(Math.sqrt(3 * esn0 / (M - 1)));
    return 1 - (1 - p) ** 2;
}
export const theorySer = (family, M, esn0) => family === 'psk' || M === 2 ? pskSer(M, esn0) : qamSer(M, esn0);
// BER with Gray labelling. BPSK/QPSK exact; otherwise the nearest-neighbour approximation (accurate at high SNR).
export function theoryBer(family, M, ebn0) {
    const k = Math.log2(M);
    if (M <= 4) return qFunction(Math.sqrt(2 * ebn0));
    if (family === 'psk') return Math.min(.5, pskSer(M, k * ebn0) / k);
    return Math.min(.5, 4 / k * (1 - 1 / Math.sqrt(M)) * qFunction(Math.sqrt(3 * k * ebn0 / (M - 1))));
}

// E[f(γ)] for γ = mean·t, t the normalised combined SNR. Branch statistics: L i.i.d. Rayleigh branches.
// MRC: t ~ Gamma(L, 1) (sum of L unit exponentials). SC: max of L unit exponentials.
function factorial(n) { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; }
export function combinedPdf(t, L = 1, combining = 'mrc') {
    if (combining === 'sc') return L * (1 - Math.exp(-t)) ** (L - 1) * Math.exp(-t);
    return t ** (L - 1) * Math.exp(-t) / factorial(L - 1);
}
export function combinedCdf(t, L = 1, combining = 'mrc') {
    if (combining === 'sc') return (1 - Math.exp(-t)) ** L;
    let s = 0, term = 1;
    for (let i = 0; i < L; i++) { s += term; term *= t / (i + 1); }
    return 1 - Math.exp(-t) * s;
}
// Log-spaced quadrature in t: resolves the deep-fade region that dominates BER at high mean SNR.
export function fadingAverage(f, mean, L = 1, combining = 'mrc') {
    const lo = -32, hi = Math.log(60 + 12 * L), n = 2400, ds = (hi - lo) / n;
    let acc = 0;
    for (let i = 0; i < n; i++) { const t = Math.exp(lo + (i + .5) * ds); acc += f(mean * t) * combinedPdf(t, L, combining) * t; }
    return acc * ds;
}
// Inside the fading average, M-PSK (M > 4) uses the nearest-neighbour form: Craig's integral per point would nest two quadratures.
const fastBer = (family, M, g) => family === 'psk' && M > 4 ? Math.min(.5, 2 / Math.log2(M) * qFunction(Math.sqrt(2 * Math.log2(M) * g) * Math.sin(Math.PI / M))) : theoryBer(family, M, g);
export const rayleighBer = (family, M, ebn0, L = 1, combining = 'mrc') => fadingAverage(g => fastBer(family, M, g), ebn0, L, combining);
// Closed form for BPSK over L-branch MRC (Proakis): used by the tests to validate the quadrature.
export function bpskMrcClosedForm(ebn0, L = 1) {
    const mu = Math.sqrt(ebn0 / (1 + ebn0)), p = (1 - mu) / 2;
    let s = 0, c = 1;
    for (let k = 0; k < L; k++) { s += c * (1 - p) ** k; c = c * (L + k) / (k + 1); }
    return p ** L * s;
}

// Eb/N0 (dB) at which f(Eb/N0) crosses target, by bisection on a decreasing curve.
export function requiredEbn0Db(f, target = 1e-5, lo = -10, hi = 80) {
    if (f(db2lin(hi)) > target) return Infinity;
    for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (f(db2lin(mid)) > target) lo = mid; else hi = mid; }
    return hi;
}
// Shannon bound in the bandwidth-efficiency plane: Eb/N0 ≥ (2^η − 1)/η.
export const shannonEbn0Db = eta => lin2db((2 ** eta - 1) / eta);

// ---------- symbol-level impairments ----------
// iq: amplitude imbalance g (dB) and phase skew ψ (deg): z' = μz + νz*.  pa: Rapp AM/AM with backoff (dB above rms).
export function impair(z, n, { phaseDeg = 0, cfoDeg = 0, iqGainDb = 0, iqPhaseDeg = 0, paBackoffDb = Infinity } = {}) {
    let { re, im } = z;
    if (Number.isFinite(paBackoffDb)) {
        const a = Math.hypot(re, im), sat = 10 ** (paBackoffDb / 20), p = 2;
        const g = 1 / (1 + (a / sat) ** (2 * p)) ** (1 / (2 * p));
        re *= g; im *= g;
    }
    if (iqGainDb || iqPhaseDeg) {
        const g = 10 ** (iqGainDb / 20), psi = iqPhaseDeg * Math.PI / 180;
        // I branch scaled by g, Q branch rotated by ψ.
        const I = re * g, Q = im;
        re = I - Q * Math.sin(psi); im = Q * Math.cos(psi);
    }
    const ph = (phaseDeg + cfoDeg * n) * Math.PI / 180;
    if (ph) { const c = Math.cos(ph), s = Math.sin(ph); [re, im] = [re * c - im * s, re * s + im * c]; }
    return { re, im };
}

// One constellation experiment: N random symbols through impairments + AWGN at Es/N0.
export function constellationRun({ family, M, mapping = 'gray', esn0Db, symbols = 2000, seed = 1, ...imp }) {
    const c = constellation(family, M, mapping), r = prng(seed * 7919 + 13), sd = Math.sqrt(1 / db2lin(esn0Db) / 2);
    const out = [];
    let symErr = 0, bitErr = 0, evm = 0;
    for (let n = 0; n < symbols; n++) {
        const label = Math.floor(r() * M), x = c.points[label], y0 = impair(x, n, imp);
        const y = { re: y0.re + sd * r.normal(), im: y0.im + sd * r.normal() }, d = c.decide(y);
        if (d !== label) { symErr++; bitErr += popcount(d ^ label); }
        evm += (y.re - x.re) ** 2 + (y.im - x.im) ** 2;
        out.push({ y, label, decided: d });
    }
    return { c, out, ser: symErr / symbols, ber: bitErr / (symbols * c.k), evm: Math.sqrt(evm / symbols), symErr, bitErr };
}

// ---------- Monte Carlo BER (uncoded), optionally over Rayleigh with L-branch MRC/SC and ideal CSI ----------
export function monteCarloBer({ family, M, ebn0Db, channel = 'awgn', L = 1, combining = 'mrc', mapping = 'gray', maxBits = 1e6, minErrors = 200, seed = 1, budgetMs = Infinity, state = null }) {
    const c = constellation(family, M, mapping), k = c.k, n0 = 1 / (k * db2lin(ebn0Db)), sd = Math.sqrt(n0 / 2);
    const s = state || { bits: 0, errors: 0, r: prng(seed * 104729 + Math.round(ebn0Db * 100)) }, r = s.r, t0 = Date.now();
    while (s.errors < minErrors && s.bits < maxBits) {
        for (let rep = 0; rep < 256; rep++) {
            const label = Math.floor(r() * M), x = c.points[label];
            let y;
            if (channel === 'awgn') y = { re: x.re + sd * r.normal(), im: x.im + sd * r.normal() };
            else {
                let nr = 0, ni = 0, g = 0, best = -1, by = null;
                for (let l = 0; l < L; l++) {
                    const hr = r.normal() * Math.SQRT1_2, hi = r.normal() * Math.SQRT1_2;
                    const yr = hr * x.re - hi * x.im + sd * r.normal(), yi = hr * x.im + hi * x.re + sd * r.normal(), p = hr * hr + hi * hi;
                    if (combining === 'mrc') { nr += hr * yr + hi * yi; ni += hr * yi - hi * yr; g += p; }
                    else if (p > best) { best = p; by = { re: (hr * yr + hi * yi) / p, im: (hr * yi - hi * yr) / p }; }
                }
                y = combining === 'mrc' ? { re: nr / g, im: ni / g } : by;
            }
            s.errors += popcount(c.decide(y) ^ label);
            s.bits += k;
        }
        if (Date.now() - t0 > budgetMs) break;
    }
    s.done = s.errors >= minErrors || s.bits >= maxBits;
    s.ber = s.bits ? s.errors / s.bits : NaN;
    return s;
}

// ---------- 802.11 binary convolutional code: K = 7, g0 = 133₈, g1 = 171₈ ----------
const G0 = 0o133, G1 = 0o171, parity = v => popcount(v) & 1;
// Register r = (input << 6) | state; the state holds the six previous inputs, newest in bit 5.
const TRELLIS = Array.from({ length: 64 }, (_, s) => [0, 1].map(b => { const r = (b << 6) | s; return { next: r >> 1, a: parity(r & G0), b: parity(r & G1) }; }));
// Puncturing masks per period (IEEE 802.11 §17.3.5.6): 1 = transmitted, 0 = stolen.
export const PUNCTURE = { '1/2': { A: [1], B: [1] }, '2/3': { A: [1, 1], B: [1, 0] }, '3/4': { A: [1, 1, 0], B: [1, 0, 1] }, '5/6': { A: [1, 1, 0, 1, 0], B: [1, 0, 1, 0, 1] } };
export const CODE_RATES = Object.keys(PUNCTURE);
export const rateValue = r => { const [a, b] = r.split('/'); return +a / +b; };
// Free distance of the punctured codes (Haccoun & Bégin, Yasuda): asymptotic soft gain = 10·log₁₀(R·d_free).
export const DFREE = { '1/2': 10, '2/3': 6, '3/4': 5, '5/6': 4 };
export const TAIL = 6;

// Returns { A, B, coded } where coded is the punctured, serialised stream A0 B0 A1 B1 …
export function bccEncode(bits, rate = '1/2', terminate = true) {
    const input = terminate ? [...bits, ...new Array(TAIL).fill(0)] : bits, P = PUNCTURE[rate], period = P.A.length;
    const A = [], B = [], coded = [];
    let s = 0;
    for (let i = 0; i < input.length; i++) {
        const t = TRELLIS[s][input[i]];
        A.push(t.a); B.push(t.b); s = t.next;
        if (P.A[i % period]) coded.push(t.a);
        if (P.B[i % period]) coded.push(t.b);
    }
    return { A, B, coded, input };
}
export const codedLength = (n, rate) => { const P = PUNCTURE[rate], p = P.A.length; let c = 0; for (let i = 0; i < n; i++) c += P.A[i % p] + P.B[i % p]; return c; };

// Soft Viterbi on LLRs (log P(0)/P(1)); punctured positions are depunctured as LLR 0 (erasures).
// hard = true replaces every LLR by its sign: Hamming-metric decoding.
export function viterbiDecode(llr, nInput, rate = '1/2', { hard = false, terminated = true } = {}) {
    const P = PUNCTURE[rate], period = P.A.length, la = new Float64Array(nInput), lb = new Float64Array(nInput);
    let j = 0;
    const take = () => { const v = llr[j++] ?? 0; return hard ? Math.sign(v) : v; };
    for (let i = 0; i < nInput; i++) { la[i] = P.A[i % period] ? take() : 0; lb[i] = P.B[i % period] ? take() : 0; }
    let metric = new Float64Array(64).fill(-Infinity), next = new Float64Array(64);
    metric[0] = 0;
    const decisions = new Uint8Array(nInput * 64);
    for (let i = 0; i < nInput; i++) {
        next.fill(-Infinity);
        const A = la[i], B = lb[i];
        for (let s = 0; s < 64; s++) {
            const m = metric[s];
            if (m === -Infinity) continue;
            for (let b = 0; b < 2; b++) {
                const t = TRELLIS[s][b], v = m + (t.a ? -A : A) + (t.b ? -B : B);
                if (v > next[t.next]) { next[t.next] = v; decisions[i * 64 + t.next] = s & 1; }
            }
        }
        [metric, next] = [next, metric];
    }
    let s = 0;
    if (!terminated) { let best = -Infinity; for (let q = 0; q < 64; q++) if (metric[q] > best) { best = metric[q]; s = q; } }
    const out = new Uint8Array(nInput);
    for (let i = nInput - 1; i >= 0; i--) { out[i] = s >> 5; s = ((s & 31) << 1) | decisions[i * 64 + s]; }
    return out;
}

// Max-log bit LLRs of one received symbol (brute force over the constellation; fine for M ≤ 64).
export function symbolLlrs(c, y, n0, out) {
    const best0 = new Array(c.k).fill(Infinity), best1 = new Array(c.k).fill(Infinity);
    for (let m = 0; m < c.M; m++) {
        const p = c.points[m], d = (y.re - p.re) ** 2 + (y.im - p.im) ** 2;
        for (let b = 0; b < c.k; b++) { if ((m >> (c.k - 1 - b)) & 1) { if (d < best1[b]) best1[b] = d; } else if (d < best0[b]) best0[b] = d; }
    }
    for (let b = 0; b < c.k; b++) out.push((best1[b] - best0[b]) / n0);
}

// Coded Monte Carlo: random blocks → BCC → Gray QAM/PSK → AWGN at Eb/N0 per information bit → LLR → Viterbi.
export function monteCarloCoded({ family = 'qam', M = 4, rate = '1/2', ebn0Db, hard = false, blockBits = 1000, maxBits = 4e5, minErrors = 150, seed = 1, budgetMs = Infinity, state = null }) {
    const c = constellation(family, M), k = c.k, R = rateValue(rate), n0 = 1 / (k * R * db2lin(ebn0Db)), sd = Math.sqrt(n0 / 2);
    const s = state || { bits: 0, errors: 0, r: prng(seed * 7727 + Math.round(ebn0Db * 100)) }, r = s.r, t0 = Date.now();
    while (s.errors < minErrors && s.bits < maxBits) {
        const info = Array.from({ length: blockBits }, () => r() < .5 ? 1 : 0), enc = bccEncode(info, rate);
        const coded = enc.coded, llr = [];
        while (coded.length % k) coded.push(0);
        for (let i = 0; i < coded.length; i += k) {
            let label = 0;
            for (let b = 0; b < k; b++) label = (label << 1) | coded[i + b];
            const x = c.points[label];
            symbolLlrs(c, { re: x.re + sd * r.normal(), im: x.im + sd * r.normal() }, n0, llr);
        }
        const dec = viterbiDecode(llr, enc.input.length, rate, { hard });
        for (let i = 0; i < blockBits; i++) s.errors += dec[i] !== info[i];
        s.bits += blockBits;
        if (Date.now() - t0 > budgetMs) break;
    }
    s.done = s.errors >= minErrors || s.bits >= maxBits;
    s.ber = s.bits ? s.errors / s.bits : NaN;
    return s;
}

// ---------- Rayleigh fading in time (Clarke / sum of sinusoids) ----------
export function fadingTrace({ fd = 10, duration = 1, samples = 1000, L = 1, seed = 1, paths = 32 }) {
    const r = prng(seed * 31 + 7), branches = [];
    for (let l = 0; l < L; l++) {
        const alpha = Array.from({ length: paths }, () => 2 * Math.PI * r()), phi = Array.from({ length: paths }, () => 2 * Math.PI * r());
        branches.push(Array.from({ length: samples }, (_, i) => {
            const t = i * duration / samples;
            let re = 0, im = 0;
            for (let p = 0; p < paths; p++) { const a = 2 * Math.PI * fd * Math.cos(alpha[p]) * t + phi[p]; re += Math.cos(a); im += Math.sin(a); }
            return (re * re + im * im) / paths;
        }));
    }
    return branches;
}

// ---------- uniform linear array ----------
// Element n at x = n·d (wavelengths); θ from broadside. a_n(θ) = exp(j2π·n·d·sinθ).
export const steering = (N, d, thetaDeg) => Array.from({ length: N }, (_, n) => { const p = 2 * Math.PI * n * d * Math.sin(thetaDeg * Math.PI / 180); return { re: Math.cos(p), im: Math.sin(p) }; });
const cm = (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
const cj = a => ({ re: a.re, im: -a.im });
const cadd = (a, b) => ({ re: a.re + b.re, im: a.im + b.im });
const norm2 = v => v.reduce((s, z) => s + z.re * z.re + z.im * z.im, 0);
// h^T w: complex amplitude received in direction θ.
export const response = (w, N, d, thetaDeg) => steering(N, d, thetaDeg).reduce((s, a, n) => cadd(s, cm(a, w[n])), { re: 0, im: 0 });
export const patternGain = (w, N, d, thetaDeg) => { const z = response(w, N, d, thetaDeg); return z.re * z.re + z.im * z.im; };

function invert(A) {
    const n = A.length, M = A.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => ({ re: +(i === j), im: 0 }))]);
    for (let c = 0; c < n; c++) {
        let p = c; for (let r = c + 1; r < n; r++) if (Math.hypot(M[r][c].re, M[r][c].im) > Math.hypot(M[p][c].re, M[p][c].im)) p = r;
        [M[c], M[p]] = [M[p], M[c]];
        const piv = M[c][c], d = piv.re * piv.re + piv.im * piv.im;
        if (d < 1e-18) return null;
        const inv = { re: piv.re / d, im: -piv.im / d };
        M[c] = M[c].map(z => cm(z, inv));
        for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c]; M[r] = M[r].map((z, j) => ({ re: z.re - (f.re * M[c][j].re - f.im * M[c][j].im), im: z.im - (f.re * M[c][j].im + f.im * M[c][j].re) })); }
    }
    return M.map(row => row.slice(n));
}

// Per-user precoders with total power 1 (1/K each). 'omni': single antenna; 'uniform': equal weights (broadside beam);
// 'mrt': matched filter conj(a(θk)); 'zf': W = Hᴴ(HHᴴ)⁻¹ — each user sees zero interference from the others' beams.
export function precoders(mode, N, d, anglesDeg) {
    const K = anglesDeg.length, scale = (w, p) => { const f = Math.sqrt(p / (norm2(w) || 1)); return w.map(z => ({ re: z.re * f, im: z.im * f })); };
    if (mode === 'omni') return anglesDeg.map(() => scale(Array.from({ length: N }, (_, n) => ({ re: +(n === 0), im: 0 })), 1 / K));
    if (mode === 'uniform') return anglesDeg.map(() => scale(Array.from({ length: N }, () => ({ re: 1, im: 0 })), 1 / K));
    const H = anglesDeg.map(t => steering(N, d, t));
    if (mode === 'zf' && K > 1 && K <= N) {
        const HH = H.map(a => H.map(b => a.reduce((s, z, n) => cadd(s, cm(z, cj(b[n]))), { re: 0, im: 0 })));
        const inv = invert(HH);
        if (inv) return anglesDeg.map((_, k) => scale(Array.from({ length: N }, (_, n) => H.reduce((s, row, j) => cadd(s, cm(cj(row[n]), inv[j][k])), { re: 0, im: 0 })), 1 / K));
    }
    return H.map(a => scale(a.map(cj), 1 / K));
}

// Per-user SINR (linear) given the reference SNR ρ of one antenna radiating the full power.
export function userSinr(W, N, d, anglesDeg, rho) {
    return anglesDeg.map((t, k) => {
        const sig = patternGain(W[k], N, d, t);
        const intf = W.reduce((s, w, j) => j === k ? s : s + patternGain(w, N, d, t), 0);
        return { signal: sig, interference: intf, sinr: rho * sig / (rho * intf + 1) };
    });
}

// ---------- pulse shaping, matched filtering and eye diagrams (single carrier) ----------
// Taps in samples (sps per symbol), unit energy. t is in symbol periods.
export function rcPulse(t, alpha) {
    const sinc = x => Math.abs(x) < 1e-9 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x);
    if (alpha > 0 && Math.abs(Math.abs(t) - 1 / (2 * alpha)) < 1e-9) return Math.PI / 4 * sinc(1 / (2 * alpha));
    return sinc(t) * Math.cos(Math.PI * alpha * t) / (1 - (2 * alpha * t) ** 2);
}
export function rrcPulse(t, alpha) {
    if (Math.abs(t) < 1e-9) return 1 - alpha + 4 * alpha / Math.PI;
    if (alpha > 0 && Math.abs(Math.abs(t) - 1 / (4 * alpha)) < 1e-9) return alpha / Math.SQRT2 * ((1 + 2 / Math.PI) * Math.sin(Math.PI / (4 * alpha)) + (1 - 2 / Math.PI) * Math.cos(Math.PI / (4 * alpha)));
    return (Math.sin(Math.PI * t * (1 - alpha)) + 4 * alpha * t * Math.cos(Math.PI * t * (1 + alpha))) / (Math.PI * t * (1 - (4 * alpha * t) ** 2));
}
export function pulseTaps(shape, sps = 16, alpha = .35, span = 8) {
    let h;
    if (shape === 'rect') h = new Array(sps).fill(1);
    else { const L = span * sps; h = Array.from({ length: L + 1 }, (_, i) => (shape === 'rc' ? rcPulse : rrcPulse)((i - L / 2) / sps, alpha)); }
    const e = Math.sqrt(h.reduce((s, v) => s + v * v, 0));
    return h.map(v => v / e);
}
export function convolveReal(x, h) {
    const y = new Float64Array(x.length + h.length - 1);
    for (let i = 0; i < x.length; i++) { const v = x[i]; if (v) for (let j = 0; j < h.length; j++) y[i + j] += v * h[j]; }
    return y;
}
function magnitudeSpectrum(h, sps, nfft = 2048) {
    const out = [];
    for (let i = -nfft / 2; i < nfft / 2; i += 2) {
        const f = i / nfft * sps;
        if (Math.abs(f) > 1.6) continue;
        let re = 0, im = 0;
        h.forEach((v, n) => { const p = -2 * Math.PI * i * n / nfft; re += v * Math.cos(p); im += v * Math.sin(p); });
        out.push([f, re * re + im * im]);
    }
    const peak = Math.max(...out.map(p => p[1])) || 1;
    return out.map(([f, p]) => [f, lin2db(p / peak + 1e-12)]);
}

// Bits → symbols → TX pulse → (echo) → AWGN → RX filter → sampler at τ. Noise per sample N0/2 per dimension,
// so with a unit-energy matched filter the sampler sees exactly Es/N0 (the matched-filter bound).
export function pulseLink({ family = 'psk', M = 2, shape = 'rrc', rx = 'matched', alpha = .35, span = 8, ebn0Db = 12, tau = 0, echo = 0, echoDelay = .5, symbols = 2000, seed = 1, sps = 16 }) {
    const c = constellation(family, M), k = c.k, r = prng(seed * 6007 + 3), n0 = 1 / (k * db2lin(ebn0Db)), sd = Math.sqrt(n0 / 2);
    const htx = pulseTaps(shape, sps, alpha, span);
    // 'lpf': Hamming-windowed ideal low-pass of bandwidth ±Rs (wider than the signal); 'none': the whole simulated band ±sps·Rs/2.
    const lpf = () => { const L = span * sps; return Array.from({ length: L + 1 }, (_, i) => { const t = (i - L / 2) / sps; return (Math.abs(t) < 1e-9 ? 1 : Math.sin(2 * Math.PI * t) / (2 * Math.PI * t)) * (.54 + .46 * Math.cos(2 * Math.PI * (i - L / 2) / L)); }); };
    const hrx = rx === 'matched' ? htx.slice().reverse() : rx === 'lpf' ? lpf() : [1];
    const D = Math.round(echoDelay * sps), ch = Array.from({ length: (echo ? D : 0) + 1 }, (_, i) => i === 0 ? 1 : echo && i === D ? echo : 0);
    const labels = Array.from({ length: symbols }, () => Math.floor(r() * M));
    const xr = new Float64Array(symbols * sps), xi = new Float64Array(symbols * sps);
    labels.forEach((l, i) => { xr[i * sps] = c.points[l].re; xi[i * sps] = c.points[l].im; });
    const chain = x => { const y = convolveReal(convolveReal(x, htx), ch); for (let i = 0; i < y.length; i++) y[i] += sd * r.normal(); return convolveReal(y, hrx); };
    const yr = chain(xr), yi = chain(xi);
    const p = convolveReal(convolveReal(htx, ch), hrx), d0 = (htx.length - 1) / 2 + (hrx.length - 1) / 2;
    const center = Math.round(d0), off = Math.round(tau * sps), g = p[center + off] || 1e-12;
    // Sampler: skip symbols whose filter tails are cut by the block edges.
    const guard = Math.ceil((htx.length + hrx.length) / sps) + 2, samples = [];
    let bitErr = 0, count = 0;
    for (let s = guard; s < symbols - guard; s++) {
        const n = center + s * sps + off, z = { re: yr[n] / g, im: yi[n] / g }, d = c.decide(z);
        bitErr += popcount(d ^ labels[s]); count++;
        samples.push({ z, label: labels[s], decided: d });
    }
    const traces = [];
    for (let s = guard; s < Math.min(symbols - guard, guard + 160); s++) {
        const n = center + s * sps, pts = [];
        for (let j = -sps; j <= sps; j++) pts.push([j / sps, yr[n + j] / g]);
        traces.push(pts);
    }
    const isiTaps = [];
    for (let m = -Math.ceil(p.length / sps); m <= Math.ceil(p.length / sps); m++) { const i = center + off + m * sps; if (m && i >= 0 && i < p.length) isiTaps.push(p[i] / g); }
    const isi = isiTaps.reduce((s, v) => s + Math.abs(v), 0), maxSignal = Math.max(...c.points.map(q => Math.abs(q.re)));
    return {
        c, samples, traces, ber: bitErr / (count * k), bitErr, bits: count * k, isi, peakDistortion: isi * maxSignal,
        pulse: { tx: htx, total: p, center, sps, gain: g, isiTaps }, spectrum: { tx: magnitudeSpectrum(htx, sps), total: magnitudeSpectrum(p, sps) },
        // Matched-filter SNR relative to the bound: (h_tx · h_rx at τ)² / (‖h_rx‖²·‖h_tx‖²) — 0 dB only for the matched filter at τ = 0.
        snrLossDb: -lin2db(g * g / hrx.reduce((s, v) => s + v * v, 0)),
    };
}

// ---------- LDPC: random (3, d_c)-regular code, normalised min-sum decoding ----------
// Same family as the Wi-Fi 6/7 LDPC (n = 1296), but a random construction, not the standard's base matrices.
const ldpcCache = new Map();
export function ldpcCode(n = 1296, rate = '1/2', seed = 1) {
    const key = `${n}|${rate}|${seed}`;
    if (ldpcCache.has(key)) return ldpcCache.get(key);
    const dv = 3, dc = Math.round(dv / (1 - rateValue(rate))), m = n * dv / dc, r = prng(seed * 1103 + n);
    const vs = Array.from({ length: n * dv }, (_, i) => Math.floor(i / dv)), cs = Array.from({ length: n * dv }, (_, i) => Math.floor(i / dc));
    for (let i = cs.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [cs[i], cs[j]] = [cs[j], cs[i]]; }
    // Remove repeated (variable, check) pairs and 4-cycles by random edge swaps.
    const build = () => { const varChecks = Array.from({ length: n }, () => []); vs.forEach((v, e) => varChecks[v].push(cs[e])); return varChecks; };
    for (let pass = 0; pass < 60; pass++) {
        const varChecks = build(), bad = new Set(), seen = new Map();
        vs.forEach((v, e) => { if (varChecks[v].filter(c => c === cs[e]).length > 1) bad.add(e); });
        varChecks.forEach((list, v) => { for (let a = 0; a < 3; a++) for (let b = a + 1; b < 3; b++) { const pk = list[a] < list[b] ? `${list[a]},${list[b]}` : `${list[b]},${list[a]}`; if (seen.has(pk) && seen.get(pk) !== v) bad.add(v * dv + a); else seen.set(pk, v); } });
        if (!bad.size) break;
        for (const e of bad) { const j = Math.floor(r() * cs.length); [cs[e], cs[j]] = [cs[j], cs[e]]; }
    }
    const checkEdges = Array.from({ length: m }, () => []);
    cs.forEach((c, e) => checkEdges[c].push(e));
    const code = { n, m, rate, dv, dc, edgeVar: Int32Array.from(vs), checkEdges: checkEdges.map(l => Int32Array.from(l)) };
    ldpcCache.set(key, code);
    return code;
}
export function ldpcDecode(code, llr, { iterations = 30, scale = .75 } = {}) {
    const { n, edgeVar, checkEdges, dv } = code, E = edgeVar.length, q = new Float64Array(E), rmsg = new Float64Array(E), total = Float64Array.from(llr), hard = new Uint8Array(n);
    for (let e = 0; e < E; e++) q[e] = llr[edgeVar[e]];
    let it = 0, ok = false;
    for (; it < iterations && !ok; it++) {
        for (const edges of checkEdges) {
            let m1 = Infinity, m2 = Infinity, idx = -1, sign = 1;
            for (const e of edges) { const v = q[e], a = Math.abs(v); if (v < 0) sign = -sign; if (a < m1) { m2 = m1; m1 = a; idx = e; } else if (a < m2) m2 = a; }
            for (const e of edges) rmsg[e] = scale * sign * (q[e] < 0 ? -1 : 1) * (e === idx ? m2 : m1);
        }
        total.set(llr);
        for (let e = 0; e < E; e++) total[edgeVar[e]] += rmsg[e];
        for (let e = 0; e < E; e++) q[e] = total[edgeVar[e]] - rmsg[e];
        for (let v = 0; v < n; v++) hard[v] = total[v] < 0 ? 1 : 0;
        ok = checkEdges.every(edges => { let p = 0; for (const e of edges) p ^= hard[edgeVar[e]]; return !p; });
    }
    return { bits: hard, iterations: it, converged: ok, dv };
}
// All-zero codeword with a random scrambler before the mapper (and LLR sign flips after): exact for any linear code
// and makes the higher-order QAM bit channels symmetric. BER is measured over all n code bits.
export function monteCarloLdpc({ family = 'qam', M = 4, rate = '1/2', ebn0Db, n = 1296, maxBits = 2e6, minErrors = 100, seed = 1, budgetMs = Infinity, state = null }) {
    const c = constellation(family, M), k = c.k, R = rateValue(rate), n0 = 1 / (k * R * db2lin(ebn0Db)), sd = Math.sqrt(n0 / 2), code = ldpcCode(n, rate);
    const s = state || { bits: 0, errors: 0, blocks: 0, iterations: 0, r: prng(seed * 4241 + Math.round(ebn0Db * 100)) }, r = s.r, t0 = Date.now();
    while (s.errors < minErrors && s.bits < maxBits) {
        const scr = Array.from({ length: n }, () => r() < .5 ? 1 : 0), llr = [];
        for (let i = 0; i < n; i += k) {
            let label = 0;
            for (let b = 0; b < k; b++) label = (label << 1) | scr[i + b];
            const x = c.points[label];
            symbolLlrs(c, { re: x.re + sd * r.normal(), im: x.im + sd * r.normal() }, n0, llr);
        }
        for (let i = 0; i < n; i++) if (scr[i]) llr[i] = -llr[i];
        const dec = ldpcDecode(code, llr);
        for (let i = 0; i < n; i++) s.errors += dec.bits[i];
        s.bits += n; s.blocks++; s.iterations += dec.iterations;
        if (Date.now() - t0 > budgetMs) break;
    }
    s.done = s.errors >= minErrors || s.bits >= maxBits;
    s.ber = s.bits ? s.errors / s.bits : NaN;
    return s;
}
