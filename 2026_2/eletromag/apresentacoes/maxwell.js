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
const eps0 = 8.8541878128e-12;
const number = (value, digits = 2) => value.toLocaleString('pt-BR', {minimumFractionDigits: digits, maximumFractionDigits: digits});
const metric = (label, value, extra = '') => `<p>${label}<strong>${value}</strong>${extra ? `<small>${extra}</small>` : ''}</p>`;
function updateFlux() {
  const f = Number(byId('flux-frequency').value);
  const degrees = Number(byId('flux-phase').value);
  const phase = degrees * Math.PI / 180;
  const fluxPeak = .0025 * .020;
  const emfPeak = 200 * fluxPeak * 2 * Math.PI * f;
  byId('flux-frequency-value').textContent = `${f} Hz`;
  byId('flux-phase-value').textContent = `${degrees}°`;
  byId('flux-results').innerHTML = metric('Fluxo por espira', `${number(fluxPeak * Math.cos(phase) * 1e6)} µWb`) +
    metric('Fem na bobina', `${number(emfPeak * Math.sin(phase), 3)} V`) +
    metric('Amplitude da fem', `${number(emfPeak, 3)} V`) + metric('Amplitude do fluxo', '50,00 µWb');
  const path = fn => Array.from({length: 241}, (_, i) => {
    const p = i / 240 * 2 * Math.PI;
    return `${i ? 'L' : 'M'}${45 + i / 240 * 520},${160 - 110 * fn(p)}`;
  }).join(' ');
  byId('flux-path').setAttribute('d', path(Math.cos));
  byId('emf-path').setAttribute('d', path(Math.sin));
  const x = 45 + degrees / 360 * 520;
  byId('phase-marker').setAttribute('d', `M${x} 40V280`);
}
function updateCapacitor() {
  const rate = Number(byId('cap-rate').value);
  const radius = Number(byId('cap-radius').value) / 1000;
  const a = .05, d = .001;
  const capacitance = eps0 * Math.PI * a * a / d;
  const id = capacitance * rate * 1e6;
  const enclosed = id * Math.min(1, (radius / a) ** 2);
  const b = radius === 0 ? 0 : mu0 * enclosed / (2 * Math.PI * radius);
  byId('cap-rate-value').textContent = `${rate} V/µs`;
  byId('cap-radius-value').textContent = `${number(radius * 100, 1)} cm`;
  byId('cap-results').innerHTML = metric('Corrente de deslocamento', `${number(id * 1e3)} mA`) +
    metric('Campo Bφ', `${number(b * 1e9)} nT`, radius <= a ? 'Dentro do raio das placas' : 'Fora do raio das placas') +
    metric('Corrente envolvida', `${number(enclosed * 1e3, 3)} mA`) + metric('Capacitância', `${number(capacitance * 1e12, 1)} pF`);
}
['flux-frequency','flux-phase'].forEach(id => byId(id).addEventListener('input', updateFlux));
['cap-rate','cap-radius'].forEach(id => byId(id).addEventListener('input', updateCapacitor));
// Print answers as well as prompts, restoring the authored disclosure state afterwards.
let printDetails = [];
window.addEventListener('beforeprint', () => {
  printDetails = [...document.querySelectorAll('details')].map(el => [el, el.open]);
  printDetails.forEach(([el]) => { el.open = true; });
});
window.addEventListener('afterprint', () => {
  printDetails.forEach(([el, wasOpen]) => { el.open = wasOpen; });
});
fromHash();
updateFlux();
updateCapacitor();
