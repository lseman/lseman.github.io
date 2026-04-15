// JavaScript for nn_atlas.html

// =====================================
//  GLOBAL UTILITIES
// =====================================
function dpr(canvas) {
    const r = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || parseInt(canvas.getAttribute('width'));
    const h = canvas.clientHeight || parseInt(canvas.getAttribute('height'));
    canvas.width = w * r; canvas.height = h * r;
    const ctx = canvas.getContext('2d');
    ctx.scale(r, r);
    return { ctx, W: w, H: h };
}

function lerp(a, b, t) { return a + (b - a) * t }
function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)) }
function sigmoid(x) { return 1 / (1 + Math.exp(-x)) }
function relu(x) { return Math.max(0, x) }

// Dark canvas background
function darkBg(ctx, W, H) {
    ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, W, H);
}

// Draw subtle grid on dark bg
function drawDarkGrid(ctx, W, H, step = 40) {
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= W; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
}

// Axes on dark bg
function drawAxes(ctx, W, H, xc, yc) {
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, yc); ctx.lineTo(W, yc); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(xc, 0); ctx.lineTo(xc, H); ctx.stroke();
}

// Label
function label(ctx, text, x, y, color = 'rgba(255,255,255,0.5)', size = 11) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `${size}px 'Fira Code', monospace`;
    ctx.fillText(text, x, y);
    ctx.restore();
}

// Color scales
function coolwarm(t) { // t in [-1,1]
    const s = clamp((t + 1) / 2, 0, 1);
    const r = Math.round(lerp(60, 230, s));
    const g = Math.round(lerp(80, 80, s));
    const b = Math.round(lerp(220, 60, s));
    return `rgb(${r},${g},${b})`;
}
function heat(t) { // 0=black, 1=red, yellow, white
    t = clamp(t, 0, 1);
    if (t < 0.33) return `rgb(${Math.round(t / 0.33 * 200)},0,0)`;
    if (t < 0.66) return `rgb(200,${Math.round((t - 0.33) / 0.33 * 200)},0)`;
    return `rgb(220,200,${Math.round((t - 0.66) / 0.34 * 255)})`;
}

// =====================================
//  CANVAS VIZ CLASS
// =====================================
class CanvasViz {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.dpr();
    }
    dpr() {
        const r = window.devicePixelRatio || 1;
        const w = this.canvas.clientWidth || parseInt(this.canvas.getAttribute('width'));
        const h = this.canvas.clientHeight || parseInt(this.canvas.getAttribute('height'));
        this.canvas.width = w * r; this.canvas.height = h * r;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.scale(r, r);
        this.W = w; this.H = h;
        return this;
    }
    clear(color = '#0d1117') {
        this.ctx.fillStyle = color; this.ctx.fillRect(0, 0, this.W, this.H);
    }
    grid(step = 40, color = 'rgba(255,255,255,0.04)') {
        this.ctx.strokeStyle = color; this.ctx.lineWidth = 0.5;
        for (let x = 0; x <= this.W; x += step) { this.ctx.beginPath(); this.ctx.moveTo(x, 0); this.ctx.lineTo(x, this.H); this.ctx.stroke(); }
        for (let y = 0; y <= this.H; y += step) { this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(this.W, y); this.ctx.stroke(); }
    }
    axes(xc = 0, yc = 0, color = 'rgba(255,255,255,0.15)') {
        this.ctx.strokeStyle = color; this.ctx.lineWidth = 1;
        this.ctx.beginPath(); this.ctx.moveTo(0, yc); this.ctx.lineTo(this.W, yc); this.ctx.stroke();
        this.ctx.beginPath(); this.ctx.moveTo(xc, 0); this.ctx.lineTo(xc, this.H); this.ctx.stroke();
    }
    label(text, x, y, color = 'rgba(255,255,255,0.5)', size = 11) {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.font = `${size}px 'Fira Code', monospace`;
        this.ctx.fillText(text, x, y);
        this.ctx.restore();
    }
    line(x1, y1, x2, y2, color, width = 1, dash = []) {
        this.ctx.strokeStyle = color; this.ctx.lineWidth = width;
        if (dash.length) this.ctx.setLineDash(dash);
        this.ctx.beginPath(); this.ctx.moveTo(x1, y1); this.ctx.lineTo(x2, y2); this.ctx.stroke();
        if (dash.length) this.ctx.setLineDash([]);
    }
    circle(x, y, r, fill, stroke = null, strokeWidth = 1) {
        this.ctx.beginPath(); this.ctx.arc(x, y, r, 0, Math.PI * 2);
        this.ctx.fillStyle = fill; this.ctx.fill();
        if (stroke) { this.ctx.strokeStyle = stroke; this.ctx.lineWidth = strokeWidth; this.ctx.stroke(); }
    }
    rect(x, y, w, h, fill, stroke = null, strokeWidth = 1) {
        if (fill) { this.ctx.fillStyle = fill; this.ctx.fillRect(x, y, w, h); }
        if (stroke) { this.ctx.strokeStyle = stroke; this.ctx.lineWidth = strokeWidth; this.ctx.strokeRect(x, y, w, h); }
    }
    // Map domain -> canvas pixels
    mapX(v, xMin, xMax) { return (v - xMin) / (xMax - xMin) * this.W; }
    mapY(v, yMin, yMax) { return (1 - (v - yMin) / (yMax - yMin)) * this.H; }
}

// =====================================
//  ANIMATION LOOP HELPER
// =====================================
class AnimLoop {
    constructor(tickFn, { maxSteps = Infinity, fps = 60 } = {}) {
        this.tickFn = tickFn;
        this.maxSteps = maxSteps;
        this.fps = fps;
        this.frame = null;
        this.step = 0;
        this.running = false;
    }
    start() {
        this.running = true;
        const interval = 1000 / this.fps;
        let last = 0;
        const loop = (ts) => {
            if (!this.running) return;
            if (ts - last >= interval) { last = ts; this.step++; if (this.step >= this.maxSteps) { this.tickFn(this.step); this.stop(); return; } this.tickFn(this.step); }
            this.frame = requestAnimationFrame(loop);
        };
        this.frame = requestAnimationFrame(loop);
    }
    stop() { this.running = false; if (this.frame) cancelAnimationFrame(this.frame); }
}

// =====================================
//  MLP CLASS (for sections 8, 9, 15)
// =====================================
class MLP {
    constructor(layers, activation = 'relu') {
        this.layers = layers;
        this.activation = activation;
        this.weights = [];
        this.biases = [];
        for (let l = 1; l < layers.length; l++) {
            const fanIn = layers[l - 1];
            const fanOut = layers[l];
            const std = activation === 'relu'
                ? Math.sqrt(2 / fanIn)
                : Math.sqrt(2 / (fanIn + fanOut));
            this.weights.push(
                Array.from({ length: fanOut }, () => Array.from({ length: fanIn }, () => (Math.random() - 0.5) * 2 * std))
            );
            this.biases.push(Array.from({ length: fanOut }, () => 0));
        }
        this.optState = {
            mW: this.weights.map(w => w.map(row => row.map(() => 0))),
            mB: this.biases.map(b => b.map(() => 0)),
            vW: this.weights.map(w => w.map(row => row.map(() => 0))),
            vB: this.biases.map(b => b.map(() => 0)),
            sW: this.weights.map(w => w.map(row => row.map(() => 0))),
            sB: this.biases.map(b => b.map(() => 0)),
            t: 0
        };
    }

    _activate(x) {
        if (this.activation === 'tanh') return Math.tanh(x);
        if (this.activation === 'sigmoid') {
            const z = Math.max(-60, Math.min(60, x));
            return 1 / (1 + Math.exp(-z));
        }
        return Math.max(0, x);
    }

    _activatePrime(x) {
        if (this.activation === 'tanh') {
            const t = Math.tanh(x);
            return 1 - t * t;
        }
        if (this.activation === 'sigmoid') {
            const z = Math.max(-60, Math.min(60, x));
            const s = 1 / (1 + Math.exp(-z));
            return s * (1 - s);
        }
        return x > 0 ? 1 : 0;
    }

    _forward(x) {
        const acts = [Array.from(x)];
        const zs = [];
        let a = Array.from(x);
        for (let layer = 0; layer < this.weights.length; layer++) {
            const z = this.weights[layer].map((row, j) => {
                let sum = this.biases[layer][j];
                for (let i = 0; i < row.length; i++) sum += row[i] * a[i];
                return sum;
            });
            zs.push(z);
            a = layer === this.weights.length - 1 ? z.map(sigmoid) : z.map(v => this._activate(v));
            acts.push(a);
        }
        return { acts, zs };
    }

    predict(x) {
        const out = this._forward(x).acts[this.layers.length - 1];
        return out.length === 1 ? out[0] : out;
    }

    train(X, y, { lr = 0.1, epochs = 100, batchSize = 32, optimizer = 'sgd', beta1 = 0.9, beta2 = 0.999, eps = 1e-8 } = {}) {
        const n = X.length;
        const state = this.optState;
        if (optimizer === 'adam') state.t += 1;

        const zeroLike = arr => arr.map(row => row.map(() => 0));
        const zeroBias = arr => arr.map(() => 0);

        for (let epoch = 0; epoch < epochs; epoch++) {
            const indices = Array.from({ length: n }, (_, i) => i).sort(() => Math.random() - 0.5);
            for (let start = 0; start < n; start += batchSize) {
                const end = Math.min(start + batchSize, n);
                const batchGradW = this.weights.map(zeroLike);
                const batchGradB = this.biases.map(zeroBias);

                for (let k = start; k < end; k++) {
                    const i = indices[k];
                    const input = X[i];
                    const target = Array.isArray(y[i]) ? y[i] : [y[i]];
                    const { acts, zs } = this._forward(input);
                    let delta = acts[acts.length - 1].map((o, j) => o - target[j]);

                    for (let layer = this.weights.length - 1; layer >= 0; layer--) {
                        const prevAct = acts[layer];
                        const z = zs[layer];
                        for (let j = 0; j < delta.length; j++) {
                            const d = delta[j];
                            batchGradB[layer][j] += d;
                            for (let i2 = 0; i2 < prevAct.length; i2++) {
                                batchGradW[layer][j][i2] += d * prevAct[i2];
                            }
                        }
                        if (layer > 0) {
                            const nextDelta = new Array(this.weights[layer][0].length).fill(0);
                            for (let i2 = 0; i2 < nextDelta.length; i2++) {
                                let sum = 0;
                                for (let j = 0; j < delta.length; j++) {
                                    sum += this.weights[layer][j][i2] * delta[j];
                                }
                                nextDelta[i2] = this._activatePrime(z[i2]) * sum;
                            }
                            delta = nextDelta;
                        }
                    }
                }

                const inv = 1 / (end - start);
                for (let layer = 0; layer < this.weights.length; layer++) {
                    for (let j = 0; j < this.weights[layer].length; j++) {
                        const gradB = batchGradB[layer][j] * inv;
                        for (let i2 = 0; i2 < this.weights[layer][j].length; i2++) {
                            const gradW = batchGradW[layer][j][i2] * inv;
                            if (optimizer === 'sgd') {
                                this.weights[layer][j][i2] -= lr * gradW;
                            } else if (optimizer === 'momentum') {
                                state.vW[layer][j][i2] = beta1 * state.vW[layer][j][i2] - lr * gradW;
                                this.weights[layer][j][i2] += state.vW[layer][j][i2];
                            } else if (optimizer === 'rmsprop') {
                                state.sW[layer][j][i2] = beta2 * state.sW[layer][j][i2] + (1 - beta2) * gradW * gradW;
                                this.weights[layer][j][i2] -= lr * gradW / (Math.sqrt(state.sW[layer][j][i2]) + eps);
                            } else if (optimizer === 'adam') {
                                state.mW[layer][j][i2] = beta1 * state.mW[layer][j][i2] + (1 - beta1) * gradW;
                                state.vW[layer][j][i2] = beta2 * state.vW[layer][j][i2] + (1 - beta2) * gradW * gradW;
                                const mhat = state.mW[layer][j][i2] / (1 - Math.pow(beta1, state.t));
                                const vhat = state.vW[layer][j][i2] / (1 - Math.pow(beta2, state.t));
                                this.weights[layer][j][i2] -= lr * mhat / (Math.sqrt(vhat) + eps);
                            }
                        }
                        if (optimizer === 'sgd') {
                            this.biases[layer][j] -= lr * gradB;
                        } else if (optimizer === 'momentum') {
                            state.vB[layer][j] = beta1 * state.vB[layer][j] - lr * gradB;
                            this.biases[layer][j] += state.vB[layer][j];
                        } else if (optimizer === 'rmsprop') {
                            state.sB[layer][j] = beta2 * state.sB[layer][j] + (1 - beta2) * gradB * gradB;
                            this.biases[layer][j] -= lr * gradB / (Math.sqrt(state.sB[layer][j]) + eps);
                        } else if (optimizer === 'adam') {
                            state.mB[layer][j] = beta1 * state.mB[layer][j] + (1 - beta1) * gradB;
                            state.vB[layer][j] = beta2 * state.vB[layer][j] + (1 - beta2) * gradB * gradB;
                            const mhat = state.mB[layer][j] / (1 - Math.pow(beta1, state.t));
                            const vhat = state.vB[layer][j] / (1 - Math.pow(beta2, state.t));
                            this.biases[layer][j] -= lr * mhat / (Math.sqrt(vhat) + eps);
                        }
                    }
                }
            }
        }
    }
}

// =====================================
//  MATH UTILITIES
// =====================================
const math = {
    randn() {
        const u1 = Math.random(), u2 = Math.random();
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    },
    softmax(v) {
        const mx = Math.max(...v);
        const e = v.map(x => Math.exp(x - mx));
        const sum = e.reduce((a, b) => a + b, 0);
        return e.map(x => x / sum);
    },
    sigmoid,
    relu: x => Math.max(0, x),
    gelu(x) {
        return 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3)));
    },
    swish(x) {
        const s = 1 / (1 + Math.exp(-x));
        return x * s;
    }
};

// =====================================
//  SECTION 0 — MATHEMATICAL FOUNDATIONS
// =====================================
let s0Running = false, s0Raf = null, s0T = 0;

function s0_reset() {
    s0Running = false; cancelAnimationFrame(s0Raf);
    s0T = 0;
    document.getElementById('s0-play').textContent = '▶ Animate';
    s0_draw();
}

function s0_toggle() {
    s0Running = !s0Running;
    document.getElementById('s0-play').textContent = s0Running ? '⏸ Pause' : '▶ Animate';
    if (s0Running) s0_tick();
}

function s0_tick() {
    if (!s0Running) return;
    s0T += 0.012;
    if (s0T >= 1) { s0Running = false; document.getElementById('s0-play').textContent = '▶ Animate'; }
    s0_draw();
    if (s0Running) s0Raf = requestAnimationFrame(s0_tick);
}

function s0_taylor(order, x, x0, fx0, f1x0, f2x0, f3x0) {
    const dx = x - x0;
    if (order === 1) return fx0 + f1x0 * dx;
    if (order === 2) return fx0 + f1x0 * dx + 0.5 * f2x0 * dx * dx;
    return fx0 + f1x0 * dx + 0.5 * f2x0 * dx * dx + (1 / 6) * f3x0 * dx * dx * dx;
}

function s0_draw() {
    const cv = new CanvasViz('c0');
    cv.clear();
    cv.grid(50);

    const order = parseInt(document.getElementById('s0-order').value, 10);
    const W = cv.W, H = cv.H;
    const xMin = -3, xMax = 3, yMin = -2, yMax = 2;
    const px = v => cv.mapX(v, xMin, xMax);
    const py = v => cv.mapY(v, yMin, yMax);

    // Reference function: sin(x) + 0.3x
    const f = x => Math.sin(x) + 0.3 * x;
    const df = x => Math.cos(x) + 0.3;
    const d2f = x => -Math.sin(x);
    const d3f = x => -Math.cos(x);

    // Taylor expansion around x0 = 1.2
    const x0 = 1.2, fx0 = f(x0), f1x0 = df(x0), f2x0 = d2f(x0), f3x0 = d3f(x0);

    // Draw reference curve
    cv.ctx.strokeStyle = 'rgba(96,165,250,0.8)';
    cv.ctx.lineWidth = 2.5;
    cv.ctx.beginPath();
    let first = true;
    for (let x = xMin; x <= xMax; x += 0.02) {
        const y = f(x);
        if (Math.abs(y) > 5) { first = true; continue; }
        const cvs = first ? cv.ctx.moveTo(px(x), py(y)) : cv.ctx.lineTo(px(x), py(y));
        if (first) { cv.ctx.moveTo(px(x), py(y)); first = false; } else cv.ctx.lineTo(px(x), py(y));
    }
    cv.ctx.stroke();

    // Draw Taylor approximation
    cv.ctx.strokeStyle = 'rgba(251,191,36,0.85)';
    cv.ctx.lineWidth = 1.8;
    cv.ctx.setLineDash([5, 3]);
    cv.ctx.beginPath(); first = true;
    for (let x = xMin; x <= xMax; x += 0.02) {
        const y = s0_taylor(order, x, x0, fx0, f1x0, f2x0, f3x0);
        if (Math.abs(y) > 5) { first = true; continue; }
        if (first) { cv.ctx.moveTo(px(x), py(y)); first = false; } else cv.ctx.lineTo(px(x), py(y));
    }
    cv.ctx.stroke();
    cv.ctx.setLineDash([]);

    // Expansion point marker
    cv.circle(px(x0), py(fx0), 6, '#fbbf24');
    cv.label(`x₀=${x0.toFixed(1)}`, px(x0) + 8, py(fx0) - 8, '#fbbf24', 10);

    // Axis
    cv.axes(px(0), py(0));
    cv.label('0', px(0) + 3, py(0) + 12, 'rgba(255,255,255,0.3)', 10);

    // Labels
    cv.ctx.strokeStyle = 'rgba(96,165,250,0.8)'; cv.ctx.lineWidth = 2.5;
    cv.label('f(x) = sin(x)+0.3x', 10, 22, 'rgba(96,165,250,0.9)', 11);
    cv.ctx.setLineDash([5, 3]);
    cv.ctx.strokeStyle = 'rgba(251,191,36,0.85)'; cv.ctx.lineWidth = 1.8;
    cv.ctx.stroke();
    cv.ctx.setLineDash([]);
    cv.label(`Taylor order ${order}`, 10, 40, 'rgba(251,191,36,0.9)', 11);

    // Error region
    cv.ctx.fillStyle = 'rgba(248,113,113,0.08)';
    cv.ctx.beginPath();
    first = true;
    for (let x = xMin; x <= xMax; x += 0.02) {
        const y = f(x), ty = s0_taylor(order, x, x0, fx0, f1x0, f2x0, f3x0);
        if (Math.abs(y) > 5 || Math.abs(ty) > 5) { first = true; continue; }
        if (first) { cv.ctx.moveTo(px(x), py(y)); first = false; } else cv.ctx.lineTo(px(x), py(y));
    }
    for (let x = xMax; x >= xMin; x -= 0.02) {
        const ty = s0_taylor(order, x, x0, fx0, f1x0, f2x0, f3x0);
        if (Math.abs(ty) > 5) continue;
        cv.ctx.lineTo(px(x), py(ty));
    }
    cv.ctx.closePath();
    cv.ctx.fill();

    cv.label('error region', px(1.5), py(-1.3), 'rgba(248,113,113,0.7)', 10);
}

// =====================================
//  SECTION 1 — ACTIVATION FUNCTIONS
// =====================================
const s1Funcs = {
    sigmoid: { f: x => 1 / (1 + Math.exp(-x)), d: x => { const s = 1 / (1 + Math.exp(-x)); return s * (1 - s); }, color: '#4ade80', eq: 'f(x) = 1/(1+e⁻ˣ)' },
    tanh: { f: x => Math.tanh(x), d: x => 1 - Math.tanh(x) ** 2, color: '#60a5fa', eq: 'f(x) = tanh(x)' },
    relu: { f: x => Math.max(0, x), d: x => x > 0 ? 1 : 0, color: '#f87171', eq: 'f(x) = max(0, x)' },
    lrelu: { f: x => x > 0 ? x : 0.1 * x, d: x => x > 0 ? 1 : 0.1, color: '#fb923c', eq: 'f(x) = max(αx, x), α=0.1' },
    gelu: {
        f: x => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3))), d: x => {
            const c = Math.sqrt(2 / Math.PI);
            const t = 1 / (1 + Math.exp(-c * (x + 0.044715 * x ** 3)));
            return 0.5 * (1 + Math.tanh(c * (x + 0.044715 * x ** 3))) + 0.5 * x * (1 - t * t) * c * (1 + 0.134145 * x * x);
        }, color: '#a78bfa', eq: 'f(x) = x·Φ(x)'
    },
    swish: {
        f: x => x / (1 + Math.exp(-x)), d: x => {
            const sig = 1 / (1 + Math.exp(-x));
            return sig + x * sig * (1 - sig);
        }, color: '#f472b6', eq: 'f(x) = x·σ(x)'
    },
    elu: { f: x => x > 0 ? x : Math.exp(x) - 1, d: x => x > 0 ? 1 : Math.exp(x), color: '#22d3ee', eq: 'f(x) = x if x>0 else eˣ-1' },
};
let s1Active = 'sigmoid';

function s1_select(name, btn) {
    s1Active = name;
    document.querySelectorAll('[id^="b1-"]').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    const fn = s1Funcs[name];
    document.getElementById('s1-dot').style.background = fn.color;
    document.getElementById('s1-info').textContent = fn.eq;
    s1_draw();
}

s0_draw();

function s1_draw() {
    const canvas = document.getElementById('c1');
    const { ctx, W, H } = dpr(canvas);
    darkBg(ctx, W, H);
    drawDarkGrid(ctx, W, H, 50);

    const xMin = -5, xMax = 5, yMin = -1.6, yMax = 1.6;
    const px = v => (v - xMin) / (xMax - xMin) * W;
    const py = v => (1 - (v - yMin) / (yMax - yMin)) * H;

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, py(0)); ctx.lineTo(W, py(0)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px(0), 0); ctx.lineTo(px(0), H); ctx.stroke();

    // Axis labels
    for (let v = -4; v <= 4; v += 2) {
        label(ctx, v.toString(), px(v) - 4, py(0) + 14, 'rgba(255,255,255,0.3)', 10);
        if (v !== 0) label(ctx, v.toString(), px(0) + 4, py(v) + 4, 'rgba(255,255,255,0.3)', 10);
    }

    const showD = document.getElementById('s1-deriv').checked;

    // Draw all functions dimly, active one bright
    Object.entries(s1Funcs).forEach(([name, fn]) => {
        const isCurr = name === s1Active;
        ctx.strokeStyle = isCurr ? fn.color : fn.color + '28';
        ctx.lineWidth = isCurr ? 2.8 : 1;
        ctx.beginPath();
        let first = true;
        for (let x = xMin; x <= xMax; x += 0.02) {
            const y = fn.f(x);
            if (Math.abs(y) > 3) { first = true; continue; }
            if (first) { ctx.moveTo(px(x), py(y)); first = false; }
            else ctx.lineTo(px(x), py(y));
        }
        ctx.stroke();

        // Derivative of active
        if (isCurr && showD && fn.d) {
            ctx.strokeStyle = fn.color + '88';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 3]);
            ctx.beginPath(); first = true;
            for (let x = xMin; x <= xMax; x += 0.02) {
                const y = fn.d(x);
                if (Math.abs(y) > 3) { first = true; continue; }
                if (first) { ctx.moveTo(px(x), py(y)); first = false; }
                else ctx.lineTo(px(x), py(y));
            }
            ctx.stroke();
            ctx.setLineDash([]);
        }
    });

    // Name label
    const fn = s1Funcs[s1Active];
    ctx.fillStyle = fn.color;
    ctx.font = "14px 'Fira Code', monospace";
    ctx.fillText(fn.eq, 12, 22);
}

s1_draw();

// =====================================
//  SECTION 2 — GRADIENT DESCENT
// =====================================
let s2Running = false, s2Raf = null, s2Path = [], s2Step = 0, s2Func = 'bowl', s2Lr = 0.08;
const s2Steps = 200;

const s2Funcs = {
    bowl: { f: (x, y) => 0.5 * x * x + 1.2 * y * y, gx: (x, y) => x, gy: (x, y) => 2.4 * y, start: [2.5, -1.8], xlim: [-3.5, 3.5], ylim: [-2.5, 2.5] },
    rosenbrock: { f: (x, y) => (1 - x) ** 2 + 10 * (y - x * x) ** 2, gx: (x, y) => -2 * (1 - x) - 40 * x * (y - x * x), gy: (x, y) => 20 * (y - x * x), start: [-1.8, 2.5], xlim: [-2.2, 2.2], ylim: [-1, 3.5] },
    bumpy: { f: (x, y) => 0.3 * x * x + 0.8 * y * y + 0.4 * Math.sin(3 * x) * Math.cos(2 * y), gx: (x, y) => 0.6 * x + 1.2 * Math.cos(3 * x) * Math.cos(2 * y), gy: (x, y) => 1.6 * y - 0.8 * Math.sin(3 * x) * Math.sin(2 * y), start: [2.2, 1.8], xlim: [-3, 3], ylim: [-2.5, 2.5] },
};

function s2_lrChange() {
    const v = +document.getElementById('s2-lr').value;
    s2Lr = v * 0.01;
    document.getElementById('s2-lr-val').textContent = s2Lr.toFixed(2);
    s2_reset();
}

function s2_setFunc(name) { s2Func = name; s2_reset(); }

function s2_reset() {
    s2Running = false; cancelAnimationFrame(s2Raf);
    document.getElementById('s2-play').textContent = '▶ Play';
    const fn = s2Funcs[s2Func];
    s2Path = [[...fn.start]];
    s2Step = 0;
    s2_draw();
}

function s2_toggle() {
    s2Running = !s2Running;
    document.getElementById('s2-play').textContent = s2Running ? '⏸ Pause' : '▶ Play';
    if (s2Running) s2_tick();
}

function s2_tick() {
    if (!s2Running) return;
    s2Step++;
    const fn = s2Funcs[s2Func];
    const [x, y] = s2Path[s2Path.length - 1];
    const nx = x - s2Lr * fn.gx(x, y);
    const ny = y - s2Lr * fn.gy(x, y);
    s2Path.push([nx, ny]);
    s2_draw();
    if (s2Step < s2Steps && (Math.abs(nx) > 0.001 || Math.abs(ny) > 0.001)) {
        s2Raf = requestAnimationFrame(s2_tick);
    } else {
        s2Running = false;
        document.getElementById('s2-play').textContent = '▶ Play';
    }
}

function s2_draw() {
    const canvas = document.getElementById('c2');
    const { ctx, W, H } = dpr(canvas);
    darkBg(ctx, W, H);

    const fn = s2Funcs[s2Func];
    const [x0, x1] = fn.xlim, [y0, y1] = fn.ylim;
    const px = x => (x - x0) / (x1 - x0) * W;
    const py = y => (1 - (y - y0) / (y1 - y0)) * H;

    // Contour plot
    const N = 80;
    const vals = [];
    let minV = Infinity, maxV = -Infinity;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const xv = lerp(x0, x1, i / (N - 1));
        const yv = lerp(y0, y1, j / (N - 1));
        const v = fn.f(xv, yv);
        vals[j * N + i] = v;
        if (v < minV) minV = v;
        if (v > maxV) maxV = v;
    }

    const cW = W / N, cH = H / N;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const t = Math.log(1 + (vals[j * N + i] - minV)) / Math.log(1 + (maxV - minV));
        const r = Math.round(lerp(10, 40, t));
        const g = Math.round(lerp(15, 100, t));
        const b = Math.round(lerp(30, 160, t));
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(i * cW, j * cH, cW + 1, cH + 1);
    }

    // Contour lines
    const levels = [0.05, 0.1, 0.2, 0.4, 0.7, 1.0, 1.5, 2.0, 3.0].map(t => minV + t * (maxV - minV));
    levels.forEach(level => {
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 0.5;
        for (let j = 0; j < N - 1; j++) for (let i = 0; i < N - 1; i++) {
            const v = vals[j * N + i];
            if (Math.abs(v - level) < (maxV - minV) * 0.012) {
                ctx.beginPath();
                ctx.arc(i * cW + cW / 2, j * cH + cH / 2, 0.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.fill();
            }
        }
    });

    // Minimum marker
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(px(s2Func === 'rosenbrock' ? 1 : 0), py(s2Func === 'rosenbrock' ? 1 : 0), 6, 0, Math.PI * 2);
    ctx.fill();
    label(ctx, 'minimum', px(s2Func === 'rosenbrock' ? 1 : 0) + 8, py(s2Func === 'rosenbrock' ? 1 : 0), '#fbbf24', 10);

    // Path
    if (s2Path.length > 1) {
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 2;
        ctx.beginPath();
        s2Path.forEach(([x, y], i) => {
            const cx = px(x), cy = py(y);
            if (i === 0) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
        });
        ctx.stroke();
        s2Path.forEach(([x, y], i) => {
            if (i % 5 === 0 || i === s2Path.length - 1) {
                ctx.fillStyle = `rgba(248,113,113,${0.3 + 0.7 * i / s2Path.length})`;
                ctx.beginPath();
                ctx.arc(px(x), py(y), i === s2Path.length - 1 ? 5 : 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    // Start marker
    ctx.fillStyle = '#a78bfa';
    ctx.beginPath();
    ctx.arc(px(fn.start[0]), py(fn.start[1]), 5, 0, Math.PI * 2);
    ctx.fill();
    label(ctx, 'start', px(fn.start[0]) + 7, py(fn.start[1]), '#a78bfa', 10);

    // Loss text
    if (s2Path.length > 1) {
        const [cx, cy] = s2Path[s2Path.length - 1];
        const loss = fn.f(cx, cy);
        label(ctx, `loss: ${loss.toFixed(4)}  step: ${s2Path.length - 1}`, 10, H - 14, 'rgba(255,255,255,0.6)', 11);
    }
}

s2_reset();

// =====================================
//  SECTION 3 — BACKPROPAGATION
//  improved: explicit gradients, clearer pedagogy
// =====================================
let s3Step = 0;
const s3MaxSteps = 8;

// A tiny 2->3->1 network
const s3x = [0.5, 0.8], s3y = 1;
const s3W1 = [[0.3, 0.5], [0.4, -0.2], [0.1, 0.8]];
const s3b1 = [0.1, -0.1, 0.05];
const s3W2 = [[0.6], [0.3], [-0.5]];
const s3b2 = [0.1];

function s3_compute() {
    const z1 = s3W1.map((row, i) => row[0] * s3x[0] + row[1] * s3x[1] + s3b1[i]);
    const a1 = z1.map(sigmoid);

    const z2 = [s3W2[0][0] * a1[0] + s3W2[1][0] * a1[1] + s3W2[2][0] * a1[2] + s3b2[0]];
    const a2 = [sigmoid(z2[0])];

    const loss = 0.5 * (a2[0] - s3y) ** 2;

    const dL_da2 = a2[0] - s3y;
    const dL_dz2 = dL_da2 * a2[0] * (1 - a2[0]);

    const dL_da1 = s3W2.map((w) => w[0] * dL_dz2);
    const dL_dz1 = a1.map((a, i) => dL_da1[i] * a * (1 - a));

    const dW2 = a1.map(a => a * dL_dz2);
    const db2 = dL_dz2;
    const dW1 = s3W1.map((_, i) => s3x.map(xj => dL_dz1[i] * xj));
    const db1 = [...dL_dz1];

    return {
        z1, a1, z2, a2, loss,
        dL_da2, dL_dz2, dL_da1, dL_dz1,
        dW2, db2, dW1, db1
    };
}

const s3Data = s3_compute();

const s3Descs = [
    'Network ready. Input x₁=0.5, x₂=0.8, target y=1.',
    'Forward pass: compute hidden pre-activations z¹ = W¹x + b¹.',
    'Forward pass: apply sigmoid to get hidden activations a¹ = σ(z¹).',
    'Forward pass: compute output pre-activation z² = W²a¹ + b².',
    'Forward pass: compute output ŷ = σ(z²) and loss L = ½(ŷ-y)².',
    'Backward pass: compute output delta δ² = ∂L/∂z².',
    'Backward pass: propagate error into hidden layer to get δ¹.',
    'Parameter gradients: ∂L/∂W and ∂L/∂b are now available.',
    'Complete: all gradients are ready for a gradient descent update.'
];

function s3_reset() { s3Step = 0; s3_draw(); }
function s3_next() { if (s3Step < s3MaxSteps) s3Step++; s3_draw(); }
function s3_prev() { if (s3Step > 0) s3Step--; s3_draw(); }

function s3_draw() {
    const canvas = document.getElementById('c3');
    const { ctx, W, H } = dpr(canvas);
    darkBg(ctx, W, H);
    drawDarkGrid(ctx, W, H, 60);

    document.getElementById('s3-step-label').textContent = `Step ${s3Step} / ${s3MaxSteps}`;
    document.getElementById('s3-desc').textContent = s3Descs[s3Step] || '';

    const d = s3Data;
    const inp = [[80, 120], [80, 220]];
    const hid = [[320, 80], [320, 170], [320, 260]];
    const out = [[560, 170]];
    const r = 22;

    function drawConn(from, to, color, width, labelText = '') {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(from[0], from[1]);
        ctx.lineTo(to[0], to[1]);
        ctx.stroke();

        if (labelText) {
            const mx = (from[0] + to[0]) / 2;
            const my = (from[1] + to[1]) / 2;
            ctx.fillStyle = color;
            ctx.font = "9px 'Fira Code'";
            ctx.fillText(labelText, mx - 14, my - 2);
        }
    }

    function drawNode(pos, mainVal, labelStr, subVal, color, active) {
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], r, 0, Math.PI * 2);
        ctx.fillStyle = active ? color : 'rgba(255,255,255,0.08)';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = active ? 2 : 0.5;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = "10px 'Fira Code'";
        ctx.textAlign = 'center';
        ctx.fillText(mainVal, pos[0], pos[1] + 3);

        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(255,255,255,0.65)';
        ctx.font = "11px 'Fira Code'";
        ctx.fillText(labelStr, pos[0] + r + 6, pos[1] - 8);

        if (subVal) {
            ctx.fillStyle = 'rgba(251,146,60,0.95)';
            ctx.font = "9px 'Fira Code'";
            ctx.fillText(subVal, pos[0] + r + 6, pos[1] + 8);
        }
    }

    const fwdColor = 'rgba(96,165,250,0.7)';
    const bwdColor = 'rgba(251,146,60,0.85)';
    const dimColor = 'rgba(255,255,255,0.1)';

    inp.forEach((ip) => hid.forEach((h) => {
        let col = dimColor, lw = 0.7;
        if (s3Step >= 1 && s3Step <= 4) { col = fwdColor; lw = 1.5; }
        if (s3Step >= 5) { col = bwdColor; lw = 1.5; }
        drawConn(ip, h, col, lw);
    }));

    hid.forEach((h, i) => {
        let col = dimColor, lw = 0.7;
        let txt = '';
        if (s3Step >= 3 && s3Step <= 4) { col = fwdColor; lw = 1.5; }
        if (s3Step >= 5) { col = bwdColor; lw = 1.5; }
        if (s3Step >= 7) txt = `∂W=${d.dW2[i].toFixed(3)}`;
        drawConn(h, out[0], col, lw, txt);
    });

    inp.forEach((p, i) => {
        drawNode(
            p,
            s3x[i].toFixed(1),
            `x${i + 1}`,
            '',
            '#60a5fa',
            s3Step >= 1
        );
    });

    hid.forEach((p, i) => {
        const fwdAct = s3Step >= 2;
        const bwdAct = s3Step >= 6;
        const col = bwdAct ? '#fb923c' : fwdAct ? '#4ade80' : 'rgba(255,255,255,0.3)';
        const val = fwdAct ? d.a1[i].toFixed(2) : '?';
        const grad = bwdAct ? `δ¹=${d.dL_dz1[i].toFixed(3)}` : '';
        drawNode(p, val, `h${i + 1}`, grad, col, fwdAct);

        if (s3Step === 1) {
            ctx.fillStyle = 'rgba(96,165,250,0.85)';
            ctx.font = "9px 'Fira Code'";
            ctx.fillText(`z=${d.z1[i].toFixed(2)}`, p[0] + r + 6, p[1] + 20);
        }

        if (s3Step >= 7) {
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.font = "9px 'Fira Code'";
            ctx.fillText(
                `[${d.dW1[i][0].toFixed(3)}, ${d.dW1[i][1].toFixed(3)}]`,
                p[0] - 18,
                p[1] + 40
            );
        }
    });

    const outFwd = s3Step >= 4;
    const outBwd = s3Step >= 5;
    const outCol = outBwd ? '#fb923c' : outFwd ? '#4ade80' : 'rgba(255,255,255,0.3)';
    const outVal = outFwd ? d.a2[0].toFixed(3) : '?';
    const outGrad = outBwd ? `δ²=${d.dL_dz2.toFixed(3)}` : '';
    drawNode(out[0], outVal, 'ŷ', outGrad, outCol, outFwd);

    ctx.fillStyle = '#fbbf24';
    ctx.font = "12px 'Fira Code'";
    ctx.fillText(`y = ${s3y}`, 620, 170);

    if (s3Step >= 4) {
        ctx.fillStyle = '#f87171';
        ctx.fillText(`L = ${d.loss.toFixed(4)}`, 620, 192);
    }

    if (s3Step >= 5) {
        ctx.strokeStyle = 'rgba(251,146,60,0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.beginPath();
        ctx.moveTo(530, H - 30);
        ctx.lineTo(100, H - 30);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(251,146,60,0.75)';
        ctx.font = "11px 'Fira Code'";
        ctx.fillText('← backward pass', 220, H - 18);
    }

    if (s3Step >= 1 && s3Step <= 4) {
        ctx.strokeStyle = 'rgba(96,165,250,0.45)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.beginPath();
        ctx.moveTo(100, 30);
        ctx.lineTo(530, 30);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(96,165,250,0.75)';
        ctx.font = "11px 'Fira Code'";
        ctx.fillText('forward pass →', 220, 20);
    }

    if (s3Step >= 7) {
        ctx.fillStyle = 'rgba(255,255,255,0.72)';
        ctx.font = "10px 'Fira Code'";
        ctx.fillText(`∂L/∂W² = [${d.dW2.map(v => v.toFixed(3)).join(', ')}]`, 18, H - 54);
        ctx.fillText(`∂L/∂b² = ${d.db2.toFixed(3)}`, 18, H - 38);
    }
}

s3_draw();




// =====================================
//  SECTION 4 — GRADIENT HEATMAPS
// =====================================
let s4Running = false, s4Raf = null, s4Epoch = 0;
let s4Weights = [];
let s4Gradients = [];
let s4Saturated = false;

function s4_initWeights() {
    s4Weights = Array.from({ length: 8 * 16 }, () => (Math.random() - 0.5) * 0.5);
    s4Gradients = s4Weights.map(() => (Math.random() - 0.5) * 0.2);
    s4Epoch = 0; s4Saturated = false;
}

function s4_saturate() {
    s4Saturated = true;
    s4Gradients = s4Weights.map(() => Math.random() * 0.001 * (Math.random() < 0.1 ? 10 : 1));
    s4_draw();
}

function s4_reset() { s4Running = false; cancelAnimationFrame(s4Raf); document.getElementById('s4-play').textContent = '▶ Simulate training'; s4_initWeights(); s4_draw(); }

function s4_toggle() {
    s4Running = !s4Running;
    document.getElementById('s4-play').textContent = s4Running ? '⏸ Pause' : '▶ Simulate training';
    if (s4Running) s4_tick();
}

function s4_tick() {
    if (!s4Running) return;
    s4Epoch++;
    s4Weights = s4Weights.map((w, i) => {
        const g = s4Gradients[i];
        return clamp(w - 0.01 * g, -2, 2);
    });
    const decay = s4Saturated ? 0.999 : 0.97;
    s4Gradients = s4Gradients.map(g => g * decay + (Math.random() - 0.5) * 0.02 * (s4Saturated ? 0.01 : 1));
    s4_draw();
    if (s4Epoch < 200) s4Raf = requestAnimationFrame(s4_tick);
    else { s4Running = false; document.getElementById('s4-play').textContent = '▶ Simulate training'; }
}

function s4_draw() {
    const canvas = document.getElementById('c4');
    const { ctx, W, H } = dpr(canvas);
    darkBg(ctx, W, H);

    const rows = 8, cols = 16;
    const layerSel = document.getElementById('s4-layer').selectedIndex;
    const layerSizes = [[12, 16], [16, 16], [16, 4]];
    const [R, C] = layerSizes[layerSel];

    const cW = Math.floor((W - 120) / C), cH = Math.floor((H - 60) / R);
    const offX = 60, offY = 30;

    const maxG = Math.max(...s4Gradients.map(Math.abs), 0.001);

    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
        const idx = (r * C + c) % s4Gradients.length;
        const g = s4Gradients[idx];
        const t = g / maxG;
        ctx.fillStyle = coolwarm(t);
        ctx.fillRect(offX + c * cW, offY + r * cH, cW - 1, cH - 1);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = "11px 'Fira Code'";
    ctx.fillText('neurons →', offX, H - 8,);
    ctx.save(); ctx.translate(14, offY + R * cH / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText('weights →', 0, 0); ctx.restore();

    const absGrads = s4Gradients.map(Math.abs);
    const meanG = (absGrads.reduce((a, b) => a + b, 0) / absGrads.length).toFixed(5);
    const maxGval = Math.max(...absGrads).toFixed(5);
    label(ctx, `epoch: ${s4Epoch}  mean|∇|: ${meanG}  max|∇|: ${maxGval}`, offX, H - 22, 'rgba(255,255,255,0.6)', 10);

    const cbX = W - 30, cbW = 12;
    for (let y = 0; y < H - 80; y++) {
        const t = 1 - y / (H - 80);
        ctx.fillStyle = coolwarm(2 * t - 1);
        ctx.fillRect(cbX, offY + y, cbW, 1);
    }
    label(ctx, '+', cbX + 14, offY + 6, 'rgba(255,255,255,0.6)', 10);
    label(ctx, '0', cbX + 14, offY + (H - 80) / 2, 'rgba(255,255,255,0.6)', 10);
    label(ctx, '−', cbX + 14, offY + H - 80 - 6, 'rgba(255,255,255,0.6)', 10);

    if (s4Saturated) {
        ctx.fillStyle = 'rgba(248,113,113,0.9)'; ctx.font = "13px 'Fira Code'";
        ctx.fillText('⚠ saturated neurons — vanishing gradients', W / 2 - 160, 20);
    }
}

s4_initWeights(); s4_draw();

// =====================================
//  SECTION 5 — OPTIMIZER COMPARISONS
//  improved: better state naming + more diagnostics
// =====================================
let s5Running = false, s5Raf = null, s5Step = 0;
const s5Start = [-2.5, 1.8];
const s5Names = ['sgd', 'momentum', 'rmsprop', 'adam'];
const s5Optimizers = {
    sgd: {
        label: 'SGD',
        color: '#f87171',
        path: [],
        lastGradNorm: 0,
        lastStepNorm: 0,
        lastStep: [0, 0],
        lastEffectiveLr: 0
    },
    momentum: {
        label: 'Momentum',
        color: '#60a5fa',
        path: [],
        vx: 0, vy: 0,
        lastGradNorm: 0,
        lastStepNorm: 0,
        lastStep: [0, 0],
        lastEffectiveLr: 0
    },
    rmsprop: {
        label: 'RMSProp',
        color: '#4ade80',
        path: [],
        sx: 0, sy: 0,
        lastGradNorm: 0,
        lastStepNorm: 0,
        lastStep: [0, 0],
        lastEffectiveLr: 0
    },
    adam: {
        label: 'Adam',
        color: '#fbbf24',
        path: [],
        mx: 0, my: 0,
        vx: 0, vy: 0,
        t: 0,
        lastGradNorm: 0,
        lastStepNorm: 0,
        lastStep: [0, 0],
        lastEffectiveLr: 0
    },
};

const s5F = (x, y) => 0.1 * x * x + y * y + 0.4 * Math.sin(3 * x) * Math.sin(3 * y);
const s5gx = (x, y) => 0.2 * x + 1.2 * Math.cos(3 * x) * Math.sin(3 * y);
const s5gy = (x, y) => 2 * y + 1.2 * Math.sin(3 * x) * Math.cos(3 * y);

function s5_reset() {
    s5Running = false;
    cancelAnimationFrame(s5Raf);
    document.getElementById('s5-play').textContent = '▶ Race';
    s5Step = 0;

    Object.values(s5Optimizers).forEach(o => {
        o.path = [[...s5Start]];
        o.vx = 0; o.vy = 0;
        o.sx = 0; o.sy = 0;
        o.mx = 0; o.my = 0;
        o.t = 0;
        o.lastGradNorm = 0;
        o.lastStepNorm = 0;
        o.lastStep = [0, 0];
        o.lastEffectiveLr = 0;
    });

    s5_draw();
}

function s5_toggle() {
    s5Running = !s5Running;
    document.getElementById('s5-play').textContent = s5Running ? '⏸ Pause' : '▶ Race';
    if (s5Running) s5_tick();
}

function s5_tick() {
    if (!s5Running) return;

    s5Step++;
    const lr = 0.08;
    const beta1 = 0.9;
    const beta2 = 0.999;
    const eps = 1e-8;

    Object.entries(s5Optimizers).forEach(([name, o]) => {
        const [x, y] = o.path[o.path.length - 1];
        const gx = s5gx(x, y);
        const gy = s5gy(x, y);

        let nx = x;
        let ny = y;

        if (name === 'sgd') {
            nx = x - lr * gx;
            ny = y - lr * gy;
        } else if (name === 'momentum') {
            o.vx = 0.85 * o.vx + lr * gx;
            o.vy = 0.85 * o.vy + lr * gy;
            nx = x - o.vx;
            ny = y - o.vy;
        } else if (name === 'rmsprop') {
            o.sx = 0.9 * o.sx + 0.1 * gx * gx;
            o.sy = 0.9 * o.sy + 0.1 * gy * gy;
            nx = x - lr * gx / (Math.sqrt(o.sx) + eps);
            ny = y - lr * gy / (Math.sqrt(o.sy) + eps);
        } else if (name === 'adam') {
            o.t += 1;
            o.mx = beta1 * o.mx + (1 - beta1) * gx;
            o.my = beta1 * o.my + (1 - beta1) * gy;
            o.vx = beta2 * o.vx + (1 - beta2) * gx * gx;
            o.vy = beta2 * o.vy + (1 - beta2) * gy * gy;

            const mhx = o.mx / (1 - beta1 ** o.t);
            const mhy = o.my / (1 - beta1 ** o.t);
            const vhx = o.vx / (1 - beta2 ** o.t);
            const vhy = o.vy / (1 - beta2 ** o.t);

            nx = x - lr * mhx / (Math.sqrt(vhx) + eps);
            ny = y - lr * mhy / (Math.sqrt(vhy) + eps);
        }

        nx = clamp(nx, -3.5, 3.5);
        ny = clamp(ny, -2.5, 2.5);

        const stepX = nx - x;
        const stepY = ny - y;
        const gradNorm = Math.hypot(gx, gy);
        const stepNorm = Math.hypot(stepX, stepY);

        o.lastGradNorm = gradNorm;
        o.lastStepNorm = stepNorm;
        o.lastStep = [stepX, stepY];
        o.lastEffectiveLr = gradNorm > 1e-8 ? stepNorm / gradNorm : 0;
        o.path.push([nx, ny]);
    });

    s5_draw();

    if (s5Step < 300) {
        s5Raf = requestAnimationFrame(s5_tick);
    } else {
        s5Running = false;
        document.getElementById('s5-play').textContent = '▶ Race';
    }
}

function s5_draw() {
    const canvas = document.getElementById('c5');
    const { ctx, W, H } = dpr(canvas);
    darkBg(ctx, W, H);

    const xl = [-3.5, 3.5], yl = [-2.5, 2.5];
    const px = x => (x - xl[0]) / (xl[1] - xl[0]) * W;
    const py = y => (1 - (y - yl[0]) / (yl[1] - yl[0])) * H;

    const N = 80;
    const vals = [];
    let mn = Infinity, mx = -Infinity;

    for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
            const v = s5F(lerp(xl[0], xl[1], i / (N - 1)), lerp(yl[0], yl[1], j / (N - 1)));
            vals[j * N + i] = v;
            if (v < mn) mn = v;
            if (v > mx) mx = v;
        }
    }

    const cW = W / N, cH = H / N;
    for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
            const t = (vals[j * N + i] - mn) / (mx - mn);
            ctx.fillStyle = `rgb(${Math.round(8 + 30 * t)},${Math.round(12 + 60 * t)},${Math.round(20 + 120 * t)})`;
            ctx.fillRect(i * cW, j * cH, cW + 1, cH + 1);
        }
    }

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(px(0), py(0), 5, 0, Math.PI * 2);
    ctx.fill();
    label(ctx, 'minimum', px(0) + 10, py(0) - 8, '#fff', 10);

    const drawArrow = (x1, y1, x2, y2, color) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(px(x1), py(y1));
        ctx.lineTo(px(x2), py(y2));
        ctx.stroke();

        const angle = Math.atan2(py(y1) - py(y2), px(x2) - px(x1));
        const headLen = 8;
        ctx.beginPath();
        ctx.moveTo(px(x2), py(y2));
        ctx.lineTo(px(x2) - headLen * Math.cos(angle - Math.PI / 6), py(y2) + headLen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(px(x2) - headLen * Math.cos(angle + Math.PI / 6), py(y2) + headLen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    };

    Object.values(s5Optimizers).forEach(o => {
        if (o.path.length < 1) return;

        ctx.strokeStyle = o.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        o.path.forEach(([x, y], i) => {
            if (i === 0) ctx.moveTo(px(x), py(y));
            else ctx.lineTo(px(x), py(y));
        });
        ctx.stroke();

        const [lx, ly] = o.path[o.path.length - 1];
        ctx.fillStyle = o.color;
        ctx.beginPath();
        ctx.arc(px(lx), py(ly), 4, 0, Math.PI * 2);
        ctx.fill();

        if (o.path.length > 1) {
            const [px0, py0] = o.path[o.path.length - 2];
            drawArrow(px0, py0, lx, ly, o.color);
        }
    });

    const startX = s5Start[0], startY = s5Start[1];
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(px(startX), py(startY), 6, 0, Math.PI * 2);
    ctx.stroke();
    label(ctx, 'start', px(startX) + 8, py(startY) + 4, 'rgba(255,255,255,0.85)', 10);

    let yi = 16;
    Object.entries(s5Optimizers).forEach(([name, o]) => {
        const [lx, ly] = o.path[o.path.length - 1];
        ctx.fillStyle = o.color;
        ctx.font = "11px 'Fira Code'";
        ctx.fillText(
            `${o.label.padEnd(9)} L=${s5F(lx, ly).toFixed(3)} |g|=${o.lastGradNorm.toFixed(2)} |Δ|=${o.lastStepNorm.toFixed(2)} η_eff=${o.lastEffectiveLr.toFixed(3)}`,
            10,
            yi
        );
        yi += 15;
    });

    label(ctx, '✳ step arrow shows last update direction', 10, H - 28, 'rgba(255,255,255,0.55)', 10);
    label(ctx, `η=0.08  β₁=0.9  β₂=0.999  ε=1e-8`, 10, H - 10, 'rgba(255,255,255,0.45)', 10);

    label(ctx, `step: ${s5Step}`, W - 80, H - 10, 'rgba(255,255,255,0.55)', 11);
}

s5_reset();



// =====================================
//  SECTION 6 — BATCH STRATEGIES
//  improved: real training instead of synthetic noisy curves
// =====================================
let s6Running = false, s6Raf = null;
const s6History = { batch: [], mini: [], sgd: [] };
let s6Epoch = 0;
let s6Data = [];
let s6Models = null;
let s6BatchSize = 16;

function s6_makeData(n = 160) {
    const data = [];
    for (let i = 0; i < n; i++) {
        const x = Math.random() * 2 - 1;
        const y = Math.random() * 2 - 1;
        const label = (x * x + y * y > 0.35) ? 1 : 0;
        data.push({ x, y, label });
    }
    return data;
}

function s6_newModel() {
    return {
        w: [Math.random() * 0.2 - 0.1, Math.random() * 0.2 - 0.1],
        b: 0
    };
}

function s6_pred(model, x, y) {
    return sigmoid(model.w[0] * x + model.w[1] * y + model.b);
}

function s6_sampleBatch(size) {
    const batch = [];
    for (let i = 0; i < size; i++) {
        batch.push(s6Data[(Math.random() * s6Data.length) | 0]);
    }
    return batch;
}

function s6_step(model, batch, lr) {
    let gw0 = 0, gw1 = 0, gb = 0, loss = 0;

    for (const { x, y, label } of batch) {
        const p = s6_pred(model, x, y);
        const dz = p - label;

        gw0 += dz * x;
        gw1 += dz * y;
        gb += dz;

        loss += -(label * Math.log(p + 1e-8) + (1 - label) * Math.log(1 - p + 1e-8));
    }

    const inv = 1 / batch.length;
    model.w[0] -= lr * gw0 * inv;
    model.w[1] -= lr * gw1 * inv;
    model.b -= lr * gb * inv;

    return loss * inv;
}

function s6_reset() {
    s6Running = false;
    cancelAnimationFrame(s6Raf);
    document.getElementById('s6-play').textContent = '▶ Train';

    s6Epoch = 0;
    s6Data = s6_makeData();
    s6Models = {
        batch: s6_newModel(),
        mini: s6_newModel(),
        sgd: s6_newModel(),
    };

    s6History.batch = [];
    s6History.mini = [];
    s6History.sgd = [];
    document.getElementById('s6-batch-label').textContent = s6BatchSize;
    const legendMini = document.getElementById('s6-legend-mini-size');
    if (legendMini) legendMini.textContent = s6BatchSize;
    s6_draw();
}

function s6_batchChange() {
    s6BatchSize = Math.max(1, parseInt(document.getElementById('s6-batch-size').value, 10));
    document.getElementById('s6-batch-label').textContent = s6BatchSize;
    const legendMini = document.getElementById('s6-legend-mini-size');
    if (legendMini) legendMini.textContent = s6BatchSize;
    s6_reset();
}

function s6_toggle() {
    s6Running = !s6Running;
    document.getElementById('s6-play').textContent = s6Running ? '⏸ Pause' : '▶ Train';
    if (s6Running) s6_tick();
}

function s6_tick() {
    if (!s6Running) return;

    s6Epoch++;
    const baseLr = 0.2;
    const noiseScale = +document.getElementById('s6-noise').value * 0.01;
    const lr = baseLr * (1 - 0.35 * noiseScale);

    s6History.batch.push(s6_step(s6Models.batch, s6Data, lr));
    s6History.mini.push(s6_step(s6Models.mini, s6_sampleBatch(s6BatchSize), lr));
    s6History.sgd.push(s6_step(s6Models.sgd, s6_sampleBatch(1), lr));

    s6_draw();

    if (s6Epoch < 200) {
        s6Raf = requestAnimationFrame(s6_tick);
    } else {
        s6Running = false;
        document.getElementById('s6-play').textContent = '▶ Train';
    }
}

function s6_draw() {
    const canvas = document.getElementById('c6');
    const { ctx, W, H } = dpr(canvas);
    darkBg(ctx, W, H);
    drawDarkGrid(ctx, W, H, 50);

    const maxE = 200;
    const allVals = [...s6History.batch, ...s6History.mini, ...s6History.sgd];
    const maxL = Math.max(1.2, ...allVals, 2.5);
    const px = e => (e / maxE) * W;
    const py = l => (1 - l / maxL) * (H - 40) + 20;

    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, py(0));
    ctx.lineTo(W, py(0));
    ctx.stroke();

    label(ctx, 'Loss', 4, 18, 'rgba(255,255,255,0.55)', 11);
    label(ctx, 'Epochs →', W - 70, H - 8, 'rgba(255,255,255,0.55)', 11);

    const series = [
        { key: 'batch', color: '#4ade80', name: 'Full batch' },
        { key: 'mini', color: '#fbbf24', name: 'Mini-batch' },
        { key: 'sgd', color: '#f87171', name: 'SGD' },
    ];

    series.forEach(({ key, color }) => {
        const hist = s6History[key];
        if (hist.length < 2) return;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        hist.forEach((v, i) => {
            if (i === 0) ctx.moveTo(px(i + 1), py(v));
            else ctx.lineTo(px(i + 1), py(v));
        });
        ctx.stroke();
    });

    for (let v = 0; v <= Math.ceil(maxL); v += 1) {
        label(ctx, v.toFixed(0), 4, py(v) + 4, 'rgba(255,255,255,0.3)', 10);
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(30, py(v));
        ctx.lineTo(W, py(v));
        ctx.stroke();
    }

    let yLegend = 18;
    series.forEach(({ key, color, name }) => {
        const hist = s6History[key];
        if (!hist.length) return;
        ctx.fillStyle = color;
        ctx.font = "11px 'Fira Code'";
        ctx.fillText(`${name}: ${hist[hist.length - 1].toFixed(3)}`, W - 180, yLegend);
        yLegend += 14;
    });

    label(ctx, `mini-batch size B = ${s6BatchSize}`, 10, 34, 'rgba(255,255,255,0.55)', 10);
    label(ctx, `N = ${s6Data.length}`, 10, 48, 'rgba(255,255,255,0.45)', 10);

    if (s6Epoch > 0) {
        label(ctx, `epoch: ${s6Epoch}`, W - 90, H - 20, 'rgba(255,255,255,0.55)', 11);
    }
}

s6_reset();



// =====================================
//  SECTION 7 — INITIALIZATION
// =====================================
let s7Mode = 'xavier';

const s7Info = {
    zero: { eq: 'W = 0 — symmetry breaking failure', mu: 0, sigma: 0.0001, type: 'zero' },
    large: { eq: 'W ~ N(0, 2²) — exploding signals', mu: 0, sigma: 2, type: 'normal' },
    xavier: { eq: 'Xavier: σ = √(2/(fanᵢₙ+fanₒᵤₜ))', mu: 0, sigma: Math.sqrt(2 / 24), type: 'normal' },
    he: { eq: 'He: σ = √(2/fanᵢₙ)', mu: 0, sigma: Math.sqrt(2 / 8), type: 'normal' },
    bn: { eq: 'BatchNorm: normalizes activations per mini-batch', mu: 0, sigma: Math.sqrt(2 / 24), type: 'bn' },
};

function s7_set(mode) {
    s7Mode = mode;
    document.querySelectorAll('#s7 .controls button').forEach(b => b.classList.remove('selected'));
    document.querySelector(`#s7 .controls button[onclick*="${mode}"]`).classList.add('selected');
    document.querySelector('#s7-info span').textContent = s7Info[mode].eq;
    s7_draw();
}

function s7_draw() {
    const canvas = document.getElementById('c7');
    const { ctx, W, H } = dpr(canvas);
    darkBg(ctx, W, H);

    const cfg = s7Info[s7Mode];
    const N = 2000;
    const samples = Array.from({ length: N }, () => {
        if (cfg.type === 'zero') return 0;
        const u1 = Math.random(), u2 = Math.random();
        return cfg.mu + cfg.sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    });

    const nBins = 60;
    const lo = -3, hi = 3;
    const bins = new Array(nBins).fill(0);
    samples.forEach(s => {
        const idx = Math.floor((clamp(s, lo, hi) - lo) / (hi - lo) * nBins);
        if (idx >= 0 && idx < nBins) bins[idx]++;
    });
    const maxBin = Math.max(...bins);

    const bW = W / nBins;
    const histH = H * 0.55;
    const offY = H * 0.12;

    bins.forEach((b, i) => {
        const t = b / maxBin;
        const bH = t * histH;
        ctx.fillStyle = cfg.type === 'zero' ? '#f87171' : cfg.sigma > 0.8 ? '#fb923c' : cfg.sigma < 0.05 ? '#f87171' : '#4ade80';
        ctx.fillRect(i * bW, offY + histH - bH, bW - 1, bH);
    });

    if (cfg.type === 'bn') {
        const layers = 8;
        const lW = W / layers;
        label(ctx, 'Activation distribution across layers →', 10, H * 0.72, 'rgba(255,255,255,0.5)', 10);
        for (let l = 0; l < layers; l++) {
            const bH2 = H * 0.18;
            const cx = l * lW + lW / 2;
            const cy = H * 0.88;
            ctx.strokeStyle = 'rgba(74,222,128,0.8)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let x = cx - lW * 0.4; x <= cx + lW * 0.4; x += 1) {
                const v = (x - cx) / (lW * 0.1);
                const y = cy - bH2 * Math.exp(-0.5 * v * v);
                x === cx - lW * 0.4 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }

    const axY = offY + histH + 8;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, axY); ctx.lineTo(W, axY); ctx.stroke();
    [-2, -1, 0, 1, 2].forEach(v => {
        const x = (v - lo) / (hi - lo) * W;
        label(ctx, v.toString(), x - 4, axY + 14, 'rgba(255,255,255,0.4)', 10);
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.beginPath(); ctx.moveTo(x, offY); ctx.lineTo(x, axY); ctx.stroke();
    });

    if (cfg.sigma > 0.001) {
        label(ctx, `σ = ${cfg.sigma.toFixed(3)}`, 10, offY - 4, 'rgba(255,255,255,0.6)', 11);
    } else {
        label(ctx, 'σ ≈ 0 — all zeros, symmetry broken', 10, offY - 4, '#f87171', 11);
    }
}

let s7dRunning = false, s7dRaf = null, s7dStep = 0, s7dFrame = 0, s7dP = 0.3;
const s7dInputs = [1.0, 0.6, -0.4, 0.3];
const s7dW1 = [
    [0.8, -0.3, 0.5, 0.2],
    [0.2, 0.5, -0.4, 0.3],
    [-0.2, 0.4, 0.3, -0.5],
    [0.6, -0.2, 0.2, 0.4],
    [0.3, 0.1, 0.6, -0.3],
    [-0.1, 0.5, 0.4, 0.2],
];
const s7dB1 = [0.1, 0.0, 0.05, -0.05, 0.08, 0.02];
const s7dW2 = [0.4, -0.35, 0.25, 0.3, -0.15, 0.2];
const s7dB2 = 0.05;
let s7dMask = [];

function s7d_pChange() {
    s7dP = parseFloat(document.getElementById('s7d-p').value);
    document.getElementById('s7d-p-label').textContent = s7dP.toFixed(2);
    s7d_reset();
}

function s7d_sampleMask() {
    s7dMask = s7dW1.map(() => Math.random() >= s7dP);
    if (!s7dMask.some(Boolean)) {
        s7dMask[Math.floor(Math.random() * s7dMask.length)] = true;
    }
}

function s7d_reset() {
    s7dRunning = false;
    cancelAnimationFrame(s7dRaf);
    s7dStep = 0;
    s7dFrame = 0;
    document.getElementById('s7d-play').textContent = '▶ Animate';
    s7d_sampleMask();
    s7d_draw();
}

function s7d_toggle() {
    s7dRunning = !s7dRunning;
    document.getElementById('s7d-play').textContent = s7dRunning ? '⏸ Pause' : '▶ Animate';
    if (s7dRunning) s7d_tick();
}

function s7d_tick() {
    if (!s7dRunning) return;
    s7dFrame += 1;
    if (s7dFrame % 15 === 0) {
        s7dStep += 1;
        s7d_sampleMask();
        s7d_draw();
        if (s7dStep >= 80) {
            s7dRunning = false;
            document.getElementById('s7d-play').textContent = '▶ Animate';
            return;
        }
    }
    s7dRaf = requestAnimationFrame(s7d_tick);
}

function s7d_draw() {
    const canvas = document.getElementById('c7d');
    const { ctx, W, H } = dpr(canvas);
    darkBg(ctx, W, H);
    drawDarkGrid(ctx, W, H, 36);

    const x0 = 110;
    const x1 = W * 0.45;
    const x2 = W - 120;
    const inY = [H * 0.18, H * 0.36, H * 0.54, H * 0.72];
    const hidY = Array.from({ length: 6 }, (_, i) => H * (0.12 + i * 0.12));
    const outY = H * 0.5;

    const hidden = s7dW1.map((w, i) => {
        const z = w.reduce((sum, v, j) => sum + v * s7dInputs[j], 0) + s7dB1[i];
        return Math.max(0, z);
    });
    const masked = hidden.map((h, i) => s7dMask[i] ? h / (1 - s7dP) : 0);
    const output = masked.reduce((sum, h, i) => sum + h * s7dW2[i], s7dB2);

    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    for (let i = 0; i < inY.length; i++) {
        for (let j = 0; j < hidY.length; j++) {
            ctx.beginPath();
            ctx.moveTo(x0 + 24, inY[i]);
            ctx.lineTo(x1 - 24, hidY[j]);
            ctx.stroke();
        }
    }
    for (let j = 0; j < hidY.length; j++) {
        const active = s7dMask[j];
        ctx.strokeStyle = active ? 'rgba(74,222,128,0.45)' : 'rgba(248,113,113,0.2)';
        for (let k = 0; k < 1; k++) {
            ctx.beginPath();
            ctx.moveTo(x1 + 24, hidY[j]);
            ctx.lineTo(x2 - 24, outY);
            ctx.stroke();
        }
    }

    ctx.fillStyle = '#fff';
    ctx.font = "12px 'Fira Code'";
    s7dInputs.forEach((val, i) => {
        ctx.beginPath();
        ctx.arc(x0, inY[i], 18, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.fillText(`x${i + 1}`, x0 - 8, inY[i] + 4);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillText(val.toFixed(2), x0 - 20, inY[i] + 22);
    });

    hidY.forEach((y, i) => {
        const active = s7dMask[i];
        ctx.beginPath();
        ctx.arc(x1, y, 22, 0, Math.PI * 2);
        ctx.fillStyle = active ? 'rgba(74,222,128,0.9)' : 'rgba(248,113,113,0.25)';
        ctx.fill();
        ctx.strokeStyle = active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)';
        ctx.stroke();
        ctx.fillStyle = active ? '#0f172a' : 'rgba(255,255,255,0.35)';
        ctx.fillText(`h${i + 1}`, x1 - 11, y + 4);
        ctx.fillStyle = active ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.35)';
        ctx.fillText(active ? hidden[i].toFixed(2) : '0.00', x1 + 28, y + 5);
        if (!active) {
            ctx.strokeStyle = 'rgba(248,113,113,0.8)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x1 - 12, y - 12);
            ctx.lineTo(x1 + 12, y + 12);
            ctx.moveTo(x1 + 12, y - 12);
            ctx.lineTo(x1 - 12, y + 12);
            ctx.stroke();
        }
    });

    ctx.beginPath();
    ctx.arc(x2, outY, 28, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(96,165,250,0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.fillText('ŷ', x2 - 8, outY + 6);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText(output.toFixed(2), x2 + 36, outY + 5);

    label(ctx, `dropout p = ${s7dP.toFixed(2)}`, 14, 24, 'rgba(255,255,255,0.7)', 11);
    label(ctx, `step ${s7dStep}`, 14, 42, 'rgba(255,255,255,0.6)', 10);
    label(ctx, `kept / dropped mask`, 14, 60, 'rgba(255,255,255,0.45)', 10);
}

s7_draw();
s7d_reset();


// =====================================
//  SECTION 8 — DECISION BOUNDARIES
//  improved: correct mini-batch backprop + probability field
// =====================================
let s8Running = false, s8Raf = null, s8Epoch = 0;
let s8Model = null, s8Data = null, s8H = 8, s8Layers = 1;

function s8_probColor(p) {
    const r = Math.round(248 * (1 - p) + 96 * p);
    const g = Math.round(113 * (1 - p) + 165 * p);
    const b = Math.round(113 * (1 - p) + 250 * p);
    return `rgba(${r},${g},${b},0.22)`;
}

function s8_makeData(type) {
    const data = [];
    const noise = 0.06;
    if (type === 'blobs') {
        for (let cls = 0; cls < 2; cls++) {
            const cx = cls === 0 ? -0.7 : 0.7;
            const cy = cls === 0 ? -0.3 : 0.3;
            for (let i = 0; i < 80; i++) {
                data.push({
                    x: cx + (Math.random() - 0.5) * 0.4,
                    y: cy + (Math.random() - 0.5) * 0.4,
                    c: cls
                });
            }
        }
    } else if (type === 'moons') {
        for (let cls = 0; cls < 2; cls++) {
            for (let i = 0; i < 80; i++) {
                const t = Math.PI * (i / 80);
                if (cls === 0) {
                    const dx = 0.8 * Math.cos(t) + 0.4 + (Math.random() - 0.5) * noise;
                    const dy = 0.8 * Math.sin(t) - 0.35 + (Math.random() - 0.5) * noise;
                    data.push({ x: dx, y: dy, c: cls });
                } else {
                    const dx = 0.8 * Math.cos(t) + 0.15 + (Math.random() - 0.5) * noise;
                    const dy = -0.8 * Math.sin(t) - 0.05 + (Math.random() - 0.5) * noise;
                    data.push({ x: dx, y: dy, c: cls });
                }
            }
        }
    } else {
        for (let cls = 0; cls < 2; cls++) {
            const radius = cls === 0 ? 0.85 : 0.35;
            const offset = cls === 0 ? 0 : 0;
            for (let i = 0; i < 100; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = radius + (Math.random() - 0.5) * 0.08;
                const x = r * Math.cos(angle) + offset;
                const y = r * Math.sin(angle) + offset;
                data.push({ x, y, c: cls });
            }
        }
    }
    return data;
}

function s8_reset() {
    s8Running = false;
    cancelAnimationFrame(s8Raf);
    document.getElementById('s8-play').textContent = '▶ Train';
    s8Epoch = 0;
    s8H = parseInt(document.getElementById('s8-units').value, 10);
    s8Layers = parseInt(document.getElementById('s8-layers').value, 10);
    const dataType = document.getElementById('s8-dataset').value;
    document.getElementById('s8-lr-label').textContent = parseFloat(document.getElementById('s8-lr').value).toFixed(3);

    s8Data = s8_makeData(dataType);

    const activation = document.getElementById('s8-activation').value;
    const architecture = [2, ...Array(s8Layers).fill(s8H), 1];
    s8Model = new MLP(architecture, activation);

    document.getElementById('s8-epoch').textContent = 'Epoch 0';
    document.getElementById('s8-loss').textContent = 'Loss: -';
    s8_draw();
}

function s8_lrChange() {
    const lr = parseFloat(document.getElementById('s8-lr').value);
    document.getElementById('s8-lr-label').textContent = lr.toFixed(3);
}

function s8_toggle() {
    s8Running = !s8Running;
    document.getElementById('s8-play').textContent = s8Running ? '⏸ Pause' : '▶ Train';
    if (s8Running) s8_tick();
}

function s8_tick() {
    if (!s8Running) return;
    s8Epoch += 1;
    const lr = parseFloat(document.getElementById('s8-lr').value);
    const optimizer = document.getElementById('s8-optimizer').value;
    const batchSize = parseInt(document.getElementById('s8-batch-size')?.value || 8, 10);
    s8Model.train(s8Data.map(d => [d.x, d.y]), s8Data.map(d => d.c), {
        lr,
        epochs: 1,
        batchSize,
        optimizer,
        beta1: 0.9,
        beta2: 0.999,
        eps: 1e-8
    });
    const loss = s8Data.reduce((acc, d) => {
        let p = s8Model.predict([d.x, d.y]);
        p = Math.max(1e-7, Math.min(1 - 1e-7, p));
        return acc + -(d.c * Math.log(p) + (1 - d.c) * Math.log(1 - p));
    }, 0) / s8Data.length;
    document.getElementById('s8-epoch').textContent = `Epoch ${s8Epoch}`;
    document.getElementById('s8-loss').textContent = `Loss: ${loss.toFixed(3)}`;
    s8_draw();
    if (s8Epoch < 500) { s8Raf = requestAnimationFrame(s8_tick); }
    else { s8Running = false; document.getElementById('s8-play').textContent = '▶ Train'; }
}

function s8_draw() {
    const canvas = document.getElementById('c8');
    const { ctx, W, H } = dpr(canvas);
    darkBg(ctx, W, H);
    if (!s8Data) { s8_reset(); return; }

    const scale = Math.min(W, H) * 0.42;
    const cx = W / 2, cy = H / 2;
    const px = x => cx + x * scale;
    const py = y => cy - y * scale;

    const res = 80;
    const cW = W / res, cH = H / res;

    for (let j = 0; j < res; j++) {
        for (let i = 0; i < res; i++) {
            const wx = (i / (res - 1)) * 2 - 1;
            const wy = 1 - (j / (res - 1)) * 2;
            const p = s8Model ? s8Model.predict([wx, wy]) : 0.5;
            ctx.fillStyle = s8_probColor(p);
            ctx.fillRect(i * cW, j * cH, cW + 1, cH + 1);
        }
    }

    for (let j = 0; j < res - 1; j++) {
        for (let i = 0; i < res - 1; i++) {
            const x1 = (i / (res - 1)) * 2 - 1;
            const y1 = 1 - (j / (res - 1)) * 2;
            const x2 = ((i + 1) / (res - 1)) * 2 - 1;
            const y2 = 1 - ((j + 1) / (res - 1)) * 2;
            const p1 = s8Model ? s8Model.predict([x1, y1]) : 0.5;
            const p2 = s8Model ? s8Model.predict([x2, y1]) : 0.5;
            const p3 = s8Model ? s8Model.predict([x1, y2]) : 0.5;
            if ((p1 < 0.5) !== (p2 < 0.5) || (p1 < 0.5) !== (p3 < 0.5)) {
                ctx.fillStyle = 'rgba(255,255,255,0.75)';
                ctx.fillRect(i * cW, j * cH, 2, 2);
            }
        }
    }

    s8Data.forEach(({ x, y, c }) => {
        ctx.fillStyle = c === 0 ? 'rgba(248,113,113,0.9)' : 'rgba(96,165,250,0.9)';
        ctx.beginPath(); ctx.arc(px(x), py(y), 4, 0, Math.PI * 2);
        ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 0.5; ctx.stroke();
    });
}

s8_reset();

// =====================================
//  SECTION 9 — HIDDEN REPRESENTATIONS
// =====================================
let s9Running = false, s9Raf = null, s9Phase = 0, s9T = 0;
const s9Layers = ['Input space', 'After Layer 1', 'After Layer 2', 'After Layer 3', 'Output space'];

function s9_reset() {
    s9Running = false; cancelAnimationFrame(s9Raf);
    document.getElementById('s9-play').textContent = '▶ Animate layers';
    s9Phase = 0; s9T = 0;
    document.getElementById('s9-layer-label').textContent = s9Layers[0];
    s9_draw(0);
}

function s9_toggle() {
    s9Running = !s9Running;
    document.getElementById('s9-play').textContent = s9Running ? '⏸ Pause' : '▶ Animate layers';
    if (s9Running) s9_tick();
}

function s9_tick() {
    if (!s9Running) return;
    s9T += 0.018;
    if (s9T >= 1) { s9T = 0; s9Phase = (s9Phase + 1) % s9Layers.length; }
    document.getElementById('s9-layer-label').textContent = s9Layers[s9Phase];
    s9_draw(s9Phase + s9T);
    s9Raf = requestAnimationFrame(s9_tick);
}

const s9Points = [];
for (let cls = 0; cls < 3; cls++) {
    for (let i = 0; i < 40; i++) {
        const t = i / 40 * 3 * Math.PI + (cls * 2 * Math.PI / 3);
        const r = 0.15 + 0.75 * (i / 40);
        s9Points.push({ x0: r * Math.cos(t), y0: r * Math.sin(t), cls });
    }
}

function s9_transform(pts, phase) {
    return pts.map(p => {
        const t = Math.min(phase, 4) / 4;
        const angle = t * p.cls * 2 * Math.PI / 3 * 0.8;
        const scale = 1 + t * 0.3;
        const clsAngle = p.cls * 2 * Math.PI / 3;
        const tx = t * 0.6 * Math.cos(clsAngle), ty = t * 0.6 * Math.sin(clsAngle);
        const rx = p.x0 * Math.cos(angle) - p.y0 * Math.sin(angle);
        const ry = p.x0 * Math.sin(angle) + p.y0 * Math.cos(angle);
        return { x: lerp(p.x0, rx * scale + tx, t), y: lerp(p.y0, ry * scale + ty, t), cls: p.cls };
    });
}

function s9_draw(phase) {
    const canvas = document.getElementById('c9');
    const { ctx, W, H } = dpr(canvas);
    darkBg(ctx, W, H);

    const cols = ['#f87171', '#4ade80', '#60a5fa'];
    const pts = s9_transform(s9Points, phase);
    const scale = Math.min(W, H) * 0.36;
    const cx = W / 2, cy = H / 2;

    const draw = function (ptSet, ox, label_str) {
        label(ctx, label_str, ox - 50, 20, 'rgba(255,255,255,0.5)', 11);
        ptSet.forEach(({ x, y, cls }) => {
            ctx.fillStyle = cols[cls];
            ctx.beginPath(); ctx.arc(ox + x * scale, cy + y * scale, 4, 0, Math.PI * 2);
            ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 0.5; ctx.stroke();
        });
    };

    draw(s9Points.map(p => ({ ...p })), W * 0.27, 'input (layer 0)');
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2, 20); ctx.lineTo(W / 2, H - 20); ctx.stroke();
    draw(pts, W * 0.73, s9Layers[Math.min(Math.floor(phase), 4)]);

    const sep = Math.min(phase / 4, 1);
    label(ctx, `separability: ${(sep * 100).toFixed(0)}%`, W - 130, H - 14, 'rgba(255,255,255,0.5)', 11);

    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1.5;
    const arY = H / 2;
    ctx.beginPath(); ctx.moveTo(W * 0.42, arY); ctx.lineTo(W * 0.58, arY); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.moveTo(W * 0.58, arY); ctx.lineTo(W * 0.56, arY - 5); ctx.lineTo(W * 0.56, arY + 5); ctx.closePath(); ctx.fill();
    label(ctx, 'f(·)', W / 2 - 7, arY - 6, 'rgba(255,255,255,0.4)', 10);
}

s9_draw(0);

// =====================================
//  SECTION 10 — CONVOLUTION
// =====================================
let s10Running = false, s10Raf = null, s10KernelName = 'edge_h';
let s10Pos = [0, 0], s10Speed = 4, s10Step10 = 0;

const s10Kernels = {
    edge_h: { k: [[-1, -1, -1], [0, 0, 0], [1, 1, 1]], name: 'horizontal edge detector' },
    edge_v: { k: [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]], name: 'vertical edge detector' },
    blur: { k: [[1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9]], name: 'box blur (average)' },
    sharpen: { k: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], name: 'sharpening filter' },
};

const s10Img = [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
];

function s10_setKernel(name) { s10KernelName = name; s10_reset(); }
function s10_reset() {
    s10Running = false; cancelAnimationFrame(s10Raf);
    document.getElementById('s10-play').textContent = '▶ Slide';
    s10Pos = [0, 0]; s10Step10 = 0;
    s10_draw(0, 0);
}
function s10_toggle() {
    s10Running = !s10Running;
    document.getElementById('s10-play').textContent = s10Running ? '⏸ Pause' : '▶ Slide';
    if (s10Running) s10_tick();
}
function s10_tick() {
    if (!s10Running) return;
    const spd = +document.getElementById('s10-speed').value;
    s10Step10++;
    if (s10Step10 % Math.max(1, 11 - spd) === 0) {
        s10Pos[1]++;
        if (s10Pos[1] > 5) { s10Pos[1] = 0; s10Pos[0]++; }
        if (s10Pos[0] > 5) { s10Pos = [0, 0]; s10Running = false; document.getElementById('s10-play').textContent = '▶ Slide'; s10_draw(0, 0); return; }
    }
    s10_draw(s10Pos[0], s10Pos[1]);
    s10Raf = requestAnimationFrame(s10_tick);
}

function s10_conv(row, col, kernel) {
    let sum = 0;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
        sum += s10Img[row + i][col + j] * kernel[i][j];
    }
    return sum;
}

function s10_draw(kr, kc) {
    const canvas = document.getElementById('c10');
    const { ctx, W, H } = dpr(canvas);
    darkBg(ctx, W, H);

    const kernelObj = s10Kernels[s10KernelName];
    const kernel = kernelObj.k;
    const cellSize = 44;
    const pad = 24;

    const out = [];
    let outMin = Infinity, outMax = -Infinity;
    for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) {
        const v = s10_conv(r, c, kernel);
        out.push(v);
        if (v < outMin) outMin = v;
        if (v > outMax) outMax = v;
    }

    const imgX = pad, imgY = (H - 8 * cellSize) / 2;
    label(ctx, 'input (8×8)', imgX, imgY - 10, 'rgba(255,255,255,0.5)', 10);
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
        const v = s10Img[r][c];
        ctx.fillStyle = `rgb(${Math.round(v * 220)},${Math.round(v * 220)},${Math.round(v * 220)})`;
        ctx.fillRect(imgX + c * cellSize, imgY + r * cellSize, cellSize - 2, cellSize - 2);
        if (r >= kr && r < kr + 3 && c >= kc && c < kc + 3) {
            ctx.fillStyle = 'rgba(251,191,36,0.25)';
            ctx.fillRect(imgX + c * cellSize, imgY + r * cellSize, cellSize - 2, cellSize - 2);
        }
    }
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
    ctx.strokeRect(imgX + kc * cellSize, imgY + kr * cellSize, 3 * cellSize - 2, 3 * cellSize - 2);

    const kX = imgX + 8 * cellSize + 40, kY = (H - 3 * cellSize) / 2;
    label(ctx, 'kernel (3×3)', kX, kY - 10, 'rgba(255,255,255,0.5)', 10);
    label(ctx, kernelObj.name, kX, kY - 24, 'rgba(251,191,36,0.7)', 9);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
        const v = kernel[r][c];
        const t = clamp((v + 2) / 4, 0, 1);
        ctx.fillStyle = coolwarm(2 * t - 1);
        ctx.fillRect(kX + c * cellSize, kY + r * cellSize, cellSize - 2, cellSize - 2);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = "11px 'Fira Code'"; ctx.textAlign = 'center';
        ctx.fillText(v.toFixed(2), kX + c * cellSize + cellSize / 2 - 1, kY + r * cellSize + cellSize / 2 + 4);
        ctx.textAlign = 'left';
    }

    const arX = kX + 3 * cellSize + 20;
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(arX, H / 2); ctx.lineTo(arX + 30, H / 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath(); ctx.moveTo(arX + 30, H / 2); ctx.lineTo(arX + 25, H / 2 - 4); ctx.lineTo(arX + 25, H / 2 + 4); ctx.closePath(); ctx.fill();

    const outX = arX + 40, outY = (H - 6 * cellSize) / 2;
    label(ctx, 'feature map (6×6)', outX, outY - 10, 'rgba(255,255,255,0.5)', 10);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) {
        const v = out[r * 6 + c];
        const t = (v - outMin) / (outMax - outMin + 0.001);
        ctx.fillStyle = `rgb(${Math.round(lerp(20, 220, t))},${Math.round(lerp(40, 180, t))},${Math.round(lerp(60, 60, t))})`;
        ctx.fillRect(outX + c * cellSize, outY + r * cellSize, cellSize - 2, cellSize - 2);
        if (r === kr && c === kc) {
            ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2.5;
            ctx.strokeRect(outX + c * cellSize, outY + r * cellSize, cellSize - 2, cellSize - 2);
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.font = "11px 'Fira Code'"; ctx.textAlign = 'center';
            ctx.fillText(out[kr * 6 + kc].toFixed(1), outX + c * cellSize + cellSize / 2 - 1, outY + r * cellSize + cellSize / 2 + 4);
            ctx.textAlign = 'left';
        }
    }

    label(ctx, `position (${kr},${kc}) → ${s10_conv(kr, kc, kernel).toFixed(2)}`, outX, H - 12, 'rgba(255,255,255,0.5)', 10);
}

s10_draw(0, 0);

// =====================================
//  SECTION 11 — CNN ON DIGITS
// =====================================
let s11Drawing = false;
const digitCanvas = document.getElementById('digitCanvas');
const dctx = digitCanvas.getContext('2d');
dctx.fillStyle = '#000'; dctx.fillRect(0, 0, 140, 140);
dctx.strokeStyle = '#fff'; dctx.lineWidth = 10; dctx.lineCap = 'round';

let s11LastX, s11LastY;
digitCanvas.addEventListener('mousedown', e => {
    s11Drawing = true;
    const r = digitCanvas.getBoundingClientRect();
    s11LastX = e.clientX - r.left; s11LastY = e.clientY - r.top;
});
digitCanvas.addEventListener('mousemove', e => {
    if (!s11Drawing) return;
    const r = digitCanvas.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    dctx.beginPath(); dctx.moveTo(s11LastX, s11LastY); dctx.lineTo(x, y); dctx.stroke();
    s11LastX = x; s11LastY = y;
});
digitCanvas.addEventListener('mouseup', () => s11Drawing = false);
digitCanvas.addEventListener('mouseleave', () => s11Drawing = false);
digitCanvas.addEventListener('touchstart', e => {
    e.preventDefault(); s11Drawing = true;
    const r = digitCanvas.getBoundingClientRect(), t = e.touches[0];
    s11LastX = t.clientX - r.left; s11LastY = t.clientY - r.top;
}, { passive: false });
digitCanvas.addEventListener('touchmove', e => {
    e.preventDefault(); if (!s11Drawing) return;
    const r = digitCanvas.getBoundingClientRect(), t = e.touches[0];
    const x = t.clientX - r.left, y = t.clientY - r.top;
    dctx.beginPath(); dctx.moveTo(s11LastX, s11LastY); dctx.lineTo(x, y); dctx.stroke();
    s11LastX = x; s11LastY = y;
}, { passive: false });
digitCanvas.addEventListener('touchend', () => s11Drawing = false);

function s11_clear() {
    dctx.fillStyle = '#000'; dctx.fillRect(0, 0, 140, 140);
    document.getElementById('fmap1').innerHTML = '';
    document.getElementById('fmap2').innerHTML = '';
    const c = document.getElementById('c11out');
    const ctx2 = c.getContext('2d');
    ctx2.clearRect(0, 0, c.width, c.height);
}

// Layer-1 edge/stroke kernels — oriented Sobel + Laplacian variants
const s11Kernels = [
    { k: [[1, 0, -1], [2, 0, -2], [1, 0, -1]], label: 'Sobel X' },
    { k: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]], label: 'Sobel Y' },
    { k: [[-1, -1, 0], [-1, 0, 1], [0, 1, 1]], label: '45° edge' },
    { k: [[0, 1, 1], [-1, 0, 1], [-1, -1, 0]], label: '135° edge' },
    { k: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]], label: 'Laplacian' },
    { k: [[0, -1, 0], [-1, 4, -1], [0, -1, 0]], label: 'LoG' },
    { k: [[1, 1, 1], [0, 0, 0], [-1, -1, -1]], label: 'Horiz edge' },
    { k: [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]], label: 'Vert edge' },
];

// ── Preprocessing helpers ──────────────────────────────────────────────────

// Gaussian blur (3×3, σ≈0.85) applied in-place to a flat Float32 array
function s11_blur(img, W, H) {
    const k = [1, 2, 1, 2, 4, 2, 1, 2, 1];
    const out = new Float32Array(W * H);
    for (let r = 1; r < H - 1; r++) for (let c = 1; c < W - 1; c++) {
        let s = 0;
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++)
            s += img[(r + dr) * W + (c + dc)] * k[(dr + 1) * 3 + (dc + 1)];
        out[r * W + c] = s / 16;
    }
    return out;
}

// Crop bounding box, center on a square canvas, rescale to target size
function s11_cropAndCenter(gray, srcW, srcH, dstSize) {
    // find bounding box of non-zero pixels
    let minR = srcH, maxR = 0, minC = srcW, maxC = 0;
    for (let r = 0; r < srcH; r++) for (let c = 0; c < srcW; c++) {
        if (gray[r * srcW + c] > 0.05) {
            if (r < minR) minR = r; if (r > maxR) maxR = r;
            if (c < minC) minC = c; if (c > maxC) maxC = c;
        }
    }
    if (maxR <= minR || maxC <= minC) return new Float32Array(dstSize * dstSize); // empty

    const bbox_h = maxR - minR + 1, bbox_w = maxC - minC + 1;
    const side = Math.max(bbox_h, bbox_w);
    // add 20% margin
    const margin = Math.round(side * 0.2);
    const padded = side + 2 * margin;

    // draw into padded square, centred
    const tmp = new Float32Array(padded * padded);
    const offR = margin + Math.round((side - bbox_h) / 2);
    const offC = margin + Math.round((side - bbox_w) / 2);
    for (let r = minR; r <= maxR; r++) for (let c = minC; c <= maxC; c++)
        tmp[(offR + r - minR) * padded + (offC + c - minC)] = gray[r * srcW + c];

    // bilinear downsample to dstSize × dstSize
    const out = new Float32Array(dstSize * dstSize);
    const scale = padded / dstSize;
    for (let r = 0; r < dstSize; r++) for (let c = 0; c < dstSize; c++) {
        const sr = r * scale, sc = c * scale;
        const r0 = Math.floor(sr), c0 = Math.floor(sc);
        const r1 = Math.min(r0 + 1, padded - 1), c1 = Math.min(c0 + 1, padded - 1);
        const fr = sr - r0, fc = sc - c0;
        out[r * dstSize + c] =
            tmp[r0 * padded + c0] * (1 - fr) * (1 - fc) +
            tmp[r0 * padded + c1] * (1 - fr) * fc +
            tmp[r1 * padded + c0] * fr * (1 - fc) +
            tmp[r1 * padded + c1] * fr * fc;
    }
    return out;
}

// Apply one 3×3 kernel with ReLU, return flat array of size (S-2)×(S-2)
function s11_conv2d(img, S, kernel) {
    const O = S - 2;
    const out = new Float32Array(O * O);
    for (let r = 1; r < S - 1; r++) for (let c = 1; c < S - 1; c++) {
        let s = 0;
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++)
            s += img[(r + dr) * S + (c + dc)] * kernel[dr + 1][dc + 1];
        out[(r - 1) * O + (c - 1)] = Math.max(0, s);
    }
    return out;
}

// 2×2 max-pool, return flat array of half size
function s11_maxpool(img, S) {
    const O = Math.floor(S / 2);
    const out = new Float32Array(O * O);
    for (let r = 0; r < O; r++) for (let c = 0; c < O; c++) {
        out[r * O + c] = Math.max(
            img[(r * 2) * S + c * 2],
            img[(r * 2) * S + c * 2 + 1],
            img[(r * 2 + 1) * S + c * 2],
            img[(r * 2 + 1) * S + c * 2 + 1]
        );
    }
    return out;
}

// Render a feature map into a new <canvas> element using a colormap
function s11_renderMap(data, side, colorFn) {
    const fc = document.createElement('canvas');
    fc.width = side; fc.height = side;
    const fctx = fc.getContext('2d');
    const mn = Math.min(...data), mx = Math.max(...data) + 1e-6;
    for (let r = 0; r < side; r++) for (let c = 0; c < side; c++) {
        const v = (data[r * side + c] - mn) / (mx - mn);
        fctx.fillStyle = colorFn(v);
        fctx.fillRect(c, r, 1, 1);
    }
    fc.style.width = '100%'; fc.style.borderRadius = '3px';
    return fc;
}

// ── Digit-discriminating feature extraction ────────────────────────────────
//
// We compute a hand-crafted but principled feature vector from the 28×28
// preprocessed image that captures the structural properties of each digit.
// Features are organised into groups: topology, spatial distribution,
// stroke curvature, and aspect ratio.

function s11_extractFeatures(img, S) {
    // Quadrant energies (3×3 grid = 9 zones)
    const zones = new Float32Array(9);
    const zS = Math.floor(S / 3);
    for (let zr = 0; zr < 3; zr++) for (let zc = 0; zc < 3; zc++) {
        let e = 0;
        for (let r = zr * zS; r < (zr + 1) * zS; r++)
            for (let c = zc * zS; c < (zc + 1) * zS; c++)
                e += img[r * S + c];
        zones[zr * 3 + zc] = e;
    }

    // Total ink and row/col projections
    let total = 0;
    const rowProj = new Float32Array(S), colProj = new Float32Array(S);
    for (let r = 0; r < S; r++) for (let c = 0; c < S; c++) {
        const v = img[r * S + c]; total += v; rowProj[r] += v; colProj[c] += v;
    }

    // Centroid
    let cx = 0, cy = 0;
    if (total > 0) {
        for (let r = 0; r < S; r++) for (let c = 0; c < S; c++) {
            const v = img[r * S + c]; cx += v * c; cy += v * r;
        }
        cx /= (total * S); cy /= (total * S); // normalised 0..1
    } else { cx = 0.5; cy = 0.5; }

    // Vertical symmetry (left vs right energy)
    let leftE = 0, rightE = 0, topE = 0, botE = 0;
    for (let r = 0; r < S; r++) for (let c = 0; c < S; c++) {
        const v = img[r * S + c];
        if (c < S / 2) leftE += v; else rightE += v;
        if (r < S / 2) topE += v; else botE += v;
    }
    const hSym = total > 0 ? 1 - Math.abs(leftE - rightE) / (leftE + rightE + 1e-6) : 0;
    const vSym = total > 0 ? 1 - Math.abs(topE - botE) / (topE + botE + 1e-6) : 0;
    const topBot = total > 0 ? topE / (topE + botE + 1e-6) : 0.5;

    // Hole detection via flood-fill: count enclosed background regions
    // We use the 28×28 binary image and flood from every border pixel
    const thresh = 0.15;
    const binary = img.map(v => v > thresh ? 1 : 0);
    const visited = new Uint8Array(S * S);
    const stack = [];
    // Flood border
    for (let r = 0; r < S; r++) { stack.push(r * S); stack.push(r * S + S - 1); }
    for (let c = 0; c < S; c++) { stack.push(c); stack.push((S - 1) * S + c); }
    while (stack.length) {
        const idx = stack.pop();
        if (idx < 0 || idx >= S * S || visited[idx] || binary[idx]) continue;
        visited[idx] = 1;
        const r = Math.floor(idx / S), c = idx % S;
        if (r > 0) stack.push((r - 1) * S + c);
        if (r < S - 1) stack.push((r + 1) * S + c);
        if (c > 0) stack.push(r * S + c - 1);
        if (c < S - 1) stack.push(r * S + c + 1);
    }
    // Unvisited background pixels = holes
    let holePixels = 0;
    for (let i = 0; i < S * S; i++) if (!binary[i] && !visited[i]) holePixels++;
    const holeRatio = holePixels / (S * S);

    // Convex hull approximation: ratio of ink area to bounding-box area
    let minR2 = S, maxR2 = 0, minC2 = S, maxC2 = 0;
    for (let r = 0; r < S; r++) for (let c = 0; c < S; c++) {
        if (binary[r * S + c]) {
            if (r < minR2) minR2 = r; if (r > maxR2) maxR2 = r;
            if (c < minC2) minC2 = c; if (c > maxC2) maxC2 = c;
        }
    }
    const bbArea = Math.max(1, (maxR2 - minR2 + 1) * (maxC2 - minC2 + 1));
    const inkCount = binary.reduce((a, b) => a + b, 0);
    const density = inkCount / bbArea;

    // Aspect ratio of bounding box (height/width)
    const aspect = (maxC2 > minC2) ? (maxR2 - minR2 + 1) / (maxC2 - minC2 + 1) : 1;

    // Top-row and bottom-row ink (for distinguishing 7 vs 1 etc)
    const topStrip = rowProj.slice(0, 4).reduce((a, b) => a + b, 0) / (total + 1e-6);
    const botStrip = rowProj.slice(S - 4).reduce((a, b) => a + b, 0) / (total + 1e-6);
    const midRow = rowProj.slice(Math.floor(S * 0.4), Math.floor(S * 0.6)).reduce((a, b) => a + b, 0) / (total + 1e-6);
    const midCol = colProj.slice(Math.floor(S * 0.4), Math.floor(S * 0.6)).reduce((a, b) => a + b, 0) / (total + 1e-6);

    return {
        zones,          // 9 spatial zones
        total, cx, cy,
        hSym, vSym,
        topBot,         // top/total energy ratio
        holeRatio,      // fraction enclosed background
        density,        // ink / bbox
        aspect,
        topStrip, botStrip, midRow, midCol
    };
}

// ── Classifier: hand-tuned linear scores per digit ────────────────────────
//
// Each digit score is a linear combination of interpretable features.
// The coefficients encode what structural properties characterise each digit.

function s11_score(f) {
    const z = f.zones;
    const scores = [
        // 0: large hole, symmetric, all quadrants active, low center
        f.holeRatio * 18 + f.hSym * 4 + f.vSym * 4
        + (z[0] + z[2] + z[6] + z[8]) * 0.25  // corners active
        - z[4] * 0.5                            // center sparse
        + f.density * 2 - f.midRow * 4,

        // 1: tall narrow, vertical strip, low symmetry, high aspect ratio
        f.aspect * 5 + (1 - f.hSym) * 6
        + f.midCol * 5
        - f.midRow * 3
        - f.holeRatio * 12
        + (f.cx > 0.35 && f.cx < 0.65 ? 3 : 0)
        - f.density * 4,

        // 2: top-right + bottom-left energy, mid horizontal stroke, no hole
        z[2] * 0.35 + z[6] * 0.35 + z[7] * 0.25
        + f.topStrip * 4 + f.botStrip * 3
        - f.holeRatio * 10
        + f.midRow * 3
        + (1 - f.vSym) * 3,

        // 3: right-heavy, two bumps (mid strip active), low hole
        (z[2] + z[5] + z[8]) * 0.35 - (z[0] + z[3] + z[6]) * 0.25
        + f.midRow * 5 + f.topStrip * 2 + f.botStrip * 2
        - f.holeRatio * 8
        + (f.cx > 0.5 ? 4 : -2),

        // 4: upper-left + lower-right, horizontal cross-stroke
        z[0] * 0.3 + z[3] * 0.3 + z[8] * 0.3
        + f.midRow * 5
        - f.botStrip * 3
        + (1 - f.vSym) * 2
        - f.holeRatio * 5,

        // 5: top-left + bottom-right, mid stroke, slight hole possible
        z[0] * 0.3 + z[1] * 0.2 + z[8] * 0.3 + z[7] * 0.2
        + f.topStrip * 3 + f.botStrip * 2
        + f.midRow * 3
        + f.holeRatio * 4
        + f.vSym * 2,

        // 6: large hole (closed bottom loop), left-heavy, bottom heavy
        f.holeRatio * 15 + z[6] * 0.35 + z[7] * 0.3 + z[8] * 0.3
        + f.topBot * (-3) + f.botStrip * 4
        + f.hSym * 2,

        // 7: top horizontal + diagonal down-right, sparse bottom-left
        f.topStrip * 7 + z[2] * 0.3 + z[5] * 0.25
        - z[6] * 0.3
        - f.holeRatio * 10
        + (1 - f.vSym) * 2
        + f.aspect * 1.5,

        // 8: two holes, symmetric, dense
        f.holeRatio * 20 + f.hSym * 5 + f.vSym * 5
        + f.density * 3
        + f.topStrip * 2 + f.botStrip * 2,

        // 9: hole in upper loop, top-heavy, right-tilted
        f.holeRatio * 14 + f.topBot * 5
        + z[0] * 0.25 + z[1] * 0.25 + z[2] * 0.25
        + f.hSym * 2
        - f.botStrip * 2,
    ];
    return scores;
}

function s11_classify() {
    // ── 1. Capture canvas → float gray ──────────────────────────────────────
    const SRC = 140;
    const offscreen = document.createElement('canvas');
    offscreen.width = SRC; offscreen.height = SRC;
    const octx = offscreen.getContext('2d');
    octx.drawImage(digitCanvas, 0, 0, SRC, SRC);
    const imgData = octx.getImageData(0, 0, SRC, SRC);
    let rawGray = new Float32Array(SRC * SRC);
    for (let i = 0; i < SRC * SRC; i++) rawGray[i] = imgData.data[i * 4] / 255;

    // ── 2. Blur then crop-center-rescale to 28×28 ───────────────────────────
    rawGray = s11_blur(rawGray, SRC, SRC);
    const S = 28;
    const gray = s11_cropAndCenter(rawGray, SRC, SRC, S);

    // ── 3. Layer 1 — 8 oriented edge filters → ReLU ──────────────────────────
    const fmap1Container = document.getElementById('fmap1');
    fmap1Container.innerHTML = '';
    const layer1Maps = [];
    s11Kernels.forEach(({ k }) => {
        const fmap = s11_conv2d(gray, S, k); // 26×26
        layer1Maps.push(fmap);
        const fc = s11_renderMap(fmap, 26, v => {
            const r = Math.round(v * 220), g = Math.round(v * 100), b = Math.round(v * 30);
            return `rgb(${r},${g},${b})`;
        });
        fmap1Container.appendChild(fc);
    });

    // ── 4. Layer 2 — 8 feature maps: pool each L1 map, then apply 2nd conv ──
    //    Each L2 map combines a pooled L1 map with a composite kernel
    const fmap2Container = document.getElementById('fmap2');
    fmap2Container.innerHTML = '';
    const layer2Kernels = [
        [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],    // sharpened response of Sobel X
        [[1, 2, 1], [0, 0, 0], [-1, -2, -1]],       // Sobel Y on Sobel Y
        [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]],       // Sobel X on 45°
        [[1, 1, 1], [1, 1, 1], [1, 1, 1]].map(r => r.map(v => v / 9)), // local avg (blob)
        [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]], // Laplacian on Sobel Y
        [[0, 1, 0], [1, -4, 1], [0, 1, 0]],         // negative Laplacian (blob boundary)
        [[1, 0, -1], [2, 0, -2], [1, 0, -1]],       // Sobel X on Horiz
        [[0, 1, 1], [-1, 0, 1], [-1, -1, 0]],       // 135° on Vert
    ];
    const layer2Maps = [];
    for (let i = 0; i < 8; i++) {
        const pooled = s11_maxpool(layer1Maps[i], 26); // 13×13
        const fmap2 = s11_conv2d(pooled, 13, layer2Kernels[i]); // 11×11
        layer2Maps.push({ data: fmap2, size: 11 });
        const fc = s11_renderMap(fmap2, 11, v => {
            return `rgb(0,${Math.round(v * 180)},${Math.round(v * 255)})`;
        });
        fmap2Container.appendChild(fc);
    }

    // ── 5. Extract interpretable features and classify ───────────────────────
    const feat = s11_extractFeatures(gray, S);
    const rawScores = s11_score(feat);

    // Softmax
    const maxS = Math.max(...rawScores);
    const exp = rawScores.map(s => Math.exp(s - maxS));
    const sumE = exp.reduce((a, b) => a + b, 0);
    const probs = exp.map(e => e / sumE);

    // ── 6. Render output bar chart ───────────────────────────────────────────
    const c11 = document.getElementById('c11out');
    const ctx2 = c11.getContext('2d');
    c11.width = 500; c11.height = 70;
    ctx2.fillStyle = '#0d1117'; ctx2.fillRect(0, 0, 500, 70);
    const bW = 500 / 10;
    const maxP = Math.max(...probs);
    const predicted = probs.indexOf(maxP);
    probs.forEach((p, i) => {
        const bH = p * 52;
        ctx2.fillStyle = i === predicted ? '#fbbf24' : '#60a5fa';
        ctx2.fillRect(i * bW + 2, 60 - bH, bW - 4, bH);
        ctx2.fillStyle = i === predicted ? '#fbbf24' : 'rgba(255,255,255,0.55)';
        ctx2.font = `${i === predicted ? 'bold ' : ''}11px 'Fira Code'`;
        ctx2.textAlign = 'center';
        ctx2.fillText(i.toString(), i * bW + bW / 2, 68);
        if (p > 0.05) {
            ctx2.fillStyle = 'rgba(255,255,255,0.5)';
            ctx2.font = "9px 'Fira Code'";
            ctx2.fillText(`${Math.round(p * 100)}%`, i * bW + bW / 2, 60 - bH - 2);
        }
    });
    ctx2.fillStyle = '#fbbf24';
    ctx2.font = "bold 12px 'Fira Code'";
    ctx2.textAlign = 'left';
    ctx2.fillText(`→ predicted: ${predicted}  (${Math.round(maxP * 100)}% conf.)`, 8, 14);
}

// =====================================
//  SECTION 12 — LEARNED FILTERS
// =====================================
let s12Mode = 'edges';

// Generate a 16×16 procedural test image suited to each filter type
function s12_testImage(mode) {
    const S = 16, img = [];
    for (let r = 0; r < S; r++) {
        img.push([]);
        for (let c = 0; c < S; c++) {
            const x = c / S, y = r / S; // normalised 0..1
            let v = 0;
            if (mode === 'edges') {
                // Diagonal stripes + a circle outline
                const circle = Math.abs(Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2) - 0.35) < 0.06 ? 1 : 0;
                const diag = (Math.sin((x - y) * Math.PI * 6) > 0.7) ? 0.6 : 0;
                v = Math.max(circle, diag);
            } else if (mode === 'gabor') {
                // Oriented grating
                v = 0.5 + 0.5 * Math.sin((x * 5 + y * 3) * Math.PI * 2);
            } else if (mode === 'color') {
                // Smooth gradient with a bright spot
                v = 0.3 + 0.4 * x + 0.3 * Math.exp(-((x - 0.7) ** 2 + (y - 0.3) ** 2) * 30);
            } else if (mode === 'texture') {
                // Multi-frequency checkerboard
                const f1 = Math.sign(Math.sin(x * Math.PI * 4) * Math.sin(y * Math.PI * 4));
                const f2 = Math.sign(Math.sin(x * Math.PI * 10) * Math.sin(y * Math.PI * 10));
                v = 0.5 + 0.3 * f1 + 0.2 * f2;
            } else { // deep — curved shape (arc)
                const dist = Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2);
                v = Math.exp(-((dist - 0.3) ** 2) * 80) + 0.2 * Math.sin(x * Math.PI * 8);
            }
            img[r].push(Math.max(0, Math.min(1, v)));
        }
    }
    return img;
}

// Convolve testImg (S×S) with kernel, return flat feature map with dimensions
function s12_conv(testImg, kernel) {
    const S = testImg.length;
    const kR = kernel.length, kC = kernel[0].length;
    const oR = S - kR + 1, oC = S - kC + 1;
    const fmap = [];
    for (let r = 0; r < oR; r++) for (let c = 0; c < oC; c++) {
        let sum = 0;
        for (let dr = 0; dr < kR; dr++) for (let dc = 0; dc < kC; dc++)
            sum += (testImg[r + dr]?.[c + dc] ?? 0) * kernel[dr][dc];
        fmap.push(sum);
    }
    return { fmap, oR, oC };
}

const s12FilterSets = {
    edges: {
        name: 'Layer 1 — Edge detectors: oriented Sobel & Laplacian',
        cols: 4,
        filters: [
            { k: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], desc: 'Sobel X\n(vertical edges)' },
            { k: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]], desc: 'Sobel Y\n(horizontal edges)' },
            { k: [[-1, -1, 0], [-1, 0, 1], [0, 1, 1]], desc: '45° edge' },
            { k: [[0, 1, 1], [-1, 0, 1], [-1, -1, 0]], desc: '135° edge' },
            { k: [[-1, -1, -1], [0, 0, 0], [1, 1, 1]], desc: 'Horiz. edge' },
            { k: [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]], desc: 'Vert. edge' },
            { k: [[0, -1, 0], [-1, 4, -1], [0, -1, 0]], desc: 'Laplacian\n(all edges)' },
            { k: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]], desc: 'DoG\n(edge enhance)' },
        ]
    },
    gabor: {
        name: 'Layer 1/2 — Gabor-like: oriented frequency bands (as in V1 cortex)',
        cols: 4,
        filters: Array.from({ length: 8 }, (_, i) => {
            const angle = i * Math.PI / 8;
            const k = Array.from({ length: 5 }, (_, r) => Array.from({ length: 5 }, (_, c) => {
                const cx = c - 2, cy = r - 2;
                const xp = cx * Math.cos(angle) + cy * Math.sin(angle);
                const yp = -cx * Math.sin(angle) + cy * Math.cos(angle);
                return Math.exp(-(xp * xp / 2 + yp * yp / 4)) * Math.cos(2 * Math.PI * xp / 2.5);
            }));
            return { k, desc: `θ = ${Math.round(i * 22.5)}°` };
        })
    },
    texture: {
        name: 'Layer 2/3 — Texture / frequency detectors',
        cols: 4,
        filters: Array.from({ length: 8 }, (_, i) => {
            const freq = (i + 1) * 0.7;
            const angle = i * Math.PI / 8;
            const k = Array.from({ length: 5 }, (_, r) => Array.from({ length: 5 }, (_, c) => {
                const cx = c - 2, cy = r - 2;
                const xp = cx * Math.cos(angle) + cy * Math.sin(angle);
                const g = Math.exp(-(cx * cx + cy * cy) / 4);
                return g * Math.cos(freq * Math.PI * xp);
            }));
            return { k, desc: `f=${i + 1} θ=${Math.round(i * 22.5)}°` };
        })
    },
    deep: {
        name: 'Layer 4+ — Deep filters: complex shape & curvature detectors',
        cols: 4,
        filters: Array.from({ length: 8 }, (_, i) => {
            const seed = i * 13 + 7;
            const k = Array.from({ length: 7 }, (_, r) => Array.from({ length: 7 }, (_, c) => {
                const cx = c - 3, cy = r - 3;
                const g = Math.exp(-(cx * cx + cy * cy) / 6);
                return g * (Math.sin(seed * 0.5 + cx * 0.9 + cy * 0.6) * 0.7
                          + Math.cos(seed * 0.3 + cx * 0.4 - cy * 0.8) * 0.4
                          + Math.sin(cx * cy * 0.3 + seed * 0.2) * 0.3);
            }));
            return { k, desc: `deep filter ${i + 1}` };
        })
    },
    color: {
        name: 'Layer 1 — Color-selective / opponent channel filters',
        cols: 4,
        filters: [
            { k: [[1,2,1],[2,4,2],[1,2,1]].map(r => r.map(v => v / 16)), desc: 'Gaussian blob\n(center-on)' },
            { k: [[-1,-1,-1],[-1,8,-1],[-1,-1,-1]], desc: 'DoG\n(surround inhibit)' },
            { k: [[0,-1,0],[-1,5,-1],[0,-1,0]], desc: 'Sharpening\n(local contrast)' },
            { k: [[-2,1,1],[1,-2,1],[1,1,-2]], desc: 'R−G opponent' },
            { k: [[1,1,-2],[1,-2,1],[-2,1,1]], desc: 'B−Y opponent' },
            { k: [[1,0,-1],[2,0,-2],[1,0,-1]], desc: 'Chromatic\nSobel X' },
            { k: [[-1,-2,-1],[0,0,0],[1,2,1]], desc: 'Chromatic\nSobel Y' },
            { k: [[1,1,1],[1,-8,1],[1,1,1]].map(r => r.map(v => v / 8)), desc: 'Color blob\n(neg. Laplacian)' },
        ]
    }
};

function s12_set(mode) {
    s12Mode = mode;
    document.querySelectorAll('#s12 .controls button').forEach(b => b.classList.remove('selected'));
    document.getElementById(`s12-${mode}`).classList.add('selected');
    s12_draw();
}

function s12_draw() {
    const canvas = document.getElementById('c12');
    const { ctx, W, H } = dpr(canvas);
    darkBg(ctx, W, H);
    drawDarkGrid(ctx, W, H, 32);

    const fset = s12FilterSets[s12Mode];
    const filters = fset.filters;
    const cols = fset.cols;           // filters per row

    // Section title
    label(ctx, fset.name, 12, 16, 'rgba(255,255,255,0.65)', 11);

    // Layout: divide canvas into cols columns, rows filter-rows
    // Each column cell contains: kernel viz (top) + response viz (bottom) + label
    const marginX = 16, marginY = 28;
    const gapX = 10, gapY = 10;
    const cellW = (W - 2 * marginX - (cols - 1) * gapX) / cols;

    const kernelDisplaySize = Math.min(cellW * 0.42, 70); // kernel box width
    const responseDisplaySize = cellW - kernelDisplaySize - 8; // response box width
    const rowH = Math.max(kernelDisplaySize, responseDisplaySize) + 28; // +28 for label
    const testImg = s12_testImage(s12Mode);

    filters.forEach((f, fi) => {
        const col = fi % cols;
        const row = Math.floor(fi / cols);
        const cellX = marginX + col * (cellW + gapX);
        const cellY = marginY + row * (rowH + gapY);

        const kernel = f.k;
        const kR = kernel.length, kC = kernel[0].length;

        // ── Kernel weight visualisation (left portion of cell) ──
        const kDispW = kernelDisplaySize, kDispH = kernelDisplaySize;
        const kCellW = kDispW / kC, kCellH = kDispH / kR;
        let mn = Infinity, mx = -Infinity;
        kernel.forEach(row => row.forEach(v => { if (v < mn) mn = v; if (v > mx) mx = v; }));
        const range = mx - mn + 1e-6;

        kernel.forEach((krow, r) => krow.forEach((v, c) => {
            const t = (v - mn) / range;
            ctx.fillStyle = coolwarm(2 * t - 1);
            ctx.fillRect(cellX + c * kCellW, cellY + r * kCellH, kCellW - 0.5, kCellH - 0.5);
        }));
        // kernel grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 0.5;
        for (let r = 0; r <= kR; r++) {
            ctx.beginPath(); ctx.moveTo(cellX, cellY + r * kCellH); ctx.lineTo(cellX + kDispW, cellY + r * kCellH); ctx.stroke();
        }
        for (let c = 0; c <= kC; c++) {
            ctx.beginPath(); ctx.moveTo(cellX + c * kCellW, cellY); ctx.lineTo(cellX + c * kCellW, cellY + kDispH); ctx.stroke();
        }
        // kernel weight values (only for small kernels where text fits)
        if (kC <= 5 && kCellW > 10) {
            ctx.textAlign = 'center'; ctx.font = `${Math.min(9, kCellW * 0.45)}px 'Fira Code'`;
            kernel.forEach((krow, r) => krow.forEach((v, c) => {
                const t = (v - mn) / range;
                ctx.fillStyle = t > 0.55 ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.75)';
                ctx.fillText(v.toFixed(1), cellX + (c + 0.5) * kCellW, cellY + (r + 0.5) * kCellH + 3);
            }));
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1;
        ctx.strokeRect(cellX, cellY, kDispW, kDispH);

        // "W" label on kernel
        label(ctx, 'kernel W', cellX, cellY - 4, 'rgba(255,255,255,0.35)', 8);

        // ── Convolved response map (right portion of cell) ──
        const respX = cellX + kDispW + 8;
        const respSize = Math.min(responseDisplaySize, kDispH + 4);
        const { fmap, oR, oC } = s12_conv(testImg, kernel);

        let fmn = Infinity, fmx = -Infinity;
        fmap.forEach(v => { if (v < fmn) fmn = v; if (v > fmx) fmx = v; });
        const frange = fmx - fmn + 1e-6;

        const rCellW = respSize / oC, rCellH = respSize / oR;
        fmap.forEach((v, idx) => {
            const r = Math.floor(idx / oC), c = idx % oC;
            const t = (v - fmn) / frange;
            // use coolwarm for signed responses, heat for positive-only
            ctx.fillStyle = fmn < -0.01
                ? coolwarm(2 * t - 1)
                : `rgb(${Math.round(lerp(10, 240, t))},${Math.round(lerp(15, 120, t))},${Math.round(lerp(30, 20, t))})`;
            ctx.fillRect(respX + c * rCellW, cellY + r * rCellH, rCellW - 0.3, rCellH - 0.3);
        });
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1;
        ctx.strokeRect(respX, cellY, oC * rCellW, oR * rCellH);
        label(ctx, 'response', respX, cellY - 4, 'rgba(255,255,255,0.35)', 8);

        // ── Filter description label ──
        const labelY = cellY + Math.max(kDispH, oR * rCellH) + 12;
        const descLines = f.desc.split('\n');
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = "bold 9px 'Fira Code'";
        ctx.fillText(descLines[0], cellX, labelY);
        if (descLines[1]) {
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            ctx.font = "9px 'Fira Code'";
            ctx.fillText(descLines[1], cellX, labelY + 11);
        }
    });

    // ── Coolwarm legend (bottom-right) ──
    const legW = 80, legH = 8, legX = W - legW - 14, legY = H - 22;
    for (let i = 0; i < legW; i++) {
        ctx.fillStyle = coolwarm(2 * i / legW - 1);
        ctx.fillRect(legX + i, legY, 1, legH);
    }
    label(ctx, '−', legX - 8, legY + 8, 'rgba(96,165,250,0.8)', 10);
    label(ctx, '+', legX + legW + 2, legY + 8, 'rgba(248,113,113,0.8)', 10);
    label(ctx, 'weight scale', legX + legW / 2 - 22, legY + legH + 11, 'rgba(255,255,255,0.3)', 8);
}

s12_draw();

// =====================================
//  SECTION 13 — GRADIENT FLOW
// =====================================
let s13Running = false, s13Raf = null, s13BN = false, s13Skip = false, s13NLayers = 8, s13Epoch13 = 0;
let s13History = [];

function s13_reset() {
    s13Running = false; cancelAnimationFrame(s13Raf);
    document.getElementById('s13-play').textContent = '▶ Train';
    s13Epoch13 = 0; s13History = [];
    s13_draw();
}

function s13_toggle() {
    s13Running = !s13Running;
    document.getElementById('s13-play').textContent = s13Running ? '⏸ Pause' : '▶ Train';
    if (s13Running) s13_tick();
}

function s13_toggleBN() {
    s13BN = !s13BN;
    document.getElementById('s13-bn').textContent = `Batch Norm: ${s13BN ? 'ON' : 'OFF'}`;
    s13_reset();
}

function s13_toggleSkip() {
    s13Skip = !s13Skip;
    document.getElementById('s13-skip').textContent = `Skip Conn: ${s13Skip ? 'ON' : 'OFF'}`;
    s13_reset();
}

function s13_setDepth(n) { s13NLayers = n; s13_reset(); }

function s13_computeGrads(epoch) {
    const grads = [];
    const baseDecay = s13BN ? 0.92 : 0.7;
    const skipBoost = s13Skip ? 0.85 : 0;
    let g = 1.0;
    for (let l = s13NLayers - 1; l >= 0; l--) {
        const noise = 0.1 + 0.08 * Math.sin(epoch * 0.3 + l);
        const decay = baseDecay * (1 + noise);
        g = g * decay + skipBoost * Math.exp(-l * 0.3);
        grads[l] = Math.min(g + Math.random() * 0.05, 10);
    }
    return grads;
}

function s13_tick() {
    if (!s13Running) return;
    s13Epoch13++;
    s13History.push(s13_computeGrads(s13Epoch13));
    if (s13History.length > 60) s13History.shift();
    s13_draw();
    if (s13Epoch13 < 200) s13Raf = requestAnimationFrame(s13_tick);
    else { s13Running = false; document.getElementById('s13-play').textContent = '▶ Train'; }
}

function s13_draw() {
    const canvas = document.getElementById('c13');
    const { ctx, W, H } = dpr(canvas);
    darkBg(ctx, W, H);

    if (s13History.length === 0) {
        label(ctx, 'Press ▶ to simulate training and observe gradient flow', W / 2 - 170, H / 2, 'rgba(255,255,255,0.4)', 13);
        const demoGrads = s13_computeGrads(0);
        const bW = (W - 60) / s13NLayers, bH = H - 80, offX = 30, offY = 30;
        label(ctx, 'layer index (output → input)', offX, H - 10, 'rgba(255,255,255,0.4)', 10);
        demoGrads.forEach((g, l) => {
            const t = clamp(g / 3, 0, 1);
            ctx.fillStyle = g < 0.01 ? '#f87171' : g > 2 ? '#fb923c' : heat(t);
            const h = clamp(g / 3, 0.02, 1) * bH;
            ctx.fillRect(offX + l * bW, offY + bH - h, bW - 2, h);
            label(ctx, `L${l + 1}`, offX + l * bW + 2, H - 22, 'rgba(255,255,255,0.4)', 9);
        });
        return;
    }

    const nCols = s13NLayers, nRows = s13History.length;
    const cW = (W - 60) / nCols, cH = (H - 80) / nRows;
    const offX = 30, offY = 20;

    s13History.forEach((grads, t) => {
        grads.forEach((g, l) => {
            const t2 = clamp(Math.log(g + 1) / Math.log(5), 0, 1);
            ctx.fillStyle = g < 0.005 ? '#1a0505' : heat(t2);
            ctx.fillRect(offX + l * cW, offY + t * cH, cW - 1, cH);
        });
    });

    label(ctx, '← output', offX, H - 12, 'rgba(255,255,255,0.4)', 9);
    label(ctx, 'input →', offX + (nCols - 1) * cW, H - 12, 'rgba(255,255,255,0.4)', 9);
    label(ctx, '↑ recent epoch', W - 90, offY + 8, 'rgba(255,255,255,0.4)', 9);

    for (let y = 0; y < 60; y++) {
        ctx.fillStyle = heat(1 - y / 60);
        ctx.fillRect(W - 22, offY + y, 16, 1);
    }
    label(ctx, 'large', W - 52, offY + 4, 'rgba(255,255,255,0.4)', 9);
    label(ctx, 'zero', W - 52, offY + 64, 'rgba(255,255,255,0.4)', 9);

    const last = s13History[s13History.length - 1];
    const minG = Math.min(...last);
    if (minG < 0.01 && !s13BN && !s13Skip) {
        ctx.fillStyle = 'rgba(248,113,113,0.8)'; ctx.font = "12px 'Fira Code'";
        ctx.fillText('⚠ vanishing gradients detected — early layers not learning', W / 2 - 200, 16);
    }
    label(ctx, `epoch: ${s13Epoch13}  BN: ${s13BN ? 'on' : 'off'}  skip: ${s13Skip ? 'on' : 'off'}`, offX, H - 26, 'rgba(255,255,255,0.5)', 10);
}

s13_draw();

// =====================================
//  SECTION 14 — JACOBIAN & SVD
// =====================================
let s14Matrix = [[1, 0], [0, 1]];
let s14SvdAnim = 0, s14SvdRunning = false, s14SvdRaf = null;

const s14Matrices = {
    identity: [[1, 0], [0, 1]],
    rotation: [[Math.cos(0.8), -Math.sin(0.8)], [Math.sin(0.8), Math.cos(0.8)]],
    shear: [[1, 0.8], [0, 1]],
    scale: [[2.5, 0], [0, 0.4]],
    random: () => Array.from({ length: 2 }, () => Array.from({ length: 2 }, () => (Math.random() - 0.5) * 3)),
};

function s14_svd2x2(a, b, c, d) {
    const S = a * a + b * b + c * c + d * d;
    const P = a * d - b * c;
    const s1 = Math.sqrt((S + Math.sqrt(Math.max(0, S * S - 4 * P * P))) / 2);
    const s2 = Math.abs(P) / s1;
    return [s1, s2];
}

function s14_set(name) {
    if (name === 'random') s14Matrix = s14Matrices.random();
    else s14Matrix = s14Matrices[name].map(r => [...r]);
    s14SvdAnim = 0;
    s14_draw(0);
}

function s14_animate() {
    s14SvdAnim = 0;
    s14SvdRunning = true;
    const tick = () => {
        s14SvdAnim = Math.min(s14SvdAnim + 0.02, 1);
        s14_draw(s14SvdAnim);
        if (s14SvdAnim < 1) s14SvdRaf = requestAnimationFrame(tick);
        else s14SvdRunning = false;
    };
    cancelAnimationFrame(s14SvdRaf);
    tick();
}

function s14_draw(t) {
    const canvas = document.getElementById('c14');
    const { ctx, W, H } = dpr(canvas);
    darkBg(ctx, W, H);
    drawDarkGrid(ctx, W, H, 40);

    const M = s14Matrix;
    const [a, b] = [M[0][0], M[0][1]];
    const [c, d] = [M[1][0], M[1][1]];

    const scale = 80;
    const cx1 = W * 0.22, cy1 = H * 0.5;
    label(ctx, 'input space', cx1 - 40, 30, 'rgba(255,255,255,0.5)', 11);

    ctx.strokeStyle = 'rgba(96,165,250,0.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx1, cy1, scale, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(cx1 - scale - 20, cy1); ctx.lineTo(cx1 + scale + 20, cy1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx1, cy1 - scale - 20); ctx.lineTo(cx1, cy1 + scale + 20); ctx.stroke();
    ctx.strokeStyle = '#f87171'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx1, cy1); ctx.lineTo(cx1 + scale, cy1); ctx.stroke();
    ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx1, cy1); ctx.lineTo(cx1, cy1 - scale); ctx.stroke();
    label(ctx, 'e₁', (cx1 + scale + 4), cy1 - 4, '#f87171', 11);
    label(ctx, 'e₂', cx1 + 4, cy1 - scale - 10, '#4ade80', 11);

    const cx2 = W * 0.65, cy2 = H * 0.5;
    label(ctx, 'output space — J·x', cx2 - 40, 30, 'rgba(255,255,255,0.5)', 11);

    ctx.strokeStyle = 'rgba(251,191,36,0.6)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let angle = 0; angle <= Math.PI * 2; angle += 0.05) {
        const ux = Math.cos(angle), uy = Math.sin(angle);
        const tx2 = lerp(ux, (a * ux + b * uy), t) * scale;
        const ty2 = lerp(uy, (c * ux + d * uy), t) * scale;
        angle === 0 ? ctx.moveTo(cx2 + tx2, cy2 - ty2) : ctx.lineTo(cx2 + tx2, cy2 - ty2);
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(248,113,113,0.8)'; ctx.lineWidth = 2;
    const tx1 = lerp(1, a, t) * scale, ty1 = lerp(0, c, t) * scale;
    ctx.beginPath(); ctx.moveTo(cx2, cy2); ctx.lineTo(cx2 + tx1, cy2 - ty1); ctx.stroke();
    ctx.strokeStyle = 'rgba(74,222,128,0.8)'; ctx.lineWidth = 2;
    const tx2_ = lerp(0, b, t) * scale, ty2_ = lerp(1, d, t) * scale;
    ctx.beginPath(); ctx.moveTo(cx2, cy2); ctx.lineTo(cx2 + tx2_, cy2 - ty2_); ctx.stroke();

    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(cx2 - 120, cy2); ctx.lineTo(cx2 + 120, cy2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx2, cy2 - 100); ctx.lineTo(cx2, cy2 + 100); ctx.stroke();

    const mx = W * 0.42, my = H * 0.3;
    label(ctx, 'J =', mx, my, 'rgba(255,255,255,0.7)', 14);
    const entries = [[a, b], [c, d]];
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 0.5;
    ctx.strokeRect(mx + 30, my - 16, 80, 50);
    entries.forEach((row, r) => row.forEach((v, c) => {
        const color = Math.abs(v) > 1.5 ? '#fbbf24' : Math.abs(v) > 0.5 ? '#60a5fa' : 'rgba(255,255,255,0.6)';
        label(ctx, v.toFixed(2), mx + 36 + c * 38, my + r * 20, '' + color, 12);
    }));

    const [s1, s2] = s14_svd2x2(a, b, c, d);
    const svY = H * 0.68;
    label(ctx, 'singular values (σ₁, σ₂) — stretching factors:', W * 0.05, svY, 'rgba(255,255,255,0.6)', 11);

    const barData = [
        { val: s1, label: `σ₁ = ${s1.toFixed(2)}`, color: '#f87171' },
        { val: s2, label: `σ₂ = ${s2.toFixed(2)}`, color: '#4ade80' },
        { val: s1 * s2, label: `det = ${(s1 * s2).toFixed(2)}`, color: '#fbbf24' },
    ];
    const maxBar = Math.max(s1, s2, 3);
    barData.forEach((b2, i) => {
        const bx = W * 0.1 + i * 160;
        const bh = clamp(b2.val / maxBar, 0, 1) * (H - svY - 50) * t;
        ctx.fillStyle = b2.color;
        ctx.fillRect(bx, H - 40 - bh, 40, bh);
        ctx.strokeStyle = b2.color + '44'; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(bx + 20, svY); ctx.lineTo(bx + 20, H - 40 - bh); ctx.stroke();
        label(ctx, b2.label, bx - 10, H - 24, '' + b2.color, 10);
    });

    const det = a * d - b * c;
    const detMsg = Math.abs(det) < 0.01 ? 'rank-deficient (not invertible)' : det < 0 ? 'orientation-reversing' : det > 5 ? 'volume-expanding' : 'volume-preserving-ish';
    label(ctx, `det(J) = ${det.toFixed(2)} — ${detMsg}`, W * 0.1, H - 8, 'rgba(255,255,255,0.4)', 10);
}

s14_draw(0);

// =====================================
//  SECTION 15 — DECISION BOUNDARY: WIDTH / DEPTH
// =====================================
let s15Running = false, s15Raf = null;
let s15Epoch = 0;
let s15K = 4, s15L = 2;
let s15Diff = 'circle';
let s15Activation = 'relu';
let s15Optimizer = 'sgd';
let s15Lr = 0.08;
let s15Batch = 32;
let s15Model = null;
let s15Data = [];
let s15Trained = false;

function s15_genData(diff) {
    const pts = [];
    if (diff === 'circle') {
        for (let cls = 0; cls < 2; cls++) {
            for (let i = 0; i < 80; i++) {
                const angle = Math.random() * 2 * Math.PI;
                const r = cls === 0 ? Math.random() * 0.45 : 0.65 + Math.random() * 0.45;
                pts.push({ x: r * Math.cos(angle) + (Math.random() - 0.5) * 0.06, y: r * Math.sin(angle) + (Math.random() - 0.5) * 0.06, c: cls });
            }
        }
    } else if (diff === 'xor') {
        [[-0.7, -0.7], [-0.7, 0.7], [0.7, -0.7], [0.7, 0.7]].forEach(([cx, cy], cls) => {
            for (let i = 0; i < 40; i++) {
                pts.push({ x: cx + (Math.random() - 0.5) * 0.5, y: cy + (Math.random() - 0.5) * 0.5, c: cls % 2 });
            }
        });
    } else {
        for (let cls = 0; cls < 2; cls++) {
            for (let i = 0; i < 80; i++) {
                const t = i / 80 * 3 * Math.PI + cls * Math.PI;
                const r = 0.1 + 0.9 * (i / 80);
                pts.push({ x: r * Math.cos(t) + (Math.random() - 0.5) * 0.06, y: r * Math.sin(t) + (Math.random() - 0.5) * 0.06, c: cls });
            }
        }
    }
    return pts;
}

function s15_reset() {
    s15Running = false; cancelAnimationFrame(s15Raf);
    document.getElementById('s15-play').textContent = '▶ Animate';
    s15Epoch = 0;
    s15Trained = false;
    s15Diff = document.getElementById('s15-diff').value;
    s15Activation = document.getElementById('s15-activation').value;
    s15Optimizer = document.getElementById('s15-optimizer').value;
    s15Batch = +document.getElementById('s15-batch').value;
    s15Lr = +document.getElementById('s15-lr').value / 100;
    document.getElementById('s15-lr-val').textContent = s15Lr.toFixed(2);
    s15Data = s15_genData(s15Diff);
    s15Model = new MLP([2, ...Array(s15L).fill(s15K), 1], s15Activation);
    document.getElementById('s15-regions').textContent = 'regions: —';
    s15_draw();
}

function s15_kChange() {
    s15K = +document.getElementById('s15-k').value;
    document.getElementById('s15-k-val').textContent = s15K;
    s15_reset();
}

function s15_lChange() {
    s15L = +document.getElementById('s15-l').value;
    document.getElementById('s15-l-val').textContent = s15L;
    s15_reset();
}

function s15_lrChange() {
    const value = +document.getElementById('s15-lr').value;
    s15Lr = value / 100;
    document.getElementById('s15-lr-val').textContent = s15Lr.toFixed(2);
    s15_reset();
}

function s15_toggle() {
    s15Running = !s15Running;
    document.getElementById('s15-play').textContent = s15Running ? '⏸ Stop' : '▶ Animate';
    if (s15Running) s15_tick();
}

function s15_tick() {
    if (!s15Running) return;
    if (s15Epoch < 1000) {
        s15Model.train(
            s15Data.map(d => [d.x, d.y]),
            s15Data.map(d => d.c),
            { lr: s15Lr, epochs: 1, batchSize: s15Batch, optimizer: s15Optimizer }
        );
        s15Epoch += 1;
        s15Trained = true;
        document.getElementById('s15-regions').textContent = `epoch: ${s15Epoch}`;
        s15_draw();
        s15Raf = requestAnimationFrame(s15_tick);
    } else {
        s15Running = false;
        document.getElementById('s15-play').textContent = '▶ Animate';
        const estRegions = Math.min(s15K * s15K * s15L, 500);
        document.getElementById('s15-regions').textContent = `regions ≈ ${estRegions}`;
    }
}

function s15_draw() {
    const canvas = document.getElementById('c15');
    const { ctx, W, H } = dpr(canvas);
    darkBg(ctx, W, H);
    drawDarkGrid(ctx, W, H, 40);

    const scale = Math.min(W, H) * 0.38;
    const cx = W / 2, cy = H / 2;
    const px = x => cx + x * scale;
    const py = y => cy - y * scale;

    const res = 60;
    const cW = W / res, cH = H / res;
    for (let j = 0; j < res; j++) for (let i = 0; i < res; i++) {
        const wx = (i - res / 2) / scale * 2, wy = (res / 2 - j) / scale * 2;
        const p = s15Trained && s15Model ? s15Model.predict([wx, wy]) : 0.5;
        const t = Math.abs(p - 0.5) * 2;
        ctx.fillStyle = p < 0.5
            ? `rgba(248,113,113,${Math.min(t * 0.6, 0.5)})`
            : `rgba(96,165,250,${Math.min(t * 0.6, 0.5)})`;
        ctx.fillRect(i * cW, j * cH, cW + 1, cH + 1);
    }

    if (s15Trained) {
        for (let j = 0; j < res - 1; j++) for (let i = 0; i < res - 1; i++) {
            const wx = (i - res / 2) / scale * 2, wy = (res / 2 - j) / scale * 2;
            const p1 = s15Model.predict([wx, wy]);
            const p2 = s15Model.predict([wx + 2 / scale, wy]);
            const p3 = s15Model.predict([wx, wy + 2 / scale]);
            if ((p1 < 0.5) !== (p2 < 0.5) || (p1 < 0.5) !== (p3 < 0.5)) {
                ctx.fillStyle = 'rgba(255,255,255,0.55)';
                ctx.fillRect(i * cW, j * cH, 2, 2);
            }
        }
    }

    s15Data.forEach(({ x, y, c }) => {
        ctx.fillStyle = c === 0 ? '#f87171' : '#60a5fa';
        ctx.beginPath(); ctx.arc(px(x), py(y), 4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 0.5; ctx.stroke();
    });

    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(cx, 20); ctx.lineTo(cx, H - 20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(20, cy); ctx.lineTo(W - 20, cy); ctx.stroke();

    if (!s15Trained) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = "13px 'Fira Code'";
        ctx.textAlign = 'center';
        ctx.fillText('Press ▶ to train — watch the boundary form', W / 2, H / 2);
        ctx.textAlign = 'left';
    }

    label(ctx, `K=${s15K} neurons × L=${s15L} layers · ${s15Activation.toUpperCase()} · ${s15Optimizer.toUpperCase()}`, 12, H - 14, 'rgba(255,255,255,0.5)', 11);
}

s15_reset();

// =====================================
//  NAVIGATION ACTIVE STATE
// =====================================
const sections = document.querySelectorAll('.section[id^="s"]');
const navLinks = document.querySelectorAll('nav li a');

function setActiveNav(targetId) {
    navLinks.forEach(l => {
        const isActive = l.getAttribute('href') === targetId;
        l.classList.toggle('active', isActive);
        const num = l.querySelector('.num');
        if (num) num.style.background = isActive ? 'var(--accent)' : 'var(--bg3)';
        if (num) num.style.color = isActive ? '#fff' : 'var(--text3)';
    });
}

navLinks.forEach(link => {
    link.addEventListener('click', event => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
            const target = document.querySelector(targetId);
            if (target) {
                event.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                window.history.replaceState(null, '', targetId);
                setActiveNav(targetId);
            }
        }
    });
});

const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            const id = e.target.id;
            navLinks.forEach(l => {
                l.classList.toggle('active', l.getAttribute('href') === '#' + id);
                const num = l.querySelector('.num');
                if (num) num.style.background = l.classList.contains('active') ? 'var(--accent)' : 'var(--bg3)';
                if (num) num.style.color = l.classList.contains('active') ? '#fff' : 'var(--text3)';
            });
        }
    });
}, { threshold: 0.3 });

sections.forEach(s => observer.observe(s));

// =====================================
//  HANDLE CANVAS RESIZES
// =====================================
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        s0_draw(); s1_draw(); s2_draw(); s3_draw(); s4_draw(); s5_draw();
        s6_draw(); s7_draw(); s8_draw(); s9_draw(0); s10_draw(0, 0);
        s12_draw(); s13_draw(); s14_draw(0); s15_draw();
    }, 200);
});
