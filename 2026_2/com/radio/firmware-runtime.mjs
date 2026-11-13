// One request per board, bounded execution time, explicit teardown. No automatic retry.
export class BoardRuntime {
  #worker;
  #pending = null;
  #id = 0;
  #role;
  constructor(role) {
    this.#role = role;
  }
  async load(source) {
    this.#spawn();
    return this.#request({ type: "load", source, role: this.#role });
  }
  /** Runs the automatic checks in a fresh worker (no board state is kept). */
  async test(source) {
    this.#spawn();
    try {
      return await this.#request({ type: "test", source, role: this.#role });
    } finally {
      this.dispose();
    }
  }
  #spawn() {
    this.dispose();
    this.#worker = new Worker(
      new URL("./firmware-worker.mjs", import.meta.url),
      { type: "module" },
    );
    this.#worker.onmessage = ({ data }) => {
      const pending = this.#pending;
      if (!pending || pending.id !== data.id) return;
      this.#pending = null;
      clearTimeout(pending.timer);
      if (data.error) {
        const error = Error(
          `Placa ${this.#role}${data.line ? ` · linha ${data.line}` : ""}: ${data.error}`,
        );
        error.board = this.#role;
        error.line = data.line ?? null;
        pending.reject(error);
      } else pending.resolve(data.result);
    };
    this.#worker.onerror = (event) => {
      event.preventDefault();
      this.dispose(
        Error(`Placa ${this.#role}: ${event.message || "falha no worker"}`),
      );
    };
  }
  step(frame = null) {
    return this.#request({ type: "step", frame });
  }
  #request(message) {
    if (!this.#worker)
      return Promise.reject(
        Error(`Carregue o firmware da placa ${this.#role}.`),
      );
    if (this.#pending)
      return Promise.reject(
        Error("A placa ainda está executando o ciclo anterior."),
      );
    return new Promise((resolve, reject) => {
      const id = ++this.#id;
      const timer = setTimeout(
        () =>
          this.dispose(
            Error(
              `Placa ${this.#role}: limite de execução excedido (1,5 s). Verifique loops sem fim.`,
            ),
          ),
        1500,
      );
      this.#pending = { id, timer, resolve, reject };
      try {
        this.#worker.postMessage({ ...message, id });
      } catch (error) {
        this.dispose(error);
      }
    });
  }
  dispose(reason = Error("Execução interrompida.")) {
    this.#worker?.terminate();
    this.#worker = null;
    if (this.#pending) {
      clearTimeout(this.#pending.timer);
      this.#pending.reject(reason);
      this.#pending = null;
    }
  }
}
