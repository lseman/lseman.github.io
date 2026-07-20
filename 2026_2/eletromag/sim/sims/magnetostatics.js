import { Sim } from "../core/sim-base.js";
import { V, PI, sin, cos, sqrt, abs, min, max, MU0 } from "../core/math.js";
import { W, H, S } from "../core/canvas.js";

const PX_PER_METER = 1000;

export class MagnetStaticSim extends Sim {
	constructor() {
		super("Magnetostática", "🧲");
		this.sources = [];
		this.mode = "vectors";
		this.I = 2;
		this.dens = 18;
		this.showHeat = true;
		this.showLines = true;
		this.showProbe = true;
		this.ampereRadius=90;
		this.initialized = false;
		this.hint = "Selecione e arraste fontes; Delete remove a fonte selecionada";
	}
	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">🧲</span>${this.name}</h3>
<div class="formula" id="formula">B = μ₀I/(2πr) φ̂</div>
<div class="btn-row"><button class="btn primary" id="wire">⊙ Fio</button><button class="btn" id="loop">◯ Espira</button><button class="btn" id="sol">▱ Solenoide</button><button class="btn" id="reverse">⇄ Inverter I</button><button class="btn danger" id="del">Remover</button><button class="btn danger" id="clr">Limpar</button></div>
<div class="control"><label>Visualização</label><select id="mode"><option value="vectors">Vetores B</option><option value="magnitude">Magnitude |B|</option><option value="ampere">Lei de Ampère</option></select></div>
<div class="control"><label>Corrente <span class="val" id="iV">2.0 A</span></label><input type="range" id="I" min="-5" max="5" step="0.1" value="2"></div>
<div class="control"><label>Mapa de magnitude</label><label class="toggle"><input type="checkbox" id="heat" checked><span class="track"></span></label></div>
<div class="control"><label>Linhas de campo</label><label class="toggle"><input type="checkbox" id="lines" checked><span class="track"></span></label></div>
<div class="control"><label>Sonda vetorial</label><label class="toggle"><input type="checkbox" id="probe" checked><span class="track"></span></label></div>
<div class="control"><label>Raio de Ampère <span class="val" id="rV">90 px</span></label><input type="range" id="radius" min="35" max="220" value="90"></div>
<div class="control"><label>Densidade <span class="val" id="dV">18</span></label><input type="range" id="dens" min="8" max="30" value="18"></div>
<div class="legend"><span class="legend-item"><span class="legend-dot" style="background:#fbbf24"></span>corrente</span><span class="legend-item"><span class="legend-dot" style="background:#67e8f9"></span>campo B</span><span class="legend-item"><span class="legend-dot" style="background:#fb7185"></span>maior |B|</span></div>`;
		const formulas = {
			vectors:"B = μ₀I/(2πr) φ̂",
			magnitude:"<br>|B| em tesla",
			ampere:"∮ B·dl = μ₀ I_enc"
		};
		for (const [id, value] of [["mode",this.mode],["I",this.I],["dens",this.dens]]) el.querySelector(`#${id}`).value = String(value);
		el.querySelector("#iV").textContent = `${this.I.toFixed(1)} A`;
		el.querySelector("#dV").textContent = String(this.dens);
		el.querySelector("#heat").checked = this.showHeat;
		el.querySelector("#lines").checked=this.showLines;el.querySelector("#probe").checked=this.showProbe;el.querySelector("#radius").value=String(this.ampereRadius);el.querySelector("#rV").textContent=`${this.ampereRadius} px`;
		el.querySelector("#mode").onchange = (e) => { this.mode=e.target.value; el.querySelector("#formula").textContent=formulas[this.mode]; };
		el.querySelector("#wire").onclick = () => this.addWire();
		el.querySelector("#loop").onclick = () => this.addLoop();
		el.querySelector("#sol").onclick = () => this.addSolenoid();
		el.querySelector("#reverse").onclick=()=>{if(this.sel){this.sel.I*=-1;this.I=this.sel.I}else this.I*=-1;el.querySelector("#I").value=String(this.I);el.querySelector("#iV").textContent=`${this.I.toFixed(1)} A`};
		el.querySelector("#del").onclick = () => this.removeSelected();
		el.querySelector("#clr").onclick = () => { this.sources=[]; this.sel=null; this.initialized=true; };
		el.querySelector("#I").oninput = (e) => { this.I=+e.target.value;if(this.sel)this.sel.I=this.I;el.querySelector("#iV").textContent=`${this.I.toFixed(1)} A`; };
		el.querySelector("#heat").onchange = (e) => this.showHeat=e.target.checked;
		el.querySelector("#lines").onchange=e=>this.showLines=e.target.checked;el.querySelector("#probe").onchange=e=>this.showProbe=e.target.checked;el.querySelector("#radius").oninput=e=>{this.ampereRadius=+e.target.value;el.querySelector("#rV").textContent=`${e.target.value} px`};
		el.querySelector("#dens").oninput = (e) => { this.dens=+e.target.value; el.querySelector("#dV").textContent=e.target.value; };
		if (!this.initialized) { this.addWire(W/2,H/2); this.initialized=true; }
	}
	addWire(x=W/2+(Math.random()-.5)*180,y=H/2+(Math.random()-.5)*140) { this.sources.push({t:"wire",x,y,I:this.I}); }
	addLoop() { this.sources.push({t:"loop",x:W/2,y:H/2,r:58,I:this.I}); }
	addSolenoid() { this.sources.push({t:"solenoid",x:W/2,y:H/2,w:180,h:54,n:80,I:this.I}); }
	fieldFrom(source,p) {
		const dx=(p.x-source.x)/PX_PER_METER, dy=(p.y-source.y)/PX_PER_METER;
		const r=max(.012,sqrt(dx*dx+dy*dy));
		if (source.t === "wire") {
			const b=MU0*source.I/(2*PI*r);
			return new V((-dy/r)*b,(dx/r)*b);
		}
		if (source.t === "loop") {
			// Edge-on cross-section: the loop pierces the display plane as two
			// antiparallel wires at x ± r, giving the correct field topology
			// (through-center flux, closed lines around each conductor).
			const a=source.r/PX_PER_METER;let bx=0,by=0;
			for(const [off,sign] of [[-a,1],[a,-1]]){
				const wx=dx-off,rw=max(.006,sqrt(wx*wx+dy*dy)),b=MU0*source.I*sign/(2*PI*rw);
				bx+=(-dy/rw)*b;by+=(wx/rw)*b;
			}
			return new V(bx,by);
		}
		const halfW=source.w/(2*PX_PER_METER), halfH=source.h/(2*PX_PER_METER);
		if (abs(dx)<halfW && abs(dy)<halfH) return new V(MU0*(source.n/(source.w/PX_PER_METER))*source.I,0);
		const moment=source.n*source.I*(source.w/PX_PER_METER)*(source.h/PX_PER_METER);
		const dot=moment*dx/r, factor=MU0/(4*PI*r*r*r);
		return new V(factor*(3*(dot/r)*dx-moment),factor*(3*(dot/r)*dy));
	}
	B(p) { return this.sources.reduce((sum,s)=>sum.add(this.fieldFrom(s,p)),new V()); }
	onMouseDown(x,y) {
		this.sel=null;
		for (let i=this.sources.length-1;i>=0;i--) {
			const s=this.sources[i];
			if (sqrt((x-s.x)**2+(y-s.y)**2)<max(24,s.r||0)) { this.sel=s;this.I=s.I;const input=document.querySelector("#I"),label=document.querySelector("#iV");if(input)input.value=String(this.I);if(label)label.textContent=`${this.I.toFixed(1)} A`;S.drag=s;return; }
		}
	}
	onMouseMove(x,y) { if (S.drag) { S.drag.x=x; S.drag.y=y; } }
	onMouseUp() { S.drag=null; }
	removeSelected() { if (this.sel) this.sources=this.sources.filter(s=>s!==this.sel); this.sel=null; }
	drawArrow(c,x,y,v,scale=1) {
		const m=v.len(); if (m<1e-12) return;
		const u=v.norm(), len=min(22,max(7,(Math.log10(m*1e7+1))*8))*scale, ex=x+u.x*len, ey=y+u.y*len;
		c.beginPath(); c.moveTo(x-u.x*len*.25,y-u.y*len*.25); c.lineTo(ex,ey);
		c.lineTo(ex-u.x*5-u.y*3,ey-u.y*5+u.x*3); c.moveTo(ex,ey); c.lineTo(ex-u.x*5+u.y*3,ey-u.y*5-u.x*3);
		c.strokeStyle="rgba(103,232,249,.78)"; c.lineWidth=1.3; c.stroke();
	}
	render(c) {
		if (W<2||H<2) return;
		c.fillStyle="#070b14"; c.fillRect(0,0,W,H);
		const cw=W/this.dens,ch=H/this.dens;
		for(let i=0;i<this.dens;i++) for(let j=0;j<this.dens;j++) {
			const x=(i+.5)*cw,y=(j+.5)*ch,b=this.B(new V(x,y)),m=b.len();
			if(this.showHeat||this.mode==="magnitude") { const a=min(.42,Math.log10(m*1e8+1)*.07); c.fillStyle=`rgba(251,113,133,${a})`; c.fillRect(i*cw,j*ch,cw+1,ch+1); }
			if(this.mode!=="magnitude") this.drawArrow(c,x,y,b);
		}
		if(this.showLines&&this.mode!=="magnitude"){const seeds=[];for(const s of this.sources){const radius=s.t==="wire"?32:max(30,s.r||s.h||40);for(let i=0;i<10;i++){const a=2*PI*i/10;seeds.push(new V(s.x+radius*cos(a),s.y+radius*sin(a)))}}c.strokeStyle="rgba(103,232,249,.32)";c.lineWidth=1.1;for(const seed of seeds){let p=seed;c.beginPath();c.moveTo(p.x,p.y);for(let k=0;k<260;k++){const b=this.B(p),m=b.len();if(m<1e-12)break;p=p.add(b.mul(2.8/m));if(p.x<0||p.x>W||p.y<0||p.y>H)break;c.lineTo(p.x,p.y)}c.stroke()}}
		for(const s of this.sources) this.drawSource(c,s);
		if(this.mode==="ampere") {
			const acx=this.sel?.x??W/2,acy=this.sel?.y??H/2,R=this.ampereRadius;c.beginPath();c.arc(acx,acy,R,0,2*PI);c.setLineDash([7,5]);c.strokeStyle="rgba(52,211,153,.8)";c.lineWidth=2;c.stroke();c.setLineDash([]);
			const inside=(x,y)=>sqrt((x-acx)**2+(y-acy)**2)<R;
			const enclosed=this.sources.reduce((sum,s)=>{if(s.t==="wire")return sum+(inside(s.x,s.y)?s.I:0);if(s.t==="loop")return sum+(inside(s.x-s.r,s.y)?s.I:0)+(inside(s.x+s.r,s.y)?-s.I:0);return sum},0);let numerical=0,n=180;for(let i=0;i<n;i++){const a=(i+.5)*2*PI/n,p=new V(acx+R*cos(a),acy+R*sin(a)),tangent=new V(-sin(a),cos(a));numerical+=this.B(p).dot(tangent)*(R/PX_PER_METER)*2*PI/n}c.fillStyle="#6ee7b7";c.font="11px monospace";c.fillText(`I_enc = ${enclosed.toFixed(2)} A`,acx-R,acy-R-30);c.fillText(`∮B·dl num. = ${numerical.toExponential(2)} T·m`,acx-R,acy-R-15);c.fillText(`μ₀I_enc = ${(MU0*enclosed).toExponential(2)} T·m`,acx-R,acy+R+20);
		}
		const probe=this.B(S.mouse), microT=probe.len()*1e6;
		if(this.showProbe){const probeW=315,probeH=64,probeX=W-probeW-16,probeY=16;c.fillStyle="rgba(7,10,18,.82)";c.beginPath();c.roundRect(probeX,probeY,probeW,probeH,8);c.fill();c.strokeStyle="rgba(103,232,249,.22)";c.stroke();c.fillStyle="rgba(226,232,240,.8)";c.font="10px monospace";c.fillText(`sonda (${S.mouse.x.toFixed(0)}, ${S.mouse.y.toFixed(0)}) px`,probeX+10,probeY+20);c.fillText(`B=(${(probe.x*1e6).toFixed(3)}, ${(probe.y*1e6).toFixed(3)}) µT`,probeX+10,probeY+36);c.fillText(`|B|=${microT.toFixed(3)} µT`,probeX+10,probeY+52)}
		if(this.sel){const names={wire:"fio retilíneo",loop:"espira",solenoid:"solenoide"};c.fillStyle="rgba(251,191,36,.85)";c.font="10px monospace";c.fillText(`${names[this.sel.t]} selecionado · I=${this.sel.I.toFixed(2)} A`,12,22)}
	}
	drawSource(c,s) {
		const selected=s===this.sel;c.save();c.translate(s.x,s.y);
		if(s.t==="wire") { c.beginPath();c.arc(0,0,15,0,2*PI);c.fillStyle="#111827";c.fill();c.strokeStyle=selected?"#67e8f9":"#fbbf24";c.lineWidth=selected?3:2;c.stroke();c.fillStyle="#fbbf24";c.font="bold 18px sans-serif";c.textAlign="center";c.textBaseline="middle";c.fillText(s.I>=0?"•":"×",0,-1); }
		else if(s.t==="loop") { c.beginPath();c.ellipse(0,0,s.r,s.r*.35,0,0,2*PI);c.strokeStyle=selected?"#67e8f9":"#fbbf24";c.lineWidth=selected?4:2.5;c.stroke();for(const [off,out] of [[-s.r,s.I>=0],[s.r,s.I<0]]){c.beginPath();c.arc(off,0,8,0,2*PI);c.fillStyle="#111827";c.fill();c.strokeStyle="#fbbf24";c.lineWidth=1.5;c.stroke();c.fillStyle="#fde68a";c.font="bold 11px sans-serif";c.textAlign="center";c.textBaseline="middle";c.fillText(out?"•":"×",off,-1);}c.textAlign="start";c.textBaseline="alphabetic"; }
		else { c.strokeStyle=selected?"#67e8f9":"#fbbf24";c.lineWidth=2;c.strokeRect(-s.w/2,-s.h/2,s.w,s.h);for(let x=-s.w/2+8;x<s.w/2;x+=12){c.beginPath();c.ellipse(x,0,5,s.h/2,0,0,2*PI);c.stroke();} }
		c.restore();c.textAlign="start";c.textBaseline="alphabetic";
	}
}
