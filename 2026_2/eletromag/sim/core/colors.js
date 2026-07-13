// core/colors.js
export function magColor(t, a, palette) {
	t = Math.max(0, Math.min(1, t));
	let r, g, b;
	if (palette === 'plasma' || palette === 'electric') {
		if (t < 0.25) {
			r = Math.floor(68 + (158 - 68) * (t / 0.25));
			g = Math.floor(1 + (217 - 1) * (t / 0.25));
			b = Math.floor(84 + (227 - 84) * (t / 0.25));
		} else if (t < 0.5) {
			const tt = (t - 0.25) / 0.25;
			r = Math.floor(158 + (227 - 158) * tt);
			g = Math.floor(217 + (222 - 217) * tt);
			b = Math.floor(227 + (135 - 227) * tt);
		} else if (t < 0.75) {
			const tt = (t - 0.5) / 0.25;
			r = Math.floor(227 + (253 - 227) * tt);
			g = Math.floor(135 + (231 - 135) * tt);
			b = Math.floor(135 + (77 - 135) * tt);
		} else {
			const tt = (t - 0.75) / 0.25;
			r = Math.floor(253 + (254 - 253) * tt);
			g = Math.floor(231 + (231 - 231) * tt);
			b = Math.floor(77 + (10 - 77) * tt);
		}
	} else if (palette === 'hot') {
		if (t < 0.33) {
			r = Math.floor(0 + (255 * (t / 0.33)));
			g = 0;
			b = Math.floor(255 * (1 - t / 0.33));
		} else if (t < 0.66) {
			const tt = (t - 0.33) / 0.33;
			r = 255;
			g = Math.floor(255 * tt);
			b = 0;
		} else {
			const tt = (t - 0.66) / 0.34;
			r = 255;
			g = 255;
			b = Math.floor(255 * tt);
		}
	} else {
		r = Math.floor(255 * t);
		g = Math.floor(255 * t);
		b = Math.floor(255 * t);
	}
	return `rgba(${r},${g},${b},${a || 1})`;
}

export function fieldColor(val, maxVal, palette) {
	const t = Math.abs(val) / (maxVal || 1);
	return magColor(t, 1, palette || 'electric');
}
