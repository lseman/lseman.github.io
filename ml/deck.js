(() => {
	function readVar(name, fallback) {
		var value = getComputedStyle(document.documentElement)
			.getPropertyValue(name)
			.trim();
		return value || fallback;
	}

	function theme() {
		return {
			blue: readVar("--blue", "#5aa9ff"),
			vio: readVar("--vio", "#b794ff"),
			grn: readVar("--grn", "#4fd09a"),
			red: readVar("--red", "#ff7a7a"),
			gold: readVar("--gold", "#ffd166"),
			text: readVar("--text", "#e9edf6"),
			muted: readVar("--muted", "#8b97b4"),
			faint: readVar("--faint", "#5a678a"),
			surf: readVar("--surf", "#142144"),
		};
	}

	function _svg(tag, attrs) {
		var node = document.createElementNS("http://www.w3.org/2000/svg", tag);
		for (var key in attrs) {
			node.setAttribute(key, attrs[key]);
		}
		return node;
	}
	function _div(cls) {
		var d = document.createElement("div");
		d.className = cls;
		return d;
	}

	/* ====== Theme toggle ====== */
	(() => {
		var html = document.documentElement;
		var btn = document.getElementById("theme-toggle");
		var saved = null;
		try {
			saved = localStorage.getItem("theme");
		} catch (e) {}
		if (saved === "light") html.setAttribute("data-theme", "light");
		if (btn) {
			btn.addEventListener("click", () => {
				var dark = html.getAttribute("data-theme") !== "light";
				if (dark) {
					html.setAttribute("data-theme", "light");
					try {
						localStorage.setItem("theme", "light");
					} catch (e) {}
				} else {
					html.removeAttribute("data-theme");
					try {
						localStorage.setItem("theme", "dark");
					} catch (e) {}
				}
			});
		}
	})();

	var matrixAnimationInstalled = false;

	function installMatrixAnimation() {
		if (matrixAnimationInstalled) return;
		var style = document.createElement("style");
		style.textContent =
			"@keyframes mxin{from{opacity:0}to{opacity:var(--o,.5)}}";
		document.head.appendChild(style);
		matrixAnimationInstalled = true;
	}

	function buildAll() {
		installMatrixAnimation();
	}

	/* ====== Search overlay ====== */
	function setupSearch() {
		var overlay = document.getElementById("search-overlay");
		if (!overlay) return;
		var input = document.getElementById("search-input");
		var results = document.getElementById("search-results");
		var focusedIdx = -1;

		// Gather all searchable items
		var items = [];
		document.querySelectorAll(".slide").forEach((slide, idx) => {
			var sec = slide.getAttribute("data-sec") || "Slide " + (idx + 1);
			var headings = slide.querySelectorAll("h1.title, h2.title, h3.title");
			var title = "";
			headings.forEach((h) => {
				title = h.textContent.trim();
			});
			if (!title) title = sec;
			items.push({ index: idx, title: title, sec: sec });
		});

		function renderList(query) {
			if (!results) return;
			while (results.firstChild) results.removeChild(results.firstChild);
			if (!query || query.length < 2) {
				var empty = document.createElement("div");
				empty.className = "search-empty";
				empty.textContent = "Type at least 2 characters";
				results.appendChild(empty);
				focusedIdx = -1;
				return;
			}
			var q = query.toLowerCase();
			var matches = items.filter(
				(item) =>
					item.title.toLowerCase().indexOf(q) !== -1 ||
					item.sec.toLowerCase().indexOf(q) !== -1,
			);
			if (matches.length === 0) {
				var noMatch = document.createElement("div");
				noMatch.className = "search-empty";
				noMatch.textContent = "No matches";
				results.appendChild(noMatch);
				focusedIdx = -1;
				return;
			}
			matches.forEach((item) => {
				var div = document.createElement("div");
				div.className = "search-item";
				var titleDiv = document.createElement("div");
				titleDiv.className = "s-title";
				titleDiv.textContent = item.title;
				var secDiv = document.createElement("div");
				secDiv.className = "s-sec";
				secDiv.textContent = item.sec;
				div.appendChild(titleDiv);
				div.appendChild(secDiv);
				div.addEventListener("click", () => {
					if (window.slideDeck) window.slideDeck.show(item.index);
					overlay.classList.remove("open");
				});
				results.appendChild(div);
			});
			focusedIdx = -1;
		}

		function openSearch() {
			overlay.classList.add("open");
			setTimeout(() => {
				input.value = "";
				input.focus();
			}, 50);
			renderList("");
			var evt = new Event("search-open");
			document.dispatchEvent(evt);
		}

		function closeSearch() {
			overlay.classList.remove("open");
			var evt = new Event("search-close");
			document.dispatchEvent(evt);
		}

		// Keyboard
		document.addEventListener("keydown", (e) => {
			// Ctrl+K toggle search - must be at top before any returns
			if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
				e.preventDefault();
				e.stopPropagation();
				if (overlay.classList.contains("open")) {
					closeSearch();
				} else {
					openSearch();
				}
				return;
			}
			if (!overlay || !overlay.classList.contains("open")) return;
			if (e.key === "Escape") {
				closeSearch();
				return;
			}
			if (e.key === "ArrowDown") {
				e.preventDefault();
				var all = results.querySelectorAll(".search-item");
				if (all.length === 0) return;
				focusedIdx = Math.min(focusedIdx + 1, all.length - 1);
				all.forEach((el, i) => {
					el.classList.toggle("focused", i === focusedIdx);
				});
				if (all[focusedIdx])
					all[focusedIdx].scrollIntoView({ block: "nearest" });
				return;
			}
			if (e.key === "ArrowUp") {
				e.preventDefault();
				if (focusedIdx <= 0) return;
				focusedIdx--;
				var all2 = results.querySelectorAll(".search-item");
				all2.forEach((el, i) => {
					el.classList.toggle("focused", i === focusedIdx);
				});
				if (all2[focusedIdx])
					all2[focusedIdx].scrollIntoView({ block: "nearest" });
				return;
			}
			if (e.key === "Enter" && focusedIdx >= 0) {
				var all3 = results.querySelectorAll(".search-item");
				if (all3[focusedIdx]) all3[focusedIdx].click();
				return;
			}
		});

		if (input) {
			input.addEventListener("input", () => {
				renderList(input.value);
			});
		}

		// Click outside to close
		overlay.addEventListener("click", (e) => {
			if (e.target === overlay) closeSearch();
		});
	}

	function setupNotes() {
		var overlay = document.getElementById("notes-overlay");
		if (!overlay) return;

		function updateNotes() {
			var notesBody = overlay.querySelector(".notes-body");
			var currentEl = overlay.querySelector(".notes-current");
			if (!notesBody) return;
			notesBody.textContent = "";
			var slides = document.querySelectorAll(".slide.active");
			for (var i = 0; i < slides.length; i++) {
				var el = slides[i].querySelector("[data-notes]");
				if (el) {
					notesBody.textContent = el.getAttribute("data-notes");
					break;
				}
			}
			if (currentEl)
				currentEl.textContent =
					"Slide " +
					(window.slideDeck ? window.slideDeck.index() + 1 : "?") +
					" / " +
					(window.slideDeck ? window.slideDeck.count() : "?");
		}

		function toggle() {
			overlay.classList.toggle("open");
			if (overlay.classList.contains("open")) updateNotes();
		}

		overlay.querySelector(".close-btn")?.addEventListener("click", toggle);
		document.addEventListener("keydown", (e) => {
			if (e.key === "s" || e.key === "S") {
				if (e.metaKey || e.altKey || e.ctrlKey) return;
				if (e.target && e.target.closest("input, textarea, select")) return;
				toggle();
			}
		});

		// Update notes when navigating slides if overlay is open
		var origShow = window.slideDeck ? window.slideDeck.show : null;
		if (origShow) {
			window.slideDeck.show = (idx) => {
				origShow(idx);
				if (overlay.classList.contains("open")) updateNotes();
			};
		}
	}

	function setupSearchOverlay() {
		var overlay = document.getElementById("search-overlay");
		if (!overlay) {
			overlay = document.createElement("div");
			overlay.id = "search-overlay";
			overlay.className = "search-overlay";
			document.body.appendChild(overlay);
		}
		var box = _div("search-box");
		var wrap = _div("search-input-wrap");
		wrap.appendChild(
			_svg(
				"svg",
				{
					viewBox: "0 0 24 24",
					fill: "none",
					"stroke-width": "2",
					"stroke-linecap": "round",
				},
				[
					_svg("circle", { cx: "11", cy: "11", r: "8" }),
					_svg("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" }),
				],
			),
		);
		var inp = document.createElement("input");
		inp.id = "search-input";
		inp.type = "text";
		inp.placeholder = "Search slides...";
		inp.autocomplete = "off";
		wrap.appendChild(inp);
		box.appendChild(wrap);
		var res = document.createElement("div");
		res.id = "search-results";
		res.className = "search-results";
		box.appendChild(res);
		var hint = _div("search-hint");
		var h1 = document.createElement("span");
		var k1 = document.createElement("kbd");
		k1.textContent = "↑";
		var k2 = document.createElement("kbd");
		k2.textContent = "↓";
		var n1 = document.createTextNode(" navigate");
		h1.appendChild(k1);
		h1.appendChild(k2);
		h1.appendChild(n1);
		var h2 = document.createElement("span");
		var k3 = document.createElement("kbd");
		k3.textContent = "↵";
		var n2 = document.createTextNode(" jump");
		h2.appendChild(k3);
		h2.appendChild(n2);
		var h3 = document.createElement("span");
		var k4 = document.createElement("kbd");
		k4.textContent = "Esc";
		var n3 = document.createTextNode(" close");
		h3.appendChild(k4);
		h3.appendChild(n3);
		hint.appendChild(h1);
		hint.appendChild(h2);
		hint.appendChild(h3);
		box.appendChild(hint);
		overlay.appendChild(box);
		setupSearch();
	}

	function setupSwitches() {
		document.querySelectorAll(".switch[data-switch]").forEach((control) => {
			var group = control.getAttribute("data-switch");
			var buttons = Array.prototype.slice.call(
				control.querySelectorAll("[data-view]"),
			);
			if (!group || !buttons.length) return;

			function setView(view) {
				buttons.forEach((button) => {
					var on = button.getAttribute("data-view") === view;
					button.classList.toggle("on", on);
					button.setAttribute("aria-selected", on ? "true" : "false");
				});

				document.querySelectorAll("[data-panel]").forEach((panel) => {
					var key = panel.getAttribute("data-panel");
					if (!key || key.indexOf(group + ":") !== 0) return;
					panel.classList.toggle("show", key === group + ":" + view);
				});

				document.querySelectorAll("[data-show-when]").forEach((node) => {
					var expr = node.getAttribute("data-show-when");
					if (!expr || expr.indexOf(group + ":") !== 0) return;
					node.hidden = expr !== group + ":" + view;
				});
			}

			buttons.forEach((button) => {
				button.addEventListener("click", () => {
					setView(button.getAttribute("data-view"));
				});
			});

			var start = control.querySelector("[data-view].on") || buttons[0];
			setView(start.getAttribute("data-view"));
		});
	}

	function setupSlideFooters(slides) {
		var total = slides.length;
		slides.forEach((slide, index) => {
			var dots = slide.querySelector("[data-dots]");
			if (dots && !dots.dataset.ready) {
				for (var k = 0; k < total; k++) {
					var dot = document.createElement("span");
					if (k === index) dot.className = "on";
					dots.appendChild(dot);
				}
				dots.dataset.ready = "true";
			}
			var num = slide.querySelector("[data-num]");
			if (num) {
				num.textContent =
					String(index + 1).padStart(2, "0") +
					" / " +
					String(total).padStart(2, "0");
			}
		});
	}

	function setupDeck() {
		var slides = Array.prototype.slice.call(
			document.querySelectorAll(".slide"),
		);
		if (!slides.length) return;

		setupSlideFooters(slides);

		var total = slides.length;
		var index = 0;
		var progressTrack = document.getElementById("progress");
		var progressBar = document.getElementById("bar") || progressTrack;
		var current = document.getElementById("cur");
		var totalEl = document.getElementById("tot");
		var hint = document.getElementById("hint");
		var hinted = false;

		if (totalEl) {
			totalEl.textContent = String(total).padStart(2, "0");
		}
		if (
			window.matchMedia &&
			window.matchMedia("(prefers-reduced-motion:reduce)").matches
		) {
			document.body.classList.add("reduce");
		}

		function show(nextIndex) {
			index = Math.max(0, Math.min(total - 1, nextIndex));
			slides.forEach((slide, slideIndex) => {
				slide.classList.toggle("active", slideIndex === index);
			});
			if (progressBar) {
				progressBar.style.width = ((index + 1) / total) * 100 + "%";
			}
			if (current) {
				current.textContent = String(index + 1).padStart(2, "0");
			}
			if (location.hash !== "#" + (index + 1)) {
				history.replaceState(null, "", "#" + (index + 1));
			}
			if (hint && !hinted && index > 0) {
				hint.classList.add("gone");
				hinted = true;
			}
		}

		function next() {
			show(index + 1);
		}
		function prev() {
			show(index - 1);
		}

		window.slideDeck = {
			show: show,
			next: next,
			prev: prev,
			count: () => total,
			index: () => index,
		};

		document.addEventListener("keydown", (event) => {
			if (event.metaKey || event.altKey) return;
			if (event.ctrlKey && !/^[kKfF]$/.test(event.key)) return;
			if (
				event.target &&
				event.target.closest(
					"input, textarea, select, button, a, [contenteditable='true']",
				)
			)
				return;
			switch (event.key) {
				case "ArrowRight":
				case "ArrowDown":
				case "PageDown":
				case " ":
				case "Spacebar":
					event.preventDefault();
					next();
					break;
				case "ArrowLeft":
				case "ArrowUp":
				case "PageUp":
					event.preventDefault();
					prev();
					break;
				case "Home":
					event.preventDefault();
					show(0);
					break;
				case "End":
					event.preventDefault();
					show(total - 1);
					break;
				case "f":
				case "F":
					event.preventDefault();
					if (!document.fullscreenElement) {
						document.body.classList.add("cinema");
						if (document.documentElement.requestFullscreen) {
							document.documentElement.requestFullscreen().catch(() => {});
						}
					} else {
						document.body.classList.remove("cinema");
						if (document.exitFullscreen) {
							document.exitFullscreen().catch(() => {});
						}
					}
					break;
			}
		});

		var nextZone = document.getElementById("nav-next");
		var prevZone = document.getElementById("nav-prev");
		if (nextZone) nextZone.addEventListener("click", next);
		if (prevZone) prevZone.addEventListener("click", prev);

		if (progressTrack) {
			progressTrack.addEventListener("click", (event) => {
				var rect = progressTrack.getBoundingClientRect();
				show(Math.floor(((event.clientX - rect.left) / rect.width) * total));
			});
		}

		document.addEventListener("fullscreenchange", () => {
			if (!document.fullscreenElement) {
				document.body.classList.remove("cinema");
			}
		});

		window.addEventListener("hashchange", () => {
			var hashIndex = parseInt(location.hash.slice(1), 10);
			if (hashIndex) show(hashIndex - 1);
		});

		var first = parseInt((location.hash || "").slice(1), 10);
		show(first ? first - 1 : 0);
	}

	function renderMath() {
		if (typeof window.renderMathInElement !== "function") return false;
		var colors = theme();
		window.renderMathInElement(document.body, {
			delimiters: [
				{ left: "$$", right: "$$", display: true },
				{ left: "$", right: "$", display: false },
				{ left: "\\[", right: "\\]", display: true },
				{ left: "\\(", right: "\\)", display: false },
			],
			throwOnError: false,
			macros: {
				"\\st": "\\textcolor{" + colors.blue + "}",
				"\\at": "\\textcolor{" + colors.vio + "}",
				"\\de": "\\textcolor{" + colors.grn + "}",
				"\\mb": "\\textcolor{" + colors.red + "}",
				"\\pri": "\\textcolor{" + colors.blue + "}",
				"\\sec": "\\textcolor{" + colors.vio + "}",
				"\\ok": "\\textcolor{" + colors.grn + "}",
				"\\warn": "\\textcolor{" + colors.red + "}",
				"\\E": "\\mathbb{E}",
				"\\Prob": "\\mathbb{P}",
				"\\CVaR": "\\operatorname{CVaR}",
				"\\VaR": "\\operatorname{VaR}",
			},
		});
		return true;
	}

	function waitKatex(tries) {
		if (renderMath()) return;
		if (tries <= 0) return;
		setTimeout(() => {
			waitKatex(tries - 1);
		}, 80);
	}

	function highlightCode() {
		if (!window.hljs || typeof window.hljs.highlightAll !== "function")
			return false;
		window.hljs.highlightAll();
		return true;
	}

	function waitHighlight(tries) {
		if (highlightCode()) return;
		if (tries <= 0) return;
		setTimeout(() => {
			waitHighlight(tries - 1);
		}, 80);
	}

	buildAll();
	setupSwitches();
	setupDeck();
	setupSearchOverlay();
	setupNotes();
	waitHighlight(80);
	waitKatex(80);
})();
