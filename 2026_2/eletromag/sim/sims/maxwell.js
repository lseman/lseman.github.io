// ============================================================================
// SIM 6: MAXWELL EQUATIONS
// ============================================================================
import { Sim } from "../core/sim-base.js";
import { Charge } from "../core/sources.js";
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
} from "../core/math.js";
import { magColor } from "../core/colors.js";
import { W, H, S } from "../core/canvas.js";

export class MaxwellSim extends Sim {
	constructor() {
		super("Equações de Maxwell", "∿");
		this.charges = [];
		this.currents = [];
		this.time = 0;
		this.playing = true;
		this.mode = "all";
		this.NC = 5;
		this.NI = 3;
		this.dens = 16;
		this.initialized = false;
		this.hint = "Arraste cargas e correntes; Play/Pause controla o fluxo animado dos campos";
	}
	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">∿</span> ${this.name}</h3>
<div class="formula">∇·D=ρ &nbsp; ∇·B=0 &nbsp; ∇×E=−∂B/∂t &nbsp; ∇×H=J+∂D/∂t</div>
<div class="btn-row"><button class="btn primary" id="play">▶</button><button class="btn" id="pause">⏸</button><button class="btn danger" id="clr">Limpar</button></div>
<div class="control"><label>Modo</label><select id="mode"><option value="all">Todas</option><option value="gauss_e">Gauss (E)</option><option value="gauss_b">Gauss (B)</option><option value="faraday">Faraday</option><option value="ampere">Ampère-Maxwell</option></select></div>
<div class="control"><label>Cargas <span class="val" id="cV">5</span></label><input type="range" id="nc" min="0" max="15" value="5"></div>
<div class="control"><label>Correntes <span class="val" id="c2">3</span></label><input type="range" id="ni" min="0" max="8" value="3"></div>
<div class="control"><label>Densidade <span class="val" id="dV">16</span></label><input type="range" id="dens" min="8" max="28" value="16"></div>
<div class="legend"><span class="legend-item"><span class="legend-dot" style="background:#38bdf8"></span>∇·D=ρf</span><span class="legend-item"><span class="legend-dot" style="background:#818cf8"></span>∇·B=0</span><span class="legend-item"><span class="legend-dot" style="background:#f472b6"></span>∇×E=−∂B/∂t</span><span class="legend-item"><span class="legend-dot" style="background:#fbbf24"></span>∇×H=J+∂D/∂t</span></div>`;
		el.querySelector("#mode").value=this.mode;el.querySelector("#nc").value=String(this.NC);el.querySelector("#ni").value=String(this.NI);el.querySelector("#dens").value=String(this.dens);el.querySelector("#cV").textContent=String(this.NC);el.querySelector("#c2").textContent=String(this.NI);el.querySelector("#dV").textContent=String(this.dens);el.querySelector("#play").disabled=this.playing;el.querySelector("#pause").disabled=!this.playing;
		el.querySelector("#mode").onchange = (e) => (this.mode = e.target.value);
		el.querySelector("#play").onclick = () => {
			this.playing = true;
			el.querySelector("#play").disabled=true;el.querySelector("#pause").disabled=false;
		};
		el.querySelector("#pause").onclick = () => {
			this.playing = false;
			el.querySelector("#play").disabled=false;el.querySelector("#pause").disabled=true;
		};
		el.querySelector("#clr").onclick = () => {
			this.charges = [];
			this.currents = [];
			this.NC = 0;
			this.NI = 0;
			el.querySelector("#nc").value = 0;
			el.querySelector("#ni").value = 0;
			el.querySelector("#cV").textContent = "0";
			el.querySelector("#c2").textContent = "0";
		};
		el.querySelector("#nc").oninput = (e) => {
			this.NC = +e.target.value;
			el.querySelector("#cV").textContent = e.target.value;
			while (this.charges.length > this.NC) this.charges.pop();
			while (this.charges.length < this.NC) this.addRandomCharge();
		};
		el.querySelector("#ni").oninput = (e) => {
			this.NI = +e.target.value;
			el.querySelector("#c2").textContent = e.target.value;
			while (this.currents.length > this.NI) this.currents.pop();
			while (this.currents.length < this.NI) this.addRandomCurrent();
		};
		el.querySelector("#dens").oninput = (e) => {
			this.dens = +e.target.value;
			el.querySelector("#dV").textContent = e.target.value;
		};
		if (!this.initialized) {
			for (let i = 0; i < this.NC; i++) this.addRandomCharge();
			for (let i = 0; i < this.NI; i++) this.addRandomCurrent();
			this.initialized = true;
		}
	}
	addRandomCurrent() {
		const width=Number.isFinite(W)?W:800,height=Number.isFinite(H)?H:600;
		const x = 70 + Math.random() * max(1, width - 140), y=70+Math.random()*max(1,height-140);
		this.currents.push({
			t: "point", x, y,
			I: Math.random() > 0.5 ? 1 : -1,
		});
	}
	addRandomCharge() {
		const width=Number.isFinite(W)?W:800,height=Number.isFinite(H)?H:600;
		const positive = Math.random() > 0.5;
		this.charges.push(new Charge(
			50 + Math.random() * max(1, width - 100),
			50 + Math.random() * max(1, height - 100),
			1,
			positive,
		));
	}
	onMouseDown(x,y){
		this.sel=null;
		for(let i=this.charges.length-1;i>=0;i--){const ch=this.charges[i];if(ch.pos.distTo(new V(x,y))<22){this.sel={kind:"charge",value:ch};S.drag=this.sel;return}}
		for(let i=this.currents.length-1;i>=0;i--){const w=this.currents[i],wx=w.x??w.p1?.x,wy=w.y??H/2;if(sqrt((x-wx)**2+(y-wy)**2)<24){this.sel={kind:"current",value:w};S.drag=this.sel;return}}
	}
	onMouseMove(x,y){if(!S.drag)return;const item=S.drag.value;if(S.drag.kind==="charge")item.pos=new V(max(18,min(W-18,x)),max(18,min(H-18,y)));else{item.x=max(18,min(W-18,x));item.y=max(18,min(H-18,y));}}
	onMouseUp(){S.drag=null;}
	removeSelected(){if(!this.sel)return;if(this.sel.kind==="charge"){this.charges=this.charges.filter(x=>x!==this.sel.value);this.NC=this.charges.length}else{this.currents=this.currents.filter(x=>x!==this.sel.value);this.NI=this.currents.length}this.sel=null;}
	render(c, time) {
		if (W < 2 || H < 2) return;
		this.time += this.playing ? this.deltaTime(time) : 0;
		const dens = this.dens || 16, mode = this.mode;
		c.fillStyle = "#0a0e17";
		c.fillRect(0, 0, W, H);
		c.strokeStyle = "rgba(255,255,255,0.035)";c.lineWidth=1;for(let x=0;x<W;x+=40){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke()}for(let y=0;y<H;y+=40){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}
		const cellW=W/dens,cellH=H/dens,samples=[],osc=.72+.28*cos(this.time*1.2);
		for(let ci=0;ci<dens;ci++)for(let cj=0;cj<dens;cj++){
			const x=(ci+.5)*cellW,y=(cj+.5)*cellH;let ex=0,ey=0,bx=0,by=0;
			for(const ch of this.charges){const dx=x-ch.pos.x,dy=y-ch.pos.y,r2=max(180,dx*dx+dy*dy),r=sqrt(r2);ex+=ch.q*dx/(r2*r);ey+=ch.q*dy/(r2*r)}
			for(const w of this.currents){const wx=w.x??w.p1?.x??W/2,wy=w.y??H/2,dx=x-wx,dy=y-wy,r2=max(220,dx*dx+dy*dy),strength=w.I*osc;bx+=-strength*dy/r2;by+=strength*dx/r2}
			if(mode==="faraday"){const dx=x-W/2,dy=y-H/2,r2=max(900,dx*dx+dy*dy),dBdt=-sin(this.time*1.2);ex+=dBdt*dy/r2*.8;ey+=-dBdt*dx/r2*.8}
			samples.push({x,y,ci,cj,ex,ey,bx,by,me:sqrt(ex*ex+ey*ey),mb:sqrt(bx*bx+by*by)});
		}
		const maxE=max(1e-9,...samples.map(s=>s.me)),maxB=max(1e-9,...samples.map(s=>s.mb));
		const arrow=(x,y,vx,vy,len,color,alpha)=>{const m=sqrt(vx*vx+vy*vy);if(m<1e-12)return;const ux=vx/m,uy=vy/m,ex=x+ux*len,ey=y+uy*len;c.beginPath();c.moveTo(x-ux*len*.18,y-uy*len*.18);c.lineTo(ex,ey);c.lineTo(ex-ux*5-uy*3,ey-uy*5+ux*3);c.moveTo(ex,ey);c.lineTo(ex-ux*5+uy*3,ey-uy*5-ux*3);c.strokeStyle=color.replace("ALPHA",alpha.toFixed(2));c.lineWidth=1.25;c.stroke()};
		const showE=mode==="all"||mode==="gauss_e"||mode==="faraday",showB=mode==="all"||mode==="gauss_b"||mode==="ampere";
		for(const s of samples){if(showE&&s.me>1e-12){const n=s.me/maxE,len=6+18*sqrt(n);arrow(s.x,s.y,s.ex,s.ey,len,"rgba(56,189,248,ALPHA)",.34+.58*n);if((s.ci+s.cj)%5===0){const u=s.ex/s.me,v=s.ey/s.me,travel=((this.time*.7+s.ci*.13+s.cj*.07)%1+1)%1;c.beginPath();c.arc(s.x+u*len*travel,s.y+v*len*travel,2,0,2*PI);c.fillStyle="rgba(125,211,252,.9)";c.fill()}}if(showB&&s.mb>1e-12){const n=s.mb/maxB,len=6+17*sqrt(n);arrow(s.x,s.y,s.bx,s.by,len,"rgba(167,139,250,ALPHA)",.3+.58*n);if((s.ci*2+s.cj)%7===0){const u=s.bx/s.mb,v=s.by/s.mb,travel=((this.time*.55+s.ci*.09)%1+1)%1;c.beginPath();c.arc(s.x+u*len*travel,s.y+v*len*travel,2,0,2*PI);c.fillStyle="rgba(196,181,253,.9)";c.fill()}}}
		// Sources are drawn after the field so they never disappear behind it.
		for(const ch of this.charges){const selected=this.sel?.kind==="charge"&&this.sel.value===ch;if(this.playing){c.beginPath();c.arc(ch.pos.x,ch.pos.y,20+3*sin(this.time*2+ch.pos.x*.01),0,2*PI);c.strokeStyle=ch.q>0?"rgba(251,113,133,.25)":"rgba(56,189,248,.25)";c.stroke()}ch.draw(c,selected)}
		for(const w of this.currents){const x=w.x??w.p1?.x??W/2,y=w.y??H/2,selected=this.sel?.kind==="current"&&this.sel.value===w;if(this.playing){c.beginPath();c.arc(x,y,22+4*sin(this.time*1.8+x*.01),0,2*PI);c.strokeStyle="rgba(251,191,36,.28)";c.stroke()}c.beginPath();c.arc(x,y,15,0,2*PI);c.fillStyle="rgba(15,23,42,.95)";c.fill();c.strokeStyle=selected?"#67e8f9":"#fbbf24";c.lineWidth=selected?3:2;c.stroke();c.fillStyle="#fde68a";c.font="bold 18px sans-serif";c.textAlign="center";c.textBaseline="middle";c.fillText(w.I>=0?"•":"×",x,y-1)}c.textAlign="start";c.textBaseline="alphabetic";
		if(!this.charges.length&&!this.currents.length){c.fillStyle="rgba(148,163,184,.7)";c.font="13px sans-serif";c.textAlign="center";c.fillText("Adicione cargas ou correntes pela biblioteca",W/2,H/2);c.textAlign="start"}
		// Integral surfaces make each differential law visually identifiable.
		if(mode==="gauss_e"&&this.charges.length){const ch=this.charges[0];c.beginPath();c.arc(ch.pos.x,ch.pos.y,68,0,2*PI);c.setLineDash([7,5]);c.strokeStyle="rgba(52,211,153,.85)";c.lineWidth=2;c.stroke();c.setLineDash([])}
		if((mode==="gauss_b"||mode==="ampere")&&this.currents.length){const w=this.currents[0],x=w.x??W/2,y=w.y??H/2;c.beginPath();c.arc(x,y,72,0,2*PI);c.setLineDash([7,5]);c.strokeStyle="rgba(251,191,36,.8)";c.lineWidth=2;c.stroke();c.setLineDash([])}
		// Title
		const names = {
			all: "Maxwell: ∇·D=ρ | ∇·B=0 | ∇×E=−∂B/∂t | ∇×H=J+∂D/∂t",
			gauss_e: "∇·D = ρf",
			gauss_b: "∇·B = 0",
			faraday: "∇×E = −∂B/∂t",
			ampere: "∇×H = Jf + ∂D/∂t",
		};
		c.fillStyle = "rgba(255,255,255,0.5)";
		c.font = "11px monospace";
		c.fillText(names[mode] || mode, 10, 20);
		c.fillStyle=this.playing?"rgba(52,211,153,.8)":"rgba(251,191,36,.8)";
		const statusStr=this.playing?`▶ t=${this.time.toFixed(2)} s · fluxo de campo ativo`:`⏸ t=${this.time.toFixed(2)} s · campo congelado`;
		const metrics=c.measureText(statusStr);
		c.fillText(statusStr,W-metrics.width-16,28);
	}
}
