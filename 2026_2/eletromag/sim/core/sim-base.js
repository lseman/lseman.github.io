// core/sim-base.js
export class Sim {
	constructor(name, icon) {
		this.name = name;
		this.icon = icon;
		this.sel = null;
		this.playing = false;
	}
	addSource(s) {}
	removeSource(s) {}
	clearSources() {}
	resize() {}
	buildControls(el) {}
	computeField(p) {}
	computeMag(p) {}
	render(c, time) {}
	onMouseDown(x, y) {}
	onMouseMove(x, y) {}
	onMouseUp() {}
	removeSelected() {}
	deltaTime(now) {
		const dt = this._lastFrame === undefined ? 0 : Math.min(0.05, Math.max(0, now - this._lastFrame));
		this._lastFrame = now;
		return dt;
	}
}
