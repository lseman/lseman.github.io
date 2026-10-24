// Deliberately bounded teaching models, independent of the five-stage CPU.
export const STUDY_PROGRAM = [
  { asm:'lw x1, 0(x0)', rd:1, src:[], latency:4, unit:'Load' },
  { asm:'add x2, x1, x1', rd:2, src:[1], latency:1, unit:'ALU' },
  { asm:'addi x3, x0, 7', rd:3, src:[], latency:1, unit:'ALU' },
  { asm:'addi x4, x0, 9', rd:4, src:[], latency:1, unit:'ALU' },
  { asm:'add x5, x3, x4', rd:5, src:[3,4], latency:1, unit:'ALU' },
  { asm:'addi x3, x0, 2', rd:3, src:[], latency:1, unit:'ALU' },
];
export function executionFrames(mode) {
  const width = mode === 'scalar' ? 1 : 2, ooo = mode === 'ooo';
  const latest = new Map();
  const rows = STUDY_PROGRAM.map((i, id) => {
    const deps = [...new Set(i.src.map(r => latest.get(r)).filter(x => x !== undefined))];
    latest.set(i.rd, id);
    return { ...i, id, deps, issued:0, done:0, committed:0 };
  });
  const frames = [{ cycle:0, rows:structuredClone(rows), note:'All six instructions are visible in a bounded scheduling window. Advance to issue the oldest ready work.' }];
  let head = 0;
  for (let cycle = 1; head < rows.length && cycle < 40; cycle++) {
    const notes = [];
    // Commit observes completion from previous cycles, always in program order.
    for (let n = 0; n < width && head < rows.length; n++) {
      const r = rows[head];
      if (!r.done || r.done >= cycle) break;
      r.committed = cycle; head++; notes.push(`I${r.id + 1} commits`);
    }
    rows.filter(r => r.issued && !r.done && cycle >= r.issued + r.latency).forEach(r => {
      r.done = cycle; notes.push(`I${r.id + 1} completes`);
    });
    let slots = width, alu = 0, load = 0;
    for (const r of rows) {
      if (r.issued) continue;
      const ready = r.deps.every(d => rows[d].done && rows[d].done <= cycle);
      const free = r.unit === 'Load' ? load < 1 : alu < 2;
      if (!ready || !free) {
        if (!ooo) { notes.push(`I${r.id + 1} blocks younger issue`); break; }
        continue;
      }
      if (!slots) break;
      r.issued = cycle; slots--; r.unit === 'Load' ? load++ : alu++;
      notes.push(`I${r.id + 1} issues`);
    }
    frames.push({ cycle, rows:structuredClone(rows), note:notes.join(' · ') || 'Waiting for the load; no instruction can commit yet.' });
  }
  return frames;
}

export function loopTrace(scenario = 'clean') {
  const body = scenario === 'large' ? 8 : 4, tail = (body - 1) * 4, trace = [];
  for (let iteration = 1; iteration <= 4; iteration++) {
    for (let n = 0; n < body; n++) {
      const pc = n * 4;
      if (scenario === 'call' && n === 1) {
        trace.push({pc, next:64, cof:true, taken:true, asm:'jal ra, helper', iteration});
        trace.push({pc:64, next:8, cof:true, taken:true, asm:'jalr zero, 0(ra)', iteration});
      } else if (pc === tail) {
        trace.push({pc, next:iteration < 4 ? 0 : tail + 4, cof:true, branch:true, taken:iteration < 4, asm:'bne a0, zero, loop', iteration});
      } else trace.push({pc, next:pc + 4, cof:false, asm:n === 0 ? 'addi a0, a0, -1' : 'add t0, t1, t2', iteration});
    }
  }
  return trace;
}
export function cacheFrames(kind, scenario, capacity) {
  const trace = loopTrace(scenario), body = scenario === 'large' ? 8 : 4;
  // Static boot allocation: the complete main region, then the helper region if it fits.
  const regions = body <= capacity ? [{ start:0, end:(body - 1) * 4, base:0 }] : [];
  if (scenario === 'call' && body < capacity) regions.push({ start:64, end:64, base:body });
  let state = kind === 'static' ? 'Ready' : 'Idle', trigger = null, imem = 0, hits = 0;
  const storage = new Map();
  if (kind === 'static') for (const r of regions) for (let pc = r.start; pc <= r.end; pc += 4) storage.set(r.base + (pc - r.start) / 4, pc);
  const snapshot = extra => ({ state, imem, hits, storage:[...storage], regions, trigger:trigger && {...trigger}, ...extra });
  const frames = [snapshot({ note:kind === 'static' ? 'Boot: copy selected regions and configure start/end ranges. Preload traffic is excluded from runtime counters.' : 'Waiting for a taken short backward branch. No software configuration.', event:null })];
  for (const event of trace) {
    const before = state;
    const region = regions.find(r => event.pc >= r.start && event.pc <= r.end);
    const index = kind === 'static' ? (region ? region.base + (event.pc - region.start) / 4 : null) : (event.pc / 4) % capacity;
    const hit = kind === 'static' ? !!region : state === 'Active' && event.pc >= trigger.start && event.pc <= trigger.end && storage.get(index) === event.pc;
    hit ? hits++ : imem++;
    let note = hit ? 'Buffer supplies this instruction; IMEM read suppressed.' : 'IMEM supplies this instruction.';
    if (kind === 'dynamic') {
      const same = trigger && event.pc === trigger.end && event.branch && event.next === trigger.start && event.taken;
      if (state === 'Fill') {
        storage.set(index, event.pc);
        if (same && storage.size === (trigger.end - trigger.start) / 4 + 1) {
          state = 'Active'; note += ' Same SBB confirms a complete clean iteration; replay starts next fetch.';
        } else if (event.cof) {
          state = 'Idle'; storage.clear(); trigger = null;
          note += ' Fill aborted: another control-flow instruction or loop exit.';
        }
      } else if (state === 'Active' && (!hit || (event.cof && !same))) {
        state = 'Idle'; storage.clear(); trigger = null;
        note += ' Leave replay: loop exit or different control flow.';
      } else if (state === 'Idle' && event.branch && event.taken && event.next < event.pc) {
        const words = (event.pc - event.next) / 4 + 1;
        if (words <= capacity) {
          trigger = { start:event.next, end:event.pc }; storage.clear(); state = 'Fill';
          note += ` Taken SBB spans ${words} instructions; capture the next iteration.`;
        } else note += ` Loop needs ${words} entries including its branch; capacity is ${capacity}.`;
      }
    } else note += region ? ` PC matches region ${region.start}…${region.end}; slot = base + (PC − start)/4.` : ' PC is outside the configured regions; fall back to IMEM.';
    frames.push(snapshot({ event, before, hit, index, note }));
  }
  return frames;
}
