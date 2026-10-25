// Network engine: association + security, DHCP, ARP, DNS, ICMP routing/NAT and a frame log.
// All radio frames go through `transmit`, which draws success per attempt from the PHY PER.
import { rng } from '../sim/utils.js';
import {
    STANDARDS, MCS, MATERIALS, centerFrequency, channelsFor, widthsFor, effectiveStandard, clientBands,
    pathLoss, wallLoss, thermalNoiseDbm, dbmToMw, mwToDbm, spectralOverlap, selectRate, packetErrorRate,
    streamSnr, ppduAirtime, legacyAirtime, aggregateGoodput, TIMING, dataRate,
} from './phy.mjs';

// ---------- IPv4 helpers ----------
export const isIp = s => typeof s === 'string' && /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(s.trim()) && s.trim().split('.').every(o => +o <= 255);
export const ipToInt = s => s.trim().split('.').reduce((a, o) => (a * 256) + +o, 0);
export const intToIp = n => [24, 16, 8, 0].map(b => Math.floor(n / 2 ** b) % 256).join('.');
export const isMask = s => { if (!isIp(s)) return false; const n = ipToInt(s), inv = 2 ** 32 - 1 - n; return ((inv + 1) & inv) === 0 || inv === 2 ** 32 - 1; };
export const prefixOf = mask => { let n = ipToInt(mask), p = 0; while (n >= 2 ** 31) { p++; n = (n - 2 ** 31) * 2; } return p; };
const networkOf = (ip, mask) => ipToInt(ip) - (ipToInt(ip) % 2 ** (32 - prefixOf(mask)));
export const sameSubnet = (a, b, mask) => isIp(a) && isIp(b) && isMask(mask) && networkOf(a, mask) === networkOf(b, mask);
export const parseUrl = url => { const m = /^(?:https?:\/\/)?([^/:?#\s]+)(?::\d+)?(\/[^?#\s]*)?$/i.exec(String(url).trim()); return m ? { host: m[1].toLowerCase(), path: m[2] || '/' } : null; };
export const hostnameOf = name => String(name).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'host';

// ---------- Simulated Internet (addresses are illustrative) ----------
export const INTERNET = [
    { ip: '8.8.8.8', names: ['dns.google'], latency: 12, ttl: 117, dns: true },
    { ip: '1.1.1.1', names: ['one.one.one.one'], latency: 9, ttl: 57, dns: true },
    { ip: '142.250.79.46', names: ['google.com', 'www.google.com'], latency: 14, ttl: 117 },
    { ip: '200.17.209.20', names: ['ufpr.br', 'www.ufpr.br'], latency: 6, ttl: 58 },
    { ip: '185.199.108.153', names: ['lseman.github.io'], latency: 22, ttl: 56 },
    { ip: '93.184.215.14', names: ['example.com', 'www.example.com'], latency: 118, ttl: 52 },
    { ip: '45.33.32.156', names: ['iperf.lab'], latency: 8, ttl: 60, iperf: true },
];
const internetByIp = ip => INTERNET.find(h => h.ip === ip);
const internetByName = name => INTERNET.find(h => h.names.includes(name));
const ISP_HOPS = ['100.64.0.1', '187.85.160.1', '170.84.32.9'];

// ---------- Device factories ----------
export const CLIENT_TYPES = {
    laptop: { label: 'Notebook', os: 'windows', standard: 'wifi6', streams: 2, txPower: 18 },
    phone: { label: 'Celular', os: 'android', standard: 'wifi6', streams: 2, txPower: 15 },
    desktop: { label: 'Desktop', os: 'linux', standard: 'wifi5', streams: 2, txPower: 20 },
    printer: { label: 'Impressora', os: 'embedded', standard: 'wifi4', streams: 1, txPower: 14 },
};
export function makeRouter(id, name, x, y, over = {}) {
    return deepMerge({
        id, type: 'router', name, x, y,
        wifi: { enabled: true, ssid: 'LabWiFi', security: 'WPA2/WPA3', password: 'senha1234', standard: 'wifi6', band: '5', channel: 42, width: 80, txPower: 20, antennaGain: 3, streams: 2, gi: 0.8, mcs: 'auto', isolation: false, load: 20 },
        lan: { ip: '192.168.0.1', mask: '255.255.255.0' },
        dhcp: { enabled: true, start: '192.168.0.100', end: '192.168.0.199', lease: 86400, dns1: '192.168.0.1', dns2: '' },
        dns: { enabled: true, records: [] },
        wan: { connected: true, ip: '100.64.12.34', bandwidth: 500 },
        admin: { user: 'admin', password: 'admin' },
    }, over);
}
export function makeClient(id, type, name, x, y, over = {}) {
    const t = CLIENT_TYPES[type];
    return deepMerge({
        id, type, name, x, y, os: t.os,
        wifi: { standard: t.standard, streams: t.streams, txPower: t.txPower, ssid: '', password: '', autoConnect: true },
        ip: { mode: 'dhcp', address: '', mask: '255.255.255.0', gateway: '', dns: '' },
        snrOverride: null, firewall: false,
    }, over);
}
function deepMerge(base, over) {
    for (const [k, v] of Object.entries(over || {})) base[k] = v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object' ? deepMerge(base[k], v) : v;
    return base;
}
export const defaultEnvironment = () => ({ exponent: 3, noiseFigure: 7, extraNoise: 0, implementationLoss: 2 });

const SECURITY_LABEL = { Aberta: 'Aberta', WPA2: 'WPA2-Personal (PSK)', WPA3: 'WPA3-Personal (SAE)', 'WPA2/WPA3': 'WPA2/WPA3 (transição)' };
export const SECURITY_OPTIONS = Object.keys(SECURITY_LABEL);
export const securityLabel = (sec, band) => sec === 'Aberta' && band === '6' ? 'Aberta (OWE)' : SECURITY_LABEL[sec];
const clientSupportsWpa3 = c => STANDARDS[c.wifi.standard].wpa3 || c.wifi.wpa3 === true;
const ttlOf = dev => dev.type === 'router' ? 64 : dev.os === 'windows' ? 128 : dev.os === 'embedded' ? 255 : 64;

export function apConfigError(ap) {
    const w = ap.wifi, std = STANDARDS[w.standard];
    if (!w.enabled) return 'Rádio desligado.';
    if (!w.ssid?.trim()) return 'SSID vazio.';
    if (w.ssid.length > 32) return 'SSID com mais de 32 caracteres.';
    if (!std.bands.includes(w.band)) return `${std.label} não opera em ${w.band} GHz.`;
    if (!widthsFor(w.standard, w.band).includes(+w.width)) return `Largura de ${w.width} MHz indisponível para ${std.label} em ${w.band} GHz.`;
    if (!channelsFor(w.band, +w.width).includes(+w.channel)) return `Canal ${w.channel} inválido para ${w.width} MHz em ${w.band} GHz.`;
    if (w.band === '6' && (w.security === 'WPA2' || w.security === 'WPA2/WPA3')) return '6 GHz exige WPA3 (SAE) ou OWE: WPA2 não é permitido.';
    if (w.security !== 'Aberta' && (w.password.length < 8 || w.password.length > 63)) return 'A senha WPA deve ter de 8 a 63 caracteres.';
    if (!std.gis.includes(+w.gi)) return `GI de ${w.gi} µs inválido para ${std.label}.`;
    return null;
}
export function lanConfigError(r) {
    if (!isIp(r.lan.ip)) return 'IP da LAN inválido.';
    if (!isMask(r.lan.mask)) return 'Máscara da LAN inválida.';
    const d = r.dhcp;
    if (!d.enabled) return null;
    if (!isIp(d.start) || !isIp(d.end)) return 'Faixa DHCP inválida.';
    if (!sameSubnet(d.start, r.lan.ip, r.lan.mask) || !sameSubnet(d.end, r.lan.ip, r.lan.mask)) return 'A faixa DHCP está fora da sub-rede da LAN.';
    if (ipToInt(d.start) > ipToInt(d.end)) return 'Início da faixa DHCP maior que o fim.';
    return null;
}

export class Lab {
    constructor(state, { seed = state.seed ?? 1 } = {}) {
        this.state = state;
        this.state.env = { ...defaultEnvironment(), ...state.env };
        this.state.walls ||= [];
        this.random = rng(seed);
        this.now = 0;
        this.events = [];
        this.runtime = new Map();
        this.eventId = 0;
        this.listeners = new Set();
    }

    // ---------- bookkeeping ----------
    get devices() { return this.state.devices; }
    get routers() { return this.devices.filter(d => d.type === 'router'); }
    get clients() { return this.devices.filter(d => d.type !== 'router'); }
    device(id) { return this.devices.find(d => d.id === id); }
    rt(id) {
        if (!this.runtime.has(id)) this.runtime.set(id, { assoc: null, ip: null, arp: new Map(), leases: new Map(), declined: new Set(), seq: 0, signature: null });
        return this.runtime.get(id);
    }
    mac(dev) {
        let h = 2166136261; for (const c of dev.id) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
        const b = [0x02, 0x1a, (h >>> 24) & 255, (h >>> 16) & 255, (h >>> 8) & 255, h & 255];
        return b.map(x => x.toString(16).padStart(2, '0')).join(':');
    }
    hostname(dev) { return hostnameOf(dev.name); }
    emit(ev) {
        const full = { id: ++this.eventId, t: this.now, ...ev };
        this.events.push(full);
        if (this.events.length > 3000) this.events.splice(0, this.events.length - 3000);
        for (const l of this.listeners) l(full);
        return full;
    }
    note(text, level = 'info', device = null) { return this.emit({ proto: 'Sistema', info: text, level, from: device, ok: level !== 'error' }); }

    // ---------- radio ----------
    negotiate(ap, client) {
        const band = ap.wifi.band;
        if (!clientBands(client.wifi.standard).includes(band)) return { ok: false, reason: `${STANDARDS[client.wifi.standard].label} não opera em ${band} GHz.` };
        const standard = effectiveStandard(ap.wifi.standard, client.wifi.standard, band);
        if (!standard) return { ok: false, reason: 'Nenhum padrão em comum.' };
        const width = Math.max(...widthsFor(standard, band).filter(w => w <= +ap.wifi.width));
        const gi = STANDARDS[standard].gis.includes(+ap.wifi.gi) ? +ap.wifi.gi : 0.8;
        return { ok: true, standard, width, gi, nss: Math.min(+ap.wifi.streams, +client.wifi.streams), apChains: +ap.wifi.streams, clientChains: +client.wifi.streams };
    }
    // Co-channel BSSs heard above the −82 dBm CCA threshold are resolved by CSMA/CA (airtime sharing,
    // see utilization); partially overlapping or unheard ones add to the noise as interference.
    coChannelHeard(ap, o) {
        if (centerFrequency(ap.wifi.band, +ap.wifi.channel) !== centerFrequency(o.wifi.band, +o.wifi.channel)) return false;
        const pl = pathLoss(this.state.env, this.state.walls, o, ap, o.wifi.band, centerFrequency(o.wifi.band, +o.wifi.channel));
        return +o.wifi.txPower + +o.wifi.antennaGain - pl > -82;
    }
    interferenceMw(victim, at) {
        let mw = 0;
        for (const o of this.routers) {
            if (o.id === victim.id || apConfigError(o) || o.wifi.band !== victim.wifi.band) continue;
            const overlap = spectralOverlap(victim, o);
            if (!overlap || this.coChannelHeard(victim, o)) continue;
            const pl = pathLoss(this.state.env, this.state.walls, o, at, o.wifi.band, centerFrequency(o.wifi.band, o.wifi.channel));
            mw += dbmToMw(+o.wifi.txPower + +o.wifi.antennaGain - pl) * overlap * (+o.wifi.load / 100);
        }
        return mw;
    }
    // Medium utilization seen by an AP: airtime used by overlapping BSSs heard above the −82 dBm CCA threshold.
    utilization(ap) {
        let u = 0;
        for (const o of this.routers) {
            if (o.id === ap.id || apConfigError(o) || o.wifi.band !== ap.wifi.band) continue;
            if (this.coChannelHeard(ap, o)) u += +o.wifi.load / 100;
        }
        return Math.min(.9, u);
    }
    link(ap, client) {
        const env = this.state.env, band = ap.wifi.band, freq = centerFrequency(band, +ap.wifi.channel);
        const negotiation = this.negotiate(ap, client), width = negotiation.ok ? negotiation.width : +ap.wifi.width;
        const pl = pathLoss(env, this.state.walls, ap, client, band, freq), walls = wallLoss(this.state.walls, ap, client, band);
        const noise = thermalNoiseDbm(width, +env.noiseFigure) + +env.extraNoise;
        const side = (txPower, gains, interfMw) => {
            const rssi = txPower + gains - pl, total = mwToDbm(dbmToMw(noise) + interfMw);
            return { rssi, noise, interference: interfMw > 0 ? mwToDbm(interfMw) : null, sinr: rssi - total - +env.implementationLoss };
        };
        const dl = side(+ap.wifi.txPower, +ap.wifi.antennaGain, this.interferenceMw(ap, client));
        const ul = side(+client.wifi.txPower, +ap.wifi.antennaGain, this.interferenceMw(ap, ap));
        const forced = client.snrOverride !== null && client.snrOverride !== '' && Number.isFinite(+client.snrOverride);
        if (forced) dl.sinr = ul.sinr = +client.snrOverride;
        // Beacons/management use 6 Mb/s on the 20 MHz primary: less noise bandwidth than the full channel.
        const mgmtDl = dl.sinr + 10 * Math.log10(width / 20) * !forced, mgmtUl = ul.sinr + 10 * Math.log10(width / 20) * !forced;
        const out = { ap, client, band, freq, distance: Math.hypot(ap.x - client.x, ap.y - client.y), pathLoss: pl, wallLoss: walls, width, dl, ul, mgmtDl, mgmtUl, forced, negotiation, utilization: this.utilization(ap) };
        if (negotiation.ok) {
            const n = negotiation, fixed = ap.wifi.mcs === 'auto' ? null : Math.min(+ap.wifi.mcs, STANDARDS[n.standard].maxMcs);
            out.rates = {
                dl: selectRate({ standard: n.standard, width: n.width, gi: n.gi, maxNss: n.nss, rxChains: n.clientChains, snrDb: dl.sinr, fixedMcs: fixed }),
                ul: selectRate({ standard: n.standard, width: n.width, gi: n.gi, maxNss: n.nss, rxChains: n.apChains, snrDb: ul.sinr, fixedMcs: fixed }),
            };
            out.fixedMcs = fixed;
        }
        return out;
    }
    beaconPer(link) { return packetErrorRate(streamSnr(link.mgmtDl, 1, link.negotiation.clientChains || 1), 0, 300); }
    scan(client) {
        const bands = clientBands(client.wifi.standard);
        return this.routers.filter(ap => !apConfigError(ap) && bands.includes(ap.wifi.band)).map(ap => {
            const l = this.link(ap, client);
            return { ap, link: l, ssid: ap.wifi.ssid, bssid: this.mac(ap), rssi: l.dl.rssi, snr: l.mgmtDl, band: ap.wifi.band, channel: +ap.wifi.channel, width: +ap.wifi.width, security: securityLabel(ap.wifi.security, ap.wifi.band), standard: STANDARDS[ap.wifi.standard].label, visible: this.beaconPer(l) < .5 };
        }).filter(s => s.visible).sort((a, b) => b.rssi - a.rssi);
    }
    associatedAp(client) { const a = this.rt(client.id).assoc; return a ? this.device(a.apId) : null; }
    currentLink(client) { const ap = this.associatedAp(client); return ap ? this.link(ap, client) : null; }

    // One frame over the air, with 802.11 retransmissions. kind: 'mgmt' | 'data' | 'bcast'.
    transmit(link, dir, kind, bytes, ev) {
        const { negotiation: n } = link, retry = kind === 'bcast' ? 1 : 7;
        let per, airtime, phy;
        const rx = dir === 'dl' ? (n.clientChains || 1) : (n.apChains || 1);
        if (kind === 'data' && link.rates?.[dir]) {
            const r = link.rates[dir];
            per = packetErrorRate(r.streamSnr, r.mcs, bytes);
            airtime = ppduAirtime(n.standard, n.width, r.mcs, r.nss, n.gi, bytes);
            phy = { standard: n.standard, mcs: r.mcs, nss: r.nss, width: n.width, gi: n.gi, rate: r.rate, snr: dir === 'dl' ? link.dl.sinr : link.ul.sinr, per };
        } else {
            per = packetErrorRate(streamSnr(dir === 'dl' ? link.mgmtDl : link.mgmtUl, 1, rx), 0, bytes);
            airtime = legacyAirtime(bytes);
            phy = { legacy: true, rate: 6, width: 20, snr: dir === 'dl' ? link.mgmtDl : link.mgmtUl, per };
        }
        let attempts = 0, ok = false, elapsed = 0, cw = TIMING.cwMin;
        while (attempts < retry && !ok) {
            attempts++;
            const busy = this.random() < link.utilization ? this.random() * 1500 : 0;
            elapsed += TIMING.difs + Math.floor(this.random() * (cw + 1)) * TIMING.slot + busy + airtime + (kind === 'bcast' ? 0 : TIMING.sifs + TIMING.ack);
            ok = this.random() >= per;
            cw = Math.min(1023, 2 * cw + 1);
        }
        this.now += elapsed / 1000;
        const ap = link.ap, client = link.client;
        this.emit({ medium: 'wifi', dir, kind, from: dir === 'dl' ? ap.id : client.id, to: dir === 'dl' ? (kind === 'bcast' ? null : client.id) : ap.id, bytes, attempts, ok, airtime: elapsed, phy, ...ev });
        return ok;
    }
    wan(router, proto, info, ok, layers, dir = 'out') { this.emit({ medium: 'wan', from: dir === 'out' ? router.id : 'internet', to: dir === 'out' ? 'internet' : router.id, proto, info, ok, layers }); }

    // ---------- association ----------
    disconnect(client, reason = 'Desconectado pelo usuário') {
        const rt = this.rt(client.id), ap = this.associatedAp(client);
        if (!ap) return;
        const l = this.link(ap, client);
        this.transmit(l, 'ul', 'mgmt', 26, { proto: '802.11', info: `Desautenticação · ${reason}`, layers: [mac80211('Deauthentication', this.mac(ap), this.mac(client), this.mac(ap)), { name: 'Motivo', fields: [['Código', '3 (STA saindo)'], ['Descrição', reason]] }] });
        this.rt(ap.id).leases.forEach(lease => { if (lease.mac === this.mac(client)) lease.connected = false; });
        rt.assoc = null; rt.ip = null; rt.arp.clear();
    }
    connect(client, ssid = client.wifi.ssid, password = client.wifi.password) {
        const rt = this.rt(client.id);
        if (rt.assoc) this.disconnect(client, 'Trocando de rede');
        client.wifi.ssid = ssid; client.wifi.password = password;
        const sta = this.mac(client), fail = message => { rt.last = { ok: false, message }; this.note(`${client.name}: ${message}`, 'error', client.id); return { ok: false, message }; };
        const candidates = this.scan(client).filter(s => s.ssid === ssid);
        this.emit({ medium: 'wifi', dir: 'ul', kind: 'mgmt', from: client.id, to: null, proto: '802.11', info: `Probe Request · SSID="${ssid}"`, ok: true, bytes: 60, layers: [mac80211('Probe Request', 'ff:ff:ff:ff:ff:ff', sta, 'ff:ff:ff:ff:ff:ff'), { name: 'Elementos', fields: [['SSID', ssid], ['Taxas suportadas', '6, 9, 12, 18, 24, 36, 48, 54 Mb/s'], ['Capacidades', STANDARDS[client.wifi.standard].label]] }] });
        if (!candidates.length) {
            const hidden = this.routers.find(ap => ap.wifi.ssid === ssid && !apConfigError(ap));
            if (hidden && !clientBands(client.wifi.standard).includes(hidden.wifi.band)) return fail(`Rede "${ssid}" não encontrada: ela opera em ${hidden.wifi.band} GHz, banda que ${STANDARDS[client.wifi.standard].label} não suporta.`);
            return fail(`Rede "${ssid}" não encontrada (fora de alcance ou desligada).`);
        }
        const { ap } = candidates[0], bssid = this.mac(ap), link = this.link(ap, client), w = ap.wifi;
        const mgmt = (dir, bytes, info, layers) => this.transmit(link, dir, 'mgmt', bytes, { proto: '802.11', info, layers });
        if (!mgmt('dl', 300, `Probe Response · SSID="${ssid}" · canal ${w.channel}`, [mac80211('Probe Response', sta, bssid, bssid), { name: 'Elementos', fields: [['SSID', ssid], ['Canal', `${w.channel} (${centerFrequency(w.band, +w.channel)} MHz)`], ['Largura', `${w.width} MHz`], ['Segurança', securityLabel(w.security, w.band)], ['Padrão', STANDARDS[w.standard].label]] }])) return fail('Probe Response perdido (SNR muito baixa).');
        if (!link.negotiation.ok) {
            mgmt('dl', 30, 'Association Response · status 18 (taxas/capacidades incompatíveis)', [mac80211('Association Response', sta, bssid, bssid), { name: 'Status', fields: [['Código', '18'], ['Motivo', link.negotiation.reason]] }]);
            return fail(`Associação recusada: ${link.negotiation.reason}`);
        }
        const wpa3 = clientSupportsWpa3(client), useSae = w.security === 'WPA3' || (w.security === 'WPA2/WPA3' && wpa3) || (w.security === 'Aberta' && w.band === '6');
        if (w.security === 'WPA3' && !wpa3) return fail(`A rede exige WPA3-SAE e ${STANDARDS[client.wifi.standard].label} (sem certificação WPA3) não suporta.`);
        const passwordOk = w.security === 'Aberta' || password === w.password;
        if (useSae && w.security !== 'Aberta') {
            const auth = (dir, seq, info) => mgmt(dir, 120, info, [mac80211('Authentication', dir === 'ul' ? bssid : sta, dir === 'ul' ? sta : bssid, bssid), { name: 'Autenticação', fields: [['Algoritmo', '3 (SAE)'], ['Sequência', seq === 1 ? '1 (Commit)' : '2 (Confirm)'], ['Grupo', '19 (ECC P-256)']] }]);
            if (!auth('ul', 1, 'Authentication · SAE Commit') || !auth('dl', 1, 'Authentication · SAE Commit')) return fail('Troca SAE perdida no ar.');
            if (!auth('ul', 2, 'Authentication · SAE Confirm')) return fail('Troca SAE perdida no ar.');
            if (!passwordOk) {
                mgmt('dl', 30, 'Authentication · SAE Confirm rejeitado (status 15)', [mac80211('Authentication', sta, bssid, bssid), { name: 'Status', fields: [['Código', '15 (falha no desafio)'], ['Causa', 'Senha diferente: o Confirm não verifica']] }]);
                return fail('Senha incorreta (SAE Confirm não verificou).');
            }
            if (!auth('dl', 2, 'Authentication · SAE Confirm')) return fail('Troca SAE perdida no ar.');
        } else {
            const auth = (dir, info) => mgmt(dir, 30, info, [mac80211('Authentication', dir === 'ul' ? bssid : sta, dir === 'ul' ? sta : bssid, bssid), { name: 'Autenticação', fields: [['Algoritmo', '0 (Open System)']] }]);
            if (!auth('ul', 'Authentication · Open System') || !auth('dl', 'Authentication · Open System (sucesso)')) return fail('Autenticação perdida no ar.');
        }
        const n = link.negotiation;
        if (!mgmt('ul', 120, 'Association Request', [mac80211('Association Request', bssid, sta, bssid), { name: 'Capacidades', fields: [['Padrão', STANDARDS[client.wifi.standard].label], ['Fluxos espaciais', client.wifi.streams], ['RSN', useSae ? 'SAE' : w.security === 'Aberta' ? '—' : 'PSK']] }])) return fail('Association Request perdido.');
        if (!mgmt('dl', 160, `Association Response · AID ${1 + this.clientsOf(ap).length} · ${STANDARDS[n.standard].short}`, [mac80211('Association Response', sta, bssid, bssid), { name: 'Negociado', fields: [['Status', '0 (sucesso)'], ['Padrão', STANDARDS[n.standard].label], ['Largura', `${n.width} MHz`], ['Fluxos', n.nss], ['GI', `${n.gi} µs`]] }])) return fail('Association Response perdido.');
        if (w.security !== 'Aberta' || w.band === '6') {
            const key = (dir, k, info, extra = []) => this.transmit(link, dir, 'mgmt', 133, { proto: 'EAPOL', info, layers: [mac80211('QoS Data', dir === 'dl' ? sta : bssid, dir === 'dl' ? bssid : sta, bssid), { name: '802.1X / EAPOL-Key', fields: [['Mensagem', `${k} de 4`], ['Chave', useSae ? 'PMK derivada do SAE' : 'PMK = PBKDF2(senha, SSID)'], ...extra] }] });
            if (!key('dl', 1, 'Key (Msg 1/4) · ANonce')) return fail('4-way handshake perdido.');
            if (!key('ul', 2, 'Key (Msg 2/4) · SNonce + MIC', [['MIC', passwordOk ? 'válido' : 'INVÁLIDO']])) return fail('4-way handshake perdido.');
            if (!passwordOk) {
                mgmt('dl', 26, 'Desautenticação · motivo 15 (timeout do 4-way handshake)', [mac80211('Deauthentication', sta, bssid, bssid), { name: 'Motivo', fields: [['Código', '15'], ['Causa', 'MIC da mensagem 2/4 inválido: PSK diferente']] }]);
                return fail('Senha incorreta (MIC inválido no 4-way handshake).');
            }
            if (!key('dl', 3, 'Key (Msg 3/4) · GTK cifrada') || !key('ul', 4, 'Key (Msg 4/4)')) return fail('4-way handshake perdido.');
        }
        rt.assoc = { apId: ap.id, since: this.now, signature: wifiSignature(ap), clientSig: clientSignature(client) };
        rt.arp.clear();
        this.note(`${client.name} associado a "${ssid}" (${STANDARDS[n.standard].label}, ${n.width} MHz, ${n.nss}×${n.nss} MIMO)`, 'ok', client.id);
        rt.ipSig = ipSignature(client, ap);
        rt.last = { ok: true, message: `Conectado a "${ssid}".` };
        this.configureIp(client);
        return { ok: true, message: `Conectado a "${ssid}".`, ap };
    }
    clientsOf(ap) { return this.clients.filter(c => this.rt(c.id).assoc?.apId === ap.id); }

    // ---------- IP configuration ----------
    configureIp(client) {
        const rt = this.rt(client.id), cfg = client.ip;
        rt.arp.clear();
        if (!rt.assoc) { rt.ip = null; return; }
        if (cfg.mode === 'static') {
            if (!isIp(cfg.address) || !isMask(cfg.mask)) { rt.ip = null; this.note(`${client.name}: IP estático inválido.`, 'error', client.id); return; }
            rt.ip = { address: cfg.address.trim(), mask: cfg.mask.trim(), gateway: cfg.gateway.trim(), dns: [cfg.dns.trim()].filter(Boolean), source: 'static' };
            const ap = this.associatedAp(client);
            this.transmit(this.link(ap, client), 'ul', 'data', 64, { proto: 'ARP', info: `ARP anúncio (gratuitous) · ${cfg.address} está em ${this.mac(client)}`, layers: [mac80211('Data', 'ff:ff:ff:ff:ff:ff', this.mac(client), this.mac(ap)), arpLayer('anúncio', this.mac(client), cfg.address, '00:00:00:00:00:00', cfg.address)] });
            return;
        }
        this.dhcp(client);
    }
    dhcp(client) {
        const rt = this.rt(client.id), ap = this.associatedAp(client), sta = this.mac(client), host = this.hostname(client);
        if (!ap) return { ok: false, message: 'Sem associação Wi-Fi.' };
        const link = this.link(ap, client), router = ap, server = router.dhcp, routerMac = this.mac(router);
        const xid = '0x' + Math.floor(this.random() * 2 ** 32).toString(16).padStart(8, '0');
        const send = (dir, msg, info, extra, kind = 'data') => this.transmit(link, dir, kind, 342, { proto: 'DHCP', info: `DHCP ${msg} · ${info} · xid ${xid}`, layers: [mac80211('QoS Data', dir === 'ul' ? routerMac : sta, dir === 'ul' ? sta : routerMac, routerMac), ipLayer(dir === 'ul' ? '0.0.0.0' : router.lan.ip, dir === 'ul' ? '255.255.255.255' : (extra.yiaddr || '255.255.255.255'), 'UDP', 64), udpLayer(dir === 'ul' ? 68 : 67, dir === 'ul' ? 67 : 68), { name: 'DHCP', fields: [['Tipo (opção 53)', msg], ['xid', xid], ['Cliente (chaddr)', sta], ...(extra.fields || [])] }] });
        for (let round = 0; round < 3; round++) {
            let offered = null;
            for (let attempt = 0; attempt < 4 && !offered; attempt++) {
                if (!send('ul', 'DISCOVER', 'broadcast', { fields: [['Hostname (opção 12)', host]] })) continue;
                const cfgError = lanConfigError(router);
                if (!server.enabled || cfgError) { if (attempt === 0) this.note(`${router.name}: ${!server.enabled ? 'servidor DHCP desativado' : cfgError} — DISCOVER sem resposta.`, 'warn', router.id); this.now += 1000 * 2 ** attempt; continue; }
                const ip = this.allocate(router, sta);
                if (!ip) { if (attempt === 0) this.note(`${router.name}: pool DHCP esgotado (${server.start}–${server.end}).`, 'warn', router.id); this.now += 1000 * 2 ** attempt; continue; }
                const opts = this.dhcpOptions(router);
                if (send('dl', 'OFFER', `oferece ${ip}`, { yiaddr: ip, fields: [['yiaddr', ip], ...opts] })) offered = ip;
            }
            if (!offered) return this.apipa(client);
            if (!send('ul', 'REQUEST', `pede ${offered}`, { fields: [['IP pedido (opção 50)', offered], ['Servidor (opção 54)', router.lan.ip], ['Hostname (opção 12)', host]] })) return this.apipa(client);
            if (!send('dl', 'ACK', `confirma ${offered} por ${formatLease(server.lease)}`, { yiaddr: offered, fields: [['yiaddr', offered], ...this.dhcpOptions(router)] })) return this.apipa(client);
            // RFC 2131 §4.4.1: the client probes the address with ARP before using it.
            const holder = this.ownerOf(router, offered, client);
            this.transmit(link, 'ul', 'data', 64, { proto: 'ARP', info: `ARP sonda · alguém usa ${offered}?`, layers: [mac80211('Data', 'ff:ff:ff:ff:ff:ff', sta, routerMac), arpLayer('requisição (sonda)', sta, '0.0.0.0', '00:00:00:00:00:00', offered)] });
            if (holder) {
                this.note(`${client.name}: ${offered} já está em uso por ${holder.name} (IP estático?) → DHCPDECLINE.`, 'warn', client.id);
                send('ul', 'DECLINE', `recusa ${offered} (conflito)`, { fields: [['IP recusado', offered]] });
                this.rt(router.id).declined.add(offered);
                this.rt(router.id).leases.delete(sta);
                continue;
            }
            const lease = this.rt(router.id).leases.get(sta);
            lease.connected = true; lease.expires = this.now + server.lease * 1000;
            rt.ip = { address: offered, mask: router.lan.mask, gateway: router.lan.ip, dns: [server.dns1, server.dns2].filter(isIp), source: 'dhcp', server: router.lan.ip, lease: server.lease, obtained: this.now };
            return { ok: true, message: `Endereço ${offered} obtido de ${router.lan.ip}.` };
        }
        return this.apipa(client);
    }
    dhcpOptions(router) {
        const d = router.dhcp;
        return [['Máscara (opção 1)', router.lan.mask], ['Roteador (opção 3)', router.lan.ip], ['DNS (opção 6)', [d.dns1, d.dns2].filter(Boolean).join(', ') || '—'], ['Lease (opção 51)', formatLease(d.lease)], ['Servidor (opção 54)', router.lan.ip]];
    }
    allocate(router, mac) {
        const rt = this.rt(router.id), d = router.dhcp;
        const current = rt.leases.get(mac), inPool = ip => ipToInt(ip) >= ipToInt(d.start) && ipToInt(ip) <= ipToInt(d.end) && sameSubnet(ip, router.lan.ip, router.lan.mask);
        if (current && !rt.declined.has(current.ip) && inPool(current.ip)) return current.ip;
        if (current) rt.leases.delete(mac);
        const used = new Set([...rt.leases.values()].filter(l => l.mac !== mac && (l.connected || l.expires > this.now)).map(l => l.ip));
        for (let n = ipToInt(d.start); n <= ipToInt(d.end); n++) {
            const ip = intToIp(n);
            if (ip === router.lan.ip || used.has(ip) || rt.declined.has(ip)) continue;
            const client = this.clients.find(c => this.mac(c) === mac);
            rt.leases.set(mac, { mac, ip, hostname: client ? this.hostname(client) : 'host', name: client?.name, connected: false, expires: this.now + d.lease * 1000 });
            return ip;
        }
        return null;
    }
    apipa(client) {
        const rt = this.rt(client.id), h = parseInt(this.mac(client).slice(-5).replace(':', ''), 16);
        rt.ip = { address: `169.254.${1 + (h >> 8) % 254}.${1 + (h & 255) % 254}`, mask: '255.255.0.0', gateway: '', dns: [], source: 'apipa' };
        this.note(`${client.name}: sem resposta DHCP → endereço APIPA ${rt.ip.address} (autoconfiguração, sem gateway).`, 'error', client.id);
        return { ok: false, message: 'Sem resposta do servidor DHCP.' };
    }
    release(client) {
        const rt = this.rt(client.id), ap = this.associatedAp(client);
        if (!ap || rt.ip?.source !== 'dhcp') { rt.ip = rt.ip?.source === 'static' ? rt.ip : null; return; }
        this.transmit(this.link(ap, client), 'ul', 'data', 342, { proto: 'DHCP', info: `DHCP RELEASE · devolve ${rt.ip.address}`, layers: [mac80211('QoS Data', this.mac(ap), this.mac(client), this.mac(ap)), ipLayer(rt.ip.address, ap.lan.ip, 'UDP', 128), udpLayer(68, 67), { name: 'DHCP', fields: [['Tipo (opção 53)', 'RELEASE'], ['ciaddr', rt.ip.address]] }] });
        this.rt(ap.id).leases.delete(this.mac(client));
        rt.ip = null; rt.arp.clear();
    }
    leases(router) { return [...this.rt(router.id).leases.values()]; }

    // ---------- L2/L3 ----------
    ipOf(dev) { return dev.type === 'router' ? dev.lan.ip : this.rt(dev.id).ip?.address; }
    // Device on the router's LAN that owns `ip` (router itself or an associated client).
    ownerOf(router, ip, except = null) {
        if (router.lan.ip === ip) return router;
        return this.clientsOf(router).find(c => c !== except && this.rt(c.id).ip?.address === ip) || null;
    }
    duplicates(client) {
        const ap = this.associatedAp(client), ip = this.ipOf(client);
        if (!ap || !ip) return [];
        return [ap, ...this.clientsOf(ap)].filter(d => d !== client && this.ipOf(d) === ip);
    }
    arpResolve(src, ip) {
        const rt = this.rt(src.id), ap = this.associatedAp(src);
        if (rt.arp.has(ip)) return rt.arp.get(ip);
        const link = this.link(ap, src), myIp = this.ipOf(src), sta = this.mac(src);
        const owner = this.ownerOf(ap, ip, src);
        for (let attempt = 0; attempt < 3; attempt++) {
            const layers = [mac80211('Data', 'ff:ff:ff:ff:ff:ff', sta, this.mac(ap)), arpLayer('requisição', sta, myIp, '00:00:00:00:00:00', ip)];
            if (!this.transmit(link, 'ul', 'data', 64, { proto: 'ARP', info: `ARP Quem tem ${ip}? Responda a ${myIp}`, layers })) continue;
            if (owner && owner.type !== 'router') {
                // The AP rebroadcasts on the downlink at the basic rate, without ACK; isolation blocks STA↔STA.
                if (ap.wifi.isolation) { this.note(`${ap.name}: isolamento de clientes bloqueou o ARP de ${src.name}.`, 'warn', ap.id); continue; }
                const ownerLink = this.link(ap, owner);
                if (!this.transmit(ownerLink, 'dl', 'bcast', 64, { proto: 'ARP', info: `ARP Quem tem ${ip}? (difusão do AP)`, layers })) continue;
                const reply = [mac80211('Data', this.mac(ap), this.mac(owner), this.mac(ap)), arpLayer('resposta', this.mac(owner), ip, sta, myIp)];
                if (!this.transmit(ownerLink, 'ul', 'data', 64, { proto: 'ARP', info: `ARP ${ip} está em ${this.mac(owner)}`, layers: reply })) continue;
                if (!this.transmit(link, 'dl', 'data', 64, { proto: 'ARP', info: `ARP ${ip} está em ${this.mac(owner)}`, layers: reply })) continue;
                rt.arp.set(ip, { mac: this.mac(owner), device: owner.id, t: this.now });
                return rt.arp.get(ip);
            }
            if (owner) {
                if (!this.transmit(link, 'dl', 'data', 64, { proto: 'ARP', info: `ARP ${ip} está em ${this.mac(owner)}`, layers: [mac80211('Data', sta, this.mac(ap), this.mac(ap)), arpLayer('resposta', this.mac(owner), ip, sta, myIp)] })) continue;
                rt.arp.set(ip, { mac: this.mac(owner), device: owner.id, t: this.now });
                return rt.arp.get(ip);
            }
            this.now += 1000;
        }
        return null;
    }

    // Send one IP datagram from a client and wait for the reply. `spec.at(device|host)` decides whether
    // the destination answers. Returns { ok, error, rtt, ttl, responder }.
    exchange(src, dstIp, spec) {
        const ap = this.associatedAp(src), cfg = this.rt(src.id).ip;
        if (!ap) return { ok: false, error: 'noassoc' };
        if (!cfg) return { ok: false, error: 'noip' };
        if (dstIp === cfg.address || dstIp.startsWith('127.')) return { ok: true, rtt: 0, ttl: ttlOf(src), responder: src };
        const local = sameSubnet(cfg.address, dstIp, cfg.mask), hop = local ? dstIp : cfg.gateway;
        if (!local && !isIp(hop)) return { ok: false, error: 'nogw' };
        if (!this.arpResolve(src, hop)) return { ok: false, error: 'unreachable' };
        const t0 = this.now, link = this.link(ap, src), sta = this.mac(src), apMac = this.mac(ap);
        const frame = (l, dir, info, a, b, ttl, reply) => this.transmit(l, dir, 'data', spec.bytes, { proto: spec.proto, info, layers: [mac80211('QoS Data', dir === 'ul' ? apMac : this.mac(l.client), dir === 'ul' ? this.mac(l.client) : apMac, apMac), ipLayer(a, b, spec.l4, ttl), ...spec.layers(reply)] });
        if (!frame(link, 'ul', spec.info(false), cfg.address, dstIp, ttlOf(src), false)) return { ok: false, error: 'timeout' };
        const hopDev = this.ownerOf(ap, hop, src);
        let res = null, responder = null;
        if (hopDev?.type === 'router') {
            const router = hopDev, inLan = sameSubnet(cfg.address, router.lan.ip, router.lan.mask);
            if (!inLan) return { ok: false, error: 'timeout', why: `${router.name} não tem rota de volta para ${cfg.address} (fora da sub-rede ${router.lan.ip}/${prefixOf(router.lan.mask)}).` };
            if (dstIp === router.lan.ip) { responder = router; res = spec.at(router); }
            else if (sameSubnet(dstIp, router.lan.ip, router.lan.mask)) {
                const dst = this.ownerOf(router, dstIp, src);
                if (!dst) return { ok: false, error: 'timeout' };
                return this.viaAp(src, dst, spec, t0, cfg, dstIp);
            } else {
                if (!router.wan.connected) return { ok: false, error: 'timeout', why: `WAN de ${router.name} desconectada.` };
                const host = internetByIp(dstIp);
                this.wan(router, spec.proto, `${spec.info(false)} · NAT ${cfg.address} → ${router.wan.ip}`, true, [ipLayer(router.wan.ip, dstIp, spec.l4, 63)]);
                if (!host) { this.now += 2; return { ok: false, error: 'timeout', why: `Nenhum host ${dstIp} na Internet simulada.` }; }
                res = spec.at(host);
                if (res) {
                    this.now += host.latency * (0.9 + 0.25 * this.random());
                    this.wan(router, spec.proto, `${spec.info(true)} · NAT ${router.wan.ip} → ${cfg.address}`, true, [ipLayer(dstIp, router.wan.ip, spec.l4, host.ttl)], 'in');
                }
                responder = host;
            }
        } else if (hopDev) {
            return this.viaAp(src, hopDev, spec, t0, cfg, dstIp);
        }
        if (!res) return { ok: false, error: 'timeout', why: res === false ? 'Destino não respondeu.' : undefined };
        this.now += 0.2;
        const ttl = responder.ttl ?? ttlOf(responder);
        if (!frame(link, 'dl', spec.info(true), dstIp, cfg.address, ttl, true)) return { ok: false, error: 'timeout' };
        return { ok: true, rtt: this.now - t0, ttl, responder, value: res };
    }
    // Client → AP → client on the same BSS (two hops each way).
    viaAp(src, dst, spec, t0, cfg, dstIp) {
        const ap = this.associatedAp(src);
        if (ap.wifi.isolation) { this.note(`${ap.name}: isolamento de clientes descartou ${spec.proto} ${src.name} → ${dst.name}.`, 'warn', ap.id); return { ok: false, error: 'timeout', why: 'Isolamento de clientes ativo no AP.' }; }
        const l1 = this.link(ap, src), l2 = this.link(ap, dst), apMac = this.mac(ap);
        const frame = (l, dir, info, a, b, ttl, reply) => this.transmit(l, dir, 'data', spec.bytes, { proto: spec.proto, info, layers: [mac80211('QoS Data', dir === 'ul' ? apMac : this.mac(l.client), dir === 'ul' ? this.mac(l.client) : apMac, apMac), ipLayer(a, b, spec.l4, ttl), ...spec.layers(reply)] });
        if (!frame(l2, 'dl', spec.info(false) + ' (repassado pelo AP)', cfg.address, dstIp, ttlOf(src), false)) return { ok: false, error: 'timeout' };
        const res = spec.at(dst);
        if (!res) return { ok: false, error: 'timeout', why: dst.firewall && spec.proto === 'ICMP' ? `Firewall de ${dst.name} bloqueia ICMP.` : undefined };
        this.now += 0.3 + this.random() * 0.7;
        if (!frame(l2, 'ul', spec.info(true), dstIp, cfg.address, ttlOf(dst), true)) return { ok: false, error: 'timeout' };
        if (!frame(l1, 'dl', spec.info(true) + ' (repassado pelo AP)', dstIp, cfg.address, ttlOf(dst), true)) return { ok: false, error: 'timeout' };
        return { ok: true, rtt: this.now - t0, ttl: ttlOf(dst), responder: dst, value: res };
    }

    ping(src, target, { count = 4, size = 32 } = {}) {
        let ip = target;
        if (!isIp(target)) {
            const r = this.resolve(src, target);
            if (!r.ok) return { target, error: r.error, message: r.message };
            ip = r.ip;
        }
        const replies = [];
        for (let seq = 1; seq <= count; seq++) {
            const id = ++this.rt(src.id).seq, start = this.now;
            const res = this.exchange(src, ip, {
                proto: 'ICMP', l4: 'ICMP', bytes: size + 28 + 38,
                info: reply => `ICMP Echo ${reply ? 'Reply' : 'Request'} ${reply ? ip + ' → ' + this.ipOf(src) : this.ipOf(src) + ' → ' + ip} · seq=${seq}`,
                layers: reply => [{ name: 'ICMP', fields: [['Tipo', reply ? '0 (Echo Reply)' : '8 (Echo Request)'], ['Código', 0], ['Identificador', id], ['Sequência', seq], ['Dados', `${size} bytes`]] }],
                at: d => d.type ? !(d.firewall) : true,
            });
            replies.push({ seq, size, ...res });
            this.now = Math.max(this.now, start + 1000);
            if (['noassoc', 'noip', 'nogw'].includes(res.error)) break;
        }
        return { target, ip, replies };
    }
    // HTTP request from a client to a router's web admin or a simulated site (TCP handshake folded in).
    // Returns exchange()'s result plus { host, ip, path }; value is { router } or { site }.
    http(src, url, { method = 'GET', bytes = 420 } = {}) {
        const u = parseUrl(url);
        if (!u) return { ok: false, error: 'badurl' };
        const { host, path } = u;
        let ip = host;
        if (!isIp(host)) {
            const r = this.resolve(src, host);
            if (!r.ok) return { ok: false, error: ['noassoc', 'noip'].includes(r.error) ? r.error : 'dns', message: r.message, host, path };
            ip = r.ip;
        }
        const port = 49152 + (this.eventId % 16000);
        const res = this.exchange(src, ip, {
            proto: 'TCP', l4: 'TCP', bytes: bytes + 40 + 38,
            info: reply => reply ? `HTTP/1.1 200 OK · ${host}${path}` : `HTTP ${method} ${path} · Host: ${host}`,
            layers: reply => [tcpLayer(reply ? 80 : port, reply ? port : 80), { name: 'HTTP', fields: reply ? [['Status', '200 OK'], ['Content-Type', 'text/html']] : [['Método', method], ['Caminho', path], ['Host', host]] }],
            // Routers serve their admin page on the LAN; clients run no web server.
            at: d => d.type === 'router' ? { router: d } : !d.type ? { site: d } : null,
        });
        return { ...res, host, ip, path };
    }
    resolve(src, name) {
        name = name.toLowerCase().replace(/\.$/, '');
        const cfg = this.rt(src.id).ip;
        if (name === 'localhost') return { ok: true, ip: '127.0.0.1', server: null };
        if (!cfg) return { ok: false, error: 'noip', message: 'Sem configuração IP.' };
        const servers = cfg.dns || [];
        if (!servers.length) return { ok: false, error: 'nodns', message: 'Nenhum servidor DNS configurado.' };
        for (const server of servers) {
            let answer = null;
            const res = this.exchange(src, server, {
                proto: 'DNS', l4: 'UDP', bytes: 60 + name.length + 38,
                info: reply => reply ? `DNS resposta · ${name} → ${answer?.ip || 'NXDOMAIN'}` : `DNS consulta A ${name}`,
                layers: reply => [udpLayer(reply ? 53 : 50000 + (this.eventId % 9999), reply ? 50000 + (this.eventId % 9999) : 53), { name: 'DNS', fields: reply ? [['Pergunta', `${name} A`], ['Resposta', answer?.ip || '—'], ['Código', answer ? 'NOERROR' : 'NXDOMAIN'], ['Servidor', server]] : [['Pergunta', `${name} A`], ['Recursão desejada', 'sim']] }],
                at: d => {
                    if (d.type === 'router') {
                        if (!d.dns.enabled) return null;
                        answer = this.routerDns(d, name);
                        if (!answer && d.wan.connected) answer = internetByName(name) ? { ip: internetByName(name).ip, source: 'encaminhado' } : null;
                        return { answer };
                    }
                    if (!d.type && d.dns) { answer = internetByName(name) ? { ip: internetByName(name).ip, source: d.names[0] } : null; return { answer }; }
                    return null;
                },
            });
            if (res.ok) return answer ? { ok: true, ip: answer.ip, server, serverName: res.responder?.name || res.responder?.names?.[0], authoritative: answer.source === 'local' } : { ok: false, error: 'nxdomain', server, message: `${name} não encontrado (NXDOMAIN) em ${server}.` };
            if (['noassoc', 'noip'].includes(res.error)) return { ok: false, error: res.error, message: 'Sem conectividade.' };
        }
        return { ok: false, error: 'dnstimeout', server: servers[0], message: `Servidor DNS ${servers.join(', ')} não respondeu.` };
    }
    routerDns(router, name) {
        const rec = router.dns.records.find(r => r.name.toLowerCase() === name);
        if (rec) return { ip: rec.ip, source: 'local' };
        if (name === this.hostname(router) + '.lan' || name === 'router.lan' || name === 'roteador.lan') return { ip: router.lan.ip, source: 'local' };
        const lease = this.leases(router).find(l => l.connected && (l.hostname + '.lan' === name || l.hostname === name));
        if (lease) return { ip: lease.ip, source: 'local' };
        return null;
    }
    traceroute(src, target) {
        let ip = target;
        if (!isIp(target)) { const r = this.resolve(src, target); if (!r.ok) return { target, error: r.error, message: r.message }; ip = r.ip; }
        const cfg = this.rt(src.id).ip, ap = this.associatedAp(src), hops = [];
        if (!cfg || !ap) return { target, ip, error: 'noip' };
        const probe = () => this.exchange(src, ip, { proto: 'ICMP', l4: 'ICMP', bytes: 92, info: r => r ? 'ICMP resposta traceroute' : 'ICMP Echo (traceroute)', layers: () => [], at: d => d.type ? !d.firewall : true });
        const local = sameSubnet(cfg.address, ip, cfg.mask);
        if (local) { hops.push({ ip, rtts: [probe(), probe(), probe()].map(r => r.ok ? r.rtt : null) }); return { target, ip, hops }; }
        const gw = [0, 1, 2].map(() => { const r = this.exchange(src, cfg.gateway, { proto: 'ICMP', l4: 'ICMP', bytes: 92, info: r => r ? 'ICMP Time Exceeded' : 'ICMP Echo TTL=1', layers: () => [], at: () => true }); return r.ok ? r.rtt : null; });
        hops.push({ ip: cfg.gateway, rtts: gw });
        const host = internetByIp(ip);
        if (!gw.some(v => v !== null) || !ap.wan.connected || !host) { for (let i = 0; i < 3; i++) hops.push({ ip: null, rtts: [null, null, null] }); return { target, ip, hops, incomplete: true }; }
        const base = gw.filter(v => v !== null).reduce((a, b) => a + b, 0) / gw.filter(v => v !== null).length;
        ISP_HOPS.forEach((h, i) => hops.push({ ip: h, rtts: [0, 1, 2].map(() => base + host.latency * (i + 1) / (ISP_HOPS.length + 1) * (0.9 + 0.3 * this.random())) }));
        hops.push({ ip, rtts: [probe(), probe(), probe()].map(r => r.ok ? r.rtt : null) });
        return { target, ip, hops };
    }
    // Saturated TCP throughput estimate over the wireless hops (shared medium ⇒ hop airtimes add).
    iperf(src, target, seconds = 5) {
        let ip = target;
        if (!isIp(target)) { const r = this.resolve(src, target); if (!r.ok) return { error: r.error, message: r.message }; ip = r.ip; }
        const reach = this.exchange(src, ip, { proto: 'TCP', l4: 'TCP', bytes: 78, info: r => r ? 'TCP SYN/ACK :5201' : 'TCP SYN :5201', layers: () => [{ name: 'TCP', fields: [['Porta destino', 5201], ['Flags', 'SYN']] }], at: d => d.type ? true : (d.iperf ? true : null) });
        if (!reach.ok) return { ip, error: reach.error, why: reach.why };
        const goodput = l => { const r = l.rates.ul, n = l.negotiation; return aggregateGoodput(n.standard, n.width, r.mcs, r.nss, n.gi, r.per) * (1 - l.utilization); };
        const goodputDl = l => { const r = l.rates.dl, n = l.negotiation; return aggregateGoodput(n.standard, n.width, r.mcs, r.nss, n.gi, r.per) * (1 - l.utilization); };
        const l1 = this.currentLink(src), parts = [goodput(l1)];
        if (reach.responder?.type && reach.responder.type !== 'router') parts.push(goodputDl(this.currentLink(reach.responder)));
        let total = 1 / parts.reduce((a, g) => a + 1 / Math.max(g, 1e-6), 0);
        if (!reach.responder?.type) total = Math.min(total, this.associatedAp(src).wan.bandwidth);
        const intervals = Array.from({ length: seconds }, () => total * (0.94 + 0.1 * this.random()));
        this.emit({ medium: 'wifi', dir: 'ul', kind: 'data', from: src.id, to: this.associatedAp(src).id, proto: 'TCP', info: `iperf3 → ${ip}: ${total.toFixed(1)} Mb/s por ${seconds} s`, ok: true, bytes: 1500, attempts: 1, phy: null });
        this.now += seconds * 1000;
        return { ip, intervals, mean: intervals.reduce((a, b) => a + b, 0) / seconds, responder: reach.responder, hops: parts.length };
    }

    // ---------- keep runtime consistent with configuration ----------
    reconcile() {
        for (const c of this.clients) {
            const rt = this.rt(c.id), ap = this.associatedAp(c);
            if (rt.assoc && !ap) { rt.assoc = null; rt.ip = null; rt.arp.clear(); }
            if (ap) {
                const sig = wifiSignature(ap), cfgError = apConfigError(ap);
                if (cfgError || sig !== rt.assoc.signature || c.wifi.ssid !== ap.wifi.ssid || rt.assoc.clientSig !== clientSignature(c)) {
                    this.note(`${c.name}: configuração da rede mudou (${cfgError || 'parâmetros Wi-Fi'}) → reassociação.`, 'warn', c.id);
                    rt.assoc = null; rt.ip = null; rt.arp.clear();
                } else {
                    const l = this.link(ap, c);
                    if (!l.negotiation.ok || this.beaconPer(l) > .9) { this.note(`${c.name}: perda de beacons de "${ap.wifi.ssid}" (SNR ${l.mgmtDl.toFixed(1)} dB) → desassociado.`, 'error', c.id); rt.assoc = null; rt.ip = null; rt.arp.clear(); }
                    else if (rt.ipSig !== ipSignature(c, ap)) { rt.ipSig = ipSignature(c, ap); this.configureIp(c); }
                }
            }
            if (!rt.assoc && c.wifi.autoConnect && c.wifi.ssid) this.connect(c);
        }
    }
}

const wifiSignature = ap => JSON.stringify(ap.wifi, (k, v) => ['txPower', 'load', 'mcs', 'antennaGain', 'isolation'].includes(k) ? undefined : v);
const clientSignature = c => JSON.stringify([c.wifi.ssid, c.wifi.password, c.wifi.standard, c.wifi.streams]);
const ipSignature = (c, ap) => JSON.stringify([c.ip, ap.lan, ap.dhcp]);
export const formatLease = s => s >= 86400 ? `${+(s / 86400).toFixed(1)} d` : s >= 3600 ? `${+(s / 3600).toFixed(1)} h` : `${s} s`;

function mac80211(subtype, ra, ta, bssid) {
    const type = /Data/.test(subtype) ? 'Dados (2)' : 'Gerenciamento (0)';
    return { name: 'IEEE 802.11', fields: [['Tipo', type], ['Subtipo', subtype], ['Endereço 1 (RA)', ra], ['Endereço 2 (TA)', ta], ['Endereço 3 (BSSID)', bssid]] };
}
const ipLayer = (src, dst, proto, ttl) => ({ name: 'IPv4', fields: [['Origem', src], ['Destino', dst], ['Protocolo', proto], ['TTL', ttl]] });
const udpLayer = (sp, dp) => ({ name: 'UDP', fields: [['Porta origem', sp], ['Porta destino', dp]] });
const tcpLayer = (sp, dp) => ({ name: 'TCP', fields: [['Porta origem', sp], ['Porta destino', dp], ['Flags', 'PSH, ACK']] });
const arpLayer = (op, smac, sip, tmac, tip) => ({ name: 'ARP', fields: [['Operação', op], ['MAC remetente', smac], ['IP remetente', sip], ['MAC alvo', tmac], ['IP alvo', tip]] });

export { MCS, STANDARDS, MATERIALS, dataRate };
