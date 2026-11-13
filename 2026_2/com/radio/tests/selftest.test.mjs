import { test } from "node:test";
import assert from "node:assert/strict";
import { selfTest } from "../firmware-selftest.mjs";
import { sourceLine, FirmwareEngine } from "../firmware-engine.mjs";
import { FIRMWARE_A, FIRMWARE_B } from "./fixtures/reference-firmware.mjs";
import { FIRMWARE_A as STARTER_A, FIRMWARE_B as STARTER_B } from "../firmware-templates.mjs";

const score = (results) => results.filter((r) => r.ok !== null);

test("reference firmware passes every automatic check", () => {
  for (const [source, role] of [[FIRMWARE_A, "A"], [FIRMWARE_B, "B"]]) {
    const results = selfTest(source, role);
    assert.ok(results.length > 8);
    assert.deepEqual(results.filter((r) => r.ok !== true), [], role);
  }
});

test("starter skeletons fail CRC checks and point to the throw line", () => {
  const a = selfTest(STARTER_A, "A");
  const crc = a.filter((r) => r.group === "crc16");
  assert.ok(crc.length && crc.every((r) => r.ok === false));
  const throwLine = STARTER_A.split("\n").findIndex((l) => l.includes("throw new Error")) + 1;
  assert.equal(crc[0].line, throwLine);
});

test("a receiver that rejects everything gets no credit for rejections", () => {
  const b = selfTest(STARTER_B, "B");
  const rejections = b.filter((r) => r.name.startsWith("Rejeita"));
  assert.ok(rejections.length && rejections.every((r) => r.ok === null));
  assert.ok(score(b).some((r) => r.ok === false));
});

test("wrong polynomial is detected by the CRC vectors", () => {
  const wrong = FIRMWARE_A.replace("if (msb) crc ^= 0x1021;", "if (msb) crc ^= 0x8005;");
  assert.notEqual(wrong, FIRMWARE_A);
  const results = selfTest(wrong, "A").filter((r) => r.group === "crc16");
  assert.ok(results.some((r) => r.ok === false));
});

test("runtime errors are mapped to the student's source line", () => {
  const source = 'let x = 0;\nfunction loop() {\n  return missing + 1;\n}';
  const engine = new FirmwareEngine(source, "A");
  engine.setup();
  assert.throws(() => engine.step(), (error) => sourceLine(error) === 3);
});
