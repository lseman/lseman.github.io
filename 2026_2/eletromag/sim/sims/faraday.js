// ============================================================================
// SIM 5: FARADAY / INDUCTION
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
} from "../core/math.js";
import { magColor } from "../core/colors.js";
import { W, H, S } from "../core/canvas.js";

export class FaradaySim extends Sim {
	constructor() {
		super("Faraday / Indução", "⚡");
		this.coilPos = 0;
		this.flux = 0;
		this.time = 0;
		this.dragCoil = false;
		this.fieldB = 1;
		this.speed = 1;
		this.showFlux = true;
		this.showEMF = true;
		this.playing = false;
		this.turns = 5;
		this.history = [];
		this._historyClock = 0;
		this.hint = "Arraste a bobina e anime sua rotação no campo magnético";
	}
	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">⚡</span> ${this.name}</h3>
<div class="formula">ε = −N·dΦ/dt, &nbsp; Φ = B·A·cos θ</div>
<div class="learning-card"><strong>Experimento guiado · Lei de Faraday</strong>Preveja quando Φ é máximo e quando |ε| é máximo durante uma volta.<em>Compare as curvas: fluxo e fem devem estar defasados de 90°.</em></div>
<div class="control"><label>Campo B (T) <span class="val" id="bV">1.0</span></label><input type="range" id="B" min="0.1" max="3" step="0.1" value="1"></div>
<div class="control"><label>Velocidade angular ω <span class="val" id="sV">2.0 rad/s</span></label><input type="range" id="spd" min="0.2" max="6" step="0.1" value="2"></div>
<div class="control"><label>Número de voltas <span class="val" id="nV">5</span></label><input type="range" id="n" min="1" max="20" value="5"></div>
<div class="control"><label>Mostrar fluxo</label><label class="toggle"><input type="checkbox" id="flux" checked><span class="track"></span></label></div>
<div class="control"><label>Mostrar EMF</label><label class="toggle"><input type="checkbox" id="emf" checked><span class="track"></span></label></div>
<div class="btn-row"><button class="btn primary" id="play">▶ Animar</button><button class="btn" id="reset">↺ Reset</button></div>
<div class="stat-grid" id="stats"><div class="stat"><div class="num" id="fVal">0</div><div class="lbl">NΦ (Wb·volta)</div></div><div class="stat"><div class="num" id="eVal">0</div><div class="lbl">ε (V)</div></div></div>
${this.measurementPanel("Previsão analítica", [["Fluxo máximo NΦ₀","—"],["FEM máxima ε₀","—"],["Fase Φ → ε","90°"],["Lei de Lenz","opõe ΔΦ"]])}`;
		el.querySelector("#B").value = String(this.fieldB);
		el.querySelector("#bV").textContent = this.fieldB.toFixed(1);
		el.querySelector("#spd").value = String(this.speed * 2);
		el.querySelector("#sV").textContent = `${(this.speed * 2).toFixed(1)} rad/s`;
		el.querySelector("#n").value = String(this.turns);
		el.querySelector("#nV").textContent = String(this.turns);
		el.querySelector("#flux").checked = this.showFlux;
		el.querySelector("#emf").checked = this.showEMF;
		el.querySelector("#play").textContent = this.playing ? "⏸ Pausar" : "▶ Animar";
		el.querySelector("#B").oninput = (e) => {
			this.fieldB = +e.target.value;
			el.querySelector("#bV").textContent = (+e.target.value).toFixed(1);
		};
		el.querySelector("#spd").oninput = (e) => {
			this.speed = +e.target.value / 2;
			el.querySelector("#sV").textContent = `${(+e.target.value).toFixed(1)} rad/s`;
		};
		el.querySelector("#n").oninput = (e) => {
			this.turns = +e.target.value;
			el.querySelector("#nV").textContent = e.target.value;
		};
		el.querySelector("#flux").onchange = (e) =>
			(this.showFlux = e.target.checked);
		el.querySelector("#emf").onchange = (e) =>
			(this.showEMF = e.target.checked);
		el.querySelector("#play").onclick = () => {
			this.playing = !this.playing;
			el.querySelector("#play").textContent = this.playing ? "⏸ Pausar" : "▶ Animar";
		};
		el.querySelector("#reset").onclick = () => {
			this.time = 0;
			this.playing = false;
			this.history = [];
			this._historyClock = 0;
			el.querySelector("#play").textContent = "▶ Animar";
		};
	}
	render(c, time) {
		if (W < 2 || H < 2) return;
		const dt = this.deltaTime(time);
		if (this.playing) this.time += dt;
		c.fillStyle = "#0a0e17";
		c.fillRect(0, 0, W, H);
		const N = this.turns, bx = this.coilPos, cy = H * .46;
		const coilW = min(150, max(90, W * .16)), coilH = min(210, max(130, H * .34));
		const area = (coilW / 1000) * (coilH / 1000), omega = 2 * this.speed;
		const theta = this.time * omega, projection = cos(theta);
		const flux = this.fieldB * area * projection;
		const linkage = N * flux;
		const emf = N * this.fieldB * area * omega * sin(theta);
		const emfPeak = max(1e-12, N * this.fieldB * area * omega);
		this.updateMeasurements([`${(N*this.fieldB*area).toExponential(3)} Wb·volta`,`${emfPeak.toExponential(3)} V`,`90°`,`opõe ΔΦ`]);
		// Uniform B field represented by a regular arrow lattice.
		if (this.showFlux) {
			const drift=this.playing?(this.time*18)%70:0;
			c.strokeStyle = "rgba(129,140,248,0.3)"; c.lineWidth = 1;
			for (let y = 38; y < H - 42; y += 48) for (let x = 24; x < W; x += 70) {
				const ax=(x+drift)%W;c.beginPath();c.moveTo(ax,y);c.lineTo(ax+26,y);c.lineTo(ax+20,y-4);c.moveTo(ax+26,y);c.lineTo(ax+20,y+4);c.stroke();
			}
			const bg=c.createLinearGradient(0,0,W,0);bg.addColorStop(0,"rgba(99,102,241,.07)");bg.addColorStop(.5,"rgba(56,189,248,.025)");bg.addColorStop(1,"rgba(99,102,241,.07)");c.fillStyle=bg;c.fillRect(0,0,W,H);
			c.fillStyle = "rgba(165,180,252,.9)";c.font = "600 12px sans-serif";c.fillText(`CAMPO UNIFORME  B = ${this.fieldB.toFixed(1)} T  →`, 18, 25);
		}
		// Orthographic projection of a rectangular N-turn coil rotating about y.
		const halfProjected=max(3,abs(projection)*coilW/2), direction=projection>=0?1:-1;
		c.save();c.translate(bx,cy);c.shadowColor="rgba(251,191,36,.28)";c.shadowBlur=12;
		c.fillStyle=`rgba(52,211,153,${.04+.16*abs(projection)})`;c.fillRect(-halfProjected,-coilH/2,halfProjected*2,coilH);
		for(let turn=0;turn<N;turn++){
			const inset=(turn-(N-1)/2)*min(2.2,12/max(1,N)),hw=max(2,halfProjected+inset);
			c.beginPath();c.rect(-hw,-coilH/2+inset,hw*2,coilH-2*inset);c.strokeStyle=turn===floor(N/2)?"#fde68a":"rgba(251,191,36,.72)";c.lineWidth=turn===floor(N/2)?2.5:1;c.stroke();
		}
		// Moving carriers indicate the Lenz-law current direction.
		if(this.playing&&abs(emf/emfPeak)>.03){const phase=((this.time*1.8*direction*Math.sign(emf))%1+1)%1;for(let k=0;k<8;k++){const u=(phase+k/8)%1;let x,y;if(u<.25){x=-halfProjected+u*4*halfProjected*2;y=-coilH/2}else if(u<.5){x=halfProjected;y=-coilH/2+(u-.25)*4*coilH}else if(u<.75){x=halfProjected-(u-.5)*4*halfProjected*2;y=coilH/2}else{x=-halfProjected;y=coilH/2-(u-.75)*4*coilH}c.beginPath();c.arc(x,y,2.3,0,2*PI);c.fillStyle="#fef3c7";c.fill();}}
		// Surface normal n rotates with the coil and makes Φ=B·A explicit.
		c.shadowBlur=0;const nx=cos(theta),ny=-sin(theta),nl=58;c.beginPath();c.moveTo(0,0);c.lineTo(nx*nl,ny*nl);c.lineTo(nx*nl-nx*7+ny*4,ny*nl-ny*7-nx*4);c.moveTo(nx*nl,ny*nl);c.lineTo(nx*nl-nx*7-ny*4,ny*nl-ny*7+nx*4);c.strokeStyle="#67e8f9";c.lineWidth=2;c.stroke();c.fillStyle="#a5f3fc";c.font="11px monospace";c.fillText("n̂",nx*nl+5,ny*nl-4);
		const phase=((theta%(2*PI))+2*PI)%(2*PI),arcR=34;c.beginPath();c.arc(0,0,arcR,0,-phase,phase>PI);c.strokeStyle="rgba(103,232,249,.42)";c.lineWidth=1;c.stroke();c.fillStyle="rgba(165,243,252,.8)";c.fillText(`θ ${(phase*180/PI).toFixed(0)}°`,arcR+5,-8);c.restore();
		// Center-zero EMF meter.
		if (this.showEMF) {
			const meterY=cy+coilH/2+22,meterW=132;c.fillStyle="rgba(15,23,42,.88)";c.beginPath();c.roundRect(bx-meterW/2,meterY-11,meterW,22,7);c.fill();c.fillStyle="rgba(148,163,184,.5)";c.fillRect(bx-1,meterY-12,2,24);c.fillStyle=emf>=0?"rgba(52,211,153,.95)":"rgba(251,113,133,.95)";const ew=(emf/emfPeak)*(meterW/2-5);c.fillRect(ew<0?bx+ew:bx,meterY-6,abs(ew),12);c.fillStyle="#cbd5e1";c.font="10px monospace";c.textAlign="center";c.fillText(`ε = ${emf.toExponential(2)} V`,bx,meterY+27);c.fillStyle=abs(emf/emfPeak)<.03?"#94a3b8":"#fde68a";c.fillText(abs(emf/emfPeak)<.03?"corrente ≈ 0":`corrente induzida ${emf>0?"↻":"↺"}`,bx,meterY+42);c.textAlign="start";
		}
		// Scrolling normalized waveform: flux linkage and induced EMF are 90° apart.
		if(this.playing){this._historyClock+=dt;while(this._historyClock>=1/30){this._historyClock-=1/30;this.history.push({f:projection,e:emf/emfPeak});if(this.history.length>240)this.history.shift();}}
		if(this.showEMF){const gw=min(340,W*.42),gh=126,gx=W-gw-16,gy=86;c.fillStyle="rgba(7,10,18,.86)";c.beginPath();c.roundRect(gx,gy,gw,gh,12);c.fill();c.strokeStyle="rgba(148,163,184,.2)";c.stroke();const plotTop=gy+28,plotH=gh-38;c.strokeStyle="rgba(148,163,184,.11)";c.lineWidth=1;for(let i=0;i<=4;i++){const y=plotTop+i*plotH/4;c.beginPath();c.moveTo(gx+8,y);c.lineTo(gx+gw-8,y);c.stroke()}for(let i=1;i<6;i++){const x=gx+i*gw/6;c.beginPath();c.moveTo(x,plotTop);c.lineTo(x,plotTop+plotH);c.stroke()}const count=this.history.length,span=max(239,count-1);for(const [key,color] of [["f","#34d399"],["e","#fb7185"]]){c.beginPath();this.history.forEach((v,i)=>{const x=gx+10+(i+span-(count-1))/span*(gw-20),y=plotTop+plotH/2-v[key]*(plotH*.43);i?c.lineTo(x,y):c.moveTo(x,y)});c.strokeStyle=color;c.lineWidth=2;c.stroke();if(count){const v=this.history[count-1],x=gx+gw-10,y=plotTop+plotH/2-v[key]*(plotH*.43);c.beginPath();c.arc(x,y,3,0,2*PI);c.fillStyle=color;c.fill()}}c.font="600 9px monospace";c.fillStyle="#34d399";c.fillText("● FLUXO Φ",gx+10,gy+17);c.fillStyle="#fb7185";c.fillText("● FEM ε",gx+88,gy+17);c.fillStyle="#64748b";c.fillText("TEMPO →",gx+gw-62,gy+17);}
		// Update stats
		const fv = document.querySelector("#fVal"),
			ev = document.querySelector("#eVal");
		if (fv) fv.textContent = linkage.toExponential(3);
		if (ev) ev.textContent = emf.toExponential(3);
		// Time label
		c.fillStyle = "rgba(255,255,255,0.4)";
		c.font = "10px monospace";
		const infoStr = `θ=${(theta%(2*PI)).toFixed(2)} rad · A=${area.toFixed(4)} m² · NΦ=${linkage.toExponential(2)} Wb`;
		const metrics = c.measureText(infoStr);
		c.fillText(infoStr, W - metrics.width - 16, 28);
	}
	onMouseDown(x, y) {
		if (abs(x - this.coilPos) < 85 && abs(y - H * .46) < 115) {
			this.dragCoil = true;
			S.drag = this;
		}
	}
	onMouseMove(x, y) {
		if (this.dragCoil) this.coilPos = x;
	}
	onMouseUp() {
		this.dragCoil = false;
	}
	resize() {
		this.coilPos = W / 2;
	}
}
