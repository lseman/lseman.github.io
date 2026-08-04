# Corrente Elétrica, Materiais e Capacitância

> Eletromagnetismo — Apostila de Curso
> Tópicos: Corrente Elétrica · Conservação da Carga (Equação da Continuidade) · Condutores, Dielétricos, Isolantes e Semicondutores · Lei de Ohm Pontual · Método das Imagens · Materiais Dielétricos · Polarização e Permissividade Elétrica · Capacitância

---

## Objetivos de Aprendizagem

Ao final deste capítulo, você será capaz de:

- [ ] Calcular corrente elétrica e densidade de corrente em distribuições contínuas.
- [ ] Aplicar a **equação da continuidade** para conservação de carga.
- [ ] Diferenciar condutores, dielétricos, isolantes e semicondutores.
- [ ] Aplicar a **Lei de Ohm na forma pontual** e calcular resistência elétrica.
- [ ] Usar o **método das imagens** para resolver problemas com condutores.
- [ ] Calcular capacitância de sistemas com dielétricos.

---

## Intuição Física: O que é Corrente Elétrica?

Antes de definir matematicamente a corrente elétrica, pense em termos físicos:

- **Corrente elétrica** é o fluxo de cargas elétricas através de um material.
- Em condutores metálicos, os portadores de carga são **elétrons livres**.
- A **densidade de corrente** $\vec J$ descreve localmente quanta carga passa por unidade de área por unidade de tempo.
- A **tensão** (diferença de potencial) é o que "impulsiona" a corrente, assim como uma diferença de altitude impulsiona o fluxo de água.

## Aplicações no Mundo Real

| Conceito | Aplicação Prática |
|---|---|
| Corrente e densidade de corrente | Projeto de fios, cabos e circuitos impressos |
| Equação da continuidade | Análise de fluxo de carga em dispositivos semicondutores |
| Lei de Ohm pontual | Projeto de resistores e materiais condutores |
| Método das imagens | Cálculo de capacitância em linhas de transmissão e blindagem |
| Dielétricos e polarização | Isoladores em linhas de alta tensão, capacitores em circuitos |
| Capacitância | Armazenamento de energia, filtros em circuitos eletrônicos |

---

## Antes de começar

Ao final, você deve aplicar continuidade de carga, Lei de Ohm pontual, condições eletrostáticas em condutores e dielétricos, método das imagens e definições de capacitância. **Diagnóstico:** campo elétrico nulo no interior de um condutor significa ausência de carga em suas superfícies? **Evidência mínima:** verificar conservação de carga, calcular um campo por imagens e obter a energia de um capacitor.

## Sumário

1. [Corrente Elétrica e Densidade de Corrente](#corrente-elétrica-e-densidade-de-corrente)
2. [Conservação da Carga — Equação da Continuidade](#conservação-da-carga--equação-da-continuidade)
3. [Condutores, Isolantes, Dielétricos e Semicondutores](#condutores-isolantes-dielétricos-e-semicondutores)
4. [Lei de Ohm na Forma Pontual](#lei-de-ohm-na-forma-pontual)
5. [Método das Imagens](#método-das-imagens)
6. [Materiais Dielétricos: Polarização e Permissividade](#materiais-dielétricos-polarização-e-permissividade)
7. [Capacitância](#capacitância)
8. [Exercícios resolvidos em Python](#exercícios-resolvidos-em-python)
9. [Ruptura dielétrica](#ruptura-dielétrica)
10. [Circuitos RC — carga e descarga](#circuitos-rc--carga-e-descarga)
11. [Lista de Exercícios Propostos](#lista-de-exercícios-propostos)
12. [Gabarito](#gabarito)

## Corrente Elétrica e Densidade de Corrente

### Definição macroscópica

A **corrente elétrica** $I$ através de uma superfície é a taxa de transporte de carga:

$$
I \equiv \frac{dQ}{dt}
$$

medida em ampères (1 A = 1 C/s). Por convenção, o sentido da corrente é o do movimento das cargas positivas (mesmo em condutores metálicos, onde os portadores reais são elétrons de carga negativa movendo-se em sentido oposto).

### Densidade de corrente

Para descrever o transporte de carga localmente (não apenas o total através de uma seção), define-se a **densidade de corrente** $\vec{J}$ (A/m²): se $n$ é a densidade volumétrica de portadores de carga $q$ movendo-se com velocidade de deriva $\vec{v}_d$:

$$
\vec{J} = nq\vec{v}_d
$$

A corrente total através de uma superfície $S$ é o fluxo de $\vec{J}$:

$$
I = \int_S \vec{J}\cdot d\vec{A}
$$

**Dedução microscópica**: considere um condutor de seção $A$; em um intervalo $dt$, os portadores em um "cilindro" de comprimento $v_d\,dt$ atravessam a seção. A carga que passa é $dQ = nq(A\,v_d\,dt)$, logo $I = dQ/dt = nqv_dA = JA$ (para $\vec{J}$ uniforme e paralelo à normal da seção) — confirmando $\vec{J}=nq\vec{v}_d$.

## Conservação da Carga — Equação da Continuidade

### Dedução física

A conservação da carga é um princípio experimental fundamental: a carga em uma região só muda pelo fluxo através de sua fronteira (não há criação/destruição local). Para um volume $V$ fixo, delimitado por $S$:

$$
\frac{dQ_{env}}{dt} = -\oint_S \vec{J}\cdot d\vec{A}
$$

O sinal negativo expressa que, se há corrente **saindo** líquida através de $S$ ($\oint\vec{J}\cdot d\vec{A}>0$), a carga interna deve **diminuir**. Escrevendo $Q_{env}=\int_V\rho\,dV$:

$$
\int_V \frac{\partial\rho}{\partial t}\,dV = -\oint_S\vec{J}\cdot d\vec{A}
$$

Aplicando o Teorema do Divergente ao lado direito:

$$
\int_V \frac{\partial\rho}{\partial t}\,dV = -\int_V(\nabla\cdot\vec{J})\,dV
$$

Como isso vale para volume arbitrário:

$$
\boxed{\nabla\cdot\vec{J} + \frac{\partial\rho}{\partial t} = 0}\qquad\text{(Equação da Continuidade)}
$$

### Regime estacionário

Em **regime estacionário** (corrente contínua, sem acúmulo de carga em nenhum ponto), $\partial\rho/\partial t=0$, e a equação se reduz a:

$$
\nabla\cdot\vec{J} = 0
$$

Fisicamente, em regime estacionário toda corrente que entra em um volume sai dele. Em regime variável, $\nabla\cdot\vec J$ pode ser não nulo sem violar conservação: a diferença acumula carga segundo a equação da continuidade. É a **lei de Ampère magnetostática**, não a continuidade, que se torna incompleta e recebe de Maxwell o termo de corrente de deslocamento.

## Condutores, Isolantes, Dielétricos e Semicondutores

A resposta de um material a um campo elétrico externo depende de quão livremente seus elétrons podem se mover — comportamento descrito, em nível macroscópico, pela **condutividade** $\sigma$ (ou sua recíproca, a resistividade $\rho_{res}=1/\sigma$).

| Categoria                   | Condutividade típica (S/m) | Mecanismo                                                                   |
| --------------------------- | -------------------------- | --------------------------------------------------------------------------- |
| **Condutores** (metais)     | $10^6$ – $10^8$            | Elétrons de condução quase livres na banda de condução                      |
| **Semicondutores**          | $10^{-6}$ – $10^{4}$       | Poucos portadores livres; $\sigma$ altamente sensível a $T$, dopagem, campo |
| **Isolantes / Dielétricos** | $10^{-10}$ ou menor        | Elétrons fortemente ligados; sem portadores livres, apenas polarização      |

<!-- slides: columns -->

### Condutores em equilíbrio eletrostático

Em um condutor em **equilíbrio eletrostático** (sem correntes), os elétrons livres se rearranjam até que:

1. $\vec{E}=0$ no interior do condutor (caso contrário, haveria força sobre as cargas livres, gerando corrente — contradizendo o equilíbrio);
2. Toda carga em excesso reside na **superfície** (consequência de $\nabla\cdot\vec{E}=\rho/\varepsilon_0=0$ no interior);
3. O condutor é uma **equipotencial** ($\vec{E}=-\nabla V=0 \Rightarrow V=$ const.);
4. Imediatamente fora da superfície, $\vec{E}$ é perpendicular a ela (caso contrário, a componente tangencial moveria cargas superficiais).

<!-- slides: column -->

### Isolantes e dielétricos

Em isolantes, os elétrons estão ligados aos átomos/moléculas; não há condução apreciável, mas a **nuvem eletrônica se deforma** sob campo externo, criando dipolos induzidos (ou alinhando dipolos permanentes) — fenômeno da **polarização**, detalhado na Seção “Materiais Dielétricos: Polarização e Permissividade”.



<!-- slides: end-columns -->
### Semicondutores

Materiais como silício e germânio possuem um *gap* de energia pequeno entre as bandas de valência e condução, de modo que a agitação térmica (ou dopagem com impurezas doadoras/aceitadoras) libera um número controlável de portadores (elétrons e "buracos"). Isso permite condutividade ajustável por temperatura, luz, campo elétrico ou dopagem — base de diodos, transistores e toda a eletrônica de estado sólido.

**Semicondutor intrínseco** (puro, sem dopagem): a concentração de elétrons $n$ na banda de condução é igual à de buracos $p$ na banda de valência:

$$
n = p = n_i = \sqrt{N_c N_v}\,e^{-E_g/(2k_B T)}
$$

onde $E_g$ é a energia do gap (Si: $\approx1{,}12\,\text{eV}$ a 300 K; Ge: $\approx0{,}67\,\text{eV}$), $N_c$ e $N_v$ são as densidades efetivas de estados nas bandas, e $k_B$ é a constante de Boltzmann. Note a dependência exponencial com $T$ — a condutividade de um semicondutor intrínseco cresce drasticamente com a temperatura (comportamento oposto ao dos metais).

**Semicondutor extrínseco (dopado)**:

- **Tipo n**: impurezas doadoras (ex.: fósforo no Si) adicionam elétrons extras. $n \gg p$.
- **Tipo p**: impurezas aceitadoras (ex.: boro no Si) criam buracos. $p \gg n$.

A **condutividade** em semicondutores é:

$$
\sigma = q(n\mu_n + p\mu_p)
$$

onde $\mu_n$ e $\mu_p$ são as mobilidades de elétrons e buracos (típicas: $\mu_n\approx1400\,\text{cm}^2/\text{V·s}$, $\mu_p\approx450\,\text{cm}^2/\text{V·s}$ no Si a 300 K).

**Efeito Hall em semicondutores**: o sinal do coeficiente de Hall $R_H = 1/(nq)$ (ou $-1/(pq)$) revela se o material é tipo n ou tipo p — técnica padrão de caracterização de wafer. A mobilidade se obtém combinando Hall e resistividade: $\mu = |R_H|/\rho_{res}$.

## Lei de Ohm na Forma Pontual

### Modelo de Drude — detalhes e limitações

No modelo de Drude (1900), elétrons livres de massa $m$ e carga $-e$ sofrem colisões com a rede cristalina em um tempo médio de relaxação $\tau$. Entre colisões, sob campo $\vec{E}$, a equação de movimento (desprezando efeitos térmicos aleatórios, que se cancelam em média) é:

$$
m\frac{d\vec{v}_d}{dt} = -e\vec{E} - \frac{m}{\tau}\vec{v}_d
$$

onde o segundo termo modela o "atrito" efetivo das colisões. Em regime estacionário ($d\vec{v}_d/dt=0$):

$$
\vec{v}_d = -\frac{e\tau}{m}\vec{E}
$$

**Tempo de relaxação e comprimento de livre caminho**. Em metais a temperatura ambiente, $\tau \approx 10^{-14}\,\text{s}$ e o **comprimento médio de livre caminho** $\ell = v_F\tau$ (onde $v_F \approx 10^6\,\text{m/s}$ é a velocidade de Fermi) é da ordem de dezenas de ångströms — comparável à distância interatômica. Isso significa que elétrons colidem com a cada poucos espaçamentos da rede.

A **condutividade** é então:

$$
\sigma = \frac{ne^2\tau}{m}
$$

**Dependência com a temperatura**:

- **Metais**: $\tau \propto 1/T$ (dispersão por fônons), logo $\rho_{res} \propto T$. A resistividade aumenta linearmente com $T$ a temperaturas moderadas — lei experimental bem estabelecida.
- **Semicondutores**: $n \propto e^{-E_g/(2k_BT)}$ domina sobre a variação de $\tau$, então $\rho_{res}$ **diminui** exponencialmente com $T$.

**Mobilidade eletrônica**: define-se $\mu_e = |\vec{v}_d|/E = e\tau/m$. Para o cobre a 300 K: $\mu_e \approx 43\,\text{cm}^2/\text{V·s}$.

**Limitações do modelo de Drude**:

- Não explica por que o calor específico dos elétrons em metais é $\sim 100\times$ menor que o previsto (resolve-se com a estatística de Fermi-Dirac).
- Não explica diamagnetismo/paramagnetismo (resolve-se com o spin e a mecânica quântica).
- Prediz corretamente a lei de Ohm e a relação $\sigma = ne^2\tau/m$, e a relação de Wiedemann-Franz ($\kappa/\sigma T \approx 2{,}44\times10^{-8}\,\text{W}\Omega/\text{K}^2$).

### Derivação microscópica pelo modelo de Drude

Em um condutor ôhmico, elétrons livres de massa $m$ e carga $-e$ sofrem colisões com a rede cristalina em um tempo médio de relaxação $\tau$. Entre colisões, sob campo $\vec{E}$, a equação de movimento (desprezando efeitos térmicos aleatórios, que se cancelam em média) é:

$$
m\frac{d\vec{v}_d}{dt} = -e\vec{E} - \frac{m}{\tau}\vec{v}_d
$$

onde o segundo termo modela o "atrito" efetivo das colisões. Em regime estacionário ($d\vec{v}_d/dt=0$):

$$
\vec{v}_d = -\frac{e\tau}{m}\vec{E}
$$

A densidade de corrente, com $n$ elétrons por unidade de volume:

$$
\vec{J} = n(-e)\vec{v}_d = \frac{ne^2\tau}{m}\vec{E}
$$

### Forma constitutiva, hipóteses e domínio de validade

Definindo a **condutividade** $\sigma \equiv \dfrac{ne^2\tau}{m}$, obtém-se a **Lei de Ohm na forma pontual**:

$$
\boxed{\vec{J} = \sigma\vec{E}}
$$

válida localmente em qualquer ponto de um material ôhmico (linear, isotrópico), em contraste com a forma macroscópica $V=RI$, que só se aplica a um condutor inteiro com geometria definida.

### Dedução da forma macroscópica a partir da pontual

Para um condutor cilíndrico de comprimento $\ell$, seção $A$, com campo uniforme $E$ ao longo do eixo e corrente uniforme $J=I/A$:

$$
J = \sigma E \;\Rightarrow\; \frac{I}{A} = \sigma\frac{V}{\ell} \;\Rightarrow\; V = \left(\frac{\ell}{\sigma A}\right) I \equiv RI
$$

com $R = \dfrac{\ell}{\sigma A} = \dfrac{\rho_{res}\ell}{A}$ — a resistência macroscópica, recuperando a Lei de Ohm usual de circuitos.

```python
sigma_cobre = 5.96e7   # S/m
sigma_silicio_dopado = 1e3  # S/m (ordem de grandeza, depende da dopagem)

def campo_para_corrente(J, sigma):
    """Lei de Ohm pontual: E = J/sigma"""
    return J/sigma

def resistencia(l, A, sigma):
    return l/(sigma*A)

R_fio = resistencia(l=1.0, A=1e-6, sigma=sigma_cobre)  # fio de 1m, 1mm^2
print(f"Resistência do fio de cobre: {R_fio*1e3:.4f} mΩ")
```

## Método das Imagens

### Ideia central

O método das imagens resolve a Equação de Laplace/Poisson (Seção “Conservação da Carga — Equação da Continuidade”.3) para problemas com condutores, explorando o **Teorema da Unicidade**: se conseguirmos encontrar *qualquer* configuração de cargas fictícias que reproduza as mesmas condições de contorno do problema original na região de interesse, essa configuração fornece a solução correta ali — mesmo que a distribuição fictícia (as "cargas imagem") não exista fisicamente na região onde o campo é calculado.

### Dedução: carga puntiforme sobre plano condutor aterrado

Considere uma carga $+q$ a uma altura $d$ acima de um plano condutor infinito aterrado (o plano $z=0$, condutor ocupando $z<0$, aterrado logo $V=0$ em $z=0$). Queremos $V(x,y,z)$ para $z\ge 0$.

**Proposta de solução por imagem**: substitua o condutor por uma carga fictícia $-q$ em $z=-d$ (a "imagem espelhada"), e calcule o potencial de **ambas** as cargas, ignorando o condutor:

$$
V(x,y,z) = \frac{1}{4\pi\varepsilon_0}\left[\frac{q}{\sqrt{x^2+y^2+(z-d)^2}} - \frac{q}{\sqrt{x^2+y^2+(z+d)^2}}\right]
$$

**Verificação das condições de contorno**:

1. Em $z=0$: os dois termos têm denominadores iguais ($\sqrt{x^2+y^2+d^2}$), logo $V(x,y,0)=0$ ✓ — reproduz o plano aterrado.
2. Para $z>0$, a única carga real na região é $+q$; a carga imagem está em $z=-d<0$, fora da região de interesse, então não viola a equação de Poisson na região física ($\nabla^2V=0$ exceto no ponto onde está $+q$) ✓.
3. Por unicidade, essa é a **única** solução válida para $z\ge0$.

### Carga induzida na superfície do condutor

O campo elétrico logo acima da superfície do condutor determina a densidade de carga induzida, $\sigma_{ind} = \varepsilon_0 E_z|_{z=0^+}$ (componente normal do campo na superfície de um condutor). Calculando $E_z=-\partial V/\partial z$ em $z=0$:

$$
E_z(x,y,0) = -\frac{qd}{2\pi\varepsilon_0(x^2+y^2+d^2)^{3/2}}
$$

$$
\sigma_{ind}(x,y) = -\frac{qd}{2\pi(x^2+y^2+d^2)^{3/2}}
$$

Integrando $\sigma_{ind}$ sobre todo o plano (usando coordenadas polares $r^2=x^2+y^2$), obtém-se carga total induzida $Q_{ind}=-q$ — todo o "fluxo" da carga real termina na carga induzida, como esperado fisicamente (a carga imagem tem exatamente a carga total que a distribuição induzida real produziria, vista de $z>0$).

### Força sobre a carga real

A força sobre $+q$ é a mesma que a carga imagem exerceria (Lei de Coulomb entre $+q$ e $-q$ separadas por $2d$), sempre **atrativa** em direção ao plano:

$$
F = -\frac{1}{4\pi\varepsilon_0}\frac{q^2}{(2d)^2}\hat{z}
$$

### Método das imagens: carga externa a uma esfera condutora aterrada

Problema: carga $q$ a distância $d > a$ do centro de uma esfera condutora **aterrada** de raio $a$. A solução exige uma única carga imagem:

$$
q'=-q\frac{a}{d},\qquad b=\frac{a^2}{d},
$$

colocada dentro da esfera, na linha que liga o centro à carga real. Essa imagem garante $V=0$ em toda a superfície. A esfera aterrada pode trocar carga com a Terra, portanto sua carga induzida total não precisa ser nula. Uma segunda imagem $q''=-q'$ no centro seria necessária para uma esfera **isolada e inicialmente neutra**, que é um problema de contorno diferente.

A força sobre $q$ é:

$$
F = \frac{1}{4\pi\varepsilon_0}\frac{q\,q'}{(d-b)^2}
$$

$$
\boxed{F=-\frac{1}{4\pi\varepsilon_0}\frac{q^2ad}{(d^2-a^2)^2}}
$$

Sempre **atrativa**. No limite $d \gg a$:

$$
F \approx -\frac{1}{4\pi\varepsilon_0}\frac{q^2a}{d^3}.
$$

O sinal negativo indica atração em direção à esfera. O limite $1/d^3$ é próprio da esfera aterrada; a esfera isolada e neutra possui o limite dipolar $1/d^5$.

```python
import numpy as np
import matplotlib.pyplot as plt

x=np.linspace(-3,3,180); y=np.linspace(0.03,3,120); X,Y=np.meshgrid(x,y); a=1.2
def c(q,y0):
    dx,dy=X,Y-y0; r2=dx*dx+dy*dy+.015
    return q*dx/r2**1.5,q*dy/r2**1.5
E1,E2=c(1,a),c(-1,-a); Ex,Ey=E1[0]+E2[0],E1[1]+E2[1]
fig,ax=plt.subplots(figsize=(7,4.5)); ax.streamplot(X,Y,Ex,Ey,density=1.35,color="#2563eb")
ax.axhline(0,color="#475569",lw=6); ax.scatter(0,a,s=130,c="#dc2626",zorder=3)
ax.scatter(0,-a,s=130,c="#2563eb",alpha=.35,clip_on=False)
ax.text(.12,a,"+q real"); ax.text(.12,-a,"−q imagem",alpha=.65,clip_on=False)
ax.set(xlim=(-3,3),ylim=(-1.6,3),title="Carga diante de um plano condutor aterrado",xlabel="$x$",ylabel="$y$")
plt.tight_layout()
```

## Materiais Dielétricos: Polarização e Permissividade

### Polarização microscópica

Sob campo elétrico externo $\vec{E}$, átomos e moléculas de um dielétrico desenvolvem (ou têm reforçado, se já polares) um momento de dipolo. Define-se o vetor **polarização** $\vec{P}$ como o momento de dipolo por unidade de volume:

$$
\vec{P} \equiv \lim_{\Delta V\to 0}\frac{\sum_i \vec{p}_i}{\Delta V}
$$

### Cargas de polarização (ligadas)

Pode-se mostrar (por um argumento de "corte" do material em fatias, análogo ao usado para a corrente de continuidade) que uma polarização não-uniforme produz uma densidade volumétrica de **carga ligada**:

$$
\rho_b = -\nabla\cdot\vec{P}
$$

e, na superfície de um dielétrico, uma densidade superficial de carga ligada:

$$
\sigma_b = \vec{P}\cdot\hat{n}
$$

**Ideia da dedução (esboço)**: em um dielétrico polarizado, dentro de qualquer volume interno, o "fim" de um dipolo cancela o "início" do dipolo vizinho, exceto onde $\vec{P}$ varia — sobra carga líquida proporcional a $-\nabla\cdot\vec{P}$; na superfície externa, os dipolos "cortados" pela fronteira deixam carga descoberta $\sigma_b=\vec{P}\cdot\hat n$.

### O vetor deslocamento elétrico $\vec{D}$

A Lei de Gauss pontual, agora incluindo **toda** a carga (livre $\rho_f$ e ligada $\rho_b$):

$$
\nabla\cdot\vec{E} = \frac{\rho_f+\rho_b}{\varepsilon_0} = \frac{\rho_f - \nabla\cdot\vec{P}}{\varepsilon_0}
$$

Reorganizando:

$$
\nabla\cdot(\varepsilon_0\vec{E}+\vec{P}) = \rho_f
$$

Define-se o **deslocamento elétrico**:

$$
\boxed{\vec{D} \equiv \varepsilon_0\vec{E}+\vec{P}}
$$

de modo que:

$$
\boxed{\nabla\cdot\vec{D} = \rho_f}
$$

Essa é a grande utilidade de $\vec{D}$: sua fonte é apenas a carga **livre** (controlável externamente), o que simplifica problemas com dielétricos — não é preciso conhecer $\rho_b$ a priori.

### Materiais lineares: susceptibilidade e permissividade relativa

Para dielétricos **lineares, isotrópicos e homogêneos (LIH)**, a polarização responde linearmente ao campo local:

$$
\vec{P} = \varepsilon_0\chi_e\vec{E}
$$

onde $\chi_e$ é a **susceptibilidade elétrica** (adimensional). Substituindo em $\vec{D}$:

$$
\vec{D} = \varepsilon_0\vec{E}+\varepsilon_0\chi_e\vec{E} = \varepsilon_0(1+\chi_e)\vec{E} \equiv \varepsilon\vec{E}
$$

$$
\boxed{\varepsilon = \varepsilon_0\varepsilon_r,\qquad \varepsilon_r = 1+\chi_e}
$$

$\varepsilon_r$ (permissividade relativa, ou constante dielétrica) varia de $1$ (vácuo) a dezenas ou centenas (ex.: $\varepsilon_r\approx80$ para água, à temperatura ambiente e baixas frequências) — quantifica o quanto o material "amortece" o campo elétrico interno em relação ao vácuo, para a mesma carga livre.

## Capacitância

### Definição

A **capacitância** de um sistema de dois condutores com cargas $+Q$ e $-Q$ mede quanta carga é necessária para gerar uma diferença de potencial unitária entre eles:

$$
C \equiv \frac{Q}{V}
$$

Em materiais lineares, com geometria e estado constitutivo fixos, $C$ depende da geometria e da permissividade, não de $Q$ ou $V$ separadamente. Dielétricos não lineares, ferroelétricos, dependência com frequência, temperatura ou tensão podem tornar a capacitância incremental dependente do ponto de operação.

### Dedução: capacitor de placas paralelas

Duas placas de área $A$, separadas por distância $d\ll\sqrt{A}$ (aproximação de placas infinitas), com cargas $+Q$ e $-Q$ ($\sigma=Q/A$), preenchidas por dielétrico $\varepsilon=\varepsilon_r\varepsilon_0$.

Usando o resultado da Seção “Corrente Elétrica e Densidade de Corrente”.6.4 (campo de um plano infinito, agora com $\varepsilon$ no lugar de $\varepsilon_0$ dentro do dielétrico) e somando os campos de ambas as placas (que se reforçam entre elas e se cancelam fora):

$$
E = \frac{\sigma}{\varepsilon} = \frac{Q}{\varepsilon A}
$$

A diferença de potencial entre as placas:

$$
V = \int_0^d E\,dz = \frac{Qd}{\varepsilon A}
$$

Logo:

$$
\boxed{C = \frac{Q}{V} = \frac{\varepsilon A}{d} = \frac{\varepsilon_r\varepsilon_0 A}{d}}
$$

### Dedução: capacitor cilíndrico (cabo coaxial)

Dois cilindros coaxiais de raios $a<b$ e comprimento $L$, carga $\pm Q$. Pela Lei de Gauss cilíndrica (Seção “Corrente Elétrica e Densidade de Corrente”.6.3), o campo entre os cilindros ($a<r<b$):

$$
E(r) = \frac{Q}{2\pi\varepsilon L r}
$$

A diferença de potencial:

$$
V = \int_a^b E\,dr = \frac{Q}{2\pi\varepsilon L}\ln\left(\frac{b}{a}\right)
$$

$$
\boxed{C = \frac{Q}{V} = \frac{2\pi\varepsilon L}{\ln(b/a)}}
$$

Esse resultado é a base do cálculo de capacitância (e impedância) de cabos coaxiais, relevante para linhas de transmissão (Parte 2 — Ondas e Propagação).

---

### Exemplo Resolvido Passo a Passo: Capacitância de um Cabo Coaxial

**Problema**: Um cabo coaxial tem raio interno $a = 1{,}0\,\text{mm}$, raio externo $b = 3{,}0\,\text{mm}$, e o espaço entre os cilindros é preenchido com um dielétrico de permissividade relativa $\varepsilon_r = 2{,}2$ (polietileno). O comprimento do cabo é $L = 100\,\text{m}$. Determine a capacitância $C$ do cabo.

**Passo 1: Identificar a fórmula da capacitância para um capacitor cilíndrico.**  
Para dois cilindros coaxiais de raios $a$ e $b$ ($a<b$), comprimento $L$, e permissividade $\varepsilon = \varepsilon_r\varepsilon_0$, a capacitância é:
$$
C = \frac{2\pi\varepsilon L}{\ln(b/a)} = \frac{2\pi\varepsilon_r\varepsilon_0 L}{\ln(b/a)}
$$

**Passo 2: Calcular o logaritmo natural $\ln(b/a)$.**  
$$
\frac{b}{a} = \frac{3{,}0\,\text{mm}}{1{,}0\,\text{mm}} = 3
$$
$$
\ln(b/a) = \ln(3) \approx 1{,}0986
$$

**Passo 3: Substituir os valores numéricos.**  
Usando $\varepsilon_0 = 8{,}854\times10^{-12}\,\text{F/m}$, $\varepsilon_r = 2{,}2$, $L = 100\,\text{m}$:
$$
C = \frac{2\pi(2{,}2)(8{,}854\times10^{-12}\,\text{F/m})(100\,\text{m})}{1{,}0986}
$$

Calculando o numerador:
$$
2\pi(2{,}2)(8{,}854\times10^{-12})(100) \approx 2\pi(2{,}2)(8{,}854\times10^{-10}) \approx 2\pi(1{,}948\times10^{-9}) \approx 1{,}223\times10^{-8}\,\text{F}
$$

Dividindo pelo denominador:
$$
C \approx \frac{1{,}223\times10^{-8}\,\text{F}}{1{,}0986} \approx 1{,}113\times10^{-8}\,\text{F} = 11{,}13\,\text{nF}
$$

**Resposta final**: $\boxed{C \approx 11{,}1\,\text{nF}}$

**Observação**: A capacitância por unidade de comprimento é:
$$
\frac{C}{L} = \frac{2\pi\varepsilon_r\varepsilon_0}{\ln(b/a)} \approx \frac{1{,}223\times10^{-10}\,\text{F/m}}{1{,}0986} \approx 111{,}3\,\text{pF/m}
$$

Isso é típico de cabos coaxiais de alta frequência (como os usados em TV a cabo ou redes de dados).

---

### Capacitor esférico

Duas esferas concêntricas de raios $a$ e $b$ ($a<b$), com cargas $\pm Q$. Pela Lei de Gauss esférica, o campo entre as esferas ($a<r<b$):

$$
E(r) = \frac{Q}{4\pi\varepsilon r^2}
$$

Diferença de potencial:

$$
V = \int_a^b E\,dr = \frac{Q}{4\pi\varepsilon}\left(\frac{1}{a}-\frac{1}{b}\right)
$$

$$
\boxed{C = \frac{Q}{V} = 4\pi\varepsilon\,\frac{ab}{b-a}}
$$

No limite $b\to\infty$ (esfera isolada de raio $a$): $C = 4\pi\varepsilon a$. Para a Terra ($R\approx6371\,\text{km}$): $C\approx711\,\mu\text{F}$.

### Capacitores em série e paralelo

**Paralelo**: mesma diferença de potencial, cargas se somam:
$$
C_{eq} = C_1 + C_2 + \cdots
$$

**Série**: mesma carga, potenciais se somam:
$$
\boxed{\frac{1}{C_{eq}} = \frac{1}{C_1} + \frac{1}{C_2} + \cdots}
$$

**Exemplo prático**: dois capacitores em série, $C_1=2\,\mu\text{F}$, $C_2=4\,\mu\text{F}$. A capacitância equivalente é $C_{eq} = \dfrac{2\times4}{2+4} = \dfrac{4}{3}\,\mu\text{F}$. A tensão se divide inversamente com a capacitância: $V_1/V_2 = C_2/C_1 = 2$.

### Energia armazenada em um capacitor

Da Seção “Conservação da Carga — Equação da Continuidade”.4, $U=\frac12\int\varepsilon E^2\,dV$ (generalizando $\varepsilon_0\to\varepsilon$ em meio dielétrico linear). Para o capacitor de placas paralelas, com $E$ uniforme no volume $V_{vol}=Ad$:

$$
U = \frac{1}{2}\varepsilon E^2 (Ad) = \frac{1}{2}\varepsilon\left(\frac{Q}{\varepsilon A}\right)^2 Ad = \frac{Q^2 d}{2\varepsilon A} = \frac{Q^2}{2C}
$$

Usando $Q=CV$, formas equivalentes:

$$
\boxed{U = \frac{Q^2}{2C} = \frac{1}{2}CV^2 = \frac{1}{2}QV}
$$

**Densidade de energia em presença de dielétrico**:
$$
u_E = \frac{1}{2}\varepsilon E^2 = \frac{1}{2}\varepsilon_r\varepsilon_0 E^2
$$

Para o mesmo campo — ou a mesma tensão e geometria — o dielétrico aumenta $u_E$ por $\varepsilon_r$. Para um capacitor **isolado**, porém, $Q$ é fixo: inserir o dielétrico aumenta $C$, reduz $E$ e reduz $U=Q^2/(2C)$. Se ele permanece ligado a uma fonte ideal, $V$ é fixo, a fonte fornece carga adicional e $U=CV^2/2$ aumenta. Declarar o que fica fixo é essencial.

```python
import numpy as np
import matplotlib.pyplot as plt

fig,ax=plt.subplots(figsize=(7,4)); x=np.linspace(-2.5,2.5,15)
ax.plot([-3,3],[1,1],lw=9,color="#dc2626"); ax.plot([-3,3],[-1,-1],lw=9,color="#2563eb")
for xi in x: ax.annotate("",(xi,-.82),(xi,.82),arrowprops=dict(arrowstyle="->",color="#374151",lw=1.5))
for xi in np.linspace(-2.7,2.7,12):
    ax.text(xi,1.18,"+",color="#dc2626",ha="center",weight="bold")
    ax.text(xi,-1.35,"−",color="#2563eb",ha="center",weight="bold")
ax.text(0,0,"$\\vec E$ uniforme",ha="center",bbox=dict(fc="white",ec="none",alpha=.8))
ax.set(xlim=(-3.4,3.4),ylim=(-1.7,1.7),aspect="equal",title="Campo entre placas paralelas"); ax.axis("off")
plt.tight_layout()
```

## Exercícios Resolvidos em Python

### Roteiro computacional

**Objetivo.** Calcular capacitâncias, energia, parâmetros de transporte e respostas RC, preservando unidades e geometria.

**Hipóteses.** Materiais lineares e homogêneos, efeitos de borda desprezados quando indicado e parâmetros constantes na faixa analisada.

**Como executar.** Requer `numpy`, `scipy` e `matplotlib`. Converta todas as dimensões para metros antes dos cálculos e confronte a integração de $u_E$ com $CV^2/2$.

**Resultados esperados.** Concordância entre energia de circuito e energia de campo; dimensões físicas corretas para $C$, $E$, $U$, $\sigma$ e $\tau$.

```python
import numpy as np

eps0 = 8.854e-12
mu0 = 4*np.pi*1e-7
e = 1.602e-19
m_e = 9.109e-31

# --- Capacitores ---
def C_placas_paralelas(A, d, eps_r=1.0):
    return eps_r*eps0*A/d

def C_cilindrico(a, b, L, eps_r=1.0):
    return 2*np.pi*eps_r*eps0*L/np.log(b/a)

def C_esferico(a, b):
    return 4*np.pi*eps0*a*b/(b-a)

def C_esfera_isolada(r):
    return 4*np.pi*eps0*r

def energia_capacitor(Q=None, V=None, C=None):
    if C is None:
        C = Q/V
    if Q is not None:
        return Q**2/(2*C)
    return 0.5*C*V**2

# Capacitor de placas paralelas com dielétrico de vidro (eps_r ~ 4.5)
C1 = C_placas_paralelas(A=1e-4, d=1e-3, eps_r=4.5)
print(f"C (placas paralelas, vidro): {C1*1e12:.3f} pF")

# Cabo coaxial RG-58 (aprox.): a=0.45mm, b=1.5mm, dielétrico PE eps_r~2.3
C2 = C_cilindrico(a=0.45e-3, b=1.5e-3, L=1.0, eps_r=2.3)
print(f"C por metro (coaxial tipo RG-58): {C2*1e12:.2f} pF/m")

# Esfera isolada (Terra)
C_terra = C_esfera_isolada(6.371e6)
print(f"C da Terra: {C_terra:.2f} F")

# Energia armazenada
U = energia_capacitor(V=12.0, C=C1)
print(f"Energia armazenada em C1 a 12V: {U*1e9:.4f} nJ")

# Verificação numérica: integrar a densidade de energia u_E = 1/2 eps E^2
A, d, eps_r = 1e-4, 1e-3, 4.5
eps = eps_r*eps0
Q = 1e-9
E_field = Q/(eps*A)
U_campo = 0.5*eps*E_field**2*(A*d)
U_formula = Q**2/(2*C_placas_paralelas(A,d,eps_r))
print(f"U via integral do campo: {U_campo:.6e} J")
print(f"U via Q^2/2C:            {U_formula:.6e} J")

# --- Drude model ---
n_cobre = 8.5e28  # elétrons/m^3
sigma_cobre = 5.96e7
# tau = m*sigma/(n*e^2)
tau = m_e * sigma_cobre / (n_cobre * e**2)
v_F = 1.57e6  # velocidade de Fermi do cobre (m/s)
ell = v_F * tau  # livre caminho médio
print(f"\nDrude - Cobre:")
print(f"  tau = {tau*1e15:.2f} fs")
print(f"  livre caminho médio = {ell*1e10:.2f} Å")

# --- Semicondutor intrínseco ---
# n_i para Si a 300K ~ 1.5e16 m^-3
gap_Si = 1.12  # eV
kT = 8.617e-5 * 300  # eV
n_i_Si = 1.5e16
sigma_si = e * n_i_Si * (1400e-4 + 450e-4)  # S/m (mobilidade em m^2/Vs)
print(f"\nSi intrínseco (300K):")
print(f"  n_i = {n_i_Si:.2e} m^-3")
print(f"  sigma = {sigma_si:.4e} S/m")
print(f"  rho = {1/sigma_si:.2e} Ω·m")

# --- Efeito Hall em semicondutor ---
def coeficiente_hall(n, q):
    return 1/(n*q)

n_n = 1e21  # semicondutor tipo n
RH = coeficiente_hall(n_n, e)
print(f"\nCoeficiente Hall (tipo n): {RH:.2e} m^3/C")

# --- Capacitores em série ---
C1_val, C2_val = 2e-6, 4e-6
C_eq_series = 1/(1/C1_val + 1/C2_val)
C_eq_parallel = C1_val + C2_val
print(f"\nC_eq série (2uF + 4uF): {C_eq_series*1e6:.4f} uF")
print(f"C_eq paralelo (2uF + 4uF): {C_eq_parallel*1e6:.4f} uF")

# --- Verificação numérica: integrar campo do capacitor cilíndrico ---
def energia_cilindrica(Q, a, b, L, eps):
    """Integra u_E = 1/2 eps E^2 no volume entre cilindros."""
    r = np.linspace(a, b, 1000)
    E = Q/(2*np.pi*eps*L*r)
    u_E = 0.5*eps*E**2
    # dV = 2*pi*r*L*dr
    dV = 2*np.pi*r*L*np.gradient(r)
    return np.sum(u_E*dV)

Q, a, b, L = 1e-9, 0.45e-3, 1.5e-3, 1.0
eps = 2.3*eps0
U_int = energia_cilindrica(Q, a, b, L, eps)
U_formula = Q**2/(2*C_cilindrico(a, b, L, 2.3))
print(f"\nEnergia cilindrica: integral={U_int:.6e} J, formula={U_formula:.6e} J")
```

**Saída esperada**:

- Capacitor de vidro: ~4 pF; coaxial: ~50 pF/m; Terra: ~711 µF
- Drude: $\tau\approx2{,}5\times10^{-14}\,\text{s}$, $\ell\approx39\,\text{Å}$
- Si intrínseco: $\sigma\approx2{,}7\times10^{-4}\,\text{S/m}$ — muito menor que o cobre
- Capacitores série: 1,33 µF; paralelo: 6 µF
- Energia cilindrica: integral e fórmula coincidem

## Ruptura Dielétrica

Todo dielétrico possui um **campo de ruptura** (ou rigidez dielétrica) acima do qual o material perde suas propriedades isolantes — elétrons são arrancados dos átomos, gerando uma descarga condutora. Valores típicos:

| Material         | Rigidez dielétrica (MV/m) |
| ---------------- | ------------------------- |
| Ar (STP)         | ~3                        |
| Ar (seco)        | ~3,3                      |
| Papel impregnado | ~16                       |
| Óleo mineral     | ~15                       |
| Vidro            | ~20–40                    |
| Mica             | ~118                      |
| Policarbonato    | ~500                      |
| Teflon           | ~60                       |

**Capacitor com campo máximo**: para um capacitor de placas paralelas com dielétrico de rigidez $E_{\text{max}}$, a tensão máxima é $V_{\text{max}} = E_{\text{max}}\,d$ e a energia máxima armazenada é:

$$
U_{\text{max}} = \frac{1}{2}C\,V_{\text{max}}^2 = \frac{1}{2}\,\frac{\varepsilon A}{d}\,(E_{\text{max}}\,d)^2 = \frac{1}{2}\,\varepsilon E_{\text{max}}^2\,(Ad)
$$

Note que $U_{\text{max}}$ é proporcional ao volume do dielétrico ($Ad$) e ao quadrado da rigidez. Para maximizar a energia armazenada, escolhe-se materiais de alta $\varepsilon_r$ e alta $E_{\text{max}}$ — o que motiva o uso de polipropileno, policarbonato e cerâmicas de alta permissividade em capacitores de potência.

**Descarga no ar**: o ar ioniza quando o campo excede ~3 MV/m, produzindo faíscas. Esta é a base das centelhas de motores de combustão e dos raios (onde a diferença de potencial entre nuvem e solo gera campos da ordem de $10^6$–$10^7$ V/m).

## Circuitos RC — Carga e Descarga

### Circuito RC em série com fonte DC

Um capacitor $C$ em série com resistor $R$, conectado a uma fonte de tensão $\mathcal{E}$. Pela lei de Kirchhoff das malhas:

$$
\mathcal{E} = IR + \frac{Q}{C}
$$

com $I = dQ/dt$. Reescrevendo:

$$
\frac{dQ}{dt} + \frac{Q}{RC} = \frac{\mathcal{E}}{R}
$$

A solução (com $Q(0)=0$):

$$
\boxed{Q(t) = C\mathcal{E}\left(1 - e^{-t/\tau}\right), \qquad I(t) = \frac{\mathcal{E}}{R}\,e^{-t/\tau}}
$$

com **constante de tempo** $\tau = RC$. Após $t=\tau$, o capacitor carrega a ~63% da carga máxima; após $5\tau$, a ~99,3%.

### Descarga do capacitor

Com a fonte removida (curto-circuitando $R$ e $C$ em série):

$$
\boxed{Q(t) = Q_0\,e^{-t/\tau}, \qquad I(t) = -\frac{Q_0}{RC}\,e^{-t/\tau}}
$$

A energia armazenada é dissipada como calor no resistor:

$$
U_{\text{dissipada}} = \int_0^\infty I^2 R\,dt = \int_0^\infty \left(\frac{Q_0}{RC}\right)^2 e^{-2t/\tau} R\,dt = \frac{Q_0^2}{2C}
$$

igual à energia inicial — conservação de energia.

### Tempo de carga e potência máxima

A potência instantânea fornecida pela fonte é $P_{\text{fonte}}(t) = \mathcal{E}\,I(t)$, e a potência dissipada no resistor é $P_R(t) = I(t)^2 R$. Integrando:

$$
W_{\text{fonte}} = \int_0^\infty \mathcal{E}\,I(t)\,dt = \mathcal{E}\cdot\frac{\mathcal{E}}{R}\cdot\tau = C\mathcal{E}^2
$$

Mas a energia armazenada é $\tfrac12C\mathcal E^2$: neste modelo de fonte de tensão ideal, capacitor inicialmente descarregado e resistência série, exatamente metade é dissipada, independentemente do valor positivo de $R$.

Não é uma lei universal de qualquer carregamento. Conversores com indutores, recuperação de energia ou carga adiabática com tensão lentamente variável podem reduzir a dissipação; uma fonte de corrente ideal, sozinha, não garante menor perda sem especificar o circuito e sua tensão.

---

## Resumo do Capítulo

### Fórmulas-Chave

| Conceito | Fórmula | Aplicações |
|---|---|---|
| Corrente elétrica | $I = dQ/dt$ | Fluxo de carga em circuitos |
| Densidade de corrente | $\vec J = nq\vec v_d$ | Transporte local de carga |
| Equação da continuidade | $\nabla\cdot\vec J + \partial\rho/\partial t = 0$ | Conservação de carga |
| Lei de Ohm pontual | $\vec J = \sigma\vec E$ | Condutores e resistores |
| Resistência | $R = \rho L/A = L/(\sigma A)$ | Fios e resistores |
| Método das imagens | Carga imagem para condutor plano | Cálculo de campo e capacitância |
| Polarização dielétrica | $\vec P = \chi_e\varepsilon_0\vec E$ | Materiais dielétricos |
| Deslocamento elétrico | $\vec D = \varepsilon\vec E = \varepsilon_0\vec E + \vec P$ | Campos em dielétricos |
| Capacitância | $C = Q/V$ | Armazenamento de carga |
| Energia no capacitor | $U = \tfrac{1}{2}CV^2 = \tfrac{1}{2}QV$ | Energia armazenada |
| Constante de tempo RC | $\tau = RC$ | Carga e descarga de capacitores |

### Classificação de Materiais

| Material | Condutividade $\sigma$ (S/m) | Mecanismo dominante |
|---|---|---|
| Condutores (metais) | $10^6$–$10^8$ | Elétrons livres |
| Semicondutores | $10^{-6}$–$10^4$ | Elétrons e buracos |
| Isolantes/Dielétricos | $10^{-10}$–$10^{-16}$ | Polarização sem fluxo |

### Conceitos-Chave

1. **Corrente e densidade de corrente**: $I = \int \vec J\cdot d\vec A$.
2. **Equação da continuidade**: Expressa conservação local de carga.
3. **Lei de Ohm pontual**: $\vec J = \sigma\vec E$ — válida para materiais ôhmicos.
4. **Método das imagens**: Substitui condutor por carga fictícia para satisfazer condições de contorno.
5. **Dielétricos e polarização**: Materiais que se polarizam em campo elétrico, aumentando a capacitância.
6. **Capacitância**: Medida da capacidade de armazenar carga por unidade de tensão.

::: verificacao
**Verificação Rápida (Concept Check):**  
1. A densidade de corrente $\vec J$ é um vetor ou um escalar? **Vetor.**  
2. No interior de um condutor em regime estacionário (corrente contínua), o campo elétrico é **zero** ou **não-zero**? **Não-zero** (é o que impulsiona a corrente: $\vec J = \sigma\vec E$).  
3. A constante de tempo $\tau = RC$ tem unidades de **segundos** ou **ohms**? **Segundos.**
:::

## Lista de Exercícios Propostos

Os problemas a seguir cobrem todos os tópicos de **Corrente, materiais e capacitância**. Os três marcados como **Desafio** exigem combinar mais de uma técnica (imagens, integração de campo não uniforme, capacitores em camadas), mas usam apenas resultados já deduzidos neste capítulo e nos anteriores.

**E1 —** Um fio de cobre ($n=8{,}5\times10^{28}\,\text{m}^{-3}$) de raio $0{,}8\,\text{mm}$ conduz uma corrente de $15\,\text{A}$. Calcule (a) a área da seção transversal; (b) a densidade de corrente $J$; (c) a velocidade de deriva média dos elétrons.

**E2 —** A densidade de corrente é $\vec J=J_0e^{-t/\tau_0}\hat r/r^2$ para $r>0$. Use continuidade para obter $\partial\rho/\partial t$ numa casca $r_1<r<r_2$, determine a carga da casca e o fluxo de corrente por uma esfera. Explique onde está a fonte/sumidouro singular e por que o fator temporal do fluxo não implica que a carga da casca decaia.

**E3 —** Classifique cada material como condutor, semicondutor ou isolante a partir da condutividade informada, e explique o mecanismo microscópico dominante em cada caso: (a) $\sigma = 6{,}3\times10^{7}\,\text{S/m}$; (b) $\sigma = 2{,}5\times10^{-2}\,\text{S/m}$; (c) $\sigma = 10^{-13}\,\text{S/m}$.

**E4 —** O germânio possui $E_g = 0{,}67\,\text{eV}$ e concentração intrínseca $n_i = 2{,}4\times10^{13}\,\text{cm}^{-3}$ a $300\,\text{K}$, com mobilidades $\mu_n = 3900\,\text{cm}^2/\text{V·s}$ e $\mu_p = 1900\,\text{cm}^2/\text{V·s}$. Calcule a condutividade intrínseca $\sigma_i$ do Ge a $300\,\text{K}$ e compare (em ordem de grandeza) com o resultado do Si intrínseco obtido na Seção “Exercícios Resolvidos em Python” ($\sigma_{Si}\approx2{,}7\times10^{-4}\,\text{S/m}$).

**E5 —** Uma amostra de silício tipo n é dopada com $N_d = 10^{16}\,\text{cm}^{-3}$ de átomos doadores, todos ionizados ($n\approx N_d$). Usando $\mu_n = 1350\,\text{cm}^2/\text{V·s}$ (despreze a contribuição de buracos, $p\ll n$), calcule a condutividade $\sigma_n$ e a resistividade $\rho_{res}$ da amostra.

**E6 —** Uma amostra semicondutora é submetida a um ensaio de efeito Hall, obtendo-se $R_H = 4{,}5\times10^{-4}\,\text{m}^3/\text{C}$ (sinal indicando portadores majoritários negativos) e resistividade $\rho_{res}=0{,}05\,\Omega\cdot\text{m}$. Determine (a) a concentração de portadores $n$; (b) a mobilidade $\mu$; (c) o tipo de semicondutor (n ou p).

**E7 —** Para o alumínio ($n=1{,}81\times10^{29}\,\text{m}^{-3}$, $\sigma = 3{,}5\times10^{7}\,\text{S/m}$, velocidade de Fermi $v_F = 2{,}03\times10^{6}\,\text{m/s}$), use o modelo de Drude para calcular (a) o tempo de relaxação $\tau$; (b) o livre caminho médio $\ell$.

**E8 —** Um fio de alumínio (mesmo $\sigma$ do E7) tem comprimento $2\,\text{m}$ e diâmetro $1{,}5\,\text{mm}$. Calcule sua resistência $R$ usando a Lei de Ohm pontual integrada ao longo do fio.

**E9 —** Uma carga puntiforme $q=5\,\text{nC}$ está a $d=3\,\text{cm}$ de um plano condutor aterrado infinito. Calcule (a) a força sobre $q$ pelo método das imagens; (b) a densidade superficial de carga induzida no ponto do plano mais próximo da carga (diretamente "abaixo" dela).

**E10 —** Uma carga $q=8\,\text{nC}$ está a $d=20\,\text{cm}$ do centro de uma esfera condutora aterrada de raio $a=5\,\text{cm}$. Determine (a) a carga imagem $q'$ e sua posição $b$; (b) a força entre a carga e a esfera, sem aproximações.

**E11 —** Um dielétrico linear com $\varepsilon_r = 5$ preenche a região entre as placas de um capacitor, onde o campo elétrico vale $E = 2\times10^{5}\,\text{V/m}$. Calcule (a) a polarização $P$; (b) o deslocamento elétrico $D$; (c) a densidade superficial de carga ligada $\sigma_b$ na face do dielétrico voltada para a placa positiva.

**E12 —** Um capacitor de placas paralelas tem área $A = 25\,\text{cm}^2$, separação $d=0{,}5\,\text{mm}$, preenchido com dielétrico de $\varepsilon_r=6{,}0$ (mica). Calcule sua capacitância.

**E13 —** Um cabo coaxial tem raio interno $a=1\,\text{mm}$, raio externo $b=6\,\text{mm}$, comprimento $L=0{,}8\,\text{m}$, dielétrico de polietileno ($\varepsilon_r=2{,}1$). Calcule a capacitância do cabo.

**E14 —** Duas cascas esféricas condutoras concêntricas, de raios $a=2\,\text{cm}$ e $b=5\,\text{cm}$, estão separadas por vácuo. Calcule a capacitância do sistema.

**E15 —** Três capacitores, $C_1=3\,\mu\text{F}$, $C_2=6\,\mu\text{F}$ e $C_3=2\,\mu\text{F}$, são combinados: $C_1$ e $C_2$ em série, e essa combinação em paralelo com $C_3$. Calcule a capacitância equivalente total.

**E16 —** Um capacitor de placas paralelas com $A=10\,\text{cm}^2$, $d=2\,\text{mm}$, dielétrico de vidro ($\varepsilon_r=4$, rigidez dielétrica $E_{\text{max}}=25\,\text{MV/m}$), é carregado até o limiar de ruptura. Calcule (a) a capacitância; (b) a tensão máxima suportada; (c) a energia máxima armazenada.

**E17 —** Um circuito RC em série tem $R=2{,}2\,\text{k}\Omega$, $C=100\,\mu\text{F}$ e fonte $\mathcal{E}=9\,\text{V}$. No instante $t=0{,}3\,\text{s}$ após o fechamento da chave (capacitor inicialmente descarregado), calcule (a) a constante de tempo $\tau$; (b) a carga $Q(t)$; (c) a corrente $I(t)$.

**E18 (Desafio) —** Três dielétricos lineares são empilhados entre as placas de um capacitor de área $A=20\,\text{cm}^2$, formando três camadas em série (mesma área, espessuras e permissividades diferentes): camada 1 ($d_1=0{,}5\,\text{mm}$, $\varepsilon_{r1}=3{,}0$), camada 2 ($d_2=0{,}3\,\text{mm}$, $\varepsilon_{r2}=5{,}0$), camada 3 ($d_3=0{,}2\,\text{mm}$, $\varepsilon_{r3}=2{,}5$). Mostre que o sistema equivale a três capacitores de placas paralelas em série e calcule a capacitância equivalente.

**E19 (Desafio) —** Uma barra semicondutora de comprimento $L=2\,\text{mm}$ e seção transversal constante $A_{bar}=1\,\text{mm}^2$ possui dopagem tipo n **não uniforme** ao longo do comprimento: $N_d(x) = N_{d0}\left(1+\dfrac{x}{L}\right)$, com $N_{d0}=10^{16}\,\text{cm}^{-3}$, $x\in[0,L]$, mobilidade $\mu_n=1350\,\text{cm}^2/\text{V·s}$ constante (despreze buracos). Escreva $\sigma(x)$, monte a integral para a resistência total $R=\int_0^L \dfrac{dx}{\sigma(x)A_{bar}}$ e calcule seu valor numérico.

**E20 (Desafio) —** Uma carga puntiforme $q=6\,\text{nC}$ está posicionada no canto formado por dois planos condutores aterrados semi-infinitos, perpendiculares entre si (um no plano $x=0$, outro no plano $y=0$, ambos ocupando a região $x,y\ge0$ para $z$ qualquer). A carga está em $(x_0,y_0) = (4\,\text{cm},\,3\,\text{cm})$. Usando três cargas-imagem (generalização do método da Seção “Dedução: carga puntiforme sobre plano condutor aterrado” por superposição — duas imagens negativas e uma positiva), calcule o vetor força resultante sobre $q$.

## Gabarito

**E1 —**

Área da seção: $A=\pi r^2 = \pi(0{,}8\times10^{-3})^2 = 2{,}011\times10^{-6}\,\text{m}^2$.

Densidade de corrente: $J = I/A = 15/(2{,}011\times10^{-6})$.

$$
\boxed{A = 2{,}011\times10^{-6}\,\text{m}^2,\qquad J = 7{,}460\times10^{6}\,\text{A/m}^2}
$$

Velocidade de deriva, de $\vec{J}=nq\vec{v}_d$ (com $q=e$, um elétron por portador em módulo): $v_d = J/(ne)$.

$$
v_d = \frac{7{,}460\times10^{6}}{(8{,}5\times10^{28})(1{,}602\times10^{-19})}
$$

$$
\boxed{v_d \approx 5{,}479\times10^{-4}\,\text{m/s} \approx 0{,}548\,\text{mm/s}}
$$

Note como a velocidade de deriva é minúscula frente às velocidades térmicas/Fermi dos elétrons — o sinal elétrico se propaga rapidamente (campo), mas o transporte líquido de carga é extremamente lento.

**E2 —**

Da equação da continuidade (Seção “Dedução física”):

$$
\frac{\partial\rho}{\partial t} = -\nabla\cdot\vec{J}
$$

Para $\vec{J} = \dfrac{J_0 e^{-t/\tau_0}}{r^2}\hat{r}$, o divergente em coordenadas esféricas de um campo puramente radial $\hat r/r^2$ é:

$$
\nabla\cdot\vec{J} = \frac{1}{r^2}\frac{\partial}{\partial r}\left(r^2 \cdot \frac{J_0e^{-t/\tau_0}}{r^2}\right) = \frac{1}{r^2}\frac{\partial}{\partial r}\left(J_0 e^{-t/\tau_0}\right) = 0 \quad (r\neq 0)
$$

Ou seja, para $r>0$ o divergente de $\vec{J}$ é nulo (a forma $\hat r/r^2$ é a mesma do campo de uma fonte puntiforme, divergente livre fora da origem — análogo ao campo de Coulomb). Logo:

$$
\boxed{\frac{\partial\rho}{\partial t} = 0 \quad \text{para } r>0}
$$

Isso significa que **toda** a dependência temporal de $\rho$ está concentrada na origem ($r=0$, uma fonte/sumidouro puntiforme de carga cuja intensidade decai como $e^{-t/\tau_0}$); em qualquer casca finita $r_1<r<r_2$ (que exclui a origem), não há acúmulo local de carga — a corrente que entra na casca é igual à que sai, em cada instante. Consequentemente, a carga contida em qualquer casca $[r_1,r_2]$ permanece constante no tempo (**não** decai com $\tau_0$; apenas o fluxo através de cada superfície esférica decai, pois $I(r,t) = \oint\vec J\cdot d\vec A = 4\pi J_0 e^{-t/\tau_0}$, sendo o mesmo para qualquer $r$ — consistente com $\nabla\cdot\vec J=0$ fora da origem).

$$
\boxed{Q_{[r_1,r_2]}(t) = \text{constante}, \qquad I(r,t) = 4\pi J_0\,e^{-t/\tau_0}\ \text{(mesmo valor em qualquer } r>0)}
$$

**E3 —**

Comparando com a tabela da Seção “Condutores, Isolantes, Dielétricos e Semicondutores”:

(a) $\sigma = 6{,}3\times10^{7}\,\text{S/m}$ está na faixa $10^6$–$10^8\,\text{S/m}$ →

$$
\boxed{\text{Condutor (metal)} - \text{elétrons de condução quase livres na banda de condução}}
$$

(valor próximo ao da prata, o melhor condutor metálico usual).

(b) $\sigma = 2{,}5\times10^{-2}\,\text{S/m}$ está na faixa $10^{-6}$–$10^{4}\,\text{S/m}$ →

$$
\boxed{\text{Semicondutor} - \text{poucos portadores livres, gerados termicamente ou por dopagem; } \sigma \text{ sensível a } T}
$$

(c) $\sigma = 10^{-13}\,\text{S/m}$ está abaixo de $10^{-10}\,\text{S/m}$ →

$$
\boxed{\text{Isolante/dielétrico} - \text{elétrons fortemente ligados; sem portadores livres, só polarização}}
$$

**E4 —**

Condutividade intrínseca: $\sigma_i = e\,n_i(\mu_n+\mu_p)$, com $n_i$ em m$^{-3}$ e mobilidades em m²/V·s.

Conversão: $n_i = 2{,}4\times10^{13}\,\text{cm}^{-3} = 2{,}4\times10^{19}\,\text{m}^{-3}$; $\mu_n=3900\,\text{cm}^2/\text{V·s}=3900\times10^{-4}\,\text{m}^2/\text{V·s}=0{,}39\,\text{m}^2/\text{V·s}$; $\mu_p=1900\times10^{-4}=0{,}19\,\text{m}^2/\text{V·s}$.

$$
\sigma_i = (1{,}602\times10^{-19})(2{,}4\times10^{19})(0{,}39+0{,}19)
$$

$$
\boxed{\sigma_i \approx 2{,}230\,\text{S/m}}
$$

Comparando com $\sigma_{Si}\approx2{,}7\times10^{-4}\,\text{S/m}$: o germânio intrínseco é cerca de **quatro ordens de grandeza mais condutor** que o silício intrínseco à mesma temperatura — consequência direta do gap de energia menor do Ge ($0{,}67\,\text{eV}$ vs. $1{,}12\,\text{eV}$ do Si), que aparece no expoente $e^{-E_g/2k_BT}$ e domina a concentração intrínseca de portadores.

**E5 —**

Com $n\approx N_d = 10^{16}\,\text{cm}^{-3} = 10^{22}\,\text{m}^{-3}$ e $\mu_n = 1350\,\text{cm}^2/\text{V·s}=0{,}135\,\text{m}^2/\text{V·s}$, e desprezando buracos ($p\ll n$):

$$
\sigma_n = e\,n\,\mu_n = (1{,}602\times10^{-19})(10^{22})(0{,}135)
$$

$$
\boxed{\sigma_n \approx 216{,}3\,\text{S/m}}
$$

$$
\boxed{\rho_{res} = \frac{1}{\sigma_n} \approx 4{,}624\times10^{-3}\,\Omega\cdot\text{m}}
$$

Note como essa dopagem moderada eleva a condutividade em ~6 ordens de grandeza acima do Si intrínseco (E4 dá contexto de escala), ilustrando por que a dopagem controlada é a base de toda a eletrônica de semicondutores.

**E6 —**

(a) Da relação do coeficiente de Hall $R_H = 1/(nq)$ (Seção “Semicondutores”), isolando $n$:

$$
n = \frac{1}{R_H\,e} = \frac{1}{(4{,}5\times10^{-4})(1{,}602\times10^{-19})}
$$

$$
\boxed{n \approx 1{,}387\times10^{22}\,\text{m}^{-3} = 1{,}387\times10^{16}\,\text{cm}^{-3}}
$$

(b) Mobilidade a partir de $\mu = |R_H|/\rho_{res}$ (Seção “Semicondutores”):

$$
\mu = \frac{4{,}5\times10^{-4}}{0{,}05} = 9{,}0\times10^{-3}\,\text{m}^2/\text{V·s}
$$

$$
\boxed{\mu = 90{,}0\,\text{cm}^2/\text{V·s}}
$$

(c) O enunciado indica que o sinal de $R_H$ corresponde a portadores majoritários **negativos** (elétrons) — logo:

$$
\boxed{\text{Semicondutor tipo n}}
$$

**E7 —**

(a) Da relação de Drude $\sigma = ne^2\tau/m \Rightarrow \tau = \dfrac{m\sigma}{ne^2}$:

$$
\tau = \frac{(9{,}109\times10^{-31})(3{,}5\times10^{7})}{(1{,}81\times10^{29})(1{,}602\times10^{-19})^2}
$$

$$
\boxed{\tau \approx 6{,}863\times10^{-15}\,\text{s} = 6{,}863\,\text{fs}}
$$

(b) Livre caminho médio $\ell = v_F\tau$:

$$
\ell = (2{,}03\times10^{6})(6{,}863\times10^{-15})
$$

$$
\boxed{\ell \approx 1{,}393\times10^{-8}\,\text{m} = 139{,}3\,\text{Å}}
$$

Compatível com a ordem de grandeza citada na Seção “Modelo de Drude — detalhes e limitações” (dezenas de Å) para metais em temperatura ambiente.

**E8 —**

Área da seção do fio: $A = \pi(d/2)^2 = \pi(0{,}75\times10^{-3})^2 = 1{,}767\times10^{-6}\,\text{m}^2$.

Usando $R = \dfrac{\ell}{\sigma A}$ (Seção “Dedução da forma macroscópica a partir da pontual”), com $\ell=2\,\text{m}$ e $\sigma=3{,}5\times10^{7}\,\text{S/m}$ (E7):

$$
R = \frac{2{,}0}{(3{,}5\times10^{7})(1{,}767\times10^{-6})}
$$

$$
\boxed{R \approx 0{,}0323\,\Omega = 32{,}3\,\text{m}\Omega}
$$

**E9 —**

(a) Força pelo método das imagens (Seção “Força sobre a carga real”), com carga imagem $-q$ em $z=-d$, separação total $2d$:

$$
F = \frac{1}{4\pi\varepsilon_0}\frac{q^2}{(2d)^2} = \frac{(5\times10^{-9})^2}{4\pi(8{,}854\times10^{-12})(0{,}06)^2}
$$

$$
\boxed{F \approx 6{,}242\times10^{-5}\,\text{N}\ \text{(atrativa, em direção ao plano)}}
$$

(b) Densidade de carga induzida diretamente abaixo da carga ($x=y=0$, ponto de máxima magnitude), da Seção “Carga induzida na superfície do condutor”:

$$
\sigma_{ind}(0,0) = -\frac{qd}{2\pi d^3} = -\frac{q}{2\pi d^2}
$$

$$
\sigma_{ind} = -\frac{5\times10^{-9}}{2\pi(0{,}03)^2}
$$

$$
\boxed{\sigma_{ind} \approx -8{,}842\times10^{-7}\,\text{C/m}^2}
$$

**E10 —**

(a) Da Seção “Método das imagens: carga externa a uma esfera condutora aterrada”: $q' = -q\,\dfrac{a}{d} = -(8\times10^{-9})\dfrac{0{,}05}{0{,}20}$:

$$
\boxed{q' = -2{,}0\times10^{-9}\,\text{C} = -2{,}0\,\text{nC}}
$$

Posição da imagem: $b = a^2/d = (0{,}05)^2/0{,}20$:

$$
\boxed{b = 0{,}0125\,\text{m} = 1{,}25\,\text{cm} \text{ do centro}}
$$

(b) Como a esfera é aterrada, existe apenas a imagem $q'$. A força sobre a carga real é igual à força de Coulomb exercida por essa imagem:

$$
F = \frac{1}{4\pi\varepsilon_0}\frac{q\,q'}{(d-b)^2}
$$

Com $d-b = 0{,}20-0{,}0125 = 0{,}1875\,\text{m}$:

$$
F = \frac{1}{4\pi(8{,}854\times10^{-12})}\frac{(8\times10^{-9})(-2\times10^{-9})}{(0{,}1875)^2}
$$

$$
\boxed{F \approx -4{,}09\times10^{-6}\,\text{N}\ \text{(sinal negativo: atrativa, em direção à esfera)}}
$$

*Verificação algébrica*: substituindo $q'=-qa/d$ e $d-b=(d^2-a^2)/d$, obtém-se diretamente $F=-\dfrac{1}{4\pi\varepsilon_0}\dfrac{q^2ad}{(d^2-a^2)^2}$, a expressão da Seção “Método das imagens: carga externa a uma esfera condutora aterrada”.

**E11 —**

(a) Polarização em dielétrico linear (Seção “Materiais lineares: susceptibilidade e permissividade relativa”): $P = \varepsilon_0(\varepsilon_r-1)E$:

$$
P = (8{,}854\times10^{-12})(5-1)(2\times10^{5})
$$

$$
\boxed{P \approx 7{,}083\times10^{-6}\,\text{C/m}^2}
$$

(b) Deslocamento elétrico $D=\varepsilon_0\varepsilon_r E$:

$$
D = (8{,}854\times10^{-12})(5)(2\times10^{5})
$$

$$
\boxed{D \approx 8{,}854\times10^{-6}\,\text{C/m}^2}
$$

(Verificação: $D = \varepsilon_0 E + P = 8{,}854\times10^{-12}\times2\times10^5 + 7{,}083\times10^{-6} = 1{,}771\times10^{-6}+7{,}083\times10^{-6}=8{,}854\times10^{-6}\,\text{C/m}^2$ ✓.)

(c) Carga ligada superficial $\sigma_b = \vec P\cdot\hat n$ (Seção “Cargas de polarização (ligadas)”); na face voltada para a placa positiva, $\hat n$ aponta contra o campo aplicado pela placa (a face do dielétrico ali é negativa, atraída pela placa positiva), mas em módulo:

$$
\boxed{|\sigma_b| = P \approx 7{,}083\times10^{-6}\,\text{C/m}^2}
$$

**E12 —**

Capacitor de placas paralelas (Seção “Dedução: capacitor de placas paralelas”): $C = \dfrac{\varepsilon_r\varepsilon_0 A}{d}$, com $A=25\times10^{-4}\,\text{m}^2$, $d=0{,}5\times10^{-3}\,\text{m}$:

$$
C = \frac{(6{,}0)(8{,}854\times10^{-12})(25\times10^{-4})}{0{,}5\times10^{-3}}
$$

$$
\boxed{C \approx 265{,}62\,\text{pF}}
$$

**E13 —**

Capacitor cilíndrico (Seção “Dedução: capacitor cilíndrico (cabo coaxial)”): $C = \dfrac{2\pi\varepsilon_r\varepsilon_0 L}{\ln(b/a)}$, com $a=1\,\text{mm}$, $b=6\,\text{mm}$, $L=0{,}8\,\text{m}$, $\varepsilon_r=2{,}1$:

$$
\ln(b/a) = \ln(6) \approx 1{,}7918
$$

$$
C = \frac{2\pi(2{,}1)(8{,}854\times10^{-12})(0{,}8)}{1{,}7918}
$$

$$
\boxed{C \approx 52{,}16\,\text{pF}}
$$

**E14 —**

Capacitor esférico (Seção “Capacitor esférico”): $C = 4\pi\varepsilon_0\,\dfrac{ab}{b-a}$, com $a=0{,}02\,\text{m}$, $b=0{,}05\,\text{m}$:

$$
C = 4\pi(8{,}854\times10^{-12})\frac{(0{,}02)(0{,}05)}{0{,}05-0{,}02}
$$

$$
\boxed{C \approx 3{,}709\,\text{pF}}
$$

**E15 —**

Associação série de $C_1$ e $C_2$ (Seção “Capacitores em série e paralelo”):

$$
C_s = \frac{C_1 C_2}{C_1+C_2} = \frac{(3)(6)}{3+6} = 2{,}0\,\mu\text{F}
$$

Essa combinação em paralelo com $C_3$:

$$
C_{eq} = C_s + C_3 = 2{,}0 + 2{,}0
$$

$$
\boxed{C_{eq} = 4{,}0\,\mu\text{F}}
$$

**E16 —**

(a) Capacitância: $C=\dfrac{\varepsilon_r\varepsilon_0 A}{d} = \dfrac{(4)(8{,}854\times10^{-12})(10\times10^{-4})}{2\times10^{-3}}$:

$$
\boxed{C \approx 17{,}71\,\text{pF}}
$$

(b) Tensão máxima antes da ruptura, $V_{max}=E_{max}\,d = (25\times10^{6})(2\times10^{-3})$:

$$
\boxed{V_{max} = 50\,000\,\text{V} = 50\,\text{kV}}
$$

(c) Energia máxima, $U_{max}=\dfrac12 C V_{max}^2$:

$$
U_{max} = \frac12(17{,}71\times10^{-12})(5\times10^{4})^2
$$

$$
\boxed{U_{max} \approx 22{,}14\times10^{-3}\,\text{J} = 22{,}14\,\text{mJ}}
$$

(Consistente com a forma equivalente $U_{max}=\tfrac12\varepsilon E_{max}^2(Ad)$ da Seção “Ruptura Dielétrica”.)

**E17 —**

(a) Constante de tempo: $\tau = RC = (2200)(100\times10^{-6})$:

$$
\boxed{\tau = 0{,}22\,\text{s}}
$$

(b) Carga no instante $t=0{,}3\,\text{s}$ (Seção “Circuito RC em série com fonte DC”), com $Q(0)=0$:

$$
Q(t) = C\mathcal{E}\left(1-e^{-t/\tau}\right) = (100\times10^{-6})(9)\left(1-e^{-0{,}3/0{,}22}\right)
$$

$$
e^{-0{,}3/0{,}22} = e^{-1{,}3636}\approx0{,}2557
$$

$$
Q(t) = (9\times10^{-4})(1-0{,}2557)
$$

$$
\boxed{Q(0{,}3\,\text{s}) \approx 6{,}698\times10^{-4}\,\text{C} = 669{,}8\,\mu\text{C}}
$$

(c) Corrente no mesmo instante:

$$
I(t) = \frac{\mathcal{E}}{R}e^{-t/\tau} = \frac{9}{2200}(0{,}2557)
$$

$$
\boxed{I(0{,}3\,\text{s}) \approx 1{,}046\times10^{-3}\,\text{A} = 1{,}046\,\text{mA}}
$$

**E18 (Desafio) —**

Cada camada, isolada, comporta-se como um capacitor de placas paralelas com a mesma área $A$ das demais (a superfície entre camadas é equipotencial só na direção do campo — não há mudança de área). A carga livre $Q$ nas placas externas é igual à carga superficial ligada acumulada em cada interface, e cada camada suporta uma queda de tensão parcial $V_i = Q\,d_i/(\varepsilon_{ri}\varepsilon_0 A)$; a tensão total é a soma:

$$
V = \sum_i V_i = \frac{Q}{\varepsilon_0 A}\sum_i \frac{d_i}{\varepsilon_{ri}}
$$

Logo $C_{eq}=Q/V$ tem exatamente a forma de três capacitores de placas paralelas $C_i=\varepsilon_{ri}\varepsilon_0A/d_i$ **em série**:

$$
\frac{1}{C_{eq}} = \frac{1}{C_1}+\frac{1}{C_2}+\frac{1}{C_3}, \qquad C_i = \frac{\varepsilon_{ri}\varepsilon_0 A}{d_i}
$$

Calculando cada capacitância parcial ($A=20\times10^{-4}\,\text{m}^2$):

$$
C_1 = \frac{(3{,}0)(8{,}854\times10^{-12})(20\times10^{-4})}{0{,}5\times10^{-3}} \approx 106{,}25\,\text{pF}
$$

$$
C_2 = \frac{(5{,}0)(8{,}854\times10^{-12})(20\times10^{-4})}{0{,}3\times10^{-3}} \approx 295{,}13\,\text{pF}
$$

$$
C_3 = \frac{(2{,}5)(8{,}854\times10^{-12})(20\times10^{-4})}{0{,}2\times10^{-3}} \approx 221{,}35\,\text{pF}
$$

Combinando em série:

$$
\frac{1}{C_{eq}} = \frac{1}{106{,}25}+\frac{1}{295{,}13}+\frac{1}{221{,}35}\ \ (\text{pF}^{-1})
$$

$$
\boxed{C_{eq} \approx 57{,}74\,\text{pF}}
$$

(Equivalentemente, $C_{eq} = \varepsilon_0 A\Big/\big(\sum_i d_i/\varepsilon_{ri}\big)$, que fornece o mesmo valor — forma útil para generalizar a $N$ camadas.)

**E19 (Desafio) —**

Com dopagem não uniforme $N_d(x) = N_{d0}(1+x/L)$ e mobilidade constante, a condutividade local é:

$$
\sigma(x) = e\,N_d(x)\,\mu_n = e\,\mu_n\,N_{d0}\left(1+\frac{x}{L}\right)
$$

A barra pode ser vista como uma sequência de resistores infinitesimais em série (mesma seção $A_{bar}$, mas $\sigma$ variando com $x$), cada um com resistência $dR = \dfrac{dx}{\sigma(x)A_{bar}}$. A resistência total:

$$
R = \int_0^L \frac{dx}{e\,\mu_n\,N_{d0}\left(1+\dfrac{x}{L}\right)A_{bar}} = \frac{1}{e\mu_n N_{d0}A_{bar}}\int_0^L\frac{dx}{1+x/L}
$$

Fazendo $u=1+x/L$, $du=dx/L$:

$$
\int_0^L\frac{dx}{1+x/L} = L\int_1^2\frac{du}{u} = L\ln(2)
$$

$$
\boxed{R = \frac{L\ln 2}{e\,\mu_n\,N_{d0}\,A_{bar}}}
$$

Substituindo $L=2\times10^{-3}\,\text{m}$, $\mu_n=1350\times10^{-4}\,\text{m}^2/\text{V·s}=0{,}135\,\text{m}^2/\text{V·s}$, $N_{d0}=10^{16}\,\text{cm}^{-3}=10^{22}\,\text{m}^{-3}$, $A_{bar}=1\times10^{-6}\,\text{m}^2$:

$$
R = \frac{(2\times10^{-3})(0{,}6931)}{(1{,}602\times10^{-19})(0{,}135)(10^{22})(1\times10^{-6})}
$$

$$
\boxed{R \approx 6{,}41\,\Omega}
$$

Como verificação, a resistência de uma barra com dopagem **uniforme** igual a $N_{d0}$ (extremidade menos dopada) seria $R_0 = L/(e\mu_nN_{d0}A_{bar}) \approx 9{,}25\,\Omega$; como a dopagem real cresce ao longo de $x$ (barra mais condutora na média), é esperado $R<R_0$, o que se confirma ($6{,}41\,\Omega < 9{,}25\,\Omega$).

**E20 (Desafio) —**

Para satisfazer $V=0$ simultaneamente nos dois planos aterrados ($x=0$ e $y=0$), usa-se a superposição de três imagens (extensão direta da ideia da Seção “Dedução: carga puntiforme sobre plano condutor aterrado”, aplicada duas vezes):

- $-q$ em $(-x_0, y_0)$ — anula $V$ no plano $x=0$;
- $-q$ em $(x_0, -y_0)$ — anula $V$ no plano $y=0$;
- $+q$ em $(-x_0, -y_0)$ — necessária para que as duas imagens anteriores não violem a condição de contorno uma da outra (a superposição das quatro cargas garante $V=0$ nos dois planos simultaneamente).

Com $q=6\,\text{nC}$, $x_0=0{,}04\,\text{m}$, $y_0=0{,}03\,\text{m}$, calcula-se a força resultante sobre $q$ somando vetorialmente as três interações coulombianas:

$$
\vec F = \frac{1}{4\pi\varepsilon_0}\left[\frac{q(-q)}{r_1^2}\hat r_1 + \frac{q(-q)}{r_2^2}\hat r_2 + \frac{q(q)}{r_3^2}\hat r_3\right]
$$

onde $r_1$ é a distância até a imagem em $(-x_0,y_0)$ (igual a $2x_0=0{,}08\,\text{m}$, força puramente em $-\hat x$), $r_2$ é a distância até a imagem em $(x_0,-y_0)$ (igual a $2y_0=0{,}06\,\text{m}$, força puramente em $-\hat y$), e $r_3=2\sqrt{x_0^2+y_0^2}=2(0{,}05)=0{,}10\,\text{m}$ é a distância até a imagem diagonal em $(-x_0,-y_0)$ (força repulsiva, ao longo da direção que une as duas cargas, apontando para longe da origem).

Calculando componente a componente (unidades SI):

$$
F_{1x} = -\frac{1}{4\pi\varepsilon_0}\frac{q^2}{(2x_0)^2} \qquad F_{2y} = -\frac{1}{4\pi\varepsilon_0}\frac{q^2}{(2y_0)^2}
$$

e decompondo a repulsão diagonal $F_3=\dfrac{1}{4\pi\varepsilon_0}\dfrac{q^2}{r_3^2}$ nas direções $\hat x,\hat y$ proporcionalmente a $(x_0,y_0)/\sqrt{x_0^2+y_0^2}$, a soma vetorial resulta em:

$$
\boxed{F_x \approx -2{,}467\times10^{-5}\,\text{N}, \qquad F_y \approx -7{,}046\times10^{-5}\,\text{N}}
$$

$$
\boxed{|\vec F| \approx 7{,}466\times10^{-5}\,\text{N}}
$$

O sinal negativo em ambas as componentes confirma que a força resultante aponta para dentro do canto (em direção aos dois planos), ou seja, a carga é **atraída** simultaneamente pelas duas superfícies condutoras aterradas — generalização natural do resultado de atração vista no caso de um único plano (Seção “Força sobre a carga real”).
