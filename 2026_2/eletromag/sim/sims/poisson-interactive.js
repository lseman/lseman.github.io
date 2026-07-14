// ============================================================================
// SIM 10: INTERACTIVE POISSON SOLVER WITH GEOMETRY EDITOR
// ============================================================================
import { Sim } from "../core/sim-base.js";
import { PI, sin, cos, sqrt, abs, min, max, floor } from "../core/math.js";
import { W, H, S } from "../core/canvas.js";

function solvePoissonFDM(rows, cols, sourceGrid, boundaryGrid, maxIter=500, tol=1e-4) {
	const ω = 1.8;
	let V = new Float64Array(rows * cols);

	// Initialize with boundary values
	for (let j = 0; j < rows; j++) {
		for (let i = 0; i < cols; i++) {
			const idx = j * cols + i;
			V[idx] = boundaryGrid ? boundaryGrid[idx] : 0;
		}
	}

	let maxDiff = 1e9, iter = 0;
	while (maxDiff > tol && iter < maxIter) {
		maxDiff = 0;
		for (let j = 1; j < rows - 1; j++) {
			for (let i = 1; i < cols - 1; i++) {
				const idx = j * cols + i;
				if (boundaryGrid && boundaryGrid[idx] !== 0) continue; // Skip boundary cells

				const source = sourceGrid ? sourceGrid[idx] : 0;
				const V_new = (V[(j-1)*cols + i] + V[(j+1)*cols + i] +
							   V[j*cols + (i-1)] + V[j*cols + (i+1)]) / 4 - source / 4;

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

export class PoissonInteractiveSim extends Sim {
	constructor() {
		super("Poisson Interativo", "∇²");
		this.geometry = "rect";
		this.sourceMode = "point";
		this.sourceStrength = 1;
		this.sources = [];
		this.showPotential = true;
		this.showField = true;
		this.showStreamlines = false;
		this.gridRes = 40;
		this.dragSource = null;
		this.hint = "Clique para adicionar fontes. Arraste para mover. Geometria se alinha à malha.";
	}
	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">∇²</span> ${this.name}</h3>
<div class="formula" id="formula">∇²V = ρ/ε₀  |  Geometria interativa</div>
<div class="control"><label>Geometria</label><select id="geom"><option value="rect">Retângulo</option><option value="circle">Círculo</option><option value="lshape">L-Shape</option></select></div>
<div class="control"><label>Tipo de fonte</label><select id="src"><option value="point">Ponto</option><option value="line">Linha</option><option value="disk">Disco</option></select></div>
<div class="control"><label>Intensidade <span class="val" id="sV">1.0</span></label><input type="range" id="sstr" min="0.1" max="5" step="0.1" value="1"></div>
<div class="control"><label>Mostrar potencial</label><label class="toggle"><input type="checkbox" id="showV" checked><span class="track"></span></label></div>
<div class="control"><label>Campo E</label><label class="toggle"><input type="checkbox" id="showE" checked><span class="track"></span></label></div>
<div class="control"><label>Linhas de fluxo</label><label class="toggle"><input type="checkbox" id="showS"><span class="track"></span></label></div>
<div class="control"><label>Resolução <span class="val" id="gV">40</span></label><input type="range" id="gres" min="20" max="80" value="40"></div>
<div class="btn-row"><button class="btn primary" id="solve">Resolver</button><button class="btn" id="clear">Limpar fontes</button></div>
<div class="stat-grid" id="stats"></div>`;
		el.querySelector("#geom").value = this.geometry;
		el.querySelector("#src").value = this.sourceMode;
		el.querySelector("#sstr").value = String(this.sourceStrength);
		el.querySelector("#sV").textContent = this.sourceStrength.toFixed(1);
		el.querySelector("#showV").checked = this.showPotential;
		el.querySelector("#showE").checked = this.showField;
		el.querySelector("#showS").checked = this.showStreamlines;
		el.querySelector("#gres").value = String(this.gridRes);
		el.querySelector("#gV").textContent = String(this.gridRes);

		el.querySelector("#geom").onchange = (e) => { this.geometry = e.target.value; this.computeSolution(); };
		el.querySelector("#src").onchange = (e) => (this.sourceMode = e.target.value);
		el.querySelector("#sstr").oninput = (e) => {
			this.sourceStrength = +e.target.value;
			el.querySelector("#sV").textContent = e.target.value;
		};
		el.querySelector("#showV").onchange = (e) => (this.showPotential = e.target.checked);
		el.querySelector("#showE").onchange = (e) => (this.showField = e.target.checked);
		el.querySelector("#showS").onchange = (e) => (this.showStreamlines = e.target.checked);
		el.querySelector("#gres").oninput = (e) => {
			this.gridRes = +e.target.value;
			el.querySelector("#gV").textContent = e.target.value;
			this.computeSolution();
		};
		el.querySelector("#solve").onclick = () => this.computeSolution();
		el.querySelector("#clear").onclick = () => { this.sources = []; this.computeSolution(); };
		this.computeSolution();
	}
	buildGeometryGrid(rows, cols) {
		let boundaryGrid = new Float64Array(rows * cols);
		const cx = cols / 2, cy = rows / 2;

		if (this.geometry === "rect") {
			const w = cols / 3, h = rows / 3;
			for (let j = 0; j < rows; j++) {
				for (let i = 0; i < cols; i++) {
					if (j < cy - h/2 || j > cy + h/2 || i < cx - w/2 || i > cx + w/2) {
						boundaryGrid[j * cols + i] = 10;
					}
				}
			}
		} else if (this.geometry === "circle") {
			const r = min(cols, rows) / 4;
			for (let j = 0; j < rows; j++) {
				for (let i = 0; i < cols; i++) {
					const d = sqrt((i - cx) ** 2 + (j - cy) ** 2);
					if (d > r) boundaryGrid[j * cols + i] = 10;
				}
			}
		} else if (this.geometry === "lshape") {
			const w = cols / 3, h = rows / 3;
			for (let j = 0; j < rows; j++) {
				for (let i = 0; i < cols; i++) {
					const inV = j >= cy - h/2 && j <= cy + h/2 && i >= cx - w/2 && i <= cx + w/2;
					const inH = j >= cy && j <= cy + h/2 && i >= cx && i <= cx + w/2 + w/3;
					if (!inV && !inH) boundaryGrid[j * cols + i] = 10;
				}
			}
		}
		return boundaryGrid;
	}
	drawGeometryBorder(c, dx, dy) {
		const cx = W / 2, cy = H / 2;
		c.strokeStyle = "rgba(251,191,36,0.7)";
		c.lineWidth = 2.5;

		if (this.geometry === "rect") {
			const w = W / 3, h = H / 3;
			c.strokeRect(cx - w/2, cy - h/2, w, h);
		} else if (this.geometry === "circle") {
			const r = min(W, H) / 4;
			c.beginPath();
			c.arc(cx, cy, r, 0, 2 * PI);
			c.stroke();
		} else if (this.geometry === "lshape") {
			const w = W / 3, h = H / 3;
			c.beginPath();
			// Vertical part
			c.rect(cx - w/2, cy - h/2, w, h);
			// Horizontal extension
			c.rect(cx, cy, w/3 + w/3, h/2);
			c.stroke();
		}
	}
	buildSourceGrid(rows, cols, dx, dy) {
		let sourceGrid = new Float64Array(rows * cols);
		for (const src of this.sources) {
			const ci = floor(src.x / dx), cj = floor(src.y / dy);
			if (src.type === "point") {
				if (ci >= 0 && ci < cols && cj >= 0 && cj < rows) {
					sourceGrid[cj * cols + ci] = src.strength * 100;
				}
			} else if (src.type === "line") {
				const len = src.len || 30;
				const nx = cos(src.ang || 0), ny = sin(src.ang || 0);
				for (let t = -len/2; t <= len/2; t++) {
					const x = src.x + nx * t, y = src.y + ny * t;
					const i = floor(x / dx), j = floor(y / dy);
					if (i >= 0 && i < cols && j >= 0 && j < rows) {
						sourceGrid[j * cols + i] = src.strength * 10;
					}
				}
			} else if (src.type === "disk") {
				const r = src.r || 20;
				for (let j = max(0, cj - r); j <= min(rows - 1, cj + r); j++) {
					for (let i = max(0, ci - r); i <= min(cols - 1, ci + r); i++) {
						if ((i - ci) ** 2 + (j - cj) ** 2 <= r * r) {
							sourceGrid[j * cols + i] = src.strength * 5;
						}
					}
				}
			}
		}
		return sourceGrid;
	}
	computeSolution() {
		const gridRows = this.gridRes, gridCols = this.gridRes;
		const dx = W / (gridCols - 1), dy = H / (gridRows - 1);

		const boundaryGrid = this.buildGeometryGrid(gridRows, gridCols);
		const sourceGrid = this.buildSourceGrid(gridRows, gridCols, dx, dy);

		const result = solvePoissonFDM(gridRows, gridCols, sourceGrid, boundaryGrid, 300, 1e-4);
		this.V = result.V;
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
	onMouseDown(x, y) {
		// Check if clicking on existing source
		for (let i = 0; i < this.sources.length; i++) {
			if (abs(this.sources[i].x - x) < 12 && abs(this.sources[i].y - y) < 12) {
				this.dragSource = i;
				return;
			}
		}
		// Add new source
		this.sources.push({
			x, y, type: this.sourceMode, strength: this.sourceStrength,
			len: 30, ang: 0, r: 15
		});
		this.computeSolution();
	}
	onMouseMove(x, y) {
		if (this.dragSource !== null) {
			this.sources[this.dragSource].x = x;
			this.sources[this.dragSource].y = y;
			this.computeSolution();
		}
	}
	onMouseUp() {
		this.dragSource = null;
	}
	snapToGeometry(x, y) {
		const cx = W / 2, cy = H / 2;

		if (this.geometry === "rect") {
			const w = W / 3, h = H / 3;
			const left = cx - w/2, right = cx + w/2;
			const top = cy - h/2, bottom = cy + h/2;

			// Find closest boundary
			const dLeft = abs(x - left);
			const dRight = abs(x - right);
			const dTop = abs(y - top);
			const dBottom = abs(y - bottom);
			const minD = min(dLeft, dRight, dTop, dBottom);

			if (minD < 50) {
				if (minD === dLeft) return { x: left, y: max(top, min(bottom, y)) };
				if (minD === dRight) return { x: right, y: max(top, min(bottom, y)) };
				if (minD === dTop) return { x: max(left, min(right, x)), y: top };
				if (minD === dBottom) return { x: max(left, min(right, x)), y: bottom };
			}
		} else if (this.geometry === "circle") {
			const r = min(W, H) / 4;
			const dx = x - cx, dy = y - cy;
			const d = sqrt(dx * dx + dy * dy);
			if (d > r * 0.7 && d < r * 1.3) {
				const scale = r / (d || 1);
				return { x: cx + dx * scale, y: cy + dy * scale };
			}
		} else if (this.geometry === "lshape") {
			const w = W / 3, h = H / 3;
			const vLeft = cx - w/2, vRight = cx + w/2;
			const vTop = cy - h/2, vBottom = cy + h/2;
			const hRight = cx + w/3 + w/3;

			// Check proximity to L-shape edges
			const edges = [
				{ x1: vLeft, y1: vTop, x2: vLeft, y2: vBottom },
				{ x1: vLeft, y1: vBottom, x2: vRight, y2: vBottom },
				{ x1: vRight, y1: vTop, x2: vRight, y2: vBottom },
				{ x1: vRight, y1: cy, x2: hRight, y2: cy },
				{ x1: hRight, y1: cy, x2: hRight, y2: vBottom }
			];

			let minDist = Infinity, closest = null;
			for (const e of edges) {
				const t = max(0, min(1, ((x - e.x1) * (e.x2 - e.x1) + (y - e.y1) * (e.y2 - e.y1)) / ((e.x2 - e.x1) ** 2 + (e.y2 - e.y1) ** 2 || 1)));
				const px = e.x1 + t * (e.x2 - e.x1);
				const py = e.y1 + t * (e.y2 - e.y1);
				const dist = sqrt((x - px) ** 2 + (y - py) ** 2);
				if (dist < minDist) { minDist = dist; closest = { x: px, y: py }; }
			}
			if (minDist < 50 && closest) return closest;
		}
		return { x, y };
	}
	render(c, time) {
		if (W < 2 || H < 2 || !this.V) return;
		c.fillStyle = "#0a0e17";
		c.fillRect(0, 0, W, H);

		const { gridRows, gridCols, dx, dy, V, Ex, Ey } = this;

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
					d[i + 3] = 200;
				}
			}
			tc.putImageData(img, 0, 0);
			c.imageSmoothingEnabled = true;
			c.drawImage(tmp, 0, 0, W, H);
		}

		// E field
		if (this.showField) {
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

		// Draw geometry border
		this.drawGeometryBorder(c, this.dx, this.dy);

		// Draw sources
		for (let i = 0; i < this.sources.length; i++) {
			const src = this.sources[i];
			const highlight = this.dragSource === i;
			if (src.type === "point") {
				c.fillStyle = highlight ? "rgba(52,211,153,0.9)" : "rgba(52,211,153,0.7)";
				c.beginPath();
				c.arc(src.x, src.y, 7, 0, 2 * PI);
				c.fill();
			} else if (src.type === "line") {
				c.strokeStyle = highlight ? "rgba(251,191,36,0.9)" : "rgba(251,191,36,0.6)";
				c.lineWidth = highlight ? 4 : 3;
				const nx = cos(src.ang), ny = sin(src.ang);
				c.beginPath();
				c.moveTo(src.x - nx * src.len / 2, src.y - ny * src.len / 2);
				c.lineTo(src.x + nx * src.len / 2, src.y + ny * src.len / 2);
				c.stroke();
			} else if (src.type === "disk") {
				c.strokeStyle = highlight ? "rgba(168,85,247,0.9)" : "rgba(168,85,247,0.6)";
				c.lineWidth = highlight ? 3 : 2;
				c.beginPath();
				c.arc(src.x, src.y, src.r, 0, 2 * PI);
				c.stroke();
			}
		}

		// Info
		const infoX = W - 310, infoY = 16;
		c.fillStyle = "rgba(7,10,18,.8)";
		c.beginPath();
		c.roundRect(infoX, infoY, 300, 80, 8);
		c.fill();
		c.strokeStyle = "rgba(148,163,184,.2)";
		c.stroke();
		c.fillStyle = "rgba(255,255,255,0.7)";
		c.font = "9px monospace";
		c.fillText(`Fontes: ${this.sources.length}  Grid: ${this.gridCols}×${this.gridRows}`, infoX + 8, infoY + 16);
		c.fillText(`Iterações: ${this.iterations}  Resíduo: ${this.residual.toExponential(2)}`, infoX + 8, infoY + 32);
		c.fillText(`Geometria: ${this.geometry}  Tipo: ${this.sourceMode}`, infoX + 8, infoY + 48);
		c.fillText(`Clique no canvas para adicionar fontes. Arraste para mover.`, infoX + 8, infoY + 64);
	}
}
