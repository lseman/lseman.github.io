// ---- SPA Router ----
  const pages = document.querySelectorAll('.page-section');
  const navLinks = document.querySelectorAll('.nav-links a[data-page]');
  const mobileLinks = document.querySelectorAll('.mobile-menu a[data-page]');
  const allNavLinks = [...navLinks, ...mobileLinks];

  function navigateTo(hash) {
    const pageId = hash.replace('#', '') || 'home';
    const target = document.getElementById('page-' + pageId);
    if (!target) return;

    pages.forEach(p => p.classList.remove('active'));
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Update nav active state
    allNavLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('data-page') === pageId);
    });

    // Re-observe reveal elements
    const reveals = target.querySelectorAll('.reveal');
    reveals.forEach(el => {
      el.classList.remove('in');
      io.observe(el);
    });
    // Animate mission bars
    setTimeout(() => {
      target.querySelectorAll('.fill').forEach(f => {
        f.style.width = f.dataset.w + '%';
      });
    }, 100);
  }

  // Intersection Observer for reveals
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        e.target.querySelectorAll?.('.fill').forEach(f => f.style.width = f.dataset.w + '%');
        io.unobserve(e.target);
      }
    });
  }, { threshold: .15 });

  // Init
  function init() {
    const hash = window.location.hash || '#home';
    navigateTo(hash);
    io.disconnect();
    // Re-observe all reveals in active page
    const activePage = document.querySelector('.page-section.active');
    if (activePage) {
      activePage.querySelectorAll('.reveal').forEach(el => io.observe(el));
    }
  }

  // Hash change listener
  window.addEventListener('hashchange', () => navigateTo(window.location.hash));

  // Nav links
  allNavLinks.forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const page = a.getAttribute('data-page');
      window.location.hash = '#' + page;
      mm.classList.remove('open');
    });
  });

  // ---- Mobile menu ----
  const burger = document.getElementById('burger');
  const mm = document.getElementById('mobileMenu');
  burger.addEventListener('click', () => mm.classList.toggle('open'));

  // ---- Nav scroll ----
  const nav = document.getElementById('nav');
  addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40));

  // ---- Stars ----
  const cv = document.getElementById('stars'), ctx = cv.getContext('2d');
  let stars = [], w, h;
  function resize() { w = cv.width = innerWidth; h = cv.height = innerHeight;
    const n = Math.min(160, Math.floor(w * h / 9000));
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      z: Math.random() * .8 + .2, r: Math.random() * 1.3 + .2,
      tw: Math.random() * Math.PI * 2, sp: Math.random() * .015 + .004
    }));
  }
  resize(); addEventListener('resize', resize);
  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      s.tw += s.sp; const a = (.35 + .65 * (Math.sin(s.tw) * .5 + .5)) * s.z;
      s.y += s.z * .08; if (s.y > h) { s.y = 0; s.x = Math.random() * w; }
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7);
      ctx.fillStyle = s.r > 1.1 ? `rgba(102,131,255,${a})` : `rgba(255,255,255,${a})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();

  init();