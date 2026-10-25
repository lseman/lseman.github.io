import { createProcessors, defs } from '../sim/blocks.js';
import { rng } from '../sim/utils.js';
import { STANDARDS, STANDARD_ORDER, MCS, MATERIALS, channelsFor, widthsFor, centerFrequency, dataRate, mcsValid, packetErrorRate, requiredSnr, aggregateGoodput, clientBands } from './phy.mjs';
import { Lab, makeRouter, makeClient, CLIENT_TYPES, SECURITY_OPTIONS, securityLabel, apConfigError, lanConfigError, isIp, formatLease, prefixOf } from './net.mjs';
import { SCENARIOS } from './scenarios.mjs';
import { runCommand } from './terminal.mjs';
import { renderMetrics, renderPlots } from './analysis.mjs';
import { linkMetrics } from './metrics.mjs';
import { renderOfdm, defaultOfdmState, ofdmParams } from './ofdm-view.mjs';
import { renderOfdma, defaultOfdmaState, ofdmaAvailable } from './ofdma-view.mjs';
import { createBrowser } from './browser.mjs';
import { encodeShare, decodeShare, labLink, scenarioLink, parseShareHash } from './share.mjs';

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const STORAGE_KEY = 'wifilab-state-v1';
const PROTO_COLORS = { '802.11': '#94a3b8', EAPOL: '#a78bfa', DHCP: '#f4b860', ARP: '#f472b6', ICMP: '#45d39a', DNS: '#51d5e6', TCP: '#60a5fa', Sistema: '#536075' };

let state, lab, scenarioKey;
const browser = createBrowser({ lab: () => lab, changed: () => changed(), normalizeAp: ap => normalizeAp(ap) });
const ui = { bottom: 'events', dir: 'dl', ofdm: defaultOfdmState(), ofdma: defaultOfdmaState(), selected: null, tab: { router: 'wifi', client: 'wifi' }, tool: 'select', material: 'drywall', heatmap: 'off', anim: 'normal', protoFilter: '', onlySelected: false, selectedEvent: null, terminalFor: null, terms: new Map(), drag: null, draft: null, heat: { key: null, href: null } };

// ---------- icons (24×24 stroke glyphs) ----------
const ICONS = {
    router: '<rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 13 5.5 5M17 13l1.5-8M9 8.5a4.2 4.2 0 0 1 6 0M10.8 10.6a1.7 1.7 0 0 1 2.4 0"/><circle cx="7" cy="16.5" r=".6"/><circle cx="10" cy="16.5" r=".6"/>',
    laptop: '<rect x="5" y="5" width="14" height="10" rx="1.5"/><path d="M2.5 18.5h19L19.5 15h-15z"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    desktop: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M12 16v4M8.5 20h7"/>',
    printer: '<path d="M7 9V3.5h10V9"/><rect x="3" y="9" width="18" height="8" rx="1.5"/><path d="M7 14h10v6.5H7z"/>',
};
const iconSvg = (type, size = 26) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[type]}</svg>`;
const TYPE_LABEL = { router: 'Roteador Wi-Fi', ...Object.fromEntries(Object.entries(CLIENT_TYPES).map(([k, v]) => [k, v.label])) };

// ---------- state lifecycle ----------
function load(newState, key) {
    state = newState; scenarioKey = key;
    lab = new Lab(state);
    lab.listeners.add(onEvent);
    ui.selected = null; ui.selectedEvent = null; ui.heat.key = null; anim.queue.length = 0;
    for (const t of ui.terms.values()) t.lines.length = 0;
    lab.reconcile();
    renderAll();
}
function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ scenario: scenarioKey, state })); } catch { /* storage unavailable */ } }
function changed() { lab.reconcile(); save(); renderAll(); }
const selectedDevice = () => ui.selected?.kind === 'device' ? lab.device(ui.selected.id) : null;
const selectedWall = () => ui.selected?.kind === 'wall' ? state.walls.find(w => w.id === ui.selected.id) : null;
function nextId(prefix) { let n = 1; while (state.devices.some(d => d.id === prefix + n) || state.walls.some(w => w.id === prefix + n)) n++; return prefix + n; }

function normalizeAp(ap) {
    const w = ap.wifi, std = STANDARDS[w.standard];
    if (!std.bands.includes(w.band)) w.band = std.bands.includes('5') ? '5' : std.bands[0];
    const widths = widthsFor(w.standard, w.band);
    if (!widths.includes(+w.width)) w.width = widths.filter(x => x <= +w.width).at(-1) ?? widths[0];
    const chans = channelsFor(w.band, +w.width);
    if (!chans.includes(+w.channel)) w.channel = chans.reduce((best, c) => Math.abs(c - w.channel) < Math.abs(best - w.channel) ? c : best, chans[0]);
    if (!std.gis.includes(+w.gi)) w.gi = 0.8;
    if (w.mcs !== 'auto' && +w.mcs > std.maxMcs) w.mcs = std.maxMcs;
}

// ---------- events & animation ----------
const anim = { queue: [], current: null, start: 0 };
let eventsDirty = false;
function onEvent(ev) {
    if (ui.anim !== 'off' && ev.medium === 'wifi') { anim.queue.push(ev); if (anim.queue.length > 30) anim.queue.splice(0, anim.queue.length - 30); }
    if (!eventsDirty) { eventsDirty = true; requestAnimationFrame(() => { eventsDirty = false; renderEvents(); renderClock(); }); }
}
function posOf(id) { const d = lab.device(id); return d ? { x: d.x, y: d.y } : null; }
function tick(ts) {
    const layer = document.getElementById('anim');
    if (!anim.current && anim.queue.length) { anim.current = anim.queue.shift(); anim.start = ts; }
    if (layer) {
        let html = '';
        const ev = anim.current;
        if (ev) {
            const dur = ui.anim === 'slow' ? 650 : 240, p = Math.min(1, (ts - anim.start) / dur), color = PROTO_COLORS[ev.proto] || '#94a3b8';
            const a = posOf(ev.from), b = ev.to ? posOf(ev.to) : null;
            if (a && b) {
                const fail = !ev.ok && p > .6, x = a.x + (b.x - a.x) * (fail ? .6 : p), y = a.y + (b.y - a.y) * (fail ? .6 : p);
                html = fail ? `<text x="${x}" y="${y + .2}" fill="var(--red)" font-size=".9" text-anchor="middle" font-weight="700">✕</text>` : `<circle class="packet" cx="${x}" cy="${y}" r=".32" fill="${color}"/>`;
            } else if (a) html = `<circle class="ring" cx="${a.x}" cy="${a.y}" r="${.5 + p * 9}" stroke="${color}" opacity="${1 - p}"/>`;
            if (p >= 1) anim.current = null;
        }
        layer.innerHTML = html;
    }
    requestAnimationFrame(tick);
}

// ---------- rendering ----------
function renderAll() { renderScenario(); renderEnv(); renderPlan(); renderInspector(); renderEvents(); renderAnalysis(); renderClock(); browser.render(); }
function renderAnalysis() {
    // OFDMA is an HE/EHT feature: the tab only exists while the focused AP runs Wi-Fi 6/6E/7.
    const ap = focusAp(), ofdma = ofdmaAvailable(ap);
    $('#bottom-tabs [data-bottom="ofdma"]').hidden = !ofdma;
    if (!ofdma && ui.bottom === 'ofdma') return showBottom('ofdm');
    if (ui.bottom === 'ofdma') renderOfdma($('#ofdma-view'), ui.ofdma, { lab, ap, dir: ui.dir });
    if (ui.bottom === 'metrics') renderMetrics($('#metrics-view'), lab, { dir: ui.dir, selectedId: ui.selected?.id });
    if (ui.bottom === 'plots') renderPlots($('#plots-view'), lab, { dir: ui.dir, focusAp: focusAp(), selected: selectedDevice() });
    if (ui.bottom === 'ofdm') { const c = ofdmClient(); renderOfdm($('#ofdm-view'), ui.ofdm, c, c ? lab.currentLink(c) : null); }
}
// The OFDM lab follows the selected client, or the first associated one.
function ofdmClient() { const d = selectedDevice(); if (d && d.type !== 'router') return d; return lab.clients.find(c => lab.currentLink(c)) || null; }
function showBottom(tab) {
    ui.bottom = tab;
    document.querySelectorAll('#bottom-tabs [data-bottom]').forEach(b => b.classList.toggle('active', b.dataset.bottom === tab));
    $('#events-view').hidden = tab !== 'events'; $('#metrics-view').hidden = tab !== 'metrics'; $('#plots-view').hidden = tab !== 'plots'; $('#ofdm-view').hidden = tab !== 'ofdm'; $('#ofdma-view').hidden = tab !== 'ofdma';
    $('#event-filters').hidden = tab !== 'events'; $('#metrics-filters').hidden = tab === 'events'; $('#dir-mode').hidden = tab === 'ofdm';
    if (['plots', 'ofdm', 'ofdma'].includes(tab) && bottomHeight() < 380) setBottomHeight(Math.round(innerHeight * .5));
    renderAnalysis();
}
const bottomHeight = () => parseInt(getComputedStyle(document.documentElement).getPropertyValue('--bottom-h')) || 250;
function setBottomHeight(h) {
    h = Math.max(140, Math.min(innerHeight - 220, h));
    document.documentElement.style.setProperty('--bottom-h', `${h}px`);
    try { localStorage.setItem('wifilab-bottom-h', h); } catch { /* ignore */ }
    if (['plots', 'ofdm', 'ofdma'].includes(ui.bottom)) renderAnalysis();
}
function renderClock() { $('#clock').textContent = `${(lab.now / 1000).toFixed(3)} s`; }
function renderScenario() {
    $('#scenario-select').innerHTML = Object.entries(SCENARIOS).map(([k, s]) => `<option value="${k}" ${k === scenarioKey ? 'selected' : ''}>${esc(s.name)}</option>`).join('') + (SCENARIOS[scenarioKey] ? '' : `<option selected value="custom">${esc(state.title || 'Personalizado (importado)')}</option>`);
    // A goal written by the teacher (shared link or imported file) wins over the scenario's own.
    $('#goal').textContent = state.goal || SCENARIOS[scenarioKey]?.goal || 'Cenário importado. Monte sua rede: adicione um roteador, configure SSID e DHCP e conecte os clientes.';
}
function renderEnv() {
    const e = state.env, f = (key, label, min, max, step, unit) => `<label class="row">${label}<input type="number" data-env="${key}" value="${e[key]}" min="${min}" max="${max}" step="${step}" title="${unit}"></label>`;
    $('#env-form').innerHTML = f('exponent', 'Expoente n', 1.6, 6, .1, 'perda log-distância: 2 = espaço livre, 3 = escritório') + f('noiseFigure', 'Fig. ruído (dB)', 0, 20, .5, 'figura de ruído do receptor') + f('extraNoise', 'Ruído extra (dB)', 0, 40, 1, 'eleva o piso de ruído') + f('implementationLoss', 'Perda impl. (dB)', 0, 10, .5, 'EVM/imperfeições do rádio');
}

const linkColor = sinr => sinr >= 25 ? 'var(--green)' : sinr >= 10 ? 'var(--amber)' : 'var(--red)';
function renderPlan() {
    const { width: W, height: H } = state.plan, svg = $('#plan');
    svg.setAttribute('viewBox', `-1 -1 ${W + 2} ${H + 2.4}`);
    let g = `<rect class="floor" x="0" y="0" width="${W}" height="${H}"/>`;
    for (let x = 1; x < W; x++) g += `<line class="gridline" x1="${x}" y1="0" x2="${x}" y2="${H}"/>`;
    for (let y = 1; y < H; y++) g += `<line class="gridline" x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;
    for (let x = 0; x <= W; x += 5) g += `<text class="scale" x="${x}" y="${H + .8}" text-anchor="middle">${x} m</text>`;
    const heat = heatmapImage();
    if (heat) g += `<image href="${heat}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none" opacity=".62"/>`;
    for (const w of state.walls) g += `<line class="wall ${ui.selected?.id === w.id ? 'selected' : ''}" data-wall="${w.id}" x1="${w.x1}" y1="${w.y1}" x2="${w.x2}" y2="${w.y2}" stroke="${MATERIALS[w.material].color}"><title>${MATERIALS[w.material].label}: ${MATERIALS[w.material].loss['2.4']}/${MATERIALS[w.material].loss['5']}/${MATERIALS[w.material].loss['6']} dB (2,4/5/6 GHz)</title></line>`;
    for (const c of lab.clients) {
        const l = lab.currentLink(c);
        if (!l) continue;
        const ip = lab.rt(c.id).ip, ok = ip && ip.source !== 'apipa', r = l.rates.dl, dx = c.x - l.ap.x, dy = c.y - l.ap.y, len = Math.hypot(dx, dy) || 1, side = dx >= 0 ? 1 : -1, mx = l.ap.x + dx * .45 + side * -dy / len * .55, my = l.ap.y + dy * .45 + side * dx / len * .55;
        g += `<line class="link ${ok ? '' : 'noip'}" x1="${l.ap.x}" y1="${l.ap.y}" x2="${c.x}" y2="${c.y}" stroke="${linkColor(l.dl.sinr)}"/>`;
        g += `<text class="link-label" x="${mx}" y="${my - .2}">${l.dl.sinr.toFixed(0)} dB · MCS ${r.mcs}×${r.nss} · ${r.rate.toFixed(0)} Mb/s</text>`;
    }
    for (const d of state.devices) {
        const isRouter = d.type === 'router', sel = ui.selected?.id === d.id;
        let sub, err = false;
        if (isRouter) { const e = apConfigError(d); sub = e ? '⚠ rádio inativo' : `${d.wifi.ssid} · ${d.wifi.band} GHz ch ${d.wifi.channel}`; err = !!e; }
        else { const ip = lab.rt(d.id).ip, assoc = lab.rt(d.id).assoc; sub = !assoc ? 'desconectado' : !ip ? 'sem IP' : ip.address + (ip.source === 'apipa' ? ' (APIPA)' : ''); err = !assoc || !ip || ip.source === 'apipa'; }
        g += `<g class="device ${d.type} ${isRouter ? 'router' : ''} ${sel ? 'selected' : ''}" data-device="${d.id}" transform="translate(${d.x} ${d.y})">
            <circle class="halo" r="1.25"/><rect class="body" x="-.85" y="-.85" width="1.7" height="1.7" rx=".4"/>
            <g class="glyph" transform="translate(-.7 -.7) scale(${1.4 / 24})" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text)">${ICONS[d.type]}</g>
            <text y="1.55">${esc(d.name)}</text><text class="sub ${err ? 'err' : ''}" y="2.1">${esc(sub)}</text></g>`;
    }
    if (ui.draft) g += `<line class="draft" x1="${ui.draft.x1}" y1="${ui.draft.y1}" x2="${ui.draft.x2}" y2="${ui.draft.y2}"/>`;
    g += '<g id="anim"></g>';
    svg.innerHTML = g;
    renderLegend();
}

// Downlink coverage of the focused AP, sampled on a grid and upscaled as an image.
function focusAp() {
    const d = selectedDevice();
    if (d?.type === 'router') return d;
    if (d) return lab.associatedAp(d) || lab.routers[0];
    return lab.routers[0];
}
const HEAT_STOPS = [[0, [59, 7, 100]], [.2, [185, 28, 28]], [.4, [245, 158, 11]], [.6, [132, 204, 22]], [.8, [16, 185, 129]], [1, [34, 211, 238]]];
function heatColor(t) {
    t = Math.max(0, Math.min(1, t));
    for (let i = 1; i < HEAT_STOPS.length; i++) if (t <= HEAT_STOPS[i][0]) { const [t0, a] = HEAT_STOPS[i - 1], [t1, b] = HEAT_STOPS[i], u = (t - t0) / (t1 - t0); return a.map((v, k) => Math.round(v + (b[k] - v) * u)); }
    return HEAT_STOPS.at(-1)[1];
}
function heatmapImage() {
    const ap = focusAp();
    if (ui.heatmap === 'off' || !ap || apConfigError(ap)) return null;
    const res = ui.drag?.kind === 'device' && lab.device(ui.drag.id)?.type === 'router' ? 1 : .5;
    const key = JSON.stringify([ui.heatmap, ap.id, res, state.env, state.walls, lab.routers.map(r => [r.x, r.y, r.wifi])]);
    if (ui.heat.key === key) return ui.heat.href;
    const { width: W, height: H } = state.plan, nx = Math.round(W / res), ny = Math.round(H / res);
    const canvas = document.createElement('canvas'); canvas.width = nx; canvas.height = ny;
    const ctx = canvas.getContext('2d'), img = ctx.createImageData(nx, ny);
    const probe = { id: '__probe', type: 'laptop', x: 0, y: 0, wifi: { standard: 'wifi7', streams: +ap.wifi.streams, txPower: 18 }, snrOverride: null };
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        probe.x = (i + .5) * res; probe.y = (j + .5) * res;
        const l = lab.link(ap, probe);
        let t, alpha = 255;
        if (ui.heatmap === 'sinr') t = (l.dl.sinr + 5) / 50;
        else { const r = l.rates?.dl; if (!r || r.per > .1) { t = 0; alpha = 90; } else t = (r.mcs + 1) / (STANDARDS[l.negotiation.standard].maxMcs + 1); }
        const [r, g, b] = heatColor(t), k = 4 * (j * nx + i);
        img.data[k] = r; img.data[k + 1] = g; img.data[k + 2] = b; img.data[k + 3] = alpha;
    }
    ctx.putImageData(img, 0, 0);
    ui.heat = { key, href: canvas.toDataURL() };
    return ui.heat.href;
}
function renderLegend() {
    const el = $('#legend'), ap = focusAp();
    if (ui.heatmap === 'off' || !ap) { el.hidden = true; return; }
    el.hidden = false;
    const bar = Array.from({ length: 24 }, (_, i) => `<i style="background:rgb(${heatColor(i / 23).join(',')})"></i>`).join('');
    const ticks = ui.heatmap === 'sinr' ? ['−5', '20', '45 dB'] : ['sem serviço', `MCS ${STANDARDS[ap.wifi.standard].maxMcs}`];
    el.innerHTML = `<div>${ui.heatmap === 'sinr' ? 'SINR de descida' : 'MCS máximo (PER ≤ 10%)'} · ${esc(ap.name)}${apConfigError(ap) ? ' (inativo)' : ''}</div><div class="bar">${bar}</div><div class="ticks">${ticks.map(t => `<span>${t}</span>`).join('')}</div>`;
}

// ---------- inspector ----------
const field = (label, input, hint = '') => `<label class="field">${label}${input}${hint ? `<span class="hint">${hint}</span>` : ''}</label>`;
const text = (path, value, extra = '') => `<input type="text" data-bind="${path}" value="${esc(value)}" ${extra}>`;
const num = (path, value, min, max, step = 1) => `<input type="number" data-bind="${path}" data-type="number" value="${value}" min="${min}" max="${max}" step="${step}">`;
const check = (path, value) => `<input type="checkbox" data-bind="${path}" data-type="bool" ${value ? 'checked' : ''}>`;
const select = (path, value, options, type = 'text') => `<select data-bind="${path}" data-type="${type}">${options.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${String(v) === String(value) ? 'selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`;
const metric = (label, value, small = '') => `<div class="metric"><span>${label}</span><strong>${value}</strong>${small ? `<small>${small}</small>` : ''}</div>`;
const tabs = (kind, list) => `<div class="tabs">${list.map(([k, l]) => `<button data-tab="${kind}:${k}" class="${ui.tab[kind] === k ? 'active' : ''}">${l}</button>`).join('')}</div>`;
const dbm = v => `${v.toFixed(1)} dBm`;

function channelLabel(band, width, c) {
    const f = centerFrequency(band, c);
    if (width === 20) return `${c} · ${f} MHz`;
    if (band === '2.4') return `${c} (${c - 2}+${c + 2}) · ${f} MHz`;
    const span = (width / 2 - 10) / 5;
    return `${c} (${c - span}–${c + span}) · ${f} MHz`;
}

function renderInspector() {
    const active = document.activeElement?.dataset?.bind, el = $('#inspector'), d = selectedDevice(), w = selectedWall();
    if (w) el.innerHTML = wallInspector(w);
    else if (!d) el.innerHTML = overview();
    else el.innerHTML = d.type === 'router' ? routerInspector(d) : clientInspector(d);
    if (active) el.querySelector(`[data-bind="${active}"]`)?.focus();
    if (d && d.type !== 'router' && ui.tab.client === 'link') drawLinkCharts(d);
}
function overview() {
    return `<p class="empty">Selecione um dispositivo na planta para configurá-lo, ou adicione um pela paleta à esquerda.</p>
    <div class="section">DISPOSITIVOS</div><div class="scan">${state.devices.map(d => `<div class="scan-item" data-select="${d.id}" style="cursor:pointer"><b>${esc(d.name)}</b><small>${TYPE_LABEL[d.type]}</small><small>${d.type === 'router' ? esc(d.wifi.ssid) + ' · ' + d.lan.ip : esc(lab.ipOf(d) || 'sem IP')}</small></div>`).join('')}</div>
    <div class="section" style="margin-top:14px">COMO FUNCIONA</div>
    <p class="empty">A SNR vem da potência, da perda de percurso log-distância (FSPL a 1 m + 10·n·log d), das paredes, do ruído térmico −174 dBm/Hz + 10·log B + NF e da interferência de canais sobrepostos. A PER de cada MCS usa a BER Gray de M-QAM com ganho de codificação; a taxa PHY é N<sub>ss</sub>·N<sub>sd</sub>·log₂M·R/(T<sub>sym</sub>+GI).</p>`;
}
function wallInspector(w) {
    const m = MATERIALS[w.material];
    return `<div class="ins-head"><strong>Parede</strong></div><div class="form">
        ${field('Material', select('material', w.material, Object.entries(MATERIALS).map(([k, v]) => [k, v.label])))}
        <p class="empty">Atenuação por travessia: ${m.loss['2.4']} dB (2,4 GHz) · ${m.loss['5']} dB (5 GHz) · ${m.loss['6']} dB (6 GHz). Frequências mais altas penetram menos.</p>
        <div class="actions"><button class="btn danger" data-action="delete">Excluir parede</button></div></div>`;
}
function head(d) { return `<div class="ins-head">${iconSvg(d.type, 30)}<input type="text" data-bind="name" value="${esc(d.name)}" aria-label="Nome"></div>`; }

function routerInspector(r) {
    const w = r.wifi, std = STANDARDS[w.standard], err = apConfigError(r), lanErr = lanConfigError(r);
    let body = '';
    if (ui.tab.router === 'wifi') {
        const maxRate = dataRate(w.standard, +w.width, std.maxMcs, +w.streams, +w.gi), [f0, f1] = [centerFrequency(w.band, +w.channel) - w.width / 2, centerFrequency(w.band, +w.channel) + w.width / 2];
        body = `${err ? `<div class="banner error">Rádio não transmite: ${esc(err)}</div>` : `<div class="banner ok">Transmitindo "${esc(w.ssid)}" · ${lab.clientsOf(r).length} cliente(s)</div>`}
        ${field('Rádio ligado', check('wifi.enabled', w.enabled))}
        ${field('SSID', text('wifi.ssid', w.ssid, 'maxlength="32"'))}
        ${field('Segurança', select('wifi.security', w.security, SECURITY_OPTIONS.map(s => [s, securityLabel(s, w.band)])))}
        ${w.security !== 'Aberta' ? field('Senha (PSK/SAE)', text('wifi.password', w.password)) : ''}
        <div class="section">RÁDIO</div>
        ${field('Padrão', select('wifi.standard', w.standard, STANDARD_ORDER.map(s => [s, STANDARDS[s].label])))}
        ${field('Banda', select('wifi.band', w.band, std.bands.map(b => [b, `${b} GHz`])))}
        ${field('Largura', select('wifi.width', w.width, widthsFor(w.standard, w.band).map(x => [x, `${x} MHz`]), 'number'))}
        ${field('Canal', select('wifi.channel', w.channel, channelsFor(w.band, +w.width).map(c => [c, channelLabel(w.band, +w.width, c)]), 'number'), `ocupa ${f0}–${f1} MHz`)}
        ${field('Potência Tx', num('wifi.txPower', w.txPower, 0, 30), 'dBm (EIRP = potência + ganho da antena)')}
        ${field('Ganho da antena', num('wifi.antennaGain', w.antennaGain, 0, 12, .5), 'dBi')}
        ${field('Fluxos espaciais', select('wifi.streams', w.streams, [1, 2, 3, 4, 8].filter(n => n <= std.maxStreams), 'number'), 'MIMO N×N')}
        ${field('Intervalo de guarda', select('wifi.gi', w.gi, std.gis.map(g => [g, `${g} µs`]), 'number'), `símbolo OFDM de ${std.symbol} µs`)}
        ${field('MCS', select('wifi.mcs', w.mcs, [['auto', 'Automático (adaptação de taxa)'], ...MCS.slice(0, std.maxMcs + 1).map((m, i) => [i, `MCS ${i} · ${m.label} ${m.code}`])]))}
        ${field('Carga do BSS', num('wifi.load', w.load, 0, 100, 5), '% do tempo no ar ocupado (afeta vizinhos)')}
        ${field('Isolamento', check('wifi.isolation', w.isolation), 'bloqueia tráfego cliente↔cliente')}
        <div class="metrics">${metric('Taxa PHY máxima', `${maxRate.toFixed(0)} Mb/s`, `MCS ${std.maxMcs} · ${w.streams} fluxo(s)`)}${metric('Subportadoras', std.subcarriers[w.width], `${std.short} · ${w.width} MHz`)}</div>`;
    } else if (ui.tab.router === 'lan') {
        const d = r.dhcp, size = isIp(d.start) && isIp(d.end) ? Math.max(0, ipToNum(d.end) - ipToNum(d.start) + 1) : 0;
        body = `${lanErr ? `<div class="banner error">${esc(lanErr)}</div>` : ''}
        <div class="section">LAN</div>
        ${field('IP do roteador', text('lan.ip', r.lan.ip))}
        ${field('Máscara', text('lan.mask', r.lan.mask), isIp(r.lan.mask) ? `/${prefixOf(r.lan.mask)}` : '')}
        <div class="section">SERVIDOR DHCP</div>
        ${field('DHCP ativo', check('dhcp.enabled', d.enabled))}
        ${field('Início da faixa', text('dhcp.start', d.start))}
        ${field('Fim da faixa', text('dhcp.end', d.end), `${size} endereço(s)`)}
        ${field('Lease (s)', num('dhcp.lease', d.lease, 60, 604800, 60), formatLease(d.lease))}
        ${field('DNS primário', text('dhcp.dns1', d.dns1), 'entregue na opção 6')}
        ${field('DNS secundário', text('dhcp.dns2', d.dns2))}
        <div class="section">WAN / INTERNET</div>
        ${field('WAN conectada', check('wan.connected', r.wan.connected))}
        ${field('IP WAN (NAT)', text('wan.ip', r.wan.ip))}
        ${field('Banda WAN', num('wan.bandwidth', r.wan.bandwidth, 1, 10000, 10), 'Mb/s')}`;
    } else if (ui.tab.router === 'dns') {
        body = `${field('Servidor DNS', check('dns.enabled', r.dns.enabled), 'responde nomes locais e encaminha os demais')}
        <div class="section">REGISTROS LOCAIS (A)</div>
        <table class="mini"><tr><th>Nome</th><th>IP</th><th></th></tr>${r.dns.records.map((rec, i) => `<tr><td><input data-bind="dns.records.${i}.name" value="${esc(rec.name)}"></td><td><input data-bind="dns.records.${i}.ip" value="${esc(rec.ip)}"></td><td><button class="btn danger" data-action="del-record" data-index="${i}">×</button></td></tr>`).join('')}</table>
        <div class="actions"><button class="btn" data-action="add-record">+ Registro</button></div>
        <div class="section">AUTOMÁTICOS (DHCP)</div>
        <table class="mini"><tr><th>Nome</th><th>IP</th></tr><tr><td>${lab.hostname(r)}.lan</td><td>${r.lan.ip}</td></tr>${lab.leases(r).filter(l => l.connected).map(l => `<tr><td>${esc(l.hostname)}.lan</td><td>${l.ip}</td></tr>`).join('')}</table>
        <p class="empty">Internet simulada: ${['google.com', 'ufpr.br', 'example.com', 'lseman.github.io', 'dns.google', 'iperf.lab'].join(', ')}.</p>`;
    } else {
        const clients = lab.clientsOf(r);
        body = `<div class="section">ASSOCIADOS</div>
        <table class="mini"><tr><th>Cliente</th><th>IP</th><th>SINR</th><th>MCS</th><th>Mb/s</th></tr>${clients.map(c => { const l = lab.link(r, c); return `<tr><td>${esc(c.name)}</td><td>${esc(lab.ipOf(c) || '—')}</td><td>${l.dl.sinr.toFixed(0)}</td><td>${l.rates.dl.mcs}×${l.rates.dl.nss}</td><td>${l.rates.dl.rate.toFixed(0)}</td></tr>`; }).join('') || '<tr><td colspan="5">nenhum</td></tr>'}</table>
        <div class="section" style="margin-top:10px">CONCESSÕES DHCP</div>
        <table class="mini"><tr><th>IP</th><th>MAC</th><th>Host</th><th>Estado</th></tr>${lab.leases(r).map(l => `<tr><td>${l.ip}</td><td>${l.mac}</td><td>${esc(l.hostname)}</td><td>${l.connected ? 'ativo' : 'livre'}</td></tr>`).join('') || '<tr><td colspan="4">nenhuma</td></tr>'}</table>`;
    }
    return `${head(r)}${tabs('router', [['wifi', 'Wi-Fi'], ['lan', 'LAN & DHCP'], ['dns', 'DNS'], ['clients', 'Clientes']])}<div class="form">${body}</div>
        <div class="actions"><button class="btn" data-action="terminal">Console</button><button class="btn" data-action="browser" title="Navegador num PC ligado à porta LAN">Página de administração</button><button class="btn danger" data-action="delete">Excluir</button></div>`;
}
const ipToNum = s => s.split('.').reduce((a, o) => a * 256 + +o, 0);

function clientInspector(c) {
    const rt = lab.rt(c.id), ap = lab.associatedAp(c), ip = rt.ip;
    const status = ap ? `<div class="banner ${ip && ip.source !== 'apipa' ? 'ok' : 'warn'}">Associado a "${esc(ap.wifi.ssid)}" (${esc(ap.name)})${ip ? ` · ${ip.address}${ip.source === 'apipa' ? ' — APIPA: DHCP falhou' : ''}` : ' · sem IP'}</div>` : `<div class="banner ${rt.last?.ok === false ? 'error' : 'warn'}">${rt.last?.ok === false ? esc(rt.last.message) : 'Não associado.'}</div>`;
    let body = '';
    if (ui.tab.client === 'wifi') {
        const scan = lab.scan(c);
        body = `${status}
        ${field('Padrão do rádio', select('wifi.standard', c.wifi.standard, STANDARD_ORDER.map(s => [s, STANDARDS[s].label])), `bandas: ${clientBands(c.wifi.standard).join(', ')} GHz`)}
        ${field('Fluxos (antenas)', select('wifi.streams', c.wifi.streams, [1, 2, 3, 4], 'number'))}
        ${field('Potência Tx', num('wifi.txPower', c.wifi.txPower, 0, 30), 'dBm (afeta o enlace de subida)')}
        <div class="section">REDE</div>
        ${field('SSID', text('wifi.ssid', c.wifi.ssid))}
        ${field('Senha', text('wifi.password', c.wifi.password))}
        ${field('Conectar sozinho', check('wifi.autoConnect', c.wifi.autoConnect))}
        <div class="actions"><button class="btn primary" data-action="connect">Conectar</button><button class="btn" data-action="disconnect" ${ap ? '' : 'disabled'}>Desconectar</button></div>
        <div class="section">REDES VISÍVEIS</div>
        <div class="scan">${scan.map(s => `<div class="scan-item"><b>${esc(s.ssid)} <span class="bars">${'▮'.repeat(Math.max(1, Math.min(4, Math.round((s.rssi + 90) / 12))))}</span></b><button class="btn" data-action="join" data-ap="${s.ap.id}">Conectar</button><small>${s.rssi.toFixed(0)} dBm · ${s.band} GHz ch ${s.channel} · ${s.width} MHz</small><small>${esc(s.security)}</small></div>`).join('') || '<p class="empty">Nenhuma rede ao alcance nas bandas suportadas.</p>'}</div>
        <div class="section">TESTE</div>
        ${field('SNR forçada', `<span style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-action-change="snr-toggle" ${c.snrOverride !== null ? 'checked' : ''}>${c.snrOverride !== null ? num('snrOverride', c.snrOverride, -5, 55, 1) : '<span class="hint" style="margin:0">usar o canal físico</span>'}</span>`, 'substitui a SINR calculada nos dois sentidos')}
        ${field('Firewall bloqueia ping', check('firewall', c.firewall))}`;
    } else if (ui.tab.client === 'ip') {
        const dup = lab.duplicates(c);
        body = `${status}${dup.length ? `<div class="banner error">Conflito de IP com ${esc(dup.map(d => d.name).join(', '))}.</div>` : ''}
        ${field('Modo', select('ip.mode', c.ip.mode, [['dhcp', 'Automático (DHCP)'], ['static', 'Estático']]))}
        ${c.ip.mode === 'static' ? field('Endereço IPv4', text('ip.address', c.ip.address)) + field('Máscara', text('ip.mask', c.ip.mask)) + field('Gateway', text('ip.gateway', c.ip.gateway)) + field('DNS', text('ip.dns', c.ip.dns)) : ''}
        <div class="section">EM USO</div>
        ${ip ? `<div class="metrics">${metric('IPv4', ip.address, `/${prefixOf(ip.mask)} · ${ip.source === 'dhcp' ? 'DHCP' : ip.source === 'apipa' ? 'APIPA' : 'estático'}`)}${metric('Gateway', ip.gateway || '—')}${metric('DNS', ip.dns.join(', ') || '—')}${metric('MAC', lab.mac(c))}</div>` : '<p class="empty">Sem configuração IP.</p>'}
        <div class="actions"><button class="btn" data-action="renew" ${ap && c.ip.mode === 'dhcp' ? '' : 'disabled'}>Renovar DHCP</button><button class="btn" data-action="release" ${ip?.source === 'dhcp' ? '' : 'disabled'}>Liberar</button></div>`;
    } else {
        const l = lab.currentLink(c);
        if (!l) body = `${status}<p class="empty">Conecte-se a uma rede para ver o enlace.</p>`;
        else {
            const n = l.negotiation, dl = l.rates.dl, ul = l.rates.ul, gp = aggregateGoodput(n.standard, n.width, dl.mcs, dl.nss, n.gi, dl.per) * (1 - l.utilization);
            body = `${status}
            <div class="metrics">
                ${metric('Distância', `${l.distance.toFixed(1)} m`, `perda ${l.pathLoss.toFixed(1)} dB${l.wallLoss ? ` (paredes ${l.wallLoss} dB)` : ''}`)}
                ${metric('Padrão negociado', STANDARDS[n.standard].short, `${n.width} MHz · ${n.nss}×${n.nss} · GI ${n.gi} µs`)}
                ${metric('RSSI desc./sub.', `${l.dl.rssi.toFixed(0)} / ${l.ul.rssi.toFixed(0)}`, 'dBm')}
                ${metric('Ruído + interf.', dbm(l.dl.noise), l.dl.interference !== null ? `interferência ${dbm(l.dl.interference)}` : 'sem interferência')}
                ${metric('SINR desc./sub.', `${l.dl.sinr.toFixed(1)} / ${l.ul.sinr.toFixed(1)}`, l.forced ? 'dB · SNR forçada' : 'dB')}
                ${metric('Canal ocupado', `${(100 * l.utilization).toFixed(0)}%`, 'BSSs co-canal (CSMA/CA)')}
                ${metric('MCS descida', `${dl.mcs} × ${dl.nss}`, `${MCS[dl.mcs].label} ${MCS[dl.mcs].code} · PER ${(100 * dl.per).toFixed(2)}%`)}
                ${metric('MCS subida', `${ul.mcs} × ${ul.nss}`, `${MCS[ul.mcs].label} ${MCS[ul.mcs].code} · PER ${(100 * ul.per).toFixed(2)}%`)}
                ${metric('Taxa PHY', `${dl.rate.toFixed(1)} Mb/s`, `subida ${ul.rate.toFixed(1)} Mb/s`)}
                ${metric('Vazão estimada', `${gp.toFixed(0)} Mb/s`, 'TCP com A-MPDU (descida)')}
                ${detectionMetrics(c)}
            </div>
            <div class="section">CONSTELAÇÃO RECEBIDA (DESCIDA, 1 FLUXO)</div>
            <canvas id="constellation" class="chart" width="700" height="460"></canvas>
            <div class="section">PER × SNR POR FLUXO (MPDU 1538 B)</div>
            <canvas id="per-chart" class="chart" width="700" height="420"></canvas>
            <div class="section">TABELA MCS · ${STANDARDS[n.standard].short} ${n.width} MHz · ${dl.nss} fluxo(s) · GI ${n.gi} µs</div>
            ${mcsTable(l)}`;
        }
    }
    return `${head(c)}${tabs('client', [['wifi', 'Wi-Fi'], ['ip', 'IP'], ['link', 'Enlace']])}<div class="form">${body}</div>
        <div class="actions"><button class="btn" data-action="terminal">Terminal</button><button class="btn" data-action="browser">Navegador</button><button class="btn danger" data-action="delete">Excluir</button></div>`;
}
function detectionMetrics(c) {
    const m = linkMetrics(lab, c, 'dl'), sci = v => v < 1e-15 ? '<1e-15' : v >= .01 ? v.toFixed(3) : v.toExponential(1);
    return metric('Es/N0 · Eb/N0', `${m.esn0.toFixed(1)} / ${m.ebn0.toFixed(1)}`, 'dB por fluxo · por bit de informação')
        + metric('BER bruta → pós-FEC', `${sci(m.rawBer)} → ${sci(m.ber)}`, `${m.modulation.label}, código ${m.modulation.code}`)
        + metric('Capacidade de Shannon', `${m.capacity.toFixed(0)} Mb/s`, `η = ${(100 * m.efficiency).toFixed(0)}% · ${m.spectralEfficiency.toFixed(2)} b/s/Hz por fluxo`)
        + metric('Retransmissões medidas', `${(100 * m.measured.retryRate).toFixed(1)}%`, `${m.measured.frames} quadros · ${m.measured.lost} perdidos`);
}
function mcsTable(l) {
    const n = l.negotiation, dl = l.rates.dl, max = STANDARDS[n.standard].maxMcs;
    const rows = MCS.slice(0, max + 1).map((m, i) => {
        const valid = mcsValid(n.standard, n.width, i, dl.nss), per = packetErrorRate(dl.streamSnr, i);
        return `<tr class="${i === dl.mcs ? 'chosen' : ''} ${valid ? '' : 'invalid'}"><td>${i}</td><td>${m.label}</td><td>${m.code}</td><td>${valid ? dataRate(n.standard, n.width, i, dl.nss, n.gi).toFixed(1) : '—'}</td><td>${requiredSnr(i).toFixed(1)}</td><td>${valid ? (per < 1e-4 ? '<0,01%' : (100 * per).toFixed(per > .1 ? 0 : 2) + '%') : '—'}</td></tr>`;
    }).join('');
    return `<table class="mini"><tr><th>MCS</th><th>Modulação</th><th>R</th><th>Mb/s</th><th>SNR mín.</th><th>PER agora</th></tr>${rows}</table><p class="empty">SNR mín.: SNR por fluxo para PER ≤ 10%. ${dl.nss > 1 ? `Com ${dl.nss} fluxos cada um recebe 1/${dl.nss} da potência (−${(10 * Math.log10(dl.nss)).toFixed(1)} dB).` : ''}</p>`;
}

const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
function drawLinkCharts(c) {
    const l = lab.currentLink(c);
    if (!l) return;
    const dl = l.rates.dl, m = MCS[dl.mcs];
    // Constellation from the Block Studio mappers + AWGN, at the per-stream SINR.
    const cv = $('#constellation');
    if (cv) {
        const ctx = cv.getContext('2d'), W = cv.width, H = cv.height, proc = createProcessors([]), r = rng(7 + dl.mcs), k = Math.log2(m.M);
        const count = m.M >= 1024 ? 2400 : 1200, bits = Array.from({ length: count * k }, () => r() < .5 ? 1 : 0);
        const node = (type, config) => ({ type, config: { ...Object.fromEntries(Object.entries(defs[type].config).map(([key, s]) => [key, s.value])), ...config } });
        const ideal = m.M === 2 ? proc.bpsk(node('bpsk', {}), { bits }).symbols : proc.qam(node('qam', { M: m.M }), { bits }).symbols;
        const rx = proc.awgn(node('awgn', { mode: 'SNR/amostra', snr: dl.streamSnr, seed: 11 }), { signal: ideal }).noisy.data;
        const lim = m.M === 2 ? 1.8 : 1.55, sx = v => W / 2 + v / lim * (W / 2 - 20), sy = v => H / 2 - v / lim * (H / 2 - 20);
        ctx.fillStyle = cssVar('--panel2'); ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = cssVar('--line'); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(W / 2, 10); ctx.lineTo(W / 2, H - 10); ctx.moveTo(10, H / 2); ctx.lineTo(W - 10, H / 2); ctx.stroke();
        ctx.fillStyle = cssVar('--cyan'); ctx.globalAlpha = .55;
        const dot = m.M >= 1024 ? 2.6 : 3.4;
        for (const z of rx) ctx.fillRect(sx(z.re) - dot / 2, sy(z.im) - dot / 2, dot, dot);
        ctx.globalAlpha = .9; ctx.fillStyle = cssVar('--amber');
        const seen = new Set();
        for (const z of ideal.data) { const key = z.re.toFixed(3) + z.im.toFixed(3); if (seen.has(key)) continue; seen.add(key); ctx.fillRect(sx(z.re) - 1, sy(z.im) - 1, 2, 2); }
        ctx.globalAlpha = 1;
        ctx.fillStyle = cssVar('--text'); ctx.font = '600 20px DM Sans, sans-serif';
        ctx.fillText(`${m.label} ${m.code} · SINR por fluxo ${dl.streamSnr.toFixed(1)} dB`, 16, 30);
    }
    // PER waterfall for each MCS with the operating point.
    const pv = $('#per-chart');
    if (pv) {
        const ctx = pv.getContext('2d'), W = pv.width, H = pv.height, n = l.negotiation, max = STANDARDS[n.standard].maxMcs;
        const x0 = 70, x1 = W - 16, y0 = 20, y1 = H - 50, sMin = -5, sMax = 50, sx = s => x0 + (s - sMin) / (sMax - sMin) * (x1 - x0), sy = p => y0 + (-Math.log10(Math.max(p, 1e-4)) / 4) * (y1 - y0);
        ctx.fillStyle = cssVar('--panel2'); ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = cssVar('--line'); ctx.fillStyle = cssVar('--dim'); ctx.font = '16px JetBrains Mono, monospace'; ctx.lineWidth = 1;
        for (let e = 0; e <= 4; e++) { const y = sy(10 ** -e); ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.fillText(`1e-${e}`, 8, y + 5); }
        for (let s = 0; s <= 50; s += 10) { const x = sx(s); ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); ctx.fillText(`${s}`, x - 9, y1 + 22); }
        ctx.fillText('SNR por fluxo (dB) →', x1 - 210, y1 + 44);
        for (let i = 0; i <= max; i++) {
            ctx.strokeStyle = `hsl(${200 - i * 14} 75% ${i === dl.mcs ? 60 : 52}%)`; ctx.lineWidth = i === dl.mcs ? 4 : 1.6; ctx.beginPath();
            for (let s = sMin; s <= sMax; s += .25) { const p = packetErrorRate(s, i), x = sx(s), y = sy(p); s === sMin ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
            ctx.stroke();
            const label = requiredSnr(i); if (label < sMax - 2) { ctx.fillStyle = ctx.strokeStyle; ctx.fillText(String(i), sx(label) - 4, sy(.1) - 8 - (i % 2) * 16); }
        }
        ctx.strokeStyle = cssVar('--red'); ctx.setLineDash([6, 5]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx(dl.streamSnr), y0); ctx.lineTo(sx(dl.streamSnr), y1); ctx.stroke(); ctx.setLineDash([]);
        ctx.strokeStyle = cssVar('--dim'); ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(x0, sy(.1)); ctx.lineTo(x1, sy(.1)); ctx.stroke(); ctx.setLineDash([]);
    }
}

// ---------- event log ----------
function deviceName(id) { if (!id) return 'difusão'; if (id === 'internet') return 'Internet'; return lab.device(id)?.name || id; }
function filteredEvents() {
    const sel = ui.onlySelected ? ui.selected?.id : null;
    return lab.events.filter(e => (!ui.protoFilter || e.proto === ui.protoFilter) && (!sel || e.from === sel || e.to === sel));
}
function phyText(e) {
    if (e.medium === 'wan') return 'WAN';
    if (!e.phy) return '';
    return e.phy.legacy ? 'legado 6 Mb/s' : `MCS${e.phy.mcs}×${e.phy.nss} ${e.phy.rate.toFixed(0)}`;
}
function renderEvents() {
    const body = $('#events'), wrap = body.closest('.event-table'), atBottom = wrap.scrollHeight - wrap.scrollTop - wrap.clientHeight < 30;
    const list = filteredEvents().slice(-500);
    $('#event-count').textContent = lab.events.length;
    body.innerHTML = list.map(e => {
        const sys = e.proto === 'Sistema', cls = [sys ? `sys ${e.level || ''}` : '', !e.ok && !sys ? 'fail' : '', e.attempts > 1 ? 'retry' : '', e.id === ui.selectedEvent ? 'sel' : ''].join(' ');
        return `<tr class="${cls}" data-event="${e.id}"><td>${e.t.toFixed(3)}</td><td>${esc(deviceName(e.from))}</td><td>${sys ? '' : esc(deviceName(e.to))}</td><td><span class="proto" style="color:${PROTO_COLORS[e.proto] || 'inherit'}">${e.proto}</span></td><td class="info">${esc(e.info)}${!e.ok && !sys ? ' — PERDIDO' : ''}</td><td>${phyText(e)}</td><td class="att">${e.attempts ?? ''}</td></tr>`;
    }).join('');
    if (atBottom) wrap.scrollTop = wrap.scrollHeight;
    renderEventDetail();
}
function renderEventDetail() {
    const el = $('#event-detail'), e = lab.events.find(x => x.id === ui.selectedEvent);
    if (!e) { el.innerHTML = '<div class="placeholder">Clique em um quadro para ver as camadas (802.11, IP, UDP, DHCP…) e a camada física usada.</div>'; return; }
    const layer = (name, fields) => `<div class="layer"><h4>${esc(name)}</h4>${fields.map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>`;
    let html = `<div style="margin-bottom:8px;color:var(--text)">#${e.id} · t = ${e.t.toFixed(3)} ms · ${esc(e.info)}</div>`;
    if (e.phy) {
        const p = e.phy, fields = p.legacy ? [['Modo', 'OFDM legado (não-HT) 6 Mb/s · BPSK 1/2'], ['Largura', '20 MHz (primário)']] : [['Padrão', STANDARDS[p.standard].label], ['MCS', `${p.mcs} · ${MCS[p.mcs].label} ${MCS[p.mcs].code}`], ['Fluxos espaciais', p.nss], ['Largura', `${p.width} MHz`], ['Intervalo de guarda', `${p.gi} µs`], ['Taxa PHY', `${p.rate.toFixed(1)} Mb/s`]];
        html += layer('Camada física', [...fields, ['Sentido', e.dir === 'dl' ? 'descida (AP → cliente)' : 'subida (cliente → AP)'], ['SINR', `${p.snr.toFixed(1)} dB`], ['PER por tentativa', `${(100 * p.per).toFixed(3)}%`], ['Tentativas', `${e.attempts}${e.kind === 'bcast' ? ' (difusão: sem ACK, sem retransmissão)' : ''}`], ['Tempo no ar', `${e.airtime.toFixed(0)} µs (inclui DIFS, backoff e ACK)`], ['Tamanho', `${e.bytes} bytes`], ['Resultado', e.ok ? 'entregue' : 'perdido após todas as tentativas']]);
    }
    for (const l of e.layers || []) html += layer(l.name, l.fields);
    el.innerHTML = html;
}

// ---------- terminal ----------
const promptOf = d => d.type === 'router' ? `${lab.hostname(d)}#` : d.os === 'windows' ? 'C:\\Users\\aluno>' : d.os === 'android' ? `${lab.hostname(d)}:/ $` : `aluno@${lab.hostname(d)}:~$`;
function termData(id) { if (!ui.terms.has(id)) ui.terms.set(id, { lines: [], history: [], index: 0 }); return ui.terms.get(id); }
function openTerminal(d) {
    ui.terminalFor = d.id;
    const t = termData(d.id);
    if (!t.lines.length) t.lines.push(d.type === 'router' ? `${d.name} — console do roteador. Digite help.` : `${d.name} (${TYPE_LABEL[d.type]}) — digite help para ver os comandos.`, '');
    $('#terminal').hidden = false;
    renderTerminal();
    $('#term-in').focus();
}
function renderTerminal() {
    const d = lab.device(ui.terminalFor);
    if (!d) { $('#terminal').hidden = true; return; }
    $('#term-title').textContent = d.name;
    $('#term-sub').textContent = d.type === 'router' ? d.lan.ip : (lab.ipOf(d) || 'sem IP');
    $('#term-prompt').textContent = promptOf(d);
    const out = $('#term-out'); out.textContent = termData(d.id).lines.join('\n'); out.scrollTop = out.scrollHeight;
}
let revealing = false;
function submitCommand(line) {
    const d = lab.device(ui.terminalFor), t = termData(d.id);
    t.lines.push(`${promptOf(d)} ${line}`);
    if (line.trim()) { t.history.push(line); t.index = t.history.length; }
    if (/^(cls|clear)$/i.test(line.trim())) { t.lines.length = 0; renderTerminal(); return; }
    const out = runCommand(lab, d, line), slow = /^(ping|tracert|traceroute|iperf3?)\b/i.test(line.trim());
    save(); renderAll();
    if (!slow) { t.lines.push(...out, ''); renderTerminal(); return; }
    revealing = true; $('#term-in').disabled = true;
    let i = 0;
    const step = () => {
        if (i < out.length) { t.lines.push(out[i++]); renderTerminal(); setTimeout(step, out[i - 1] === '' ? 40 : 160); }
        else { t.lines.push(''); revealing = false; $('#term-in').disabled = false; $('#term-in').focus(); renderTerminal(); }
    };
    step();
}

// ---------- shareable links ----------
const shareBase = () => location.origin + location.pathname;
// Unchanged built-in scenarios get the short #cenario= link; anything else carries the full state.
async function shareLink() {
    const pristine = SCENARIOS[scenarioKey] && !state.title && !state.goal && JSON.stringify(state) === JSON.stringify(SCENARIOS[scenarioKey].build());
    return pristine ? scenarioLink(shareBase(), scenarioKey) : labLink(shareBase(), await encodeShare({ title: state.title, goal: state.goal, state }));
}
async function refreshShareDialog() {
    const link = await shareLink();
    $('#share-link').value = link;
    $('#share-info').textContent = `${link.length} caracteres${link.length > 6000 ? ' — link longo: alguns sistemas podem cortá-lo; prefira Exportar JSON.' : ''} · contém a configuração completa, inclusive senhas.`;
}
function openShareDialog() {
    $('#share-title').value = state.title || (SCENARIOS[scenarioKey]?.name ?? '');
    $('#share-goal').value = state.goal || SCENARIOS[scenarioKey]?.goal || '';
    $('#share-copy').textContent = 'Copiar link';
    $('#share-dialog').showModal();
    refreshShareDialog();
}
// Title and goal typed in the dialog become part of this network (and of the link).
function editShareText() {
    const title = $('#share-title').value.trim(), goal = $('#share-goal').value.trim();
    state.title = title && title !== SCENARIOS[scenarioKey]?.name ? title : undefined;
    state.goal = goal && goal !== SCENARIOS[scenarioKey]?.goal ? goal : undefined;
    save(); renderScenario(); refreshShareDialog();
}
function showNotice(html, undo) {
    const el = $('#share-note');
    el.innerHTML = `<span>${html}</span>${undo ? '<button class="btn" data-note="undo">Desfazer</button>' : ''}<button class="btn" data-note="close" title="Fechar">×</button>`;
    el.hidden = false;
    el.onclick = e => {
        const a = e.target.closest('[data-note]')?.dataset.note;
        if (a === 'undo') {
            try { load(undo.state, undo.scenario || 'custom'); save(); }
            catch { alert('A sessão anterior não pôde ser restaurada.'); }
        }
        if (a) el.hidden = true;
    };
}
// Opening a shared link replaces the session (kept for undo) and strips the hash, so reloading keeps progress.
async function loadFromHash() {
    const req = parseShareHash(location.hash);
    if (!req) return;
    history.replaceState(null, '', location.pathname + location.search);
    let previous = null;
    try { previous = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { /* ignore */ }
    try {
        let title;
        if (req.scenario) {
            if (!SCENARIOS[req.scenario]) throw Error(`o cenário "${req.scenario}" não existe`);
            load(SCENARIOS[req.scenario].build(), req.scenario); title = SCENARIOS[req.scenario].name;
        } else {
            const p = await decodeShare(req.lab), s = p.state;
            s.walls ||= []; s.plan ||= { width: 40, height: 24 };
            if (p.title) s.title = p.title;
            if (p.goal) s.goal = p.goal;
            load(s, 'custom'); title = p.title;
        }
        save();
        showNotice(`Rede compartilhada carregada${title ? `: <b>${esc(title)}</b>` : ''}. Leia o objetivo no painel à esquerda.`, previous?.state?.devices ? previous : null);
    } catch (err) {
        showNotice(`Não foi possível abrir o link compartilhado: ${esc(err.message)}. O link pode ter sido cortado ao ser copiado.`);
    }
}

// ---------- interaction ----------
function svgPoint(evt) { const svg = $('#plan'), p = svg.createSVGPoint(); p.x = evt.clientX; p.y = evt.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }
const clampX = x => Math.max(.5, Math.min(state.plan.width - .5, x)), clampY = y => Math.max(.5, Math.min(state.plan.height - .5, y));
const snap = v => Math.round(v * 2) / 2;
let planFrame = 0;
const schedulePlan = () => { if (!planFrame) planFrame = requestAnimationFrame(() => { planFrame = 0; renderPlan(); if (ui.drag) renderAnalysis(); }); };

function bind() {
    $('#palette').innerHTML = Object.keys(TYPE_LABEL).map(t => `<button data-add="${t}" title="Adicionar ${TYPE_LABEL[t]}">${iconSvg(t)}<span>${TYPE_LABEL[t]}</span></button>`).join('');
    $('#palette').onclick = e => { const t = e.target.closest('[data-add]')?.dataset.add; if (t) addDevice(t); };
    $('#wall-material').innerHTML = Object.entries(MATERIALS).map(([k, v]) => `<option value="${k}">${v.label} (${v.loss['2.4']}/${v.loss['5']}/${v.loss['6']} dB)</option>`).join('');
    $('#wall-material').onchange = e => { ui.material = e.target.value; };
    $('#tool-mode').onclick = e => { const t = e.target.closest('[data-tool]')?.dataset.tool; if (!t) return; ui.tool = t; document.querySelectorAll('#tool-mode button').forEach(b => b.classList.toggle('active', b.dataset.tool === t)); };
    $('#heatmap-mode').onchange = e => { ui.heatmap = e.target.value; renderPlan(); };
    $('#anim-mode').onchange = e => { ui.anim = e.target.value; anim.queue.length = 0; };
    $('#env-form').onchange = e => { const k = e.target.dataset.env; if (k) { state.env[k] = +e.target.value; changed(); } };
    $('#scenario-select').onchange = e => { const k = e.target.value; if (SCENARIOS[k]) { load(SCENARIOS[k].build(), k); save(); } };
    $('#reset-btn').onclick = () => { if (SCENARIOS[scenarioKey] && confirm('Recarregar o cenário original? As alterações serão perdidas.')) { load(SCENARIOS[scenarioKey].build(), scenarioKey); save(); } };
    $('#export-btn').onclick = () => { const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'wifi-lab.json'; a.click(); URL.revokeObjectURL(a.href); };
    $('#share-btn').onclick = openShareDialog;
    $('#share-title').oninput = $('#share-goal').oninput = editShareText;
    $('#share-copy').onclick = async () => {
        const input = $('#share-link');
        try { await navigator.clipboard.writeText(input.value); } catch { input.select(); document.execCommand('copy'); }
        $('#share-copy').textContent = 'Copiado ✓';
    };
    addEventListener('hashchange', loadFromHash);
    $('#import-btn').onclick = () => $('#import-file').click();
    $('#import-file').onchange = async e => {
        const file = e.target.files[0]; e.target.value = '';
        if (!file) return;
        try { const s = JSON.parse(await file.text()); if (!Array.isArray(s.devices)) throw Error('sem lista de dispositivos'); s.walls ||= []; s.plan ||= { width: 40, height: 24 }; load(s, 'custom'); save(); }
        catch (err) { alert(`Arquivo inválido: ${err.message}`); }
    };
    const root = document.documentElement;
    root.dataset.theme = localStorage.getItem('commslab-theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    $('#theme-btn').onclick = () => { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('commslab-theme', root.dataset.theme); } catch { /* ignore */ } renderInspector(); };

    const svg = $('#plan');
    svg.addEventListener('pointerdown', e => {
        const p = svgPoint(e), devEl = e.target.closest('[data-device]'), wallEl = e.target.closest('[data-wall]');
        if (ui.tool === 'wall' && !devEl) { ui.draft = { x1: snap(clampX(p.x)), y1: snap(clampY(p.y)), x2: snap(clampX(p.x)), y2: snap(clampY(p.y)) }; svg.setPointerCapture(e.pointerId); return; }
        if (devEl) {
            const d = lab.device(devEl.dataset.device);
            ui.selected = { kind: 'device', id: d.id };
            ui.drag = { kind: 'device', id: d.id, dx: d.x - p.x, dy: d.y - p.y, moved: false };
            svg.setPointerCapture(e.pointerId);
        } else if (wallEl) ui.selected = { kind: 'wall', id: wallEl.dataset.wall };
        else ui.selected = null;
        renderPlan(); renderInspector(); if (ui.onlySelected) renderEvents();
    });
    svg.addEventListener('pointermove', e => {
        const p = svgPoint(e);
        if (ui.draft) { ui.draft.x2 = snap(clampX(p.x)); ui.draft.y2 = snap(clampY(p.y)); schedulePlan(); return; }
        if (ui.drag) { const d = lab.device(ui.drag.id); d.x = +clampX(p.x + ui.drag.dx).toFixed(2); d.y = +clampY(p.y + ui.drag.dy).toFixed(2); ui.drag.moved = true; schedulePlan(); }
    });
    const end = () => {
        if (ui.draft) {
            const w = ui.draft; ui.draft = null;
            if (Math.hypot(w.x2 - w.x1, w.y2 - w.y1) >= .5) { const id = nextId('w'); state.walls.push({ id, ...w, material: ui.material }); ui.selected = { kind: 'wall', id }; changed(); } else renderPlan();
            return;
        }
        if (ui.drag) { const moved = ui.drag.moved; ui.drag = null; if (moved) changed(); }
    };
    svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
    svg.addEventListener('dblclick', e => { const id = e.target.closest('[data-device]')?.dataset.device; if (id) openTerminal(lab.device(id)); });

    const ins = $('#inspector');
    ins.addEventListener('change', e => {
        const el = e.target;
        if (el.dataset.actionChange === 'snr-toggle') { const d = selectedDevice(); d.snrOverride = el.checked ? 20 : null; changed(); return; }
        const path = el.dataset.bind; if (!path) return;
        const target = selectedWall() || selectedDevice();
        let v = el.type === 'checkbox' ? el.checked : el.value;
        if (el.dataset.type === 'number') v = +v;
        if (path === 'wifi.mcs' && v !== 'auto') v = +v;
        if (path === 'snrOverride') v = +v;
        setPath(target, path, v);
        if (target.type === 'router') normalizeAp(target);
        changed();
    });
    ins.addEventListener('click', e => {
        const tab = e.target.closest('[data-tab]')?.dataset.tab;
        if (tab) { const [kind, k] = tab.split(':'); ui.tab[kind] = k; renderInspector(); return; }
        const pick = e.target.closest('[data-select]')?.dataset.select;
        if (pick) { ui.selected = { kind: 'device', id: pick }; renderPlan(); renderInspector(); return; }
        const btn = e.target.closest('[data-action]'); if (!btn) return;
        const d = selectedDevice(), action = btn.dataset.action;
        if (action === 'delete') return deleteSelected();
        if (action === 'terminal') return openTerminal(d);
        if (action === 'browser') return browser.open(d);
        if (action === 'connect') { d.wifi.autoConnect = true; lab.connect(d); }
        if (action === 'join') {
            const ap = lab.device(btn.dataset.ap);
            let pass = d.wifi.password;
            if (ap.wifi.security !== 'Aberta') { const input = prompt(`Senha para "${ap.wifi.ssid}"`, d.wifi.ssid === ap.wifi.ssid ? pass : ''); if (input === null) return; pass = input; }
            d.wifi.autoConnect = true; lab.connect(d, ap.wifi.ssid, pass);
        }
        if (action === 'disconnect') { d.wifi.autoConnect = false; lab.disconnect(d); }
        if (action === 'renew') lab.dhcp(d);
        if (action === 'release') lab.release(d);
        if (action === 'add-record') d.dns.records.push({ name: 'novo.lan', ip: d.lan.ip });
        if (action === 'del-record') d.dns.records.splice(+btn.dataset.index, 1);
        changed();
    });

    $('#bottom-tabs').onclick = e => { const t = e.target.closest('[data-bottom]')?.dataset.bottom; if (t) showBottom(t); };
    $('#dir-mode').onclick = e => { const d = e.target.closest('[data-dir]')?.dataset.dir; if (!d) return; ui.dir = d; document.querySelectorAll('#dir-mode button').forEach(b => b.classList.toggle('active', b.dataset.dir === d)); renderAnalysis(); };
    $('#metrics-view').onclick = e => { const id = e.target.closest('[data-select]')?.dataset.select; if (id) { ui.selected = { kind: 'device', id }; renderAll(); } };
    document.querySelectorAll('.expand-btn').forEach(b => { b.onclick = () => setBottomHeight(bottomHeight() < innerHeight * .45 ? Math.round(innerHeight * .62) : 250); });
    try { const h = +localStorage.getItem('wifilab-bottom-h'); if (h) setBottomHeight(h); } catch { /* ignore */ }
    $('#bottom-resizer').addEventListener('pointerdown', e => {
        const start = e.clientY, h0 = bottomHeight(), bar = e.target; bar.classList.add('active'); bar.setPointerCapture(e.pointerId);
        const move = ev => setBottomHeight(h0 + start - ev.clientY), up = () => { bar.classList.remove('active'); bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up); };
        bar.addEventListener('pointermove', move); bar.addEventListener('pointerup', up);
    });
    addEventListener('resize', () => { if (['plots', 'ofdm', 'ofdma'].includes(ui.bottom)) renderAnalysis(); });
    $('#ofdm-view').addEventListener('change', e => {
        const el = e.target, key = el.dataset.ofdm; if (!key) return;
        const o = ui.ofdm;
        if (key === 'follow') { if (!el.checked) { const c = ofdmClient(); Object.assign(o, ofdmParams(o, c ? lab.currentLink(c) : null)); } o.follow = el.checked; }
        else if (key === 'pilotTracking') o.pilotTracking = el.checked;
        else if (key === 'cfo') o.cfo = Math.max(0, +el.value) / 100;
        else if (['width', 'gi', 'M', 'snrDb', 'symbols'].includes(key)) o[key] = +el.value;
        else o[key] = el.value;
        renderAnalysis();
    });
    $('#ofdm-view').addEventListener('click', e => { if (e.target.closest('[data-ofdm-action="reseed"]')) { ui.ofdm.seed++; renderAnalysis(); } });
    $('#ofdma-view').addEventListener('change', e => {
        const key = e.target.dataset.ofdma; if (!key) return;
        const v = e.target.value, o = ui.ofdma;
        if (key === 'ruTones') o.ruTones = v === 'auto' ? 'auto' : +v;
        else if (key === 'bytes') o.bytes = Math.min(1500, Math.max(40, +v || 200));
        else if (key === 'extra') o.extra = Math.min(72, Math.max(0, Math.round(+v) || 0));
        renderAnalysis();
    });
    $('#ofdma-view').addEventListener('click', e => { if (e.target.closest('[data-ofdma-action="reseed"]')) { ui.ofdma.seed++; renderAnalysis(); } });
    $('#proto-filter').onchange = e => { ui.protoFilter = e.target.value; renderEvents(); };
    $('#only-selected').onchange = e => { ui.onlySelected = e.target.checked; renderEvents(); };
    $('#clear-log').onclick = () => { lab.events.length = 0; ui.selectedEvent = null; renderEvents(); };
    $('#events').onclick = e => { const id = +e.target.closest('[data-event]')?.dataset.event; if (id) { ui.selectedEvent = id; renderEvents(); } };

    $('#term-close').onclick = () => { $('#terminal').hidden = true; ui.terminalFor = null; };
    $('#term-in').addEventListener('keydown', e => {
        const t = termData(ui.terminalFor);
        if (e.key === 'Enter' && !revealing) { const v = e.target.value; e.target.value = ''; submitCommand(v); }
        else if (e.key === 'ArrowUp') { t.index = Math.max(0, t.index - 1); e.target.value = t.history[t.index] || ''; e.preventDefault(); }
        else if (e.key === 'ArrowDown') { t.index = Math.min(t.history.length, t.index + 1); e.target.value = t.history[t.index] || ''; e.preventDefault(); }
        else if (e.key === 'Escape') $('#term-close').click();
    });
    // Floating windows (terminal, browser) are dragged by their title bar.
    for (const win of [$('#terminal'), $('#browser')]) win.querySelector('.term-head').addEventListener('pointerdown', e => {
        if (e.target.closest('button')) return;
        const r = win.getBoundingClientRect(), ox = e.clientX - r.left, oy = e.clientY - r.top;
        const move = ev => { win.style.left = `${Math.max(0, ev.clientX - ox)}px`; win.style.top = `${Math.max(0, ev.clientY - oy)}px`; };
        const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); };
        addEventListener('pointermove', move); addEventListener('pointerup', up);
    });
    browser.bind();
    addEventListener('keydown', e => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && !e.target.closest('input,select,textarea') && ui.selected) { e.preventDefault(); deleteSelected(); }
    });
}
function setPath(obj, path, value) { const keys = path.split('.'), last = keys.pop(); let o = obj; for (const k of keys) o = o[k]; o[last] = value; }

function addDevice(type) {
    const n = state.devices.filter(d => d.type === type).length + 1, x = 8 + ((n * 7) % 24), y = 5 + ((n * 5) % 14);
    let d;
    if (type === 'router') {
        const net = state.devices.filter(d => d.type === 'router').length;
        d = makeRouter(nextId('r'), n > 1 ? `Roteador ${n}` : 'Roteador', x, y, { wifi: { ssid: net ? `LabWiFi-${net + 1}` : 'LabWiFi' }, lan: { ip: `192.168.${net}.1` }, dhcp: { start: `192.168.${net}.100`, end: `192.168.${net}.199`, dns1: `192.168.${net}.1` } });
    } else d = makeClient(nextId('c'), type, `${CLIENT_TYPES[type].label} ${n}`, x, y);
    state.devices.push(d);
    ui.selected = { kind: 'device', id: d.id };
    if (type !== 'router') ui.tab.client = 'wifi';
    changed();
}
function deleteSelected() {
    const w = selectedWall(), d = selectedDevice();
    if (w) state.walls = state.walls.filter(x => x !== w);
    if (d) {
        if (d.type !== 'router') lab.disconnect(d, 'Dispositivo removido');
        else for (const c of lab.clientsOf(d)) lab.disconnect(c, 'AP removido');
        state.devices = state.devices.filter(x => x !== d);
        lab.runtime.delete(d.id);
        if (ui.terminalFor === d.id) { $('#terminal').hidden = true; ui.terminalFor = null; }
    }
    ui.selected = null;
    changed();
}

// ---------- boot ----------
bind();
let saved = null;
try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { /* ignore */ }
// A session saved by an older build may no longer load; drop it instead of leaving the page dead.
try {
    if (saved?.state?.devices) load(saved.state, saved.scenario || 'custom');
    else load(SCENARIOS.first.build(), 'first');
} catch (err) {
    console.warn('Wi-Fi Lab: sessão salva incompatível, carregando o cenário inicial.', err);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    load(SCENARIOS.first.build(), 'first');
}
loadFromHash();
requestAnimationFrame(tick);
// Handle for the browser console (and automated checks) to inspect the engine.
const VERSION = '7';
window.wifiLab = { version: VERSION, get lab() { return lab; }, ui, renderAll, openTerminal, submitCommand, browser, select: id => { ui.selected = { kind: 'device', id }; renderAll(); } };
