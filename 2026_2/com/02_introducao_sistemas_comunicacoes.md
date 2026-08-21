# Introdução a Sistemas de Comunicações

> Sistemas de Comunicações — Apostila de Curso
> Tópicos: Modelo Completo do Sistema · Recursos e Métricas Fundamentais · Decibéis e Orçamento de Enlace · Ruído e Cascata de Estágios · Capacidade de Shannon · Modulações Analógicas vs. Digitais · Exercícios em Python

## Antes de começar

Ao final, você deve conseguir seguir informação, potência e ruído por toda a cadeia, fechar um orçamento de enlace e distinguir taxa, banda, SNR e $E_b/N_0$. **Diagnóstico:** adicionar 3 dB sempre dobra alguma grandeza? Diga quando isso vale para potência e amplitude. **Evidência mínima:** justificar cada termo de um orçamento de enlace e identificar qual bloco limita a margem.

## Sumário

1. [Modelo Completo de um Sistema de Comunicações](#modelo-completo-de-um-sistema-de-comunicações)
2. [Recursos e Métricas Fundamentais](#recursos-e-métricas-fundamentais)
3. [Decibéis e Orçamento de Enlace — Deduções Completas](#decibéis-e-orçamento-de-enlace--deduções-completas)
4. [Ruído — Fundamentos Físicos Completos](#ruído--fundamentos-físicos-completos)
5. [Capacidade de Shannon — Derivação Detalhada](#capacidade-de-shannon--derivação-detalhada)
6. [Modulações Analógicas vs. Digitais — Comparação Rigorosa](#modulações-analógicas-vs-digitais--comparação-rigorosa)
7. [Exercícios Resolvidos em Python](#exercícios-resolvidos-em-python)
8. [Lista de Exercícios Propostos](#lista-de-exercícios-propostos)
9. [Gabarito](#gabarito)

## Modelo Completo de um Sistema de Comunicações

Um sistema de comunicação transfere informação de uma **fonte** a um **destino** por meio de um meio físico imperfeito. O modelo completo envolve uma cadeia de etapas:

$$
\begin{aligned}
&\underbrace{\text{Fonte}}_{\text{mensagem}} \to \underbrace{\text{Codif. fonte}}_{\text{compressão}} \to \underbrace{\text{Codif. canal}}_{\text{correção de erros}} \to \underbrace{\text{Modulador}}_{\text{adapta ao canal}} \\
&\qquad\longrightarrow \boxed{\text{Canal} + \text{ruído} + \text{interferência}} \longrightarrow \underbrace{\text{Demodulador}} \to \underbrace{\text{Decodif. canal}} \to \underbrace{\text{Decodif. fonte}} \to \underbrace{\text{Destino}}
\end{aligned}
$$

**Definição:** A **fonte** gera a mensagem original. O **canal** é o meio de propagação (fio, fibra, espaço livre). O **destino** recebe e reconstrói a mensagem.

**Observação:** Codificação de fonte remove redundância; codificação de canal adiciona redundância controlada.

### Entropia de Shannon

A entropia mede a **incerteza** de uma fonte:

$$
\boxed{H(X) = -\sum_{i=1}^{M} p_i\log_2 p_i}
$$

Propriedades: $H \ge 0$; $H_{\max} = \log_2 M$ (distribuição uniforme); $H$ contínua em $p_i$.

**Exemplo — Fonte binária:** $\Pr(X=0)=p$, $\Pr(X=1)=1-p$:

$$
H(X) = -p\log_2 p - (1-p)\log_2(1-p) = h_2(p)
$$

Para $p=1/2$, $H=1$ bit/símbolo (máximo). Para $p=0{,}01$, $H\approx0{,}0808$ bits/símbolo.

**Teorema da codificação de fonte (Shannon, 1948):**

Para blocos longos de uma fonte discreta sem memória, nenhuma codificação sem perdas univocamente decodificável pode ter comprimento médio abaixo de $H(X)$, e existem códigos cujo comprimento médio por símbolo se aproxima arbitrariamente de $H(X)$:

$$\boxed{H(X)\le \bar L < H(X)+1\quad\text{(código símbolo a símbolo)},\qquad
\bar L_n/n\to H(X)\quad\text{(blocos longos)}.}$$

Assim, $H(X)$ é um ínfimo assintótico, não necessariamente uma taxa exatamente atingível por um código finito.

### Codificação de fonte

**PCM (Pulse Code Modulation):** Amostragem $\to$ Quantização $\to$ Codificação binária. Para $n$ bits: $R_b = f_s \cdot n$.

**DPCM (Differential PCM):** Codifica a diferença entre amostra real e prevista — menor variância = menos bits.

**Huffman:** $\bar{L} = \sum p_i \ell_i \ge H(X)$, com $\bar{L} < H(X)+1$.

### Codificação de canal

**Código bloqueio $(n,k)$:** Mapeia $k$ bits $\to$ $n$ bits. Taxa $R = k/n$.

Distância mínima e capacidade de correção:

$$
\boxed{t_{\text{corr}} = \left\lfloor\frac{d_{\min}-1}{2}\right\rfloor}
$$

**Exemplo — Hamming $(7,4)$:** $d_{\min}=3$, corrige $t=1$ erro, $R=4/7\approx0{,}571$.

$$
G = \begin{bmatrix}1&0&0&0&1&1&0\\0&1&0&0&1&0&1\\0&0&1&0&0&1&1\\0&0&0&1&1&1&1\end{bmatrix},\quad
H = \begin{bmatrix}1&1&0&1&1&0&0\\1&0&1&1&0&1&0\\0&1&1&1&0&0&1\end{bmatrix}
$$

Síndrome: $\vec{s} = H\vec{c}^T$.

### Modulador e demodulador

$$
s(t) = I(t)\cos(2\pi f_c t) - Q(t)\sin(2\pi f_c t)
$$

### Canal físico

**AWGN:** $h(t) = a\,\delta(t-\tau)$, ruído gaussiano branco PSD $N_0/2$.

$$
\boxed{r(t) = s(t)*h(t) + n(t) + i(t)}
$$

Modelos: AWGN, fading (Rayleigh, Rician, Nakagami), interferência.

```python
import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)
fs, T, fc, snr_dB = 1000, 1.0, 50, 10
t = np.linspace(0, T, int(fs*T), endpoint=False)
s = np.cos(2*np.pi*fc*t)
Ps = np.mean(s**2)
sigma = np.sqrt(Ps / 10**(snr_dB/10))
n = np.random.normal(0, sigma, len(t))
r = s + n

fig, ax = plt.subplots(figsize=(8, 4))
ax.plot(t, s, alpha=0.7, label='$s(t)$', color='#2563eb')
ax.plot(t, r, alpha=0.5, label='$r(t)$', color='#dc2626')
ax.set_xlabel('Tempo (s)'); ax.set_ylabel('Amplitude')
ax.set_title(f'Canal AWGN (SNR = {snr_dB} dB, $\\sigma={sigma:.4f}$)')
ax.legend(); ax.grid(alpha=0.3)
plt.tight_layout()
print(f"Ps={Ps:.4f}, Pn={Ps/10**(snr_dB/10):.6f}, sigma={sigma:.4f}")
```

## Recursos e Métricas Fundamentais

### Taxa de símbolo e bits

$$
R_s = \frac{1}{T_s},\qquad \boxed{R_b = k R_s,\quad k = \log_2 M}
$$

| Mod. | $M$ | $k$ | $R_b/R_s$ |
|------|-----|-----|-----------|
| BPSK | 2 | 1 | 1 |
| QPSK | 4 | 2 | 2 |
| 16-QAM | 16 | 4 | 4 |
| 64-QAM | 64 | 6 | 6 |

<!-- slides: columns -->

### Eficiência espectral

$$
\boxed{\eta = \frac{R_b}{B}\ \text{bit/s/Hz}}
$$

Com raised-cosine $\alpha$: $B = (1+\alpha)R_s \Rightarrow \eta_{\max} = \dfrac{\log_2 M}{1+\alpha}$.

<!-- slides: column -->

### $E_b/N_0$ universal

$$
P_s = E_b R_b,\quad P_n = N_0 B \Rightarrow \boxed{\frac{E_b}{N_0} = \frac{\text{SNR}}{\eta} = \text{SNR}\cdot\frac{B}{R_b}}
$$



<!-- slides: end-columns -->
### Teorema de Nyquist-Shannon

$$
\boxed{f_s \ge 2B}
$$

Reconstrução por interpolador sinc: $x(t) = \sum x(nT_s)\operatorname{sinc}\!\left(\frac{t-nT_s}{T_s}\right)$.

### SNR de quantização PCM

$$
\Delta = \frac{V_{pp}}{2^n},\quad P_q = \frac{\Delta^2}{12},\quad P_s = \frac{V_{pp}^2}{8}
$$

$$
\boxed{\text{SNR}_q \approx 6{,}02n + 1{,}76\;\text{dB}}
$$

Cada bit $\approx$ 6 dB.

```python
import numpy as np
import matplotlib.pyplot as plt

n_vals = np.arange(1, 17)
snr_dB = 6.02*n_vals + 1.76

fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(n_vals, snr_dB, 'o-', color='#2563eb', lw=2, markersize=6,
        label='$\\text{SNR}_q \\approx 6{,}02n + 1{,}76$ dB')
ax.axhline(60, color='#dc2626', ls='--', alpha=0.6, label='60 dB (CD)')
ax.axhline(48, color='#047857', ls='--', alpha=0.6, label='48 dB (voz)')
ax.set_xlabel('Bits $n$'); ax.set_ylabel('SNR (dB)')
ax.set_title('SNR de Quantização PCM vs. Bits'); ax.set_xticks(n_vals)
ax.grid(alpha=0.3); ax.legend(); plt.tight_layout()

print("n | SNR_q (dB)")
for n in [8, 12, 14, 16]:
    print(f"{n} | {6.02*n+1.76:.2f}")
```

## Decibéis e Orçamento de Enlace — Deduções Completas

### Conversão dB, dBm, dBW

$$
G_{\text{dB}} = 10\log_{10}\!\left(\frac{P_2}{P_1}\right),\quad
G_{\text{dB}} = 20\log_{10}\!\left(\frac{A_2}{A_1}\right)\ \text{(amplitude)}
$$

$$
P_{\text{dBm}} = 10\log_{10}\!\left(\frac{P}{1\,\text{mW}}\right),\quad
\boxed{P_{\text{dBm}} = P_{\text{dBW}} + 30}
$$

Exemplos: $2\,\text{W} = 33{,}01\,\text{dBm}$; $43\,\text{dBm} = 19{,}95\,\text{W}$; $-85\,\text{dBm} = 3{,}162\,\text{pW}$.

### Friis — Dedução completa

**Passo 1:** Densidade de potência isotrópica: $S = P_t/(4\pi d^2)$.

**Passo 2:** Com ganho: $S = P_t G_t/(4\pi d^2)$.

**Passo 3:** Potência recebida: $P_r = S\cdot A_{e,r}$.

**Passo 4:** Relação ganho-área:

$$
\boxed{G = \frac{4\pi}{\lambda^2}A_e}
$$

**Passo 5:** Friis:

$$
\boxed{P_r = P_t G_t G_r\left(\frac{\lambda}{4\pi d}\right)^2}
$$

**Forma em dB:**

$$
P_r[\text{dBm}] = P_t[\text{dBm}] + G_t + G_r - L_{fs}
$$

$$
L_{fs} = 32{,}45 + 20\log_{10}(d_{\text{km}}) + 20\log_{10}(f_{\text{MHz}})
$$

### Orçamento de enlace geral

$$
\boxed{P_r[\text{dBm}]=\text{EIRP}+G_r-L_{fs}-L_{\text{outros}}}
$$

$$
\boxed{M_{\text{disp}}=P_r-P_{\text{sens}},\qquad
M_{\text{res}}=M_{\text{disp}}-M_{\text{req}}}
$$

A margem requerida $M_{\text{req}}$ é um critério de projeto para acomodar desvanecimento e incertezas; não é uma perda física que também deva ser embutida em $P_r$. O enlace atende ao projeto quando $M_{\text{res}}\ge0$.

Perda de polarização: $L_{\text{pol}} = -20\log_{10}|\cos\theta|$.

### Exemplo numérico

$f=2{,}4\,\text{GHz}$, $d=10\,\text{km}$, $P_t=20\,\text{dBm}$, $G_t=G_r=15\,\text{dBi}$, perdas totais $3\,\text{dB}$ e margem requerida $10\,\text{dB}$. Suponha $P_{\text{sens}}=-100\,\text{dBm}$.

$L_{fs}=120{,}05\,\text{dB}$ e $\text{EIRP}=35\,\text{dBm}$ se as perdas forem todas contabilizadas depois da antena transmissora. Logo $P_r=35+15-120{,}05-3=-73{,}05\,\text{dBm}$. A margem disponível é $26{,}95\,\text{dB}$ e a residual após reservar 10 dB é $16{,}95\,\text{dB}$. Se parte dos 3 dB estiver antes da antena, deve-se retirá-la da EIRP e não subtraí-la novamente.

```python
import numpy as np
import matplotlib.pyplot as plt

c, f = 3e8, 2.4e9
wavelength = c/f
Pt, Gt, Gr, Lc, margin, Psens = 20, 15, 15, 3, 10, -100

dist_km = np.logspace(-1, 3, 500)
dist_m = dist_km * 1e3
Lfs = 20*np.log10(4*np.pi*dist_m/wavelength)
Pr = Pt + Gt + Gr - Lfs - Lc
margin_available = Pr - Psens
margin_residual = margin_available - margin

fig, axes = plt.subplots(2, 1, figsize=(9, 8))
axes[0].loglog(dist_km, 10**(Pr/10)*1e3, color='#2563eb', lw=2, label='$P_r(d)$')
axes[0].axhline(10**(Psens/10)*1e3, color='#dc2626', ls='--', lw=1.5, label=f'Sens ({Psens} dBm)')
axes[0].set_xlabel('Distância $d$ (km)'); axes[0].set_ylabel('Potência (mW)')
axes[0].set_title('Orçamento de Enlace: $P_r$ vs. Distância'); axes[0].grid(which='both', alpha=0.3)
axes[0].legend()

axes[1].semilogx(dist_km, margin_residual, color='#047857', lw=2)
axes[1].axhline(0, color='#dc2626', ls='--', lw=1.5, label='Margem zero')
axes[1].set_xlabel('Distância $d$ (km)'); axes[1].set_ylabel('Margem (dB)')
axes[1].set_title('Margem residual após reservar 10 dB'); axes[1].grid(which='both', alpha=0.3)
axes[1].legend(); axes[1].axhspan(-2, 2, alpha=0.15, color='yellow')

plt.tight_layout()
d_max = dist_km[np.where(margin_residual > 0)[0][-1]]
print(f"Distância máxima: {d_max:.1f} km")
```

## Ruído — Fundamentos Físicos Completos

### Ruído térmico — Dedução de Johnson-Nyquist

Movimento térmico aleatório de portadores. Pela teoria de Nyquist (1928):

$$
S_V(f) = 4k_BTR \Rightarrow \boxed{V_n^2 = 4k_BTRB}
$$

Potência disponível: $P_{\text{disponível}} = \dfrac{V_n^2}{4R} = k_BTB$ (não depende de $R$).

$$
\boxed{N_0 = k_B T}
$$

A $T_0 = 290\,\text{K}$: $N_0 = 4{,}004\times10^{-21}\,\text{W/Hz}$, $N_0[\text{dBm/Hz}] = -174\,\text{dBm/Hz}$.

$$
\boxed{N_0|_{290\text{K}} = -174\;\text{dBm/Hz}}
$$

### Figura de ruído

$$
\boxed{F = \frac{\text{SNR}_{\text{in}}}{\text{SNR}_{\text{out}}}} \ge 1,\quad \boxed{NF = 10\log_{10}F}
$$

Temperatura equivalente: $\boxed{T_e = T_0(F-1)}$. LNA com $NF=1\,\text{dB} \Rightarrow T_e = 75{,}1\,\text{K}$.

### Cascata — Dedução Friis para ruído

**Passo 1:** $N_{\text{in}} = k_B T_0 B$. **Passo 2:** $\text{SNR}_{\text{in}} = S_{\text{in}}/(k_B T_0 B)$.

**Passo 3:** Ruído próprio estágio 1: $N_{a1} = k_B T_0 B(F_1-1)$.

**Passo 4:** Saída estágio 1: $N_1 = k_B T_0 B\,G_1 F_1$.

**Passo 5:** Estágio 2: $N_2 = G_2 N_1 + k_B T_0 B(F_2-1)$.

**Passo 6–7:** Generalizando:

$$
\boxed{F_{\text{tot}} = F_1 + \frac{F_2-1}{G_1} + \frac{F_3-1}{G_1G_2} + \cdots + \frac{F_n-1}{G_1G_2\cdots G_{n-1}}}
$$

**Conclusão:** os primeiros estágios dominam. Convém colocar o LNA de baixo $F$ e ganho adequado o mais cedo possível, mas filtros de pré-seleção, duplexadores e proteção podem precisar vir antes dele. Suas perdas entram como fatores de ruído e devem ser minimizadas; “LNA sempre primeiro” não é uma regra física absoluta.

### Sensibilidade do receptor

$$
\boxed{P_{\text{sens}}[\text{dBm}] = -174 + 10\log_{10}B + NF + \text{SNR}_{\text{req}}[\text{dB}]}
$$

Exemplo: $B=1\,\text{MHz}$, $NF=5\,\text{dB}$, $\text{SNR}_{\text{req}}=10\,\text{dB} \Rightarrow P_{\text{sens}} = -99\,\text{dBm}$.

### SNR em modulações analógicas

**DSB-SC:** um detector coerente ideal preserva a SNR quando entrada e saída são comparadas usando bandas de ruído equivalentes. Um aparente fator 2 surge se a entrada contabiliza duas bandas laterais de ruído e a saída apenas uma banda-base; é uma mudança de banda de referência, não criação de SNR.

**FM:** para mensagem senoidal e a convenção de $N_0$ desta apostila,

$$\boxed{\text{SNR}_{\text{out}}=\frac32\beta^2(C/N)_W},\qquad B_{\text{FM}}\approx2W(1+\beta).$$

Se a entrada for medida na banda RF $B_r$, use $\text{SNR}_{out}=(3/2)\beta^2(B_r/W)\text{SNR}_{in,B_r}$. FM troca banda por SNR, mas a comparação só é válida depois de declarar a banda de referência.

**Cuidado:** Fórmula FM só vale acima do limiar de deteção (~10 dB).

```python
import numpy as np
import matplotlib.pyplot as plt

# Cascata de ruído
fig, ax = plt.subplots(figsize=(8, 5))
stages = ['LNA', 'Mixer', 'RF Amp', 'IF Amp', 'Demod.']
F_lin = np.array([1.259, 5.012, 6.310, 3.162, 10.000])
G_lin = np.array([15.85, 0.5, 3.162, 10.0, 1.0])

F_cum = np.zeros(5)
F_cum[0] = F_lin[0]
for i in range(1, 5):
    F_cum[i] = F_cum[i-1] + (F_lin[i]-1)/np.prod(G_lin[:i])

NF_cum = 10*np.log10(F_cum)
NF_dB = 10*np.log10(F_lin)
G_dB = 10*np.log10(G_lin)

x = np.arange(5)
width = 0.6
ax.bar(x, NF_cum, width, color='#2563eb', edgecolor='white', lw=1.2)
ax.set_xlabel('Estágio'); ax.set_ylabel('NF acumulada (dB)')
ax.set_title('Figura de Ruído em Cascata'); ax.set_xticks(x); ax.set_xticklabels(stages)
ax.grid(axis='y', alpha=0.3)
for i, nf in enumerate(NF_cum):
    ax.annotate(f'{nf:.1f} dB', (i, nf), textcoords='offset points', xytext=(0,10), ha='center',
                fontsize=9, color='#dc2626', weight='bold')
plt.tight_layout()

print("Estágio | NF(dB) | G(dB) | NF_acum(dB)")
for i in range(5):
    print(f"{stages[i]:7s} | {NF_dB[i]:6.1f} | {G_dB[i]:6.1f} | {NF_cum[i]:11.1f}")
```

## Capacidade de Shannon — Derivação Detalhada

### Teorema de Shannon-Hartley

$$
\boxed{C = B\log_2\!\left(1+\frac{P}{N_0B}\right) = B\log_2(1+\text{SNR})\ \text{bit/s}}
$$

**Dedução:** Discretização de Nyquist ($2B$ canais/seg), cada um $Y_i=X_i+Z_i$, $Z\sim\mathcal{N}(0,\sigma^2)$. Capacidade maximizada com entrada gaussiana:

$$
C_i = \tfrac{1}{2}\log_2\!\left(1+\frac{P_s}{\sigma^2}\right),\quad C = B\log_2\!\left(1+\frac{P}{N_0B}\right)
$$

### Relação com $E_b/N_0$

Substituindo $\text{SNR} = \frac{E_b}{N_0}\cdot\frac{R_b}{B} = \eta\frac{E_b}{N_0}$:

$$
\boxed{\eta < \log_2\!\left(1+\eta\frac{E_b}{N_0}\right)},\quad \boxed{\frac{E_b}{N_0} > \frac{2^{\eta}-1}{\eta}}
$$

### Limite fundamental: $E_b/N_0 \ge \ln 2 = -1{,}59\,\text{dB}$

L'Hôpital: $\lim_{\eta\to0}\dfrac{2^{\eta}-1}{\eta} = \ln 2 \approx 0{,}6931$.

Via $B\to\infty$: $C \to \dfrac{P}{N_0\ln 2} \Rightarrow E_b \to N_0\ln 2$.

$$
\boxed{\left(\frac{E_b}{N_0}\right)_{\min} = \ln 2 = -1{,}59\,\text{dB}}
$$

### Trade-off banda/energia

$$
\boxed{\left(\frac{E_b}{N_0}\right)_{\text{Shannon}} = \frac{2^{\eta}-1}{\eta}}
$$

$\eta=1\to0\,\text{dB}$, $\eta=3\to3{,}68\,\text{dB}$, $\eta=6\to10{,}21\,\text{dB}$.

### Códigos de correção de erro

| Código | Gap (dB) | Ano |
|--------|----------|-----|
| Hamming (7,4) | $\approx7$ | 1950 |
| Convolucional | $\approx2$ | 1967 |
| Turbo | $\approx0{,}5$ | 1993 |
| LDPC | $\approx0{,}01$ | 2000s |

### Gráfico $E_b/N_0$ vs $\eta$

```python
import numpy as np
import matplotlib.pyplot as plt

eta = np.linspace(0.01, 10, 500)
EbN0_dB = 10*np.log10((2**eta - 1)/eta)
EbN0_min = 10*np.log10(np.log(2))

fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(eta, EbN0_dB, color='#2563eb', lw=2.5, label='Limite de Shannon')
ax.axhline(EbN0_min, color='#dc2626', ls='--', lw=1.5, label=f'Limite inf: {EbN0_min:.2f} dB')
ax.axvline(1, color='#64748b', ls='--', alpha=0.5, label='$\\eta=1$')
ax.set_xlabel('Eficiência $\\eta$ (bit/s/Hz)'); ax.set_ylabel('$E_b/N_0$ mín. (dB)')
ax.set_title('Limite de Shannon: $E_b/N_0$ vs Eficiência Espectral'); ax.set_xlim(0,10); ax.set_ylim(-2,16)
ax.grid(alpha=0.3); ax.legend()
ax.annotate('BPSK ($\\eta=1$)', xy=(1,0), xytext=(2.5,3), arrowprops=dict(arrowstyle='->'), fontsize=9, color='#dc2626')
plt.tight_layout()
```

### Limitações práticas

Códigos infinitos $\Rightarrow$ latência infinita. Cada $0{,}5$ dB de aproximação custa $\sim 10\times$ em complexidade.

## Modulações Analógicas vs. Digitais — Comparação Rigorosa

### AM

$$
s_{\text{AM}}(t) = A_c[1+\mu\,m(t)]\cos(2\pi f_c t),\quad P_T = P_c\!\left(1+\frac{\mu^2}{2}\right),\quad B_{\text{AM}} = 2f_m
$$

$P_c$ não carrega informação (desperdício). $\text{SNR}_{\text{out}} \le \text{SNR}_{\text{in}}$. Sem ganho de processamento.

### FM

$$
s_{\text{FM}}(t) = A_c\cos\!\left(2\pi f_c t + 2\pi k_f\!\int_0^t m(\tau)\,d\tau\right)
$$

$$
B_{\text{FM}}\approx2f_m(1+\beta),\quad
\boxed{\text{SNR}_{\text{out}}^{\text{FM}}=\frac32\beta^2(C/N)_{f_m}}
$$

Acima do limiar. Abaixo de $\sim10\,\text{dB}$, colapso catastrófico (threshold effect).

### PCM vs. PAM vs. DM

| | PAM | PCM | DM |
|--|-----|-----|-----|
| Tipo | Analógico | Digital | Digital |
| Amplitude | Contínua | $n$ bits | 1-bit |
| Banda | $f_s/2$ | $nf_s/2$ | Alta |
| Imunidade | Baixa | Alta | Média |
| SNR | Limitado | $6n+1{,}76$ dB | $\sim10\log_{10}(3f_s/2f_m)$ |

### Vantagens digitais

1. **Regeneração** — sem acúmulo de ruído
2. **Criptografia** — dados nativamente cifráveis
3. **Multiplexação** — TDM natural
4. **Correção de erros** — BER arbitrariamente baixo
5. **Flexibilidade** — mesma infraestrutura para voz/dados/vídeo

### Desvantagens digitais

1. **Banda** — geralmente maior
2. **Complexidade** — A/D, codificação, sincronismo
3. **Latência** — codificação/decodificação
4. **SNR mínimo** — limiar de demodulação

### Tabela comparativa

| | AM | DSB-SC | FM | BPSK | QPSK | 16-QAM |
|--|----|--------|----|------|------|--------|
| $\eta$ | $f_m/2f_m$ | $f_m/2f_m$ | $f_m/2f_m(1+\beta)$ | $0{,}5$ | $1{,}0$ | $2{,}0$ |
| $E_b/N_0$ BER=$10^{-5}$ | — | — | $\sim10$ dB | $9{,}6$ dB | $12{,}6$ dB | $19{,}6$ dB |
| Imunidade | Baixa | Média | Alta | Média | Média | Baixa |
| Regenerável | Não | Sim | Não | Sim | Sim | Sim |

## Exercícios Resolvidos em Python

### Protocolo computacional

**Objetivo:** fechar orçamentos de enlace, quantização, cascatas de ruído e limites de Shannon. **Unidades:** faça conversões dB/dBm apenas nas fronteiras do cálculo e mantenha grandezas lineares internamente. **Validação:** confira casos-limite, margem do enlace e o limite $E_b/N_0\ge\ln2$.

### Exercício 1: Orçamento de enlace com fade margins

```python
import numpy as np
import matplotlib.pyplot as plt

c, f = 3e8, 5.8e9
wavelength = c/f
EIRP = 30 + 12 - 1  # Pt=30 dBm, Gt=12 dBi, Lcable=1 dB
Gr, Lcr, NF = 20, 1, 3
Psens = -174 + 10*np.log10(1e6) + NF + 10  # B=1 MHz, SNR_req=10 dB

dist_km = np.logspace(0, 2, 500)
Lfs = 20*np.log10(4*np.pi*dist_km*1e3/wavelength)

fig, axes = plt.subplots(2, 2, figsize=(12, 9))
margins = [0, 5, 10, 15]
colors = ['#2563eb','#047857','#dc2626','#9333ea']
for i, mf in enumerate(margins):
    Pr = EIRP + Gr - Lfs - Lcr - mf
    ax = axes[i//2, i%2]
    ax.semilogx(dist_km, Pr, 'o-', label=f'$P_r$ (M={mf} dB)', color=colors[i])
    ax.axhline(Psens, color='k', ls='--', alpha=0.6, label='Sens.')
    ax.set_xlabel('Distância $d$ (km)'); ax.set_ylabel('$P_r$ (dBm)')
    ax.set_title(f'Margem Fade = {mf} dB'); ax.grid(alpha=0.3); ax.legend(fontsize=8)

axes[1,1].semilogx(dist_km, EIRP+Gr-Lfs-Lcr-Psens, 'o-', color='#2563eb')
axes[1,1].axhline(0, color='r', ls='--')
axes[1,1].set_xlabel('Distância $d$ (km)'); axes[1,1].set_ylabel('Margem (dB)')
axes[1,1].set_title('Margem de Enlace'); axes[1,1].grid(alpha=0.3)
plt.tight_layout()

print("M(fade)| Dist. máx (km)")
for mf in margins:
    Pr_tmp = EIRP + Gr - Lfs - Lcr - mf
    mask = Pr_tmp > Psens
    print(f"  {mf:2d} dB   |  {dist_km[mask][-1]:7.1f} km" if np.any(mask) else f"  {mf:2d} dB   |  --")
```

### Exercício 2: SNR de quantização PCM — Teórico vs. Simulado

```python
import numpy as np
import matplotlib.pyplot as plt

n_theo = np.arange(2, 17)
snr_theo = 6.02*n_theo + 1.76

np.random.seed(42)
n_sim = [4, 6, 8, 10, 12, 14]
snr_sim = []
for nb in n_sim:
    sig = np.random.uniform(-0.5, 0.5, 10**6)
    step = 1.0 / (2**nb)
    quant = np.round(sig / step) * step
    err = sig - quant
    snr_sim.append(10*np.log10(np.mean(sig**2) / np.mean(err**2)))

fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(n_theo, snr_theo, '-', color='#2563eb', lw=2.5, label='$6{,}02n+1{,}76$ dB')
ax.scatter(n_sim, snr_sim, color='#dc2626', s=80, zorder=3, label='Monte Carlo', edgecolors='white')
ax.set_xlabel('Bits $n$'); ax.set_ylabel('SNR (dB)')
ax.set_title('SNR de Quantização PCM: Teórico vs. Simulado')
ax.legend(); ax.grid(alpha=0.3)
for ni, si in zip(n_sim, snr_sim):
    ax.annotate(f'  {si:.1f} dB', (ni, si), textcoords='offset points', xytext=(-25,8),
                fontsize=9, color='#dc2626', weight='bold')
plt.tight_layout()
```

### Exercício 3: Cascata de ruído — LNA/mixer/RF amp

```python
import numpy as np
import matplotlib.pyplot as plt

stages = ['LNA', 'Mixer', 'RF Amp', 'IF Amp', 'Demod.']
F = np.array([1.259, 5.012, 6.310, 3.162, 10.000])  # 1,7,8,5,10 dB
G = np.array([15.85, 0.5, 3.162, 10.0, 1.0])         # 12,-3,5,10,0 dB

F_cum = np.zeros(5)
F_cum[0] = F[0]
for i in range(1, 5):
    F_cum[i] = F_cum[i-1] + (F[i]-1)/np.prod(G[:i])

NF_cum = 10*np.log10(F_cum)
B = 1e6
Psens = -174 + 10*np.log10(B) + NF_cum[-1] + 10

fig, ax = plt.subplots(figsize=(8, 5))
x = np.arange(5)
ax.bar(x, NF_cum, 0.6, color='#2563eb', edgecolor='white', lw=1.2)
ax.axhline(-174+10*np.log10(B), color='#dc2626', ls='--', alpha=0.6, label='Piso ruído')
ax.set_xlabel('Estágio'); ax.set_ylabel('NF acumulada (dB)')
ax.set_title('Figura de Ruído em Cascata'); ax.set_xticks(x); ax.set_xticklabels(stages)
ax.grid(axis='y', alpha=0.3)
ax.legend()
for i, nf in enumerate(NF_cum):
    ax.annotate(f'{nf:.1f}', (i, nf), textcoords='offset points', xytext=(0,10), ha='center',
                fontsize=9, color='#dc2626', weight='bold')
plt.tight_layout()

print(f"Sensibilidade do receptor: {Psens:.1f} dBm")
```

### Exercício 4: Capacidade de Shannon vs. Eb/N0

```python
import numpy as np
import matplotlib.pyplot as plt

eta = np.linspace(0.01, 10, 500)
EbN0_Shannon = (2**eta - 1) / eta
EbN0_Shannon_dB = 10*np.log10(EbN0_Shannon)

# BER para BPSK, QPSK, 16-QAM (aproximações)
from scipy.stats import norm
EbN0_linear_BPSK = np.linspace(0.01, 20, 500)
EbN0_dB_BPSK = 10*np.log10(EbN0_linear_BPSK)
from scipy.special import erf
BER_BPSK = 0.5 * (1 - erf(np.sqrt(EbN0_linear_BPSK)))

fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Esquerda: Eb/N0 vs eta
axes[0].plot(eta, EbN0_Shannon_dB, color='#2563eb', lw=2.5, label='Limite Shannon')
axes[0].axhline(-1.59, color='#dc2626', ls='--', label='-1.59 dB')
axes[0].axvline(1, color='#64748b', ls='--', alpha=0.5, label='$\\eta=1$')
axes[0].set_xlabel('Eficiência $\\eta$ (bit/s/Hz)'); axes[0].set_ylabel('$E_b/N_0$ (dB)')
axes[0].set_title('Limite de Shannon'); axes[0].set_xlim(0,10); axes[0].set_ylim(-2,16)
axes[0].grid(alpha=0.3); axes[0].legend(); axes[0].axhline(0, ls=':', alpha=0.3)

# Direita: BER vs Eb/N0 para BPSK
axes[1].semilogy(EbN0_dB_BPSK, BER_BPSK, color='#2563eb', lw=2.5, label='BPSK (coerente)')
axes[1].axhline(1e-3, color='#dc2626', ls='--', alpha=0.6, label='BER = 10⁻³')
axes[1].axhline(1e-6, color='#047857', ls='--', alpha=0.6, label='BER = 10⁻⁶')
axes[1].set_xlabel('$E_b/N_0$ (dB)'); axes[1].set_ylabel('BER')
axes[1].set_title('BER de BPSK vs. $E_b/N_0$'); axes[1].grid(alpha=0.3, which='both')
axes[1].legend()

# Encontrar Eb/N0 para BER=10^-5 em BPSK
idx_1e5 = np.argmin(np.abs(BER_BPSK - 1e-5))
print(f"BPSK: BER=10^-5 em Eb/N0 = {EbN0_dB_BPSK[idx_1e5]:.1f} dB")
print(f"Shannon para eta=1: Eb/N0 = 0 dB")
print(f"Gap: {EbN0_dB_BPSK[idx_1e5]:.1f} dB")

plt.tight_layout()
```

## Lista de Exercícios Propostos

**E1.** (Numérico) Converta as seguintes potências:
a) $15\,\text{W}$ em dBm.
b) $-50\,\text{dBm}$ em watts.
c) $100\,\text{mW}$ em dBW.

**E2.** (Numérico) Um enlace de micro-ondas opera a $6\,\text{GHz}$ com $d=40\,\text{km}$. $P_t=23\,\text{dBm}$, $G_t=G_r=32\,\text{dBi}$ e há $2{,}5\,\text{dB}$ de perda em cada cabo terminal. A margem de fade requerida é 12 dB. Calcule $P_r$, a margem disponível e a margem residual se $P_{\text{sens}}=-90\,\text{dBm}$.

**E3.** (Teórico) Derive a equação de Friis do espaço livre partindo do conceito de densidade de potência e da relação $G = \frac{4\pi}{\lambda^2}A_e$. Mostre cada passo explicitamente.

**E4.** (Numérico) Para o código Hamming $(7,4)$, codifique a palavra $1011$ e determine os 3 bits de paridade. Suponha erro no 3º bit do codeword; calcule a síndrome e verifique que o erro é corrigido.

**E5.** (Numérico) Três estágios em cascata: LNA ($G=20\,\text{dB}$, $NF=1{,}5\,\text{dB}$), Mixer ($G=-5\,\text{dB}$, $NF=8\,\text{dB}$), RF Amplifier ($G=15\,\text{dB}$, $NF=4\,\text{dB}$). Calcule a figura de ruído total e a temperatura equivalente.

**E6.** (Teórico) Demonstre que, para o limite de Shannon, $\lim_{B\to\infty} C = \dfrac{P}{N_0\ln 2}$ e que isso implica $E_b/N_0 > \ln 2 = -1{,}59\,\text{dB}$.

**E7.** (Numérico) Um sistema FM com $\Delta f=50\,\text{kHz}$ e tom $f_m=W=5\,\text{kHz}$ opera com $(C/N)_W=20\,\text{dB}$. Calcule $\beta$, a banda de Carson e a SNR de saída acima do limiar. Compare sua banda com AM de mesma $W$.

**E8.** (Conceitual) Explique por que o LNA deve vir sempre primeiro no receptor, usando a fórmula de Friis para cascata. Dê um exemplo numérico comparando duas configurações: (a) LNA primeiro, (b) Mixer primeiro.

**E9.** (Numérico) Calcule a capacidade de Shannon para $B=10\,\text{MHz}$ e $\text{SNR}=30\,\text{dB}$. Qual seria a $E_b/N_0$ necessária? Compare com o limite fundamental.

**E10.** (Conceitual) Compare as modulações FM e BPSK em termos de: eficiência espectral, imunidade a ruído, complexidade, regenerabilidade, e aplicação típica. Justifique por que FM foi substituída por QPSK/16-QAM em sistemas modernos de banda larga.

**E11.** (Numérico) Para PCM com $f_s=8\,\text{kHz}$ (voz), determine o número mínimo de bits $n$ para atingir $\text{SNR}_q \ge 42\,\text{dB}$. Calcule a taxa de bits resultante e a largura de banda mínima Nyquist.

**E12.** (Desafio) Mostre que, para uma fonte de entropia $H(X)$, o código de Huffman atinge $\bar{L} < H(X)+1$. Construa o código de Huffman para uma fonte com distribuição $\{0{,}40, 0{,}25, 0{,}15, 0{,}10, 0{,}05\}$ e verifique o limite.

## Gabarito

**E1.**
a) $10\log_{10}(15000) = 41{,}76\,\text{dBm}$.
b) $10^{-50/10}\,\text{mW} = 10^{-5}\,\text{mW} = 10^{-8}\,\text{W} = 10\,\text{nW}$.
c) $10\log_{10}(0{,}1) = -10\,\text{dBW}$.

**E2.** $f=6\,\text{GHz}$, $d=40\,\text{km}$:

$$
L_{fs} = 32{,}45 + 20\log_{10}(40) + 20\log_{10}(6000) = 32{,}45 + 32{,}04 + 75{,}56 = 140{,}05\,\text{dB}
$$

$\text{EIRP} = 23 + 32 - 2{,}5 = 52{,}5\,\text{dBm}$.

$$
P_r=52{,}5+32-140{,}05-2{,}5=-58{,}05\,\text{dBm}.
$$

A margem disponível é $-58{,}05-(-90)=31{,}95$ dB. Depois de reservar 12 dB para fade, a margem residual é $31{,}95-12=\boxed{19{,}95\,\text{dB}}$. A margem requerida não é subtraída de $P_r$.

**E3.** Ver Seção “Friis — Dedução completa”. Dedução passo a passo a partir de $S = P_tG_t/(4\pi d^2)$ e $P_r = S\cdot A_e$, com $A_e = \frac{\lambda^2}{4\pi}G_r$, resulta em $P_r = P_tG_tG_r\left(\frac{\lambda}{4\pi d}\right)^2$.

**E4.** Dados: $d_1=1,d_2=0,d_3=1,d_4=1$. Paridades (Hamming (7,4)):

$p_1 = d_1\oplus d_2\oplus d_4 = 1\oplus0\oplus1 = 0$
$p_2 = d_1\oplus d_3\oplus d_4 = 1\oplus1\oplus1 = 1$
$p_3 = d_2\oplus d_3\oplus d_4 = 0\oplus1\oplus1 = 0$

Codeword: $1011\,010$. Com erro no 3º bit: $1001010$. Síndrome: $s = H\vec{c}'^T$. A terceira coluna de $H$ é $(0,1,1)^T = 3$, indicando erro no bit 3. Corrigindo: volta a $1011010$.

**E5.** Convertendo para linear: $G_1=100$, $F_1=1{,}413$; $G_2=0{,}316$, $F_2=6{,}310$; $G_3=31{,}62$, $F_3=2{,}512$.

$$
F_{\text{tot}} = 1{,}413 + \frac{6{,}310-1}{100} + \frac{2{,}512-1}{100\cdot0{,}316} = 1{,}413 + 0{,}0531 + 0{,}0795 = 1{,}546
$$

$NF_{\text{tot}} = 10\log_{10}(1{,}546) = 1{,}89\,\text{dB}$.

$T_e = 290(1{,}546-1) = 158{,}3\,\text{K}$.

**E6.** Via L'Hôpital: $\lim_{\eta\to0}\dfrac{2^{\eta}-1}{\eta} = \ln 2$. Via $B\to\infty$: $C = B\ln\!\left(1+\frac{P}{N_0B}\right) \approx B\cdot\dfrac{P}{N_0B}\cdot\dfrac{1}{\ln 2} \to \dfrac{P}{N_0\ln 2}$. Logo $E_b = P/C \to N_0\ln 2$, $E_b/N_0 \to \ln 2$.

**E7.** $\beta = 50/5 = 10$. $B_{\text{FM}} = 2\cdot5(1+10) = 110\,\text{kHz}$.

Como $(C/N)_W=10^{20/10}=100$, $\text{SNR}_{out}=(3/2)\beta^2(C/N)_W=1{,}5(100)(100)=15000$, ou $41{,}76\,\text{dB}$. O ganho referido a $(C/N)_W$ é $21{,}76$ dB. AM ocupa $2W=10$ kHz; FM ocupa 110 kHz, portanto a razão de bandas é 11.

**E8.** Por Friis: $F_{\text{tot}} \approx F_1 + (F_2-1)/G_1$. Se LNA primeiro com $G_1=100$, $(F_2-1)/100 \approx 0{,}053$. Se mixer primeiro com $G_1=0{,}316$, $(F_2-1)/0{,}316 \approx 19$. A diferença é enorme.

**E9.** $C = 10^7\log_2(1+1000) = 10^7\log_2(1001) \approx 99{,}7\,\text{Mbit/s}$.

$\text{SNR}=1000$ e, operando em $R_b=C$, $\eta=C/B\approx9{,}967$. Assim, $E_b/N_0=\text{SNR}/\eta\approx100{,}33$, ou $20{,}01$ dB. Pela fronteira de Shannon, $(2^\eta-1)/\eta=1000/9{,}967\approx100{,}33$: os valores coincidem porque escolhemos exatamente $R_b=C$. Uma implementação prática opera abaixo da capacidade.

**E10.** FM: alta imunidade, baixa eficiência espectral. BPSK/QPSK: boa imunidade, alta eficiência, regenerável, criptografável. FM é analógica (não regenerável), ocupa banda proporcional a $\beta$, não é digital (não há correção de erros). Sistemas de banda larga exigem $\eta$ alto (QPSK, 16-QAM, etc.) e tolerância a erro via código — impossível com FM.

**E11.** $6{,}02n+1{,}76 \ge 42 \Rightarrow n \ge 6{,}69 \Rightarrow n=7$ bits. $R_b = 8000\times7 = 56\,\text{kbit/s}$. $B_{\min} = 28\,\text{kHz}$ (Nyquist).

**E12.** Huffman: $\{0{,}40\to0,\; 0{,}25\to10,\; 0{,}15\to110,\; 0{,}10\to1110,\; 0{,}05\to1111\}$.

$\bar{L} = 0{,}40(1)+0{,}25(2)+0{,}15(3)+0{,}10(4)+0{,}05(4) = 0{,}40+0{,}50+0{,}45+0{,}40+0{,}20 = 1{,}95$ bits/símbolo.

$H = -\sum p_i\log_2 p_i = 0{,}40(1{,}322)+0{,}25(2)+0{,}15(2{,}737)+0{,}10(3{,}322)+0{,}05(4{,}322) = 0{,}529+0{,}500+0{,}411+0{,}332+0{,}216 = 1{,}988$ bits/símbolo.

$\bar{L} = 1{,}95 < 1{,}988+1 = 2{,}988$. Verificado.
