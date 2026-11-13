// One request per board, bounded execution time, explicit teardown. No automatic retry.
export class BoardRuntime {
  #worker;
  #pending = null;
  #id = 0;
  #role;
  #ready = null;
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
      return await this.#request({ type: "test", source, role: this.#role }, 5000);
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
    let markReady, failReady;
    this.#ready = new Promise((resolve, reject) => {
      markReady = resolve;
      failReady = reject;
    });
    this.#ready.catch(() => {});
    const bootTimer = setTimeout(
      () => failReady(Error(`Placa ${this.#role}: o simulador não carregou (rede lenta?). Tente de novo.`)),
      20000,
    );
    this.#ready.finally(() => clearTimeout(bootTimer)).catch(() => {});
    this.#worker.onmessage = ({ data }) => {
      if (data.ready) return markReady();
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
      failReady(Error(`Placa ${this.#role}: ${event.message || "falha ao carregar o worker"}`));
      this.dispose(
        Error(`Placa ${this.#role}: ${event.message || "falha no worker"}`),
      );
    };
  }
  step(frame = null) {
    return this.#request({ type: "step", frame });
  }
  #request(message, budget = 1500) {
    if (!this.#worker)
      return Promise.reject(
        Error(`Carregue o firmware da placa ${this.#role}.`),
      );
    if (this.#pending)
      return Promise.reject(
        Error("A placa ainda está executando o ciclo anterior."),
      );
    const worker = this.#worker;
    return new Promise((resolve, reject) => {
      const id = ++this.#id;
      this.#pending = { id, timer: null, resolve, reject };
      // The execution budget starts only once the worker's modules are loaded.
      this.#ready.then(
        () => {
          if (this.#worker !== worker || this.#pending?.id !== id) return;
          this.#pending.timer = setTimeout(
            () =>
              this.dispose(
                Error(
                  `Placa ${this.#role}: limite de execução excedido (${(budget / 1000).toLocaleString("pt-BR")} s). Verifique loops sem fim.`,
                ),
              ),
            budget,
          );
          try {
            worker.postMessage({ ...message, id });
          } catch (error) {
            this.dispose(error);
          }
        },
        (error) => {
          if (this.#worker === worker) this.dispose(error);
        },
      );
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
