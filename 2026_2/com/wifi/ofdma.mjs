// OFDMA model (802.11ax/be): resource-unit plan, per-user rate on each RU and the airtime of
// delivering one packet to every user with single-user OFDM (one STA per TXOP) versus OFDMA.
// Didactic: tone positions are approximate (contiguous RUs), SIG-B/trigger sizes are simplified.
import { STANDARDS, MCS, PER_TARGET, TIMING, packetErrorRate, ppduAirtime, legacyAirtime, streamSnr } from './phy.mjs';

// Tones per RU and data tones (the rest are pilots).
export const RU_SIZES = [
    { tones: 26, data: 24, label: 'RU26' },
    { tones: 52, data: 48, label: 'RU52' },
    { tones: 106, data: 102, label: 'RU106' },
    { tones: 242, data: 234, label: 'RU242' },
    { tones: 484, data: 468, label: 'RU484' },
    { tones: 996, data: 980, label: 'RU996' },
    { tones: 1992, data: 1960, label: '2×RU996' },
    { tones: 3984, data: 3920, label: '4×RU996' },
];
// RUs of each size that fit in a channel (802.11ax Table 27-7, extended to 320 MHz by 802.11be).
const RU_COUNT = {
    20: { 26: 9, 52: 4, 106: 2, 242: 1 },
    40: { 26: 18, 52: 8, 106: 4, 242: 2, 484: 1 },
    80: { 26: 37, 52: 16, 106: 8, 242: 4, 484: 2, 996: 1 },
    160: { 26: 74, 52: 32, 106: 16, 242: 8, 484: 4, 996: 2, 1992: 1 },
    320: { 26: 148, 52: 64, 106: 32, 242: 16, 484: 8, 996: 4, 1992: 2, 3984: 1 },
};
export const TONE_SPACING_MHZ = 20 / 256;
export const ofdmaCapable = standard => (STANDARDS[standard]?.rank ?? 0) >= 6;
export const ruSizesFor = width => RU_SIZES.filter(r => RU_COUNT[width]?.[r.tones]);
export const ruCount = (width, tones) => RU_COUNT[width]?.[tones] || 0;
// 1024-QAM (HE MCS 10-11) and 4096-QAM (EHT MCS 12-13) are only defined on RUs of 242 tones or more.
export const ruMaxMcs = (standard, tones) => tones >= 242 ? STANDARDS[standard].maxMcs : Math.min(9, STANDARDS[standard].maxMcs);
export const ruRate = (standard, dataTones, mcs, nss, gi) => nss * dataTones * Math.log2(MCS[mcs].M) * MCS[mcs].rate / (STANDARDS[standard].symbol + gi);

// Same policy as selectRate (best rate·(1−PER) with PER ≤ target), on an arbitrary number of data tones.
export function bestRate({ standard, dataTones, topMcs, gi, maxNss, rxChains, snrDb, bytes, fixedMcs = null }) {
    const options = [];
    for (let nss = 1; nss <= maxNss; nss++) {
        const sinr = streamSnr(snrDb, nss, rxChains);
        for (let mcs = 0; mcs <= topMcs; mcs++) {
            if (fixedMcs !== null && mcs !== fixedMcs) continue;
            const per = packetErrorRate(sinr, mcs, bytes), rate = ruRate(standard, dataTones, mcs, nss, gi);
            options.push({ mcs, nss, per, rate, streamSnr: sinr, score: rate * (1 - per) });
        }
    }
    if (!options.length) return null;
    if (fixedMcs !== null) return options.filter(o => o.nss === maxNss)[0] || options.at(-1);
    const ok = options.filter(o => o.per <= PER_TARGET);
    if (!ok.length) return options.find(o => o.mcs === 0 && o.nss === 1);
    return ok.reduce((best, o) => o.score > best.score ? o : best);
}

const symbolsFor = (bytes, rate, tsym) => Math.ceil((16 + 8 * bytes + 6) / (rate * tsym));
const access = () => TIMING.difs + TIMING.slot * TIMING.cwMin / 2;

// users: [{ id, name, snrDb, nss, rxChains, standard?, width? }] — SINR over the full channel in the chosen
// direction; standard/width are the user's negotiated link (an HE STA on an EHT AP stops at 1024-QAM).
export function planOfdma({ standard, width, gi, users, ruTones = 'auto', bytes = 200, dir = 'dl', fixedMcs = null }) {
    const std = STANDARDS[standard], tsym = std.symbol + gi, fullData = std.subcarriers[width];
    const sizes = ruSizesFor(width);
    // Auto: the widest RU that still lets every user share a single PPDU.
    const ru = ruTones === 'auto' ? [...sizes].reverse().find(r => ruCount(width, r.tones) >= users.length) || sizes[0] : sizes.find(r => r.tones === +ruTones) || sizes[0];
    const count = ruCount(width, ru.tones), top = ruMaxMcs(standard, ru.tones);
    const blocked = fixedMcs !== null && fixedMcs > top;
    // RU k occupies tones [lo, hi) laid out contiguously around DC.
    const span = count * ru.tones, ruTonesAt = k => ({ lo: -span / 2 + k * ru.tones, hi: -span / 2 + (k + 1) * ru.tones });
    // Uplink: each STA puts all its power into its RU, so the SNR per tone rises by full/RU data tones.
    const ulGain = dir === 'ul' ? 10 * Math.log10(fullData / ru.data) : 0;
    const out = users.map((u, i) => {
        const uStd = u.standard || standard, uWidth = u.width || width, uTop = STANDARDS[uStd].maxMcs;
        const su = bestRate({ standard: uStd, dataTones: STANDARDS[uStd].subcarriers[uWidth], topMcs: uTop, gi, maxNss: u.nss, rxChains: u.rxChains, snrDb: u.snrDb, bytes, fixedMcs: fixedMcs === null ? null : Math.min(fixedMcs, uTop) });
        const mu = blocked ? null : bestRate({ standard, dataTones: ru.data, topMcs: Math.min(top, uTop), gi, maxNss: u.nss, rxChains: u.rxChains, snrDb: u.snrDb + ulGain, bytes, fixedMcs: fixedMcs === null ? null : Math.min(fixedMcs, uTop) });
        return { ...u, standard: uStd, width: uWidth, index: i, round: Math.floor(i / count), ruIndex: i % count, tones: ruTonesAt(i % count), ruSnrDb: u.snrDb + ulGain, su, mu };
    });

    // Single-user OFDM: every packet needs its own channel access, full-band PPDU and ACK.
    const su = { segments: [], total: 0 };
    for (const u of out) {
        if (!u.su) continue;
        // Expected airtime including retransmissions at the user's PER.
        const t0 = su.total, ovh = access(), ppdu = ppduAirtime(u.standard, u.width, u.su.mcs, u.su.nss, gi, bytes) / (1 - Math.min(u.su.per, .9));
        su.segments.push({ kind: 'access', t0, t1: t0 + ovh }, { kind: 'data', user: u.index, t0: t0 + ovh, t1: t0 + ovh + ppdu }, { kind: 'ack', t0: t0 + ovh + ppdu + TIMING.sifs, t1: t0 + ovh + ppdu + TIMING.sifs + TIMING.ack });
        su.total = t0 + ovh + ppdu + TIMING.sifs + TIMING.ack;
        u.suDone = t0 + ovh + ppdu;
    }

    // OFDMA: one MU PPDU per round of up to `count` users, padded to the longest user.
    const mu = { segments: [], total: 0, rounds: Math.ceil(out.length / count), padding: 0, dataTime: 0 };
    for (let r = 0; r < mu.rounds; r++) {
        const group = out.filter(u => u.round === r && u.mu);
        if (!group.length) continue;
        const maxNss = Math.max(...group.map(u => u.mu.nss));
        const syms = group.map(u => symbolsFor(bytes, u.mu.rate, tsym)), nsym = Math.max(...syms);
        let t = mu.total + access();
        mu.segments.push({ kind: 'access', t0: mu.total, t1: t });
        if (dir === 'ul') {
            // Basic Trigger (common info + one User Info field per STA), then the HE TB PPDU.
            const trig = legacyAirtime(28 + 6 * group.length, 24);
            mu.segments.push({ kind: 'trigger', t0: t, t1: t + trig });
            t += trig + TIMING.sifs;
        }
        const sigB = dir === 'dl' ? 4 * Math.ceil(group.length * 21 / (26 * Math.min(2, width / 20))) : 0;
        const pre = { wifi6: 40, wifi6e: 40, wifi7: 44 }[standard] + 8 * maxNss + sigB;
        mu.segments.push({ kind: 'preamble', t0: t, t1: t + pre });
        const d0 = t + pre, d1 = d0 + nsym * tsym;
        group.forEach((u, i) => {
            mu.segments.push({ kind: 'data', user: u.index, t0: d0, t1: d0 + syms[i] * tsym, tones: u.tones }, { kind: 'pad', user: u.index, t0: d0 + syms[i] * tsym, t1: d1, tones: u.tones });
            mu.padding += (nsym - syms[i]) / nsym / group.length;
            u.muDone = d1;
        });
        mu.dataTime += d1 - d0;
        // DL: STAs answer with block acks in an HE TB PPDU; UL: the AP sends one Multi-STA BlockAck.
        const ack = dir === 'dl' ? { wifi6: 40, wifi6e: 40, wifi7: 44 }[standard] + 8 + 2 * tsym : legacyAirtime(22 + 20 * group.length, 24);
        mu.segments.push({ kind: 'ack', t0: d1 + TIMING.sifs, t1: d1 + TIMING.sifs + ack });
        mu.total = d1 + TIMING.sifs + ack;
    }
    mu.padding /= Math.max(1, mu.rounds);
    const served = out.filter(u => u.mu), bits = 8 * bytes;
    const mean = (list, key) => list.length ? list.reduce((s, u) => s + u[key], 0) / list.length : 0;
    return {
        standard, width, gi, dir, bytes, ru, count, top, blocked, ulGain, users: out, su, mu,
        unused: mu.rounds ? mu.rounds * count - out.length : count,
        suGoodput: su.total ? bits * out.filter(u => u.su).length / su.total : 0,
        muGoodput: mu.total ? bits * served.length / mu.total : 0,
        suLatency: mean(out.filter(u => u.su), 'suDone'), muLatency: mean(served, 'muDone'),
        gain: mu.total ? su.total / mu.total : 0,
    };
}

// Total airtime of both schemes as one parameter sweeps (packet size or number of users).
// Sweeping users replicates the current ones and lets the RU size follow (auto).
export function sweepOfdma(base, key, values) {
    return values.map(v => {
        const p = key === 'users'
            ? planOfdma({ ...base, ruTones: 'auto', users: Array.from({ length: v }, (_, i) => ({ ...base.users[i % base.users.length], id: `s${i}` })) })
            : planOfdma({ ...base, [key]: v });
        return { x: v, su: p.su.total, mu: p.mu.total };
    });
}
