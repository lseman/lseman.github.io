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
