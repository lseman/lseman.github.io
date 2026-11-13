import { createCodeEditor } from "./code-editor.mjs";
import { loraParameters } from "./lora.mjs";
import { ExperimentSession } from "./session.mjs";
import { createInstruments } from "./instruments.mjs";
import { createCRCInspector } from "./crc-inspector.mjs";
import { BoardRuntime } from "./firmware-runtime.mjs";
import { FIRMWARE_A, FIRMWARE_B } from "./firmware-templates.mjs";

const $ = (id) => document.getElementById(id);
const session = new ExperimentSession();
const instruments = createInstruments();
const crcInspector = createCRCInspector();
const boardA = new BoardRuntime("A"),
  boardB = new BoardRuntime("B");
const events = new AbortController();
const listen = (element, type, handler) =>
  element.addEventListener(type, handler, { signal: events.signal });
const CONTROL_IDS = [
  "mode",
  "bitrate",
  "ebn0",
  "distance",
  "obstacle",
  "seed",
  "sf",
  "bandwidth",
];
const PRESETS = {
  clean: { mode: "BPSK", ebn0: 14, distance: 10, obstacle: 0 },
  noise: { mode: "BPSK", ebn0: 0, distance: 20, obstacle: 6 },
  qam: { mode: "16QAM", ebn0: 6, distance: 10, obstacle: 0 },
  fsk: { mode: "FSK", ebn0: 8, distance: 10, obstacle: 0 },
  lora: {
    mode: "LoRa",
    ebn0: 10,
    distance: 10,
    obstacle: 0,
    sf: 7,
    bandwidth: 125000,
  },
};
const format = (value, digits) =>
  value.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
let manualBitrate = $("bitrate").value;
let loadedSources = null,
  busy = false,
  running = false,
  timer = null,
  epoch = 0,
  loopCount = 0;
const serial = { A: [], B: [] };
$("program-a").value = FIRMWARE_A;
$("program-b").value = FIRMWARE_B;
const codeEditors = Object.fromEntries(["program-a", "program-b"].map((id) =>
  [id, createCodeEditor($(id), events.signal)]
));

function showOLED(side, lines = Array(8).fill(" ".repeat(21))) {
  const screen = $("oled-" + side.toLowerCase());
  screen.textContent = lines.join("\n");
  screen.setAttribute("aria-label", "Tela OLED da placa " + side + ": " +
    (lines.map(line => line.trim()).filter(Boolean).join("; ") || "vazia"));
}
showOLED("A");
showOLED("B");

function settings() {
  return Object.fromEntries(
    CONTROL_IDS.map((id) => [
      id,
      id === "mode" ? $(id).value : Number($(id).value),
    ]),
  );
}
function sources() {
  return { A: $("program-a").value, B: $("program-b").value };
}
function updateControls() {
  const lora = $("mode").value === "LoRa";
  if (lora && !$("bitrate").disabled) manualBitrate = $("bitrate").value;
  if (!lora && $("bitrate").disabled) $("bitrate").value = manualBitrate;
  $("bitrate").disabled = lora;
  $("lora-controls").hidden = !lora;
  if (lora) {
    const p = loraParameters(
      Number($("sf").value),
      Number($("bandwidth").value),
    );
    $("bitrate").value = p.bitrate.toFixed(2);
    $("lora-rate").textContent =
      `Tₛ ${format(p.symbolDuration * 1000, 3)} ms · Rᵦ ${format(p.bitrate, 2)} bit/s`;
  }
  $("noise-value").textContent = `${$("ebn0").value} dB`;
  $("distance-value").textContent = `${$("distance").value} m`;
  $("link-label").textContent =
    `${$("distance").value} m · ${$("obstacle").selectedOptions[0].textContent}`;
  updateAcquisitionStatus();
}
function updateAcquisitionStatus() {
  const latest = session.latest,
    status = $("acquisition-status");
  if (!latest) {
    status.textContent = "AGUARDANDO";
    delete status.dataset.state;
    return;
  }
  const current = settings(),
    code = sources();
  const dirty =
    CONTROL_IDS.some((id) => current[id] !== latest[id]) ||
    code.A !== latest.firmware?.sources?.A ||
    code.B !== latest.firmware?.sources?.B;
  status.textContent = dirty
    ? "AJUSTES PENDENTES"
    : latest.result.ok
      ? "CAPTURADO"
      : "PACOTE DESCARTADO";
  status.dataset.state = dirty ? "pending" : latest.result.ok ? "ok" : "error";
}
function updateButtons() {
  $("send").disabled = busy || running;
  $("replay").disabled = busy || running || !session.latest;
  $("run-loops").disabled = busy || running;
  $("run-loops").dataset.state = running ? "running" : "";
  $("upload-firmware").disabled = busy || running;
  $("stop-loops").disabled = !busy && !running && !loadedSources;
  $("export").disabled = session.count === 0;
}
function appendLogs(side, lines) {
  if (!lines.length) return;
  serial[side].push(...lines);
  serial[side] = serial[side].slice(-160);
  const output = $(side === "A" ? "tx-log" : "rx-log");
  output.textContent = serial[side].join("\n");
  output.scrollTop = output.scrollHeight;
}
function stopBoards(
  label = "Parado · próximo ciclo executará setup() novamente",
) {
  running = false;
  clearTimeout(timer);
  timer = null;
  epoch++;
  session.cancelPending();
  boardA.dispose();
  boardB.dispose();
  loadedSources = null;
  busy = false;
  $("firmware-status").textContent = label;
  updateButtons();
}
function showError(error) {
  $("error").textContent = error.message;
  $("error").hidden = false;
  if (error.board) {
    const id = "program-" + error.board.toLowerCase();
    const message = error.message.replace(/^Placa [AB](?: · linha \d+)?: /, "");
    codeEditors[id]?.markError(error.line, (error.line ? `linha ${error.line}: ` : "") + message);
    if (error.line) setView(error.board, true);
  }
}
function validateControls() {
  for (const id of [...CONTROL_IDS, "loop-period"])
    if (!$(id).checkValidity())
      throw Error(
        `Verifique o campo: ${$(id).labels[0]?.textContent.trim() || id}.`,
      );
}
async function ensureLoaded() {
  const ticket = epoch;
  const code = sources();
  if (loadedSources?.A === code.A && loadedSources?.B === code.B) return;
  $("firmware-status").textContent = "Carregando A+B · executando setup()…";
  const outcomes = await Promise.allSettled([
    boardA.load(code.A),
    boardB.load(code.B),
  ]);
  if (ticket !== epoch) throw Error("Carregamento cancelado.");
  const failed = outcomes.find((result) => result.status === "rejected");
  if (failed) {
    boardA.dispose();
    boardB.dispose();
    throw failed.reason;
  }
  loadedSources = code;
  showOLED("A", outcomes[0].value.oled);
  showOLED("B", outcomes[1].value.oled);
  appendLogs("A", ["[setup A]", ...outcomes[0].value.logs]);
  appendLogs("B", ["[setup B]", ...outcomes[1].value.logs]);
  $("firmware-status").textContent = "A+B carregados · setup() concluído";
}
async function upload() {
  if (busy || running) return;
  stopBoards();
  const ticket = epoch;
  busy = true;
  updateButtons();
  try {
    await ensureLoaded();
    if (ticket !== epoch) return;
    $("error").hidden = true;
  } catch (error) {
    if (ticket === epoch) {
      stopBoards("Falha ao carregar");
      showError(error);
    }
  } finally {
    if (ticket === epoch) {
      busy = false;
      updateButtons();
    }
  }
}
async function cycle(replay = false) {
  if (busy) return 0;
  const ticket = epoch;
  busy = true;
  updateButtons();
  try {
    validateControls();
    const config = settings();
    await ensureLoaded();
    if (ticket !== epoch) return 0;
    const tx = replay
      ? {
          ...session.latest.firmware.tx,
          frame: session.latest.result.bytes,
          logs: ["[repetição do último frame; loop A não executado]"],
        }
      : await boardA.step();
    if (ticket !== epoch) return 0;
    let acquisition = null,
      rx;
    if (tx.frame) {
      acquisition = await session.acquireFirmware(
        config,
        tx.frame,
        async (frame) => {
          rx = await boardB.step(frame);
          return rx;
        },
        {
          tx,
          sources: replay
            ? { ...loadedSources, A: session.latest.firmware.sources.A }
            : loadedSources,
          replay,
        },
      );
    } else rx = await boardB.step(null);
    if (ticket !== epoch) return 0;
    if (!replay) showOLED("A", tx.oled);
    showOLED("B", rx.oled);
    loopCount++;
    $("loop-count").textContent = `LOOP ${loopCount}`;
    appendLogs("A", [
      `[loop ${loopCount}${replay ? " · replay" : ""}]`,
      ...tx.logs,
    ]);
    appendLogs("B", [`[loop ${loopCount}]`, ...rx.logs]);
    $("error").hidden = true;
    $("error").textContent = "";
    if (acquisition) {
      renderAcquisition(acquisition);
      renderHistory();
      instruments.show(acquisition);
      crcInspector.show(acquisition);
      updateAcquisitionStatus();
    } else
      $("link-status").textContent =
        "A não enviou pacote · B executou loop() sem dados";
    $("firmware-status").textContent = running
      ? "A+B em loop"
      : "Ciclo concluído · estado das placas preservado";
    return acquisition?.result.airtime * 1000 || 0;
  } catch (error) {
    if (ticket === epoch) {
      stopBoards("Execução interrompida por erro");
      showError(error);
    }
    return 0;
  } finally {
    if (ticket === epoch) {
      busy = false;
      updateButtons();
    }
  }
}
async function continuousCycle() {
  const ticket = epoch;
  const airtime = await cycle();
  if (running && ticket === epoch)
    timer = setTimeout(
      continuousCycle,
      Math.max(Number($("loop-period").value), airtime),
    );
}
function startLoops() {
  if (busy || running) return;
  running = true;
  updateButtons();
  void continuousCycle();
}
function firmwareEdited() {
  stopBoards("Firmware alterado · carregue ou execute um ciclo");
  updateAcquisitionStatus();
}
function renderAcquisition(acquisition) {
  const { result, mode, attempt } = acquisition;
  $("export").disabled = false;
  $("link-status").textContent = result.ok
    ? "✓ Mensagem entregue"
    : "× Pacote descartado";
  $("link-status").dataset.state = result.ok ? "ok" : "error";
  document.querySelector(".rx-board").dataset.state = result.ok
    ? "ok"
    : "error";
  $("ber").textContent = result.ber.toFixed(4);
  $("error-count").textContent =
    `${result.errors} erros / ${result.bits.length} bits`;
  $("delivery").textContent = `${session.delivered}/${session.count}`;
  $("delivery-rate").textContent =
    `${format((session.delivered / session.count) * 100, 1)}% entregues · sessão`;
  $("airtime").textContent = `${format(result.airtime * 1000, 2)} ms`;
  $("effective").textContent = `${format(result.effective, 1)} dB`;
  $("acquisition-number").textContent =
    `ACQ ${String(attempt).padStart(3, "0")}`;
  $("capture-label").textContent =
    `Última aquisição${acquisition.firmware?.replay ? " (replay)" : ""}: ${mode}${mode === "LoRa" ? ` / SF${result.sf}` : ""} · ${acquisition.distance} m · Rᵦ ${format(result.bitrate, 1)} bit/s · seed ${acquisition.seed}`;
  $("radio-badge").textContent =
    mode === "LoRa" ? "CSS EDUCACIONAL" : "RÁDIO I/Q EDUCACIONAL";
}

function renderHistory() {
  $("history-count").textContent = `${session.count} AQUISIÇÕES`;
  const rows = session.measurements.slice(-8).reverse();
  $("history-rows").replaceChildren(
    ...rows.map((row) => {
      const tr = document.createElement("tr");
      const values = [
        String(row.attempt).padStart(3, "0"),
        `${row.mode}${row.sf ? ` SF${row.sf}` : ""}`,
        `${format(row.ebn0, 1)} dB`,
        `${row.errors}/${row.bits}`,
        row.delivered ? "OK" : "FALHA",
      ];
      for (const [index, value] of values.entries()) {
        const td = document.createElement("td");
        td.textContent = value;
        if (index === values.length - 1)
          td.dataset.state = row.delivered ? "ok" : "error";
        tr.append(td);
      }
      return tr;
    }),
  );
  if (!rows.length) {
    const row = $("history-rows").insertRow();
    const cell = row.insertCell();
    cell.colSpan = 5;
    cell.className = "empty-history";
    cell.textContent = "As aquisições aparecerão aqui.";
  }
}

function resetSession() {
  stopBoards();
  session.reset();
  instruments.clear();
  crcInspector.clear();
  loopCount = 0;
  $("loop-count").textContent = "LOOP 0";
  showOLED("A");
  showOLED("B");
  serial.A = [];
  serial.B = [];
  $("tx-log").textContent = "Aguardando setup A…";
  $("rx-log").textContent = "Aguardando setup B…";
  for (const id of ["ber", "delivery", "airtime", "effective"])
    $(id).textContent = "—";
  $("error-count").textContent = "BER · aguardando aquisição";
  $("delivery-rate").textContent = "Acumulado da sessão";
  $("link-status").textContent = "Pronto para transmitir";
  delete $("link-status").dataset.state;
  delete document.querySelector(".rx-board").dataset.state;
  $("error").hidden = true;
  $("error").textContent = "";
  $("acquisition-number").textContent = "ACQ —";
  $("capture-label").textContent =
    "Nenhuma aquisição. Execute um ciclo para iniciar.";
  renderHistory();
  updateAcquisitionStatus();
  updateButtons();
}
function exportMeasurements() {
  const url = URL.createObjectURL(
    new Blob([session.exportCSV()], { type: "text/csv;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "radio-lab.csv";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function setTheme(light) {
  document.body.classList.toggle("light", light);
  $("theme").setAttribute("aria-pressed", String(light));
  instruments.redraw();
}
for (const id of CONTROL_IDS) listen($(id), "input", updateControls);
for (const id of ["program-a", "program-b"])
  listen($(id), "input", firmwareEdited);
for (const [id, source, target] of [
  ["restore-a", FIRMWARE_A, "program-a"],
  ["restore-b", FIRMWARE_B, "program-b"],
])
  listen($(id), "click", () => {
    $(target).value = source;
    codeEditors[target].refresh();
    firmwareEdited();
  });
listen($("send"), "click", () => {
  if (!running) void cycle();
});
listen($("replay"), "click", () => {
  if (!running) void cycle(true);
});
listen($("upload-firmware"), "click", () => {
  void upload();
});
listen($("run-loops"), "click", startLoops);
listen($("stop-loops"), "click", () => stopBoards());
listen($("reset"), "click", resetSession);
listen($("export"), "click", exportMeasurements);
listen($("scenario"), "change", () => {
  for (const [id, value] of Object.entries(PRESETS[$("scenario").value]))
    $(id).value = value;
  updateControls();
});
listen(document, "keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    if (!running) void cycle();
  }
});
listen($("theme"), "click", () => {
  const light = !document.body.classList.contains("light");
  setTheme(light);
  try {
    localStorage.setItem("commslab-radio-theme", light ? "light" : "dark");
  } catch {
    /* Theme works without storage. */
  }
});
try {
  setTheme(localStorage.getItem("commslab-radio-theme") === "light");
} catch {
  /* Default dark. */
}
updateControls();
renderHistory();
updateButtons();
listen(window, "pagehide", () => {
  stopBoards("Parado ao sair da página");
  testers.A.dispose();
  testers.B.dispose();
});
listen(window, "pagehide", (event) => {
  if (!event.persisted) {
    events.abort();
    instruments.destroy();
    crcInspector.destroy();
  }
});

for (const side of ["a", "b"])
  listen($("show-crc-" + side), "click", () => {
    setView(side.toUpperCase(), true);
    codeEditors["program-" + side].revealText("function crc16");
  });

/* ---------- Layout dos editores: A, B ou lado a lado ---------- */
function setView(view, onlyIfHidden = false) {
  const current = $("firmware-editors").dataset.view;
  if (onlyIfHidden && (current === "AB" || current === view)) return;
  $("firmware-editors").dataset.view = view;
  for (const button of document.querySelectorAll(".view-switch button"))
    button.setAttribute("aria-pressed", String(button.dataset.view === view));
  try {
    localStorage.setItem("commslab-radio-view", view);
  } catch {
    /* Layout works without storage. */
  }
}
for (const button of document.querySelectorAll(".view-switch button"))
  listen(button, "click", () => setView(button.dataset.view));
try {
  const saved = localStorage.getItem("commslab-radio-view");
  if (["A", "B", "AB"].includes(saved)) setView(saved);
} catch {
  /* Default side by side. */
}

/* ---------- Testes automáticos (ambiente separado das placas) ---------- */
const testers = { A: new BoardRuntime("A"), B: new BoardRuntime("B") };
function renderSelfTest(side, results, error) {
  const box = $("selftest-" + side.toLowerCase());
  box.hidden = false;
  box.replaceChildren();
  const head = document.createElement("div");
  head.className = "selftest-head";
  const title = document.createElement("strong");
  const meter = document.createElement("div");
  meter.className = "selftest-meter";
  const fill = document.createElement("span");
  meter.append(fill);
  const close = document.createElement("button");
  close.type = "button";
  close.className = "selftest-close";
  close.textContent = "×";
  close.setAttribute("aria-label", `Fechar testes da placa ${side}`);
  close.addEventListener("click", () => (box.hidden = true));
  head.append(title, meter, close);
  box.append(head);
  if (error) {
    title.textContent = `Testes ${side} · não executados`;
    const p = document.createElement("p");
    p.className = "selftest-error";
    p.textContent = error.message;
    box.append(p);
    box.dataset.state = "fail";
    return;
  }
  const scored = results.filter((r) => r.ok !== null);
  const passed = scored.filter((r) => r.ok).length;
  title.textContent = `Testes ${side} · ${passed}/${scored.length}`;
  fill.style.width = `${scored.length ? (100 * passed) / scored.length : 0}%`;
  box.dataset.state = passed === scored.length ? "pass" : "fail";
  let group = "",
    lastMessage = "";
  const list = document.createElement("ul");
  for (const r of results) {
    if (r.group !== group) {
      group = r.group;
      const g = document.createElement("li");
      g.className = "selftest-group";
      g.textContent = group;
      list.append(g);
    }
    const li = document.createElement("li");
    li.className = r.ok === null ? "pending" : r.ok ? "pass" : "fail";
    const icon = document.createElement("span");
    icon.className = "selftest-icon";
    icon.textContent = r.ok === null ? "–" : r.ok ? "✓" : "✗";
    const name = document.createElement("span");
    name.textContent = r.name;
    // Erros com linha: o botão leva à linha; a mensagem aparece uma vez só.
    const message = r.line ? r.detail.replace(/^linha \d+: /, "") : "";
    if (message && message !== lastMessage) {
      const small = document.createElement("small");
      small.className = "selftest-message";
      small.textContent = message;
      name.append(small);
    }
    lastMessage = message || lastMessage;
    const detail = document.createElement(r.line ? "button" : "span");
    detail.className = "selftest-detail";
    detail.textContent = r.line ? `linha ${r.line} →` : r.detail;
    if (r.line) {
      detail.type = "button";
      detail.title = "Ir para a linha";
      detail.addEventListener("click", () =>
        codeEditors["program-" + side.toLowerCase()].markError(r.line, r.detail),
      );
    }
    li.append(icon, name, detail);
    list.append(li);
  }
  box.append(list);
}
async function runSelfTests() {
  const button = $("test-firmware");
  button.disabled = true;
  button.textContent = "Testando…";
  const code = sources();
  try {
    await Promise.all(
      ["A", "B"].map(async (side) => {
        try {
          renderSelfTest(side, await testers[side].test(code[side]));
        } catch (error) {
          renderSelfTest(side, [], error);
        }
      }),
    );
  } finally {
    button.disabled = false;
    button.textContent = "✓ Testar A + B";
  }
}
listen($("test-firmware"), "click", () => void runSelfTests());
