const CRC = `// Atividade: implemente CRC-16/CCITT-FALSE.
// init=0xFFFF, poly=0x1021, sem reflexão, XOR final=0.
// Entrada: sequência + tamanho + payload; saída: inteiro de 16 bits.
function crc16(bytes) {
  // TODO: inicializar o registrador.
  // TODO: incorporar cada byte e processar seus oito bits.
  // TODO: registrar cada operação com traceCRC({
  //   byte: index, bit, before, msb, after: crc
  // }).
  // TODO: retornar o CRC calculado.
  throw new Error("Implemente crc16 antes de calcular o CRC.");
}`;

export const FIRMWARE_A = `// PLACA A · atividade do transmissor
// JavaScript da bancada virtual. Consulte o Roteiro CRC para o laboratório físico.
let sequence = 0;

function setup() {
  // OLED opcional: oled.clear(), oled.setCursor(coluna, linha),
  // oled.print(texto), oled.println(texto), oled.display().
  // Consulte o Tutorial OLED para escrever sua tela.
  Serial.println("A: complete o transmissor e a função crc16.");
}

function loop() {
  // TODO: converter sua mensagem em bytes UTF-8 (máximo 120).
  // TODO: montar o corpo: sequência, tamanho e payload.
  // TODO: calcular o CRC sobre o corpo com crc16(bytes).
  // TODO: montar o quadro: AA AA D3 91, corpo, CRC alto, CRC baixo.
  // TODO: transmitir com radio.send(frame).
  // TODO: incrementar sequence, retornando a zero após 255.
  // TODO: retornar { crcCalculated } para os instrumentos.
  Serial.println("A: implementação pendente; nenhum quadro enviado.");
  return null;
}

${CRC}
`;

export const FIRMWARE_B = `// PLACA B · atividade do receptor
// A entrega deve depender das verificações implementadas por você.
let acceptedCount = 0;

function setup() {
  // TODO opcional: mostrar o estado inicial no OLED (Tutorial OLED).
  Serial.println("B: complete o receptor e a função crc16.");
}

function loop() {
  const frame = radio.receive();
  if (frame === null) return null;

  // TODO: verificar limites, cabeçalho e comprimento do quadro.
  // TODO: extrair o corpo protegido e os dois bytes do CRC recebido.
  // TODO: recalcular o CRC e comparar com o recebido.
  // TODO: aceitar somente se todas as verificações passarem.
  // TODO: extrair o payload e incrementar acceptedCount apenas ao aceitar.
  // TODO: registrar sua decisão na Serial e retornar:
  // { accepted, syncOK, lengthOK, crcOK,
  //   crcReceived, crcCalculated, payload }.
  Serial.println("B: verificação pendente; quadro não entregue.");
  return { accepted: false };
}

${CRC}
`;
