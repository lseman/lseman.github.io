// Text-mode teaching display: 21 columns × 8 rows, independent per board.
export function createOLED() {
  const blank = () => Array.from({ length: 8 }, () => Array(21).fill(' '));
  let buffer = blank(), visible = blank(), column = 0, row = 0;
  const newline = () => { column = 0; row++; };
  const print = (value) => {
    const text = String(value);
    if (text.length > 1024) throw Error('oled.print(): use até 1024 caracteres por chamada.');
    for (const char of text) {
      if (char === '\n') { newline(); continue; }
      if (char === '\r') continue;
      if (column >= 21) newline();
      if (row < 8) buffer[row][column] = char;
      column++;
    }
  };
  const api = Object.freeze({
    clear: () => { buffer = blank(); column = 0; row = 0; },
    setCursor: (x, y) => {
      if (!Number.isInteger(x) || x < 0 || x > 20 ||
          !Number.isInteger(y) || y < 0 || y > 7)
        throw Error('oled.setCursor(coluna, linha): coluna 0–20, linha 0–7.');
      column = x; row = y;
    },
    print,
    println: (value = '') => { print(value); newline(); },
    display: () => { visible = buffer.map(line => [...line]); },
  });
  return { api, snapshot: () => visible.map(line => line.join('')) };
}
