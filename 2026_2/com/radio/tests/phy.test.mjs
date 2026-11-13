import { test } from "node:test";
import assert from "node:assert/strict";
import { simulate, crc16, packet, MODES } from "../phy.mjs";
test("CRC-16/CCITT-FALSE standard vector", () =>
  assert.equal(crc16(new TextEncoder().encode("123456789")), 0x29b1));
for (const mode of Object.keys(MODES)) {
  test(`${mode}: UTF-8 message survives clean channel`, () => {
    const r = simulate({ mode, message: "Olá 🌎! 你好", ebn0: 80 });
    assert.equal(r.errors, 0);
    assert.equal(r.payload, "Olá 🌎! 你好");
    assert.ok(r.ok);
    assert.equal(r.bits.length, r.decisions.length);
  });
  test(`${mode}: strong noise causes measured errors and rejected packet`, () => {
    const r = simulate({ mode, ebn0: -20 });
    assert.ok(r.errors > 0);
    assert.ok(!r.ok);
    assert.equal(r.payload, null);
  });
}
test("deterministic replay and changed seeds", () => {
  const config = { mode: "QPSK", seed: 17, ebn0: 0 };
  assert.deepEqual(simulate(config), simulate(config));
  assert.notDeepEqual(
    simulate(config).received,
    simulate({ ...config, seed: 18 }).received,
  );
});
test("distance and obstacle losses use decibels", () => {
  assert.equal(
    simulate({ distance: 100, ebn0: 10, obstacle: 6 }).effective,
    -16,
  );
});
test("packet overhead, airtime and CRC encode UTF-8 bytes", () => {
  const r = simulate({ message: "á", bitrate: 8000 });
  assert.equal(r.bytes.length, 10);
  assert.equal(r.airtime, 0.01);
  assert.equal(r.bytes[5], 2);
});
test("frame payload is limited by UTF-8 bytes", () => {
  assert.throws(() => packet("🌎".repeat(31)));
  assert.equal(packet("a".repeat(120)).length, 128);
});
test("BER measured from decisions; receiver sync failures discard", () => {
  const r = simulate({ ebn0: -15 });
  assert.equal(
    r.ber,
    r.bits.filter((v, i) => v !== r.decisions[i]).length / r.bits.length,
  );
  assert.equal(r.ok, r.sync && r.crcOK && r.lengthOK);
});
test("BPSK BER near coherent theoretical reference at 0 dB", () => {
  let errors = 0,
    bits = 0;
  for (let seed = 1; seed <= 100; seed++) {
    const r = simulate({ message: "0123456789".repeat(10), ebn0: 0, seed });
    errors += r.errors;
    bits += r.bits.length;
  }
  assert.ok(Math.abs(errors / bits - 0.07865) < 0.006, `${errors / bits}`);
});
