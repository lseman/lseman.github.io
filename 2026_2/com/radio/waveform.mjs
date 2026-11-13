// Display reconstruction only: decoder samples and measurements are never modified.
const sinc = (x) =>
  Math.abs(x) < 1e-12 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x);
export function reconstruct(
  samples,
  time,
  first = 0,
  last = samples.length - 1,
) {
  const nearest = Math.round(time);
  if (Math.abs(time - nearest) < 1e-10)
    return samples[Math.max(first, Math.min(last, nearest))];
  const result = [0, 0];
  let total = 0;
  for (let n = Math.floor(time) - 7; n <= Math.floor(time) + 8; n++) {
    const distance = time - n,
      weight = sinc(distance) * sinc(distance / 8);
    const sample = samples[Math.max(first, Math.min(last, n))];
    result[0] += sample[0] * weight;
    result[1] += sample[1] * weight;
    total += weight;
  }
  return result.map((v) => v / total);
}
// Continuous, bandwidth-wrapped chirp. At integer times this matches the modem exactly.
export function cssPoint(time, count, symbol) {
  const wrap = Math.max(0, time - (count - symbol));
  const phase =
    Math.PI * ((time * time) / count - time) +
    (2 * Math.PI * symbol * time) / count -
    2 * Math.PI * wrap;
  return [
    Math.cos(phase) / Math.sqrt(count),
    Math.sin(phase) / Math.sqrt(count),
  ];
}
export function displayWindow(result, mode, symbol, span, position = 0) {
  const lora = mode === "LoRa",
    count = result.sps;
  const length = lora
    ? Math.min(span === "all" ? count - 1 : Number(span), count - 1)
    : Math.min(Number(span) * count, result.tx.length - 1 - symbol * count);
  const localStart = lora
    ? Math.floor(
        ((count - 1 - length) * Math.max(0, Math.min(100, position))) / 100,
      )
    : 0;
  const start = symbol * count + localStart;
  return {
    start,
    end: start + length,
    localStart,
    length,
    sampleRate: lora ? result.bandwidth : (result.bitrate / result.k) * count,
  };
}
export function idealPoint(result, mode, time) {
  const symbol = Math.min(
    result.ideal.length - 1,
    Math.floor(time / result.sps),
  );
  const local = time - symbol * result.sps,
    amplitude = 1 / Math.sqrt(result.sps);
  if (mode === "LoRa")
    return cssPoint(local, result.sps, result.ideal[symbol][0]);
  if (mode === "FSK") {
    const phase = (2 * Math.PI * result.bits[symbol] * local) / result.sps;
    return [Math.cos(phase) * amplitude, Math.sin(phase) * amplitude];
  }
  return result.ideal[symbol].map((v) => v * amplitude);
}
export function component(point, time, result, view) {
  const scale = Math.sqrt(result.sps);
  if (view === "q") return point[1] * scale;
  if (view !== "carrier") return point[0] * scale;
  // A visibly slow teaching carrier, 2 cycles/symbol, not an RF-frequency simulation.
  const phase = (4 * Math.PI * time) / result.sps;
  return (point[0] * Math.cos(phase) - point[1] * Math.sin(phase)) * scale;
}
