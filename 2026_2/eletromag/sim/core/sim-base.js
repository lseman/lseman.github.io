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
	measurementPanel(title, rows = []) {
		return `<section class="measurement-panel" data-measurements><h4>${title}</h4>${rows.map(([label, value], i) => `<div><span>${label}</span><output data-measure="${i}">${value}</output></div>`).join("")}</section>`;
	}
	updateMeasurements(values) {
		const panel = document.querySelector("[data-measurements]");
		if (!panel) return;
		values.forEach((value, i) => {
			const output = panel.querySelector(`[data-measure="${i}"]`);
			if (output) output.textContent = value;
		});
	}
}
