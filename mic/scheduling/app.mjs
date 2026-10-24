import { MODES, simulate } from './model.mjs';
const $ = selector => document.querySelector(selector);
const descriptions = {
  freertos: { kicker: 'EXPERIMENT A / PRIORITY & PREEMPTION', title: 'An urgent task joins the ready queue.', description: 'A and B start at priority 2. C becomes ready at t = 3 with priority 4. Each task has a finite CPU burst.', note: 'Single-core model; one tick per unit; A/B run for 6 units each, C for 3. No explicit yields, ISR cost, tickless idle, or SMP. Cooperative tasks run to burst completion. “Blocked” before t = 3 means C is waiting for its release event.' },
  eevdf: { kicker: 'EXPERIMENT B / ELIGIBILITY & VIRTUAL DEADLINES', title: 'Fair service, one request at a time.', description: 'Three continuously runnable tasks compete. A requests 1 unit, B requests 2, and C requests 4. Weights set their proportional shares.', note: 'Illustrative EEVDF core: normalized weights; all tasks always runnable; eligibility and dispatch re-evaluated each unit; ties use task ID. Linux-specific sleep placement, request protection, hierarchy, and runqueue implementation are omitted. Virtual time is not milliseconds.' },
  rt: { kicker: 'EXPERIMENT C / PRIORITY INVERSION', title: 'The most urgent task is waiting for a lock.', description: 'A (priority 10) holds a mutex for 4 CPU units. C (90) arrives at t = 1 and needs it. B (50) arrives at t = 2 with 7 units of work.', note: 'Idealized SCHED_FIFO + mutex model; the toggle controls this mutex’s priority inheritance, not CONFIG_PREEMPT_RT itself. All dispatch and lock operations take zero time. No IRQ load, RT throttling, migration, or deadline guarantee is modeled.' },
};
const options = { freertos: { slicing: true, preemption: true }, eevdf: { weight: 2, slice: 2 }, rt: { inheritance: true } };
const requested = new URLSearchParams(location.search).get('mode');
let mode = MODES.includes(requested) ? requested : 'freertos';
let frames = [], tick = 0, timer = null;
const colorClass = id => `task-${id.toLowerCase()}`;
function pause() { clearInterval(timer); timer = null; $('#play').textContent = '▶ Play'; $('#play').setAttribute('aria-pressed', 'false'); }
function renderParameters() {
  $('#parameters').innerHTML = mode === 'freertos'
    ? `<label><input type="checkbox" data-option="preemption" ${options.freertos.preemption ? 'checked' : ''}> Preemption</label><label><input type="checkbox" data-option="slicing" ${options.freertos.slicing ? 'checked' : ''}> Equal-priority time slicing</label>`
    : mode === 'eevdf'
      ? `<label>B weight <select data-option="weight">${[1, 2, 4].map(n => `<option ${options.eevdf.weight === n ? 'selected' : ''}>${n}</option>`).join('')}</select></label><label>B request size <select data-option="slice">${[1, 2, 4].map(n => `<option value="${n}" ${options.eevdf.slice === n ? 'selected' : ''}>${n} unit${n > 1 ? 's' : ''}</option>`).join('')}</select></label><span>All tasks runnable · A/C weight = 1</span>`
      : `<label><input type="checkbox" data-option="inheritance" ${options.rt.inheritance ? 'checked' : ''}> Mutex priority inheritance</label><span>Fixed priorities: A = 10 · B = 50 · C = 90</span>`;
}
function load(nextMode, updateURL = true) {
  pause(); mode = nextMode; tick = 0;
  frames = simulate(mode, options[mode]);
  const d = descriptions[mode];
  $('#experiment-kicker').textContent = d.kicker;
  $('#experiment-title').textContent = d.title;
  $('#experiment-description').textContent = d.description;
  $('#model-note').textContent = d.note;
  $('#theory-link').href = `#${mode}`;
  document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
  if (updateURL) { const url = new URL(location.href); url.searchParams.set('mode', mode); history.replaceState(null, '', url); }
  renderParameters(); buildTimeline(); render();
}
function buildTimeline() {
  const labels = ['CPU 0', ...frames[0].tasks.map(t => `${t.id} · ${t.name.split(' ')[0]}`)];
  $('#timeline').innerHTML = `<div class="timeline-row"><span class="row-label">TIME →</span>${frames.map(f => `<span class="tick-label">${f.time}</span>`).join('')}</div>` + labels.map((label, row) => `<div class="timeline-row"><span class="row-label">${label}</span>${frames.map(f => {
    const task = f.tasks[row - 1];
    const running = row === 0 ? f.running : task.id === f.running ? task.id : null;
    const blocked = task?.state.includes('blocked');
    const ready = task && ['ready', 'eligible'].includes(task.state);
    const className = running && running !== 'idle' ? colorClass(running) : blocked ? 'waiting' : ready ? 'ready' : '';
    const text = running === 'idle' ? '·' : running ?? (blocked ? '×' : ready ? '·' : '');
    return `<button class="timeline-cell ${className}" data-time="${f.time}" title="t = ${f.time}: ${row === 0 ? f.running : `${task.id}, ${task.state}`}" aria-label="Inspect time ${f.time}, ${row === 0 ? `CPU runs ${f.running}` : `${task.id} ${task.state}`}">${text}</button>`;
  }).join('')}</div>`).join('');
}
function render() {
  const frame = frames[tick];
  $('#time').value = tick;
  $('#time-readout').textContent = `t = ${tick}`;
  $('#previous').disabled = tick === 0;
  $('#step').disabled = tick === frames.length - 1;
  document.querySelectorAll('[data-time]').forEach(cell => { const time = Number(cell.dataset.time); cell.classList.toggle('selected', time === tick); cell.classList.toggle('future', time > tick); cell.setAttribute('aria-pressed', String(time === tick)); });
  const headers = mode === 'eevdf' ? ['Task', 'State', 'vᵢ', 'Lag', 'dᵢ', 'CPU'] : mode === 'rt' ? ['Task', 'State', 'Base → eff.', 'Left'] : ['Task', 'State', 'Priority', 'Left'];
  $('#state-head').innerHTML = `<tr>${headers.map(h => `<th scope="col">${h}</th>`).join('')}</tr>`;
  $('#state-body').innerHTML = frame.tasks.map(task => {
    const cells = mode === 'eevdf' ? [task.state, task.vruntime.toFixed(2), task.lag.toFixed(2), task.deadline.toFixed(2), task.service]
      : mode === 'rt' ? [task.state, `${task.priority} → ${task.effective}`, task.remaining] : [task.state, task.priority, task.remaining];
    return `<tr><th scope="row"><span class="task-dot ${colorClass(task.id)}"></span>${task.id}</th>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
  }).join('');
  $('#decision-title').textContent = frame.running === 'idle' ? 'CPU idle' : `${frame.running} takes the CPU`;
  $('#decision-text').textContent = frame.reason;
  $('#decision-extra').textContent = mode === 'eevdf' ? `Service before t = ${tick}: ${frame.tasks.map(t => `${t.id} ${t.service}`).join(' / ')} units`
    : mode === 'rt' ? `Mutex: ${frame.locked ? 'owned by A' : 'released'} · C first runs at t = ${frames.find(f => f.running === 'C')?.time ?? '—'}`
      : `C first runs at t = ${frames.find(f => f.running === 'C')?.time ?? '—'} · × waiting for release · · ready`;
}
function move(next) { tick = Math.max(0, Math.min(frames.length - 1, next)); if (tick === frames.length - 1) pause(); render(); }
function play() {
  if (timer) { pause(); return; }
  if (tick === frames.length - 1) move(0);
  $('#play').textContent = 'Ⅱ Pause'; $('#play').setAttribute('aria-pressed', 'true');
  timer = setInterval(() => move(tick + 1), Number($('#speed').value));
}
$('#play').addEventListener('click', play);
$('#step').addEventListener('click', () => { pause(); move(tick + 1); });
$('#previous').addEventListener('click', () => { pause(); move(tick - 1); });
$('#reset').addEventListener('click', () => { pause(); move(0); });
$('#time').addEventListener('input', event => { pause(); move(Number(event.target.value)); });
$('#speed').addEventListener('change', () => { if (timer) { pause(); play(); } });
$('#timeline').addEventListener('click', event => { const cell = event.target.closest('[data-time]'); if (cell) { pause(); move(Number(cell.dataset.time)); } });
$('#parameters').addEventListener('change', event => { const field = event.target; if (!field.dataset.option) return; options[mode][field.dataset.option] = field.type === 'checkbox' ? field.checked : Number(field.value); load(mode); });
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => load(button.dataset.mode)));
document.querySelectorAll('[data-launch]').forEach(button => button.addEventListener('click', () => { load(button.dataset.launch); location.hash = 'lab'; $('#experiment-title').setAttribute('tabindex', '-1'); $('#experiment-title').focus({ preventScroll: true }); }));
const navLinks = [...document.querySelectorAll('.sidebar nav a')];
function updateNavigation() {
  const sections = navLinks.map(link => document.querySelector(link.hash));
  const offset = innerWidth <= 850 ? 165 : 120;
  const active = sections.filter(section => section.getBoundingClientRect().top <= offset).at(-1) ?? sections[0];
  navLinks.forEach(link => { if (link.hash === `#${active.id}`) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
}
let scrollPending = false;
window.addEventListener('scroll', () => { if (!scrollPending) { scrollPending = true; requestAnimationFrame(() => { updateNavigation(); scrollPending = false; }); } }, { passive: true });
window.addEventListener('resize', updateNavigation);
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
window.addEventListener('pagehide', pause);
load(mode, false); updateNavigation();
