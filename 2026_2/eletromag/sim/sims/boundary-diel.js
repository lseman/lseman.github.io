// ============================================================================
// SIM 9: DIELECTRIC-DIELECTRIC BOUNDARY CONDITIONS
// ============================================================================
import { Sim } from "../core/sim-base.js";
import { PI, sin, cos, sqrt, abs, min, max, floor } from "../core/math.js";
import { W, H, S } from "../core/canvas.js";

function solveWithDielBoundary(rows, cols, kappa1, kappa2, boundaryY) {
	let V = new Float64Array(rows * cols);
	const seriesFactor = boundaryY / kappa1 + (1 - boundaryY) / kappa2;
	const field1 = 10 / (kappa1 * seriesFactor);
	const field2 = 10 / (kappa2 * seriesFactor);
	for (let j = 0; j < rows; j++) {
		const y = j / (rows - 1);
		const potential = y <= boundaryY
			? 10 - field1 * y
			: 10 - field1 * boundaryY - field2 * (y - boundaryY);
		for (let i = 0; i < cols; i++) V[j * cols + i] = potential;
	}
	return { V, iterations: 1, residual: 0 };
}

function computeFieldWithDielBC(V, rows, cols, kappa1, kappa2, boundaryY, dx, dy) {
	const Ex = new Float64Array(rows * cols);
	const Ey = new Float64Array(rows * cols);
	const D = new Float64Array(rows * cols);

	const EPS0 = 8.854e-12;
	const seriesFactor = boundaryY / kappa1 + (1 - boundaryY) / kappa2;
	for (let j = 0; j < rows; j++) {
		for (let i = 0; i < cols; i++) {
			const idx = j * cols + i;
			const kappa = j / (rows - 1) < boundaryY ? kappa1 : kappa2;
			Ey[idx] = 10 / (H * kappa * seriesFactor);
			D[idx] = kappa * EPS0 * sqrt(Ex[idx] * Ex[idx] + Ey[idx] * Ey[idx]);
		}
	}
	return { Ex, Ey, D };
}

export class BoundaryDielSim extends Sim {
	constructor() {
		super("Fronteira Dielétrica", "⟂");
		this.kappa1 = 2.2;
		this.kappa2 = 5.5;
		this.boundaryY = 0.5;
		this.showPotential = true;
		this.showFieldE = true;
		this.showFieldD = false;
		this.showBoundary = true;
		this.showStreamlines = false;
		this.gridRes = 50;
		this.hint = "Observe continuidade de E tangencial e D normal na interface";
	}
	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">⟂</span> ${this.name}</h3>
<div class="formula" id="formula">E_tan contínuo  |  D_n contínuo</div>
<div class="control"><label>κ₁ (topo) <span class="val" id="k1V">2.2</span></label><input type="range" id="k1" min="1" max="10" step="0.1" value="2.2"></div>
<div class="control"><label>κ₂ (base) <span class="val" id="k2V">5.5</span></label><input type="range" id="k2" min="1" max="10" step="0.1" value="5.5"></div>
<div class="control"><label>Posição interface <span class="val" id="byV">50%</span></label><input type="range" id="by" min="20" max="80" value="50"></div>
<div class="control"><label>Potencial V</label><label class="toggle"><input type="checkbox" id="showV" checked><span class="track"></span></label></div>
<div class="control"><label>Campo E</label><label class="toggle"><input type="checkbox" id="showE" checked><span class="track"></span></label></div>
<div class="control"><label>Campo D</label><label class="toggle"><input type="checkbox" id="showD"><span class="track"></span></label></div>
<div class="control"><label>Linha de fronteira</label><label class="toggle"><input type="checkbox" id="showBound" checked><span class="track"></span></label></div>
<div class="control"><label>Linhas de fluxo</label><label class="toggle"><input type="checkbox" id="showStream"><span class="track"></span></label></div>
<div class="control"><label>Resolução <span class="val" id="gV">50</span></label><input type="range" id="gres" min="30" max="80" value="50"></div>
<div class="btn-row"><button class="btn primary" id="solve">Resolver</button></div>
<div class="stat-grid" id="stats"></div>`;
		el.querySelector("#k1").value = String(this.kappa1);
		el.querySelector("#k1V").textContent = this.kappa1.toFixed(1);
		el.querySelector("#k2").value = String(this.kappa2);
		el.querySelector("#k2V").textContent = this.kappa2.toFixed(1);
		el.querySelector("#by").value = String(this.boundaryY * 100);
		el.querySelector("#byV").textContent = (this.boundaryY * 100).toFixed(0) + "%";
		el.querySelector("#showV").checked = this.showPotential;
		el.querySelector("#showE").checked = this.showFieldE;
		el.querySelector("#showD").checked = this.showFieldD;
		el.querySelector("#showBound").checked = this.showBoundary;
		el.querySelector("#showStream").checked = this.showStreamlines;
		el.querySelector("#gres").value = String(this.gridRes);
		el.querySelector("#gV").textContent = String(this.gridRes);

		el.querySelector("#k1").oninput = (e) => {
			this.kappa1 = +e.target.value;
			el.querySelector("#k1V").textContent = e.target.value;
			this.computeSolution();
		};
		el.querySelector("#k2").oninput = (e) => {
			this.kappa2 = +e.target.value;
			el.querySelector("#k2V").textContent = e.target.value;
			this.computeSolution();
		};
		el.querySelector("#by").oninput = (e) => {
			this.boundaryY = +e.target.value / 100;
			el.querySelector("#byV").textContent = e.target.value + "%";
			this.computeSolution();
		};
		el.querySelector("#showV").onchange = (e) => (this.showPotential = e.target.checked);
		el.querySelector("#showE").onchange = (e) => (this.showFieldE = e.target.checked);
		el.querySelector("#showD").onchange = (e) => (this.showFieldD = e.target.checked);
		el.querySelector("#showBound").onchange = (e) => (this.showBoundary = e.target.checked);
		el.querySelector("#showStream").onchange = (e) => (this.showStreamlines = e.target.checked);
		el.querySelector("#gres").oninput = (e) => {
			this.gridRes = +e.target.value;
			el.querySelector("#gV").textContent = e.target.value;
			this.computeSolution();
		};
		el.querySelector("#solve").onclick = () => {
			this.computeSolution();
		};
		this.computeSolution();
	}
	computeSolution() {
		const gridRows = this.gridRes, gridCols = this.gridRes;
		const dx = W / (gridCols - 1), dy = H / (gridRows - 1);
		const boundaryPos = this.boundaryY * H;

		const result = solveWithDielBoundary(gridRows, gridCols, this.kappa1, this.kappa2, this.boundaryY);
		this.V = result.V;
		this.gridRows = gridRows;
		this.gridCols = gridCols;
		this.dx = dx;
		this.dy = dy;
		this.boundaryPos = boundaryPos;
		this.iterations = result.iterations;
		this.residual = result.residual;

		const fields = computeFieldWithDielBC(this.V, gridRows, gridCols, this.kappa1, this.kappa2, this.boundaryY, dx, dy);
		this.Ex = fields.Ex;
		this.Ey = fields.Ey;
		this.D = fields.D;
	}
	resize() {
		this.computeSolution();
	}
	meshPoints() {
		const points = [];
		const divisions = max(2, this.gridRes - 1);
		const topDivisions = max(1, Math.round(divisions * this.boundaryY));
		const bottomDivisions = max(1, divisions - topDivisions);
		const interfaceY = H * this.boundaryY;
		const rows = [];
		for (let j = 0; j <= topDivisions; j++) rows.push(interfaceY * j / topDivisions);
		for (let j = 1; j <= bottomDivisions; j++) rows.push(interfaceY + (H - interfaceY) * j / bottomDivisions);
		for (const y of rows) {
			for (let i = 0; i <= divisions; i++) points.push({ x: W * i / divisions, y });
		}
		return points;
	}
	drawMeshPoints(c) {
		const key = `${this.gridRes}:${this.boundaryY}:${W}:${H}`;
		if (this._meshKey !== key) {
			this._meshKey = key;
			this._meshPoints = this.meshPoints();
		}
		const radius = this.gridRes >= 60 ? 0.45 : this.gridRes >= 40 ? 0.6 : 0.8;
		c.fillStyle = "rgba(226,232,240,0.2)";
		c.beginPath();
		for (const point of this._meshPoints) {
			c.moveTo(point.x + radius, point.y);
			c.arc(point.x, point.y, radius, 0, 2 * PI);
		}
		c.fill();
	}
	drawArrow(c, x, y, u, v, length, head) {
		const x0 = x - u * length/2, y0 = y - v * length/2;
		const x1 = x + u * length/2, y1 = y + v * length/2;
		c.beginPath();
		c.moveTo(x0, y0);
		c.lineTo(x1, y1);
		c.moveTo(x1, y1);
		c.lineTo(x1 - u * head - v * head * 0.55, y1 - v * head + u * head * 0.55);
		c.moveTo(x1, y1);
		c.lineTo(x1 - u * head + v * head * 0.55, y1 - v * head - u * head * 0.55);
		c.stroke();
	}
	render(c, time) {
		if (W < 2 || H < 2 || !this.V) return;
		c.fillStyle = "#0a0e17";
		c.fillRect(0, 0, W, H);

		const { gridRows, gridCols, dx, dy, V, Ex, Ey, D, boundaryPos } = this;

		// Potential heatmap
		if (this.showPotential) {
			const tmp = document.createElement("canvas");
			tmp.width = gridCols; tmp.height = gridRows;
			const tc = tmp.getContext("2d"), img = tc.createImageData(gridCols, gridRows), d = img.data;
			const palette = [[30,64,175],[38,154,210],[225,232,240],[244,114,106],[180,24,72]];

			for (let py = 0; py < gridRows; py++) {
				for (let px = 0; px < gridCols; px++) {
					const v = V[py * gridCols + px];
					const t = 0.5 + 0.5 * Math.tanh(v / 15);
					const p = t * (palette.length - 1);
					const pi = min(palette.length - 2, floor(p));
					const u = p - pi;
					const a = palette[pi], b = palette[pi + 1];
					const i = (py * gridCols + px) * 4;
					d[i] = a[0] + (b[0] - a[0]) * u;
					d[i + 1] = a[1] + (b[1] - a[1]) * u;
					d[i + 2] = a[2] + (b[2] - a[2]) * u;
					d[i + 3] = 180;
				}
			}
			tc.putImageData(img, 0, 0);
			c.imageSmoothingEnabled = true;
			c.drawImage(tmp, 0, 0, W, H);
		}

		this.drawMeshPoints(c);

		// Boundary interface
		if (this.showBoundary) {
			c.strokeStyle = "rgba(251,191,36,0.8)";
			c.lineWidth = 2.5;
			c.setLineDash([5, 5]);
			c.beginPath();
			c.moveTo(0, boundaryPos);
			c.lineTo(W, boundaryPos);
			c.stroke();
			c.setLineDash([]);
			c.fillStyle = "rgba(251,191,36,0.6)";
			c.font = "10px monospace";
			c.fillText(`κ₁=${this.kappa1.toFixed(1)}`, 12, boundaryPos - 8);
			c.fillText(`κ₂=${this.kappa2.toFixed(1)}`, 12, boundaryPos + 18);
		}

		// E field
		if (this.showFieldE) {
			c.save();
			c.strokeStyle = "rgba(103,232,249,0.95)";
			c.lineWidth = 1.8;
			c.lineCap = "round";
			c.lineJoin = "round";
			const step = max(2, floor(gridCols / 14));
			for (let j = 0; j < gridRows; j += step) {
				for (let i = 0; i < gridCols; i += step) {
					const idx = j * gridCols + i;
					const ex = Ex[idx], ey = Ey[idx];
					const mag = sqrt(ex * ex + ey * ey);
					if (mag < 1e-8) continue;
					const u = ex / mag, v = ey / mag;
					const maxE = 10 / (H * min(this.kappa1, this.kappa2) * (this.boundaryY / this.kappa1 + (1-this.boundaryY) / this.kappa2));
					const len = 12 + 12 * mag / maxE;
					const x = i * dx, y = j * dy;
					this.drawArrow(c, x, y, u, v, len, min(6, len * 0.3));
				}
			}
			c.restore();
		}

		// D field vectors: their equal length across the interface demonstrates
		// continuity of the normal displacement component.
		if (this.showFieldD) {
			c.save();
			c.strokeStyle = "rgba(192,132,252,0.95)";
			c.lineWidth = 2;
			c.lineCap = "round";
			c.lineJoin = "round";
			const step = max(2, floor(gridCols / 12));
			const offset = floor(step / 2);
			for (let j = offset; j < gridRows; j += step) {
				for (let i = offset; i < gridCols; i += step) {
					const idx = j * gridCols + i;
					const magE = sqrt(Ex[idx] * Ex[idx] + Ey[idx] * Ey[idx]);
					if (D[idx] <= 0 || magE < 1e-12) continue;
					this.drawArrow(c, i * dx, j * dy, Ex[idx] / magE, Ey[idx] / magE, 20, 5.5);
				}
			}
			c.restore();
		}

		// Streamlines
		if (this.showStreamlines) {
			const nLines = 10;
			c.strokeStyle = "rgba(103,232,249,0.5)";
			c.lineWidth = 1;
			for (let line = 0; line < nLines; line++) {
				const startX = (line + 0.5) * W / nLines;
				let px = startX, py = H * 0.08;
				c.beginPath();
				c.moveTo(px, py);
				for (let s = 0; s < 150; s++) {
					const i = floor(px / this.dx), j = floor(py / this.dy);
					if (i < 1 || i >= gridCols - 1 || j < 1 || j >= gridRows - 1) break;
					const idx = j * gridCols + i;
					let ex = Ex[idx], ey = Ey[idx];
					const mag = sqrt(ex * ex + ey * ey);
					if (mag < 1e-8) break;
					ex /= mag; ey /= mag;
					const h = min(this.dx, this.dy) * 0.5;
					px += ex * h;
					py += ey * h;
					if (px < 0 || px > W || py < 0 || py > H) break;
					c.lineTo(px, py);
				}
				c.stroke();
			}
		}

		c.fillStyle = "rgba(255,255,255,0.6)";
		c.font = "9px monospace";
		c.fillText(`Iterações: ${this.iterations}  |  Resíduo: ${this.residual.toExponential(2)}`, 10, 20);
	}
}
