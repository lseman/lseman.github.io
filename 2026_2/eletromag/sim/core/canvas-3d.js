// core/canvas-3d.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export let W3D, H3D, scene, camera, renderer, controls;
let raycaster, mouse;

export function init3D(canvasId) {
	const canvas = document.getElementById(canvasId);
	if (!canvas) return false;

	W3D = canvas.clientWidth || 800;
	H3D = canvas.clientHeight || 600;

	// Scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x0a0e17);

	// Camera
	const aspect = W3D / H3D;
	camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
	camera.position.set(0, 0, 200);

	// Renderer
	renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
	renderer.setSize(W3D, H3D);
	renderer.setPixelRatio(window.devicePixelRatio || 1);

	// Controls
	controls = new OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 0.05;
	controls.minDistance = 50;
	controls.maxDistance = 500;

	// Lighting
	const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
	scene.add(ambientLight);

	const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
	directionalLight.position.set(1, 1, 1);
	scene.add(directionalLight);

	// Raycaster for mouse interaction
	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();

	// Grid helper for reference
	const gridHelper = new THREE.GridHelper(300, 30, 0x334155, 0x1e293b);
	gridHelper.rotation.x = Math.PI / 2;
	gridHelper.position.z = -50;
	scene.add(gridHelper);

	return true;
}

export function resize3D() {
	if (!renderer || !camera) return;
	const canvas = renderer.domElement;
	const rect = canvas.getBoundingClientRect();
	W3D = rect.width || 800;
	H3D = rect.height || 600;
	camera.aspect = W3D / H3D;
	camera.updateProjectionMatrix();
	renderer.setSize(W3D, H3D);
}

export function getScene() { return scene; }
export function getCamera() { return camera; }
export function getRenderer() { return renderer; }
export function getControls() { return controls; }
export function getRaycaster() { return raycaster; }
export function getMouse() { return mouse; }

export function render3D() {
	if (renderer && scene && camera) {
		controls.update();
		renderer.render(scene, camera);
	}
}

export function screenTo3D(screenX, screenY, depth = 0) {
	if (!raycaster || !camera) return null;
	mouse.x = (screenX / W3D) * 2 - 1;
	mouse.y = -(screenY / H3D) * 2 + 1;
	raycaster.setFromCamera(mouse, camera);
	
	// Create a plane at the given depth for intersection
	const planeNormal = new THREE.Vector3(0, 0, 1);
	const planePos = new THREE.Vector3(0, 0, depth);
	const plane = new THREE.Plane(planeNormal, planeNormal.dot(planePos));
	const target = new THREE.Vector3();
	raycaster.ray.intersectPlane(plane, target);
	return target;
}

export function dispose3D() {
	if (renderer) {
		renderer.dispose();
		renderer = null;
	}
	scene = null;
	camera = null;
	controls = null;
}
