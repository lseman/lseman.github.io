/* --------------------------------------------------------------------------
   Tetris — shared constants, geometry, and drawing utilities
   -------------------------------------------------------------------------- */
const TETRIS = Object.freeze({
	SHAPES: [
		[
			[0, 0],
			[1, 0],
			[2, 0],
			[3, 0],
		], // I
		[
			[0, 0],
			[1, 0],
			[0, 1],
			[1, 1],
		], // O
		[
			[1, 0],
			[0, 1],
			[1, 1],
			[2, 1],
		], // S
		[
			[1, 0],
			[2, 0],
			[0, 1],
			[1, 1],
		], // T
		[
			[0, 0],
			[1, 0],
			[1, 1],
			[2, 1],
		], // Z
		[
			[0, 0],
			[0, 1],
			[1, 1],
			[2, 1],
		], // J
		[
			[2, 0],
			[0, 1],
			[1, 1],
			[2, 1],
		], // L
	],

	COLORS: ["#2dd4bf", "#a78bfa", "#fbbf24", "#67e8f9", "#f472b6"],

	COLORS_EXTENDED: [
		"#2dd4bf",
		"#a78bfa",
		"#fbbf24",
		"#67e8f9",
		"#f472b6",
		"#86efac",
		"#fb923c",
	],

	/** Normalize cells so min-x and min-y are 0. */
	normalize(cells) {
		const minX = Math.min(...cells.map(([x]) => x));
		const minY = Math.min(...cells.map(([, y]) => y));
		return cells.map(([x, y]) => [x - minX, y - minY]);
	},

	/** Rotate cells 90° clockwise. */
	rotate(cells) {
		return this.normalize(cells.map(([x, y]) => [y, -x]));
	},

	/** Get shape bounding dimensions. */
	shapeSize(cells) {
		return {
			width: Math.max(...cells.map(([x]) => x)) + 1,
			height: Math.max(...cells.map(([, y]) => y)) + 1,
		};
	},

	/** Convert hex color to rgba string. */
	hexToRgba(hex, alpha) {
		const value = hex.replace("#", "");
		const r = parseInt(value.slice(0, 2), 16);
		const g = parseInt(value.slice(2, 4), 16);
		const b = parseInt(value.slice(4, 6), 16);
		return `rgba(${r},${g},${b},${alpha})`;
	},

	/** Draw a rounded rectangle on the given 2D context. */
	roundedRect(ctx, x, y, width, height, radius) {
		const r = Math.min(radius, width / 2, height / 2);
		ctx.beginPath();
		ctx.moveTo(x + r, y);
		ctx.lineTo(x + width - r, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + r);
		ctx.lineTo(x + width, y + height - r);
		ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
		ctx.lineTo(x + r, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - r);
		ctx.lineTo(x, y + r);
		ctx.quadraticCurveTo(x, y, x + r, y);
		ctx.closePath();
	},

	/** Draw a single tetris cell (rounded rect with fill + stroke). */
	drawCell(ctx, col, row, color, options = {}) {
		const {
			gap: g = Math.max(2, options.block * 0.08),
			block = 28,
			offsetX = 0,
			offsetY = 0,
			label = "",
			labelColor = "rgba(255,255,255,0.78)",
			labelFont = '600 14px "IBM Plex Mono", monospace',
			labelSlice = 3,
		} = options;
		if (row < 0) return;
		const x = offsetX + col * block + g;
		const y = offsetY + row * block + g;
		const size = block - g * 2;
		TETRIS.roundedRect(ctx, x, y, size, size, Math.max(5, block * 0.14));
		ctx.fillStyle = TETRIS.hexToRgba(color, 0.52);
		ctx.fill();
		ctx.strokeStyle = TETRIS.hexToRgba(color, 0.95);
		ctx.lineWidth = 1;
		ctx.stroke();

		if (label && block > 24) {
			ctx.fillStyle = labelColor;
			ctx.font = labelFont;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(label.slice(0, labelSlice), x + size / 2, y + size / 2);
		}
	},

	/** Pick a random shape, randomly rotated. */
	pickPiece() {
		const shape =
			TETRIS.SHAPES[Math.floor(Math.random() * TETRIS.SHAPES.length)];
		const normalized = TETRIS.normalize(shape);
		const rotations = Math.floor(Math.random() * 4);
		let cells = normalized;
		for (let i = 0; i < rotations; i++) cells = TETRIS.rotate(cells);
		return cells;
	},

	/** Pick a random color from the given palette. */
	pickColor(palette = TETRIS.COLORS) {
		return palette[Math.floor(Math.random() * palette.length)];
	},
});

/* --------------------------------------------------------------------------
   Hero topic Tetris — animated board with term labels
   -------------------------------------------------------------------------- */
(function initTopicTetris() {
	const canvas = document.getElementById("topic-tetris");
	if (!canvas) return;

	const fallbackTerms = [
		"optimization",
		"forecasting",
		"routing",
		"branch-price",
		"time series",
		"machine learning",
		"decomposition",
		"neural models",
		"decision systems",
		"column generation",
		"teaching tools",
		"open source",
	];

	let terms = fallbackTerms.slice();
	window.__updateHeroTetrisTerms = (nextTerms) => {
		const cleaned = Array.from(
			new Set(
				(nextTerms || [])
					.map((term) =>
						String(term || "")
							.trim()
							.toLowerCase(),
					)
					.filter((term) => term.length >= 3),
			),
		).slice(0, 28);
		if (cleaned.length) terms = cleaned;
	};

	const COLS = 10;
	const ROWS = 18;

	const ctx = canvas.getContext("2d");
	let board;
	let current;
	let raf;
	let lastStep = 0;
	let dropMs = 240;
	let W = 0;
	let H = 0;
	let block = 28;
	let offsetX = 0;
	let offsetY = 0;

	function randomTerm() {
		return terms[Math.floor(Math.random() * terms.length)] || fallbackTerms[0];
	}

	function randomPiece() {
		const cells = TETRIS.pickPiece();
		const size = TETRIS.shapeSize(cells);
		return {
			cells,
			col: Math.floor(Math.random() * Math.max(1, COLS - size.width + 1)),
			row: -size.height,
			term: randomTerm(),
			color: TETRIS.pickColor(),
		};
	}

	function resetBoard() {
		board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
		dropMs = 240;
		current = randomPiece();
	}

	function resize() {
		const rect = canvas.getBoundingClientRect();
		if (rect.width < 16 || rect.height < 16) return false;
		const ratio = Math.min(window.devicePixelRatio || 1, 2);
		W = rect.width;
		H = rect.height;
		canvas.width = Math.round(W * ratio);
		canvas.height = Math.round(H * ratio);
		ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
		block = Math.floor(Math.min(W / COLS, H / ROWS));
		offsetX = Math.round((W - block * COLS) / 2);
		offsetY = Math.round((H - block * ROWS) / 2);
		return true;
	}

	function isValid(
		piece,
		col = piece.col,
		row = piece.row,
		cells = piece.cells,
	) {
		return cells.every(([dx, dy]) => {
			const x = col + dx;
			const y = row + dy;
			if (x < 0 || x >= COLS || y >= ROWS) return false;
			return y < 0 || !board[y][x];
		});
	}

	function maybeJostlePiece() {
		if (!current) return;
		if (Math.random() < 0.42) {
			const nextCol = current.col + (Math.random() < 0.5 ? -1 : 1);
			if (isValid(current, nextCol)) current.col = nextCol;
		}
		if (Math.random() < 0.18) {
			const rotated = TETRIS.rotate(current.cells);
			if (isValid(current, current.col, current.row, rotated))
				current.cells = rotated;
		}
	}

	function clearLines() {
		const remaining = board.filter((row) => !row.every(Boolean));
		const cleared = ROWS - remaining.length;
		while (remaining.length < ROWS) remaining.unshift(Array(COLS).fill(null));
		board = remaining;
		if (cleared) dropMs = Math.max(140, dropMs - cleared * 14);
	}

	function lockPiece() {
		let died = false;
		current.cells.forEach(([dx, dy], index) => {
			const x = current.col + dx;
			const y = current.row + dy;
			if (y < 0) {
				died = true;
				return;
			}
			board[y][x] = {
				color: current.color,
				label: index === 0 ? current.term : "",
			};
		});
		clearLines();
		current = randomPiece();
		if (died || !isValid(current)) resetBoard();
	}

	function step() {
		maybeJostlePiece();
		if (isValid(current, current.col, current.row + 1)) current.row += 1;
		else lockPiece();
	}

	function drawGrid() {
		const boardWidth = COLS * block;
		const boardHeight = ROWS * block;
		ctx.strokeStyle = "rgba(255,255,255,0.06)";
		ctx.lineWidth = 1;
		for (let col = 0; col <= COLS; col++) {
			const x = offsetX + col * block;
			ctx.beginPath();
			ctx.moveTo(x, offsetY);
			ctx.lineTo(x, offsetY + boardHeight);
			ctx.stroke();
		}
		for (let row = 0; row <= ROWS; row++) {
			const y = offsetY + row * block;
			ctx.beginPath();
			ctx.moveTo(offsetX, y);
			ctx.lineTo(offsetX + boardWidth, y);
			ctx.stroke();
		}
	}

	function drawActiveLabel(piece) {
		const visibleCells = piece.cells
			.map(([dx, dy]) => [piece.col + dx, piece.row + dy])
			.filter(([, row]) => row >= 0);
		if (!visibleCells.length) return;
		const minCol = Math.min(...visibleCells.map(([col]) => col));
		const maxCol = Math.max(...visibleCells.map(([col]) => col));
		const minRow = Math.min(...visibleCells.map(([, row]) => row));
		const label =
			piece.term.length > 18 ? `${piece.term.slice(0, 16)}...` : piece.term;
		ctx.font = `600 ${Math.max(9, block * 0.29)}px "IBM Plex Mono", monospace`;
		const labelWidth = Math.min(
			block * COLS,
			Math.max(
				(maxCol - minCol + 1) * block,
				ctx.measureText(label).width + block * 0.8,
			),
		);
		const x = Math.max(
			offsetX,
			Math.min(offsetX + COLS * block - labelWidth, offsetX + minCol * block),
		);
		const y = Math.max(offsetY + 2, offsetY + minRow * block - block * 0.58);

		TETRIS.roundedRect(ctx, x, y, labelWidth, block * 0.48, block * 0.2);
		ctx.fillStyle = "rgba(8,9,15,0.76)";
		ctx.fill();
		ctx.strokeStyle = TETRIS.hexToRgba(piece.color, 0.72);
		ctx.stroke();
		ctx.fillStyle = "rgba(255,255,255,0.86)";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(label, x + labelWidth / 2, y + block * 0.24);
	}

	function draw() {
		ctx.clearRect(0, 0, W, H);
		drawGrid();
		board.forEach((row, y) => {
			row.forEach((cell, x) => {
				if (cell)
					TETRIS.drawCell(ctx, x, y, cell.color, {
						block,
						offsetX,
						offsetY,
						label: cell.label,
						labelColor: "rgba(255,255,255,0.78)",
						labelFont: `${Math.max(6, block * 0.2)}px "IBM Plex Mono", monospace`,
						labelSlice: 3,
					});
			});
		});
		if (current) {
			current.cells.forEach(([dx, dy]) => {
				TETRIS.drawCell(
					ctx,
					current.col + dx,
					current.row + dy,
					current.color,
					{ block, offsetX, offsetY },
				);
			});
			drawActiveLabel(current);
		}
	}

	function loop(timestamp) {
		if (!lastStep) lastStep = timestamp;
		if (timestamp - lastStep > dropMs) {
			step();
			lastStep = timestamp;
		}
		draw();
		raf = requestAnimationFrame(loop);
	}

	let started = false;

	function start() {
		if (raf || !resize()) return;
		if (!started) {
			resetBoard();
			started = true;
		}
		lastStep = 0;
		raf = requestAnimationFrame(loop);
	}

	function stop() {
		if (!raf) return;
		cancelAnimationFrame(raf);
		raf = null;
	}

	if ("IntersectionObserver" in window) {
		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) start();
			else stop();
		});
		observer.observe(canvas);
	} else {
		start();
	}

	window.addEventListener(
		"resize",
		() => {
			stop();
			if (!resize()) return;
			lastStep = 0;
			raf = requestAnimationFrame(loop);
		},
		{ passive: true },
	);
})();

/* --------------------------------------------------------------------------
   Footer tetris — static "already played" board drawn once
   -------------------------------------------------------------------------- */
(function initFooterTetris() {
	const canvas = document.getElementById("footer-tetris");
	if (!canvas) return;

	function draw() {
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const W = canvas.offsetWidth;
		const H = canvas.offsetHeight;
		if (W < 10 || H < 10) return;
		canvas.width = Math.round(W * dpr);
		canvas.height = Math.round(H * dpr);
		const ctx = canvas.getContext("2d");
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		const BLOCK = 28;
		const COLS = Math.floor(W / BLOCK);
		const ROWS = Math.floor(H / BLOCK);
		if (COLS < 2 || ROWS < 2) return;

		const board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

		let seed = 0x9e3779b9;
		function rand() {
			seed ^= seed << 13;
			seed ^= seed >> 17;
			seed ^= seed << 5;
			return (seed >>> 0) / 0xffffffff;
		}

		function dropPiece(cells, color, startCol) {
			let row = -1;
			while (true) {
				const next = row + 1;
				const fits = cells.every(([dx, dy]) => {
					const x = startCol + dx,
						y = next + dy;
					return x >= 0 && x < COLS && y < ROWS && (y < 0 || !board[y][x]);
				});
				if (!fits) break;
				row = next;
			}
			if (row < 0) return;
			cells.forEach(([dx, dy]) => {
				const x = startCol + dx,
					y = row + dy;
				if (y >= 0 && y < ROWS && x >= 0 && x < COLS) board[y][x] = color;
			});
		}

		const attempts = COLS * ROWS * 4;
		for (let i = 0; i < attempts; i++) {
			let cells = TETRIS.normalize(TETRIS.pickPiece());
			const rotations = Math.floor(rand() * 4);
			for (let r = 0; r < rotations; r++) cells = TETRIS.rotate(cells);
			const maxW = TETRIS.shapeSize(cells).width;
			const col = Math.floor(rand() * Math.max(1, COLS - maxW + 1));
			const color = TETRIS.pickColor(TETRIS.COLORS_EXTENDED);
			dropPiece(cells, color, col);
		}

		board.forEach((row, ry) => {
			row.forEach((color, cx) => {
				if (!color) return;
				const gap = Math.max(2, BLOCK * 0.08);
				const x = cx * BLOCK + gap;
				const y = ry * BLOCK + gap;
				const sz = BLOCK - gap * 2;
				const r = Math.max(4, BLOCK * 0.14);

				TETRIS.roundedRect(ctx, x, y, sz, sz, r);
				ctx.fillStyle = TETRIS.hexToRgba(color, 0.55);
				ctx.fill();
				ctx.strokeStyle = TETRIS.hexToRgba(color, 0.9);
				ctx.lineWidth = 1;
				ctx.stroke();

				ctx.beginPath();
				ctx.moveTo(x + r + 2, y + 2);
				ctx.lineTo(x + sz - r - 2, y + 2);
				ctx.strokeStyle = "rgba(255,255,255,0.15)";
				ctx.lineWidth = 1;
				ctx.stroke();
			});
		});
	}

	draw();
	window.addEventListener("resize", draw, { passive: true });
})();

/* --------------------------------------------------------------------------
   Konami Code Easter Egg — Tetris cascade overlay
   -------------------------------------------------------------------------- */
(function initKonamiEasterEgg() {
	const CODE = [
		"ArrowUp",
		"ArrowUp",
		"ArrowDown",
		"ArrowDown",
		"ArrowLeft",
		"ArrowRight",
		"ArrowLeft",
		"ArrowRight",
		"b",
		"a",
	];
	let idx = 0;
	let triggered = false;

	function handleKey(e) {
		if (e.key !== CODE[idx]) {
			idx = 0;
			if (e.key === CODE[0]) idx = 1;
			return;
		}
		idx++;
		if (idx < CODE.length) return;

		idx = 0;
		if (triggered) return;
		triggered = true;

		const pieces = [];
		const count = 30;
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		const blockSize = 22;

		for (let i = 0; i < count; i++) {
			const shape = TETRIS.pickPiece();
			const color = TETRIS.pickColor(TETRIS.COLORS_EXTENDED);
			const size = TETRIS.shapeSize(shape);
			pieces.push({
				x: Math.random() * (vw - size.width * blockSize),
				y: -size.height * blockSize - Math.random() * vh * 0.8,
				vy: 2 + Math.random() * 4,
				vx: (Math.random() - 0.5) * 2,
				rotation: Math.random() * Math.PI * 2,
				rotSpeed: (Math.random() - 0.5) * 0.06,
				shape,
				color,
				blockSize,
				delay: i * 60,
				age: 0,
				opacity: 1,
			});
		}

		const overlay = document.createElement("div");
		overlay.style.cssText =
			"position:fixed;inset:0;background:rgba(8,9,15,0.88);z-index:9999;pointer-events:none;opacity:0;transition:opacity 0.4s ease;overflow:hidden;";
		document.body.appendChild(overlay);
		requestAnimationFrame(() => (overlay.style.opacity = "1"));

		const canvas = document.createElement("canvas");
		canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
		overlay.appendChild(canvas);
		const ctx = canvas.getContext("2d");

		function resizeCanvas() {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		}
		resizeCanvas();
		window.addEventListener("resize", resizeCanvas);

		const note = document.createElement("div");
		note.textContent = "✨ Konami Code!";
		note.style.cssText =
			"position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-family:Pixelify Sans,monospace;font-size:2.5rem;color:#a78bfa;text-shadow:0 0 20px #a78bfa;z-index:10000;pointer-events:none;opacity:0;transition:opacity 0.3s ease;";
		document.body.appendChild(note);
		requestAnimationFrame(() => (note.style.opacity = "1"));
		setTimeout(() => (note.style.opacity = "0"), 800);

		let startTime = null;
		function animate(time) {
			if (!startTime) startTime = time;
			const elapsed = time - startTime;

			if (elapsed > 12000) {
				overlay.style.opacity = "0";
				note.style.opacity = "0";
				window.removeEventListener("resize", resizeCanvas);
				overlay.remove();
				note.remove();
				triggered = false;
				return;
			}

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			pieces.forEach((p) => {
				p.age = Math.max(0, elapsed - p.delay);
				if (p.age <= 0) return;

				p.x += p.vx;
				p.y += p.vy;
				p.vy += 0.05;
				p.rotation += p.rotSpeed;

				if (p.y > vh + 100) {
					p.opacity -= 0.02;
				}
				if (p.opacity <= 0) return;

				ctx.save();
				ctx.globalAlpha = Math.max(0, p.opacity);
				ctx.translate(
					p.x + (p.shape.length * p.blockSize) / 2,
					p.y + p.blockSize,
				);
				ctx.rotate(p.rotation);

				ctx.fillStyle = p.color;
				ctx.shadowColor = p.color;
				ctx.shadowBlur = 8;

				p.shape.forEach(([sx, sy]) => {
					ctx.fillRect(
						sx * p.blockSize - p.blockSize / 2,
						sy * p.blockSize - p.blockSize / 2,
						p.blockSize - 2,
						p.blockSize - 2,
					);
				});

				ctx.restore();
			});

			requestAnimationFrame(animate);
		}

		requestAnimationFrame(animate);

		setTimeout(() => {
			window.removeEventListener("resize", resizeCanvas);
			overlay.remove();
			note.remove();
			triggered = false;
		}, 12000);
	}

	window.addEventListener("keydown", handleKey);
})();
