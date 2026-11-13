import { loraParameters, modulateCSS } from "./lora.mjs";
// Educational complex-baseband modems. Es=1, uncoded; CSS uses FFT magnitude detection.
export const MODES = { OOK: 1, FSK: 1, BPSK: 1, QPSK: 2, "16QAM": 4, LoRa: 7 };
export function random(seed) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function crc16(bytes) {
  let c = 0xffff;
  for (const b of bytes) {
    c ^= b << 8;
    for (let j = 0; j < 8; j++)
      c = ((c << 1) ^ (c & 0x8000 ? 0x1021 : 0)) & 65535;
  }
  return c;
}
export const toBits = (bytes) =>
  Array.from(bytes).flatMap((b) =>
    Array.from({ length: 8 }, (_, i) => (b >> (7 - i)) & 1),
  );
export function toBytes(bits) {
  return Uint8Array.from({ length: Math.floor(bits.length / 8) }, (_, i) =>
    bits.slice(i * 8, i * 8 + 8).reduce((a, b) => a * 2 + b, 0),
  );
}
export function packet(message, sequence = 0) {
  const payload = new TextEncoder().encode(message);
  if (payload.length > 120) throw Error("Use até 120 bytes UTF-8 na mensagem.");
  const body = Uint8Array.from([sequence & 255, payload.length, ...payload]);
  const crc = crc16(body);
  return Uint8Array.from([
    0xaa,
    0xaa,
    0xd3,
    0x91,
    ...body,
    crc >> 8,
    crc & 255,
  ]);
}
function point(mode, b) {
  if (mode === "OOK") return [b[0] * Math.SQRT2, 0];
  if (mode === "BPSK") return [1 - 2 * b[0], 0];
  if (mode === "QPSK")
    return [(1 - 2 * b[0]) / Math.SQRT2, (1 - 2 * b[1]) / Math.SQRT2];
  const levels = [-3, -1, 3, 1];
  return [
    levels[b[0] * 2 + b[1]] / Math.sqrt(10),
    levels[b[2] * 2 + b[3]] / Math.sqrt(10),
  ];
}
export function simulate({
  message = "Olá, rádio!",
  mode = "BPSK",
  ebn0 = 10,
  bitrate = 10000,
  distance = 10,
  obstacle = 0,
  seed = 42,
  sequence = 0,
  sf = 7,
  bandwidth = 125000,
  frame,
}) {
  if (
    !Object.hasOwn(MODES, mode) ||
    !Number.isFinite(ebn0) ||
    !Number.isFinite(bitrate) ||
    bitrate <= 0 ||
    !Number.isFinite(distance) ||
    distance < 1 ||
    !Number.isFinite(obstacle)
  )
    throw Error("Parâmetros de rádio inválidos.");
  const lora = mode === "LoRa" ? loraParameters(sf, bandwidth) : null;
  if (
    frame !== undefined &&
    ((!Array.isArray(frame) && !(frame instanceof Uint8Array)) ||
      frame.length < 8 ||
      frame.length > 128 ||
      !Array.from(frame).every(
        (byte) => Number.isInteger(byte) && byte >= 0 && byte <= 255,
      ))
  )
    throw Error("O frame deve conter de 8 a 128 bytes (0–255).");
  const bytes =
      frame === undefined ? packet(message, sequence) : Uint8Array.from(frame),
    bits = toBits(bytes),
    k = lora ? sf : MODES[mode],
    sps = lora ? lora.samples : 16;
  // Reference Eb/N0 is specified at 10 m. Extra distance follows n=2 path loss.
  const effective = ebn0 - 20 * Math.log10(distance / 10) - obstacle;
  const sigma = Math.sqrt(1 / (2 * k * 10 ** (effective / 10))),
    rng = random(seed);
  const normal = () =>
    Math.sqrt(-2 * Math.log(Math.max(rng(), 1e-12))) *
    Math.cos(2 * Math.PI * rng());
  const css = lora ? modulateCSS(bits, { sf, bandwidth, sigma, normal }) : null;
  const { tx, rx, decisions, ideal, received } = css ?? {
    tx: [],
    rx: [],
    decisions: [],
    ideal: [],
    received: [],
  };
  const candidates = lora
    ? []
    : Array.from({ length: 2 ** k }, (_, i) => {
        const b = Array.from({ length: k }, (_, j) => (i >> (k - j - 1)) & 1);
        return { b, p: mode === "FSK" ? null : point(mode, b) };
      });
  for (let offset = 0; !lora && offset < bits.length; offset += k) {
    const b = bits.slice(offset, offset + k);
    while (b.length < k) b.push(0);
    const p = mode === "FSK" ? null : point(mode, b);
    let z = [0, 0],
      tones = [
        [0, 0],
        [0, 0],
      ];
    for (let n = 0; n < sps; n++) {
      const phase = (2 * Math.PI * b[0] * n) / sps;
      const t =
        mode === "FSK"
          ? [Math.cos(phase) / Math.sqrt(sps), Math.sin(phase) / Math.sqrt(sps)]
          : p.map((v) => v / Math.sqrt(sps));
      const r = [t[0] + sigma * normal(), t[1] + sigma * normal()];
      tx.push(t);
      rx.push(r);
      if (mode === "FSK")
        for (let f = 0; f < 2; f++) {
          const a = (2 * Math.PI * f * n) / sps;
          tones[f][0] +=
            (r[0] * Math.cos(a) + r[1] * Math.sin(a)) / Math.sqrt(sps);
          tones[f][1] +=
            (r[1] * Math.cos(a) - r[0] * Math.sin(a)) / Math.sqrt(sps);
        }
      else {
        z[0] += r[0] / Math.sqrt(sps);
        z[1] += r[1] / Math.sqrt(sps);
      }
    }
    if (mode === "FSK") {
      decisions.push(tones[1][0] > tones[0][0] ? 1 : 0);
      ideal.push([1 - b[0], b[0]]);
      received.push([tones[0][0], tones[1][0]]);
    } else {
      const best = candidates.reduce((a, c) =>
        Math.hypot(z[0] - c.p[0], z[1] - c.p[1]) <
        Math.hypot(z[0] - a.p[0], z[1] - a.p[1])
          ? c
          : a,
      );
      decisions.push(...best.b);
      ideal.push(p);
      received.push(z);
    }
  }
  const decoded = toBytes(decisions.slice(0, bits.length)),
    errors = bits.reduce((n, b, i) => n + (b !== decisions[i]), 0);
  const sync = decoded
    .slice(0, 4)
    .every((v, i) => v === [0xaa, 0xaa, 0xd3, 0x91][i]);
  const body = decoded.slice(4, -2),
    crc = crc16(body),
    crcOK = crc === decoded.at(-2) * 256 + decoded.at(-1);
  const lengthOK = decoded[5] === decoded.length - 8,
    ok = sync && crcOK && lengthOK;
  const actualBitrate = lora ? lora.bitrate : bitrate;
  const airtime = lora
    ? ideal.length * lora.symbolDuration
    : bits.length / bitrate;
  return {
    bytes,
    bits,
    decisions: decisions.slice(0, bits.length),
    decoded,
    errors,
    ber: errors / bits.length,
    ok,
    sync,
    crcOK,
    lengthOK,
    tx,
    rx,
    ideal,
    received,
    effective,
    airtime,
    bandwidth: lora ? bandwidth : mode === "FSK" ? 2 * bitrate : bitrate / k,
    payload: ok ? new TextDecoder().decode(decoded.slice(6, -2)) : null,
    k,
    sps,
    bitrate: actualBitrate,
    ...(lora
      ? {
          sf,
          spectra: css.spectra,
          padding: css.padding,
          symbolDuration: lora.symbolDuration,
          snr: effective + 10 * Math.log10(sf / lora.samples),
        }
      : {}),
  };
}
