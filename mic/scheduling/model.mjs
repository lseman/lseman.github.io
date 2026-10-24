// Deterministic, single-CPU teaching models. Time is in abstract units.
export const MODES = ['freertos', 'eevdf', 'rt'];
const clone = tasks => tasks.map(task => ({ ...task }));

export function simulateFreeRTOS({ slicing = true, preemption = true, horizon = 24 } = {}) {
  const tasks = [
    { id: 'A', name: 'Telemetry', priority: 2, release: 0, work: 6, remaining: 6 },
    { id: 'B', name: 'Logger', priority: 2, release: 0, work: 6, remaining: 6 },
    { id: 'C', name: 'Control', priority: 4, release: 3, work: 3, remaining: 3 },
  ];
  let current = null;
  // Ready lists retain their order when a higher-priority task preempts.
  const queues = new Map([[2, ['A', 'B']], [4, []]]);
  const frames = [];
  for (let time = 0; time < horizon; time++) {
    if (time === 3) queues.get(4).push('C');
    const ready = tasks.filter(t => t.release <= time && t.remaining > 0);
    const highest = Math.max(...ready.map(t => t.priority));
    if (!current || current.remaining === 0 || (preemption && current.priority < highest)) {
      current = tasks.find(t => t.id === queues.get(highest)?.[0]) ?? null;
    }
    const reason = !current ? 'No application task is ready. The idle task runs.'
      : `${current.id} runs at priority ${current.priority}. ${time === 3 && preemption ? 'Control became ready and preempted the lower-priority task.' : !preemption ? 'Cooperative mode: the current task keeps the CPU until it finishes or blocks.' : slicing ? 'Equal-priority peers rotate at each tick; higher priority always wins.' : 'Time slicing is off: an equal-priority peer waits until this task finishes or blocks.'}`;
    frames.push({ time, running: current?.id ?? 'idle', tasks: clone(tasks).map(t => ({ ...t, state: t.remaining === 0 ? 'done' : t.release > time ? 'blocked' : t.id === current?.id ? 'running' : 'ready' })), reason });
    if (current) {
      current.remaining--;
      const queue = queues.get(current.priority);
      if (current.remaining === 0) { queue.splice(queue.indexOf(current.id), 1); current = null; }
      else if (slicing && preemption && queue.length > 1) { queue.push(queue.shift()); current = null; }
    }
  }
  return frames;
}

export function simulateEEVDF({ weight = 2, slice = 2, horizon = 24 } = {}) {
  if (![1, 2, 4].includes(weight) || ![1, 2, 4].includes(slice)) throw new RangeError('Unsupported teaching parameter');
  const tasks = [
    { id: 'A', name: 'Interactive', weight: 1, slice: 1, vruntime: 0, deadline: 1, used: 0, service: 0 },
    { id: 'B', name: 'Worker', weight, slice, vruntime: 0, deadline: slice / weight, used: 0, service: 0 },
    { id: 'C', name: 'Background', weight: 1, slice: 4, vruntime: 0, deadline: 4, used: 0, service: 0 },
  ];
  const frames = [];
  for (let time = 0; time < horizon; time++) {
    const virtualTime = tasks.reduce((sum, t) => sum + t.vruntime * t.weight, 0) / tasks.reduce((sum, t) => sum + t.weight, 0);
    const snapshot = tasks.map(t => ({ ...t, lag: t.weight * (virtualTime - t.vruntime), eligible: t.vruntime <= virtualTime + 1e-9 }));
    const chosen = snapshot.filter(t => t.eligible).sort((a, b) => a.deadline - b.deadline || a.id.localeCompare(b.id))[0];
    frames.push({ time, running: chosen.id, virtualTime, tasks: snapshot.map(t => ({ ...t, state: t.id === chosen.id ? 'running' : t.eligible ? 'eligible' : 'ineligible' })), reason: `${chosen.id} is owed service (lag ${chosen.lag.toFixed(2)} ≥ 0) and has the earliest virtual deadline (${chosen.deadline.toFixed(2)}) among eligible tasks. Virtual time V = ${virtualTime.toFixed(2)}.` });
    const task = tasks.find(t => t.id === chosen.id);
    task.vruntime += 1 / task.weight;
    task.used++;
    task.service++;
    if (task.used >= task.slice) { task.used = 0; task.deadline = task.vruntime + task.slice / task.weight; }
  }
  return frames;
}

export function simulateRT({ inheritance = true, horizon = 24 } = {}) {
  const tasks = [
    { id: 'A', name: 'Lock owner', priority: 10, release: 0, remaining: 4 },
    { id: 'B', name: 'CPU worker', priority: 50, release: 2, remaining: 7 },
    { id: 'C', name: 'Control', priority: 90, release: 1, remaining: 2 },
  ];
  const frames = [];
  let locked = true;
  for (let time = 0; time < horizon; time++) {
    const highWaiting = time >= 1 && locked;
    const snapshot = tasks.map(t => ({ ...t, effective: t.id === 'A' && highWaiting && inheritance ? 90 : t.priority,
      state: t.remaining === 0 ? 'done' : t.release > time ? 'sleeping' : t.id === 'C' && highWaiting ? 'blocked on A' : 'ready' }));
    const chosen = snapshot.filter(t => t.state === 'ready').sort((a, b) => b.effective - a.effective)[0];
    if (chosen) chosen.state = 'running';
    const reason = !chosen ? 'All application tasks have completed. CPU is idle.' : highWaiting
      ? inheritance ? 'C is blocked on A’s mutex. A inherits priority 90, so B cannot delay the lock owner. The boost ends when A releases the mutex.' : 'C is blocked on A’s mutex. Without priority inheritance, B can preempt A and extend C’s wait: priority inversion.'
      : `${chosen.id} has the highest runnable fixed priority (${chosen.effective}). ${locked ? 'A holds the mutex.' : 'The mutex has been released.'}`;
    frames.push({ time, running: chosen?.id ?? 'idle', tasks: snapshot, locked, highWaiting, reason });
    if (chosen) {
      const task = tasks.find(t => t.id === chosen.id);
      task.remaining--;
      if (task.id === 'A' && task.remaining === 0) locked = false;
    }
  }
  return frames;
}

export function simulate(mode, options = {}) {
  if (mode === 'freertos') return simulateFreeRTOS(options);
  if (mode === 'eevdf') return simulateEEVDF(options);
  if (mode === 'rt') return simulateRT(options);
  throw new RangeError('Unknown scheduler');
}
