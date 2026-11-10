import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fft, harmonics, thd, rlCurrent, powerQuality, singlePhase, singlePhaseV1, pwmGain, threePhase, threePhaseGain, svDwell, seqWindow, multilevel, diodeBridge, scrSingle, scrThree, scrVd0, boostPfc, iecClassD, mean, rms, TAU } from '../power.mjs';

const near = (a, b, rel, msg) => assert.ok(Math.abs(a - b) <= rel * Math.abs(b), `${msg}: ${a} vs ${b}`);

test('FFT round-trip and harmonic amplitudes', () => {
    const n = 1024, x = Array.from({ length: n }, (_, i) => 3 * Math.cos(TAU * i / n + .4) + Math.sin(TAU * 5 * i / n) + .5);
    const re = Float64Array.from(x), im = new Float64Array(n);
    fft(re, im); fft(re, im, true);
    re.forEach((v, i) => near(v, x[i] || 1e-12, 1e-9, 'roundtrip'));
    const h = harmonics(x);
    near(h.amp[1], 3, 1e-9, 'h1'); near(h.phase[1], .4, 1e-9, 'phase'); near(h.amp[5], 1, 1e-9, 'h5'); near(h.dc, .5, 1e-9, 'dc');
    near(thd(h.amp), 1 / 3, 1e-9, 'thd');
});

test('RL current of a sine matches the phasor and power quality is consistent', () => {
    const n = 2048, f = 60, R = 3, L = 10e-3, v = Array.from({ length: n }, (_, i) => 100 * Math.sin(TAU * i / n));
    const i = rlCurrent(v, R, L, f), Z = Math.hypot(R, TAU * f * L);
    near(Math.max(...i), 100 / Z, 1e-3, 'peak');
    const pq = powerQuality(v, Array.from(i));
    near(pq.DPF, R / Z, 1e-6, 'DPF'); near(pq.PF, R / Z, 1e-6, 'PF'); near(pq.P, (100 / Math.SQRT2) ** 2 * R / Z ** 2, 1e-6, 'P');
});

test('single-phase PWM fundamental follows ma·Vdc and unipolar cancels the mf cluster', () => {
    for (const scheme of ['bipolar', 'unipolar']) for (const ma of [.4, .8, 1]) {
        const r = singlePhase({ vdc: 400, ma, mf: 21, scheme }), h = harmonics(r.v);
        near(h.amp[1], ma * 400, .02, `${scheme} ma=${ma}`);
    }
    const bi = harmonics(singlePhase({ vdc: 1, ma: .8, mf: 21, scheme: 'bipolar' }).v), uni = harmonics(singlePhase({ vdc: 1, ma: .8, mf: 21, scheme: 'unipolar' }).v);
    assert.ok(bi.amp[21] > .5 && uni.amp[21] < .02, `mf cluster: bipolar ${bi.amp[21]}, unipolar ${uni.amp[21]}`);
    near(harmonics(singlePhase({ vdc: 1, scheme: 'square' }).v).amp[1], 4 / Math.PI, .01, 'square');
    near(harmonics(singlePhase({ vdc: 1, ma: .9, scheme: 'qsquare' }).v).amp[1], singlePhaseV1('qsquare', .9, 1), .01, 'quasi-square');
    near(pwmGain(1), 1, 1e-9, 'gain at 1'); near(pwmGain(50), 4 / Math.PI, .01, 'gain → 4/π');
    near(harmonics(singlePhase({ vdc: 1, ma: 1.6, mf: 61, scheme: 'bipolar' }).v).amp[1], pwmGain(1.6), .03, 'overmodulation');
});

test('three-phase: SVPWM extends the linear range by 2/√3 and dwell times add up', () => {
    const lin = ma => Math.sqrt(3) / 2 * ma;
    near(threePhaseGain('svpwm', 1.15), lin(1.15), .005, 'svpwm linear');
    near(threePhaseGain('thi', 1.15), lin(1.15), .005, 'thi linear');
    assert.ok(threePhaseGain('spwm', 1.15) < lin(1.15) * .99, 'spwm saturates');
    const r = threePhase({ vdc: 600, ma: 1.1, mf: 33, mode: 'svpwm' }), h = harmonics(r.vab);
    near(h.amp[1], 600 * lin(1.1), .02, 'vab fundamental');
    assert.ok(Math.abs(mean(r.van)) < 1e-9 && harmonics(r.van).amp[3] < 1, 'no triplen in phase voltage');
    for (const th of [5, 47, 133, 299]) { const d = svDwell(.9, th); near(d.t1 + d.t2 + d.t0, 1, 1e-12, 'dwell sum'); assert.ok(d.t0 >= 0); }
    const seq = seqWindow('svpwm', .9, 21, 20);
    assert.deepEqual(seq.segs.map(s => s.state), ['000', '100', '110', '111', '110', '100', '000']);
});

test('multilevel CHB: levels, fundamental, and PS-PWM shares power equally', () => {
    for (const method of ['ps', 'pd', 'pod', 'apod', 'nlc']) {
        const r = multilevel({ levels: 7, ma: .95, mf: 21, method, vcell: 100 });
        assert.equal(new Set(r.v).size, 7, method);
        near(harmonics(r.v).amp[1], .95 * 3 * 100, method === 'nlc' ? .05 : .03, `${method} V1`); // nearest level: coarse 7-step staircase
    }
    const r = multilevel({ levels: 7, ma: .95, mf: 8, method: 'ps', vcell: 100 }), i = rlCurrent(r.v, 10, 5e-3, 60);
    const p = r.cells.map(c => mean(Array.from(c, (s, k) => s * i[k])));
    p.forEach(x => near(x, p[0], .05, 'power share'));
    const ld = multilevel({ levels: 7, ma: .95, mf: 8, method: 'pd', vcell: 100 }), pd = ld.cells.map(c => mean(Array.from(c, (s, k) => s * i[k])));
    assert.ok(pd[0] > 1.3 * pd[2], `PD unequal ${pd}`);
});

test('rectifiers: averages match the textbook formulas', () => {
    for (const alphaDeg of [0, 30, 60]) {
        const r = scrSingle({ vrms: 127, alphaDeg, R: 5, L: 200e-3 });
        near(mean(r.vd), scrVd0('scr1', 127) * Math.cos(alphaDeg * Math.PI / 180), .03, `1φ α=${alphaDeg}`);
        const t = scrThree({ vll: 220, alphaDeg, R: 5, L: 200e-3 });
        near(mean(t.vd), scrVd0('scr3', 220) * Math.cos(alphaDeg * Math.PI / 180), .03, `3φ α=${alphaDeg}`);
    }
    const t = powerQuality(Array.from(scrThree({ vll: 220, alphaDeg: 0, R: 5, L: 500e-3 }).vs), Array.from(scrThree({ vll: 220, alphaDeg: 0, R: 5, L: 500e-3 }).is));
    near(t.DF, 3 / Math.PI, .02, '6-pulse distortion factor'); near(t.harm[5] / t.harm[1], 1 / 5, .05, 'h5 = I1/5');
    const d = diodeBridge({ vrms: 127, C: 2200e-6, R: 50, Ls: .1e-3 }), pq = powerQuality(Array.from(d.vs), Array.from(d.is));
    assert.ok(mean(d.vo) > .9 * 127 * Math.SQRT2 && pq.PF < .7 && pq.thdI > 1, `cap filter PF ${pq.PF} THD ${pq.thdI}`);
    near(pq.P, rms(d.vo) ** 2 / 50, .03, 'energy balance');
});

test('boost PFC: sinusoidal current, regulated output, IEC class D', () => {
    for (const mode of ['avg', 'hyst', 'crm']) {
        const r = boostPfc({ vrms: 220, P: 500, Vref: 400, mode, L: mode === 'crm' ? .3e-3 : 1e-3, fsw: 50e3, cycles: 6 });
        const pq = powerQuality(Array.from(r.vs), Array.from(r.is));
        assert.ok(pq.PF > .97, `${mode} PF ${pq.PF}`);
        near(mean(r.vo), 400, .02, `${mode} Vo`);
        near(pq.P, 500, .06, `${mode} P`);
        for (let h = 3; h <= 39; h += 2) assert.ok(pq.harm[h] <= iecClassD(h, 500), `${mode} h${h} ${pq.harm[h]} > ${iecClassD(h, 500)}`);
    }
});
