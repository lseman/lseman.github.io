# Sincronismo

> Comunicações Digitais — Apostila de Curso
> Tópicos: Sincronismo de Portadora · Símbolo (Timing) · Quadro (Frame) · Análise de Performance · OFDM

## Antes de começar

Ao final, você deve separar aquisição de rastreio e distinguir erros de portadora, símbolo e quadro pelos seus efeitos observáveis. **Diagnóstico:** uma constelação que gira, um olho fechado e um quadro deslocado apontam para o mesmo estimador? **Evidência mínima:** injetar CFO, fase, timing e atraso de quadro separadamente e demonstrar qual malha corrige cada caso.

## Sumário

1. [O Problema do Sincronismo](#o-problema-do-sincronismo)
2. [Sincronismo de Portadora (Carrier Recovery)](#sincronismo-de-portadora-carrier-recovery)
3. [Sincronismo de Símbolo (Timing Recovery)](#sincronismo-de-símbolo-timing-recovery)
4. [Sincronismo de Quadro (Frame/Block Synchronization)](#sincronismo-de-quadro-frameblock-synchronization)
5. [Sincronismo em Sistemas OFDM](#sincronismo-em-sistemas-ofdm)
6. [Análise de Performance com Erro de Sincronismo](#análise-de-performance-com-erro-de-sincronismo)
7. [Exercícios Resolvidos em Python](#exercícios-resolvidos-em-python)
8. [Lista de Exercícios Propostos](#lista-de-exercícios-propostos)
9. [Gabarito](#gabarito)

## O Problema do Sincronismo

Em todo receptor digital, a informação está codificada em parâmetros de uma portadora — amplitude, fase, frequência ou tempo de chegada de cada símbolo. Se o receptor não conhece esses parâmetros, sua decisão é essencialmente aleatória. O **sincronismo** é o conjunto de técnicas que estima e rastreia esses parâmetros, permitindo que o receptor recupere os dados transmitidos.

### Tipologias de Sincronismo

Existem **quatro** níveis fundamentais de sincronismo, cada um resolvendo um problema distinto:

- **Sincronismo de portadora**: o receptor deve reconstruir a portadora $\cos(2\pi f_c t + \phi)$ com a mesma frequência e fase (dentro de uma ambiguidade) da transmitida. Sem isso, a constelação rotaciona continuamente (se houver offset de frequência) ou gira por um ângulo fixo (se houver offset de fase).
- **Sincronismo de símbolo (timing recovery)**: o receptor deve determinar o instante ótimo de amostragem $t_k = kT_s + \tau$ para amostrar o sinal após o filtro casado. Amostrar fora do instante ótimo gera *interferência inter-simbólica* (ISI).
- **Sincronismo de quadro (frame sync)**: o receptor precisa detectar onde começa e termina cada quadro de dados, geralmente usando um padrão conhecido (preâmbulo ou *frame alignment word*).
- **Sincronismo de bloco (channel code sync)**: em esquemas com codificação de canal (convolucional, LDPC, turbo), pode ser necessário sincronizar com a estrutura interna do código — tópico avançado fora do escopo desta apostila.

**Importante**: os quatro níveis são interdependentes. Um erro de portadora afeta a performance do detector de timing; um erro de timing afeta a estimação de canal e, por conseguinte, as decisões usadas no *carrier recovery*. Receptores práticos usam **aquisição** (busca em faixa ampla) seguida de **rastreamento** (malha estreita para acompanhar variações lentas).

### DEDUÇÃO: Impacto do Erro de Timing sobre a Amostra

Considere o sinal após o filtro casado, amostrado no instante $t = kT_s + \epsilon$, onde $\epsilon$ é o erro de timing (offset). O sinal amostrado é:

$$
y(kT_s + \epsilon) = s(kT_s + \epsilon) + n(kT_s + \epsilon)
$$

Expandindo em série de Taylor ao redor do instante ideal $kT_s$:

$$
s(kT_s + \epsilon) = s(kT_s) + \epsilon\,s'(kT_s) + \frac{\epsilon^2}{2}\,s''(kT_s) + \mathcal{O}(\epsilon^3)
$$

O primeiro termo $s(kT_s)$ é o símbolo desejado. O segundo termo $\epsilon\,s'(kT_s)$ é a **componente de interferência** — proporcional à derivada do pulso no instante de amostragem. Se $\epsilon = 0$, essa interferência desaparece (desde que o pulso satisfaça o critério de Nyquist).

Para um pulso $p(t)$ transmitido com símbolos $a_n$:

$$
s(t) = \sum_{n=-\infty}^{\infty} a_n\,p(t - nT_s)
$$

Logo:

$$
y(kT_s + \epsilon) = \sum_{n=-\infty}^{\infty} a_n\,p((k-n)T_s + \epsilon) + n_k
$$

**Definição** de interferência inter-simbólica (ISI) induzida por timing offset: quando $\epsilon \neq 0$, os termos com $n \neq k$ não se anulam mais, contaminando a decisão do símbolo $a_k$ com contribuições de símbolos adjacentes.

A potência da ISI depende de $|\epsilon|$ e da forma do pulso $p(t)$. Para um pulso *raised cosine* com fator de *rolloff* $\alpha$, a ISI induzida por $\epsilon$ é:

$$
\text{ISI}(\epsilon) = \sum_{n\neq 0} a_{k-n}\,p(nT_s + \epsilon)
$$

**Resultado** crucial: para $\alpha = 1$ (raised cosine com rolloff total), a ISI cresce aproximadamente linearmente com $|\epsilon|/T_s$ para pequenos offsets. Para $\alpha = 0$ (sinc, banda estreita), a ISI cresce mais rapidamente porque as laterais do sinc são mais lentas.

### Jitter e Phase Noise

**Definição** de *jitter*: variação temporal aleatória do instante de amostragem em relação ao valor ideal. O jitter é caracterizado pelo seu desvio padrão $\sigma_\tau$ ou pela sua densidade espectral de fase.

**Definição** de *phase noise*: flutuação aleatória de fase da portadora no receptor, tipicamente causada pela instabilidade do oscilador local. O phase noise é descrito pela densidade espectral lateral $S_\phi(f)$ ou, equivalentemente, pelo *single-sideband noise* $L(f)$.

Em termos de constelação, o jitter provoca espalhamento radial (ao longo do raio), enquanto o phase noise provoca espalhamento angular (ao longo da circunferência). Ambos degradam a BER, mas de formas distintas — o jitter afeta principalmente a detecção de amplitude (ASK, PAM), enquanto o phase noise afeta a detecção de fase (PSK, QAM).

### Modelo Unificado do Receptor

O modelo de banda base equivalente de um receptor com erros de sincronismo é:

$$
r(t) = a\,e^{j(2\pi\Delta f t + \phi)}\sum_{n} a_n\,p(t - nT_s - \tau) + n(t)
$$

onde:

- $a$: ganho do canal (atenuação)
- $\Delta f$: offset de frequência da portadora (CFO, *Carrier Frequency Offset*)
- $\phi$: offset de fase residual
- $a_n$: símbolos transmitidos (constelação)
- $p(t)$: forma de pulso (raised cosine, geralmente)
- $\tau$: erro de timing (offset de amostragem)
- $n(t)$: ruído AWGN

O objetivo do sincronismo é estimar $a$, $\Delta f$, $\phi$ e $\tau$ a partir de $r(t)$ e compensá-los antes da decisão.

## Sincronismo de Portadora (Carrier Recovery)

### O Problema

Para demodulação coerente, o receptor precisa de uma referência com a mesma frequência e fase da portadora transmitida. O oscilador local do receptor geralmente opera em uma frequência $f_c + \Delta f$ e fase $\hat{\phi}$ diferentes das ideais. O sinal demodulado torna-se:

$$
r_{\text{demod}}(t) = r(t)\cdot 2\cos(2\pi f_c t + \hat{\phi}) = \text{Re}\left\{r(t)\,e^{-j\hat{\phi}}\right\}
$$

Em banda base equivalente, isso equivale a multiplicar $r(t)$ por $e^{-j\hat{\phi}}$, o que **roda a constelação** por $-\hat{\phi}$. Se $\Delta f \neq 0$, a rotação é contínua: $e^{j(2\pi\Delta f t + \phi - \hat{\phi})}$.

### Costas Loop para PSK

Um *Costas loop* é um PLL cuja variável de erro é construída a partir das componentes I/Q, de modo que a modulação de dados não produza erro médio quando a malha está travada. Em uma implementação **decision-directed**, decide-se o símbolo mais próximo $\hat a_n$ e usa-se, por exemplo,

$$e_\phi[n]=\operatorname{Im}\{r_n\hat a_n^*\}.$$

Outro recuperador não orientado a decisão, frequentemente apresentado junto do Costas, é o método da **$M$-ésima potência**. Ele eleva o sinal à potência $M$ para remover os dados de uma constelação M-PSK. Para $a_n=e^{j2\pi k/M}$:

$$
\left(a_n\,e^{j(\omega t + \theta)}\right)^M = a_n^M\,e^{jM(\omega t + \theta)} = 1 \cdot e^{jM(\omega t + \theta)}
$$

pois $a_n^M = e^{j2\pi k} = 1$. A informação de dados foi removida; resta apenas o termo $e^{jM(\omega t + \theta)}$ que carrega a fase.

#### Dedução do erro decision-directed para QPSK

Considere QPSK ($M=4$). O sinal recebido após o conversor de fase é:

$$
r_{\text{mix}} = a_n\,e^{j(\omega t + \theta)} \cdot e^{-j\hat{\phi}} = a_n\,e^{j(\omega t + \theta - \hat{\phi})}
$$

onde $\theta$ é a fase da portadora transmitida e $\hat{\phi}$ é a fase do NCO (*Numerically Controlled Oscillator*). Defina o erro de fase residual $\epsilon_\phi = \theta - \hat{\phi}$.

Suponha que a decisão esteja correta, $\hat a_n=a_n$, e omita o CFO durante a análise local. Então

$$r_n\hat a_n^*=a_ne^{j\epsilon_\phi}a_n^*=|a_n|^2e^{j\epsilon_\phi}.$$

Como QPSK tem $|a_n|^2=1$,

$$\boxed{e_\phi[n]=\operatorname{Im}\{r_n\hat a_n^*\}=\sin\epsilon_\phi\approx\epsilon_\phi.}$$

O erro é aproximadamente linear perto do lock. A ambiguidade de $90^\circ$ permanece: uma rotação de $k\pi/2$ apenas permuta os símbolos QPSK e precisa ser resolvida por preâmbulo ou codificação diferencial. Já o detector de quarta potência tem característica proporcional a $\sin(4\epsilon_\phi)$; são detectores diferentes e suas curvas não devem ser misturadas.

### Teorema da Estabilidade do Costas Loop

Para o detector da $M$-ésima potência, $e(\epsilon)=\sin(M\epsilon)$. Com realimentação de sinal correto, os equilíbrios de inclinação positiva, $\epsilon=2k\pi/M$, são estáveis; os pontos intermediários, $\epsilon=(2k+1)\pi/M$, são instáveis. A região local ao redor de cada equilíbrio estável é delimitada pelos equilíbrios instáveis:

$$
\boxed{-\frac{\pi}{M}<\epsilon_\phi-\frac{2k\pi}{M}<\frac{\pi}{M}.}
$$

Isso descreve apenas a dinâmica ideal de fase, sem CFO, ruído, atraso ou saturação. Não é um teorema “se e somente se” de aquisição do PLL completo. Como os $M$ equilíbrios estáveis diferem por $2\pi/M$, todos são equivalentes geometricamente para M-PSK, mas o mapeamento de bits continua ambíguo.

### PLL de Primeira Ordem para Carrier Recovery

Um PLL de primeira ordem consiste em:

1. **Detector de fase**: produz erro $e_\phi$ (ex.: $\sin(M\epsilon_\phi)$ para Costas loop).
2. **Filtro de malha**: para PLL de 1ª ordem, é um ganho constante $K$.
3. **NCO**: gera $e^{j(\omega t + \hat{\phi})}$ onde $\dot{\hat{\phi}} = K\cdot e_\phi$.

Em lock, o erro de fase em regime permanente para um offset de frequência constante $\Delta f$ é:

$$
\epsilon_\phi^{\text{ss}} = \frac{\Delta\omega}{K_dK_0} = \frac{2\pi\Delta f}{K_dK_0}
$$

onde $K_dK_0$ deve estar em rad/s por rad. Em uma implementação discreta, o ganho precisa ser definido junto com $T_s$; não se pode dividir uma frequência em hertz por um ganho adimensional e chamar o resultado de fase.

**Faixa de lock** (hold range): o intervalo de frequências dentro do qual o PLL mantém lock:

$$
\boxed{|\Delta\omega| < K_dK_0\,e_{\max}}
$$

com $e_{\max}$ igual ao maior valor útil da característica do detector. A faixa exata depende, portanto, dos ganhos, unidades e não linearidade da malha — não apenas da ordem $M$.

**Faixa de aquisição** (lock range): o intervalo maior dentro do qual o PLL pode eventualmente adquirir lock, geralmente maior que a faixa de lock devido a efeitos de varredura de frequência.

### Carrier Recovery para QAM: Decision-Directed e Piloto-Assisted

**Definição** de *decision-directed carrier recovery*: após o detector de decisão, os símbolos decididos $\hat{a}_k$ são usados para gerar uma referência de fase. O erro de fase é:

$$
e_\phi[k] = \operatorname{Im}\{r_k \cdot \hat{a}_k^*\}
$$

onde $r_k$ é o símbolo recebido e $\hat{a}_k^*$ é o complexo conjugado do símbolo decidido (normalizado para unit magnitude). Este erro é proporcional a $\sin\epsilon_\phi$ para pequenos erros.

**Estimativa de fase por pilotos**: quando pilotos conhecidos $\{d_p\}$ são inseridos em posições específicas do símbolo, a estimativa de fase é:

$$
\boxed{\hat{\phi}_k = \arg\left(\sum_{p \in \text{pilotos}} r_p\,d_p^*\right)}
$$

Os pilotos fornecem uma referência confiável independente das decisões, sendo adequados para baixa SNR. O custo é o *overhead* de taxa: cada símbolo piloto não carrega dados.

**Comparação**:

| | Decision-Directed | Piloto-Assisted |
|---|---|---|
| Overhead | zero | $\approx$ 5-10% típico |
| SNR mínima | moderada (decisões corretas) | qualquer (independente de decisões) |
| Dinâmica | bom tracking em lock | preciso mas computacionalmente mais pesado |
| Aplicação | enlaces estáveis | enlaces com fade rápido ou baixa SNR |

### Estimador de CFO por Preâmbulo Repetido

Um método simples e poderoso para estimar o offset de frequência é usar um **preâmbulo repetido**: duas cópias idênticas de um padrão, separadas por $D$ amostras. A correlação entre as duas partes contém o termo de fase acumulada:

$$
P = \sum_{n=0}^{L-1} r[n+D] \cdot r^*[n]
$$

Se $r[n] = a_n e^{j(2\pi\Delta f n/F_s + \phi)} + \text{ruído}$, então:

$$
P = \sum_{n=0}^{L-1} |a_n|^2 e^{j2\pi\Delta f D/F_s} + \text{termos de ruído}
$$

$$
\boxed{\widehat{\Delta f} = \frac{F_s}{2\pi D}\arg(P)}
$$

A **faixa não ambígua** é determinada pela condição de que a fase acumulada em $D$ amostras seja menor que $\pi$:

$$
\boxed{|\Delta f| < \frac{F_s}{2D}}
$$

Esta faixa é tipicamente estreita (da ordem de kHz para $D \approx 64$ e $F_s = 1$ MHz), mas suficiente como estimativa grosseira, seguida de um Costas loop para rastreamento fino.

```python
import numpy as np
import matplotlib.pyplot as plt

# === Costas Loop para QPSK: Tracking de Fase ===
# Objetivo: demonstrar a convergência do Costas loop e o efeito
# do ganho de malha K na velocidade de tracking vs. jitter residual.

np.random.seed(42)
N = 2000          # número de símbolos
M = 4             # QPSK
K = 0.05          # ganho de malha
F_c = 0.02        # offset de frequência normalizado (cycles/symbol)
phi_init = 0.4    # erro de fase inicial (radianos)

# Gerar símbolos QPSK
symbols = np.exp(1j * np.pi/2 * np.random.randint(0, 4, N))

# Gerar ruído AWGN (SNR = 15 dB)
EbN0_db = 15
sigma = 10**(-EbN0_db/20)
noise = sigma * (np.random.randn(N) + 1j*np.random.randn(N)) / np.sqrt(2)

# Simular canal com CFO e fase inicial
t = np.arange(N)
channel = np.exp(1j * (2*np.pi*F_c*t + phi_init))
received = symbols * channel + noise

# Costas loop (decision-directed para QPSK)
phase_est = np.zeros(N)
phase_dot = phi_init
corrected = np.zeros(N, dtype=complex)

for k in range(N):
    demod = received[k] * np.exp(-1j * phase_dot)
    d_i = 1 if demod.real >= 0 else -1
    d_q = 1 if demod.imag >= 0 else -1
    decision = d_i + 1j*d_q
    error = np.imag(demod * np.conj(decision) / np.abs(decision))
    phase_dot += K * error
    phase_est[k] = phase_dot % (2*np.pi)
    corrected[k] = received[k] * np.exp(-1j * phase_dot)

phase_error = ((phase_est - phi_init - 2*np.pi*F_c*t + np.pi) % (2*np.pi)) - np.pi
print(f"Erro RMS residual: {np.std(phase_error):.4f} rad ({np.std(phase_error)*180/np.pi:.2f}°)")
print(f"Erro médio residual: {np.mean(phase_error):.4f} rad")

# Plot: rastreamento de fase
fig, ax = plt.subplots(figsize=(10, 4))
ax.plot(phase_est[:500]/np.pi, label='Fase estimada', color='#2563eb')
ax.plot((phi_init + 2*np.pi*F_c*np.arange(500))/np.pi, label='Fase real', color='#dc2626', linestyle='--')
ax.set_xlabel('Símbolo')
ax.set_ylabel('Fase (π rad)')
ax.set_title('Costas Loop: rastreamento de fase QPSK (K=0.05, SNR=15 dB)')
ax.legend(); ax.grid(alpha=.2)
plt.tight_layout()
plt.close()

# Plot: constelação corrigida
fig, ax = plt.subplots(figsize=(5, 5))
ax.scatter(corrected[:500].real, corrected[:500].imag, s=8, alpha=.4, color='#2563eb')
ideal = np.array([1, -1, 1j, -1j]) / np.sqrt(2)
ax.scatter(ideal.real, ideal.imag, s=120, facecolors='none', color='#dc2626',
           marker='x', linewidths=2)
ax.axhline(0, color='k', lw=.5, alpha=.3)
ax.axvline(0, color='k', lw=.5, alpha=.3)
ax.set_xlabel('I'); ax.set_ylabel('Q')
ax.set_title('Constelação QPSK após Costas loop (corrigida)')
ax.set_aspect('equal'); ax.grid(alpha=.2)
plt.tight_layout()
plt.close()

# Sensibilidade ao ganho K
fig, ax = plt.subplots(figsize=(7, 4))
K_vals = np.linspace(0.001, 0.2, 100)
rms_errors = []
for K_test in K_vals:
    ph = phi_init
    errs = []
    for k in range(N):
        demod = received[k] * np.exp(-1j * ph)
        d_i = 1 if demod.real >= 0 else -1
        d_q = 1 if demod.imag >= 0 else -1
        err = np.imag(demod * np.conj(d_i + 1j*d_q) / np.abs(d_i + 1j*d_q))
        ph += K_test * err
        phase_err = ((ph - phi_init - 2*np.pi*F_c*k + np.pi) % (2*np.pi)) - np.pi
        errs.append(phase_err)
    rms_errors.append(np.std(errs))
ax.plot(K_vals, np.array(rms_errors)*180/np.pi, color='#7c3aed', lw=2)
ax.set_xlabel('Ganho de malha K')
ax.set_ylabel('Erro RMS (graus)')
ax.set_title('Trade-off: ganho K vs. jitter residual (SNR=15 dB)')
ax.grid(alpha=.2)
plt.tight_layout()
plt.close()

print("✓ Costas loop simulation complete.")
```

## Sincronismo de Símbolo (Timing Recovery)

### Definição e Objetivo

**Definição**: sincronismo de símbolo (ou *timing recovery*) é o processo de ajustar o instante de amostragem do receptor para que cada símbolo seja amostrado no ponto ótimo (máximo da "janela do olho"), minimizando a interferência inter-simbólica (ISI).

O receptor geralmente opera com uma taxa de amostragem $F_s$ que é um múltiplo inteiro (ou racional) da taxa de símbolos $R_s = 1/T_s$. O objetivo é determinar o **offset fracionário** $\tau$ tal que as amostras no instante $t_k = k/F_s + \tau$ correspondam aos instantes ótimos de amostragem.

### DEDUÇÃO: Extração de Componente Periódica do Sinal

Considere o sinal recebido após o filtro casado:

$$
r(t) = \sum_{n=-\infty}^{\infty} a_n\,p(t - nT_s + \epsilon T_s) + n(t)
$$

onde $\epsilon T_s$ é o erro de timing (agora normalizado por $T_s$). Mesmo quando $\epsilon \neq 0$, o sinal $r(t)$ possui uma **componente periódica** na frequência $R_s = 1/T_s$, pois os símbolos $a_n$ são estacionários.

A densidade espectral de potência (PSD) do sinal transmitido com pulso $p(t)$ é:

$$
S_s(f) = \frac{1}{T_s}|P(f)|^2 \cdot S_a(f)
$$

onde $S_a(f)$ é a PSD da sequência de símbolos. Se a sequência é aleatória i.i.d., $S_a(f)$ é plana, e a PSD é simplesmente $|P(f)|^2/T_s$.

**Estratégia**: elevar o sinal ao quadrado (ou à potência $2M$ para $M$-PSK). A não-linearidade cria componentes espectrais em múltiplos de $R_s$. Para um pulso raised cosine, o produto cruzado $a_n a_m\,p(t-nT_s)p(t-mT_s)$ gera termos periódicos em $f = k/T_s$. Um filtro passa-faixa estreito em torno de $R_s$ extrai a componente de clock:

$$
y_{\text{clock}}(t) \approx C \cdot \cos(2\pi R_s t + \varphi)
$$

onde $\varphi$ depende de $\epsilon$. Um detector de zero-crossing produz pulsos de clock sincronizados com a taxa de símbolos, cujo timing é ajustado pela fase $\varphi$.

**Limitação**: funciona melhor para sinais com envelope constante (PSK) e falha para sinais com variação de amplitude (QAM, PAM).

### Detector de Erro de Timing (TED): Gardner

**Definição** do detector de erro de timing de Gardner, com duas amostras por símbolo:

$$
\boxed{e_k=\operatorname{Re}\!\left\{y_k^*\bigl(y_{k-1/2}-y_{k+1/2}\bigr)\right\}}
$$

onde $y_{k}$ é a amostra em $kT$ e $y_{k\pm 1/2}$ são as amostras em $(k\pm 1/2)T$.

#### DEDUÇÃO do Gardner TED

Para QPSK, $a_n = I_n + jQ_n$ com $I_n, Q_n \in \{\pm 1/\sqrt{2}\}$. A componente I é:

$$
y_I(t) = \sum_n I_n p(t - nT_s + \epsilon T_s)
$$

O detector usa, em cada atualização, a amostra de símbolo e as duas meias-amostras adjacentes. O sinal global pode mudar conforme a convenção adotada pelo interpolador; aqui usamos “anterior menos posterior”. Para dados reais, a expressão reduz-se ao produto usual $y_k(y_{k-1/2}-y_{k+1/2})$.

Para $\epsilon=0$, a diferença não precisa ser zero em cada símbolo. O resultado relevante é estatístico: para símbolos independentes, de média zero, e um pulso simétrico, $\mathbb E[e_k]=0$ no instante correto. Para pequeno erro, $\mathbb E[e_k]\approx K_d\epsilon$, onde a inclinação $K_d$ depende do pulso, do rolloff e da potência dos símbolos.

O Gardner é **não orientado a decisão** e funciona com PAM, PSK e QAM; QAM não tem amplitude constante, nem isso é necessário. Ele requer transições estatísticas suficientes e excesso de banda para uma curva-S útil. Quando $\alpha\to0$, a informação de timing e a inclinação do detector diminuem, tornando aquisição e jitter piores; portanto, “funciona para qualquer $\alpha$” não significa desempenho uniforme, e no limite ideal $\alpha=0$ pode haver degeneração.

**Vantagens do Gardner**:

- Não requer decisões (non-data-directed)
- Funciona numa ampla faixa de rolloff; a inclinação piora quando $\alpha\to0$
- Opera a 2 amostras/símbolo (eficiente)

**Limitação**: zona morta muito estreta em $\epsilon = 0$, dificultando aquisição para offsets grandes.

### Detector de Mueller & Müller (M&M)

**Definição** do detector de Mueller & Müller: opera a **1 amostra por símbolo** e é **decision-directed**:

$$
\boxed{e_k=\operatorname{Re}\!\left\{y_k\hat a_{k-1}^*-y_{k-1}\hat a_k^*\right\}}
$$

O sinal pode ser invertido conforme a convenção do interpolador. As decisões $\hat a_k$ removem a dependência dos dados; por isso o M&M funciona melhor depois de uma aquisição inicial e degrada quando há muitos erros de decisão.

#### DEDUÇÃO do M&M

Para um pulso raised cosine, $p(nT_s) = \delta[n]$ apenas quando $\epsilon = 0$. Quando $\epsilon \neq 0$:

$$
y_k \approx a_k p(\epsilon T_s) + a_{k-1} p((1-\epsilon)T_s) + a_{k+1} p((-1-\epsilon)T_s) + \dots
$$

O M&M combina duas amostras consecutivas e suas decisões. Sob decisões corretas e média sobre dados independentes, os termos desejados se cancelam e sobra uma função ímpar do erro de timing; perto do lock, $\mathbb E[e_k]\approx K_{\rm MM}\epsilon$.

$$
\boxed{\mathbb E[e_k]\propto p((1+\epsilon)T_s)-p((1-\epsilon)T_s)}
$$

**Vantagens do M&M**: opera a 1 amostra/símbolo; função de erro linear em $\epsilon$; sem zona morta.
**Limitação**: decision-directed, requer lock prévio do carrier recovery e SNR suficiente.

### PLL de Timing e Interpolador

A estrutura do PLL de timing é análoga ao PLL de fase:

1. **TED** (Gardner ou M&M): produz erro $e_k$
2. **Filtro de malha**: filtro digital (tipicamente IIR ou FIR)
3. **VCO de taxa de símbolos**: ajusta a taxa de amostragem efetiva

O **interpolador fracionário** é o bloco que realiza a correção de timing em escala sub-símbolo. Um interpolador FIR com $M$ taps gera uma amostra interpolada em qualquer instante $\tau$:

$$
y(\tau) = \sum_{n=0}^{M-1} x[n] \cdot p_{\text{interp}}(\tau - nT_s)
$$

O **interpolar polifásico** é a implementação eficiente: o filtro é dividido em $L$ fases, cada uma correspondendo a um deslocamento de $\tau = k/L$.

### Comparação de TEDs

| Detector | Amostragem | Data-directed | Zona morta | Complexidade |
|---|---|---|---|---|
| Early-Late | $\geq 2$/símbolo | Não | Sim (depende de $\alpha$) | Baixa |
| Gardner | 2/símbolo | Não | Mínima | Moderada |
| Mueller & Müller | 1/símbolo | Sim | Não | Moderada |

```python
import numpy as np
import matplotlib.pyplot as plt

# === Timing Error Detector (TED): Resposta ao erro de timing ===
np.random.seed(42)

N = 10000
alpha = 0.25
Fs = 4
SNR_db = 20

# Gerar símbolos QAM-16
symbols = (2*np.random.randint(0,4,N)-1.5) + 1j*(2*np.random.randint(0,4,N)-1.5)
symbols = symbols / np.sqrt(10)

def rc_pulse(t_vals, alpha=0.25):
    result = np.zeros_like(t_vals)
    eps = 1e-12
    near_zero = np.abs(t_vals) < eps
    near_edge = np.abs(np.abs(t_vals) - 0.5/alpha) < eps
    result[near_zero] = 1.0
    result[near_edge] = np.pi/4 * np.sinc(0.5/alpha)
    not_special = ~near_zero & ~near_edge
    t_s = t_vals[not_special]
    result[not_special] = np.sinc(t_s) * np.cos(np.pi*alpha*t_s)/(1-(2*alpha*t_s)**2)
    return result

t_full = np.arange(-30, 30+1) / Fs
tx_signal = np.zeros(len(t_full), dtype=complex)
for n in range(N):
    tx_signal += symbols[n] * rc_pulse(t_full - n, alpha)

sigma = 10**(-SNR_db/20) / np.sqrt(2)
noise = sigma * (np.random.randn(len(tx_signal)) + 1j*np.random.randn(len(tx_signal)))
r = tx_signal + noise

# Varredura de erro de timing
epsilons = np.linspace(-0.45, 0.45, 91)
gardeners = np.zeros_like(epsilons)
mm_errors = np.zeros_like(epsilons)

for i, eps in enumerate(epsilons):
    sample_indices = np.arange(-15, N+15) + eps
    samples = np.interp(sample_indices, t_full, r)
    
    g_errs = []
    for k in range(1, N//2 - 1):
        y0, y_half1, y_half2 = samples[2*k], samples[2*k-1], samples[2*k+1]
        g_errs.append(np.real(y0 * np.conj(y_half1)) - np.real(np.conj(y0) * y_half2))
    gardeners[i] = np.mean(np.abs(g_errs)) if g_errs else 0
    
    mm_errs = []
    for k in range(1, N//2 - 1):
        y_even, y_odd = samples[2*k], samples[2*k-1]
        d_even = symbols[2*k] / np.abs(symbols[2*k]) if np.abs(symbols[2*k]) > 1e-10 else 0
        d_odd = symbols[2*k-1] / np.abs(symbols[2*k-1]) if np.abs(symbols[2*k-1]) > 1e-10 else 0
        mm_errs.append(np.real((y_even - d_even)*np.conj(d_odd)) + np.real(np.conj(d_even)*(y_odd - d_odd)))
    mm_errors[i] = np.mean(mm_errs) if mm_errs else 0

fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(epsilons, gardeners, 'b-', lw=2, label='Gardner (magnitude média)')
ax.plot(epsilons, mm_errors, 'r-', lw=2, label='Mueller & Müller')
ax.axvline(0, color='k', linestyle='--', alpha=.3)
ax.set_xlabel(r'Erro de timing $\epsilon$ (símbolos)')
ax.set_ylabel('Valor médio do erro (TED)')
ax.set_title('Resposta do TED: Gardner vs. Mueller-Müller (QAM-16, α=0.25, SNR=20 dB)')
ax.legend(); ax.grid(alpha=.2)
plt.tight_layout()
plt.close()

# Constelação vs. erro de timing
fig, axes = plt.subplots(2, 3, figsize=(12, 7))
eps_test = [-0.4, -0.2, 0.0, 0.2, 0.4, 0.45]
for ax, eps in zip(axes.flat, eps_test):
    idx = np.clip((np.arange(N) + eps).astype(int), 0, len(r)-1)
    sampled = r[idx][::int(Fs)]
    ax.scatter(sampled.real[:500], sampled.imag[:500], s=5, alpha=.3)
    ax.set_title(f'$\\epsilon$ = {eps:+.2f}')
    ax.set_xlim(-1.5, 1.5); ax.set_ylim(-1.5, 1.5)
    ax.axhline(0, color='k', lw=.3, alpha=.3)
    ax.axvline(0, color='k', lw=.3, alpha=.3)
    ax.set_aspect('equal'); ax.grid(alpha=.15)
    ax.set_ylabel('Q') if ax in axes[:,0] else None
    ax.set_xlabel('I') if ax in axes[1,:] else None
plt.suptitle('Constelação amostrada vs. erro de timing (QAM-16, SNR=20 dB)', fontsize=11, y=1.01)
plt.tight_layout()
plt.close()

print("✓ Timing error detector simulations complete.")
```

## Sincronismo de Quadro (Frame/Block Synchronization)

### O Problema

Após recuperar a portadora e o timing, o receptor ainda não sabe onde começa e termina cada quadro (frame) de dados. O **sincronismo de quadro** resolve este problema, identificando a posição inicial de cada bloco de bits/símbolos.

### Preâmbulo e Detecção por Correlação

**Definição** de preâmbulo: sequência de bits ou símbolos conhecida, transmitida no início de cada quadro. O receptor correlaciona o sinal recebido com a sequência esperada; quando a correlação excede um limiar, um novo quadro foi detectado.

A correlação sliding é:

$$
C[k] = \sum_{n=0}^{L-1} r[k+n] \cdot p^*[n]
$$

onde $L$ é o comprimento do preâmbulo, $p[n]$ é a sequência conhecida, e $r[k]$ é o sinal recebido (amostrado no instante ótimo).

Para detecção robusta, normaliza-se a correlação pela energia recebida:

$$
\rho[k] = \frac{|C[k]|^2}{\left(\sum_{n=0}^{L-1} |r[k+n]|^2\right) \cdot \left(\sum_{n=0}^{L-1} |p[n]|^2\right)}
$$

### DEDUÇÃO da Probabilidade de Falso Alarme

Sob hipótese nula ($H_0$, apenas ruído AWGN $n[k] \sim \mathcal{CN}(0, \sigma_n^2)$):

$$
C[k] = \sum_{n=0}^{L-1} n[k+n] \cdot p^*[n]
$$

O módulo ao quadrado $|C[k]|^2$ segue distribuição exponencial:

$$
|C[k]|^2 \sim \text{Exp}(\lambda), \quad \lambda = \frac{1}{\sigma_n^2 E_p}
$$

$$
\boxed{P_{FA} = \Pr\{|C[k]|^2 > \gamma\} = e^{-\gamma/(\sigma_n^2 E_p)} = e^{-\gamma/(N_0 E_p/2)}}
$$

Para $E_p/N_0 = 20$ dB e $\gamma = 10 \cdot \sigma_n^2 E_p$:

$$
P_{FA} = e^{-10} \approx 4{,}5 \times 10^{-5}
$$

### Frame Alignment Word (FAW) e Sequências m

**Definição** de Frame Alignment Word (FAW): padrão de bits com propriedades de auto-correlação excepcionais, usado para sincronismo de quadro em sistemas digitais (SDH/SONET, GSM). Um FAW ideal tem:

- Auto-correlação quase-perfita em zero-lag (pico alto)
- Auto-correlação lateral próxima de zero (picos espúrios baixos)
- Baixa ambiguidade de sincronismo

**Sequências m (m-sequences)**: geradas por registradores de deslocamento com feedback linear:

$$
R_m(\tau) = \begin{cases} m & \tau = 0 \\ -1 & \tau \neq 0 \end{cases}
$$

onde $m = 2^n - 1$ é o período. A relação de pico-lateral é $(m+1)/(m-1) \approx 1$ para $m$ grande — **ruim** para detecção direta.

**Melhoria**: sequências de Barker (comprimentos: 2, 3, 4, 5, 7, 11, 13) ou Zadoff–Chu (para OFDM).

### Algoritmo de Busca

1. **Sliding correlation**: $O(L \cdot N_{\text{samples}})$. Simples, mas lento.
2. **Parallel correlation (FFT)**: $O(N_{\text{samples}} \log N_{\text{samples}})$. Mais rápido para preâmbulos longos.

Prática: etapa grossa (FFT) + etapa fina (sliding na região de interesse).

### Detecção de Pacote

Em sistemas burst, detectar o início do pacote antes do preâmbulo:

$$
E[k] = \sum_{n=0}^{M-1} |r[k+n]|^2
$$

Quando $E[k]$ excede um limiar baseado no nível de ruído estimado, um pacote foi detectado.


### DEDUÇÃO: Ganho de Correlação com Preâmbulo Repetido

Com duas cópias idênticas $p$ de comprimento $L/2$:

$$
P[k] = \sum_{n=0}^{L/2-1} r[k+n+L/2] \cdot r^*[k+n]
$$

Para $E_s \gg N_0$:

$$
\text{SNR}_{\text{det}} \approx \frac{L}{2} \cdot \frac{E_s}{N_0}
$$

**Resultado**: ganho de correlação de $L/2$. Para 64 símbolos: ganho de 18 dB.

## Sincronismo em Sistemas OFDM

<!-- slides: columns -->

### Desafios do OFDM

OFDM exige **três tipos** de sincronismo simultaneamente:

1. **Timing sync**: identificar o início da FFT window (antes do CP)
2. **FFT bin sync**: alinhar a FFT com as subportadoras
3. **Carrier offset sync**: corrigir fase residual por subportadora

Sem estes, a ortogonalidade entre subportadoras é perdida, gerando **interferência entre portadoras** (ICI).

<!-- slides: column -->

### Sincronismo de Timing: Correlação do Guard Interval (CP)

O **cyclic prefix** (CP) é uma cópia do final do símbolo OFDM copiada para o início. Permite estimar o timing pelo pico de correlação:

$$
C_{CP}(d)=\sum_{n=0}^{N_g-1}r[d+n]r^*[d+n+N]
$$

Aqui $N$ é o tamanho da IFFT e $N_g$ é o comprimento do CP. O módulo de $C_{CP}$ tende a formar um patamar, não necessariamente um pico único; normalizar pela energia ajuda a escolher um limiar.


<!-- slides: end-columns -->
### Estimador de Timing de Schmidl & Cox

**Definição** do estimador de Schmidl & Cox: usa um símbolo de treinamento cujo trecho útil contém duas metades idênticas, $S=[T,T]$, cada uma com $L$ amostras. Isso é diferente de correlacionar o CP.

A métrica de timing é:

$$
P(d)=\sum_{n=0}^{L-1}r^*[d+n]r[d+n+L],\qquad
R(d)=\sum_{n=0}^{L-1}|r[d+n+L]|^2,
$$

e a métrica normalizada é

$$\boxed{M(d)=\frac{|P(d)|^2}{R^2(d)+\varepsilon}},$$

onde $\varepsilon$ apenas evita divisão por zero. Algumas implementações normalizam pela energia das duas metades para reduzir falsos picos no início e no fim do preâmbulo.

$$
\boxed{\hat d=\text{início do patamar em que }M(d)>\theta}
$$

### Teorema da Robustez do CP ao Timing Offset

O prefixo cíclico cria uma **janela segura de temporização**, mas não torna todo offset com $|\Delta|<N_g$ automaticamente inofensivo. Se o canal ocupa $L_h$ amostras, o CP deve satisfazer $N_g\ge L_h-1$, e a janela FFT de $N$ amostras precisa permanecer dentro da região em que a convolução é circular. A margem disponível é aproximadamente $N_g-(L_h-1)$ amostras; seu posicionamento exato depende da referência escolhida para o início do símbolo.

**Demonstração**: quando a janela permanece nessa região segura, um deslocamento inteiro $\Delta$ introduz apenas uma **fase linear**:

$$
Y[k] = H[k]\cdot X[k]\cdot e^{-j2\pi k\Delta/N} + \text{ruído}
$$

Esta fase é constante ao longo do símbolo em cada subportadora e é corrigível por equalização. Se a janela invade amostras contaminadas pelo símbolo anterior ou pelo seguinte, aparecem ISI e ICI. $\blacksquare$

### Estimador de CFO e Pilotos OFDM

$$
\boxed{\widehat{\Delta f}=-\frac{F_s}{2\pi N}\arg\left(\sum_{n=0}^{N_g-1} r[d+n]\,r^*[d+n+N]\right)}
$$

As amostras do CP repetem as últimas $N_g$ amostras do símbolo útil e estão separadas por $N$, não por $N_g$. O sinal negativo decorre da ordem $r[n]r^*[n+N]$; invertendo a ordem do produto, ele desaparece. A estimativa é ambígua módulo $F_s/N$, logo sua faixa principal é $|\Delta f|<F_s/(2N)$.

Pilotos por subportadora:

$$
\hat{\phi}[k] = \arg\left(R[k] \cdot D[k]^*\right)
$$

```python
import numpy as np
import matplotlib.pyplot as plt

# === Sincronismo OFDM: Schmidl & Cox ===
np.random.seed(42)

N_fft = 64
N_cp = 16
N_sym = N_fft + N_cp

np.random.seed(42)
L = N_fft // 2
train_half = np.random.randn(L) + 1j*np.random.randn(L)
train_symbol = np.concatenate([train_half, train_half])
cp_symbol = np.concatenate([train_symbol[-N_cp:], train_symbol])
training_frame = np.concatenate([cp_symbol, np.zeros(100)])

snr_db = 15
sigma = 10**(-snr_db/20) / np.sqrt(2)
noise = sigma * (np.random.randn(len(training_frame)) + 1j*np.random.randn(len(training_frame)))
r = training_frame + noise

# Offset de timing artificial
timing_offset = 20
r_shifted = np.roll(r, timing_offset)

# Schmidl & Cox
gamma = np.zeros(len(r_shifted) - 2*L, dtype=complex)
sigma_sq = np.zeros(len(r_shifted) - 2*L)
for d in range(len(gamma)):
    first = r_shifted[d:d+L]
    second = r_shifted[d+L:d+2*L]
    gamma[d] = np.vdot(first, second)
    sigma_sq[d] = np.mean(np.abs(second)**2)
P = np.abs(gamma)**2 / (sigma_sq + 1e-12)

threshold = 5.0
detections = np.where(P > threshold)[0]
d_start = detections[0] if len(detections) > 0 else -1
print(f"Schmidl & Cox: detecção d={d_start}, offset real {timing_offset}, erro {abs(d_start-timing_offset)}")

# CFO
df_true = 0.03
r_cfo = r_shifted * np.exp(1j * 2 * np.pi * df_true * np.arange(len(r_shifted)))
first_cfo = r_cfo[timing_offset+N_cp:timing_offset+N_cp+L]
second_cfo = r_cfo[timing_offset+N_cp+L:timing_offset+N_cp+2*L]
gamma_cfo = np.vdot(first_cfo, second_cfo)
df_est = (1/(2*np.pi*L)) * np.angle(gamma_cfo)
print(f"CFO: real={df_true:.4f}, estimado={df_est:.4f}, erro={abs(df_true-df_est):.6f}")

# Plot: métrica P(d)
fig, ax = plt.subplots(figsize=(10, 4))
plot_range = slice(max(0, d_start-20), min(len(P), d_start+200))
ax.plot(np.arange(len(P))[plot_range], P[plot_range], color='#2563eb', lw=1.5)
ax.axhline(threshold, color='#dc2626', linestyle='--', lw=1.5, label=f'Limiar = {threshold}')
ax.axvline(d_start, color='#047857', linestyle='-', lw=2, label=f'Detecção: d = {d_start}')
ax.axvline(timing_offset, color='#7c3aed', linestyle=':', lw=2, label=f'Real: d = {timing_offset}')
ax.set_xlabel('Amostra d'); ax.set_ylabel('Métrica P(d)')
ax.set_title(f'Schmidl & Cox: Timing OFDM (SNR={snr_db} dB, N_cp={N_cp})')
ax.legend(); ax.grid(alpha=.2)
plt.tight_layout()
plt.close()

# Plot: CFO
fig, axes = plt.subplots(1, 2, figsize=(8, 3.5))
const_no = train_half * np.exp(1j*2*np.pi*df_true*np.arange(len(train_half)))
axes[0].scatter(const_no.real[:300], const_no.imag[:300], s=4, alpha=.4, color='#2563eb')
axes[0].set_title('Sem correção de CFO')
axes[0].set_xlim(-3,3); axes[0].set_ylim(-3,3); axes[0].set_aspect('equal'); axes[0].grid(alpha=.2)
axes[0].axhline(0, color='k', lw=.3, alpha=.3); axes[0].axvline(0, color='k', lw=.3, alpha=.3)
axes[1].scatter(train_half.real[:300], train_half.imag[:300], s=4, alpha=.4, color='#047857')
axes[1].set_title('Com correção de CFO')
axes[1].set_xlim(-3,3); axes[1].set_ylim(-3,3); axes[1].set_aspect('equal'); axes[1].grid(alpha=.2)
axes[1].axhline(0, color='k', lw=.3, alpha=.3); axes[1].axvline(0, color='k', lw=.3, alpha=.3)
plt.suptitle('OFDM: efeito do CFO na constelação', fontsize=11)
plt.tight_layout()
plt.close()

print("✓ OFDM synchronization simulation complete.")
```

## Análise de Performance com Erro de Sincronismo

### BER vs. Erro de Timing $\epsilon$

Para BPSK com pulso raised cosine, amostrado com erro $\epsilon T_s$:

$$
y_k = \pm\sqrt{E_s}\cdot p(\epsilon T_s) + \sum_{n\neq k} \pm\sqrt{E_s}\cdot p((k-n)T_s + \epsilon T_s) + n_k
$$

O primeiro termo é atenuado por $p(\epsilon T_s)$ e o segundo é ISI. Aqui $\epsilon$ é adimensional; o deslocamento físico é $\epsilon T_s$. Mesmo para sinc, $p(\epsilon T_s)=\operatorname{sinc}(\epsilon)$, e não $\cos(\pi\epsilon/T_s)$. Se a ISI for temporariamente desprezada para isolar a atenuação do símbolo desejado,

$$
P_b(\epsilon)\approx Q\!\left(\sqrt{\frac{2E_b}{N_0}}\,|p(\epsilon T_s)|\right),\qquad
L_t=-10\log_{10}|p(\epsilon T_s)|^2.
$$

Para sinc, $\operatorname{sinc}(\epsilon)\approx1-\pi^2\epsilon^2/6$, logo

$$\boxed{L_t\approx\frac{10\pi^2}{3\ln10}\epsilon^2\approx14{,}3\epsilon^2\ \text{dB}.}$$

Esse resultado é otimista porque ignora a ISI. A tolerância real depende do pulso RC/RRC, rolloff, canal e jitter; $|\epsilon|<0{,}1$ é uma meta conservadora comum, não um limite universal deduzido de 0,5 dB.

### BER vs. Erro de Fase $\Delta\phi$

Para PSK com erro de fase:

$$
\boxed{P_b(\Delta\phi) \approx Q\left(\sqrt{\frac{2E_b}{N_0}}\cos(\Delta\phi)\right)}
$$

Perda:

$$
\boxed{L_\phi=-10\log_{10}(\cos^2\Delta\phi)\approx\frac{10}{\ln10}\Delta\phi^2\approx4{,}34\Delta\phi^2\ \text{dB}}
$$

Para perda $< 0{,}5$ dB:

$$
\boxed{|\Delta\phi|<\sqrt{0{,}5/4{,}34}\approx0{,}34\ \text{rad}\approx19{,}5^\circ}
$$

### Efeito do Erro de Frequência

Offset $\Delta f$ provoca a rotação cumulativa $\phi_k=\phi_0+2\pi\Delta f\,kT_s$. Portanto, não existe uma BER determinada apenas por $\Delta fT_s$: ela também depende do comprimento do pacote, da fase inicial e do rastreamento. Sem correção, substitui-se $\Delta\phi$ por $\phi_k$ na expressão anterior e calcula-se a média sobre o pacote. Uma especificação útil limita a deriva total, por exemplo $2\pi|\Delta f|N_pT_s<\phi_{\max}$ para $N_p$ símbolos.

### BER Combinada

$$
P_b^{\text{eff}} \approx Q\left(\sqrt{\frac{2E_b}{N_0}}\cdot p(\epsilon)\cdot\cos(\Delta\phi)\right)
$$

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.special import erfc

# === BER vs. Erro de Sincronismo ===
np.random.seed(42)

def ber_theory_bpsk(EbN0_lin, timing_err=0.0, phase_err=0.0):
    alpha = 0.25
    p_eps = np.cos(np.pi*alpha*timing_err) / (1 + (2*alpha*timing_err)**2)
    cos_phi = np.cos(phase_err)
    eff = EbN0_lin * p_eps**2 * cos_phi**2
    return 0.5 * erfc(np.sqrt(eff))

# BER teórica
EbN0_dbs = np.linspace(0, 15, 300)
fig, ax = plt.subplots(figsize=(8, 5))
for eps, lbl, clr in [(0.0, 'Ideal', '#2563eb'), (0.05, '$\\epsilon=0.05$', '#dc2626'),
                        (0.10, '$\\epsilon=0.10$', '#047857'), (0.15, '$\\epsilon=0.15$', '#7c3aed')]:
    ber = [ber_theory_bpsk(10**db/10, timing_err=eps) for db in EbN0_dbs]
    ax.semilogy(EbN0_dbs, ber, color=clr, lw=2, label=lbl)
ax.set_xlabel('$E_b/N_0$ (dB)')
ax.set_ylabel('BER')
ax.set_title('BER vs. $E_b/N_0$ para diferentes erros de timing (BPSK, α=0.25)')
ax.legend(); ax.grid(alpha=.2, which='both')
plt.tight_layout()
plt.close()

# BER Monte Carlo
fig, ax = plt.subplots(figsize=(8, 5))
N_mc = 50000
for eps, lbl, clr in [(0.0, 'MC Ideal', '#2563eb'), (0.05, 'MC $\\epsilon=0.05$', '#dc2626'),
                        (0.10, 'MC $\\epsilon=0.10$', '#047857')]:
    bers = []
    for db in EbN0_dbs:
        EbN0 = 10**(db/10)
        sigma = 1/np.sqrt(2*EbN0)
        bits = np.random.randint(0, 2, N_mc)
        sym = 2*bits - 1
        alpha = 0.25
        p_eps = np.cos(np.pi*alpha*eps) / (1 + (2*alpha*eps)**2)
        sym_tx = sym * p_eps
        # ISI simples
        isi = 0.3 * eps * np.diff(sym, prepend=sym[0])
        rx = sym_tx + 0.3*eps*isi + sigma*np.random.randn(N_mc)
        errs = np.sum((np.sign(rx) != sym))
        bers.append(errs/N_mc)
    ax.semilogy(EbN0_dbs, bers, color=clr, marker='o', ms=3, lw=1, linestyle='--', label=lbl)
ax.set_xlabel('$E_b/N_0$ (dB)')
ax.set_ylabel('BER')
ax.set_title('BER Monte Carlo vs. Timing Error (BPSK)')
ax.legend(); ax.grid(alpha=.2, which='both')
plt.tight_layout()
plt.close()

print("✓ BER analysis complete.")
```

## Exercícios Resolvidos em Python

### Protocolo computacional

**Objetivo:** medir aquisição e rastreio de fase, CFO, timing e quadro. **Controle experimental:** declare offsets, jitter, largura de malha, preâmbulo e limiar. **Validação:** reporte tempo de aquisição, erro residual, falsos alarmes, perdas de detecção e BER após cada correção.

### Exercício 1: Simulação Completa de Costas Loop

Implementar um Costas loop para QPSK com tracking de fase, CFO e análise de constelação.

O código acima na Seção “Estimador de CFO por Preâmbulo Repetido” resolve este exercício. Verificar os plots de:

1. Rastreamento de fase ao longo dos símbolos
2. Constelação corrigida após o loop
3. Trade-off entre ganho K e jitter residual

### Exercício 2: Timing Error Detector — Resposta ao Erro

Implementar e comparar Gardner e M&M para diferentes valores de $\epsilon$.

O código acima na Seção “Comparação de TEDs” resolve este exercício. Verificar que:

- Gardner é simétrico em $\epsilon$ e não-data-directed
- M&M é linear para pequenos $\epsilon$ e decision-directed
- Ambos convergem a zero em $\epsilon = 0$

### Exercício 3: BER vs. Erro de Sincronismo

Simular BER para BPSK com diferentes valores de $\epsilon$ e $\Delta\phi$.

O código acima na Seção “BER Combinada” resolve este exercício. Verificar que:

- Para $\epsilon < 0{,}1 T_s$, a perda é $< 0{,}5$ dB
- Para $\Delta\phi < 0{,}24$ rad, a perda é $< 0{,}5$ dB
- BER Monte Carlo confirma BER teórica

### Exercício 4: Detecção de Frame Sync por Correlação

Implementar a detecção de preâmbulo por correlação sliding e analisar $P_D$ e $P_{FA}$.

```python
import numpy as np
import matplotlib.pyplot as plt

# === Detecção de Frame Sync por Correlação ===
np.random.seed(42)

# Parâmetros
L_preamble = 64           # comprimento do preâmbulo
N_frames = 100            # número de quadros
bits_per_frame = 512      # bits por quadro
Fs = 1                    # normalizado
snr_db = 12               # SNR em dB

# Sequência de preâmbulo (Barker-like, pseudo-aleatória)
np.random.seed(0)
preamble_bits = np.random.randint(0, 2, L_preamble)
preamble = 2*preamble_bits - 1  # BPSK: ±1

# Gerar quadros aleatórios
all_bits = np.random.randint(0, 2, N_frames * bits_per_frame)
all_symbols = 2*all_bits - 1

# Montar frames com preâmbulos
frame_samples = []
frame_starts = []
sample_idx = 0
for i in range(N_frames):
    frame_samples.extend(preamble.tolist())
    frame_starts.append(sample_idx)
    sample_idx += L_preamble
    frame_samples.extend(all_symbols[i*bits_per_frame:(i+1)*bits_per_frame].tolist())
    sample_idx += bits_per_frame

# Adicionar ruído
snr_lin = 10**(snr_db/10)
sigma = 1/np.sqrt(2*snr_lin)
noise = sigma * (np.random.randn(len(frame_samples)) + 1j*np.random.randn(len(frame_samples)))
r = np.array(frame_samples, dtype=complex) + noise

# Detecção por correlação sliding
corr = np.correlate(np.real(r), np.real(preamble), mode='valid')
corr_norm = corr / (np.correlate(np.abs(r)**2, np.ones(L_preamble), mode='valid') + 1e-12)

# Limiar adaptativo (estimado do ruído)
noise_floor = np.median(np.abs(corr_norm[corr_norm < np.percentile(np.abs(corr_norm), 50)]))
threshold = 3.0 * noise_floor

# Detectar picos
from scipy.signal import find_peaks
peaks, _ = find_peaks(corr_norm, height=threshold, distance=L_preamble//2)

print(f"Detecção de Frame Sync:")
print(f"  Preâmbulo real em: {[fs for fs in frame_starts]}")
print(f"  Detecções em:      {peaks.tolist()}")
print(f"  Comprimento preâmbulo: {L_preamble}")
print(f"  Limiar: {threshold:.3f}")

# Contar detecções corretas
correct = 0
missed = 0
false_alarms = 0
for fs in frame_starts:
    found = any(abs(p - fs) < 5 for p in peaks)
    if found:
        correct += 1
    else:
        missed += 1
false_alarms = len(peaks) - correct
print(f"  Corretas: {correct}/{N_frames}, Perdidas: {missed}, Falsas: {false_alarms}")

# Plot: correlação com preâmbulos
fig, ax = plt.subplots(figsize=(12, 4))
ax.plot(corr_norm, color='#2563eb', lw=0.8, label='Correlação normalizada')
for fs in frame_starts:
    ax.axvline(fs, color='#dc2626', linestyle=':', alpha=.3, label='Preâmbulo real' if fs == frame_starts[0] else '')
for p in peaks:
    ax.axvline(p, color='#047857', linestyle='--', alpha=.6)
ax.axhline(threshold, color='#7c3aed', linestyle='-', lw=1.5, label=f'Limiar = {threshold:.3f}')
ax.set_xlabel('Amostra')
ax.set_ylabel('Correlação normalizada')
ax.set_title(f'Detecção de Frame Sync (BPSK, SNR={snr_db} dB, L={L_preamble})')
ax.legend(); ax.grid(alpha=.2)
plt.tight_layout()
plt.close()

print("✓ Frame sync simulation complete.")
```

## Lista de Exercícios Propostos

**E1.** Um CFO de 1 kHz a 100 ksym/s gera quantos graus de rotação por símbolo? Mostre numericamente.

**E2.** Qual a faixa não ambígua do estimador por preâmbulo repetido para $F_s = 1$ MHz e $D = 100$?

**E3.** Um Costas loop QPSK de primeira ordem tem ganho combinado $K_dK_0=5000\,\text{rad/s por rad}$. Qual o erro de fase linearizado em regime permanente para um CFO de 500 Hz? O valor está dentro da região aproximadamente linear do detector?

**E4.** Deduza a expressão da BER para QPSK com erro de fase $\Delta\phi$ e compare com BPSK.

**E5.** Implemente um detector de Gardner para 16-QAM e meça o jitter residual em função do SNR.

**E6.** Para um preâmbulo de 128 símbolos BPSK a $E_b/N_0 = 15$ dB, calcule $P_{FA}$ para limiares $\gamma = \{5, 10, 15\} \cdot \sigma_n^2 E_p$.

**E7.** Compare a BER de BPSK com $\epsilon = 0{,}05\,T_s$ e $\Delta\phi = 10°$ — qual erro causa maior degradação?

**E8.** Implemente o estimador de Schmidl & Cox para DVB-T (64/256/1024 pontos FFT) e meça a precisão do timing em função do SNR.

**E9.** Para um sistema OFDM com $N=64$ e $N_{cp}=16$, é possível determinar a janela segura de timing sem conhecer a duração do canal e a convenção de referência da janela FFT? Se o canal tiver $L_h=5$ amostras, qual é a margem total disponível dentro do CP?

**E10.** (Desafio) Implemente um receptor completo BPSK com: Costas loop, Gardner TED, detecção de preâmbulo, e decisor. Meça a BER final em função do SNR e compare com a curva teórica ideal.

## Gabarito

**E1.** Rotação por símbolo: $360° \cdot \Delta f / R_s = 360° \cdot 1000 / 100000 = \boxed{3{,}6°}$.

**E2.** Faixa não ambígua: $\boxed{|\Delta f| < F_s/(2D) = 1\,\text{MHz}/200 = 5\,\text{kHz}}$.

**E3.** $\Delta\omega=2\pi(500)=3141{,}6\,\text{rad/s}$. Pela aproximação linear, $\epsilon_\phi^{\text{ss}}=\Delta\omega/(K_dK_0)=3141{,}6/5000\approx\boxed{0{,}628\,\text{rad}=36°}$. Esse erro já é grande para a linearização e, em QPSK, aproxima-se do limite da bacia desejada; deve-se aumentar a largura de malha ou realizar aquisição grosseira de CFO antes do rastreio.

**E4.** Para QPSK com erro de fase $\Delta\phi$: $P_b\approx Q(\sqrt{2E_b/N_0}\cos\Delta\phi)$ na aproximação que despreza o acoplamento entre eixos. A perda positiva é $L_\phi=-10\log_{10}(\cos^2\Delta\phi)$.

**E5.** Use a forma complexa $e_k=\operatorname{Re}\{y_k^*(y_{k-1/2}-y_{k+1/2})\}$, que combina I e Q e não pressupõe envelope constante. Meça o desvio padrão de $\hat\epsilon$ após descartar o transitório. Em regime dominado por ruído térmico, espera-se queda aproximadamente proporcional a $1/\sqrt{\mathrm{SNR}}$; em SNR alta, truncamento do interpolador e ruído próprio dos dados podem criar um piso de jitter.

**E6.** $P_{FA} = e^{-\gamma/(\sigma_n^2 E_p)}$. Para $\gamma = 5 \cdot \sigma_n^2 E_p$: $P_{FA} = e^{-5} \approx 6{,}7 \times 10^{-3}$. Para $\gamma = 10$: $e^{-10} \approx 4{,}5 \times 10^{-5}$. Para $\gamma = 15$: $e^{-15} \approx 3{,}1 \times 10^{-7}$.

**E7.** Desprezando a ISI, para sinc e $\epsilon=0{,}05$, $L_t\approx14{,}3(0{,}05)^2\approx0{,}036$ dB. Para $\Delta\phi=10^\circ=0{,}1745$ rad, $L_\phi\approx4{,}34(0{,}1745)^2\approx0{,}132$ dB. Assim, nesse modelo simplificado, $\boxed{\Delta\phi=10^\circ\text{ causa maior perda}}$; uma simulação com ISI deve confirmar a comparação para o pulso escolhido.

**E8.** Resposta: implementar o algoritmo da Seção “Estimador de Timing de Schmidl & Cox” para cada tamanho FFT, variar SNR de 0 a 20 dB, e plotar a probabilidade de detecção correta vs. SNR. A precisão melhora com SNR maior e com maior $N_{cp}/N$.

**E9.** Não: $N_{cp}$ sozinho não determina um intervalo simétrico $|\Delta|<N_{cp}$. É preciso saber onde $\Delta=0$ foi colocado e quantas amostras do CP são consumidas pela memória do canal. Com $L_h=5$, a memória é $L_h-1=4$ amostras e a margem total restante é $N_{cp}-(L_h-1)=16-4=\boxed{12\text{ amostras}}$. Essa margem pode ser distribuída de modo assimétrico entre avanço e atraso da janela.

**E10.** Receptor completo:

1. Detecção de pacote por energia
2. Estimador de CFO por preâmbulo repetido
3. Costas loop para tracking fino de fase
4. Gardner TED para timing
5. Detecção de preâmbulo de frame
6. Decisor BPSK
BER final deve convergir para a curva teórica $Q(\sqrt{2E_b/N_0})$ para SNR > 8 dB, com degradação de $\approx 0{,}2$ dB devido ao jitter residual do loop.
