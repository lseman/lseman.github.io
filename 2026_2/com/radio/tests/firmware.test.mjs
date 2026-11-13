import { test } from "node:test";
import assert from "node:assert/strict";
import { FirmwareEngine } from "../firmware-engine.mjs";
import { FIRMWARE_A, FIRMWARE_B } from "./fixtures/reference-firmware.mjs";
import { ExperimentSession } from "../session.mjs";
import { simulate, crc16 } from "../phy.mjs";
import { FIRMWARE_A as STARTER_A, FIRMWARE_B as STARTER_B } from "../firmware-templates.mjs";
const config = {
  mode: "BPSK",
  ebn0: 70,
  bitrate: 10000,
  distance: 10,
  obstacle: 0,
  seed: 42,
  sf: 7,
  bandwidth: 125000,
};
function boards(a = FIRMWARE_A, b = FIRMWARE_B) {
  const tx = new FirmwareEngine(a, "A"),
    rx = new FirmwareEngine(b, "B");
  tx.setup();
  rx.setup();
  return { tx, rx };
}
const wrong = (source) =>
  source.replace("if (msb) crc ^= 0x1021;", "if (msb) crc ^= 0x8005;");

test("both firmware loops preserve state; setup logs once and B reads raw bytes", () => {
  const { tx, rx } = boards();
  const first = tx.step(),
    second = tx.step();
  assert.equal(first.frame[4], 0);
  assert.equal(second.frame[4], 1);
  assert.equal(first.report.crcCalculated, crc16(first.frame.slice(4, -2)));
  assert.equal(rx.step(first.frame).report.accepted, true);
  const again = rx.step(second.frame);
  assert.ok(again.logs.some((line) => line.includes("ACEITO #2")));
  assert.equal(rx.step().report, null);
  assert.equal(first.trace.length, (first.frame.length - 6) * 8);
  assert.equal(first.trace.at(-1).after, first.report.crcCalculated);
});
test("reference CRC implementation matches standard check vector", () => {
  const crc = FIRMWARE_A.slice(FIRMWARE_A.indexOf("function crc16"));
  const tx = new FirmwareEngine(
    `function loop(){return {crcCalculated:crc16(new TextEncoder().encode("123456789"))};}\n${crc}`,
    "A",
  );
  tx.setup();
  assert.equal(tx.step().report.crcCalculated, 0x29b1);
});
test("manual receiver CRC changes delivery even when physical BER is zero", async () => {
  const { tx, rx } = boards(FIRMWARE_A, wrong(FIRMWARE_B)),
    session = new ExperimentSession(),
    sent = tx.step();
  const acquisition = await session.acquireFirmware(
    config,
    sent.frame,
    (bytes) => rx.step(bytes),
    { tx: sent },
  );
  assert.equal(acquisition.result.errors, 0);
  assert.equal(acquisition.result.reference.crcOK, true);
  assert.equal(acquisition.result.crcOK, false);
  assert.equal(acquisition.result.ok, false);
  assert.equal(session.delivered, 0);
});
test("no automatic CRC is added or repaired; same nonstandard algorithm on both boards is visible", async () => {
  const { tx, rx } = boards(wrong(FIRMWARE_A), wrong(FIRMWARE_B)),
    sent = tx.step(),
    session = new ExperimentSession();
  const result = await session.acquireFirmware(
    config,
    sent.frame,
    (bytes) => rx.step(bytes),
    { tx: sent },
  );
  assert.deepEqual(result.result.bytes, sent.frame);
  assert.equal(result.result.errors, 0);
  assert.equal(result.result.reference.crcOK, false);
  assert.equal(result.result.crcOK, true);
  assert.equal(result.result.ok, true);
});
test("B can deliberately bypass checks; reference diagnostics do not override student decision", async () => {
  const { tx, rx } = boards(
    FIRMWARE_A,
    'function loop(){radio.receive();return {accepted:true,crcOK:false,payload:"bypass"};}',
  );
  const frame = tx.step().frame;
  frame[6] ^= 1;
  const session = new ExperimentSession(),
    a = await session.acquireFirmware(config, frame, (bytes) => rx.step(bytes));
  assert.equal(a.result.ok, true);
  assert.equal(a.result.payload, "bypass");
  assert.equal(a.result.crcOK, false);
  assert.equal(a.result.sync, null);
  assert.equal(a.result.reference.crcOK, false);
});
test("channel errors reach the B firmware before filtering and are rejected by its CRC", async () => {
  const { tx, rx } = boards(),
    session = new ExperimentSession(),
    frame = tx.step().frame;
  let received;
  const a = await session.acquireFirmware(
    { ...config, ebn0: -20 },
    frame,
    (bytes) => {
      received = bytes;
      return rx.step(bytes);
    },
  );
  assert.ok(a.result.errors > 0);
  assert.deepEqual(received, a.result.decoded);
  assert.equal(a.result.ok, false);
});
test("reset during a pending B step prevents stale acquisition from committing", async () => {
  const { tx, rx } = boards(),
    session = new ExperimentSession();
  let finish;
  const pending = session.acquireFirmware(
    config,
    tx.step().frame,
    (bytes) =>
      new Promise((resolve) => {
        finish = () => resolve(rx.step(bytes));
      }),
  );
  session.reset();
  finish();
  await assert.rejects(pending, /cancelada/);
  assert.equal(session.count, 0);
  assert.equal(session.latest, null);
});
test("raw frame validation, one packet per cycle, and per-board radio APIs", () => {
  assert.throws(() => simulate({ ...config, frame: [0, 1] }));
  assert.throws(() => simulate({ ...config, frame: Array(8).fill(256) }));
  const twice = new FirmwareEngine(
    "function loop(){radio.send([1,2,3,4,5,6,7,8]);radio.send([1,2,3,4,5,6,7,8]);}",
    "A",
  );
  twice.setup();
  assert.throws(() => twice.step(), /máximo/);
  const b = new FirmwareEngine(
    "function loop(){radio.send([1,2,3,4,5,6,7,8]);}",
    "B",
  );
  b.setup();
  assert.throws(() => b.step(), /placa A/);
});
test("invalid firmware or reports fail explicitly and trace/log outputs are bounded", () => {
  assert.throws(() => new FirmwareEngine("not valid javascript !!", "A"));
  assert.throws(() => new FirmwareEngine("function setup(){}", "A"), /loop/);
  const b = new FirmwareEngine(
    'function loop(){return {accepted:"yes"};}',
    "B",
  );
  b.setup();
  assert.throws(() => b.step(), /accepted/);
  const engine = new FirmwareEngine(
    'function loop(){for(let i=0;i<5000;i++){Serial.println("test");traceCRC({byte:0,bit:0,before:1,msb:false,after:2});}}',
    "A",
  );
  engine.setup();
  const result = engine.step();
  assert.equal(result.logs.length, 60);
  assert.equal(result.trace.length, 2048);
});

// Student defaults must never send a solved packet or silently accept one.
test("student starters load without transmitting or accepting frames", () => {
  const { tx, rx } = boards(STARTER_A, STARTER_B);
  const sent = tx.step();
  assert.equal(sent.frame, null);
  assert.equal(sent.report, null);
  assert.equal(rx.step().report, null);
  assert.equal(rx.step(Uint8Array.from([0xAA,0xAA,0xD3,0x91,0,0,0,0])).report.accepted, false);
  const crc = STARTER_A.slice(STARTER_A.indexOf("function crc16"));
  const incomplete = new FirmwareEngine(`function loop(){crc16([]); }\n${crc}`, "A");
  incomplete.setup();
  assert.throws(() => incomplete.step(), /Implemente crc16/);
});
