import test from 'node:test';
import assert from 'node:assert/strict';
import { dataRate, requiredSnr, effectiveStandard, mcsValid, selectRate, MCS } from '../2026_2/com/wifi/phy.mjs';
import { Lab, makeRouter, makeClient, apConfigError, defaultEnvironment } from '../2026_2/com/wifi/net.mjs';
import { SCENARIOS } from '../2026_2/com/wifi/scenarios.mjs';
import { runCommand } from '../2026_2/com/wifi/terminal.mjs';

const world = (devices, extra = {}) => { const lab = new Lab({ version: 1, seed: 3, plan: { width: 40, height: 24 }, env: defaultEnvironment(), devices, walls: [], ...extra }); lab.reconcile(); return lab; };
const ap = (over = {}) => makeRouter('r1', 'Roteador', 20, 12, over);
const sta = (id, over = {}, type = 'laptop', x = 24, y = 12) => makeClient(id, type, id, x, y, { wifi: { ssid: 'LabWiFi', password: 'senha1234', ...over.wifi }, ...over, ...(over.wifi ? { wifi: { ssid: 'LabWiFi', password: 'senha1234', ...over.wifi } } : {}) });

test('PHY rates match the 802.11 n/ac/ax/be tables', () => {
    assert.equal(dataRate('wifi4', 20, 7, 1, .8).toFixed(1), '65.0');
    assert.equal(dataRate('wifi5', 80, 9, 1, .4).toFixed(1), '433.3');
    assert.equal(dataRate('wifi6', 80, 11, 1, .8).toFixed(1), '600.5');
    assert.equal(dataRate('wifi6', 160, 11, 2, .8).toFixed(0), '2402');
    assert.equal(dataRate('wifi7', 320, 13, 1, .8).toFixed(0), '2882');
});

test('required SNR grows with the MCS and matches typical receiver thresholds', () => {
    const req = MCS.map((_, i) => requiredSnr(i));
    for (let i = 1; i < req.length; i++) assert.ok(req[i] > req[i - 1], `MCS ${i}`);
    assert.ok(req[0] > 0 && req[0] < 4 && req[11] > 30 && req[11] < 38 && req[13] > 36 && req[13] < 44);
});

test('standard negotiation falls back per band and enforces the VHT20 MCS 9 exception', () => {
    assert.equal(effectiveStandard('wifi6', 'wifi5', '2.4'), 'wifi4');
    assert.equal(effectiveStandard('wifi7', 'wifi6', '6'), null);
    assert.equal(effectiveStandard('wifi7', 'wifi6e', '6'), 'wifi6e');
    assert.equal(mcsValid('wifi5', 20, 9, 1), false);
    assert.equal(mcsValid('wifi5', 20, 9, 3), true);
    const r = selectRate({ standard: 'wifi6', width: 80, gi: .8, maxNss: 2, rxChains: 2, snrDb: 15 });
    assert.ok(r.per <= .1 && r.mcs < 8);
});

test('security: wrong PSK fails the 4-way MIC, wrong SAE fails Confirm, WPA3-only rejects Wi-Fi 4, 6 GHz forbids WPA2', () => {
    let lab = world([ap({ wifi: { security: 'WPA2' } }), sta('ok'), sta('bad', { wifi: { password: 'errada123' } })]);
    assert.ok(lab.rt('ok').assoc);
    assert.match(lab.rt('bad').last.message, /MIC/);
    lab = world([ap({ wifi: { security: 'WPA3' } }), sta('bad', { wifi: { password: 'errada123' } }), sta('old', { wifi: { standard: 'wifi4' } })]);
    assert.match(lab.rt('bad').last.message, /SAE/);
    assert.match(lab.rt('old').last.message, /WPA3/);
    assert.match(apConfigError(ap({ wifi: { standard: 'wifi7', band: '6', width: 160, channel: 15, security: 'WPA2' } })), /6 GHz exige WPA3/);
});

test('DHCP hands out unique leases, falls back to APIPA when the pool is exhausted, and declines a statically used address', () => {
    const lab = world([ap({ dhcp: { start: '192.168.0.100', end: '192.168.0.101' } }), sta('a'), sta('b'), sta('c')]);
    const ips = ['a', 'b', 'c'].map(id => lab.rt(id).ip.address);
    assert.deepEqual(ips.slice(0, 2).sort(), ['192.168.0.100', '192.168.0.101']);
    assert.match(ips[2], /^169\.254\./);
    const conflict = world([ap(), sta('s', { ip: { mode: 'static', address: '192.168.0.100', mask: '255.255.255.0', gateway: '192.168.0.1', dns: '192.168.0.1' } }), sta('d')]);
    assert.equal(conflict.rt('d').ip.address, '192.168.0.101');
    assert.ok(conflict.events.some(e => /DECLINE/.test(e.info)));
});

test('IP layer: gateway, wrong gateway, DNS failure, NAT to the Internet, WAN down and client isolation', () => {
    const lab = world([ap(), sta('a'), sta('b', {}, 'phone', 16, 12), sta('g', { ip: { mode: 'static', address: '192.168.0.30', mask: '255.255.255.0', gateway: '192.168.0.254', dns: '192.168.0.1' } }), sta('n', { ip: { mode: 'static', address: '192.168.0.31', mask: '255.255.255.0', gateway: '192.168.0.1', dns: '10.9.9.9' } })]);
    const a = lab.device('a');
    assert.ok(lab.ping(a, '192.168.0.1').replies.every(r => r.ok));
    assert.ok(lab.ping(a, 'google.com').replies.every(r => r.ok && r.ttl === 117));
    assert.ok(lab.ping(a, 'b.lan').replies.every(r => r.ok));
    assert.ok(lab.ping(lab.device('g'), '8.8.8.8').replies.every(r => r.error === 'unreachable'));
    assert.equal(lab.ping(lab.device('n'), 'google.com').error, 'dnstimeout');
    lab.device('r1').wan.connected = false;
    assert.ok(lab.ping(a, '8.8.8.8').replies.every(r => r.error === 'timeout'));
    lab.device('r1').wifi.isolation = true;
    lab.rt('a').arp.clear();
    assert.ok(lab.ping(a, lab.ipOf(lab.device('b'))).replies.every(r => !r.ok));
});

test('partially overlapping 2.4 GHz channels interfere; 1/6/11 restores SINR and throughput', () => {
    const measure = plan => {
        const st = SCENARIOS.interference.build();
        st.devices.filter(d => d.type === 'router').forEach((r, i) => { r.wifi.channel = plan[i]; });
        const lab = new Lab(st); lab.reconcile();
        const nb = lab.device('c1');
        return { sinr: lab.currentLink(nb).dl.sinr, mbps: lab.iperf(nb, '192.168.0.1').mean };
    };
    const bad = measure([6, 3, 6]), good = measure([1, 6, 11]);
    assert.ok(good.sinr > bad.sinr + 20 && good.mbps > 5 * bad.mbps, JSON.stringify({ bad, good }));
});

test('forced SNR drives rate adaptation, and losing beacons disassociates the client', () => {
    const lab = world([ap(), sta('a', { snrOverride: 30 })]);
    const mcsAt = snr => { lab.device('a').snrOverride = snr; return lab.currentLink(lab.device('a')).rates.dl.mcs; };
    assert.ok(mcsAt(40) > mcsAt(20) && mcsAt(20) > mcsAt(8));
    lab.device('a').snrOverride = -8; lab.reconcile();
    assert.equal(lab.rt('a').assoc, null);
});

test('every scenario builds, and the troubleshooting scenario contains its planted faults', () => {
    for (const [key, s] of Object.entries(SCENARIOS)) { const lab = new Lab(s.build()); lab.reconcile(); assert.ok(lab.events.length, key); }
    const lab = new Lab(SCENARIOS.troubleshoot.build()); lab.reconcile();
    assert.match(lab.rt('c2').last.message, /Senha incorreta/);
    assert.match(lab.ipOf(lab.device('c7')), /^169\.254\./);
    assert.match(runCommand(lab, lab.device('c1'), 'nslookup google.com').join('\n'), /não respondeu/);
    assert.match(runCommand(lab, lab.device('c4'), 'ping 8.8.8.8').join('\n'), /inacessível/);
    assert.match(runCommand(lab, lab.device('c1'), 'ping 192.168.1.50').join('\n'), /Perdidos = 4/);
});

import { linkMetrics, allMetrics, rateVsDistance, spectralMask, berCurve, shannonCurve } from '../2026_2/com/wifi/metrics.mjs';

test('link metrics: Eb/N0 bookkeeping, FEC improves BER, and no device beats Shannon', () => {
    for (const [key, s] of Object.entries(SCENARIOS)) {
        const lab = new Lab(s.build()); lab.reconcile();
        for (const dir of ['dl', 'ul']) for (const m of allMetrics(lab, dir)) {
            const k = Math.log2(m.modulation.M);
            assert.ok(Math.abs(m.ebn0 - (m.esn0 - 10 * Math.log10(k * m.modulation.rate))) < 1e-9, key);
            assert.ok(m.ber <= m.rawBer + 1e-15, `${key} ${m.client.name}: FEC must not worsen BER`);
            // Shannon bounds reliable rates: only links that actually work (PER ≤ 10%) must sit below C.
            if (m.per <= .1) assert.ok(m.phyRate < m.capacity, `${key} ${m.client.name} ${dir}: ${m.phyRate} ≥ C=${m.capacity}`);
            assert.ok(m.goodput <= m.phyRate && m.efficiency >= 0 && m.efficiency < 1, `${key} ${m.client.name}: goodput ${m.goodput}, η ${m.efficiency}`);
        }
    }
});

test('measured frame statistics come from the log and rate falls monotonically with distance', () => {
    const lab = world([ap(), sta('a')]);
    lab.ping(lab.device('a'), '192.168.0.1', { count: 10 });
    const m = linkMetrics(lab, lab.device('a'), 'dl');
    assert.ok(m.measured.frames >= 10 && m.measured.attempts >= m.measured.frames);
    const curve = rateVsDistance(lab, lab.device('r1'));
    for (let i = 1; i < curve.length; i++) assert.ok(curve[i].rate <= curve[i - 1].rate + 1e-9);
    assert.equal(curve.at(-1).rate < curve[0].rate, true);
});

test('theory curves and spectral mask are well formed', () => {
    const bpsk = berCurve(2);
    assert.ok(Math.abs(bpsk.find(([x]) => x === 9.5)[1] - 1.1e-5) / 1.1e-5 < .2, 'BPSK ≈ 1e-5 near 9.6 dB');
    assert.ok(Math.abs(shannonCurve().find(([x]) => x === 0)[1] - 1) < 1e-12, 'log2(1+1) = 1');
    assert.equal(spectralMask(0, 20), 0);
    assert.equal(spectralMask(10.5, 20), -20);
    assert.equal(spectralMask(20, 20), -28);
    assert.equal(spectralMask(40, 20), -40);
});

import { simulateOfdm, numerology, channelTaps } from '../2026_2/com/wifi/ofdm.mjs';

test('OFDM numerology matches 802.11 tone plans', () => {
    const plan = (s, w) => { const n = numerology(s, w, .8); return [n.N, n.nsd, n.nsp, Math.max(...n.used)]; };
    assert.deepEqual(plan('wifi4', 20), [64, 52, 4, 28]);
    assert.deepEqual(plan('wifi5', 80), [256, 234, 8, 122]);
    assert.deepEqual(plan('wifi6', 20), [256, 234, 8, 122]);
    assert.deepEqual(plan('wifi6', 80), [1024, 980, 16, 500]);
    assert.equal(numerology('wifi7', 320, .8).nsd, 3920);
    assert.equal(numerology('wifi6', 20, 3.2).cp, 64);
});

const ofdm = over => simulateOfdm({ standard: 'wifi6', width: 20, gi: .8, M: 4, snrDb: 8, profile: 'none', cfo: 0, estimation: 'ideal', equalizer: 'zf', pilotTracking: false, symbols: 200, seed: 1, ...over });

test('OFDM in AWGN matches the QPSK bit error rate and has no ISI', () => {
    const r = ofdm();
    assert.ok(Math.abs(r.ber / r.theory.awgn - 1) < .1, `${r.ber} vs ${r.theory.awgn}`);
    assert.ok(r.distortionDb < -200);
});

test('a cyclic prefix longer than the echo removes ISI; a shorter one does not', () => {
    assert.ok(channelTaps('echo', 20).maxNs === 2000);
    const short = ofdm({ profile: 'echo', gi: .8, snrDb: 35, symbols: 20 }), long = ofdm({ profile: 'echo', gi: 3.2, snrDb: 35, symbols: 20 });
    assert.ok(short.distortionDb > -20 && short.ber > 1e-2, `GI 0.8: ${short.distortionDb} dB, BER ${short.ber}`);
    assert.ok(long.distortionDb < -200 && long.ber === 0, `GI 3.2: ${long.distortionDb} dB, BER ${long.ber}`);
});

test('frequency-selective fading: ZF matches the subcarrier-averaged theory and beats no equalization', () => {
    const zf = ofdm({ profile: 'D', M: 16, snrDb: 20, symbols: 60 }), none = ofdm({ profile: 'D', M: 16, snrDb: 20, symbols: 60, equalizer: 'none' });
    assert.ok(Math.abs(zf.ber / zf.theory.faded - 1) < .3, `${zf.ber} vs ${zf.theory.faded}`);
    assert.ok(zf.theory.faded > 10 * zf.theory.awgn && none.ber > 5 * zf.ber);
});

test('CFO rotates every symbol; pilot tracking removes the common phase error', () => {
    const off = ofdm({ cfo: .02, snrDb: 25, symbols: 30 }), on = ofdm({ cfo: .02, snrDb: 25, symbols: 30, pilotTracking: true });
    assert.ok(off.ber > .1 && on.ber < 1e-3, `${off.ber} → ${on.ber}`);
    assert.ok(on.distortionDb > -40 && on.distortionDb < -20, 'residual ICI from the CFO');
});

test('OFDMA: RU plan, per-RU MCS limit, uplink power gain and small-packet airtime advantage', async () => {
    const { planOfdma, ruCount, ruRate, ruMaxMcs } = await import('../2026_2/com/wifi/ofdma.mjs');
    assert.equal(ruCount(20, 26), 9); assert.equal(ruCount(80, 26), 37); assert.equal(ruCount(320, 3984), 1);
    // A 242-tone RU at 20 MHz is the whole HE20 channel: same rate as the SU table.
    assert.equal(ruRate('wifi6', 234, 11, 1, .8).toFixed(1), dataRate('wifi6', 20, 11, 1, .8).toFixed(1));
    assert.equal(ruMaxMcs('wifi6', 106), 9); assert.equal(ruMaxMcs('wifi7', 242), 13);
    const users = [30, 22, 12, 35].map((snrDb, i) => ({ id: `u${i}`, name: `u${i}`, snrDb, nss: 1, rxChains: 1 }));
    const small = planOfdma({ standard: 'wifi6', width: 20, gi: .8, users, bytes: 100 });
    assert.equal(small.ru.tones, 52); assert.equal(small.mu.rounds, 1);
    assert.ok(small.users.every(u => u.mu.mcs <= 9), '1024-QAM is not allowed on RU52');
    assert.ok(small.gain > 1.5, `OFDMA wins on small packets (${small.gain})`);
    assert.ok(planOfdma({ standard: 'wifi6', width: 20, gi: .8, users, bytes: 1500 }).gain < 1, 'SU wins on large packets with few users');
    const ul = planOfdma({ standard: 'wifi6', width: 20, gi: .8, users, bytes: 100, dir: 'ul' });
    assert.ok(Math.abs(ul.ulGain - 10 * Math.log10(234 / 48)) < 1e-9);
    assert.ok(ul.users[2].mu.mcs > small.users[2].mu.mcs, 'power concentration raises the weak user MCS');
    assert.equal(planOfdma({ standard: 'wifi6', width: 80, gi: .8, users, ruTones: 26, fixedMcs: 11 }).blocked, true);
    assert.equal(planOfdma({ standard: 'wifi6', width: 20, gi: .8, users, ruTones: 106 }).mu.rounds, 2);
});

test('router web admin: HTTP reachability over Wi-Fi, draft validation and channel survey', async () => {
    const { draftOf, draftError, channelSurvey, pageOfPath } = await import('../2026_2/com/wifi/admin.mjs');
    const lab = new Lab(SCENARIOS.first.build()); lab.reconcile();
    const [c, other] = lab.clients, r = lab.routers[0];
    const page = lab.http(c, 'http://192.168.0.1/wireless');
    assert.ok(page.ok && page.value.router === r && page.path === '/wireless');
    assert.ok(lab.http(c, 'roteador.lan').ok, 'local DNS name of the router');
    assert.ok(lab.http(c, 'google.com').value.site, 'Internet through NAT');
    assert.equal(lab.http(other, `http://${lab.ipOf(c)}/`).ok, false, 'clients run no web server');
    assert.equal(pageOfPath('/'), 'status'); assert.equal(pageOfPath('/lan/'), 'lan'); assert.equal(pageOfPath('/nada'), null);
    const d = draftOf(r);
    d.wifi.password = 'curta'; assert.match(draftError(d, 'wireless'), /8 a 63/);
    d.wifi.password = 'senha1234'; d.wifi.enabled = false; assert.equal(draftError(d, 'wireless'), null, 'turning the radio off is allowed');
    d.lan.ip = '10.0.0.1'; assert.match(draftError(d, 'lan'), /fora da sub-rede/);
    assert.notEqual(r.lan.ip, '10.0.0.1', 'the draft is a copy');
    // Lose the IP: the admin page becomes unreachable with the right error.
    lab.release(c);
    assert.equal(lab.http(c, '192.168.0.1').error, 'noip');
    const noisy = new Lab(SCENARIOS.interference.build()); noisy.reconcile();
    const s = channelSurvey(noisy, noisy.routers[0]);
    assert.ok(s.heard.length >= 2 && [1, 6, 11].includes(s.best) && s.bestCost <= s.current);
});

test('shareable links round-trip the network, title and goal, and reject damaged links', async () => {
    const { encodeShare, decodeShare, parseShareHash, labLink } = await import('../2026_2/com/wifi/share.mjs');
    const state = SCENARIOS.troubleshoot.build();
    const code = await encodeShare({ title: 'Prova', goal: 'Corrija o DHCP.', state });
    assert.match(code, /^z\.[A-Za-z0-9_-]+$/, 'URL-safe and compressed');
    assert.ok(code.length < JSON.stringify(state).length / 2);
    const back = await decodeShare(parseShareHash(new URL(labLink('https://x/wifi/', code)).hash).lab);
    assert.deepEqual(back.state, JSON.parse(JSON.stringify(state)));
    assert.equal(back.goal, 'Corrija o DHCP.');
    assert.deepEqual(parseShareHash('#cenario=interference'), { scenario: 'interference' });
    await assert.rejects(decodeShare(code.slice(0, 40)), /corrompido/);
    await assert.rejects(decodeShare('q.abc'), /formato/);
});

import { bfGain, bfReportBytes } from '../2026_2/com/wifi/phy.mjs';
import { makeMeshNode } from '../2026_2/com/wifi/net.mjs';

test('beamforming: array gain 10·log10(Ntx/Nss), NDP sounding in the log, no gain for Wi-Fi 4 or spare-less arrays', () => {
    assert.equal(bfGain(4, 1).toFixed(2), '6.02');
    assert.equal(bfGain(2, 2), 0);
    assert.ok(bfReportBytes('wifi6', 80, 4, 2) > bfReportBytes('wifi6', 20, 4, 2));
    const build = bf => world([ap({ wifi: { streams: 4, beamforming: bf } }), sta('far', { wifi: { streams: 1 } }, 'phone', 36, 20), sta('old', { wifi: { standard: 'wifi4' } }, 'printer', 30, 16)]);
    const off = build(false), on = build(true);
    const far = l => l.currentLink(l.device('far')), old = l => l.currentLink(l.device('old'));
    assert.equal(far(on).dl.sinr, far(off).dl.sinr, 'beacons and the reported SINR are not beamformed');
    assert.ok(Math.abs(far(on).rates.dl.streamSnr - far(off).rates.dl.streamSnr - 6.02) < .01);
    assert.ok(far(on).rates.dl.mcs > far(off).rates.dl.mcs);
    assert.equal(far(on).rates.ul.mcs, far(off).rates.ul.mcs, 'downlink only');
    assert.ok(on.iperf(on.device('far'), '192.168.0.1').mean > 0);
    assert.equal(old(on).beamforming.active, false);
    assert.equal(old(on).rates.dl.mcs, old(off).rates.dl.mcs);
    assert.ok(['NDP Announcement', 'NDP ·', 'Compressed Beamforming Report'].every(k => on.events.some(e => e.info.startsWith(k))));
    assert.ok(!off.events.some(e => /NDP/.test(e.info)));
    const twoByTwo = world([ap({ wifi: { streams: 2, beamforming: true } }), sta('a')]);
    assert.equal(twoByTwo.currentLink(twoByTwo.device('a')).beamforming.gain, 0);
    // Turning it on after association triggers one sounding without reassociating.
    off.device('r1').wifi.beamforming = true; off.reconcile();
    assert.ok(off.events.some(e => /Compressed Beamforming Report/.test(e.info)) && off.rt('far').assoc);
});

test('mesh: nodes bridge to the root DHCP/NAT, pick the least-airtime parent, and backhaul choice sets the throughput', () => {
    const lab = new Lab(SCENARIOS.mesh.build()); lab.reconcile();
    const tree = lab.meshTree(), nb = lab.device('c2');
    assert.equal(tree.get('r2').parent, 'r1');
    assert.equal(tree.get('r3').parent, 'r2', 'the far node relays through the hallway node');
    assert.equal(lab.associatedAp(nb).id, 'r3');
    const ip = lab.rt('c2').ip;
    assert.equal(ip.source, 'dhcp'); assert.equal(ip.gateway, '192.168.0.1');
    assert.ok(lab.leases(lab.device('r1')).some(l => l.ip === ip.address && l.connected));
    assert.ok(lab.events.some(e => e.proto === 'DHCP' && e.mesh && /backhaul mesh/.test(e.info)));
    assert.ok(lab.ping(nb, 'google.com').replies.every(r => r.ok));
    assert.ok(lab.ping(nb, lab.ipOf(lab.device('c1'))).replies.every(r => r.ok), 'clients on different nodes share one LAN');
    assert.match(runCommand(lab, lab.device('r1'), 'show mesh').join('\n'), /Nó quarto\s+Nó corredor\s+2/);
    const iperfWith = backhaul => { const st = SCENARIOS.mesh.build(); st.devices.find(d => d.id === 'r3').mesh.backhaul = backhaul; const l = new Lab(st); l.reconcile(); return l.iperf(l.device('c2'), '192.168.0.1'); };
    const shared = iperfWith('wifi'), dedicated = iperfWith('dedicated'), wired = iperfWith('ethernet');
    assert.equal(shared.sharedHops, 3);
    assert.ok(shared.mean < dedicated.mean && dedicated.mean < wired.mean, JSON.stringify([shared.mean, dedicated.mean, wired.mean]));
    assert.deepEqual(wired.path, ['Notebook quarto', 'Nó quarto', 'Roteador (raiz)']);
});

test('mesh: SSID is pushed from the root, a node out of range has no backhaul, and clients roam to a stronger node', () => {
    const lab = world([makeRouter('r1', 'Raiz', 4, 12, { mesh: { role: 'root', id: 'M' } }), makeMeshNode('n1', 'Nó', 28, 12, { mesh: { id: 'M' } }), makeMeshNode('n2', 'Atrás do metal', 38, 21, { mesh: { id: 'M' } }), sta('p', {}, 'phone', 8, 12)], { walls: [{ id: 'w1', x1: 33, y1: 17, x2: 40, y2: 17, material: 'metal' }, { id: 'w2', x1: 33, y1: 17, x2: 33, y2: 24, material: 'metal' }] });
    assert.equal(lab.device('n1').wifi.ssid, 'LabWiFi');
    lab.device('r1').wifi.ssid = 'NovaRede'; lab.device('p').wifi.ssid = 'NovaRede'; lab.reconcile();
    assert.equal(lab.device('n1').wifi.ssid, 'NovaRede');
    assert.match(lab.meshError(lab.device('n2')) || '', /Sem backhaul/);
    assert.equal(lab.associatedAp(lab.device('p')).id, 'r1');
    // Sticky client: still on the root at −62 dBm, roams once the root falls below −67 dBm and the node is ≥ 8 dB stronger.
    Object.assign(lab.device('p'), { x: 22, y: 12 }); lab.reconcile();
    assert.equal(lab.associatedAp(lab.device('p')).id, 'r1');
    Object.assign(lab.device('p'), { x: 34, y: 12 }); lab.reconcile();
    assert.equal(lab.associatedAp(lab.device('p')).id, 'n1');
    assert.ok(lab.events.some(e => /roaming/.test(e.info)));
    assert.equal(lab.rt('p').ip.gateway, '192.168.0.1');
});
