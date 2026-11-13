import { createOLED } from "./oled.mjs";
const PARAMS = ["radio", "Serial", "traceCRC", "oled"];
// Calibrates how this engine reports line numbers of code built with new Function.
const PROBE_LINE = (() => {
  try {
    new Function(...PARAMS, '"use strict";\nthrow Error("probe");')();
  } catch (error) {
    return stackLine(error);
  }
  return null;
})();
function stackLine(error) {
  const match = /(?:<anonymous>|> Function|eval):(\d+):\d+/.exec(
    String(error?.stack ?? ""),
  );
  return match ? Number(match[1]) : null;
}
/** Line (1-based) of the student's source where `error` was raised, or null. */
export function sourceLine(error) {
  const line = stackLine(error);
  if (line === null || PROBE_LINE === null) return null;
  const result = line - PROBE_LINE + 1;
  return result >= 1 ? result : null;
}
// Executes ONLY inside a worker in the browser. Not an ESP32/Arduino emulator.
// The worker owner enforces deadlines and can terminate blocking student code.
export class FirmwareEngine {
  #oled = createOLED();
  #program;
  #role;
  #phase = "setup";
  #inbox = null;
  #frame = null;
  #logs = [];
  #trace = [];

  constructor(source, role) {
    if (!["A", "B"].includes(role)) throw Error("Placa inválida.");
    if (typeof source !== "string" || source.length > 30000)
      throw Error("Use até 30.000 caracteres de firmware por placa.");
    this.#role = role;
    const radio = Object.freeze({
      send: (bytes) => {
        if (this.#role !== "A" || this.#phase !== "loop")
          throw Error("radio.send() está disponível no loop da placa A.");
        if (this.#frame) throw Error("Envie no máximo um pacote por ciclo.");
        if (
          (!Array.isArray(bytes) && !(bytes instanceof Uint8Array)) ||
          bytes.length < 8 ||
          bytes.length > 128 ||
          !Array.from(bytes).every(
            (b) => Number.isInteger(b) && b >= 0 && b <= 255,
          )
        )
          throw Error(
            "radio.send(): informe de 8 a 128 bytes inteiros (0–255).",
          );
        this.#frame = Uint8Array.from(bytes);
      },
      receive: () => {
        if (this.#role !== "B")
          throw Error("radio.receive() está disponível na placa B.");
        const frame = this.#inbox;
        this.#inbox = null;
        return frame;
      },
    });
    const Serial = Object.freeze({
      println: (value) => {
        if (this.#logs.length < 60)
          this.#logs.push(String(value).slice(0, 600));
      },
    });
    const traceCRC = (row) => {
      if (this.#trace.length >= 2048) return;
      if (
        !row ||
        !Number.isInteger(row.byte) ||
        row.byte < 0 ||
        row.byte > 127 ||
        !Number.isInteger(row.bit) ||
        row.bit < 0 ||
        row.bit > 7 ||
        ![row.before, row.after].every(
          (v) => Number.isInteger(v) && v >= 0 && v <= 65535,
        ) ||
        typeof row.msb !== "boolean"
      )
        throw Error(
          "traceCRC(): informe {byte, bit, before, msb, after} válidos.",
        );
      this.#trace.push({
        byte: row.byte,
        bit: row.bit,
        before: row.before,
        msb: row.msb,
        after: row.after,
      });
    };
    const factory = new Function(
      ...PARAMS,
      `"use strict";\n${source}\nif (typeof loop !== "function") throw Error("Defina function loop().");\nreturn {setup: typeof setup === "function" ? setup : () => {}, loop, crc16: typeof crc16 === "function" ? crc16 : null};`,
    );
    this.#program = factory(radio, Serial, traceCRC, this.#oled.api);
  }

  setup() {
    this.#phase = "setup";
    this.#clear();
    this.#checkSync(this.#program.setup());
    return this.#output(null);
  }

  step(frame = null) {
    this.#phase = "loop";
    this.#clear();
    this.#inbox = frame === null ? null : Uint8Array.from(frame);
    const report = this.#program.loop();
    this.#checkSync(report);
    if (
      report !== null &&
      report !== undefined &&
      (typeof report !== "object" || Array.isArray(report))
    )
      throw Error("loop() deve retornar um objeto de relatório ou null.");
    if (
      this.#role === "B" &&
      report != null &&
      typeof report.accepted !== "boolean"
    )
      throw Error("O relatório de B precisa de accepted: true/false.");
    if (report != null) {
      for (const key of ["syncOK", "lengthOK", "crcOK"])
        if (report[key] !== undefined && typeof report[key] !== "boolean")
          throw Error(`${key} precisa ser true/false.`);
      for (const key of ["crcReceived", "crcCalculated"])
        if (
          report[key] !== undefined &&
          (!Number.isInteger(report[key]) ||
            report[key] < 0 ||
            report[key] > 65535)
        )
          throw Error(`${key} precisa ser um inteiro de 16 bits.`);
      if (
        report.payload !== undefined &&
        report.payload !== null &&
        (typeof report.payload !== "string" || report.payload.length > 512)
      )
        throw Error("payload precisa ser texto de até 512 caracteres.");
    }
    // Export only the documented scalar report fields, never arbitrary firmware objects.
    const clean =
      report == null
        ? null
        : Object.fromEntries(
            [
              "accepted",
              "syncOK",
              "lengthOK",
              "crcOK",
              "crcReceived",
              "crcCalculated",
              "payload",
            ]
              .filter((key) => report[key] !== undefined)
              .map((key) => [key, report[key]]),
          );
    return this.#output(clean);
  }
  /** Calls the student's crc16 directly (self-test only). */
  crc(bytes) {
    if (!this.#program.crc16) throw Error("Defina function crc16(bytes).");
    this.#phase = "test";
    this.#clear();
    const value = this.#program.crc16(Array.from(bytes));
    this.#checkSync(value);
    if (!Number.isInteger(value) || value < 0 || value > 65535)
      throw Error(
        `crc16 retornou ${String(value)}; esperado um inteiro de 0 a 65535.`,
      );
    return value;
  }
  #checkSync(value) {
    if (value && typeof value.then === "function")
      throw Error(
        "setup() e loop() devem ser síncronos. O relógio da bancada agenda os ciclos.",
      );
  }
  #clear() {
    this.#frame = null;
    this.#logs = [];
    this.#trace = [];
  }
  #output(report) {
    return { frame: this.#frame, report, logs: this.#logs, trace: this.#trace, oled: this.#oled.snapshot() };
  }
}
