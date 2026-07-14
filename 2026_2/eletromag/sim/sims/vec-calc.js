// ============================================================================
// SIM 0: VECTOR CALCULUS
// ============================================================================
import { Sim } from "../core/sim-base.js";
import { PI, sin, cos, sqrt, abs, min, max, floor, log } from "../core/math.js";
import { W, H, S } from "../core/canvas.js";

export class VecCalcSim extends Sim {
	constructor() {
		super("Cálculo Vetorial", "∇");
		this.mode = "grad";
		this.fldType = 0;
		this.arrowSz = 28;
		this.showScalar = true;
		this.gridDens = 18;
		this.scale = 34;
		this.showContours = true;
		this.showStreamlines = false;
		this.showTheorem = false;
		this.scalarCache = null;
		this.scalarCacheKey = "";
		this.hint = "Mova o cursor para inspecionar o campo";
	}
	fieldF(x, y) {
		if (this.fldType === 0) return { x, y };
		if (this.fldType === 1) return { x: -y, y: x };
		if(this.fldType===2){const s=Math.exp(-(x*x+y*y)/8);return{x:-x*s/4,y:-y*s/4}}
		if(this.fldType===3)return{x,y:-y};
		if(this.fldType===4)return{x:y,y:0};
		const r2=x*x+y*y+.3;return{x:-y/r2,y:x/r2};
	}
	gradF(x, y) {
		const h=.005;return{x:(this.scalarF(x+h,y)-this.scalarF(x-h,y))/(2*h),y:(this.scalarF(x,y+h)-this.scalarF(x,y-h))/(2*h)};
	}
	scalarF(x, y) {
		if (this.fldType === 0) return (x * x + y * y) / 2;
		if (this.fldType === 1) return x * y;
		if(this.fldType===2)return Math.exp(-(x*x+y*y)/8);
		if(this.fldType===3)return(x*x-y*y)/2;
		if(this.fldType===4)return sin(y);
		return .5*log(x*x+y*y+.3);
	}
	divF(x, y) {
		const h = .005,
			f1 = this.fieldF(x + h, y),
			f2 = this.fieldF(x - h, y),
			f3 = this.fieldF(x, y + h),
			f4 = this.fieldF(x, y - h);
		return (f1.x - f2.x + (f3.y - f4.y)) / (2 * h);
	}
	curlF(x, y) {
		const h = .005,
			f1 = this.fieldF(x + h, y),
			f2 = this.fieldF(x - h, y),
			f3 = this.fieldF(x, y + h),
			f4 = this.fieldF(x, y - h);
		return (f1.y - f2.y - (f3.x - f4.x)) / (2 * h);
	}
	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">∇</span> ${this.name}</h3>
<div class="formula" id="formula">∇f = (∂f/∂x, ∂f/∂y)</div>
<div class="control"><label>Operador</label><select id="mode"><option value="grad">Gradiente</option><option value="div">Divergente</option><option value="curl">Rotacional</option></select></div>
<div class="control"><label>Campo / função</label><select id="fld"><option value="0">Radial — f=r²/2; F=(x,y)</option><option value="1">Rotação — f=xy; F=(−y,x)</option><option value="2">Gaussiano — F=∇e^(−r²/8)</option><option value="3">Sela — f=(x²−y²)/2</option><option value="4">Cisalhamento — f=sen y; F=(y,0)</option><option value="5">Vórtice regularizado — F∝φ̂/r</option></select></div>
<div class="control"><label>Setas <span class="val" id="aV">28</span></label><input type="range" id="asize" min="10" max="50" value="28"></div>
<div class="control"><label>Mapa escalar</label><label class="toggle"><input type="checkbox" id="sc" checked><span class="track"></span></label></div>
<div class="control"><label>Curvas de nível</label><label class="toggle"><input type="checkbox" id="cont" checked><span class="track"></span></label></div>
<div class="control"><label>Linhas de fluxo</label><label class="toggle"><input type="checkbox" id="stream"><span class="track"></span></label></div>
<div class="control"><label>Teorema integral</label><label class="toggle"><input type="checkbox" id="theorem"><span class="track"></span></label></div>
<div class="control"><label>Escala <span class="val" id="zV">34 px/u</span></label><input type="range" id="scale" min="18" max="70" value="34"></div>
<div class="control"><label>Densidade <span class="val" id="dV">18</span></label><input type="range" id="dens" min="6" max="30" value="18"></div>
<div class="legend"><span class="legend-item"><span class="legend-dot" style="background:#38bdf8"></span>valor negativo</span><span class="legend-item"><span class="legend-dot" style="background:#e2e8f0"></span>próximo de zero</span><span class="legend-item"><span class="legend-dot" style="background:#fb7185"></span>valor positivo</span></div>`;
		el.querySelector("#mode").value = this.mode;
		el.querySelector("#fld").value = String(this.fldType);
		el.querySelector("#asize").value = String(this.arrowSz);
		el.querySelector("#aV").textContent = String(this.arrowSz);
		el.querySelector("#sc").checked = this.showScalar;
		el.querySelector("#cont").checked=this.showContours;el.querySelector("#stream").checked=this.showStreamlines;el.querySelector("#theorem").checked=this.showTheorem;el.querySelector("#scale").value=String(this.scale);el.querySelector("#zV").textContent=`${this.scale} px/u`;
		el.querySelector("#dens").value = String(this.gridDens);
		el.querySelector("#dV").textContent = String(this.gridDens);
		const formulas = {
			grad: "∇f = (∂f/∂x, ∂f/∂y)",
			div: "∇·F = ∂Fₓ/∂x + ∂Fᵧ/∂y",
			curl: "(∇×F)z = ∂Fᵧ/∂x − ∂Fₓ/∂y",
		};
		el.querySelector("#mode").onchange = (e) => {
			this.mode = e.target.value;
			el.querySelector("#formula").textContent = formulas[this.mode];
		};
		el.querySelector("#fld").onchange = (e) => (this.fldType = +e.target.value);
		el.querySelector("#asize").oninput = (e) => {
			this.arrowSz = +e.target.value;
			el.querySelector("#aV").textContent = e.target.value;
		};
		el.querySelector("#sc").onchange = (e) =>
			(this.showScalar = e.target.checked);
		el.querySelector("#cont").onchange=e=>this.showContours=e.target.checked;el.querySelector("#stream").onchange=e=>this.showStreamlines=e.target.checked;el.querySelector("#theorem").onchange=e=>this.showTheorem=e.target.checked;el.querySelector("#scale").oninput=e=>{this.scale=+e.target.value;el.querySelector("#zV").textContent=`${e.target.value} px/u`};
		el.querySelector("#dens").oninput = (e) => {
			this.gridDens = +e.target.value;
			el.querySelector("#dV").textContent = e.target.value;
		};
	}
	computeField(p) {
		const f = this.fieldF(p.x, p.y);
		return { ...f };
	}
	computeMag(p) {
		const f = this.computeField(p);
		return sqrt(f.x * f.x + f.y * f.y);
	}
	render(c, time) {
		if (W < 2 || H < 2) return;
		c.fillStyle = "#0a0e17";
		c.fillRect(0, 0, W, H);
		const mode = this.mode,
			dens = this.gridDens,
			arrowSz = this.arrowSz,scale=this.scale;
		if (this.showScalar) {
			const sample=3,key=`${floor(W)}:${floor(H)}:${mode}:${this.fldType}:${scale}`;
			if(!this.scalarCache||this.scalarCacheKey!==key){
				const sw=Math.ceil(W/sample),sh=Math.ceil(H/sample),tmp=document.createElement("canvas");tmp.width=sw;tmp.height=sh;
				const tc=tmp.getContext("2d"),img=tc.createImageData(sw,sh),d=img.data;
				const plasma=[[13,8,135],[126,3,168],[203,70,121],[248,148,65],[240,249,33]],balance=[[30,64,175],[38,154,210],[225,232,240],[244,114,106],[180,24,72]],palette=mode==="grad"?plasma:balance;
				for(let py=0;py<sh;py++)for(let px=0;px<sw;px++){
					const wx=(px*sample-W/2)/scale,wy=(H/2-py*sample)/scale,v=mode==="grad"?this.scalarF(wx,wy):mode==="div"?this.divF(wx,wy):this.curlF(wx,wy),t=.5+.5*Math.tanh(v/(mode==="grad"?30:3)),p=t*(palette.length-1),pi=min(palette.length-2,floor(p)),u=p-pi,a=palette[pi],b=palette[pi+1],i=(py*sw+px)*4;
					d[i]=a[0]+(b[0]-a[0])*u;d[i+1]=a[1]+(b[1]-a[1])*u;d[i+2]=a[2]+(b[2]-a[2])*u;d[i+3]=150;
				}
				tc.putImageData(img,0,0);this.scalarCache=tmp;this.scalarCacheKey=key;
			}
			c.imageSmoothingEnabled = true;
			c.drawImage(this.scalarCache, 0, 0, W, H);
			const shade=c.createRadialGradient(W/2,H/2,0,W/2,H/2,max(W,H)*.7);shade.addColorStop(.45,"rgba(7,10,18,0)");shade.addColorStop(1,"rgba(7,10,18,.42)");c.fillStyle=shade;c.fillRect(0,0,W,H);
		}
		// Cartesian grid and mathematical axes (positive y points upward).
		c.strokeStyle = "rgba(255,255,255,0.04)";
		c.lineWidth = 1;
		const step = scale;
		for (let x = W/2%step; x < W; x += step) {
			c.beginPath();
			c.moveTo(x, 0);
			c.lineTo(x, H);
			c.stroke();
		}
		for (let y = H/2%step; y < H; y += step) {
			c.beginPath();
			c.moveTo(0, y);
			c.lineTo(W, y);
			c.stroke();
		}
		c.strokeStyle="rgba(226,232,240,.2)";c.lineWidth=1.2;c.beginPath();c.moveTo(0,H/2);c.lineTo(W,H/2);c.moveTo(W/2,0);c.lineTo(W/2,H);c.stroke();
		c.fillStyle="rgba(203,213,225,.42)";c.font="9px monospace";c.fillText("x",W-14,H/2-7);c.fillText("y",W/2+7,12);
		// Scalar contours using marching-square edge intersections.
		if(this.showContours){const gs=22,cols=Math.ceil(W/gs),rows=Math.ceil(H/gs),vals=[];let lo=Infinity,hi=-Infinity;for(let j=0;j<=rows;j++){vals[j]=[];for(let i=0;i<=cols;i++){const x=min(W,i*gs),y=min(H,j*gs),wx=(x-W/2)/scale,wy=(H/2-y)/scale,v=this.scalarF(wx,wy);vals[j][i]=v;lo=min(lo,v);hi=max(hi,v)}}const levels=Array.from({length:10},(_,i)=>lo+(i+1)*(hi-lo)/11),cross=(x1,y1,v1,x2,y2,v2,L)=>{const u=(L-v1)/(v2-v1||1e-12);return{x:x1+(x2-x1)*u,y:y1+(y2-y1)*u}};c.strokeStyle="rgba(226,232,240,.24)";c.lineWidth=.8;c.beginPath();for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const x=i*gs,y=j*gs,x2=min(W,x+gs),y2=min(H,y+gs),v=[vals[j][i],vals[j][i+1],vals[j+1][i+1],vals[j+1][i]];for(const L of levels){const pts=[];if((v[0]-L)*(v[1]-L)<0)pts.push(cross(x,y,v[0],x2,y,v[1],L));if((v[1]-L)*(v[2]-L)<0)pts.push(cross(x2,y,v[1],x2,y2,v[2],L));if((v[2]-L)*(v[3]-L)<0)pts.push(cross(x2,y2,v[2],x,y2,v[3],L));if((v[3]-L)*(v[0]-L)<0)pts.push(cross(x,y2,v[3],x,y,v[0],L));for(let k=0;k+1<pts.length;k+=2){c.moveTo(pts[k].x,pts[k].y);c.lineTo(pts[k+1].x,pts[k+1].y)}}}c.stroke()}
		// Streamlines integrate the selected vector field in world coordinates using RK4.
		if(this.showStreamlines){const starts=[];for(let i=1;i<9;i++){starts.push({x:-W/(2*scale)+.2,y:(i/9-.5)*H/scale},{x:(i/9-.5)*W/scale,y:-H/(2*scale)+.2})}c.strokeStyle="rgba(94,234,212,.42)";c.lineWidth=1.1;for(const start of starts){let p={...start};c.beginPath();for(let k=0;k<300;k++){const sx=W/2+p.x*scale,sy=H/2-p.y*scale;if(k===0)c.moveTo(sx,sy);else c.lineTo(sx,sy);const f=this.fieldF(p.x,p.y),m=sqrt(f.x*f.x+f.y*f.y);if(m<1e-8||sx<0||sx>W||sy<0||sy>H)break;// RK4 integration
				const h=0.05;
				const k1x=f.x, k1y=f.y;
				const f2=this.fieldF(p.x+k1x*h*0.5, p.y+k1y*h*0.5), m2=sqrt(f2.x*f2.x+f2.y*f2.y);
				const k2x=m2>1e-8?f2.x/m2:0, k2y=m2>1e-8?f2.y/m2:0;
				const f3=this.fieldF(p.x+k2x*h*0.5, p.y+k2y*h*0.5), m3=sqrt(f3.x*f3.x+f3.y*f3.y);
				const k3x=m3>1e-8?f3.x/m3:0, k3y=m3>1e-8?f3.y/m3:0;
				const f4=this.fieldF(p.x+k3x*h, p.y+k3y*h), m4=sqrt(f4.x*f4.x+f4.y*f4.y);
				const k4x=m4>1e-8?f4.x/m4:0, k4y=m4>1e-8?f4.y/m4:0;
				p={x:p.x+(h/6)*(k1x+2*k2x+2*k3x+k4x), y:p.y+(h/6)*(k1y+2*k2y+2*k3y+k4y)}}c.stroke()}}
		// Vector arrows
		const cellW = W / dens,
			cellH = H / dens;
		for (let ci = 0; ci < dens; ci++)
			for (let cj = 0; cj < dens; cj++) {
				const cx = cellW * ci + cellW / 2,
					cy = cellH * cj + cellH / 2;
				const wx = (cx - W / 2) / scale,
					wy = (H / 2-cy) / scale;
					const f = mode === "grad" ? this.gradF(wx, wy) : this.fieldF(wx, wy),
					mag = sqrt(f.x * f.x + f.y * f.y);
				const operatorValue = mode === "div"
					? this.divF(wx, wy)
					: mode === "curl" ? this.curlF(wx, wy) : mag;
				if (mag < 1e-8) continue;
				// Normalize direction but retain magnitude through length and opacity.
				// A visible floor is essential because gradients are expressed in world units.
				const len = min(arrowSz, max(8, Math.log1p(mag) * arrowSz * 0.65)),
					dir = { x: f.x / mag, y: f.y / mag };
				const ex = cx + dir.x * len,
					ey = cy - dir.y * len,
					hs = min(5, len * 0.3);
				const screenDir={x:dir.x,y:-dir.y},perp = { x: -screenDir.y, y: screenDir.x };
				c.beginPath();
				c.moveTo(cx, cy);
				c.lineTo(ex, ey);
				if (mode === "div" || mode === "curl") {
					const strength = min(1, abs(operatorValue) / 2);
					c.strokeStyle = abs(operatorValue) < 0.03
						? "rgba(226,232,240,.72)"
						: operatorValue > 0
							? `rgba(251,113,133,${0.55 + strength * 0.4})`
							: `rgba(56,189,248,${0.55 + strength * 0.4})`;
				} else c.strokeStyle = `rgba(255,255,255,${min(0.95, max(0.45, mag * 3))})`;
				c.lineWidth = 1.5;
				c.stroke();
				c.beginPath();
				c.moveTo(ex, ey);
				c.lineTo(
					ex - screenDir.x * hs + perp.x * hs * 0.4,
					ey - screenDir.y * hs + perp.y * hs * 0.4,
				);
				c.lineTo(
					ex - screenDir.x * hs - perp.x * hs * 0.4,
					ey - screenDir.y * hs - perp.y * hs * 0.4,
				);
				c.closePath();
				c.fillStyle = c.strokeStyle;
				c.fill();
			}
		const names = {
			grad: "Gradiente ∇f",
			div: "Divergente ∇·F",
			curl: "Rotacional ∇×F",
		};
		c.fillStyle = "rgba(255,255,255,0.5)";
		c.font = "11px monospace";
		c.textAlign = "left";
		c.textBaseline = "alphabetic";
		c.fillText(names[mode] || mode, 10, 20);
		const px = 0,py = 0;
		const centerValue = mode === "div" ? this.divF(px, py) : mode === "curl" ? this.curlF(px, py) : this.scalarF(px, py);
		c.fillText(`valor no centro: ${centerValue.toFixed(3)}`, 10, 38);
		// Cursor probe reports all local differential quantities.
		const mx=max(0,min(W,S.mouse.x)),my=max(0,min(H,S.mouse.y)),wx=(mx-W/2)/scale,wy=(H/2-my)/scale,F=this.fieldF(wx,wy),G=this.gradF(wx,wy);c.strokeStyle="rgba(103,232,249,.55)";c.lineWidth=1;c.beginPath();c.arc(mx,my,5,0,2*PI);c.moveTo(mx-10,my);c.lineTo(mx-4,my);c.moveTo(mx+4,my);c.lineTo(mx+10,my);c.moveTo(mx,my-10);c.lineTo(mx,my-4);c.moveTo(mx,my+4);c.lineTo(mx,my+10);c.stroke();const probeW=320,probeH=80,probeX=W-probeW-16,probeY=60;c.fillStyle="rgba(7,10,18,.88)";c.beginPath();c.roundRect(probeX,probeY,probeW,probeH,10);c.fill();c.strokeStyle="rgba(103,232,249,.22)";c.stroke();c.fillStyle="#67e8f9";c.font="600 10px monospace";c.fillText(`SONDA  x ${wx.toFixed(2)}  y ${wy.toFixed(2)}`,probeX+10,probeY+18);c.fillStyle="#cbd5e1";c.font="10px monospace";c.fillText(`f ${this.scalarF(wx,wy).toFixed(3)}   ∇f (${G.x.toFixed(2)}, ${G.y.toFixed(2)})`,probeX+10,probeY+34);c.fillText(`F (${F.x.toFixed(2)}, ${F.y.toFixed(2)})   div ${this.divF(wx,wy).toFixed(2)}   rot ${this.curlF(wx,wy).toFixed(2)}`,probeX+10,probeY+50);
		if(this.showTheorem){const R=min(W,H)*.22/scale,n=160,dth=2*PI/n;let flux=0,circ=0;for(let i=0;i<n;i++){const a=(i+.5)*dth,x=R*cos(a),y=R*sin(a),f=this.fieldF(x,y);flux+=(f.x*cos(a)+f.y*sin(a))*R*dth;circ+=(-f.x*sin(a)+f.y*cos(a))*R*dth}const h=2*R/36;let idiv=0,icurl=0;for(let x=-R+h/2;x<R;x+=h)for(let y=-R+h/2;y<R;y+=h)if(x*x+y*y<=R*R){idiv+=this.divF(x,y)*h*h;icurl+=this.curlF(x,y)*h*h}c.beginPath();c.arc(W/2,H/2,R*scale,0,2*PI);c.setLineDash([7,5]);c.strokeStyle="rgba(52,211,153,.85)";c.lineWidth=2;c.stroke();c.setLineDash([]);const bw=330,bx=W-bw-14,by=150;c.fillStyle="rgba(7,10,18,.84)";c.fillRect(bx,by,bw,58);c.fillStyle="#6ee7b7";c.font="10px monospace";c.fillText(`Gauss: ∮F·n ds=${flux.toFixed(3)}  ∬div F dA=${idiv.toFixed(3)}`,bx+10,by+23);c.fillText(`Green: ∮F·dl=${circ.toFixed(3)}  ∬rot F dA=${icurl.toFixed(3)}`,bx+10,by+43)}
	}
}
