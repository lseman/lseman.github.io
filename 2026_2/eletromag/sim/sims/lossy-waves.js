// ============================================================================
// SIM: PLANE WAVES IN LOSSY MEDIA & SKIN DEPTH (Sadiku ch. 10.3-10.6)
// ============================================================================
import { Sim } from "../core/sim-base.js";
import { PI, sin, cos, sqrt, min, max, EPS0, MU0 } from "../core/math.js";
import { W, H } from "../core/canvas.js";

const PRESETS = [
	{ name: "Personalizado", sigma: null },
	{ name: "Ar seco", sigma: 1e-15, epsr: 1 },
	{ name: "Água doce", sigma: 1e-2, epsr: 80 },
	{ name: "Água do mar", sigma: 4, epsr: 81 },
	{ name: "Solo úmido", sigma: 1e-2, epsr: 10 },
	{ name: "Cobre", sigma: 5.8e7, epsr: 1 },
];

export class LossyWaveSim extends Sim {
	constructor() {
		super("Ondas em Meios com Perdas", "≈");
		this.freq = 6; // log10(f/Hz) → 1 MHz
		this.sigma = 4; this.epsr = 81; this.time = 0; this.playing = true;
		this.hint = "tan δ = σ/(ωε) separa bons dielétricos de bons condutores; em condutores a onda mal penetra (efeito pelicular)";
	}
	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">≈</span> ${this.name}</h3>
<div class="formula">γ = α + jβ <br> E = E₀e^(−αz)cos(ωt−βz) <br> δ = 1/α</div>
<div class="learning-card"><strong>Experimento guiado · Atenuação e efeito pelicular</strong>Escolha um meio e varie a frequência: observe a envoltória e^(−αz) e a profundidade pelicular δ. Compare água do mar em 1 kHz e 1 GHz.<em>tan δ ≫ 1: bom condutor · tan δ ≪ 1: bom dielétrico.</em></div>
<div class="btn-row"><button class="btn primary" id="play">▶</button><button class="btn" id="pause">⏸</button></div>
<div class="control"><label>Meio (preset)</label><select id="preset">${PRESETS.map((p, i) => `<option value="${i}">${p.name}</option>`).join("")}</select></div>
<div class="control"><label>Frequência <span class="val" id="fV">1.0 MHz</span></label><input id="freq" type="range" min="3" max="10" step="0.1" value="6"></div>
<div class="control"><label>Condutividade σ (10^x S/m) <span class="val" id="sV">10⁰⋅⁶</span></label><input id="sigmaExp" type="range" min="-15" max="8" step="0.1" value="0.602"></div>
<div class="control"><label>Permissividade εᵣ <span class="val" id="eV">81</span></label><input id="epsr" type="range" min="1" max="81" step="1" value="81"></div>
${this.measurementPanel("Propagação no meio", [["Classificação", "—"], ["tan δ = σ/ωε", "—"], ["Atenuação α", "—"], ["Fase β", "—"], ["Prof. pelicular δ", "—"], ["Comprimento λ", "—"], ["Impedância |η| ∠θ", "—"]])}`;
		el.querySelector("#play").onclick = () => (this.playing = true);
		el.querySelector("#pause").onclick = () => (this.playing = false);
		const fmtSigma = () => { el.querySelector("#sV").textContent = `${this.sigma.toExponential(1)} S/m`; };
		el.querySelector("#freq").value = String(this.freq);
		el.querySelector("#sigmaExp").value = String(Math.log10(this.sigma));
		el.querySelector("#epsr").value = String(this.epsr);
		fmtSigma();
		el.querySelector("#freq").oninput = e => { this.freq = +e.target.value; const f = 10 ** this.freq; el.querySelector("#fV").textContent = f >= 1e9 ? `${(f / 1e9).toFixed(1)} GHz` : f >= 1e6 ? `${(f / 1e6).toFixed(1)} MHz` : `${(f / 1e3).toFixed(1)} kHz`; };
		el.querySelector("#sigmaExp").oninput = e => { this.sigma = 10 ** +e.target.value; el.querySelector("#preset").value = "0"; fmtSigma(); };
		el.querySelector("#epsr").oninput = e => { this.epsr = +e.target.value; el.querySelector("#eV").textContent = String(this.epsr); el.querySelector("#preset").value = "0"; };
		el.querySelector("#preset").onchange = e => {
			const p = PRESETS[+e.target.value]; if (!p.sigma && p.sigma !== 0) return;
			this.sigma = p.sigma; this.epsr = p.epsr;
			el.querySelector("#sigmaExp").value = String(Math.log10(p.sigma));
			el.querySelector("#epsr").value = String(p.epsr); el.querySelector("#eV").textContent = String(p.epsr);
			fmtSigma();
		};
	}
	render(c, time) {
		if (W < 2 || H < 2) return;
		this.time += this.playing ? this.deltaTime(time) : (this.deltaTime(time), 0);
		c.fillStyle = "#080d17"; c.fillRect(0, 0, W, H);
		const f = 10 ** this.freq, omega = 2 * PI * f, eps = EPS0 * this.epsr, mu = MU0;
		const tand = this.sigma / (omega * eps);
		// exact lossy-medium formulas (Sadiku 10.23-10.24)
		const root = sqrt(1 + tand * tand);
		const alpha = omega * sqrt(mu * eps / 2 * (root - 1));
		const beta = omega * sqrt(mu * eps / 2 * (root + 1));
		const delta = alpha > 0 ? 1 / alpha : Infinity;
		const lambda = 2 * PI / beta;
		const etaAbs = sqrt(mu / eps) / Math.pow(1 + tand * tand, 0.25);
		const etaAng = 0.5 * Math.atan(tand) * 180 / PI;
		const klass = tand > 100 ? "bom condutor (tan δ ≫ 1)" : tand < 0.01 ? "bom dielétrico (tan δ ≪ 1)" : "meio quase-condutor";
		this.updateMeasurements([klass, tand.toExponential(2), `${alpha.toExponential(3)} Np/m`, `${beta.toExponential(3)} rad/m`, isFinite(delta) ? `${delta.toExponential(3)} m` : "∞", `${lambda.toExponential(3)} m`, `${etaAbs.toFixed(2)} Ω ∠${etaAng.toFixed(1)}°`]);
		// ---- wave plot: z axis spans 5 skin depths or 3 wavelengths, whichever shows structure ----
		const gx = W * 0.07, gyC = H * 0.42, gw = W * 0.86, amp = min(H * 0.26, 150);
		const zSpan = min(isFinite(delta) ? 5 * delta : 3 * lambda, 3 * lambda) || 3 * lambda;
		const px = z => gx + (z / zSpan) * gw;
		c.strokeStyle = "rgba(148,163,184,.3)"; c.lineWidth = 1;
		c.beginPath(); c.moveTo(gx, gyC); c.lineTo(gx + gw, gyC); c.stroke();
		// envelope
		c.setLineDash([5, 4]); c.strokeStyle = "rgba(251,191,36,.55)";
		for (const s of [1, -1]) {
			c.beginPath();
			for (let i = 0; i <= 120; i++) { const z = i / 120 * zSpan, y = gyC - s * amp * Math.exp(-alpha * z); i ? c.lineTo(px(z), y) : c.moveTo(px(z), y); }
			c.stroke();
		}
		c.setLineDash([]);
		// wave
		c.beginPath();
		const omegaVis = 2.2; // visual angular speed
		for (let i = 0; i <= 300; i++) {
			const z = i / 300 * zSpan;
			const y = gyC - amp * Math.exp(-alpha * z) * cos(omegaVis * this.time - beta * z);
			i ? c.lineTo(px(z), y) : c.moveTo(px(z), y);
		}
		c.strokeStyle = "#67e8f9"; c.lineWidth = 2.4; c.shadowColor = "#67e8f9"; c.shadowBlur = 8; c.stroke(); c.shadowBlur = 0;
		c.fillStyle = "#fbbf24"; c.font = "10px monospace"; c.fillText("±E₀e^(−αz)", gx + gw - 86, gyC - amp - 8);
		// skin depth marker
		if (isFinite(delta) && delta < zSpan) {
			const dxp = px(delta);
			c.setLineDash([4, 4]); c.strokeStyle = "rgba(251,113,133,.7)";
			c.beginPath(); c.moveTo(dxp, gyC - amp); c.lineTo(dxp, gyC + amp); c.stroke(); c.setLineDash([]);
			c.fillStyle = "#fda4af"; c.font = "11px monospace";
			c.fillText(`z = δ → E cai a 36,8%`, dxp + 6, gyC + amp - 6);
		}
		c.fillStyle = "#94a3b8"; c.font = "10px monospace";
		c.fillText(`z (0 → ${zSpan.toExponential(2)} m)`, gx, gyC + amp + 24);
		// ---- power decay bar: P ∝ e^(−2αz) ----
		const by = H * 0.82, bh = 16;
		for (let i = 0; i < gw; i += 2) {
			const z = i / gw * zSpan, p = Math.exp(-2 * alpha * z);
			c.fillStyle = `rgba(52,211,153,${0.08 + 0.6 * p})`;
			c.fillRect(gx + i, by, 2, bh);
		}
		c.strokeStyle = "rgba(148,163,184,.3)"; c.strokeRect(gx, by, gw, bh);
		c.fillStyle = "#6ee7b7"; c.font = "10px monospace";
		c.fillText("densidade de potência média 𝒫 ∝ e^(−2αz) (vetor de Poynting)", gx, by - 6);
	}
}
