'use strict';
const slides = [...document.querySelectorAll('.slide')];
const byId = id => document.getElementById(id);
let current = 0;
function show(index, scroll = true) {
  current = Math.max(0, Math.min(slides.length - 1, index));
  slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
  byId('counter').textContent = `${String(current + 1).padStart(2, '0')} / ${slides.length}`;
  byId('chapter').textContent = slides[current].querySelector('.eyebrow').firstChild.textContent;
  byId('progress-bar').style.width = `${(current + 1) / slides.length * 100}%`;
  byId('prev').disabled = current === 0;
  byId('next').disabled = current === slides.length - 1;
  if (location.hash !== `#slide-${current + 1}`) history.replaceState(null, '', `#slide-${current + 1}`);
  if (scroll) {
    if (document.body.classList.contains('reading')) slides[current].scrollIntoView({block: 'start'});
    else window.scrollTo(0, 0);
  }
}
function fromHash() {
  const match = location.hash.match(/^#slide-(\d+)$/);
  show(match ? Number(match[1]) - 1 : 0, false);
}
function toggleIndex(force) {
  const open = force ?? byId('slide-index').hidden;
  byId('slide-index').hidden = !open;
  byId('index-toggle').setAttribute('aria-expanded', String(open));
  if (open) byId('slide-index').querySelector('a').focus();
}
byId('prev').onclick = () => show(current - 1);
byId('next').onclick = () => show(current + 1);
byId('index-toggle').onclick = () => toggleIndex();
byId('notes-toggle').onclick = () => {
  byId('notes-toggle').setAttribute('aria-pressed', String(document.body.classList.toggle('show-notes')));
};
byId('mode-toggle').onclick = () => {
  const reading = document.body.classList.toggle('reading');
  byId('mode-toggle').setAttribute('aria-pressed', String(reading));
  byId('mode-toggle').textContent = reading ? 'Slides' : 'Leitura';
  show(current);
};
byId('fullscreen').onclick = async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { byId('fullscreen').textContent = 'Use F11'; }
};
byId('print').onclick = async () => {
  if (window.MathJax?.startup?.promise) await window.MathJax.startup.promise;
  window.print();
};
byId('slide-index').onclick = event => {
  const link = event.target.closest('a');
  if (!link) return;
  event.preventDefault();
  toggleIndex(false);
  show(Number(link.hash.split('-')[1]) - 1);
  slides[current].setAttribute('tabindex', '-1');
  slides[current].focus({preventScroll: true});
};
document.addEventListener('keydown', event => {
  if (event.target.closest('input,textarea,select,button,summary,a,[contenteditable]')) return;
  if (['ArrowRight','PageDown','ArrowLeft','PageUp','Home','End'].includes(event.key)) event.preventDefault();
  if (['ArrowRight','PageDown'].includes(event.key)) show(current + 1);
  if (['ArrowLeft','PageUp'].includes(event.key)) show(current - 1);
  if (event.key === 'Home') show(0);
  if (event.key === 'End') show(slides.length - 1);
  if (event.key.toLowerCase() === 'n') byId('notes-toggle').click();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !byId('slide-index').hidden) {
    toggleIndex(false); byId('index-toggle').focus();
  }
});
window.addEventListener('hashchange', fromHash);
const mu0 = 4 * Math.PI * 1e-7;
const number = (n, digits = 3) => n.toLocaleString('pt-BR', {maximumFractionDigits: digits, minimumFractionDigits: digits});
function lab() {
  const g = Number(byId('gap').value) / 1000;
  const i = Number(byId('current').value);
  const mur = Number(byId('mur').value);
  const rfe = .3 / (mu0 * mur * 1e-4), rg = g / (mu0 * 1e-4);
  const r = rfe + rg, phi = 500 * i / r, b = phi / 1e-4, l = 500 ** 2 / r;
  byId('gap-label').textContent = `${number(g * 1000, 2)} mm`;
  byId('current-label').textContent = `${number(i, 2)} A`;
  byId('mur-label').textContent = number(mur, 0);
  byId('lab-results').innerHTML = [
    ['Indução B', `${number(b)} T`], ['Fluxo Φ', `${number(phi * 1e6, 2)} µWb`],
    ['Indutância L', `${number(l * 1000, 2)} mH`], ['Energia W', `${number(.5 * l * i * i * 1000)} mJ`]
  ].map(([label, value]) => `<p>${label}<strong>${value}</strong></p>`).join('');
  byId('gap-bar').setAttribute('width', String(560 * rg / r));
  byId('bar-text').textContent = `${number(100 * rg / r, 1)}% no ar · ${number(100 * rfe / r, 1)}% no ferro`;
  byId('linear-warning').textContent = b > 1.5 ? 'B > 1,5 T: investigue saturação com a curva real. O modelo linear continua calculando sem limitar B.' : 'Preveja: ao dobrar g, B cai exatamente à metade? Compare a parcela de relutância do ferro.';
}
['gap','current','mur'].forEach(id => byId(id).addEventListener('input', lab));
function bh() {
  const ni = Number(byId('bh-ni').value), g = .001, ell = .3;
  const material = h => mu0 * h + 1.5 * Math.tanh(h / 150);
  const x = h => 65 + h / 4000 * 500, y = b => 325 - b / 1.9 * 300;
  let path = '';
  for (let h = 0; h <= 4000; h += 5) path += `${h ? 'L' : 'M'}${x(h)},${y(material(h))}`;
  byId('bh-material').setAttribute('d', path);
  // Clip the load line analytically to the visible chart domain.
  const hStart = Math.max(0, (ni - 1.9 * g / mu0) / ell);
  const hEnd = Math.min(4000, ni / ell);
  byId('bh-load').setAttribute('d', `M${x(hStart)},${y(mu0 / g * (ni - ell * hStart))}L${x(hEnd)},${y(mu0 / g * (ni - ell * hEnd))}`);
  let lo = 0, hi = ni / ell;
  for (let step = 0; step < 70; step++) {
    const mid = (lo + hi) / 2;
    if (ell * mid + g * material(mid) / mu0 < ni) lo = mid; else hi = mid;
  }
  const h = (lo + hi) / 2, b = material(h);
  byId('bh-point').setAttribute('cx', x(h)); byId('bh-point').setAttribute('cy', y(b));
  byId('bh-ni-label').textContent = `${number(ni, 0)} A·esp`;
  byId('bh-result').textContent = `Interseção: Hfe = ${number(h, 1)} A/m · B = ${number(b)} T`;
}
byId('bh-ni').addEventListener('input', bh);
fromHash(); lab(); bh();
