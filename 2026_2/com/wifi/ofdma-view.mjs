// OFDMA laboratory tab (Wi-Fi 6/6E/7 APs): RU plan, per-user rates and SU-OFDM × OFDMA airtime.
import { STANDARDS, MCS } from './phy.mjs';
import { planOfdma, sweepOfdma, ruSizesFor, ruCount, ofdmaCapable, TONE_SPACING_MHZ } from './ofdma.mjs';
import { plot, PALETTE } from './charts.mjs';
import { rng } from '../sim/utils.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const us = v => v >= 1000 ? `${(v / 1000).toFixed(2)} ms` : `${v.toFixed(0)} µs`;
const color = i => PALETTE[i % PALETTE.length];
const GRAY = '#64748b';

export const defaultOfdmaState = () => ({ ruTones: 'auto', bytes: 200, extra: 0, seed: 1 });

// The tab only exists for HE/EHT APs: OFDMA is scheduled by the AP.
export const ofdmaAvailable = ap => !!ap && ofdmaCapable(ap.wifi.standard);

// Associated HE/EHT clients plus optional simulated stations; Wi-Fi 4/5 clients stay out of the MU PPDU.
export function ofdmaUsers(lab, ap, dir, state) {
    const users = [], legacy = [];
    for (const c of lab.clientsOf(ap)) {
        const l = lab.link(ap, c), n = l.negotiation;
        if (!n.ok) continue;
        if (!ofdmaCapable(n.standard)) { legacy.push({ name: c.name, standard: n.standard }); continue; }
        users.push({ id: c.id, name: c.name, snrDb: l[dir].sinr, nss: n.nss, rxChains: dir === 'dl' ? n.clientChains : n.apChains, standard: n.standard, width: n.width });
    }
    const rand = rng(1000 + state.seed);
    for (let i = 0; i < state.extra; i++) users.push({ id: `v${i}`, name: `STA simulada ${i + 1}`, virtual: true, snrDb: Math.round(8 + 30 * rand()), nss: 1, rxChains: 1 });
    return { users, legacy };
}

export function renderOfdma(el, state, { lab, ap, dir }) {
    const w = ap.wifi, std = STANDARDS[w.standard], width = +w.width, gi = std.gis.includes(+w.gi) ? +w.gi : std.gis[0];
    const fixedMcs = w.mcs === 'auto' ? null : Math.min(+w.mcs, std.maxMcs);
    const { users, legacy } = ofdmaUsers(lab, ap, dir, state);
    const sizes = ruSizesFor(width);
    const sel = (key, value, options) => `<select data-ofdma="${key}">${options.map(([v, l]) => `<option value="${v}" ${String(v) === String(value) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
    const num = (key, value, min, max, step) => `<input type="number" data-ofdma="${key}" value="${value}" min="${min}" max="${max}" step="${step}">`;
    const controls = `<div class="ofdm-controls">
        <span class="ofdm-follow">AP <b>${esc(ap.name)}</b> · ${esc(std.label)} · ${width} MHz · ${dir === 'dl' ? 'descida (DL MU PPDU)' : 'subida (Trigger → HE TB PPDU)'}</span>
        <label>Tamanho do RU ${sel('ruTones', state.ruTones, [['auto', 'Automático'], ...sizes.map(r => [r.tones, `${r.label} × ${ruCount(width, r.tones)}`])])}</label>
        <label>Pacote (bytes) ${num('bytes', state.bytes, 40, 1500, 10)}</label>
        <label>Estações simuladas ${num('extra', state.extra, 0, 72, 1)}</label>
        <button class="btn" data-ofdma-action="reseed" title="Sorteia outras SNRs para as estações simuladas">Nova realização</button>
    </div>`;
    const legacyNote = legacy.length ? `<p class="footnote"><b>Fora do OFDMA:</b> ${legacy.map(l => `${esc(l.name)} (${esc(STANDARDS[l.standard].label)})`).join(', ')} — clientes HT/VHT não entendem RUs e continuam sendo servidos em SU-OFDM.</p>` : '';
    if (!users.length) { el.innerHTML = controls + `<p class="footnote">Nenhum cliente HE/EHT associado a este AP. Associe um cliente Wi-Fi 6/6E/7 ou adicione <b>estações simuladas</b> para montar a alocação de RUs.</p>` + legacyNote; return; }

    const base = { standard: w.standard, width, gi, users, ruTones: state.ruTones, bytes: +state.bytes, dir, fixedMcs };
    const p = planOfdma(base);
    const m = (label, value, small = '') => `<div class="metric"><span>${label}</span><strong>${value}</strong>${small ? `<small>${small}</small>` : ''}</div>`;
    const strip = `<div class="ofdm-strip">
        ${m('RU', `${p.ru.label} × ${p.count}`, `${p.ru.data} dados + ${p.ru.tones - p.ru.data} pilotos · ${(p.ru.tones * TONE_SPACING_MHZ).toFixed(2)} MHz`)}
        ${m('Usuários · rodadas', `${users.length} · ${p.mu.rounds}`, `${p.unused} RU${p.unused === 1 ? '' : 's'} sem uso${p.mu.rounds > 1 ? ' · mais usuários que RUs' : ''}`)}
        ${m('MCS máx. no RU', `${p.top} · ${MCS[p.top].label}`, p.ru.tones < 242 ? '1024/4096-QAM só em RU ≥ 242 tons' : 'sem restrição de RU')}
        ${m('Tempo de ar SU-OFDM', us(p.su.total), `${users.length} acessos ao meio + ACKs`)}
        ${m('Tempo de ar OFDMA', p.blocked ? '—' : us(p.mu.total), `${p.mu.rounds} ${dir === 'dl' ? 'MU PPDU' : 'Trigger + TB PPDU'}`)}
        ${m('Ganho', p.blocked ? '—' : `${p.gain.toFixed(2)}×`, p.gain >= 1 ? 'OFDMA mais rápido' : 'SU mais rápido (pacotes grandes)')}
        ${m('Vazão útil', `${p.suGoodput.toFixed(1)} / ${p.muGoodput.toFixed(1)} Mb/s`, 'SU / OFDMA · MU sem retransmissões')}
        ${m('Latência média', `${us(p.suLatency)} / ${us(p.muLatency)}`, 'SU (fila) / OFDMA (paralelo)')}
        ${m(dir === 'ul' ? 'Ganho de potência' : 'Padding', dir === 'ul' ? `+${p.ulGain.toFixed(1)} dB` : `${(100 * p.mu.padding).toFixed(0)}%`, dir === 'ul' ? 'potência da STA concentrada no RU' : 'RUs completados até o usuário mais lento')}
    </div>`;
    const blockedNote = p.blocked ? `<p class="footnote bad">MCS fixo ${fixedMcs} (${MCS[fixedMcs].label}) não existe em ${p.ru.label}: escolha um RU ≥ 242 tons ou MCS automático no AP.</p>` : '';
    const rows = p.users.map(u => `<tr><td class="l"><span class="swatch" style="background:${color(u.index)}"></span>${esc(u.name)}</td>
        <td>${u.snrDb.toFixed(1)}</td><td>${p.ru.label} #${u.ruIndex + 1}${p.mu.rounds > 1 ? ` · r${u.round + 1}` : ''}</td>${dir === 'ul' ? `<td>${u.ruSnrDb.toFixed(1)}</td>` : ''}
        <td>${u.su ? `${u.su.mcs} · ${u.su.nss}SS` : '—'}</td><td>${u.su ? u.su.rate.toFixed(1) : '—'}</td>
        <td>${u.mu ? `${u.mu.mcs} · ${u.mu.nss}SS` : '—'}</td><td>${u.mu ? u.mu.rate.toFixed(1) : '—'}</td>
        <td>${u.suDone ? us(u.suDone) : '—'}</td><td>${u.muDone ? us(u.muDone) : '—'}</td></tr>`).join('');
    const table = `<table class="mtable" style="margin-bottom:10px"><thead>
        <tr><th class="l">Usuário</th><th>SNR (dB)</th><th>RU</th>${dir === 'ul' ? '<th>SNR no RU</th>' : ''}<th>MCS SU</th><th>Taxa SU (Mb/s)</th><th>MCS RU</th><th>Taxa RU (Mb/s)</th><th>Entrega SU</th><th>Entrega OFDMA</th></tr>
        </thead><tbody>${rows}</tbody></table>`;
    const cards = [
        ['ru', 'Alocação de RUs no canal', `Cada barra é um RU de ${p.ru.tones} tons (posições aproximadas); a altura é a taxa PHY que o usuário obtém nele. Cinza: RU sem usuário.`],
        ['su', 'SU-OFDM: um usuário por vez', 'Tempo × frequência. Cada pacote ocupa o canal inteiro, mas paga contenção (DIFS + backoff), preâmbulo e ACK. Pacotes pequenos terminam em poucos símbolos: o overhead domina.'],
        ['mu', 'OFDMA: usuários em paralelo', dir === 'dl' ? 'Um único MU PPDU carrega todos os usuários, cada um em seu RU. Faixas claras: padding até o usuário mais lento. Os ACKs voltam juntos em um HE TB PPDU.' : 'O AP envia um Trigger; as STAs respondem ao mesmo tempo num HE TB PPDU, cada uma no seu RU; um Multi-STA BlockAck confirma todas.'],
        ['bytes', 'Tempo de ar × tamanho do pacote', 'OFDMA ganha com pacotes pequenos (VoIP, jogos, IoT, ACKs TCP), onde o overhead por acesso domina. Com pacotes grandes o RU estreito fica lento e SU volta a vencer.'],
        ['users', 'Tempo de ar × número de usuários', 'SU cresce linearmente com os usuários. OFDMA divide o canal em RUs menores e cresce bem mais devagar até esgotar os RUs de 26 tons.'],
        ['size', 'Tempo de ar OFDMA × tamanho do RU', 'RUs maiores são mais rápidos por usuário mas cabem menos por PPDU (mais rodadas); RUs menores atendem todos de uma vez, mas sem 1024/4096-QAM.'],
    ];
    el.innerHTML = controls + strip + blockedNote + table + legacyNote + `<div class="plots-grid">${cards.map(([id, t, cap]) => `<div class="plot-card"><canvas data-plot="${id}" data-title="${esc(t)}"></canvas><div class="cap">${cap}</div></div>`).join('')}</div>`;
    const cv = id => el.querySelector(`[data-plot="${id}"]`), title = id => cv(id).dataset.title;
    drawPlots(p, base, cv, title);
}

function drawPlots(p, base, cv, title) {
    const half = p.width / 2, mhz = t => t * TONE_SPACING_MHZ;
    // 1. RU map (first round).
    {
        const first = p.users.filter(u => u.round === 0), top = Math.max(1, ...first.map(u => u.mu?.rate || 0)) * 1.2;
        const bars = Array.from({ length: p.count }, (_, k) => {
            const u = first.find(q => q.ruIndex === k), lo = -p.count * p.ru.tones / 2 + k * p.ru.tones;
            return { x0: mhz(lo) + .02, x1: mhz(lo + p.ru.tones) - .02, y: u?.mu ? u.mu.rate : top * .04, color: u ? color(u.index) : GRAY, alpha: u ? .85 : .35 };
        });
        plot(cv('ru'), { title: `${title('ru')} · ${p.ru.label} × ${p.count}`, x: { min: -half, max: half, label: 'frequência relativa à portadora (MHz)' }, y: { min: 0, max: top, label: 'taxa no RU (Mb/s)' }, bars, vlines: [{ x: 0, color: GRAY, dash: [2, 3] }] });
    }
    // 2-3. Time–frequency occupancy, same time axis for both.
    {
        const tmax = Math.max(p.su.total, p.mu.total) * 1.02 || 1, gray = { access: .12, trigger: .45, preamble: .45, ack: .45 };
        const rect = (s, y0, y1) => s.kind === 'data' ? { x0: s.t0, x1: s.t1, y0, y1, color: color(s.user), alpha: .85 } : s.kind === 'pad' ? { x0: s.t0, x1: s.t1, y0, y1, color: color(s.user), alpha: .22 } : { x0: s.t0, x1: s.t1, y0, y1, color: GRAY, alpha: gray[s.kind], label: s.kind === 'trigger' ? 'TRIG' : s.kind === 'ack' ? 'BA' : '' };
        const axes = label => ({ x: { min: 0, max: tmax, label: 'tempo (µs)' }, y: { min: -half, max: half, label } });
        plot(cv('su'), { title: `${title('su')} · ${us(p.su.total)}`, ...axes('frequência (MHz)'), rects: p.su.segments.map(s => rect(s, -half, half)) });
        plot(cv('mu'), {
            title: `${title('mu')} · ${p.blocked ? 'MCS fixo incompatível' : us(p.mu.total)}`, ...axes('frequência (MHz)'),
            rects: p.mu.segments.map(s => s.tones ? rect(s, mhz(s.tones.lo), mhz(s.tones.hi)) : rect(s, -half, half)),
            legend: [{ label: 'dados', color: PALETTE[0] }, { label: 'padding', color: `${PALETTE[0]}55` }, { label: 'contenção / preâmbulo / BA', color: GRAY }],
        });
    }
    // 4. Airtime vs packet size.
    {
        const sizes = [40, 64, 100, 150, 200, 300, 500, 750, 1000, 1500], pts = sweepOfdma(base, 'bytes', sizes);
        const ymax = Math.max(...pts.flatMap(q => [q.su, q.mu])) * 1.1;
        plot(cv('bytes'), { title: title('bytes'), x: { min: 40, max: 1500, log: true, label: 'bytes por usuário' }, y: { min: 0, max: ymax, label: 'tempo de ar (µs)' }, series: [{ points: pts.map(q => [q.x, q.su]), color: PALETTE[4], width: 2 }, { points: pts.map(q => [q.x, q.mu]), color: PALETTE[2], width: 2 }], vlines: [{ x: +base.bytes, color: GRAY }], markers: [{ x: +base.bytes, y: p.su.total, color: PALETTE[4] }, { x: +base.bytes, y: p.mu.total, color: PALETTE[2] }], legend: [{ label: 'SU-OFDM', color: PALETTE[4] }, { label: 'OFDMA', color: PALETTE[2] }] });
    }
    // 5. Airtime vs users.
    {
        const max = Math.min(ruCount(p.width, 26), 74), values = Array.from({ length: Math.min(max, 40) }, (_, i) => Math.max(1, Math.round(1 + i * (max - 1) / 39))).filter((v, i, a) => a.indexOf(v) === i);
        const pts = sweepOfdma(base, 'users', values), ymax = Math.max(...pts.flatMap(q => [q.su, q.mu])) * 1.1;
        plot(cv('users'), { title: `${title('users')} · ${base.bytes} B`, x: { min: 1, max, label: 'usuários (SNRs repetidas dos atuais)' }, y: { min: 0, max: ymax, label: 'tempo de ar (µs)' }, series: [{ points: pts.map(q => [q.x, q.su]), color: PALETTE[4], width: 2 }, { points: pts.map(q => [q.x, q.mu]), color: PALETTE[2], width: 2, step: true }], markers: [{ x: p.users.length, y: p.mu.total, color: PALETTE[2] }], legend: [{ label: 'SU-OFDM', color: PALETTE[4] }, { label: 'OFDMA (RU automático)', color: PALETTE[2] }] });
    }
    // 6. OFDMA airtime vs RU size.
    {
        const sizes = ruSizesFor(p.width), pts = sizes.map(r => ({ r, q: planOfdma({ ...base, ruTones: r.tones }) })).filter(o => !o.q.blocked);
        const ymax = Math.max(p.su.total, ...pts.map(o => o.q.mu.total)) * 1.1;
        plot(cv('size'), {
            title: title('size'), x: { min: 20, max: sizes.at(-1).tones * 1.3, log: true, label: 'tons por RU' }, y: { min: 0, max: ymax, label: 'tempo de ar (µs)' },
            series: [{ points: pts.map(o => [o.r.tones, o.q.mu.total]), color: PALETTE[2], width: 2 }],
            markers: pts.map(o => ({ x: o.r.tones, y: o.q.mu.total, color: o.r.tones === p.ru.tones ? PALETTE[1] : PALETTE[2], label: o.q.mu.rounds > 1 ? `${o.r.label} · ${o.q.mu.rounds} rod.` : o.r.label })),
            hlines: [{ y: p.su.total, color: PALETTE[4], label: 'SU-OFDM' }],
        });
    }
}
