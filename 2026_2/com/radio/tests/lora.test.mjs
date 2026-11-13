import { test } from "node:test";
import assert from "node:assert/strict";
import { simulate } from "../phy.mjs";
import { loraParameters, fftPower, modulateCSS, dechirp } from "../lora.mjs";
const close = (a, b, tolerance = 1e-9) =>
  assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);
for (let sf = 7; sf <= 12; sf++)
  for (const bandwidth of [125000, 250000, 500000]) {
    test(`LoRa SF${sf}, BW${bandwidth}: clean UTF-8 round trip and padded airtime`, () => {
      const r = simulate({
        mode: "LoRa",
        sf,
        bandwidth,
        ebn0: 70,
        message: "Olá 🌎!",
      });
      assert.ok(r.ok);
      assert.equal(r.payload, "Olá 🌎!");
      assert.equal(r.errors, 0);
      assert.equal(r.sps, 2 ** sf);
      assert.equal(r.ideal.length, Math.ceil(r.bits.length / sf));
      assert.equal(r.decisions.length, r.bits.length);
      assert.equal(r.padding, r.ideal.length * sf - r.bits.length);
      close(r.airtime, (r.ideal.length * 2 ** sf) / bandwidth);
      close(r.bitrate, (sf * bandwidth) / 2 ** sf);
      for (let i = 0; i < r.ideal.length; i++)
        assert.equal(r.received[i][0], r.ideal[i][0]);
    });
  }
test("SF and BW determine raw rate, duration and SNR conversion", () => {
  assert.deepEqual(loraParameters(7, 125000), {
    samples: 128,
    symbolDuration: 0.001024,
    bitrate: 6835.9375,
  });
  close(loraParameters(12, 125000).symbolDuration, 0.032768);
  const a = simulate({
    mode: "LoRa",
    sf: 9,
    bandwidth: 125000,
    seed: 8,
    ebn0: 7,
  });
  const b = simulate({
    mode: "LoRa",
    sf: 9,
    bandwidth: 250000,
    seed: 8,
    ebn0: 7,
  });
  close(b.airtime, a.airtime / 2);
  close(b.bitrate, a.bitrate * 2);
  assert.deepEqual(a.received, b.received); // Same Eb/N0, not fixed transmit power/noise density.
  close(a.snr, 7 + 10 * Math.log10(9 / 512));
});
test("radix-2 power FFT agrees with independent direct DFT", () => {
  const re = [1, -2, 0.3, 4, -0.5, 6, 2, -1],
    im = [0, 1, 2, -1, 0, 0.7, -3, 2],
    powers = fftPower(re, im);
  for (let k = 0; k < re.length; k++) {
    let r = 0,
      q = 0;
    for (let n = 0; n < re.length; n++) {
      const angle = (-2 * Math.PI * k * n) / re.length;
      r += re[n] * Math.cos(angle) - im[n] * Math.sin(angle);
      q += re[n] * Math.sin(angle) + im[n] * Math.cos(angle);
    }
    close(powers[k], (r * r + q * q) / re.length);
  }
});
test("every SF7 symbol dechirps to its own FFT bin at unit energy", () => {
  const bits = Array.from({ length: 128 }, (_, m) =>
    Array.from({ length: 7 }, (_, i) => (m >> (6 - i)) & 1),
  ).flat();
  const r = modulateCSS(bits, {
    sf: 7,
    bandwidth: 125000,
    sigma: 0,
    normal: () => 0,
  });
  assert.deepEqual(r.decisions, bits);
  for (let m = 0; m < 128; m++) {
    assert.equal(r.received[m][0], m);
    close(r.spectra[m][m], 1);
    const block = r.tx.slice(m * 128, (m + 1) * 128);
    close(
      block.reduce((energy, [i, q]) => energy + i * i + q * q, 0),
      1,
    );
    const d = dechirp(block);
    for (let n = 0; n < 128; n++) {
      close(d.real[n], Math.cos((2 * Math.PI * m * n) / 128) / Math.sqrt(128));
      close(d.imag[n], Math.sin((2 * Math.PI * m * n) / 128) / Math.sqrt(128));
    }
  }
});
test("SF12 edge bins and symbol wraparound recover correctly", () => {
  const symbols = [0, 1, 2047, 2048, 4095];
  const bits = symbols.flatMap((m) =>
    Array.from({ length: 12 }, (_, i) => (m >> (11 - i)) & 1),
  );
  const r = modulateCSS(bits, {
    sf: 12,
    bandwidth: 125000,
    sigma: 0,
    normal: () => 0,
  });
  assert.deepEqual(
    r.received.map((p) => p[0]),
    symbols,
  );
  assert.deepEqual(r.decisions, bits);
});
test("LoRa noise is repeatable, changes decisions, and CRC rejects damaged frames", () => {
  const config = { mode: "LoRa", sf: 8, ebn0: -15, seed: 91 };
  const a = simulate(config),
    b = simulate(config);
  assert.deepEqual(a.spectra, b.spectra);
  assert.deepEqual(a.decisions, b.decisions);
  assert.ok(a.errors > 0);
  assert.equal(a.ok, false);
  assert.equal(a.payload, null);
  assert.notDeepEqual(a.received, simulate({ ...config, seed: 92 }).received);
});
test("invalid SF and unsupported bandwidth fail explicitly", () => {
  for (const sf of [6, 13, 7.5, NaN])
    assert.throws(() => simulate({ mode: "LoRa", sf }));
  for (const bandwidth of [0, 125, 100000, NaN])
    assert.throws(() => simulate({ mode: "LoRa", bandwidth }));
  assert.throws(() => fftPower([1, 2, 3], [0, 0, 0]));
});
