import { executionFrames, cacheFrames } from './model.mjs';
const root = document.querySelector('#architecture');
const modes = {
  scalar:{ title:'One issue slot, ordered issue', flow:['Ready window','Issue ×1','Execute','Commit ×1'], text:'A long load prevents the dependent I2 from issuing. With in-order issue, I3 and I4 wait behind it even though their operands are ready.', question:'Watch I2: when does it become ready? Then compare the two-wide machine.' },
  superscalar:{ title:'Two issue slots, still in order', flow:['Ready window','Issue ×2','2 ALUs + load unit','Commit ×2'], text:'Superscalar means multiple instructions can issue per cycle. Here the oldest unissued instruction still gates younger work. Extra width helps after the load, but cannot bypass its blocked consumer.', question:'Find a cycle where two instructions issue. Find the earlier cycles where width is unused.' },
  ooo:{ title:'Ready instructions can pass a blocked one', flow:['Rename / window','Select ready ×2','2 ALUs + load unit','ROB → commit ×2'], text:'The scheduler chooses up to two ready instructions, oldest first. Independent I3 and I4 can execute while I2 waits. A reorder buffer preserves program-order commitment: finished work can still wait behind the load.', question:'Watch I3 finish before I2. Does it commit first? Track I5: it reads the earlier x3 from I3, even when I6 writes a new x3.' },
  dynamic:{ title:'Dynamic loop cache · SBB-based', text:'Hardware learns a short backward-branch loop. The first pass detects it, the next fills storage, and later passes replay. Try a call inside the body: a different control-flow instruction interrupts capture.' },
  static:{ title:'Static loop cache · software-selected hot regions', text:'Boot software selects and copies code regions, then programs address-range registers. Runtime hardware chooses the buffer by PC range. Calls and returns do not invalidate it; a helper outside the selected regions still reads IMEM.' },
};
root.innerHTML = `<div class="max-w-7xl mx-auto px-6">
<p class="eyebrow">STUDY PATHS / BEYOND THE BASELINE</p>
<h2>Change one architectural idea.<br>See what it changes.</h2>
<p class="study-intro">Start with issue width, then scheduling, then instruction reuse. These are independent design choices: a superscalar core may execute in order or out of order, and either can use a loop buffer. The five-stage workbench above remains the detailed baseline.</p>
<div class="study-tabs" role="tablist" aria-label="Architecture study path">${Object.keys(modes).map((key,i) => `<button type="button" role="tab" id="study-tab-${key}" aria-controls="study-panel" aria-selected="${i===0}" tabindex="${i===0 ? 0 : -1}" data-mode="${key}">${['1 · Scalar','2 · Superscalar','3 · Out of order','4 · Dynamic loop cache','5 · Static loop cache'][i]}</button>`).join('')}</div>
<section id="study-panel" class="study-panel" role="tabpanel" aria-labelledby="study-tab-scalar" tabindex="0"></section></div>`;
let mode = 'scalar', index = 0, scenario = 'clean', capacity = 8;
const panel = root.querySelector('#study-panel');
const tabs = [...root.querySelectorAll('[role=tab]')];
function choose(key) {
  mode = key; index = 0;
  tabs.forEach(t => { const active = t.dataset.mode === mode; t.setAttribute('aria-selected',String(active)); t.tabIndex = active ? 0 : -1; });
  panel.setAttribute('aria-labelledby',`study-tab-${mode}`); render();
}
for (const [i,tab] of tabs.entries()) {
  tab.addEventListener('click',() => choose(tab.dataset.mode));
  tab.addEventListener('keydown',e => {
    const j = e.key === 'ArrowRight' ? (i+1)%tabs.length : e.key === 'ArrowLeft' ? (i+tabs.length-1)%tabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length-1 : -1;
    if (j >= 0) { e.preventDefault(); choose(tabs[j].dataset.mode); tabs[j].focus(); }
  });
}
function render() {
  const cache = mode === 'dynamic' || mode === 'static';
  const frames = cache ? cacheFrames(mode,scenario,capacity) : executionFrames(mode);
  index = Math.min(index,frames.length-1);
  const f = frames[index], m = modes[mode];
  panel.innerHTML = `<h3>${m.title}</h3><p>${m.text}</p>
  ${cache ? `<div class="study-controls"><label>Loop shape <select id="study-scenario"><option value="clean">Clean loop · 4 instructions</option><option value="call">Loop with a helper call</option><option value="large">Larger loop · 8 instructions</option></select></label><label>Buffer capacity <select id="study-capacity"><option>4</option><option>8</option><option>32</option></select> instructions</label></div>` : ''}
  <div class="study-flow" aria-label="${cache ? 'Controller states' : 'Architecture stages'}">${(cache ? mode === 'dynamic' ? ['Idle','Fill','Active'] : ['Boot preload','Ready','PC range match → buffer / IMEM'] : m.flow).map((s,i) => `${i ? '<b aria-hidden="true">→</b>' : ''}<span class="${s === f.state ? 'selected' : ''}" ${s === f.state ? 'aria-current="step"' : ''}>${s}</span>`).join('')}</div>
  <div class="study-controls"><button type="button" data-action="back" ${index===0?'disabled':''}>← Back</button><button type="button" data-action="next" ${index===frames.length-1?'disabled':''}>${cache?'Next instruction':'Next cycle'} →</button><button type="button" data-action="reset" ${index===0?'disabled':''}>Reset lesson</button><span>${cache ? `Fetch ${index} / ${frames.length-1}` : `Cycle ${f.cycle}`}</span></div>
  <div class="study-note" role="status" aria-live="polite">${f.note}</div>
  ${cache ? cacheView(f) : executionView(f) + '<p class="study-source">For this example, final commit is cycle 11 (scalar), 9 (two-wide in order), and 9 (two-wide out of order). Earlier execution alone does not guarantee an earlier final commit; the load and ordered commit still constrain progress.</p>'}
  <details class="teaching-note"><summary>Model assumptions · what this lesson measures</summary><p>${cache ? 'One event is one instruction fetch followed by its resolved control-flow signal (decode_valid = 1). No speculative fetches, prefetch queue, memory latency or handshake timing are modeled. A loop exit returns to Idle. Dynamic storage uses (PC / 4) modulo capacity. Static regions use base + (PC − start) / 4. Code is immutable. Runtime IMEM reads exclude boot copy traffic; these counts are not an energy or speed prediction.' : 'This is an issue/complete/commit scheduling lesson, not the cycle-accurate five-stage workbench. All six instructions start in the window. Load latency is four cycles, ALU latency one; one pipelined load unit and two ALUs are available. Completion can wake dependents in the same cycle; commit starts the next cycle, in order. Width limits both issue and commit. Fetch, decode, rename latency, memory ordering, exceptions and branch recovery are omitted. Producer IDs model renamed dependencies; physical-register allocation and recycling are not simulated.'}</p></details>
  ${cache ? `<p class="study-source">Source: <a href="https://arxiv.org/html/2607.22792v1">Wijnstra et al., dynamic and static loop caching (2026)</a>. Their LeNet-5 evaluation reports 48.3% fewer instruction fetches and 21.5% lower total energy for the dynamic design; these are workload-specific published results, not outputs of this lesson.</p>` : `<p class="study-source">Further study: <a href="https://docs.boom-core.org/en/latest/sections/intro-overview/boom-pipeline.html">BOOM’s pipeline</a> separates rename, issue, execution and commit in a real out-of-order RISC-V core.</p>`}`;
  for (const button of panel.querySelectorAll('[data-action]')) button.addEventListener('click',() => {
    const action = button.dataset.action;
    index = action === 'reset' ? 0 : index + (action === 'next' ? 1 : -1);
    render(); panel.querySelector(`[data-action="${action}"]`).focus();
  });
  if (cache) {
    const shape = panel.querySelector('#study-scenario'), size = panel.querySelector('#study-capacity');
    shape.value = scenario; size.value = String(capacity);
    shape.addEventListener('change',() => { scenario = shape.value; index = 0; render(); panel.querySelector('#study-scenario').focus(); });
    size.addEventListener('change',() => { capacity = Number(size.value); index = 0; render(); panel.querySelector('#study-capacity').focus(); });
  }
}
function executionView(f) {
  const state = r => r.committed ? 'Committed' : r.done ? 'Complete · awaiting commit' : r.issued ? 'Executing' : r.deps.some(d => !f.rows[d].done) ? 'Waiting for data' : 'Ready';
  return `<div class="study-scroll"><table class="study-table"><caption>Same program, same dependencies · issue and commit cycles</caption><thead><tr><th>Instruction</th><th>Reads producer</th><th>State</th><th>Issue</th><th>Complete</th><th>Commit</th></tr></thead><tbody>${f.rows.map(r => `<tr class="${r.committed?'committed':r.done?'complete':r.issued?'executing':''}"><td><code>I${r.id+1} · ${r.asm}</code></td><td>${r.deps.map(d=>`I${d+1}`).join(', ') || 'Ready inputs'}</td><td>${state(r)}</td><td>${r.issued||'—'}</td><td>${r.done||'—'}</td><td>${r.committed||'—'}</td></tr>`).join('')}</tbody></table></div><p><strong>Try to explain:</strong> ${modes[mode].question}</p><p class="study-source">Renaming example: I3 produces one version of x3; I5 keeps that producer tag. I6 creates another version of x3. The name reuse must not change I5’s input.</p>`;
}
function cacheView(f) {
  const e = f.event, slots = new Map(f.storage), count = f.hits + f.imem;
  return `<div class="study-stats"><div><strong>${f.imem}</strong><small>Runtime IMEM reads</small></div><div><strong>${f.hits}</strong><small>Buffer reads / IMEM reads avoided</small></div><div><strong>${count ? (100*f.hits/count).toFixed(1) : '0.0'}%</strong><small>Runtime fetches served by buffer</small></div></div>
  <p><strong>Instruction path:</strong> PC → ${f.hit ? 'loop storage → instruction' : 'IMEM → instruction'} · <strong>fetch_disable = ${f.hit ? 1 : 0}</strong>${e ? ` (for this fetch; controller ${f.before} → ${f.state})` : ''}</p>
  ${e ? `<p><code>PC ${e.pc} · ${e.asm}</code> · iteration ${e.iteration}<br><code>decode_valid=1 · CoF=${Number(e.cof)} · branch_taken=${Number(!!e.taken)} · next_pc=${e.next}${e.branch ? ` · imm=${-e.pc}` : ''}</code></p>` : '<p>Advance to inspect each PC, fetch source and controller transition.</p>'}
  ${mode === 'static' ? `<p><strong>Boot-configured regions:</strong> ${f.regions.map(r=>`PC ${r.start}…${r.end} → slots ${r.base}…${r.base+(r.end-r.start)/4}`).join('; ') || 'None: the selected whole region does not fit.'}</p>` : `<p><strong>Trigger:</strong> ${f.trigger ? `SBB at PC ${f.trigger.end}, target ${f.trigger.start}.` : 'No loop captured.'} Fill writes the next pass; Active serves following passes.</p>`}
  <div class="study-slots" aria-label="Instruction buffer slots">${Array.from({length:capacity},(_,i)=>`<span class="${slots.has(i)?'filled':''}">slot ${i}<br>${slots.has(i)?`PC ${slots.get(i)}`:'empty'}</span>`).join('')}</div>
  <p><strong>Try to explain:</strong> ${mode === 'dynamic' ? 'Why does activation need two taken SBBs? Why does the helper call prevent replay? Set capacity to four, then select the eight-instruction loop.' : 'Use the helper-call loop with four entries, then eight. Why can the helper miss without invalidating the main region? What must boot software know to select useful regions?'}</p>`;
}
render();
