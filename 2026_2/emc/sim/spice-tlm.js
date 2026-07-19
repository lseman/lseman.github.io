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
          const paramMatch = p[k].match(/^(IS|N|VT)=(.+)$/i);
          if (paramMatch) {
            const paramKey = paramMatch[1].toUpperCase();
            const paramVal = parseSpiceNumber(paramMatch[2]);
            if (paramKey === 'IS') diode.is = paramVal;
            else if (paramKey === 'N') diode.n = paramVal;
            else if (paramKey === 'VT') diode.vt = paramVal;
          }
        }
        if (!(diode.is > 0) || !(diode.n > 0) || !(diode.vt > 0)) throw new Error(`Linha ${number + 1}: parâmetros do diodo devem ser positivos`);
        netlist.elements.push(diode);
      } else if (designator === 'V' || designator === 'I') {
        const src = { type: designator === 'V' ? 'voltage' : 'current', name: p[0], nPlus: p[1], nMinus: p[2], dcValue: 0 };
        const dcMatch = line.match(/\bDC\s+([^\s()]+)/i);
        const acMatch = line.match(/\bAC\s+([^\s()]+)(?:\s+([^\s()]+))?/i);
        if (dcMatch) src.dcValue = parseSpiceNumber(dcMatch[1]);
        else if (!/^(?:AC|PULSE|SINE|PWL)(?:$|\()/i.test(p[3])) src.dcValue = parseSpiceNumber(p[3]);
        if (acMatch) {
          src.acMagnitude = parseSpiceNumber(acMatch[1]);
          // AC phase is expressed in degrees and is deliberately not a SPICE-scaled value.
          src.acPhase = acMatch[2] && /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(acMatch[2])
            ? Number(acMatch[2]) : 0;
        }
        if (/\bPULSE\s*\(/i.test(line)) { src.waveform = 'pulse'; src.params = this.parsePulseParams(line); }
        else if (/\bSINE\s*\(/i.test(line)) { src.waveform = 'sine'; src.params = this.parseSineParams(line); }
        else if (/\bPWL\s*\(/i.test(line)) { src.waveform = 'pwl'; src.params = this.parsePWLParams(line); }
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

// Sparse row-oriented LU with scaled partial pivoting. MNA stamps are often
// extremely sparse; keeping fill-in in Maps avoids the O(n²) storage cost of a
// dense factorization while retaining robust pivoting for teaching-sized nets.
export function solveSparseLU(matrix, rightHandSide, pivotTolerance = 1e-14) {
  const n = rightHandSide.length;
  if (matrix.length !== n) throw new Error('Matriz MNA incompatível com o vetor independente');
  const rows = matrix.map(row => {
    const sparse = new Map();
    for (let col = 0; col < n; col++) if (row[col]) sparse.set(col, row[col]);
    return sparse;
  });
  const rhs = Float64Array.from(rightHandSide);
  const scales = rows.map(row => Math.max(0, ...Array.from(row.values(), Math.abs)));
  let fillIn = rows.reduce((sum, row) => sum + row.size, 0);

  for (let col = 0; col < n; col++) {
    let pivot = -1, best = 0;
    for (let row = col; row < n; row++) {
      const score = scales[row] ? Math.abs(rows[row].get(col) || 0) / scales[row] : 0;
      if (score > best) { best = score; pivot = row; }
    }
    if (pivot < 0 || best <= pivotTolerance) throw new Error('Circuito singular: verifique terra, nós flutuantes e fontes ideais conflitantes');
    if (pivot !== col) {
      [rows[col], rows[pivot]] = [rows[pivot], rows[col]];
      [rhs[col], rhs[pivot]] = [rhs[pivot], rhs[col]];
      [scales[col], scales[pivot]] = [scales[pivot], scales[col]];
    }
    const diagonal = rows[col].get(col);
    for (let row = col + 1; row < n; row++) {
      const entry = rows[row].get(col);
      if (!entry) continue;
      const factor = entry / diagonal;
      rows[row].delete(col);
      for (const [j, value] of rows[col]) {
        if (j <= col) continue;
        const previous = rows[row].get(j) || 0;
        const next = previous - factor * value;
        if (Math.abs(next) <= Number.EPSILON * Math.max(1, Math.abs(previous), Math.abs(factor * value))) rows[row].delete(j);
        else { if (!rows[row].has(j)) fillIn++; rows[row].set(j, next); }
      }
      rhs[row] -= factor * rhs[col];
    }
  }
  const solution = new Float64Array(n);
  for (let row = n - 1; row >= 0; row--) {
    let sum = rhs[row];
    for (const [col, value] of rows[row]) if (col > row) sum -= value * solution[col];
    solution[row] = sum / rows[row].get(row);
  }
  if (!solution.every(Number.isFinite)) throw new Error('A solução numérica divergiu');
  return { solution, stats: { dimension: n, nonzeros: fillIn } };
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
  diodeLinearization(e, voltage) {
    const nvt = Math.max(1e-12, (e.n || 1) * (e.vt || 0.02585));
    const saturation = Math.max(0, e.is || 1e-14);
    // Limiting the exponential is the compact-model equivalent of SPICE's
    // junction-voltage limiting: it keeps a poor Newton guess from overflowing.
    const exponent = Math.max(-40, Math.min(40, voltage / nvt));
    const expValue = Math.exp(exponent);
    const current = saturation * (expValue - 1);
    const conductance = Math.max(1e-12, saturation * expValue / nvt);
    return { conductance, current, equivalentCurrent: current - conductance * voltage, nvt };
  }
  solve(time = 0) {
    const n = this.numNodes + this.numVoltageSources;
    if (!n) return new Float64Array();
    // Dynamic companion histories belong to the time step, not to an individual
    // Newton iteration. Calculate them exactly once before rebuilding the MNA.
    for (const e of this.netlist.elements) {
      if (e.type === 'capacitor') {
        const g_c = 2 * e.value / this.dt;
        // Physical current state keeps the trapezoidal companion valid when dt changes.
        e.J_hist = -g_c * (e.voltagePrev || 0) - (e.currentPrev || 0);
        e.g_c_store = g_c;
      } else if (e.type === 'inductor') {
        const g_L = this.dt / (2 * e.value);
        const I_hist = e.currentPrev + g_L * (e.voltagePrev || 0);
        e.I_hist_store = I_hist;
        e.g_L_store = g_L;
      }
    }
    let guess = this.lastSolution?.length === n ? Float64Array.from(this.lastSolution) : new Float64Array(n);
    const nonlinear = this.netlist.elements.some(e => e.type === 'diode');
    const maxIterations = nonlinear ? 60 : 1, relTol = 1e-6, absTol = 1e-9;
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      const A = Array.from({ length: n }, () => new Float64Array(n));
      const rhs = new Float64Array(n);
      for (const e of this.netlist.elements) {
        const a = this.node(e.nPlus), b = this.node(e.nMinus);
        if (e.type === 'resistor') this.stampConductance(A, a, b, 1 / e.value);
        else if (e.type === 'capacitor') { this.stampConductance(A, a, b, e.g_c_store); this.stampCurrent(rhs, a, b, e.J_hist); }
        else if (e.type === 'inductor') { this.stampConductance(A, a, b, e.g_L_store); this.stampCurrent(rhs, a, b, e.I_hist_store); }
        else if (e.type === 'diode') {
          const voltage = (a >= 0 ? guess[a] : 0) - (b >= 0 ? guess[b] : 0);
          const model = this.diodeLinearization(e, voltage);
          e.gd_store = model.conductance; e.idPrev_store = model.current;
          this.stampConductance(A, a, b, model.conductance);
          this.stampCurrent(rhs, a, b, model.equivalentCurrent);
        }
      }
      for (const tl of this.netlist.transmissionLines) {
        const a = this.node(tl.nPlus), b = this.node(tl.nMinus), g = 1 / tl.z0;
        const { vF_arrived, vR_arrived } = tl.model.getArrivedWaves();
        if (a >= 0) { A[a][a] += g; rhs[a] += 2 * g * vR_arrived; }
        if (b >= 0) { A[b][b] += g; rhs[b] += 2 * g * vF_arrived; }
      }
      for (const src of this.netlist.sources.filter(s => s.type === 'current')) this.stampCurrent(rhs, this.node(src.nPlus), this.node(src.nMinus), sourceValue(src, time));
      for (const src of this.netlist.elements) {
        if (src.type === 'vccs') {
          const g = src.transconductance, a = this.node(src.nPlus), b = this.node(src.nMinus), ca = this.node(src.ncPlus), cb = this.node(src.ncMinus);
          if (a >= 0) { if (ca >= 0) A[a][ca] += g; if (cb >= 0) A[a][cb] -= g; }
          if (b >= 0) { if (ca >= 0) A[b][ca] -= g; if (cb >= 0) A[b][cb] += g; }
        } else if (src.type === 'cccs') {
          const k = this.voltageSourceMap.get(src.vSourceName), a = this.node(src.nPlus), b = this.node(src.nMinus);
          if (k !== undefined) { const branch = this.numNodes + k; if (a >= 0) A[a][branch] += src.currentGain; if (b >= 0) A[b][branch] -= src.currentGain; }
        }
      }
      this.voltageSources.forEach((src, k) => {
        const row = this.numNodes + k, a = this.node(src.nPlus), b = this.node(src.nMinus);
        if (a >= 0) A[a][row] = A[row][a] = 1;
        if (b >= 0) A[b][row] = A[row][b] = -1;
        if (src.type === 'vcvs') {
          const ca = this.node(src.ncPlus), cb = this.node(src.ncMinus);
          if (ca >= 0) A[row][ca] = -src.gain; if (cb >= 0) A[row][cb] = src.gain;
        } else if (src.type === 'ccvs') {
          const control = this.voltageSourceMap.get(src.vSourceName);
          if (control !== undefined) A[row][this.numNodes + control] = -src.transresistance;
        } else rhs[row] = sourceValue(src, time);
      });
      const next = this.gaussianElimination(A, rhs);
      if (!nonlinear) { this.lastSolution = next; return next; }
      let converged = true;
      for (let i = 0; i < n; i++) {
        const tolerance = absTol + relTol * Math.max(Math.abs(next[i]), Math.abs(guess[i]));
        if (Math.abs(next[i] - guess[i]) > tolerance) converged = false;
      }
      if (converged) { this.lastSolution = next; return next; }
      // Damp large Newton moves; this is particularly important at source steps.
      for (let i = 0; i < n; i++) {
        const delta = next[i] - guess[i];
        guess[i] = i < this.numNodes ? guess[i] + Math.max(-0.5, Math.min(0.5, delta)) : next[i];
      }
    }
    throw new Error(`Newton–Raphson não convergiu em ${maxIterations} iterações (t=${time}s)`);
  }
  gaussianElimination(A, rhs) {
    const result = solveSparseLU(A, rhs);
    this.linearStats = result.stats;
    return result.solution;
  }
  solveDC() {
    const n = this.numNodes + this.numVoltageSources;
    if (!n) return new Float64Array();
    const nonlinear = this.netlist.elements.some(e => e.type === 'diode');
    let dcVector = this.lastSolution?.length === n ? Float64Array.from(this.lastSolution) : new Float64Array(n);
    // Source stepping finds the low-energy branch first; gmin stepping then
    // removes the artificial path to ground without abruptly changing topology.
    const stages = nonlinear
      ? [[.1, 1e-3], [.25, 1e-4], [.5, 1e-5], [.75, 1e-7], [1, 1e-9], [1, 0]]
      : [[1, 0]];
    const stageStats = [];
    for (const [sourceScale, gmin] of stages) {
      let converged = false, iterations = 0;
      for (let iteration = 0; iteration < (nonlinear ? 80 : 1); iteration++) {
        iterations++;
        const A = Array.from({ length: n }, () => new Float64Array(n));
        const rhs = new Float64Array(n);
        for (let node = 0; node < this.numNodes; node++) A[node][node] += gmin;
        for (const e of this.netlist.elements) {
          const a = this.node(e.nPlus), b = this.node(e.nMinus);
          if (e.type === 'resistor') this.stampConductance(A, a, b, 1 / e.value);
          else if (e.type === 'inductor') this.stampConductance(A, a, b, 1e12);
          else if (e.type === 'diode') {
            const voltage = (a >= 0 ? dcVector[a] : 0) - (b >= 0 ? dcVector[b] : 0);
            const model = this.diodeLinearization(e, voltage);
            this.stampConductance(A, a, b, model.conductance);
            this.stampCurrent(rhs, a, b, model.equivalentCurrent);
          }
        }
        for (const src of this.netlist.sources.filter(s => s.type === 'current')) this.stampCurrent(rhs, this.node(src.nPlus), this.node(src.nMinus), sourceScale * sourceValueDC(src));
        for (const src of this.netlist.elements) {
          if (src.type === 'vccs') {
            const g = src.transconductance, a = this.node(src.nPlus), b = this.node(src.nMinus), ca = this.node(src.ncPlus), cb = this.node(src.ncMinus);
            if (a >= 0) { if (ca >= 0) A[a][ca] += g; if (cb >= 0) A[a][cb] -= g; }
            if (b >= 0) { if (ca >= 0) A[b][ca] -= g; if (cb >= 0) A[b][cb] += g; }
          } else if (src.type === 'cccs') {
            const control = this.voltageSourceMap.get(src.vSourceName), a = this.node(src.nPlus), b = this.node(src.nMinus);
            if (control !== undefined) { const branch = this.numNodes + control; if (a >= 0) A[a][branch] += src.currentGain; if (b >= 0) A[b][branch] -= src.currentGain; }
          }
        }
        this.voltageSources.forEach((src, k) => {
          const row = this.numNodes + k, a = this.node(src.nPlus), b = this.node(src.nMinus);
          if (a >= 0) A[a][row] = A[row][a] = 1;
          if (b >= 0) A[b][row] = A[row][b] = -1;
          if (src.type === 'vcvs') {
            const ca = this.node(src.ncPlus), cb = this.node(src.ncMinus);
            if (ca >= 0) A[row][ca] = -src.gain; if (cb >= 0) A[row][cb] = src.gain;
          } else if (src.type === 'ccvs') {
            const control = this.voltageSourceMap.get(src.vSourceName);
            if (control !== undefined) A[row][this.numNodes + control] = -src.transresistance;
          } else rhs[row] = sourceScale * sourceValueDC(src);
        });
        const next = this.gaussianElimination(A, rhs);
        converged = true;
        for (let i = 0; i < n; i++) if (Math.abs(next[i] - dcVector[i]) > 1e-9 + 1e-6 * Math.max(Math.abs(next[i]), Math.abs(dcVector[i]))) converged = false;
        if (converged || !nonlinear) { dcVector = next; converged = true; break; }
        for (let i = 0; i < n; i++) { const delta = next[i] - dcVector[i]; dcVector[i] = i < this.numNodes ? dcVector[i] + Math.max(-.5, Math.min(.5, delta)) : next[i]; }
      }
      if (!converged) throw new Error(`Ponto de operação DC não convergiu (source=${sourceScale}, gmin=${gmin})`);
      stageStats.push({ sourceScale, gmin, iterations });
    }
    this.dcStats = { nonlinear, stages: stageStats, totalIterations: stageStats.reduce((sum, stage) => sum + stage.iterations, 0) };
    this.lastSolution = Float64Array.from(dcVector);
    // Update initial conditions for capacitors and inductors
    for (const e of this.netlist.elements) {
      const voltage = (this.node(e.nPlus) >= 0 ? dcVector[this.node(e.nPlus)] : 0) - (this.node(e.nMinus) >= 0 ? dcVector[this.node(e.nMinus)] : 0);
      if (e.type === 'capacitor') {
        e.voltagePrev = voltage;
        e.currentPrev = 0;
        e.J_hist = undefined; // Will be initialized in first transient step
      } else if (e.type === 'inductor') {
        e.currentPrev = 0;
        e.voltagePrev = 0;
        e.I_hist_store = undefined;
        e.g_L_store = undefined;
      } else if (e.type === 'diode') {
        e.vPrev = voltage;
      }
    }
    return dcVector;
  }

  updateHistory(v) {
    for (const e of this.netlist.elements) {
      const voltage = (this.node(e.nPlus) >= 0 ? v[this.node(e.nPlus)] : 0) - (this.node(e.nMinus) >= 0 ? v[this.node(e.nMinus)] : 0);
      if (e.type === 'capacitor') {
        const previousVoltage = e.voltagePrev || 0, previousCurrent = e.currentPrev || 0;
        e.currentPrev = (e.g_c_store || 2 * e.value / this.dt) * (voltage - previousVoltage) - previousCurrent;
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
  if (!Number.isInteger(points) || points <= 0) throw new Error('.ac requer um número inteiro positivo de pontos');
  if (!(fstop >= fstart)) throw new Error('.ac requer fstop maior ou igual a fstart');
  const freqs = [];
  if (type === 'lin') {
    const step = (fstop - fstart) / Math.max(1, points - 1);
    for (let i = 0; i < points; i++) freqs.push(fstart + i * step);
  } else if (type === 'dec') {
    if (fstart <= 0 || fstop <= 0) throw new Error('.ac dec requer frequências positivas');
    const intervals = Math.ceil(points * Math.log10(fstop / fstart) - 1e-12);
    for (let i = 0; i <= intervals; i++) freqs.push(Math.min(fstop, fstart * 10 ** (i / points)));
  } else if (type === 'oct') {
    if (fstart <= 0 || fstop <= 0) throw new Error('.ac oct requer frequências positivas');
    const intervals = Math.ceil(points * Math.log2(fstop / fstart) - 1e-12);
    for (let i = 0; i <= intervals; i++) freqs.push(Math.min(fstop, fstart * 2 ** (i / points)));
  } else { throw new Error(`.ac tipo não suportado: ${type}`); }
  return freqs;
}

function solveComplexMNA(G, B, rhsReal, rhsImag) {
  // Complex system (Gc + jBc) x = rhs solved as the real 2n system [Gc -Bc; Bc Gc].
  // Gc/Bc span nodes plus voltage-source branch currents; B only has node entries.
  const n_c = rhsReal.length;
  const sz = 2 * n_c;
  const M = Array.from({ length: sz }, () => new Float64Array(sz));
  const rhs = new Float64Array(sz);

  for (let i = 0; i < n_c; i++) {
    for (let j = 0; j < n_c; j++) {
      const g = G[i][j] || 0, b = B[i][j] || 0;
      M[i][j] = g;
      M[i][j + n_c] = -b;
      M[i + n_c][j] = b;
      M[i + n_c][j + n_c] = g;
    }
    rhs[i] = rhsReal[i] || 0;
    rhs[i + n_c] = rhsImag[i] || 0;
  }

  let x;
  try { x = solveSparseLU(M, rhs).solution; }
  catch (error) { throw new Error(`Falha na solução AC: ${error.message}`); }

  const V_r = new Float64Array(n_c);
  const V_i = new Float64Array(n_c);
  for (let i = 0; i < n_c; i++) { V_r[i] = x[i]; V_i[i] = x[i + n_c]; }
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

  captureDynamicState() {
    const keys = ['voltagePrev', 'J_hist', 'g_c_store', 'currentPrev', 'I_hist_store', 'g_L_store', 'vPrev', 'gd_store', 'idPrev_store'];
    return {
      time: this.time, dt: this.dt, voltages: { ...this.voltages },
      lastSolution: this.solver.lastSolution ? Float64Array.from(this.solver.lastSolution) : null,
      devices: this.netlist.elements.map(e => Object.fromEntries(keys.map(key => [key, e[key]])))
    };
  }
  restoreDynamicState(state) {
    this.time = state.time; this.dt = state.dt; this.voltages = { ...state.voltages };
    state.devices.forEach((saved, index) => Object.assign(this.netlist.elements[index], saved));
    this.solver = new MNASolver(this.netlist, this.dt);
    if (state.lastSolution) this.solver.lastSolution = Float64Array.from(state.lastSolution);
  }
  trialStep(dt, targetTime, seed = null) {
    this.dt = dt;
    this.solver = new MNASolver(this.netlist, dt);
    if (seed) this.solver.lastSolution = Float64Array.from(seed);
    const vector = this.solver.solve(targetTime);
    const voltages = { 0: 0, gnd: 0 };
    for (const [node, index] of this.solver.nodeMap) if (index >= 0) voltages[node] = vector[index];
    this.solver.updateHistory(vector);
    this.time = targetTime; this.voltages = voltages;
    return { vector, voltages };
  }
  simulateAdaptive(stopTime = this.netlist.simulation.stop, callback, tolerance = 1e-4) {
    if (this.netlist.transmissionLines.length) throw new Error('Passo adaptativo não é compatível com linhas TLM discretas; use simulate() com passo fixo');
    const options = typeof tolerance === 'object' ? tolerance : { relTol: tolerance };
    const relTol = options.relTol ?? 1e-4, absTol = options.absTol ?? 1e-7;
    if (!(relTol > 0) || !(absTol > 0)) throw new Error('Tolerâncias adaptativas devem ser positivas');
    const nominalDt = this.dt, minDt = options.minDt ?? nominalDt * 1e-6, maxDt = options.maxDt ?? nominalDt * 100;
    let proposedDt = Math.min(nominalDt, maxDt), attempts = 0, accepted = 0, rejected = 0;
    while (this.time < stopTime) {
      if (++attempts > 2_000_000) throw new Error('Análise adaptativa excedeu o limite de passos');
      const base = this.captureDynamicState(), t0 = this.time;
      const dt = Math.min(proposedDt, stopTime - t0);
      if (dt < minDt && stopTime - t0 > minDt) throw new Error('Passo de tempo mínimo atingido durante controle LTE');
      // One full step and two half steps start from the exact same state. The
      // difference estimates the local truncation error of trapezoidal order 2.
      const full = this.trialStep(dt, t0 + dt, base.lastSolution);
      this.restoreDynamicState(base);
      const half1 = this.trialStep(dt / 2, t0 + dt / 2, base.lastSolution);
      const half2 = this.trialStep(dt / 2, t0 + dt, half1.vector);
      let errorNorm = 0;
      for (const node of this.netlist.nodeList) {
        if (GROUND.has(node.toLowerCase())) continue;
        const fine = half2.voltages[node] ?? 0, coarse = full.voltages[node] ?? 0;
        // Richardson divisor 2^p-1 for p=2 trapezoidal integration.
        const lte = Math.abs(fine - coarse) / 3;
        errorNorm = Math.max(errorNorm, lte / (absTol + relTol * Math.max(Math.abs(fine), Math.abs(coarse))));
      }
      const factor = errorNorm === 0 ? 2 : Math.max(.2, Math.min(2, .9 * errorNorm ** (-1 / 3)));
      if (errorNorm <= 1) {
        accepted++;
        for (const node of this.netlist.probes) (this.history[node] ||= []).push({ time: this.time, voltage: this.voltages[node] ?? 0 });
        callback?.(this.time, this.voltages, this.netlist.transmissionLines);
        proposedDt = Math.min(maxDt, Math.max(minDt, dt * factor));
      } else {
        rejected++;
        this.restoreDynamicState(base);
        proposedDt = Math.max(minDt, dt * factor);
      }
    }
    this.adaptiveStats = { accepted, rejected, attempts, lastDt: this.dt, relTol, absTol };
    return this.voltages;
  }
  getSourceVoltage(src, t) { return sourceValue(src, t); }
  pulseVoltage(src, t) { return sourceValue(src, t); }
  sineVoltage(src, t) { return sourceValue(src, t); }
  pwlVoltage(src, t) { return sourceValue(src, t); }
  step() {
    const targetTime = this.time + this.dt;
    const vector = this.solver.solve(targetTime); this.voltages = { 0: 0, gnd: 0 };
    for (const [node, index] of this.solver.nodeMap) if (index >= 0) this.voltages[node] = vector[index];
    this.solver.updateHistory(vector); this.time = targetTime; return this.voltages;
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
    const dimension = n_nodes + n_sources;
    // Small-signal device values are evaluated at the DC operating point.
    let dcVector = this.solver.lastSolution;
    if (!dcVector?.length) dcVector = this.solver.solveDC();

    for (const f of freqs) {
      const omega = 2 * Math.PI * f;
      const G = Array.from({ length: dimension }, () => new Float64Array(dimension));
      const B = Array.from({ length: dimension }, () => new Float64Array(dimension));
      const rhsReal = new Float64Array(dimension), rhsImag = new Float64Array(dimension);

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
        } else if (e.type === 'diode') {
          const voltage = (a >= 0 ? dcVector[a] : 0) - (b >= 0 ? dcVector[b] : 0);
          const gd = this.solver.diodeLinearization(e, voltage).conductance;
          this.solver.stampConductance(G, a, b, gd);
        } else if (e.type === 'transmissionLine') {
          const beta_td = omega * e.td;
          const invZ0 = 1 / e.z0;
          const sin_bd = Math.sin(beta_td);
          const cos_bd = Math.cos(beta_td);
          if (Math.abs(sin_bd) < 1e-12) { /* resonance: treat as open */ }
          else {
            const cot_bd = cos_bd / sin_bd;
            const csc_bd = 1 / sin_bd;
            // Lossless line 2-port admittance: Y11 = -j cot(bl)/Z0, Y12 = +j csc(bl)/Z0
            const b11 = -invZ0 * cot_bd;
            const b12 = invZ0 * csc_bd;
            if (a >= 0) { B[a][a] += b11; }
            if (b >= 0) { B[b][b] += b11; }
            if (a >= 0 && b >= 0) { B[a][b] += b12; B[b][a] += b12; }
          }
        }
      }

      for (const src of this.netlist.sources) {
        const phase = (src.acPhase || 0) * Math.PI / 180;
        const real = (src.acMagnitude || 0) * Math.cos(phase);
        const imag = (src.acMagnitude || 0) * Math.sin(phase);
        if (src.type === 'current') {
          this.solver.stampCurrent(rhsReal, this.solver.node(src.nPlus), this.solver.node(src.nMinus), real);
          this.solver.stampCurrent(rhsImag, this.solver.node(src.nPlus), this.solver.node(src.nMinus), imag);
        }
      }
      for (const src of this.netlist.elements) {
        const a = this.solver.node(src.nPlus), b = this.solver.node(src.nMinus);
        if (src.type === 'vccs') {
          const ca = this.solver.node(src.ncPlus), cb = this.solver.node(src.ncMinus), gain = src.transconductance;
          if (a >= 0) { if (ca >= 0) G[a][ca] += gain; if (cb >= 0) G[a][cb] -= gain; }
          if (b >= 0) { if (ca >= 0) G[b][ca] -= gain; if (cb >= 0) G[b][cb] += gain; }
        } else if (src.type === 'cccs') {
          const control = this.solver.voltageSourceMap.get(src.vSourceName);
          if (control !== undefined) { const branch = n_nodes + control; if (a >= 0) G[a][branch] += src.currentGain; if (b >= 0) G[b][branch] -= src.currentGain; }
        }
      }
      this.solver.voltageSources.forEach((src, k) => {
        const row = n_nodes + k, a = this.solver.node(src.nPlus), b = this.solver.node(src.nMinus);
        if (a >= 0) G[a][row] = G[row][a] = 1;
        if (b >= 0) G[b][row] = G[row][b] = -1;
        if (src.type === 'vcvs') {
          const ca = this.solver.node(src.ncPlus), cb = this.solver.node(src.ncMinus);
          if (ca >= 0) G[row][ca] = -src.gain;
          if (cb >= 0) G[row][cb] = src.gain;
        } else if (src.type === 'ccvs') {
          const control = this.solver.voltageSourceMap.get(src.vSourceName);
          if (control !== undefined) G[row][n_nodes + control] = -src.transresistance;
        } else {
          const phase = (src.acPhase || 0) * Math.PI / 180;
          rhsReal[row] = (src.acMagnitude || 0) * Math.cos(phase);
          rhsImag[row] = (src.acMagnitude || 0) * Math.sin(phase);
        }
      });

      try {
        const { V_r, V_i } = solveComplexMNA(G, B, rhsReal, rhsImag);
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
    let thdNum = 0;

    for (let k = 1; k <= maxHarmonics; k++) {
      const mag = 2 * Math.hypot(a_k[k], b_k[k]) / Math.sqrt(2); // RMS
      const phase = Math.atan2(b_k[k], a_k[k]) * 180 / Math.PI;
      harmonics.push({ harmonic: k, frequency: k * fundFreq, mag, phase });
      if (k > 1) thdNum += mag * mag;
    }
    const thdDen = harmonics[0].mag || 1e-12;
    const thd = Math.sqrt(thdNum) / thdDen * 100;

    return { fundamental: fundFreq, dc, fundamental_rms: Math.hypot(a_k[1], b_k[1]) * 2 / Math.sqrt(2), harmonics, thd };
  }
}
