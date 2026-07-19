// ============================================================================
// SIM: MAGNETIC MATERIALS, MAGNETIZATION & HYSTERESIS (Sadiku ch. 8)
// ============================================================================
import { Sim } from "../core/sim-base.js";
import { PI, sin, cos, min, max, abs, MU0 } from "../core/math.js";
import { W, H } from "../core/canvas.js";

const MATERIALS = [
	{ key: "vacuum", name: "Vácuo", chi: 0, type: "linear" },
	{ key: "bismuth", name: "Bismuto (diamagnético)", chi: -1.66e-4, type: "linear" },
	{ key: "aluminum", name: "Alumínio (paramagnético)", chi: 2.2e-5, type: "linear" },
	{ key: "softiron", name: "Ferro doce (ferromagnético)", chi: null, type: "hyst", Bs: 1.6, Hc: 80, Hs: 220 },
	{ key: "alnico", name: "Alnico (ímã duro)", chi: null, type: "hyst", Bs: 1.25, Hc: 5.0e4, Hs: 6.0e4 },
];

export class MagneticMaterialsSim extends Sim {
	constructor() {
		super("Materiais Magnéticos", "🧲");
		this.material = 3; this.h0 = 400; this.speed = 1;
		this.time = 0; this.playing = true;
		this.trail = []; this.prevH = 0;
		this.hint = "M = χₘH nos materiais lineares; ferromagnéticos exibem saturação e histerese";
	}
	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">🧲</span> ${this.name}</h3>
<div class="formula">M = χₘH &nbsp;|&nbsp; B = μ₀(H + M) = μ₀μᵣH &nbsp;|&nbsp; μᵣ = 1 + χₘ</div>
<div class="learning-card"><strong>Experimento guiado · Curva B–H</strong>Aplique um campo H senoidal e observe a resposta B do material. Nos ferromagnéticos, o laço de histerese revela remanência Bᵣ e coercividade H꜀.<em>A área do laço é a energia dissipada por ciclo — relevante em núcleos de transformadores.</em></div>
<div class="btn-row"><button class="btn primary" id="play">▶</button><button class="btn" id="pause">⏸</button><button class="btn" id="clear">Limpar traço</button></div>
<div class="control"><label>Material</label><select id="material">${MATERIALS.map((m, i) => `<option value="${i}">${m.name}</option>`).join("")}</select></div>
<div class="control"><label>Amplitude H₀ (A/m) <span class="val" id="hV">400</span></label><input id="h0" type="range" min="50" max="1000" step="10" value="400"></div>
<div class="control"><label>Velocidade <span class="val" id="sV">1.0</span></label><input id="speed" type="range" min="0.2" max="3" step="0.1" value="1"></div>
${this.measurementPanel("Resposta do material", [["Suscetibilidade χₘ", "—"], ["Permeabilidade μᵣ", "—"], ["H aplicado", "—"], ["Magnetização M", "—"], ["Indução B", "—"], ["Remanência Bᵣ / Coerciv. H꜀", "—"]])}`;
		el.querySelector("#material").value = String(this.material);
		el.querySelector("#h0").value = String(this.h0);
		el.querySelector("#speed").value = String(this.speed);
		el.querySelector("#play").onclick = () => (this.playing = true);
		el.querySelector("#pause").onclick = () => (this.playing = false);
		el.querySelector("#clear").onclick = () => (this.trail = []);
		el.querySelector("#material").onchange = e => { this.material = +e.target.value; this.trail = []; };
		el.querySelector("#h0").oninput = e => { this.h0 = +e.target.value; el.querySelector("#hV").textContent = String(this.h0); this.trail = []; };
		el.querySelector("#speed").oninput = e => { this.speed = +e.target.value; el.querySelector("#sV").textContent = this.speed.toFixed(1); };
	}
	// phenomenological hysteresis: two tanh branches shifted by ±Hc
	bOf(mat, Hv, rising) {
		if (mat.type === "linear") return MU0 * (1 + mat.chi) * Hv;
		const shift = rising ? -mat.Hc : mat.Hc;
		return mat.Bs * Math.tanh((Hv + shift) / mat.Hs * 2.4);
	}
	render(c, time) {
		if (W < 2 || H < 2) return;
		const dt = this.playing ? this.deltaTime(time) : (this.deltaTime(time), 0);
		this.time += dt * this.speed;
		c.fillStyle = "#080d17"; c.fillRect(0, 0, W, H);
		const mat = MATERIALS[this.material];
		const hAmp = mat.type === "hyst" && mat.Hc > 1000 ? this.h0 * 200 : this.h0; // hard magnet needs bigger drive
		const Hv = hAmp * sin(this.time * 1.4);
		const rising = Hv >= this.prevH; this.prevH = Hv;
		const Bv = this.bOf(mat, Hv, rising);
		const Mv = Bv / MU0 - Hv;
		if (this.playing) { this.trail.push({ H: Hv, B: Bv }); if (this.trail.length > 700) this.trail.shift(); }
		// ---- B-H plot ----
		const gx = W * 0.08, gy = H * 0.1, gw = W * 0.5, gh = H * 0.72, cxp = gx + gw / 2, cyp = gy + gh / 2;
		const bMax = mat.type === "hyst" ? mat.Bs * 1.25 : max(1e-12, MU0 * (1 + abs(mat.chi) * 3 + 1) * hAmp * 1.3);
		const px = Hv2 => cxp + (Hv2 / (hAmp * 1.25)) * (gw / 2), py = Bv2 => cyp - (Bv2 / bMax) * (gh / 2);
		c.strokeStyle = "rgba(148,163,184,.3)"; c.lineWidth = 1;
		c.beginPath(); c.moveTo(gx, cyp); c.lineTo(gx + gw, cyp); c.moveTo(cxp, gy); c.lineTo(cxp, gy + gh); c.stroke();
		c.fillStyle = "#94a3b8"; c.font = "11px monospace";
		c.fillText("H (A/m)", gx + gw - 56, cyp - 8); c.fillText("B (T)", cxp + 8, gy + 12);
		// trail
		if (this.trail.length > 1) {
			c.beginPath();
			this.trail.forEach((p, i) => { const x = px(p.H), y = py(p.B); i ? c.lineTo(x, y) : c.moveTo(x, y); });
			c.strokeStyle = "#67e8f9"; c.lineWidth = 2; c.shadowColor = "#67e8f9"; c.shadowBlur = 5; c.stroke(); c.shadowBlur = 0;
		}
		// current point
		c.beginPath(); c.arc(px(Hv), py(Bv), 6, 0, 2 * PI); c.fillStyle = "#fbbf24"; c.fill();
		// Br / Hc markers for hysteretic materials
		if (mat.type === "hyst") {
			const Br = this.bOf(mat, 0, false), HcEff = mat.Hc;
			c.setLineDash([4, 4]); c.strokeStyle = "rgba(251,113,133,.55)";
			c.beginPath(); c.moveTo(cxp, py(Br)); c.lineTo(cxp - 40, py(Br)); c.stroke();
			c.beginPath(); c.moveTo(px(-HcEff), cyp); c.lineTo(px(-HcEff), cyp + 30); c.stroke(); c.setLineDash([]);
			c.fillStyle = "#fda4af"; c.font = "10px monospace";
			c.fillText("Bᵣ", cxp - 58, py(Br) + 4); c.fillText("−H꜀", px(-HcEff) - 14, cyp + 44);
		}
		// ---- domain cartoon ----
		const dx0 = W * 0.66, dy0 = H * 0.14, dw = W * 0.28, dh = H * 0.38;
		c.fillStyle = "#111827"; c.strokeStyle = "#334155"; c.lineWidth = 1.5;
		c.beginPath(); c.roundRect(dx0, dy0, dw, dh, 10); c.fill(); c.stroke();
		const align = mat.type === "hyst" ? max(-1, min(1, Bv / mat.Bs)) : max(-1, min(1, Mv / max(1e-9, abs(mat.chi) * hAmp) * (mat.chi < 0 ? -1 : 1))) * (mat.chi < 0 ? -1 : 1) * (mat.chi === 0 ? 0 : 1);
		for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) {
			const ax = dx0 + (i + 0.5) * dw / 5, ay = dy0 + (j + 0.5) * dh / 3;
			const seed = sin(i * 12.9 + j * 78.2) * 43758.5453, rnd = (seed - Math.floor(seed)) * 2 * PI;
			// mix random domain direction with field direction based on alignment
			const angBase = align >= 0 ? 0 : PI, mix = abs(align);
			const ang = rnd * (1 - mix) + angBase * mix, L = 13;
			c.beginPath(); c.moveTo(ax - cos(ang) * L, ay + sin(ang) * L * 0.3); c.lineTo(ax + cos(ang) * L, ay - sin(ang) * L * 0.3);
			c.lineTo(ax + cos(ang) * (L - 5) - sin(ang) * 3, ay - sin(ang) * (L - 5) * 0.3 - cos(ang) * 3);
			c.moveTo(ax + cos(ang) * L, ay - sin(ang) * L * 0.3);
			c.lineTo(ax + cos(ang) * (L - 5) + sin(ang) * 3, ay - sin(ang) * (L - 5) * 0.3 + cos(ang) * 3);
			c.strokeStyle = mat.type === "hyst" ? "#34d399" : "rgba(148,163,184,.7)"; c.lineWidth = 1.6; c.stroke();
		}
		c.fillStyle = "#94a3b8"; c.font = "10px monospace";
		c.fillText(mat.type === "hyst" ? "domínios magnéticos alinham com H" : mat.chi < 0 ? "resposta fraca oposta a H (χₘ<0)" : mat.chi > 0 ? "resposta fraca a favor de H (χₘ>0)" : "sem resposta material", dx0, dy0 + dh + 18);
		// H drive gauge
		const hx = dx0, hy = dy0 + dh + 40, hw = dw;
		c.strokeStyle = "rgba(148,163,184,.35)"; c.beginPath(); c.moveTo(hx, hy + 12); c.lineTo(hx + hw, hy + 12); c.stroke();
		c.beginPath(); c.arc(hx + hw / 2 + (Hv / (hAmp * 1.25)) * hw / 2, hy + 12, 6, 0, 2 * PI); c.fillStyle = "#fb7185"; c.fill();
		c.fillStyle = "#fda4af"; c.font = "10px monospace"; c.fillText(`H(t) = ${hAmp.toExponential(1)}·sin(ωt) A/m`, hx, hy);
		const muR = mat.type === "linear" ? 1 + mat.chi : (abs(Hv) > 1e-9 ? Bv / (MU0 * Hv) : 0);
		this.updateMeasurements([
			mat.type === "linear" ? mat.chi.toExponential(2) : "não linear",
			mat.type === "linear" ? (1 + mat.chi).toFixed(6) : `${abs(muR).toFixed(0)} (efetiva)`,
			`${Hv.toFixed(1)} A/m`, `${Mv.toExponential(3)} A/m`, `${Bv.toExponential(3)} T`,
			mat.type === "hyst" ? `${this.bOf(mat, 0, false).toFixed(2)} T / ${mat.Hc.toExponential(1)} A/m` : "— (sem histerese)",
		]);
	}
}
