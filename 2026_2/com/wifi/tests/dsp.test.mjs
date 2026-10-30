import { test } from 'node:test';
import assert from 'node:assert/strict';
import { constellation, bitsOf, popcount, theoryBer, theorySer, rayleighBer, bpskMrcClosedForm, monteCarloBer, bccEncode, viterbiDecode, codedLength, monteCarloCoded, precoders, userSinr, patternGain, requiredEbn0Db, shannonEbn0Db, db2lin, combinedCdf, fadingAverage, FAMILIES } from '../dsp.mjs';

const near = (a, b, rel, msg) => assert.ok(Math.abs(a - b) <= rel * Math.abs(b), `${msg}: ${a} vs ${b}`);

test('constellations have unit energy, decide their own points, and Gray neighbours differ in one bit', () => {
    for (const [family, orders] of Object.entries(FAMILIES)) for (const M of orders) for (const mapping of ['gray', 'natural']) {
        const c = constellation(family, M, mapping);
        assert.equal(new Set(c.points.map(p => `${p.re.toFixed(6)},${p.im.toFixed(6)}`)).size, M);
        near(c.points.reduce((s, p) => s + p.re ** 2 + p.im ** 2, 0) / M, 1, 1e-9, `${family}${M} Es`);
        c.points.forEach((p, label) => assert.equal(c.decide(p), label));
        if (mapping === 'gray') c.points.forEach((p, a) => c.points.forEach((q, b) => {
            if (Math.abs(Math.hypot(p.re - q.re, p.im - q.im) - c.dmin) < 1e-9) assert.equal(popcount(a ^ b), 1, `${family}${M} ${a}/${b}`);
        }));
    }
    assert.deepEqual(bitsOf(0b1011, 4), [1, 0, 1, 1]);
});

test('Monte Carlo matches AWGN and Rayleigh theory', () => {
    for (const [family, M, eb] of [['psk', 2, 6], ['qam', 16, 10], ['psk', 8, 10], ['qam', 64, 14]]) {
        const s = monteCarloBer({ family, M, ebn0Db: eb, minErrors: 2000, maxBits: 4e6 });
        near(s.ber, theoryBer(family, M, db2lin(eb)), .12, `${family}${M}`);
    }
    near(theorySer('psk', 4, db2lin(10)), 1 - (1 - theoryBer('psk', 4, db2lin(10) / 2)) ** 2, 1e-3, 'QPSK SER');
    for (const L of [1, 2, 4]) near(rayleighBer('psk', 2, db2lin(15), L), bpskMrcClosedForm(db2lin(15), L), 1e-3, `MRC L=${L}`);
    const s = monteCarloBer({ family: 'psk', M: 2, ebn0Db: 10, channel: 'rayleigh', L: 2, minErrors: 2000, maxBits: 4e6 });
    near(s.ber, bpskMrcClosedForm(db2lin(10), 2), .12, 'MC MRC');
    near(combinedCdf(.1, 1), 1 - Math.exp(-.1), 1e-12, 'cdf');
    near(fadingAverage(() => 1, 1, 3, 'sc'), 1, 1e-4, 'SC pdf integrates to 1');
});

test('BCC round-trips, punctures to the right rate and gains over uncoded', () => {
    const bits = Array.from({ length: 300 }, (_, i) => (i * 7 + (i >> 3)) & 1);
    for (const rate of ['1/2', '2/3', '3/4', '5/6']) {
        const enc = bccEncode(bits, rate);
        assert.equal(enc.coded.length, codedLength(enc.input.length, rate));
        const llr = enc.coded.map(b => b ? -4 : 4);
        assert.deepEqual([...viterbiDecode(llr, enc.input.length, rate)].slice(0, 300), bits, rate);
    }
    assert.deepEqual(bccEncode([1], '1/2', false).coded, [1, 1]);
    const coded = monteCarloCoded({ M: 4, rate: '1/2', ebn0Db: 4, minErrors: 40, maxBits: 2e5 });
    assert.ok(coded.ber < theoryBer('qam', 4, db2lin(4)) / 20, `coded ${coded.ber}`);
});

test('beamforming: MRT gives N, ZF nulls the other user, Shannon limit', () => {
    const W = precoders('mrt', 8, .5, [20]);
    near(patternGain(W[0], 8, .5, 20), 8, 1e-9, 'MRT array gain');
    const Z = precoders('zf', 8, .5, [-30, 25]), s = userSinr(Z, 8, .5, [-30, 25], 100);
    assert.ok(s.every(u => u.interference < 1e-12));
    near(shannonEbn0Db(1e-6), -1.5917, 1e-3, 'Shannon limit');
    near(requiredEbn0Db(g => theoryBer('psk', 2, g), 1e-5), 9.59, 2e-3, 'BPSK at 1e-5');
});

test('pulse shaping: matched RRC reaches the bound, RC+matched has ISI, LDPC beats the BCC', async () => {
    const { pulseLink, rcPulse, monteCarloLdpc, ldpcCode, ldpcDecode } = await import('../dsp.mjs');
    for (let k = 1; k < 6; k++) assert.ok(Math.abs(rcPulse(k, .35)) < 1e-12, 'RC is Nyquist');
    const theory = theoryBer('psk', 2, db2lin(6));
    near(pulseLink({ shape: 'rrc', ebn0Db: 6, symbols: 80000 }).ber, theory, .15, 'RRC matched');
    near(pulseLink({ shape: 'rect', ebn0Db: 6, symbols: 150000 }).ber, theory, .15, 'rect + I&D');
    assert.ok(pulseLink({ shape: 'rc', ebn0Db: 6 }).isi > .3, 'RC + matched is not Nyquist');
    const lpf = pulseLink({ shape: 'rc', rx: 'lpf', ebn0Db: 6 });
    assert.ok(lpf.isi < .05 && lpf.snrLossDb > 1 && lpf.snrLossDb < 5, `lpf loss ${lpf.snrLossDb}`);
    const code = ldpcCode(1296, '1/2');
    assert.equal(code.m, 648);
    assert.ok(ldpcDecode(code, new Array(1296).fill(3)).converged);
    assert.ok(monteCarloLdpc({ M: 4, rate: '1/2', ebn0Db: 2.5, maxBits: 2e5 }).ber < 1e-4);
});
