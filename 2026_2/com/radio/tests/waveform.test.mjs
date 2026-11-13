import { test } from "node:test";
import assert from "node:assert/strict";
import { simulate } from "../phy.mjs";
import {
  cssPoint,
  reconstruct,
  displayWindow,
  idealPoint,
  component,
} from "../waveform.mjs";
const close = (a, b, tolerance = 1e-9) =>
  assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);
test("continuous chirp agrees with actual modem samples, including frequency wrap", () => {
  for (const sf of [7, 12]) {
    const r = simulate({ mode: "LoRa", sf, message: "", ebn0: 70 });
    for (let symbol = 0; symbol < r.ideal.length; symbol++)
      for (const n of [0, 1, Math.floor(r.sps / 2), r.sps - 1]) {
        const point = cssPoint(n, r.sps, r.ideal[symbol][0]),
          actual = r.tx[symbol * r.sps + n];
        close(point[0], actual[0]);
        close(point[1], actual[1]);
      }
  }
});
test("chirp remains continuous at wrapped bandwidth boundary", () => {
  const count = 128,
    symbol = 85,
    wrap = count - symbol,
    epsilon = 1e-7;
  const before = cssPoint(wrap - epsilon, count, symbol),
    after = cssPoint(wrap + epsilon, count, symbol);
  close(before[0], after[0], 1e-6);
  close(before[1], after[1], 1e-6);
});
test("sinc reconstruction preserves samples, constant signals, and input arrays", () => {
  const samples = Array.from({ length: 40 }, (_, n) => [
      Math.cos(n * 0.4),
      Math.sin(n * 0.4),
    ]),
    before = structuredClone(samples);
  for (let n = 0; n < samples.length; n++)
    assert.deepEqual(reconstruct(samples, n), samples[n]);
  for (const time of [0, 0.5, 9.25, 38.9]) {
    const constant = reconstruct(
      Array.from({ length: 40 }, () => [2, -3]),
      time,
    );
    close(constant[0], 2);
    close(constant[1], -3);
  }
  for (const time of [10.25, 15.5, 20.75]) {
    const point = reconstruct(samples, time);
    close(point[0], Math.cos(time * 0.4), 0.003);
    close(point[1], Math.sin(time * 0.4), 0.003);
  }
  assert.deepEqual(samples, before);
});
test("time windows stay in bounds for zoom, pan, full chirp and end of packet", () => {
  const r = simulate({ mode: "LoRa", sf: 12, message: "", ebn0: 70 });
  const start = displayWindow(r, "LoRa", 1, "16", 0),
    end = displayWindow(r, "LoRa", 1, "16", 100),
    full = displayWindow(r, "LoRa", 1, "all", 0);
  assert.equal(start.length, 16);
  assert.equal(start.start, 4096);
  assert.equal(end.end, 8191);
  assert.equal(full.length, 4095);
  assert.equal(start.sampleRate, 125000);
  const b = simulate({ message: "", ebn0: 70 }),
    last = displayWindow(b, "BPSK", b.ideal.length - 1, "8");
  assert.equal(last.end, b.tx.length - 1);
});
test("carrier representation shows amplitude and phase without modifying symbols", () => {
  const r = simulate({ mode: "BPSK", message: "", ebn0: 70 }),
    point = idealPoint(r, "BPSK", 0);
  close(component(point, 0, r, "carrier"), r.ideal[0][0]);
  close(component(point, r.sps / 4, r, "carrier"), -r.ideal[0][0]);
  close(component(point, 0, r, "i"), r.ideal[0][0]);
  close(component(point, 0, r, "q"), 0);
});
