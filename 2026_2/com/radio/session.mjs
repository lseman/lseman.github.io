import { simulate } from "./phy.mjs";

const CSV_COLUMNS = [
  "attempt",
  "sequence",
  "mode",
  "sf",
  "bandwidth_hz",
  "bitrate",
  "snr_db",
  "padding_bits",
  "ebn0",
  "errors",
  "bits",
  "delivered",
  "airtime_ms",
];

// Owns acquisition sequencing and measurements; no DOM and no rendering state.
export class ExperimentSession {
  #nextSequence = 0;
  #latest = null;
  #measurements = [];
  #delivered = 0;
  #generation = 0;

  get latest() {
    return this.#latest;
  }
  get count() {
    return this.#measurements.length;
  }
  get delivered() {
    return this.#delivered;
  }
  get measurements() {
    return this.#measurements.slice();
  }

  acquire(config, message, { replay = false } = {}) {
    if (replay && !this.#latest)
      throw Error("Transmita um pacote antes de repetir.");
    const sequence = replay ? this.#latest.sequence : this.#nextSequence;
    const payload = replay ? this.#latest.message : message;
    // Commit state only after simulation succeeds: invalid inputs do not consume sequence numbers.
    const result = simulate({ ...config, message: payload, sequence });
    if (!replay) this.#nextSequence = (sequence + 1) % 256;
    return this.#record(config, result, { message: payload, sequence });
  }

  async acquireFirmware(
    config,
    frame,
    receive,
    { tx = null, sources = null, replay = false } = {},
  ) {
    const generation = this.#generation;
    const physical = simulate({ ...config, frame });
    // The receiver gets raw decoded bytes even if the reference checker rejects them.
    const rx = await receive(Uint8Array.from(physical.decoded));
    if (generation !== this.#generation) throw Error("Aquisição cancelada.");
    const report = rx.report;
    const result = {
      ...physical,
      reference: {
        ok: physical.ok,
        sync: physical.sync,
        lengthOK: physical.lengthOK,
        crcOK: physical.crcOK,
      },
      ok: report?.accepted === true,
      sync: report?.syncOK ?? null,
      lengthOK: report?.lengthOK ?? null,
      crcOK: report?.crcOK ?? null,
      payload: report?.accepted ? (report.payload ?? null) : null,
    };
    return this.#record(config, result, {
      sequence: physical.bytes[4],
      message: new TextDecoder().decode(physical.bytes.slice(6, -2)),
      firmware: { tx, rx, sources, replay },
    });
  }

  #record(config, result, metadata) {
    const acquisition = Object.freeze({
      ...config,
      ...metadata,
      result,
      attempt: this.count + 1,
    });
    this.#latest = acquisition;
    this.#measurements.push(
      Object.freeze({
        attempt: acquisition.attempt,
        sequence: acquisition.sequence,
        mode: config.mode,
        sf: config.mode === "LoRa" ? result.sf : "",
        bandwidth_hz: result.bandwidth,
        bitrate: result.bitrate,
        snr_db: result.snr ?? "",
        padding_bits: result.padding ?? 0,
        ebn0: result.effective,
        errors: result.errors,
        bits: result.bits.length,
        delivered: result.ok,
        airtime_ms: result.airtime * 1000,
      }),
    );
    this.#delivered += Number(result.ok);
    return acquisition;
  }

  exportCSV() {
    return [
      CSV_COLUMNS.join(","),
      ...this.#measurements.map((row) =>
        CSV_COLUMNS.map((key) => row[key]).join(","),
      ),
    ].join("\n");
  }

  cancelPending() {
    this.#generation++;
  }

  reset() {
    this.#generation++;
    this.#nextSequence = 0;
    this.#latest = null;
    this.#measurements = [];
    this.#delivered = 0;
  }
}
