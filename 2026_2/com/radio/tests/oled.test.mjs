import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FirmwareEngine } from '../firmware-engine.mjs';
import { createOLED } from '../oled.mjs';

test('OLED commits explicitly, clears buffer, wraps and clips with independent snapshots', () => {
  const { api: oled, snapshot } = createOLED();
  oled.print('A');
  assert.equal(snapshot()[0].trim(), '');
  oled.display();
  assert.equal(snapshot()[0].trim(), 'A');
  oled.clear();
  assert.equal(snapshot()[0].trim(), 'A');
  oled.setCursor(20, 0); oled.print('XY'); oled.display();
  assert.equal(snapshot()[0][20], 'X');
  assert.equal(snapshot()[1][0], 'Y');
  const copy = snapshot(); copy[0] = 'changed';
  assert.notEqual(snapshot()[0], 'changed');
  oled.setCursor(0, 7); oled.println('last'); oled.print('invisible'); oled.display();
  assert.equal(snapshot().length, 8);
  assert.equal(snapshot()[7].trim(), 'last');
  assert.throws(() => oled.setCursor(21, 0));
  assert.throws(() => oled.setCursor(0, -1));
  assert.throws(() => oled.print('a'.repeat(1025)));
});

test('OLED state persists across firmware calls, is isolated per board and resets on reload', () => {
  const source = `let count=0; function setup(){oled.println("READY");oled.display();}
  function loop(){oled.clear();oled.print(++count);oled.display();return null;}`;
  const a = new FirmwareEngine(source, 'A');
  const b = new FirmwareEngine(source, 'B');
  assert.equal(a.setup().oled[0].trim(), 'READY');
  assert.equal(b.setup().oled[0].trim(), 'READY');
  assert.equal(a.step().oled[0].trim(), '1');
  assert.equal(a.step().oled[0].trim(), '2');
  assert.equal(b.step().oled[0].trim(), '1');
  const fresh = new FirmwareEngine(source, 'A');
  assert.equal(fresh.setup().oled[0].trim(), 'READY');
  assert.equal(fresh.step().oled[0].trim(), '1');
});
