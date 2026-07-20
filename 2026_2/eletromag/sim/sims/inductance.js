// ============================================================================
// SIM: INDUCTANCE & MAGNETIC CIRCUITS (Sadiku ch. 8.10-8.12)
// ============================================================================
import { Sim } from "../core/sim-base.js";
import { PI, sin, min, max, MU0 } from "../core/math.js";
import { W, H } from "../core/canvas.js";

export class InductanceSim extends Sim {
	constructor() {
		super("Indutância e Circuito Magnético", "◎");
		this.turns = 200; this.current = 1; this.mur = 2000; this.gap = 1; this.coreLen = 20; this.area = 4;
		this.time = 0; this.playing = true;
		this.hint = "O circuito magnético é análogo ao elétrico: NI faz papel de fem e ℛ de resistência";
	}
	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">◎</span> ${this.name}</h3>
<div class="formula">ℛ = ℓ/(μS) <br> Φ = NI/ℛ <br> L = N²/ℛ <br> W = ½LI²</div>
<div class="learning-card"><strong>Experimento guiado · Núcleo com entreferro</strong>Aumente o entreferro e veja o fluxo cair: alguns milímetros de ar dominam a relutância total, mesmo com núcleo de μᵣ alto.<em>Analogia: fmm NI ↔ fem, fluxo Φ ↔ corrente, relutância ℛ ↔ resistência.</em></div>
<div class="control"><label>Espiras N <span class="val" id="nV">200</span></label><input id="turns" type="range" min="10" max="1000" step="10" value="200"></div>
<div class="control"><label>Corrente I (A) <span class="val" id="iV">1.0</span></label><input id="current" type="range" min="0.1" max="10" step="0.1" value="1"></div>
<div class="control"><label>μᵣ do núcleo <span class="val" id="mV">2000</span></label><input id="mur" type="range" min="100" max="10000" step="100" value="2000"></div>
<div class="control"><label>Entreferro (mm) <span class="val" id="gV">1.0</span></label><input id="gap" type="range" min="0" max="10" step="0.1" value="1"></div>
<div class="control"><label>Comprimento médio ℓ꜀ (cm) <span class="val" id="cV">20</span></label><input id="coreLen" type="range" min="8" max="60" value="20"></div>
<div class="control"><label>Seção S (cm²) <span class="val" id="aV">4.0</span></label><input id="area" type="range" min="1" max="20" step="0.5" value="4"></div>
${this.measurementPanel("Circuito magnético", [["fmm = NI", "—"], ["ℛ núcleo", "—"], ["ℛ entreferro", "—"], ["Fluxo Φ", "—"], ["Indução B", "—"], ["Indutância L", "—"], ["Energia W", "—"]])}`;
		for (const [id, lab, fmt] of [["turns", "nV", v => String(v)], ["current", "iV", v => v.toFixed(1)], ["mur", "mV", v => String(v)], ["gap", "gV", v => v.toFixed(1)], ["coreLen", "cV", v => String(v)], ["area", "aV", v => v.toFixed(1)]]) {
			el.querySelector(`#${id}`).value = String(this[id]);
			el.querySelector(`#${id}`).oninput = e => { this[id] = +e.target.value; el.querySelector(`#${lab}`).textContent = fmt(this[id]); };
		}
	}
	render(c, time) {
		if (W < 2 || H < 2) return;
		this.time += this.deltaTime(time);
		c.fillStyle = "#080d17"; c.fillRect(0, 0, W, H);
		const S = this.area * 1e-4, lg = this.gap * 1e-3, lc = this.coreLen / 100 - lg;
		const Rc = lc / (MU0 * this.mur * S), Rg = lg / (MU0 * S), Rt = Rc + Rg;
		const fmm = this.turns * this.current, flux = fmm / Rt, B = flux / S, L = this.turns * this.turns / Rt, energy = 0.5 * L * this.current * this.current;
		const saturated = B > 1.6;
		this.updateMeasurements([`${fmm.toFixed(0)} A·e`, `${Rc.toExponential(3)} H⁻¹`, `${Rg.toExponential(3)} H⁻¹`, `${flux.toExponential(3)} Wb`, `${B.toFixed(3)} T${saturated ? " ⚠ saturação" : ""}`, `${(L * 1e3).toFixed(2)} mH`, `${energy.toExponential(3)} J`]);
		// ---- core drawing (rectangular toroid with gap at right side) ----
		const cx = W * 0.32, cy = H * 0.48, ow = min(W * 0.4, 330), oh = min(H * 0.56, 300), th = min(52, ow * 0.2);
		const gapPix = this.gap === 0 ? 0 : max(6, min(34, this.gap * 4));
		c.fillStyle = saturated ? "#4c1d24" : "#26323f"; c.strokeStyle = "#64748b"; c.lineWidth = 2;
		const x0 = cx - ow / 2, y0 = cy - oh / 2;
		// core as outer rect minus inner rect, with gap cut on right limb
		c.beginPath();
		c.rect(x0, y0, ow, th); c.rect(x0, y0 + oh - th, ow, th); c.rect(x0, y0, th, oh);
		c.rect(x0 + ow - th, y0, th, (oh - gapPix) / 2); c.rect(x0 + ow - th, y0 + (oh + gapPix) / 2, th, (oh - gapPix) / 2);
		c.fill(); c.stroke();
		if (gapPix > 0) {
			c.fillStyle = "rgba(103,232,249,.12)";
			c.fillRect(x0 + ow - th - 3, cy - gapPix / 2, th + 6, gapPix);
			c.fillStyle = "#67e8f9"; c.font = "10px monospace"; c.fillText(`entreferro ${this.gap.toFixed(1)} mm`, x0 + ow - th - 26, cy + gapPix / 2 + 16);
		}
		// winding on left limb
		const nCoils = min(14, 3 + (this.turns / 90) | 0);
		for (let i = 0; i < nCoils; i++) {
			const wy = y0 + th + 12 + (i / max(1, nCoils - 1)) * (oh - 2 * th - 24);
			c.beginPath(); c.ellipse(x0 + th / 2, wy, th / 2 + 9, 5.5, 0, 0, 2 * PI);
			c.strokeStyle = "#fbbf24"; c.lineWidth = 2.2; c.stroke();
		}
		c.fillStyle = "#fde68a"; c.font = "11px monospace"; c.fillText(`N=${this.turns} · I=${this.current.toFixed(1)} A`, x0 - 10, y0 - 12);
		// flux animation: dashes running around the mean path, density ∝ B
		const midW = ow - th, midH = oh - th, mx0 = x0 + th / 2, my0 = y0 + th / 2;
		const perim = 2 * (midW + midH);
		const nDots = max(4, min(46, Math.round(B * 30)));
		const speed = min(0.35, 0.04 + B * 0.06);
		for (let i = 0; i < nDots; i++) {
			let s = ((i / nDots + this.time * speed) % 1) * perim, px, py, tx, ty;
			if (s < midW) { px = mx0 + s; py = my0; tx = 1; ty = 0; }
			else if (s < midW + midH) { px = mx0 + midW; py = my0 + (s - midW); tx = 0; ty = 1; }
			else if (s < 2 * midW + midH) { px = mx0 + midW - (s - midW - midH); py = my0 + midH; tx = -1; ty = 0; }
			else { px = mx0; py = my0 + midH - (s - 2 * midW - midH); tx = 0; ty = -1; }
			const inGap = px > x0 + ow - th - 2 && py > cy - gapPix / 2 - 2 && py < cy + gapPix / 2 + 2;
			c.beginPath(); c.moveTo(px - tx * 7, py - ty * 7); c.lineTo(px + tx * 7, py + ty * 7);
			c.lineTo(px + tx * 3 - ty * 3.5, py + ty * 3 + tx * 3.5); c.moveTo(px + tx * 7, py + ty * 7); c.lineTo(px + tx * 3 + ty * 3.5, py + ty * 3 - tx * 3.5);
			c.strokeStyle = inGap ? "rgba(103,232,249,.95)" : "rgba(52,211,153,.8)"; c.lineWidth = 2; c.stroke();
		}
		c.fillStyle = "#6ee7b7"; c.font = "10px monospace"; c.fillText("Φ", mx0 + midW / 2 - 4, my0 - 8);
		// ---- electric-circuit analogy ----
		const ax = W * 0.66, ay = H * 0.2, aw = W * 0.27, ah = H * 0.5;
		c.strokeStyle = "rgba(226,232,240,.55)"; c.lineWidth = 1.6;
		c.strokeRect(ax, ay, aw, ah);
		c.fillStyle = "#0b1120"; c.fillRect(ax, ay, aw, ah);
		c.strokeRect(ax, ay, aw, ah);
		// source (fmm) on left side
		c.beginPath(); c.arc(ax, ay + ah / 2, 16, 0, 2 * PI); c.fillStyle = "#0b1120"; c.fill(); c.strokeStyle = "#fbbf24"; c.stroke();
		c.fillStyle = "#fde68a"; c.font = "10px monospace"; c.textAlign = "center";
		c.fillText("NI", ax, ay + ah / 2 + 3); c.textAlign = "start";
		// two reluctance boxes on right side, heights ∝ share
		const shareG = Rg / Rt, boxW = 26;
		const hCore = (ah - 40) * (1 - shareG), hGap = (ah - 40) * shareG;
		c.fillStyle = "rgba(52,211,153,.25)"; c.strokeStyle = "#34d399";
		c.fillRect(ax + aw - boxW / 2, ay + 20, boxW, hCore); c.strokeRect(ax + aw - boxW / 2, ay + 20, boxW, hCore);
		c.fillStyle = "rgba(103,232,249,.25)"; c.strokeStyle = "#67e8f9";
		c.fillRect(ax + aw - boxW / 2, ay + 20 + hCore, boxW, hGap); c.strokeRect(ax + aw - boxW / 2, ay + 20 + hCore, boxW, hGap);
		c.fillStyle = "#6ee7b7"; c.font = "10px monospace"; c.fillText("ℛ꜀", ax + aw + boxW / 2 + 6, ay + 20 + hCore / 2);
		c.fillStyle = "#a5f3fc"; c.fillText("ℛg", ax + aw + boxW / 2 + 6, ay + 20 + hCore + hGap / 2);
		c.fillStyle = "#94a3b8";
		c.fillText("análogo elétrico", ax, ay - 10);
		c.fillText(`entreferro: ${(shareG * 100).toFixed(1)}% de ℛ total`, ax, ay + ah + 20);
		c.fillText(`Φ = NI/(ℛ꜀+ℛg) — mesmo Φ em série`, ax, ay + ah + 36);
		if (saturated) { c.fillStyle = "#fda4af"; c.fillText("⚠ B > 1,6 T: núcleo real saturaria (modelo linear)", ax, ay + ah + 52); }
	}
}
