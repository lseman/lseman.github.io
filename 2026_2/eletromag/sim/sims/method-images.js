import { Sim } from "../core/sim-base.js";
import { PI, sqrt, max, min, abs, K_E } from "../core/math.js";
import { W, H } from "../core/canvas.js";

export class MethodImagesSim extends Sim {
	constructor(){super("Método das Imagens","◫");this.charge=5;this.height=12;this.probeX=18;this.probeY=10;this.showImage=true;this.showField=true;this.hint="A carga imagem reproduz V=0 no plano condutor aterrado"}
	buildControls(el){el.innerHTML=`<h3><span class="icon">◫</span> ${this.name}</h3><div class="formula">V = kq(1/R₊ − 1/R₋) &nbsp;|&nbsp; V(plano)=0</div><div class="learning-card"><strong>Experimento guiado · Método das imagens</strong>Substitua o condutor por uma carga imagem −q e verifique o potencial no plano.<em>A imagem é uma construção matemática; somente a região acima do condutor é física.</em></div>
<div class="control"><label>Carga q (nC) <span class="val" id="qV">5.0</span></label><input id="charge" type="range" min="-10" max="10" step="0.5" value="5"></div>
<div class="control"><label>Altura a (cm) <span class="val" id="hV">12</span></label><input id="height" type="range" min="3" max="30" value="12"></div>
<div class="control"><label>Sonda x (cm) <span class="val" id="pxV">18</span></label><input id="probeX" type="range" min="-35" max="35" value="18"></div>
<div class="control"><label>Sonda y (cm) <span class="val" id="pyV">10</span></label><input id="probeY" type="range" min="1" max="35" value="10"></div>
<div class="control"><label>Mostrar carga imagem</label><label class="toggle"><input id="showImage" type="checkbox" checked><span class="track"></span></label></div><div class="control"><label>Mostrar campo</label><label class="toggle"><input id="showField" type="checkbox" checked><span class="track"></span></label></div>
${this.measurementPanel("Solução por imagens",[["Carga imagem","—"],["Força sobre q","—"],["V na sonda","—"],["|E| na sonda","—"],["σ sob a carga","—"],["V no plano","0 V"]])}`;
		for(const [id,value] of [["charge",this.charge],["height",this.height],["probeX",this.probeX],["probeY",this.probeY]])el.querySelector(`#${id}`).value=String(value);for(const id of ["showImage","showField"])el.querySelector(`#${id}`).checked=this[id];
		for(const [id,label] of [["charge","qV"],["height","hV"],["probeX","pxV"],["probeY","pyV"]])el.querySelector(`#${id}`).oninput=e=>{this[id]=+e.target.value;el.querySelector(`#${label}`).textContent=id==="charge"?this[id].toFixed(1):String(this[id])};for(const id of ["showImage","showField"])el.querySelector(`#${id}`).onchange=e=>this[id]=e.target.checked;
	}
	field(x,y){const q=this.charge*1e-9,a=this.height/100;let ex=0,ey=0;for(const source of [{x:0,y:a,q},{x:0,y:-a,q:-q}]){const dx=x-source.x,dy=y-source.y,r=max(1e-5,sqrt(dx*dx+dy*dy)),f=K_E*source.q/(r*r*r);ex+=f*dx;ey+=f*dy}return {ex,ey,mag:sqrt(ex*ex+ey*ey)}}
	potential(x,y){const q=this.charge*1e-9,a=this.height/100,rp=max(1e-5,sqrt(x*x+(y-a)**2)),rm=max(1e-5,sqrt(x*x+(y+a)**2));return K_E*q*(1/rp-1/rm)}
	render(c){if(W<2||H<2)return;c.fillStyle="#080d17";c.fillRect(0,0,W,H);const baseY=H*.61,cx=W/2,ppm=min(900,W/.85),a=this.height/100,chargeY=baseY-a*ppm,imageY=baseY+a*ppm;
		if(this.showField){for(let sy=38;sy<baseY-18;sy+=42)for(let sx=30;sx<W;sx+=48){const f=this.field((sx-cx)/ppm,(baseY-sy)/ppm);if(f.mag<1e-9)continue;const ux=f.ex/f.mag,uy=-f.ey/f.mag,len=12;c.beginPath();c.moveTo(sx-ux*4,sy-uy*4);c.lineTo(sx+ux*len,sy+uy*len);c.strokeStyle="rgba(103,232,249,.45)";c.lineWidth=1;c.stroke()}}
		const g=c.createLinearGradient(0,baseY,0,H);g.addColorStop(0,"#64748b");g.addColorStop(1,"#1e293b");c.fillStyle=g;c.fillRect(0,baseY,W,H-baseY);c.strokeStyle="#cbd5e1";c.lineWidth=3;c.beginPath();c.moveTo(0,baseY);c.lineTo(W,baseY);c.stroke();c.fillStyle="#94a3b8";c.font="11px monospace";c.fillText("PLANO CONDUTOR ATERRADO · V = 0",18,baseY+22);
		this.drawCharge(c,cx,chargeY,this.charge,false);if(this.showImage)this.drawCharge(c,cx,imageY,-this.charge,true);c.setLineDash([5,5]);c.strokeStyle="rgba(148,163,184,.4)";c.beginPath();c.moveTo(cx,chargeY);c.lineTo(cx,imageY);c.stroke();c.setLineDash([]);
		const probe={x:cx+this.probeX/100*ppm,y:baseY-this.probeY/100*ppm};c.beginPath();c.arc(probe.x,probe.y,7,0,2*PI);c.fillStyle="#fbbf24";c.fill();c.fillStyle="#fde68a";c.fillText("SONDA",probe.x+10,probe.y+4);
		const f=this.field(this.probeX/100,this.probeY/100),V=this.potential(this.probeX/100,this.probeY/100),q=this.charge*1e-9,force=-(K_E*q*q)/(4*a*a),sigma=-(q)/(2*PI*a*a);this.updateMeasurements([`${(-this.charge).toFixed(1)} nC`,`${force.toExponential(3)} N (plano)`,`${V.toExponential(3)} V`,`${f.mag.toExponential(3)} V/m`,`${sigma.toExponential(3)} C/m²`,`0 V`]);
	}
	drawCharge(c,x,y,q,image){c.save();c.globalAlpha=image?.48:1;c.beginPath();c.arc(x,y,14,0,2*PI);c.fillStyle=q>=0?"#fb7185":"#38bdf8";c.fill();c.strokeStyle="#fff";c.stroke();c.fillStyle="#fff";c.font="bold 15px sans-serif";c.textAlign="center";c.textBaseline="middle";c.fillText(q>=0?"+":"−",x,y);c.font="9px monospace";c.fillText(image?"IMAGEM":"REAL",x,y-22);c.restore();c.textAlign="start";c.textBaseline="alphabetic"}
}
