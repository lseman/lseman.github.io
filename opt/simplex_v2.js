// ── Progress bar
const prog = document.getElementById('progress');
window.addEventListener('scroll', () => {
  const d = document.documentElement;
  const pct = (d.scrollTop / (d.scrollHeight - d.clientHeight)) * 100;
  prog.style.width = pct + '%';
  prog.setAttribute('aria-valuenow', String(Math.max(0, Math.min(100, Math.round(pct)))));
});

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;

  const href = link.getAttribute('href');
  if (!href || href === '#') return;

  const target = document.querySelector(href);
  if (!target) return;

  event.preventDefault();
  navLockUntil = Date.now() + 700;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  history.replaceState(null, '', href);
  syncNavToHash();
});

// ── Intersection observer for section reveal
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08 });

document.querySelectorAll('.section').forEach(s => obs.observe(s));

// ── Chapter/subtopic numbering and active sidebar state
const sections = Array.from(document.querySelectorAll('.section[id]'));
const topLinks = Array.from(document.querySelectorAll('.sidebar > .nav-link[href^="#s"]'));
const subnav = document.getElementById('subnav');
const searchInput = document.getElementById('sidebar-search');

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const chapterData = sections.map((section, index) => {
  const chapterNumber = String(index + 1).padStart(2, '0');
  const shortNumber = String(index + 1);
  const subtopics = Array.from(section.querySelectorAll(':scope > h3')).map((h3, subIndex) => {
    const subId = h3.id || `${section.id}-${slugify(h3.textContent)}`;
    h3.id = subId;

    const label = h3.textContent.trim();
    const num = `${shortNumber}.${subIndex + 1}`;

    if (!h3.querySelector('.subtopic-num')) {
      const marker = document.createElement('span');
      marker.className = 'subtopic-num';
      marker.textContent = num;
      h3.prepend(marker);
    }

    return { id: subId, label, num, el: h3 };
  });

  return {
    section,
    id: section.id,
    chapterNumber,
    shortNumber,
    title: section.querySelector('.section-title')?.textContent.trim() || section.id,
    subtopics
  };
});

let activeSectionId = chapterData[0]?.id || null;
let activeSubtopicId = chapterData[0]?.subtopics[0]?.id || null;
let navLockUntil = 0;
let searchTerm = '';

const renderSubnav = (sectionId) => {
  const chapter = chapterData.find(item => item.id === sectionId);
  if (!chapter) {
    subnav.innerHTML = '';
    subnav.classList.add('is-empty');
    return;
  }

  const visibleSubtopics = chapter.subtopics.filter(sub =>
    !searchTerm || `${chapter.title} ${sub.label} ${sub.el.textContent}`.toLowerCase().includes(searchTerm)
  );

  if (visibleSubtopics.length === 0) {
    subnav.innerHTML = '';
    subnav.classList.add('is-empty');
    return;
  }

  subnav.classList.remove('is-empty');
  subnav.innerHTML = `
    <div class="subnav-title">Chapter ${chapter.shortNumber} Topics</div>
    ${visibleSubtopics.map(sub => `
      <a href="#${sub.id}" class="subnav-link${sub.id === activeSubtopicId ? ' active' : ''}" data-subtopic-id="${sub.id}">
        <span class="subnum">${sub.num}</span>
        <span>${sub.label}</span>
      </a>
    `).join('')}
  `;
};

const updateTopNav = () => {
  topLinks.forEach(link => {
    const isActive = link.getAttribute('href') === `#${activeSectionId}`;
    link.classList.toggle('active', isActive);
    link.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
};

const updateSubtopicNav = () => {
  const subLinks = subnav.querySelectorAll('.subnav-link');
  subLinks.forEach(link => {
    const isActive = link.dataset.subtopicId === activeSubtopicId;
    link.classList.toggle('active', isActive);
    link.setAttribute('aria-current', isActive ? 'location' : 'false');
  });
};

const resolveChapterContext = (target) => {
  if (!target) return null;

  return chapterData.find(chapter =>
    chapter.id === target.id || chapter.subtopics.some(sub => sub.id === target.id) || chapter.section.contains(target)
  ) || null;
};

const applySearch = () => {
  const matches = [];

  chapterData.forEach((chapter, idx) => {
    const chapterText = `${chapter.title} ${chapter.section.textContent}`.toLowerCase();
    const chapterMatch = !searchTerm || chapterText.includes(searchTerm);

    chapter.section.style.display = chapterMatch ? '' : 'none';

    const topLink = topLinks[idx];
    if (topLink) topLink.style.display = chapterMatch ? '' : 'none';

    if (chapterMatch) matches.push(chapter);
  });

  if (!matches.length) {
    subnav.innerHTML = '<div class="subnav-title">No matches</div>';
    subnav.classList.remove('is-empty');
    return;
  }

  const activeVisible = matches.some(chapter => chapter.id === activeSectionId);
  if (!activeVisible) {
    activeSectionId = matches[0].id;
    activeSubtopicId = matches[0].subtopics[0]?.id || null;
  }

  updateTopNav();
  renderSubnav(activeSectionId);
  updateSubtopicNav();
};

const applyActiveTarget = (target) => {
  const owningChapter = resolveChapterContext(target);
  if (!owningChapter) return;

  activeSectionId = owningChapter.id;
  updateTopNav();
  renderSubnav(activeSectionId);

  const matchingSubtopic = owningChapter.subtopics.find(sub => sub.id === target.id);
  activeSubtopicId = matchingSubtopic?.id || owningChapter.subtopics[0]?.id || null;
  updateSubtopicNav();
};

const setActiveSection = (sectionId) => {
  if (!sectionId || sectionId === activeSectionId) return;
  activeSectionId = sectionId;
  const chapter = chapterData.find(item => item.id === sectionId);
  activeSubtopicId = chapter?.subtopics[0]?.id || null;
  updateTopNav();
  renderSubnav(sectionId);
  updateSubtopicNav();
};

const setActiveSubtopic = (subtopicId) => {
  if (!subtopicId) return;
  activeSubtopicId = subtopicId;
  updateSubtopicNav();
};

const syncNavToHash = () => {
  const hash = window.location.hash;
  if (!hash) return;

  const target = document.querySelector(hash);
  if (!target) return;
  applyActiveTarget(target);
};

renderSubnav(activeSectionId);
updateTopNav();
updateSubtopicNav();
syncNavToHash();

document.querySelectorAll('details.quiz').forEach((detailsEl, index) => {
  const summary = detailsEl.querySelector('summary');
  if (!summary) return;

  const body = detailsEl.querySelector('.quiz-body');
  const bodyId = body?.id || `quiz-body-${index + 1}`;
  if (body) body.id = bodyId;

  summary.setAttribute('role', 'button');
  summary.setAttribute('aria-expanded', detailsEl.open ? 'true' : 'false');
  summary.setAttribute('aria-controls', bodyId);

  detailsEl.addEventListener('toggle', () => {
    summary.setAttribute('aria-expanded', detailsEl.open ? 'true' : 'false');
  });
});

const navObs = new IntersectionObserver((entries) => {
  if (Date.now() < navLockUntil) return;
  if (searchTerm) return;
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setActiveSection(entry.target.id);
    }
  });
}, { rootMargin: '-30% 0px -55% 0px', threshold: 0.05 });

sections.forEach(section => navObs.observe(section));

const subtopicElements = chapterData.flatMap(chapter =>
  chapter.subtopics.map(sub => ({ ...sub, sectionId: chapter.id }))
);

const subtopicObs = new IntersectionObserver((entries) => {
  if (Date.now() < navLockUntil) return;
  if (searchTerm) return;
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const current = subtopicElements.find(item => item.id === entry.target.id);
      if (current) {
        if (current.sectionId !== activeSectionId) {
          activeSectionId = current.sectionId;
          updateTopNav();
          renderSubnav(activeSectionId);
        }
        setActiveSubtopic(current.id);
      }
    }
  });
}, { rootMargin: '-25% 0px -65% 0px', threshold: 0.01 });

subtopicElements.forEach(item => subtopicObs.observe(item.el));

searchInput?.addEventListener('input', (event) => {
  searchTerm = event.target.value.trim().toLowerCase();
  applySearch();
});

window.addEventListener('hashchange', () => {
  navLockUntil = Date.now() + 700;
  syncNavToHash();
});
