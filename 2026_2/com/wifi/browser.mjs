// Lab web browser: opened from a client (requests travel over Wi-Fi through Lab.http) or from a router
// (an admin PC on a LAN port, which reaches only the router). Hosts the router admin pages of admin.mjs.
import { parseUrl, makeRouter } from './net.mjs';
import { renderAdmin, renderLogin, adminOf, draftOf, draftError, pageOfPath, MENU, PAGE_SECTIONS } from './admin.mjs';

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const setPath = (obj, path, value) => { const keys = path.split('.'), last = keys.pop(); let o = obj; for (const k of keys) o = o[k]; o[last] = value; };

// env: { lab(), changed(), normalizeAp(ap) }
export function createBrowser(env) {
    let b = null;
    const lab = () => env.lab();

    function open(device) {
        const wired = device.type === 'router';
        b = { from: device.id, url: wired ? `http://${device.lan.ip}/` : '', view: { kind: 'blank' }, auth: b?.from === device.id ? b.auth : new Set(), draft: null, dirty: false, msg: null };
        $('#browser').hidden = false;
        if (wired) navigate(b.url); else render();
        $('#br-url').focus();
    }
    function close() { $('#browser').hidden = true; b = null; }

    function request(url, method = 'GET') {
        const from = lab().device(b.from);
        if (from.type !== 'router') return lab().http(from, url, { method });
        const u = parseUrl(url);
        if (!u) return { ok: false, error: 'badurl' };
        const own = [from.lan.ip, 'roteador.lan', 'router.lan', `${lab().hostname(from)}.lan`].includes(u.host);
        return own ? { ok: true, ...u, value: { router: from } } : { ok: false, error: 'wired', ...u };
    }
    const base = () => `http://${parseUrl(b.url)?.host || ''}`;

    function navigate(url) {
        const res = request(url);
        if (res.host) b.url = `http://${res.host}${res.path}`;
        $('#br-url').value = b.url;
        b.msg = null;
        if (!res.ok) b.view = { kind: 'error', res };
        else if (res.value?.site) b.view = { kind: 'site', site: res.value.site, host: res.host };
        else {
            const r = res.value.router, page = pageOfPath(res.path);
            if (!page) b.view = { kind: 'notfound', path: res.path };
            else { b.view = { kind: 'router', routerId: r.id, page }; b.draft = draftOf(r); b.dirty = false; }
        }
        render();
        return res;
    }
    const go = page => navigate(`${base()}${MENU.find(m => m[0] === page)[2]}`);
    // Form submissions travel over the network too: a router that became unreachable cannot apply them.
    function post(path = parseUrl(b.url)?.path || '/') {
        const res = request(`${base()}${path}`, 'POST');
        if (!res.ok) { b.view = { kind: 'error', res }; render(); }
        return res.ok ? res.value.router : null;
    }

    // After a change, tell the user when their own device lost the path to this page.
    function connectivityNote(r, oldIp) {
        const from = lab().device(b.from);
        if (from.type === 'router') return r.lan.ip !== oldIp ? ` O roteador agora responde em http://${r.lan.ip}/.` : '';
        if (!lab().associatedAp(from)) return ' Atenção: este dispositivo perdeu a associação Wi-Fi (SSID, senha ou rádio mudaram). Reconecte-o à nova rede para voltar a esta página.';
        if (r.lan.ip !== oldIp) return ` O endereço do roteador mudou para http://${r.lan.ip}/ — esta página não responde mais em ${oldIp}. Renove o IP do dispositivo (DHCP) se ele ficou em outra sub-rede.`;
        return '';
    }

    function save() {
        const page = b.view.page, err = draftError(b.draft, page);
        if (err) { b.msg = { kind: 'error', text: `Não salvo: ${err}` }; return render(); }
        const r = post(); if (!r) return;
        const oldIp = r.lan.ip;
        for (const sec of PAGE_SECTIONS[page]) r[sec] = structuredClone(b.draft[sec]);
        env.normalizeAp(r);
        env.changed();
        b.draft = draftOf(r); b.dirty = false;
        b.msg = { kind: 'ok', text: `Configurações salvas e aplicadas.${connectivityNote(r, oldIp)}` };
        render();
    }

    function action(name, el) {
        const r = lab().device(b.view.routerId);
        if (name === 'discard') { b.draft = draftOf(r); b.dirty = false; b.msg = null; }
        else if (name === 'save') return save();
        else if (name === 'logout') { b.auth.delete(r.id); b.msg = null; }
        else if (name === 'add-record') { b.draft.dns.records.push({ name: 'novo.lan', ip: b.draft.lan.ip }); b.dirty = true; }
        else if (name === 'del-record') { b.draft.dns.records.splice(+el.dataset.index, 1); b.dirty = true; }
        else if (name === 'use-channel') { go('wireless'); b.draft.wifi.channel = +el.dataset.channel; b.dirty = true; b.msg = { kind: 'info', text: `Canal ${el.dataset.channel} selecionado. Clique em Salvar para aplicar.` }; }
        else if (name === 'deauth') {
            const c = lab().device(el.dataset.id);
            if (!post('/clients')) return;
            lab().disconnect(c, 'Desautenticado pelo administrador (página web)');
            env.changed();
            b.msg = { kind: 'ok', text: `${c.name} desautenticado.${c.wifi.autoConnect ? ' Como ele reconecta automaticamente, já voltou a se associar (veja o log).' : ''}` };
        } else if (name === 'reboot') {
            if (!post('/system')) return;
            for (const c of lab().clientsOf(r)) lab().disconnect(c, `${r.name} reiniciando`);
            env.changed();
            b.msg = { kind: 'info', text: 'Roteador reiniciado: os clientes foram desconectados e se reassociaram.' };
        } else if (name === 'factory') {
            if (!confirm('Restaurar os padrões de fábrica? SSID, senhas, LAN e DHCP voltam ao original.')) return;
            if (!post('/system')) return;
            const def = makeRouter(r.id, r.name, r.x, r.y), oldIp = r.lan.ip;
            for (const sec of ['wifi', 'lan', 'dhcp', 'dns', 'wan', 'admin']) r[sec] = def[sec];
            env.changed();
            b.auth.delete(r.id); b.draft = draftOf(r);
            b.msg = { kind: 'info', text: `Padrões de fábrica restaurados (SSID LabWiFi, senha senha1234, admin/admin).${connectivityNote(r, oldIp)}` };
        }
        render();
    }

    function submit(form) {
        const data = Object.fromEntries(new FormData(form)), kind = form.dataset.rtForm;
        const r = post(kind === 'login' ? '/login' : '/system'); if (!r) return;
        const cred = adminOf(r);
        if (kind === 'login') {
            if (data.user === cred.user && data.password === cred.password) { b.auth.add(r.id); b.msg = null; }
            else b.msg = { kind: 'error', text: 'Usuário ou senha incorretos.' };
        } else if (kind === 'password') {
            if (data.old !== cred.password) b.msg = { kind: 'error', text: 'Senha atual incorreta.' };
            else if (data.new.length < 8) b.msg = { kind: 'error', text: 'A nova senha precisa de pelo menos 8 caracteres.' };
            else if (data.new !== data.confirm) b.msg = { kind: 'error', text: 'A confirmação não confere.' };
            else { r.admin = { user: cred.user, password: data.new }; env.changed(); b.msg = { kind: 'ok', text: 'Senha de administrador alterada.' }; }
        }
        render();
    }

    function render() {
        if (!b || $('#browser').hidden) return;
        const from = lab().device(b.from);
        if (!from) return close();
        const cfg = from.type === 'router' ? null : lab().rt(from.id).ip;
        $('#br-title').textContent = `Navegador — ${from.name}`;
        $('#br-sub').textContent = from.type === 'router' ? `PC de administração na porta LAN de ${from.name}` : cfg ? `IP ${cfg.address} · gateway ${cfg.gateway || '—'}` : 'sem endereço IP';
        if (document.activeElement !== $('#br-url')) $('#br-url').value = b.url;
        $('#br-lock').textContent = b.url ? 'Não seguro' : '';
        const el = $('#br-page'), v = b.view, active = document.activeElement?.dataset?.rt;
        if (v.kind === 'router') {
            const r = lab().device(v.routerId);
            el.innerHTML = r ? (b.auth.has(r.id) ? renderAdmin(lab(), r, v.page, b) : renderLogin(r, b)) : errorPage({ error: 'timeout', host: parseUrl(b.url)?.host }, from);
        } else if (v.kind === 'error') el.innerHTML = errorPage(v.res, from);
        else if (v.kind === 'site') el.innerHTML = `<div class="br-site"><h1>${esc(v.host)}</h1><p>Página de exemplo da Internet simulada (${esc(v.site.ip)}).</p><p>A requisição saiu pelo gateway, atravessou o NAT do roteador e voltou: veja os quadros TCP no log de eventos.</p></div>`;
        else if (v.kind === 'notfound') el.innerHTML = `<div class="br-error"><h1>404 — Não encontrado</h1><p>O roteador não tem a página <code>${esc(v.path)}</code>.</p><button class="rt-btn" data-br-go="${base()}/">Ir para o início</button></div>`;
        else el.innerHTML = `<div class="br-error"><h1>Nova aba</h1><p>Digite na barra de endereço o IP do roteador para abrir o painel de administração.</p>
            <p class="hint">Dica: é o <b>gateway padrão</b> do dispositivo. Descubra com <code>ipconfig</code> (Windows) ou <code>ip route</code> (Linux/Android) no terminal.</p></div>`;
        if (active) el.querySelector(`[data-rt="${active}"]`)?.focus();
    }

    function errorPage(res, from) {
        const gw = from.type === 'router' ? null : lab().rt(from.id).ip?.gateway;
        const [code, text] = {
            badurl: ['ERR_INVALID_URL', 'Endereço inválido. Use algo como 192.168.0.1 ou http://roteador.lan.'],
            wired: ['ERR_ADDRESS_UNREACHABLE', `Este PC está ligado apenas à porta LAN do roteador. Acesse o próprio roteador: http://${from.lan?.ip}/.`],
            noassoc: ['ERR_INTERNET_DISCONNECTED', 'O dispositivo não está associado a nenhuma rede Wi-Fi. Conecte-o pelo inspetor (aba Wi-Fi).'],
            noip: ['ERR_ADDRESS_UNREACHABLE', 'O dispositivo está associado mas não tem endereço IP: o DHCP respondeu? Tente renovar o IP.'],
            nogw: ['ERR_ADDRESS_UNREACHABLE', 'Sem gateway padrão configurado: só endereços da própria sub-rede são alcançáveis.'],
            dns: ['ERR_NAME_NOT_RESOLVED', res.message || 'O nome não pôde ser resolvido.'],
            unreachable: ['ERR_ADDRESS_UNREACHABLE', `Ninguém respondeu ao ARP por ${res.ip || res.host} na rede local.`],
            timeout: ['ERR_CONNECTION_TIMED_OUT', res.why || `${res.host} não respondeu. Nem todo IP é um servidor web: os clientes não respondem na porta 80.`],
        }[res.error] || ['ERR_FAILED', res.error];
        return `<div class="br-error"><h1>Não é possível acessar ${esc(res.host || 'este site')}</h1><p>${esc(text)}</p><code class="br-code">${code}</code>
            ${gw && res.host !== gw ? `<p class="hint">Gateway padrão deste dispositivo: <a href="#" data-br-go="http://${gw}/">${gw}</a></p>` : ''}
            <button class="rt-btn" data-br-action="reload">Tentar novamente</button></div>`;
    }

    function bind() {
        $('#br-form').addEventListener('submit', e => { e.preventDefault(); const v = $('#br-url').value.trim(); if (v) navigate(v); });
        $('#br-reload').onclick = () => { if (b?.url) navigate(b.url); };
        $('#br-close').onclick = close;
        const page = $('#br-page');
        page.addEventListener('change', e => {
            const el = e.target, path = el.dataset.rt; if (!path || !b?.draft) return;
            let v = el.type === 'checkbox' ? el.checked : el.value;
            if (el.dataset.type === 'number') v = +v;
            if (path === 'wifi.mcs' && v !== 'auto') v = +v;
            setPath(b.draft, path, v);
            if (path.startsWith('wifi.')) env.normalizeAp(b.draft);
            b.dirty = true; render();
        });
        page.addEventListener('submit', e => { const f = e.target.closest('[data-rt-form]'); if (f) { e.preventDefault(); submit(f); } });
        page.addEventListener('click', e => {
            const nav = e.target.closest('[data-rt-page]');
            if (nav) { e.preventDefault(); if (b.dirty && !confirm('Descartar as alterações não salvas?')) return; return go(nav.dataset.rtPage); }
            const link = e.target.closest('[data-br-go]');
            if (link) { e.preventDefault(); return navigate(link.dataset.brGo); }
            if (e.target.closest('[data-br-action="reload"]')) return navigate(b.url);
            const btn = e.target.closest('[data-rt-action]');
            if (btn) action(btn.dataset.rtAction, btn);
        });
    }

    return { open, close, render, bind, navigate, get state() { return b; } };
}
