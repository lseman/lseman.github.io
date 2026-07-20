// ============================================================================
// SIM: TORQUE ON A CURRENT LOOP / MAGNETIC DIPOLE (Sadiku ch. 8)
// ============================================================================
import { Sim } from "../core/sim-base.js";
import { PI, sin, cos, min, max, abs } from "../core/math.js";
import { W, H } from "../core/canvas.js";

export class MagneticTorqueSim extends Sim {
	constructor() {
		super("Torque Magnético", "⟳");
		this.current = 2; this.turns = 10; this.side = 8; this.field = 0.5;
		this.theta = PI / 3; this.omega = 0; this.damping = 0.6;
		this.playing = false;
		this.hint = "τ = m×B tende a alinhar o momento m = NIS com o campo B";
	}
	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">⟳</span> ${this.name}</h3>
<div class="formula">m = NIS·n̂ <br> τ = m×B <br> U = −m·B</div>
<div class="learning-card"><strong>Experimento guiado · Espira em campo uniforme</strong>Ajuste o ângulo e solte (▶). O torque gira a espira até alinhar m com B — princípio do motor CC e do galvanômetro.<em>Em campo uniforme a força resultante é nula; só existe torque.</em></div>
<div class="btn-row"><button class="btn primary" id="play">▶ Liberar</button><button class="btn" id="pause">⏸</button><button class="btn" id="reset">↺</button></div>
<div class="control"><label>Corrente I (A) <span class="val" id="iV">2.0</span></label><input id="current" type="range" min="0.2" max="10" step="0.2" value="2"></div>
<div class="control"><label>Espiras N <span class="val" id="nV">10</span></label><input id="turns" type="range" min="1" max="50" value="10"></div>
<div class="control"><label>Lado da espira (cm) <span class="val" id="aV">8</span></label><input id="side" type="range" min="2" max="20" value="8"></div>
<div class="control"><label>Campo B (T) <span class="val" id="bV">0.50</span></label><input id="field" type="range" min="0.05" max="2" step="0.05" value="0.5"></div>
<div class="control"><label>Ângulo θ (°) <span class="val" id="tV">60</span></label><input id="theta" type="range" min="0" max="180" value="60"></div>
<div class="control"><label>Amortecimento <span class="val" id="dV">0.6</span></label><input id="damping" type="range" min="0" max="2" step="0.1" value="0.6"></div>
${this.measurementPanel("Dipolo na espira", [["Momento m", "—"], ["Torque τ", "—"], ["Energia U", "—"], ["Ângulo θ", "—"]])}`;
		for (const [id, lab, fmt] of [["current", "iV", v => v.toFixed(1)], ["turns", "nV", v => String(v)], ["side", "aV", v => String(v)], ["field", "bV", v => v.toFixed(2)], ["damping", "dV", v => v.toFixed(1)]]) {
			el.querySelector(`#${id}`).value = String(this[id]);
			el.querySelector(`#${id}`).oninput = e => { this[id] = +e.target.value; el.querySelector(`#${lab}`).textContent = fmt(this[id]); };
		}
		el.querySelector("#theta").value = String(Math.round(this.theta * 180 / PI));
		el.querySelector("#theta").oninput = e => { this.theta = +e.target.value * PI / 180; this.omega = 0; this.playing = false; el.querySelector("#tV").textContent = e.target.value; };
		el.querySelector("#play").onclick = () => (this.playing = true);
		el.querySelector("#pause").onclick = () => (this.playing = false);
		el.querySelector("#reset").onclick = () => { this.theta = PI / 3; this.omega = 0; this.playing = false; el.querySelector("#theta").value = "60"; el.querySelector("#tV").textContent = "60"; };
	}
	render(c, time) {
		if (W < 2 || H < 2) return;
		const dt = this.deltaTime(time);
		const a = this.side / 100, S = a * a, m = this.turns * this.current * S, tq = m * this.field * sin(this.theta), U = -m * this.field * cos(this.theta);
		if (this.playing) {
			// rigid-body dynamics, inertia scaled for pleasant on-screen periods
			const inertia = max(1e-4, 0.02 * this.turns * S);
			this.omega += (-m * this.field * sin(this.theta) / inertia - this.damping * this.omega) * dt;
			this.theta += this.omega * dt;
			const tEl = document.querySelector("#tV");
			if (tEl) tEl.textContent = (((this.theta * 180 / PI) % 360 + 360) % 360).toFixed(0);
		}
		c.fillStyle = "#080d17"; c.fillRect(0, 0, W, H);
		const cx = W * 0.36, cy = H * 0.46, R = min(W * 0.2, H * 0.28);
		// uniform B: vertical arrows pointing up
		for (let x = 40; x < W * 0.66; x += 56) {
			for (let y = H * 0.14; y < H * 0.86; y += 90) {
				c.beginPath(); c.moveTo(x, y + 30); c.lineTo(x, y); c.lineTo(x - 4, y + 7); c.moveTo(x, y); c.lineTo(x + 4, y + 7);
				c.strokeStyle = "rgba(129,140,248,.35)"; c.lineWidth = 1.4; c.stroke();
			}
		}
		c.fillStyle = "#a5b4fc"; c.font = "600 12px monospace"; c.fillText("B (uniforme, ↑)", 40, H * 0.1);
		// edge-on loop: normal n̂ at angle θ from B(up); wire segment ⟂ n̂
		const nx = sin(this.theta), ny = -cos(this.theta);
		const P1 = { x: cx - ny * R, y: cy + nx * R }, P2 = { x: cx + ny * R, y: cy - nx * R };
		c.beginPath(); c.moveTo(P1.x, P1.y); c.lineTo(P2.x, P2.y);
		c.strokeStyle = "#fbbf24"; c.lineWidth = 5; c.lineCap = "round"; c.stroke(); c.lineCap = "butt";
		// current markers: out of screen on one side, into on the other
		for (const [P, out] of [[P2, true], [P1, false]]) {
			c.beginPath(); c.arc(P.x, P.y, 10, 0, 2 * PI); c.fillStyle = "#0f172a"; c.fill(); c.strokeStyle = "#fbbf24"; c.lineWidth = 2; c.stroke();
			c.fillStyle = "#fde68a"; c.font = "bold 12px monospace"; c.textAlign = "center"; c.textBaseline = "middle";
			c.fillText(out ? "⊙" : "×", P.x, P.y); c.textAlign = "start"; c.textBaseline = "alphabetic";
		}
		// couple: F = IL×B is horizontal (B vertical, wires ⟂ screen), opposite on each wire
		const fMag = min(60, 14 + 46 * abs(sin(this.theta)));
		for (const [P, dir] of [[P2, -1], [P1, 1]]) {
			c.beginPath(); c.moveTo(P.x, P.y); c.lineTo(P.x + dir * fMag, P.y);
			c.lineTo(P.x + dir * (fMag - 7), P.y - 4); c.moveTo(P.x + dir * fMag, P.y); c.lineTo(P.x + dir * (fMag - 7), P.y + 4);
			c.strokeStyle = "#fb7185"; c.lineWidth = 2; c.stroke();
		}
		c.fillStyle = "#fda4af"; c.font = "11px monospace"; c.fillText("F = IL×B (binário)", cx - R, cy - R - 18);
		// m vector along normal
		c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + nx * R * 0.8, cy + ny * R * 0.8);
		c.lineTo(cx + nx * R * 0.8 - nx * 10 - ny * 5, cy + ny * R * 0.8 - ny * 10 + nx * 5);
		c.moveTo(cx + nx * R * 0.8, cy + ny * R * 0.8);
		c.lineTo(cx + nx * R * 0.8 - nx * 10 + ny * 5, cy + ny * R * 0.8 - ny * 10 - nx * 5);
		c.strokeStyle = "#34d399"; c.lineWidth = 2.6; c.stroke();
		c.fillStyle = "#6ee7b7"; c.font = "600 12px monospace"; c.fillText("m", cx + nx * R * 0.88, cy + ny * R * 0.88);
		// angle arc between B(up) and m
		c.beginPath(); c.arc(cx, cy, 34, -PI / 2, -PI / 2 + this.theta, this.theta < 0);
		c.strokeStyle = "rgba(226,232,240,.5)"; c.lineWidth = 1.4; c.stroke();
		c.fillStyle = "#e2e8f0"; c.font = "11px monospace";
		c.fillText("θ", cx + 44 * sin(this.theta / 2) - 3, cy - 44 * cos(this.theta / 2) + 4);
		// energy curve U(θ) = −mB·cosθ over [0, 2π]
		const gx = W * 0.7, gy = H * 0.2, gw = W * 0.25, gh = H * 0.5;
		c.strokeStyle = "rgba(148,163,184,.3)"; c.lineWidth = 1;
		c.beginPath(); c.moveTo(gx, gy + gh / 2); c.lineTo(gx + gw, gy + gh / 2); c.moveTo(gx, gy); c.lineTo(gx, gy + gh); c.stroke();
		const uy = th => gy + gh / 2 - (gh / 2 - 8) * cos(th) * -1;
		c.beginPath();
		for (let i = 0; i <= 80; i++) { const th = i / 80 * 2 * PI; i ? c.lineTo(gx + i / 80 * gw, uy(th)) : c.moveTo(gx, uy(0)); }
		c.strokeStyle = "#67e8f9"; c.lineWidth = 2; c.stroke();
		const thN = ((this.theta % (2 * PI)) + 2 * PI) % (2 * PI);
		c.beginPath(); c.arc(gx + thN / (2 * PI) * gw, uy(thN), 5, 0, 2 * PI); c.fillStyle = "#fbbf24"; c.fill();
		c.fillStyle = "#94a3b8"; c.font = "10px monospace";
		c.fillText("U(θ) = −mB·cosθ", gx, gy - 8);
		c.fillText("0", gx - 8, gy + gh / 2 + 3); c.fillText("π", gx + gw / 2 - 4, gy + gh + 14); c.fillText("2π", gx + gw - 10, gy + gh + 14);
		c.fillText("mínimo em θ=0: m ∥ B (estável)", gx, gy + gh + 30);
		this.updateMeasurements([`${m.toExponential(3)} A·m²`, `${tq.toExponential(3)} N·m`, `${U.toExponential(3)} J`, `${(((this.theta * 180 / PI) % 360 + 360) % 360).toFixed(0)}°`]);
	}
}
