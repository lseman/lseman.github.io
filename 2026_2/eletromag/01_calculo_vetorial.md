# Cálculo Vetorial para Eletromagnetismo

> Eletromagnetismo — Apostila de Curso
> Tópicos: Campos Escalares e Vetoriais · Gradiente · Divergente · Rotacional · Laplaciano · Sistemas de Coordenadas Curvilíneas · Identidades Vetoriais · Teorema de Helmholtz · Teorema da Unicidade

---

## Objetivos de Aprendizagem

Ao final deste capítulo, você será capaz de:

- [ ] Interpretar fisicamente os operadores **gradiente**, **divergente** e **rotacional**.
- [ ] Calcular esses operadores em coordenadas cartesianas, cilíndricas e esféricas.
- [ ] Aplicar o **Teorema do Divergente** e o **Teorema de Stokes** a campos vetoriais.
- [ ] Verificar identidades vetoriais fundamentais usando cálculo simbólico e numérico.
- [ ] Decompor campos vetoriais usando o **Teorema de Helmholtz**.

---

## Antes de começar

Ao final, você deve interpretar gradiente, divergente e rotacional, trocar corretamente entre coordenadas cartesianas, cilíndricas e esféricas e aplicar Gauss, Stokes, Helmholtz e Unicidade. **Diagnóstico:** um campo com divergente e rotacional nulos precisa ser nulo? **Evidência mínima:** calcular os operadores em campos de teste e verificar uma identidade vetorial e um teorema integral.

## Sumário

1. [Campos Escalares e Vetoriais](#campos-escalares-e-vetoriais)
2. [Álgebra Vetorial Básica](#álgebra-vetorial-básica)
3. [O Operador Nabla e o Gradiente](#o-operador-nabla-e-o-gradiente)
4. [Divergente](#divergente)
5. [Rotacional](#rotacional)
6. [Laplaciano](#laplaciano)
7. [Elementos Diferenciais e Integrais](#elementos-diferenciais-e-integrais)
8. [Sistemas de Coordenadas Curvilíneas](#sistemas-de-coordenadas-curvilíneas)
9. [Identidades Vetoriais Fundamentais](#identidades-vetoriais-fundamentais)
10. [Teorema de Helmholtz](#teorema-de-helmholtz)
11. [Teorema da Unicidade (prova completa)](#teorema-da-unicidade-prova-completa)
12. [Classificação de Campos Vetoriais](#classificação-de-campos-vetoriais)
13. [Exercícios Resolvidos em Python](#exercícios-resolvidos-em-python)
14. [Lista de Exercícios Propostos](#lista-de-exercícios-propostos)
15. [Gabarito](#gabarito)

---

## Intuição Física: Por que Cálculo Vetorial?

Antes de mergulhar nas fórmulas, é essencial entender **por que** o cálculo vetorial é a linguagem natural do eletromagnetismo:

- **Campos escalares** (como temperatura ou potencial elétrico) descrevem "o que" existe em cada ponto do espaço.
- **Campos vetoriais** (como campo elétrico ou magnético) descrevem "como" uma carga de teste seria afetada em cada ponto.
- O **gradiente** nos diz "para onde e quão rápido" um escalar muda.
- O **divergente** nos diz "onde há fontes ou sorvedouros" de um campo.
- O **rotacional** nos diz "onde o campo gira" ou circula.

Esses três operadores, combinados com os teoremas de Gauss e Stokes, formam a base matemática para todas as quatro equações de Maxwell.

---

## Aplicações no Mundo Real

| Conceito | Aplicação Prática |
|---|---|
| Gradiente | Projeto de antenas e otimização de cobertura de sinal |
| Divergente | Análise de fluxo de corrente em circuitos e redes elétricas |
| Rotacional | Projeto de motores elétricos e geradores |
| Teorema de Gauss | Cálculo de campos em capacitores e blindagem eletrostática |
| Teorema de Stokes | Análise de indução eletromagnética em transformadores |

---

## Campos Escalares e Vetoriais

Um **campo escalar** $f(\vec r)$ associa um número a cada ponto do espaço (ex.: temperatura, potencial elétrico $V$). Um **campo vetorial** $\vec F(\vec r)$ associa um vetor a cada ponto (ex.: campo elétrico $\vec E$, campo magnético $\vec B$).

Todo o eletromagnetismo desta apostila é escrito em termos de **três operadores diferenciais** atuando sobre esses campos — gradiente, divergente e rotacional — e de **dois teoremas integrais** que os conectam a integrais de superfície/linha — o Teorema do Divergente e o Teorema de Stokes. Este arquivo define esses objetos com cuidado antes de usá-los livremente no restante do curso.

---

## Álgebra Vetorial Básica

### Vetores e Escalares

Um **escalar** é uma grandeza que possui apenas magnitude (ex.: massa, temperatura, potencial elétrico). Um **vetor** possui magnitude, direção e sentido (ex.: deslocamento, velocidade, campo elétrico).

### Vetor Unitário

Um **vetor unitário** (ou versor) é um vetor de magnitude igual a 1. Os versores cartesianos padrão são $\hat{x}, \hat{y}, \hat{z}$ (ou $\hat{u}_x, \hat{u}_y, \hat{u}_z$), que apontam nas direções positivas dos eixos coordenados.

Para qualquer vetor $\vec A \neq \vec 0$, o vetor unitário na direção de $\vec A$ é:

$$
\hat{a}_A = \frac{\vec A}{|\vec A|}
$$

### Adição e Subtração de Vetores

A soma de dois vetores $\vec A$ e $\vec B$ é dada por:

$$
\vec C = \vec A + \vec B
$$

Geometricamente, isso corresponde à regra do paralelogramo ou da poligonal.

### Produto Vetorial

**Produto escalar (dot product):**

$$
\vec A \cdot \vec B = |\vec A||\vec B|\cos\theta = A_xB_x + A_yB_y + A_zB_z
$$

Resultado: um **escalar**.

**Produto vetorial (cross product):**

$$
\vec A \times \vec B = |\vec A||\vec B|\sin\theta\,\hat{n}
$$

onde $\hat{n}$ é o versor perpendicular ao plano formado por $\vec A$ e $\vec B$, dado pela regra da mão direita.

Resultado: um **vetor**.

---

## O Operador Nabla e o Gradiente

### Definição do gradiente

::: definição
**Definição 1.** Para um campo escalar $f(x,y,z)$, o **gradiente** é o campo vetorial:

$$
\boxed{\nabla f \equiv \frac{\partial f}{\partial x}\hat{x}+\frac{\partial f}{\partial y}\hat{y}+\frac{\partial f}{\partial z}\hat{z}}
$$
:::

### Dedução da interpretação geométrica

A variação de $f$ ao longo de um deslocamento infinitesimal arbitrário $d\vec\ell = dx\,\hat x+dy\,\hat y+dz\,\hat z$ é, pela regra da cadeia:

$$
df = \frac{\partial f}{\partial x}dx+\frac{\partial f}{\partial y}dy+\frac{\partial f}{\partial z}dz = \nabla f\cdot d\vec\ell
$$

Escrevendo $d\vec\ell = d\ell\,\hat u$ com $\hat u$ um versor de direção arbitrária:

$$
\frac{df}{d\ell} = \nabla f\cdot\hat u = |\nabla f|\cos\theta
$$

onde $\theta$ é o ângulo entre $\nabla f$ e $\hat u$. Esta taxa de variação (a **derivada direcional**) é **máxima** quando $\theta=0$, isto é, quando $\hat u$ aponta na direção de $\nabla f$. Conclusão:

$$
\boxed{\nabla f \text{ aponta na direção de máximo crescimento de } f\text{, com módulo igual a essa taxa máxima.}}
$$

::: corolário
**Corolário 1.** $\nabla f$ é sempre perpendicular às superfícies de nível $f=\text{const}$ (pois ao longo dessas superfícies $df=0$, logo $\nabla f\cdot d\vec\ell=0$ para todo $d\vec\ell$ tangente à superfície — só é possível se $\nabla f$ for normal a ela). Esta é exatamente a razão pela qual as linhas de campo $\vec E=-\nabla V$ são perpendiculares às superfícies equipotenciais (arquivo 2, Seção “Vetor Unitário”.2).
:::

### Visualização Python — gradiente e curvas de nível

```python
import numpy as np
import matplotlib.pyplot as plt
x = y = np.linspace(-2, 2, 25)
X, Y = np.meshgrid(x, y)
f, gx, gy = X**2 + 2*Y**2, 2*X, 4*Y
plt.contour(X, Y, f, levels=10)
plt.quiver(X[::2, ::2], Y[::2, ::2],
           gx[::2, ::2], gy[::2, ::2])
plt.axis("equal")
print("grad f(1,1) =", (2, 4))
```

::: verificacao
**Verificação Rápida (Concept Check):**  
1. As setas do gradiente são perpendiculares às curvas de nível? **Sim.**  
2. Onde as curvas de nível estão mais próximas, o gradiente é maior ou menor? **Maior** (variação mais rápida).  
3. O gradiente aponta para valores maiores ou menores de $f$? **Maiores.**
:::

::: exemplo
**Exemplo 4.** Seja $f(x,y,z) = xyz$. O gradiente é:

$$
\nabla f = yz\,\hat x + xz\,\hat y + xy\,\hat z
$$

No ponto $(1,1,1)$: $\nabla f(1,1,1) = \hat x + \hat y + \hat z$.
:::

### Operador nabla

::: definição
**Definição 2.** É conveniente definir o **operador vetorial diferencial nabla**:

$$
\nabla \equiv \hat{x}\frac{\partial}{\partial x}+\hat{y}\frac{\partial}{\partial y}+\hat{z}\frac{\partial}{\partial z}
$$
:::

que se comporta simultaneamente como vetor e como operador diferencial. O gradiente é $\nabla$ atuando sobre um escalar por "multiplicação"; o divergente e o rotacional (a seguir) são $\nabla$ atuando sobre um vetor por produto escalar e produto vetorial, respectivamente.

::: exemplo
**Exemplo 1.** Seja $f(x,y,z) = x^2y + z^3$. O gradiente é:

$$
\nabla f = \frac{\partial f}{\partial x}\hat{x}+\frac{\partial f}{\partial y}\hat{y}+\frac{\partial f}{\partial z}\hat{z} = (2xy)\hat{x} + (x^2)\hat{y} + (3z^2)\hat{z}
$$

Em $(1,2,1)$: $\nabla f(1,2,1) = (4)\hat{x} + (1)\hat{y} + (3)\hat{z}$.
:::

---

## Elementos Diferenciais e Integrais

### Elementos Diferenciais de Comprimento, Área e Volume

Em coordenadas cartesianas, os elementos diferenciais são:

- **Comprimento infinitesimal**: $d\vec\ell = dx\,\hat x + dy\,\hat y + dz\,\hat z$
- **Elemento de área**: $d\vec A = dy\,dz\,\hat x + dx\,dz\,\hat y + dx\,dy\,\hat z$
- **Elemento de volume**: $dV = dx\,dy\,dz$

### Integrais de Linha, Superfície e Volume

**Integral de linha:**

$$
\int_C \vec F \cdot d\vec\ell
$$

mede a circulação do campo ao longo de uma curva $C$.

**Integral de superfície:**

$$
\int_S \vec F \cdot d\vec A
$$

mede o fluxo do campo através de uma superfície $S$.

**Integral de volume:**

$$
\int_V f\,dV
$$

soma uma grandeza escalar sobre um volume $V$.

---

## Divergente

### Definição

::: definição
**Definição 3.** Para um campo vetorial $\vec F = F_x\hat x+F_y\hat y+F_z\hat z$:

$$
\boxed{\nabla\cdot\vec F \equiv \frac{\partial F_x}{\partial x}+\frac{\partial F_y}{\partial y}+\frac{\partial F_z}{\partial z}}
$$
:::

um **campo escalar**.

::: exemplo
**Exemplo 2.** Seja $\vec F = (x^2,\,2xy,\,-z^2)$. O divergente é:

$$
\nabla\cdot\vec F = \frac{\partial}{\partial x}(x^2)+\frac{\partial}{\partial y}(2xy)+\frac{\partial}{\partial z}(-z^2) = 2x + 2x - 2z = 4x-2z
$$

O campo tem fontes onde $4x-2z\neq0$, isto é, em quase todo ponto exceto no plano $z=2x$.
:::

### Dedução da interpretação física (fluxo por unidade de volume)

Considere um cubo infinitesimal de lados $dx,dy,dz$, centrado em $(x,y,z)$. O fluxo de $\vec F$ saindo pela face direita ($x+dx/2$) menos o que entra pela face esquerda ($x-dx/2$):

$$
d\Phi_x = \left[F_x\!\left(x+\tfrac{dx}{2}\right)-F_x\!\left(x-\tfrac{dx}{2}\right)\right]dy\,dz \approx \frac{\partial F_x}{\partial x}\,dx\,dy\,dz
$$

(expandindo em série de Taylor e mantendo o termo linear). Somando as contribuições análogas nas direções $y$ e $z$, o fluxo líquido saindo do cubo é:

$$
d\Phi = \left(\frac{\partial F_x}{\partial x}+\frac{\partial F_y}{\partial y}+\frac{\partial F_z}{\partial z}\right)dV = (\nabla\cdot\vec F)\,dV
$$

Logo:

$$
\boxed{\nabla\cdot\vec F = \lim_{\Delta V\to0}\frac{1}{\Delta V}\oint_{\partial(\Delta V)}\vec F\cdot d\vec A}
$$

O divergente mede a **densidade volumétrica de fontes** do campo: positivo onde o campo "emana" (fonte), negativo onde "converge" (sorvedouro), nulo onde o que entra é igual ao que sai.

### Visualização Python — fontes e sorvedouros

```python
import numpy as np
import matplotlib.pyplot as plt
x = y = np.linspace(-2, 2, 21)
X, Y = np.meshgrid(x, y)
fig, axes = plt.subplots(1, 2)
for u, v, title in [(X, Y, "div = +2"),
                     (-X, -Y, "div = -2")]:
    ax = axes[0 if title.endswith("+2") else 1]
    ax.streamplot(X, Y, u, v, color=np.hypot(u, v))
    ax.set_title(title)
print("divergentes:", +2, -2)
```

::: verificacao
**Verificação Rápida (Concept Check):**  
1. Um campo com divergente positivo tem linhas de campo que **emanam** ou **convergem**? **Emanam** (fonte).  
2. Um campo com divergente negativo tem linhas de campo que **emanam** ou **convergem**? **Convergem** (sorvedouro).  
3. O divergente é um escalar ou um vetor? **Escalar.**
:::

::: exemplo
**Exemplo 5.** Seja $\vec F = z\,\hat x + x\,\hat y + y\,\hat z$. O divergente é:

$$
\nabla\cdot\vec F = \frac{\partial z}{\partial x} + \frac{\partial x}{\partial y} + \frac{\partial y}{\partial z} = 0 + 0 + 0 = 0
$$

Este campo é solenoidal (divergente nulo) em todo o espaço.
:::

### Teorema do Divergente (Gauss–Ostrogradsky) — prova completa

**Enunciado**: para um campo vetorial $\vec F$ suave em uma região $V$ delimitada por uma superfície fechada $S$:

$$
\boxed{\oint_S \vec F\cdot d\vec A = \int_V(\nabla\cdot\vec F)\,dV}
$$

**Prova**: divida $V$ em $N$ cubos infinitesimais adjacentes $\Delta V_i$. Pela Seção “Dedução da interpretação geométrica”, o fluxo através da fronteira de cada cubo é $(\nabla\cdot\vec F)_i\,\Delta V_i$. Somando sobre todos os cubos:

$$
\sum_i \oint_{\partial(\Delta V_i)}\vec F\cdot d\vec A = \sum_i(\nabla\cdot\vec F)_i\,\Delta V_i \;\xrightarrow{N\to\infty}\; \int_V(\nabla\cdot\vec F)\,dV
$$

Para o lado esquerdo, note que cada face **interna** (compartilhada por dois cubos vizinhos) é percorrida duas vezes com normais opostas ($+\hat n$ para um cubo, $-\hat n$ para o vizinho) — essas contribuições se cancelam exatamente. Sobrevivem apenas as faces na **fronteira externa** de $V$, que juntas compõem $S$:

$$
\sum_i \oint_{\partial(\Delta V_i)}\vec F\cdot d\vec A = \oint_S\vec F\cdot d\vec A
$$

Igualando as duas expressões, obtém-se o teorema. $\blacksquare$

---

## Rotacional

### Definição

::: definição
**Definição 4.** O **rotacional** de um campo vetorial $\vec F = F_x\hat x+F_y\hat y+F_z\hat z$ é:

$$
\boxed{\nabla\times\vec F \equiv \left(\frac{\partial F_z}{\partial y}-\frac{\partial F_y}{\partial z}\right)\hat x+\left(\frac{\partial F_x}{\partial z}-\frac{\partial F_z}{\partial x}\right)\hat y+\left(\frac{\partial F_y}{\partial x}-\frac{\partial F_x}{\partial y}\right)\hat z}
$$
:::

Forma mnemônica como determinante:

$$
\nabla\times\vec F = \begin{vmatrix}\hat x & \hat y & \hat z\\[2pt]\partial_x & \partial_y & \partial_z\\[2pt]F_x & F_y & F_z\end{vmatrix}
$$

### Dedução da interpretação física (circulação por unidade de área)

Considere um laço retangular infinitesimal no plano $xy$, de lados $dx,dy$, centrado em $(x,y)$, percorrido no sentido anti-horário. A circulação de $\vec F$ ao longo desse laço:

$$
\oint\vec F\cdot d\vec\ell = F_x\!\left(y-\tfrac{dy}{2}\right)dx + F_y\!\left(x+\tfrac{dx}{2}\right)dy - F_x\!\left(y+\tfrac{dy}{2}\right)dx - F_y\!\left(x-\tfrac{dx}{2}\right)dy
$$

Agrupando e expandindo em Taylor (termo linear apenas):

$$
\oint\vec F\cdot d\vec\ell \approx \left(\frac{\partial F_y}{\partial x}-\frac{\partial F_x}{\partial y}\right)dx\,dy = (\nabla\times\vec F)_z\,dA
$$

Logo, para uma área infinitesimal de normal $\hat n$:

$$
\boxed{(\nabla\times\vec F)\cdot\hat n = \lim_{\Delta A\to0}\frac{1}{\Delta A}\oint_{\partial(\Delta A)}\vec F\cdot d\vec\ell}
$$

O rotacional mede a **densidade de circulação** (tendência do campo a "girar") ao redor de um ponto, no plano perpendicular a $\hat n$. Um campo com $\nabla\times\vec F=0$ em toda parte é dito **irrotacional** ou **conservativo**.

::: exemplo
**Exemplo 3.** Seja $\vec F = (-y,\,x,\,0)$. O rotacional é:

$$
\begin{aligned}
\nabla\times\vec F &= \left(\frac{\partial 0}{\partial y}-\frac{\partial x}{\partial z}\right)\hat x
+ \left(\frac{\partial (-y)}{\partial z}-\frac{\partial 0}{\partial x}\right)\hat y
+ \left(\frac{\partial x}{\partial x}-\frac{\partial (-y)}{\partial y}\right)\hat z \\
&= (0)\hat x + (0)\hat y + (1-(-1))\hat z \\
&= (0,0,2)
\end{aligned}
$$

O rotacional é uniforme e constante, apontando em $+\hat z$.
:::

### Visualização Python — circulação e rotacional

```python
import numpy as np
import matplotlib.pyplot as plt
x = y = np.linspace(-2, 2, 23)
X, Y = np.meshgrid(x, y)
Fx, Fy = -Y, X
plt.streamplot(X, Y, Fx, Fy,
               color=np.hypot(Fx, Fy))
plt.gca().add_patch(
    plt.Circle((0, 0), 1.2, fill=False))
plt.axis("equal")
print("curl_z =", 2)
```

::: verificacao
**Verificação Rápida (Concept Check):**  
1. Um campo com rotacional positivo gira no sentido **anti-horário** ou **horário**? **Anti-horário** (regra da mão direita).  
2. Um campo irrotacional tem rotacional **zero** ou **infinito**? **Zero.**  
3. O rotacional é um escalar ou um vetor? **Vetor.**
:::

::: exemplo
**Exemplo 6.** Seja $\vec F = z^2\,\hat x + x^2\,\hat y - y^2\,\hat z$. O rotacional é:

$$
\nabla\times\vec F = \left(\frac{\partial (-y^2)}{\partial y}-\frac{\partial x^2}{\partial z}\right)\hat x + \left(\frac{\partial z^2}{\partial z}-\frac{\partial (-y^2)}{\partial x}\right)\hat y + \left(\frac{\partial x^2}{\partial x}-\frac{\partial z^2}{\partial y}\right)\hat z
$$

$$
= (-2y - 0)\hat x + (2z - 0)\hat y + (2x - 0)\hat z = (-2y,\,2z,\,2x)
$$

No ponto $(1,1,1)$: $\nabla\times\vec F(1,1,1) = (-2,\,2,\,2)$.
:::

### Teorema de Stokes — prova completa

**Enunciado**: para um campo vetorial $\vec F$ suave e uma superfície aberta $S$ delimitada por um contorno fechado $C$ (orientação de $d\vec A$ dada pela regra da mão direita em relação ao sentido de $C$):

$$
\boxed{\oint_C\vec F\cdot d\vec\ell = \int_S(\nabla\times\vec F)\cdot d\vec A}
$$

**Prova**: divida $S$ em $N$ células retangulares infinitesimais $\Delta A_i$. Pela Seção “Integrais de Linha, Superfície e Volume”, a circulação em torno de cada célula é $(\nabla\times\vec F)_i\cdot\hat n_i\,\Delta A_i$. Somando:

$$
\sum_i\oint_{\partial(\Delta A_i)}\vec F\cdot d\vec\ell = \sum_i(\nabla\times\vec F)_i\cdot\hat n_i\,\Delta A_i \;\xrightarrow{N\to\infty}\; \int_S(\nabla\times\vec F)\cdot d\vec A
$$

No lado esquerdo, cada aresta **interna** (compartilhada por duas células vizinhas) é percorrida duas vezes em sentidos opostos (uma vez em cada célula adjacente, ambas percorridas anti-horário do ponto de vista de sua própria normal) — cancelando-se exatamente. Sobrevivem apenas as arestas na **fronteira externa** de $S$, que compõem $C$:

$$
\sum_i\oint_{\partial(\Delta A_i)}\vec F\cdot d\vec\ell = \oint_C\vec F\cdot d\vec\ell
$$

Igualando, obtém-se o teorema. $\blacksquare$ (O argumento vale para $S$ curva ao aproximá-la por um mosaico de células planas infinitesimais, cada uma tangente à superfície local.)

::: corolário
**Corolário 2.** campo conservativo $\Leftrightarrow$ integral de linha independe do caminho

Se $\nabla\times\vec F=0$ em uma região simplesmente conexa, então, para quaisquer dois caminhos $C_1,C_2$ entre os mesmos pontos $A$ e $B$, a diferença de suas integrais de linha é a integral sobre o laço fechado $C_1-C_2$, que por Stokes vale $\int_S(\nabla\times\vec F)\cdot d\vec A=0$. Logo $\int_{C_1}\vec F\cdot d\vec\ell=\int_{C_2}\vec F\cdot d\vec\ell$ — a integral depende apenas dos extremos. Este é o fato usado no arquivo 2 para justificar a existência do potencial elétrico $V$.
:::

---

## Laplaciano

::: definição
**Definição 5.** O **laplaciano** de um campo escalar é o divergente do seu gradiente:

$$
\boxed{\nabla^2 f \equiv \nabla\cdot(\nabla f) = \frac{\partial^2f}{\partial x^2}+\frac{\partial^2f}{\partial y^2}+\frac{\partial^2f}{\partial z^2}}
$$
:::

Mede a diferença entre o valor de $f$ em um ponto e a média de $f$ em uma vizinhança infinitesimal (com sinal tal que $\nabla^2f>0$ onde $f$ é "côncavo para cima" localmente — um mínimo local relativo à vizinhança). Esta é a origem da **regra da média** usada na solução numérica de Laplace (arquivo 2, Seção “Adição e Subtração de Vetores”.4): se $\nabla^2f=0$, o valor em cada ponto é exatamente a média de seus vizinhos.

::: exemplo
**Exemplo 7.** Seja $f(x,y,z) = x^2 + y^2 + z^2$. O laplaciano é:

$$
\nabla^2 f = \frac{\partial^2 f}{\partial x^2} + \frac{\partial^2 f}{\partial y^2} + \frac{\partial^2 f}{\partial z^2} = 2 + 2 + 2 = 6
$$

Seja $g(x,y,z) = x^2 - y^2$. O laplaciano é:

$$
\nabla^2 g = 2 - 2 + 0 = 0
$$

Logo $g$ é uma função harmônica.
:::

::: observação
**Observação 1.** O laplaciano de um campo **vetorial** é definido componente a componente em coordenadas cartesianas: $\nabla^2\vec F = (\nabla^2F_x)\hat x+(\nabla^2F_y)\hat y+(\nabla^2F_z)\hat z$ (usado na dedução do potencial vetor magnético, arquivo 4).
:::

### Visualização Python — curvatura local e harmonicidade

```python
import numpy as np
import matplotlib.pyplot as plt
x = y = np.linspace(-2, 2, 120)
X, Y = np.meshgrid(x, y)
f1 = X**2 + Y**2       # laplaciano = 4
f2 = X**2 - Y**2       # laplaciano = 0
fig = plt.figure()
for i, f in enumerate((f1, f2), 1):
    ax = fig.add_subplot(1, 2, i, projection="3d")
    ax.plot_surface(X, Y, f)
print("laplacianos:", 4, 0)
```

---

## Sistemas de Coordenadas Curvilíneas

A simetria de um problema (esférica, cilíndrica) frequentemente torna cartesianas inconvenientes. As fórmulas abaixo são apresentadas sem prova (a dedução segue o mesmo método de "cubos infinitesimais", mas com arestas curvas — ver Seção “Rotacional”.4 para a ideia geral).

### Coordenadas cilíndricas $(s,\phi,z)$

$$
x=s\cos\phi,\quad y=s\sin\phi,\quad z=z
$$

$$
\nabla f = \frac{\partial f}{\partial s}\hat s+\frac{1}{s}\frac{\partial f}{\partial\phi}\hat\phi+\frac{\partial f}{\partial z}\hat z
$$

$$
\nabla\cdot\vec F = \frac{1}{s}\frac{\partial(sF_s)}{\partial s}+\frac{1}{s}\frac{\partial F_\phi}{\partial\phi}+\frac{\partial F_z}{\partial z}
$$

$$
\nabla\times\vec F = \left(\frac{1}{s}\frac{\partial F_z}{\partial\phi}-\frac{\partial F_\phi}{\partial z}\right)\hat s+\left(\frac{\partial F_s}{\partial z}-\frac{\partial F_z}{\partial s}\right)\hat\phi+\frac{1}{s}\left(\frac{\partial(sF_\phi)}{\partial s}-\frac{\partial F_s}{\partial\phi}\right)\hat z
$$

$$
\nabla^2f = \frac{1}{s}\frac{\partial}{\partial s}\left(s\frac{\partial f}{\partial s}\right)+\frac{1}{s^2}\frac{\partial^2f}{\partial\phi^2}+\frac{\partial^2f}{\partial z^2}
$$

### Coordenadas esféricas $(r,\theta,\phi)$

$$
x=r\sin\theta\cos\phi,\quad y=r\sin\theta\sin\phi,\quad z=r\cos\theta
$$

$$
\nabla f = \frac{\partial f}{\partial r}\hat r+\frac{1}{r}\frac{\partial f}{\partial\theta}\hat\theta+\frac{1}{r\sin\theta}\frac{\partial f}{\partial\phi}\hat\phi
$$

$$
\nabla\cdot\vec F = \frac{1}{r^2}\frac{\partial(r^2F_r)}{\partial r}+\frac{1}{r\sin\theta}\frac{\partial(\sin\theta\,F_\theta)}{\partial\theta}+\frac{1}{r\sin\theta}\frac{\partial F_\phi}{\partial\phi}
$$

$$
\nabla^2f = \frac{1}{r^2}\frac{\partial}{\partial r}\left(r^2\frac{\partial f}{\partial r}\right)+\frac{1}{r^2\sin\theta}\frac{\partial}{\partial\theta}\left(\sin\theta\frac{\partial f}{\partial\theta}\right)+\frac{1}{r^2\sin^2\theta}\frac{\partial^2f}{\partial\phi^2}
$$

### Visualização Python — bases cilíndrica e esférica

```python
import numpy as np
import matplotlib.pyplot as plt
phi = np.linspace(0, 2*np.pi, 200)
for s in (0.6, 1.2, 1.8):
    plt.plot(s*np.cos(phi), s*np.sin(phi))
for p in np.linspace(0, 2*np.pi, 12):
    plt.plot([0, 2*np.cos(p)],
             [0, 2*np.sin(p)])
plt.axis("equal")
print("h_s, h_phi, h_z =", (1, "s", 1))
```

::: exemplo
**Exemplo 8.** Em coordenadas cilíndricas, seja $f(s,\phi,z) = s^2 z$. O gradiente é:

$$
\nabla f = \frac{\partial f}{\partial s}\hat s + \frac{1}{s}\frac{\partial f}{\partial\phi}\hat\phi + \frac{\partial f}{\partial z}\hat z = (2sz)\hat s + 0\,\hat\phi + (s^2)\hat z
$$

No ponto $(s,\phi,z) = (2, \pi/4, 1)$: $\nabla f = (4)\hat s + (4)\hat z$.
:::

### Verificação de consistência: campo radial $1/r^2$

::: lema
**Lema 1.** Usando a fórmula esférica do divergente para $\vec F = \dfrac{k}{r^2}\hat r$ (forma do campo de Coulomb, arquivo 1):

$$
\nabla\cdot\vec F = \frac{1}{r^2}\frac{\partial}{\partial r}\left(r^2\cdot\frac{k}{r^2}\right) = \frac{1}{r^2}\frac{\partial k}{\partial r} = 0\qquad(r\neq0)
$$
:::

confirmando que o campo de uma carga puntiforme tem divergente nulo em todo ponto **exceto na origem** — consistente com a Lei de Gauss pontual $\nabla\cdot\vec E=\rho/\varepsilon_0$, já que $\rho=0$ fora da carga, e toda a "fonte" está concentrada no ponto singular $r=0$ (formalmente, $\nabla\cdot(\hat r/r^2)=4\pi\delta^3(\vec r)$, uma identidade envolvendo a função delta de Dirac tridimensional).

::: observação
**Observação 2.** O campo $\vec F = r\,\hat r$ (não $1/r^2$) tem $\nabla\cdot\vec F=3$ em todo ponto — consistente com $\vec F=\vec r$ em cartesianas, cujo divergente cartesiano é trivialmente $3$.
:::

### Ideia geral da dedução em coordenadas curvilíneas

Para um sistema de coordenadas ortogonais $(u_1,u_2,u_3)$ com fatores de escala $h_i$ (tais que um deslocamento infinitesimal na direção $i$ tem comprimento $h_i\,du_i$), o mesmo argumento de "cubo infinitesimal" da Seção “Dedução da interpretação geométrica” se aplica a uma **caixa curvilínea** de arestas $h_1du_1, h_2du_2, h_3du_3$ — a diferença é que os próprios $h_i$ podem depender de $u_1,u_2,u_3$, contribuindo termos extras quando se deriva a área das faces opostas. Esse procedimento sistemático (fórmulas de Lamé) gera exatamente as expressões acima; cilíndricas e esféricas são casos particulares com $h_s=1,h_\phi=s,h_z=1$ e $h_r=1,h_\theta=r,h_\phi=r\sin\theta$, respectivamente.

---

## Identidades Vetoriais Fundamentais

As identidades abaixo são usadas repetidamente ao longo da apostila (seção onde cada uma é empregada, indicada entre parênteses):

$$
\nabla\times(\nabla f) \equiv 0 \qquad\text{(arquivo 2, Seção “Vetor Unitário”.2 — consistência } \vec E=-\nabla V \text{ com } \nabla\times\vec E=0\text{)}
$$

**Prova**: componente $z$: $\left[\nabla\times(\nabla f)\right]_z = \partial_x(\partial_y f)-\partial_y(\partial_x f) = 0$ pela igualdade das derivadas parciais mistas (teorema de Schwarz, válido para $f$ suave). As demais componentes seguem por permutação cíclica. $\blacksquare$

$$
\nabla\cdot(\nabla\times\vec F) \equiv 0 \qquad\text{(arquivo 4, Seção “Elementos Diferenciais e Integrais”.7.1 — existência de } \vec A \text{, pois } \nabla\cdot\vec B=0\text{)}
$$

**Prova**: $\nabla\cdot(\nabla\times\vec F) = \partial_x(\partial_yF_z-\partial_zF_y)+\partial_y(\partial_zF_x-\partial_xF_z)+\partial_z(\partial_xF_y-\partial_yF_x)$. Cada termo cancela com outro por igualdade das derivadas mistas (ex.: $\partial_x\partial_yF_z$ cancela com $-\partial_y\partial_xF_z$). $\blacksquare$

$$
\nabla\times(\nabla\times\vec F) = \nabla(\nabla\cdot\vec F)-\nabla^2\vec F \qquad\text{(arquivo 4, Seção “Elementos Diferenciais e Integrais”.7.3; arquivo 6, Seção “Rotacional”.7.3)}
$$

$$
\nabla\cdot(f\vec F) = f(\nabla\cdot\vec F)+\vec F\cdot\nabla f \qquad\text{(arquivo 2, Seção “Produto Vetorial”.2 — energia do campo elétrico)}
$$

$$
\nabla\cdot(\vec F\times\vec G) = \vec G\cdot(\nabla\times\vec F)-\vec F\cdot(\nabla\times\vec G)\qquad\text{(arquivo 6, Seção “Rotacional”.8.1 — Teorema de Poynting)}
$$

$$
\nabla\times(f\vec F) = f(\nabla\times\vec F)+(\nabla f)\times\vec F \qquad\text{(arquivo 4, Seção “Elementos Diferenciais e Integrais”.7.4 — Biot-Savart a partir de }\vec A\text{)}
$$

---

## Teorema de Helmholtz

### Enunciado

**Teorema**: um campo vetorial $\vec F(\vec r)$ que se anula suficientemente rápido no infinito é **unicamente determinado** por seu divergente $\nabla\cdot\vec F = s(\vec r)$ (fontes escalares) e seu rotacional $\nabla\times\vec F = \vec c(\vec r)$ (fontes vetoriais/circulação) em todo o espaço, e pode ser escrito como:

$$
\vec F = -\nabla U + \nabla\times\vec W,\qquad U(\vec r)=\frac{1}{4\pi}\int\frac{s(\vec r')}{|\vec r-\vec r'|}dV',\quad \vec W(\vec r)=\frac{1}{4\pi}\int\frac{\vec c(\vec r')}{|\vec r-\vec r'|}dV'
$$

### Por que isso justifica $\vec E=-\nabla V$ e $\vec B=\nabla\times\vec A$

Este teorema é a justificativa formal de duas construções centrais da apostila:

- Em **eletrostática**, sob as hipóteses topológicas e de contorno do teorema, $\vec E$ é longitudinal e pode ser escrito como $-\nabla V$. O potencial é definido até uma constante.
- Em **magnetostática**, $\vec B$ é solenoidal e pode ser escrito como $\nabla\times\vec A$. O campo $\vec B$ é único dadas fontes e fronteiras, mas $\vec A$ não é: $\vec A+\nabla\chi$ produz o mesmo rotacional (liberdade de calibre).

### Visualização Python — decomposição de Helmholtz

```python
import numpy as np
import matplotlib.pyplot as plt
x = y = np.linspace(-2, 2, 23)
X, Y = np.meshgrid(x, y)
longitudinal = (X, Y)
transversal = (-Y, X)
total = (X-Y, X+Y)
fig, axes = plt.subplots(1, 3)
for ax, (u, v) in zip(axes,
                      (longitudinal, transversal, total)):
    ax.streamplot(X, Y, u, v)
print("div(longitudinal)=2; curl(transversal)=2")
```

### Esboço da prova de unicidade

Suponha dois campos $\vec F_1,\vec F_2$ com o mesmo divergente $s$ e o mesmo rotacional $\vec c$ em todo o espaço, ambos se anulando no infinito. A diferença $\vec D=\vec F_1-\vec F_2$ satisfaz $\nabla\cdot\vec D=0$ e $\nabla\times\vec D=0$ em toda parte, e $\vec D\to0$ no infinito. Como $\nabla\times\vec D=0$, $\vec D=-\nabla\psi$ para algum escalar $\psi$ (Seção “Elementos Diferenciais e Integrais”.4, região simplesmente conexa = todo o espaço). Substituindo em $\nabla\cdot\vec D=0$: $\nabla^2\psi=0$ (Laplace) em todo o espaço, com $\psi\to$ const. no infinito. Pelo Teorema da Unicidade (Seção “Identidades Vetoriais Fundamentais”, aplicado à região "todo o espaço" com condição de contorno no infinito), a única solução é $\psi=$ const., logo $\vec D=-\nabla\psi=0$ — ou seja, $\vec F_1=\vec F_2$. $\blacksquare$

---

## Teorema da Unicidade (prova completa)

### Enunciado

**Teorema**: seja $V$ uma região conexa delimitada por $S$. A solução de $\nabla^2\phi=-\rho/\varepsilon_0$ é única se especificarmos, em cada parte de $S$, Dirichlet ou Neumann. Em condição puramente de Neumann, é necessária a compatibilidade

$$\oint_S\frac{\partial\phi}{\partial n}\,dA
=-\int_V\frac{\rho}{\varepsilon_0}\,dV,$$

e, quando ela vale, a solução é única apenas até uma constante. Dados simultâneos independentes de Dirichlet e Neumann na mesma porção geralmente tornam o problema sobredeterminado.

### Prova (por contradição, usando o Teorema do Divergente)

Suponha, por absurdo, que existam duas soluções distintas $\phi_1,\phi_2$ satisfazendo a mesma equação de Poisson e as mesmas condições de contorno em $S$. Defina $\phi_3\equiv\phi_1-\phi_2$. Então:

$$
\nabla^2\phi_3 = \nabla^2\phi_1-\nabla^2\phi_2 = -\frac{\rho}{\varepsilon_0}-\left(-\frac{\rho}{\varepsilon_0}\right) = 0\qquad\text{em }V
$$

e, em cada ponto de $S$, **ou** $\phi_3=0$ (se ambas satisfazem Dirichlet com o mesmo valor) **ou** $\partial\phi_3/\partial n=0$ (se ambas satisfazem Neumann com o mesmo valor).

Aplique a identidade de Green (consequência do Teorema do Divergente aplicado a $\vec F=\phi_3\nabla\phi_3$, usando $\nabla\cdot(\phi_3\nabla\phi_3)=\phi_3\nabla^2\phi_3+|\nabla\phi_3|^2 = |\nabla\phi_3|^2$ pois $\nabla^2\phi_3=0$):

$$
\oint_S \phi_3\,\nabla\phi_3\cdot d\vec A = \int_V \left(\phi_3\nabla^2\phi_3 + |\nabla\phi_3|^2\right)dV = \int_V |\nabla\phi_3|^2\,dV
$$

O lado esquerdo é **identicamente nulo** em qualquer um dos dois casos de contorno: se $\phi_3=0$ em $S$ (Dirichlet), o integrando se anula; se $\partial\phi_3/\partial n=\nabla\phi_3\cdot\hat n=0$ em $S$ (Neumann), o integrando também se anula. Logo:

$$
\int_V|\nabla\phi_3|^2\,dV = 0
$$

Como $|\nabla\phi_3|^2\ge0$ em todo ponto, a única forma da integral se anular é $\nabla\phi_3=0$ **em todo ponto de** $V$ — isto é, $\phi_3=$ constante em $V$. Se a condição for de Dirichlet em qualquer parte de $S$, essa constante deve ser zero ali, logo $\phi_3\equiv0$ em todo $V$: $\phi_1=\phi_2$, contradizendo a suposição de soluções distintas. (Se a condição for puramente Neumann em toda $S$, a solução é única **a menos de uma constante aditiva** — irrelevante fisicamente, pois $\vec E=-\nabla\phi$ não muda.) $\blacksquare$

### Visualização Python — duas soluções e sua diferença

```python
import numpy as np
import matplotlib.pyplot as plt
x = y = np.linspace(0, 1, 140)
X, Y = np.meshgrid(x, y)
phi1 = (np.sin(np.pi*X) * np.sinh(np.pi*Y)
        / np.sinh(np.pi))
phi2 = phi1.copy()  # mesmos dados de contorno
erro = np.max(np.abs(phi1 - phi2))
fig, axes = plt.subplots(1, 2)
axes[0].imshow(phi1, origin="lower")
axes[1].imshow(phi1-phi2, origin="lower")
print(f"max|phi1-phi2| = {erro:.1e}")
```

### Por que isso justifica o Método das Imagens

O Teorema da Unicidade é o que garante, no arquivo 3 (Seção “O Operador Nabla e o Gradiente”.5), que substituir um condutor por uma carga imagem fictícia produz a **solução física correta** na região de interesse: se a configuração fictícia reproduz exatamente as mesmas condições de contorno (mesmo $V$ na superfície do condutor) e satisfaz a mesma equação de Poisson na região de interesse, o teorema garante que não pode haver **nenhuma outra** solução válida ali — logo a solução por imagens, por mais artificial que pareça, **é** a solução real.

---

## Exercícios Resolvidos em Python

### Roteiro computacional

**Objetivo.** Verificar identidades diferenciais e os teoremas de Gauss e Stokes por cálculo simbólico e integração numérica.

**Hipóteses.** Os campos são suaves no domínio de integração; pontos singulares são excluídos explicitamente. Resultados numéricos devem convergir para os analíticos ao refinar a malha.

**Como executar.** Use Python 3 com `numpy`, `sympy`, `scipy` e `matplotlib`. Execute o bloco completo em um ambiente limpo. Compare sempre o erro absoluto e relativo, não apenas os valores impressos.

**Resultados esperados.** `rot(grad f)=0`, `div(rot F)=0`, e concordância entre as formas diferencial e integral dentro do erro de discretização.

---

### Simulação Passo a Passo: Decomposição de Helmholtz

**Objetivo pedagógico:** Visualizar como qualquer campo vetorial pode ser decomposto em uma parte irrotacional (gradiente de um escalar) e uma parte solenoidal (rotacional de um vetor).

**Passo 1:** Definir um campo vetorial arbitrário.
**Passo 2:** Calcular seu divergente e rotacional.
**Passo 3:** Reconstruir o campo usando as fórmulas de Helmholtz.

```python
import numpy as np
import matplotlib.pyplot as plt

# Passo 1: Definir um campo vetorial arbitrário
x = y = np.linspace(-2, 2, 20)
X, Y = np.meshgrid(x, y)

# Campo arbitrário: combinação de parte irrotacional e solenoidal
# Parte irrotacional (gradiente de f = x^2 + y^2): F_irrot = (2x, 2y)
# Parte solenoidal (rotacional de A = (0,0, xy)): F_solo = (-y, x)
F_x = 2*X - Y
F_y = 2*Y + X

fig, axes = plt.subplots(1, 3, figsize=(15, 5))

# Campo total
axes[0].streamplot(X, Y, F_x, F_y, color='k', density=1.2)
axes[0].set_title('Campo Vetorial Total')

# Parte irrotacional (divergente != 0, rotacional = 0)
F_irrot_x = 2*X
F_irrot_y = 2*Y
axes[1].streamplot(X, Y, F_irrot_x, F_irrot_y, color='#dc2626', density=1.2)
axes[1].set_title('Parte Irrotacional (Gradiente)')

# Parte solenoidal (divergente = 0, rotacional != 0)
F_solo_x = -Y
F_solo_y = X
axes[2].streamplot(X, Y, F_solo_x, F_solo_y, color='#2563eb', density=1.2)
axes[2].set_title('Parte Solenoidal (Rotacional)')

plt.tight_layout()
print("Decomposição de Helmholtz: F = F_irrot + F_solo")
```

```python
import numpy as np
import sympy as sp

# === Verificação simbólica das identidades vetoriais ===
x, y, z = sp.symbols('x y z')
f = sp.Function('f')(x, y, z)
Fx, Fy, Fz = [sp.Function(name)(x, y, z) for name in ('Fx', 'Fy', 'Fz')]

def grad(f):
    return sp.Matrix([sp.diff(f, x), sp.diff(f, y), sp.diff(f, z)])

def div(F):
    return sp.diff(F[0], x) + sp.diff(F[1], y) + sp.diff(F[2], z)

def curl(F):
    return sp.Matrix([
        sp.diff(F[2], y) - sp.diff(F[1], z),
        sp.diff(F[0], z) - sp.diff(F[2], x),
        sp.diff(F[1], x) - sp.diff(F[0], y),
    ])

# Identidade 1: rot(grad f) = 0
rot_grad_f = curl(grad(f))
print("rot(grad f) =", sp.simplify(rot_grad_f).T, "(deve ser [0,0,0])")

# Identidade 2: div(rot F) = 0
F = sp.Matrix([Fx, Fy, Fz])
div_curl_F = sp.simplify(div(curl(F)))
print("div(rot F) =", div_curl_F, "(deve ser 0)")

# === Verificação numérica: divergente de campo radial 1/r^2 fora da origem ===
def divergente_numerico_radial(k=1.0, r0=2.0, h=1e-5):
    def Fx_(x, y, z):
        r = np.sqrt(x**2+y**2+z**2)
        return k*x/r**3
    def Fy_(x, y, z):
        r = np.sqrt(x**2+y**2+z**2)
        return k*y/r**3
    def Fz_(x, y, z):
        r = np.sqrt(x**2+y**2+z**2)
        return k*z/r**3
    x0, y0, z0 = r0/np.sqrt(3), r0/np.sqrt(3), r0/np.sqrt(3)  # ponto a distância r0 da origem
    dFxdx = (Fx_(x0+h,y0,z0)-Fx_(x0-h,y0,z0))/(2*h)
    dFydy = (Fy_(x0,y0+h,z0)-Fy_(x0,y0-h,z0))/(2*h)
    dFzdz = (Fz_(x0,y0,z0+h)-Fz_(x0,y0,z0-h))/(2*h)
    return dFxdx + dFydy + dFzdz

div_num = divergente_numerico_radial()
print(f"\nDivergente numérico de F=k*r_hat/r^2 em r=2 (longe da origem): {div_num:.6e} (deve ser ~0)")

# === Verificação do Teorema do Divergente: fluxo vs integral de volume ===
def verifica_teorema_divergente(n=60):
    """Campo F = (x, y, z) tem div F = 3. Verifica em uma esfera de raio R."""
    R = 1.0
    # Integral de volume: div F * V = 3 * (4/3 pi R^3)
    integral_volume = 3 * (4/3*np.pi*R**3)
    # Fluxo: F.dA na esfera = r * (r^2 sin(theta) dtheta dphi), com F.n = R (F=r*rhat, F.rhat=r=R)
    theta = np.linspace(0, np.pi, n)
    phi = np.linspace(0, 2*np.pi, 2*n)
    dtheta, dphi = theta[1]-theta[0], phi[1]-phi[0]
    fluxo = 0.0
    for th in theta:
        fluxo += R * (R**2*np.sin(th)*dtheta*dphi) * len(phi)
    return fluxo, integral_volume

fluxo, integral_vol = verifica_teorema_divergente()
print(f"\nTeorema do Divergente: fluxo={fluxo:.4f}, integral de volume={integral_vol:.4f}")

# === Verificação do Teorema de Stokes: circulação vs integral de superfície ===
def verifica_teorema_stokes(n=200):
    """F = (-y, x, 0) tem rot F = (0,0,2). Verifica no disco unitário no plano xy."""
    # Circulação: integral de F.dl no círculo unitário
    t = np.linspace(0, 2*np.pi, n, endpoint=False)
    dt = t[1]-t[0]
    x_c, y_c = np.cos(t), np.sin(t)
    dx, dy = -np.sin(t)*dt, np.cos(t)*dt
    Fx_c, Fy_c = -y_c, x_c
    circulacao = np.sum(Fx_c*dx + Fy_c*dy)
    # Integral de superfície: (rot F).z_hat * Area = 2 * pi*R^2
    integral_superficie = 2 * np.pi * 1.0**2
    return circulacao, integral_superficie

circ, int_sup = verifica_teorema_stokes()
print(f"Teorema de Stokes: circulação={circ:.4f}, integral de superfície={int_sup:.4f}")

# === Gradiente, divergente e rotacional em coordenadas cilíndricas (verificação numérica) ===
def divergente_cilindrico_numerico(Fs, Fphi, Fz_func, s0, phi0, z0, h=1e-5):
    """Divergente em cilíndricas via diferenças finitas, comparado à fórmula analítica."""
    dFs_ds = (Fs(s0+h,phi0,z0)-Fs(s0-h,phi0,z0))/(2*h)
    dFphi_dphi = (Fphi(s0,phi0+h,z0)-Fphi(s0,phi0-h,z0))/(2*h)
    dFz_dz = (Fz_func(s0,phi0,z0+h)-Fz_func(s0,phi0,z0-h))/(2*h)
    return Fs(s0,phi0,z0)/s0 + dFs_ds + dFphi_dphi/s0 + dFz_dz

# Campo de teste: Fs = s^2, Fphi=0, Fz=0 -> div analítico = (1/s) d(s*s^2)/ds = 3s
Fs_test = lambda s, phi, z: s**2
Fphi_test = lambda s, phi, z: 0.0
Fz_test = lambda s, phi, z: 0.0
s0 = 2.0
div_num_cil = divergente_cilindrico_numerico(Fs_test, Fphi_test, Fz_test, s0, 0, 0)
div_analitico = 3*s0
print(f"\nDivergente cilíndrico numérico: {div_num_cil:.4f}, analítico (3s): {div_analitico:.4f}")
```

**Saída esperada**:

- Identidades simbólicas: ambas retornam identicamente zero.
- Divergente numérico do campo radial fora da origem: $\approx 0$ (erro $<10^{-6}$).
- Teorema do Divergente: fluxo e integral de volume coincidem ($4\pi\approx12{,}566$).
- Teorema de Stokes: circulação e integral de superfície coincidem ($2\pi\approx6{,}283$).
- Divergente cilíndrico: numérico e analítico coincidem ($3s=6$ para $s=2$).

### Experimento visual: gradiente, divergente e rotacional

**Experimento**: os três operadores deixam assinaturas geométricas diferentes. O gradiente cruza curvas de nível perpendicularmente; divergente positivo representa expansão local; rotacional representa circulação local. O código coloca essas três ideias lado a lado.

```python
import numpy as np
import matplotlib.pyplot as plt

x = y = np.linspace(-2, 2, 25)
X, Y = np.meshgrid(x, y)
f = X**2 + 2*Y**2
Gx, Gy = 2*X, 4*Y                  # grad f
Dx, Dy = X, Y                     # div(D)=2
Rx, Ry = -Y, X                    # rot(R)_z=2

fig, axes = plt.subplots(1, 3, figsize=(12, 3.7))
axes[0].contour(X, Y, f, levels=10, cmap="Blues")
axes[0].quiver(X, Y, Gx, Gy, color="#dc2626", alpha=.75)
axes[0].set_title("Gradiente: normal às curvas de nível")
axes[1].quiver(X, Y, Dx, Dy, color="#047857")
axes[1].set_title("Divergente positivo: fonte")
axes[2].quiver(X, Y, Rx, Ry, color="#7c3aed")
axes[2].set_title("Rotacional positivo: circulação")
for ax in axes:
    ax.set_aspect("equal"); ax.set(xlabel="$x$", ylabel="$y$"); ax.grid(alpha=.15)
plt.tight_layout()
```

**Insight físico**: divergente e rotacional são informações independentes. Um campo pode circular sem possuir fontes, expandir sem circular, apresentar ambos ou nenhum. O Teorema de Helmholtz explica por que conhecer os dois, mais as condições de contorno, determina o campo.

::: aplicacao
**Aplicação Prática:**  
- **Gradiente**: Usado em otimização de antenas para maximizar a intensidade do sinal em direções específicas.  
- **Divergente**: Fundamental para análise de fluxo de corrente em circuitos (lei de conservação de carga).  
- **Rotacional**: Essencial para projeto de motores elétricos, onde campos magnéticos rotacionais geram torque.
:::

### Perguntas conceituais rápidas

1. Se as curvas de nível estão mais próximas, o módulo do gradiente aumenta ou diminui?
2. Um campo com divergente nulo pode possuir linhas abertas? O que as condições de contorno acrescentam?
3. Por que verificar Stokes em apenas uma superfície não prova o teorema, mas pode revelar erros de sinal e orientação?

**Respostas**: (1) aumenta; a função varia mais rapidamente por unidade de distância. (2) Pode, dependendo do domínio e das fronteiras; divergente local nulo não determina sozinho a topologia global. (3) Uma verificação numérica testa um caso particular, enquanto a prova estabelece o resultado para toda a classe admitida de campos e superfícies.

---

## Classificação de Campos Vetoriais

Um campo vetorial $\vec F$ pode ser classificado com base em seu divergente e rotacional:

- **Campo irrotacional** (ou conservativo): $\nabla\times\vec F = 0$. Pode ser escrito como o gradiente de um escalar: $\vec F = -\nabla\phi$.
- **Campo solenoidal** (ou tubo): $\nabla\cdot\vec F = 0$. Pode ser escrito como o rotacional de um vetor potencial: $\vec F = \nabla\times\vec A$.
- **Campo harmônico**: $\nabla\cdot\vec F = 0$ e $\nabla\times\vec F = 0$. Satisfaz a equação de Laplace.

O **Teorema de Helmholtz** garante que qualquer campo vetorial bem comportado pode ser decomposto em uma parte irrotacional e uma parte solenoidal.

---

## Resumo do Capítulo

### Fórmulas-Chave

| Operador | Símbolo | Definição (Cartesiana) | Interpretação Física |
|---|---|---|---|
| Gradiente | $\nabla f$ | $\frac{\partial f}{\partial x}\hat{x}+\frac{\partial f}{\partial y}\hat{y}+\frac{\partial f}{\partial z}\hat{z}$ | Direção e taxa de máximo crescimento de $f$ |
| Divergente | $\nabla\cdot\vec F$ | $\frac{\partial F_x}{\partial x}+\frac{\partial F_y}{\partial y}+\frac{\partial F_z}{\partial z}$ | Densidade de fontes/sorvedouros |
| Rotacional | $\nabla\times\vec F$ | Determinante com $\hat x,\hat y,\hat z$, $\partial_x,\partial_y,\partial_z$, $F_x,F_y,F_z$ | Densidade de circulação |
| Laplaciano | $\nabla^2 f$ | $\frac{\partial^2f}{\partial x^2}+\frac{\partial^2f}{\partial y^2}+\frac{\partial^2f}{\partial z^2}$ | Diferença entre valor local e média |

### Teoremas Fundamentais

| Teorema | Fórmula | Significado |
|---|---|---|
| Divergente (Gauss) | $\displaystyle\oint_S \vec F\cdot d\vec A = \int_V(\nabla\cdot\vec F)\,dV$ | Fluxo através de superfície fechada = integral de volume do divergente |
| Stokes | $\displaystyle\oint_C\vec F\cdot d\vec\ell = \int_S(\nabla\times\vec F)\cdot d\vec A$ | Circulação ao longo de curva = integral de superfície do rotacional |
| Helmholtz | $\vec F = -\nabla U + \nabla\times\vec W$ | Todo campo bem comportado = parte irrotacional + parte solenoidal |

### Conceitos-Chave

1. **Gradiente**: Sempre perpendicular às superfícies de nível.
2. **Divergente positivo**: Fonte (campo "emana"). **Divergente negativo**: Sorvedouro (campo "converge").
3. **Rotacional nulo**: Campo conservativo/integral de linha independe do caminho.
4. **Divergente nulo**: Campo solenoidal/linhas de campo formam laços fechados ou vão ao infinito.
5. **Teorema da Unicidade**: Solução de $\nabla^2\phi=0$ é única com condições de contorno Dirichlet ou Neumann.

---

## Lista de Exercícios Propostos

**E1.** Calcule $\nabla f$ para $f(x,y,z)=x^2y+yz^3$. Avalie em $(1,2,1)$ e determine a direção de máximo crescimento nesse ponto.

**E2.** Mostre, por cálculo direto em cartesianas, que $\nabla\times(\nabla f)=0$ para $f=xy^2z^3$ (isto é, calcule $\nabla f$ e depois $\nabla\times(\nabla f)$ explicitamente).

**E3.** Calcule $\nabla\cdot\vec F$ para $\vec F=(x^2,\,2xy,\,-z^2)$. O campo tem fontes? Onde?

**E4.** Calcule $\nabla\times\vec F$ para $\vec F=(-y,\,x,\,0)$. Interprete fisicamente o resultado (que campo físico, estudado nesta apostila, tem essa mesma forma funcional **no interior** de um fio cilíndrico infinito com densidade de corrente uniforme?).

**E5.** Verifique, calculando ambos os lados diretamente, que $\vec F=(x^2,\,2xy,\,-z^2)$ satisfaz $\nabla\times(\nabla\times\vec F)=\nabla(\nabla\cdot\vec F)-\nabla^2\vec F$ (calcule $\nabla\times\vec F$ primeiro; se for zero, o que a identidade se reduz a?).

**E6.** Um campo escalar em coordenadas esféricas é $f(r)=1/r$. Calcule $\nabla f$ usando a fórmula da Seção “Dedução da interpretação física (circulação por unidade de área)” e compare com o resultado conhecido $\nabla(1/r)=-\hat r/r^2$ (arquivo 2, Seção “Adição e Subtração de Vetores”.3).

**E7.** Use a fórmula do divergente em esféricas (Seção “Dedução da interpretação física (circulação por unidade de área)”) para mostrar que $\vec F = r\,\hat r$ (não $1/r^2$) tem $\nabla\cdot\vec F=3$ em todo ponto — consistente com $\vec F=\vec r$ em cartesianas, cujo divergente cartesiano é trivialmente $3$.

**E8.** Aplique o Teorema do Divergente para calcular $\oint_S\vec F\cdot d\vec A$ onde $\vec F=(x,y,z)$ e $S$ é a superfície de um cubo de lado $L$ centrado na origem, **sem** calcular a integral de superfície diretamente (calcule $\nabla\cdot\vec F$ e integre sobre o volume).

**E9.** Aplique o Teorema de Stokes para calcular $\oint_C\vec F\cdot d\vec\ell$ onde $\vec F=(-y,x,0)$ e $C$ é um quadrado de lado $2$ no plano $xy$, centrado na origem, percorrido anti-horário — sem calcular a integral de linha diretamente.

**E10.** Explique, usando o Teorema de Helmholtz (Seção “Sistemas de Coordenadas Curvilíneas”), por que basta especificar $\nabla\cdot\vec E$ e $\nabla\times\vec E$ em **todo o espaço** para determinar $\vec E$ unicamente — e por que isso é exatamente o conteúdo de duas das quatro Equações de Maxwell (arquivo 6, Seção “Rotacional”.7.1).

**E11.** No enunciado do Teorema da Unicidade (Seção “Identidades Vetoriais Fundamentais”.1), explique por que **não é permitido** especificar simultaneamente Dirichlet ($\phi$) e Neumann ($\partial\phi/\partial n$) com valores independentes na mesma fronteira $S$ — o que aconteceria com a prova da Seção “Identidades Vetoriais Fundamentais”.2 nesse caso (dica: o problema ficaria sobredeterminado).

**E12.** Um campo tem $\nabla\cdot\vec F=0$ e $\nabla\times\vec F=0$ em todo o espaço, anulando-se no infinito. Use o Teorema de Helmholtz para concluir, sem cálculo adicional, o valor de $\vec F$ em todo ponto.

**E13.** Verifique a identidade $\nabla\cdot(f\vec F)=f(\nabla\cdot\vec F)+\vec F\cdot\nabla f$ para $f=x$ e $\vec F=(y,z,x)$, calculando os dois lados explicitamente.

**E14.** (Desafio) Escreva o laplaciano $\nabla^2 f$ em coordenadas cilíndricas (Seção “Definição”) para $f(s)=\ln s$ (potencial de um fio infinito, a menos de constante — arquivo 1). Mostre que $\nabla^2 f=0$ para $s\neq0$, consistente com a ausência de carga fora do fio.

**E15.** (Desafio) Demonstre a identidade $\nabla\cdot(\vec F\times\vec G)=\vec G\cdot(\nabla\times\vec F)-\vec F\cdot(\nabla\times\vec G)$ expandindo **completamente** ambos os lados em componentes cartesianas para $\vec F=(F_x,F_y,F_z)$ e $\vec G=(G_x,G_y,G_z)$. Depois confira o sinal com o caso particular $\vec F=(-y,x,0)$ e $\vec G=(0,0,1)$.

---

## Gabarito

**E1.** $\nabla f = (2xy)\hat x+(x^2+z^3)\hat y+(3yz^2)\hat z$. Em $(1,2,1)$: $\nabla f = (4,\,2,\,6)$. Direção de máximo crescimento: $\hat u = \dfrac{(4,2,6)}{|(4,2,6)|} = \dfrac{(4,2,6)}{\sqrt{56}} \approx (0{,}535,\,0{,}267,\,0{,}802)$.

**E2.** $\nabla f = (y^2z^3,\,2xyz^3,\,3xy^2z^2)$. Componente $z$ de $\nabla\times(\nabla f)$: $\partial_x(2xyz^3)-\partial_y(y^2z^3) = 2yz^3-2yz^3=0$. Componente $y$: $\partial_z(y^2z^3)-\partial_x(3xy^2z^2)=3y^2z^2-3y^2z^2=0$. Componente $x$: $\partial_y(3xy^2z^2)-\partial_z(2xyz^3)=6xyz^2-6xyz^2=0$. Logo $\nabla\times(\nabla f)=\vec 0$, confirmando a identidade.

**E3.** $\nabla\cdot\vec F = 2x+2x-2z = 4x-2z$. O campo tem fontes onde $4x-2z\neq0$, isto é, em quase todo ponto exceto no plano $z=2x$ (onde as fontes se anulam localmente, mas isso não significa ausência de campo, apenas de divergência líquida ali).

**E4.** $\nabla\times\vec F = (0-0,\,0-0,\,1-(-1)) = (0,0,2)$ — rotacional uniforme e constante, apontando em $+\hat z$. Como $\vec F=(-y,x,0)=s\hat\phi$ em cilíndricas, ele tem a mesma forma funcional do campo **interno** de um fio cilíndrico infinito com densidade de corrente uniforme: $B_\phi(s)=\mu_0J_0s/2$. De fato, $\nabla\times\vec B=\mu_0J_0\hat z$. Isso contrasta com o campo **externo** do fio, $B_\phi\propto1/s$, cujo rotacional é nulo para $s>R$; um campo azimutal pode, portanto, ter rotacional nulo ou não nulo conforme sua dependência em $s$.

**E5.** Primeiro, $\nabla\times\vec F$ para $\vec F=(x^2,\,2xy,\,-z^2)$: componente $x$: $\partial_y(-z^2)-\partial_z(2xy)=0$; componente $y$: $\partial_z(x^2)-\partial_x(-z^2)=0$; componente $z$: $\partial_x(2xy)-\partial_y(x^2)=2y-0=2y$. Logo $\nabla\times\vec F=(0,0,2y)$, **não** nulo em geral — a identidade deve ser verificada calculando os dois lados por completo. Lado esquerdo, $\nabla\times(\nabla\times\vec F)=\nabla\times(0,0,2y)$: componente $x$: $\partial_y(2y)-\partial_z(0)=2$; componentes $y,z$: ambas $0$. Logo lado esquerdo $=(2,0,0)$. Lado direito, com $\nabla\cdot\vec F=2x+2x-2z=4x-2z$ (E3): $\nabla(4x-2z)=(4,0,-2)$; e $\nabla^2\vec F=(\nabla^2(x^2),\nabla^2(2xy),\nabla^2(-z^2))=(2,0,-2)$ (cada laplaciano cartesiano trivial: $\partial_x^2(x^2)=2$, os demais termos são $0$). Diferença: $(4,0,-2)-(2,0,-2)=(2,0,0)$. Os dois lados coincidem: $(2,0,0)=(2,0,0)$ ✓.

**E6.** $\nabla f = \dfrac{\partial(1/r)}{\partial r}\hat r = -\dfrac{1}{r^2}\hat r$ (os termos em $\hat\theta,\hat\phi$ são nulos pois $f$ não depende de $\theta,\phi$). Coincide exatamente com $\nabla(1/r)=-\hat r/r^2$ usado no arquivo 2.

**E7.** $\nabla\cdot(r\hat r) = \dfrac{1}{r^2}\dfrac{\partial(r^2\cdot r)}{\partial r} = \dfrac{1}{r^2}\dfrac{\partial(r^3)}{\partial r} = \dfrac{3r^2}{r^2}=3$. Em cartesianas, $\vec F=(x,y,z)$, $\nabla\cdot\vec F=1+1+1=3$ — coincide.

**E8.** $\nabla\cdot\vec F=3$ (constante). Pelo Teorema do Divergente: $\oint_S\vec F\cdot d\vec A = \displaystyle\int_V 3\,dV = 3L^3$ (volume do cubo é $L^3$).

**E9.** $\nabla\times\vec F=(0,0,2)$ (calculado no E4). Pelo Teorema de Stokes: $\oint_C\vec F\cdot d\vec\ell = \displaystyle\int_S(0,0,2)\cdot\hat z\,dA = 2\cdot(2\times2) = 8$ (área do quadrado de lado 2 é 4).

**E10.** O Teorema de Helmholtz garante que um campo vetorial que se anula no infinito é unicamente determinado por seu divergente e rotacional em todo o espaço. As Equações de Maxwell (I) $\nabla\cdot\vec E=\rho/\varepsilon_0$ e (III) $\nabla\times\vec E=-\partial\vec B/\partial t$ especificam exatamente essas duas quantidades para o campo $\vec E$ — logo, dadas as fontes $\rho$ e $\partial\vec B/\partial t$ em todo o espaço (mais condições de contorno apropriadas em fronteiras finitas), $\vec E$ fica unicamente determinado. O mesmo raciocínio, com as equações (II) e (IV), determina $\vec B$.

**E11.** Especificar ambas simultaneamente com valores **independentes** (não relacionados pela própria solução do problema) tornaria o problema **sobredeterminado**: a prova da Seção “Identidades Vetoriais Fundamentais”.2 mostra que, dado apenas Dirichlet **ou** apenas Neumann, o integrando de superfície já se anula, forçando $\nabla\phi_3=0$. Se pudéssemos escolher Dirichlet e Neumann arbitrariamente (não decorrentes uma da outra), poderia não existir **nenhuma** função $\phi$ que satisfizesse simultaneamente ambas as condições impostas livremente — o problema deixaria de ter garantia de existência de solução (seria "sobredeterminado"), não apenas de unicidade.

**E12.** Pelo Teorema de Helmholtz, um campo é unicamente determinado por seu divergente e rotacional (dadas condições de anulação no infinito). Se ambos são identicamente nulos em todo o espaço, a única função consistente com $U=0$ e $\vec W=0$ na fórmula da Seção “Coordenadas cilíndricas $(s,\phi,z)$” é $\vec F\equiv\vec 0$ em todo ponto.

**E13.** Lado esquerdo: $f\vec F = (xy,\,xz,\,x^2)$. $\nabla\cdot(f\vec F) = \partial_x(xy)+\partial_y(xz)+\partial_z(x^2) = y+0+0=y$. Lado direito: $f(\nabla\cdot\vec F) = x\cdot(0+0+0)=0$ (pois $\nabla\cdot(y,z,x)=0$); $\vec F\cdot\nabla f = (y,z,x)\cdot(1,0,0)=y$. Soma: $0+y=y$. Ambos os lados coincidem ($y=y$) ✓.

**E14.** $\nabla^2 f = \dfrac{1}{s}\dfrac{\partial}{\partial s}\left(s\cdot\dfrac{1}{s}\right) = \dfrac{1}{s}\dfrac{\partial(1)}{\partial s} = \dfrac{1}{s}\cdot0 = 0$ para $s\neq0$ — consistente com a Equação de Laplace fora do fio (sem carga na região $s>0$), analogamente ao caso da carga puntiforme (Seção “Teorema de Stokes — prova completa”).

**E15.** Primeiro escreva o produto vetorial:

$$
\vec F\times\vec G=
(F_yG_z-F_zG_y)\hat x+
(F_zG_x-F_xG_z)\hat y+
(F_xG_y-F_yG_x)\hat z.
$$

Aplicando o divergente e a regra do produto em cada parcela,

$$
\begin{aligned}
\nabla\cdot(\vec F\times\vec G)
={}&(\partial_xF_y)G_z+F_y(\partial_xG_z)
 -(\partial_xF_z)G_y-F_z(\partial_xG_y)\\
&+(\partial_yF_z)G_x+F_z(\partial_yG_x)
 -(\partial_yF_x)G_z-F_x(\partial_yG_z)\\
&+(\partial_zF_x)G_y+F_x(\partial_zG_y)
 -(\partial_zF_y)G_x-F_y(\partial_zG_x).
\end{aligned}
$$

Agora expanda o primeiro termo do lado direito:

$$
\begin{aligned}
\vec G\cdot(\nabla\times\vec F)
={}&G_x(\partial_yF_z-\partial_zF_y)
+G_y(\partial_zF_x-\partial_xF_z)\\
&+G_z(\partial_xF_y-\partial_yF_x).
\end{aligned}
$$

O segundo termo é

$$
\begin{aligned}
-\vec F\cdot(\nabla\times\vec G)
={}&-F_x(\partial_yG_z-\partial_zG_y)
-F_y(\partial_zG_x-\partial_xG_z)\\
&-F_z(\partial_xG_y-\partial_yG_x).
\end{aligned}
$$

Distribuindo os sinais, surgem exatamente os mesmos 12 termos da expansão do lado esquerdo. Portanto,

$$
\boxed{\nabla\cdot(\vec F\times\vec G)
=\vec G\cdot(\nabla\times\vec F)
-\vec F\cdot(\nabla\times\vec G)}.
$$

**Verificação do sinal:** para $\vec F=(-y,x,0)$ e $\vec G=(0,0,1)$,
$\vec F\times\vec G=(x,y,0)$, cujo divergente é $2$. Além disso,
$\nabla\times\vec F=(0,0,2)$ e $\nabla\times\vec G=0$; o lado direito também vale
$\vec G\cdot(0,0,2)-0=2$. Se a ordem do produto vetorial ou o sinal entre os dois termos fosse trocado, este teste simples revelaria o erro.
