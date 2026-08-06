# Aula Inaugural — Sistemas de Comunicações

> **Sistemas de Comunicações** · UFSC · Prof. Laio Oriel Seman · 2026/2  
> **Duração:** 3 horas (180 minutos) · **Idioma:** Português

---

## Sumário

1. [Apresentação da Disciplina](#1-apresentação-da-disciplina)
2. [Ementa e Objetivos](#2-ementa-e-objetivos)
3. [O que é Comunicar?](#3-o-que-é-comunicar)
4. [A Cadeia de Comunicação — Modelo Completo](#4-a-cadeia-de-comunicação--modelo-completo)
5. [Modulação — Guia Visual Completo](#5-modulação--guia-visual-completo)
6. [Experiências Python ao Vivo](#6-experiências-python-ao-vivo)
7. [Métricas Fundamentais](#7-métricas-fundamentais)
8. [Roteiro do Semestre](#8-roteiro-do-semestre)
9. [Metodologia e Avaliação](#9-metodologia-e-avaliação)
10. [Exercício de Fixação](#10-exercício-de-fixação)

---

## 1. Apresentação da Disciplina

Bem-vindo a **Sistemas de Comunicações**! Esta é a disciplina que responde a uma pergunta aparentemente simples — **"como enviamos informação de um ponto a outro?"** — mas que esconde uma das mais ricas e fundamentais áreas da engenharia.

### Por que esta disciplina importa?

- Cada vez que você faz uma chamada VoIP, assiste a um vídeo no YouTube, usa GPS, ou envia um e-mail, você está usando **sistemas de comunicação**.
- O 5G, o Starlink, o WiFi 7, os satélites de órbita baixa — tudo isso se baseia nos conceitos que estudaremos aqui.
- A teoria das comunicações é uma das poucas áreas da engenharia onde **matemática pura** (Fourier, probabilidade, álgebra linear) se traduz em **tecnologia tangível** que bilhões de pessoas usam diariamente.

### Pré-requisitos

Para acompanhar esta disciplina, você deve estar cursando ou ter concluído:

| Pré-requisito | Por que importa |
|---|---|
| Cálculo (integrais, séries de Fourier) | Transformada de Fourier é a linguagem dos sinais |
| Álgebra Linear (vetores, matrizes) | Constelações QAM/PSK são vetores em espaços multidimensionais |
| Probabilidade e Estatística (Gaussiana, esperança) | Ruído é modelado como processo aleatório |
| Circuitos Elétricos (filtros, resposta em frequência) | Moduladores/demoduladores são filtros e misturadores |

---

## 2. Ementa e Objetivos

### Ementa

> **Introdução a sistemas de comunicações; Modulação analógica; Formatação e transmissão de sinais em banda base; Transmissão digital em banda passante; Equalização; Sincronismo.**

### Objetivos Gerais

Ao final do semestre, você será capaz de:

1. **Compreender** a cadeia completa de comunicação — da fonte ao destino
2. **Projetar** moduladores e demoduladores para sinais analógicos (AM, FM) e digitais (BPSK, QPSK, QAM)
3. **Analisar** o desempenho de sistemas em presença de ruído (SNR, $E_b/N_0$, BER)
4. **Calcular** a capacidade máxima de um canal (limite de Shannon)
5. **Implementar** receptores digitais completos em Python
6. **Projetar** equalizadores para combater a distorção do canal
7. **Implementar** mecanismos de sincronismo (fase, timing, quadro)

### Estrutura do Semestre (80 horas)

| Módulo | Tópico | Aulas Aprox. |
|---|---|---|
| **I** | Introdução a sistemas de comunicações | ~10h |
| **II** | Modulação analógica (AM, FM) | ~16h |
| **III** | Formatação e transmissão em banda base (Nyquist, ISI) | ~10h |
| **IV** | Transmissão digital em banda passante (ASK, PSK, FSK, QAM) | ~16h |
| **V** | Equalização (ZF, MMSE, LMS) | ~10h |
| **VI** | Sincronismo (Costas, Gardner, M&M) | ~10h |
| **VII** | Códigos corretores de erros (Hamming, Viterbi, Shannon) | ~8h |

---

## 3. O que é Comunicar?

Comunicar é **transferir informação de um emissor a um receptor por um meio imperfeito**.

O "meio imperfeito" é a chave: nenhum canal é perfeito. Sempre há:

- **Ruído** (térmico, interferência, multipercursos)
- **Atenuação** (o sinal perde força com a distância)
- **Distorção** (diferentes frequências viajam de forma diferente)
- **Interferência** (outos transmissores ocupando o mesmo espectro)

A engenharia de comunicações é a arte de **extrair informação máxima de sinais mínimos, através de canais ruins**.

### Exemplos do mundo real

| Sistema | Canal | Modulação | Desafio principal |
|---|---|---|---|
| WiFi (802.11ac) | Rádio multipercursos | 256-QAM | ISI, sincronismo |
| GPS (L1) | Espaço livre, ultra fraco | BPSK | Sensibilidade extrema |
| 5G NR | Urbano/vehicular | OFDM + 64-QAM | Mobilidade, latência |
| Fiber optic | Fibra óptica | PPM / QAM | Dispersão cromática |
| Ham radio | Rádio AM/FM | AM / FM | Ruído, alcance |

---

## 4. A Cadeia de Comunicação — Modelo Completo

Todo sistema de comunicação pode ser representado por esta cadeia:

```
┌──────────┐    ┌────────────┐    ┌────────────┐    ┌───────────┐
│  Fonte   │───►│ Codif. Fonte│───►│ Codif. Canal│───►│ Modulador │
│ (voz,    │    │ (compressão)│    │ (proteção) │    │ (adapta   │
│  vídeo,  │    └────────────┘    └────────────┘    │ ao canal) │
│  dados)  │                                        └─────┬─────┘
└──────────┘                                              │
                                                          ▼
                                                          ╔═══════════╗
                                                          ║  CANAL    ║
                                                          ║ + RUÍDO   ║
                                                          ║ + INTER.  ║
                                                          ╚═══════════╝
                                                          │
┌──────────┐    ┌────────────┐    ┌────────────┐    ┌─────┴─────┐
│  Destino │◄───│ Decodif.   │◄───│ Decodif.   │◄───│ Demodulador│
│ (reconstr│    │ Canal      │    │ Fonte      │    │ (recupera │
│  uir msg)│    │ (correção) │    │ (descompress)│   │ o sinal)  │
└──────────┘    └────────────┘    └────────────┘    └───────────┘
```

### Explicando cada bloco

#### Fonte
Gera a informação original: voz, vídeo, dados. A **entropia de Shannon** mede a informação contida:

$$H(X) = -\sum_{i} p_i \log_2(p_i) \quad \text{(bits/símbolo)}$$

Para uma moeda justa ($p=0.5$): $H = 1$ bit/símbolo.  
Para uma moeda viciada ($p=0.99$): $H \approx 0.08$ bits/símbolo — quase toda informação é previsível.

#### Codificação de Fonte
Remove redundância. Exemplo: código Huffman, compressão ZIP, MP3.  
**Objetivo:** transmitir a mesma informação com **menos bits**.

#### Codificação de Canal
Adiciona redundância **controlada** para proteção contra erros. Exemplo: código Hamming $(7,4)$ — 4 bits de informação viram 7 bits transmitidos.  
**Objetivo:** detectar e corrigir erros sem retransmissão.

#### Modulador
Adapta o sinal à banda do canal. Um sinal de voz (300 Hz – 3.4 kHz) não pode viajar diretamente por uma antena de 1 m — precisamos "carregá-lo" em uma portadora de MHz ou GHz.

$$s(t) = I(t)\cos(2\pi f_c t) - Q(t)\sin(2\pi f_c t)$$

#### Canal
O meio físico: fio, fibra, espaço livre. Sempre adiciona:
- Atenuação (perda de potência)
- Ruído (aleatório, modelado como Gaussiano)
- Distorção (multipercursos, ISI)

$$r(t) = s(t) * h(t) + n(t)$$

#### Demodulador, Decodificação
O processo inverso: recupera o sinal, corrige erros, reconstrói a mensagem.

---

## 5. Modulação — Guia Visual Completo

### Por que modular?

Existem 4 razões fundamentais:

1. **Antenas práticas**: Para irradiar eficientemente, o tamanho da antena deve ser comparável ao comprimento de onda ($\lambda = c/f$). Sinais de áudio (1 kHz, $\lambda = 300$ km) exigiriam antenas de 75 km! Com portadora de 100 MHz ($\lambda = 3$ m), antenas de 0.75 m bastam.

2. **Multiplexação por divisão de frequência (FDM)**: Diferentes transmissores ocupam faixas diferentes do espectro. Rádio FM 98.1 MHz, 101.7 MHz, etc.

3. **Imunidade a ruído**: Algumas modulações (FM, PSK) trocam banda por melhor relação sinal-ruído.

4. **Eficiência espectral**: Modulações digitais (QAM, OFDM) carregam muitos bits por Hertz.

---

A modulação é o processo de **codificar informação em uma portadora** alterando um ou mais de seus parâmetros: **amplitude**, **frequência** ou **fase**. Vamos explorar cada família em detalhe.

### 5.1 Classificação Geral

```
                         MODULAÇÃO
                        /         \
                  Analógica      Digital
                 /      \        /     \
              AM      FM        PSK     QAM
            / | \     / \\       / | \
          AM DSB SSB  NBF  WBF BQ   BQ16  256
          conv SC    (1)(2) Freq Freq PSK QAM QAM QAM
```

---

### 5.2 Modulações Analógicas — AM (Amplitude)

#### (a) AM Convencional (AM com portadora)

O que varia: **amplitude** da portadora proporcional à mensagem.

$$s_{\text{AM}}(t) = A_c\,[1 + \mu\,m(t)]\,\cos(2\pi f_c t)$$

onde $\mu$ é o **índice de modulação** ($0 \le \mu \le 1$ para evitar sobremodulação).

| Propriedade | Valor |
|---|---|
| **Banda** | $B = 2f_m$ |
| **Potência total** | $P_T = P_c\,(1 + \mu^2/2)$ |
| **Eficiência** | Máx. 33% (quando $\mu=1$, toda potência extra nas laterais) |
| **Demodulação** | Envelope simples (detector de diodo) — sem necessidade de portadora local |
| **Imunidade a ruído** | Baixa |

**Aplicações**: Rádio AM comercial (530–1700 kHz), áudio em vídeo (NTSC/PAL).

**Como funciona visualmente**: O envelope do sinal modulado segue exatamente a forma de $m(t)$. Se $m(t)$ é um seno de 440 Hz, o envelope pulsa 440 vezes por segundo.

#### (b) DSB-SC (Double Sideband Suppressed Carrier)

Mesma fórmula, mas **sem o termo DC**: removemos a portadora para economizar potência.

$$s_{\text{DSB-SC}}(t) = A_c\,m(t)\,\cos(2\pi f_c t)$$

| Propriedade | Valor |
|---|---|
| **Banda** | $B = 2f_m$ |
| **Potência** | 100% nas bandas laterais (eficiente!) |
| **Demodulação** | **Coerente** — precisa de portadora local síncrona |
| **Problema** | Ambiguidade de fase de 180° (inversão de polaridade) |

**Aplicações**: Estações de TV (vídeo VSB), multiplexação PCM.

#### (c) SSB (Single Sideband)

Envia **apenas uma banda lateral** (superior ou inferior). Economiza 50% de banda e toda potência da portadora.

$$s_{\text{SSB}}(t) = \frac{A_c}{2}\,m(t)\cos(2\pi f_c t) \mp \frac{A_c}{2}\,\hat{m}(t)\sin(2\pi f_c t)$$

onde $\hat{m}(t)$ é a **transformada de Hilbert** de $m(t)$.

| Propriedade | Valor |
|---|---|
| **Banda** | $B = f_m$ (metade do AM!) |
| **Potência** | 100% na única lateral |
| **Demodulação** | Coerente |
| **Complexidade** | Filtro de Hilbert ou filtro de banda lateral |

**Aplicações**: Rádio amador (HF), comunicação marítima, VoIP sobre rádio.

#### (d) VSB (Vestigial Sideband)

Envia **uma banda lateral completa + parte da outra** (um "vestígio"). Compromisso prático entre SSB e DSB.

$$B = f_m + f_{\text{vestígio}}$$

| Propriedade | Valor |
|---|---|
| **Banda** | $B \approx f_m$ (ligeiramente mais que SSB) |
| **Demodulação** | Coerente, mas menos crítica que SSB |
| **Vantagem** | Menos exigente com filtros que SSB |

**Aplicações**: **TV analógica** (NTSC, PAL, SECAM) — padrão que muitos de nós crescemos vendo!

#### Resumo AM — Comparação Visual

```
Amplitude
  │
  │  AM conv:  Envelope segue m(t), portadora sempre presente
  │  ╔══════╗        ╔══════╗
  │  ║      ║  ╔════╝      ╔╩════
  │  ║  ╔═══╩══╡ m(t)    ═╡      ║
  │  ║  ║      ║          ║      ║
  │──╫──╫──────╫──────────╫──────╫──→ tempo
  │  ║  ║      ║          ║      ║
  │  ║  ╚══════╝          ╚══════╝
  │  ╚══════╝
  │
  │  DSB-SC:   Zero cruzamento quando m(t) cruza zero
  │  ╔════════╩════════╦════════╗
  │  ║    ╔════════╣   ║    ╔═══╣
  │──╫────╫────────╫───╫────╫──╫──→
  │  │    ╚════════╝   │    ╚═══╝
  │  ╚════════════════╩═════════╝
  │
  │  SSB:   Uma única banda lateral
  │  (apenas USB ou LSB)
  │
  │  VSB:   Lateral completa + meio
  │  (usado em TV)
```

---

### 5.3 Modulações Analógicas — FM (Frequência)

#### FM Convencional (Wideband FM)

O que varia: **frequência instantânea** proporcional à mensagem.

$$s_{\text{FM}}(t) = A_c\,\cos\!\left(2\pi f_c t + 2\pi k_f \!\int_0^t m(\tau)\,d\tau\right) = A_c\,\cos\!\left(2\pi f_c t + \phi(t)\right)$$

O **índice de modulação FM** é $\beta = \Delta f / f_m$, onde $\Delta f = k_f A_m$ é o desvio máximo de frequência.

A banda é dada pela **regra de Carson**:

$$\boxed{B_{\text{FM}} \approx 2\,f_m\,(1 + \beta)}$$

| Propriedade | Valor |
|---|---|
| **Banda** | $2f_m(1+\beta)$ — pode ser muito maior que AM |
| **Imunidade a ruído** | **Excelente** — o receptor FM rejeita amplitude (ruído é principalmente amplitude) |
| **Ganho de processamento** | $\text{SNR}_{\text{out}} = \frac{3}{2}\beta^2 \cdot \text{SNR}_{\text{in}}$ |
| **Demodulação** | Discriminador de FM, PLL, ou detector coerente |
| **Efeito limiar** | Abaixo de ~10 dB, colapso catastrófico na demodulação |

**Aplicações**: Rádio FM comercial (88–108 MHz, $\beta \approx 5$, banda 200 kHz), áudio de TV analógica, talkie-walkies.

#### NBFM (Narrowband FM)

Quando $\beta \ll 1$ (geralmente $\beta < 0.2$):

$$s_{\text{NBFM}}(t) \approx A_c\cos(2\pi f_c t) - \beta A_c\,m(t)\sin(2\pi f_c t)$$

Banda ≈ $2f_m$ (similar ao DSB-SC). Usado em rádios móveis.

| Propriedade | NBFM | WBFM |
|---|---|---|
| **Índice $\beta$** | $\ll 1$ (tip. 0.2) | Grande (tip. 5) |
| **Banda** | $\approx 2f_m$ | $\gg 2f_m$ |
| **Qualidade de áudio** | Voz (3 kHz) | Hi-Fi (15 kHz) |
| **Imunidade** | Moderada | Excelente |

---

### 5.4 Modulações Digitais — PSK (Phase Shift Keying)

O que varia: **fase** da portadora. Cada valor de fase representa um símbolo.

#### BPSK (Binary PSK)

2 fases possíveis: $0$ e $\pi$.

| Bit | Fase | Portadora |
|---|---|---|
| 0 | $0$ | $+\cos(2\pi f_c t)$ |
| 1 | $\pi$ | $-\cos(2\pi f_c t)$ |

$$s_0(t) = \sqrt{\frac{2E_b}{T_b}}\cos(2\pi f_c t), \qquad s_1(t) = -\sqrt{\frac{2E_b}{T_b}}\cos(2\pi f_c t)$$

| Propriedade | Valor |
|---|---|
| **Bits/símbolo** | $k = \log_2 2 = 1$ |
| **Eficiência espectral** | $\eta = 0.5$ bit/s/Hz (RC, $\alpha=0$) |
| **BER** | $P_b = Q\!\left(\sqrt{\dfrac{2E_b}{N_0}}\right)$ |
| **Eb/N₀ para BER=10⁻⁵** | ≈ 9.6 dB |
| **Robustez** | **Máxima** — a modulação digital mais simples |

**Aplicações**: GPS, profundidade espacial (Voyager), RFID, Bluetooth (GFSK derivado).

#### QPSK (Quadrature PSK)

4 fases: $\pi/4,\, 3\pi/4,\, 5\pi/4,\, 7\pi/4$ (Gray coding).

| Bits | Fase | Ponto constelação |
|---|---|---|
| 00 | $\pi/4$ | $(+1, +1)$ |
| 01 | $3\pi/4$ | $(-1, +1)$ |
| 11 | $5\pi/4$ | $(-1, -1)$ |
| 10 | $7\pi/4$ | $(+1, -1)$ |

$$s(t) = \sqrt{\frac{2E_s}{T_s}}\cos(2\pi f_c t + \theta_i), \quad \theta_i \in \left\{\frac{\pi}{4}, \frac{3\pi}{4}, \frac{5\pi}{4}, \frac{7\pi}{4}\right\}$$

| Propriedade | Valor |
|---|---|
| **Bits/símbolo** | $k = \log_2 4 = 2$ |
| **Eficiência espectral** | $\eta = 1.0$ bit/s/Hz |
| **BER** | $P_b \approx Q\!\left(\sqrt{\dfrac{2E_b}{N_0}}\right)$ (≈ BPSK!) |
| **Eb/N₀ para BER=10⁻⁵** | ≈ 12.6 dB (com Gray) |

**Aplicações**: WiFi (802.11), DVB-S (satélite), 3G, GPS L1 C/A.

#### M-PSK (M-ary PSK)

Generalização: $M$ fases equidistantes ($2\pi/M$).

| Propriedade | Fórmula |
|---|---|
| **Bits/símbolo** | $k = \log_2 M$ |
| **Distância mínima** | $d_{\min} = 2\sqrt{E_s}\,\sin(\pi/M)$ |
| **BER** | $P_b \approx \dfrac{2}{\log_2 M}\,Q\!\left(\sqrt{2\log_2 M \cdot \dfrac{E_b}{N_0}}\,\sin\!\frac{\pi}{M}\right)$ |

| M | $k$ | Eb/N₀ para BER=10⁻⁵ | Comentar |
|---|---|---|---|
| 2 (BPSK) | 1 | 9.6 dB | Ideal |
| 4 (QPSK) | 2 | 12.6 dB | Prático |
| 8 | 3 | 16.3 dB | Complexo |
| 16 | 4 | 19.6 dB | Raro |

> **Regra prática**: Cada dobra de M custa ~3 dB adicionais. Depois de QPSK, PSK torna-se impraticável — entra a QAM.

---

### 5.5 Modulações Digitais — FSK (Frequency Shift Keying)

O que varia: **frequência**. Cada símbolo é uma frequência diferente.

#### BFSK (Binary FSK)

| Bit | Frequência |
|---|---|
| 0 | $f_0 = f_c - \Delta f$ |
| 1 | $f_1 = f_c + \Delta f$ |

| Propriedade | Valor |
|---|---|
| **Banda** | $B \approx 2\Delta f + 2/T_b$ |
| **Coerente** | $P_b = Q\!\left(\sqrt{\dfrac{E_b}{N_0}}\right)$ |
| **Não-coerente** | $P_b = \tfrac{1}{2}\exp\!\left(-\dfrac{E_b}{2N_0}\right)$ |
| **Custo vs BPSK** | ~3 dB pior (coerente) |

**Vantagem**: Não requer sincronismo de fase! Mais simples de implementar.

**Aplicações**: Modems V.22 (1200 baud), pager, IoT (LoRa usa Chirp Spread Spectrum derivado), RFID UHF.

---

### 5.6 Modulações Digitais — ASK / OOK (Amplitude)

O que varia: **amplitude**.

#### OOK (On-Off Keying)

| Bit | Sinal |
|---|---|
| 0 | $0$ (sem transmissão) |
| 1 | $A_c\cos(2\pi f_c t)$ |

| Propriedade | Valor |
|---|---|
| **BER** | $P_b = Q\!\left(\sqrt{\dfrac{E_b}{2N_0}}\right)$ |
| **Custo vs BPSK** | ~3 dB pior |
| **Simplicidade** | **Máxima** — basta ligar/desligar |

**Aplicações**: Controle remoto infravermelho, fibra óptica simples, RFID passivo.

---

### 5.7 Modulações Digitais — QAM (Quadrature Amplitude Modulation)

O que varia: **amplitude E fase simultaneamente** — combina amplitude das portadoras em quadratura.

#### M-QAM Quadrada

Grid $\sqrt{M} \times \sqrt{M}$ no plano I/Q. Gray coding minimiza erros de bits.

$$s(t) = I\cos(2\pi f_c t) - Q\sin(2\pi f_c t)$$

| M | Nome | Grid | Bits/símbolo | Eb/N₀ para BER=10⁻⁵ |
|---|---|---|---|---|
| 4 | 4-QAM (= QPSK) | 2×2 | 2 | ~12.6 dB |
| 16 | 16-QAM | 4×4 | 4 | ~19.6 dB |
| 64 | 64-QAM | 8×8 | 6 | ~26 dB |
| 256 | 256-QAM | 16×16 | 8 | ~32 dB |
| 1024 | 1024-QAM | 32×32 | 10 | ~38 dB |

**Aproximação BER para M-QAM**:
$$P_b \approx \frac{4}{\log_2 M}\left(1 - \frac{1}{\sqrt{M}}\right) Q\!\left(\sqrt{\frac{3\log_2 M}{M-1}\cdot\frac{E_b}{N_0}}\right)$$

| Propriedade | Valor |
|---|---|
| **Eficiência espectral máxima** | $\eta = \log_2 M$ bit/s/Hz |
| **Vantagem** | Alta eficiência espectral |
| **Desvantagem** | Muito sensível a ruído e não-linearidades |
| **Demanda SNR** | ~6 dB por dobro de M |

**Aplicações**:
- **16-QAM**: WiFi 802.11n, 4G LTE
- **64-QAM**: WiFi 802.11ac/ax, 4G LTE, 5G NR
- **256-QAM**: WiFi 6 (802.11ax), DOCSIS 3.1
- **1024-QAM**: Experimental / pesquisa

---

### 5.8 Tabela Comparativa Definitiva

| Modulação | Tipo | O que varia | Banda rel. | Eb/N₀ (BER=10⁻⁵) | Eficiência | Imunidade | Aplicações |
|---|---|---|---|---|---|---|---|
| **AM conv** | Analógica | Amplitude | $2f_m$ | — | 33% pot. | Baixa | Rádio AM |
| **DSB-SC** | Analógica | Amplitude | $2f_m$ | — | 100% pot. | Baixa | TV vídeo |
| **SSB** | Analógica | Amplitude | $f_m$ | — | 100% pot. | Média | Rádio amador |
| **VSB** | Analógica | Amplitude | $\sim f_m$ | — | 100% pot. | Média | TV analógica |
| **NBFM** | Analógica | Frequência | $\sim 2f_m$ | — | — | Moderada | Rádios móveis |
| **WBFM** | Analógica | Frequência | $\gg 2f_m$ | — | — | **Alta** | Rádio FM |
| **OOK** | Digital | Amplitude | $\sim 2/T$ | ~12.6 dB | 0.5 b/s/Hz | Baixa | IR, fibra |
| **BPSK** | Digital | Fase | $0.5/T$ | **9.6 dB** | 0.5 b/s/Hz | Média | GPS, espaço |
| **BFSK** | Digital | Freq. | $> 2/T$ | ~12.6 dB | 0.5 b/s/Hz | Média | Modems, IoT |
| **QPSK** | Digital | Fase+Ampl. | $1/T$ | **12.6 dB** | **1.0 b/s/Hz** | Média | WiFi, satél. |
| **16-QAM** | Digital | Fase+Ampl. | $4/T$ | ~19.6 dB | **4.0 b/s/Hz** | Baixa | 4G LTE |
| **64-QAM** | Digital | Fase+Ampl. | $6/T$ | ~26 dB | **6.0 b/s/Hz** | Baixa | WiFi ac/ax |
| **256-QAM** | Digital | Fase+Ampl. | $8/T$ | ~32 dB | **8.0 b/s/Hz** | Muito baixa | WiFi 6 |

### 5.9 O Grande Trade-off

Toda modulação enfrenta este triângulo:

```
                Eficiência
               Espectral
                   ╱  ╲
                  ╱    ╲
                 ╱      ╲
              Robustez ←──→ Simplicidade
              (Imunidade)    (Custo)
```

- **BPSK**: máximo em robustez, mínimo em eficiência
- **256-QAM**: máximo em eficiência, mínimo em robustez
- **QPSK**: o "ponto doce" — bom equilíbrio

> **Regra de ouro**: Sistemas espaciais (Voyager) usam BPSK — sinal chega a bilhões de km com potência de watts. Sistemas de banda larga (WiFi 6) usam 256-QAM — precisamos de velocidade, não de distância.

### 5.10 Onde entram AM, FM, PSK, QAM no nosso semestre?

| Módulo | Semanas | O que você vai aprender |
|---|---|---|
| **II — AM** | 4–5 | AM conv, DSB-SC, SSB, VSB — detector de envelope, demodulação coerente |
| **II — FM** | 6 | NBFM/WBFM, funções de Bessel, regra de Carson, PLL |
| **IV — Digital** | 9–11 | ASK, FSK, BPSK, QPSK, M-PSK, QAM — constelações, BER, Gray coding |

---

### Resumo Visual — Mapa das Modulações

```
┌─────────────────────────────────────────────────────────────────┐
│                    MAPA DAS MODULAÇÕES                          │
│                                                                 │
│  ANALÓGICA                          DIGITAL                     │
│  ┌──────────┐  ┌───────────┐       ┌──────────┐  ┌──────────┐  │
│  │  AM      │  │  FM       │       │  PSK     │  │  QAM     │  │
│  │          │  │           │       │          │  │          │  │
│  │• Conv.   │  │• NBFM     │       │• BPSK    │  │• 16-QAM  │  │
│  │• DSB-SC  │  │• WBFM     │       │• QPSK    │  │• 64-QAM  │  │
│  │• SSB     │  │           │       │• M-PSK   │  │• 256-QAM │  │
│  │• VSB     │  │           │       │          │  │          │  │
│  └──────────┘  └───────────┘       └──────────┘  └──────────┘  │
│                                                                 │
│  OUTRAS:  ASK/OOK │ BFSK │ OFDM (combina QAM + FDM)            │
└─────────────────────────────────────────────────────────────────┘
```



## 6. Experiências Python ao Vivo

### Experimento 1: O que é modulação?

Vamos visualizar como uma mensagem de áudio é "carregada" em uma portadora:

```python
"""
Experimento 1 — AM vs. FM: Visualização da Modulação
=====================================================
Compare como o sinal modulante (voz simulada) altera a amplitude (AM)
e a frequência (FM) da portadora.
"""
import numpy as np
import matplotlib.pyplot as plt

# Parâmetros
fs = 44100          # Taxa de amostragem (Hz)
t = np.linspace(0, 0.05, int(0.05 * fs), endpoint=False)  # 50 ms
f_msg = 440          # Frequência da mensagem (Tom A4 = 440 Hz)
f_carrier = 5000     # Portadora 5 kHz
mu = 0.7             # Índice de modulação AM
beta = 2.0           # Índice de modulação FM

# Mensagem (sinal modulante)
m = np.sin(2 * np.pi * f_msg * t)

# Portadora
carrier = np.cos(2 * np.pi * f_carrier * t)

# AM (DSB com portadora)
am = (1 + mu * m) * carrier

# FM
phase_deviation = beta * f_msg / (2 * np.pi)  # deslocamento de fase
phi = 2 * np.pi * f_carrier * t + beta * np.sin(2 * np.pi * f_msg * t)
fm = np.cos(phi)

# Visualização
fig, axes = plt.subplots(4, 1, figsize=(14, 10))

# Sinal modulante
axes[0].plot(t[:500], m[:500], color='#2563eb', lw=1.5)
axes[0].set_ylabel('Amplitude')
axes[0].set_title('Sinal Modulante (mensagem) — 440 Hz')
axes[0].grid(alpha=0.3)

# Portadora
axes[1].plot(t[:500], carrier[:500], color='#64748b', lw=0.8, alpha=0.7)
axes[1].set_ylabel('Portadora')
axes[1].set_title('Portadora — 5000 Hz')
axes[1].grid(alpha=0.3)

# AM
axes[2].plot(t[:500], am[:500], color='#dc2626', lw=1.2)
axes[2].fill_between(t[:500], -(1+mu)*np.abs(m)[:500] + 1, (1+mu)*np.abs(m)[:500] + 1,
                     alpha=0.1, color='#dc2626')
axes[2].set_ylabel('AM modulado')
axes[2].set_title('Modulação AM (DSB com portadora, μ=0.7)')
axes[2].grid(alpha=0.3)

# FM
axes[3].plot(t[:500], fm[:500], color='#047857', lw=1.2)
axes[3].set_xlabel('Tempo (s)')
axes[3].set_ylabel('FM modulado')
axes[3].set_title('Modulação FM (β=2.0) — note a variação de frequência')
axes[3].grid(alpha=0.3)

plt.tight_layout()
plt.savefig('experimento1_am_fm.png', dpi=150, bbox_inches='tight')
print("Experimento 1 salvo: experimento1_am_fm.png")
print(f"  AM: portadora + envelope seguindo {f_msg} Hz")
print(f"  FM: frequência instantânea varia entre {f_carrier-beta*f_msg:.0f} e {f_carrier+beta*f_msg:.0f} Hz")
```

#### O que observar:
- **AM**: O envelope do sinal segue exatamente a forma da mensagem
- **FM**: A amplitude é constante, mas a **densidade** das oscilações muda — mais apertada quando a mensagem é positiva, mais espaçada quando negativa

---

### Experimento 1b: Todas as Modulações Digitais — Visualização Completa

Agora vamos comparar **todas** as modulações digitais lado a lado — no tempo, na frequência e na constelação:

```python
"""
Experimento 1b — Panorama Completo das Modulações Digitais
===========================================================
Visualize OOK, BPSK, QPSK, 16-QAM, BFSK no tempo, espectro e constelação.
"""
import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)
fs = 100000
N = 5000  # símbolos

# ===== GERAR SÍMBOLOS =====
bits = np.random.randint(0, 2, N * 6)  # bits suficientes para todas as modulações

def oversample_signal(data, os_factor=10):
    """Upsample com zero-order hold."""
    return np.repeat(data, os_factor)

def rc_pulse(N_sym, os, alpha=0.25):
    """Raised cosine filter."""
    N = N_sym * os
    n = np.arange(-N//2, N//2 + 1)
    h = np.zeros(len(n))
    for i, val in enumerate(n):
        if val == 0:
            h[i] = 1 + alpha * (4 / np.pi - 1)
        elif abs(val) == N // (2 * alpha):
            h[i] = alpha / (2 * np.pi * val) * (np.sin(np.pi * (1 - alpha) * val / (N//2)) +
                                                   4 * alpha * np.cos(np.pi * (1 + alpha) * val / (N//2)))
        else:
            numerator = np.sin(np.pi * val / os) * np.cos(np.pi * alpha * val / os)
            denom = np.pi * val / os * (1 - (2 * alpha * val / (2 * N//os))**2)
            h[i] = numerator / denom
    return h / np.sum(h)

rc = rc_pulse(64, 10, alpha=0.25)

# ===== OOK =====
bits_ook = bits[:N]
sym_ook = bits_ook.astype(float)  # 0 ou 1
tx_ook = oversample_signal(sym_ook, 10)
tx_ook = np.convolve(tx_ook, rc[:64], mode='full')

# ===== BPSK =====
bits_bpsk = bits[N:2*N]
sym_bpsk = 2 * bits_bpsk.astype(float) - 1  # -1 ou +1
tx_bpsk = oversample_signal(sym_bpsk, 10)
tx_bpsk = np.convolve(tx_bpsk, rc[:64], mode='full')
fc = 50
t = np.arange(len(tx_bpsk)) / fs
tx_bpsk = tx_bpsk * np.cos(2 * np.pi * fc * t)

# ===== QPSK =====
bits_qpsk = bits[2*N:3*N]
i_bits = bits_qpsk[::2]
q_bits = bits_qpsk[1::2]
i_sym = 2 * i_bits.astype(float) - 1
q_sym = 2 * q_bits.astype(float) - 1
tx_i = oversample_signal(i_sym, 10)
tx_q = oversample_signal(q_sym, 10)
tx_i = np.convolve(tx_i, rc[:64], mode='full')
tx_q = np.convolve(tx_q, rc[:64], mode='full')
tx_qpsk = tx_i * np.cos(2 * np.pi * fc * t) - tx_q * np.sin(2 * np.pi * fc * t)

# ===== 16-QAM =====
bits_qam = bits[3*N:4*N]
raw = bits_qam.reshape(-1, 4)
i_raw = raw[:, [0, 1]]
q_raw = raw[:, [2, 3]]
i_qam = -1.5 + 2 * np.array([int(''.join(map(str, b)), 2) for b in i_raw])
q_qam = -1.5 + 2 * np.array([int(''.join(map(str, b)), 2) for b in q_raw])
tx_i = oversample_signal(i_qam.astype(float), 10)
tx_q = oversample_signal(q_qam.astype(float), 10)
tx_i = np.convolve(tx_i, rc[:64], mode='full')
tx_q = np.convolve(tx_q, rc[:64], mode='full')
tx_qam = tx_i * np.cos(2 * np.pi * fc * t) - tx_q * np.sin(2 * np.pi * fc * t)

# ===== BFSK =====
bits_fsk = bits[4*N:5*N]
sym_fsk = 2 * bits_fsk.astype(float) - 1
freq_dev = 8  # desvio de frequência
phase = np.cumsum(sym_fsk * freq_dev) * (2 * np.pi / fs)
tx_fsk = np.cos(2 * np.pi * fc * t + phase)

# ===== PLOT =====
fig = plt.figure(figsize=(20, 14))
gs = fig.add_gridspec(4, 5, hspace=0.4, wspace=0.3)

modulations = [
    ('OOK', tx_ook, None),
    ('BPSK', tx_bpsk, None),
    ('QPSK', tx_qpsk, None),
    ('16-QAM', tx_qam, None),
    ('BFSK', tx_fsk, None),
]

labels = ['OOK', 'BPSK', 'QPSK', '16-QAM', 'BFSK']
colors = ['#dc2626', '#2563eb', '#047857', '#9333ea', '#ea580c']

# Linha 1: Sinais no tempo
for i, (name, signal, _) in enumerate(modulations):
    ax = fig.add_subplot(gs[0, i])
    ax.plot(t[:2000], signal[:2000], color=colors[i], lw=0.6, alpha=0.8)
    ax.set_title(name, fontsize=11, weight='bold', color=colors[i])
    ax.set_ylabel('Amplitude')
    ax.set_xlim(0, 0.02)
    ax.grid(alpha=0.2)
    ax.tick_params(labelsize=7)

# Linha 2: Espectro
for i, (name, signal, _) in enumerate(modulations):
    ax = fig.add_subplot(gs[1, i])
    fft = np.abs(np.fft.fft(signal[:2048]))
    freqs = np.fft.fftfreq(len(signal), 1/fs) * fs
    ax.plot(freqs[:512], 20*np.log10(fft[:512] + 1e-10), color=colors[i], lw=1)
    ax.set_title('Espectro ' + name, fontsize=10, color=colors[i])
    ax.set_ylabel('PSD (dB)')
    ax.set_xlim(0, 100)
    ax.grid(alpha=0.2)
    ax.tick_params(labelsize=7)

# Linha 3: Constelações
for i, (name, signal, _) in enumerate(modulations):
    ax = fig.add_subplot(gs[2, i])
    if name == 'OOK':
        ax.scatter([0, 1], [0, 0], s=100, c=colors[i], edgecolors='white', linewidth=1)
        ax.text(0, -0.15, '0', ha='center', fontsize=10, weight='bold')
        ax.text(1, -0.15, '1', ha='center', fontsize=10, weight='bold')
    elif name == 'BPSK':
        ax.scatter([-1, 1], [0, 0], s=100, c=colors[i], edgecolors='white', linewidth=1)
        ax.text(-1, -0.15, '0', ha='center', fontsize=10, weight='bold')
        ax.text(1, -0.15, '1', ha='center', fontsize=10, weight='bold')
    elif name == 'QPSK':
        sym = np.array([[-1,-1], [-1,1], [1,1], [1,-1]])
        ax.scatter(sym[:, 0], sym[:, 1], s=100, c=colors[i], edgecolors='white', linewidth=1)
        for j, (x, y) in enumerate([(-1,-1), (-1,1), (1,1), (1,-1)]):
            ax.text(x, y*1.15, format(j, '02b'), ha='center', fontsize=9, weight='bold')
    elif name == '16-QAM':
        pts = []
        for ii in range(-1.5, 1.6, 1):
            for jj in range(-1.5, 1.6, 1):
                pts.append((ii, jj))
        pts = np.array(pts)
        ax.scatter(pts[:, 0], pts[:, 1], s=80, c=colors[i], edgecolors='white', linewidth=0.5, alpha=0.8)
        ax.set_title('16-QAM: ' + str(len(pts)) + ' pontos', fontsize=10, color=colors[i])
    elif name == 'BFSK':
        ax.scatter([fc-8, fc+8], [0, 0], s=100, c=colors[i], edgecolors='white', linewidth=1)
        ax.set_xlim(30, 70)
        ax.text(fc-8, -0.15, '0', ha='center', fontsize=10, weight='bold')
        ax.text(fc+8, -0.15, '1', ha='center', fontsize=10, weight='bold')

    ax.axhline(0, color='gray', lw=0.3)
    ax.axvline(0, color='gray', lw=0.3)
    ax.set_title('Constelação ' + name, fontsize=10, color=colors[i])
    ax.set_xlabel('I')
    ax.set_ylabel('Q')
    ax.set_aspect('equal')
    ax.grid(alpha=0.2)
    ax.tick_params(labelsize=7)

# Linha 4: BER Teórico
from scipy.special import erfc as sc_erfc
ax_ber = fig.add_subplot(gs[3, :])
EbN0_lin = np.logspace(-1, 2, 500)
EbN0_dB = 10 * np.log10(EbN0_lin)

ber_bpsk = 0.5 * sc_erfc(np.sqrt(EbN0_lin))
ber_ook = 0.5 * sc_erfc(np.sqrt(EbN0_lin / 2))
ber_fsk = 0.5 * np.exp(-EbN0_lin / 2)
ber_qam16 = (3/8) * sc_erfc(np.sqrt(0.4 * EbN0_lin))

ax_ber.semilogy(EbN0_dB, ber_bpsk, 'o-', color='#2563eb', lw=2, markersize=3, label='BPSK/QPSK')
ax_ber.semilogy(EbN0_dB, ber_qam16, 's-', color='#047857', lw=2, markersize=3, label='16-QAM')
ax_ber.semilogy(EbN0_dB, ber_ook, '^-', color='#dc2626', lw=2, markersize=3, label='OOK')
ax_ber.semilogy(EbN0_dB, ber_fsk, 'd-', color='#9333ea', lw=2, markersize=3, label='BFSK (não-coerente)')

ax_ber.axhline(1e-3, color='gray', ls='--', alpha=0.5)
ax_ber.axhline(1e-6, color='gray', ls='--', alpha=0.5)
ax_ber.axhline(1e-5, color='red', ls='--', alpha=0.3)

ax_ber.set_xlabel('$E_b/N_0$ (dB)', fontsize=12)
ax_ber.set_ylabel('BER', fontsize=12)
ax_ber.set_title('BER Teórico — Todas as Modulações Digitais', fontsize=12, weight='bold')
ax_ber.legend(loc='upper right', fontsize=9)
ax_ber.grid(True, alpha=0.3, which='both')
ax_ber.set_xlim(-2, 22)

plt.tight_layout()
plt.savefig('experimento1b_todas_modulacoes.png', dpi=150, bbox_inches='tight')
print("Experimento 1b salvo: experimento1b_todas_modulacoes.png")
print("  Comparação BER a 10^-5:")
for name, ber_func in [('BPSK/QPSK', lambda x: 0.5*sc_erfc(np.sqrt(x))),
                         ('16-QAM', lambda x: (3/8)*sc_erfc(np.sqrt(0.4*x))),
                         ('OOK', lambda x: 0.5*sc_erfc(np.sqrt(x/2))),
                         ('BFSK', lambda x: 0.5*np.exp(-x/2))]:
    eb_vals = np.linspace(0.01, 20, 10000)
    bers = ber_func(eb_vals)
    idx = np.argmin(np.abs(bers - 1e-5))
    print("    {:12s}: Eb/N0 ~ {:5.1f} dB para BER=10^-5".format(name, 10*np.log10(eb_vals[idx])))
```

#### O que observar:

- **OOK**: Sinal mais simples — liga/desliga. Menos eficiente que BPSK (~3 dB pior).
- **BPSK**: Sinal com 2 fases (0 e π). O mais robusto das modulações digitais.
- **QPSK**: Dobra a eficiência do BPSK (2 bits/símbolo) com BER similar.
- **16-QAM**: 16 pontos no plano I/Q — carrega 4 bits/símbolo, mas precisa ~10 dB a mais que BPSK.
- **BFSK**: Frequências diferentes para 0 e 1 — não precisa de sincronismo de fase, mas usa mais banda.
- **BER**: BPSK é o mais eficiente em energia. QAM ganha em eficiência espectral (bits/Hertz).

---


### Experimento 2: Espectro — O que a transformada de Fourier revela

```python
"""
Experimento 2 — Espectro de AM e FM
====================================
Visualize como a modulação "espalha" a informação no domínio da frequência.
"""
import numpy as np
import matplotlib.pyplot as plt

fs = 44100
t = np.linspace(0, 0.05, int(0.05 * fs), endpoint=False)
f_msg = 440
f_carrier = 5000
mu = 0.7
beta = 2.0

m = np.sin(2 * np.pi * f_msg * t)
carrier = np.cos(2 * np.pi * f_carrier * t)
am = (1 + mu * m) * carrier
fm = np.cos(2 * np.pi * f_carrier * t + beta * np.sin(2 * np.pi * f_msg * t))

# FFT
N = len(t)
f = np.fft.fftfreq(N, 1/fs)
am_fft = np.fft.fft(am)
fm_fft = np.fft.fft(fm)
m_fft = np.fft.fft(m)

# Espectro unilateral
pos = f > 0
f_pos = f[pos]
am_spec = 2/N * np.abs(am_fft[pos])
fm_spec = 2/N * np.abs(fm_fft[pos])
m_spec = 2/N * np.abs(m_fft[pos])

fig, axes = plt.subplots(3, 1, figsize=(14, 9))

# Mensagem
axes[0].semilogy(f_pos[:50], m_spec[:50], color='#2563eb', lw=2, marker='o')
axes[0].set_ylabel('PSD (dB)')
axes[0].set_title('Espectro do Sinal Modulante')
axes[0].grid(alpha=0.3)
axes[0].set_xlim(0, 2000)

# AM
axes[1].semilogy(f_pos, am_spec, color='#dc2626', lw=1.5)
axes[1].axvline(f_carrier - f_msg, color='#dc2626', ls='--', alpha=0.5, label='LSB')
axes[1].axvline(f_carrier, color='black', ls='--', alpha=0.3, label='Portadora')
axes[1].axvline(f_carrier + f_msg, color='#dc2626', ls='--', alpha=0.5, label='USB')
axes[1].set_ylabel('PSD (dB)')
axes[1].set_title('Espectro AM — Duas bandas laterais!')
axes[1].grid(alpha=0.3)
axes[1].set_xlim(3000, 7000)
axes[1].legend(fontsize=9)

# FM
axes[2].semilogy(f_pos, fm_spec, color='#047857', lw=1.5)
axes[2].set_xlabel('Frequência (Hz)')
axes[2].set_ylabel('PSD (dB)')
axes[2].set_title('Espectro FM — Múltiplas bandas laterais (Bessel)!')
axes[2].grid(alpha=0.3)
axes[2].set_xlim(3000, 7000)

plt.tight_layout()
plt.savefig('experimento2_espectro.png', dpi=150, bbox_inches='tight')
print("Experimento 2 salvo: experimento2_espectro.png")
print(f"  AM: 3 picos — portadora + LSB + USB (largura = 2 × f_msg)")
print(f"  FM: Múltiplos picos (funções de Bessel), banda ≈ 2·f_msg·(1+β) = {2*f_msg*(1+beta)} Hz")
```

#### O que observar:
- **AM**: Apenas 3 componentes (portadora + 2 laterais). Banda = $2f_m$
- **FM**: Múltiplas bandas laterais! A regra de Carson: $B \approx 2f_m(1+\beta)$

---

### Experimento 3: Canais com ruído — AWGN

```python
"""
Experimento 3 — Canal AWGN
===========================
Simule um sinal passando por um canal com ruído térmico Gaussiano.
Observe como o SNR afeta a qualidade da recepção.
"""
import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)
fs = 44100
t = np.linspace(0, 0.02, int(0.02 * fs), endpoint=False)
f_carrier = 5000
snr_dB = [20, 10, 3, -3]

# Sinal limpo
s = np.cos(2 * np.pi * f_carrier * t)

fig, axes = plt.subplots(2, 2, figsize=(12, 8))
axes = axes.flatten()

for i, snr in enumerate(snr_dB):
    Ps = np.mean(s**2)
    sigma = np.sqrt(Ps / 10**(snr / 10))
    n = np.random.normal(0, sigma, len(t))
    r = s + n

    axes[i].plot(t[:300], r[:300], color='#2563eb', lw=0.8, alpha=0.8)
    axes[i].plot(t[:300], s[:300], color='#dc2626', lw=0.5, alpha=0.4)
    axes[i].set_title(f'Canal AWGN — SNR = {snr} dB (σ = {sigma:.3f})')
    axes[i].set_xlabel('Tempo (s)')
    axes[i].grid(alpha=0.3)
    axes[i].set_xlim(0, 0.005)

plt.tight_layout()
plt.savefig('experimento3_awgn.png', dpi=150, bbox_inches='tight')
print("Experimento 3 salvo: experimento3_awgn.png")
for snr in snr_dB:
    Ps = 0.5
    sigma = np.sqrt(Ps / 10**(snr / 10))
    print(f"  SNR = {snr:3d} dB → σ = {sigma:.4f}")
```

#### O que observar:
- SNR = 20 dB: sinal praticamente limpo
- SNR = 10 dB: ruído visível
- SNR = 3 dB: sinal quase invisível no ruído
- SNR = −3 dB: sinal está **mais fraco** que o ruído — impossível recuperar sem diversidade/código

---

### Experimento 4: Constelações — A beleza das modulações digitais

```python
"""
Experimento 4 — Constelações BPSK, QPSK, 16-QAM, 64-QAM
=========================================================
Visualize como os símbolos são representados no plano I/Q.
"""
import numpy as np
import matplotlib.pyplot as plt
from scipy.special import erfc

np.random.seed(42)
fs = 100000
t = np.linspace(0, 0.001, fs, endpoint=False)
N_symbols = 2000
bits_per_sym = [1, 2, 4, 6]  # BPSK, QPSK, 16-QAM, 64-QAM
mod_names = ['BPSK', 'QPSK', '16-QAM', '64-QAM']

# Gerar símbolos
np.random.seed(42)
all_bits = np.random.randint(0, 2, N_symbols * max(bits_per_sym))

fig, axes = plt.subplots(1, 4, figsize=(16, 4))

for idx, (bps, name) in enumerate(zip(bits_per_sym, mod_names)):
    symbols_bits = all_bits[:N_symbols * bps]
    # Mapear bits para símbolos
    if bps == 1:  # BPSK
        sym = 2 * symbols_bits.reshape(-1, 1).astype(float) - 1  # ±1
    elif bps == 2:  # QPSK
        i_bits = symbols_bits[::2]
        q_bits = symbols_bits[1::2]
        sym = np.column_stack((2*i_bits-1, 2*q_bits-1))
    elif bps == 4:  # 16-QAM (Gray)
        raw = symbols_bits.reshape(-1, 4)
        i_bits = raw[:, [0, 1]]
        q_bits = raw[:, [2, 3]]
        i_sym = -1.5 + 2 * np.array([int(b, 2) for b in map(''.join, i_bits)])
        q_sym = -1.5 + 2 * np.array([int(b, 2) for b in map(''.join, q_bits)])
        sym = np.column_stack((i_sym, q_sym))
    elif bps == 6:  # 64-QAM
        raw = symbols_bits.reshape(-1, 6)
        i_bits = raw[:, [0, 1, 2]]
        q_bits = raw[:, [3, 4, 5]]
        i_sym = -3 + 2 * np.array([int(b, 2) for b in map(''.join, i_bits)])
        q_sym = -3 + 2 * np.array([int(b, 2) for b in map(''.join, q_bits)])
        sym = np.column_stack((i_sym, q_sym))

    # Normalizar
    E = np.mean(np.sum(sym**2, axis=1))
    sym = sym / np.sqrt(E)

    ax = axes[idx]
    ax.scatter(sym[:, 0], sym[:, 1], s=20, alpha=0.7, color='#2563eb', edgecolors='white', linewidth=0.5)
    ax.axhline(0, color='black', lw=0.3)
    ax.axvline(0, color='black', lw=0.3)
    num_sym = len(np.unique(sym, axis=0)) if len(np.unique(sym, axis=0))>1 else 2**bps
    ax.set_title('{}: {} símbolos, {} bits/símbolo'.format(name, int(np.log2(num_sym)), bps))
    ax.set_xlabel('I (in-phase)')
    ax.set_ylabel('Q (quadrature)')
    ax.set_aspect('equal')
    ax.grid(alpha=0.3)
    ax.set_xlim(ax.get_xlim()[0]*1.15, ax.get_xlim()[1]*1.15)
    ax.set_ylim(ax.get_ylim()[0]*1.15, ax.get_ylim()[1]*1.15)

plt.tight_layout()
plt.savefig('experimento4_constelacoes.png', dpi=150, bbox_inches='tight')
print("Experimento 4 salvo: experimento4_constelacoes.png")
print("  Cada ponto = um símbolo digital representado por (I, Q)")

# BER teórico
EbN0_lin = np.logspace(-1, 2, 500)
EbN0_dB = 10 * np.log10(EbN0_lin)

fig2, ax2 = plt.subplots(figsize=(10, 6))
for bps, name in zip(bits_per_sym, mod_names):
    M = 2**bps
    if bps == 1:  # BPSK
        ber = 0.5 * erfc(np.sqrt(EbN0_lin))
    elif bps == 2:  # QPSK ≈ BPSK em BER
        ber = 0.5 * erfc(np.sqrt(EbN0_lin))
    elif bps == 4:  # 16-QAM aproximada
        ber_approx = (3/8) * erfc(np.sqrt(0.4 * EbN0_lin))
        ber = np.minimum(1, ber_approx)
    elif bps == 6:  # 64-QAM aproximada
        ber_approx = (7/16) * erfc(np.sqrt(np.log2(64)/7 * EbN0_lin))
        ber = np.minimum(1, ber_approx)

    ax2.semilogy(EbN0_dB, ber, lw=2.5, label=f'{name}')

ax2.axhline(1e-3, color='#dc2626', ls='--', alpha=0.5)
ax2.axhline(1e-6, color='#047857', ls='--', alpha=0.5)
ax2.set_xlabel('$E_b/N_0$ (dB)')
ax2.set_ylabel('Probabilidade de Erro de Bit (BER)')
ax2.set_title('BER Teórico: BPSK, QPSK, 16-QAM, 64-QAM')
ax2.legend(fontsize=11)
ax2.grid(True, alpha=0.3, which='both')
ax2.set_xlim(-10, 20)
plt.tight_layout()
plt.savefig('experimento4_ber.png', dpi=150, bbox_inches='tight')
print("  BER salvo: experimento4_ber.png")
```

#### O que observar:
- **BPSK**: 2 pontos no eixo I (±1) — o mais simples, o mais robusto
- **QPSK**: 4 pontos nos 4 quadrantes — 2 bits/símbolo
- **16-QAM**: 16 pontos num grid 4×4 — 4 bits/símbolo, mas mais vulnerável ao ruído
- **64-QAM**: 64 pontos — 6 bits/símbolo, requer SNR alto (~20 dB para BER=10⁻⁶)
- O gráfico de BER mostra que QPSK/BPSK têm o mesmo desempenho, mas 16/64-QAM precisam de mais energia por bit

---

### Experimento 5: Diagrama de Olho — Diagnosticando ISI

```python
"""
Experimento 5 — Olho Digital (Eye Diagram)
============================================
O diagrama de olho revela Interferência Entre Símbolos (ISI).
Olho aberto = canal bom. Olho fechado = canal problemático.
"""
import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import firwin, lfilter

np.random.seed(42)
fs = 100000
Rs = 10000         # Taxa de símbolos = 10 kbaud
oversample = fs // Rs  # 10 amostras por símbolo
N_symbols = 5000

# Bits aleatórios
bits = np.random.randint(0, 2, N_symbols)
symbols = 2 * bits - 1  # NRZ: ±1

# Upsample
tx = np.repeat(symbols, oversample)
t = np.arange(len(tx)) / fs

# Canais diferentes
def raised_cosine(N, alpha, Ts):
    """Filtro raised cosine."""
    n = np.arange(-N, N+1)
    if alpha == 0:
        h = np.sinc(n / Ts)
    else:
        sinc_vals = np.sinc(n / Ts)
        cos_vals = np.cos(np.pi * alpha * n / Ts)
        denom = 1 - (2 * alpha * n / Ts)**2
        h = np.where(np.abs(denom) < 1e-10, 0, sinc_vals * cos_vals / denom)
    h[N] = 0.5 * (1 + np.sin(np.pi/alpha) / (np.pi/alpha))
    return h / np.sum(h)

rc = raised_cosine(32, 0.25, 1/Rs)

# Canal 1: ideal (apenas RC)
rx1 = lfilter(rc, 1, tx)

# Canal 2: com ISI (filter desbalanceado)
rc_bad = raised_cosine(32, 0.75, 1/Rs)
rx2 = lfilter(rc_bad, 1, tx) * 0.8 + 0.2 * np.roll(lfilter(rc_bad, 1, tx), 3)

# Canal 3: com ruído SNR=15 dB
noise = np.random.normal(0, np.std(rx2)/np.sqrt(10**(15/10)), len(rx2))
rx3 = rx2 + noise

# Montar diagrama de olho
def eye_diagram(signal, Rs, fs, N_eye=500):
    """Monta diagrama de olho."""
    symbols_long = np.arange(0, len(signal)) / fs * Rs
    symbol_indices = np.floor(symbols_long).astype(int)
    samples_per_sym = fs // Rs
    half_eye = samples_per_sym // 2

    segments = []
    for i in range(N_eye):
        start = symbol_indices[i] * samples_per_sym
        seg = signal[start:start+2*half_eye]
        if len(seg) == 2*half_eye:
            segments.append(seg)
    segments = np.array(segments)
    t_eye = np.arange(2*half_eye) / fs * 1000  # ms
    return t_eye, segments.T

fig, axes = plt.subplots(3, 1, figsize=(14, 9))

# Canal 1 — ideal
t_eye, eye1 = eye_diagram(rx1, Rs, fs)
axes[0].plot(t_eye, eye1, color='#2563eb', lw=0.3, alpha=0.4)
axes[0].axhline(0, color='white', lw=0.5, alpha=0.5)
axes[0].set_ylabel('Amplitude')
axes[0].set_title('Olho Digital — Canal Ideal (α=0.25) — OLHO ABERTO ✓')
axes[0].set_xlabel('Tempo (ms)')
axes[0].grid(alpha=0.3)

# Canal 2 — ISI
t_eye, eye2 = eye_diagram(rx2, Rs, fs)
axes[1].plot(t_eye, eye2, color='#dc2626', lw=0.3, alpha=0.4)
axes[1].axhline(0, color='white', lw=0.5, alpha=0.5)
axes[1].set_ylabel('Amplitude')
axes[1].set_title('Olho Digital — Canal com ISI (α=0.75) — OLHO PARCIALMENTE FECHADO ⚠')
axes[1].set_xlabel('Tempo (ms)')
axes[1].grid(alpha=0.3)

# Canal 3 — com ruído
t_eye, eye3 = eye_diagram(rx3, Rs, fs)
axes[2].plot(t_eye, eye3, color='#047857', lw=0.3, alpha=0.4)
axes[2].axhline(0, color='white', lw=0.5, alpha=0.5)
axes[2].set_ylabel('Amplitude')
axes[2].set_title('Olho Digital — Canal com Ruído (SNR=15 dB) — OLHO NUVENTO 🔍')
axes[2].set_xlabel('Tempo (ms)')
axes[2].grid(alpha=0.3)

plt.tight_layout()
plt.savefig('experimento5_olho.png', dpi=150, bbox_inches='tight')
print("Experimento 5 salvo: experimento5_olho.png")
print("  Olho aberto = fácil decisão de bits (sem ISI)")
print("  Olho fechado = ISI severa (equalização necessária!)")
```

#### O que observar:
- **Canal ideal**: Olho bem aberto — decisão de bits fácil e confiável
- **Com ISI**: Olho começa a fechar — risco de decisão errada
- **Com ruído**: Olho "nuvento" — a abertura diminui, mas ainda decidível
- Este é um dos diagramas mais importantes na prática de comunicações!

---

### Experimento 6: Limites de Shannon — O impossível se torna possível

```python
"""
Experimento 6 — Capacidade de Shannon
======================================
Descubra o limite absoluto de qualquer sistema de comunicação.
"""
import numpy as np
import matplotlib.pyplot as plt
from scipy.special import erfc

# Limite de Shannon
eta = np.linspace(0.01, 12, 1000)
EbN0_shannon = (2**eta - 1) / eta
EbN0_shannon_dB = 10 * np.log10(EbN0_shannon)
EbN0_min = 10 * np.log10(np.log(2))  # -1.59 dB

# BER prático
EbN0_prac = np.linspace(-3, 25, 500)
EbN0_lin = 10**(EbN0_prac/10)
BER_BPSK = 0.5 * erfc(np.sqrt(EbN0_lin))

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

# Esquerda: Shannon
ax1.plot(eta, EbN0_shannon_dB, color='#2563eb', lw=3, label='Limite de Shannon')
ax1.axhline(EbN0_min, color='#dc2626', ls='--', lw=2, label=f'Limite inferior: {EbN0_min:.2f} dB')
ax1.axvline(1, color='#64748b', ls='--', alpha=0.5, label='η = 1 (BPSK)')
ax1.axhline(0, color='#047857', ls='--', alpha=0.5, label='Eb/N₀ = 0 dB')
ax1.set_xlabel('Eficiência Espectral η (bit/s/Hz)')
ax1.set_ylabel('Eb/N₀ mínimo (dB)')
ax1.set_title('Limite Fundamental de Shannon')
ax1.set_xlim(0, 12); ax1.set_ylim(-2, 20)
ax1.grid(alpha=0.3)
ax1.legend(fontsize=10)
ax1.annotate('BPSK\n(η=1)', xy=(1, 0), xytext=(3, 5),
             arrowprops=dict(arrowstyle='->', color='#dc2626'),
             fontsize=10, color='#dc2626', weight='bold')

# Direita: BER
for name, bps in [('BPSK', 1), ('QPSK', 2), ('16-QAM', 4), ('64-QAM', 6)]:
    if bps <= 2:
        ber = 0.5 * erfc(np.sqrt(EbN0_lin))
    elif bps == 4:
        ber = (3/8) * erfc(np.sqrt(0.4 * EbN0_lin))
    else:
        ber = (7/16) * erfc(np.sqrt(np.log2(64)/7 * EbN0_lin))
    ax2.semilogy(EbN0_prac, np.minimum(ber, 1), lw=2.5, label=name)

ax2.axhline(1e-3, color='#dc2626', ls='--', alpha=0.5, label='BER = 10⁻³')
ax2.axhline(1e-6, color='#047857', ls='--', alpha=0.5, label='BER = 10⁻⁶')
ax2.set_xlabel('$E_b/N_0$ (dB)')
ax2.set_ylabel('Probabilidade de Erro de Bit (BER)')
ax2.set_title('Desempenho Prático vs. Teórico')
ax2.set_xlim(-3, 25)
ax2.grid(True, alpha=0.3, which='both')
ax2.legend(fontsize=10)

plt.tight_layout()
plt.savefig('experimento6_shannon.png', dpi=150, bbox_inches='tight')
print("Experimento 6 salvo: experimento6_shannon.png")
print(f"\n  Limite fundamental de Shannon: Eb/N₀ ≥ {EbN0_min:.2f} dB")
print(f"  Para η=1 (BPSK): Eb/N₀ mínimo = 0 dB")
print(f"  Para η=6 (64-QAM): Eb/N₀ mínimo = {10*np.log10((2**6-1)/6):.1f} dB")

# Tabela comparativa
print("\n  ┌──────────┬───────────────┬──────────┬─────────────┐")
print("  │ Modulação│   η (bit/s/Hz)│ BER=10⁻⁵│ Gap Shannon │")
print("  ├──────────┼───────────────┼──────────┼─────────────┤")
for name, bps in [('BPSK', 1), ('QPSK', 2), ('16-QAM', 4), ('64-QAM', 6)]:
    gap = 10*np.log10((2**bps - 1)/bps)
    ber_bpsk = 0.5 * erfc(np.sqrt(10**(gap/10)))
    print(f"  │ {name:8s}│ {gap:13.1f} │ {np.log10(ber_bpsk):8.1f} │ {gap - EbN0_min:11.1f} dB │")
print("  └──────────┴───────────────┴──────────┴─────────────┘")
```

#### O que observar:
- Existe um **limite absoluto**: $E_b/N_0 \ge \ln 2 = -1.59$ dB
- Nenhum sistema do universo pode operar abaixo disso
- BPSK opera a 0 dB — apenas 1.59 dB do limite
- 64-QAM precisa de ~13.5 dB — muito acima do limite, mas carrega 6× mais bits/Hertz
- O "gap" entre implementação prática e Shannon diminui com códigos melhores (Turbo, LDPC)

---

## 7. Métricas Fundamentais

### As grandezas que importam

| Grandeza | Símbolo | Fórmula | O que diz |
|---|---|---|---|
| **Taxa de bits** | $R_b$ | bits/seg | Quantos bits enviamos por segundo |
| **Taxa de símbolo** | $R_s$ | $1/T_s$ | Quantos símbolos enviamos por segundo |
| **Eficiência espectral** | $\eta$ | $R_b/B$ | Quantos bits/Hertz — "quão apertado" |
| **SNR** | — | $P_s/P_n$ | Sinal vs. ruído |
| **Eb/N₀** | — | SNR/$\eta$ | Energia por bit vs. densidade de ruído — universal! |
| **BER** | $P_b$ | — | Fraction de bits errados |
| **Capacidade** | $C$ | $B\log_2(1+\text{SNR})$ | Limite supremo do canal |

### A grande revelação: $E_b/N_0$ é universal

Independentemente da modulação ou banda, podemos comparar sistemas usando $E_b/N_0$. É a "moeda universal" das comunicações:

$$\frac{E_b}{N_0} = \frac{\text{SNR}}{\eta}$$

Isso significa que podemos comparar BPSK com 1 MHz de banda e 16-QAM com 4 MHz de banda no mesmo gráfico!

---

## 8. Roteiro do Semestre

### Plano de Aulas

| Semana | Tema | Atividade |
|---|---|---|
| **1** | **Aula inaugural** — visão geral, modelo, modulação | Experimentos 1, 1b–6 ✅ |
| **2** | Sinais, Fourier, PSD, ruído térmico | Lab: FFT e espectro |
| **3** | Orçamento de enlace, Friis, cascata de ruído | Lab: link budget |
| **4** | AM — DSB-SC, convencional, envelope | Lab: modular/demodular AM |
| **5** | AM — SSB, VSB | Lab: SSB com filtro de Hilbert |
| **6** | FM — NBFM, WBFM, Bessel, Carson | Lab: FM com PLL |
| **7** | Banda base — Nyquist, ISI, raised cosine | Lab: olho digital |
| **8** | **Prova 1** (conteúdo semanas 1–7) | |
| **9** | Digital — ASK, OOK, FSK | Lab: BER Monte Carlo |
| **10** | Digital — BPSK, QPSK, M-PSK | Lab: constelações no canal |
| **11** | Digital — QAM quadrada | Lab: QAM com Gray coding |
| **12** | Equalização — ZF, MMSE | Lab: equalizar canal com ISI |
| **13** | Equalização adaptativa — LMS | Lab: LMS em tempo real |
| **14** | Sincronismo — fase, timing, quadro | Lab: Costas loop, Gardner |
| **15** | Códigos corretores — Hamming, convolucionais | Lab: decoder Viterbi |
| **16** | **Projeto final** — receptor QPSK completo | Apresentação |
| **17** | **Prova 2** + revisão geral | |

### Laboratórios

Cada módulo terá exercícios práticos em Python. Recomendamos:

- **NumPy** para operações vetoriais
- **SciPy** para filtros e funções especiais
- **Matplotlib** para constelações, espectros, olhos, BER
- **Seed fixo** (`np.random.seed(42)`) para reprodutibilidade
- **Sempre formular uma previsão antes de rodar** — depois compare com o resultado

### Projeto Integrador

No final do semestre, você implementará um **receptor digital completo** com:

- Modulador QPSK/16-QAM
- Canal AWGN + multipercursos
- Demodulador coerente
- Equalizador LMS
- Síndrome de frame sync
- Medição de BER vs. Eb/N₀

---

## 9. Metodologia e Avaliação

### Como esta disciplina funciona

| Componente | Peso | Descrição |
|---|---|---|
| Prova teórica 1 | 30% | Semanas 1–7 (Fourier, ruído, modulação analógica) |
| Prova teórica 2 | 30% | Semanas 9–16 (digital, equalização, sincronismo, código) |
| Laboratórios | 20% | 8 relatórios de experimentos Python |
| Projeto final | 20% | Receptor digital completo em Python |

### Ferramentas

```bash
# Ambiente recomendado
python==3.12
numpy>=1.26
scipy>=1.13
matplotlib>=3.9
```

### Referências

| Livro | Autor | Uso principal |
|---|---|---|
| *Digital Communications* | Proakis & Salehi | Teoremas, BER, constelações |
| *Communication Systems* | Haykin | Introdução, FM, AM |
| *Digital Communications* | Sklar | Prática, Monte Carlo |
| *Wireless Communications* | Goldsmith | Fading, OFDM |

---

## 10. Exercício de Fixação

**Resolva agora (5 minutos) — depois discutimos:**

### Questão 1
Um sistema opera com $B = 10$ MHz e SNR = 30 dB. Qual a capacidade máxima de Shannon?

### Questão 2
Você precisa transmitir vídeo HD a 20 Mbit/s. Qual a banda mínima necessária com:
a) BPSK?  
b) 64-QAM?

### Questão 3
Um receptor tem:
- LNA: $G = 20$ dB, $NF = 1.5$ dB
- Mixer: $G = -5$ dB, $NF = 8$ dB
- IF Amplifier: $G = 15$ dB, $NF = 4$ dB

Qual a figura de ruído total? (Use a fórmula de Friis em cascata)

### Questão 4
Qual a diferença fundamental entre AM e FM em termos de:
a) O que varia no sinal?  
b) Imunidade a ruído?  
c) Largura de banda?

---

> **Resumo da aula:** Vimos que comunicar é transferir informação por canais imperfeitos, exploramos **todas as modulações principais** (AM, DSB-SC, SSB, VSB, FM, OOK, BPSK, QPSK, 16-QAM, BFSK) com fórmulas, propriedades e aplicações reais, que existem limites fundamentais (Shannon), e que Python nos permite visualizar tudo isso na prática. No próximo encontro, mergulharemos em Fourier, PSD e ruído térmico — a base matemática de tudo.

> 📌 **Para a próxima aula:** Revisar transformada de Fourier (integrais, propriedades) e distribuição Gaussiana.

---

*Documento gerado para a aula inaugural de Sistemas de Comunicações — UFSC 2026/2*  
*Prof. Laio Oriel Seman*
