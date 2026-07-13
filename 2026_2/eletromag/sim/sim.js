// ============================================================================
// ELETROMAGNETISMO SIMULATOR
// ============================================================================
const PI = Math.PI,
	sin = Math.sin,
	cos = Math.cos,
	sqrt = Math.sqrt,
	abs = Math.abs,
	min = Math.min,
	max = Math.max,
	atan2 = Math.atan2,
	log = Math.log,
	floor = Math.floor;
const EPS0 = 8.854e-12;

class V {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
	add(v) {
		return new V(this.x + v.x, this.y + v.y);
	}
	sub(v) {
		return new V(this.x - v.x, this.y - v.y);
	}
	mul(s) {
		return new V(this.x * s, this.y * s);
	}
	dot(v) {
		return this.x * v.x + this.y * v.y;
	}
	cross(v) {
		return this.x * v.y - this.y * v.x;
	}
	len() {
		return sqrt(this.x * this.x + this.y * this.y);
	}
	norm() {
		const l = this.len();
		return l > 1e-12 ? this.mul(1 / l) : new V();
	}
	rotate(a) {
		const c = cos(a),
			s = sin(a);
		return new V(this.x * c - this.y * s, this.x * s + this.y * c);
	}
	distTo(p) {
		return this.sub(p).len();
	}
	clone() {
		return new V(this.x, this.y);
	}
}

// Canvas
const canvas = document.getElementById("c"),
	ctx = canvas.getContext("2d");
let W, H, dpr;
function resize() {
	const w = document.getElementById("canvas-wrap");
	if (!w) {
		console.warn("canvas-wrap not found");
		return;
	}
	dpr = window.devicePixelRatio || 1;
	// Force layout flush
	void w.offsetHeight;
	const cs = getComputedStyle(w);
	const r = w.getBoundingClientRect();
	const cw = r.width || parseInt(cs.width) || 0;
	const ch = r.height || parseInt(cs.height) || 0;
	W = Math.max(1, Math.floor(cw || window.innerWidth - 300));
	H = Math.max(1, Math.floor(ch || window.innerHeight - 45));
	canvas.width = W * dpr;
	canvas.height = H * dpr;
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	if (W > 1 && H > 1) console.log("resize:", W, "x", H);
}
window.addEventListener("resize", () => {
	resize();
	activeSim?.resize();
});
resize();

const S = {
	mouse: new V(0, 0),
	md: false,
	drag: null,
	pan: new V(0, 0),
	panS: null,
	zoom: 1,
};

// Color helpers
function magColor(v, max, p = "viridis") {
	const t = min(v / max, 1);
	const cols = {
		viridis: [
			[68, 1, 84],
			[72, 35, 116],
			[64, 67, 135],
			[52, 94, 141],
			[41, 120, 142],
			[32, 144, 140],
			[34, 167, 132],
			[68, 190, 112],
			[121, 209, 81],
			[189, 222, 38],
			[253, 231, 37],
		],
		plasma: [
			[13, 8, 135],
			[75, 3, 161],
			[126, 3, 168],
			[168, 34, 150],
			[203, 70, 121],
			[229, 107, 93],
			[248, 148, 65],
			[253, 195, 40],
			[240, 249, 33],
		],
		hot: [
			[0, 0, 0],
			[150, 0, 0],
			[255, 50, 0],
			[255, 150, 0],
			[255, 255, 0],
			[255, 255, 200],
			[255, 255, 255],
		],
		electric: [
			[20, 30, 80],
			[30, 60, 160],
			[56, 189, 248],
			[129, 200, 200],
			[253, 231, 37],
			[248, 113, 113],
		],
		magnetic: [
			[20, 30, 80],
			[80, 40, 160],
			[129, 140, 248],
			[200, 140, 200],
			[244, 114, 182],
			[251, 191, 36],
		],
	};
	const c = cols[p] || cols.viridis;
	const i = t * (c.length - 1),
		lo = floor(i),
		hi = min(lo + 1, c.length - 1),
		f = i - lo;
	const r = floor(c[lo][0] * (1 - f) + c[hi][0] * f),
		g = floor(c[lo][1] * (1 - f) + c[hi][1] * f),
		b = floor(c[lo][2] * (1 - f) + c[hi][2] * f);
	return `rgb(${r},${g},${b})`;
}
function fieldColor(v) {
	const m = min(v.len() / 2, 1);
	return `rgba(${floor(56 + m * 200)},${floor(189 - m * 100)},${floor(248 - m * 150)},${0.4 + m * 0.6})`;
}

// Charge
class Charge {
	constructor(x, y, q, positive) {
		this.pos = new V(x, y);
		this.q = q;
		this.positive = positive || q > 0;
		this.r = 14;
	}
	draw(c, sel) {
		c.beginPath();
		c.arc(this.pos.x, this.pos.y, this.r, 0, 2 * PI);
		const g = c.createRadialGradient(
			this.pos.x - 3,
			this.pos.y - 3,
			0,
			this.pos.x,
			this.pos.y,
			this.r,
		);
		g.addColorStop(0, this.positive ? "#fca5a5" : "#7dd3fc");
		g.addColorStop(1, this.positive ? "#dc2626" : "#0284c7");
		c.fillStyle = g;
		c.fill();
		if (sel) {
			c.strokeStyle = "#fff";
			c.lineWidth = 2;
			c.stroke();
		}
		c.fillStyle = "#fff";
		c.font = "bold 14px sans-serif";
		c.textAlign = "center";
		c.textBaseline = "middle";
		c.fillText(this.positive ? "+" : "−", this.pos.x, this.pos.y);
	}
}

// Current
class Cur {
	constructor(x1, y1, x2, y2, I) {
		this.p1 = new V(x1, y1);
		this.p2 = new V(x2, y2);
		this.I = I;
	}
	draw(c, sel) {
		c.beginPath();
		c.moveTo(this.p1.x, this.p1.y);
		c.lineTo(this.p2.x, this.p2.y);
		c.strokeStyle = sel ? "#fff" : "#fbbf24";
		c.lineWidth = sel ? 3 : 2.5;
		c.stroke();
		const m = this.p1.add(this.p2).mul(0.5),
			d = this.p2.sub(this.p1).norm(),
			p = new V(-d.y, d.x);
		c.beginPath();
		c.moveTo(
			m.add(d.mul(5)).add(p.mul(-5)).x,
			m.add(d.mul(5)).add(p.mul(-5)).y,
		);
		c.lineTo(m.add(d.mul(5)).add(p.mul(5)).x, m.add(d.mul(5)).add(p.mul(5)).y);
		c.lineTo(m.sub(d.mul(5)).x, m.sub(d.mul(5)).y);
		c.closePath();
		c.fillStyle = "#fbbf24";
		c.fill();
	}
}

// ===== SIMULATION BASE =====
class Sim {
	constructor(name, icon) {
		this.name = name;
		this.icon = icon;
		this.sources = [];
		this.sel = null;
	}
	addSource(s) {
		this.sources.push(s);
	}
	removeSource(i) {
		this.sources.splice(i, 1);
	}
	clearSources() {
		this.sources = [];
	}
	resize() {}
	buildControls(el) {}
	computeField(p) {
		return new V(0, 0);
	}
	computeMag(p) {
		return 0;
	}
	render(c, t) {}
	onMouseDown(x, y) {}
	onMouseMove(x, y) {}
	onMouseUp() {}
	onWheel(d) {}
}

// ===== SIM 0: VECTOR CALCULUS =====
class VecCalcSim extends Sim {
	constructor() {
		super("Cálculo Vetorial", "∇");
		this.mode = "grad";
		this.fldType = 0;
		this.arrowSz = 28;
		this.showScalar = true;
		this.gridDens = 18;
		this.formulaTooltip = {
			title: "Operadores Vetoriais",
			concept: "Gradiente (∇f) mostra direção de maior crescimento. Divergente (∇·F) mede fluxo líquido por volume. Rotacional (∇×F) mede rotação do campo.",
			formula: "∇f = (∂f/∂x, ∂f/∂y) | ∇·F = ∂Fx/∂x + ∂Fy/∂y | ∇×F = ∂Fy/∂x - ∂Fx/∂y"
		};
	}
	fieldF(x, y) {
		if (this.fldType === 0) return { x: 2 * x, y: -2 * y };
		if (this.fldType === 1) return { x: y, y: x };
		return {
			x: -2 * x * Math.exp(-(x * x + y * y) / 100),
			y: -2 * y * Math.exp(-(x * x + y * y) / 100),
		};
	}
	scalarF(x, y) {
		if (this.fldType === 0) return (x * x - y * y) / 100;
		if (this.fldType === 1) return (x * y) / 100;
		return Math.exp(-(x * x + y * y) / 100);
	}
	divF(x, y) {
		const h = 2,
			f1 = this.fieldF(x + h, y),
			f2 = this.fieldF(x - h, y),
			f3 = this.fieldF(x, y + h),
			f4 = this.fieldF(x, y - h);
		return (f1.x - f2.x + (f3.y - f4.y)) / (2 * h);
	}
	curlF(x, y) {
		const h = 2,
			f1 = this.fieldF(x + h, y),
			f2 = this.fieldF(x - h, y),
			f3 = this.fieldF(x, y + h),
			f4 = this.fieldF(x, y - h);
		return (f1.y - f2.y - (f3.x - f4.x)) / (2 * h);
	}
	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">∇</span> ${this.name}</h3>
<div class="formula">∇f = (∂f/∂x, ∂f/∂y)<span class="tooltip-trigger">ℹ</span></div>
<div class="control"><label>Operador</label><select id="mode"><option value="grad">Gradiente</option><option value="div">Divergente</option><option value="curl">Rotacional</option></select></div>
<div class="control"><label>Campo</label><select id="fld"><option value="0">f = x² − y²</option><option value="1">f = xy</option><option value="2">f = e^(−r²)</option></select></div>
<div class="control"><label>Setas <span class="val" id="aV">28</span></label><input type="range" id="asize" min="10" max="50" value="28"></div>
<div class="control"><label>Mapa escalar</label><label class="toggle"><input type="checkbox" id="sc" checked><span class="track"></span></label></div>
<div class="control"><label>Densidade <span class="val" id="dV">18</span></label><input type="range" id="dens" min="6" max="30" value="18"></div>`;
		el.querySelector("#mode").onchange = (e) => (this.mode = e.target.value);
		el.querySelector("#fld").onchange = (e) => (this.fldType = +e.target.value);
		el.querySelector("#asize").oninput = (e) => {
			this.arrowSz = +e.target.value;
			el.querySelector("#aV").textContent = e.target.value;
		};
		el.querySelector("#sc").onchange = (e) =>
			(this.showScalar = e.target.checked);
		el.querySelector("#dens").oninput = (e) => {
			this.gridDens = +e.target.value;
			el.querySelector("#dV").textContent = e.target.value;
		};
	}
	computeField(p) {
		const f = this.fieldF(p.x, p.y);
		return { ...f };
	}
	computeMag(p) {
		const f = this.computeField(p);
		return sqrt(f.x * f.x + f.y * f.y);
	}
	render(c, time) {
		if (W < 2 || H < 2) return;
		c.fillStyle = "#0a0e17";
		c.fillRect(0, 0, W, H);
		const mode = this.mode,
			dens = this.gridDens,
			arrowSz = this.arrowSz;
		if (this.showScalar) {
			const img = c.createImageData(floor(W / 2), floor(H / 2));
			const d = img.data;
			for (let by = 0; by < H; by += 2)
				for (let bx = 0; bx < W; bx += 2) {
					const wx = (bx - W / 2) / 30,
						wy = (by - H / 2) / 30,
						v = this.scalarF(wx, wy),
						t = (v + 1) / 2;
					const col = magColor(max(0, t * 2), 1, "viridis");
					const rgb = col.match(/\d+/g).map(Number);
					for (let dy = 0; dy < 2 && by + dy < H; dy++)
						for (let dx = 0; dx < 2 && bx + dx < W; dx++) {
							const i =
								(floor((by + dy) / 2) * floor(W / 2) + floor((bx + dx) / 2)) *
								4;
							d[i] = rgb[0];
							d[i + 1] = rgb[1];
							d[i + 2] = rgb[2];
							d[i + 3] = 120;
						}
				}
			const tmp = document.createElement("canvas");
			tmp.width = floor(W / 2);
			tmp.height = floor(H / 2);
			const tc = tmp.getContext("2d");
			tc.putImageData(img, 0, 0);
			c.imageSmoothingEnabled = true;
			c.drawImage(tmp, 0, 0, W, H);
		}
		// Grid
		c.strokeStyle = "rgba(255,255,255,0.04)";
		c.lineWidth = 1;
		const step = 50;
		for (let x = 0; x < W; x += step) {
			c.beginPath();
			c.moveTo(x, 0);
			c.lineTo(x, H);
			c.stroke();
		}
		for (let y = 0; y < H; y += step) {
			c.beginPath();
			c.moveTo(0, y);
			c.lineTo(W, y);
			c.stroke();
		}
		// Vector arrows
		const cellW = W / dens,
			cellH = H / dens;
		for (let ci = 0; ci < dens; ci++)
			for (let cj = 0; cj < dens; cj++) {
				const cx = cellW * ci + cellW / 2,
					cy = cellH * cj + cellH / 2;
				const wx = (cx - W / 2) / 30,
					wy = (cy - H / 2) / 30;
				const f = this.fieldF(wx, wy),
					mag = sqrt(f.x * f.x + f.y * f.y);
				if (mag < 0.001) continue;
				const len = min((mag * arrowSz) / 2, arrowSz),
					dir = new V(f.x / mag, f.y / mag);
				const ex = cx + dir.x * len,
					ey = cy + dir.y * len,
					hs = min(5, len * 0.3);
				const perp = new V(-dir.y, dir.x);
				c.beginPath();
				c.moveTo(cx, cy);
				c.lineTo(ex, ey);
				if (mode === "div") {
					const dv = this.divF(wx, wy);
					c.strokeStyle = magColor(max(0, ((dv + 1) / 2) * 3), 1, "hot");
				} else if (mode === "curl") {
					const cl = this.curlF(wx, wy);
					c.strokeStyle = magColor(max(0, ((cl + 1) / 2) * 3), 1, "hot");
				} else c.strokeStyle = `rgba(255,255,255,${min(0.9, mag * 0.5)})`;
				c.lineWidth = 1;
				c.stroke();
				c.beginPath();
				c.moveTo(ex, ey);
				c.lineTo(
					ex - dir.x * hs + perp.x * hs * 0.4,
					ey - dir.y * hs + perp.y * hs * 0.4,
				);
				c.lineTo(
					ex - dir.x * hs - perp.x * hs * 0.4,
					ey - dir.y * hs - perp.y * hs * 0.4,
				);
				c.closePath();
				c.fillStyle = c.strokeStyle;
				c.fill();
			}
		const names = {
			grad: "Gradiente ∇f",
			div: "Divergente ∇·F",
			curl: "Rotacional ∇×F",
		};
		c.fillStyle = "rgba(255,255,255,0.5)";
		c.font = "11px monospace";
		c.fillText(names[mode] || mode, 10, 20);
	}
}

// ===== SIM 1: ELECTROSTATICS =====
class ElectroStaticSim extends Sim {
	constructor() {
		super("Eletrostática", "🔴");
		this.mode = "field";
		this.charges = [];
		this.showLines = true;
		this.fluxSurf = false;
		this.dens = 24;
		this.formulaTooltip = {
			title: "Lei de Coulomb & Lei de Gauss",
			concept: "Força entre cargas proporcional ao produto das cargas e inversamente ao quadrado da distância. Lei de Gauss: fluxo elétrico através de superfície fechada = carga interna/ε₀.",
			formula: "F = k·q₁q₂/r² · r̂ | ∮E·dA = Q/ε₀"
		};
	}
	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">🔴</span> ${this.name}</h3>
<div class="formula">F = k·q₁q₂/r² · r̂<span class="tooltip-trigger">ℹ</span></div>
<div class="btn-row"><button class="btn primary" id="addP">+ Adicionar +</button><button class="btn" id="addN">− Adicionar −</button><button class="btn danger" id="clr">Limpar</button></div>
<div class="control"><label>Modo</label><select id="mode"><option value="field">Campo Elétrico</option><option value="flux">Lei de Gauss</option><option value="pot">Potencial</option></select></div>
<div class="control"><label>Carga (nC) <span class="val" id="qV">1.0</span></label><input type="range" id="q" min="0.1" max="5" step="0.1" value="1"></div>
<div class="control"><label>Linhas de campo</label><label class="toggle"><input type="checkbox" id="lines" checked><span class="track"></span></label></div>
<div class="control"><label>Superfície gaussiana</label><label class="toggle"><input type="checkbox" id="flux"><span class="track"></span></label></div>
<div class="control"><label>Densidade <span class="val" id="dV">24</span></label><input type="range" id="dens" min="8" max="48" value="24"></div>
<div class="legend"><span class="legend-item"><span class="legend-dot" style="background:#f87171"></span>+ Positiva</span><span class="legend-item"><span class="legend-dot" style="background:#38bdf8"></span>− Negativa</span></div>`;
		el.querySelector("#mode").onchange = (e) => (this.mode = e.target.value);
		el.querySelector("#addP").onclick = () => this.addC(true);
		el.querySelector("#addN").onclick = () => this.addC(false);
		el.querySelector("#clr").onclick = () => {
			this.charges = [];
		};
		el.querySelector("#q").oninput = (e) =>
			(el.querySelector("#qV").textContent = (+e.target.value).toFixed(1));
		el.querySelector("#lines").onchange = (e) =>
			(this.showLines = e.target.checked);
		el.querySelector("#flux").onchange = (e) =>
			(this.fluxSurf = e.target.checked);
		el.querySelector("#dens").oninput = (e) => {
			this.dens = +e.target.value;
			el.querySelector("#dV").textContent = e.target.value;
		};
		this.charges = [
			new Charge(W / 2 - 60, H / 2, 1.5, true),
			new Charge(W / 2 + 60, H / 2, -1.5, false),
		];
		this.sources = [...this.charges];
	}
	addC(pos) {
		const q = +document.querySelector("#q")?.value || 1;
		const c = new Charge(
			W / 2 + (Math.random() - 0.5) * 200,
			H / 2 + (Math.random() - 0.5) * 200,
			q,
			pos,
		);
		this.charges.push(c);
	}
	E(p) {
		let e = new V(0, 0);
		this.charges.forEach((c) => {
			const r = c.pos.sub(p),
				d = r.len();
			if (d < 8) return;
			const q = c.q * 1e-9 * 5e4;
			e = e.add(r.norm().mul(q / (d * d)));
		});
		return e;
	}
	V(p) {
		let v = 0;
		this.charges.forEach((c) => {
			const r = c.pos.sub(p),
				d = r.len();
			if (d < 8) return;
			v += (c.q * 1e-9 * 5e4) / d;
		});
		return v;
	}
	onMouseDown(x, y) {
		for (let i = this.charges.length - 1; i >= 0; i--) {
			if (this.charges[i].pos.distTo(new V(x, y)) < 20) {
				S.drag = this.charges[i];
				return;
			}
		}
	}
	onMouseMove(x, y) {
		if (S.drag) S.drag.pos = new V(x, y);
	}
	onMouseUp() {
		S.drag = null;
	}
	render(c, time) {
		if (W < 2 || H < 2) return;
		const mode = this.mode,
			dens = this.dens;
		c.fillStyle = "#0a0e17";
		c.fillRect(0, 0, W, H);
		// Equipotential (background for pot mode)
		if (mode === "pot" || true) {
			const img = c.createImageData(floor(W / 3), floor(H / 3));
			const d = img.data;
			let mx = 0.01;
			for (let by = 0; by < H; by += 3)
				for (let bx = 0; bx < W; bx += 3) {
					const v = abs(this.V(new V(bx, by)));
					if (v > mx) mx = v;
				}
			for (let by = 0; by < H; by += 3)
				for (let bx = 0; bx < W; bx += 3) {
					const v = this.V(new V(bx, by)),
						t = (v + mx) / (mx * 2 + 0.01),
						col = magColor(max(0, min(1, t)), 1, "plasma");
					const rgb = col.match(/\d+/g).map(Number);
					for (let dy = 0; dy < 3 && by + dy < H; dy++)
						for (let dx = 0; dx < 3 && bx + dx < W; dx++) {
							const i =
								(floor((by + dy) / 3) * floor(W / 3) + floor((bx + dx) / 3)) *
								4;
							d[i] = rgb[0];
							d[i + 1] = rgb[1];
							d[i + 2] = rgb[2];
							d[i + 3] = 120;
						}
				}
			const tmp = document.createElement("canvas");
			tmp.width = floor(W / 3);
			tmp.height = floor(H / 3);
			const tc = tmp.getContext("2d");
			tc.putImageData(img, 0, 0);
			c.imageSmoothingEnabled = true;
			c.drawImage(tmp, 0, 0, W, H);
		}
		// Field lines
		if (this.showLines && this.charges.length > 0) {
			const starts = [];
			this.charges.forEach((ch) => {
				for (let i = 0; i < this.dens; i++) {
					const a = (2 * PI * i) / this.dens;
					starts.push(ch.pos.add(new V(cos(a), sin(a)).mul(12)));
				}
			});
			starts.forEach((st) => {
				c.beginPath();
				let p = st.clone();
				c.moveTo(p.x, p.y);
				for (let s = 0; s < 200; s++) {
					const e = this.E(p),
						m = e.len();
					if (m < 1e-6) break;
					p = p.add(e.norm().mul(min(3, 10 / m)));
					if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) break;
					c.lineTo(p.x, p.y);
				}
				const e = this.E(st);
				c.strokeStyle = `rgba(56,189,248,${min(0.6, min(e.len() / 3, 1) * 0.6)})`;
				c.lineWidth = 1.5;
				c.stroke();
			});
		}
		// Gauss surface
		if (this.fluxSurf) {
			const cx = W / 2,
				cy = H / 2;
			c.beginPath();
			c.arc(cx, cy, 120, 0, 2 * PI);
			c.strokeStyle = "rgba(52,211,153,0.6)";
			c.lineWidth = 2;
			c.setLineDash([8, 4]);
			c.stroke();
			c.setLineDash([]);
			c.fillStyle = "rgba(52,211,153,0.08)";
			c.fill();
			let flux = 0;
			for (let i = 0; i < 64; i++) {
				const a = (2 * PI * i) / 64,
					p = new V(cx + 120 * cos(a), cy + 120 * sin(a)),
					n = new V(cos(a), sin(a)),
					e = this.E(p);
				flux += (e.dot(n) * 120 * 2 * PI) / 64;
			}
			const Qenv =
				this.charges.reduce((s, ch) => {
					const d = ch.pos.distTo(new V(cx, cy));
					return s + (d < 120 ? ch.q : 0);
				}, 0) * 1e-9;
			c.fillStyle = "rgba(52,211,153,0.8)";
			c.font = "12px monospace";
			c.fillText(`Fluxo ≈ ${flux.toFixed(2)}`, cx - 60, cy - 130);
			c.fillText(`Q_int ≈ ${(Qenv * 1e9).toFixed(1)} nC`, cx - 70, cy + 140);
			c.fillText(
				`Φ = Q/ε₀ ≈ ${(Qenv / EPS0).toExponential(2)}`,
				cx - 80,
				cy + 156,
			);
		}
		this.charges.forEach((ch) => ch.draw(c, this.sel === ch));
	}
}

// ===== SIM 2: POTENTIAL & DIPOLE =====
class PotentialSim extends Sim {
	constructor() {
		super("Potencial & Dipolo", "⊕");
		this.charges = [];
		this.levels = 15;
		this.maxV = 5;
		this.showLines = true;
		this.showHeat = true;
		this.formulaTooltip = {
			title: "Potencial Elétrico & Energia",
			concept: "Potencial V é energia potencial por unidade de carga. Linhas equipotenciais são perpendiculares às linhas de campo. Energia U = ½CV² para sistemas de cargas.",
			formula: "V = k·q/r | U = ½ε₀∫E²dV | Linhas equipotenciais ⊥ linhas de campo"
		};
	}
	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">⊕</span> ${this.name}</h3>
<div class="formula">V = k·q/r &nbsp;|&nbsp; U = ½ε₀∫E²dV<span class="tooltip-trigger">ℹ</span></div>
<div class="btn-row"><button class="btn primary" id="addP">+ Carga</button><button class="btn" id="addN">− Carga</button><button class="btn" id="dip">Dipolo</button><button class="btn danger" id="clr">Limpar</button></div>
<div class="control"><label>Potencial máx <span class="val" id="mV">5</span></label><input type="range" id="maxV" min="1" max="20" value="5"></div>
<div class="control"><label>Níveis equipotenciais <span class="val" id="lV">15</span></label><input type="range" id="lev" min="5" max="30" value="15"></div>
<div class="control"><label>Linhas de campo</label><label class="toggle"><input type="checkbox" id="lines" checked><span class="track"></span></label></div>
<div class="control"><label>Mapa de calor</label><label class="toggle"><input type="checkbox" id="heat" checked><span class="track"></span></label></div>
<div class="legend"><span class="legend-item"><span class="legend-dot" style="background:#818cf8"></span>Equipotenciais</span><span class="legend-item"><span class="legend-dot" style="background:#38bdf8"></span>Campo (⊥)</span></div>`;
		el.querySelector("#addP").onclick = () => this.addC(true);
		el.querySelector("#addN").onclick = () => this.addC(false);
		el.querySelector("#clr").onclick = () => (this.charges = []);
		el.querySelector("#dip").onclick = () => {
			this.charges = [
				new Charge(W / 2 - 40, H / 2, 2, true),
				new Charge(W / 2 + 40, H / 2, -2, false),
			];
		};
		el.querySelector("#maxV").oninput = (e) => {
			this.maxV = +e.target.value;
			el.querySelector("#mV").textContent = e.target.value;
		};
		el.querySelector("#lev").oninput = (e) => {
			this.levels = +e.target.value;
			el.querySelector("#lV").textContent = e.target.value;
		};
		el.querySelector("#lines").onchange = (e) =>
			(this.showLines = e.target.checked);
		el.querySelector("#heat").onchange = (e) =>
			(this.showHeat = e.target.checked);
		this.charges = [
			new Charge(W / 2 - 40, H / 2, 1.5, true),
			new Charge(W / 2 + 40, H / 2, -1.5, false),
		];
	}
	addC(pos) {
		this.charges.push(
			new Charge(
				W / 2 + (Math.random() - 0.5) * 300,
				H / 2 + (Math.random() - 0.5) * 200,
				pos ? 2 : -2,
				pos,
			),
		);
	}
	E(p) {
		let e = new V(0, 0);
		this.charges.forEach((c) => {
			const r = c.pos.sub(p),
				d = r.len();
			if (d < 6) return;
			e = e.add(r.norm().mul(c.q / (d * d * 100)));
		});
		return e;
	}
	V(p) {
		let v = 0;
		this.charges.forEach((c) => {
			const r = c.pos.sub(p),
				d = r.len();
			if (d < 6) return;
			v += c.q / (d * 20);
		});
		return v;
	}
	onMouseDown(x, y) {
		for (let i = this.charges.length - 1; i >= 0; i--) {
			if (this.charges[i].pos.distTo(new V(x, y)) < 20) {
				S.drag = this.charges[i];
				return;
			}
		}
	}
	onMouseMove(x, y) {
		if (S.drag) S.drag.pos = new V(x, y);
	}
	onMouseUp() {
		S.drag = null;
	}
	render(c, time) {
		if (W < 2 || H < 2) return;
		c.fillStyle = "#0a0e17";
		c.fillRect(0, 0, W, H);
		// Heatmap
		if (this.showHeat) {
			const mx = this.maxV,
				img = c.createImageData(floor(W / 4), floor(H / 4));
			const d = img.data;
			for (let by = 0; by < H; by += 4)
				for (let bx = 0; bx < W; bx += 4) {
					const v = this.V(new V(bx, by)),
						t = (v + mx * 0.5) / (mx + 0.01),
						col = magColor(max(0, min(1, t)), 1, "plasma");
					const rgb = col.match(/\d+/g).map(Number);
					for (let dy = 0; dy < 4 && by + dy < H; dy++)
						for (let dx = 0; dx < 4 && bx + dx < W; dx++) {
							const i =
								(floor((by + dy) / 4) * floor(W / 4) + floor((bx + dx) / 4)) *
								4;
							d[i] = rgb[0];
							d[i + 1] = rgb[1];
							d[i + 2] = rgb[2];
							d[i + 3] = 120;
						}
				}
			const tmp = document.createElement("canvas");
			tmp.width = floor(W / 4);
			tmp.height = floor(H / 4);
			const tc = tmp.getContext("2d");
			tc.putImageData(img, 0, 0);
			c.imageSmoothingEnabled = true;
			c.drawImage(tmp, 0, 0, W, H);
		}
		// Equipotential contours
		for (let i = -this.levels; i <= this.levels; i++) {
			const lv = i * (this.maxV / this.levels);
			c.beginPath();
			this.drawCont(c, lv);
			c.strokeStyle = `rgba(129,140,248,${abs(i) < 3 ? 0.45 : 0.12})`;
			c.lineWidth = 1;
			c.stroke();
		}
		// Field lines
		if (this.showLines) {
			const starts = [];
			this.charges.forEach((ch) => {
				if (ch.q > 0)
					for (let i = 0; i < 16; i++)
						starts.push(
							ch.pos.add(
								new V(cos((2 * PI * i) / 16), sin((2 * PI * i) / 16)).mul(10),
							),
						);
			});
			starts.forEach((st) => {
				c.beginPath();
				let p = st.clone();
				c.moveTo(p.x, p.y);
				for (let s = 0; s < 150; s++) {
					const e = this.E(p),
						m = e.len();
					if (m < 1e-6) break;
					p = p.add(e.norm().mul(min(2, 8 / m)));
					if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) break;
					c.lineTo(p.x, p.y);
				}
				c.strokeStyle = "rgba(56,189,248,0.35)";
				c.lineWidth = 1;
				c.stroke();
			});
		}
		this.charges.forEach((ch) => ch.draw(c, this.sel === ch));
		// Energy
		let u = 0;
		for (let i = 0; i < this.charges.length; i++)
			for (let j = i + 1; j < this.charges.length; j++) {
				const d = this.charges[i].pos.distTo(this.charges[j].pos);
				if (d > 0) u += (this.charges[i].q * this.charges[j].q) / (d * 20);
			}
		c.fillStyle = "rgba(255,255,255,0.6)";
		c.font = "11px monospace";
		c.fillText(`U = ${u.toFixed(4)} J`, 10, H - 10);
	}
	drawCont(c, lv) {
		const r = 2;
		for (let y = 0; y < H; y += r * 4)
			for (let x = 0; x < W; x += r * 4) {
				if (abs(this.V(new V(x, y)) - lv) < 0.4) {
					c.moveTo(x - r, y);
					c.lineTo(x + r, y);
					c.moveTo(x, y - r);
					c.lineTo(x, y + r);
				}
			}
	}
}

// ===== SIM 3: CAPACITANCE =====
class CapSim extends Sim {
	constructor() {
		super("Capacitância", "⊞");
		this.type = "parallel";
		this.V = 10;
		this.d = 80;
		this.A = 4000;
		this.diel = false;
		this.kappa = 2.2;
		this.anim = false;
		this.formulaTooltip = {
			title: "Capacitância & Dielétricos",
			concept: "Capacitância C = Q/V. Dielétricos aumentam capacitância por fator κ (constante dielétrica). Energia armazenada U = ½CV². Campo E diminui com dielétrico.",
			formula: "C = ε₀A/d | C' = κC | U = ½CV² | E = V/d"
		};
	}
	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">⊞</span> ${this.name}</h3>
<div class="formula">C = ε₀A/d &nbsp;|&nbsp; U = ½CV²<span class="tooltip-trigger">ℹ</span></div>
<div class="control"><label>Configuração</label><select id="tp"><option value="parallel">Placas Paralelas</option><option value="cyl">Cilíndrica</option><option value="sph">Esférica</option></select></div>
<div class="control"><label>Tensão V (V) <span class="val" id="vV">10</span></label><input type="range" id="V" min="1" max="50" value="10"></div>
<div class="control"><label>Distância d (mm) <span class="val" id="dV">80</span></label><input type="range" id="d" min="30" max="200" value="80"></div>
<div class="control"><label>Área A (mm²) <span class="val" id="aV">4000</span></label><input type="range" id="A" min="1000" max="10000" value="4000"></div>
<div class="control"><label>Dielétrico</label><label class="toggle"><input type="checkbox" id="diel"><span class="track"></span></label></div>
<div class="control"><label>Animar cargas</label><label class="toggle"><input type="checkbox" id="anim"><span class="track"></span></label></div>
<div class="btn-row"><button class="btn primary" id="calc">Calcular</button></div>
<div class="stat-grid" id="stats"></div>`;
		el.querySelector("#tp").onchange = (e) => (this.type = e.target.value);
		el.querySelector("#V").oninput = (e) => {
			this.V = +e.target.value;
			el.querySelector("#vV").textContent = e.target.value;
		};
		el.querySelector("#d").oninput = (e) => {
			this.d = +e.target.value;
			el.querySelector("#dV").textContent = e.target.value;
		};
		el.querySelector("#A").oninput = (e) => {
			this.A = +e.target.value;
			el.querySelector("#aV").textContent = e.target.value;
		};
		el.querySelector("#diel").onchange = (e) => (this.diel = e.target.checked);
		el.querySelector("#anim").onchange = (e) => (this.anim = e.target.checked);
		el.querySelector("#calc").onclick = () => this.calc(el);
	}
	calc(el) {
		let C;
		if (this.type === "parallel") C = (EPS0 * (this.A / 1e6)) / (this.d / 1e3);
		else if (this.type === "cyl") {
			const a = this.a || 15,
				b = this.b || 40;
			C = (2 * PI * EPS0 * this.d) / log(b / a);
		} else {
			const a = 20,
				b = 50;
			C = (4 * PI * EPS0 * (a * b)) / (b - a);
		}
		if (this.diel) C *= this.kappa;
		const U = 0.5 * C * this.V * this.V,
			Q = C * this.V,
			E = this.V / (this.d / 1e3);
		el.querySelector("#stats").innerHTML =
			`<div class="stat"><div class="num">${(C * 1e12).toFixed(2)}</div><div class="lbl">C (pF)</div></div>
  <div class="stat"><div class="num">${(Q * 1e9).toFixed(3)}</div><div class="lbl">Q (nC)</div></div>
  <div class="stat"><div class="num">${(U * 1e6).toFixed(3)}</div><div class="lbl">U (µJ)</div></div>
  <div class="stat"><div class="num">${(E / 1e3).toFixed(1)}</div><div class="lbl">E (kV/mm)</div></div>`;
	}
	render(c, time) {
		if (W < 2 || H < 2) return;
		c.fillStyle = "#0a0e17";
		c.fillRect(0, 0, W, H);
		const cx = W / 2,
			cy = H / 2,
			t = 0.5 * (1 - cos((2 * PI * time) / 2));
		if (this.type === "parallel") {
			const pw = min(120, this.A / 50),
				ph = min(200, this.A / pw),
				gap = this.d * 0.6;
			c.fillStyle = "#64748b";
			c.fillRect(cx - pw / 2, cy - ph / 2 - gap / 2, pw, 8);
			c.fillRect(cx - pw / 2, cy - ph / 2 + gap / 2 - 8, pw, 8);
			c.fillStyle = "#94a3b8";
			c.font = "12px sans-serif";
			c.fillText("+", cx - pw / 2 - 18, cy - ph / 2 - gap / 2 + 4);
			c.fillText("−", cx - pw / 2 - 18, cy - ph / 2 + gap / 2 + 4);
			if (this.diel) {
				c.fillStyle = "rgba(56,189,248,0.15)";
				c.fillRect(cx - pw / 2, cy - ph / 2 - gap / 2 + 8, pw, gap - 16);
			}
			c.strokeStyle = "rgba(251,191,36,0.35)";
			c.lineWidth = 1;
			for (let i = 0; i < 8; i++) {
				const x = cx - pw / 2 + 15 + (i * (pw - 30)) / 7;
				c.beginPath();
				c.moveTo(x, cy - gap / 2 + 8);
				c.lineTo(x, cy + gap / 2 - 8);
				const ay = cy + t * (gap * 0.15);
				c.moveTo(x, ay);
				c.lineTo(x - 3, ay - 5);
				c.moveTo(x, ay);
				c.lineTo(x + 3, ay - 5);
				c.stroke();
			}
			if (this.diel) {
				c.fillStyle = `rgba(129,140,248,${0.15 + 0.08 * sin(time)})`;
				c.fillRect(
					cx - pw / 2 + 2,
					cy - ph / 2 - gap / 2 + 10,
					pw - 4,
					gap - 20,
				);
				c.fillStyle = "rgba(255,255,255,0.5)";
				c.font = "11px sans-serif";
				c.fillText(`κ=${this.kappa}`, cx - 15, cy + 4);
			}
			c.fillStyle = "rgba(255,255,255,0.3)";
			c.font = "10px monospace";
			c.textAlign = "center";
			c.fillText(`d=${this.d}mm`, cx, cy + gap / 2 + 18);
			c.textAlign = "start";
		} else if (this.type === "cyl") {
			const a = max(15, this.a || 15),
				b = max(30, this.b || 40);
			c.beginPath();
			c.arc(cx, cy, a, 0, 2 * PI);
			c.fillStyle = "#64748b";
			c.fill();
			c.beginPath();
			c.arc(cx, cy, b, 0, 2 * PI);
			c.strokeStyle = "#64748b";
			c.lineWidth = 4;
			c.stroke();
			c.strokeStyle = "rgba(251,191,36,0.3)";
			c.lineWidth = 1;
			for (let i = 0; i < 12; i++) {
				const a2 = (2 * PI * i) / 12;
				c.beginPath();
				c.moveTo(cx + a * cos(a2), cy + a * sin(a2));
				c.lineTo(cx + b * cos(a2), cy + b * sin(a2));
				c.stroke();
			}
			c.fillStyle = "#94a3b8";
			c.font = "11px sans-serif";
			c.fillText("a", cx - 5, cy + 4);
			c.fillText("b", cx + b / 2 - 3, cy + 12);
		} else {
			const a = 20,
				b = 50;
			c.beginPath();
			c.arc(cx, cy, a, 0, 2 * PI);
			c.fillStyle = "#64748b";
			c.fill();
			c.beginPath();
			c.arc(cx, cy, b, 0, 2 * PI);
			c.strokeStyle = "#64748b";
			c.lineWidth = 3;
			c.stroke();
			c.strokeStyle = "rgba(251,191,36,0.25)";
			c.lineWidth = 1;
			for (let i = 0; i < 16; i++) {
				const a2 = (2 * PI * i) / 16;
				c.beginPath();
				c.moveTo(cx + a * cos(a2), cy + a * sin(a2));
				c.lineTo(cx + b * cos(a2), cy + b * sin(a2));
				c.stroke();
			}
			c.fillStyle = "#94a3b8";
			c.font = "11px sans-serif";
			c.fillText("r₁", cx - a / 2 - 10, cy + 4);
			c.fillText("r₂", cx + b / 2 - 3, cy + 12);
		}
		if (this.anim && this.type === "parallel") {
			const pw = min(120, this.A / 50),
				gap = this.d * 0.6,
				n = 20;
			for (let i = 0; i < n; i++) {
				const ag = (2 * PI * i) / n + time * 2,
					x = cx + ((cos(ag) * pw) / 2) * 0.8,
					y = cy + sin(ag) * gap * 0.35;
				c.beginPath();
				c.arc(x, y, 3, 0, 2 * PI);
				c.fillStyle = i % 2 ? "#f87171" : "#38bdf8";
				c.fill();
			}
		}
		c.fillStyle = "rgba(255,255,255,0.5)";
		c.font = "11px monospace";
		c.fillText(`V = ${this.V}V`, 10, 20);
	}
}

// ===== SIM 4: MAGNETOSTATICS =====
class MagnetStaticSim extends Sim {
	constructor() {
		super("Magnetostática", "🧲");
		this.currents = [];
		this.mode = "field";
		this.I = 1;
		this.showLines = true;
		this.dens = 20;
		this.formulaTooltip = {
			title: "Lei de Biot-Savart & Lei de Ampère",
			concept: "Campo magnético gerado por corrente. Biot-Savart: campo de elemento de corrente. Ampère: circulação de B ao longo de curva fechada = μ₀I_enc.",
			formula: "B = (μ₀/4π)∫Idl×r̂/r² | ∮B·dl = μ₀I_enc"
		};
	}
	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">🧲</span> ${this.name}</h3>
<div class="formula">B = (μ₀/4π)∫Idl×r̂/r²<span class="tooltip-trigger">ℹ</span></div>
<div class="btn-row"><button class="btn primary" id="wire">+ Fio</button><button class="btn" id="loop">⭕ Laço</button><button class="btn" id="sol">🔩 Solenóide</button><button class="btn danger" id="clr">Limpar</button></div>
<div class="control"><label>Modo</label><select id="mode"><option value="field">Campo B</option><option value="bihar">Biot-Savart</option><option value="ampere">Ampère</option><option value="hel">Helmholtz</option></select></div>
<div class="control"><label>Corrente I (A) <span class="val" id="iV">1.0</span></label><input type="range" id="I" min="0.1" max="5" step="0.1" value="1"></div>
<div class="control"><label>Linhas de B</label><label class="toggle"><input type="checkbox" id="lines" checked><span class="track"></span></label></div>
<div class="control"><label>Densidade <span class="val" id="dV">20</span></label><input type="range" id="dens" min="8" max="36" value="20"></div>`;
		el.querySelector("#mode").onchange = (e) => (this.mode = e.target.value);
		el.querySelector("#wire").onclick = () => this.addWire();
		el.querySelector("#loop").onclick = () => this.addLoop();
		el.querySelector("#sol").onclick = () => this.addSol();
		el.querySelector("#clr").onclick = () => (this.currents = []);
		el.querySelector("#I").oninput = (e) => {
			this.I = +e.target.value;
			el.querySelector("#iV").textContent = (+e.target.value).toFixed(1);
		};
		el.querySelector("#lines").onchange = (e) =>
			(this.showLines = e.target.checked);
		el.querySelector("#dens").oninput = (e) => {
			this.dens = +e.target.value;
			el.querySelector("#dV").textContent = e.target.value;
		};
		this.addWire();
		this.addWire();
	}
	addWire() {
		const y = H / 2 + (Math.random() - 0.5) * 100;
		this.currents.push({
			t: "w",
			p1: new V(50, y),
			p2: new V(W - 50, y),
			I: this.I * (Math.random() > 0.5 ? 1 : -1),
		});
	}
	addLoop() {
		this.currents.push({ t: "l", cx: W / 2, cy: H / 2, r: 80, I: this.I });
	}
	addSol() {
		this.currents.push({
			t: "s",
			cx: W / 2,
			cy: H / 2,
			w: 160,
			h: 20,
			n: 8,
			I: this.I,
		});
	}
	Bw(p, w) {
		const r1 = w.p1.sub(p),
			r2 = w.p2.sub(p),
			L = w.p2.sub(w.p1),
			dir = L.norm();
		const c1 = r1.dot(dir) / r1.len(),
			c2 = r2.dot(dir.neg()) / r2.len();
		const cr = abs(r1.norm().cross(dir));
		if (cr < 1e-10) return new V(0, 0);
		const B = (w.I * 4e-7 * (c1 + c2)) / (cr * 100 + 1e-10);
		return new V(-dir.y, dir.x).mul(B * (w.I > 0 ? 1 : -1) * 500);
	}
	Bl(p, l) {
		const seg = 32;
		let by = 0;
		for (let i = 0; i < seg; i++) {
			const a1 = (2 * PI * i) / seg,
				a2 = (2 * PI * (i + 0.5)) / seg;
			const p1 = new V(l.cx + l.r * cos(a1), l.cy + l.r * sin(a1)),
				dl = new V(-sin(a2), cos(a2)).mul(l.r * 0.2);
			const r = p.sub(p1),
				d = r.len();
			if (d < 5) continue;
			by += dl.cross(r) / (d * d * d);
		}
		return new V(0, (0.01 * l.I * l.r * l.r) / (l.r * l.r + 5000));
	}
	Bs(p, s) {
		const hw = s.w / 2;
		if (abs(p.x - s.cx) < hw && abs(p.y - s.cy) < s.h)
			return new V(0, 0).mul(s.I * 2e-4);
		const dx = p.x - s.cx,
			dy = p.y - s.cy,
			d = sqrt(dx * dx + dy * dy);
		return new V(-dy, dx).mul((s.I * 1e-5) / (d * 0.01 + 1));
	}
	E(p) {
		let b = new V(0, 0);
		this.currents.forEach((w) => {
			if (w.t === "w") b = b.add(this.Bw(p, w));
			else if (w.t === "l") b = b.add(this.Bl(p, w));
			else b = b.add(this.Bs(p, w));
		});
		return b;
	}
	onMouseDown(x, y) {
		for (let i = this.currents.length - 1; i >= 0; i--) {
			const w = this.currents[i];
			if (w.t === "w") {
				const ab = w.p2.sub(w.p1),
					ap = new V(x, y).sub(w.p1),
					t = max(0, min(1, ap.dot(ab) / ab.dot(ab)));
				if (w.p1.add(ab.mul(t)).sub(new V(x, y)).len() < 15) {
					S.drag = { a: this.currents, i: i };
					return;
				}
			}
		}
	}
	onMouseMove(x, y) {
		if (S.drag && S.drag.a[S.drag.i].t === "w") {
			S.drag.a[S.drag.i].p1 = new V(x, y);
			S.drag.a[S.drag.i].p2 = new V(x + 100, y);
		}
	}
	onMouseUp() {
		S.drag = null;
	}
	render(c, time) {
		if (W < 2 || H < 2) return;
		c.fillStyle = "#0a0e17";
		c.fillRect(0, 0, W, H);
		const dens = this.dens;
		// Current elements
		this.currents.forEach((w) => {
			if (w.t === "w") {
				c.beginPath();
				c.moveTo(w.p1.x, w.p1.y);
				c.lineTo(w.p2.x, w.p2.y);
				c.strokeStyle = "#fbbf24";
				c.lineWidth = 3;
				c.stroke();
				const m = w.p1.add(w.p2).mul(0.5),
					d = w.p2.sub(w.p1).norm(),
					p = new V(-d.y, d.x);
				c.beginPath();
				c.moveTo(
					m.add(d.mul(5)).add(p.mul(-5)).x,
					m.add(d.mul(5)).add(p.mul(-5)).y,
				);
				c.lineTo(
					m.add(d.mul(5)).add(p.mul(5)).x,
					m.add(d.mul(5)).add(p.mul(5)).y,
				);
				c.lineTo(m.sub(d.mul(5)).x, m.sub(d.mul(5)).y);
				c.closePath();
				c.fillStyle = "#fbbf24";
				c.fill();
			} else if (w.t === "l") {
				c.beginPath();
				c.arc(w.cx, w.cy, w.r, 0, 2 * PI);
				c.strokeStyle = "#fbbf24";
				c.lineWidth = 2;
				c.stroke();
				// Arrow on loop
				const aa = time * 0.5;
				const ax = w.cx + w.r * cos(aa),
					ay = w.cy + w.r * sin(aa);
				const ad = new V(-sin(aa), cos(aa));
				c.beginPath();
				c.moveTo(ax + ad.x * 8, ay + ad.y * 8);
				c.lineTo(ax - ad.x * 4 + -ad.y * 6, ay - ad.y * 4 + ad.x * 6);
				c.lineTo(ax - ad.x * 4 + ad.y * 6, ay - ad.y * 4 - ad.x * 6);
				c.closePath();
				c.fillStyle = "#fbbf24";
				c.fill();
			} else if (w.t === "s") {
				const hw = w.w / 2;
				for (let j = 0; j < w.n; j++) {
					const yy = w.cy - w.h / 2 + j * (w.h / w.n);
					c.beginPath();
					c.arc(w.cx - hw, yy, 8, 0, 2 * PI);
					c.strokeStyle = "#fbbf24";
					c.lineWidth = 1.5;
					c.stroke();
					// Current direction dots
					c.beginPath();
					c.arc(w.cx - hw, yy, 3, 0, 2 * PI);
					c.fillStyle = "#fbbf24";
					c.fill();
				}
				c.fillRect(w.cx - hw, w.cy - w.h / 2 - 2, w.w, w.h + 4);
				c.strokeStyle = "rgba(251,191,36,0.3)";
				c.lineWidth = 1;
				c.strokeRect(w.cx - hw, w.cy - w.h / 2 - 2, w.w, w.h + 4);
			}
		});
		// Field lines
		if (this.showLines) {
			const starts = [];
			this.currents.forEach((w) => {
				if (w.t === "w") {
					for (let i = 0; i < 6; i++) {
						const y = w.p1.y + (i - 2.5) * 15;
						starts.push(new V(15, y));
					}
				} else if (w.t === "l") {
					for (let i = 0; i < 12; i++) {
						const a = (2 * PI * i) / 12;
						starts.push(
							new V(w.cx + (w.r + 20) * cos(a), w.cy + (w.r + 20) * sin(a)),
						);
					}
				}
			});
			starts.forEach((st) => {
				c.beginPath();
				let p = st.clone();
				c.moveTo(p.x, p.y);
				for (let s = 0; s < 120; s++) {
					const e = this.E(p),
						m = e.len();
					if (m < 1e-6) break;
					p = p.add(e.norm().mul(min(2, 15 / m)));
					if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) break;
					c.lineTo(p.x, p.y);
				}
				c.strokeStyle = "rgba(129,140,248,0.3)";
				c.lineWidth = 1;
				c.stroke();
			});
		}
		// Labels
		c.fillStyle = "rgba(255,255,255,0.5)";
		c.font = "11px monospace";
		c.fillText(`B = ${this.I}A`, 10, 20);
	}
}

// ===== SIM 5: FARADAY / INDUCTION =====
class FaradaySim extends Sim {
	constructor() {
		super("Faraday / Indução", "⚡");
		this.coilPos = W / 2;
		this.flux = 0;
		this.time = 0;
		this.dragCoil = false;
		this.fieldB = 1;
		this.speed = 1;
		this.showFlux = true;
		this.showEMF = true;
		this.formulaTooltip = {
			title: "Lei de Faraday-Neumann",
			concept: "Força eletromotriz induzida é igual à taxa de variação temporal do fluxo magnético. Sinal negativo indica oposição à mudança (Lei de Lenz).",
			formula: "ε = −dΦ/dt | Φ = ∫B·dA | Lei de Lenz: ε se opõe à variação de Φ"
		};
	}
	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">⚡</span> ${this.name}</h3>
<div class="formula">ε = −dΦ/dt<span class="tooltip-trigger">ℹ</span></div>
<div class="control"><label>Campo B (T) <span class="val" id="bV">1.0</span></label><input type="range" id="B" min="0.1" max="3" step="0.1" value="1"></div>
<div class="control"><label>Velocidade <span class="val" id="sV">1.0</span></label><input type="range" id="spd" min="0.1" max="3" step="0.1" value="1"></div>
<div class="control"><label>Número de voltas <span class="val" id="nV">5</span></label><input type="range" id="n" min="1" max="20" value="5"></div>
<div class="control"><label>Mostrar fluxo</label><label class="toggle"><input type="checkbox" id="flux" checked><span class="track"></span></label></div>
<div class="control"><label>Mostrar EMF</label><label class="toggle"><input type="checkbox" id="emf" checked><span class="track"></span></label></div>
<div class="btn-row"><button class="btn primary" id="play">▶ Animar</button><button class="btn" id="reset">↺ Reset</button></div>
<div class="stat-grid" id="stats"><div class="stat"><div class="num" id="fVal">0</div><div class="lbl">Φ (Wb)</div></div><div class="stat"><div class="num" id="eVal">0</div><div class="lbl">ε (V)</div></div></div>`;
		el.querySelector("#B").oninput = (e) => {
			this.fieldB = +e.target.value;
			el.querySelector("#bV").textContent = (+e.target.value).toFixed(1);
		};
		el.querySelector("#spd").oninput = (e) => {
			this.speed = +e.target.value;
			el.querySelector("#sV").textContent = (+e.target.value).toFixed(1);
		};
		el.querySelector("#n").oninput = (e) => {
			el.querySelector("#nV").textContent = e.target.value;
		};
		el.querySelector("#flux").onchange = (e) =>
			(this.showFlux = e.target.checked);
		el.querySelector("#emf").onchange = (e) =>
			(this.showEMF = e.target.checked);
		el.querySelector("#play").onclick = () => {
			this.playing = !this.playing;
		};
		el.querySelector("#reset").onclick = () => {
			this.time = 0;
			this.playing = false;
		};
	}
	render(c, time) {
		if (W < 2 || H < 2) return;
		c.fillStyle = "#0a0e17";
		c.fillRect(0, 0, W, H);
		const N = +document.querySelector("#n")?.value || 5;
		const bx = this.coilPos;
		const coilW = 100,
			coilH = 140;
		// Uniform B field (horizontal)
		if (this.showFlux) {
			c.strokeStyle = "rgba(129,140,248,0.15)";
			c.lineWidth = 1;
			for (let y = 0; y < H; y += 25) {
				c.beginPath();
				c.moveTo(0, y);
				c.lineTo(W, y);
				c.stroke();
				// Arrow heads
				c.beginPath();
				c.moveTo(W - 10, y - 4);
				c.lineTo(W, y);
				c.lineTo(W - 10, y + 4);
				c.stroke();
			}
			c.fillStyle = "rgba(129,140,248,0.4)";
			c.font = "12px sans-serif";
			c.fillText("B", W - 25, 15);
		}
		// Coil
		c.strokeStyle = "#fbbf24";
		c.lineWidth = 2.5;
		for (let j = 0; j < N; j++) {
			const yy = (coilH / N) * (j + 0.5);
			c.beginPath();
			c.ellipse(bx, H / 2, coilW / 2, yy, 0, 0, 2 * PI);
			c.stroke();
		}
		// Coil fill
		c.fillStyle = "rgba(251,191,36,0.08)";
		c.fillRect(bx - coilW / 2, H / 2 - coilH / 2, coilW, coilH);
		// Flux through coil
		const area = coilW * coilH;
		const theta = this.playing ? this.time * 2 * this.speed : 0;
		const flux = (this.fieldB * area * cos(theta)) / 1e6;
		c.fillStyle = "rgba(52,211,153,0.15)";
		c.fillRect(bx - coilW / 2 + 2, H / 2 - coilH / 2 + 2, coilW - 4, coilH - 4);
		// EMF visualization
		if (this.showEMF) {
			const emf = (this.fieldB * area * sin(theta) * 2 * this.speed) / 1e6;
			// Bar chart
			const barH = 40;
			c.fillStyle = "rgba(52,211,153,0.3)";
			c.fillRect(bx - 20, H / 2 + coilH / 2 + 10, 40, barH);
			const barEmf = ((emf / 1e-3 + 1) * barH) / 2;
			c.fillStyle = emf >= 0 ? "rgba(52,211,153,0.7)" : "rgba(248,113,113,0.7)";
			c.fillRect(
				bx - 18,
				H / 2 + coilH / 2 + 10 + barH / 2 - barEmf,
				36,
				barEmf,
			);
			c.fillStyle = "rgba(255,255,255,0.5)";
			c.font = "10px monospace";
			c.textAlign = "center";
			c.fillText("ε", bx, H / 2 + coilH / 2 + 10 + barH + 14);
			c.textAlign = "start";
		}
		// Update stats
		const emf = (this.fieldB * area * sin(theta) * 2 * this.speed) / 1e6;
		const fv = document.querySelector("#fVal"),
			ev = document.querySelector("#eVal");
		if (fv) fv.textContent = flux.toExponential(3);
		if (ev) ev.textContent = emf.toExponential(3);
		// Time label
		c.fillStyle = "rgba(255,255,255,0.4)";
		c.font = "10px monospace";
		c.fillText(`t=${this.time.toFixed(1)}s`, 10, 20);
		// Animate
		if (this.playing) this.time += 0.016;
	}
	onMouseDown(x, y) {
		if (abs(x - this.coilPos) < 60 && abs(y - H / 2) < 80) {
			this.dragCoil = true;
			S.drag = this;
		}
	}
	onMouseMove(x, y) {
		if (this.dragCoil) this.coilPos = x;
	}
	onMouseUp() {
		this.dragCoil = false;
	}
	resize() {
		this.coilPos = W / 2;
	}
}

// ===== SIM 6: MAXWELL EQUATIONS =====
class MaxwellSim extends Sim {
	constructor() {
		super("Equações de Maxwell", "∿");
		this.charges = [];
		this.time = 0;
		this.playing = true;
		this.mode = "all";
		this.showD = true;
		this.showB = true;
		this.showE = true;
		this.showH = true;
		this.formulaTooltip = {
			title: "Equações de Maxwell",
			concept: "4 equações fundamentais: 1) Gauss E: cargas geram campo elétrico. 2) Gauss B: sem monopolos magnéticos. 3) Faraday: campo variável gera E. 4) Ampère-Maxwell: corrente e E variável geram B.",
			formula: "∇·D=ρ | ∇·B=0 | ∇×E=−∂B/∂t | ∇×H=J+∂D/∂t"
		};
	}
	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">∿</span> ${this.name}</h3>
<div class="formula">∇·D=ρ &nbsp; ∇·B=0 &nbsp; ∇×E=−∂B/∂t &nbsp; ∇×H=J+∂D/∂t<span class="tooltip-trigger">ℹ</span></div>
<div class="btn-row"><button class="btn primary" id="play">▶</button><button class="btn" id="pause">⏸</button><button class="btn danger" id="clr">Limpar</button></div>
<div class="control"><label>Modo</label><select id="mode"><option value="all">Todas</option><option value="gauss_e">Gauss (E)</option><option value="gauss_b">Gauss (B)</option><option value="faraday">Faraday</option><option value="ampere">Ampère-Maxwell</option></select></div>
<div class="control"><label>Cargas <span class="val" id="cV">5</span></label><input type="range" id="nc" min="1" max="15" value="5"></div>
<div class="control"><label>Correntes <span class="val" id="c2">3</span></label><input type="range" id="ni" min="0" max="8" value="3"></div>
<div class="control"><label>Densidade <span class="val" id="dV">16</span></label><input type="range" id="dens" min="8" max="28" value="16"></div>
<div class="legend"><span class="legend-item"><span class="legend-dot" style="background:#38bdf8"></span>∇·D=ρf</span><span class="legend-item"><span class="legend-dot" style="background:#818cf8"></span>∇·B=0</span><span class="legend-item"><span class="legend-dot" style="background:#f472b6"></span>∇×E=−∂B/∂t</span><span class="legend-item"><span class="legend-dot" style="background:#fbbf24"></span>∇×H=J+∂D/∂t</span></div>`;
		el.querySelector("#mode").onchange = (e) => (this.mode = e.target.value);
		el.querySelector("#play").onclick = () => {
			this.playing = true;
		};
		el.querySelector("#pause").onclick = () => {
			this.playing = false;
		};
		el.querySelector("#clr").onclick = () => {
			this.clearSources();
		};
		el.querySelector("#nc").oninput = (e) => {
			this.NC = +e.target.value;
			el.querySelector("#cV").textContent = e.target.value;
		};
		el.querySelector("#ni").oninput = (e) => {
			this.NI = +e.target.value;
			el.querySelector("#c2").textContent = e.target.value;
		};
		el.querySelector("#dens").oninput = (e) => {
			this.dens = +e.target.value;
			el.querySelector("#dV").textContent = e.target.value;
		};
		this.NC = 5;
		this.NI = 3;
		this.dens = 16;
		for (let i = 0; i < this.NC; i++)
			this.charges.push(
				new Charge(
					100 + Math.random() * (W - 200),
					100 + Math.random() * (H - 200),
					Math.random() > 0.5 ? 1 : -1,
					Math.random() > 0.5,
				),
			);
	}
	render(c, time) {
		if (W < 2 || H < 2) return;
		this.time += this.playing ? 0.02 : 0;
		const dens = this.dens || 16;
		const mode = this.mode;
		c.fillStyle = "#0a0e17";
		c.fillRect(0, 0, W, H);
		// Grid
		c.strokeStyle = "rgba(255,255,255,0.03)";
		c.lineWidth = 1;
		for (let x = 0; x < W; x += 50) {
			c.beginPath();
			c.moveTo(x, 0);
			c.lineTo(x, H);
			c.stroke();
		}
		for (let y = 0; y < H; y += 50) {
			c.beginPath();
			c.moveTo(0, y);
			c.lineTo(W, y);
			c.stroke();
		}
		// Charges
		this.charges?.forEach((ch) => {
			ch.draw(c, this.sel === ch);
		});
		// Field visualization based on mode
		const cellW = W / dens,
			cellH = H / dens;
		for (let ci = 0; ci < dens; ci++)
			for (let cj = 0; cj < dens; cj++) {
				const cx = cellW * ci + cellW / 2,
					cy = cellH * cj + cellH / 2;
				const p = new V(cx, cy);
				let ex = 0,
					ey = 0,
					bx = 0,
					by = 0;
				// Compute E from charges
				if (this.charges) {
					this.charges.forEach((ch) => {
						const r = p.sub(ch.pos),
							d = r.len();
						if (d < 8) return;
						ex += r.x / (d * d * 100);
						ey += r.y / (d * d * 100);
					});
				}
				// B from currents
				this.currents?.forEach((w) => {
					if (w.t === "w") {
						const dx = w.p2.x - w.p1.x,
							dy = w.p2.y - w.p1.y;
						const dist2 = (cx - w.p1.x) * dx + (cy - w.p1.y) * dy;
						const r2 = (cx - w.p1.x) ** 2 + (cy - w.p1.y) ** 2;
						bx += (-dy * w.I) / (r2 + 500);
						by += (dx * w.I) / (r2 + 500);
					}
				});
				// Animate with time
				const et = ex + sin(this.time + ci * 0.1) * 0.1,
					ett = ey + cos(this.time + cj * 0.1) * 0.1;
				const bt = bx + cos(this.time * 0.7 + ci * 0.15) * 0.05,
					btt = by + sin(this.time * 0.7 + cj * 0.15) * 0.05;
				const magE = sqrt(et * et + ett * ett),
					magB = sqrt(bt * bt + btt * btt);
				if (magE < 0.01 && magB < 0.01) continue;
				// Show based on mode
				let showE = true,
					showB = true;
				if (mode === "gauss_e") {
					showE = magE > 0.1;
					showB = false;
				} else if (mode === "gauss_b") {
					showE = false;
					showB = magB > 0.05;
				} else if (mode === "faraday") {
					showE = true;
					showB = false;
				} else if (mode === "ampere") {
					showE = false;
					showB = true;
				}
				if (showE && magE > 0.01) {
					const eLen = min(magE * 25, 25),
						eDir = new V(et / magE, ett / magE);
					c.beginPath();
					c.moveTo(cx, cy);
					c.lineTo(cx + eDir.x * eLen, cy + eDir.y * eLen);
					c.strokeStyle = `rgba(56,189,248,${min(0.7, magE * 0.5)})`;
					c.lineWidth = 1;
					c.stroke();
					const hs = min(4, eLen * 0.3);
					const eperp = new V(-eDir.y, eDir.x);
					c.beginPath();
					c.moveTo(cx + eDir.x * eLen, cy + eDir.y * eLen);
					c.lineTo(
						cx + eDir.x * eLen - eDir.x * hs + eperp.x * hs * 0.4,
						cy + eDir.y * eLen - eDir.y * hs + eperp.y * hs * 0.4,
					);
					c.lineTo(
						cx + eDir.x * eLen - eDir.x * hs - eperp.x * hs * 0.4,
						cy + eDir.y * eLen - eDir.y * hs - eperp.y * hs * 0.4,
					);
					c.closePath();
					c.fillStyle = "rgba(56,189,248,0.7)";
					c.fill();
				}
				if (showB && magB > 0.01) {
					const bLen = min(magB * 20, 20),
						bDir = new V(bt / magB, btt / magB);
					c.beginPath();
					c.moveTo(cx, cy);
					c.lineTo(cx + bDir.x * bLen, cy + bDir.y * bLen);
					c.strokeStyle = `rgba(129,140,248,${min(0.7, magB * 3)})`;
					c.lineWidth = 1;
					c.stroke();
				}
			}
		// Title
		const names = {
			all: "Maxwell: ∇·D=ρ | ∇·B=0 | ∇×E=−∂B/∂t | ∇×H=J+∂D/∂t",
			gauss_e: "∇·D = ρf",
			gauss_b: "∇·B = 0",
			faraday: "∇×E = −∂B/∂t",
			ampere: "∇×H = Jf + ∂D/∂t",
		};
		c.fillStyle = "rgba(255,255,255,0.5)";
		c.font = "11px monospace";
		c.fillText(names[mode] || mode, 10, 20);
	}
}

// ===== SIM 7: EM WAVES =====
class WaveSim extends Sim {
	constructor() {
		super("Ondas EM", "∿");
		this.time = 0;
		this.playing = true;
		this.polar = "linear";
		this.freq = 1;
		this.amp = 1;
		this.showB = true;
		this.showPoynting = false;
		this.mode = "propagation";
		this.formulaTooltip = {
			title: "Ondas Eletromagnéticas",
			concept: "Ondas E e B perpendiculares entre si e à direção de propagação. Velocidade c = 1/√(ε₀μ₀). Vetor de Poynting S = E×H representa fluxo de energia.",
			formula: "E(z,t) = E₀cos(kz−ωt+φ) | B = E/c | S = E×H/μ₀ | u_E = u_B"
		};
	}
	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">∿</span> ${this.name}</h3>
<div class="formula">E(z,t) = E₀cos(kz−ωt+φ) &nbsp;|&nbsp; B = E/c<span class="tooltip-trigger">ℹ</span></div>
<div class="btn-row"><button class="btn primary" id="play">▶</button><button class="btn" id="pause">⏸</button></div>
<div class="control"><label>Modo</label><select id="mode"><option value="propagation">Propagação</option><option value="polarization">Polarização</option><option value="energy">Energia</option></select></div>
<div class="control"><label>Frequência <span class="val" id="fV">1.0</span></label><input type="range" class="pink" id="freq" min="0.2" max="3" step="0.1" value="1"></div>
<div class="control"><label>Amplitude <span class="val" id="aV">1.0</span></label><input type="range" class="pink" id="amp" min="0.2" max="2" step="0.1" value="1"></div>
<div class="control"><label>Polarização</label><select id="pol"><option value="linear">Linear</option><option value="circular">Circular</option><option value="elliptical">Elíptica</option></select></div>
<div class="control"><label>Campo B</label><label class="toggle"><input type="checkbox" id="showB" checked><span class="track"></span></label></div>
<div class="control"><label>Vetor Poynting</label><label class="toggle"><input type="checkbox" id="poy"><span class="track"></span></label></div>`;
		el.querySelector("#mode").onchange = (e) => (this.mode = e.target.value);
		el.querySelector("#play").onclick = () => (this.playing = true);
		el.querySelector("#pause").onclick = () => (this.playing = false);
		el.querySelector("#freq").oninput = (e) => {
			this.freq = +e.target.value;
			el.querySelector("#fV").textContent = (+e.target.value).toFixed(1);
		};
		el.querySelector("#amp").oninput = (e) => {
			this.amp = +e.target.value;
			el.querySelector("#aV").textContent = (+e.target.value).toFixed(1);
		};
		el.querySelector("#pol").onchange = (e) => (this.polar = e.target.value);
		el.querySelector("#showB").onchange = (e) =>
			(this.showB = e.target.checked);
		el.querySelector("#poy").onchange = (e) =>
			(this.showPoynting = e.target.checked);
	}
	render(c, time) {
		if (W < 2 || H < 2) return;
		if (this.playing) this.time += 0.016;
		c.fillStyle = "#0a0e17";
		c.fillRect(0, 0, W, H);
		const f = this.freq,
			A = this.amp,
			t = this.time;
		if (this.mode === "propagation") {
			// Propagating wave along z (shown as x axis)
			const midY = H / 2;
			// Grid lines
			c.strokeStyle = "rgba(255,255,255,0.06)";
			c.lineWidth = 1;
			for (let x = 0; x < W; x += 40) {
				c.beginPath();
				c.moveTo(x, 0);
				c.lineTo(x, H);
				c.stroke();
			}
			// E field (vertical)
			c.beginPath();
			for (let x = 0; x < W; x++) {
				const z = (x / W) * 6 * PI;
				const e = A * sin(2 * PI * f * t - z) * 0.3 * H;
				c.lineTo(x, midY - e);
			}
			c.strokeStyle = "#f472b6";
			c.lineWidth = 2;
			c.stroke();
			c.fillStyle = "rgba(244,114,182,0.6)";
			c.font = "12px sans-serif";
			c.fillText("E", W - 20, midY - A * 0.3 * H - 5);
			// B field (depth - shown as offset vertical)
			if (this.showB) {
				c.beginPath();
				for (let x = 0; x < W; x++) {
					const z = (x / W) * 6 * PI;
					const b = A * sin(2 * PI * f * t - z) * 0.2 * H;
					c.lineTo(x, midY - b * 0.7 + 20);
				}
				c.strokeStyle = "#38bdf8";
				c.lineWidth = 1.5;
				c.stroke();
				c.fillStyle = "rgba(56,189,248,0.6)";
				c.font = "12px sans-serif";
				c.fillText("B", W - 20, midY - 0.2 * H * 0.7 + 20 - 5);
			}
			// Propagation direction
			c.beginPath();
			c.moveTo(30, midY + 40);
			c.lineTo(W - 30, midY + 40);
			c.strokeStyle = "rgba(255,255,255,0.3)";
			c.lineWidth = 1;
			c.stroke();
			c.beginPath();
			c.moveTo(W - 35, midY + 35);
			c.lineTo(W - 25, midY + 40);
			c.lineTo(W - 35, midY + 45);
			c.fillStyle = "rgba(255,255,255,0.3)";
			c.fill();
			c.fillStyle = "rgba(255,255,255,0.4)";
			c.font = "10px sans-serif";
			c.fillText("z →", W - 40, midY + 55);
			// Poynting vector
			if (this.showPoynting) {
				c.fillStyle = "rgba(52,211,153,0.5)";
				c.font = "12px sans-serif";
				c.fillText("S = E×H →", 30, midY + 75);
			}
			// Labels
			c.fillStyle = "rgba(255,255,255,0.4)";
			c.font = "10px monospace";
			c.fillText(`λ = ${(3e8 / (f * 1e6)).toExponential(1)}`, 10, 20);
			c.fillText(`f = ${f}×10⁶Hz`, 10, 35);
		} else if (this.mode === "polarization") {
			// Polarization states in 2D
			const cx = W / 2,
				cy = H / 2;
			// Draw E field tip trajectory
			c.strokeStyle = "rgba(255,255,255,0.1)";
			c.lineWidth = 1;
			// Circle for reference
			c.beginPath();
			c.arc(cx, cy, 100, 0, 2 * PI);
			c.strokeStyle = "rgba(255,255,255,0.05)";
			c.stroke();
			// E field tip over time
			c.beginPath();
			for (let s = 0; s < 200; s++) {
				const tt = s * 0.05;
				let ex, ey;
				if (this.polar === "linear") {
					ex = A * cos(tt) * 100;
					ey = A * sin(tt) * 0.1 * 100;
				} else if (this.polar === "circular") {
					ex = A * cos(tt) * 100;
					ey = A * sin(tt) * 100;
				} else {
					ex = A * cos(tt) * 100;
					ey = A * 0.6 * sin(tt) * 100;
				}
				if (s === 0) c.moveTo(cx + ex, cy + ey);
				else c.lineTo(cx + ex, cy + ey);
			}
			c.strokeStyle = "#f472b6";
			c.lineWidth = 2;
			c.stroke();
			// Current tip
			const tt2 = t * 3;
			let tx, ty;
			if (this.polar === "linear") {
				tx = A * cos(tt2) * 100;
				ty = A * sin(tt2) * 0.1 * 100;
			} else if (this.polar === "circular") {
				tx = A * cos(tt2) * 100;
				ty = A * sin(tt2) * 100;
			} else {
				tx = A * cos(tt2) * 100;
				ty = A * 0.6 * sin(tt2) * 100;
			}
			c.beginPath();
			c.arc(cx + tx, cy + ty, 6, 0, 2 * PI);
			c.fillStyle = "#fff";
			c.fill();
			// Axes
			c.strokeStyle = "rgba(255,255,255,0.2)";
			c.lineWidth = 1;
			c.beginPath();
			c.moveTo(cx - 120, cy);
			c.lineTo(cx + 120, cy);
			c.stroke();
			c.beginPath();
			c.moveTo(cx, cy - 120);
			c.lineTo(cx, cy + 120);
			c.stroke();
			c.fillStyle = "rgba(255,255,255,0.4)";
			c.font = "10px sans-serif";
			c.fillText("Ex", cx + 125, cy + 4);
			c.fillText("Ey", cx + 4, cy - 125);
			const polNames = {
				linear: "Linear",
				circular: "Circular",
				elliptical: "Elíptica",
			};
			c.fillText(`Polarização ${polNames[this.polar]}`, 10, 20);
		} else {
			// Energy density
			const midY = H / 2;
			c.beginPath();
			for (let x = 0; x < W; x++) {
				const z = (x / W) * 6 * PI;
				const uE = A * A * sin(2 * PI * f * t - z) ** 2 * 0.3 * H;
				c.lineTo(x, midY - uE);
			}
			c.strokeStyle = "#fbbf24";
			c.lineWidth = 2;
			c.stroke();
			c.fillStyle = "rgba(251,191,36,0.6)";
			c.font = "12px sans-serif";
			c.fillText("u_E = ½εE²", W - 120, midY - 30);
			if (this.showB) {
				c.beginPath();
				for (let x = 0; x < W; x++) {
					const z = (x / W) * 6 * PI;
					const uB = A * A * sin(2 * PI * f * t - z) ** 2 * 0.3 * H;
					c.lineTo(x, midY + uB);
				}
				c.strokeStyle = "#38bdf8";
				c.lineWidth = 1.5;
				c.stroke();
				c.fillStyle = "rgba(56,189,248,0.6)";
				c.fillText("u_B = ½B²/μ", W - 120, midY + 35);
			}
			c.fillStyle = "rgba(255,255,255,0.5)";
			c.font = "11px monospace";
			c.fillText("u_E = u_B (onda plana)", 10, 20);
		}
	}
	onMouseDown(x, y) {}
	onMouseMove(x, y) {}
	onMouseUp() {}
}

// ===== MAIN UI CONTROLLER =====
const sims = [
	new VecCalcSim(),
	new ElectroStaticSim(),
	new PotentialSim(),
	new CapSim(),
	new MagnetStaticSim(),
	new FaradaySim(),
	new MaxwellSim(),
	new WaveSim(),
];
const tabNames = [
	"Cálculo Vet.",
	"Eletrostática",
	"Potencial",
	"Capacitância",
	"Magnetostática",
	"Faraday",
	"Maxwell",
	"Ondas EM",
];
let activeSim = sims[0],
	simIdx = 0;

// Build tabs
const tabsEl = document.getElementById("tabs");
tabNames.forEach((name, i) => {
	const t = document.createElement("div");
	t.className = "tab";
	t.textContent = tabNames[i];
	t.onclick = () => switchSim(i);
	tabsEl.appendChild(t);
});
function switchSim(i) {
	sims[simIdx].playing = false;
	simIdx = i;
	activeSim = sims[i];
	tabsEl
		.querySelectorAll(".tab")
		.forEach((t, j) => (t.className = j === i ? "tab active" : "tab"));
	buildSidebar();
}

// Build sidebar
function buildSidebar() {
	const sb = document.getElementById("sidebar");
	sb.innerHTML = "";
	const panel = document.createElement("div");
	panel.className = "panel";
	activeSim.buildControls(panel);
	sb.appendChild(panel);
}
buildSidebar();
setTimeout(() => {
	resize();
	activeSim?.resize();
}, 50); // ensure canvas dims after flex layout

// Canvas events
canvas.addEventListener("mousedown", (e) => {
	const r = canvas.getBoundingClientRect();
	const x = e.clientX - r.left,
		y = e.clientY - r.top;
	if (e.shiftKey) {
		S.panS = new V(x, y);
		S.pan0 = activeSim.pan?.clone() || new V(0, 0);
		canvas.style.cursor = "grabbing";
		return;
	}
	S.md = true;
	activeSim.onMouseDown(x, y);
});
canvas.addEventListener("mousemove", (e) => {
	const r = canvas.getBoundingClientRect();
	const x = e.clientX - r.left,
		y = e.clientY - r.top;
	S.mouse = new V(x, y);
	if (S.panS) {
		activeSim.pan = activeSim.pan || new V(0, 0);
		activeSim.pan = activeSim.pan0.add(new V(x, y).sub(S.panS).mul(0.5));
		canvas.style.cursor = "move";
		return;
	}
	if (S.md) activeSim.onMouseMove(x, y);
});
canvas.addEventListener("mouseup", () => {
	S.md = false;
	S.panS = null;
	S.drag = null;
	activeSim.onMouseUp();
	canvas.style.cursor = "default";
});
canvas.addEventListener("mouseleave", () => {
	S.md = false;
	S.drag = null;
});
canvas.addEventListener(
	"wheel",
	(e) => {
		e.preventDefault();
		activeSim.onWheel(e.deltaY > 0 ? 0.9 : 1.1);
	},
	{ passive: false },
);

// Touch support
canvas.addEventListener(
	"touchstart",
	(e) => {
		e.preventDefault();
		const t = e.touches[0],
			r = canvas.getBoundingClientRect();
		S.md = true;
		activeSim.onMouseDown(t.clientX - r.left, t.clientY - r.top);
	},
	{ passive: false },
);
canvas.addEventListener(
	"touchmove",
	(e) => {
		e.preventDefault();
		const t = e.touches[0],
			r = canvas.getBoundingClientRect();
		S.md && activeSim.onMouseMove(t.clientX - r.left, t.clientY - r.top);
	},
	{ passive: false },
);
canvas.addEventListener("touchend", () => {
	S.md = false;
	activeSim.onMouseUp();
});

// FPS counter
let fps = 0,
	frames = 0,
	lastFpsTime = performance.now();
function updateFPS(now) {
	frames++;
	if (now - lastFpsTime >= 1000) {
		fps = frames;
		frames = 0;
		lastFpsTime = now;
	}
}

// Main render loop
let lastTime = 0,
	_debugDone = false;
function loop(ts) {
	const dt = (ts - lastTime) / 1000;
	lastTime = ts;
	if (!_debugDone) {
		_debugDone = true;
		console.log(
			"canvas dims:",
			W,
			"x",
			H,
			"sims:",
			sims.length,
			"active:",
			activeSim?.name,
		);
	}
	updateFPS(ts);
	ctx.clearRect(0, 0, W, H);
	ctx.fillStyle = "rgba(248,113,113,0.3)";
	ctx.fillRect(0, 0, 60, 20);
	ctx.fillStyle = "#f87171";
	ctx.font = "11px monospace";
	ctx.fillText("DBG", 5, 14);
	try {
		activeSim.render(ctx, ts / 1000);
	} catch (e) {
		console.error("render err", e.message);
	}
	// Info bar
	const bar = document.getElementById("info-bar");
	bar.innerHTML = `<span>${fps} FPS</span><span>${tabNames[simIdx]}</span><span>Clique arraste para mover cargas</span><span>Shift+arraste para arrastar</span>`;
	requestAnimationFrame(loop);
}
resize(); // final size check before first frame
requestAnimationFrame(loop);

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
	if (e.key === "ArrowRight" && simIdx < sims.length - 1) {
		switchSim(simIdx + 1);
		e.preventDefault();
	} else if (e.key === "ArrowLeft" && simIdx > 0) {
		switchSim(simIdx - 1);
		e.preventDefault();
	} else if (e.key === " ") {
		activeSim.playing = !activeSim.playing;
		e.preventDefault();
	}
});
