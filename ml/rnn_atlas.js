function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function byId(id) {
  return document.getElementById(id);
}

class CanvasViz {
  constructor(id) {
    this.canvas = byId(id);
    this.ctx = this.canvas.getContext('2d');
    this.resize();
  }

  resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = this.canvas.clientWidth || parseInt(this.canvas.getAttribute('width'), 10);
    const height = this.canvas.clientHeight || parseInt(this.canvas.getAttribute('height'), 10);
    this.canvas.width = width * ratio;
    this.canvas.height = height * ratio;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.W = width;
    this.H = height;
  }

  clear(color = '#171d27') {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.W, this.H);
  }

  grid(step = 36) {
    const { ctx, W, H } = this;
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  }

  text(text, x, y, color = 'rgba(255,255,255,0.82)', size = 12, align = 'left') {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `${size}px 'Fira Code', monospace`;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  line(x1, y1, x2, y2, color, width = 1.5, dash = []) {
    const { ctx } = this;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  circle(x, y, r, fill, stroke = null, lineWidth = 1.5) {
    const { ctx } = this;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
    ctx.restore();
  }

  rect(x, y, w, h, fill, stroke = null, lineWidth = 1.5, radius = 10) {
    const { ctx } = this;
    ctx.save();
    const r = Math.min(radius, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
    ctx.restore();
  }

  arrow(x1, y1, x2, y2, color, width = 1.8, dash = []) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    this.line(x1, y1, x2, y2, color, width, dash);
    const size = 7;
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - size * Math.cos(angle - Math.PI / 6), y2 - size * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - size * Math.cos(angle + Math.PI / 6), y2 - size * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

const series = Array.from({ length: 40 }, (_, i) =>
  0.52 * Math.sin(i * 0.45) +
  0.28 * Math.sin(i * 0.14 + 1.1) +
  0.16 * Math.cos(i * 0.82) +
  0.015 * i
);

const sequenceWindowViz = new CanvasViz('sequenceWindowCanvas');
const rnnViz = new CanvasViz('rnnUnrollCanvas');
const seqToOneViz = new CanvasViz('seqToOneCanvas');
const seqToSeqViz = new CanvasViz('seqToSeqCanvas');
const seqToSeqDetailViz = new CanvasViz('seqToSeqDetailCanvas');
const rnnGradientViz = new CanvasViz('rnnGradientCanvas');
const lstmViz = new CanvasViz('lstmCanvas');
const lstmArchViz = new CanvasViz('lstmArchCanvas');
const lstmTimelineViz = new CanvasViz('lstmTimelineCanvas');
const gruViz = new CanvasViz('gruCanvas');
const gruArchViz = new CanvasViz('gruArchCanvas');
const gruTimelineViz = new CanvasViz('gruTimelineCanvas');
const attentionViz = new CanvasViz('attentionCanvas');
const selfAttentionSubViz = new CanvasViz('selfAttentionCanvas');
const attentionStepViz = new CanvasViz('attentionStepCanvas');
const crossAttentionSubViz = new CanvasViz('crossAttentionCanvas');
const multiHeadSubViz = new CanvasViz('multiHeadCanvas');
const maskViz = new CanvasViz('maskCanvas');

const state = {
  windowStep: 14,
  windowLength: 9,
  windowHorizon: 4,
  rnnMode: 'seq2seq',
  rnnPlayhead: 0,
  rnnAnimating: false,
  jacobianEigen: 0.92,
  jacobianSteps: 18,
  seqOneHistory: 12,
  seqOneCompression: 0.68,
  encoderLength: 8,
  decoderLength: 5,
  decoderMode: 'recursive',
  seq2seqLabStep: 2,
  seq2seqLabPhase: 0,
  seq2seqLabMode: 'teacher',
  seq2seqLabMemory: 'attention',
  forgetGate: 0.72,
  inputGate: 0.38,
  outputGate: 0.64,
  candidateGate: 0.45,
  updateGate: 0.58,
  resetGate: 0.3,
  gruCandidate: 0.62,
  attentionQuery: 11,
  attentionTemp: 0.55,
  attentionMode: 'global',
  attentionPattern: 'self',
  attentionHeads: 3,
  attentionWalkStep: 0,
  attentionWalkToken: 5,
  qkvLabMode: 'self',
  qkvLabQuery: 3,
  attentionLabMode: 'self',
  attentionLabStep: 0,
  attentionLabQuery: 3,
  attentionLabTimer: null,
  scoreLabMethod: 'dot',
  scoreLabQuery: 2,
  scoreLabTemp: 0.7,
  multiHeadLabStep: 0,
  multiHeadLabQuery: 3,
  multiHeadLabHeads: 3,
  multiHeadLabTimer: null,
  maskSize: 8,
  maskFocus: 6
};

const semanticSourceBlueprint = [
  { name: 'night base', raw: [0.18, 0.04], valueText: 'stable low-load baseline' },
  { name: 'morning ramp', raw: [0.54, 0.42], valueText: 'rising commute demand' },
  { name: 'midday plateau', raw: [0.72, 0.12], valueText: 'high but steady demand' },
  { name: 'evening peak', raw: [0.88, 0.56], valueText: 'strong high-load peak' },
  { name: 'cool-down', raw: [0.40, -0.18], valueText: 'post-peak relaxation' },
  { name: 'next ramp', raw: [0.57, 0.38], valueText: 'another ramp-up pattern' },
  { name: 'weekend dip', raw: [0.22, -0.10], valueText: 'low-demand regime' },
  { name: 'heat spike', raw: [0.95, 0.82], valueText: 'rare anomalous surge' }
];

const semanticDecoderBlueprint = [
  { name: 'next hour', raw: [0.50, 0.24] },
  { name: 'ramp build', raw: [0.66, 0.42] },
  { name: 'peak forecast', raw: [0.86, 0.58] },
  { name: 'cool-down', raw: [0.46, -0.12] },
  { name: 'recovery', raw: [0.36, 0.08] }
];

function mapSeriesPoint(index, value, left, top, width, height, xMax) {
  return {
    x: left + (index / xMax) * width,
    y: top + height - ((value + 1.4) / 3.2) * height
  };
}

function drawSeries(viz, values, options = {}) {
  const left = options.left ?? 50;
  const top = options.top ?? 34;
  const width = options.width ?? viz.W - 100;
  const height = options.height ?? viz.H - 80;
  const xMax = Math.max(1, values.length - 1);
  viz.line(left, top + height, left + width, top + height, 'rgba(255,255,255,0.18)', 1);
  viz.line(left, top, left, top + height, 'rgba(255,255,255,0.18)', 1);
  const { ctx } = viz;
  ctx.save();
  ctx.beginPath();
  values.forEach((value, index) => {
    const p = mapSeriesPoint(index, value, left, top, width, height, xMax);
    if (index === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.strokeStyle = options.stroke ?? '#34d399';
  ctx.lineWidth = options.lineWidth ?? 2.5;
  ctx.stroke();
  ctx.restore();
  values.forEach((value, index) => {
    const p = mapSeriesPoint(index, value, left, top, width, height, xMax);
    viz.circle(p.x, p.y, 3, options.dot ?? '#a7f3d0');
  });
  return { left, top, width, height, xMax };
}

function dot(a, b) {
  return a.reduce((sum, value, index) => sum + value * b[index], 0);
}

function matVecMul(matrix, vector) {
  return matrix.map(row => row.reduce((sum, value, index) => sum + value * vector[index], 0));
}

function vecAdd(a, b) {
  return a.map((value, index) => value + b[index]);
}

function vecScale(vector, scalar) {
  return vector.map(value => value * scalar);
}

function tanhVec(vector) {
  return vector.map(value => Math.tanh(value));
}

function softmaxScores(scores, temp = 1) {
  const maxScore = Math.max(...scores);
  const exps = scores.map(score => Math.exp((score - maxScore) / temp));
  const total = exps.reduce((sum, value) => sum + value, 0);
  return exps.map(value => value / total);
}

function setGridColumns(element, count) {
  const width = window.innerWidth || 1200;
  const columns = width <= 760 ? Math.min(count, 4) : width <= 960 ? Math.min(count, 6) : count;
  element.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
}

function describePattern(raw) {
  const [level, slope] = raw;
  const levelText = level > 0.8 ? 'high-load' : level > 0.55 ? 'mid/high-load' : 'low-load';
  const slopeText = slope > 0.35 ? 'rising' : slope < -0.06 ? 'falling' : 'steady';
  return `${slopeText} ${levelText} pattern`;
}

function projectQuery(raw) {
  return [
    1.02 * raw[0] - 0.18 * raw[1],
    0.26 * raw[0] + 1.04 * raw[1]
  ];
}

function projectKey(raw) {
  return [
    0.90 * raw[0] + 0.12 * raw[1],
    -0.16 * raw[0] + 1.12 * raw[1]
  ];
}

function projectValue(raw) {
  return [
    raw[0],
    0.46 * raw[0] + 0.84 * raw[1]
  ];
}

function semanticAttentionData(mode, activeQuery) {
  const source = semanticSourceBlueprint.map((item, index) => ({
    label: mode === 'self' ? `x${index + 1}` : `e${index + 1}`,
    name: item.name,
    raw: item.raw,
    q: projectQuery(item.raw),
    k: projectKey(item.raw),
    v: projectValue(item.raw),
    valueText: item.valueText
  }));

  const queries = (mode === 'self' ? semanticSourceBlueprint : semanticDecoderBlueprint).map((item, index) => ({
    label: mode === 'self' ? `x${index + 1}` : `d${index + 1}`,
    name: item.name,
    raw: item.raw,
    q: projectQuery(item.raw)
  }));

  const active = queries[activeQuery - 1];
  const scores = source.map(token => dot(active.q, token.k) / Math.sqrt(active.q.length));
  const weights = softmaxScores(scores, 0.22);
  const context = source.reduce((acc, token, index) => vecAdd(acc, vecScale(token.v, weights[index])), [0, 0]);
  return { source, queries, scores, weights, context };
}

function scoreMethodData(method, activeQuery, temp) {
  const data = semanticAttentionData('cross', activeQuery);
  const query = data.queries[activeQuery - 1];
  const Wq = [[1.10, -0.22], [0.34, 0.92]];
  const Wk = [[0.78, 0.28], [-0.44, 1.02]];
  const vA = [0.86, -0.34];
  const Wa = [[1.14, 0.24], [-0.18, 0.82]];

  const scores = data.source.map(token => {
    if (method === 'bahdanau') {
      const hidden = tanhVec(vecAdd(matVecMul(Wq, query.raw), matVecMul(Wk, token.raw)));
      return dot(vA, hidden);
    }
    if (method === 'luong') {
      return dot(query.raw, matVecMul(Wa, token.raw));
    }
    return dot(query.q, token.k) / Math.sqrt(query.q.length);
  });

  const weights = softmaxScores(scores, temp);
  const context = data.source.reduce((acc, token, index) => vecAdd(acc, vecScale(token.v, weights[index])), [0, 0]);
  return { ...data, query, scores, weights, context, params: { Wq, Wk, vA, Wa } };
}

function seq2seqLabData() {
  const enc = state.encoderLength;
  const dec = state.decoderLength;
  const history = Array.from({ length: enc }, (_, i) => Math.round(112 + i * 4 + 5 * Math.sin(i * 0.8 + 0.3)));
  const truth = Array.from({ length: dec }, (_, h) => Math.round(history[history.length - 1] + 3 * (h + 1) + 2 * Math.sin(h * 0.9 + 0.4)));
  const encoderStates = history.map((value, index) => [
    (value - 100) / 60,
    0.12 + 0.08 * Math.sin(index * 0.7)
  ]);
  const fixedContext = [0.74, 0.28];
  const steps = [];
  const lastHistory = history[history.length - 1];

  for (let h = 0; h < dec; h++) {
    const prevSignal = h === 0
      ? lastHistory
      : state.seq2seqLabMode === 'teacher'
        ? truth[h - 1]
        : steps[h - 1].prediction;
    const query = [
      (prevSignal - 100) / 60,
      0.20 + 0.08 * Math.cos(h * 0.9 + 0.3)
    ];
    const rawScores = encoderStates.map((encState, index) =>
      1.2 * dot(query, encState) - 0.12 * Math.abs(index - (enc - 1 - Math.min(h, 2))) + 0.08 * Math.cos(index * 0.6 + h * 0.5)
    );
    const weights = softmaxScores(rawScores, 0.48);
    const contextAttention = encoderStates.reduce((acc, encState, index) => vecAdd(acc, vecScale(encState, weights[index])), [0, 0]);
    const context = state.seq2seqLabMemory === 'attention' ? contextAttention : fixedContext;
    const prediction = Math.round(lastHistory + 3 * (h + 1) + context[0] * 9 + context[1] * 7 + (state.seq2seqLabMode === 'infer' ? h * 1.1 : 0));
    steps.push({
      step: h + 1,
      input: prevSignal,
      query,
      weights,
      context,
      prediction,
      truth: truth[h]
    });
  }

  return { history, truth, encoderStates, fixedContext, steps };
}

function renderSequenceWindow() {
  const viz = sequenceWindowViz;
  const { windowStep, windowLength, windowHorizon } = state;
  viz.clear();
  viz.grid();
  const frame = drawSeries(viz, series, { top: 28, height: 190 });
  const start = clamp(windowStep, 0, series.length - windowLength - windowHorizon - 1);
  const inputEnd = start + windowLength - 1;
  const horizonEnd = inputEnd + windowHorizon;
  const xStep = frame.width / frame.xMax;

  viz.rect(frame.left + start * xStep - 8, 26, windowLength * xStep + 16, 194, 'rgba(96,165,250,0.16)', 'rgba(96,165,250,0.65)', 1.4, 12);
  viz.rect(frame.left + (inputEnd + 1) * xStep - 8, 26, windowHorizon * xStep + 16, 194, 'rgba(251,146,60,0.16)', 'rgba(251,146,60,0.65)', 1.4, 12);

  viz.text('past context window', frame.left + start * xStep + 12, 44, '#93c5fd', 11);
  viz.text('forecast targets', frame.left + (inputEnd + 1) * xStep + 12, 44, '#fdba74', 11);
  viz.text('example: 9 past hourly loads -> 4-step forecast', 52, 248, 'rgba(255,255,255,0.72)', 11);

  byId('windowStepVal').textContent = `t=${start}`;
  byId('windowLengthVal').textContent = String(windowLength);
  byId('windowHorizonVal').textContent = String(windowHorizon);
}

function drawNode(viz, x, y, label, fill, stroke, active = false, size = {}) {
  const w = size.w ?? 48;
  const h = size.h ?? 44;
  const fontSize = size.fontSize ?? 12;
  const radius = size.radius ?? 12;
  if (active) {
    viz.rect(x - w / 2 - 4, y - h / 2 - 4, w + 8, h + 8, 'rgba(255,255,255,0.06)', stroke, 1.2, radius + 3);
  }
  viz.rect(x - w / 2, y - h / 2, w, h, fill, stroke, active ? 2.5 : 1.5, radius);
  viz.text(label, x, y + Math.min(4, h * 0.12 + 1), active ? '#fff' : 'rgba(255,255,255,0.88)', fontSize, 'center');
}

function drawCallout(viz, x, y, w, h, title, lines, options = {}) {
  const fill = options.fill ?? 'rgba(15,23,42,0.48)';
  const stroke = options.stroke ?? 'rgba(148,163,184,0.28)';
  const titleColor = options.titleColor ?? '#f8fafc';
  const textColor = options.textColor ?? 'rgba(226,232,240,0.82)';
  viz.rect(x, y, w, h, fill, stroke, 1.2, 12);
  viz.text(title, x + 12, y + 16, titleColor, 11);
  lines.forEach((line, index) => {
    viz.text(line, x + 12, y + 31 + index * 14, textColor, 9);
  });
}

function renderRnnUnroll() {
  const viz = rnnViz;
  viz.clear();
  viz.grid();
  const steps = 6;
  const xs = Array.from({ length: steps }, (_, i) => 92 + i * 124);
  const active = state.rnnPlayhead;
  viz.text('unrolled recurrent cell', 34, 28, 'rgba(255,255,255,0.72)', 12);
  viz.rect(34, 40, viz.W - 68, 28, 'rgba(255,255,255,0.03)', 'rgba(255,255,255,0.08)', 1, 10);
  viz.text('same recurrent parameters are reused at every timestep', 52, 58, 'rgba(226,232,240,0.82)', 10);
  viz.text('outputs', 34, 74, 'rgba(253,186,116,0.8)', 10);
  viz.text('hidden memory chain', 34, 156, '#e9d5ff', 10);
  viz.text('inputs', 34, 238, '#93c5fd', 10);

  for (let i = 0; i < steps; i++) {
    const x = xs[i];
    const isActive = i <= active;
    drawNode(viz, x, 235, `x${i + 1}`, '#1e3a5f', '#60a5fa', i === active);
    drawNode(viz, x, 155, `h${i + 1}`, '#4c1d95', '#c084fc', i === active);
    const showOutput = state.rnnMode === 'seq2seq' || i === steps - 1;
    if (showOutput) drawNode(viz, x, 72, i === steps - 1 && state.rnnMode === 'seq2one' ? 'y' : `y${i + 1}`, '#7c2d12', '#fb923c', i === active || (state.rnnMode === 'seq2one' && i === steps - 1));
    viz.arrow(x, 214, x, 178, 'rgba(255,255,255,0.65)');
    if (showOutput) viz.arrow(x, 133, x, 94, 'rgba(255,255,255,0.65)');
    if (i < steps - 1) {
      viz.arrow(x + 24, 155, xs[i + 1] - 24, 155, isActive ? '#e9d5ff' : 'rgba(192,132,252,0.55)', isActive ? 2.5 : 1.8);
    }
  }

  if (active > 0) {
    for (let i = active; i > 0; i--) {
      viz.arrow(xs[i] - 10, 50, xs[i - 1] + 8, 132, 'rgba(248,113,113,0.72)', 1.4, [5, 4]);
    }
    viz.text('BPTT pushes loss backward through the hidden chain', 412, 50, 'rgba(254,202,202,0.82)', 10);
  }

  drawCallout(
    viz,
    34,
    258,
    viz.W - 68,
    30,
    state.rnnMode === 'seq2seq' ? 'Seq-to-seq readout' : 'Seq-to-one bottleneck',
    [state.rnnMode === 'seq2seq'
      ? 'every hidden state can emit an output, so supervision is spread across time'
      : 'only the final hidden state is exposed, so all relevant history must survive until the end'],
    {
      fill: state.rnnMode === 'seq2seq' ? 'rgba(15,23,42,0.36)' : 'rgba(59,7,18,0.26)',
      stroke: state.rnnMode === 'seq2seq' ? 'rgba(148,163,184,0.22)' : 'rgba(251,146,60,0.28)',
      titleColor: state.rnnMode === 'seq2seq' ? '#e2e8f0' : '#ffedd5'
    }
  );
}

function renderRnnGradient() {
  const viz = rnnGradientViz;
  viz.clear();
  viz.grid();
  const rho = state.jacobianEigen;
  const steps = state.jacobianSteps;
  const left = 58;
  const right = viz.W - 42;
  const bottom = viz.H - 54;
  const top = 56;
  const width = right - left;
  const height = bottom - top;

  viz.text('gradient norm under repeated Jacobian multiplication', 34, 28, 'rgba(255,255,255,0.76)', 12);
  viz.line(left, bottom, right, bottom, 'rgba(255,255,255,0.18)', 1.2);
  viz.line(left, top, left, bottom, 'rgba(255,255,255,0.18)', 1.2);
  viz.text('timesteps', right - 6, bottom + 20, 'rgba(255,255,255,0.6)', 10, 'right');
  viz.text('||grad||', 18, top - 6, 'rgba(255,255,255,0.6)', 10);

  const curves = [
    { val: 0.72, color: '#60a5fa', label: '|lambda|=0.72' },
    { val: 1.0, color: '#f59e0b', label: '|lambda|=1.00' },
    { val: 1.22, color: '#ef4444', label: '|lambda|=1.22' }
  ];

  curves.forEach((curve, idx) => {
    const pts = [];
    for (let t = 0; t <= steps; t++) {
      const raw = Math.pow(curve.val, t);
      const logv = Math.log10(raw + 1e-6);
      const y = bottom - ((clamp(logv, -3, 2) + 3) / 5) * height;
      const x = left + (t / steps) * width;
      pts.push({ x, y });
    }
    const { ctx } = viz;
    ctx.save();
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = curve.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    viz.text(curve.label, right - 130, top + 16 + idx * 18, curve.color, 10);
  });

  const activePts = [];
  for (let t = 0; t <= steps; t++) {
    const raw = Math.pow(rho, t);
    const logv = Math.log10(raw + 1e-6);
    const y = bottom - ((clamp(logv, -3, 2) + 3) / 5) * height;
    const x = left + (t / steps) * width;
    activePts.push({ x, y });
  }
  const { ctx } = viz;
  ctx.save();
  ctx.beginPath();
  activePts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = rho < 0.98 ? '#60a5fa' : rho > 1.02 ? '#ef4444' : '#f59e0b';
  ctx.lineWidth = 3.2;
  ctx.stroke();
  ctx.restore();

  for (let t = 0; t <= steps; t += Math.max(1, Math.floor(steps / 6))) {
    const x = left + (t / steps) * width;
    viz.text(String(t), x, bottom + 18, 'rgba(255,255,255,0.6)', 10, 'center');
  }
  ['1e2', '1e1', '1e0', '1e-1', '1e-2', '1e-3'].forEach((label, i) => {
    const y = top + (i / 5) * height;
    viz.text(label, left - 10, y + 4, 'rgba(255,255,255,0.55)', 10, 'right');
  });

  viz.rect(viz.W - 228, 84, 182, 122, 'rgba(15,23,42,0.5)', 'rgba(148,163,184,0.3)', 1.2, 10);
  viz.text(`chosen |lambda|max = ${rho.toFixed(2)}`, viz.W - 214, 112, '#e2e8f0', 11);
  viz.text(`gradient after ${steps} steps`, viz.W - 214, 136, '#e2e8f0', 11);
  viz.text(`~ ${Math.pow(rho, steps).toExponential(2)}`, viz.W - 214, 160, rho < 0.98 ? '#93c5fd' : rho > 1.02 ? '#fca5a5' : '#fde68a', 11);
  viz.text(rho < 0.98 ? 'spectral contraction -> vanishing' : rho > 1.02 ? 'spectral amplification -> exploding' : 'critical regime -> stable propagation', viz.W - 214, 184, 'rgba(255,255,255,0.72)', 10);

  byId('jacobianEigenVal').textContent = rho.toFixed(2);
  byId('jacobianStepsVal').textContent = String(steps);
}

function renderSeqToOne() {
  const viz = seqToOneViz;
  viz.clear();
  viz.grid();

  const history = state.seqOneHistory;
  const compression = state.seqOneCompression;
  const left = 42;
  const right = viz.W - 42;
  const unit = (right - left) / (history + 4.6);
  const nodeSize = {
    w: clamp(unit * 0.78, 32, 44),
    h: clamp(unit * 0.68, 30, 40),
    fontSize: unit < 38 ? 10 : 11,
    radius: 10
  };
  const halfW = nodeSize.w / 2;
  const halfH = nodeSize.h / 2;
  const inputXs = Array.from({ length: history }, (_, i) => left + unit * (0.6 + i));
  const finalX = left + unit * (history + 1.7);
  const outputX = left + unit * (history + 3.55);
  const stateW = clamp(unit * 1.5, 72, 88);
  const stateH = clamp(unit * 1.08, 52, 64);
  const outW = clamp(unit * 1.6, 86, 98);
  const outH = 38;

  viz.text('time-series forecasting: past 12 hours -> next-hour demand', 38, 28, 'rgba(255,255,255,0.75)', 12);
  inputXs.forEach((x, i) => {
    drawNode(viz, x, 232, `x${i + 1}`, '#1e3a5f', '#60a5fa', false, nodeSize);
    if (i < inputXs.length - 1) viz.arrow(x + halfW, 232, inputXs[i + 1] - halfW, 232, 'rgba(96,165,250,0.5)', 1.4);
  });

  inputXs.forEach((x, i) => {
    const y = 146 - Math.sin(i * 0.52) * 18 - i * 0.8;
    drawNode(viz, x, y, `h${i + 1}`, `rgba(${Math.round(90 + 70 * compression)}, 75, 210, 0.78)`, '#c084fc', false, nodeSize);
    viz.arrow(x, 232 - halfH, x, y + halfH, 'rgba(255,255,255,0.55)', 1.5);
    if (i < inputXs.length - 1) {
      viz.arrow(
        x + halfW,
        y,
        inputXs[i + 1] - halfW,
        146 - Math.sin((i + 1) * 0.52) * 18 - (i + 1) * 0.8,
        'rgba(192,132,252,0.65)',
        1.6
      );
    }
  });

  viz.rect(finalX - stateW / 2, 146 - stateH / 2, stateW, stateH, `rgba(${Math.round(140 + compression * 50)}, 95, 225, 0.18)`, '#c084fc', 2, 18);
  viz.text('compressed', finalX, 138, '#e9d5ff', 12, 'center');
  viz.text('state', finalX, 154, '#e9d5ff', 12, 'center');
  viz.arrow(
    inputXs[inputXs.length - 1] + halfW,
    126 - Math.sin((history - 1) * 0.52) * 18 - (history - 1) * 0.8,
    finalX - stateW / 2 - 2,
    146,
    '#e9d5ff',
    2.2
  );

  viz.rect(outputX - outW / 2, 146 - outH / 2, outW, outH, '#7c2d12', '#fb923c', 1.8, 10);
  viz.text('next load ŷ', outputX, 150, '#fff', 12, 'center');
  viz.arrow(finalX + stateW / 2 + 2, 146, outputX - outW / 2, 146, 'rgba(255,255,255,0.7)', 1.8);

  byId('seqOneHistoryVal').textContent = String(history);
  byId('seqOneCompressionVal').textContent = compression.toFixed(2);
}

function renderSeqToSeq() {
  const viz = seqToSeqViz;
  viz.clear();
  viz.grid();
  const enc = state.encoderLength;
  const dec = state.decoderLength;
  const left = 46;
  const right = viz.W - 46;
  const unit = (right - left) / (enc + dec + 2.4);
  const nodeSize = {
    w: clamp(unit * 0.82, 30, 44),
    h: clamp(unit * 0.72, 28, 40),
    fontSize: unit < 36 ? 10 : 11,
    radius: 10
  };
  const halfW = nodeSize.w / 2;
  const halfH = nodeSize.h / 2;
  const encXs = Array.from({ length: enc }, (_, i) => left + unit * (0.6 + i));
  const contextX = left + unit * (enc + 0.7);
  const decXs = Array.from({ length: dec }, (_, i) => left + unit * (enc + 2.0 + i));
  const contextW = clamp(unit * 1.5, 58, 72);
  const contextH = clamp(unit * 1.12, 46, 54);

  viz.text('encoder history -> decoder horizon', 38, 28, 'rgba(255,255,255,0.76)', 12);
  viz.rect(encXs[0] - 30, 82, encXs[encXs.length - 1] - encXs[0] + 60, 180, 'rgba(96,165,250,0.05)', 'rgba(96,165,250,0.18)', 1.2, 14);
  viz.rect(decXs[0] - 32, 82, decXs[decXs.length - 1] - decXs[0] + 64, 180, 'rgba(74,222,128,0.05)', 'rgba(74,222,128,0.18)', 1.2, 14);
  viz.text('observed history', encXs[0] - 14, 102, '#93c5fd', 11);
  viz.text('forecast horizon', decXs[0] - 18, 102, '#86efac', 11);
  encXs.forEach((x, i) => {
    drawNode(viz, x, 232, `x${i + 1}`, '#1e3a5f', '#60a5fa', false, nodeSize);
    drawNode(viz, x, 142, `h${i + 1}`, '#4c1d95', '#c084fc', false, nodeSize);
    viz.arrow(x, 232 - halfH, x, 142 + halfH, 'rgba(255,255,255,0.6)', 1.5);
    if (i < encXs.length - 1) viz.arrow(x + halfW, 142, encXs[i + 1] - halfW, 142, 'rgba(192,132,252,0.68)', 1.6);
  });

  viz.rect(contextX - contextW / 2, 142 - contextH / 2, contextW, contextH, '#312e81', '#a5b4fc', 1.8, 16);
  viz.text('context', contextX, 148, '#e0e7ff', 12, 'center');
  viz.arrow(encXs[encXs.length - 1] + halfW, 142, contextX - contextW / 2 - 2, 142, 'rgba(224,231,255,0.75)', 1.8);
  viz.text('fixed summary', contextX, 102, '#c4b5fd', 10, 'center');

  for (let i = 0; i < dec; i++) {
    const x = decXs[i];
    drawNode(viz, x, 142, `d${i + 1}`, '#14532d', '#4ade80', false, nodeSize);
    drawNode(viz, x, 232, `ŷ${i + 1}`, '#7c2d12', '#fb923c', false, nodeSize);
    viz.arrow(x, 142 + halfH, x, 232 - halfH, 'rgba(255,255,255,0.6)', 1.5);
    if (i === 0 || state.decoderMode === 'direct') viz.arrow(contextX + contextW / 2 + 2, 142, x - halfW, 142, '#a5b4fc', 1.8, state.decoderMode === 'direct' && i > 0 ? [5, 4] : []);
    if (i < dec - 1) {
      const color = state.decoderMode === 'recursive' ? '#86efac' : 'rgba(74,222,128,0.55)';
      viz.arrow(x + halfW, 142, decXs[i + 1] - halfW, 142, color, 1.6, state.decoderMode === 'direct' ? [6, 4] : []);
      if (state.decoderMode === 'recursive') viz.arrow(x, 232 - halfH, decXs[i + 1], 142 + halfH, 'rgba(251,191,36,0.55)', 1.4, [4, 4]);
    }
  }

  drawCallout(
    viz,
    38,
    278,
    viz.W - 76,
    34,
    state.decoderMode === 'recursive' ? 'Autoregressive decoder' : 'Direct multi-horizon head',
    [state.decoderMode === 'recursive'
      ? 'future steps depend on earlier decoder outputs, so errors can roll forward through time'
      : 'each horizon step reads the shared context directly, which is simpler but less expressive'],
    {
      fill: 'rgba(15,23,42,0.36)',
      stroke: 'rgba(148,163,184,0.22)'
    }
  );
  byId('encoderLengthVal').textContent = String(enc);
  byId('decoderLengthVal').textContent = String(dec);
}

function renderSeqToSeqDetail() {
  const viz = seqToSeqDetailViz;
  viz.clear();
  viz.grid();
  const enc = state.encoderLength;
  const dec = state.decoderLength;
  const left = 46;
  const right = viz.W - 46;
  const unit = (right - left) / (enc + dec + 2.6);
  const nodeSize = {
    w: clamp(unit * 0.84, 30, 44),
    h: clamp(unit * 0.72, 28, 40),
    fontSize: unit < 36 ? 10 : 11,
    radius: 10
  };
  const halfW = nodeSize.w / 2;
  const halfH = nodeSize.h / 2;
  const xs = Array.from({ length: enc }, (_, i) => left + unit * (0.7 + i));
  const ctxX = left + unit * (enc + 0.95);
  const decXs = Array.from({ length: dec }, (_, i) => left + unit * (enc + 2.25 + i));
  const contextW = clamp(unit * 1.6, 62, 80);
  const contextH = clamp(unit * 1.08, 48, 52);

  viz.text('teacher forcing vs inference rollout', 34, 28, 'rgba(255,255,255,0.76)', 12);
  viz.text('encoder history', 48, 76, '#93c5fd', 11);
  viz.text('decoder inputs during training', 48, 176, '#86efac', 11);
  viz.text('decoder outputs / rollout', 48, 272, '#fdba74', 11);

  xs.forEach((x, i) => {
    drawNode(viz, x, 106, `x${i + 1}`, '#1e3a5f', '#60a5fa', false, nodeSize);
    if (i < xs.length - 1) viz.arrow(x + halfW, 106, xs[i + 1] - halfW, 106, 'rgba(96,165,250,0.55)', 1.6);
  });
  viz.rect(ctxX - contextW / 2, 106 - contextH / 2, contextW, contextH, '#312e81', '#a5b4fc', 1.8, 14);
  viz.text('context c', ctxX, 111, '#e0e7ff', 12, 'center');
  viz.arrow(xs[xs.length - 1] + halfW, 106, ctxX - contextW / 2 - 2, 106, '#a5b4fc', 1.8);

  decXs.forEach((x, i) => {
    drawNode(viz, x, 206, `y${i}`, '#14532d', '#4ade80', false, nodeSize);
    drawNode(viz, x, 286, `ŷ${i + 1}`, '#7c2d12', '#fb923c', false, nodeSize);
    viz.arrow(x, 206 + halfH, x, 286 - halfH, 'rgba(255,255,255,0.62)', 1.5);
    if (i === 0) viz.arrow(ctxX + contextW / 2 + 2, 106, x - halfW, 206, '#86efac', 1.6);
    if (i < decXs.length - 1) {
      viz.arrow(x + halfW, 206, decXs[i + 1] - halfW, 206, 'rgba(74,222,128,0.72)', 1.6);
      if (state.decoderMode === 'recursive') {
        viz.arrow(x, 286 + halfH, decXs[i + 1], 206 + halfH, 'rgba(251,191,36,0.65)', 1.5, [4, 4]);
      }
    }
  });
  viz.text(state.decoderMode === 'recursive'
    ? 'inference: previous prediction becomes the next decoder input'
    : 'direct horizon: all outputs come from one shared representation without recursive feedback',
    34, 330, 'rgba(255,255,255,0.72)', 11);
}

function renderLstm() {
  const viz = lstmViz;
  viz.clear();
  viz.grid();
  const f = state.forgetGate;
  const i = state.inputGate;
  const o = state.outputGate;
  const g = state.candidateGate;
  const cPrev = 0.82;
  const cNext = f * cPrev + i * g;
  const hNext = o * Math.tanh(cNext);

  viz.text('LSTM cell: separate memory path and exposed hidden state', 34, 26, 'rgba(255,255,255,0.76)', 12);
  viz.arrow(56, 108, 166, 108, '#93c5fd', 2.2);
  viz.text('c(t-1)', 62, 96, '#bfdbfe', 11);
  viz.rect(166, 74, 78, 68, `rgba(59,130,246,${0.2 + f * 0.6})`, '#60a5fa', 1.8, 12);
  viz.text(`forget ${f.toFixed(2)}`, 205, 114, '#dbeafe', 12, 'center');
  viz.arrow(244, 108, 324, 108, '#93c5fd', 2.2);

  viz.rect(286, 170, 88, 66, `rgba(34,197,94,${0.18 + i * 0.58})`, '#4ade80', 1.8, 12);
  viz.text(`input ${i.toFixed(2)}`, 330, 196, '#dcfce7', 12, 'center');
  viz.text(`cand ${g.toFixed(2)}`, 330, 212, '#dcfce7', 12, 'center');
  viz.arrow(330, 170, 330, 126, '#86efac', 1.8);

  viz.circle(330, 108, 16, '#1f2937', '#cbd5e1', 1.8);
  viz.text('+', 330, 113, '#fff', 16, 'center');
  viz.arrow(346, 108, 458, 108, '#e2e8f0', 2.2);
  viz.text(`c(t)=${cNext.toFixed(2)}`, 390, 90, '#e2e8f0', 11);

  viz.rect(458, 74, 88, 68, `rgba(251,146,60,${0.18 + o * 0.58})`, '#fb923c', 1.8, 12);
  viz.text(`output ${o.toFixed(2)}`, 502, 114, '#ffedd5', 12, 'center');
  viz.arrow(546, 108, 648, 108, '#fdba74', 2.2);
  viz.rect(648, 82, 112, 52, '#7c2d12', '#fdba74', 1.8, 12);
  viz.text(`h(t)=${hNext.toFixed(2)}`, 704, 114, '#fff', 12, 'center');

  viz.text('forget gate preserves long-term memory', 166, 258, '#93c5fd', 11);
  viz.text('input gate decides how much new information is written', 286, 276, '#86efac', 11);
  viz.text('output gate controls how much memory becomes visible', 458, 294, '#fdba74', 11);

  byId('forgetGateVal').textContent = f.toFixed(2);
  byId('inputGateVal').textContent = i.toFixed(2);
  byId('outputGateVal').textContent = o.toFixed(2);
  byId('candidateGateVal').textContent = g.toFixed(2);
}

function renderLstmArchitecture() {
  const viz = lstmArchViz;
  viz.clear();
  viz.grid();
  viz.text('LSTM architecture: keep, write, and expose are separated on purpose', 34, 28, 'rgba(255,255,255,0.76)', 12);

  viz.rect(44, 234, 128, 64, 'rgba(255,255,255,0.03)', 'rgba(255,255,255,0.08)', 1.2, 12);
  viz.text('x(t)', 108, 258, '#cbd5e1', 11, 'center');
  viz.text('h(t-1)', 108, 278, '#cbd5e1', 11, 'center');

  viz.text('cell-state highway', 64, 70, '#93c5fd', 11);
  viz.text('c(t-1)', 64, 96, '#bfdbfe', 11);
  viz.arrow(64, 108, 188, 108, '#60a5fa', 2.4);

  viz.rect(186, 58, 76, 50, 'rgba(59,130,246,0.16)', '#60a5fa', 1.8, 12);
  viz.text('forget', 224, 80, '#dbeafe', 12, 'center');
  viz.text('f(t)', 224, 98, '#dbeafe', 11, 'center');
  viz.arrow(224, 108, 224, 132, '#93c5fd', 1.6);
  viz.circle(286, 108, 18, '#111827', '#cbd5e1', 1.8);
  viz.text('×', 286, 113, '#fff', 15, 'center');
  viz.arrow(188, 108, 268, 108, '#60a5fa', 2.2);
  viz.arrow(224, 108, 270, 108, '#93c5fd', 1.4);

  viz.rect(184, 164, 76, 50, 'rgba(74,222,128,0.16)', '#4ade80', 1.8, 12);
  viz.text('input', 222, 186, '#dcfce7', 12, 'center');
  viz.text('i(t)', 222, 204, '#dcfce7', 11, 'center');
  viz.rect(296, 164, 92, 50, 'rgba(56,189,248,0.14)', '#38bdf8', 1.8, 12);
  viz.text('candidate', 342, 186, '#dbeafe', 12, 'center');
  viz.text('c~(t)', 342, 204, '#dbeafe', 11, 'center');
  viz.circle(342, 134, 18, '#111827', '#cbd5e1', 1.8);
  viz.text('×', 342, 139, '#fff', 15, 'center');
  viz.arrow(222, 164, 328, 144, '#86efac', 1.6);
  viz.arrow(342, 164, 342, 152, '#38bdf8', 1.6);

  viz.circle(420, 108, 18, '#111827', '#cbd5e1', 1.8);
  viz.text('+', 420, 113, '#fff', 15, 'center');
  viz.arrow(304, 108, 402, 108, '#e2e8f0', 2.2);
  viz.arrow(352, 134, 410, 120, '#86efac', 1.6);
  viz.arrow(438, 108, 560, 108, '#60a5fa', 2.4);
  viz.text('c(t)', 488, 90, '#e2e8f0', 11);

  viz.rect(558, 58, 78, 50, 'rgba(251,146,60,0.16)', '#fb923c', 1.8, 12);
  viz.text('output', 597, 80, '#ffedd5', 12, 'center');
  viz.text('o(t)', 597, 98, '#ffedd5', 11, 'center');
  viz.rect(558, 146, 78, 42, 'rgba(255,255,255,0.04)', '#cbd5e1', 1.2, 12);
  viz.text('tanh', 597, 171, '#e2e8f0', 11, 'center');
  viz.circle(686, 126, 18, '#111827', '#cbd5e1', 1.8);
  viz.text('×', 686, 131, '#fff', 15, 'center');
  viz.arrow(560, 108, 668, 108, '#fdba74', 2.2);
  viz.arrow(597, 108, 670, 118, '#fdba74', 1.4);
  viz.arrow(560, 108, 597, 146, 'rgba(255,255,255,0.42)', 1.3);
  viz.arrow(636, 167, 670, 134, '#e2e8f0', 1.4);
  viz.arrow(704, 126, 814, 126, '#fdba74', 2.2);
  viz.rect(814, 100, 52, 52, '#7c2d12', '#fdba74', 1.8, 12);
  viz.text('h(t)', 840, 131, '#fff', 11, 'center');

  [224, 222, 342, 597].forEach((gateX, index) => {
    const gateY = index < 1 ? 58 : index === 1 ? 164 : index === 2 ? 164 : 58;
    viz.arrow(172, 248, gateX - (index === 2 ? 8 : 0), gateY + 25, 'rgba(255,255,255,0.32)', 1.3);
    viz.arrow(172, 284, gateX + (index === 0 ? 8 : 0), gateY + 25, 'rgba(255,255,255,0.32)', 1.3);
  });

  drawCallout(viz, 34, 314, 250, 32, 'keep path', ['forget gate preserves a near-linear memory highway'], {
    fill: 'rgba(59,130,246,0.12)',
    stroke: 'rgba(96,165,250,0.3)',
    titleColor: '#bfdbfe'
  });
  drawCallout(viz, 314, 314, 252, 32, 'write path', ['input gate scales fresh candidate writes'], {
    fill: 'rgba(74,222,128,0.10)',
    stroke: 'rgba(74,222,128,0.26)',
    titleColor: '#bbf7d0'
  });
  drawCallout(viz, 596, 314, 236, 32, 'expose path', ['output gate reveals memory as h(t)'], {
    fill: 'rgba(251,146,60,0.10)',
    stroke: 'rgba(251,146,60,0.24)',
    titleColor: '#fed7aa'
  });
}

function renderLstmTimeline() {
  const viz = lstmTimelineViz;
  viz.clear();
  viz.grid();
  const f = state.forgetGate;
  const i = state.inputGate;
  const o = state.outputGate;
  const g = state.candidateGate;
  const cells = [
    { cPrev: 0.70, cand: 0.25, f: 0.88, i: 0.20, o: 0.52 },
    { cPrev: 0.66, cand: 0.60, f, i, o, focus: true },
    { cPrev: 0.59, cand: -0.18, f: 0.62, i: 0.30, o: 0.74 }
  ];
  viz.text('LSTM over three timesteps: memory can persist while outputs change', 34, 28, 'rgba(255,255,255,0.76)', 12);
  cells.forEach((cell, idx) => {
    const x = 120 + idx * 250;
    const cNext = cell.f * cell.cPrev + cell.i * cell.cand;
    const hNext = cell.o * Math.tanh(cNext);
    viz.rect(x - 90, 72, 180, 160, cell.focus ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.03)', cell.focus ? '#34d399' : 'rgba(255,255,255,0.08)', cell.focus ? 1.8 : 1.2, 14);
    viz.text(`t = ${idx + 1}`, x, 98, cell.focus ? '#86efac' : '#e2e8f0', 12, 'center');
    viz.text(`c_prev = ${cell.cPrev.toFixed(2)}`, x, 124, '#93c5fd', 11, 'center');
    viz.text(`f*c_prev = ${(cell.f * cell.cPrev).toFixed(2)}`, x, 146, '#93c5fd', 11, 'center');
    viz.text(`i*cand = ${(cell.i * cell.cand).toFixed(2)}`, x, 168, '#86efac', 11, 'center');
    viz.text(`c_t = ${cNext.toFixed(2)}`, x, 190, '#e2e8f0', 11, 'center');
    viz.text(`h_t = ${hNext.toFixed(2)}`, x, 212, '#fdba74', 11, 'center');
    if (idx < cells.length - 1) viz.arrow(x + 92, 152, x + 158, 152, '#60a5fa', 2);
  });
  byId('lstmNumericBox').textContent =
    `c_prev = 0.82\nf = ${f.toFixed(2)}\ni = ${i.toFixed(2)}\nc_tilde = ${g.toFixed(2)}\n\nc_t = f * c_prev + i * c_tilde\n    = ${f.toFixed(2)} * 0.82 + ${i.toFixed(2)} * ${g.toFixed(2)}\n    = ${(f * 0.82).toFixed(3)} + ${(i * g).toFixed(3)}\n    = ${(f * 0.82 + i * g).toFixed(3)}\n\nh_t = o * tanh(c_t)\n    = ${o.toFixed(2)} * tanh(${(f * 0.82 + i * g).toFixed(3)})\n    = ${(o * Math.tanh(f * 0.82 + i * g)).toFixed(3)}`;
}

function renderGru() {
  const viz = gruViz;
  viz.clear();
  viz.grid();
  const z = state.updateGate;
  const r = state.resetGate;
  const hPrev = 0.74;
  const hc = state.gruCandidate;
  const effectiveCandidate = Math.tanh(hc + 0.8 * r - 0.3);
  const hNext = (1 - z) * hPrev + z * effectiveCandidate;

  viz.text('GRU cell: merge memory update into a single hidden state', 34, 26, 'rgba(255,255,255,0.76)', 12);
  viz.rect(76, 82, 108, 60, `rgba(96,165,250,${0.18 + (1 - z) * 0.55})`, '#60a5fa', 1.8, 12);
  viz.text(`keep old ${(1 - z).toFixed(2)}`, 130, 117, '#dbeafe', 12, 'center');
  viz.rect(232, 82, 110, 60, `rgba(74,222,128,${0.18 + z * 0.55})`, '#4ade80', 1.8, 12);
  viz.text(`write new ${z.toFixed(2)}`, 287, 117, '#dcfce7', 12, 'center');
  viz.rect(390, 82, 138, 60, `rgba(244,114,182,${0.14 + r * 0.55})`, '#f472b6', 1.8, 12);
  viz.text(`reset ${r.toFixed(2)}`, 459, 108, '#fdf2f8', 12, 'center');
  viz.text(`cand ${effectiveCandidate.toFixed(2)}`, 459, 124, '#fdf2f8', 11, 'center');
  viz.rect(594, 82, 142, 60, '#7c2d12', '#fb923c', 1.8, 12);
  viz.text(`h(t)=${hNext.toFixed(2)}`, 665, 117, '#fff', 12, 'center');

  viz.arrow(42, 112, 76, 112, '#93c5fd', 2.1);
  viz.arrow(184, 112, 232, 112, '#e2e8f0', 2.1);
  viz.arrow(342, 112, 390, 112, '#e2e8f0', 2.1);
  viz.arrow(528, 112, 594, 112, '#fdba74', 2.1);

  viz.text('update gate interpolates between old and candidate state', 76, 220, '#cbd5e1', 11);
  viz.text('reset gate decides how strongly the old state enters candidate computation', 76, 242, '#cbd5e1', 11);

  byId('updateGateVal').textContent = z.toFixed(2);
  byId('resetGateVal').textContent = r.toFixed(2);
  byId('gruCandidateVal').textContent = hc.toFixed(2);
}

function renderGruArchitecture() {
  const viz = gruArchViz;
  viz.clear();
  viz.grid();
  viz.text('GRU architecture: candidate proposal + gated interpolation', 34, 28, 'rgba(255,255,255,0.76)', 12);

  viz.rect(52, 82, 120, 54, 'rgba(96,165,250,0.18)', '#60a5fa', 1.8, 12);
  viz.text('h(t-1)', 112, 115, '#dbeafe', 12, 'center');
  viz.rect(52, 212, 120, 54, 'rgba(255,255,255,0.03)', 'rgba(255,255,255,0.08)', 1.2, 12);
  viz.text('x(t)', 112, 244, '#cbd5e1', 12, 'center');

  viz.rect(236, 60, 92, 54, 'rgba(244,114,182,0.16)', '#f472b6', 1.8, 12);
  viz.text('reset', 282, 84, '#fdf2f8', 12, 'center');
  viz.text('r(t)', 282, 102, '#fdf2f8', 11, 'center');
  viz.rect(236, 144, 92, 54, 'rgba(74,222,128,0.16)', '#4ade80', 1.8, 12);
  viz.text('update', 282, 168, '#dcfce7', 12, 'center');
  viz.text('z(t)', 282, 186, '#dcfce7', 11, 'center');
  viz.arrow(172, 109, 236, 87, '#93c5fd', 1.8);
  viz.arrow(172, 109, 236, 171, '#93c5fd', 1.8);
  viz.arrow(172, 239, 236, 88, 'rgba(255,255,255,0.34)', 1.4);
  viz.arrow(172, 239, 236, 171, 'rgba(255,255,255,0.34)', 1.4);

  viz.circle(384, 108, 18, '#111827', '#cbd5e1', 1.8);
  viz.text('×', 384, 113, '#fff', 15, 'center');
  viz.arrow(328, 87, 366, 103, '#f9a8d4', 1.6);
  viz.arrow(172, 109, 366, 109, '#93c5fd', 1.6);

  viz.rect(432, 78, 136, 60, 'rgba(244,114,182,0.12)', '#f472b6', 1.8, 12);
  viz.text('candidate state', 500, 103, '#fdf2f8', 12, 'center');
  viz.text('h~(t)', 500, 122, '#fdf2f8', 11, 'center');
  viz.arrow(402, 108, 432, 108, '#f9a8d4', 1.8);
  viz.arrow(172, 239, 432, 128, 'rgba(255,255,255,0.34)', 1.4);

  viz.circle(640, 142, 22, '#111827', '#cbd5e1', 1.8);
  viz.text('mix', 640, 146, '#fff', 10, 'center');
  viz.arrow(568, 108, 620, 132, '#f9a8d4', 1.8);
  viz.arrow(328, 171, 618, 150, '#86efac', 1.8);
  viz.arrow(172, 109, 620, 160, '#93c5fd', 1.5);

  viz.rect(718, 116, 118, 52, '#166534', '#4ade80', 1.8, 12);
  viz.text('h(t)', 777, 147, '#fff', 12, 'center');
  viz.arrow(662, 142, 718, 142, '#fdba74', 2.1);

  drawCallout(viz, 36, 292, 244, 32, 'reset gate', ['scales how much h(t-1) shapes the candidate'], {
    fill: 'rgba(244,114,182,0.10)',
    stroke: 'rgba(244,114,182,0.24)',
    titleColor: '#fbcfe8'
  });
  drawCallout(viz, 304, 292, 250, 32, 'update gate', ['mixes keep-old and write-new behavior'], {
    fill: 'rgba(74,222,128,0.10)',
    stroke: 'rgba(74,222,128,0.24)',
    titleColor: '#bbf7d0'
  });
  drawCallout(viz, 580, 292, 256, 32, 'interpretation', ['GRU = learned smoother for keep vs rewrite'], {
    fill: 'rgba(15,23,42,0.36)',
    stroke: 'rgba(148,163,184,0.22)'
  });
}

function renderGruTimeline() {
  const viz = gruTimelineViz;
  viz.clear();
  viz.grid();
  const z = state.updateGate;
  const r = state.resetGate;
  const hc = state.gruCandidate;
  const steps = [
    { hPrev: 0.72, z: 0.22, r: 0.78, cand: 0.20 },
    { hPrev: 0.74, z, r, cand: hc, focus: true },
    { hPrev: 0.48, z: 0.78, r: 0.18, cand: -0.10 }
  ];
  viz.text('GRU over three timesteps: interpolation between old state and candidate', 34, 28, 'rgba(255,255,255,0.76)', 12);
  steps.forEach((step, idx) => {
    const x = 140 + idx * 240;
    const hCand = Math.tanh(step.cand + 0.8 * step.r - 0.3);
    const hNext = (1 - step.z) * step.hPrev + step.z * hCand;
    viz.rect(x - 88, 74, 176, 150, step.focus ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.03)', step.focus ? '#34d399' : 'rgba(255,255,255,0.08)', step.focus ? 1.8 : 1.2, 14);
    viz.text(`t = ${idx + 1}`, x, 98, step.focus ? '#86efac' : '#e2e8f0', 12, 'center');
    viz.text(`keep old = ${((1 - step.z) * step.hPrev).toFixed(2)}`, x, 126, '#93c5fd', 11, 'center');
    viz.text(`write new = ${(step.z * hCand).toFixed(2)}`, x, 148, '#86efac', 11, 'center');
    viz.text(`candidate = ${hCand.toFixed(2)}`, x, 170, '#f9a8d4', 11, 'center');
    viz.text(`h_t = ${hNext.toFixed(2)}`, x, 196, '#fdba74', 11, 'center');
    if (idx < steps.length - 1) viz.arrow(x + 90, 148, x + 150, 148, '#60a5fa', 2);
  });
  const hCand = Math.tanh(hc + 0.8 * r - 0.3);
  const hNext = (1 - z) * 0.74 + z * hCand;
  byId('gruNumericBox').textContent =
    `h_prev = 0.74\nz = ${z.toFixed(2)}\nr = ${r.toFixed(2)}\nraw candidate input = ${hc.toFixed(2)}\n\nh_tilde = tanh(${hc.toFixed(2)} + 0.8*${r.toFixed(2)} - 0.3)\n        = ${hCand.toFixed(3)}\n\nh_t = (1-z) * h_prev + z * h_tilde\n    = ${(1 - z).toFixed(2)} * 0.74 + ${z.toFixed(2)} * ${hCand.toFixed(3)}\n    = ${((1 - z) * 0.74).toFixed(3)} + ${(z * hCand).toFixed(3)}\n    = ${hNext.toFixed(3)}`;
}

function renderSelfAttentionSub() {
  const viz = selfAttentionSubViz;
  viz.clear();
  viz.grid();
  viz.text('self-attention matrix: one active row decides where to read', 34, 28, 'rgba(255,255,255,0.76)', 12);

  const query = clamp(state.attentionQuery, 0, 15);
  const visible = visibleAttentionWindow(query, 16, 8);
  const activeRow = visible.indexOf(query);
  const left = 116;
  const top = 84;
  const cell = 24;
  const matrixRight = left + visible.length * cell;
  const weights = attentionWeights(query, state.attentionTemp, state.attentionMode);
  const visibleWeights = visible.map(index => weights[index]);
  const topMatches = topWeightEntries(visibleWeights, visible[0], 3);
  const massTop3 = topMatches.reduce((sum, item) => sum + item.weight, 0);

  viz.text('keys / source positions', left + (visible.length * cell) / 2, 52, '#cbd5e1', 10, 'center');
  viz.text('query rows', 52, top + (visible.length * cell) / 2, '#cbd5e1', 10);

  visible.forEach((index, localIndex) => {
    const cx = left + localIndex * cell + cell / 2;
    drawAttentionToken(
      viz,
      cx,
      top - 24,
      `x${index + 1}`,
      index === query ? '#14532d' : '#1e3a5f',
      index === query ? '#4ade80' : '#60a5fa',
      index === query
    );
    viz.text(`x${index + 1}`, left - 34, top + localIndex * cell + 16, localIndex === activeRow ? '#86efac' : 'rgba(255,255,255,0.72)', 10);
  });

  visible.forEach((rowIndex, r) => {
    const rowWeights = attentionWeights(rowIndex, state.attentionTemp, state.attentionMode);
    visible.forEach((colIndex, c) => {
      const x = left + c * cell;
      const y = top + r * cell;
      const weight = rowWeights[colIndex];
      const isTopMatch = rowIndex === query && topMatches.some(item => item.index === colIndex);
      viz.rect(
        x,
        y,
        cell - 3,
        cell - 3,
        `rgba(96,165,250,${0.12 + weight * 3.1})`,
        rowIndex === query
          ? isTopMatch
            ? '#fbbf24'
            : 'rgba(52,211,153,0.9)'
          : 'rgba(255,255,255,0.06)',
        rowIndex === query ? (isTopMatch ? 1.8 : 1.4) : 1,
        5
      );
      if (rowIndex === query && c === activeRow) {
        viz.rect(x - 2, y - 2, cell + 1, cell + 1, null, 'rgba(255,255,255,0.42)', 1.1, 6);
      }
    });
  });

  const rowY = top + activeRow * cell + (cell - 3) / 2;
  viz.line(left - 10, rowY, matrixRight + 10, rowY, 'rgba(52,211,153,0.75)', 1.8, [5, 4]);
  viz.arrow(matrixRight + 10, rowY, 428, 108, 'rgba(52,211,153,0.75)', 1.6, [5, 4]);

  topMatches.forEach((item, rank) => {
    const localIndex = visible.indexOf(item.index);
    const x = left + localIndex * cell + cell / 2;
    viz.arrow(x, top - 8, 474 + rank * 52, 230, 'rgba(251,191,36,0.65)', 1.2, [4, 4]);
  });

  drawCallout(
    viz,
    438,
    76,
    392,
    58,
    'Active Query Row',
    [
      `query = x${query + 1}; one row of A is one retrieval decision`,
      `top reads = ${topMatches.map(item => `x${item.index + 1} (${item.weight.toFixed(2)})`).join(', ')}`,
      `mass on top-3 = ${massTop3.toFixed(2)}`
    ],
    {
      fill: 'rgba(15,23,42,0.44)',
      stroke: 'rgba(52,211,153,0.28)',
      titleColor: '#d1fae5'
    }
  );

  drawCallout(
    viz,
    438,
    152,
    392,
    64,
    state.attentionMode === 'global' ? 'Global Read Pattern' : 'Local Read Pattern',
    [
      state.attentionMode === 'global'
        ? 'distant seasonal or motif matches can receive large weight in a single hop'
        : 'the distribution is biased toward nearby positions, so the row behaves more like a soft local neighborhood',
      'context = sum_i alpha_i v_i, so the row becomes a weighted average over value vectors'
    ],
    {
      fill: 'rgba(15,23,42,0.44)',
      stroke: 'rgba(148,163,184,0.24)'
    }
  );

  drawCallout(
    viz,
    438,
    226,
    392,
    36,
    'Teaching Lens',
    ['understanding one row well makes the full attention matrix feel much less mysterious'],
    {
      fill: 'rgba(59,130,246,0.12)',
      stroke: 'rgba(96,165,250,0.22)',
      titleColor: '#bfdbfe'
    }
  );
}

function renderAttentionStepWidget() {
  const viz = attentionStepViz;
  viz.clear();
  viz.grid();

  const token = state.attentionWalkToken;
  const step = state.attentionWalkStep;
  const labels = ['1. choose query token', '2. project to Q, K, V', '3. compute q·k scores', '4. apply softmax', '5. weighted sum of V'];
  const left = 70;
  const yToken = 88;
  const spacing = 82;
  const positions = Array.from({ length: 8 }, (_, i) => left + i * spacing);
  const baseVecs = Array.from({ length: 8 }, (_, i) => ({
    q: [0.4 + 0.1 * Math.sin(i), 0.3 + 0.08 * Math.cos(i * 0.7)],
    k: [0.45 + 0.1 * Math.cos(i * 0.8), 0.25 + 0.09 * Math.sin(i * 0.55)],
    v: [0.3 + 0.12 * Math.sin(i * 0.45 + 0.7), 0.45 + 0.09 * Math.cos(i * 0.6)]
  }));
  const q = baseVecs[token - 2].q;
  const rawScores = baseVecs.map(v => q[0] * v.k[0] + q[1] * v.k[1]);
  const maxScore = Math.max(...rawScores);
  const expScores = rawScores.map(s => Math.exp((s - maxScore) / 0.22));
  const total = expScores.reduce((a, b) => a + b, 0);
  const weights = expScores.map(s => s / total);
  const context = baseVecs.reduce((acc, v, i) => [acc[0] + weights[i] * v.v[0], acc[1] + weights[i] * v.v[1]], [0, 0]);
  const topMatches = topWeightEntries(weights, 2, 3);
  const panelX = viz.W - 208;

  viz.text('step-by-step self-attention walkthrough', 34, 28, 'rgba(255,255,255,0.78)', 12);
  viz.rect(34, 42, viz.W - 68, 32, 'rgba(15,23,42,0.46)', 'rgba(148,163,184,0.28)', 1.2, 10);
  viz.text(labels[step], 50, 63, '#e2e8f0', 11);

  positions.forEach((x, i) => {
    const active = i === token - 2;
    drawAttentionToken(viz, x, yToken, `x${i + 2}`, active ? '#14532d' : '#1e3a5f', active ? '#4ade80' : '#60a5fa', active);
  });

  if (step >= 1) {
    viz.text('Q', 40, 148, '#34d399', 11);
    viz.text('K', 40, 192, '#93c5fd', 11);
    viz.text('V', 40, 236, '#f9a8d4', 11);
    positions.forEach((x, i) => {
      const active = i === token - 2;
      const qv = baseVecs[i].q;
      const kv = baseVecs[i].k;
      const vv = baseVecs[i].v;
      viz.rect(x - 26, 132, 52, 24, active ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.04)', active ? '#34d399' : null, active ? 1.4 : 0, 7);
      viz.text(`[${qv[0].toFixed(2)},${qv[1].toFixed(2)}]`, x, 149, active ? '#ecfdf5' : 'rgba(255,255,255,0.72)', 9, 'center');
      viz.rect(x - 26, 176, 52, 24, 'rgba(96,165,250,0.12)', null, 0, 7);
      viz.text(`[${kv[0].toFixed(2)},${kv[1].toFixed(2)}]`, x, 193, 'rgba(255,255,255,0.72)', 9, 'center');
      viz.rect(x - 26, 220, 52, 24, 'rgba(244,114,182,0.12)', null, 0, 7);
      viz.text(`[${vv[0].toFixed(2)},${vv[1].toFixed(2)}]`, x, 237, 'rgba(255,255,255,0.72)', 9, 'center');
    });
  }

  if (step >= 2) {
    viz.text('scores q·k', 40, 286, '#f59e0b', 11);
    positions.forEach((x, i) => {
      const isTopMatch = topMatches.some(item => item.index === i + 2);
      viz.rect(
        x - 22,
        270,
        44,
        24,
        i === token - 2 ? 'rgba(52,211,153,0.22)' : 'rgba(245,158,11,0.14)',
        i === token - 2 ? '#34d399' : isTopMatch ? '#fbbf24' : null,
        i === token - 2 ? 1.2 : isTopMatch ? 1.1 : 0,
        7
      );
      viz.text(rawScores[i].toFixed(2), x, 287, 'rgba(255,255,255,0.78)', 10, 'center');
    });
  }

  if (step >= 3) {
    viz.text('softmax weights', 40, 324, '#fbbf24', 11);
    positions.forEach((x, i) => {
      const h = 38 * weights[i] + 4;
      const isTopMatch = topMatches.some(item => item.index === i + 2);
      viz.rect(x - 12, 346 - h, 24, h, 'rgba(245,158,11,0.82)', isTopMatch ? '#fde68a' : null, isTopMatch ? 1.1 : 0, 5);
      viz.text(weights[i].toFixed(2), x, 358, 'rgba(255,255,255,0.66)', 9, 'center');
    });
  }

  if (step >= 4) {
    viz.rect(viz.W - 206, 132, 154, 112, 'rgba(16,185,129,0.14)', '#34d399', 1.4, 10);
    viz.text('context vector', viz.W - 129, 158, '#d1fae5', 11, 'center');
    viz.text(`= Σ α_i V_i`, viz.W - 129, 182, '#d1fae5', 11, 'center');
    viz.text(`[${context[0].toFixed(2)}, ${context[1].toFixed(2)}]`, viz.W - 129, 208, '#ecfdf5', 11, 'center');
    viz.text('weighted combination', viz.W - 129, 228, 'rgba(255,255,255,0.72)', 10, 'center');
  }

  drawCallout(
    viz,
    panelX,
    96,
    174,
    62,
    'Active Query',
    [
      `token = x${token}`,
      `Q = ${vectorText(q)}`,
      step >= 1 ? 'the query is the retrieval request for this row' : 'choose one token to inspect first'
    ],
    {
      fill: 'rgba(15,23,42,0.44)',
      stroke: 'rgba(52,211,153,0.28)',
      titleColor: '#d1fae5'
    }
  );

  drawCallout(
    viz,
    panelX,
    174,
    174,
    76,
    step < 2 ? 'Projection Stage' : step < 4 ? 'Scoring Stage' : 'Context Stage',
    step < 2
      ? [
          'linear projections create Q, K, and V views',
          'Q asks, K advertises, V carries the returned content'
        ]
      : step < 4
        ? [
            `top weights -> ${topMatches.map(item => `x${item.index}:${item.weight.toFixed(2)}`).join(', ')}`,
            'softmax turns raw compatibility into a probability-like distribution'
          ]
        : [
            `context = ${vectorText(context)}`,
            `top contributors = ${topMatches.map(item => `x${item.index}`).join(', ')}`
          ],
    {
      fill: 'rgba(15,23,42,0.44)',
      stroke: 'rgba(148,163,184,0.24)'
    }
  );

  drawCallout(
    viz,
    panelX,
    266,
    174,
    56,
    'Formula',
    step < 2
      ? ['Q = XW_Q,   K = XW_K,   V = XW_V']
      : step < 4
        ? ['score_i = q^T k_i / sqrt(d_k)', 'alpha_i = softmax(score_i)']
        : ['z = sum_i alpha_i v_i', 'attention output is a weighted sum of values'],
    {
      fill: 'rgba(59,130,246,0.12)',
      stroke: 'rgba(96,165,250,0.22)',
      titleColor: '#bfdbfe'
    }
  );

  byId('attentionWalkTokenVal').textContent = String(token);
}

function attentionLabData(mode, activeQuery) {
  const sourceCount = 8;
  const queryCount = mode === 'self' ? 8 : 5;
  const source = Array.from({ length: sourceCount }, (_, i) => ({
    label: mode === 'self' ? `x${i + 1}` : `e${i + 1}`,
    q: [0.18 + 0.05 * i, 0.34 + 0.04 * Math.sin(i)],
    k: [0.26 + 0.04 * Math.cos(i * 0.8), 0.16 + 0.05 * Math.sin(i * 0.55)],
    v: [0.22 + 0.05 * Math.sin(i * 0.5 + 0.8), 0.36 + 0.04 * Math.cos(i * 0.65)]
  }));
  const queries = Array.from({ length: queryCount }, (_, i) => ({
    label: mode === 'self' ? `x${i + 1}` : `d${i + 1}`,
    q: mode === 'self'
      ? source[i].q
      : [0.28 + 0.06 * Math.sin(i * 0.9 + 0.5), 0.24 + 0.05 * Math.cos(i * 0.7 + 0.3)]
  }));
  const q = queries[activeQuery - 1].q;
  const scores = source.map(s => q[0] * s.k[0] + q[1] * s.k[1]);
  const maxScore = Math.max(...scores);
  const exps = scores.map(s => Math.exp((s - maxScore) / 0.24));
  const total = exps.reduce((a, b) => a + b, 0);
  const weights = exps.map(v => v / total);
  const context = source.reduce((acc, s, i) => [acc[0] + weights[i] * s.v[0], acc[1] + weights[i] * s.v[1]], [0, 0]);
  return { source, queries, scores, weights, context };
}

function vectorText(v) {
  return `[${v[0].toFixed(2)}, ${v[1].toFixed(2)}]`;
}

function topWeightEntries(weights, offset = 0, count = 3) {
  return weights
    .map((weight, index) => ({ weight, index: index + offset }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, count);
}

function visibleAttentionWindow(query, total = 16, count = 8) {
  const start = clamp(query - Math.floor(count / 2), 0, total - count);
  return Array.from({ length: count }, (_, index) => start + index);
}

function renderSeq2SeqForecastLab() {
  const data = seq2seqLabData();
  const phase = state.seq2seqLabPhase;
  const activeStep = clamp(state.seq2seqLabStep, 1, data.steps.length);
  state.seq2seqLabStep = activeStep;
  byId('seq2seqLabStep').max = String(data.steps.length);
  byId('seq2seqLabStep').value = String(activeStep);
  byId('seq2seqLabStepVal').textContent = String(activeStep);

  const phaseLabels = ['Observe history', 'Encode states', 'Choose decoder input', 'Build context', 'Emit forecast'];
  const flow = byId('seq2seqLabFlow');
  const progress = byId('seq2seqLabProgress');
  const encoderRow = byId('seq2seqLabEncoderRow');
  const decoderRow = byId('seq2seqLabDecoderRow');
  const weightsRow = byId('seq2seqLabWeights');
  const detailTitle = byId('seq2seqLabDetailTitle');
  const detailText = byId('seq2seqLabDetailText');
  const math = byId('seq2seqLabMath');
  const output = byId('seq2seqLabOutput');

  flow.innerHTML = '';
  phaseLabels.forEach((label, index) => {
    const el = document.createElement('div');
    el.className = `attention-lab-step${index === phase ? ' active' : ''}`;
    el.textContent = label;
    flow.appendChild(el);
  });
  progress.style.width = `${((activeStep - 1) / Math.max(1, data.steps.length - 1)) * 100}%`;

  setGridColumns(encoderRow, data.history.length);
  encoderRow.innerHTML = '';
  const active = data.steps[activeStep - 1];
  data.history.forEach((value, index) => {
    const card = document.createElement('div');
    const weight = active.weights[index];
    const isActive = phase >= 3 && state.seq2seqLabMemory === 'attention' && weight > 0.14;
    card.className = `seq2seq-card${isActive ? ' active' : ''}`;
    card.innerHTML = `<strong>x${index + 1} = ${value}</strong><small>${phase >= 1 ? `h_enc = ${vectorText(data.encoderStates[index])}` : 'raw observed history'}${phase >= 3 && state.seq2seqLabMemory === 'attention' ? `\nalpha = ${weight.toFixed(2)}` : ''}</small>`;
    encoderRow.appendChild(card);
  });

  setGridColumns(decoderRow, data.steps.length);
  decoderRow.innerHTML = '';
  data.steps.forEach((stepData, index) => {
    const card = document.createElement('div');
    card.className = `seq2seq-card${index + 1 === activeStep ? ' active' : ''}`;
    card.innerHTML = `<strong>h = ${stepData.step}</strong><small>${phase >= 2 ? `${state.seq2seqLabMode === 'teacher' ? 'decoder input y_(h-1)' : 'decoder input yhat_(h-1)'} = ${stepData.input}` : 'future step placeholder'}${phase >= 3 ? `\ncontext = ${vectorText(stepData.context)}` : ''}${phase >= 4 ? `\nyhat = ${stepData.prediction}` : ''}</small>`;
    decoderRow.appendChild(card);
  });

  setGridColumns(weightsRow, data.history.length);
  weightsRow.innerHTML = '';
  data.history.forEach((_, index) => {
    const cell = document.createElement('div');
    const alpha = state.seq2seqLabMemory === 'attention' && phase >= 3 ? active.weights[index] : 1 / data.history.length;
    cell.className = 'seq2seq-weight-cell';
    cell.innerHTML = `<strong>e${index + 1}</strong><div class="seq2seq-weight-bar"><span style="height:${Math.round(52 * alpha + 4)}px"></span></div><small>${state.seq2seqLabMemory === 'attention' ? `alpha = ${active.weights[index].toFixed(2)}` : 'shared fixed context'}</small>`;
    weightsRow.appendChild(cell);
  });

  const stageMessages = [
    {
      title: 'Observe the input history',
      text: 'The encoder first receives the full observed window. In forecasting, this is the past we are allowed to condition on before predicting any future values.'
    },
    {
      title: 'Encode the history into memory states',
      text: 'Each encoder timestep becomes a hidden state. These states are the memory bank the decoder can later reuse, either through one fixed context vector or through cross-attention.'
    },
    {
      title: 'Choose the decoder input for the active step',
      text: state.seq2seqLabMode === 'teacher'
        ? 'Teacher forcing feeds the true previous target during training, which stabilizes optimization but creates a train-test mismatch later.'
        : 'Autoregressive inference feeds the model’s own previous prediction, so errors can accumulate as the horizon grows.'
    },
    {
      title: 'Build the context for this forecast step',
      text: state.seq2seqLabMemory === 'attention'
        ? 'Cross-attention lets this decoder step form its own weighted context over encoder memory. Different horizons can attend to different parts of the history.'
        : 'A fixed context design compresses all history into one vector. It is simpler, but every future step must rely on the same summary.'
    },
    {
      title: 'Emit the forecast for the active horizon step',
      text: 'The decoder combines its current recurrent state, the chosen input, and the context vector to produce the next forecast. Repeating this process unfolds the whole horizon.'
    }
  ];

  detailTitle.textContent = stageMessages[phase].title;
  detailText.textContent = stageMessages[phase].text;
  math.textContent = state.seq2seqLabMemory === 'attention'
    ? `s_h = f_dec(y_(h-1), s_(h-1), c_h)\nalpha_(h,t) = softmax(score(s_(h-1), h_t^enc))\nc_h = sum_t alpha_(h,t) h_t^enc\nactive c_${activeStep} = ${vectorText(active.context)}`
    : `s_h = f_dec(y_(h-1), s_(h-1), c)\nshared c = ${vectorText(data.fixedContext)}\nall decoder steps reuse the same compressed summary`;
  output.textContent =
    `active forecast step = ${activeStep}\nmode = ${state.seq2seqLabMode === 'teacher' ? 'teacher forcing' : 'autoregressive inference'}\nmemory = ${state.seq2seqLabMemory === 'attention' ? 'cross-attention over encoder states' : 'single fixed context'}\ncurrent decoder input = ${active.input}\npredicted yhat_${activeStep} = ${active.prediction}\nreference target y_${activeStep} = ${active.truth}`;
}

function renderQkvLab() {
  const mode = state.qkvLabMode;
  const maxQuery = mode === 'self' ? semanticSourceBlueprint.length : semanticDecoderBlueprint.length;
  state.qkvLabQuery = clamp(state.qkvLabQuery, 1, maxQuery);
  byId('qkvLabQuery').max = String(maxQuery);
  byId('qkvLabQuery').value = String(state.qkvLabQuery);
  byId('qkvLabQueryVal').textContent = String(state.qkvLabQuery);

  const data = semanticAttentionData(mode, state.qkvLabQuery);
  const sourceRow = byId('qkvLabSourceRow');
  const queryRow = byId('qkvLabQueryRow');
  const scoresRow = byId('qkvLabScores');
  const topMatch = data.weights
    .map((weight, index) => ({ weight, index }))
    .sort((a, b) => b.weight - a.weight)[0];
  const activeQuery = data.queries[state.qkvLabQuery - 1];
  const matchedSource = data.source[topMatch.index];

  byId('qkvLabSourceTitle').textContent = mode === 'self' ? 'Source positions (same sequence supplies K and V)' : 'Encoder memory bank (supplies K and V)';
  byId('qkvLabQueryTitle').textContent = mode === 'self' ? 'Query positions (same sequence supplies Q)' : 'Decoder-side queries';

  setGridColumns(sourceRow, data.source.length);
  sourceRow.innerHTML = '';
  data.source.forEach((token, index) => {
    const card = document.createElement('div');
    card.className = `attention-token-card${index === topMatch.index ? ' active' : ''}`;
    card.innerHTML = `<span>${token.label}</span><small>${token.name}</small>`;
    sourceRow.appendChild(card);
  });

  setGridColumns(queryRow, data.queries.length);
  queryRow.innerHTML = '';
  data.queries.forEach((token, index) => {
    const card = document.createElement('div');
    card.className = `attention-query-card${index === state.qkvLabQuery - 1 ? ' active' : ''}`;
    card.innerHTML = `<span>${token.label}</span><small>${token.name}</small>`;
    queryRow.appendChild(card);
  });

  setGridColumns(scoresRow, data.source.length);
  scoresRow.innerHTML = '';
  data.source.forEach((token, index) => {
    const card = document.createElement('div');
    card.className = `score-card${index === topMatch.index ? ' active' : ''}`;
    card.innerHTML = `<strong>${token.label}</strong><small>${describePattern(token.raw)}</small><div class="score-bar"><span style="height:${Math.round(data.weights[index] * 44 + 4)}px"></span></div><small>score = ${data.scores[index].toFixed(2)}\nalpha = ${data.weights[index].toFixed(2)}</small>`;
    scoresRow.appendChild(card);
  });

  byId('qkvLabQ').textContent =
    `${mode === 'self' ? 'q_t = W_Q x_t' : 'q_h = W_Q s_h'}\nactive ${activeQuery.label} = ${vectorText(activeQuery.q)}\nrole: retrieval request\nmeaning: “find source positions that look like ${describePattern(activeQuery.raw)}”`;
  byId('qkvLabK').textContent =
    `k_i = W_K source_i\nmatched ${matchedSource.label} = ${vectorText(matchedSource.k)}\nrole: address / index tag\nmeaning: each source advertises whether it matches the query`;
  byId('qkvLabV').textContent =
    `v_i = W_V source_i\nmatched ${matchedSource.label} = ${vectorText(matchedSource.v)}\nrole: payload\nmeaning: if selected, this content is what flows into the context`;
  byId('qkvLabDetailTitle').textContent = mode === 'self' ? 'One sequence playing three roles' : 'Decoder queries, encoder keys and values';
  byId('qkvLabDetailText').textContent = mode === 'self'
    ? 'In self-attention, the same sequence is projected three different ways. The active token creates a query, all tokens advertise keys, and all tokens carry values. High attention means “this source key matches what the active query wants.”'
    : 'In cross-attention, the decoder does not search inside itself. It creates a query from its current state and compares that query against encoder keys. The values then carry the actual encoded information back to the decoder.';
  byId('qkvLabSummary').textContent =
    `top match = ${matchedSource.label} (${matchedSource.name})\nits key best matches the active query, so its value contributes strongly to the context\nfinal context = ${vectorText(data.context)}\n\nQuery asks the question.\nKey decides who matches.\nValue carries what gets returned.`;
}

function renderScoreLab() {
  const method = state.scoreLabMethod;
  const data = scoreMethodData(method, state.scoreLabQuery, state.scoreLabTemp);
  const sourceRow = byId('scoreLabSourceRow');
  const queryRow = byId('scoreLabQueryRow');
  const scoresRow = byId('scoreLabScores');
  const topMatch = data.weights
    .map((weight, index) => ({ weight, index }))
    .sort((a, b) => b.weight - a.weight)[0];
  const bestToken = data.source[topMatch.index];

  setGridColumns(sourceRow, data.source.length);
  sourceRow.innerHTML = '';
  data.source.forEach((token, index) => {
    const card = document.createElement('div');
    card.className = `attention-token-card${index === topMatch.index ? ' active' : ''}`;
    card.innerHTML = `<span>${token.label}</span><small>${token.name}</small>`;
    sourceRow.appendChild(card);
  });

  setGridColumns(queryRow, data.queries.length);
  queryRow.innerHTML = '';
  data.queries.forEach((token, index) => {
    const card = document.createElement('div');
    card.className = `attention-query-card${index === state.scoreLabQuery - 1 ? ' active' : ''}`;
    card.innerHTML = `<span>${token.label}</span><small>${token.name}</small>`;
    queryRow.appendChild(card);
  });

  setGridColumns(scoresRow, data.source.length);
  scoresRow.innerHTML = '';
  data.source.forEach((token, index) => {
    const card = document.createElement('div');
    card.className = `score-card${index === topMatch.index ? ' active' : ''}`;
    card.innerHTML = `<strong>${token.label}</strong><small>${token.name}</small><div class="score-bar"><span style="height:${Math.round(data.weights[index] * 44 + 4)}px"></span></div><small>score = ${data.scores[index].toFixed(2)}\nalpha = ${data.weights[index].toFixed(2)}</small>`;
    scoresRow.appendChild(card);
  });

  byId('scoreLabQueryVal').textContent = String(state.scoreLabQuery);
  byId('scoreLabTempVal').textContent = state.scoreLabTemp.toFixed(2);

  const formulaMap = {
    dot: 'scaled dot / Luong-dot family\nscore(q, k) = q^T k / sqrt(d_k)\nfast, simple, and natural when query and key already live in comparable spaces',
    bahdanau: 'Bahdanau additive attention\nscore(s_(h-1), h_t) = v_a^T tanh(W_s s_(h-1) + W_h h_t)\nflexible because a small learned MLP builds compatibility before the final score',
    luong: 'Luong general attention\nscore(s_h, h_t) = s_h^T W_a h_t\nstill multiplicative, but with a learned bilinear map between query and key spaces'
  };
  const detailMap = {
    dot: 'Scaled dot-product attention is the simplest scorer. It is efficient and works best when learned projections have already placed queries and keys in compatible coordinate systems.',
    bahdanau: 'Bahdanau attention is additive: it first mixes the query and memory with a learned nonlinear layer, then scores the result. This was especially influential in early encoder-decoder RNNs.',
    luong: 'Luong general attention stays multiplicative, but introduces a learned matrix W_a so the decoder state can compare itself with encoder memory through a trainable bilinear form.'
  };

  byId('scoreLabFormula').textContent = formulaMap[method];
  byId('scoreLabDetailTitle').textContent = `${method === 'dot' ? 'Scaled dot-product' : method === 'bahdanau' ? 'Bahdanau additive' : 'Luong general'} intuition`;
  byId('scoreLabDetailText').textContent = detailMap[method];

  let breakdown;
  if (method === 'bahdanau') {
    const wq = matVecMul(data.params.Wq, data.query.raw);
    const wk = matVecMul(data.params.Wk, bestToken.raw);
    const hidden = tanhVec(vecAdd(wq, wk));
    breakdown =
      `best source = ${bestToken.label}\nW_q q = ${vectorText(wq)}\nW_k h = ${vectorText(wk)}\ntanh(sum) = ${vectorText(hidden)}\nv_a^T tanh(.) = ${data.scores[topMatch.index].toFixed(3)}`;
  } else if (method === 'luong') {
    const projected = matVecMul(data.params.Wa, bestToken.raw);
    breakdown =
      `best source = ${bestToken.label}\nW_a h = ${vectorText(projected)}\nq = ${vectorText(data.query.raw)}\nq^T (W_a h) = ${data.scores[topMatch.index].toFixed(3)}`;
  } else {
    breakdown =
      `best source = ${bestToken.label}\nq = ${vectorText(data.query.q)}\nk = ${vectorText(bestToken.k)}\n(q^T k) / sqrt(2) = ${data.scores[topMatch.index].toFixed(3)}\n\nNote: transformer-style scaled dot product is the same multiplicative family as Luong dot, but with the 1/sqrt(d_k) scaling factor.`;
  }

  byId('scoreLabBreakdown').textContent = breakdown;
  byId('scoreLabContext').textContent =
    `top attended source = ${bestToken.label} (${bestToken.name})\nfinal context = ${vectorText(data.context)}\n\nAll three methods end with the same softmax-weighted sum over values.\nWhat changes is only how the raw compatibility scores are computed.`;
}

function renderAttentionLab() {
  const mode = state.attentionLabMode;
  const step = state.attentionLabStep;
  const activeQuery = state.attentionLabQuery;
  const data = attentionLabData(mode, activeQuery);
  const steps = ['Input tokens', 'Project Q, K, V', 'Dot-product scores', 'Softmax weights', 'Weighted sum', 'Context output'];
  const flow = byId('attentionLabFlow');
  const sourceRow = byId('attentionLabSourceRow');
  const queryRow = byId('attentionLabQueryRow');
  const matrix = byId('attentionLabMatrix');
  const progress = byId('attentionLabProgress');
  const detailTitle = byId('attentionLabDetailTitle');
  const detailText = byId('attentionLabDetailText');

  flow.innerHTML = '';
  steps.forEach((label, i) => {
    const el = document.createElement('div');
    el.className = `attention-lab-step${i === step ? ' active' : ''}`;
    el.textContent = label;
    flow.appendChild(el);
  });
  progress.style.width = `${(step / (steps.length - 1)) * 100}%`;

  byId('attentionLabLeftTitle').textContent = mode === 'self' ? 'Source sequence (same sequence supplies K and V)' : 'Encoder memory bank (supplies K and V)';
  byId('attentionLabQueryTitle').textContent = mode === 'self' ? 'Query side (same sequence supplies Q)' : 'Decoder queries';
  byId('attentionLabMatrixTitle').textContent = step < 3 ? 'Score matrix view' : 'Softmax / context view';
  byId('attentionLabQueryVal').textContent = String(activeQuery);
  setGridColumns(sourceRow, data.source.length);
  setGridColumns(queryRow, data.queries.length);

  sourceRow.innerHTML = '';
  data.source.forEach((token, i) => {
    const el = document.createElement('div');
    el.className = `attention-token-card${(mode === 'self' && i === activeQuery - 1) ? ' active' : ''}`;
    el.innerHTML = `<span>${token.label}</span><small>${step >= 1 ? `K ${vectorText(token.k)}` : 'source token'}</small>`;
    sourceRow.appendChild(el);
  });

  queryRow.innerHTML = '';
  data.queries.forEach((token, i) => {
    const el = document.createElement('div');
    el.className = `attention-query-card${i === activeQuery - 1 ? ' active' : ''}`;
    el.innerHTML = `<span>${token.label}</span><small>${step >= 1 ? `Q ${vectorText(token.q)}` : 'query token'}</small>`;
    queryRow.appendChild(el);
  });

  byId('attentionLabQVec').textContent = step >= 1 ? `${mode === 'self' ? 'Q from active token' : 'Q from active decoder'}\n${vectorText(data.queries[activeQuery - 1].q)}` : 'Choose the active query token first.';
  byId('attentionLabKVec').textContent = step >= 1 ? `Example key: ${data.source[2].label}\n${vectorText(data.source[2].k)}` : 'Keys appear after linear projection.';
  byId('attentionLabVVec').textContent = step >= 1 ? `Example value: ${data.source[2].label}\n${vectorText(data.source[2].v)}` : 'Values are the content vectors later combined by weights.';

  matrix.className = `attention-matrix-grid ${mode}`;
  matrix.innerHTML = '';
  const rows = mode === 'self' ? data.queries.length : data.queries.length;
  const cols = data.source.length;
  const allScores = [];
  for (let r = 0; r < rows; r++) {
    const rowData = attentionLabData(mode, r + 1);
    for (let c = 0; c < cols; c++) allScores.push(rowData.scores[c]);
  }
  const scoreMin = Math.min(...allScores);
  const scoreMax = Math.max(...allScores);
  for (let r = 0; r < rows; r++) {
    const rowData = attentionLabData(mode, r + 1);
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement('div');
      cell.className = 'attention-matrix-cell';
      const isActiveRow = r === activeQuery - 1;
      if (step <= 1) {
        cell.style.background = isActiveRow ? 'rgba(52, 211, 153, 0.18)' : 'rgba(255,255,255,0.08)';
        cell.style.color = 'rgba(248,250,252,0.74)';
        cell.textContent = `${data.queries[r].label}->${data.source[c].label}`;
      } else if (step === 2) {
        const alpha = (rowData.scores[c] - scoreMin) / Math.max(1e-6, scoreMax - scoreMin);
        cell.style.background = `rgba(56, 189, 248, ${0.18 + alpha * 0.72})`;
        cell.textContent = rowData.scores[c].toFixed(2);
      } else {
        const alpha = rowData.weights[c];
        cell.style.background = `rgba(245, 158, 11, ${0.12 + alpha * 2.6})`;
        cell.textContent = rowData.weights[c].toFixed(2);
      }
      if (isActiveRow) {
        cell.style.outline = '2px solid rgba(52, 211, 153, 0.7)';
        cell.style.outlineOffset = '-2px';
      }
      matrix.appendChild(cell);
    }
  }

  const topIdx = data.weights
    .map((w, i) => ({ w, i }))
    .sort((a, b) => b.w - a.w)
    .slice(0, 3)
    .map(obj => data.source[obj.i].label)
    .join(', ');

  const messages = [
    {
      title: 'Input tokens and active query',
      text: mode === 'self'
        ? 'We begin with one sequence. The same tokens will later supply query, key, and value projections. Pick one active token and ask: which other positions should it read from?'
        : 'We begin with two roles: encoder memory on the left and decoder queries on the right. The active decoder query will ask which encoder positions contain relevant information.'
    },
    {
      title: 'Linear projections create Q, K, and V',
      text: 'Attention does not compare raw tokens directly. Learned linear maps create queries Q, keys K, and values V so that similarity and content live in trainable vector spaces.'
    },
    {
      title: 'Dot-product scores measure compatibility',
      text: `The active query is dotted against every key. Large scores mean “this source position is relevant to my current need.” For the active query, the strongest raw matches are ${topIdx}.`
    },
    {
      title: 'Softmax converts scores into probabilities',
      text: 'Softmax normalizes the raw scores into nonnegative weights that sum to one. This turns compatibility scores into an interpretable distribution over where the model chooses to look.'
    },
    {
      title: 'Values are combined by those weights',
      text: 'The model now performs a weighted average of the value vectors. Highly attended positions contribute more content, weakly attended positions contribute less.'
    },
    {
      title: 'Context vector becomes the output of attention',
      text: `For the active query, the final context is ${vectorText(data.context)}. This context is what the next layer or decoder step actually receives after the attention computation.`
    }
  ];

  detailTitle.textContent = messages[step].title;
  detailText.textContent = messages[step].text;
}

function renderMultiHeadLab() {
  const steps = ['Shared input', 'Per-head projections', 'Per-head scores', 'Per-head softmax', 'Per-head contexts', 'Concat + W_O'];
  const step = state.multiHeadLabStep;
  const activeQuery = state.multiHeadLabQuery;
  const headCount = state.multiHeadLabHeads;
  const source = Array.from({ length: 8 }, (_, i) => ({
    label: `x${i + 1}`,
    base: [0.18 + 0.05 * i, 0.28 + 0.04 * Math.sin(i)]
  }));
  const query = source[activeQuery - 1].base;

  const flow = byId('multiHeadLabFlow');
  const sourceRow = byId('multiHeadLabSourceRow');
  const queryRow = byId('multiHeadLabQueryRow');
  const headsGrid = byId('multiHeadLabHeadsGrid');
  const detailTitle = byId('multiHeadLabDetailTitle');
  const detailText = byId('multiHeadLabDetailText');
  const progress = byId('multiHeadLabProgress');

  flow.innerHTML = '';
  steps.forEach((label, i) => {
    const el = document.createElement('div');
    el.className = `attention-lab-step${i === step ? ' active' : ''}`;
    el.textContent = label;
    flow.appendChild(el);
  });
  progress.style.width = `${(step / (steps.length - 1)) * 100}%`;
  byId('multiHeadLabQueryVal').textContent = String(activeQuery);
  byId('multiHeadLabHeadsVal').textContent = String(headCount);
  setGridColumns(sourceRow, source.length);
  setGridColumns(queryRow, 1);
  headsGrid.style.gridTemplateColumns = `repeat(${headCount}, minmax(0, 1fr))`;

  sourceRow.innerHTML = '';
  source.forEach((token, i) => {
    const el = document.createElement('div');
    el.className = `attention-token-card${i === activeQuery - 1 ? ' active' : ''}`;
    el.innerHTML = `<span>${token.label}</span><small>${step >= 1 ? vectorText(token.base) : 'shared input'}</small>`;
    sourceRow.appendChild(el);
  });

  queryRow.innerHTML = '';
  const qEl = document.createElement('div');
  qEl.className = 'attention-query-card active';
  qEl.innerHTML = `<span>query ${source[activeQuery - 1].label}</span><small>${vectorText(query)}</small>`;
  queryRow.appendChild(qEl);

  headsGrid.innerHTML = '';
  const contexts = [];
  for (let h = 0; h < headCount; h++) {
    const weights = attentionHeadWeights(activeQuery + 3, 0.55, 'global', h);
    const headScores = source.map((_, i) => (weights[i + 2] || weights[i]) * (h + 1.4));
    const headContext = [
      source.reduce((acc, s, i) => acc + (weights[i + 2] || weights[i]) * (0.2 + 0.05 * Math.sin(i + h)), 0),
      source.reduce((acc, s, i) => acc + (weights[i + 2] || weights[i]) * (0.3 + 0.05 * Math.cos(i * 0.7 + h)), 0)
    ];
    contexts.push(headContext);
    const card = document.createElement('div');
    card.className = 'multihead-head-card';
    const titleColor = ['#93c5fd', '#f9a8d4', '#86efac', '#fde68a'][h];
    let content = '';
    if (step === 0) {
      content = 'Head exists, but has not yet projected its own Q/K/V space.';
    } else if (step === 1) {
      content = `q_h = ${vectorText([query[0] + 0.05 * h, query[1] - 0.03 * h])}\nk_h(sample) = ${vectorText([0.24 + 0.03 * h, 0.18 + 0.02 * h])}\nv_h(sample) = ${vectorText([0.29 + 0.02 * h, 0.34 - 0.02 * h])}`;
    } else if (step === 2) {
      content = `scores\n${headScores.map((s, i) => `x${i + 1}:${s.toFixed(2)}`).join('  ')}`;
    } else if (step === 3) {
      content = `weights\n${source.map((s, i) => `${s.label}:${(weights[i + 2] || weights[i]).toFixed(2)}`).join('  ')}`;
    } else if (step === 4) {
      content = `context_h = ${vectorText(headContext)}\nEach head now summarizes the sequence differently.`;
    } else {
      content = `head output = ${vectorText(headContext)}\nready for concatenation`;
    }
    card.innerHTML = `<h5 style="color:${titleColor}">Head ${h + 1}</h5><p>${content}</p>`;
    headsGrid.appendChild(card);
  }

  const concat = contexts.flat().map(v => v.toFixed(2));
  const projected = [
    contexts.reduce((acc, c) => acc + c[0], 0) / headCount,
    contexts.reduce((acc, c) => acc + c[1], 0) / headCount
  ];
  byId('multiHeadLabOutput').textContent = step < 5
    ? 'The final output projection is only meaningful after each head has produced its own context vector.'
    : `concat(head_1,...,head_H) = [${concat.join(', ')}]\nW_O mixes these head outputs into one representation:\nout = ${vectorText(projected)}`;

  const messages = [
    {
      title: 'Shared input sequence',
      text: 'All heads see the same input tokens. Multi-head attention does not duplicate the sequence itself; it duplicates the learned projection spaces.'
    },
    {
      title: 'Each head learns its own Q, K, V projections',
      text: 'Head 1, Head 2, and Head 3 do not compare tokens in exactly the same geometry. Each head measures similarity in its own learned subspace.'
    },
    {
      title: 'Each head computes its own scores',
      text: 'The active query is compared against keys separately inside each head. This is where specialization begins: one head may emphasize local similarity, another seasonal offsets, another sparse spikes.'
    },
    {
      title: 'Each head normalizes with its own softmax',
      text: 'Because the score patterns differ, the attention distributions differ too. Heads are useful precisely because they are allowed to disagree.'
    },
    {
      title: 'Each head produces its own context vector',
      text: 'A head-specific context is a summary of the sequence according to that head’s notion of relevance.'
    },
    {
      title: 'Concatenate heads, then apply the output projection',
      text: 'The model stacks the head outputs and applies a learned output projection W_O. This mixes multiple relational views into one representation for the next layer.'
    }
  ];
  detailTitle.textContent = messages[step].title;
  detailText.textContent = messages[step].text;
}

function renderCrossAttentionSub() {
  const viz = crossAttentionSubViz;
  viz.clear();
  viz.grid();
  viz.text('cross-attention: one decoder query reads from an encoder memory bank', 34, 28, 'rgba(255,255,255,0.76)', 12);

  const left = 88;
  const encY = 88;
  const decY = 214;
  const encCount = 8;
  const decCount = 5;
  const activeDec = Math.min(decCount - 1, Math.floor((state.attentionQuery - 3) / 3));
  const weights = attentionWeights(state.attentionQuery, state.attentionTemp, state.attentionMode).slice(4, 12);
  const topMatches = topWeightEntries(weights, 1, 3);
  const qx = 150 + activeDec * 112;
  const contextX = 748;

  viz.text('encoder memory', 48, 58, '#93c5fd', 11);
  viz.text('decoder queries', 48, 186, '#e9d5ff', 11);

  for (let i = 0; i < encCount; i++) {
    const x = left + i * 78;
    const isTopMatch = topMatches.some(item => item.index === i + 1);
    drawAttentionToken(viz, x, encY, `e${i + 1}`, '#1e3a5f', isTopMatch ? '#fbbf24' : '#60a5fa', false);
    const alpha = weights[i] || 0;
    viz.rect(x - 12, encY + 28, 24, 74 * alpha + 6, isTopMatch ? 'rgba(251,191,36,0.82)' : 'rgba(245,158,11,0.82)', null, 0, 5);
    viz.text(alpha.toFixed(2), x, encY + 118, 'rgba(255,255,255,0.62)', 9, 'center');
  }

  for (let j = 0; j < decCount; j++) {
    const x = 150 + j * 112;
    drawAttentionToken(viz, x, decY, `d${j + 1}`, j === activeDec ? '#14532d' : '#4c1d95', j === activeDec ? '#4ade80' : '#c084fc', j === activeDec);
  }

  topMatches.forEach((item, rank) => {
    const x = left + (item.index - 1) * 78;
    viz.arrow(x, 112, qx, 192, rank === 0 ? 'rgba(251,191,36,0.78)' : 'rgba(14,165,233,0.66)', rank === 0 ? 1.9 : 1.4, rank === 0 ? [] : [4, 4]);
  });

  viz.arrow(qx + 20, decY - 12, contextX - 62, 154, 'rgba(52,211,153,0.75)', 2.1);
  viz.rect(contextX - 62, 132, 124, 48, 'rgba(16,185,129,0.14)', '#34d399', 1.5, 12);
  viz.text('step-specific', contextX, 152, '#d1fae5', 11, 'center');
  viz.text('context c_j', contextX, 168, '#d1fae5', 11, 'center');

  drawCallout(
    viz,
    482,
    60,
    330,
    54,
    'Asymmetry',
    [
      'decoder state supplies Q',
      'encoder states supply K and V',
      'the decoder does not search itself; it searches encoder memory'
    ],
    {
      fill: 'rgba(15,23,42,0.44)',
      stroke: 'rgba(148,163,184,0.24)'
    }
  );

  drawCallout(
    viz,
    482,
    184,
    330,
    54,
    'Top Retrieved Notes',
    [
      topMatches.map(item => `e${item.index}`).join(', ') + ' receive the largest weights',
      `alpha = [${topMatches.map(item => item.weight.toFixed(2)).join(', ')}]`,
      'different decoder steps can ask for different slices of history'
    ],
    {
      fill: 'rgba(59,130,246,0.12)',
      stroke: 'rgba(96,165,250,0.22)',
      titleColor: '#bfdbfe'
    }
  );
}

function renderMultiHeadSub() {
  const viz = multiHeadSubViz;
  viz.clear();
  viz.grid();
  viz.text('multi-head specialization: the same query seen through several relational lenses', 34, 28, 'rgba(255,255,255,0.76)', 12);

  const heads = state.attentionHeads;
  const query = clamp(state.attentionQuery, 0, 15);
  const visible = visibleAttentionWindow(query, 16, 8);
  const activeLocal = visible.indexOf(query);
  const colors = ['#93c5fd', '#f9a8d4', '#86efac', '#fde68a'];
  const labels = ['local continuity', 'periodic match', 'rare spike', 'slow context'];
  const rowYs = [78, 126, 174, 222];

  visible.forEach((index, localIndex) => {
    const x = 162 + localIndex * 56;
    drawAttentionToken(
      viz,
      x,
      52,
      `x${index + 1}`,
      index === query ? '#14532d' : '#1e3a5f',
      index === query ? '#4ade80' : '#60a5fa',
      index === query
    );
  });

  for (let h = 0; h < heads; h++) {
    const y = rowYs[h];
    const headWeights = attentionHeadWeights(query, state.attentionTemp, state.attentionMode, h);
    const visibleWeights = visible.map(index => headWeights[index]);
    const topMatches = topWeightEntries(visibleWeights, visible[0], 2);
    viz.rect(34, y - 18, viz.W - 68, 34, 'rgba(255,255,255,0.03)', 'rgba(255,255,255,0.07)', 1, 10);
    viz.text(`head ${h + 1}`, 52, y + 4, colors[h], 11);
    viz.text(labels[h], 104, y + 4, 'rgba(255,255,255,0.72)', 10);
    visible.forEach((index, localIndex) => {
      const x = 162 + localIndex * 56;
      const alpha = clamp(visibleWeights[localIndex] * 6.6, 0.14, 1);
      const fill = h === 0
        ? `rgba(96,165,250,${alpha})`
        : h === 1
          ? `rgba(244,114,182,${alpha})`
          : h === 2
            ? `rgba(74,222,128,${alpha})`
            : `rgba(250,204,21,${alpha})`;
      viz.rect(x - 16, y - 14, 32, 28, fill, index === query ? '#ffffff' : 'rgba(255,255,255,0.05)', index === query ? 1.4 : 1, 7);
      viz.text(index === query ? 'q' : '', x, y + 4, '#111827', 10, 'center');
    });
    viz.text(`top -> ${topMatches.map(item => `x${item.index + 1}`).join(', ')}`, viz.W - 184, y + 4, colors[h], 10);
  }

  viz.line(162 + activeLocal * 56, 68, 162 + activeLocal * 56, 240, 'rgba(52,211,153,0.58)', 1.4, [5, 4]);
  viz.rect(34, 250, viz.W - 68, 34, 'rgba(124,58,237,0.16)', '#a78bfa', 1.2, 10);
  viz.text('concatenate head outputs -> linear projection W_O -> next layer representation', viz.W / 2, 272, '#ede9fe', 11, 'center');
}

function attentionWeights(query, temp, mode) {
  const vals = [];
  for (let i = 0; i < 16; i++) {
    const dist = Math.abs(query - i);
    const seasonal = Math.abs((i % 6) - (query % 6));
    const localPenalty = mode === 'local' ? dist * 1.2 : dist * 0.35;
    const score = 1.6 - localPenalty - seasonal * 0.6 + Math.cos(i * 0.75) * 0.22;
    vals.push(Math.exp(score / temp));
  }
  const total = vals.reduce((a, b) => a + b, 0);
  return vals.map(v => v / total);
}

function attentionHeadWeights(query, temp, mode, headIndex) {
  const vals = [];
  for (let i = 0; i < 16; i++) {
    const dist = Math.abs(query - i);
    const seasonal = Math.abs((i % 6) - (query % 6));
    let score;
    if (headIndex % 3 === 0) {
      score = 1.7 - (mode === 'local' ? dist * 1.15 : dist * 0.32) + Math.cos(i * 0.52) * 0.18;
    } else if (headIndex % 3 === 1) {
      score = 1.45 - seasonal * 1.05 - dist * 0.12 + Math.sin(i * 0.35 + 0.9) * 0.15;
    } else {
      const spikeBias = i === 4 || i === 10 || i === 15 ? 0.9 : 0;
      score = 0.9 - dist * 0.22 + spikeBias + Math.cos(i * 0.82) * 0.12;
    }
    vals.push(Math.exp(score / temp));
  }
  const total = vals.reduce((a, b) => a + b, 0);
  return vals.map(v => v / total);
}

function drawAttentionToken(viz, x, y, label, fill, stroke, active = false) {
  viz.rect(x - 20, y - 16, 40, 32, fill, stroke, active ? 2.3 : 1.4, 9);
  viz.text(label, x, y + 4, active ? '#fff' : 'rgba(255,255,255,0.88)', 11, 'center');
}

function renderAttention() {
  const viz = attentionViz;
  viz.clear();
  viz.grid();

  const query = state.attentionQuery;
  const temp = state.attentionTemp;
  const left = 48;
  const step = 48;

  if (state.attentionPattern === 'self') {
    const weights = attentionWeights(query, temp, state.attentionMode);
    viz.text('self-attention: one token reads from the same sequence', 34, 28, 'rgba(255,255,255,0.76)', 12);
    for (let i = 0; i < 16; i++) {
      const x = left + i * step;
      const isQuery = i === query;
      drawAttentionToken(viz, x, 104, `x${i + 1}`, isQuery ? '#14532d' : '#312e81', isQuery ? '#4ade80' : '#a78bfa', isQuery);
      const barHeight = 126 * weights[i];
      viz.rect(x - 14, 320 - barHeight, 28, barHeight, isQuery ? 'rgba(52,211,153,0.85)' : 'rgba(245,158,11,0.84)', null, 0, 5);
      viz.text(weights[i].toFixed(2), x, 338, 'rgba(255,255,255,0.7)', 10, 'center');
      if (weights[i] > 0.075) viz.arrow(x, 88, left + query * step, 46, 'rgba(14,165,233,0.68)', 1.4);
    }
    viz.rect(left + query * step - 56, 32, 112, 28, '#0f766e', '#5eead4', 1.6, 8);
    viz.text(`query = x${query + 1}`, left + query * step, 50, '#ecfeff', 11, 'center');
    viz.text(state.attentionMode === 'global'
      ? 'self-attention can jump to distant seasonal matches or repeated motifs'
      : 'local self-attention keeps the read mostly near the active timestep', 34, 364, 'rgba(255,255,255,0.72)', 11);
  } else if (state.attentionPattern === 'cross') {
    const weights = attentionWeights(query, temp, state.attentionMode);
    viz.text('cross-attention: decoder query attends to encoder memory', 34, 28, 'rgba(255,255,255,0.76)', 12);
    viz.text('encoder states', 48, 74, '#93c5fd', 11);
    viz.text('decoder states', 48, 210, '#e9d5ff', 11);
    for (let i = 0; i < 16; i++) {
      const x = left + i * step;
      drawAttentionToken(viz, x, 112, `e${i + 1}`, '#1e3a5f', '#60a5fa');
      const barHeight = 98 * weights[i];
      viz.rect(x - 12, 348 - barHeight, 24, barHeight, 'rgba(245,158,11,0.82)', null, 0, 5);
      viz.text(weights[i].toFixed(2), x, 364, 'rgba(255,255,255,0.68)', 10, 'center');
      if (weights[i] > 0.075) viz.arrow(x, 128, left + query * step, 226, 'rgba(14,165,233,0.66)', 1.5);
    }
    for (let i = 0; i < 8; i++) {
      const x = 120 + i * 86;
      const isQuery = i === Math.min(7, Math.floor(query / 2));
      drawAttentionToken(viz, x, 244, `d${i + 1}`, isQuery ? '#14532d' : '#4c1d95', isQuery ? '#4ade80' : '#c084fc', isQuery);
    }
    const qx = 120 + Math.min(7, Math.floor(query / 2)) * 86;
    viz.rect(qx - 62, 270, 124, 28, '#064e3b', '#34d399', 1.6, 8);
    viz.text(`active decoder query`, qx, 288, '#ecfdf5', 11, 'center');
    viz.text('decoder step builds a fresh context vector from encoder outputs', 34, 330, 'rgba(255,255,255,0.72)', 11);
    viz.text(state.attentionMode === 'global'
      ? 'global cross-attention can read any encoder position'
      : 'local cross-attention biases the decoder toward nearby encoded history', 34, 364, 'rgba(255,255,255,0.72)', 11);
  } else {
    const heads = state.attentionHeads;
    viz.text('multi-head attention: different heads specialize in different patterns', 34, 28, 'rgba(255,255,255,0.76)', 12);
    const rowYs = [102, 184, 266, 348];
    for (let h = 0; h < heads; h++) {
      const weights = attentionHeadWeights(query, temp, state.attentionMode, h);
      const y = rowYs[h];
      viz.rect(34, y - 26, viz.W - 68, 54, 'rgba(255,255,255,0.025)', 'rgba(255,255,255,0.06)', 1, 10);
      viz.text(`head ${h + 1}`, 52, y + 4, ['#93c5fd', '#f9a8d4', '#86efac', '#fde68a'][h], 11);
      for (let i = 0; i < 16; i++) {
        const x = 122 + i * 42;
        const alpha = clamp(weights[i] * 6.2, 0.12, 1);
        const fill = h === 0
          ? `rgba(96,165,250,${alpha})`
          : h === 1
            ? `rgba(244,114,182,${alpha})`
            : h === 2
              ? `rgba(74,222,128,${alpha})`
              : `rgba(250,204,21,${alpha})`;
        viz.rect(x - 14, y - 14, 28, 28, fill, i === query ? '#ffffff' : null, i === query ? 1.6 : 0, 7);
        if (i === query) viz.text(`q`, x, y + 4, '#111827', 10, 'center');
      }
    }
    viz.rect(34, 316, viz.W - 68, 42, 'rgba(124,58,237,0.16)', '#a78bfa', 1.2, 10);
    viz.text('heads are concatenated -> projected -> sent to the next layer', viz.W / 2, 342, '#ede9fe', 11, 'center');
    viz.text('example specialization: local continuity / seasonality / spikes', 34, 370, 'rgba(255,255,255,0.72)', 11);
  }

  byId('attentionQueryVal').textContent = String(query);
  byId('attentionTempVal').textContent = temp.toFixed(2);
  byId('attentionHeadsVal').textContent = String(state.attentionHeads);
}

function renderMaskMatrix() {
  const viz = maskViz;
  viz.clear();
  viz.grid(40);

  const size = state.maskSize;
  const focus = clamp(state.maskFocus, 1, size);
  const cell = Math.min(34, Math.floor((viz.W - 210) / size));
  const left = 86;
  const top = 66;
  const rawScores = Array.from({ length: size }, (_, index) =>
    1.35 - Math.abs((focus - 1) - index) * 0.32 + Math.cos(index * 0.65) * 0.12
  );
  const maskedScores = rawScores.map((score, index) => (index < focus ? score : -Infinity));
  const maxMasked = Math.max(...maskedScores.filter(Number.isFinite));
  const exps = maskedScores.map(score => (Number.isFinite(score) ? Math.exp(score - maxMasked) : 0));
  const expTotal = exps.reduce((sum, value) => sum + value, 0);
  const finalWeights = exps.map(value => value / expTotal);

  viz.text('attention score matrix with causal mask', 34, 28, 'rgba(255,255,255,0.76)', 12);
  viz.text('keys / columns', left + (size * cell) / 2, 48, '#cbd5e1', 11, 'center');
  viz.text('queries / rows', 24, top + (size * cell) / 2, '#cbd5e1', 11);

  for (let i = 0; i < size; i++) {
    viz.text(String(i + 1), left + i * cell + cell / 2, top - 10, i + 1 === focus ? '#86efac' : 'rgba(255,255,255,0.72)', 11, 'center');
    viz.text(String(i + 1), left - 18, top + i * cell + cell / 2 + 4, i + 1 === focus ? '#86efac' : 'rgba(255,255,255,0.72)', 11, 'center');
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const x = left + c * cell;
      const y = top + r * cell;
      const allowed = c <= r;
      const isFocusRow = r + 1 === focus;
      const fill = allowed
        ? isFocusRow
          ? 'rgba(52,211,153,0.88)'
          : 'rgba(96,165,250,0.78)'
        : isFocusRow
          ? 'rgba(248,113,113,0.92)'
          : 'rgba(239,68,68,0.72)';
      viz.rect(x, y, cell - 2, cell - 2, fill, 'rgba(255,255,255,0.08)', 1, 5);
      if (!allowed) viz.text('×', x + (cell - 2) / 2, y + cell / 2 + 4, 'rgba(255,255,255,0.82)', 11, 'center');
    }
  }

  const matrixRight = left + size * cell;
  viz.line(left - 8, top + (focus - 1) * cell + cell / 2, matrixRight + 8, top + (focus - 1) * cell + cell / 2, '#34d399', 2.2);
  const panelX = matrixRight + 30;
  drawCallout(
    viz,
    panelX,
    top + 6,
    224,
    56,
    'Focus Row Summary',
    [
      `row t = ${focus} may read only columns 1..${focus}`,
      focus < size ? `future columns ${focus + 1}..${size} receive -infinity before softmax` : 'no future columns remain to be masked'
    ],
    {
      fill: 'rgba(15,23,42,0.5)',
      stroke: 'rgba(148,163,184,0.3)'
    }
  );

  const drawRowCells = (label, y, values, type) => {
    const rowCell = Math.min(28, Math.floor((viz.W - panelX - 22) / size));
    viz.text(label, panelX, y + 18, type === 'softmax' ? '#86efac' : type === 'masked' ? '#fca5a5' : '#bfdbfe', 10);
    values.forEach((value, index) => {
      const x = panelX + 44 + index * rowCell;
      const isMasked = !Number.isFinite(value);
      const fill = type === 'softmax'
        ? `rgba(34,197,94,${0.16 + value * 2.6})`
        : isMasked
          ? 'rgba(239,68,68,0.20)'
          : 'rgba(96,165,250,0.16)';
      const stroke = type === 'softmax'
        ? 'rgba(34,197,94,0.32)'
        : isMasked
          ? 'rgba(239,68,68,0.34)'
          : 'rgba(96,165,250,0.26)';
      viz.rect(x, y, rowCell - 4, 24, fill, stroke, 1, 6);
      viz.text(
        isMasked ? '-inf' : value.toFixed(type === 'softmax' ? 2 : 1),
        x + (rowCell - 4) / 2,
        y + 16,
        'rgba(255,255,255,0.82)',
        9,
        'center'
      );
    });
  };

  drawRowCells('raw logits', top + 90, rawScores, 'raw');
  drawRowCells('masked', top + 126, maskedScores, 'masked');
  drawRowCells('softmax', top + 162, finalWeights, 'softmax');

  drawCallout(
    viz,
    panelX,
    top + 206,
    224,
    46,
    'Key Idea',
    [
      'masking edits the logits first',
      'softmax can only normalize over the still-visible past and present'
    ],
    {
      fill: 'rgba(59,130,246,0.12)',
      stroke: 'rgba(96,165,250,0.22)',
      titleColor: '#bfdbfe'
    }
  );

  byId('maskSizeVal').textContent = String(size);
  byId('maskFocusVal').textContent = String(focus);
}

function renderAll() {
  [
    sequenceWindowViz,
    rnnViz,
    seqToOneViz,
    seqToSeqViz,
    seqToSeqDetailViz,
    rnnGradientViz,
    lstmViz,
    lstmArchViz,
    lstmTimelineViz,
    gruViz,
    gruArchViz,
    gruTimelineViz,
    attentionViz,
    selfAttentionSubViz,
    attentionStepViz,
    crossAttentionSubViz,
    multiHeadSubViz,
    maskViz
  ].forEach(viz => viz.resize());
  renderSequenceWindow();
  renderRnnUnroll();
  renderRnnGradient();
  renderSeqToOne();
  renderSeqToSeq();
  renderSeqToSeqDetail();
  renderSeq2SeqForecastLab();
  renderLstm();
  renderLstmArchitecture();
  renderLstmTimeline();
  renderGru();
  renderGruArchitecture();
  renderGruTimeline();
  renderAttention();
  renderQkvLab();
  renderAttentionLab();
  renderScoreLab();
  renderMultiHeadLab();
  renderSelfAttentionSub();
  renderAttentionStepWidget();
  renderCrossAttentionSub();
  renderMultiHeadSub();
  renderMaskMatrix();
}

function setButtonGroup(activeId, otherIds) {
  byId(activeId).classList.add('selected');
  otherIds.forEach(id => byId(id).classList.remove('selected'));
}

function bindRange(id, stateKey, transform = v => v) {
  const el = byId(id);
  el.addEventListener('input', () => {
    state[stateKey] = transform(Number(el.value));
    renderAll();
  });
}

bindRange('windowStep', 'windowStep');
bindRange('windowLength', 'windowLength');
bindRange('windowHorizon', 'windowHorizon');
bindRange('jacobianEigen', 'jacobianEigen', v => v / 100);
bindRange('jacobianSteps', 'jacobianSteps');
bindRange('seqOneHistory', 'seqOneHistory');
bindRange('seqOneCompression', 'seqOneCompression', v => v / 100);
bindRange('encoderLength', 'encoderLength');
bindRange('decoderLength', 'decoderLength');
bindRange('seq2seqLabStep', 'seq2seqLabStep');
bindRange('forgetGate', 'forgetGate', v => v / 100);
bindRange('inputGate', 'inputGate', v => v / 100);
bindRange('outputGate', 'outputGate', v => v / 100);
bindRange('candidateGate', 'candidateGate', v => v / 100);
bindRange('updateGate', 'updateGate', v => v / 100);
bindRange('resetGate', 'resetGate', v => v / 100);
bindRange('gruCandidate', 'gruCandidate', v => v / 100);
bindRange('attentionQuery', 'attentionQuery');
bindRange('attentionTemp', 'attentionTemp', v => v / 100);
bindRange('attentionHeads', 'attentionHeads');
bindRange('attentionWalkToken', 'attentionWalkToken');
bindRange('qkvLabQuery', 'qkvLabQuery');
bindRange('attentionLabQuery', 'attentionLabQuery');
bindRange('scoreLabQuery', 'scoreLabQuery');
bindRange('scoreLabTemp', 'scoreLabTemp', v => v / 100);
bindRange('multiHeadLabQuery', 'multiHeadLabQuery');
bindRange('multiHeadLabHeads', 'multiHeadLabHeads');
bindRange('maskSize', 'maskSize');
bindRange('maskFocus', 'maskFocus');

byId('modeSeqToSeq').addEventListener('click', () => {
  state.rnnMode = 'seq2seq';
  setButtonGroup('modeSeqToSeq', ['modeSeqToOne']);
  renderRnnUnroll();
});

byId('modeSeqToOne').addEventListener('click', () => {
  state.rnnMode = 'seq2one';
  setButtonGroup('modeSeqToOne', ['modeSeqToSeq']);
  renderRnnUnroll();
});

byId('decoderRecursive').addEventListener('click', () => {
  state.decoderMode = 'recursive';
  setButtonGroup('decoderRecursive', ['decoderDirect']);
  renderAll();
});

byId('decoderDirect').addEventListener('click', () => {
  state.decoderMode = 'direct';
  setButtonGroup('decoderDirect', ['decoderRecursive']);
  renderAll();
});

byId('seq2seqLabTeacher').addEventListener('click', () => {
  state.seq2seqLabMode = 'teacher';
  setButtonGroup('seq2seqLabTeacher', ['seq2seqLabInfer']);
  renderSeq2SeqForecastLab();
});

byId('seq2seqLabInfer').addEventListener('click', () => {
  state.seq2seqLabMode = 'infer';
  setButtonGroup('seq2seqLabInfer', ['seq2seqLabTeacher']);
  renderSeq2SeqForecastLab();
});

byId('seq2seqLabFixed').addEventListener('click', () => {
  state.seq2seqLabMemory = 'fixed';
  setButtonGroup('seq2seqLabFixed', ['seq2seqLabAttend']);
  renderSeq2SeqForecastLab();
});

byId('seq2seqLabAttend').addEventListener('click', () => {
  state.seq2seqLabMemory = 'attention';
  setButtonGroup('seq2seqLabAttend', ['seq2seqLabFixed']);
  renderSeq2SeqForecastLab();
});

byId('seq2seqLabPrev').addEventListener('click', () => {
  state.seq2seqLabPhase = Math.max(0, state.seq2seqLabPhase - 1);
  renderSeq2SeqForecastLab();
});

byId('seq2seqLabNext').addEventListener('click', () => {
  state.seq2seqLabPhase = Math.min(4, state.seq2seqLabPhase + 1);
  renderSeq2SeqForecastLab();
});

byId('attentionGlobal').addEventListener('click', () => {
  state.attentionMode = 'global';
  setButtonGroup('attentionGlobal', ['attentionLocal']);
  renderAll();
});

byId('attentionLocal').addEventListener('click', () => {
  state.attentionMode = 'local';
  setButtonGroup('attentionLocal', ['attentionGlobal']);
  renderAll();
});

byId('attentionSelf').addEventListener('click', () => {
  state.attentionPattern = 'self';
  setButtonGroup('attentionSelf', ['attentionCross', 'attentionMulti']);
  renderAll();
});

byId('attentionCross').addEventListener('click', () => {
  state.attentionPattern = 'cross';
  setButtonGroup('attentionCross', ['attentionSelf', 'attentionMulti']);
  renderAll();
});

byId('attentionMulti').addEventListener('click', () => {
  state.attentionPattern = 'multi';
  setButtonGroup('attentionMulti', ['attentionSelf', 'attentionCross']);
  renderAll();
});

byId('attentionStepPrev').addEventListener('click', () => {
  state.attentionWalkStep = Math.max(0, state.attentionWalkStep - 1);
  renderAttentionStepWidget();
});

byId('attentionStepNext').addEventListener('click', () => {
  state.attentionWalkStep = Math.min(4, state.attentionWalkStep + 1);
  renderAttentionStepWidget();
});

byId('qkvLabSelf').addEventListener('click', () => {
  state.qkvLabMode = 'self';
  setButtonGroup('qkvLabSelf', ['qkvLabCross']);
  renderQkvLab();
});

byId('qkvLabCross').addEventListener('click', () => {
  state.qkvLabMode = 'cross';
  setButtonGroup('qkvLabCross', ['qkvLabSelf']);
  renderQkvLab();
});

byId('attentionLabSelf').addEventListener('click', () => {
  state.attentionLabMode = 'self';
  byId('attentionLabQuery').max = '8';
  state.attentionLabQuery = Math.min(8, state.attentionLabQuery);
  setButtonGroup('attentionLabSelf', ['attentionLabCross']);
  renderAttentionLab();
});

byId('attentionLabCross').addEventListener('click', () => {
  state.attentionLabMode = 'cross';
  byId('attentionLabQuery').max = '5';
  state.attentionLabQuery = Math.min(5, state.attentionLabQuery);
  setButtonGroup('attentionLabCross', ['attentionLabSelf']);
  renderAttentionLab();
});

byId('attentionLabPrev').addEventListener('click', () => {
  state.attentionLabStep = Math.max(0, state.attentionLabStep - 1);
  renderAttentionLab();
});

byId('attentionLabNext').addEventListener('click', () => {
  state.attentionLabStep = Math.min(5, state.attentionLabStep + 1);
  renderAttentionLab();
});

byId('attentionLabAuto').addEventListener('click', () => {
  if (state.attentionLabTimer) {
    clearInterval(state.attentionLabTimer);
    state.attentionLabTimer = null;
    byId('attentionLabAuto').textContent = 'Auto';
    return;
  }
  byId('attentionLabAuto').textContent = 'Stop';
  state.attentionLabTimer = setInterval(() => {
    if (state.attentionLabStep >= 5) {
      clearInterval(state.attentionLabTimer);
      state.attentionLabTimer = null;
      byId('attentionLabAuto').textContent = 'Auto';
      return;
    }
    state.attentionLabStep += 1;
    renderAttentionLab();
  }, 1100);
});

byId('scoreLabDot').addEventListener('click', () => {
  state.scoreLabMethod = 'dot';
  setButtonGroup('scoreLabDot', ['scoreLabBahdanau', 'scoreLabLuong']);
  renderScoreLab();
});

byId('scoreLabBahdanau').addEventListener('click', () => {
  state.scoreLabMethod = 'bahdanau';
  setButtonGroup('scoreLabBahdanau', ['scoreLabDot', 'scoreLabLuong']);
  renderScoreLab();
});

byId('scoreLabLuong').addEventListener('click', () => {
  state.scoreLabMethod = 'luong';
  setButtonGroup('scoreLabLuong', ['scoreLabDot', 'scoreLabBahdanau']);
  renderScoreLab();
});

byId('multiHeadLabPrev').addEventListener('click', () => {
  state.multiHeadLabStep = Math.max(0, state.multiHeadLabStep - 1);
  renderMultiHeadLab();
});

byId('multiHeadLabNext').addEventListener('click', () => {
  state.multiHeadLabStep = Math.min(5, state.multiHeadLabStep + 1);
  renderMultiHeadLab();
});

byId('multiHeadLabAuto').addEventListener('click', () => {
  if (state.multiHeadLabTimer) {
    clearInterval(state.multiHeadLabTimer);
    state.multiHeadLabTimer = null;
    byId('multiHeadLabAuto').textContent = 'Auto';
    return;
  }
  byId('multiHeadLabAuto').textContent = 'Stop';
  state.multiHeadLabTimer = setInterval(() => {
    if (state.multiHeadLabStep >= 5) {
      clearInterval(state.multiHeadLabTimer);
      state.multiHeadLabTimer = null;
      byId('multiHeadLabAuto').textContent = 'Auto';
      return;
    }
    state.multiHeadLabStep += 1;
    renderMultiHeadLab();
  }, 1100);
});

byId('rnnReset').addEventListener('click', () => {
  state.rnnPlayhead = 0;
  state.rnnAnimating = false;
  byId('rnnPlay').textContent = 'Play';
  renderRnnUnroll();
});

let rnnTimer = null;
byId('rnnPlay').addEventListener('click', () => {
  state.rnnAnimating = !state.rnnAnimating;
  byId('rnnPlay').textContent = state.rnnAnimating ? 'Pause' : 'Play';
  if (state.rnnAnimating) {
    if (rnnTimer) clearInterval(rnnTimer);
    rnnTimer = setInterval(() => {
      state.rnnPlayhead = (state.rnnPlayhead + 1) % 6;
      renderRnnUnroll();
      if (!state.rnnAnimating && rnnTimer) clearInterval(rnnTimer);
    }, 560);
  } else if (rnnTimer) {
    clearInterval(rnnTimer);
  }
});

function initNavHighlight() {
  const links = Array.from(document.querySelectorAll('nav a[href^="#"]'));
  const linkTargets = new Map();

  links.forEach(link => {
    const href = link.getAttribute('href');
    const target = document.querySelector(href);
    if (!target) return;
    if (!linkTargets.has(target.id)) {
      linkTargets.set(target.id, { target, links: [] });
    }
    linkTargets.get(target.id).links.push(link);
  });

  const sections = Array.from(linkTargets.values())
    .map(entry => entry.target)
    .sort((a, b) => {
      if (a === b) return 0;
      const order = a.compareDocumentPosition(b);
      return order & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });

  function parentSectionId(sectionId) {
    const match = sectionId.match(/^(s\d+)/);
    return match ? match[1] : sectionId;
  }

  function setActiveLinks(sectionId) {
    if (!sectionId) return;
    const activeIds = new Set([sectionId]);
    const parentId = parentSectionId(sectionId);
    if (parentId !== sectionId && linkTargets.has(parentId)) {
      activeIds.add(parentId);
    }

    links.forEach(link => {
      const targetId = link.getAttribute('href').slice(1);
      link.classList.toggle('active', activeIds.has(targetId));
    });
  }

  function updateActiveLink() {
    if (!sections.length) return;

    const marker = Math.max(110, Math.min(190, window.innerHeight * 0.18));
    let current = sections[0];
    let bestDistance = Number.POSITIVE_INFINITY;

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const containsMarker = rect.top <= marker && rect.bottom >= marker;
      const distance = containsMarker
        ? 0
        : Math.min(
            Math.abs(rect.top - marker),
            Math.abs(rect.bottom - marker)
          );

      if (distance <= bestDistance) {
        bestDistance = distance;
        current = section;
      }
    });

    setActiveLinks(current.id);
  }

  function scheduleRefresh() {
    window.requestAnimationFrame(() => {
      updateActiveLink();
      window.requestAnimationFrame(updateActiveLink);
    });
    window.setTimeout(updateActiveLink, 120);
    window.setTimeout(updateActiveLink, 420);
  }

  links.forEach(link => {
    link.addEventListener('click', () => {
      const targetId = link.getAttribute('href').slice(1);
      setActiveLinks(targetId);
      scheduleRefresh();
    });
  });

  document.addEventListener('scroll', updateActiveLink, { passive: true });
  window.addEventListener('hashchange', scheduleRefresh);
  window.addEventListener('load', scheduleRefresh);
  window.addEventListener('resize', scheduleRefresh);
  scheduleRefresh();
}

window.addEventListener('resize', renderAll);
initNavHighlight();
renderAll();
