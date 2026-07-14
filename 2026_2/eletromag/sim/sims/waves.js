// ============================================================================
// SIM 7: EM WAVES
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
	EPS0, MU0, C0,
} from "../core/math.js";
import { magColor } from "../core/colors.js";
import { W, H } from "../core/canvas.js";

export class WaveSim extends Sim {
	constructor() {
		super("Ondas EM", "∿");
		this.time = 0;
		this.playing = true;
		this.polar = "linear";
		this.freq = 1;
		this.amp = 1;
		this.showB = true;
		this.showPoynting = false;
		this.mode = "propagation";
		this.hint = "Altere frequência, amplitude e polarização da onda";
	}
	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">∿</span> ${this.name}</h3>
<div class="formula">E(z,t) = E₀cos(kz−ωt+φ) &nbsp;|&nbsp; B = E/c</div>
<div class="btn-row"><button class="btn primary" id="play">▶</button><button class="btn" id="pause">⏸</button></div>
<div class="control"><label>Modo</label><select id="mode"><option value="propagation">Propagação</option><option value="polarization">Polarização</option><option value="energy">Energia</option></select></div>
<div class="control"><label>Frequência <span class="val" id="fV">1.0</span></label><input type="range" id="freq" min="0.2" max="3" step="0.1" value="1"></div>
<div class="control"><label>Amplitude <span class="val" id="aV">1.0</span></label><input type="range" id="amp" min="0.2" max="2" step="0.1" value="1"></div>
<div class="control"><label>Polarização</label><select id="pol"><option value="linear">Linear</option><option value="circular">Circular</option><option value="elliptical">Elíptica</option></select></div>
<div class="control"><label>Campo B</label><label class="toggle"><input type="checkbox" id="showB" checked><span class="track"></span></label></div>
<div class="control"><label>Vetor Poynting</label><label class="toggle"><input type="checkbox" id="poy"><span class="track"></span></label></div>`;
		el.querySelector("#mode").value = this.mode;
		el.querySelector("#freq").value = String(this.freq);
		el.querySelector("#fV").textContent = this.freq.toFixed(1);
		el.querySelector("#amp").value = String(this.amp);
		el.querySelector("#aV").textContent = this.amp.toFixed(1);
		el.querySelector("#pol").value = this.polar;
		el.querySelector("#showB").checked = this.showB;
		el.querySelector("#poy").checked = this.showPoynting;
		el.querySelector("#mode").onchange = (e) => (this.mode = e.target.value);
		el.querySelector("#play").onclick = () => {
			this.playing = true;
		};
		el.querySelector("#pause").onclick = () => {
			this.playing = false;
		};
		el.querySelector("#freq").oninput = (e) => {
			this.freq = +e.target.value;
			el.querySelector("#fV").textContent = e.target.value;
		};
		el.querySelector("#amp").oninput = (e) => {
			this.amp = +e.target.value;
			el.querySelector("#aV").textContent = e.target.value;
		};
		el.querySelector("#pol").onchange = (e) => (this.polar = e.target.value);
		el.querySelector("#showB").onchange = (e) =>
			(this.showB = e.target.checked);
		el.querySelector("#poy").onchange = (e) =>
			(this.showPoynting = e.target.checked);
	}
	render(c, time) {
		if (W < 2 || H < 2) return;
		this.time += this.playing ? this.deltaTime(time) : 0;
		c.fillStyle = "#0a0e17";
		c.fillRect(0, 0, W, H);
		const freq = this.freq,
			amp = this.amp,
			pol = this.polar;
		if (this.mode === "propagation") {
			// Perspective scene. Propagation is the depth axis; the two screen
			// transverse bases represent mutually orthogonal E and B directions.
			const near={x:W*.12,y:H*.72},far={x:W*.88,y:H*.28},dx=far.x-near.x,dy=far.y-near.y,dl=sqrt(dx*dx+dy*dy),depth={x:dx/dl,y:dy/dl};
			const eAxis={x:0,y:-1},bAxis={x:-depth.y,y:depth.x},base=t=>({x:near.x+dx*t,y:near.y+dy*t}),persp=t=>1-.38*t;
			const components=phase=>pol==="linear"?{a:sin(phase),b:0}:pol==="circular"?{a:sin(phase),b:cos(phase)}:{a:sin(phase),b:.5*cos(phase)};
			const point=(t,field)=>{const p=base(t),phase=2*PI*(freq*2.1*t-this.time),v=components(phase),scale=amp*min(74,H*.16)*persp(t);let a,b;if(field==="E"){a=v.a;b=v.b}else{a=-v.b*.72;b=v.a*.72}return{x:p.x+eAxis.x*a*scale+bAxis.x*b*scale,y:p.y+eAxis.y*a*scale+bAxis.y*b*scale};};
			// Depth grid creates a readable 3D reference frame.
			c.strokeStyle="rgba(148,163,184,.10)";c.lineWidth=1;
			for(let i=0;i<=12;i++){const t=i/12,p=base(t),w=105*persp(t);c.beginPath();c.moveTo(p.x-bAxis.x*w,p.y-bAxis.y*w);c.lineTo(p.x+bAxis.x*w,p.y+bAxis.y*w);c.stroke();}
			for(const side of [-1,1]){c.beginPath();for(let i=0;i<=40;i++){const t=i/40,p=base(t),w=105*persp(t),x=p.x+bAxis.x*w*side,y=p.y+bAxis.y*w*side;i?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();}
			// Propagation axis.
			c.beginPath();c.moveTo(near.x,near.y);c.lineTo(far.x,far.y);c.strokeStyle="rgba(226,232,240,.34)";c.lineWidth=1.4;c.stroke();
			const arrow=(x0,y0,x1,y1,color,width=1.4)=>{const vx=x1-x0,vy=y1-y0,m=max(1,sqrt(vx*vx+vy*vy)),ux=vx/m,uy=vy/m;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.lineTo(x1-ux*6-uy*3.5,y1-uy*6+ux*3.5);c.moveTo(x1,y1);c.lineTo(x1-ux*6+uy*3.5,y1-uy*6-ux*3.5);c.strokeStyle=color;c.lineWidth=width;c.stroke();};
			arrow(far.x-depth.x*25,far.y-depth.y*25,far.x,far.y,"rgba(52,211,153,.9)",2.4);
			// Wave curves and sampled field vectors anchor each value to the axis.
			for(const [field,color] of [["E","#fb7185"],["B","#818cf8"]]){if(field==="B"&&!this.showB)continue;c.beginPath();for(let i=0;i<=240;i++){const p=point(i/240,field);i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y)}c.strokeStyle=color;c.lineWidth=2.2;c.shadowColor=color;c.shadowBlur=7;c.stroke();c.shadowBlur=0;for(let i=0;i<=14;i++){const t=i/14,p=base(t),q=point(t,field);arrow(p.x,p.y,q.x,q.y,color,1.15);}}
			// Moving translucent wavefront plane.
			const front=((this.time*.24)%1+1)%1,fp=base(front),fw=105*persp(front),fh=min(75,H*.16)*persp(front);c.save();c.translate(fp.x,fp.y);c.transform(bAxis.x,bAxis.y,eAxis.x,eAxis.y,0,0);c.fillStyle="rgba(103,232,249,.045)";c.strokeStyle="rgba(103,232,249,.28)";c.lineWidth=1;c.fillRect(-fw,-fh,fw*2,fh*2);c.strokeRect(-fw,-fh,fw*2,fh*2);c.restore();
			c.font="600 11px monospace";c.fillStyle="#fda4af";c.fillText("E",near.x-8,near.y-min(78,H*.17));if(this.showB){c.fillStyle="#a5b4fc";c.fillText("B = E/c",near.x+bAxis.x*88,near.y+bAxis.y*88+15);}c.fillStyle="#6ee7b7";c.fillText("k, S = E × H",far.x-112,far.y-16);
			if(this.showPoynting){for(let i=2;i<11;i+=2){const p=base(i/12),q=base((i+.7)/12);arrow(p.x,p.y,q.x,q.y,"rgba(52,211,153,.72)",2);}}
		} else if (this.mode === "polarization") {
			// Polarization ellipse drawn as a tilted transverse plane with a
			// time-dependent E vector and a short helical history behind it.
			const cx=W*.52,cy=H*.5,rx=min(130,W*.18)*amp,ry=pol==="linear"?0:rx*(pol==="circular"?1:.5),skew=.48;c.save();c.translate(cx,cy);c.transform(1,skew,-.45,.78,0,0);c.beginPath();c.ellipse(0,0,rx,max(1,ry),0,0,2*PI);c.strokeStyle="rgba(103,232,249,.38)";c.lineWidth=1.2;c.stroke();c.restore();const phase=this.time*2*PI,ex=cos(phase)*rx,ey=sin(phase)*ry,px=cx+ex-.45*ey,py=cy+skew*ex+.78*ey;c.beginPath();c.moveTo(cx,cy);c.lineTo(px,py);c.strokeStyle="#fb7185";c.lineWidth=3;c.stroke();c.beginPath();c.arc(px,py,5,0,2*PI);c.fillStyle="#fecdd3";c.fill();c.fillStyle="#94a3b8";c.font="11px monospace";c.fillText(`Trajetória de E · ${pol}`,cx-rx,cy+max(80,ry)+45);
		} else if (this.mode === "energy") {
			// Energy density mode: u_E = u_B equality
			const e0 = this.amp;
			const b0 = e0 / C0;
			const uE = 0.5 * EPS0 * e0 * e0;
			const uB = (b0 * b0) / (2 * MU0);
			const total = uE + uB;
			const barW = 200,
				barH = 30;
			const ex = W / 2 - barW / 2,
				ey = H / 2 - barH / 2;
			// u_E bar
			c.fillStyle = "rgba(248,113,113,0.6)";
			c.fillRect(ex, ey, barW * (uE / total), barH);
			// u_B bar
			c.fillStyle = "rgba(129,140,248,0.6)";
			c.fillRect(ex + barW * (uE / total), ey, barW * (uB / total), barH);
			c.strokeStyle = "#fff";
			c.lineWidth = 1;
			c.strokeRect(ex, ey, barW, barH);
			c.fillStyle = "rgba(248,113,113,0.8)";
			c.font = "11px monospace";
			c.fillText(`u_E = ${uE.toExponential(2)} J/m³`, ex, ey - 5);
			c.fillStyle = "rgba(129,140,248,0.8)";
			c.fillText(`u_B = ${uB.toExponential(2)} J/m³`, ex + barW * (uE / total), ey - 5);
			// Energy density map visualization
			const mapW = 160, mapH = 100;
			const mapX = W - mapW - 20, mapY = 60;
			c.fillStyle = "rgba(7,10,18,.8)";
			c.beginPath();
			c.roundRect(mapX, mapY, mapW, mapH, 8);
			c.fill();
			c.strokeStyle = "rgba(148,163,184,.2)";
			c.stroke();
			c.fillStyle = "#94a3b8";
			c.font = "9px monospace";
			c.fillText("Densidade de Energia", mapX + 5, mapY + 14);
			// Draw u_E and u_B as stacked heatmap
			for (let x = 0; x < mapW; x++) {
				const t = this.time + (x / mapW) * 4 * PI * this.freq;
				const eVal = 0.5 * EPS0 * (e0 * cos(t)) ** 2;
				const bVal = (b0 * cos(t)) ** 2 / (2 * MU0);
				const uE_frac = eVal / (uE + 1e-15);
				const uB_frac = bVal / (uB + 1e-15);
				
				// u_E (red)
				const uEH = mapH * 0.45 * uE_frac;
				c.fillStyle = `rgba(248,113,113,${0.3 + 0.5 * uE_frac})`;
				c.fillRect(mapX + x, mapY + mapH - uEH, 1, uEH);
				// u_B (blue)
				const uBH = mapH * 0.45 * uB_frac;
				c.fillStyle = `rgba(129,140,248,${0.3 + 0.5 * uB_frac})`;
				c.fillRect(mapX + x, mapY + mapH * 0.45 - uBH, 1, uBH);
			}
			// Legend
			c.fillStyle = "rgba(248,113,113,0.7)";
			c.fillRect(mapX + 5, mapY + mapH - 12, 8, 8);
			c.fillStyle = "#cbd5e1";
			c.fillText("u_E", mapX + 17, mapY + mapH - 2);
			c.fillStyle = "rgba(129,140,248,0.7)";
			c.fillRect(mapX + 50, mapY + mapH - 12, 8, 8);
			c.fillStyle = "#cbd5e1";
			c.fillText("u_B", mapX + 62, mapY + mapH - 2);
		}
		c.fillStyle = "rgba(255,255,255,0.4)";
		c.font = "10px monospace";
		c.fillText(`f=${this.freq}Hz A=${this.amp}`, 10, 20);
	}
}
