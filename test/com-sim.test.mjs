import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { defs, createProcessors, OUTPUT_TYPES, INPUT_TYPES, FLEX_INPUTS, FLEX_OUTPUTS } from '../2026_2/com/sim/blocks.js';
import { arr, complex, computeFFT, fftAny, convolveFull, rrcTaps, setWorkflowSampleRate } from '../2026_2/com/sim/utils.js';

const processors = createProcessors([]);
const node = (type, config = {}) => ({ type, config: { ...Object.fromEntries(Object.entries(defs[type].config).map(([key, schema]) => [key, schema.value])), ...config } });
const run = (type, input = {}, config = {}) => processors[type](node(type, config), input);
const source = readFileSync(new URL('../2026_2/com/sim/app.js', import.meta.url), 'utf8');
let nodes = [], edges = [];
const context = vm.createContext({
    defs, OUTPUT_TYPES, INPUT_TYPES, FLEX_INPUTS, FLEX_OUTPUTS,
    render() {}, save() {}, flashMessage(message) { throw Error(message); },
    addNode(type) { const n = { ...node(type), id: String(nodes.length) }; nodes.push(n); return n; },
});
// Exercise the real port validation and template builders, without DOM setup.
vm.runInContext(`let nodes, edges, pending; ${source.slice(source.indexOf('function portType('), source.indexOf('/**\n * Flash a message'))}
${source.slice(source.indexOf('const templates ='), source.indexOf('const templateCategories'))}
globalThis.templates = templates; globalThis.setGraph = (n, e) => { nodes = n; edges = e; }; globalThis.getEdges = () => edges;`, context);
for (const key of Object.keys(context.templates)) {
    test(`example ${key} executes with finite output`, () => {
        setWorkflowSampleRate(48000);
        nodes = []; edges = []; context.setGraph(nodes, edges);
        context.templates[key].build(); edges = context.getEdges();
        const results = [], p = createProcessors(results), outputs = {}, remaining = new Set(nodes);
        while (remaining.size) {
            let progress = false;
            for (const n of remaining) {
                const incoming = edges.filter(e => e.to === n.id);
                if (incoming.some(e => !outputs[e.from])) continue;
                const input = Object.fromEntries(incoming.map(e => [e.toPort, outputs[e.from][e.fromPort]]));
                assert.ok((defs[n.type].inputs || []).every(port => input[port]), `missing input: ${n.type}`);
                outputs[n.id] = p[n.type](n, input) || {};
                for (const signal of Object.values(outputs[n.id])) {
                    for (const sample of arr(signal)) {
                        const z = complex(sample);
                        assert.ok(Number.isFinite(z.re) && Number.isFinite(z.im), `${n.type}: nonfinite sample`);
                    }
                }
                remaining.delete(n); progress = true;
            }
            assert.ok(progress, 'cycle or unresolved dependency');
        }
        assert.ok(results.length);
    });
}

test('zero-valued gain, sources, phase noise, CFO, and AM depth are honored', () => {
    const signal = { fs: 48000, data: [{ re: 1, im: 1 }, { re: -1, im: 0 }] };
    assert.deepEqual(run('gain', { signal }, { gain: 0 }).signal.data, [{ re: 0, im: 0 }, { re: -0, im: 0 }]);
    for (const [type, config, port] of [['sine_source', { amplitude: 0 }, 'samples'], ['complex_tone', { amplitude: 0 }, 'waveform'], ['noise_source', { power: 0 }, 'waveform']]) {
        assert.ok(run(type, {}, config)[port].data.every(z => z.re === 0 && z.im === 0));
    }
    assert.deepEqual(run('phase_noise', { signal }, { variance: 0 }).impaired.data, signal.data);
    assert.deepEqual(run('frequency_offset', { signal }, { cycles: 0 }).impaired.data, signal.data);
    assert.ok(run('sine_source', {}, { frequency: 0 }).samples.data.every(z => z.re === 1));
    const a = run('am', { message: signal }, { mu: 0 }).modulated;
    assert.equal(a.data[0].re, 1);
});

test('resampling updates rates and samples-per-symbol; addition rejects mismatched rates', () => {
    const signal = { fs: 48000, sampleRate: 48000, sps: 8, data: [1, 2, 3, 4] };
    const up = run('upsample', { signal }, { factor: 4 }).resampled;
    assert.equal(up.fs, 192000); assert.equal(up.sampleRate, up.fs); assert.equal(up.sps, 32);
    const down = run('decimate', { signal: up }, { factor: 4 }).resampled;
    assert.equal(down.fs, 48000); assert.deepEqual(down.data.map(z => z.re), signal.data);
    assert.throws(() => run('add', { a: signal, b: up }), /taxas incompatíveis/);
});

test('RRC preserves every QPSK symbol through transmit and matched receive filters', () => {
    const bits = run('bit_source', {}, { count: 1024 }).bits;
    const symbols = run('qpsk', { bits }).symbols;
    const waveform = run('rrc_tx', { symbols }).waveform;
    const decoded = run('hard_qpsk', { symbols: run('rrc_rx', { waveform }).symbols }).bits;
    assert.deepEqual(decoded, bits);
});

test('RRC cache distinguishes spans that collided in bit-packed keys', () => {
    assert.equal(rrcTaps(8, .3501, 8).length, 65);
    assert.equal(rrcTaps(8, .3501, 40).length, 321);
});

test('uniform mid-rise quantizer uses the containing interval and clips endpoints', () => {
    const samples = run('quantizer', { message: { data: [-2, -.9, -.1, .1, .9, 2] } }, { bits: 2, range: 1 }).samples;
    assert.deepEqual(samples.data.map(z => z.re), [-.75, -.75, -.25, .25, .75, .75]);
});

test('arbitrary-length FFT agrees with direct DFT and labels odd shifted bins', () => {
    for (const N of [1, 5, 8, 15]) {
        const re = Array.from({ length: N }, (_, k) => Math.cos(k)), im = Array.from({ length: N }, (_, k) => Math.sin(2 * k));
        const input = re.map((v, k) => ({ re: v, im: im[k] }));
        fftAny(re, im);
        for (let k = 0; k < N; k++) {
            let r = 0, i = 0;
            input.forEach((z, n) => { const angle = -2 * Math.PI * k * n / N; r += z.re * Math.cos(angle) - z.im * Math.sin(angle); i += z.re * Math.sin(angle) + z.im * Math.cos(angle); });
            assert.ok(Math.abs(re[k] - r) < 1e-9 && Math.abs(im[k] - i) < 1e-9);
        }
    }
    const fft = computeFFT({ fs: 100, data: [1, 1, 1, 1, 1] }, 5, 'Retangular');
    assert.equal(fft.frequencyStart, -40);
    assert.equal(fft.frequencyStart + 2 * fft.binWidth, 0);
});

test('FFT convolution agrees with direct convolution', () => {
    const signal = Array.from({ length: 3000 }, (_, k) => ({ re: Math.sin(k), im: Math.cos(k) }));
    const taps = Array.from({ length: 80 }, (_, k) => Math.cos(k) / 80);
    const actual = convolveFull(signal, taps);
    const expected = Array.from({ length: signal.length + taps.length - 1 }, () => ({ re: 0, im: 0 }));
    signal.forEach((z, n) => taps.forEach((tap, k) => { expected[n + k].re += z.re * tap; expected[n + k].im += z.im * tap; }));
    actual.forEach((z, k) => assert.ok(Math.hypot(z.re - expected[k].re, z.im - expected[k].im) < 1e-9));
});

test('stationary fading is constant at zero Doppler and Rician power is normalized', () => {
    const signal = { fs: 48000, data: Array.from({ length: 100000 }, () => ({ re: 1, im: 0 })) };
    for (const type of ['rayleigh_fading', 'rician_fading']) {
        const still = run(type, { signal }, { doppler_hz: 0 }).impaired.data;
        assert.ok(still.every(z => z.re === still[0].re && z.im === still[0].im));
        const moving = run(type, { signal }, { doppler_hz: 10000, K_dB: 0 }).impaired.data;
        const power = moving.reduce((sum, z) => sum + z.re ** 2 + z.im ** 2, 0) / moving.length;
        assert.ok(Math.abs(power - 1) < .025, `${type}: power ${power}`);
    }
});

test('fractional resampling and RRC parameters report meaningful errors', () => {
    const signal = { data: [1, 2] };
    assert.throws(() => run('upsample', { signal }, { factor: 1.5 }), /inteiro/);
    assert.throws(() => run('decimate', { signal }, { factor: 1.5 }), /inteiro/);
    assert.throws(() => run('decimate', { signal }, { factor: 2, phase: 2 }), /fase/);
    assert.throws(() => run('rrc_tx', { symbols: signal }, { sps: 2.5 }), /inteiro/);
});

test('signal statistics handles large waveforms without argument stack overflow', () => {
    const results = [];
    createProcessors(results).signal_stats(node('signal_stats'), { signal: { data: Array(200000).fill(1) } });
    assert.equal(results[0].value, 1);
});

test('M-PSK modulator and demodulator round-trip every order and pulse without noise', () => {
    const bits = run('bit_source', {}, { count: 2400 }).bits;
    for (const M of [2, 4, 8, 16, 32]) {
        for (const pulse of ['RRC', 'Retangular']) {
            const waveform = run('mpsk_mod', { bits }, { M, pulse, phase: 22.5 }).waveform;
            const { bits: decoded, symbols } = run('mpsk_demod', { waveform }, { M, phase: 22.5 });
            assert.deepEqual(decoded, bits, `M=${M} ${pulse}`);
            // Rectangular integrate-and-dump is exact; truncated RRC (span 8) leaves a few percent of ISI.
            const tolerance = pulse === 'RRC' ? .06 : 1e-9;
            assert.ok(symbols.data.every(z => Math.abs(Math.hypot(z.re, z.im) - 1) < tolerance), `M=${M} ${pulse}: |r|≠1`);
        }
    }
});

test('M-PSK mappers use Gray labels: adjacent phases differ in exactly one bit', () => {
    for (const [type, port, M] of [['mpsk_mod', 'waveform', 16], ['mpsk', 'symbols', 16], ['mpsk', 'symbols', 8]]) {
        const k = Math.log2(M), bits = Array.from({ length: M }, (_, v) => Array.from({ length: k }, (_, j) => (v >> (k - 1 - j)) & 1)).flat();
        const out = run(type, { bits }, type === 'mpsk_mod' ? { M, pulse: 'Retangular' } : { M })[port].data;
        const step = type === 'mpsk_mod' ? out.length / M : 1;
        const byAngle = Array.from({ length: M }, (_, v) => ({ v, a: Math.atan2(out[v * step].im, out[v * step].re) })).sort((x, y) => x.a - y.a);
        byAngle.forEach(({ v }, i) => {
            const w = byAngle[(i + 1) % M].v;
            assert.equal((v ^ w).toString(2).replace(/0/g, '').length, 1, `${type} M=${M}: ${v}→${w}`);
        });
    }
});

test('8-PSK waveform BER in AWGN matches the Gray-coded theory', () => {
    const bits = run('bit_source', {}, { count: 9999, seed: 3 }).bits;
    const waveform = run('mpsk_mod', { bits }, { M: 8 }).waveform;
    const noisy = run('awgn', { signal: waveform }, { snr: 8, seed: 11 }).noisy;
    const decoded = run('mpsk_demod', { waveform: noisy }, { M: 8 }).bits;
    const errors = decoded.reduce((sum, b, k) => sum + (b !== bits[k]), 0), ber = errors / bits.length;
    // Pb ≈ (2/k)·Q(√(2kγb)·sin(π/M)) with k=3, γb=8 dB.
    const x = Math.sqrt(2 * 3 * 10 ** .8) * Math.sin(Math.PI / 8), expected = 2 / 3 * .5 * erfc(x / Math.SQRT2);
    assert.ok(ber > expected * .6 && ber < expected * 1.5, `BER ${ber} vs theory ${expected}`);
});

function erfc(x) {
    // Numerical integration of the Gaussian tail (Simpson), adequate for x in [0, 6].
    const steps = 4000, upper = x + 10, h = (upper - x) / steps;
    let sum = 0;
    for (let i = 0; i <= steps; i++) { const t = x + i * h, w = i === 0 || i === steps ? 1 : i % 2 ? 4 : 2; sum += w * Math.exp(-t * t); }
    return 2 / Math.sqrt(Math.PI) * sum * h / 3;
}

const bitErrors = (a, b) => a.reduce((sum, bit, k) => sum + (bit !== b[k]), 0);
const Q = x => .5 * erfc(x / Math.SQRT2);

test('Viterbi decodes the (7,5) code in transmission order, with hard and soft inputs', () => {
    const bits = run('bit_source', {}, { count: 600, seed: 4 }).bits;
    const coded = run('convolutional_encoder', { bits }).coded;
    assert.deepEqual(run('viterbi_decoder', { bits: coded }).decoded, bits);
    const symbols = run('bpsk', { bits: coded }).symbols;
    assert.deepEqual(run('viterbi_decoder', { bits: symbols }, { decision: 'suave' }).decoded, bits);
    // Coding gain: at Eb/N0 = 4 dB (R = 1/2) the decoder must beat uncoded BPSK by a wide margin.
    const many = run('bit_source', {}, { count: 20000, seed: 6 }).bits;
    const noisy = run('awgn', { signal: run('bpsk', { bits: run('convolutional_encoder', { bits: many }).coded }).symbols }, { snr: 4, codeRate: .5, seed: 2 }).noisy;
    const ber = bitErrors(run('viterbi_decoder', { bits: noisy }, { decision: 'suave' }).decoded, many) / many.length;
    assert.ok(ber < Q(Math.sqrt(2 * 10 ** .4)) / 5, `coded BER ${ber}`);
});

test('modems match their AWGN bit-error theory', () => {
    const bits = run('bit_source', {}, { count: 60000, seed: 5 }).bits, db = 6, g = 10 ** (db / 10);
    const cases = [
        ['oqpsk', {}, 'oqpsk_detector', Q(Math.sqrt(2 * g))],
        ['dpsk', {}, 'dpsk_detector', .5 * Math.exp(-g)],
        ['spread_tx', { mode: 'DSSS' }, 'spread_rx', Q(Math.sqrt(2 * g))],
        ['spread_tx', { mode: 'FHSS', code: '0527316' }, 'spread_rx', Q(Math.sqrt(2 * g))],
        // Non-precoded MSK under MLSE: each minimum-distance event flips two bits.
        ['msk', {}, 'msk_detector', 2 * Q(Math.sqrt(2 * g))],
    ];
    for (const [tx, config, rx, expected] of cases) {
        const signal = Object.values(run(tx, { bits }, config))[0];
        const noisy = run('awgn', { signal }, { snr: db, seed: 9 }).noisy;
        const decoded = run(rx, { [defs[rx].inputs[0]]: noisy }).bits;
        assert.equal(decoded.length, bits.length, tx);
        const ber = bitErrors(decoded, bits) / bits.length;
        assert.ok(ber > expected * .8 && ber < expected * 1.25, `${tx} ${config.mode || ''}: BER ${ber} vs ${expected}`);
    }
});

test('MSK rotates the phase by ±π/2 per bit; CPFSK detection is exact without noise', () => {
    const waveform = run('msk', { bits: [1, 1, 0] }).waveform, sps = waveform.sps, near = (k, phase) => Math.hypot(waveform.data[k].re - Math.cos(phase), waveform.data[k].im - Math.sin(phase)) < 1e-9;
    assert.ok(near(sps - 1, Math.PI / 2) && near(2 * sps - 1, Math.PI) && near(3 * sps - 1, Math.PI / 2));
    const bits = run('bit_source', {}, { count: 500 }).bits;
    for (const config of [{ mode: 'CPFSK', h: .7 }, { mode: 'GFSK', h: .5 }, { h: .731 }]) {
        assert.deepEqual(run('cpfsk_detector', { waveform: run('cpfsk', { bits }, config).waveform }).bits, bits, JSON.stringify(config));
    }
    assert.deepEqual(run('msk_detector', { waveform: run('msk', { bits }, { mode: 'GMSK' }).waveform }).bits, bits);
});

test('Rayleigh fading autocorrelation follows the Jakes J0 model', () => {
    const N = 200000, signal = { fs: 48000, data: Array.from({ length: N }, () => ({ re: 1, im: 0 })) };
    const h = run('rayleigh_fading', { signal }, { doppler_hz: 200 }).impaired.data;
    const J0 = x => { let sum = 0, term = 1; for (let k = 0; k < 40; k++) { sum += term; term *= -(x * x / 4) / ((k + 1) * (k + 1)); } return sum; };
    const power = h.reduce((s, z) => s + z.re ** 2 + z.im ** 2, 0) / N;
    for (const lag of [48, 96, 240]) {
        let s = 0; for (let i = 0; i + lag < N; i++) s += h[i].re * h[i + lag].re + h[i].im * h[i + lag].im;
        assert.ok(Math.abs(s / (N - lag) / power - J0(2 * Math.PI * 200 * lag / 48000)) < .06, `lag ${lag}`);
    }
});

test('sampling audit reports samples per cycle and flags aliasing after decimation', () => {
    const results = [], p = createProcessors(results);
    const tone = p.complex_tone(node('complex_tone', { frequency: 9000 }), {}).waveform;
    p.sampling_audit(node('sampling_audit'), { signal: p.decimate(node('decimate', { factor: 4 }), { signal: tone }).resampled });
    assert.equal(results[0].value, 12000 / 9000);
    assert.match(results[0].detail, /ALIAS/);
});

test('Costas loop settles near a lock point despite the 2fc mixing product', () => {
    for (const phaseInit of [45, 175]) {
        const results = [], p = createProcessors(results);
        const message = p.sine_source(node('sine_source', { frequency: 300, duration: .15 }), {}).samples;
        p.costas_loop(node('costas_loop', { carrier: 5000, loopBandwidth: 100, phaseInit }), { signal: p.analog_sideband(node('analog_sideband', { mode: 'DSB-SC', carrier: 5000 }), { message }).modulated });
        assert.ok(results[0].value < 3, `φ0=${phaseInit}: residual ${results[0].value}°`);
    }
});
