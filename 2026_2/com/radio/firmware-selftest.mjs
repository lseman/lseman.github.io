import { FirmwareEngine, sourceLine } from "./firmware-engine.mjs";
import { crc16 as reference } from "./phy.mjs";
// Automatic checks for the student's firmware. Runs inside a throwaway worker,
// never on the boards used by the bench, so it cannot change their state.

const HEADER = [0xaa, 0xaa, 0xd3, 0x91];
const hex = (value) =>
  Number.isInteger(value)
    ? "0x" + value.toString(16).toUpperCase().padStart(4, "0")
    : String(value);
const utf8 = (text) => Array.from(new TextEncoder().encode(text));

export const CRC_VECTORS = [
  { name: "crc16([]) devolve o valor inicial", bytes: [] },
  { name: "crc16([0x31]) · um único byte", bytes: [0x31] },
  { name: 'crc16("123456789") · vetor padrão', bytes: utf8("123456789") },
  { name: 'crc16(corpo de "OK") · 00 02 4F 4B', bytes: [0x00, 0x02, 0x4f, 0x4b] },
  {
    name: "crc16 de 122 bytes · corpo máximo",
    bytes: Array.from({ length: 122 }, (_, i) => (i * 37 + 11) & 0xff),
  },
];

/** Builds a reference frame (used only to exercise B). */
export function referenceFrame(sequence, text) {
  const payload = utf8(text);
  const body = [sequence & 0xff, payload.length, ...payload];
  const crc = reference(body);
  return [...HEADER, ...body, crc >> 8, crc & 0xff];
}

function failure(error) {
  const line = sourceLine(error);
  return (line ? `linha ${line}: ` : "") + (error?.message ?? String(error));
}

export function selfTest(source, role) {
  const results = [];
  const add = (group, name, ok, detail = "", line = null) =>
    results.push({ group, name, ok, detail, line });
  let engine;
  try {
    engine = new FirmwareEngine(source, role);
    add("Código", "O programa compila e define loop()", true);
  } catch (error) {
    add("Código", "O programa compila e define loop()", false, failure(error), sourceLine(error));
    return results;
  }

  for (const { name, bytes } of CRC_VECTORS) {
    const expected = reference(bytes);
    try {
      const got = engine.crc(bytes);
      add(
        "crc16",
        name,
        got === expected,
        got === expected ? hex(got) : `obtido ${hex(got)} · esperado ${hex(expected)}`,
      );
    } catch (error) {
      add("crc16", name, false, failure(error), sourceLine(error));
    }
  }

  try {
    engine.setup();
  } catch (error) {
    add("Placa", "setup() executa sem erro", false, failure(error), sourceLine(error));
    return results;
  }

  if (role === "A") testTransmitter(engine, add);
  else testReceiver(engine, add);
  return results;
}

function testTransmitter(engine, add) {
  const group = "Transmissor A";
  let first, second;
  try {
    first = engine.step();
  } catch (error) {
    add(group, "loop() executa sem erro", false, failure(error), sourceLine(error));
    return;
  }
  const f = first.frame;
  add(group, "loop() envia um quadro com radio.send()", Boolean(f), f ? `${f.length} bytes` : "nenhum quadro enviado");
  if (!f) return;
  const n = f.length;
  const header = HEADER.every((b, i) => f[i] === b);
  add(group, "Cabeçalho AA AA D3 91", header, Array.from(f.slice(0, 4), (b) => b.toString(16).toUpperCase().padStart(2, "0")).join(" "));
  add(group, "frame[5] = número de bytes do payload", f[5] === n - 8, `frame[5] = ${f[5]} · payload tem ${n - 8} bytes`);
  const sent = (f[n - 2] << 8) | f[n - 1];
  const expected = reference(f.slice(4, n - 2));
  add(group, "CRC no fim do quadro (alto, baixo) confere", sent === expected, sent === expected ? hex(sent) : `enviado ${hex(sent)} · esperado ${hex(expected)}`);
  if (first.report?.crcCalculated !== undefined)
    add(group, "Relatório crcCalculated = CRC enviado", first.report.crcCalculated === sent, hex(first.report.crcCalculated));
  try {
    second = engine.step();
  } catch (error) {
    add(group, "Segundo loop() executa sem erro", false, failure(error), sourceLine(error));
    return;
  }
  const s = second.frame;
  add(group, "A sequência avança a cada ciclo", Boolean(s) && s[4] === ((f[4] + 1) & 0xff), s ? `${f[4]} → ${s[4]}` : "segundo ciclo não enviou quadro");
}

function testReceiver(engine, add) {
  const group = "Receptor B";
  const valid = referenceFrame(7, "OK");
  const flip = (frame, index, mask = 0x01) => {
    const copy = frame.slice();
    copy[index] ^= mask;
    return copy;
  };
  const badLength = (() => {
    const payload = utf8("OK");
    const body = [7, 5, ...payload]; // declara 5 bytes, mas há 2
    const crc = reference(body);
    return [...HEADER, ...body, crc >> 8, crc & 0xff];
  })();
  const cases = [
    ["Aceita um quadro válido", valid, true],
    ["Aceita um quadro com payload vazio", referenceFrame(8, ""), true],
    ["Rejeita bit invertido no payload", flip(valid, 6), false],
    ["Rejeita bit invertido na sequência", flip(valid, 4, 0x80), false],
    ["Rejeita bit invertido no CRC recebido", flip(valid, valid.length - 1), false],
    ["Rejeita cabeçalho errado (mesmo com CRC válido)", flip(valid, 0, 0x01), false],
    ["Rejeita comprimento inconsistente (mesmo com CRC válido)", badLength, false],
  ];
  // A receiver that rejects everything would trivially "pass" the rejection
  // cases; they only count once valid frames are accepted.
  let acceptsValid = false;
  for (const [name, frame, expected] of cases) {
    try {
      const out = engine.step(frame);
      const accepted = out.report?.accepted;
      if (frame === valid) acceptsValid = accepted === true;
      const detail =
        accepted === undefined ? "loop() não retornou relatório" : accepted ? "B aceitou" : "B rejeitou";
      if (!expected && !acceptsValid) {
        add(group, name, null, "pendente: primeiro faça B aceitar quadros válidos");
        continue;
      }
      add(group, name, accepted === expected, detail);
    } catch (error) {
      add(group, name, false, failure(error), sourceLine(error));
    }
  }
}
