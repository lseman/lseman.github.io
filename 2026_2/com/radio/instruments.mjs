import { dechirp } from "./lora.mjs";
import {
  reconstruct,
  displayWindow,
  idealPoint,
  component,
} from "./waveform.mjs";

export function createInstruments(root = document) {
  const $ = (id) => root.getElementById(id);
  const events = new AbortController();
  const listen = (element, type, handler) =>
    element.addEventListener(type, handler, { signal: events.signal });
  let last = null;
  let plottedMode = null;
  let resizeFrame;
  function canvas(id) {
    const el = $(id),
      c = el.getContext("2d"),
      rect = el.getBoundingClientRect(),
      ratio = window.devicePixelRatio || 1;
    const w = Math.max(240, rect.width),
      h = rect.height || 240;
    if (
      el.width !== Math.round(w * ratio) ||
      el.height !== Math.round(h * ratio)
    ) {
      el.width = Math.round(w * ratio);
      el.height = Math.round(h * ratio);
    }
    c.setTransform(ratio, 0, 0, ratio, 0, 0);
    c.clearRect(0, 0, w, h);
    const css = getComputedStyle(document.body);
    c.font = "11px monospace";
    c.strokeStyle = css.getPropertyValue("--grid");
    c.lineWidth = 1;
    for (let x = 46; x < w - 10; x += 50) {
      c.beginPath();
      c.moveTo(x, 26);
      c.lineTo(x, h - 30);
      c.stroke();
    }
    for (let y = 35; y < h - 25; y += 40) {
      c.beginPath();
      c.moveTo(46, y);
      c.lineTo(w - 12, y);
      c.stroke();
    }
    c.fillStyle = css.getPropertyValue("--muted");
    if (!last) c.fillText("Transmita um pacote para visualizar.", 20, 120);
    return { c, w, h, css };
  }
  function configureWave(mode) {
    if (plottedMode === mode) return;
    const lora = mode === "LoRa";
    $("wave-view").value = lora ? "i" : "carrier";
    $("wave-view").querySelector('[value="carrier"]').disabled = lora;
    $("wave-window").replaceChildren(
      ...(lora
        ? [
            [16, "16 chips · detalhe"],
            [64, "64 chips"],
            ["all", "Chirp completo"],
          ]
        : [
            [1, "1 símbolo"],
            [4, "4 símbolos"],
            [8, "8 símbolos"],
          ]
      ).map(([value, text]) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = text;
        return option;
      }),
    );
    $("wave-window").value = lora ? "16" : "4";
    $("wave-position").value = 0;
    $("wave-position-label").hidden = !lora;
    plottedMode = mode;
  }
  function draw() {
    const wave = canvas("wave"),
      scatter = canvas("constellation");
    $("symbol-prev").disabled = !last || Number($("symbol").value) === 0;
    $("symbol-next").disabled =
      !last || Number($("symbol").value) >= Number($("symbol").max);
    if (!last) return;
    const r = last.result,
      s = Number($("symbol").value);
    $("symbol-value").textContent = s;
    drawWaveform(r, s, wave);
    if (last.mode === "LoRa") {
      drawLoRa(r, s, scatter);
      selectBits(r, s, true);
      return;
    }
    const { c, w, h, css } = scatter,
      range = Math.max(1.6, ...r.received.flat().map(Math.abs)),
      scale = (h - 50) / (range * 2),
      cx = w / 2,
      cy = h / 2;
    c.fillText(
      last.mode === "FSK"
        ? "x: correlação tom 0 · y: correlação tom 1"
        : "x: I · y: Q",
      35,
      16,
    );
    // Equal I/Q scaling and labeled zero axes make the constellation measurable.
    c.strokeStyle = css.getPropertyValue("--muted");
    c.globalAlpha = 0.5;
    c.beginPath();
    c.moveTo(35, cy);
    c.lineTo(w - 15, cy);
    c.moveTo(cx, 27);
    c.lineTo(cx, h - 25);
    c.stroke();
    c.globalAlpha = 1;
    c.fillStyle = css.getPropertyValue("--muted");
    const tick = 10 ** Math.floor(Math.log10(range));
    for (const value of [-tick, tick]) {
      c.fillText(String(value), cx + value * scale - 4, cy + 14);
      c.fillText(String(value), cx + 7, cy - value * scale + 4);
    }
    c.fillText("0", cx + 6, cy + 14);
    const dot = (p, color, radius, fill) => {
      c.beginPath();
      c.strokeStyle = color;
      c.fillStyle = color;
      c.arc(cx + p[0] * scale, cy - p[1] * scale, radius, 0, Math.PI * 2);
      fill ? c.fill() : c.stroke();
    };
    r.received.forEach((p) => dot(p, css.getPropertyValue("--blue"), 2, true));
    const unique = new Map(r.ideal.map((p) => [p.join(","), p]));
    unique.forEach((p) => dot(p, css.getPropertyValue("--accent"), 6, false));
    dot(r.received[s], css.getPropertyValue("--text"), 6, false);
    selectBits(r, s, false);
  }
  function selectBits(r, s, lora) {
    const start = s * r.k,
      byte = Math.floor(start / 8),
      tx = r.bits.slice(start, start + r.k).join(""),
      rx = r.decisions.slice(start, start + r.k).join("");
    $("bit-info").textContent =
      `Símbolo ${s}: bits TX ${tx} → RX ${rx}. Byte(s) ${byte}–${Math.floor(Math.min(start + r.k - 1, r.bits.length - 1) / 8)}.${lora ? ` Bin TX ${r.ideal[s][0]} → bin RX ${r.received[s][0]}. ${s === r.ideal.length - 1 && r.padding ? `${r.padding} bits de preenchimento no último símbolo.` : ""}` : " Ponto recebido destacado em branco."} ${lora ? "Decisão pelo maior pico da FFT." : last.mode === "FSK" ? "Decisão coerente: vence a maior correlação real." : "Decisão pelo ponto ideal mais próximo."}`;
    Array.from($("bytes").children).forEach((el, i) =>
      el.classList.toggle(
        "selected",
        i * 8 < start + r.k && (i + 1) * 8 > start,
      ),
    );
  }
  function drawLoRa(r, s, scatter) {
    const { c, w, h, css } = scatter,
      count = r.sps,
      txBin = r.ideal[s][0],
      rxBin = r.received[s][0],
      spectrum = r.spectra[s];
    const power = Array.from(
      spectrum,
      (v) => 10 * Math.log10(Math.max(v, 1e-12)),
    );
    const top = Math.max(0, ...power) + 5,
      floor = top - 65;
    const x = (bin) => 40 + (bin / (count - 1)) * (w - 55),
      y = (db) =>
        h - 30 - ((Math.max(floor, db) - floor) / (top - floor)) * (h - 55);
    c.strokeStyle = css.getPropertyValue("--blue");
    c.beginPath();
    // Keep the strongest FFT bin in each screen column; narrow peaks survive SF12 downsampling.
    const columns = Math.max(1, Math.floor(w - 55));
    for (let column = 0; column < columns; column++) {
      const start = Math.floor((column * count) / columns),
        end = Math.max(start + 1, Math.floor(((column + 1) * count) / columns));
      let peak = floor;
      for (let bin = start; bin < Math.min(end, count); bin++)
        peak = Math.max(peak, power[bin]);
      const px = 40 + column,
        py = y(peak);
      if (column === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.stroke();
    c.strokeStyle = css.getPropertyValue("--accent");
    c.setLineDash([4, 3]);
    c.beginPath();
    c.moveTo(x(txBin), 25);
    c.lineTo(x(txBin), h - 30);
    c.stroke();
    c.setLineDash([]);
    c.strokeStyle = css.getPropertyValue("--text");
    c.beginPath();
    c.arc(x(rxBin), y(power[rxBin]), 5, 0, Math.PI * 2);
    c.stroke();
    c.fillText(
      `TX ${txBin} · RX ${rxBin} · pico ${power[rxBin].toFixed(1)} dB`,
      40,
      16,
    );
    c.fillText("0", 40, h - 10);
    c.fillText(`bin ${count - 1}`, w - 85, h - 10);
    c.fillText(`${top.toFixed(0)} dB`, 2, 32);
    c.fillText(`${floor.toFixed(0)}`, 5, h - 30);
    $("lora-summary").textContent =
      `SF${r.sf} · ${count} chips/símbolo · BW ${r.bandwidth / 1000} kHz · Tₛ ${(r.symbolDuration * 1000).toFixed(3)} ms · Rᵦ ${r.bitrate.toFixed(2)} bit/s · SNR em BW ${r.snr.toFixed(2)} dB. Tempo no ar didático: ${(r.airtime * 1000).toFixed(2)} ms. FFT: dB relativos à energia ideal unitária.`;
    const chirp = canvas("chirp");
    const zoom = displayWindow(
      r,
      "LoRa",
      s,
      $("wave-window").value,
      Number($("wave-position").value),
    );
    chirp.c.fillStyle = chirp.css.getPropertyValue("--accent");
    chirp.c.globalAlpha = 0.12;
    chirp.c.fillRect(
      45 + (zoom.localStart / (count - 1)) * (chirp.w - 65),
      30,
      (zoom.length / (count - 1)) * (chirp.w - 65),
      chirp.h - 65,
    );
    chirp.c.globalAlpha = 1;
    chirp.c.strokeStyle = chirp.css.getPropertyValue("--accent");
    chirp.c.lineWidth = 2;
    chirp.c.beginPath();
    let previous = null;
    for (let n = 0; n < count; n++) {
      const frequency = ((n + txBin) % count) / count - 0.5;
      const px = 45 + (n / (count - 1)) * (chirp.w - 65),
        py = chirp.h / 2 - frequency * (chirp.h - 65);
      if (previous === null || frequency < previous) chirp.c.moveTo(px, py);
      else chirp.c.lineTo(px, py);
      previous = frequency;
    }
    chirp.c.stroke();
    chirp.c.fillText(`+${r.bandwidth / 2000} kHz`, 5, 16);
    chirp.c.fillText(`−${r.bandwidth / 2000} kHz`, 5, chirp.h - 27);
    chirp.c.fillText("0 ms", 45, chirp.h - 8);
    chirp.c.fillText(
      `${(r.symbolDuration * 1000).toFixed(3)} ms`,
      chirp.w - 100,
      chirp.h - 8,
    );
    drawWaveform(r, s, canvas("dechirped"), true);
  }
  function drawWaveform(r, s, plot, dechirped = false) {
    const { c, w, h, css } = plot,
      lora = last.mode === "LoRa";
    const window = displayWindow(
      r,
      last.mode,
      s,
      $("wave-window").value,
      Number($("wave-position").value),
    );
    const view = dechirped ? "i" : $("wave-view").value,
      showRX = $("wave-rx").checked;
    $(dechirped ? "dechirped-legend" : "wave-legend").textContent = showRX
      ? "Verde: TX ideal · Azul: RX reconstruído · Pontos: amostras"
      : "Verde: TX ideal · Pontos: amostras · RX oculto";
    const left = 48,
      right = w - 15,
      top = 30,
      bottom = h - 35;
    const first = lora ? s * r.sps : 0,
      lastSample = lora ? (s + 1) * r.sps - 1 : r.rx.length - 1;
    let samples = r.rx,
      sampleOffset = 0;
    const signedBin = lora
      ? r.ideal[s][0] > r.sps / 2
        ? r.ideal[s][0] - r.sps
        : r.ideal[s][0]
      : 0;
    if (dechirped) {
      const d = dechirp(r.rx.slice(first, lastSample + 1));
      samples = Array.from(d.real, (v, i) => [v, d.imag[i]]);
      sampleOffset = first;
    }
    const idealAt = (time) => {
      if (!dechirped)
        return component(idealPoint(r, last.mode, time), time, r, view);
      const phase = (2 * Math.PI * signedBin * (time - first)) / r.sps;
      return Math.cos(phase);
    };
    const receivedAt = (time) =>
      component(
        reconstruct(
          samples,
          time - sampleOffset,
          first - sampleOffset,
          lastSample - sampleOffset,
        ),
        time,
        r,
        view,
      );
    let amplitude = 1.15;
    for (
      let time = Math.ceil(window.start);
      time <= Math.floor(window.end);
      time++
    ) {
      amplitude = Math.max(amplitude, Math.abs(idealAt(time)) * 1.12);
      if (showRX)
        amplitude = Math.max(amplitude, Math.abs(receivedAt(time)) * 1.12);
    }
    const x = (time) =>
      left +
      ((time - window.start) / Math.max(window.length, 1)) * (right - left);
    const y = (value) =>
      bottom - ((value + amplitude) / (2 * amplitude)) * (bottom - top);
    c.save();
    c.beginPath();
    c.rect(left, top, right - left, bottom - top);
    c.clip();
    // Symbol boundaries help relate phase/amplitude changes to the transmitted bits.
    if (!lora) {
      c.strokeStyle = css.getPropertyValue("--muted");
      c.globalAlpha = 0.3;
      c.setLineDash([3, 5]);
      for (
        let time = Math.ceil(window.start / r.sps) * r.sps;
        time <= window.end;
        time += r.sps
      ) {
        c.beginPath();
        c.moveTo(x(time), top);
        c.lineTo(x(time), bottom);
        c.stroke();
      }
      c.setLineDash([]);
      c.globalAlpha = 1;
    }
    c.strokeStyle = css.getPropertyValue("--muted");
    c.globalAlpha = 0.35;
    c.beginPath();
    c.moveTo(left, y(0));
    c.lineTo(right, y(0));
    c.stroke();
    c.globalAlpha = 1;
    const trace = (at, color, width, opacity) => {
      // At least 12 drawing points per chip prevent sparse straight-line artifacts.
      const steps = Math.min(
        65536,
        Math.ceil(Math.max((right - left) * 2, window.length * 12)),
      );
      c.strokeStyle = color;
      c.lineWidth = width;
      c.lineJoin = "round";
      c.lineCap = "round";
      c.globalAlpha = opacity;
      c.beginPath();
      for (let i = 0; i <= steps; i++) {
        const time = window.start + (window.length * i) / steps,
          px = x(time),
          py = y(at(time));
        if (i === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
      }
      c.stroke();
      c.globalAlpha = 1;
    };
    if (showRX) trace(receivedAt, css.getPropertyValue("--blue"), 1.25, 0.65);
    trace(idealAt, css.getPropertyValue("--accent"), 2.2, 1);
    // Show actual samples only when they are far enough apart to remain distinguishable.
    if (window.length <= 64) {
      for (
        let time = Math.ceil(window.start);
        time <= Math.floor(window.end);
        time++
      ) {
        c.fillStyle = css.getPropertyValue("--accent");
        c.beginPath();
        c.arc(x(time), y(idealAt(time)), 2, 0, 2 * Math.PI);
        c.fill();
        if (showRX) {
          c.fillStyle = css.getPropertyValue("--blue");
          c.beginPath();
          c.arc(x(time), y(receivedAt(time)), 2.5, 0, 2 * Math.PI);
          c.fill();
        }
      }
    }
    c.restore();
    c.fillStyle = css.getPropertyValue("--muted");
    c.textAlign = "right";
    c.fillText(`+${amplitude.toFixed(1)}`, left - 7, top + 5);
    c.fillText("0", left - 7, y(0) + 4);
    c.fillText(`−${amplitude.toFixed(1)}`, left - 7, bottom);
    c.textAlign = "left";
    const duration = (window.length / window.sampleRate) * 1000;
    c.fillText("0", left, h - 12);
    c.textAlign = "center";
    c.fillText(`${(duration / 2).toFixed(3)} ms`, (left + right) / 2, h - 12);
    c.textAlign = "right";
    c.fillText(`${duration.toFixed(3)} ms`, right, h - 12);
    c.textAlign = "left";
    if (dechirped)
      c.fillText(
        `Tom: ${(signedBin / r.symbolDuration / 1000).toFixed(2)} kHz · bin ${r.ideal[s][0]}`,
        left,
        16,
      );
    else {
      const representation =
        view === "carrier"
          ? "portadora didática"
          : `${view.toUpperCase()} · banda base`;
      $("wave-title").textContent =
        `${lora ? "Chirp" : "Forma de onda"} · ${representation}`;
      c.fillText(
        `${lora ? "Chips" : "Amostras"} ${window.localStart}–${window.localStart + window.length} · amplitude normalizada`,
        left,
        16,
      );
      $("wave-note").textContent =
        `${lora ? `Janela de ${window.length} chips do símbolo ${s}; mova a posição para percorrer o chirp.` : `Janela a partir do símbolo ${s}. ${view === "carrier" ? "Portadora didática: 2 ciclos por símbolo; não representa a frequência de RF." : "Componentes I/Q do sinal em banda base."}`} Curva TX calculada entre as amostras; pontos indicam amostras${showRX ? ". RX reconstruído por interpolação sinc (janela Lanczos), sem alterar o detector." : ". Ative “Mostrar RX e amostras” para sobrepor o sinal com ruído."}${lora && window.length > 64 ? " Chirp completo: muitas oscilações ficam densas; selecione 16 chips para ver a forma." : ""}`;
    }
  }

  function show(acquisition) {
    last = acquisition;
    const { result: r, mode } = acquisition;
    $("symbol").max = r.ideal.length - 1;
    $("symbol").value = 0;
    $("lora-inspection").hidden = mode !== "LoRa";
    configureWave(mode);
    $("constellation-title").textContent =
      mode === "LoRa"
        ? "Dechirp → FFT"
        : mode === "FSK"
          ? "Correlatores FSK"
          : "Constelação I/Q";
    $("receiver-kind").textContent =
      mode === "LoRa" ? "FFT / CSS" : mode === "FSK" ? "CORRELAÇÃO" : "I/Q";
    $("constellation").setAttribute(
      "aria-label",
      mode === "LoRa"
        ? "Potência da FFT após dechirp, com bin esperado e bin detectado"
        : "Símbolos ideais e observados no receptor",
    );
    $("receiver-legend").textContent =
      mode === "LoRa"
        ? "Verde: bin TX · Azul: FFT recebida · Branco: decisão"
        : "○ Ideal · Azul: recebido · Branco: símbolo selecionado";
    $("packet-info").textContent =
      `AA AA: preâmbulo · D3 91: sincronismo · sequência e tamanho: 2 bytes · mensagem: ${r.bytes[5]} bytes · CRC-16: 2 bytes. TX/RX em hexadecimal. ${mode === "LoRa" ? `BW ${r.bandwidth / 1000} kHz · ${r.padding} bits de preenchimento; enquadramento didático.` : `BW estimada: ${(r.bandwidth / 1000).toFixed(2)} kHz.`}`;
    const hex = (byte) => byte.toString(16).padStart(2, "0").toUpperCase();
    $("bytes").replaceChildren(
      ...Array.from(r.bytes, (byte, index) => {
        const button = root.createElement("button");
        button.type = "button";
        button.textContent = `${hex(byte)}/${hex(r.decoded[index])}`;
        button.classList.toggle("bad", byte !== r.decoded[index]);
        const field =
          index < 2
            ? "preâmbulo"
            : index < 4
              ? "sincronismo"
              : index === 4
                ? "sequência"
                : index === 5
                  ? "tamanho"
                  : index < r.bytes.length - 2
                    ? "mensagem"
                    : "CRC";
        button.title = `Byte ${index}: ${field}`;
        button.dataset.byte = index;
        return button;
      }),
    );
    for (const [id, valid] of [
      ["sync-state", r.sync],
      ["crc-state", r.crcOK],
      ["length-state", r.lengthOK],
    ]) {
      $(id).textContent = valid === null ? "—" : valid ? "OK" : "FALHA";
      if (valid === null) delete $(id).dataset.state;
      else $(id).dataset.state = valid ? "ok" : "error";
    }
    draw();
  }
  function clear() {
    last = null;
    $("lora-inspection").hidden = true;
    $("symbol").max = $("symbol").value = 0;
    $("symbol-value").textContent = "0";
    $("bytes").replaceChildren();
    $("bit-info").textContent = "";
    $("packet-info").textContent =
      "Transmita para inspecionar os bytes. Selecione um byte para localizar seus símbolos.";
    for (const id of ["sync-state", "crc-state", "length-state"]) {
      $(id).textContent = "—";
      delete $(id).dataset.state;
    }
    draw();
  }
  listen($("bytes"), "click", (event) => {
    const button = event.target.closest("[data-byte]");
    if (!button || !last) return;
    $("symbol").value = Math.floor(
      (Number(button.dataset.byte) * 8) / last.result.k,
    );
    draw();
  });
  for (const id of ["wave-view", "wave-window", "wave-rx"])
    listen($(id), "change", draw);
  for (const id of ["symbol", "wave-position"]) listen($(id), "input", draw);
  for (const [id, step] of [
    ["symbol-prev", -1],
    ["symbol-next", 1],
  ])
    listen($(id), "click", () => {
      $("symbol").value = Math.max(
        0,
        Math.min(Number($("symbol").max), Number($("symbol").value) + step),
      );
      draw();
    });
  listen(window, "resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(draw);
  });
  function watchPixelRatio() {
    const query = window.matchMedia(
      `(resolution: ${window.devicePixelRatio || 1}dppx)`,
    );
    query.addEventListener(
      "change",
      () => {
        draw();
        watchPixelRatio();
      },
      { once: true, signal: events.signal },
    );
  }
  watchPixelRatio();
  clear();
  return {
    show,
    clear,
    redraw: draw,
    destroy() {
      events.abort();
      cancelAnimationFrame(resizeFrame);
    },
  };
}
