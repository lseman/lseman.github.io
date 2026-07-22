// blocks.js - Block definitions and processors

import { arr, complex, sampleRateOf, assertSameRate, bitsToInts, intsToBits, binaryToGray, grayToBinary, unwrap, parseTaps, binaryPolynomial, polynomialRemainder, hamming74Word, hammingSyndrome, convTransition, convolveSignal, rrcTaps, computeFFT, gaussianShape, apskPoints, analyticSignal, radix2FFT, qFunction } from './utils.js';

export const COLORS = { Sources: '#60a5fa', Coding: '#a78bfa', 'Digital Modulation': '#f59e0b', 'Analog Modulation': '#f97316', Channel: '#fb7185', 'Signal Processing': '#38bdf8', 'Digital Receiver': '#34d399', 'Analog Receiver': '#2dd4bf', Analysis: '#22d3ee', Custom: '#e879f9' };
export const TYPE_COLORS = { bits: '#a78bfa', real: '#60a5fa', complex: '#f59e0b', any: '#94a3b8' };
export const OUTPUT_TYPES = { bits: 'bits', coded: 'bits', decoded: 'bits', received: 'bits', corrupted: 'bits', samples: 'real', message: 'real', symbols: 'complex', waveform: 'complex', modulated: 'complex', noisy: 'complex', shifted: 'complex', signal: 'complex', filtered: 'complex', resampled: 'complex', impaired: 'complex', fft: 'complex', output: 'any', sum: 'complex', mixed: 'complex', delayed: 'complex' };
export const INPUT_TYPES = { bits: 'bits', reference: 'bits', received: 'bits', ideal: 'complex', measured: 'complex', message: 'real', symbols: 'complex', waveform: 'complex', fft: 'complex', signal: 'complex', input: 'any' };
export const FLEX_INPUTS = new Set(['scope:signal', 'probe:signal', 'spectrum:signal', 'fft:signal', 'sampling_audit:signal', 'signal_stats:signal', 'student_transform:input', 'fir:signal', 'gain:signal', 'delay:signal', 'add:a', 'add:b', 'viterbi_decoder:bits']);
export const FLEX_OUTPUTS = new Set(['scope:signal', 'probe:signal']);

/**
 * @typedef {Object} BlockConfigNumber
 * @property {string} type - 'number'
 * @property {string} label
 * @property {number} value
 * @property {number} [min]
 * @property {number} [max]
 */

/**
 * @typedef {Object} BlockConfigText
 * @property {string} type - 'text'
 * @property {string} label
 * @property {string} value
 */

/**
 * @typedef {Object} BlockConfigSelect
 * @property {string} type - 'select'
 * @property {string} label
 * @property {string} value
 * @property {Array<string|number>} options
 */

/**
 * @typedef {Object} BlockConfigCode
 * @property {string} type - 'code'
 * @property {string} label
 * @property {string} value
 */

/**
 * @typedef {BlockConfigNumber|BlockConfigText|BlockConfigSelect|BlockConfigCode} BlockConfig
 */

/**
 * @typedef {Object} BlockDef
 * @property {string} name
 * @property {string} category
 * @property {Array<string>} [inputs]
 * @property {Array<string>} outputs
 * @property {string} summary
 * @property {Object.<string, BlockConfig>} config
 * @property {string} theory
 * @property {string} equation
 */

export const defs = {
    bit_source: { name: 'Fonte de bits', category: 'Sources', outputs: ['bits'], summary: 'Bits Bernoulli equiprováveis', config: { count: { type: 'number', label: 'Número de bits', value: 512, min: 8, max: 10000 }, seed: { type: 'number', label: 'Semente', value: 42 } }, theory: 'Gera b[k] ∈ {0,1} com P(0)=P(1)=1/2.', equation: 'P(b=0)=P(b=1)=0.5' },
    pattern_source: { name: 'Padrão de bits', category: 'Sources', outputs: ['bits'], summary: 'Sequência definida pelo aluno', config: { pattern: { type: 'text', label: 'Padrão', value: '10110010' }, repeat: { type: 'number', label: 'Repetições', value: 32, min: 1, max: 1000 } }, theory: 'Repete uma palavra binária conhecida, útil para depuração e sincronismo.', equation: 'b = repeat(pattern, N)' },
    repetition_encoder: { name: 'Codificador repetição', category: 'Coding', inputs: ['bits'], outputs: ['coded'], summary: 'Código de repetição (n,1)', config: { n: { type: 'number', label: 'Repetição n', value: 3, min: 1, max: 15 } }, theory: 'Repete cada bit n vezes. A taxa do código é R=1/n.', equation: 'c[nk+i]=b[k],  i=0…n−1' },
    repetition_decoder: { name: 'Decodificador maioria', category: 'Coding', inputs: ['bits'], outputs: ['decoded'], summary: 'Decisão majoritária por palavra', config: { n: { type: 'number', label: 'Tamanho n', value: 3, min: 1, max: 15 } }, theory: 'Agrupa n decisões e escolhe o símbolo majoritário.', equation: 'b̂[k]=1 se Σ ĉ[nk+i] > n/2' },
    hamming_encoder: { name: 'Codificador Hamming', category: 'Coding', inputs: ['bits'], outputs: ['coded'], summary: 'Hamming (7,4) ou SECDED (8,4)', config: { mode: { type: 'select', label: 'Código', value: 'Hamming (7,4)', options: ['Hamming (7,4)', 'SECDED (8,4)'] } }, theory: 'Coloca dados nas posições 3, 5, 6 e 7 e calcula paridades pares nas potências de dois. SECDED acrescenta paridade global.', equation: 'Rc=4/7 ou 4/8' },
    hamming_decoder: { name: 'Decodificador Hamming', category: 'Coding', inputs: ['bits'], outputs: ['decoded'], summary: 'Correção por síndrome e detecção dupla', config: { mode: { type: 'select', label: 'Código', value: 'Hamming (7,4)', options: ['Hamming (7,4)', 'SECDED (8,4)'] } }, theory: 'A síndrome s₄s₂s₁ identifica um erro simples. No SECDED, a paridade global distingue erro simples de erro duplo detectável.', equation: 's=Hrᵀ; posição=s₁+2s₂+4s₄' },
    crc_encoder: { name: 'Anexar CRC', category: 'Coding', inputs: ['bits'], outputs: ['coded'], summary: 'Divisão polinomial em GF(2)', config: { polynomial: { type: 'text', label: 'Polinômio binário', value: '10011' } }, theory: 'Anexa o resto da divisão de xʳM(x) pelo polinômio gerador. O primeiro e o último coeficientes devem ser 1.', equation: 'T(x)=xʳM(x)+R(x)' },
    crc_checker: { name: 'Verificar CRC', category: 'Coding', inputs: ['bits'], outputs: ['decoded'], summary: 'Detecta palavra ou rajada corrompida', config: { polynomial: { type: 'text', label: 'Polinômio binário', value: '10011' }, strip: { type: 'select', label: 'Remover CRC', value: 'sim', options: ['sim', 'não'] } }, theory: 'Resto não nulo detecta erro. CRC normalmente sinaliza retransmissão; não localiza nem corrige o bit.', equation: 'T(x) mod g(x)=0' },
    convolutional_encoder: { name: 'Convolucional (7,5)₈', category: 'Coding', inputs: ['bits'], outputs: ['coded'], summary: 'Taxa 1/2, memória 2', config: { terminate: { type: 'select', label: 'Terminar em zero', value: 'sim', options: ['sim', 'não'] } }, theory: 'Codificador convolucional de taxa 1/2 com v₁=u⊕u₋₁⊕u₋₂ e v₂=u⊕u₋₂. Bits de cauda levam o trellis ao estado zero.', equation: 'G(D)=[1+D+D², 1+D²]' },
    viterbi_decoder: { name: 'Viterbi (7,5)₈', category: 'Coding', inputs: ['bits'], outputs: ['decoded'], summary: 'Decisão dura ou soft-input', config: { decision: { type: 'select', label: 'Métrica de entrada', value: 'automática', options: ['automática', 'dura', 'suave'] }, terminated: { type: 'select', label: 'Trellis terminado', value: 'sim', options: ['sim', 'não'] } }, theory: 'Mantém o sobrevivente de menor métrica em cada estado. A entrada suave aceita símbolos BPSK e preserva sua confiabilidade; a dura usa distância de Hamming.', equation: 'm=min[m′+dH] ou min[m′+Σ(y−ŝ)²]' },
    student_transform: { name: 'Bloco do estudante', category: 'Custom', inputs: ['input'], outputs: ['output'], summary: 'Implemente encoder ou decoder', config: { code: { type: 'code', label: 'Função JavaScript', value: '// data é um array\nreturn data.map(x => x);' } }, theory: 'O aluno implementa uma transformação determinística. O valor retornado deve ser um array.', equation: 'output = f(input)' },
    sine_source: { name: 'Fonte senoidal', category: 'Sources', outputs: ['samples'], summary: 'Mensagem na taxa global do workflow', config: { frequency: { type: 'number', label: 'Frequência (Hz)', value: 100 }, amplitude: { type: 'number', label: 'Amplitude', value: 1 }, duration: { type: 'number', label: 'Duração (s)', value: .1 } }, theory: 'Gera uma mensagem senoidal usando a taxa de amostragem global Fs da barra superior.', equation: 'm[n]=A cos(2πfₘn/Fₛ)' },
    complex_tone: { name: 'Oscilador complexo', category: 'Sources', outputs: ['waveform'], summary: 'Fonte IQ e^{j2πft}', config: { frequency: { type: 'number', label: 'Frequência (Hz)', value: 1000 }, amplitude: { type: 'number', label: 'Amplitude', value: 1 }, duration: { type: 'number', label: 'Duração (s)', value: .1 }, phase: { type: 'number', label: 'Fase inicial (°)', value: 0 } }, theory: 'Oscilador complexo semelhante ao Signal Source do GNU Radio. Frequências negativas são representáveis sem ambiguidade em IQ.', equation: 'x[n]=Ae^{j(2πfn/Fₛ+φ)}' },
    noise_source: { name: 'Fonte de ruído', category: 'Sources', outputs: ['waveform'], summary: 'Ruído gaussiano real ou complexo', config: { power: { type: 'number', label: 'Potência média', value: 1, min: 0 }, duration: { type: 'number', label: 'Duração (s)', value: .1 }, mode: { type: 'select', label: 'Saída', value: 'complexa', options: ['complexa', 'real'] }, seed: { type: 'number', label: 'Semente', value: 123 } }, theory: 'Gera AWGN com potência total configurada. No modo complexo, I e Q recebem metade da potência.', equation: 'E{|x|²}=P' },
    ask: { name: 'Mapeador ASK/OOK', category: 'Digital Modulation', inputs: ['bits'], outputs: ['symbols'], summary: 'Chaveamento de amplitude', config: { zero: { type: 'number', label: 'Amplitude bit 0', value: 0 }, one: { type: 'number', label: 'Amplitude bit 1', value: 1 } }, theory: 'Representa bits por dois níveis de amplitude. OOK é o caso A₀=0.', equation: 's[k]=A₀ ou A₁' },
    bpsk: { name: 'Mapeador BPSK', category: 'Digital Modulation', inputs: ['bits'], outputs: ['symbols'], summary: '0 → +1, 1 → −1', config: {}, theory: 'Mapeamento antipodal com energia média unitária.', equation: 's[k]=1−2b[k]' },
    qpsk: { name: 'Mapeador QPSK Gray', category: 'Digital Modulation', inputs: ['bits'], outputs: ['symbols'], summary: '2 bits por símbolo', config: {}, theory: 'Mapeamento Gray normalizado para Es=1.', equation: 's=(I+jQ)/√2' },
    mpsk: { name: 'Mapeador M-PSK Gray', category: 'Digital Modulation', inputs: ['bits'], outputs: ['symbols'], summary: 'PSK Gray de ordem configurável', config: { M: { type: 'select', label: 'Ordem M', value: 8, options: [2, 4, 8, 16] } }, theory: 'Agrupa log₂M bits e seleciona fases equiespaçadas com rotulagem Gray circular, reduzindo erros de bits entre vizinhos.', equation: 'sₘ=e^{j2πm/M}, rótulo=Gray(m)' },
    qam: { name: 'Mapeador QAM', category: 'Digital Modulation', inputs: ['bits'], outputs: ['symbols'], summary: 'QAM quadrada normalizada', config: { M: { type: 'select', label: 'Ordem M', value: 16, options: [4, 16, 64, 256] } }, theory: 'Mapeia grupos de log₂M bits em uma grade quadrada e normaliza Es=1.', equation: 's=(I+jQ)/√E{|I+jQ|²}' },
    fsk: { name: 'Modulador M-FSK', category: 'Digital Modulation', inputs: ['bits'], outputs: ['waveform'], summary: 'Tons ortogonais por símbolo', config: { M: { type: 'select', label: 'Ordem M', value: 2, options: [2, 4, 8] }, sps: { type: 'number', label: 'Amostras/símbolo', value: 16, min: 4, max: 128 } }, theory: 'Cada símbolo seleciona um tom complexo ortogonal ao longo de Ts.', equation: 'sₘ[n]=e^{j2πmn/N}' },
    am: { name: 'Modulador AM', category: 'Analog Modulation', inputs: ['message'], outputs: ['modulated'], summary: 'AM convencional DSB-LC', config: { carrier: { type: 'number', label: 'Portadora fc (Hz)', value: 2000 }, mu: { type: 'number', label: 'Índice μ', value: .7, min: 0, max: 2 } }, theory: 'Modulação AM com portadora. Para evitar sobremodulação com mensagem normalizada, use μ≤1.', equation: 's(t)=[1+μm(t)]cos(2πfct)' },
    fm: { name: 'Modulador FM', category: 'Analog Modulation', inputs: ['message'], outputs: ['modulated'], summary: 'Frequência instantânea variável', config: { carrier: { type: 'number', label: 'Portadora fc (Hz)', value: 2000 }, deviation: { type: 'number', label: 'Desvio Δf (Hz)', value: 500 } }, theory: 'A fase é a integral da mensagem; a frequência instantânea varia linearmente com m(t).', equation: 's(t)=cos[2πfct+2πk_f∫m(τ)dτ]' },
    pm: { name: 'Modulador PM', category: 'Analog Modulation', inputs: ['message'], outputs: ['modulated'], summary: 'Fase proporcional à mensagem', config: { carrier: { type: 'number', label: 'Portadora fc (Hz)', value: 2000 }, kp: { type: 'number', label: 'Sensibilidade kp (rad)', value: 1 } }, theory: 'A fase instantânea varia diretamente com a mensagem.', equation: 's(t)=cos[2πfct+k_pm(t)]' },
    awgn: { name: 'Canal AWGN', category: 'Channel', inputs: ['signal'], outputs: ['noisy'], summary: 'Ruído branco gaussiano', config: { mode: { type: 'select', label: 'Referência', value: 'Eb/N0', options: ['Eb/N0', 'SNR/amostra'] }, snr: { type: 'number', label: 'Valor (dB)', value: 7, min: -20, max: 60 }, seed: { type: 'number', label: 'Semente', value: 7 } }, theory: 'Mede a potência do sinal e calcula a variância do ruído. Eb/N0 considera amostras por símbolo, bits por símbolo e taxa do código; SNR/amostra compara potência média de sinal e ruído.', equation: 'σ²_dimensão=P·Ns/(2kRγb) ou P/(2γs)' },
    phase_offset: { name: 'Erro de fase', category: 'Channel', inputs: ['signal'], outputs: ['shifted'], summary: 'Rotação de portadora', config: { degrees: { type: 'number', label: 'Fase (graus)', value: 18, min: -180, max: 180 } }, theory: 'Modela erro de fase constante da portadora.', equation: 'r=s·e^{jφ}' },
    bit_flip: { name: 'Injetor de erros binários', category: 'Channel', inputs: ['bits'], outputs: ['corrupted'], summary: 'Inverte posições controladas', config: { positions: { type: 'text', label: 'Posições por bloco', value: '5' }, block: { type: 'number', label: 'Tamanho do bloco (0=global)', value: 7, min: 0, max: 10000 } }, theory: 'Inverte posições indexadas a partir de 1. Com bloco maior que zero, repete o padrão em cada palavra para experimentos controlados.', equation: 'r=c⊕e' },
    frequency_offset: { name: 'Offset de frequência', category: 'Channel', inputs: ['signal'], outputs: ['impaired'], summary: 'CFO normalizado', config: { cycles: { type: 'number', label: 'Ciclos/amostra', value: .01, min: -.5, max: .5 } }, theory: 'Aplica uma rotação de fase que cresce linearmente no tempo.', equation: 'r[n]=s[n]e^{j2πΔfn}' },
    multipath: { name: 'Canal multipercurso', category: 'Channel', inputs: ['signal'], outputs: ['impaired'], summary: 'Canal FIR com ecos', config: { taps: { type: 'text', label: 'Taps reais', value: '1, 0.45, -0.2' } }, theory: 'Convolui o sinal com uma resposta impulsiva finita, introduzindo dispersão e ISI.', equation: 'r[n]=Σh[k]s[n−k]' },
    iq_imbalance: { name: 'Desbalanço I/Q', category: 'Channel', inputs: ['signal'], outputs: ['impaired'], summary: 'Ganho e quadratura imperfeitos', config: { gain: { type: 'number', label: 'Erro de ganho (%)', value: 8 }, phase: { type: 'number', label: 'Erro de quadratura (°)', value: 5 } }, theory: 'Modela diferenças de ganho e erro angular entre os caminhos I e Q.', equation: 'Q′=(1+g)Q, quadratura=90°+φ' },
    clipper: { name: 'Limitador / clipping', category: 'Channel', inputs: ['signal'], outputs: ['impaired'], summary: 'Não linearidade de amplitude', config: { level: { type: 'number', label: 'Nível máximo', value: 1, min: .05, max: 10 } }, theory: 'Limita o módulo e modela saturação de amplificador.', equation: 'y=x·min(1,Amax/|x|)' },
    rayleigh_fading: { name: 'Desvanecimento Rayleigh', category: 'Channel', inputs: ['signal'], outputs: ['impaired'], summary: 'Canal plano sem LOS', config: { seed: { type: 'number', label: 'Semente', value: 11 }, doppler_hz: { type: 'number', label: 'Doppler (Hz)', value: 100, min: 0, max: 10000 } }, theory: 'Gera um canal plano com envelope Rayleigh e componentes I/Q gaussianos correlacionados pelo modelo AR(1) com rho=J0(2πfdTs).', equation: 'h[n]=(g1[n]+jg2[n])/√2, E{|h|²}=1' },
    rician_fading: { name: 'Desvanecimento Rician', category: 'Channel', inputs: ['signal'], outputs: ['impaired'], summary: 'Canal plano com componente LOS', config: { seed: { type: 'number', label: 'Semente', value: 12 }, K_dB: { type: 'number', label: 'Fator K (dB)', value: 3, min: -10, max: 40 }, doppler_hz: { type: 'number', label: 'Doppler (Hz)', value: 100, min: 0, max: 10000 } }, theory: 'Canal com componente de linha de visada (LOS) e multipercurso. O fator K é a razão de potências LOS/NLOS.', equation: 'h=h_LOS+h_NLOS, K=P_LOS/P_NLOS' },
    phase_noise: { name: 'Ruído de fase', category: 'Channel', inputs: ['signal'], outputs: ['impaired'], summary: 'Rotação estocástica de portadora', config: { variance: { type: 'number', label: 'Variância de fase (rad²)', value: 0.01, min: 0, max: 1 } }, theory: 'Aplica uma rotação de fase estocástica modelando ruído de oscilador.', equation: 'r[n]=s[n]e^{jφ[n]}, φ[n]~N(0,σ²)' },
    gain: { name: 'Ganho', category: 'Signal Processing', inputs: ['signal'], outputs: ['signal'], summary: 'Escala real ou complexa', config: { gain: { type: 'number', label: 'Ganho linear', value: 1 } }, theory: 'Multiplica todas as amostras por um ganho escalar.', equation: 'y[n]=Gx[n]' },
    mixer: { name: 'Misturador / NCO', category: 'Signal Processing', inputs: ['signal'], outputs: ['mixed'], summary: 'Translação de frequência em Hz', config: { frequency: { type: 'number', label: 'Frequência do NCO (Hz)', value: 1000 }, phase: { type: 'number', label: 'Fase (°)', value: 0 } }, theory: 'Multiplica o sinal por um oscilador complexo e desloca seu espectro. Usa Fs transportada pelo sinal.', equation: 'y[n]=x[n]e^{j(2πf₀n/Fₛ+φ)}' },
    add: { name: 'Somador', category: 'Signal Processing', inputs: ['a', 'b'], outputs: ['sum'], summary: 'Soma dois streams sincronizados', config: {}, theory: 'Soma amostra a amostra e exige taxas iguais. A saída usa o menor comprimento.', equation: 'y[n]=a[n]+b[n]' },
    delay: { name: 'Atraso', category: 'Signal Processing', inputs: ['signal'], outputs: ['delayed'], summary: 'Atraso inteiro sem truncar o stream', config: { samples: { type: 'number', label: 'Atraso (amostras)', value: 8, min: 0, max: 100000 } }, theory: 'Preenche o início com zeros e preserva todas as amostras de entrada.', equation: 'y[n]=x[n−D]' },
    fir: { name: 'Filtro FIR', category: 'Signal Processing', inputs: ['signal'], outputs: ['filtered'], summary: 'Convolução por coeficientes', config: { taps: { type: 'text', label: 'Coeficientes', value: '0.25, 0.5, 0.25' } }, theory: 'Filtro linear de fase ou geral definido pelos coeficientes do aluno.', equation: 'y[n]=Σh[k]x[n−k]' },
    upsample: { name: 'Interpolador', category: 'Signal Processing', inputs: ['signal'], outputs: ['resampled'], summary: 'Insere zeros entre amostras', config: { factor: { type: 'number', label: 'Fator L', value: 4, min: 1, max: 32 } }, theory: 'Aumenta a taxa de amostragem por inserção de L−1 zeros; normalmente deve ser seguido de filtro interpolador.', equation: 'y[nL]=x[n]' },
    decimate: { name: 'Decimador', category: 'Signal Processing', inputs: ['signal'], outputs: ['resampled'], summary: 'Reduz taxa de amostragem', config: { factor: { type: 'number', label: 'Fator M', value: 2, min: 1, max: 32 }, phase: { type: 'number', label: 'Fase', value: 0, min: 0, max: 31 } }, theory: 'Mantém uma amostra a cada M. Um filtro anti-alias deve preceder a decimação.', equation: 'y[n]=x[nM+p]' },
    rrc_tx: { name: 'RRC Transmissor', category: 'Signal Processing', inputs: ['symbols'], outputs: ['waveform'], summary: 'Interpolação e conformação RRC', config: { sps: { type: 'number', label: 'Amostras/símbolo', value: 8, min: 2, max: 32 }, alpha: { type: 'number', label: 'Roll-off α', value: .35, min: 0, max: 1 }, span: { type: 'number', label: 'Span (símbolos)', value: 8, min: 2, max: 20 } }, theory: 'Insere zeros e filtra com raiz de cosseno levantado normalizada em energia. Dois filtros RRC casados produzem resposta RC.', equation: 'B=(1+α)Rs/2 em banda base' },
    rrc_rx: { name: 'RRC Receptor', category: 'Signal Processing', inputs: ['waveform'], outputs: ['symbols'], summary: 'Filtro casado e amostragem', config: { sps: { type: 'number', label: 'Amostras/símbolo', value: 8, min: 2, max: 32 }, alpha: { type: 'number', label: 'Roll-off α', value: .35, min: 0, max: 1 }, span: { type: 'number', label: 'Span (símbolos)', value: 8, min: 2, max: 20 } }, theory: 'Aplica o RRC casado, compensa os atrasos de grupo TX+RX e amostra no instante de máxima abertura do olho.', equation: 'hRC=hRRC*hRRC; y[k]=y[n₀+kNs]' },
    fft: { name: 'FFT', category: 'Signal Processing', inputs: ['signal'], outputs: ['fft'], summary: 'Transformada discreta reutilizável', config: { size: { type: 'select', label: 'Tamanho N', value: 1024, options: [64, 128, 256, 512, 1024, 2048] }, window: { type: 'select', label: 'Janela', value: 'Hann', options: ['Retangular', 'Hann'] }, shift: { type: 'select', label: 'Centralizar', value: 'sim', options: ['sim', 'não'] } }, theory: 'Calcula a DFT de N pontos, com truncamento ou zero-padding, correção de ganho coerente e eixo de frequência em metadados.', equation: 'X[k]=Σx[n]w[n]e^{-j2πkn/N}' },
    hard_ask: { name: 'Detector ASK', category: 'Digital Receiver', inputs: ['symbols'], outputs: ['bits'], summary: 'Decisão por limiar', config: { threshold: { type: 'number', label: 'Limiar', value: .5 } }, theory: 'Com amplitudes 0 e 1 equiprováveis em AWGN, o limiar ML é 0,5.', equation: 'b̂=[Re{r}>λ]' },
    hard_bpsk: { name: 'Detector BPSK', category: 'Digital Receiver', inputs: ['symbols'], outputs: ['bits'], summary: 'Limiar em Re{r}=0', config: {}, theory: 'Decisão ML para BPSK equiprovável em AWGN.', equation: 'b̂=1 se Re{r}<0' },
    hard_qpsk: { name: 'Detector QPSK', category: 'Digital Receiver', inputs: ['symbols'], outputs: ['bits'], summary: 'Decisão por quadrante', config: {}, theory: 'Decisões independentes nos eixos I e Q para o mapeamento Gray usado.', equation: 'b̂I=[I<0], b̂Q=[Q<0]' },
    hard_mpsk: { name: 'Detector M-PSK Gray', category: 'Digital Receiver', inputs: ['symbols'], outputs: ['bits'], summary: 'Fase mais próxima e rótulo Gray', config: { M: { type: 'select', label: 'Ordem M', value: 8, options: [2, 4, 8, 16] } }, theory: 'Seleciona a fase ideal mais próxima e converte seu índice para o rótulo Gray correspondente.', equation: 'm̂=round[M·arg(r)/(2π)], b̂=Gray(m̂)' },
    hard_qam: { name: 'Detector QAM', category: 'Digital Receiver', inputs: ['symbols'], outputs: ['bits'], summary: 'Ponto da grade mais próximo', config: { M: { type: 'select', label: 'Ordem M', value: 16, options: [4, 16, 64, 256] } }, theory: 'Quantiza independentemente I e Q para o nível permitido mais próximo.', equation: 'ŝ=arg min |r−sₘ|²' },
    fsk_detector: { name: 'Detector M-FSK', category: 'Digital Receiver', inputs: ['waveform'], outputs: ['bits'], summary: 'Banco de correlatores', config: {}, theory: 'Calcula a correlação com cada tom e escolhe a maior magnitude.', equation: 'm̂=arg maxₘ |Σr[n]e^{-j2πmn/N}|' },
    ofdm_tx: { name: 'Transmissor multicarrier', category: 'Digital Modulation', inputs: ['bits'], outputs: ['waveform'], summary: 'OFDM, DMT ou SC-FDMA', config: { mode: { type: 'select', label: 'Forma multicarrier', value: 'OFDM', options: ['OFDM', 'DMT', 'SC-FDMA'] }, carriers: { type: 'select', label: 'Subportadoras N', value: 64, options: [16, 32, 64, 128] }, cp: { type: 'number', label: 'Prefixo cíclico', value: 16, min: 0, max: 64 } }, theory: 'OFDM usa subportadoras QPSK ortogonais; DMT impõe simetria hermitiana para saída real; SC-FDMA acrescenta espalhamento por DFT para menor PAPR.', equation: 'x[n]=IFFT{X[k]}, xCP=[x[N−L…N−1],x]' },
    ofdm_rx: { name: 'Receptor multicarrier', category: 'Digital Receiver', inputs: ['waveform'], outputs: ['bits'], summary: 'OFDM, DMT ou SC-FDMA', config: { mode: { type: 'select', label: 'Forma multicarrier', value: 'OFDM', options: ['OFDM', 'DMT', 'SC-FDMA'] }, carriers: { type: 'select', label: 'Subportadoras N', value: 64, options: [16, 32, 64, 128] }, cp: { type: 'number', label: 'Prefixo cíclico', value: 16, min: 0, max: 64 } }, theory: 'Remove o prefixo, aplica FFT e, em SC-FDMA, desfaz o espalhamento por DFT antes da decisão QPSK.', equation: 'X̂[k]=FFT{x[n]}' },
    msk: { name: 'Modulador MSK / GMSK', category: 'Digital Modulation', inputs: ['bits'], outputs: ['waveform'], summary: 'CPFSK de fase contínua e envelope constante', config: { mode: { type: 'select', label: 'Forma de pulso', value: 'MSK', options: ['MSK', 'GMSK'] }, sps: { type: 'number', label: 'Amostras/bit', value: 16, min: 4, max: 64 }, bt: { type: 'number', label: 'Produto BT (GMSK)', value: .3, min: .15, max: 1 } }, theory: 'MSK é CPFSK com índice h=1/2. GMSK filtra os dados NRZ com pulso gaussiano antes da integração de fase, reduzindo lóbulos laterais.', equation: 's[n]=e^{jφ[n]}, Δφ=πa[n]/(2Ns)' },
    msk_detector: { name: 'Detector MSK / GMSK', category: 'Digital Receiver', inputs: ['waveform'], outputs: ['bits'], summary: 'Decisão pela variação de fase', config: {}, theory: 'Acumula a diferença de fase ao longo de cada intervalo de bit e decide pelo sinal da rotação.', equation: 'b̂[k]=[ΣΔφ[n]≥0]' },
    pulse_mod: { name: 'Modulação por pulsos', category: 'Digital Modulation', inputs: ['bits'], outputs: ['waveform'], summary: 'PAM, PPM ou PWM binária', config: { mode: { type: 'select', label: 'Modulação', value: 'PAM', options: ['PAM', 'PPM', 'PWM'] }, sps: { type: 'number', label: 'Amostras/bit', value: 16, min: 8, max: 128 } }, theory: 'Representa informação na amplitude (PAM), posição (PPM) ou largura (PWM) de pulsos dentro de cada intervalo.', equation: 'PAM: A(b); PPM: τ(b); PWM: Tpulso(b)' },
    pulse_detector: { name: 'Detector de pulsos', category: 'Digital Receiver', inputs: ['waveform'], outputs: ['bits'], summary: 'Decisão PAM, PPM ou PWM', config: {}, theory: 'Usa média de amplitude para PAM, energia por metade para PPM e duração acima do limiar para PWM.', equation: 'b̂=arg max métrica do pulso' },
    dpsk: { name: 'Modulador DPSK', category: 'Digital Modulation', inputs: ['bits'], outputs: ['symbols'], summary: 'DBPSK, DQPSK ou π/4-DQPSK', config: { mode: { type: 'select', label: 'Esquema diferencial', value: 'DBPSK', options: ['DBPSK', 'DQPSK', 'π/4-DQPSK'] } }, theory: 'Codifica a informação na diferença de fase entre símbolos consecutivos, dispensando referência absoluta de fase.', equation: 's[k]=s[k−1]e^{jΔφ(b[k])}' },
    dpsk_detector: { name: 'Detector DPSK', category: 'Digital Receiver', inputs: ['symbols'], outputs: ['bits'], summary: 'Decisão diferencial de fase', config: { mode: { type: 'select', label: 'Esquema diferencial', value: 'DBPSK', options: ['DBPSK', 'DQPSK', 'π/4-DQPSK'] } }, theory: 'Multiplica o símbolo atual pelo conjugado do anterior e decide o incremento de fase mais próximo.', equation: 'Δφ̂=arg{r[k]r*[k−1]}' },
    oqpsk: { name: 'Modulador OQPSK', category: 'Digital Modulation', inputs: ['bits'], outputs: ['waveform'], summary: 'Q atrasado em meio símbolo', config: { sps: { type: 'number', label: 'Amostras/símbolo', value: 16, min: 4, max: 64 } }, theory: 'Atrasa o ramo Q em Ts/2, impedindo transições simultâneas de I e Q e reduzindo saltos de fase de 180°.', equation: 's(t)=I(t)+jQ(t−Ts/2)' },
    oqpsk_detector: { name: 'Detector OQPSK', category: 'Digital Receiver', inputs: ['waveform'], outputs: ['bits'], summary: 'Realinha I/Q e decide sinais', config: {}, theory: 'Amostra I e o ramo Q atrasado nas respectivas metades do símbolo.', equation: 'b̂I=[I<0], b̂Q=[Qdel<0]' },
    apsk: { name: 'Mapeador APSK', category: 'Digital Modulation', inputs: ['bits'], outputs: ['symbols'], summary: '16-APSK ou 32-APSK em anéis', config: { M: { type: 'select', label: 'Ordem M', value: 16, options: [16, 32] } }, theory: 'Distribui símbolos em anéis concêntricos, combinando modulação de amplitude e fase como em enlaces via satélite.', equation: 'sₘ=Rᵣe^{jθₘ}' },
    apsk_detector: { name: 'Detector APSK', category: 'Digital Receiver', inputs: ['symbols'], outputs: ['bits'], summary: 'Ponto APSK mais próximo', config: { M: { type: 'select', label: 'Ordem M', value: 16, options: [16, 32] } }, theory: 'Seleciona o ponto ideal de menor distância euclidiana entre todos os anéis.', equation: 'm̂=arg minₘ|r−sₘ|²' },
    cpfsk: { name: 'Modulador CPFSK / GFSK', category: 'Digital Modulation', inputs: ['bits'], outputs: ['waveform'], summary: 'FSK binária de fase contínua', config: { mode: { type: 'select', label: 'Forma de pulso', value: 'CPFSK', options: ['CPFSK', 'GFSK'] }, h: { type: 'number', label: 'Índice de modulação h', value: .7, min: .1, max: 2 }, sps: { type: 'number', label: 'Amostras/bit', value: 16, min: 4, max: 64 }, bt: { type: 'number', label: 'Produto BT (GFSK)', value: .5, min: .15, max: 1 } }, theory: 'Mantém fase contínua entre símbolos. GFSK suaviza os dados com filtro gaussiano para reduzir ocupação espectral.', equation: 'Δφ=πh·a[k]/Ns' },
    cpfsk_detector: { name: 'Detector CPFSK / GFSK', category: 'Digital Receiver', inputs: ['waveform'], outputs: ['bits'], summary: 'Decisão pela rotação de fase', config: {}, theory: 'Integra a rotação de fase em cada bit e decide o sinal da frequência instantânea.', equation: 'b̂=[ΣΔφ≥0]' },
    spread_tx: { name: 'Espalhamento DSSS / FHSS', category: 'Digital Modulation', inputs: ['bits'], outputs: ['waveform'], summary: 'Sequência direta ou saltos de frequência', config: { mode: { type: 'select', label: 'Técnica', value: 'DSSS', options: ['DSSS', 'FHSS'] }, code: { type: 'text', label: 'Código / padrão de saltos', value: '1101001' }, sps: { type: 'number', label: 'Amostras por chip', value: 8, min: 2, max: 32 } }, theory: 'DSSS multiplica cada bit por uma sequência de chips. FHSS alterna a frequência portadora conforme um padrão conhecido.', equation: 'DSSS: c[n]b[k]; FHSS: f=fhop[n]+fb' },
    spread_rx: { name: 'Receptor DSSS / FHSS', category: 'Digital Receiver', inputs: ['waveform'], outputs: ['bits'], summary: 'Desespalhamento coerente', config: {}, theory: 'Correlaciona com o mesmo código ou padrão de saltos para recuperar os bits.', equation: 'b̂=sign(Σr[n]c[n])' },
    analog_sideband: { name: 'Modulador de bandas laterais', category: 'Analog Modulation', inputs: ['message'], outputs: ['modulated'], summary: 'DSB-SC, USB, LSB ou VSB', config: { mode: { type: 'select', label: 'Modo', value: 'DSB-SC', options: ['DSB-SC', 'USB', 'LSB', 'VSB'] }, carrier: { type: 'number', label: 'Portadora fc (Hz)', value: 2000 } }, theory: 'Remove a portadora de AM e permite transmitir duas bandas laterais, apenas uma banda, ou uma banda com vestígio da outra.', equation: 'sUSB=m cosωct−m̂ sinωct' },
    coherent_am_detector: { name: 'Detector AM coerente', category: 'Analog Receiver', inputs: ['signal'], outputs: ['message'], summary: 'Demodula DSB-SC, SSB e VSB', config: { carrier: { type: 'number', label: 'Portadora fc (Hz)', value: 2000 } }, theory: 'Translada o sinal para banda base usando uma referência coerente de portadora.', equation: 'm̂(t)=LPF{2s(t)e^{-jωct}}' },
    envelope: { name: 'Detector de envelope', category: 'Analog Receiver', inputs: ['signal'], outputs: ['message'], summary: 'Demodulação AM não coerente', config: { removeDC: { type: 'select', label: 'Remover DC', value: 'sim', options: ['sim', 'não'] } }, theory: 'Obtém a magnitude do sinal analítico simplificado. Adequado para AM sem sobremodulação.', equation: 'm̂(t)∝|s_a(t)|' },
    phase_demod: { name: 'Demodulador de fase', category: 'Analog Receiver', inputs: ['signal'], outputs: ['message'], summary: 'Fase instantânea desembrulhada', config: { carrier: { type: 'number', label: 'Portadora fc (Hz)', value: 2000 }, mode: { type: 'select', label: 'Modo', value: 'PM', options: ['PM', 'FM'] } }, theory: 'Remove a fase da portadora; em PM retorna fase e em FM deriva a fase desembrulhada.', equation: 'φ̂=unwrap(arg s_a)−2πfct' },
    scope: { name: 'Osciloscópio', category: 'Analysis', inputs: ['signal'], outputs: ['signal'], summary: 'Sink ou probe inline no domínio do tempo', config: { samples: { type: 'number', label: 'Amostras exibidas', value: 400, min: 10, max: 5000 }, interpolation: { type: 'select', label: 'Traçado', value: 'suave', options: ['suave', 'linear', 'pontos'] }, trigger: { type: 'select', label: 'Trigger', value: 'livre', options: ['livre', 'subida', 'descida'] }, level: { type: 'number', label: 'Nível do trigger', value: 0 } }, theory: 'Mostra I/Q contra tempo real. O traçado suave interpola apenas a visualização; linear e pontos preservam explicitamente as amostras. A saída pass-through permite inserção inline.', equation: 't=n/Fₛ' },
    probe: { name: 'Probe numérica', category: 'Analysis', inputs: ['signal'], outputs: ['signal'], summary: 'Inspeção inline com metadados', config: { label: { type: 'text', label: 'Rótulo', value: 'Probe' } }, theory: 'Mede comprimento, taxa, duração, potência RMS e pico, preservando o stream na saída.', equation: 'xout=xin' },
    spectrum: { name: 'Analisador de espectro', category: 'Analysis', inputs: ['signal'], outputs: [], summary: 'DFT, janela e resolução', config: { bins: { type: 'number', label: 'Bins', value: 1024, min: 32, max: 2048 } }, theory: 'Calcula uma DFT com janela Hann. A resolução é Δf=fs/N; frequências separadas por menos que Δf não são resolvidas.', equation: 'Δf=fₛ/N' },
    fft_plot: { name: 'Visualizador FFT', category: 'Analysis', inputs: ['fft'], outputs: [], summary: 'Magnitude de uma FFT calculada', config: { scale: { type: 'select', label: 'Escala', value: 'dB', options: ['dB', 'linear'] } }, theory: 'Exibe a magnitude do vetor FFT sem recalcular a transformada.', equation: '|X[k]| ou 20log₁₀|X[k]|' },
    constellation: { name: 'Constelação', category: 'Analysis', inputs: ['symbols'], outputs: [], summary: 'Plano I/Q', config: { points: { type: 'number', label: 'Pontos', value: 500, min: 20, max: 5000 } }, theory: 'Exibe as amostras complexas no espaço de sinais.', equation: 'I=Re{s}, Q=Im{s}' },
    eye: { name: 'Diagrama de olho', category: 'Analysis', inputs: ['signal'], outputs: [], summary: 'Sobreposição por símbolo', config: { sps: { type: 'number', label: 'Amostras/símbolo', value: 8, min: 2, max: 128 }, traces: { type: 'number', label: 'Traços', value: 60, min: 5, max: 500 } }, theory: 'Sobrepõe segmentos de dois símbolos para revelar ISI e margem de temporização.', equation: 'x[n mod 2Ns]' },
    evm: { name: 'Medidor de EVM', category: 'Analysis', inputs: ['ideal', 'measured'], outputs: [], summary: 'Erro vetorial RMS', config: { equalize: { type: 'select', label: 'Corrigir ganho/fase', value: 'sim', options: ['sim', 'não'] } }, theory: 'Compara símbolos de referência e medidos. A correção opcional remove um único ganho complexo, mas não corrige ISI.', equation: 'EVMrms=√(Σ|r−s|²/Σ|s|²)' },
    signal_stats: { name: 'Estatísticas do sinal', category: 'Analysis', inputs: ['signal'], outputs: [], summary: 'Potência, pico e PAPR', config: {}, theory: 'Mede potência média, amplitude de pico e razão pico/média.', equation: 'PAPR=max|x|²/E{|x|²}' },
    sampling_audit: { name: 'Auditoria de amostragem', category: 'Analysis', inputs: ['signal'], outputs: [], summary: 'Nyquist, resolução e sps', config: { recommended: { type: 'number', label: 'Amostras/ciclo desejadas', value: 10, min: 2, max: 50 } }, theory: 'Distingue ausência de alias de boa resolução numérica. Nyquist exige >2 amostras/ciclo; visualização e demodulação normalmente precisam de margem maior.', equation: 'N/ciclo=fₛ/fmax, Δf=fₛ/N' },
    ber: { name: 'Medidor de BER', category: 'Analysis', inputs: ['reference', 'received'], outputs: [], summary: 'Taxa de erro de bit', config: {}, theory: 'Compara sequências alinhadas e informa erros, total e BER.', equation: 'BER=N_erros/N_bits' },
    ber_curve_mpsk: { name: 'Comparador de curvas BER', category: 'Analysis', inputs: [], outputs: [], summary: 'PSK, QAM e FSK versus Eb/N0', config: { schemes: { type: 'text', label: 'Modulações', value: 'BPSK, QPSK, 8PSK, 16QAM, 64QAM' }, start: { type: 'number', label: 'Eb/N0 inicial (dB)', value: -2, min: -20, max: 40 }, stop: { type: 'number', label: 'Eb/N0 final (dB)', value: 20, min: -20, max: 60 }, step: { type: 'number', label: 'Passo (dB)', value: 1, min: .25, max: 10 }, minBer: { type: 'number', label: 'BER mínima do eixo', value: 1e-8, min: 1e-15, max: .1 }, maxBer: { type: 'number', label: 'BER máxima do eixo', value: 1, min: 1e-6, max: 1 } }, theory: 'Compara expressões teóricas coerentes com Gray para PSK e QAM quadrada, além de BFSK coerente ou não coerente. As aproximações de vizinhos mais próximos são mais precisas na região de BER baixa.', equation: 'PSK/QAM: aproximação Gray; BFSK: Q(√Eb/N0)' },
    quantizer: { name: 'Quantizador uniforme', category: 'Signal Processing', inputs: ['message'], outputs: ['samples'], summary: 'PCM mid-rise de n bits', config: { bits: { type: 'number', label: 'Bits por amostra', value: 4, min: 1, max: 12 }, range: { type: 'number', label: 'Faixa ±Xmax', value: 1, min: 0.001 } }, theory: 'Arredonda cada amostra real para um de 2ⁿ níveis uniformes (mid-rise) e satura fora da faixa. Para senoide de fundo de escala, SQNR ≈ 6,02n + 1,76 dB.', equation: 'Δ=2Xmax/2ⁿ; q=Δ(⌊x/Δ⌋+½)' },
    compander: { name: 'Compander µ-law', category: 'Signal Processing', inputs: ['message'], outputs: ['samples'], summary: 'Compressão/expansão logarítmica', config: { mode: { type: 'select', label: 'Modo', value: 'compressor', options: ['compressor', 'expansor'] }, mu: { type: 'number', label: 'Parâmetro µ', value: 255, min: 1, max: 10000 } }, theory: 'O compressor amplia sinais fracos antes do quantizador; o expansor aplica a curva inversa no receptor. O par equaliza o SQNR ao longo da faixa dinâmica (padrão µ-law, µ=255).', equation: 'y=sgn(x)·ln(1+µ|x|)/ln(1+µ)' },
    line_code: { name: 'Codificador de linha', category: 'Digital Modulation', inputs: ['bits'], outputs: ['waveform'], summary: 'NRZ, RZ, Manchester ou AMI', config: { code: { type: 'select', label: 'Código', value: 'Manchester', options: ['NRZ polar', 'NRZ unipolar', 'RZ polar', 'Manchester', 'AMI'] }, sps: { type: 'number', label: 'Amostras/bit', value: 16, min: 4, max: 64 } }, theory: 'Formata bits em pulsos de banda base. Manchester (1 → +A,−A) garante uma transição por bit para sincronismo; AMI alterna a polaridade das marcas e anula o nível DC.', equation: 'Manchester: b=1 → +A,−A; b=0 → −A,+A' },
    line_decoder: { name: 'Decodificador de linha', category: 'Digital Receiver', inputs: ['waveform'], outputs: ['bits'], summary: 'Decisão coerente com o código', config: {}, theory: 'Usa os metadados do codificador (código e amostras/bit) para integrar cada intervalo de bit e decidir de forma casada com o pulso.', equation: 'b̂ = decisão por correlação' },
    delta_mod: { name: 'Modulador delta', category: 'Digital Modulation', inputs: ['message'], outputs: ['bits'], summary: '1 bit por amostra (DM)', config: { delta: { type: 'number', label: 'Passo Δ', value: 0.1, min: 0.0005 } }, theory: 'Transmite apenas o sinal do erro entre a mensagem e a aproximação em escada. Δ pequeno demais causa sobrecarga de inclinação; Δ grande demais, ruído granular.', equation: 'b=sgn[m(n)−m̂(n)]; m̂←m̂±Δ' },
    delta_demod: { name: 'Demodulador delta', category: 'Digital Receiver', inputs: ['bits'], outputs: ['message'], summary: 'Acumulador + média móvel', config: { delta: { type: 'number', label: 'Passo Δ', value: 0.1, min: 0.0005 }, smooth: { type: 'number', label: 'Média móvel (amostras)', value: 8, min: 1, max: 64 } }, theory: 'Integra os bits ±Δ reconstruindo a escada e aplica média móvel como filtro passa-baixas simples.', equation: 'm̂(n)=m̂(n−1)±Δ' },
    lms_equalizer: { name: 'Equalizador LMS', category: 'Digital Receiver', inputs: ['waveform', 'ideal'], outputs: ['filtered'], summary: 'FIR adaptativo com treino', config: { taps: { type: 'number', label: 'Coeficientes', value: 7, min: 1, max: 31 }, mu: { type: 'number', label: 'Passo µ', value: 0.05, min: 0.0001, max: 1 }, train: { type: 'number', label: 'Símbolos de treino', value: 400, min: 10 } }, theory: 'Minimiza E|e|² ajustando um FIR complexo pelo gradiente estocástico durante o treino com símbolos conhecidos; depois os coeficientes ficam congelados. Compare a constelação antes e depois em um canal com ISI.', equation: 'e=d−wᵀx; w←w+µ·e·x*' },
};

// Processors object
export function createProcessors(results) {
    const processors = {};

    // Sources
    processors.bit_source = (n) => {
        const count = n.config.count || 512;
        const seed = n.config.seed || 42;
        const r = (function(s) { return function() { return ((s = (Math.imul(1664525, s) + 1013904223) | 0) >>> 0) / 4294967296 } })(seed);
        const bits = Array.from({ length: count }, () => Math.floor(r() * 2));
        return { bits };
    };
    processors.pattern_source = (n) => {
        const pattern = n.config.pattern || '10110010';
        const repeat = n.config.repeat || 32;
        const bits = pattern.split('').map(c => +c);
        const out = [];
        for (let k = 0; k < repeat; k++) out.push(...bits);
        return { bits: out };
    };
    processors.sine_source = (n) => {
        const fs = sampleRateOf(null);
        const f = n.config.frequency || 100;
        const A = n.config.amplitude || 1;
        const dur = n.config.duration || 0.1;
        const N = Math.round(fs * dur);
        return { samples: { kind: 'samples', fs, sampleRate: fs, data: Array.from({ length: N }, (_, k) => ({ re: A * Math.cos(2 * Math.PI * f * k / fs), im: 0 })) } };
    };
    processors.complex_tone = (n) => {
        const fs = sampleRateOf(null);
        const f = n.config.frequency || 1000;
        const A = n.config.amplitude || 1;
        const dur = n.config.duration || 0.1;
        const phi = (n.config.phase || 0) * Math.PI / 180;
        const N = Math.round(fs * dur);
        return { waveform: { kind: 'waveform', fs, sampleRate: fs, data: Array.from({ length: N }, (_, k) => ({ re: A * Math.cos(2 * Math.PI * f * k / fs + phi), im: A * Math.sin(2 * Math.PI * f * k / fs + phi) })) } };
    };
    processors.noise_source = (n) => {
        const fs = sampleRateOf(null);
        const P = n.config.power || 1;
        const dur = n.config.duration || 0.1;
        const mode = n.config.mode || 'complexa';
        const seed = n.config.seed || 123;
        const r = (function(s) { let state = s; return function() { return ((state = (Math.imul(1664525, state) + 1013904223) | 0) >>> 0) / 4294967296 } })(seed);
        const gaussian = () => { const u = Math.max(1e-12, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
        const N = Math.round(fs * dur);
        const variance = mode === 'complexa' ? P / 2 : P;
        const std = Math.sqrt(variance);
        const data = Array.from({ length: N }, () => ({ re: gaussian() * std, im: mode === 'complexa' ? gaussian() * std : 0 }));
        return { waveform: { kind: 'waveform', fs, sampleRate: fs, data } };
    };

    // Coding
    processors.repetition_encoder = (n, { bits }) => {
        const nRep = n.config.n || 3;
        const out = [];
        for (let i = 0; i < bits.length; i++) for (let j = 0; j < nRep; j++) out.push(bits[i]);
        return { coded: out };
    };
    processors.repetition_decoder = (n, { bits }) => {
        const nRep = n.config.n || 3;
        const out = [];
        for (let i = 0; i + nRep <= bits.length; i += nRep) {
            let sum = 0; for (let j = 0; j < nRep; j++) sum += bits[i + j];
            out.push(sum >= nRep / 2 ? 1 : 0);
        }
        return { decoded: out };
    };
    processors.hamming_encoder = (n, { bits }) => {
        const secded = n.config.mode === 'SECDED (8,4)', source = arr(bits), out = [];
        for (let i = 0; i + 4 <= source.length; i += 4) { const word = hamming74Word(source.slice(i, i + 4)); if (secded) word.push(word.reduce((a, b) => a ^ b, 0)); out.push(...word) }
        return { coded: out };
    };
    processors.hamming_decoder = (n, { bits }) => {
        const secded = n.config.mode === 'SECDED (8,4)', size = secded ? 8 : 7, source = arr(bits), out = []; let corrected = 0, doubleErrors = 0, blocks = 0;
        for (let k = 0; k + size <= source.length; k += size) { const word = source.slice(k, k + size), syndrome = hammingSyndrome(word), overall = secded ? word.reduce((x, y) => x ^ y, 0) : 0; blocks++; if (secded) { if (syndrome && overall) { word[syndrome - 1] ^= 1; corrected++ } else if (!syndrome && overall) { word[7] ^= 1; corrected++ } else if (syndrome && !overall) doubleErrors++ } else if (syndrome) { word[syndrome - 1] ^= 1; corrected++ } out.push(word[2], word[4], word[5], word[6]) }
        results.push({ type: 'metric', title: secded ? 'Síndrome SECDED' : 'Síndrome Hamming', value: corrected, detail: `${corrected} correção(ões) · ${doubleErrors} erro(s) duplo(s) · ${blocks} blocos` });
        return { decoded: out };
    };
    processors.crc_encoder = (n, { bits }) => {
        const poly = binaryPolynomial(n.config.polynomial || '10011');
        const work = [...bits, ...Array(poly.length - 1).fill(0)];
        const rem = polynomialRemainder(work, poly);
        return { coded: [...bits, ...rem] };
    };
    processors.crc_checker = (n, { bits }) => {
        const poly = binaryPolynomial(n.config.polynomial || '10011');
        const work = [...bits];
        const rem = polynomialRemainder(work, poly);
        const valid = rem.every(r => r === 0);
        const strip = n.config.strip === 'sim';
        results.push({ type: 'metric', title: 'Verificação CRC', value: valid ? 0 : 1, detail: `${valid ? 'palavra válida' : 'ERRO DETECTADO'} · resto ${rem.join('')}` });
        return { decoded: strip ? bits.slice(0, bits.length - (poly.length - 1)) : bits };
    };
    processors.convolutional_encoder = (n, { bits }) => {
        const terminate = n.config.terminate === 'sim';
        let state = 0, out = [];
        for (const b of bits) {
            const { next, out: outs } = convTransition(state, b);
            out.push(...outs);
            state = next;
        }
        if (terminate) {
            for (let k = 0; k < 2; k++) {
                const { next, out: outs } = convTransition(state, 0);
                out.push(...outs);
                state = next;
            }
        }
        return { coded: out };
    };
    processors.viterbi_decoder = (n, { bits }) => {
        const received = arr(bits), requested = n.config.decision || 'automática';
        const soft = requested === 'suave' || (requested === 'automática' && received.some(v => typeof v === 'object'));
        const steps = Math.floor(received.length / 2), infinity = Number.POSITIVE_INFINITY;
        let metrics = [0, infinity, infinity, infinity], paths = [[], [], [], []];
        for (let k = 0; k < steps; k++) {
            const pair = received.slice(2 * k, 2 * k + 2), nextMetrics = [infinity, infinity, infinity, infinity], nextPaths = [[], [], [], []];
            for (let state = 0; state < 4; state++) if (Number.isFinite(metrics[state])) for (const bit of [0, 1]) {
                const transition = convTransition(state, bit); let branch;
                if (soft) { const y0 = complex(pair[0]).re, y1 = complex(pair[1]).re; branch = (y0 - (1 - 2 * transition.out[0])) ** 2 + (y1 - (1 - 2 * transition.out[1])) ** 2 }
                else branch = (pair[0] !== transition.out[0]) + (pair[1] !== transition.out[1]);
                const metric = metrics[state] + branch;
                if (metric < nextMetrics[transition.next]) { nextMetrics[transition.next] = metric; nextPaths[transition.next] = paths[state].concat(bit) }
            }
            metrics = nextMetrics; paths = nextPaths;
        }
        const terminated = n.config.terminated === 'sim', finalState = terminated ? 0 : metrics.indexOf(Math.min(...metrics)), tail = terminated ? 2 : 0;
        results.push({ type: 'metric', title: `Métrica de Viterbi ${soft ? 'suave' : 'dura'}`, value: metrics[finalState], detail: `${steps} passos · estado final ${finalState}` });
        return { decoded: paths[finalState].slice(0, Math.max(0, steps - tail)) };
    };
    processors.student_transform = (n, { input }) => {
        try { const fn = new Function('data', n.config.code || 'return data;'); return { output: fn(input) }; } catch { return { output: input }; }
    };

    // Digital Modulation
    processors.ask = (n, { bits }) => {
        const z = n.config.zero || 0, o = n.config.one || 1;
        return { symbols: bits.map(b => ({ re: b ? o : z, im: 0 })) };
    };
    processors.bpsk = (n, { bits }) => { return { symbols: bits.map(b => ({ re: b ? -1 : 1, im: 0 })) }; };
    processors.qpsk = (n, { bits }) => {
        const symbols = [];
        for (let i = 0; i + 2 <= bits.length; i += 2) {
            const I = bits[i] === 0 ? 1 : -1, Q = bits[i + 1] === 0 ? 1 : -1;
            symbols.push({ re: I / Math.SQRT2, im: Q / Math.SQRT2 });
        }
        return { symbols };
    };
    processors.mpsk = (n, { bits }) => {
        const M = n.config.M || 8, k = Math.log2(M);
        const symbols = [];
        for (let i = 0; i + k <= bits.length; i += k) {
            let val = 0; for (let j = 0; j < k; j++) val = (val << 1) | bits[i + j];
            const gray = val ^ (val >> 1);
            const angle = 2 * Math.PI * gray / M - Math.PI;
            symbols.push({ re: Math.cos(angle), im: Math.sin(angle) });
        }
        return { symbols };
    };
    processors.qam = (n, { bits }) => {
        const M = n.config.M || 16, k = Math.log2(M), root = Math.sqrt(M);
        const symbols = [];
        for (let i = 0; i + k <= bits.length; i += k) {
            let val = 0; for (let j = 0; j < k; j++) val = (val << 1) | bits[i + j];
            const I_val = (val >> (k / 2)) & (root - 1), Q_val = val & (root - 1);
            const I = I_val % 2 === 0 ? (root - 1 - 2 * I_val) : (2 * I_val - (root - 1));
            const Q = Q_val % 2 === 0 ? (root - 1 - 2 * Q_val) : (2 * Q_val - (root - 1));
            const norm = Math.sqrt(2 / (root * root - 1));
            symbols.push({ re: I * norm, im: Q * norm });
        }
        return { symbols };
    };
    processors.fsk = (n, { bits }) => {
        const M = n.config.M || 2, sps = n.config.sps || 16, fs = sampleRateOf(null);
        const symbols = bits.map(b => b ? 1 : 0);
        const data = [];
        for (let k = 0; k < symbols.length; k++) {
            const m = symbols[k];
            for (let s = 0; s < sps; s++) {
                const t = k * sps + s;
                data.push({ re: Math.cos(2 * Math.PI * m * t / sps), im: Math.sin(2 * Math.PI * m * t / sps) });
            }
        }
        return { waveform: { kind: 'waveform', fs, sampleRate: fs, data } };
    };
    processors.am = (n, { message }) => {
        const fc = n.config.carrier || 2000, mu = n.config.mu || 0.7;
        const fs = sampleRateOf(message);
        const data = message.data.map(s => ({ re: (1 + mu * s.re) * Math.cos(2 * Math.PI * fc * message.data.indexOf(s) / fs), im: 0 }));
        return { modulated: { kind: 'waveform', fs, sampleRate: fs, data } };
    };
    processors.fm = (n, { message }) => {
        const fc = n.config.carrier || 2000, dev = n.config.deviation || 500;
        const fs = sampleRateOf(message);
        const data = [{ re: 0, im: 0 }];
        let phase = 0;
        for (let k = 0; k < message.data.length; k++) {
            phase += 2 * Math.PI * dev * message.data[k].re / fs;
            data.push({ re: Math.cos(2 * Math.PI * fc * k / fs + phase), im: Math.sin(2 * Math.PI * fc * k / fs + phase) });
        }
        return { modulated: { kind: 'waveform', fs, sampleRate: fs, data: data.slice(1) } };
    };
    processors.pm = (n, { message }) => {
        const fc = n.config.carrier || 2000, kp = n.config.kp || 1;
        const fs = sampleRateOf(message);
        const data = message.data.map(s => ({ re: Math.cos(2 * Math.PI * fc * message.data.indexOf(s) / fs + kp * s.re), im: Math.sin(2 * Math.PI * fc * message.data.indexOf(s) / fs + kp * s.re) }));
        return { modulated: { kind: 'waveform', fs, sampleRate: fs, data } };
    };
    processors.rrc_tx = (n, { symbols }) => {
        const sps = n.config.sps || 8, alpha = n.config.alpha || 0.35, span = n.config.span || 8;
        const taps = rrcTaps(sps, alpha, span);
        const data = [];
        for (const sym of symbols) {
            for (let k = 0; k < sps; k++) data.push({ re: 0, im: 0 });
        }
        for (let k = 0; k < symbols.length; k++) {
            const sym = symbols[k];
            for (let t = 0; t < taps.length; t++) {
                const sampleIdx = k * sps + t;
                if (sampleIdx < data.length) {
                    data[sampleIdx].re += sym.re * taps[t];
                    data[sampleIdx].im += sym.im * taps[t];
                }
            }
        }
        return { waveform: { kind: 'waveform', fs: sampleRateOf(null), sampleRate: sampleRateOf(null), data } };
    };
    processors.rrc_rx = (n, { waveform }) => {
        const sps = n.config.sps || 8, alpha = n.config.alpha || 0.35, span = n.config.span || 8;
        const taps = rrcTaps(sps, alpha, span);
        const data = arr(waveform).map(complex);
        const symbols = [];
        const totalTaps = taps.length;
        const delay = Math.floor(totalTaps / 2);
        for (let k = 0; k < data.length - totalTaps; k += sps) {
            let I = 0, Q = 0;
            for (let t = 0; t < totalTaps; t++) {
                const idx = k + t;
                if (idx < data.length) { I += data[idx].re * taps[t]; Q += data[idx].im * taps[t]; }
            }
            symbols.push({ re: I, im: Q });
        }
        return { symbols };
    };
    processors.fft = (n, { signal }) => { return computeFFT(signal, n.config.size || 1024, n.config.window || 'Hann', n.config.shift === 'sim'); };

    // Channel
    processors.awgn = (n, { signal }) => {
        const mode = n.config.mode || 'Eb/N0';
        const snrDb = n.config.snr || 7;
        const seed = n.config.seed || 7;
        const r = (function(s) { let state = s; return function() { return ((state = (Math.imul(1664525, state) + 1013904223) | 0) >>> 0) / 4294967296 } })(seed);
        const gaussian = () => { const u = Math.max(1e-12, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
        const data = arr(signal).map(complex);
        let power = 0;
        for (const s of data) power += s.re * s.re + s.im * s.im;
        power /= Math.max(1, data.length);
        const snr = Math.pow(10, snrDb / 10);
        const noiseVar = power / snr;
        const noiseStd = Math.sqrt(noiseVar);
        const noisy = data.map(s => ({ re: s.re + gaussian() * noiseStd, im: s.im + gaussian() * noiseStd }));
        return { noisy: { ...signal, data: noisy } };
    };
    processors.phase_offset = (n, { signal }) => {
        const deg = n.config.degrees || 0;
        const rad = deg * Math.PI / 180;
        const cos = Math.cos(rad), sin = Math.sin(rad);
        const data = arr(signal).map(complex);
        return { shifted: { ...signal, data: data.map(s => ({ re: s.re * cos - s.im * sin, im: s.re * sin + s.im * cos })) } };
    };
    processors.bit_flip = (n, { bits }) => {
        const positions = String(n.config.positions || '5').split(',').map(Number).filter(Number.isFinite);
        const block = n.config.block || 0;
        const corrupted = [...bits];
        for (const pos of positions) {
            const idx = pos - 1;
            if (block > 0) {
                for (let b = 0; b < Math.floor(bits.length / block); b++) {
                    const globalIdx = b * block + idx;
                    if (globalIdx < bits.length) corrupted[globalIdx] ^= 1;
                }
            } else {
                if (idx < bits.length) corrupted[idx] ^= 1;
            }
        }
        return { corrupted };
    };
    processors.frequency_offset = (n, { signal }) => {
        const cycles = n.config.cycles || 0.01;
        const fs = sampleRateOf(signal);
        const data = arr(signal).map(complex);
        return { impaired: { ...signal, data: data.map((s, k) => { const phase = 2 * Math.PI * cycles * k; return { re: s.re * Math.cos(phase) - s.im * Math.sin(phase), im: s.re * Math.sin(phase) + s.im * Math.cos(phase) }; }) } };
    };
    processors.multipath = (n, { signal }) => {
        const taps = parseTaps(n.config.taps || '1, 0.45, -0.2');
        return { impaired: convolveSignal(signal, taps) };
    };
    processors.iq_imbalance = (n, { signal }) => {
        const gainErr = n.config.gain || 0;
        const phaseErr = n.config.phase || 0;
        const g = 1 + gainErr / 100;
        const phi = phaseErr * Math.PI / 180;
        const cos = Math.cos(phi), sin = Math.sin(phi);
        const data = arr(signal).map(complex);
        return { impaired: { ...signal, data: data.map(s => ({ re: s.re, im: g * (s.im * cos - s.re * sin) })) } };
    };
    processors.clipper = (n, { signal }) => {
        const level = n.config.level || 1;
        const data = arr(signal).map(complex);
        return { impaired: { ...signal, data: data.map(s => { const mag = Math.sqrt(s.re * s.re + s.im * s.im); const scale = Math.min(1, level / Math.max(1e-12, mag)); return { re: s.re * scale, im: s.im * scale }; }) } };
    };
    processors.rayleigh_fading = (n, { signal }) => {
        const seed = n.config.seed || 11;
        const doppler = n.config.doppler_hz || 100;
        const fs = sampleRateOf(signal);
        const r = (function(s) { let state = s; return function() { return ((state = (Math.imul(1664525, state) + 1013904223) | 0) >>> 0) / 4294967296 } })(seed);
        const gaussian = () => { const u = Math.max(1e-12, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
        const rho = doppler > 0 ? Math.max(0, Math.min(1, Math.cos(2 * Math.PI * doppler / fs))) : 0;
        let g1 = 0, g2 = 0;
        const data = arr(signal).map(complex);
        return { impaired: { ...signal, data: data.map(s => { g1 = rho * g1 + Math.sqrt(1 - rho * rho) * gaussian(); g2 = rho * g2 + Math.sqrt(1 - rho * rho) * gaussian(); const h_re = g1 / Math.SQRT2, h_im = g2 / Math.SQRT2; return { re: s.re * h_re - s.im * h_im, im: s.re * h_im + s.im * h_re }; }) } };
    };
    processors.rician_fading = (n, { signal }) => {
        const seed = n.config.seed || 12;
        const KdB = n.config.K_dB || 3;
        const doppler = n.config.doppler_hz || 100;
        const fs = sampleRateOf(signal);
        const r = (function(s) { let state = s; return function() { return ((state = (Math.imul(1664525, state) + 1013904223) | 0) >>> 0) / 4294967296 } })(seed);
        const gaussian = () => { const u = Math.max(1e-12, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
        const K = Math.pow(10, KdB / 10);
        const sigma = Math.sqrt(1 / (K + 1));
        const LOS_re = Math.sqrt(K / (K + 1)), LOS_im = 0;
        const rho = doppler > 0 ? Math.max(0, Math.min(1, Math.cos(2 * Math.PI * doppler / fs))) : 0;
        let g1 = 0, g2 = 0;
        const data = arr(signal).map(complex);
        return { impaired: { ...signal, data: data.map(s => { g1 = rho * g1 + Math.sqrt(1 - rho * rho) * gaussian(); g2 = rho * g2 + Math.sqrt(1 - rho * rho) * gaussian(); const hNLOS_re = g1 * sigma, hNLOS_im = g2 * sigma; const h_re = LOS_re + hNLOS_re, h_im = LOS_im + hNLOS_im; return { re: s.re * h_re - s.im * h_im, im: s.re * h_im + s.im * h_re }; }) } };
    };
    processors.phase_noise = (n, { signal }) => {
        const varPhase = n.config.variance || 0.01;
        const std = Math.sqrt(varPhase);
        const r = (function(s) { let state = s; return function() { return ((state = (Math.imul(1664525, state) + 1013904223) | 0) >>> 0) / 4294967296 } })(42);
        const gaussian = () => { const u = Math.max(1e-12, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
        const data = arr(signal).map(complex);
        return { impaired: { ...signal, data: data.map(s => { const phi = gaussian() * std; const cos = Math.cos(phi), sin = Math.sin(phi); return { re: s.re * cos - s.im * sin, im: s.re * sin + s.im * cos }; }) } };
    };

    // Signal Processing
    processors.gain = (n, { signal }) => {
        const gain = n.config.gain || 1;
        const data = arr(signal).map(complex);
        return { signal: { ...signal, data: data.map(s => ({ re: s.re * gain, im: s.im * gain })) } };
    };
    processors.mixer = (n, { signal }) => {
        const freq = n.config.frequency || 1000;
        const phaseDeg = n.config.phase || 0;
        const phaseRad = phaseDeg * Math.PI / 180;
        const fs = sampleRateOf(signal);
        const data = arr(signal).map(complex);
        return { mixed: { ...signal, data: data.map((s, k) => { const cos = Math.cos(2 * Math.PI * freq * k / fs + phaseRad), sin = Math.sin(2 * Math.PI * freq * k / fs + phaseRad); return { re: s.re * cos - s.im * sin, im: s.re * sin + s.im * cos }; }) } };
    };
    processors.add = (n, { a, b }) => {
        const dataA = arr(a).map(complex), dataB = arr(b).map(complex);
        const len = Math.min(dataA.length, dataB.length);
        return { sum: { ...a, data: Array.from({ length: len }, (_, k) => ({ re: dataA[k].re + dataB[k].re, im: dataA[k].im + dataB[k].im })) } };
    };
    processors.delay = (n, { signal }) => {
        const samples = n.config.samples || 0;
        const data = arr(signal).map(complex);
        const delayed = Array(samples).fill({ re: 0, im: 0 }).concat(data);
        return { delayed: { ...signal, data: delayed } };
    };
    processors.fir = (n, { signal }) => {
        const taps = parseTaps(n.config.taps || '0.25, 0.5, 0.25');
        return { filtered: convolveSignal(signal, taps) };
    };
    processors.upsample = (n, { signal }) => {
        const factor = n.config.factor || 4;
        const data = arr(signal).map(complex);
        const resampled = [];
        for (const s of data) { resampled.push(s); for (let k = 1; k < factor; k++) resampled.push({ re: 0, im: 0 }); }
        return { resampled: { ...signal, data: resampled } };
    };
    processors.decimate = (n, { signal }) => {
        const factor = n.config.factor || 2;
        const phase = n.config.phase || 0;
        const data = arr(signal).map(complex);
        const resampled = [];
        for (let k = phase; k < data.length; k += factor) resampled.push(data[k]);
        return { resampled: { ...signal, data: resampled } };
    };

    // Digital Receiver
    processors.hard_ask = (n, { symbols }) => {
        const thresh = n.config.threshold || 0.5;
        return { bits: arr(symbols).map(complex).map(s => (s.re >= thresh ? 1 : 0)) };
    };
    processors.hard_bpsk = (n, { symbols }) => { return { bits: arr(symbols).map(complex).map(s => (s.re < 0 ? 1 : 0)) }; };
    processors.hard_qpsk = (n, { symbols }) => {
        const bits = [];
        for (const s of arr(symbols).map(complex)) { bits.push(s.re < 0 ? 1 : 0); bits.push(s.im < 0 ? 1 : 0); }
        return { bits };
    };
    processors.hard_mpsk = (n, { symbols }) => {
        const M = n.config.M || 8, k = Math.log2(M);
        const bits = [];
        for (const s of arr(symbols).map(complex)) {
            let angle = Math.atan2(s.im, s.re);
            if (angle < 0) angle += 2 * Math.PI;
            let m = Math.round(angle * M / (2 * Math.PI)) % M;
            let gray = m ^ (m >> 1);
            for (let j = k - 1; j >= 0; j--) { bits.push((gray >> j) & 1); }
        }
        return { bits };
    };
    processors.hard_qam = (n, { symbols }) => {
        const M = n.config.M || 16, k = Math.log2(M), root = Math.sqrt(M);
        const bits = [];
        const levels = Array.from({ length: root }, (_, i) => 2 * i - (root - 1));
        for (const s of arr(symbols).map(complex)) {
            let I = levels.reduce((prev, curr) => Math.abs(curr - s.re) < Math.abs(prev - s.re) ? curr : prev);
            let Q = levels.reduce((prev, curr) => Math.abs(curr - s.im) < Math.abs(prev - s.im) ? curr : prev);
            const I_idx = (root - 1 - I) / 2, Q_idx = (root - 1 - Q) / 2;
            for (let j = k / 2 - 1; j >= 0; j--) bits.push((I_idx >> j) & 1);
            for (let j = k / 2 - 1; j >= 0; j--) bits.push((Q_idx >> j) & 1);
        }
        return { bits };
    };
    processors.fsk_detector = (n, { waveform }) => {
        const M = 2, sps = 16;
        const data = arr(waveform).map(complex);
        const bits = [];
        for (let symbol = 0; symbol < Math.floor(data.length / sps); symbol++) {
            let corr0 = 0, corr1 = 0;
            for (let s = 0; s < sps; s++) {
                const idx = symbol * sps + s;
                if (idx >= data.length) break;
                const cos0 = Math.cos(0), sin0 = Math.sin(0);
                const cos1 = Math.cos(2 * Math.PI * s / sps), sin1 = Math.sin(2 * Math.PI * s / sps);
                corr0 += data[idx].re * cos0 + data[idx].im * sin0;
                corr1 += data[idx].re * cos1 + data[idx].im * sin1;
            }
            bits.push(corr1 > corr0 ? 1 : 0);
        }
        return { bits };
    };
    processors.ofdm_tx = (n, { bits }) => {
        const mode = n.config.mode || 'OFDM', N = +n.config.carriers, cp = Math.max(0, Math.min(N, Math.round(n.config.cp))), source = arr(bits), q = 1 / Math.sqrt(2), carriers = mode === 'DMT' ? N / 2 - 1 : N, perBlock = 2 * carriers, blocks = Math.ceil(source.length / perBlock), data = [];
        for (let block = 0; block < blocks; block++) {
            const re = Array(N).fill(0), im = Array(N).fill(0), symbols = [];
            for (let k = 0; k < carriers; k++) { const p = block * perBlock + 2 * k; symbols.push({ re: (1 - 2 * (source[p] ?? 0)) * q, im: (1 - 2 * (source[p + 1] ?? 0)) * q }) }
            if (mode === 'DMT') for (let k = 0; k < carriers; k++) { re[k + 1] = symbols[k].re; im[k + 1] = symbols[k].im; re[N - k - 1] = symbols[k].re; im[N - k - 1] = -symbols[k].im }
            else { symbols.forEach((x, k) => { re[k] = x.re; im[k] = x.im }); if (mode === 'SC-FDMA') radix2FFT(re, im) }
            radix2FFT(re, im, true); const scale = Math.sqrt(N), symbol = Array.from({ length: N }, (_, k) => ({ re: re[k] * scale, im: im[k] * scale })); data.push(...symbol.slice(N - cp), ...symbol);
        }
        const fs = sampleRateOf(null); return { waveform: { kind: 'waveform', data, fs, sampleRate: fs, ofdmMode: mode, ofdmN: N, ofdmCP: cp, sourceBitCount: source.length } };
    };
    processors.ofdm_rx = (n, { waveform }) => {
        const signal = waveform, mode = signal.ofdmMode || n.config.mode || 'OFDM', N = +n.config.carriers, cp = Math.max(0, Math.min(N, Math.round(n.config.cp))), data = arr(signal).map(complex), size = N + cp, bits = [];
        for (let p = 0; p + size <= data.length; p += size) { let re = data.slice(p + cp, p + size).map(x => x.re), im = data.slice(p + cp, p + size).map(x => x.im); radix2FFT(re, im); if (mode === 'DMT') { re = re.slice(1, N / 2); im = im.slice(1, N / 2) } else if (mode === 'SC-FDMA') radix2FFT(re, im, true); for (let k = 0; k < re.length; k++) bits.push(re[k] < 0 ? 1 : 0, im[k] < 0 ? 1 : 0) }
        return { bits: bits.slice(0, signal.sourceBitCount ?? bits.length) };
    };
    processors.msk = (n, { bits }) => {
        const mode = n.config.mode || 'MSK', sps = n.config.sps || 16, bt = n.config.bt || 0.3;
        const data = [];
        let phase = 0;
        for (const b of bits) {
            const delta = b ? Math.PI / sps : -Math.PI / sps;
            for (let s = 0; s < sps; s++) {
                phase += delta;
                data.push({ re: Math.cos(phase), im: Math.sin(phase) });
            }
        }
        return { waveform: { kind: 'waveform', fs: sampleRateOf(null), sampleRate: sampleRateOf(null), data } };
    };
    processors.msk_detector = (n, { waveform }) => {
        const data = arr(waveform).map(complex);
        const bits = [];
        let phaseAcc = 0;
        for (let k = 1; k < data.length; k++) {
            const delta = Math.atan2(data[k].im * data[k - 1].re - data[k].re * data[k - 1].im, data[k].re * data[k - 1].re + data[k].im * data[k - 1].im);
            phaseAcc += delta;
            if (k % 16 === 0) { bits.push(phaseAcc >= 0 ? 1 : 0); phaseAcc = 0; }
        }
        return { bits };
    };
    processors.pulse_mod = (n, { bits }) => {
        const mode = n.config.mode || 'PAM', sps = n.config.sps || 16;
        const data = [];
        for (const b of bits) {
            const amp = mode === 'PAM' ? (b ? 1 : -1) : (mode === 'PPM' ? 1 : 0);
            for (let s = 0; s < sps; s++) data.push({ re: amp, im: 0 });
        }
        return { waveform: { kind: 'waveform', fs: sampleRateOf(null), sampleRate: sampleRateOf(null), data } };
    };
    processors.pulse_detector = (n, { waveform }) => {
        const data = arr(waveform).map(complex);
        const bits = [];
        const sps = 16;
        for (let k = 0; k < data.length; k += sps) {
            let sum = 0;
            for (let s = 0; s < sps && k + s < data.length; s++) sum += data[k + s].re;
            bits.push(sum >= 0 ? 1 : 0);
        }
        return { bits };
    };
    processors.dpsk = (n, { bits }) => {
        const mode = n.config.mode || 'DBPSK';
        const symbols = [];
        let prev = 1;
        for (const b of bits) {
            const curr = b ? -prev : prev;
            symbols.push({ re: curr, im: 0 });
            prev = curr;
        }
        return { symbols };
    };
    processors.dpsk_detector = (n, { symbols }) => {
        const mode = n.config.mode || 'DBPSK';
        const bits = [];
        let prev = 1;
        for (const s of symbols) {
            const curr = s.re >= 0 ? 1 : -1;
            bits.push(curr === prev ? 0 : 1);
            prev = curr;
        }
        return { bits };
    };
    processors.oqpsk = (n, { bits }) => {
        const sps = n.config.sps || 16;
        const symbols = [];
        for (let i = 0; i + 2 <= bits.length; i += 2) {
            const I = bits[i] === 0 ? 1 : -1;
            const Q_delayed = i + 1 < bits.length ? (bits[i + 1] === 0 ? 1 : -1) : 0;
            symbols.push({ re: I, im: Q_delayed });
        }
        // Expand to waveform
        const data = [];
        for (const sym of symbols) {
            for (let s = 0; s < sps; s++) data.push({ re: sym.re, im: sym.im });
        }
        return { waveform: { kind: 'waveform', fs: sampleRateOf(null), sampleRate: sampleRateOf(null), data } };
    };
    processors.oqpsk_detector = (n, { waveform }) => {
        const data = arr(waveform).map(complex);
        const bits = [];
        const sps = 16;
        for (let k = 0; k < data.length; k += sps) {
            bits.push(data[k].re >= 0 ? 0 : 1);
            if (k + sps / 2 < data.length) bits.push(data[k + sps / 2].im >= 0 ? 0 : 1);
        }
        return { bits };
    };
    processors.apsk = (n, { bits }) => { const M = +n.config.M, k = Math.log2(M), source = arr(bits), points = apskPoints(M); return { symbols: { kind: 'symbols', data: bitsToInts(source, k).map(label => points[label]), M, bitsPerSymbol: k, sourceBitCount: source.length } } };
    processors.apsk_detector = (n, { symbols }) => {
        const M = symbols.M || n.config.M || 16, points = apskPoints(M);
        const bits = [];
        for (const s of arr(symbols).map(complex)) {
            let best = 0, minDist = Infinity;
            for (let i = 0; i < points.length; i++) {
                const d = (s.re - points[i].re) ** 2 + (s.im - points[i].im) ** 2;
                if (d < minDist) { minDist = d; best = i; }
            }
            const k = Math.log2(M);
            for (let j = k - 1; j >= 0; j--) bits.push((best >> j) & 1);
        }
        return { bits: bits.slice(0, symbols.sourceBitCount ?? bits.length) };
    };
    processors.cpfsk = (n, { bits }) => {
        const mode = n.config.mode || 'CPFSK', h = n.config.h || 0.7, sps = n.config.sps || 16, bt = n.config.bt || 0.5;
        const data = [];
        let phase = 0;
        for (const b of bits) {
            const delta = b ? Math.PI * h / sps : -Math.PI * h / sps;
            for (let s = 0; s < sps; s++) {
                phase += delta;
                data.push({ re: Math.cos(phase), im: Math.sin(phase) });
            }
        }
        return { waveform: { kind: 'waveform', fs: sampleRateOf(null), sampleRate: sampleRateOf(null), data } };
    };
    processors.cpfsk_detector = (n, { waveform }) => {
        const data = arr(waveform).map(complex);
        const bits = [];
        let phaseAcc = 0;
        const sps = 16;
        for (let k = 1; k < data.length; k++) {
            const delta = Math.atan2(data[k].im * data[k - 1].re - data[k].re * data[k - 1].im, data[k].re * data[k - 1].re + data[k].im * data[k - 1].im);
            phaseAcc += delta;
            if (k % sps === 0) { bits.push(phaseAcc >= 0 ? 1 : 0); phaseAcc = 0; }
        }
        return { bits };
    };
    processors.spread_tx = (n, { bits }) => {
        const mode = n.config.mode || 'DSSS', codeStr = n.config.code || '1101001', sps = n.config.sps || 8;
        const code = codeStr.split('').map(c => +c);
        const data = [];
        for (const b of bits) {
            for (let cIdx = 0; cIdx < code.length; cIdx++) {
                const chip = (b === 0 ? 1 : -1) * (code[cIdx] === 0 ? 1 : -1);
                for (let s = 0; s < sps; s++) data.push({ re: chip, im: 0 });
            }
        }
        return { waveform: { kind: 'waveform', fs: sampleRateOf(null), sampleRate: sampleRateOf(null), data } };
    };
    processors.spread_rx = (n, { waveform }) => {
        const data = arr(waveform).map(complex);
        const bits = [];
        const sps = 8, codeLen = 7;
        for (let k = 0; k < data.length; k += sps * codeLen) {
            let sum = 0;
            for (let c = 0; c < codeLen; c++) {
                for (let s = 0; s < sps; s++) {
                    const idx = k + c * sps + s;
                    if (idx < data.length) sum += data[idx].re;
                }
            }
            bits.push(sum >= 0 ? 0 : 1);
        }
        return { bits };
    };
    processors.analog_sideband = (n, { message }) => {
        const mode = n.config.mode || 'DSB-SC', fc = n.config.carrier || 2000;
        const fs = sampleRateOf(message);
        const data = message.data.map(s => {
            const t = message.data.indexOf(s) / fs;
            if (mode === 'DSB-SC') return { re: s.re * Math.cos(2 * Math.PI * fc * t), im: 0 };
            if (mode === 'USB') return { re: s.re * Math.cos(2 * Math.PI * fc * t) - (0) * Math.sin(2 * Math.PI * fc * t), im: 0 };
            return { re: s.re * Math.cos(2 * Math.PI * fc * t), im: 0 };
        });
        return { modulated: { kind: 'waveform', fs, sampleRate: fs, data } };
    };
    processors.coherent_am_detector = (n, { signal }) => {
        const fc = n.config.carrier || 2000;
        const fs = sampleRateOf(signal);
        const data = arr(signal).map(complex);
        const message = data.map((s, k) => { const t = k / fs; return { re: s.re * Math.cos(2 * Math.PI * fc * t) + s.im * Math.sin(2 * Math.PI * fc * t), im: 0 } });
        return { message: { kind: 'samples', fs, sampleRate: fs, data: message } };
    };
    processors.envelope = (n, { signal }) => {
        const data = arr(signal).map(complex);
        const analytic = analyticSignal({ data, fs: sampleRateOf(signal) });
        const message = analytic.data.slice(0, data.length).map(s => ({ re: Math.sqrt(s.re * s.re + s.im * s.im), im: 0 }));
        const removeDC = n.config.removeDC === 'sim';
        const mean = message.reduce((s, m) => s + m.re, 0) / message.length;
        return { message: { kind: 'samples', fs: sampleRateOf(signal), sampleRate: sampleRateOf(signal), data: message.map(m => ({ re: removeDC ? m.re - mean : m.re, im: 0 })) } };
    };
    processors.phase_demod = (n, { signal }) => {
        const fc = n.config.carrier || 2000, mode = n.config.mode || 'PM';
        const fs = sampleRateOf(signal);
        const data = arr(signal).map(complex);
        const analytic = analyticSignal({ data, fs });
        const phases = analytic.data.slice(0, data.length).map(s => Math.atan2(s.im, s.re));
        const unwrapped = unwrap(phases);
        const message = unwrapped.map((p, k) => {
            const t = k / fs;
            const phi = p - 2 * Math.PI * fc * t;
            return { re: mode === 'FM' ? (k > 0 ? (phi - unwrapped[k - 1]) / (2 * Math.PI / fs) : 0) : phi, im: 0 };
        });
        return { message: { kind: 'samples', fs, sampleRate: fs, data: message } };
    };
    processors.scope = (n, { signal }) => {
        const data = arr(signal).map(complex), count = Math.max(1, Math.round(n.config.samples || 400));
        results.push({ type: 'scope', title: `Osciloscópio · Fs=${sampleRateOf(signal)} Hz`, data: data.slice(0, count), fs: sampleRateOf(signal), start: 0, interpolation: n.config.interpolation || 'suave' });
        return { signal };
    };
    processors.probe = (n, { signal }) => {
        const data = arr(signal).map(complex), power = data.reduce((sum, x) => sum + x.re * x.re + x.im * x.im, 0) / Math.max(1, data.length);
        results.push({ type: 'metric', title: n.config.label || 'Probe', value: Math.sqrt(power), detail: `RMS · ${data.length} amostras` });
        return { signal };
    };
    processors.spectrum = (n, { signal }) => {
        const size = Math.max(1, Math.round(n.config.bins || 1024)), fft = computeFFT(signal, size, 'Hann', true);
        results.push({ type: 'spectrum', title: `Espectro · Hann · ${size} bins`, data: fft.data.map(x => 20 * Math.log10(Math.hypot(x.re, x.im) + 1e-12)), fs: fft.fs, binWidth: fft.binWidth, frequencyStart: fft.frequencyStart, unit: 'dB' });
        return {};
    };
    processors.fft_plot = (n, { fft }) => {
        const linear = n.config.scale === 'linear', data = arr(fft).map(complex).map(x => linear ? Math.hypot(x.re, x.im) : 20 * Math.log10(Math.hypot(x.re, x.im) + 1e-12));
        results.push({ type: 'spectrum', title: `FFT · N=${fft.fftSize || data.length}`, data, fs: fft.fs, binWidth: fft.binWidth, frequencyStart: fft.frequencyStart, unit: linear ? 'amplitude' : 'dB' });
        return {};
    };
    processors.constellation = (n, { symbols }) => {
        results.push({ type: 'constellation', title: 'Constelação I/Q', data: arr(symbols).slice(0, n.config.points || 500).map(complex) });
        return {};
    };
    processors.eye = (n, { signal }) => {
        const data = arr(signal).map(complex), sps = n.config.sps || 8, span = 2 * sps, segments = [];
        for (let k = 0; k + span <= data.length && segments.length < (n.config.traces || 40); k += sps) segments.push(data.slice(k, k + span).map(x => x.re));
        results.push({ type: 'eye', title: 'Diagrama de olho', segments });
        return {};
    };
    processors.evm = (n, { ideal, measured }) => {
        const a = arr(ideal).map(complex), b = arr(measured).map(complex), count = Math.min(a.length, b.length); let error = 0, power = 0;
        for (let k = 0; k < count; k++) { error += (b[k].re - a[k].re) ** 2 + (b[k].im - a[k].im) ** 2; power += a[k].re ** 2 + a[k].im ** 2 }
        const value = power ? Math.sqrt(error / power) : NaN;
        results.push({ type: 'metric', title: 'EVM RMS', value, detail: `${(value * 100).toFixed(2)}% · ${count} símbolos` });
        return {};
    };
    processors.signal_stats = (n, { signal }) => {
        const data = arr(signal).map(complex), powers = data.map(x => x.re * x.re + x.im * x.im), average = powers.reduce((sum, x) => sum + x, 0) / Math.max(1, powers.length), papr = average ? Math.max(...powers, 0) / average : NaN;
        results.push({ type: 'metric', title: 'PAPR', value: papr, detail: `${(10 * Math.log10(papr)).toFixed(2)} dB` });
        return {};
    };
    processors.sampling_audit = (n, { signal }) => {
        const fs = sampleRateOf(signal), highest = signal?.highestFrequency, value = highest ? fs / highest : signal?.sps;
        results.push({ type: 'metric', title: 'Auditoria de amostragem', value, detail: highest ? `${value.toFixed(2)} amostras/ciclo` : `${arr(signal).length} amostras · Fs=${fs} Hz` });
        return {};
    };
    processors.ber = (n, { reference, received }) => {
        const a = arr(reference), b = arr(received), count = Math.min(a.length, b.length); let errors = 0;
        for (let k = 0; k < count; k++) errors += a[k] !== b[k];
        results.push({ type: 'metric', title: 'Bit Error Rate', value: count ? errors / count : NaN, errors, total: count, detail: `${errors} erros em ${count} bits` });
        return {};
    };
    processors.ber_curve_mpsk = (n) => {
        const requested = String(n.config.schemes || n.config.orders || 'BPSK,QPSK,8PSK').split(',').map(s => s.trim().toUpperCase().replace(/[ _-]/g, '')).filter(Boolean), schemes = [...new Set(requested)], start = +n.config.start, stop = +n.config.stop, step = +n.config.step, yMin = +(n.config.minBer ?? 1e-8), yMax = +(n.config.maxBer ?? 1);
        if (!schemes.length || !(stop > start) || !(step > 0) || !(yMin > 0) || !(yMax > yMin)) throw Error('Curvas BER: configuração inválida.');
        const x = []; for (let db = start; db <= stop + step * 1e-9; db += step) x.push(db);
        const q = qFunction;
        const calculate = (scheme, gamma) => { if (['BPSK','2PSK','QPSK','4PSK'].includes(scheme)) return q(Math.sqrt(2 * gamma)); if (['BFSK','COHERENTBFSK'].includes(scheme)) return q(Math.sqrt(gamma)); if (['NCBFSK','NONCOHERENTBFSK'].includes(scheme)) return .5 * Math.exp(-gamma / 2); const psk = scheme.match(/^(\d+)PSK$/); if (psk) { const M = +psk[1], k = Math.log2(M); return Math.min(.5, 2 / k * q(Math.sqrt(2 * k * gamma) * Math.sin(Math.PI / M))) } const qam = scheme.match(/^(\d+)QAM$/); if (qam) { const M = +qam[1], k = Math.log2(M), root = Math.sqrt(M); return Math.min(.5, 4 / k * (1 - 1 / root) * q(Math.sqrt(3 * k * gamma / (M - 1)))) } throw Error(`Modulação desconhecida: ${scheme}`) };
        const series = schemes.map(scheme => ({ name: scheme, values: x.map(db => calculate(scheme, 10 ** (db / 10))) }));
        results.push({ type: 'bercurve', title: 'Comparação BER teórica · Eb/N0', x, series, xUnit: 'dB', yUnit: 'BER', yMin, yMax }); return {};
    };

    // Additional Signal Processing
    processors.quantizer = (n, { message }) => {
        const bits = n.config.bits || 4, range = n.config.range || 1;
        const levels = Math.pow(2, bits), delta = 2 * range / levels;
        const data = arr(message).map(complex);
        const samples = data.map(s => {
            const x = s.re;
            const clamped = Math.max(-range, Math.min(range, x));
            const q = Math.round((clamped + range) / delta);
            const reconstructed = (Math.max(0, Math.min(levels - 1, q)) * delta + delta / 2) - range;
            return { re: reconstructed, im: 0 };
        });
        return { samples: { kind: 'samples', fs: sampleRateOf(message), sampleRate: sampleRateOf(message), data: samples } };
    };
    processors.compander = (n, { message }) => {
        const mode = n.config.mode || 'compressor', mu = n.config.mu || 255;
        const data = arr(message).map(complex);
        const samples = data.map(s => {
            const x = s.re;
            if (mode === 'compressor') {
                const y = Math.sign(x) * Math.log(1 + mu * Math.abs(x)) / Math.log(1 + mu);
                return { re: y, im: 0 };
            } else {
                const y = Math.sign(x) * (Math.pow(1 + mu, Math.abs(x)) - 1) / mu;
                return { re: y, im: 0 };
            }
        });
        return { samples: { kind: 'samples', fs: sampleRateOf(message), sampleRate: sampleRateOf(message), data: samples } };
    };
    processors.line_code = (n, { bits }) => {
        const code = n.config.code || 'Manchester', sps = n.config.sps || 16;
        const data = [];
        let lastMark = 0;
        for (const b of bits) {
            if (code === 'NRZ polar') for (let s = 0; s < sps; s++) data.push({ re: b ? 1 : -1, im: 0 });
            else if (code === 'NRZ unipolar') for (let s = 0; s < sps; s++) data.push({ re: b ? 1 : 0, im: 0 });
            else if (code === 'RZ polar') { for (let s = 0; s < sps / 2; s++) data.push({ re: b ? 1 : -1, im: 0 }); for (let s = sps / 2; s < sps; s++) data.push({ re: 0, im: 0 }); }
            else if (code === 'Manchester') for (let s = 0; s < sps; s++) data.push({ re: b ? (s < sps / 2 ? 1 : -1) : (s < sps / 2 ? -1 : 1), im: 0 });
            else if (code === 'AMI') { const mark = lastMark === 1 ? -1 : 1; lastMark = b ? mark : 0; for (let s = 0; s < sps; s++) data.push({ re: lastMark, im: 0 }); }
        }
        return { waveform: { kind: 'waveform', fs: sampleRateOf(null), sampleRate: sampleRateOf(null), data } };
    };
    processors.line_decoder = (n, { waveform }) => {
        const data = arr(waveform).map(complex);
        const bits = [];
        const sps = 16;
        for (let k = 0; k < data.length; k += sps) {
            let sum = 0;
            for (let s = 0; s < sps && k + s < data.length; s++) sum += data[k + s].re;
            bits.push(sum >= 0 ? 1 : 0);
        }
        return { bits };
    };
    processors.delta_mod = (n, { message }) => {
        const delta = n.config.delta || 0.1;
        const data = arr(message).map(complex);
        const bits = [];
        let estimate = data[0]?.re || 0;
        for (const s of data) {
            const err = s.re - estimate;
            bits.push(err >= 0 ? 1 : 0);
            estimate += err >= 0 ? delta : -delta;
        }
        return { bits };
    };
    processors.delta_demod = (n, { bits }) => {
        const delta = n.config.delta || 0.1, smooth = n.config.smooth || 8;
        const message = [];
        let estimate = 0;
        for (const b of bits) {
            estimate += b ? delta : -delta;
            message.push({ re: estimate, im: 0 });
        }
        const smoothed = [];
        for (let k = 0; k < message.length; k++) {
            let sum = 0, count = 0;
            for (let j = Math.max(0, k - Math.floor(smooth / 2)); j <= Math.min(message.length - 1, k + Math.floor(smooth / 2)); j++) { sum += message[j].re; count++; }
            smoothed.push({ re: sum / count, im: 0 });
        }
        return { message: { kind: 'samples', fs: sampleRateOf(null), sampleRate: sampleRateOf(null), data: smoothed } };
    };
    processors.lms_equalizer = (n, { waveform, ideal }) => {
        const tapsCount = n.config.taps || 7, mu = n.config.mu || 0.05, trainSymbols = n.config.train || 400;
        const data = arr(waveform).map(complex);
        const idealData = arr(ideal).map(complex);
        const taps = Array(tapsCount).fill({ re: 0, im: 0 });
        let filtered = [];
        for (let k = 0; k < data.length; k++) {
            let y = { re: 0, im: 0 };
            for (let t = 0; t < tapsCount; t++) {
                const idx = k - t;
                if (idx >= 0) {
                    y.re += taps[t].re * data[idx].re - taps[t].im * data[idx].im;
                    y.im += taps[t].re * data[idx].im + taps[t].im * data[idx].re;
                }
            }
            filtered.push(y);
            if (k < trainSymbols && k + tapsCount < idealData.length) {
                const d = idealData[k + tapsCount];
                const e = { re: d.re - y.re, im: d.im - y.im };
                for (let t = 0; t < tapsCount; t++) {
                    const idx = k - t;
                    if (idx >= 0) {
                        taps[t].re += mu * (e.re * data[idx].re + e.im * data[idx].im);
                        taps[t].im += mu * (e.re * data[idx].im - e.im * data[idx].re);
                    }
                }
            }
        }
        return { filtered: { ...waveform, data: filtered } };
    };

    return processors;
}
