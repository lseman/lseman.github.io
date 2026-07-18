import { Sim } from "../core/sim-base.js";
import { PI, sin, cos, sqrt, abs, max, min, K_E, EPS0 } from "../core/math.js";
import { W, H } from "../core/canvas.js";

export class ContinuousChargeSim extends Sim {
	constructor(){super("Distribuições Contínuas","∫");this.geometry="rod";this.density=10;this.size=20;this.distance=12;this.elements=40;this.showElements=true;this.hint="Compare a integração de Coulomb com a solução analítica no eixo de simetria"}
	buildControls(el){el.innerHTML=`<h3><span class="icon">∫</span> ${this.name}</h3>
<div class="formula" id="formula">E = (1/4πε₀) ∫ dq R̂/R²</div>
<div class="learning-card"><strong>Experimento guiado · Distribuições de carga</strong>Preveja como E muda com a distância e aumente o número de elementos.<em>Observe a convergência da soma de Coulomb para a solução analítica.</em></div>
<div class="control"><label>Geometria</label><select id="geometry"><option value="rod">Haste finita</option><option value="ring">Anel carregado</option><option value="disk">Disco carregado</option></select></div>
<div class="control"><label><span id="densityLabel">Densidade λ (nC/m)</span><span class="val" id="densityV">10.0</span></label><input id="density" type="range" min="1" max="50" step="1" value="10"></div>
<div class="control"><label><span id="sizeLabel">Comprimento L (cm)</span><span class="val" id="sizeV">20</span></label><input id="size" type="range" min="5" max="50" value="20"></div>
<div class="control"><label>Distância axial a (cm) <span class="val" id="distanceV">12</span></label><input id="distance" type="range" min="2" max="50" value="12"></div>
<div class="control"><label>Elementos de integração <span class="val" id="elementsV">40</span></label><input id="elements" type="range" min="4" max="200" step="4" value="40"></div>
<div class="control"><label>Mostrar elementos dq</label><label class="toggle"><input type="checkbox" id="showElements" checked><span class="track"></span></label></div>
${this.measurementPanel("Integração × solução fechada", [["Carga total Q","—"],["E numérico","—"],["E analítico","—"],["Erro relativo","—"],["Convergência","—"]])}`;
		for(const [id,value] of [["geometry",this.geometry],["density",this.density],["size",this.size],["distance",this.distance],["elements",this.elements]])el.querySelector(`#${id}`).value=String(value);el.querySelector("#showElements").checked=this.showElements;
		const updateLabels=()=>{const surface=this.geometry==="disk";el.querySelector("#densityLabel").textContent=surface?"Densidade σ (nC/m²)":"Densidade λ (nC/m)";el.querySelector("#sizeLabel").textContent=this.geometry==="rod"?"Comprimento L (cm)":"Raio R (cm)";el.querySelector("#formula").textContent=this.geometry==="rod"?"E = kλL/[a√(a²+(L/2)²)]":this.geometry==="ring"?"E = kQz/(z²+R²)³ᐟ²":"E = σ/(2ε₀)[1−z/√(z²+R²)]"};updateLabels();
		el.querySelector("#geometry").onchange=e=>{this.geometry=e.target.value;updateLabels()};for(const id of ["density","size","distance","elements"]){el.querySelector(`#${id}`).oninput=e=>{this[id]=+e.target.value;el.querySelector(`#${id}V`).textContent=id==="density"?this[id].toFixed(1):String(this[id])}}el.querySelector("#showElements").onchange=e=>this.showElements=e.target.checked;
	}
	calculate(){
		const n=this.elements,a=this.distance/100,s=this.size/100;
		if(this.geometry==="rod"){const lambda=this.density*1e-9,L=s,dx=L/n;let numeric=0;for(let i=0;i<n;i++){const x=-L/2+(i+.5)*dx,r2=x*x+a*a;numeric+=K_E*lambda*dx*a/(r2*sqrt(r2))}const analytic=K_E*lambda*L/(a*sqrt(a*a+(L/2)**2));return {numeric,analytic,Q:lambda*L}}
		if(this.geometry==="ring"){const lambda=this.density*1e-9,R=s,Q=lambda*2*PI*R,dq=Q/n;let numeric=0;for(let i=0;i<n;i++){const theta=2*PI*(i+.5)/n,x=R*cos(theta),y=R*sin(theta),r2=x*x+y*y+a*a;numeric+=K_E*dq*a/(r2*sqrt(r2))}const analytic=K_E*Q*a/(a*a+R*R)**1.5;return {numeric,analytic,Q}}
		const sigma=this.density*1e-9,R=s,dr=R/n;let numeric=0;for(let i=0;i<n;i++){const r=(i+.5)*dr,dq=sigma*2*PI*r*dr,r2=r*r+a*a;numeric+=K_E*dq*a/(r2*sqrt(r2))}const analytic=sigma/(2*EPS0)*(1-a/sqrt(a*a+R*R));return {numeric,analytic,Q:sigma*PI*R*R};
	}
	render(c){
		if(W<2||H<2)return;c.fillStyle="#080d17";c.fillRect(0,0,W,H);const result=this.calculate(),cx=W*.48,baseY=H*.64,span=min(W*.58,460),radius=min(W*.2,H*.22,165),probeY=max(105,baseY-min(230,55+this.distance*3.2));
		c.strokeStyle="rgba(148,163,184,.25)";c.setLineDash([5,5]);c.beginPath();c.moveTo(cx,baseY);c.lineTo(cx,probeY);c.stroke();c.setLineDash([]);
		if(this.geometry==="rod"){c.beginPath();c.moveTo(cx-span/2,baseY);c.lineTo(cx+span/2,baseY);c.strokeStyle="#fb7185";c.lineWidth=7;c.stroke();if(this.showElements)for(let i=0;i<this.elements;i++){const x=cx-span/2+(i+.5)*span/this.elements;c.beginPath();c.arc(x,baseY,2,0,2*PI);c.fillStyle="#fecdd3";c.fill()}}
		else{const ry=radius*.32;if(this.geometry==="disk"){c.beginPath();c.ellipse(cx,baseY,radius,ry,0,0,2*PI);c.fillStyle="rgba(251,113,133,.18)";c.fill()}c.beginPath();c.ellipse(cx,baseY,radius,ry,0,0,2*PI);c.strokeStyle="#fb7185";c.lineWidth=this.geometry==="ring"?6:2;c.stroke();if(this.showElements){const count=min(this.elements,80);for(let i=0;i<count;i++){const theta=2*PI*i/count,rr=this.geometry==="disk"?radius*sqrt((i+.5)/count):radius;c.beginPath();c.arc(cx+rr*cos(theta),baseY+rr*.32*sin(theta),2,0,2*PI);c.fillStyle="#fecdd3";c.fill()}}}
		c.beginPath();c.arc(cx,probeY,9,0,2*PI);c.fillStyle="#67e8f9";c.shadowColor="#67e8f9";c.shadowBlur=14;c.fill();c.shadowBlur=0;c.fillStyle="#cffafe";c.font="11px monospace";c.fillText("P",cx+14,probeY+4);this.arrow(c,cx,probeY,cx,probeY-58,"#fbbf24","E");
		const error=abs(result.analytic)>1e-20?abs(result.numeric-result.analytic)/abs(result.analytic)*100:0;this.updateMeasurements([`${(result.Q*1e9).toFixed(3)} nC`,`${result.numeric.toExponential(4)} V/m`,`${result.analytic.toExponential(4)} V/m`,`${error.toFixed(3)}%`,`${this.elements} elementos dq`]);
		c.fillStyle="rgba(7,10,18,.82)";c.beginPath();c.roundRect(16,16,285,62,9);c.fill();c.fillStyle="#cbd5e1";c.font="11px monospace";c.fillText(`a = ${this.distance} cm · ${this.elements} elementos`,28,39);c.fillStyle="#94a3b8";c.fillText(`erro numérico = ${error.toFixed(3)}%`,28,59);
	}
	arrow(c,x,y,ex,ey,color,label){const dx=ex-x,dy=ey-y,m=max(1,Math.hypot(dx,dy)),ux=dx/m,uy=dy/m;c.beginPath();c.moveTo(x,y);c.lineTo(ex,ey);c.lineTo(ex-ux*7-uy*4,ey-uy*7+ux*4);c.moveTo(ex,ey);c.lineTo(ex-ux*7+uy*4,ey-uy*7-ux*4);c.strokeStyle=color;c.lineWidth=2;c.stroke();c.fillStyle=color;c.font="bold 11px monospace";c.fillText(label,ex+7,ey)}
}
