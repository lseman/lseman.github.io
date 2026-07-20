import { Sim } from "../core/sim-base.js";
import { PI, sin, cos, sqrt, max, min } from "../core/math.js";
import { W, H } from "../core/canvas.js";

export class CoordinateSystemsSim extends Sim {
	constructor(){super("Sistemas de Coordenadas","⌖");this.system="cartesian";this.x=3;this.y=2;this.z=2;this.showBasis=true;this.yaw=-.65;this.pitch=.48;this.dragCamera=false;this.lastPointer=null;this.hint="Arraste para girar a cena 3D · transforme o ponto entre os três sistemas"}
	buildControls(el){
		el.innerHTML=`<h3><span class="icon">⌖</span> ${this.name}</h3>
<div class="formula">x = ρ cosφ &nbsp; y = ρ sinφ <br> r² = x²+y²+z²</div>
<div class="learning-card"><strong>Experimento guiado · Coordenadas</strong>Mova o ponto e preveja quais coordenadas mudam em cada sistema.<em>Observe que os vetores unitários cilíndricos e esféricos dependem da posição.</em></div>
<div class="control"><label>Sistema em destaque</label><select id="system"><option value="cartesian">Cartesiano (x, y, z)</option><option value="cylindrical">Cilíndrico (ρ, φ, z)</option><option value="spherical">Esférico (r, θ, φ)</option></select></div>
<div class="control"><label><span id="coord0Label">x</span><span class="val" id="coord0V">3.0</span></label><input id="coord0" type="range" min="-5" max="5" step="0.1" value="3"></div>
<div class="control"><label><span id="coord1Label">y</span><span class="val" id="coord1V">2.0</span></label><input id="coord1" type="range" min="-5" max="5" step="0.1" value="2"></div>
<div class="control"><label><span id="coord2Label">z</span><span class="val" id="coord2V">2.0</span></label><input id="coord2" type="range" min="-5" max="5" step="0.1" value="2"></div>
<div class="control"><label>Vetores unitários locais</label><label class="toggle"><input type="checkbox" id="basis" checked><span class="track"></span></label></div>
<div class="btn-row"><button class="btn" id="resetCamera">⌖ Restaurar câmera</button></div>
${this.measurementPanel("Mesmo ponto, três descrições", [["Cartesiano","—"],["Cilíndrico","—"],["Esférico","—"],["dV cartesiano","dx dy dz"],["dV cilíndrico","ρ dρ dφ dz"],["dV esférico","r² sinθ dr dθ dφ"]])}`;
		el.querySelector("#system").value=this.system;el.querySelector("#basis").checked=this.showBasis;
		el.querySelector("#system").onchange=e=>{this.system=e.target.value;this.configureCoordinateControls(el)};el.querySelector("#basis").onchange=e=>this.showBasis=e.target.checked;
		el.querySelector("#resetCamera").onclick=()=>{this.yaw=-.65;this.pitch=.48};
		for(let i=0;i<3;i++)el.querySelector(`#coord${i}`).oninput=()=>this.applyCoordinateControls(el);
		this.configureCoordinateControls(el);
	}
	coordinates(){const rho=sqrt(this.x*this.x+this.y*this.y),r=sqrt(rho*rho+this.z*this.z),phi=Math.atan2(this.y,this.x),theta=r>1e-12?Math.acos(this.z/r):0;return {rho,r,phi,theta}}
	configureCoordinateControls(el){
		const q=this.coordinates(),deg=180/PI,configs={cartesian:[{label:"x",min:-5,max:5,value:this.x,suffix:""},{label:"y",min:-5,max:5,value:this.y,suffix:""},{label:"z",min:-5,max:5,value:this.z,suffix:""}],cylindrical:[{label:"ρ",min:0,max:7.1,value:q.rho,suffix:""},{label:"φ",min:-180,max:180,value:q.phi*deg,suffix:"°"},{label:"z",min:-5,max:5,value:this.z,suffix:""}],spherical:[{label:"r",min:0,max:8.7,value:q.r,suffix:""},{label:"θ",min:0,max:180,value:q.theta*deg,suffix:"°"},{label:"φ",min:-180,max:180,value:q.phi*deg,suffix:"°"}]};
		configs[this.system].forEach((config,i)=>{const input=el.querySelector(`#coord${i}`);input.min=String(config.min);input.max=String(config.max);input.step="0.1";input.value=String(config.value);input.dataset.suffix=config.suffix;el.querySelector(`#coord${i}Label`).textContent=config.label;el.querySelector(`#coord${i}V`).textContent=`${config.value.toFixed(1)}${config.suffix}`});
	}
	applyCoordinateControls(el){
		const values=[0,1,2].map(i=>+el.querySelector(`#coord${i}`).value),rad=PI/180;
		if(this.system==="cartesian")[this.x,this.y,this.z]=values;
		else if(this.system==="cylindrical"){const [rho,phi,z]=values;this.x=rho*cos(phi*rad);this.y=rho*sin(phi*rad);this.z=z}
		else{const [r,theta,phi]=values;this.x=r*sin(theta*rad)*cos(phi*rad);this.y=r*sin(theta*rad)*sin(phi*rad);this.z=r*cos(theta*rad)}
		values.forEach((value,i)=>{const input=el.querySelector(`#coord${i}`);el.querySelector(`#coord${i}V`).textContent=`${value.toFixed(1)}${input.dataset.suffix||""}`});
	}
	project(x,y,z,scale,cx,cy){
		const cyaw=cos(this.yaw),syaw=sin(this.yaw),cp=cos(this.pitch),sp=sin(this.pitch),xr=cyaw*x-syaw*y,yr=syaw*x+cyaw*y,screenY=z*cp-yr*sp,depth=yr*cp+z*sp,perspective=11/(11-depth*.12);
		return {x:cx+scale*xr*perspective,y:cy-scale*screenY*perspective,depth,perspective};
	}
	onMouseDown(x,y){this.dragCamera=true;this.lastPointer={x,y}}
	onMouseMove(x,y){if(!this.dragCamera||!this.lastPointer)return;const dx=x-this.lastPointer.x,dy=y-this.lastPointer.y;this.yaw+=dx*.008;this.pitch=max(-1.2,min(1.2,this.pitch-dy*.008));this.lastPointer={x,y}}
	onMouseUp(){this.dragCamera=false;this.lastPointer=null}
	arrow(c,a,b,color,label){const dx=b.x-a.x,dy=b.y-a.y,m=max(1,Math.hypot(dx,dy)),ux=dx/m,uy=dy/m;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(b.x-ux*7-uy*4,b.y-uy*7+ux*4);c.moveTo(b.x,b.y);c.lineTo(b.x-ux*7+uy*4,b.y-uy*7-ux*4);c.strokeStyle=color;c.lineWidth=2;c.stroke();c.fillStyle=color;c.font="600 11px monospace";c.fillText(label,b.x+5,b.y-4)}
	render(c){
		if(W<2||H<2)return;c.fillStyle="#080d17";c.fillRect(0,0,W,H);const cx=W/2,cy=H/2,scale=min(W,H)*.067,q=this.coordinates(),origin=this.project(0,0,0,scale,cx,cy),point=this.project(this.x,this.y,this.z,scale,cx,cy);
		// Rotating xy grid provides depth and orientation cues.
		c.lineWidth=1;for(let i=-5;i<=5;i++){for(const segment of [[[-5,i,0],[5,i,0]],[[i,-5,0],[i,5,0]]]){const a=this.project(...segment[0],scale,cx,cy),b=this.project(...segment[1],scale,cx,cy);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.strokeStyle=i===0?"rgba(148,163,184,.2)":"rgba(148,163,184,.07)";c.stroke()}}
		const axes=[[[ -5,0,0],[5,0,0],"#fb7185","x"],[[0,-5,0],[0,5,0],"#34d399","y"],[[0,0,-5],[0,0,5],"#818cf8","z"]];for(const [a,b,color,label] of axes){const pa=this.project(...a,scale,cx,cy),pb=this.project(...b,scale,cx,cy);c.beginPath();c.moveTo(pa.x,pa.y);c.lineTo(pb.x,pb.y);c.strokeStyle=color;c.lineWidth=1.3;c.stroke();c.fillStyle=color;c.font="bold 12px monospace";c.fillText(label,pb.x+5,pb.y)}
		// Projection onto the xy plane makes rho and z geometrically explicit.
		const floor=this.project(this.x,this.y,0,scale,cx,cy);c.setLineDash([5,5]);c.strokeStyle="rgba(148,163,184,.4)";c.beginPath();c.moveTo(point.x,point.y);c.lineTo(floor.x,floor.y);c.lineTo(origin.x,origin.y);c.stroke();c.setLineDash([]);this.arrow(c,origin,point,"#fbbf24","r");
		c.beginPath();c.arc(point.x,point.y,8*point.perspective,0,2*PI);c.fillStyle="#f8fafc";c.shadowColor="#67e8f9";c.shadowBlur=14;c.fill();c.shadowBlur=0;
		if(this.showBasis){let basis;if(this.system==="cartesian")basis=[[[1,0,0],"x̂","#fb7185"],[[0,1,0],"ŷ","#34d399"],[[0,0,1],"ẑ","#818cf8"]];else if(this.system==="cylindrical")basis=[[[cos(q.phi),sin(q.phi),0],"ρ̂","#fb7185"],[[-sin(q.phi),cos(q.phi),0],"φ̂","#34d399"],[[0,0,1],"ẑ","#818cf8"]];else basis=[[[sin(q.theta)*cos(q.phi),sin(q.theta)*sin(q.phi),cos(q.theta)],"r̂","#fb7185"],[[cos(q.theta)*cos(q.phi),cos(q.theta)*sin(q.phi),-sin(q.theta)],"θ̂","#34d399"],[[-sin(q.phi),cos(q.phi),0],"φ̂","#818cf8"]];for(const [v,label,color] of basis){const end=this.project(this.x+v[0]*1.3,this.y+v[1]*1.3,this.z+v[2]*1.3,scale,cx,cy);this.arrow(c,point,end,color,label)}}
		const deg=a=>a*180/PI;this.updateMeasurements([`(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)})`,`(${q.rho.toFixed(2)}, ${deg(q.phi).toFixed(1)}°, ${this.z.toFixed(2)})`,`(${q.r.toFixed(2)}, ${deg(q.theta).toFixed(1)}°, ${deg(q.phi).toFixed(1)}°)`,`dx dy dz`,`ρ dρ dφ dz`,`r² sinθ dr dθ dφ`]);
		c.fillStyle="rgba(7,10,18,.82)";c.beginPath();c.roundRect(16,16,260,66,9);c.fill();c.fillStyle="#cbd5e1";c.font="11px monospace";c.fillText(`P = (${this.x.toFixed(1)}, ${this.y.toFixed(1)}, ${this.z.toFixed(1)})`,28,38);c.fillStyle="#94a3b8";c.fillText(`ρ=${q.rho.toFixed(2)}  r=${q.r.toFixed(2)}`,28,57);c.fillText(`φ=${deg(q.phi).toFixed(1)}°  θ=${deg(q.theta).toFixed(1)}°`,28,73);
		c.fillStyle="rgba(7,10,18,.76)";c.beginPath();c.roundRect(W-210,16,194,34,9);c.fill();c.fillStyle="#94a3b8";c.font="10px monospace";c.fillText("ARRASTE PARA ORBITAR A CÂMERA",W-199,37);
	}
}
