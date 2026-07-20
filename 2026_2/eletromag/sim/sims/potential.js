// ============================================================================
// SIM 2: POTENTIAL & DIPOLE
// ============================================================================
import { Sim } from "../core/sim-base.js";
import { Charge } from "../core/sources.js";
import { V, PI, sin, cos, sqrt, abs, min, max, floor, K_E } from "../core/math.js";
import { magColor } from "../core/colors.js";
import { W, H, S } from "../core/canvas.js";

export class PotentialSim extends Sim {
	constructor() {
		super("Potencial & Dipolo", "⊕");
		this.charges = [];
		this.levels = 15;
		this.maxV = 150;
		this.showLines = true;
		this.showHeat = true;
		this.showForces=true;
		this.showProbe=true;
		this.initialized = false;
		this.hint = "Arraste as cargas para alterar V, E e a energia";
	}
	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">⊕</span> ${this.name}</h3>
<div class="formula">V = k·q/r <br> U = ½ε₀∫E²dV</div>
<div class="btn-row"><button class="btn primary" id="addP">+ Carga</button><button class="btn" id="addN">− Carga</button><button class="btn" id="dip">Dipolo</button><button class="btn danger" id="del">Remover</button><button class="btn danger" id="clr">Limpar</button></div>
<div class="control"><label>Escala potencial <span class="val" id="mV">150 V</span></label><input type="range" id="maxV" min="20" max="500" step="10" value="150"></div>
<div class="control"><label>Níveis equipotenciais <span class="val" id="lV">15</span></label><input type="range" id="lev" min="5" max="30" value="15"></div>
<div class="control"><label>Linhas de campo</label><label class="toggle"><input type="checkbox" id="lines" checked><span class="track"></span></label></div>
<div class="control"><label>Mapa de calor</label><label class="toggle"><input type="checkbox" id="heat" checked><span class="track"></span></label></div>
<div class="control"><label>Força sobre as cargas</label><label class="toggle"><input type="checkbox" id="forces" checked><span class="track"></span></label></div>
<div class="control"><label>Sonda V/E</label><label class="toggle"><input type="checkbox" id="probe" checked><span class="track"></span></label></div>
<div class="legend"><span class="legend-item"><span class="legend-dot" style="background:#818cf8"></span>Equipotenciais</span><span class="legend-item"><span class="legend-dot" style="background:#38bdf8"></span>Campo (⊥)</span></div>`;
		el.querySelector("#maxV").value = String(this.maxV);
		el.querySelector("#mV").textContent = String(this.maxV);
		el.querySelector("#lev").value = String(this.levels);
		el.querySelector("#lV").textContent = String(this.levels);
		el.querySelector("#lines").checked = this.showLines;
		el.querySelector("#heat").checked = this.showHeat;
		el.querySelector("#forces").checked=this.showForces;el.querySelector("#probe").checked=this.showProbe;
		el.querySelector("#addP").onclick = () => this.addC(true);
		el.querySelector("#addN").onclick = () => this.addC(false);
		el.querySelector("#del").onclick = () => this.removeSelected();
		el.querySelector("#clr").onclick = () => (this.charges = []);
		el.querySelector("#dip").onclick = () => {
			this.charges = [
				new Charge(W / 2 - 40, H / 2, 2, true),
				new Charge(W / 2 + 40, H / 2, -2, false),
			];
		};
		el.querySelector("#maxV").oninput = (e) => {
			this.maxV = +e.target.value;
			el.querySelector("#mV").textContent = e.target.value;
		};
		el.querySelector("#lev").oninput = (e) => {
			this.levels = +e.target.value;
			el.querySelector("#lV").textContent = e.target.value;
		};
		el.querySelector("#lines").onchange = (e) =>
			(this.showLines = e.target.checked);
		el.querySelector("#heat").onchange = (e) =>
			(this.showHeat = e.target.checked);
		el.querySelector("#forces").onchange=e=>this.showForces=e.target.checked;el.querySelector("#probe").onchange=e=>this.showProbe=e.target.checked;
		if (!this.initialized && this.charges.length === 0) {
			this.charges.push(
				new Charge(W / 2 - 60, H / 2, 2, true),
				new Charge(W / 2 + 60, H / 2, 2, false),
			);
			this.initialized = true;
		}
	}
	addC(pos) {
		this.charges.push(
			new Charge(
				W / 2 + (Math.random() - 0.5) * 300,
				H / 2 + (Math.random() - 0.5) * 200,
				pos ? 2 : -2,
				pos,
			),
		);
	}
	E(p) {
		let e = new V(0, 0);
		this.charges.forEach((c) => {
			const r = p.sub(c.pos),
				d = max(r.len(), c.r) / 1000;
			e = e.add(r.norm().mul((K_E * c.q * 1e-9) / (d * d)));
		});
		return e;
	}
	V(p) {
		let v = 0;
		this.charges.forEach((c) => {
			const r = c.pos.sub(p),
				d = max(r.len(), c.r) / 1000;
			v += (K_E * c.q * 1e-9) / d;
		});
		return v;
	}
	onMouseDown(x, y) {
		this.sel = null;
		for (let i = this.charges.length - 1; i >= 0; i--) {
			if (this.charges[i].pos.distTo(new V(x, y)) < 20) {
				this.sel = this.charges[i];
				S.drag = this.charges[i];
				return;
			}
		}
	}
	onMouseMove(x, y) {
		if (S.drag) S.drag.pos = new V(x, y);
	}
	onMouseUp() {
		S.drag = null;
	}
	removeSelected() {
		if (!this.sel) return;
		this.charges = this.charges.filter((charge) => charge !== this.sel);
		this.sel = null;
	}
	render(c, time) {
		if (W < 2 || H < 2) return;
		c.fillStyle = "#0a0e17";
		c.fillRect(0, 0, W, H);
		// Heatmap
		if (this.showHeat) {
			const mx = this.maxV,
				img = c.createImageData(floor(W / 4), floor(H / 4));
			const d = img.data;
			for (let by = 0; by < H; by += 4)
				for (let bx = 0; bx < W; bx += 4) {
					const v = this.V(new V(bx, by)),
						t = (v + mx) / (2 * mx + 0.01),
						col = magColor(max(0, min(1, t)), 1, "plasma");
					const rgb = col.match(/\d+/g).map(Number);
					for (let dy = 0; dy < 4 && by + dy < H; dy++)
						for (let dx = 0; dx < 4 && bx + dx < W; dx++) {
							const i =
								(floor((by + dy) / 4) * floor(W / 4) + floor((bx + dx) / 4)) *
								4;
							d[i] = rgb[0];
							d[i + 1] = rgb[1];
							d[i + 2] = rgb[2];
							d[i + 3] = 120;
						}
				}
			const tmp = document.createElement("canvas");
			tmp.width = floor(W / 4);
			tmp.height = floor(H / 4);
			const tc = tmp.getContext("2d");
			tc.putImageData(img, 0, 0);
			c.imageSmoothingEnabled = true;
			c.drawImage(tmp, 0, 0, W, H);
		}
		this.drawContours(c);
		// Field lines
		if (this.showLines) {
			const starts = [];
			this.charges.forEach((ch) => {
				for (let i = 0; i < 16; i++)starts.push({p:ch.pos.add(new V(cos((2*PI*i)/16),sin((2*PI*i)/16)).mul(10)),direction:ch.q>0?1:-1});
			});
			starts.forEach(({p:st,direction}) => {
				c.beginPath();
				let p = st.clone();
				c.moveTo(p.x, p.y);
				for (let s = 0; s < 150; s++) {
					const e = this.E(p),
						m = e.len();
					if (m < 1e-8) break;
					p = p.add(e.norm().mul(3*direction));
					if(this.charges.some(ch=>ch.q*direction<0&&ch.pos.distTo(p)<ch.r)){c.lineTo(p.x,p.y);break}
					if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) break;
					c.lineTo(p.x, p.y);
				}
				c.strokeStyle = "rgba(56,189,248,0.35)";
				c.lineWidth = 1;
				c.stroke();
			});
			for(let y=28;y<H;y+=42)for(let x=28;x<W;x+=42){const e=this.E(new V(x,y)),m=e.len();if(m<1e-8)continue;const u=e.norm(),len=min(17,max(6,Math.log10(m+1)*3.5)),ex=x+u.x*len,ey=y+u.y*len;c.beginPath();c.moveTo(x,y);c.lineTo(ex,ey);c.lineTo(ex-u.x*4-u.y*2.5,ey-u.y*4+u.x*2.5);c.moveTo(ex,ey);c.lineTo(ex-u.x*4+u.y*2.5,ey-u.y*4-u.x*2.5);c.strokeStyle="rgba(125,211,252,.55)";c.lineWidth=1;c.stroke()}
		}
		if(this.showForces){for(const ch of this.charges){let f=new V();for(const other of this.charges){if(other===ch)continue;const r=ch.pos.sub(other.pos),dm=max(r.len(),20)/1000;f=f.add(r.norm().mul(K_E*ch.q*other.q*1e-18/(dm*dm)))}const m=f.len();if(m>1e-18){const u=f.norm(),len=min(42,max(10,8+Math.log10(m*1e12+1)*9)),ex=ch.pos.x+u.x*len,ey=ch.pos.y+u.y*len;c.beginPath();c.moveTo(ch.pos.x,ch.pos.y);c.lineTo(ex,ey);c.lineTo(ex-u.x*6-u.y*3,ey-u.y*6+u.x*3);c.moveTo(ex,ey);c.lineTo(ex-u.x*6+u.y*3,ey-u.y*6-u.x*3);c.strokeStyle="#fbbf24";c.lineWidth=2;c.stroke()}}}
		this.charges.forEach((ch) => ch.draw(c, this.sel === ch));
		// Energy
		let u = 0;
		for (let i = 0; i < this.charges.length; i++)
			for (let j = i + 1; j < this.charges.length; j++) {
				const d = this.charges[i].pos.distTo(this.charges[j].pos);
				if (d > 0) u += (K_E * this.charges[i].q * this.charges[j].q * 1e-18) / (d / 1000);
			}
		c.fillStyle = "rgba(255,255,255,0.6)";
		c.font = "11px monospace";
		const infoW=140,infoH=22,infoX=W-infoW-16,infoY=16;
		c.fillStyle="rgba(7,10,18,.72)";c.beginPath();c.roundRect(infoX,infoY,infoW,infoH,8);c.fill();
		c.fillStyle = "rgba(255,255,255,0.6)";
		c.font = "11px monospace";
		c.fillText(`U = ${(u * 1e9).toFixed(3)} nJ`, infoX + 8, infoY + 15);
		if(this.showProbe){const p=new V(S.mouse.x,S.mouse.y),e=this.E(p),v=this.V(p);const probeW=310,probeH=68,probeX=W-probeW-16,probeY=16;c.fillStyle="rgba(7,10,18,.82)";c.beginPath();c.roundRect(probeX,probeY,probeW,probeH,8);c.fill();c.strokeStyle="rgba(103,232,249,.22)";c.stroke();c.fillStyle="#cbd5e1";c.font="10px monospace";c.fillText(`sonda: V=${v.toFixed(3)} V`,probeX+10,probeY+20);c.fillText(`E=−∇V=(${e.x.toExponential(2)}, ${e.y.toExponential(2)}) V/m`,probeX+10,probeY+36);c.fillText(`|E|=${e.len().toExponential(2)} V/m`,probeX+10,probeY+52)}
	}
	drawContours(c) {
		const step=14,cols=Math.ceil(W/step),rows=Math.ceil(H/step),values=[];for(let j=0;j<=rows;j++){values[j]=[];for(let i=0;i<=cols;i++)values[j][i]=this.V(new V(min(W,i*step),min(H,j*step)))}const levels=Array.from({length:this.levels*2+1},(_,i)=>(i-this.levels)*this.maxV/this.levels),cross=(x1,y1,v1,x2,y2,v2,L)=>{const t=(L-v1)/(v2-v1||1e-12);return{x:x1+(x2-x1)*t,y:y1+(y2-y1)*t}};for(const L of levels){c.beginPath();for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const x=i*step,y=j*step,x2=min(W,x+step),y2=min(H,y+step),v=[values[j][i],values[j][i+1],values[j+1][i+1],values[j+1][i]],p=[];if((v[0]-L)*(v[1]-L)<0)p.push(cross(x,y,v[0],x2,y,v[1],L));if((v[1]-L)*(v[2]-L)<0)p.push(cross(x2,y,v[1],x2,y2,v[2],L));if((v[2]-L)*(v[3]-L)<0)p.push(cross(x2,y2,v[2],x,y2,v[3],L));if((v[3]-L)*(v[0]-L)<0)p.push(cross(x,y2,v[3],x,y,v[0],L));for(let k=0;k+1<p.length;k+=2){c.moveTo(p[k].x,p[k].y);c.lineTo(p[k+1].x,p[k+1].y)}}c.strokeStyle=L===0?"rgba(226,232,240,.65)":"rgba(165,180,252,.28)";c.lineWidth=L===0?1.5:.8;c.stroke()}
	}
}
