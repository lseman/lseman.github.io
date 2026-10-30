// Analysis panel: per-device metrics table and course plots (BER, Shannon, throughput, range, spectrum).
import { STANDARDS, bfGain } from './phy.mjs';
import { allMetrics, berCurve, codedBerCurve, shannonCurve, mcsSteps, rateVsDistance, spectrumAt, spectralMask, BAND_RANGE, noisePsd, MODULATION_ORDERS, modulationLabel } from './metrics.mjs';
import { plot, PALETTE } from './charts.mjs';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const colorOf = (lab, client) => PALETTE[Math.max(0, lab.clients.indexOf(client)) % PALETTE.length];
const sci = v => !Number.isFinite(v) ? '—' : v === 0 || v < 1e-15 ? '<1e-15' : v >= .01 ? v.toFixed(3) : v.toExponential(1).replace('e', 'e');
const berClass = v => v > 1e-3 ? 'bad' : v > 1e-6 ? 'warn' : 'good';
const mbps = v => v >= 100 ? v.toFixed(0) : v.toFixed(1);

export function renderMetrics(el, lab, { dir, selectedId }) {
    const rows = allMetrics(lab, dir), offline = lab.clients.filter(c => !lab.currentLink(c));
    if (!rows.length) { el.innerHTML = '<p class="footnote">Nenhum dispositivo associado. Conecte um cliente para ver as métricas.</p>'; return; }
    const body = rows.map(m => {
        const meas = m.measured;
        return `<tr data-select="${m.client.id}" class="${m.client.id === selectedId ? 'sel' : ''}">
            <td class="l"><span class="swatch" style="background:${colorOf(lab, m.client)}"></span>${esc(m.client.name)}</td>
            <td class="l">${esc(m.ap.name)} · ${STANDARDS[m.standard].short} ${m.width}</td>
            <td>${m.distance.toFixed(1)}</td><td>${m.rssi.toFixed(1)}</td><td class="${m.sinr < 10 ? 'bad' : m.sinr < 25 ? 'warn' : 'good'}">${m.sinr.toFixed(1)}</td>
            <td class="l">${m.mcs} · ${m.modulation.label} ${m.modulation.code} ×${m.nss}</td>
            <td>${m.esn0.toFixed(1)}</td><td>${m.ebn0.toFixed(1)}</td>
            <td class="${berClass(m.rawBer)}">${sci(m.rawBer)}</td><td class="${berClass(m.ber)}">${sci(m.ber)}</td><td class="${m.per > .1 ? 'bad' : m.per > .01 ? 'warn' : 'good'}">${(100 * m.per).toFixed(m.per < .01 ? 3 : 1)}%</td>
            <td class="${m.phyRate > m.capacity ? 'bad' : ''}" title="${m.phyRate > m.capacity ? 'Taxa acima da capacidade de Shannon: transmissão confiável impossível (PER ≈ 100%)' : ''}">${mbps(m.phyRate)}${m.phyRate > m.capacity ? ' > C' : ''}</td><td>${mbps(m.goodput)}</td><td>${mbps(m.capacity)}</td><td>${(100 * m.efficiency).toFixed(0)}%</td><td>${m.spectralEfficiency.toFixed(2)}</td>
            <td>${meas.frames}</td><td class="${meas.retryRate > .1 ? 'warn' : ''}">${(100 * meas.retryRate).toFixed(1)}%</td><td class="${meas.lost ? 'bad' : ''}">${meas.lost}</td></tr>`;
    }).join('');
    el.innerHTML = `<table class="mtable"><thead>
        <tr><th class="group l" colspan="2">DISPOSITIVO</th><th class="group" colspan="3">ENLACE</th><th class="group" colspan="6">DETECÇÃO</th><th class="group" colspan="5">TAXAS (Mb/s)</th><th class="group" colspan="3">MEDIDO NO LOG</th></tr>
        <tr><th class="l">Cliente</th><th class="l">AP · padrão MHz</th><th>d (m)</th><th>RSSI (dBm)</th><th>SINR (dB)</th><th class="l">MCS · modulação</th><th>Es/N0 (dB)</th><th>Eb/N0 (dB)</th><th>BER bruta</th><th>BER pós-FEC</th><th>PER</th><th>PHY</th><th>Vazão</th><th>Shannon</th><th>η</th><th>b/s/Hz</th><th>Quadros</th><th>Retransm.</th><th>Perdidos</th></tr>
    </thead><tbody>${body}</tbody></table>
    ${offline.length ? `<p class="footnote">Sem enlace: ${offline.map(c => esc(c.name)).join(', ')}.</p>` : ''}
    <p class="footnote"><b>Es/N0</b>: SINR por fluxo espacial e subportadora (a potência se divide entre N<sub>ss</sub> fluxos; antenas extras somam ganho MRC). <b>Eb/N0</b> = Es/N0 − 10·log₁₀(k·R) por bit de informação. <b>BER bruta</b>: BER da constelação M-QAM Gray antes do decodificador, com Eb/N0 por bit codificado (Es/N0 − 10·log₁₀k). <b>BER pós-FEC</b>: modelo didático com ganho de codificação equivalente. <b>PER</b>: 1 − (1 − BER)<sup>8·1538</sup>. <b>Shannon</b>: C = N<sub>ss</sub>·B·log₂(1 + Es/N0). <b>η</b> = vazão/C. <b>Medido</b>: quadros ${dir === 'dl' ? 'recebidos pelo' : 'enviados pelo'} cliente no log; retransmissões = (tentativas − quadros)/tentativas.</p>`;
}

export function renderPlots(el, lab, { dir, focusAp, selected }) {
    const rows = allMetrics(lab, dir);
    const cards = [
        ['beam', 'Beamforming · ganho por fluxo', 'Modelo idealizado de ganho de arranjo na descida: G = 10·log₁₀(Ntx/Nss). As curvas mostram o compromisso entre antenas e fluxos; o ponto indica o enlace selecionado. Não representa um diagrama de radiação nem ganhos medidos.'],
        ['ber', 'BER × Eb/N0', 'Curvas M-QAM Gray em AWGN (sólidas) e pós-FEC do MCS em uso (tracejadas). Círculo cheio: BER bruta da constelação (Eb/N0 por bit codificado). Círculo vazado: BER depois do decodificador (Eb/N0 por bit de informação). O salto entre eles é o ganho do código.'],
        ['shannon', 'Eficiência espectral × SNR', 'Cada degrau é um MCS (PER ≤ 10%). A distância horizontal até a curva log₂(1+SNR) é o gap para a capacidade; os pontos são os dispositivos, por fluxo espacial.'],
        ['throughput', 'Vazão por dispositivo', 'Overhead de MAC (preâmbulo, DIFS, backoff, Block Ack), retransmissões e canal ocupado separam a taxa PHY da vazão útil.'],
        ['range', `Taxa × distância · ${focusAp ? esc(focusAp.name) : 'nenhum AP'}`, 'Curvas: melhor caso no ambiente atual (expoente n, ruído), sem paredes nem interferência. Cada degrau é uma troca de MCS. Pontos abaixo da curva perderam SNR para paredes ou interferência.'],
        ['spectrum', 'Espectro recebido', 'Máscara espectral OFDM do 802.11 escalada pela potência recebida no ponto indicado. Sobreposição parcial vira interferência; mesmo canal vira disputa de tempo no ar (CSMA/CA).'],
    ];
    el.innerHTML = cards.map(([id, , cap]) => `<div class="plot-card"><canvas data-plot="${id}"></canvas><div class="cap">${cap}</div></div>`).join('');
    const canvas = id => el.querySelector(`[data-plot="${id}"]`), titles = Object.fromEntries(cards.map(([id, t]) => [id, t]));
    const dirLabel = dir === 'dl' ? 'descida' : 'subida';

    // Ideal array gain for the selected link, independent of whether beamforming is enabled.
    {
        const client = selected?.type !== 'router' ? selected : null;
        const link = client && lab.currentLink(client);
        const chains = link?.negotiation?.apChains || +focusAp?.wifi.streams || 4;
        const series = [1, 2, 3, 4].map(n => ({ points: Array.from({ length: n }, (_, i) => [i + 1, bfGain(n, i + 1)]), color: PALETTE[n - 1], width: n === chains ? 2.5 : 1.2 }));
        const markers = link?.rates ? [{ x: link.rates.dl.nss, y: bfGain(chains, link.rates.dl.nss), color: PALETTE[chains - 1], label: `${client.name} · ${link.beamforming.active ? 'ativo' : 'potencial'}` }] : [];
        plot(canvas('beam'), { title: `${titles.beam} · ${chains} antena(s) no AP`, x: { min: 1, max: 4, ticks: 3, label: 'fluxos espaciais Nss' }, y: { min: 0, max: 7, label: 'ganho ideal (dB)' }, series, markers, legend: [1, 2, 3, 4].map(n => ({ label: `${n} antena(s)`, color: PALETTE[n - 1] })) });
    }
    // 1. BER vs Eb/N0
    {
        const used = new Set(rows.map(m => m.modulation.M));
        const series = MODULATION_ORDERS.map((M, i) => { const points = berCurve(M), cross = points.find(([, b]) => b < 1e-5); return { points, color: PALETTE[(i + 5) % PALETTE.length], width: used.has(M) ? 2 : 1, alpha: used.has(M) ? 1 : .5, labelAt: cross, labelText: modulationLabel(M) }; });
        const coded = [...new Set(rows.map(m => m.mcs))].map(mcs => ({ points: codedBerCurve(mcs), color: '#94a3b8', dash: [5, 4], width: 1.2, alpha: .8 }));
        const markers = [], segments = [];
        for (const m of rows) {
            const color = colorOf(lab, m.client);
            markers.push({ x: m.ebn0Coded, y: Math.max(m.rawBer, 1e-12), color, label: m.client.name });
            markers.push({ x: m.ebn0, y: Math.max(m.ber, 1e-12), color, hollow: true });
            segments.push({ x0: m.ebn0Coded, y0: Math.max(m.rawBer, 1e-12), x1: m.ebn0, y1: Math.max(m.ber, 1e-12), color });
        }
        plot(canvas('ber'), { title: `${titles.ber} (${dirLabel})`, x: { min: -2, max: 40, label: 'Eb/N0 (dB)' }, y: { min: -10, max: 0, log: true, label: 'BER' }, series: [...series, ...coded], markers, segments, hlines: [{ y: 1e-6, label: 'BER 1e-6' }] });
    }
    // 2. Spectral efficiency vs SNR
    {
        const ref = rows[0] || (focusAp && { standard: focusAp.wifi.standard, width: +focusAp.wifi.width, gi: +focusAp.wifi.gi });
        const steps = ref ? mcsSteps(ref.standard, ref.width, ref.gi).filter(s => s.snr < 50) : [];
        const stair = steps.flatMap((s, i) => [[s.snr, i ? steps[i - 1].efficiency : 0], [s.snr, s.efficiency]]);
        if (steps.length) stair.push([50, steps.at(-1).efficiency]);
        const markers = rows.map(m => ({ x: m.esn0, y: m.spectralEfficiency, color: colorOf(lab, m.client), label: `${m.client.name} (MCS ${m.mcs})` }));
        plot(canvas('shannon'), {
            title: `${titles.shannon}${ref ? ` · ${STANDARDS[ref.standard].short} ${ref.width} MHz` : ''}`,
            x: { min: -5, max: 50, label: 'SNR por fluxo (dB)' }, y: { min: 0, max: 14, label: 'b/s/Hz por fluxo' },
            series: [{ points: shannonCurve(), color: PALETTE[0], width: 2.2, endLabel: 'Shannon log₂(1+SNR)' }, { points: stair, color: PALETTE[1], width: 2, endLabel: 'MCS' }],
            markers,
        });
    }
    // 3. Throughput per device
    {
        const n = rows.length, bars = [];
        rows.forEach((m, i) => {
            bars.push({ x0: i - .38, x1: i - .14, y: m.capacity, color: '#64748b' });
            bars.push({ x0: i - .12, x1: i + .12, y: m.phyRate, color: PALETTE[0] });
            bars.push({ x0: i + .14, x1: i + .38, y: m.goodput, color: PALETTE[1] });
        });
        const top = Math.max(10, ...rows.flatMap(m => [m.capacity, m.phyRate, m.goodput]));
        plot(canvas('throughput'), {
            title: `${titles.throughput} (${dirLabel})`, x: { min: -.5, max: Math.max(.5, n - .5), label: 'dispositivo', format: v => Number.isInteger(v) ? (rows[v]?.client.name || '') : '', ticks: Math.max(1, n) },
            y: { min: 0, max: Math.ceil(Math.log10(top)), log: true, label: 'Mb/s' }, bars,
            legend: [{ label: 'Capacidade de Shannon', color: '#64748b' }, { label: 'Taxa PHY', color: PALETTE[0] }, { label: 'Vazão TCP estimada', color: PALETTE[1] }],
        });
    }
    // 4. Rate vs distance
    {
        const curve = focusAp ? rateVsDistance(lab, focusAp, 50) : [];
        const mine = rows.filter(m => m.ap === focusAp);
        const top = Math.max(10, ...curve.map(p => p.capacity), ...mine.map(m => m.phyRate));
        plot(canvas('range'), {
            title: titles.range, x: { min: 0, max: 50, label: 'distância (m)' }, y: { min: 0, max: top * 1.08, label: 'Mb/s' },
            series: [
                { points: curve.map(p => [p.d, p.capacity]), color: '#64748b', dash: [5, 4], width: 1.4 },
                { points: curve.map(p => [p.d, p.rate]), color: PALETTE[0], width: 2, step: true },
                { points: curve.map(p => [p.d, p.goodput]), color: PALETTE[1], width: 1.6 },
            ],
            markers: mine.map(m => ({ x: m.distance, y: m.phyRate, color: colorOf(lab, m.client), label: m.client.name })),
            legend: [{ label: 'Shannon', color: '#64748b', dash: true }, { label: 'Taxa PHY (MCS automático)', color: PALETTE[0] }, { label: 'Vazão estimada', color: PALETTE[1] }],
        });
    }
    // 5. Spectrum at the selected point
    {
        const band = focusAp?.wifi.band || '5', [f0, f1] = BAND_RANGE[band];
        const point = selected && selected.type !== 'router' ? selected : selected || lab.clientsOf(focusAp || {})?.[0] || focusAp;
        const aps = point ? spectrumAt(lab, point, band) : [], floor = noisePsd(lab.state.env), step = band === '2.4' ? .25 : 1;
        const series = aps.map((a, i) => {
            const pts = [];
            for (let f = Math.max(f0, a.fc - 1.6 * a.width); f <= Math.min(f1, a.fc + 1.6 * a.width); f += step) pts.push([f, Math.max(floor, a.psd + spectralMask(f - a.fc, a.width))]);
            return { points: pts, color: PALETTE[(i * 3) % PALETTE.length], fill: true, alpha: a.ap === focusAp ? .45 : .22 };
        });
        const outlines = series.map(s => ({ ...s, fill: false, width: 1.4, alpha: 1 }));
        plot(canvas('spectrum'), {
            title: `${titles.spectrum} ${band} GHz · no ponto: ${point ? esc(point.name) : '—'}`,
            x: { min: f0, max: f1, label: 'frequência (MHz)', format: v => String(Math.round(v)) }, y: { min: -125, max: -20, label: 'dBm/MHz' },
            series: [...series, ...outlines], hlines: [{ y: floor, label: `piso de ruído ${floor.toFixed(0)} dBm/MHz`, color: '#fb7185' }],
            markers: aps.map((a, i) => ({ x: a.fc, y: a.psd, color: PALETTE[(i * 3) % PALETTE.length], label: `${a.ap.name} · ch ${a.ap.wifi.channel} · ${a.power.toFixed(0)} dBm`, size: 3 })),
        });
    }
}
