import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dataRate, packetErrorRate, requiredSnr, bfGain, thermalNoiseDbm, STANDARDS } from '../phy.mjs';
import { numerology, simulateOfdm } from '../ofdm.mjs';
import { planOfdma } from '../ofdma.mjs';
import { Lab } from '../net.mjs';
import { SCENARIOS } from '../scenarios.mjs';
import { plot } from '../charts.mjs';

const close = (a, b, tolerance = 1e-8) => assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);
test('PHY rates, noise, beamforming and PER thresholds', () => {
    close(dataRate('wifi6', 80, 11, 2, .8), 1200.9803921568628);
    close(thermalNoiseDbm(20, 0), -100.98970004336019);
    close(bfGain(4, 1), 6.020599913279624);
    close(bfGain(4, 4), 0);
    for (let i = 0; i < 14; i++) {
        const threshold = requiredSnr(i);
        close(packetErrorRate(threshold, i), .1, 1e-9);
        assert.ok(packetErrorRate(threshold + 1, i) < .1);
    }
});
test('OFDM numerology and noise-free reconstruction across supported widths', () => {
    for (const [standard, std] of Object.entries(STANDARDS)) for (const width of std.widths) {
        const n = numerology(standard, width, std.gis[0]);
        assert.equal(n.nsd, std.subcarriers[width], `${standard} ${width}`);
        assert.equal(new Set(n.used).size, n.used.length);
        assert.ok(n.pilots.every(k => n.used.includes(k)));
    }
    const sim = simulateOfdm({standard:'wifi6',width:20,gi:.8,M:16,snrDb:60,profile:'none',cfo:0,estimation:'ideal',equalizer:'zf',pilotTracking:false,symbols:8,seed:1});
    assert.equal(sim.errors, 0);
    assert.ok(sim.evm < .01);
});
test('OFDMA serves mixed HE/EHT clients with fixed AP MCS', () => {
    const p = planOfdma({standard:'wifi7', width:80, gi:.8, bytes:200, fixedMcs:13, users:[{id:'a', snrDb:45, nss:1, rxChains:1, standard:'wifi6', width:80}]});
    assert.equal(p.users[0].su.mcs, 11);
    assert.equal(p.users[0].mu.mcs, 11);
    assert.ok(p.muGoodput > 0);
});
test('mesh paths share airtime and Ethernet backhaul reaches root', () => {
    const lab = new Lab(SCENARIOS.mesh.build());
    const l = { ap: {wifi:{band:'5'}}, freq: 5210 };
    lab.hopGoodput = () => 100;
    close(lab.pathGoodput([{link:l,dir:'dl'}, {link:l,dir:'dl'}]).mbps, 50);
    const node = lab.device('r3'); node.mesh.backhaul = 'ethernet';
    const route = lab.meshTree().get(node.id);
    assert.equal(route.parent, 'r1');
    assert.equal(route.link, null);
});
test('logarithmic x-axis labels use powers of ten', () => {
    const labels = [];
    const ctx = new Proxy({measureText: s => ({width:s.length * 6}), fillText: s => labels.push(String(s))}, {get: (o,k) => k in o ? o[k] : () => {}});
    globalThis.window = {devicePixelRatio:1}; globalThis.document = {documentElement:{}};
    globalThis.getComputedStyle = () => ({getPropertyValue: () => '#000'});
    plot({clientWidth:400,clientHeight:240,getContext:()=>ctx}, {x:{min:40,max:1500,log:true}, y:{min:0,max:1}});
    assert.ok(labels.includes('100'));
    assert.ok(labels.includes('1k'));
    assert.ok(!labels.includes('200'));
});
