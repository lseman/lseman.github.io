// Network engine: association + security, DHCP, ARP, DNS, ICMP routing/NAT and a frame log.
// All radio frames go through `transmit`, which draws success per attempt from the PHY PER.
import { rng } from '../sim/utils.js';
import {
    STANDARDS, MCS, MATERIALS, centerFrequency, channelsFor, widthsFor, effectiveStandard, clientBands,
    pathLoss, wallLoss, thermalNoiseDbm, dbmToMw, mwToDbm, spectralOverlap, selectRate, packetErrorRate,
    streamSnr, ppduAirtime, legacyAirtime, aggregateGoodput, TIMING, dataRate, PER_TARGET, BF_MIN_RANK, bfReportBytes,
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
        wifi: { enabled: true, ssid: 'LabWiFi', security: 'WPA2/WPA3', password: 'senha1234', standard: 'wifi6', band: '5', channel: 42, width: 80, txPower: 20, antennaGain: 3, streams: 2, gi: 0.8, mcs: 'auto', isolation: false, load: 20, beamforming: false },
        lan: { ip: '192.168.0.1', mask: '255.255.255.0' },
        dhcp: { enabled: true, start: '192.168.0.100', end: '192.168.0.199', lease: 86400, dns1: '192.168.0.1', dns2: '' },
        dns: { enabled: true, records: [] },
        wan: { connected: true, ip: '100.64.12.34', bandwidth: 500 },
        admin: { user: 'admin', password: 'admin' },
        mesh: defaultMesh(),
    }, over);
}
// Mesh role: 'off' (standalone AP), 'root' (gateway with the WAN, DHCP and DNS) or 'node' (bridged satellite).
// backhaul: 'wifi' (same radio and channel as the clients), 'dedicated' (extra radio) or 'ethernet'.
export const defaultMesh = () => ({ role: 'off', id: 'LabMesh', backhaul: 'wifi' });
export const MESH_BACKHAULS = { wifi: 'Wi-Fi compartilhado (mesmo rádio e canal)', dedicated: 'Wi-Fi dedicado (rádio extra)', ethernet: 'Cabo Ethernet' };
export function makeMeshNode(id, name, x, y, over = {}) {
    return makeRouter(id, name, x, y, deepMerge({ mesh: { role: 'node' }, dhcp: { enabled: false }, dns: { enabled: false }, wan: { connected: false } }, over));
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
        for (const d of state.devices) if (d.type === 'router') d.mesh = { ...defaultMesh(), ...d.mesh };
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
        const forced = client.snrOverride != null && client.snrOverride !== '' && Number.isFinite(+client.snrOverride);
        if (forced) dl.sinr = ul.sinr = +client.snrOverride;
        // Beacons/management use 6 Mb/s on the 20 MHz primary: less noise bandwidth than the full channel.
        const mgmtDl = dl.sinr + 10 * Math.log10(width / 20) * !forced, mgmtUl = ul.sinr + 10 * Math.log10(width / 20) * !forced;
        const out = { ap, client, band, freq, distance: Math.hypot(ap.x - client.x, ap.y - client.y), pathLoss: pl, wallLoss: walls, width, dl, ul, mgmtDl, mgmtUl, forced, negotiation, utilization: this.utilization(ap) };
        if (negotiation.ok) {
            const n = negotiation, fixed = ap.wifi.mcs === 'auto' ? null : Math.min(+ap.wifi.mcs, STANDARDS[n.standard].maxMcs);
            // Downlink transmit beamforming steers only data PPDUs: beacons and management frames stay omnidirectional.
            const bf = { enabled: !!ap.wifi.beamforming, active: false, txChains: n.apChains, gain: 0, overhead: 0 };
            if (bf.enabled) {
                if (STANDARDS[n.standard].rank < BF_MIN_RANK) bf.reason = `${STANDARDS[n.standard].short} (Wi-Fi 4) sem sondagem NDP padronizada`;
                else if (forced) bf.reason = 'SNR forçada substitui o canal';
                else bf.active = true;
            }
            out.rates = {
                dl: selectRate({ standard: n.standard, width: n.width, gi: n.gi, maxNss: n.nss, rxChains: n.clientChains, snrDb: dl.sinr, fixedMcs: fixed, txChains: bf.active ? n.apChains : 0 }),
                ul: selectRate({ standard: n.standard, width: n.width, gi: n.gi, maxNss: n.nss, rxChains: n.apChains, snrDb: ul.sinr, fixedMcs: fixed }),
            };
            if (bf.active) { bf.gain = out.rates.dl.bfGain; bf.sounding = this.soundingAirtime(out); bf.overhead = bf.sounding / SOUNDING_PERIOD_US; }
            out.beamforming = bf;
            out.fixedMcs = fixed;
        }
        return out;
    }
    // NDPA + SIFS + NDP + SIFS + compressed beamforming report (sent at the uplink data rate), in µs.
    soundingAirtime(l) {
        const n = l.negotiation, nc = l.rates.dl.nss, ul = l.rates.ul;
        const ndp = ppduAirtime(n.standard, n.width, 0, n.apChains, n.gi, 0);
        return legacyAirtime(17 + 4) + TIMING.sifs + ndp + TIMING.sifs + ppduAirtime(n.standard, n.width, ul.mcs, ul.nss, n.gi, bfReportBytes(n.standard, n.width, n.apChains, nc));
    }
    // Saturated TCP goodput of one hop, after co-channel contention and sounding airtime.
    hopGoodput(l, dir) {
        const r = l.rates[dir], n = l.negotiation;
        return aggregateGoodput(n.standard, n.width, r.mcs, r.nss, n.gi, r.per) * (1 - l.utilization) * (1 - (l.beamforming?.overhead || 0));
    }
    beaconPer(link) { return packetErrorRate(streamSnr(link.mgmtDl, 1, link.negotiation.clientChains || 1), 0, 300); }
    scan(client) {
        const bands = clientBands(client.wifi.standard);
        return this.routers.filter(ap => !this.apError(ap) && bands.includes(ap.wifi.band)).map(ap => {
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
            phy = { standard: n.standard, mcs: r.mcs, nss: r.nss, width: n.width, gi: n.gi, rate: r.rate, snr: dir === 'dl' ? link.dl.sinr : link.ul.sinr, per, bf: r.bfGain || 0 };
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
    // Cable hop of a mesh node with Ethernet backhaul: no contention, no loss.
    wired(step, ev, info) {
        this.now += 0.02;
        const [a, b] = step.dir === 'ul' ? [step.node, step.parent] : [step.parent, step.node];
        this.emit({ medium: 'eth', dir: step.dir, from: a.id, to: b.id, proto: ev.proto, info, ok: true, bytes: ev.bytes, layers: [{ name: 'Ethernet II', fields: [['Destino', ev.da || this.mac(b)], ['Origem', ev.sa || this.mac(a)], ['Enlace', 'backhaul cabeado 1 Gb/s']] }, ...ev.layers] });
        return true;
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
        this.note(`${client.name} associado a "${ssid}" via ${ap.name} (${STANDARDS[n.standard].label}, ${n.width} MHz, ${n.nss}×${n.nss} MIMO)`, 'ok', client.id);
        if (link.beamforming?.active) this.sound(link);
        rt.ipSig = ipSignature(client, this.rootOf(ap));
        rt.last = { ok: true, message: `Conectado a "${ssid}".` };
        this.configureIp(client);
        return { ok: true, message: `Conectado a "${ssid}".`, ap };
    }
    clientsOf(ap) { return this.clients.filter(c => this.rt(c.id).assoc?.apId === ap.id); }

    // ---------- beamforming ----------
    // Explicit sounding (VHT/HE/EHT): the AP announces, sends a Null Data PPDU with one training field per antenna,
    // and the client answers with the compressed steering matrix V. Repeated every SOUNDING_PERIOD_US.
    sound(link) {
        const n = link.negotiation, ap = link.ap, c = link.client, bssid = this.mac(ap), sta = this.mac(c), nr = n.apChains, nc = link.rates.dl.nss;
        const bytes = bfReportBytes(n.standard, n.width, nr, nc), angles = nc * (2 * nr - nc - 1);
        this.transmit(link, 'dl', 'mgmt', 21, { proto: '802.11', info: `NDP Announcement · sondagem do canal (${STANDARDS[n.standard].short})`, layers: [mac80211('NDP Announcement (controle)', sta, bssid, bssid), { name: 'Sondagem', fields: [['Beamformer', `${ap.name} · ${nr} antenas`], ['Beamformee', `${c.name} · feedback SU`], ['Nc pedido', nc], ['Agrupamento', 'Ng = 4 subportadoras']] }] });
        this.transmit(link, 'dl', 'bcast', 0, { proto: '802.11', info: `NDP · ${nr} campos de treinamento (LTF), sem dados`, layers: [{ name: 'NDP (Null Data PPDU)', fields: [['Campos LTF', `${nr} — um por antena de transmissão`], ['Carga útil', 'nenhuma'], ['No cliente', `estima a matriz de canal H (${c.wifi.streams}×${nr}) em cada subportadora`]] }] });
        this.transmit(link, 'ul', 'mgmt', bytes, { proto: '802.11', info: `Compressed Beamforming Report · V ${nr}×${nc} · ${bytes} B`, layers: [mac80211('Action No Ack (Beamforming Report)', bssid, sta, bssid), { name: 'Relatório de beamforming', fields: [['Matriz V', `${nr}×${nc} (vetores singulares direitos de H)`], ['Compressão', `${angles} ângulos de Givens φ/ψ por grupo (6 + 4 bits)`], ['SNR por fluxo', `${link.rates.dl.streamSnr.toFixed(1)} dB`], ['Tamanho', `${bytes} bytes`], ['Ganho resultante', `+${link.beamforming.gain.toFixed(1)} dB = 10·log₁₀(${nr}/${nc})`]] }] });
        const rt = this.rt(c.id);
        if (rt.assoc) rt.assoc.sounded = true;
    }

    // ---------- mesh (802.11s-style: one root gateway, bridged nodes, airtime-metric tree) ----------
    meshRole(ap) { return ap?.mesh?.role || 'off'; }
    meshRoot(ap) { return this.routers.find(r => this.meshRole(r) === 'root' && r.mesh.id === ap.mesh.id) || null; }
    // Router that serves DHCP, DNS and NAT for clients of this AP.
    rootOf(ap) { return this.meshRole(ap) === 'node' ? this.meshRoot(ap) || ap : ap; }
    lanClients(router) { return this.clients.filter(c => { const ap = this.associatedAp(c); return ap && this.rootOf(ap) === router; }); }
    meshNodes(root) { return this.routers.filter(n => this.meshRole(n) === 'node' && this.meshRoot(n) === root); }
    // Parent of every reachable node, chosen like HWMP: least cumulative airtime (1/goodput per hop) to the root.
    meshTree() {
        const key = JSON.stringify([this.state.env, this.state.walls, this.routers.map(r => [r.id, r.x, r.y, r.wifi, r.mesh])]);
        if (this.meshCache?.key === key) return this.meshCache.tree;
        const tree = new Map();
        for (const root of this.routers.filter(r => this.meshRole(r) === 'root' && !apConfigError(r))) {
            tree.set(root.id, { root: root.id, parent: null, hops: 0, cost: 0 });
            const settled = [root], pending = new Set(this.meshNodes(root).filter(n => !apConfigError(n)));
            while (pending.size) {
                let best = null;
                const offer = (n, parent, cost, link) => { if (!best || cost < best.cost) best = { n, parent, cost, link }; };
                for (const n of pending) {
                    if (n.mesh.backhaul === 'ethernet') { offer(n, root, 1 / ETHERNET_MBPS, null); continue; }
                    for (const p of settled) {
                        const l = this.link(p, n);
                        if (!l.negotiation.ok || this.beaconPer(l) >= .5 || l.rates.dl.per > PER_TARGET) continue;
                        offer(n, p, tree.get(p.id).cost + 1 / this.hopGoodput(l, 'dl'), l);
                    }
                }
                if (!best) break;
                pending.delete(best.n); settled.push(best.n);
                tree.set(best.n.id, { root: root.id, parent: best.parent.id, hops: tree.get(best.parent.id).hops + 1, cost: best.cost, link: best.link });
            }
        }
        this.meshCache = { key, tree };
        return tree;
    }
    meshError(ap) {
        if (this.meshRole(ap) !== 'node') return null;
        const root = this.meshRoot(ap);
        if (!root) return `Nenhum gateway mesh (raiz) com Mesh ID "${ap.mesh.id}".`;
        if (apConfigError(root)) return `Gateway mesh ${root.name} inativo.`;
        if (!this.meshTree().has(ap.id)) return 'Sem backhaul: nenhum nó da malha ao alcance com PER ≤ 10%.';
        return null;
    }
    apError(ap) { return apConfigError(ap) || this.meshError(ap); }
    // The mesh controller (EasyMesh-style) pushes the root's SSID and credentials to every node; a node whose
    // backhaul shares the client radio must also sit on the root's channel.
    syncMesh() {
        for (const n of this.routers) {
            const root = this.meshRole(n) === 'node' && this.meshRoot(n);
            if (!root) continue;
            Object.assign(n.wifi, { ssid: root.wifi.ssid, security: root.wifi.security, password: root.wifi.password });
            if (n.mesh.backhaul === 'wifi') Object.assign(n.wifi, { band: root.wifi.band, width: root.wifi.width, channel: root.wifi.channel });
        }
    }
    // Routers from this AP up to its mesh root (just [ap] outside a mesh).
    upChain(ap) {
        const tree = this.meshTree(), out = [ap];
        for (let t = tree.get(ap.id); t?.parent; t = tree.get(t.parent)) out.push(this.device(t.parent));
        return out;
    }
    backhaulStep(node, dir) {
        const t = this.meshTree().get(node.id);
        return t.link ? { link: t.link, dir, mesh: true } : { wired: true, dir, node, parent: this.device(t.parent) };
    }
    // Radio (and cable) hops between two devices on one LAN: up the tree to the common ancestor, then down.
    route(src, dst) {
        const start = d => d.type === 'router' ? d : this.associatedAp(d);
        const a = this.upChain(start(src)), b = this.upChain(start(dst)), meet = a.find(x => b.includes(x));
        const steps = src.type === 'router' ? [] : [{ link: this.link(start(src), src), dir: 'ul' }];
        if (!meet) return steps;
        for (const n of a.slice(0, a.indexOf(meet))) steps.push(this.backhaulStep(n, 'ul'));
        for (const n of b.slice(0, b.indexOf(meet)).reverse()) steps.push(this.backhaulStep(n, 'dl'));
        if (dst.type !== 'router') steps.push({ link: this.link(start(dst), dst), dir: 'dl' });
        return steps;
    }
    // Send one frame along a route. ev: { proto, bytes, info, layers (above 802.11), da, sa, bcastLast, lastInfo }.
    carry(steps, ev, offset = 0) {
        return steps.every((s, k) => {
            const i = k + offset, last = k === steps.length - 1;
            const info = (last && ev.lastInfo) || ev.info + (s.mesh ? ' (backhaul mesh)' : s.wired ? ' (backhaul cabeado)' : i > 0 ? ' (repassado pelo AP)' : '');
            if (s.wired) return this.wired(s, ev, info);
            const kind = ev.bcastLast && last ? 'bcast' : 'data';
            return this.transmit(s.link, s.dir, kind, ev.bytes, { proto: ev.proto, info, mesh: !!s.mesh, layers: [this.macHeader(s, ev, kind), ...ev.layers] });
        });
    }
    macHeader(s, ev, kind) {
        const { ap, client } = s.link, up = s.dir === 'ul', bssid = this.mac(ap), sta = this.mac(client);
        const ra = up ? bssid : kind === 'bcast' ? 'ff:ff:ff:ff:ff:ff' : sta, ta = up ? sta : bssid;
        if (!s.mesh) return mac80211('QoS Data', ra, ta, bssid);
        return { name: 'IEEE 802.11 · mesh (4 endereços)', fields: [['Tipo', 'Dados (2)'], ['Subtipo', 'QoS Data · ToDS = FromDS = 1'], ['Endereço 1 (RA)', ra], ['Endereço 2 (TA)', ta], ['Endereço 3 (DA)', ev.da || '—'], ['Endereço 4 (SA)', ev.sa || '—'], ['Mesh Control', `Mesh ID "${client.mesh.id}" · TTL 31`]] };
    }
    // End-to-end saturated goodput: hops on one channel share airtime (1/Σ 1/gᵢ); separate channels and cables
    // run in parallel, so the slowest group bounds the path.
    pathGoodput(steps) {
        const groups = new Map();
        for (const s of steps) {
            if (s.wired) { groups.set(`eth:${s.node.id}`, [ETHERNET_MBPS]); continue; }
            const l = s.link, key = s.mesh && l.client.mesh.backhaul === 'dedicated' ? `bh:${l.client.id}` : `${l.ap.wifi.band}:${l.freq}`;
            groups.set(key, [...(groups.get(key) || []), this.hopGoodput(l, s.dir)]);
        }
        const sums = [...groups.values()].map(g => 1 / g.reduce((a, x) => a + 1 / Math.max(x, 1e-6), 0));
        return { mbps: sums.length ? Math.min(...sums) : ETHERNET_MBPS, sharedHops: Math.max(0, ...[...groups.values()].map(g => g.length)) };
    }
    isolated(src, dst) { return [this.associatedAp(src), this.associatedAp(dst)].some(a => a?.wifi.isolation); }
    // A client whose AP is weak moves to a clearly stronger AP of the same SSID (mesh node or root).
    roamTarget(client, ap, link) {
        if (link.dl.rssi >= ROAM_RSSI) return null;
        return this.scan(client).find(s => s.ap !== ap && s.ssid === ap.wifi.ssid && s.rssi > link.dl.rssi + ROAM_HYSTERESIS)?.ap || null;
    }

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
        // In a mesh the node only bridges: the root router answers DHCP, so frames cross the backhaul too.
        const link = this.link(ap, client), router = this.rootOf(ap), server = router.dhcp, routerMac = this.mac(router);
        const up = this.route(client, router), down = this.route(router, client);
        const xid = '0x' + Math.floor(this.random() * 2 ** 32).toString(16).padStart(8, '0');
        const send = (dir, msg, info, extra) => this.carry(dir === 'ul' ? up : down, { proto: 'DHCP', bytes: 342, info: `DHCP ${msg} · ${info} · xid ${xid}`, da: dir === 'ul' ? 'ff:ff:ff:ff:ff:ff' : sta, sa: dir === 'ul' ? sta : routerMac, layers: [ipLayer(dir === 'ul' ? '0.0.0.0' : router.lan.ip, dir === 'ul' ? '255.255.255.255' : (extra.yiaddr || '255.255.255.255'), 'UDP', 64), udpLayer(dir === 'ul' ? 68 : 67, dir === 'ul' ? 67 : 68), { name: 'DHCP', fields: [['Tipo (opção 53)', msg], ['xid', xid], ['Cliente (chaddr)', sta], ...(extra.fields || [])] }] });
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
        const router = this.rootOf(ap);
        this.carry(this.route(client, router), { proto: 'DHCP', bytes: 342, info: `DHCP RELEASE · devolve ${rt.ip.address}`, layers: [ipLayer(rt.ip.address, router.lan.ip, 'UDP', 128), udpLayer(68, 67), { name: 'DHCP', fields: [['Tipo (opção 53)', 'RELEASE'], ['ciaddr', rt.ip.address]] }] });
        this.rt(router.id).leases.delete(this.mac(client));
        rt.ip = null; rt.arp.clear();
    }
    leases(router) { return [...this.rt(router.id).leases.values()]; }

    // ---------- L2/L3 ----------
    ipOf(dev) { return dev.type === 'router' ? dev.lan.ip : this.rt(dev.id).ip?.address; }
    // Device on the router's LAN that owns `ip` (router itself or a client of any AP bridged to it).
    ownerOf(router, ip, except = null) {
        if (router.lan.ip === ip) return router;
        return this.lanClients(router).find(c => c !== except && this.rt(c.id).ip?.address === ip) || null;
    }
    duplicates(client) {
        const ap = this.associatedAp(client), ip = this.ipOf(client);
        if (!ap || !ip) return [];
        const router = this.rootOf(ap);
        return [router, ...this.lanClients(router)].filter(d => d !== client && this.ipOf(d) === ip);
    }
    arpResolve(src, ip) {
        const rt = this.rt(src.id), ap = this.associatedAp(src);
        if (rt.arp.has(ip)) return rt.arp.get(ip);
        const link = this.link(ap, src), myIp = this.ipOf(src), sta = this.mac(src);
        const owner = this.ownerOf(this.rootOf(ap), ip, src);
        const request = { proto: 'ARP', bytes: 64, info: `ARP Quem tem ${ip}? Responda a ${myIp}`, da: 'ff:ff:ff:ff:ff:ff', sa: sta, layers: [arpLayer('requisição', sta, myIp, '00:00:00:00:00:00', ip)] };
        const reply = owner && { proto: 'ARP', bytes: 64, info: `ARP ${ip} está em ${this.mac(owner)}`, da: sta, sa: this.mac(owner), layers: [arpLayer('resposta', this.mac(owner), ip, sta, myIp)] };
        for (let attempt = 0; attempt < 3; attempt++) {
            if (!this.carry([{ link, dir: 'ul' }], request)) continue;
            if (!owner) { this.now += 1000; continue; }
            const rest = this.route(src, owner).slice(1);
            if (owner.type !== 'router') {
                // The AP rebroadcasts on the downlink at the basic rate, without ACK; isolation blocks STA↔STA.
                if (this.isolated(src, owner)) { this.note(`${ap.name}: isolamento de clientes bloqueou o ARP de ${src.name}.`, 'warn', ap.id); continue; }
                if (!this.carry(rest, { ...request, bcastLast: true, lastInfo: `ARP Quem tem ${ip}? (difusão do AP)` })) continue;
            } else if (!this.carry(rest, request, 1)) continue;
            if (!this.carry(this.route(owner, src), reply)) continue;
            rt.arp.set(ip, { mac: this.mac(owner), device: owner.id, t: this.now });
            return rt.arp.get(ip);
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
        const t0 = this.now, link = this.link(ap, src), hopDev = this.ownerOf(this.rootOf(ap), hop, src);
        const frame = (steps, reply, a, b, ttl, offset) => this.carry(steps, { proto: spec.proto, bytes: spec.bytes, info: spec.info(reply), layers: [ipLayer(a, b, spec.l4, ttl), ...spec.layers(reply)] }, offset);
        if (!frame([{ link, dir: 'ul' }], false, cfg.address, dstIp, ttlOf(src))) return { ok: false, error: 'timeout' };
        let res = null, responder = null;
        if (hopDev?.type === 'router') {
            if (!frame(this.route(src, hopDev).slice(1), false, cfg.address, dstIp, ttlOf(src), 1)) return { ok: false, error: 'timeout' };
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
        if (!frame(this.route(hopDev, src), true, dstIp, cfg.address, ttl)) return { ok: false, error: 'timeout' };
        return { ok: true, rtt: this.now - t0, ttl, responder, value: res };
    }
    // Client → AP (→ mesh backhaul) → client on the same LAN; the first uplink hop was already sent.
    viaAp(src, dst, spec, t0, cfg, dstIp) {
        const ap = this.associatedAp(src);
        if (this.isolated(src, dst)) { this.note(`${ap.name}: isolamento de clientes descartou ${spec.proto} ${src.name} → ${dst.name}.`, 'warn', ap.id); return { ok: false, error: 'timeout', why: 'Isolamento de clientes ativo no AP.' }; }
        const frame = (steps, reply, a, b, ttl, offset) => this.carry(steps, { proto: spec.proto, bytes: spec.bytes, info: spec.info(reply), layers: [ipLayer(a, b, spec.l4, ttl), ...spec.layers(reply)] }, offset);
        if (!frame(this.route(src, dst).slice(1), false, cfg.address, dstIp, ttlOf(src), 1)) return { ok: false, error: 'timeout' };
        const res = spec.at(dst);
        if (!res) return { ok: false, error: 'timeout', why: dst.firewall && spec.proto === 'ICMP' ? `Firewall de ${dst.name} bloqueia ICMP.` : undefined };
        this.now += 0.3 + this.random() * 0.7;
        if (!frame(this.route(dst, src), true, dstIp, cfg.address, ttlOf(dst))) return { ok: false, error: 'timeout' };
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
        if (!gw.some(v => v !== null) || !this.rootOf(ap).wan.connected || !host) { for (let i = 0; i < 3; i++) hops.push({ ip: null, rtts: [null, null, null] }); return { target, ip, hops, incomplete: true }; }
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
        const ap = this.associatedAp(src), root = this.rootOf(ap), far = reach.responder?.type ? reach.responder : root;
        const steps = this.route(src, far), path = this.pathGoodput(steps);
        let total = path.mbps;
        if (!reach.responder?.type) total = Math.min(total, root.wan.bandwidth);
        const intervals = Array.from({ length: seconds }, () => total * (0.94 + 0.1 * this.random()));
        this.emit({ medium: 'wifi', dir: 'ul', kind: 'data', from: src.id, to: ap.id, proto: 'TCP', info: `iperf3 → ${ip}: ${total.toFixed(1)} Mb/s por ${seconds} s`, ok: true, bytes: 1500, attempts: 1, phy: null });
        this.now += seconds * 1000;
        const via = [src, ...steps.map(s => s.wired ? (s.dir === 'ul' ? s.parent : s.node) : s.dir === 'ul' ? s.link.ap : s.link.client)];
        return { ip, intervals, mean: intervals.reduce((a, b) => a + b, 0) / seconds, responder: reach.responder, hops: steps.filter(s => !s.wired).length, sharedHops: path.sharedHops, mesh: steps.some(s => s.mesh || s.wired), path: via.map(d => d.name) };
    }

    // ---------- keep runtime consistent with configuration ----------
    reconcile() {
        this.syncMesh();
        for (const c of this.clients) {
            const rt = this.rt(c.id), ap = this.associatedAp(c);
            if (rt.assoc && !ap) { rt.assoc = null; rt.ip = null; rt.arp.clear(); }
            if (ap) {
                const sig = wifiSignature(ap), cfgError = this.apError(ap);
                if (cfgError || sig !== rt.assoc.signature || c.wifi.ssid !== ap.wifi.ssid || rt.assoc.clientSig !== clientSignature(c)) {
                    this.note(`${c.name}: configuração da rede mudou (${cfgError || 'parâmetros Wi-Fi'}) → reassociação.`, 'warn', c.id);
                    rt.assoc = null; rt.ip = null; rt.arp.clear();
                } else {
                    const l = this.link(ap, c);
                    const roam = l.negotiation.ok && c.wifi.autoConnect && this.roamTarget(c, ap, l);
                    if (!l.negotiation.ok || this.beaconPer(l) > .9) { this.note(`${c.name}: perda de beacons de "${ap.wifi.ssid}" (SNR ${l.mgmtDl.toFixed(1)} dB) → desassociado.`, 'error', c.id); rt.assoc = null; rt.ip = null; rt.arp.clear(); }
                    else if (roam) { this.note(`${c.name}: roaming de ${ap.name} (${l.dl.rssi.toFixed(0)} dBm) para ${roam.name}, sinal mais forte no mesmo SSID.`, 'warn', c.id); this.connect(c); }
                    else {
                        if (rt.ipSig !== ipSignature(c, this.rootOf(ap))) { rt.ipSig = ipSignature(c, this.rootOf(ap)); this.configureIp(c); }
                        if (l.beamforming?.active && !rt.assoc.sounded) this.sound(l);
                    }
                }
            }
            if (!rt.assoc && c.wifi.autoConnect && c.wifi.ssid) this.connect(c);
        }
    }
}

const wifiSignature = ap => JSON.stringify(ap.wifi, (k, v) => ['txPower', 'load', 'mcs', 'antennaGain', 'isolation', 'beamforming'].includes(k) ? undefined : v);
const SOUNDING_PERIOD_US = 20000, ETHERNET_MBPS = 940, ROAM_RSSI = -67, ROAM_HYSTERESIS = 8;
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
