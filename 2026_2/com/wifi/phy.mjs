// 802.11 PHY model: standards, channels, MCS tables, link budget and packet error rate.
// BER formulas are the same Gray-coded ones used by the Block Studio (../sim).
import { qFunction } from '../sim/utils.js';

export const STANDARDS = {
    wifi4: { label: 'Wi-Fi 4 (802.11n)', short: 'HT', rank: 4, bands: ['2.4', '5'], widths: [20, 40], maxMcs: 7, maxStreams: 4, symbol: 3.2, gis: [0.8, 0.4], subcarriers: { 20: 52, 40: 108 }, wpa3: false },
    wifi5: { label: 'Wi-Fi 5 (802.11ac)', short: 'VHT', rank: 5, bands: ['5'], widths: [20, 40, 80, 160], maxMcs: 9, maxStreams: 8, symbol: 3.2, gis: [0.8, 0.4], subcarriers: { 20: 52, 40: 108, 80: 234, 160: 468 }, wpa3: false },
    wifi6: { label: 'Wi-Fi 6 (802.11ax)', short: 'HE', rank: 6, bands: ['2.4', '5'], widths: [20, 40, 80, 160], maxMcs: 11, maxStreams: 8, symbol: 12.8, gis: [0.8, 1.6, 3.2], subcarriers: { 20: 234, 40: 468, 80: 980, 160: 1960 }, wpa3: true },
    wifi6e: { label: 'Wi-Fi 6E (802.11ax 6 GHz)', short: 'HE', rank: 6.5, bands: ['2.4', '5', '6'], widths: [20, 40, 80, 160], maxMcs: 11, maxStreams: 8, symbol: 12.8, gis: [0.8, 1.6, 3.2], subcarriers: { 20: 234, 40: 468, 80: 980, 160: 1960 }, wpa3: true },
    wifi7: { label: 'Wi-Fi 7 (802.11be)', short: 'EHT', rank: 7, bands: ['2.4', '5', '6'], widths: [20, 40, 80, 160, 320], maxMcs: 13, maxStreams: 8, symbol: 12.8, gis: [0.8, 1.6, 3.2], subcarriers: { 20: 234, 40: 468, 80: 980, 160: 1960, 320: 3920 }, wpa3: true },
};
export const STANDARD_ORDER = ['wifi4', 'wifi5', 'wifi6', 'wifi6e', 'wifi7'];

// Index → modulation order and code rate (shared numbering from HT per-stream MCS up to EHT).
export const MCS = [
    { M: 2, rate: 1 / 2, label: 'BPSK', code: '1/2' },
    { M: 4, rate: 1 / 2, label: 'QPSK', code: '1/2' },
    { M: 4, rate: 3 / 4, label: 'QPSK', code: '3/4' },
    { M: 16, rate: 1 / 2, label: '16-QAM', code: '1/2' },
    { M: 16, rate: 3 / 4, label: '16-QAM', code: '3/4' },
    { M: 64, rate: 2 / 3, label: '64-QAM', code: '2/3' },
    { M: 64, rate: 3 / 4, label: '64-QAM', code: '3/4' },
    { M: 64, rate: 5 / 6, label: '64-QAM', code: '5/6' },
    { M: 256, rate: 3 / 4, label: '256-QAM', code: '3/4' },
    { M: 256, rate: 5 / 6, label: '256-QAM', code: '5/6' },
    { M: 1024, rate: 3 / 4, label: '1024-QAM', code: '3/4' },
    { M: 1024, rate: 5 / 6, label: '1024-QAM', code: '5/6' },
    { M: 4096, rate: 3 / 4, label: '4096-QAM', code: '3/4' },
    { M: 4096, rate: 5 / 6, label: '4096-QAM', code: '5/6' },
];

// Equivalent soft-decision coding gain (dB) of the BCC/LDPC codes at each rate.
// Didactic model: coded BER ≈ uncoded BER evaluated at Eb/N0 + G(R).
export const CODING_GAIN_DB = { '1/2': 5.0, '2/3': 4.3, '3/4': 3.8, '5/6': 3.2 };

const range = (from, to, step) => Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step);
export const CHANNELS = {
    '2.4': { base: 2407, 20: range(1, 13, 1), 40: range(3, 11, 1) },
    '5': { base: 5000, 20: [36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 144, 149, 153, 157, 161, 165], 40: [38, 46, 54, 62, 102, 110, 118, 126, 134, 142, 151, 159], 80: [42, 58, 106, 122, 138, 155], 160: [50, 114] },
    '6': { base: 5950, 20: range(1, 233, 4), 40: range(3, 227, 8), 80: range(7, 215, 16), 160: range(15, 207, 32), 320: range(31, 191, 32) },
};
export const BAND_MAX_WIDTH = { '2.4': 40, '5': 160, '6': 320 };

export const MATERIALS = {
    drywall: { label: 'Drywall', loss: { '2.4': 3, '5': 4, '6': 5 }, color: '#94a3b8' },
    vidro: { label: 'Vidro', loss: { '2.4': 2, '5': 4, '6': 5 }, color: '#67e8f9' },
    tijolo: { label: 'Tijolo', loss: { '2.4': 8, '5': 12, '6': 14 }, color: '#f59e0b' },
    concreto: { label: 'Concreto', loss: { '2.4': 12, '5': 18, '6': 22 }, color: '#a8a29e' },
    metal: { label: 'Metal', loss: { '2.4': 25, '5': 30, '6': 32 }, color: '#fb7185' },
};

export const PER_TARGET = 0.1;
export const MPDU_BYTES = 1538;

export const channelsFor = (band, width) => CHANNELS[band]?.[width] || [];
export const centerFrequency = (band, channel) => CHANNELS[band].base + 5 * channel;
export const widthsFor = (standard, band) => STANDARDS[standard].widths.filter(w => w <= BAND_MAX_WIDTH[band] && channelsFor(band, w).length);

// Highest standard ≤ both devices that operates on the AP band (e.g. a Wi-Fi 5 client falls back to 802.11n on 2.4 GHz).
export function effectiveStandard(apStandard, clientStandard, band) {
    const limit = Math.min(STANDARDS[apStandard].rank, STANDARDS[clientStandard].rank);
    return [...STANDARD_ORDER].reverse().find(s => STANDARDS[s].rank <= limit && STANDARDS[s].bands.includes(band)) || null;
}
export const clientBands = standard => [...new Set(STANDARD_ORDER.filter(s => STANDARDS[s].rank <= STANDARDS[standard].rank).flatMap(s => STANDARDS[s].bands))];

export function mcsValid(standard, width, mcs, nss) {
    if (mcs < 0 || mcs > STANDARDS[standard].maxMcs) return false;
    // VHT exception: MCS 9 is undefined at 20 MHz except for 3 and 6 streams (non-integer bits per symbol).
    if (standard === 'wifi5' && width === 20 && mcs === 9 && nss !== 3 && nss !== 6) return false;
    return true;
}

// PHY data rate in Mb/s: Nss · Nsd · log2(M) · R / (Tsym + GI).
export function dataRate(standard, width, mcs, nss, gi) {
    const s = STANDARDS[standard], m = MCS[mcs];
    return nss * s.subcarriers[width] * Math.log2(m.M) * m.rate / (s.symbol + gi);
}

export function uncodedBer(M, ebn0) {
    const k = Math.log2(M);
    if (M <= 4) return qFunction(Math.sqrt(2 * ebn0));
    return Math.min(.5, 4 / k * (1 - 1 / Math.sqrt(M)) * qFunction(Math.sqrt(3 * k * ebn0 / (M - 1))));
}

// SNR (dB, per subcarrier and per stream) → coded BER and packet error rate.
export function codedBer(snrDb, mcs) {
    const m = MCS[mcs], k = Math.log2(m.M);
    const ebn0Db = snrDb - 10 * Math.log10(k * m.rate) + CODING_GAIN_DB[m.code];
    return uncodedBer(m.M, 10 ** (ebn0Db / 10));
}
export function packetErrorRate(snrDb, mcs, bytes = MPDU_BYTES) {
    const ber = codedBer(snrDb, mcs);
    return ber >= .5 ? 1 : -Math.expm1(8 * bytes * Math.log1p(-ber));
}
// Minimum SNR for PER ≤ target (bisection; PER decreases monotonically with SNR).
const requiredCache = new Map();
export function requiredSnr(mcs, bytes = MPDU_BYTES, target = PER_TARGET) {
    const key = `${mcs}:${bytes}:${target}`;
    if (requiredCache.has(key)) return requiredCache.get(key);
    let lo = -10, hi = 70;
    for (let i = 0; i < 50; i++) { const mid = (lo + hi) / 2; if (packetErrorRate(mid, mcs, bytes) > target) lo = mid; else hi = mid; }
    requiredCache.set(key, hi);
    return hi;
}

// Spatial multiplexing splits power across Nss streams; extra receive chains give array (MRC) gain.
export const streamSnr = (snrDb, nss, rxChains) => snrDb - 10 * Math.log10(nss) + 10 * Math.log10(Math.max(1, rxChains / nss));

export const thermalNoiseDbm = (widthMhz, noiseFigure) => -174 + 10 * Math.log10(widthMhz * 1e6) + noiseFigure;
export const fsplAt1m = freqMhz => 20 * Math.log10(freqMhz) - 27.55;
export const dbmToMw = dbm => 10 ** (dbm / 10);
export const mwToDbm = mw => 10 * Math.log10(mw);

function segmentsIntersect(a, b, c, d) {
    const cross = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
    const d1 = cross(c, d, a), d2 = cross(c, d, b), d3 = cross(a, b, c), d4 = cross(a, b, d);
    return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0));
}
export function wallLoss(walls, from, to, band) {
    let loss = 0;
    for (const w of walls || []) if (segmentsIntersect(from, to, { x: w.x1, y: w.y1 }, { x: w.x2, y: w.y2 })) loss += MATERIALS[w.material]?.loss[band] ?? 0;
    return loss;
}

// Log-distance path loss with free-space reference at 1 m plus wall penetration losses.
export function pathLoss(env, walls, from, to, band, freqMhz) {
    const d = Math.max(1, Math.hypot(to.x - from.x, to.y - from.y));
    return fsplAt1m(freqMhz) + 10 * (env.exponent ?? 3) * Math.log10(d) + wallLoss(walls, from, to, band);
}

export const frequencyRange = ap => {
    const fc = centerFrequency(ap.wifi.band, ap.wifi.channel);
    return [fc - ap.wifi.width / 2, fc + ap.wifi.width / 2];
};
export function spectralOverlap(a, b) {
    const [a0, a1] = frequencyRange(a), [b0, b1] = frequencyRange(b);
    return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0)) / (a1 - a0);
}

// Airtime (µs) of one PPDU carrying `bytes` at the given PHY parameters.
export function ppduAirtime(standard, width, mcs, nss, gi, bytes) {
    const s = STANDARDS[standard], tsym = s.symbol + gi, ndbps = dataRate(standard, width, mcs, nss, gi) * tsym;
    const preamble = { wifi4: 32, wifi5: 36, wifi6: 40, wifi6e: 40, wifi7: 44 }[standard] + (s.symbol > 4 ? 8 : 4) * nss;
    return preamble + Math.ceil((16 + 8 * bytes + 6) / ndbps) * tsym;
}
// Legacy OFDM (6/24 Mb/s) used for management frames, ACKs and broadcast.
export const legacyAirtime = (bytes, rateMbps = 6) => 20 + Math.ceil((16 + 8 * bytes + 6) / (rateMbps * 4)) * 4;
export const TIMING = { slot: 9, sifs: 16, difs: 34, cwMin: 15, ack: legacyAirtime(14, 24) };

// Goodput (Mb/s) for saturated A-MPDU traffic: TCP payload delivered per channel-access cycle.
export function aggregateGoodput(standard, width, mcs, nss, gi, per) {
    const frames = standard === 'wifi4' ? 16 : standard === 'wifi5' ? 32 : 64, payload = frames * 1460 * 8;
    const cycle = TIMING.difs + TIMING.slot * TIMING.cwMin / 2 + ppduAirtime(standard, width, mcs, nss, gi, frames * (MPDU_BYTES + 4)) + TIMING.sifs + legacyAirtime(32, 24);
    return payload * (1 - per) / cycle;
}

// Choose (MCS, Nss) maximizing expected throughput with PER ≤ target, or apply a fixed MCS.
export function selectRate({ standard, width, gi, maxNss, rxChains, snrDb, fixedMcs = null }) {
    const options = [];
    for (let nss = 1; nss <= maxNss; nss++) {
        const sinr = streamSnr(snrDb, nss, rxChains);
        for (let mcs = 0; mcs <= STANDARDS[standard].maxMcs; mcs++) {
            if (!mcsValid(standard, width, mcs, nss)) continue;
            if (fixedMcs !== null && mcs !== fixedMcs) continue;
            const per = packetErrorRate(sinr, mcs), rate = dataRate(standard, width, mcs, nss, gi);
            options.push({ mcs, nss, per, rate, streamSnr: sinr, score: rate * (1 - per) });
        }
    }
    if (!options.length) return null;
    if (fixedMcs !== null) return options.filter(o => o.nss === maxNss)[0] || options.at(-1);
    const ok = options.filter(o => o.per <= PER_TARGET);
    if (!ok.length) return options.find(o => o.mcs === 0 && o.nss === 1);
    return ok.reduce((best, o) => o.score > best.score ? o : best);
}
