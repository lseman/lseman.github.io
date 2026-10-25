// Terminal command interpreter. Accepts Windows (ipconfig, tracert, netsh) and Linux/Android
// (ip, ifconfig, traceroute, nmcli, iw) spellings on every device.
import { STANDARDS, MCS } from './phy.mjs';
import { isIp, prefixOf, formatLease, securityLabel } from './net.mjs';

const fmtMs = ms => ms < 1 ? '<1ms' : `${Math.round(ms)}ms`;
const tokenize = line => (line.match(/"[^"]*"|'[^']*'|\S+/g) || []).map(t => t.replace(/^["']|["']$/g, ''));

export const HELP = [
    'Comandos disponíveis (sintaxe Windows ou Linux):',
    '  ipconfig [/all | /release | /renew]   ip a | ifconfig      configuração IP',
    '  ping [-n N | -c N] [-l bytes] <host>                         teste ICMP',
    '  tracert | traceroute <host>                                  rota até o destino',
    '  nslookup <nome> [servidor]                                   consulta DNS',
    '  arp -a                                                       tabela ARP',
    '  netsh wlan show interfaces | iw dev wlan0 link               estado do enlace Wi-Fi',
    '  netsh wlan show networks | nmcli dev wifi                    redes visíveis',
    '  nmcli dev wifi connect <SSID> [password <senha>]             conectar',
    '  netsh wlan connect name=<SSID> [key=<senha>]                 conectar',
    '  netsh wlan disconnect | nmcli dev disconnect wlan0           desconectar',
    '  iperf3 -c <host> [-t s]                                      vazão TCP',
    '  hostname, clear | cls, help',
];

export function runCommand(lab, device, line) {
    const args = tokenize(line.trim()), cmd = (args[0] || '').toLowerCase(), out = [];
    const p = s => out.push(s);
    if (!cmd) return out;
    if (device.type === 'router') return routerCommand(lab, device, args);
    switch (cmd) {
        case 'help': case '?': return [...HELP];
        case 'hostname': p(lab.hostname(device)); break;
        case 'ipconfig': return ipconfig(lab, device, args.slice(1));
        case 'ifconfig': case 'ip': return ipShow(lab, device);
        case 'ping': return ping(lab, device, args.slice(1));
        case 'tracert': case 'traceroute': return trace(lab, device, args.at(-1), cmd === 'tracert');
        case 'nslookup': case 'dig': case 'host': return nslookup(lab, device, args[1]);
        case 'arp': return arp(lab, device);
        case 'netsh': return netsh(lab, device, args.slice(1));
        case 'nmcli': return nmcli(lab, device, args.slice(1));
        case 'iw': case 'iwconfig': return linkInfo(lab, device, 'linux');
        case 'iperf': case 'iperf3': return iperf(lab, device, args.slice(1));
        default: p(`'${args[0]}' não é reconhecido como um comando. Digite help.`);
    }
    return out;
}

function routerCommand(lab, router, args) {
    const cmd = args[0].toLowerCase();
    if (cmd === 'help') return ['Console do roteador: show clients | show leases | show wifi | show dns'];
    if (cmd !== 'show') return [`Comando desconhecido: ${args[0]}. Use help.`];
    const what = (args[1] || '').toLowerCase();
    if (what === 'clients') return ['MAC                IP               Nome              SNR   MCS', ...lab.clientsOf(router).map(c => { const l = lab.link(router, c); return `${lab.mac(c)}  ${(lab.ipOf(c) || '—').padEnd(15)}  ${c.name.padEnd(16)}  ${l.dl.sinr.toFixed(0).padStart(3)}dB  ${l.rates?.dl?.mcs ?? '—'}`; })];
    if (what === 'leases') return ['IP               MAC                Hostname          Estado', ...lab.leases(router).map(l => `${l.ip.padEnd(15)}  ${l.mac}  ${l.hostname.padEnd(16)}  ${l.connected ? 'ativo' : 'expirando'}`)];
    if (what === 'wifi') { const w = router.wifi; return [`SSID ${w.ssid} · ${STANDARDS[w.standard].label} · ${w.band} GHz canal ${w.channel} · ${w.width} MHz · ${w.streams} fluxos · ${w.txPower} dBm`]; }
    if (what === 'dns') return router.dns.records.map(r => `${r.name}  A  ${r.ip}`).concat(lab.leases(router).filter(l => l.connected).map(l => `${l.hostname}.lan  A  ${l.ip}  (DHCP)`));
    return ['show clients | show leases | show wifi | show dns'];
}

function ipconfig(lab, dev, args) {
    const flag = (args[0] || '').toLowerCase(), out = [];
    if (flag === '/release') { lab.release(dev); out.push('Configuração IP liberada (DHCPRELEASE).'); }
    if (flag === '/renew') {
        if (!lab.associatedAp(dev)) return ['Não há nenhuma operação possível enquanto a mídia estiver desconectada.'];
        if (dev.ip.mode !== 'dhcp') return ['O adaptador está configurado com IP estático: /renew não se aplica.'];
        const r = lab.dhcp(dev); if (!r.ok) out.push(`Erro ao renovar: ${r.message}`);
    }
    const rt = lab.rt(dev.id), ap = lab.associatedAp(dev), ip = rt.ip;
    out.push('', 'Adaptador de Rede sem Fio Wi-Fi:', '');
    if (!ap) { out.push('   Estado da mídia. . . . . . . . . . : mídia desconectada'); return out; }
    if (flag === '/all') {
        out.push(`   Descrição . . . . . . . . . . . . : ${STANDARDS[dev.wifi.standard].label} ${dev.wifi.streams}x${dev.wifi.streams}`);
        out.push(`   Endereço Físico . . . . . . . . . : ${lab.mac(dev).toUpperCase().replaceAll(':', '-')}`);
        out.push(`   DHCP Habilitado . . . . . . . . . : ${dev.ip.mode === 'dhcp' ? 'Sim' : 'Não'}`);
    }
    if (!ip) { out.push('   Sem endereço IPv4 configurado.'); return out; }
    const dup = lab.duplicates(dev);
    out.push(`   Endereço IPv4 . . . . . . . . . . : ${ip.address}${ip.source === 'apipa' ? ' (autoconfiguração APIPA)' : ''}${dup.length ? ` (DUPLICADO — também em ${dup.map(d => d.name).join(', ')})` : ''}`);
    out.push(`   Máscara de Sub-rede . . . . . . . : ${ip.mask}`);
    out.push(`   Gateway Padrão. . . . . . . . . . : ${ip.gateway || ''}`);
    if (flag === '/all') {
        out.push(`   Servidores DNS. . . . . . . . . . : ${ip.dns.join(', ') || '—'}`);
        if (ip.source === 'dhcp') { out.push(`   Servidor DHCP . . . . . . . . . . : ${ip.server}`); out.push(`   Concessão (lease) . . . . . . . . : ${formatLease(ip.lease)}`); }
    }
    return out;
}
function ipShow(lab, dev) {
    const ip = lab.rt(dev.id).ip, ap = lab.associatedAp(dev);
    return ['1: lo: <LOOPBACK,UP> inet 127.0.0.1/8', `2: wlan0: <BROADCAST,MULTICAST${ap ? ',UP,LOWER_UP' : ''}> state ${ap ? 'UP' : 'DOWN'}`, `    link/ether ${lab.mac(dev)}`, ...(ip ? [`    inet ${ip.address}/${prefixOf(ip.mask)} ${ip.source === 'dhcp' ? 'dynamic ' : ''}scope global wlan0`, `    gateway ${ip.gateway || '—'} · dns ${ip.dns.join(', ') || '—'}`] : [])];
}

const errorText = (r, src, windows) => ({
    noassoc: 'Falha na transmissão. Mídia desconectada.',
    noip: 'Falha na transmissão. Falha geral (sem endereço IP).',
    nogw: 'Falha na transmissão. Falha geral (destino fora da sub-rede e sem gateway).',
    unreachable: `Resposta de ${src}: Host de destino inacessível.`,
    timeout: windows ? 'Esgotado o tempo limite do pedido.' : 'Request timeout',
})[r.error] || 'Erro.';

function ping(lab, dev, args) {
    let count = 4, size = 32, target = null;
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-n' || args[i] === '-c') count = Math.max(1, Math.min(50, +args[++i] || 4));
        else if (args[i] === '-l' || args[i] === '-s') size = Math.max(0, Math.min(65500, +args[++i] || 32));
        else target = args[i];
    }
    if (!target) return ['Uso: ping [-n contagem] [-l tamanho] <destino>'];
    const windows = dev.os === 'windows', r = lab.ping(dev, target, { count, size });
    if (r.error) return [r.error === 'nxdomain' || r.error === 'dnstimeout' || r.error === 'nodns' ? `A solicitação ping não pôde encontrar o host ${target}. ${r.message}` : `Falha geral: ${r.message}`];
    const src = lab.ipOf(dev) || '0.0.0.0', out = [windows ? `Disparando ${target}${target !== r.ip ? ` [${r.ip}]` : ''} com ${size} bytes de dados:` : `PING ${target} (${r.ip}) ${size}(${size + 28}) bytes of data.`];
    const why = new Set();
    for (const x of r.replies) {
        if (x.ok) out.push(windows ? `Resposta de ${r.ip}: bytes=${size} tempo${x.rtt < 1 ? '' : '='}${fmtMs(x.rtt)} TTL=${x.ttl}` : `${size + 8} bytes from ${r.ip}: icmp_seq=${x.seq} ttl=${x.ttl} time=${x.rtt.toFixed(1)} ms`);
        else { out.push(errorText(x, src, windows)); if (x.why) why.add(x.why); }
    }
    const ok = r.replies.filter(x => x.ok), lost = r.replies.length - ok.length;
    out.push('', `Estatísticas do Ping para ${r.ip}:`, `    Pacotes: Enviados = ${r.replies.length}, Recebidos = ${ok.length}, Perdidos = ${lost} (${Math.round(100 * lost / r.replies.length)}% de perda)`);
    if (ok.length) { const t = ok.map(x => x.rtt); out.push('Aproximar um número redondo de vezes em milissegundos:', `    Mínimo = ${fmtMs(Math.min(...t))}, Máximo = ${fmtMs(Math.max(...t))}, Média = ${fmtMs(t.reduce((a, b) => a + b, 0) / t.length)}`); }
    for (const w of why) out.push(`  [diagnóstico] ${w}`);
    return out;
}
function trace(lab, dev, target, windows) {
    if (!target || target === 'tracert' || target === 'traceroute') return ['Uso: tracert <destino>'];
    const r = lab.traceroute(dev, target);
    if (r.error) return [r.message || 'Falha geral.'];
    const out = [`Rastreando a rota para ${target}${target !== r.ip ? ` [${r.ip}]` : ''} com no máximo 30 saltos:`, ''];
    r.hops.forEach((h, i) => out.push(`  ${String(i + 1).padStart(2)}  ${h.rtts.map(t => t === null ? '    *  ' : fmtMs(t).padStart(6) + ' ').join(' ')}  ${h.ip || 'Esgotado o tempo limite do pedido.'}`));
    out.push('', r.incomplete ? 'Rastreamento incompleto.' : 'Rastreamento concluído.');
    return out;
}
function nslookup(lab, dev, name) {
    if (!name) return ['Uso: nslookup <nome>'];
    const cfg = lab.rt(dev.id).ip, server = cfg?.dns?.[0];
    const r = isIp(name) ? { ok: false, message: 'Consulta reversa (PTR) não simulada.' } : lab.resolve(dev, name);
    const out = [`Servidor:  ${r.serverName || server || 'desconhecido'}`, `Address:  ${r.server || server || '—'}`, ''];
    if (r.ok) out.push(r.authoritative ? 'Resposta autoritativa (DNS local do roteador):' : 'Não é resposta autoritativa:', `Nome:     ${name}`, `Address:  ${r.ip}`);
    else out.push(`*** ${r.message}`);
    return out;
}
function arp(lab, dev) {
    const ip = lab.ipOf(dev), entries = [...lab.rt(dev.id).arp.entries()];
    if (!ip) return ['Nenhuma entrada ARP encontrada.'];
    return [`Interface: ${ip} --- 0x7`, '  Endereço IP           Endereço físico       Tipo', ...entries.map(([k, v]) => `  ${k.padEnd(20)}  ${v.mac.replaceAll(':', '-').padEnd(20)}  dinâmico`), ...(entries.length ? [] : ['  (vazia — use ping para preencher)'])];
}
function linkInfo(lab, dev, style) {
    const l = lab.currentLink(dev);
    if (!l) return style === 'linux' ? ['Not connected.'] : ['Estado: desconectado'];
    const n = l.negotiation, ap = l.ap, dl = l.rates.dl, ul = l.rates.ul, m = MCS[dl.mcs];
    return [
        `    Nome              : Wi-Fi`, `    Estado            : conectado`,
        `    SSID              : ${ap.wifi.ssid}`, `    BSSID             : ${lab.mac(ap)}`,
        `    Tipo de rádio     : ${STANDARDS[n.standard].label}`, `    Autenticação      : ${securityLabel(ap.wifi.security, ap.wifi.band)}`,
        `    Banda / Canal     : ${ap.wifi.band} GHz / ${ap.wifi.channel} (${l.freq} MHz)  largura ${n.width} MHz  GI ${n.gi} µs`,
        `    Sinal (RSSI)      : ${l.dl.rssi.toFixed(1)} dBm   ruído ${l.dl.noise.toFixed(1)} dBm${l.dl.interference !== null ? `   interferência ${l.dl.interference.toFixed(1)} dBm` : ''}`,
        `    SINR (desc./sub.) : ${l.dl.sinr.toFixed(1)} dB / ${l.ul.sinr.toFixed(1)} dB${l.forced ? '   (SNR forçada)' : ''}`,
        `    Recepção (DL)     : MCS ${dl.mcs} ${m.label} ${m.code} · ${dl.nss} fluxo(s) · ${dl.rate.toFixed(1)} Mb/s · PER ${(100 * dl.per).toFixed(2)}%`,
        `    Transmissão (UL)  : MCS ${ul.mcs} ${MCS[ul.mcs].label} ${MCS[ul.mcs].code} · ${ul.nss} fluxo(s) · ${ul.rate.toFixed(1)} Mb/s · PER ${(100 * ul.per).toFixed(2)}%`,
    ];
}
function networks(lab, dev) {
    const list = lab.scan(dev);
    if (!list.length) return ['Nenhuma rede visível.'];
    return ['SSID                 BSSID              Sinal    Banda  Canal  Largura  Segurança', ...list.map(s => `${s.ssid.padEnd(20).slice(0, 20)} ${s.bssid}  ${s.rssi.toFixed(0).padStart(4)} dBm  ${s.band.padStart(3)}    ${String(s.channel).padStart(4)}  ${String(s.width).padStart(4)} MHz  ${s.security}`)];
}
function connectCmd(lab, dev, ssid, password) {
    if (!ssid) return ['Informe o SSID.'];
    const r = lab.connect(dev, ssid, password ?? dev.wifi.password);
    const out = [r.ok ? `Conectado a "${ssid}".` : `Falha: ${r.message}`];
    if (r.ok) { const ip = lab.rt(dev.id).ip; out.push(ip ? `Endereço: ${ip.address}/${prefixOf(ip.mask)}${ip.source === 'apipa' ? ' (APIPA — DHCP falhou)' : ''}` : 'Sem endereço IP.'); }
    return out;
}
function netsh(lab, dev, args) {
    const a = args.map(x => x.toLowerCase());
    if (a[0] !== 'wlan') return ['Uso: netsh wlan show interfaces | show networks | connect name=SSID [key=senha] | disconnect'];
    if (a[1] === 'show' && a[2]?.startsWith('int')) return linkInfo(lab, dev, 'windows');
    if (a[1] === 'show' && a[2]?.startsWith('net')) return networks(lab, dev);
    if (a[1] === 'disconnect') { lab.disconnect(dev); dev.wifi.autoConnect = false; return ['Desconectado.']; }
    if (a[1] === 'connect') {
        const get = k => args.find(x => x.toLowerCase().startsWith(k + '='))?.slice(k.length + 1);
        dev.wifi.autoConnect = true;
        return connectCmd(lab, dev, get('name') || get('ssid'), get('key'));
    }
    return ['Subcomando netsh wlan desconhecido.'];
}
function nmcli(lab, dev, args) {
    const a = args.map(x => x.toLowerCase());
    if (a[0]?.startsWith('dev') && a[1] === 'wifi' && a[2] === 'connect') {
        const i = a.indexOf('password');
        dev.wifi.autoConnect = true;
        return connectCmd(lab, dev, args[3], i > 0 ? args[i + 1] : undefined);
    }
    if (a[0]?.startsWith('dev') && a[1] === 'wifi') return networks(lab, dev);
    if (a[0]?.startsWith('dev') && a[1] === 'disconnect') { lab.disconnect(dev); dev.wifi.autoConnect = false; return ['Device \'wlan0\' successfully disconnected.']; }
    if (a[0]?.startsWith('dev') && (a[1] === 'show' || !a[1])) return linkInfo(lab, dev, 'linux');
    return ['Uso: nmcli dev wifi [connect <SSID> password <senha>] | nmcli dev disconnect wlan0'];
}
function iperf(lab, dev, args) {
    const i = args.indexOf('-c'), target = i >= 0 ? args[i + 1] : null, t = args.indexOf('-t') >= 0 ? Math.max(1, Math.min(10, +args[args.indexOf('-t') + 1] || 5)) : 5;
    if (!target) return ['Uso: iperf3 -c <servidor> [-t segundos]   (servidores: roteador, outros clientes, iperf.lab)'];
    const r = lab.iperf(dev, target, t);
    if (r.error) return [`iperf3: erro — não foi possível conectar ao servidor${r.why ? ': ' + r.why : ''}.`];
    const out = [`Connecting to host ${target}, port 5201`, '[ ID] Intervalo        Transferido   Vazão'];
    r.intervals.forEach((v, k) => out.push(`[  5] ${k}.00-${k + 1}.00 s  ${(v / 8).toFixed(1).padStart(7)} MBytes  ${v.toFixed(1).padStart(7)} Mbits/s`));
    out.push(`[  5] 0.00-${t}.00 s  ${(r.mean * t / 8).toFixed(1).padStart(7)} MBytes  ${r.mean.toFixed(1).padStart(7)} Mbits/s  (média)`);
    if (r.hops > 1) out.push('  [nota] cliente→AP→cliente: o mesmo canal é usado duas vezes, a vazão cai pela metade.');
    return out;
}
