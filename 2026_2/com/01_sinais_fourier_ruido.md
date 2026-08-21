# Sinais, Transformada de Fourier, Processos Aleatórios e Ruído

> Sistemas de Comunicações — Apostila de Curso · UFSC · Prof. Laio Oriel Seman · Carga horária: 80h
> Tópicos: Sinais Determinísticos e Aleatórios · Série e Transformada de Fourier · Densidade Espectral de Potência · Convolução e Filtragem · Processos Estocásticos · Ruído Térmico e AWGN · Função Q e Probabilidade de Erro

---

## Antes de começar

Ao final, você deve conseguir escolher entre espectro de energia e PSD, prever o efeito de um filtro LIT e relacionar variância de ruído a uma probabilidade de erro. **Diagnóstico:** você sabe explicar por que uma senoide tem energia infinita, mas potência finita? **Evidência mínima:** reproduzir o laboratório e justificar, sem olhar o código, os gráficos de Fourier, Parseval, AWGN e BER.

## Sumário

1. [Sinais e Energia/Potência](#sinais-e-energiapotência)
2. [Série de Fourier](#série-de-fourier)
3. [Transformada de Fourier](#transformada-de-fourier)
4. [Convolução, Filtragem e o Teorema de Parseval](#convolução-filtragem-e-o-teorema-de-parseval)
5. [Sinais Passa-Faixa e Envelope Complexo](#sinais-passa-faixa-e-envelope-complexo)
6. [Processos Aleatórios](#processos-aleatórios)
7. [Densidade Espectral de Potência de Processos Aleatórios](#densidade-espectral-de-potência-de-processos-aleatórios)
8. [Ruído Térmico e Ruído Branco Gaussiano (AWGN)](#ruído-térmico-e-ruído-branco-gaussiano-awgn)
9. [Função Q e Probabilidade de Erro](#função-q-e-probabilidade-de-erro)
10. [Exercícios Resolvidos em Python](#exercícios-resolvidos-em-python)
11. [Lista de Exercícios Propostos](#lista-de-exercícios-propostos)
12. [Gabarito](#gabarito)

---

## Sinais e Energia/Potência

### Classificação

Um sinal $x(t)$ é dito de **energia** se $0<E_x<\infty$, com:

$$
E_x \equiv \int_{-\infty}^{\infty}|x(t)|^2\,dt
$$

e de **potência** se $0<P_x<\infty$ (tipicamente sinais periódicos ou aleatórios estacionários, que têm energia infinita):

$$
P_x \equiv \lim_{T\to\infty}\frac{1}{T}\int_{-T/2}^{T/2}|x(t)|^2\,dt
$$

Um sinal de energia finita tem necessariamente potência média nula (a energia se "dilui" ao longo do tempo infinito); um sinal de potência finita e não nula tem energia infinita. Essa dicotomia motiva duas ferramentas espectrais distintas: a **Transformada de Fourier** (sinais de energia) e a **Densidade Espectral de Potência via autocorrelação** (sinais de potência, Seção “Densidade Espectral de Potência de Processos Aleatórios”).

### Sinais em comunicações

Em sistemas de comunicações, praticamente todo sinal de interesse é de **potência** (portadoras, ruído, sinais moduladas continuamente) — a Transformada de Fourier ainda é aplicada, mas de forma generalizada (via funções generalizadas/deltas de Dirac no domínio da frequência para sinais periódicos, Seção “Transformada de sinais periódicos (via trem de deltas espectrais)”) ou substituída pela densidade espectral de potência para processos aleatórios.

---

## Série de Fourier

### Dedução via ortogonalidade das exponenciais complexas

Um sinal periódico $x(t)=x(t+T_0)$, com $f_0=1/T_0$, pode ser expandido em uma base ortogonal de exponenciais complexas $\{e^{j2\pi nf_0t}\}_{n=-\infty}^{\infty}$. A ortogonalidade decorre de:

$$
\int_{T_0}e^{j2\pi nf_0t}e^{-j2\pi mf_0t}\,dt = \int_{T_0}e^{j2\pi(n-m)f_0t}\,dt = \begin{cases}T_0 & n=m\\0 & n\neq m\end{cases}
$$

(para $n\neq m$, a integral de uma exponencial complexa completa sobre um número inteiro de períodos se anula — soma vetorial de fasores uniformemente distribuídos no círculo unitário). Postulando $x(t)=\sum_{n=-\infty}^{\infty}c_ne^{j2\pi nf_0t}$ e multiplicando ambos os lados por $e^{-j2\pi mf_0t}$, integrando sobre um período e usando a ortogonalidade:

$$
\boxed{c_n = \frac{1}{T_0}\int_{T_0}x(t)\,e^{-j2\pi nf_0t}\,dt}
$$

<!-- slides: columns -->

### Espectro de linhas e simetria hermitiana

Os coeficientes $c_n$ formam um **espectro de linhas** discreto em múltiplos de $f_0$. Para $x(t)$ real, $c_{-n}=c_n^*$ (**simetria hermitiana**) — consequência direta de $x(t)=x^*(t)$ aplicado à definição de $c_n$. Isso garante que a soma de pares $c_ne^{j2\pi nf_0t}+c_{-n}e^{-j2\pi nf_0t}=2|c_n|\cos(2\pi nf_0t+\angle c_n)$ seja sempre real.

<!-- slides: column -->

### Potência média e Teorema de Parseval para séries

$$
P_x = \frac{1}{T_0}\int_{T_0}|x(t)|^2\,dt = \sum_{n=-\infty}^{\infty}|c_n|^2
$$

**Dedução**: substitua $x(t)=\sum_nc_ne^{j2\pi nf_0t}$ em $|x(t)|^2=x(t)x^*(t)$, integre termo a termo sobre $T_0$; pela ortogonalidade (Seção “Dedução via ortogonalidade das exponenciais complexas”), só sobrevivem os termos com índices iguais, resultando em $\sum_n|c_n|^2$. Este resultado — a potência total é a soma das potências de cada harmônica — é a base para calcular a potência de sinais modulados AM/FM compostos por múltiplas componentes espectrais (arquivos 2 e 3).

---


<!-- slides: end-columns -->
## Transformada de Fourier

### Definição e transformada inversa

Para um sinal de energia $x(t)$ (não necessariamente periódico):

$$
\boxed{X(f) \equiv \int_{-\infty}^{\infty}x(t)\,e^{-j2\pi ft}\,dt}\ ,\qquad \boxed{x(t) = \int_{-\infty}^{\infty}X(f)\,e^{j2\pi ft}\,df}
$$

A Transformada de Fourier pode ser vista como o limite da Série de Fourier quando $T_0\to\infty$: o espaçamento entre linhas espectrais $f_0=1/T_0\to0$, o espectro discreto vira contínuo, e $c_n\cdot T_0 \to X(f)$.

### Propriedades fundamentais (com dedução breve)

**Linearidade**: $ax_1(t)+bx_2(t) \leftrightarrow aX_1(f)+bX_2(f)$ — direto da linearidade da integral.

**Deslocamento no tempo**: $x(t-t_0)\leftrightarrow X(f)e^{-j2\pi ft_0}$. Prova: substituição $u=t-t_0$ na integral de definição.

**Deslocamento em frequência (modulação)**: $x(t)e^{j2\pi f_0t}\leftrightarrow X(f-f_0)$. Prova: substitua diretamente na definição, agrupe os expoentes. Esta propriedade é o **coração matemático de toda a modulação** (arquivos 2, 3, 5, 6): multiplicar um sinal por uma portadora $\cos(2\pi f_ct)$ desloca seu espectro para $\pm f_c$.

$$
\boxed{x(t)\cos(2\pi f_ct) \leftrightarrow \frac{1}{2}\left[X(f-f_c)+X(f+f_c)\right]}
$$

(decorrência direta de $\cos(2\pi f_ct)=\tfrac12(e^{j2\pi f_ct}+e^{-j2\pi f_ct})$ e da propriedade de deslocamento em frequência aplicada a cada termo).

**Escalamento no tempo**: $x(at)\leftrightarrow \dfrac{1}{|a|}X(f/a)$ — comprimir no tempo expande no espectro (relação de incerteza tempo-frequência).

**Dualidade**: se $x(t)\leftrightarrow X(f)$, então $X(t)\leftrightarrow x(-f)$ — consequência da simetria quase perfeita entre as fórmulas direta e inversa.

**Derivação**: $\dfrac{dx}{dt}\leftrightarrow j2\pi f\,X(f)$ — prova por integração por partes.

### Pares de transformadas fundamentais

| $x(t)$ | $X(f)$ | Uso |
|---|---|---|
| $\text{rect}(t/T)$ (pulso retangular) | $T\,\text{sinc}(fT)$ | Formatação de pulso banda base (arquivo 4) |
| $\text{sinc}(2Wt)$ | $\dfrac{1}{2W}\text{rect}(f/2W)$ | Filtro ideal passa-baixas (dual do anterior) |
| $\delta(t)$ | $1$ | Resposta ao impulso |
| $1$ | $\delta(f)$ | Nível DC |
| $e^{-at}u(t)$, $a>0$ | $\dfrac{1}{a+j2\pi f}$ | Filtros RC |
| $e^{-\pi t^2}$ (gaussiana) | $e^{-\pi f^2}$ (autotransformada) | Pulsos gaussianos |
| $\cos(2\pi f_ct)$ | $\tfrac12[\delta(f-f_c)+\delta(f+f_c)]$ | Portadora |

onde $\text{sinc}(x)\equiv\dfrac{\sin(\pi x)}{\pi x}$.

### Dedução do par retangular ↔ sinc

$$
X(f) = \int_{-T/2}^{T/2}e^{-j2\pi ft}\,dt = \left[\frac{e^{-j2\pi ft}}{-j2\pi f}\right]_{-T/2}^{T/2} = \frac{e^{-j\pi fT}-e^{j\pi fT}}{-j2\pi f} = \frac{2\sin(\pi fT)}{2\pi f} = T\,\frac{\sin(\pi fT)}{\pi fT} = T\,\text{sinc}(fT)
$$

Este resultado é central para o arquivo 4 (banda base): todo pulso retangular no tempo (bit digital "cru") tem espectro **infinito** em largura de banda (o sinc decai apenas como $1/f$), motivando a necessidade de pulsos formatados (raised cosine) para limitar a banda ocupada.

### Transformada de sinais periódicos (via trem de deltas espectrais)

Um sinal periódico não é de energia finita, mas admite Transformada de Fourier generalizada como um trem de impulsos espectrais, ponderados pelos coeficientes de Fourier:

$$
\boxed{x(t)=\sum_nc_ne^{j2\pi nf_0t} \quad\longleftrightarrow\quad X(f)=\sum_nc_n\,\delta(f-nf_0)}
$$

Esta identidade unifica o tratamento espectral de sinais periódicos e não periódicos sob o mesmo formalismo de Fourier, essencial para tratar portadoras (sinais periódicos) moduladas por sinais de informação (tipicamente de banda finita, mas não necessariamente periódicos).

---

## Convolução, Filtragem e o Teorema de Parseval

### Convolução no tempo ↔ Produto em frequência

$$
y(t) = x(t)*h(t) \equiv \int_{-\infty}^{\infty}x(\tau)h(t-\tau)\,d\tau \quad\longleftrightarrow\quad Y(f)=X(f)H(f)
$$

**Dedução**: aplique a Transformada de Fourier à definição de convolução, troque a ordem de integração (justificável para sinais absolutamente integráveis), e reconheça a integral interna como uma Transformada de Fourier deslocada:

$$
Y(f) = \int\!\!\int x(\tau)h(t-\tau)e^{-j2\pi ft}\,d\tau\,dt = \int x(\tau)\left[\int h(t-\tau)e^{-j2\pi ft}\,dt\right]d\tau = \int x(\tau)H(f)e^{-j2\pi f\tau}\,d\tau = X(f)H(f)
$$

Este resultado é a base de **toda a teoria de filtragem linear** em comunicações: um sistema LIT (linear invariante no tempo) com resposta ao impulso $h(t)$ processa um sinal de entrada multiplicando seu espectro por $H(f)$ — a **resposta em frequência** do sistema. Filtros passa-baixas, passa-faixa, e o próprio canal de comunicação são modelados dessa forma.

### Produto no tempo ↔ Convolução em frequência (dual)

$$
x(t)y(t) \longleftrightarrow X(f)*Y(f)
$$

Por dualidade da Seção “Propriedades fundamentais (com dedução breve)”. Esta é a propriedade usada para derivar o espectro de um sinal modulado como convolução do espectro da informação com o espectro (impulsivo) da portadora — resultando no deslocamento espectral já visto na Seção “Propriedades fundamentais (com dedução breve)” aplicado agora de forma geral a portadoras moduladas em amplitude por um sinal arbitrário $m(t)$ (arquivo 2).

### Teorema de Parseval/Rayleigh (energia no tempo = energia na frequência)

$$
\boxed{E_x = \int_{-\infty}^{\infty}|x(t)|^2\,dt = \int_{-\infty}^{\infty}|X(f)|^2\,df}
$$

**Dedução**: escreva $E_x=\int x(t)x^*(t)\,dt$ e substitua $x^*(t)=\int X^*(f)e^{-j2\pi ft}\,df$ (conjugado da transformada inversa); troque a ordem de integração:

$$
E_x = \int X^*(f)\left[\int x(t)e^{-j2\pi ft}\,dt\right]df = \int X^*(f)X(f)\,df = \int|X(f)|^2\,df
$$

$|X(f)|^2$ é a **densidade espectral de energia** — mede como a energia do sinal se distribui em frequência, conceito que se generaliza para a densidade espectral de potência de processos aleatórios (Seção “Densidade Espectral de Potência de Processos Aleatórios”), central para calcular a potência de ruído que passa por um filtro receptor.

---

## Sinais Passa-Faixa e Envelope Complexo

### Motivação

Sinais de comunicação (moduladas AM/FM/PSK etc.) são tipicamente **sinais passa-faixa**: seu espectro está concentrado em torno de uma frequência de portadora $f_c$ alta, com largura de banda $B\ll f_c$. Simular tais sinais diretamente exigiria amostrar a $f_c$ (GHz em rádio), desperdiçando recursos computacionais. A representação de **envelope complexo** (ou banda base equivalente) resolve isso.

### Dedução da representação em envelope complexo

Todo sinal passa-faixa real $s(t)$ pode ser escrito como:

$$
s(t) = A(t)\cos\big(2\pi f_ct+\phi(t)\big) = \text{Re}\left\{\underbrace{A(t)e^{j\phi(t)}}_{\tilde{s}(t)}\,e^{j2\pi f_ct}\right\} = \text{Re}\{\tilde{s}(t)e^{j2\pi f_ct}\}
$$

onde $\tilde s(t)=A(t)e^{j\phi(t)}$ é o **envelope complexo** (ou sinal banda base equivalente), variando lentamente. Se o sinal RF real ocupa uma banda positiva de largura $B$ centrada em $f_c$, o envelope pode ser escolhido com suporte em $[-B/2,B/2]$. Assim, ele pode ser amostrado como sinal complexo a $F_s\ge B$, em vez de amostrar a portadora em GHz. Escrevendo $\tilde s(t)=s_I(t)+js_Q(t)$:

$$
\boxed{s(t) = s_I(t)\cos(2\pi f_ct) - s_Q(t)\sin(2\pi f_ct)}
$$

**Dedução da forma I/Q**: expandindo $\cos(2\pi f_ct+\phi)=\cos\phi\cos(2\pi f_ct)-\sin\phi\sin(2\pi f_ct)$ e identificando $s_I=A\cos\phi$, $s_Q=A\sin\phi$.

Esta decomposição é a base de **todos** os moduladores/demoduladores digitais em quadratura (QAM, PSK — arquivo 6): a informação é codificada em $(s_I,s_Q)$, e a portadora serve apenas de "veículo" de transporte para a faixa de RF.

### Relação espectral entre passa-faixa e banda base

Se $\tilde S(f)$ é a transformada de $\tilde s(t)$, então (usando $s(t)=\tfrac12[\tilde s(t)e^{j2\pi f_ct}+\tilde s^*(t)e^{-j2\pi f_ct}]$, decorrente de $\text{Re}\{z\}=\tfrac12(z+z^*)$):

$$
S(f) = \frac{1}{2}\left[\tilde S(f-f_c) + \tilde S^*(-f-f_c)\right]
$$

O espectro do sinal passa-faixa é o espectro banda base deslocado para $\pm f_c$ — simulações numéricas trabalham com $\tilde s(t)$ a uma taxa complexa determinada por sua largura de banda, reconstruindo $s(t)$ apenas quando necessário.

---

## Processos Aleatórios

### Definição

Um **processo aleatório** (ou estocástico) $X(t)$ é uma função cujo valor em cada instante $t$ é uma variável aleatória. Uma **realização** (ou amostra) $x(t)$ é uma função determinística específica, obtida de um experimento. Em comunicações, o ruído térmico, a informação transmitida (antes de ser conhecida) e o próprio canal (desvanecimento) são modelados como processos aleatórios.

### Estacionariedade em sentido amplo (WSS)

Um processo é **WSS** (*wide-sense stationary*) se:

1. A média é constante no tempo: $E[X(t)]=\mu_X$ (não depende de $t$).
2. A autocorrelação depende apenas da diferença de tempos: $R_X(t_1,t_2) = E[X(t_1)X(t_2)] = R_X(t_1-t_2) \equiv R_X(\tau)$.

A maioria dos sinais de comunicação (ruído térmico, sinais digitais aleatórios de longo prazo) são modelados como WSS — hipótese que simplifica drasticamente a análise espectral (Seção “Densidade Espectral de Potência de Processos Aleatórios”).

### Autocorrelação: propriedades e interpretação

$$
R_X(\tau) = E[X(t)X(t+\tau)]
$$

Propriedades fundamentais (demonstráveis diretamente da definição):

- $R_X(0) = E[X^2(t)] = $ potência média do processo (sempre real e não-negativa).
- $R_X(\tau) = R_X(-\tau)$ (simetria par, para processos reais — troque $t\to t-\tau$ na definição).
- $|R_X(\tau)| \le R_X(0)$ (consequência da desigualdade de Cauchy-Schwarz aplicada a $X(t)$ e $X(t+\tau)$).
- $R_X(\tau)\to \mu_X^2$ quando $\tau\to\infty$, se o processo "esquece" sua correlação com o passado distante (ergodicidade em correlação).

---

## Densidade Espectral de Potência de Processos Aleatórios

### Teorema de Wiener-Khinchin

**Teorema**: para um processo WSS $X(t)$, a **densidade espectral de potência** (PSD) é a Transformada de Fourier da função de autocorrelação:

$$
\boxed{S_X(f) \equiv \int_{-\infty}^{\infty}R_X(\tau)\,e^{-j2\pi f\tau}\,d\tau}
$$

**Ideia da prova**: considere uma janela truncada $X_T(t)=X(t)$ para $|t|<T/2$ e zero fora. Sua Transformada de Fourier é $X_T(f)$, e pelo Teorema de Parseval (Seção “Teorema de Parseval/Rayleigh (energia no tempo = energia na frequência)”), $\int|X_T(t)|^2dt=\int|X_T(f)|^2df$. Dividindo por $T$ e tomando $T\to\infty$ (com valor esperado), o lado esquerdo tende à potência média $P_X=R_X(0)$; mostra-se (via manipulação envolvendo a definição de $R_X$ e mudança de variáveis) que o lado direito, no limite, é exatamente $\int S_X(f)\,df$ com $S_X(f)$ definida como acima — a PSD é, portanto, "quanta potência por unidade de frequência" o processo carrega, generalizando $|X(f)|^2$ (válida só para sinais de energia) para sinais de potência.

### Propriedades da PSD

- $S_X(f)\ge0$ para todo $f$ (é uma densidade de potência, não pode ser negativa).
- $S_X(f)=S_X(-f)$ para processos reais (pois $R_X(\tau)$ é real e par).
- $P_X = R_X(0) = \displaystyle\int_{-\infty}^{\infty}S_X(f)\,df$ (potência total = área sob a PSD).

### PSD na saída de um filtro LIT

Se $X(t)$ (WSS, PSD $S_X(f)$) passa por um filtro LIT com resposta em frequência $H(f)$, a PSD da saída $Y(t)=X(t)*h(t)$ é:

$$
\boxed{S_Y(f) = |H(f)|^2\,S_X(f)}
$$

**Dedução (esboço)**: a autocorrelação da saída se relaciona com a de entrada por $R_Y(\tau)=R_X(\tau)*h(\tau)*h^*(-\tau)$ (resultado da definição $Y(t)=\int h(\alpha)X(t-\alpha)d\alpha$ substituída em $E[Y(t)Y(t+\tau)]$); aplicando Fourier a ambos os lados e usando a propriedade de convolução (Seção “Convolução no tempo ↔ Produto em frequência”) mais o fato de que a transformada de $h^*(-\tau)$ é $H^*(f)$: $S_Y(f)=S_X(f)H(f)H^*(f)=|H(f)|^2S_X(f)$. Este resultado é usado extensivamente para calcular a potência de ruído na saída de filtros receptores (Seção “Ruído Térmico e Ruído Branco Gaussiano (AWGN)”, e ao longo de toda a apostila).

---

## Ruído Térmico e Ruído Branco Gaussiano (AWGN)

### Origem física do ruído térmico

O movimento térmico aleatório dos elétrons em qualquer condutor com resistência $R$ a temperatura $T$ (Kelvin) produz uma tensão de ruído — o **ruído de Johnson-Nyquist**. A potência máxima disponível em uma carga casada, numa banda positiva de largura $B$, é $k_BTB$. Assim, sua densidade disponível **unilateral** é $k_BT$; na representação bilateral de um processo real, essa potência é dividida entre frequências positivas e negativas. Para frequências até a região de micro-ondas (aproximação clássica de Rayleigh-Jeans, válida quando $hf\ll k_BT$):

$$
S_N(f) = \frac{k_BT}{2}\qquad\text{(W/Hz, bilateral)}
$$

onde $k_B=1{,}380649\times10^{-23}\,\text{J/K}$ é a constante de Boltzmann. A PSD é **constante em frequência** até frequências extremamente altas (ordem de THz à temperatura ambiente) — daí o nome **ruído branco** (por analogia com a luz branca, que contém todas as frequências visíveis com intensidade comparável).

### Modelo AWGN (Additive White Gaussian Noise)

O modelo padrão de canal em comunicações digitais é:

$$
\boxed{r(t) = s(t) + n(t)}
$$

onde $s(t)$ é o sinal transmitido e $n(t)$ é **ruído branco Gaussiano aditivo**, com:

1. **Branco**: $S_N(f) = N_0/2$ (constante em toda frequência de interesse). Aqui, $N_0$ é o **parâmetro unilateral** de densidade de ruído; portanto, a PSD bilateral do processo real é $N_0/2$. Para uma fonte térmica equivalente, $N_0=k_BT_{eq}$. A temperatura $T_{eq}$ representa o ruído acrescentado pelo receptor e não deve ser confundida, sem justificativa, com sua temperatura física.
2. **Gaussiano**: em cada instante $t$, $N(t)$ é uma variável aleatória Gaussiana de média zero (justificado pelo **Teorema Central do Limite**: o ruído é a soma de contribuições de um número enorme de elétrons e fontes microscópicas independentes).
3. **Aditivo**: soma-se ao sinal, não o multiplica nem distorce.

### Potência de ruído após filtragem de banda $B$

Um filtro receptor ideal de largura de banda $B$ (passa-baixas ou passa-faixa) limita o ruído branco (infinito em potência total) a uma potência finita. Pela Seção “PSD na saída de um filtro LIT”, com $|H(f)|^2=1$ dentro da banda e $0$ fora:

$$
\boxed{P_N = \int_{-B}^{B}\frac{N_0}{2}\,df = N_0B}
$$

(para um passa-baixas cujo corte positivo é $B$, isto é, que ocupa $-B\le f\le B$). Em um passa-faixa real, se $B$ denota a largura da banda em frequências positivas, existe também sua imagem simétrica em frequências negativas; a integral bilateral volta a fornecer $P_N=N_0B$. Esta convenção de $B$ é usada em **todo** o restante da apostila para calcular a relação sinal-ruído (SNR) na entrada do demodulador.

### Densidade de probabilidade Gaussiana

$$
f_N(n) = \frac{1}{\sqrt{2\pi\sigma^2}}\exp\left(-\frac{n^2}{2\sigma^2}\right),\qquad \sigma^2 = P_N = N_0B
$$

$\sigma^2$ é a variância (= potência média do ruído filtrado). Após um passa-baixas retangular, o ruído Gaussiano já não é independente em instantes arbitrários: sua autocorrelação tem forma sinc. Amostras Gaussianas são independentes quando sua correlação é nula; no filtro ideal acima, isso ocorre em separações inteiras de $1/(2B)$. No receptor digital, o filtro casado e a amostragem nos instantes de símbolo produzem as variáveis de decisão modeladas como i.i.d. quando os pulsos são ortogonais e o canal não introduz memória. Essa é a base do **canal AWGN discreto** usado nas simulações de BER (arquivos 5 e 6): cada símbolo recebido é o símbolo transmitido mais uma amostra de $\mathcal{N}(0,\sigma^2)$, independente das demais sob essas hipóteses.

---

## Função Q e Probabilidade de Erro

### Definição da função Q

A **função Q** é a probabilidade de cauda de uma Gaussiana padrão $\mathcal N(0,1)$:

$$
\boxed{Q(x) \equiv \int_x^\infty \frac{1}{\sqrt{2\pi}}e^{-u^2/2}\,du = P(Z>x),\quad Z\sim\mathcal N(0,1)}
$$

Propriedades: $Q(0)=1/2$; $Q(-x)=1-Q(x)$; $Q(x)$ é monotonicamente decrescente; não tem forma fechada elementar (relacionada à função erro complementar, $Q(x)=\tfrac12\text{erfc}(x/\sqrt2)$).

### Dedução da probabilidade de erro para detecção binária em AWGN

Considere a detecção de um bit binário: transmite-se $+A$ (bit 1) ou $-A$ (bit 0), o receptor observa $r=s+n$ com $n\sim\mathcal N(0,\sigma^2)$, e decide "1" se $r>0$, "0" caso contrário (**detector de limiar ótimo** para sinais antipodais equiprováveis, resultado que será justificado formalmente no arquivo 5 via detecção de máxima verossimilhança). Dado que "0" foi transmitido ($s=-A$), o erro ocorre se $r>0$, isto é, se $n>A$:

$$
P(\text{erro}\,|\,s=-A) = P(n>A) = \int_A^\infty\frac{1}{\sqrt{2\pi}\sigma}e^{-n^2/(2\sigma^2)}\,dn
$$

Substituindo $u=n/\sigma$ ($du=dn/\sigma$), os limites tornam-se $A/\sigma$ a $\infty$:

$$
P(\text{erro}\,|\,s=-A) = \int_{A/\sigma}^\infty\frac{1}{\sqrt{2\pi}}e^{-u^2/2}\,du = Q\!\left(\frac{A}{\sigma}\right)
$$

Por simetria (mesmo argumento para $s=+A$, erro se $n<-A$), a probabilidade de erro é a mesma condicionada a cada símbolo, logo:

$$
\boxed{P_e = Q\!\left(\frac{A}{\sigma}\right)}
$$

Esta é a fórmula-mãe de onde **todas** as expressões de BER (Bit Error Rate) do restante da apostila são derivadas (ASK, PSK, FSK, QAM — arquivos 5 e 6), trocando $A/\sigma$ pela distância euclidiana relevante entre símbolos da constelação, normalizada pelo desvio padrão do ruído.

### Relação com $E_b/N_0$

Definindo a energia por bit $E_b = A^2T_b$ (para um pulso retangular de amplitude $A$ e duração $T_b$) e usando $\sigma^2=N_0B$ com $B\approx1/(2T_b)$ (banda de um filtro casado, resultado justificado no arquivo 5):

$$
\frac{A}{\sigma} = \sqrt{\frac{2E_b}{N_0}} \quad\Rightarrow\quad \boxed{P_e = Q\!\left(\sqrt{\frac{2E_b}{N_0}}\right)}
$$

Esta é a forma em que a probabilidade de erro é universalmente reportada na literatura de comunicações digitais — em função da razão **energia por bit sobre densidade espectral de ruído**, $E_b/N_0$, permitindo comparar esquemas de modulação diferentes em bases equivalentes (mesma energia gasta por bit de informação).

---

## Exercícios Resolvidos em Python

### Protocolo computacional

**Objetivo:** verificar Fourier, Parseval, PSD de AWGN e a função $Q$. **Reprodutibilidade:** use `np.random.default_rng(42)`, declare frequência de amostragem e convenção de FFT/PSD. **Validação:** compare energia nos dois domínios e BER simulada com a expressão analítica, informando a contagem de erros.

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy import signal
from scipy.special import erfc

# === Série de Fourier de uma onda quadrada ===
def coef_fourier_onda_quadrada(n, A=1.0):
    """Coeficientes c_n de uma onda quadrada ímpar de amplitude A (só harmônicos ímpares)."""
    if n == 0:
        return 0.0
    if n % 2 == 0:
        return 0.0
    return (2*A)/(1j*np.pi*n)

N_harm = 15
ns = np.arange(-N_harm, N_harm+1)
cs = np.array([coef_fourier_onda_quadrada(n) for n in ns])
t = np.linspace(-1, 1, 2000)
f0 = 1.0
x_reconstruida = np.real(sum(cs[i]*np.exp(1j*2*np.pi*ns[i]*f0*t) for i in range(len(ns))))
print(f"Reconstrução com {N_harm} harmônicos ímpares: max={x_reconstruida.max():.3f} (ideal=1.0, fenômeno de Gibbs)")

# === Transformada de Fourier numérica: pulso retangular -> sinc ===
def pulso_retangular(t, T):
    return np.where(np.abs(t) <= T/2, 1.0, 0.0)

Fs = 1000
t_vec = np.arange(-5, 5, 1/Fs)
T_pulso = 1.0
x = pulso_retangular(t_vec, T_pulso)
X = np.fft.fftshift(np.fft.fft(x)) / Fs
f_vec = np.fft.fftshift(np.fft.fftfreq(len(t_vec), 1/Fs))

X_teorico = T_pulso * np.sinc(f_vec*T_pulso)
erro_max = np.max(np.abs(np.abs(X) - np.abs(X_teorico)))
print(f"\nErro máximo FFT numérica vs. T*sinc(fT) teórico: {erro_max:.4f}")

# === Verificação de Parseval ===
E_tempo = np.sum(np.abs(x)**2) / Fs
E_freq = np.sum(np.abs(X)**2) * (f_vec[1]-f_vec[0])
print(f"\nEnergia no tempo:      {E_tempo:.4f}")
print(f"Energia na frequência: {E_freq:.4f}  (Parseval)")

# === Ruído AWGN: geração e verificação de PSD ===
def gerar_awgn(N, N0_sobre_2, Fs):
    """Gera N amostras de ruído branco com PSD bilateral N0/2 (variância = N0/2 * Fs)."""
    sigma = np.sqrt(N0_sobre_2 * Fs)
    return np.random.normal(0, sigma, N)

N0_2 = 1e-3
Fs_ruido = 10000
n_amostras = 100000
ruido = gerar_awgn(n_amostras, N0_2, Fs_ruido)
print(f"\nRuído AWGN gerado: variância medida={np.var(ruido):.6e}, esperada={N0_2*Fs_ruido:.6e}")

f_psd, Pxx = signal.welch(ruido, Fs_ruido, nperseg=1024)
print(f"PSD média medida: {np.mean(Pxx):.6e} (esperado ~{N0_2:.6e}, unilateral = 2x bilateral)")

# === Função Q e probabilidade de erro binária ===
def Q(x):
    return 0.5*erfc(x/np.sqrt(2))

A, sigma_ruido = 1.0, 0.3
Pe = Q(A/sigma_ruido)
print(f"\nP_e (detecção binária, A/sigma={A/sigma_ruido:.2f}): {Pe:.6e}")

# Verificação por simulação Monte Carlo
n_bits = 200000
bits = np.random.randint(0, 2, n_bits)
s = np.where(bits==1, A, -A)
r = s + np.random.normal(0, sigma_ruido, n_bits)
bits_detectados = (r > 0).astype(int)
Pe_simulado = np.mean(bits_detectados != bits)
print(f"P_e simulado (Monte Carlo, {n_bits} bits): {Pe_simulado:.6e}")

# === Curva de P_e vs Eb/N0 ===
EbN0_dB = np.arange(0, 13, 1)
EbN0_lin = 10**(EbN0_dB/10)
Pe_teorico = Q(np.sqrt(2*EbN0_lin))

fig, ax = plt.subplots(figsize=(8,5))
ax.semilogy(EbN0_dB, Pe_teorico, 'b-o', label='$P_e=Q(\\sqrt{2E_b/N_0})$')
ax.set_xlabel('$E_b/N_0$ (dB)')
ax.set_ylabel('Probabilidade de erro de bit')
ax.set_title('Curva de BER teórica — detecção binária antipodal em AWGN')
ax.grid(True, which='both', alpha=0.3)
ax.legend()
plt.tight_layout()
```

**Saída esperada**:

- Reconstrução de Fourier: overshoot de ~9% acima da amplitude ideal (fenômeno de Gibbs), típico de truncar uma série de Fourier de um sinal descontínuo.
- FFT numérica vs. sinc teórico: erro pequeno (efeitos de janelamento/discretização).
- Parseval: energia no tempo e na frequência coincidem.
- Ruído AWGN: variância medida ≈ variância teórica.
- $P_e$ teórico (fórmula Q) e $P_e$ simulado (Monte Carlo) devem coincidir dentro da incerteza estatística de $\sqrt{P_e(1-P_e)/n_{bits}}$.
- Curva BER: decaimento exponencial característico, ~1 década a cada ~2 dB de $E_b/N_0$ adicional nessa região.

---

## Lista de Exercícios Propostos

**E1.** Calcule a Série de Fourier (coeficientes $c_n$) de um trem de pulsos retangulares periódico, com período $T_0=1\,\text{ms}$, largura de pulso $\tau=0{,}2\,\text{ms}$ e amplitude $A=5\,\text{V}$.

**E2.** Usando a propriedade de deslocamento em frequência, determine o espectro $X(f)$ de $x(t)=\text{sinc}(2Wt)\cos(2\pi f_ct)$, com $f_c\gg W$. Esboce o resultado.

**E3.** Demonstre a propriedade de escalamento no tempo $x(at)\leftrightarrow\frac{1}{|a|}X(f/a)$ a partir da definição da Transformada de Fourier (faça a substituição de variável explicitamente, tratando os casos $a>0$ e $a<0$).

**E4.** Um filtro passa-baixas ideal tem $H(f)=\text{rect}(f/2B)$. Um sinal de entrada tem PSD $S_X(f)=S_0$ (constante, ruído branco) para todo $f$. Calcule a potência do sinal na saída do filtro.

**E5.** Mostre que a autocorrelação de um processo WSS satisfaz $R_X(\tau)=R_X(-\tau)$ partindo da definição $R_X(\tau)=E[X(t)X(t+\tau)]$ e da propriedade de estacionariedade.

**E6.** Um resistor de $R=50\,\Omega$ está a temperatura ambiente $T=290\,\text{K}$. Calcule a potência de ruído térmico disponível em uma banda $B=10\,\text{MHz}$ (use $P_N=k_BTB$, forma equivalente à da Seção “Potência de ruído após filtragem de banda $B$” para ruído unilateral).

**E7.** Calcule $Q(0)$, $Q(1)$, $Q(2)$, $Q(3)$ numericamente (ou usando tabela) e verifique a relação $Q(-x)=1-Q(x)$ calculando também $Q(-1)$.

**E8.** Para um sistema de detecção binária antipodal com $A=2\,\text{V}$ e ruído com $\sigma=0{,}5\,\text{V}$, calcule $P_e$. Se a amplitude for dobrada para $A=4\,\text{V}$ (mantendo $\sigma$), por qual fator aproximado $P_e$ diminui (expresse em ordens de grandeza, usando a natureza exponencial da cauda de $Q(x)$ para $x$ grande)?

**E9.** Escreva o sinal passa-faixa $s(t)=3\cos(2\pi f_ct)-4\sin(2\pi f_ct)$ na forma envelope-fase $A(t)\cos(2\pi f_ct+\phi(t))$, determinando $A$ e $\phi$ (constantes, neste caso).

**E10 (desafio).** Um sinal aleatório binário NRZ (Não-Retorno-a-Zero) transmite $+A$ ou $-A$ com igual probabilidade a cada intervalo de bit $T_b$, de forma independente entre intervalos. Mostre que sua autocorrelação é $R_X(\tau) = A^2\left(1-\dfrac{|\tau|}{T_b}\right)$ para $|\tau|<T_b$ e $R_X(\tau)=0$ para $|\tau|\ge T_b$ (dica: para $|\tau|<T_b$, considere a probabilidade de que $\tau$ "caia" dentro do mesmo intervalo de bit vs. em um intervalo adjacente). Em seguida, aplique o Teorema de Wiener-Khinchin para obter $S_X(f)=A^2T_b\,\text{sinc}^2(fT_b)$.

**E11 (desafio).** Um sinal passa-faixa real ocupa a faixa positiva de $f_c-B/2$ a $f_c+B/2$, com $f_c=1\,\text{GHz}$ e $B=1\,\text{MHz}$. Compare a taxa mínima para amostrar diretamente o sinal real RF e para amostrar o envelope complexo cujo suporte é $[-B/2,B/2]$. Quantas amostras complexas por segundo são poupadas?

**E12.** Verifique a identidade $\cos(2\pi f_ct+\phi) = \cos\phi\cos(2\pi f_ct)-\sin\phi\sin(2\pi f_ct)$ usando a fórmula de adição de ângulos, e identifique $s_I$ e $s_Q$ para $A=5$, $\phi=60°$.

---

## Gabarito

**E1.** $c_n = \dfrac{1}{T_0}\displaystyle\int_{-\tau/2}^{\tau/2}A\,e^{-j2\pi nf_0t}\,dt = \dfrac{A}{T_0}\left[\dfrac{e^{-j2\pi nf_0t}}{-j2\pi nf_0}\right]_{-\tau/2}^{\tau/2} = \dfrac{A}{n\pi}\sin(\pi nf_0\tau)$ para $n\neq0$, e $c_0=A\tau/T_0$ (valor médio, = duty cycle × amplitude). Reescrevendo com a função sinc: $c_n = \dfrac{A\tau}{T_0}\,\text{sinc}(nf_0\tau)$. Numericamente, $f_0=1/T_0=1000\,\text{Hz}$, $f_0\tau=0{,}2$:

$$
\boxed{c_n = \frac{(5)(0{,}2\times10^{-3})}{10^{-3}}\,\text{sinc}(0{,}2n) = 1{,}0\cdot\text{sinc}(0{,}2n)\,\text{V},\qquad c_0=1{,}0\,\text{V}}
$$

**E2.** $\text{sinc}(2Wt)\leftrightarrow\frac{1}{2W}\text{rect}(f/2W)$ (par da Seção “Pares de transformadas fundamentais”). Pela propriedade de modulação (Seção “Propriedades fundamentais (com dedução breve)”), multiplicar por $\cos(2\pi f_ct)$ desloca o espectro para $\pm f_c$ com fator $1/2$:

$$
\boxed{X(f) = \frac{1}{4W}\left[\text{rect}\!\left(\frac{f-f_c}{2W}\right)+\text{rect}\!\left(\frac{f+f_c}{2W}\right)\right]}
$$

Esboço: dois retângulos de largura $2W$ e altura $1/(4W)$, centrados em $f=\pm f_c$ — não se sobrepõem pois $f_c\gg W$.

**E3.** Caso $a>0$: substituindo $u=at$ ($du=a\,dt$) em $X_a(f)=\int x(at)e^{-j2\pi ft}dt$: $X_a(f)=\int x(u)e^{-j2\pi f(u/a)}\frac{du}{a} = \frac{1}{a}\int x(u)e^{-j2\pi(f/a)u}du = \frac{1}{a}X(f/a)$. Caso $a<0$: com $a=-|a|$, a substituição $u=at$ inverte os limites de integração ($t:-\infty\to\infty$ corresponde a $u:\infty\to-\infty$), introduzindo um sinal negativo extra que cancela com o $1/a$ negativo, resultando em $\frac{1}{|a|}X(f/a)$. Combinando os dois casos: $\boxed{x(at)\leftrightarrow\frac{1}{|a|}X(f/a)}$.

**E4.** Pela Seção “PSD na saída de um filtro LIT”, $S_Y(f)=|H(f)|^2S_X(f) = S_0$ para $|f|<B$ e $0$ fora. Potência de saída:

$$
P_Y = \int_{-B}^{B}S_0\,df = \boxed{2S_0B}
$$

**E5.** Por definição, $R_X(-\tau)=E[X(t)X(t-\tau)]$. Fazendo a mudança de variável $t'=t-\tau$ (ou seja, $t=t'+\tau$): $R_X(-\tau)=E[X(t'+\tau)X(t')]=E[X(t')X(t'+\tau)]$. Como o processo é WSS, esta expectativa não depende de qual instante $t'$ se escolhe, e por definição é exatamente $R_X(\tau)$. Logo $\boxed{R_X(-\tau)=R_X(\tau)}$ — simetria par.

**E6.** $P_N = k_BTB = (1{,}380649\times10^{-23})(290)(10\times10^6)$:

$$
\boxed{P_N \approx 4{,}00\times10^{-14}\,\text{W} = 40{,}0\,\text{fW}}
$$

(Nota: esta é a forma unilateral $k_BTB$, equivalente a integrar a PSD bilateral $N_0/2=k_BT/2$ de $-B$ a $B$, que dá exatamente $k_BTB$ — consistente com a Seção “Potência de ruído após filtragem de banda $B$”.)

**E7.** Valores numéricos (via tabela ou `scipy.special.erfc`): $Q(0)=0{,}5$; $Q(1)\approx0{,}1587$; $Q(2)\approx0{,}0228$; $Q(3)\approx0{,}00135$. Verificação: $Q(-1) = 1-Q(1) = 1-0{,}1587 = 0{,}8413$ — consistente com a definição, pois $Q(-1)=P(Z>-1)=P(Z<1)=1-P(Z>1)=1-Q(1)$.

$$
\boxed{Q(0)=0{,}5;\ Q(1)\approx0{,}1587;\ Q(2)\approx0{,}0228;\ Q(3)\approx0{,}00135;\ Q(-1)\approx0{,}8413}
$$

**E8.** $P_e = Q(A/\sigma) = Q(2/0{,}5) = Q(4) \approx 3{,}17\times10^{-5}$. Dobrando $A$: $P_e' = Q(4/0{,}5)=Q(8)\approx6{,}22\times10^{-16}$.

$$
\boxed{P_e\approx3{,}17\times10^{-5}\ \to\ P_e'\approx6{,}22\times10^{-16}\qquad\text{(redução de aproximadamente 11 ordens de grandeza)}}
$$

Isso ilustra a natureza extremamente não-linear (decaimento tipo $e^{-x^2/2}$) da função $Q$: dobrar a distância entre símbolos (ou, equivalentemente, quadruplicar a energia) reduz $P_e$ de forma dramática — motivo pelo qual pequenos aumentos de $E_b/N_0$ produzem grandes ganhos de confiabilidade (visível no "joelho" das curvas de BER, arquivos 5 e 6).

**E9.** Comparando com $s(t)=s_I\cos(2\pi f_ct)-s_Q\sin(2\pi f_ct)$: $s_I=3$, $s_Q=4$. Logo:

$$
A = \sqrt{s_I^2+s_Q^2} = \sqrt{9+16}=5,\qquad \phi = \arctan\!\left(\frac{s_Q}{s_I}\right) = \arctan(4/3)\approx53{,}13°
$$

$$
\boxed{s(t) = 5\cos(2\pi f_ct+53{,}13°)}
$$

Verificação: $5\cos(53{,}13°)\approx3{,}0=s_I$ ✓, $5\sin(53{,}13°)\approx4{,}0=s_Q$ ✓.

**E10 (desafio).** Para $|\tau|<T_b$: com probabilidade $1-|\tau|/T_b$, os instantes $t$ e $t+\tau$ caem no **mesmo** intervalo de bit (mesmo valor $\pm A$, produto $=A^2$); com probabilidade $|\tau|/T_b$, caem em intervalos **adjacentes distintos** e independentes (valores independentes $\pm A$ cada, produto médio $=E[\pm A]\cdot E[\pm A]=0\cdot0=0$, pois cada bit tem média zero). Logo:

$$
R_X(\tau) = \left(1-\frac{|\tau|}{T_b}\right)A^2 + \frac{|\tau|}{T_b}\cdot0 = A^2\left(1-\frac{|\tau|}{T_b}\right),\qquad |\tau|<T_b
$$

Para $|\tau|\ge T_b$, os dois instantes estão sempre em intervalos de bit diferentes (e, assumindo bits i.i.d., não-correlacionados), logo $R_X(\tau)=0$. Isso confirma a forma triangular enunciada. Aplicando Wiener-Khinchin (Seção “Teorema de Wiener-Khinchin”), a transformada de uma função triangular de base $2T_b$ e altura $A^2$ é (resultado padrão, obtido por integração direta ou reconhecendo o triângulo como a autoconvolução de um retângulo de largura $T_b$):

$$
\boxed{S_X(f) = A^2T_b\,\text{sinc}^2(fT_b)}
$$

Este é o espectro padrão de um sinal digital NRZ aleatório — um lóbulo principal de largura $2/T_b$ com lóbulos laterais decaindo como $1/f^2$, resultado usado extensivamente no arquivo 4 (banda base).

**E11 (desafio).** Amostragem direta do sinal real: a maior frequência é $f_{\max}=f_c+B/2=1{,}0005$ GHz, logo a taxa mínima uniforme é

$$F_{s,\rm RF}\ge2f_{\max}=2{,}001\ \text{GHz}.$$

O envelope complexo ocupa $[-B/2,B/2]$; como suas amostras são complexas, a taxa mínima é

$$F_{s,\rm bb}\ge B=1\ \text{MHz}.$$

$$
\boxed{\text{Razão}=\frac{2(f_c+B/2)}{B}=2001.}
$$

A simulação via envelope complexo exige cerca de **2000 vezes menos amostras**. Técnicas especializadas de subamostragem passa-faixa podem reduzir a taxa de uma representação RF sob condições estritas de filtragem e sincronismo, mas o envelope complexo é a representação robusta e usual em simulações de comunicação.

**E12.** Pela fórmula de adição, $\cos(2\pi f_ct+\phi)=\cos(2\pi f_ct)\cos\phi-\sin(2\pi f_ct)\sin\phi$, que reescrita na forma-padrão $s_I\cos(2\pi f_ct)-s_Q\sin(2\pi f_ct)$ identifica $s_I=A\cos\phi$ e $s_Q=A\sin\phi$ (com $A$ a amplitude, aqui implicitamente $1$ na identidade trigonométrica pura). Para $A=5$, $\phi=60°$:

$$
s_I = 5\cos(60°) = 5(0{,}5) = 2{,}5,\qquad s_Q = 5\sin(60°) = 5(0{,}8660) \approx4{,}33
$$

$$
\boxed{s_I=2{,}5,\quad s_Q\approx4{,}33}
$$

Verificação: $\sqrt{s_I^2+s_Q^2}=\sqrt{6{,}25+18{,}75}=\sqrt{25}=5=A$ ✓.

---

