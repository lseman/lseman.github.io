// ============================================================================
// SIM FARADAY 3D: ELECTROMAGNETIC INDUCTION IN 3D
// ============================================================================
import { Sim } from "../core/sim-base.js";
import { PI, sin, cos, abs, min, max, floor } from "../core/math.js";
import * as THREE from 'three';
import { init3D, resize3D, getScene, getCamera, getRenderer, getControls, getRaycaster, getMouse, render3D, screenTo3D, dispose3D, W3D, H3D } from "../core/canvas-3d.js";

export class Faraday3DSim extends Sim {
	constructor() {
		super("Faraday 3D", "⚡");
		this.fieldB = 1;
		this.speed = 1;
		this.turns = 5;
		this.theta = 0;
		this.playing = false;
		this.showFlux = true;
		this.showEMF = true;
		this.dragRotate = false;
		this.dragStart = 0;
		this.thetaStart = 0;
		this.coilRadius = 55;
		this.hint = "Arraste a bobina para girar; anime a rotação no campo magnético uniforme";
		this.sceneObjects = { coil: null, fieldArrows: [], normalArrow: null, current: [] };
		this._currentClock = 0;
		this.history = [];
		this._historyClock = 0;
	}

	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">⚡</span> ${this.name}</h3>
<div class="formula">ε = −N·dΦ/dt, &nbsp; Φ = B·A·cos θ</div>
<div class="learning-card"><strong>Experimento guiado · Lei de Faraday 3D</strong>Gire a bobina no espaço e observe o ângulo entre a normal n̂ e o campo B. O fluxo é máximo quando n̂ ∥ B, e a fem é máxima quando n̂ ⊥ B.<em>Arraste a bobina ou anime a rotação automática.</em></div>
<div class="control"><label>Campo B (T) <span class="val" id="bV3d">1.0</span></label><input type="range" id="B3d" min="0.1" max="3" step="0.1" value="1"></div>
<div class="control"><label>Velocidade angular ω <span class="val" id="sV3d">2.0 rad/s</span></label><input type="range" id="spd3d" min="0.2" max="6" step="0.1" value="2"></div>
<div class="control"><label>Número de voltas <span class="val" id="nV3d">5</span></label><input type="range" id="n3d" min="1" max="20" value="5"></div>
<div class="control"><label>Mostrar campo B</label><label class="toggle"><input type="checkbox" id="flux3d" checked><span class="track"></span></label></div>
<div class="control"><label>Mostrar EMF</label><label class="toggle"><input type="checkbox" id="emf3d" checked><span class="track"></span></label></div>
<div class="btn-row"><button class="btn primary" id="play3d">▶ Animar</button><button class="btn" id="reset3d">↺ Reset</button></div>
<div class="stat-grid" id="stats3d"><div class="stat"><div class="num" id="fVal3d">0</div><div class="lbl">NΦ (Wb·volta)</div></div><div class="stat"><div class="num" id="eVal3d">0</div><div class="lbl">ε (V)</div></div></div>
${this.measurementPanel("Previsão analítica", [["Fluxo máximo NΦ₀","—"],["FEM máxima ε₀","—"],["Fase Φ → ε","90°"],["Lei de Lenz","opõe ΔΦ"]])}`;

		el.querySelector("#B3d").value = String(this.fieldB);
		el.querySelector("#bV3d").textContent = this.fieldB.toFixed(1);
		el.querySelector("#spd3d").value = String(this.speed * 2);
		el.querySelector("#sV3d").textContent = `${(this.speed * 2).toFixed(1)} rad/s`;
		el.querySelector("#n3d").value = String(this.turns);
		el.querySelector("#nV3d").textContent = String(this.turns);
		el.querySelector("#flux3d").checked = this.showFlux;
		el.querySelector("#emf3d").checked = this.showEMF;
		el.querySelector("#play3d").textContent = this.playing ? "⏸ Pausar" : "▶ Animar";

		el.querySelector("#B3d").oninput = (e) => {
			this.fieldB = +e.target.value;
			el.querySelector("#bV3d").textContent = this.fieldB.toFixed(1);
		};
		el.querySelector("#spd3d").oninput = (e) => {
			this.speed = +e.target.value / 2;
			el.querySelector("#sV3d").textContent = `${(+e.target.value).toFixed(1)} rad/s`;
		};
		el.querySelector("#n3d").oninput = (e) => {
			this.turns = +e.target.value;
			el.querySelector("#nV3d").textContent = e.target.value;
			this.rebuildCoil();
		};
		el.querySelector("#flux3d").onchange = (e) => {
			this.showFlux = e.target.checked;
			this.rebuildFieldArrows();
		};
		el.querySelector("#emf3d").onchange = (e) => (this.showEMF = e.target.checked);
		el.querySelector("#play3d").onclick = () => {
			this.playing = !this.playing;
			el.querySelector("#play3d").textContent = this.playing ? "⏸ Pausar" : "▶ Animar";
		};
		el.querySelector("#reset3d").onclick = () => {
			this.theta = 0;
			this.playing = false;
			this.history = [];
			this._historyClock = 0;
			el.querySelector("#play3d").textContent = "▶ Animar";
			this.updateCoilTransform();
		};

		if (!this.sceneObjects.coil) {
			this.build3DObjects();
		}
	}

	build3DObjects() {
		this.buildCoil();
		this.buildFieldArrows();
		this.buildNormalArrow();
	}

	clear3DObjects() {
		this.clearCoil();
		this.clearFieldArrows();
		this.clearNormalArrow();
		this.clearCurrentPulses();
		const overlay = document.getElementById('faraday3d-overlay');
		if (overlay) overlay.remove();
	}

	buildCoil() {
		this.clearCoil();
		const group = new THREE.Group();
		for (let turn = 0; turn < this.turns; turn++) {
			const inset = (turn - (this.turns - 1) / 2) * min(2.2, 12 / max(1, this.turns));
			const geometry = new THREE.TorusGeometry(this.coilRadius + inset, 2, 12, 48);
			const material = new THREE.MeshPhongMaterial({
				color: turn === floor(this.turns / 2) ? 0xfde68a : 0xfbbf24,
				emissive: 0x92400e,
				emissiveIntensity: 0.3,
			});
			const mesh = new THREE.Mesh(geometry, material);
			group.add(mesh);
		}
		getScene().add(group);
		this.sceneObjects.coil = group;
		this.updateCoilTransform();
	}

	rebuildCoil() {
		this.buildCoil();
	}

	clearCoil() {
		if (this.sceneObjects.coil) {
			getScene().remove(this.sceneObjects.coil);
			this.sceneObjects.coil.traverse(child => {
				if (child.geometry) child.geometry.dispose();
				if (child.material) child.material.dispose();
			});
			this.sceneObjects.coil = null;
		}
	}

	buildFieldArrows() {
		this.clearFieldArrows();
		if (!this.showFlux) return;
		const spacing = 60, extent = 180;
		for (let y = -extent; y <= extent; y += spacing) {
			for (let z = -extent; z <= extent; z += spacing) {
				const dir = new THREE.Vector3(1, 0, 0);
				const origin = new THREE.Vector3(-extent, y, z);
				const arrow = new THREE.ArrowHelper(dir, origin, extent * 2, 0x818cf8, 14, 8);
				arrow.line.material.transparent = true;
				arrow.line.material.opacity = 0.35;
				arrow.cone.material.transparent = true;
				arrow.cone.material.opacity = 0.35;
				getScene().add(arrow);
				this.sceneObjects.fieldArrows.push(arrow);
			}
		}
	}

	rebuildFieldArrows() {
		this.buildFieldArrows();
	}

	clearFieldArrows() {
		this.sceneObjects.fieldArrows.forEach(arrow => {
			getScene().remove(arrow);
			arrow.line.geometry.dispose();
			arrow.line.material.dispose();
			arrow.cone.geometry.dispose();
			arrow.cone.material.dispose();
		});
		this.sceneObjects.fieldArrows = [];
	}

	buildNormalArrow() {
		this.clearNormalArrow();
		const dir = new THREE.Vector3(1, 0, 0);
		const origin = new THREE.Vector3(0, 0, 0);
		this.sceneObjects.normalArrow = new THREE.ArrowHelper(dir, origin, 90, 0x67e8f9, 16, 9);
		getScene().add(this.sceneObjects.normalArrow);
		this.updateCoilTransform();
	}

	clearNormalArrow() {
		if (this.sceneObjects.normalArrow) {
			getScene().remove(this.sceneObjects.normalArrow);
			this.sceneObjects.normalArrow = null;
		}
	}

	clearCurrentPulses() {
		this.sceneObjects.current.forEach(mesh => {
			getScene().remove(mesh);
			mesh.geometry.dispose();
			mesh.material.dispose();
		});
		this.sceneObjects.current = [];
	}

	updateCoilTransform() {
		if (this.sceneObjects.coil) this.sceneObjects.coil.rotation.y = this.theta;
		if (this.sceneObjects.normalArrow) {
			const dir = new THREE.Vector3(cos(this.theta), 0, sin(this.theta));
			this.sceneObjects.normalArrow.setDirection(dir);
		}
	}

	onMouseDown(x, y) {
		const raycaster = getRaycaster();
		const mouse = getMouse();
		const camera = getCamera();

		mouse.x = (x / W3D) * 2 - 1;
		mouse.y = -(y / H3D) * 2 + 1;
		raycaster.setFromCamera(mouse, camera);

		const coilMeshes = this.sceneObjects.coil ? this.sceneObjects.coil.children : [];
		const hit = raycaster.intersectObjects(coilMeshes).length > 0;

		if (hit) {
			this.dragRotate = true;
			this.dragStart = x;
			this.thetaStart = this.theta;
			const controls = getControls();
			if (controls) controls.enabled = false;
		} else {
			this.dragRotate = false;
		}
	}

	onMouseMove(x, y) {
		if (this.dragRotate) {
			const dx = x - this.dragStart;
			this.theta = this.thetaStart + dx * 0.01;
			this.updateCoilTransform();
		}
	}

	onMouseUp() {
		this.dragRotate = false;
		const controls = getControls();
		if (controls) controls.enabled = true;
	}

	resize() {
		resize3D();
	}

	render(c, time) {
		const dt = this.deltaTime(time);
		if (this.playing) {
			this.theta += 2 * this.speed * dt;
			this.updateCoilTransform();
		}

		const N = this.turns;
		const area = PI * (this.coilRadius / 1000) ** 2;
		const projection = cos(this.theta);
		const omega = 2 * this.speed;
		const flux = this.fieldB * area * projection;
		const linkage = N * flux;
		const emf = N * this.fieldB * area * omega * sin(this.theta);
		const emfPeak = max(1e-12, N * this.fieldB * area * omega);

		this.updateMeasurements([
			`${(N * this.fieldB * area).toExponential(3)} Wb·volta`,
			`${emfPeak.toExponential(3)} V`,
			`90°`,
			`opõe ΔΦ`,
		]);

		if (this.playing) {
			this._historyClock += dt;
			while (this._historyClock >= 1 / 30) {
				this._historyClock -= 1 / 30;
				this.history.push({ f: projection, e: emf / emfPeak });
				if (this.history.length > 240) this.history.shift();
			}
		}

		const fv = document.querySelector("#fVal3d"), ev = document.querySelector("#eVal3d");
		if (fv) fv.textContent = linkage.toExponential(3);
		if (ev) ev.textContent = emf.toExponential(3);

		render3D();
		this.drawOverlay(emf, emfPeak, projection);
	}

	drawOverlay(emf, emfPeak, projection) {
		const canvas3d = document.getElementById('c-3d');
		if (!canvas3d) return;
		let overlay = document.getElementById('faraday3d-overlay');
		if (!overlay) {
			overlay = document.createElement('canvas');
			overlay.id = 'faraday3d-overlay';
			overlay.style.position = 'absolute';
			overlay.style.inset = '0';
			overlay.style.zIndex = '4';
			overlay.style.pointerEvents = 'none';
			canvas3d.parentElement.style.position = 'relative';
			canvas3d.parentElement.appendChild(overlay);
		}
		const rect = canvas3d.getBoundingClientRect();
		if (overlay.width !== rect.width || overlay.height !== rect.height) {
			overlay.width = rect.width;
			overlay.height = rect.height;
		}
		const octx = overlay.getContext('2d');
		octx.clearRect(0, 0, overlay.width, overlay.height);
		if (!this.showEMF) return;

		const W = overlay.width, meterW = 160, meterY = 24;
		octx.fillStyle = "rgba(15,23,42,.88)";
		octx.beginPath();
		octx.roundRect(W / 2 - meterW / 2, meterY - 11, meterW, 22, 7);
		octx.fill();
		octx.fillStyle = "rgba(148,163,184,.5)";
		octx.fillRect(W / 2 - 1, meterY - 12, 2, 24);
		octx.fillStyle = emf >= 0 ? "rgba(52,211,153,.95)" : "rgba(251,113,133,.95)";
		const ew = (emf / emfPeak) * (meterW / 2 - 5);
		octx.fillRect(ew < 0 ? W / 2 + ew : W / 2, meterY - 6, abs(ew), 12);
		octx.fillStyle = "#cbd5e1";
		octx.font = "10px monospace";
		octx.textAlign = "center";
		octx.fillText(`ε = ${emf.toExponential(2)} V`, W / 2, meterY + 27);
		octx.fillStyle = abs(emf / emfPeak) < .03 ? "#94a3b8" : "#fde68a";
		octx.fillText(abs(emf / emfPeak) < .03 ? "corrente ≈ 0" : `corrente induzida ${emf > 0 ? "↻" : "↺"}`, W / 2, meterY + 42);

		if (this.history.length > 1) {
			const gw = min(340, W * .42), gh = 100, gx = W - gw - 16, gy = 16;
			octx.textAlign = "start";
			octx.fillStyle = "rgba(7,10,18,.86)";
			octx.beginPath();
			octx.roundRect(gx, gy, gw, gh, 12);
			octx.fill();
			octx.strokeStyle = "rgba(148,163,184,.2)";
			octx.stroke();
			const plotTop = gy + 22, plotH = gh - 30;
			const count = this.history.length, span = max(239, count - 1);
			for (const [key, color] of [["f", "#34d399"], ["e", "#fb7185"]]) {
				octx.beginPath();
				this.history.forEach((v, i) => {
					const x = gx + 10 + (i + span - (count - 1)) / span * (gw - 20);
					const y = plotTop + plotH / 2 - v[key] * (plotH * .43);
					i ? octx.lineTo(x, y) : octx.moveTo(x, y);
				});
				octx.strokeStyle = color;
				octx.lineWidth = 2;
				octx.stroke();
			}
			octx.font = "600 9px monospace";
			octx.fillStyle = "#34d399";
			octx.fillText("● FLUXO Φ", gx + 10, gy + 14);
			octx.fillStyle = "#fb7185";
			octx.fillText("● FEM ε", gx + 88, gy + 14);
		}
	}

	dispose() {
		const overlay = document.getElementById('faraday3d-overlay');
		if (overlay) overlay.remove();
		this.clear3DObjects();
	}
}
