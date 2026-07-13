// core/sources.js
import { V } from './math.js';

export class Charge {
	constructor(x, y, q, positive) {
		this.pos = new V(x, y);
		// Keep the displayed polarity and the physical charge sign consistent.
		this.positive = positive ?? q >= 0;
		this.q = (this.positive ? 1 : -1) * Math.abs(q);
		this.r = 14;
	}
	draw(c, sel) {
		const grad = c.createRadialGradient(this.pos.x, this.pos.y, 0, this.pos.x, this.pos.y, this.r);
		if (this.positive) {
			grad.addColorStop(0, '#fca5a5');
			grad.addColorStop(1, '#dc2626');
		} else {
			grad.addColorStop(0, '#93c5fd');
			grad.addColorStop(1, '#2563eb');
		}
		c.beginPath();
		c.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
		c.fillStyle = grad;
		c.fill();
		c.strokeStyle = sel ? '#fbbf24' : 'rgba(255,255,255,0.3)';
		c.lineWidth = sel ? 2 : 1;
		c.stroke();
		c.fillStyle = '#fff';
		c.font = 'bold 14px sans-serif';
		c.textAlign = 'center';
		c.textBaseline = 'middle';
		c.fillText(this.positive ? '+' : '−', this.pos.x, this.pos.y);
		c.textAlign = 'start';
		c.textBaseline = 'alphabetic';
	}
}

export class Cur {
	constructor(p1, p2, I) {
		this.p1 = p1;
		this.p2 = p2;
		this.I = I;
	}
	draw(c) {
		c.beginPath();
		c.moveTo(this.p1.x, this.p1.y);
		c.lineTo(this.p2.x, this.p2.y);
		c.strokeStyle = '#fbbf24';
		c.lineWidth = 3;
		c.stroke();
		const m = this.p1.add(this.p2).mul(0.5),
			d = this.p2.sub(this.p1).norm(),
			p = new V(-d.y, d.x);
		c.beginPath();
		c.moveTo(m.add(d.mul(5)).add(p.mul(-5)).x, m.add(d.mul(5)).add(p.mul(-5)).y);
		c.lineTo(m.add(d.mul(5)).add(p.mul(5)).x, m.add(d.mul(5)).add(p.mul(5)).y);
		c.lineTo(m.sub(d.mul(5)).x, m.sub(d.mul(5)).y);
		c.closePath();
		c.fillStyle = '#fbbf24';
		c.fill();
	}
}
