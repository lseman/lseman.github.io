import { test } from 'node:test';
import assert from 'node:assert/strict';
import { simulateFreeRTOS, simulateEEVDF, simulateRT, simulate } from './model.mjs';

test('FreeRTOS rotates ready peers and preempts them when C wakes', () => {
  const frames = simulateFreeRTOS();
  assert.deepEqual(frames.slice(0, 6).map(f => f.running), ['A', 'B', 'A', 'C', 'C', 'C']);
  assert.equal(frames[0].tasks.find(t => t.id === 'A').state, 'running');
  assert.equal(frames[2].tasks.find(t => t.id === 'C').state, 'blocked');
  for (const frame of frames) {
    const runnable = frame.tasks.filter(t => ['ready', 'running'].includes(t.state));
    if (runnable.length) assert.equal(frame.tasks.find(t => t.id === frame.running).priority, Math.max(...runnable.map(t => t.priority)));
  }
  for (const [id, count] of [['A', 6], ['B', 6], ['C', 3]]) assert.equal(frames.filter(f => f.running === id).length, count);
});
test('disabling slicing preserves higher-priority preemption; cooperative mode delays C', () => {
  const unsliced = simulateFreeRTOS({ slicing: false });
  assert.deepEqual(unsliced.slice(0, 4).map(f => f.running), ['A', 'A', 'A', 'C']);
  const cooperative = simulateFreeRTOS({ preemption: false });
  assert.equal(cooperative.find(f => f.running === 'C').time, 6);
});
test('EEVDF only selects eligible tasks and the earliest eligible deadline', () => {
  for (const weight of [1, 2, 4]) for (const slice of [1, 2, 4]) {
    const frames = simulateEEVDF({ weight, slice, horizon: 120 });
    for (const frame of frames) {
      const chosen = frame.tasks.find(t => t.id === frame.running);
      assert.ok(chosen.lag >= -1e-8);
      assert.equal(chosen.deadline, Math.min(...frame.tasks.filter(t => t.eligible).map(t => t.deadline)));
      assert.equal(frame.tasks.reduce((sum, t) => sum + t.service, 0), frame.time);
    }
    const service = id => frames.filter(f => f.running === id).length;
    assert.ok(Math.abs(service('B') / 120 - weight / (weight + 2)) < .04);
  }
});
test('EEVDF retains deadline until request consumption and rejects unsupported input', () => {
  const frames = simulateEEVDF({ weight: 2, slice: 4 });
  for (let i = 0; i < frames.length - 1; i++) {
    const t = frames[i].tasks.find(t => t.id === frames[i].running);
    const next = frames[i + 1].tasks.find(n => n.id === t.id);
    if (t.used + 1 < t.slice) assert.equal(t.deadline, next.deadline);
    else assert.ok(next.deadline > t.deadline);
  }
  assert.throws(() => simulateEEVDF({ weight: 0 }), RangeError);
  assert.throws(() => simulate('unknown'), RangeError);
});
test('inheritance allows the lock owner to finish before medium-priority work', () => {
  const pi = simulateRT(), noPI = simulateRT({ inheritance: false });
  assert.deepEqual(pi.slice(0, 6).map(f => f.running), ['A', 'A', 'A', 'A', 'C', 'C']);
  assert.equal(pi[2].tasks[0].effective, 90);
  assert.equal(pi[4].tasks[0].effective, 10);
  assert.equal(pi[2].tasks[2].state, 'blocked on A');
  assert.equal(noPI.find(f => f.running === 'C').time, 11);
  for (const frames of [pi, noPI]) for (const f of frames) assert.ok(!(f.locked && f.running === 'C'));
});
