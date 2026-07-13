# CommsLab — Block Studio

Interface didática de blocos para montar e executar sistemas de comunicações no navegador.

## Executar

```bash
cd /data/apostilas/comunicacoes/blocklab
npm start
```

Abra `http://localhost:8780`.

Se a porta estiver ocupada, escolha outra:

```bash
PORT=8781 npm start
```

Arraste blocos, conecte uma saída a uma entrada, edite parâmetros no inspetor e execute. O **Bloco do estudante** recebe `data` e deve retornar um array, permitindo implementar encoders, decoders e transformações próprias em JavaScript. Workflows são preservados no armazenamento local.

A taxa **Fs** na barra superior é a taxa de amostragem padrão do workflow e é salva/exportada junto com o grafo. Fontes temporais usam essa taxa; blocos de processamento propagam os metadados e blocos que combinam streams recusam taxas incompatíveis.

No canvas, arraste o fundo para navegar e use a roda do mouse ou os botões **−/+** para aplicar zoom centrado no cursor. **Enquadrar** ajusta a visualização aos blocos atuais; **Auto ajustar** reorganiza o grafo e também calcula automaticamente o zoom e a centralização necessários para mostrar todo o workflow.

Selecione um bloco e use **Ctrl+C / Ctrl+V** (ou **Cmd+C / Cmd+V** no macOS) para duplicá-lo com todos os parâmetros. A cópia é independente e não replica conexões, facilitando anexar um segundo osciloscópio ou analisador a outro ponto do fluxo.

## Famílias disponíveis

- Fontes digitais, padrões e mensagens senoidais
- Codificação por repetição, Hamming (7,4), SECDED (8,4), CRC e convolucional (7,5)₈ com Viterbi duro
- ASK/OOK, BPSK, QPSK, M-PSK, QAM e M-FSK
- AM, FM e PM
- AWGN e erro de fase
- Detectores digitais, banco de correlatores FSK e demoduladores analógicos
- Osciloscópio, espectro, constelação e BER
- Portas tipadas para bits, amostras reais e IQ complexo
- FIR, ganho, interpolação, decimação e conformação RRC casada
- FFT reutilizável, com visualizador separado e zero-padding/truncamento explícitos
- Multipercurso, CFO, desbalanço I/Q e clipping
- Diagrama de olho e EVM RMS

Use **Exportar JSON** para entregar ou compartilhar um workflow e **Importar JSON** para reabri-lo. O formato contém versão, nome, blocos, parâmetros, posições e conexões.

As cores das portas e conexões indicam o tipo de dado. Conexões incompatíveis são recusadas antes da execução. Clique em uma conexão existente para removê-la.

## Convenções numéricas

- QAM quadrada é normalizada para energia média de símbolo unitária e usa Gray por eixo.
- O canal AWGN pode ser configurado por `Eb/N0` ou SNR por amostra.
- Em `Eb/N0`, entram no cálculo os bits por símbolo, a taxa do código e as amostras por símbolo.
- O espectro usa janela Hann, correção de ganho coerente e ordenação centrada em frequência.
- O RRC trata os pontos singulares analiticamente, usa taps de energia unitária e compensa o atraso conjunto dos filtros TX/RX antes da decisão.
- A FFT usa radix-2 ou Bluestein para tamanhos arbitrários; aceita janela retangular ou Hann e seu tamanho define `Δf=fs/N`, mas zero-padding não cria resolução física além da duração observada.
- Convoluções longas usam FFT automaticamente, enquanto filtros curtos mantêm a soma direta. Taps RRC normalizados são armazenados em cache por `(sps, α, span)`.
- O Viterbi aceita decisões duras ou símbolos BPSK suaves; o modo automático preserva a confiabilidade quando recebe amostras complexas diretamente do canal.
- BER inclui intervalo de confiança de Wilson de 95%.
- EVM pode remover um único ganho/fase complexos antes da medida.
- A Auditoria de amostragem informa margem de Nyquist, amostras por ciclo, resolução da FFT e quando o sinal é apenas uma abstração em taxa de símbolo.
- Oscilador IQ, fonte AWGN, mixer/NCO, somador sincronizado e atraso inteiro seguem a semântica de streams usada em ferramentas como GNU Radio.
- O osciloscópio possui trigger de subida/descida e saída pass-through. Clique com o botão direito em qualquer porta de saída para anexar um osciloscópio automaticamente; a Probe numérica também pode ser inserida inline.
- Osciloscópio, FFT e espectro possuem eixos físicos. Use a roda sobre o gráfico para zoom horizontal, arraste para navegar e dê duplo clique para restaurar toda a faixa.
- O painel de resultados funciona como um dock: arraste sua borda superior para mudar a altura ou use a seta no cabeçalho para ocultá-lo/restaurá-lo. A preferência é preservada localmente e os gráficos são redesenhados na nova resolução.
- O botão **⛶** abre o gráfico em um modal centralizado. Feche pelo botão ×, pela tecla Esc ou clicando no fundo; zoom e pan feitos no modal são preservados no cartão original.

### Domínio de símbolo versus domínio de waveform

BPSK, QPSK, M-PSK e QAM produzem um item complexo por símbolo. Isso é matematicamente adequado para BER em AWGN sem memória e para constelações, mas ainda não é uma forma de onda temporal com conformação de pulso. O espectro desses símbolos crus não deve ser interpretado como largura de banda ocupada. Para estudos de waveform, olho e espectro, use **RRC Transmissor → canal → RRC Receptor**. Com taxa de símbolos `Rs`, a largura unilateral em banda base é `(1+α)Rs/2`.

AM, FM, PM e M-FSK produzem waveforms amostradas com metadados de taxa. A taxa analógica padrão agora é 48 kHz. O exemplo FM padrão possui mais de 18 amostras por ciclo na maior frequência estimada, e a DFT padrão de 1024 pontos oferece resolução aproximada de 46,9 Hz.

O exemplo **QPSK com RRC e FFT** demonstra a cadeia completa, incluindo filtro casado, compensação de atraso, olho, constelação e FFT encadeável.

O catálogo de exemplos também inclui BPSK, 8-PSK, 16/64-QAM, M-FSK, código de repetição, AM, FM, PM, multipercurso, não linearidades RF e auditoria de amostragem. Cada exemplo abre como um workflow editável e já é enquadrado automaticamente no canvas.

Os exemplos de códigos corretores acompanham o capítulo `09_codigos_corretores_erros.md`: correção de um erro por palavra Hamming, detecção de erro duplo SECDED, CRC-4 com rajada controlada e enlace convolucional BPSK/AWGN com Viterbi.

Os exemplos de BER comparam famílias PSK, QAM e BFSK em escala logarítmica. O comparador aceita nomes como `BPSK`, `QPSK`, `8PSK`, `16QAM`, `64QAM`, `BFSK` e `NCBFSK`, com faixa e passo de `Eb/N0` e limites verticais configuráveis.

Execute `npm test` para verificar normalização/inversão QAM, BER BPSK, ortogonalidade FSK, demodulação AM/FM, propriedades Nyquist do RRC e exatidão da FFT.
