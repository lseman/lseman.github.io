(() => {
  const updateProgress = () => {
    const available = document.documentElement.scrollHeight - innerHeight;
    const progress = available > 0 ? Math.min(1, Math.max(0, scrollY / available)) : 0;
    document.body.style.setProperty('--reading-progress', progress);
  };
  addEventListener('scroll', updateProgress, { passive:true });
  addEventListener('resize', updateProgress, { passive:true });
  updateProgress();
})();

(() => {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  // Check for saved theme preference or default to 'light'
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

  if (isDark) {
    document.body.classList.add('dark-mode');
    themeToggle.innerHTML = '<span aria-hidden="true">☀️</span>';
  } else {
    themeToggle.innerHTML = '<span aria-hidden="true">🌙</span>';
  }

  themeToggle.addEventListener('click', () => {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    if (isDarkMode) {
      localStorage.setItem('theme', 'dark');
      themeToggle.innerHTML = '<span aria-hidden="true">☀️</span>';
    } else {
      localStorage.setItem('theme', 'light');
      themeToggle.innerHTML = '<span aria-hidden="true">🌙</span>';
    }
  });
})();

(() => {
  const summary = document.querySelector('.chapter-summary');
  if (!summary) return;
  const links = [...summary.querySelectorAll('a[href^="#"]')];
  const entries = links.map(link => {
    let id = link.getAttribute('href').slice(1);
    try { id = decodeURIComponent(id); } catch (_) {}
    return { link, item: link.closest('li'), target: document.getElementById(id) };
  }).filter(entry => entry.target);
  if (!entries.length) return;

  const activate = entry => {
    entries.forEach(e => {
      const active = e === entry;
      e.item.classList.toggle('is-active', active);
      active ? e.link.setAttribute('aria-current', 'location')
             : e.link.removeAttribute('aria-current');
    });
    // Keep the active item visible inside a long, independently scrolling TOC.
    const box = summary.getBoundingClientRect();
    const row = entry.item.getBoundingClientRect();
    if (row.top < box.top || row.bottom > box.bottom) {
      entry.item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  };

  const updateFromScroll = () => {
    const threshold = Math.max(120, window.innerHeight * .22);
    let current = entries[0];
    for (const entry of entries) {
      if (entry.target.getBoundingClientRect().top <= threshold) current = entry;
      else break;
    }
    activate(current);
  };
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { updateFromScroll(); scheduled = false; });
  };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  links.forEach(link => link.addEventListener('click', () => {
    const entry = entries.find(e => e.link === link);
    if (entry) activate(entry);
  }));
  updateFromScroll();
})();