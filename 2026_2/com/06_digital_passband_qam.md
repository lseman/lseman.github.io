# Modulação QAM — Transmissão Digital em Banda Base

> Comunicações Digitais — Apostila de Curso
> Tópicos: Representação I/Q · Constelações QAM · Distância mínima · Energia normalizada · Probabilidade de erro · Detecção coerente · Erro de fase · Aplicações práticas

## Antes de começar

Ao final, você deve normalizar constelações QAM, relacionar $d_{\min}$ a BER e ordem de modulação, implementar decisão I/Q e quantificar erro de fase. **Diagnóstico:** aumentar $M$ eleva a eficiência espectral, mas o que acontece com $d_{\min}$ quando $E_s$ é fixo? **Evidência mínima:** validar numericamente a energia média e a BER de 16-, 64- e 256-QAM.

## Sumário

1. [Representação I/Q e a estrutura do sinal QAM](#representação-iq-e-a-estrutura-do-sinal-qam)
2. [Constelações QAM — Geometria Completa](#constelações-qam--geometria-completa)
3. [Probabilidade de Erro — Dedução Completa](#probabilidade-de-erro--dedução-completa)
4. [Detecção Coerente de QAM](#detecção-coerente-de-qam)
5. [Estimação de Canal e Sincronismo](#estimação-de-canal-e-sincronismo)
6. [QAM em Prática — Aplicações e Trade-offs](#qam-em-prática--aplicações-e-trade-offs)
7. [Exercícios resolvidos em Python](#exercícios-resolvidos-em-python)
8. [Lista de Exercícios Propostos](#lista-de-exercícios-propostos)
9. [Gabarito](#gabarito)

## Representação I/Q e a estrutura do sinal QAM

### Modulação em quadratura: a ideia central

Em modulações como BPSK e QPSK, apenas a **fase** da portadora é modulada. A Modulação por Codificação de Amplitude Quadrática (QAM) vai além: modula **simultaneamente** a amplitude e a fase. O insight fundamental é que duas portadoras ortogonais (seno e cosseno) podem transportar informações independentes.

Considere uma portadora de frequência $f_c$. Construimos duas portadoras ortogonais:

$$
c_I(t) = \cos(2\pi f_c t), \qquad c_Q(t) = -\sin(2\pi f_c t),
$$

que satisfazem $\displaystyle\int_0^{T_s} c_I(t)c_Q(t)\,dt = 0$ para qualquer intervalo inteiro de período $T_s$ da portadora. A ortogonalidade garante que as duas componentes são **independentes** no receptor — podemos transmitir dados separados em cada uma sem interferência mútua (desde que o receptor mantenha sincronismo de fase perfeito).

### Dedução da representação I/Q

Sejam $I_k$ e $Q_k$ os símbolos nas componentes em fase e em quadratura, respectivamente, no $k$-ésimo intervalo de símbolo de duração $T_s$. O sinal QAM transmitido é:

$$
\boxed{s(t) = I_k\cos(2\pi f_c t) - Q_k\sin(2\pi f_c t)},\qquad kT_s \leq t < (k+1)T_s.
$$

A convenção de sinal negativo no termo Q é padrão em comunicações: garante que a fase positiva corresponde à rotação anti-horária no plano complexo.

**Interpretação geométrica**: Defina o símbolo complexo como $x_k = I_k + jQ_k$. Então o sinal transmitido pode ser reescrito como:

$$
s(t) = \Re\left\{x_k\,e^{j2\pi f_c t}\right\}.
$$

Esta é a **forma analítica** (ou envelope complexo) do sinal: $x_k$ é a representacao no plano complexo (constelação), e $e^{j2\pi f_c t}$ é a portadora rotativa.

### Energia do símbolo

A energia do símbolo $s_k(t)$ no intervalo $[kT_s, (k+1)T_s]$ é:

$$
E_s = \int_{kT_s}^{(k+1)T_s} s_k^2(t)\,dt = \int_{kT_s}^{(k+1)T_s} \bigl[I_k\cos(2\pi f_c t) - Q_k\sin(2\pi f_c t)\bigr]^2 dt.
$$

Expandindo o quadrado:

$$
s_k^2(t) = I_k^2\cos^2(2\pi f_c t) + Q_k^2\sin^2(2\pi f_c t) - 2I_kQ_k\cos(2\pi f_c t)\sin(2\pi f_c t).
$$

O termo cruzado se anula por ortogonalidade: $\displaystyle\int_0^{T_s} 2\cos(2\pi f_c t)\sin(2\pi f_c t)\,dt = \int_0^{T_s}\sin(4\pi f_c t)\,dt = 0$ (para $f_c \gg 1/T_s$).

Os termos quadráticos: para $f_c$ suficientemente alta, $\cos^2(2\pi f_c t)$ e $\sin^2(2\pi f_c t)$ têm valor médio $1/2$ sobre cada período. Assim:

$$
\boxed{E_s = \frac{T_s}{2}(I_k^2 + Q_k^2) = \frac{T_s}{2}|x_k|^2}.
$$

Para normalização, convém adotar portadoras com energia unitária por símbolo: definamos $g_I(t) = \sqrt{\frac{2}{T_s}}\cos(2\pi f_c t)$ e $g_Q(t) = -\sqrt{\frac{2}{T_s}}\sin(2\pi f_c t)$, então:

$$
s(t) = a_I\,g_I(t) + a_Q\,g_Q(t),\qquad E_s = a_I^2 + a_Q^2 = |x|^2.
$$

A partir deste ponto, assumiremos essa normalização: $E_s = |x_k|^2$.

<!-- slides: columns -->

### Eficiência espectral

Cada símbolo QAM carrega $\log_2 M$ bits, onde $M$ é o tamanho da constelação. A taxa de símbolos é $R_s = 1/T_s$. A eficiência espectral (bit/s/Hz) é:

$$
\boxed{\eta = \frac{R_b}{B} = \log_2 M\;\text{bit/s/Hz}},
$$

onde $B \approx R_s = 1/T_s$ é a largura de banda ocupada na aproximação de pulsos Nyquist com excesso de banda nulo. Com filtro cosseno levantado, a convenção usual fornece $B=(1+\alpha)R_s$ e, portanto, $\eta=\log_2M/(1+\alpha)$. **Comparação**: para a mesma taxa de símbolos e o mesmo excesso de banda, QPSK transporta 2 bit/símbolo, enquanto 16-QAM transporta 4 bit/símbolo e dobra a eficiência espectral; essa vantagem custa menor distância entre pontos para a mesma energia média e, assim, maior $E_b/N_0$ para uma BER fixada.

<!-- slides: column -->

### Mapeamento Gray

Em alta SNR, erros quase sempre cruzam a fronteira mais próxima no plano complexo. Para minimizar o número de bits errados por erro de símbolo, usa-se **mapeamento Gray**: pontos vizinhos diferem em exatamente um bit. Em QAM retangular com $L$ níveis por eixo, cada eixo usa mapeamento Gray independente: os $m = \log_2 L$ bits mais significativos determinam a região (metade superior/inferior, esquerda/direita), e os menos significativos refinam.

<!-- slides: end-columns -->
## Constelações QAM — Geometria Completa

### QAM quadrada: estrutura geral

A maioria das aplicações práticas usa QAM **quadrada**, onde $M = L^2$ e ambos os eixos I e Q usam o mesmo conjunto de níveis. O conjunto de níveis é:

$$
\boxed{\mathcal{A} = \{\pm d, \pm 3d, \pm 5d, \ldots, \pm(L-1)d\}},
$$

com $L = \sqrt{M}$ níveis ímpares equidistantes, separados por $2d$. A distância mínima entre pontos adjacentes no mesmo eixo é $2d$.

**Exemplo 4-QAM (QPSK)**: $L=2$, níveis $\{\pm d\}$. Pontos: $(\pm d, \pm d)$. Energia média $E_s = \frac{1}{4}\sum_{k=1}^4 (d^2 + d^2) = d^2$.

**Exemplo 16-QAM**: $L=4$, níveis $\{\pm d, \pm 3d\}$. Pontos: $(\pm d \pm jd), (\pm 3d \pm jd), (\pm d \pm j3d), (\pm 3d \pm j3d)$.

### Distância mínima entre pontos

**Teorema da distância mínima**: Para QAM retangular com $L_I$ níveis no eixo I e $L_Q$ níveis no eixo Q, a distância mínima entre quaisquer dois pontos da constelação é:

$$
\boxed{d_{\min} = 2d},
$$

onde $d$ é a meia-distância entre níveis adjacentes no mesmo eixo. A distância é constante porque os pontos formam uma grade retangular ortogonal.

**Dedução**: Sejam dois pontos arbitrários $x_a = I_a + jQ_a$ e $x_b = I_b + jQ_b$, com $I_a, I_b \in \mathcal{A}_I$ e $Q_a, Q_b \in \mathcal{A}_Q$. A distância é $|x_a - x_b| = \sqrt{(I_a-I_b)^2 + (Q_a-Q_b)^2}$. Os valores possíveis de $|I_a-I_b|$ são $0, 2d, 4d, \ldots$ e idem para Q. O mínimo não-nulo ocorre quando um componente é $2d$ e o outro é $0$: $d_{\min} = \sqrt{(2d)^2 + 0} = 2d$.

Para QAM quadrada $M=L^2$ com $L$ ímpar:

$$
\boxed{d_{\min} = \frac{2d_{\max}}{L-1}},
$$

onde $d_{\max} = (L-1)d$ é a coordenada máxima. Se normalizarmos $E_s = 1$ (energia média por símbolo unitária), veremos na próxima subseção como isso determina $d_{\min}$.

### Energia média e normalização

**Dedução da energia média**: Para a QAM quadrada usual, $M=L^2$, $L$ é par e os níveis de cada eixo são

$$a_i=(2i-L+1)d,\qquad i=0,\ldots,L-1.$$

Por exemplo, $L=4$ fornece $\{-3d,-d,d,3d\}$. Como os níveis são equiprováveis e $\sum_{i=0}^{L-1}(2i-L+1)^2=L(L^2-1)/3$,

$$
E[I^2]=\frac{d^2}{L}\sum_{i=0}^{L-1}(2i-L+1)^2
=\frac{L^2-1}{3}d^2=\frac{M-1}{3}d^2.
$$

Os eixos I e Q têm a mesma energia. Portanto, o resultado **exato** é

$$
\boxed{E_s = \frac{2}{3}(M-1)d^2}.
$$

**Normalização a $E_s = 1$**: Para normalizar a constelação de modo que a energia média seja unitária:

$$
d = \sqrt{\frac{3}{2(M-1)}}.
$$

E a distância mínima é:

$$
\boxed{d_{\min} = 2\sqrt{\frac{3}{2(M-1)}} = \sqrt{\frac{6}{M-1}}}.
$$

**Teorema (penalidade de ordem)**: Para $E_s$ fixo, $d_{\min}$ **diminui** como $1/\sqrt{M-1}$. Ao comparar ordens em termos de $E_b/N_0$, deve-se também usar $E_s=E_b\log_2M$; a penalidade é obtida da expressão de BER da Seção “DEDUÇÃO da BER para QAM retangular”, e não de $10\log_{10}M$ isoladamente.

### Constelações não-retangulares

**8-QAM**: Não existe uma configuração retangular $M_I \times M_Q$ que produza $M=8$ (pois 8 não é produto de dois inteiros ímpares). As constelações 8-QAM não-retangulares têm pontos dispostos em círculos ou padrões hexagonais, mas são menos eficientes que 16-QAM em termos de $d_{\min}/\sqrt{E_s}$. Por isso, a indústria pula de 4 para 16-QAM.

**32-QAM**: $M = 4 \times 8$ (retangular não-quadrada), ou $32$-APSK (4 círculos). Menos comum que 16 e 64.

**64-QAM**: $L=8$, níveis $\{\pm d, \pm 3d, \pm 5d, \pm 7d\}$. $E_s = \frac{2}{3}(63)d^2 = 42d^2$. Normalizado: $d = \sqrt{\frac{3}{126}} = \sqrt{\frac{1}{42}}$.

**128-QAM**: $L \approx 11{,}3$ (não-quadrada), geralmente implementada como 128-APSK em satélites.

**256-QAM**: $L=16$, níveis $\{\pm d, \pm 3d, \ldots, \pm 15d\}$. $E_s = \frac{2}{3}(255)d^2$. Usada em 5G e Wi-Fi 6.

### Exercício em Python: visualização de constelações

```python
import numpy as np
import matplotlib.pyplot as plt

def make_qam_levels(L):
    """Retorna os L níveis para QAM retangular (L ímpar ou par)."""
    return np.array([-L+1+2*i for i in range(L)])

fig, axes = plt.subplots(1, 3, figsize=(12, 3.8))
for M, ax in [(16, axes[0]), (64, axes[1]), (256, axes[2])]:
    L = int(np.sqrt(M))
    levels = make_qam_levels(L) / np.sqrt(2*(M-1)/3)  # normaliza Es=1
    I, Q = np.meshgrid(levels, levels)
    ax.scatter(I, Q, s=30, c='#1e3a5f', edgecolors='#fff', linewidths=0.5)
    ax.set(aspect='equal', xlim=(-1.1, 1.1), ylim=(-1.1, 1.1))
    ax.set_title(f'{M}-QAM: {int(np.log2(M))} bits/simbolo')
    ax.grid(alpha=0.2)
    ax.axhline(0, color='gray', lw=0.5); ax.axvline(0, color='gray', lw=0.5)
plt.tight_layout()
plt.show()
```

## Probabilidade de Erro — Dedução Completa

### A função Q e a probabilidade de erro PAM

A **função Q** é definida como a cauda direita da distribuição normal padrão:

$$
\boxed{Q(x) = \frac{1}{\sqrt{2\pi}}\int_x^{\infty} e^{-t^2/2}\,dt = \frac{1}{2}\operatorname{erfc}\!\left(\frac{x}{\sqrt{2}}\right)}.
$$

**Relação com erfc**: A função erro complementar é $\operatorname{erfc}(x) = \frac{2}{\sqrt{\pi}}\int_x^{\infty}e^{-t^2}dt$. Fazendo $t = u/\sqrt{2}$, obtém-se $\operatorname{erfc}(x) = 2Q(x\sqrt{2})$.

Para um canal AWGN com ruído $n\sim\mathcal N(0,\sigma^2)$, a probabilidade de cruzar a fronteira situada no ponto médio de dois vizinhos separados por distância $D$ é $Q(D/(2\sigma))$. Como aqui $D=2d$ e $\sigma^2=N_0/2$ por dimensão, o argumento é $d/\sigma$.

### BER do PAM M-ary (resultados conhecidos)

Considere PAM com $M$ níveis equidistantes separados por $2d$. A probabilidade de erro de símbolo é:

$$
P_s^{\text{PAM}} = 2\frac{M-1}{M}Q\!\left(\frac{d}{\sigma}\right) = 2\frac{M-1}{M}Q\!\left(\sqrt{\frac{6\log_2M}{M^2-1}\frac{E_b}{N_0}}\right).
$$

O fator $\frac{M-1}{M}$ surge porque pontos internos têm dois vizinhos, mas são $\frac{M-2}{M}$ dos pontos; pontos de borda têm um vizinho e são $\frac{2}{M}$. O BER (bits errados) é aproximado por:

$$
\boxed{P_b^{\text{PAM}} \approx \frac{2(M-1)}{M\log_2 M}\,Q\!\left(\sqrt{\frac{6\log_2 M}{M^2-1}\frac{E_b}{N_0}}\right)}.
$$

### DEDUÇÃO da BER para QAM retangular

**Passo 1: Separação I/Q**. QAM retangular pode ser vista como **duas PAM ortogonais independentes**. A decisão no eixo I não depende da decisão no eixo Q, e vice-versa. Cada eixo usa $L = \sqrt{M}$ níveis (para QAM quadrada).

**Passo 2: probabilidade de cruzar uma fronteira por eixo**. Há $L-1$ fronteiras e $L$ níveis equiprováveis. Como a meia-distância é $d$ e $\sigma^2=N_0/2$,

$$
p_{\rm eixo}=2\left(1-\frac1L\right)Q\!\left(\frac d\sigma\right).
$$

Da Seção “Energia média e normalização”, $d^2=3E_s/[2(M-1)]$. Com $E_s=(\log_2M)E_b$,

$$
\frac d\sigma=\sqrt{\frac{3\log_2M}{M-1}\frac{E_b}{N_0}}.
$$

**Passo 3: converter erros de símbolo em erros de bit**. Com Gray e SNR suficientemente alta, uma travessia para o vizinho mais próximo altera um único bit. Como cada símbolo leva $k=\log_2M$ bits, $P_b\approx 2p_{\rm eixo}/k$: o fator 2 conta os dois eixos. Essa é uma aproximação de vizinho mais próximo, não uma igualdade para toda SNR.

**Passo 4: Expressão final em erfc**. Substituindo $E_s = E_b\log_2 M$:

$$
\boxed{P_b^{\text{QAM}} \approx \frac{2}{\log_2 M}\!\left(1-\frac{1}{\sqrt M}\right)\operatorname{erfc}\!\left(\sqrt{\frac{3\log_2 M}{2(M-1)}\frac{E_b}{N_0}}\right)}.
$$

**Forma alternativa com função Q** (mais comum):

$$
\boxed{P_b^{\text{QAM}} \approx \frac{4}{\log_2 M}\!\left(1-\frac{1}{\sqrt{M}}\right)Q\!\left(\sqrt{\frac{3\log_2 M}{M-1}\frac{E_b}{N_0}}\right)}.
$$

Esta é a expressão padrão para BER de QAM retangular em AWGN com mapeamento Gray.

**Verificação para 4-QAM (QPSK)**: $M=4$, $\log_2 M=2$, $\sqrt{M}=2$:

$$
P_b = \frac{4}{2}\!\left(1-\frac{1}{2}\right)Q\!\left(\sqrt{\frac{3\cdot 2}{3}\frac{E_b}{N_0}}\right) = Q\!\left(\sqrt{2\frac{E_b}{N_0}}\right).
$$

Resultado idêntico ao BPSK/QPSK — consistente, pois 4-QAM é geometricamente equivalente a QPSK.

### Aproximação para M grande

Para $M$ grande, $1-1/\sqrt M\approx1$. A aproximação mais usada é:

$$
\boxed{P_b \approx \frac{4}{\log_2 M}\,Q\!\left(\sqrt{\frac{3\log_2 M}{M-1}\frac{E_b}{N_0}}\right)}.
$$

Essa aproximação preserva a dependência essencial: aumentar $M$ reduz a distância normalizada entre vizinhos e exige maior $E_b/N_0$ para a mesma BER.

### Comparativo QAM vs PSK

**Resultado comparativo**: Para mesma eficiência espectral $\eta = \log_2 M$ bit/s/Hz:

- 16-QAM vs 16-PSK: 16-QAM é superior por ~3–4 dB em BER a $10^{-6}$. A razão é que 16-QAM tem pontos com distâncias variadas (cantos mais distantes do centro) e melhor aproveitamento da energia para alta ordem.
- 64-QAM vs 64-PSK: vantagem ~5 dB a favor de QAM.
- 256-QAM vs 256-PSK: vantagem ~6–7 dB.

**Importante**: A vantagem de QAM sobre PSK cresce com $M$, mas QAM exige amplificadores mais lineares (PAPR maior) e é mais sensível a imperfeições de fase e amplitude.

### SER (Probabilidade de Erro de Símbolo)

A probabilidade de erro de símbolo (não de bit) é:

$$
P_s = 1 - (1-p_{\text{eixo}})^2,
\qquad
p_{\text{eixo}}=2\!\left(1-\frac1{\sqrt M}\right)Q\!\left(\sqrt{\frac{3\log_2 M}{M-1}\frac{E_b}{N_0}}\right).
$$

A aproximação usa $1-(1-p)^2 \approx 2p$ para $p$ pequeno (alta SNR). Note que $P_s \approx \log_2 M \cdot P_b$ por mapeamento Gray.

### Exercício em Python: BER Monte Carlo de QAM

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.special import erfc

rng = np.random.default_rng(42)

def ber_qam_theory(M, eb_n0_linear):
    """BER analítica aproximada para QAM retangular."""
    k = np.log2(M)
    sqrt_M = np.sqrt(M)
    arg = np.sqrt(3*k*eb_n0_linear/(M-1))
    prefactor = 4/k*(1 - 1/sqrt_M)
    return prefactor * 0.5*erfc(arg/np.sqrt(2))

def ber_qam_mc(M, eb_n0_dbs, n_sym=200_000):
    """Monte Carlo para BER de QAM com Gray."""
    L = int(np.sqrt(M))
    k = int(np.log2(M))
    scale = np.sqrt(2*(M-1)/3)  # Es = 1
    levels = np.array([-L+1+2*i for i in range(L)]) / scale
    
    eb_n0 = np.array(eb_n0_dbs)
    berrs = []
    for db in eb_n0:
        # Sorteie índices de amplitude e rotule cada eixo em Gray.
        # Índices adjacentes i e i+1 têm rótulos i^(i>>1) que diferem em 1 bit.
        m_axis = k // 2
        idxI = rng.integers(0, L, n_sym)
        idxQ = rng.integers(0, L, n_sym)
        labelI = idxI ^ (idxI >> 1)
        labelQ = idxQ ^ (idxQ >> 1)
        bitsI = np.column_stack([(labelI >> b) & 1 for b in range(m_axis)])
        bitsQ = np.column_stack([(labelQ >> b) & 1 for b in range(m_axis)])
        bits = np.column_stack((bitsI, bitsQ))
        xi, xq = levels[idxI], levels[idxQ]
        x = xi + 1j*xq
        # Adicionar ruido AWGN
        # Use base de ponto flutuante. Com ``db`` do NumPy, ``10**db`` pode
        # sofrer overflow inteiro a partir de valores altos de Eb/N0.
        gamma = 10.0**(db/10.0)
        sigma = np.sqrt(1/(2*k*gamma))
        y = x + sigma*(rng.standard_normal(n_sym) + 1j*rng.standard_normal(n_sym))
        # Decisao: projetar nos niveis mais proximos
        yI = np.clip(np.rint((y.real*scale + L-1)/2).astype(int), 0, L-1)
        yQ = np.clip(np.rint((y.imag*scale + L-1)/2).astype(int), 0, L-1)
        # Rotule os índices decididos com o mesmo Gray de cada eixo.
        yLabelI = yI ^ (yI >> 1)
        yLabelQ = yQ ^ (yQ >> 1)
        ybitsI = np.column_stack([(yLabelI >> b) & 1 for b in range(m_axis)])
        ybitsQ = np.column_stack([(yLabelQ >> b) & 1 for b in range(m_axis)])
        ybits = np.column_stack((ybitsI, ybitsQ))
        ber = np.mean(ybits != bits)
        berrs.append(ber)
    return np.array(berrs)

eb = np.arange(2, 22, 1)
for M, lbl, mk in [(16, '16-QAM', 'o'), (64, '64-QAM', 's'), (256, '256-QAM', '^')]:
    mc = ber_qam_mc(M, eb)
    th = [ber_qam_theory(M, 10.0**(db/10.0)) for db in eb]
    plt.semilogy(eb, mc, mk, markersize=5, label=f'{M}-QAM MC')
    plt.semilogy(eb, th, '--', lw=1.5, label=f'{M}-QAM teoria')

plt.xlabel('$E_b/N_0$ (dB)'); plt.ylabel('BER')
plt.ylim(1e-6, 1e-1); plt.grid(True, which='both'); plt.legend()
plt.title('BER de QAM retangular em AWGN')
plt.tight_layout()
plt.show()
```

## Detecção Coerente de QAM

### Estrutura do receptor coerente

O receptor coerente de QAM recupera os símbolos I e Q usando correladores ortogonais. Após o canal AWGN, o sinal recebido é:

$$
r(t) = s(t) + n(t),
$$

onde $n(t)$ é ruído branco gaussiano com densidade espectral $N_0/2$.

### Dedução do correlador I/Q

Para recuperar $I_k$ e $Q_k$, projetamos $r(t)$ nas bases ortogonais $g_I(t)$ e $g_Q(t)$:

$$
r_I = \int_{kT_s}^{(k+1)T_s} r(t)\,g_I(t)\,dt = I_k + n_I,
$$
$$
r_Q = \int_{kT_s}^{(k+1)T_s} r(t)\,g_Q(t)\,dt = Q_k + n_Q.
$$

**Dedução dos ruídos projetados**: $n_I = \int n(t)g_I(t)dt$ e $n_Q = \int n(t)g_Q(t)dt$ são variáveis gaussianas independentes $\mathcal{N}(0, N_0/2)$ por ortogonalidade e linearidade.

**Recebemos**: $\mathbf{r} = \mathbf{x}_k + \mathbf{n}$, onde $\mathbf{r} = (r_I, r_Q)$, $\mathbf{x}_k = (I_k, Q_k)$, e $\mathbf{n} \sim \mathcal{N}(0, \frac{N_0}{2}\mathbf{I}_2)$.

### Decisão ML — regra de decisão de máxima verossimilhança

O detector de máxima verossimilhança escolhe o símbolo $\hat{x}_k$ que maximiza a densidade de probabilidade condicional $p(\mathbf{r}|\mathbf{x}_k)$. Como o ruído é gaussiano:

$$
p(\mathbf{r}|\mathbf{x}_k) = \frac{1}{\pi N_0}\exp\!\left(-\frac{|\mathbf{r} - \mathbf{x}_k|^2}{N_0}\right).
$$

Maximizar esta probabilidade é equivalente a minimizar a distância euclidiana:

$$
\boxed{\hat{\mathbf{x}}_k = \arg\min_{m} \|\mathbf{r} - \mathbf{x}_m\|^2}.
$$

**Decisão separada por eixo**: Para QAM retangular, a minimização se separa:

$$
\hat{I}_k = \arg\min_{I \in \mathcal{A}} (r_I - I)^2, \qquad \hat{Q}_k = \arg\min_{Q \in \mathcal{A}} (r_Q - Q)^2.
$$

Ou seja: projetamos cada componente no conjunto de níveis e escolhemos o mais próximo. Isso é **ótimo** para QAM retangular, pois as regiões de Voronoi são retângulos alinhados com os eixos.

### Regiões de decisão de Voronoi

Para cada ponto da constelação $\mathbf{x}_m$, a **região de decisão de Voronoi** $\mathcal{V}_m$ é o conjunto de pontos no plano $\mathbb{R}^2$ mais próximos de $\mathbf{x}_m$ do que de qualquer outro ponto da constelação:

$$
\boxed{\mathcal{V}_m = \{\mathbf{r} \in \mathbb{R}^2 : \|\mathbf{r} - \mathbf{x}_m\| \leq \|\mathbf{r} - \mathbf{x}_n\|,\ \forall n \neq m\}}.
$$

Para QAM retangular:

- Pontos internos: região retangular $2d \times 2d$.
- Pontos de borda: região semi-aberta (metade da largura em uma direção).
- Pontos de canto: região quadrante (um quarto do retângulo).

A probabilidade de erro de símbolo é:

$$
P_s = \sum_{m}\frac{1}{M}\Pr(\mathbf{r} \notin \mathcal{V}_m|\mathbf{x}_m) = 1 - \frac{1}{M}\sum_{m}\Pr(\mathbf{r} \in \mathcal{V}_m|\mathbf{x}_m).
$$

Para alta SNR, apenas vizinhos mais próximos contam, e recuperamos a expressão de BER da Seção “Probabilidade de Erro — Dedução Completa”.

### Efeito de erro de fase

**Prova da perda de SNR por erro de fase $\phi$**:

Considere erro de estimação de fase: o receptor usa $\cos(2\pi f_c t + \phi)$ e $-\sin(2\pi f_c t + \phi)$ em vez das bases corretas. A projeção do símbolo $x_k = I_k + jQ_k$ nas bases erradas produz:

$$
r_I' = I_k\cos\phi + Q_k\sin\phi + n_I',
$$
$$
r_Q' = -I_k\sin\phi + Q_k\cos\phi + n_Q'.
$$

Em forma matricial: $\begin{pmatrix} r_I' \\ r_Q' \end{pmatrix} = \begin{pmatrix} \cos\phi & \sin\phi \\ -\sin\phi & \cos\phi \end{pmatrix}\begin{pmatrix} I_k \\ Q_k \end{pmatrix} + \mathbf{n}'$.

A matriz de rotação $R(\phi)$ é ortogonal (preserva normas), então **a distância entre pontos não muda**. Porém, a grade retangular é rotacionada em relação aos eixos de decisão do receptor.

Para um símbolo no eixo I puro ($I_k=d$, $Q_k=0$), a projeção no eixo I do receptor é $r_I' = d\cos\phi$. A componente "vazada" para Q é $r_Q' = -d\sin\phi$.

A SNR efetiva no eixo de decisão é reduzida por:

$$
\boxed{\text{SNR}_{\text{eff}} = \text{SNR} \cdot \cos^2\phi}.
$$

Em dB: perda de $-10\log_{10}(\cos^2\phi) \approx 4{,}34\phi^2$ dB para $\phi$ pequeno (em radianos).

**Exemplo**: $\phi = 5^\circ \approx 0{,}087$ rad $\Rightarrow \cos^2\phi \approx 0{,}9924 \Rightarrow$ perda de ~0,034 dB (negligível). $\phi = 15^\circ \Rightarrow$ perda de ~0,35 dB. $\phi = 30^\circ \Rightarrow$ perda de 1,76 dB.

**Importante**: O erro de frequência (diferença $\Delta f$ entre o oscilador do receptor e do transmissor) causa uma rotação **contínua** da constelação: $\phi(t) = 2\pi\Delta f\, t$. Isso é inaceitável em QAM de ordem alta, pois a constelação gira continuamente, cruzando fronteiras de decisão.

### Exercício em Python: erro de fase na constelação

```python
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(7)

M = 16; L = int(np.sqrt(M))
levels = np.array([-L+1+2*i for i in range(L)]) / np.sqrt(2*(M-1)/3)
I, Q = np.meshgrid(levels, levels)
x_clean = I + 1j*Q

angles = [0, 5, 15, 30]
fig, axes = plt.subplots(1, 4, figsize=(14, 3.5))
for ax, phi in zip(axes, angles):
    phi_rad = np.deg2rad(phi)
    # Rotação da constelacao + ruido
    x_rot = x_clean * np.exp(1j*phi_rad)
    sigma = np.sqrt(1/(2*4*10**(12/10)))  # Es/N0 = 12 dB
    noise = sigma * (rng.standard_normal(len(x_clean)) + 1j*rng.standard_normal(len(x_clean)))
    y = x_rot + noise
    ax.scatter(y.real, y.imag, s=8, alpha=0.3, c='#1e3a5f')
    ax.scatter(x_clean.real, x_clean.imag, s=15, marker='x', c='red', alpha=0.6)
    ax.set(aspect='equal', xlim=(-1.2, 1.2), ylim=(-1.2, 1.2))
    ax.set_title(f'Erro de fase: {phi} deg\n(perda ~{4.34*phi**2:.2f} dB)')
    ax.axhline(0, color='gray', lw=0.3); ax.axvline(0, color='gray', lw=0.3)
    ax.grid(alpha=0.15)
plt.tight_layout()
plt.show()
```

## Estimação de Canal e Sincronismo

### Pilotos e estimação de canal

Em sistemas práticos, o canal introduce ganho complexo $H = |H|e^{j\phi}$ e possivelmente dispersão. Para QAM de banda estreita (canal plano), o receptor estima $H$ a partir de símbolos piloto conhecidos:

$$
\hat{H} = \frac{r_p}{x_p},
$$

onde $x_p$ é o símbolo piloto transmitido e $r_p$ é a recepção correspondente. O canal estimado é então usado para compensação: $\hat{x}_k = r_k / \hat{H}$.

**Pilotos inseridos**: símbolos conhecidos são intercalados com dados na constelação. Em OFDM (Seção “Lista de Exercícios Propostos”), pilotos são colocados em subportadoras específicas.

### Algoritmo CMA (Constant Modulus Algorithm)

O CMA é um equalizador adaptativo sem necessidade de sequência de treinamento. **Definição**: minimiza o custo:

$$
\boxed{J(\mathbf{w}) = \mathbb{E}\bigl[|y_n|^2 - R\bigr]^2},
$$

onde $y_n = \mathbf{w}^H\mathbf{x}_n$ é a saída do equalizador e $R = \mathbb{E}[|x_k|^4]/\mathbb{E}[|x_k|^2]$ é a constante de módulo.

**Atualização por gradiente estocástico**:

$$
\mathbf{w}_{n+1} = \mathbf{w}_n - \mu\nabla_{\mathbf{w}}J|_{\mathbf{w}_n} = \mathbf{w}_n + 2\mu\bigl(R - |y_n|^2\bigr)y_n^*\mathbf{x}_n.
$$

**Observação**: O CMA converge para uma solução que preserva a constelação (amplitude constante) mas **não** corrige rotação de fase. Para QAM (amplitudes variadas), o CMA puro não é ideal — variações como CMA-modificado ou algoritmos baseados em decisão são preferidos.

### Estimativa de fase

Para QPSK, o algoritmo de **Viterbi-Viterbi** estima e remove a fase: eleva o sinal à potência $M$ (remove a modulação), média, recupera a fase e divide por $M$. Para QAM, adaptações são necessárias pois a constelação não tem amplitude constante.

### PLL Costas modificado para QAM

O *Costas loop* original é para PSK. Para QAM, usa-se uma versão modificada que explora a simetria da constelação: o sinal de erro de fase é gerado a partir dos resíduos após decisão, com ganho adaptativo.

### Equalização adaptativa: LMS e RLS

**Algoritmo LMS** (Least Mean Squares):

$$
\boxed{\mathbf{w}_{n+1} = \mathbf{w}_n + 2\mu\,e_n\,\mathbf{x}_n},
$$

onde $e_n = d_n - \mathbf{w}_n^H\mathbf{x}_n$ é o erro de estimação e $\mu$ é o passo de adaptação. Convergência se $0 < \mu < \frac{2}{\lambda_{\max}}$, onde $\lambda_{\max}$ é o maior autovalor da matriz de autocorrelação da entrada.

**Algoritmo RLS** (Recursive Least Squares): minimiza a soma ponderada dos erros quadráticos com fator de esquecimento $\lambda \in (0,1]$. Complexidade $O(N^2)$ vs LMS $O(N)$, mas converge muito mais rápido.

## QAM em Prática — Aplicações e Trade-offs

### ADSL/VDSL

ADSL2+ usa QAM até 15-QAM (na prática 16-QAM) nos subcanais de banda. VDSL2 usa até 34-QAM (32-QAM) com taxa de até 100 Mb/s. A escolha da ordem QAM por subportadora depende do SNR medido em cada banda.

### Wi-Fi (802.11ac/ax)

802.11ac (Wi-Fi 5) suporta até **256-QAM** (8 bits/símbolo), proporcionando 10,7 bit/s/Hz por stream. 802.11ax (Wi-Fi 6) mantém 256-QAM mas melhora eficiência com OFDMA e MU-MIMO. A seleção de MCS (Modulation and Coding Scheme) é adaptativa: o AP mede SNR e seleciona a ordem QAM mais alta que mantém BER < $10^{-6}$.

### 5G NR

5G NR suporta até **256-QAM** (downlink) e até 64-QAM (uplink), com até 6 camadas MIMO. Com 100 MHz de banda e 256-QAM, taxas de pico excedem 3 Gb/s.

### Cable Modems (DOCSIS 3.1/4.0)

DOCSIS 3.1 suporta até **4096-QAM** (12 bits/simbolo) em banda larga, com taxa de ~1 Gb/s. DOCSIS 4.0 estende até ~2 GHz, permitindo mais canais.

### Satélites

Satélites preferem **APSK** (Amplitude Phase Shift Keying) sobre QAM retangular: 8-APSK, 16-APSK, 32-APSK (DVB-S2X). APSK tem PAPR menor que QAM retangular da mesma ordem, o que é crucial para amplificadores de potência de satélite (que operam próximos da saturação para eficiência máxima).

### Trade-offs práticos

| Fator | Efeito |
|-------|--------|
| **PAPR** | QAM retangular tem PAPR alto $\sim 10\log_{10}(\sqrt{M})$ dB. Exige back-off do PA. |
| **Linearidade do PA** | Maior ordem QAM exige PA mais linear → menor eficiência. |
| **EVM** | EVM de receptor deve ser $< \frac{d_{\min}}{2}$ para BER aceitável. |
| **Erro de fase** | QAM de ordem alta é mais sensível; exige PLL de baixa fase. |
| **Canal freq-seletivo** | Requer equalização ou OFDM. |
| **Overhead de pilots** | Mais pilotos → menor eficiência espectral efetiva. |

**Importante**: Em sistemas reais, a ordem QAM é **adaptativa** (AMC — Adaptive Modulation and Coding). O transmissor ajusta M baseado na estimativa de canal, maximizando a taxa de dados mantendo BER dentro da tolerância.

## Exercícios resolvidos em Python

### Protocolo computacional

**Objetivo:** validar normalização, regiões ML, mapeamento Gray e BER de QAM. **Normalização:** imponha $\mathbb E[|s|^2]=1$ antes de adicionar ruído e documente a variância complexa. **Validação:** compare SER/BER simuladas com teoria e reporte número de bits, erros e incerteza.

### Exercício 1: Constelações QAM 16/64/256 com decisão Voronoi

Simule a transmissão de símbolos QAM através de AWGN, visualize as constelações recebidas para diferentes SNRs e verifique as regiões de decisão Voronoi.

```python
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(2026)

def constell_qam(M, n_sym=5000):
    L = int(np.sqrt(M))
    k = int(np.log2(M))
    levels = np.array([-L+1+2*i for i in range(L)]) / np.sqrt(2*(M-1)/3)
    bits = rng.integers(0, 2, (n_sym, k))
    gray = bits.copy()
    for b in range(1, k):
        gray[:, b] ^= gray[:, b-1]
    m = k // 2
    gI, gQ = gray[:, :m], gray[:, m:]
    w = 2**np.arange(m-1, -1, -1)
    idxI, idxQ = (gI @ w).astype(int), (gQ @ w).astype(int)
    xi, xq = levels[idxI], levels[idxQ]
    return xi, xq, levels

snrs = [6, 12, 18]
fig, axes = plt.subplots(1, 3, figsize=(14, 4))
for ax, snr in zip(axes, snrs):
    xi, xq, levels = constell_qam(64)
    x = xi + 1j*xq
    sigma = np.sqrt(1/(2*6*10**(snr/10)))
    y = x + sigma*(rng.standard_normal(len(x))+1j*rng.standard_normal(len(x)))
    ax.scatter(y.real, y.imag, s=4, alpha=0.2, c='#0f4c75')
    ax.scatter(x.real, x.imag, s=20, marker='x', c='red', alpha=0.4)
    for lv in levels:
        ax.axvline(lv, color='blue', lw=0.3, alpha=0.3)
        ax.axhline(lv, color='blue', lw=0.3, alpha=0.3)
    ax.set(aspect='equal', xlim=(-1.2, 1.2), ylim=(-1.2, 1.2))
    ax.set_title(f'64-QAM, Eb/N0 = {snr} dB')
    ax.grid(alpha=0.15); ax.axhline(0, c='gray', lw=0.3); ax.axvline(0, c='gray', lw=0.3)
plt.tight_layout(); plt.show()
```

### Exercício 2: BER de 16-QAM vs 16-PSK vs BPSK

Compare o BER de 16-QAM, 16-PSK e BPSK em função de $E_b/N_0$. Note que 16-QAM tem 4 bits/símbolo e 16-PSK também, enquanto BPSK tem 1 bit/símbolo.

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.special import erfc

def ber_16qam(ebn0_db):
    M=16; k=4; g=10**(ebn0_db/10)
    return 4/k*(1-1/np.sqrt(M))*0.5*erfc(np.sqrt(6*k*g/(M-1))/np.sqrt(2))

def ber_16psk(ebn0_db):
    M=16; g=10**(ebn0_db/10)
    # Aproximacao: P_s ~ 2Q(sqrt(2*Es/N0*sin^2(pi/M)))
    return 2*0.5*erfc(np.sqrt(2*g*np.sin(np.pi/M)**2)/np.sqrt(2))

def ber_bpsk(ebn0_db):
    g=10**(ebn0_db/10)
    return 0.5*erfc(np.sqrt(g))

eb = np.arange(0, 20, 0.5)
plt.semilogy(eb, ber_16qam(eb), 'o-', label='16-QAM (4 bit/simb)')
plt.semilogy(eb, ber_16psk(eb), 's--', label='16-PSK (4 bit/simb)')
plt.semilogy(eb, ber_bpsk(eb), '^:', label='BPSK (1 bit/simb)')
plt.xlabel('$E_b/N_0$ (dB)'); plt.ylabel('BER')
plt.ylim(1e-6, 1); plt.grid(True, which='both')
plt.legend(); plt.title('Comparativo BER: 16-QAM vs 16-PSK vs BPSK')
plt.tight_layout(); plt.show()
```

### Exercício 3: Efeito de erro de fase no BER de QAM

Quantifique a perda de BER causada por erro de fase fixo em 16-QAM.

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.special import erfc

M = 16; k = 4
eb = np.arange(2, 20, 0.5)
phases = [0, 5, 10, 15, 20]
for phi in phases:
    phi_rad = np.deg2rad(phi)
    g = 10**(eb/10)
    arg = np.sqrt(6*k*g/(M-1)) * np.cos(phi_rad)
    ber = 4/k*(1-1/np.sqrt(M))*0.5*erfc(arg/np.sqrt(2))
    loss_db = -10*np.log10(np.cos(phi_rad)**2)
    plt.semilogy(eb, ber, label=fr'$\phi$={phi}$^\circ$ (perda {loss_db:.2f} dB)')
plt.xlabel('$E_b/N_0$ (dB)'); plt.ylabel('BER')
plt.ylim(1e-6, 1e-1); plt.grid(True, which='both'); plt.legend()
plt.title('BER de 16-QAM com erro de fase fixo')
plt.tight_layout(); plt.show()
```

### Exercício 4: Eficiência espectral vs BER para M-QAM

Visualize a relação entre ordem QAM, eficiência espectral e BER.

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.special import erfc

M_vals = [4, 16, 64, 256, 1024]
target_ber = 1e-3
eb_dbs = np.arange(0, 30, 0.1)

plt.figure(figsize=(10, 6))
for M in M_vals:
    k = np.log2(M)
    g = 10**(eb_dbs/10)
    arg = np.sqrt(6*k*g/(M-1))
    ber = 4/k*(1-1/np.sqrt(M))*0.5*erfc(arg/np.sqrt(2))
    plt.semilogy(eb_dbs, ber, label=f'{M}-QAM ({k} bit/s/Hz)')

plt.axhline(target_ber, color='red', linestyle='--', lw=1, label=f'BER alvo = {target_ber}')
plt.xlabel('$E_b/N_0$ (dB)'); plt.ylabel('BER')
plt.ylim(1e-6, 0.5); plt.grid(True, which='both')
plt.legend(); plt.title('BER de QAM retangular: eficiencia espectral vs SNR')
plt.tight_layout(); plt.show()
```

## Lista de Exercícios Propostos

**E1** (Geometria de constelação). Para 16-QAM com $d=1$, calcule a energia média $E_s$, a distância mínima $d_{\min}$ e o fator de normalização para $E_s=1$. Repita para 64-QAM e 256-QAM.

**E2** (Dedução da distância mínima). Prove que para QAM retangular com $L_I \neq L_Q$, a distância mínima é $d_{\min} = \min(2d_I, 2d_Q)$, onde $d_I$ e $d_Q$ são as meias-distâncias nos eixos I e Q, respectivamente.

**E3** (Energia normalizada). Mostre que para $E_s$ fixo, a relação entre $d_{\min}$ e $M$ em QAM quadrada é $d_{\min} = \sqrt{6/(M-1)}$. Use isso para calcular a perda em dB de $d_{\min}$ ao passar de QPSK ($M=4$) para 16-QAM ($M=16$) mantendo $E_s$ constante.

**E4** (BER de 64-QAM). Use a expressão aproximada de BER para 64-QAM e calcule o BER para $E_b/N_0 = 15$ dB. Compare com o valor para 16-QAM ao mesmo $E_b/N_0$.

**E5** (Comparativo QAM vs PSK). Para $M=16$, $32$, $64$, calcule numericamente a diferença de $E_b/N_0$ necessária para atingir BER $=10^{-6}$. Use a expressão QAM da Seção “DEDUÇÃO da BER para QAM retangular” e $P_s^{\text{PSK}}\approx2Q\left(\sqrt{2E_s/N_0}\sin(\pi/M)\right)$, declarando a aproximação usada para converter SER em BER.

**E6** (Decisão Voronoi). Dada uma constelação 16-QAM normalizada, escreva as regiões de Voronoi para: (a) um ponto de canto, (b) um ponto de borda, (c) um ponto interno. Esboce graficamente.

**E7** (Perda por erro de fase). Prove que para erro de fase pequeno $\phi$, a perda de SNR em dB é $10\log_{10}(\cos^2\phi) \approx -4{,}34\phi^2$. Calcule a perda para $\phi = 2^\circ$, $5^\circ$, $10^\circ$.

**E8** (CMA). Derive a atualização do algoritmo CMA a partir da minimização de $J(\mathbf{w}) = \mathbb{E}[|y_n|^2-R]^2$ usando gradiente estocástico. Explique o papel da constante de módulo $R$ e por que ela depende da constelação.

**E9** (Trade-off prático). Em um sistema Wi-Fi 802.11ac com 80 MHz de banda, 4 streams MIMO, e 256-QAM, calcule a taxa máxima teórica (ignorando overhead). Se o SNR cai a ponto de exigir 64-QAM, qual é a nova taxa? E com 16-QAM?

**E10** (SER vs BER). Mostre que para QAM quadrada com Gray, $P_s = 1 - (1-P_b^{\text{eixo}})^2$. Para alta SNR, aproxime $P_s \approx 2P_b^{\text{eixo}}$ e use isso para recuperar a expressão de BER.

**E11** (QAM retangular não-quadrada). Considere 32-QAM retangular como $4 \times 8$. Calcule $d_{\min}$, $E_s$ e BER aproximada. Compare com 32-PSK.

**E12** (Constante de módulo CMA). Para QPSK, verifique que $R = \mathbb{E}[|x_k|^4]/\mathbb{E}[|x_k|^2] = 1$ (com $E_s=1$). Para 16-QAM, calcule $R$ numericamente e explique por que o CMA puro é menos adequado para QAM que para PSK.

## Gabarito

**E1.** 16-QAM: $d=1 \Rightarrow E_s = \frac{2}{3}(15)\cdot 1 = 10$. $d_{\min} = 2$. Normalizado: $d_{\text{norm}} = 1/\sqrt{10}$, $d_{\min,\text{norm}} = 2/\sqrt{10} = \sqrt{2/5}$. 64-QAM: $E_s = \frac{2}{3}(63) = 42$. 256-QAM: $E_s = \frac{2}{3}(255) = 170$.

**E2.** Em QAM retangular, pontos diferem por múltiplos inteiros de $2d_I$ no eixo I e $2d_Q$ no eixo Q. A distância mínima é o menor deslocamento entre pontos vizinhos, que é $\min(2d_I, 2d_Q)$ quando um eixo não se move e o outro move uma única vez.

**E3.** $d_{\min} = \sqrt{6/(M-1)}$. Para QPSK: $d_{\min} = \sqrt{2}$. Para 16-QAM: $d_{\min} = \sqrt{6/15} = \sqrt{0{,}4}$. Logo, à mesma $E_s$, a razão entre os quadrados das distâncias é $2/0{,}4=5$, ou $10\log_{10}(5)\approx7{,}0$ dB. Isso não é diretamente uma perda em $E_b/N_0$, pois $E_s=E_b\log_2M$ muda com $M$.

**E4.** Para 64-QAM a 15 dB, $k=6$ e $\gamma_b=31{,}62$: $x=\sqrt{3k\gamma_b/(M-1)}=\sqrt{18\cdot31{,}62/63}\approx3{,}01$. Assim, $P_b\approx(4/6)(1-1/8)Q(x)\approx\boxed{7{,}6\times10^{-4}}$. Para 16-QAM, $x=\sqrt{12\cdot31{,}62/15}\approx5{,}03$ e $P_b\approx\boxed{1{,}8\times10^{-7}}$. A ordem maior oferece mais bits por símbolo, mas exige mais $E_b/N_0$ para a mesma BER.

**E5.** Aproximações numéricas: $M=16$: QAM $\sim$13,5 dB, PSK $\sim$17 dB (diff ~3,5 dB). $M=32$: QAM $\sim$15,5 dB, PSK $\sim$19,5 dB (diff ~4 dB). $M=64$: QAM $\sim$17 dB, PSK $\sim$22 dB (diff ~5 dB).

**E6.** (a) Canto: região quadrante, delimitada por retas perpendiculares bissetrizes dos lados adjacentes. (b) Bordas: região semi-aberta. (c) Interno: retângulo $2d\times2d$.

**E7.** $\cos^2\phi \approx 1-\phi^2 \Rightarrow 10\log_{10}(1-\phi^2) \approx -4{,}34\phi^2$. $\phi=2^\circ=0{,}0349$ rad: perda $\approx 0{,}0053$ dB. $\phi=5^\circ=0{,}0873$: perda $\approx 0{,}033$ dB. $\phi=10^\circ=0{,}1745$: perda $\approx 0{,}132$ dB.

**E8.** $\nabla_{\mathbf{w}}J = \nabla_{\mathbf{w}}\mathbb{E}[(|y_n|^2-R)^2] = 2\mathbb{E}[(|y_n|^2-R)y_n^*\mathbf{x}_n]$. Estima por amostra: $\mathbf{w}_{n+1} = \mathbf{w}_n + 2\mu(R-|y_n|^2)y_n^*\mathbf{x}_n$. A constante $R = \mathbb{E}[|x|^4]/\mathbb{E}[|x|^2]$ depende da constelação: para QPSK $R=1$ (amplitude constante), para 16-QAM $R \approx 1{,}9$ (amplitudes variadas).

**E9.** 256-QAM: $8$ bit/símbolo × $80\times10^6/2$ símbolos/s (Nyquist) × $4$ streams ≈ $1{,}28$ Gb/s (ideal, sem coding). 64-QAM: $6\times$ taxa $= 0{,}96$ Gb/s. 16-QAM: $4\times = 0{,}64$ Gb/s. Com FEC (rate 3/4) e overhead (~25%), taxas efetivas: ~0,72, ~0,54, ~0,36 Gb/s.

**E10.** $P_s = 1-(1-p)^2 = 2p-p^2 \approx 2p$ para $p \ll 1$. Com Gray, $P_b \approx P_s/\log_2 M$, logo $P_b \approx 2p/\log_2 M = 2P_b^{\text{eixo}}/\log_2 M$.

**E11.** 4×8: eixo I com 4 níveis ($d_I$), eixo Q com 8 níveis ($d_Q$). $d_{\min} = \min(2d_I, 2d_Q)$. $E_s = \frac{d_I^2(4^2-1)}{3} + \frac{d_Q^2(8^2-1)}{3}$. A BER total é a média ponderada pelos números de bits atribuídos a cada eixo.

**E12.** QPSK: $|x_k|=1$ sempre, $\mathbb{E}[|x|^4]=1$, $\mathbb{E}[|x|^2]=1$, $R=1$. 16-QAM: níveis normalizados, $\mathbb{E}[|x|^2]=1$, $\mathbb{E}[|x|^4] = \frac{1}{16}\sum_{m=1}^{16}|x_m|^4 \approx 1{,}9$. CMA busca amplitude constante, então para QAM (amplitudes variadas) o erro residual é maior — por isso CMA é mais adequado para PSK.
