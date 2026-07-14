// ============================================================================
// SIM 8: POISSON FDM SOLVER
// ============================================================================
import { Sim } from "../core/sim-base.js";
import { PI, sin, cos, sqrt, abs, min, max, floor, log } from "../core/math.js";
import { W, H, S } from "../core/canvas.js";

function solvePoissonFDM(rows, cols, sourceGrid, boundaryType, boundaryVal, kappaGrid, maxIter=500, tol=1e-4) {
	const ω = 1.8;
	let V = new Float64Array(rows * cols);

	// Initialize with boundary values
	for (let j = 0; j < rows; j++) {
		for (let i = 0; i < cols; i++) {
			if (j === 0 || j === rows - 1 || i === 0 || i === cols - 1) {
				V[j * cols + i] = boundaryVal;
			} else {
				V[j * cols + i] = 0;
			}
		}
	}

	let maxDiff = 1e9, iter = 0;
	while (maxDiff > tol && iter < maxIter) {
		maxDiff = 0;
		for (let j = 1; j < rows - 1; j++) {
			for (let i = 1; i < cols - 1; i++) {
				const idx = j * cols + i;
				const kappa = kappaGrid ? kappaGrid[idx] : 1.0;
				const source = sourceGrid ? sourceGrid[idx] : 0;

				const vTop = kappaGrid ? kappaGrid[(j-1)*cols + i] : 1.0;
				const vBot = kappaGrid ? kappaGrid[(j+1)*cols + i] : 1.0;
				const vLeft = kappaGrid ? kappaGrid[j*cols + (i-1)] : 1.0;
				const vRight = kappaGrid ? kappaGrid[j*cols + (i+1)] : 1.0;

				const V_new = (vTop * V[(j-1)*cols + i] + vBot * V[(j+1)*cols + i] +
							   vLeft * V[j*cols + (i-1)] + vRight * V[j*cols + (i+1)]) /
							  (vTop + vBot + vLeft + vRight) - source / (vTop + vBot + vLeft + vRight);

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

function computeElectricField(V, rows, cols, dx, dy) {
	const Ex = new Float64Array(rows * cols);
	const Ey = new Float64Array(rows * cols);
	for (let j = 1; j < rows - 1; j++) {
		for (let i = 1; i < cols - 1; i++) {
			const idx = j * cols + i;
			Ex[idx] = -(V[idx + 1] - V[idx - 1]) / (2 * dx);
			Ey[idx] = -(V[(j + 1) * cols + i] - V[(j - 1) * cols + i]) / (2 * dy);
		}
	}
	return { Ex, Ey };
}

export class PoissonFDMSim extends Sim {
	constructor() {
		super("Poisson FDM", "∇²");
		this.boundaryType = "dirichlet";
		this.boundaryVal = 10;
		this.sourceMode = "none";
		this.sourceStrength = 1;
		this.showSolution = true;
		this.showField = true;
		this.showStreamlines = false;
		this.gridRes = 40;
		this.hint = "Configure boundary conditions and sources; solver updates in real-time";
	}
	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">∇²</span> ${this.name}</h3>
<div class="formula" id="formula">∇²V = ρ/ε₀  |  V_boundary = const</div>
<div class="control"><label>Condição de contorno</label><select id="bc"><option value="dirichlet">Dirichlet (V=const)</option><option value="neumann">Neumann (∂V/∂n=0)</option></select></div>
<div class="control"><label>Valor da borda <span class="val" id="bV">10</span></label><input type="range" id="bval" min="-20" max="20" value="10"></div>
<div class="control"><label>Fonte</label><select id="src"><option value="none">Nenhuma</option><option value="point">Ponto</option><option value="line">Linha</option><option value="disk">Disco</option></select></div>
<div class="control"><label>Intensidade <span class="val" id="sV">1.0</span></label><input type="range" id="sstr" min="0.1" max="5" step="0.1" value="1"></div>
<div class="control"><label>Mostrar solução</label><label class="toggle"><input type="checkbox" id="showV" checked><span class="track"></span></label></div>
<div class="control"><label>Campo E</label><label class="toggle"><input type="checkbox" id="showE" checked><span class="track"></span></label></div>
<div class="control"><label>Linhas de fluxo</label><label class="toggle"><input type="checkbox" id="showS"><span class="track"></span></label></div>
<div class="control"><label>Resolução (pts) <span class="val" id="gV">40</span></label><input type="range" id="gres" min="20" max="80" value="40"></div>
<div class="btn-row"><button class="btn primary" id="solve">Resolver</button></div>
<div class="stat-grid" id="stats"></div>`;
		el.querySelector("#bc").value = this.boundaryType;
		el.querySelector("#bval").value = String(this.boundaryVal);
		el.querySelector("#bV").textContent = String(this.boundaryVal);
		el.querySelector("#src").value = this.sourceMode;
		el.querySelector("#sstr").value = String(this.sourceStrength);
		el.querySelector("#sV").textContent = this.sourceStrength.toFixed(1);
		el.querySelector("#showV").checked = this.showSolution;
		el.querySelector("#showE").checked = this.showField;
		el.querySelector("#showS").checked = this.showStreamlines;
		el.querySelector("#gres").value = String(this.gridRes);
		el.querySelector("#gV").textContent = String(this.gridRes);

		el.querySelector("#bc").onchange = (e) => (this.boundaryType = e.target.value);
		el.querySelector("#bval").oninput = (e) => {
			this.boundaryVal = +e.target.value;
			el.querySelector("#bV").textContent = e.target.value;
		};
		el.querySelector("#src").onchange = (e) => (this.sourceMode = e.target.value);
		el.querySelector("#sstr").oninput = (e) => {
			this.sourceStrength = +e.target.value;
			el.querySelector("#sV").textContent = e.target.value;
		};
		el.querySelector("#showV").onchange = (e) => (this.showSolution = e.target.checked);
		el.querySelector("#showE").onchange = (e) => (this.showField = e.target.checked);
		el.querySelector("#showS").onchange = (e) => (this.showStreamlines = e.target.checked);
		el.querySelector("#gres").oninput = (e) => {
			this.gridRes = +e.target.value;
			el.querySelector("#gV").textContent = e.target.value;
		};
		el.querySelector("#solve").onclick = () => {
			this.computeSolution();
		};
		this.computeSolution();
	}
	computeSolution() {
		const gridRows = this.gridRes, gridCols = this.gridRes;
		const dx = W / (gridCols - 1), dy = H / (gridRows - 1);

		// Build source grid
		let sourceGrid = new Float64Array(gridRows * gridCols);
		if (this.sourceMode === "point") {
			const ci = floor(gridCols / 2), cj = floor(gridRows / 2);
			sourceGrid[cj * gridCols + ci] = this.sourceStrength * 100;
		} else if (this.sourceMode === "line") {
			for (let i = gridCols * 0.3; i < gridCols * 0.7; i++) {
				sourceGrid[floor(gridRows / 2) * gridCols + floor(i)] = this.sourceStrength * 10;
			}
		} else if (this.sourceMode === "disk") {
			const ci = gridCols / 2, cj = gridRows / 2, r = gridCols / 6;
			for (let j = 0; j < gridRows; j++) {
				for (let i = 0; i < gridCols; i++) {
					const d2 = (i - ci) ** 2 + (j - cj) ** 2;
					if (d2 < r * r) {
						sourceGrid[j * gridCols + i] = this.sourceStrength * 5;
					}
				}
			}
		}

		const result = solvePoissonFDM(gridRows, gridCols, sourceGrid, this.boundaryType, this.boundaryVal, null, 300, 1e-4);
		this.V = result.V;
		this.sourceGrid = sourceGrid;
		this.gridRows = gridRows;
		this.gridCols = gridCols;
		this.dx = dx;
		this.dy = dy;
		this.iterations = result.iterations;
		this.residual = result.residual;

		const { Ex, Ey } = computeElectricField(this.V, gridRows, gridCols, dx, dy);
		this.Ex = Ex;
		this.Ey = Ey;
	}
	render(c, time) {
		if (W < 2 || H < 2) return;
		c.fillStyle = "#0a0e17";
		c.fillRect(0, 0, W, H);

		if (!this.V) return;

		const { gridRows, gridCols, dx, dy, V, Ex, Ey } = this;

		// Potential solution heatmap
		if (this.showSolution) {
			const tmp = document.createElement("canvas");
			tmp.width = gridCols; tmp.height = gridRows;
			const tc = tmp.getContext("2d"), img = tc.createImageData(gridCols, gridRows), d = img.data;
			const palette = [[30,64,175],[38,154,210],[225,232,240],[244,114,106],[180,24,72]];

			for (let py = 0; py < gridRows; py++) {
				for (let px = 0; px < gridCols; px++) {
					const v = V[py * gridCols + px];
					const t = 0.5 + 0.5 * Math.tanh(v / 20);
					const p = t * (palette.length - 1);
					const pi = min(palette.length - 2, floor(p));
					const u = p - pi;
					const a = palette[pi], b = palette[pi + 1];
					const i = (py * gridCols + px) * 4;
					d[i] = a[0] + (b[0] - a[0]) * u;
					d[i + 1] = a[1] + (b[1] - a[1]) * u;
					d[i + 2] = a[2] + (b[2] - a[2]) * u;
					d[i + 3] = 200;
				}
			}
			tc.putImageData(img, 0, 0);
			c.imageSmoothingEnabled = true;
			c.drawImage(tmp, 0, 0, W, H);
		}

		// Boundary visualization
		c.strokeStyle = "rgba(251,191,36,0.5)";
		c.lineWidth = 2;
		c.strokeRect(0, 0, W, H);
		c.fillStyle = "rgba(251,191,36,0.3)";
		c.font = "9px monospace";
		c.fillText(this.boundaryType === "dirichlet" ? `V=${this.boundaryVal}V` : "∂V/∂n=0", 6, 14);

		// Source visualization
		if (this.sourceGrid && this.sourceMode !== "none") {
			for (let j = 0; j < gridRows; j++) {
				for (let i = 0; i < gridCols; i++) {
					const src = this.sourceGrid[j * gridCols + i];
					if (src !== 0) {
						const intensity = min(1, abs(src) / (this.sourceStrength * 100));
						const color = src > 0 ? `rgba(52,211,153,${0.6 * intensity})` : `rgba(251,113,133,${0.6 * intensity})`;
						c.fillStyle = color;
						c.fillRect(i * dx - 1, j * dy - 1, 2, 2);
					}
				}
			}
		}

		// Electric field vectors
		if (this.showField) {
			c.strokeStyle = "rgba(56,189,248,0.6)";
			c.lineWidth = 1.2;
			const step = max(2, floor(gridCols / 16));
			for (let j = 0; j < gridRows; j += step) {
				for (let i = 0; i < gridCols; i += step) {
					const idx = j * gridCols + i;
					const ex = Ex[idx], ey = Ey[idx];
					const mag = sqrt(ex * ex + ey * ey);
					if (mag < 1e-8) continue;
					const u = ex / mag, v = ey / mag;
					const len = min(15, max(4, Math.log10(mag + 1) * 4));
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

		// Streamlines
		if (this.showStreamlines) {
			const nLines = 12;
			c.strokeStyle = "rgba(103,232,249,0.5)";
			c.lineWidth = 1;
			for (let line = 0; line < nLines; line++) {
				const startX = (line + 0.5) * W / nLines;
				let px = startX, py = H * 0.1;
				c.beginPath();
				c.moveTo(px, py);
				for (let s = 0; s < 200; s++) {
					const i = floor(px / dx), j = floor(py / dy);
					if (i < 1 || i >= gridCols - 1 || j < 1 || j >= gridRows - 1) break;
					const idx = j * gridCols + i;
					let ex = Ex[idx], ey = Ey[idx];
					const mag = sqrt(ex * ex + ey * ey);
					if (mag < 1e-8) break;
					ex /= mag; ey /= mag;
					const h = min(dx, dy) * 0.5;
					px += ex * h;
					py += ey * h;
					if (px < 0 || px > W || py < 0 || py > H) break;
					c.lineTo(px, py);
				}
				c.stroke();
			}
		}

		// Info display
		const infoX = W - 320, infoY = 16, infoW = 310, infoH = 60;
		c.fillStyle = "rgba(7,10,18,.8)";
		c.beginPath();
		c.roundRect(infoX, infoY, infoW, infoH, 8);
		c.fill();
		c.strokeStyle = "rgba(148,163,184,.2)";
		c.stroke();
		c.fillStyle = "rgba(255,255,255,0.7)";
		c.font = "9px monospace";
		c.fillText(`Grid: ${this.gridCols}×${this.gridRows}  Resolução: ${(1/this.gridRes).toFixed(3)}`, infoX + 8, infoY + 18);
		c.fillText(`Iterações: ${this.iterations}  Resíduo: ${this.residual.toExponential(2)}`, infoX + 8, infoY + 32);
		c.fillText(`Fonte: ${this.sourceMode}  Intensidade: ${this.sourceStrength.toFixed(1)}`, infoX + 8, infoY + 46);
		c.fillText(`Borda: ${this.boundaryType === "dirichlet" ? `V=${this.boundaryVal}V` : "Neumann"}`, infoX + 8, infoY + 60);
	}
}
