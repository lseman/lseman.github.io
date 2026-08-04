# Transmissão em Banda Base e Critério de Nyquist

> Apostila de Comunicações — Transmissão em Banda Base e Critério de Nyquist
> Tópicos: PAM · ISI · pulso sinc · critério de Nyquist I · raised cosine · root-raised cosine · filtro casado · eye diagram · códigos de linha

## Antes de começar

Ao final, você deve explicar a origem da ISI, aplicar o primeiro critério de Nyquist e distinguir RC, RRC e filtro casado. **Diagnóstico:** zeros do pulso nos múltiplos de $T_s$ bastam quando há erro de timing? **Evidência mínima:** gerar um diagrama de olho e relacionar abertura vertical, abertura horizontal, ruído e jitter.

## Sumário

1. [Representação do Sinal Digital em Banda Base](#representação-do-sinal-digital-em-banda-base)
2. [Espectro de Sequências PAM Aleatórias](#espectro-de-sequências-pam-aleatórias)
3. [Definição e Modelagem de ISI](#definição-e-modelagem-de-isi)
4. [Critério de Nyquist para Ausência de ISI](#critério-de-nyquist-para-ausência-de-isi)
5. [Pulso Sinc — Banda Mínima](#pulso-sinc--banda-mínima)
6. [Dedução do Pulso Raised Cosine](#dedução-do-pulso-raised-cosine)
7. [Propriedades do Pulso Raised Cosine](#propriedades-do-pulso-raised-cosine)
8. [Root-Raised Cosine e Filtros Casados](#root-raised-cosine-e-filtros-casados)
9. [Representação Complexa e I/Q](#representação-complexa-e-iq)
10. [Códigos de Linha e Eye Diagram](#códigos-de-linha-e-eye-diagram)
11. [Exercícios Resolvidos em Python](#exercícios-resolvidos-em-python)
12. [Lista de Exercícios Propostos](#lista-de-exercícios-propostos)
13. [Gabarito](#gabarito)

## Representação do Sinal Digital em Banda Base

### Pulsos e Símbolos

Uma sequência discreta de símbolos $\{a_k\}_{k\in\mathbb{Z}}$, onde $a_k \in \mathcal{A}$ é um alfabeto finito (por exemplo $\mathcal{A} = \{\pm 1, \pm 3\}$ para 4-PAM), é modulada em um pulso $p(t)$ de energia finita:

$$s(t) = \sum_{k=-\infty}^{\infty} a_k\, p(t - kT_s). \tag{1.1}$$

**Definição:** $T_s$ é o período de símbolo (s/símbolo). A taxa de símbolos é $R_s = 1/T_s$ (baud ou símbolo/s). A taxa de bits é $R_b = R_s/\log_2|\mathcal{A}|$ bits/s, para constelação de tamanho $|\mathcal{A}|$.

**Definição:** PAM (*Pulse Amplitude Modulation*) é a técnica em que cada símbolo $a_k$ escala a amplitude do pulso $p(t)$ deslocado no tempo.

**Exemplo:** Para 4-PAM com $\mathcal A=\{-3,-1,1,3\}$ e pulso retangular $p(t)=1$ em $0\le t<T_s$, cada símbolo leva 2 bits. Como $E_p=T_s$ e $\mathbb E[a_k^2]=5$, a potência média é $P=\mathbb E[a_k^2]E_p/T_s=5$ nas unidades compatíveis com a normalização — não $5/T_s$.

### Representação Vetorial

A transmissão em banda base pode ser vista como um mapeamento de vetores discretos $\mathbf{a} = (a_k)_k \mapsto s(t) \in L^2(\mathbb{R})$. A norma $\|p\|^2 = \int_{-\infty}^{\infty} |p(t)|^2 dt = E_p$ é a energia do pulso. A potência média do sinal é:

$$P = \lim_{T\to\infty} \frac{1}{T} \int_{-T/2}^{T/2} |s(t)|^2 dt.$$

Para sequência estacionária com média zero e auto-correlação $R_{aa}[m] = \mathbb{E}[a_k a_{k-m}]$:

$$P=\frac1{T_s}\sum_{m=-\infty}^{\infty}R_{aa}[m]r_p(mT_s),\qquad r_p(\tau)=\int p(t)p^*(t-\tau)dt. \tag{1.2}$$

A média temporal sobre uma fase completa de símbolo é necessária porque a forma de onda PAM aleatória é, em geral, cicloestacionária.

**Observação:** Se os símbolos são não-correlacionados, $\mathbb{E}[a_k a_{k-m}] = \sigma_a^2\delta[m]$, então $P = \sigma_a^2 E_p / T_s$.

### M-PAM e Constelações

A constelação M-PAM centrada na origem pode ser escrita, para $M$ par ou ímpar, como

$$\mathcal A_M=\{(2i-M+1)A:\ i=0,\ldots,M-1\}.$$

Os pontos adjacentes estão separados por $d_{\min}=2A$. Como

$$\frac1M\sum_{i=0}^{M-1}(2i-M+1)^2=\frac{M^2-1}{3},$$

temos $E_s=A^2(M^2-1)/3$. Para $E_s=1$,

$$\boxed{A=\sqrt{\frac{3}{M^2-1}},\qquad d_{\min}=\sqrt{\frac{12}{M^2-1}}.} \tag{1.3}$$

**Exemplo:** em 4-PAM, $A=1/\sqrt5$ e os níveis normalizados são $\{-3,-1,1,3\}/\sqrt5$; a distância mínima é $2/\sqrt5=\sqrt{12/15}$.

## Espectro de Sequências PAM Aleatórias

### Espectro de Sequência Periódica

Se $a_k$ é periódica com período $N$, então $s(t)$ é quase-periódica com período $NT_s$. Expandindo $a_k$ em série de Fourier discreta:

$$a_k = \sum_{n=-\infty}^{\infty} c_n\, e^{j2\pi n k/N},$$

onde $c_n = \frac{1}{N}\sum_{k=0}^{N-1} a_k\, e^{-j2\pi nk/N}$. Substituindo em (1.1):

$$s(t) = \sum_{n} c_n \sum_{k} e^{j2\pi n k/N} p(t - kT_s).$$

O espectro é discreto:

$$\boxed{S(f)=\frac{1}{T_s}P(f)\sum_{k=-\infty}^{\infty}c_{k\bmod N}\,
\delta\!\left(f-\frac{k}{NT_s}\right).} \tag{2.1}$$

Os coeficientes $c_n$ são periódicos em $n$ com período $N$; por isso aparece $c_{k\bmod N}$, e não um coeficiente com índice fracionário.

Para sequência periódica com média $\bar{a}$, o termo DC é:

$$S(0) = \frac{\bar{a}}{T_s}P(0).$$

### Densidade Espectral de Potência — Sequência Aleatória

**Definição:** A densidade espectral de potência (PSD) é a transformada de Fourier da autocorrelação. Como PAM é geralmente cicloestacionário, usa-se a autocorrelação também média sobre uma fase de símbolo.

**Teorema 2.1 (PSD do sinal PAM).** Para sequência $\{a_k\}$ estacionária com média $\mu_a$, variância $\sigma_a^2$, e função de auto-correlação $R_{aa}[m] = \mathbb{E}[a_k a_{k-m}]$, a PSD do sinal PAM $s(t) = \sum_k a_k p(t-kT_s)$ é:

Defina $C_{aa}[m]=\mathbb E[(a_k-\mu_a)(a_{k-m}-\mu_a)]$ e sua DTFT

$$S_a(e^{j\Omega})=\sum_{m=-\infty}^{\infty}C_{aa}[m]e^{-j\Omega m}.$$

Então

$$\boxed{S_s(f)=\frac{|P(f)|^2}{T_s}S_a(e^{j2\pi fT_s})
+\frac{\mu_a^2}{T_s^2}|P(f)|^2\sum_{\ell=-\infty}^{\infty}
\delta\!\left(f-\frac{\ell}{T_s}\right).} \tag{2.2}$$

**Leitura passo a passo:** a sequência centrada determina $S_a$; o formatador de pulso multiplica essa densidade por $|P(f)|^2$; transmitir um símbolo a cada $T_s$ introduz o fator $1/T_s$. A média não nula é uma sequência determinística constante e gera linhas em múltiplos de $1/T_s$. Para símbolos i.i.d., $C_{aa}[m]=\sigma_a^2\delta[m]$, portanto $S_a=\sigma_a^2$ e recupera-se (2.3). Não se deve somar $\sigma_a^2$ novamente à série de covariância, pois $C_{aa}[0]$ já é a variância.

### PSD para Símbolos Não-Correlacionados

Quando $a_k$ são não-correlacionados com variância $\sigma_a^2$:

$$\boxed{S_s(f) = \frac{\sigma_a^2}{T_s}\,|P(f)|^2.} \tag{2.3}$$

**Exemplo:** Para pulso retangular de duração $T_s$ e amplitude normalizada, $P(f) = T_s\operatorname{sinc}(fT_s)e^{-j\pi f T_s}$ e $|P(f)|^2 = T_s^2\operatorname{sinc}^2(fT_s)$. Logo:

$$S_s(f) = \sigma_a^2 T_s \operatorname{sinc}^2(fT_s).$$

A banda principal (primeiro zero) ocorre em $f = 1/T_s = R_s$. A energia está concentrada em torno de $R_s/2$, mas o espectro é infinito.

## Definição e Modelagem de ISI

### Canais com Dispersão e ISI

Quando o sinal atravessa um canal com resposta impulso $h_c(t)$, o pulso recebido é $g(t) = (p * h_c)(t)$. Em receptores reais, há um filtro adicional $h_r(t)$:

$$y(t) = s(t) * h_c(t) * h_r(t) + n(t) = \sum_k a_k g(t - kT_s) + n(t),$$

onde $g(t) = (p * h_c * h_r)(t)$ e $n(t)$ é o ruído aditivo.

**Definição:** ISI (*Inter-Symbol Interference*) é a interferência entre símbolos que ocorre quando a resposta do canal faz com que um símbolo se sobreponha aos instantes de decisão de símbolos vizinhos.

Amostrando em $t = nT_s$:

$$y[n] = y(nT_s) = \underbrace{a_n g(0)}_{\text{símbolo desejado}} + \underbrace{\sum_{k \ne n} a_k g((n-k)T_s)}_{\text{ISI}} + n[n]. \tag{3.1}$$

### Condição de Ausência de ISI

Para eliminar ISI, exigimos:

$$\boxed{g(nT_s) = \begin{cases} 1, & n = 0, \\ 0, & n \ne 0. \end{cases}} \tag{3.2}$$

Com essa condição, $y[n] = a_n + n[n]$, e a decisão é direta.

**Importante:** A condição (3.2) é necessária e suficiente para ausência de ISI. Ela impõe restrições rigorosas sobre o espectro $G(f)$.

### Exemplo Numérico de ISI

**Exemplo 3.1.** Considere $g(t) = \operatorname{sinc}(t/T_s)$ e sequência $a_k = \{1, 1, 0, 0, 0\}$. Então:

$$y[n] = \sum_k a_k \operatorname{sinc}((n-k)) = a_0 \operatorname{sinc}(n) + a_1 \operatorname{sinc}(n-1).$$

Para $n = 0$: $y[0] = a_0\operatorname{sinc}(0) + a_1\operatorname{sinc}(-1) = 1 + 0 = 1$. ✓
Para $n = 1$: $y[1] = a_0\operatorname{sinc}(1) + a_1\operatorname{sinc}(0) = 0 + 1 = 1$. ✓
Para $n = 2$: $y[2] = a_0\operatorname{sinc}(2) + a_1\operatorname{sinc}(1) = 0$. ✓

O pulso sinc satisfaz perfeitamente a condição de Nyquist.

**Exemplo 3.2 (ISI com pulso exponencial).** Seja $g(t) = e^{-|t|/T}$. Então $g(nT) = e^{-|n|}$, que é não-nulo para todo $n$. Há ISI massiva. Este pulso **não** satisfaz Nyquist.

## Critério de Nyquist para Ausência de ISI

### Enunciado do Primeiro Critério de Nyquist

**Teorema 4.1 (Primeiro Critério de Nyquist).** Para $g(0)=1$, ausência de ISI nos instantes $nT_s$ equivale a $g(nT_s)=\delta[n]$. No domínio da frequência, isso equivale a

$$\boxed{\frac{1}{T_s}\sum_{\ell=-\infty}^{\infty}G\!\left(f-\frac{\ell}{T_s}\right)=1.} \tag{4.1}$$

Se $g(0)=A$ em outra normalização, o lado direito passa a ser $A$.

### Prova no Domínio da Frequência

**Prova:** amostrar $g(t)$ multiplica-o pelo trem de impulsos:

$$g_s(t)=g(t)\sum_n\delta(t-nT_s)=\sum_ng(nT_s)\delta(t-nT_s).$$

Se $g(nT_s)=\delta[n]$, então $g_s(t)=\delta(t)$ e sua transformada é 1. Multiplicação no tempo corresponde a convolução na frequência:

$$G_s(f)=G(f)*\frac1{T_s}\sum_\ell\delta\!\left(f-\frac{\ell}{T_s}\right)
=\frac1{T_s}\sum_\ell G\!\left(f-\frac{\ell}{T_s}\right).$$

Igualando $G_s(f)=1$, obtemos (4.1). O argumento é reversível. Observe que $\sum_kg(t-kT_s)=\text{constante}$ é uma propriedade de partição da unidade e **não** é, em geral, equivalente a amostras sem ISI. $\blacksquare$

### Interpretação Geométrica

A condição (4.1) pode ser interpretada geometricamente: se "enrolarmos" o espectro $G(f)$ ao longo de um período $1/T_s$, o resultado deve ser a constante 1. Isso implica que qualquer excesso espectral em uma região deve ser compensado por déficit em outra, de modo que a soma seja uniforme.

**Observação:** A condição (4.1) é a forma espectral do critério e equivale à condição de amostras (3.2).

### Limite de taxa para canal passa-baixas ideal

**Teorema 4.2 (limite de Nyquist para canal sem ruído).** Para um canal passa-baixas ideal limitado a $B$ Hz (largura unilateral), a taxa máxima de símbolos sem ISI é:

$$\boxed{R_s^{\max} = 2B \quad \text{símbolos/s}.} \tag{4.4}$$

Ou seja, a largura de banda de Nyquist é $B_N = R_s/2$.

**Prova:**

Da condição (4.1), as réplicas de $G(f)$ são deslocadas por $1/T_s$. Se $G(f)=0$ para $|f|>B$, é preciso que essas réplicas cubram o eixo sem lacunas. A menor banda ocorre quando $G(f)$ ocupa exatamente $[-1/(2T_s),1/(2T_s)]$, logo $B=1/(2T_s)=R_s/2$.

Respostas com suporte maior que $R_s/2$ **podem** satisfazer Nyquist quando as regiões de sobreposição são complementares; banda maior, isoladamente, não garante a condição. $\blacksquare$

### Condição de Simetria Hilbert

**Teorema 4.3 (condição complementar na transição).** Para $G(f)$ real, par e limitado de modo que apenas duas réplicas se sobreponham, a condição (4.1) reduz-se à simetria complementar em torno de $f=1/(2T_s)$:

$$G\!\left(\frac{1}{2T_s} + \nu\right) + G\!\left(\frac{1}{2T_s} - \nu\right) = T_s, \quad |\nu| \le \frac{1}{2T_s}. \tag{4.5}$$

Esta é a condição de "complementar simetria" ou "Hilbert-symmetry" em relação à frequência de Nyquist $f_N = 1/(2T_s)$.

**Exemplo:** O retânguo $G(f) = T_s \operatorname{rect}(fT_s)$ tem $G(f) = T_s$ para $|f| < 1/(2T_s)$ e zero fora. A simetria (4.5) é trivialmente satisfeita: $T_s + 0 = T_s$.

## Pulso Sinc — Banda Mínima

<!-- slides: columns -->

### Pulso de Banda Mínima

O pulso que alcança a taxa máxima de Nyquist com a menor largura de banda possível é o pulso sinc:

$$\boxed{p(t) = \operatorname{sinc}\!\left(\frac{t}{T_s}\right) = \frac{\sin(\pi t/T_s)}{\pi t/T_s}.} \tag{5.1}$$

Seu espectro é o retânguo:

$$\boxed{P(f) = T_s \operatorname{rect}(fT_s) = \begin{cases} T_s, & |f| \le \frac{1}{2T_s}, \\ 0, & \text{caso contrário}. \end{cases}} \tag{5.2}$$

<!-- slides: column -->

### Verificação da Condição de Nyquist

Para $p(t) = \operatorname{sinc}(t/T_s)$, temos $p(nT_s) = \delta[n]$, logo a condição (3.2) é satisfeita.

No domínio da frequência, as réplicas de $P(f)$ deslocadas por $1/T_s$ são retânguos de largura $1/(2T_s)$ centrados em $\ell/T_s$. Como cada retânguo ocupa metade do intervalo entre réplicas adjacentes, a soma é exatamente 1 (pela complementar simetria (4.5)). $\blacksquare$



<!-- slides: end-columns -->
### Propriedades do Pulso Sinc

- **Zeros:** $p(t) = 0$ para $t = kT_s$, $k \in \mathbb{Z} \setminus \{0\}$. ✓ (Nyquist)
- **Decaimento:** $p(t) \sim 1/t$. Decaimento muito lento.
- **Ringing:** Oscilações de longa duração — qualquer erro de temporização causa ISI significativa.
- **Banda:** $B = 1/(2T_s) = R_s/2$. Banda de Nyquist mínima.

**Observação:** O pulso sinc é **impraticável** em implementações reais:

1. É infinito no tempo → requer truncamento com perda.
2. Decaimento lento $1/t$ → sensível a erros de temporização.
3. Qualquer offset de amostragem $\epsilon$ causa ISI: $p(\epsilon + kT_s) \ne 0$ para $k \ne 0$.

### Sensibilidade a Erro de Temporização

**Exemplo 5.1.** Com pulso sinc e erro de temporização $\epsilon$:

$$p(nT_s + \epsilon) = \operatorname{sinc}\!\left(n + \frac{\epsilon}{T_s}\right).$$

Para $n = 1$: interferência do símbolo vizinho é $\operatorname{sinc}(1 + \epsilon/T_s) = \frac{\sin(\pi(1 + \epsilon/T_s))}{\pi(1 + \epsilon/T_s)} = \frac{-\sin(\pi\epsilon/T_s)}{\pi(1 + \epsilon/T_s)}$.

Para $\epsilon/T_s = 0{,}01$: interferência $\approx -0{,}0318$, ou seja, ~3% do símbolo desejado. Isso é significativo em sistemas de alta ordem.

## Dedução do Pulso Raised Cosine

### Motivação

O pulso sinc é impraticável por decrescer lentamente ($1/t$). O pulso raised cosine (RC) oferece:

1. **Zeros exatos** em $t = kT_s$ ($k \ne 0$).
2. **Decaimento rápido** ($1/t^3$), tornando-o robusto a erros de temporização.
3. **Banda controlada** pelo parâmetro $\alpha \in [0, 1]$.

### Definição do Espectro RC

**Definição:** O espectro raised cosine com fator de rolloff $\alpha \in [0, 1]$ é:

$$P_{\text{RC}}(f) = \begin{cases} T_s, & 0 \le |f| \le \dfrac{1-\alpha}{2T_s}, \\[8pt] \dfrac{T_s}{2}\left[1 + \cos\left(\dfrac{\pi T_s}{\alpha}\left(|f| - \dfrac{1-\alpha}{2T_s}\right)\right)\right], & \dfrac{1-\alpha}{2T_s} < |f| \le \dfrac{1+\alpha}{2T_s}, \\[8pt] 0, & |f| > \dfrac{1+\alpha}{2T_s}. \end{cases} \tag{6.1}$$

A banda unilateral é:

$$\boxed{B_{\text{RC}} = \frac{1+\alpha}{2T_s}.} \tag{6.2}$$

### Verificação da Simetria de Nyquist

**Teorema 6.1.** O espectro (6.1) satisfaz a condição de complementar simetria de Nyquist (4.5).

**Prova:**

Devemos verificar $P_{\text{RC}}(f_N + \nu) + P_{\text{RC}}(f_N - \nu) = T_s$ para $f_N = 1/(2T_s)$ e $|\nu| \le 1/(2T_s)$.

Para $\nu \in [-\frac{\alpha}{2T_s}, \frac{\alpha}{2T_s}]$ (zona do rolloff):

$$P_{\text{RC}}\!\left(\frac{1}{2T_s} + \nu\right) = \frac{T_s}{2}\left[1 + \cos\left(\frac{\pi T_s}{\alpha}\left(\frac{1}{2T_s} + \nu - \frac{1-\alpha}{2T_s}\right)\right)\right] = \frac{T_s}{2}\left[1 + \cos\left(\frac{\pi}{2} + \frac{\pi T_s \nu}{\alpha}\right)\right]$$

$$= \frac{T_s}{2}\left[1 - \sin\left(\frac{\pi T_s \nu}{\alpha}\right)\right].$$

Da mesma forma:

$$P_{\text{RC}}\!\left(\frac{1}{2T_s} - \nu\right) = \frac{T_s}{2}\left[1 + \sin\left(\frac{\pi T_s \nu}{\alpha}\right)\right].$$

Somando: $\frac{T_s}{2}[1 - \sin] + \frac{T_s}{2}[1 + \sin] = T_s$. ✓

Para $\nu$ fora da zona de rolloff, um dos termos é $T_s$ e outro é $0$, somando $T_s$. ✓

Para $\nu$ fora do suporte ($|\nu| > (1+\alpha)/(2T_s)$), ambos são zero e a condição não se aplica. $\blacksquare$

### DEDUÇÃO do Formato no Tempo

A resposta temporal é obtida pela inversa de Fourier:

$$p_{\text{RC}}(t) = \int_{-\infty}^{\infty} P_{\text{RC}}(f)\, e^{j2\pi f t}\, df = 2\int_{0}^{\infty} P_{\text{RC}}(f)\cos(2\pi f t)\, df. \tag{6.3}$$

Substituindo (6.1):

$$p_{\text{RC}}(t) = \frac{2}{T_s}\int_0^{\frac{1-\alpha}{2T_s}} T_s\cos(2\pi f t)\, df + \frac{2}{T_s}\int_{\frac{1-\alpha}{2T_s}}^{\frac{1+\alpha}{2T_s}} \frac{T_s}{2}\left[1 + \cos\!\left(\frac{\pi T_s}{\alpha}\left(f - \frac{1-\alpha}{2T_s}\right)\right)\right]\cos(2\pi f t)\, df. \tag{6.4}$$

**Primeira integral** (região plana):

$$I_1 = 2\int_0^{\frac{1-\alpha}{2T_s}} \cos(2\pi f t)\, df = 2\left[\frac{\sin(2\pi f t)}{2\pi t}\right]_0^{\frac{1-\alpha}{2T_s}} = \frac{\sin(\pi t(1-\alpha)/T_s)}{\pi t}.$$

**Segunda integral** (região de rolloff): Fazendo $u = f - \frac{1-\alpha}{2T_s}$, de $0$ a $\alpha/T_s$:

$$I_2 = \int_0^{\frac{\alpha}{T_s}} \left[1 + \cos\left(\frac{\pi T_s}{\alpha}u\right)\right]\cos\!\left(2\pi t\left(u + \frac{1-\alpha}{2T_s}\right)\right)\, du. \tag{6.5}$$

Expandindo $\cos(2\pi t(u + \frac{1-\alpha}{2T_s})) = \cos(2\pi tu)\cos\!\left(\frac{\pi t(1-\alpha)}{T_s}\right) - \sin(2\pi tu)\sin\!\left(\frac{\pi t(1-\alpha)}{T_s}\right)$.

O termo constante 1 multiplicado pelo cosseno:

$$\cos\!\left(\frac{\pi t(1-\alpha)}{T_s}\right)\int_0^{\alpha/T_s}\!\!\cos(2\pi tu)\, du - \sin\!\left(\frac{\pi t(1-\alpha)}{T_s}\right)\int_0^{\alpha/T_s}\!\!\sin(2\pi tu)\, du$$

$$= \cos\!\left(\frac{\pi t(1-\alpha)}{T_s}\right)\frac{\sin(\pi\alpha t/T_s)}{\pi t} - \sin\!\left(\frac{\pi t(1-\alpha)}{T_s}\right)\frac{1-\cos(\pi\alpha t/T_s)}{\pi t}.$$

O termo com $\cos(\frac{\pi T_s}{\alpha}u)\cos(2\pi tu)$: usando $\cos A\cos B = \frac{1}{2}[\cos(A-B)+\cos(A+B)]$:

$$\frac{1}{2}\int_0^{\alpha/T_s}\left[\cos\!\left((2\pi t + \frac{\pi T_s}{\alpha})u\right) + \cos\!\left((2\pi t - \frac{\pi T_s}{\alpha})u\right)\right]\cos\!\left(\frac{\pi t(1-\alpha)}{T_s}\right)du$$

$$-\frac{1}{2}\int_0^{\alpha/T_s}\left[\sin\!\left((2\pi t + \frac{\pi T_s}{\alpha})u\right) + \sin\!\left((2\pi t - \frac{\pi T_s}{\alpha})u\right)\right]\sin\!\left(\frac{\pi t(1-\alpha)}{T_s}\right)du.$$

Essas integrais produzem termos proporcionais a $\frac{\sin(\frac{\pi\alpha t}{2T_s}\pm\pi t)}{\dots}$. Após simplificações trigonométricas extensas (detalhadas abaixo):

$$p_{\text{RC}}(t) = \operatorname{sinc}\!\left(\frac{t}{T_s}\right)\cdot \frac{\cos(\alpha\pi t/T_s)}{1 - (2\alpha t/T_s)^2}. \tag{6.6}$$

### Dedução Detalhada do Resultado Final

Vamos consolidar os cálculos. Para $t \neq 0$:

$$p_{\text{RC}}(t) = \frac{\sin(\pi t/T_s)}{\pi t/T_s} \cdot \frac{\cos(\alpha\pi t/T_s)}{1 - (2\alpha t/T_s)^2}. \tag{6.7}$$

**Verificação para $\alpha = 0$:**

$$p_{\text{RC}}(t)|_{\alpha=0} = \operatorname{sinc}(t/T_s) \cdot \frac{1}{1 - 0} = \operatorname{sinc}(t/T_s). \quad \blacksquare$$

**Verificação para $\alpha = 1$:**

$$p_{\text{RC}}(t)|_{\alpha=1} = \operatorname{sinc}(t/T_s) \cdot \frac{\cos(\pi t/T_s)}{1 - (2t/T_s)^2} = \frac{\sin(\pi t/T_s)\cos(\pi t/T_s)}{\pi t/T_s(1-4t^2/T_s^2)} = \frac{\frac{1}{2}\sin(2\pi t/T_s)}{\pi t/T_s(1-4t^2/T_s^2)}.$$

### Valores nas Singularidades

A expressão (6.6) é indeterminada para $t = 0$ e para $t = \pm T_s/(2\alpha)$ (quando $\alpha > 0$).

**Para $t = 0$:**

$$\lim_{t\to 0} p_{\text{RC}}(t) = \lim_{t\to 0}\frac{\sin(\pi t/T_s)}{\pi t/T_s} \cdot \lim_{t\to 0}\frac{\cos(\alpha\pi t/T_s)}{1 - (2\alpha t/T_s)^2} = 1 \cdot 1 = 1. \quad \blacksquare$$

**Para $t = \pm T_s/(2\alpha)$:** (quando $\alpha > 0$)

Usando L'Hôpital ou expansão de Taylor:

$$\lim_{t\to \pm T_s/(2\alpha)} p_{\text{RC}}(t) = \frac{\pi}{4}\operatorname{sinc}\!\left(\frac{1}{2\alpha}\right)(1 \pm \frac{4\alpha}{\pi}). \tag{6.8}$$

## Propriedades do Pulso Raised Cosine

### Zeros em $t = kT_s$, $k \ne 0$

**Teorema 7.1.** O pulso RC satisfaz o critério de Nyquist: $p_{\text{RC}}(kT_s) = 0$ para $k \in \mathbb{Z} \setminus \{0\}$.

**Prova:**

De (6.6), $p_{\text{RC}}(kT_s) = \operatorname{sinc}(k) \cdot \frac{\cos(\alpha\pi k)}{1 - (2\alpha k)^2} = 0 \cdot (\dots) = 0$, pois $\operatorname{sinc}(k) = 0$ para inteiro não-nulo. $\blacksquare$

**Observação:** Os zeros são exatos e independentes de $\alpha$. Isso garante ausência de ISI independente do fator de rolloff.

### Decaimento

**Resultado:** Para $\alpha > 0$, $p_{\text{RC}}(t) = O(1/t^3)$ quando $t \to \infty$.

**Prova:** O fator $\operatorname{sinc}(t/T_s) = O(1/t)$ e o fator $\frac{\cos(\alpha\pi t/T_s)}{1 - (2\alpha t/T_s)^2} = O(1/t^2)$, logo o produto é $O(1/t^3)$.

Para $\alpha = 0$, o decaimento é $O(1/t)$ (pulso sinc puro).

**Importante:** O decaimento mais rápido $O(1/t^3)$ torna o pulso RC muito mais robusto a erros de temporização que o sinc puro. Um erro $\epsilon$ causa interferência de ordem $\epsilon/t^2$ por símbolo vizinho.

### Largura de Banda vs. Fator $\alpha$

A banda unilateral é $B = \frac{1+\alpha}{2T_s}$:

| $\alpha$ | Banda $B$ | Eficiência espectral $\eta = \log_2 M / B$ |
|----------|-----------|------------------------------------------|
| 0 | $1/(2T_s)$ | Máxima (banda mínima) |
| 0,25 | $1,25/(2T_s)$ | 80% da máxima |
| 0,5 | $1,5/(2T_s)$ | 67% da máxima |
| 1 | $1/T_s$ | 50% da máxima |

**Resultado:** $\alpha = 0$ alcança a banda mínima de Nyquist, mas é impraticável. Valores típicos: $\alpha = 0{,}2$ a $0{,}35$.

### Visualização dos Pulsos

**Exemplo 7.1.** Comparação de decaimento temporal para diferentes $\alpha$:

- $\alpha = 0$: decaimento $1/t$ — "ringing" longo.
- $\alpha = 0{,}35$: decaimento $1/t^3$ — principal lóbulo + poucos side lobes.
- $\alpha = 1$: decaimento $1/t^3$ — pulsos ainda mais localizados.

## Root-Raised Cosine e Filtros Casados

### Filtro Casado

**Definição:** Um filtro casado (*matched filter*) para um pulso conhecido $p(t)$ em ruído branco Gaussiano (AWGN) é:

$$\boxed{h_{\text{MF}}(t) = K\, p^*(T_0 - t),} \tag{8.1}$$

onde $K$ é uma constante e $T_0$ é o tempo de amostragem.

**Teorema 8.1 (Optimalidade do Filtro Casado).** Para um pulso $p(t)$ observado em AWGN com PSD $N_0/2$, o filtro $h_{\text{MF}}(t)$ maximiza a razão sinal/ruído no ponto de amostragem $T_0$:

$$\text{SNR}_{\max} = \frac{2E_p}{N_0}, \quad E_p = \int_{-\infty}^{\infty} |p(t)|^2 dt.$$

**Prova (via desigualdade de Cauchy-Schwarz):**

A saída do filtro em $t = T_0$ é:

$$y(T_0) = \int_{-\infty}^{\infty} p(\tau)h(T_0 - \tau)\, d\tau = \int p(\tau)h^*(T_0-\tau)\, d\tau \quad (\text{para } p \text{ real}).$$

Pela desigualdade de Cauchy-Schwarz:

$$|y(T_0)|^2 = \left|\int p(\tau)h^*(T_0-\tau)\, d\tau\right|^2 \le \int |p(\tau)|^2 d\tau \int |h(T_0-\tau)|^2 d\tau = E_p \cdot E_h.$$

A potência do ruído na saída é:

$$P_n = \frac{N_0}{2}\int_{-\infty}^{\infty} |H(f)|^2 df = \frac{N_0}{2}\int_{-\infty}^{\infty} |h(t)|^2 dt = \frac{N_0}{2}E_h.$$

Logo, $\text{SNR} = \frac{|y(T_0)|^2}{P_n} \le \frac{E_p E_h}{(N_0/2)E_h} = \frac{2E_p}{N_0}$.

A igualdade ocorre quando $h(T_0 - \tau) \propto p^*(\tau)$, ou seja, $h(t) \propto p^*(T_0 - t)$. $\blacksquare$

### Root-Raised Cosine (RRC)

**Definição:** O pulso root-raised cosine (RRC) é a raiz quadrada do espectro RC:

$$P_{\text{RRC}}(f) = \sqrt{P_{\text{RC}}(f)} = \begin{cases} \sqrt{T_s}, & 0 \le |f| \le \dfrac{1-\alpha}{2T_s}, \\[8pt] \sqrt{\dfrac{T_s}{2}\left[1 + \cos\left(\dfrac{\pi T_s}{\alpha}\left(|f| - \dfrac{1-\alpha}{2T_s}\right)\right)\right]}, & \dfrac{1-\alpha}{2T_s} < |f| \le \dfrac{1+\alpha}{2T_s}, \\[8pt] 0, & \text{caso contrário}. \end{cases} \tag{8.2}$$

### Split RC: Transmissor e Receptor

**Definição:** Filtro casado split RC: o transmissor usa $H_T(f) = \sqrt{P_{\text{RC}}(f)}$ e o receptor $H_R(f) = \sqrt{P_{\text{RC}}(f)}$, de modo que:

$$\boxed{H_T(f) \cdot H_R(f) = P_{\text{RC}}(f).} \tag{8.3}$$

A cascata $H_T H_R=P_{\text{RC}}$ satisfaz Nyquist. O RRC ideal é bilateral no tempo, de duração infinita e não causal; na prática ele é atrasado, truncado e implementado como FIR causal, o que introduz pequena ISI residual.

**Importante:** No caso ideal com canal sem distorção, a cascata $P_{\text{RC}}$ satisfaz Nyquist, e o filtro casado no receptor maximiza SNR. A divisão $H_T = H_R = \sqrt{P_{\text{RC}}}$ é a forma mais comum de implementar isso.

### Expressão Temporal do RRC

A forma temporal do RRC é mais complexa que a do RC. Para $\alpha > 0$ e $t \neq 0, \pm T_s/(4\alpha)$:

$$p_{\text{RRC}}(t)=\frac1{\sqrt{T_s}}\,
\frac{\sin\!\bigl(\pi(1-\alpha)t/T_s\bigr)+4\alpha(t/T_s)\cos\!\bigl(\pi(1+\alpha)t/T_s\bigr)}
{\pi(t/T_s)\left[1-(4\alpha t/T_s)^2\right]}. \tag{8.4}$$

Para $t = 0$:

$$p_{\text{RRC}}(0)=\frac1{\sqrt{T_s}}\left[1+\alpha\left(\frac4\pi-1\right)\right]. \tag{8.5}$$

Para $t = \pm T_s/(4\alpha)$:

$$p_{\text{RRC}}\!\left(\pm \frac{T_s}{4\alpha}\right) = \frac{\alpha}{\sqrt{2T_s}}\left[\left(1 + \frac{2}{\pi}\right)\sin\!\left(\frac{\pi}{4\alpha}\right) + \left(1 - \frac{2}{\pi}\right)\cos\!\left(\frac{\pi}{4\alpha}\right)\right]. \tag{8.6}$$

### Exemplo: Sistema Completo RRC

**Exemplo 8.1.** Sistema de comunicação com RRC:

1. Transmissor: símbolos $a_k$ → pulso $p_{\text{RRC}}(t-kT_s)$.
2. Canal: AWGN.
3. Receptor: filtro RRC, amostra em $t = nT_s$.
4. Saída: $y[n] = a_n(p_{\text{RRC}} * p_{\text{RRC}})(0) + \text{ISI} + n[n] = a_n + n[n]$.

No modelo ideal, $p_{\text{RRC}}*p_{\text{RRC}}=p_{\text{RC}}$, que satisfaz Nyquist e maximiza a SNR no instante de decisão. Em uma realização FIR truncada, a igualdade é aproximada e deve-se medir a ISI residual nas amostras vizinhas.

## Representação Complexa e I/Q

### Sinal Banda Base Complexo

**Definição:** O sinal banda base complexo (analítico) é:

$$\boxed{\tilde{s}(t) = I(t) + jQ(t),} \tag{9.1}$$

onde $I(t)$ é o componente em fase (in-phase) e $Q(t)$ é o componente quadratura (quadrature).

### Relação com Banda Passante

O sinal banda passante correspondente é:

$$s_{\text{BP}}(t) = \operatorname{Re}\left\{\tilde{s}(t)\,e^{j2\pi f_c t}\right\} = I(t)\cos(2\pi f_c t) - Q(t)\sin(2\pi f_c t). \tag{9.2}$$

**Prova:** Expandindo $\operatorname{Re}\{(I + jQ)(\cos + j\sin)\} = I\cos - Q\sin$. $\blacksquare$

### Representação de Envelope e Fase

**Definição:** O envelope instantâneo $\gamma(t)$ e a fase instantânea $\phi(t)$ são:

$$\boxed{\gamma(t) = \sqrt{I^2(t) + Q^2(t)}, \qquad \phi(t) = \arg(I(t) + jQ(t)).} \tag{9.3}$$

O sinal banda passante pode ser escrito:

$$s_{\text{BP}}(t) = \gamma(t)\cos(2\pi f_c t + \phi(t)). \tag{9.4}$$

### Aplicações: QAM e PSK

Para QAM, $I(t)$ e $Q(t)$ são sinais PAM independentes, cada um modulado em uma portadora ortogonal.

Para PSK, a informação está na fase: $\tilde{s}(t) = A e^{j\phi_k}$, onde $\phi_k$ são fases discretas.

**Observação:** A representação I/Q é a base para todas as modulações digitais modernas: QPSK, 8-PSK, 16-QAM, 64-QAM, etc.

## Códigos de Linha e Eye Diagram

### Codificações Básicas

**Definição:** Códigos de linha (line codes) são mapeamentos de bits em formas de onda de banda base.

**NRZ (Non-Return-to-Zero):**

- Bit 0 → $-A$, bit 1 → $+A$.
- PSD: $\propto \operatorname{sinc}^2(fT_b)$.
- Possui componente DC se $P(0) \ne 0$ e $\mathbb{E}[a_k] \ne 0$.

**RZ (Return-to-Zero):**

- Bit 1 → pulso de duração $\tau < T_b$, retorna a zero.
- Bit 0 → zero.
- Mais fácil sincronismo de clock, mas mais banda.

**Manchester:**

- Bit 0 → transição baixa→alta no meio.
- Bit 1 → transição alta→baixa no meio.
- Sempre há transição → facilitação de clock, elimina DC.
- Banda: primeiro zero em $2R_b$ (o dobro do NRZ).

**AMI (Alternate Mark Inversion):**

- Bit 0 → zero.
- Bit 1 → alternância $+A, -A, +A, \dots$
- Balanceamento DC automático.
- Problema: sequências longas de zeros perdem sincronismo.

**HDB3 (High-Density Bipolar 3):**

- Substitui sequências de 4+ zeros por padrões especiais.
- Elimina o problema de zeros consecutivos do AMI.
- Usado em enlaces E1; sistemas T1 tradicionalmente usam B8ZS, não HDB3.

### Códigos com Balanceamento DC

**Definição:** Um código é dito com *DC balance* (equilíbrio de DC) se sua PSD é nula em $f = 0$, ou seja, não há energia espectral na componente contínua.

**Resultado:** Manchester, AMI ideal e HDB3 têm nulo espectral em DC. NRZ polar i.i.d. de média zero não possui **linha** em DC, mas sua PSD contínua geralmente é máxima em $f=0$; portanto, “média zero” não é o mesmo que “nulo espectral em DC”.

### Eye Diagram (Diagrama de Olho)

**Definição:** O eye diagram é obtido sobrepondo trechos de duração $2T_s$ do sinal recebido, um para cada símbolo. O resultado é uma figura que se assemelha a "olhos".

O eye diagram revela:

1. **ISI:** "Fechamento" dos olhos. Quanto mais aberto, menor ISI.
2. **Jitter:** Espessura horizontal dos cruzamentos.
3. **Ruído:** Espessura vertical nas aberturas.
4. **Distorção de amplitude:** Assimetria vertical.

### Abertura do Eye

**Definição:** A abertura vertical do eye é a margem de ruído máxima:

Para um sinal binário, se $\mathcal Y_1(t)$ e $\mathcal Y_0(t)$ são os conjuntos de traços condicionados ao símbolo central 1 e 0, a abertura vertical no instante $t$ é

$$V_{\text{open}}(t)=\min_{y\in\mathcal Y_1(t)}y-\max_{y\in\mathcal Y_0(t)}y,$$

e escolhe-se o instante de maior abertura:

$$\boxed{V_{\text{open}}=\max_tV_{\text{open}}(t).} \tag{10.1}$$

Para sinais multinível há um olho entre cada par de níveis adjacentes; a margem do sistema é a menor dessas aberturas.

A abertura horizontal é a janela temporal onde a amostragem pode ocorrer sem ISI significativa.

**Observação:** O eye diagram é uma ferramenta de diagnóstico essencial. Um "olho" amplamente aberto indica bom desempenho; fechamento ou distorção indica problemas de ISI, jitter ou ruído.

## Exercícios Resolvidos em Python

### Protocolo computacional

**Objetivo:** validar PSD de PAM, pulsos RC/RRC, ausência de ISI e abertura do olho. **Normalização:** declare energia do pulso, amostras por símbolo e descarte de transientes. **Validação:** amostre a resposta conjunta em múltiplos de $T_s$ e reporte numericamente os resíduos de ISI.

### Exercício 1: PSD de Sequência PAM Aleatória

Calcule e visualize a densidade espectral de potência (PSD) de um sinal PAM 4-aleatório com pulso retangular e pulso RC.

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import welch

np.random.seed(42)
T_s = 1.0
sps = 16          # samples per symbol
N_sym = 4096

# Sequência aleatória 4-PAM
a = np.random.choice(np.array([-3, -1, 1, 3]), size=N_sym)

# Pulso retangular
rect = np.ones(sps)

# Pulso RC (alpha=0.35)
def rc_pulse(t, T_s, alpha):
    scalar_input = np.ndim(t) == 0
    t = np.atleast_1d(t)
    if alpha == 0:
        y = np.sinc(t / T_s)
        return y.item() if scalar_input else y
    den = 1 - (2 * alpha * t / T_s) ** 2
    with np.errstate(divide='ignore', invalid='ignore'):
        y = np.sinc(t / T_s) * np.cos(np.pi * alpha * t / T_s) / den
    # tratar singularidades
    mask = np.isclose(np.abs(2 * alpha * t / T_s), 1, atol=1e-6)
    y[mask] = np.pi / 4 * np.sinc(1 / (2 * alpha))
    y[np.isclose(t / T_s, 0, atol=1e-6)] = 1.0
    return y.item() if scalar_input else y

alpha = 0.35
rc = rc_pulse(np.arange(-5*sps, 5*sps+1) / sps, T_s, alpha)
rc = rc / np.sqrt(np.mean(rc**2))  # normalizar

# Transmitir
u_rect = np.zeros(len(a) * sps)
u_rect[::sps] = a
u_rc = np.convolve(a, rc, mode='full')

# PSD via Welch
fs = sps / T_s
f_rect, P_rect = welch(u_rect, fs=fs, nperseg=min(2**14, len(u_rect)))
f_rc, P_rc = welch(u_rc, fs=fs, nperseg=min(2**14, len(u_rc)))

fig, ax = plt.subplots(1, 2, figsize=(12, 4))
ax[0].plot(f_rect, 10*np.log10(P_rect), label='4-PAM, pulso retangular')
ax[0].set(xlabel='f (symb⁻¹)', ylabel='PSD (dB)', title='PSD: Pulso Retangular')
ax[0].grid(True)
ax[0].legend()
ax[1].plot(f_rc, 10*np.log10(P_rc), label=f'4-PAM, pulso RC (α={alpha})')
ax[1].set(xlabel='f (symb⁻¹)', ylabel='PSD (dB)', title=f'PSD: Pulso RC (α={alpha})')
ax[1].grid(True)
ax[1].legend()
plt.tight_layout()
plt.show()
```

### Exercício 2: Pulso RC — Cálculo no Tempo e Frequência

Plotar o pulso RC e seu espectro para diferentes valores de $\alpha$.

```python
import numpy as np
import matplotlib.pyplot as plt

def rc_time(t, T_s, alpha):
    if alpha == 0:
        return np.sinc(t / T_s)
    den = 1 - (2 * alpha * t / T_s) ** 2
    with np.errstate(divide='ignore', invalid='ignore'):
        y = np.sinc(t / T_s) * np.cos(np.pi * alpha * t / T_s) / den
    singular = np.isclose(np.abs(2 * alpha * t / T_s), 1, atol=1e-6)
    y[singular] = np.pi / 4 * np.sinc(1 / (2 * alpha))
    y[np.isclose(t / T_s, 0, atol=1e-6)] = 1.0
    return y

def rc_spec(f, T_s, alpha):
    if alpha == 0:
        return T_s * (np.abs(f) <= 1 / (2 * T_s))
    B = (1 + alpha) / (2 * T_s)
    G = np.zeros_like(f)
    # região plana
    flat = np.abs(f) <= (1 - alpha) / (2 * T_s)
    G[flat] = T_s
    # região de rolloff
    rolloff = (np.abs(f) > (1 - alpha) / (2 * T_s)) & (np.abs(f) <= B)
    arg = (np.pi * T_s / alpha) * (np.abs(f[rolloff]) - (1 - alpha) / (2 * T_s))
    G[rolloff] = T_s / 2 * (1 + np.cos(arg))
    return G

T_s = 1.0
t = np.linspace(-6, 6, 3001)
f = np.linspace(-1.5, 1.5, 3001)

fig, ax = plt.subplots(1, 2, figsize=(14, 5))
alphas = [0, 0.25, 0.5, 1.0]
for alpha in alphas:
    ax[0].plot(t, rc_time(t, T_s, alpha), label=f'α={alpha}')
ax[0].set(xlabel='t/T_s', ylabel='p(t)', title='Pulso Raised Cosine (domínio do tempo)',
          xlim=(-6, 6))
ax[0].grid(True)
ax[0].legend()
ax[0].axhline(0, color='k', linewidth=0.5)

for alpha in alphas:
    G = rc_spec(f, T_s, alpha)
    ax[1].plot(f, G / T_s, label=f'α={alpha}')
    ax[1].axvline((1 + alpha) / (2 * T_s), color='r', linestyle='--', alpha=0.4,
                  label=f'α={alpha}: B')
ax[1].set(xlabel='f·T_s', ylabel='P(f)/T_s', title='Espectro RC (domínio da frequência)')
ax[1].grid(True)
ax[1].legend()
plt.tight_layout()
plt.show()
```

### Exercício 3: Eye Diagram para Diferentes Fatores $\alpha$

```python
import numpy as np
import matplotlib.pyplot as plt

def rrc_pulse(t, T_s, alpha):
    if alpha == 0:
        return np.sinc(t / T_s)
    num = np.sin(np.pi * t / T_s * (1 - alpha)) + 4 * alpha * t / T_s * np.cos(np.pi * t / T_s * (1 + alpha))
    den = np.pi * t / T_s * (1 - (4 * alpha * t / T_s) ** 2)
    with np.errstate(divide='ignore', invalid='ignore'):
        h = num / den
    # t = 0
    mask0 = np.isclose(t, 0, atol=1e-12)
    h[mask0] = 1 / T_s * (1 + alpha * (4/np.pi - 1))
    # singularidades em t = ±T_s/(4α)
    sing = np.isclose(np.abs(4 * alpha * t / T_s), 1, atol=1e-6)
    if np.any(sing):
        s = t[sing]
        h[sing] = (alpha / np.sqrt(2 * T_s)) * ((1 + 2/np.pi) * np.sin(np.pi / (4*alpha)) +
                                                  (1 - 2/np.pi) * np.cos(np.pi / (4*alpha)))
    return h

T_s = 1.0
sps = 8
N_sym = 500
np.random.seed(0)
a = 2 * np.random.randint(0, 2, N_sym) - 1  # BPSK

alphas = [0, 0.25, 0.5, 0.75, 1.0]
fig, axes = plt.subplots(2, 3, figsize=(15, 8))
axes = axes.ravel()

for idx, alpha in enumerate(alphas):
    h = rrc_pulse(np.arange(-5*sps, 5*sps+1) / sps, T_s, alpha)
    h = h / np.sqrt(np.sum(h**2))  # normalizar energia

    # transmit
    u = np.zeros(len(a) * sps)
    u[::sps] = a
    tx = np.convolve(u, h, mode='full')

    # eye diagram
    eye_len = 2 * sps
    start = N_sym * sps // 2
    for k in range(start // sps, start // sps + 200):
        segment = tx[k*sps: min(k*sps+eye_len, len(tx))]
        if len(segment) == eye_len:
            axes[idx].plot(np.arange(eye_len) / sps, segment,
                       'b', alpha=0.06)
    axes[idx].set(xlabel='tempo/T_s', title=f'α = {alpha}', ylim=(-3, 3))
    axes[idx].grid(alpha=0.3)
    if idx == 0:
        axes[idx].set_ylabel('amplitude')

# último subplot vazio ou com info
axes[-1].axis('off')
axes[-1].text(0.1, 0.5, 'Diagrama de olho\napós cascata RRC+RRC\nPara cada α, 200 símbolos\nsobrepostos',
             fontsize=11, ha='center', va='center')
for ax in axes[:-1]:
    ax.axhline(0, color='k', linewidth=0.5)

plt.tight_layout()
plt.show()
```

### Exercício 4: ISI com Pulso Não-Ideal

Demonstrar numericamente como um pulso com rolloff alto causa ISI quando há erro de temporização.

```python
import numpy as np
import matplotlib.pyplot as plt

def rc_pulse(t, T_s, alpha):
    scalar_input = np.ndim(t) == 0
    t = np.atleast_1d(t)
    if alpha == 0:
        y = np.sinc(t / T_s)
        return y.item() if scalar_input else y
    den = 1 - (2 * alpha * t / T_s) ** 2
    with np.errstate(divide='ignore', invalid='ignore'):
        y = np.sinc(t / T_s) * np.cos(np.pi * alpha * t / T_s) / den
    singular = np.isclose(np.abs(2 * alpha * t / T_s), 1, atol=1e-6)
    y[singular] = np.pi / 4 * np.sinc(1 / (2 * alpha))
    y[np.isclose(t / T_s, 0, atol=1e-6)] = 1.0
    return y.item() if scalar_input else y

T_s = 1.0
t = np.linspace(-5, 5, 2001)

# Sequência: símbolo principal em k=0, interferentes em k=-2..-1, 1..2
a = {0: 1.0, 1: 0.5, -1: -0.3, 2: 0.2, -2: -0.1}

alphas = [0.0, 0.25, 0.5, 1.0]
errors = [0.0, 0.05, 0.1, 0.15]  # erro de temporização em unidades de T_s

fig, axes = plt.subplots(2, 2, figsize=(14, 10))
for idx, eps in enumerate(errors):
    ax = axes[idx // 2, idx % 2]
    for alpha in alphas:
        g = np.array([rc_pulse((n + eps) * T_s, T_s, alpha) * a.get(n, 0)
                       for n in range(-2, 3)])
        ISI = sum(g[n] for n in range(-2, 3) if n != 0)
        desired = g[0]
        ax.plot(alpha, abs(ISI) / abs(desired) if abs(desired) > 1e-12 else 0,
                'o-', label=f'α={alpha}', alpha=0.7)
    ax.set(xlabel='α', ylabel='ISI / símbolo_desejado',
           title=f'Erro de timing ε = {eps} T_s', ylim=(0, 1))
    ax.grid(True)
    ax.legend(fontsize=8)

plt.tight_layout()
plt.show()

# Tabela numérica
print("ISI relativa para diferentes α e ε:")
print(f"{'α':>6} | {'ε=0':>10} | {'ε=0.05':>10} | {'ε=0.1':>10} | {'ε=0.15':>10}")
print("-" * 60)
for alpha in alphas:
    vals = []
    for eps in errors:
        g = np.array([rc_pulse((n + eps) * T_s, T_s, alpha) * a.get(n, 0)
                       for n in range(-2, 3)])
        ISI = sum(g[n] for n in range(-2, 3) if n != 0)
        desired = g[0]
        vals.append(f"{abs(ISI)/abs(desired):.6f}" if abs(desired) > 1e-12 else "N/A")
    print(f"{alpha:>6.2f} | {vals[0]:>10} | {vals[1]:>10} | {vals[2]:>10} | {vals[3]:>10}")
```

## Lista de Exercícios Propostos

**E1.** Dê a expressão da potência média $P$ de um sinal PAM 8-PAM com $\sigma_a^2 = 7$ e pulso de energia $E_p = 2$, para $T_s = 10^{-6}$ s.

**E2.** Mostre que para sequência não correlacionada com $\mu_a = 0$, a PSD é $S_s(f) = \frac{\sigma_a^2}{T_s}|P(f)|^2$.

**E3.** Para $R_s = 10$ Mbaud, calcule a banda de Nyquist mínima e a banda RC com $\alpha = 0{,}35$.

**E4.** Verifique analiticamente que o pulso $p(t) = \operatorname{sinc}(2Wt)$ satisfaz o critério de Nyquist para $T_s = 1/(2W)$.

**E5.** Mostre que para $\alpha = 0$, a expressão (6.6) se reduz ao pulso sinc.

**E6.** Calcule o valor de $p_{\text{RC}}(t)$ em $t = T_s/(2\alpha)$ para $\alpha = 0{,}5$ e $T_s = 1$.

**E7.** Prove que o decaimento do pulso RC para $\alpha > 0$ é $O(1/t^3)$.

**E8.** Calcule a SNR máxima de um filtro casado para pulso retangular de amplitude $A$ e duração $T_s$ em AWGN com PSD $N_0/2$.

**E9.** Para um sistema RRC com $\alpha = 0{,}25$ e $T_s = 2 \times 10^{-6}$ s, calcule a banda unilateral.

**E10.** Trace o eye diagram conceitual para um canal com ISI severa e compare com um canal sem ISI. Descreva as diferenças.

**E11.** Justifique por que Manchester tem banda duas vezes maior que NRZ polar.

**E12.** Para o pulso $g(t) = e^{-|t|/T}$, calcule a ISI no instante de decisão causada por símbolos adjacentes.

## Gabarito

**E1.** $P = \sigma_a^2 E_p / T_s = 7 \times 2 / 10^{-6} = 14 \times 10^6$ W = 14 MW.

**E2.** $R_{aa}[m] = \sigma_a^2\delta[m]$, então $\sum_m R_{aa}[m] e^{-j2\pi f m T_s} = \sigma_a^2$. Logo $S_s(f) = \frac{\sigma_a^2}{T_s}|P(f)|^2$.

**E3.** Nyquist: $B_N = R_s/2 = 5$ MHz. RC ($\alpha=0{,}35$): $B = (1{,}35)R_s/2 = 6{,}75$ MHz.

**E4.** $p(nT_s) = \operatorname{sinc}(2W \cdot n/(2W)) = \operatorname{sinc}(n) = \delta[n]$. ✓

**E5.** Para $\alpha = 0$: $\cos(0) = 1$ e $1 - (0)^2 = 1$, logo $p(t) = \operatorname{sinc}(t/T_s) \cdot 1/1 = \operatorname{sinc}(t/T_s)$. ✓

**E6.** $p_{\text{RC}}(T_s/2) = \operatorname{sinc}(1/2) \cdot \frac{\cos(\pi/4)}{1 - 1}$. Usando limite: $= \frac{\pi}{4}\operatorname{sinc}(2) = \frac{\pi}{4}\cdot \frac{\sin(\pi/2)}{\pi/2} = \frac{1}{2}$.

**E7.** $\operatorname{sinc}(t) = O(1/t)$ e $\frac{\cos(\alpha\pi t/T_s)}{1-(2\alpha t/T_s)^2} = O(1/t^2)$, então o produto é $O(1/t^3)$. ✓

**E8.** $E_p = A^2 T_s$. $\text{SNR}_{\max} = 2A^2 T_s / N_0$.

**E9.** $B = (1{,}25) / (2 \times 2 \times 10^{-6}) = 312{,}500$ Hz = 312,5 kHz.

**E10.** ISI severa: olhos fechados, cruzamentos dispersos, pouca abertura vertical/horizontal. Sem ISI: olhos amplamente abertos, cruzamentos precisos.

**E11.** Manchester tem transição em cada meio-bit, dobrando a frequência fundamental. Primeiro zero em $2/T_b$ vs $1/T_b$ do NRZ.

**E12.** ISI = $\sum_{k \ne 0} a_k e^{-|k|T/T} = e^{-1}(a_{-1}+a_1) + e^{-2}(a_{-2}+a_2) + \dots$. Para $a_k$ aleatórios com energia $\sigma_a^2$, a variância da ISI é $\sigma_a^2 \sum_{k \ne 0} e^{-2|k|} = \sigma_a^2 \frac{2e^{-2}}{1-e^{-2}}$.
