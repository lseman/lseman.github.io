// core/canvas.js
export let W, H, dpr;
export const canvas = document.getElementById('c');
export const ctx = canvas ? canvas.getContext('2d') : null;
export const S = { mouse: {x: 0, y: 0}, drag: null, pan: null, zoom: 1, md: false, panS: null, pan0: null };

export function resize() {
	const w = document.getElementById('canvas-wrap');
	if (!w) return;
	const cs = getComputedStyle(w);
	const r = w.getBoundingClientRect();
	const cw = r.width || parseInt(cs.width) || 0;
	const ch = r.height || parseInt(cs.height) || 0;
	W = cw > 0 ? cw : (window.innerWidth - 300);
	H = ch > 0 ? ch : (window.innerHeight - 45);
	if (W < 2 || H < 2) {
		W = window.innerWidth - 300;
		H = window.innerHeight - 45;
	}
	void w.offsetHeight;
	const dp = window.devicePixelRatio || 1;
	dpr = dp;
	canvas.width = W * dp;
	canvas.height = H * dp;
	canvas.style.width = W + 'px';
	canvas.style.height = H + 'px';
	ctx.scale(dp, dp);
}
