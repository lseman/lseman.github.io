/* ==========================================================================
   main.js – Academic Portfolio for Laio O. Seman
   ========================================================================== */

/* --------------------------------------------------------------------------
   Scroll progress bar
   -------------------------------------------------------------------------- */
(function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  const update = () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* --------------------------------------------------------------------------
   Mobile navigation
   -------------------------------------------------------------------------- */
(function initMobileNav() {
  const btn = document.getElementById('menu-toggle');
  const nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!isOpen));
    btn.classList.toggle('is-open', !isOpen);
    nav.classList.toggle('is-open', !isOpen);
  });

  // Close when a link is tapped
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.setAttribute('aria-expanded', 'false');
      btn.classList.remove('is-open');
      nav.classList.remove('is-open');
    });
  });
})();

/* --------------------------------------------------------------------------
   Badge physics simulation (Matter.js)
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  const { Engine, Render, World, Bodies, Body, Runner } = Matter;
  const container = document.querySelector('.flex-badges');
  const badges = document.querySelectorAll('.badge-fall');
  const canvas = document.getElementById('physics-canvas');

  if (!container || badges.length === 0 || !canvas) return;

  const containerWidth = container.offsetWidth;
  const containerHeight = container.clientHeight;
  const engine = Engine.create();
  const render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
      width: containerWidth,
      height: containerHeight,
      wireframes: false,
      background: 'transparent',
    }
  });
  const runner = Runner.create();

  const floor = Bodies.rectangle(containerWidth / 2, containerHeight - 10, containerWidth, 20, {
    isStatic: true,
    render: { visible: false }
  });
  const leftWall = Bodies.rectangle(0, containerHeight / 2, 20, containerHeight, {
    isStatic: true,
    render: { visible: false }
  });
  const rightWall = Bodies.rectangle(containerWidth, containerHeight / 2, 20, containerHeight, {
    isStatic: true,
    render: { visible: false }
  });

  World.add(engine.world, [floor, leftWall, rightWall]);

  const badgeBodies = [];
  badges.forEach((badge, index) => {
    badge.offsetWidth; // force reflow
    const rectWidth = badge.offsetWidth;
    const rectHeight = badge.offsetHeight;
    const startX = containerWidth * (index + 0.5) / badges.length;
    const startY = -50 - Math.random() * 50;

    const body = Bodies.rectangle(startX, startY, rectWidth, rectHeight, {
      restitution: 0.6,
      friction: 0.3,
      frictionAir: 0.01,
      density: 0.001,
      render: { fillStyle: 'transparent' }
    });

    Body.setVelocity(body, { x: (Math.random() - 0.5) * 4, y: 0 });
    badgeBodies.push(body);
    World.add(engine.world, body);
  });

  Matter.Events.on(engine, 'afterUpdate', () => {
    badgeBodies.forEach((body, index) => {
      const badge = badges[index];
      if (badge) {
        const pos = body.position;
        const angle = body.angle;
        badge.style.left = `${pos.x - (badge.offsetWidth / 2)}px`;
        badge.style.top = `${pos.y - (badge.offsetHeight / 2)}px`;
        badge.style.transform = `rotate(${angle}rad)`;
      }
    });
  });

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      Runner.run(runner, engine);
      Render.run(render);
      observer.disconnect();
    }
  });
  observer.observe(container);
});

/* --------------------------------------------------------------------------
   Scroll reveal
   -------------------------------------------------------------------------- */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
})();

/* --------------------------------------------------------------------------
   Header scroll effect
   -------------------------------------------------------------------------- */
(function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;
  const toggle = () => header.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
})();

/* --------------------------------------------------------------------------
   Project search
   -------------------------------------------------------------------------- */
(function initSearch() {
  const input = document.getElementById('search');
  const cards = document.querySelectorAll('[data-search]');
  if (!input) return;
  input.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    cards.forEach(card => {
      const match = card.getAttribute('data-search').toLowerCase().includes(q);
      card.style.display = match ? 'block' : 'none';
    });
  });
})();

/* --------------------------------------------------------------------------
   Footer year
   -------------------------------------------------------------------------- */
(function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* --------------------------------------------------------------------------
   Terminal typewriter effect
   -------------------------------------------------------------------------- */
(function initTerminal() {
  const demo = document.getElementById('demo');
  if (!demo) return;

  const lines = [
    '<span class="text-cyan-400">$</span> <span class="text-slate-300">pip install foreblocks</span>',
    '<span class="text-green-400">Successfully installed foreblocks 0.1.0</span>',
    '<span class="text-cyan-400">$</span> <span class="text-slate-300">pip install ipym</span>',
    '<span class="text-green-400">Successfully installed ipym 0.0.1</span>'
  ];
  let idx = 0;
  setInterval(() => {
    demo.innerHTML = lines[idx];
    idx = (idx + 1) % lines.length;
  }, 3000);
})();

/* --------------------------------------------------------------------------
   Publications, GitHub, Scholar metrics, Word Cloud
   -------------------------------------------------------------------------- */
let cachedAuthorData = null;

// Resolves once cachedAuthorData has been populated (or the SS fetch fails)
let _authorDataResolve;
const authorDataReady = new Promise(resolve => { _authorDataResolve = resolve; });

/* — helpers — */
function truncate(text, max) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '...' : text;
}

/* — DOM refs — */
const STATUS       = document.getElementById('pub-status');
const LIST         = document.getElementById('pub-list');
const EMPTY        = document.getElementById('pub-empty');
const LATEST_GRID  = document.getElementById('latest-papers-grid');
const LATEST_STATUS = document.getElementById('latest-status');

/* — Fallback data — */
const FALLBACK_PUBLICATIONS = [
  {
    title: "BALDES: A modern C++ Branch-and-Cut-and-Price solver for Vehicle Routing Problems",
    year: 2024,
    venue: "GitHub Repository",
    url: "https://github.com/lseman/baldes",
    authors: ["Laio O. Seman"],
    abstract: "Modern C++ implementation of state-of-the-art bucket graph labeling algorithms for vehicle routing problems.",
    citationCount: null
  },
  {
    title: "ForeBlocks: Modular Deep Learning Library for Time Series Forecasting",
    year: 2024,
    venue: "PyPI Package",
    url: "https://github.com/lseman/foreblocks",
    authors: ["Laio O. Seman"],
    abstract: "Flexible PyTorch-based library for time series forecasting with multiple neural architectures.",
    citationCount: null
  }
];

/* — Latest papers — */
function renderLatest3(items) {
  if (!LATEST_GRID) return;
  const latest3 = items.sort((a, b) => (b.year || 0) - (a.year || 0)).slice(0, 3);

  if (latest3.length === 0) {
    LATEST_GRID.innerHTML = '<p class="text-slate-500 text-center col-span-3 py-8">No papers available</p>';
    if (LATEST_STATUS) LATEST_STATUS.textContent = 'No data';
    return;
  }

  LATEST_GRID.innerHTML = latest3.map(p => {
    const venue   = [p.venue, p.year].filter(Boolean).join(' · ');
    const abstract = truncate(p.abstract || p.tldr, 200);
    const authors = Array.isArray(p.authors)
      ? p.authors.slice(0, 3).join(', ') + (p.authors.length > 3 ? ' et al.' : '')
      : (p.authors || '');
    return `
      <article class="card p-8 group">
        <div class="relative z-10">
          <h3 class="text-xl font-bold mb-3">
            <a class="text-slate-700 hover:text-brand transition-colors" href="${p.url || '#'}" target="_blank">${p.title || 'Untitled'}</a>
          </h3>
          ${venue   ? `<p class="text-sm text-slate-500 mb-3 font-medium">${venue}</p>` : ''}
          ${authors ? `<p class="text-xs text-slate-500 mb-4">${authors}</p>` : ''}
          ${abstract ? `<p class="text-sm text-slate-600 leading-relaxed mb-4">${abstract}</p>` : ''}
          ${p.citationCount ? `
            <div class="inline-flex items-center gap-1 text-xs text-brand bg-cyan-50 px-2 py-1 rounded-full">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h4l4 4"/>
              </svg>
              ${p.citationCount} citations
            </div>` : ''}
        </div>
      </article>
    `;
  }).join('');
  if (LATEST_STATUS) LATEST_STATUS.textContent = items.length === FALLBACK_PUBLICATIONS.length ? 'Fallback data' : 'Loaded';
}

/* — Semantic Scholar — */
async function trySemanticScholar() {
  const CACHE_KEY = 'semantic_scholar_pubs_v1';
  const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 h

  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log('Using cached publications');
      // authorData won't be populated via this path – unblock metrics immediately
      _authorDataResolve(null);
      return cached.data;
    }
  } catch (e) { console.log('Cache read error:', e); }

  const authorQuery = encodeURIComponent('Laio O. Seman');
  const searchUrl = `https://api.semanticscholar.org/graph/v1/author/search?query=${authorQuery}&limit=5&fields=name,affiliations,authorId,citationCount,hIndex`;

  const sr = await fetch(searchUrl, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(10000)
  });
  if (sr.status === 429) throw new Error('Rate limited by Semantic Scholar API');
  if (!sr.ok) throw new Error('author search failed');

  const sj = await sr.json();
  const candidate = (sj?.data || []).find(a => /laio/i.test(a.name || '')) || (sj?.data || [])[0];
  if (!candidate?.authorId) throw new Error('no authorId');

  cachedAuthorData = candidate;
  _authorDataResolve(candidate); // signal metrics loader

  const papersUrl = `https://api.semanticscholar.org/graph/v1/author/${candidate.authorId}/papers?limit=20&fields=title,year,venue,url,authors,externalIds,abstract,citationCount`;
  const pr = await fetch(papersUrl, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(10000)
  });
  if (pr.status === 429) throw new Error('Rate limited by Semantic Scholar API');
  if (!pr.ok) throw new Error('papers fetch failed');

  const pj = await pr.json();
  const items = (pj?.data || []).map(p => ({
    title: p.title,
    year: p.year,
    venue: p.venue,
    abstract: p.abstract || p.tldr,
    url: p.url || (p.externalIds?.ArXiv ? `https://arxiv.org/abs/${p.externalIds.ArXiv}` : ''),
    authors: (p.authors || []).map(a => a.name),
    citationCount: p.citationCount || null
  }));

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: items }));
  } catch (e) { console.log('Cache write error:', e); }

  return items;
}

/* — Local publications.json — */
async function tryLocalPublicationsJson() {
  const r = await fetch('./publications.json', {
    cache: 'no-store',
    signal: AbortSignal.timeout(5000)
  });
  if (!r.ok) throw new Error('no local publications.json');
  const j = await r.json();
  return Array.isArray(j) ? j : (j.publications || j.items || []);
}

/* — Render publications list — */
function renderPublications(items) {
  if (LIST) LIST.innerHTML = '';
  if (!items || !items.length) {
    if (EMPTY) EMPTY.classList.remove('hidden');
    if (STATUS) STATUS.textContent = 'No data';
    return;
  }
  if (EMPTY) EMPTY.classList.add('hidden');
  const top = items.sort((a, b) => (b.year || 0) - (a.year || 0)).slice(0, 8);

  if (LIST) {
    for (const p of top) {
      const li = document.createElement('li');
      li.className = 'pb-6 border-b border-slate-200 last:border-0';
      const authors  = Array.isArray(p.authors) ? p.authors.join(', ') : (p.authors || '');
      const abstract = p.abstract || p.tldr || '';
      li.innerHTML = `
        <h3 class="text-lg font-semibold mb-2">
          <a class="text-slate-700 hover:text-brand transition-colors" href="${p.url || '#'}" target="_blank">${p.title || 'Untitled'}</a>
        </h3>
        ${p.venue || p.year ? `<p class="text-sm text-slate-500 mb-2">${p.venue || ''}${p.year ? ` (${p.year})` : ''}</p>` : ''}
        ${authors ? `<p class="text-xs text-slate-600 mb-3">${authors}</p>` : ''}
        ${abstract ? `
          <div data-abstractbox class="text-sm text-slate-600 leading-relaxed mb-3">
            <button type="button" data-toggle="abstract" class="inline-flex items-center gap-1 text-xs text-brand bg-cyan-50 hover:bg-cyan-100 px-2 py-1 rounded-full transition-colors">
              <span>Abstract</span>
              <svg class="w-3 h-3 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <div data-full class="hidden mt-2 text-xs text-slate-700">${abstract}</div>
          </div>
        ` : ''}
        ${p.citationCount ? `
          <div class="inline-flex items-center gap-1 text-xs text-brand bg-cyan-50 px-2 py-1 rounded-full">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h4l4 4"/>
            </svg>
            ${p.citationCount} citations
          </div>` : ''}
      `;
      LIST.appendChild(li);
    }

    LIST.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-toggle="abstract"]');
      if (!btn) return;
      const box    = btn.closest('[data-abstractbox]');
      const fullEl = box.querySelector('[data-full]');
      const arrow  = btn.querySelector('svg');
      fullEl.classList.toggle('hidden');
      arrow.classList.toggle('rotate-180');
    });
  }

  if (STATUS) STATUS.textContent = 'Loaded';
  renderLatest3(items);
  buildAndRenderCloudFrom(items);
}

/* --------------------------------------------------------------------------
   GitHub repos
   -------------------------------------------------------------------------- */
const GH_STATUS = document.getElementById('gh-status');
const GH_LIST   = document.getElementById('gh-list');

function renderRepos(repos) {
  if (!GH_LIST) return;
  GH_LIST.innerHTML = '';
  if (!repos || !repos.length) {
    if (GH_STATUS) GH_STATUS.textContent = 'No repositories';
    return;
  }
  const top = repos
    .filter(r => !r.fork)
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 6);

  for (const r of top) {
    const card = document.createElement('article');
    card.className = 'card p-6 group';
    card.innerHTML = `
      <div class="relative z-10">
        <div class="flex items-start justify-between gap-3 mb-3">
          <h3 class="text-lg font-semibold">
            <a class="text-slate-700 hover:text-brand transition-colors" href="${r.html_url}" target="_blank">${r.name}</a>
          </h3>
          <div class="text-xs flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-1 rounded-full shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-3 w-3">
              <path d="M12 .587l3.668 7.431L24 9.753l-6 5.847 1.416 8.263L12 19.771l-7.416 4.092L6 15.6 0 9.753l8.332-1.735z"/>
            </svg>
            ${r.stargazers_count || 0}
          </div>
        </div>
        <p class="text-sm text-slate-600 leading-relaxed mb-4">${r.description || 'No description available'}</p>
        <div class="flex items-center gap-4 text-xs text-slate-500">
          ${r.language ? `<span class="inline-flex items-center gap-1"><span class="h-2 w-2 rounded-full inline-block bg-neutral-400"></span>${r.language}</span>` : ''}
        </div>
      </div>
    `;
    GH_LIST.appendChild(card);
  }
  if (GH_STATUS) GH_STATUS.textContent = 'Loaded';
}

async function tryGitHubAPI() {
  const CACHE_KEY = 'github_repos_v1';
  const CACHE_TTL = 1 * 60 * 60 * 1000; // 1 h

  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log('Using cached GitHub repos');
      return cached.data;
    }
  } catch (e) { console.log('Cache read error:', e); }

  const r = await fetch('https://api.github.com/users/lseman/repos?per_page=100&sort=updated', {
    headers: { 'Accept': 'application/vnd.github+json' },
    signal: AbortSignal.timeout(10000)
  });
  if (r.status === 429 || r.status === 403) throw new Error('Rate limited by GitHub API');
  if (!r.ok) throw new Error('github api failed');

  const data = await r.json();
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
  } catch (e) { console.log('Cache write error:', e); }

  return data;
}

/* --------------------------------------------------------------------------
   Scholar metrics (via Semantic Scholar)
   -------------------------------------------------------------------------- */
(async function loadScholarMetrics() {
  const MOUNT          = document.getElementById('scholar-metrics');
  const METRICS_STATUS = document.getElementById('sch-m-status');
  if (!MOUNT) return;

  const CACHE_KEY = 'scholar_metrics_cache_v1';
  const TTL_MS    = 24 * 60 * 60 * 1000; // 24 h

  function render({ hIndex, citationCount, paperCount }) {
    const parts = [];
    if (citationCount != null) parts.push(`Citations: <strong>${citationCount.toLocaleString?.() ?? citationCount}</strong>`);
    if (hIndex       != null) parts.push(`h-index: <strong>${hIndex}</strong>`);
    if (paperCount   != null) parts.push(`Papers: <strong>${paperCount}</strong>`);
    MOUNT.innerHTML = parts.length > 0 ? parts.join(' &bull; ') : 'Scholar metrics loading...';
  }

  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cached && (Date.now() - cached.ts) < TTL_MS) { render(cached.data); return; }
  } catch { /* ignore */ }

  // Wait for the publications fetch to populate cachedAuthorData (15 s max)
  await Promise.race([authorDataReady, new Promise(r => setTimeout(r, 15000))]);

  async function getAuthorDetails(id) {
    const r = await fetch(
      `https://api.semanticscholar.org/graph/v1/author/${id}?fields=name,url,citationCount,hIndex,paperCount`,
      { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(10000) }
    );
    if (r.status === 429) throw new Error('Rate limited');
    if (!r.ok) throw new Error('author details failed');
    return r.json();
  }

  try {
    if (METRICS_STATUS) METRICS_STATUS.textContent = 'Loading metrics...';

    // Determine authorId: prefer the one set by the publications fetch,
    // but do our own lookup when returning from cache didn't populate it.
    let authorId = cachedAuthorData?.authorId ?? null;
    let authorSnapshot = cachedAuthorData;

    if (!authorId) {
      const authorQuery = encodeURIComponent('Laio O. Seman');
      const sr = await fetch(
        `https://api.semanticscholar.org/graph/v1/author/search?query=${authorQuery}&limit=5&fields=name,authorId,citationCount,hIndex`,
        { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(10000) }
      );
      if (sr.status === 429) throw new Error('Rate limited');
      if (!sr.ok) throw new Error('author search failed');
      const sj = await sr.json();
      const candidate = (sj?.data || []).find(a => /laio/i.test(a.name || '')) || (sj?.data || [])[0];
      if (!candidate?.authorId) throw new Error('no authorId found');
      authorId = candidate.authorId;
      authorSnapshot = candidate;
    }

    const detail = await getAuthorDetails(authorId);
    const data = {
      hIndex:        detail.hIndex        ?? authorSnapshot?.hIndex        ?? null,
      citationCount: detail.citationCount ?? authorSnapshot?.citationCount ?? null,
      paperCount:    detail.paperCount    ?? null
    };
    render(data);
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch { /* ignore */ }
  } catch (error) {
    console.log('Scholar metrics error:', error.message);
    if (METRICS_STATUS) METRICS_STATUS.textContent = 'Metrics temporarily unavailable';
  }
})();

/* --------------------------------------------------------------------------
   Word cloud
   -------------------------------------------------------------------------- */
const CLOUD_STATUS  = document.getElementById('cloud-status');
const TOP_TERMS_OL  = document.getElementById('top-terms');

const STOP = new Set(
  'a,an,and,are,as,at,be,by,for,from,has,have,in,is,its,of,on,or,that,the,to,was,were,with,via,using,into,through,do,does,did,not,can,could,may,might,will,would,should,we,you,they,our,this,these,those,over,under,between,within'
  .split(',')
);

function buildCorpus(items) {
  return items.map(p => [p.title, p.abstract, p.tldr].filter(Boolean).join(' ')).join(' ');
}

function computeFrequencies(text) {
  const counts = new Map();
  for (const tok of (text.match(/[A-Za-zÀ-ÖØ-öø-ÿ0-9\-]+/g) || []).map(t => t.toLowerCase())) {
    if (tok.length < 3 || STOP.has(tok)) continue;
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
  list.innerHTML = '';
  for (const [term, count] of data.slice(0, 15)) {
    const li = document.createElement('li');
    li.innerHTML = `<span class="inline-block px-2 py-0.5 rounded-full border border-neutral-200 me-2 text-xs">${count}</span>${term}`;
    list.appendChild(li);
  }
}

function renderWordCloud(pairs) {
  const canvas = document.getElementById('wordcloud');
  if (!canvas || !window.WordCloud) return;
  const rect  = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width  = rect.width  * ratio;
  canvas.height = rect.height * ratio;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const max  = pairs.length ? Math.max(...pairs.map(([, w]) => w)) : 1;
  const list = pairs.map(([t, w]) => [t, Math.max(8, Math.round(8 + 40 * (w / max)))]);
  WordCloud(canvas, {
    list,
    gridSize: Math.round(8 * ratio),
    shrinkToFit: true,
    drawOutOfBound: false,
    backgroundColor: 'transparent',
    origin: [rect.width / 2, rect.height / 2],
    color: () => '#0891b2',
  });
}

function buildAndRenderCloudFrom(items) {
  try {
    if (CLOUD_STATUS) CLOUD_STATUS.textContent = 'Building…';
    const pairs = topN(computeFrequencies(buildCorpus(items)), 60);
    renderTopTerms(TOP_TERMS_OL, pairs);
    renderWordCloud(pairs);
    if (CLOUD_STATUS) CLOUD_STATUS.textContent = 'Loaded';
  } catch {
    if (CLOUD_STATUS) CLOUD_STATUS.textContent = 'Unavailable';
  }
}

/* --------------------------------------------------------------------------
   Init data loaders
   -------------------------------------------------------------------------- */
(async () => {
  try {
    if (STATUS) STATUS.textContent = 'Loading from cache...';
    const items = await trySemanticScholar();
    if (STATUS) STATUS.textContent = 'Loaded from Semantic Scholar';
    renderPublications(items);
    // Note: _authorDataResolve was already called inside trySemanticScholar
  } catch (e1) {
    console.log('Semantic Scholar failed:', e1.message);
    _authorDataResolve(null); // unblock metrics loader immediately on failure
    try {
      if (STATUS) STATUS.textContent = 'Trying local file...';
      const items = await tryLocalPublicationsJson();
      if (STATUS) STATUS.textContent = 'Loaded from local file';
      renderPublications(items);
    } catch (e2) {
      console.log('Local file failed:', e2.message);
      if (STATUS) {
        const msg = document.createElement('div');
        msg.className = 'text-sm bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4';
        msg.innerHTML = `
          <p class="font-semibold mb-2">📝 Note: Using fallback publication data</p>
          <p class="text-xs text-slate-600">The Semantic Scholar API is temporarily unavailable.
          Create a <code class="bg-slate-100 px-1 rounded">publications.json</code> file to avoid this.
          Data will be cached for 6 hours after the first successful load.</p>
        `;
        const container = document.querySelector('#publications .card');
        if (container) container.insertBefore(msg, container.firstChild);
        STATUS.textContent = 'Using fallback data';
      }
      renderPublications(FALLBACK_PUBLICATIONS);
    }
  }
})();

(async () => {
  try {
    if (GH_STATUS) GH_STATUS.textContent = 'Loading repositories...';
    const repos = await tryGitHubAPI();
    renderRepos(repos);
    try {
      const cached = JSON.parse(localStorage.getItem('github_repos_v1') || 'null');
      if (GH_STATUS) GH_STATUS.textContent = cached ? 'Loaded (cached)' : 'Loaded';
    } catch { /* ignore */ }
  } catch (e) {
    console.log('GitHub API failed:', e.message);
    if (GH_STATUS) {
      GH_STATUS.textContent = 'Temporarily unavailable';
      GH_STATUS.className = GH_STATUS.className.replace('text-slate-500', 'text-orange-600');
    }
    const section = document.getElementById('github');
    if (section) {
      const msg = document.createElement('div');
      msg.className = 'text-sm bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8 max-w-2xl';
      msg.innerHTML = `
        <p class="font-semibold mb-1">⚠️ GitHub API temporarily unavailable</p>
        <p class="text-xs text-slate-600">This usually means rate limiting. The page will use cached data if available.</p>
      `;
      const container = section.querySelector('.container');
      if (container && container.children[1]) container.insertBefore(msg, container.children[1]);
    }
  }
})();

/* --------------------------------------------------------------------------
   Active nav highlight on scroll
   -------------------------------------------------------------------------- */
(function initActiveNav() {
  const header = document.getElementById('site-header');
  const links  = Array.from(document.querySelectorAll('header nav a[href^="#"]'));
  const secs   = links.map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);

  if (!header || !links.length || !secs.length) return;

  const setActive = (id) => {
    const current   = document.querySelector('header nav a[aria-current="page"]');
    const newActive = document.querySelector(`header nav a[href="#${CSS.escape(id)}"]`);
    if (current === newActive) return;
    if (current)   current.removeAttribute('aria-current');
    if (newActive) newActive.setAttribute('aria-current', 'page');
  };

  const pickMostVisible = () => {
    const topPad = header.offsetHeight + 16;
    let bestSection = null, bestScore = -Infinity;
    for (const section of secs) {
      const rect          = section.getBoundingClientRect();
      const vh            = window.innerHeight;
      if (rect.bottom < topPad || rect.top > vh) continue;
      const visibleTop    = Math.max(rect.top, topPad);
      const visibleBottom = Math.min(rect.bottom, vh);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      if (visibleHeight <= 0) continue;
      const score = visibleHeight / rect.height * 2
        - Math.abs((rect.top + rect.bottom) / 2 - vh / 2) / vh * 0.5;
      if (score > bestScore) { bestScore = score; bestSection = section; }
    }
    if (bestSection) setActive(bestSection.id);
  };

  window.addEventListener('scroll', () => {
    clearTimeout(window._scrollNavTimeout);
    window._scrollNavTimeout = setTimeout(pickMostVisible, 100);
  }, { passive: true });

  pickMostVisible();
})();
