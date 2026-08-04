# Antenas

Antenas conectam grandezas de circuito a campos eletromagnéticos. Em EMC, raramente são apenas componentes intencionais: fios, trilhas, cabos, aberturas e laços de corrente também irradiam e recebem energia. Os modelos elementares permitem estimar quais dimensões, correntes e frequências dominam.

## Sumário

1. [Dipolo elétrico elementar (Hertziano)](#dipolo-elétrico-elementar-hertziano)
2. [Dipolo magnético ou pequeno laço](#dipolo-magnético-ou-pequeno-laço)
3. [Dipolo de meia onda e monopolo de quarto de onda](#dipolo-de-meia-onda-e-monopolo-de-quarto-de-onda)
4. [Região próxima e distante](#região-próxima-e-distante)
5. [Diretividade, ganho e potência](#diretividade-ganho-e-potência)
6. [Abertura efetiva e fator de antena](#abertura-efetiva-e-fator-de-antena)
7. [Equação de Friis](#equação-de-friis)
8. [Reflexões e multipercurso](#reflexões-e-multipercurso)
9. [Antenas de medição de banda larga](#antenas-de-medição-de-banda-larga)
10. [Aplicação ao projeto EMC](#aplicação-ao-projeto-emc)
11. [Teoremas e provas](#teoremas-e-provas)
12. [Exemplo resolvido — Enlace ideal](#exemplo-resolvido--enlace-ideal)
13. [Exemplo resolvido — Fator de antena](#exemplo-resolvido--fator-de-antena)
14. [Insight: campos próximos não obedecem à intuição de onda plana](#insight-campos-próximos-não-obedecem-à-intuição-de-onda-plana)
15. [Exercícios](#exercícios)
16. [Respostas selecionadas](#respostas-selecionadas)
17. [Exemplo numérico adicional — Campo de dipolo hertziano](#exemplo-numérico-adicional--campo-de-dipolo-hertziano)
18. [Código Python — Padrão de radiação do dipolo de meia onda](#código-python--padrão-de-radiação-do-dipolo-de-meia-onda)
19. [Código Python — Campo elétrico vs. distância](#código-python--campo-elétrico-vs-distância)
20. [Exemplo numérico adicional — Potência radiada e resistência de radiação](#exemplo-numérico-adicional--potência-radiada-e-resistência-de-radiação)
21. [Separação dos termos de campo](#separação-dos-termos-de-campo)
22. [Reciprocidade e abertura efetiva](#reciprocidade-e-abertura-efetiva)
23. [Referência principal](#referência-principal)

## Dipolo elétrico elementar (Hertziano)

### Por que um dipolo curto irradia?

Um condutor curto de comprimento $l\ll\lambda$, percorrido por corrente senoidal $I_0$, é aproximado por um dipolo hertziano. No campo distante, o campo elétrico é proporcional a

$$|E_\theta|\propto \frac{\eta\,k I_0l}{4\pi r}\sin\theta,$$

onde $k=2\pi/\lambda$, $\eta$ é a impedância do meio e $r$ a distância. A radiação cresce com frequência, corrente e comprimento elétrico. É máxima perpendicularmente ao fio e nula sobre seu eixo.

> **Insight para Estudantes**: Um fio DC não irradia porque as cargas se movem uniformemente, sem aceleração. Mas um fio com corrente alternada tem cargas acelerando e desacelerando continuamente — e cargas aceleradas irradiam energia eletromagnética, conforme as equações de Maxwell.

### Derivação dos campos do dipolo hertziano

**Teorema**: Para um dipolo hertziano de comprimento $dl$ com corrente fasorial $\hat{I}$, os componentes do campo magnético e elétrico são:

$$\hat{H}_f=\frac{\hat{I}\,dl}{4\pi}\beta_0^2\sin\theta\left(j\frac{1}{\beta_0r}+\frac{1}{\beta_0^2r^2}\right)e^{-j\beta_0r},$$

$$\hat{E}_r=\frac{2\hat{I}\,dl}{4\pi}\eta_0\beta_0^2\cos\theta\left(\frac{1}{\beta_0^2r^2}-\frac{j}{\beta_0^3r^3}\right)e^{-j\beta_0r},$$

$$\hat{E}_\theta=\frac{\hat{I}\,dl}{4\pi}\eta_0\beta_0^2\sin\theta\left(j\frac{1}{\beta_0r}+\frac{1}{\beta_0^2r^2}-\frac{j}{\beta_0^3r^3}\right)e^{-j\beta_0r}.$$

**Prova**: A partir da função vetor potencial $\hat{\mathbf{A}}=\frac{\mu_0\hat{I}dl}{4\pi r}e^{-j\beta_0r}\hat{z}$, aplicam-se as relações $\hat{\mathbf{H}}=\frac{1}{\mu_0}\nabla\times\hat{\mathbf{A}}$ e $\hat{\mathbf{E}}=\frac{1}{j\omega\varepsilon_0}\nabla\times\hat{\mathbf{H}}$ em coordenadas esféricas. $\square$

No campo distante, retêm-se apenas os termos $1/r$:

$$\hat{E}_\theta=j\frac{\eta_0\beta_0\hat{I}dl}{4\pi}\frac{e^{-j\beta_0r}}{r}\sin\theta,\qquad \hat{H}_\phi=\frac{\hat{E}_\theta}{\eta_0}.$$

## Dipolo magnético ou pequeno laço

Um laço de área $A\ll\lambda^2$, com corrente $I_0$, comporta-se como dipolo magnético. No campo distante,

$$|E_\phi|\propto \frac{\eta\,k^2 I_0A}{4\pi r}\sin\theta.$$

Reduzir a área do laço é, portanto, uma das medidas mais eficazes contra emissão diferencial e acoplamento magnético. Aproximar sinal e retorno reduz simultaneamente área e indutância.

### Resistência de radiação do laço

**Teorema**: A resistência de radiação de um pequeno laço de área $A$ é

$$R_{rad}=31170\left(\frac{A}{\lambda^2}\right)^2\ \Omega.$$

**Prova**: A potência radiada total é obtida integrando o vetor de Poynting médio sobre uma esfera. Para um laço com momento magnético $\hat{m}=\hat{I}A$, a potência radiada é $P_{rad}=\frac{\eta_0\beta_0^4|\hat{m}|^2}{12\pi}$. Como $P_{rad}=\frac{1}{2}|\hat{I}|^2 R_{rad}$ e $\beta_0=2\pi/\lambda$, resulta $R_{rad}=31170(A/\lambda^2)^2$. $\square$

## Dipolo de meia onda e monopolo de quarto de onda

Um dipolo de comprimento próximo a $\lambda/2$ apresenta distribuição aproximadamente senoidal de corrente e radiação eficiente. Um monopolo de $\lambda/4$ sobre plano condutor usa sua imagem elétrica e produz padrão equivalente a meio dipolo. Cabos conectados a equipamentos podem se aproximar dessas ressonâncias e converter pequena corrente de modo comum em emissão intensa.

### Distribuição de corrente no dipolo

A corrente ao longo de um dipolo de comprimento total $l$ segue aproximadamente

$$\hat{I}(z)=\hat{I}_m\sin\left[\beta_0\left(\frac{l}{2}-|z|\right)\right].$$

Para um dipolo de meia onda, $l=\lambda/2$, a corrente de entrada é $\hat{I}_m$ e a resistência de radiação é $R_{rad}\approx73\ \Omega$. Para um monopolo de quarto de onda, $R_{rad}\approx36{,}5\ \Omega$.

## Região próxima e distante

O campo próximo contém energia armazenada e depende do tipo de fonte. Perto de um dipolo elétrico, a razão $|E/H|$ tende a ser alta; perto de um laço magnético, baixa. No campo distante, os campos são transversais e

$$\frac{|E|}{|H|}=\eta\approx377\ \Omega$$

no espaço livre. Para uma antena de maior dimensão $D$, um critério comum para campo distante é $r\gtrsim2D^2/\lambda$, além de $r\gg\lambda/(2\pi)$ para fontes pequenas.

## Diretividade, ganho e potência

A densidade média de potência no campo distante é dada pelo vetor de Poynting. A intensidade de radiação $U$ leva à diretividade

$$D(\theta,\phi)=\frac{4\pi U(\theta,\phi)}{P_{rad}}.$$

O ganho inclui a eficiência $e_r$:

$$G=e_rD.$$

Diretividade descreve a forma do padrão; ganho inclui perdas. Polarização e orientação também importam: antenas ortogonalmente polarizadas apresentam grande perda por descasamento ideal, embora reflexões e cabos reduzam essa vantagem na prática.

## Abertura efetiva e fator de antena

A potência disponível em uma antena receptora casada é

$$P_r=S\,A_e,$$

e ganho e abertura efetiva se relacionam por

$$A_e=\frac{\lambda^2G}{4\pi}.$$

Em medições de EMC, o fator de antena converte tensão no receptor em campo:

$$AF=\frac{E}{V},\qquad AF_{dB/m}=E_{dB\mu V/m}-V_{dB\mu V}.$$

Perdas de cabo, pré-amplificador, atenuadores e mismatch devem entrar na cadeia de correção.

## Equação de Friis

No espaço livre, campo distante, alinhamento de polarização e impedâncias casadas,

$$P_r=P_tG_tG_r\left(\frac{\lambda}{4\pi r}\right)^2.$$

A equação não deve ser aplicada diretamente no campo próximo nem em ambientes com multipercurso sem considerar suas hipóteses.

## Reflexões e multipercurso

Uma onda refletida soma-se vetorialmente à direta. Plano de terra, paredes e objetos criam máximos e mínimos dependentes de frequência, altura, polarização e posição. O método das imagens modela geometrias simples. Em ensaios, varredura de altura da antena e rotação do equipamento procuram a combinação de maior emissão.

## Antenas de medição de banda larga

- **Bicônica:** banda larga, geralmente usada em frequências mais baixas; sensível a geometria e balun.
- **Log-periódica:** propriedades aproximadamente periódicas em log de frequência e ganho moderado numa banda larga.
- **Antenas híbridas:** combinam regiões para reduzir trocas, mas exigem calibração cuidadosa.

Baluns reduzem corrente indesejada no exterior do cabo coaxial. Pads melhoram o casamento e a repetibilidade ao custo de sensibilidade. O fator de antena deve vir de calibração rastreável para a configuração aplicável.

## Aplicação ao projeto EMC

- Reduzir comprimento elétrico de condutores com corrente de modo comum.
- Minimizar áreas de laço de correntes diferenciais.
- Posicionar filtros e conexão de blindagem na entrada do cabo.
- Evitar stubs e ressonâncias de cabos.
- Usar sondas de campo próximo para localizar a fonte, sem confundir amplitude local com emissão distante.
- Avaliar polarização, orientação e plano de referência na medição.

## Teoremas e provas

**Teorema (Diretividade do dipolo hertziano)**: Para um dipolo hertziano de comprimento $dl\ll\lambda$ com corrente $I_0$, a diretividade é

$$D(\theta,\phi)=1{,}5\sin^2\theta.$$

**Prova**: No campo distante, o campo elétrico é $\hat{E}_\theta=j\frac{\eta_0\beta_0\hat{I}dl}{4\pi}\frac{e^{-j\beta_0r}}{r}\sin\theta$. A densidade de potência média é dada pelo vetor de Poynting:

$$S_r=\frac{1}{2}\text{Re}(\hat{E}_\theta\hat{H}_\phi^*)=\frac{1}{2\eta_0}|\hat{E}_\theta|^2=\frac{\eta_0\beta_0^2|\hat{I}dl|^2}{32\pi^2r^2}\sin^2\theta.$$

A intensidade de radiação é $U=r^2S_r=\frac{\eta_0\beta_0^2|\hat{I}dl|^2}{32\pi^2}\sin^2\theta$. A potência radiada total é obtida integrando sobre uma esfera:

$$P_{rad}=\int_0^{2\pi}\int_0^\pi U\sin\theta\,d\theta\,d\phi=\frac{\eta_0\beta_0^2|\hat{I}dl|^2}{32\pi^2}2\pi\int_0^\pi\sin^3\theta\,d\theta.$$

Como $\int_0^\pi\sin^3\theta\,d\theta=4/3$, tem-se $P_{rad}=\frac{\eta_0\beta_0^2|\hat{I}dl|^2}{12\pi}$. A diretividade é

$$D(\theta)=\frac{4\pi U(\theta)}{P_{rad}}=\frac{4\pi\cdot\frac{\eta_0\beta_0^2|\hat{I}dl|^2}{32\pi^2}\sin^2\theta}{\frac{\eta_0\beta_0^2|\hat{I}dl|^2}{12\pi}}=\frac{3}{2}\sin^2\theta=1{,}5\sin^2\theta.$\square$

**Teorema (Equação de Friis a partir do vetor de Poynting e abertura efetiva)**: No espaço livre, campo distante, alinhamento de polarização e impedâncias casadas,

$$P_r=P_tG_tG_r\left(\frac{\lambda}{4\pi r}\right)^2.$$

**Prova**: A densidade de potência na distância $r$ de uma antena transmissora com potência $P_t$ e ganho $G_t$ é

$$S=\frac{P_tG_t}{4\pi r^2}.$$

A potência recebida por uma antena receptora com abertura efetiva $A_e$ é $P_r=S\,A_e$. Para a antena receptora, $A_e=\lambda^2G_r/(4\pi)$. Substituindo,

$$P_r=\frac{P_tG_t}{4\pi r^2}\cdot\frac{\lambda^2G_r}{4\pi}=P_tG_tG_r\left(\frac{\lambda}{4\pi r}\right)^2.$\square$

**Teorema**: Para qualquer antena recíproca, ganho e abertura efetiva máxima se relacionam por

$$A_e=\frac{\lambda^2G}{4\pi}.$$

**Prova**: Considere duas antenas em espaço livre e aplique a equação de Friis nos dois sentidos. A densidade de potência na recepção é $S=P_tG_t/(4\pi r^2)$ e $P_r=SA_e$. Igualando a $P_tG_tG_r(\lambda/4\pi r)^2$, resulta $A_e=\lambda^2G_r/(4\pi)$. A reciprocidade permite a mesma relação em transmissão. $\square$

**Corolário**: Para ganho fixo, a abertura efetiva diminui com $f^2$. Uma antena fisicamente pequena precisa de compromisso entre eficiência, casamento e largura de banda.

## Exemplo resolvido — Enlace ideal

Um transmissor entrega 10 mW a uma antena de ganho 2; a receptora tem ganho 3. A frequência é 300 MHz, logo $\lambda=1$ m, e $r=10$ m:

$$P_r=0{,}01(2)(3)\left(\frac{1}{4\pi10}\right)^2=3{,}80\ \mu\text{W}.$$

Em dBm, $P_r\approx-24{,}2$ dBm. Esse valor só é válido no campo distante, com polarizações alinhadas, ausência de multipercurso e casamento incorporado aos ganhos realizados.

## Exemplo resolvido — Fator de antena

O receptor indica 42 dBµV. O cabo perde 3 dB e o fator de antena é 18 dB/m. Corrigindo a tensão no terminal da antena:

$$E=42+3+18=63\ \text{dBµV/m}.$$

Se houver pré-amplificador de 20 dB, seu ganho deve ser subtraído.

## Insight: campos próximos não obedecem à intuição de onda plana

Uma sonda de campo elétrico e uma de campo magnético podem indicar mapas muito diferentes perto da PCB. Isso não é contradição: energia reativa domina e $E/H$ depende da fonte. A extrapolação direta de uma leitura de campo próximo para 3 m é, em geral, inválida sem modelo ou correlação.

## Lista de Exercícios Propostos

**E.1** Calcule $\lambda/4$ a 100 MHz no espaço livre e discuta o risco de um cabo dessa ordem de comprimento.

**E.2** Se a área de um laço for reduzida por quatro, como muda a estimativa de campo do pequeno laço?

**E.3** Diferencie diretividade, eficiência e ganho.

**E.4** Liste as hipóteses necessárias para usar a equação de Friis.

**E.5** Explique a função do balun numa antena de medição.

**E.6** Uma antena isotrópica recebe onda de 100 MHz. Calcule sua abertura efetiva.

**E.7** Duas antenas têm polarizações lineares com 30° entre si. Calcule o fator ideal de perda de potência $|\hat p_t\cdot\hat p_r|^2$.

**E.8** Uma leitura é 50 dBµV, $AF=16$ dB/m, perda de cabo 2 dB e ganho do pré-amplificador 15 dB. Calcule o campo.

## Gabarito

**E.1** $\lambda/4$ a 100 MHz no espaço livre e risco de cabo dessa ordem de comprimento.

No espaço livre, $v_p=c=3\times10^8$ m/s. $\lambda=c/f=3\times10^8/10^8=3$ m.

$\lambda/4=3/4=0{,}75$ m.

Risco: Um cabo com comprimento próximo a $\lambda/4$ pode ressonar como monopolo, convertendo corrente de modo comum em emissão radiada eficiente. Isso pode causar falha em ensaios de emissões radiadas.

**E.2** Se a área de um laço for reduzida por quatro, como muda a estimativa de campo do pequeno laço?

Para o pequeno laço, o campo distante é proporcional a $k^2 I_0 A/(4\pi r)$. Se a área $A$ for reduzida por quatro, o campo também cai por fator 4, mantidos corrente, frequência e distância.

**E.3** Diferencie diretividade, eficiência e ganho.

- **Diretividade ($D$):** Medida de quão concentrada é a radiação em uma direção específica, comparada com uma antena isotrópica. Não considera perdas.
- **Eficiência ($e_r$):** Razão entre potência radiada e potência de entrada. Considera perdas ôhmicas e dielétricas.
- **Ganho ($G$):** Produto da diretividade pela eficiência: $G=e_rD$. É a medida prática de desempenho de uma antena.

**E.4** Hipóteses necessárias para usar a equação de Friis.

1. Campo distante para ambas as antenas.
2. Alinhamento de polarização.
3. Impedâncias casadas (sem reflexão).
4. Ausência de multipercurso ou obstruções.
5. Meio homogêneo e isotrópico (espaço livre).

**E.5** Função do balun numa antena de medição.

Balun (balance-to-unbalance) converte um sinal balanceado para não balanceado e vice-versa. Em antenas de medição, o balun evita que corrente de modo comum circule no exterior do cabo coaxial, o que distorceria o padrão de radiação e a calibração da antena.

**E.6** Abertura efetiva de antena isotrópica a 100 MHz.

Para antena isotrópica, $G=1$. $\lambda=c/f=3\times10^8/10^8=3$ m.

$A_e=\lambda^2G/(4\pi)=9/(4\pi)=0{,}716$ m².

**E.7** Fator ideal de perda de potência para polarizações com 30° entre si.

Fator de perda: $|\hat p_t\cdot\hat p_r|^2=\cos^2\psi$.

Para $\psi=30^\circ$: $\cos^2 30^\circ=(\sqrt{3}/2)^2=3/4=0{,}75$.

Perda em dB: $-10\log_{10}(0{,}75)=1{,}25$ dB.

**E.8** Cálculo do campo a partir de leitura 50 dBµV, $AF=16$ dB/m, perda de cabo 2 dB e ganho do pré-amplificador 15 dB.

Equação: $E_{dB\mu V/m}=V_{dB\mu V}+AF_{dB/m}+perda_{cabo}-ganho_{preamp}$.

$E=50+16+2-15=53$ dBµV/m.

## Exemplo numérico adicional — Campo de dipolo hertziano

Dados: $dl=1$ cm, $I=1$ A (RMS), $f=100$ MHz, $r=1000$ m, $\theta=90°$.

$\lambda=v/f=3$ m.
$\beta_0=2\pi/\lambda=2\pi/3$ rad/m.

Campo elétrico distante:
$$|E_\theta|=\frac{\eta_0\beta_0 I dl}{4\pi r}\sin\theta
=\frac{120\pi\cdot(2\pi/3)\cdot1\cdot0.01}{4\pi\cdot1000}\cdot1
=\frac{2.513}{4000}=6.28\times10^{-4}\ \text{V/m}.$$

## Código Python — Padrão de radiação do dipolo de meia onda

```python
import numpy as np
import matplotlib.pyplot as plt

# Padrão de radiação do dipolo de meia onda
u = np.linspace(0, np.pi, 100)

# F(u) para dipolo de meia onda
den = np.sin(u)
F = np.divide(
    np.cos(0.5 * np.pi * np.cos(u)), den,
    out=np.zeros_like(u), where=np.abs(den) >= 1e-6
)

# Normalizar
F_norm = F / np.max(F)

# Plot em coordenadas polares
theta_plot = np.linspace(0, 2*np.pi, 100)
r_plot = np.interp(theta_plot, np.linspace(0, np.pi, 100), F_norm)
# Simetria para o hemisfério inferior
r_plot_full = np.concatenate([F_norm, np.flip(F_norm)])
theta_plot_full = np.linspace(0, 2*np.pi, 200)

fig, ax = plt.subplots(subplot_kw={'projection': 'polar'}, figsize=(8, 8))
ax.plot(theta_plot_full, r_plot_full, 'b-', linewidth=2, label='Meia Onda')
ax.set_title('Padrão de Radiação - Dipolo de Meia Onda', va='bottom')
ax.set_theta_zero_location('N')
ax.set_theta_direction(-1)
plt.show()
```

## Código Python — Campo elétrico vs. distância

```python
import numpy as np
import matplotlib.pyplot as plt

# Parâmetros
E0_at_1m = 1.0  # Campo a 1 m (V/m)
distances = np.logspace(0, 3, 100)  # 1 m a 1000 m

# Lei do inverso da distância: E ~ 1/r
E_field = E0_at_1m / distances

plt.figure(figsize=(8, 5))
plt.loglog(distances, E_field, 'b-', linewidth=2)
plt.xlabel('Distância (m)')
plt.ylabel('Campo Elétrico (V/m)')
plt.title('Decaimento do Campo Elétrico com a Distância (Campo Distante)')
plt.grid(True, which='both', linestyle='--')
plt.show()
```

## Exemplo numérico adicional — Potência radiada e resistência de radiação

**Problema**: Um dipolo de meia onda tem $R_{rad}=73\ \Omega$. Se a corrente RMS na entrada é $1$ A, qual é a potência radiada?

**Solução**:

$P_{rad}=I_{RMS}^2\cdot R_{rad}=1^2\cdot73=73$ W.

Se a corrente for reduzida para $0.1$ A RMS:
$P_{rad}=0.1^2\cdot73=0.73$ W.

> **Insight para Estudantes**: A potência radiada é proporcional ao quadrado da corrente. Isso significa que reduzir a corrente em um fator de 10 reduz a potência radiada em um fator de 100 (ou 20 dB). Por isso, reduzir $di/dt$ e a amplitude de corrente são estratégias eficazes para reduzir emissões.

## Separação dos termos de campo

Os campos de um dipolo elementar contêm termos proporcionais a $1/r^3$, $1/r^2$ e $1/r$. Eles correspondem, respectivamente, a armazenamento quase-eletrostático, indução e radiação. A dominância depende de $kr=2\pi r/\lambda$, não apenas da distância em metros.

```python
import numpy as np
import matplotlib.pyplot as plt
kr = np.logspace(-3, 3, 800)
quasi, induction, radiation = 1/kr**3, 1/kr**2, 1/kr
plt.loglog(kr, quasi, label='$1/(kr)^3$')
plt.loglog(kr, induction, label='$1/(kr)^2$')
plt.loglog(kr, radiation, label='$1/(kr)$')
plt.axvline(1, color='k', ls='--', label='$kr=1$')
plt.xlabel('$kr$'); plt.ylabel('Magnitude relativa')
plt.grid(True, which='both', alpha=.3); plt.legend(); plt.tight_layout()
```

**Corolário.** A relação $E/H=\eta_0$ é válida para a componente radiativa em meio homogêneo no campo distante; aplicá-la a uma sonda muito próxima de um loop ou nó de alta impedância pode produzir erro grande.

## Reciprocidade e abertura efetiva

Em meio linear, passivo e recíproco, o padrão de transmissão e recepção é o mesmo. Para polarização e casamento ideais,

$$
A_e=\frac{\lambda^2G}{4\pi},\qquad P_r=S A_e.
$$

Com desalinhamento de polarização $\psi$, multiplique por $|\hat e_t\cdot\hat e_r|^2=\cos^2\psi$.

### Exemplo numérico

Em 300 MHz, uma antena de ganho 2 (linear) tem $A_e\approx0{,}159$ m². Para densidade de potência de $1\,\mu$W/m², recebe $0{,}159\,\mu$W com casamento e polarização ideais; a 60°, recebe apenas 25% desse valor.

## Laboratório SPICE — recepção de antena e fator de antena

```spice
* Simulação de antena receptora com fator de antena
Vantena antena 0 AC 1u
Rload antena 0 50
.ac dec 100 10k 1G
.print ac vm(antena)
.end
```

Neste exemplo, a fonte `Vantena` representa a tensão induzida pela onda incidente. A carga de 50 Ω modela o casamento de impedância. A análise AC fornece a tensão de saída em função da frequência, permitindo estimar a resposta em banda larga da antena receptora.

```spice
* Modelagem de cadeia de medição: antena + cabo + pré-amplificador
Vsource field 0 AC 1u
Rantena field ant 377
Cparasita ant 0 5p
Rcable ant cable 50
Lcable cable amp 10n
Vpreamp amp 0 AC gain=20
Rload amp 0 50
.ac dec 100 10k 1G
.print ac vm(ant) vm(cable) vm(amp)
.end
```

Este modelo inclui a impedância de radiação da antena (377 Ω para campo distante), capacitância parasita, indutância do cabo e ganho do pré-amplificador. A correção do fator de antena deve considerar todos esses elementos.

## Referência principal

Síntese do Capítulo 7, "Antennas", de C. R. Paul, *Introduction to Electromagnetic Compatibility*, 2ª ed., Wiley, 2006, pp. 421–501.
