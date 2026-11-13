// Uncoded LoRa-inspired CSS: Fs=BW, N=2^SF, ideal timing, noncoherent FFT detection.
// The surrounding packet format is CommsLab's, not the Semtech/LoRaWAN PHY.
export const LORA_BANDWIDTHS = [125000, 250000, 500000];
export function loraParameters(sf, bandwidth) {
  if (
    !Number.isInteger(sf) ||
    sf < 7 ||
    sf > 12 ||
    !LORA_BANDWIDTHS.includes(bandwidth)
  ) {
    throw Error(
      "LoRa: use SF inteiro entre 7 e 12 e BW de 125, 250 ou 500 kHz.",
    );
  }
  const samples = 2 ** sf;
  return {
    samples,
    symbolDuration: samples / bandwidth,
    bitrate: (sf * bandwidth) / samples,
  };
}
export function upchirp(n, count) {
  const phase = Math.PI * ((n * n) / count - n);
  return [Math.cos(phase), Math.sin(phase)];
}
// Iterative radix-2 FFT. Inputs are copied so inspection can retain dechirped samples.
export function fftPower(real, imag) {
  const n = real.length;
  if (n < 2 || n & (n - 1) || imag.length !== n)
    throw Error("FFT: tamanho inválido.");
  const re = Float64Array.from(real),
    im = Float64Array.from(imag);
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let size = 2; size <= n; size *= 2) {
    const angle = (-2 * Math.PI) / size,
      wr = Math.cos(angle),
      wi = Math.sin(angle);
    for (let start = 0; start < n; start += size) {
      let ur = 1,
        ui = 0;
      for (let j = 0; j < size / 2; j++) {
        const a = start + j,
          b = a + size / 2;
        const vr = re[b] * ur - im[b] * ui,
          vi = re[b] * ui + im[b] * ur;
        re[b] = re[a] - vr;
        im[b] = im[a] - vi;
        re[a] += vr;
        im[a] += vi;
        [ur, ui] = [ur * wr - ui * wi, ur * wi + ui * wr];
      }
    }
  }
  return Float64Array.from(re, (v, i) => (v * v + im[i] * im[i]) / n);
}
export function dechirp(samples) {
  const count = samples.length,
    real = new Float64Array(count),
    imag = new Float64Array(count);
  for (let n = 0; n < count; n++) {
    const [cr, ci] = upchirp(n, count),
      [r, q] = samples[n];
    real[n] = r * cr + q * ci;
    imag[n] = q * cr - r * ci;
  }
  return { real, imag };
}
export function modulateCSS(bits, { sf, bandwidth, sigma, normal }) {
  const params = loraParameters(sf, bandwidth),
    count = params.samples;
  const tx = [],
    rx = [],
    ideal = [],
    received = [],
    spectra = [],
    decisions = [];
  const reference = Array.from({ length: count }, (_, n) => upchirp(n, count));
  const amplitude = 1 / Math.sqrt(count);
  for (let offset = 0; offset < bits.length; offset += sf) {
    let symbol = 0;
    for (let j = 0; j < sf; j++) symbol = symbol * 2 + (bits[offset + j] ?? 0);
    const block = [];
    for (let n = 0; n < count; n++) {
      const angle = (2 * Math.PI * symbol * n) / count,
        c = Math.cos(angle),
        s = Math.sin(angle);
      const [cr, ci] = reference[n];
      const t = [(cr * c - ci * s) * amplitude, (cr * s + ci * c) * amplitude];
      const r = [t[0] + sigma * normal(), t[1] + sigma * normal()];
      tx.push(t);
      rx.push(r);
      block.push(r);
    }
    const d = dechirp(block),
      spectrum = fftPower(d.real, d.imag);
    let detected = 0;
    for (let bin = 1; bin < count; bin++)
      if (spectrum[bin] > spectrum[detected]) detected = bin;
    for (let j = sf - 1; j >= 0; j--) decisions.push((detected >> j) & 1);
    ideal.push([symbol, 1]);
    received.push([detected, spectrum[detected]]);
    spectra.push(spectrum);
  }
  return {
    tx,
    rx,
    ideal,
    received,
    spectra,
    decisions,
    sps: count,
    symbolDuration: params.symbolDuration,
    bitrate: params.bitrate,
    bandwidth,
    padding: (sf - (bits.length % sf)) % sf,
  };
}
