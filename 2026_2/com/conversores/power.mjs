// Power-electronics models for the converter lab: carrier PWM (single-phase, three-phase, multilevel),
// line-commutated rectifiers and a boost PFC stage. Pure functions over one fundamental period, shared by
// the page and the node tests.

export const TAU = 2 * Math.PI;
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const mean = a => { let s = 0; for (const v of a) s += v; return s / a.length; };
export const rms = a => { let s = 0; for (const v of a) s += v * v; return Math.sqrt(s / a.length); };
// Triangular carrier in [-1, 1], x in carrier periods: peak at integer x, valley at x + 1/2.
export const tri = x => 4 * Math.abs(x - Math.floor(x) - .5) - 1;

// ======================================================================
// Spectrum
// ======================================================================
export function fft(re, im, inverse = false) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
        let bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
    }
    for (let len = 2; len <= n; len <<= 1) {
        const half = len >> 1, ang = (inverse ? 2 : -2) * Math.PI / len;
        for (let k = 0; k < half; k++) {
            const wr = Math.cos(ang * k), wi = Math.sin(ang * k);
            for (let a = k; a < n; a += len) {
                const b = a + half, tr = re[b] * wr - im[b] * wi, ti = re[b] * wi + im[b] * wr;
                re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
            }
        }
    }
    if (inverse) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
}

// One period of a real signal → peak amplitude and phase of each harmonic, x ≈ dc + Σ amp[h]·cos(hωt + phase[h]).
export function harmonics(x) {
    const n = x.length, re = Float64Array.from(x), im = new Float64Array(n);
    fft(re, im);
    const amp = new Float64Array(n / 2), phase = new Float64Array(n / 2);
    for (let h = 1; h < n / 2; h++) { amp[h] = 2 * Math.hypot(re[h], im[h]) / n; phase[h] = Math.atan2(im[h], re[h]); }
    return { dc: re[0] / n, amp, phase };
}
// Harmonics up to hmax (default N/4, below the aliasing of the sampled switching edges).
export function thd(amp, hmax = amp.length / 2) { let s = 0; for (let h = 2; h <= hmax && h < amp.length; h++) s += amp[h] ** 2; return Math.sqrt(s) / amp[1]; }
// Weighted THD: each harmonic divided by its order, a proxy for the current ripple an inductive load sees.
export function wthd(amp, hmax = amp.length / 2) { let s = 0; for (let h = 2; h <= hmax && h < amp.length; h++) s += (amp[h] / h) ** 2; return Math.sqrt(s) / amp[1]; }

// Periodic steady-state current of an R-L load driven by one period of v: I(h) = V(h) / (R + jhωL).
export function rlCurrent(v, R, L, f) {
    const n = v.length, re = Float64Array.from(v), im = new Float64Array(n), w = TAU * f;
    fft(re, im);
    for (let k = 0; k < n; k++) {
        const h = k <= n / 2 ? k : k - n, zr = R, zi = h * w * L, d = zr * zr + zi * zi;
        if (k === n / 2 || d === 0) { re[k] = im[k] = 0; continue; }
        const a = re[k], b = im[k];
        re[k] = (a * zr + b * zi) / d; im[k] = (b * zr - a * zi) / d;
    }
    fft(re, im, true);
    return re;
}

// Power quality of one line period: P, S, power factor = displacement factor × distortion factor.
export function powerQuality(v, i) {
    const P = mean(v.map((x, k) => x * i[k])), Vrms = rms(v), Irms = rms(i), S = Vrms * Irms;
    const hv = harmonics(v), hi = harmonics(i);
    const V1 = hv.amp[1] / Math.SQRT2, I1 = hi.amp[1] / Math.SQRT2, phi = hv.phase[1] - hi.phase[1];
    const Q1 = V1 * I1 * Math.sin(phi), D = Math.sqrt(Math.max(0, S * S - P * P - Q1 * Q1));
    return { P, S, Vrms, Irms, V1, I1, PF: S ? P / S : 0, DPF: Math.cos(phi), DF: Irms ? I1 / Irms : 0, phiDeg: phi * 180 / Math.PI, Q1, D, thdI: thd(hi.amp, 50), harm: Array.from(hi.amp, a => a / Math.SQRT2), dcI: hi.dc };
}

// IEC 61000-3-2 limits (rms A, 230 V mains): class A in amperes; class D in mA/W for 75–600 W, capped by class A.
export function iecClassA(h) {
    if (h % 2) return { 3: 2.30, 5: 1.14, 7: .77, 9: .40, 11: .33, 13: .21 }[h] ?? (h >= 15 && h <= 39 ? .15 * 15 / h : null);
    return { 2: 1.08, 4: .43, 6: .30 }[h] ?? (h >= 8 && h <= 40 ? .23 * 8 / h : null);
}
export function iecClassD(h, P) {
    if (h % 2 === 0 || h < 3 || h > 39) return null;
    const perW = { 3: 3.4, 5: 1.9, 7: 1.0, 9: .5, 11: .35 }[h] ?? 3.85 / h;
    return Math.min(perW * P / 1000, iecClassA(h));
}

// ======================================================================
// CC-CA: single-phase full bridge (H-bridge)
// ======================================================================
// Fundamental of a saturated sine (large-mf limit of carrier PWM): linear up to ma = 1, then 4/π at square wave.
export function pwmGain(ma) {
    if (ma <= 1) return ma;
    return 2 / Math.PI * (ma * Math.asin(1 / ma) + Math.sqrt(1 - 1 / ma ** 2));
}
// Quasi-square wave: zero for α around each crossing, V1 = (4/π)·Vdc·cos α. α chosen so V1 = ma·Vdc.
export const quasiAlpha = ma => Math.acos(clamp(ma * Math.PI / 4, 0, 1));

// scheme: bipolar (±Vdc), unipolar (0, ±Vdc, two references ±ref), square, qsquare (phase-shifted legs).
// sampling: natural (reference compared continuously) or regular (reference held at each carrier peak).
export function singlePhase({ vdc = 400, ma = .8, mf = 15, scheme = 'bipolar', sampling = 'natural', N = 1 << 14 }) {
    const ref = new Float64Array(N), car = new Float64Array(N), gA = new Uint8Array(N), gB = new Uint8Array(N), v = new Float64Array(N);
    const alpha = quasiAlpha(ma) / TAU;
    for (let i = 0; i < N; i++) {
        const t = i / N, x = mf * t;
        const r = ma * Math.sin(TAU * (sampling === 'regular' ? Math.floor(x) / mf : t)), c = tri(x);
        let a, b;
        if (scheme === 'square') { a = t < .5; b = !a; }
        else if (scheme === 'qsquare') { a = t >= alpha && t < .5 + alpha; b = t >= .5 - alpha && t < 1 - alpha; }
        else { a = r > c; b = scheme === 'unipolar' ? -r > c : !a; }
        ref[i] = r; car[i] = scheme === 'square' || scheme === 'qsquare' ? NaN : c;
        gA[i] = a; gB[i] = b; v[i] = vdc * (a - b);
    }
    return { N, ref, car, gA, gB, v };
}
// Theoretical fundamental (peak) for each scheme.
export function singlePhaseV1(scheme, ma, vdc) {
    if (scheme === 'square') return 4 / Math.PI * vdc;
    if (scheme === 'qsquare') return 4 / Math.PI * vdc * Math.cos(quasiAlpha(ma));
    return pwmGain(ma) * vdc;
}

// ======================================================================
// CC-CA: three-phase two-level inverter
// ======================================================================
export const PHASE_SHIFT = [0, -TAU / 3, TAU / 3];
// Modified leg references (normalised to Vdc/2): sine + zero-sequence v0. Six-step returns ±2 (always saturates).
export function legRefs(mode, ma, th) {
    const r = PHASE_SHIFT.map(s => ma * Math.sin(th + s));
    if (mode === 'six') return r.map(v => v >= 0 ? 2 : -2);
    return r.map(v => v + zeroSeq(mode, r, th, ma));
}
export function zeroSeq(mode, r, th, ma) {
    if (mode === 'thi') return ma / 6 * Math.sin(3 * th);
    const mx = Math.max(...r), mn = Math.min(...r);
    if (mode === 'svpwm') return -(mx + mn) / 2;
    if (mode === 'dpwm') { const big = Math.abs(mx) >= Math.abs(mn) ? mx : mn; return Math.sign(big) - big; } // DPWM1: clamp the largest phase to a rail
    return 0;
}
export const LINEAR_LIMIT = { spwm: 1, thi: 2 / Math.sqrt(3), svpwm: 2 / Math.sqrt(3), dpwm: 2 / Math.sqrt(3), six: NaN };

export function threePhase({ vdc = 600, ma = .9, mf = 21, mode = 'svpwm', N = 1 << 14 }) {
    const refs = [0, 1, 2].map(() => new Float64Array(N)), raw = [0, 1, 2].map(() => new Float64Array(N)), g = [0, 1, 2].map(() => new Uint8Array(N));
    const v0 = new Float64Array(N), car = new Float64Array(N), vab = new Float64Array(N), van = new Float64Array(N), vbn = new Float64Array(N), vcn = new Float64Array(N);
    for (let i = 0; i < N; i++) {
        const t = i / N, th = TAU * t, c = tri(mf * t), r = legRefs(mode, ma, th);
        car[i] = c;
        for (let p = 0; p < 3; p++) { raw[p][i] = ma * Math.sin(th + PHASE_SHIFT[p]); refs[p][i] = r[p]; g[p][i] = r[p] > c; }
        v0[i] = mode === 'six' ? NaN : r[0] - raw[0][i];
        const [a, b, cc] = [g[0][i], g[1][i], g[2][i]], avg = (a + b + cc) / 3;
        vab[i] = vdc * (a - b); van[i] = vdc * (a - avg); vbn[i] = vdc * (b - avg); vcn[i] = vdc * (cc - avg);
    }
    return { N, refs, raw, g, v0, car, vab, van, vbn, vcn };
}
// Large-mf fundamental of the line voltage (peak, ÷ Vdc): leg average = clamp(modified reference).
export function threePhaseGain(mode, ma, n = 720) {
    if (mode === 'six') return 2 * Math.sqrt(3) / Math.PI;
    let b = 0;
    for (let i = 0; i < n; i++) { const th = TAU * i / n; b += clamp(legRefs(mode, ma, th)[0], -1, 1) * Math.sin(th); }
    return Math.sqrt(3) * (2 * b / n) / 2;
}
// Space-vector dwell times (fractions of Ts) for a reference of phase peak ma·Vdc/2 at angle θ.
export function svDwell(ma, thetaDeg) {
    const th = ((thetaDeg % 360) + 360) % 360, sector = Math.min(5, Math.floor(th / 60)), phi = (th - 60 * sector) * Math.PI / 180, k = Math.sqrt(3) / 2 * ma;
    let t1 = k * Math.sin(Math.PI / 3 - phi), t2 = k * Math.sin(phi);
    if (t1 + t2 > 1) { const s = t1 + t2; t1 /= s; t2 /= s; }
    return { sector: sector + 1, phiDeg: phi * 180 / Math.PI, t1, t2, t0: 1 - t1 - t2 };
}
// Switching states as vectors: index = 4a + 2b + c → V0..V7 naming used in the hexagon.
export const SV_NAME = { '000': 'V0', '100': 'V1', '110': 'V2', '010': 'V3', '011': 'V4', '001': 'V5', '101': 'V6', '111': 'V7' };
// The phase references are sines, so the space vector sits 90° behind θ: vector angle γ ↔ θ = γ + 90°.
export const vecToTheta = vecDeg => (((vecDeg + 90) % 360) + 360) % 360;
// Gate pattern of the carrier period that contains the vector angle γ (carrier peaks at both ends: starts and ends at 000).
export function seqWindow(mode, ma, mf, vecDeg, n = 600) {
    const x0 = Math.floor(mf * vecToTheta(vecDeg) / 360), segs = [];
    let cur = null;
    for (let i = 0; i <= n; i++) {
        const x = x0 + i / n, th = TAU * x / mf, c = tri(x), r = legRefs(mode, ma, th), st = r.map(v => +(v > c)).join('');
        if (!cur || cur.state !== st) { if (cur) cur.x1 = i / n; cur = { x0: i / n, x1: 1, state: st }; segs.push(cur); }
    }
    return { carrierIndex: x0, segs };
}

// ======================================================================
// CC-CA: multilevel cascaded H-bridge (n cells → 2n + 1 levels)
// ======================================================================
// method: ps (phase-shifted carriers, one per cell), pd/pod/apod (2n level-shifted carriers), nlc (nearest level).
export function multilevel({ levels = 5, ma = .9, mf = 10, method = 'ps', vcell = 100, N = 1 << 14 }) {
    const n = (levels - 1) / 2, ref = new Float64Array(N), v = new Float64Array(N);
    const cells = Array.from({ length: n }, () => new Int8Array(N));
    const nCar = method === 'ps' ? n : method === 'nlc' ? 0 : 2 * n, carriers = Array.from({ length: nCar }, () => new Float64Array(N));
    const lsCarrier = (j, x) => {
        const inv = method === 'pod' ? j < n : method === 'apod' ? j % 2 === 1 : false;
        return -1 + (j + (tri(x + (inv ? .5 : 0)) + 1) / 2) / n;
    };
    for (let i = 0; i < N; i++) {
        const t = i / N, x = mf * t, r = ma * Math.sin(TAU * t);
        ref[i] = r;
        let sum = 0;
        if (method === 'ps') for (let k = 0; k < n; k++) {
            const c = tri(x + k / (2 * n)); carriers[k][i] = c;
            sum += cells[k][i] = (r > c) - (-r > c);
        } else if (method === 'nlc') {
            const lvl = clamp(Math.round(n * r), -n, n);
            for (let k = 0; k < n; k++) sum += cells[k][i] = k < Math.abs(lvl) ? Math.sign(lvl) : 0;
        } else {
            for (let j = 0; j < 2 * n; j++) carriers[j][i] = lsCarrier(j, x);
            for (let k = 0; k < n; k++) sum += cells[k][i] = (r > carriers[n + k][i]) - (r < carriers[n - 1 - k][i]);
        }
        v[i] = vcell * sum;
    }
    // Output transitions per period of each cell; each H-bridge leg makes two per carrier period in unipolar PWM.
    const trans = cells.map(c => { let s = 0; for (let i = 0; i < N; i++) s += Math.abs(c[(i + 1) % N] - c[i]); return s; });
    return { n, ref, carriers, cells, v, trans };
}

// ======================================================================
// CA-CC: line rectifiers (time-domain, last line period returned with spc samples)
// ======================================================================
// Single-phase diode bridge + capacitor filter; Ls and Rs model the line (or a passive-PFC choke).
export function diodeBridge({ vrms = 127, f = 60, Ls = .5e-3, Rs = .05, C = 1000e-6, R = 20, cycles = 24, spc = 4096, sub = 8 }) {
    Ls = Math.max(Ls, 1e-5);
    const Vm = vrms * Math.SQRT2, dt = 1 / (f * spc * sub), w = TAU * f;
    const out = { vs: new Float64Array(spc), is: new Float64Array(spc), vo: new Float64Array(spc), io: new Float64Array(spc) };
    let i = 0, vc = Vm * clamp(1 - 1 / (4 * f * R * C), .3, 1);
    for (let cyc = 0; cyc < cycles; cyc++) for (let k = 0; k < spc; k++) for (let s = 0; s < sub; s++) {
        const vs = Vm * Math.sin(w * ((k * sub + s) * dt));
        if (i > 0) { i += (vs - Rs * i - vc) / Ls * dt; if (i < 0) i = 0; }
        else if (i < 0) { i += (vs - Rs * i + vc) / Ls * dt; if (i > 0) i = 0; }
        else if (vs > vc) i = (vs - vc) / Ls * dt;
        else if (vs < -vc) i = (vs + vc) / Ls * dt;
        vc += (Math.abs(i) - vc / R) / C * dt;
        if (cyc === cycles - 1 && s === sub - 1) { out.vs[k] = vs; out.is[k] = i; out.vo[k] = vc; out.io[k] = vc / R; }
    }
    out.vd = out.vo;
    return out;
}

// Thyristor bridges with an R-L load and ideal source. Gates are held for the whole conduction window (long pulses),
// so the bridge also restarts in discontinuous conduction. The incoming pair takes over when its voltage is higher.
function scrRun({ f, R, L, cycles, spc, sub, pairs, gateOf, vsOf, isOf }) {
    const dt = 1 / (f * spc * sub), out = { vs: new Float64Array(spc), is: new Float64Array(spc), vd: new Float64Array(spc), io: new Float64Array(spc) };
    let id = 0, on = -1;
    for (let cyc = 0; cyc < cycles; cyc++) for (let k = 0; k < spc; k++) for (let s = 0; s < sub; s++) {
        const th = TAU * (k * sub + s) / (spc * sub), v = pairs(th), gated = gateOf(th);
        if (gated !== on && v[gated] > (on < 0 ? 0 : v[on])) on = gated;
        let vd = on < 0 ? 0 : v[on];
        if (L > 1e-7) { if (on >= 0) { id += (vd - R * id) / L * dt; if (id <= 0) { id = 0; on = -1; vd = 0; } } }
        else { id = Math.max(0, vd / R); if (id === 0) on = -1; }
        if (cyc === cycles - 1 && s === sub - 1) { out.vs[k] = vsOf(th); out.is[k] = isOf(on, id); out.vd[k] = vd; out.io[k] = id; }
    }
    out.vo = out.vd;
    return out;
}
const scrCycles = (R, L, f) => Math.round(clamp(6 + 6 * L / Math.max(R, 1e-3) * f, 8, 80));

export function scrSingle({ vrms = 127, f = 60, alphaDeg = 30, R = 10, L = 50e-3, spc = 4096, sub = 4 }) {
    const Vm = vrms * Math.SQRT2, a = alphaDeg * Math.PI / 180;
    return scrRun({ f, R, L, spc, sub, cycles: scrCycles(R, L, f),
        pairs: th => { const v = Vm * Math.sin(th); return [v, -v]; },
        gateOf: th => { const x = ((th - a) % TAU + TAU) % TAU; return x < Math.PI ? 0 : 1; },
        vsOf: th => Vm * Math.sin(th), isOf: (on, id) => on === 0 ? id : on === 1 ? -id : 0 });
}

// Six-pulse bridge: pair k = (top, bottom) phases; with diodes pair k takes over at θ = 30° + 60°k, thyristors α later.
const SIX_PAIRS = [[0, 1], [0, 2], [1, 2], [1, 0], [2, 0], [2, 1]];
export function scrThree({ vll = 220, f = 60, alphaDeg = 30, R = 10, L = 50e-3, spc = 4096, sub = 4 }) {
    const Vm = vll * Math.SQRT2 / Math.sqrt(3), a = alphaDeg * Math.PI / 180;
    const ph = th => PHASE_SHIFT.map(s => Vm * Math.sin(th + s));
    return scrRun({ f, R, L, spc, sub, cycles: scrCycles(R, L, f),
        pairs: th => { const v = ph(th); return SIX_PAIRS.map(([p, q]) => v[p] - v[q]); },
        gateOf: th => Math.floor(((th - Math.PI / 6 - a) % TAU + TAU) % TAU / (Math.PI / 3)) % 6,
        vsOf: th => Vm * Math.sin(th), isOf: (on, id) => on < 0 ? 0 : SIX_PAIRS[on][0] === 0 ? id : SIX_PAIRS[on][1] === 0 ? -id : 0 });
}
// Average output (continuous conduction): single-phase full bridge 2√2/π·V·cos α, six-pulse 3√2/π·VLL·cos α.
export const scrVd0 = (topo, v) => topo === 'scr3' ? 3 * Math.SQRT2 / Math.PI * v : 2 * Math.SQRT2 / Math.PI * v;

// ======================================================================
// CA-CC with PFC: diode bridge + boost converter, two control loops
// ======================================================================
// mode: avg (fixed-frequency centre-aligned PWM, current sampled once per period, duty = feedforward + kc·error),
//       hyst (hysteresis band around the reference), crm (critical conduction: constant on-time, restart at zero current).
// Outer loop: PI on Vref − vo sets the current amplitude Ipk; its bandwidth fcv trades 120 Hz ripple for distortion.
export function boostPfc({ vrms = 220, f = 60, L = 1e-3, C = 330e-6, P = 500, Vref = 400, fsw = 50e3, mode = 'avg', kc = .6, ff = true, fcv = 10, band = .2, zoomDeg = 90, cycles = 8, spc = 4096 }) {
    const Vm = vrms * Math.SQRT2, R = Vref * Vref / P, w = TAU * f, Ipk0 = 2 * P / Vm;
    const ton0 = 4 * L * P / (Vm * Vm);                                    // CrM on-time that delivers P
    let dtT = mode === 'avg' ? 1 / (64 * fsw) : mode === 'hyst' ? L * band * Ipk0 / Vref / 8 : ton0 / 60;
    dtT = clamp(dtT, 1 / (f * 2e5), 2e-6);
    const sub = Math.max(1, Math.round(1 / (f * spc * dtT))), dt = 1 / (f * spc * sub);
    // Voltage-loop PI: plant dvo/dt ≈ (Vm/(2·Vo·C))·Ipk → crossover at fcv, PI zero a quarter below it.
    const G = Vm / (2 * Vref * C), wc = TAU * fcv, Kp = wc / G, Ki = Kp * wc / 4;
    const scale = mode === 'crm' ? 2 * L / Vm : 1;                        // crm: the loop output is the on-time
    let iL = 0, vo = Vref, integ = mode === 'crm' ? ton0 / scale : Ipk0, on = false, psi = 0, d = 0, tOn = 0, ipk = Ipk0;
    const nb = { ilAvg: new Float64Array(spc), ilMin: new Float64Array(spc), ilMax: new Float64Array(spc), vs: new Float64Array(spc), vo: new Float64Array(spc), iref: new Float64Array(spc), duty: new Float64Array(spc) };
    // Zoom window ≈ 6 switching periods at the chosen line angle (estimated from the slopes vin/L and (Vo − vin)/L).
    const tz = zoomDeg / 360, vz = Math.max(.05 * Vm, Vm * Math.abs(Math.sin(zoomDeg * Math.PI / 180))), toffK = vz / Math.max(1, Vref - vz);
    const zEst = mode === 'avg' ? 1 / fsw : mode === 'hyst' ? L * band * Ipk0 * (1 / vz + 1 / Math.max(1, Vref - vz)) : ton0 * (1 + toffK);
    const zw = clamp(6 * zEst * f, 2e-4, .02), zoom = { t: [], iL: [], iref: [], g: [] };
    let turnOns = 0, ccmBins = 0;
    for (let cyc = 0; cyc < cycles; cyc++) {
        const last = cyc === cycles - 1;
        for (let k = 0; k < spc; k++) {
            let acc = 0, mn = Infinity, mx = -Infinity, onCount = 0, everZero = false;
            for (let s = 0; s < sub; s++) {
                const t = (k * sub + s) * dt, sn = Math.sin(w * t), vin = Vm * Math.abs(sn);
                const e = Vref - vo;
                integ += Ki * e * dt;
                ipk = Math.max(0, Kp * e + integ);
                const iref = mode === 'crm' ? ipk * scale * vin / L : ipk * Math.abs(sn);   // crm: peak envelope = 2·average
                const was = on;
                if (mode === 'avg') {
                    psi += dt * fsw;
                    // Centre-aligned PWM: sampling at the period edge (middle of the off-time) reads the average current.
                    if (psi >= 1) { psi -= 1; d = clamp((ff ? 1 - vin / vo : 0) + kc * (iref - iL) * L * fsw / vo, 0, .97); }
                    on = Math.abs(psi - .5) < d / 2;
                } else if (mode === 'hyst') {
                    const h = band * Ipk0 / 2;
                    if (iL < iref - h) on = true; else if (iL > iref + h) on = false;
                } else {
                    if (on) { tOn += dt; if (tOn >= ipk * scale) on = false; }
                    else if (iL <= 0) { on = true; tOn = 0; }
                }
                if (on && !was && last) turnOns++;
                iL += (on ? vin : vin - vo) / L * dt;
                if (iL < 0) { iL = 0; everZero = true; }
                vo += ((on ? 0 : iL) - vo / R) / C * dt;
                if (last) {
                    acc += iL; if (iL < mn) mn = iL; if (iL > mx) mx = iL; onCount += on;
                    const tc = k / spc + s / (spc * sub);
                    if (Math.abs(tc - tz) <= zw / 2) { zoom.t.push((tc - tz) / f); zoom.iL.push(iL); zoom.iref.push(iref); zoom.g.push(+on); }
                    if (s === sub - 1) { nb.vs[k] = Vm * sn; nb.vo[k] = vo; nb.iref[k] = mode === 'crm' ? iref / 2 : iref; }
                }
            }
            if (last) { nb.ilAvg[k] = acc / sub; nb.ilMin[k] = mn; nb.ilMax[k] = mx; nb.duty[k] = onCount / sub; if (!everZero) ccmBins++; }
        }
    }
    // Line current after the EMI filter ≈ inductor current averaged over a switching period, with the input polarity.
    const fAvg = Math.max(turnOns * f, f), W = Math.max(1, Math.round(1.5 * spc * f / fAvg));
    const lp = movingAverage(movingAverage(nb.ilAvg, W), W), is = lp.map((v, k) => Math.sign(nb.vs[k]) * v);
    return { ...nb, is, R, ipk, fswAvg: turnOns * f, ccm: ccmBins / spc, zoom, zoomWidth: zw / f, dt };
}
export function movingAverage(x, W) {
    const n = x.length, out = new Float64Array(n), h = Math.floor(W / 2);
    let s = 0;
    for (let j = -h; j < W - h; j++) s += x[(j + n) % n];
    for (let i = 0; i < n; i++) { out[i] = s / W; s += x[(i + W - h + n) % n] - x[(i - h + n) % n]; }
    return out;
}
