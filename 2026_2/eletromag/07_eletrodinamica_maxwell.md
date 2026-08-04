# Eletrodinâmica e Equações de Maxwell

> Eletromagnetismo — Apostila de Curso
> Tópicos: Lei de Faraday (Integral e Pontual) · Força Eletromotriz do Movimento · Autoindutância e Indutância Mútua · Energia Armazenada no Campo Magnético · Correntes de Deslocamento de Maxwell · Lei de Ampère Corrigida · Equações de Maxwell

---

## Objetivos de Aprendizagem

Ao final deste capítulo, você será capaz de:

- [ ] Aplicar a **Lei de Faraday** para calcular força eletromotriz induzida.
- [ ] Diferenciar fem de transformação e fem de movimento.
- [ ] Calcular autoindutância e indutância mútua de sistemas.
- [ ] Entender o conceito de **corrente de deslocamento** de Maxwell.
- [ ] Aplicar as **quatro equações de Maxwell** em forma integral e diferencial.
- [ ] Interpretar o **teorema de Poynting** e o fluxo de energia eletromagnética.

---

## Intuição Física: Eletrodinâmica e Indução

Antes de definir matematicamente as equações de Maxwell variantes no tempo, pense em termos físicos:

- **Indução eletromagnética**: Um campo magnético variável no tempo cria um campo elétrico (Lei de Faraday).
- A **força eletromotriz (fem)** é o trabalho por unidade de carga realizado por um campo não-conservativo.
- Uma **corrente de deslocamento** não é um fluxo real de carga, mas uma variação temporal do campo elétrico que atua como fonte de campo magnético.
- As **equações de Maxwell** unificam eletricidade, magnetismo e óptica em um único framework.

## Aplicações no Mundo Real

| Conceito | Aplicação Prática |
|---|---|
| Lei de Faraday | Geradores elétricos, transformadores, frenagem regenerativa |
| Força eletromotriz de movimento | Dinamos, turbinas eólicas, hidrelétricas |
| Autoindutância e indutância mútua | Indutores, transformadores, circuitos de filtragem |
| Corrente de deslocamento | Capacitores em circuitos AC, propagação de ondas eletromagnéticas |
| Teorema de Poynting | Transmissão de energia por ondas, antenas, fibras ópticas |
| Equações de Maxwell | Projeto de circuitos de alta frequência, telecomunicações, radar |

---

## Antes de começar

Ao final, você deve aplicar Faraday e Ampère–Maxwell, interpretar fem de movimento, indutância, corrente de deslocamento, Poynting e as quatro equações de Maxwell como um sistema. **Diagnóstico:** uma corrente de deslocamento transporta carga através do dielétrico? **Evidência mínima:** verificar uma fem induzida, calcular energia/indutância e reconciliar as formas integral e diferencial de Maxwell.

## Sumário

1. [Lei de Faraday — Forma Integral](#lei-de-faraday--forma-integral)
2. [Lei de Faraday — Forma Pontual](#lei-de-faraday--forma-pontual)
3. [Força Eletromotriz do Movimento](#força-eletromotriz-do-movimento)
4. [Autoindutância e Indutância Mútua](#autoindutância-e-indutância-mútua)
5. [Energia Armazenada no Campo Magnético](#energia-armazenada-no-campo-magnético)
6. [Correntes de Deslocamento e Lei de Ampère Corrigida](#correntes-de-deslocamento-e-lei-de-ampère-corrigida)
7. [Equações de Maxwell — Síntese](#equações-de-maxwell--síntese)
8. [Teorema de Poynting](#teorema-de-poynting)
9. [Potenciais Retardados](#potenciais-retardados)
10. [Condições de Contorno para Campos Variantes no Tempo](#condições-de-contorno-para-campos-variantes-no-tempo)
11. [Exercícios resolvidos em Python](#exercícios-resolvidos-em-python)
12. [Resumo Visual das Quatro Equações de Maxwell](#resumo-visual-das-quatro-equações-de-maxwell)
13. [Lista de Exercícios Propostos](#lista-de-exercícios-propostos)
14. [Gabarito](#gabarito)

## Lei de Faraday — Forma Integral

<!-- slides: break -->

### Observação experimental de Faraday

Michael Faraday (1831) observou que uma **variação temporal do fluxo magnético** através de um circuito induz uma força eletromotriz (fem) nesse circuito — independentemente de a variação vir de um ímã se movendo, de uma corrente variável em um circuito próximo, ou da deformação/movimento do próprio circuito. Definindo o fluxo magnético através de uma superfície $S$ delimitada pelo circuito:

$$
\Phi_B \equiv \int_S \vec{B}\cdot d\vec{A}
$$

a lei do fluxo para um contorno material $C(t)$ que se move com velocidade local $\vec u$ estabelece:

$$
\boxed{\mathcal E=\oint_{C(t)}(\vec E+\vec u\times\vec B)\cdot d\vec\ell
=-\frac{d}{dt}\int_{S(t)}\vec B\cdot d\vec A}
$$

O integrando é a força de Lorentz por unidade de carga. Para um circuito fixo, $\vec u=0$ e recupera-se $\mathcal E=\oint_C\vec E\cdot d\vec\ell=-\int_S(\partial\vec B/\partial t)\cdot d\vec A$. Assim, a fem de movimento não deve ser atribuída ao campo elétrico sozinho.

### Lei de Lenz e o sinal negativo

O sinal negativo expressa a **Lei de Lenz**: a corrente induzida flui em um sentido tal que o campo magnético que ela própria gera **se opõe** à variação de fluxo que a originou. Isso é uma manifestação da conservação de energia: se o sinal fosse positivo, a corrente induzida reforçaria a variação de fluxo, criando um processo de retroalimentação positiva que geraria energia do nada — violação da primeira lei da termodinâmica.

**Verificação qualitativa**: aproximando um ímã com o polo norte de uma espira, o fluxo (para dentro da espira, digamos) aumenta; pela Lei de Lenz, a corrente induzida deve criar um campo que se oponha a esse aumento, ou seja, um campo saindo da face voltada para o ímã — o que, por sua vez, faz a espira **repelir** o ímã que se aproxima, exigindo trabalho externo para completar a aproximação. Esse trabalho é o que se converte em energia elétrica — não há energia "de graça".

### Três mecanismos distintos, uma só lei

A variação de $\Phi_B=\int_S\vec B\cdot d\vec A$ no tempo pode ocorrer por:

1. **$\vec B$ variando no tempo** com o circuito parado (transformadores) — tratado via $\partial\vec B/\partial t$ (Seção “Lei de Faraday — Forma Pontual”);
2. **O circuito se movendo ou deformando** em um campo $\vec B$ estático (geradores, barras deslizantes) — tratado via força eletromotriz de movimento (Seção “Força Eletromotriz do Movimento”);
3. Uma **combinação** dos dois efeitos.

Notavelmente, a forma geral com $\vec E+\vec u\times\vec B$ unifica esses mecanismos — um dos primeiros indícios históricos de que eletricidade e magnetismo são aspectos de um mesmo fenômeno.

## Lei de Faraday — Forma Pontual

### Dedução (para circuito estacionário)

Para um circuito **fixo** no espaço (superfície $S$ e contorno $C$ não variam no tempo), pode-se trazer a derivada temporal para dentro da integral:

$$
\oint_C\vec{E}\cdot d\vec{\ell} = -\frac{d}{dt}\int_S\vec{B}\cdot d\vec{A} = -\int_S\frac{\partial\vec{B}}{\partial t}\cdot d\vec{A}
$$

Aplicando o Teorema de Stokes ao lado esquerdo (arquivo 4):

$$
\int_S(\nabla\times\vec{E})\cdot d\vec{A} = -\int_S\frac{\partial\vec{B}}{\partial t}\cdot d\vec{A}
$$

Como isso vale para qualquer superfície $S$ arbitrária:

$$
\boxed{\nabla\times\vec{E} = -\frac{\partial\vec{B}}{\partial t}}\qquad\text{(Lei de Faraday — forma pontual)}
$$

Esta é a **terceira equação de Maxwell**.

### Ruptura com a eletrostática

Note a diferença fundamental em relação à eletrostática (arquivo 2), onde $\nabla\times\vec E=0$ sempre. Em eletrodinâmica geral, **campos magnéticos variáveis geram campos elétricos rotacionais** ($\nabla\times\vec E\neq0$) — esses campos elétricos induzidos **não** são conservativos, não podem ser escritos simplesmente como $-\nabla V$ (ou melhor, precisam de um termo adicional, o potencial vetor $\vec A$, veja a seguir), e são a base física de geradores elétricos, transformadores e — como veremos na Parte 2 da apostila — da própria propagação de ondas eletromagnéticas.

### Potencial escalar generalizado

Em eletrodinâmica, como localmente $\vec B=\nabla\times\vec A$ — e globalmente sob as condições topológicas e de contorno usuais —, substituindo em $\nabla\times\vec E=-\partial\vec B/\partial t$:

$$
\nabla\times\vec{E} = -\frac{\partial}{\partial t}(\nabla\times\vec{A}) = -\nabla\times\frac{\partial\vec{A}}{\partial t}
$$

$$
\nabla\times\left(\vec{E}+\frac{\partial\vec{A}}{\partial t}\right) = 0
$$

Como a quantidade entre parênteses tem rotacional nulo, ela pode ser escrita como o gradiente de um potencial escalar:

$$
\boxed{\vec{E} = -\nabla V - \frac{\partial\vec{A}}{\partial t}}
$$

generalização da relação eletrostática $\vec E=-\nabla V$, agora com uma contribuição adicional do potencial vetor variável no tempo — expressão central da eletrodinâmica que será usada na Parte 2 (radiação e ondas).

## Força Eletromotriz do Movimento

### Dedução: barra condutora deslizante

Considere uma barra condutora de comprimento $\ell$, deslizando com velocidade $\vec v$ sobre dois trilhos condutores paralelos, formando um circuito fechado, tudo imerso em um campo magnético uniforme $\vec B$ perpendicular ao plano do circuito. Os elétrons livres na barra, movendo-se com a barra a velocidade $\vec v$, sofrem força de Lorentz magnética:

$$
\vec{F}_{mag} = q\vec{v}\times\vec{B}
$$

Essa força atua como um "campo elétrico efetivo" $\vec{v}\times\vec{B}$ que impulsiona os portadores ao longo da barra. Define-se a **fem de movimento** como o trabalho por unidade de carga realizado por essa força ao longo de todo o circuito:

$$
\boxed{\varepsilon = \oint_C (\vec{v}\times\vec{B})\cdot d\vec{\ell}}
$$

Para a barra específica descrita (velocidade $v$ perpendicular a si mesma e a $B$, com $\ell$ ao longo da barra), $|\vec v\times\vec B|=vB$ é constante e paralelo à barra:

$$
\boxed{\varepsilon = B\ell v}
$$

### Consistência com a Lei de Faraday integral

Verifique que esse resultado é um caso particular da Lei de Faraday geral. Se a barra se move com velocidade $v$, a área do circuito cresce a uma taxa $dA/dt=\ell v$ (a barra "varre" uma área $\ell v\,dt$ em um tempo $dt$). O fluxo através do circuito é $\Phi_B=B\cdot A(t)$, logo:

$$
\frac{d\Phi_B}{dt} = B\frac{dA}{dt} = B\ell v
$$

$$
\left|\varepsilon\right| = \left|\frac{d\Phi_B}{dt}\right| = B\ell v
$$

idêntico ao resultado da Seção “Dedução: barra condutora deslizante” — confirmando que a fem de movimento (força de Lorentz sobre cargas em um condutor móvel) e a Lei de Faraday (variação de fluxo) descrevem o **mesmo fenômeno físico** por dois caminhos diferentes: força microscópica sobre portadores vs. variação macroscópica de fluxo. Essa equivalência é, historicamente, uma das pistas que levaram à relatividade restrita (a "força eletromotriz" medida depende do referencial: no referencial da barra, é a Lei de Faraday com $\vec B$ variável devido ao movimento relativo; no referencial do laboratório, é a força de Lorentz — ambos descrevem a mesma física observável).

### Aplicação: disco de Faraday

Um disco condutor de raio $R$, girando com velocidade angular $\omega$ em um campo uniforme $\vec B=B\hat z$, produz fem contínua entre o centro e a borda. Um elemento a raio $r$ tem $\vec v=\omega r\,\hat\phi$; portanto, $\vec v\times\vec B=\omega rB\,\hat r$ e

$$
\boxed{\mathcal E=\int_0^R(\vec v\times\vec B)\cdot d\vec\ell
=\int_0^R\omega rB\,dr=\frac12\omega BR^2}.
$$

**Insight físico**: embora o fluxo através do próprio disco seja constante, há fem porque as cargas móveis sofrem força magnética $q\vec v\times\vec B$. Isso mostra por que a forma “$-d\Phi_B/dt$” exige cuidado para circuitos móveis: a descrição geral inclui explicitamente o termo de movimento.

**Cheque dimensional**: $[\omega BR^2]=\mathrm{s^{-1}\,T\,m^2}=\mathrm{Wb/s}=\mathrm V$.

### Corrente induzida e dissipação — freio eletromagnético

Se a barra tem resistência $R$, a corrente induzida é $I=\varepsilon/R=B\ell v/R$. Essa corrente, por sua vez, sofre uma força de Lorentz $\vec F = I\vec\ell\times\vec B$ que **se opõe** ao movimento da barra (Lei de Lenz), dissipando energia cinética em energia elétrica/térmica — princípio de **freios eletromagnéticos** e de geradores elétricos em geral.

---

### Exemplo Resolvido Passo a Passo: Barra Deslizante com Freio Eletromagnético

**Problema**: Uma barra condutora de comprimento $\ell = 0{,}4\,\text{m}$ desliza com velocidade constante $v = 6{,}0\,\text{m/s}$ sobre dois trilhos condutores paralelos horizontais, na presença de um campo magnético uniforme $B = 0{,}8\,\text{T}$ perpendicular ao plano dos trilhos (apontando para baixo). Os trilhos e a barra têm resistência total $R = 2{,}0\,\Omega$. Determine: (a) a fem induzida; (b) a corrente induzida; (c) a potência dissipada; (d) a força externa necessária para manter a barra em velocidade constante.

**Passo 1: Calcular a fem induzida $\varepsilon$.**  
Pela fórmula da fem de movimento para uma barra deslizante:
$$
\varepsilon = B\ell v = (0{,}8\,\text{T})(0{,}4\,\text{m})(6{,}0\,\text{m/s}) = 1{,}92\,\text{V}
$$

**Resposta (a)**: $\boxed{\varepsilon = 1{,}92\,\text{V}}$

**Passo 2: Calcular a corrente induzida $I$.**  
Pela Lei de Ohm, a corrente no circuito é:
$$
I = \frac{\varepsilon}{R} = \frac{1{,}92\,\text{V}}{2{,}0\,\Omega} = 0{,}96\,\text{A}
$$

O sentido da corrente é tal que a força magnética resultante se opõe ao movimento (Lei de Lenz). Se a barra se move para a direita e $\vec B$ aponta para baixo, a força de Lorentz sobre os elétrons é para trás, então a corrente convencional flui no sentido que produz uma força magnética para a esquerda.

**Resposta (b)**: $\boxed{I = 0{,}96\,\text{A}}$

**Passo 3: Calcular a potência dissipada $P_{diss}$.**  
A potência dissipada no resistor é:
$$
P_{diss} = I^2 R = (0{,}96\,\text{A})^2(2{,}0\,\Omega) = 0{,}9216 \times 2{,}0 = 1{,}8432\,\text{W}
$$

Ou, equivalentemente, $P_{diss} = \varepsilon I = (1{,}92\,\text{V})(0{,}96\,\text{A}) = 1{,}8432\,\text{W}$.

**Resposta (c)**: $\boxed{P_{diss} \approx 1{,}84\,\text{W}}$

**Passo 4: Calcular a força externa $F_{ext}$ necessária.**  
A força magnética sobre a barra é:
$$
F_{mag} = I\ell B = (0{,}96\,\text{A})(0{,}4\,\text{m})(0{,}8\,\text{T}) = 0{,}3072\,\text{N}
$$

Essa força atua no sentido oposto ao movimento (para a esquerda, se a barra se move para a direita). Para manter a barra em velocidade constante, uma força externa $F_{ext}$ deve ser aplicada no sentido do movimento, com módulo igual:
$$
F_{ext} = F_{mag} = 0{,}3072\,\text{N}
$$

A potência mecânica fornecida pela força externa é:
$$
P_{mec} = F_{ext} v = (0{,}3072\,\text{N})(6{,}0\,\text{m/s}) = 1{,}8432\,\text{W}
$$

**Resposta (d)**: $\boxed{F_{ext} \approx 0{,}307\,\text{N}}$, e nota-se que $P_{mec} = P_{diss}$ — a potência mecânica fornecida é exatamente convertida em potência térmica dissipada no resistor.

---

## Autoindutância e Indutância Mútua

### Autoindutância: definição e dedução para o solenoide

Quando um circuito é percorrido por corrente $I$, ele próprio produz um fluxo magnético $\Phi_B$ através de si mesmo, proporcional a $I$ (por linearidade da Lei de Biot-Savart em relação à fonte):

$$
\Phi_B = LI
$$

onde $L$, a **autoindutância**, depende apenas da geometria do circuito (e do meio magnético). Pela Lei de Faraday, uma corrente **variável** induz uma fem que se opõe à própria variação:

$$
\boxed{\varepsilon = -L\frac{dI}{dt}}
$$

**Dedução para um solenoide** de $N$ espiras, comprimento $\ell$, área de seção $A$ (arquivo 4, Seção “Autoindutância e Indutância Mútua”.4.2 deduziu $B=\mu_0nI$ dentro, com $n=N/\ell$): o fluxo através de **uma** espira é $\Phi_{1esp} = BA = \mu_0(N/\ell)IA$; o fluxo total **concatenado** (somando as $N$ espiras, cada uma "vendo" o mesmo fluxo) é:

$$
\Phi_B = N\Phi_{1esp} = \mu_0\frac{N^2}{\ell}IA
$$

Comparando com $\Phi_B=LI$:

$$
\boxed{L = \frac{\mu_0N^2A}{\ell}}
$$

Note a dependência quadrática em $N$ — dobrar o número de espiras quadruplica a indutância (cada espira contribui tanto com mais fluxo próprio quanto por "ver" o fluxo das demais).

### Indutância mútua

Considere dois circuitos próximos, 1 e 2. Uma corrente $I_1$ no circuito 1 produz um fluxo $\Phi_{21}$ através do circuito 2, proporcional a $I_1$:

$$
\Phi_{21} = M_{21}I_1
$$

Pela Lei de Faraday, uma variação de $I_1$ induz fem no circuito 2:

$$
\varepsilon_2 = -M_{21}\frac{dI_1}{dt}
$$

### Teorema da reciprocidade ($M_{12}=M_{21}$)

Um resultado notável (e não óbvio à primeira vista) é que $M_{12}=M_{21}\equiv M$: o fluxo que uma corrente unitária no circuito 1 produz no circuito 2 (por unidade de corrente) é **exatamente igual** ao fluxo que a mesma corrente no circuito 2 produziria no circuito 1. Isso pode ser demonstrado a partir da expressão do potencial vetor (arquivo 4):

$$
M_{21} = \frac{1}{I_1}\int_{S_2}\vec{B}_1\cdot d\vec{A}_2 = \frac{1}{I_1}\oint_{C_2}\vec{A}_1\cdot d\vec{\ell}_2
$$

Substituindo $\vec A_1(\vec r_2) = \dfrac{\mu_0I_1}{4\pi}\oint_{C_1}\dfrac{d\vec\ell_1}{|\vec r_2-\vec r_1|}$ (Seção “Autoindutância e Indutância Mútua”.6.3):

$$
M_{21} = \frac{\mu_0}{4\pi}\oint_{C_1}\oint_{C_2}\frac{d\vec{\ell}_1\cdot d\vec{\ell}_2}{|\vec{r}_2-\vec{r}_1|}
$$

Essa é a **Fórmula de Neumann**, manifestamente **simétrica** na troca de índices $1\leftrightarrow2$ — demonstrando $M_{12}=M_{21}=M$ diretamente. Esse resultado é o princípio de funcionamento de **transformadores**: a mesma indutância mútua $M$ acopla energia do primário ao secundário e vice-versa.

```python
import numpy as np
import matplotlib.pyplot as plt

fig,ax=plt.subplots(figsize=(8,4)); t=np.linspace(0,14*np.pi,900)
x=np.linspace(-3,3,len(t)); ax.plot(x,.75*np.sin(t),color="#d97706",lw=2.5)
for yy in np.linspace(-.5,.5,5):
    ax.annotate("",(2.65,yy),(-2.65,yy),arrowprops=dict(arrowstyle="->",color="#2563eb",lw=1.7))
ax.text(0,.05,"fluxo magnético comum",ha="center",bbox=dict(fc="white",alpha=.85,ec="none"))
ax.set(xlim=(-3.4,3.4),ylim=(-1.15,1.15),title="Fluxo no interior do solenoide"); ax.axis("off")
plt.tight_layout()
```

## Energia Armazenada no Campo Magnético

### Dedução a partir do circuito RL

Considere um circuito com um indutor $L$ e uma fonte que estabelece uma corrente crescente de $0$ a $I$. A fonte deve realizar trabalho contra a fem induzida $\varepsilon=-L\,dI/dt$ (que se opõe ao aumento de corrente). A potência fornecida pela fonte para vencer essa fem:

$$
P = -\varepsilon I = LI\frac{dI}{dt}
$$

A energia total armazenada, integrando de $I=0$ a $I$:

$$
U = \int_0^I LI'\,dI' = \frac{1}{2}LI^2
$$

$$
\boxed{U = \frac{1}{2}LI^2}
$$

### Reescrevendo em termos do campo (densidade de energia magnética)

Por um procedimento inteiramente análogo ao usado para o campo elétrico (arquivo 2, Seção “Lei de Faraday — Forma Pontual”.4.2 — usando $\vec B=\nabla\times\vec A$, integração por partes vetorial e o Teorema do Divergente, com os termos de superfície se anulando no infinito), obtém-se:

$$
\boxed{U = \frac{1}{2\mu_0}\int_{\text{todo espaço}} B^2\,dV = \int_{\text{todo espaço}} u_B\,dV,\qquad u_B \equiv \frac{B^2}{2\mu_0}}
$$

**Verificação de consistência para o solenoide**: com $B=\mu_0nI$ uniforme em um volume $V_{vol}=A\ell$:

$$
U = \frac{B^2}{2\mu_0}(A\ell) = \frac{(\mu_0nI)^2}{2\mu_0}A\ell = \frac{1}{2}\left(\frac{\mu_0N^2A}{\ell}\right)I^2 = \frac{1}{2}LI^2
$$

recuperando exatamente o resultado da Seção “Dedução a partir do circuito RL”, usando $L=\mu_0N^2A/\ell$ (Seção “Autoindutância: definição e dedução para o solenoide”) — uma bela confirmação cruzada entre a visão "energia no circuito" ($\frac12LI^2$) e "energia no campo" ($\int u_B\,dV$).

### Densidade de energia eletromagnética total

Somando as contribuições elétrica (arquivo 2) e magnética, a densidade de energia eletromagnética total em um ponto do espaço é:

$$
\boxed{u = \frac{1}{2}\varepsilon_0E^2 + \frac{1}{2\mu_0}B^2}
$$

Essa expressão será central na Parte 2 da apostila, ao calcularmos a energia transportada por ondas eletromagnéticas (vetor de Poynting).

## Correntes de Deslocamento e Lei de Ampère Corrigida

### A inconsistência descoberta por Maxwell

A Lei de Ampère pontual, na forma vista até aqui (arquivo 4, Seção “Autoindutância e Indutância Mútua”.5):

$$
\nabla\times\vec{B} = \mu_0\vec{J}
$$

exige, tomando o divergente de ambos os lados, que $\nabla\cdot\vec{J}=0$ sempre (Seção “Autoindutância e Indutância Mútua”.5.2) — mas isso **só** é verdade em regime estacionário. Em geral, a equação da continuidade (arquivo 3) exige:

$$
\nabla\cdot\vec{J} = -\frac{\partial\rho}{\partial t}
$$

que é **diferente de zero** sempre que a densidade de carga varia no tempo em algum ponto — por exemplo, entre as placas de um capacitor sendo carregado, onde há corrente de condução chegando às placas mas **nenhuma corrente real atravessando o espaço entre elas**. A Lei de Ampère, aplicada ingenuamente a duas superfícies diferentes que compartilham o mesmo contorno (uma cortando o fio, outra passando entre as placas do capacitor), daria dois resultados **diferentes** para $I_{env}$ — uma contradição física inaceitável.

### Dedução da correção de Maxwell

Maxwell propôs (1861-62) adicionar um termo à Lei de Ampère de modo a restaurar a consistência com a equação da continuidade. Postule uma forma geral:

$$
\nabla\times\vec{B} = \mu_0\vec{J} + \mu_0\vec{J}_d
$$

onde $\vec J_d$ é um termo a determinar (a **corrente de deslocamento**). Tomando o divergente:

$$
0 = \mu_0\nabla\cdot\vec{J} + \mu_0\nabla\cdot\vec{J}_d \quad\Rightarrow\quad \nabla\cdot\vec{J}_d = -\nabla\cdot\vec{J} = \frac{\partial\rho}{\partial t}
$$

(usando a equação da continuidade). Agora, usando a Lei de Gauss elétrica $\rho=\varepsilon_0\nabla\cdot\vec E$:

$$
\nabla\cdot\vec{J}_d = \varepsilon_0\frac{\partial}{\partial t}(\nabla\cdot\vec{E}) = \nabla\cdot\left(\varepsilon_0\frac{\partial\vec{E}}{\partial t}\right)
$$

Essa igualdade é satisfeita (a menos de um campo solenoidal adicional sem física relevante aqui, descartado por simplicidade/unicidade) identificando:

$$
\boxed{\vec{J}_d \equiv \varepsilon_0\frac{\partial\vec{E}}{\partial t}}\qquad\text{(corrente de deslocamento)}
$$

### Lei de Ampère–Maxwell

Substituindo de volta:

$$
\boxed{\nabla\times\vec{B} = \mu_0\vec{J} + \mu_0\varepsilon_0\frac{\partial\vec{E}}{\partial t}}\qquad\text{(Lei de Ampère–Maxwell, forma pontual)}
$$

Em forma integral, incluindo o fluxo do campo elétrico através da superfície:

$$
\oint_C\vec{B}\cdot d\vec{\ell} = \mu_0I_{env} + \mu_0\varepsilon_0\frac{d\Phi_E}{dt}, \qquad \Phi_E=\int_S\vec{E}\cdot d\vec{A}
$$

### Verificação: capacitor sendo carregado

Retomando o exemplo motivador: para uma superfície $S_1$ que corta o fio de carga (corrente de condução $I$, sem campo elétrico relevante através dela) e uma superfície $S_2$ que passa entre as placas do capacitor (sem corrente de condução, mas com campo elétrico variável $E=\sigma/\varepsilon_0=Q(t)/(\varepsilon_0A)$), ambas compartilhando o mesmo contorno $C$:

- Superfície $S_1$: $I_{env}=I=dQ/dt$, $\Phi_E\approx0$ (fora do capacitor). Lado direito: $\mu_0I$.
- Superfície $S_2$: $I_{env}=0$ (nenhuma carga real atravessa o espaço entre as placas), mas $\Phi_E = EA = Q/\varepsilon_0$, logo $\mu_0\varepsilon_0\,d\Phi_E/dt = \mu_0\varepsilon_0\cdot\dfrac{1}{\varepsilon_0}\dfrac{dQ}{dt}=\mu_0\dfrac{dQ}{dt}=\mu_0I$.

**Os dois cálculos concordam** — a corrente de deslocamento "substitui" exatamente a corrente de condução que falta entre as placas, restaurando a consistência da Lei de Ampère para qualquer superfície escolhida. Esse é um dos resultados mais importantes de todo o eletromagnetismo clássico: **o termo de Maxwell não é apenas uma correção matemática, mas prevê que campos elétricos variáveis geram campos magnéticos**, exatamente como campos magnéticos variáveis geram campos elétricos (Lei de Faraday) — uma simetria que, como veremos na Parte 2, é a origem física das ondas eletromagnéticas autossustentadas.

## Equações de Maxwell — Síntese

### As quatro equações (forma pontual/diferencial), em meios materiais

$$
\begin{aligned}
\nabla\cdot\vec{D} &= \rho_{livre} &&\text{(I) Lei de Gauss elétrica}\\[8pt]
\nabla\cdot\vec{B} &= 0 &&\text{(II) Lei de Gauss magnética (ausência de monopolos)}\\[8pt]
\nabla\times\vec{E} &= -\frac{\partial\vec{B}}{\partial t} &&\text{(III) Lei de Faraday}\\[8pt]
\nabla\times\vec{H} &= \vec{J}_{livre}+\frac{\partial\vec{D}}{\partial t} &&\text{(IV) Lei de Ampère–Maxwell}
\end{aligned}
$$

acompanhadas das **relações constitutivas** do meio ($\vec D=\varepsilon\vec E$, $\vec B=\mu\vec H$, $\vec J=\sigma\vec E$ para meios lineares) e da **força de Lorentz** $\vec F=q(\vec E+\vec v\times\vec B)$, que fecha o sistema conectando os campos ao movimento das cargas.

### Forma no vácuo, sem fontes

No vácuo, longe de cargas e correntes ($\rho_{livre}=0$, $\vec J_{livre}=0$, $\vec D=\varepsilon_0\vec E$, $\vec H=\vec B/\mu_0$):

$$
\begin{aligned}
\nabla\cdot\vec{E} &= 0\\
\nabla\cdot\vec{B} &= 0\\
\nabla\times\vec{E} &= -\frac{\partial\vec{B}}{\partial t}\\
\nabla\times\vec{B} &= \mu_0\varepsilon_0\frac{\partial\vec{E}}{\partial t}
\end{aligned}
$$

### De onde vêm as ondas — prévia da Parte 2

Tomando o rotacional da equação (III) e substituindo a equação (IV) (ambas as manipulações usam apenas identidades vetoriais e as próprias equações de Maxwell no vácuo):

$$
\nabla\times(\nabla\times\vec{E}) = -\frac{\partial}{\partial t}(\nabla\times\vec{B}) = -\mu_0\varepsilon_0\frac{\partial^2\vec{E}}{\partial t^2}
$$

Usando a identidade $\nabla\times(\nabla\times\vec E)=\nabla(\nabla\cdot\vec E)-\nabla^2\vec E$ e $\nabla\cdot\vec E=0$ (vácuo, sem cargas):

$$
\boxed{\nabla^2\vec{E} = \mu_0\varepsilon_0\frac{\partial^2\vec{E}}{\partial t^2}}
$$

Esta é uma **equação de onda** tridimensional, com velocidade de propagação:

$$
c = \frac{1}{\sqrt{\mu_0\varepsilon_0}}
$$

Calculando numericamente com $\mu_0=4\pi\times10^{-7}\,\text{T·m/A}$ e $\varepsilon_0\approx8{,}854\times10^{-12}\,\text{F/m}$, obtém-se $c\approx2{,}998\times10^8\,\text{m/s}$ — **exatamente a velocidade da luz**, medida independentemente por métodos óticos décadas antes. Essa coincidência numérica levou Maxwell a propor, em 1865, que **a luz é uma onda eletromagnética** — uma das unificações mais profundas da física clássica, e o ponto de partida exato da **Parte 2 desta apostila** (Ondas e Propagação).

## Teorema de Poynting

### Derivação

O teorema de Poynting expressa a **conservação de energia** no campo eletromagnético. Partimos das equações de Maxwell (forma pontual):

$$
\begin{aligned}
\nabla\times\vec E&=-\frac{\partial\vec B}{\partial t},\\
\nabla\times\vec H&=\vec J_f+\frac{\partial\vec D}{\partial t}.
\end{aligned}
$$

Multiplicamos a primeira por $\vec{H}$ e a segunda por $\vec{E}$, e subtraímos:

$$
\vec H\cdot(\nabla\times\vec E)-\vec E\cdot(\nabla\times\vec H)
=-\vec H\cdot\frac{\partial\vec B}{\partial t}
-\vec E\cdot\vec J_f-\vec E\cdot\frac{\partial\vec D}{\partial t}
$$

O lado esquerdo é $-\nabla\cdot(\vec{E}\times\vec{H})$ (identidade: $\nabla\cdot(\vec{A}\times\vec{B})=\vec{B}\cdot(\nabla\times\vec{A})-\vec{A}\cdot(\nabla\times\vec{B})$).

Para meios lineares, sem dispersão e com $\varepsilon,\mu$ constantes no tempo:

$$
-\frac{1}{2}\frac{\partial}{\partial t}(\varepsilon E^2 + \mu H^2) = -\frac{\partial u}{\partial t}
$$

com $u = \tfrac{1}{2}\varepsilon E^2 + \tfrac{1}{2}\mu H^2$ a densidade de energia eletromagnética.

Para meios com condutividade $\sigma$, a corrente livre $\vec{J}_f = \sigma\vec{E}$ dissipa energia por efeito Joule:

$$
\vec{E}\cdot\vec{J}_f = \sigma E^2 = P_{\text{Joule}}\quad\text{(potência dissipada por unidade de volume)}
$$

Juntando tudo:

$$
\boxed{-\nabla\cdot(\vec{E}\times\vec{H}) = \frac{\partial u}{\partial t} + \sigma E^2}
$$

Integrando sobre um volume $V$ delimitado por $S$ e aplicando o teorema do divergente:

$$
\boxed{-\oint_S (\vec{E}\times\vec{H})\cdot d\vec{A} = \frac{d}{dt}\int_V u\,dV + \int_V \sigma E^2\,dV}
$$

### Interpretação física

$$
\underbrace{-\oint_S \vec{S}\cdot d\vec{A}}_{\text{potência QUE ENTRA no volume}} = \underbrace{\frac{dU}{dt}}_{\text{taxa de aumento de energia armazenada}} + \underbrace{P_{\text{dissipada}}}_{\text{perdas Joule}}
$$

onde $\vec{S} \equiv \vec{E}\times\vec{H}$ é o **vetor de Poynting**, com unidade de W/m², que mede o fluxo de energia eletromagnética.

**Exemplo**: em uma linha de transmissão, a energia flui **pelo dielétrico entre os condutores**, não pelos condutores! O vetor de Poynting é perpendicular aos condutores e apontando ao longo da linha — a energia é transportada pelo campo, não pela corrente no fio.

### Intensidade de ondas eletromagnéticas

Para uma onda plana no vácuo, $\vec{E} \perp \vec{B}$ e $E = cB = \eta_0 H$:

$$
S = \frac{E^2}{\eta_0} = \eta_0 H^2 = c\,u
$$

A intensidade média (sobre um ciclo):

$$
\boxed{\langle S\rangle = \frac{E_0^2}{2\eta_0} = \frac{1}{2}E_0 H_0}
$$

Esta é a potência por unidade de área transportada pela onda — a grandeza medida por detectores de luz, antenas, etc.

**Exemplo**: luz solar na Terra (constante solar) $\approx 1360\,\text{W/m}^2$. O campo elétrico correspondente:

$$
E_0 = \sqrt{2\eta_0\cdot1360} \approx \sqrt{2\times377\times1360} \approx 1020\,\text{V/m}
$$

O campo magnético: $B_0 = E_0/c \approx 3{,}4\,\mu\text{T}$.

## Potenciais Retardados

### Potencial vetor no domínio do tempo

Em magnetostática, o potencial vetor era:

$$
\vec{A}(\vec{r}) = \frac{\mu_0}{4\pi}\int\frac{\vec{J}(\vec{r}')}{|\vec{r}-\vec{r}'|}\,dV'
$$

Em eletrodinâmica, informações se propagam à velocidade $c$, não instantaneamente. O potencial em $\vec{r}$ no tempo $t$ depende da distribuição de corrente em $\vec{r}'$ no tempo **retardado** $t_r = t - |\vec{r}-\vec{r}'|/c$:

$$
\boxed{\vec{A}(\vec{r},t) = \frac{\mu_0}{4\pi}\int\frac{\vec{J}(\vec{r}',\,t_r)}{|\vec{r}-\vec{r}'|}\,dV'}
$$

Analogamente, o potencial escalar:

$$
\boxed{V(\vec{r},t) = \frac{1}{4\pi\varepsilon_0}\int\frac{\rho(\vec{r}',\,t_r)}{|\vec{r}-\vec{r}'|}\,dV'}
$$

O tempo retardado $t_r = t - R/c$ (com $R = |\vec{r}-\vec{r}'|$) incorpora o tempo de viagem da informação do ponto fonte ao ponto de observação — a **ação não-local retardada**.

### Calibre de Lorenz

Os potenciais $V$ e $\vec{A}$ acima são válidos no **calibre de Lorenz**:

$$
\nabla\cdot\vec{A} + \frac{1}{c^2}\frac{\partial V}{\partial t} = 0
$$

Que generaliza o calibre de Coulomb ($\nabla\cdot\vec{A}=0$) para o caso dinâmico.

No calibre de Lorenz, $V$ e $\vec{A}$ satisfazem **equações de onda com fonte**:

$$
\nabla^2 V - \frac{1}{c^2}\frac{\partial^2 V}{\partial t^2} = -\frac{\rho}{\varepsilon_0}
$$

$$
\nabla^2\vec{A} - \frac{1}{c^2}\frac{\partial^2\vec{A}}{\partial t^2} = -\mu_0\vec{J}
$$

As soluções são exatamente os potenciais retardados acima — os **potenciais de Liénard–Wiechert** para cargas em movimento geral.

### Consequência: radiação

Os potenciais retardados são a base da teoria da **radiação eletromagnética**. Uma carga acelerada produz campos que se desprendem da fonte e se propagam ao infinito — a **radiação**. O campo de radiação (que decai como $1/r$, mais lentamente que o campo de Coulomb $1/r^2$) é proporcional à **aceleração** da carga.

A potência total radiada por uma carga puntiforme acelerada é dada pela **fórmula de Larmor**:

$$
\boxed{P = \frac{q^2 a^2}{6\pi\varepsilon_0 c^3}}
$$

Esta é a base de: síncrotron (radiação de elétrons em aceleradores), bremsstrahlung (radiação de frenagem), e a perda de energia de antenas irradiantes.

## Condições de Contorno para Campos Variantes no Tempo

### Resumo das condições de contorno (geral, variantes no tempo)

Na ausência de monopolos/correntes magnéticas idealizados e sem campos impulsivos singulares na interface, as condições macroscópicas são:

**Elétricas**:
$$
\begin{aligned}
\hat n_{12}\times(\vec E_2-\vec E_1)&=0,\\
\hat n_{12}\cdot(\vec D_2-\vec D_1)&=\sigma_f.
\end{aligned}
$$

**Magnéticas**:
$$
\begin{aligned}
\hat n_{12}\cdot(\vec B_2-\vec B_1)&=0,\\
\hat n_{12}\times(\vec H_2-\vec H_1)&=\vec K_f.
\end{aligned}
$$

Somente para meios lineares isotrópicos pode-se substituir $\vec D_i=\varepsilon_i\vec E_i$ e $\vec B_i=\mu_i\vec H_i$. As formas vetoriais também fixam o sinal, que fica ambíguo quando se escreve apenas “componente 2 menos componente 1”.

### Consequências para ondas EM em interfaces

Quando uma onda plana incide em uma interface entre dois meios, estas condições de contorno determinam:

1. **Leis de reflexão e refração** (Snell): o vetor de onda tangencial é contínuo → $\theta_i = \theta_r$ e $n_1\sin\theta_i = n_2\sin\theta_t$.
2. **Coeficientes de Fresnel**: razão entre amplitudes dos campos refletido/transmitido e o incidente — depende da polarização (TE/TM) e dos índices de refração.
3. **Reflexão total interna**: quando $n_1 > n_2$ e $\theta_i > \theta_c = \arcsin(n_2/n_1)$, toda a energia é refletida e surge um campo **evanescente** no segundo meio, decaindo exponencialmente.

Estes tópicos serão tratados em detalhe na **Parte 2** (Ondas e Propagação).

## Exercícios Resolvidos em Python

### Roteiro computacional

**Objetivo.** Verificar indução, corrente de deslocamento, balanço de Poynting e propagação temporal por FDTD.

**Hipóteses.** Meios lineares, homogêneos e sem perdas nos exemplos de onda; a malha FDTD deve satisfazer a condição de Courant.

**Como executar.** Requer `numpy` e `matplotlib`. Registre $\Delta x$, $\Delta t$, número de Courant e erro no balanço de energia.

**Resultados esperados.** $I_d=I_{cond}$ no capacitor ideal, velocidade numérica próxima de $c$ e energia conservada até erros de fronteira e discretização.

```python
import numpy as np
import matplotlib.pyplot as plt

mu0  = 4*np.pi*1e-7
eps0 = 8.854e-12
c    = 1/np.sqrt(mu0*eps0)
eta0 = np.sqrt(mu0/eps0)  # ~377 ohms

# === Velocidade da luz ===
print(f"c calculado: {c:.6e} m/s")
print(f"c SI:        {299792458:.6e} m/s")
print(f"Erro: {abs(c-299792458)/299792458*100:.4f}%")

# === Autoindutância de um solenoide ===
def autoindutancia_solenoide(N, A, l):
    return mu0*N**2*A/l

L = autoindutancia_solenoide(N=1000, A=2e-4, l=0.15)
print(f"\nAutoindutância: {L*1e3:.4f} mH")

# === Energia no campo magnético ===
I = 2.0
U_circuito = 0.5*L*I**2
B = mu0*(1000/0.15)*I
u_B = B**2/(2*mu0)
U_campo = u_B*(2e-4*0.15)
print(f"U via (1/2)LI²:      {U_circuito:.6e} J")
print(f"U via campo:         {U_campo:.6e} J")
print(f"Razão: {U_campo/U_circuito:.6f}")

# === Corrente de deslocamento ===
def corrente_deslocamento(dEdt, A, eps=eps0):
    return eps*dEdt*A

A_placas = 1e-4
dEdt = 1e9
I_d = corrente_deslocamento(dEdt, A_placas)
print(f"\nCorrente de deslocamento: {I_d*1e3:.4f} mA")

# === Teorema de Poynting: onda plana ===
def intensidade_onda(E0):
    """Intensidade média de uma onda plana: <S> = E0²/(2η₀)."""
    return E0**2/(2*eta0)

# Constante solar
E0_sol = np.sqrt(2*eta0*1360)
S_sol = intensidade_onda(E0_sol)
print(f"\nConstante solar:")
print(f"  E0 = {E0_sol:.1f} V/m")
print(f"  B0 = {E0_sol/c*1e6:.3f} µT")
print(f"  <S> = {S_sol:.1f} W/m²")

# === Fórmula de Larmor ===
def potencia_larmor(q, a, eps=eps0):
    """Potência radiada por uma carga acelerada."""
    return q**2 * a**2 / (6*np.pi*eps*c**3)

e, a_e = 1.602e-19, 5e22  # aceleração típica em síncrotron
P = potencia_larmor(e, a_e)
print(f"\nPotência radiada (Larmor, síncrotron): {P*1e12:.6f} pW")

# === Simulação FDTD 1D: propagação de pulso ===
def fdtd_1d_vacuo(nz=320, nt=360, dz=1e-3, salvar_cada=60):
    """Yee 1D para E_x e H_y; retorna toda informação usada nos gráficos."""
    dt = 0.99*dz/c  # Courant: c*dt/dz <= 1
    E = np.zeros(nz)
    H = np.zeros(nz-1)
    historico, tempos = [], []
    fonte, largura = nz//4, 18

    for n in range(nt):
        # Faraday e Ampère-Maxwell em malha intercalada (Yee).
        H += dt/(mu0*dz) * (E[1:] - E[:-1])
        E[1:-1] += dt/(eps0*dz) * (H[1:] - H[:-1])
        E[fonte] += np.exp(-0.5*((n-55)/largura)**2)  # pulso gaussiano temporal
        # Contorno absorvente de primeira ordem, suficiente para esta janela.
        E[0], E[-1] = E[1], E[-2]
        if n % salvar_cada == 0:
            historico.append(E.copy()); tempos.append(n*dt)

    return np.arange(nz)*dz, np.array(tempos), np.array(historico), H, dt

z_fdtd, t_fdtd, hist, H_final, dt = fdtd_1d_vacuo()
deslocamento = (np.argmax(np.abs(hist[-1])) - np.argmax(np.abs(hist[1]))) * (z_fdtd[1]-z_fdtd[0])
velocidade_medida = deslocamento/(t_fdtd[-1]-t_fdtd[1])
print(f"\nFDTD: Courant c·dt/dz={c*dt/(z_fdtd[1]-z_fdtd[0]):.2f}")
print(f"Velocidade estimada do pulso: {velocidade_medida/c:.3f} c")

# === Verificação: Poynting theorem em FDTD ===
def verificacao_poynting(F, G):
    """Calcula divergente numérico de F x G."""
    return np.gradient(F*G)

# === Potenciais retardados: exemplo ===
def potencial_retardado(r, t, I0, omega):
    """Potencial A_z de uma antena curta com corrente I(t) = I0*cos(ωt)."""
    R = np.sqrt(r**2 + 1)  # distância à fonte
    t_r = t - R/c
    return mu0*I0*np.cos(omega*t_r)/(4*np.pi*R)

I0, omega = 1.0, 2*np.pi*1e9  # 1 GHz
r, t = 1.0, 1e-9
A_ret = potencial_retardado(r, t, I0, omega)
A_inst = mu0*I0*np.cos(omega*t)/(4*np.pi*np.sqrt(r**2+1))  # sem retardo
print(f"\nPotencial retardado (1 GHz, 1 m):")
print(f"  A_ret = {A_ret:.6e} T·m")
print(f"  A_inst (sem retardo) = {A_inst:.6e} T·m")
print(f"  Diferença: {abs(A_ret-A_inst):.6e}")

# === Visualização: propagação do pulso ===
fig, ax = plt.subplots(figsize=(10,5))
for tempo, campo in zip(t_fdtd, hist):
    ax.plot(z_fdtd*100, campo, alpha=0.35, label=f"{tempo*1e9:.2f} ns")
ax.set_xlabel('z (cm)')
ax.set_ylabel('E (normalizado)')
ax.set_title('Propagação de pulso EM — método de Yee 1D')
ax.legend(ncol=2, fontsize=8)
ax.grid(True, alpha=0.3)
plt.tight_layout()
```

**Saída esperada**:

- Velocidade da luz: coincidência perfeita com o valor definido pelo SI
- Autoindutância: ~1,67 mH para o solenoide dado
- Energia: circuito e campo coincidem com erro < 10⁻⁶
- Corrente de deslocamento: ~0,885 mA (igual à corrente de condução no capacitor)
- Constante solar: E₀ ≈ 1020 V/m, B₀ ≈ 3,4 µT
- Larmor: potência radiada típica de elétrons em síncrotron
- FDTD: pulso se propaga à velocidade c, mantendo forma
- Potencial retardado: diferença pequena em 1 m a 1 GHz, mas mensurável

### Experimento: fluxo, fem e Lei de Lenz no tempo

**Hipóteses**: espira rígida e estacionária, campo uniforme e perpendicular à área, resistência constante e autoindutância desprezível. Nessas condições, $Phi_B(t)=AB(t)$ e $mathcal E(t)=-A,dB/dt$.

```python
import numpy as np
import matplotlib.pyplot as plt

A, R, B0, f = 0.01, 5.0, 0.20, 60.0
t = np.linspace(0, 3/f, 1000)
B = B0*np.cos(2*np.pi*f*t)
fluxo = A*B
fem = A*B0*2*np.pi*f*np.sin(2*np.pi*f*t)
corrente = fem/R

fig, axes = plt.subplots(3, 1, figsize=(8, 6), sharex=True)
axes[0].plot(t*1e3, fluxo*1e3, color="#2563eb")
axes[0].set_ylabel("$\\Phi_B$ (mWb)")
axes[1].plot(t*1e3, fem, color="#dc2626")
axes[1].set_ylabel("$\\mathcal{E}$ (V)")
axes[2].plot(t*1e3, corrente, color="#047857")
axes[2].set(ylabel="$I$ (A)", xlabel="tempo (ms)")
for ax in axes: ax.grid(alpha=.25)
fig.suptitle("Lei de Faraday: a fem é proporcional a −dΦ/dt")
plt.tight_layout()

idx = np.argmax(fluxo)
print(f"No máximo do fluxo: Φ={fluxo[idx]:.3e} Wb e fem={fem[idx]:.2e} V")
print(f"Fem de pico analítica: {A*B0*2*np.pi*f:.3f} V")
```

**Insight físico**: a fem se anula quando o fluxo é máximo ou mínimo, pois nesses instantes o fluxo para momentaneamente de variar. Ela atinge o módulo máximo quando o fluxo cruza zero, onde sua taxa de variação é maior. O sinal negativo não significa “fem negativa” em sentido absoluto: ele codifica a oposição de Lenz em relação à orientação escolhida para o contorno.

**Erro comum**: confundir fluxo magnético elevado com fem elevada. Faraday relaciona a fem à **taxa de variação** do fluxo, não ao valor instantâneo do fluxo.

## Resumo Visual das Quatro Equações de Maxwell

| #   | Nome              | Forma integral                                                            | Forma pontual                                                                   | Significado físico                                               |
| --- | ----------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| I   | Gauss (elétrica)  | $\oint\vec{E}\cdot d\vec{A}=Q_{env}/\varepsilon_0$                        | $\nabla\cdot\vec{E}=\rho/\varepsilon_0$                                         | Cargas são fontes do campo elétrico                              |
| II  | Gauss (magnética) | $\oint\vec{B}\cdot d\vec{A}=0$                                            | $\nabla\cdot\vec{B}=0$                                                          | Não existem monopolos magnéticos                                 |
| III | Faraday           | $\oint\vec{E}\cdot d\vec\ell=-d\Phi_B/dt$                                 | $\nabla\times\vec{E}=-\partial\vec{B}/\partial t$                               | Campo magnético variável gera campo elétrico                     |
| IV  | Ampère–Maxwell    | $\oint\vec{B}\cdot d\vec\ell=\mu_0I_{env}+\mu_0\varepsilon_0\,d\Phi_E/dt$ | $\nabla\times\vec{B}=\mu_0\vec{J}+\mu_0\varepsilon_0\partial\vec{E}/\partial t$ | Correntes **e** campos elétricos variáveis geram campo magnético |

Essas quatro equações, complementadas pela força de Lorentz, constituem a totalidade da teoria eletromagnética clássica — desde a eletrostática e magnetostática já estudadas (casos particulares estacionários) até a radiação e propagação de ondas, tema da **Parte 2** desta apostila.

---

## Resumo do Capítulo

### As Quatro Equações de Maxwell

| # | Nome | Forma Integral | Forma Pontual | Significado |
|---|---|---|---|---|
| I | Gauss (elétrica) | $\displaystyle\oint\vec{E}\cdot d\vec{A}=Q_{env}/\varepsilon_0$ | $\nabla\cdot\vec{E}=\rho/\varepsilon_0$ | Cargas são fontes do campo elétrico |
| II | Gauss (magnética) | $\displaystyle\oint\vec{B}\cdot d\vec{A}=0$ | $\nabla\cdot\vec{B}=0$ | Não existem monopolos magnéticos |
| III | Faraday | $\displaystyle\oint\vec{E}\cdot d\vec\ell=-d\Phi_B/dt$ | $\nabla\times\vec{E}=-\partial\vec{B}/\partial t$ | Campo magnético variável gera campo elétrico |
| IV | Ampère–Maxwell | $\displaystyle\oint\vec{B}\cdot d\vec\ell=\mu_0I_{env}+\mu_0\varepsilon_0\,d\Phi_E/dt$ | $\nabla\times\vec{B}=\mu_0\vec{J}+\mu_0\varepsilon_0\partial\vec{E}/\partial t$ | Correntes e campos elétricos variáveis geram campo magnético |

### Fórmulas-Chave Adicionais

| Conceito | Fórmula | Aplicações |
|---|---|---|
| Força eletromotriz de movimento | $\varepsilon = \int (\vec{v}\times\vec{B})\cdot d\vec{\ell}$ | Barra deslizante, discos de Faraday |
| Autoindutância | $U = \tfrac{1}{2}LI^2$, $\varepsilon = -L\,dI/dt$ | Solenoides, toroides, indutores |
| Indutância mútua | $\varepsilon_2 = -M\,dI_1/dt$ | Transformadores |
| Corrente de deslocamento | $I_d = \varepsilon_0\dfrac{d\Phi_E}{dt}$, $\vec J_d = \varepsilon_0\dfrac{\partial\vec E}{\partial t}$ | Capacitores, ondas eletromagnéticas |
| Vetor de Poynting | $\vec S = \dfrac{1}{\mu_0}\vec E\times\vec B$ | Fluxo de energia eletromagnética |
| Energia do campo magnético | $U = \dfrac{1}{2\mu_0}\int B^2\,dV$ | Densidade $u_B = B^2/(2\mu_0)$ |

### Conceitos-Chave

1. **Lei de Faraday**: Um campo magnético variável no tempo gera um campo elétrico não-conservativo.
2. **Fem de movimento**: Resulta da força de Lorentz $q\vec{v}\times\vec{B}$ sobre cargas em movimento.
3. **Corrente de deslocamento**: Não é um fluxo real de carga, mas uma variação temporal de $\vec E$ que atua como fonte de $\vec B$.
4. **Equações de Maxwell**: Unificam eletricidade, magnetismo e óptica; preveem a existência de ondas eletromagnéticas.
5. **Teorema de Poynting**: Descreve o fluxo de energia eletromagnética através do espaço.

::: verificacao
**Verificação Rápida (Concept Check):**  
1. A corrente de deslocamento transporta carga real através de um dielétrico? **Não** — é uma variação temporal do campo elétrico.  
2. A Lei de Faraday diz que um campo magnético **variável no tempo** gera um campo elétrico ou um campo magnético? **Campo elétrico.**  
3. O vetor de Poynting $\vec S$ representa **fluxo de energia**, **força** ou **campo magnético**? **Fluxo de energia** (potência por unidade de área).
:::

## Lista de Exercícios Propostos

**E1** (Lei de Faraday integral). Uma espira circular de raio $r=5\,\text{cm}$ está imersa em um campo magnético uniforme, perpendicular ao seu plano, que varia no tempo como $B(t)=B_0+kt$, com $B_0=0{,}2\,\text{T}$ e $k=3{,}0\,\text{T/s}$. Determine a fem induzida na espira e indique, usando a Lei de Lenz, o sentido da corrente induzida (adote um sentido de referência para $\vec B$ e justifique).

**E2** (Lei de Faraday pontual). Em uma região do espaço, $\vec{B}(t) = B_0\sin(\omega t)\,\hat z$, uniforme em todo o espaço. Proponha um campo elétrico da forma $\vec E = C(t)\,(y\,\hat x - x\,\hat y)$, com $C(t)$ a determinar, calcule explicitamente $\nabla\times\vec E$ em função de $C(t)$, e imponha a Lei de Faraday pontual $\nabla\times\vec E=-\partial \vec B/\partial t$ para encontrar $C(t)$.

**E3** (Lei de Lenz qualitativa). Um anel condutor é solto, em queda livre, de forma a cair verticalmente atravessando a região de campo de um ímã em barra alinhado verticalmente (primeiro se aproximando do polo norte, depois se afastando). Esboce qualitativamente o gráfico da fem induzida $\varepsilon(t)$ em função do tempo durante toda a queda, indicando os sinais relativos nas duas fases (aproximação e afastamento) e explique por que a força magnética resultante sobre o anel sempre se opõe à queda livre (retardando-a).

**E4** (Barra deslizante — fem de movimento). Uma barra condutora de comprimento $\ell=40\,\text{cm}$ desliza com velocidade constante $v=6{,}0\,\text{m/s}$ sobre dois trilhos paralelos horizontais, na presença de um campo $B=0{,}8\,\text{T}$ perpendicular ao plano dos trilhos. (a) Calcule a fem induzida. (b) Se os trilhos e a barra têm resistência total $R=2{,}0\,\Omega$, calcule a corrente induzida e a potência dissipada. (c) Calcule a força externa necessária para manter a barra em velocidade constante e mostre que a potência mecânica fornecida é igual à potência dissipada.

**E5** (Verificação: fem de movimento vs. Faraday). Repita o cálculo do item (a) do Exercício E4 usando exclusivamente a Lei de Faraday integral ($\varepsilon=-d\Phi_B/dt$), definindo explicitamente a área varrida em função do tempo, e confirme que o resultado coincide com o obtido via força de Lorentz.

**E6** (Disco de Faraday — gerador de disco rotativo). Um disco condutor de raio $a=10\,\text{cm}$ gira com velocidade angular constante $\omega=100\,\text{rad/s}$ em torno de seu eixo central, imerso em um campo magnético uniforme $B=0{,}5\,\text{T}$ paralelo ao eixo de rotação. (a) Mostre, integrando a força de Lorentz por unidade de carga ao longo de um raio do disco (do centro à borda), que a fem entre o centro e a borda é $\varepsilon = \tfrac{1}{2}B\omega a^2$. (b) Calcule o valor numérico de $\varepsilon$.

**E7** (Autoindutância de um solenoide). Um solenoide tem $N=800$ espiras, comprimento $\ell=20\,\text{cm}$ e área de seção transversal $A=3{,}0\,\text{cm}^2$. (a) Calcule sua autoindutância $L$. (b) Se a corrente no solenoide varia como $I(t)=I_0(1-e^{-t/\tau})$ com $I_0=2{,}0\,\text{A}$ e $\tau=10\,\text{ms}$, calcule a fem autoinduzida em $t=0$ e no limite $t\to\infty$.

**E8** (Indutância mútua solenoide–bobina). Um solenoide longo tem $N_1=1000$ espiras, comprimento $\ell_1=25\,\text{cm}$ e área de seção $A_1=4{,}0\,\text{cm}^2$. Uma pequena bobina de $N_2=50$ espiras e área $A_2=1{,}0\,\text{cm}^2$ é colocada coaxialmente em seu interior, onde o campo do solenoide é aproximadamente uniforme. (a) Calcule a indutância mútua $M$. (b) Se a corrente no solenoide varia a uma taxa $dI_1/dt=150\,\text{A/s}$, calcule a fem induzida na bobina.

**E9** (Fórmula de Neumann — conceitual/dedutivo). Partindo da fórmula de Neumann $M_{21}=\dfrac{\mu_0}{4\pi}\displaystyle\oint_{C_1}\oint_{C_2}\dfrac{d\vec\ell_1\cdot d\vec\ell_2}{|\vec r_2-\vec r_1|}$, explique (sem calcular a integral dupla completa) por que essa expressão implica imediatamente que $M_{12}=M_{21}$, e discuta por que esse resultado é surpreendente do ponto de vista físico (dois circuitos de geometrias completamente diferentes podem ter formas de calcular o "fluxo mútuo" aparentemente distintas, mas o coeficiente é idêntico nos dois sentidos).

**E10** (Energia armazenada — verificação cruzada). Um toroide de seção transversal circular de área $A=5{,}0\,\text{cm}^2$, raio médio $R_m=15\,\text{cm}$ e $N=600$ espiras conduz uma corrente $I=3{,}0\,\text{A}$. (a) Calcule a autoindutância do toroide, usando $L=\mu_0N^2A/(2\pi R_m)$ (análoga à do solenoide, com $\ell\to 2\pi R_m$). (b) Calcule a energia armazenada via $U=\tfrac12 LI^2$. (c) Calcule o campo $B$ no interior do toroide e, a partir da densidade de energia $u_B=B^2/(2\mu_0)$, recalcule $U$ integrando sobre o volume $V=A\cdot(2\pi R_m)$, confirmando a concordância entre os dois métodos.

**E11** (Corrente de deslocamento — capacitor de placas paralelas). Um capacitor de placas paralelas circulares de raio $R=3{,}0\,\text{cm}$, separadas por $d=2{,}0\,\text{mm}$ no vácuo, é carregado por uma corrente de condução constante $I=0{,}50\,\text{mA}$ que chega a uma das placas. (a) Calcule a taxa de variação do campo elétrico $dE/dt$ entre as placas. (b) Calcule a densidade de corrente de deslocamento $J_d$ e confirme que a corrente de deslocamento total $I_d=J_d\cdot(\pi R^2)$ é igual a $I$. (c) Calcule o campo magnético induzido a uma distância $r=1{,}5\,\text{cm}$ do eixo (dentro da região entre as placas), usando a Lei de Ampère–Maxwell com simetria cilíndrica.

**E12** (Corrente de deslocamento — campo oscilante realista). Em uma região do espaço, o campo elétrico oscila como $\vec E(t) = E_0\cos(\omega t)\,\hat x$, com $E_0=1{,}0\times10^5\,\text{V/m}$ (campo elevado, mas plausível próximo a um eletrodo de alta tensão) e frequência $f=60\,\text{Hz}$ (rede elétrica). (a) Calcule a amplitude da densidade de corrente de deslocamento $J_{d,\text{máx}}=\varepsilon_0 E_0\omega$. (b) Repita o cálculo para uma onda de rádio de $f=1{,}0\,\text{MHz}$ com a mesma amplitude de campo, e compare as duas densidades de corrente, comentando por que a corrente de deslocamento é desprezível em baixas frequências mas se torna dominante em altas frequências.

**E13** (Capacitor sendo carregado através de um resistor — consistência da Lei de Ampère–Maxwell). Um capacitor de placas paralelas de área $A=8{,}0\,\text{cm}^2$ e separação $d=1{,}0\,\text{mm}$ é carregado, a partir do repouso, por uma fonte de tensão $V_0=12\,\text{V}$ através de um resistor $R=2{,}2\,\Omega$ em série (circuito RC). (a) Escreva a corrente de condução $I_{cond}(t)$ no fio de carga. (b) Escreva o campo elétrico $E(t)$ entre as placas em função da carga $Q(t)$ no capacitor, e a partir dele obtenha $I_d(t)=\varepsilon_0 A\,dE/dt$. (c) Mostre algebricamente que $I_d(t)=I_{cond}(t)$ para todo $t$, confirmando que a Lei de Ampère–Maxwell é consistente mesmo durante o transiente de carga (não apenas em regime estacionário).

**E14** (Síntese das quatro Equações de Maxwell). Um estudante afirma: "no vácuo, sem cargas nem correntes, todas as quatro equações de Maxwell são trivialmente satisfeitas por $\vec E=\vec B=0$, então elas não contêm informação física nova além dessa solução trivial." Critique essa afirmação, apresentando explicitamente **outra** solução não trivial das quatro equações no vácuo sem fontes (pode ser qualitativa, referenciando a Seção “De onde vêm as ondas — prévia da Parte 2”) e explique fisicamente o que essa segunda solução representa.

**E15** (Equação de onda para $\vec B$ — desafio). Na Seção “De onde vêm as ondas — prévia da Parte 2”, a equação de onda foi deduzida para o campo $\vec E$, tomando o rotacional da Lei de Faraday (III) e substituindo a Lei de Ampère–Maxwell (IV). **Deduza, por um procedimento inteiramente análogo (por simetria), a equação de onda para o campo $\vec B$**, partindo do rotacional da equação (IV) e substituindo a equação (III), no vácuo sem fontes. Mostre todos os passos (identidade vetorial do rotacional duplo, uso de $\nabla\cdot\vec B=0$) e verifique que a velocidade de propagação obtida é a mesma, $c=1/\sqrt{\mu_0\varepsilon_0}$.

**E16** (Teorema de Poynting em um resistor com corrente estacionária — desafio clássico). Um fio resistivo cilíndrico reto, de raio $a=2{,}0\,\text{mm}$, comprimento $L=30\,\text{cm}$ e resistência total $R=5{,}0\,\Omega$, conduz uma corrente estacionária $I=2{,}0\,\text{A}$. (a) Calcule o campo elétrico $E$ no interior do fio (paralelo ao eixo, uniforme), a partir de $E=IR/L$. (b) Calcule o campo magnético $H$ na superfície do fio (tangencial, circulando o fio), usando a Lei de Ampère. (c) Calcule o vetor de Poynting $\vec S=\vec E\times\vec H$ na superfície do fio, determine sua direção (para dentro ou para fora do fio) e calcule sua magnitude. (d) Integre $\vec S$ sobre a superfície lateral do cilindro para obter a potência total que entra no fio através do campo, e compare com a potência dissipada por efeito Joule $P=I^2R$. Comente o significado físico: de onde "vem", de fato, a energia dissipada no resistor?

**E17** (Intensidade de onda eletromagnética — vetor de Poynting). Uma onda eletromagnética plana no vácuo tem amplitude de campo elétrico $E_0=500\,\text{V/m}$. (a) Calcule a amplitude do campo magnético $B_0$. (b) Calcule a intensidade média (potência por unidade de área) transportada pela onda. (c) Se essa onda incide perpendicularmente sobre uma superfície perfeitamente absorvedora de área $2{,}0\,\text{cm}^2$, calcule a potência total absorvida.

**E18** (Potenciais retardados e fórmula de Larmor). Um elétron ($q=1{,}602\times10^{-19}\,\text{C}$) em um acelerador sofre uma aceleração instantânea $a=1{,}0\times10^{18}\,\text{m/s}^2$. (a) Calcule a potência total radiada, usando a fórmula de Larmor. (b) Explique, em termos dos potenciais retardados (Seção “Potenciais Retardados”), por que uma carga em **velocidade constante** não irradia energia, enquanto uma carga **acelerada** sim — relacione com a dependência em $1/r$ do campo de radiação vs. $1/r^2$ do campo "quase-estático" que acompanha a carga.

## Gabarito

**E1.** A área da espira é $A=\pi r^2 = \pi(0{,}05)^2 = 7{,}854\times10^{-3}\,\text{m}^2$. Como $B(t)=B_0+kt$ é uniforme e perpendicular à espira, o fluxo é $\Phi_B(t)=B(t)A=(B_0+kt)A$, logo $d\Phi_B/dt = kA$. Pela Lei de Faraday:
$$
|\varepsilon| = \left|\frac{d\Phi_B}{dt}\right| = kA = 3{,}0\times7{,}854\times10^{-3} \approx 2{,}36\times10^{-2}\,\text{V} = 23{,}6\,\text{mV}
$$
Como $k>0$, o fluxo (adotado, digamos, saindo da página) está **aumentando**. Pela Lei de Lenz, a corrente induzida deve se opor a esse aumento, criando um campo **entrando** na página no interior da espira — logo a corrente induzida circula no sentido **horário** (visto do lado de onde $\vec B$ sai).

**E2.** Com $\vec E = C(t)(y\hat x - x\hat y)$, temos $E_x = C(t)\,y$, $E_y=-C(t)\,x$, $E_z=0$. Calculando a componente $z$ do rotacional (as demais são nulas, pois $E_x,E_y$ não dependem de $z$ e $E_z=0$):
$$
(\nabla\times\vec E)_z = \frac{\partial E_y}{\partial x}-\frac{\partial E_x}{\partial y} = -C(t) - C(t) = -2C(t)
$$
Assim $\nabla\times\vec E = -2C(t)\,\hat z$. Por outro lado, $\vec B(t)=B_0\sin(\omega t)\hat z \Rightarrow \dfrac{\partial\vec B}{\partial t}=\omega B_0\cos(\omega t)\,\hat z$. Impondo a Lei de Faraday pontual:
$$
-2C(t)\,\hat z = -\omega B_0\cos(\omega t)\,\hat z \quad\Rightarrow\quad C(t) = \frac{1}{2}\omega B_0\cos(\omega t)
$$
Logo o campo elétrico induzido é:
$$
\boxed{\vec E(x,y,t) = \frac{1}{2}\omega B_0\cos(\omega t)\,(y\,\hat x - x\,\hat y)}
$$
Note que $\vec E$ é tangencial a círculos centrados na origem (perpendicular ao vetor posição no plano $xy$, pois $\vec E\cdot(x\hat x+y\hat y) = C(t)(yx-xy)=0$) — consistente com o padrão de campo elétrico induzido circulando em torno da direção de variação de $\vec B$, análogo às linhas de campo em um transformador.

**E3.** Enquanto o anel se aproxima do polo norte do ímã (por baixo, digamos), o fluxo através do anel (na direção que se afasta do ímã) aumenta em módulo à medida que o anel se aproxima da região de campo mais intenso; a fem induzida tem um sinal (Lei de Lenz: corrente se opõe ao aumento). Quando o anel passa pelo ímã e começa a se afastar, o fluxo começa a diminuir, e a fem **inverte de sinal** (a corrente induzida agora tenta manter o fluxo que está diminuindo). Portanto $\varepsilon(t)$ tem um pico em um sentido durante a aproximação, passa por zero aproximadamente quando o anel está no plano do ímã (fluxo máximo, $d\Phi/dt\approx0$), e tem um pico de sinal oposto durante o afastamento — um perfil tipo "onda bipolar" (positivo-zero-negativo, ou vice-versa dependendo da convenção). Em ambas as fases, pela Lei de Lenz, a força magnética sobre a corrente induzida no anel se opõe ao movimento relativo entre o anel e o ímã — na aproximação, repele o anel (freando a queda); no afastamento, atrai o anel de volta (também freando a queda). Isso é uma consequência direta da conservação de energia: a energia cinética perdida pelo anel (ele cai mais devagar que em queda livre) se converte em energia elétrica dissipada por efeito Joule na resistência do anel.

**E4.**
(a) $\varepsilon = B\ell v = 0{,}8\times0{,}40\times6{,}0 = 1{,}92\,\text{V}$.

(b) $I = \varepsilon/R = 1{,}92/2{,}0 = 0{,}96\,\text{A}$. Potência dissipada: $P=I^2R = (0{,}96)^2\times2{,}0 = 1{,}8432\,\text{W}$ (equivalentemente $P=\varepsilon I = 1{,}92\times0{,}96=1{,}8432\,\text{W}$).

(c) A corrente induzida na barra, imersa em $\vec B$, sofre força $F=BI\ell = 0{,}8\times0{,}96\times0{,}40 = 0{,}3072\,\text{N}$, dirigida (pela Lei de Lenz) **contra** o movimento da barra. Para manter $v$ constante, a força externa deve ter mesmo módulo e sentido oposto: $F_{ext}=0{,}3072\,\text{N}$. A potência mecânica fornecida é $P_{mec}=F_{ext}\,v = 0{,}3072\times6{,}0 = 1{,}8432\,\text{W}$, idêntica à potência dissipada calculada em (b) — confirma a conservação de energia (toda a potência mecânica se converte em dissipação Joule, já que a energia cinética da barra é constante).

**E5.** A área do circuito cresce a uma taxa $dA/dt = \ell v = 0{,}40\times6{,}0=2{,}4\,\text{m}^2/\text{s}$. Com $B$ uniforme e perpendicular ao circuito, $\Phi_B(t) = B\,A(t)$, logo:
$$
\left|\frac{d\Phi_B}{dt}\right| = B\frac{dA}{dt} = 0{,}8\times2{,}4 = 1{,}92\,\text{V}
$$
idêntico ao valor de $\varepsilon=B\ell v$ obtido em E4(a) via força de Lorentz — confirmando a equivalência entre as duas descrições (Seção “Consistência com a Lei de Faraday integral”).

**E6.** (a) Considere um elemento radial do disco a uma distância $s$ do centro ($0\le s\le a$), girando com velocidade tangencial $v(s)=\omega s$. A força de Lorentz por unidade de carga sobre os portadores nesse ponto é $|\vec v\times\vec B| = \omega s B$, dirigida radialmente (ao longo do raio, já que $\vec v$ é tangencial e $\vec B$ é axial, $\vec v\times\vec B$ aponta ao longo de $\hat s$). A fem entre o centro e a borda é a integral dessa força efetiva ao longo do raio:
$$
\varepsilon = \int_0^a (\vec v\times\vec B)\cdot d\vec s = \int_0^a \omega s B\,ds = \omega B\int_0^a s\,ds = \omega B\frac{a^2}{2}
$$
$$
\boxed{\varepsilon = \frac{1}{2}B\omega a^2}
$$
(b) Numericamente: $\varepsilon = \tfrac12\times0{,}5\times100\times(0{,}1)^2 = \tfrac12\times0{,}5\times100\times0{,}01 = 0{,}25\,\text{V}$.

**E7.**
(a) $L = \dfrac{\mu_0N^2A}{\ell} = \dfrac{4\pi\times10^{-7}\times(800)^2\times3{,}0\times10^{-4}}{0{,}20}$.

Calculando passo a passo: $N^2=6{,}4\times10^5$; $\mu_0N^2 = 4\pi\times10^{-7}\times6{,}4\times10^5 = 0{,}8043\,\text{H/m}$; multiplicando por $A=3{,}0\times10^{-4}\,\text{m}^2$: $0{,}8043\times3{,}0\times10^{-4}=2{,}413\times10^{-4}$; dividindo por $\ell=0{,}20\,\text{m}$:
$$
L = \frac{2{,}413\times10^{-4}}{0{,}20} = 1{,}206\times10^{-3}\,\text{H} \approx 1{,}21\,\text{mH}
$$
(b) $\varepsilon(t) = -L\,dI/dt$, com $I(t)=I_0(1-e^{-t/\tau})\Rightarrow dI/dt = \dfrac{I_0}{\tau}e^{-t/\tau}$.

Em $t=0$: $dI/dt|_{t=0} = I_0/\tau = 2{,}0/0{,}010 = 200\,\text{A/s}$, logo $\varepsilon(0) = -L\times200 = -1{,}206\times10^{-3}\times200 \approx -0{,}241\,\text{V}$ (módulo $0{,}241\,\text{V}$).

No limite $t\to\infty$: $I(t)\to I_0$ (constante), $dI/dt\to0$, logo $\varepsilon\to0$ — não há mais fem autoinduzida quando a corrente atinge o regime estacionário.

**E8.**
(a) O campo dentro do solenoide (comprimento $\ell_1$, $N_1$ espiras) é $B_1 = \mu_0(N_1/\ell_1)I_1$. O fluxo através de uma espira da bobina interna é $\Phi_{1esp}=B_1A_2$ (a bobina "vê" o campo do solenoide em sua própria área $A_2$, menor que $A_1$). O fluxo concatenado nas $N_2$ espiras:
$$
\Phi_{21} = N_2 B_1 A_2 = N_2\,\mu_0\frac{N_1}{\ell_1}I_1\,A_2 \quad\Rightarrow\quad M = \frac{\Phi_{21}}{I_1} = \frac{\mu_0N_1N_2A_2}{\ell_1}
$$
Numericamente: $\mu_0 N_1 N_2 = 4\pi\times10^{-7}\times1000\times50 = 4\pi\times10^{-7}\times5\times10^4 = 6{,}283\times10^{-2}$; multiplicando por $A_2=1{,}0\times10^{-4}\,\text{m}^2$: $6{,}283\times10^{-6}$; dividindo por $\ell_1=0{,}25\,\text{m}$:
$$
M = \frac{6{,}283\times10^{-6}}{0{,}25} = 2{,}513\times10^{-5}\,\text{H} \approx 25{,}1\,\mu\text{H}
$$
(b) $\varepsilon_2 = -M\,dI_1/dt = -2{,}513\times10^{-5}\times150 \approx -3{,}77\times10^{-3}\,\text{V} = -3{,}77\,\text{mV}$ (módulo $3{,}77\,\text{mV}$).

**E9.** Na fórmula de Neumann,
$$
M_{21} = \frac{\mu_0}{4\pi}\oint_{C_1}\oint_{C_2}\frac{d\vec\ell_1\cdot d\vec\ell_2}{|\vec r_2-\vec r_1|}
$$
o integrando depende apenas de: (i) o produto escalar $d\vec\ell_1\cdot d\vec\ell_2$, que é simétrico na troca $1\leftrightarrow2$ (produto escalar não tem "direção preferencial"); e (ii) a distância $|\vec r_2-\vec r_1|=|\vec r_1-\vec r_2|$, também simétrica. Trocar os rótulos $1\leftrightarrow2$ simplesmente troca a ordem das integrais duplas (que comutam) sem alterar o valor da integral. Logo $M_{21}=M_{12}$ **por construção**, sem necessidade de calcular a integral explicitamente para uma geometria particular. Fisicamente, isso é notável porque a "rota de cálculo" natural para $M_{21}$ (fluxo de $\vec B_1$ através de $C_2$) e para $M_{12}$ (fluxo de $\vec B_2$ através de $C_1$) parecem, a princípio, processos geometricamente muito diferentes — envolvem campos magnéticos com distribuições espaciais distintas produzidos por correntes em circuitos de formas arbitrárias — e ainda assim o coeficiente de acoplamento resulta idêntico. Esse é o fundamento físico de que um transformador "funciona igualmente bem" transferindo energia do primário para o secundário ou (em princípio) do secundário para o primário, usando o mesmo $M$.

**E10.**
(a) $L = \dfrac{\mu_0N^2A}{2\pi R_m} = \dfrac{4\pi\times10^{-7}\times(600)^2\times5{,}0\times10^{-4}}{2\pi\times0{,}15}$.

$N^2=3{,}6\times10^5$; $\mu_0N^2=4\pi\times10^{-7}\times3{,}6\times10^5=0{,}4524\,\text{H/m}$; $\times A = 0{,}4524\times5{,}0\times10^{-4}=2{,}262\times10^{-4}$; $2\pi R_m = 2\pi\times0{,}15=0{,}9425\,\text{m}$:
$$
L = \frac{2{,}262\times10^{-4}}{0{,}9425} = 2{,}400\times10^{-4}\,\text{H} = 0{,}240\,\text{mH}
$$
(b) $U=\tfrac12LI^2 = \tfrac12\times2{,}400\times10^{-4}\times(3{,}0)^2 = \tfrac12\times2{,}400\times10^{-4}\times9{,}0 = 1{,}080\times10^{-3}\,\text{J} = 1{,}08\,\text{mJ}$.

(c) $B = \mu_0\dfrac{N}{2\pi R_m}I = 4\pi\times10^{-7}\times\dfrac{600}{0{,}9425}\times3{,}0$.

$N/(2\pi R_m) = 600/0{,}9425 = 636{,}6\,\text{m}^{-1}$; $\mu_0\times636{,}6 = 4\pi\times10^{-7}\times636{,}6 = 8{,}0\times10^{-4}\,\text{T/A}$; $\times I=3{,}0$: $B=2{,}400\times10^{-3}\,\text{T}$.

$u_B = B^2/(2\mu_0) = (2{,}400\times10^{-3})^2/(2\times4\pi\times10^{-7}) = 5{,}76\times10^{-6}/(2{,}513\times10^{-6}) = 2{,}292\,\text{J/m}^3$.

Volume: $V=A\times2\pi R_m = 5{,}0\times10^{-4}\times0{,}9425 = 4{,}712\times10^{-4}\,\text{m}^3$.

$U = u_B V = 2{,}292\times4{,}712\times10^{-4} = 1{,}080\times10^{-3}\,\text{J} = 1{,}08\,\text{mJ}$ — **idêntico** ao valor de (b), confirmando a consistência entre a energia "de circuito" e a energia "de campo".

**E11.**
(a) A carga no capacitor cresce a taxa $dQ/dt=I$ (corrente de condução constante). O campo entre as placas é $E=\sigma/\varepsilon_0 = Q/(\varepsilon_0\,\pi R^2)$, logo:
$$
\frac{dE}{dt} = \frac{1}{\varepsilon_0\pi R^2}\frac{dQ}{dt} = \frac{I}{\varepsilon_0\pi R^2}
$$
Com $\pi R^2 = \pi(0{,}03)^2 = 2{,}827\times10^{-3}\,\text{m}^2$:
$$
\frac{dE}{dt} = \frac{5{,}0\times10^{-4}}{8{,}854\times10^{-12}\times2{,}827\times10^{-3}} = \frac{5{,}0\times10^{-4}}{2{,}503\times10^{-14}} \approx 2{,}00\times10^{10}\,\text{V/(m·s)}
$$
(b) $J_d = \varepsilon_0\,dE/dt = 8{,}854\times10^{-12}\times2{,}00\times10^{10} \approx 0{,}1771\,\text{A/m}^2$.

$I_d = J_d\cdot\pi R^2 = 0{,}1771\times2{,}827\times10^{-3} \approx 5{,}00\times10^{-4}\,\text{A} = 0{,}50\,\text{mA}$ — igual a $I$, como esperado (por construção, já que $J_d$ foi obtido diretamente de $dQ/dt=I$).

(c) Por simetria cilíndrica (eixo do capacitor), aplicando a Lei de Ampère–Maxwell a um círculo amperiano de raio $r=1{,}5\,\text{cm}<R$ no espaço entre as placas (sem corrente de condução ali, apenas de deslocamento, uniforme dentro do raio $R$):
$$
B(2\pi r) = \mu_0\varepsilon_0\frac{dE}{dt}(\pi r^2) \quad\Rightarrow\quad B = \frac{\mu_0\varepsilon_0\,r}{2}\frac{dE}{dt}
$$
Numericamente: $\mu_0\varepsilon_0 = 1/c^2 \approx 1{,}113\times10^{-17}\,\text{s}^2/\text{m}^2$; $B = \dfrac{1{,}113\times10^{-17}\times0{,}015}{2}\times2{,}00\times10^{10}$.

$\dfrac{1{,}113\times10^{-17}\times0{,}015}{2} = 8{,}35\times10^{-20}$; $\times2{,}00\times10^{10} = 1{,}67\times10^{-9}\,\text{T}$ — um campo magnético extremamente pequeno (nanotesla), consistente com o fato de correntes de deslocamento típicas de laboratório gerarem campos magnéticos muito fracos.

**E12.**
(a) $\omega = 2\pi f = 2\pi\times60 = 376{,}99\,\text{rad/s}$.
$$
J_{d,\text{máx}} = \varepsilon_0 E_0\omega = 8{,}854\times10^{-12}\times1{,}0\times10^5\times376{,}99 \approx 3{,}338\times10^{-4}\,\text{A/m}^2
$$
(b) $\omega' = 2\pi\times1{,}0\times10^6 = 6{,}283\times10^6\,\text{rad/s}$.
$$
J_{d,\text{máx}}' = \varepsilon_0 E_0\omega' = 8{,}854\times10^{-12}\times1{,}0\times10^5\times6{,}283\times10^6 \approx 5{,}563\,\text{A/m}^2
$$
A razão entre as duas densidades é exatamente a razão das frequências, $10^6/60\approx1{,}667\times10^4$ — confirmando que $J_d\propto\omega$. Em 60 Hz, a densidade de corrente de deslocamento é ínfima (frações de mA/m²), praticamente irrelevante frente a correntes de condução típicas; em 1 MHz (faixa de rádio), $J_d$ já atinge alguns A/m², comparável a densidades de corrente de condução moderadas. Isso ilustra por que a corrente de deslocamento é crucial para o comportamento de campos em altas frequências (radiação, ondas, capacitores em circuitos de RF) mas é seguramente desprezada em circuitos de corrente alternada de baixa frequência (rede elétrica).

**E13.**
(a) O circuito RC em carga tem corrente de condução (decaindo exponencialmente a partir do fechamento da chave):
$$
I_{cond}(t) = \frac{V_0}{R}e^{-t/(RC)}, \qquad RC = 2{,}2\times C
$$
(b) A carga no capacitor é $Q(t) = CV_0(1-e^{-t/(RC)})$, logo o campo entre as placas:
$$
E(t) = \frac{Q(t)}{\varepsilon_0 A} = \frac{CV_0}{\varepsilon_0A}\left(1-e^{-t/(RC)}\right)
$$
Derivando:
$$
\frac{dE}{dt} = \frac{CV_0}{\varepsilon_0A}\cdot\frac{1}{RC}e^{-t/(RC)} = \frac{V_0}{\varepsilon_0AR}e^{-t/(RC)}
$$
$$
I_d(t) = \varepsilon_0A\frac{dE}{dt} = \frac{V_0}{R}e^{-t/(RC)}
$$
(c) Comparando diretamente as expressões de (a) e (b):
$$
I_d(t) = \frac{V_0}{R}e^{-t/(RC)} = I_{cond}(t) \quad\forall\, t\ge0
$$
As duas correntes são **identicamente iguais em todo instante**, não apenas em regime estacionário ou no instante inicial — confirmando que a Lei de Ampère–Maxwell é consistente durante todo o transiente de carga, e não apenas em um caso particular. Isso é uma verificação mais forte do que a análise "antes/depois" da Seção “Verificação: capacitor sendo carregado”: aqui mostramos a igualdade **para toda a função do tempo** $I_d(t)=I_{cond}(t)$, e não apenas em um instante fixo.

**E14.** A afirmação do estudante é falsa. Embora $\vec E=\vec B=0$ seja de fato uma solução trivial das equações de Maxwell no vácuo sem fontes, essas equações **também** admitem soluções ondulatórias não triviais. Como mostrado na Seção “De onde vêm as ondas — prévia da Parte 2”, tomando o rotacional da Lei de Faraday e substituindo a Lei de Ampère–Maxwell, obtém-se $\nabla^2\vec E = \mu_0\varepsilon_0\,\partial^2\vec E/\partial t^2$ — uma equação de onda, cuja solução geral inclui ondas planas do tipo $\vec E(\vec r,t) = \vec E_0\cos(\vec k\cdot\vec r-\omega t)$, com $\omega/k=c=1/\sqrt{\mu_0\varepsilon_0}$, perfeitamente compatíveis com $\nabla\cdot\vec E=0$ e as demais equações (desde que $\vec E_0\perp\vec k$ e $\vec B$ correspondente seja construído via $\nabla\times\vec E=-\partial\vec B/\partial t$). Essa segunda solução representa **radiação eletromagnética livre se propagando** — luz, ondas de rádio, etc. — um fenômeno fisicamente riquíssimo que não existiria se a única solução fosse a trivial. As equações de Maxwell, portanto, "contêm" toda a teoria da propagação de ondas eletromagnéticas, e não apenas o caso estático nulo.

**E15.** Partindo das equações de Maxwell no vácuo, sem fontes (Seção “Forma no vácuo, sem fontes”):
$$
\nabla\times\vec{E} = -\frac{\partial\vec{B}}{\partial t} \qquad\text{(III)} \qquad\qquad \nabla\times\vec{B} = \mu_0\varepsilon_0\frac{\partial\vec{E}}{\partial t} \qquad\text{(IV)}
$$
Tomamos o rotacional de ambos os lados da equação (IV):
$$
\nabla\times(\nabla\times\vec{B}) = \mu_0\varepsilon_0\,\nabla\times\frac{\partial\vec{E}}{\partial t} = \mu_0\varepsilon_0\frac{\partial}{\partial t}(\nabla\times\vec{E})
$$
(a troca da ordem entre $\nabla\times$ e $\partial/\partial t$ é válida pois são operações independentes, uma no espaço e outra no tempo). Substituindo a equação (III) no lado direito:
$$
\nabla\times(\nabla\times\vec{B}) = \mu_0\varepsilon_0\frac{\partial}{\partial t}\left(-\frac{\partial\vec{B}}{\partial t}\right) = -\mu_0\varepsilon_0\frac{\partial^2\vec{B}}{\partial t^2}
$$
Usando a identidade vetorial $\nabla\times(\nabla\times\vec{B}) = \nabla(\nabla\cdot\vec{B}) - \nabla^2\vec{B}$ (arquivo 4) e a Lei de Gauss magnética, $\nabla\cdot\vec{B}=0$ (válida **sempre**, com ou sem fontes — Seção “As quatro equações (forma pontual/diferencial), em meios materiais”, equação II):
$$
\nabla\times(\nabla\times\vec{B}) = -\nabla^2\vec{B}
$$
Igualando as duas expressões:
$$
-\nabla^2\vec{B} = -\mu_0\varepsilon_0\frac{\partial^2\vec{B}}{\partial t^2}
$$
$$
\boxed{\nabla^2\vec{B} = \mu_0\varepsilon_0\frac{\partial^2\vec{B}}{\partial t^2}}
$$
Esta é a equação de onda tridimensional para $\vec B$, com a mesma estrutura matemática da equação obtida para $\vec E$ na Seção “De onde vêm as ondas — prévia da Parte 2”. Comparando com a forma padrão de uma equação de onda, $\nabla^2\psi = \dfrac{1}{v^2}\dfrac{\partial^2\psi}{\partial t^2}$, identificamos $1/v^2=\mu_0\varepsilon_0$, logo:
$$
v = \frac{1}{\sqrt{\mu_0\varepsilon_0}} = c
$$
a mesma velocidade de propagação obtida para $\vec E$ — como era fisicamente necessário, já que $\vec E$ e $\vec B$ em uma onda eletromagnética estão acoplados pelas próprias equações de Maxwell (um não pode se propagar a uma velocidade diferente do outro) e formam, juntos, uma única onda eletromagnética que se propaga a $c\approx2{,}998\times10^8\,\text{m/s}$.

**E16.**
(a) $E = \dfrac{IR}{L} = \dfrac{2{,}0\times5{,}0}{0{,}30} = \dfrac{10}{0{,}30} = 33{,}33\,\text{V/m}$, dirigido ao longo do eixo do fio (na direção da corrente, pois $\vec E=\rho_{res}\vec J$ com $\vec J$ axial).

(b) Pela Lei de Ampère aplicada a um círculo amperiano de raio $a$ concêntrico ao fio, na superfície:
$$
H(2\pi a) = I \quad\Rightarrow\quad H = \frac{I}{2\pi a} = \frac{2{,}0}{2\pi\times0{,}002} = \frac{2{,}0}{0{,}01257} \approx 159{,}15\,\text{A/m}
$$
tangencial, circulando o fio (sentido dado pela regra da mão direita em relação a $I$).

(c) Na superfície do fio, $\vec E$ é axial ($\hat z$, digamos) e $\vec H$ é azimutal ($\hat\phi$). O vetor de Poynting:
$$
\vec S = \vec E\times\vec H = E\hat z \times H\hat\phi = EH\,(\hat z\times\hat\phi) = -EH\,\hat r
$$
(usando $\hat z\times\hat\phi=-\hat r$ em coordenadas cilíndricas). Ou seja, $\vec S$ aponta **radialmente para dentro** do fio — o campo eletromagnético transporta energia **do espaço ao redor do fio para dentro do fio**. Magnitude:
$$
S = EH = 33{,}33\times159{,}15 \approx 5305{,}2\,\text{W/m}^2
$$
(d) A área lateral do cilindro é $A_{lat}=2\pi a L = 2\pi\times0{,}002\times0{,}30 = 3{,}770\times10^{-3}\,\text{m}^2$. Como $\vec S$ é uniforme e radial (para dentro) em toda a superfície lateral, a potência total que entra:
$$
P_{entra} = S\cdot A_{lat} = 5305{,}2\times3{,}770\times10^{-3} \approx 20{,}0\,\text{W}
$$
Comparando com a potência Joule: $P_{Joule}=I^2R = (2{,}0)^2\times5{,}0 = 20{,}0\,\text{W}$ — **os dois valores coincidem exatamente**. Isso confirma, de forma quantitativa, o resultado conceitualmente contraintuitivo do Teorema de Poynting: a energia dissipada em um resistor percorrido por corrente estacionária **não** "flui ao longo do fio" através das cargas em movimento — ela flui **radialmente para dentro, através do campo eletromagnético que envolve o fio** (o campo elétrico axial dentro do fio, combinado ao campo magnético azimutal fora dele, produzido pela própria corrente), entrando pela superfície lateral e sendo dissipada uniformemente ao longo do volume do condutor. O papel da corrente elétrica é estabelecer os campos $\vec E$ e $\vec H$; é o campo eletromagnético, e não o movimento das cargas em si, que efetivamente "carrega" a energia até o local onde ela é dissipada.

**E17.**
(a) $B_0 = E_0/c = 500/(2{,}998\times10^8) \approx 1{,}668\times10^{-6}\,\text{T} = 1{,}668\,\mu\text{T}$.

(b) $\langle S\rangle = \dfrac{E_0^2}{2\eta_0} = \dfrac{(500)^2}{2\times377} = \dfrac{2{,}5\times10^5}{754} \approx 331{,}6\,\text{W/m}^2$.

(c) $P = \langle S\rangle\times A = 331{,}6\times2{,}0\times10^{-4} \approx 0{,}0663\,\text{W} = 66{,}3\,\text{mW}$.

**E18.**
(a) Pela fórmula de Larmor:
$$
P = \frac{q^2a^2}{6\pi\varepsilon_0c^3}
$$
Calculando numerador: $q^2 = (1{,}602\times10^{-19})^2 = 2{,}566\times10^{-38}\,\text{C}^2$; $a^2 = (1{,}0\times10^{18})^2 = 1{,}0\times10^{36}\,\text{m}^2/\text{s}^4$; $q^2a^2 = 2{,}566\times10^{-2}$.

Denominador: $c^3 = (2{,}998\times10^8)^3 \approx 2{,}694\times10^{25}\,\text{m}^3/\text{s}^3$; $6\pi\varepsilon_0 = 6\pi\times8{,}854\times10^{-12} \approx 1{,}669\times10^{-10}$; $6\pi\varepsilon_0c^3 \approx 1{,}669\times10^{-10}\times2{,}694\times10^{25} \approx 4{,}497\times10^{15}$.

$$
P = \frac{2{,}566\times10^{-2}}{4{,}497\times10^{15}} \approx 5{,}71\times10^{-18}\,\text{W}
$$

(b) Os potenciais retardados de uma carga têm, em geral, duas contribuições: um termo que acompanha a carga "quase-estaticamente" (generalização do campo de Coulomb, decaindo como $1/r^2$ no campo, e que depende da posição e velocidade retardadas) e um termo de **radiação**, proporcional à **aceleração** retardada da carga, que decai apenas como $1/r$ no campo (logo a intensidade, proporcional ao quadrado do campo, decai como $1/r^2$, permitindo energia finita fluindo através de esferas cada vez maiores — energia que efetivamente "escapa" para o infinito). Se a carga tem velocidade constante (aceleração nula), o termo de radiação é identicamente nulo — os potenciais retardados reduzem-se a uma versão apenas "atrasada no tempo" do campo eletrostático que acompanha a carga rigidamente, sem energia líquida se desprendendo para o infinito (o campo "viaja junto" com a carga, análogo a um referencial em que a carga está em repouso). Somente quando há aceleração surge o termo que decai como $1/r$, permitindo que o fluxo de energia (vetor de Poynting integrado sobre uma esfera de raio $r\to\infty$) seja não nulo e finito — esse é precisamente o mecanismo físico por trás da fórmula de Larmor, e a razão fundamental pela qual apenas cargas aceleradas irradiam.
