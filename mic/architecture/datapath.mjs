import { executionFrames } from './model.mjs';
import { datapathSVG } from './datapath-svg.mjs';

// This view owns its lesson clock; the workbench retains its own CPU state.
const baseline = document.querySelector('#svg89').parentElement;
const host = document.createElement('section');
host.className = 'wide-datapath';
host.hidden = true;
baseline.after(host);
const controls = document.createElement('div');
controls.className = 'study-controls';
controls.innerHTML = `<label for="datapath-mode">Datapath architecture <select id="datapath-mode"><option value="baseline">Scalar · five-stage workbench</option><option value="superscalar">Superscalar · two-wide in order</option><option value="ooo">Superscalar · two-wide out of order</option></select></label>`;
baseline.before(controls);
let mode = 'baseline', index = 0;
const baselineNotes = baseline.parentElement.querySelector('.datapath-notes');
const legend = baseline.parentElement.querySelector('.datapath-legend');
const intro = baseline.parentElement.querySelector('.datapath-intro');
controls.querySelector('select').addEventListener('change', event => {
  mode = event.target.value; index = 0;
  const wide = mode !== 'baseline';
  baseline.hidden = wide; host.hidden = !wide;
  baselineNotes.hidden = wide; legend.hidden = wide; intro.hidden = wide;
  if (wide) render();
});
const ids = rows => rows.map(r => `I${r.id + 1}`).join(', ') || '—';
function render() {
  const frames = executionFrames(mode), f = frames[index], ooo = mode === 'ooo';
  const waiting = f.rows.filter(r => !r.issued);
  const issued = f.rows.filter(r => r.issued === f.cycle && f.cycle > 0);
  const complete = f.rows.filter(r => r.done && !r.committed);
  const committed = f.rows.filter(r => r.committed);
  host.innerHTML = `<p><strong>${ooo?'Two-wide out-of-order':'Two-wide in-order'} scheduling · cycle ${f.cycle}</strong></p>
  <p>This diagram uses the six-instruction teaching program below and its own clock. Both machines issue and commit up to two instructions per cycle. The schematic shows RV32I hardware around the scheduler; dashed blocks are architectural context outside the timed model. ${ooo?'Ready younger work can bypass I2; producer tags keep register versions distinct.':'A blocked oldest instruction prevents younger issue, even with a free ALU.'}</p>
  <div class="study-controls"><button type="button" data-wide="back" ${index===0?'disabled':''}>← Back</button><button type="button" data-wide="next" ${index===frames.length-1?'disabled':''}>Next cycle →</button><button type="button" data-wide="reset" ${index===0?'disabled':''}>Reset diagram</button><span>${committed.length} / 6 committed · ${issued.length} / 2 issue slots used</span></div>
  <div class="study-scroll" tabindex="0" role="region" aria-label="Scrollable RISC-V superscalar datapath">${datapathSVG(f, mode)}</div>
  <p class="study-note" role="status" aria-live="polite">${f.note}</p>
  <div class="study-scroll"><table class="study-table"><caption>Teaching program · producer dependencies and progress</caption><thead><tr><th>Instruction</th><th>Producer tags</th><th>State</th><th>Issue</th><th>Complete</th><th>Commit</th></tr></thead><tbody>${f.rows.map(r=>`<tr><td><code>I${r.id+1} · ${r.asm}</code></td><td>${ids(r.deps.map(d=>f.rows[d]))}</td><td>${r.committed?'Committed':r.done?'Complete, waiting to commit':r.issued?'Executing':r.deps.some(d=>!f.rows[d].done)?'Waiting for data':'Ready'}</td><td>${r.issued||'—'}</td><td>${r.done||'—'}</td><td>${r.committed||'—'}</td></tr>`).join('')}</tbody></table></div>
  <p class="study-source">Bounded scheduling model: all six instructions start in the window. Two ALUs and one pipelined load unit; load latency 4, ALU latency 1. Results wake dependents in the completion cycle; ordered commit starts the next cycle. Producer IDs represent renaming; physical allocation, fetch/decode timing, branches, exceptions and memory ordering are shown only as context, not simulated. The workbench Run/Step controls operate the scalar CPU; use Next cycle here.</p>`;
  host.querySelectorAll('[data-wide]').forEach(button=>button.addEventListener('click',()=>{
    const action = button.dataset.wide;
    index = action === 'reset' ? 0 : index + (action === 'next' ? 1 : -1);
    render(); host.querySelector(`[data-wide="${action}"]`).focus();
  }));
}
