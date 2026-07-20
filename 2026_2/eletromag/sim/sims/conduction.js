// ============================================================================
// SIM: CONDUCTION CURRENT & CHARGE RELAXATION (Sadiku ch. 5)
// ============================================================================
import { Sim } from "../core/sim-base.js";
import { PI, sin, cos, sqrt, min, max, abs, EPS0 } from "../core/math.js";
import { W, H } from "../core/canvas.js";

const MATERIALS = [
	{ key: "copper", name: "Cobre", sigma: 5.8e7, epsr: 1, n: 8.5e28 },
	{ key: "aluminum", name: "Alumínio", sigma: 3.5e7, epsr: 1, n: 6.0e28 },
	{ key: "seawater", name: "Água do mar", sigma: 4, epsr: 81, n: null },
	{ key: "silicon", name: "Silício intrínseco", sigma: 4.4e-4, epsr: 11.8, n: null },
	{ key: "glass", name: "Vidro", sigma: 1e-12, epsr: 5, n: null },
];

export class ConductionSim extends Sim {
	constructor() {
		super("Condução e Relaxação", "⇉");
		this.material = 0; this.voltage = 1; this.length = 10; this.area = 1;
		this.mode = "conduction"; this.time = 0; this.playing = true;
		this.electrons = Array.from({ length: 60 }, (_, i) => ({ u: (i * 0.618) % 1, v: Math.random() }));
		this.hint = "J = σE relaciona corrente e campo; τ = ε/σ mede quão rápido a carga livre desaparece do interior";
	}
	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">⇉</span> ${this.name}</h3>
<div class="formula">J = σE <br> R = ℓ/(σS) <br> τᵣ = ε/σ</div>
<div class="learning-card"><strong>Experimento guiado · Corrente de condução</strong>Compare condutores e dielétricos: mesma tensão, correntes muito diferentes. No modo relaxação, veja a carga volumétrica decair com ρᵥ(t)=ρ₀e^(−t/τᵣ).<em>Em bons condutores τᵣ ≈ 10⁻¹⁹ s: carga livre migra quase instantaneamente para a superfície.</em></div>
<div class="btn-row"><button class="btn primary" id="play">▶</button><button class="btn" id="pause">⏸</button></div>
<div class="control"><label>Modo</label><select id="mode"><option value="conduction">Corrente de condução</option><option value="relaxation">Relaxação de carga</option></select></div>
<div class="control"><label>Material</label><select id="material">${MATERIALS.map((m, i) => `<option value="${i}">${m.name} (σ=${m.sigma.toExponential(1)} S/m)</option>`).join("")}</select></div>
<div class="control"><label>Tensão V <span class="val" id="vV">1.0 V</span></label><input id="voltage" type="range" min="0.1" max="10" step="0.1" value="1"></div>
<div class="control"><label>Comprimento ℓ (cm) <span class="val" id="lV">10</span></label><input id="length" type="range" min="2" max="30" value="10"></div>
<div class="control"><label>Seção S (mm²) <span class="val" id="sV">1.0</span></label><input id="area" type="range" min="0.5" max="10" step="0.5" value="1"></div>
${this.measurementPanel("Condução no material", [["Condutividade σ", "—"], ["Campo E", "—"], ["Densidade J", "—"], ["Corrente I", "—"], ["Resistência R", "—"], ["Tempo de relaxação τᵣ", "—"]])}`;
		el.querySelector("#mode").value = this.mode;
		el.querySelector("#material").value = String(this.material);
		el.querySelector("#voltage").value = String(this.voltage);
		el.querySelector("#length").value = String(this.length);
		el.querySelector("#area").value = String(this.area);
		el.querySelector("#play").onclick = () => (this.playing = true);
		el.querySelector("#pause").onclick = () => (this.playing = false);
		el.querySelector("#mode").onchange = e => { this.mode = e.target.value; this.time = 0; };
		el.querySelector("#material").onchange = e => { this.material = +e.target.value; this.time = 0; };
		el.querySelector("#voltage").oninput = e => { this.voltage = +e.target.value; el.querySelector("#vV").textContent = `${this.voltage.toFixed(1)} V`; };
		el.querySelector("#length").oninput = e => { this.length = +e.target.value; el.querySelector("#lV").textContent = String(this.length); };
		el.querySelector("#area").oninput = e => { this.area = +e.target.value; el.querySelector("#sV").textContent = this.area.toFixed(1); };
	}
	render(c, time) {
		if (W < 2 || H < 2) return;
		const dt = this.playing ? this.deltaTime(time) : (this.deltaTime(time), 0);
		this.time += dt;
		c.fillStyle = "#080d17"; c.fillRect(0, 0, W, H);
		const mat = MATERIALS[this.material], l = this.length / 100, S = this.area * 1e-6;
		const E = this.voltage / l, J = mat.sigma * E, I = J * S, R = l / (mat.sigma * S), tau = EPS0 * mat.epsr / mat.sigma;
		this.updateMeasurements([`${mat.sigma.toExponential(2)} S/m`, `${E.toFixed(2)} V/m`, `${J.toExponential(3)} A/m²`, `${I.toExponential(3)} A`, `${R.toExponential(3)} Ω`, `${tau.toExponential(3)} s`]);
		if (this.mode === "conduction") this.renderConduction(c, mat, E, dt);
		else this.renderRelaxation(c, mat, tau);
	}
	renderConduction(c, mat, E, dt) {
		const barW = min(W * 0.7, 560), barH = min(H * 0.24, 120), x0 = (W - barW) / 2, y0 = H * 0.42 - barH / 2;
		// bar
		const g = c.createLinearGradient(x0, y0, x0, y0 + barH);
		g.addColorStop(0, "#1e293b"); g.addColorStop(0.5, "#334155"); g.addColorStop(1, "#1e293b");
		c.fillStyle = g; c.fillRect(x0, y0, barW, barH);
		c.strokeStyle = "#64748b"; c.lineWidth = 2; c.strokeRect(x0, y0, barW, barH);
		// terminals
		c.fillStyle = "#fb7185"; c.fillRect(x0 - 14, y0 - 6, 14, barH + 12);
		c.fillStyle = "#38bdf8"; c.fillRect(x0 + barW, y0 - 6, 14, barH + 12);
		c.fillStyle = "#fecdd3"; c.font = "bold 14px monospace"; c.fillText("+", x0 - 11, y0 - 12);
		c.fillStyle = "#bae6fd"; c.fillText("−", x0 + barW + 3, y0 - 12);
		// drift speed on screen: log-mapped so glass ≈ frozen, copper fast
		const speed = min(160, 22 * max(0, Math.log10(mat.sigma * E) + 13));
		for (const p of this.electrons) {
			p.u = ((p.u - speed * dt / barW) % 1 + 1) % 1;
			const px = x0 + p.u * barW, py = y0 + 10 + p.v * (barH - 20) + 3 * sin(this.time * 7 + p.v * 40);
			c.beginPath(); c.arc(px, py, 3.2, 0, 2 * PI); c.fillStyle = "rgba(103,232,249,.85)"; c.fill();
		}
		// E field arrows inside
		for (let i = 1; i < 6; i++) {
			const ax = x0 + (i / 6) * barW, ay = y0 + barH + 26;
			c.beginPath(); c.moveTo(ax - 14, ay); c.lineTo(ax + 14, ay); c.lineTo(ax + 8, ay - 4); c.moveTo(ax + 14, ay); c.lineTo(ax + 8, ay + 4);
			c.strokeStyle = "rgba(251,113,133,.7)"; c.lineWidth = 1.6; c.stroke();
		}
		c.fillStyle = "#fda4af"; c.font = "11px monospace"; c.fillText("E (elétrons derivam no sentido oposto)", x0, y0 + barH + 48);
		c.fillStyle = "#94a3b8"; c.fillText(`${mat.name} · vd na tela ∝ log(σE)`, x0, y0 - 30);
		// σ scale bar
		const scY = H * 0.82, scW = min(W * 0.6, 480), scX = (W - scW) / 2;
		c.strokeStyle = "rgba(148,163,184,.4)"; c.lineWidth = 1; c.beginPath(); c.moveTo(scX, scY); c.lineTo(scX + scW, scY); c.stroke();
		c.fillStyle = "#94a3b8"; c.font = "10px monospace"; c.fillText("isolante", scX, scY + 16); c.fillText("condutor", scX + scW - 52, scY + 16);
		for (const [i, m] of MATERIALS.entries()) {
			const t = (Math.log10(m.sigma) + 13) / 21, mx = scX + max(0, min(1, t)) * scW;
			c.beginPath(); c.arc(mx, scY, i === this.material ? 6 : 3.5, 0, 2 * PI);
			c.fillStyle = i === this.material ? "#fbbf24" : "#475569"; c.fill();
			if (i === this.material) { c.fillStyle = "#fde68a"; c.fillText(m.name, mx - 20, scY - 12); }
		}
		c.fillStyle = "#64748b"; c.fillText("escala log de σ (S/m)", scX, scY + 30);
	}
	renderRelaxation(c, mat, tau) {
		// display time constant remapped so every material animates visibly
		const T = 4, tt = (this.time % (2 * T)) / T, phase = min(1, tt), rho = Math.exp(-phase * 5);
		const cx = W * 0.3, cy = H * 0.45, r0 = min(W, H) * 0.16;
		// conductor block
		c.fillStyle = "#1e293b"; c.strokeStyle = "#64748b"; c.lineWidth = 2;
		c.beginPath(); c.roundRect(cx - r0 * 1.9, cy - r0 * 1.9, r0 * 3.8, r0 * 3.8, 14); c.fill(); c.stroke();
		// interior charge fading, surface charge growing
		c.beginPath(); c.arc(cx, cy, r0 * (0.4 + 0.25 * rho), 0, 2 * PI);
		c.fillStyle = `rgba(251,113,133,${0.75 * rho})`; c.fill();
		const nSurf = 20;
		for (let i = 0; i < nSurf; i++) {
			const a = (i / nSurf) * 2 * PI, side = max(abs(cos(a)), abs(sin(a)));
			const sx = cx + cos(a) / side * r0 * 1.85, sy = cy + sin(a) / side * r0 * 1.85;
			c.beginPath(); c.arc(sx, sy, 4, 0, 2 * PI); c.fillStyle = `rgba(251,113,133,${0.85 * (1 - rho)})`; c.fill();
		}
		c.fillStyle = "#94a3b8"; c.font = "11px monospace";
		c.fillText("ρᵥ interna → 0", cx - r0 * 1.85, cy + r0 * 2.35);
		c.fillText("carga migra para a superfície", cx - r0 * 1.85, cy + r0 * 2.35 + 16);
		// decay curve
		const gx = W * 0.58, gy = H * 0.22, gw = W * 0.34, gh = H * 0.45;
		c.strokeStyle = "rgba(148,163,184,.35)"; c.lineWidth = 1;
		c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx, gy + gh); c.lineTo(gx + gw, gy + gh); c.stroke();
		c.beginPath();
		for (let i = 0; i <= 100; i++) { const t = i / 100, y = Math.exp(-t * 5); i ? c.lineTo(gx + t * gw, gy + gh * (1 - y)) : c.moveTo(gx, gy); }
		c.strokeStyle = "#67e8f9"; c.lineWidth = 2; c.stroke();
		// marker at t = τ (e^-1)
		const mx = gx + gw / 5;
		c.setLineDash([4, 4]); c.strokeStyle = "rgba(251,191,36,.6)";
		c.beginPath(); c.moveTo(mx, gy + gh); c.lineTo(mx, gy + gh * (1 - Math.exp(-1))); c.lineTo(gx, gy + gh * (1 - Math.exp(-1))); c.stroke(); c.setLineDash([]);
		c.beginPath(); c.arc(gx + phase * gw, gy + gh * (1 - rho), 5, 0, 2 * PI); c.fillStyle = "#fbbf24"; c.fill();
		c.fillStyle = "#94a3b8"; c.font = "11px monospace";
		c.fillText("ρᵥ(t) = ρ₀e^(−t/τᵣ)", gx + 8, gy + 14);
		c.fillStyle = "#fde68a"; c.fillText(`τᵣ = ε/σ = ${tau.toExponential(2)} s (${mat.name})`, gx + 8, gy + 32);
		c.fillStyle = "#64748b"; c.fillText("t = τᵣ → 36,8%", mx + 6, gy + gh - 6);
	}
}
