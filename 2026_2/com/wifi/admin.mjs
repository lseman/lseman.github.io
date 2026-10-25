// Router web administration ("192.168.0.1"): pages of a fictional commercial router, rendered inside
// the lab browser. Forms edit a draft copy; app.mjs applies it on "Salvar" after validation.
import { STANDARDS, STANDARD_ORDER, MCS, channelsFor, widthsFor, centerFrequency, pathLoss, spectralOverlap, dbmToMw } from './phy.mjs';
import { SECURITY_OPTIONS, securityLabel, apConfigError, lanConfigError, isIp, formatLease, prefixOf } from './net.mjs';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const ipNum = s => s.split('.').reduce((a, o) => a * 256 + +o, 0);

export const ADMIN_DEFAULT = { user: 'admin', password: 'admin' };
export const adminOf = r => r.admin || ADMIN_DEFAULT;
export const MENU = [
    ['status', 'Status', '/'], ['wireless', 'Rede sem fio', '/wireless'], ['lan', 'LAN e DHCP', '/lan'], ['clients', 'Dispositivos', '/clients'],
    ['dns', 'DNS local', '/dns'], ['wan', 'Internet (WAN)', '/wan'], ['survey', 'Análise de canais', '/survey'], ['system', 'Sistema', '/system'],
];
export const pageOfPath = path => MENU.find(m => m[2] === path.replace(/\/+$/, '') || (m[2] === '/' && (path === '/' || path === '')))?.[0] || null;
const MODEL = { wifi4: 'N300', wifi5: 'AC1200', wifi6: 'AX3000', wifi6e: 'AXE5400', wifi7: 'BE9300' };
export const routerModel = r => `LabNet ${MODEL[r.wifi.standard]}`;
// Editable parts of the router; the draft is a deep copy of these.
export const draftOf = r => structuredClone({ wifi: r.wifi, lan: r.lan, dhcp: r.dhcp, dns: r.dns, wan: r.wan });
// Which draft sections each page saves.
export const PAGE_SECTIONS = { wireless: ['wifi'], lan: ['lan', 'dhcp'], dns: ['dns'], wan: ['wan'] };

// Validate a draft for one page; null when it can be applied.
export function draftError(draft, page) {
    if (page === 'wireless') { const e = apConfigError({ wifi: draft.wifi }); return e === 'Rádio desligado.' ? null : e; }
    if (page === 'lan') return lanConfigError(draft);
    if (page === 'dns') { const bad = draft.dns.records.find(r => !r.name.trim() || !isIp(r.ip)); return bad ? `Registro inválido: "${bad.name}" → "${bad.ip}".` : null; }
    if (page === 'wan') return isIp(draft.wan.ip) ? null : 'IP WAN inválido.';
    return null;
}

// Neighbouring BSSs heard by this AP and a least-interference channel suggestion.
export function channelSurvey(lab, ap) {
    const w = ap.wifi, env = lab.state.env, walls = lab.state.walls;
    const heard = lab.routers.filter(o => o.id !== ap.id && !apConfigError(o) && o.wifi.band === w.band).map(o => {
        const rssi = +o.wifi.txPower + +o.wifi.antennaGain - pathLoss(env, walls, o, ap, o.wifi.band, centerFrequency(o.wifi.band, +o.wifi.channel));
        return { ap: o, rssi, overlap: spectralOverlap(ap, o), coChannel: centerFrequency(o.wifi.band, +o.wifi.channel) === centerFrequency(w.band, +w.channel) && rssi > -82 };
    }).filter(n => n.rssi > -95).sort((a, b) => b.rssi - a.rssi);
    // 2.4 GHz at 20 MHz: only the non-overlapping 1/6/11 are sensible picks.
    const candidates = w.band === '2.4' && +w.width === 20 ? [1, 6, 11] : channelsFor(w.band, +w.width);
    const cost = c => heard.reduce((s, n) => s + spectralOverlap({ ...ap, wifi: { ...w, channel: c } }, n.ap) * dbmToMw(n.rssi), 0);
    const scored = candidates.map(c => ({ channel: c, cost: cost(c) }));
    const best = scored.reduce((a, b) => b.cost < a.cost ? b : a, scored[0]);
    return { heard, best: best?.channel, current: cost(+w.channel), bestCost: best?.cost ?? 0 };
}

const field = (label, input, hint = '') => `<div class="rt-field"><label>${label}</label><div>${input}${hint ? `<small>${hint}</small>` : ''}</div></div>`;
const text = (path, value, extra = '') => `<input type="text" data-rt="${path}" value="${esc(value)}" ${extra}>`;
const num = (path, value, min, max, step = 1) => `<input type="number" data-rt="${path}" data-type="number" value="${value}" min="${min}" max="${max}" step="${step}">`;
const check = (path, value, label) => `<label class="rt-switch"><input type="checkbox" data-rt="${path}" data-type="bool" ${value ? 'checked' : ''}><span></span>${label}</label>`;
const select = (path, value, options, type = 'text') => `<select data-rt="${path}" data-type="${type}">${options.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${String(v) === String(value) ? 'selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`;
const card = (title, body, extra = '') => `<section class="rt-card"><h3>${title}${extra}</h3>${body}</section>`;
const kv = rows => `<dl class="rt-kv">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
const saveBar = dirty => `<div class="rt-save"><button class="rt-btn primary" data-rt-action="save" ${dirty ? '' : 'disabled'}>Salvar</button><button class="rt-btn" data-rt-action="discard" ${dirty ? '' : 'disabled'}>Descartar</button>${dirty ? '<span>Alterações não salvas</span>' : ''}</div>`;
function channelLabel(band, width, c) {
    const f = centerFrequency(band, c);
    if (width === 20) return `${c} · ${f} MHz`;
    if (band === '2.4') return `${c} (${c - 2}+${c + 2}) · ${f} MHz`;
    const span = (width / 2 - 10) / 5;
    return `${c} (${c - span}–${c + span}) · ${f} MHz`;
}

export function renderLogin(r, { msg }) {
    const isDefault = adminOf(r).password === ADMIN_DEFAULT.password;
    return `<div class="rt-login"><div class="rt-login-box">
        <div class="rt-brand big"><span>◈</span> LabNet</div><p>${esc(routerModel(r))} · Gerenciamento web</p>
        ${msg ? `<div class="rt-msg ${msg.kind}">${esc(msg.text)}</div>` : ''}
        <form data-rt-form="login"><input name="user" placeholder="Usuário" autocomplete="off" value="admin"><input name="password" type="password" placeholder="Senha" autocomplete="off"><button class="rt-btn primary">Entrar</button></form>
        <small>${isDefault ? 'Credenciais de fábrica na etiqueta sob o aparelho: <b>admin</b> / <b>admin</b>.' : 'A senha de fábrica foi alterada pelo administrador.'}</small>
    </div></div>`;
}

export function renderAdmin(lab, r, page, { draft, dirty, msg }) {
    const nav = MENU.map(([k, label]) => `<button data-rt-page="${k}" class="${k === page ? 'active' : ''}">${label}</button>`).join('');
    const body = PAGES[page](lab, r, draft, dirty);
    return `<div class="rt-app">
        <header class="rt-top"><div class="rt-brand"><span>◈</span> LabNet</div><span>${esc(routerModel(r))} · firmware 3.2.7 (sim)</span><button class="rt-btn ghost" data-rt-action="logout">Sair</button></header>
        <div class="rt-main"><nav class="rt-nav">${nav}</nav><div class="rt-content">
            ${msg ? `<div class="rt-msg ${msg.kind}">${esc(msg.text)}</div>` : ''}${body}
        </div></div></div>`;
}

const PAGES = {
    status(lab, r) {
        const w = r.wifi, err = apConfigError(r), clients = lab.clientsOf(r), leases = lab.leases(r).filter(l => l.connected), up = lab.now / 1000;
        const warns = [];
        if (adminOf(r).password === ADMIN_DEFAULT.password) warns.push('A senha de administrador ainda é a de fábrica (admin). Altere em <b>Sistema</b>.');
        if (w.security === 'Aberta') warns.push('Rede sem senha: qualquer pessoa pode se conectar e o tráfego não é cifrado.');
        else if (w.security === 'WPA2') warns.push('Somente WPA2: prefira WPA2/WPA3 ou WPA3 (SAE) quando os clientes suportarem.');
        if (w.band === '2.4' && +w.width === 20 && ![1, 6, 11].includes(+w.channel)) warns.push(`Canal ${w.channel} em 2,4 GHz sobrepõe dois dos canais 1/6/11 usados pelos vizinhos.`);
        if (w.band === '2.4' && +w.width === 40) warns.push('40 MHz em 2,4 GHz ocupa quase toda a banda e interfere nos vizinhos.');
        return `<h2>Status</h2>${warns.map(t => `<div class="rt-msg warn">${t}</div>`).join('')}<div class="rt-grid">
            ${card('Sistema', kv([['Modelo', esc(routerModel(r))], ['MAC LAN', lab.mac(r)], ['Tempo ligado', `${up.toFixed(1)} s`], ['Nome do host', `${esc(lab.hostname(r))}.lan`]]))}
            ${card('Internet', kv([['Estado', r.wan.connected ? '<b class="ok">Conectado</b>' : '<b class="bad">Desconectado</b>'], ['IP WAN', esc(r.wan.ip)], ['Velocidade', `${r.wan.bandwidth} Mb/s`], ['NAT', 'ativo']]))}
            ${card('Rede sem fio', kv([['Estado', err ? `<b class="bad">${esc(err)}</b>` : '<b class="ok">Transmitindo</b>'], ['SSID', esc(w.ssid)], ['Padrão', esc(STANDARDS[w.standard].label)], ['Canal', `${esc(w.band)} GHz · ${channelLabel(w.band, +w.width, +w.channel)} · ${w.width} MHz`], ['Segurança', esc(securityLabel(w.security, w.band))], ['Clientes', clients.length]]))}
            ${card('LAN', kv([['IP', `${esc(r.lan.ip)} /${isIp(r.lan.mask) ? prefixOf(r.lan.mask) : '?'}`], ['DHCP', r.dhcp.enabled ? `${esc(r.dhcp.start)} – ${esc(r.dhcp.end)}` : 'desativado'], ['Concessões ativas', leases.length], ['DNS', r.dns.enabled ? 'servidor local ativo' : 'desativado']]))}
        </div>`;
    },
    wireless(lab, r, d, dirty) {
        const w = d.wifi, std = STANDARDS[w.standard], f0 = centerFrequency(w.band, +w.channel) - w.width / 2;
        return `<h2>Rede sem fio</h2>
        ${card('Básico', `${field('Rádio', check('wifi.enabled', w.enabled, 'Habilitado'))}
            ${field('Nome da rede (SSID)', text('wifi.ssid', w.ssid, 'maxlength="32"'), 'até 32 caracteres; anunciado nos beacons')}
            ${field('Segurança', select('wifi.security', w.security, SECURITY_OPTIONS.map(s => [s, securityLabel(s, w.band)])), w.band === '6' ? '6 GHz exige WPA3 (SAE) ou OWE' : '')}
            ${w.security !== 'Aberta' ? field('Senha', text('wifi.password', w.password, 'maxlength="63"'), '8 a 63 caracteres') : ''}`)}
        ${card('Rádio', `${field('Modo', select('wifi.standard', w.standard, STANDARD_ORDER.map(s => [s, STANDARDS[s].label])))}
            ${field('Banda', select('wifi.band', w.band, std.bands.map(b => [b, `${b} GHz`])))}
            ${field('Largura do canal', select('wifi.width', w.width, widthsFor(w.standard, w.band).map(x => [x, `${x} MHz`]), 'number'))}
            ${field('Canal', select('wifi.channel', w.channel, channelsFor(w.band, +w.width).map(c => [c, channelLabel(w.band, +w.width, c)]), 'number'), `ocupa ${f0}–${f0 + +w.width} MHz · veja <a href="#" data-rt-page="survey">Análise de canais</a>`)}
            ${field('Potência de transmissão', num('wifi.txPower', w.txPower, 0, 30), 'dBm')}
            ${field('Fluxos espaciais (MIMO)', select('wifi.streams', w.streams, [1, 2, 3, 4, 8].filter(n => n <= std.maxStreams).map(n => [n, `${n}×${n}`]), 'number'))}`)}
        ${card('Avançado', `${field('Intervalo de guarda', select('wifi.gi', w.gi, std.gis.map(g => [g, `${g} µs`]), 'number'))}
            ${field('Taxa (MCS)', select('wifi.mcs', w.mcs, [['auto', 'Automática'], ...MCS.slice(0, std.maxMcs + 1).map((m, i) => [i, `MCS ${i} · ${m.label} ${m.code}`])]))}
            ${field('Isolamento de clientes', check('wifi.isolation', w.isolation, 'Bloquear tráfego entre dispositivos Wi-Fi'), 'rede de convidados')}`)}
        ${saveBar(dirty)}`;
    },
    lan(lab, r, d, dirty) {
        const p = d.dhcp, size = isIp(p.start) && isIp(p.end) ? Math.max(0, ipNum(p.end) - ipNum(p.start) + 1) : 0;
        return `<h2>LAN e DHCP</h2>
        ${card('Endereço do roteador', `${field('Endereço IP', text('lan.ip', d.lan.ip), 'também é o gateway e o endereço desta página')}
            ${field('Máscara de sub-rede', text('lan.mask', d.lan.mask), isIp(d.lan.mask) ? `/${prefixOf(d.lan.mask)}` : '')}`)}
        ${card('Servidor DHCP', `${field('DHCP', check('dhcp.enabled', p.enabled, 'Distribuir endereços automaticamente'))}
            ${field('Endereço inicial', text('dhcp.start', p.start))}
            ${field('Endereço final', text('dhcp.end', p.end), `${size} endereço(s) no pool`)}
            ${field('Tempo de concessão', num('dhcp.lease', p.lease, 60, 604800, 60), `segundos · ${formatLease(+p.lease)}`)}
            ${field('DNS primário', text('dhcp.dns1', p.dns1), 'opção 6 do DHCP')}
            ${field('DNS secundário', text('dhcp.dns2', p.dns2))}`)}
        ${saveBar(dirty)}`;
    },
    clients(lab, r) {
        const rows = lab.clientsOf(r).map(c => {
            const l = lab.link(r, c);
            return `<tr><td>${esc(c.name)}</td><td>${esc(lab.ipOf(c) || '—')}</td><td>${lab.mac(c)}</td><td>${l.dl.rssi.toFixed(0)} dBm</td><td>${l.rates ? `${l.rates.dl.rate.toFixed(0)} / ${l.rates.ul.rate.toFixed(0)}` : '—'}</td><td>${esc(STANDARDS[l.negotiation.standard]?.short || '—')}</td><td><button class="rt-btn small" data-rt-action="deauth" data-id="${c.id}">Desconectar</button></td></tr>`;
        }).join('');
        const leases = lab.leases(r).map(l => `<tr><td>${esc(l.hostname)}</td><td>${l.ip}</td><td>${l.mac}</td><td>${l.connected ? 'ativa' : 'expirada / livre'}</td></tr>`).join('');
        return `<h2>Dispositivos</h2>
        ${card('Conectados ao Wi-Fi', `<table class="rt-table"><tr><th>Nome</th><th>IP</th><th>MAC</th><th>Sinal</th><th>Taxa ↓/↑ (Mb/s)</th><th>Modo</th><th></th></tr>${rows || '<tr><td colspan="7">nenhum dispositivo</td></tr>'}</table>`)}
        ${card('Concessões DHCP', `<table class="rt-table"><tr><th>Host</th><th>IP</th><th>MAC</th><th>Estado</th></tr>${leases || '<tr><td colspan="4">nenhuma</td></tr>'}</table>`)}`;
    },
    dns(lab, r, d, dirty) {
        const rows = d.dns.records.map((rec, i) => `<tr><td>${text(`dns.records.${i}.name`, rec.name)}</td><td>${text(`dns.records.${i}.ip`, rec.ip)}</td><td><button class="rt-btn small" data-rt-action="del-record" data-index="${i}">Remover</button></td></tr>`).join('');
        return `<h2>DNS local</h2>
        ${card('Servidor DNS', `${field('Servidor', check('dns.enabled', d.dns.enabled, 'Responder nomes locais e encaminhar os demais'))}
            <table class="rt-table"><tr><th>Nome</th><th>Endereço IP</th><th></th></tr>${rows || '<tr><td colspan="3">nenhum registro estático</td></tr>'}</table>
            <button class="rt-btn" data-rt-action="add-record">+ Adicionar registro</button>`)}
        ${card('Nomes automáticos', `<p class="rt-note">${esc(lab.hostname(r))}.lan, roteador.lan e o nome de cada cliente DHCP (<i>host</i>.lan) são resolvidos automaticamente.</p>`)}
        ${saveBar(dirty)}`;
    },
    wan(lab, r, d, dirty) {
        return `<h2>Internet (WAN)</h2>
        ${card('Conexão', `${field('Link WAN', check('wan.connected', d.wan.connected, 'Cabo do provedor conectado'))}
            ${field('IP público (NAT)', text('wan.ip', d.wan.ip), 'endereço que a Internet vê; os clientes saem por NAT')}
            ${field('Velocidade contratada', num('wan.bandwidth', d.wan.bandwidth, 1, 10000, 10), 'Mb/s')}`)}
        ${saveBar(dirty)}`;
    },
    survey(lab, r) {
        const s = channelSurvey(lab, r), w = r.wifi;
        const rows = s.heard.map(n => `<tr class="${n.overlap ? 'hit' : ''}"><td>${esc(n.ap.wifi.ssid)}</td><td>${n.ap.wifi.channel}</td><td>${n.ap.wifi.width} MHz</td><td>${n.rssi.toFixed(0)} dBm</td><td>${n.overlap ? (n.coChannel ? 'mesmo canal (CSMA divide o tempo)' : `${(100 * n.overlap).toFixed(0)}% sobreposto`) : '—'}</td></tr>`).join('');
        const better = s.best !== undefined && s.best !== +w.channel && s.bestCost < s.current * .5;
        return `<h2>Análise de canais</h2>
        ${card(`Redes vizinhas em ${w.band} GHz`, `<table class="rt-table"><tr><th>SSID</th><th>Canal</th><th>Largura</th><th>Sinal aqui</th><th>Conflito com o canal ${w.channel}</th></tr>${rows || '<tr><td colspan="5">nenhuma rede ouvida</td></tr>'}</table>`)}
        ${card('Recomendação', better
            ? `<p class="rt-note">O canal <b>${s.best}</b> recebe bem menos energia dos vizinhos que o canal atual (${w.channel}).</p><button class="rt-btn primary" data-rt-action="use-channel" data-channel="${s.best}">Usar o canal ${s.best}</button>`
            : `<p class="rt-note">O canal atual (${w.channel}) já é ${s.heard.length ? 'a melhor opção encontrada' : 'livre de vizinhos'}.${w.band === '2.4' ? ' Em 2,4 GHz use apenas 1, 6 ou 11 a 20 MHz.' : ''}</p>`)}`;
    },
    system(lab, r) {
        return `<h2>Sistema</h2>
        ${card('Senha de administrador', `<form data-rt-form="password" class="rt-form">${field('Senha atual', '<input type="password" name="old" autocomplete="off">')}${field('Nova senha', '<input type="password" name="new" autocomplete="off">', 'mínimo de 8 caracteres')}${field('Confirmar', '<input type="password" name="confirm" autocomplete="off">')}<button class="rt-btn primary">Alterar senha</button></form>`)}
        ${card('Manutenção', `<div class="rt-inline"><button class="rt-btn" data-rt-action="reboot">Reiniciar</button><button class="rt-btn danger" data-rt-action="factory">Restaurar padrões de fábrica</button></div><p class="rt-note">Reiniciar desconecta todos os clientes, que se reassociam em seguida. A restauração apaga a configuração (SSID, senha, LAN, DHCP).</p>`)}`;
    },
};
