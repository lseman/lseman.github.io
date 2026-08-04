# Fundamentos da Eletrostática, Campo Elétrico e Lei de Gauss

> Eletromagnetismo — Apostila de Curso
> Tópicos: Fundamentos da Eletrostática · Campo Elétrico · Lei de Gauss (Integral e Pontual) · Teorema do Divergente

---

## Objetivos de Aprendizagem

Ao final deste capítulo, você será capaz de:

- [ ] Calcular o campo elétrico de distribuições discretas e contínuas de carga usando o princípio da superposição.
- [ ] Aplicar a **Lei de Gauss** em situações com simetria esférica, cilíndrica e planar.
- [ ] Diferenciar as formas integral e pontual da Lei de Gauss.
- [ ] Aplicar as condições de contorno para o campo eletrostático em interfaces entre materiais.
- [ ] Interpretar fisicamente o fluxo elétrico e sua relação com a carga encerrada.

---

## Intuição Física: O que é Campo Elétrico?

Antes de definir matematicamente o campo elétrico, pense em termos físicos:

- Uma **carga elétrica** cria um "campo de influência" ao seu redor.
- Quando você coloca uma **carga de teste** nesse campo, ela sente uma força.
- O **campo elétrico** $\vec E$ é simplesmente essa força por unidade de carga de teste: $\vec E = \vec F/q_0$.
- Linhas de campo são uma representação visual: elas emanam de cargas positivas e terminam em cargas negativas.

## Aplicações no Mundo Real

| Conceito | Aplicação Prática |
|---|---|
| Campo de carga puntiforme | Design de tubos de raios catódicos e aceleradores de partículas |
| Lei de Gauss (simetria esférica) | Cálculo de campos em esferas condutoras e blindagem eletrostática |
| Lei de Gauss (simetria cilíndrica) | Projeto de cabos coaxiais e linhas de transmissão |
| Lei de Gauss (simetria planar) | Capacitores de placas paralelas em circuitos eletrônicos |
| Condições de contorno | Projeto de isoladores e dielétricos em equipamentos de alta tensão |

---

## Antes de começar

Ao final, você deve obter campo elétrico por superposição e por simetria, distinguir fluxo de campo local e aplicar a Lei de Gauss em formas integral e pontual. **Diagnóstico:** fluxo elétrico líquido nulo implica campo nulo na superfície? **Evidência mínima:** calcular campos de carga pontual, fio e esfera e confrontar a carga encerrada com o fluxo.

## Sumário

1. [Fundamentos da Eletrostática](#fundamentos-da-eletrostática)
2. [Campo Elétrico](#campo-elétrico)
3. [Lei de Gauss — Forma Integral](#lei-de-gauss--forma-integral)
4. [Teorema do Divergente](#teorema-do-divergente)
5. [Lei de Gauss — Forma Pontual](#lei-de-gauss--forma-pontual)
6. [Aplicações com simetria](#aplicações-com-simetria)
7. [Campo de distribuições contínuas](#campo-de-distribuições-contínuas)
8. [Condições de contorno para o campo eletrostático](#condições-de-contorno-para-o-campo-eletrostático)
9. [Exercícios resolvidos em Python](#exercícios-resolvidos-em-python)
10. [Lista de Exercícios Propostos](#lista-de-exercícios-propostos)
11. [Gabarito](#gabarito)

## Fundamentos da Eletrostática

<!-- slides: break -->

### Carga elétrica

A carga elétrica é uma propriedade fundamental da matéria, responsável pelas interações eletromagnéticas. Fatos experimentais fundamentais:

1. **Quantização**: toda carga observável é múltiplo inteiro da carga elementar $e \approx 1{,}602176634\times10^{-19}\,\text{C}$, isto é, $q = ne$, $n\in\mathbb{Z}$.
2. **Conservação**: a carga total de um sistema isolado é constante — cargas não são criadas nem destruídas, apenas transferidas (fato que será formalizado na equação da continuidade, tópico 3 desta série).
3. **Invariância**: a carga de uma partícula não depende do referencial (diferente da massa relativística) — propriedade essencial para a covariância das equações de Maxwell sob transformações de Lorentz.

### Lei de Coulomb

Charles-Augustin de Coulomb (1785), usando uma balança de torção, determinou experimentalmente que a força entre duas cargas puntiformes $q_1$ e $q_2$, separadas por uma distância $r$, é:

- Proporcional ao produto das cargas: $F \propto q_1 q_2$;
- Inversamente proporcional ao quadrado da distância: $F \propto 1/r^2$;
- Dirigida ao longo da linha que une as cargas;
- Repulsiva se as cargas têm o mesmo sinal, atrativa caso contrário.

Isso é resumido na **Lei de Coulomb**:

$$
\vec{F}_{12} = k_e\,\frac{q_1 q_2}{r^2}\,\hat{r}_{12}, \qquad k_e = \frac{1}{4\pi\varepsilon_0} \approx 8{,}99\times10^{9}\ \text{N·m}^2/\text{C}^2
$$

onde $\hat{r}_{12}$ é o versor que aponta da carga 1 para a carga 2, e $\vec{F}_{12}$ é a força **sobre** a carga 2 devido à carga 1. A constante $\varepsilon_0$ (permissividade do vácuo) aparece naturalmente por conveniência ao conectar a eletrostática ao Sistema Internacional de unidades e às equações de Maxwell na forma racionalizada (fator $4\pi$ explícito na lei de força, ausente na lei de Gauss).

**Princípio da superposição.** A força resultante sobre uma carga devido a várias outras é a soma vetorial das forças individuais — um postulado experimental, não uma consequência lógica necessária da Lei de Coulomb:

$$
\vec{F}_i = \sum_{j\neq i} k_e\frac{q_i q_j}{r_{ij}^2}\hat{r}_{ij}
$$

## Campo Elétrico

### Definição

Reescrever a força em termos de uma **carga de teste** $q_0$ (suficientemente pequena para não perturbar a distribuição de cargas-fonte) permite separar a propriedade do espaço (campo) da propriedade da carga de prova:

$$
\vec{E}(\vec{r}) \equiv \lim_{q_0\to 0}\frac{\vec{F}(\vec{r})}{q_0}
$$

O campo elétrico de uma carga puntiforme $q$ na origem, avaliado em um ponto de vetor posição $\vec{r}$:

$$
\vec{E}(\vec{r}) = \frac{1}{4\pi\varepsilon_0}\frac{q}{r^2}\hat{r}
$$

### Princípio da superposição para o campo

Pela linearidade da Lei de Coulomb, o campo de um conjunto de $N$ cargas puntiformes $q_i$ em posições $\vec{r}_i'$ é:

$$
\vec{E}(\vec{r}) = \frac{1}{4\pi\varepsilon_0}\sum_{i=1}^{N} q_i\,\frac{\vec{r}-\vec{r}_i'}{|\vec{r}-\vec{r}_i'|^3}
$$

Para uma distribuição contínua com densidade volumétrica $\rho(\vec{r}')$, superficial $\sigma(\vec{r}')$ ou linear $\lambda(\vec{r}')$, a soma vira integral:

$$
\vec{E}(\vec{r}) = \frac{1}{4\pi\varepsilon_0}\int_{V'} \rho(\vec{r}')\,\frac{\vec{r}-\vec{r}'}{|\vec{r}-\vec{r}'|^3}\,dV'
$$

**Dedução do campo de um anel de carga no eixo** (exemplo clássico para fixar a técnica). Considere um anel de raio $a$, carga total $Q$ uniformemente distribuída, no plano $xy$, centrado na origem. Por simetria, as componentes do campo perpendiculares ao eixo $z$ se cancelam aos pares (elementos diametralmente opostos), restando apenas a componente $z$:

$$
dE_z = \frac{1}{4\pi\varepsilon_0}\frac{dq}{a^2+z^2}\cos\theta, \qquad \cos\theta = \frac{z}{\sqrt{a^2+z^2}}
$$

$$
E_z = \frac{1}{4\pi\varepsilon_0}\frac{z}{(a^2+z^2)^{3/2}}\int dq = \frac{1}{4\pi\varepsilon_0}\frac{Qz}{(a^2+z^2)^{3/2}}
$$

Note que para $z\gg a$, $E_z \to \frac{1}{4\pi\varepsilon_0}\frac{Q}{z^2}$: a grandes distâncias, o anel se comporta como uma carga puntiforme — comportamento geral de qualquer distribuição de carga finita.

### Linhas de campo

Linhas de campo são curvas tangentes a $\vec{E}(\vec{r})$ em cada ponto; sua densidade (linhas por área transversal) é proporcional à magnitude do campo. Propriedades: emanam de cargas positivas e terminam em cargas negativas (ou no infinito); nunca se cruzam (o campo é único em cada ponto, exceto onde $E=0$); são mais densas onde o campo é mais intenso.

```python
import numpy as np
import matplotlib.pyplot as plt

x = y = np.linspace(-2, 2, 25)
X, Y = np.meshgrid(x, y)
R = np.hypot(X, Y)
Ex, Ey = X/(R**3 + .08), Y/(R**3 + .08)
fig, ax = plt.subplots(figsize=(6, 5))
ax.streamplot(X, Y, Ex, Ey, color=np.log1p(np.hypot(Ex, Ey)), cmap="plasma", density=1.2)
ax.scatter(0, 0, s=180, c="#dc2626", edgecolor="white", zorder=3)
ax.text(.12, .12, "+Q", weight="bold"); ax.set_aspect("equal")
ax.set(title="Linhas de campo de uma carga puntiforme", xlabel="$x$", ylabel="$y$")
plt.tight_layout()
```

```python
import numpy as np
import matplotlib.pyplot as plt

eps0 = 8.854e-12
k = 1/(4*np.pi*eps0)

def E_ponto(X, Y, q, pos):
    x0, y0 = pos
    dx, dy = X-x0, Y-y0
    r2 = np.maximum(dx**2+dy**2, 1e-9)
    return k*q*dx/r2**1.5, k*q*dy/r2**1.5

def E_anel_eixo(z, Q, a, eps0=8.854e-12):
    """Campo no eixo de um anel carregado (dedução acima)."""
    k = 1/(4*np.pi*eps0)
    return k*Q*z/(a**2+z**2)**1.5

z = np.linspace(-5, 5, 400)
Ez = E_anel_eixo(z, Q=1e-9, a=1.0)

# Objetivo: visualizar a mudança de sentido e localizar o campo máximo no eixo.
z_max = 1/np.sqrt(2)  # resultado analítico para a=1 m
E_max = E_anel_eixo(z_max, Q=1e-9, a=1.0)
print(f"Máximo em z=a/√2={z_max:.3f} m: E_z={E_max:.3f} N/C")

fig, ax = plt.subplots(figsize=(7, 4))
ax.plot(z, Ez, color="#2563eb", lw=2, label="$E_z(z)$")
ax.axhline(0, color="#64748b", lw=.8)
ax.scatter([z_max, -z_max], [E_max, -E_max], color="#dc2626", zorder=3,
           label="extremos analíticos")
ax.set(xlabel="$z/a$", ylabel="$E_z$ (N/C)",
       title="Campo elétrico no eixo de um anel carregado")
ax.grid(alpha=.25); ax.legend(); plt.tight_layout()
```

## Lei de Gauss — Forma Integral

### Fluxo elétrico

Define-se o **fluxo elétrico** através de uma superfície $S$ como:

$$
\Phi_E \equiv \int_S \vec{E}\cdot d\vec{A}
$$

onde $d\vec{A} = \hat{n}\,dA$, com $\hat{n}$ o versor normal à superfície (convencionalmente apontando para fora, se $S$ for fechada). Fisicamente, $\Phi_E$ mede "quantas linhas de campo" atravessam $S$.

### Dedução da Lei de Gauss a partir da Lei de Coulomb

Considere uma única carga puntiforme $q$ na origem e uma superfície esférica $S$ de raio $r$ centrada nela. Como $\vec{E} = \frac{q}{4\pi\varepsilon_0 r^2}\hat{r}$ é paralelo a $d\vec{A} = \hat{r}\,dA$ em toda a superfície:

$$
\Phi_E = \oint_S \vec{E}\cdot d\vec{A} = \frac{q}{4\pi\varepsilon_0 r^2}\oint_S dA = \frac{q}{4\pi\varepsilon_0 r^2}(4\pi r^2) = \frac{q}{\varepsilon_0}
$$

**Ponto crucial**: o resultado não depende de $r$. Isso é consequência direta da lei do inverso do quadrado — o fluxo através de qualquer esfera concêntrica é o mesmo, pois a área cresce como $r^2$ exatamente na taxa que compensa a queda de $E$.

**Generalização para superfície arbitrária**: usa-se o conceito de **ângulo sólido**. Um elemento de área $dA$ a uma distância $r$ da carga, com normal fazendo ângulo $\theta$ com $\hat{r}$, subtende um ângulo sólido:

$$
d\Omega = \frac{dA\cos\theta}{r^2}
$$

O fluxo através desse elemento é:

$$
d\Phi_E = \vec{E}\cdot d\vec{A} = \frac{q}{4\pi\varepsilon_0 r^2}\,dA\cos\theta = \frac{q}{4\pi\varepsilon_0}\,d\Omega
$$

Integrando sobre qualquer superfície fechada que envolva a carga, o ângulo sólido total é sempre $4\pi$ esferorradianos (por definição de superfície fechada envolvendo um ponto interno):

$$
\Phi_E = \frac{q}{4\pi\varepsilon_0}\oint d\Omega = \frac{q}{4\pi\varepsilon_0}(4\pi) = \frac{q}{\varepsilon_0}
$$

Se a carga estiver **fora** da superfície fechada, cada linha de campo que entra também sai (o ângulo sólido subtendido por qualquer "cone" de linhas se cancela entre a face de entrada e a de saída), de modo que $\Phi_E = 0$ para cargas externas.

Por superposição, para uma distribuição arbitrária de cargas, apenas a carga **interna** contribui:

$$
\boxed{\oint_S \vec{E}\cdot d\vec{A} = \frac{Q_{env}}{\varepsilon_0}}\qquad\text{(Lei de Gauss — forma integral)}
$$

com $Q_{env} = \int_{V} \rho\,dV$, integrada apenas sobre o volume delimitado por $S$.

### Importância

A Lei de Gauss é **sempre verdadeira** (é equivalente à Lei de Coulomb para eletrostática, e continua válida em eletrodinâmica), mas só é **útil para calcular $\vec{E}$ diretamente** quando há simetria suficiente (esférica, cilíndrica ou planar) para tirar $E$ da integral.

## Teorema do Divergente

### Enunciado

O **Teorema do Divergente** (Gauss–Ostrogradsky) é um resultado de cálculo vetorial, válido para qualquer campo vetorial $\vec{F}$ suficientemente suave, relacionando uma integral de superfície fechada a uma integral de volume:

$$
\oint_S \vec{F}\cdot d\vec{A} = \int_V (\nabla\cdot\vec{F})\,dV
$$


### Ideia da demonstração (via cubos infinitesimais)

Divida o volume $V$ em uma malha de cubos infinitesimais de lados $dx, dy, dz$. Para um cubo centrado em $(x,y,z)$, o fluxo líquido através das faces perpendiculares a $x$ é:

$$
d\Phi_x = \left[F_x\left(x+\tfrac{dx}{2},y,z\right) - F_x\left(x-\tfrac{dx}{2},y,z\right)\right]dy\,dz \approx \frac{\partial F_x}{\partial x}\,dx\,dy\,dz
$$

Somando as contribuições análogas em $y$ e $z$:

$$
d\Phi = \left(\frac{\partial F_x}{\partial x}+\frac{\partial F_y}{\partial y}+\frac{\partial F_z}{\partial z}\right)dV = (\nabla\cdot\vec{F})\,dV
$$

Quando se somam os fluxos de **todos** os cubos adjacentes que preenchem $V$, as contribuições das faces internas se cancelam aos pares (o que sai de um cubo entra no vizinho), restando apenas o fluxo através das faces na fronteira externa — exatamente $\oint_S \vec{F}\cdot d\vec{A}$. Isso demonstra o teorema.

### Interpretação física do divergente

$\nabla\cdot\vec{F}$ em um ponto mede a "densidade de fontes" do campo naquele ponto: o fluxo líquido que emana de um volume infinitesimal ao redor do ponto, por unidade de volume.

$$
\nabla\cdot\vec{F} = \lim_{\Delta V\to 0}\frac{1}{\Delta V}\oint_{\partial(\Delta V)}\vec{F}\cdot d\vec{A}
$$

Em coordenadas cartesianas:

$$
\nabla\cdot\vec{F} = \frac{\partial F_x}{\partial x}+\frac{\partial F_y}{\partial y}+\frac{\partial F_z}{\partial z}
$$

## Lei de Gauss — Forma Pontual

### Dedução

Partindo da forma integral e escrevendo $Q_{env} = \int_V \rho\,dV$:

$$
\oint_S \vec{E}\cdot d\vec{A} = \frac{1}{\varepsilon_0}\int_V \rho\,dV
$$

Aplicando o Teorema do Divergente ao lado esquerdo:

$$
\int_V(\nabla\cdot\vec{E})\,dV = \int_V \frac{\rho}{\varepsilon_0}\,dV
$$

Como essa igualdade vale para **qualquer** volume $V$ arbitrário (não apenas um específico), os integrandos devem ser iguais ponto a ponto:

$$
\boxed{\nabla\cdot\vec{E} = \frac{\rho}{\varepsilon_0}}\qquad\text{(Lei de Gauss — forma pontual/diferencial)}
$$

Esta é a **primeira equação de Maxwell**. Ela é local: relaciona o campo e sua derivada em cada ponto do espaço, sem exigir conhecimento da distribuição de carga em outros pontos — ao contrário da forma integral, que é global.

### Equivalência das duas formas

As formas integral e pontual da Lei de Gauss carregam exatamente a mesma informação física; a integral é conveniente para simetrias globais, a pontual para formulações locais (e para derivar a equação de Poisson, tópico do próximo arquivo).

## Aplicações com Simetria

### Receita geral

1. Identifique a simetria (esférica, cilíndrica, planar) e escolha uma **superfície gaussiana** compatível: $\vec{E}$ deve ser constante em módulo e paralelo (ou perpendicular) a $d\vec{A}$ em cada parte relevante da superfície.
2. Calcule $Q_{env}$ dentro da superfície escolhida.
3. Aplique $\oint\vec{E}\cdot d\vec{A} = Q_{env}/\varepsilon_0$ e resolva para $E$.

### Casca esférica uniformemente carregada

Casca de raio $a$, carga total $Q$. Superfície gaussiana: esfera concêntrica de raio $r$.

- **Dentro ($r<a$)**: $Q_{env}=0 \Rightarrow E=0$.
- **Fora ($r\ge a$)**: $Q_{env}=Q$, e por simetria $E$ é radial e constante em $|E|$ sobre a esfera gaussiana:

$$
E(4\pi r^2) = \frac{Q}{\varepsilon_0} \quad\Rightarrow\quad E(r) = \frac{Q}{4\pi\varepsilon_0 r^2}
$$

idêntico ao de uma carga puntiforme — resultado que motivou historicamente Newton (gravitação) e depois Gauss (eletrostática).

### Esfera sólida uniformemente carregada

Esfera de raio $a$, densidade volumétrica uniforme $\rho_0$, carga total $Q = \tfrac{4}{3}\pi a^3\rho_0$. Superfície gaussiana: esfera concêntrica de raio $r$.

- **Dentro ($r<a$)**: a carga envolvida é apenas a fração do volume:

$$
Q_{env} = \rho_0\cdot\frac{4}{3}\pi r^3 = Q\cdot\frac{r^3}{a^3}
$$

Aplicando Gauss:

$$
E(4\pi r^2) = \frac{Q r^3}{\varepsilon_0 a^3} \quad\Rightarrow\quad E(r) = \frac{Q}{4\pi\varepsilon_0 a^3}\,r = \frac{\rho_0}{3\varepsilon_0}\,r
$$

Dentro da esfera, o campo cresce **linearmente** com $r$ — análogo ao campo gravitacional dentro de uma planeta com densidade uniforme.

- **Fora ($r\ge a$)**: idêntico ao caso da casca.

**Resumo unificado**:

$$
E(r) = \begin{cases}\dfrac{\rho_0 r}{3\varepsilon_0} & r < a \\ \dfrac{\rho_0 a^3}{3\varepsilon_0 r^2} & r \ge a\end{cases}
$$

---

### Exemplo Resolvido Passo a Passo: Esfera com Densidade Não Uniforme

**Problema**: Uma esfera isolante de raio $R$ possui densidade volumétrica de carga $\rho(r) = \rho_0 \left(1 - \dfrac{r}{R}\right)$ para $r \le R$ (e $\rho=0$ fora). Determine o campo elétrico $\vec{E}(r)$ para $r < R$ e $r \ge R$.

**Passo 1: Identificar a simetria e escolher a superfície gaussiana.**  
A distribuição de carga possui simetria esférica (depende apenas de $r$). Escolhemos como superfície gaussiana uma esfera concêntrica de raio $r$.

**Passo 2: Calcular a carga envolvida $Q_{env}(r)$ para $r < R$.**  
$$
Q_{env}(r) = \int_0^r \rho(r')\,4\pi r'^2\,dr' = 4\pi\rho_0\int_0^r r'^2\left(1 - \frac{r'}{R}\right)dr'
$$
$$
= 4\pi\rho_0\left[\int_0^r r'^2\,dr' - \frac{1}{R}\int_0^r r'^3\,dr'\right] = 4\pi\rho_0\left(\frac{r^3}{3} - \frac{r^4}{4R}\right)
$$

**Passo 3: Aplicar a Lei de Gauss para $r < R$.**  
$$
E(r)\cdot 4\pi r^2 = \frac{Q_{env}(r)}{\varepsilon_0} = \frac{4\pi\rho_0}{\varepsilon_0}\left(\frac{r^3}{3} - \frac{r^4}{4R}\right)
$$
$$
\Rightarrow \quad E(r) = \frac{\rho_0}{\varepsilon_0}\left(\frac{r}{3} - \frac{r^2}{4R}\right), \qquad r < R
$$

**Passo 4: Calcular a carga total $Q_{total}$ para $r \ge R$.**  
$$
Q_{total} = Q_{env}(R) = 4\pi\rho_0\left(\frac{R^3}{3} - \frac{R^4}{4R}\right) = 4\pi\rho_0\left(\frac{R^3}{3} - \frac{R^3}{4}\right) = 4\pi\rho_0\frac{R^3}{12} = \frac{\pi\rho_0 R^3}{3}
$$

**Passo 5: Aplicar a Lei de Gauss para $r \ge R$.**  
Para $r \ge R$, a esfera se comporta como uma carga puntiforme $Q_{total}$:
$$
E(r)\cdot 4\pi r^2 = \frac{Q_{total}}{\varepsilon_0} = \frac{\pi\rho_0 R^3}{3\varepsilon_0}
$$
$$
\Rightarrow \quad E(r) = \frac{\rho_0 R^3}{12\varepsilon_0 r^2}, \qquad r \ge R
$$

**Resposta final**:
$$
\vec{E}(r) = \begin{cases}
\dfrac{\rho_0}{\varepsilon_0}\left(\dfrac{r}{3} - \dfrac{r^2}{4R}\right)\hat{r} & r < R \\
\dfrac{\rho_0 R^3}{12\varepsilon_0 r^2}\hat{r} & r \ge R
\end{cases}
$$

O campo é **contínuo** em $r=a$ (não há carga superficial), e sua derivada pula em $4\pi\varepsilon_0\sigma$ se existir uma carga superficial — condição de contorno que trataremos na Seção “Condições de Contorno para o Campo Eletrostático”.

### Fio infinito com densidade linear $\lambda$

Superfície gaussiana: cilindro coaxial de raio $r$ e comprimento $L$. Por simetria, $\vec{E}$ é radial e as tampas do cilindro não contribuem (paralelas a $\vec{E}$, perpendiculares a $d\vec{A}$ nelas):

$$
E(2\pi r L) = \frac{\lambda L}{\varepsilon_0}\quad\Rightarrow\quad E(r) = \frac{\lambda}{2\pi\varepsilon_0 r}
$$

**Nota importante**: este resultado exige que o fio seja **realmente infinito**. Para fios finitos, a simetria cilíndrica se quebra perto das extremidades e o campo não é puramente radial — deve-se calcular por integração direta de Coulomb (Seção “Campo de Distribuições Contínuas”).

### Plano infinito com densidade superficial $\sigma$

Superfície gaussiana: "caixa de pílulas" (cilindro curto) atravessando o plano, com tampas de área $A$ paralelas ao plano. Por simetria, $\vec{E}$ é perpendicular ao plano e igual em módulo nas duas tampas:

$$
2EA = \frac{\sigma A}{\varepsilon_0}\quad\Rightarrow\quad E = \frac{\sigma}{2\varepsilon_0}
$$

Note que $E$ **não depende da distância ao plano** — resultado surpreendente, mas consistente: linhas de campo de um plano infinito são todas paralelas entre si.

**Plano duplo (capacitor de placas paralelas)**: dois planos infinitos paralelos, um com $+\sigma$, outro com $-\sigma$. Entre as placas, os campos se somam (ambos apontam do positivo ao negativo):

$$
E_{\text{entre}} = \frac{\sigma}{\varepsilon_0}
$$

Fora das placas, os campos se cancelam:

$$
E_{\text{fora}} = 0
$$

Este resultado (campo uniforme concentrado entre as placas, nulo fora) é a idealização por trás do capacitor de placas paralelas (Seção “Lei de Gauss — Forma Integral”.7).

### Duas cargas: campo no ponto médio

Duas cargas iguais $+q$ separadas por distância $d$. Qual o campo no ponto médio?

Por simetria, os campos se cancelam no ponto médio. Para uma carga de teste positiva, um pequeno deslocamento **ao longo do eixo** produz força restauradora: a carga mais próxima a repele mais intensamente de volta ao centro. Um deslocamento **transversal** produz força para longe do eixo. Portanto, o ponto é uma sela — estável numa direção e instável nas transversais — em acordo com o teorema de Earnshaw, que proíbe mínimo eletrostático estável em todas as direções no espaço livre.

Para cargas **opostas** ($+q$ e $-q$), os campos se somam no ponto médio:

$$
E_{\text{médio}}
=2\frac{q}{4\pi\varepsilon_0(d/2)^2}
=\frac{2q}{\pi\varepsilon_0d^2}
$$

```python
import numpy as np
import matplotlib.pyplot as plt

fig = plt.figure(figsize=(6, 5)); ax = fig.add_subplot(projection="3d")
u, v = np.mgrid[0:2*np.pi:45j, 0:np.pi:24j]
x, y, z = np.cos(u)*np.sin(v), np.sin(u)*np.sin(v), np.cos(v)
ax.plot_surface(x, y, z, color="#60a5fa", alpha=.22, edgecolor="#2563eb", linewidth=.15)
dirs = np.array([[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]])
ax.quiver(*np.zeros((3,6)), dirs[:,0], dirs[:,1], dirs[:,2], length=1.35, color="#dc2626")
ax.scatter(0,0,0,s=90,c="#dc2626"); ax.text(.08,.08,.08,"+Q")
ax.set_box_aspect((1,1,1)); ax.set_title("Superfície gaussiana e fluxo radial")
plt.tight_layout()
```

## Campo de Distribuições Contínuas

### Disco carregado uniformemente no eixo

Disco de raio $R$, densidade superficial $\sigma$, no plano $xy$, centrado na origem. Queremos $\vec{E}$ no eixo $z$.

Dividimos o disco em anéis de raio $r$ e largura $dr$. Cada anel tem carga $dq = \sigma\cdot 2\pi r\,dr$. Usando o resultado da Seção “Princípio da superposição para o campo” para o anel:

$$
dE_z = \frac{1}{4\pi\varepsilon_0}\frac{z\cdot dq}{(r^2+z^2)^{3/2}} = \frac{\sigma z}{2\varepsilon_0}\frac{r\,dr}{(r^2+z^2)^{3/2}}
$$

Integrando de $r=0$ a $R$ (substituição $u = r^2+z^2$):

$$
E_z = \frac{\sigma z}{2\varepsilon_0}\int_0^R\frac{r\,dr}{(r^2+z^2)^{3/2}} = \frac{\sigma z}{2\varepsilon_0}\left[-\frac{1}{\sqrt{r^2+z^2}}\right]_0^R = \frac{\sigma}{2\varepsilon_0}\left(1 - \frac{|z|}{\sqrt{R^2+z^2}}\right)
$$

**Limites importantes**:

- $z\ll R$ (muito perto do centro do disco grande): $E_z \approx \dfrac{\sigma}{2\varepsilon_0}$ — recuperamos o plano infinito.
- $z\gg R$ (longe do disco pequeno): usando $\sqrt{R^2+z^2}\approx z\left(1+\dfrac{R^2}{2z^2}\right)$:

$$
E_z \approx \frac{\sigma}{2\varepsilon_0}\frac{R^2}{2z^2} = \frac{\sigma \pi R^2}{4\pi\varepsilon_0 z^2} = \frac{Q}{4\pi\varepsilon_0 z^2}
$$

recuperamos a carga puntiforme — como esperado, qualquer distribuição finita se comporta como puntiforme a grandes distâncias.

### Esfera com densidade não-uniforme $\rho(r)$

Se $\rho(r) = \rho_0\left(1-\dfrac{r}{a}\right)$ para $r<a$ (densidade decrescendo linearmente do centro à superfície), a carga dentro de raio $r$ é:

$$
Q_{env}(r) = \int_0^r \rho(r')\cdot 4\pi r'^2\,dr' = 4\pi\rho_0\int_0^r r'^2\left(1-\frac{r'}{a}\right)dr' = 4\pi\rho_0\left(\frac{r^3}{3} - \frac{r^4}{4a}\right)
$$

Campo dentro da esfera:

$$
E(r) = \frac{Q_{env}(r)}{4\pi\varepsilon_0 r^2} = \frac{\rho_0}{\varepsilon_0}\left(\frac{r}{3} - \frac{r^2}{4a}\right)
$$

Carga total da esfera: $Q = Q_{env}(a) = 4\pi\rho_0\left(\dfrac{a^3}{3}-\dfrac{a^3}{4}\right) = \dfrac{\pi\rho_0 a^3}{3}$. Campo fora:

$$
E(r) = \frac{\rho_0 a^3}{3\varepsilon_0 r^2} = \frac{Q}{4\pi\varepsilon_0 r^2},\qquad r \ge a
$$

Note que o campo dentro **não** cresce linearmente como no caso de densidade constante — ele cresce mais rapidamente perto da origem e mais devagar perto da superfície.

### Linha de carga finita no ponto próximo ao extremo

Linha de comprimento $L$, carga total $Q$ uniformemente distribuída ($\lambda = Q/L$) ao longo do eixo $z$, de $0$ a $L$. Campo no ponto $P$ a distância $d$ do extremo (posição $z = -d$):

$$
dE = \frac{1}{4\pi\varepsilon_0}\frac{\lambda\,dz'}{(z'+d)^2}\quad\Rightarrow\quad E = \frac{\lambda}{4\pi\varepsilon_0}\int_0^L\frac{dz'}{(z'+d)^2} = \frac{\lambda}{4\pi\varepsilon_0}\left[\frac{1}{d} - \frac{1}{L+d}\right]
$$

$$
E = \frac{Q}{4\pi\varepsilon_0}\,\frac{1}{d(L+d)}
$$

- $L\gg d$ (linha quase infinita): $E \approx \dfrac{Q}{4\pi\varepsilon_0 d L} = \dfrac{\lambda}{2\pi\varepsilon_0}\cdot\dfrac{1}{2d}$ — metade do campo do fio infinito, pois só vemos um lado.
- $d\gg L$ (ponto muito distante): $E \approx \dfrac{Q}{4\pi\varepsilon_0 d^2}$ — carga puntiforme.

## Condições de Contorno para o Campo Eletrostático

### Componente normal de $\vec{E}$ (descontinuidade na interface)

Na interface entre dois meios, a Lei de Gauss para $\vec E$ envolve a densidade superficial **total** $\sigma_{\rm tot}=\sigma_f+\sigma_b$, incluindo cargas livres e ligadas. Para uma caixa de pílulas:

$$
\oint_S\vec E\cdot d\vec A
=\hat n_{12}\cdot(\vec E_2-\vec E_1)A
=\frac{\sigma_{\rm tot}A}{\varepsilon_0}
$$

$$
\boxed{\hat n_{12}\cdot(\vec E_2-\vec E_1)=\frac{\sigma_{\rm tot}}{\varepsilon_0}}
$$

Ausência de carga **livre** não garante continuidade de $E_\perp$: uma interface dielétrica pode possuir carga ligada de polarização. É $\vec D$ que separa a contribuição livre.

**Caso especial**: interface com condutor. Dentro do condutor $\vec{E}=0$ (Seção “Importância”.1). Logo, logo fora:

$$
E_{\perp} = \frac{\sigma_{\rm cond}}{\varepsilon_0}
$$

### Componente tangencial de $\vec{E}$ (continuidade)

Aplicamos $\oint_C \vec{E}\cdot d\vec{\ell} = 0$ (campo eletrostático é conservativo) a um retângulo infinitesimal atravessando a interface:

$$
\boxed{\hat n_{12}\times(\vec E_2-\vec E_1)=0}
$$

A componente tangencial é **sempre contínua** na interface — não depende da presença de carga superficial.

**Resumo das condições de contorno**:

$$
\begin{aligned}
\hat n_{12}\times(\vec E_2-\vec E_1)&=0,\\
\varepsilon_0\hat n_{12}\cdot(\vec E_2-\vec E_1)&=\sigma_{\rm tot}.
\end{aligned}
$$

### Condições de contorno para $\vec{D}$ em interfaces dielétricas

Aplicando $\nabla\cdot\vec D=\rho_f$:

$$
\boxed{\hat n_{12}\cdot(\vec D_2-\vec D_1)=\sigma_f}.
$$

Sem carga superficial livre e para meios lineares isotrópicos, $D_{2\perp}=D_{1\perp}$ e, portanto, $\varepsilon_2E_{2\perp}=\varepsilon_1E_{1\perp}$.

O campo elétrico normal **descontinua** na interface entre dielétricos, sendo mais fraco no meio de maior permissividade — exatamente o efeito de "blindagem" da polarização.

**Exemplo concreto**: interface ar-água. $\varepsilon_{\text{água}} \approx 80\varepsilon_0$. Se $\vec{E}$ no ar faz ângulo $\theta_1 = 60°$ com a normal, o ângulo na água é:

$$
\tan\theta_2 = \frac{E_{2\parallel}}{E_{2\perp}} = \frac{E_{1\parallel}}{(\varepsilon_1/\varepsilon_2)E_{1\perp}} = \frac{\varepsilon_2}{\varepsilon_1}\tan\theta_1 = 80\cdot\sqrt{3} \approx 139
$$

$$
\theta_2 \approx 89.6°\quad\text{(o campo "quase tangencia" a interface!)}
$$

Isso significa que o campo elétrico **se curva para ficar quase paralelo à superfície** ao entrar no dielétrico — as linhas de campo "refratam" em direção à interface (ângulo maior). Este efeito é análogo à refração da luz, com a diferença que aqui os ângulos se comportam de forma oposta.

## Exercícios Resolvidos em Python

### Roteiro computacional

**Objetivo.** Comparar campos obtidos por simetria com integração direta da distribuição de carga e testar numericamente a Lei de Gauss.

**Hipóteses.** Unidades no SI; distribuições ideais; singularidades de cargas puntiformes não pertencem à malha de amostragem.

**Como executar.** Requer `numpy`, `scipy` e `matplotlib`. Aumente gradualmente a resolução e confirme que o fluxo converge para $Q_{int}/\varepsilon_0$.

**Resultados esperados.** Continuidade ou descontinuidade correta de $E$ nas interfaces e recuperação dos limites de fio, plano e carga puntiforme.

```python
import numpy as np
import matplotlib.pyplot as plt

eps0 = 8.854e-12
k = 1/(4*np.pi*eps0)

# --- Casca esférica ---
def E_casca_esferica(r, Q, a):
    r = np.atleast_1d(r).astype(float)
    return np.where(r < a, 0.0, Q/(4*np.pi*eps0*r**2))

# --- Esfera sólida uniforme ---
def E_esfera_solid_a(r, Q, a):
    r = np.atleast_1d(r).astype(float)
    E = np.zeros_like(r)
    E[r < a] = Q * r[r<a] / (4*np.pi*eps0*a**3)
    E[r >= a] = Q / (4*np.pi*eps0*r[r>=a]**2)
    return E

# --- Fio infinito ---
def E_fio_infinito(r, lam):
    return lam/(2*np.pi*eps0*r)

# --- Plano infinito ---
def E_plano_infinito(sigma):
    return sigma/(2*eps0)

# --- Disco carregado no eixo ---
def E_disco_eixo(z, R, sigma):
    return sigma/(2*eps0) * (1 - np.abs(z)/np.sqrt(R**2+z**2))

# --- Esfera com densidade não-uniforme rho(r) = rho0*(1 - r/a) ---
def E_esfera_nao_uniforme(r, rho0, a):
    r = np.atleast_1d(r).astype(float)
    E = np.zeros_like(r)
    mask = r < a
    E[mask] = rho0/eps0 * (r[mask]/3 - r[mask]**2/(4*a))
    # Fora: usar Q total
    Q = np.pi*rho0*a**3/3
    E[~mask] = Q/(4*np.pi*eps0*r[~mask]**2)
    return E

# --- Linha de carga finita ---
def E_linha_finita(d, L, Q):
    return Q/(4*np.pi*eps0) / (d*(L+d))

# --- Condições de contorno: ângulo de "refração" ---
def angulo_refracao_dielétrico(theta1, eps_r1, eps_r2):
    """Calcula o ângulo do campo elétrico no meio 2, dado ângulo theta1 no meio 1."""
    tan2 = (eps_r2/eps_r1) * np.tan(theta1)
    return np.arctan(tan2)

theta1 = np.deg2rad(60)
theta2 = angulo_refracao_dielétrico(theta1, 1.0, 80.0)
print(f"Ângulo no ar: {np.rad2deg(theta1):.1f}°")
print(f"Ângulo na água: {np.rad2deg(theta2):.1f}°")

# --- Verificação numérica do Teorema do Divergente ---
def verifica_gauss_numerico(q, r=1.0, n_theta=200, n_phi=400):
    k = 1/(4*np.pi*eps0)
    theta = np.linspace(0, np.pi, n_theta)
    phi = np.linspace(0, 2*np.pi, n_phi)
    dtheta, dphi = theta[1]-theta[0], phi[1]-phi[0]
    fluxo = 0.0
    E_r = k*q/r**2
    for th in theta:
        dA = r**2*np.sin(th)*dtheta*dphi
        fluxo += E_r*dA*n_phi
    return fluxo

q = 1e-9
fluxo_numerico = verifica_gauss_numerico(q)
fluxo_teorico = q/eps0
print(f"\nFluxo numérico:  {fluxo_numerico:.6e}")
print(f"Fluxo teórico Q/eps0: {fluxo_teorico:.6e}")
print(f"Erro relativo: {abs(fluxo_numerico-fluxo_teorico)/fluxo_teorico:.2%}")

# --- Verificação: campo do disco converge para plano infinito ---
R, sigma = 1.0, 1e-9  # 1 m, 1 nC/m^2
for z in [0.001, 0.01, 0.1, 1.0, 10.0]:
    E_d = E_disco_eixo(z, R, sigma)
    E_p = E_plano_infinito(sigma)
    print(f"z={z:6.3f} m: E_disco={E_d:.4e} V/m, E_plano={E_p:.4e} V/m, razão={E_d/E_p:.4f}")

# --- Visualização: E(r) para esfera sólida uniforme ---
Q, a = 1e-9, 0.1  # 1 nC, 10 cm
r_vals = np.linspace(0, 3*a, 500)
E_vals = E_esfera_solid_a(r_vals, Q, a)

fig, ax = plt.subplots(figsize=(8,5))
ax.plot(r_vals/a, E_vals*4*np.pi*eps0/Q*a**2, 'b', linewidth=2, label='E(r) normalizado')
ax.axvline(1, color='k', linestyle='--', alpha=0.5)
ax.set_xlabel('r/a')
ax.set_ylabel('E · 4πε₀a²/Q')
ax.set_title('Campo elétrico de esfera sólida uniformemente carregada')
ax.legend()
ax.grid(True, alpha=0.3)
ax.set_xlim(0, 3)
plt.tight_layout()
```

**Saída esperada**:

- Verificação de Gauss: erro < 1%
- Disco → Plano: razão $\to 1$ conforme $z/R \ll 1$; razão $\approx \tfrac{1}{4}(R/z)^2$ conforme $z/R \gg 1$ (campo puntiforme)
- Refração dielétrica: campo na água quase paralelo à interface
- Gráfico $E(r)$: crescimento linear dentro, $1/r^2$ fora, contínuo em $r=a$

---

## Resumo do Capítulo

### Fórmulas-Chave

| Conceito | Fórmula | Aplicações |
|---|---|---|
| Lei de Coulomb | $\vec{F}_{12} = \dfrac{1}{4\pi\varepsilon_0}\dfrac{q_1 q_2}{r^2}\hat{r}_{12}$ | Força entre cargas puntiformes |
| Campo de carga puntual | $\vec{E} = \dfrac{1}{4\pi\varepsilon_0}\dfrac{q}{r^2}\hat{r}$ | Campo de uma carga |
| Lei de Gauss (integral) | $\displaystyle\oint_S \vec{E}\cdot d\vec{A} = \dfrac{Q_{env}}{\varepsilon_0}$ | Cálculo de campos com simetria |
| Lei de Gauss (pontual) | $\nabla\cdot\vec{E} = \dfrac{\rho}{\varepsilon_0}$ | Forma diferencial/local |
| Condição de contorno (normal) | $\hat n_{12}\cdot(\vec E_2-\vec E_1)=\dfrac{\sigma_{\rm tot}}{\varepsilon_0}$ | Interfaces entre materiais |
| Condição de contorno (tangencial) | $\hat n_{12}\times(\vec E_2-\vec E_1)=0$ | Continuidade do campo tangencial |

### Casos de Simetria Comuns

| Simetria | Distribuição | Campo $E(r)$ |
|---|---|---|
| Esférica | Casca de raio $a$, carga $Q$ | $E=0$ ($r<a$); $E=\dfrac{Q}{4\pi\varepsilon_0 r^2}$ ($r\ge a$) |
| Esférica | Esfera sólida, $\rho_0$ constante | $E=\dfrac{\rho_0 r}{3\varepsilon_0}$ ($r<a$); $E=\dfrac{\rho_0 a^3}{3\varepsilon_0 r^2}$ ($r\ge a$) |
| Cilíndrica | Fio infinito, densidade $\lambda$ | $E=\dfrac{\lambda}{2\pi\varepsilon_0 r}$ |
| Planar | Plano infinito, densidade $\sigma$ | $E=\dfrac{\sigma}{2\varepsilon_0}$ |
| Planar duplo | Capacitor de placas paralelas | $E=\dfrac{\sigma}{\varepsilon_0}$ (entre placas), $0$ (fora) |

### Conceitos-Chave

1. **Fluxo elétrico**: Mede "quantas linhas de campo" atravessam uma superfície.
2. **Lei de Gauss**: Só é útil para calcular $\vec E$ diretamente quando há simetria suficiente.
3. **Forma pontual**: $\nabla\cdot\vec{E} = \rho/\varepsilon_0$ é a primeira equação de Maxwell.
4. **Condições de contorno**: $E_\parallel$ é sempre contínua; $E_\perp$ descontinua na presença de carga superficial.
5. **Refração do campo elétrico**: Em dielétricos, o campo se curva para ficar mais paralelo à interface.

::: verificacao
**Verificação Rápida (Concept Check):**  
1. O fluxo elétrico líquido nulo implica que $\vec E=0$ em todos os pontos da superfície? **Não** — apenas que a carga líquida encerrada é zero.  
2. Dentro de um condutor em equilíbrio eletrostático, o campo elétrico é **zero** ou **constante**? **Zero.**  
3. A componente tangencial de $\vec E$ é **contínua** ou **descontinua** na interface entre dois dielétricos? **Contínua.**
:::

## Lista de Exercícios Propostos

**E1.** Duas cargas puntiformes positivas, $q_1 = 4\,\text{nC}$ em $x=0$ e $q_2 = 9\,\text{nC}$ em $x=0{,}5\,\text{m}$, estão fixas no eixo $x$. Determine o ponto entre elas onde o campo elétrico resultante é nulo.

**E2.** Três cargas estão nos vértices de um triângulo equilátero de lado $a=0{,}2\,\text{m}$: $q_1=+2\,\text{nC}$, $q_2=+2\,\text{nC}$, $q_3=-2\,\text{nC}$. Determine a força resultante (módulo e direção) sobre $q_3$.

**E3.** Uma casca esférica isolante de raio $a=8\,\text{cm}$ tem carga total $Q=-4\,\text{nC}$ uniformemente distribuída. Calcule $\vec{E}$ em $r=4\,\text{cm}$ e em $r=16\,\text{cm}$.

**E4.** Um fio retilíneo infinito tem densidade linear $\lambda = 5\,\text{nC/m}$. A que distância radial $r$ o módulo do campo elétrico vale $900\,\text{N/C}$?

**E5.** Três planos infinitos paralelos, perpendiculares ao eixo $x$, estão localizados em $x=0$, $x=1\,\text{m}$ e $x=2\,\text{m}$, com densidades superficiais $\sigma_1=+3\,\text{nC/m}^2$, $\sigma_2=-2\,\text{nC/m}^2$ e $\sigma_3=+1\,\text{nC/m}^2$, respectivamente. Determine $\vec{E}$ (módulo e sentido) nas quatro regiões: $x<0$, $0<x<1$, $1<x<2$ e $x>2$.

**E6.** Um cabo coaxial é formado por um fio interno muito fino com densidade linear $\lambda=+3\,\text{nC/m}$ e uma casca cilíndrica condutora concêntrica (raio interno $b=2\,\text{cm}$, raio externo $c=3\,\text{cm}$) que transporta carga total por unidade de comprimento igual a $-2\lambda$. Determine $\vec{E}(r)$ nas três regiões: $r<b$, $b<r<c$ e $r>c$.

**E7.** Uma esfera maciça isolante de raio $a=6\,\text{cm}$ tem carga total $Q=5\,\text{nC}$ uniformemente distribuída em seu volume. Determine a que distância $r>a$ do centro o módulo do campo vale um quarto do valor na superfície, $E(a)/4$.

**E8.** *(Conceitual)* Uma superfície gaussiana fechada tem fluxo elétrico líquido nulo. É correto concluir que $\vec{E}=0$ em todos os pontos de $S$? Justifique fisicamente, dando um contraexemplo explícito.

**E9.** No interior de uma esfera maciça uniformemente carregada ($r<a$), o campo elétrico é $\vec{E}(r) = A\,r\,\hat{r}$, com $A$ constante. Usando a Lei de Gauss na forma pontual, obtenha a densidade volumétrica de carga $\rho$ em função de $A$ e $\varepsilon_0$, e mostre que o resultado é consistente com $A = \rho_0/(3\varepsilon_0)$.

**E10.** Na interface entre o ar ($\varepsilon_{r1}=1$) e um dielétrico de $\varepsilon_{r2}=5$, o campo elétrico no ar faz ângulo $\theta_1=45°$ com a normal à interface. Não há carga livre na interface. Determine o ângulo $\theta_2$ que o campo faz com a normal no dielétrico.

**E11.** Um disco de raio $R=0{,}05\,\text{m}$ tem densidade superficial uniforme $\sigma = 8\times10^{-9}\,\text{C/m}^2$. Calcule o campo elétrico no eixo do disco em $z=R$ (ou seja, à distância de um raio do centro) e compare numericamente com o valor que se obteria aproximando o disco por uma carga puntiforme na mesma posição.

**E12 (desafio).** Uma casca hemisférica de raio $R$ tem uma carga puntiforme $q$ localizada exatamente no centro de curvatura, sobre o plano que contém a borda circular (a "boca" do hemisfério). Usando a Lei de Gauss (sem integração direta de Coulomb sobre a superfície curva), determine o fluxo elétrico através da superfície curva do hemisfério.

**E13 (desafio).** Uma esfera maciça isolante de raio $a$ tem densidade volumétrica de carga uniforme $\rho_0$. Uma cavidade esférica de raio $b<a$ é escavada no interior da esfera, com centro deslocado de uma distância $d$ em relação ao centro da esfera original (com $d+b\le a$, de modo que a cavidade fique inteiramente contida na esfera). Mostre que o campo elétrico dentro da cavidade é **uniforme** e determine seu valor em função de $\rho_0$, $\varepsilon_0$ e do vetor deslocamento $\vec{d}$ entre os centros.

**E14 (desafio).** Uma barra fina de comprimento $L$, colocada ao longo do eixo $x$ entre $x=0$ e $x=L$, tem densidade linear de carga **não uniforme** $\lambda(x) = \lambda_0\dfrac{x}{L}$ (cresce linearmente de zero, na extremidade $x=0$, até $\lambda_0$, na extremidade $x=L$). Determine o campo elétrico no ponto $P$ sobre o eixo, a uma distância $d$ à esquerda da extremidade $x=0$ (isto é, em $x=-d$).

**E15.** Um próton está em repouso em uma região onde existe um campo elétrico uniforme $\vec{E}=(0,0,-2\times10^{4})\,\text{N/C}$. Determine o módulo e a direção da força elétrica sobre o próton, e compare (qualitativamente) com o peso do próton — qual força domina, e por quantas ordens de grandeza?

## Gabarito

**E1.** Para um ponto entre as cargas, a $x$ de $q_1$, os campos de $q_1$ e $q_2$ apontam em sentidos opostos (ambas as cargas são positivas, então cada uma empurra a carga de teste para longe de si). Igualando os módulos:

$$
\frac{q_1}{x^2} = \frac{q_2}{(d-x)^2} \quad\Rightarrow\quad \frac{d-x}{x} = \sqrt{\frac{q_2}{q_1}}
$$

Com $q_1=4\,\text{nC}$, $q_2=9\,\text{nC}$, $d=0{,}5\,\text{m}$: $\sqrt{q_2/q_1} = \sqrt{9/4} = 3/2$. Logo:

$$
x = \frac{d}{1+\sqrt{q_2/q_1}} = \frac{0{,}5}{1+1{,}5} = 0{,}2\,\text{m}
$$

$$
\boxed{x = 0{,}2\,\text{m à direita de }q_1\quad(\text{ou } 0{,}3\,\text{m à esquerda de }q_2)}
$$

Verificação: $E_1 = k(4\,\text{nC})/(0{,}2)^2 = 898{,}8\,\text{N/C}$ e $E_2 = k(9\,\text{nC})/(0{,}3)^2 = 898{,}8\,\text{N/C}$ — iguais, como esperado.

**E2.** Coloque $q_1$ e $q_2$ na base do triângulo e $q_3$ no topo (todas as distâncias mútuas $=a$). A força sobre $q_3$ é a soma vetorial de $\vec{F}_{31}$ (de $q_1$ sobre $q_3$) e $\vec{F}_{32}$ (de $q_2$ sobre $q_3$). Como $q_1=q_2=+2\,\text{nC}$ e $q_3=-2\,\text{nC}$, ambas as forças são **atrativas**, com módulo igual:

$$
|F_{31}| = |F_{32}| = k_e\frac{|q_1 q_3|}{a^2} = (8{,}99\times10^9)\frac{(2\times10^{-9})^2}{(0{,}2)^2} \approx 8{,}99\times10^{-7}\,\text{N}
$$

Por simetria do triângulo equilátero, as duas forças atrativas fazem ângulo de $60°$ entre si (cada uma aponta de $q_3$ para a respectiva carga da base) e a resultante aponta ao longo da bissetriz, na direção da base, com módulo:

$$
F_{res} = 2|F_{31}|\cos(30°) = 2(8{,}99\times10^{-7})(0{,}866)
$$

$$
\boxed{F_{res} \approx 1{,}56\times10^{-6}\,\text{N}, \text{ apontando de } q_3 \text{ para o ponto médio de } q_1q_2}
$$

**E3.** Casca esférica: $Q_{env}=0$ para qualquer superfície gaussiana com $r<a$, logo:

$$
\boxed{E(4\,\text{cm}) = 0}
$$

Para $r=16\,\text{cm} > a$, toda a carga está envolvida ($Q_{env}=Q=-4\,\text{nC}$):

$$
E(r) = \frac{Q}{4\pi\varepsilon_0 r^2} = \frac{-4\times10^{-9}}{4\pi(8{,}854\times10^{-12})(0{,}16)^2}
$$

$$
\boxed{E(16\,\text{cm}) \approx -1{,}40\times10^{3}\,\text{N/C}\ \text{(módulo }1{,}40\,\text{kN/C, apontando radialmente para dentro, pois }Q<0\text{)}}
$$

**E4.** Do resultado do fio infinito, $E(r) = \dfrac{\lambda}{2\pi\varepsilon_0 r}$. Isolando $r$:

$$
r = \frac{\lambda}{2\pi\varepsilon_0 E} = \frac{5\times10^{-9}}{2\pi(8{,}854\times10^{-12})(900)}
$$

$$
\boxed{r \approx 0{,}0999\,\text{m} \approx 10\,\text{cm}}
$$

**E5.** Cada plano $i$ contribui, em qualquer ponto, com módulo $\sigma_i/(2\varepsilon_0)$ na direção $x$, com **sinal $+$ se o ponto está à direita do plano $i$** e **sinal $-$ se está à esquerda** (convenção coerente com $\sigma_i>0$ empurrando para longe do plano e $\sigma_i<0$ atraindo para ele). O campo total em cada região é a soma algébrica $E(x) = \sum_i \pm\dfrac{\sigma_i}{2\varepsilon_0}$, com o sinal de cada termo definido pela posição de $x$ relativa ao plano $i$:

- **$x<0$** (à esquerda dos três planos, sinal $-$ para todos):

$$
E = -\frac{\sigma_1+\sigma_2+\sigma_3}{2\varepsilon_0} = -\frac{(3-2+1)\times10^{-9}}{2(8{,}854\times10^{-12})} \approx -112{,}9\,\text{N/C}
$$

$$
\boxed{E(x<0) \approx 112{,}9\,\text{N/C, apontando no sentido }-x}
$$

- **$0<x<1$** (à direita de $\sigma_1$: sinal $+$; à esquerda de $\sigma_2,\sigma_3$: sinal $-$):

$$
E = \frac{\sigma_1 - \sigma_2 - \sigma_3}{2\varepsilon_0} = \frac{(3+2-1)\times10^{-9}}{2(8{,}854\times10^{-12})} \approx +225{,}9\,\text{N/C}
$$

$$
\boxed{E(0<x<1) \approx +225{,}9\,\text{N/C (sentido }+x\text{)}}
$$

- **$1<x<2$** (à direita de $\sigma_1$ e $\sigma_2$: sinal $+$; à esquerda de $\sigma_3$: sinal $-$):

$$
E = \frac{\sigma_1+\sigma_2-\sigma_3}{2\varepsilon_0} = \frac{(3-2-1)\times10^{-9}}{2(8{,}854\times10^{-12})} = 0
$$

$$
\boxed{E(1<x<2) \approx 0}
$$

- **$x>2$** (à direita dos três, sinal $+$ para todos):

$$
E = \frac{\sigma_1+\sigma_2+\sigma_3}{2\varepsilon_0} = \frac{(3-2+1)\times10^{-9}}{2(8{,}854\times10^{-12})} \approx +112{,}9\,\text{N/C}
$$

$$
\boxed{E(x>2) \approx +112{,}9\,\text{N/C (sentido }+x\text{)}}
$$

Note a simetria: fora de todos os planos, o campo só "enxerga" a carga total por unidade de área ($\sigma_1+\sigma_2+\sigma_3=2\,\text{nC/m}^2$), como uma "casca" efetiva — igual em módulo e oposto em sentido nos dois lados.

**E6.** **Região $r<b$ (dentro do espaço vazio entre o fio e a casca):** a única carga envolvida é o fio, $Q_{env}=\lambda L$ para um cilindro gaussiano de comprimento $L$:

$$
\boxed{E(r) = \frac{\lambda}{2\pi\varepsilon_0 r},\quad r<b}
$$

**Região $b<r<c$ (dentro do condutor):** em equilíbrio eletrostático, $\vec{E}=0$ dentro de um condutor:

$$
\boxed{E=0,\quad b<r<c}
$$

Isso obriga a superfície interna da casca ($r=b$) a acumular carga induzida $-\lambda$ por unidade de comprimento (para cancelar o fluxo do fio dentro do condutor). Como a casca tem carga total $-2\lambda$ por comprimento, a superfície externa ($r=c$) deve ter $-2\lambda - (-\lambda) = -\lambda$ por unidade de comprimento.

**Região $r>c$:** $Q_{env}$ por unidade de comprimento $= \lambda(\text{fio}) + (-2\lambda)(\text{casca}) = -\lambda$:

$$
E(2\pi r) = \frac{-\lambda}{\varepsilon_0}\quad\Rightarrow\quad \boxed{E(r) = -\frac{\lambda}{2\pi\varepsilon_0 r},\quad r>c\ \text{(aponta radialmente para dentro)}}
$$

Numericamente, em $r=5\,\text{cm}$: $E = -\dfrac{3\times10^{-9}}{2\pi(8{,}854\times10^{-12})(0{,}05)} \approx -1{,}08\times10^{3}\,\text{N/C}$.

**E7.** Fora da esfera, $E(r) = \dfrac{Q}{4\pi\varepsilon_0 r^2}$, então $E(a) = \dfrac{Q}{4\pi\varepsilon_0 a^2}$. Queremos $E(r) = E(a)/4$:

$$
\frac{Q}{4\pi\varepsilon_0 r^2} = \frac{1}{4}\cdot\frac{Q}{4\pi\varepsilon_0 a^2} \quad\Rightarrow\quad r^2 = 4a^2 \quad\Rightarrow\quad r = 2a
$$

$$
\boxed{r = 2a = 12\,\text{cm}}
$$

(Faz sentido: como $E\propto 1/r^2$ fora da esfera, dobrar $r$ divide o campo por 4 — independe dos valores numéricos de $Q$ e $a$.)

**E8.** **Não.** $\Phi_E=0$ significa apenas que o fluxo **líquido** através de $S$ é zero, ou sequivalentemente que a carga líquida envolvida por $S$ é zero ($Q_{env}=0$). Isso não implica $\vec{E}=0$ em cada ponto de $S$ — apenas que, integrado sobre toda a superfície, as contribuições positivas e negativas se cancelam.

**Contraexemplo explícito**: duas cargas puntiformes iguais e opostas, $+q$ e $-q$, ambas dentro de uma superfície gaussiana esférica $S$. Então $Q_{env} = q + (-q) = 0$, logo $\Phi_E=0$. Porém $\vec{E}\neq 0$ em praticamente todo ponto de $S$ (o campo do dipolo é não nulo em quase todo o espaço) — apenas o fluxo **total**, somando entradas e saídas de linhas de campo, se anula.

$$
\boxed{\Phi_E=0 \Rightarrow Q_{env}=0,\ \text{mas isso \textbf{não} implica } \vec{E}=0 \text{ pontualmente em } S}
$$

**E9.** Em coordenadas esféricas, para um campo puramente radial $\vec{E}=E_r(r)\hat r$:

$$
\nabla\cdot\vec{E} = \frac{1}{r^2}\frac{\partial}{\partial r}\left(r^2 E_r\right)
$$

Com $E_r = Ar$:

$$
\nabla\cdot\vec{E} = \frac{1}{r^2}\frac{d}{dr}\left(A r^3\right) = \frac{1}{r^2}(3Ar^2) = 3A
$$

Pela Lei de Gauss na forma pontual, $\nabla\cdot\vec{E} = \rho/\varepsilon_0$:

$$
\boxed{\rho = 3\varepsilon_0 A}
$$

Verificação de consistência: no caso da esfera uniforme (Seção “Esfera sólida uniformemente carregada”), $E(r) = \dfrac{\rho_0}{3\varepsilon_0}r$, ou seja $A=\rho_0/(3\varepsilon_0)$. Substituindo:

$$
\rho = 3\varepsilon_0\cdot\frac{\rho_0}{3\varepsilon_0} = \rho_0 \checkmark
$$

confirmando que a densidade recuperada é exatamente a densidade uniforme original — como deveria ser, já que $\rho$ é constante (não depende de $r$), consistente com o campo crescendo linearmente.

**E10.** Como não há carga livre na interface, a componente tangencial de $\vec{E}$ é contínua e $D_\perp$ é contínuo ($\varepsilon_1 E_{1\perp} = \varepsilon_2 E_{2\perp}$). Segue (Seção “Condições de contorno para $\vec{D}$ em interfaces dielétricas”):

$$
\tan\theta_2 = \frac{\varepsilon_{r2}}{\varepsilon_{r1}}\tan\theta_1 = \frac{5}{1}\tan(45°) = 5\times 1 = 5
$$

$$
\boxed{\theta_2 = \arctan(5) \approx 78{,}7°}
$$

O campo se afasta ainda mais da normal ao entrar no meio de maior permissividade — consistente com a tendência discutida no exemplo ar-água da Seção “Condições de contorno para $\vec{D}$ em interfaces dielétricas”.

**E11.** Do resultado do disco (Seção “Disco carregado uniformemente no eixo”), com $z=R$:

$$
E_z = \frac{\sigma}{2\varepsilon_0}\left(1-\frac{|z|}{\sqrt{R^2+z^2}}\right) = \frac{\sigma}{2\varepsilon_0}\left(1-\frac{R}{\sqrt{2}R}\right) = \frac{\sigma}{2\varepsilon_0}\left(1-\frac{1}{\sqrt{2}}\right)
$$

$$
E_z = \frac{8\times10^{-9}}{2(8{,}854\times10^{-12})}(1-0{,}7071) \approx (451{,}9)(0{,}2929)
$$

$$
\boxed{E_z \approx 132{,}4\,\text{N/C}\quad\text{(disco exato)}}
$$

**Aproximação por carga puntiforme**: $Q = \sigma\pi R^2 = (8\times10^{-9})\pi(0{,}05)^2 \approx 6{,}28\times10^{-11}\,\text{C}$, e:

$$
E_{pontual} = \frac{Q}{4\pi\varepsilon_0 z^2} = \frac{Q}{4\pi\varepsilon_0 R^2} = k\frac{6{,}28\times10^{-11}}{(0{,}05)^2} \approx 226{,}0\,\text{N/C}
$$

$$
\boxed{E_{pontual}\approx 226{,}0\,\text{N/C}\quad(\text{erro de }\approx 71\%\text{ em relação ao valor exato})}
$$

Em $z=R$ (não muito distante do disco, $z/R=1$), a aproximação de carga puntiforme **falha significativamente** — ela só é válida para $z\gg R$, como discutido na Seção “Disco carregado uniformemente no eixo”.

**E12 (desafio).** A carga está exatamente sobre o plano da borda; portanto, não se pode aplicar diretamente a Lei de Gauss à superfície fechada formada pelo hemisfério e pelo disco, pois a carga estaria **sobre a fronteira**, não no seu interior. A forma rigorosa de calcular o fluxo é usar o ângulo sólido subtendido pela superfície aberta:

$$
\Phi = \frac{q}{4\pi\varepsilon_0}\,\Omega.
$$

Vista do centro de curvatura, a superfície curva do hemisfério cobre exatamente metade das direções do espaço: $\Omega=2\pi\,\text{sr}$. Assim,

$$
\boxed{\Phi_{\text{curva}} = \frac{q}{4\pi\varepsilon_0}(2\pi)=\frac{q}{2\varepsilon_0}}.
$$

O resultado é metade do fluxo associado a uma esfera completa. Como verificação geométrica, no disco da borda o campo é tangente ao plano, de modo que seu fluxo é nulo; isso é compatível com a decomposição por hemisférios, mas não autoriza tratar a carga sobre a fronteira como carga enclausurada na Lei de Gauss.

**E13 (desafio).** Seja $O$ o centro da esfera original (raio $a$) e $O'$ o centro da cavidade (raio $b$), com $\vec{d}$ o vetor de $O$ a $O'$. A distribuição real (esfera com cavidade) pode ser escrita, por **superposição linear**, como:

$$
\rho_{\text{real}}(\vec r) = \underbrace{\rho_0\ \text{(esfera cheia de raio }a\text{, centrada em }O\text{)}}_{\text{sistema 1}} \ +\ \underbrace{(-\rho_0)\ \text{(esfera cheia de raio }b\text{, centrada em }O'\text{)}}_{\text{sistema 2}}
$$

pois a soma dessas duas distribuições cancela exatamente a densidade $\rho_0$ dentro da cavidade (sistema 2 tem densidade $-\rho_0$ ali) e reproduz $\rho_0$ no restante da esfera grande — igual à distribuição real.

Pelo princípio da superposição, $\vec E_{\text{real}} = \vec E_1 + \vec E_2$. Para um ponto **dentro da cavidade** (que está necessariamente dentro de ambas as esferas auxiliares, já que $b<a$ e a cavidade está contida na esfera grande), usamos o resultado da Seção “Esfera sólida uniformemente carregada” para o campo interno de uma esfera uniforme, aplicado a cada sistema com seu próprio centro:

$$
\vec E_1(\vec r) = \frac{\rho_0}{3\varepsilon_0}\,\vec r \qquad(\vec r \text{ medido a partir de } O)
$$

$$
\vec E_2(\vec r\,') = \frac{-\rho_0}{3\varepsilon_0}\,\vec r\,' \qquad(\vec r\,' \text{ medido a partir de } O')
$$

Como $\vec r = \vec r\,' + \vec d$ (relação geométrica entre os vetores posição medidos a partir de $O$ e de $O'$):

$$
\vec E_{\text{real}} = \frac{\rho_0}{3\varepsilon_0}\vec r - \frac{\rho_0}{3\varepsilon_0}\vec r\,' = \frac{\rho_0}{3\varepsilon_0}(\vec r - \vec r\,') = \frac{\rho_0}{3\varepsilon_0}\vec d
$$

O vetor $\vec d$ é **constante** (não depende do ponto de observação dentro da cavidade) — logo o campo dentro da cavidade é **uniforme**:

$$
\boxed{\vec E_{\text{cavidade}} = \frac{\rho_0}{3\varepsilon_0}\,\vec d\qquad\text{(campo uniforme, independente da posição dentro da cavidade)}}
$$

Este é um resultado notável: apesar da geometria complicada (esfera com um buraco descentralizado), o campo no interior do buraco é perfeitamente uniforme, com módulo proporcional apenas à distância $d$ entre os centros — e **independente do raio $b$ da cavidade**.

**E14 (desafio).** Um elemento de carga em posição $x$ (com $0\le x\le L$) tem $dq = \lambda(x)\,dx = \lambda_0\dfrac{x}{L}dx$. A distância desse elemento até o ponto $P$ (em $x=-d$) é $(x+d)$, e o campo que ele produz em $P$ aponta no sentido $-x$ (afastando-se da barra, supondo $\lambda_0>0$):

$$
dE = \frac{1}{4\pi\varepsilon_0}\frac{dq}{(x+d)^2} = \frac{\lambda_0}{4\pi\varepsilon_0 L}\frac{x\,dx}{(x+d)^2}
$$

Integrando de $x=0$ a $x=L$:

$$
E = \frac{\lambda_0}{4\pi\varepsilon_0 L}\int_0^L \frac{x\,dx}{(x+d)^2}
$$

Substituindo $u=x+d$ (logo $x=u-d$, $dx=du$), com limites $u:d\to L+d$:

$$
\int_0^L\frac{x\,dx}{(x+d)^2} = \int_d^{L+d}\frac{u-d}{u^2}\,du = \int_d^{L+d}\left(\frac{1}{u}-\frac{d}{u^2}\right)du = \left[\ln u + \frac{d}{u}\right]_d^{L+d}
$$

$$
= \ln(L+d) + \frac{d}{L+d} - \ln d - 1 = \ln\!\left(\frac{L+d}{d}\right) + \frac{d}{L+d} - 1
$$

Portanto:

$$
\boxed{E = \frac{\lambda_0}{4\pi\varepsilon_0 L}\left[\ln\!\left(\frac{L+d}{d}\right) + \frac{d}{L+d} - 1\right]}
$$

apontando no sentido $-x$ (afastando-se da barra, para $\lambda_0>0$).

**Verificação numérica** com $L=0{,}5\,\text{m}$, $\lambda_0 = 6\,\text{nC/m}$, $d=0{,}2\,\text{m}$: o colchete vale $\ln(3{,}5)+0{,}2/0{,}7-1 = 1{,}2528+0{,}2857-1=0{,}5385$, e:

$$
E = \frac{(8{,}99\times10^9)(6\times10^{-9})}{0{,}5}(0{,}5385) \approx 58{,}1\,\text{N/C}
$$

valor confirmado por integração numérica direta. Note que a carga total da barra é $Q=\int_0^L\lambda_0\frac{x}{L}dx = \dfrac{\lambda_0 L}{2}$ — metade do que teria uma barra uniforme com densidade $\lambda_0$, resultado consistente com a densidade crescendo linearmente de $0$ a $\lambda_0$.

**E15.** A força elétrica sobre o próton ($q=+e=1{,}602\times10^{-19}\,\text{C}$) é:

$$
\vec F_E = q\vec E = (1{,}602\times10^{-19})(0,0,-2\times10^4)\,\text{N}
$$

$$
\boxed{\vec F_E = (0,\,0,\,-3{,}20\times10^{-15})\,\text{N}\quad\text{(aponta no sentido }-z\text{, mesmo sentido de }\vec E\text{, pois a carga é positiva)}}
$$

O peso do próton ($m_p \approx 1{,}673\times10^{-27}\,\text{kg}$, $g\approx 9{,}8\,\text{m/s}^2$) é:

$$
P = m_p g \approx (1{,}673\times10^{-27})(9{,}8) \approx 1{,}64\times10^{-26}\,\text{N}
$$

$$
\boxed{\frac{F_E}{P} = \frac{3{,}20\times10^{-15}}{1{,}64\times10^{-26}} \approx 2\times10^{11}}
$$

A força elétrica domina o peso por cerca de **11 ordens de grandeza** — ilustrando por que efeitos gravitacionais são sistematicamente desprezados em problemas de eletrostática envolvendo partículas subatômicas.
