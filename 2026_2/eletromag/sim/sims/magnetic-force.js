import { Sim } from "../core/sim-base.js";
import { PI, sin, cos, abs, min, max } from "../core/math.js";
import { W, H } from "../core/canvas.js";

const SPECIES = {
	electron: {label:"Elétron",q:-1.602176634e-19,m:9.1093837e-31,color:"#38bdf8"},
	proton: {label:"Próton",q:1.602176634e-19,m:1.6726219e-27,color:"#fb7185"},
};

export class MagneticForceSim extends Sim {
	constructor(){
		super("Força Magnética", "⊗");
		this.species="electron";this.field=1;this.fieldDirection=1;this.speed=2;this.scaleMode="didactic";this.time=0;this.playing=true;this.trail=true;
		this.hint="Compare o sentido da órbita e verifique r = mv⊥/(|q|B)";
	}
	buildControls(el){
		el.innerHTML=`<h3><span class="icon">⊗</span> ${this.name}</h3>
<div class="formula">F = q(v × B) <br> r = mv⊥/(|q|B)</div>
<div class="learning-card"><strong>Experimento guiado · Força de Lorentz</strong>Preveja como o raio e o sentido da órbita mudam ao inverter a carga ou aumentar B.<em>A força magnética muda a direção, mas não realiza trabalho.</em></div>
<div class="control"><label>Partícula</label><select id="species"><option value="electron">Elétron</option><option value="proton">Próton</option></select></div>
<div class="control"><label>Direção do campo B</label><div class="direction-picker" role="group" aria-label="Direção do campo magnético"><button type="button" data-direction="1"><i>⊙</i><span>Saindo<small>da tela</small></span></button><button type="button" data-direction="-1"><i>⊗</i><span>Entrando<small>na tela</small></span></button></div></div>
<div class="control"><label>Intensidade |B| (mT) <span class="val" id="bV">1.0</span></label><input id="B" type="range" min="0.1" max="5" step="0.1" value="1"></div>
<div class="control"><label>Velocidade (10⁶ m/s) <span class="val" id="vV">2.0</span></label><input id="speed" type="range" min="0.2" max="10" step="0.1" value="2"></div>
<div class="control"><label>Escala da órbita</label><select id="scaleMode"><option value="didactic">Didática — círculo fixo</option><option value="physical">Física — raio ∝ v/B</option></select></div>
<div class="physics-note" id="scaleNote"><strong>Modo didático:</strong><span>v e |B| controlam a animação</span><span>raio físico no painel</span></div>
<div class="control"><label>Mostrar trajetória</label><label class="toggle"><input type="checkbox" id="trail" checked><span class="track"></span></label></div>
<div class="btn-row"><button class="btn primary" id="play">⏸ Pausar</button><button class="btn" id="reset">↺ Lançar novamente</button></div>
${this.measurementPanel("Previsão analítica", [["Força |F|","—"],["Raio de Larmor","—"],["Freq. ciclotron","—"],["Período","—"],["Trabalho de B","0 J"]])}`;
		for(const [id,value] of [["species",this.species],["B",this.field],["speed",this.speed],["scaleMode",this.scaleMode]])el.querySelector(`#${id}`).value=String(value);
		const updateDirection=()=>el.querySelectorAll("[data-direction]").forEach(button=>{const selected=+button.dataset.direction===this.fieldDirection;button.classList.toggle("active",selected);button.setAttribute("aria-pressed",String(selected))});
		el.querySelectorAll("[data-direction]").forEach(button=>button.onclick=()=>{this.fieldDirection=+button.dataset.direction;this.time=0;updateDirection()});updateDirection();
		el.querySelector("#trail").checked=this.trail;
		el.querySelector("#species").onchange=e=>{this.species=e.target.value;this.time=0};
		el.querySelector("#B").oninput=e=>{this.field=+e.target.value;this.time=0;el.querySelector("#bV").textContent=this.field.toFixed(1)};
		el.querySelector("#speed").oninput=e=>{this.speed=+e.target.value;this.time=0;el.querySelector("#vV").textContent=this.speed.toFixed(1)};
		el.querySelector("#scaleMode").onchange=e=>{this.scaleMode=e.target.value;this.time=0;const note=el.querySelector("#scaleNote");note.innerHTML=this.scaleMode==="physical"?"<strong>Modo físico:</strong><span>r ∝ v/B</span><span>ωc independe de v</span>":"<strong>Modo didático:</strong><span>v e |B| controlam a animação</span><span>raio físico no painel</span>"};
		el.querySelector("#trail").onchange=e=>this.trail=e.target.checked;
		el.querySelector("#play").onclick=e=>{this.playing=!this.playing;e.currentTarget.textContent=this.playing?"⏸ Pausar":"▶ Animar"};
		el.querySelector("#reset").onclick=()=>{this.time=0;this.playing=true;el.querySelector("#play").textContent="⏸ Pausar"};
	}
	physics(){
		const p=SPECIES[this.species],B=this.field*this.fieldDirection*1e-3,v=this.speed*1e6,vp=v,force=abs(p.q)*vp*abs(B),omega=abs(p.q*B/p.m),radius=p.m*vp/(abs(p.q*B)),freq=omega/(2*PI),period=2*PI/omega;
		return {p,B,v,vp,force,omega,radius,freq,period,direction:Math.sign(p.q*B)||1};
	}
	render(c,now){
		if(W<2||H<2)return;const dt=this.deltaTime(now);if(this.playing)this.time+=dt;
		c.fillStyle="#080d17";c.fillRect(0,0,W,H);const centerX=W/2,centerY=H/2,s=this.physics(),limit=min(W*.31,H*.32),finite=Number.isFinite(s.radius)&&s.radius>1e-12;
		const referenceRadius=s.p.m*2e6/(abs(s.p.q)*1e-3);
		const rpx=this.scaleMode==="physical"?min(limit,max(34,limit*.62*Math.sqrt(s.radius/referenceRadius))):limit*.64;
		// Uniform field: dots are out of the screen; crosses are into it.
		c.fillStyle="rgba(129,140,248,.38)";c.font="13px monospace";for(let y=38;y<H-55;y+=48)for(let x=30;x<W;x+=52)c.fillText(s.B>=0?"⊙":"⊗",x,y);
		c.fillStyle="#a5b4fc";c.font="600 12px monospace";c.fillText(`B ${s.B>=0?"saindo ⊙":"entrando ⊗"} · ${abs(this.field).toFixed(1)} mT`,16,24);
		// Visual time is normalized so both electron and proton orbits remain observable;
		// the measurement panel retains the physical cyclotron frequency and period.
		const visualSpeed=this.scaleMode==="physical"?(.65+this.field*.55):(.45+this.speed*.22)*(.45+this.field*.35),phase=this.time*visualSpeed;
		if(finite){
			if(this.trail){c.beginPath();c.arc(centerX,centerY,rpx,0,2*PI);c.setLineDash([7,6]);c.strokeStyle="rgba(103,232,249,.35)";c.lineWidth=1.5;c.stroke();c.setLineDash([])}
			c.beginPath();c.arc(centerX,centerY,3,0,2*PI);c.fillStyle="rgba(103,232,249,.65)";c.fill();
			const x=centerX+rpx*sin(phase),y=centerY-s.direction*rpx*cos(phase);this.drawParticle(c,x,y,s.p);
			const tx=cos(phase),ty=s.direction*sin(phase),vArrow=34+this.speed*4;this.arrow(c,x,y,x+tx*vArrow,y+ty*vArrow,"#fbbf24","v");
			const fx=-sin(phase),fy=s.direction*cos(phase),forceArrow=28+this.field*5;this.arrow(c,x,y,x+fx*forceArrow,y+fy*forceArrow,"#34d399","F");
		}else{this.drawParticle(c,centerX,centerY,s.p);}
		this.updateMeasurements([`${s.force.toExponential(3)} N`,finite?`${s.radius.toExponential(3)} m`:"∞",`${s.freq.toExponential(3)} Hz`,Number.isFinite(s.period)?`${s.period.toExponential(3)} s`:"∞","0 J"]);
		c.fillStyle="#94a3b8";c.font="11px monospace";c.fillText(`${s.p.label} · amarelo: v · verde: F = qv×B · tempo visual normalizado`,16,H-70);
	}
	drawParticle(c,x,y,p){c.beginPath();c.arc(x,y,10,0,2*PI);c.fillStyle=p.color;c.shadowColor=p.color;c.shadowBlur=12;c.fill();c.shadowBlur=0;c.fillStyle="#fff";c.font="bold 13px sans-serif";c.textAlign="center";c.textBaseline="middle";c.fillText(p.q>0?"+":"−",x,y);c.textAlign="start";c.textBaseline="alphabetic"}
	arrow(c,x,y,ex,ey,color,label){const dx=ex-x,dy=ey-y,m=max(1,Math.hypot(dx,dy)),ux=dx/m,uy=dy/m;c.beginPath();c.moveTo(x,y);c.lineTo(ex,ey);c.lineTo(ex-ux*7-uy*4,ey-uy*7+ux*4);c.moveTo(ex,ey);c.lineTo(ex-ux*7+uy*4,ey-uy*7-ux*4);c.strokeStyle=color;c.lineWidth=2;c.stroke();c.fillStyle=color;c.font="bold 11px monospace";c.fillText(label,ex+5,ey-4)}
}
