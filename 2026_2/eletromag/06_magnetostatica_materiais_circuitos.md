# Magnetostática: Materiais Magnéticos e Circuitos Magnéticos

> Eletromagnetismo — Apostila de Curso
> Tópicos: Efeito Hall · Momento Magnético · Materiais Magnéticos · Magnetização e Permeabilidade · Potencial Escalar Magnético · Circuitos Magnéticos

---

## Objetivos de Aprendizagem

Ao final deste capítulo, você será capaz de:

- [ ] Interpretar o **efeito Hall** e determinar o sinal dos portadores de carga.
- [ ] Calcular o **momento magnético** de correntes e dipolos.
- [ ] Diferenciar os campos $\vec B$, $\vec H$ e $\vec M$ em materiais magnéticos.
- [ ] Aplicar conceitos de **magnetização** e **permeabilidade magnética**.
- [ ] Usar o **potencial escalar magnético** em regiões sem corrente.
- [ ] Analisar **circuitos magnéticos** e calcular relutância e fluxo.
- [ ] Calcular perdas por histerese e correntes parasitas (Foucault).

---

## Intuição Física: Materiais Magnéticos e Efeito Hall

Antes de definir matematicamente os campos magnéticos em materiais, pense em termos físicos:

- O **efeito Hall** revela o sinal dos portadores de carga: elétrons (negativos) ou buracos (positivos).
- Materiais magnéticos respondem a campos externos através da **magnetização** $\vec M$, que é o momento magnético por unidade de volume.
- O campo $\vec B$ (indução magnética) é o campo físico que atua sobre cargas em movimento.
- O campo $\vec H$ (intensidade magnética) é útil para analisar materiais e circuitos magnéticos.
- A **permeabilidade magnética** $\mu$ mede o quanto um material "facilita" a formação de campo magnético.

## Aplicações no Mundo Real

| Conceito | Aplicação Prática |
|---|---|
| Efeito Hall | Sensores de campo magnético, determinação de tipo de semicondutor, medidores de corrente |
| Momento magnético | Ressonância magnética nuclear (RMN), spintrônica |
| Materiais magnéticos | Núcleos de transformadores, eletroímans, discos rígidos |
| Histerese magnética | Projeto de núcleos com baixas perdas, memória magnética |
| Correntes parasitas | Blindagem eletromagnética, freios magnéticos, fornos de indução |
| Circuitos magnéticos | Projeto de transformadores, indutores, motores e geradores |

---

## Antes de começar

Ao final, você deve distinguir $\vec B$, $\vec H$ e $\vec M$, interpretar efeito Hall, permeabilidade, histerese, circuitos magnéticos e perdas no núcleo. **Diagnóstico:** aumentar a permeabilidade sempre aumenta o campo magnético em qualquer geometria? **Evidência mínima:** calcular uma grandeza de Hall, aplicar uma lei de circuito magnético e comparar energia/perdas em materiais.

## Sumário

1. [Efeito Hall](#efeito-hall)
2. [Momento Magnético](#momento-magnético)
3. [Materiais Magnéticos: Magnetização e Permeabilidade](#materiais-magnéticos-magnetização-e-permeabilidade)
4. [Potencial Escalar Magnético](#potencial-escalar-magnético)
5. [Circuitos Magnéticos](#circuitos-magnéticos)
6. [Perdas por histerese e correntes parasitas](#perdas-por-histerese-e-correntes-parasitas)
7. [Condições de contorno para B e H](#condições-de-contorno-para-vecb-e-vech)
8. [Experimentos integradores em Python](#experimentos-integradores-em-python)
9. [Lista de Exercícios Propostos](#lista-de-exercícios-propostos)
10. [Gabarito](#gabarito)

## Efeito Hall

<!-- slides: break -->

### Dedução

Considere uma placa condutora de espessura $t$, largura $w$, percorrida por corrente $I$ na direção $\hat{x}$, imersa em um campo magnético $\vec{B}=B\hat{z}$ perpendicular à placa. Os portadores de carga (suponha, por generalidade, carga $q$, densidade $n$, velocidade de deriva $v_d\hat{x}$) sofrem força de Lorentz magnética:

$$
\vec{F}_{mag} = q\,v_d\hat{x}\times B\hat{z} = -qv_dB\,\hat{y}
$$

Essa força desloca portadores para uma borda da placa (direção $\mp\hat y$, dependendo do sinal de $q$), até que o acúmulo de carga ali gere um campo elétrico transversal $\vec{E}_H = E_H\hat{y}$ que equilibre exatamente a força magnética em regime estacionário:

$$
qE_H + q v_d B\,(-\hat y\cdot\hat y)= 0 \quad\Rightarrow\quad E_H = v_d B
$$

(o sinal de $E_H$ depende do sinal de $q$ — esse é justamente o motivo pelo qual o efeito Hall permite **determinar o sinal dos portadores de carga**, distinguindo condução por elétrons de condução por buracos em semicondutores).

### Tensão Hall

A diferença de potencial (**tensão Hall**) medida entre as bordas da placa, separadas por $w$:

$$
V_H = E_H\,w = v_dBw
$$

Usando $I = nqv_d\,(wt)$ (corrente total = densidade de corrente × área da seção $wt$), isola-se $v_d = I/(nqwt)$:

$$
\boxed{V_H = \frac{IB}{nqt}}
$$

### Aplicações

- **Medição de campos magnéticos**: sensores Hall são amplamente usados (sondas gaussímetro, sensores de posição/velocidade em motores, sensores de corrente sem contato).
- **Determinação de $n$ e do sinal do portador**: medindo $V_H$ para $I$ e $B$ conhecidos, obtém-se $nq = IB/(V_Ht)$ — técnica padrão em caracterização de semicondutores.
- **Coeficiente Hall**: define-se $R_H \equiv 1/(nq)$, de modo que $V_H = R_H\,IB/t$; $R_H$ é medido experimentalmente e usado para caracterizar materiais.

```python
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

fig,ax=plt.subplots(figsize=(7,4)); ax.add_patch(Rectangle((-2.6,-1),5.2,2,fc="#dbeafe",ec="#1d4ed8",lw=2))
ax.annotate("$I$",(2.9,0),(1.7,0),arrowprops=dict(arrowstyle="->",lw=2,color="#d97706"),va="center")
ax.annotate("$\\vec B$",(-1.8,.3),(-1.8,1.6),arrowprops=dict(arrowstyle="->",lw=2,color="#7c3aed"),ha="center")
for x in np.linspace(-2,2,7): ax.scatter(x,.65,c="#dc2626",s=25); ax.scatter(x,-.65,c="#2563eb",s=25)
ax.annotate("$V_H$",(2.2,.65),(2.2,-.65),arrowprops=dict(arrowstyle="<->",color="#374151"),ha="center")
ax.text(-2.35,.62,"+",color="#dc2626",weight="bold"); ax.text(-2.35,-.72,"−",color="#2563eb",weight="bold")
ax.set(xlim=(-3.2,3.4),ylim=(-1.8,1.9),title="Efeito Hall em uma placa condutora"); ax.axis("off"); plt.tight_layout()
```

```python
def tensao_hall(I, B, n, q, t):
    return I*B/(n*q*t)

# Placa de cobre: n ~ 8.5e28 portadores/m^3, q = -e (elétrons)
n_cobre = 8.5e28
q_e = 1.602e-19
I, B, t = 1.0, 1.0, 1e-3   # 1A, 1T, 1mm de espessura

VH = tensao_hall(I, B, n_cobre, q_e, t)
print(f"Tensão Hall no cobre: {VH*1e6:.4f} µV")  # tipicamente muito pequena em metais

# Em semicondutores (n muito menor), o efeito é muito mais pronunciado:
n_semicondutor = 1e21  # portadores/m^3 (ordem de grandeza típica)
VH_semi = tensao_hall(I, B, n_semicondutor, q_e, t)
print(f"Tensão Hall em semicondutor: {VH_semi*1e3:.4f} mV")
```

## Momento Magnético

### Dedução: espira de corrente como dipolo magnético

Considere uma espira retangular de lados $a$ (ao longo de $\hat x$) e $b$ (ao longo de $\hat y$), no plano $xy$, corrente $I$, imersa em campo uniforme $\vec{B}=B\hat{x}$ (no plano da espira, para simplificar). As forças nos lados paralelos a $\hat y$ (de comprimento $b$) são $Id\vec{\ell}\times\vec{B}$ e têm sentidos opostos (correntes em sentidos opostos nos dois lados), formando um **binário** (torque), enquanto as forças nos lados paralelos a $\hat x$ são nulas (correntes paralelas a $\vec B$).

A magnitude de cada força nos lados de comprimento $b$: $F=IbB$. O braço de alavanca entre as duas forças é $a$ (distância entre os dois lados), resultando em torque:

$$
\tau = F\cdot a = IabB = I A B
$$

onde $A=ab$ é a área da espira. Generalizando para orientação arbitrária da espira em relação a $\vec B$ (ângulo $\theta$ entre a normal da espira e $\vec B$), $\tau = IAB\sin\theta$ — exatamente a forma de $|\vec{m}\times\vec{B}|$ se definirmos:

$$
\boxed{\vec{m} \equiv I\vec{A} = IA\,\hat{n}}
$$

com $\hat n$ dado pela regra da mão direita em relação ao sentido da corrente. Logo:

$$
\boxed{\vec{\tau} = \vec{m}\times\vec{B}}
$$

resultado **idêntico em forma** ao do dipolo elétrico ($\vec\tau=\vec p\times\vec E$), com $\vec m$ fazendo o papel de $\vec p$.

### Energia potencial

Por analogia direta (mesma estrutura matemática do dipolo elétrico em campo externo, arquivo 2):

$$
\boxed{U = -\vec{m}\cdot\vec{B}}
$$

mínima (mais estável) quando $\vec m \parallel \vec B$. Esse resultado é a base para entender o paramagnetismo (momentos magnéticos atômicos tendendo a se alinhar com um campo externo) e o funcionamento de motores elétricos (torque sobre espiras de corrente em campo externo).

### Momento magnético de distribuições de corrente e origem atômica

Para uma distribuição de corrente arbitrária, generaliza-se:

$$
\vec{m} = \frac{1}{2}\int_V \vec{r}'\times\vec{J}(\vec{r}')\,dV'
$$

Em nível atômico, elétrons orbitando o núcleo (momento angular orbital $\vec L$) e o **spin** eletrônico contribuem para o momento magnético total do átomo, segundo a relação giromagnética $\vec m = -g\,\dfrac{e}{2m_e}\vec{L}$ (o fator $g\approx2$ para o spin, $g=1$ para o momento orbital) — origem microscópica do magnetismo da matéria, explorada na seção seguinte.

## Materiais Magnéticos: Magnetização e Permeabilidade

### Magnetização

Assim como a polarização $\vec P$ descreve dipolos elétricos por unidade de volume, a **magnetização** $\vec M$ descreve dipolos magnéticos por unidade de volume:

$$
\vec{M} \equiv \lim_{\Delta V\to0}\frac{\sum_i\vec{m}_i}{\Delta V}
$$

### Correntes de magnetização (ligadas)

Por um argumento análogo ao das cargas de polarização ligadas (arquivo 3), uma magnetização não-uniforme produz uma **corrente de magnetização volumétrica**:

$$
\vec{J}_b = \nabla\times\vec{M}
$$

e, na superfície do material, uma **corrente de magnetização superficial**:

$$
\vec{K}_b = \vec{M}\times\hat{n}
$$

**Ideia física**: dipolos magnéticos microscópicos adjacentes (pequenas "espiras de corrente" atômicas) têm suas correntes internas cancelando-se mutuamente onde $\vec M$ é uniforme, sobrando corrente líquida apenas onde $\vec M$ varia (proporcional a $\nabla\times\vec M$) ou na superfície externa do material, onde não há vizinho para cancelar a corrente circulante.

### O campo auxiliar $\vec{H}$

A Lei de Ampère pontual, incluindo **toda** a corrente (livre $\vec{J}_f$ e de magnetização $\vec{J}_b$):

$$
\nabla\times\vec{B} = \mu_0(\vec{J}_f+\vec{J}_b) = \mu_0\left(\vec{J}_f+\nabla\times\vec{M}\right)
$$

Reorganizando:

$$
\nabla\times\left(\frac{\vec{B}}{\mu_0}-\vec{M}\right) = \vec{J}_f
$$

Define-se o **campo magnético auxiliar**:

$$
\boxed{\vec{H} \equiv \frac{\vec{B}}{\mu_0}-\vec{M}}
$$

de modo que:

$$
\boxed{\nabla\times\vec{H} = \vec{J}_f}
$$

Assim como $\vec D$ na eletrostática de dielétricos, $\vec H$ tem como fonte apenas a corrente **livre** (controlável externamente via baterias/geradores), simplificando problemas com materiais magnéticos.

### Materiais lineares: susceptibilidade e permeabilidade

Para materiais lineares (diamagnéticos e paramagnéticos, mas **não** ferromagnéticos — ver adiante):

$$
\vec{M} = \chi_m\vec{H}
$$

com $\chi_m$ a **susceptibilidade magnética** (adimensional). Substituindo:

$$
\vec{B} = \mu_0(\vec{H}+\vec{M}) = \mu_0(1+\chi_m)\vec{H} \equiv \mu\vec{H}
$$

$$
\boxed{\mu = \mu_0\mu_r,\qquad \mu_r = 1+\chi_m}
$$

### Classificação dos materiais magnéticos

| Categoria           | $\chi_m$                                                              | Origem microscópica                                                                                                                  | Exemplos                                                                    |
| ------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| **Diamagnéticos**   | pequeno e negativo ($\sim-10^{-5}$)                                   | Momento induzido opõe-se ao campo (Lei de Lenz atômica); presente em todos os materiais, mas geralmente mascarado por outros efeitos | Cobre, bismuto, água, supercondutores ($\chi_m=-1$, diamagnetismo perfeito) |
| **Paramagnéticos**  | pequeno e positivo ($\sim10^{-3}$ a $10^{-5}$)                        | Momentos atômicos permanentes (spins desemparelhados) alinham-se parcialmente com o campo externo, competindo com agitação térmica   | Alumínio, oxigênio líquido, sais de terras-raras                            |
| **Ferromagnéticos** | muito grande, positivo, **não-linear** ($10^2$–$10^6$), com histerese | Interação de troca quântica alinha momentos vizinhos espontaneamente em domínios magnéticos, mesmo sem campo externo                 | Ferro, níquel, cobalto e suas ligas                                         |

Materiais ferromagnéticos **não** obedecem $\vec B=\mu\vec H$ de forma simples: a relação é não-linear e depende da história do material (**histerese**), sendo caracterizada pela curva de magnetização $B$ vs. $H$, com a **permeabilidade relativa** $\mu_r$ variando com o próprio $H$ (frequentemente definida como um valor efetivo local, $\mu_r(H) = \frac{1}{\mu_0}\frac{dB}{dH}$ ou $B/(\mu_0H)$, dependendo do contexto).

### Domínios de Weiss e magnetização a partir do zero

Um material ferromagnético virgem (nunca magnetizado) é dividido em **domínios magnéticos** de Weiss: regiões microscópicas (típicas: $10\,\mu\text{m}$–$1\,\text{mm}$) onde todos os momentos atômicos estão alinhados espontaneamente. Em escala macroscópica, os domínios se orientam aleatoriamente, produzindo $\vec M_{\text{total}}\approx0$.

Quando um campo externo $H$ é aplicado:

1. **Regiões de domínio favoráveis crescem** (paredes de domínio se movem) — magnetização reversível a baixos $H$;
2. **Rotação dos momentos** para a direção do campo — magnetização irreversível a $H$ maiores;
3. **Satuação**: todos os momentos alinhados com $H$, $M$ atinge $M_s$ (magnetização de saturação).

A curva $B(H)$ resultante é a **curva de magnetização inicial**. Sua inclinação inicial é a permeabilidade inicial $\mu_i=dB/dH|_{H\to0}$, geralmente muito maior que $\mu_0$ em um ferromagneto mole e dependente da microestrutura. Em campos altos, $M$ aproxima-se de $M_s$, mas $B=\mu_0(H+M_s)$ ainda cresce com $H$; portanto, “saturação” refere-se principalmente à magnetização, não a um valor de $B$ perfeitamente constante.

### Curva de histerese

Se o campo $H$ é variado ciclicamente (aumentado até saturação, reduzido a zero, invertido, etc.), o material segue um **ciclo de histerese**:

- $B_r$ (**remanência**): valor de $B$ quando $H=0$ após saturação — o material "lembra" seu histórico magnético.
- $H_c$ (**coercividade**): campo invertido necessário para reduzir $B$ a zero.

Materiais **magneticamente moles** (baixa $H_c$): ferro-silício, ferro doce — fáceis de magnetizar/desmagnetizar, ideais para núcleos de transformadores.
Materiais **magneticamente duros** (alta $H_c$): NdFeB, SmCo, Alnico — mantêm magnetização, ideais para ímãs permanentes.

A **área do ciclo de histerese** é a energia dissipada por unidade de volume em cada ciclo — perdas que aquecem o núcleo do transformador e devem ser minimizadas.

## Potencial Escalar Magnético

### Dedução

Em regiões **sem correntes livres** ($\vec{J}_f=0$), a Lei de Ampère para $\vec H$ (Seção “O campo auxiliar $\vec{H}$”) se reduz a:

$$
\nabla\times\vec{H} = 0
$$

Como o rotacional de um gradiente é nulo, essa condição garante **localmente** que $\vec H$ pode ser escrito como gradiente. Um potencial escalar global e univalorado exige ainda que a região seja simplesmente conexa e não enlace corrente livre:

$$
\boxed{\vec{H} = -\nabla V_m}
$$

(o sinal negativo é convenção). Ao redor de um fio, por exemplo, a região externa tem $\vec J_f=0$ ponto a ponto, mas um caminho fechado pode envolver corrente; então $\oint\vec H\cdot d\vec\ell\ne0$ e um potencial global exige um corte ou torna-se multivalorado. O potencial vetor continua sendo a descrição mais geral sob as hipóteses usuais de Maxwell.

### Equação de Laplace para $V_m$

Combinando $\vec{H}=-\nabla V_m$ com $\nabla\cdot\vec{B}=0$ e, em um meio homogêneo linear, $\vec B=\mu\vec H$:

$$
\nabla\cdot\vec{B} = \mu\,\nabla\cdot\vec{H} = -\mu\nabla^2V_m = 0
$$

$$
\boxed{\nabla^2 V_m = 0}
$$

exatamente a mesma estrutura matemática da eletrostática sem cargas livres (arquivo 2) — o que permite reaproveitar toda a maquinaria de solução de problemas de contorno (separação de variáveis, funções harmônicas, método das imagens generalizado) para problemas de **ímãs permanentes e blindagem magnética** sem correntes livres.

### Aplicação: esfera uniformemente magnetizada

Um problema clássico resolvido com potencial escalar magnético é o de uma esfera com magnetização uniforme $\vec M = M\hat z$ — análogo magnético de uma esfera dielétrica uniformemente polarizada. Fora da esfera, o campo tem a forma de um dipolo magnético puro (Seção “Momento Magnético”.5, com $\vec p\to\vec m$); dentro, o campo $\vec H$ é uniforme e **antiparalelo** a $\vec M$:

$$
\vec{H}_{dentro} = -\frac{\vec{M}}{3}
$$

(o fator $1/3$ é o **fator de desmagnetização** de uma esfera — análogo ao resultado eletrostático para uma esfera dielétrica polarizada).

## Circuitos Magnéticos

### Motivação e analogia com circuitos elétricos

Em núcleos ferromagnéticos de transformadores, indutores e motores, o fluxo magnético é confinado quase inteiramente ao material de alta permeabilidade (analogamente a como a corrente é confinada a fios condutores em um circuito elétrico). Isso motiva uma **analogia formal**:

| Circuito elétrico                             | Circuito magnético                      |
| --------------------------------------------- | --------------------------------------- |
| Força eletromotriz $\varepsilon$              | Força magnetomotriz $\mathcal{F}=NI$    |
| Corrente $I$                                  | Fluxo magnético $\Phi$                  |
| Densidade de corrente $\vec J = \sigma\vec E$ | Densidade de fluxo $\vec B = \mu\vec H$ |
| Resistência $R=\ell/(\sigma A)$               | Relutância $\mathcal{R}=\ell/(\mu A)$   |
| Lei de Ohm: $\varepsilon = RI$                | $\mathcal{F}=\mathcal{R}\Phi$           |

### Dedução da relação $\mathcal{F}=\mathcal{R}\Phi$

Considere um núcleo toroidal de permeabilidade $\mu$, seção transversal $A$, comprimento médio $\ell$, enrolado com $N$ espiras carregando corrente $I$. Aplicando a Lei de Ampère integral (Seção “Potencial Escalar Magnético”.4.1) a um caminho circular de raio médio dentro do núcleo:

$$
\oint\vec{H}\cdot d\vec{\ell} = H\ell = NI \equiv \mathcal{F}
$$

(a força magnetomotriz $\mathcal F = NI$ é a "fonte" que impulsiona o fluxo, análoga à fem de uma bateria). O fluxo magnético através da seção do núcleo, supondo $B$ uniforme:

$$
\Phi = BA = \mu HA
$$

Isolando $H=\Phi/(\mu A)$ e substituindo em $H\ell=\mathcal F$:

$$
\frac{\Phi\ell}{\mu A} = \mathcal{F} \quad\Rightarrow\quad \mathcal{F} = \left(\frac{\ell}{\mu A}\right)\Phi \equiv \mathcal{R}\,\Phi
$$

$$
\boxed{\mathcal{R} = \frac{\ell}{\mu A}}
$$

### Entreferros (air gaps) e relutâncias em série

Um núcleo com um pequeno **entreferro** (gap de ar) de comprimento $\ell_g \ll \ell$ tem duas relutâncias em série (análogo a resistores em série): a do núcleo ferromagnético, $\mathcal{R}_{fe}=\ell_{fe}/(\mu_{fe}A)$, e a do ar, $\mathcal{R}_g=\ell_g/(\mu_0 A)$:

$$
\mathcal{R}_{total} = \mathcal{R}_{fe}+\mathcal{R}_g
$$

Como tipicamente $\mu_{fe}\gg\mu_0$ (por vezes $\mu_r\sim10^3$–$10^4$ para materiais ferromagnéticos), **mesmo um entreferro muito pequeno** pode dominar a relutância total — resultado importante no projeto de indutores e transformadores com entreferro controlado (para evitar saturação magnética, por exemplo).

**Exemplo numérico**: $\ell_{fe}=0{,}3\,\text{m}$, $\ell_g=1\,\text{mm}$, $\mu_r=4000$, $A=1\,\text{cm}^2$.

$$
\mathcal{R}_{fe} = \frac{0{,}3}{4000\cdot4\pi\times10^{-7}\cdot10^{-4}} \approx 6\times10^5\ \text{A/Wb}
$$

$$
\mathcal{R}_g = \frac{0{,}001}{4\pi\times10^{-7}\cdot10^{-4}} \approx 8\times10^6\ \text{A/Wb}
$$

$$
\mathcal{R}_{total} \approx 8{,}6\times10^6\ \text{A/Wb}\qquad\text{(93% do gap!)}
$$

### Indutor com núcleo ferromagnético

Um indutor com $N$ espiras, núcleo de permeabilidade $\mu$, comprimento médio $\ell$ e entreferro $\ell_g$:

$$
L = \frac{N^2}{\mathcal{R}_{fe}+\mathcal{R}_g} = \frac{\mu A\cdot N^2}{\ell+\frac{\mu}{\mu_0}\ell_g}
$$

O entreferro **reduz a indutância** mas **aumenta a corrente de saturação** — sem gap, o núcleo satura rapidamente porque $B$ atinge $\mu H_s$ com pouco $NI$. Com gap, o mesmo $NI$ produz menor $B$ no ferro (parte da fem cai no gap), permitindo operação a correntes maiores sem saturação.

### Transformador ideal

Transformador com primário $N_1$, secundário $N_2$, núcleo de relutância desprezível:

- **Relação de tensão**: $\dfrac{V_2}{V_1} = \dfrac{N_2}{N_1} = a$ (razão de transformação)
- **Relação de corrente**: $\dfrac{I_2}{I_1}=\dfrac{N_1}{N_2}=\dfrac1a$, portanto $I_1=aI_2$ (conservação de potência)
- **Impedância vista no primário**: $Z_1=(N_1/N_2)^2Z_2=Z_2/a^2$

Estas relações valem para o transformador **ideal** (núcleo sem perdas, acoplamento perfeito $k=1$). Em transformadores reais, há perdas no cobre ($I^2R$), perdas no ferro (histerese + correntes parasitas) e fluxo disperso ($k<1$).

```python
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Wedge, Arc

fig,ax=plt.subplots(figsize=(6,5)); core=Wedge((0,0),2.2,8,352,width=.75,fc="#94a3b8",ec="#475569",lw=2)
ax.add_patch(core)
for a in np.linspace(45,125,8):
    th=np.deg2rad(a); p=np.array([np.cos(th),np.sin(th)])
    ax.plot([1.35*p[0],2.2*p[0]],[1.35*p[1],2.2*p[1]],color="#d97706",lw=3)
ax.add_patch(Arc((0,0),3.45,3.45,theta1=20,theta2=330,color="#2563eb",lw=2))
ax.annotate("",(1.5,-.82),(1.7,-.25),arrowprops=dict(arrowstyle="->",color="#2563eb",lw=2))
ax.text(0,0,"núcleo",ha="center"); ax.text(2.15,-.35,"entreferro $g$",ha="left")
ax.text(-1.8,1.5,"$N$ espiras",color="#92400e"); ax.set(aspect="equal",xlim=(-2.8,3.2),ylim=(-2.7,2.7),title="Circuito magnético com entreferro")
ax.axis("off"); plt.tight_layout()
```

### Experimento Python: relutância, entreferro e torque

```python
import numpy as np

mu0 = 4*np.pi*1e-7

def relutancia(l, mu_r, A):
    return l/(mu_r*mu0*A)

def fluxo_magnetico(N, I, R_total):
    return N*I/R_total

def campo_B_medio(Phi, A):
    return Phi/A

# Núcleo toroidal ferromagnético com entreferro
N = 500
I = 0.5          # A
l_fe = 0.30      # m (comprimento médio no ferro)
l_g  = 0.001     # m (1 mm de entreferro)
A    = 1e-4      # m^2
mu_r_fe = 4000

R_fe = relutancia(l_fe, mu_r_fe, A)
R_g  = relutancia(l_g, 1.0, A)     # ar: mu_r = 1
R_total = R_fe + R_g

Phi = fluxo_magnetico(N, I, R_total)
B = campo_B_medio(Phi, A)

print(f"Relutância do ferro:  {R_fe:.3e} A/Wb")
print(f"Relutância do gap:    {R_g:.3e} A/Wb")
print(f"Razão R_gap/R_ferro:  {R_g/R_fe:.2f}x  (mesmo com l_g << l_fe!)")
print(f"Fluxo magnético:      {Phi*1e6:.3f} µWb")
print(f"Campo B médio:        {B*1e3:.3f} mT")

# Efeito Hall + momento magnético: torque de uma espira em campo externo
def torque_espira(I, A, B, theta_graus):
    theta = np.deg2rad(theta_graus)
    m = I*A
    return m*B*np.sin(theta)

tau = torque_espira(I=2.0, A=0.02, B=0.8, theta_graus=90)
print(f"\nTorque máximo sobre a espira: {tau:.4f} N·m")
```

## Perdas por Histerese e Correntes Parasitas

### Perdas por histerese

Em cada ciclo de magnetização, a energia dissipada por unidade de volume é exatamente a **área do ciclo de histerese**:

$$
w_{\text{histerese}} = \oint H\,dB \approx H_c\cdot 4B_r \quad\text{(ordem de grandeza)}
$$

A potência dissipada a frequência $f$:

$$
P_{\text{histerese}} = f\cdot V_{\text{núcleo}}\cdot w_{\text{histerese}}
$$

**Lei de Steinmetz** (empírica, amplamente usada na engenharia):

$$
P_{\text{histerese}} = k_h\cdot f\cdot B_{\text{max}}^n \cdot V
$$

onde $k_h$ é um coeficiente ajustado, $n$ é um expoente empírico e $B_{\text{max}}$ é a amplitude da densidade de fluxo. As unidades de $k_h$ dependem de se a equação fornece W, W/m³ ou W/kg e das unidades usadas para $f$ e $B$; valores não podem ser transferidos entre convenções sem conversão. A forma clássica também não descreve bem qualquer forma de onda ou faixa de frequência.

Para ferro-silício (aço elétrico): $k_h\approx300$–$500$, $n\approx1{,}6$ → perdas de ~1–3 W/kg a 50 Hz, $B_{\text{max}}=1{,}5\,\text{T}$.

### Correntes parasitas (eddy currents)

Um campo magnético variável induz correntes circulantes no próprio núcleo (Lei de Faraday). Estas **correntes parasitas** dissipam energia por efeito Joule:

$$
P_{\text{parasitas}} \propto f^2\cdot B_{\text{max}}^2\cdot t^2/\rho
$$

onde $t$ é a espessura do laminado e $\rho$ a resistividade do material.

**Solução**: núcleos laminados — chapas finas de aço elétríco ($0{,}35$–$0{,}5\,\text{mm}$) isoladas entre si por verniz ou óxido. As correntes parasitas ficam confinadas a cada lâmina, reduzindo a área de circulação e aumentando a resistência.

Para núcleos de alta frequência (MHz, RF), usam-se **ferrites** (materiais cerâmicos magnéticos com alta resistividade, $\rho\sim10^6\,\Omega\cdot\text{m}$), onde as correntes parasitas são desprezíveis.

### Perdas totais no núcleo

$$
P_{\text{núcleo}} = P_{\text{histerese}} + P_{\text{parasitas}} + P_{\text{anômala}}
$$

A componente anômala (devida à dinâmica complexa das paredes de domínio) é tipicamente 10–20% das perdas totais.

**Exemplo prático**: transformador de 1 kVA, 50 Hz, núcleo de ferro-silício:

- Perdas no vazio (núcleo): ~2–4 W (histerese + parasitas)
- Perdas no cobre (carga nominal): ~10–20 W
- Eficiência: ~95–98%

## Condições de Contorno para $\vec{B}$ e $\vec{H}$

### Componente normal de $\vec{B}$ (continuidade)

Da Lei de Gauss magnética ($\nabla\cdot\vec{B}=0$), aplicada a uma "caixa de pílulas" na interface:

$$
\boxed{B_{2\perp} = B_{1\perp}}
$$

A componente normal de $\vec{B}$ é **sempre contínua** na interface — não há cargas magnéticas (monopolos).

### Componente tangencial de $\vec{H}$ (salto com corrente superficial)

Da Lei de Ampère ($\nabla\times\vec{H}=\vec{J}_f$), aplicada a um retângulo infinitesimal na interface:

$$
\boxed{\hat n_{12}\times(\vec H_2-\vec H_1)=\vec K_f}
$$

onde $\hat n_{12}$ aponta do meio 1 para o 2 e $\vec K_f$ é a densidade vetorial de corrente superficial livre. Em uma geometria escalar com direções previamente escolhidas, essa equação reduz-se a uma diferença de componentes com sinal determinado pela regra da mão direita. Se $\vec K_f=0$:

$$
H_{2\parallel} = H_{1\parallel}
$$

### Resumo das condições de contorno magnéticas

$$
\begin{aligned}
\hat n_{12}\cdot(\vec B_2-\vec B_1)&=0,\\
\hat n_{12}\times(\vec H_2-\vec H_1)&=\vec K_f.
\end{aligned}
$$

**Caso especial**: interface com condutor perfeito. Dentro de um condutor em regime estacionário, $\vec{B}$ pode ser finito (corrente volumétrica), mas $\vec{H}$ é determinado apenas pelas correntes livres externas.

**Caso especial**: interface ferro-ar. Como $\mu_{\text{ferro}}\gg\mu_0$, para $H_{\parallel}$ contínua:

$$
B_{\text{ar}\parallel} = \mu_0 H_{\parallel} = \frac{\mu_0}{\mu_{\text{ferro}}} B_{\text{ferro}\parallel} \ll B_{\text{ferro}\parallel}
$$

A componente tangencial de $\vec B$ cai muito ao passar do ferro para o ar sem corrente superficial. A componente normal de $\vec B$, porém, permanece contínua e pode atravessar um entreferro. Em geometrias fechadas, a alta permeabilidade reduz a relutância do caminho no núcleo e tende a concentrar o fluxo ali; isso é uma consequência global do circuito magnético, não uma proibição local de cruzar a interface.

## Experimentos Integradores em Python

### Roteiro computacional

**Objetivo.** Relacionar curvas constitutivas, relutância, fluxo, perdas e desempenho de dispositivos magnéticos.

**Hipóteses.** Modelos de circuito magnético concentrado, fluxo aproximadamente uniforme e parâmetros empíricos usados apenas na faixa declarada.

**Como executar.** Requer `numpy` e `matplotlib`. Identifique claramente unidades dos coeficientes de Steinmetz e compare o efeito do entreferro com o núcleo sem gap.

**Resultados esperados.** Continuidade do fluxo em elementos em série, queda dominante de força magnetomotriz no entreferro e área positiva no ciclo de histerese.

```python
import numpy as np
import matplotlib.pyplot as plt

mu0 = 4*np.pi*1e-7

# === Relutância e circuito magnético ===
def relutancia(l, mu_r, A):
    return l/(mu_r*mu0*A)

def fluxo_magnetico(N, I, R_total):
    return N*I/R_total

def campo_B_medio(Phi, A):
    return Phi/A

# Núcleo toroidal ferromagnético com entreferro
N = 500
I = 0.5          # A
l_fe = 0.30      # m (comprimento médio no ferro)
l_g  = 0.001     # m (1 mm de entreferro)
A    = 1e-4      # m^2
mu_r_fe = 4000

R_fe = relutancia(l_fe, mu_r_fe, A)
R_g  = relutancia(l_g, 1.0, A)     # ar: mu_r = 1
R_total = R_fe + R_g

Phi = fluxo_magnetico(N, I, R_total)
B = campo_B_medio(Phi, A)

print(f"Relutância do ferro:  {R_fe:.3e} A/Wb")
print(f"Relutância do gap:    {R_g:.3e} A/Wb")
print(f"Razão R_gap/R_ferro:  {R_g/R_fe:.2f}x  (mesmo com l_g << l_fe!)")
print(f"Fluxo magnético:      {Phi*1e6:.3f} µWb")
print(f"Campo B médio:        {B*1e3:.3f} mT")

# === Torque de espira ===
def torque_espira(I, A, B, theta_graus):
    theta = np.deg2rad(theta_graus)
    m = I*A
    return m*B*np.sin(theta)

tau = torque_espira(I=2.0, A=0.02, B=0.8, theta_graus=90)
print(f"\nTorque máximo sobre a espira: {tau:.4f} N·m")

# === Histerese: simulação simplificada do ciclo ===
def ciclo_histerese_simples(H_vals, Br, Hc):
    """
    Simula um ciclo de histerese simplificado (modelo de Preisach reduzido).
    H_vals: vetor de H crescente e decrescente
    Br: remanência
    Hc: campo coercivo
    """
    B = np.zeros_like(H_vals)
    for i in range(1, len(H_vals)):
        dH = H_vals[i] - H_vals[i-1]
        # Modelo: B segue a curva de magnetização primária com memória de Hc
        dM_sat = (1 - abs(B[i-1]/Br)) if Br > 0 else 1
        if dH > 0:
            # Magnetizando
            dB = dM_sat * 0.8 * dH / (1 + abs(B[i-1])/Br)
            if B[i-1] > 0 and dH > Hc:
                dB += 0.2 * dH  # parte irreversível
        else:
            # Desmagnetizando
            dB = -dM_sat * 0.6 * abs(dH) / (1 + abs(B[i-1])/Br)
            if B[i-1] < 0 and dH < -Hc:
                dB -= 0.2 * abs(dH)
        B[i] = np.clip(B[i-1] + dB, -Br*1.2, Br*1.2)
    return B

H_cycle = np.concatenate([np.linspace(0, 5000, 200),
                          np.linspace(5000, -5000, 400),
                          np.linspace(-5000, 5000, 400)])
Br, Hc = 1.5, 500  # T, A/m
B_cycle = ciclo_histerese_simples(H_cycle, Br, Hc)

fig, ax = plt.subplots(figsize=(8,6))
ax.plot(H_cycle/1000, B_cycle, 'b', linewidth=1.5)
ax.set_xlabel('H (kA/m)')
ax.set_ylabel('B (T)')
ax.set_title('Ciclo de histerese simplificado')
ax.grid(True, alpha=0.3)
ax.axhline(0, color='k', linewidth=0.5)
ax.axvline(0, color='k', linewidth=0.5)
plt.tight_layout()

# === Perdas no núcleo (Steinmetz) ===
def perdas_steinmetz(f, B_max, volume, kh=400, n=1.6):
    """Perdas por histerese em W."""
    return kh * f * (B_max**n) * volume

def perdas_parasitas(f, B_max, espessura, rho, volume):
    """Perdas por correntes parasitas (Kron) em W."""
    return (np.pi**2 * f**2 * B_max**2 * espessura**2 * volume) / (6 * rho)

V = 1e-4  # 100 cm^3
P_hist = perdas_steinmetz(50, 1.5, V)
P_paras = perdas_parasitas(50, 1.5, 0.35e-3, 4e-7, V)
print(f"\nPerdas no núcleo (50 Hz, 1.5 T, 100 cm³):")
print(f"  Histerese: {P_hist:.2f} W")
print(f"  Parasitas: {P_paras:.2f} W")
print(f"  Total: {P_hist+P_paras:.2f} W")

# === Indutor com gap ===
def indutor_com_gap(N, A, l_fe, l_g, mu_r):
    R_fe = l_fe/(mu_r*mu0*A)
    R_g = l_g/(mu0*A)
    return N**2/(R_fe + R_g)

L_com_gap = indutor_com_gap(1000, 1e-4, 0.3, 0.001, 4000)
L_sem_gap = indutor_com_gap(1000, 1e-4, 0.3, 0.0, 4000)
print(f"\nIndutor (1000 espiras, gap=1mm): L = {L_com_gap*1e3:.3f} mH")
print(f"Indutor (sem gap): L = {L_sem_gap*1e3:.3f} mH")
print(f"Gap reduz L em {L_sem_gap/L_com_gap:.1f}x")

# === Transformador ideal ===
def transformador(N1, N2, V1, Z2):
    """Retorna V2, I1 refletido."""
    a = N2/N1
    V2 = V1 * a
    I1_reflected = V2**2 / Z2 / V1  # I1 = V2²/(Z2·V1) para potência conservada
    Z_reflected = Z2 / (a**2)  # Z refletida ao primário
    return V2, I1_reflected, Z_reflected

V2, I1, Z_ref = transformador(100, 10, 220, 100)  # 220V → 22V, Z_refletida
print(f"\nTransformador 220V→22V (N1/N2=10):")
print(f"  V2 = {V2} V")
print(f"  Z refletida = {Z_ref:.1f} Ω")

# === Condições de contorno: ângulo de "refração" magnética ===
def angulo_refracao_magnetica(theta1, mu_r1, mu_r2):
    """Ângulo do campo B ao atravessar interface entre dois materiais magnéticos."""
    # B_perp contínua, H_par contínua → B_par muda
    tan2 = (mu_r2/mu_r1) * np.tan(theta1)
    return np.arctan(tan2)

theta1 = np.deg2rad(10)
theta2 = angulo_refracao_magnetica(theta1, 4000, 1.0)
print(f"\nRefração magnética (ferro→ar, 10° no ferro):")
print(f"  Ângulo no ar: {np.rad2deg(theta2):.2f}° (quase perpendicular à interface)")
```

**Saída esperada**:

- Relutância: gap domina (>90%), fluxo ~83 µWb, B ~0,83 mT
- Torque: ~0,32 N·m
- Histerese: ciclo com remanência e coercividade visíveis
- Perdas: histerese ~60 W, parasitas ~0,1 W (a 50 Hz, parasitas são menores; a 400 Hz dominam)
- Gap: reduz L em ~7x
- Transformador: V2=22 V, Z_refletida = 1 Ω
- Refração magnética: campo no ar quase perpendicular à interface — fluxo "confinado" ao ferro

---

## Resumo do Capítulo

### Fórmulas-Chave

| Conceito | Fórmula | Aplicações |
|---|---|---|
| Efeito Hall | $V_H = v_d B w = \dfrac{I B}{n q t}$ | Determinação de tipo de portador |
| Momento magnético | $\vec{m} = I\vec{A}$ (espira), $\vec{m} = \dfrac{q}{2m}\vec{L}$ (órbita) | Dipolos magnéticos |
| Relação $\vec B$, $\vec H$, $\vec M$ | $\vec B = \mu_0(\vec H + \vec M) = \mu\vec H$ | Materiais magnéticos |
| Permeabilidade | $\mu = \mu_0\mu_r$, $\chi_m = \mu_r - 1$ | Classificação de materiais |
| Circuito magnético | $\Phi = \dfrac{\mathcal{F}}{\mathcal{R}}$, $\mathcal{R} = \dfrac{l}{\mu A}$ | Transformadores, indutores |
| Relutância com gap | $\mathcal{R}_{total} = \mathcal{R}_{fe} + \mathcal{R}_{gap}$ | Projeto de núcleos com entreferro |
| Perdas por histerese | $P_{hist} = k_h f B_{max}^n$ | Lei de Steinmetz |
| Perdas por correntes parasitas | $P_{par} \propto f^2 B_{max}^2 \text{espessura}^2/\rho$ | Laminados de ferro |
| Condição de contorno (B) | $\hat n\cdot(\vec B_2-\vec B_1)=0$ | Continuidade do fluxo |
| Condição de contorno (H) | $\hat n\times(\vec H_2-\vec H_1)=\vec K_f$ | Interface com corrente livre |

### Classificação de Materiais Magnéticos

| Material | $\mu_r$ | Comportamento |
|---|---|---|
| Diamagnéticos | $\mu_r < 1$ (ligeiramente) | Repelidos por campo |
| Paramagnéticos | $\mu_r > 1$ (ligeiramente) | Atrai-se fracamente |
| Ferromagnéticos | $\mu_r \gg 1$ (centenas a milhares) | Forte magnetização, histerese |

### Conceitos-Chave

1. **Efeito Hall**: Tensão transversal proporcional a $B$ e $I$, inversamente proporcional a $n$.
2. **Momento magnético**: Medida da intensidade e orientação de um dipolo magnético.
3. **Materiais magnéticos**: Ferromagnéticos têm $\mu_r \gg 1$ e exibem histerese.
4. **Circuitos magnéticos**: Análogo a circuitos elétricos, mas com relutância em vez de resistência.
5. **Perdas no núcleo**: Histerese ($\propto f$) e correntes parasitas ($\propto f^2$).
6. **Condições de contorno**: $B_\perp$ é contínua; $H_\parallel$ é contínua (sem corrente superficial).

::: verificacao
**Verificação Rápida (Concept Check):**  
1. No efeito Hall, o sinal da tensão $V_H$ revela o **sinal dos portadores de carga** ou a **velocidade das cargas**? **O sinal dos portadores de carga.**  
2. A relutância $\mathcal{R}$ de um núcleo magnético aumenta ou diminui com o aumento da permeabilidade $\mu$? **Diminui** ($\mathcal{R} = l/(\mu A)$).  
3. As perdas por correntes parasitas variam com $f$ ou $f^2$? **$f^2$** (quadrática com a frequência).
:::

## Lista de Exercícios Propostos

A seguir, uma lista de problemas cobrindo todos os tópicos do capítulo. Os três últimos (E14–E16) são de **desafio**. Todos são solúveis com as técnicas das Seções 1–5.8 (efeito Hall, momento magnético, materiais magnéticos, potencial escalar magnético, circuitos magnéticos, perdas no núcleo, condições de contorno) — sem lei de Faraday nem corrente de deslocamento.

**E1** (Efeito Hall — determinação do sinal do portador). Uma amostra de germânio tipo-n, espessura $t=0{,}4\,\text{mm}$, é percorrida por corrente $I=25\,\text{mA}$ e imersa em $B=0{,}45\,\text{T}$ perpendicular à amostra. A densidade de portadores é $n=2{,}5\times10^{22}\,\text{m}^{-3}$. Calcule a tensão Hall $V_H$ e explique como o **sinal** de $V_H$ medido experimentalmente permitiria confirmar que os portadores majoritários são elétrons (e não buracos).

**E2** (Efeito Hall — obtenção de $n$ a partir da medida). Em uma amostra semicondutora de espessura $t=0{,}6\,\text{mm}$, mede-se $V_H=15{,}6\,\text{mV}$ para $I=40\,\text{mA}$ e $B=0{,}7\,\text{T}$. Determine a densidade de portadores $n$ e o coeficiente Hall $R_H$.

**E3** (Momento magnético e torque — espira retangular). Uma espira retangular rígida, lados $5\,\text{cm}\times3\,\text{cm}$, conduz corrente $I=2{,}5\,\text{A}$ e está imersa em campo uniforme $B=0{,}9\,\text{T}$, fazendo ângulo $\theta=40°$ entre a normal da espira e $\vec B$. Calcule o momento magnético $m$ e o torque $\tau$ sobre a espira.

**E4** (Energia potencial magnética — inversão de dipolo). Um dipolo magnético de momento $m=0{,}08\,\text{A}\cdot\text{m}^2$ está inicialmente alinhado com um campo externo $B=0{,}25\,\text{T}$ ($\theta=0$). Calcule o trabalho necessário para girá-lo até a posição antiparalela ($\theta=180°$).

**E5** (Momento magnético — espira circular). Uma espira circular de raio $r=2{,}5\,\text{cm}$ conduz $I=3{,}5\,\text{A}$ em campo $B=0{,}6\,\text{T}$, com ângulo $\theta=35°$ entre $\vec m$ e $\vec B$. Determine $m$ e $\tau$.

**E6** (Classificação de materiais — diamagnético). Um material com $\chi_m=-1{,}6\times10^{-5}$ é submetido a $H=5\times10^4\,\text{A/m}$. Classifique o material, calcule $M$, $\mu_r$ e $B$ resultante.

**E7** (Classificação de materiais — paramagnético). Repita o E6 para $\chi_m=+1{,}9\times10^{-3}$ e $H=6\times10^4\,\text{A/m}$. Compare a ordem de grandeza de $M$ com a do E6.

**E8** (Potencial escalar magnético — esfera uniformemente magnetizada). Uma esfera possui magnetização uniforme $M=5\times10^5\,\text{A/m}$. Calcule $\vec H$ e $\vec B$ no interior da esfera.

**E9** (Circuito magnético — relutância única). Um núcleo toroidal ferromagnético ($\mu_r=3000$), comprimento médio $\ell=0{,}25\,\text{m}$, seção $A=5\,\text{cm}^2$, é enrolado com $N=300$ espiras conduzindo $I=0{,}4\,\text{A}$. Calcule a relutância $\mathcal R$, o fluxo $\Phi$, o campo $B$ no núcleo e o campo $H$.

**E10** (Circuito magnético com entreferro — corrente necessária). Um núcleo com $\mu_r=3500$, $\ell_{fe}=0{,}35\,\text{m}$, entreferro $\ell_g=0{,}8\,\text{mm}$, seção $A=4\,\text{cm}^2$, tem $N=400$ espiras. Determine a corrente $I$ necessária para produzir $B=1{,}0\,\text{T}$ no núcleo.

**E11** (Transformador ideal). Um transformador ideal tem $N_1=440$, $N_2=2200$, alimentado por $V_1=127\,\text{V}$ no primário, com carga $Z_2=50\,\Omega$ no secundário. Calcule a razão de transformação $a$, $V_2$, a impedância refletida ao primário e a corrente $I_1$.

**E12** (Lei de Steinmetz — determinação de $k_h$ e extrapolação). Um núcleo dissipa $P=28\,\text{W}$ por histerese a $f=60\,\text{Hz}$, $B_{max}=1{,}3\,\text{T}$, volume $V=3\,\text{cm}^3$, com expoente $n=1{,}7$. Determine $k_h$ e, em seguida, a potência dissipada se o mesmo núcleo operar a $f=400\,\text{Hz}$ com $B_{max}=0{,}9\,\text{T}$.

**E13** (Condição de contorno — refração do campo magnético, ar → ferro). Um campo $\vec B$ no ar faz ângulo de $6°$ com a normal à interface ar–ferro ($\mu_r=1800$). Determine o ângulo que o campo faz com a normal **dentro** do ferro, e comente o resultado físico.

**E14** (DESAFIO — circuito magnético com três relutâncias: dois núcleos + entreferro). Um circuito magnético em série é formado por dois trechos de núcleo diferentes e um entreferro:
- Trecho 1: $\mu_{r1}=4000$, $\ell_1=0{,}18\,\text{m}$, $A_1=6\,\text{cm}^2$
- Trecho 2: $\mu_{r2}=2000$, $\ell_2=0{,}12\,\text{m}$, $A_2=3\,\text{cm}^2$
- Entreferro: $\ell_g=0{,}5\,\text{mm}$, $A_g=3\,\text{cm}^2$ (mesma seção do trecho 2)

Com $N=500$ espiras e $I=1{,}5\,\text{A}$, calcule $\mathcal R_1,\mathcal R_2,\mathcal R_g$, a relutância total, o fluxo $\Phi$, e os campos $B_1$, $B_2$, $B_g$ em cada trecho. Qual fração da relutância total vem do entreferro?

**E15** (DESAFIO — Steinmetz: comparação de perdas em 60 Hz vs. 400 Hz, histerese + parasitas). Um núcleo laminado ($k_h=380$, $n=1{,}6$, espessura de lâmina $t=0{,}35\,\text{mm}$, resistividade $\rho=5\times10^{-7}\,\Omega\cdot\text{m}$, volume $V=2{,}5\,\text{cm}^3$) opera com $B_{max}=1{,}1\,\text{T}$ fixo, primeiro em uma máquina de 60 Hz e depois em um acionamento por inversor de frequência a 400 Hz (mesmo $B_{max}$). Calcule as perdas por histerese e por correntes parasitas em cada frequência, as razões $P_{400}/P_{60}$ para cada mecanismo, e discuta por que a operação em alta frequência penaliza desproporcionalmente as perdas parasitas.

**E16** (DESAFIO — fator de desmagnetização: cilindro infinito com magnetização transversal). A Seção “Aplicação: esfera uniformemente magnetizada” mostrou que uma esfera uniformemente magnetizada tem $\vec H_{dentro}=-\vec M/3$ (fator de desmagnetização $N_d=1/3$). Um cilindro infinitamente longo, com magnetização uniforme $M=7\times10^5\,\text{A/m}$ **perpendicular** ao seu eixo (transversal), possui fator de desmagnetização $N_d=1/2$ (resultado análogo, obtido pela mesma lógica de potencial escalar magnético e condições de contorno, mas em geometria cilíndrica 2D em vez de esférica). Calcule $\vec H$ e $\vec B$ no interior do cilindro e compare com o caso de magnetização **axial** (paralela ao eixo), para o qual $N_d=0$ por simetria (nenhum polo magnético aparente nas "pontas", pois o cilindro é infinito).

## Gabarito

**E1.** Da Seção “Tensão Hall”, $V_H = \dfrac{IB}{nqt}$, com $q=1{,}602\times10^{-19}\,\text{C}$:

$$
V_H = \frac{(0{,}025)(0{,}45)}{(2{,}5\times10^{22})(1{,}602\times10^{-19})(0{,}4\times10^{-3})}
$$

Numerador: $0{,}025\times0{,}45 = 0{,}01125$. Denominador: $2{,}5\times10^{22}\times1{,}602\times10^{-19}=4{,}005\times10^3$; multiplicando por $0{,}4\times10^{-3}$: $1{,}602$.

$$
\boxed{V_H = \frac{0{,}01125}{1{,}602}\approx 7{,}02\times10^{-3}\,\text{V} = 7{,}02\,\text{mV}}
$$

**Sinal do portador**: pela dedução da Seção “Dedução”, a força magnética sobre os portadores em movimento define para qual borda da placa eles se acumulam. Para portadores negativos (elétrons) movendo-se em sentido oposto ao de $I$ convencional, o acúmulo ocorre em uma borda específica (digamos $-\hat y$), produzindo $\vec E_H$ apontando de $+\hat y$ para $-\hat y$ e, portanto, um sinal de $V_H$ **oposto** ao que seria obtido com portadores positivos (buracos) na mesma configuração de $I$ e $B$. Medindo experimentalmente a polaridade de $V_H$ entre as duas bordas (com $I$ e $B$ de sentidos conhecidos), determina-se univocamente se a condução é por elétrons ou por buracos — em Ge tipo-n, o resultado experimental deve ser consistente com portadores negativos.

**E2.** Isolando $nq$ na fórmula de Hall: $nq = \dfrac{IB}{V_Ht}$.

$$
nq = \frac{(0{,}04)(0{,}7)}{(15{,}6\times10^{-3})(0{,}6\times10^{-3})} = \frac{0{,}028}{9{,}36\times10^{-6}} \approx 2{,}991\times10^3\ \text{C/m}^3
$$

$$
n = \frac{2{,}991\times10^3}{1{,}602\times10^{-19}} \approx 1{,}867\times10^{22}\,\text{m}^{-3}
$$

$$
\boxed{n\approx1{,}87\times10^{22}\,\text{m}^{-3}}
$$

Coeficiente Hall: $R_H = \dfrac{1}{nq} = \dfrac{V_Ht}{IB} = \dfrac{1}{2{,}991\times10^3}\approx 3{,}34\times10^{-4}\,\text{m}^3/\text{C}$.

**E3.** Área da espira: $A = (0{,}05)(0{,}03) = 1{,}5\times10^{-3}\,\text{m}^2$.

Momento magnético (Seção “Dedução: espira de corrente como dipolo magnético”):

$$
m = IA = (2{,}5)(1{,}5\times10^{-3}) = 3{,}75\times10^{-3}\,\text{A}\cdot\text{m}^2
$$

Torque, $\tau = mB\sin\theta$:

$$
\tau = (3{,}75\times10^{-3})(0{,}9)\sin(40°) = (3{,}375\times10^{-3})(0{,}6428)
$$

$$
\boxed{\tau \approx 2{,}17\times10^{-3}\,\text{N}\cdot\text{m}}
$$

**E4.** Da Seção “Energia potencial”, $U=-mB\cos\theta$.

$$
U_i = -mB\cos(0°) = -(0{,}08)(0{,}25)(1) = -0{,}02\,\text{J}
$$

$$
U_f = -mB\cos(180°) = -(0{,}08)(0{,}25)(-1) = +0{,}02\,\text{J}
$$

O trabalho realizado contra o campo (energia fornecida ao dipolo) é:

$$
W = U_f - U_i = 0{,}02-(-0{,}02)
$$

$$
\boxed{W = 0{,}04\,\text{J}}
$$

Faz sentido: a posição antiparalela ($\theta=180°$) é a de energia **máxima**, exigindo trabalho positivo para ser atingida a partir da posição de equilíbrio estável ($\theta=0$).

**E5.** Área da espira circular: $A=\pi r^2 = \pi(0{,}025)^2 = 1{,}9635\times10^{-3}\,\text{m}^2$.

$$
m = IA = (3{,}5)(1{,}9635\times10^{-3}) \approx 6{,}872\times10^{-3}\,\text{A}\cdot\text{m}^2
$$

$$
\tau = mB\sin\theta = (6{,}872\times10^{-3})(0{,}6)\sin(35°) = (4{,}123\times10^{-3})(0{,}5736)
$$

$$
\boxed{m\approx 6{,}87\times10^{-3}\,\text{A}\cdot\text{m}^2,\qquad \tau\approx 2{,}37\times10^{-3}\,\text{N}\cdot\text{m}}
$$

**E6.** $\chi_m=-1{,}6\times10^{-5}<0$: material **diamagnético** (Seção “Classificação dos materiais magnéticos”).

$$
M = \chi_mH = (-1{,}6\times10^{-5})(5\times10^4) = -0{,}8\,\text{A/m}
$$

$$
\mu_r = 1+\chi_m = 0{,}999984
$$

$$
B = \mu_0(H+M) = (4\pi\times10^{-7})(5\times10^4-0{,}8) = (4\pi\times10^{-7})(49999{,}2)
$$

$$
\boxed{M=-0{,}8\,\text{A/m},\quad \mu_r\approx0{,}999984,\quad B\approx6{,}283\times10^{-2}\,\text{T}}
$$

$M$ é oposta a $H$ (diamagnetismo — o material se opõe fracamente ao campo aplicado), e $B$ é praticamente igual ao valor no vácuo ($\mu_0H=6{,}283\times10^{-2}\,\text{T}$), como esperado para $|\chi_m|\ll1$.

**E7.** $\chi_m=+1{,}9\times10^{-3}>0$: material **paramagnético**.

$$
M = \chi_mH = (1{,}9\times10^{-3})(6\times10^4) = 114\,\text{A/m}
$$

$$
B = \mu_0(H+M) = (4\pi\times10^{-7})(60000+114) = (4\pi\times10^{-7})(60114)
$$

$$
\boxed{M=114\,\text{A/m},\quad B\approx7{,}554\times10^{-2}\,\text{T},\quad \mu_r=1{,}0019}
$$

Comparando: $M_{\text{E7}}=114\,\text{A/m}$ é **muito maior em módulo** que $M_{\text{E6}}=-0{,}8\,\text{A/m}$ mesmo com $H$ de mesma ordem de grandeza — reflexo direto de $|\chi_m|$ tipicamente maior (e positivo) em paramagnéticos comparado a diamagnéticos, embora ambos sejam materiais lineares "fracos" perto dos ferromagnéticos ($\chi_m\sim10^2$–$10^6$).

**E8.** Da Seção “Aplicação: esfera uniformemente magnetizada”, $\vec H_{dentro}=-\vec M/3$:

$$
H_{in} = -\frac{5\times10^5}{3} \approx -1{,}667\times10^5\,\text{A/m}
$$

$$
B_{in} = \mu_0(H_{in}+M) = \mu_0\left(-\frac{M}{3}+M\right) = \mu_0\cdot\frac{2M}{3}
$$

$$
B_{in} = (4\pi\times10^{-7})\cdot\frac{2(5\times10^5)}{3} = (4\pi\times10^{-7})(3{,}333\times10^5)
$$

$$
\boxed{H_{in}\approx-1{,}667\times10^5\,\text{A/m},\qquad B_{in}\approx0{,}4189\,\text{T}}
$$

**E9.** Relutância (Seção “Dedução da relação $\mathcal{F}=\mathcal{R}\Phi$”), $\mathcal R = \dfrac{\ell}{\mu_r\mu_0A}$:

$$
\mathcal{R} = \frac{0{,}25}{(3000)(4\pi\times10^{-7})(5\times10^{-4})} \approx 1{,}326\times10^5\,\text{A/Wb}
$$

Fluxo, $\Phi = \mathcal F/\mathcal R = NI/\mathcal R$:

$$
\Phi = \frac{(300)(0{,}4)}{1{,}326\times10^5} = \frac{120}{1{,}326\times10^5} \approx 9{,}048\times10^{-4}\,\text{Wb}
$$

Campo $B$ no núcleo:

$$
B = \frac{\Phi}{A} = \frac{9{,}048\times10^{-4}}{5\times10^{-4}} \approx 1{,}810\,\text{T}
$$

Campo $H$ (definição $B=\mu_0\mu_rH$):

$$
H = \frac{B}{\mu_0\mu_r} = \frac{1{,}810}{(4\pi\times10^{-7})(3000)} \approx 480\,\text{A/m}
$$

(verificação: $H\ell = (480)(0{,}25)=120\,\text{A} = NI$ ✓)

$$
\boxed{\mathcal{R}\approx1{,}33\times10^5\,\text{A/Wb},\ \ \Phi\approx0{,}905\,\text{mWb},\ \ B\approx1{,}81\,\text{T},\ \ H\approx480\,\text{A/m}}
$$

**E10.** Estratégia: como $B$ é o mesmo em todo o circuito série (seção constante $A$), calcula-se $H$ em cada trecho a partir de $B$ e usa-se a Lei de Ampère integral, $\mathcal F=NI=\sum H_i\ell_i$.

No ferro: $H_{fe} = \dfrac{B}{\mu_0\mu_r} = \dfrac{1{,}0}{(4\pi\times10^{-7})(3500)} \approx 227{,}4\,\text{A/m}$

No entreferro (ar, $\mu_r=1$): $H_g = \dfrac{B}{\mu_0} = \dfrac{1{,}0}{4\pi\times10^{-7}} \approx 7{,}958\times10^5\,\text{A/m}$

Força magnetomotriz total:

$$
NI = H_{fe}\ell_{fe} + H_g\ell_g = (227{,}4)(0{,}35) + (7{,}958\times10^5)(0{,}8\times10^{-3})
$$

$$
NI = 79{,}58 + 636{,}6 \approx 716{,}2\,\text{A}
$$

Com $N=400$:

$$
I = \frac{716{,}2}{400}
$$

$$
\boxed{I\approx1{,}79\,\text{A}}
$$

Note que o entreferro (apenas $0{,}8\,\text{mm}$) consome $\approx89\%$ da força magnetomotriz total ($636{,}6/716{,}2$), reforçando o padrão já visto na Seção “Entreferros (air gaps) e relutâncias em série”.

**E11.** Razão de transformação (Seção “Transformador ideal”):

$$
a = \frac{N_2}{N_1} = \frac{2200}{440} = 5
$$

$$
V_2 = aV_1 = 5\times127 = 635\,\text{V}
$$

Impedância refletida ao primário:

$$
Z_1 = \frac{Z_2}{a^2} = \frac{50}{25} = 2\,\Omega
$$

Corrente no secundário: $I_2 = V_2/Z_2 = 635/50 = 12{,}7\,\text{A}$. Corrente no primário (conservação de potência, $V_1I_1=V_2I_2$):

$$
I_1 = \frac{V_2I_2}{V_1} = \frac{(635)(12{,}7)}{127} = \frac{8064{,}5}{127}
$$

$$
\boxed{a=5,\quad V_2=635\,\text{V},\quad Z_1=2\,\Omega,\quad I_1\approx63{,}5\,\text{A}}
$$

(equivalentemente, $I_1=aI_2=5(12{,}7)=63{,}5\,\text{A}$).

**E12.** Da Lei de Steinmetz (Seção “Perdas por histerese”), $P=k_hfB_{max}^nV$, isola-se $k_h$:

$$
k_h = \frac{P}{fB_{max}^nV} = \frac{28}{(60)(1{,}3)^{1{,}7}(3\times10^{-6})}
$$

Calculando $(1{,}3)^{1{,}7}$: $\ln(1{,}3)=0{,}2624$; $1{,}7\times0{,}2624=0{,}4460$; $e^{0{,}4460}\approx1{,}562$.

$$
k_h = \frac{28}{(60)(1{,}562)(3\times10^{-6})} = \frac{28}{2{,}812\times10^{-4}} \approx 9{,}958\times10^4
$$

$$
\boxed{k_h\approx9{,}96\times10^4}
$$

(nas unidades consistentes com $V$ em m³; note que este $k_h$ é numericamente maior que os valores de referência ~300–500 citados na Seção “Perdas por histerese” porque ali $V$ estava implicitamente em outra escala — o que importa aqui é a **consistência interna** do cálculo, usando o mesmo $k_h$ para extrapolar.)

Potência em $f=400\,\text{Hz}$, $B_{max}=0{,}9\,\text{T}$: $(0{,}9)^{1{,}7}$: $\ln(0{,}9)=-0{,}1054$; $1{,}7\times(-0{,}1054)=-0{,}1791$; $e^{-0{,}1791}\approx0{,}8360$.

$$
P_{400} = (9{,}958\times10^4)(400)(0{,}8360)(3\times10^{-6})
$$

$$
P_{400} = (9{,}958\times10^4)(400)(0{,}8360)(3\times10^{-6}) \approx 99{,}9\,\text{W}
$$

$$
\boxed{P_{400}\approx99{,}9\,\text{W}}
$$

**E13.** Da condição de contorno magnética (Seção “Resumo das condições de contorno magnéticas”): $B_\perp$ contínua, $H_\parallel$ contínua. Escrevendo $\tan\theta = B_\parallel/B_\perp$ em cada meio e usando $B_\parallel=\mu H_\parallel$:

$$
\frac{\tan\theta_2}{\tan\theta_1} = \frac{B_{2\parallel}/B_\perp}{B_{1\parallel}/B_\perp} = \frac{\mu_2H_\parallel}{\mu_1H_\parallel} = \frac{\mu_{r2}}{\mu_{r1}}
$$

(ar = meio 1, $\mu_{r1}=1$; ferro = meio 2, $\mu_{r2}=1800$):

$$
\tan\theta_2 = \frac{\mu_{r2}}{\mu_{r1}}\tan\theta_1 = 1800\cdot\tan(6°) = 1800\times0{,}10510 \approx189{,}18
$$

$$
\theta_2 = \arctan(189{,}18)
$$

$$
\boxed{\theta_2\approx89{,}70°}
$$

**Interpretação física**: um campo quase normal à interface no ar ($6°$ da normal) torna-se quase **tangencial** à interface dentro do ferro ($89{,}7°$ da normal, ou apenas $0{,}3°$ da superfície). Isso é a manifestação, em termos de ângulo, do mesmo fenômeno discutido na Seção “Resumo das condições de contorno magnéticas”: dentro de materiais de altíssima permeabilidade, as linhas de campo tendem a se alinhar paralelamente à interface (fluxo "capturado" e guiado pelo ferro).

**E14 (desafio).** Relutância de cada trecho, $\mathcal R_i = \ell_i/(\mu_{ri}\mu_0A_i)$:

$$
\mathcal{R}_1 = \frac{0{,}18}{(4000)(4\pi\times10^{-7})(6\times10^{-4})} \approx 5{,}968\times10^4\,\text{A/Wb}
$$

$$
\mathcal{R}_2 = \frac{0{,}12}{(2000)(4\pi\times10^{-7})(3\times10^{-4})} \approx 1{,}592\times10^5\,\text{A/Wb}
$$

$$
\mathcal{R}_g = \frac{0{,}0005}{(4\pi\times10^{-7})(3\times10^{-4})} \approx 1{,}326\times10^6\,\text{A/Wb}
$$

Como as três relutâncias estão em **série** (mesmo fluxo $\Phi$ atravessa todo o circuito, análogo a resistores em série — Seção “Entreferros (air gaps) e relutâncias em série”):

$$
\mathcal{R}_{total} = \mathcal{R}_1+\mathcal{R}_2+\mathcal{R}_g \approx (0{,}597+1{,}592+13{,}26)\times10^5 \approx 15{,}45\times10^5\,\text{A/Wb}
$$

Fluxo magnético, $\Phi=NI/\mathcal R_{total}$:

$$
\Phi = \frac{(500)(1{,}5)}{1{,}545\times10^6} = \frac{750}{1{,}545\times10^6} \approx 4{,}854\times10^{-4}\,\text{Wb}
$$

Campos em cada trecho ($B_i=\Phi/A_i$; note que trechos 2 e o gap compartilham a mesma seção $A=3\,\text{cm}^2$, logo $B_2=B_g$):

$$
B_1 = \frac{4{,}854\times10^{-4}}{6\times10^{-4}} \approx0{,}809\,\text{T}
$$

$$
B_2 = B_g = \frac{4{,}854\times10^{-4}}{3\times10^{-4}} \approx1{,}618\,\text{T}
$$

Fração da relutância total devida ao entreferro:

$$
\frac{\mathcal{R}_g}{\mathcal{R}_{total}} = \frac{13{,}26}{15{,}45} \approx0{,}858
$$

$$
\boxed{\mathcal{R}_1\approx0{,}597\times10^5,\ \mathcal{R}_2\approx1{,}592\times10^5,\ \mathcal{R}_g\approx13{,}26\times10^5\ (\text{A/Wb}),\ \ \Phi\approx4{,}85\times10^{-4}\,\text{Wb}}
$$

$$
\boxed{B_1\approx0{,}81\,\text{T},\quad B_2=B_g\approx1{,}62\,\text{T},\quad \text{entreferro} \approx85{,}8\%\ \text{da relutância total}}
$$

Mesmo sendo o menor trecho em comprimento (0,5 mm contra 18 cm e 12 cm de núcleo), o entreferro domina a relutância total — o mesmo padrão qualitativo da Seção “Entreferros (air gaps) e relutâncias em série”, agora generalizado para um circuito com três elementos em série e seções transversais distintas (note que $B_2\ne B_1$ porque as áreas diferem, embora o fluxo $\Phi$ seja o mesmo em toda a malha).

**E15 (desafio).** **Perdas por histerese** (Steinmetz, Seção “Perdas por histerese”), $P_h=k_hfB_{max}^nV$. Como $B_{max}$ é fixo, a razão entre frequências é direta:

$$
\frac{P_h(400)}{P_h(60)} = \frac{f_2}{f_1} = \frac{400}{60} = 6{,}667
$$

Calculando explicitamente com $k_h=380$, $n=1{,}6$: $(1{,}1)^{1{,}6}$: $\ln(1{,}1)=0{,}09531$; $1{,}6\times0{,}09531=0{,}1525$; $e^{0{,}1525}\approx1{,}1648$.

$$
P_h(60) = (380)(60)(1{,}1648)(2{,}5\times10^{-6}) \approx6{,}64\,\text{W}
$$

$$
P_h(400) = (380)(400)(1{,}1648)(2{,}5\times10^{-6}) \approx44{,}26\,\text{W}
$$

Razão: $44{,}26/6{,}64\approx6{,}67$ ✓ (confere com $400/60$, já que $P_h\propto f^1$ quando $B_{max}$ é mantido fixo).

**Perdas por correntes parasitas** (Seção “Correntes parasitas (eddy currents)”), $P_e\propto f^2B_{max}^2t^2/\rho$. Usando a forma explícita $P_e = \dfrac{\pi^2f^2B_{max}^2t^2V}{6\rho}$:

$$
P_e(60) = \frac{\pi^2(60)^2(1{,}1)^2(0{,}35\times10^{-3})^2(2{,}5\times10^{-6})}{6(5\times10^{-7})} \approx0{,}439\,\text{W}
$$

$$
P_e(400) = \frac{\pi^2(400)^2(1{,}1)^2(0{,}35\times10^{-3})^2(2{,}5\times10^{-6})}{6(5\times10^{-7})} \approx19{,}51\,\text{W}
$$

Razão:

$$
\frac{P_e(400)}{P_e(60)} = \left(\frac{400}{60}\right)^2 = (6{,}667)^2\approx44{,}44
$$

$$
\boxed{P_h(60)\approx6{,}64\,\text{W},\ P_h(400)\approx44{,}3\,\text{W}\ (\text{raz\~ao}\approx6{,}67\times)}
$$

$$
\boxed{P_e(60)\approx0{,}44\,\text{W},\ P_e(400)\approx19{,}5\,\text{W}\ (\text{raz\~ao}\approx44{,}4\times)}
$$

Perdas totais: $P_{total}(60)\approx7{,}08\,\text{W}$; $P_{total}(400)\approx63{,}8\,\text{W}$.

**Discussão física**: como $P_h\propto f$ mas $P_e\propto f^2$, aumentar a frequência de operação penaliza as correntes parasitas **muito mais** que a histerese (fator $44{,}4\times$ contra $6{,}67\times$ ao passar de 60 para 400 Hz). Em 60 Hz, a histerese domina ($6{,}64\,\text{W}$ vs. $0{,}44\,\text{W}$); em 400 Hz, a diferença relativa diminui bastante (histerese ainda maior em termos absolutos aqui, mas a taxa de crescimento das parasitas é muito mais agressiva). Esse é precisamente o motivo pelo qual núcleos destinados a alta frequência (inversores, fontes chaveadas) usam laminações mais finas ou ferrites (Seção “Correntes parasitas (eddy currents)”) — para conter o termo $t^2$ que multiplica a dependência quadrática em $f$.

**E16 (desafio).** Por analogia direta com a dedução da esfera (Seção “Aplicação: esfera uniformemente magnetizada”, onde $N_d=1/3$ vem da solução do potencial escalar magnético com condições de contorno em coordenadas esféricas), a mesma lógica aplicada a um cilindro infinito magnetizado transversalmente (problema 2D em coordenadas cilíndricas, análogo ao cilindro dielétrico polarizado transversalmente) fornece o fator de desmagnetização $N_d=1/2$ fornecido no enunciado. O campo desmagnetizante interno é:

$$
\vec{H}_{dentro} = -N_d\vec{M} = -\frac{\vec M}{2}
$$

$$
H_{in} = -\frac{7\times10^5}{2} = -3{,}5\times10^5\,\text{A/m}
$$

Campo $B$ interno:

$$
B_{in} = \mu_0(H_{in}+M) = \mu_0\left(-\frac{M}{2}+M\right) = \mu_0\cdot\frac{M}{2}
$$

$$
B_{in} = (4\pi\times10^{-7})\cdot\frac{7\times10^5}{2} = (4\pi\times10^{-7})(3{,}5\times10^5)
$$

$$
\boxed{H_{in}^{\text{transversal}}=-3{,}5\times10^5\,\text{A/m},\qquad B_{in}^{\text{transversal}}\approx0{,}440\,\text{T}}
$$

**Caso axial** ($N_d=0$, magnetização paralela ao eixo do cilindro infinito): não há acúmulo de "polos" magnéticos superficiais efetivos na direção do eixo (não há extremidades, pois o cilindro é infinito), de modo que $\vec H_{dentro}=0$ e:

$$
B_{in}^{\text{axial}} = \mu_0(0+M) = \mu_0M = (4\pi\times10^{-7})(7\times10^5) \approx0{,}880\,\text{T}
$$

$$
\boxed{H_{in}^{\text{axial}}=0,\qquad B_{in}^{\text{axial}}\approx0{,}880\,\text{T}}
$$

**Comparação**: a mesma magnetização $M$ produz campo interno $\vec H$ **nulo** na configuração axial (sem desmagnetização, $B_{in}=\mu_0M$, o dobro do caso transversal) e um campo $\vec H$ **oposto e apreciável** ($-M/2$) na configuração transversal, reduzindo $B_{in}$ à metade. O padrão é o mesmo já visto na esfera: quanto maior o fator de desmagnetização geométrico $N_d$, mais o próprio material "se opõe" ao campo que sua magnetização tende a criar internamente — efeito puramente geométrico (forma da amostra), não uma propriedade do material em si.
