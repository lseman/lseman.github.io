// OFDM laboratory tab: controls, metric strip and the transmit → channel → receive plots.
import { STANDARDS, STANDARD_ORDER, MCS } from './phy.mjs';
import { simulateOfdm, subcarrierWaveforms, txSpectrum, MULTIPATH_PROFILES } from './ofdm.mjs';
import { plot, PALETTE } from './charts.mjs';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const FAMILY_LABEL = { wifi4: 'HT · Wi-Fi 4', wifi5: 'VHT · Wi-Fi 5', wifi6: 'HE · Wi-Fi 6', wifi6e: 'HE · Wi-Fi 6E', wifi7: 'EHT · Wi-Fi 7' };
const ORDERS = [2, 4, 16, 64, 256, 1024, 4096];
const modLabel = M => M === 2 ? 'BPSK' : M === 4 ? 'QPSK' : `${M}-QAM`;
const sci = v => v === 0 ? '0' : v >= .01 ? v.toFixed(3) : v.toExponential(1);

export const defaultOfdmState = () => ({ follow: true, standard: 'wifi6', width: 20, gi: .8, M: 16, snrDb: 25, profile: 'D', cfo: 0, estimation: 'ideal', equalizer: 'zf', pilotTracking: true, symbols: 12, seed: 1 });

// Parameters of the simulation: link-derived when following a client, otherwise the manual state.
export function ofdmParams(state, link) {
    const p = { ...state };
    if (state.follow && link) {
        const n = link.negotiation, r = link.rates.dl;
        Object.assign(p, { standard: n.standard, width: n.width, gi: n.gi, M: MCS[r.mcs].M, snrDb: Math.round(r.streamSnr * 10) / 10 });
    }
    const std = STANDARDS[p.standard];
    if (!std.widths.includes(+p.width)) p.width = std.widths[0];
    if (!std.gis.includes(+p.gi)) p.gi = std.gis[0];
    const maxM = MCS[std.maxMcs].M;
    if (+p.M > maxM) p.M = maxM;
    return p;
}

let cache = { key: null, sim: null };
function simulate(p) {
    const key = JSON.stringify(p);
    if (cache.key !== key) cache = { key, sim: simulateOfdm(p) };
    return cache.sim;
}

export function renderOfdm(el, state, client, link) {
    const p = ofdmParams(state, link), locked = state.follow && !!link, std = STANDARDS[p.standard];
    const sel = (key, value, options, disabled = false) => `<select data-ofdm="${key}" ${disabled ? 'disabled' : ''}>${options.map(([v, l]) => `<option value="${v}" ${String(v) === String(value) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
    const num = (key, value, min, max, step, disabled = false) => `<input type="number" data-ofdm="${key}" value="${value}" min="${min}" max="${max}" step="${step}" ${disabled ? 'disabled' : ''}>`;
    const controls = `<div class="ofdm-controls">
        <label class="ofdm-follow"><input type="checkbox" data-ofdm="follow" ${state.follow ? 'checked' : ''}> Seguir enlace ${client ? `<b>${esc(client.name)}</b>` : '<i>(selecione um cliente)</i>'}${state.follow && !link ? ' — sem enlace, valores manuais' : ''}</label>
        <label>Numerologia ${sel('standard', p.standard, STANDARD_ORDER.map(s => [s, FAMILY_LABEL[s]]), locked)}</label>
        <label>Largura ${sel('width', p.width, std.widths.map(w => [w, `${w} MHz`]), locked)}</label>
        <label>GI ${sel('gi', p.gi, std.gis.map(g => [g, `${g} µs`]), locked)}</label>
        <label>Modulação ${sel('M', p.M, ORDERS.filter(M => M <= MCS[std.maxMcs].M).map(M => [M, modLabel(M)]), locked)}</label>
        <label>SNR/subport. (dB) ${num('snrDb', p.snrDb, -5, 60, 1, locked)}</label>
        <label>Multipercurso ${sel('profile', p.profile, Object.entries(MULTIPATH_PROFILES).map(([k, v]) => [k, v.label]))}</label>
        <label>CFO (% Δf) ${num('cfo', Math.round(p.cfo * 1000) / 10, 0, 50, 1)}</label>
        <label>Estimação ${sel('estimation', p.estimation, [['ideal', 'Ideal (H conhecido)'], ['ltf', 'LTF (mínimos quadrados)']])}</label>
        <label>Equalizador ${sel('equalizer', p.equalizer, [['none', 'Nenhum'], ['zf', 'Zero-forcing'], ['mmse', 'MMSE']])}</label>
        <label class="ofdm-follow"><input type="checkbox" data-ofdm="pilotTracking" ${p.pilotTracking ? 'checked' : ''}> Rastrear fase pelos pilotos</label>
        <label>Símbolos ${num('symbols', p.symbols, 2, 60, 1)}</label>
        <button class="btn" data-ofdm-action="reseed" title="Sorteia outra realização do canal e do ruído">Nova realização</button>
    </div>`;
    let sim;
    try { sim = simulate(p); } catch (err) { el.innerHTML = controls + `<p class="footnote">Erro na simulação: ${esc(err.message)}</p>`; return; }
    const n = sim.num, ch = sim.channel, isi = ch.maxSamples > n.cp;
    const m = (label, value, small = '') => `<div class="metric"><span>${label}</span><strong>${value}</strong>${small ? `<small>${small}</small>` : ''}</div>`;
    const strip = `<div class="ofdm-strip">
        ${m('FFT N · Δf', `${n.N} · ${(n.spacing * 1000).toFixed(3)} kHz`, `${n.family} ${n.width} MHz · fs = ${n.fs} MS/s`)}
        ${m('Subportadoras', `${n.nsd} + ${n.nsp}`, `dados + pilotos · ${n.N - n.used.length} nulas (DC + guarda)`)}
        ${m('Símbolo + GI', `${n.tsym} + ${n.gi} µs`, `CP = ${n.cp} amostras · overhead ${(100 * (1 - n.efficiency)).toFixed(1)}%`)}
        ${m('Atraso do canal', `${ch.rmsNs.toFixed(0)} / ${ch.maxNs.toFixed(0)} ns`, `τrms / τmáx · ${ch.maxSamples} amostras ${isi ? '> CP!' : '≤ CP'}`)}
        ${m('Banda de coerência', Number.isFinite(sim.coherenceBandwidth) ? `${sim.coherenceBandwidth.toFixed(1)} MHz` : '∞', Number.isFinite(sim.coherenceBandwidth) ? `≈ ${Math.max(1, Math.round(sim.coherenceBandwidth / n.spacing))} subportadoras · Bc ≈ 1/(5τrms)` : 'canal plano')}
        ${m('ISI + ICI', Number.isFinite(sim.distortionDb) && sim.distortionDb > -200 ? `${sim.distortionDb.toFixed(1)} dBc` : '—', isi ? 'eco ultrapassa o CP' : p.cfo ? 'ICI do CFO' : 'canal circular: sem ISI')}
        ${m('BER medida', sci(sim.ber), `${sim.errors} erros / ${sim.bits} bits (sem FEC)`)}
        ${m('BER teórica', `${sci(sim.theory.awgn)} / ${sci(sim.theory.faded)}`, 'AWGN / média sobre |H_k|²')}
        ${m('EVM', `${(100 * sim.evm).toFixed(1)}%`, `${(20 * Math.log10(sim.evm + 1e-12)).toFixed(1)} dB`)}
    </div>`;
    const cards = [
        ['map', 'Mapa de subportadoras', 'Cada barra é uma subportadora: dados (azul), pilotos (âmbar) e nulas (DC e bandas de guarda, cinza). O espaçamento Δf = fs/N é o inverso da duração útil do símbolo.'],
        ['ortho', 'Ortogonalidade', 'O espectro de cada subportadora é um sinc centrado em kΔf. No instante de amostragem (linhas cinza) todas as vizinhas valem zero. Com CFO (vermelho) a amostragem desloca e as vizinhas vazam: é a ICI.'],
        ['build', 'Formação de um símbolo', 'Algumas subportadoras (Re{X_k e^{j2πkn/N}}) e, embaixo, a soma de todas: o símbolo OFDM transmitido. A região sombreada é o prefixo cíclico, cópia do fim do símbolo.'],
        ['time', 'Sinal no tempo: transmitido × recebido', 'Re{x[n]} transmitido e Re{(h∗x)[n]} recebido (sem ruído). Âmbar: prefixos cíclicos. Vermelho: trecho do símbolo seguinte contaminado pelo eco do anterior quando τmáx > CP (ISI).'],
        ['pdp', 'Perfil de atraso do canal |h[n]|²', 'Taps do canal na taxa de amostragem. Enquanto todos caem dentro do CP, a convolução linear vira circular e cada subportadora vê só um ganho complexo H_k.'],
        ['freq', 'Resposta em frequência |H_k|²', 'Multipercurso = desvanecimento seletivo em frequência. Subportadoras em vales recebem pouca energia. Pontos: estimativa LS obtida do LTF.'],
        ['snr', 'SNR por subportadora', '|H_k|²·SNR. A média é a SNR do enlace, mas a BER é dominada pelas subportadoras nos vales — por isso a curva "média sobre |H_k|²" fica acima da AWGN.'],
        ['ber', 'BER por subportadora', 'Erros medidos em cada subportadora (sem FEC). No Wi-Fi real o entrelaçador e o código espalham e corrigem esses erros concentrados.'],
        ['rx', 'Constelação recebida (antes do equalizador)', 'Y_k = H_k·X_k + N_k: cada subportadora gira e escala de forma diferente. Sem equalização a decisão falha.'],
        ['eq', 'Constelação equalizada', `Depois de ${p.equalizer === 'none' ? 'nenhuma equalização' : p.equalizer === 'zf' ? 'Y/Ĥ (zero-forcing)' : 'MMSE Ĥ*Y/(|Ĥ|²+σ²)'}${p.pilotTracking ? ' e rastreamento de fase pelos pilotos' : ''}. Cor: SNR da subportadora (vermelho = vale). Poucos pilotos com ruído deixam um pequeno erro de fase residual.`],
        ['psd', 'Espectro transmitido', 'Periodograma do sinal OFDM: topo plano sobre as subportadoras ocupadas e queda nas bandas de guarda.'],
    ];
    el.innerHTML = controls + strip + `<div class="plots-grid">${cards.map(([id, t, cap]) => `<div class="plot-card"><canvas data-plot="${id}" data-title="${esc(t)}"></canvas><div class="cap">${cap}</div></div>`).join('')}</div>`;
    const cv = id => el.querySelector(`[data-plot="${id}"]`), title = id => cv(id).dataset.title;
    drawPlots(sim, p, cv, title);
}

function snrColor(db, mean) {
    const t = Math.max(0, Math.min(1, (db - mean + 15) / 20));
    return `hsl(${Math.round(t * 190)} 80% 58%)`;
}

function drawPlots(sim, p, cv, title) {
    const n = sim.num, N = n.N, half = N / 2, ch = sim.channel, pilotSet = new Set(n.pilots), usedSet = new Set(n.used);
    // 1. Subcarrier map.
    {
        const all = Array.from({ length: N }, (_, i) => i - half);
        plot(cv('map'), {
            title: `${title('map')} · ${n.used.length} de ${N} ocupadas`, x: { min: -half, max: half - 1, label: `índice k (Δf = ${(n.spacing * 1000).toFixed(3)} kHz)` }, y: { min: 0, max: 1.4, label: '|X_k|', ticks: 3 },
            stems: [
                { points: all.filter(k => !usedSet.has(k)).map(k => [k, .12]), color: '#64748b', width: 1 },
                { points: n.data.map(k => [k, 1]), color: PALETTE[0], width: N > 512 ? .6 : 1.2 },
                { points: n.pilots.map(k => [k, 1.25]), color: PALETTE[1], width: 2, dots: true },
            ],
            xbands: [{ x0: -half, x1: Math.min(...n.used) - .5, color: '#64748b', alpha: .12, label: 'guarda' }, { x0: Math.max(...n.used) + .5, x1: half - 1, color: '#64748b', alpha: .12, label: 'guarda' }],
            legend: [{ label: `dados (${n.nsd})`, color: PALETTE[0] }, { label: `pilotos (${n.nsp})`, color: PALETTE[1] }, { label: 'nulas', color: '#64748b' }],
        });
    }
    // 2. Orthogonality (sinc spectra).
    {
        const sinc = x => Math.abs(x) < 1e-9 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x), eps = +p.cfo || 0;
        const series = [-2, -1, 0, 1, 2].map((c, i) => ({ points: Array.from({ length: 401 }, (_, j) => { const f = -4 + j * .02; return [f, sinc(f - c)]; }), color: PALETTE[(i + 2) % PALETTE.length], width: c === 0 ? 2.4 : 1.4 }));
        const vlines = [-2, -1, 0, 1, 2].map(c => ({ x: c, color: '#64748b', dash: [2, 3] }));
        if (eps) vlines.push(...[-2, -1, 0, 1, 2].map(c => ({ x: c + eps, color: '#fb7185', dash: [5, 3] })));
        const ici = eps ? [-2, -1, 1, 2].reduce((s, c) => s + sinc(eps - c) ** 2, 0) : 0;
        plot(cv('ortho'), { title: `${title('ortho')}${eps ? ` · CFO ${(100 * eps).toFixed(0)}% Δf → vazamento ${(10 * Math.log10(ici + 1e-12)).toFixed(1)} dB` : ''}`, x: { min: -4, max: 4, label: 'frequência (múltiplos de Δf)' }, y: { min: -.3, max: 1.1, label: 'amplitude', ticks: 4 }, series, vlines, hlines: [{ y: 0, color: '#64748b', dash: [] }] });
    }
    // 3. Building one OFDM symbol from subcarriers.
    {
        const w = subcarrierWaveforms(sim, 0, 4), norm = pts => { const mx = Math.max(...pts.map(q => Math.abs(q[1]))) || 1; return pts.map(([a, b]) => [a, b / mx]); };
        const series = w.waves.map((pts, i) => ({ points: norm(pts).map(([a, b]) => [a, b * .9 + 2.4 * (w.waves.length - i)]), color: PALETTE[(i + 2) % PALETTE.length], width: 1.3, labelAt: [N * .88, 2.4 * (w.waves.length - i) + .95], labelText: `k = ${w.chosen[i]}` }));
        series.push({ points: norm(w.sum).map(([a, b]) => [a, b * 1.1]), color: PALETTE[0], width: 1.3, labelAt: [N * .55, 1.25], labelText: `soma das ${n.used.length} subportadoras` });
        plot(cv('build'), { title: title('build'), x: { min: -n.cp, max: N - 1, label: 'amostra n (0 = início da parte útil)' }, y: { min: -1.3, max: 2.4 * w.waves.length + 1.2, label: '', format: () => '' }, series, xbands: [{ x0: -n.cp, x1: 0, color: PALETTE[1], alpha: .18, label: 'CP' }] });
    }
    // 4. Time signal: TX vs RX with CP and ISI regions.
    {
        const span = Math.min(sim.tx.length, 3 * (N + n.cp)), us = i => i / n.fs, step = Math.max(1, Math.floor(span / 1500));
        const tx = [], rx = [];
        for (let i = 0; i < span; i += step) { tx.push([us(i), sim.tx[i].re]); rx.push([us(i), sim.clean[i].re]); }
        const peak = Math.max(...tx.map(q => Math.abs(q[1])), ...rx.map(q => Math.abs(q[1]))) * 1.1 || 1, bands = [];
        for (let s = 0; s * (N + n.cp) < span; s++) {
            const start = s * (N + n.cp);
            bands.push({ x0: us(start), x1: us(start + n.cp), color: PALETTE[1], alpha: .16, label: s === 0 ? 'CP' : '' });
            if (s > 0 && ch.maxSamples > n.cp) bands.push({ x0: us(start + n.cp), x1: us(start + ch.maxSamples), color: '#fb7185', alpha: .3, label: 'ISI' });
        }
        plot(cv('time'), { title: title('time'), x: { min: 0, max: us(span), label: 'tempo (µs)' }, y: { min: -peak, max: peak, label: 'Re{·}', ticks: 4 }, series: [{ points: tx, color: PALETTE[0], width: 1, alpha: .85 }, { points: rx, color: PALETTE[4], width: 1, alpha: .75 }], xbands: bands, legend: [{ label: 'transmitido', color: PALETTE[0] }, { label: 'recebido (h∗x)', color: PALETTE[4] }] });
    }
    // 5. Power delay profile.
    {
        const pts = ch.power.map((q, i) => [i * ch.ts, 10 * Math.log10(q + 1e-12)]).filter(q => q[1] > -40);
        const cpNs = n.gi * 1000, maxX = Math.max(cpNs * 1.25, ch.maxNs * 1.15, 100);
        plot(cv('pdp'), { title: `${title('pdp')} · τrms ${ch.rmsNs.toFixed(0)} ns · Ts = ${ch.ts.toFixed(1)} ns`, x: { min: -10, max: maxX, label: 'atraso (ns)' }, y: { min: -40, max: 2, label: 'potência (dB)' }, stems: [{ points: pts, color: PALETTE[3], width: 2, dots: true, base: -40 }], xbands: [{ x0: 0, x1: cpNs, color: PALETTE[1], alpha: .14, label: `CP = ${n.gi} µs` }] });
    }
    // 6. Frequency response.
    {
        const f = k => k * n.spacing, pts = sim.H.map(z => [f(z.k), 10 * Math.log10(z.h.re ** 2 + z.h.im ** 2 + 1e-12)]);
        const est = sim.ltf ? sim.H.filter((_, i) => i % Math.max(1, Math.floor(sim.H.length / 300)) === 0).map(z => [f(z.k), 10 * Math.log10(z.est.re ** 2 + z.est.im ** 2 + 1e-12)]) : [];
        const lo = Math.min(-20, ...pts.map(q => q[1])) - 2;
        plot(cv('freq'), { title: `${title('freq')}${Number.isFinite(sim.coherenceBandwidth) ? ` · Bc ≈ ${sim.coherenceBandwidth.toFixed(1)} MHz` : ' · canal plano'}`, x: { min: -n.width / 2, max: n.width / 2, label: 'frequência relativa à portadora (MHz)' }, y: { min: Math.max(-40, lo), max: 10, label: '|H|² (dB)' }, series: [{ points: pts, color: PALETTE[2], width: 1.8 }], scatter: est.length ? [{ points: est, color: PALETTE[1], size: 3, alpha: .8 }] : [], hlines: [{ y: 0, label: 'média 0 dB' }], legend: sim.ltf ? [{ label: 'H real', color: PALETTE[2] }, { label: 'estimativa LTF', color: PALETTE[1] }] : [] });
    }
    // 7. SNR per subcarrier.
    {
        const pts = n.data.map((k, i) => [k * n.spacing, sim.snrPerSc[i]]);
        plot(cv('snr'), { title: title('snr'), x: { min: -n.width / 2, max: n.width / 2, label: 'frequência (MHz)' }, y: { min: Math.min(-5, ...pts.map(q => q[1])), max: Math.max(...pts.map(q => q[1])) + 3, label: 'SNR (dB)' }, series: [{ points: pts, color: PALETTE[0], width: 1.6 }], hlines: [{ y: p.snrDb, label: `SNR média ${p.snrDb} dB` }] });
    }
    // 8. BER per subcarrier.
    {
        const floor = 1 / (sim.params.symbols * sim.k), pts = sim.perSc.map(q => [q.k * n.spacing, Math.max(q.ber, floor / 10)]);
        plot(cv('ber'), { title: `${title('ber')} · total ${sci(sim.ber)}`, x: { min: -n.width / 2, max: n.width / 2, label: 'frequência (MHz)' }, y: { min: Math.floor(Math.log10(floor / 10)), max: 0, log: true, label: 'BER' }, stems: [{ points: pts.filter(q => q[1] > floor / 10), color: PALETTE[4], width: n.N > 512 ? .7 : 1.6 }], hlines: [{ y: sim.theory.awgn > floor / 10 ? sim.theory.awgn : floor, label: sim.theory.awgn > floor / 10 ? 'AWGN teórica' : 'nenhum erro abaixo desta linha' }] });
    }
    // 9-10. Constellations.
    {
        const meanSnr = p.snrDb, pick = (list, max) => list.filter((_, i) => i % Math.max(1, Math.ceil(list.length / max)) === 0);
        const raw = pick(sim.rxRaw, 4000), eq = pick(sim.eq, 5000), lim = M => M === 2 ? 1.8 : 1.6;
        const rawLim = Math.max(lim(sim.M), ...raw.map(q => Math.hypot(q.z.re, q.z.im)).sort((a, b) => a - b).slice(Math.floor(raw.length * .99)));
        const dot = sim.M >= 1024 ? 1.6 : 2.4;
        plot(cv('rx'), { title: title('rx'), equalAspect: true, x: { min: -rawLim, max: rawLim, label: 'I' }, y: { min: -rawLim, max: rawLim, label: 'Q' }, scatter: [{ points: raw.map(q => [q.z.re, q.z.im]), color: PALETTE[3], size: dot, alpha: .55 }] });
        const colorBySc = new Map(n.data.map((k, i) => [k, snrColor(sim.snrPerSc[i], meanSnr)]));
        const L = lim(sim.M), eqLim = p.equalizer === 'none' ? rawLim : L;
        plot(cv('eq'), { title: `${title('eq')} · EVM ${(100 * sim.evm).toFixed(1)}%`, equalAspect: true, x: { min: -eqLim, max: eqLim, label: 'I' }, y: { min: -eqLim, max: eqLim, label: 'Q' }, scatter: [{ points: eq.map(q => [q.z.re, q.z.im, colorBySc.get(q.k)]), size: dot, alpha: .6 }] });
    }
    // 11. Transmit spectrum.
    {
        const pts = txSpectrum(sim);
        plot(cv('psd'), { title: title('psd'), x: { min: -n.fs / 2, max: n.fs / 2, label: 'frequência (MHz)' }, y: { min: -60, max: 5, label: 'PSD (dB)' }, series: [{ points: pts, color: PALETTE[0], width: 1.2 }], xbands: [{ x0: Math.min(...n.used) * n.spacing, x1: Math.max(...n.used) * n.spacing, color: PALETTE[2], alpha: .08, label: 'ocupada' }] });
    }
}
