# Equalização — Compensação da Dispersão do Canal

> Comunicações Digitais — Apostila de Curso
> Tópicos: ISI · Equalizadores lineares ZF/MMSE · Equalização adaptativa LMS/RLS · DFE · MLSE · Equalização OFDM

## Antes de começar

Ao final, você deve diagnosticar ISI, derivar ZF e MMSE, explicar convergência adaptativa e escolher entre equalização linear, DFE, MLSE e OFDM. **Diagnóstico:** por que inverter exatamente o canal pode piorar o receptor? **Evidência mínima:** comparar resposta conjunta, MSE e BER de ZF e MMSE no mesmo canal e SNR.

## Sumário

1. [Origem da ISI e o problema da equalização](#origem-da-isi-e-o-problema-da-equalização)
2. [Equalizadores Lineares: Zero-Forcing](#equalizadores-lineares-zero-forcing)
3. [Limitações do Zero-Forcing: Amplificação de Ruído](#limitações-do-zero-forcing-amplificação-de-ruído)
4. [Equalizadores MMSE — Dedução Completa](#equalizadores-mmse--dedução-completa)
5. [Equalização por Detecção de Sequência](#equalização-por-detecção-de-sequência)
6. [Equalização Adaptativa: LMS, RLS e CMA](#equalização-adaptativa-lms-rls-e-cma)
7. [Equalização em Sistemas Práticos](#equalização-em-sistemas-práticos)
8. [Exercícios resolvidos em Python](#exercícios-resolvidos-em-python)
9. [Lista de Exercícios Propostos](#lista-de-exercícios-propostos)
10. [Gabarito](#gabarito)

## Origem da ISI e o problema da equalização

### Dispersão do canal: o fenômeno físico

Em qualquer canal de comunicação real, o sinal se propaga por **múltiplos percursos** (multipath): reflexões, refrações e difrações fazem com que o receptor capte várias cópias atrasadas do mesmo símbolo. Alternativamente, um canal pode ser **banda limitada**, filtrando os componentes de alta frequência do sinal. Em ambos os casos, a resposta ao impulso do canal não é um impulso único $\delta(t)$, mas sim uma função decaimento $h(t)$ com duração finita ou efetiva.

Considere um canal modelado como um filtro linear com resposta ao impulso $h_c(t)$. O sinal recebido (após o filtro de recepção) é:

$$
r(t) = \sum_{\ell=0}^{L-1} h[\ell]\,x[n-\ell] + w[n],
$$

onde $x[n]$ são os símbolos transmitidos, $h[\ell]$ é a resposta ao impulso discreta do canal (com $L$ taps), e $w[n]$ é o ruído AWGN amostrado.

### ISI — Interferência Intersimbólica

Quando $h[\ell] \neq 0$ para $\ell \neq 0$, um símbolo $x[n]$ "vaza" para instantes de amostragem vizinhos, interferindo com símbolos subsequentes e anteriores. Este fenômeno é chamado de **ISI** (Interferência Intersimbólica).

**Exemplo concreto**: se $h = [0{,}3,\; 1{,}0,\; 0{,}3]$, o símbolo no instante $n$ contribui com 0,3 da amplitude nos instantes $n-1$ e $n+1$. Ao amostrar em $n+1$, recebemos não apenas $x[n+1]$, mas também $0{,}3\cdot x[n]$, que é interferência do símbolo anterior.

### Formulação do problema de equalização

**Definição**: Equalização é o processo de compensar a distorção introduzida pelo canal, de modo que a resposta conjunta do canal + equalizador seja próxima de um impulso atrasado:

$$
\boxed{H_{\text{eq}}(z)\,H_c(z)\,H_{\text{rx}}(z) \approx z^{-d}},
$$

onde $H_c(z)$ é a resposta do canal, $H_{\text{rx}}(z)$ é o filtro de recepção (tipicamente um filtro casado), $H_{\text{eq}}(z)$ é o equalizador, e $d$ é o atraso de decisão (permitindo que o equalizador seja causal).

**Dedução**: O sinal recebido no domínio Z é $R(z) = X(z)H_c(z)H_{\text{rx}}(z) + W(z)$. Após o equalizador:

$$
Y(z) = R(z)H_{\text{eq}}(z) = X(z)\underbrace{H_c(z)H_{\text{rx}}(z)H_{\text{eq}}(z)}_{C(z)} + W(z)H_{\text{eq}}(z).
$$

O objetivo é que $C(z) \approx z^{-d}$, de modo que $y[n] \approx x[n-d] + \text{ruído amplificado}$.

**Observação**: o filtro casado à forma de onda recebida maximiza a SNR no instante escolhido, mas não cancela necessariamente a ISI. Um canal causal de fase mínima tem zeros dentro do círculo unitário e admite inversa causal estável; zeros fora caracterizam fase não mínima e tornam a inversa causal instável. Nulos sobre o círculo unitário impedem inversão perfeita estável. Equalizadores FIR aproximam essa inversão com atraso e erro residual.

### Diagrama de olho

O **diagrama de olho** é uma ferramenta visual poderosa para avaliar a presença de ISI. Ele superpõe segmentos do sinal recebido, cada um de duração $T_s$, centralizados em múltiplos de $T_s$.

**Interpretação**:

- **Olho aberto** (abertura vertical grande) = pouco ISI, fácil decisão.
- **Olho fechado** (abertura vertical pequena) = ISI severo, alta probabilidade de erro.
- A **largura horizontal** do olho aberto indica a margem de timing.
- A **altura vertical** no ponto de amostragem é proporcional à margem de ruído.

Uma medida determinística simples para BPSK é comparar o cursor principal com a soma absoluta dos demais cursores:

$$\boxed{A_{\rm eye}\ge2\sqrt{E_s}\left(|c[d]|-\sum_{k\ne d}|c[k]|\right).}$$

Se o termo entre parênteses for positivo, ele é uma cota inferior da abertura vertical sem ruído; o ruído torna as trajetórias espessas e deve ser descrito separadamente, por exemplo com intervalos $\pm q\sigma_n$. Não se mede abertura usando o menor pós-cursor isolado.

## Equalizadores Lineares: Zero-Forcing

### Estrutura do equalizador transversal (FIR)

**Definição**: Um equalizador transversal (ou FIR) é um filtro digital com resposta ao impulso finita:

$$
\boxed{y[n] = \sum_{k=0}^{N-1} w_k\,x[n-k]},
$$

onde $x[n]$ é a entrada (sinal recebido), $w_k$ são os coeficientes do equalizador, e $N$ é o número de taps (estágios de atraso).

**Estrutura**: O sinal de entrada passa por uma série de $N-1$ estágios de atraso ($z^{-1}$). Cada amostra atrasada é multiplicada por um coeficiente $w_k$ e a soma produz a saída.

**Representação matricial**: Para $M$ amostras consecutivas:

$$
\begin{pmatrix} y[n] \\ y[n+1] \\ \vdots \\ y[n+M-1] \end{pmatrix}
= \underbrace{\begin{pmatrix}
x[n] & x[n-1] & \cdots & x[n-N+1] \\
x[n+1] & x[n] & \cdots & x[n-N+2] \\
\vdots & \vdots & \ddots & \vdots \\
x[n+M-1] & x[n+M-2] & \cdots & x[n+M-N]
\end{pmatrix}}_{\mathbf{X}}
\begin{pmatrix} w_0 \\ w_1 \\ \vdots \\ w_{N-1} \end{pmatrix}.
$$

### Equalizador Zero-Forcing: conceito

**Definição**: O equalizador Zero-Forcing (ZF) é projetado para **cancelar completamente o ISI** (em teoria), impondo que a resposta ao impulso conjunta seja exatamente um impulso atrasado:

$$
\boxed{c[k] = \begin{cases} 1, & k = d \\ 0, & k \neq d \end{cases}}
$$

onde $c = h * w$ é a convolução da resposta do canal com a resposta do equalizador.

### DEDUÇÃO dos coeficientes ZF no domínio do tempo

Seja $h = [h_0, h_1, \ldots, h_{L-1}]$ a resposta do canal e $w = [w_0, w_1, \ldots, w_{N-1}]$ a resposta do equalizador. A convolução $c = h * w$ tem $L+N-1$ amostras. Impomos $c[d] = 1$ e $c[k] = 0$ para $k \neq d$.

Construa a matriz de convolução $\mathbf H\in\mathbb C^{(L+N-1)\times N}$:

$$
\mathbf H=\begin{pmatrix}
h_0 & 0 & \cdots & 0 \\
h_1 & h_0 & \cdots & 0 \\
\vdots & \vdots & \ddots & \vdots \\
h_{L-1}&h_{L-2}&\cdots&0\\
0&h_{L-1}&\cdots&0\\
\vdots&\vdots&\ddots&h_0\\
0&0&\cdots&h_{L-1}
\end{pmatrix}.
$$

Então $\mathbf c=\mathbf H\mathbf w$ e o alvo é o vetor $\mathbf e_d$ com 1 na posição $d$. Como há $L+N-1$ restrições e apenas $N$ coeficientes, um FIR finito normalmente **não consegue** zerar todos os cursores. Há três casos:

1. Se $\mathbf H\mathbf w=\mathbf e_d$ for consistente, qualquer solução exata é ZF.
2. Se for sobredefinido, usa-se o ZF de mínimos quadrados
   $$\boxed{\mathbf w_{\rm ZF}=\mathbf H^\dagger\mathbf e_d
   =(\mathbf H^H\mathbf H)^{-1}\mathbf H^H\mathbf e_d}$$
   quando $\mathbf H$ tem posto completo.
3. Se a matriz for mal condicionada ou singular, usa-se a pseudoinversa SVD e aceita-se ISI residual; regularização conduz ao MMSE.

O atraso $d$ deve ser testado: ele altera quais pré- e pós-cursores um FIR causal consegue aproximar.

### Solução numérica

Resolver as equações normais custa $O(N^3)$ e pode piorar o condicionamento. Decomposição QR ou SVD é numericamente preferível. Levinson–Durbin só se aplica quando o sistema resultante é Hermitiano Toeplitz positivo definido; não se deve aplicá-lo automaticamente à matriz retangular de convolução.

### Exercício em Python: equalizador ZF para canal de 3 taps

```python
import numpy as np
import matplotlib.pyplot as plt

# Canal de 3 taps
h = np.array([0.3, 1.0, 0.45])

# Numero de taps do equalizador
N = 5
d = N // 2  # atraso de decision

# Construir matriz Toeplitz do canal
H = np.zeros((N, N))
for i in range(N):
    for j in range(N):
        lag = i - j
        if 0 <= lag < len(h):
            H[i, j] = h[lag]

# Vetor desejado: impulso atrasado em d
desired = np.zeros(N)
desired[d] = 1.0

# Resolver w = H^{-1} * desired
w_zf = np.linalg.solve(H, desired)
print(f'Coeficientes ZF: {np.round(w_zf, 4)}')

# Verificar resposta conjunta
c = np.convolve(h, w_zf)[:N+2]
print(f'Resposta conjunta: {np.round(c, 4)}')

# Plotar resposta do canal e equalizador
fig, axes = plt.subplots(2, 1, figsize=(8, 6))
axes[0].stem(range(len(h)), np.abs(h), linefmt='b-', markerfmt='bo')
axes[0].set_title('Resposta ao impulso do canal')
axes[0].set_xlabel('amostra'); axes[0].set_ylabel('|h|')
axes[1].stem(range(len(w_zf)), np.abs(w_zf), linefmt='r-', markerfmt='ro')
axes[1].set_title('Coeficientes do equalizador ZF')
axes[1].set_xlabel('amostra'); axes[1].set_ylabel('|w|')
plt.tight_layout(); plt.show()
```

## Limitações do Zero-Forcing: Amplificação de Ruído

### DEDUÇÃO do SNR de saída no ZF

Considere o equalizador ZF $\mathbf{w}_{\text{ZF}} = \mathbf{H}^{-1}\mathbf{e}_d$. O sinal de saída é:

$$
y[n] = x[n-d] + \underbrace{\sum_{k \neq d} c[k]\,x[n-k]}_{\text{ISI residual (zero em ZF)}} + \underbrace{\sum_{k=0}^{N-1} w_k\,w[n-k]}_{\text{ruído amplificado}}.
$$

Em ZF, o ISI é zero por projeto. O problema é o **ruído amplificado**.

### Potência do ruído na saída

A potência do ruído na saída do equalizador é:

$$
\sigma_{n,\text{out}}^2 = \mathbb{E}\left[\left|\sum_{k=0}^{N-1} w_k\,w[n-k]\right|^2\right].
$$

Para ruído branco $\mathbb{E}[w[n]w^*[m]] = \sigma_w^2\delta[n-m]$:

$$
\boxed{\sigma_{n,\text{out}}^2 = \sigma_w^2\sum_{k=0}^{N-1}|w_k|^2 = \sigma_w^2\|\mathbf{w}\|^2}.
$$

**Interpretação**: O equalizador ZF amplifica o ruído proporcional à norma dos seus coeficientes. Se o canal tem zeros ou atenuação forte em certas frequências, os coeficientes do ZF devem ser **grandes** nessas bandas para "ganhar" a atenuação, e isso amplifica muito o ruído.

### DEDUÇÃO no domínio da frequência

Para não misturar o filtro casado com a coloração do ruído, considere diretamente $R(\omega)=H(\omega)X(\omega)+N(\omega)$. O ZF ideal é:

$$
W_{\text{ZF}}(e^{j\omega})=\frac{e^{-j\omega d}}{H(e^{j\omega})}.
$$

Depois da inversão, a componente de sinal tem PSD $S_X$, enquanto o ruído tem PSD $S_N/|H|^2$. Logo:

$$
\boxed{\mathrm{SNR}_{out}(\omega)=\frac{S_X(\omega)|H(\omega)|^2}{S_N(\omega)}.}
$$

O ZF não melhora a SNR de cada frequência: a inversão escala sinal e ruído igualmente. O problema aparece ao restaurar uma resposta plana, pois as frequências muito atenuadas recebem enorme potência de ruído e dominam a variância total.

**Exemplo extremo**: Se o canal tem um **nulo espectral** em $\omega_0$, i.e., $H_c(e^{j\omega_0}) = 0$, o ZF tem ganho infinito nessa frequência. Teoricamente, a equalização completa é impossível — não há informação naquela frequência para recuperar.

### Trade-off fundamental

**Resultado do trade-off**: o ZF força ou aproxima a condição de ISI nula sem penalizar a norma dos coeficientes; por isso **pode produzir grande amplificação de ruído** nas bandas atenuadas. O MMSE encontra um compromisso entre ISI e ruído.

**Importante**: A escolha entre ZF e MMSE não é apenas teórica — em sistemas reais com canal mal condicionado (múltiplos percursos com cancelamento construtivo/destrutivo), o ZF pode ser **pior** que nenhuma equalização.

## Equalizadores MMSE — Dedução Completa

### Critério MMSE: minimização do erro quadrático

**Definição**: O equalizador MMSE (Minimum Mean Square Error) é aquele que minimiza o erro quadrático médio entre a saída do equalizador e o símbolo desejado:

$$
\boxed{\mathbf{w}_{\text{MMSE}} = \arg\min_{\mathbf{w}}\,\mathbb{E}\bigl[|d[n] - \mathbf{w}^H\mathbf{x}_n|^2\bigr]},
$$

onde $d[n]$ é o símbolo desejado (pode ser $x[n-d]$ durante treinamento) e $\mathbf{x}_n = [x[n], x[n-1], \ldots, x[n-N+1]]^T$ é o vetor de entrada.


### Equações de Wiener — dedução completa

Expandindo o erro quadrático:

$$
J(\mathbf{w}) = \mathbb{E}\bigl[|d[n] - \mathbf{w}^H\mathbf{x}_n|^2\bigr] = \mathbb{E}\bigl[(d[n] - \mathbf{w}^H\mathbf{x}_n)(d^*[n] - \mathbf{x}_n^H\mathbf{w})\bigr].
$$

Expandindo o produto:

$$
J(\mathbf{w}) = \mathbb{E}[|d[n]|^2] - \mathbb{E}[d[n]\mathbf{x}_n^H\mathbf{w}] - \mathbb{E}[\mathbf{w}^H\mathbf{x}_n d^*[n]] + \mathbb{E}[\mathbf{w}^H\mathbf{x}_n\mathbf{x}_n^H\mathbf{w}].
$$

Simplificando (usando $\mathbb{E}[\mathbf{w}^H\mathbf{x}_n d^*[n]] = \mathbf{w}^H\mathbb{E}[\mathbf{x}_n d^*[n]] = \mathbf{w}^H\mathbf{p}$):

$$
J(\mathbf{w}) = \sigma_d^2 - \mathbf{p}^H\mathbf{w} - \mathbf{w}^H\mathbf{p} + \mathbf{w}^H\mathbf{R}_x\mathbf{w},
$$

onde $\mathbf{R}_x = \mathbb{E}[\mathbf{x}_n\mathbf{x}_n^H]$ e $\mathbf{p} = \mathbb{E}[\mathbf{x}_n d^*[n]]$.

Para minimizar, derivamos em relação a $\mathbf{w}^*$ (derivada complexa de Wirtinger):

$$
\frac{\partial J}{\partial \mathbf{w}^*} = -\mathbf{p} + \mathbf{R}_x\mathbf{w} = \mathbf{0}.
$$

**Equações de Wiener**:

$$
\boxed{\mathbf{R}_x\,\mathbf{w}_{\text{opt}} = \mathbf{p}}.
$$

### Solução de Wiener

**Teorema da solução de Wiener**: O vetor de coeficientes ótimos é:

$$
\boxed{\mathbf{w}_{\text{MMSE}} = \mathbf{R}_x^{-1}\mathbf{p}}.
$$

**Erro mínimo**: Substituindo $\mathbf{w}_{\text{MMSE}}$ de volta em $J(\mathbf{w})$:

$$
\boxed{e_{\min} = \sigma_d^2 - \mathbf{p}^H\mathbf{R}_x^{-1}\mathbf{p}}.
$$

Esta é a menor potência de erro quadrático médio alcançável. Note que $e_{\min} \geq 0$ (por definição de erro quadrático).

### Forma alternativa e relação com ZF

Para um canal conhecido, símbolos brancos de variância $\sigma_s^2$, matriz de convolução $\mathbf H$ e ruído branco de variância $\sigma_n^2$,

$$\mathbf R_r=\sigma_s^2\mathbf H^H\mathbf H+\sigma_n^2\mathbf I,\qquad
\mathbf p=\sigma_s^2\mathbf H^H\mathbf e_d.$$

Substituindo esses termos na solução de Wiener:

$$\boxed{\mathbf w_{\rm MMSE}=
\left(\mathbf H^H\mathbf H+\frac{\sigma_n^2}{\sigma_s^2}\mathbf I\right)^{-1}
\mathbf H^H\mathbf e_d.}$$

Esta é a forma Tikhonov. Na expressão geral $\mathbf w=\mathbf R_r^{-1}\mathbf p$, o ruído **já está incluído** em $\mathbf R_r$; adicionar outro $\alpha\mathbf I$ contaria a regularização duas vezes.

### Comparação ZF vs MMSE

**Teorema de separação**: O equalizador MMSE pode ser visto como o equalizador ZF com regularização por ruído:

$$
\mathbf w_{\rm MMSE}=
\left(\mathbf H^H\mathbf H+\frac{\sigma_n^2}{\sigma_s^2}\mathbf I\right)^{-1}
\mathbf H^H\mathbf e_d.
$$

Quando $\sigma_w^2 \to 0$ (SNR $\to \infty$): $\mathbf{w}_{\text{MMSE}} \to \mathbf{w}_{\text{ZF}}$.
Quando $\sigma_w^2 \to \infty$ (SNR $\to 0$): $\mathbf{w}_{\text{MMSE}} \to \mathbf{0}$ (melhor não equalizar do que amplificar ruído).

**Resultado comparativo**:

| Métrica | ZF | MMSE |
|---------|-----|------|
| ISI | 0 | Residual (controlado) |
| Ruído amplificado | Máximo | Minimizado |
| Critério otimizado | Não otimiza MSE/SNR; força zero de ISI no modelo | Minimiza MSE entre saída e símbolo desejado no modelo adotado |
| Complexidade | $O(N^3)$ | $O(N^3)$ |
| Conhecimento do canal | Necessário | Necessário |

### Exercício em Python: ZF vs MMSE — BER vs SNR

```python
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(13)

def simulate_zf_mmse(eb_n0_dbs, h, N_eq, n_sym=50000):
    """Simula equalizadores ZF e MMSE e retorna BER."""
    k = 2  # QPSK: dois bits por símbolo
    EbN0 = 10**(np.array(eb_n0_dbs)/10)
    results = {}

    for lbl, gamma_factor in [('ZF', 1.0), ('MMSE', 1.0)]:
        berrs = []
        for db, eb_n0 in zip(eb_n0_dbs, EbN0):
            # Simbolos QPSK
            bits = rng.integers(0, 2, (n_sym, k))
            x = (2*bits[:, 0]-1) + 1j*(2*bits[:, 1]-1)

            # Canal + ruido
            y = np.convolve(x, h, mode='full')
            sigma = np.sqrt(1/(2*k*eb_n0))
            y += sigma*(rng.standard_normal(len(y)) + 1j*rng.standard_normal(len(y)))

            # Equalizacao
            y_eq = np.convolve(y, np.ones(N_eq), mode='valid') / N_eq

            # Decision QPSK
            ybits = np.column_stack([(y_eq.real >= 0).astype(int),
                                     (y_eq.imag >= 0).astype(int)])
            delay = len(h) - 1
            reference = bits[delay:delay + len(ybits)]
            ber = np.mean(ybits[:len(reference)] != reference)
            berrs.append(ber)
        results[lbl] = np.array(berrs)

    return results

h = np.array([0.3, 1.0, 0.45, 0.2, 0.1])
eb = np.arange(2, 18, 1)
res = simulate_zf_mmse(eb, h, N_eq=9, n_sym=30000)

plt.figure(figsize=(8, 5))
for lbl, ber in res.items():
    plt.semilogy(eb, ber, '-o', label=f'{lbl} (equalizador transversal)')
plt.axhline(1e-4, color='gray', linestyle='--', lw=0.8, label='BER = 1e-4')
plt.xlabel('$E_b/N_0$ (dB)'); plt.ylabel('BER')
plt.ylim(1e-5, 1); plt.grid(True, which='both'); plt.legend()
plt.title('ZF vs MMSE: BER vs SNR para canal dispersivo')
plt.tight_layout(); plt.show()
```

## Equalização por Detecção de Sequência

### Detecção ML de sequência

**Definição**: O detector de máxima verossimilhança de sequência (MLSE — Maximum Likelihood Sequence Estimator) não decide símbolo por símbolo, mas busca a **sequência completa** de símbolos que maximiza a probabilidade condicional $P(\mathbf{r}|\mathbf{a})$, onde $\mathbf{a} = [a_0, a_1, \ldots, a_{K-1}]$ é a sequência transmitida.

**Dedução do critério ML**: O ruído é gaussiano, então:

$$
p(\mathbf{r}|\mathbf{a}) \propto \exp\!\left(-\frac{1}{\sigma_n^2}\sum_{n}|r[n] - \sum_{\ell=0}^{L-1} a[n-\ell]h[\ell]|^2\right).
$$

Maximizar esta probabilidade equivale a minimizar:

$$
\boxed{J(\mathbf{a}) = \sum_{n=0}^{K+L-2}\left|r[n] - \sum_{\ell=0}^{L-1} a[n-\ell]h[\ell]\right|^2}.
$$

### Algoritmo de Viterbi para equalização

O algoritmo de Viterbi resolve o problema de busca ML de forma eficiente, explorando a estrutura de trellis do canal.

**Estados do trellis**: Cada estado representa uma combinação dos últimos $L-1$ símbolos transmitidos. Para $M$-ary e memória $L-1$:

$$
\boxed{\text{Número de estados} = M^{L-1}}.
$$

**Transições**: De cada estado, há $M$ transições (uma para cada símbolo possível no instante atual).

**Métrica de caminho**: A métrica de Viterbi é a soma dos erros quadráticos acumulados:

$$
\gamma_n(s_i, s_j) = \bigl|r[n] - \hat{r}_n(s_i, s_j)\bigr|^2,
$$

onde $\hat{r}_n(s_i, s_j)$ é o sinal recebido esperado na transição do estado $s_i$ para $s_j$.

**Complexidade**:

$$
\boxed{\mathcal{O}\bigl(M^{L-1} \cdot K \cdot M\bigr) = \mathcal{O}\bigl(M^L \cdot K\bigr)},
$$

onde $K$ é o número de símbolos e $M^L$ é o número de transições totais por etapa.

**Importante**: Para canais longos ($L$ grande) ou constelações de alta ordem ($M$ grande), a complexidade é proibitiva. Por exemplo, $M=256$ e $L=8$ implicam $256^7 \approx 2\times10^{17}$ estados — impossível.

### Trade-offs da detecção de sequência

| Fator | Impacto |
|-------|---------|
| $L$ (memória do canal) | Complexidade exponencial: $M^{L-1}$ estados |
| $M$ (ordem da constelação) | Complexidade exponencial: $M^{L-1}$ estados |
| Performance | Próxima do limite teórico de ML |
| Latência | Atraso de decisão $\approx$ comprimento do trellis |

**Conclusão prática**: MLSE é viável apenas para canais curtos ($L \leq 5$) e constelações pequenas ($M \leq 4$). Para canais longos, usam-se equalizadores lineares (MMSE) ou DFE.

## Equalização Adaptativa: LMS, RLS e CMA

### Por que equalização adaptativa?

Quando o canal é **desconhecido** ou **variante no tempo**, os coeficientes do equalizador não podem ser calculados offline. A equalização adaptativa atualiza os coeficientes em tempo real, usando dados recebidos.

**Modos de operação**:

1. **Treinamento**: Usa uma sequência conhecida de treinamento (pilot sequence). O símbolo desejado é o símbolo de treinamento.
2. **Decision-directed**: Após a convergência, o símbolo desejado é a **decisão** do equalizador. Mais eficiente em overhead, mas propenso a propagação de erros.

### Algoritmo LMS (Least Mean Squares)

**Dedução do algoritmo LMS**: A partir do critério MMSE, derivamos a atualização do gradiente estocástico. O erro instantâneo é $e[n] = d[n] - \mathbf{w}^H[n]\mathbf{x}_n$. A atualização:

$$
\boxed{\mathbf{w}[n+1] = \mathbf{w}[n] + \mu\,e^*[n]\,\mathbf{x}[n]},
$$

onde $\mu$ é o passo de adaptação (step-size).

**Análise de convergência LMS**: Tomando o valor esperado da atualização:

$$
\mathbb{E}[\mathbf{w}[n+1]] = \mathbb{E}[\mathbf{w}[n]] + \mu\bigl(\mathbf{p} - \mathbf{R}_x\mathbb{E}[\mathbf{w}[n]]\bigr).
$$

Definindo o erro de peso $\tilde{\mathbf{w}}[n] = \mathbf{w}_{\text{opt}} - \mathbb{E}[\mathbf{w}[n]]$:

$$
\tilde{\mathbf{w}}[n+1] = (\mathbf{I} - \mu\mathbf{R}_x)\tilde{\mathbf{w}}[n].
$$

Para convergência em média no modelo idealizado, todos os autovalores de $(\mathbf{I}-\mu\mathbf R_x)$ devem ter módulo menor que 1:

$$
\boxed{0 < \mu < \frac{2}{\lambda_{\max}(\mathbf{R}_x)}},
$$

onde $\lambda_{\max}$ é o maior autovalor da matriz de autocorrelação.

**Constante de tempo de convergência**:

$$
\boxed{\tau_k \approx \frac{1}{\mu\lambda_k}},
$$

onde a aproximação vale para $\mu\lambda_k\ll1$. A razão $\kappa=\lambda_{\max}/\lambda_{\min}$ determina a dispersão das velocidades. Limites de convergência em média quadrática são mais restritivos e dependem das estatísticas de ordem superior; o limite acima não garante baixo *misadjustment*.

### NLMS (Normalized LMS)

O NLMS normaliza o passo pelo poder de entrada:

$$
\boxed{\mathbf{w}[n+1] = \mathbf{w}[n] + \frac{\mu}{\epsilon + \|\mathbf{x}[n]\|^2}\,e^*[n]\,\mathbf{x}[n]},
$$

onde $\epsilon$ é uma constante pequena para evitar divisão por zero. O NLMS é mais robusto a variações de potência de entrada.

### Algoritmo RLS (Recursive Least Squares)

**Definição**: O RLS minimiza a soma ponderada dos erros quadráticos com fator de esquecimento $\lambda \in (0, 1]$:

$$
J_{\text{RLS}}[n] = \sum_{k=0}^{n} \lambda^{n-k}\,|e[k]|^2.
$$

**Atualização recursiva**:

$$
\boxed{
\begin{aligned}
\mathbf{P}[n] &= \frac{1}{\lambda}\Bigl(\mathbf{P}[n-1] - \frac{\mathbf{P}[n-1]\mathbf{x}[n]\mathbf{x}^H[n]\mathbf{P}[n-1]}{\lambda + \mathbf{x}^H[n]\mathbf{P}[n-1]\mathbf{x}[n]}\Bigr) \\
\mathbf{w}[n] &= \mathbf{w}[n-1] + \mathbf{P}[n]\mathbf{x}[n]e^*[n]
\end{aligned}
}
$$

onde $\mathbf{P}[n] = \bigl(\sum_{k=0}^n \lambda^{n-k}\mathbf{x}[k]\mathbf{x}^H[k]\bigr)^{-1}$ é a matriz de inversa de autocorrelação.

**Complexidade**: $\mathcal{O}(N^2)$ por atualização vs. LMS $\mathcal{O}(N)$. Convergência muito mais rápida, especialmente para canais mal condicionados.

### CMA (Constant Modulus Algorithm)

**Definição**: O CMA é um equalizador adaptativo sem sequência de treinamento, que explora a constância de módulo da constelação:

$$
\boxed{\mathbf{w}[n+1] = \mathbf{w}[n] + \mu\bigl(R - |y[n]|^2\bigr)y^*[n]\,\mathbf{x}[n]},
$$

com $y[n] = \mathbf{w}^H[n]\mathbf{x}[n]$ e $R = \mathbb{E}[|x_k|^4]/\mathbb{E}[|x_k|^2]$.

**Propriedades**:

- Não requer sequência de treinamento.
- Convergência mais lenta que LMS.
- Não corrige rotação de fase (ambiguidade de fase).
- Adequado para PSK e QPSK (amplitude constante).
- Menos adequado para QAM de ordem alta (amplitudes variadas).

### Exercício em Python: tracking de canal com LMS

```python
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(2026)

# Canal variante no tempo (modelo Jakes simplificado)
L_chan = 3; L_eq = 9; mu = 0.01; N = 20000
d = L_eq // 2

h_true = np.array([0.5, 1.0, 0.3])
h_eq_est = np.zeros(L_eq)
w_lms = np.zeros(L_eq, dtype=complex)
mse_hist = []
ber_hist = []

k = 4  # QPSK
n_sym = N // 4
bits = rng.integers(0, 2, (n_sym, k))
gray = bits.copy()
for b in range(1, k): gray[:, b] ^= gray[:, b-1]
m = k//2
w = 2**np.arange(m-1, -1, -1)
sI = (gray[:,:m] @ w).astype(int)
sQ = (gray[:,m:] @ w).astype(int)
xs = (2*sI - (2**(m)-1)) + 1j*(2*sQ - (2**(m)-1))

eb_n0_db = 15; eb_n0 = 10**(eb_n0_db/10)
sigma = np.sqrt(1/(2*k*eb_n0))

mse_arr = []
for n in range(L_eq-1, N):
    # Variacao lenta do canal
    phase = 0.1 * np.random.randn()
    h_var = h_true * np.exp(1j*phase)
    # Transmitir
    x_pad = np.concatenate([np.zeros(L_chan-1), xs])
    clean_rx = np.convolve(x_pad, h_var)
    rx = clean_rx + sigma*(rng.standard_normal(len(clean_rx)) + 1j*rng.standard_normal(len(clean_rx)))
    # Extrair vetor de entrada
    u = rx[n-L_eq+1:n+1]
    if len(u) != L_eq:
        continue
    # Filtrar
    y = w_lms @ u
    # Erro
    d_sym = xs[n - L_eq + 1 + d]  # simbolo desejado (decision-directed)
    e = d_sym - y
    # Atualizar
    w_lms += mu * np.conj(u) * e
    mse_arr.append(np.real(e*np.conj(e)))

# Plotar MSE e convergencia
fig, axes = plt.subplots(2, 1, figsize=(10, 7))
axes[0].semilogy(np.convolve(mse_arr, np.ones(200)/200, mode='valid'), '#1e3a5f')
axes[0].set_title(f'Convergencia LMS: MSE medio movil (N={L_eq}, mu={mu})')
axes[0].set_xlabel('amostra'); axes[0].set_ylabel('MSE')
axes[0].grid(alpha=0.3)
# Comparar equalizador estimado com canal inverso
w_final = w_lms
c_est = np.convolve(h_true, w_final)[:L_chan+L_eq-1]
axes[1].stem(range(len(c_est)), np.abs(c_est), linefmt='b-', markerfmt='bo')
axes[1].axvline(d, color='r', linestyle='--', label=f'd = {d}')
axes[1].set_title('Resposta conjunta canal x equalizador')
axes[1].set_xlabel('amostra'); axes[1].set_ylabel('|c[n]|')
axes[1].legend(); axes[1].grid(alpha=0.3)
plt.tight_layout(); plt.show()
```

## Equalização em Sistemas Práticos

<!-- slides: columns -->

### GSM

Em GSM, a sequência de treinamento no meio do burst permite estimar o canal. Receptores clássicos usam detecção de sequência por Viterbi/MLSE ou variantes de complexidade reduzida; não existe uma regra geral de “equalizador MMSE de 15 taps”. O exemplo ilustra por que treinamento conhecido é necessário antes da detecção dos dados.

<!-- slides: column -->

### Wi-Fi (802.11 a/g/n/ac/ax)

Em OFDM (802.11), cada subportadora experimenta canal plano. A equalização é por **um tap**:

$$
W[k] = \frac{1}{H[k]} \quad \text{(ZF)} \qquad \text{ou} \qquad W[k] = \frac{H^*[k]}{|H[k]|^2 + N_0/E_s} \quad \text{(MMSE)}.
$$

Esta é a grande vantagem do OFDM: transforma equalização de $N$ taps em $N_{\text{sub}}$ equalizadores de 1 tap.


<!-- slides: end-columns -->
### 4G LTE / 5G NR

LTE usa OFDM no downlink (DFT-s-OFDM no uplink). Equalização de 1 tap por subportadora no downlink. No uplink DFT-s-OFDM (SC-FDMA), usa-se equalizador ZF/MMSE de 1 tap por subportadora (menos PAPR que OFDM puro).

5G NR estende para mais subportadoras (até 273 MHz de banda), mas o princípio é o mesmo: equalização no domínio da frequência.

### DSL (Digital Subscriber Line)

DSL usa DMT (Discrete Multitone): o espectro é dividido em ~256 bandas de 4,3125 kHz. Cada banda tem equalizador de 1 tap. A ordem QAM é adaptativa por banda: banda com bom SNR usa 256-QAM, banda com ruim SNR usa QPSK.

### Teorema da equalização OFDM

**Teorema**: Com prefixo cíclico de comprimento $L_{\text{CP}} \geq L_{\text{canal}} - 1$, a convolução linear do canal se transforma em convolução circular no bloco de DFT. A DFT diagonaliza a matriz de convolução circular:

$$
\boxed{Y[k] = H[k]\,X[k] + V[k],\qquad k = 0, 1, \ldots, N_{\text{FFT}}-1},
$$

onde $H[k]$ é a resposta do canal na subportadora $k$. A equalização torna-se um ganho complexo escalar por subportadora — complexidade $O(1)$ por subportadora, em contraste com $O(N)$ do equalizador temporal.

**Custo**: Overhead do prefixo cíclico (tipicamente 1/4 do símbolo) e perda de eficiência espectral.

## Exercícios resolvidos em Python

### Protocolo computacional

**Objetivo:** comparar ZF, MMSE e LMS sob o mesmo canal e ruído. **Controle experimental:** reutilize símbolos e realizações de canal ao comparar métodos. **Validação:** reporte resposta conjunta, MSE, ganho de ruído, abertura do olho e BER antes/depois; descarte o transiente adaptativo declarado.

### Exercício 1: Equalizador ZF para canal de 3 caminhos

Projete um equalizador ZF para o canal $h = [0{,}3,\; 1{,}0,\; 0{,}45]$ com 5 taps e verifique o ISI residual.

```python
import numpy as np
import matplotlib.pyplot as plt

h = np.array([0.3, 1.0, 0.45])
N = 5; d = N // 2

# Matriz Toeplitz do canal
H = np.zeros((N, N))
for i in range(N):
    for j in range(N):
        lag = i - j
        if 0 <= lag < len(h):
            H[i, j] = h[lag]

# ZF: w tal que Hw = e_d
desired = np.zeros(N); desired[d] = 1.0
w_zf = np.linalg.solve(H, desired)
print(f'Coeficientes ZF: {np.round(w_zf, 4)}')

# Resposta conjunta
c = np.convolve(h, w_zf)[:N+2]
print(f'Resposta conjunta: {np.round(c, 4)}')
print(f'ISI residual (fora d): {np.round(np.max(np.abs(np.delete(c, d))), 6)}')

fig, ax = plt.subplots(figsize=(8, 4))
ax.stem(range(len(c)), np.abs(c), linefmt='b-', markerfmt='bo')
ax.axvline(d, color='r', linestyle='--', label=f'd={d} (simbolo desejado)')
ax.set_title('Resposta conjunta canal + equalizador ZF')
ax.set_xlabel('amostra'); ax.set_ylabel('|c[n]|'); ax.legend(); ax.grid(alpha=0.3)
plt.tight_layout(); plt.show()
```

### Exercício 2: Comparação ZF vs MMSE — BER vs SNR

Compare o BER de equalizadores ZF e MMSE em um canal com deep fading.

```python
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(42)

def run_equalization_compare(eb_n0_dbs, h, N_eq=9, n_sym=20000):
    results = {'ZF': [], 'MMSE': []}
    for db in eb_n0_dbs:
        EbN0 = 10**(db/10); k = 4; sigma = np.sqrt(1/(2*k*EbN0))
        bits = rng.integers(0, 2, (n_sym, k))
        gray = bits.copy()
        for b in range(1, k): gray[:,b] ^= gray[:,b-1]
        m = k//2; weights = 2**np.arange(m-1,-1,-1)
        xi = gray[:,:m] @ weights; xq = gray[:,m:] @ weights
        xs = (2*xi-(2**m-1)) + 1j*(2*xq-(2**m-1))
        rx = np.convolve(xs, h, 'full') + sigma*(rng.standard_normal(len(xs)+len(h)-1)+1j*rng.standard_normal(len(xs)+len(h)-1))

        for eq_type in ['ZF', 'MMSE']:
            if eq_type == 'ZF':
                # ZF: matriz de autocorrelacao do canal
                R = np.zeros((N_eq, N_eq))
                for i in range(N_eq):
                    for j in range(N_eq):
                        R[i,j] = sum(h[t]*h[t-abs(i-j)] for t in range(abs(i-j), len(h)))
                p = np.array([h[d-i] if 0 <= d-i < len(h) else 0.0 for i in range(N_eq)])
                w = np.linalg.solve(R, p)
            else:
                # MMSE: R + noise regularization
                sigma2 = sigma**2 * 2  # ruido complexo
                R = np.zeros((N_eq, N_eq))
                for i in range(N_eq):
                    for j in range(N_eq):
                        R[i,j] = sum(h[t]*h[t-abs(i-j)] for t in range(abs(i-j), len(h)))
                p = np.array([h[d-i] if 0 <= d-i < len(h) else 0.0 for i in range(N_eq)])
                w = np.linalg.solve(R + sigma2*np.eye(N_eq), p)

            y_eq = np.convolve(rx, w, 'full')
            y_dec = np.sign(y_eq.real) + 1j*np.sign(y_eq.imag)
            yh = np.column_stack([(y_dec.real > 0).astype(int),
                                  (y_dec.imag > 0).astype(int)])
            reference = bits[:len(yh), :2]
            results[eq_type].append(np.mean(yh[:len(reference)] != reference))

    return np.array(results['ZF']), np.array(results['MMSE'])

h = np.array([1.0, -0.95, 0.3])  # canal com nulo espectral
eb = np.arange(4, 22, 2)
ber_zf, ber_mmse = run_equalization_compare(eb, h)

plt.figure(figsize=(8,5))
plt.semilogy(eb, ber_zf, 'o-', label='Zero-Forcing')
plt.semilogy(eb, ber_mmse, 's-', label='MMSE')
plt.axhline(1e-4, color='gray', ls='--', lw=0.8, label='BER = 1e-4')
plt.xlabel('$E_b/N_0$ (dB)'); plt.ylabel('BER')
plt.ylim(1e-5, 1); plt.grid(True, which='both'); plt.legend()
plt.title('ZF vs MMSE: canal com nulo espectral (h=[1,-0.95,0.3])')
plt.tight_layout(); plt.show()
```

### Exercício 3: Algoritmo LMS adaptativo — tracking de canal

Simule o tracking de canal variante no tempo usando LMS.

```python
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(7)
L_chan, L_eq, mu, N = 4, 11, 0.005, 15000
d = L_eq // 2; k = 4; EbN0 = 15; sigma = np.sqrt(1/(2*k*10**(EbN0/10)))

h_true = np.array([0.4, 1.0, -0.3, 0.2])
w_lms = np.zeros(L_eq, dtype=complex)
mse_track = []
err_angle = []

bits = rng.integers(0, 2, (N//1, k))
gray = bits.copy()
for b in range(1, k): gray[:,b] ^= gray[:,b-1]
m = k//2; wts = 2**np.arange(m-1,-1,-1)
xi = (gray[:,:m] @ wts).astype(int); xq = (gray[:,m:] @ wts).astype(int)
xs = (2*xi-(2**m-1)) + 1j*(2*xq-(2**m-1))

mse_vals = []
for n in range(L_eq-1, N):
    phase = 0.05*np.random.randn()
    h_v = h_true * np.exp(1j*phase)
    rx = np.convolve(np.concatenate([np.zeros(L_chan-1), xs]), h_v, 'valid')
    rx += sigma*(rng.standard_normal(len(rx)) + 1j*rng.standard_normal(len(rx)))
    u = rx[n-L_eq+1:n+1]; d_sym = xs[n-L_eq+1+d]
    y = w_lms @ u; e = d_sym - y
    w_lms += mu * np.conj(u) * e
    mse_vals.append(np.real(e*np.conj(e)))
    err_angle.append(np.mean(np.angle(w_lms[:len(h_v)]) - np.angle(h_v)))

fig, axes = plt.subplots(2, 1, figsize=(10, 7))
axes[0].semilogy(np.convolve(mse_vals, np.ones(100)/100, mode='valid'), '#0f4c75')
axes[0].set_title('Convergencia LMS: MSE em canal variante (mu=0.005)')
axes[0].set_xlabel('amostra'); axes[0].set_ylabel('MSE'); axes[0].grid(alpha=0.3)
axes[1].plot(err_angle)
axes[1].set_title('Fase do canal vs estimativa'); axes[1].set_xlabel('amostra'); axes[1].set_ylabel('fase (rad)')
plt.tight_layout(); plt.show()
```

### Exercício 4: Diagrama de olho antes e após equalização

Visualize o diagrama de olho do sinal recebido sem equalização e com equalizador MMSE.

```python
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import LogNorm

rng = np.random.default_rng(13)

h = np.array([0.3, 1.0, 0.45, 0.2])
N_eq = 11; d = N_eq // 2; N = 50000; k = 4; EbN0 = 18
sigma = np.sqrt(1/(2*k*10**(EbN0/10)))

bits = rng.integers(0, 2, (N//2, k))
gray = bits.copy()
for b in range(1, k): gray[:,b] ^= gray[:,b-1]
m = k//2; wts = 2**np.arange(m-1,-1,-1)
xi = (gray[:,:m]@wts).astype(int); xq = (gray[:,m:]@wts).astype(int)
xs = (2*xi-(2**m-1)) + 1j*(2*xq-(2**m-1))

rx = np.convolve(xs, h, 'full') + sigma*(rng.standard_normal(len(xs)+len(h)-1)+1j*rng.standard_normal(len(xs)+len(h)-1))

# MMSE
R = np.zeros((N_eq, N_eq))
for i in range(N_eq):
    for j in range(N_eq):
        R[i,j] = sum(h[t]*h[t-abs(i-j)] for t in range(abs(i-j), len(h)))
p = np.array([h[d-i] if 0 <= d-i < len(h) else 0.0 for i in range(N_eq)])
w_mmse = np.linalg.solve(R + sigma**2*2*np.eye(N_eq), p)
rx_eq = np.convolve(rx, w_mmse, 'full')

fig, axes = plt.subplots(1, 2, figsize=(14, 5))
# Sem equalizacao
xs_slice = rx[N_eq-1:N_eq-1+N*2]
for n in range(0, N, 100):
    segment = xs_slice[n:n+2*N_eq]
    if len(segment) == 2*N_eq:
        axes[0].plot(np.linspace(0, 2, len(segment)), segment.real, 'b', alpha=0.03)
axes[0].axvline(1, color='r', lw=1.5, alpha=0.7); axes[0].axhline(0, color='gray', lw=0.5)
axes[0].set_title('Diagrama de olho: SEM equalizacao')
axes[0].set_xlabel('tempo (simbolos)'); axes[0].set_ylabel('amplitude')
# Com equalizacao
xs_eq = rx_eq[N_eq-1:N_eq-1+N*2]
for n in range(0, N, 100):
    segment = xs_eq[n:n+2*N_eq]
    if len(segment) == 2*N_eq:
        axes[1].plot(np.linspace(0, 2, len(segment)), segment.real, 'g', alpha=0.03)
axes[1].axvline(1, color='r', lw=1.5, alpha=0.7); axes[1].axhline(0, color='gray', lw=0.5)
axes[1].set_title('Diagrama de olho: com MMSE')
axes[1].set_xlabel('tempo (simbolos)'); axes[1].set_ylabel('amplitude')
plt.tight_layout(); plt.show()
```

## Lista de Exercícios Propostos

**E1** (Origem da ISI). Um canal tem resposta ao impulso $h = [0{,}2, 1{,}0, 0{,}3, 0{,}1]$. Qual é o comprimento da ISI em símbolos? Calcule a interferência que o símbolo $x[n]$ causa nos símbolos $x[n+1]$, $x[n+2]$ e $x[n+3]$ (em termos de amplitude relativa).

**E2** (Dedução ZF). Para o canal $h=[0{,}5,1{,}0,0{,}3]$, construa a matriz de convolução $\mathbf H$ para um equalizador FIR de $N=5$ taps. Para cada atraso admissível, resolva $\min_{\mathbf w}\|\mathbf H\mathbf w-\mathbf e_d\|^2$ e identifique o menor ISI residual. Explique por que um FIR finito não garante ISI exatamente nula.

**E3** (Limitações do ZF). Para o canal $H(e^{j\omega}) = 1 - 0{,}9e^{-j\omega}$, trace o magnitude no domínio da frequência e explique onde o ZF amplifica mais ruído. Calcule o ganho do ZF nas frequências $\omega = 0$ e $\omega = \pi$.

**E4** (MMSE vs ZF). Para o mesmo canal do E3, com $N_0/E_s = 0{,}1$ e $0{,}5$, calcule e compare os equalizadores MMSE e ZF de 3 taps. Qual produz menor erro quadrático médio?

**E5** (Convergência LMS). Derive a condição de convergência $0 < \mu < 2/\lambda_{\max}$ a partir da análise do erro de peso $\tilde{\mathbf{w}}[n]$. Explique por que a razão $\kappa = \lambda_{\max}/\lambda_{\min}$ afeta a velocidade de convergência.

**E6** (RLS vs LMS). Compare a complexidade computacional (operações por amostra) do LMS e RLS para equalizadores de $N=11$ taps. Quantas multiplicações cada um requer por atualização?

**E7** (MLSE — complexidade). Para um canal com memória $L=5$ e constelação 16-QAM, qual é o número de estados do trellis de Viterbi? Qual seria o número para BPSK ($M=2$)?

**E8** (Teorema OFDM). Prove que, com prefixo cíclico de comprimento $L_{\text{CP}} \geq L-1$, a matriz de convolução do canal é circular e diagonalizada pela DFT. Dê a demonstração passo a passo.

**E9** (DFE — decision feedback equalizer). Considere o DFE com filtros feedforward $\mathbf{f}$ e feedback $\mathbf{b}$. A saída é $z[n] = \mathbf{f}^H\mathbf{x}_n - \sum_{k=1}^{L_b} b_k\hat{x}[n-k]$. Explique por que o DFE evita o problema de amplificação de ruído do ZF.

**E10** (Equalização em DSL). Um sistema didático usa 256 bandas DMT espaçadas de aproximadamente 4,3 kHz e taxa de 4 ksymbols/s por banda. Suponha que 100 bandas usem 256-QAM, 80 usem 16-QAM e 76 usem QPSK. Calcule a taxa bruta ignorando overhead e tons de guarda.

## Gabarito

**E1.** ISI: $L=4$, então o símbolo $x[n]$ interfere em $n+1$ (0,2), $n+2$ (0,3) e $n+3$ (0,1). Além disso, $x[n]$ interfere em $n-1$ (0,5) se consideramos pré-cursores. O comprimento total da ISI é $L=4$ símbolos (do $-1$ ao $+3$ em relação ao instante de amostragem).

**E2.** $h = [0{,}5, 1{,}0, 0{,}3]$, $N=5$, $d=2$. Matriz Toeplitz:
$$
\mathbf{H} = \begin{pmatrix}
0{,}5 & 0 & 0 & 0 & 0 \\
1{,}0 & 0{,}5 & 0 & 0 & 0 \\
0{,}3 & 1{,}0 & 0{,}5 & 0 & 0 \\
0 & 0{,}3 & 1{,}0 & 0{,}5 & 0 \\
0 & 0 & 0{,}3 & 1{,}0 & 0{,}5
\end{pmatrix}.
$$
Construa $\mathbf H$ com $L+N-1=7$ linhas e 5 colunas. Para cada $d$, calcule $\mathbf w_d=\mathbf H^\dagger\mathbf e_d$ e o resíduo $\rho_d=\|\mathbf H\mathbf w_d-\mathbf e_d\|^2$. Escolha o $d$ de menor $\rho_d$. Em geral $\rho_d>0$, pois há sete condições e apenas cinco incógnitas; somente canais/casos especiais admitem solução exata.

**E3.** $H(\omega) = 1 - 0{,}9e^{-j\omega} = 1 - 0{,}9\cos\omega + j0{,}9\sin\omega$. $|H(\omega)|^2 = (1-0{,}9\cos\omega)^2 + (0{,}9\sin\omega)^2 = 1 - 1{,}8\cos\omega + 0{,}81$. Em $\omega = 0$: $|H| = |0{,}1| = 0{,}1$. Em $\omega = \pi$: $|H| = |1{,}9| = 1{,}9$. O ZF tem ganho $1/0{,}1 = 10$ em $\omega=0$ vs $1/1{,}9 \approx 0{,}53$ em $\omega=\pi$. Amplificação máxima no $\omega=0$ (fator 19x maior que em $\pi$).

**E4.** MMSE com $N_0/E_s = 0{,}1$: regularização fraca, aproxima-se do ZF. Com $N_0/E_s = 0{,}5$: regularização forte, coeficientes menores, mais ruído residual mas menos amplificação. O MMSE sempre produz menor MSE que ZF (por definição de otimização).

**E5.** Usando a convenção LMS $\mathbf w[n+1]=\mathbf w[n]+\mu\mathbf x[n]e^*[n]$, a dinâmica média é $\tilde{\mathbf w}[n+1]=(\mathbf I-\mu\mathbf R_x)\tilde{\mathbf w}[n]$. Cada modo converge se $|1-\mu\lambda_i|<1$, portanto $\boxed{0<\mu<2/\lambda_{\max}}$. Se o gradiente for definido com o fator 2, esse fator é absorvido em $\mu$ e o limite muda coerentemente. Modos associados a autovalores pequenos convergem mais devagar; por isso uma grande dispersão $\kappa=\lambda_{\max}/\lambda_{\min}$ torna a convergência desigual e lenta.

**E6.** Contando operações complexas de ordem dominante, o LMS requer cerca de $2N$ multiplicações por atualização (produto interno e atualização), ou 22 para $N=11$. O RLS requer várias operações matriz-vetor e uma atualização de posto um, isto é, ordem de $cN^2$, não apenas $N^2+2N$ de forma universal; a constante $c$ depende da implementação. Para $N=11$, são algumas centenas de multiplicações complexas, contra poucas dezenas no LMS.

**E7.** MLSE com $M=16$, $L=5$: $16^{4} = 65\,536$ estados. Com $M=2$ (BPSK): $2^{4} = 16$ estados. A diferença é absurda — Viterbi para QAM de ordem alta é impraticável para canais longos.

**E8.** Prefixo cíclico: copiamos os últimos $L_{\text{CP}}$ amostras do bloco e as colocamos no início. A recepção remove o CP. A convolução linear com atrasos $\leq L_{\text{CP}}-1$ se torna circular. A DFT diagonaliza matrizes circulares (teorema espectral para matrizes circulantes).

**E9.** O feedback subtrai réplicas dos pós-cursores usando símbolos já decididos e, quando essas decisões estão corretas, não filtra nem amplifica o ruído atual como faria uma inversa linear. Contudo, decisões anteriores foram afetadas por ruído; se uma estiver errada, o feedback injeta cancelamento incorreto e pode causar propagação de erros. O feedforward ainda precisa controlar pré-cursores e ruído.

**E10.** Bits por símbolo DMT: $100(8)+80(4)+76(2)=1272$. Com 4 ksymbols/s, $R_b=1272(4000)=\boxed{5{,}088\ \text{Mbit/s}}$ bruto.
