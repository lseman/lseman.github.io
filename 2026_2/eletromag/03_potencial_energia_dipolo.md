# Potencial Elétrico, Energia e Dipolo Elétrico

> Eletromagnetismo — Apostila de Curso
> Tópicos: Energia Potencial Elétrica · Gradiente do Potencial Elétrico · Equação de Poisson · Energia Armazenada no Campo Elétrico · Dipolo Elétrico

---

## Objetivos de Aprendizagem

Ao final deste capítulo, você será capaz de:

- [ ] Calcular o trabalho e a energia potencial elétrica em campos eletrostáticos.
- [ ] Relacionar o campo elétrico ao potencial através da relação $\vec E = -\nabla V$.
- [ ] Resolver a equação de Poisson e Laplace para distribuições de carga.
- [ ] Calcular a energia armazenada no campo elétrico.
- [ ] Analisar dipolos elétricos: potencial, campo, torque e energia em campos externos.

---

## Intuição Física: Por que Potencial Elétrico?

O potencial elétrico $V$ é uma ferramenta matemática poderosa porque:

- É um **escalar**, muito mais fácil de calcular do que o campo vetorial $\vec E$.
- Uma vez conhecido $V$, o campo é obtido por derivada: $\vec E = -\nabla V$.
- A diferença de potencial (tensão) é o que "impulsiona" correntes em circuitos elétricos.
- O potencial é análogo à "altitude" em um campo gravitacional: cargas positivas "caem" de potencial alto para baixo, como objetos caem de alta para baixa altitude.

## Aplicações no Mundo Real

| Conceito | Aplicação Prática |
|---|---|
| Potencial elétrico | Tensão em circuitos eletrônicos e distribuição de energia |
| Equação de Poisson/Laplace | Projeto de capacitores, eletrodos e blindagem eletromagnética |
| Energia no campo elétrico | Armazenamento de energia em capacitores e supercapacitores |
| Dipolo elétrico | Moléculas polares (água), antenas dipolo, ressonância magnética |
| Expansão multipolar | Simulação de campos em sistemas complexos (geofísica, astrofísica) |

---

## Antes de começar

Ao final, você deve relacionar trabalho, potencial e campo, usar Poisson/Laplace, calcular energia eletrostática e reconhecer os limites da aproximação de dipolo. **Diagnóstico:** potencial nulo em um ponto garante campo nulo nesse ponto? **Evidência mínima:** derivar $\vec E=-\nabla V$, comparar potencial exato e aproximado e conferir sinais de energia de dipolos.

## Sumário

1. [Trabalho e Energia Potencial Elétrica](#trabalho-e-energia-potencial-elétrica)
2. [O Potencial Elétrico e o Gradiente](#o-potencial-elétrico-e-o-gradiente)
3. [Equação de Poisson e de Laplace](#equação-de-poisson-e-de-laplace)
4. [Expansão multipolar](#expansão-multipolar)
5. [Energia Armazenada no Campo Elétrico](#energia-armazenada-no-campo-elétrico)
6. [Dipolo Elétrico](#dipolo-elétrico)
7. [Exercícios resolvidos em Python](#exercícios-resolvidos-em-python)
8. [Lista de Exercícios Propostos](#lista-de-exercícios-propostos)
9. [Gabarito](#gabarito)

## Trabalho e Energia Potencial Elétrica

<!-- slides: break -->

### O campo eletrostático é conservativo

O trabalho realizado pela força elétrica ao mover uma carga de teste $q_0$ de um ponto $A$ até $B$ é:

$$
W_{A\to B} = \int_A^B \vec{F}\cdot d\vec{\ell} = q_0\int_A^B \vec{E}\cdot d\vec{\ell}
$$

Para uma carga puntiforme fonte $q$ na origem, com $\vec{E} = \frac{q}{4\pi\varepsilon_0 r^2}\hat{r}$, escolhendo um caminho radial (o resultado independe do caminho, como se mostra a seguir):

$$
W_{A\to B} = \frac{qq_0}{4\pi\varepsilon_0}\int_{r_A}^{r_B}\frac{dr}{r^2} = \frac{qq_0}{4\pi\varepsilon_0}\left(\frac{1}{r_A}-\frac{1}{r_B}\right)
$$

O resultado depende **apenas** dos pontos inicial e final, não do caminho percorrido — a marca registrada de uma força conservativa. Isso decorre matematicamente do fato de que $\vec{E}$ de uma carga puntiforme é **irrotacional**:

$$
\nabla\times\vec{E} = 0
$$

(pode-se verificar isso diretamente calculando o rotacional de $\hat{r}/r^2$ em coordenadas esféricas, ou reconhecer que qualquer campo puramente radial com dependência apenas de $r$ tem rotacional nulo). Por superposição, o campo de **qualquer** distribuição estática de cargas também é irrotacional — propriedade que caracteriza a *eletrostática* frente à eletrodinâmica geral (onde $\nabla\times\vec{E} = -\partial\vec{B}/\partial t \neq 0$, Lei de Faraday).

### Energia potencial elétrica

Como a força é conservativa, define-se a **energia potencial elétrica** $U$ tal que $W_{A\to B} = -(U_B - U_A) = U_A - U_B$. Comparando com o resultado acima:

$$
U(r) = \frac{qq_0}{4\pi\varepsilon_0 r} + \text{const.}
$$

Convencionalmente, toma-se $U\to 0$ quando $r\to\infty$, eliminando a constante:

$$
U(r) = \frac{1}{4\pi\varepsilon_0}\frac{qq_0}{r}
$$

## O Potencial Elétrico e o Gradiente

### Definição

Assim como o campo elétrico é a força por unidade de carga, o **potencial elétrico** $V$ é a energia potencial por unidade de carga:

$$
V(\vec{r}) \equiv \frac{U(\vec{r})}{q_0} = -\int_{\text{ref}}^{\vec{r}}\vec{E}\cdot d\vec{\ell}
$$

Para uma carga puntiforme (com referência no infinito):

$$
V(r) = \frac{1}{4\pi\varepsilon_0}\frac{q}{r}
$$

Por superposição, para uma distribuição contínua:

$$
V(\vec{r}) = \frac{1}{4\pi\varepsilon_0}\int_{V'}\frac{\rho(\vec{r}')}{|\vec{r}-\vec{r}'|}\,dV'
$$

Note que $V$ é um **escalar** — em geral muito mais simples de calcular que $\vec{E}$ (vetor), o que faz do potencial uma ferramenta intermediária poderosa.

### Relação campo–potencial: o gradiente

Da definição $V(\vec{r}) = -\int_{\text{ref}}^{\vec{r}}\vec{E}\cdot d\vec{\ell}$, a variação infinitesimal de $V$ ao longo de um deslocamento $d\vec{\ell}$ é:

$$
dV = -\vec{E}\cdot d\vec{\ell}
$$

Mas, por definição de gradiente, $dV = \nabla V\cdot d\vec{\ell}$ para qualquer deslocamento $d\vec{\ell}$. Como isso vale para **qualquer** direção de $d\vec{\ell}$, conclui-se:

$$
\boxed{\vec{E} = -\nabla V}
$$

**Interpretação geométrica**: o campo elétrico aponta na direção de **máxima queda** do potencial, com módulo igual à taxa dessa queda. As linhas de campo são sempre perpendiculares às superfícies equipotenciais ($V=$ const.).

Em coordenadas cartesianas:

$$
\vec{E} = -\left(\frac{\partial V}{\partial x}\hat{x}+\frac{\partial V}{\partial y}\hat{y}+\frac{\partial V}{\partial z}\hat{z}\right)
$$

**Verificação de consistência**: como $\nabla\times(\nabla V) \equiv 0$ para qualquer função escalar $V$ (identidade vetorial), a relação $\vec{E}=-\nabla V$ automaticamente garante $\nabla\times\vec{E}=0$, coerente com a Seção “O campo eletrostático é conservativo”.

## Equação de Poisson e de Laplace

### Dedução

Partindo da Lei de Gauss na forma pontual (arquivo anterior):

$$
\nabla\cdot\vec{E} = \frac{\rho}{\varepsilon_0}
$$

e substituindo $\vec{E} = -\nabla V$:

$$
\nabla\cdot(-\nabla V) = \frac{\rho}{\varepsilon_0}
$$

$$
\boxed{\nabla^2 V = -\frac{\rho}{\varepsilon_0}}\qquad\text{(Equação de Poisson)}
$$

onde $\nabla^2 = \nabla\cdot\nabla$ é o **operador laplaciano**, que em cartesianas é:

$$
\nabla^2 V = \frac{\partial^2 V}{\partial x^2}+\frac{\partial^2 V}{\partial y^2}+\frac{\partial^2 V}{\partial z^2}
$$

Em regiões **sem carga livre** ($\rho=0$), a equação se reduz à **Equação de Laplace**:

$$
\boxed{\nabla^2 V = 0}
$$

### Por que essas equações são centrais

A Equação de Poisson/Laplace transforma um problema de eletrostática (encontrar $\vec{E}$ dada $\rho$) em um **problema de valor de contorno** para uma EDP escalar de segunda ordem. Com dados de Dirichlet adequados, $V$ é único. Com dados puramente de Neumann, a solução — quando existe — é única **até uma constante aditiva**, que não altera $\vec E=-\nabla V$; além disso, fonte e fluxo normal prescrito devem satisfazer a condição de compatibilidade obtida ao integrar Poisson e aplicar Gauss. Isso justifica métodos como separação de variáveis, funções de Green e imagens, sem esconder as condições de existência.

## Expansão multipolar

### Expansão da integral de Poisson — monopolo e dipolo

A solução da equação de Poisson pode ser escrita como:

$$
V(\vec{r}) = \frac{1}{4\pi\varepsilon_0}\int_{V'}\frac{\rho(\vec{r}')}{|\vec{r}-\vec{r}'|}\,dV'
$$

Quando o ponto de observação está **longe** da distribuição de carga ($r\gg r'$), podemos expandir $\dfrac{1}{|\vec{r}-\vec{r}'|}$ em série de Taylor. Usando a identidade:

$$
\frac{1}{|\vec{r}-\vec{r}'|} = \frac{1}{r} + \vec{r}'\cdot\nabla\left(\frac{1}{r}\right) + \frac{1}{2}\sum_{i,j}x_i'x_j'\frac{\partial^2}{\partial x_i\partial x_j}\left(\frac{1}{r}\right) + \cdots
$$

Com $\nabla\left(\dfrac{1}{r}\right) = -\dfrac{\hat{r}}{r^2}$ e $\dfrac{\partial^2}{\partial x_i\partial x_j}\left(\dfrac{1}{r}\right) = \dfrac{3x_ix_j-r^2\delta_{ij}}{r^5}$, obtemos:

$$
\boxed{\frac{1}{|\vec{r}-\vec{r}'|} = \frac{1}{r} + \frac{\vec{r}\cdot\vec{r}'}{r^3} + \frac{1}{2}\sum_{i,j}\frac{3x_ix_j-r^2\delta_{ij}}{r^5}\,x_i'x_j' + \cdots}
$$

Substituindo na integral de Poisson, cada termo gera uma contribuição diferente:

**Termo monopolo** ($1/r$):
$$
V_{\text{mono}} = \frac{1}{4\pi\varepsilon_0}\frac{1}{r}\int\rho(\vec{r}')\,dV' = \frac{1}{4\pi\varepsilon_0}\frac{Q_{\text{total}}}{r}
$$

É o potencial de uma carga puntiforme total — domina a grandes distâncias se $Q_{\text{total}}\neq0$.

**Termo dipolo** ($\vec{r}\cdot\vec{r}'/r^3$):
$$
V_{\text{dip}} = \frac{1}{4\pi\varepsilon_0}\frac{1}{r^3}\int\rho(\vec{r}')\,\vec{r}\cdot\vec{r}'\,dV' = \frac{1}{4\pi\varepsilon_0}\frac{\vec{p}\cdot\hat{r}}{r^2}
$$

com $\vec{p} = \displaystyle\int \vec{r}'\,\rho(\vec{r}')\,dV'$ — o **momento de dipolo** da distribuição. Este termo domina quando a carga total é zero (ou próxima de zero).

**Termo quadrupolo**:
$$
V_{\text{quad}} = \frac{1}{4\pi\varepsilon_0}\frac{1}{2r^5}\sum_{i,j}Q_{ij}\,x_ix_j
$$

com o **tensor de quadrupolo** $Q_{ij} = \displaystyle\int\left(3x_i'x_j'-r'^2\delta_{ij}\right)\rho(\vec{r}')\,dV'$.

**Regra geral**: cada termo multipolar adicional cai mais rápido ($1/r^{\ell+1}$), de modo que a grande distância, apenas o primeiro termo não-nulo é relevante.

### Solução numérica por relaxação (diferenças finitas)

Discretizando o laplaciano 2D em uma malha regular de espaçamento $h$:

$$
\nabla^2 V \approx \frac{V_{i+1,j}+V_{i-1,j}+V_{i,j+1}+V_{i,j-1}-4V_{i,j}}{h^2}
$$

Impondo $\nabla^2 V = 0$ (região sem carga), obtém-se a **regra da média**:

$$
V_{i,j} = \frac{1}{4}\left(V_{i+1,j}+V_{i-1,j}+V_{i,j+1}+V_{i,j-1}\right)
$$

que é a base do método de relaxação de Jacobi/Gauss-Seidel: cada ponto converge para a média de seus vizinhos, sujeito às condições de contorno fixas.

```python
import numpy as np
import matplotlib.pyplot as plt

def resolver_laplace_2d(N=100, iters=6000, V_top=100.0, V_bottom=-100.0,
                          V_left=0.0, V_right=0.0):
    """Resolve Laplace em uma caixa quadrada com condições de Dirichlet."""
    V = np.zeros((N, N))
    V[0, :]  = V_top
    V[-1, :] = V_bottom
    V[:, 0]  = V_left
    V[:, -1] = V_right
    for _ in range(iters):
        V_new = V.copy()
        V_new[1:-1,1:-1] = 0.25*(V[2:,1:-1]+V[:-2,1:-1]+V[1:-1,2:]+V[1:-1,:-2])
        V_new[0,:], V_new[-1,:] = V_top, V_bottom
        V_new[:,0], V_new[:,-1] = V_left, V_right
        V = V_new
    return V

V = resolver_laplace_2d()
Ey, Ex = np.gradient(-V)     # E = -grad(V); np.gradient devolve (d/d_linha, d/d_coluna)

fig, axs = plt.subplots(1, 2, figsize=(11,5))
c = axs[0].imshow(V, cmap='RdBu_r')
axs[0].set_title('Potencial V (relaxação numérica)')
plt.colorbar(c, ax=axs[0])
axs[1].streamplot(np.arange(V.shape[1]), np.arange(V.shape[0]), Ex, Ey,
                   color='k', density=1.2)
axs[1].set_title('Campo E = -∇V (derivado numericamente)')
axs[1].invert_yaxis()
plt.tight_layout()
```

## Energia Armazenada no Campo Elétrico

### Energia para montar uma distribuição de cargas

Considere trazer cargas do infinito, uma a uma, para montar uma distribuição final. A energia total é o trabalho necessário para isso. Para $N$ cargas puntiformes, o resultado (bem conhecido) é:

$$
U = \frac{1}{2}\sum_{i=1}^N q_i V_i
$$

onde $V_i$ é o potencial no local da carga $i$ devido a **todas as outras** cargas. O fator $\frac12$ evita contar cada par de cargas duas vezes.

Para uma distribuição contínua suficientemente regular, a soma vira integral:

$$
U = \frac{1}{2}\int_V \rho(\vec{r})\,V(\vec{r})\,dV.
$$

Para cargas puntiformes, $V_i$ na soma exclui o potencial da própria carga. Já a integral de $E^2$ inclui a autoenergia, que diverge no modelo clássico de ponto. Portanto, a equivalência abaixo vale diretamente para distribuições contínuas de energia finita; para pontos, deve-se remover/regularizar as autoenergias antes de comparar apenas a energia de interação.

### Reescrevendo em termos do campo

Usando $\rho = \varepsilon_0\nabla\cdot\vec{E}$ (Lei de Gauss pontual):

$$
U = \frac{\varepsilon_0}{2}\int_V (\nabla\cdot\vec{E})\,V\,dV
$$

Usa-se a identidade vetorial $\nabla\cdot(V\vec{E}) = V(\nabla\cdot\vec{E}) + \vec{E}\cdot\nabla V$, isto é, $(\nabla\cdot\vec{E})V = \nabla\cdot(V\vec{E}) - \vec{E}\cdot\nabla V$:

$$
U = \frac{\varepsilon_0}{2}\int_V \nabla\cdot(V\vec{E})\,dV - \frac{\varepsilon_0}{2}\int_V \vec{E}\cdot\nabla V\,dV
$$

Aplicando o Teorema do Divergente ao primeiro termo (convertendo em integral de superfície) e usando $\nabla V = -\vec{E}$ no segundo:

$$
U = \frac{\varepsilon_0}{2}\oint_S V\vec{E}\cdot d\vec{A} + \frac{\varepsilon_0}{2}\int_V E^2\,dV
$$

Se estendermos $V$ (o volume de integração) para todo o espaço, a integral de superfície é avaliada no infinito, onde $V\to 1/r$ e $E\to 1/r^2$, enquanto a área cresce como $r^2$ — o integrando cai como $1/r$ e a integral de superfície se anula quando $r\to\infty$. Resta:

$$
\boxed{U = \frac{\varepsilon_0}{2}\int_{\text{todo espaço}} E^2\,dV = \int_{\text{todo espaço}} u_E\,dV,\qquad u_E \equiv \frac{1}{2}\varepsilon_0 E^2}
$$

### Interpretação física: energia "no campo"

Essa reformulação é conceitualmente profunda: em vez de atribuir a energia às **cargas** (integral sobre $\rho V$, restrita às regiões com carga), pode-se atribuí-la ao **campo** (integral sobre $E^2$, estendida a todo o espaço, mesmo onde não há carga). Essa segunda visão é a que sobrevive na eletrodinâmica geral e nas ondas eletromagnéticas: um campo de radiação transporta energia através do espaço vazio, longe de qualquer carga — algo inexplicável na primeira visão, mas natural na densidade de energia $u_E = \frac12\varepsilon_0 E^2$ (que reaparecerá, com um termo magnético análogo, na Parte 2 da apostila).

## Dipolo Elétrico

### Definição e momento de dipolo

Um **dipolo elétrico** é o sistema de duas cargas puntiformes $+q$ e $-q$ separadas por um vetor deslocamento $\vec{d}$ (apontando da carga negativa para a positiva). Define-se o **momento de dipolo**:

$$
\vec{p} \equiv q\,\vec{d}
$$


### Dedução do potencial em campo distante

Coloque $+q$ em $\vec{d}/2$ e $-q$ em $-\vec{d}/2$. O potencial em um ponto $\vec{r}$ (com $r\gg d$):

$$
V(\vec{r}) = \frac{1}{4\pi\varepsilon_0}\left(\frac{q}{r_+}-\frac{q}{r_-}\right)
$$

onde $r_\pm = |\vec{r}\mp\vec{d}/2|$. Expandindo $r_\pm$ em série para $d\ll r$, usando lei dos cossenos com $\theta$ o ângulo entre $\vec{r}$ e $\vec{d}$:

$$
r_\pm^2 = r^2 \mp rd\cos\theta + \frac{d^2}{4} \approx r^2\left(1\mp\frac{d}{r}\cos\theta\right)
$$

$$
\frac{1}{r_\pm} \approx \frac{1}{r}\left(1\mp\frac{d}{r}\cos\theta\right)^{-1/2} \approx \frac{1}{r}\left(1\pm\frac{d\cos\theta}{2r}\right)
$$

Logo:

$$
\frac{1}{r_+}-\frac{1}{r_-} \approx \frac{d\cos\theta}{r^2}
$$

$$
\boxed{V(r,\theta) \approx \frac{1}{4\pi\varepsilon_0}\frac{qd\cos\theta}{r^2} = \frac{1}{4\pi\varepsilon_0}\frac{\vec{p}\cdot\hat{r}}{r^2}}
$$

Note a queda com $1/r^2$ (mais rápida que $1/r$ da carga puntiforme) — reflexo do cancelamento parcial entre as cargas opostas a grandes distâncias.

### Campo elétrico do dipolo

Aplicando $\vec{E} = -\nabla V$ em coordenadas esféricas ($\nabla = \hat{r}\partial_r + \hat\theta\frac{1}{r}\partial_\theta$, sem dependência em $\phi$ por simetria azimutal):

$$
E_r = -\frac{\partial V}{\partial r} = \frac{2p\cos\theta}{4\pi\varepsilon_0 r^3}, \qquad
E_\theta = -\frac{1}{r}\frac{\partial V}{\partial \theta} = \frac{p\sin\theta}{4\pi\varepsilon_0 r^3}
$$

$$
\boxed{\vec{E}(r,\theta) = \frac{p}{4\pi\varepsilon_0 r^3}\left(2\cos\theta\,\hat{r}+\sin\theta\,\hat\theta\right)}
$$

O campo cai como $1/r^3$ — mais rápido ainda que o potencial, como esperado (o campo é derivada do potencial).

### Torque e energia em um campo externo

Em um campo externo uniforme $\vec{E}_{ext}$, a força líquida sobre o dipolo é nula (as forças em $+q$ e $-q$ se cancelam), mas há um **torque líquido**, pois as forças atuam em pontos diferentes:

$$
\vec{\tau} = \left(\frac{\vec{d}}{2}\right)\times(q\vec{E}_{ext}) + \left(-\frac{\vec{d}}{2}\right)\times(-q\vec{E}_{ext}) = q\vec{d}\times\vec{E}_{ext}
$$

$$
\boxed{\vec{\tau} = \vec{p}\times\vec{E}_{ext}}
$$

Esse torque tende a alinhar $\vec{p}$ com $\vec{E}_{ext}$. A energia potencial associada (trabalho para girar o dipolo de uma orientação de referência perpendicular a $\vec{E}_{ext}$) é:

$$
\boxed{U = -\vec{p}\cdot\vec{E}_{ext}}
$$

mínima (mais estável) quando $\vec{p}$ está paralelo a $\vec{E}_{ext}$ — princípio por trás da polarização de dielétricos (próximo arquivo) e de fenômenos como a ressonância magnética/elétrica em moléculas polares.

---

### Exemplo Resolvido Passo a Passo: Torque e Energia de um Dipolo em Campo Externo

**Problema**: Um dipolo elétrico com momento $p = 5\times10^{-29}\,\text{C}\cdot\text{m}$ é colocado em um campo elétrico externo uniforme $E_{ext} = 10^6\,\text{V/m}$. Determine: (a) o torque sobre o dipolo quando ele faz um ângulo $\theta = 60°$ com o campo; (b) o trabalho necessário para girar o dipolo da posição $\theta = 60°$ para $\theta = 0°$ (paralelo ao campo);

**Passo 1: Calcular o torque $\tau$ para $\theta = 60°$.**  
O torque sobre um dipolo em um campo externo é dado por:
$$
\vec{\tau} = \vec{p}\times\vec{E}_{ext}
$$

O módulo do torque é:
$$
\tau = pE_{ext}\sin\theta
$$

Substituindo os valores:
$$
\tau = (5\times10^{-29}\,\text{C}\cdot\text{m})(10^6\,\text{V/m})\sin(60°)
$$

Como $\sin(60°) = \sqrt{3}/2 \approx 0{,}866$:
$$
\tau = (5\times10^{-29})(10^6)(0{,}866) = 4{,}33\times10^{-23}\,\text{N}\cdot\text{m}
$$

**Resposta (a)**: $\boxed{\tau \approx 4{,}33\times10^{-23}\,\text{N}\cdot\text{m}}$

**Passo 2: Calcular o trabalho para girar de $\theta = 60°$ para $\theta = 0°$.**  
A energia potencial de um dipolo em um campo externo é:
$$
U(\theta) = -\vec{p}\cdot\vec{E}_{ext} = -pE_{ext}\cos\theta
$$

O trabalho realizado por um agente externo para girar o dipolo quase-estaticamente de $\theta_i$ para $\theta_f$ é:
$$
W_{ext} = U(\theta_f) - U(\theta_i)
$$

Para $\theta_i = 60°$ e $\theta_f = 0°$:
$$
U(60°) = -pE_{ext}\cos(60°) = -(5\times10^{-29})(10^6)(0{,}5) = -2{,}5\times10^{-23}\,\text{J}
$$
$$
U(0°) = -pE_{ext}\cos(0°) = -(5\times10^{-29})(10^6)(1) = -5{,}0\times10^{-23}\,\text{J}
$$

O trabalho externo é:
$$
W_{ext} = U(0°) - U(60°) = (-5{,}0\times10^{-23}) - (-2{,}5\times10^{-23}) = -2{,}5\times10^{-23}\,\text{J}
$$

O sinal negativo indica que o campo elétrico realiza trabalho positivo sobre o dipolo enquanto ele gira espontaneamente para o alinhamento; o agente externo precisa apenas "segurar" o dipolo para que o processo seja quase-estático, realizando trabalho negativo.

**Resposta (b)**: $\boxed{W_{ext} = -2{,}5\times10^{-23}\,\text{J}}$

---

### Dipolo em campo não-uniforme: força líquida

No caso de campo **não-uniforme**, as forças em $+q$ e $-q$ não se cancelam perfeitamente. Para um dipolo pequeno $\vec{p}$ em um campo externo $\vec{E}_{ext}$:

A força sobre $+q$ (na posição $\vec{r}+\vec{d}/2$):
$$
\vec{F}_+ = q\,\vec{E}_{ext}\left(\vec{r}+\frac{\vec{d}}{2}\right)
$$

A força sobre $-q$ (na posição $\vec{r}-\vec{d}/2$):
$$
\vec{F}_- = -q\,\vec{E}_{ext}\left(\vec{r}-\frac{\vec{d}}{2}\right)
$$

Força líquida (expandindo em série de Taylor, mantendo apenas o termo linear):
$$
\vec{F} = \vec{F}_+ + \vec{F}_- \approx q\left[\vec{E}_{ext}(\vec{r}) + \left(\frac{\vec{d}}{2}\cdot\nabla\right)\vec{E}_{ext}\right] - q\left[\vec{E}_{ext}(\vec{r}) - \left(\frac{\vec{d}}{2}\cdot\nabla\right)\vec{E}_{ext}\right] = q(\vec{d}\cdot\nabla)\vec{E}_{ext}
$$

$$
\boxed{\vec{F} = (\vec{p}\cdot\nabla)\vec{E}_{ext}}
$$

Em componente:
$$
F_i = p_j\,\frac{\partial E_j}{\partial x_i}
$$

**Importante**: em campo uniforme, $\nabla\vec{E}=0$ e a força líquida é nula (só há torque, Seção “Torque e energia em um campo externo”). Em campo não-uniforme, há **força resultante**. Isso é a base de técnicas como o *dielectrophoresis* (DEP), usado para manipular partículas neutras em campos elétricos variáveis — moléculas de água, por exemplo, são neutras mas possuem dipolo permanente, e são atraídas para regiões de campo mais intenso.

**Exemplo concreto**: uma carga $+q$ na origem gera campo radial $E = \dfrac{q}{4\pi\varepsilon_0 z^2}\hat{z}$ no eixo $z$. Um dipolo $\vec{p}=p\hat{z}$ na posição $z$ sobre o eixo sente:

$$
F_z = p\,\frac{\partial}{\partial z}\left(\frac{q}{4\pi\varepsilon_0 z^2}\right) = -\frac{2pq}{4\pi\varepsilon_0 z^3}
$$

A força é **atrativa** (negativa) para $p,q$ do mesmo sinal — o dipolo é puxado em direção à carga, pois o campo é mais forte do lado da carga oposta ao dipolo.

### Energia de interação entre dois dipolos

A energia potencial de um dipolo $\vec{p}_1$ no campo de outro dipolo $\vec{p}_2$ (na posição $\vec{r}$, com $r\gg d_1,d_2$):

$$
U = -\vec{p}_1\cdot\vec{E}_2(\vec{r}) = -\frac{1}{4\pi\varepsilon_0}\frac{\vec{p}_1\cdot\left[3(\vec{p}_2\cdot\hat{r})\hat{r}-\vec{p}_2\right]}{r^3}
$$

$$
\boxed{U = \frac{1}{4\pi\varepsilon_0}\frac{\vec{p}_1\cdot\vec{p}_2 - 3(\vec{p}_1\cdot\hat{r})(\vec{p}_2\cdot\hat{r})}{r^3}}
$$

Esta expressão mostra que a interação entre dipolos é **anisotrópica** e **de longo alcance** ($1/r^3$ para o potencial, $1/r^4$ para a força).

**Casos especiais**:

- Dois dipolos **paralelos e alinhados** com a linha que os separa ($\vec{p}_1\parallel\vec{p}_2\parallel\hat{r}$): $U = -\dfrac{2p_1p_2}{4\pi\varepsilon_0 r^3}$ — **atrativa** (configuração "cabeça-cauda": o polo positivo de um fica próximo do polo negativo do outro).
- Dois dipolos **paralelos e perpendiculares** a $\hat{r}$: $U = \dfrac{p_1p_2}{4\pi\varepsilon_0 r^3}$ — **repulsiva** (configuração "lado a lado": polos de mesmo sinal ficam mais próximos entre si).
- Dois dipolos **perpendiculares entre si e a $\hat{r}$**: $U=0$ — nenhuma interação de primeira ordem.

Este resultado é fundamental para entender forças intermoleculares (forças de van der Waals), onde dipolos induzidos e permanentes interagem.

```python
import numpy as np
import matplotlib.pyplot as plt

x = y = np.linspace(-3, 3, 180); X, Y = np.meshgrid(x, y)
def campo(q, x0):
    dx, r2 = X-x0, (X-x0)**2 + Y**2 + .02
    return q*dx/r2**1.5, q*Y/r2**1.5
Ep = campo(1, -1); En = campo(-1, 1)
Ex, Ey = Ep[0]+En[0], Ep[1]+En[1]
fig, ax = plt.subplots(figsize=(7, 5))
ax.streamplot(x, y, Ex, Ey, density=1.45, color=np.log1p(np.hypot(Ex,Ey)), cmap="viridis")
ax.scatter([-1,1],[0,0],s=140,c=["#dc2626","#2563eb"],zorder=3)
ax.text(-1.12,.15,"+Q"); ax.text(.9,.15,"−Q"); ax.set_aspect("equal")
ax.set(title="Linhas de campo de um dipolo elétrico", xlabel="$x$", ylabel="$y$")
plt.tight_layout()
```

## Exercícios Resolvidos em Python

### Roteiro computacional

**Objetivo.** Comparar potenciais exatos e expansões multipolares, verificar $\vec E=-\nabla V$ e calcular energias de interação.

**Hipóteses.** Cargas puntiformes clássicas, referência $V(\infty)=0$ e aproximação multipolar usada somente quando $r$ é muito maior que a extensão da distribuição.

**Como executar.** Requer `numpy` e `matplotlib`. Para cada aproximação, registre $r/d$ e o erro relativo; isso explicita o domínio de validade.

**Resultados esperados.** No eixo do dipolo, $V_{dip}=kp/r^2$; no plano equatorial, $V=0$. O erro da aproximação deve diminuir quando $r/d$ aumenta.

```python
import numpy as np
import matplotlib.pyplot as plt

eps0 = 8.854e-12
k = 1/(4*np.pi*eps0)

# === Seção “Expansão multipolar”: Expansão multipolar ===
def potencial_monopolo(r, Q):
    """Potencial do termo monopolo (carga total)."""
    return k * Q / r

def potencial_dipolo(r, theta, p):
    """Potencial do termo dipolo."""
    return k * p * np.cos(theta) / r**2

def potencial_quadrupolo(z, Qzz):
    """Potencial do termo quadrupolo (componente Qzz, no eixo z)."""
    return k * Qzz / (2 * z**3)

# Distribuição de 4 cargas: +q,-q,+q,-q em um quadrado 2x2 (quadrupolo puro)
def potencial_quadrupolo_exato(x, y, q, a):
    """Potencial exato de 4 cargas nos vértices de um quadrado."""
    V = 0
    pos_charges = [(a,a,q), (-a,a,-q), (a,-a,-q), (-a,-a,q)]
    for sx, sy, qc in pos_charges:
        r = np.sqrt((x-sx)**2 + (y-sy)**2)
        V += k*qc/r
    return V

# Verificação: dipolo de cargas +q/-q ao longo de z, observado no próprio eixo
def potencial_dipolo_exato_eixo(z, q, d):
    """Potencial exato de um dipolo centrado na origem e orientado em z."""
    V_plus = k*q/np.sqrt((z-d/2)**2)
    V_minus = -k*q/np.sqrt((z+d/2)**2)
    return V_plus + V_minus

q, d = 1e-9, 0.01  # dipolo com momento p=q*d
z = 1.0  # z >> d
p = q*d
V_exato = potencial_dipolo_exato_eixo(z, q, d)
V_aprox_dipolo = potencial_dipolo(z, 0, p)  # theta=0 no eixo: cos(theta)=1
print(f"Potencial exato (2 cargas no eixo z): {V_exato:.6e} V")
print(f"Potencial dipolo (no eixo): {V_aprox_dipolo:.6e} V")
print(f"Erro relativo da aproximação: {abs(V_aprox_dipolo/V_exato-1):.3e}")

# === Seção “Energia Armazenada no Campo Elétrico”: Energia armazenada ===
def energia_cargas_pontuais(charges, positions):
    """Energia potencial de um sistema de cargas puntiformes."""
    U = 0.0
    n = len(charges)
    for i in range(n):
        for j in range(i+1, n):
            r_ij = np.sqrt(sum((positions[i][k]-positions[j][k])**2 for k in range(2)))
            U += k * charges[i] * charges[j] / r_ij
    return U

# 3 cargas: +q, +q, -q em triângulo equilátero de lado a
a = 1e-2
charges = [1e-9, 1e-9, -1e-9]
positions = [(0,0), (a,0), (a/2, a*np.sqrt(3)/2)]
U = energia_cargas_pontuais(charges, positions)
print(f"\nEnergia do sistema de 3 cargas: {U:.6e} J")

# === Seção “Dipolo Elétrico”: Dipolo ===
def campo_dipolo(r, theta, p):
    Er = 2*k*p*np.cos(theta)/r**3
    Etheta = k*p*np.sin(theta)/r**3
    return Er, Etheta

def potencial_exato_2cargas(x, y, q, d):
    r_mais = np.sqrt(x**2 + (y - d/2)**2)
    r_menos = np.sqrt(x**2 + (y + d/2)**2)
    return k*q*(1/r_mais - 1/r_menos)

# Comparação numérica: aproximação de dipolo vs. cálculo exato
q, d = 1e-9, 1e-3
p = q*d
theta = np.deg2rad(30)
r = 2.0

V_aprox = potencial_dipolo(r, theta, p)
x, y = r*np.sin(theta), r*np.cos(theta)
V_exato = potencial_exato_2cargas(x, y, q, d)

print(f"\nV aproximado (dipolo ideal): {V_aprox:.6e} V")
print(f"V exato (duas cargas):       {V_exato:.6e} V")
print(f"Erro relativo: {abs(V_aprox-V_exato)/abs(V_exato):.4%}")

# Verificação numérica de E = -grad(V) por diferenças finitas
def V_dipolo_cartesiano(x, y, p):
    r = np.sqrt(x**2+y**2)
    theta = np.arctan2(x, y)
    return k*p*np.cos(theta)/r**2

h = 1e-6
x0, y0 = 0.5, 0.8
dVdx = (V_dipolo_cartesiano(x0+h,y0,p) - V_dipolo_cartesiano(x0-h,y0,p))/(2*h)
dVdy = (V_dipolo_cartesiano(x0,y0+h,p) - V_dipolo_cartesiano(x0,y0-h,p))/(2*h)
print(f"E_x numérico = {-dVdx:.4e}, E_y numérico = {-dVdy:.4e}")

# === Seção “Dipolo em campo não-uniforme: força líquida”: Dipolo em campo não-uniforme ===
def força_dipolo_nao_uniforme(p, q, z):
    """Força sobre um dipolo p em campo de carga q no eixo z."""
    F = -2*p*q/(4*np.pi*eps0*z**3)
    return F

p, q, z = 1e-12, 1e-9, 0.01
F = força_dipolo_nao_uniforme(p, q, z)
print(f"\nForça sobre dipolo em campo não-uniforme: {F:.6e} N")

# === Seção “Energia de interação entre dois dipolos”: Energia entre dois dipolos ===
def energia_dois_dipolos(p1, p2, r, theta1, theta2, phi_diff):
    """
    Energia entre dois dipolos.
    theta1, theta2: ângulos com a linha que os separa
    phi_diff: diferença de ângulo azimutal
    """
    cos_theta1 = np.cos(theta1)
    cos_theta2 = np.cos(theta2)
    cos_phi = np.cos(phi_diff)
    # Forma simplificada para dipolos no plano xz
    p1_vec = p1 * np.array([np.sin(theta1), 0, np.cos(theta1)])
    p2_vec = p2 * np.array([np.sin(theta2)*np.cos(phi_diff),
                            np.sin(theta2)*np.sin(phi_diff),
                            np.cos(theta2)])
    r_hat = np.array([0, 0, 1])
    U = k * (np.dot(p1_vec, p2_vec) - 3*np.dot(p1_vec, r_hat)*np.dot(p2_vec, r_hat)) / r**3
    return U

# Paralelos e alinhados com a separação (atrativos)
U_atr = energia_dois_dipolos(1e-12, 1e-12, 0.01, 0, 0, 0)
# Paralelos e perpendiculares à separação (repulsivos)
U_rep = energia_dois_dipolos(1e-12, 1e-12, 0.01, np.pi/2, np.pi/2, 0)
print(f"Energia (paralelos, alinhados): {U_atr:.6e} J")
print(f"Energia (paralelos, perpendiculares): {U_rep:.6e} J")
print(f"Sinal oposto = atração vs repulsão ✓")

# === Visualização: linhas de campo e equipotenciais do dipolo ===
theta_plot = np.linspace(0, 2*np.pi, 100)
r_plot = np.linspace(0.1, 3, 50)
Theta, R = np.meshgrid(theta_plot, r_plot)
X = R * np.sin(Theta)
Y = R * np.cos(Theta)

V_plot = np.zeros_like(X)
for i in range(len(X)):
    for j in range(len(X[i])):
        r = np.sqrt(X[i,j]**2+Y[i,j]**2)
        if r > 0.01:
            theta = np.arctan2(X[i,j], Y[i,j])
            V_plot[i,j] = k*p*np.cos(theta)/r**2

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12,5))
contour = ax1.contour(X, Y, V_plot, levels=20, cmap='RdBu_r')
ax1.set_aspect('equal')
ax1.set_title('Equipotenciais do dipolo')
plt.colorbar(contour, ax=ax1)

# Campo E no plano
x_field = y_field = np.linspace(-3, 3, 180)
X_field, Y_field = np.meshgrid(x_field, y_field)
R_field = np.hypot(X_field, Y_field)
Theta_field = np.arctan2(X_field, Y_field)
er, etheta = campo_dipolo(R_field, Theta_field, p)
Ex = er*np.sin(Theta_field) + etheta*np.cos(Theta_field)
Ey = er*np.cos(Theta_field) - etheta*np.sin(Theta_field)
ax2.streamplot(x_field, y_field, Ex, Ey, color='b', density=1.5)
ax2.set_aspect('equal')
ax2.set_title('Campo elétrico do dipolo')
ax2.set_xlabel('x')
ax2.set_ylabel('y')
plt.tight_layout()
```

**Interpretação**:

- Expansão multipolar: o termo monopolo domina a grande distância se $Q\neq0$; o dipolo domina se $Q=0$; o quadrupolo se $Q=p=0$, etc.
- Energia de cargas: o fator $\tfrac{1}{2}$ evita dupla contagem de pares.
- Dipolo: aproximação de campo distante converge conforme $r\gg d$.
- Dipolo não-uniforme: força $\propto 1/z^3$, atrativa.
- Energia entre dipolos: a configuração alinhada é atrativa e a paralela perpendicular à separação é repulsiva, consistente com a física qualitativa.
- Visualização: linhas de campo emanam do polo positivo e terminam no negativo; equipotenciais são perpendiculares às linhas de campo.

---

## Resumo do Capítulo

### Fórmulas-Chave

| Conceito | Fórmula | Aplicações |
|---|---|---|
| Trabalho e energia potencial | $W_{A\to B} = -\Delta U = U_A - U_B$ | Movimento de cargas em campos |
| Potencial elétrico | $V(\vec{r}) = -\int_{\text{ref}}^{\vec{r}}\vec{E}\cdot d\vec{\ell}$ | Escalar mais fácil de calcular que $\vec E$ |
| Campo-potencial | $\vec{E} = -\nabla V$ | Recupera campo a partir do potencial |
| Equação de Poisson | $\nabla^2 V = -\rho/\varepsilon_0$ | Potencial com distribuição de carga |
| Equação de Laplace | $\nabla^2 V = 0$ | Potencial sem carga livre |
| Energia no campo | $U = \dfrac{\varepsilon_0}{2}\int E^2\,dV$ | Densidade de energia $u_E = \tfrac{1}{2}\varepsilon_0 E^2$ |
| Potencial de dipolo | $V_{\text{dip}} = \dfrac{1}{4\pi\varepsilon_0}\dfrac{\vec{p}\cdot\hat{r}}{r^2}$ | Campo distante de dipolo |
| Campo de dipolo | $\vec{E}_{\text{dip}} = \dfrac{p}{4\pi\varepsilon_0 r^3}(2\cos\theta\,\hat{r}+\sin\theta\,\hat\theta)$ | Dependência $1/r^3$ |
| Torque no dipolo | $\vec{\tau} = \vec{p}\times\vec{E}_{\text{ext}}$ | Alinhamento com campo externo |
| Energia de dipolo | $U = -\vec{p}\cdot\vec{E}_{\text{ext}}$ | Mínima quando paralelo a $\vec E$ |
| Força em campo não-uniforme | $\vec{F} = (\vec{p}\cdot\nabla)\vec{E}_{\text{ext}}$ | Dieletroforese (DEP) |

### Expansão Multipolar

| Termo | Dependência | Quando domina |
|---|---|---|
| Monopolo | $1/r$ | $Q_{\text{total}} \neq 0$ |
| Dipolo | $1/r^2$ | $Q_{\text{total}} = 0$, $\vec{p} \neq 0$ |
| Quadrupolo | $1/r^3$ | $Q_{\text{total}} = 0$, $\vec{p} = 0$, $Q_{ij} \neq 0$ |

### Conceitos-Chave

1. **Potencial escalar**: Mais fácil de calcular que campo vetorial; $\vec E = -\nabla V$.
2. **Equação de Poisson/Laplace**: EDPs fundamentais para problemas de valor de contorno.
3. **Energia no campo**: $u_E = \tfrac{1}{2}\varepsilon_0 E^2$ — energia armazenada no espaço, não apenas nas cargas.
4. **Dipolo**: Sistema de duas cargas opostas; momento $\vec p = q\vec d$.
5. **Interação dipolo-dipolo**: Anisotrópica ($1/r^3$ para potencial, $1/r^4$ para força).

::: verificacao
**Verificação Rápida (Concept Check):**  
1. Potencial nulo em um ponto implica campo elétrico nulo nesse ponto? **Não** — o campo depende da derivada (gradiente), não do valor absoluto.  
2. A energia de um dipolo em campo externo é mínima quando $\vec p$ é **paralelo** ou **antiparalelo** a $\vec E$? **Paralelo** ($U = -\vec p\cdot\vec E$).  
3. O potencial de um dipolo cai como $1/r$ ou $1/r^2$? **$1/r^2$** (mais rápido que carga puntiforme $1/r$).
:::

## Lista de Exercícios Propostos

**E1** (Trabalho e energia potencial). Uma carga puntiforme $q_1 = 2\,\mu\text{C}$ está fixa na origem. Uma carga de teste $q_2=-3\,\mu\text{C}$ é trazida de $r_A=50\,\text{cm}$ até $r_B=20\,\text{cm}$, ao longo de um caminho arbitrário. Calcule o trabalho realizado pela força elétrica e diga se ele é positivo ou negativo, justificando fisicamente.

**E2** (Potencial e gradiente). O potencial elétrico em uma região é dado por $V(x,y,z) = A(2x^2-y^2-z^2)$, com $A$ constante. (a) Determine $\vec{E}(x,y,z)$. (b) Verifique se essa região pode ser eletrostática no vácuo sem cargas livres (equação de Laplace). (c) Calcule $\vec E$ no ponto $(1,1,1)$ m para $A=10\ \text{V/m}^2$.

**E3** (Equação de Poisson). Uma esfera de raio $R$ possui densidade volumétrica de carga não uniforme $\rho(r) = \rho_0\, r/R$ para $r\le R$ (e $\rho=0$ fora). Usando a Lei de Gauss (forma integral, com simetria esférica), determine $E(r)$ para $r<R$ e para $r>R$. Em seguida, verifique que o resultado interno é consistente com a equação de Poisson em coordenadas esféricas, $\dfrac{1}{r^2}\dfrac{d}{dr}\left(r^2\dfrac{dV}{dr}\right) = -\dfrac{\rho}{\varepsilon_0}$.

**E4** (Equação de Laplace). Mostre que $V(x,y) = V_0\left(\dfrac{x^2-y^2}{L^2}\right)$ satisfaz a equação de Laplace em uma região livre de cargas (independente de $z$). Esboce qualitativamente duas equipotenciais ($V>0$ e $V<0$) e determine o campo elétrico associado.

**E5** (Expansão multipolar — dipolo). Duas cargas $+3\,\text{nC}$ e $-3\,\text{nC}$ estão separadas por $d=4\,\text{mm}$. Calcule, usando a aproximação de dipolo: (a) o momento de dipolo $p$; (b) o potencial no ponto a $r=30\,\text{cm}$ do centro, na direção $\theta=60°$ em relação ao eixo do dipolo; (c) o módulo do campo elétrico nesse mesmo ponto.

**E6** (Expansão multipolar — quadrupolo linear). Três cargas estão alinhadas no eixo $z$: $+q$ em $z=+d$, $-2q$ em $z=0$, e $+q$ em $z=-d$ (um "quadrupolo linear", com momento de dipolo total nulo por simetria). (a) Mostre que o momento de dipolo total é zero. (b) Calcule o tensor de quadrupolo $Q_{zz} = \sum_i (3z_i^2-r_i^2)q_i$. (c) Escreva o potencial aproximado no eixo $z$, para $z\gg d$, e compare numericamente com o valor exato para $q=2\,\text{nC}$, $d=2\,\text{cm}$, $z=2\,\text{m}$.

**E7** (Energia armazenada no campo). Um capacitor de placas paralelas tem campo uniforme $E=2\times10^4\,\text{V/m}$ confinado a um volume de $A=50\,\text{cm}^2$ por $s=1\,\text{mm}$ de espessura entre as placas. Calcule a densidade de energia $u_E$ e a energia total armazenada $U$ nesse volume.

**E8** (Energia de um sistema de cargas). Três cargas idênticas $q=1\,\text{nC}$ são colocadas nos vértices de um triângulo equilátero de lado $a=3\,\text{cm}$. (a) Calcule a energia potencial total do sistema por dois métodos: soma direta sobre pares, e a fórmula $U=\frac12\sum_i q_i V_i$. (b) Quanto trabalho externo é necessário para trazer as três cargas do infinito até essa configuração?

**E9** (Desafio — energia de uma casca esférica). Uma casca esférica fina de raio $R$ tem carga total $Q$ distribuída uniformemente em sua superfície. Usando a Lei de Gauss (campo nulo dentro, $E=kQ/r^2$ fora) e a fórmula da densidade de energia do campo $u_E=\frac12\varepsilon_0 E^2$ (Seção “Expansão multipolar”), calcule a energia eletrostática total armazenada, integrando $u_E$ sobre todo o espaço externo à casca. Expresse o resultado em termos de $Q$, $R$ e $\varepsilon_0$, e compare (em forma) com a energia potencial de duas cargas puntiformes separadas por $R$.

**E10** (Torque e energia do dipolo). Um dipolo com $p=5\times10^{-29}\,\text{C}\cdot\text{m}$ está inicialmente alinhado perpendicularmente a um campo externo uniforme $E_{ext}=10^6\,\text{V/m}$. (a) Calcule o torque inicial sobre o dipolo. (b) Calcule o trabalho realizado por um agente externo para girar o dipolo lentamente (quase-estaticamente) da posição perpendicular até a posição de equilíbrio estável. (c) Repita para a posição de equilíbrio instável (antiparalelo).

**E11** (Dipolo em campo não uniforme — fio infinito). Um fio retilíneo infinito, com densidade linear de carga $\lambda>0$, cria um campo $E(s) = \dfrac{\lambda}{2\pi\varepsilon_0 s}$ (radial, perpendicular ao fio, a uma distância $s$). Um pequeno dipolo de momento $p$, orientado radialmente (apontando para fora do fio), está a uma distância $s_0$ do fio. (a) Determine a força líquida sobre o dipolo (módulo, direção e sentido). (b) O dipolo é atraído ou repelido pelo fio? Justifique fisicamente comparando com o Exemplo da Seção “Dipolo em campo não-uniforme: força líquida”.

**E12** (Interação entre dois dipolos). Dois dipolos idênticos, $p_1=p_2=p$, estão separados por uma distância $r$. (a) Escreva a energia de interação para as três configurações notáveis discutidas na Seção “Energia de interação entre dois dipolos” (paralelos alinhados com $\hat r$; paralelos perpendiculares a $\hat r$; perpendiculares entre si e a $\hat r$). (b) Partindo diretamente da definição de energia de duas cargas puntiformes (sem usar a fórmula de dipolo), calcule a energia exata do sistema de 4 cargas para o caso "alinhados com $\hat r$", com $p=qd$, $d\ll r$, expandindo em série até ordem $1/r^3$, e verifique com qual fórmula da Seção “Energia de interação entre dois dipolos” o resultado coincide.

**E13** (Desafio — dipolos da água, ordem de grandeza). A molécula de água tem momento de dipolo permanente $p\approx 6{,}2\times10^{-30}\,\text{C}\cdot\text{m}$. (a) Estime a energia de interação (em elétron-volts) entre duas moléculas de água separadas por $r=0{,}3\,\text{nm}$ (dimensão molecular típica), na configuração mais atrativa possível (dentre as da Seção “Energia de interação entre dois dipolos”, reexaminadas no item (b) do E12). (b) Compare essa energia com a energia térmica $k_BT$ à temperatura ambiente ($T=300\,\text{K}$, $k_B=1{,}38\times10^{-23}\,\text{J/K}$) e comente se a interação dipolo-dipolo sozinha explicaria a coesão da água líquida a essa distância.

**E14** (Campo e potencial exatos vs. aproximação de dipolo). Duas cargas $+q$ e $-q$ ($q=1\,\text{nC}$) estão em $z=+0{,}5\,\text{mm}$ e $z=-0{,}5\,\text{mm}$. Calcule o potencial exato (soma das duas cargas puntiformes) e o potencial aproximado de dipolo no ponto $(x,y,z)=(0,\,0{,}02,\,0)$ m (i.e., no plano equatorial, $\theta=90°$, $r=2\,\text{cm}$). Compare os dois resultados.

## Gabarito

**E1.**

$$
W_{A\to B} = \frac{q_1q_2}{4\pi\varepsilon_0}\left(\frac{1}{r_A}-\frac{1}{r_B}\right)
$$

Com $q_1q_2 = (2\times10^{-6})(-3\times10^{-6}) = -6\times10^{-12}\,\text{C}^2$, $k=8{,}9875\times10^9\,\text{N}\cdot\text{m}^2/\text{C}^2$:

$$
\frac{1}{r_A}-\frac{1}{r_B} = \frac{1}{0{,}5}-\frac{1}{0{,}2} = 2 - 5 = -3\ \text{m}^{-1}
$$

$$
W = (8{,}9875\times10^9)(-6\times10^{-12})(-3) \approx 0{,}162\ \text{J}
$$

$$
\boxed{W_{A\to B}\approx +0{,}162\ \text{J} \;(\text{positivo})}
$$

Fisicamente: as cargas têm sinais opostos, logo se atraem; ao ser trazida de $r_A$ para $r_B<r_A$ (mais perto), a força elétrica (atrativa) realiza trabalho positivo sobre $q_2$ — o sistema perde energia potencial ($U_B<U_A$), consistente com $W=U_A-U_B>0$.

**E2.**

(a) Gradiente de $V=A(2x^2-y^2-z^2)$:

$$
\vec E = -\nabla V = -\left(4Ax\,\hat x - 2Ay\,\hat y - 2Az\,\hat z\right)
$$

$$
\boxed{\vec E = -4Ax\,\hat x + 2Ay\,\hat y + 2Az\,\hat z}
$$

(b) Laplaciano:

$$
\nabla^2 V = \frac{\partial^2 V}{\partial x^2}+\frac{\partial^2 V}{\partial y^2}+\frac{\partial^2 V}{\partial z^2} = 4A - 2A - 2A = 0
$$

Como $\nabla^2V=0$, a equação de Laplace é satisfeita — **sim**, é consistente com uma região sem carga livre ($\rho=0$).

(c) Em $(1,1,1)$ m, $A=10\ \text{V/m}^2$:

$$
\vec E = -40\,\hat x + 20\,\hat y + 20\,\hat z\ \text{V/m}, \qquad |\vec E| = \sqrt{40^2+20^2+20^2} = \sqrt{2400}\approx 49{,}0\ \text{V/m}
$$

**E3.**

Pela Lei de Gauss com simetria esférica, $E(r)\cdot 4\pi r^2 = Q_{enc}(r)/\varepsilon_0$.

Para $r\le R$:

$$
Q_{enc}(r) = \int_0^r \rho_0\frac{r'}{R}\,4\pi r'^2\,dr' = \frac{4\pi\rho_0}{R}\int_0^r r'^3\,dr' = \frac{\pi\rho_0 r^4}{R}
$$

$$
E(r) = \frac{Q_{enc}(r)}{4\pi\varepsilon_0 r^2} = \frac{\pi\rho_0 r^4/R}{4\pi\varepsilon_0 r^2}
$$

$$
\boxed{E(r) = \frac{\rho_0 r^2}{4R\varepsilon_0}\qquad (r\le R)}
$$

Para $r>R$, a carga total encerrada é $Q_{tot}=\pi\rho_0 R^3$ (fazendo $r=R$ acima), logo:

$$
\boxed{E(r) = \frac{\rho_0 R^3}{4\varepsilon_0 r^2}\qquad (r> R)}
$$

**Verificação via Poisson** (região interna, simetria esférica, $\vec E = E(r)\hat r = -dV/dr\,\hat r$):

$$
\frac{1}{r^2}\frac{d}{dr}\left(r^2\frac{dV}{dr}\right) = -\frac{1}{r^2}\frac{d}{dr}\left(r^2 E(r)\right) = -\frac{1}{r^2}\frac{d}{dr}\left(\frac{\rho_0 r^4}{4R\varepsilon_0}\right) = -\frac{1}{r^2}\cdot\frac{4\rho_0 r^3}{4R\varepsilon_0} = -\frac{\rho_0 r}{R\varepsilon_0}
$$

Isso é exatamente $-\rho(r)/\varepsilon_0 = -(\rho_0 r/R)/\varepsilon_0$, confirmando a equação de Poisson. $\checkmark$

**E4.**

$$
\nabla^2 V = \frac{\partial^2}{\partial x^2}\left[\frac{V_0(x^2-y^2)}{L^2}\right] + \frac{\partial^2}{\partial y^2}\left[\frac{V_0(x^2-y^2)}{L^2}\right] = \frac{2V_0}{L^2} - \frac{2V_0}{L^2} = 0
$$

$$
\boxed{\nabla^2 V = 0 \;\checkmark}
$$

As equipotenciais $V=\text{const.}\neq0$ são hipérboles $x^2-y^2=\text{const.}$ no plano $xy$ (para $V>0$, abrindo ao longo de $x$; para $V<0$, abrindo ao longo de $y$); $V=0$ corresponde às retas $y=\pm x$. Esse é o padrão típico de um "canto" ou "quina" equipotencial de $90°$, usado como modelo local de campo perto de eletrodos angulares.

Campo elétrico:

$$
\vec E = -\nabla V = -\frac{2V_0}{L^2}\left(x\,\hat x - y\,\hat y\right) = \frac{2V_0}{L^2}\left(-x\,\hat x+y\,\hat y\right)
$$

**E5.**

(a) Momento de dipolo:

$$
p = qd = (3\times10^{-9})(4\times10^{-3}) = 1{,}2\times10^{-11}\ \text{C}\cdot\text{m}
$$

(b) Potencial (Seção “Dedução do potencial em campo distante”, $\theta=60°\Rightarrow\cos\theta=0{,}5$, $r=0{,}3$ m):

$$
V = \frac{1}{4\pi\varepsilon_0}\frac{p\cos\theta}{r^2} = (8{,}9875\times10^9)\frac{(1{,}2\times10^{-11})(0{,}5)}{(0{,}3)^2}
$$

$$
\boxed{V \approx 0{,}599\ \text{V}}
$$

(c) Módulo do campo (Seção “Campo elétrico do dipolo”, $E=\dfrac{p}{4\pi\varepsilon_0 r^3}\sqrt{1+3\cos^2\theta}$):

$$
\sqrt{1+3(0{,}5)^2} = \sqrt{1{,}75}\approx 1{,}323
$$

$$
E = (8{,}9875\times10^9)\frac{1{,}2\times10^{-11}}{(0{,}3)^3}(1{,}323)
$$

$$
\boxed{E \approx 5{,}28\ \text{V/m}}
$$

**E6.**

(a) Momento de dipolo total: $p = \sum_i q_i z_i = (q)(d) + (-2q)(0) + (q)(-d) = 0$. $\checkmark$ (o sistema tem simetria que garante $p=0$: a carga positiva "extra" de um lado é compensada pela do outro lado, restando apenas o efeito de segunda ordem no quadrupolo.)

(b) Tensor de quadrupolo (elemento $zz$), com $x_i=y_i=0$ logo $r_i'^2=z_i^2$ para cada carga pontual, $3z_i^2-r_i'^2 = 2z_i^2$:

$$
Q_{zz} = \sum_i q_i\left(3z_i^2-r_i'^2\right) = q(2d^2) + (-2q)(0) + q(2d^2)
$$

$$
\boxed{Q_{zz} = 4qd^2}
$$

(c) Potencial no eixo ($x=y=0$, usando a fórmula da Seção “Equação de Poisson e de Laplace”.3 particularizada ao eixo, $V_{quad}=\dfrac{1}{4\pi\varepsilon_0}\dfrac{Q_{zz}}{2z^3}$):

$$
V_{quad}(z) \approx \frac{1}{4\pi\varepsilon_0}\frac{4qd^2}{2z^3} = \frac{1}{4\pi\varepsilon_0}\frac{2qd^2}{z^3}
$$

Numericamente, $q=2\times10^{-9}$ C, $d=0{,}02$ m, $z=2$ m:

$$
Q_{zz} = 4(2\times10^{-9})(0{,}02)^2 = 3{,}2\times10^{-12}\ \text{C}\cdot\text{m}^2
$$

$$
V_{quad} = (8{,}9875\times10^9)\frac{3{,}2\times10^{-12}}{2(2)^3} \approx 1{,}798\times10^{-3}\ \text{V}
$$

Valor exato (soma das três cargas puntiformes, $z\gg d$):

$$
V_{exato} = k\left[\frac{q}{z-d}-\frac{2q}{z}+\frac{q}{z+d}\right] \approx 1{,}798\times10^{-3}\ \text{V}
$$

$$
\boxed{V_{quad}\approx V_{exato}\approx 1{,}80\times10^{-3}\ \text{V}\quad(\text{erro relativo}\sim 0{,}01\%)}
$$

confirmando que o termo quadrupolo domina (já que monopolo e dipolo totais são nulos).

**E7.**

$$
u_E = \frac{1}{2}\varepsilon_0 E^2 = \frac{1}{2}(8{,}854\times10^{-12})(2\times10^4)^2
$$

$$
\boxed{u_E \approx 1{,}771\times10^{-3}\ \text{J/m}^3}
$$

Volume: $\mathcal V = A\cdot s = (50\times10^{-4}\ \text{m}^2)(1\times10^{-3}\ \text{m}) = 5\times10^{-6}\ \text{m}^3$

$$
U = u_E\cdot\mathcal V \approx (1{,}771\times10^{-3})(5\times10^{-6})
$$

$$
\boxed{U\approx 8{,}85\times10^{-9}\ \text{J}}
$$

**E8.**

(a) **Soma direta sobre pares**: há 3 pares, todos à mesma distância $a$, todas as cargas iguais a $q$:

$$
U = \frac{kq^2}{a}\times 3 = \frac{3kq^2}{a}
$$

Numericamente: $kq^2/a = (8{,}9875\times10^9)(10^{-9})^2/(0{,}03) \approx 2{,}996\times10^{-7}$ J, logo

$$
\boxed{U = 3\times(2{,}996\times10^{-7})\approx 8{,}99\times10^{-7}\ \text{J}}
$$

**Verificação via $U=\frac12\sum_i q_iV_i$**: cada carga sente o potencial das outras duas, ambas à distância $a$: $V_i = 2kq/a$ para cada $i$. Logo:

$$
U = \frac{1}{2}\sum_{i=1}^3 q\left(\frac{2kq}{a}\right) = \frac12(3)\left(\frac{2kq^2}{a}\right) = \frac{3kq^2}{a}
$$

Mesmo resultado. $\checkmark$ (o fator $\frac12$ compensa exatamente a dupla contagem: cada par $i,j$ contribui a $V_i$ e a $V_j$.)

(b) O trabalho externo necessário para montar a configuração a partir do infinito é, por definição, igual à energia potencial final (partindo de $U=0$ no infinito):

$$
\boxed{W_{ext} = U \approx 8{,}99\times10^{-7}\ \text{J}}
$$

**E9.**

Fora da casca ($r>R$), por Gauss, $E(r) = \dfrac{Q}{4\pi\varepsilon_0 r^2}$; dentro ($r<R$), $E=0$ (Lei de Gauss com carga interna nula). A energia total é a integral de $u_E$ sobre todo o espaço; como $E=0$ dentro, só a região externa contribui:

$$
U = \int_R^\infty u_E\,4\pi r^2\,dr = \int_R^\infty \frac{1}{2}\varepsilon_0\left(\frac{Q}{4\pi\varepsilon_0 r^2}\right)^2 4\pi r^2\,dr = \frac{Q^2}{8\pi\varepsilon_0}\int_R^\infty \frac{dr}{r^2}
$$

$$
\int_R^\infty \frac{dr}{r^2} = \left[-\frac{1}{r}\right]_R^\infty = \frac{1}{R}
$$

$$
\boxed{U = \frac{Q^2}{8\pi\varepsilon_0 R} = \frac{1}{2}\frac{kQ^2}{R}}
$$

Esse resultado tem a mesma forma que a energia potencial de duas cargas puntiformes $U=kq_1q_2/r$, mas com um fator extra $\frac12$ e $Q^2$ no lugar de $q_1q_2$ — reflexo de que, ao trazer a carga da casca "de si mesma" desde o infinito, cada elemento de carga interage com todos os outros já depositados, e não há duas cargas distintas separadas por $R$ como no caso de duas cargas puntiformes.

**E10.**

(a) Torque inicial ($\theta=90°$, perpendicular, $\sin\theta=1$):

$$
\tau = pE_{ext}\sin\theta = (5\times10^{-29})(10^6)(1)
$$

$$
\boxed{\tau = 5\times10^{-23}\ \text{N}\cdot\text{m}}
$$

(b) $U(\theta) = -pE_{ext}\cos\theta$. De $\theta=90°$ ($U_i=0$) até $\theta=0°$ (equilíbrio estável, $U_f=-pE_{ext}$):

O trabalho do agente externo (quase-estático, sem energia cinética) é $W_{ext} = U_f - U_i$:

$$
W_{ext} = -pE_{ext} - 0 = -pE_{ext} = -(5\times10^{-29})(10^6)
$$

$$
\boxed{W_{ext} = -5\times10^{-23}\ \text{J}}
$$

(negativo: o campo realiza trabalho positivo sobre o dipolo enquanto ele gira espontaneamente para o alinhamento; para que o processo seja quase-estático, o agente externo precisa "segurar" o dipolo, realizando trabalho negativo sobre ele.)

(c) De $\theta=90°$ ($U_i=0$) até $\theta=180°$ (antiparalelo, equilíbrio instável, $U_f=+pE_{ext}$):

$$
W_{ext} = U_f - U_i = +pE_{ext} - 0
$$

$$
\boxed{W_{ext} = +5\times10^{-23}\ \text{J}}
$$

(positivo: o agente externo deve fornecer energia para forçar o dipolo contra a tendência natural de alinhamento.)

**E11.**

(a) A força sobre um dipolo é $\vec F = (\vec p\cdot\nabla)\vec E_{ext}$ (Seção “Dipolo em campo não-uniforme: força líquida”). Com $\vec p = p\,\hat s$ (radial, para fora do fio) e $\vec E_{ext}(s) = \dfrac{\lambda}{2\pi\varepsilon_0 s}\,\hat s$, e como o campo só depende de $s$:

$$
F_s = p\,\frac{dE_{ext}}{ds} = p\,\frac{d}{ds}\left(\frac{\lambda}{2\pi\varepsilon_0 s}\right) = p\left(-\frac{\lambda}{2\pi\varepsilon_0 s^2}\right)
$$

$$
\boxed{\vec F = -\frac{\lambda p}{2\pi\varepsilon_0 s_0^2}\,\hat s}
$$

(b) O sinal negativo (para $\lambda, p>0$) indica força na direção $-\hat s$, ou seja, **em direção ao fio** — o dipolo é **atraído**. Fisicamente: a carga $-q$ do dipolo (mais próxima do fio, já que $\vec p$ aponta para fora, da carga negativa à positiva) sente um campo mais intenso (o campo do fio cai como $1/s$) do que a carga $+q$ (mais distante); a atração eletrostática da carga próxima domina sobre a repulsão da carga distante, resultando em força atrativa líquida — o mesmo mecanismo qualitativo do Exemplo da Seção “Dipolo em campo não-uniforme: força líquida” (dipolo atraído por uma carga puntiforme), mas com campo caindo como $1/s$ em vez de $1/z^2$.

**E12.**

(a) Da Seção “Energia de interação entre dois dipolos”, com $U_0\equiv \dfrac{p_1p_2}{4\pi\varepsilon_0 r^3}=\dfrac{kp^2}{r^3}$:

- Paralelos, alinhados com $\hat r$: $U = -2U_0 = -\dfrac{2kp^2}{r^3}$
- Paralelos, perpendiculares a $\hat r$: $U=+U_0 = +\dfrac{kp^2}{r^3}$
- Perpendiculares entre si e a $\hat r$: $U=0$

(b) Configuração "alinhados com $\hat r$": dipolo 1 em $z=0$ com cargas $+q$ em $z=d/2$ e $-q$ em $z=-d/2$; dipolo 2 em $z=r$ com $+q$ em $z=r+d/2$ e $-q$ em $z=r-d/2$ (ambos momentos apontando em $+\hat z=\hat r$). A energia exata (soma dos 4 pares de cargas):

$$
U = kq^2\left[\underbrace{\frac{1}{r}}_{(+q_1,-q_2)} - \underbrace{\frac{1}{r-d}}_{(+q_1,+q_2)} - \underbrace{\frac{1}{r+d}}_{(-q_1,-q_2)} + \underbrace{\frac{1}{r}}_{(-q_1,+q_2)}\right] = kq^2\left[\frac{2}{r} - \frac{1}{r-d}-\frac{1}{r+d}\right]
$$

Expandindo $\dfrac{1}{r\mp d} \approx \dfrac{1}{r}\left(1\pm\dfrac{d}{r}+\dfrac{d^2}{r^2}\right)$ até ordem $d^2/r^2$:

$$
\frac{1}{r-d}+\frac{1}{r+d} \approx \frac{2}{r}+\frac{2d^2}{r^3}
$$

$$
U \approx kq^2\left[\frac{2}{r} - \frac{2}{r}-\frac{2d^2}{r^3}\right] = -\frac{2kq^2d^2}{r^3} = -\frac{2kp^2}{r^3}
$$

Ou seja, o cálculo direto com as 4 cargas dá $U=-2kp^2/r^3$ para a configuração "alinhados com $\hat r$" — **atrativa**, consistente com a Seção “Energia de interação entre dois dipolos”.

Confirmação pela fórmula em caixa da Seção “Energia de interação entre dois dipolos”, $U = k[\vec p_1\cdot\vec p_2 - 3(\vec p_1\cdot\hat r)(\vec p_2\cdot\hat r)]/r^3$: com $\vec p_1=\vec p_2=p\hat r$, $\vec p_1\cdot\vec p_2=p^2$ e $(\vec p_1\cdot\hat r)(\vec p_2\cdot\hat r)=p^2$, logo $U=k[p^2-3p^2]/r^3=-2kp^2/r^3$ — idêntico ao cálculo exato de 4 cargas.

**E13.**

(a) Configuração mais atrativa (mínimo de energia): pela análise do E12(b), a configuração "alinhados com $\hat r$" tem $U=-2kp^2/r^3$ (atrativa), enquanto a "perpendicular a $\hat r$" tem $U=+kp^2/r^3$ (repulsiva); portanto a configuração mais atrativa dentre as três é a alinhada, $U=-2kp^2/r^3$.

$$
U = -\frac{2kp^2}{r^3} = -2(8{,}9875\times10^9)\frac{(6{,}2\times10^{-30})^2}{(0{,}3\times10^{-9})^3}
$$

Numerador: $2(8{,}9875\times10^9)(3{,}844\times10^{-59}) \approx 6{,}91\times10^{-49}$

Denominador: $(0{,}3\times10^{-9})^3 = 2{,}7\times10^{-29}$

$$
U \approx -\frac{6{,}91\times10^{-49}}{2{,}7\times10^{-29}} \approx -2{,}56\times10^{-20}\ \text{J}
$$

Convertendo para eV ($1\,\text{eV}=1{,}602\times10^{-19}$ J):

$$
\boxed{U \approx -0{,}160\ \text{eV}}
$$

(b) Energia térmica à temperatura ambiente:

$$
k_BT = (1{,}38\times10^{-23})(300) = 4{,}14\times10^{-21}\ \text{J} \approx 0{,}0259\ \text{eV}
$$

Comparando: $|U|/k_BT \approx 0{,}160/0{,}0259 \approx 6{,}2$.

$$
\boxed{|U| \approx 6\,k_BT}
$$

A energia de interação dipolo-dipolo é da mesma ordem de grandeza (poucas vezes maior) que a energia térmica — ela contribui de forma relevante para a coesão da água líquida, mas não é isoladamente dominante: sendo apenas alguns múltiplos de $k_BT$, a agitação térmica é capaz de romper e reformar continuamente essas ligações, consistente com o caráter dinâmico das pontes de hidrogênio na água líquida (que, na realidade, envolvem também contribuições quânticas e de repulsão de troca não capturadas neste modelo clássico simplificado de dipolo puntiforme).

**E14.**

**Potencial exato**: com $+q$ em $(0,0,0{,}0005)$ e $-q$ em $(0,0,-0{,}0005)$, ponto de observação $(0;\,0{,}02;\,0)$:

$$
r_+ = \sqrt{0^2+0{,}02^2+0{,}0005^2}, \qquad r_- = \sqrt{0^2+0{,}02^2+(-0{,}0005)^2}
$$

Como o ponto está no plano equatorial (mesma distância à carga positiva e à negativa, $\theta=90°$ em relação ao eixo do dipolo), $r_+=r_-$ **exatamente**, logo:

$$
V_{exato} = kq\left(\frac{1}{r_+}-\frac{1}{r_-}\right) = 0
$$

$$
\boxed{V_{exato}= 0\ \text{V (exatamente, por simetria)}}
$$

**Potencial aproximado de dipolo** ($\theta=90°\Rightarrow\cos\theta=0$):

$$
V_{dip} = \frac{1}{4\pi\varepsilon_0}\frac{p\cos(90°)}{r^2} = 0
$$

$$
\boxed{V_{dip} = 0\ \text{V}}
$$

Ambas as previsões coincidem exatamente (nulas) no plano equatorial: no plano perpendicular ao eixo do dipolo passando pelo seu centro, o potencial de um dipolo (exato ou aproximado) é sempre zero, pois os potenciais de $+q$ e $-q$ se cancelam exatamente (mesma distância às duas cargas, independentemente de $d$). Este resultado serve como verificação de consistência: o plano equatorial de um dipolo é sempre uma superfície equipotencial com $V=0$.
