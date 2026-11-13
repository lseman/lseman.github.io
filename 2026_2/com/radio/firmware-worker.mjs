import { FirmwareEngine, sourceLine } from "./firmware-engine.mjs";
import { selfTest } from "./firmware-selftest.mjs";
let firmware;
self.onmessage = ({ data }) => {
  try {
    let result;
    if (data.type === "load") {
      firmware = new FirmwareEngine(data.source, data.role);
      result = firmware.setup();
    } else if (data.type === "test") result = selfTest(data.source, data.role);
    else if (data.type === "step" && firmware)
      result = firmware.step(data.frame);
    else throw Error("Carregue o firmware antes de executar.");
    self.postMessage({ id: data.id, result });
  } catch (error) {
    self.postMessage({ id: data.id, error: error.message, line: sourceLine(error) });
  }
};
// Signals that every module has loaded: the runtime only starts the
// execution budget after this, so network/parse time never counts.
self.postMessage({ ready: true });
