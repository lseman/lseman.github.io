// utils.js - Math and DSP utilities

/** @type {number} */
let _workflowSampleRate = 48000;

/**
 * Set the global workflow sample rate.
 * @param {number} rate - Sample rate in Hz.
 */
export function setWorkflowSampleRate(rate) {
    _workflowSampleRate = rate;
}

/**
 * Get the sample rate from a signal or default workflow rate.
 * @param {Object} signal - Signal object with fs or sampleRate property.
 * @returns {number} Sample rate in Hz.
 */
export function sampleRateOf(signal) {
    return signal?.sampleRate || signal?.fs || _workflowSampleRate;
}

/**
 * Assert that two signals have the same sample rate.
 * @param {Object} a - First signal.
 * @param {Object} b - Second signal.
 * @param {string} [label='bloco'] - Label for error message.
 * @returns {number} Sample rate in Hz.
 */
export function assertSameRate(a, b, label = 'bloco') {
    const fa = sampleRateOf(a), fb = sampleRateOf(b);
    if (Math.abs(fa - fb) > Math.max(fa, fb) * 1e-12) {
        throw Error(`${label}: taxas incompatíveis (${fa} Hz e ${fb} Hz). Use reamostragem antes de combinar os streams.`);
    }
    return fa;
}

export const nextPowerOfTwo = n => { let p = 1; while (p < n) p *= 2; return p };

export function radix2FFT(re, im, inverse = false) {
    const N = re.length;
    for (let i = 1, j = 0; i < N; i++) {
        let bit = N >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) {
            [re[i], re[j]] = [re[j], re[i]];
            [im[i], im[j]] = [im[j], im[i]];
        }
    }
    for (let len = 2; len <= N; len <<= 1) {
        const angle = (inverse ? 2 : -2) * Math.PI / len, stepRe = Math.cos(angle), stepIm = Math.sin(angle);
        for (let base = 0; base < N; base += len) {
            let wr = 1, wi = 0;
            for (let j = 0; j < len / 2; j++) {
                const even = base + j, odd = even + len / 2, tr = wr * re[odd] - wi * im[odd], ti = wr * im[odd] + wi * re[odd];
                re[odd] = re[even] - tr; im[odd] = im[even] - ti;
                re[even] += tr; im[even] += ti;
                const next = wr * stepRe - wi * stepIm;
                wi = wr * stepIm + wi * stepRe;
                wr = next;
            }
        }
    }
    if (inverse) for (let i = 0; i < N; i++) { re[i] /= N; im[i] /= N; }
}

export function fftAny(re, im) {
    const N = re.length;
    if ((N & (N - 1)) === 0) { radix2FFT(re, im); return; }
    const M = nextPowerOfTwo(2 * N - 1), ar = new Float64Array(M), ai = new Float64Array(M), br = new Float64Array(M), bi = new Float64Array(M);
    for (let n = 0; n < N; n++) {
        const angle = Math.PI * n * n / N, c = Math.cos(angle), s = Math.sin(angle);
        ar[n] = re[n] * c + im[n] * s; ai[n] = im[n] * c - re[n] * s;
        br[n] = c; bi[n] = s;
        if (n) { br[M - n] = c; bi[M - n] = s; }
    }
    radix2FFT(ar, ai); radix2FFT(br, bi);
    for (let i = 0; i < M; i++) {
        const rr = ar[i] * br[i] - ai[i] * bi[i], ii = ar[i] * bi[i] + ai[i] * br[i];
        ar[i] = rr; ai[i] = ii;
    }
    radix2FFT(ar, ai, true);
    for (let k = 0; k < N; k++) {
        const angle = Math.PI * k * k / N, c = Math.cos(angle), s = Math.sin(angle);
        re[k] = ar[k] * c + ai[k] * s; im[k] = ai[k] * c - ar[k] * s;
    }
}

export function convolveFull(signal, taps) {
    const a = signal, length = Math.max(0, a.length + taps.length - 1);
    if (!a.length || !taps.length) return [];
    if (a.length * taps.length < 200000 || taps.length < 32) {
        const out = Array.from({ length }, () => ({ re: 0, im: 0 }));
        for (let n = 0; n < a.length; n++) {
            const ar = a[n].re, ai = a[n].im;
            for (let k = 0; k < taps.length; k++) {
                out[n + k].re += ar * taps[k];
                out[n + k].im += ai * taps[k];
            }
        }
        return out;
    }
    const N = nextPowerOfTwo(length), ar = new Float64Array(N), ai = new Float64Array(N), br = new Float64Array(N), bi = new Float64Array(N);
    for (let i = 0; i < a.length; i++) { ar[i] = a[i].re; ai[i] = a[i].im; }
    for (let i = 0; i < taps.length; i++) br[i] = taps[i];
    radix2FFT(ar, ai); radix2FFT(br, bi);
    for (let i = 0; i < N; i++) {
        const rr = ar[i] * br[i] - ai[i] * bi[i], ii = ar[i] * bi[i] + ai[i] * br[i];
        ar[i] = rr; ai[i] = ii;
    }
    radix2FFT(ar, ai, true);
    return Array.from({ length }, (_, i) => ({ re: ar[i], im: ai[i] }));
}

export function erfcStable(x) {
    const z = Math.abs(x), t = 1 / (1 + .5 * z),
        tail = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (.37409196 + t * (.09678418 + t * (-.18628806 + t * (.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-.82215223 + t * .17087277)))))))));
    return x >= 0 ? tail : 2 - tail;
}

export function qFunction(x) {
    if (x < 0) return 1 - qFunction(-x);
    if (x > 38.5) return 0;
    return .5 * erfcStable(x / Math.SQRT2);
}

/**
 * Random number generator with seed.
 * @param {number} seed - Seed value.
 * @returns {function(): number} RNG function.
 */
export function rng(seed) {
    let s = (seed | 0) || 1;
    return () => ((s = Math.imul(1664525, s) + 1013904223 | 0) >>> 0) / 4294967296;
}

/**
 * Generate Gaussian random number.
 * @param {function(): number} r - RNG function.
 * @returns {number} Gaussian sample.
 */
export function gaussian(r) {
    const u = Math.max(1e-12, r()), v = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * Extract data array from signal.
 * @param {Object|Array} input - Signal or array.
 * @returns {Array} Data array.
 */
export function arr(input) {
    if (!input) return [];
    return input.data || input;
}

/**
 * Convert value to complex object.
 * @param {number|Object} v - Value or complex object.
 * @returns {Object} Complex object {re, im}.
 */
export function complex(v) {
    return typeof v === 'number' ? { re: v, im: 0 } : v;
}

export function bitsToInts(bits, k) {
    const out = [];
    for (let i = 0; i + k <= bits.length; i += k) {
        let v = 0;
        for (let j = 0; j < k; j++) v = (v << 1) | bits[i + j];
        out.push(v);
    }
    return out;
}

export function intsToBits(values, k) {
    return values.flatMap(v => Array.from({ length: k }, (_, j) => (v >> (k - 1 - j)) & 1));
}

export function binaryToGray(v) {
    return v ^ (v >> 1);
}

export function grayToBinary(v) {
    let b = 0;
    for (; v; v >>= 1) b ^= v;
    return b;
}

export function unwrap(phases, discontinuity = Math.PI) {
    if (!phases.length) return [];
    const out = [phases[0]];
    if (!Number.isFinite(phases[0])) throw Error('Fase contém valor não finito.');
    let correction = 0;
    for (let k = 1; k < phases.length; k++) {
        const p = phases[k], previous = phases[k - 1];
        if (!Number.isFinite(p)) throw Error(`Fase contém valor não finito na amostra ${k}.`);
        const delta = p - previous, wrapped = delta - 2 * Math.PI * Math.round(delta / (2 * Math.PI));
        if (Math.abs(delta) > discontinuity) correction += wrapped - delta;
        out.push(p + correction);
    }
    return out;
}

export function parseTaps(text) {
    const taps = String(text).split(',').map(Number).filter(Number.isFinite);
    if (!taps.length) throw Error('Informe coeficientes separados por vírgula.');
    return taps;
}

export function binaryPolynomial(text) {
    const bits = String(text).replace(/[^01]/g, '').split('').map(Number);
    if (bits.length < 2 || bits[0] !== 1 || bits.at(-1) !== 1) throw Error('Polinômio CRC deve ter ao menos dois bits e começar/terminar em 1.');
    return bits;
}

export function polynomialRemainder(data, poly) {
    const work = [...data];
    for (let i = 0; i <= work.length - poly.length; i++) {
        if (work[i]) {
            for (let j = 0; j < poly.length; j++) work[i + j] ^= poly[j];
        }
    }
    return work.slice(-(poly.length - 1));
}

export function hamming74Word(d) {
    const [d1, d2, d3, d4] = d;
    return [d1 ^ d2 ^ d4, d1 ^ d3 ^ d4, d1, d2 ^ d3 ^ d4, d2, d3, d4];
}

export function hammingSyndrome(r) {
    const s1 = r[0] ^ r[2] ^ r[4] ^ r[6], s2 = r[1] ^ r[2] ^ r[5] ^ r[6], s4 = r[3] ^ r[4] ^ r[5] ^ r[6];
    return s1 + 2 * s2 + 4 * s4;
}

export function convTransition(state, input) {
    const u1 = state >> 1, u2 = state & 1;
    return { next: (input << 1) | u1, out: [input ^ u1 ^ u2, input ^ u2] };
}

const rrcCache = new Map();

export function rrcTapsKey(sps, alpha, span) {
    const aKey = Math.round(alpha * 10000);
    return (sps << 19) | (aKey << 5) | span;
}

export function rrcTaps(samplesPerSymbol, rolloff, spanSymbols) {
    const sps = Math.max(2, Math.round(samplesPerSymbol)), alpha = Math.max(0, Math.min(1, +rolloff)), span = Math.max(2, Math.round(spanSymbols));
    const cacheKey = rrcTapsKey(sps, alpha, span);
    if (rrcCache.has(cacheKey)) return rrcCache.get(cacheKey);
    const order = span * sps + (span * sps) % 2, taps = new Float64Array(order + 1);
    for (let n = 0; n <= order; n++) {
        const t = (n - order / 2) / sps; let h;
        if (alpha < 1e-12) h = Math.abs(t) < 1e-12 ? 1 : Math.sin(Math.PI * t) / (Math.PI * t);
        else if (Math.abs(t) < 1e-12) h = 1 + alpha * (4 / Math.PI - 1);
        else if (Math.abs(Math.abs(t) - 1 / (4 * alpha)) < 1e-9) h = alpha / Math.sqrt(2) * ((1 + 2 / Math.PI) * Math.sin(Math.PI / (4 * alpha)) + (1 - 2 / Math.PI) * Math.cos(Math.PI / (4 * alpha)));
        else h = (Math.sin(Math.PI * t * (1 - alpha)) + 4 * alpha * t * Math.cos(Math.PI * t * (1 + alpha))) / (Math.PI * t * (1 - (4 * alpha * t) ** 2));
        taps[n] = h;
    }
    let energy = 0;
    for (let i = 0; i < taps.length; i++) energy += taps[i] * taps[i];
    energy = Math.sqrt(energy);
    const normalized = Array.from({ length: taps.length }, (_, i) => taps[i] / energy);
    rrcCache.set(cacheKey, normalized);
    return normalized;
}

export function computeFFT(signal, size, windowName = 'Hann', shift = true) {
    const input = arr(signal).map(complex), N = Math.max(1, Math.round(size)), window = Array.from({ length: N }, (_, k) => windowName === 'Hann' && N > 1 ? .5 - .5 * Math.cos(2 * Math.PI * k / (N - 1)) : 1), gain = window.reduce((s, x) => s + x, 0) / N || 1, re = new Float64Array(N), im = new Float64Array(N);
    for (let k = 0; k < N; k++) { const sample = input[k] || { re: 0, im: 0 }; re[k] = sample.re * window[k]; im[k] = sample.im * window[k] }
    fftAny(re, im);
    const out = Array.from({ length: N }, (_, k) => ({ re: re[k] / (N * gain), im: im[k] / (N * gain) }));
    const data = shift ? out.slice(Math.ceil(N / 2)).concat(out.slice(0, Math.ceil(N / 2))) : out, fs = signal?.fs || signal?.sampleRate;
    return { kind: 'fft', data, fs, fftSize: N, binWidth: fs ? fs / N : 1 / N, frequencyStart: shift ? (fs ? -fs / 2 : -.5) : 0, shifted: shift, window: windowName };
}

export function gaussianShape(raw, sps, bt) {
    const span = 4 * sps, taps = Array.from({ length: 2 * span + 1 }, (_, k) => { const t = (k - span) / sps; return Math.exp(-2 * (Math.PI * bt * t) ** 2 / Math.log(2)) }), sum = taps.reduce((a, b) => a + b, 0), out = Array(raw.length);
    for (let k = 0; k < raw.length; k++) {
        let v = 0;
        for (let j = 0; j < taps.length; j++) {
            const index = Math.max(0, Math.min(raw.length - 1, k + j - span));
            v += raw[index] * taps[j];
        }
        out[k] = v / sum;
    }
    return out;
}

export function apskPoints(M) {
    const layout = M === 16 ? [[4, .55, Math.PI / 4], [12, 1.2, 0]] : [[4, .45, Math.PI / 4], [12, .9, 0], [16, 1.35, Math.PI / 16]], points = [];
    for (const [count, radius, offset] of layout) {
        for (let k = 0; k < count; k++) {
            points.push({ re: radius * Math.cos(offset + 2 * Math.PI * k / count), im: radius * Math.sin(offset + 2 * Math.PI * k / count) });
        }
    }
    const energy = points.reduce((s, p) => s + p.re * p.re + p.im * p.im, 0) / points.length, scale = Math.sqrt(energy);
    return points.map(p => ({ re: p.re / scale, im: p.im / scale }));
}

export function analyticSignal(signal) {
    const input = arr(signal).map(complex), N = nextPowerOfTwo(input.length), re = Array(N).fill(0), im = Array(N).fill(0);
    for (let k = 0; k < input.length; k++) re[k] = input[k].re;
    radix2FFT(re, im);
    for (let k = 1; k < N / 2; k++) { re[k] *= 2; im[k] *= 2; }
    for (let k = N / 2 + 1; k < N; k++) { re[k] = 0; im[k] = 0; }
    radix2FFT(re, im, true);
    return Array.from({ length: input.length }, (_, k) => ({ re: re[k], im: im[k] }));
}

export function convolveSignal(signal, taps) {
    return { ...signal, data: convolveFull(signal, taps).slice(0, arr(signal).length) };
}
