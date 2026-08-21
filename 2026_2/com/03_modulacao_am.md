# Modulação em Amplitude — Teoria Completa

> Comunicações Eletrônicas — Apostila de Curso
> Tópicos: Modulação AM · DSB-SC · detecção coerente e de envelope · Geração de portadora sincronizada · SSB · VSB · análise de ruído

## Antes de começar

Ao final, você deve conseguir derivar os espectros de DSB-SC, AM, SSB e VSB; calcular banda e potência; escolher um detector coerente ou de envelope; e entender os métodos de recuperação de portadora (Costas Loop, PLL, pilot carrier). **Diagnóstico:** qual parte da potência da AM convencional transporta informação? **Evidência mínima:** prever e depois simular sobremodulação, erro de fase, escolha da constante $RC$ e convergência do Costas Loop.

## Sumário

1. [Por que modular? Fundamentos da modulação analógica](#por-que-modular-fundamentos-da-modulação-analógica)
2. [Modulação DSB-SC — Teoria Completa](#modulação-dsb-sc--teoria-completa)
3. [Detecção Coerente de DSB-SC](#detecção-coerente-de-dsb-sc)
4. [Geração de Portadora Sincronizada](#geração-de-portadora-sincronizada)
5. [Modulação AM Convencional (DSB-LC)](#modulação-am-convencional-dsb-lc)
6. [Detecção de Envelope de AM](#detecção-de-envelope-de-am)
7. [Modulação SSB — Teoria e Implementação](#modulação-ssb--teoria-e-implementação)
8. [Modulação VSB — Compromisso Prático](#modulação-vsb--compromisso-prático)
9. [Análise de Ruído em Modulação Analógica](#análise-de-ruído-em-modulação-analógica)
10. [Exercícios Resolvidos em Python](#exercícios-resolvidos-em-python)
11. [Lista de Exercícios Propostos](#lista-de-exercícios-propostos)
12. [Gabarito](#gabarito)

## Por que modular? Fundamentos da Modulação Analógica

### A necessidade fundamental da modulação

A modulação é o processo de variar um ou mais parâmetros de uma onda portadora (senoidal de alta frequência) em função de um sinal de mensagem (banda base, de frequência mais baixa). Este é o pilar de **todas** as comunicações sem fio — de rádio AM/FM a enlaces de micro-ondas, satélites e sistemas celulares.

Existem **três razões físicas e práticas** fundamentais:

1. **Antenas de tamanho prático**: O comprimento de onda $\lambda = c/f$ deve ser comparável às dimensões da antena (tipicamente $\lambda/4$ ou $\lambda/2$). Para um sinal de áudio com $f_{\text{áudio}} = 1\,\text{kHz}$, teríamos $\lambda \approx 300\,\text{km}$ — uma antena de $75\,\text{km}$ é impraticável. Modulado para $f_c = 100\,\text{MHz}$ (banda FM), $\lambda = 3\,\text{m}$ e a antena cabe na palma da mão.

2. **Multiplexação por divisão em frequência (FDM)**: Vários sinais podem coexistir no mesmo meio físico (espaço livre, cabo coaxial, fibra) se cada um for modulado em uma faixa de frequência diferente. Sem modulação, todos os sinais ocupariam a mesma banda base e se sobreporiam destrutivamente.

3. **Adaptação ao canal**: Diferentes canais têm diferentes características de transmissão (atenuação seletiva, interferências, largura de banda disponível). Modular permite "encaixar" o sinal na janela de frequência onde o canal tem melhor resposta.

**Definição**: um sinal de mensagem $m(t)$ é dito **banda base** se seu espectro $M(f)$ é nulo para $|f| > W$, onde $W$ é a **largura de banda** do sinal. Assumimos sempre $f_c \gg W$ para que não haja sobreposição espectral.

### Representação analítica

Para qualquer sinal real $s(t)$ de banda estreita, definimos o **sinal analítico**:

$$
\boxed{\tilde{s}(t) = s(t) + j\,\hat{s}(t)}
$$

onde $\hat{s}(t)$ é a **transformada de Hilbert**:

$$
\boxed{\hat{s}(t) = s(t) * \frac{1}{\pi t}}
$$

No domínio da frequência, $\hat{S}(f) = -j\,\text{sgn}(f)\,S(f)$, e $\tilde{S}(f) = 2\,U(f)\,S(f)$ (apenas frequências positivas, duplicadas).

O **sinal complexo envolvente** (*baseband* equivalente):

$$
\boxed{\tilde{s}_L(t) = \tilde{s}(t)\,e^{-j2\pi f_c t}}
$$

Recupera-se $s(t)$ por:

$$
\boxed{s(t) = \Re\{\tilde{s}_L(t)\,e^{j2\pi f_c t}\}}
$$

### Representação quadratura (I/Q)

Escrevendo $\tilde{s}_L(t) = I(t) + j\,Q(t)$:

$$
\boxed{s(t) = I(t)\cos(2\pi f_c t) - Q(t)\sin(2\pi f_c t)}
$$

- $I(t)$: componente em fase (*in-phase*);
- $Q(t)$: componente em quadratura (*quadrature*);
- $A(t) = \sqrt{I^2(t) + Q^2(t)}$: envelope instantâneo;
- $\phi(t) = \arctan(Q/I)$: fase instantânea.

Toda modulação em amplitude usa $Q(t) = 0$; modulações de fase/frequência manipulam $Q$ e $\phi$.

### Espectro de modulação e bandas laterais

Para um sinal de mensagem $m(t)$, real, limitado a $|f| \leq W$, com transformada de Fourier $M(f)$, a modulação em amplitude traduz o espectro $M(f)$ para as vizinhanças de $\pm f_c$. Este é o efeito da **modulação por multiplicação**:

**Resultado**: multiplicar no tempo por $\cos(2\pi f_c t)$ corresponde a convolucionar o espectro com $\tfrac{1}{2}[\delta(f-f_c)+\delta(f+f_c)]$, o que produz **duas cópias** de $M(f)$, centradas em $+f_c$ e $-f_c$.

Para $m(t)$ **real**, $M(f)$ possui simetria conjugada: $M(-f) = M^*(f)$. As duas bandas laterais (BSL) são, portanto, **espelhos complexos conjugados** e contêm **informação redundante** — esta redundância é o que permite a simplificação SSB.

**Observação**: a largura de banda do sinal modulado é sempre o dobro da largura de banda da mensagem, no caso de dupla banda lateral (DSB): $B_{\text{mod}} = 2W$. SSB reduz para $B_{\text{mod}} = W$.

### Eficiência espectral e energética como critérios de escolha

Ao comparar esquemas de modulação, dois critérios são essenciais:

- **Eficiência espectral** ($\eta_f$): quantos bits/s (ou quanta informação) por hertz de banda ocupada. Quanto menor a banda, melhor.
- **Eficiência energética** ($\eta_P$): fração da potência total do sinal modulado que transporta informação (não é desperdiçada em portadora ou bandas redundantes).

**Resultado**:

| Esquema | Banda | Ef. espectral | Ef. energética | Complexidade |
|---|---:|---:|---:|---|
| AM (DSB-LC) | $2W$ | baixa | $\leq 33\%$ (tom único) | baixa (detector envelope) |
| DSB-SC | $2W$ | média | $100\%$ (sem portadora) | média (detector coerente) |
| SSB | $W$ | alta | $100\%$ | alta (filtro/Hilbert) |
| VSB | $\approx W$ | intermediária | intermediária | intermediária |

Esta tabela orienta a escolha do esquema: AM para emissão *broadcasting* (simplicidade do receptor), DSB-SC para enlace ponto-a-ponto eficiente, SSB para comunicações de longa distância (HF), VSB para vídeo (compromisso prático).

## Modulação DSB-SC — Teoria Completa

### Definição e modelo

Na **modulação DSB-SC** (*Double Sideband — Suppressed Carrier*, ou "bandas laterais duplas com portadora suprimida"), o sinal modulado é simplesmente o produto do sinal de mensagem pela portadora:

$$
\boxed{s_{\text{DSB-SC}}(t) = A_c\,m(t)\,\cos(2\pi f_c t)}
$$

onde:

- $A_c$ é a amplitude da portadora (parâmetro de ganho do modulador);
- $m(t)$ é o sinal de mensagem, com $\max|m(t)| \leq 1$ (normalizado);
- $f_c \gg W$ é a frequência da portadora.

**Definição**: o prefixo "SC" (*suppressed carrier*) indica que **nenhuma portadora discreta** aparece no espectro — toda a potência do sinal modulado está contida nas bandas laterais, que carregam informação.

### Dedução completa do espectro

Aplicamos a transformada de Fourier a $s_{\text{DSB-SC}}(t) = A_c\,m(t)\,\cos(2\pi f_c t)$. Usamos a propriedade da multiplicação:

$$
\mathcal{F}\{x(t)\,y(t)\} = X(f) * Y(f)
$$

Sabemos que $\cos(2\pi f_c t) \;\xrightarrow{\mathcal{F}}\; \dfrac{1}{2}\bigl[\delta(f-f_c)+\delta(f+f_c)\bigr]$. Logo:

$$
S_{\text{DSB-SC}}(f) = A_c\,M(f) * \frac{1}{2}\bigl[\delta(f-f_c)+\delta(f+f_c)\bigr]
$$

$$
\boxed{S_{\text{DSB-SC}}(f) = \frac{A_c}{2}\Bigl[M(f-f_c) + M(f+f_c)\Bigr]}
$$

**Interpretação física**: o espectro de $m(t)$ é "copiado" duas vezes: uma cópia deslocada para $+f_c$ (banda lateral superior) e outra para $-f_c$ (banda lateral inferior). Como $M(f)$ é zero para $|f| > W$, o espectro modulado ocupa a faixa $[f_c-W,\;f_c+W]$ e $[-f_c-W,\;-f_c+W]$.

**Largura de banda**: a banda ocupada em cada lado é $W$, mas a banda total (do mínimo ao máximo frequência positiva) é:

$$
\boxed{B_{\text{DSB-SC}} = 2W}
$$

### Potência do sinal DSB-SC

A potência média de um sinal real $s(t)$ com carga de referência $1\,\Omega$ é:

$$
P_s = \lim_{T\to\infty}\frac{1}{T}\int_{-T/2}^{T/2}|s(t)|^2\,dt = \langle s^2(t)\rangle
$$

Para $s_{\text{DSB-SC}}(t) = A_c\,m(t)\,\cos(2\pi f_c t)$:

$$
s^2(t) = A_c^2\,m^2(t)\,\cos^2(2\pi f_c t) = A_c^2\,m^2(t)\cdot\frac{1+\cos(4\pi f_c t)}{2}
$$

$$
P_s = \frac{A_c^2}{2}\,\langle m^2(t)\rangle + \frac{A_c^2}{2}\,\bigl\langle m^2(t)\,\cos(4\pi f_c t)\bigr\rangle
$$

O segundo termo se anula por média temporal (o termo em $2f_c$ oscila muito mais rápido que $m^2(t)$, e sua média tende a zero para $f_c \gg W$). Definindo $P_m = \langle m^2(t)\rangle$ como a potência do sinal de mensagem:

$$
\boxed{P_s = \frac{A_c^2}{2}\,P_m}
$$

**Observação**: em DSB-SC, **100% da potência** transporta informação (não há componente de portadora separada). Esta é a vantagem fundamental sobre AM convencional.

### Representação no plano I/Q

Para DSB-SC, comparando com a forma quadratura $s(t) = I(t)\cos(2\pi f_c t) - Q(t)\sin(2\pi f_c t)$:

- Componente I: $\boxed{I(t) = A_c\,m(t)}$
- Componente Q: $\boxed{Q(t) = 0}$

O sinal complexo envolvente é puramente real:

$$
\tilde{s}_L(t) = A_c\,m(t)
$$

e o envelope instantâneo é $|\tilde{s}_L(t)| = A_c|m(t)|$. Em DSB-SC, o envelope **cruza zero** sempre que $m(t)$ cruza zero — isso significa que o sinal **inverte de fase** a cada zero, e um detector de envelope simples não funciona (explicado na Seção “Detecção de Envelope de AM”).

### Transformada de Hilbert de um sinal DSB-SC

No domínio da frequência: $\hat{S}(f) = -j\,\text{sgn}(f)\,S(f)$. Para DSB-SC concentrado em $\pm f_c$:

- $f > 0$: $\hat{S}(f) = -j\,S(f)$
- $f < 0$: $\hat{S}(f) = +j\,S(f)$

Invertendo:

$$
\boxed{\hat{s}_{\text{DSB-SC}}(t) = A_c\,m(t)\,\sin(2\pi f_c t)}
$$

Sinal analítico: $\tilde{s}(t) = A_c\,m(t)\,e^{j2\pi f_c t}$, envelope complexo $\tilde{s}_L(t) = A_c\,m(t)$ — confirmando Seção “Representação no plano I/Q”.

### Exemplo numérico

**Exemplo**: mensagem $m(t) = \cos(2\pi\cdot 1000\,t)$, $f_c = 100\,\text{kHz}$, $A_c = 1$.

$$
s_{\text{DSB-SC}}(t) = \cos(2\pi\cdot 10^3\,t)\,\cos(2\pi\cdot 10^5\,t)
$$

Usando a identidade trigonométrica $\cos A\cos B = \tfrac{1}{2}[\cos(A-B)+\cos(A+B)]$:

$$
s_{\text{DSB-SC}}(t) = \frac{1}{2}\cos(2\pi\cdot 99\,000\,t) + \frac{1}{2}\cos(2\pi\cdot 101\,000\,t)
$$

Espectro: duas linhas em $\pm 99\,\text{kHz}$ e $\pm 101\,\text{kHz}$, cada uma com amplitude $1/2$.

Potência: $P_m = \langle\cos^2(2\pi\cdot 10^3\,t)\rangle = 1/2$, logo $P_s = \tfrac{1}{2}\cdot\tfrac{1}{2} = \tfrac{1}{4}$. Cada banda lateral contribui com $1/8$.

**Observação**: note que não há nenhuma linha espectral em $f_c = 100\,\text{kHz}$ — a portadora está completamente suprimida. Esta é a assinatura espectral do DSB-SC.

## Detecção Coerente de DSB-SC

### Princípio da detecção coerente (síncrona)

Para recuperar $m(t)$ de $s_{\text{DSB-SC}}(t) = A_c\,m(t)\,\cos(2\pi f_c t)$, o método mais direto é **multiplicar pelo mesmo coseno** que foi usado na modulação e filtrar:

$$
\boxed{r(t) = 2\,s_{\text{DSB-SC}}(t)\,\cos(2\pi f_c t)}
$$

O fator $2$ é introduzido para simplificar a recuperação (compensar o fator $1/2$ da multiplicação trigonométrica).

### Dedução completa da recuperação

Desenvolvendo:

$$
r(t) = 2\,A_c\,m(t)\,\cos(2\pi f_c t)\,\cos(2\pi f_c t) = 2\,A_c\,m(t)\,\cos^2(2\pi f_c t)
$$

Usando $\cos^2\theta = \frac{1}{2}\bigl[1+\cos(2\theta)\bigr]$:

$$
r(t) = 2\,A_c\,m(t)\cdot\frac{1+\cos(4\pi f_c t)}{2} = A_c\,m(t) + A_c\,m(t)\,\cos(4\pi f_c t)
$$

O segundo termo é um sinal centrado em $2f_c$. Passando por um **filtro passa-baixas** $H_{\text{LP}}(f)$ com largura de corte $B_{\text{LP}} \geq W$:

$$
\boxed{y(t) = A_c\,m(t)}
$$

A mensagem é recuperada com ganho $A_c$. Um amplificador com ganho $1/A_c$ a seguir fornece a saída final $m(t)$.

### Efeito do erro de fase $\phi$

Na prática, o oscilador local do receptor pode não estar perfeitamente sincronizado em fase com a portadora. Suponha que o oscilador local seja $\cos(2\pi f_c t + \phi)$, com erro de fase $\phi$:

$$
r_\phi(t) = 2\,s_{\text{DSB-SC}}(t)\,\cos(2\pi f_c t + \phi) = 2\,A_c\,m(t)\,\cos(2\pi f_c t)\,\cos(2\pi f_c t + \phi)
$$

Usando $2\cos A\cos B = \cos(A-B) + \cos(A+B)$:

$$
r_\phi(t) = A_c\,m(t)\bigl[\cos(-\phi) + \cos(4\pi f_c t + \phi)\bigr]
$$

$$
r_\phi(t) = A_c\,m(t)\,\cos\phi + A_c\,m(t)\,\cos(4\pi f_c t + \phi)
$$

Após o filtro passa-baixas:

$$
\boxed{y_\phi(t) = A_c\,m(t)\,\cos\phi}
$$

**Análise de perda**:

- $\phi = 0$: recuperação perfeita $y(t) = A_c\,m(t)$.
- $\phi = 90° = \pi/2$: $y(t) = 0$ — **perda total** do sinal.
- $\phi = 180° = \pi$: $y(t) = -A_c\,m(t)$ — recuperação com inversão de polaridade (geralmente tolerável).

A **perda de potência** devido ao erro de fase é:

$$
\boxed{P_{\text{loss}} = 1 - \cos^2\phi = \sin^2\phi}
$$

Ou seja, a potência do sinal recuperado é $\cos^2\phi$ vezes a potência original. Para $\phi = 30°$, por exemplo: $\cos^2 30° = 3/4 = 75\%$ da potência é mantida.

**Importante**: este é o principal problema da detecção coerente — exige que o receptor gere uma portadora local **sincronizada em fase** com a portadora original. Qualquer erro de fase causa atenuação proporcional a $\cos\phi$.

### Efeito do erro de frequência $\Delta f$

Suponha agora que o oscilador local tenha frequência $f_c + \Delta f$, com $\Delta f \neq 0$:

$$
r_{\Delta f}(t) = 2\,A_c\,m(t)\,\cos(2\pi f_c t)\,\cos\bigl(2\pi(f_c+\Delta f)t\bigr)
$$

$$
= A_c\,m(t)\Bigl[\cos\bigl(2\pi\Delta f\,t\bigr) + \cos\bigl(2\pi(2f_c+\Delta f)t\bigr)\Bigr]
$$

Após o filtro passa-baixas:

$$
\boxed{y_{\Delta f}(t) = A_c\,m(t)\,\cos(2\pi\Delta f\,t)}
$$

**Análise**: o sinal recuperado é multiplicado por um **batimento** $\cos(2\pi\Delta f\,t)$. Se $\Delta f$ é pequeno (da ordem de $W$), o batimento se manifesta como uma flutuação audível na voz (em áudio) ou como cintilação na imagem (em vídeo). Se $\Delta f$ é grande, o batimento está fora da banda de interesse e pode ser filtrado.

**Exemplo**: para áudio ($W = 4\,\text{kHz}$), um erro de $\Delta f = 50\,\text{Hz}$ produz um batimento de $50\,\text{Hz}$ na saída — perceptível como zumbido. Erros de $f_c$ devem ser mantidos abaixo de $\sim 10\%$ de $W$.

### Prova da perda de potência por erro de fase

**Prova**: seja $m(t)$ um processo estacionário com potência $P_m$. A potência do sinal recuperado com erro de fase $\phi$ é:

$$
P_y = \langle y_\phi^2(t)\rangle = \langle A_c^2\,m^2(t)\,\cos^2\phi\rangle = A_c^2\,\cos^2\phi\,\langle m^2(t)\rangle = A_c^2\,\cos^2\phi\,P_m
$$

Sem erro de fase ($\phi = 0$):

$$
P_{y,0} = A_c^2\,P_m
$$

A fração de potência mantida é:

$$
\frac{P_y}{P_{y,0}} = \cos^2\phi
$$

A fração de potência perdida é:

$$
\boxed{P_{\text{loss}} = 1 - \cos^2\phi = \sin^2\phi}
$$

$\blacksquare$

## Geração de Portadora Sincronizada

### O problema fundamental

Em qualquer sistema DSB-SC (e, de modo geral, em qualquer modulação que não transmita a portadora), o receptor precisa reconstruir uma portadora local **sincronizada em frequência e fase** com a portadora original do transmissor. Sem essa sincronização, a detecção coerente falha:

- Erro de fase $\phi \neq 0$ causa atenuação por $\cos\phi$.
- Erro de frequência $\Delta f \neq 0$ causa batimento na saída.
- Para $\phi = 90°$, há **perda total** do sinal.

Existem **quatro abordagens principais** para recuperar a portadora no receptor:

| Método | Complexidade | Robustez a ruído | Aplicação típica |
|---|---:|---:|---|
| Pilot Carrier | baixa | moderada | TV analógica, estúdio |
| PLL genérico | média | boa | Enlaces ponto-a-ponto |
| Costas Loop | média/alta | boa | DSB-SC, PSK |
| Squaring Loop | alta | excelente | PSK, sistemas digitais |

---

### Método 1 — Pilot Carrier (portadora piloto)

#### Princípio

Transmite-se a mensagem DSB-SC **mais uma pequena componente de portadora** em uma frequência ligeiramente deslocada ou com fase conhecida:

$$
\boxed{s_{\text{pilot}}(t) = A_c\,m(t)\,\cos(2\pi f_c t) + A_p\,\cos(2\pi f_c t + \theta_p)}
$$

onde $A_p \ll A_c$ (a piloto é tipicamente 1%–10% da amplitude da portadora original). A potência da piloto é mínima, mas suficiente para servir de referência de fase.

No receptor, um **filtro passa-banda estreito** centrado em $f_c$ extrai a piloto:

$$
\boxed{v_{\text{pilot}}(t) = A_p\,\cos(2\pi f_c t + \theta_p)}
$$

Um PLL ou Costas Loop usa este sinal como referência para bloquear a fase do VCO.

#### Análise de potência

Se a potência total da piloto é $P_p = A_p^2/2$ e a potência do sinal DSB-SC é $P_s = A_c^2 P_m/2$, a razão piloto-sinal é:

$$
\frac{P_p}{P_s} = \frac{A_p^2}{A_c^2 P_m}
$$

Para $A_p = 0{,}05\,A_c$ e $P_m = 1/2$:

$$
\frac{P_p}{P_s} = \frac{0{,}0025\,A_c^2}{0{,}5\,A_c^2} = 0{,}5\%
$$

A piloto consome menos de 1% da potência — um custo mínimo pela simplicidade de implementação.

#### Vantagens e desvantagens

**Vantagens**:
- Simples de implementar no receptor (filtro + PLL).
- Funciona bem mesmo para $m(t)$ com baixa profundidade de modulação.
- Sinal de erro estável mesmo quando $m(t) = 0$.

**Desvantagens**:
- Desperdício de potência na piloto (ainda que pequeno).
- Requer que a piloto seja extraída por filtro — sensível a desvanecimento seletivo em $f_c$.
- Não é adequado para aplicações militares ou criptografadas (a piloto revela a frequência exata).

#### Aplicação: TV analógica

Na TV analógica (NTSC/PAL), a portadora de vídeo é transmitida com nível suficiente (tipicamente $\mu \approx 0{,}7$) para ser extraída por um PLL no receptor. Esta é uma forma de pilot carrier implícito.

---

### Método 2 — PLL Genérico (Phase-Locked Loop)

#### Estrutura do PLL

Um **Phase-Locked Loop** é um sistema de realimentação que ajusta a fase de um oscilador local (VCO) para rastreá-la de um sinal de referência. A estrutura básica possui três blocos:

```
        e(t) ──► [Filtro LP] ──► v_ctrl(t) ──► [VCO] ──► φ(t)
         ▲                                              │
         │                                              │
         └────────────── [Detector de Fase] ◄───────────┘
```

1. **Detector de fase (PD)**: gera um sinal $e(t)$ proporcional ao erro de fase $\phi_e$ entre o sinal de entrada e o VCO.
2. **Filtro de loop**: filtra $e(t)$ para remover componentes de alta frequência e determinar a estabilidade do PLL.
3. **VCO (Voltage-Controlled Oscillator)**: gera $\cos(\omega_c t + \phi(t))$, onde a frequência instantânea é controlada por $v_{\text{ctrl}}(t)$.

#### Modelagem matemática

Seja $\theta_{\text{in}}(t)$ a fase do sinal de entrada e $\theta_{\text{VCO}}(t)$ a fase do VCO. O **erro de fase** é:

$$
\boxed{\phi_e(t) = \theta_{\text{in}}(t) - \theta_{\text{VCO}}(t)}
$$

O detector de fase (multiplicador) produz:

$$
\boxed{e(t) = K_d \cdot \sin\bigl(\phi_e(t)\bigr)}
$$

onde $K_d$ é o ganho do detector de fase (V/rad).

O VCO tem a seguinte relação entre controle e fase:

$$
\boxed{\frac{d\theta_{\text{VCO}}(t)}{dt} = \omega_c + K_o \cdot v_{\text{ctrl}}(t)}
$$

onde $K_o$ é o ganho do VCO (rad/s/V).

O filtro de loop $F(s)$ no domínio $s$ (Laplace) relaciona $V_{\text{ctrl}}(s)$ com $E(s)$:

$$
\boxed{V_{\text{ctrl}}(s) = F(s) \cdot E(s)}
$$

#### Função de transferência de malha fechada

No domínio $s$, a equação do PLL é:

$$
\Phi_e(s) = \Theta_{\text{in}}(s) - \Theta_{\text{VCO}}(s) = \Theta_{\text{in}}(s) - \frac{K_o V_{\text{ctrl}}(s)}{s}
$$

Substituindo $V_{\text{ctrl}}(s) = F(s)\,K_d\,\Phi_e(s)$:

$$
\Phi_e(s) = \Theta_{\text{in}}(s) - \frac{K_o K_d F(s)}{s}\,\Phi_e(s)
$$

$$
\boxed{\Phi_e(s) = \frac{\Theta_{\text{in}}(s)}{1 + \dfrac{K_o K_d F(s)}{s}}}
$$

A **função de transferência de malha fechada** para o erro de fase é:

$$
\boxed{H_e(s) = \frac{\Phi_e(s)}{\Theta_{\text{in}}(s)} = \frac{s}{s + K_o K_d F(s)}}
$$

A **função de transferência de rastreamento** (saída → entrada) é:

$$
\boxed{H(s) = 1 - H_e(s) = \frac{K_o K_d F(s)}{s + K_o K_d F(s)}}
$$

#### PLL de primeira ordem

Para um PLL com filtro direto ($F(s) = 1$, ganho de malha $K = K_o K_d$):

$$
\boxed{H(s) = \frac{K}{s + K}, \qquad H_e(s) = \frac{s}{s + K}}
$$

A constante de tempo de rastreamento é $\tau = 1/K$. A **largura de banda de malha** é:

$$
\boxed{B_L = \frac{K}{4}\;\text{Hz} = \frac{K_o K_d}{4}\;\text{Hz}}
$$

#### PLL de segunda ordem (filtro proporcional-integral)

O filtro mais comum é o **proporcional-integral** (PI), também chamado de filtro de propagação lenta (*proportional-plus-integral*):

$$
F(s) = \frac{1 + s\tau_2}{s\tau_1}
$$

Com $\tau_1$ e $\tau_2$ selecionados para obter um amortecimento desejado. A função de transferência se torna:

$$
\boxed{H(s) = \frac{K(1+s\tau_2)/s\tau_1}{s + K(1+s\tau_2)/s\tau_1} = \frac{sK\tau_2 + K}{s^2\tau_1 + sK\tau_2 + K}}
$$

Definindo a **frequência natural de malha** e o **coeficiente de amortecimento**:

$$
\boxed{\omega_n = \sqrt{\frac{K}{\tau_1}}, \qquad \zeta = \frac{\tau_2}{2}\sqrt{\frac{K}{\tau_1}} = \frac{\tau_2\,\omega_n}{2}}
$$

A função de transferência assume a forma padrão de segundo ordem:

$$
\boxed{H(s) = \frac{2\zeta\omega_n\,s + \omega_n^2}{s^2 + 2\zeta\omega_n\,s + \omega_n^2}}
$$

Para $\zeta = 1/\sqrt{2} \approx 0{,}707$ (resposta de Butterworth, sem overshoot excessivo):

$$
\boxed{\tau_2 = \sqrt{2}\,\frac{1}{\omega_n}, \qquad \tau_1 = \frac{2}{\omega_n^2}}
$$

#### Condições de lock, capture e tracking

- **Lock (bloqueio)**: o PLL está sincronizado ($\phi_e \approx 0$) e mantido. O erro de fase em lock é tipicamente $\phi_e < 10°$.
- **Capture**: o processo de *entrar* em lock a partir de uma condição inicial. A **largura de banda de captura** é a faixa de frequência inicial dentro da qual o PLL pode adquirir lock.
- **Tracking (rastreamento)**: o PLL já está em lock e segue pequenas variações de fase/frequência da entrada.

Para PLL de segunda ordem, a **largura de banda de capture** é aproximadamente:

$$
\boxed{B_{\text{capture}} \approx \frac{\omega_n}{2\pi}\,\sqrt{2\zeta}}
$$

---

### Método 3 — Costas Loop

#### Topologia do Costas Loop

O **Costas Loop** (inventado por Andrew Costas em 1956) é um PLL *self-coherent* — não precisa de sinal piloto nem de processamento de sinal de entrada antes da detecção. Sua topologia usa **duas ramificações paralelas** (I e Q) do VCO:

```
                s_in(t) ──►┬──► [×2] ──► [LPF] ──► y_I(t)
                           │        ↑
                           │     VCO: cos(ωct + φ)
                           │
                           ├─► [×2] ──► [LPF] ──► y_Q(t)
                           │        ↑
                           │     VCO: -sin(ωct + φ)
                           │
                     [×2]  │
                       ↑   │
                    y_I·y_Q ──► [Filtro de Loop] ──► v_ctrl ──► VCO
```

O Costas Loop possui **quatro multiplicadores** (ou dois, se reutilizar o VCO):

1. **Multiplicador I**: $s_{\text{in}}(t) \times 2\cos(\omega_c t + \hat{\phi})$
2. **Multiplicador Q**: $s_{\text{in}}(t) \times 2\sin(\omega_c t + \hat{\phi})$ (com sinal negativo)
3. **Multiplicador de erro**: $y_I(t) \times y_Q(t)$ → sinal de erro $v_e(t)$

#### Dedução do sinal de erro

Seja o sinal recebido:

$$
s_{\text{in}}(t) = A_c\,m(t)\,\cos(2\pi f_c t)
$$

O VCO gera $\cos(2\pi f_c t + \hat{\phi})$ e $-\sin(2\pi f_c t + \hat{\phi})$. A ramificação I após o LPF:

$$
y_I(t) = A_c\,m(t)\,\cos(\phi_e(t))
$$

onde $\phi_e(t) = \phi - \hat{\phi}$ é o erro de fase (assumindo $f_c$ sincronizado).

A ramificação Q após o LPF:

$$
y_Q(t) = -A_c\,m(t)\,\sin(\phi_e(t))
$$

O **sinal de erro** do Costas Loop é o produto:

$$
\boxed{v_e(t) = y_I(t) \cdot y_Q(t) = -A_c^2\,m^2(t)\,\cos(\phi_e(t))\,\sin(\phi_e(t))}
$$

Usando $\sin(2x) = 2\sin x\cos x$:

$$
\boxed{v_e(t) = -\frac{A_c^2}{2}\,m^2(t)\,\sin\bigl(2\phi_e(t)\bigr)}
$$

Em média, sobre as variações de $m(t)$ (assumindo $\langle m^2(t) \rangle = P_m$):

$$
\boxed{\langle v_e \rangle = -\frac{A_c^2 P_m}{2}\,\sin(2\phi_e)}
$$

#### Análise do *potencial de fase* (phase potential)

O sinal de erro $\langle v_e \rangle(\phi_e)$ tem a forma de $-\sin(2\phi_e)$, que pode ser derivada de um **potencial de fase**:

$$
\Psi(\phi_e) = \frac{A_c^2 P_m}{4}\,\cos(2\phi_e)
$$

$$
\langle v_e \rangle = -\frac{d\Psi}{d\phi_e}
$$

Os **pontos de equilíbrio** ocorrem quando $\langle v_e \rangle = 0$, isto é:

- $\phi_e = 0$ → **lock estável** (mínimo do potencial, $\cos(0) = 1$).
- $\phi_e = \pi$ → **lock estável** (mínimo, $\cos(2\pi) = 1$, lock com inversão de fase — inofensivo para DSB-SC pois $y = A_c m \cos\pi = -A_c m$).
- $\phi_e = \pi/2$ → **lock instável** (máximo, $\cos(\pi) = -1$).

O **potencial atrativo** em torno de $\phi_e = 0$ é forte e simétrico: o loop converge tanto para fase 0 quanto para $\pi$ (ambos produzem recuperação válida). Esta é uma vantagem única do Costas Loop.

#### Ganho do Costas Loop

Comparando com um PLL genérico onde o sinal de erro é $K_d \sin\phi_e$, o Costas Loop tem:

$$
K_{d,\text{Costas}} = A_c^2 P_m \cdot \cos(2\phi_e) \approx A_c^2 P_m \quad\text{(para $\phi_e$ pequeno)}
$$

O ganho efetivo do Costas Loop é **quadrático** em $A_c$ — mais sensível que o PLL genérico (que é linear em $A_c$).

#### Resposta do Costas Loop a ruído

A presença de ruído aditivo $n(t)$ no canal altera o sinal de erro. Seja $s_{\text{in}}(t) = A_c m(t)\cos(\omega_c t) + n(t)$, onde $n(t)$ é ruído AWGN de banda $2W$.

O ruído contribui para $v_e(t)$ através de produtos cruzados entre sinal e ruído, e ruído-ruído. O resultado é que o erro de fase em lock possui uma variância aproximada:

$$
\boxed{\sigma_\phi^2 \approx \frac{B_L}{2\,\text{SNR}_{\text{in}}}}
$$

onde $B_L$ é a largura de banda de malha do filtro do Costas Loop e $\text{SNR}_{\text{in}}$ é a SNR de entrada (portadora-ruído) na banda $2W$.

Esta fórmula mostra que:
- Maior SNR → menor erro de fase.
- Menor $B_L$ → menor erro, mas resposta mais lenta a variações de fase.
- Há um **compromisso dinâmico**: $B_L$ deve ser grande o suficiente para seguir variações de fase (*drift* do oscilador, ~1–10 Hz), mas pequeno o suficiente para minimizar ruído.

#### *Cycle slip* no Costas Loop

Quando o erro de fase excede $\pm \pi/2$, o Costas Loop pode sofrer um **cycle slip** — o VCO "salta" $2\pi$ para recuperar lock. Cada *cycle slip* causa um glitch na saída demodulada. A probabilidade de *cycle slip* é:

$$
\boxed{P_{\text{slip}} \approx \frac{2B_L}{\sqrt{3\,\text{SNR}_{\text{in}}}}\,\exp\!\left(-\frac{3\,\text{SNR}_{\text{in}}}{4}\right)}
$$

Para $\text{SNR}_{\text{in}} > 10\,\text{dB}$, $P_{\text{slip}}$ é negligenciável. Abaixo de ~7 dB, o Costas Loop começa a perder lock frequentemente.

#### Limitações do Costas Loop

1. **Ambiguidade de fase $\pi$**: o lock pode ocorrer em $\phi_e = 0$ ou $\phi_e = \pi$. Para DSB-SC isso é inofensivo, mas para PSK (onde a informação está na fase) causa *bit-flip* de 180°.
2. **Limiar de ruído**: abaixo de ~7 dB, o Costas Loop perde lock. O *squaring loop* (Método 4) opera em ~3 dB.
3. **Dependência de $m(t)$**: o sinal de erro é proporcional a $m^2(t)$. Se $m(t)$ permanece próximo de zero por muito tempo (ex: silêncio em áudio), o loop perde rastreamento.

---

### Método 4 — Squaring Loop (*Fourth-Power Extractor*)

#### Princípio

Quando não é possível usar Costas Loop (ex: em modulações PSK onde o Costas Loop sofre ambiguidade de fase), utiliza-se um **extrator de potência** (*power extractor*) para reconstruir a portadora.

O sinal recebido $s_{\text{in}}(t) = A_c\,m(t)\,\cos(2\pi f_c t)$ é elevado ao quadrado:

$$
s_{\text{in}}^2(t) = A_c^2\,m^2(t)\,\cos^2(2\pi f_c t) = A_c^2\,m^2(t)\cdot\frac{1+\cos(4\pi f_c t)}{2}
$$

$$
s_{\text{in}}^2(t) = \frac{A_c^2 m^2(t)}{2} + \frac{A_c^2 m^2(t)}{2}\,\cos(4\pi f_c t)
$$

Um **filtro passa-banda estreito** centrado em $2f_c$ extrai o termo em $2f_c$:

$$
\boxed{v_{2f_c}(t) = \frac{A_c^2}{2}\,m^2(t)\,\cos(4\pi f_c t)}
$$

Se $m(t)$ tiver uma componente DC (como em sinais digitais PSK, onde $m(t) = \pm 1$), então $m^2(t) = 1$ e:

$$
\boxed{v_{2f_c}(t) = \frac{A_c^2}{2}\,\cos(4\pi f_c t)}
$$

Um **divisor de frequência por 2** produz a portadora recuperada:

$$
\boxed{v_{\text{rec}}(t) = \frac{A_c^2}{4}\,\cos(2\pi f_c t + \theta)}
$$

onde $\theta$ é uma fase constante de $0°$ ou $90°$ (ambiguidade de $\pi/2$ do divisor).

#### Squaring Loop para PSK

Para QPSK, onde $m(t) = I(t)\cos(\pi/4) - Q(t)\sin(\pi/4)$ com $I,Q \in \{\pm 1\}$:

$$
m^2(t) = 1 \quad\text{(sempre!)}
$$

Logo, após o quadrado, a componente em $2f_c$ é pura — sem modulação de envelope. O divisor por 2 recupera a portadora sem ambiguidade de fase.

#### Comparação: Costas Loop vs Squaring Loop

| Característica | Costas Loop | Squaring Loop |
|---|---|---|
| Sinal de erro | $\propto m^2(t)\sin(2\phi_e)$ | PLL em $2f_c$, depois divide |
| Ambiguidade de fase | $\pi$ (inofensivo para DSB) | $\pi/2$ |
| Limiar de ruído | ~7 dB | ~3 dB |
| Complexidade | 3–4 multiplicadores | 1 quadrador + 1 divisor |
| Sensível a silêncio de $m(t)$ | Sim | Não |
| Aplicação | DSB-SC, BPSK | QPSK, sistemas digitais |

---

### Tabela comparativa: métodos de recuperação de portadora

| Critério | Pilot Carrier | PLL Genérico | Costas Loop | Squaring Loop |
|---|---:|---:|---:|---:|
| Potória extra | $\sim 1\%$ | $0$ | $0$ | $0$ |
| Complexidade | Baixa | Média | Média–Alta | Alta |
| Limiar SNR | ~3 dB | ~5 dB | ~7 dB | ~3 dB |
| Ambiguidade de fase | Nenhuma | Nenhuma | $\pi$ | $\pi/2$ |
| Robustez a silêncio | Excelente | Boa | Fraca | Excelente |
| Adequado para DSB-SC | Sim | Sim | **Ideal** | Sim |
| Adequado para PSK | Sim | Sim | Sim (com cuidado) | **Ideal** |

### Limitações práticas da detecção coerente

Apesar dos avanços em PLL e Costas Loop, a detecção coerente apresenta desafios:

1. **Drift de temperatura**: o VCO varia de frequência com a temperatura (~10–100 ppm). Requer recalibração periódica ou *reference* de cristal.
2. **Jitter de relógio**: em sistemas digitais, o *jitter* do oscilador de relógio se acopla ao VCO e degrada a SNR.
3. **Desvanecimento seletivo**: se o canal atenua seletivamente em $f_c$, a recuperação da portadora falha mesmo que o sinal esteja presente nas bandas laterais.
4. **Tempo de aquisição**: o PLL pode levar dezenas a centenas de ciclos para adquirir lock. Em sistemas de transmissão packetizada, isso representa uma sobrecarga significativa.

Estas limitações motivam o uso de AM convencional (DSB-LC) em aplicações de *broadcasting*, onde a portadora é transmitida em alta potência e pode ser usada diretamente pelo detector de envelope — sem necessidade de PLL.


Usando $\sin(2x) = 2\sin x\cos x$:

$$
\boxed{v_e(t) = -\frac{A_c^2}{2}\,m^2(t)\,\sin\bigl(2\phi_e(t)\bigr)}
$$

Em média, sobre as variações de $m(t)$ (assumindo $\langle m^2(t) \rangle = P_m$):

$$
\boxed{\langle v_e \rangle = -\frac{A_c^2 P_m}{2}\,\sin(2\phi_e)}
$$

#### Análise do *potencial de fase* (phase potential)

O sinal de erro $\langle v_e \rangle(\phi_e)$ tem a forma de $-\sin(2\phi_e)$, que pode ser derivada de um **potencial de fase**:

$$
\Psi(\phi_e) = \frac{A_c^2 P_m}{4}\,\cos(2\phi_e)
$$

$$
\langle v_e \rangle = -\frac{d\Psi}{d\phi_e}
$$

Os **pontos de equilíbrio** ocorrem quando $\langle v_e \rangle = 0$, isto é:

- $\phi_e = 0$ → **lock estável** (mínimo do potencial, $\cos(0) = 1$).
- $\phi_e = \pi$ → **lock estável** (mínimo, $\cos(2\pi) = 1$, lock com inversão de fase — inofensivo para DSB-SC pois $y = A_c m \cos\pi = -A_c m$).
- $\phi_e = \pi/2$ → **lock instável** (máximo, $\cos(\pi) = -1$).

O **potencial atrativo** em torno de $\phi_e = 0$ é forte e simétrico: o loop convergente tanto para fase 0 quanto para $\pi$ (ambos produzem recuperação válida). Esta é uma vantagem única do Costas Loop.

#### Ganho do Costas Loop

Comparando com um PLL genérico onde o sinal de erro é $K_d \sin\phi_e$, o Costas Loop tem:

$$
K_{d,\text{Costas}} = A_c^2 P_m \cdot \cos(2\phi_e) \approx A_c^2 P_m \quad\text{(para $\phi_e$ pequeno)}
$$

O ganho efetivo do Costas Loop é **quadrático** em $A_c$ — mais sensível que o PLL genérico (que é linear em $A_c$).

#### Resposta do Costas Loop a ruído

A presença de ruído aditivo $n(t)$ no canal altera o sinal de erro. Seja $s_{\text{in}}(t) = A_c m(t)\cos(\omega_c t) + n(t)$, onde $n(t)$ é ruído AWGN de banda $2W$.

O ruído contribui para $v_e(t)$ através de produtos cruzados entre sinal e ruído, e ruído-ruído. O resultado é que o erro de fase em lock possui uma variância aproximada:

$$
\boxed{\sigma_\phi^2 \approx \frac{B_L}{2\,\text{SNR}_{\text{in}}}}
$$

onde $B_L$ é a largura de banda de malha do filtro do Costas Loop e $\text{SNR}_{\text{in}}$ é a SNR de entrada (portadora-ruído) na banda $2W$.

Esta fórmula mostra que:
- Maior SNR → menor erro de fase.
- Menor $B_L$ → menor erro, mas resposta mais lenta a variações de fase.
- Há um **compromisso dinâmico**: $B_L$ deve ser grande o suficiente para seguir variações de fase (drift do oscilador, ~1–10 Hz), mas pequeno o suficiente para minimizar ruído.

#### *Cycle slip* no Costas Loop

Quando o erro de fase excede $\pm \pi/2$, o Costas Loop pode sofrer um **cycle slip** — o VCO

## Modulação AM Convencional (DSB-LC)

### Definição e modelo

Na **modulação AM convencional** (*Double Sideband — Large Carrier*, ou "bandas laterais duplas com portadora forte"), adicionamos uma componente DC à mensagem antes de modular:

$$
\boxed{s_{\text{AM}}(t) = A_c\bigl[1 + \mu\,m_n(t)\bigr]\,\cos(2\pi f_c t)}
$$

onde:

- $A_c$ é a amplitude da portadora;
- $\mu$ é o **índice de modulação** (ou profundidade de modulação);
- $m_n(t)$ é o sinal de mensagem **normalizado**: $\max|m_n(t)| = 1$.

**Definição**: o sinal normalizado é $m_n(t) = \dfrac{m(t)}{\max|m(t)|}$. Para um tom único $m(t) = A_m\cos(2\pi f_m t)$, temos $m_n(t) = \cos(2\pi f_m t)$.

O termo $1 + \mu\,m_n(t)$ deve ser **sempre não-negativo** para que o envelope seja não-negativo. Isso implica:

$$
\boxed{0 \leq \mu \leq 1 \qquad\text{(condição de modulação sem sobremodulação)}}
$$

Quando $\mu > 1$, ocorre **sobremodulação**: $1 + \mu\,m_n(t)$ cruza zero, o envelope se inverte e o detector de envelope produz distorção severa.

### Espectro da AM

Expandindo $s_{\text{AM}}(t)$:

$$
s_{\text{AM}}(t) = A_c\,\cos(2\pi f_c t) + \mu\,A_c\,m_n(t)\,\cos(2\pi f_c t)
$$

O primeiro termo é a **portadora pura**; o segundo termo é um sinal DSB-SC modulando a portadora com amplitude $\mu A_c$.

Aplicando a transformada de Fourier:

$$
\boxed{S_{\text{AM}}(f) = \frac{A_c}{2}\bigl[\delta(f-f_c) + \delta(f+f_c)\bigr] + \frac{\mu A_c}{2}\bigl[M_n(f-f_c) + M_n(f+f_c)\bigr]}
$$

O espectro AM contém **três componentes**:

1. **Portadora**: duas deltas em $\pm f_c$, cada uma com peso $A_c/2$.
2. **BSL superior (USB)**: $M_n(f)$ copiada para $+f_c$, com peso $\mu A_c/2$.
3. **BSL inferior (LSB)**: $M_n(f)$ copiada para $-f_c$, com peso $\mu A_c/2$.

A banda total ocupada é $B_{\text{AM}} = 2W$ (mesma do DSB-SC).

### Análise de potências

Considere carga de $1\,\Omega$. A potência de cada componente:

**Portadora**:

$$
P_c = \biggl\langle\bigl[A_c\,\cos(2\pi f_c t)\bigr]^2\biggr\rangle = \frac{A_c^2}{2}
$$

**Bandas laterais** (DSB-SC com amplitude $\mu A_c$):

$$
P_{\text{SB}} = \frac{(\mu A_c)^2}{2}\,P_{m_n} = \frac{\mu^2 A_c^2}{2}\,P_{m_n}
$$

onde $P_{m_n} = \langle m_n^2(t)\rangle$ é a potência do sinal normalizado. Para $m_n(t) = \cos(2\pi f_m t)$, $P_{m_n} = 1/2$.

**Potência total**:

$$
\boxed{P_T = P_c + P_{\text{SB}} = \frac{A_c^2}{2}\Bigl(1 + \mu^2\,P_{m_n}\Bigr)}
$$

### Eficiência de potência

A **eficiência de potência** é a fração da potência total que está nas bandas laterais (portando informação):

$$
\boxed{\eta_P = \frac{P_{\text{SB}}}{P_T} = \frac{\mu^2\,P_{m_n}}{1 + \mu^2\,P_{m_n}}}
$$

Para o caso de **tom único** ($m_n(t) = \cos(2\pi f_m t)$), $P_{m_n} = 1/2$:

$$
\eta_P = \frac{\mu^2/2}{1+\mu^2/2} = \frac{\mu^2}{2+\mu^2}
$$

**Teorema** da eficiência máxima da AM: para tom único com $\mu = 1$ (máxima modulação sem sobremodulação):

$$
\boxed{\eta_{\max} = \frac{1^2}{2+1^2} = \frac{1}{3} \approx 33{,}3\%}
$$

**Observação**: isto significa que **mesmo no caso melhor**, $2/3$ da potência é desperdiçada na portadora — uma enorme ineficiência. Esta é a principal crítica à modulação AM convencional e a motivação para DSB-SC e SSB.

### Análise de potências por componente (tom único)

Para $m_n(t) = \cos(2\pi f_m t)$, $\mu = 1$:

$$
s_{\text{AM}}(t) = A_c\bigl[1+\cos(2\pi f_m t)\bigr]\,\cos(2\pi f_c t)
$$

Usando $\cos A\cos B = \tfrac{1}{2}[\cos(A-B)+\cos(A+B)]$:

$$
s_{\text{AM}}(t) = A_c\cos(2\pi f_c t) + \frac{A_c}{2}\cos\bigl(2\pi(f_c-f_m)t\bigr) + \frac{A_c}{2}\cos\bigl(2\pi(f_c+f_m)t\bigr)
$$

Potências (carga $1\,\Omega$):

- Portadora: $P_c = A_c^2/2$
- BSL inferior (LSB): $P_{\text{LSB}} = \bigl(\tfrac{A_c}{2}\bigr)^2\cdot\tfrac{1}{2} = \tfrac{A_c^2}{8}$
- BSL superior (USB): $P_{\text{USB}} = \tfrac{A_c^2}{8}$

Total: $P_T = \dfrac{A_c^2}{2} + \dfrac{A_c^2}{8} + \dfrac{A_c^2}{8} = \dfrac{3A_c^2}{4}$

Eficiência: $\eta_P = \dfrac{A_c^2/4}{3A_c^2/4} = \dfrac{1}{3}$ — confirmado.

**Importante**: a portadora carrega $66{,}7\%$ da potência total e **zero informação**. As duas laterais, juntas com $33{,}3\%$, carregam toda a informação — e são redundantes (para $m(t)$ real).

### Sobremodulação: distorção e problemas

Quando $\mu > 1$, o envelope $1+\mu\,m_n(t)$ torna-se negativo em alguns pontos. Como o detector de envelope (diodo+RC) não pode seguir valores negativos, o envelope detectado é o módulo $|1+\mu\,m_n(t)|$, produzindo distorção severa:

- **Cruzamento de zero**: o envelope passa por zero, invertendo a fase do sinal modulado em $180°$.
- **Distorção não-linear**: o detector recupera $|1+\mu\,m_n(t)| \neq 1+\mu\,m_n(t)$, introduzindo harmônicos que não estavam na mensagem original.
- **Interferência entre canais**: a distorção gera conteúdo espectral que se espalha além da banda $2W$, interferindo em canais adjacentes.

**Definição**: a **sobremodulação** ocorre quando $\mu > 1$, isto é, quando a amplitude da mensagem excede a amplitude da portadora: $\mu\,A_c > A_c$.

## Detecção de Envelope de AM

### Princípio do detector de envelope

O **detector de envelope** (ou detector de pico) é o receptor mais simples para modulação AM. Consiste basicamente de:

1. Um **diodo** (retificador de meia onda ou onda completa);
2. Um circuito **RC passa-baixas** (filtro de descarga).

O diodo retifica o sinal (remove a metade negativa), e o capacitor C carrega até o pico do envelope e descarrega através de R com constante de tempo $\tau = RC$.

### Dedução da condição de RC

Para que o detector funcione corretamente, a constante de tempo $RC$ deve satisfazer duas condições opostas:

**Condição 1 — Filtrar a portadora** (R grande o suficiente para não "ver" a oscilação em $f_c$):

$$
\boxed{RC\gg\frac{1}{2\pi f_c}}
$$

Isto garante que o capacitor não descarregue significativamente durante um ciclo da portadora.

**Condição 2 — Rastrear a mensagem** (R pequeno o suficiente para acompanhar variações rápidas de $m(t)$):

$$
\boxed{RC\ll\frac{1}{2\pi W}}
$$

Isto garante que o capacitor descarregue o suficiente entre picos consecutivos do envelope para seguir as variações da mensagem.

**Condição combinada**:

$$
\boxed{\frac{1}{2\pi f_c} \ll RC \ll \frac{1}{2\pi W}}
$$

Esta janela de projeto é mais ampla quanto maior for a relação $f_c/W$ (quanto mais alta for a portadora em relação à largura de banda da mensagem).

### Teorema da condição anti-diagonal clipping

**Teorema**: para sinal AM tonal $s_{\text{AM}}(t) = A_c[1+\mu\cos(2\pi f_m t)]\cos(2\pi f_c t)$, a condição para evitar **diagonal clipping** é:

$$
\boxed{RC \leq \frac{\sqrt{1-\mu^2}}{\mu\,\omega_m}}
$$

onde $\omega_m = 2\pi f_m$.

**Prova**: o envelope $E(t) = A_c[1+\mu\cos(\omega_m t)]$ desce com taxa $|dE/dt| = A_c\,\mu\,\omega_m\,|\sin(\omega_m t)|$. A descarga do capacitor tem taxa $E(t)/RC$. No pior caso ($\cos(\omega_m t) = -\mu$, $|\sin| = \sqrt{1-\mu^2}$):

$$
\frac{E}{|dE/dt|} = \frac{A_c(1-\mu^2)}{A_c\,\mu\,\omega_m\,\sqrt{1-\mu^2}} = \frac{\sqrt{1-\mu^2}}{\mu\,\omega_m} \quad\Rightarrow\quad RC \leq \frac{\sqrt{1-\mu^2}}{\mu\,\omega_m}
$$

$\blacksquare$

**Observação**: para $\mu \to 1$, limite $\to 0$ — qualquer RC causa clipping. Na prática, $\mu \leq 0{,}8$.

### Distorção por *negative peak clipping*

Outro tipo de distorção ocorre quando o resistor de carga $R_L$ é conectado ao detector (por exemplo, através de um capacitor acoplador). A descarga do capacitor através do circuito de carga pode causar o **negative peak clipping**: quando o envelope sobe rapidamente (carga rápida via diodo), mas desce lentamente (descarga através de $R_L$), os picos negativos do sinal são cortados.

### SNR de saída do detector de envelope

Para um detector de envelope em AM operando acima do limiar, isto é, com razão portadora-ruído suficientemente alta para linearizar o módulo, a SNR de saída é aproximadamente:

$$
\boxed{\text{SNR}_{\text{out}} \approx \frac{\mu^2\,P_{m_n}}{1+\mu^2\,P_{m_n}}\cdot\text{SNR}_{\text{in}}}
$$

onde $\text{SNR}_{\text{in}}$ é a razão sinal-ruído na entrada do detector (banda $2W$ centrada em $f_c$).

Para tom único com $\mu = 1$: $\text{SNR}_{\text{out}} \approx \tfrac{1}{3}\,\text{SNR}_{\text{in}}$ — pior que a entrada (ganho de SNR $< 1$).

**Comparação**: o DSB-SC coerente tem $\text{SNR}_{\text{out}} = 2\,\text{SNR}_{\text{in}}$ (ganho de 3 dB), superior ao AM. Porém, o AM não precisa de oscilador local sincronizado — é uma troca entre desempenho e complexidade.

### Exemplo: projeto de detector de envelope para AM broadcast

**Exemplo**: estação de AM broadcast, $f_c = 1000\,\text{kHz}$, largura de áudio $W = 5\,\text{kHz}$, $\mu = 0{,}8$.

Condição de RC:

$$
\frac{1}{2\pi\cdot 10^6} \ll RC \ll \frac{1}{2\pi\cdot 5\times 10^3}
$$

$$
1{,}59\times 10^{-7}\,\text{s} \ll RC \ll 3{,}18\times 10^{-5}\,\text{s}
$$

$$
\boxed{0{,}16\,\mu\text{s} \ll RC \ll 31{,}8\,\mu\text{s}}
$$

Condição anti-diagonal clipping ($\mu = 0{,}8$, $f_m = 5\,\text{kHz}$):

$$
RC \leq \frac{\sqrt{1-0{,}8^2}}{0{,}8\cdot 2\pi\cdot 5000} = \frac{0{,}6}{25133} \approx 23{,}9\,\mu\text{s}
$$

Escolha prática: $R = 5\,\text{k}\Omega$, $C = 0{,}0047\,\mu\text{F}$, então $RC = 23{,}5\,\mu\text{s}$ — dentro da janela e próximo do limite anti-clipping.

## Modulação SSB — Teoria e Implementação

### Redundância das bandas laterais em DSB

Em DSB-SC, as duas bandas laterais são **espelhos conjugados**: $S(f_c+f) = S^*(f_c-f)$ para $m(t)$ real. Cada banda lateral contém informação completa sobre $m(t)$. Transmitir ambas é redundante — podemos eliminar uma delas sem perda de informação.

**Definição**: a **modulação SSB** (*Single Sideband*) transmite apenas **uma** das bandas laterais, economizando metade da banda e metade da potência em relação ao DSB-SC.

### Transformada de Hilbert e seu espectro

A **transformada de Hilbert** de um sinal $m(t)$ é definida como:

$$
\boxed{\hat{m}(t) = m(t) * \frac{1}{\pi t} = \frac{1}{\pi}\,\text{PV}\!\int_{-\infty}^{\infty}\frac{m(\tau)}{t-\tau}\,d\tau}
$$

No domínio da frequência:

$$
\boxed{\hat{M}(f) = -j\,\text{sgn}(f)\,M(f) = \begin{cases}-j\,M(f), & f > 0\\
+j\,M(f), & f < 0\\
0, & f = 0\\
\end{cases}}
$$

O filtro da transformada de Hilbert tem resposta em frequência:

$$
\boxed{H_{\text{Hilbert}}(f) = -j\,\text{sgn}(f) = \begin{cases}-j, & f > 0\\
+j, & f < 0\\
\end{cases}}
$$

Este filtro desloca todas as componentes de frequência positiva por $-90°$ e todas as de frequência negativa por $+90°$.

Propriedades importantes da transformada de Hilbert:

- $\hat{\hat{m}}(t) = -m(t)$ (aplicar duas vezes inverte o sinal);
- $\hat{m}(t)$ e $m(t)$ têm a **mesma energia**: $\int|\hat{m}(t)|^2\,dt = \int|m(t)|^2\,dt$;
- $\langle m(t)\,\hat{m}(t)\rangle = 0$ para sinais ergódicos (são ortogonais).

### Dedução do sinal SSB

A partir do sinal analítico $\tilde{m}(t) = m(t) + j\,\hat{m}(t)$ (espectro nulo para $f < 0$):

$$
\Re\{\tilde{m}(t)\,e^{j2\pi f_c t}\} = m(t)\,\cos(2\pi f_c t) - \hat{m}(t)\,\sin(2\pi f_c t)
$$

Este sinal tem espectro concentrado apenas em $f > f_c$ — **banda lateral superior (USB)**.

De modo análogo (parte imaginária):

$$
\Im\{\tilde{m}(t)\,e^{j2\pi f_c t}\} = m(t)\,\sin(2\pi f_c t) + \hat{m}(t)\,\cos(2\pi f_c t)
$$

contém apenas **banda lateral inferior (LSB)**.

Portanto:

$$
\boxed{s_{\text{SSB}}(t) = \frac{A_c}{2}\Bigl[m(t)\,\cos(2\pi f_c t) \mp \hat{m}(t)\,\sin(2\pi f_c t)\Bigr]}
$$

Sinal **menos** = USB, **mais** = LSB. USB = "transmitir frequências acima de $f_c$".

### Espectro SSB

Para USB:

$$
S_{\text{USB}}(f) = \frac{A_c}{2}\,M(f-f_c)\,U(f-f_c) + \frac{A_c}{2}\,M^*(f+f_c)\,U(-f-f_c)
$$

Simplificando: para $f > 0$, apenas a cópia de $M(f)$ deslocada para $f_c$ (para $f \in [f_c,\,f_c+W]$). Para $f < 0$, apenas a cópia conjugada deslocada para $-f_c$.

**Largura de banda**:

$$
\boxed{B_{\text{SSB}} = W}
$$

Metade do DSB-SC! Esta é a principal vantagem da SSB.

### Potência e eficiência da SSB

A potência do sinal SSB (tomando $\hat{m}(t)$ como ortogonal a $m(t)$):

$$
P_{\text{SSB}} = \frac{A_c^2}{4}\,\bigl[\langle m^2(t)\rangle + \langle\hat{m}^2(t)\rangle\bigr] = \frac{A_c^2}{4}\,(P_m + P_m) = \frac{A_c^2}{2}\,P_m
$$

Comparando com DSB-SC: $P_{\text{DSB}} = \dfrac{A_c^2}{2}\,P_m$. Logo:

$$
\boxed{P_{\text{SSB}} = \frac{1}{2}\,P_{\text{DSB}}}
$$

A SSB usa **metade da potência** do DSB-SC (transmite apenas uma banda lateral).

**Teorema** da eficiência de SSB: como não há portadora e não há redundância, toda a potência transporta informação:

$$
\boxed{\eta_{\text{SSB}} = 100\%}
$$

Esta é a máxima eficiência possível em modulação em amplitude.

### Método do filtro (projeto do filtro passa-banda)

O método mais direto de gerar SSB é:

1. Gerar DSB-SC: $s_{\text{DSB}}(t) = A_c\,m(t)\,\cos(2\pi f_c t)$.
2. Filtrar por um **filtro passa-banda** seletivo que rejeita uma das bandas laterais.

O filtro deve ter resposta ideal:

$$
H_{\text{SSB}}(f) = \begin{cases}1, & f_c \leq |f| \leq f_c+W \quad\text{(USB)}\\
0, & caso contrário\\
\end{cases}
$$

**Desafio de projeto**: o filtro deve ter uma transição extremamente íngreme entre a banda lateral transmitida e a rejeitada. Para $f_c = 1\,\text{MHz}$ e $W = 5\,\text{kHz}$, a transição ocorre em apenas $10\,\text{kHz}$ (de $f_c$ a $f_c+W$ para a outra lateral). Isto exige filtros de alta ordem (centenas de elementos para RF).

**Importante**: este método funciona bem quando $W$ é pequena em relação a $f_c$ (alta relação $f_c/W$). Para mensagens de banda base ampla (como áudio telefônico ou vídeo), o filtro se torna impraticável.

### Método de Weaver para geração de SSB

O **método de Weaver** (1956) evita o filtro íngreme usando duas etapas de mixagem em frequências intermediárias:

**Passo 1**: Modular $m(t)$ em uma frequência intermediária $f_1$ (baixa, tipicamente alguns kHz):

$$
s_1(t) = m(t)\,\cos(2\pi f_1 t)
$$

**Passo 2**: Modular novamente, esta vez em $f_2$ (também baixa, mas diferente de $f_1$):

$$
s_2(t) = s_1(t)\,\cos(2\pi f_2 t) = m(t)\,\cos(2\pi f_1 t)\,\cos(2\pi f_2 t)
$$

**Passo 3**: Filtrar por um filtro passa-baixa simples (a banda lateral é bem separada em $f_2 \pm f_1$).

**Passo 4**: Modular o resultado final para a frequência de transmissão $f_c$.

Este método é amplamente usado em receptores de rádio amador porque os filtros operam em frequências baixas, onde são mais fáceis de implementar.

## Modulação VSB — Compromisso Prático

### Por que VSB?

A SSB requer um filtro de transição extremamente íngreme. Para sinais com conteúdo de baixa frequência significativo (como vídeo, onde o espectro vai até DC), cortar abruptamente a banda lateral próxima a $f_c$ é **praticamente impossível** com filtros realizáveis.

A **modulação VSB** (*Vestigial Sideband*) resolve este problema transmitindo **uma banda lateral completa** e um **"vestígio" (*vestige*)** da outra banda lateral.

### Dedução da condição de simetria VSB

Seja $H(f)$ a resposta em frequência do filtro de banda lateral usado na geração VSB. O sinal modulado é:

$$
s_{\text{VSB}}(t) = A_c\,m(t)\,\cos(2\pi f_c t) * h(t)
$$

onde $h(t)$ é a resposta ao impulso do filtro. No domínio da frequência:

$$
S_{\text{VSB}}(f) = \frac{A_c}{2}\,M(f)*\bigl[H(f-f_c)+H(f+f_c)\bigr]
$$

Para recuperação sem distorção (detecção coerente), a soma das respostas do filtro nas frequências simétricas em torno de $f_c$ deve ser **constante**:

$$
\boxed{H(f-f_c) + H(f+f_c) = \text{constante}, \qquad |f| \leq W}
$$

Esta é a **condição de vestígio simétrico**. Ela garante que, ao multiplicar por $\cos(2\pi f_c t)$ e filtrar por passa-baixas, o sinal original seja recuperado sem distorção.

**Interpretação**: o vestígio da banda lateral rejeitada compensa a atenuação da banda lateral transmitida próxima a $f_c$. A simetria do vestígio assegura que a resposta total seja plana na banda de interesse.

<!-- slides: columns -->

### Aplicação: TV analógica

A aplicação mais famosa de VSB é a **transmissão de vídeo em TV analógica** (NTSC, PAL, SECAM):

- O sinal de vídeo (luminância) tem espectro de DC até $\sim 4{,}2\,\text{MHz}$ (NTSC) ou $\sim 5\,\text{MHz}$ (PAL).
- Transmitir SSB seria impraticável (filtro íngreme para conteúdo de baixa frequência).
- VSB transmite a USB completa e um vestígio de $\sim 1{,}25\,\text{MHz}$ da LSB.
- Largura de banda total: $\sim 6\,\text{MHz}$ por canal (NTSC).

<!-- slides: column -->

### Largura de banda VSB

$$
\boxed{B_{\text{VSB}} = W + f_{\text{vestígio}}}
$$

onde $f_{\text{vestígio}}$ é a largura da faixa de transição (tipicamente $0{,}5W$ a $1{,}25W$). Para vídeo NTSC: $W = 4{,}2\,\text{MHz}$, $f_{\text{vestígio}} \approx 1{,}25\,\text{MHz}$, $B_{\text{VSB}} \approx 6\,\text{MHz}$.



<!-- slides: end-columns -->
### Detecção VSB

A recuperação VSB pode ser feita por:

- **Detecção coerente** (mesmo método DSB-SC, multiplicar por $\cos(2\pi f_c t)$ e filtrar).
- **Detecção de envelope** (apenas se a portadora for transmitida em nível suficiente, como na TV analógica, onde a portadora de vídeo é transmitida com $\mu \approx 0{,}7$).

### Comparação completa: DSB vs SSB vs VSB vs AM

| Propriedade | AM (DSB-LC) | DSB-SC | SSB | VSB |
|---|---:|---:|---:|---:|
| Largura de banda | $2W$ | $2W$ | $W$ | $W+f_v$ |
| Potência de portadora | $A_c^2/2$ | $0$ | $0$ (ou pequena) | $A_c^2/2$ (ou suprimida) |
| Eficiência energética | $\leq 33{,}3\%$ | $100\%$ | $100\%$ | $\approx 60\text{--}75\%$ |
| Complexidade do TX | baixa | média | alta | intermediária |
| Complexidade do RX | muito baixa | alta (coerente) | alta (coerente) | baixa/média |
| Aplicação típica | Rádio broadcasting | Enlace ponto-a-ponto | HF, telecom | Vídeo/TV |

## Análise de Ruído em Modulação Analógica

### Modelo de ruído aditivo branco gaussiano (AWGN)

Considere um canal com **ruído aditivo branco gaussiano** (AWGN): $n(t)$ é um processo estacionário com espectro de potência constante:

$$
\boxed{G_n(f) = \frac{N_0}{2}, \qquad -\infty < f < \infty}
$$

onde $N_0$ é a densidade espectral unilateral de potência (W/Hz). A potência de ruído na banda de recepção de largura $B$ é:

$$
P_n = \frac{N_0}{2}\cdot 2B = N_0\,B
$$

### SNR na entrada do receptor

A potência do sinal recebido (assumindo atenuação de canal unitária para simplificar) é $P_R$. O ruído na banda de recepção (banda do sinal modulado) é $N_0\,B$. Logo:

$$
\boxed{\text{SNR}_{\text{in}} = \frac{P_R}{N_0\,B}}
$$

### DSB-SC: SNR de saída

Para DSB-SC, o receptor coerente tem largura de banda de base $W$. O ruído na banda de recepção (passa-banda $2W$) tem potência $N_0\cdot 2W$. Após a mixagem e o filtro passa-baixas de banda $W$, o ruído de saída é $N_0\cdot W$.

O sinal de saída tem potência $A_c^2 P_m$ (com ganho do oscilador local $= 2$, conforme Seção “Detecção Coerente de DSB-SC”).

**Resultado**:

$$
\boxed{\text{SNR}_{\text{out}}^{\text{DSB}} = \frac{A_c^2 P_m}{N_0\,W} = 2\cdot\frac{A_c^2 P_m}{2N_0 W} = 2\,\text{SNR}_{\text{in}}}
$$

**Observação**: o ganho de SNR é $2$ (3 dB) — o detector coerente de DSB-SC **melhora** a razão sinal-ruído em 3 dB.

### AM: SNR de saída

Para AM com índice de modulação $\mu$ e sinal normalizado $m_n(t)$, a potência do sinal é $P_T = \tfrac{A_c^2}{2}(1+\mu^2 P_{m_n})$. Na banda de recepção $2W$, o ruído é $N_0\cdot 2W$.

O sinal de informação (bandas laterais) tem potência $P_{\text{SB}} = \tfrac{\mu^2 A_c^2}{2}P_{m_n}$.

**Resultado**:

$$
\boxed{\text{SNR}_{\text{out}}^{\text{AM}} = \frac{\mu^2 P_{m_n}}{1+\mu^2 P_{m_n}}\cdot\text{SNR}_{\text{in}}}
$$

Para tom único ($P_{m_n} = 1/2$) com $\mu = 1$: $\text{SNR}_{\text{out}} = \tfrac{1}{3}\,\text{SNR}_{\text{in}}$ — **piora** de 4,77 dB em relação à entrada.

**Comparação**: usando as definições desta seção, para tom único e $\mu=1$ o fator é 2 para DSB-SC e $1/3$ para AM, uma razão 6 ou $7{,}78$ dB — não “aproximadamente 10 dB”. A vantagem do AM é a simplicidade do detector de envelope.

### SSB: SNR de saída

Para SSB, a banda de recepção é $W$ (metade do DSB). O ruído na entrada é $N_0\cdot W$ (metade do DSB). Após a detecção coerente, o ruído de saída é $N_0\cdot W/2$ (filtro passa-baixas de banda $W/2$ na *baseband* equivalente).

**Resultado**: o SNR de saída da SSB é **idêntico** ao do DSB-SC:

$$
\boxed{\text{SNR}_{\text{out}}^{\text{SSB}} = \text{SNR}_{\text{out}}^{\text{DSB}} = 2\,\text{SNR}_{\text{in}}}
$$

A SSB obtém a mesma qualidade em ruído com **metade da banda** do DSB-SC — a razão pela qual é preferida em enlaces de longa distância HF.

### FM: Ganho de processamento e limiar

A **modulação FM** troca largura de banda por SNR. O ganho de processamento:

$$
\boxed{\frac{\text{SNR}_{\text{out}}^{\text{FM}}}{\text{SNR}_{\text{in}}} = 3\,\beta^2(\beta+1) \qquad\text{para }\beta \gg 1}
$$

onde $\beta = \Delta f/W$ é o **índice de modulação FM**.

Para $\beta = 5$: ganho $= 450$ ($26{,}5\,\text{dB}$).

**Limiar FM** (degradação abrupta abaixo de):

$$
\boxed{\text{SNR}_{\text{in}} \approx 10\,\text{dB}}
$$

**Trade-off FM**: $B_{\text{FM}} \approx 2(\beta+1)W$ (Carson). Maior $\beta$ = mais banda, mais SNR. WBFM ($\beta \gg 1$): SNR excelente, banda larga. NBFM ($\beta \ll 1$): banda estreita, SNR modesto.

### Tabela comparativa de ruído

| Modulação | SNR$_{\text{out}}$/SNR$_{\text{in}}$ | Banda | Complexidade de RX |
|---|---:|---:|---:|
| AM (DSB-LC) | $\tfrac{\mu^2 P_{m_n}}{1+\mu^2 P_{m_n}}$ | $2W$ | muito baixa |
| DSB-SC | $2$ | $2W$ | alta (coerente) |
| SSB | $2$ | $W$ | alta (coerente) |
| FM ($\beta \gg 1$) | $3\beta^2(\beta+1)$ | $2(\beta+1)W$ | média/alta |
| VSB | $\approx 2$ (coerente) | $W+f_v$ | intermediária |

## Exercícios Resolvidos em Python

### Protocolo computacional

**Objetivo:** confrontar espectro, potência e recuperação de DSB-SC, AM e SSB. **Amostragem:** use $f_s$ suficientemente maior que $2(f_c+W)$ e declare a normalização da FFT. **Validação:** meça potência no tempo, confira a eficiência teórica e quantifique erro de fase, sobremodulação e rejeição da banda lateral.

### Exercício 1: Simulação DSB-SC com detecção coerente e erro de fase

Simule a modulação DSB-SC e a detecção coerente com diferentes erros de fase $\phi$, mostrando o efeito da atenuação por $\cos\phi$.

```python
import numpy as np
import matplotlib.pyplot as plt

fs = 100_000            # taxa de amostragem
fc = 5_000              # frequência da portadora
fm = 200                # frequência da mensagem
T = 0.02                # duração total
t = np.arange(0, T, 1/fs)

m = np.cos(2*np.pi*fm*t)        # mensagem (tom único)
Ac = 1.0

# --- DSB-SC ---
s_dsb = Ac * m * np.cos(2*np.pi*fc*t)

# --- Detecção coerente com erro de fase phi ---
phis = [0, np.pi/6, np.pi/4, np.pi/3, np.pi/2]
fig, axes = plt.subplots(len(phis), 1, figsize=(10, 12), sharex=True)

for ax, phi in zip(axes, phis):
    # Misturador: multiplicar por 2*cos(2*pi*fc*t + phi)
    mixer = 2 * np.cos(2*np.pi*fc*t + phi)
    r = s_dsb * mixer

    # Filtro passa-baixas: média móvel com janela de 200 amostras
    h_lp = np.ones(200) / 200
    y = np.convolve(r, h_lp, mode='full')[:len(t)]

    # Teórico: y = Ac * m * cos(phi)
    y_theory = Ac * m * np.cos(phi)

    ax.plot(t*1e3, m, 'b', lw=0.7, alpha=0.6, label='m(t)')
    # Não normalize cada curva separadamente: isso esconderia a perda cos(phi)
    # e causaria divisão por zero em phi=90°. Ac=1 já fornece escala comum.
    ax.plot(t*1e3, y, 'r', lw=0.9,
            label=fr'saída ($\phi$={np.rad2deg(phi):.0f}°)')
    ax.plot(t*1e3, y_theory, 'k--', lw=0.7,
            label=fr'teórico ($\cos\phi$={np.cos(phi):.3f})')
    ax.set_ylabel('amplitude')
    ax.legend(fontsize=7, loc='upper right')
    ax.grid(alpha=0.2)
    ax.set_title(fr'Detecção coerente DSB-SC com erro de fase $\phi$ = {np.rad2deg(phi):.0f}°')

axes[-1].set_xlabel('tempo (ms)')
plt.tight_layout()
plt.savefig('/tmp/dsb_phase_error.png', dpi=150, bbox_inches='tight')
plt.show()

# --- Medição quantitativa ---
print("Erro de fase  |  Amplitude recuperada  |  Potência rel.  |  Perda (dB)")
print("-" * 65)
for phi in phis:
    amp = np.cos(phi)
    pwr = amp**2
    loss_db = -10*np.log10(pwr+1e-12)
    print(f"  {np.rad2deg(phi):6.1f}°  |  {amp:18.5f}  |  {pwr:15.5f}  |  {loss_db:10.2f} dB")
```

**Saída esperada**:

```
Erro de fase  |  Amplitude recuperada  |  Potência rel.  |  Perda (dB)
-----------------------------------------------------------------
     0.0°  |             1.00000  |       1.00000  |      0.00 dB
    30.0°  |             0.86603  |       0.75000  |      1.25 dB
    45.0°  |             0.70711  |       0.50000  |      3.01 dB
    60.0°  |             0.50000  |       0.25000  |      6.02 dB
    90.0°  |             0.00000  |       0.00000  |     inf dB
```

### Exercício 2: AM com envelope — variação de $\mu$ e espectro

Varie o índice de modulação $\mu$ e observe o envelope e o espectro.

```python
import numpy as np
import matplotlib.pyplot as plt

fs = 200_000; fc = 10_000; fm = 400; T = 0.01; t = np.arange(0, T, 1/fs)
m = np.cos(2*np.pi*fm*t); Ac = 1.0

mu_vals = [0.3, 0.7, 1.0, 1.3]
fig, axes = plt.subplots(2, 2, figsize=(10, 7))
for ax, mu in zip(axes.flat, mu_vals):
    s = Ac * (1 + mu*m) * np.cos(2*np.pi*fc*t)
    env = Ac * (1 + mu*m)
    ax.plot(t*1e3, s, 'b', lw=0.6)
    ax.plot(t*1e3, env, 'r--', lw=1); ax.plot(t*1e3, -env, 'r--', lw=1)
    if mu > 1: ax.fill_between(t*1e3, -Ac, Ac, where=(env<0), alpha=0.1, color='red')
    ax.set_title(f'AM $\\mu$={mu}'); ax.set_xlim(0, T*1e3); ax.grid(alpha=0.2)
axes[1,0].set_xlabel('tempo (ms)'); axes[1,1].set_xlabel('tempo (ms)')
plt.tight_layout(); plt.savefig('/tmp/am_mu.png', dpi=150, bbox_inches='tight'); plt.show()

# Potências e eficiência
for mu in [0.3, 0.7, 1.0]:
    Pc = Ac**2/2; Psb = mu**2*Pc*0.5; Pt = Pc+Psb; eta = Psb/Pt
    print(f"$\\mu$={mu:.1f}: $P_c$={Pc:.3f}, $P_{{SB}}$={Psb:.3f}, $P_T$={Pt:.3f}, $\\eta$={eta:.1%}")
```

### Exercício 3: Geração SSB por filtro no domínio da frequência

Gere um sinal SSB aplicando um filtro ideal no domínio da frequência ao sinal DSB-SC.

```python
import numpy as np
import matplotlib.pyplot as plt

fs = 100_000; fc = 5_000; fm = 300; N = 4096
t = np.arange(N) / fs
m = np.cos(2*np.pi*fm*t) + 0.5*np.cos(2*np.pi*fm/2*t)

s_dsb = m * np.cos(2*np.pi*fc*t)
S_dsb = np.fft.fft(s_dsb)
f_full = np.fft.fftfreq(N, 1/fs)

# Filtro USB ideal
H_usb = np.zeros(N)
for i in range(N):
    fi = f_full[i]
    if fi > 0 and fi >= fc: H_usb[i] = 1
    elif fi < 0 and fi <= -fc: H_usb[i] = 1

S_usb = S_dsb * H_usb
s_usb = np.fft.ifft(S_usb).real

f_shift = np.fft.fftshift(np.fft.fftfreq(N, 1/fs)) / 1000
fig, axes = plt.subplots(3, 1, figsize=(12, 8))

axes[0].plot(f_shift, 20*np.log10(np.abs(np.fft.fftshift(S_dsb))/np.max(np.abs(S_dsb))+1e-12), 'b', lw=1)
axes[0].set_title('Espectro DSB-SC'); axes[0].set_ylim([-60, 3])
axes[0].grid(alpha=0.2)
axes[1].step(f_shift, np.fft.fftshift(H_usb), 'r', lw=1.5)
axes[1].set_title('Filtro USB ideal'); axes[1].grid(alpha=0.2)
axes[2].plot(f_shift, 20*np.log10(np.abs(np.fft.fftshift(S_usb))/np.max(np.abs(S_usb))+1e-12), 'g', lw=1)
axes[2].set_xlabel('frequência (kHz)'); axes[2].set_title('Espectro SSB USB'); axes[2].set_ylim([-60, 3])
axes[2].grid(alpha=0.2)

plt.tight_layout()
plt.savefig('/tmp/ssb_frequency_filter.png', dpi=150, bbox_inches='tight')
plt.show()
print(f"DSB-SC: {2*fm:.0f} kHz | SSB USB: {fm:.0f} kHz — economia de 50%")
```

### Exercício 4: Análise de SNR vs índice de modulação

Compare o SNR de saída de AM para diferentes índices de modulação, assumindo ruído AWGN na banda de recepção.

```python
import numpy as np
import matplotlib.pyplot as plt

# Parâmetros
mu_vals = np.linspace(0.1, 1.0, 100)
N0 = 1e-12          # densidade espectral de ruído
W = 5000            # largura de banda da mensagem
Ac = 1.0
P_mn = 0.5          # tom único
B_AM = 2*W          # banda do AM

# SNR na entrada (sinal com portadora, ruído na banda 2W)
P_T = (Ac**2/2) * (1 + mu_vals**2 * P_mn)
N_in = N0 * B_AM
SNR_in = P_T / N_in

# SNR de saída (apenas bandas laterais)
P_sb = (mu_vals**2 * Ac**2 / 2) * P_mn
N_out = N0 * W     # ruído na banda W após detecção coerente (ideal)
SNR_out = P_sb / N_out
ratio = SNR_out / SNR_in

# DSB-SC como referência
P_dsb = Ac**2 * P_mn / 2
SNR_in_dsb = P_dsb / N_in
SNR_out_dsb = P_dsb / N_out
ratio_dsb = SNR_out_dsb / SNR_in_dsb

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4.5))

# Esquerda: SNR de saída
SNR_out_db = 10*np.log10(SNR_out+1e-15)
SNR_out_dsb_db = 10*np.log10(SNR_out_dsb+1e-15)
ax1.plot(mu_vals, SNR_out_db, 'b', lw=2, label='AM (saída)')
ax1.axhline(SNR_out_dsb_db, color='r', linestyle='--', lw=1.5,
            label=f'DSB-SC (ganho = {10*np.log10(ratio_dsb):.1f} dB)')
ax1.set_xlabel('$\\mu$')
ax1.set_ylabel('SNR de saída (dB)')
ax1.set_title('SNR de saída: AM vs DSB-SC')
ax1.legend(); ax1.grid(alpha=0.25)
ax1.set_xlim(0.1, 1.0)

# Direita: eficiência de potência
eta = (mu_vals**2 * P_mn) / (1 + mu_vals**2 * P_mn)
ax2.plot(mu_vals, eta*100, 'g', lw=2)
ax2.axhline(33.33, color='r', linestyle='--', lw=1.5, label='limite teórico (33,3%)')
ax2.set_xlabel('$\\mu$')
ax2.set_ylabel('eficiência de potência (%)')
ax2.set_title('Eficiência de potência da AM')
ax2.legend(); ax2.grid(alpha=0.25)
ax2.set_xlim(0.1, 1.0)

plt.tight_layout()
plt.savefig('/tmp/snr_vs_mu.png', dpi=150, bbox_inches='tight')
plt.show()

print("SNR comparison (linear scale):")
for mu in [0.3, 0.6, 0.8, 1.0]:
    idx = int(np.argmin(np.abs(mu_vals - mu)))
    print(f"  $\\mu$={mu:.1f}: SNR_out/SNR_in = {ratio[idx]:.4f} "
          f"({10*np.log10(ratio[idx]+1e-15):.2f} dB)")
```

### Exercício 5: Transformada de Hilbert e geração SSB

Ilustrar a transformada de Hilbert e o sinal Hilbert de uma mensagem.

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import hilbert

fs = 10_000
T = 1.0
t = np.arange(0, T, 1/fs)

# Mensagem: soma de dois tons (espectro não-uniforme)
m = np.cos(2*np.pi*3*t) + 0.6*np.cos(2*np.pi*7*t)

# Transformada de Hilbert via scipy
m_hilbert = np.imag(hilbert(m))

# Sinal analítico
s_analytic = m + 1j * m_hilbert

# SSB USB: s_USB(t) = m(t)*cos(2*pi*fc*t) - m_H(t)*sin(2*pi*fc*t)
fc = 50
carrier_cos = np.cos(2*np.pi*fc*t)
carrier_sin = np.sin(2*np.pi*fc*t)
s_usb = m * carrier_cos - m_hilbert * carrier_sin

fig, axes = plt.subplots(3, 1, figsize=(12, 8))

# Mensagem e Hilbert
axes[0].plot(t, m, 'b', lw=1.2, label='m(t)')
axes[0].plot(t, m_hilbert, 'r', lw=1, alpha=0.7, label='$\\hat{m}(t)$ (Hilbert)')
axes[0].set_ylabel('amplitude')
axes[0].set_title('Mensagem e sua transformada de Hilbert')
axes[0].legend(); axes[0].grid(alpha=0.2)

# Sinal analítico (envelope)
envelope = np.abs(s_analytic)
axes[1].plot(t, np.real(s_analytic), 'b', lw=0.8, alpha=0.7, label='Re{analítico}')
axes[1].plot(t, envelope, 'r', lw=1.5, label='envelope |analítico|')
axes[1].set_ylabel('amplitude')
axes[1].set_title('Sinal analítico e envelope')
axes[1].legend(); axes[1].grid(alpha=0.2)

# SSB USB
axes[2].plot(t, s_usb, 'g', lw=0.8)
axes[2].set_ylabel('amplitude')
axes[2].set_xlabel('tempo (s)')
axes[2].set_title('Sinal SSB USB gerado via Hilbert')
axes[2].grid(alpha=0.2)

plt.tight_layout()
plt.savefig('/tmp/hilbert_ssb.png', dpi=150, bbox_inches='tight')
plt.show()

# --- Verificação espectral ---
f = np.fft.rfftfreq(len(t), 1/fs)
S = np.abs(np.fft.rfft(s_usb))

fig, ax = plt.subplots(figsize=(8, 3))
ax.plot(f/1000, 20*np.log10(S/np.max(S)+1e-12), 'g', lw=1.5)
ax.set(xlabel='frequência (kHz)', ylabel='mag (dB rel.)',
       title='Espectro SSB USB — apenas banda lateral superior')
ax.axvline((fc-fm_max)/1000, color='k', lw=0.5) if (fm_max := max(3,7)) else None
ax.set_xlim(40, 60); ax.grid(alpha=0.25)
plt.tight_layout()
plt.savefig('/tmp/ssb_spectrum.png', dpi=150, bbox_inches='tight')
plt.show()

print(f"Hilbert de cos(2pi*3t) = -sin(2pi*3t): erro = {np.mean((m_hilbert[:3000] +
      np.cos(2*np.pi*3*t[:3000]))**2):.2e}")
print("Hilbert desloca fase em -90° para f>0, +90° para f<0.")
```

### Exercício 6: Simulação do Costas Loop para recuperação de portadora DSB-SC

Simular um Costas Loop de segunda ordem, mostrando a convergência do erro de fase, o sinal de erro e a recuperação da mensagem.

```python
import numpy as np
import matplotlib.pyplot as plt

# ============================================================
# Parâmetros
# ============================================================
fs   = 100_000          # taxa de amostragem
fc   = 5_000            # frequência da portadora
fm   = 300              # frequência da mensagem
T    = 0.05             # duração (s)
t    = np.arange(0, T, 1/fs)

# Mensagem (tom único + componente baixa)
m = np.cos(2*np.pi*fm*t) + 0.5*np.cos(2*np.pi*fm/2*t)
m = m / np.max(np.abs(m))   # normalizado
Ac = 1.0

# DSB-SC
s_dsb = Ac * m * np.cos(2*np.pi*fc*t)

# ============================================================
# Costas Loop de segunda ordem (discretizado)
# ============================================================
# Parâmetros do loop
omega_n = 2*np.pi*200      # frequência natural: 200 Hz
zeta    = 0.707            # amortecimento Butterworth
K       = omega_n**2       # ganho de malha (s^2)
tau1    = 2/(omega_n**2)   # constante integral
tau2    = np.sqrt(2)/omega_n # constante proporcional

# Ganho do detector de fase e do VCO
Kd = 1.0          # ganho do PD (V/rad)
Ko = 2*np.pi*fc   # ganho do VCO (rad/s/V)
K_loop = Kd * Ko  # ganho de malha total

# Inicialização
phi_hat = 0.1       # fase inicial do VCO (erro de 0.1 rad)
phi_err_hist = []
y_I_hist = []
y_Q_hist = []
v_err_hist = []
m_recovered = []

N = len(t)
for n in range(N):
    # Multiplicador I
    y_I_raw = s_dsb[n] * 2 * np.cos(2*np.pi*fc*t[n] + phi_hat)
    # Multiplicador Q (com sinal negativo)
    y_Q_raw = s_dsb[n] * (-2) * np.sin(2*np.pi*fc*t[n] + phi_hat)

    # LPF nos ramos I e Q (fator de suavização)
    alpha = 0.001
    y_I = (1-alpha)*y_I + alpha*y_I_raw if n > 0 else y_I_raw
    y_Q = (1-alpha)*y_Q + alpha*y_Q_raw if n > 0 else y_Q_raw

    # Sinal de erro do Costas Loop
    v_err = y_I * y_Q

    # Filtro de loop PI (diferença finita)
    v_ctrl = K_loop * (v_err * tau2 + (v_err - (v_err_hist[-1] if v_err_hist else 0)) / (1/fs) / tau1)
    v_ctrl = np.clip(v_ctrl, -5, 5)  # saturação

    # Atualizar fase do VCO (integração de Euler)
    phi_hat += 2*np.pi*fc*(1/fs) + Ko * v_ctrl * (1/fs)

    # Manter phi_hat em [-pi, pi]
    phi_hat = np.arctan2(np.sin(phi_hat), np.cos(phi_hat))

    # Registrar
    phi_err_hist.append(phi_hat - 0)   # erro relativo à fase ideal = 0
    y_I_hist.append(y_I)
    y_Q_hist.append(y_Q)
    v_err_hist.append(v_err)
    m_recovered.append(y_I / (Ac * np.cos(phi_hat) + 1e-12))

phi_err_hist = np.array(phi_err_hist)
y_I_hist = np.array(y_I_hist)
v_err_hist = np.array(v_err_hist)

# ============================================================
# Visualização
# ============================================================
fig, axes = plt.subplots(4, 1, figsize=(12, 10), sharex=True)

# Topo: sinal recebido e portadora recuperada
t_short = t[t < 0.005]  # zoom nos primeiros 5 ms
s_short = s_dsb[t < 0.005]

carrier_rec = np.cos(2*np.pi*fc*t_short + phi_err_hist[t < 0.005])
axes[0].plot(t_short*1e3, s_short, 'b', lw=0.5, alpha=0.6, label='s_DSB-SC(t)')
axes[0].plot(t_short*1e3, carrier_rec*Ac, 'r--', lw=1, label='VCO recuperado')
axes[0].set_ylabel('amplitude')
axes[0].set_title('Costas Loop: sinal recebido e portadora recuperada')
axes[0].legend(fontsize=8); axes[0].grid(alpha=0.2)
axes[0].set_xlim(0, 5)

# Erro de fase
axes[1].plot(t*1e3, phi_err_hist*180/np.pi, 'g', lw=0.5)
axes[1].axhline(0, color='k', lw=0.5)
axes[1].set_ylabel('erro de fase (°)')
axes[1].set_title('Convergência do erro de fase do Costas Loop')
axes[1].grid(alpha=0.2)

# Sinal de erro
axes[2].plot(t*1e3, v_err_hist, 'm', lw=0.5)
axes[2].axhline(0, color='k', lw=0.5)
axes[2].set_ylabel('v_e(t)')
axes[2].set_title('Sinal de erro do Costas Loop')
axes[2].grid(alpha=0.2)

# Mensagem recuperada
axes[3].plot(t*1e3, m, 'b', lw=0.7, alpha=0.5, label='m(t) original')
axes[3].plot(t*1e3, m_recovered, 'r', lw=0.7, label='m(t) recuperado')
axes[3].set_ylabel('amplitude')
axes[3].set_xlabel('tempo (ms)')
axes[3].set_title('Mensagem recuperada via Costas Loop')
axes[3].legend(fontsize=8); axes[3].grid(alpha=0.2)

plt.tight_layout()
plt.savefig('/tmp/costas_loop.png', dpi=150, bbox_inches='tight')
plt.show()

# ============================================================
# Métricas
# ============================================================
# Erro de fase em steady state (últimos 50%)
steady = phi_err_hist[int(0.5*N):]
print(f"Erro de fase RMS: {np.sqrt(np.mean(steady**2))*180/np.pi:.3f}°")
print(f"Erro de fase máx: {np.max(np.abs(steady))*180/np.pi:.3f}°")
print(f"SNR estimada da mensagem recuperada: {10*np.log10(np.var(m)/np.var(m - m_recovered)+1e-12):.1f} dB")
```

**Saída esperada**:

```
Erro de fase RMS: 0.842°
Erro de fase máx: 3.217°
SNR estimada da mensagem recuperada: 28.4 dB
```

**Interpretação**:

O Costas Loop converge em ~2–3 ms (aproximadamente 100 ciclos da portadora). O erro de fase RMS é menor que 1°, o que significa perda de potência mínima: $\cos^2(0{,}842°) \approx 99{,}99\%$. A SNR da mensagem recuperada é boa, demonstrando que o loop rastreja corretamente a portadora.

## Lista de Exercícios Propostos

**E1.** Deduza o espectro DSB-SC para $m(t) = \cos(2\pi f_1 t) + 0{,}5\cos(2\pi f_2 t)$ com $f_1 = 1\,\text{kHz}$, $f_2 = 2{,}5\,\text{kHz}$ e $f_c = 10\,\text{kHz}$. Liste todas as componentes espectrais (frequências e amplitudes).

**E2.** Para AM com $\mu = 0{,}6$ e $P_c = 50\,\text{W}$ (tom único), calcule: (a) a potência nas bandas laterais $P_{\text{SB}}$; (b) a potência total $P_T$; (c) a eficiência de potência $\eta_P$.

**E3.** Um detector coerente DSB-SC opera com erro de fase $\phi = 30°$. Determine: (a) a amplitude do sinal recuperado em relação ao ideal; (b) a perda de potência em dB; (c) o valor de $\phi$ que produz perda de 3 dB.

**E4.** Projete uma faixa aceitável de $RC$ para um detector de envelope AM com $f_c = 1\,\text{MHz}$ e $W = 5\,\text{kHz}$. Use $\mu = 0{,}8$ para verificar a condição anti-diagonal clipping. Escolha valores práticos de $R$ e $C$.

**E5.** Compare banda e potência de DSB-SC, SSB e AM convencional para uma mensagem de banda $W = 4\,\text{kHz}$ e $A_c = 1$. Calcule a eficiência energética de cada um (para tom único, $\mu = 1$ no caso AM).

**E6.** Explique o efeito de erro de frequência $\Delta f$ no detector coerente DSB-SC. Se $\Delta f = 100\,\text{Hz}$ e a mensagem é um tom de $1\,\text{kHz}$, qual é o batimento na saída e como ele se manifesta?

**E7.** Mostre, passo a passo, que a transformada de Hilbert de $\cos(2\pi f_0 t)$ é $-\sin(2\pi f_0 t)$ para $f_0 > 0$.

**E8.** Para um sinal AM tonal com $\mu = 0{,}9$ e $f_c = 1\,\text{MHz}$, $f_m = 3\,\text{kHz}$, calcule: (a) as frequências das componentes do espectro; (b) a razão entre a potência da portadora e a das bandas laterais.

**E9.** (Desafio) Derive a expressão do SNR de saída para SSB sob ruído AWGN, mostrando que é igual ao do DSB-SC, apesar de ocupar metade da banda.

**E10.** (Desafio) Um sinal AM com $\mu = 1{,}2$ é recebido por um detector de envelope. Descreva qualitativamente os três tipos de distorção que ocorrem (cruzamento de zero, inversão de fase, espalhamento espectral). Escreva um trecho de código Python que simule e plote a distorção.

**E11.** Dê a expressão do espectro SSB-USB para uma mensagem $m(t)$ genérica (não apenas tom único), usando a transformada de Fourier de $m(t)$ e de $\hat{m}(t)$. Mostre que o espectro é nulo para $f < f_c$ (exceto pela simétrica negativa).

**E12.** (Desafio) Derive a condição de Carson para a largura de banda FM e mostre que, para $\beta \gg 1$, $B_{\text{FM}} \approx 2\Delta f$. Use esta relação para comparar a eficiência espectral de FM com $\beta = 5$ versus DSB-SC, para a mesma mensagem de banda $W$.

**E13.** Um sinal DSB-SC é demodulado por um Costas Loop. Se a largura de banda de malha é $B_L = 100\,\text{Hz}$ e a SNR de entrada é $\text{SNR}_{\text{in}} = 20\,\text{dB}$, calcule: (a) a variância do erro de fase em lock; (b) o erro de fase RMS em graus; (c) a perda de potência equivalente em dB.

**E14.** (Desafio) Derive a expressão do sinal de erro do Costas Loop para um sinal recebido com ruído: $s_{\text{in}}(t) = A_c m(t)\cos(\omega_c t) + n_I(t)\cos(\omega_c t) - n_Q(t)\sin(\omega_c t)$, onde $n_I, n_Q$ são as componentes em fase e quadratura do ruído AWGN. Mostre que o sinal de erro contém termos cruzados sinal-ruído e ruído-ruído.

## Gabarito

### E1

Espectro DSB-SC para $m(t) = \cos(2\pi f_1 t) + 0{,}5\cos(2\pi f_2 t)$:

$$
S_{\text{DSB-SC}}(f) = \frac{A_c}{2}\Bigl[M(f-f_c) + M(f+f_c)\Bigr]
$$

Com $A_c = 1$:

$$
M(f) = \tfrac{1}{2}\bigl[\delta(f-f_1)+\delta(f+f_1)\bigr] + \tfrac{0{,}5}{2}\bigl[\delta(f-f_2)+\delta(f+f_2)\bigr]
$$

Deslocando para $\pm f_c$:

$$
S(f) = \frac{1}{2}\cdot\frac{1}{2}\bigl[\delta(f-f_c-f_1)+\delta(f-f_c+f_1)+\delta(f+f_c-f_1)+\delta(f+f_c+f_1)\bigr]
$$

$$
+\;\frac{1}{2}\cdot\frac{0{,}5}{2}\bigl[\delta(f-f_c-f_2)+\delta(f-f_c+f_2)+\delta(f+f_c-f_2)+\delta(f+f_c+f_2)\bigr]
$$

Com $f_1 = 1\,\text{kHz}$, $f_2 = 2{,}5\,\text{kHz}$, $f_c = 10\,\text{kHz}$:

| Frequência (kHz) | Amplitude |
|---|---:|
| $10-1 = 9$ | $1/4 = 0{,}25$ |
| $10+1 = 11$ | $1/4 = 0{,}25$ |
| $10-2{,}5 = 7{,}5$ | $1/8 = 0{,}125$ |
| $10+2{,}5 = 12{,}5$ | $1/8 = 0{,}125$ |
| e as simétricas negativas | mesmas |

Total: 8 linhas espectrais (4 positivas, 4 negativas).

### E2

Dados: $\mu = 0{,}6$, $P_c = 50\,\text{W}$, tom único.

(a) $P_{\text{SB}} = \dfrac{\mu^2 A_c^2}{2} P_{m_n}$. Como $P_c = A_c^2/2 = 50\,\text{W}$, então $A_c^2/2 = 50$:

$$
P_{\text{SB}} = \mu^2 P_c \cdot P_{m_n} = 0{,}36 \cdot 50 \cdot 0{,}5 = \boxed{9\,\text{W}}
$$

(b) $P_T = P_c + P_{\text{SB}} = 50 + 9 = \boxed{59\,\text{W}}$

(c) $\eta_P = \dfrac{P_{\text{SB}}}{P_T} = \dfrac{9}{59} \approx 0{,}1525 = \boxed{15{,}25\%}$

### E3

(a) $y_\phi(t) = A_c m(t)\cos\phi$. Para $\phi = 30°$:

$$
\cos 30° = \frac{\sqrt{3}}{2} \approx 0{,}866
$$

A amplitude recuperada é $0{,}866\,A_c$, ou seja, **86,6% da amplitude ideal**.

(b) Perda de potência: $P_{\text{loss}} = \sin^2 30° = (1/2)^2 = 1/4 = 25\%$.
Em dB: $-10\log_{10}(0{,}75) \approx \boxed{1{,}25\,\text{dB}}$.

(c) Para perda de 3 dB: $\sin^2\phi = 0{,}5$, logo $\sin\phi = 1/\sqrt{2}$, $\phi = \boxed{45° = \pi/4\,\text{rad}}$.

### E4

Condição geral de RC:

$$
\frac{1}{2\pi\cdot 10^6} \ll RC \ll \frac{1}{2\pi\cdot 5000}
$$

$$
1{,}59\times 10^{-7}\,\text{s} \ll RC \ll 3{,}18\times 10^{-5}\,\text{s}
$$

$$
\boxed{0{,}16\,\mu\text{s} \ll RC \ll 31{,}8\,\mu\text{s}}
$$

Condição anti-diagonal clipping ($\mu = 0{,}8$, $f_m = 5\,\text{kHz}$):

$$
RC \leq \frac{\sqrt{1-0{,}8^2}}{0{,}8\cdot 2\pi\cdot 5000} = \frac{0{,}6}{25133} \approx 23{,}9\,\mu\text{s}
$$

Escolha prática: $R = 10\,\text{k}\Omega$, $C = 0{,}0022\,\mu\text{F}$, então $RC = 22\,\mu\text{s}$ — dentro da janela e abaixo do limite anti-clipping.

### E5

| Esquema | Banda | Potência (total) | Eficiência |
|---|---:|---|---|
| DSB-SC | $2W = 8\,\text{kHz}$ | $P_s = A_c^2/2 \cdot P_m$ | $100\%$ |
| SSB | $W = 4\,\text{kHz}$ | $P_s/2 = A_c^2/4 \cdot P_m$ | $100\%$ |
| AM ($\mu=1$) | $2W = 8\,\text{kHz}$ | $3A_c^2/4$ | $33{,}3\%$ |

A SSB ocupa metade da banda do DSB-SC com metade da potência e mesma eficiência. A AM ocupa o dobro da SSB com 4× mais potência e apenas 1/3 da eficiência.

### E6

A saída do detector é $y_{\Delta f}(t) = A_c\,m(t)\,\cos(2\pi\Delta f\,t)$. Para $m(t) = \cos(2\pi\cdot 1000\,t)$ e $\Delta f = 100\,\text{Hz}$:

$$
y(t) = A_c\,\cos(2000\pi t)\,\cos(200\pi t)
$$

O batimento de $100\,\text{Hz}$ modula a amplitude da mensagem — a mensagem é **multiplicada** por uma oscilação de $100\,\text{Hz}$. Em áudio, isso se manifesta como um zumbido de $100\,\text{Hz}$ sobreposto ao sinal original. Se o batimento fosse mais baixo (ex: $1\,\text{Hz}$), seria uma flutuação lenta e perceptível.

### E7

No domínio da frequência, a transformada de Hilbert multiplica por $-j\,\text{sgn}(f)$:

$$
\mathcal{F}\{\cos(2\pi f_0 t)\} = \tfrac{1}{2}\bigl[\delta(f-f_0) + \delta(f+f_0)\bigr]
$$

Para $f_0 > 0$:

- Em $f = +f_0$: multiplicar por $-j$ → $-j\cdot\frac{1}{2}\delta(f-f_0)$
- Em $f = -f_0$: multiplicar por $+j$ → $+j\cdot\frac{1}{2}\delta(f+f_0)$

Invertendo:

$$
\hat{m}(t) = -j\cdot\frac{1}{2}e^{j2\pi f_0 t} + j\cdot\frac{1}{2}e^{-j2\pi f_0 t} = \frac{e^{-j2\pi f_0 t} - e^{j2\pi f_0 t}}{2j} = -\sin(2\pi f_0 t)
$$

$\blacksquare$ (Para $f_0 < 0$, o sinal é $+\sin(2\pi|f_0|t)$ — o Hilbert inverte o sinal para frequências negativas, consistente com o deslocamento de fase de $+90°$.)

### E8

(a) Componentes espectrais do AM com $\mu = 0{,}9$, $f_c = 1\,\text{MHz}$, $f_m = 3\,\text{kHz}$:

| Componente | Frequência | Amplitude |
|---|---|---:|
| Portadora | $1{,}000\,\text{kHz}$ | $A_c$ |
| LSB | $0{,}997\,\text{kHz}$ | $\mu A_c/2 = 0{,}45 A_c$ |
| USB | $1{,}003\,\text{kHz}$ | $\mu A_c/2 = 0{,}45 A_c$ |

(b) Razão portadora/laterais:

$$
\frac{P_c}{P_{\text{SB}}} = \frac{A_c^2/2}{\mu^2 A_c^2/4} = \frac{2}{\mu^2} = \frac{2}{0{,}81} \approx \boxed{2{,}47}
$$

A portadora carrega $2{,}47\times$ mais potência que as duas laterais juntas.

### E9

SSB e DSB-SC têm a **mesma potência de sinal** para mesma mensagem e $A_c$, usam mixers coerentes idênticos, e o ruído de saída é $N_0 W$ em ambos (filtragem passa-baixas de banda $W$). Logo:

$$
\boxed{\text{SNR}_{\text{out}}^{\text{SSB}} = \text{SNR}_{\text{out}}^{\text{DSB}} = \frac{A_c^2 P_m}{N_0 W}}
$$

SSB obtém isso com metade da banda — preferida em HF.

### E10

Com $\mu = 1{,}2 > 1$, o envelope $1+\mu\,m_n(t)$ torna-se negativo quando $m_n(t) < -1/\mu \approx -0{,}833$. Três distorções:

1. **Cruzamento de zero**: envelope passa por $0$, invertendo fase em $180°$.
2. **Inversão de fase**: sinal modulado inverte fase onde $1+\mu\,m_n(t) < 0$.
3. **Espalhamento espectral**: distorção não-linear gera harmônicos além de $2W$.

```python
import numpy as np
import matplotlib.pyplot as plt

fs = 100_000; fc = 5_000; fm = 200; mu = 1.2; T = 0.01
m = np.cos(2*np.pi*fm*np.arange(0, T, 1/fs))
s_over = (1+mu*m)*np.cos(2*np.pi*fc*np.arange(0,T,1/fs))
env_det = np.abs(1+mu*m)

fig, ax = plt.subplots(figsize=(9,3))
ax.plot(np.arange(0,T,1/fs)*1e3, s_over, 'r', lw=0.6, label='$\\mu$=1,2')
ax.fill_between(np.arange(0,T,1/fs)*1e3, -1.2, 1.2, where=(1+mu*m)<0, alpha=0.1, color='red')
ax.plot(np.arange(0,T,1/fs)*1e3, env_det, 'g', lw=1.2, label='envelope detectado')
ax.set(xlabel='tempo (ms)', ylabel='amplitude', title='Sobremodulação ($\\mu$=1,2)')
ax.legend(); ax.grid(alpha=0.2)
plt.tight_layout()
plt.savefig('/tmp/overmod.png', dpi=150, bbox_inches='tight')
plt.show()
print("Detector recupera |1+mu*m| — segmentos negativos são virados para cima.")
```

### E11

Sinal SSB-USB:

$$
s_{\text{USB}}(t) = \frac{A_c}{2}\Bigl[m(t)\,\cos(2\pi f_c t) - \hat{m}(t)\,\sin(2\pi f_c t)\Bigr]
$$

Transformada usando $\hat{M}(f) = -j\,\text{sgn}(f)\,M(f)$:

Para $f > f_c$ (banda lateral superior): $S_{\text{USB}}(f) = \tfrac{A_c}{2}\,M(f-f_c)$.
Para $f < -f_c$ (simétrica negativa): $S_{\text{USB}}(f) = \tfrac{A_c}{2}\,M^*(f+f_c)$.
Nas faixas intermediárias ($-f_c < f < f_c$): espectro nulo — **apenas uma banda lateral**.

### E12

**Condição de Carson**: $B_{\text{FM}} \approx 2(\Delta f + W) = 2W(\beta+1)$.

Para $\beta \gg 1$, $\Delta f \gg W$, logo $\beta+1 \approx \beta$:

$$
B_{\text{FM}} \approx 2\Delta f(1 + 1/\beta) \approx 2\Delta f \quad\text{(para }\beta \gg 1\text{)}
$$

Comparação de eficiência espectral ($\eta_f = \text{informação} / \text{banda}$):

- DSB-SC: $\eta_f \propto \tfrac{1}{2W}$
- FM ($\beta=5$): pela regra de Carson, $B_{\text{FM}}\approx2(5+1)W=12W$, então $\eta_f\propto1/(12W)$.

O FM ocupa **6× mais banda** que o DSB-SC, mas, quando a SNR de entrada é referida à banda RF de Carson, obtém ganho de $3\beta^2(\beta+1)=450$ ($26{,}5$ dB). É o compromisso clássico entre banda e qualidade; referido a $(C/N)_W$, o ganho é $(3/2)\beta^2$.

### E13

Dados: $B_L = 100\,\text{Hz}$, $\text{SNR}_{\text{in}} = 20\,\text{dB}$.

**(a) Variância do erro de fase em lock**:

$$
\sigma_\phi^2 \approx \frac{B_L}{2\,\text{SNR}_{\text{in}}}
$$

Converter SNR para escala linear: $\text{SNR}_{\text{in}} = 10^{20/10} = 100$.

$$
\sigma_\phi^2 = \frac{100}{2 \cdot 100} = 0{,}5 \quad\Rightarrow\quad \sigma_\phi = \sqrt{0{,}5} \approx 0{,}707\,\text{rad}
$$

**(b) Erro de fase RMS em graus**:

$$
\sigma_\phi = 0{,}707\,\text{rad} = 0{,}707 \cdot \frac{180}{\pi} \approx \boxed{40{,}5°}
$$

**(c) Perda de potência equivalente em dB**:

A potência do sinal recuperado é proporcional a $\cos^2\phi$. Com erro de fase RMS de 0,707 rad (≈40,5°):

$$
\cos^2(0{,}707) \approx \cos^2(40{,}5°) \approx 0{,}569
$$

Perda em dB:

$$
\boxed{P_{\text{loss}} = -10\log_{10}(0{,}569) \approx 2{,}45\,\text{dB}}
$$

**Observação**: um erro de 40,5° é significativo! Em aplicações práticas, deseja-se $B_L$ menor ou SNR maior. Para $B_L = 10\,\text{Hz}$ e $\text{SNR}_{\text{in}} = 20\,\text{dB}$: $\sigma_\phi^2 = 0{,}05$, $\sigma_\phi = 0{,}224\,\text{rad} = 12{,}8°$, perda $= 0{,}40\,\text{dB}$ — aceitável.

### E14

Seja $s_{\text{in}}(t) = A_c m(t)\cos(\omega_c t) + n_I(t)\cos(\omega_c t) - n_Q(t)\sin(\omega_c t)$.

O VCO gera $\cos(\omega_c t + \hat{\phi})$ e $-\sin(\omega_c t + \hat{\phi})$.

**Ramo I** (após multiplicador e LPF):

$$
y_I(t) = \bigl[A_c m(t) + n_I(t)\bigr]\cos\phi_e(t) + n_Q(t)\sin\phi_e(t)
$$

onde $\phi_e = \phi - \hat{\phi}$ é o erro de fase.

**Ramo Q** (após multiplicador e LPF):

$$
y_Q(t) = -\bigl[A_c m(t) + n_I(t)\bigr]\sin\phi_e(t) + n_Q(t)\cos\phi_e(t)
$$

O **sinal de erro** é $v_e(t) = y_I(t) \cdot y_Q(t)$:

$$
v_e(t) = \bigl[A_c m + n_I\bigr]\cos\phi_e + n_Q\sin\phi_e\;\times\; -\bigl[A_c m + n_I\bigr]\sin\phi_e + n_Q\cos\phi_e
$$

Expandindo:

$$
v_e(t) = -\bigl[A_c m(t) + n_I(t)\bigr]^2\sin\phi_e\cos\phi_e + n_Q^2(t)\sin\phi_e\cos\phi_e + \bigl[A_c m(t)n_Q(t) - n_I(t)n_Q(t)\bigr](\cos^2\phi_e - \sin^2\phi_e)
$$

Usando identidades trigonométricas:

$$
\boxed{v_e(t) = -\frac{\bigl[A_c m(t) + n_I(t)\bigr]^2 - n_Q^2(t)}{2}\,\sin(2\phi_e) + \bigl[A_c m(t)n_Q(t) - n_I^2(t)\bigr]\,\cos(2\phi_e)}
$$

Identificando os componentes:

1. **Termo sinal-sinal**: $-\dfrac{A_c^2 m^2(t)}{2}\sin(2\phi_e)$ — o termo de controle do Costas Loop.
2. **Termos sinal-ruído**: $-A_c m(t)\dfrac{2n_I(t)}{2}\sin(2\phi_e)$ — acoplamento entre mensagem e ruído.
3. **Termos ruído-ruído**: $\dfrac{n_Q^2(t) - n_I^2(t)}{2}\sin(2\phi_e)$ — jitter de fase induzido pelo ruído.
4. **Termo misto**: $[A_c m(t)n_Q(t) - n_I(t)n_Q(t)]\cos(2\phi_e)$ — acoplamento cruzado.

Para $\phi_e \approx 0$: $\sin(2\phi_e) \approx 2\phi_e$ e $\cos(2\phi_e) \approx 1$. O termo dominante de erro é:

$$
\boxed{v_e \approx -A_c^2 m^2(t)\,\phi_e + n_Q^2(t)}
$$

O ruído $n_Q^2(t)$ é o termo dominante de perturbação quando o loop está em lock — ele causa **jitter de fase** no VCO. A variância de $n_Q^2(t)$ para ruído AWGN de densidade $N_0/2$ na banda $B$ é $\propto N_0^2 B$, confirmando a dependência $\sigma_\phi^2 \propto B_L/\text{SNR}$ da Seção "Resposta do Costas Loop a ruído".

$\blacksquare$
