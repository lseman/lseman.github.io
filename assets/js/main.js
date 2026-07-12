/* ==========================================================================
   main.js – Academic Portfolio for Laio O. Seman
   ========================================================================== */

document.documentElement.classList.add("js");

/* --------------------------------------------------------------------------
   Scroll progress bar
   -------------------------------------------------------------------------- */
(function initScrollProgress() {
	const bar = document.getElementById("scroll-progress");
	if (!bar) return;
	const update = () => {
		const scrolled = window.scrollY;
		const total = document.documentElement.scrollHeight - window.innerHeight;
		bar.style.width = total > 0 ? `${(scrolled / total) * 100}%` : "0%";
	};
	window.addEventListener("scroll", update, { passive: true });
	update();
})();

/* --------------------------------------------------------------------------
   Mobile navigation
   -------------------------------------------------------------------------- */
(function initMobileNav() {
	const btn = document.getElementById("menu-toggle");
	const nav = document.getElementById("mobile-nav");
	if (!btn || !nav) return;
	const closeMenu = () => {
		btn.setAttribute("aria-expanded", "false");
		btn.setAttribute("aria-label", "Open navigation menu");
		btn.classList.remove("is-open");
		nav.classList.remove("is-open");
	};

	btn.addEventListener("click", () => {
		const isOpen = btn.getAttribute("aria-expanded") === "true";
		btn.setAttribute("aria-expanded", String(!isOpen));
		btn.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
		btn.classList.toggle("is-open", !isOpen);
		nav.classList.toggle("is-open", !isOpen);
	});

	// Close when a link is tapped
	nav.querySelectorAll("a").forEach((a) => {
		a.addEventListener("click", closeMenu);
	});

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape") closeMenu();
	});

	window.addEventListener("resize", () => {
		if (window.innerWidth > 768) closeMenu();
	});
})();

/* --------------------------------------------------------------------------
   Scroll reveal
   -------------------------------------------------------------------------- */
(function initReveal() {
	const els = document.querySelectorAll(".reveal");
	if (!("IntersectionObserver" in window)) {
		els.forEach((el) => el.classList.add("show"));
		return;
	}

	const obs = new IntersectionObserver(
		(entries) => {
			entries.forEach((e) => {
				if (e.isIntersecting) e.target.classList.add("show");
			});
		},
		{ threshold: 0.1 },
	);
	els.forEach((el) => obs.observe(el));
})();

/* --------------------------------------------------------------------------
   Header scroll effect
   -------------------------------------------------------------------------- */
(function initHeaderScroll() {
	const header = document.getElementById("site-header");
	if (!header) return;
	const toggle = () => header.classList.toggle("scrolled", window.scrollY > 50);
	window.addEventListener("scroll", toggle, { passive: true });
	toggle();
})();

/* --------------------------------------------------------------------------
   Project search
   -------------------------------------------------------------------------- */
(function initSearch() {
	const input = document.getElementById("search");
	const cards = document.querySelectorAll("[data-search]");
	if (!input) return;
	input.addEventListener("input", (e) => {
		const q = e.target.value.toLowerCase();
		cards.forEach((card) => {
			const match = card.getAttribute("data-search").toLowerCase().includes(q);
			card.style.display = match ? "block" : "none";
		});
	});
})();

/* --------------------------------------------------------------------------
   Footer year
   -------------------------------------------------------------------------- */
(function setYear() {
	document.querySelectorAll(".current-year").forEach((el) => {
		el.textContent = new Date().getFullYear();
	});
})();

/* --------------------------------------------------------------------------
   Publications, GitHub, Scholar metrics, Word Cloud
   -------------------------------------------------------------------------- */
let cachedAuthorData = null;

// Resolves once cachedAuthorData has been populated (or the SS fetch fails)
let _authorDataResolve;
const authorDataReady = new Promise((resolve) => {
	_authorDataResolve = resolve;
});

/* — helpers — */
function truncate(text, max) {
	if (!text) return "";
	return text.length > max ? text.slice(0, max) + "..." : text;
}

function escapeHtml(value) {
	return String(value ?? "").replace(
		/[&<>"']/g,
		(char) =>
			({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#39;",
			})[char],
	);
}

function safeExternalUrl(value) {
	if (!value) return "";
	try {
		const url = new URL(String(value), window.location.href);
		return ["http:", "https:", "mailto:"].includes(url.protocol)
			? url.href
			: "";
	} catch {
		return "";
	}
}

function safeInteger(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, Math.round(number)) : null;
}

/* --------------------------------------------------------------------------
   Generate a pseudo git hash from a paper's title (deterministic)
   -------------------------------------------------------------------------- */
function generatePubHash(p) {
	if (!p || !p.title) return "0000000";
	let hash = 0;
	const s = p.title.toLowerCase().replace(/[^a-z0-9]/g, "");
	for (let i = 0; i < s.length; i++) {
		hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
	}
	return (hash & 0x7fffffff).toString(16).padStart(7, "0");
}

/* --------------------------------------------------------------------------
   Format date like git log: "Mar 15, 2026" or just the year
   -------------------------------------------------------------------------- */
function formatDate(year, month) {
	if (!year) return "";
	const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];
	if (month && month >= 1 && month <= 12) {
		return `${months[month - 1]} ${month}, ${year}`;
	}
	return String(year);
}

/* — DOM refs — */
const STATUS = document.getElementById("pub-status");
const LIST = document.getElementById("pub-list");
const EMPTY = document.getElementById("pub-empty");
/* — Fallback data — */
const FALLBACK_PUBLICATIONS = [
	{
		title:
			"BALDES: A modern C++ Branch-and-Cut-and-Price solver for Vehicle Routing Problems",
		year: 2024,
		venue: "GitHub Repository",
		url: "https://github.com/lseman/baldes",
		authors: ["Laio O. Seman"],
		abstract:
			"Modern C++ implementation of state-of-the-art bucket graph labeling algorithms for vehicle routing problems.",
		citationCount: null,
	},
	{
		title:
			"ForeBlocks: Modular Deep Learning Library for Time Series Forecasting",
		year: 2024,
		venue: "PyPI Package",
		url: "https://github.com/lseman/foreblocks",
		authors: ["Laio O. Seman"],
		abstract:
			"Flexible PyTorch-based library for time series forecasting with multiple neural architectures.",
		citationCount: null,
	},
];

/* — Semantic Scholar — */
async function trySemanticScholar() {
	const CACHE_KEY = "semantic_scholar_pubs_v1";
	const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 h

	try {
		const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
		if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
			console.log("Using cached publications");
			// authorData won't be populated via this path – unblock metrics immediately
			_authorDataResolve(null);
			return cached.data;
		}
	} catch (e) {
		console.log("Cache read error:", e);
	}

	const authorQuery = encodeURIComponent("Laio O. Seman");
	const searchUrl = `https://api.semanticscholar.org/graph/v1/author/search?query=${authorQuery}&limit=5&fields=name,affiliations,authorId,citationCount,hIndex`;

	const sr = await fetch(searchUrl, {
		headers: { Accept: "application/json" },
		signal: AbortSignal.timeout(10000),
	});
	if (sr.status === 429)
		throw new Error("Rate limited by Semantic Scholar API");
	if (!sr.ok) throw new Error("author search failed");

	const sj = await sr.json();
	const candidate =
		(sj?.data || []).find((a) => /laio/i.test(a.name || "")) ||
		(sj?.data || [])[0];
	if (!candidate?.authorId) throw new Error("no authorId");

	cachedAuthorData = candidate;
	_authorDataResolve(candidate); // signal metrics loader

	const papersUrl = `https://api.semanticscholar.org/graph/v1/author/${candidate.authorId}/papers?limit=20&fields=title,year,venue,url,authors,externalIds,abstract,citationCount`;
	const pr = await fetch(papersUrl, {
		headers: { Accept: "application/json" },
		signal: AbortSignal.timeout(10000),
	});
	if (pr.status === 429)
		throw new Error("Rate limited by Semantic Scholar API");
	if (!pr.ok) throw new Error("papers fetch failed");

	const pj = await pr.json();
	const items = (pj?.data || []).map((p) => ({
		title: p.title,
		year: p.year,
		venue: p.venue,
		abstract: p.abstract || p.tldr,
		url:
			p.url ||
			(p.externalIds?.ArXiv
				? `https://arxiv.org/abs/${p.externalIds.ArXiv}`
				: ""),
		authors: (p.authors || []).map((a) => a.name),
		citationCount: p.citationCount || null,
	}));

	try {
		localStorage.setItem(
			CACHE_KEY,
			JSON.stringify({ timestamp: Date.now(), data: items }),
		);
	} catch (e) {
		console.log("Cache write error:", e);
	}

	return items;
}

/* — Local publications.json — */
async function tryLocalPublicationsJson() {
	const r = await fetch("./publications.json", {
		cache: "no-store",
		signal: AbortSignal.timeout(5000),
	});
	if (!r.ok) throw new Error("no local publications.json");
	const j = await r.json();
	return Array.isArray(j) ? j : j.publications || j.items || [];
}

/* — Render publications list — */
/* Classify a paper into a research area tag based on title/venue keywords */
function classifyPaper(p) {
	const text = (
		(p.title || "") +
		" " +
		(p.venue || "") +
		" " +
		(p.abstract || "")
	).toLowerCase();
	const orKw =
		/routing|vehicle|vrp|branch|price|decompos|scheduling|combinatorial|integer|linear programming|column generation|operations research|milp|ilp|heuristic|metaheuristic|exact method|optimization/;
	const tsKw =
		/forecast|time.?series|temporal|sequence|attention|transformer|lstm|recurrent|prediction|autoregressive/;
	const mlKw =
		/machine learning|deep learning|neural|reinforcement|graph neural|embedding|classification|regression|convolutional|bert|gpt|language model/;
	if (tsKw.test(text)) return "ml";
	if (orKw.test(text)) return "or";
	if (mlKw.test(text)) return "ml";
	return "or"; // default for academic OR/ML researcher
}

function renderPublications(items) {
	if (LIST) LIST.innerHTML = "";
	if (!items || !items.length) {
		if (EMPTY) EMPTY.classList.remove("hidden");
		if (STATUS) STATUS.textContent = "No data";
		return;
	}
	if (EMPTY) EMPTY.classList.add("hidden");
	const top = items.sort((a, b) => (b.year || 0) - (a.year || 0)).slice(0, 10);

	if (LIST) {
		top.forEach((p, idx) => {
			const li = document.createElement("li");
			const area = classifyPaper(p);
			li.className = "pub-card reveal";
			li.dataset.area = area;
			const title = escapeHtml(p.title || "Untitled");
			const venue = escapeHtml(p.venue || "");
			const year = safeInteger(p.year);
			const abstract = escapeHtml(p.abstract || p.tldr || "").slice(0, 160);
			const url = safeExternalUrl(p.url);
			const citationCount = safeInteger(p.citationCount);
			const tagLabel = area === "or" ? "OR" : area === "ml" ? "ML" : "TS";

			// Generate a pseudo git hash from the title
			const hash = generatePubHash(p);

			// Format date like git log: "Mar 15, 2026"
			const dateStr = year ? formatDate(year, p.month) : "";

			// Build tags
			const tags = [tagLabel];
			if (p.keywords && Array.isArray(p.keywords)) {
				const kw = p.keywords.slice(0, 3).map(escapeHtml).join(" tag: ");
				if (kw) tags.push("tag: " + kw);
			}

			// HEAD marker on most recent
			const headMark = idx === 0 ? " (HEAD → latest)" : "";

			// Split title into main + subtitle if it has " - "
			let mainTitle = title;
			let subtitle = "";
			const dashIdx = title.indexOf(" - ");
			if (dashIdx > 0) {
				mainTitle = title.slice(0, dashIdx);
				subtitle = title.slice(dashIdx + 3);
			}

			// Build the title line with link
			const titleLine = url
				? `<a href="${url}" target="_blank" rel="noopener noreferrer" class="pub-link">${mainTitle}</a>${subtitle ? " - " + subtitle : ""}`
				: title;

			li.innerHTML = `
        <div class="pub-gitlog">
          <div class="pub-gitlog-line">
            <span class="pub-hash mono">${hash}</span>${headMark ? `<span class="pub-head mono">${headMark}</span>` : ""}
            <span class="pub-title-main">${titleLine}</span>
          </div>
          <div class="pub-gitlog-meta">
            ${dateStr ? `<span class="pub-date mono">${dateStr}</span>` : ""}
            ${tags.map((t) => `<span class="pub-tag-git">tag: ${t}</span>`).join(" ")}
          </div>
          ${abstract ? `<div class="pub-gitlog-desc">${abstract}${abstract.length >= 160 ? "…" : ""}</div>` : ""}
          <div class="pub-gitlog-footer">
            ${venue ? `<span class="pub-venue">${venue}</span>` : ""}
            ${citationCount ? `<span class="pub-cite-badge">${citationCount} citations</span>` : ""}
            ${url ? `<a href="${url}" target="_blank" rel="noopener noreferrer" class="pub-link-btn">↗</a>` : ""}
          </div>
        </div>
      `;
			LIST.appendChild(li);
			setTimeout(() => li.classList.add("show"), idx * 60);
		});
	}

	if (STATUS) STATUS.textContent = "Loaded";
	buildAndRenderCloudFrom(items);
}

/* Publication filter buttons */
(function initPubFilters() {
	const btns = document.querySelectorAll(".pub-filter-btn");
	if (!btns.length) return;
	btns.forEach((btn) => {
		btn.addEventListener("click", () => {
			btns.forEach((b) => b.classList.remove("active"));
			btn.classList.add("active");
			const filter = btn.dataset.filter;
			document.querySelectorAll(".pub-card").forEach((card) => {
				const show = filter === "all" || card.dataset.area === filter;
				card.style.display = show ? "" : "none";
			});
		});
	});
})();

/* --------------------------------------------------------------------------
   GitHub repos
   -------------------------------------------------------------------------- */
const GH_STATUS = document.getElementById("gh-status");
const GH_LIST = document.getElementById("gh-list");

function renderRepos(repos) {
	if (!GH_LIST) return;
	GH_LIST.innerHTML = "";
	if (!repos || !repos.length) {
		if (GH_STATUS) GH_STATUS.textContent = "No repositories";
		return;
	}
	const ownRepos = repos.filter((r) => !r.fork);
	const top = ownRepos
		.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
		.slice(0, 6);

	for (const r of top) {
		const repoUrl = safeExternalUrl(r.html_url);
		const jsonText = (value) =>
			escapeHtml(JSON.stringify(String(value)).slice(1, -1));
		const repoName = jsonText(r.name || "Repository");
		const repoDescription = jsonText(
			r.description || "No description available",
		);
		const repoLanguage = r.language ? jsonText(r.language) : "";
		const stars = safeInteger(r.stargazers_count) || 0;
		const card = document.createElement(repoUrl ? "a" : "article");
		card.className = "jcard";
		if (repoUrl) {
			card.href = repoUrl;
			card.target = "_blank";
			card.rel = "noopener noreferrer";
		}
		card.innerHTML = `
			<div class="jcard-inner">
				<p><span class="jbrace">{</span></p>
				<p class="jcard-field"><span class="j-key">"name"</span><span class="j-punc"> : </span><span class="jcard-name">"${repoName}"</span><span class="j-punc"> ,</span></p>
				<p class="jcard-field"><span class="j-key">"what"</span><span class="j-punc"> : </span><span class="j-str">"${repoDescription}"</span><span class="j-punc"> ,</span></p>
				<p class="jcard-field"><span class="j-key">"language"</span><span class="j-punc"> : </span>${repoLanguage ? `<span class="j-val">"${repoLanguage}"</span>` : `<span class="repo-json-null">null</span>`}<span class="j-punc"> , </span><span class="j-key">"stars"</span><span class="j-punc"> : </span><span class="repo-json-number">${stars}</span></p>
				<p><span class="jbrace">}</span> ${repoUrl ? `<span class="jcard-arrow">↗</span>` : ""}</p>
			</div>
    `;
		GH_LIST.appendChild(card);
	}
	if (GH_STATUS) GH_STATUS.textContent = "Loaded";
	// Update profile stat with real repo count
	const reposEl = document.getElementById("stat-repos");
	if (reposEl) {
		reposEl.dataset.target = ownRepos.length;
		animateCountUp(reposEl, ownRepos.length, "");
	}
}

async function tryGitHubAPI() {
	const CACHE_KEY = "github_repos_v1";
	const CACHE_TTL = 1 * 60 * 60 * 1000; // 1 h

	try {
		const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
		if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
			console.log("Using cached GitHub repos");
			return cached.data;
		}
	} catch (e) {
		console.log("Cache read error:", e);
	}

	const r = await fetch(
		"https://api.github.com/users/lseman/repos?per_page=100&sort=updated",
		{
			headers: { Accept: "application/vnd.github+json" },
			signal: AbortSignal.timeout(10000),
		},
	);
	if (r.status === 429 || r.status === 403)
		throw new Error("Rate limited by GitHub API");
	if (!r.ok) throw new Error("github api failed");

	const data = await r.json();
	try {
		localStorage.setItem(
			CACHE_KEY,
			JSON.stringify({ timestamp: Date.now(), data }),
		);
	} catch (e) {
		console.log("Cache write error:", e);
	}

	return data;
}

/* --------------------------------------------------------------------------
   Profile stat counters — defined BEFORE loadScholarMetrics so the hook
   exists when the cached-metrics path fires synchronously.
   -------------------------------------------------------------------------- */
function animateCountUp(el, target, suffix) {
	const duration = 1400;
	const start = performance.now();
	function step(now) {
		const p = Math.min((now - start) / duration, 1);
		const ease = 1 - (1 - p) ** 3;
		el.textContent = Math.round(ease * target) + (suffix || "");
		if (p < 1) requestAnimationFrame(step);
	}
	requestAnimationFrame(step);
}

function updateProfileStats({ citationCount, paperCount, hIndex } = {}) {
	// hero card stats
	const citEl = document.getElementById("stat-citations");
	const papersEl = document.getElementById("stat-papers");
	const hEl = document.getElementById("stat-hindex");
	const reposEl = document.getElementById("stat-repos");
	if (citEl && citationCount != null) animateCountUp(citEl, citationCount, "");
	if (papersEl && paperCount != null) {
		papersEl.dataset.target = paperCount;
		animateCountUp(papersEl, paperCount, "");
	}
	if (hEl && hIndex != null) animateCountUp(hEl, hIndex, "");
	if (reposEl && reposEl.dataset.target)
		animateCountUp(reposEl, parseInt(reposEl.dataset.target, 10), "");

	// publications sidebar stats
	const gsCit = document.getElementById("gs-citations");
	const gsH = document.getElementById("gs-hindex");
	const gsPap = document.getElementById("gs-papers");
	if (gsCit && citationCount != null) animateCountUp(gsCit, citationCount, "");
	if (gsH && hIndex != null) animateCountUp(gsH, hIndex, "");
	if (gsPap && paperCount != null) animateCountUp(gsPap, paperCount, "");
}
window.__updateProfileStats = updateProfileStats;

/* --------------------------------------------------------------------------
   Scholar metrics (via Semantic Scholar)
   -------------------------------------------------------------------------- */
(async function loadScholarMetrics() {
	const CACHE_KEY = "scholar_metrics_cache_v1";
	const TTL_MS = 24 * 60 * 60 * 1000; // 24 h

	try {
		const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
		if (cached && Date.now() - cached.ts < TTL_MS) {
			window.__updateProfileStats(cached.data);
			return;
		}
	} catch {
		/* ignore */
	}

	// Wait for the publications fetch to populate cachedAuthorData (15 s max)
	await Promise.race([
		authorDataReady,
		new Promise((r) => setTimeout(r, 15000)),
	]);

	async function getAuthorDetails(id) {
		const r = await fetch(
			`https://api.semanticscholar.org/graph/v1/author/${id}?fields=name,url,citationCount,hIndex,paperCount`,
			{
				headers: { Accept: "application/json" },
				signal: AbortSignal.timeout(10000),
			},
		);
		if (r.status === 429) throw new Error("Rate limited");
		if (!r.ok) throw new Error("author details failed");
		return r.json();
	}

	try {
		// Determine authorId: prefer the one set by the publications fetch,
		// but do our own lookup when returning from cache didn't populate it.
		let authorId = cachedAuthorData?.authorId ?? null;
		let authorSnapshot = cachedAuthorData;

		if (!authorId) {
			const authorQuery = encodeURIComponent("Laio O. Seman");
			const sr = await fetch(
				`https://api.semanticscholar.org/graph/v1/author/search?query=${authorQuery}&limit=5&fields=name,authorId,citationCount,hIndex`,
				{
					headers: { Accept: "application/json" },
					signal: AbortSignal.timeout(10000),
				},
			);
			if (sr.status === 429) throw new Error("Rate limited");
			if (!sr.ok) throw new Error("author search failed");
			const sj = await sr.json();
			const candidate =
				(sj?.data || []).find((a) => /laio/i.test(a.name || "")) ||
				(sj?.data || [])[0];
			if (!candidate?.authorId) throw new Error("no authorId found");
			authorId = candidate.authorId;
			authorSnapshot = candidate;
		}

		const detail = await getAuthorDetails(authorId);
		const data = {
			hIndex: detail.hIndex ?? authorSnapshot?.hIndex ?? null,
			citationCount:
				detail.citationCount ?? authorSnapshot?.citationCount ?? null,
			paperCount: detail.paperCount ?? null,
		};
		window.__updateProfileStats(data);
		try {
			localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
		} catch {
			/* ignore */
		}
	} catch (error) {
		console.log("Scholar metrics error:", error.message);
	}
})();

/* --------------------------------------------------------------------------
   Word cloud
   -------------------------------------------------------------------------- */
const CLOUD_STATUS = document.getElementById("cloud-status");
const TOP_TERMS_OL = document.getElementById("top-terms");

const STOP = new Set(
	// articles, conjunctions, prepositions
	(
		"a,an,and,are,as,at,be,by,for,from,has,have,in,is,its,of,on,or,that,the,to,was,were,with,via,into,through,over,under,between,within,without,about,above,after,against,along,among,around,before,behind,below,beside,beyond,during,except,inside,near,off,onto,out,outside,since,toward,towards,upon,per," +
		// pronouns & determiners
		"we,you,they,he,she,it,i,me,my,our,your,their,his,her,us,who,whom,whose,which,what,this,these,those,each,every,any,all,both,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very," +
		// auxiliaries & common verbs
		"do,does,did,done,doing,be,been,being,have,had,having,will,would,shall,should,may,might,must,can,could,also,just,even,still,already,yet,often,well,much,many,its,ago," +
		// academic filler — discourse & rhetorical
		"propose,proposes,proposed,proposing,present,presents,presented,presenting,introduce,introduces,introduced,show,shows,showed,shown,showing,demonstrate,demonstrates,demonstrated,study,studies,studied,investigate,investigates,investigated,examine,examines,examined,explore,explores,explored,develop,develops,developed,consider,considers,considered,provide,provides,provided,address,addresses,addressed,achieve,achieves,achieved,apply,applies,applied,based,use,used,uses,using,make,made,makes,making,find,finds,found,finding,give,gives,given,include,includes,included,compare,compared,compares,extend,extends,extended,evaluate,evaluates,evaluated,analyze,analyzes,analyzed,analyse,analyses,analysed,improve,improves,improved,allow,allows,allowed,require,requires,required,obtain,obtains,obtained,yield,yields,yielded,derive,derives,derived,define,defines,defined,compute,computes,computed,focus,focuses,focused,formulate,formulates,formulated,describe,describes,described,discuss,discusses,discussed,design,designs,designed,build,builds,built,test,tests,tested,validate,validates,validated,verify,verifies,verified,train,trains,trained,learn,learns,learned,solve,solves,solved,tackle,tackles,tackled,handle,handles,handled,combine,combines,combined,integrate,integrates,integrated,leverage,leverages,leveraged,exploit,exploits,exploited," +
		// generic academic nouns/adjectives that add no topic signal
		"paper,work,approach,method,framework,system,model,task,problem,result,results,performance,experiment,experiments,evaluation,analysis,data,dataset,set,number,type,way,case,form,level,point,order,part,terms,term,value,values,different,new,large,high,low,small,general,specific,various,several,current,existing,previous,recent,further,additional,key,main,first,second,two,three,one,zero,based,via,well,however,therefore,thus,hence,moreover,furthermore,additionally,consequently,respectively,namely,i.e,e.g,et,al,fig,table,section,equation,eq,theorem,lemma,proof,et"
	).split(","),
);

function buildCorpus(items) {
	return items
		.map((p) => [p.title, p.abstract, p.tldr].filter(Boolean).join(" "))
		.join(" ");
}

function computeFrequencies(text) {
	const counts = new Map();
	for (const tok of (text.match(/[A-Za-zÀ-ÖØ-öø-ÿ0-9-]+/g) || []).map((t) =>
		t.toLowerCase(),
	)) {
		if (tok.length < 4 || STOP.has(tok)) continue;
		counts.set(tok, (counts.get(tok) || 0) + 1);
	}
	return counts;
}

function topN(counts, n = 30) {
	return Array.from(counts.entries())
		.filter(([, c]) => c >= 2)
		.sort((a, b) => b[1] - a[1])
		.slice(0, n);
}

function renderTopTerms(list, data) {
	if (!list) return;
	list.innerHTML = "";
	for (const [term, count] of data.slice(0, 15)) {
		const li = document.createElement("li");
		li.innerHTML = `<span class="inline-block px-2 py-0.5 rounded-full border border-neutral-200 me-2 text-xs">${safeInteger(count) || 0}</span>${escapeHtml(term)}`;
		list.appendChild(li);
	}
}

function renderWordCloud(pairs) {
	const canvas = document.getElementById("wordcloud");
	if (!canvas) return false;
	if (typeof window.WordCloud !== "function") return false;
	const rect = canvas.getBoundingClientRect();
	const ratio = window.devicePixelRatio || 1;
	canvas.width = rect.width * ratio;
	canvas.height = rect.height * ratio;
	const ctx = canvas.getContext("2d");
	ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
	const max = pairs.length ? Math.max(...pairs.map(([, w]) => w)) : 1;
	const list = pairs.map(([t, w]) => [
		t,
		Math.max(8, Math.round(8 + 40 * (w / max))),
	]);
	const palette = ["#fbbf24", "#2dd4bf", "#f472b6", "#a78bfa", "#67e8f9"];
	WordCloud(canvas, {
		list,
		gridSize: Math.round(8 * ratio),
		shrinkToFit: true,
		drawOutOfBound: false,
		backgroundColor: "transparent",
		origin: [rect.width / 2, rect.height / 2],
		color: () => palette[Math.floor(Math.random() * palette.length)],
	});
	return true;
}

function buildAndRenderCloudFrom(items) {
	try {
		if (CLOUD_STATUS) CLOUD_STATUS.textContent = "Building…";
		const pairs = topN(computeFrequencies(buildCorpus(items)), 60);
		if (window.__updateHeroTetrisTerms) {
			window.__updateHeroTetrisTerms(pairs.map(([term]) => term));
		}
		renderTopTerms(TOP_TERMS_OL, pairs);
		const rendered = renderWordCloud(pairs);
		if (CLOUD_STATUS) {
			CLOUD_STATUS.textContent = rendered ? "Loaded" : "Unavailable";
		}
	} catch {
		if (CLOUD_STATUS) CLOUD_STATUS.textContent = "Unavailable";
	}
}

/* --------------------------------------------------------------------------
   Init data loaders
   -------------------------------------------------------------------------- */
(async () => {
	try {
		if (STATUS) STATUS.textContent = "Loading from cache...";
		const items = await trySemanticScholar();
		if (STATUS) STATUS.textContent = "Loaded from Semantic Scholar";
		renderPublications(items);
		// Note: _authorDataResolve was already called inside trySemanticScholar
	} catch (e1) {
		console.log("Semantic Scholar failed:", e1.message);
		_authorDataResolve(null); // unblock metrics loader immediately on failure
		try {
			if (STATUS) STATUS.textContent = "Trying local file...";
			const items = await tryLocalPublicationsJson();
			if (STATUS) STATUS.textContent = "Loaded from local file";
			renderPublications(items);
		} catch (e2) {
			console.log("Local file failed:", e2.message);
			if (STATUS) {
				const msg = document.createElement("div");
				msg.className =
					"text-sm bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4";
				msg.innerHTML = `
          <p class="font-semibold mb-2">Note: Using fallback publication data</p>
          <p class="text-xs text-slate-600">The Semantic Scholar API is temporarily unavailable.
          Create a <code class="bg-slate-100 px-1 rounded">publications.json</code> file to avoid this.
          Data will be cached for 6 hours after the first successful load.</p>
        `;
				const container = document.querySelector("#publications .card");
				if (container) container.insertBefore(msg, container.firstChild);
				STATUS.textContent = "Using fallback data";
			}
			renderPublications(FALLBACK_PUBLICATIONS);
		}
	}
})();

(async () => {
	try {
		if (GH_STATUS) GH_STATUS.textContent = "Loading repositories...";
		const repos = await tryGitHubAPI();
		renderRepos(repos);
		try {
			const cached = JSON.parse(
				localStorage.getItem("github_repos_v1") || "null",
			);
			if (GH_STATUS)
				GH_STATUS.textContent = cached ? "Loaded (cached)" : "Loaded";
		} catch {
			/* ignore */
		}
	} catch (e) {
		console.log("GitHub API failed:", e.message);
		if (GH_STATUS) {
			GH_STATUS.textContent = "Temporarily unavailable";
			GH_STATUS.className = GH_STATUS.className.replace(
				"text-slate-500",
				"text-orange-600",
			);
		}
		const section = document.getElementById("github");
		if (section) {
			const msg = document.createElement("div");
			msg.className =
				"text-sm bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8 max-w-2xl";
			msg.innerHTML = `
        <p class="font-semibold mb-1">GitHub API temporarily unavailable</p>
        <p class="text-xs text-slate-600">This usually means rate limiting. The page will use cached data if available.</p>
      `;
			const container = section.querySelector(".container");
			if (container && container.children[1])
				container.insertBefore(msg, container.children[1]);
		}
	}
})();

/* --------------------------------------------------------------------------
   Hero role typewriter (terminal prompt) — cycles descriptions
   -------------------------------------------------------------------------- */
(function initHeroRoleTypewriter() {
	const el = document.getElementById("hero-role-typed");
	if (!el) return;

	const phrases = [
		"Researcher and lecturer working across Operations Research, Machine Learning, and time-series forecasting.",
		"I build optimization algorithms, forecasting models, and research software.",
		"Branch-and-price, decomposition, and learning-aware decision methods.",
		"Interactive explainers for complex ideas in OR and ML.",
	];

	let phraseIdx = 0,
		charIdx = 0,
		deleting = false;

	function tick() {
		const current = phrases[phraseIdx];
		if (!deleting) {
			charIdx++;
			el.textContent = current.slice(0, charIdx);
			if (charIdx === current.length) {
				deleting = true;
				setTimeout(tick, 2500);
				return;
			}
			setTimeout(tick, 40);
		} else {
			charIdx--;
			el.textContent = current.slice(0, charIdx);
			if (charIdx === 0) {
				deleting = false;
				phraseIdx = (phraseIdx + 1) % phrases.length;
				setTimeout(tick, 500);
				return;
			}
			setTimeout(tick, 20);
		}
	}

	setTimeout(tick, 2000);
})();

/* --------------------------------------------------------------------------
   Hero name typewriter — types "Laio O. Seman" then blinks cursor
   -------------------------------------------------------------------------- */
(function initHeroNameTypewriter() {
	const textEl = document.getElementById("hero-name-typed");
	const cursorEl = document.getElementById("hero-name-cursor");
	if (!textEl || !cursorEl) return;

	const name = "Laio O. Seman";
	let i = 0;

	cursorEl.style.opacity = "1";

	function typeNext() {
		if (i < name.length) {
			textEl.textContent = name.slice(0, ++i);
			setTimeout(typeNext, i === 1 ? 120 : 80 + Math.random() * 60);
		}
		// once done, cursor stays and blinks via CSS animation
	}

	setTimeout(typeNext, 300);
})();

/* --------------------------------------------------------------------------
   Active nav highlight on scroll (IDE tab style)
   -------------------------------------------------------------------------- */
(function initActiveNav() {
	const header = document.getElementById("site-header");
	const tabs = Array.from(document.querySelectorAll('.ide-tab[href^="#"]'));
	const secs = tabs
		.map((a) => document.getElementById(a.getAttribute("href").slice(1)))
		.filter(Boolean);

	if (!header || !tabs.length || !secs.length) return;

	const setActive = (id) => {
		const current = document.querySelector('.ide-tab[aria-current="page"]');
		const newActive = document.querySelector(
			`.ide-tab[href="#${CSS.escape(id)}"]`,
		);
		if (current === newActive) return;
		if (current) current.removeAttribute("aria-current");
		if (newActive) newActive.setAttribute("aria-current", "page");
	};

	const pickMostVisible = () => {
		const topPad = header.offsetHeight + 80; // extra offset for IDE chrome
		let bestSection = null,
			bestScore = -Infinity;
		for (const section of secs) {
			const rect = section.getBoundingClientRect();
			const vh = window.innerHeight;
			if (rect.bottom < topPad || rect.top > vh) continue;
			const visibleTop = Math.max(rect.top, topPad);
			const visibleBottom = Math.min(rect.bottom, vh);
			const visibleHeight = Math.max(0, visibleBottom - visibleTop);
			if (visibleHeight <= 0) continue;
			const score =
				(visibleHeight / rect.height) * 2 -
				(Math.abs((rect.top + rect.bottom) / 2 - vh / 2) / vh) * 0.5;
			if (score > bestScore) {
				bestScore = score;
				bestSection = section;
			}
		}
		if (bestSection) setActive(bestSection.id);
	};

	window.addEventListener(
		"scroll",
		() => {
			clearTimeout(window._scrollNavTimeout);
			window._scrollNavTimeout = setTimeout(pickMostVisible, 100);
		},
		{ passive: true },
	);

	pickMostVisible();
})();

/* --------------------------------------------------------------------------
   Terminal / Tetris click-to-bring-front
   -------------------------------------------------------------------------- */
(function initTerminalFocus() {
	const windows = [...document.querySelectorAll("#top .terminal-window, #top .tetris-window")];
	if (!windows.length) return;

	const bringToFront = (activeWindow) => {
		windows.forEach((windowEl) => {
			const isActive = windowEl === activeWindow;
			windowEl.classList.toggle("terminal-focused", isActive);
			windowEl.closest(".hero-shell, .hero-tetris")?.classList.toggle("hero-window-front", isActive);
		});
	};

	windows.forEach((windowEl) => {
		windowEl.addEventListener("pointerdown", () => bringToFront(windowEl));
		windowEl.addEventListener("focusin", () => bringToFront(windowEl));
		windowEl.addEventListener("keydown", (event) => {
			if (event.target !== windowEl || (event.key !== "Enter" && event.key !== " ")) return;
			event.preventDefault();
			bringToFront(windowEl);
		});
	});
})();
