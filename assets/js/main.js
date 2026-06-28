/* ==========================================================================
   main.js – Academic Portfolio for Laio O. Seman
   ========================================================================== */

document.documentElement.classList.add('js');

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
   Hero topic Tetris
   -------------------------------------------------------------------------- */
(function initTopicTetris() {
  const canvas = document.getElementById('topic-tetris');
  const fallbackTerms = [
    'optimization',
    'forecasting',
    'routing',
    'branch-price',
    'time series',
    'machine learning',
    'decomposition',
    'neural models',
    'decision systems',
    'column generation',
    'teaching tools',
    'open source',
  ];

  let terms = fallbackTerms.slice();
  window.__updateHeroTetrisTerms = (nextTerms) => {
    const cleaned = Array.from(new Set((nextTerms || [])
      .map(term => String(term || '').trim().toLowerCase())
      .filter(term => term.length >= 3)))
      .slice(0, 28);
    if (cleaned.length) terms = cleaned;
  };

  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const COLS = 10;
  const ROWS = 18;
  const SHAPES = [
    [[0, 0], [1, 0], [2, 0], [3, 0]],
    [[0, 0], [1, 0], [0, 1], [1, 1]],
    [[1, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [0, 1], [1, 1]],
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[0, 0], [0, 1], [1, 1], [2, 1]],
    [[2, 0], [0, 1], [1, 1], [2, 1]],
  ];
  const COLORS = ['#2dd4bf', '#a78bfa', '#fbbf24', '#67e8f9', '#f472b6'];

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

  function normalize(cells) {
    const minX = Math.min(...cells.map(([x]) => x));
    const minY = Math.min(...cells.map(([, y]) => y));
    return cells.map(([x, y]) => [x - minX, y - minY]);
  }

  function rotate(cells) {
    return normalize(cells.map(([x, y]) => [y, -x]));
  }

  function shapeSize(cells) {
    return {
      width: Math.max(...cells.map(([x]) => x)) + 1,
      height: Math.max(...cells.map(([, y]) => y)) + 1,
    };
  }

  function randomTerm() {
    return terms[Math.floor(Math.random() * terms.length)] || fallbackTerms[0];
  }

  function randomPiece() {
    let cells = normalize(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
    const rotations = Math.floor(Math.random() * 4);
    for (let i = 0; i < rotations; i++) cells = rotate(cells);
    const size = shapeSize(cells);
    return {
      cells,
      col: Math.floor(Math.random() * Math.max(1, COLS - size.width + 1)),
      row: -size.height,
      term: randomTerm(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
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

  function isValid(piece, col = piece.col, row = piece.row, cells = piece.cells) {
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
      const rotated = rotate(current.cells);
      if (isValid(current, current.col, current.row, rotated)) current.cells = rotated;
    }
  }

  function clearLines() {
    const remaining = board.filter(row => !row.every(Boolean));
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
        label: index === 0 ? current.term : '',
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

  function roundedRect(x, y, width, height, radius) {
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
  }

  function hexToRgba(hex, alpha) {
    const value = hex.replace('#', '');
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function drawCell(col, row, color, label = '') {
    if (row < 0) return;
    const gap = Math.max(2, block * 0.08);
    const x = offsetX + col * block + gap;
    const y = offsetY + row * block + gap;
    const size = block - gap * 2;
    roundedRect(x, y, size, size, Math.max(5, block * 0.14));
    ctx.fillStyle = hexToRgba(color, 0.52);
    ctx.fill();
    ctx.strokeStyle = hexToRgba(color, 0.95);
    ctx.lineWidth = 1;
    ctx.stroke();

    if (label && block > 24) {
      ctx.fillStyle = 'rgba(255,255,255,0.78)';
      ctx.font = `${Math.max(6, block * 0.2)}px "IBM Plex Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label.slice(0, 3), x + size / 2, y + size / 2);
    }
  }

  function drawGrid() {
    const boardWidth = COLS * block;
    const boardHeight = ROWS * block;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
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
    const label = piece.term.length > 18 ? `${piece.term.slice(0, 16)}...` : piece.term;
    ctx.font = `600 ${Math.max(9, block * 0.29)}px "IBM Plex Mono", monospace`;
    const labelWidth = Math.min(block * COLS, Math.max((maxCol - minCol + 1) * block, ctx.measureText(label).width + block * 0.8));
    const x = Math.max(offsetX, Math.min(offsetX + COLS * block - labelWidth, offsetX + minCol * block));
    const y = Math.max(offsetY + 2, offsetY + minRow * block - block * 0.58);

    roundedRect(x, y, labelWidth, block * 0.48, block * 0.2);
    ctx.fillStyle = 'rgba(8,9,15,0.76)';
    ctx.fill();
    ctx.strokeStyle = hexToRgba(piece.color, 0.72);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.86)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + labelWidth / 2, y + block * 0.24);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) drawCell(x, y, cell.color, cell.label);
      });
    });
    if (current) {
      current.cells.forEach(([dx, dy]) => {
        drawCell(current.col + dx, current.row + dy, current.color);
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

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) start();
      else stop();
    });
    observer.observe(canvas);
  } else {
    start();
  }

  window.addEventListener('resize', () => {
    stop();
    if (!resize()) return;
    lastStep = 0;
    raf = requestAnimationFrame(loop);
  }, { passive: true });
})();

/* --------------------------------------------------------------------------
   Scroll reveal
   -------------------------------------------------------------------------- */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('show'));
    return;
  }

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

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

function safeExternalUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(String(value), window.location.href);
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function safeInteger(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.round(number)) : null;
}

/* — DOM refs — */
const STATUS = document.getElementById('pub-status');
const LIST = document.getElementById('pub-list');
const EMPTY = document.getElementById('pub-empty');
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
/* Classify a paper into a research area tag based on title/venue keywords */
function classifyPaper(p) {
  const text = ((p.title || '') + ' ' + (p.venue || '') + ' ' + (p.abstract || '')).toLowerCase();
  const orKw = /routing|vehicle|vrp|branch|price|decompos|scheduling|combinatorial|integer|linear programming|column generation|operations research|milp|ilp|heuristic|metaheuristic|exact method|optimization/;
  const tsKw = /forecast|time.?series|temporal|sequence|attention|transformer|lstm|recurrent|prediction|autoregressive/;
  const mlKw = /machine learning|deep learning|neural|reinforcement|graph neural|embedding|classification|regression|convolutional|bert|gpt|language model/;
  if (tsKw.test(text)) return 'ml';
  if (orKw.test(text)) return 'or';
  if (mlKw.test(text)) return 'ml';
  return 'or'; // default for academic OR/ML researcher
}

function renderPublications(items) {
  if (LIST) LIST.innerHTML = '';
  if (!items || !items.length) {
    if (EMPTY) EMPTY.classList.remove('hidden');
    if (STATUS) STATUS.textContent = 'No data';
    return;
  }
  if (EMPTY) EMPTY.classList.add('hidden');
  const top = items.sort((a, b) => (b.year || 0) - (a.year || 0)).slice(0, 10);

  if (LIST) {
    top.forEach((p, idx) => {
      const li = document.createElement('li');
      const area = classifyPaper(p);
      li.className = 'pub-card reveal';
      li.dataset.area = area;
      const rawAuthors = Array.isArray(p.authors)
        ? p.authors.map(author => String(author)).join(', ')
        : (p.authors || '');
      const authors = escapeHtml(rawAuthors);
      const abstract = escapeHtml(p.abstract || p.tldr || '');
      const title = escapeHtml(p.title || 'Untitled');
      const venue = escapeHtml(p.venue || '');
      const year = safeInteger(p.year);
      const url = safeExternalUrl(p.url);
      const citationCount = safeInteger(p.citationCount);
      const tagLabel = area === 'or' ? 'OR' : area === 'ml' ? 'ML' : 'TS';
      const titleMarkup = url
        ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>`
        : title;
      li.innerHTML = `
        <div class="pub-card-left">
          <span class="pub-index mono">${String(idx + 1).padStart(2, '0')}</span>
          <div class="pub-card-line"></div>
        </div>
        <div class="pub-card-body">
          <div class="pub-card-meta">
            <span class="pub-tag pub-tag-${area}">${tagLabel}</span>
            ${year ? `<span class="pub-year mono">${year}</span>` : ''}
            ${venue ? `<span class="pub-venue">${venue}</span>` : ''}
          </div>
          <h3 class="pub-title">
            ${titleMarkup}
          </h3>
          ${authors ? `<p class="pub-authors">${authors}</p>` : ''}
          <div class="pub-card-footer">
            ${abstract ? `
              <button type="button" class="pub-abstract-btn" data-toggle="abstract">
                <svg class="pub-abstract-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Abstract
                <svg class="pub-abstract-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>` : ''}
            ${citationCount ? `
              <span class="pub-cite-badge">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h4l4 4"/>
                </svg>
                ${citationCount}
              </span>` : ''}
            ${url ? `
              <a href="${url}" target="_blank" rel="noopener noreferrer" class="pub-link-btn">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                Read
              </a>` : ''}
          </div>
          ${abstract ? `<div data-full class="pub-abstract-body hidden">${abstract}</div>` : ''}
        </div>
      `;
      LIST.appendChild(li);
      setTimeout(() => li.classList.add('show'), idx * 60);
    });

    LIST.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-toggle="abstract"]');
      if (!btn) return;
      const card = btn.closest('.pub-card-body');
      const fullEl = card.querySelector('[data-full]');
      const arrow = btn.querySelector('.pub-abstract-arrow');
      fullEl.classList.toggle('hidden');
      arrow.classList.toggle('rotate-180');
    });
  }

  if (STATUS) STATUS.textContent = 'Loaded';
  buildAndRenderCloudFrom(items);
}

/* Publication filter buttons */
(function initPubFilters() {
  const btns = document.querySelectorAll('.pub-filter-btn');
  if (!btns.length) return;
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('.pub-card').forEach(card => {
        const show = filter === 'all' || card.dataset.area === filter;
        card.style.display = show ? '' : 'none';
      });
    });
  });
})();

/* --------------------------------------------------------------------------
   GitHub repos
   -------------------------------------------------------------------------- */
const GH_STATUS = document.getElementById('gh-status');
const GH_LIST = document.getElementById('gh-list');

function renderRepos(repos) {
  if (!GH_LIST) return;
  GH_LIST.innerHTML = '';
  if (!repos || !repos.length) {
    if (GH_STATUS) GH_STATUS.textContent = 'No repositories';
    return;
  }
  const ownRepos = repos.filter(r => !r.fork);
  const top = ownRepos
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 6);

  for (const r of top) {
    const repoUrl = safeExternalUrl(r.html_url);
    const repoName = escapeHtml(r.name || 'Repository');
    const repoDescription = escapeHtml(r.description || 'No description available');
    const repoLanguage = escapeHtml(r.language || '');
    const stars = safeInteger(r.stargazers_count) || 0;
    const repoTitle = repoUrl
      ? `<a class="text-slate-700 hover:text-brand transition-colors" href="${repoUrl}" target="_blank" rel="noopener noreferrer">${repoName}</a>`
      : repoName;
    const card = document.createElement('article');
    card.className = 'card p-6 group';
    card.innerHTML = `
      <div class="relative z-10">
        <div class="flex items-start justify-between gap-3 mb-3">
          <h3 class="text-lg font-semibold">
            ${repoTitle}
          </h3>
          <div class="text-xs flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-1 rounded-full shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-3 w-3">
              <path d="M12 .587l3.668 7.431L24 9.753l-6 5.847 1.416 8.263L12 19.771l-7.416 4.092L6 15.6 0 9.753l8.332-1.735z"/>
            </svg>
            ${stars}
          </div>
        </div>
        <p class="text-sm text-slate-600 leading-relaxed mb-4">${repoDescription}</p>
        <div class="flex items-center gap-4 text-xs text-slate-500">
          ${repoLanguage ? `<span class="inline-flex items-center gap-1"><span class="h-2 w-2 rounded-full inline-block bg-neutral-400"></span>${repoLanguage}</span>` : ''}
        </div>
      </div>
    `;
    GH_LIST.appendChild(card);
  }
  if (GH_STATUS) GH_STATUS.textContent = 'Loaded';
  // Update profile stat with real repo count
  const reposEl = document.getElementById('stat-repos');
  if (reposEl) {
    reposEl.dataset.target = ownRepos.length;
    animateCountUp(reposEl, ownRepos.length, '');
  }
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
   Profile stat counters — defined BEFORE loadScholarMetrics so the hook
   exists when the cached-metrics path fires synchronously.
   -------------------------------------------------------------------------- */
function animateCountUp(el, target, suffix) {
  const duration = 1400;
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(ease * target) + (suffix || '');
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function updateProfileStats({ citationCount, paperCount, hIndex } = {}) {
  // hero card stats
  const citEl = document.getElementById('stat-citations');
  const papersEl = document.getElementById('stat-papers');
  const hEl = document.getElementById('stat-hindex');
  const reposEl = document.getElementById('stat-repos');
  if (citEl && citationCount != null) animateCountUp(citEl, citationCount, '');
  if (papersEl && paperCount != null) { papersEl.dataset.target = paperCount; animateCountUp(papersEl, paperCount, ''); }
  if (hEl && hIndex != null) animateCountUp(hEl, hIndex, '');
  if (reposEl && reposEl.dataset.target) animateCountUp(reposEl, parseInt(reposEl.dataset.target, 10), '');

  // publications sidebar stats
  const gsCit = document.getElementById('gs-citations');
  const gsH = document.getElementById('gs-hindex');
  const gsPap = document.getElementById('gs-papers');
  if (gsCit && citationCount != null) animateCountUp(gsCit, citationCount, '');
  if (gsH && hIndex != null) animateCountUp(gsH, hIndex, '');
  if (gsPap && paperCount != null) animateCountUp(gsPap, paperCount, '');
}
window.__updateProfileStats = updateProfileStats;

/* --------------------------------------------------------------------------
   Scholar metrics (via Semantic Scholar)
   -------------------------------------------------------------------------- */
(async function loadScholarMetrics() {
  const CACHE_KEY = 'scholar_metrics_cache_v1';
  const TTL_MS = 24 * 60 * 60 * 1000; // 24 h

  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cached && (Date.now() - cached.ts) < TTL_MS) {
      window.__updateProfileStats(cached.data);
      return;
    }
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
      hIndex: detail.hIndex ?? authorSnapshot?.hIndex ?? null,
      citationCount: detail.citationCount ?? authorSnapshot?.citationCount ?? null,
      paperCount: detail.paperCount ?? null
    };
    window.__updateProfileStats(data);
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch { /* ignore */ }
  } catch (error) {
    console.log('Scholar metrics error:', error.message);
  }
})();

/* --------------------------------------------------------------------------
   Word cloud
   -------------------------------------------------------------------------- */
const CLOUD_STATUS = document.getElementById('cloud-status');
const TOP_TERMS_OL = document.getElementById('top-terms');

const STOP = new Set((
  // articles, conjunctions, prepositions
  'a,an,and,are,as,at,be,by,for,from,has,have,in,is,its,of,on,or,that,the,to,was,were,with,via,into,through,over,under,between,within,without,about,above,after,against,along,among,around,before,behind,below,beside,beyond,during,except,inside,near,off,onto,out,outside,since,toward,towards,upon,per,' +
  // pronouns & determiners
  'we,you,they,he,she,it,i,me,my,our,your,their,his,her,us,who,whom,whose,which,what,this,these,those,each,every,any,all,both,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,' +
  // auxiliaries & common verbs
  'do,does,did,done,doing,be,been,being,have,had,having,will,would,shall,should,may,might,must,can,could,also,just,even,still,already,yet,often,well,much,many,its,ago,' +
  // academic filler — discourse & rhetorical
  'propose,proposes,proposed,proposing,present,presents,presented,presenting,introduce,introduces,introduced,show,shows,showed,shown,showing,demonstrate,demonstrates,demonstrated,study,studies,studied,investigate,investigates,investigated,examine,examines,examined,explore,explores,explored,develop,develops,developed,consider,considers,considered,provide,provides,provided,address,addresses,addressed,achieve,achieves,achieved,apply,applies,applied,based,use,used,uses,using,make,made,makes,making,find,finds,found,finding,give,gives,given,include,includes,included,compare,compared,compares,extend,extends,extended,evaluate,evaluates,evaluated,analyze,analyzes,analyzed,analyse,analyses,analysed,improve,improves,improved,allow,allows,allowed,require,requires,required,obtain,obtains,obtained,yield,yields,yielded,derive,derives,derived,define,defines,defined,compute,computes,computed,focus,focuses,focused,formulate,formulates,formulated,describe,describes,described,discuss,discusses,discussed,design,designs,designed,build,builds,built,test,tests,tested,validate,validates,validated,verify,verifies,verified,train,trains,trained,learn,learns,learned,solve,solves,solved,tackle,tackles,tackled,handle,handles,handled,combine,combines,combined,integrate,integrates,integrated,leverage,leverages,leveraged,exploit,exploits,exploited,' +
  // generic academic nouns/adjectives that add no topic signal
  'paper,work,approach,method,framework,system,model,task,problem,result,results,performance,experiment,experiments,evaluation,analysis,data,dataset,set,number,type,way,case,form,level,point,order,part,terms,term,value,values,different,new,large,high,low,small,general,specific,various,several,current,existing,previous,recent,further,additional,key,main,first,second,two,three,one,zero,based,via,well,however,therefore,thus,hence,moreover,furthermore,additionally,consequently,respectively,namely,i.e,e.g,et,al,fig,table,section,equation,eq,theorem,lemma,proof,et'
).split(','));

function buildCorpus(items) {
  return items.map(p => [p.title, p.abstract, p.tldr].filter(Boolean).join(' ')).join(' ');
}

function computeFrequencies(text) {
  const counts = new Map();
  for (const tok of (text.match(/[A-Za-zÀ-ÖØ-öø-ÿ0-9\-]+/g) || []).map(t => t.toLowerCase())) {
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
  list.innerHTML = '';
  for (const [term, count] of data.slice(0, 15)) {
    const li = document.createElement('li');
    li.innerHTML = `<span class="inline-block px-2 py-0.5 rounded-full border border-neutral-200 me-2 text-xs">${safeInteger(count) || 0}</span>${escapeHtml(term)}`;
    list.appendChild(li);
  }
}

function renderWordCloud(pairs) {
  const canvas = document.getElementById('wordcloud');
  if (!canvas || !window.WordCloud) return;
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const max = pairs.length ? Math.max(...pairs.map(([, w]) => w)) : 1;
  const list = pairs.map(([t, w]) => [t, Math.max(8, Math.round(8 + 40 * (w / max)))]);
  const palette = ['#fbbf24', '#2dd4bf', '#f472b6', '#a78bfa', '#67e8f9'];
  WordCloud(canvas, {
    list,
    gridSize: Math.round(8 * ratio),
    shrinkToFit: true,
    drawOutOfBound: false,
    backgroundColor: 'transparent',
    origin: [rect.width / 2, rect.height / 2],
    color: () => palette[Math.floor(Math.random() * palette.length)],
  });
}

function buildAndRenderCloudFrom(items) {
  try {
    if (CLOUD_STATUS) CLOUD_STATUS.textContent = 'Building…';
    const pairs = topN(computeFrequencies(buildCorpus(items)), 60);
    if (window.__updateHeroTetrisTerms) {
      window.__updateHeroTetrisTerms(pairs.map(([term]) => term));
    }
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
          <p class="font-semibold mb-2">Note: Using fallback publication data</p>
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
        <p class="font-semibold mb-1">GitHub API temporarily unavailable</p>
        <p class="text-xs text-slate-600">This usually means rate limiting. The page will use cached data if available.</p>
      `;
      const container = section.querySelector('.container');
      if (container && container.children[1]) container.insertBefore(msg, container.children[1]);
    }
  }
})();

/* --------------------------------------------------------------------------
   Space-flight background canvas
   -------------------------------------------------------------------------- */
(function initNeuralCanvas() {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, stars, orbiters, raf;

  const COLORS = ['#c4b5fd', '#2dd4bf', '#fbbf24', '#67e8f9'];

  function resize() {
    const section = canvas.closest('section') || canvas.parentElement;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    W = section.offsetWidth;
    H = section.offsetHeight;
    canvas.width = Math.round(W * ratio);
    canvas.height = Math.round(H * ratio);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    createField();
  }

  function createField() {
    const starCount = Math.round(Math.min(120, Math.max(64, W / 13)));
    stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      size: 0.8 + Math.random() * 1.8,
      phase: Math.random() * Math.PI * 2,
      speed: 0.006 + Math.random() * 0.012,
      color: Math.random() > 0.72 ? COLORS[Math.floor(Math.random() * COLORS.length)] : '#ffffff',
    }));

    orbiters = Array.from({ length: W < 700 ? 3 : 6 }, (_, index) => ({
      cx: W * (0.58 + Math.random() * 0.36),
      cy: H * (0.2 + Math.random() * 0.58),
      rx: W * (0.1 + Math.random() * 0.18),
      ry: H * (0.035 + Math.random() * 0.095),
      tilt: -0.45 + Math.random() * 0.9,
      angle: Math.random() * Math.PI * 2,
      speed: (0.0012 + Math.random() * 0.0014) * (index % 2 ? 1 : -1),
      size: 6 + Math.random() * 4,
      color: COLORS[index % COLORS.length],
    }));
  }

  function drawStar(star) {
    star.phase += star.speed;
    const alpha = 0.28 + Math.max(0, Math.sin(star.phase)) * 0.5;
    const size = star.size;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = star.color;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(star.x - size, star.y);
    ctx.lineTo(star.x + size, star.y);
    ctx.moveTo(star.x, star.y - size);
    ctx.lineTo(star.x, star.y + size);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawOrbiter(orbiter) {
    orbiter.angle += orbiter.speed;

    ctx.save();
    ctx.translate(orbiter.cx, orbiter.cy);
    ctx.rotate(orbiter.tilt);
    ctx.strokeStyle = 'rgba(196,181,253,0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, orbiter.rx, orbiter.ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    const x = Math.cos(orbiter.angle) * orbiter.rx;
    const y = Math.sin(orbiter.angle) * orbiter.ry;
    const tangent = Math.atan2(Math.cos(orbiter.angle) * orbiter.ry, -Math.sin(orbiter.angle) * orbiter.rx);

    ctx.translate(x, y);
    ctx.rotate(tangent);
    ctx.strokeStyle = 'rgba(255,255,255,0.64)';
    ctx.fillStyle = 'rgba(235,234,242,0.86)';
    ctx.lineWidth = 1;
    ctx.fillRect(-orbiter.size * 0.34, -orbiter.size * 0.34, orbiter.size * 0.68, orbiter.size * 0.68);
    ctx.strokeRect(-orbiter.size * 0.34, -orbiter.size * 0.34, orbiter.size * 0.68, orbiter.size * 0.68);

    ctx.fillStyle = orbiter.color;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(-orbiter.size * 1.7, -orbiter.size * 0.18, orbiter.size * 1.05, orbiter.size * 0.36);
    ctx.fillRect(orbiter.size * 0.65, -orbiter.size * 0.18, orbiter.size * 1.05, orbiter.size * 0.36);
    ctx.globalAlpha = 1;

    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.beginPath();
    ctx.moveTo(-orbiter.size * 0.65, 0);
    ctx.lineTo(-orbiter.size * 1.7, 0);
    ctx.moveTo(orbiter.size * 0.65, 0);
    ctx.lineTo(orbiter.size * 1.7, 0);
    ctx.stroke();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(drawStar);
    orbiters.forEach(drawOrbiter);
  }

  function loop() { draw(); raf = requestAnimationFrame(loop); }

  function start() {
    resize();
    loop();
  }

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !raf) start();
    else if (!entries[0].isIntersecting && raf) { cancelAnimationFrame(raf); raf = null; }
  });
  obs.observe(canvas.closest('section') || canvas.parentElement);

  window.addEventListener('resize', () => {
    resize();
    if (!raf) start();
  }, { passive: true });
})();

/* --------------------------------------------------------------------------
   Hero typewriter rotation
   -------------------------------------------------------------------------- */
(function initHeroTypewriter() {
  const el = document.getElementById('hero-typewriter');
  if (!el) return;

  const phrases = [
    'better decisions',
    'optimal forecasts',
    'structured learning',
    'smarter algorithms',
    'rigorous ML systems',
  ];

  let phraseIdx = 0, charIdx = 0, deleting = false;

  function tick() {
    const current = phrases[phraseIdx];
    if (!deleting) {
      charIdx++;
      el.textContent = current.slice(0, charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(tick, 2200);
        return;
      }
      setTimeout(tick, 68);
    } else {
      charIdx--;
      el.textContent = current.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(tick, 380);
        return;
      }
      setTimeout(tick, 38);
    }
  }

  // start after a short delay so the page has settled
  setTimeout(tick, 1400);
})();


/* --------------------------------------------------------------------------
   Active nav highlight on scroll
   -------------------------------------------------------------------------- */
(function initActiveNav() {
  const header = document.getElementById('site-header');
  const links = Array.from(document.querySelectorAll('header nav a[href^="#"]'));
  const secs = links.map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);

  if (!header || !links.length || !secs.length) return;

  const setActive = (id) => {
    const current = document.querySelector('header nav a[aria-current="page"]');
    const newActive = document.querySelector(`header nav a[href="#${CSS.escape(id)}"]`);
    if (current === newActive) return;
    if (current) current.removeAttribute('aria-current');
    if (newActive) newActive.setAttribute('aria-current', 'page');
  };

  const pickMostVisible = () => {
    const topPad = header.offsetHeight + 16;
    let bestSection = null, bestScore = -Infinity;
    for (const section of secs) {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < topPad || rect.top > vh) continue;
      const visibleTop = Math.max(rect.top, topPad);
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
