// ============================================================================
// LAB 0: VECTOR CALCULUS — local derivatives and integral theorems in 2-D
// ============================================================================
import { Sim } from "../core/sim-base.js";
import { PI, sin, cos, sqrt, abs, min, max, floor, log } from "../core/math.js";
import { W, H, S } from "../core/canvas.js";

const EXP = Math.exp;
const FIELDS = [
	{
		name: "Fonte radial", scalar: "f=(x²+y²)/2", vector: "F=(x,y)",
		idea: "O gradiente aponta para fora; cada ponto se comporta como uma fonte.",
		f: (x, y) => (x*x+y*y)/2, F: (x, y) => ({x,y}),
		grad: (x,y) => ({x,y}), div: () => 2, curl: () => 0, lap: () => 2,
	},
	{
		name: "Rotação rígida", scalar: "f=xy", vector: "F=(−y,x)",
		idea: "O campo gira sem criar nem destruir fluxo: divergente zero, rotacional positivo.",
		f: (x,y) => x*y, F: (x,y) => ({x:-y,y:x}),
		grad: (x,y) => ({x:y,y:x}), div: () => 0, curl: () => 2, lap: () => 0,
	},
	{
		name: "Colina gaussiana", scalar: "f=e^(−r²/8)", vector: "F=∇f",
		idea: "O gradiente desce para fora da colina porque a altura diminui com o raio.",
		f: (x,y) => EXP(-(x*x+y*y)/8),
		F: (x,y) => {const s=EXP(-(x*x+y*y)/8);return{x:-x*s/4,y:-y*s/4}},
		grad: (x,y) => {const s=EXP(-(x*x+y*y)/8);return{x:-x*s/4,y:-y*s/4}},
		div: (x,y) => EXP(-(x*x+y*y)/8)*((x*x+y*y)/16-.5), curl: () => 0,
		lap: (x,y) => EXP(-(x*x+y*y)/8)*((x*x+y*y)/16-.5),
	},
	{
		name: "Ponto de sela", scalar: "f=(x²−y²)/2", vector: "F=(x,−y)",
		idea: "Há expansão em x e contração em y. Elas se cancelam no divergente.",
		f: (x,y) => (x*x-y*y)/2, F: (x,y) => ({x,y:-y}),
		grad: (x,y) => ({x,y:-y}), div: () => 0, curl: () => 0, lap: () => 0,
	},
	{
		name: "Cisalhamento", scalar: "f=sen(y)", vector: "F=(y,0)",
		idea: "Camadas vizinhas deslizam em velocidades diferentes, gerando rotação local.",
		f: (_x,y) => sin(y), F: (_x,y) => ({x:y,y:0}),
		grad: (_x,y) => ({x:0,y:cos(y)}), div: () => 0, curl: () => -1,
		lap: (_x,y) => -sin(y),
	},
	{
		name: "Vórtice regularizado", scalar: "f=½ ln(r²+0,3)", vector: "F=(−y,x)/(r²+0,3)",
		idea: "A circulação é visível; a regularização evita a singularidade na origem.",
		f: (x,y) => .5*log(x*x+y*y+.3),
		F: (x,y) => {const q=x*x+y*y+.3;return{x:-y/q,y:x/q}},
		grad: (x,y) => {const q=x*x+y*y+.3;return{x:x/q,y:y/q}}, div: () => 0,
		curl: (x,y) => .6/((x*x+y*y+.3)**2),
		lap: (x,y) => .6/((x*x+y*y+.3)**2),
	},
	{
		name: "Campo não uniforme", scalar: "f=x²y", vector: "F=(x²,−2xy)",
		idea: "Divergente e rotacional mudam no espaço: use a sonda para localizar os sinais.",
		f: (x,y) => x*x*y, F: (x,y) => ({x:x*x,y:-2*x*y}),
		grad: (x,y) => ({x:2*x*y,y:x*x}), div: (x,y) => 2*x-2*x, curl: (_x,y) => -2*y,
		lap: (_x,y) => 2*y,
	},
	{
		name: "Onda escalar", scalar: "f=sen(x)cos(y)", vector: "F=(cos x, sen y)",
		idea: "Compare o relevo periódico, suas inclinações e a curvatura dada pelo Laplaciano.",
		f: (x,y) => sin(x)*cos(y), F: (x,y) => ({x:cos(x),y:sin(y)}),
		grad: (x,y) => ({x:cos(x)*cos(y),y:-sin(x)*sin(y)}),
		div: (x,y) => -sin(x)+cos(y), curl: () => 0,
		lap: (x,y) => -2*sin(x)*cos(y),
	},
];

const MODES = {
	grad: {name:"Gradiente", symbol:"∇f", formula:"∇f = (∂f/∂x, ∂f/∂y)", question:"Para onde f cresce mais depressa?", map:"f", vector:"grad"},
	dir: {name:"Derivada direcional", symbol:"Dᵤf", formula:"Dᵤf = ∇f · û = |∇f| cos θ", question:"Qual é a inclinação na direção escolhida?", map:"dir", vector:"grad"},
	div: {name:"Divergente", symbol:"∇·F", formula:"∇·F = ∂Fₓ/∂x + ∂Fᵧ/∂y", question:"O ponto cria ou absorve fluxo?", map:"div", vector:"field"},
	curl: {name:"Rotacional", symbol:"(∇×F)z", formula:"(∇×F)z = ∂Fᵧ/∂x − ∂Fₓ/∂y", question:"Uma pequena hélice giraria aqui?", map:"curl", vector:"field"},
	lap: {name:"Laplaciano", symbol:"∇²f", formula:"∇²f = ∂²f/∂x² + ∂²f/∂y² = ∇·(∇f)", question:"O valor está acima ou abaixo da média local?", map:"lap", vector:"grad"},
};

export class VecCalcSim extends Sim {
	constructor() {
		super("Cálculo Vetorial", "∇");
		Object.assign(this,{mode:"grad",fldType:0,arrowSz:27,showScalar:true,gridDens:18,scale:38,
			showContours:true,showStreamlines:false,showTheorem:false,showStencil:false,direction:30,
			probe:{x:1.5,y:1},probePinned:false,scalarCache:null,scalarCacheKey:""});
		this.hint="Clique no campo para fixar a sonda · arraste para movê-la";
	}
	get field(){return FIELDS[this.fldType] || FIELDS[0]}
	fieldF(x,y){return this.field.F(x,y)}
	scalarF(x,y){return this.field.f(x,y)}
	gradF(x,y){return this.field.grad(x,y)}
	divF(x,y){return this.field.div(x,y)}
	curlF(x,y){return this.field.curl(x,y)}
	lapF(x,y){return this.field.lap(x,y)}
	directionUnit(){const a=this.direction*PI/180;return{x:cos(a),y:sin(a)}}
	directionalF(x,y){const g=this.gradF(x,y),u=this.directionUnit();return g.x*u.x+g.y*u.y}
	operatorValue(x,y){const key=MODES[this.mode].map;return key==="f"?this.scalarF(x,y):key==="dir"?this.directionalF(x,y):this[`${key}F`](x,y)}
	displayedVector(x,y){return MODES[this.mode].vector==="grad"?this.gradF(x,y):this.fieldF(x,y)}
	clearCache(){this.scalarCache=null;this.scalarCacheKey=""}

	buildControls(el) {
		const options=FIELDS.map((f,i)=>`<option value="${i}">${f.name} — ${f.vector}</option>`).join("");
		el.innerHTML=`<h3><span class="icon">∇</span> ${this.name}</h3>
		<div class="vec-progress" aria-label="Roteiro didático"><span>1 · escolha</span><span>2 · observe</span><span>3 · verifique</span></div>
		<div class="learning-card" id="concept"><strong>${MODES[this.mode].question}</strong><span>${this.field.idea}</span><em>${MODES[this.mode].formula}</em></div>
		<div class="control"><label for="mode">Operador a investigar</label><select id="mode">${Object.entries(MODES).map(([k,m])=>`<option value="${k}">${m.name} — ${m.symbol}</option>`).join("")}</select></div>
		<div class="formula" id="formula">${MODES[this.mode].formula}</div>
		<div class="control"><label for="fld">Exemplo matemático</label><select id="fld">${options}</select></div>
		<div class="field-definition" id="definition"><span>ESCALAR</span><code>${this.field.scalar}</code><span>VETORIAL</span><code>${this.field.vector}</code></div>
		<div class="control direction-control"><label>Direção û <span class="val" id="dirV">${this.direction}°</span></label><input type="range" id="direction" min="0" max="359" value="${this.direction}"></div>
		${this.measurementPanel("LEITURA NA SONDA",[["posição","—"],["f(x,y)","—"],["∇f","—"],["F(x,y)","—"],["div F / rot F","—"],["resultado ativo","—"]])}
		<details class="vec-display"><summary>Camadas de visualização</summary>
		<div class="control"><label>Mapa do resultado</label><label class="toggle"><input type="checkbox" id="sc" checked><span class="track"></span></label></div>
		<div class="control"><label>Curvas de nível de f</label><label class="toggle"><input type="checkbox" id="cont" checked><span class="track"></span></label></div>
		<div class="control"><label>Linhas de fluxo de F</label><label class="toggle"><input type="checkbox" id="stream"><span class="track"></span></label></div>
		<div class="control"><label>Vizinhança diferencial</label><label class="toggle"><input type="checkbox" id="stencil"><span class="track"></span></label></div>
		<div class="control"><label>Teoremas de Gauss e Green</label><label class="toggle"><input type="checkbox" id="theorem"><span class="track"></span></label></div>
		<div class="control"><label>Tamanho das setas <span class="val" id="aV">${this.arrowSz}</span></label><input type="range" id="asize" min="10" max="50" value="${this.arrowSz}"></div>
		<div class="control"><label>Escala <span class="val" id="zV">${this.scale} px/u</span></label><input type="range" id="scale" min="18" max="70" value="${this.scale}"></div>
		<div class="control"><label>Densidade <span class="val" id="dV">${this.gridDens}</span></label><input type="range" id="dens" min="6" max="30" value="${this.gridDens}"></div></details>
		<div class="legend"><span class="legend-item"><span class="legend-dot negative"></span>negativo</span><span class="legend-item"><span class="legend-dot neutral"></span>zero</span><span class="legend-item"><span class="legend-dot positive"></span>positivo</span></div>`;
		const q=s=>el.querySelector(s),refresh=()=>{q("#formula").textContent=MODES[this.mode].formula;q("#concept").innerHTML=`<strong>${MODES[this.mode].question}</strong><span>${this.field.idea}</span><em>${MODES[this.mode].formula}</em>`;q("#definition").innerHTML=`<span>ESCALAR</span><code>${this.field.scalar}</code><span>VETORIAL</span><code>${this.field.vector}</code>`;el.classList.toggle("direction-mode",this.mode==="dir");this.clearCache()};
		q("#mode").value=this.mode;q("#fld").value=String(this.fldType);q("#sc").checked=this.showScalar;q("#cont").checked=this.showContours;q("#stream").checked=this.showStreamlines;q("#stencil").checked=this.showStencil;q("#theorem").checked=this.showTheorem;el.classList.toggle("direction-mode",this.mode==="dir");
		q("#mode").onchange=e=>{this.mode=e.target.value;refresh()};q("#fld").onchange=e=>{this.fldType=+e.target.value;refresh()};
		q("#direction").oninput=e=>{this.direction=+e.target.value;q("#dirV").textContent=`${e.target.value}°`;this.clearCache()};
		[["#sc","showScalar"],["#cont","showContours"],["#stream","showStreamlines"],["#stencil","showStencil"],["#theorem","showTheorem"]].forEach(([id,key])=>q(id).onchange=e=>this[key]=e.target.checked);
		[["#asize","arrowSz","#aV",v=>v],["#scale","scale","#zV",v=>`${v} px/u`],["#dens","gridDens","#dV",v=>v]].forEach(([id,key,out,fmt])=>q(id).oninput=e=>{this[key]=+e.target.value;q(out).textContent=fmt(e.target.value);this.clearCache()});
		this.controls=el;
	}

	computeField(p){return this.fieldF(p.x,p.y)}
	computeMag(p){const f=this.computeField(p);return sqrt(f.x*f.x+f.y*f.y)}
	onMouseDown(x,y){this.probe={x:(x-W/2)/this.scale,y:(H/2-y)/this.scale};this.probePinned=true}
	onMouseMove(x,y){this.probe={x:(x-W/2)/this.scale,y:(H/2-y)/this.scale}}
	onMouseUp(){}

	drawArrow(c,x,y,v,color="#f8fafc",size=this.arrowSz){
		const mag=sqrt(v.x*v.x+v.y*v.y);if(mag<1e-9)return;const len=min(size,max(7,Math.log1p(mag)*size*.62)),dx=v.x/mag,dy=-v.y/mag,ex=x+dx*len,ey=y+dy*len,p={x:dy,y:-dx},hs=min(5,len*.3);
		c.strokeStyle=color;c.fillStyle=color;c.lineWidth=1.5;c.beginPath();c.moveTo(x,y);c.lineTo(ex,ey);c.stroke();c.beginPath();c.moveTo(ex,ey);c.lineTo(ex-dx*hs+p.x*hs*.45,ey-dy*hs+p.y*hs*.45);c.lineTo(ex-dx*hs-p.x*hs*.45,ey-dy*hs-p.y*hs*.45);c.closePath();c.fill();
	}

	render(c) {
		if(W<2||H<2)return;const scale=this.scale,mode=MODES[this.mode];c.fillStyle="#0a0e17";c.fillRect(0,0,W,H);
		if(this.showScalar)this.drawScalarMap(c,scale);
		this.drawGrid(c,scale);
		if(this.showContours)this.drawContours(c,scale);
		if(this.showStreamlines)this.drawStreamlines(c,scale);
		this.drawVectorField(c,scale);
		const mouseHasEntered=S.mouse.x>0||S.mouse.y>0;
		const live=this.probePinned||!mouseHasEntered?this.probe:{x:(max(0,min(W,S.mouse.x))-W/2)/scale,y:(H/2-max(0,min(H,S.mouse.y)))/scale};
		this.drawProbe(c,live,scale);
		if(this.showTheorem)this.drawTheorems(c,scale);
		c.fillStyle="rgba(255,255,255,.58)";c.font="11px monospace";c.textAlign="left";c.fillText(`${mode.name} · ${mode.symbol}`,12,20);c.fillStyle="rgba(203,213,225,.5)";c.fillText(mode.question,12,38);
	}

	drawScalarMap(c,scale){
		const sample=4,key=`${floor(W)}:${floor(H)}:${this.mode}:${this.fldType}:${scale}:${this.direction}`;
		if(!this.scalarCache||this.scalarCacheKey!==key){const sw=Math.ceil(W/sample),sh=Math.ceil(H/sample),tmp=document.createElement("canvas");tmp.width=sw;tmp.height=sh;const tc=tmp.getContext("2d"),img=tc.createImageData(sw,sh),d=img.data,vals=[];let vmax=1e-6;
			for(let py=0;py<sh;py++)for(let px=0;px<sw;px++){const v=this.operatorValue((px*sample-W/2)/scale,(H/2-py*sample)/scale);vals.push(v);vmax=max(vmax,abs(v))}
			for(let i=0;i<vals.length;i++){const v=vals[i],t=.5+.5*Math.tanh(v/(vmax*.38)),neg=[30,64,175],mid=[225,232,240],pos=[190,30,75],a=t<.5?neg:mid,b=t<.5?mid:pos,u=t<.5?t*2:(t-.5)*2,j=i*4;d[j]=a[0]+(b[0]-a[0])*u;d[j+1]=a[1]+(b[1]-a[1])*u;d[j+2]=a[2]+(b[2]-a[2])*u;d[j+3]=145}
			tc.putImageData(img,0,0);this.scalarCache=tmp;this.scalarCacheKey=key}
		c.imageSmoothingEnabled=true;c.drawImage(this.scalarCache,0,0,W,H);const shade=c.createRadialGradient(W/2,H/2,0,W/2,H/2,max(W,H)*.7);shade.addColorStop(.45,"rgba(7,10,18,0)");shade.addColorStop(1,"rgba(7,10,18,.42)");c.fillStyle=shade;c.fillRect(0,0,W,H);
	}
	drawGrid(c,scale){c.strokeStyle="rgba(255,255,255,.045)";c.lineWidth=1;for(let x=W/2%scale;x<W;x+=scale){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke()}for(let y=H/2%scale;y<H;y+=scale){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}c.strokeStyle="rgba(226,232,240,.25)";c.lineWidth=1.2;c.beginPath();c.moveTo(0,H/2);c.lineTo(W,H/2);c.moveTo(W/2,0);c.lineTo(W/2,H);c.stroke();c.fillStyle="rgba(203,213,225,.55)";c.font="10px monospace";c.fillText("x",W-14,H/2-8);c.fillText("y",W/2+8,13);for(let i=1;i*scale<W/2;i++){c.fillText(String(i),W/2+i*scale-3,H/2+14);c.fillText(String(-i),W/2-i*scale-6,H/2+14)}}
	drawContours(c,scale){const gs=25,cols=Math.ceil(W/gs),rows=Math.ceil(H/gs),v=[];let lo=Infinity,hi=-Infinity;for(let j=0;j<=rows;j++){v[j]=[];for(let i=0;i<=cols;i++){const z=this.scalarF((min(W,i*gs)-W/2)/scale,(H/2-min(H,j*gs))/scale);v[j][i]=z;lo=min(lo,z);hi=max(hi,z)}}if(hi-lo<1e-8)return;const levels=Array.from({length:9},(_,i)=>lo+(i+1)*(hi-lo)/10),cross=(x1,y1,a,x2,y2,b,L)=>{const u=(L-a)/(b-a||1e-12);return{x:x1+(x2-x1)*u,y:y1+(y2-y1)*u}};c.strokeStyle="rgba(255,255,255,.27)";c.lineWidth=.8;c.beginPath();for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const x=i*gs,y=j*gs,x2=min(W,x+gs),y2=min(H,y+gs),q=[v[j][i],v[j][i+1],v[j+1][i+1],v[j+1][i]];for(const L of levels){const p=[];if((q[0]-L)*(q[1]-L)<0)p.push(cross(x,y,q[0],x2,y,q[1],L));if((q[1]-L)*(q[2]-L)<0)p.push(cross(x2,y,q[1],x2,y2,q[2],L));if((q[2]-L)*(q[3]-L)<0)p.push(cross(x2,y2,q[2],x,y2,q[3],L));if((q[3]-L)*(q[0]-L)<0)p.push(cross(x,y2,q[3],x,y,q[0],L));for(let k=0;k+1<p.length;k+=2){c.moveTo(p[k].x,p[k].y);c.lineTo(p[k+1].x,p[k+1].y)}}}c.stroke()}
	drawVectorField(c,scale){const cw=W/this.gridDens,ch=H/this.gridDens;for(let i=0;i<this.gridDens;i++)for(let j=0;j<this.gridDens;j++){const x=cw*(i+.5),y=ch*(j+.5),wx=(x-W/2)/scale,wy=(H/2-y)/scale,v=this.displayedVector(wx,wy),z=this.operatorValue(wx,wy),strength=min(1,abs(z)/2),color=(this.mode==="grad")?`rgba(255,255,255,${.5+.4*min(1,sqrt(v.x*v.x+v.y*v.y))})`:abs(z)<.025?"rgba(226,232,240,.72)":z>0?`rgba(251,113,133,${.58+.35*strength})`:`rgba(56,189,248,${.58+.35*strength})`;this.drawArrow(c,x,y,v,color)}}
	drawStreamlines(c,scale){const starts=[];for(let i=1;i<9;i++)starts.push({x:-W/(2*scale)+.2,y:(i/9-.5)*H/scale},{x:(i/9-.5)*W/scale,y:-H/(2*scale)+.2});c.strokeStyle="rgba(94,234,212,.5)";c.lineWidth=1.15;for(const start of starts){let p={...start};c.beginPath();for(let k=0;k<320;k++){const sx=W/2+p.x*scale,sy=H/2-p.y*scale;if(k?c.lineTo(sx,sy):c.moveTo(sx,sy),sx<0||sx>W||sy<0||sy>H)break;const f=this.fieldF(p.x,p.y),m=sqrt(f.x*f.x+f.y*f.y);if(m<1e-8)break;p={x:p.x+f.x/m*.045,y:p.y+f.y/m*.045}}c.stroke()}}
	drawProbe(c,p,scale){const x=W/2+p.x*scale,y=H/2-p.y*scale,g=this.gradF(p.x,p.y),f=this.fieldF(p.x,p.y),u=this.directionUnit(),active=this.operatorValue(p.x,p.y);c.strokeStyle="#67e8f9";c.fillStyle="rgba(8,15,27,.8)";c.lineWidth=1.4;c.beginPath();c.arc(x,y,7,0,2*PI);c.fill();c.stroke();this.drawArrow(c,x,y,g,"#fbbf24",38);if(this.mode==="dir"){this.drawArrow(c,x,y,{x:u.x*1.4,y:u.y*1.4},"#6ee7b7",44);c.fillStyle="#6ee7b7";c.font="10px monospace";c.fillText("û",x+u.x*48,y-u.y*48)}if(this.showStencil){const d=.45*scale;c.setLineDash([3,3]);c.strokeStyle="rgba(255,255,255,.7)";c.beginPath();c.moveTo(x-d,y);c.lineTo(x+d,y);c.moveTo(x,y-d);c.lineTo(x,y+d);c.stroke();c.setLineDash([]);[[d,0,"f(x+h,y)"],[-d,0,"f(x−h,y)"],[0,-d,"f(x,y+h)"],[0,d,"f(x,y−h)"]].forEach(([dx,dy,t])=>{c.fillStyle="#e2e8f0";c.beginPath();c.arc(x+dx,y+dy,3,0,2*PI);c.fill();c.font="9px monospace";c.fillText(t,x+dx+5,y+dy-5)})}this.updateMeasurements([`(${p.x.toFixed(2)}, ${p.y.toFixed(2)})`,this.scalarF(p.x,p.y).toFixed(3),`(${g.x.toFixed(2)}, ${g.y.toFixed(2)}) · |∇f|=${sqrt(g.x*g.x+g.y*g.y).toFixed(2)}`,`(${f.x.toFixed(2)}, ${f.y.toFixed(2)})`,`div=${this.divF(p.x,p.y).toFixed(2)} · rot=${this.curlF(p.x,p.y).toFixed(2)}`,`${MODES[this.mode].symbol} = ${active.toFixed(3)}`])}
	drawTheorems(c,scale){const R=min(W,H)*.21/scale,n=240,da=2*PI/n;let flux=0,circ=0;for(let i=0;i<n;i++){const a=(i+.5)*da,f=this.fieldF(R*cos(a),R*sin(a));flux+=(f.x*cos(a)+f.y*sin(a))*R*da;circ+=(-f.x*sin(a)+f.y*cos(a))*R*da}const h=2*R/50;let idiv=0,icurl=0;for(let x=-R+h/2;x<R;x+=h)for(let y=-R+h/2;y<R;y+=h)if(x*x+y*y<=R*R){idiv+=this.divF(x,y)*h*h;icurl+=this.curlF(x,y)*h*h}c.beginPath();c.arc(W/2,H/2,R*scale,0,2*PI);c.setLineDash([7,5]);c.strokeStyle="rgba(52,211,153,.9)";c.lineWidth=2;c.stroke();c.setLineDash([]);const bw=min(410,W-30),bx=W-bw-15,by=54;c.fillStyle="rgba(7,10,18,.9)";c.beginPath();c.roundRect(bx,by,bw,78,10);c.fill();c.fillStyle="#6ee7b7";c.font="600 10px monospace";c.fillText("MESMA QUANTIDADE, DUAS FORMAS DE CALCULAR",bx+12,by+18);c.font="10px monospace";c.fillText(`Gauss: fluxo ${flux.toFixed(3)}  ↔  ∬ div F dA ${idiv.toFixed(3)}`,bx+12,by+40);c.fillText(`Green: circulação ${circ.toFixed(3)}  ↔  ∬ rot F dA ${icurl.toFixed(3)}`,bx+12,by+59)}
}
