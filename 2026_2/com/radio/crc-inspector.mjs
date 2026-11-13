const hex = (value) =>
  Number.isInteger(value)
    ? "0x" + value.toString(16).padStart(4, "0").toUpperCase()
    : "—";
export function createCRCInspector() {
  const $ = (id) => document.getElementById(id);
  let acquisition = null;
  function rows() {
    const side = $("crc-board").value;
    const trace =
      acquisition?.firmware?.[side === "A" ? "tx" : "rx"]?.trace ?? [];
    const index = Number($("crc-byte").value);
    const selected = trace.filter((row) => row.byte === index);
    $("crc-trace-info").textContent = selected.length
      ? `Byte ${index}: registro “antes” já inclui o XOR com o byte de entrada. Cada linha registra uma operação executada pelo código da placa ${side}.`
      : `Nenhuma chamada traceCRC() registrada para este byte na placa ${side}.`;
    $("crc-trace-rows").replaceChildren(
      ...selected.map((row) => {
        const tr = document.createElement("tr");
        for (const value of [
          row.bit,
          hex(row.before),
          row.msb ? "1" : "0",
          row.msb ? "shift + XOR (veja o código)" : "shift",
          hex(row.after),
        ]) {
          const td = document.createElement("td");
          td.textContent = value;
          tr.append(td);
        }
        return tr;
      }),
    );
    if (!selected.length) {
      const td = $("crc-trace-rows").insertRow().insertCell();
      td.colSpan = 5;
      td.textContent = "Sem traço para exibir.";
      td.className = "empty-history";
    }
  }
  function selectBytes() {
    const frame =
      $("crc-board").value === "A"
        ? acquisition?.result.bytes
        : acquisition?.result.decoded;
    const previous = $("crc-byte").value;
    $("crc-byte").replaceChildren(
      ...Array.from(frame?.slice(4, -2) ?? [], (byte, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = `${index} · 0x${byte.toString(16).padStart(2, "0").toUpperCase()}`;
        return option;
      }),
    );
    if (!$("crc-byte").options.length) {
      const option = document.createElement("option");
      option.value = "0";
      option.textContent = "—";
      $("crc-byte").append(option);
    }
    $("crc-byte").value = Array.from($("crc-byte").options).some(
      (o) => o.value === previous,
    )
      ? previous
      : "0";
    rows();
  }
  function show(value) {
    acquisition = value;
    const { result: r, firmware } = value;
    $("crc-tx").textContent = hex(firmware?.tx?.report?.crcCalculated);
    $("crc-wire").textContent = hex((r.decoded.at(-2) << 8) | r.decoded.at(-1));
    $("crc-rx").textContent = hex(firmware?.rx?.report?.crcCalculated);
    $("firmware-decision").textContent = r.ok ? "ACEITO" : "DESCARTADO";
    $("firmware-decision").dataset.state = r.ok ? "ok" : "error";
    $("crc-reference").textContent =
      `Verificador independente: CRC ${r.reference?.crcOK ? "válido" : "inválido"} · ${r.errors} erros de canal em ${r.bits.length} bits. A aceitação e os indicadores SYNC/LEN/CRC acima vêm do retorno de loop() em B; a referência não substitui essa decisão.`;
    selectBytes();
  }
  function clear() {
    acquisition = null;
    for (const id of ["crc-tx", "crc-wire", "crc-rx", "firmware-decision"])
      $(id).textContent = "—";
    delete $("firmware-decision").dataset.state;
    $("crc-reference").textContent =
      "O verificador de referência é independente e não bloqueia a entrega ao firmware B.";
    selectBytes();
  }
  const abort = new AbortController();
  $("crc-board").addEventListener("change", selectBytes, {
    signal: abort.signal,
  });
  $("crc-byte").addEventListener("change", rows, { signal: abort.signal });
  clear();
  return { show, clear, destroy: () => abort.abort() };
}
