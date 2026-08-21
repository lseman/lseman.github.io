// ============================================================================
// SIM MAGNETOSTATICS 3D
// ============================================================================
import { Sim } from "../core/sim-base.js";
import { V, PI, sin, cos, sqrt, abs, min, max, MU0 } from "../core/math.js";
import * as THREE from 'three';
import { init3D, resize3D, getScene, getCamera, getRenderer, getControls, getRaycaster, getMouse, render3D, screenTo3D, dispose3D, W3D, H3D } from "../core/canvas-3d.js";

const PX_PER_METER = 1000;

export class Magnetostatics3DSim extends Sim {
	constructor() {
		super("Magnetostática 3D", "🧲");
		this.sources = [];
		this.mode = "lines";
		this.I = 2;
		this.dens = 16;
		this.showLines = true;
		this.showProbe = true;
		this.initialized = false;
		this.hint = "Adicione fontes; clique e arraste fontes para mover; clique e arraste o fundo para rotacionar a visão 3D; scroll para zoom";
		this.sceneObjects = { sources: [], fieldLines: [] };
		this.ppm = 100; // pixels per meter (3D scale)
		this.fieldLineGroups = [];
		this.draggingSource = null;
		this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
	}

	buildControls(el) {
		el.innerHTML = `<h3><span class="icon">🧲</span> ${this.name}</h3>
<div class="formula">B = μ₀I/(2πr) φ̂ | ∇×B = μ₀J</div>
<div class="learning-card"><strong>Experimento guiado · Campo Magnetostático 3D</strong>Correntes geram campos magnéticos circulares ao redor do condutor. Em 3D, as linhas de campo formam círculos fechados ao redor das correntes.<em>Observe a regra da mão direita: polegar na direção da corrente, dedos indicam B.</em></div>
<div class="btn-row"><button class="btn primary" id="wire3d">⊙ Fio 3D</button><button class="btn" id="loop3d">◯ Espira 3D</button><button class="btn" id="sol3d">▱ Solenoide 3D</button><button class="btn danger" id="del3d">Remover</button><button class="btn danger" id="clr3d">Limpar</button></div>
<div class="control"><label>Modo 3D</label><select id="mode3d"><option value="lines">Linhas de Campo 3D</option><option value="vectors3d">Vetores B</option></select></div>
<div class="control"><label>Corrente <span class="val" id="iV3d">2.0 A</span></label><input type="range" id="I3d" min="-5" max="5" step="0.1" value="2"></div>
<div class="control"><label>Linhas de campo 3D</label><label class="toggle"><input type="checkbox" id="lines3d" checked><span class="track"></span></label></div>
<div class="control"><label>Densidade <span class="val" id="dV3d">16</span></label><input type="range" id="dens3d" min="8" max="28" value="16"></div>
<div class="control"><label>Plano de corte (slicing)</label><label class="toggle"><input type="checkbox" id="slicePlane3d"><span class="track"></span></label></div>
<div class="legend"><span class="legend-item"><span class="legend-dot" style="background:#fbbf24"></span>corrente 3D</span><span class="legend-item"><span class="legend-dot" style="background:#67e8f9"></span>campo B 3D</span></div>
${this.measurementPanel("Medições 3D", [["Fontes totais","0"],["Campo no cursor","0 T"]])}`;

		el.querySelector("#mode3d").value = this.mode;
		el.querySelector("#lines3d").checked = this.showLines;
		el.querySelector("#dens3d").value = String(this.dens);
		el.querySelector("#dV3d").textContent = String(this.dens);
		el.querySelector("#I3d").value = String(this.I);
		el.querySelector("#iV3d").textContent = `${this.I.toFixed(1)} A`;
		el.querySelector("#slicePlane3d").checked = false;

		el.querySelector("#mode3d").onchange = (e) => {
			this.mode = e.target.value;
			this.update3DView();
		};
		const randPos = () => (Math.random() - 0.5) * 100;
		el.querySelector("#wire3d").onclick = () => this.addWire3D(randPos(), randPos());
		el.querySelector("#loop3d").onclick = () => this.addLoop3D(randPos(), randPos());
		el.querySelector("#sol3d").onclick = () => this.addSolenoid3D(randPos(), randPos());
		el.querySelector("#del3d").onclick = () => this.removeSelected();
		el.querySelector("#clr3d").onclick = () => {
			this.sources = [];
			this.clear3DObjects();
		};
		el.querySelector("#I3d").oninput = (e) => {
			this.I = +e.target.value;
			el.querySelector("#iV3d").textContent = `${this.I.toFixed(1)} A`;
			// Update all source currents
			this.sources.forEach(s => s.I = this.I);
			if (this.showLines) {
				this.clearFieldLines();
				this.build3DFieldLines();
			}
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
		el.querySelector("#slicePlane3d").onchange = (e) => {
			this.toggleSlicePlane(e.target.checked);
		};

		if (!this.initialized && this.sources.length === 0) {
			this.addWire3D(0, 0);
			this.initialized = true;
		}
	}

	addWire3D(x = 0, y = 0, z = 0) {
		const source = { t: "wire", x, y, z: z !== undefined ? z : 0, I: this.I };
		this.sources.push(source);
		this.add3DWire(source);
		if (this.showLines) {
			this.clearFieldLines();
			this.build3DFieldLines();
		}
	}

	addLoop3D(x = 0, y = 0, z = 0) {
		const source = { t: "loop", x, y, z: z !== undefined ? z : 0, r: 40, I: this.I };
		this.sources.push(source);
		this.add3DLoop(source);
		if (this.showLines) {
			this.clearFieldLines();
			this.build3DFieldLines();
		}
	}

	addSolenoid3D(x = 0, y = 0, z = 0) {
		const source = { t: "solenoid", x, y, z: z !== undefined ? z : 0, w: 120, h: 40, n: 20, I: this.I };
		this.sources.push(source);
		this.add3DSolenoid(source);
		if (this.showLines) {
			this.clearFieldLines();
			this.build3DFieldLines();
		}
	}

	B(p) {
		let bx = 0, by = 0, bz = 0;
		for (const s of this.sources) {
			const dx = (p.x - s.x) / PX_PER_METER;
			const dy = (p.y - s.y) / PX_PER_METER;
			const dz = (p.z - (s.z || 0)) / PX_PER_METER;
			const r = max(0.012, sqrt(dx * dx + dy * dy + dz * dz));

			if (s.t === "wire") {
				// Wire along z-axis: B = μ₀I/(2πr) * φ̂
				// φ̂ = (-dy/r, dx/r, 0)
				const b = MU0 * s.I / (2 * PI * max(0.012, sqrt(dx * dx + dy * dy)));
				bx += (-dy / max(0.012, sqrt(dx * dx + dy * dy))) * b;
				by += (dx / max(0.012, sqrt(dx * dx + dy * dy))) * b;
				bz += 0;
			} else if (s.t === "loop") {
				// Loop in xy-plane at z=0: use dipole approximation for points far away
				// Or exact formula for loop on axis
				const a = s.r / PX_PER_METER;
				// For simplicity, approximate as dipole for off-axis points
				const moment = s.I * PI * a * a;
				const dot = moment * dz / r;
				const factor = MU0 / (4 * PI * r * r * r);
				bx += factor * (3 * (dot / r) * dx);
				by += factor * (3 * (dot / r) * dy);
				bz += factor * (3 * (dot / r) * dz - moment);
			} else if (s.t === "solenoid") {
				// Solenoid: field inside is uniform along axis, outside is weak
				const halfW = s.w / (2 * PX_PER_METER);
				const halfH = s.h / (2 * PX_PER_METER);
				const n_per_m = s.n / (s.w / PX_PER_METER);
				if (abs(dx) < halfW && abs(dy) < halfH && abs(dz) < halfH) {
					bx += 0;
					by += MU0 * n_per_m * s.I;
					bz += 0;
				} else {
					// Dipole approximation
					const moment = s.n * s.I * (s.w / PX_PER_METER) * (s.h / PX_PER_METER);
					const dot = moment * dz / r;
					const factor = MU0 / (4 * PI * r * r * r);
					bx += factor * (3 * (dot / r) * dx);
					by += factor * (3 * (dot / r) * dy);
					bz += factor * (3 * (dot / r) * dz - moment);
				}
			}
		}
		return new V3D(bx, by, bz);
	}

	onMouseDown(x, y) {
		const raycaster = getRaycaster();
		const mouse = getMouse();
		const camera = getCamera();

		mouse.x = (x / W3D) * 2 - 1;
		mouse.y = -(y / H3D) * 2 + 1;
		raycaster.setFromCamera(mouse, camera);

		const sourceMeshes = this.sceneObjects.sources.map(obj => obj.mesh);
		const intersects = raycaster.intersectObjects(sourceMeshes, true);

		if (intersects.length > 0) {
			let hitMesh = intersects[0].object;
			while (hitMesh && !this.sources.includes(hitMesh.userData?.source)) {
				hitMesh = hitMesh.parent;
			}
			this.sel = hitMesh ? hitMesh.userData.source : null;
			if (this.sel) {
				this.draggingSource = this.sel;
				// Ensure source has z position
				if (this.sel.z === undefined) this.sel.z = 0;
				// Set up drag plane at the source's z position
				const sourceZ = this.sel.z;
				this.dragPlane.set(new THREE.Vector3(0, 0, 1), -sourceZ);
				// Disable orbit controls while dragging source
				const controls = getControls();
				if (controls) {
					controls.enabled = false;
					controls.enableRotate = false;
					controls.enablePan = false;
					controls.enableZoom = false;
				}
			}
		} else {
			// If no source selected, allow orbit controls to handle rotation
			this.sel = null;
			this.draggingSource = null;
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

		// Handle source dragging
		if (this.draggingSource) {
			const raycaster = getRaycaster();
			const mouse = getMouse();
			const camera = getCamera();

			mouse.x = (x / W3D) * 2 - 1;
			mouse.y = -(y / H3D) * 2 + 1;
			raycaster.setFromCamera(mouse, camera);

			const intersectPoint = new THREE.Vector3();
			if (raycaster.ray.intersectPlane(this.dragPlane, intersectPoint)) {
				// Update source position
				this.draggingSource.x = intersectPoint.x;
				this.draggingSource.y = intersectPoint.y;
				if (this.draggingSource.z === undefined) this.draggingSource.z = 0;
				this.draggingSource.z = intersectPoint.z;

				// Update mesh position
				const sourceObj = this.sceneObjects.sources.find(obj => obj.source === this.draggingSource);
				if (sourceObj) {
					sourceObj.mesh.position.set(intersectPoint.x, intersectPoint.y, intersectPoint.z);
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
		if (this.draggingSource) {
			const controls = getControls();
			if (controls) {
				controls.enabled = true;
				controls.enableRotate = true;
				controls.enablePan = true;
				controls.enableZoom = true;
			}
		}
		this.draggingSource = null;
		this.sel = null;
	}

	removeSelected() {
		if (!this.sel) return;
		this.sources = this.sources.filter(source => source !== this.sel);
		this.remove3DSource(this.sel);
		this.sel = null;
		if (this.showLines) {
			this.clearFieldLines();
			this.build3DFieldLines();
		}
	}

	clear3DObjects() {
		this.clearFieldLines();
		this.clearSourceMeshes();
		this.clearIsosurface();
		this.clearSlicePlane();
	}

	build3DSources() {
		this.sources.forEach(s => {
			if (s.t === "wire") this.add3DWire(s);
			else if (s.t === "loop") this.add3DLoop(s);
			else if (s.t === "solenoid") this.add3DSolenoid(s);
		});
	}

	add3DWire(source) {
		const geometry = new THREE.CylinderGeometry(6, 6, 120, 16);
		const material = new THREE.MeshPhongMaterial({
			color: 0xfbbf24,
			emissive: 0x92400e,
			emissiveIntensity: 0.3,
		});
		const mesh = new THREE.Mesh(geometry, material);
		mesh.rotation.x = Math.PI / 2;
		mesh.position.set(source.x, source.y, source.z || 0);
		mesh.userData = { source: source };
		source._mesh = mesh;

		getScene().add(mesh);
		this.sceneObjects.sources.push({ mesh, source });
	}

	add3DLoop(source) {
		const geometry = new THREE.TorusGeometry(source.r || 40, 6, 16, 32);
		const material = new THREE.MeshPhongMaterial({
			color: 0xfbbf24,
			emissive: 0x92400e,
			emissiveIntensity: 0.3,
		});
		const mesh = new THREE.Mesh(geometry, material);
		mesh.position.set(source.x, source.y, source.z || 0);
		mesh.rotation.x = Math.PI / 2;
		mesh.userData = { source: source };
		source._mesh = mesh;

		getScene().add(mesh);
		this.sceneObjects.sources.push({ mesh, source });
	}

	add3DSolenoid(source) {
		const group = new THREE.Group();
		const radius = (source.h || 40) / 2;
		const length = source.w || 120;
		const numTurns = source.n || 20;

		const material = new THREE.MeshPhongMaterial({
			color: 0xfbbf24,
			emissive: 0x92400e,
			emissiveIntensity: 0.3,
		});

		for (let i = 0; i < numTurns; i++) {
			const t = (i / numTurns) * length - length / 2;
			const ringGeom = new THREE.TorusGeometry(radius, 3, 8, 16);
			const ring = new THREE.Mesh(ringGeom, material);
			ring.position.set(t, 0, 0);
			ring.rotation.y = Math.PI / 2;
			group.add(ring);
		}

		group.position.set(source.x, source.y, source.z || 0);
		group.userData = { source: source };
		source._mesh = group;

		getScene().add(group);
		this.sceneObjects.sources.push({ mesh: group, source });
	}

	remove3DSource(source) {
		const idx = this.sceneObjects.sources.findIndex(obj => obj.source === source);
		if (idx !== -1) {
			const obj = this.sceneObjects.sources[idx];
			getScene().remove(obj.mesh);
			if (obj.mesh.geometry) obj.mesh.geometry.dispose();
			if (obj.mesh.material) obj.mesh.material.dispose();
			if (obj.mesh.type === 'Group') {
				obj.mesh.traverse(child => {
					if (child.geometry) child.geometry.dispose();
					if (child.material) child.material.dispose();
				});
			}
			this.sceneObjects.sources.splice(idx, 1);
			source._mesh = null;
		}
	}

	clearSourceMeshes() {
		this.sceneObjects.sources.forEach(obj => {
			getScene().remove(obj.mesh);
			if (obj.mesh.geometry) obj.mesh.geometry.dispose();
			if (obj.mesh.material) obj.mesh.material.dispose();
			if (obj.mesh.type === 'Group') {
				obj.mesh.traverse(child => {
					if (child.geometry) child.geometry.dispose();
					if (child.material) child.material.dispose();
				});
			}
		});
		this.sceneObjects.sources = [];
	}

	build3DFieldLines() {
		if (this.mode !== 'lines' && this.mode !== 'vectors3d') return;

		const starts = [];
		for (const s of this.sources) {
			if (s.t === "wire") {
				// Circles around wire, repeated at several heights along its length
				const zSteps = [-50, -25, 0, 25, 50];
				for (const zOff of zSteps) {
					for (let i = 0; i < 8; i++) {
						const angle = (2 * PI * i) / 8;
						const r = 30 + (i % 3) * 15;
						starts.push(new V3D(s.x + r * cos(angle), s.y + r * sin(angle), (s.z || 0) + zOff));
					}
				}
			} else if (s.t === "loop") {
				// Field lines around loop, at a few radii/heights for a fuller 3D shape
				const rings = [
					{ r: (s.r || 40) * 1.5, z: 0 },
					{ r: (s.r || 40) * 2.2, z: 0 },
					{ r: (s.r || 40) * 1.2, z: (s.r || 40) * 0.6 },
				];
				for (const ring of rings) {
					for (let i = 0; i < 12; i++) {
						const angle = (2 * PI * i) / 12;
						starts.push(new V3D(s.x + ring.r * cos(angle), s.y + ring.r * sin(angle), (s.z || 0) + ring.z));
					}
				}
			} else if (s.t === "solenoid") {
				// Field lines around the solenoid coil, spread along its length
				const halfW = (s.w || 120) / 2;
				const radius = (s.h || 40) / 2;
				const xSteps = [-halfW * 0.8, -halfW * 0.3, halfW * 0.3, halfW * 0.8];
				for (const xOff of xSteps) {
					for (let i = 0; i < 10; i++) {
						const angle = (2 * PI * i) / 10;
						const r = radius * 1.5;
						starts.push(new V3D(s.x + xOff, s.y + r * cos(angle), (s.z || 0) + r * sin(angle)));
					}
				}
			}
		}

		starts.forEach(start => {
			const points = [new THREE.Vector3(start.x, start.y, start.z)];
			let curr = start.clone();

			for (let s = 0; s < 200; s++) {
				const b = this.B(curr);
				const m = b.len();
				if (m < 1e-6) break;

				const step = min(2, 10 / sqrt(m + 1));
				const dir = b.norm();
				curr = curr.add(dir.mul(step));

				// Check boundaries
				if (abs(curr.x) > 200 || abs(curr.y) > 200 || abs(curr.z) > 200) break;

				points.push(new THREE.Vector3(curr.x, curr.y, curr.z));
			}

			if (points.length > 1) {
				const geometry = new THREE.BufferGeometry().setFromPoints(points);
				const material = new THREE.LineBasicMaterial({
					color: 0x67e8f9,
					opacity: 0.6,
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

		if (this.showLines) this.build3DFieldLines();
	}

	clearIsosurface() {
		// No isosurface for magnetostatics
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
		const probeW = 280, probeH = 64, probeX = W3D - probeW - 16, probeY = 16;

		const point3D = screenTo3D(screenX, screenY, 0);
		if (!point3D) return;

		const p = new V3D(point3D.x, point3D.y, point3D.z);
		const b = this.B(p);

		const totalSources = this.sources.length;
		this.updateMeasurements([
			`${totalSources}`,
			`${b.len().toExponential(2)} T`
		]);
	}

	resize() {
		resize3D();
	}

	render(c, time) {
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
