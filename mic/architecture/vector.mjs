// A deliberately bounded illustration, independent of the scalar simulator.
export function mountVectorView(host) {
  host.innerHTML = `<div class="rvv-view">
    <h5>Vector execution · a possible RVV implementation</h5>
    <p>One vector instruction operates on several elements. Configure the architectural registers and the implementation's lanes to see how the work is divided. This is an illustration, not an RVV simulator; the workbench does not execute vector instructions.</p>
    <div class="study-controls rvv-controls">
      <label>Register width VLEN <select data-rvv="vlen"><option>128</option><option>256</option><option>512</option></select> bits</label>
      <label>Element width SEW <select data-rvv="sew"><option>8</option><option selected>32</option><option>64</option></select> bits</label>
      <label>Active elements vl <select data-rvv="vl"></select></label>
      <label>Execution lanes <select data-rvv="lanes"><option>1</option><option selected>2</option><option>4</option></select></label>
    </div>
    <div class="rvv-flow" aria-label="Conceptual vector datapath">
      <div class="rvv-block"><b>Scalar front end</b><span>fetch · decode · issue</span><code>vadd.vv v3, v1, v2</code></div><div class="rvv-arrow" aria-hidden="true">→</div>
      <div class="rvv-block"><b>Vector control</b><span>vl + vtype (SEW, LMUL)</span><span>schedule active elements</span></div><div class="rvv-arrow" aria-hidden="true">→</div>
      <div class="rvv-block rvv-register"><b>Vector register file</b><span>32 architectural registers · v0–v31</span><div data-rvv-register></div></div><div class="rvv-arrow" aria-hidden="true">→</div>
      <div class="rvv-block rvv-execution"><b>Vector execution lanes</b><span>v1[i] + v2[i] → v3[i]</span><div data-rvv-lanes></div></div>
      <div class="rvv-memory"><b>Vector load/store unit ↔ memory</b><span>Moves elements between memory and the vector register file; scalar registers supply addresses.</span></div>
    </div>
    <p class="study-note" data-rvv-summary role="status" aria-live="polite"></p>
    <p class="study-source">This example fixes LMUL = 1 and uses an unmasked, element-wise add. VLMAX = VLEN / SEW; elements at or above vl are tail elements, whose resulting contents depend on the tail policy. The lanes and scheduling shown are one possible implementation, not an ISA requirement. The round count assumes one element per lane per round and ignores startup, memory, and other timing effects. RVV also supports masking, register groups, and many other operations. <a href="https://docs.riscv.org/reference/isa/unpriv/v-st-ext.html" target="_blank" rel="noopener noreferrer">RISC-V vector specification ↗</a></p>
  </div>`;
  const get = key => host.querySelector(`[data-rvv="${key}"]`);
  function update(event) {
    const vlen = Number(get('vlen').value), sew = Number(get('sew').value);
    const max = vlen / sew, vlControl = get('vl');
    const old = vlControl.options.length ? Number(vlControl.value) : max;
    if (event?.target !== vlControl) {
      const vl = Math.min(old, max);
      vlControl.innerHTML = Array.from({length:max + 1}, (_, i) => `<option value="${i}" ${i === vl ? 'selected' : ''}>${i}</option>`).join('');
    }
    const vl = Number(vlControl.value), lanes = Number(get('lanes').value);
    host.querySelector('[data-rvv-register]').innerHTML = `<div class="rvv-elements">${Array.from({length:max}, (_, i) => `<span class="${i < vl ? 'active' : 'tail'}" title="Element ${i}: ${i < vl ? 'active' : 'tail'}">${i}</span>`).join('')}</div><small>v1 elements · colored = active, pale = tail</small>`;
    host.querySelector('[data-rvv-lanes]').innerHTML = Array.from({length:lanes}, (_, lane) => {
      const elements = Array.from({length:vl}, (_, i) => i).filter(i => i % lanes === lane);
      return `<div class="rvv-lane"><b>Lane ${lane}</b><span>${elements.length ? elements.map(i => `e${i}`).join(' · ') : 'idle'}</span></div>`;
    }).join('');
    host.querySelector('[data-rvv-summary]').textContent = `VLMAX = ${vlen} / ${sew} = ${max} elements. With vl = ${vl}, ${vl} active element${vl === 1 ? '' : 's'} take ${Math.ceil(vl / lanes)} illustrative execution round${Math.ceil(vl / lanes) === 1 ? '' : 's'} across ${lanes} lane${lanes === 1 ? '' : 's'}.`;
  }
  host.querySelectorAll('[data-rvv]').forEach(control => control.addEventListener('change', update));
  update();
}
