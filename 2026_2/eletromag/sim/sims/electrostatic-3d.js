// ============================================================================
// SIM 1-3D: ELECTROSTATICS 3D
// ============================================================================
import { Sim } from "../core/sim-base.js";
import { Charge } from "../core/sources.js";
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
	EPS0, K_E,
} from "../core/math.js";
import { magColor } from "../core/colors.js";
import * as THREE from 'three';
import { init3D, resize3D, getScene, getCamera, getRenderer, getControls, getRaycaster, getMouse, render3D, screenTo3D, dispose3D, W3D, H3D } from "../core/canvas-3d.js";

export class ElectroStatic3DSim extends Sim {
	constructor() {
		super("Eletrostática 3D", "🔮");
		this.mode = "field";
		this.charges = [];
		this.showLines = true;
		this.fluxSurf = false;
		this.dens = 16;
		this.chargeMagnitude = 1;
		this.gaussRadius = 120;
		this.showForces = true;
		this.showProbe = true;
		this.initialized = false;
		this.hint = "Adicione cargas; clique e arraste cargas para mover; clique e arraste o fundo para rotacionar a visão 3D; scroll para zoom";
		this.sceneObjects = { charges: [], fieldLines: [], isosurface: null };
		this.draggingCharge = null;
		this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // xy-plane at z=0
		this.ppm = 100; // pixels per meter (3D scale)
		this.fieldLineGroups = [];
		this.isosurfaceMesh = null;
	}

	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">🔮</span> ${this.name}</h3>
<div class="formula">F = k·q₁q₂/r² · r̂ | ∇·E = ρ/ε₀</div>
<div class="learning-card"><strong>Experimento guiado · Campo Eletrostático 3D</strong>Observe como as linhas de campo emergem das cargas positivas e entram nas negativas. Em 3D, o campo tem direção radial em todas as direções espaciais.<em>Compare a visualização 3D com a projeção 2D.</em></div>
<div class="btn-row"><button class="btn primary" id="addP">+ Positiva</button><button class="btn" id="addN">− Negativa</button><button class="btn danger" id="del">Remover</button><button class="btn danger" id="clr">Limpar</button></div>
<div class="control"><label>Modo 3D</label><select id="mode3d"><option value="field">Campo Elétrico 3D</option><option value="pot3d">Potencial Isosuperfície</option><option value="vectors">Vetores E</option></select></div>
<div class="control"><label>Carga (nC) <span class="val" id="qV3d">1.0</span></label><input type="range" id="q3d" min="0.1" max="5" step="0.1" value="1"></div>
<div class="control"><label>Linhas de campo 3D</label><label class="toggle"><input type="checkbox" id="lines3d" checked><span class="track"></span></label></div>
<div class="control"><label>Densidade <span class="val" id="dV3d">16</span></label><input type="range" id="dens3d" min="8" max="32" value="16"></div>
<div class="control"><label>Plano de corte (slicing)</label><label class="toggle"><input type="checkbox" id="slicePlane"><span class="track"></span></label></div>
<div class="legend"><span class="legend-item"><span class="legend-dot" style="background:#f87171"></span>+ Positiva (3D)</span><span class="legend-item"><span class="legend-dot" style="background:#38bdf8"></span>− Negativa (3D)</span></div>
${this.measurementPanel("Medições 3D", [["Cargas totais","0 nC"],["Campo no cursor","0 V/m"],["Potencial no cursor","0 V"]])}`;

		el.querySelector("#mode3d").value = this.mode;
		el.querySelector("#lines3d").checked = this.showLines;
		el.querySelector("#dens3d").value = String(this.dens);
		el.querySelector("#dV3d").textContent = String(this.dens);
		el.querySelector("#q3d").value = String(this.chargeMagnitude);
		el.querySelector("#qV3d").textContent = this.chargeMagnitude.toFixed(1);
		el.querySelector("#slicePlane").checked = false;

		el.querySelector("#mode3d").onchange = (e) => {
			this.mode = e.target.value;
			this.update3DView();
		};
		el.querySelector("#addP").onclick = () => this.addC(true);
		el.querySelector("#addN").onclick = () => this.addC(false);
		el.querySelector("#del").onclick = () => this.removeSelected();
		el.querySelector("#clr").onclick = () => {
			this.charges = [];
			this.clear3DObjects();
		};
		el.querySelector("#q3d").oninput = (e) => {
			this.chargeMagnitude = +e.target.value;
			el.querySelector("#qV3d").textContent = this.chargeMagnitude.toFixed(1);
		};
		el.querySelector("#lines3d").onchange = (e) => {
			this.showLines = e.target.checked;
			if (this.showLines) this.build3DFieldLines();
			else this.clearFieldLines();
		};
		el.querySelector("#dens3d").oninput = (e) => {
			this.dens = +e.target.value;
			el.querySelector("#dV3d").textContent = e.target.value;
			if (this.showLines) {
				this.clearFieldLines();
				this.build3DFieldLines();
			}
		};
		el.querySelector("#slicePlane").onchange = (e) => {
			this.toggleSlicePlane(e.target.checked);
		};

		if (!this.initialized && this.charges.length === 0) {
			this.charges.push(
				new Charge(-50, 0, 1, true),
				new Charge(50, 0, 1, false),
			);
			this.initialized = true;
			this.build3DCharges();
			this.build3DFieldLines();
		}
	}

	addC(pos) {
		const q = this.chargeMagnitude;
		const c = new Charge(
			(Math.random() - 0.5) * 100,
			(Math.random() - 0.5) * 100,
			q,
			pos,
		);
		this.charges.push(c);
		this.add3DCharge(c);
		if (this.showLines) {
			this.clearFieldLines();
			this.build3DFieldLines();
		}
	}

	E(p) {
		let ex = 0, ey = 0, ez = 0;
		this.charges.forEach((c) => {
			const r = new V3D(p.x - c.pos.x, p.y - c.pos.y, p.z - (c.pos.z || 0));
			const d2 = r.lenSq();
			const d = max(sqrt(d2), c.r * this.ppm / 100);
			const factor = (K_E * abs(c.q) * 1e-9) / (d * d * d);
			const sign = c.q > 0 ? 1 : -1;
			ex += sign * factor * r.x;
			ey += sign * factor * r.y;
			ez += sign * factor * r.z;
		});
		return new V3D(ex, ey, ez);
	}

	V(p) {
		let v = 0;
		this.charges.forEach((c) => {
			const r = new V3D(c.pos.x - p.x, c.pos.y - p.y, (c.pos.z || 0) - (p.z || 0));
			const d = max(sqrt(r.lenSq()), c.r * this.ppm / 100);
			v += (K_E * c.q * 1e-9) / d;
		});
		return v;
	}

	onMouseDown(x, y) {
		// Check for charge selection via raycasting
		const raycaster = getRaycaster();
		const mouse = getMouse();
		const camera = getCamera();
		
		mouse.x = (x / W3D) * 2 - 1;
		mouse.y = -(y / H3D) * 2 + 1;
		raycaster.setFromCamera(mouse, camera);
		
		const chargeMeshes = this.sceneObjects.charges.map(obj => obj.mesh);
		const intersects = raycaster.intersectObjects(chargeMeshes);
		
		if (intersects.length > 0) {
			const hitMesh = intersects[0].object;
			this.sel = this.charges.find(c => c._mesh === hitMesh);
			if (this.sel) {
				this.draggingCharge = this.sel;
				// Ensure charge has z position
				if (this.sel.pos.z === undefined) this.sel.pos.z = 0;
				// Set up drag plane at the charge's z position
				const chargeZ = this.sel.pos.z;
				this.dragPlane.set(new THREE.Vector3(0, 0, 1), -chargeZ);
				// Disable orbit controls while dragging charge
				const controls = getControls();
				if (controls) {
					controls.enabled = false;
					controls.enableRotate = false;
					controls.enablePan = false;
					controls.enableZoom = false;
				}
			}
		} else {
			// If no charge selected, allow orbit controls to handle rotation
			this.sel = null;
			this.draggingCharge = null;
			const controls = getControls();
			if (controls) {
				controls.enabled = true;
				controls.enableRotate = true;
				controls.enablePan = true;
				controls.enableZoom = true;
			}
		}
	}

	onMouseMove(x, y) {
		// Update 3D probe position
		if (this.showProbe) {
			this.update3DProbe(x, y);
		}
		
		// Handle charge dragging
		if (this.draggingCharge) {
			const raycaster = getRaycaster();
			const mouse = getMouse();
			const camera = getCamera();
			
			mouse.x = (x / W3D) * 2 - 1;
			mouse.y = -(y / H3D) * 2 + 1;
			raycaster.setFromCamera(mouse, camera);
			
			const intersectPoint = new THREE.Vector3();
			if (raycaster.ray.intersectPlane(this.dragPlane, intersectPoint)) {
				// Update charge position
				this.draggingCharge.pos.x = intersectPoint.x;
				this.draggingCharge.pos.y = intersectPoint.y;
				if (this.draggingCharge.pos.z === undefined) this.draggingCharge.pos.z = 0;
				this.draggingCharge.pos.z = intersectPoint.z;
				
				// Update mesh position
				const chargeObj = this.sceneObjects.charges.find(obj => obj.charge === this.draggingCharge);
				if (chargeObj) {
					chargeObj.mesh.position.set(intersectPoint.x, intersectPoint.y, intersectPoint.z);
				}
				
				// Update field lines if needed
				if (this.showLines) {
					this.clearFieldLines();
					this.build3DFieldLines();
				}
			}
		}
	}

	onMouseUp() {
		if (this.draggingCharge) {
			const controls = getControls();
			if (controls) {
				controls.enabled = true;
				controls.enableRotate = true;
				controls.enablePan = true;
				controls.enableZoom = true;
			}
		}
		this.draggingCharge = null;
		this.sel = null;
	}

	removeSelected() {
		if (!this.sel) return;
		this.charges = this.charges.filter((charge) => charge !== this.sel);
		this.remove3DCharge(this.sel);
		this.sel = null;
		if (this.showLines) {
			this.clearFieldLines();
			this.build3DFieldLines();
		}
	}

	clear3DObjects() {
		this.clearFieldLines();
		this.clearChargeMeshes();
		this.clearIsosurface();
		this.clearSlicePlane();
	}

	build3DCharges() {
		this.charges.forEach(c => this.add3DCharge(c));
	}

	add3DCharge(charge) {
		const radius = 8 + abs(charge.q) * 2;
		const geometry = new THREE.SphereGeometry(radius, 32, 32);
		
		const material = new THREE.MeshPhongMaterial({
			color: charge.positive ? 0xf87171 : 0x38bdf8,
			emissive: charge.positive ? 0x7f1d1d : 0x1e3a8a,
			emissiveIntensity: 0.3,
			transparent: true,
			opacity: 0.9,
		});
		
		const mesh = new THREE.Mesh(geometry, material);
		mesh.position.set(charge.pos.x, charge.pos.y, 0);
		mesh.userData = { charge: charge };
		charge._mesh = mesh;
		
		getScene().add(mesh);
		this.sceneObjects.charges.push({ mesh, charge });
	}

	remove3DCharge(charge) {
		const idx = this.sceneObjects.charges.findIndex(obj => obj.charge === charge);
		if (idx !== -1) {
			const obj = this.sceneObjects.charges[idx];
			getScene().remove(obj.mesh);
			obj.mesh.geometry.dispose();
			obj.mesh.material.dispose();
			this.sceneObjects.charges.splice(idx, 1);
			charge._mesh = null;
		}
	}

	clearChargeMeshes() {
		this.sceneObjects.charges.forEach(obj => {
			getScene().remove(obj.mesh);
			obj.mesh.geometry.dispose();
			obj.mesh.material.dispose();
		});
		this.sceneObjects.charges = [];
	}

	build3DFieldLines() {
		if (this.mode !== 'field') return;
		
		const starts = [];
		const qMax = max(...this.charges.map(ch => abs(ch.q)), 1e-9);
		
		this.charges.forEach((ch) => {
			const nLines = max(4, Math.round(this.dens * abs(ch.q) / qMax));
			for (let i = 0; i < nLines; i++) {
				const theta = (2 * PI * i) / nLines;
				const phi = Math.random() * PI;
				const dir = new V3D(
					sin(phi) * cos(theta),
					sin(phi) * sin(theta),
					cos(phi)
				);
				const start = new V3D(
					ch.pos.x + dir.x * 12,
					ch.pos.y + dir.y * 12,
					dir.z * 12
				);
				starts.push({ p: start, direction: ch.q > 0 ? 1 : -1, charge: ch });
			}
		});

		starts.forEach(({ p, direction, charge }) => {
			const points = [new THREE.Vector3(p.x, p.y, p.z)];
			let curr = p.clone();
			
			for (let s = 0; s < 300; s++) {
				const e = this.E(curr);
				const m = e.len();
				if (m < 1e-3) break;
				
				const step = min(3, 15 / sqrt(m + 1));
				const dir = e.norm();
				curr = curr.add(dir.mul(step * direction));
				
				// Check if we hit another charge
				let hitCharge = false;
				for (const ch of this.charges) {
					if (ch === charge) continue;
					const dist = curr.distTo3D(new V3D(ch.pos.x, ch.pos.y, ch.pos.z || 0));
					if (dist < ch.r * this.ppm / 50 && ch.q * direction < 0) {
						hitCharge = true;
						break;
					}
				}
				if (hitCharge) {
					points.push(new THREE.Vector3(curr.x, curr.y, curr.z));
					break;
				}
				
				// Check boundaries
				if (abs(curr.x) > 200 || abs(curr.y) > 200 || abs(curr.z) > 200) break;
				
				points.push(new THREE.Vector3(curr.x, curr.y, curr.z));
			}

			if (points.length > 1) {
				const geometry = new THREE.BufferGeometry().setFromPoints(points);
				const e = this.E(p);
				const opacity = min(0.7, max(0.2, log(e.len() + 1) / 5));
				const material = new THREE.LineBasicMaterial({
					color: 0x7dd3fc,
					opacity: opacity,
					transparent: true,
				});
				const line = new THREE.Line(geometry, material);
				getScene().add(line);
				this.fieldLineGroups.push(line);
			}
		});
	}

	clearFieldLines() {
		this.fieldLineGroups.forEach(line => {
			getScene().remove(line);
			line.geometry.dispose();
			line.material.dispose();
		});
		this.fieldLineGroups = [];
	}

	update3DView() {
		this.clearFieldLines();
		this.clearIsosurface();
		
		if (this.mode === 'field' || this.mode === 'vectors') {
			if (this.showLines) this.build3DFieldLines();
		} else if (this.mode === 'pot3d') {
			this.buildIsosurface();
		}
	}

	buildIsosurface() {
		this.clearIsosurface();
		
		// Create a simple isosurface for potential using a box geometry with custom shader
		// For now, create a visual representation with transparent spheres at charge locations
		// A full marching cubes implementation would be too large for this file
		
		const container = new THREE.Group();
		
		this.charges.forEach(ch => {
			const radius = 30 + abs(ch.q) * 15;
			const geometry = new THREE.SphereGeometry(radius, 16, 16);
			const v = this.V(new V3D(ch.pos.x, ch.pos.y, 0));
			const t = max(0, min(1, (v + 100) / 200));
			const color = magColor(t, 0.15, 'plasma');
			const rgb = color.match(/\d+/g).map(Number);
			
			const material = new THREE.MeshBasicMaterial({
				color: new THREE.Color(`rgb(${rgb[0]},${rgb[1]},${rgb[2]})`),
				transparent: true,
				opacity: 0.1,
				wireframe: false,
			});
			
			const mesh = new THREE.Mesh(geometry, material);
			container.add(mesh);
		});
		
		getScene().add(container);
		this.isosurfaceMesh = container;
	}

	clearIsosurface() {
		if (this.isosurfaceMesh) {
			getScene().remove(this.isosurfaceMesh);
			this.isosurfaceMesh.traverse(child => {
				if (child.geometry) child.geometry.dispose();
				if (child.material) child.material.dispose();
			});
			this.isosurfaceMesh = null;
		}
	}

	toggleSlicePlane(show) {
		this.clearSlicePlane();
		if (show) {
			const planeGeometry = new THREE.PlaneGeometry(300, 300);
			const planeMaterial = new THREE.MeshBasicMaterial({
				color: 0x64748b,
				transparent: true,
				opacity: 0.1,
				side: THREE.DoubleSide,
				wireframe: true,
			});
			this.slicePlane = new THREE.Mesh(planeGeometry, planeMaterial);
			this.slicePlane.rotation.y = Math.PI / 2;
			this.slicePlane.position.x = 0;
			getScene().add(this.slicePlane);
		}
	}

	clearSlicePlane() {
		if (this.slicePlane) {
			getScene().remove(this.slicePlane);
			this.slicePlane.geometry.dispose();
			this.slicePlane.material.dispose();
			this.slicePlane = null;
		}
	}

	update3DProbe(screenX, screenY) {
		// Update probe UI with 3D field values at cursor position
		const probeW = 280, probeH = 70, probeX = W3D - probeW - 16, probeY = 16;
		
		// Get 3D point from screen coordinates
		const point3D = screenTo3D(screenX, screenY, 0);
		if (!point3D) return;
		
		const p = new V3D(point3D.x, point3D.y, point3D.z);
		const e = this.E(p);
		const v = this.V(p);
		
		// Update measurement panel
		const totalQ = this.charges.reduce((sum, c) => sum + c.q, 0) * 1e9;
		this.updateMeasurements([
			`${totalQ.toFixed(2)} nC`,
			`${e.len().toExponential(2)} V/m`,
			`${v.toFixed(2)} V`
		]);
	}

	resize() {
		resize3D();
	}

	render(c, time) {
		// 3D rendering is handled by the render loop in main.js
		// This method is called for compatibility with Sim base class
		render3D();
	}

	dispose() {
		dispose3D();
		this.clear3DObjects();
	}
}

// 3D Vector class
class V3D {
	constructor(x, y, z) {
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
	}
	add(v) { return new V3D(this.x + v.x, this.y + v.y, this.z + v.z); }
	sub(v) { return new V3D(this.x - v.x, this.y - v.y, this.z - v.z); }
	mul(s) { return new V3D(this.x * s, this.y * s, this.z * s); }
	norm() {
		const l = sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
		return l > 0 ? new V3D(this.x / l, this.y / l, this.z / l) : new V3D(0, 0, 0);
	}
	len() { return sqrt(this.x * this.x + this.y * this.y + this.z * this.z); }
	lenSq() { return this.x * this.x + this.y * this.y + this.z * this.z; }
	distTo3D(v) { return sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2 + (this.z - v.z) ** 2); }
	clone() { return new V3D(this.x, this.y, this.z); }
}
