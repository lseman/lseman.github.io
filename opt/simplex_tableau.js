// ─────────────────────────────────────────────
//  PRESETS
// ─────────────────────────────────────────────
const PRESETS = [
  {
    name: 'Classic 2-variable',
    latexLP: `\\[\\begin{aligned}\\max\\quad & 2x_1 + 3x_2 \\\\ \\text{s.t.}\\quad & x_1 + x_2 \\leq 4 \\\\ & x_1 + 3x_2 \\leq 6 \\\\ & x_1,x_2 \\geq 0\\end{aligned}\\]`,
    varNames: ['x₁','x₂','s₁','s₂'],
    basisNames: ['s₁','s₂'],
    A: [[1,1,1,0],[1,3,0,1]],
    b: [4,6],
    c: [-2,-3,0,0],
    z: 0,
    isMax: true,
  },
  {
    name: '3-variable LP',
    latexLP: `\\[\\begin{aligned}\\max\\quad & 5x_1 + 4x_2 + 3x_3 \\\\ \\text{s.t.}\\quad & 6x_1 + 4x_2 + 2x_3 \\leq 240 \\\\ & 3x_1 + 2x_2 + 5x_3 \\leq 270 \\\\ & 5x_1 + 6x_2 + 5x_3 \\leq 420 \\\\ & x_1,x_2,x_3 \\geq 0\\end{aligned}\\]`,
    varNames: ['x₁','x₂','x₃','s₁','s₂','s₃'],
    basisNames: ['s₁','s₂','s₃'],
    A: [[6,4,2,1,0,0],[3,2,5,0,1,0],[5,6,5,0,0,1]],
    b: [240,270,420],
    c: [-5,-4,-3,0,0,0],
    z: 0,
    isMax: true,
  },
  {
    name: 'Degenerate case',
    latexLP: `\\[\\begin{aligned}\\max\\quad & x_1 + x_2 \\\\ \\text{s.t.}\\quad & x_1 \\leq 0 \\\\ & x_2 \\leq 2 \\\\ & x_1 + x_2 \\leq 2 \\\\ & x_1,x_2 \\geq 0\\end{aligned}\\]`,
    varNames: ['x₁','x₂','s₁','s₂','s₃'],
    basisNames: ['s₁','s₂','s₃'],
    A: [[1,0,1,0,0],[0,1,0,1,0],[1,1,0,0,1]],
    b: [0,2,2],
    c: [-1,-1,0,0,0],
    z: 0,
    isMax: true,
  },
  {
    name: 'Unbounded LP',
    latexLP: `\\[\\begin{aligned}\\max\\quad & x_1 + x_2 \\\\ \\text{s.t.}\\quad & -x_1 + x_2 \\leq 1 \\\\ & x_1,x_2 \\geq 0\\end{aligned}\\]`,
    varNames: ['x₁','x₂','s₁'],
    basisNames: ['s₁'],
    A: [[-1,1,1]],
    b: [1],
    c: [-1,-1,0],
    z: 0,
    isMax: true,
  },
];

// ─────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────
let state = null;
let currentPreset = 0;
let enteringCol = null;
let leavingRow = null;
let history = [];
let autoSolveTimer = null;
let pivotRule = 'dantzig'; // 'dantzig' | 'bland'

// ─────────────────────────────────────────────
//  UTILITIES
// ─────────────────────────────────────────────
function fractionStr(val) {
  if (typeof val === 'number') {
    if (Math.abs(val) < 1e-10) return '0';
    const rounded = Math.round(val * 1000) / 1000;
    if (Number.isInteger(rounded)) return String(rounded);
    for (let d = 2; d <= 12; d++) {
      const n = Math.round(val * d);
      if (Math.abs(n / d - val) < 1e-9) {
        if (d === 1) return String(n);
        return `${n}⁄${d}`;
      }
    }
    return rounded.toFixed(3).replace(/\.?0+$/, '');
  }
  return String(val);
}

function cloneState(s) {
  return {
    A: s.A.map(r => [...r]),
    b: [...s.b],
    c: [...s.c],
    z: s.z,
    basisNames: [...s.basisNames],
    varNames: [...s.varNames],
    isMax: s.isMax,
    iteration: s.iteration,
  };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function operationSymbol(factor) {
  return factor >= 0 ? '−' : '+';
}

function factorAbsStr(factor) {
  return fractionStr(Math.abs(factor));
}

function makeUpdate(name, before, operator, factor, pivotVal, after) {
  return {
    name,
    calc: `${fractionStr(before)} ${operator} ${factorAbsStr(factor)} × ${fractionStr(pivotVal)} = ${fractionStr(after)}`
  };
}

function formatEquationCoeff(val) {
  const mag = Math.abs(val);
  if (Math.abs(mag - 1) < 1e-10) return '';
  return fractionStr(mag);
}

function buildRowEquation(lhsVar, row, rhs, varNames) {
  const lhsIdx = varNames.indexOf(lhsVar);
  if (lhsIdx === -1) return `${lhsVar} = ${fractionStr(rhs)}`;
  let equation = `${lhsVar} = ${fractionStr(rhs)}`;
  for (let j = 0; j < row.length; j++) {
    if (j === lhsIdx) continue;
    const coeff = row[j];
    if (Math.abs(coeff) < 1e-10) continue;
    const sign = coeff > 0 ? ' - ' : ' + ';
    equation += `${sign}${formatEquationCoeff(coeff)}${varNames[j]}`;
  }
  return equation;
}

function buildObjectiveEquation(c, z, varNames) {
  let equation = `z = ${fractionStr(z)}`;
  for (let j = 0; j < c.length; j++) {
    const coeff = -c[j];
    if (Math.abs(coeff) < 1e-10) continue;
    const sign = coeff >= 0 ? ' + ' : ' - ';
    equation += `${sign}${formatEquationCoeff(coeff)}${varNames[j]}`;
  }
  return equation;
}

const STEP_MEANINGS = {
  'Choose Leaving Row': 'How far can we increase the entering variable before some basic variable hits zero?',
  'Normalize Pivot Row': 'Divide the pivot row by the pivot element so the entering variable gets coefficient 1 in its new row.',
  'Eliminate Pivot Column': 'Zero out the entering variable in every other row to maintain the identity structure of the basis.',
  'Update Objective Row': 'Adjust the reduced costs to reflect the new basis; the entering variable should have reduced cost 0.',
};

// ─────────────────────────────────────────────
//  PIVOT RULE
// ─────────────────────────────────────────────
function setPivotRule(rule) {
  pivotRule = rule;
  document.getElementById('rule-dantzig').classList.toggle('active', rule === 'dantzig');
  document.getElementById('rule-bland').classList.toggle('active', rule === 'bland');
}

function getAutoEnteringCol() {
  const candidates = getCandidateCols();
  if (!candidates.length) return -1;
  if (pivotRule === 'bland') {
    return candidates[0]; // smallest index with negative reduced cost
  }
  // dantzig: most negative reduced cost
  return candidates.reduce((best, j) => state.c[j] < state.c[best] ? j : best, candidates[0]);
}

// ─────────────────────────────────────────────
//  PIVOT WALKTHROUGH
// ─────────────────────────────────────────────
function buildPivotWalkthrough(pivRow, pivCol) {
  const before = cloneState(state);
  const pivotElem = before.A[pivRow][pivCol];
  const steps = [];
  const ratios = before.A.map((row, i) => row[pivCol] > 1e-10 ? before.b[i] / row[pivCol] : Infinity);

  steps.push({
    label: 'Choose Leaving Row',
    target: `Entering column ${before.varNames[pivCol]}`,
    formula: `\\[\\theta_i = \\frac{b_i}{a_{i,${pivCol + 1}}}\\quad \\text{for rows with } a_{i,${pivCol + 1}} > 0\\]`,
    formulaClass: 'ratio-formula',
    equation: `Limiting row becomes ${before.varNames[pivCol]} after the pivot.`,
    updates: before.basisNames.map((name, i) => {
      const entry = before.A[i][pivCol];
      const ratio = ratios[i];
      if (entry <= 1e-10) {
        return { name: `Row ${i + 1} (${name})`, calc: `entry ≤ 0 — not a candidate`, isWinner: false };
      }
      return {
        name: `Row ${i + 1} (${name})`,
        calc: `${fractionStr(before.b[i])} / ${fractionStr(entry)} = ${fractionStr(ratio)}${i === pivRow ? '  ← min' : ''}`,
        isWinner: i === pivRow
      };
    })
  });

  const normalizedRow = before.A[pivRow].map(v => v / pivotElem);
  const normalizedRhs = before.b[pivRow] / pivotElem;

  steps.push({
    label: 'Normalize Pivot Row',
    target: `Row ${pivRow + 1} (${before.basisNames[pivRow]})`,
    formula: `\\[R_{${pivRow + 1}}^{\\text{new}} = \\frac{R_{${pivRow + 1}}}{${fractionStr(pivotElem)}}\\]`,
    equation: buildRowEquation(before.varNames[pivCol], normalizedRow, normalizedRhs, before.varNames),
    updates: before.varNames.map((name, j) => ({
      name,
      calc: `${fractionStr(before.A[pivRow][j])} / ${fractionStr(pivotElem)} = ${fractionStr(normalizedRow[j])}`
    })).concat({ name: 'RHS', calc: `${fractionStr(before.b[pivRow])} / ${fractionStr(pivotElem)} = ${fractionStr(normalizedRhs)}` })
  });

  for (let i = 0; i < before.A.length; i++) {
    if (i === pivRow) continue;
    const factor = before.A[i][pivCol];
    if (Math.abs(factor) < 1e-12) {
      steps.push({
        label: 'Eliminate Pivot Column',
        target: `Row ${i + 1} (${before.basisNames[i]})`,
        formula: `\\[R_{${i + 1}}^{\\text{new}} = R_{${i + 1}}\\quad (\\text{pivot entry} = 0\\text{, unchanged})\\]`,
        equation: buildRowEquation(before.basisNames[i], before.A[i], before.b[i], before.varNames),
        updates: before.varNames.map((name, j) => ({
          name, calc: `${fractionStr(before.A[i][j])} (no change)`
        })).concat({ name: 'RHS', calc: `${fractionStr(before.b[i])} (no change)` })
      });
      continue;
    }
    const operator = operationSymbol(factor);
    const newRow = before.A[i].map((val, j) => val - factor * normalizedRow[j]);
    const newRhs = before.b[i] - factor * normalizedRhs;
    steps.push({
      label: 'Eliminate Pivot Column',
      target: `Row ${i + 1} (${before.basisNames[i]})`,
      formula: `\\[R_{${i + 1}}^{\\text{new}} = R_{${i + 1}} ${operator === '−' ? '-' : '+'} ${factorAbsStr(factor)}R_{${pivRow + 1}}^{\\text{new}}\\]`,
      equation: buildRowEquation(before.basisNames[i], newRow, newRhs, before.varNames),
      updates: before.varNames.map((name, j) =>
        makeUpdate(name, before.A[i][j], operationSymbol(factor), factor, normalizedRow[j], newRow[j])
      ).concat(makeUpdate('RHS', before.b[i], operationSymbol(factor), factor, normalizedRhs, newRhs))
    });
  }

  const zFactor = before.c[pivCol];
  const zOperator = operationSymbol(zFactor);
  const newC = before.c.map((val, j) => val - zFactor * normalizedRow[j]);
  const newZ = before.z - zFactor * normalizedRhs;
  steps.push({
    label: 'Update Objective Row',
    target: 'z row',
    formula: `\\[z^{\\text{new}} = z ${zOperator === '−' ? '-' : '+'} ${factorAbsStr(zFactor)}R_{${pivRow + 1}}^{\\text{new}}\\]`,
    equation: buildObjectiveEquation(newC, newZ, before.varNames),
    updates: before.varNames.map((name, j) =>
      makeUpdate(name, before.c[j], zOperator, zFactor, normalizedRow[j], newC[j])
    ).concat(makeUpdate('RHS', before.z, zOperator, zFactor, normalizedRhs, newZ))
  });

  return {
    enteringVar: before.varNames[pivCol],
    leavingVar: before.basisNames[pivRow],
    pivotElem,
    steps,
    basisNote: `${before.basisNames[pivRow]} is the most constrained basic variable (smallest nonneg. ratio). It leaves the basis; ${before.varNames[pivCol]} enters and Row ${pivRow + 1} becomes the new equation for ${before.varNames[pivCol]}.`
  };
}

// ─────────────────────────────────────────────
//  LOAD PRESET
// ─────────────────────────────────────────────
function loadPreset(idx) {
  stopAutoSolve();
  currentPreset = idx;
  document.querySelectorAll('[data-preset]').forEach(b => b.classList.toggle('active', +b.dataset.preset === idx));
  const p = PRESETS[idx];
  state = {
    A: p.A.map(r => [...r]),
    b: [...p.b],
    c: [...p.c],
    z: p.z,
    basisNames: [...p.basisNames],
    varNames: [...p.varNames],
    isMax: p.isMax,
    iteration: 0,
  };
  history = [];
  enteringCol = null;
  leavingRow = null;
  renderLPStatement(p.latexLP);
  renderTableau();
  renderHistory();
  if (window.MathJax) {
    setTimeout(() => MathJax.typesetPromise([
      document.getElementById('why-entering-body'),
      document.getElementById('why-ratio-body')
    ]).catch(() => {}), 200);
  }
}

function resetTableau() {
  loadPreset(currentPreset);
}

// ─────────────────────────────────────────────
//  LP STATEMENT
// ─────────────────────────────────────────────
function renderLPStatement(latex) {
  const el = document.getElementById('lp-math');
  el.innerHTML = latex;
  if (window.MathJax) MathJax.typesetPromise([el]).catch(() => {});
}

// ─────────────────────────────────────────────
//  BFS SOLUTION PANEL
// ─────────────────────────────────────────────
function getCurrentSolution() {
  const sol = {};
  state.varNames.forEach(v => { sol[v] = 0; });
  state.basisNames.forEach((name, i) => { sol[name] = state.b[i]; });
  return sol;
}

function renderBFS() {
  const sol = getCurrentSolution();
  const varsEl = document.getElementById('bfs-vars');
  const objEl  = document.getElementById('bfs-obj');
  varsEl.innerHTML = state.varNames.map(name => {
    const isBasic = state.basisNames.includes(name);
    const val = fractionStr(sol[name]);
    return `<span class="bfs-chip ${isBasic ? 'basic' : 'nonbasic'}" title="${isBasic ? 'Basic variable — value from RHS column' : 'Non-basic — fixed at 0'}">
      <span>${escapeHtml(name)}</span><span class="chip-eq">=</span><span>${val}</span>
    </span>`;
  }).join('');
  objEl.textContent = `z = ${fractionStr(Math.abs(state.z))}`;
}

// ─────────────────────────────────────────────
//  INTERPRETER PANEL
// ─────────────────────────────────────────────
function renderInterpreter() {
  const el = document.getElementById('interp-text');
  if (!el) return;

  const optimal = isOptimal();
  const candidates = getCandidateCols();
  let html = '';

  if (optimal) {
    const sol = getCurrentSolution();
    const decisionVars = state.varNames.filter(v => !v.startsWith('s'));
    const valStr = (decisionVars.length ? decisionVars : state.basisNames)
      .map(v => `${escapeHtml(v)}&thinsp;=&thinsp;${fractionStr(sol[v])}`).join(', ');
    html = `<span class="interp-tag interp-optimal">Optimal</span> `
      + `Every reduced cost $\\bar{c}_j \\geq 0$ — no non-basic variable can improve $z$ further. `
      + `<strong>Solution:</strong> ${valStr}, giving $z^* = ${fractionStr(Math.abs(state.z))}$.`;

  } else if (enteringCol !== null && isUnbounded(enteringCol)) {
    const vname = escapeHtml(state.varNames[enteringCol]);
    html = `<span class="interp-tag interp-warn">Unbounded</span> `
      + `Every entry $a_{i,${enteringCol+1}} \\leq 0$ in column ${vname} — increasing ${vname} never forces any basic variable negative. `
      + `The feasible region is infinite in this direction; no finite optimum exists.`;

  } else if (enteringCol !== null && leavingRow !== null) {
    const vEnter = escapeHtml(state.varNames[enteringCol]);
    const vLeave = escapeHtml(state.basisNames[leavingRow]);
    const rc = fractionStr(state.c[enteringCol]);
    const improve = fractionStr(-state.c[enteringCol]);
    const theta = fractionStr(state.b[leavingRow] / state.A[leavingRow][enteringCol]);
    html = `<span class="interp-tag interp-pivot">Pivot ready</span> `
      + `<strong>${vEnter}</strong> enters ($\\bar{c} = ${rc}$, so $z$ improves by ${improve} per unit). `
      + `Ratio test: $\\theta^* = ${theta}$ at row&nbsp;${leavingRow+1}, so <strong>${vLeave}</strong> is the most-constrained basic variable and leaves. `
      + `Press <em>Perform Pivot</em> to apply the row operations.`;

  } else {
    // Waiting for column selection
    const basicStr = state.basisNames
      .map((b, i) => `${escapeHtml(b)}&thinsp;=&thinsp;${fractionStr(state.b[i])}`).join(', ');
    const nonbasicStr = state.varNames
      .filter(v => !state.basisNames.includes(v))
      .map(escapeHtml).join(', ');
    const negStr = candidates
      .map(j => `${escapeHtml(state.varNames[j])} ($\\bar{c} = ${fractionStr(state.c[j])}$)`)
      .join(', ');

    const iterLabel = state.iteration === 0 ? 'Initial BFS' : `Iteration ${state.iteration}`;
    html = `<span class="interp-tag interp-info">${iterLabel}</span> `
      + `Basic: ${basicStr}; non-basic (= 0): ${nonbasicStr}. Objective $z = ${fractionStr(Math.abs(state.z))}$. `
      + `<strong>${candidates.length} improving direction${candidates.length > 1 ? 's' : ''}:</strong> ${negStr}. `
      + `Click a highlighted column to select the <em>entering variable</em>.`;
  }

  el.innerHTML = html;
  if (window.MathJax) MathJax.typesetPromise([el]).catch(() => {});
}

// ─────────────────────────────────────────────
//  FEASIBLE REGION (2-VAR SVG)
// ─────────────────────────────────────────────
const GW = 320, GH = 260, GM = 42;

function isTwoVarProblem() {
  return state.c.length - state.A.length === 2;
}

function getVertexFromState(s) {
  const sol = {};
  s.varNames.forEach(v => { sol[v] = 0; });
  s.basisNames.forEach((name, i) => { sol[name] = s.b[i]; });
  return [sol[s.varNames[0]] ?? 0, sol[s.varNames[1]] ?? 0];
}

function computeFeasibleVertices() {
  const p = PRESETS[currentPreset];
  const a1 = p.A.map(row => row[0]);
  const a2 = p.A.map(row => row[1]);
  const b  = p.b;
  const hp = [
    ...a1.map((a, i) => ({ a, b: a2[i], rhs: b[i] })),
    { a: -1, b: 0, rhs: 0 },
    { a: 0, b: -1, rhs: 0 },
  ];
  const n = hp.length;
  const verts = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const det = hp[i].a * hp[j].b - hp[j].a * hp[i].b;
      if (Math.abs(det) < 1e-10) continue;
      const x = (hp[i].rhs * hp[j].b - hp[j].rhs * hp[i].b) / det;
      const y = (hp[i].a * hp[j].rhs - hp[j].a * hp[i].rhs) / det;
      if (x < -1e-8 || y < -1e-8) continue;
      if (!hp.every(h => h.a * x + h.b * y <= h.rhs + 1e-8)) continue;
      const cx = Math.max(0, x), cy = Math.max(0, y);
      if (!verts.some(v => Math.abs(v[0] - cx) < 1e-8 && Math.abs(v[1] - cy) < 1e-8))
        verts.push([cx, cy]);
    }
  }
  if (verts.length >= 3) {
    const cx = verts.reduce((s, v) => s + v[0], 0) / verts.length;
    const cy = verts.reduce((s, v) => s + v[1], 0) / verts.length;
    verts.sort((a, b) => Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx));
  }
  return verts;
}

function clipLineToBox(a, b, rhs, xMax, yMax) {
  const pts = [];
  const cands = [];
  if (Math.abs(b) > 1e-10) {
    cands.push([0, rhs / b]);
    cands.push([xMax, (rhs - a * xMax) / b]);
  }
  if (Math.abs(a) > 1e-10) {
    cands.push([rhs / a, 0]);
    cands.push([(rhs - b * yMax) / a, yMax]);
  }
  for (const [cx, cy] of cands) {
    if (cx >= -1e-8 && cx <= xMax + 1e-8 && cy >= -1e-8 && cy <= yMax + 1e-8) {
      const px = Math.max(0, Math.min(xMax, cx));
      const py = Math.max(0, Math.min(yMax, cy));
      if (!pts.some(p => Math.abs(p[0] - px) < 1e-8 && Math.abs(p[1] - py) < 1e-8))
        pts.push([px, py]);
    }
  }
  return pts.slice(0, 2);
}

function renderFeasibleRegion() {
  const panel = document.getElementById('feasible-panel');
  if (!isTwoVarProblem()) { panel.style.display = 'none'; return; }
  panel.style.display = 'block';

  const verts = computeFeasibleVertices();
  const sol = getCurrentSolution();
  const curX = sol[state.varNames[0]] ?? 0;
  const curY = sol[state.varNames[1]] ?? 0;

  const p = PRESETS[currentPreset];
  const origObj = [-p.c[0], -p.c[1]];
  const objVal  = Math.abs(state.z);

  const svg     = document.getElementById('feasible-svg');
  const noteEl  = document.getElementById('feasible-note');
  const legendEl= document.getElementById('feasible-legend');

  if (verts.length < 2) {
    svg.innerHTML = `<text x="160" y="130" text-anchor="middle" font-family="Space Mono,monospace" font-size="11" fill="var(--text-faint)">Geometric view not available</text>`;
    noteEl.textContent = '';
    legendEl.innerHTML = '';
    return;
  }

  const allX  = verts.map(v => v[0]);
  const allY  = verts.map(v => v[1]);
  const xMax  = Math.max(Math.ceil(Math.max(...allX, 1) * 1.25), 1);
  const yMax  = Math.max(Math.ceil(Math.max(...allY, 1) * 1.25), 1);
  const pw    = GW - 2 * GM;
  const ph    = GH - 2 * GM;
  const tx    = x => GM + (x / xMax) * pw;
  const ty    = y => GH - GM - (y / yMax) * ph;

  let html = '';

  // shared defs (arrowheads)
  html += `<defs>
    <marker id="arr-obj" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
      <polygon points="0 0,6 2,0 4" fill="rgba(142,95,42,0.85)"/>
    </marker>
    <marker id="arr-path" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
      <polygon points="0 0,6 2,0 4" fill="rgba(33,77,107,0.7)"/>
    </marker>
  </defs>`;

  // grid
  const TICKS = 4;
  for (let i = 1; i <= TICKS; i++) {
    const xv = i * xMax / TICKS, yv = i * yMax / TICKS;
    html += `<line x1="${tx(xv)}" y1="${GM}" x2="${tx(xv)}" y2="${GH-GM}" stroke="rgba(216,207,190,0.4)" stroke-width="0.7"/>`;
    html += `<line x1="${GM}" y1="${ty(yv)}" x2="${GW-GM}" y2="${ty(yv)}" stroke="rgba(216,207,190,0.4)" stroke-width="0.7"/>`;
  }

  // feasible region
  if (verts.length >= 3) {
    const pts = verts.map(v => `${tx(v[0])},${ty(v[1])}`).join(' ');
    html += `<polygon points="${pts}" fill="rgba(33,77,107,0.11)" stroke="rgba(33,77,107,0.48)" stroke-width="1.5" stroke-linejoin="round"/>`;
  } else {
    html += `<line x1="${tx(verts[0][0])}" y1="${ty(verts[0][1])}" x2="${tx(verts[1][0])}" y2="${ty(verts[1][1])}" stroke="rgba(33,77,107,0.48)" stroke-width="2"/>`;
  }

  // constraint boundary lines
  const cColors = ['rgba(80,80,160,0.38)','rgba(160,80,80,0.38)','rgba(80,160,80,0.38)'];
  p.A.forEach((row, i) => {
    const pts2 = clipLineToBox(row[0], row[1], p.b[i], xMax, yMax);
    if (pts2.length < 2) return;
    html += `<line x1="${tx(pts2[0][0])}" y1="${ty(pts2[0][1])}" x2="${tx(pts2[1][0])}" y2="${ty(pts2[1][1])}" stroke="${cColors[i % cColors.length]}" stroke-width="1" stroke-dasharray="5,3"/>`;
    const mx = (pts2[0][0] + pts2[1][0]) / 2, my = (pts2[0][1] + pts2[1][1]) / 2;
    html += `<text x="${tx(mx)+5}" y="${ty(my)-4}" font-family="Space Mono,monospace" font-size="8" fill="${cColors[i % cColors.length]}">C${i+1}</text>`;
  });

  // isoprofit line
  if (objVal > 1e-10) {
    const isoLinePts = clipLineToBox(origObj[0], origObj[1], objVal, xMax, yMax);
    if (isoLinePts.length >= 2) {
      html += `<line x1="${tx(isoLinePts[0][0])}" y1="${ty(isoLinePts[0][1])}" x2="${tx(isoLinePts[1][0])}" y2="${ty(isoLinePts[1][1])}" stroke="rgba(142,95,42,0.55)" stroke-width="1.5" stroke-dasharray="6,3"/>`;
    }
  }

  // objective direction arrow
  if (verts.length >= 3) {
    const gl = Math.sqrt(origObj[0] ** 2 + origObj[1] ** 2);
    if (gl > 1e-10) {
      const cx = verts.reduce((s, v) => s + v[0], 0) / verts.length;
      const cy = verts.reduce((s, v) => s + v[1], 0) / verts.length;
      const dx = origObj[0] / gl, dy = origObj[1] / gl;
      const len = 30;
      const ax1 = tx(cx), ay1 = ty(cy);
      const ax2 = ax1 + len * dx, ay2 = ay1 - len * dy;
      html += `<line x1="${ax1}" y1="${ay1}" x2="${ax2}" y2="${ay2}" stroke="rgba(142,95,42,0.85)" stroke-width="2" marker-end="url(#arr-obj)"/>`;
      html += `<text x="${ax2 + 4}" y="${ay2 - 3}" font-family="Space Mono,monospace" font-size="7.5" fill="var(--amber-dim)">↑obj</text>`;
    }
  }

  // simplex path (vertex journey)
  if (history.length > 0) {
    const pathVerts = history.map(h => getVertexFromState(h.tableau));
    pathVerts.push([curX, curY]);
    for (let k = 0; k < pathVerts.length - 1; k++) {
      const [px1, py1] = pathVerts[k];
      const [px2, py2] = pathVerts[k + 1];
      // skip if same point (degenerate pivot)
      if (Math.abs(px1 - px2) < 1e-8 && Math.abs(py1 - py2) < 1e-8) continue;
      html += `<line x1="${tx(px1)}" y1="${ty(py1)}" x2="${tx(px2)}" y2="${ty(py2)}"
        stroke="rgba(33,77,107,0.65)" stroke-width="2" stroke-dasharray="4,2"
        marker-end="url(#arr-path)"/>`;
    }
    // Label step numbers on path vertices (excluding current)
    pathVerts.slice(0, -1).forEach(([vx, vy], k) => {
      html += `<text x="${tx(vx)+7}" y="${ty(vy)-7}" font-family="Space Mono,monospace"
        font-size="7.5" fill="rgba(33,77,107,0.7)">iter ${k}</text>`;
    });
  }

  // axes
  html += `<line x1="${tx(0)}" y1="${GM-6}" x2="${tx(0)}" y2="${GH-GM+6}" stroke="var(--text-dim)" stroke-width="1.5"/>`;
  html += `<line x1="${GM-6}" y1="${ty(0)}" x2="${GW-GM+6}" y2="${ty(0)}" stroke="var(--text-dim)" stroke-width="1.5"/>`;
  html += `<text x="${GW-GM+8}" y="${ty(0)+4}" font-family="Space Mono,monospace" font-size="9" fill="var(--text-dim)">${escapeHtml(state.varNames[0])}</text>`;
  html += `<text x="${tx(0)}" y="${GM-10}" font-family="Space Mono,monospace" font-size="9" fill="var(--text-dim)" text-anchor="middle">${escapeHtml(state.varNames[1])}</text>`;

  // tick labels
  for (let i = 1; i <= TICKS; i++) {
    const xv = i * xMax / TICKS, yv = i * yMax / TICKS;
    html += `<text x="${tx(xv)}" y="${ty(0)+14}" font-family="Space Mono,monospace" font-size="7.5" fill="var(--text-faint)" text-anchor="middle">${+xv.toFixed(1)}</text>`;
    html += `<text x="${tx(0)-5}" y="${ty(yv)+3}" font-family="Space Mono,monospace" font-size="7.5" fill="var(--text-faint)" text-anchor="end">${+yv.toFixed(1)}</text>`;
  }

  // vertex dots
  verts.forEach(v => {
    const isCur = Math.abs(v[0] - curX) < 1e-8 && Math.abs(v[1] - curY) < 1e-8;
    const vx = tx(v[0]), vy = ty(v[1]);
    html += `<circle cx="${vx}" cy="${vy}" r="${isCur ? 7 : 4}" fill="${isCur ? 'var(--cyan)' : 'rgba(255,253,248,0.9)'}" stroke="${isCur ? 'rgba(255,255,255,0.8)' : 'rgba(33,77,107,0.5)'}" stroke-width="${isCur ? 2.5 : 1.5}"><title>(${fractionStr(v[0])}, ${fractionStr(v[1])})</title></circle>`;
    if (isCur) {
      const anchor = vx > GW / 2 ? 'end' : 'start';
      const xOff   = vx > GW / 2 ? -12 : 12;
      html += `<text x="${vx + xOff}" y="${vy - 11}" font-family="Space Mono,monospace" font-size="8.5" fill="var(--cyan)" text-anchor="${anchor}">(${fractionStr(curX)}, ${fractionStr(curY)})</text>`;
    }
  });

  svg.innerHTML = html;
  noteEl.textContent = `vertex (${fractionStr(curX)}, ${fractionStr(curY)})  ·  obj = ${fractionStr(objVal)}`;

  const cLabelNames = p.A.map((_, i) => `C${i+1}`);
  const hasPath = history.length > 0;
  legendEl.innerHTML = `
    <div class="leg-row"><svg width="9" height="9"><circle cx="4.5" cy="4.5" r="4.5" fill="var(--cyan)"/></svg> Current vertex</div>
    <div class="leg-row"><svg width="9" height="9"><circle cx="4.5" cy="4.5" r="4.5" fill="rgba(255,253,248,0.9)" stroke="rgba(33,77,107,0.5)" stroke-width="1.5"/></svg> Other vertices</div>
    ${hasPath ? `<div class="leg-row"><svg width="18" height="6"><line x1="0" y1="3" x2="14" y2="3" stroke="rgba(33,77,107,0.65)" stroke-width="2" stroke-dasharray="4,2"/></svg> Simplex path</div>` : ''}
    <div class="leg-row"><svg width="18" height="6"><line x1="0" y1="3" x2="18" y2="3" stroke="rgba(142,95,42,0.85)" stroke-width="2"/></svg> Obj. direction</div>
    ${objVal > 1e-10 ? `<div class="leg-row"><svg width="18" height="6"><line x1="0" y1="3" x2="18" y2="3" stroke="rgba(142,95,42,0.55)" stroke-width="1.5" stroke-dasharray="5,3"/></svg> Isoprofit z=${fractionStr(objVal)}</div>` : ''}
    <div class="leg-row"><svg width="18" height="6"><line x1="0" y1="3" x2="18" y2="3" stroke="rgba(80,80,160,0.38)" stroke-width="1" stroke-dasharray="5,3"/></svg> ${cLabelNames.join(', ')} boundaries</div>
  `;
}

// ─────────────────────────────────────────────
//  WHY PANELS
// ─────────────────────────────────────────────
function toggleWhy(id) {
  const body    = document.getElementById(`why-${id}-body`);
  const chevron = document.getElementById(`why-${id}-chevron`);
  const open = !body.hidden;
  body.hidden = open;
  chevron.classList.toggle('open', !open);
  if (!open && window.MathJax) MathJax.typesetPromise([body]).catch(() => {});
}

function updateWhyPanels() {
  const hasCandidates = !isOptimal() && getCandidateCols().length > 0;
  document.getElementById('why-entering').hidden = !hasCandidates;
  const showRatio = enteringCol !== null && leavingRow !== null && !isUnbounded(enteringCol);
  document.getElementById('why-ratio').hidden = !showRatio;
}

// ─────────────────────────────────────────────
//  AUTO-SOLVE
// ─────────────────────────────────────────────
function getAutoDelay() {
  return parseInt(document.getElementById('speed-slider').value, 10);
}

function autoSolveStep() {
  if (isOptimal()) {
    stopAutoSolve();
    setStatus('optimal', '✓', `Optimal! All reduced costs ≥ 0. Objective value = <strong>${fractionStr(Math.abs(state.z))}</strong>`);
    return;
  }
  const candidates = getCandidateCols();
  if (!candidates.length) { stopAutoSolve(); return; }

  const col = getAutoEnteringCol();

  if (isUnbounded(col)) {
    stopAutoSolve();
    setStatus('unbounded', '⚠', `Column ${escapeHtml(state.varNames[col])} has no positive entries — the LP is unbounded.`);
    return;
  }

  const row = findLeavingRow(col);
  history.push({
    tableau: cloneState(state),
    pivotRow: row,
    pivotCol: col,
    enteringVar: state.varNames[col],
    leavingVar:  state.basisNames[row],
    pivotElem:   state.A[row][col],
  });

  doPivot(row, col);
  enteringCol = null;
  leavingRow  = null;

  renderTableau(true);
  renderHistory();

  if (isOptimal()) {
    stopAutoSolve();
    setStatus('optimal', '✓', `Optimal! All reduced costs ≥ 0. Objective value = <strong>${fractionStr(Math.abs(state.z))}</strong>`);
  } else {
    autoSolveTimer = setTimeout(autoSolveStep, getAutoDelay());
  }
}

function startAutoSolve() {
  if (isOptimal()) return;
  const btn      = document.getElementById('btn-autosolve');
  const speedRow = document.getElementById('speed-row');
  btn.textContent = '■ Stop';
  btn.classList.add('running');
  speedRow.style.display = 'flex';
  autoSolveTimer = setTimeout(autoSolveStep, getAutoDelay());
}

function stopAutoSolve() {
  if (autoSolveTimer !== null) { clearTimeout(autoSolveTimer); autoSolveTimer = null; }
  const btn      = document.getElementById('btn-autosolve');
  const speedRow = document.getElementById('speed-row');
  if (btn) { btn.textContent = '▶ Auto-Solve'; btn.classList.remove('running'); }
  if (speedRow) speedRow.style.display = 'none';
}

function toggleAutoSolve() {
  if (autoSolveTimer !== null) stopAutoSolve();
  else startAutoSolve();
}

// ─────────────────────────────────────────────
//  PIVOT DETAILS RENDER
// ─────────────────────────────────────────────
function renderPivotDetails() {
  const panel = document.getElementById('pivot-details');
  if (enteringCol === null || leavingRow === null || isUnbounded(enteringCol)) {
    panel.hidden = true;
    panel.innerHTML = '';
    return;
  }

  const details = buildPivotWalkthrough(leavingRow, enteringCol);
  panel.hidden = false;
  panel.innerHTML = `
    <div class="pivot-details-header">
      <div>
        <div class="pivot-details-title">Pivot Calculations</div>
        <div class="pivot-details-lead">
          Enter <strong>${escapeHtml(details.enteringVar)}</strong>, leave <strong>${escapeHtml(details.leavingVar)}</strong>, then update every row using the normalised pivot row.
        </div>
      </div>
      <div class="pivot-step-formula">Pivot element = ${fractionStr(details.pivotElem)}</div>
    </div>
    <div class="pivot-details-grid">
      ${details.steps.map(step => `
        <section class="pivot-step-card">
          <div class="pivot-step-meta">
            <div class="pivot-step-label">${escapeHtml(step.label)}</div>
            <div class="pivot-step-target">${escapeHtml(step.target)}</div>
          </div>
          <div class="pivot-step-formula ${escapeHtml(step.formulaClass || '')}">${step.formula}</div>
          ${STEP_MEANINGS[step.label] ? `<div class="pivot-step-meaning">${escapeHtml(STEP_MEANINGS[step.label])}</div>` : ''}
          ${step.equation ? `<div class="pivot-step-equation"><strong>New equation</strong>${escapeHtml(step.equation)}</div>` : ''}
          <div class="pivot-step-updates">
            ${step.updates.map(u => `
              <div class="pivot-update${u.isWinner ? ' winner' : ''}">
                <div class="pivot-update-name">${escapeHtml(u.name)}</div>
                <div class="pivot-update-calc">${escapeHtml(u.calc)}</div>
              </div>
            `).join('')}
          </div>
        </section>
      `).join('')}
    </div>
    <div class="pivot-basis-note">${escapeHtml(details.basisNote)}</div>
  `;
  if (window.MathJax) MathJax.typesetPromise([panel]).catch(() => {});
}

// ─────────────────────────────────────────────
//  COMPUTE HELPERS
// ─────────────────────────────────────────────
function getCandidateCols() {
  return state.c.map((v, i) => v < -1e-10 ? i : -1).filter(i => i >= 0);
}

function getRatios(col) {
  return state.A.map((row, i) => row[col] > 1e-10 ? state.b[i] / row[col] : Infinity);
}

function isOptimal() {
  return state.c.every(v => v >= -1e-10);
}

function isUnbounded(col) {
  return state.A.every(row => row[col] <= 1e-10);
}

function findLeavingRow(col) {
  const ratios = getRatios(col);
  let minRatio = Infinity, lRow = -1;
  ratios.forEach((r, i) => { if (r < minRatio - 1e-10) { minRatio = r; lRow = i; } });
  return lRow;
}

// ─────────────────────────────────────────────
//  PIVOT OPERATION
// ─────────────────────────────────────────────
function doPivot(pivRow, pivCol) {
  const pivElem = state.A[pivRow][pivCol];
  const m = state.A.length, n = state.c.length;

  state.b[pivRow] /= pivElem;
  for (let j = 0; j < n; j++) state.A[pivRow][j] /= pivElem;

  for (let i = 0; i < m; i++) {
    if (i === pivRow) continue;
    const factor = state.A[i][pivCol];
    if (Math.abs(factor) < 1e-12) continue;
    state.b[i] -= factor * state.b[pivRow];
    for (let j = 0; j < n; j++) state.A[i][j] -= factor * state.A[pivRow][j];
  }

  const zFactor = state.c[pivCol];
  state.z -= zFactor * state.b[pivRow];
  for (let j = 0; j < n; j++) state.c[j] -= zFactor * state.A[pivRow][j];

  state.basisNames[pivRow] = state.varNames[pivCol];
  state.iteration++;
}

// ─────────────────────────────────────────────
//  USER INTERACTIONS
// ─────────────────────────────────────────────
function selectColumn(col) {
  if (isOptimal()) return;
  if (state.c[col] >= -1e-10) return;
  stopAutoSolve();
  enteringCol = col;
  if (isUnbounded(col)) {
    leavingRow = null;
    setStatus('unbounded', '⚠', `Column ${escapeHtml(state.varNames[col])} has no positive entries — the LP is unbounded along this direction.`);
  } else {
    leavingRow = findLeavingRow(col);
    setStatus('pivot-ready', '◆', `Enter: <strong>${escapeHtml(state.varNames[col])}</strong> &nbsp;·&nbsp; Leave: <em>${escapeHtml(state.basisNames[leavingRow])}</em> &nbsp;·&nbsp; θ* = ${fractionStr(state.b[leavingRow] / state.A[leavingRow][col])}`);
  }
  renderTableau();
}

function confirmPivot() {
  if (enteringCol === null || leavingRow === null) return;
  history.push({
    tableau: cloneState(state),
    pivotRow: leavingRow,
    pivotCol: enteringCol,
    enteringVar: state.varNames[enteringCol],
    leavingVar:  state.basisNames[leavingRow],
    pivotElem:   state.A[leavingRow][enteringCol],
  });

  doPivot(leavingRow, enteringCol);
  enteringCol = null;
  leavingRow  = null;

  renderTableau(true);
  renderHistory();

  if (isOptimal()) {
    setStatus('optimal', '✓', `Optimal! All reduced costs ≥ 0. Objective value = <strong>${fractionStr(Math.abs(state.z))}</strong>`);
  } else {
    setStatus('info', '💡', 'Click a column header with a negative reduced cost to select the next entering variable.');
  }
}

// ─────────────────────────────────────────────
//  STATUS
// ─────────────────────────────────────────────
function setStatus(type, icon, msg) {
  const bar = document.getElementById('status-bar');
  bar.className = `status-bar ${type}`;
  bar.querySelector('.status-icon').textContent = icon;
  document.getElementById('status-text').innerHTML = msg;
}

// ─────────────────────────────────────────────
//  RENDER TABLEAU
// ─────────────────────────────────────────────
function renderTableau(flash = false) {
  const m = state.A.length, n = state.c.length;
  const candidates = getCandidateCols();
  const ratios     = enteringCol !== null ? getRatios(enteringCol) : null;
  const optimal    = isOptimal();
  const unbounded  = enteringCol !== null && isUnbounded(enteringCol);

  document.getElementById('iter-label').textContent =
    state.iteration === 0 ? 'Iteration 0 — Initial BFS' : `Iteration ${state.iteration}`;
  const objVal = fractionStr(Math.abs(state.z));
  document.getElementById('obj-label').textContent = state.z !== 0 ? `obj = ${objVal}` : '';

  // action row
  const actionRow = document.getElementById('action-row');
  document.getElementById('pivot-btn').style.display = '';
  if (enteringCol !== null && leavingRow !== null && !unbounded) {
    actionRow.style.display = 'flex';
    document.getElementById('pivot-summary').innerHTML =
      `Enter <strong>${escapeHtml(state.varNames[enteringCol])}</strong> into basis &nbsp;·&nbsp; ` +
      `Remove <em>${escapeHtml(state.basisNames[leavingRow])}</em> &nbsp;·&nbsp; ` +
      `Pivot element = <strong>${fractionStr(state.A[leavingRow][enteringCol])}</strong>`;
  } else {
    actionRow.style.display = optimal ? 'flex' : 'none';
    if (optimal) {
      document.getElementById('pivot-summary').innerHTML =
        `<span class="optimal-badge">✓ Optimal</span>&nbsp; ${state.basisNames.map((b, i) => `${escapeHtml(b)} = ${fractionStr(state.b[i])}`).join(', ')} &nbsp;·&nbsp; Objective = ${objVal}`;
      actionRow.querySelector('.btn-pivot').style.display = 'none';
    }
  }

  // auto-solve button
  const aBtn = document.getElementById('btn-autosolve');
  if (aBtn) aBtn.disabled = optimal;

  // click hint
  document.getElementById('click-hint').style.display = (optimal || enteringCol !== null) ? 'none' : 'flex';

  // build table
  let showRatio = enteringCol !== null && !unbounded;
  let html = `<table class="stbl${flash ? ' flash' : ''}">`;

  // thead
  html += '<thead><tr>';
  html += `<th class="col-basis"><div class="cell-inner">Basis</div></th>`;
  for (let j = 0; j < n; j++) {
    let cls = '';
    if (j === enteringCol) cls = 'col-enter';
    else if (!optimal && candidates.includes(j)) cls = 'col-candidate';
    const click = (!optimal && candidates.includes(j) && j !== enteringCol)
      ? `onclick="selectColumn(${j})"` : '';
    const rcVal = state.c[j];
    const tooltip = Math.abs(rcVal) < 1e-10
      ? `${state.varNames[j]}: reduced cost = 0 (non-improving)`
      : rcVal < 0
        ? `${state.varNames[j]}: c̄ = ${fractionStr(rcVal)} → increasing this variable improves z by ${fractionStr(-rcVal)} per unit`
        : `${state.varNames[j]}: c̄ = ${fractionStr(rcVal)} → increasing this variable worsens z`;
    html += `<th class="${cls}" ${click} title="${escapeHtml(tooltip)}"><div class="cell-inner">${escapeHtml(state.varNames[j])}</div></th>`;
  }
  html += `<th class="col-rhs"><div class="cell-inner">RHS</div></th>`;
  if (showRatio) html += `<th style="background:rgba(142,95,42,0.06)"><div class="cell-inner ratio-header">Ratio θ</div></th>`;
  html += '</tr></thead>';

  // tbody
  html += '<tbody>';
  for (let i = 0; i < m; i++) {
    const isLeaving = leavingRow === i;
    html += `<tr>`;
    html += `<td class="row-label${isLeaving ? ' row-leaving' : ''}"><div class="cell-inner">${escapeHtml(state.basisNames[i])}</div></td>`;
    for (let j = 0; j < n; j++) {
      let tdCls = '';
      if (j === enteringCol && isLeaving) tdCls = 'col-enter row-leaving pivot-cell';
      else if (j === enteringCol) tdCls = 'col-enter';
      else if (isLeaving) tdCls = 'row-leaving';
      else if (!optimal && candidates.includes(j)) tdCls = 'col-candidate';
      const click = (!optimal && candidates.includes(j) && j !== enteringCol)
        ? `onclick="selectColumn(${j})"` : '';
      html += `<td class="${tdCls}" ${click}><div class="cell-inner">${fractionStr(state.A[i][j])}</div></td>`;
    }
    html += `<td${isLeaving ? ' class="row-leaving"' : ''}><div class="cell-inner">${fractionStr(state.b[i])}</div></td>`;
    if (showRatio) {
      const r = ratios[i];
      const isMin = leavingRow === i;
      if (r === Infinity || state.A[i][enteringCol] <= 1e-10) {
        html += `<td class="ratio-dash" title="a_ij ≤ 0 — not a candidate for leaving"><div class="cell-inner">—</div></td>`;
      } else {
        html += `<td class="ratio-cell${isMin ? ' min-ratio' : ''}" title="${fractionStr(state.b[i])} / ${fractionStr(state.A[i][enteringCol])} = ${fractionStr(r)}${isMin ? ' ← minimum (leaving row)' : ''}"><div class="cell-inner">${fractionStr(r)}${isMin ? ' ←' : ''}</div></td>`;
      }
    }
    html += '</tr>';
  }

  // z row
  html += `<tr class="z-row">`;
  html += `<td class="row-label row-z"><div class="cell-inner">z</div></td>`;
  for (let j = 0; j < n; j++) {
    const v = state.c[j];
    const rcCls = Math.abs(v) < 1e-10 ? 'reduced-zero' : (v < 0 ? 'reduced-neg' : 'reduced-pos');
    let tdCls = rcCls;
    if (j === enteringCol) tdCls += ' col-enter';
    const click = (!optimal && candidates.includes(j) && j !== enteringCol)
      ? `onclick="selectColumn(${j})"` : '';
    html += `<td class="${tdCls}" ${click}><div class="cell-inner">${fractionStr(v)}</div></td>`;
  }
  html += `<td class="row-z"><div class="cell-inner">${fractionStr(state.z)}</div></td>`;
  if (showRatio) html += `<td class="ratio-dash"><div class="cell-inner">—</div></td>`;
  html += '</tr></tbody></table>';

  const scroll = document.getElementById('tbl-scroll');
  scroll.innerHTML = html;
  if (window.MathJax) MathJax.typesetPromise([scroll]).catch(() => {});

  renderPivotDetails();
  updateWhyPanels();
  renderBFS();
  renderFeasibleRegion();
  renderInterpreter();

  const wrap = document.getElementById('tableau-wrap');
  if (flash) {
    wrap.classList.remove('new-tableau');
    void wrap.offsetWidth;
    wrap.classList.add('new-tableau');
  }
}

// ─────────────────────────────────────────────
//  RENDER HISTORY
// ─────────────────────────────────────────────
function renderHistory() {
  const section = document.getElementById('history-section');
  const list    = document.getElementById('history-list');
  if (history.length === 0) { section.style.display = 'none'; return; }
  section.style.display = 'block';

  list.innerHTML = history.slice().reverse().map((h, revIdx) => {
    const s = h.tableau;
    const m = s.A.length, n = s.c.length;
    const iterNum = history.length - revIdx - 1;
    let html = `<div class="history-item new-history">`;
    html += `<div class="history-item-header">
      <span class="hi-iter">Iter ${iterNum}</span>
      <span class="hi-pivot">Enter: ${escapeHtml(h.enteringVar)} &nbsp;·&nbsp; Leave: ${escapeHtml(h.leavingVar)} &nbsp;·&nbsp; Pivot = ${fractionStr(h.pivotElem)}</span>
    </div><div class="history-tbl-wrap"><table class="htbl"><thead><tr>`;
    html += `<th>Basis</th>`;
    s.varNames.forEach((v, j) => { html += `<th class="${j === h.pivotCol ? 'hl-col' : ''}">${escapeHtml(v)}</th>`; });
    html += `<th>RHS</th></tr></thead><tbody>`;
    for (let i = 0; i < m; i++) {
      html += `<tr${i === h.pivotRow ? ' class="hl-row"' : ''}>`;
      html += `<td>${escapeHtml(s.basisNames[i])}</td>`;
      s.A[i].forEach((v, j) => {
        let cls = '';
        if (j === h.pivotCol && i === h.pivotRow) cls = 'hl-pivot';
        else if (j === h.pivotCol) cls = 'hl-col';
        else if (i === h.pivotRow) cls = 'hl-row';
        html += `<td class="${cls}">${fractionStr(v)}</td>`;
      });
      html += `<td>${fractionStr(s.b[i])}</td></tr>`;
    }
    html += `<tr class="z-row-h"><td>z</td>`;
    s.c.forEach((v, j) => html += `<td class="${j === h.pivotCol ? 'hl-col' : ''}">${fractionStr(v)}</td>`);
    html += `<td>${fractionStr(s.z)}</td></tr>`;
    html += `</tbody></table></div></div>`;
    return html;
  }).join('');
}

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────
loadPreset(0);
