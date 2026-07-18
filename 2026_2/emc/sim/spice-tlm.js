// Compact transient SPICE engine for the EMC teaching studio.
// Supported devices: R, C, L, independent V/I sources and a lossless,
// ground-referenced transmission-line shorthand: Lname in out TLIN Z0=... TD=...

const GROUND = new Set(['0', 'gnd']);

export function parseSpiceNumber(value) {
  if (typeof value === 'number') return value;
  const text = String(value ?? '').trim();
  const match = text.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([a-zA-Zµ]*)$/i);
  if (!match) throw new Error(`Valor SPICE inválido: ${text || '(vazio)'}`);
  let suffix = match[2].toLowerCase();
  const scales = { '': 1, f: 1e-15, p: 1e-12, n: 1e-9, u: 1e-6, 'µ': 1e-6,
    m: 1e-3, k: 1e3, meg: 1e6, g: 1e9, t: 1e12 };
  // SPICE ignores unit text after a scale (10pF, 4.7kOhm). Accept common
  // engineering frequency spellings as a convenience while keeping `meg`
  // as the canonical, case-insensitive mega prefix.
  if (suffix === 'hz') suffix = '';
  else if (suffix.startsWith('meg') || suffix.startsWith('mhz')) suffix = 'meg';
  else if (suffix.startsWith('khz')) suffix = 'k';
  else if (suffix.startsWith('ghz')) suffix = 'g';
  else if (!(suffix in scales) && suffix[0] in scales) suffix = suffix[0];
  if (!(suffix in scales)) throw new Error(`Sufixo SPICE não suportado: ${suffix}`);
  return Number(match[1]) * scales[suffix];
}

function tokensInside(line, keyword) {
  const match = line.match(new RegExp(`${keyword}\\s*\\(([^)]*)\\)`, 'i'));
  return match ? match[1].trim().split(/[\s,]+/).filter(Boolean) : [];
}

export class SpiceNetlistParser {
  parse(text) {
    const netlist = { nodes: new Set(), nodeList: [], elements: [], sources: [],
      transmissionLines: [], probes: [], simulation: { type: 'tran', step: 1e-9, stop: 1e-6 } };
    const logical = [];
    for (const raw of String(text).replace(/\r/g, '').split('\n')) {
      if (/^\s*\+/.test(raw) && logical.length) logical[logical.length - 1] += ` ${raw.replace(/^\s*\+/, '')}`;
      else logical.push(raw);
    }
    for (let number = 0; number < logical.length; number++) {
      let line = logical[number].trim();
      if (!line || line[0] === '*' || line[0] === ';') continue;
      line = line.replace(/\s+(?:;|\/\/).*$/, '').trim();
      const lower = line.toLowerCase();
      if (lower === '.end') break;
      if (lower.startsWith('.tran')) {
        const p = line.split(/\s+/);
        if (p.length < 3) throw new Error(`Linha ${number + 1}: use .tran <passo> <fim>`);
        netlist.simulation.step = parseSpiceNumber(p[1]);
        netlist.simulation.stop = parseSpiceNumber(p[2]);
        continue;
      }
      if (lower.startsWith('.probe') || lower.startsWith('.print')) {
        for (const match of line.matchAll(/v\s*\(\s*([^,\s)]+)(?:\s*,[^)]*)?\)/gi)) netlist.probes.push(match[1]);
        continue;
      }
      if (lower.startsWith('.ac')) {
        const p = line.split(/\s+/);
        if (p.length < 4) throw new Error(`Linha ${number + 1}: use .ac <dec|oct|lin> <pontos> <fstart> [fstop]`);
        netlist.simulation.acType = p[1].toLowerCase();
        netlist.simulation.acPoints = parseSpiceNumber(p[2]);
        netlist.simulation.acStart = parseSpiceNumber(p[3]);
        netlist.simulation.acStop = p[4] ? parseSpiceNumber(p[4]) : netlist.simulation.acStart;
        netlist.simulation.type = 'ac';
        continue;
      }
      if (line[0] === '.') continue;
      const p = line.split(/\s+/);
      if (p.length < 4) throw new Error(`Linha ${number + 1}: elemento incompleto`);
      const designator = p[0][0].toUpperCase();
      const addNodes = (...nodes) => nodes.forEach(n => netlist.nodes.add(n));
      addNodes(p[1], p[2]);
      if (designator === 'R' || designator === 'C') {
        const type = designator === 'R' ? 'resistor' : 'capacitor';
        const value = parseSpiceNumber(p[3]);
        if (!(value > 0)) throw new Error(`Linha ${number + 1}: ${p[0]} deve ser positivo`);
        netlist.elements.push({ type, name: p[0], nPlus: p[1], nMinus: p[2], value, voltagePrev: 0 });
      } else if (designator === 'L' && !/\b(?:TLIN|TLINE|TLP)\b/i.test(line)) {
        const value = parseSpiceNumber(p[3]);
        if (!(value > 0)) throw new Error(`Linha ${number + 1}: ${p[0]} deve ser positivo`);
        netlist.elements.push({ type: 'inductor', name: p[0], nPlus: p[1], nMinus: p[2], value, currentPrev: 0, voltagePrev: 0 });
      } else if ((designator === 'L' && /\b(?:TLIN|TLINE|TLP)\b/i.test(line)) || designator === 'T') {
        const tl = this.parseTransmissionLine(line, number + 1);
        netlist.transmissionLines.push(tl);
        netlist.elements.push(tl);
      } else if (designator === 'D') {
        // Diode: Dname n+ n- [IS=... N=... VT=...]
        if (p.length < 3) throw new Error(`Linha ${number + 1}: Diodo (D) requer n+ e n-`);
        const diode = { type: 'diode', name: p[0], nPlus: p[1], nMinus: p[2], is: 1e-14, n: 1, vt: 0.02585, vPrev: 0 };
        for (let k = 3; k < p.length; k++) {
          const paramMatch = p[k].match(/^(IS|N|VT)=([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)$/i);
          if (paramMatch) {
            const paramKey = paramMatch[1].toUpperCase();
            const paramVal = parseSpiceNumber(paramMatch[2]);
            if (paramKey === 'IS') diode.is = paramVal;
            else if (paramKey === 'N') diode.n = paramVal;
            else if (paramKey === 'VT') diode.vt = paramVal;
          }
        }
        netlist.elements.push(diode);
      } else if (designator === 'V' || designator === 'I') {
        const src = { type: designator === 'V' ? 'voltage' : 'current', name: p[0], nPlus: p[1], nMinus: p[2], dcValue: 0 };
        if (/\bPULSE\s*\(/i.test(line)) { src.waveform = 'pulse'; src.params = this.parsePulseParams(line); }
        else if (/\bSINE\s*\(/i.test(line)) { src.waveform = 'sine'; src.params = this.parseSineParams(line); }
        else if (/\bPWL\s*\(/i.test(line)) { src.waveform = 'pwl'; src.params = this.parsePWLParams(line); }
        else {
          const valueToken = p[3].toLowerCase() === 'dc' ? p[4] : p[3];
          src.dcValue = parseSpiceNumber(valueToken);
        }
        netlist.sources.push(src);
      } else if (designator === 'E') {
        // VCVS: Ename n+ n- nc+ nc- gain
        if (p.length < 6) throw new Error(`Linha ${number + 1}: VCVS (E) requer n+, n-, nc+, nc-, gain`);
        const gain = parseSpiceNumber(p[5]);
        const src = { type: 'vcvs', name: p[0], nPlus: p[1], nMinus: p[2], ncPlus: p[3], ncMinus: p[4], gain };
        netlist.sources.push(src);
        netlist.elements.push(src);
      } else if (designator === 'G') {
        // VCCS: Gname n+ n- nc+ nc- gain
        if (p.length < 6) throw new Error(`Linha ${number + 1}: VCCS (G) requer n+, n-, nc+, nc-, gain`);
        const gain = parseSpiceNumber(p[5]);
        const src = { type: 'vccs', name: p[0], nPlus: p[1], nMinus: p[2], ncPlus: p[3], ncMinus: p[4], transconductance: gain };
        netlist.sources.push(src);
        netlist.elements.push(src);
      } else if (designator === 'H') {
        // CCVS: Hname n+ n- Vname gain
        if (p.length < 5) throw new Error(`Linha ${number + 1}: CCVS (H) requer n+, n-, Vname, gain`);
        const gain = parseSpiceNumber(p[4]);
        const src = { type: 'ccvs', name: p[0], nPlus: p[1], nMinus: p[2], vSourceName: p[3], transresistance: gain };
        netlist.sources.push(src);
        netlist.elements.push(src);
      } else if (designator === 'F') {
        // CCCS: Fname n+ n- Vname gain
        if (p.length < 5) throw new Error(`Linha ${number + 1}: CCCS (F) requer n+, n-, Vname, gain`);
        const gain = parseSpiceNumber(p[4]);
        const src = { type: 'cccs', name: p[0], nPlus: p[1], nMinus: p[2], vSourceName: p[3], currentGain: gain };
        netlist.sources.push(src);
        netlist.elements.push(src);
      } else throw new Error(`Linha ${number + 1}: dispositivo ${p[0]} não suportado`);
    }
    netlist.nodeList = [...netlist.nodes];
    if (!(netlist.simulation.step > 0) || !(netlist.simulation.stop > 0)) throw new Error('A análise .tran requer tempos positivos');
    if (netlist.simulation.stop / netlist.simulation.step > 1_000_000) throw new Error('A análise excede 1.000.000 passos; aumente o passo de .tran');
    return netlist;
  }

  parseTime(value) { return parseSpiceNumber(value); }
  parseFrequency(value) { return parseSpiceNumber(value); }
  parsePhase(value) { return Number(value) || 0; }
  parsePulseParams(line) {
    const p = tokensInside(line, 'PULSE');
    if (p.length < 2) throw new Error('PULSE requer ao menos V1 e V2');
    return { v1: parseSpiceNumber(p[0]), v2: parseSpiceNumber(p[1]), td: p[2] ? parseSpiceNumber(p[2]) : 0,
      tr: p[3] ? parseSpiceNumber(p[3]) : 0, tf: p[4] ? parseSpiceNumber(p[4]) : 0,
      pw: p[5] ? parseSpiceNumber(p[5]) : Infinity, period: p[6] ? parseSpiceNumber(p[6]) : Infinity };
  }
  parseSineParams(line) {
    const p = tokensInside(line, 'SINE');
    if (p.length < 3) throw new Error('SINE requer offset, amplitude e frequência');
    return { vOff: parseSpiceNumber(p[0]), vAmpl: parseSpiceNumber(p[1]), freq: parseSpiceNumber(p[2]),
      td: p[3] ? parseSpiceNumber(p[3]) : 0, theta: p[4] ? parseSpiceNumber(p[4]) : 0, phi: Number(p[5]) || 0 };
  }
  parsePWLParams(line) {
    const p = tokensInside(line, 'PWL');
    if (p.length < 4 || p.length % 2) throw new Error('PWL requer pares (tempo, valor)');
    const points = [];
    for (let i = 0; i < p.length; i += 2) points.push({ t: parseSpiceNumber(p[i]), v: parseSpiceNumber(p[i + 1]) });
    points.sort((a, b) => a.t - b.t);
    return { points };
  }
  parseTransmissionLine(line, lineNumber = 0) {
    const p = line.split(/\s+/);
    const tl = { type: 'transmissionLine', tlType: 'tlin', name: p[0], nPlus: p[1], nMinus: p[2], z0: 50, td: 1e-9 };
    for (const token of p.slice(3)) {
      const match = token.match(/^(Z0|TD)=(.+)$/i);
      if (match) tl[match[1].toLowerCase()] = parseSpiceNumber(match[2]);
    }
    if (!(tl.z0 > 0) || !(tl.td > 0)) throw new Error(`Linha ${lineNumber}: Z0 e TD devem ser positivos`);
    return tl;
  }
}

export class TransmissionLineModel {
  constructor(params, dt) {
    this.z0 = params.z0; this.td = params.td; this.dt = dt;
    this.delaySteps = Math.max(1, Math.round(this.td / dt));
    this.forward = new Float64Array(this.delaySteps);
    this.reverse = new Float64Array(this.delaySteps);
    this.index = 0;
  }
  getArrivedWaves() { return { vF_arrived: this.forward[this.index], vR_arrived: this.reverse[this.index] }; }
  update(vPlus, vMinus) {
    const arrived = this.getArrivedWaves();
    this.forward[this.index] = vPlus - arrived.vR_arrived;
    this.reverse[this.index] = vMinus - arrived.vF_arrived;
    this.index = (this.index + 1) % this.delaySteps;
    return arrived;
  }
  reset() { this.forward.fill(0); this.reverse.fill(0); this.index = 0; }
}

export class MNASolver {
  constructor(netlist, dt) {
    this.netlist = netlist; this.dt = dt; this.nodeMap = new Map([['0', -1], ['gnd', -1]]);
    let index = 0;
    for (const node of netlist.nodeList) if (!GROUND.has(node.toLowerCase()) && !this.nodeMap.has(node)) this.nodeMap.set(node, index++);
    this.numNodes = index;
    this.voltageSources = netlist.sources.filter(s => s.type === 'voltage' || s.type === 'vcvs' || s.type === 'ccvs');
    this.numVoltageSources = this.voltageSources.length;
    this.voltageSourceMap = new Map();
    this.voltageSources.forEach((src, k) => { this.voltageSourceMap.set(src.name, k); });
    for (const tl of netlist.transmissionLines) tl.model = new TransmissionLineModel(tl, dt);
  }
  node(name) { return this.nodeMap.get(name) ?? this.nodeMap.get(name.toLowerCase()) ?? -1; }
  stampConductance(A, a, b, g) {
    if (a >= 0) A[a][a] += g; if (b >= 0) A[b][b] += g;
    if (a >= 0 && b >= 0) { A[a][b] -= g; A[b][a] -= g; }
  }
  stampCurrent(rhs, a, b, current) { if (a >= 0) rhs[a] -= current; if (b >= 0) rhs[b] += current; }
  solve(time = 0) {
    const n = this.numNodes + this.numVoltageSources;
    if (!n) return new Float64Array();
    const A = Array.from({ length: n }, () => new Float64Array(n));
    const rhs = new Float64Array(n);
    for (const e of this.netlist.elements) {
      const a = this.node(e.nPlus), b = this.node(e.nMinus);
      if (e.type === 'resistor') this.stampConductance(A, a, b, 1 / e.value);
      else if (e.type === 'capacitor') {
        const g_c = 2 * e.value / this.dt;
        if (e.J_hist === undefined) { e.J_hist = -g_c * e.voltagePrev; } else { e.J_hist = -2 * g_c * e.voltagePrev - e.J_hist; }
        this.stampConductance(A, a, b, g_c);
        this.stampCurrent(rhs, a, b, e.J_hist);
      }
      else if (e.type === 'inductor') {
        const g_L = this.dt / (2 * e.value);
        const I_hist = e.currentPrev + g_L * (e.voltagePrev || 0);
        this.stampConductance(A, a, b, g_L);
        this.stampCurrent(rhs, a, b, I_hist);
        e.I_hist_store = I_hist;
        e.g_L_store = g_L;
      }
      else if (e.type === 'diode') {
        const vdPrev = e.vPrev || 0;
        const vt = e.vt || 0.02585;
        const n = e.n || 1;
        const is = e.is || 1e-14;
        let gd, idPrev;
        if (vdPrev > -4 * vt) {
          const expArg = vdPrev / (n * vt);
          const expVal = Math.exp(expArg);
          idPrev = is * (expVal - 1);
          gd = (is / (n * vt)) * expVal;
        } else {
          idPrev = -is;
          gd = Math.max(is / (n * vt) * Math.exp(-4), 1e-12);
        }
        e.gd_store = gd;
        e.idPrev_store = idPrev;
        this.stampConductance(A, a, b, gd);
        const jEq = idPrev - gd * vdPrev;
        this.stampCurrent(rhs, a, b, jEq);
      }
    }
    for (const tl of this.netlist.transmissionLines) {
      const a = this.node(tl.nPlus), b = this.node(tl.nMinus), g = 1 / tl.z0;
      const { vF_arrived, vR_arrived } = tl.model.getArrivedWaves();
      if (a >= 0) { A[a][a] += g; rhs[a] += 2 * g * vR_arrived; }
      if (b >= 0) { A[b][b] += g; rhs[b] += 2 * g * vF_arrived; }
    }
    for (const src of this.netlist.sources.filter(s => s.type === 'current')) this.stampCurrent(rhs, this.node(src.nPlus), this.node(src.nMinus), sourceValue(src, time));
    // Stamp dependent sources
    for (const src of this.netlist.elements) {
      if (src.type === 'vccs') {
        const g = src.transconductance;
        const a = this.node(src.nPlus), b = this.node(src.nMinus);
        const nc_a = this.node(src.ncPlus), nc_b = this.node(src.ncMinus);
        if (a >= 0) { if (nc_a >= 0) A[a][nc_a] += g; if (nc_b >= 0) A[a][nc_b] -= g; }
        if (b >= 0) { if (nc_a >= 0) A[b][nc_a] -= g; if (nc_b >= 0) A[b][nc_b] += g; }
      } else if (src.type === 'cccs') {
        const gain = src.currentGain;
        const a = this.node(src.nPlus), b = this.node(src.nMinus);
        const vSrcIdx = this.voltageSourceMap.get(src.vSourceName);
        if (vSrcIdx !== undefined) {
          const srcRow = this.numNodes + vSrcIdx;
          if (a >= 0) A[a][srcRow] -= gain;
          if (b >= 0) A[b][srcRow] += gain;
        }
      }
    }
    this.voltageSources.forEach((src, k) => {
      const row = this.numNodes + k, a = this.node(src.nPlus), b = this.node(src.nMinus);
      if (a >= 0) A[a][row] = A[row][a] = 1;
      if (b >= 0) A[b][row] = A[row][b] = -1;
      if (src.type === 'vcvs') {
        const nc_a = this.node(src.ncPlus), nc_b = this.node(src.ncMinus);
        if (nc_a >= 0) A[row][nc_a] = -src.gain;
        if (nc_b >= 0) A[row][nc_b] = +src.gain;
        rhs[row] = 0;
      } else if (src.type === 'ccvs') {
        const vSrcIdx = this.voltageSourceMap.get(src.vSourceName);
        if (vSrcIdx !== undefined) {
          const srcRow = this.numNodes + vSrcIdx;
          A[row][srcRow] = -src.transresistance;
        }
        rhs[row] = 0;
      } else {
        rhs[row] = sourceValue(src, time);
      }
    });
    return this.gaussianElimination(A, rhs);
  }
  gaussianElimination(A, rhs) {
    const n = rhs.length, x = new Float64Array(n), scale = Math.max(1, ...A.flatMap(row => Array.from(row, Math.abs)));
    for (let col = 0; col < n; col++) {
      let pivot = col;
      for (let row = col + 1; row < n; row++) if (Math.abs(A[row][col]) > Math.abs(A[pivot][col])) pivot = row;
      if (Math.abs(A[pivot][col]) < 1e-14 * scale) throw new Error('Circuito singular: verifique terra, nós flutuantes e fontes ideais conflitantes');
      [A[col], A[pivot]] = [A[pivot], A[col]]; [rhs[col], rhs[pivot]] = [rhs[pivot], rhs[col]];
      for (let row = col + 1; row < n; row++) { const f = A[row][col] / A[col][col]; if (!f) continue;
        for (let j = col; j < n; j++) A[row][j] -= f * A[col][j]; rhs[row] -= f * rhs[col]; }
    }
    for (let row = n - 1; row >= 0; row--) { let sum = rhs[row]; for (let j = row + 1; j < n; j++) sum -= A[row][j] * x[j]; x[row] = sum / A[row][row]; }
    if (!x.every(Number.isFinite)) throw new Error('A solução numérica divergiu');
    return x;
  }
  solveDC() {
    const n = this.numNodes + this.numVoltageSources;
    if (!n) return new Float64Array();
    const A = Array.from({ length: n }, () => new Float64Array(n));
    const rhs = new Float64Array(n);
    for (const e of this.netlist.elements) {
      const a = this.node(e.nPlus), b = this.node(e.nMinus);
      if (e.type === 'resistor') this.stampConductance(A, a, b, 1 / e.value);
      else if (e.type === 'capacitor') {
        // Capacitors are open circuits at DC: do nothing
      }
      else if (e.type === 'inductor') {
        // Inductors are short circuits at DC: use a large conductance
        const g_dc = 1e12;
        this.stampConductance(A, a, b, g_dc);
      } else if (e.type === 'diode') {
        const vdPrev = e.vPrev || 0;
        const vt = e.vt || 0.02585;
        const n = e.n || 1;
        const is = e.is || 1e-14;
        let gd, idPrev;
        if (vdPrev > -4 * vt) {
          const expArg = vdPrev / (n * vt);
          const expVal = Math.exp(expArg);
          idPrev = is * (expVal - 1);
          gd = (is / (n * vt)) * expVal;
        } else {
          idPrev = -is;
          gd = Math.max(is / (n * vt) * Math.exp(-4), 1e-12);
        }
        e.gd_store = gd;
        e.idPrev_store = idPrev;
        this.stampConductance(A, a, b, gd);
        const jEq = idPrev - gd * vdPrev;
        this.stampCurrent(rhs, a, b, jEq);
      } else if (e.type === 'vccs') {
        const g = e.transconductance;
        const nc_a = this.node(e.ncPlus), nc_b = this.node(e.ncMinus);
        if (a >= 0) { if (nc_a >= 0) A[a][nc_a] += g; if (nc_b >= 0) A[a][nc_b] -= g; }
        if (b >= 0) { if (nc_a >= 0) A[b][nc_a] -= g; if (nc_b >= 0) A[b][nc_b] += g; }
      }
    }
    for (const src of this.netlist.sources.filter(s => s.type === 'current')) {
      this.stampCurrent(rhs, this.node(src.nPlus), this.node(src.nMinus), sourceValueDC(src));
    }
    // Stamp dependent sources for DC
    for (const src of this.netlist.elements) {
      if (src.type === 'vccs') {
        const g = src.transconductance;
        const a = this.node(src.nPlus), b = this.node(src.nMinus);
        const nc_a = this.node(src.ncPlus), nc_b = this.node(src.ncMinus);
        if (a >= 0) { if (nc_a >= 0) A[a][nc_a] += g; if (nc_b >= 0) A[a][nc_b] -= g; }
        if (b >= 0) { if (nc_a >= 0) A[b][nc_a] -= g; if (nc_b >= 0) A[b][nc_b] += g; }
      } else if (src.type === 'cccs') {
        const gain = src.currentGain;
        const a = this.node(src.nPlus), b = this.node(src.nMinus);
        const vSrcIdx = this.voltageSourceMap.get(src.vSourceName);
        if (vSrcIdx !== undefined) {
          const srcRow = this.numNodes + vSrcIdx;
          if (a >= 0) A[a][srcRow] -= gain;
          if (b >= 0) A[b][srcRow] += gain;
        }
      }
    }
    this.voltageSources.forEach((src, k) => {
      const row = this.numNodes + k, a = this.node(src.nPlus), b = this.node(src.nMinus);
      if (a >= 0) A[a][row] = A[row][a] = 1;
      if (b >= 0) A[b][row] = A[row][b] = -1;
      if (src.type === 'vcvs') {
        const nc_a = this.node(src.ncPlus), nc_b = this.node(src.ncMinus);
        if (nc_a >= 0) A[row][nc_a] = -src.gain;
        if (nc_b >= 0) A[row][nc_b] = +src.gain;
        rhs[row] = 0;
      } else if (src.type === 'ccvs') {
        const vSrcIdx = this.voltageSourceMap.get(src.vSourceName);
        if (vSrcIdx !== undefined) {
          const srcRow = this.numNodes + vSrcIdx;
          A[row][srcRow] = -src.transresistance;
        }
        rhs[row] = 0;
      } else {
        rhs[row] = sourceValueDC(src);
      }
    });
    let dcVector;
    try {
      dcVector = this.gaussianElimination(A, rhs);
    } catch (e) {
      // If singular, fall back to zero initial conditions
      for (const e of this.netlist.elements) {
        if (e.type === 'capacitor') { e.voltagePrev = 0; e.J_hist = undefined; }
        else if (e.type === 'inductor') { e.currentPrev = 0; e.voltagePrev = 0; e.I_hist_store = undefined; e.g_L_store = undefined; }
      }
      return new Float64Array();
    }
    // Update initial conditions for capacitors and inductors
    for (const e of this.netlist.elements) {
      const voltage = (this.node(e.nPlus) >= 0 ? dcVector[this.node(e.nPlus)] : 0) - (this.node(e.nMinus) >= 0 ? dcVector[this.node(e.nMinus)] : 0);
      if (e.type === 'capacitor') {
        e.voltagePrev = voltage;
        e.J_hist = undefined; // Will be initialized in first transient step
      } else if (e.type === 'inductor') {
        e.currentPrev = 0;
        e.voltagePrev = 0;
        e.I_hist_store = undefined;
        e.g_L_store = undefined;
      }
    }
    return dcVector;
  }

  updateHistory(v) {
    for (const e of this.netlist.elements) {
      const voltage = (this.node(e.nPlus) >= 0 ? v[this.node(e.nPlus)] : 0) - (this.node(e.nMinus) >= 0 ? v[this.node(e.nMinus)] : 0);
      if (e.type === 'capacitor') {
        e.voltagePrev = voltage;
      } else if (e.type === 'inductor') {
        const g_L = e.g_L_store || (this.dt / (2 * e.value));
        const I_hist = e.I_hist_store || (e.currentPrev + g_L * (e.voltagePrev || 0));
        e.currentPrev = I_hist + g_L * voltage;
        e.voltagePrev = voltage;
      } else if (e.type === 'diode') {
        e.vPrev = voltage;
      }
    }
    for (const tl of this.netlist.transmissionLines) tl.model.update(this.node(tl.nPlus) >= 0 ? v[this.node(tl.nPlus)] : 0, this.node(tl.nMinus) >= 0 ? v[this.node(tl.nMinus)] : 0);
  }
}

function sourceValue(src, t) {
  if (!src.waveform) return src.dcValue || 0;
  const p = src.params;
  if (src.waveform === 'sine') { const te = t - p.td; return te < 0 ? p.vOff : p.vOff + p.vAmpl * Math.exp(-p.theta * te) * Math.sin(2 * Math.PI * p.freq * te + p.phi * Math.PI / 180); }
  if (src.waveform === 'pwl') {
    if (t <= p.points[0].t) return p.points[0].v;
    for (let i = 1; i < p.points.length; i++) if (t <= p.points[i].t) { const a = p.points[i - 1], b = p.points[i]; return a.v + (b.v - a.v) * (t - a.t) / (b.t - a.t || 1); }
    return p.points.at(-1).v;
  }
  const te = t - p.td; if (te < 0) return p.v1;
  const tc = Number.isFinite(p.period) && p.period > 0 ? te % p.period : te;
  if (p.tr > 0 && tc < p.tr) return p.v1 + (p.v2 - p.v1) * tc / p.tr;
  if (tc < p.tr + p.pw) return p.v2;
  if (p.tf > 0 && tc < p.tr + p.pw + p.tf) return p.v2 + (p.v1 - p.v2) * (tc - p.tr - p.pw) / p.tf;
  return p.v1;
}

function sourceValueDC(src) {
  if (!src.waveform) return src.dcValue || 0;
  const p = src.params;
  if (src.waveform === 'sine') return p.vOff;
  if (src.waveform === 'pwl') {
    if (p.points.length === 0) return 0;
    return p.points[0].v;
  }
  if (src.waveform === 'pulse') return p.v1;
  return src.dcValue || 0;
}

function generateACFrequencies(type, points, fstart, fstop) {
  const freqs = [];
  if (type === 'lin') {
    const step = (fstop - fstart) / Math.max(1, points - 1);
    for (let i = 0; i < points; i++) freqs.push(fstart + i * step);
  } else if (type === 'dec') {
    if (fstart <= 0 || fstop <= 0) throw new Error('.ac dec requer frequências positivas');
    const startLog = Math.log10(fstart);
    const stopLog = Math.log10(fstop);
    const step = (stopLog - startLog) / Math.max(1, points - 1);
    for (let i = 0; i < points; i++) { freqs.push(Math.pow(10, startLog + i * step)); }
  } else if (type === 'oct') {
    if (fstart <= 0 || fstop <= 0) throw new Error('.ac oct requer frequências positivas');
    const startLog2 = Math.log2(fstart);
    const stopLog2 = Math.log2(fstop);
    const step = (stopLog2 - startLog2) / Math.max(1, points - 1);
    for (let i = 0; i < points; i++) { freqs.push(Math.pow(2, startLog2 + i * step)); }
  } else { throw new Error(`.ac tipo não suportado: ${type}`); }
  return freqs;
}

function solveComplexMNA(G, B, A_rows, A_cols, V_src_r, V_src_i, n_nodes, n_sources) {
  const n_c = n_nodes + n_sources;
  const sz = 2 * n_c;
  const M = Array.from({ length: sz }, () => new Float64Array(sz));
  const rhs = new Float64Array(sz);

  for (let i = 0; i < n_nodes; i++) {
    for (let j = 0; j < n_nodes; j++) {
      M[i][j] = G[i][j] || 0;
      M[i][j + n_nodes] = -(B[i][j] || 0);
      M[i + n_nodes][j] = (B[i][j] || 0);
      M[i + n_nodes][j + n_nodes] = (G[i][j] || 0);
    }
  }

  for (let k = 0; k < n_sources; k++) {
    const row = n_nodes + k;
    const r_real = row;
    const r_imag = row + n_nodes;
    const a = A_rows[k], b = A_cols[k];
    if (a >= 0) { M[r_real][a] += 1; M[r_imag][a] += 1; }
    if (b >= 0) { M[r_real][b] -= 1; M[r_imag][b] -= 1; }
    M[r_real][r_real] = 1; M[r_imag][r_imag] = 1;
    rhs[r_real] = V_src_r[k] || 0;
    rhs[r_imag] = V_src_i[k] || 0;
  }

  const n = rhs.length, x = new Float64Array(n), scale = Math.max(1, ...M.flatMap(row => Array.from(row, Math.abs)));
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) if (Math.abs(M[row][col]) > Math.abs(M[pivot][col])) pivot = row;
    if (Math.abs(M[pivot][col]) < 1e-14 * scale) throw new Error('Circuito singular em AC: verifique terra, nós flutuantes e fontes ideais conflitantes');
    [M[col], M[pivot]] = [M[pivot], M[col]]; [rhs[col], rhs[pivot]] = [rhs[pivot], rhs[col]];
    for (let row = col + 1; row < n; row++) {
      const f = M[row][col] / M[col][col]; if (!f) continue;
      for (let j = col; j < n; j++) M[row][j] -= f * M[col][j];
      rhs[row] -= f * rhs[col];
    }
  }
  for (let row = n - 1; row >= 0; row--) {
    let sum = rhs[row];
    for (let j = row + 1; j < n; j++) sum -= M[row][j] * x[j];
    x[row] = sum / M[row][row];
  }
  if (!x.every(Number.isFinite)) throw new Error('A solução AC divergiu');

  const V_r = new Float64Array(n_nodes);
  const V_i = new Float64Array(n_nodes);
  for (let i = 0; i < n_nodes; i++) { V_r[i] = x[i]; V_i[i] = x[i + n_nodes]; }
  return { V_r, V_i };
}

export class SpiceTLMSimulator {
  constructor(text, dt = null) {
    this.parser = new SpiceNetlistParser(); this.netlist = this.parser.parse(text);
    this.dt = dt ?? this.netlist.simulation.step; this.time = 0; this.voltages = {}; this.currents = {}; this.history = {};
    if (!(this.dt > 0)) throw new Error('Passo de tempo inválido');
    this.solver = new MNASolver(this.netlist, this.dt);
    // Perform DC operating point analysis for initial conditions
    try { this.solver.solveDC(); } catch (e) { /* Fall back to zero initial conditions */ }
  }

  simulateAdaptive(stopTime = this.netlist.simulation.stop, callback, tol = 1e-6) {
    let t = this.time;
    let dt = this.dt;
    const minDt = dt * 1e-4;
    const maxDt = dt * 100;

    while (t < stopTime) {
      const remaining = stopTime - t;
      const stepDt = Math.min(dt, remaining);

      // Save state
      const voltagesPrev = { ...this.voltages };
      const timePrev = this.time;

      // Try step with current dt
      this.dt = stepDt;
      this.solver = new MNASolver(this.netlist, stepDt);
      // Re-initialize DC ICs for new dt
      try { this.solver.solveDC(); } catch (e) {}

      // Perform trapezoidal step
      const vector = this.solver.solve(t + stepDt);
      const voltages = { 0: 0, gnd: 0 };
      for (const [node, index] of this.solver.nodeMap) {
        if (index >= 0) voltages[node] = vector[index];
      }
      this.solver.updateHistory(vector);

      // Estimate error (simplified: compare with previous voltage scaled by dt change)
      let maxErr = 0;
      for (const node of this.netlist.nodeList) {
        if (GROUND.has(node.toLowerCase())) continue;
        const vNew = voltages[node] ?? 0;
        const vOld = voltagesPrev[node] ?? 0;
        const err = Math.abs(vNew - vOld);
        const scale = 1 + Math.max(Math.abs(vNew), Math.abs(vOld));
        maxErr = Math.max(maxErr, err / scale);
      }

      if (maxErr <= tol) {
        // Accept step
        this.voltages = voltages;
        this.time = t + stepDt;
        for (const node of this.netlist.probes) (this.history[node] ||= []).push({ time: this.time, voltage: voltages[node] ?? 0 });
        callback?.(this.time, this.voltages, this.netlist.transmissionLines);
        t = this.time;
        // Increase dt for next step
        dt = Math.min(maxDt, dt * 1.5);
      } else {
        // Reject step, reduce dt
        dt = Math.max(minDt, dt * 0.5);
        if (dt < minDt) throw new Error('Passo de tempo muito pequeno para convergência');
      }
    }
    return this.voltages;
  }
  getSourceVoltage(src, t) { return sourceValue(src, t); }
  pulseVoltage(src, t) { return sourceValue(src, t); }
  sineVoltage(src, t) { return sourceValue(src, t); }
  pwlVoltage(src, t) { return sourceValue(src, t); }
  step() {
    const vector = this.solver.solve(this.time); this.voltages = { 0: 0, gnd: 0 };
    for (const [node, index] of this.solver.nodeMap) if (index >= 0) this.voltages[node] = vector[index];
    this.solver.updateHistory(vector); this.time += this.dt; return this.voltages;
  }
  simulate(stopTime = this.netlist.simulation.stop, callback) {
    const steps = Math.ceil((stopTime - this.time) / this.dt);
    if (steps > 1_000_000) throw new Error('Simulação longa demais; aumente o passo de tempo');
    for (let i = 0; i < steps; i++) { const voltages = this.step();
      for (const node of this.netlist.probes) (this.history[node] ||= []).push({ time: this.time, voltage: voltages[node] ?? 0 });
      callback?.(this.time, voltages, this.netlist.transmissionLines);
    }
    return this.voltages;
  }
  getProbeData(node) { return this.history[node] || []; }
  reset() { this.time = 0; this.voltages = {}; this.currents = {}; this.history = {}; this.solver = new MNASolver(this.netlist, this.dt); }

  runAC() {
    if (this.netlist.simulation.type !== 'ac') throw new Error('Simulação AC não configurada; use diretiva .ac');
    const freqs = generateACFrequencies(this.netlist.simulation.acType, this.netlist.simulation.acPoints, this.netlist.simulation.acStart, this.netlist.simulation.acStop);
    const results = [];
    const n_nodes = this.solver.numNodes;
    const n_sources = this.solver.numVoltageSources;
    const A_rows = this.solver.voltageSources.map(src => this.solver.node(src.nPlus));
    const A_cols = this.solver.voltageSources.map(src => this.solver.node(src.nMinus));
    const V_src_r = this.solver.voltageSources.map(src => {
      if (src.waveform === 'sine') return src.params.vAmpl * Math.cos(src.params.phi * Math.PI / 180);
      return 0;
    });
    const V_src_i = this.solver.voltageSources.map(src => {
      if (src.waveform === 'sine') return src.params.vAmpl * Math.sin(src.params.phi * Math.PI / 180);
      return 0;
    });

    for (const f of freqs) {
      const omega = 2 * Math.PI * f;
      const G = Array.from({ length: n_nodes }, () => new Float64Array(n_nodes));
      const B = Array.from({ length: n_nodes }, () => new Float64Array(n_nodes));

      for (const e of this.netlist.elements) {
        const a = this.solver.node(e.nPlus), b = this.solver.node(e.nMinus);
        if (e.type === 'resistor') {
          const g = 1 / e.value;
          if (a >= 0) G[a][a] += g; if (b >= 0) G[b][b] += g;
          if (a >= 0 && b >= 0) { G[a][b] -= g; G[b][a] -= g; }
        } else if (e.type === 'capacitor') {
          const bc = omega * e.value;
          if (a >= 0) B[a][a] += bc; if (b >= 0) B[b][b] += bc;
          if (a >= 0 && b >= 0) { B[a][b] -= bc; B[b][a] -= bc; }
        } else if (e.type === 'inductor') {
          const bl = -1 / (omega * e.value);
          if (a >= 0) B[a][a] += bl; if (b >= 0) B[b][b] += bl;
          if (a >= 0 && b >= 0) { B[a][b] -= bl; B[b][a] -= bl; }
        } else if (e.type === 'transmissionLine') {
          const beta_td = omega * e.td;
          const invZ0 = 1 / e.z0;
          const sin_bd = Math.sin(beta_td);
          const cos_bd = Math.cos(beta_td);
          if (Math.abs(sin_bd) < 1e-12) { /* resonance: treat as open */ }
          else {
            const cot_bd = cos_bd / sin_bd;
            const csc_bd = 1 / sin_bd;
            const b11 = invZ0 * cot_bd;
            const b12 = -invZ0 * csc_bd;
            if (a >= 0) { B[a][a] += b11; }
            if (b >= 0) { B[b][b] += b11; }
            if (a >= 0 && b >= 0) { B[a][b] += b12; B[b][a] += b12; }
          }
        }
      }

      try {
        const { V_r, V_i } = solveComplexMNA(G, B, A_rows, A_cols, V_src_r, V_src_i, n_nodes, n_sources);
        const voltages = { 0: 0, gnd: 0 };
        for (const [node, index] of this.solver.nodeMap) {
          if (index >= 0) {
            voltages[node] = { real: V_r[index], imag: V_i[index], mag: Math.hypot(V_r[index], V_i[index]), phase: Math.atan2(V_i[index], V_r[index]) * 180 / Math.PI };
          }
        }
        results.push({ frequency: f, voltages });
      } catch (e) {
        results.push({ frequency: f, error: e.message });
      }
    }
    return results;
  }

  runFourier(fundFreq, node) {
    const history = this.history[node] || [];
    if (history.length < 2) throw new Error('Dados de transient insuficientes para análise Fourier');
    const t0 = history[0].time;
    const t1 = history[history.length - 1].time;
    const span = t1 - t0;
    const period = 1 / fundFreq;
    // Use last period of data
    const tStart = Math.max(t0, t1 - period);
    const samples = history.filter(h => h.time >= tStart && h.time <= t1);
    if (samples.length < 2) throw new Error('Dados insuficientes no último ciclo para Fourier');

    const N = samples.length;
    let dc = 0, a_k = [], b_k = [], maxHarmonics = 10;
    for (let k = 0; k <= maxHarmonics; k++) { a_k.push(0); b_k.push(0); }

    for (let i = 0; i < N; i++) {
      const t = samples[i].time - tStart;
      const v = samples[i].voltage;
      dc += v;
      for (let k = 1; k <= maxHarmonics; k++) {
        const ang = 2 * Math.PI * k * fundFreq * t;
        a_k[k] += v * Math.cos(ang);
        b_k[k] += v * Math.sin(ang);
      }
    }
    dc /= N;
    for (let k = 1; k <= maxHarmonics; k++) {
      a_k[k] /= N;
      b_k[k] /= N;
    }

    const harmonics = [];
    let thdNum = 0, thdDen = Math.hypot(a_k[1], b_k[1]);
    if (thdDen === 0) thdDen = 1e-12;

    for (let k = 1; k <= maxHarmonics; k++) {
      const mag = 2 * Math.hypot(a_k[k], b_k[k]) / Math.sqrt(2); // RMS
      const phase = Math.atan2(b_k[k], a_k[k]) * 180 / Math.PI;
      harmonics.push({ harmonic: k, frequency: k * fundFreq, mag, phase });
      if (k > 1) thdNum += mag * mag;
    }
    const thd = Math.sqrt(thdNum) / thdDen * 100;

    return { fundamental: fundFreq, dc, fundamental_rms: Math.hypot(a_k[1], b_k[1]) * 2 / Math.sqrt(2), harmonics, thd };
  }
}
