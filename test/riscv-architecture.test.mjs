import test from 'node:test';
import assert from 'node:assert/strict';
import { executionFrames, cacheFrames } from '../mic/architecture/model.mjs';

test('width and scheduling respect dependencies, resource limits and ordered commit', () => {
  for (const mode of ['scalar','superscalar','ooo']) {
    const frames = executionFrames(mode), rows = frames.at(-1).rows, width = mode === 'scalar' ? 1 : 2;
    assert.ok(rows.every(r => r.committed));
    for (const r of rows) {
      assert.equal(r.done - r.issued, r.latency);
      assert.ok(r.committed > r.done);
      for (const d of r.deps) assert.ok(r.issued >= rows[d].done);
      if (r.id) assert.ok(r.committed >= rows[r.id-1].committed);
    }
    for (const {cycle} of frames) {
      assert.ok(rows.filter(r => r.issued === cycle).length <= width);
      assert.ok(rows.filter(r => r.committed === cycle).length <= width);
    }
    if (mode !== 'ooo') assert.ok(rows[2].issued >= rows[1].issued);
    else {
      assert.ok(rows[2].done < rows[1].issued);
      assert.ok(rows[2].committed >= rows[1].committed);
      assert.deepEqual(rows[4].deps,[2,3]); // x3 is bound before I6 overwrites its name
      assert.ok(rows[5].done < rows[4].done);
    }
  }
});

test('dynamic cache detects, fills, replays, suppresses IMEM, then exits', () => {
  const frames = cacheFrames('dynamic','clean',4);
  assert.equal(frames[4].state,'Fill');
  assert.equal(frames[8].state,'Active');
  assert.equal(frames[8].hit,false); // activation affects the next fetch
  assert.equal(frames[9].hit,true);
  assert.equal(frames.at(-1).state,'Idle');
  assert.equal(frames.at(-1).hits,8);
  assert.equal(frames.at(-1).imem,8);
  for (let i=1;i<frames.length;i++) {
    assert.equal(frames[i].hits+frames[i].imem,i);
    assert.ok(frames[i].storage.length<=4);
  }
});

test('internal calls abort capture, oversized loops never activate', () => {
  assert.equal(cacheFrames('dynamic','call',8).at(-1).hits,0);
  assert.equal(cacheFrames('dynamic','large',4).at(-1).hits,0);
  assert.equal(cacheFrames('dynamic','large',8).at(-1).hits,16);
});

test('static ranges survive calls and use IMEM only outside configured regions', () => {
  const small = cacheFrames('static','call',4).at(-1);
  assert.equal(small.hits,16); assert.equal(small.imem,4);
  const large = cacheFrames('static','call',8).at(-1);
  assert.equal(large.hits,20); assert.equal(large.imem,0);
  assert.equal(large.regions.length,2);
  assert.equal(large.storage.length,5);
  assert.equal(large.state,'Ready');
  assert.equal(cacheFrames('static','large',4).at(-1).hits,0);
  assert.equal(cacheFrames('static','large',8).at(-1).hits,32);
});
