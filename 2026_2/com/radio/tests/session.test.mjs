import { test } from "node:test";
import assert from "node:assert/strict";
import { ExperimentSession } from "../session.mjs";

const config = {
  mode: "BPSK",
  bitrate: 10000,
  ebn0: 25,
  distance: 10,
  obstacle: 0,
  seed: 42,
  sf: 7,
  bandwidth: 125000,
};
test("acquisitions and replay retain packet identity and deterministic samples", () => {
  const session = new ExperimentSession();
  assert.throws(() => session.acquire(config, undefined, { replay: true }));
  const first = session.acquire(config, "Olá!");
  const replay = session.acquire(config, "ignored", { replay: true });
  assert.equal(first.sequence, 0);
  assert.equal(replay.sequence, 0);
  assert.equal(replay.message, "Olá!");
  assert.deepEqual(first.result.rx, replay.result.rx);
  assert.equal(session.acquire(config, "next").sequence, 1);
  assert.equal(session.count, 3);
  assert.equal(session.delivered, 3);
});
test("a failed simulation does not consume sequence or modify measurements", () => {
  const session = new ExperimentSession();
  session.acquire(config, "ok");
  assert.throws(() => session.acquire({ ...config, mode: "invalid" }, "bad"));
  assert.equal(session.count, 1);
  assert.equal(session.latest.message, "ok");
  assert.equal(session.acquire(config, "valid").sequence, 1);
});
test("replay applies changed channel settings while preserving payload and sequence", () => {
  const session = new ExperimentSession();
  session.acquire(config, "sensor=24");
  const replay = session.acquire({ ...config, ebn0: -20 }, undefined, {
    replay: true,
  });
  assert.equal(replay.message, "sensor=24");
  assert.equal(replay.sequence, 0);
  assert.ok(replay.result.errors > 0);
  assert.equal(replay.result.ok, false);
  assert.equal(session.count, 2);
  assert.equal(session.delivered, 1);
});
test("session reset clears samples, counters and CSV measurements", () => {
  const session = new ExperimentSession();
  session.acquire(config, "before");
  session.reset();
  assert.equal(session.latest, null);
  assert.equal(session.count, 0);
  assert.equal(session.delivered, 0);
  assert.equal(session.measurements.length, 0);
  assert.equal(session.exportCSV().split("\n").length, 1);
  assert.equal(session.acquire(config, "after").sequence, 0);
});
test("measurement history is isolated and CSV retains LoRa acquisition metadata", () => {
  const session = new ExperimentSession(),
    input = { ...config, mode: "LoRa", sf: 9 };
  const snapshot = session.acquire(input, "test");
  input.sf = 12;
  assert.equal(snapshot.sf, 9);
  const rows = session.measurements;
  rows.pop();
  assert.equal(session.count, 1);
  assert.throws(() => {
    session.measurements[0].attempt = 999;
  });
  const [header, data] = session.exportCSV().split("\n"),
    row = Object.fromEntries(
      header.split(",").map((key, i) => [key, data.split(",")[i]]),
    );
  assert.equal(row.sf, "9");
  assert.equal(row.mode, "LoRa");
  assert.equal(row.bandwidth_hz, "125000");
  assert.equal(Number(row.bits), snapshot.result.bits.length);
  assert.equal(Number(row.padding_bits), snapshot.result.padding);
});
test("sequence byte wraps independently of acquisition count", () => {
  const session = new ExperimentSession();
  for (let i = 0; i < 257; i++) session.acquire(config, "");
  assert.equal(session.latest.sequence, 0);
  assert.equal(session.latest.attempt, 257);
});
