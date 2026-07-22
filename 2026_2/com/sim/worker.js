const nextPowerOfTwo = n => { let p = 1; while (p < n) p *= 2; return p };
function radix2FFT(re, im, inverse = false) {
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
function fftAny(re, im) {
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
function convolveFull(signal, taps) {
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
function erfcStable(x) {
    const z = Math.abs(x);
    const t = 1 / (1 + .5 * z);
    const tail = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (.37409196 + t * (.09678418 + t * (-.18628806 + t * (.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-.82215223 + t * .17087277)))))))));
    return x >= 0 ? tail : 2 - tail;
}
function qFunction(x) {
    if (x < 0) return 1 - qFunction(-x);
    if (x > 38.5) return 0;
    return .5 * erfcStable(x / Math.SQRT2);
}
function calculateBER(scheme, gamma) {
    if (scheme === 'BPSK' || scheme === '2PSK' || scheme === 'QPSK' || scheme === '4PSK') return qFunction(Math.sqrt(2 * gamma));
    if (scheme === 'BFSK' || scheme === 'COHERENTBFSK') return qFunction(Math.sqrt(gamma));
    if (scheme === 'NCBFSK' || scheme === 'NONCOHERENTBFSK') return .5 * Math.exp(-gamma / 2);
    const psk = scheme.match(/^(\d+)PSK$/);
    if (psk) {
        const M = +psk[1], k = Math.log2(M);
        if (!Number.isInteger(k)) throw new Error(`${scheme}: M deve ser potência de dois.`);
        return Math.min(.5, 2 / k * qFunction(Math.sqrt(2 * k * gamma) * Math.sin(Math.PI / M)));
    }
    const qam = scheme.match(/^(\d+)QAM$/);
    if (qam) {
        const M = +qam[1], k = Math.log2(M), root = Math.sqrt(M);
        if (!Number.isInteger(k) || !Number.isInteger(root)) throw new Error(`${scheme}: QAM deve ser quadrada.`);
        return Math.min(.5, 4 / k * (1 - 1 / root) * qFunction(Math.sqrt(3 * k * gamma / (M - 1))));
    }
    throw new Error(`Modulação desconhecida: ${scheme}.`);
}
self.onmessage = function (e) {
    const { type, data } = e.data;
    if (type === 'berCurve') {
        const { schemes, x, yMin, yMax } = data;
        const series = schemes.map(scheme => {
            const name = scheme === '2PSK' ? 'BPSK' : scheme === '4PSK' ? 'QPSK' : scheme === 'COHERENTBFSK' ? 'BFSK coerente' : scheme === 'NCBFSK' || scheme === 'NONCOHERENTBFSK' ? 'BFSK não coerente' : scheme.replace(/(\d+)(PSK|QAM)/, '$1-$2');
            const values = x.map(db => calculateBER(scheme, 10 ** (db / 10)));
            return { name, values };
        });
        self.postMessage({ type: 'berCurveResult', data: { series, x, yMin, yMax } });
    } else if (type === 'fft') {
        const { re, im, inverse } = data;
        const reArr = new Float64Array(re);
        const imArr = new Float64Array(im);
        fftAny(reArr, imArr);
        self.postMessage({ type: 'fftResult', data: { re: Array.from(reArr), im: Array.from(imArr) } }, [reArr.buffer, imArr.buffer]);
    } else if (type === 'convolve') {
        const { signal, taps } = data;
        const result = convolveFull(signal, taps);
        self.postMessage({ type: 'convolveResult', data: result });
    }
};
