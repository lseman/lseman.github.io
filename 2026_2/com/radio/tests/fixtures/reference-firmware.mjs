const CRC = `// CRC-16/CCITT-FALSE: init=0xFFFF, poly=0x1021, sem reflexão.
// O CRC cobre sequência + tamanho + mensagem. Não cobre preâmbulo/sync.
function crc16(bytes) {
  let crc = 0xFFFF;
  for (let index = 0; index < bytes.length; index++) {
    crc ^= bytes[index] << 8;
    for (let bit = 0; bit < 8; bit++) {
      const before = crc;
      const msb = (crc & 0x8000) !== 0;
      crc = (crc << 1) & 0xFFFF;
      if (msb) crc ^= 0x1021; // Experimente trocar este polinômio!
      traceCRC({ byte: index, bit, before, msb, after: crc });
    }
  }
  return crc;
}`;

export const FIRMWARE_A = `// SETUP A · transmissor · JavaScript didático, estilo Arduino
let sequence = 0;

function setup() {
  Serial.println("A: rádio pronto");
}

function loop() {
  const message = "Olá, placa B!";
  const payload = new TextEncoder().encode(message);
  const body = [sequence, payload.length, ...payload];
  const crc = crc16(body); // Implementação manual abaixo
  const frame = [0xAA, 0xAA, 0xD3, 0x91, ...body,
                 (crc >> 8) & 0xFF, crc & 0xFF];

  // Nenhum CRC é acrescentado automaticamente por radio.send().
  radio.send(frame);
  Serial.println("TX seq=" + sequence + " · CRC=0x" + crc.toString(16));
  sequence = (sequence + 1) & 0xFF;
  return { crcCalculated: crc };
}

${CRC}
`;

export const FIRMWARE_B = `// SETUP B · receptor · recebe os bytes mesmo com erros
let acceptedCount = 0;

function setup() {
  Serial.println("B: aguardando pacotes");
}

function loop() {
  const frame = radio.receive();
  if (frame === null) return null; // Sem pacote neste ciclo

  const syncOK = frame[0] === 0xAA && frame[1] === 0xAA &&
                 frame[2] === 0xD3 && frame[3] === 0x91;
  const lengthOK = frame[5] === frame.length - 8;
  const body = frame.slice(4, -2);
  const crcReceived = (frame[frame.length - 2] << 8) |
                       frame[frame.length - 1];
  const crcCalculated = crc16(body); // Recalcular, bit a bit
  const crcOK = crcCalculated === crcReceived;
  const accepted = syncOK && lengthOK && crcOK;

  Serial.println("CRC recebido=0x" + crcReceived.toString(16));
  Serial.println("CRC calculado=0x" + crcCalculated.toString(16));
  let payload = null;
  if (accepted) {
    payload = new TextDecoder().decode(frame.slice(6, -2));
    acceptedCount++;
    Serial.println("ACEITO #" + acceptedCount + ": " + payload);
  } else {
    Serial.println("DESCARTADO: SYNC=" + syncOK +
                   " LEN=" + lengthOK + " CRC=" + crcOK);
  }
  // O firmware B, não o simulador, toma a decisão de entrega.
  return { accepted, syncOK, lengthOK, crcOK,
           crcReceived, crcCalculated, payload };
}

${CRC}
`;
