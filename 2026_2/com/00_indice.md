# Sistemas de Comunicações

> Sistemas de Comunicações — Apostila de Curso · UFSC · Prof. Laio Oriel Seman · 80 horas

Esta apostila apresenta os fundamentos dos sistemas de comunicação analógica e digital, desde os conceitos de Fourier e ruído até a implementação completa de um receptor digital com equalização e sincronismo. Cada capítulo segue o mesmo padrão: motivação física, definições rigorosas, deduções matemáticas completas (com resultados em $\boxed{}$), callouts pedagógicos (**Teorema:**, **Definição:**, **Exemplo:**, **Observação:**, **Resultado:**, **Importante:**), experimentos em Python com plots observáveis, exercícios propostos e gabarito.

As convenções são: transformada de Fourier $X(f) = \int_{-\infty}^{\infty} x(t)e^{-j2\pi ft}\,dt$, $\operatorname{sinc}(x) = \sin(\pi x)/(\pi x)$, ruído AWGN com PSD bilateral $N_0/2$, envelope complexo para sinais passa-faixa, e notação $\mathcal{CN}(0,\sigma^2)$ para ruído circularmente simétrico.

---

## Sumário

1. [Visão Geral da Disciplina](#visão-geral-da-disciplina)
2. [Índice dos Capítulos](#índice-dos-capítulos)
3. [Estrutura de Aprendizagem](#estrutura-de-aprendizagem)
4. [Fundamentos Matemáticos Necessários](#fundamentos-matemáticos-necessários)
5. [Simbologia Principal](#simbologia-principal)
6. [Roteiro de Estudo](#roteiro-de-estudo)
7. [Metodologia e Ferramentas](#metodologia-e-ferramentas)

---

## Visão Geral da Disciplina

**Sistemas de Comunicações** é um curso de 80 horas que cobre a cadeia completa de transmissão de informação: da modulação analógica até a demodulação coerente de sinais digitais com equalização e sincronismo. Os tópicos principais são:

- **Fundamentos**: Fourier, PSD, AWGN, capacidade de Shannon, relação sinal-ruído $E_b/N_0$
- **Modulação analógica**: AM (DSB-SC, convencional, SSB, VSB), FM (NBFM, WBFM, Bessel, Carson)
- **Modulação digital**: ASK, PSK (BPSK, QPSK, $M$-PSK), FSK, QAM (quadrada, constelação)
- **Banda base**: Nyquist, ISI, filtro casado, raised cosine, olho digital
- **Equalização**: ZF, MMSE, LMS, DFE, MLSE, equalização em frequência
- **Sincronismo**: portadora (Costas loop), símbolo (Gardner, M&M), quadro (preâmbulo, FAW), OFDM

### Fluxo Lógico de Aprendizado

$$
\text{Fourier} \to \text{Ruído} \to \text{Enlace} \to \text{Modulação} \to \text{Pulsos} \to \text{Constelações} \to \text{Equalização} \to \text{Sincronismo}
$$

Cada capítulo depende dos anteriores. O receptor completo é construído incrementalmente: primeiro o modelo do enlace, depois a modulação, depois a detecção, depois a correção de canal e finalmente a recuperação de parâmetros.

---

## Índice dos Capítulos

| # | Arquivo | Tópico | Conteúdo Principal |
|---|---|---|---|
| 00 | [00_indice.md](00_indice.md) | **Capa / Índice** | Visão geral, ementa, simbologia, fundamentos matemáticos |
| 01 | [01_introducao_sistemas_comunicacoes.md](01_introducao_sistemas_comunicacoes.md) | **Introdução** | Blocos do sistema, métricas (BER, spectral efficiency), dB, orçamento de enlace, figura de ruído, Shannon |
| 02 | [02_modulacao_am.md](02_modulacao_am.md) | **Modulação AM** | DSB-SC, AM convencional, detecção coerente/envelope, SSB, VSB |
| 03 | [03_modulacao_fm.md](03_modulacao_fm.md) | **Modulação FM** | Frequência instantânea, NBFM/WBFM, funções de Bessel, regra de Carson, discriminador e PLL |
| 04 | [04_banda_base_nyquist.md](04_banda_base_nyquist.md) | **Banda Base / Nyquist** | PAM, filtro casado, ISI, critério de Nyquist, raised cosine (RC/RRC), olho digital |
| 05 | [05_digital_passband_ask_psk_fsk.md](05_digital_passband_ask_psk_fsk.md) | **ASK, PSK, FSK** | Espaço de sinais, ASK/OOK, BPSK/QPSK, FSK (coerente e não-coerente), BER Monte Carlo |
| 06 | [06_digital_passband_qam.md](06_digital_passband_qam.md) | **QAM** | QAM quadrada, Gray coding, normalização de energia, EVM, BER Monte Carlo |
| 07 | [07_equalizacao.md](07_equalizacao.md) | **Equalização** | ZF, MMSE, LMS/NLMS, DFE, MLSE/Viterbi, equalização em frequência (OFDM) |
| 08 | [08_sincronismo.md](08_sincronismo.md) | **Sincronismo** | CFO/fase (Costas loop), timing (Gardner, M&M), frame sync, OFDM sync, BER com erros de sync |
| 09 | [09_codigos_corretores_erros.md](09_codigos_corretores_erros.md) | **Códigos Corretores de Erros** | Distância de Hamming, códigos lineares, Hamming, CRC, convolucionais, Viterbi e Shannon |

---

## Estrutura de Aprendizagem

### Ementa Organizacional

| Módulo | Ementa | Capítulos |
|---|---|---|
| I | Introdução a sistemas de comunicações | 00–01 |
| II | Modulação analógica | 02–03 |
| III | Formatação e transmissão em banda base | 04 |
| IV | Transmissão digital em banda passante | 05–06 |
| V | Equalização | 07 |
| VI | Sincronismo | 08 |
| VII | Codificação de canal | 09 |

### Pré-requisitos

- Cálculo diferencial e integral (séries de Fourier, integrais)
- Álgebra linear (vetores, matrizes, autovalores)
- Equações diferenciais (equações lineares de primeira e segunda ordem)
- Probabilidade e estatística (variáveis aleatórias, distribuição Gaussiana, função Q)
- Circuitos elétricos (filtros, resposta em frequência)

### Objetivos de Aprendizagem

Ao final do curso, o estudante deverá ser capaz de:

1. **Modelar** um enlace de comunicação usando Fourier, PSD e ruído AWGN
2. **Projetar** moduladores e demoduladores para AM, FM, ASK, PSK, FSK, QAM
3. **Analisar** a relação entre largura de banda, taxa de dados e eficiência espectral
4. **Calcular** a BER teórica e compará-la com simulações Monte Carlo
5. **Projetar** equalizadores ZF, MMSE e adaptativos (LMS) para canais com ISI
6. **Implementar** loops de sincronismo (Costas, Gardner, M&M) e analisar sua estabilidade
7. **Simular** um receptor digital completo em Python

---

## Fundamentos Matemáticos Necessários

### Transformada de Fourier

$$
X(f) = \int_{-\infty}^{\infty} x(t)\,e^{-j2\pi ft}\,dt, \qquad x(t) = \int_{-\infty}^{\infty} X(f)\,e^{j2\pi ft}\,df
$$

Propriedades essenciais:

- **Convolução**: $\mathcal{F}\{x(t)*h(t)\} = X(f)\cdot H(f)$
- **Modulação**: $\mathcal{F}\{x(t)\cos(2\pi f_c t)\} = \tfrac{1}{2}[X(f-f_c) + X(f+f_c)]$
- **Parseval**: $\int_{-\infty}^{\infty} |x(t)|^2\,dt = \int_{-\infty}^{\infty} |X(f)|^2\,df$
- **Escala**: $\mathcal{F}\{x(at)\} = \tfrac{1}{|a|}X(f/a)$

### Função Q e Probabilidade de Erro

$$
Q(x) = \frac{1}{\sqrt{2\pi}}\int_{x}^{\infty} e^{-t^2/2}\,dt = \frac{1}{2}\operatorname{erfc}\!\left(\frac{x}{\sqrt{2}}\right)
$$

Propriedades usadas em comunicações:

- $Q(0) = 0{,}5$, $Q(3) \approx 1{,}35 \times 10^{-3}$, $Q(4{,}265) \approx 10^{-5}$
- **Aproximação assintótica** ($x \gg 1$): $Q(x) \approx \dfrac{e^{-x^2/2}}{x\sqrt{2\pi}}$
- BER de BPSK: $P_b = Q\!\left(\sqrt{\dfrac{2E_b}{N_0}}\right)$

### Funções de Bessel (para FM)

$$
J_n(\beta) = \frac{1}{2\pi}\int_{-\pi}^{\pi} \cos(n\tau - \beta\sin\tau)\,d\tau
$$

Propriedades:

- $J_{-n}(\beta) = (-1)^n J_n(\beta)$
- $\sum_{n=-\infty}^{\infty} J_n^2(\beta) = 1$ (conservação de energia)
- $J_0(\beta)$ é o componente de portadora; $J_n(\beta)$ ($n \geq 1$) são as laterais

### Entropia e Capacidade de Shannon

$$
H(X) = -\sum_{x} p(x)\log_2 p(x)\quad\text{(entropia de Shannon)}
$$

$$
C = B\log_2\!\left(1 + \frac{P}{N_0 B}\right) = B\log_2(1 + \text{SNR})\quad\text{(capacidade de Shannon-Hartley)}
$$

### Densidade Espectral de Potência (PSD)

$$
S_x(f) = \lim_{T\to\infty} \frac{1}{T}\,\mathbb{E}\bigl[\,|X_T(f)|^2\,\bigr], \qquad X_T(f) = \int_{-T/2}^{T/2} x(t)\,e^{-j2\pi ft}\,dt
$$

### Autocorrelação e Wiener–Khinchin

$$
R_x(\tau) = \mathbb{E}\bigl[x(t)\,x(t+\tau)\bigr]
$$

$$
\boxed{S_x(f) = \mathcal{F}\{R_x(\tau)\} = \int_{-\infty}^{\infty} R_x(\tau)\,e^{-j2\pi f\tau}\,d\tau}
$$

### Processos Aleatórios e Ruído AWGN

- **Gaussiana**: $X \sim \mathcal{N}(\mu,\sigma^2)$ com PDF $\dfrac{1}{\sqrt{2\pi\sigma^2}}e^{-(x-\mu)^2/(2\sigma^2)}$
- **Circularmente simétrica complexa**: $Z \sim \mathcal{CN}(0,\sigma^2)$ com $\mathbb{E}[Z] = 0$, $\mathbb{E}[|Z|^2] = \sigma^2$, $\mathbb{E}[Z^2] = 0$
- **AWGN**: ruído branco gaussiano com PSD bilateral $N_0/2$

---

## Simbologia Principal

| Símbolo | Significado | Unidade |
|---|---|---|
| $s(t)$ | Sinal transmitido | V |
| $r(t)$ | Sinal recebido | V |
| $m(t)$ | Mensagem (banda base) | V |
| $f_c$ | Frequência da portadora | Hz |
| $T_s$ | Período de símbolo | s |
| $R_s = 1/T_s$ | Taxa de símbolos | baud |
| $B$ | Largura de banda | Hz |
| $E_b$ | Energia por bit | J |
| $E_s$ | Energia por símbolo | J |
| $N_0$ | PSD unilateral do ruído | W/Hz |
| $N_0/2$ | PSD bilateral do ruído | W/Hz |
| $P_e$ | Probabilidade de erro | — |
| $P_b$ | Probabilidade de erro de bit | — |
| $P_M$ | Probabilidade de erro de símbolo | — |
| $\eta$ | Eficiência espectral | bit/s/Hz |
| $\beta$ | Índice de modulação FM | — |
| $\mu$ | Índice de modulação AM | — |
| $\alpha$ | Fator de rolloff (raised cosine) | — |
| $M$ | Tamanho da constelação (QAM/PSK) | — |
| $\epsilon$ | Erro de timing | símbolos |
| $\Delta\phi$ | Erro de fase | rad |
| $\Delta f$ | Offset de frequência | Hz |
| $\tau$ | Atraso / offset de timing | s |
| $K$ | Ganho de malha (PLL) | — |
| $Q(x)$ | Função Q (cauda da Gaussiana) | — |
| $h(t)$ | Resposta ao impulso do canal | — |
| $H(f)$ | Resposta em frequência do canal | — |

---

## Roteiro de Estudo

> **Laboratório interativo:** monte encoders, moduladores, canais e receptores no [CommsLab Block Studio](blocklab/index.html). Consulte as [instruções de execução](blocklab/README.md).

### Sequência de Leitura

1. **00 (este arquivo)** e **01**: fixar transformadas, PSD, AWGN, $Q(x)$, SNR, $E_b/N_0$ e o orçamento de enlace
2. **02 e 03**: comparar AM e FM, identificando os compromissos de banda, potência e complexidade
3. **04**: derivar o filtro casado e o critério de Nyquist antes de usar raised cosine
4. **05 e 06**: executar os Monte Carlo e confrontar pontos simulados com curvas teóricas de BER
5. **07**: entender como o equalizador restaura a forma do pulso e abre o olho digital
6. **08**: fechar a cadeia com sincronismo, observando como erros dephasam a constelação e deformam o olho

### Laboratório (Python)

Cada capítulo contém exercícios resolvidos e propostos em Python. O laboratório recomenda:

- Usar `numpy` para operações vetoriais e `scipy.signal` para filtros
- `matplotlib` para plots de constelação, espectro, olho e BER
- Usar um gerador explícito (`rng = np.random.default_rng(42)`) para reprodutibilidade
- Formular uma previsão antes de executar cada simulação e explicar depois se o resultado a confirma
- Em Monte Carlo, simular até observar pelo menos 100 erros por ponto ou informar que o ponto é apenas um limite superior; uma contagem fixa de símbolos não garante precisão em BER baixa
- Identificar eixos, unidades, parâmetros e normalizações em todos os gráficos

O [plano de aprendizagem](ementa.md) organiza esses experimentos em oito laboratórios e propõe um projeto integrador de receptor QPSK/16-QAM.

### Avaliação Sugerida

- **Prova teórica**: deduções, cálculos analíticos, interpretação de gráficos
- **Prova prática**: implementar receptores em Python e comparar com teoria
- **Projeto final**: receptor completo BPSK/QPSK com equalização e sincronismo

---

## Metodologia e Ferramentas

### Convenções de Notação

- Números complexos em itálico: $a + jb$ ou $a e^{j\theta}$
- Vetores e matrizes em negrito: $\vec{x}$, $\mathbf{H}$
- Operadores lineares em fonte: $\mathcal{F}$, $\mathcal{E}[\cdot]$
- Resultados importantes destacados com $\boxed{}$
- Callouts pedagógicos em negrito: **Teorema:**, **Definição:**, **Exemplo:**, **Observação:**, **Resultado:**, **Importante:**

### Ferramentas Computacionais

| Ferramenta | Uso |
|---|---|
| Python 3 + NumPy | Operações numéricas e vetoriais |
| SciPy | Filtros DSP, funções especiais, estatística |
| Matplotlib | Plot de constelação, espectro, olho, BER |
| Sympy (opcional) | Verificação simbólica de identidades |

### Referências Complementares

- Proakis & Salehi, *Digital Communications* (5ª ed.)
- Sklar, *Digital Communications: Fundamentals and Applications* (2ª ed.)
- Couch, *Digital and Analog Communication Systems* (8ª ed.)
- Haykin, *Communication Systems* (5ª ed.)
- Goldsmith, *Wireless Communications* (Cambridge, 2005)

---

[Ementa](ementa.md) · [Próximo: Sinais, Fourier e Ruído →](00_sinais_fourier_ruido.md)
