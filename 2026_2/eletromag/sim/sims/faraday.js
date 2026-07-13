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
<div class="control"><label>Campo B (T) <span class="val" id="bV">1.0</span></label><input type="range" id="B" min="0.1" max="3" step="0.1" value="1"></div>
<div class="control"><label>Velocidade angular ω <span class="val" id="sV">2.0 rad/s</span></label><input type="range" id="spd" min="0.2" max="6" step="0.1" value="2"></div>
<div class="control"><label>Número de voltas <span class="val" id="nV">5</span></label><input type="range" id="n" min="1" max="20" value="5"></div>
<div class="control"><label>Mostrar fluxo</label><label class="toggle"><input type="checkbox" id="flux" checked><span class="track"></span></label></div>
<div class="control"><label>Mostrar EMF</label><label class="toggle"><input type="checkbox" id="emf" checked><span class="track"></span></label></div>
<div class="btn-row"><button class="btn primary" id="play">▶ Animar</button><button class="btn" id="reset">↺ Reset</button></div>
<div class="stat-grid" id="stats"><div class="stat"><div class="num" id="fVal">0</div><div class="lbl">NΦ (Wb·volta)</div></div><div class="stat"><div class="num" id="eVal">0</div><div class="lbl">ε (V)</div></div></div>`;
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
		// Uniform B field represented by a regular arrow lattice.
		if (this.showFlux) {
			c.strokeStyle = "rgba(129,140,248,0.28)"; c.lineWidth = 1;
			for (let y = 38; y < H - 42; y += 48) for (let x = 24; x < W; x += 70) {
				c.beginPath();c.moveTo(x,y);c.lineTo(x+26,y);c.lineTo(x+20,y-4);c.moveTo(x+26,y);c.lineTo(x+20,y+4);c.stroke();
			}
			c.fillStyle = "rgba(165,180,252,.85)";c.font = "600 12px sans-serif";c.fillText(`B = ${this.fieldB.toFixed(1)} T`, 18, 25);
		}
		// Orthographic projection of a rectangular N-turn coil rotating about y.
		const halfProjected=max(3,abs(projection)*coilW/2), direction=projection>=0?1:-1;
		c.save();c.translate(bx,cy);
		c.fillStyle=`rgba(52,211,153,${.04+.16*abs(projection)})`;c.fillRect(-halfProjected,-coilH/2,halfProjected*2,coilH);
		for(let turn=0;turn<N;turn++){
			const inset=(turn-(N-1)/2)*min(2.2,12/max(1,N)),hw=max(2,halfProjected+inset);
			c.beginPath();c.rect(-hw,-coilH/2+inset,hw*2,coilH-2*inset);c.strokeStyle=turn===floor(N/2)?"#fde68a":"rgba(251,191,36,.72)";c.lineWidth=turn===floor(N/2)?2.5:1;c.stroke();
		}
		// Moving carriers indicate the Lenz-law current direction.
		if(this.playing&&abs(emf/emfPeak)>.03){const phase=((this.time*1.8*direction*Math.sign(emf))%1+1)%1;for(let k=0;k<8;k++){const u=(phase+k/8)%1;let x,y;if(u<.25){x=-halfProjected+u*4*halfProjected*2;y=-coilH/2}else if(u<.5){x=halfProjected;y=-coilH/2+(u-.25)*4*coilH}else if(u<.75){x=halfProjected-(u-.5)*4*halfProjected*2;y=coilH/2}else{x=-halfProjected;y=coilH/2-(u-.75)*4*coilH}c.beginPath();c.arc(x,y,2.3,0,2*PI);c.fillStyle="#fef3c7";c.fill();}}
		// Surface normal n rotates with the coil and makes Φ=B·A explicit.
		const nx=cos(theta),ny=-sin(theta),nl=58;c.beginPath();c.moveTo(0,0);c.lineTo(nx*nl,ny*nl);c.lineTo(nx*nl-nx*7+ny*4,ny*nl-ny*7-nx*4);c.moveTo(nx*nl,ny*nl);c.lineTo(nx*nl-nx*7-ny*4,ny*nl-ny*7+nx*4);c.strokeStyle="#67e8f9";c.lineWidth=2;c.stroke();c.fillStyle="#a5f3fc";c.font="11px monospace";c.fillText("n̂",nx*nl+5,ny*nl-4);c.restore();
		// Center-zero EMF meter.
		if (this.showEMF) {
			const meterY=min(H-72,cy+coilH/2+30),meterW=120;c.fillStyle="rgba(15,23,42,.85)";c.fillRect(bx-meterW/2,meterY-9,meterW,18);c.fillStyle="rgba(148,163,184,.5)";c.fillRect(bx-1,meterY-12,2,24);c.fillStyle=emf>=0?"rgba(52,211,153,.9)":"rgba(251,113,133,.9)";const ew=(emf/emfPeak)*(meterW/2-3);c.fillRect(ew<0?bx+ew:bx,meterY-6,abs(ew),12);c.fillStyle="#cbd5e1";c.font="10px monospace";c.textAlign="center";c.fillText(`ε = ${emf.toExponential(2)} V`,bx,meterY+24);c.textAlign="start";
		}
		// Scrolling normalized waveform: flux linkage and induced EMF are 90° apart.
		if(this.playing){this._historyClock+=dt;if(this._historyClock>=1/30){this._historyClock=0;this.history.push({f:projection,e:emf/emfPeak});if(this.history.length>180)this.history.shift();}}
		if(this.showEMF&&this.history.length>1){const gw=min(300,W*.38),gh=94,gx=W-gw-16,gy=16;c.fillStyle="rgba(7,10,18,.78)";c.fillRect(gx,gy,gw,gh);c.strokeStyle="rgba(148,163,184,.18)";c.strokeRect(gx,gy,gw,gh);c.beginPath();c.moveTo(gx,gy+gh/2);c.lineTo(gx+gw,gy+gh/2);c.stroke();for(const [key,color] of [["f","#34d399"],["e","#fb7185"]]){c.beginPath();this.history.forEach((v,i)=>{const x=gx+i/(179)*gw,y=gy+gh/2-v[key]*(gh*.38);i?c.lineTo(x,y):c.moveTo(x,y)});c.strokeStyle=color;c.lineWidth=1.7;c.stroke();}c.fillStyle="#94a3b8";c.font="9px monospace";c.fillText("Φ/Φmáx",gx+8,gy+13);c.fillStyle="#34d399";c.fillRect(gx+50,gy+8,12,2);c.fillStyle="#94a3b8";c.fillText("ε/εmáx",gx+70,gy+13);c.fillStyle="#fb7185";c.fillRect(gx+108,gy+8,12,2);}
		// Update stats
		const fv = document.querySelector("#fVal"),
			ev = document.querySelector("#eVal");
		if (fv) fv.textContent = linkage.toExponential(3);
		if (ev) ev.textContent = emf.toExponential(3);
		// Time label
		c.fillStyle = "rgba(255,255,255,0.4)";
		c.font = "10px monospace";
		c.fillText(`θ=${(theta%(2*PI)).toFixed(2)} rad · A=${area.toFixed(4)} m² · NΦ=${linkage.toExponential(2)} Wb`, 12, H-48);
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
