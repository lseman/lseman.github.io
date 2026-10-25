// Preset scenarios. Each `build()` returns a fresh serializable state.
import { makeRouter, makeClient, defaultEnvironment } from './net.mjs';

const base = (devices, walls = [], env = {}) => ({ version: 1, seed: 1, plan: { width: 40, height: 24 }, env: { ...defaultEnvironment(), ...env }, devices, walls });
const wall = (id, x1, y1, x2, y2, material) => ({ id, x1, y1, x2, y2, material });
const join = (ssid, password) => ({ wifi: { ssid, password } });

export const SCENARIOS = {
    first: {
        name: 'Primeira rede Wi-Fi 6',
        goal: 'Um roteador Wi-Fi 6 em 5 GHz com DHCP. Abra o terminal do notebook e use ipconfig /all, ping 192.168.0.1 e ping google.com. Afaste o celular e observe o MCS cair.',
        build: () => base([
            makeRouter('r1', 'Roteador', 20, 12),
            makeClient('c1', 'laptop', 'Notebook 1', 26, 9, join('LabWiFi', 'senha1234')),
            makeClient('c2', 'phone', 'Celular 1', 13, 16, join('LabWiFi', 'senha1234')),
        ]),
    },
    wifi7: {
        name: 'Wi-Fi 7 em 6 GHz (320 MHz)',
        goal: 'O AP opera em 6 GHz com 320 MHz. Por que o celular Wi-Fi 6 não vê a rede? Com 2 fluxos o notebook escolhe 1024-QAM; mude o AP para 1 fluxo e veja surgir o 4096-QAM (MCS 13) — qual opção dá mais vazão? Reduza a largura para 80 MHz: o que acontece com a SNR e com a taxa?',
        build: () => base([
            makeRouter('r1', 'AP Wi-Fi 7', 16, 12, { wifi: { ssid: 'Lab7', security: 'WPA3', standard: 'wifi7', band: '6', width: 320, channel: 31, streams: 2 } }),
            makeClient('c1', 'laptop', 'Notebook Wi-Fi 7', 20, 8, { wifi: { standard: 'wifi7', ssid: 'Lab7', password: 'senha1234' } }),
            makeClient('c2', 'phone', 'Celular Wi-Fi 6', 12, 14, join('Lab7', 'senha1234')),
            makeClient('c3', 'desktop', 'Desktop Wi-Fi 6E', 28, 12, { wifi: { standard: 'wifi6e', ssid: 'Lab7', password: 'senha1234' } }),
        ]),
    },
    office: {
        name: 'Escritório com paredes',
        goal: 'Paredes de concreto e drywall atenuam o sinal de forma diferente em 2,4 e 5 GHz. Ative o mapa de cobertura, compare as duas bandas e encontre a melhor posição para o AP.',
        build: () => base([
            makeRouter('r1', 'Roteador', 6, 6),
            makeClient('c1', 'laptop', 'Notebook sala 1', 14, 5, join('LabWiFi', 'senha1234')),
            makeClient('c2', 'laptop', 'Notebook sala 3', 34, 18, join('LabWiFi', 'senha1234')),
            makeClient('c3', 'phone', 'Celular corredor', 20, 12, join('LabWiFi', 'senha1234')),
            makeClient('c4', 'printer', 'Impressora', 30, 4, { ...join('LabWiFi', 'senha1234'), ip: { mode: 'static', address: '192.168.0.50', mask: '255.255.255.0', gateway: '192.168.0.1', dns: '192.168.0.1' } }),
        ], [
            wall('w1', 12, 0, 12, 10, 'drywall'), wall('w2', 24, 0, 24, 10, 'concreto'), wall('w3', 0, 10, 40, 10, 'drywall'),
            wall('w4', 0, 14, 40, 14, 'drywall'), wall('w5', 20, 14, 20, 24, 'concreto'), wall('w6', 30, 14, 30, 24, 'tijolo'),
        ]),
    },
    interference: {
        name: 'Interferência em 2,4 GHz',
        goal: 'Três APs vizinhos em 2,4 GHz nos canais 1, 3 e 6 se sobrepõem. Veja a SINR e a vazão (iperf3 -c 192.168.0.1). Reconfigure para 1, 6 e 11 e compare.',
        build: () => base([
            makeRouter('r1', 'AP Lab', 20, 12, { wifi: { ssid: 'LabWiFi', band: '2.4', width: 20, channel: 6, load: 30 } }),
            makeRouter('r2', 'AP Vizinho A', 8, 6, { wifi: { ssid: 'VizinhoA', band: '2.4', width: 20, channel: 3, load: 60 }, lan: { ip: '192.168.1.1' }, dhcp: { start: '192.168.1.100', end: '192.168.1.199', dns1: '192.168.1.1' } }),
            makeRouter('r3', 'AP Vizinho B', 32, 18, { wifi: { ssid: 'VizinhoB', band: '2.4', width: 20, channel: 6, load: 60 }, lan: { ip: '192.168.2.1' }, dhcp: { start: '192.168.2.100', end: '192.168.2.199', dns1: '192.168.2.1' } }),
            makeClient('c1', 'laptop', 'Notebook', 15, 10, join('LabWiFi', 'senha1234')),
            makeClient('c2', 'phone', 'Celular', 26, 15, join('LabWiFi', 'senha1234')),
        ]),
    },
    troubleshoot: {
        name: 'Diagnóstico: encontre os 5 defeitos',
        goal: 'Nada funciona direito. Use ipconfig /all, ping, nslookup e o log de eventos: (1) o celular não conecta; (2) a impressora não responde ao ping; (3) o notebook não resolve nomes; (4) o desktop recebe 169.254.x.x; (5) o tablet pinga o roteador, mas não a Internet.',
        build: () => base([
            makeRouter('r1', 'Roteador', 20, 12, { dhcp: { start: '192.168.0.100', end: '192.168.0.101' }, dns: { records: [{ name: 'impressora.lan', ip: '192.168.0.50' }] } }),
            makeClient('c1', 'laptop', 'Notebook', 25, 8, { ...join('LabWiFi', 'senha1234'), ip: { mode: 'static', address: '192.168.0.20', mask: '255.255.255.0', gateway: '192.168.0.1', dns: '192.168.0.254' } }),
            makeClient('c2', 'phone', 'Celular', 15, 16, join('LabWiFi', 'senha123')),
            makeClient('c3', 'printer', 'Impressora', 28, 17, { ...join('LabWiFi', 'senha1234'), ip: { mode: 'static', address: '192.168.1.50', mask: '255.255.255.0', gateway: '192.168.1.1', dns: '' } }),
            makeClient('c4', 'laptop', 'Tablet', 12, 8, { ...join('LabWiFi', 'senha1234'), ip: { mode: 'static', address: '192.168.0.30', mask: '255.255.255.0', gateway: '192.168.0.254', dns: '192.168.0.1' } }),
            makeClient('c5', 'phone', 'Celular 2', 22, 18, join('LabWiFi', 'senha1234')),
            makeClient('c6', 'laptop', 'Notebook 2', 30, 10, join('LabWiFi', 'senha1234')),
            makeClient('c7', 'desktop', 'Desktop', 8, 14, join('LabWiFi', 'senha1234')),
        ]),
    },
    snr: {
        name: 'Laboratório de SNR e MCS',
        goal: 'Use "SNR forçada" no notebook (de 0 a 45 dB) e anote MCS, taxa PHY e vazão do iperf3. Depois fixe o MCS do AP em 11 e veja a PER explodir abaixo de ~34 dB.',
        build: () => base([
            makeRouter('r1', 'AP Wi-Fi 6', 20, 12, { wifi: { standard: 'wifi6', width: 80, channel: 42, streams: 2 } }),
            makeClient('c1', 'laptop', 'Notebook', 24, 12, { ...join('LabWiFi', 'senha1234'), snrOverride: 25 }),
        ]),
    },
};
