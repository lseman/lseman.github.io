// Lightweight code editor: a native <textarea> (editing, undo, accessibility)
// over an inert painted layer (syntax colors). Source text is never parsed as HTML.
const KEYWORDS =
  "function|let|const|var|if|else|for|of|in|while|do|switch|case|default|return|throw|try|catch|new|true|false|null|undefined|break|continue|typeof";
const PATTERN = new RegExp(
  String.raw`\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|` +
    "`(?:\\\\.|[^`\\\\])*`" +
    String.raw`|\b(?:${KEYWORDS})\b|\b(?:0x[\da-f]+|0b[01]+|\d+(?:\.\d+)?)\b|[A-Za-z_$][\w$]*(?=\s*\()`,
  "gi",
);
const INDENT = "  ";

export function tokenize(source) {
  const tokens = [];
  let offset = 0;
  for (const match of source.matchAll(PATTERN)) {
    if (match.index > offset) tokens.push({ text: source.slice(offset, match.index) });
    const text = match[0];
    const type =
      text.startsWith("//") || text.startsWith("/*")
        ? /\bTODO\b/.test(text) ? "todo" : "comment"
        : /^["'`]/.test(text)
          ? "string"
          : /^\d/.test(text)
            ? "number"
            : new RegExp(`^(?:${KEYWORDS})$`).test(text)
              ? "keyword"
              : "call";
    tokens.push({ text, type });
    offset = match.index + text.length;
  }
  if (offset < source.length) tokens.push({ text: source.slice(offset) });
  return tokens;
}

export function createCodeEditor(textarea, signal) {
  const wrapper = document.createElement("div");
  wrapper.className = "code-editor";
  const gutter = document.createElement("div");
  gutter.className = "code-gutter";
  gutter.setAttribute("aria-hidden", "true");
  const numbers = document.createElement("div");
  numbers.className = "code-gutter-numbers";
  gutter.append(numbers);
  const area = document.createElement("div");
  area.className = "code-area";
  const band = document.createElement("div");
  band.className = "code-line-band";
  const errorBand = document.createElement("div");
  errorBand.className = "code-line-band code-error-band";
  errorBand.hidden = true;
  const paint = document.createElement("pre");
  paint.className = "code-editor-highlight";
  paint.setAttribute("aria-hidden", "true");
  const status = document.createElement("div");
  status.className = "code-status";
  const position = document.createElement("span");
  const todos = document.createElement("span");
  todos.className = "code-todos";
  const message = document.createElement("span");
  message.className = "code-message";
  message.setAttribute("role", "status");
  const hint = document.createElement("span");
  hint.className = "code-hint";
  hint.textContent = "Tab indenta · Ctrl+/ comenta · Esc, Tab sai do editor";
  status.append(position, todos, message, hint);

  textarea.before(wrapper);
  area.append(band, errorBand, paint, textarea);
  wrapper.append(gutter, area);
  wrapper.after(status);
  for (const [k, v] of Object.entries({ autocapitalize: "off", autocomplete: "off", autocorrect: "off", spellcheck: "false" }))
    textarea.setAttribute(k, v);

  let lineCount = 0,
    errorLine = null,
    escaped = false;
  const metrics = () => {
    const style = getComputedStyle(textarea);
    return {
      lh: parseFloat(style.lineHeight) || 19,
      top: parseFloat(style.paddingTop) + parseFloat(style.borderTopWidth),
    };
  };
  const caretLine = () => textarea.value.slice(0, textarea.selectionStart).split("\n").length;
  const placeBand = (el, line) => {
    const { lh, top } = metrics();
    el.style.height = lh + "px";
    el.style.transform = `translateY(${top + (line - 1) * lh - textarea.scrollTop}px)`;
  };
  const sync = () => {
    paint.scrollTop = textarea.scrollTop;
    paint.scrollLeft = textarea.scrollLeft;
    numbers.style.transform = `translateY(${-textarea.scrollTop}px)`;
    placeBand(band, caretLine());
    if (errorLine) placeBand(errorBand, errorLine);
  };
  const renderGutter = () => {
    const count = textarea.value.split("\n").length;
    if (count !== lineCount) {
      lineCount = count;
      numbers.replaceChildren(
        ...Array.from({ length: count }, (_, i) => {
          const n = document.createElement("div");
          n.textContent = i + 1;
          return n;
        }),
      );
    }
    const active = caretLine();
    numbers.querySelector(".active")?.classList.remove("active");
    numbers.children[active - 1]?.classList.add("active");
    numbers.querySelector(".error")?.classList.remove("error");
    if (errorLine) numbers.children[errorLine - 1]?.classList.add("error");
  };
  const renderStatus = () => {
    const before = textarea.value.slice(0, textarea.selectionStart);
    const line = before.split("\n").length;
    const col = before.length - before.lastIndexOf("\n");
    position.textContent = `Ln ${line}, Col ${col}`;
    const pending = (textarea.value.match(/\/\/\s*TODO\b(?! opcional)/g) || []).length;
    todos.textContent = pending ? `${pending} TODO${pending > 1 ? "s" : ""}` : "sem TODOs ✓";
    todos.dataset.done = String(pending === 0);
  };
  const caret = () => {
    renderGutter();
    renderStatus();
    sync();
  };
  const refresh = () => {
    paint.replaceChildren(
      ...tokenize(textarea.value + "\n").map(({ text, type }) => {
        if (!type) return document.createTextNode(text);
        const span = document.createElement("span");
        span.className = "syntax-" + type;
        span.textContent = text;
        return span;
      }),
    );
    caret();
  };

  // Replace a range while keeping the browser's native undo history when possible.
  const replace = (start, end, text, selStart, selEnd = selStart) => {
    textarea.focus();
    textarea.setSelectionRange(start, end);
    let done = false;
    try {
      done = document.execCommand("insertText", false, text);
    } catch {
      done = false;
    }
    if (!done) {
      textarea.setRangeText(text, start, end, "end");
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }
    textarea.setSelectionRange(selStart, selEnd);
    caret();
  };
  const lineBlock = () => {
    const { value, selectionStart: s, selectionEnd: e } = textarea;
    const start = value.lastIndexOf("\n", s - 1) + 1;
    let end = value.indexOf("\n", e - (e > s && value[e - 1] === "\n" ? 1 : 0));
    if (end < 0) end = value.length;
    return { start, end, lines: value.slice(start, end).split("\n") };
  };
  const editLines = (transform) => {
    const { start, end, lines } = lineBlock();
    const next = transform(lines);
    const text = next.join("\n");
    replace(start, end, text, start, start + text.length);
  };

  const onKey = (event) => {
    if (event.key === "Escape") {
      escaped = true;
      return;
    }
    if (event.key === "Tab" && escaped) {
      escaped = false;
      return; // Allow keyboard users to leave the editor.
    }
    escaped = false;
    const { value, selectionStart: s, selectionEnd: e } = textarea;
    if (event.key === "Tab" && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const multi = value.slice(s, e).includes("\n");
      if (event.shiftKey)
        editLines((lines) => lines.map((l) => l.replace(/^ {1,2}/, "")));
      else if (multi) editLines((lines) => lines.map((l) => (l ? INDENT + l : l)));
      else replace(s, e, INDENT, s + INDENT.length);
    } else if (event.key === "Enter" && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
      event.preventDefault();
      const lineStart = value.lastIndexOf("\n", s - 1) + 1;
      const indent = /^[ \t]*/.exec(value.slice(lineStart, s))[0];
      const prev = value.slice(lineStart, s).trimEnd().slice(-1);
      const next = value[e];
      const open = "{([".includes(prev) && prev !== "";
      if (open && "})]".includes(next ?? "_")) {
        const text = "\n" + indent + INDENT + "\n" + indent;
        replace(s, e, text, s + 1 + indent.length + INDENT.length);
      } else {
        const text = "\n" + indent + (open ? INDENT : "");
        replace(s, e, text, s + text.length);
      }
    } else if (event.key === "}" && s === e) {
      const lineStart = value.lastIndexOf("\n", s - 1) + 1;
      const before = value.slice(lineStart, s);
      if (/^ +$/.test(before) && before.length >= INDENT.length) {
        event.preventDefault();
        const text = before.slice(INDENT.length) + "}";
        replace(lineStart, s, text, lineStart + text.length);
      }
    } else if (event.key === "/" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      editLines((lines) => {
        const filled = lines.filter((l) => l.trim());
        const commented = filled.length && filled.every((l) => /^\s*\/\//.test(l));
        if (commented) return lines.map((l) => l.replace(/^(\s*)\/\/ ?/, "$1"));
        const pad = Math.min(...filled.map((l) => /^ */.exec(l)[0].length));
        return lines.map((l) => (l.trim() ? l.slice(0, pad) + "// " + l.slice(pad) : l));
      });
    }
  };

  const clearError = () => {
    errorLine = null;
    errorBand.hidden = true;
    message.textContent = "";
    message.removeAttribute("title");
    wrapper.classList.remove("has-error");
    renderGutter();
  };
  textarea.addEventListener("input", () => {
    clearError();
    refresh();
  }, { signal });
  textarea.addEventListener("scroll", sync, { signal });
  textarea.addEventListener("keydown", onKey, { signal });
  for (const type of ["click", "keyup", "select", "focus"])
    textarea.addEventListener(type, caret, { signal });
  new ResizeObserver(sync).observe(textarea);
  refresh();

  const revealLine = (line, focus = true) => {
    const { lh } = metrics();
    const lines = textarea.value.split("\n");
    const index = lines.slice(0, line - 1).reduce((sum, l) => sum + l.length + 1, 0);
    if (focus) textarea.focus({ preventScroll: true });
    textarea.setSelectionRange(index, index);
    textarea.scrollTop = Math.max(0, (line - 3) * lh);
    caret();
  };
  return {
    refresh,
    revealLine,
    revealText(text) {
      const index = textarea.value.indexOf(text);
      if (index >= 0) revealLine(textarea.value.slice(0, index).split("\n").length);
    },
    markError(line, text) {
      message.textContent = text ? "⚠ " + text : "";
      message.title = text || "";
      wrapper.classList.add("has-error");
      if (Number.isInteger(line) && line >= 1 && line <= lineCount) {
        errorLine = line;
        errorBand.hidden = false;
        renderGutter();
        revealLine(line, false);
      }
    },
    clearError,
  };
}
