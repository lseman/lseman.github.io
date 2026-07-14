// ============================================================================
// SIM 1: ELECTROSTATICS
// ============================================================================
import { Sim } from "../core/sim-base.js";
import { Charge } from "../core/sources.js";
import {
	V,
	PI,
	sin,
	cos,
	sqrt,
	abs,
	min,
	max,
	floor,
	log,
	EPS0, K_E,
} from "../core/math.js";
import { magColor } from "../core/colors.js";
import { W, H, S } from "../core/canvas.js";

export class ElectroStaticSim extends Sim {
	constructor() {
		super("Eletrostática", "🔴");
		this.mode = "field";
		this.charges = [];
		this.showLines = true;
		this.fluxSurf = false;
		this.dens = 24;
		this.chargeMagnitude = 1;
		this.gaussRadius=120;
		this.showForces=true;
		this.showProbe=true;
		this.initialized = false;
		this.hint = "Adicione e arraste cargas; azul é negativa e vermelho é positiva";
	}
	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">🔴</span> ${this.name}</h3>
<div class="formula">F = k·q₁q₂/r² · r̂</div>
<div class="btn-row"><button class="btn primary" id="addP">+ Positiva</button><button class="btn" id="addN">− Negativa</button><button class="btn danger" id="del">Remover</button><button class="btn danger" id="clr">Limpar</button></div>
<div class="control"><label>Modo</label><select id="mode"><option value="field">Campo Elétrico</option><option value="flux">Lei de Gauss</option><option value="pot">Potencial</option></select></div>
<div class="control"><label>Carga (nC) <span class="val" id="qV">1.0</span></label><input type="range" id="q" min="0.1" max="5" step="0.1" value="1"></div>
<div class="control"><label>Linhas de campo</label><label class="toggle"><input type="checkbox" id="lines" checked><span class="track"></span></label></div>
<div class="control"><label>Superfície gaussiana</label><label class="toggle"><input type="checkbox" id="flux"><span class="track"></span></label></div>
<div class="control"><label>Raio gaussiano <span class="val" id="rV">120 px</span></label><input type="range" id="radius" min="50" max="220" value="120"></div>
<div class="control"><label>Força sobre as cargas</label><label class="toggle"><input type="checkbox" id="forces" checked><span class="track"></span></label></div>
<div class="control"><label>Sonda no cursor</label><label class="toggle"><input type="checkbox" id="probe" checked><span class="track"></span></label></div>
<div class="control"><label>Densidade <span class="val" id="dV">24</span></label><input type="range" id="dens" min="8" max="48" value="24"></div>
<div class="legend"><span class="legend-item"><span class="legend-dot" style="background:#f87171"></span>+ Positiva</span><span class="legend-item"><span class="legend-dot" style="background:#38bdf8"></span>− Negativa</span></div>`;
		el.querySelector("#mode").value = this.mode;
		el.querySelector("#lines").checked = this.showLines;
		el.querySelector("#flux").checked = this.fluxSurf;
		el.querySelector("#dens").value = String(this.dens);
		el.querySelector("#dV").textContent = String(this.dens);
		el.querySelector("#q").value = String(this.chargeMagnitude);
		el.querySelector("#qV").textContent = this.chargeMagnitude.toFixed(1);
		el.querySelector("#radius").value=String(this.gaussRadius);el.querySelector("#rV").textContent=`${this.gaussRadius} px`;el.querySelector("#forces").checked=this.showForces;el.querySelector("#probe").checked=this.showProbe;
		el.querySelector("#mode").onchange = (e) => {
			this.mode = e.target.value;
			if (this.mode === "flux") this.fluxSurf = true;
			el.querySelector("#flux").checked = this.fluxSurf;
		};
		el.querySelector("#addP").onclick = () => this.addC(true);
		el.querySelector("#addN").onclick = () => this.addC(false);
		el.querySelector("#del").onclick = () => this.removeSelected();
		el.querySelector("#clr").onclick = () => {
			this.charges = [];
		};
		el.querySelector("#q").oninput = (e) => {
			this.chargeMagnitude = +e.target.value;
			el.querySelector("#qV").textContent = this.chargeMagnitude.toFixed(1);
		};
		el.querySelector("#lines").onchange = (e) =>
			(this.showLines = e.target.checked);
		el.querySelector("#flux").onchange = (e) =>
			(this.fluxSurf = e.target.checked);
		el.querySelector("#radius").oninput=e=>{this.gaussRadius=+e.target.value;el.querySelector("#rV").textContent=`${e.target.value} px`};el.querySelector("#forces").onchange=e=>this.showForces=e.target.checked;el.querySelector("#probe").onchange=e=>this.showProbe=e.target.checked;
		el.querySelector("#dens").oninput = (e) => {
			this.dens = +e.target.value;
			el.querySelector("#dV").textContent = e.target.value;
		};
		if (!this.initialized && this.charges.length === 0) {
			this.charges.push(
				new Charge(W / 2 - 80, H / 2, 1, true),
				new Charge(W / 2 + 80, H / 2, 1, false),
			);
			this.initialized = true;
		}
	}
	addC(pos) {
		const q = this.chargeMagnitude;
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
		const pxPerMeter = 1000;
		this.charges.forEach((c) => {
			const r = p.sub(c.pos),
				dMeters = max(r.len(), c.r) / pxPerMeter;
			e = e.add(r.norm().mul((K_E * c.q * 1e-9) / (dMeters * dMeters)));
		});
		return e;
	}
	V(p) {
		let v = 0;
		const pxPerMeter = 1000;
		this.charges.forEach((c) => {
			const r = c.pos.sub(p),
				dMeters = max(r.len(), c.r) / pxPerMeter;
			v += (K_E * c.q * 1e-9) / dMeters;
		});
		return v;
	}
	onMouseDown(x, y) {
		this.sel = null;
		for (let i = this.charges.length - 1; i >= 0; i--) {
			if (this.charges[i].pos.distTo(new V(x, y)) < 20) {
				this.sel = this.charges[i];
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
	removeSelected() {
		if (!this.sel) return;
		this.charges = this.charges.filter((charge) => charge !== this.sel);
		this.sel = null;
	}
	render(c, time) {
		if (W < 2 || H < 2) return;
		const mode = this.mode,
			dens = this.dens;
		c.fillStyle = "#0a0e17";
		c.fillRect(0, 0, W, H);
		// Equipotential (background for pot mode)
		if (mode === "pot") {
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
					starts.push({p:ch.pos.add(new V(cos(a), sin(a)).mul(12)),direction:ch.q>0?1:-1});
				}
			});
			starts.forEach(({p:st,direction}) => {
				c.beginPath();
				let p = st.clone();
				c.moveTo(p.x, p.y);
				for (let s = 0; s < 200; s++) {
					const e = this.E(p),
						m = e.len();
					if (m < 1e-3) break;
					p = p.add(e.norm().mul(3*direction));
					if (this.charges.some((ch) => ch.q*direction<0 && ch.pos.distTo(p) < ch.r)) {
						c.lineTo(p.x, p.y);
						break;
					}
					if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) break;
					c.lineTo(p.x, p.y);
				}
				const e = this.E(st);
				c.strokeStyle = `rgba(125,211,252,${min(0.85, max(0.3, Math.log10(e.len() + 1) / 5))})`;
				c.lineWidth = 1.5;
				c.stroke();
			});
		}
		// Local field arrows make the field visible even where an integral line
		// terminates at a charge or leaves the viewport.
		if (mode === "field") {
			const spacing = max(28, 500 / dens);
			for (let y = spacing / 2; y < H; y += spacing) {
				for (let x = spacing / 2; x < W; x += spacing) {
					const e = this.E(new V(x, y));
					const m = e.len();
					if (m < 1e-8) continue;
					const u = e.norm();
					const len = min(18, max(6, Math.log10(m + 1) * 4));
					const ex = x + u.x * len, ey = y + u.y * len;
					c.beginPath();
					c.moveTo(x, y);
					c.lineTo(ex, ey);
					c.lineTo(ex - u.x * 4 - u.y * 2.5, ey - u.y * 4 + u.x * 2.5);
					c.moveTo(ex, ey);
					c.lineTo(ex - u.x * 4 + u.y * 2.5, ey - u.y * 4 - u.x * 2.5);
					c.strokeStyle = "rgba(255,255,255,0.55)";
					c.lineWidth = 1;
					c.stroke();
				}
			}
		}
		// Gauss surface
		if (this.fluxSurf) {
			const cx = W / 2,cy = H / 2,radius=this.gaussRadius;
			c.beginPath();
			c.arc(cx, cy, radius, 0, 2 * PI);
			c.strokeStyle = "rgba(52,211,153,0.6)";
			c.lineWidth = 2;
			c.setLineDash([8, 4]);
			c.stroke();
			c.setLineDash([]);
			c.fillStyle = "rgba(52,211,153,0.08)";
			c.fill();
			const Qenv =
				this.charges.reduce((s, ch) => {
					const d = ch.pos.distTo(new V(cx, cy));
					return s + (d < radius ? ch.q : 0);
				}, 0) * 1e-9;
			c.fillStyle = "rgba(52,211,153,0.8)";
			c.font = "12px monospace";
			c.fillText(`Superfície gaussiana (projeção)`, cx - 110, cy - radius-13);
			c.fillText(`Q_int = ${(Qenv * 1e9).toFixed(1)} nC`, cx - 70, cy + radius+20);
			c.fillText(
				`Φ = Q/ε₀ ≈ ${(Qenv / EPS0).toExponential(2)}`,
				cx - 90,
				cy + radius+37,
			);
		}
		if(this.showForces){for(const ch of this.charges){let f=new V();for(const other of this.charges){if(other===ch)continue;const r=ch.pos.sub(other.pos),dm=max(r.len(),20)/1000;f=f.add(r.norm().mul(K_E*ch.q*other.q*1e-18/(dm*dm)))}const m=f.len();if(m>1e-18){const u=f.norm(),len=min(42,max(10,8+Math.log10(m*1e12+1)*9)),ex=ch.pos.x+u.x*len,ey=ch.pos.y+u.y*len;c.beginPath();c.moveTo(ch.pos.x,ch.pos.y);c.lineTo(ex,ey);c.lineTo(ex-u.x*6-u.y*3,ey-u.y*6+u.x*3);c.moveTo(ex,ey);c.lineTo(ex-u.x*6+u.y*3,ey-u.y*6-u.x*3);c.strokeStyle="#fbbf24";c.lineWidth=2;c.stroke()}}}
		this.charges.forEach((ch) => ch.draw(c, this.sel === ch));
		if(this.showProbe){const p=new V(S.mouse.x,S.mouse.y),e=this.E(p),v=this.V(p);const probeW=300,probeH=64,probeX=W-probeW-16,probeY=H-probeH-16;c.fillStyle="rgba(7,10,18,.82)";c.beginPath();c.roundRect(probeX,probeY,probeW,probeH,8);c.fill();c.strokeStyle="rgba(103,232,249,.22)";c.stroke();c.fillStyle="#cbd5e1";c.font="10px monospace";c.fillText(`sonda (${p.x.toFixed(0)}, ${p.y.toFixed(0)}) px`,probeX+10,probeY+22);c.fillText(`E = (${e.x.toExponential(2)}, ${e.y.toExponential(2)}) V/m`,probeX+10,probeY+40);c.fillText(`|E| = ${e.len().toExponential(2)} V/m   V = ${v.toFixed(2)} V`,probeX+10,probeY+58)}
	}
}
