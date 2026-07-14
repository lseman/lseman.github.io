// ============================================================================
// SIM 9: DIELECTRIC-DIELECTRIC BOUNDARY CONDITIONS
// ============================================================================
import { Sim } from "../core/sim-base.js";
import { PI, sin, cos, sqrt, abs, min, max, floor } from "../core/math.js";
import { W, H, S } from "../core/canvas.js";

function solveWithDielBoundary(rows, cols, kappa1, kappa2, boundaryPos, maxIter=500, tol=1e-4) {
	const ω = 1.8;
	let V = new Float64Array(rows * cols);

	// Boundary conditions: V=10 at top, V=0 at bottom
	for (let i = 0; i < cols; i++) {
		V[i] = 10;
		V[(rows - 1) * cols + i] = 0;
	}

	let maxDiff = 1e9, iter = 0;
	while (maxDiff > tol && iter < maxIter) {
		maxDiff = 0;
		for (let j = 1; j < rows - 1; j++) {
			for (let i = 1; i < cols - 1; i++) {
				const idx = j * cols + i;
				const kappa = j < boundaryPos ? kappa1 : kappa2;
				const kappaTop = (j - 1) < boundaryPos ? kappa1 : kappa2;
				const kappaBot = (j + 1) < boundaryPos ? kappa1 : kappa2;
				const kappaLeft = kappa;
				const kappaRight = kappa;

				const V_new = (kappaTop * V[(j-1)*cols + i] + kappaBot * V[(j+1)*cols + i] +
							   kappaLeft * V[j*cols + (i-1)] + kappaRight * V[j*cols + (i+1)]) /
							  (kappaTop + kappaBot + kappaLeft + kappaRight);

				const V_old = V[idx];
				V[idx] = V_old + ω * (V_new - V_old);

				const diff = abs(V[idx] - V_old);
				if (diff > maxDiff) maxDiff = diff;
			}
		}
		iter++;
	}
	return { V, iterations: iter, residual: maxDiff };
}

function computeFieldWithDielBC(V, rows, cols, kappa1, kappa2, boundaryPos, dx, dy) {
	const Ex = new Float64Array(rows * cols);
	const Ey = new Float64Array(rows * cols);
	const D = new Float64Array(rows * cols);

	const EPS0 = 8.854e-12;
	for (let j = 1; j < rows - 1; j++) {
		for (let i = 1; i < cols - 1; i++) {
			const idx = j * cols + i;
			const kappa = j < boundaryPos ? kappa1 : kappa2;

			// Electric field (continuous tangential component)
			Ex[idx] = -(V[idx + 1] - V[idx - 1]) / (2 * dx);
			Ey[idx] = -(V[(j + 1) * cols + i] - V[(j - 1) * cols + i]) / (2 * dy);

			// Displacement field (continuous normal component)
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
		const boundaryPos = floor(gridRows * this.boundaryY);

		const result = solveWithDielBoundary(gridRows, gridCols, this.kappa1, this.kappa2, boundaryPos, 300, 1e-4);
		this.V = result.V;
		this.gridRows = gridRows;
		this.gridCols = gridCols;
		this.dx = dx;
		this.dy = dy;
		this.boundaryPos = boundaryPos;
		this.iterations = result.iterations;
		this.residual = result.residual;

		const fields = computeFieldWithDielBC(this.V, gridRows, gridCols, this.kappa1, this.kappa2, boundaryPos, dx, dy);
		this.Ex = fields.Ex;
		this.Ey = fields.Ey;
		this.D = fields.D;
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

		// Boundary interface
		if (this.showBoundary) {
			c.strokeStyle = "rgba(251,191,36,0.8)";
			c.lineWidth = 2.5;
			c.setLineDash([5, 5]);
			c.beginPath();
			c.moveTo(0, boundaryPos * dy);
			c.lineTo(W, boundaryPos * dy);
			c.stroke();
			c.setLineDash([]);
			c.fillStyle = "rgba(251,191,36,0.6)";
			c.font = "10px monospace";
			c.fillText(`κ₁=${this.kappa1.toFixed(1)}`, 12, boundaryPos * dy - 8);
			c.fillText(`κ₂=${this.kappa2.toFixed(1)}`, 12, boundaryPos * dy + 18);
		}

		// E field
		if (this.showFieldE) {
			c.strokeStyle = "rgba(56,189,248,0.6)";
			c.lineWidth = 1.2;
			const step = max(2, floor(gridCols / 14));
			for (let j = 0; j < gridRows; j += step) {
				for (let i = 0; i < gridCols; i += step) {
					const idx = j * gridCols + i;
					const ex = Ex[idx], ey = Ey[idx];
					const mag = sqrt(ex * ex + ey * ey);
					if (mag < 1e-8) continue;
					const u = ex / mag, v = ey / mag;
					const len = min(14, max(4, Math.log10(mag + 1) * 4));
					const x = i * dx, y = j * dy;
					c.beginPath();
					c.moveTo(x, y);
					c.lineTo(x + u * len, y + v * len);
					c.moveTo(x + u * len, y + v * len);
					c.lineTo(x + u * len - u * 3 - v * 2, y + v * len - v * 3 + u * 2);
					c.moveTo(x + u * len, y + v * len);
					c.lineTo(x + u * len - u * 3 + v * 2, y + v * len - v * 3 - u * 2);
					c.stroke();
				}
			}
		}

		// D field magnitude
		if (this.showFieldD) {
			c.strokeStyle = "rgba(168,85,247,0.5)";
			c.lineWidth = 1;
			const step = max(2, floor(gridCols / 12));
			for (let j = 0; j < gridRows; j += step) {
				for (let i = 0; i < gridCols; i += step) {
					const idx = j * gridCols + i;
					const d = D[idx];
					c.fillStyle = `rgba(168,85,247,${0.2 + 0.6 * Math.tanh(d / 1e-11)})`;
					c.fillRect(i * dx - 2, j * dy - 2, 4, 4);
				}
			}
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
