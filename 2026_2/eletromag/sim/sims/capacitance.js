// ============================================================================
// SIM 3: CAPACITANCE
// ============================================================================
import { Sim } from "../core/sim-base.js";
import {
	V,
	PI,
	sin,
	cos,
	sqrt,
	abs,
	min,
	max,
	floor,
	log,
	EPS0,
} from "../core/math.js";
import { magColor } from "../core/colors.js";
import { W, H } from "../core/canvas.js";

// SOR solver for Laplace equation: ∇²V = 0
// 5-point stencil with relaxation factor ω
function solveLaplaceSOR(rows, cols, V_top, V_bottom, kappaGrid, maxIter=500, tol=1e-4) {
	const ω = 1.8; // Optimal relaxation factor
	let V = new Float64Array(rows * cols);
	
	// Initialize boundary conditions
	for (let j = 0; j < rows; j++) {
		for (let i = 0; i < cols; i++) {
			if (j === 0) V[j * cols + i] = V_top;
			else if (j === rows - 1) V[j * cols + i] = V_bottom;
			else V[j * cols + i] = 0;
		}
	}
	
	let maxDiff = 1e9;
	let iter = 0;
	
	while (maxDiff > tol && iter < maxIter) {
		maxDiff = 0;
		for (let j = 1; j < rows - 1; j++) {
			for (let i = 1; i < cols - 1; i++) {
				const idx = j * cols + i;
				const vTop = kappaGrid ? (kappaGrid[(j-1)*cols + i] || 1.0) : 1.0;
				const vBot = kappaGrid ? (kappaGrid[(j+1)*cols + i] || 1.0) : 1.0;
				const vLeft = kappaGrid ? (kappaGrid[j*cols + (i-1)] || 1.0) : 1.0;
				const vRight = kappaGrid ? (kappaGrid[j*cols + (i+1)] || 1.0) : 1.0;
				
				const V_new = (vTop * V[(j-1)*cols + i] + vBot * V[(j+1)*cols + i] +
							   vLeft * V[j*cols + (i-1)] + vRight * V[j*cols + (i+1)]) /
							  (vTop + vBot + vLeft + vRight);
				
				const V_old = V[idx];
				V[idx] = V_old + ω * (V_new - V_old);
				
				const diff = abs(V[idx] - V_old);
				if (diff > maxDiff) maxDiff = diff;
			}
		}
		iter++;
	}
	return V;
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

export class CapSim extends Sim {
	constructor() {
		super("Capacitância", "⊞");
		this.type = "parallel";
		this.V = 10;
		this.d = 80;
		this.A = 4000;
		this.a = 15;
		this.b = 40;
		this.L = 100;
		this.r1 = 20;
		this.r2 = 50;
		this.diel = false;
		this.kappa = 2.2;
		this.anim = false;
		this.showSORField = false;
		this.hint = "Ajuste geometria, tensão e dielétrico; os resultados atualizam ao vivo";
	}
	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">⊞</span> ${this.name}</h3>
<div class="formula" id="formula">C = κε₀A/d &nbsp;|&nbsp; U = ½CV²</div>
<div class="control"><label>Configuração</label><select id="tp"><option value="parallel">Placas Paralelas</option><option value="cyl">Cilíndrica</option><option value="sph">Esférica</option></select></div>
<div class="control"><label>Tensão V (V) <span class="val" id="vV">10</span></label><input type="range" id="V" min="1" max="50" value="10"></div>
<div id="parallel-params">
<div class="control"><label>Distância d (mm) <span class="val" id="dV">80</span></label><input type="range" id="d" min="30" max="200" value="80"></div>
<div class="control"><label>Área A (mm²) <span class="val" id="aV">4000</span></label><input type="range" id="A" min="1000" max="10000" value="4000"></div></div>
<div id="cyl-params" hidden>
<div class="control"><label>Raio interno a (mm) <span class="val" id="caV">15</span></label><input type="range" id="ca" min="5" max="45" value="15"></div>
<div class="control"><label>Raio externo b (mm) <span class="val" id="cbV">40</span></label><input type="range" id="cb" min="10" max="80" value="40"></div>
<div class="control"><label>Comprimento L (mm) <span class="val" id="lV">100</span></label><input type="range" id="L" min="20" max="500" value="100"></div></div>
<div id="sph-params" hidden>
<div class="control"><label>Raio interno r₁ (mm) <span class="val" id="r1V">20</span></label><input type="range" id="r1" min="5" max="45" value="20"></div>
<div class="control"><label>Raio externo r₂ (mm) <span class="val" id="r2V">50</span></label><input type="range" id="r2" min="10" max="80" value="50"></div></div>
<div class="control"><label>Dielétrico</label><label class="toggle"><input type="checkbox" id="diel"><span class="track"></span></label></div>
<div class="control"><label>Permissividade relativa κ <span class="val" id="kV">2.2</span></label><input type="range" id="kap" min="1" max="10" step="0.1" value="2.2"></div>
<div class="control"><label>Animar cargas</label><label class="toggle"><input type="checkbox" id="anim"><span class="track"></span></label></div>
<div class="control"><label>Mostrar campo V/E (SOR)</label><label class="toggle"><input type="checkbox" id="showSORField"><span class="track"></span></label></div>
<div class="btn-row"><button class="btn primary" id="calc">Calcular</button></div>
<div class="stat-grid" id="stats"></div>`;
		el.querySelector("#tp").value = this.type;
		el.querySelector("#V").value = String(this.V);
		el.querySelector("#vV").textContent = String(this.V);
		el.querySelector("#d").value = String(this.d);
		el.querySelector("#dV").textContent = String(this.d);
		el.querySelector("#A").value = String(this.A);
		el.querySelector("#aV").textContent = String(this.A);
		for (const [id, value] of [["ca",this.a],["cb",this.b],["L",this.L],["r1",this.r1],["r2",this.r2]]) el.querySelector(`#${id}`).value=String(value);
		el.querySelector("#caV").textContent=String(this.a);el.querySelector("#cbV").textContent=String(this.b);el.querySelector("#lV").textContent=String(this.L);el.querySelector("#r1V").textContent=String(this.r1);el.querySelector("#r2V").textContent=String(this.r2);
		el.querySelector("#diel").checked = this.diel;
		el.querySelector("#kap").value = String(this.kappa);
		el.querySelector("#kV").textContent = this.kappa.toFixed(1);
		el.querySelector("#anim").checked = this.anim;
		el.querySelector("#showSORField").checked = this.showSORField;
		const formulas={parallel:"C = κε₀A/d &nbsp;|&nbsp; ∇²V=0",cyl:"C = 2πκε₀L/ln(b/a)",sph:"C = 4πκε₀ab/(b−a)"};
		const showGeometry=()=>{el.querySelector("#parallel-params").hidden=this.type!=="parallel";el.querySelector("#cyl-params").hidden=this.type!=="cyl";el.querySelector("#sph-params").hidden=this.type!=="sph";};
		showGeometry();
		el.querySelector("#tp").onchange = (e) => { this.type = e.target.value; el.querySelector("#formula").textContent=`${formulas[this.type]}  |  U = ½CV²`; showGeometry(); this.calc(el); };
		el.querySelector("#V").oninput = (e) => {
			this.V = +e.target.value;
			el.querySelector("#vV").textContent = e.target.value;
			this.calc(el);
		};
		el.querySelector("#d").oninput = (e) => {
			this.d = +e.target.value;
			el.querySelector("#dV").textContent = e.target.value;
			this.calc(el);
		};
		el.querySelector("#A").oninput = (e) => {
			this.A = +e.target.value;
			el.querySelector("#aV").textContent = e.target.value;
			this.calc(el);
		};
		const bindDimension=(id,prop,valueId,outerId=null)=>{el.querySelector(`#${id}`).oninput=e=>{this[prop]=+e.target.value;if(outerId&&this[prop]>=this[outerId]){this[outerId]=this[prop]+1;el.querySelector(`#${outerId === "b" ? "cb" : "r2"}`).value=String(this[outerId]);el.querySelector(`#${outerId === "b" ? "cbV" : "r2V"}`).textContent=String(this[outerId]);}el.querySelector(`#${valueId}`).textContent=e.target.value;this.calc(el);};};
		bindDimension("ca","a","caV","b");bindDimension("r1","r1","r1V","r2");bindDimension("L","L","lV");
		el.querySelector("#cb").oninput=e=>{this.b=Math.max(this.a+1,+e.target.value);e.target.value=String(this.b);el.querySelector("#cbV").textContent=String(this.b);this.calc(el);};
		el.querySelector("#r2").oninput=e=>{this.r2=Math.max(this.r1+1,+e.target.value);e.target.value=String(this.r2);el.querySelector("#r2V").textContent=String(this.r2);this.calc(el);};
		el.querySelector("#diel").onchange = (e) => { this.diel = e.target.checked; this.calc(el); };
		el.querySelector("#kap").oninput = (e) => { this.kappa=+e.target.value; el.querySelector("#kV").textContent=this.kappa.toFixed(1); this.calc(el); };
		el.querySelector("#anim").onchange = (e) => (this.anim = e.target.checked);
		el.querySelector("#showSORField").onchange = (e) => (this.showSORField = e.target.checked);
		el.querySelector("#calc").onclick = () => this.calc(el);
		this.calc(el);
	}
	calc(el) {
		let C;
		if (this.type === "parallel") C = (EPS0 * (this.A / 1e6)) / (this.d / 1e3);
		else if (this.type === "cyl") {
			C = (2 * PI * EPS0 * (this.L / 1e3)) / log(this.b / this.a);
		} else {
			C = (4 * PI * EPS0 * ((this.r1 * this.r2) / (this.r2 - this.r1))) / 1e3;
		}
		if (this.diel) C *= this.kappa;
		const U = 0.5 * C * this.V * this.V,
			Q = C * this.V;
		let E;
		if (this.type === "parallel") E=this.V/(this.d/1e3);
		else if (this.type === "cyl") { const a=this.a/1e3,b=this.b/1e3; E=this.V/(a*log(b/a)); }
		else { const a=this.r1/1e3,b=this.r2/1e3; E=(this.V*b)/(a*(b-a)); }
		el.querySelector("#stats").innerHTML =
			`<div class="stat"><div class="num">${(C * 1e12).toFixed(2)}</div><div class="lbl">C (pF)</div></div>
  <div class="stat"><div class="num">${(Q * 1e9).toFixed(3)}</div><div class="lbl">Q (nC)</div></div>
  <div class="stat"><div class="num">${(U * 1e6).toFixed(3)}</div><div class="lbl">U (µJ)</div></div>
  <div class="stat"><div class="num">${(E / 1e6).toFixed(3)}</div><div class="lbl">E (kV/mm)</div></div>`;
	}
	render(c, time) {
		if (W < 2 || H < 2) return;
		c.fillStyle = "#0a0e17";
		c.fillRect(0, 0, W, H);
		const cx = W / 2,
			cy = H / 2,
			t = 0.5 * (1 - cos((2 * PI * time) / 2));
		let parallelGeometry=null;
		if (this.type === "parallel") {
			// Area controls plate size around a fixed center. Perspective depth is
			// visual only and must never translate the capacitor vertically.
			const pw=min(max(76,sqrt(this.A)*1.65),min(230,W*.48)),depth=min(38,max(18,pw*.22)),gap=min(max(34,this.d*.55),min(132,H*.36)),skew=depth*.48;
			const topY=cy-gap/2,bottomY=cy+gap/2;parallelGeometry={pw,depth,gap,skew,topY,bottomY};
			const platePath=(y)=>{c.beginPath();c.moveTo(cx-pw/2,y);c.lineTo(cx+pw/2,y);c.lineTo(cx+pw/2+skew,y-depth);c.lineTo(cx-pw/2+skew,y-depth);c.closePath()};
			// Dielectric volume sits exactly between the plates.
			if(this.diel){c.beginPath();c.moveTo(cx-pw/2+3,topY+3);c.lineTo(cx+pw/2-3,topY+3);c.lineTo(cx+pw/2-3,bottomY-5);c.lineTo(cx-pw/2+3,bottomY-5);c.closePath();c.fillStyle="rgba(56,189,248,.13)";c.fill();c.strokeStyle="rgba(56,189,248,.24)";c.stroke()}
			for(const [y,color] of [[topY,"#94a3b8"],[bottomY,"#64748b"]]){platePath(y);const g=c.createLinearGradient(cx-pw/2,y-depth,cx+pw/2,y);g.addColorStop(0,"#475569");g.addColorStop(.55,color);g.addColorStop(1,"#cbd5e1");c.fillStyle=g;c.fill();c.strokeStyle="rgba(226,232,240,.38)";c.lineWidth=1;c.stroke()}
			c.fillStyle = "#94a3b8";
			c.font = "12px sans-serif";
			c.fillText("+", cx - pw / 2 - 20, topY-4);c.fillText("−", cx - pw / 2 - 20, bottomY-4);
			c.strokeStyle = "rgba(251,191,36,0.35)";
			c.lineWidth = 1;
			const arrows=max(4,min(11,floor(pw/22)));for(let i=0;i<arrows;i++){
				const x=cx-pw/2+14+i*(pw-28)/max(1,arrows-1),y1=topY+5,y2=bottomY-7,ay=y1+(y2-y1)*(.3+.35*t);c.beginPath();c.moveTo(x,y1);c.lineTo(x,y2);c.moveTo(x,ay);c.lineTo(x-3,ay-5);c.moveTo(x,ay);c.lineTo(x+3,ay-5);c.stroke();
			}
			if (this.diel) {
				c.fillStyle = "rgba(255,255,255,0.5)";
				c.font = "11px sans-serif";
				c.fillText(`κ=${this.kappa}`, cx - 15, cy + 4);
			}
			
			// Field lines and equipotentials using SOR solution
			if (this.showSORField) {
				const gridRows = 60, gridCols = 80;
				let padX, padY, plotW, plotH, dx, dy, topY, bottomY;

				if (this.type === "parallel") {
					padX = 60; padY = 40;
					plotW = W - 2 * padX; plotH = H - 2 * padY;
					topY = parallelGeometry.topY;
					bottomY = parallelGeometry.bottomY;
				} else {
					// Cylindrical/Spherical: center grid on coil center
					plotW = 170; plotH = 230;
					padX = cx - plotW / 2;
					padY = cy - plotH / 2;
					topY = padY;
					bottomY = padY + plotH;
				}
				dx = plotW / (gridCols - 1); dy = plotH / (gridRows - 1);
				
				// Build kappa grid for dielectric
				let kappaGrid = null;
				if (this.diel) {
					kappaGrid = new Float64Array(gridRows * gridCols);
					for (let j = 0; j < gridRows; j++) {
						for (let i = 0; i < gridCols; i++) {
							let inDiel = false;
							const px = padX + i * dx;
							const py = padY + j * dy;

							if (this.type === "parallel") {
								const topY_rel = (topY - padY) / dy;
								const botY_rel = (bottomY - padY) / dy;
								inDiel = j > topY_rel + 1 && j < botY_rel - 1;
							} else if (this.type === "cyl") {
								const dist = sqrt((px - cx) ** 2 + (py - cy) ** 2);
								inDiel = dist > this.a && dist < this.b;
							} else {
								const dist = sqrt((px - cx) ** 2 + (py - cy) ** 2);
								inDiel = dist > this.r1 && dist < this.r2;
							}

							kappaGrid[j * gridCols + i] = inDiel ? this.kappa : 1.0;
						}
					}
				}
				
				// Solve Laplace equation
				const V_top = this.V, V_bottom = 0;
				const V = solveLaplaceSOR(gridRows, gridCols, V_top, V_bottom, kappaGrid, 300, 1e-3);
				const { Ex, Ey } = computeElectricField(V, gridRows, gridCols, dx, dy);
				
				// Draw field lines using streamline integration
				c.strokeStyle = "rgba(251,191,36,0.4)";
				c.lineWidth = 1;
				const nFieldLines = this.type === "parallel" ? 7 : 8;
				for (let i = 0; i < nFieldLines; i++) {
					let cx_plot, cy_plot;

					if (this.type === "parallel") {
						cx_plot = padX + (i + 1) * plotW / (nFieldLines + 1);
						cy_plot = topY + 8;
					} else if (this.type === "cyl") {
						const ang = (2 * PI * i) / nFieldLines;
						const r = (this.a + this.b) / 2;
						cx_plot = cx + r * cos(ang);
						cy_plot = cy + r * sin(ang);
					} else {
						const ang = (2 * PI * i) / nFieldLines;
						const r = (this.r1 + this.r2) / 2;
						cx_plot = cx + r * cos(ang);
						cy_plot = cy + r * sin(ang);
					}
					
					c.beginPath();
					c.moveTo(cx_plot, cy_plot);
					
					// RK4 integration
					for (let step = 0; step < 120; step++) {
						const gi = floor((cx_plot - padX) / dx);
						const gj = floor((cy_plot - padY) / dy);
						
						if (gi < 1 || gi >= gridCols - 2 || gj < 1 || gj >= gridRows - 2) break;
						
						const idx = gj * gridCols + gi;
						let ex = Ex[idx] / dx;
						let ey = Ey[idx] / dy;
						const emag = sqrt(ex * ex + ey * ey);
						if (emag < 1e-6) break;
						ex /= emag; ey /= emag;
						
						// RK4 step
						const h = min(dx, dy) * 0.4;
						
						const k1x = ex, k1y = ey;
						
						const gi2 = floor((cx_plot + k1x * h * 0.5 - padX) / dx);
						const gj2 = floor((cy_plot + k1y * h * 0.5 - padY) / dy);
						let ex2=0, ey2=0;
						if (gi2 >= 1 && gi2 < gridCols - 2 && gj2 >= 1 && gj2 < gridRows - 2) {
							const idx2 = gj2 * gridCols + gi2;
							ex2 = Ex[idx2] / dx; ey2 = Ey[idx2] / dy;
							const emag2 = sqrt(ex2 * ex2 + ey2 * ey2);
							if (emag2 > 1e-6) { ex2 /= emag2; ey2 /= emag2; }
						}
						const k2x = ex2, k2y = ey2;
						
						const gi3 = floor((cx_plot + k2x * h * 0.5 - padX) / dx);
						const gj3 = floor((cy_plot + k2y * h * 0.5 - padY) / dy);
						let ex3=0, ey3=0;
						if (gi3 >= 1 && gi3 < gridCols - 2 && gj3 >= 1 && gj3 < gridRows - 2) {
							const idx3 = gj3 * gridCols + gi3;
							ex3 = Ex[idx3] / dx; ey3 = Ey[idx3] / dy;
							const emag3 = sqrt(ex3 * ex3 + ey3 * ey3);
							if (emag3 > 1e-6) { ex3 /= emag3; ey3 /= emag3; }
						}
						const k3x = ex3, k3y = ey3;
						
						const gi4 = floor((cx_plot + k3x * h - padX) / dx);
						const gj4 = floor((cy_plot + k3y * h - padY) / dy);
						let ex4=0, ey4=0;
						if (gi4 >= 1 && gi4 < gridCols - 2 && gj4 >= 1 && gj4 < gridRows - 2) {
							const idx4 = gj4 * gridCols + gi4;
							ex4 = Ex[idx4] / dx; ey4 = Ey[idx4] / dy;
							const emag4 = sqrt(ex4 * ex4 + ey4 * ey4);
							if (emag4 > 1e-6) { ex4 /= emag4; ey4 /= emag4; }
						}
						const k4x = ex4, k4y = ey4;
						
						cx_plot += (h / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
						cy_plot += (h / 6) * (k1y + 2 * k2y + 2 * k3y + k4y);

						if (cx_plot < padX || cx_plot > padX + plotW || cy_plot < topY || cy_plot > bottomY) break;
						c.lineTo(cx_plot, cy_plot);
					}
					c.stroke();
				}
			}
			
			c.fillStyle = "rgba(255,255,255,0.3)";
			c.font = "10px monospace";
			c.textAlign = "center";
			c.fillText(`d = ${this.d} mm`, cx, bottomY + 22);
			c.fillText(`A = ${this.A} mm²`, cx, topY-depth-12);
			c.textAlign = "start";
		} else if (this.type === "cyl") {
			const a = this.a,
				b = this.b;
			c.beginPath();
			c.arc(cx, cy, a, 0, 2 * PI);
			c.fillStyle = "#64748b";
			c.fill();
			c.beginPath();
			c.arc(cx, cy, b, 0, 2 * PI);
			c.strokeStyle = "#64748b";
			c.lineWidth = 4;
			c.stroke();
			c.strokeStyle = "rgba(251,191,36,0.3)";
			c.lineWidth = 1;
			for (let i = 0; i < 12; i++) {
				const a2 = (2 * PI * i) / 12;
				c.beginPath();
				c.moveTo(cx + a * cos(a2), cy + a * sin(a2));
				c.lineTo(cx + b * cos(a2), cy + b * sin(a2));
				c.stroke();
			}
			c.fillStyle = "#94a3b8";
			c.font = "11px sans-serif";
			c.fillText("a", cx - 5, cy + 4);
			c.fillText("b", cx + b / 2 - 3, cy + 12);
			c.fillText(`L = ${this.L} mm`, cx-b, cy+b+24);
		} else {
			const a = this.r1,
				b = this.r2;
			c.beginPath();
			c.arc(cx, cy, a, 0, 2 * PI);
			c.fillStyle = "#64748b";
			c.fill();
			c.beginPath();
			c.arc(cx, cy, b, 0, 2 * PI);
			c.strokeStyle = "#64748b";
			c.lineWidth = 3;
			c.stroke();
			c.strokeStyle = "rgba(251,191,36,0.25)";
			c.lineWidth = 1;
			for (let i = 0; i < 16; i++) {
				const a2 = (2 * PI * i) / 16;
				c.beginPath();
				c.moveTo(cx + a * cos(a2), cy + a * sin(a2));
				c.lineTo(cx + b * cos(a2), cy + b * sin(a2));
				c.stroke();
			}
			c.fillStyle = "#94a3b8";
			c.font = "11px sans-serif";
			c.fillText("r₁", cx - a / 2 - 10, cy + 4);
			c.fillText("r₂", cx + b / 2 - 3, cy + 12);
		}
		if (this.anim && this.type === "parallel") {
			const {pw,gap}=parallelGeometry,n=20;
			for (let i = 0; i < n; i++) {
				const ag = (2 * PI * i) / n + time * 2,
					x = cx + ((cos(ag) * pw) / 2) * 0.8,
					y = cy + sin(ag) * gap * 0.35;
				c.beginPath();
				c.arc(x, y, 3, 0, 2 * PI);
				c.fillStyle = i % 2 ? "#f87171" : "#38bdf8";
				c.fill();
			}
		}
		c.fillStyle = "rgba(255,255,255,0.5)";
		c.font = "11px monospace";
		c.fillText(`V = ${this.V}V`, 10, 20);
	}
}
