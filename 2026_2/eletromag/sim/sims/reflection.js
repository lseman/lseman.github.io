// ============================================================================
// SIM: PLANE WAVE REFLECTION AT NORMAL INCIDENCE (Sadiku ch. 10.8)
// ============================================================================
import { Sim } from "../core/sim-base.js";
import { PI, sin, cos, sqrt, min, max, abs, EPS0, MU0 } from "../core/math.js";
import { W, H } from "../core/canvas.js";

export class ReflectionSim extends Sim {
	constructor() {
		super("Reflexão de Ondas Planas", "⇄");
		this.epsr1 = 1; this.epsr2 = 4; this.mur1 = 1; this.mur2 = 1;
		this.conductor = false; this.showEnvelope = true;
		this.time = 0; this.playing = true;
		this.hint = "Γ = (η₂−η₁)/(η₂+η₁) fixa quanto da onda volta; a interferência gera onda estacionária no meio 1";
	}
	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">⇄</span> ${this.name}</h3>
<div class="formula">Γ = (η₂−η₁)/(η₂+η₁) <br> τ = 1+Γ <br> s = (1+|Γ|)/(1−|Γ|)</div>
<div class="learning-card"><strong>Experimento guiado · Incidência normal</strong>Varie εᵣ dos dois meios e observe onda refletida e transmitida. Com condutor perfeito, Γ = −1: reflexão total e onda puramente estacionária.<em>Os nós da envoltória distam λ/2; E = 0 sempre na superfície do condutor.</em></div>
<div class="btn-row"><button class="btn primary" id="play">▶</button><button class="btn" id="pause">⏸</button></div>
<div class="control"><label>εᵣ meio 1 <span class="val" id="e1V">1</span></label><input id="epsr1" type="range" min="1" max="20" step="1" value="1"></div>
<div class="control"><label>εᵣ meio 2 <span class="val" id="e2V">4</span></label><input id="epsr2" type="range" min="1" max="80" step="1" value="4"></div>
<div class="control"><label>μᵣ meio 2 <span class="val" id="m2V">1</span></label><input id="mur2" type="range" min="1" max="10" step="1" value="1"></div>
<div class="control"><label>Meio 2 = condutor perfeito</label><label class="toggle"><input id="conductor" type="checkbox"><span class="track"></span></label></div>
<div class="control"><label>Mostrar envoltória (onda estacionária)</label><label class="toggle"><input id="showEnvelope" type="checkbox" checked><span class="track"></span></label></div>
${this.measurementPanel("Interface entre meios", [["η₁", "—"], ["η₂", "—"], ["Coef. reflexão Γ", "—"], ["Coef. transmissão τ", "—"], ["SWR s", "—"], ["Potência refletida", "—"], ["Potência transmitida", "—"]])}`;
		for (const [id, lab] of [["epsr1", "e1V"], ["epsr2", "e2V"], ["mur2", "m2V"]]) {
			el.querySelector(`#${id}`).value = String(this[id]);
			el.querySelector(`#${id}`).oninput = e => { this[id] = +e.target.value; el.querySelector(`#${lab}`).textContent = e.target.value; };
		}
		for (const id of ["conductor", "showEnvelope"]) {
			el.querySelector(`#${id}`).checked = this[id];
			el.querySelector(`#${id}`).onchange = e => (this[id] = e.target.checked);
		}
		el.querySelector("#play").onclick = () => (this.playing = true);
		el.querySelector("#pause").onclick = () => (this.playing = false);
	}
	render(c, time) {
		if (W < 2 || H < 2) return;
		this.time += this.playing ? this.deltaTime(time) : (this.deltaTime(time), 0);
		c.fillStyle = "#080d17"; c.fillRect(0, 0, W, H);
		const eta1 = sqrt(MU0 * this.mur1 / (EPS0 * this.epsr1));
		const eta2 = this.conductor ? 0 : sqrt(MU0 * this.mur2 / (EPS0 * this.epsr2));
		const G = (eta2 - eta1) / (eta2 + eta1), tau = 1 + G;
		const s = abs(G) < 1 ? (1 + abs(G)) / (1 - abs(G)) : Infinity;
		this.updateMeasurements([
			`${eta1.toFixed(1)} Ω`, this.conductor ? "0 Ω (condutor)" : `${eta2.toFixed(1)} Ω`,
			G.toFixed(3), tau.toFixed(3), isFinite(s) ? s.toFixed(2) : "∞",
			`${(G * G * 100).toFixed(1)} %`, `${((1 - G * G) * 100).toFixed(1)} %`,
		]);
		// geometry: interface at 62% of width
		const ix = W * 0.62, gx = W * 0.05, gw2 = W * 0.92, cy = H * 0.44, amp = min(H * 0.24, 140);
		// medium shading
		c.fillStyle = "rgba(56,189,248,.05)"; c.fillRect(gx, cy - amp - 30, ix - gx, 2 * (amp + 30));
		c.fillStyle = this.conductor ? "rgba(148,163,184,.22)" : "rgba(52,211,153,.07)";
		c.fillRect(ix, cy - amp - 30, gx + gw2 - ix, 2 * (amp + 30));
		c.strokeStyle = "rgba(226,232,240,.6)"; c.lineWidth = 2;
		c.beginPath(); c.moveTo(ix, cy - amp - 30); c.lineTo(ix, cy + amp + 30); c.stroke();
		c.fillStyle = "#94a3b8"; c.font = "11px monospace";
		c.fillText(`meio 1 · εᵣ=${this.epsr1} · η₁=${eta1.toFixed(0)}Ω`, gx + 8, cy - amp - 38);
		c.fillText(this.conductor ? "meio 2 · condutor perfeito" : `meio 2 · εᵣ=${this.epsr2} μᵣ=${this.mur2} · η₂=${eta2.toFixed(0)}Ω`, ix + 8, cy - amp - 38);
		if (this.conductor) { for (let y = cy - amp - 26; y < cy + amp + 26; y += 14) { c.beginPath(); c.moveTo(ix, y); c.lineTo(ix + 10, y + 10); c.strokeStyle = "rgba(148,163,184,.5)"; c.lineWidth = 1; c.stroke(); } }
		// wavelengths (screen units): fixed λ1, λ2 scales with 1/√(εμ)
		const lam1 = min(220, W * 0.28), lam2 = lam1 * sqrt(this.epsr1 * this.mur1) / sqrt(this.epsr2 * this.mur2);
		const b1 = 2 * PI / lam1, b2 = 2 * PI / lam2, wt = this.time * 2.4;
		// total field in medium 1: incident + reflected; medium 2: transmitted
		c.beginPath();
		for (let x = gx; x <= gx + gw2; x += 2) {
			let e;
			if (x < ix) { const z = x - ix; e = cos(wt - b1 * z) + G * cos(wt + b1 * z); }
			else if (this.conductor) e = 0;
			else { const z = x - ix; e = tau * cos(wt - b2 * z); }
			const y = cy - e * amp * 0.55;
			x === gx ? c.moveTo(x, y) : c.lineTo(x, y);
		}
		c.strokeStyle = "#67e8f9"; c.lineWidth = 2.4; c.shadowColor = "#67e8f9"; c.shadowBlur = 8; c.stroke(); c.shadowBlur = 0;
		// standing-wave envelope in medium 1: |E| = √(1+Γ²+2Γcos(2βz))
		if (this.showEnvelope) {
			c.setLineDash([5, 4]); c.strokeStyle = "rgba(251,191,36,.6)"; c.lineWidth = 1.4;
			for (const sgn of [1, -1]) {
				c.beginPath();
				for (let x = gx; x <= ix; x += 2) {
					const z = x - ix, env = sqrt(max(0, 1 + G * G + 2 * G * cos(2 * b1 * z)));
					const y = cy - sgn * env * amp * 0.55;
					x === gx ? c.moveTo(x, y) : c.lineTo(x, y);
				}
				c.stroke();
			}
			c.setLineDash([]);
			// mark Emax / Emin values
			c.fillStyle = "#fbbf24"; c.font = "10px monospace";
			c.fillText(`|E|máx=${(1 + abs(G)).toFixed(2)} · |E|mín=${(1 - abs(G)).toFixed(2)} · nós a cada λ/2`, gx + 8, cy + amp * 0.55 + 34);
		}
		// direction arrows
		const arrow = (x0, y0, dir, color, label) => {
			c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + dir * 44, y0);
			c.lineTo(x0 + dir * 36, y0 - 4); c.moveTo(x0 + dir * 44, y0); c.lineTo(x0 + dir * 36, y0 + 4);
			c.strokeStyle = color; c.lineWidth = 2; c.stroke();
			c.fillStyle = color; c.font = "10px monospace"; c.fillText(label, x0 + (dir > 0 ? 0 : -46), y0 - 8);
		};
		arrow(gx + 30, cy + amp + 14, 1, "#fb7185", "incidente");
		if (abs(G) > 0.005) arrow(ix - 40, cy + amp + 14, -1, "#a78bfa", `refletida ×${abs(G).toFixed(2)}`);
		if (!this.conductor && abs(tau) > 0.005) arrow(ix + 30, cy + amp + 14, 1, "#34d399", `transmitida ×${tau.toFixed(2)}`);
		// power split bar
		const by = H * 0.86, bw = min(W * 0.6, 460), bx = (W - bw) / 2, bh = 18, pr = G * G;
		c.fillStyle = "rgba(167,139,250,.6)"; c.fillRect(bx, by, bw * pr, bh);
		c.fillStyle = "rgba(52,211,153,.6)"; c.fillRect(bx + bw * pr, by, bw * (1 - pr), bh);
		c.strokeStyle = "#e2e8f0"; c.lineWidth = 1; c.strokeRect(bx, by, bw, bh);
		c.fillStyle = "#c4b5fd"; c.font = "10px monospace"; c.fillText(`refletida ${(pr * 100).toFixed(1)}%`, bx, by - 6);
		c.fillStyle = "#6ee7b7"; c.fillText(`transmitida ${((1 - pr) * 100).toFixed(1)}%`, bx + bw - 118, by - 6);
	}
}
