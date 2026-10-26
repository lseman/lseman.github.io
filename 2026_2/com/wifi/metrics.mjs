// Link-level metrics for the analysis panel: detection (Es/N0, Eb/N0, BER), rates and Shannon bounds.
import { STANDARDS, MCS, CODING_GAIN_DB, uncodedBer, codedBer, requiredSnr, dataRate, aggregateGoodput, selectRate, streamSnr, thermalNoiseDbm, fsplAt1m, centerFrequency } from './phy.mjs';
import { apConfigError } from './net.mjs';

const db = x => 10 * Math.log10(x), lin = x => 10 ** (x / 10);

// Detection and rate metrics of one direction ('dl' | 'ul') of a client's current link.
export function linkMetrics(lab, client, dir = 'dl') {
    const l = lab.currentLink(client);
    if (!l) return null;
    const n = l.negotiation, r = l.rates[dir], m = MCS[r.mcs], k = Math.log2(m.M), side = l[dir];
    const esn0 = r.streamSnr, ebn0Coded = esn0 - db(k), ebn0 = esn0 - db(k * m.rate);
    const capacity = r.nss * n.width * Math.log2(1 + lin(esn0));
    const goodput = lab.hopGoodput(l, dir);
    return {
        client, ap: l.ap, dir, link: l, standard: n.standard, width: n.width, gi: n.gi, nss: r.nss, mcs: r.mcs, modulation: m, bitsPerSymbol: k,
        distance: l.distance, rssi: side.rssi, noise: side.noise, interference: side.interference, sinr: side.sinr,
        esn0, ebn0Coded, ebn0, rawBer: uncodedBer(m.M, lin(ebn0Coded)), ber: codedBer(esn0, r.mcs), per: r.per,
        phyRate: r.rate, goodput, capacity, efficiency: goodput / capacity, spectralEfficiency: r.rate / (r.nss * n.width),
        measured: measuredStats(lab, client, dir),
    };
}

// Frame statistics observed in the event log for this client and direction.
export function measuredStats(lab, client, dir) {
    let frames = 0, attempts = 0, lost = 0, bytes = 0;
    for (const e of lab.events) {
        if (e.medium !== 'wifi' || e.dir !== dir || e.kind === 'bcast') continue;
        if ((dir === 'dl' ? e.to : e.from) !== client.id) continue;
        frames++; attempts += e.attempts || 0; lost += e.ok ? 0 : 1; bytes += e.bytes || 0;
    }
    return { frames, attempts, lost, retryRate: attempts ? (attempts - frames) / attempts : 0, lossRate: frames ? lost / frames : 0 };
}

export const allMetrics = (lab, dir) => lab.clients.map(c => linkMetrics(lab, c, dir)).filter(Boolean);

// Theory curves (x in dB).
const sweep = (from, to, step, f) => { const out = []; for (let x = from; x <= to + 1e-9; x += step) out.push([x, f(x)]); return out; };
export const MODULATION_ORDERS = [2, 4, 16, 64, 256, 1024, 4096];
export const modulationLabel = M => M === 2 ? 'BPSK' : M === 4 ? 'QPSK' : `${M}-QAM`;
export const berCurve = (M, from = -2, to = 40) => sweep(from, to, .25, x => uncodedBer(M, lin(x)));
// Post-FEC BER vs Eb/N0 per information bit: the uncoded curve shifted left by the coding gain.
export const codedBerCurve = (mcs, from = -2, to = 40) => { const m = MCS[mcs]; return sweep(from, to, .25, x => uncodedBer(m.M, lin(x + CODING_GAIN_DB[m.code]))); };
export const shannonCurve = (from = -5, to = 50) => sweep(from, to, .25, x => Math.log2(1 + lin(x)));
// Spectral efficiency (b/s/Hz per stream) of each MCS with its required SNR, for the staircase.
export function mcsSteps(standard, width, gi) {
    return MCS.slice(0, STANDARDS[standard].maxMcs + 1).map((m, i) => ({ mcs: i, snr: requiredSnr(i), efficiency: dataRate(standard, width, i, 1, gi) / width, label: `${m.label} ${m.code}` }));
}

// Best-case rate vs distance for an AP in its environment (no walls, no interference).
export function rateVsDistance(lab, ap, maxDistance = 50) {
    if (apConfigError(ap)) return [];
    const env = lab.state.env, w = ap.wifi, freq = centerFrequency(w.band, +w.channel), noise = thermalNoiseDbm(+w.width, +env.noiseFigure) + +env.extraNoise, out = [];
    for (let d = 1; d <= maxDistance; d += .25) {
        const sinr = +w.txPower + +w.antennaGain - (fsplAt1m(freq) + 10 * env.exponent * Math.log10(d)) - noise - +env.implementationLoss;
        const fixed = w.mcs === 'auto' ? null : +w.mcs;
        const r = selectRate({ standard: w.standard, width: +w.width, gi: +w.gi, maxNss: +w.streams, rxChains: +w.streams, snrDb: sinr, fixedMcs: fixed });
        const ok = r && r.per < .9 && sinr > -3;
        out.push({ d, sinr, mcs: ok ? r.mcs : null, rate: ok ? r.rate : 0, goodput: ok ? aggregateGoodput(w.standard, +w.width, r.mcs, r.nss, +w.gi, r.per) : 0, capacity: +w.streams * +w.width * Math.log2(1 + lin(streamSnr(sinr, +w.streams, +w.streams))) });
    }
    return out;
}

// Received power spectral density (dBm/MHz) of every active AP at a point, with the 802.11 OFDM mask shape.
export function spectrumAt(lab, point, band) {
    return lab.routers.filter(ap => !apConfigError(ap) && ap.wifi.band === band).map(ap => {
        const fc = centerFrequency(band, +ap.wifi.channel), W = +ap.wifi.width;
        const p = lab.link(ap, { ...point, id: '__spectrum', type: 'laptop', wifi: { standard: 'wifi7', streams: 1, txPower: 0 }, snrOverride: null }).dl.rssi;
        return { ap, fc, width: W, power: p, psd: p - db(W) };
    });
}
// Transmit spectral mask (dBr) for an OFDM channel of width W at offset Δf from the center (IEEE 802.11 mask breakpoints).
export function spectralMask(offset, W) {
    const a = Math.abs(offset), half = W / 2 - .5;
    if (a <= half) return 0;
    const pts = [[half, 0], [W / 2 + .5, -20], [W, -28], [1.5 * W, -40]];
    for (let i = 1; i < pts.length; i++) if (a <= pts[i][0]) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; return y0 + (y1 - y0) * (a - x0) / (x1 - x0); }
    return -40;
}
export const BAND_RANGE = { '2.4': [2395, 2490], '5': [5150, 5875], '6': [5925, 7125] };
export const noisePsd = env => -174 + 60 + +env.noiseFigure + +env.extraNoise;
