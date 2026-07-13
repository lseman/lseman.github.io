// core/math.js
export const PI = Math.PI;
export const sin = Math.sin;
export const cos = Math.cos;
export const sqrt = Math.sqrt;
export const abs = Math.abs;
export const min = Math.min;
export const max = Math.max;
export const floor = Math.floor;
export const log = Math.log;
export const EPS0 = 8.8541878128e-12;
export const MU0 = 1.25663706212e-6;
export const C0 = 299792458;
export const K_E = 8.9875517923e9;

export class V {
	constructor(x, y) {
		this.x = x || 0;
		this.y = y || 0;
	}
	add(v) { return new V(this.x + v.x, this.y + v.y); }
	sub(v) { return new V(this.x - v.x, this.y - v.y); }
	mul(s) { return new V(this.x * s, this.y * s); }
	dot(v) { return this.x * v.x + this.y * v.y; }
	cross(v) { return this.x * v.y - this.y * v.x; }
	norm() {
		const l = sqrt(this.x * this.x + this.y * this.y);
		return l > 0 ? new V(this.x / l, this.y / l) : new V(0, 0);
	}
	rotate(a) {
		const c = cos(a), s = sin(a);
		return new V(this.x * c - this.y * s, this.x * s + this.y * c);
	}
	distTo(v) { return sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2); }
	clone() { return new V(this.x, this.y); }
	neg() { return new V(-this.x, -this.y); }
	len() { return sqrt(this.x * this.x + this.y * this.y); }
}
