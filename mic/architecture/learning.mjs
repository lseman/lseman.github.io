const topics = [
  { id: 'pipeline', title: 'Pipeline fundamentals', level: 'Foundation', target: 'guide', time: 15,
    goal: 'Explain how overlapping instructions improves throughput.',
    task: 'Load the overlap example in Concepts. Step through five independent instructions and track the first instruction from IF to WB.',
    check: 'Distinguish instruction latency from throughput; name the five stages.',
    question: 'In an ideal five-stage pipeline, how many cycles do five instructions take, starting with an empty pipeline?',
    answer: '9 cycles: 5 cycles for the first instruction, then one completion per cycle for the remaining 4. In general, N + 4 cycles for this model, with no stalls or flushes. Pipelining improves throughput; it does not make one instruction take one cycle.', trap: 'Do not confuse one instruction completed per cycle with one cycle of latency.' },
  { id: 'data', title: 'Data hazards & forwarding', level: 'Foundation', target: 'guide', time: 20,
    goal: 'Predict when a dependent instruction needs to wait.',
    task: 'Run the load-use example. Find the held consumer, the advancing load and the bubble. Compare with two dependent ALU instructions.',
    check: 'Explain RAW dependencies, forwarding and the remaining load-use stall.',
    question: 'Does forwarding eliminate every data-hazard stall in this five-stage core?',
    answer: 'No. An ALU result can be forwarded to the next instruction, but a load produces its value only after MEM. An immediately dependent instruction needs a one-cycle bubble in this core, even with forwarding.', trap: 'A dependency does not always cause a stall. Check when the value is produced and when it is needed.' },
  { id: 'control', title: 'Branches & control hazards', level: 'Core', target: 'sim', time: 20,
    goal: 'Explain why a wrong next-PC prediction discards useful pipeline work.',
    task: 'Run the branch-loop example from Concepts. Compare prediction modes and inspect the flushed instructions when a prediction is wrong.',
    check: 'Distinguish a stall from a flush and explain branch prediction.',
    question: 'When a branch resolves in EX in this core, what happens after a wrong prediction?',
    answer: 'The two younger instructions in IF and ID are squashed. Fetch redirects to the correct PC on the next cycle. This is a property of this pipeline; other processors can resolve branches at different stages and have different penalties.', trap: 'A taken branch is not necessarily a misprediction. Compare the predicted next PC with the actual next PC.' },
  { id: 'encoding', title: 'Instruction formats & datapath', level: 'Core', target: 'trace', time: 20,
    goal: 'Connect an instruction’s fields to the signals used to execute it.',
    task: 'Trace an ADD, a load and a store. Compare source registers, destination, immediate, ALU operation and memory access. Use the instruction reference to check the fields.',
    check: 'Explain why a store reads a register but does not write a destination register.',
    question: 'For sw x5, 8(x2), which value is the address and which value is stored?',
    answer: 'The address is the value in x2 plus 8. The data written is the value in x5. The store does not write a destination register; its immediate is encoded in the S-type format.', trap: 'The address calculation and the data written to memory are separate datapath inputs.' },
  { id: 'execution', title: 'Execution units & performance', level: 'Advanced', target: 'units', time: 20,
    goal: 'Separate operation latency, initiation interval and resource conflicts.',
    task: 'Compare the execution-unit designs. Then run the multiply/divide example from Concepts and watch independent instructions wait while EX is occupied.',
    check: 'Explain why a long-latency unit can still have high throughput if it is pipelined.',
    question: 'Can a unit with a latency of four cycles accept a new operation every cycle?',
    answer: 'Yes, if it is pipelined with an initiation interval of one cycle and no other constraint prevents issue. Latency measures how long one operation takes; initiation interval measures how often a new operation can start.', trap: 'Latency alone does not determine throughput. The baseline simulator holds EX for its multicycle operations.' },
  { id: 'architecture', title: 'Issue width & out-of-order execution', level: 'Advanced', target: 'architecture', time: 25,
    goal: 'Compare issue width, scheduling and ordered commitment.',
    task: 'Follow the same program in Scalar, Superscalar and Out of order. Identify an independent instruction that executes early and check when it commits.',
    check: 'Distinguish superscalar issue from out-of-order execution; explain the reorder buffer.',
    question: 'Does superscalar imply out-of-order execution? Does early execution imply early commitment?',
    answer: 'Neither follows automatically. Superscalar describes the ability to issue multiple instructions per cycle. Scheduling can remain in order. An out-of-order core can execute younger ready instructions first while a reorder buffer preserves commitment in program order.', trap: 'Earlier execution does not guarantee a shorter total runtime. Inspect the critical dependency and commitment bottlenecks.' },
];
const root = document.querySelector('[data-learning]');
const storageKey = 'mic-learning-v1';
let saved = {};
let available = true;
try {
  const raw = JSON.parse(localStorage.getItem(storageKey) || '{}');
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) saved = raw;
} catch { available = false; }
const completed = new Set(Array.isArray(saved.completed) ? saved.completed.filter(id => topics.some(t => t.id === id)) : []);
const base = root.dataset.lab || '';
root.innerHTML = `
  <header class="learning-heading"><div><p class="learning-kicker">YOUR STUDY WORKSPACE</p><h2 id="learning-title">Your study path.</h2><p>Follow the path in order, or jump to a topic you need to revisit. Mark a topic only when you can explain it without looking.</p></div><a class="learning-link" href="${base}#sim">Open the simulator ↗</a></header>
  <div class="learning-summary"><div><label for="learning-progress">Study path · <span id="learning-count"></span></label><progress id="learning-progress" max="${topics.length}" value="0"></progress><p id="learning-storage">Progress and notes stay in this browser. They are not synced across devices.</p></div><a id="learning-next" class="learning-primary" href="${base}#guide">Start the first topic →</a></div>
  <div class="learning-layout"><div><div class="learning-toolbar"><h3>01 / Study path</h3><label class="learning-search">Find a topic<input type="search" id="learning-search" placeholder="Try forwarding, branch, latency…"></label></div>
  <p class="learning-caption">Time estimates are for one focused pass through each topic. This path covers the lab’s architecture topics; compare it with your exam syllabus.</p>
  <div class="learning-topics">${topics.map((t,i) => `<article class="learning-topic" data-topic="${t.id}"><div class="learning-topic-meta"><span>MODULE ${String(i+1).padStart(2,'0')} · ${t.level}</span><span>~${t.time} MIN</span></div><h4>${t.title}</h4><p>${t.goal}</p><div class="learning-experiment"><strong>In the lab</strong><p>${t.task}</p></div><p class="learning-check"><strong>Before moving on:</strong> ${t.check}</p><div class="learning-topic-actions"><a class="learning-link" href="${base}#${t.target}">Study in the lab ↗</a><label><input type="checkbox" data-complete="${t.id}" ${completed.has(t.id) ? 'checked' : ''}> I can explain this</label></div><details class="learning-recall"><summary>Recall check · try before revealing</summary><p><strong>${t.question}</strong></p><details><summary>Show explanation</summary><p>${t.answer}</p><p class="learning-trap"><strong>Watch for:</strong> ${t.trap}</p></details></details></article>`).join('')}</div><p id="learning-empty" hidden>No matching topics. Try “pipeline”, “data” or “execution”.</p><p id="learning-results" class="learning-caption" role="status"></p></div>
  <aside class="learning-aside" aria-label="Study tools"><section><p class="learning-kicker">A SESSION THAT FITS</p><h3>A focused 30-minute session</h3><ol><li><strong>5 min · Recall</strong><span>Explain the previous topic from memory.</span></li><li><strong>15 min · Experiment</strong><span>Predict what will happen, then step through the lab. Explain any difference.</span></li><li><strong>10 min · Check</strong><span>Answer a recall question and write down what you missed.</span></li></ol></section><section><h3>Revision notes</h3><label for="learning-notes">What do you need to revisit?</label><textarea id="learning-notes" rows="7" maxlength="12000" placeholder="Topic → what I got wrong → what to try next"></textarea><p id="learning-save" role="status">Saved locally as you type.</p></section><section><h3>Quick reference</h3><dl><dt>CPU time</dt><dd>Instruction count × CPI × clock period</dd><dt>CPI / IPC</dt><dd>Cycles per instruction / instructions per cycle; reciprocals for the same interval and instruction count.</dd><dt>Ideal pipeline</dt><dd>N + k − 1 cycles for N instructions and k stages, starting empty, with no stalls or flushes and one instruction issued per cycle.</dd></dl><a class="learning-link" href="${base}#reference">Instruction encoding reference ↗</a></section><section><h3>After the core path</h3><p>Explore loop caches in Architecture paths, then connect the datapath to the VHDL in Hardware.</p><a class="learning-link" href="${base}#rtl">Explore the hardware ↗</a></section></aside></div>`;
const notes = root.querySelector('#learning-notes');
notes.value = typeof saved.notes === 'string' ? saved.notes.slice(0,12000) : '';
function persist() {
  try { localStorage.setItem(storageKey, JSON.stringify({ completed: [...completed], notes: notes.value })); available = true; }
  catch { available = false; }
  root.querySelector('#learning-save').textContent = available ? 'Saved in this browser.' : 'Storage unavailable. Keep a copy of your notes before leaving.';
  root.querySelector('#learning-storage').textContent = available ? 'Progress and notes stay in this browser. They are not synced across devices.' : 'Browser storage is unavailable. Changes will last only while this page is open.';
}
function updateProgress() {
  root.querySelector('#learning-progress').value = completed.size;
  root.querySelector('#learning-count').textContent = `${completed.size} of ${topics.length} topics ready`;
  const next = topics.find(t => !completed.has(t.id));
  const link = root.querySelector('#learning-next');
  link.href = next ? `#learning-topic-${next.id}` : `${base}#sim`;
  link.textContent = next ? `${completed.size ? 'Continue' : 'Start'}: ${next.title} →` : 'Path complete · practice in the lab →';
  root.querySelectorAll('[data-topic]').forEach(card => { card.classList.toggle('is-complete', completed.has(card.dataset.topic)); card.id = `learning-topic-${card.dataset.topic}`; });
}
root.addEventListener('change', e => {
  if (!e.target.matches('[data-complete]')) return;
  const id = e.target.dataset.complete;
  if (e.target.checked) completed.add(id); else completed.delete(id);
  updateProgress(); persist();
});
notes.addEventListener('input', persist);
const search = root.querySelector('#learning-search');
function filterTopics() {
  const query = search.value.trim().toLowerCase();
  let count = 0;
  root.querySelectorAll('[data-topic]').forEach((card,i) => {
    const visible = Object.values(topics[i]).join(' ').toLowerCase().includes(query);
    card.hidden = !visible;
    if (visible) count++;
  });
  root.querySelector('#learning-empty').hidden = count !== 0;
  root.querySelector('#learning-results').textContent = query ? `${count} of ${topics.length} topics shown.` : '';
}
search.addEventListener('input', filterTopics);
root.querySelector('#learning-next').addEventListener('click', () => { search.value = ''; filterTopics(); });
updateProgress();
if (!available) {
  root.querySelector('#learning-storage').textContent = 'Browser storage could not be read. Changes may not persist after leaving this page.';
  root.querySelector('#learning-save').textContent = 'Keep a copy of your notes if browser storage is blocked.';
}
