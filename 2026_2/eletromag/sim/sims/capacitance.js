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
		const formulas={parallel:"C = κε₀A/d",cyl:"C = 2πκε₀L/ln(b/a)",sph:"C = 4πκε₀ab/(b−a)"};
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
