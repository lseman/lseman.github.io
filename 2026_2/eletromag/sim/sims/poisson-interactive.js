// ============================================================================
// SIM 10: INTERACTIVE POISSON SOLVER WITH GEOMETRY EDITOR
// ============================================================================
import { Sim } from "../core/sim-base.js";
import { PI, sin, cos, sqrt, abs, min, max, floor } from "../core/math.js";
import { W, H, S } from "../core/canvas.js";

function solvePoissonFDM(rows, cols, sourceGrid, domainMask, maxIter=500, tol=1e-4) {
	const ω = 1.8;
	let V = new Float64Array(rows * cols);

	let maxDiff = 1e9, iter = 0;
	while (maxDiff > tol && iter < maxIter) {
		maxDiff = 0;
		for (let j = 1; j < rows - 1; j++) {
			for (let i = 1; i < cols - 1; i++) {
				const idx = j * cols + i;
				if (domainMask && !domainMask[idx]) continue;

				const source = sourceGrid ? sourceGrid[idx] : 0;
				const V_new = (V[(j-1)*cols + i] + V[(j+1)*cols + i] +
							   V[j*cols + (i-1)] + V[j*cols + (i+1)] + source) / 4;

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

function computeElectricField(V, rows, cols, dx, dy, domainMask) {
	const Ex = new Float64Array(rows * cols);
	const Ey = new Float64Array(rows * cols);
	for (let j = 1; j < rows - 1; j++) {
		for (let i = 1; i < cols - 1; i++) {
			const idx = j * cols + i;
			if (domainMask && !domainMask[idx]) continue;
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
<div class="formula" id="formula">∇²V = −ρ/ε₀<br>Geometria interativa</div>
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
		let domainMask = new Uint8Array(rows * cols);
		const dx = W / (cols - 1), dy = H / (rows - 1);
		for (let j = 0; j < rows; j++) {
			for (let i = 0; i < cols; i++) {
				if (this.isInsideGeometry(i * dx, j * dy)) domainMask[j * cols + i] = 1;
			}
		}
		return domainMask;
	}
	isInsideGeometry(x, y) {
		const cx = W / 2, cy = H / 2, w = W / 3, h = H / 3;
		if (this.geometry === "circle") {
			const r = min(W, H) / 4;
			return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
		}
		const inRect = x >= cx - w/2 && x <= cx + w/2 && y >= cy - h/2 && y <= cy + h/2;
		if (this.geometry === "rect") return inRect;
		return inRect || (x >= cx && x <= cx + 2*w/3 && y >= cy && y <= cy + h/2);
	}
	geometryPath() {
		const cx = W / 2, cy = H / 2, w = W / 3, h = H / 3;
		const path = new Path2D();
		if (this.geometry === "rect") path.rect(cx - w/2, cy - h/2, w, h);
		else if (this.geometry === "circle") path.arc(cx, cy, min(W, H) / 4, 0, 2 * PI);
		else {
			path.moveTo(cx - w/2, cy - h/2);
			path.lineTo(cx + w/2, cy - h/2);
			path.lineTo(cx + w/2, cy);
			path.lineTo(cx + 2*w/3, cy);
			path.lineTo(cx + 2*w/3, cy + h/2);
			path.lineTo(cx - w/2, cy + h/2);
			path.closePath();
		}
		return path;
	}
	drawGeometryBorder(c, dx, dy) {
		c.strokeStyle = "rgba(251,191,36,0.7)";
		c.lineWidth = 2.5;
		c.stroke(this.geometryPath());
	}
	meshPoints() {
		const points = [];
		const cx = W / 2, cy = H / 2, w = W / 3, h = H / 3;
		const left = cx - w/2, right = cx + w/2;
		const top = cy - h/2, bottom = cy + h/2;
		const divisions = max(2, this.gridRes - 1);

		if (this.geometry === "circle") {
			const radius = min(W, H) / 4;
			// gridRes describes points across the diameter; half as many radial
			// divisions gives approximately the same point density as a square grid.
			const radialDivisions = max(1, Math.round(divisions / 2));
			const spacing = radius / radialDivisions;
			points.push({ x: cx, y: cy });
			for (let ring = 1; ring <= radialDivisions; ring++) {
				const r = radius * ring / radialDivisions;
				const count = max(6, Math.round(2 * PI * r / spacing));
				for (let k = 0; k < count; k++) {
					const angle = 2 * PI * k / count;
					points.push({ x: cx + r * cos(angle), y: cy + r * sin(angle) });
				}
			}
			return points;
		}

		// Build every row from its exact endpoints. This guarantees that the
		// first/last nodes stay on the same boundary as density is increased.
		const nominalSpacing = h / divisions;
		for (let row = 0; row <= divisions; row++) {
			const y = top + h * row / divisions;
			const rowRight = this.geometry === "lshape" && y >= cy ? cx + 2*w/3 : right;
			const columns = max(1, Math.round((rowRight - left) / nominalSpacing));
			for (let column = 0; column <= columns; column++) {
				points.push({
					x: left + (rowRight - left) * column / columns,
					y,
				});
			}
		}
		return points;
	}
	getMeshPoints() {
		const key = `${this.geometry}:${this.gridRes}:${W}:${H}`;
		if (this._meshKey !== key) {
			this._meshKey = key;
			this._meshPoints = this.meshPoints();
		}
		return this._meshPoints;
	}
	drawMeshPoints(c) {
		const radius = this.gridRes >= 60 ? 0.45 : this.gridRes >= 35 ? 0.6 : 0.8;
		c.fillStyle = "rgba(226,232,240,0.22)";
		c.beginPath();
		for (const point of this.getMeshPoints()) {
			c.moveTo(point.x + radius, point.y);
			c.arc(point.x, point.y, radius, 0, 2 * PI);
		}
		c.fill();
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
				const rx = Math.ceil(r / dx), ry = Math.ceil(r / dy);
				for (let j = max(0, cj - ry); j <= min(rows - 1, cj + ry); j++) {
					for (let i = max(0, ci - rx); i <= min(cols - 1, ci + rx); i++) {
						if ((i * dx - src.x) ** 2 + (j * dy - src.y) ** 2 <= r * r) {
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

		const domainMask = this.buildGeometryGrid(gridRows, gridCols);
		const sourceGrid = this.buildSourceGrid(gridRows, gridCols, dx, dy);

		const result = solvePoissonFDM(gridRows, gridCols, sourceGrid, domainMask, 300, 1e-4);
		this.V = result.V;
		this.gridRows = gridRows;
		this.gridCols = gridCols;
		this.dx = dx;
		this.dy = dy;
		this.domainMask = domainMask;
		this.iterations = result.iterations;
		this.residual = result.residual;

		const { Ex, Ey } = computeElectricField(this.V, gridRows, gridCols, dx, dy, domainMask);
		this.Ex = Ex;
		this.Ey = Ey;
	}
	resize() {
		// Canvas dimensions define the physical geometry, so rebuild its sampling
		// after a layout change while preserving the selected resolution.
		this.computeSolution();
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
			c.save();
			c.clip(this.geometryPath());
			c.drawImage(tmp, 0, 0, W, H);
			c.restore();
		}

		// Shape-fitted sample nodes. Resolution changes their spacing/count only;
		// the outermost nodes always remain on the exact same geometry boundary.
		this.drawMeshPoints(c);

		// E field
		if (this.showField) {
			c.save();
			c.clip(this.geometryPath());
			c.strokeStyle = "rgba(103,232,249,0.95)";
			c.lineWidth = 1.8;
			c.lineCap = "round";
			c.lineJoin = "round";
			const step = max(2, floor(gridCols / 14));
			for (let j = 0; j < gridRows; j += step) {
				for (let i = 0; i < gridCols; i += step) {
					if (!this.isInsideGeometry(i * dx, j * dy)) continue;
					const idx = j * gridCols + i;
					const ex = Ex[idx], ey = Ey[idx];
					const mag = sqrt(ex * ex + ey * ey);
					if (mag < 1e-8) continue;
					const u = ex / mag, v = ey / mag;
					const len = min(26, max(12, Math.log10(mag + 1) * 8));
					const head = min(6, len * 0.3);
					const x = i * dx, y = j * dy;
					const x0 = x - u * len/2, y0 = y - v * len/2;
					const x1 = x + u * len/2, y1 = y + v * len/2;
					c.beginPath();
					c.moveTo(x0, y0);
					c.lineTo(x1, y1);
					c.moveTo(x1, y1);
					c.lineTo(x1 - u * head - v * head * 0.55, y1 - v * head + u * head * 0.55);
					c.moveTo(x1, y1);
					c.lineTo(x1 - u * head + v * head * 0.55, y1 - v * head - u * head * 0.55);
					c.stroke();
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
