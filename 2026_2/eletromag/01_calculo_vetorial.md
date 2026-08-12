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
4. [Elementos Diferenciais e Integrais](#elementos-diferenciais-e-integrais)
5. [Divergente](#divergente)
6. [Rotacional](#rotacional)
7. [Laplaciano](#laplaciano)
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

### Mapa de navegação: quem entra e quem sai?

Antes das fórmulas, vale conferir o **tipo** de cada operação. Essa simples checagem evita erros como tentar calcular o divergente de um escalar ou esperar que o gradiente produza um número.

| Operação | Entrada | Saída | Pergunta respondida |
|---|---|---|---|
| $\nabla f$ | campo escalar $f$ | campo vetorial | Para onde $f$ cresce mais rapidamente? |
| $D_{\hat u}f=\nabla f\cdot\hat u$ | escalar + direção | campo escalar | Quanto $f$ varia na direção escolhida? |
| $\nabla\cdot\vec F$ | campo vetorial | campo escalar | Há fonte ou sorvedouro neste ponto? |
| $\nabla\times\vec F$ | campo vetorial | campo vetorial | Em torno de qual eixo há circulação local? |
| $\nabla^2f=\nabla\cdot\nabla f$ | campo escalar | campo escalar | O ponto está acima ou abaixo da média local? |

::: exemplo
**Um fio condutor para o capítulo.** Considere um potencial elétrico $V(\vec r)$. O gradiente transforma esse escalar em campo elétrico, e o divergente do campo revela a carga que o produz:

$$
V \xrightarrow{\ -\nabla\ } \vec E \xrightarrow{\ \nabla\cdot\ } \frac{\rho}{\varepsilon_0}.
$$

Combinando as duas etapas,

$$
\nabla^2V=\nabla\cdot(\nabla V)=-\frac{\rho}{\varepsilon_0},
$$

que é a equação de Poisson. Portanto, gradiente, divergente e laplaciano não são tópicos desconectados: eles descrevem sucessivamente **potencial → campo → fonte**.
:::

::: verificacao
**Pare e classifique antes de calcular.** Se $V$ é medido em volts, quais são as unidades de $\nabla V$ e $\nabla^2V$? Resposta: V/m e V/m². A análise dimensional será uma ferramenta de conferência ao longo de todo o capítulo.
:::

---

## Álgebra Vetorial Básica

Por que o eletromagnetismo precisa de vetores, e não apenas de números? Porque toda grandeza física relevante aqui — força sobre uma carga, campo elétrico, densidade de corrente — tem uma **direção** que importa fisicamente: uma carga sente uma força elétrica em uma direção específica, não apenas com uma "intensidade". Esta seção constrói, a partir de propriedades físicas simples (projeção e área), as duas operações que usaremos o tempo todo: o produto escalar e o produto vetorial.

### Vetores e Escalares

Um **escalar** é uma grandeza que possui apenas magnitude (ex.: massa, temperatura, potencial elétrico). Um **vetor** possui magnitude, direção e sentido (ex.: deslocamento, velocidade, campo elétrico). Em coordenadas cartesianas, $\vec A = A_x\hat x+A_y\hat y+A_z\hat z$, onde $A_x,A_y,A_z$ são as **componentes** (escalares) e $\hat x,\hat y,\hat z$ carregam a informação de direção.

### Vetor Unitário

Um **vetor unitário** (ou versor) é um vetor de magnitude igual a 1 — ele carrega **pura informação de direção**, sem escala. Os versores cartesianos padrão são $\hat{x}, \hat{y}, \hat{z}$ (ou $\hat{u}_x, \hat{u}_y, \hat{u}_z$), que apontam nas direções positivas dos eixos coordenados.

Para qualquer vetor $\vec A \neq \vec 0$, o vetor unitário na direção de $\vec A$ é obtido "descartando" o comprimento e mantendo só a direção:

$$
\hat{a}_A = \frac{\vec A}{|\vec A|},\qquad |\vec A| = \sqrt{A_x^2+A_y^2+A_z^2}
$$

Essa operação — normalizar um vetor — aparecerá repetidamente: campos como $\vec E=\frac{kq}{r^2}\hat r$ separam explicitamente "quanto" ($kq/r^2$, escalar) de "em que direção" ($\hat r$, versor).

### Adição e Subtração de Vetores

A soma de dois vetores $\vec A$ e $\vec B$ é dada, componente a componente, por:

$$
\vec C = \vec A + \vec B = (A_x+B_x)\hat x+(A_y+B_y)\hat y+(A_z+B_z)\hat z
$$

Geometricamente, isso corresponde à regra do paralelogramo ou da poligonal (colocar a cauda de $\vec B$ na ponta de $\vec A$). Fisicamente, esta é a operação por trás do **Princípio da Superposição**: o campo elétrico total de várias cargas é a soma vetorial dos campos individuais — cada carga "não sabe" da presença das outras, e os efeitos se somam vetorialmente.

### Produto Escalar (Dot Product) — dedução a partir da projeção

**A pergunta física:** quanto de um vetor $\vec B$ "aponta na mesma direção" de outro vetor $\vec A$? Essa pergunta aparece toda vez que calculamos trabalho ($\vec F\cdot d\vec\ell$) ou fluxo ($\vec F\cdot d\vec A$) — só a componente de um vetor **paralela** ao outro contribui.

**Passo 1 — projeção geométrica.** A projeção escalar de $\vec B$ sobre a direção de $\vec A$ é, por definição de cosseno em um triângulo retângulo, $|\vec B|\cos\theta$, onde $\theta$ é o ângulo entre os vetores. Definimos o **produto escalar** como essa projeção multiplicada pela magnitude de $\vec A$:

$$
\vec A\cdot\vec B \equiv |\vec A||\vec B|\cos\theta
$$

**Passo 2 — forma em componentes.** Usando a lei dos cossenos no triângulo formado por $\vec A$, $\vec B$ e $\vec A-\vec B$: $|\vec A-\vec B|^2 = |\vec A|^2+|\vec B|^2-2|\vec A||\vec B|\cos\theta$. Expandindo o lado esquerdo em componentes cartesianas, $|\vec A-\vec B|^2=(A_x-B_x)^2+(A_y-B_y)^2+(A_z-B_z)^2 = |\vec A|^2+|\vec B|^2-2(A_xB_x+A_yB_y+A_zB_z)$. Comparando os dois termos que multiplicam $-2$:

$$
\boxed{\vec A \cdot \vec B = |\vec A||\vec B|\cos\theta = A_xB_x + A_yB_y + A_zB_z}
$$

Resultado: um **escalar**. Casos-limite que ajudam a fixar a intuição: $\vec A\cdot\vec B=0$ quando $\theta=90°$ (vetores perpendiculares — nenhuma "sobreposição" de direção); $\vec A\cdot\vec B=|\vec A||\vec B|$ quando $\theta=0°$ (vetores paralelos — sobreposição total); $\vec A\cdot\vec A=|\vec A|^2$ (a "projeção de um vetor sobre si mesmo" é seu próprio comprimento ao quadrado).

::: exemplo
**Exemplo 0a.** O trabalho realizado por uma força constante $\vec F=(3,4,0)$ N ao longo de um deslocamento $\vec d=(2,0,0)$ m é $W=\vec F\cdot\vec d = 3(2)+4(0)+0(0)=6$ J — apenas a componente de $\vec F$ **ao longo** de $\vec d$ (aqui, $F_x=3$ N) realiza trabalho; a componente perpendicular ($F_y=4$ N) não contribui, pois não desloca a partícula em sua própria direção.
:::

### Produto Vetorial (Cross Product) — dedução a partir da área e do torque

**A pergunta física:** dado um plano definido por $\vec A$ e $\vec B$, existe uma direção **naturalmente perpendicular** a ambos, com magnitude ligada à área "varrida" pelos dois vetores? Essa construção aparece no torque ($\vec\tau=\vec r\times\vec F$), na força magnética ($\vec F=q\vec v\times\vec B$) e na definição do rotacional (via a regra da mão direita).

**Passo 1 — a magnitude é uma área.** A área do paralelogramo formado por $\vec A$ e $\vec B$ é base $\times$ altura $=|\vec A|\,(|\vec B|\sin\theta)$, onde $|\vec B|\sin\theta$ é a componente de $\vec B$ **perpendicular** a $\vec A$ (a "altura" do paralelogramo). Definimos essa área como a magnitude do produto vetorial:

$$
|\vec A\times\vec B| \equiv |\vec A||\vec B|\sin\theta
$$

**Passo 2 — a direção é normal ao plano.** Como um plano tem duas normais possíveis ($+\hat n$ e $-\hat n$), a convenção física (consistente com torque e força magnética observados no laboratório) escolhe o sentido pela **regra da mão direita**: aponte os dedos na direção de $\vec A$, curve-os até $\vec B$; o polegar aponta na direção de $\vec A\times\vec B$.

$$
\boxed{\vec A \times \vec B = |\vec A||\vec B|\sin\theta\,\hat{n}}
$$

Resultado: um **vetor**, perpendicular tanto a $\vec A$ quanto a $\vec B$. Casos-limite: $|\vec A\times\vec B|=0$ quando $\theta=0°$ ou $180°$ (vetores paralelos/antiparalelos não definem um plano, logo não há normal única); $|\vec A\times\vec B|=|\vec A||\vec B|$ quando $\theta=90°$ (área máxima).

**Passo 3 — forma em componentes** (via o determinante mnemônico, útil para cálculo direto):

$$
\vec A\times\vec B = \begin{vmatrix}\hat x&\hat y&\hat z\\A_x&A_y&A_z\\B_x&B_y&B_z\end{vmatrix} = (A_yB_z-A_zB_y)\hat x+(A_zB_x-A_xB_z)\hat y+(A_xB_y-A_yB_x)\hat z
$$

Consequência imediata: $\vec A\times\vec B=-\vec B\times\vec A$ (trocar as duas primeiras linhas do determinante inverte o sinal) — o produto vetorial **não comuta**, ao contrário do produto escalar.

### Visualização Python — projeção, área e regra da mão direita

::: insight
**Como estudar com os blocos Python.** Não trate o código apenas como uma figura pronta. Em cada visualização:

1. leia as grandezas definidas antes de executar;
2. faça uma previsão qualitativa de direção, sinal ou simetria;
3. execute e compare o resultado com sua previsão;
4. altere um parâmetro por vez;
5. descreva em uma frase o que permaneceu invariável.

O notebook [Cálculo Vetorial — Exercícios e Visualizações](notebooks/01_calculo_vetorial_exercicios.ipynb) reúne versões interativas e exercícios adicionais. Os blocos deste capítulo permanecem autocontidos para quem preferir executá-los diretamente.
:::

```python
import numpy as np
import matplotlib.pyplot as plt

A = np.array([3.0, 1.0])
B = np.array([1.0, 2.0])
theta = np.arccos(A@B / (np.linalg.norm(A)*np.linalg.norm(B)))

# Produto escalar: projeção de B sobre A
proj_comprimento = (A@B) / np.linalg.norm(A)
proj_vetor = proj_comprimento * (A/np.linalg.norm(A))

fig, axes = plt.subplots(1, 2, figsize=(10, 4.2))
ax = axes[0]
ax.quiver(0, 0, *A, angles="xy", scale_units="xy", scale=1, color="#dc2626", label="A")
ax.quiver(0, 0, *B, angles="xy", scale_units="xy", scale=1, color="#2563eb", label="B")
ax.quiver(0, 0, *proj_vetor, angles="xy", scale_units="xy", scale=1,
          color="#047857", label="proj de B sobre A")
ax.plot([B[0], proj_vetor[0]], [B[1], proj_vetor[1]], "k--", lw=0.8)
ax.set_xlim(-0.5, 4); ax.set_ylim(-0.5, 3); ax.set_aspect("equal"); ax.legend()
ax.set_title(f"A·B = {A@B:.2f} = |A||B|cos(theta), theta={np.degrees(theta):.1f}°")

# Produto vetorial em 3D: A x B é perpendicular ao plano de A e B
A3, B3 = np.array([3, 1, 0]), np.array([1, 2, 0])
cross = np.cross(A3, B3)
ax2 = fig.add_subplot(1, 2, 2, projection="3d")
for v, c, lbl in [(A3, "#dc2626", "A"), (B3, "#2563eb", "B"), (cross, "#7c3aed", "AxB")]:
    ax2.quiver(0, 0, 0, *v, color=c, label=lbl)
ax2.set_title(f"|AxB| = {np.linalg.norm(cross):.2f} = área do paralelogramo")
ax2.legend()
plt.tight_layout()
print("A.B =", A@B, " |AxB| =", np.linalg.norm(cross), " AxB =", cross)
```

::: verificacao
**Verificação Rápida (Concept Check):**
1. Se $\vec A\cdot\vec B=0$ com $\vec A,\vec B\neq\vec0$, o que isso significa geometricamente? **São perpendiculares.**
2. Se $\vec A\times\vec B=\vec 0$ com $\vec A,\vec B\neq\vec0$, o que isso significa? **São paralelos (ou antiparalelos) — não definem um plano com área.**
3. $\vec A\times\vec B$ e $\vec B\times\vec A$ têm a mesma magnitude. Apontam na mesma direção? **Não — sentidos opostos** ($\vec A\times\vec B=-\vec B\times\vec A$).
:::

---

## O Operador Nabla e o Gradiente

### O sentimento físico: "para onde eu deveria andar?"

Imagine-se em pé sobre uma colina cuja altitude é dada por um campo escalar $f(x,y)$ (poderia ser temperatura, potencial elétrico, concentração — qualquer número que muda de ponto a ponto). Uma pergunta natural: **em que direção devo dar um passo para subir o mais rápido possível?** E, uma vez escolhida essa direção, **quão íngreme é a subida?**

O gradiente é a resposta matemática precisa a essas duas perguntas simultaneamente: ele é um vetor que aponta na direção de subida mais rápida, e seu módulo é a inclinação nessa direção. Antes de definir a fórmula, vamos construir essa ideia a partir de algo mais simples — a **derivada direcional**.

::: observação
**O símbolo $\nabla$ não é um vetor comum.** Em cartesianas escrevemos

$$
\nabla=\hat x\,\partial_x+\hat y\,\partial_y+\hat z\,\partial_z,
$$

mas $\nabla$ é um **operador**: ele só produz um resultado quando atua sobre o objeto à sua direita. A operação escolhida determina o tipo da resposta:

$$
\nabla f\quad\text{(gradiente)},\qquad
\nabla\cdot\vec F\quad\text{(divergente)},\qquad
\nabla\times\vec F\quad\text{(rotacional)}.
$$

Trate-o como uma “máquina de derivar”, não como uma seta física independente. Em coordenadas curvilíneas, inclusive, seus fatores de escala mudam.
:::

### Passo 1: taxa de variação em uma direção arbitrária

Suponha que você dá um pequeno passo $d\vec\ell$ a partir do ponto $(x,y,z)$. Quanto $f$ varia? Pela regra da cadeia (derivada total de uma função de várias variáveis):

$$
df = \frac{\partial f}{\partial x}dx+\frac{\partial f}{\partial y}dy+\frac{\partial f}{\partial z}dz
$$

Repare que essa expressão tem a **forma de um produto escalar** (Seção "Produto Escalar (Dot Product) — dedução a partir da projeção"): é a soma de produtos componente a componente entre o vetor $\left(\frac{\partial f}{\partial x},\frac{\partial f}{\partial y},\frac{\partial f}{\partial z}\right)$ e o deslocamento $d\vec\ell=(dx,dy,dz)$. Isso motiva **definir** esse vetor de derivadas parciais como um objeto único:

::: definição
**Definição 1.** Para um campo escalar $f(x,y,z)$, o **gradiente** é o campo vetorial:

$$
\boxed{\nabla f \equiv \frac{\partial f}{\partial x}\hat{x}+\frac{\partial f}{\partial y}\hat{y}+\frac{\partial f}{\partial z}\hat{z}}
$$
:::

de modo que a variação de $f$ ao longo de **qualquer** deslocamento infinitesimal $d\vec\ell = dx\,\hat x+dy\,\hat y+dz\,\hat z$ se escreve, de forma compacta e independente de coordenadas, como:

$$
df = \nabla f\cdot d\vec\ell
$$

### Passo 2: em que direção a subida é mais rápida?

Agora respondemos à pergunta da colina. Escreva $d\vec\ell = d\ell\,\hat u$, onde $\hat u$ é um versor (a **direção do passo**, escolhida por você) e $d\ell>0$ o tamanho do passo. A **taxa de variação de $f$ por unidade de comprimento percorrido**, nessa direção, é a derivada direcional:

$$
\frac{df}{d\ell} = \nabla f\cdot\hat u = |\nabla f|\,|\hat u|\cos\theta = |\nabla f|\cos\theta
$$

onde $\theta$ é o ângulo entre $\nabla f$ (fixo no ponto considerado) e $\hat u$ (a direção que você escolhe). Como $|\nabla f|$ não depende de $\hat u$, a única coisa que você controla é $\cos\theta$ — e $\cos\theta$ é **máximo** (igual a 1) quando $\theta=0$, isto é, quando você escolhe caminhar exatamente na direção de $\nabla f$. Conclusão:

$$
\boxed{\nabla f \text{ aponta na direção de máximo crescimento de } f\text{, com módulo igual a essa taxa máxima.}}
$$

Note também o caso $\theta=180°$: caminhar na direção $-\nabla f$ dá a descida mais rápida (o "caminho de menor esforço para descer a colina"); e $\theta=90°$: caminhar perpendicular a $\nabla f$ **não muda $f$** — você está andando ao longo de uma curva de nível.

::: corolário
**Corolário 1.** $\nabla f$ é sempre perpendicular às superfícies de nível $f=\text{const}$ (pois ao longo dessas superfícies $df=0$, logo $\nabla f\cdot d\vec\ell=0$ para todo $d\vec\ell$ tangente à superfície — só é possível se $\nabla f$ for normal a ela). Esta é exatamente a razão pela qual as linhas de campo $\vec E=-\nabla V$ são perpendiculares às superfícies equipotenciais.
:::

::: verificacao
**Preveja antes de calcular.** Em um mapa topográfico, curvas de nível muito próximas indicam relevo suave ou íngreme? O gradiente deve ter módulo pequeno ou grande?

**Resposta:** íngreme e grande: a mesma variação de $f$ ocorre em uma distância menor.
:::

### Visualização Python — a colina, a bússola do gradiente e a subida mais rápida

O código a seguir simula literalmente a "colina": para um conjunto de direções $\hat u(\theta)$, calcula a derivada direcional $\nabla f\cdot\hat u$ e mostra que ela é máxima exatamente quando $\hat u$ aponta junto com $\nabla f$ — verificando numericamente o Passo 2.

```python
import numpy as np
import matplotlib.pyplot as plt

x = y = np.linspace(-2, 2, 25)
X, Y = np.meshgrid(x, y)
f, gx, gy = X**2 + 2*Y**2, 2*X, 4*Y

fig, axes = plt.subplots(1, 2, figsize=(11, 4.3))

# Painel 1: colina (curvas de nível) e bússola do gradiente
axes[0].contour(X, Y, f, levels=10, cmap="Blues")
axes[0].quiver(X[::2, ::2], Y[::2, ::2], gx[::2, ::2], gy[::2, ::2],
               color="#dc2626", alpha=.8)
axes[0].set_title("Curvas de nível de f e direção de subida (grad f)")
axes[0].set_aspect("equal")

# Painel 2: derivada direcional em (1,1) para todas as direções possíveis
p = np.array([1.0, 1.0])
grad_p = np.array([2*p[0], 4*p[1]])           # grad f em (1,1) = (2,4)
thetas = np.linspace(0, 2*np.pi, 200)
u = np.array([np.cos(thetas), np.sin(thetas)])
df_dl = grad_p @ u                              # derivada direcional df/dl = grad(f).u_hat
axes[1].plot(np.degrees(thetas), df_dl, color="#7c3aed")
theta_grad = np.degrees(np.arctan2(grad_p[1], grad_p[0]))
axes[1].axvline(theta_grad, color="#dc2626", ls="--", label="direção de grad f")
axes[1].axhline(np.linalg.norm(grad_p), color="gray", ls=":", label="|grad f|")
axes[1].set_xlabel("ângulo da direção escolhida (graus)")
axes[1].set_ylabel("df/dl (derivada direcional)")
axes[1].set_title("Máximo exatamente na direção do gradiente")
axes[1].legend()
plt.tight_layout()

print("grad f(1,1) =", tuple(grad_p), " |grad f| =", np.linalg.norm(grad_p))
print("theta que maximiza df/dl:", np.degrees(thetas[np.argmax(df_dl)]),
      " (esperado:", theta_grad, ")")
```

::: verificacao
**Verificação Rápida (Concept Check):**  
1. As setas do gradiente são perpendiculares às curvas de nível? **Sim.**  
2. Onde as curvas de nível estão mais próximas, o gradiente é maior ou menor? **Maior** (variação mais rápida).  
3. O gradiente aponta para valores maiores ou menores de $f$? **Maiores.**
:::

::: exemplo
**Exemplo — gradiente de um produto.** Seja $f(x,y,z) = xyz$. O gradiente é:

$$
\nabla f = yz\,\hat x + xz\,\hat y + xy\,\hat z
$$

No ponto $(1,1,1)$: $\nabla f(1,1,1) = \hat x + \hat y + \hat z$.
:::

### Passo 3: por que empacotar tudo em um único símbolo $\nabla$?

Reparar na Definição 1: o gradiente é construído aplicando o **mesmo padrão** — "derivada parcial na direção $i$, multiplicada pelo versor $\hat u_i$" — três vezes e somando. Esse padrão se repete tantas vezes no eletromagnetismo (a seguir, no divergente e no rotacional) que vale a pena dar-lhe um nome e tratá-lo como um objeto algébrico à parte:

::: definição
**Definição 2.** É conveniente definir o **operador vetorial diferencial nabla**:

$$
\nabla \equiv \hat{x}\frac{\partial}{\partial x}+\hat{y}\frac{\partial}{\partial y}+\hat{z}\frac{\partial}{\partial z}
$$
:::

$\nabla$ não é um vetor no sentido usual (suas "componentes" são instruções de derivação, não números) — é um **operador**: sozinho, não significa nada; só produz um resultado quando aplicado a um campo. Mas ele se comporta *como se fosse* um vetor sob as operações de álgebra vetorial já deduzidas nesta seção, o que é extremamente útil:

- **Gradiente** $\nabla f$: $\nabla$ "multiplicando" um escalar $f$ (analogia com $\vec A$ escalado por um número) $\to$ produz um **vetor**.
- **Divergente** $\nabla\cdot\vec F$: $\nabla$ em **produto escalar** com um campo vetorial $\to$ produz um **escalar** (mede projeção/expansão — Seção "Divergente").
- **Rotacional** $\nabla\times\vec F$: $\nabla$ em **produto vetorial** com um campo vetorial $\to$ produz um **vetor** perpendicular ao "plano de circulação" (Seção "Rotacional").

Ou seja: as três operações fundamentais do cálculo vetorial em eletromagnetismo não são três ideias independentes — são as **três formas de combinar $\nabla$ com um campo**, herdadas diretamente das três operações vetoriais já vistas (escalar × vetor, produto escalar, produto vetorial).

::: exemplo
**Exemplo — gradiente avaliado em um ponto.** Seja $f(x,y,z) = x^2y + z^3$. O gradiente é:

$$
\nabla f = \frac{\partial f}{\partial x}\hat{x}+\frac{\partial f}{\partial y}\hat{y}+\frac{\partial f}{\partial z}\hat{z} = (2xy)\hat{x} + (x^2)\hat{y} + (3z^2)\hat{z}
$$

Em $(1,2,1)$: $\nabla f(1,2,1) = (4)\hat{x} + (1)\hat{y} + (3)\hat{z}$.
:::

---

## Elementos Diferenciais e Integrais

As três integrais desta seção — de linha, de superfície e de volume — não são fórmulas isoladas para decorar: são todas a **mesma ideia** (dividir, aproximar, somar, refinar) aplicada a três geometrias diferentes: um caminho 1D, uma superfície 2D e uma região 3D. Cada uma responde a uma pergunta física concreta: quanto trabalho uma força realiza ao longo de um percurso? Quanto fluido atravessa uma tela? Quanta carga há dentro de uma região? Esta seção deduz as três a partir do mesmo processo de soma de Riemann, com um exemplo numérico para cada uma.

### Elementos Diferenciais de Comprimento, Área e Volume

Em coordenadas cartesianas, os elementos diferenciais são:

- **Comprimento infinitesimal**: $d\vec\ell = dx\,\hat x + dy\,\hat y + dz\,\hat z$
- **Elemento de área**: $d\vec A = dy\,dz\,\hat x + dx\,dz\,\hat y + dx\,dy\,\hat z$ (vetor: magnitude = área, direção = normal à face)
- **Elemento de volume**: $dV = dx\,dy\,dz$

### Integral de Linha — dedução a partir do trabalho

**A pergunta física:** uma partícula percorre uma trajetória $C$ sob a ação de uma força $\vec F(\vec r)$, que pode variar de ponto a ponto e nem sempre aponta na direção do movimento. Qual o trabalho total realizado?

**Passo 1 — discretizar o caminho.** Divida $C$ em $N$ segmentos pequenos, cada um aproximadamente reto, com vetor deslocamento $\Delta\vec\ell_i$ (ligando o início ao fim do segmento $i$). Se $N$ é grande, $\vec F$ é aproximadamente constante dentro de cada segmento — avalie-a em um ponto $\vec r_i$ do segmento.

**Passo 2 — trabalho em cada segmento.** Pela definição de produto escalar (Seção "Produto Escalar (Dot Product) — dedução a partir da projeção"), o trabalho no segmento $i$ é $\Delta W_i \approx \vec F(\vec r_i)\cdot\Delta\vec\ell_i$ — só a componente de $\vec F$ **ao longo** do deslocamento contribui.

```python
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, Arc

fig, ax = plt.subplots(figsize=(7.5, 5.2))

# --- Trajetória C: curva arbitrária (não alinhada com F) ---
t = np.linspace(0, 1, 400)
x = 0.4 + 4.4*t
y = 1.5 + 0.7*np.sin(2.0*t + 0.6) + 0.3*t**2
ax.plot(x, y, color="#1f2937", lw=2.2, zorder=2)
ax.text(x[-1]+0.10, y[-1]-0.05, "C", fontsize=15, style="italic", color="#1f2937")
ax.scatter([x[0], x[-1]], [y[0], y[-1]], s=28, color="#1f2937", zorder=3)
ax.text(x[0]-0.10, y[0]+0.20, "início", fontsize=10, color="#4b5563")
ax.text(x[-1]-0.55, y[-1]-0.42, "fim", fontsize=10, color="#4b5563")

# --- Ponto de avaliação r_i ao longo de C ---
i0 = 200
P = np.array([x[i0], y[i0]])

# vetor deslocamento local dl (tangente à curva, direção do movimento)
dstep = 6
dvec = np.array([x[i0+dstep]-x[i0-dstep], y[i0+dstep]-y[i0-dstep]])
dl_hat = dvec / np.linalg.norm(dvec)

# --- Força F em P: escolhida para não ser paralela ao deslocamento ---
F_mag, F_angle_offset = 1.35, np.deg2rad(55)
theta_dl = np.arctan2(dl_hat[1], dl_hat[0])
theta_F = theta_dl + F_angle_offset
F = F_mag * np.array([np.cos(theta_F), np.sin(theta_F)])

# decomposição: componente paralela e perpendicular a dl_hat
F_par = np.dot(F, dl_hat) * dl_hat
F_perp = F - F_par

def arrow(p0, vec, color, lw=2.6, z=5, mut=16):
    ax.add_patch(FancyArrowPatch(p0, p0+vec, arrowstyle="-|>", color=color,
                                  lw=lw, mutation_scale=mut, zorder=z,
                                  shrinkA=0, shrinkB=0))

ax.scatter(*P, s=45, color="#111827", zorder=8)
ax.text(P[0]-0.55, P[1]-0.12, r"$\vec r_i$", fontsize=13, color="#111827")

dl_draw = dl_hat * 0.9
arrow(P, dl_draw, "#059669", lw=2.4, mut=14, z=6)
ax.text(*(P+dl_draw+[0.35, -0.05]), r"$\Delta\vec\ell_i$", fontsize=15, color="#059669")

arrow(P, F, "#9ca3af", lw=2.2, mut=16, z=4)                 # F completa
ax.text(*(P+F+[-0.55, 0.05]), r"$\vec F$", fontsize=16, color="#6b7280")

arrow(P, F_par, "#dc2626", lw=3.2, mut=18, z=7)              # componente paralela: realiza trabalho
ax.text(*(P+F_par+[-0.15, -0.35]), r"$\vec F_\parallel$", fontsize=15, color="#dc2626")

arrow(P+F_par, F_perp, "#2563eb", lw=2.6, mut=16, z=7)       # componente perpendicular: não realiza trabalho
tip_perp = P + F_par + F_perp
ax.text(*(tip_perp+[0.18, -0.05]), r"$\vec F_\perp$", fontsize=15, color="#2563eb")

ang1, ang2 = np.rad2deg(theta_dl), np.rad2deg(theta_F)
ax.add_patch(Arc(P, 0.85, 0.85, angle=0, theta1=min(ang1,ang2), theta2=max(ang1,ang2),
                  color="#7c3aed", lw=1.8, zorder=6))
theta_mid = np.deg2rad((ang1+ang2)/2)
ax.text(P[0]+0.52*np.cos(theta_mid)-0.05, P[1]+0.52*np.sin(theta_mid)+0.08,
        r"$\theta$", fontsize=13, color="#7c3aed")

key_x = np.concatenate([x, [P[0], (P+F)[0], (P+F_par)[0], tip_perp[0]]])
key_y = np.concatenate([y, [P[1], (P+F)[1], (P+F_par)[1], tip_perp[1]]])
margin = 0.6
ax.set_xlim(key_x.min()-margin, key_x.max()+margin)
ax.set_ylim(key_y.min()-margin, key_y.max()+margin)
ax.set_aspect("equal"); ax.axis("off")
ax.set_title("Trabalho como projeção da força sobre o deslocamento", fontsize=13.5, pad=10)

fig.text(0.5, 0.015,
         r"$\Delta W_i \approx \vec F(\vec r_i) \cdot \Delta\vec\ell_i = |\vec F|\,|\Delta\vec\ell_i|\cos\theta \;\;$"
         r"— apenas $\vec F_\parallel$ realiza trabalho; $\vec F_\perp$ não contribui",
         fontsize=11.5, ha="center", va="bottom", color="#1f2937",
         bbox=dict(boxstyle="round,pad=0.45", facecolor="#f9fafb", edgecolor="#d1d5db"))

plt.tight_layout(rect=[0, 0.08, 1, 1])
plt.savefig("trabalho_forca.png", dpi=170, bbox_inches="tight")
plt.show()
```

A figura mostra o segmento $i$ da discretização: a força $\vec F$ (cinza) no ponto $\vec r_i$ é decomposta em $\vec F_\parallel$ (vermelho, paralela a $\Delta\vec\ell_i$) e $\vec F_\perp$ (azul, perpendicular). Apenas $\vec F_\parallel = |\vec F|\cos\theta$ contribui para $\Delta W_i$ — geometricamente, $\vec F_\perp$ apenas tenta curvar a trajetória, sem acelerar nem desacelerar a partícula ao longo de $C$.

**Passo 3 — somar e refinar.** O trabalho total é a soma sobre todos os segmentos; tomando o limite $N\to\infty$ (cada $\Delta\vec\ell_i\to d\vec\ell$), a soma vira uma integral:

$$
W = \lim_{N\to\infty}\sum_{i=1}^N \vec F(\vec r_i)\cdot\Delta\vec\ell_i \;\equiv\; \boxed{\int_C \vec F \cdot d\vec\ell}
$$

Esta é a **integral de linha**, e mede a **circulação** do campo ao longo de $C$ (soma acumulada da componente tangencial de $\vec F$). Se $\vec F$ é sempre perpendicular a $C$, a integral se anula — nenhum trabalho é realizado, exatamente como no Exemplo 0a.

### Integral de Superfície — dedução a partir do fluxo

**A pergunta física:** quanto de um campo vetorial $\vec F(\vec r)$ (pense em velocidade de um fluido, ou densidade de linhas de campo elétrico) "atravessa" uma superfície $S$ por unidade de tempo?

**Passo 1 — discretizar a superfície.** Divida $S$ em $N$ pequenos retalhos, cada um aproximadamente plano, com vetor de área $\Delta\vec A_i = \Delta A_i\,\hat n_i$ (magnitude = área do retalho, direção = normal local, escolhida por convenção — para superfícies fechadas, apontando para fora).

**Passo 2 — fluxo por retalho.** Apenas a componente de $\vec F$ **perpendicular** ao retalho ("atravessando" a tela) contribui ao fluxo; a componente tangencial desliza ao longo da superfície sem atravessá-la. Pela mesma lógica do produto escalar: $\Delta\Phi_i \approx \vec F(\vec r_i)\cdot\Delta\vec A_i$.

```python
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, Arc

fig, ax = plt.subplots(figsize=(7.5, 4.6))

# --- Superfície S: uma "tela" curva vista de perfil, com um retalho plano destacado ---
t = np.linspace(0, 1, 400)
x = 0.4 + 4.4*t
y = 1.5 + 0.7*np.sin(2.0*t + 0.6) + 0.3*t**2
ax.plot(x, y, color="#1f2937", lw=2.2, zorder=2)
ax.text(x[-1]+0.10, y[-1]-0.05, "S", fontsize=15, style="italic", color="#1f2937")

# retalho (segmento reto) em torno do ponto de avaliação
i0 = 200
dstep = 18
p0 = np.array([x[i0-dstep], y[i0-dstep]])
p1 = np.array([x[i0+dstep], y[i0+dstep]])
P = (p0+p1) / 2
ax.plot([p0[0], p1[0]], [p0[1], p1[1]], color="#111827", lw=4.5, zorder=3, solid_capstyle="round")

# tangente do retalho e normal (perpendicular, apontando "para fora")
t_hat = (p1-p0) / np.linalg.norm(p1-p0)
n_hat = np.array([-t_hat[1], t_hat[0]])
if n_hat[1] < 0:
    n_hat = -n_hat

# --- Campo F em P: não alinhado com a normal ---
F_mag, F_angle_offset = 1.5, np.deg2rad(55)
theta_n = np.arctan2(n_hat[1], n_hat[0])
theta_F = theta_n + F_angle_offset
F = F_mag * np.array([np.cos(theta_F), np.sin(theta_F)])

F_perp = np.dot(F, n_hat) * n_hat   # componente normal: contribui ao fluxo
F_tan = F - F_perp                   # componente tangencial: não contribui

def arrow(p0_, vec, color, lw=2.6, z=5, mut=16):
    ax.add_patch(FancyArrowPatch(p0_, p0_+vec, arrowstyle="-|>", color=color,
                                  lw=lw, mutation_scale=mut, zorder=z,
                                  shrinkA=0, shrinkB=0))

ax.scatter(*P, s=45, color="#111827", zorder=8)
ax.text(P[0]-0.55, P[1]-0.12, r"$\vec r_i$", fontsize=13, color="#111827")

offset_draw = t_hat * 0.35
nA_draw = n_hat * 0.9
arrow(P+offset_draw, nA_draw, "#059669", lw=2.4, mut=14, z=6)
ax.text(*(P+offset_draw+nA_draw+[0.10, 0.05]), r"$\Delta\vec A_i$", fontsize=15, color="#059669")

arrow(P, F, "#9ca3af", lw=2.2, mut=16, z=4)                  # F completa
ax.text(*(P+F+[0.12, 0.08]), r"$\vec F$", fontsize=16, color="#6b7280")

arrow(P, F_perp, "#dc2626", lw=3.2, mut=18, z=7)             # componente normal: contribui ao fluxo
ax.text(*(P+F_perp+[-0.55, -0.05]), r"$\vec F_\perp$", fontsize=15, color="#dc2626")

arrow(P+F_perp, F_tan, "#2563eb", lw=2.6, mut=16, z=7)       # componente tangencial: não contribui
tip_tan = P + F_perp + F_tan
ax.text(*(tip_tan+[-1.1, 0.10]), r"$\vec F_\parallel$", fontsize=15, color="#2563eb")

ang1, ang2 = np.rad2deg(theta_n), np.rad2deg(theta_F)
ax.add_patch(Arc(P, 0.85, 0.85, angle=0, theta1=min(ang1,ang2), theta2=max(ang1,ang2),
                  color="#7c3aed", lw=1.8, zorder=6))
theta_mid = np.deg2rad((ang1+ang2)/2)
ax.text(P[0]+0.55*np.cos(theta_mid)+0.05, P[1]+0.55*np.sin(theta_mid)+0.05,
        r"$\theta$", fontsize=13, color="#7c3aed")

key_x = np.concatenate([x, [P[0], (P+F)[0], (P+F_perp)[0], tip_tan[0], (P+offset_draw+nA_draw)[0]]])
key_y = np.concatenate([y, [P[1], (P+F)[1], (P+F_perp)[1], tip_tan[1], (P+offset_draw+nA_draw)[1]]])
margin = 0.6
ax.set_xlim(key_x.min()-margin, key_x.max()+margin)
ax.set_ylim(key_y.min()-margin, key_y.max()+margin)
ax.set_aspect("equal"); ax.axis("off")
ax.set_title("Fluxo como projeção da força sobre o retalho de área", fontsize=13.5, pad=10)

fig.text(0.5, 0.015,
         r"$\Delta \Phi_i \approx \vec F(\vec r_i) \cdot \Delta\vec A_i = |\vec F|\,|\Delta\vec A_i|\cos\theta \;\;$"
         r"— apenas $\vec F_\perp$ atravessa a tela; $\vec F_\parallel$ desliza sobre ela",
         fontsize=11.5, ha="center", va="bottom", color="#1f2937",
         bbox=dict(boxstyle="round,pad=0.45", facecolor="#f9fafb", edgecolor="#d1d5db"))

plt.tight_layout(rect=[0, 0.08, 1, 1])
plt.savefig("fluxo_superficie.png", dpi=170, bbox_inches="tight")
plt.show()
```

A figura mostra o retalho $i$ da discretização: o vetor de área $\Delta\vec A_i$ (verde) aponta ao longo da normal ao retalho. A força $\vec F$ (cinza) em $\vec r_i$ é decomposta em $\vec F_\perp$ (vermelho, paralela à normal) e $\vec F_\parallel$ (azul, tangencial ao retalho). Apenas $\vec F_\perp = |\vec F|\cos\theta$ contribui para $\Delta\Phi_i$ — a componente tangencial desliza sobre a superfície sem atravessá-la, exatamente o papel inverso do que acontecia na integral de linha.

**Passo 3 — somar e refinar:**

$$
\Phi = \lim_{N\to\infty}\sum_{i=1}^N \vec F(\vec r_i)\cdot\Delta\vec A_i \;\equiv\; \boxed{\int_S \vec F \cdot d\vec A}
$$

Esta é a **integral de superfície** (ou **fluxo**) de $\vec F$ através de $S$. É exatamente esta grandeza que aparece na Lei de Gauss ($\oint_S\vec E\cdot d\vec A=Q_{env}/\varepsilon_0$) e no Teorema do Divergente (Seção "Divergente").

### Integral de Volume — dedução a partir da acumulação

**A pergunta física:** dada uma densidade $f(\vec r)$ (ex.: densidade de carga $\rho$), qual a quantidade total contida em uma região $V$?

**Passo 1 — discretizar o volume.** Divida $V$ em $N$ pequenas células, cada uma com volume $\Delta V_i$. Se $N$ é grande, $f$ é aproximadamente constante em cada célula.

**Passo 2 — quantidade por célula.** A contribuição da célula $i$ é (densidade) × (volume): $\Delta Q_i \approx f(\vec r_i)\,\Delta V_i$.

```python
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

fig, ax = plt.subplots(figsize=(7.5, 4.6))

# --- Região V: contorno irregular fechado (vista 2D de uma região de volume) ---
theta = np.linspace(0, 2*np.pi, 300)
r = 1.9 + 0.35*np.sin(3*theta) + 0.15*np.cos(5*theta)
cx, cy = 3.0, 2.1
Vx = cx + r*np.cos(theta)
Vy = cy + r*np.sin(theta)
ax.plot(Vx, Vy, color="#1f2937", lw=2.2, zorder=2)
ax.fill(Vx, Vy, color="#e5e7eb", alpha=0.35, zorder=1)
ax.text(cx+2.05, cy+1.35, "V", fontsize=15, style="italic", color="#1f2937")

# --- grade de células cobrindo a bounding box, mantendo só as que caem dentro de V ---
n = 8
xs = np.linspace(cx-2.1, cx+2.1, n+1)
ys = np.linspace(cy-2.1, cy+2.1, n+1)

def inside(px, py):
    ang = np.arctan2(py-cy, px-cx)
    rr = 1.9 + 0.35*np.sin(3*ang) + 0.15*np.cos(5*ang)
    return (px-cx)**2 + (py-cy)**2 <= rr**2

cell_w, cell_h = xs[1]-xs[0], ys[1]-ys[0]

drawn_cells = []
for i in range(n):
    for j in range(n):
        xc, yc = (xs[i]+xs[i+1])/2, (ys[j]+ys[j+1])/2
        if inside(xc, yc):
            ax.add_patch(Rectangle((xs[i], ys[j]), cell_w, cell_h,
                                    facecolor="none", edgecolor="#9ca3af", lw=0.9, zorder=3))
            drawn_cells.append((xs[i], ys[j], xc, yc))

# --- célula i em destaque (próxima do centro) ---
drawn_cells.sort(key=lambda c: (c[2]-cx)**2 + (c[3]-cy)**2)
xi0, yi0, xci, yci = drawn_cells[2]
ax.add_patch(Rectangle((xi0, yi0), cell_w, cell_h,
                        facecolor="#dc2626", alpha=0.35, edgecolor="#dc2626", lw=2.2, zorder=5))

ax.annotate(r"$\Delta V_i$", xy=(xi0+cell_w, yi0+cell_h*0.5), xytext=(xi0+cell_w+0.9, yi0+cell_h*0.5+0.55),
            fontsize=15, color="#dc2626",
            arrowprops=dict(arrowstyle="-", color="#dc2626", lw=1.3))

ax.scatter(xci, yci, s=30, color="#111827", zorder=7)
ax.text(xci-0.05, yci-0.55, r"$f(\vec r_i)$", fontsize=12.5, color="#7f1d1d", zorder=6, ha="center")

# --- seta ilustrando o refinamento N -> infinito ---
ax.annotate("", xy=(cx+3.3, cy-1.6), xytext=(cx+2.55, cy-1.6),
            arrowprops=dict(arrowstyle="-|>", color="#059669", lw=2))
ax.text(cx+2.55, cy-2.05, r"$N\to\infty$", fontsize=12, color="#059669")

ax.set_xlim(cx-2.9, cx+4.3)
ax.set_ylim(cy-2.6, cy+2.6)
ax.set_aspect("equal"); ax.axis("off")
ax.set_title("Integral de volume como soma de contribuições por célula", fontsize=13.5, pad=10)

fig.text(0.5, 0.015,
         r"$\Delta Q_i \approx f(\vec r_i)\,\Delta V_i \;\;$"
         r"— soma sobre todas as células $\Delta V_i$ dentro de $V$, refinando $N\to\infty$",
         fontsize=11.5, ha="center", va="bottom", color="#1f2937",
         bbox=dict(boxstyle="round,pad=0.45", facecolor="#f9fafb", edgecolor="#d1d5db"))

plt.tight_layout(rect=[0, 0.08, 1, 1])
plt.savefig("integral_volume.png", dpi=170, bbox_inches="tight")
plt.show()
```

A figura mostra a região $V$ dividida em uma grade de células; a célula $i$ em destaque (vermelho) tem volume $\Delta V_i$ e densidade $f(\vec r_i)$ avaliada em seu centro. Diferente das duas integrais anteriores, aqui não há decomposição vetorial — $f$ é um escalar, então toda a densidade da célula contribui integralmente para $\Delta Q_i$, sem componente "desperdiçada".

**Passo 3 — somar e refinar:**

$$
Q = \lim_{N\to\infty}\sum_{i=1}^N f(\vec r_i)\,\Delta V_i \;\equiv\; \boxed{\int_V f\,dV}
$$

Esta é a **integral de volume**: soma uma grandeza escalar sobre uma região $V$ — por exemplo, $Q=\int_V\rho\,dV$ é a carga total contida em $V$ dada sua densidade volumétrica $\rho(\vec r)$.

### Visualização Python — as três integrais como somas de Riemann que convergem

O código refina progressivamente $N$ (número de segmentos/retalhos/células) para as três integrais e mostra a soma discreta convergindo para o valor exato conhecido — a mesma lógica de "dividir, aproximar, somar, refinar" dos três Passos acima, mas agora executada numericamente.

```python
import numpy as np
import matplotlib.pyplot as plt

# --- Integral de linha: trabalho de F=(-y,x) ao longo do círculo unitário (0 a pi) ---
def integral_linha(N):
    t = np.linspace(0, np.pi, N+1)
    pontos = np.stack([np.cos(t), np.sin(t)], axis=1)
    F = np.stack([-pontos[:,1], pontos[:,0]], axis=1)      # F=(-y,x) nos pontos médios
    dl = np.diff(pontos, axis=0)                            # Delta l_i (vetor)
    F_meio = (F[:-1] + F[1:]) / 2                           # F no ponto médio do segmento
    return np.sum(np.einsum('ij,ij->i', F_meio, dl))

# --- Integral de superfície: fluxo de F=(x,y,z) através da esfera unitária (F.n = 1 sempre) ---
def integral_superficie(n):
    theta = np.linspace(0, np.pi, n)
    phi = np.linspace(0, 2*np.pi, 2*n)
    dtheta, dphi = theta[1]-theta[0], phi[1]-phi[0]
    fluxo = 0.0
    for th in theta:
        dA = np.sin(th) * dtheta * dphi          # elemento de área na esfera unitária
        fluxo += dA * len(phi)                    # F.n_hat = R = 1 em toda a esfera
    return fluxo

# --- Integral de volume: carga total com rho=3 (constante) numa esfera de raio 1 ---
def integral_volume(n):
    r = np.linspace(0, 1, n)
    dr = r[1] - r[0]
    return np.sum(3 * 4*np.pi*r**2 * dr)          # soma de cascas esféricas 4*pi*r^2*dr

Ns = [4, 8, 16, 32, 64, 128, 256]
linha_vals = [integral_linha(N) for N in Ns]
sup_vals = [integral_superficie(N) for N in Ns]
vol_vals = [integral_volume(N) for N in Ns]

fig, axes = plt.subplots(1, 3, figsize=(13, 3.8))
axes[0].plot(Ns, linha_vals, "o-", color="#dc2626")
axes[0].axhline(np.pi, color="gray", ls="--", label="valor exato = pi")
axes[0].set_title("Integral de linha (trabalho)"); axes[0].set_xlabel("N segmentos"); axes[0].legend()

axes[1].plot(Ns, sup_vals, "o-", color="#2563eb")
axes[1].axhline(4*np.pi, color="gray", ls="--", label="valor exato = 4*pi")
axes[1].set_title("Integral de superfície (fluxo)"); axes[1].set_xlabel("N retalhos"); axes[1].legend()

axes[2].plot(Ns, vol_vals, "o-", color="#047857")
axes[2].axhline(4*np.pi, color="gray", ls="--", label="valor exato = 4*pi")
axes[2].set_title("Integral de volume (carga total)"); axes[2].set_xlabel("N cascas"); axes[2].legend()
for ax in axes:
    ax.set_xscale("log")
plt.tight_layout()

print(f"Linha:      N={Ns[-1]:4d} -> {linha_vals[-1]:.6f}  (exato: {np.pi:.6f})")
print(f"Superfície: N={Ns[-1]:4d} -> {sup_vals[-1]:.6f}  (exato: {4*np.pi:.6f})")
print(f"Volume:     N={Ns[-1]:4d} -> {vol_vals[-1]:.6f}  (exato: {4*np.pi:.6f})")
```

::: verificacao
**Verificação Rápida (Concept Check):**
1. Na integral de linha, qual componente de $\vec F$ contribui: a **tangencial** ou a **normal** ao caminho? **Tangencial** (é um produto escalar com $d\vec\ell$, que aponta ao longo da curva).
2. Na integral de superfície, qual componente de $\vec F$ contribui: a **tangencial** ou a **normal** à superfície? **Normal** (produto escalar com $d\vec A$, que aponta perpendicular à superfície).
3. Se $f>0$ em todo ponto de $V$, o sinal de $\int_V f\,dV$ pode ser negativo? **Não** — soma de termos positivos.
:::

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
**Exemplo — divergente não uniforme.** Seja $\vec F = (x^2,\,2xy,\,-z^2)$. O divergente é:

$$
\nabla\cdot\vec F = \frac{\partial}{\partial x}(x^2)+\frac{\partial}{\partial y}(2xy)+\frac{\partial}{\partial z}(-z^2) = 2x + 2x - 2z = 4x-2z
$$

O campo tem fontes onde $4x-2z\neq0$, isto é, em quase todo ponto exceto no plano $z=2x$.
:::

### Dedução da interpretação física (fluxo por unidade de volume)

Considere um cubo infinitesimal de lados $dx,dy,dz$, centrado em $(x,y,z)$. O fluxo de $\vec F$ saindo pela face direita ($x+dx/2$) menos o que entra pela face esquerda ($x-dx/2$):

### Visualização Python — o cubo infinitesimal e o balanço de fluxo

O painel esquerdo mostra o cubo no espaço 3D, com as faces $x-dx/2$ (azul, por onde o campo entra) e $x+dx/2$ (vermelha, por onde sai) destacadas. O painel direito é um corte na direção $x$: as setas têm comprimentos proporcionais a $F_x$ em cada face — a seta vermelha (saída) é desenhada maior que a azul (entrada) propositalmente, ilustrando o caso $\partial F_x/\partial x>0$ (divergente positivo nessa direção). É exatamente essa diferença de comprimento — "o que sai menos o que entra" — que a Eq. do $d\Phi_x$ abaixo quantifica.

```python
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
from matplotlib.patches import FancyArrowPatch, Rectangle
from mpl_toolkits.mplot3d.proj3d import proj_transform

class Arrow3D(FancyArrowPatch):
    def __init__(self, xs, ys, zs, *args, **kwargs):
        super().__init__((0, 0), (0, 0), *args, **kwargs)
        self._verts3d = xs, ys, zs
    def do_3d_projection(self, renderer=None):
        xs3d, ys3d, zs3d = self._verts3d
        xs, ys, zs = proj_transform(xs3d, ys3d, zs3d, self.axes.M)
        self.set_positions((xs[0], ys[0]), (xs[1], ys[1]))
        return min(zs)

fig = plt.figure(figsize=(12, 5.2))

# --- Painel 1: cubo em 3D, com as faces -x (azul) e +x (vermelha) destacadas ---
ax = fig.add_subplot(1, 2, 1, projection="3d")
h = 1.0
xr = yr = zr = [-h, h]
corners = np.array([[cx, cy, cz] for cx in xr for cy in yr for cz in zr])
edges = [(0,1),(0,2),(0,4),(1,3),(1,5),(2,3),(2,6),(3,7),(4,5),(4,6),(5,7),(6,7)]
for i, j in edges:
    ax.plot(*zip(corners[i], corners[j]), color="black", lw=1.1)

face_right = np.array([[h,-h,-h],[h,h,-h],[h,h,h],[h,-h,h]])
face_left  = np.array([[-h,-h,-h],[-h,h,-h],[-h,h,h],[-h,-h,h]])
ax.add_collection3d(Poly3DCollection([face_right], facecolor="#dc2626", alpha=0.3, edgecolor="none"))
ax.add_collection3d(Poly3DCollection([face_left], facecolor="#2563eb", alpha=0.3, edgecolor="none"))

ax.add_artist(Arrow3D([-h-1.1, -h], [0, 0], [0, 0], mutation_scale=18, lw=3, color="#2563eb", arrowstyle="-|>"))
ax.add_artist(Arrow3D([h, h+1.7], [0, 0], [0, 0], mutation_scale=18, lw=3, color="#dc2626", arrowstyle="-|>"))

ax.scatter([0], [0], [0], color="black", s=30)
ax.text(0.05, 0.05, 0.15, r"$(x,y,z)$", fontsize=10)
ax.text(-h-0.55, 0.15, 0.55, r"$F_x(x-\frac{dx}{2})$", color="#2563eb", fontsize=10, ha="center")
ax.text(h+0.85, 0.15, 0.55, r"$F_x(x+\frac{dx}{2})$", color="#dc2626", fontsize=10, ha="center")
ax.set_xlim(-2.8, 2.8); ax.set_ylim(-1.5, 1.5); ax.set_zlim(-1.5, 1.5)
ax.set_xlabel("x"); ax.set_ylabel("y"); ax.set_zlabel("z")
ax.set_box_aspect([1.4, 1, 1])
ax.view_init(elev=16, azim=-60)
ax.set_title("Cubo infinitesimal $dx\\,dy\\,dz$\ncentrado em $(x,y,z)$", fontsize=11)

# --- Painel 2: corte 2D na direção x, com o balanço entra/sai ---
ax2 = fig.add_subplot(1, 2, 2)
ax2.add_patch(Rectangle((-1, -1), 2, 2, facecolor="#f8fafc", edgecolor="black", lw=1.8))
ax2.annotate("", xy=(-1, 0), xytext=(-2.3, 0),
             arrowprops=dict(arrowstyle="-|>", color="#2563eb", lw=3, mutation_scale=22))
ax2.annotate("", xy=(2.6, 0), xytext=(1, 0),
             arrowprops=dict(arrowstyle="-|>", color="#dc2626", lw=3, mutation_scale=22))
ax2.text(-1.65, 0.35, r"$F_x\!\left(x-\frac{dx}{2}\right)$", color="#2563eb", fontsize=13, ha="center")
ax2.text(1.8, 0.35, r"$F_x\!\left(x+\frac{dx}{2}\right)$", color="#dc2626", fontsize=13, ha="center")
ax2.text(-1, -1.2, r"área $dy\,dz$", color="#2563eb", fontsize=10, ha="center", va="top")
ax2.text(1, -1.2, r"área $dy\,dz$", color="#dc2626", fontsize=10, ha="center", va="top")
ax2.plot(0, 0, "ko", ms=6)
ax2.text(0, -0.28, r"$(x,y,z)$", fontsize=11, ha="center", va="top")
ax2.annotate("", xy=(1, -1.5), xytext=(-1, -1.5), arrowprops=dict(arrowstyle="<->", color="gray"))
ax2.text(0, -1.75, r"$dx$", color="gray", fontsize=12, ha="center")
ax2.set_xlim(-2.7, 3.0); ax2.set_ylim(-2.1, 1.4)
ax2.set_aspect("equal"); ax2.axis("off")
ax2.set_title(r"Corte na direção $x$: $F_x$ maior saindo do que entrando"
              + "\n" + r"$\Rightarrow d\Phi_x \approx \frac{\partial F_x}{\partial x}\,dx\,dy\,dz > 0$", fontsize=11)

plt.tight_layout()
print("Painel esquerdo: geometria do cubo. Painel direito: balanço de fluxo na direção x.")
```

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

::: observação
**Observação (por que o cubo e não outra forma?).** Usamos um cubo por conveniência algébrica — as três direções se separam e a série de Taylor fica simples —, mas o resultado $\nabla\cdot\vec F=\lim_{\Delta V\to0}\frac1{\Delta V}\oint\vec F\cdot d\vec A$ vale para **qualquer** forma de volume infinitesimal (esfera, tetraedro, etc.). A razão: qualquer sólido pequeno pode ser aproximado por uma malha fina de cubos (Seção "Teorema do Divergente (Gauss–Ostrogradsky) — prova completa", mesmo argumento de cancelamento nas faces internas); no limite $\Delta V\to0$, a razão fluxo/volume converge para o mesmo número $\nabla\cdot\vec F$ no ponto, **independente da forma escolhida** — é essa independência de forma que torna o divergente uma propriedade *local* do campo, e não um artefato da geometria do cubo.
:::

::: insight
**Insight para lembrar.** Pense no divergente como um **balanço contábil de fluxo**: "o que sai menos o que entra, por unidade de volume". Um voxel de fluido com $\nabla\cdot\vec F>0$ está perdendo massa (há uma fonte ali — como um pequeno chuveiro injetando fluido); $\nabla\cdot\vec F<0$, ganhando massa (sorvedouro — um ralo); $\nabla\cdot\vec F=0$, o que entra sai. Em eletrostática, este balanço **é literalmente** a Lei de Gauss na forma local: $\nabla\cdot\vec E=\rho/\varepsilon_0$ diz que as únicas "fontes" ou "sorvedouros" de linhas de campo elétrico são as cargas — o campo elétrico só diverge onde há carga.
:::

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
**Exemplo — campo solenoidal.** Seja $\vec F = z\,\hat x + x\,\hat y + y\,\hat z$. O divergente é:

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

::: insight
**Receita de uso — não comece integrando.**

1. Confirme que $S$ é **fechada**. Se houver uma abertura, feche-a temporariamente e subtraia o fluxo da tampa.
2. Calcule $\nabla\cdot\vec F$.
3. Descreva o **volume interior** $V$ e escolha coordenadas compatíveis com sua simetria.
4. Integre $(\nabla\cdot\vec F)\,dV$.
5. Confira o sinal: fluxo positivo significa saldo para fora.

O teorema costuma ser vantajoso quando o divergente é mais simples que o campo sobre cada face. Ele não “elimina” a integral: troca uma integral de superfície por uma integral de volume.
:::

::: verificacao
**Previsão de sinal.** Para $\vec F=(x,y,z)$ em qualquer esfera centrada na origem, o fluxo é positivo, negativo ou zero?

**Resposta:** positivo, pois o campo aponta para fora e $\nabla\cdot\vec F=3>0$ em todo o interior.
:::

**Prova**: divida $V$ em $N$ cubos infinitesimais adjacentes $\Delta V_i$. Pela Seção “Dedução da interpretação física (fluxo por unidade de volume)”, o fluxo através da fronteira de cada cubo é $(\nabla\cdot\vec F)_i\,\Delta V_i$. Somando sobre todos os cubos:

$$
\sum_i \oint_{\partial(\Delta V_i)}\vec F\cdot d\vec A = \sum_i(\nabla\cdot\vec F)_i\,\Delta V_i \;\xrightarrow{N\to\infty}\; \int_V(\nabla\cdot\vec F)\,dV
$$

Para o lado esquerdo, note que cada face **interna** (compartilhada por dois cubos vizinhos) é percorrida duas vezes com normais opostas ($+\hat n$ para um cubo, $-\hat n$ para o vizinho) — essas contribuições se cancelam exatamente. Sobrevivem apenas as faces na **fronteira externa** de $V$, que juntas compõem $S$:

```python
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
from matplotlib.patches import FancyArrowPatch
from mpl_toolkits.mplot3d.proj3d import proj_transform

class Arrow3D(FancyArrowPatch):
    def __init__(self, xs, ys, zs, *args, **kwargs):
        super().__init__((0, 0), (0, 0), *args, **kwargs)
        self._verts3d = xs, ys, zs
    def do_3d_projection(self, renderer=None):
        xs3d, ys3d, zs3d = self._verts3d
        xs, ys, zs = proj_transform(xs3d, ys3d, zs3d, self.axes.M)
        self.set_positions((xs[0], ys[0]), (xs[1], ys[1]))
        return min(zs)

fig = plt.figure(figsize=(12.5, 5.4))

# ============ Painel esquerdo: bloco 2x2x2 de cubos, só a superfície externa em destaque ============
ax = fig.add_subplot(1, 2, 1, projection="3d")
n, h = 2, 1.0  # grade n x n x n de subcubos de lado h

corners_local = np.array([[px,py,pz] for px in (0,1) for py in (0,1) for pz in (0,1)])
edges = [(0,1),(0,2),(0,4),(1,3),(1,5),(2,3),(2,6),(3,7),(4,5),(4,6),(5,7),(6,7)]
L = n*h

# arestas de todos os subcubos (linhas internas finas cinza)
for i in range(n):
    for j in range(n):
        for k in range(n):
            c = corners_local*h + np.array([i*h, j*h, k*h])
            for a, b in edges:
                ax.plot(*zip(c[a], c[b]), color="#9ca3af", lw=1.0, zorder=2)

# contorno externo do bloco inteiro, em preto grosso, por cima (destaca a fronteira S)
corners = np.array([[cx,cy,cz] for cx in [0,L] for cy in [0,L] for cz in [0,L]])
for a, b in edges:
    ax.plot(*zip(corners[a], corners[b]), color="#111827", lw=2.8, zorder=10)

# plano interno compartilhado em x=h: duas normais opostas, desenhadas por cima de tudo
ym, zm = L/2, L/2
ax.add_artist(Arrow3D([h-0.85, h-0.05], [ym, ym], [zm, zm], mutation_scale=18, lw=3.2, color="#dc2626", arrowstyle="-|>"))
ax.add_artist(Arrow3D([h+0.85, h+0.05], [ym, ym], [zm, zm], mutation_scale=18, lw=3.2, color="#2563eb", arrowstyle="-|>"))

ax.set_xlim(-0.3, L+0.3); ax.set_ylim(-0.3, L+0.3); ax.set_zlim(-0.3, L+0.3)
ax.set_box_aspect([1,1,1])
ax.view_init(elev=18, azim=-55)
ax.set_axis_off()
ax.set_title("V dividido em cubos adjacentes:\nsó a superfície externa $S$ sobrevive", fontsize=12)

# ============ Painel direito: corte 1D em fila de 3 cubos, mostrando o cancelamento ============
ax2 = fig.add_subplot(1, 2, 2)
m = 3
for i in range(m):
    ax2.add_patch(plt.Rectangle((i, 0), 1, 1, facecolor="#eff6ff", edgecolor="#9ca3af", lw=1.0, zorder=1))

def arrow2(p0, p1, color, lw=2.6, mut=16, z=5):
    ax2.add_patch(FancyArrowPatch(p0, p1, arrowstyle="-|>", color=color, lw=lw,
                                   mutation_scale=mut, zorder=z, shrinkA=0, shrinkB=0))

for xline in [1, 2]:  # faces internas: normais opostas se cancelam
    arrow2((xline-0.35, 0.5), (xline, 0.5), "#dc2626", lw=2.2, mut=13)
    arrow2((xline+0.35, 0.5), (xline, 0.5), "#2563eb", lw=2.2, mut=13)

arrow2((0, 0.5), (-0.5, 0.5), "#111827", lw=3, mut=18)   # faces externas: sobrevivem
arrow2((3, 0.5), (3.5, 0.5), "#111827", lw=3, mut=18)

ax2.plot([0,3,3,0,0],[0,0,1,1,0], color="#111827", lw=2.4, zorder=6)
ax2.text(-0.75, 0.5, r"$\oint_S$", fontsize=13, color="#111827", ha="center", va="center")
ax2.text(3.75, 0.5, r"$\oint_S$", fontsize=13, color="#111827", ha="center", va="center")
ax2.text(1, -0.35, "cancelam", fontsize=10, color="#374151", ha="center")
ax2.text(2, -0.35, "cancelam", fontsize=10, color="#374151", ha="center")

ax2.set_xlim(-1.3, 4.3)
ax2.set_ylim(-0.8, 1.5)
ax2.set_aspect("equal"); ax2.axis("off")
ax2.set_title("Corte 1D: faces internas com normais\nopostas cancelam; sobra a borda externa", fontsize=12)

fig.text(0.5, 0.02,
         r"$\sum_i\oint_{\partial(\Delta V_i)}\vec F\cdot d\vec A \;=\; \oint_S \vec F\cdot d\vec A$",
         fontsize=13, ha="center", va="bottom", color="#1f2937",
         bbox=dict(boxstyle="round,pad=0.45", facecolor="#f9fafb", edgecolor="#d1d5db"))

plt.tight_layout(rect=[0, 0.10, 1, 0.94])
plt.savefig("divergente_cancelamento.png", dpi=170, bbox_inches="tight")
plt.show()
```

O painel esquerdo mostra $V$ dividido em um bloco de cubos adjacentes: as arestas internas (cinza) ilustram a malha de subdivisão, enquanto o contorno externo em preto é exatamente $S$. As duas setas (vermelha/azul) mostram uma face interna típica com normais opostas — o mesmo fluxo é contado duas vezes, com sinais opostos. O painel direito reduz o argumento a um corte 1D: em cada face interna, o que "sai" de um cubo é exatamente o que "entra" no vizinho, cancelando; só as faces nas pontas (fronteira de $V$) sobrevivem.

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

```python
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, FancyArrowPatch

fig, ax = plt.subplots(figsize=(6.6, 4.7))

h = 1.0  # meio-lado (dx/2 = dy/2 = h para simplificar o desenho)
ax.add_patch(Rectangle((-h, -h), 2*h, 2*h, facecolor="#f8fafc", edgecolor="#111827", lw=1.8, zorder=1))

def arrow(p0, p1, color, lw=3, mut=20, z=5):
    ax.add_patch(FancyArrowPatch(p0, p1, arrowstyle="-|>", color=color, lw=lw,
                                  mutation_scale=mut, zorder=z, shrinkA=0, shrinkB=0))

# 4 arestas do laço, percorridas em sentido anti-horário (regra da mão direita, normal +z)
arrow((-h, -h), (h, -h), "#dc2626", lw=3.2)                 # base: F_x(y-dy/2)
ax.text(0, -h-0.28, r"$F_x\!\left(y-\frac{dy}{2}\right)dx$", color="#dc2626", fontsize=11.5, ha="center", va="top")

arrow((h, -h), (h, h), "#059669", lw=3.2)                   # direita: F_y(x+dx/2)
ax.text(h+0.14, 0, r"$F_y\!\left(x+\frac{dx}{2}\right)dy$", color="#059669", fontsize=11.5,
        ha="left", va="center", rotation=-90)

arrow((h, h), (-h, h), "#2563eb", lw=3.2)                   # topo: -F_x(y+dy/2)
ax.text(0, h+0.28, r"$-F_x\!\left(y+\frac{dy}{2}\right)dx$", color="#2563eb", fontsize=11.5, ha="center", va="bottom")

arrow((-h, h), (-h, -h), "#7c3aed", lw=3.2)                 # esquerda: -F_y(x-dx/2)
ax.text(-h-0.14, 0, r"$-F_y\!\left(x-\frac{dx}{2}\right)dy$", color="#7c3aed", fontsize=11.5,
        ha="right", va="center", rotation=90)

ax.scatter(0, 0, s=35, color="#111827", zorder=6)
ax.text(0.10, 0.12, r"$(x,y)$", fontsize=11, color="#111827")

# seta curva indicando o sentido de percurso (anti-horário) e a normal saindo da página
theta = np.linspace(np.deg2rad(20), np.deg2rad(340), 100)
rc = 0.42
ax.plot(rc*np.cos(theta), rc*np.sin(theta), color="#6b7280", lw=1.6, zorder=4)
arrow((rc*np.cos(theta[-2]), rc*np.sin(theta[-2])), (rc*np.cos(theta[-1]), rc*np.sin(theta[-1])),
      "#6b7280", lw=1.6, mut=10, z=4)
ax.text(0, -0.58, r"$\hat n=\hat z$", fontsize=9.5, color="#6b7280", ha="center", va="top")

ax.annotate("", xy=(h, -h-0.75), xytext=(-h, -h-0.75), arrowprops=dict(arrowstyle="<->", color="gray"))
ax.text(0, -h-0.95, r"$dx$", color="gray", fontsize=11, ha="center", va="top")
ax.annotate("", xy=(h+0.75, h), xytext=(h+0.75, -h), arrowprops=dict(arrowstyle="<->", color="gray"))
ax.text(h+0.95, 0, r"$dy$", color="gray", fontsize=11, ha="left", va="center")

ax.set_xlim(-2.4, 2.9)
ax.set_ylim(-2.5, 2.1)
ax.set_aspect("equal"); ax.axis("off")
ax.set_title("Laço retangular infinitesimal e circulação de $\\vec F$", fontsize=13.5, pad=10)

fig.text(0.5, 0.015,
         r"$\oint\vec F\cdot d\vec\ell \approx \left(\dfrac{\partial F_y}{\partial x}-\dfrac{\partial F_x}{\partial y}\right)dx\,dy = (\nabla\times\vec F)_z\,dA$",
         fontsize=12, ha="center", va="bottom", color="#1f2937",
         bbox=dict(boxstyle="round,pad=0.45", facecolor="#f9fafb", edgecolor="#d1d5db"))

plt.tight_layout(rect=[0, 0.09, 1, 1])
plt.savefig("laco_rotacional.png", dpi=170, bbox_inches="tight")
plt.show()
```

A figura mostra as quatro arestas do laço com o campo avaliado em cada uma; o sentido anti-horário (regra da mão direita para $\hat n=\hat z$) determina os sinais na soma abaixo. As arestas horizontais (vermelho/azul) contribuem com $F_x$, as verticais (verde/roxo) com $F_y$ — a diferença entre lados opostos, dividida pela área, é exatamente o rotacional.

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

::: observação
**Observação (por que o laço retangular e não outro formato?).** Assim como no divergente, o retângulo é só conveniência algébrica. Qualquer laço pequeno e plano (círculo, triângulo) pode ser aproximado por uma malha fina de retângulos coplanares — a circulação total é a soma das circulações individuais, pois as arestas internas compartilhadas se cancelam (mesmo argumento usado na prova do Teorema de Stokes, a seguir). O limite $\lim_{\Delta A\to0}\frac1{\Delta A}\oint\vec F\cdot d\vec\ell$ converge para o mesmo valor $(\nabla\times\vec F)\cdot\hat n$ **qualquer que seja a forma** do laço, desde que sua normal seja $\hat n$ — de novo, uma propriedade local do campo no ponto, não da forma escolhida.
:::

::: insight
**Insight para lembrar.** Imagine uma pequena roda de pás (um "medidor de rotação") flutuando no campo, livre para girar em torno de um eixo $\hat n$. O rotacional $(\nabla\times\vec F)\cdot\hat n$ mede **o quanto e em que sentido essa roda giraria** — não porque o fluido "vai" para algum lugar (isso é o divergente), mas porque o campo empurra mais forte de um lado do laço que do outro, criando um torque líquido. É por isso que $\nabla\times\vec E=0$ em eletrostática (Seção "Identidades Vetoriais Fundamentais") tem um significado físico direto: uma carga de teste levada em qualquer laço fechado no campo elétrico estático não ganha nem perde energia líquida — não há "moinho de energia grátis" em um campo conservativo.
:::

::: exemplo
**Exemplo — rotação rígida.** Seja $\vec F = (-y,\,x,\,0)$. O rotacional é:

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
**Exemplo — rotacional não uniforme.** Seja $\vec F = z^2\,\hat x + x^2\,\hat y - y^2\,\hat z$. O rotacional é:

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

::: insight
**Receita de uso — orientação primeiro, cálculo depois.**

1. Escolha a normal $\hat n$ da superfície.
2. Use a regra da mão direita para fixar o sentido positivo de $C$.
3. Calcule $\nabla\times\vec F$.
4. Escolha, entre todas as superfícies com borda $C$, a mais simples.
5. Integre $(\nabla\times\vec F)\cdot\hat n\,dA$ e confira a orientação.

Inverter a normal ou o sentido do contorno troca o sinal. Inverter **ambos** preserva o resultado.
:::

::: verificacao
**Previsão de orientação.** Se $(\nabla\times\vec F)_z>0$ e escolhemos $\hat n=+\hat z$, qual é o sentido positivo de $C$ visto de cima?

**Resposta:** anti-horário.
:::

**Prova**: divida $S$ em $N$ células retangulares infinitesimais $\Delta A_i$. Pela Seção “Dedução da interpretação física (circulação por unidade de área)”, a circulação em torno de cada célula é $(\nabla\times\vec F)_i\cdot\hat n_i\,\Delta A_i$. Somando:

$$
\sum_i\oint_{\partial(\Delta A_i)}\vec F\cdot d\vec\ell = \sum_i(\nabla\times\vec F)_i\cdot\hat n_i\,\Delta A_i \;\xrightarrow{N\to\infty}\; \int_S(\nabla\times\vec F)\cdot d\vec A
$$

No lado esquerdo, cada aresta **interna** (compartilhada por duas células vizinhas) é percorrida duas vezes em sentidos opostos (uma vez em cada célula adjacente, ambas percorridas anti-horário do ponto de vista de sua própria normal) — cancelando-se exatamente. Sobrevivem apenas as arestas na **fronteira externa** de $S$, que compõem $C$:

```python
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, Rectangle

fig, axes = plt.subplots(1, 2, figsize=(11.5, 5.0))

# ============ Painel esquerdo: mosaico de laços, arestas internas cancelando ============
ax = axes[0]
n = 4
cell = 1.0

def in_region(i, j):
    cx, cy = (n-1)/2, (n-1)/2
    return (i-cx)**2 + (j-cy)**2 <= (n/2 + 0.05)**2   # recorta os 4 cantos: S não é um quadrado perfeito

cells = [(i, j) for i in range(n) for j in range(n) if in_region(i, j)]

for (i, j) in cells:
    x0, y0 = i*cell, j*cell
    ax.add_patch(Rectangle((x0, y0), cell, cell, facecolor="#eff6ff", edgecolor="none", zorder=1))

def arrow(ax_, p0, p1, color, lw=1.6, mut=9, z=3):
    ax_.add_patch(FancyArrowPatch(p0, p1, arrowstyle="-|>", color=color, lw=lw,
                                   mutation_scale=mut, zorder=z, shrinkA=0, shrinkB=0))

def edge_key(p0, p1):
    return tuple(sorted([p0, p1]))

edge_owner_count = {}
for (i, j) in cells:
    x0, y0 = i*cell, j*cell
    corners = [(x0, y0), (x0+cell, y0), (x0+cell, y0+cell), (x0, y0+cell)]
    for k in range(4):
        e = edge_key(corners[k], corners[(k+1) % 4])
        edge_owner_count[e] = edge_owner_count.get(e, 0) + 1

drawn_internal = set()
for (i, j) in cells:
    x0, y0 = i*cell, j*cell
    corners = [(x0, y0), (x0+cell, y0), (x0+cell, y0+cell), (x0, y0+cell)]
    for k in range(4):
        p0, p1 = corners[k], corners[(k+1) % 4]
        ek = edge_key(p0, p1)
        if edge_owner_count[ek] == 2:
            # aresta interna: desenhada apenas uma vez, linha fina cinza, sem seta (cancela)
            if ek not in drawn_internal:
                drawn_internal.add(ek)
                ax.plot([p0[0], p1[0]], [p0[1], p1[1]], color="#cbd5e1", lw=1.3, zorder=2)
        else:
            arrow(ax, p0, p1, "#111827", lw=2.6, mut=13, z=5)   # aresta de fronteira: sobrevive

ax.text((n*cell)/2, n*cell+0.35, "S dividida em células", fontsize=12, ha="center", color="#1f2937")
ax.text(n*cell+0.15, n*cell-0.5, "C", fontsize=16, style="italic", color="#1f2937", va="center")
ax.set_xlim(-0.6, n*cell+0.7)
ax.set_ylim(-0.6, n*cell+0.9)
ax.set_aspect("equal"); ax.axis("off")
ax.set_title("Arestas internas cancelam;\nsobrevive o contorno externo $C$", fontsize=12.5)

# ============ Painel direito: zoom em 2x2 células mostrando o cancelamento ============
ax2 = axes[1]
for i in range(2):
    for j in range(2):
        x0, y0 = i*cell, j*cell
        ax2.add_patch(Rectangle((x0, y0), cell, cell, facecolor="#eff6ff", edgecolor="none", zorder=1))

arrow(ax2, (1.0, 0.0), (1.0, 1.0), "#dc2626", lw=2.6, mut=16, z=5)    # aresta interna: célula da esquerda
arrow(ax2, (1.02, 1.0), (1.02, 0.0), "#2563eb", lw=2.6, mut=16, z=5)  # aresta interna: célula da direita (sentido oposto)
ax2.text(1.35, 0.5, "cancelam-se\n(sentidos opostos)", fontsize=10.5, color="#374151", va="center")

outer = [(0,0),(2,0),(2,2),(0,2)]
for k in range(4):
    arrow(ax2, outer[k], outer[(k+1) % 4], "#111827", lw=2.8, mut=15, z=5)
ax2.plot([0, 2], [1, 1], color="#cbd5e1", lw=1.3, zorder=2)

ax2.set_xlim(-0.5, 2.9)
ax2.set_ylim(-0.5, 2.5)
ax2.set_aspect("equal"); ax2.axis("off")
ax2.set_title("Zoom: aresta interna percorrida\nduas vezes em sentidos opostos", fontsize=12.5)

fig.text(0.5, 0.02,
         r"$\sum_i\oint_{\partial(\Delta A_i)}\vec F\cdot d\vec\ell \;=\; \oint_C \vec F\cdot d\vec\ell$",
         fontsize=13, ha="center", va="bottom", color="#1f2937",
         bbox=dict(boxstyle="round,pad=0.45", facecolor="#f9fafb", edgecolor="#d1d5db"))

plt.tight_layout(rect=[0, 0.10, 1, 0.94])
plt.savefig("stokes_cancelamento.png", dpi=170, bbox_inches="tight")
plt.show()
```

O painel esquerdo mostra $S$ (aqui, um mosaico não-retangular, para deixar claro que a forma de $S$ é arbitrária) dividida em células; as arestas internas (cinza fino) nunca aparecem na soma final porque cada uma é percorrida duas vezes em sentidos opostos por suas duas células vizinhas — só as arestas de fronteira (preto) sobrevivem, formando exatamente $C$. O painel direito faz o zoom nesse cancelamento em duas células adjacentes.

$$
\sum_i\oint_{\partial(\Delta A_i)}\vec F\cdot d\vec\ell = \oint_C\vec F\cdot d\vec\ell
$$

Igualando, obtém-se o teorema. $\blacksquare$ (O argumento vale para $S$ curva ao aproximá-la por um mosaico de células planas infinitesimais, cada uma tangente à superfície local.)

::: corolário
**Corolário 2.** campo conservativo $\Leftrightarrow$ integral de linha independe do caminho

Se $\nabla\times\vec F=0$ em uma região simplesmente conexa, então, para quaisquer dois caminhos $C_1,C_2$ entre os mesmos pontos $A$ e $B$, a diferença de suas integrais de linha é a integral sobre o laço fechado $C_1-C_2$, que por Stokes vale $\int_S(\nabla\times\vec F)\cdot d\vec A=0$. Logo $\int_{C_1}\vec F\cdot d\vec\ell=\int_{C_2}\vec F\cdot d\vec\ell$ — a integral depende apenas dos extremos. Este é o fato que justifica a existência do potencial elétrico $V$ em eletrostática.
:::

---

## Laplaciano

### A pergunta física: este ponto é "igual" à sua vizinhança?

Já vimos que o gradiente responde "para onde $f$ cresce mais rápido" e o divergente responde "há fontes de $\vec F$ aqui". O laplaciano responde a uma terceira pergunta, também muito natural: **o valor de $f$ neste ponto é maior, menor, ou igual à média de seus vizinhos imediatos?** Essa pergunta aparece o tempo todo em física de equilíbrio — temperatura em regime estacionário, potencial eletrostático no vácuo — porque a resposta "igual à média" caracteriza exatamente os estados de equilíbrio (sem fontes locais, cada ponto "se acomoda" no valor médio ao redor).

### Passo 1: dedução em 1D via série de Taylor

Comece com o caso mais simples: $f(x)$, uma função de uma variável. Expanda $f$ em Taylor ao redor de um ponto $x$, para um passo pequeno $h$, para a frente e para trás:

$$
f(x+h) = f(x) + f'(x)h + \tfrac12 f''(x)h^2 + O(h^3),\qquad
f(x-h) = f(x) - f'(x)h + \tfrac12 f''(x)h^2 + O(h^3)
$$

**Some as duas expansões** — os termos ímpares em $h$ (incluindo $f'(x)h$) se cancelam:

$$
f(x+h)+f(x-h) = 2f(x) + f''(x)h^2 + O(h^4)
$$

Isolando $f''(x)$:

$$
f''(x) = \frac{f(x+h)+f(x-h) - 2f(x)}{h^2} + O(h^2) = \frac{2}{h^2}\left[\underbrace{\frac{f(x+h)+f(x-h)}{2}}_{\text{média dos vizinhos}} - f(x)\right] + O(h^2)
$$

::: corolário
**Corolário 5.** Em 1D, a segunda derivada é (a menos de um fator $2/h^2$) exatamente a diferença entre **a média dos dois vizinhos** e **o valor no próprio ponto**. Se $f''(x)>0$, o ponto vale **menos** que a média dos vizinhos (função "afunda" localmente — um mínimo local, côncava para cima); se $f''(x)<0$, vale **mais** (côncava para baixo, um máximo local); se $f''(x)=0$, o ponto **é** a média dos vizinhos.
:::

### Passo 2: generalização para 3D — de onde vem a soma de segundas derivadas

O mesmo argumento, repetido independentemente em cada uma das três direções cartesianas (some Taylor em $\pm h\hat x$, depois $\pm h\hat y$, depois $\pm h\hat z$, cada par cancelando os termos ímpares), dá:

$$
\frac{\partial^2f}{\partial x^2}+\frac{\partial^2f}{\partial y^2}+\frac{\partial^2f}{\partial z^2} = \frac{2}{h^2}\Big[\underbrace{\tfrac16\big(f(x{+}h,y,z)+f(x{-}h,y,z)+f(x,y{+}h,z)+f(x,y{-}h,z)+f(x,y,z{+}h)+f(x,y,z{-}h)\big)}_{\text{média dos 6 vizinhos numa grade cúbica}} - f(x,y,z)\Big]\cdot 3+O(h^2)
$$

Definindo o operador que soma as três segundas derivadas parciais como o **laplaciano**:

::: definição
**Definição 5.** O **laplaciano** de um campo escalar é o divergente do seu gradiente (aplicando a Definição 3 ao campo $\vec F=\nabla f$ da Definição 1):

$$
\boxed{\nabla^2 f \equiv \nabla\cdot(\nabla f) = \frac{\partial^2f}{\partial x^2}+\frac{\partial^2f}{\partial y^2}+\frac{\partial^2f}{\partial z^2}}
$$
:::

O resultado do Passo 2 mostra precisamente que:

$$
\boxed{\nabla^2f(\vec r) \;\propto\; \Big[\langle f\rangle_{\text{vizinhança}} - f(\vec r)\Big]\qquad\text{(regra da média)}}
$$

Ou seja: $\nabla^2f$ mede — com sinal e escala — a **diferença entre o valor de $f$ no ponto e a média de $f$ em sua vizinhança infinitesimal**. $\nabla^2f>0$: o ponto está "abaixo" da média (concavidade positiva, um "vale" local); $\nabla^2f<0$: o ponto está "acima" da média (um "pico" local); $\nabla^2f=0$: o valor no ponto **é** a média de seus vizinhos — nem pico, nem vale, um equilíbrio local.

::: insight
**Insight para lembrar.** Pense no laplaciano como um **"detector de desequilíbrio local"**. Em um problema de difusão de calor, se $\nabla^2T>0$ em um ponto (ele está "mais frio" que a média ao redor), o calor flui **para dentro** desse ponto, aquecendo-o com o tempo — daí a equação de difusão $\partial T/\partial t = \alpha\nabla^2T$: a temperatura aumenta onde há um "déficit" em relação à vizinhança. No equilíbrio estacionário sem fontes ($\partial T/\partial t=0$), obtemos exatamente $\nabla^2T=0$ (equação de Laplace): todo ponto já é a média de seus vizinhos, não há mais fluxo líquido de calor para lugar nenhum. O mesmo raciocínio, aplicado ao potencial elétrico no vácuo ($\nabla^2V=0$), é o motivo pelo qual **não existe um ponto de equilíbrio estável para uma carga livre no vácuo** (Teorema de Earnshaw) — um mínimo ou máximo local de $V$ exigiria $\nabla^2V\neq0$ ali, o que só ocorre onde há carga.
:::

::: exemplo
**Exemplo — laplaciano de um paraboloide.** Seja $f(x,y,z) = x^2 + y^2 + z^2$. O laplaciano é:

$$
\nabla^2 f = \frac{\partial^2 f}{\partial x^2} + \frac{\partial^2 f}{\partial y^2} + \frac{\partial^2 f}{\partial z^2} = 2 + 2 + 2 = 6
$$

$f$ cresce em **todas** as direções a partir da origem (um "vale" tridimensional) — consistente com $\nabla^2f>0$ em todo ponto: o valor local está sempre abaixo da média da vizinhança.

Seja $g(x,y,z) = x^2 - y^2$. O laplaciano é:

$$
\nabla^2 g = 2 - 2 + 0 = 0
$$

Logo $g$ é uma função **harmônica**: apesar de $g$ ter curvatura para cima em $x$ (côncava para cima, "vale") e para baixo em $y$ (côncava para baixo, "pico") — a **ponto de sela** —, as duas curvaturas se cancelam exatamente, e o valor em cada ponto é sempre a média de sua vizinhança.
:::

::: observação
**Observação 1.** O laplaciano de um campo **vetorial** é definido componente a componente em coordenadas cartesianas: $\nabla^2\vec F = (\nabla^2F_x)\hat x+(\nabla^2F_y)\hat y+(\nabla^2F_z)\hat z$ (usado na dedução do potencial vetor magnético, arquivo 4).
:::

### Visualização Python — curvatura local, harmonicidade e verificação numérica da regra da média

O código plota as duas superfícies do Exemplo 7 e, adicionalmente, **verifica numericamente a regra da média** do Passo 2: calcula a diferença entre o valor em um ponto e a média de seus 4 vizinhos em uma grade 2D, e compara com $\nabla^2f\cdot h^2/4$ previsto pela fórmula.

```python
import numpy as np
import matplotlib.pyplot as plt

x = y = np.linspace(-2, 2, 120)
X, Y = np.meshgrid(x, y)
f1 = X**2 + Y**2       # laplaciano = 4  (bacia: sempre abaixo da média local)
f2 = X**2 - Y**2       # laplaciano = 0  (sela harmônica: sempre igual à média local)

fig = plt.figure(figsize=(11, 4.2))
for i, (f, titulo) in enumerate(((f1, "laplaciano = 4"), (f2, "laplaciano = 0 (harmônica)")), 1):
    ax = fig.add_subplot(1, 2, i, projection="3d")
    ax.plot_surface(X, Y, f, cmap="viridis", alpha=.85)
    ax.set_title(titulo)
plt.tight_layout()
print("laplacianos (analítico):", 4, 0)

# --- Verificação numérica da regra da média em uma grade 2D ---
def laplaciano_numerico(func, x0, y0, h=1e-3):
    """(f(x+h,y)+f(x-h,y)+f(x,y+h)+f(x,y-h)-4f(x,y)) / h^2  ~=  laplaciano de f."""
    vizinhos = (func(x0+h, y0) + func(x0-h, y0) + func(x0, y0+h) + func(x0, y0-h))
    return (vizinhos - 4*func(x0, y0)) / h**2

f1_func = lambda x, y: x**2 + y**2
f2_func = lambda x, y: x**2 - y**2
p = (1.3, -0.7)
print(f"\nEm {p}:")
print(f"  laplaciano numérico de f1 = {laplaciano_numerico(f1_func, *p):.4f}  (analítico: 4)")
print(f"  laplaciano numérico de f2 = {laplaciano_numerico(f2_func, *p):.4f}  (analítico: 0)")

# Regra da média propriamente dita: valor no ponto vs média dos 4 vizinhos
h = 0.5
media_vizinhos_f2 = (f2_func(p[0]+h,p[1])+f2_func(p[0]-h,p[1])+f2_func(p[0],p[1]+h)+f2_func(p[0],p[1]-h))/4
print(f"  f2 no ponto = {f2_func(*p):.4f}, média dos 4 vizinhos = {media_vizinhos_f2:.4f} "
      f"(iguais, pois f2 é harmônica)")
```

**Saída esperada**: o laplaciano numérico (diferenças finitas) coincide com o valor analítico dentro do erro de discretização; para $f_2$ (harmônica), o valor no ponto **é exatamente** a média dos 4 vizinhos — confirmação direta da regra da média deduzida no Passo 2.

---

## Sistemas de Coordenadas Curvilíneas

A simetria de um problema (esférica, cilíndrica) frequentemente torna cartesianas inconvenientes: um campo que depende de $x,y,z$ de forma acoplada pode depender de uma única coordenada curvilínea (ex.: $V(r)=k/r$). Esta seção **deduz**, passo a passo, a conversão entre sistemas de coordenadas, os versores locais, os fatores de escala e — a partir deles — as fórmulas de $\nabla f$, $\nabla\cdot\vec F$, $\nabla\times\vec F$ e $\nabla^2f$ em cilíndricas e esféricas.

### Antes das fórmulas: escolha pela simetria

Coordenadas são uma ferramenta, não uma propriedade do campo. O mesmo fenômeno pode ser descrito em qualquer sistema, mas uma boa escolha transforma superfícies físicas importantes em “uma coordenada constante”.

| Geometria dominante | Coordenadas naturais | Superfícies simples | Exemplo eletromagnético |
|---|---|---|---|
| placas, caixas, variação em uma direção | cartesianas $(x,y,z)$ | $x$, $y$ ou $z$ constante | capacitor de placas paralelas |
| fios, cabos, cilindros, eixos | cilíndricas $(s,\phi,z)$ | $s$ constante | fio infinito, cabo coaxial |
| cargas puntiformes, esferas | esféricas $(r,\theta,\phi)$ | $r$ constante | carga pontual, esfera condutora |

::: insight
**Fluxo de trabalho para exercícios.**

1. Desenhe ou identifique a geometria.
2. Pergunte quais movimentos deixam o sistema fisicamente inalterado.
3. Escolha as coordenadas adaptadas a essas simetrias.
4. Elimine imediatamente as derivadas das variáveis das quais o campo não depende.
5. Só então use a fórmula do operador.

Exemplo: se $V=V(r)$ possui simetria esférica, então $\partial_\theta V=\partial_\phi V=0$ antes de qualquer cálculo. Logo $\nabla V=(dV/dr)\hat r$; não é necessário expandir toda a fórmula esférica.
:::

::: observação
**Três símbolos que costumam causar confusão.** Nesta apostila, $s$ é a distância ao eixo $z$, $r$ é a distância à origem, $\theta$ é o ângulo polar medido a partir de $+\hat z$ e $\phi$ é o azimute no plano $xy$. Outros livros podem trocar $\theta$ e $\phi$; confira sempre a convenção antes de reutilizar uma fórmula.
:::

### Passo 1: de cartesianas para curvilíneas — a ideia

Um sistema de coordenadas curvilíneas ortogonais $(u_1,u_2,u_3)$ é definido por uma transformação invertível

$$
x=x(u_1,u_2,u_3),\quad y=y(u_1,u_2,u_3),\quad z=z(u_1,u_2,u_3)
$$

O vetor posição $\vec r=x\hat x+y\hat y+z\hat z$ torna-se, portanto, uma função $\vec r(u_1,u_2,u_3)$. A ideia central: **os versores locais $\hat u_i$ não são fixos como $\hat x,\hat y,\hat z$** — eles mudam de direção de ponto a ponto, e são definidos a partir de como $\vec r$ varia quando apenas $u_i$ varia.

::: definição
**Definição 6.** O versor da coordenada $u_i$ no ponto $(u_1,u_2,u_3)$ é a direção de variação de $\vec r$ com $u_i$, normalizada:

$$
\hat u_i \equiv \frac{\partial\vec r/\partial u_i}{\left|\partial\vec r/\partial u_i\right|},\qquad h_i\equiv\left|\frac{\partial\vec r}{\partial u_i}\right|
$$

$h_i$ é o **fator de escala**: um deslocamento infinitesimal $du_i$ (mantendo as outras coordenadas fixas) corresponde a um comprimento físico $h_i\,du_i$, pois $d\vec r = \frac{\partial \vec r}{\partial u_i}du_i = h_i\,du_i\,\hat u_i$.
:::

Um sistema é **ortogonal** quando $\hat u_1,\hat u_2,\hat u_3$ são mutuamente perpendiculares em todo ponto — cilíndricas e esféricas são ambas ortogonais, o que simplifica enormemente as fórmulas seguintes (deslocamentos nas três direções não se misturam).

### Passo 2: coordenadas cilíndricas $(s,\phi,z)$ — dedução completa

**2.1 — Relação com cartesianas.** Um ponto é descrito pela distância radial ao eixo $z$, pelo ângulo azimutal e pela altura:

$$
\boxed{x=s\cos\phi,\quad y=s\sin\phi,\quad z=z}\qquad (s\ge0,\ 0\le\phi<2\pi)
$$

Geometricamente: projete o ponto no plano $xy$; $s$ é a distância desse projeção à origem e $\phi$ o ângulo que ela faz com o eixo $x$ (regra usual da trigonometria: cateto adjacente $x=s\cos\phi$, cateto oposto $y=s\sin\phi$).

**Conversão inversa** (necessária para expressar $s,\phi,z$ dado um ponto cartesiano):

$$
s=\sqrt{x^2+y^2},\qquad \phi=\operatorname{atan2}(y,x),\qquad z=z
$$

(usa-se $\operatorname{atan2}$, e não $\arctan(y/x)$, para resolver corretamente o quadrante de $\phi$ a partir dos sinais de $x$ e $y$.)

**2.2 — Vetor posição e derivadas parciais.** Escrevendo $\vec r = s\cos\phi\,\hat x+s\sin\phi\,\hat y+z\,\hat z$:

$$
\frac{\partial\vec r}{\partial s}=\cos\phi\,\hat x+\sin\phi\,\hat y,\qquad
\frac{\partial\vec r}{\partial\phi}=-s\sin\phi\,\hat x+s\cos\phi\,\hat y,\qquad
\frac{\partial\vec r}{\partial z}=\hat z
$$

**2.3 — Fatores de escala** (módulo de cada derivada parcial):

$$
h_s=\left|\frac{\partial\vec r}{\partial s}\right|=\sqrt{\cos^2\phi+\sin^2\phi}=1,\quad
h_\phi=\left|\frac{\partial\vec r}{\partial\phi}\right|=\sqrt{s^2\sin^2\phi+s^2\cos^2\phi}=s,\quad
h_z=\left|\frac{\partial\vec r}{\partial z}\right|=1
$$

::: corolário
**Corolário 3.** $\boxed{h_s=1,\quad h_\phi=s,\quad h_z=1}$. O fator $h_\phi=s$ tem sentido físico direto: girar $d\phi$ radianos a uma distância $s$ do eixo percorre um arco de comprimento $s\,d\phi$ — quanto maior $s$, maior o deslocamento físico para o mesmo $d\phi$.
:::

**2.4 — Versores** (dividindo cada derivada parcial pelo seu módulo):

$$
\hat s=\cos\phi\,\hat x+\sin\phi\,\hat y,\qquad
\hat\phi=-\sin\phi\,\hat x+\cos\phi\,\hat y,\qquad
\hat z=\hat z
$$

Verificação de ortogonalidade: $\hat s\cdot\hat\phi=-\cos\phi\sin\phi+\sin\phi\cos\phi=0$ ✓; e $\hat s\times\hat\phi=\hat z$ (verifique por componentes), confirmando a orientação destra $(\hat s,\hat\phi,\hat z)$.

**2.5 — Elementos diferenciais.** Como o sistema é ortogonal, um deslocamento infinitesimal geral é a soma direta dos três deslocamentos ao longo de cada eixo local:

$$
\boxed{d\vec\ell = h_s\,ds\,\hat s+h_\phi\,d\phi\,\hat\phi+h_z\,dz\,\hat z = ds\,\hat s+s\,d\phi\,\hat\phi+dz\,\hat z}
$$

$$
dV = h_sh_\phi h_z\,ds\,d\phi\,dz = s\,ds\,d\phi\,dz
$$

($dV$ é o volume da caixa curvilínea de arestas $h_s\,ds,\ h_\phi\,d\phi,\ h_z\,dz$ — ortogonais entre si, logo o volume é simplesmente o produto das três arestas.)

**2.6 — Gradiente, divergente, rotacional e laplaciano.** Para coordenadas ortogonais com fatores de escala $h_1,h_2,h_3$, os operadores tomam a **forma geral** (justificada no Passo 4 abaixo):

$$
\nabla f = \frac{1}{h_1}\frac{\partial f}{\partial u_1}\hat u_1+\frac{1}{h_2}\frac{\partial f}{\partial u_2}\hat u_2+\frac{1}{h_3}\frac{\partial f}{\partial u_3}\hat u_3
$$

$$
\nabla\cdot\vec F = \frac{1}{h_1h_2h_3}\left[\frac{\partial(h_2h_3F_1)}{\partial u_1}+\frac{\partial(h_1h_3F_2)}{\partial u_2}+\frac{\partial(h_1h_2F_3)}{\partial u_3}\right]
$$

$$
\nabla^2f = \frac{1}{h_1h_2h_3}\left[\frac{\partial}{\partial u_1}\!\left(\frac{h_2h_3}{h_1}\frac{\partial f}{\partial u_1}\right)+\frac{\partial}{\partial u_2}\!\left(\frac{h_1h_3}{h_2}\frac{\partial f}{\partial u_2}\right)+\frac{\partial}{\partial u_3}\!\left(\frac{h_1h_2}{h_3}\frac{\partial f}{\partial u_3}\right)\right]
$$

Substituindo $u_1,u_2,u_3=s,\phi,z$ e $h_s=1,\ h_\phi=s,\ h_z=1$ diretamente nessas fórmulas gerais:

$$
\boxed{\nabla f = \frac{\partial f}{\partial s}\hat s+\frac{1}{s}\frac{\partial f}{\partial\phi}\hat\phi+\frac{\partial f}{\partial z}\hat z}
$$

Por exemplo, o termo em $\hat\phi$ é $\frac{1}{h_\phi}\frac{\partial f}{\partial\phi}=\frac{1}{s}\frac{\partial f}{\partial\phi}$ — o fator $1/s$ aparece **porque** um mesmo $d\phi$ corresponde a um deslocamento físico $s\,d\phi$ (Passo 2.3): dividir por $h_\phi=s$ converte a taxa de variação "por radiano" em taxa de variação "por unidade de comprimento", que é o que o gradiente exige.

$$
\boxed{\nabla\cdot\vec F = \frac{1}{s}\frac{\partial(sF_s)}{\partial s}+\frac{1}{s}\frac{\partial F_\phi}{\partial\phi}+\frac{\partial F_z}{\partial z}}
$$

(aqui $h_2h_3=h_\phi h_z=s$ no termo $\partial_s$; $h_1h_3=h_sh_z=1$ no termo $\partial_\phi$; $h_1h_2=h_sh_\phi=s$ no termo $\partial_z$; e o prefator global é $1/(h_sh_\phi h_z)=1/s$.)

$$
\boxed{\nabla\times\vec F = \left(\frac{1}{s}\frac{\partial F_z}{\partial\phi}-\frac{\partial F_\phi}{\partial z}\right)\hat s+\left(\frac{\partial F_s}{\partial z}-\frac{\partial F_z}{\partial s}\right)\hat\phi+\frac{1}{s}\left(\frac{\partial(sF_\phi)}{\partial s}-\frac{\partial F_s}{\partial\phi}\right)\hat z}
$$

$$
\boxed{\nabla^2f = \frac{1}{s}\frac{\partial}{\partial s}\left(s\frac{\partial f}{\partial s}\right)+\frac{1}{s^2}\frac{\partial^2f}{\partial\phi^2}+\frac{\partial^2f}{\partial z^2}}
$$

(o laplaciano segue de $\nabla^2f=\nabla\cdot(\nabla f)$: aplique a fórmula do divergente acima ao campo $\vec F=\nabla f=(\partial_sf,\ \tfrac1s\partial_\phi f,\ \partial_zf)$ e simplifique.)

### Passo 3: coordenadas esféricas $(r,\theta,\phi)$ — dedução completa

**3.1 — Relação com cartesianas.** Um ponto é descrito pela distância à origem, pelo ângulo polar (a partir de $+\hat z$) e pelo ângulo azimutal:

$$
\boxed{x=r\sin\theta\cos\phi,\quad y=r\sin\theta\sin\phi,\quad z=r\cos\theta}\qquad(r\ge0,\ 0\le\theta\le\pi,\ 0\le\phi<2\pi)
$$

Dedução geométrica: a projeção de $\vec r$ no eixo $z$ tem comprimento $r\cos\theta$ (definição de $\theta$ como ângulo com $+\hat z$); a projeção no plano $xy$ tem comprimento $r\sin\theta$, e dentro desse plano os componentes $x,y$ seguem a mesma relação de $\phi$ das cilíndricas — daí $x=(r\sin\theta)\cos\phi$ e $y=(r\sin\theta)\sin\phi$. Em outras palavras, esféricas e cilíndricas se relacionam por $s=r\sin\theta$ (raio cilíndrico igual à projeção de $r$).

**Conversão inversa:**

$$
r=\sqrt{x^2+y^2+z^2},\qquad \theta=\arccos\!\left(\frac{z}{r}\right),\qquad \phi=\operatorname{atan2}(y,x)
$$

**3.2 — Vetor posição e derivadas parciais.** Com $\vec r = r\sin\theta\cos\phi\,\hat x+r\sin\theta\sin\phi\,\hat y+r\cos\theta\,\hat z$:

$$
\frac{\partial\vec r}{\partial r}=\sin\theta\cos\phi\,\hat x+\sin\theta\sin\phi\,\hat y+\cos\theta\,\hat z
$$

$$
\frac{\partial\vec r}{\partial\theta}=r\cos\theta\cos\phi\,\hat x+r\cos\theta\sin\phi\,\hat y-r\sin\theta\,\hat z
$$

$$
\frac{\partial\vec r}{\partial\phi}=-r\sin\theta\sin\phi\,\hat x+r\sin\theta\cos\phi\,\hat y
$$

**3.3 — Fatores de escala:**

$$
h_r=\left|\frac{\partial\vec r}{\partial r}\right|=\sqrt{\sin^2\theta\cos^2\phi+\sin^2\theta\sin^2\phi+\cos^2\theta}=\sqrt{\sin^2\theta+\cos^2\theta}=1
$$

$$
h_\theta=\left|\frac{\partial\vec r}{\partial\theta}\right|=\sqrt{r^2\cos^2\theta\cos^2\phi+r^2\cos^2\theta\sin^2\phi+r^2\sin^2\theta}=\sqrt{r^2\cos^2\theta+r^2\sin^2\theta}=r
$$

$$
h_\phi=\left|\frac{\partial\vec r}{\partial\phi}\right|=\sqrt{r^2\sin^2\theta\sin^2\phi+r^2\sin^2\theta\cos^2\phi}=\sqrt{r^2\sin^2\theta}=r\sin\theta
$$

::: corolário
**Corolário 4.** $\boxed{h_r=1,\quad h_\theta=r,\quad h_\phi=r\sin\theta}$. Interpretação física: girar $d\theta$ a uma distância $r$ da origem percorre um arco de comprimento $r\,d\theta$ (meridiano); girar $d\phi$ a uma distância **do eixo $z$** igual a $r\sin\theta$ (Passo 3.1) percorre um arco $r\sin\theta\,d\phi$ (paralelo). Note que $h_\phi\to0$ quando $\theta\to0$ ou $\pi$ — nos polos, variar $\phi$ não desloca o ponto fisicamente, consistente com a singularidade coordenada ali.
:::

**3.4 — Versores** (dividindo cada derivada parcial por seu módulo):

$$
\hat r=\sin\theta\cos\phi\,\hat x+\sin\theta\sin\phi\,\hat y+\cos\theta\,\hat z
$$

$$
\hat\theta=\cos\theta\cos\phi\,\hat x+\cos\theta\sin\phi\,\hat y-\sin\theta\,\hat z
$$

$$
\hat\phi=-\sin\phi\,\hat x+\cos\phi\,\hat y
$$

(ortogonalidade $\hat r\cdot\hat\theta=\hat r\cdot\hat\phi=\hat\theta\cdot\hat\phi=0$ e orientação destra $\hat r\times\hat\theta=\hat\phi$ podem ser verificadas por substituição direta.)

**3.5 — Elementos diferenciais:**

$$
\boxed{d\vec\ell = dr\,\hat r+r\,d\theta\,\hat\theta+r\sin\theta\,d\phi\,\hat\phi}
$$

$$
dV = h_rh_\theta h_\phi\,dr\,d\theta\,d\phi = r^2\sin\theta\,dr\,d\theta\,d\phi
$$

**3.6 — Gradiente, divergente e laplaciano.** Substituindo $u_1,u_2,u_3=r,\theta,\phi$ e $h_r=1,\ h_\theta=r,\ h_\phi=r\sin\theta$ nas fórmulas gerais do Passo 2.6:

$$
\boxed{\nabla f = \frac{\partial f}{\partial r}\hat r+\frac{1}{r}\frac{\partial f}{\partial\theta}\hat\theta+\frac{1}{r\sin\theta}\frac{\partial f}{\partial\phi}\hat\phi}
$$

$$
\boxed{\nabla\cdot\vec F = \frac{1}{r^2}\frac{\partial(r^2F_r)}{\partial r}+\frac{1}{r\sin\theta}\frac{\partial(\sin\theta\,F_\theta)}{\partial\theta}+\frac{1}{r\sin\theta}\frac{\partial F_\phi}{\partial\phi}}
$$

Confira o termo radial: $h_\theta h_\phi = r\cdot r\sin\theta=r^2\sin\theta$; dividido pelo prefator global $1/(h_rh_\theta h_\phi)=1/(r^2\sin\theta)$, sobra exatamente $\frac{1}{r^2}\frac{\partial(r^2F_r)}{\partial r}$.

$$
\boxed{\nabla^2f = \frac{1}{r^2}\frac{\partial}{\partial r}\left(r^2\frac{\partial f}{\partial r}\right)+\frac{1}{r^2\sin\theta}\frac{\partial}{\partial\theta}\left(\sin\theta\frac{\partial f}{\partial\theta}\right)+\frac{1}{r^2\sin^2\theta}\frac{\partial^2f}{\partial\phi^2}}
$$

(a fórmula do rotacional em esféricas segue o mesmo padrão do determinante generalizado do Passo 4 e é usada raramente nesta apostila; quando necessária, use a forma geral com $h_r=1,h_\theta=r,h_\phi=r\sin\theta$.)

### Visualização e verificação numérica — versores e fatores de escala

O código abaixo **reproduz o Passo 2 e o Passo 3 numericamente**: calcula $\partial\vec r/\partial u_i$ por diferenças finitas em um ponto arbitrário, extrai $h_i=|\partial\vec r/\partial u_i|$ e $\hat u_i$, e compara com as fórmulas fechadas deduzidas acima.

```python
import numpy as np
import matplotlib.pyplot as plt

def r_cil(s, phi, z):
    return np.array([s*np.cos(phi), s*np.sin(phi), z])

def r_esf(r, theta, phi):
    return np.array([r*np.sin(theta)*np.cos(phi),
                      r*np.sin(theta)*np.sin(phi),
                      r*np.cos(theta)])

def versores_e_h(r_func, u0, h=1e-6):
    """dr/du_i por diferença central -> h_i (módulo) e u_hat_i (normalizado)."""
    hs, u_hats = [], []
    for i in range(3):
        du = np.zeros(3); du[i] = h
        drdu = (r_func(*(u0+du)) - r_func(*(u0-du))) / (2*h)
        hi = np.linalg.norm(drdu)
        hs.append(hi)
        u_hats.append(drdu/hi)
    return np.array(hs), np.array(u_hats)

# --- Cilíndricas em (s, phi, z) = (2, pi/4, 1) ---
u0 = np.array([2.0, np.pi/4, 1.0])
h_num, uhat_num = versores_e_h(r_cil, u0)
h_analitico = np.array([1.0, u0[0], 1.0])           # h_s=1, h_phi=s, h_z=1
print("Cilíndricas: h numérico  =", np.round(h_num, 4))
print("Cilíndricas: h analítico =", h_analitico)
print("Ortogonalidade (produtos escalares s.phi, s.z, phi.z):",
      np.round([uhat_num[0]@uhat_num[1], uhat_num[0]@uhat_num[2],
                uhat_num[1]@uhat_num[2]], 8))

# --- Esféricas em (r, theta, phi) = (2, pi/3, pi/4) ---
u0 = np.array([2.0, np.pi/3, np.pi/4])
h_num, uhat_num = versores_e_h(r_esf, u0)
h_analitico = np.array([1.0, u0[0], u0[0]*np.sin(u0[1])])  # h_r=1, h_theta=r, h_phi=r sin(theta)
print("\nEsféricas: h numérico  =", np.round(h_num, 4))
print("Esféricas: h analítico =", np.round(h_analitico, 4))
print("Ortogonalidade (produtos escalares r.theta, r.phi, theta.phi):",
      np.round([uhat_num[0]@uhat_num[1], uhat_num[0]@uhat_num[2],
                uhat_num[1]@uhat_num[2]], 8))

# --- Visualização: círculos de raio constante (s) e raios de phi constante ---
phi = np.linspace(0, 2*np.pi, 200)
fig, ax = plt.subplots()
for s in (0.6, 1.2, 1.8):
    ax.plot(s*np.cos(phi), s*np.sin(phi), label=f"s={s}")
for p in np.linspace(0, 2*np.pi, 12, endpoint=False):
    ax.plot([0, 2*np.cos(p)], [0, 2*np.sin(p)], color="gray", lw=0.7)
ax.set_aspect("equal"); ax.legend()
ax.set_title("Curvas de $s$ constante e $\\phi$ constante (plano $xy$)")
```

**Saída esperada**: o $h$ numérico (diferenças finitas) coincide com o $h$ analítico dentro do erro de truncamento ($<10^{-4}$), e todos os produtos escalares cruzados são $\approx0$ — confirmando numericamente a ortogonalidade estabelecida nos Passos 2.4 e 3.4.

::: exemplo
**Exemplo — gradiente em coordenadas cilíndricas.** Seja $f(s,\phi,z) = s^2 z$. O gradiente é:

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

### Passo 4: de onde vêm as fórmulas gerais (fatores de Lamé)

As caixas do Passo 2.6 não são um "truque de substituição" — elas seguem do **mesmo argumento físico** já usado para o divergente e o rotacional cartesianos (Seções "Dedução da interpretação física (fluxo por unidade de volume)" e "Dedução da interpretação física (circulação por unidade de área)"), aplicado a uma caixa cujas arestas têm comprimento físico $h_1du_1,\ h_2du_2,\ h_3du_3$ em vez de $dx,dy,dz$.

**Gradiente.** Por definição, $df=\nabla f\cdot d\vec\ell$ para qualquer deslocamento (Seção "Passo 1: taxa de variação em uma direção arbitrária"). Por outro lado, pela regra da cadeia,

$$
df = \frac{\partial f}{\partial u_1}du_1+\frac{\partial f}{\partial u_2}du_2+\frac{\partial f}{\partial u_3}du_3
$$

Escrevendo $\nabla f = A_1\hat u_1+A_2\hat u_2+A_3\hat u_3$ e usando $d\vec\ell=h_1du_1\hat u_1+h_2du_2\hat u_2+h_3du_3\hat u_3$ (ortogonalidade elimina os produtos cruzados $\hat u_i\cdot\hat u_j$, $i\neq j$):

$$
\nabla f\cdot d\vec\ell = A_1h_1\,du_1+A_2h_2\,du_2+A_3h_3\,du_3
$$

Comparando termo a termo com a expansão da regra da cadeia, $A_ih_i=\partial f/\partial u_i$, ou seja $A_i=\frac{1}{h_i}\frac{\partial f}{\partial u_i}$ — exatamente a fórmula geral do gradiente usada acima.

**Divergente.** Repita o argumento da caixa infinitesimal cartesiana (cubo $dx\,dy\,dz$), mas agora com uma caixa curvilínea de arestas $h_1du_1,h_2du_2,h_3du_3$. O fluxo líquido saindo pelas duas faces perpendiculares a $\hat u_1$ (áreas $h_2h_3\,du_2du_3$, uma vez que **$h_2,h_3$ também variam com $u_1$**, ao contrário do caso cartesiano) é:

$$
d\Phi_1 = \left[(F_1h_2h_3)\Big|_{u_1+du_1/2}-(F_1h_2h_3)\Big|_{u_1-du_1/2}\right]du_2\,du_3 \approx \frac{\partial(F_1h_2h_3)}{\partial u_1}\,du_1\,du_2\,du_3
$$

(o produto $F_1h_2h_3$ — e não apenas $F_1$ — é o que se expande em Taylor, pois é essa combinação que dá a vazão através da face de área $h_2h_3\,du_2du_3$). Somando as três direções e dividindo pelo volume da caixa $dV=h_1h_2h_3\,du_1du_2du_3$:

$$
\nabla\cdot\vec F = \lim_{\Delta V\to0}\frac{d\Phi_1+d\Phi_2+d\Phi_3}{dV} = \frac{1}{h_1h_2h_3}\left[\frac{\partial(h_2h_3F_1)}{\partial u_1}+\frac{\partial(h_1h_3F_2)}{\partial u_2}+\frac{\partial(h_1h_2F_3)}{\partial u_3}\right]
$$

que é a fórmula geral usada acima. O termo cartesiano ($h_1=h_2=h_3=1$) é o caso particular em que os $h_i$ saem da derivada, recuperando $\partial_xF_x+\partial_yF_y+\partial_zF_z$.

**Rotacional.** O mesmo argumento aplicado à circulação em torno de um laço retangular curvilíneo (arestas $h_idu_i$) — análogo ao laço cartesiano da Seção "Dedução da interpretação física (circulação por unidade de área)", mas com os comprimentos físicos das arestas dependendo de onde elas estão — produz o determinante generalizado:

$$
\nabla\times\vec F = \frac{1}{h_1h_2h_3}\begin{vmatrix}h_1\hat u_1 & h_2\hat u_2 & h_3\hat u_3\\[2pt]\partial_{u_1} & \partial_{u_2} & \partial_{u_3}\\[2pt]h_1F_1 & h_2F_2 & h_3F_3\end{vmatrix}
$$

Expandir esse determinante com $h_s=1,h_\phi=s,h_z=1$ (cilíndricas) reproduz exatamente a fórmula do rotacional cilíndrico do Passo 2.6.

**Laplaciano.** Não precisa de nova dedução: por definição $\nabla^2f=\nabla\cdot(\nabla f)$ (Definição 5), então basta substituir $F_i=A_i=\frac{1}{h_i}\partial f/\partial u_i$ (fórmula do gradiente) na fórmula geral do divergente — o que gera diretamente a fórmula geral do laplaciano usada no Passo 2.6.

Cilíndricas e esféricas são casos particulares dessas quatro fórmulas gerais com $h_s=1,h_\phi=s,h_z=1$ e $h_r=1,h_\theta=r,h_\phi=r\sin\theta$, respectivamente (Passos 2 e 3).

---

## Identidades Vetoriais Fundamentais

Por que memorizar (ou melhor, saber deduzir) estas identidades? Porque, no resto da apostila, $\nabla$ vai aparecer aplicado a produtos e composições de campos ($f\vec F$, $\vec F\times\vec G$, $\nabla\times(\nabla\times\vec F)$) — e sem estas "regras de álgebra" seríamos forçados a expandir tudo em componentes cartesianas toda vez. Cada identidade abaixo é usada repetidamente ao longo da apostila (seção onde é empregada, indicada entre parênteses); as duas primeiras dizem algo estrutural (certas composições são **sempre** zero, um fato puramente geométrico e não uma coincidência do campo); as demais são regras do produto, adaptadas de cálculo escalar para o caso vetorial.

$$
\nabla\times(\nabla f) \equiv 0 \qquad\text{(arquivo 2, Seção “Vetor Unitário”.2 — consistência } \vec E=-\nabla V \text{ com } \nabla\times\vec E=0\text{)}
$$

**Prova**: componente $z$: $\left[\nabla\times(\nabla f)\right]_z = \partial_x(\partial_y f)-\partial_y(\partial_x f) = 0$ pela igualdade das derivadas parciais mistas (teorema de Schwarz, válido para $f$ suave). As demais componentes seguem por permutação cíclica. $\blacksquare$

::: observação
**Por que isso é estrutural, e não uma coincidência.** O rotacional mede circulação (Seção "Rotacional"); o gradiente é a taxa de máxima subida (Seção "O Operador Nabla e o Gradiente"). Fisicamente: um campo $\nabla f$ empurra sempre "morro acima"; percorrer qualquer laço fechado retorna ao ponto de partida, logo a variação líquida de $f$ (e portanto o trabalho de $\nabla f$) em um laço fechado é sempre zero — não porque o campo específico seja especial, mas porque **todo** campo gradiente tem essa propriedade, por construção. Isso é exatamente o Corolário 2 aplicado ao caso $\vec F=\nabla f$.
:::

$$
\nabla\cdot(\nabla\times\vec F) \equiv 0 \qquad\text{(arquivo 4, Seção “Elementos Diferenciais e Integrais”.7.1 — existência de } \vec A \text{, pois } \nabla\cdot\vec B=0\text{)}
$$

**Prova**: $\nabla\cdot(\nabla\times\vec F) = \partial_x(\partial_yF_z-\partial_zF_y)+\partial_y(\partial_zF_x-\partial_xF_z)+\partial_z(\partial_xF_y-\partial_yF_x)$. Cada termo cancela com outro por igualdade das derivadas mistas (ex.: $\partial_x\partial_yF_z$ cancela com $-\partial_y\partial_xF_z$). $\blacksquare$

::: observação
**Interpretação física.** O divergente mede fluxo líquido saindo de um volume (Seção "Divergente"); o rotacional, circulação em torno de um laço (Seção "Rotacional"). Um campo $\nabla\times\vec F$ é composto inteiramente de "linhas que giram" — e linhas que giram, por construção, não têm início nem fim: elas se fecham sobre si mesmas ou vão ao infinito, nunca "brotam" de um ponto. Um campo sem fontes nem sorvedouros tem divergente nulo — daí $\nabla\cdot(\nabla\times\vec F)=0$ sempre. Esta é a razão profunda pela qual $\vec B=\nabla\times\vec A$ é uma escolha **consistente**: como $\nabla\cdot\vec B=0$ sempre (Lei de Gauss magnética, ausência de monopolos), $\vec B$ **precisa** ser o rotacional de algo — e a identidade garante que essa construção nunca viola $\nabla\cdot\vec B=0$, qualquer que seja $\vec A$.
:::

### Prova da regra do produto: $\nabla\cdot(f\vec F)$

$$
\boxed{\nabla\cdot(f\vec F) = f(\nabla\cdot\vec F)+\vec F\cdot\nabla f} \qquad\text{(arquivo 2, Seção “Produto Vetorial”.2 — energia do campo elétrico)}
$$

**Prova**: expanda a componente $x$ de $f\vec F$, que é $fF_x$, e aplique a regra do produto usual de derivadas parciais (válida termo a termo, pois $\partial_x$ trata $y,z$ como constantes):

$$
\frac{\partial(fF_x)}{\partial x} = f\frac{\partial F_x}{\partial x}+F_x\frac{\partial f}{\partial x}
$$

Somando as três componentes análogas ($y$ e $z$):

$$
\nabla\cdot(f\vec F) = \underbrace{f\left(\frac{\partial F_x}{\partial x}+\frac{\partial F_y}{\partial y}+\frac{\partial F_z}{\partial z}\right)}_{f(\nabla\cdot\vec F)} + \underbrace{\left(F_x\frac{\partial f}{\partial x}+F_y\frac{\partial f}{\partial y}+F_z\frac{\partial f}{\partial z}\right)}_{\vec F\cdot\nabla f}
$$

que é exatamente a fórmula acima. $\blacksquare$ Note a analogia direta com a regra do produto escalar, $\frac{d}{dx}(fg)=fg'+f'g$ — aqui um dos "fatores" é vetorial, e o segundo termo vira um produto escalar porque $\nabla f$ precisa ser "contraído" com $\vec F$ para dar um escalar (compatível com o lado esquerdo, que também é escalar).

$$
\nabla\cdot(\vec F\times\vec G) = \vec G\cdot(\nabla\times\vec F)-\vec F\cdot(\nabla\times\vec G)\qquad\text{(arquivo 6, Seção “Rotacional”.8.1 — Teorema de Poynting; prova completa no Gabarito, E15)}
$$

$$
\nabla\times(f\vec F) = f(\nabla\times\vec F)+(\nabla f)\times\vec F \qquad\text{(arquivo 4, Seção “Elementos Diferenciais e Integrais”.7.4 — Biot-Savart a partir de }\vec A\text{)}
$$

### Prova da identidade BAC-CAB: $\nabla\times(\nabla\times\vec F)$

$$
\boxed{\nabla\times(\nabla\times\vec F) = \nabla(\nabla\cdot\vec F)-\nabla^2\vec F} \qquad\text{(arquivo 4, Seção “Elementos Diferenciais e Integrais”.7.3; arquivo 6, Seção “Rotacional”.7.3 — dedução da equação de onda)}
$$

**Prova** (componente $x$; as demais seguem por permutação cíclica $x\to y\to z\to x$). Da Definição 4, a componente $x$ de $\nabla\times\vec F$ é $(\partial_yF_z-\partial_zF_y)$. Aplicando o rotacional de novo:

$$
\left[\nabla\times(\nabla\times\vec F)\right]_x = \partial_y\big[(\nabla\times\vec F)_z\big]-\partial_z\big[(\nabla\times\vec F)_y\big] = \partial_y(\partial_xF_y-\partial_yF_x) - \partial_z(\partial_zF_x-\partial_xF_z)
$$

$$
= \partial_x\partial_yF_y - \partial_y^2F_x - \partial_z^2F_x + \partial_x\partial_zF_z
$$

**Some e subtraia** $\partial_x^2F_x$ (o termo que "falta" para completar um laplaciano em $F_x$) — o truque central desta prova:

$$
= \underbrace{\partial_x\big(\partial_xF_x+\partial_yF_y+\partial_zF_z\big)}_{\partial_x(\nabla\cdot\vec F)} \;-\; \underbrace{\big(\partial_x^2F_x+\partial_y^2F_x+\partial_z^2F_x\big)}_{\nabla^2F_x}
$$

que é exatamente a componente $x$ de $\nabla(\nabla\cdot\vec F)-\nabla^2\vec F$. $\blacksquare$

::: observação
**Por que "BAC-CAB"?** O nome vem da identidade algébrica de vetores comuns $\vec A\times(\vec B\times\vec C)=\vec B(\vec A\cdot\vec C)-\vec C(\vec A\cdot\vec B)$ ("BAC menos CAB"). Aplicando-a formalmente com $\vec A=\vec B=\nabla$ e $\vec C=\vec F$ dá $\nabla\times(\nabla\times\vec F)=\nabla(\nabla\cdot\vec F)-(\nabla\cdot\nabla)\vec F=\nabla(\nabla\cdot\vec F)-\nabla^2\vec F$ — a mesma resposta obtida acima por componentes, mas em uma linha. É um atalho mnemônico útil, **desde que se lembre** que $\nabla$ não comuta como um vetor genérico (ele é um operador — a ordem entre $\nabla$ e o campo sobre o qual atua importa), então o atalho só é seguro para os casos já demonstrados por componentes. Esta identidade é o passo-chave que transforma as equações de Maxwell acopladas em uma **equação de onda** desacoplada para $\vec E$ e $\vec B$ (arquivo 8).
:::

### Verificação simbólica com SymPy — todas as identidades de uma vez

```python
import sympy as sp

x, y, z = sp.symbols('x y z')
f = sp.Function('f')(x, y, z)
g = sp.Function('g')(x, y, z)
Fx, Fy, Fz = [sp.Function(n)(x, y, z) for n in ('Fx', 'Fy', 'Fz')]
Gx, Gy, Gz = [sp.Function(n)(x, y, z) for n in ('Gx', 'Gy', 'Gz')]
F = sp.Matrix([Fx, Fy, Fz])
G = sp.Matrix([Gx, Gy, Gz])

def grad(h):
    return sp.Matrix([sp.diff(h, x), sp.diff(h, y), sp.diff(h, z)])
def div(V):
    return sp.diff(V[0], x) + sp.diff(V[1], y) + sp.diff(V[2], z)
def curl(V):
    return sp.Matrix([sp.diff(V[2], y) - sp.diff(V[1], z),
                       sp.diff(V[0], z) - sp.diff(V[2], x),
                       sp.diff(V[1], x) - sp.diff(V[0], y)])
def lap(h):
    return sp.diff(h, x, 2) + sp.diff(h, y, 2) + sp.diff(h, z, 2)

checks = {
    "rot(grad f) = 0": sp.simplify(curl(grad(f))),
    "div(rot F) = 0": sp.simplify(div(curl(F))),
    "div(fF) - [f div(F) + F.grad(f)]": sp.simplify(
        div(f*F) - (f*div(F) + F.dot(grad(f)))),
    "rot(fF) - [f rot(F) + grad(f) x F]": sp.simplify(
        curl(f*F) - (f*curl(F) + grad(f).cross(F))),
    "rot(rot F) - [grad(div F) - lap(F)]": sp.simplify(
        curl(curl(F)) - (grad(div(F)) - sp.Matrix([lap(Fx), lap(Fy), lap(Fz)]))),
    "div(FxG) - [G.rot(F) - F.rot(G)]": sp.simplify(
        div(F.cross(G)) - (G.dot(curl(F)) - F.dot(curl(G)))),
}
for nome, resultado in checks.items():
    esperado = "0 (ou vetor nulo)" if "=" in nome else "0 (ou vetor nulo) confirma a identidade"
    print(f"{nome}: {resultado}  ->  {esperado}")
```

**Saída esperada**: todas as seis verificações retornam identicamente `0` (escalar) ou `Matrix([[0],[0],[0]])` (vetor) — confirmando simbolicamente, para campos $f,\vec F,\vec G$ **genéricos** (não casos particulares), todas as identidades provadas ou apresentadas nesta seção.

::: aplicacao
**Aplicação Prática — de onde vem a equação de onda.** No arquivo 8, aplicar $\nabla\times$ à Lei de Faraday $\nabla\times\vec E=-\partial\vec B/\partial t$ produz $\nabla\times(\nabla\times\vec E)$ no lado esquerdo. A identidade BAC-CAB comprovada acima converte isso em $\nabla(\nabla\cdot\vec E)-\nabla^2\vec E$; no vácuo, $\nabla\cdot\vec E=0$, sobrando $-\nabla^2\vec E$. Substituindo a Lei de Ampère-Maxwell no lado direito, chega-se à equação de onda $\nabla^2\vec E = \mu_0\varepsilon_0\,\partial^2\vec E/\partial t^2$ — a existência de ondas eletromagnéticas propagando à velocidade da luz é uma **consequência direta** desta identidade puramente algébrica.
:::

---

## Teorema de Helmholtz

### A ideia antes do teorema

Considere o campo bidimensional

$$
\vec F=(x-y)\hat x+(x+y)\hat y.
$$

Ele pode ser separado por inspeção:

$$
\underbrace{(x,y)}_{\text{expansão radial}}
+
\underbrace{(-y,x)}_{\text{rotação}}
=\vec F.
$$

A primeira parcela possui divergente $2$ e rotacional zero; a segunda possui divergente zero e rotacional $2\hat z$. Assim, um campo pode carregar simultaneamente uma parte associada a **fontes** e outra associada a **circulação**. O Teorema de Helmholtz generaliza exatamente essa separação.

Uma analogia útil é reconstruir um relevo conhecendo sua inclinação em toda parte: divergente e rotacional são “impressões digitais diferenciais” do campo. Elas ainda precisam ser acompanhadas das condições de contorno — do contrário, poderíamos adicionar campos compatíveis com os mesmos dados locais.

### Enunciado

**Teorema**: um campo vetorial $\vec F(\vec r)$ que se anula suficientemente rápido no infinito é **unicamente determinado** por seu divergente $\nabla\cdot\vec F = s(\vec r)$ (fontes escalares) e seu rotacional $\nabla\times\vec F = \vec c(\vec r)$ (fontes vetoriais/circulação) em todo o espaço, e pode ser escrito como:

$$
\vec F = -\nabla U + \nabla\times\vec W,\qquad U(\vec r)=\frac{1}{4\pi}\int\frac{s(\vec r')}{|\vec r-\vec r'|}dV',\quad \vec W(\vec r)=\frac{1}{4\pi}\int\frac{\vec c(\vec r')}{|\vec r-\vec r'|}dV'
$$

Leia a expressão em duas camadas:

- $-\nabla U$ é a parte **longitudinal/irrotacional**, construída a partir das fontes $s=\nabla\cdot\vec F$;
- $\nabla\times\vec W$ é a parte **transversal/solenoidal**, construída a partir da circulação $\vec c=\nabla\times\vec F$.

As integrais dizem como cada fonte localizada em $\vec r'$ contribui para o ponto de observação $\vec r$ com o núcleo $1/|\vec r-\vec r'|$. Para uma primeira leitura, é mais importante compreender a decomposição do que memorizar essas integrais.

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

Suponha dois campos $\vec F_1,\vec F_2$ com o mesmo divergente $s$ e o mesmo rotacional $\vec c$ em todo o espaço, ambos se anulando no infinito. A diferença $\vec D=\vec F_1-\vec F_2$ satisfaz $\nabla\cdot\vec D=0$ e $\nabla\times\vec D=0$ em toda parte, e $\vec D\to0$ no infinito. Como $\nabla\times\vec D=0$ e o espaço é simplesmente conexo, $\vec D=-\nabla\psi$ para algum escalar $\psi$. Substituindo em $\nabla\cdot\vec D=0$: $\nabla^2\psi=0$ (Laplace) em todo o espaço, com $\psi\to$ const. no infinito. Pelo Teorema da Unicidade da próxima seção, aplicado com condição de contorno no infinito, a única solução é $\psi=$ const., logo $\vec D=-\nabla\psi=0$ — ou seja, $\vec F_1=\vec F_2$. $\blacksquare$

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

O Teorema da Unicidade é o que garante, no estudo posterior do método das imagens, que substituir um condutor por uma carga imagem fictícia produz a **solução física correta** na região de interesse: se a configuração fictícia reproduz exatamente as mesmas condições de contorno (mesmo $V$ na superfície do condutor) e satisfaz a mesma equação de Poisson na região de interesse, o teorema garante que não pode haver **nenhuma outra** solução válida ali — logo a solução por imagens, por mais artificial que pareça, **é** a solução real.

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

- **Campo irrotacional**: $\nabla\times\vec F = 0$. Em uma região simplesmente conexa, pode ser escrito como o gradiente de um escalar, $\vec F=-\nabla\phi$, e é conservativo.
- **Campo conservativo**: sua integral de linha independe do caminho, equivalentemente $\oint_C\vec F\cdot d\vec\ell=0$ para todo laço permitido. Todo campo conservativo suave é irrotacional; a recíproca exige cuidado com a topologia do domínio.
- **Campo solenoidal**: $\nabla\cdot\vec F = 0$. Sob hipóteses adequadas sobre o domínio e as fronteiras, pode ser escrito como $\vec F=\nabla\times\vec A$.
- **Campo harmônico vetorial**: $\nabla\cdot\vec F=0$ e $\nabla\times\vec F=0$. Localmente satisfaz $\nabla^2\vec F=0$, pela identidade $\nabla^2\vec F=\nabla(\nabla\cdot\vec F)-\nabla\times(\nabla\times\vec F)$.

O **Teorema de Helmholtz** garante que qualquer campo vetorial bem comportado pode ser decomposto em uma parte irrotacional e uma parte solenoidal.

::: observação
**Por que o domínio importa?** No plano perfurado $\mathbb R^2\setminus\{0\}$,

$$
\vec F=\frac{-y\,\hat x+x\,\hat y}{x^2+y^2}
$$

tem rotacional zero em todos os pontos do domínio, mas sua circulação em torno de qualquer círculo que envolva a origem é $2\pi$. O “redemoinho” singular ficou no furo, onde o campo não está definido. Portanto, $\nabla\times\vec F=0$ localmente não basta para garantir um potencial global quando o domínio possui furos.
:::

---

## Resumo do Capítulo

### Fórmulas-Chave

| Operador | Símbolo | Definição (Cartesiana) | Interpretação Física |
|---|---|---|---|
| Gradiente | $\nabla f$ | $\frac{\partial f}{\partial x}\hat{x}+\frac{\partial f}{\partial y}\hat{y}+\frac{\partial f}{\partial z}\hat{z}$ | Direção e taxa de máximo crescimento de $f$ |
| Divergente | $\nabla\cdot\vec F$ | $\frac{\partial F_x}{\partial x}+\frac{\partial F_y}{\partial y}+\frac{\partial F_z}{\partial z}$ | Densidade de fontes/sorvedouros |
| Rotacional | $\nabla\times\vec F$ | Determinante com $\hat x,\hat y,\hat z$, $\partial_x,\partial_y,\partial_z$, $F_x,F_y,F_z$ | Densidade de circulação |
| Laplaciano | $\nabla^2 f$ | $\frac{\partial^2f}{\partial x^2}+\frac{\partial^2f}{\partial y^2}+\frac{\partial^2f}{\partial z^2}$ | Média vizinha menos valor local (a menos do fator de escala) |

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

::: insight
**Insights-Chave do Capítulo — as metáforas físicas para lembrar de cor**

| Operador | Metáfora física | O que ela captura |
|---|---|---|
| **Produto escalar** $\vec A\cdot\vec B$ | "Quanto de $B$ empurra na direção de $A$?" | Só a componente **paralela** contribui — daí trabalho $=\vec F\cdot d\vec\ell$ |
| **Produto vetorial** $\vec A\times\vec B$ | "Área varrida, com sinal dado pela mão direita" | Só a componente **perpendicular** contribui — daí torque, força magnética |
| **Gradiente** $\nabla f$ | Bússola no topo de uma colina: aponta morro acima | Direção e taxa de **máxima subida**; sempre $\perp$ às curvas de nível |
| **Divergente** $\nabla\cdot\vec F$ | Balanço contábil de um voxel: saídas menos entradas | Densidade de **fontes/sorvedouros** — base da Lei de Gauss local |
| **Rotacional** $\nabla\times\vec F$ | Roda de pás flutuando no campo: gira ou não? | Densidade de **circulação/torque local** — base da Lei de Ampère/Faraday locais |
| **Laplaciano** $\nabla^2f$ | Detector de desequilíbrio: eu sou a média dos meus vizinhos? | Diferença entre valor local e **média da vizinhança** — base da equação de Laplace/difusão |
| **Teorema do Divergente** | Somar balanços de todos os voxels de um volume | As faces internas se cancelam; só a **casca externa** sobra |
| **Teorema de Stokes** | Somar circulações de todas as células de uma superfície | As arestas internas se cancelam; só o **contorno externo** sobra |
| **Teorema de Helmholtz** | "Fontes + redemoinhos determinam o campo por completo" | Um campo é só sua parte irrotacional (gradiente) mais sua parte solenoidal (rotacional) |

O fio condutor: **gradiente, divergente e rotacional são todos limites de razões entre uma integral (em uma fronteira) e uma medida geométrica (comprimento, volume, área) que encolhe a zero** — e os Teoremas do Divergente e de Stokes são, cada um, a versão "somada sobre muitas células pequenas, com cancelamento nas fronteiras internas" exatamente dessas mesmas definições locais.
:::

---

## Lista de Exercícios Propostos

**E1.** Calcule $\nabla f$ para $f(x,y,z)=x^2y+yz^3$. Avalie em $(1,2,1)$ e determine a direção de máximo crescimento nesse ponto.

**E2.** Mostre, por cálculo direto em cartesianas, que $\nabla\times(\nabla f)=0$ para $f=xy^2z^3$ (isto é, calcule $\nabla f$ e depois $\nabla\times(\nabla f)$ explicitamente).

**E3.** Calcule $\nabla\cdot\vec F$ para $\vec F=(x^2,\,2xy,\,-z^2)$. O campo tem fontes? Onde?

**E4.** Calcule $\nabla\times\vec F$ para $\vec F=(-y,\,x,\,0)$. Interprete fisicamente o resultado (que campo físico, estudado nesta apostila, tem essa mesma forma funcional **no interior** de um fio cilíndrico infinito com densidade de corrente uniforme?).

**E5.** Verifique, calculando ambos os lados diretamente, que $\vec F=(x^2,\,2xy,\,-z^2)$ satisfaz $\nabla\times(\nabla\times\vec F)=\nabla(\nabla\cdot\vec F)-\nabla^2\vec F$ (calcule $\nabla\times\vec F$ primeiro; se for zero, o que a identidade se reduz a?).

**E6.** Um campo escalar em coordenadas esféricas é $f(r)=1/r$. Calcule $\nabla f$ usando a fórmula da Seção “Passo 3: coordenadas esféricas $(r,\theta,\phi)$ — dedução completa” e compare com o resultado conhecido $\nabla(1/r)=-\hat r/r^2$ (arquivo 2, Seção “Adição e Subtração de Vetores”.3).

**E7.** Use a fórmula do divergente em esféricas (Seção “Passo 3: coordenadas esféricas $(r,\theta,\phi)$ — dedução completa”) para mostrar que $\vec F = r\,\hat r$ (não $1/r^2$) tem $\nabla\cdot\vec F=3$ em todo ponto — consistente com $\vec F=\vec r$ em cartesianas, cujo divergente cartesiano é trivialmente $3$.

**E8.** Aplique o Teorema do Divergente para calcular $\oint_S\vec F\cdot d\vec A$ onde $\vec F=(x,y,z)$ e $S$ é a superfície de um cubo de lado $L$ centrado na origem, **sem** calcular a integral de superfície diretamente (calcule $\nabla\cdot\vec F$ e integre sobre o volume).

**E9.** Aplique o Teorema de Stokes para calcular $\oint_C\vec F\cdot d\vec\ell$ onde $\vec F=(-y,x,0)$ e $C$ é um quadrado de lado $2$ no plano $xy$, centrado na origem, percorrido anti-horário — sem calcular a integral de linha diretamente.

**E10.** Explique, usando o Teorema de Helmholtz (Seção “Teorema de Helmholtz”), por que basta especificar $\nabla\cdot\vec E$ e $\nabla\times\vec E$ em **todo o espaço** para determinar $\vec E$ unicamente — e por que isso é exatamente o conteúdo de duas das quatro Equações de Maxwell (arquivo 6, Seção “Rotacional”.7.1).

**E11.** No enunciado do Teorema da Unicidade (Seção “Identidades Vetoriais Fundamentais”.1), explique por que **não é permitido** especificar simultaneamente Dirichlet ($\phi$) e Neumann ($\partial\phi/\partial n$) com valores independentes na mesma fronteira $S$ — o que aconteceria com a prova da Seção “Identidades Vetoriais Fundamentais”.2 nesse caso (dica: o problema ficaria sobredeterminado).

**E12.** Um campo tem $\nabla\cdot\vec F=0$ e $\nabla\times\vec F=0$ em todo o espaço, anulando-se no infinito. Use o Teorema de Helmholtz para concluir, sem cálculo adicional, o valor de $\vec F$ em todo ponto.

**E13.** Verifique a identidade $\nabla\cdot(f\vec F)=f(\nabla\cdot\vec F)+\vec F\cdot\nabla f$ para $f=x$ e $\vec F=(y,z,x)$, calculando os dois lados explicitamente.

**E14.** (Desafio) Escreva o laplaciano $\nabla^2 f$ em coordenadas cilíndricas (Seção “Passo 2: coordenadas cilíndricas $(s,\phi,z)$ — dedução completa”) para $f(s)=\ln s$ (potencial de um fio infinito, a menos de constante — arquivo 1). Mostre que $\nabla^2 f=0$ para $s\neq0$, consistente com a ausência de carga fora do fio.

**E15.** (Desafio) Demonstre a identidade $\nabla\cdot(\vec F\times\vec G)=\vec G\cdot(\nabla\times\vec F)-\vec F\cdot(\nabla\times\vec G)$ expandindo **completamente** ambos os lados em componentes cartesianas para $\vec F=(F_x,F_y,F_z)$ e $\vec G=(G_x,G_y,G_z)$. Depois confira o sinal com o caso particular $\vec F=(-y,x,0)$ e $\vec G=(0,0,1)$.

**E16.** Seja $f(x,y,z)=x^2y-yz$. Calcule $\nabla f$ em $(1,-1,2)$ e, a partir dele, a **derivada direcional** de $f$ nesse ponto ao longo do versor $\hat u=\tfrac{1}{3}(2,-1,2)$ (verifique primeiro que $\hat u$ é unitário). O resultado é positivo ou negativo — $f$ cresce ou decresce ao caminhar nessa direção?

**E17.** Classifique o campo $\vec F=(y^2,\,x^2,\,z^2)$ quanto a ser irrotacional, solenoidal, harmônico ou nenhum dos três (Seção "Classificação de Campos Vetoriais"): calcule $\nabla\cdot\vec F$ e $\nabla\times\vec F$ e decida com base nas definições.

**E18.** Em coordenadas cilíndricas, seja $\vec F=s^2\,\hat\phi$ (isto é, $F_s=0,\ F_\phi=s^2,\ F_z=0$). Use a fórmula do rotacional cilíndrico (Seção "Passo 2: coordenadas cilíndricas $(s,\phi,z)$ — dedução completa") para mostrar que $\nabla\times\vec F=3s\,\hat z$. Compare com o Exemplo 3 ($\vec F=s\,\hat\phi$, rotacional $2\hat z$ constante): por que aqui o rotacional **não** é constante?

**E19.** Calcule diretamente (sem usar Stokes) a integral de linha $\int_C\vec F\cdot d\vec\ell$ para $\vec F=(y,\,-x,\,0)$ ao longo da parábola $y=x^2$, de $(0,0)$ a $(1,1)$ (parametrize por $x=t,\ y=t^2,\ t\in[0,1]$). Em seguida calcule $\nabla\times\vec F$ e explique por que **não** é surpreendente que essa integral dependa do caminho escolhido entre $(0,0)$ e $(1,1)$ (Corolário 2).

**E20.** (Desafio) Verifique a consistência entre a fórmula esférica do gradiente (Seção "Passo 3: coordenadas esféricas $(r,\theta,\phi)$ — dedução completa") e a cartesiana: calcule $\nabla f$ para $f(r)=r^2$ usando a fórmula esférica, e separadamente $\nabla f$ para $f(x,y,z)=x^2+y^2+z^2$ usando a fórmula cartesiana. Mostre que os módulos coincidem (lembre que $r=|\vec r|=\sqrt{x^2+y^2+z^2}$).

**E21.** Calcule o laplaciano de $f(x,y,z)=x^2y-y^3+z^2$. O resultado é constante? $f$ é harmônica em algum subconjunto do espaço (além da origem)? Se sim, identifique esse conjunto.

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

**E12.** Pelo Teorema de Helmholtz, um campo é unicamente determinado por seu divergente e rotacional (dadas condições de anulação no infinito). Se ambos são identicamente nulos em todo o espaço, a única função consistente com $U=0$ e $\vec W=0$ na fórmula da Seção “Teorema de Helmholtz” é $\vec F\equiv\vec 0$ em todo ponto.

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

**E16.** $\nabla f = (2xy)\hat x+(x^2-z)\hat y+(-y)\hat z$. Em $(1,-1,2)$: $\nabla f = (-2,\,-1,\,1)$. Verificação de $\hat u$: $|(2,-1,2)|=\sqrt{4+1+4}=3$, logo $\hat u=\tfrac13(2,-1,2)$ é de fato unitário. A derivada direcional é $\dfrac{df}{d\ell}=\nabla f\cdot\hat u = \dfrac{(-2)(2)+(-1)(-1)+(1)(2)}{3} = \dfrac{-4+1+2}{3} = -\dfrac13$. O resultado é **negativo**: $f$ **decresce** ao longo dessa direção nesse ponto (você estaria caminhando parcialmente "morro abaixo", pois $\hat u$ tem componente negativa ao longo de $\nabla f$).

**E17.** $\nabla\cdot\vec F = 0+0+2z = 2z$ (não identicamente nulo, logo o campo **não** é solenoidal em todo o espaço). $\nabla\times\vec F = (\partial_y z^2-\partial_z x^2,\ \partial_z y^2-\partial_x z^2,\ \partial_x x^2-\partial_y y^2) = (0,\,0,\,2x-2y)$ (não identicamente nulo, logo **não** é irrotacional em todo o espaço). Como nem o divergente nem o rotacional se anulam identicamente, $\vec F$ **não** se enquadra em nenhuma das três classes globais da Seção "Classificação de Campos Vetoriais" — é um campo genérico, com fontes (onde $z\neq0$) e circulação local (onde $x\neq y$) simultaneamente. (Note que ele *é* solenoidal restrito ao plano $z=0$ e irrotacional restrito à reta $x=y$ — mas isso não basta para a classificação global, que exige a condição em todo ponto.)

**E18.** Usando $\nabla\times\vec F=\left(\frac1s\partial_\phi F_z-\partial_zF_\phi\right)\hat s+\left(\partial_zF_s-\partial_sF_z\right)\hat\phi+\frac1s\left(\partial_s(sF_\phi)-\partial_\phi F_s\right)\hat z$ com $F_s=0,\ F_\phi=s^2,\ F_z=0$: as componentes $\hat s$ e $\hat\phi$ são nulas (nenhum termo depende de $z$ ou $\phi$), e a componente $\hat z$ é $\frac1s\partial_s(s\cdot s^2)=\frac1s\partial_s(s^3)=\frac{3s^2}{s}=3s$. Logo $\nabla\times\vec F=3s\,\hat z$. Diferente do Exemplo 3 ($F_\phi=s$, rotacional $2\hat z$ constante), aqui $F_\phi=s^2$ cresce mais rápido que linearmente com $s$, então a circulação por unidade de área ao redor de laços a raios maiores cresce junto — o rotacional cilíndrico não é constante porque a fórmula tem o termo $\partial_s(sF_\phi)$, que "sente" como $F_\phi$ escala com $s$, e não apenas seu valor local.

**E19.** Parametrizando $x=t,\ y=t^2$, $t\in[0,1]$: $\vec F=(y,-x,0)=(t^2,-t,0)$ e $d\vec\ell=(1,2t,0)\,dt$. Logo $\vec F\cdot d\vec\ell = t^2(1)+(-t)(2t) = t^2-2t^2=-t^2$, e $\int_C\vec F\cdot d\vec\ell = \displaystyle\int_0^1(-t^2)\,dt = -\dfrac13$. Calculando $\nabla\times\vec F=(0,0,-2)$ (não nulo) — pelo Corolário 2, um rotacional não nulo significa que a integral de linha **depende do caminho** entre os extremos; o valor $-1/3$ obtido aqui (ao longo da parábola) não precisa coincidir com o valor ao longo, por exemplo, do segmento de reta $(0,0)\to(1,1)$, e de fato não coincide — comportamento esperado para um campo não conservativo.

**E20.** Pela fórmula esférica do gradiente (Seção "Passo 3"), como $f=f(r)$ depende só de $r$: $\nabla f = \dfrac{\partial f}{\partial r}\hat r = 2r\,\hat r$, de módulo $|\nabla f|=2r$. Em cartesianas, $f=x^2+y^2+z^2$: $\nabla f=(2x,2y,2z)$, de módulo $|\nabla f|=\sqrt{4x^2+4y^2+4z^2}=2\sqrt{x^2+y^2+z^2}=2r$. Os módulos coincidem exatamente ($2r=2r$) ✓, confirmando que as duas fórmulas — aparentemente muito diferentes na forma — descrevem o mesmo campo vetorial.

**E21.** $\nabla^2f = \partial_x^2(x^2y-y^3+z^2)+\partial_y^2(\cdots)+\partial_z^2(\cdots) = 2y + (-6y) + 2 = 2-4y$. O resultado **não** é constante — depende de $y$. $f$ é harmônica ($\nabla^2f=0$) exatamente onde $2-4y=0$, isto é, no plano $y=\tfrac12$ (não em todo o espaço, apenas nesse subconjunto de medida nula — um caso em que a harmonicidade é uma propriedade local de um plano específico, não do campo inteiro).

---

## Gabarito Computacional: Resolvendo os Exercícios com SymPy

Todo exercício desta lista envolve apenas três operações (gradiente, divergente, rotacional — mais o laplaciano, que é o divergente do gradiente) e uma operação de integração/substituição. Isso significa que **todo o gabarito acima pode ser gerado automaticamente**, sem álgebra manual, definindo `grad`, `div`, `curl` uma única vez em SymPy e aplicando-os a cada campo do enunciado. Este é exatamente o mesmo padrão de verificação já usado na Seção "Identidades Vetoriais Fundamentais" (verificação simbólica das identidades) — aqui aplicado exercício a exercício.

O script abaixo resolve **E1–E9 e E13–E21** (todos os exercícios que pedem um cálculo explícito; E10, E11 e E12 são puramente conceituais — argumentos com o Teorema de Helmholtz e a prova de unicidade — e não correspondem a uma conta a verificar). Rode-o e compare cada linha impressa com a resposta correspondente no Gabarito acima: elas devem coincidir exatamente.

```python
import sympy as sp

x, y, z, s, phi, r, L, t = sp.symbols('x y z s phi r L t', real=True)

def grad(f, vars=(x, y, z)):
    return sp.Matrix([sp.diff(f, v) for v in vars])

def div(F, vars=(x, y, z)):
    return sum(sp.diff(F[i], vars[i]) for i in range(3))

def curl(F):
    Fx, Fy, Fz = F
    return sp.Matrix([
        sp.diff(Fz, y) - sp.diff(Fy, z),
        sp.diff(Fx, z) - sp.diff(Fz, x),
        sp.diff(Fy, x) - sp.diff(Fx, y),
    ])

def lap(f, vars=(x, y, z)):
    return sum(sp.diff(f, v, 2) for v in vars)

# --- E1: gradiente e avaliação num ponto ---
f1 = x**2*y + y*z**3
g1 = grad(f1)
print("E1  grad f =", g1.T, " em (1,2,1):", g1.subs({x: 1, y: 2, z: 1}).T)

# --- E2: rot(grad f) = 0 (identidade estrutural) ---
f2 = x*y**2*z**3
print("E2  rot(grad f) =", sp.simplify(curl(grad(f2))).T)

# --- E3: divergente e localização das fontes ---
F3 = sp.Matrix([x**2, 2*x*y, -z**2])
print("E3  div F =", div(F3))

# --- E4: rotacional (campo tipo s*phi_hat em cilíndricas) ---
F4 = sp.Matrix([-y, x, 0])
print("E4  rot F =", curl(F4).T)

# --- E5: identidade BAC-CAB, rot(rot F) = grad(div F) - lap F ---
F5 = sp.Matrix([x**2, 2*x*y, -z**2])
lhs5 = curl(curl(F5))
rhs5 = grad(div(F5)) - sp.Matrix([lap(F5[i]) for i in range(3)])
print("E5  rot(rot F) =", lhs5.T, " | grad(div F)-lap F =", rhs5.T,
      " | identidade:", sp.simplify(lhs5 - rhs5) == sp.zeros(3, 1))

# --- E6: gradiente de 1/r em esféricas (só a componente radial é não nula) ---
print("E6  d(1/r)/dr =", sp.diff(1/r, r), "-> grad(1/r) = -1/r^2 r_hat")

# --- E7: divergente de F = r*r_hat em esféricas ---
print("E7  div(r r_hat) =", sp.simplify((1/r**2)*sp.diff(r**2*r, r)))

# --- E8: Teorema do Divergente para F=(x,y,z) num cubo de lado L ---
divF8 = div(sp.Matrix([x, y, z]))
print("E8  div F =", divF8, " -> fluxo = div F * L^3 =", divF8*L**3)

# --- E9: Teorema de Stokes para F=(-y,x,0) num quadrado de lado 2 ---
rotF9 = curl(sp.Matrix([-y, x, 0]))
print("E9  rot F =", rotF9.T, " -> circulação = rot_z * área =", rotF9[2]*4)

# --- E13: regra do produto div(fF) = f div(F) + F.grad(f) ---
f13, F13 = x, sp.Matrix([y, z, x])
lhs13 = div(f13*F13)
rhs13 = f13*div(F13) + F13.dot(grad(f13))
print("E13 div(fF) =", lhs13, " | f div(F)+F.grad(f) =", rhs13,
      " | iguais:", sp.simplify(lhs13 - rhs13) == 0)

# --- E14: laplaciano cilíndrico de ln(s) ---
f14 = sp.log(s)
print("E14 laplaciano(ln s) =", sp.simplify((1/s)*sp.diff(s*sp.diff(f14, s), s)))

# --- E15: div(FxG) = G.rot(F) - F.rot(G) ---
Fv, Gv = sp.Matrix([-y, x, 0]), sp.Matrix([0, 0, 1])
lhs15 = div(Fv.cross(Gv))
rhs15 = Gv.dot(curl(Fv)) - Fv.dot(curl(Gv))
print("E15 div(FxG) =", lhs15, " | G.rot(F)-F.rot(G) =", rhs15)

# --- E16: derivada direcional em (1,-1,2) ao longo de u=(2,-1,2)/3 ---
f16 = x**2*y - y*z
g16 = grad(f16).subs({x: 1, y: -1, z: 2})
u16 = sp.Matrix([2, -1, 2]) / 3
print("E16 grad f(1,-1,2) =", g16.T, " |u| =", sp.sqrt(u16.dot(u16)),
      " df/dl =", g16.dot(u16))

# --- E17: classificação via div e rot ---
F17 = sp.Matrix([y**2, x**2, z**2])
print("E17 div F =", div(F17), " rot F =", curl(F17).T)

# --- E18: rotacional cilíndrico de F = s^2 phi_hat ---
Fs, Fphi, Fz_ = 0, s**2, 0
rot_z18 = sp.simplify((1/s)*(sp.diff(s*Fphi, s) - sp.diff(Fs, phi)))
print("E18 rot_z(s^2 phi_hat) =", rot_z18)

# --- E19: integral de linha direta sobre y=x^2, de (0,0) a (1,1) ---
xt, yt = t, t**2
Fpath = sp.Matrix([yt, -xt, 0])
dl = sp.Matrix([sp.diff(xt, t), sp.diff(yt, t), 0])
I19 = sp.integrate((Fpath.T * dl)[0], (t, 0, 1))
print("E19 integral de linha =", I19, " rot F =", curl(sp.Matrix([y, -x, 0])).T)

# --- E20: |grad f| coincide em esféricas (f=r^2) e cartesianas (f=x^2+y^2+z^2) ---
mod20_esf = sp.Abs(sp.diff(r**2, r))
g20_cart = grad(x**2 + y**2 + z**2)
mod20_cart = sp.sqrt(sp.factor(g20_cart.dot(g20_cart)))
print("E20 |grad f|_esf = 2r  | |grad f|_cart =", mod20_cart)

# --- E21: laplaciano cartesiano e conjunto onde f é harmônica ---
f21 = x**2*y - y**3 + z**2
lap21 = lap(f21)
print("E21 laplaciano f =", lap21, " harmônica em y =", sp.solve(sp.Eq(lap21, 0), y))
```

**Saída esperada** (cada linha deve coincidir com a resposta correspondente no Gabarito):

```
E1  grad f = Matrix([[2*x*y, x**2 + z**3, 3*y*z**2]])  em (1,2,1): Matrix([[4, 2, 6]])
E2  rot(grad f) = Matrix([[0, 0, 0]])
E3  div F = 4*x - 2*z
E4  rot F = Matrix([[0, 0, 2]])
E5  rot(rot F) = Matrix([[2, 0, 0]])  | grad(div F)-lap F = Matrix([[2, 0, 0]])  | identidade: True
E6  d(1/r)/dr = -1/r**2 -> grad(1/r) = -1/r^2 r_hat
E7  div(r r_hat) = 3
E8  div F = 3  -> fluxo = div F * L^3 = 3*L**3
E9  rot F = Matrix([[0, 0, 2]])  -> circulação = rot_z * área = 8
E13 div(fF) = y  | f div(F)+F.grad(f) = y  | iguais: True
E14 laplaciano(ln s) = 0
E15 div(FxG) = 2  | G.rot(F)-F.rot(G) = 2
E16 grad f(1,-1,2) = Matrix([[-2, -1, 1]])  |u| = 1  df/dl = -1/3
E17 div F = 2*z  rot F = Matrix([[0, 0, 2*x - 2*y]])
E18 rot_z(s^2 phi_hat) = 3*s
E19 integral de linha = -1/3  rot F = Matrix([[0, 0, -2]])
E20 |grad f|_esf = 2r  | |grad f|_cart = 2*sqrt(x**2 + y**2 + z**2)
E21 laplaciano f = 2 - 4*y  harmônica em y = [1/2]
```

::: observação
**Sobre `sp.simplify` e igualdade simbólica.** Note o padrão usado em E2, E5, E13 e E17: para *provar* uma identidade (não apenas calcular um valor), o script computa `lado_esquerdo - lado_direito` e verifica que o SymPy simplifica essa diferença para exatamente zero — em vez de comparar duas expressões simbólicas diretamente com `==`, o que compararia a **forma sintática**, não a **igualdade matemática** (duas expressões matematicamente iguais podem estar escritas de formas diferentes até serem simplificadas). Essa é a mesma técnica já usada na verificação das seis identidades da Seção "Identidades Vetoriais Fundamentais".
:::
