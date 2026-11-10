# Simulação numérica de EMC: FDTD e TLM

> Quando propagação, radiação ou ressonâncias espaciais determinam o comportamento do sistema, modelos de circuito podem exigir uma descrição de campo. FDTD (Finite-Difference Time-Domain) e TLM (Transmission Line Matrix) são métodos de domínio do tempo; respostas em frequência podem ser extraídas dos campos registrados por transformada de Fourier.

## Objetivos de aprendizagem

Ao final, você deve ser capaz de:

1. entender a formulação das equações de Maxwell para simulação no domínio do tempo;
2. descrever a grade de Yee e o esquema de discretização FDTD;
3. aplicar a condição de estabilidade CFL (Courant-Friedrichs-Lewy);
4. explicar o método TLM e sua analogia com linhas de transmissão;
5. identificar condições de contorno e camadas absorvedoras (PML);
6. comparar FDTD e TLM em termos de aplicação e limitações práticas.

## Sumário

1. [O problema eletromagnético completo](#o-problema-eletromagnético-completo)
2. [FDTD e a grade de Yee](#fdtd-e-a-grade-de-yee)
3. [Condições de contorno e absorção](#condições-de-contorno-e-absorção)
4. [TLM — Transmission Line Matrix](#tlm--transmission-line-matrix)
5. [Comparação FDTD vs TLM](#comparação-fdtd-vs-tlm)
6. [Limitações e considerações práticas](#limitações-e-considerações-práticas)
7. [Exemplo resolvido — dimensionamento e convergência](#exemplo-resolvido--dimensionamento-e-convergência)
8. [Lista de Exercícios Propostos](#lista-de-exercícios-propostos)
9. [Gabarito](#gabarito)
10. [Referências e ferramentas](#referências-e-ferramentas)

## O problema eletromagnético completo

As equações de Maxwell na forma diferencial, em um meio com densidade de carga livre $\rho$ e densidade de corrente livre $\mathbf J$, são:

$$
\nabla \times \mathbf{E} = -\frac{\partial \mathbf{B}}{\partial t}
$$

$$
\nabla \times \mathbf{H} = \frac{\partial \mathbf{D}}{\partial t} + \mathbf{J}
$$

$$
\nabla \cdot \mathbf{D} = \rho
$$

$$
\nabla \cdot \mathbf{B} = 0
$$

Em um meio linear, isotrópico e não dispersivo, usamos $\mathbf{D} = \varepsilon \mathbf{E}$ e $\mathbf{B} = \mu \mathbf{H}$. Sem fontes livres, impomos $\rho=0$ e $\mathbf J=0$. Para simulação no domínio do tempo, discretizamos o espaço e o tempo, transformando as derivadas parciais em diferenças finitas.

## FDTD e a grade de Yee

O método FDTD, introduzido por Kane Yee em 1966, discretiza o espaço usando uma grade escalonada conhecida como **célula de Yee**. Nesta célula, as componentes do campo elétrico ($E_x, E_y, E_z$) e as componentes do campo magnético ($H_x, H_y, H_z$) estão deslocadas por meio passo de grade no espaço.

### Esquema de discretização

Em uma célula de Yee cúbica com passo $\Delta x = \Delta y = \Delta z = \Delta$, os campos são atualizados iterativamente no tempo usando diferenças finitas centrais. Para a componente $H_x$:

$$
\begin{aligned}
&H_x^{n+1/2}\left(i,j+\tfrac12,k+\tfrac12\right)
=H_x^{n-1/2}\left(i,j+\tfrac12,k+\tfrac12\right)\\
&\quad-\frac{\Delta t}{\mu\Delta}\Big[
E_z^n\left(i,j+1,k+\tfrac12\right)-E_z^n\left(i,j,k+\tfrac12\right)\\
&\hspace{43mm}-E_y^n\left(i,j+\tfrac12,k+1\right)+E_y^n\left(i,j+\tfrac12,k\right)\Big].
\end{aligned}
$$

O sinal segue $\partial H_x/\partial t=-(\partial E_z/\partial y-\partial E_y/\partial z)/\mu$. Os campos elétricos são amostrados em tempos inteiros e os magnéticos em meios passos (*leapfrog*).

Equações análogas valem para $H_y, H_z$ e para as componentes de $\mathbf{E}$, que são atualizadas a partir de $\mathbf{H}$ usando a lei de Ampère.

### Condição de estabilidade CFL

O esquema explícito FDTD requer uma condição de estabilidade para evitar divergência numérica. A condição de Courant-Friedrichs-Lewy (CFL) para uma grade cúbica é:

$$
\Delta t \leq \frac{\Delta}{c \sqrt{3}}
$$

onde $c=1/\sqrt{\mu\varepsilon}$ é a velocidade de propagação no meio não dispersivo. Em uma malha com vários meios, use a maior velocidade presente. Modelos dispersivos, condutores ou extensões do algoritmo podem impor restrições adicionais. Para grades não cúbicas, a condição geral é:

$$
\frac{1}{\Delta t^2} \geq c^2 \left( \frac{1}{\Delta x^2} + \frac{1}{\Delta y^2} + \frac{1}{\Delta z^2} \right)
$$

## Condições de contorno e absorção

Para um domínio não limitado, o FDTD requer o truncamento do domínio computacional. Condições de contorno simples incluem:

- **PEC (Perfect Electric Conductor):** $\mathbf{E}_t = 0$ na superfície.
- **PMC (Perfect Magnetic Conductor):** $\mathbf{H}_t = 0$ na superfície.

Para fronteiras abertas (radiação para o espaço livre), usam-se **Condições de Contorno Absorvedoras (ABC)** ou **Camadas Perfeitamente Casadas (PML - Perfectly Matched Layer)**. A PML ideal é casada à região física na formulação contínua. Na implementação, espessura finita, discretização e perfil de absorção produzem reflexão residual. Verifique convergência aumentando a espessura e afastando a camada de campos evanescentes; meios não homogêneos também podem invalidar o casamento. Consulte a [documentação de PML do Meep](https://meep.readthedocs.io/en/latest/Perfectly_Matched_Layer/).

## TLM — Transmission Line Matrix

O método TLM, introduzido por P. B. Johns e R. L. Beurle em 1971, é outra técnica de domínio do tempo que modela o campo eletromagnético como uma rede de linhas de transmissão. Cada nó na malha TLM representa um ponto no espaço, e as linhas representam a propagação de ondas de tensão e corrente (análogas aos campos $\mathbf{E}$ e $\mathbf{H}$).

### Esquema de espalhamento e conexão

No TLM, a matriz de espalhamento em cada nó descreve como as ondas incidentes são refletidas e transmitidas. A evolução temporal é obtida resolvendo iterativamente os passos de **espalhamento** (scattering) e **conexão** (connection):

1. **Espalhamento:** Ondas incidentes chegam ao nó e são espalhadas de acordo com a matriz de espalhamento do nó (que depende das impedâncias características das linhas conectadas).
2. **Conexão:** Ondas espalhadas de um nó tornam-se ondas incidentes para os nós vizinhos, propagando-se ao longo das linhas de transmissão.

### Modelagem e limites do TLM

A rede permite interpretar propagação, espalhamento e condições de contorno por ondas de tensão e corrente. A representação de materiais depende do tipo de nó, das linhas auxiliares e das equações constitutivas implementadas. Geometrias curvas, anisotropia, dispersão e não linearidade exigem formulações próprias e validação; alterar apenas uma impedância não representa todos esses efeitos.

## Comparação FDTD vs TLM

| Característica | FDTD | TLM |
|---|---|---|
| **Formulação base** | Discretização direta das equações de Maxwell (leis de Faraday e Ampère) | Rede equivalente de linhas de transmissão |
| **Grade espacial** | Grade de Yee (campos E e H escalonados) | Malha de nós com linhas de transmissão conectadas |
| **Variáveis de campo** | $\mathbf{E}$ e $\mathbf{H}$ diretamente | Tensões e correntes nas linhas (análogas a $\mathbf{E}$ e $\mathbf{H}$) |
| **Atualização** | Alterna os campos elétrico e magnético | Alterna espalhamento nos nós e conexão entre nós |
| **Materiais dispersivos** | Equações auxiliares ou convolução para a resposta constitutiva | Nós e elementos auxiliares para a resposta constitutiva |

Ambos os métodos são técnicas explícitas de domínio do tempo e exigem condições de estabilidade similares.

## Limitações e considerações práticas

### Dispersão numérica

A velocidade de fase numérica depende da frequência e da direção de propagação na grade. Para minimizar a dispersão numérica, o tamanho da célula deve ser pequeno o suficiente:

$$
\Delta \leq \frac{\lambda_{\min}}{10} \quad \text{ou} \quad \Delta \leq \frac{\lambda_{\min}}{20}
$$

onde $\lambda_{\min}$ é o menor comprimento de onda de interesse nos materiais simulados. Dez a vinte células por comprimento de onda são um ponto de partida, não uma garantia de precisão. Refine a malha e compare a grandeza de interesse; fendas, interfaces e curvaturas podem exigir células menores.

### Dispersão material

Materiais com perdas ou dispersão (frequência-dependentes) requerem modelos auxiliares, como:

- Modelos de Drude, Lorentz e Debye para dielétricos dispersivos;
- Equações diferenciais auxiliares (ADE) ou convolução para discretizar a resposta constitutiva. PSTD é outra discretização espacial, não um modelo de dispersão material.

### Tempo de simulação

Simulações no domínio do tempo exigem muitas iterações para:

- Alcançar o regime permanente (para análise de frequência via transformada de Fourier);
- Capturar transientes de longa duração ou baixas frequências.

A transformada de Fourier de tempo finito (FTFT) ou a transformada discreta de Fourier (DFT) são aplicadas aos campos registrados para obter a resposta em frequência.

### Recursos computacionais

FDTD e TLM são métodos *memory-intensive* e *compute-intensive*:

- O armazenamento dos campos $\mathbf{E}$ e $\mathbf{H}$ em 3D requer $O(N_x N_y N_z)$ palavras de memória;
- O passo de tempo $\Delta t$ é limitado pela menor célula da grade, o que pode exigir milhões de iterações para domínios grandes ou baixas frequências.

Paralelização por MPI ou GPU pode reduzir o tempo de execução. Refinamento local exige tratar interfaces e estabilidade; malhas não estruturadas e multigrid não são recursos automáticos do esquema de Yee apresentado aqui.

## Exemplo resolvido — dimensionamento e convergência

**Problema:** modelar um domínio cúbico de 0,30 m de lado até 1 GHz, contendo ar e um dielétrico ideal com $\varepsilon_r=4$, $\mu_r=1$. Adote 20 células por menor comprimento de onda e fator de segurança temporal de 0,9. Use $c_0\approx3\times10^8\,\text{m/s}$.

No dielétrico, $v=c_0/2$ e $\lambda_{\min}=v/f_{\max}=0{,}15\,\text{m}$. Logo,

$$\Delta=\frac{\lambda_{\min}}{20}=7{,}5\,\text{mm}.$$

A maior velocidade está no ar, portanto o passo de tempo é limitado por

$$\Delta t=0{,}9\frac{\Delta}{c_0\sqrt3}\approx13{,}0\,\text{ps}.$$

O domínio tem $40^3=64\,000$ células. Estimar seis componentes em dupla precisão dá $6\times8\times40^3=3\,072\,000$ bytes, cerca de 3,07 MB. Essa é apenas uma estimativa dos campos: não inclui PML, fontes, monitores, materiais, campos auxiliares nem diferenças nas dimensões dos arranjos escalonados.

Para observar 100 ns, são necessários aproximadamente 7700 passos. O espaçamento entre frequências da DFT é $1/T_{\rm obs}=10$ MHz; a capacidade de separar ressonâncias também depende da janela e do decaimento dos campos. Acrescentar zeros à FFT não aumenta o tempo físico observado.

```python
import math

c0 = 3e8
fmax = 1e9
comprimento = 0.30
observacao = 100e-9
vmin = c0 / math.sqrt(4.0)
lambda_min = vmin / fmax

for celulas_por_onda in (20, 40):
    limite_dx = lambda_min / celulas_por_onda
    n = math.ceil(comprimento / limite_dx)
    dx = comprimento / n
    dt = 0.9 * dx / (c0 * math.sqrt(3))
    passos = math.ceil(observacao / dt)
    memoria_mb = 6 * 8 * n**3 / 1e6
    print(f"N={n}³, dx={dx*1e3:.3f} mm, dt={dt*1e12:.2f} ps, "
          f"passos={passos}, campos≈{memoria_mb:.2f} MB")

print(f"Espaçamento da DFT: {1/observacao/1e6:.1f} MHz")
```

**Como validar:** compare uma grandeza física, como frequência de ressonância ou campo em uma sonda, nas duas malhas. Reduzir $\Delta$ pela metade multiplica aproximadamente a memória por 8 e o trabalho total por 16 para a mesma duração física. Teste separadamente a espessura da PML e a duração da simulação. Satisfazer CFL evita uma instabilidade do esquema básico, mas não demonstra precisão nem convergência.

## Lista de Exercícios Propostos

**E1.** Para uma grade cúbica de 5 mm em ar, calcule o limite CFL tridimensional e um passo com fator de segurança 0,9. Qual velocidade deve ser usada se parte do domínio contiver um dielétrico com $\varepsilon_r=9$?

**E2.** No exemplo resolvido, dobre a frequência máxima mantendo 20 células por comprimento de onda. Determine o novo passo espacial, a razão de memória e a razão de trabalho para os mesmos 100 ns.

**E3.** Uma FFT com observação de 100 ns tem espaçamento de 10 MHz. Aumentar o número de pontos por preenchimento com zeros permite resolver dois modos separados por 1 MHz? Justifique e indique uma alteração no experimento.

**E4.** A amplitude de um campo muda 12% ao refinar a malha e 8% ao dobrar a espessura da PML. É possível declarar convergência? Proponha dois testes que separem as fontes de erro.

## Gabarito

**E1.** $\Delta t_{\max}=5\times10^{-3}/(3\times10^8\sqrt3)\approx9{,}62$ ps; com fator 0,9, $\Delta t\approx8{,}66$ ps. O ar continua impondo a maior velocidade, $c_0$, mesmo com o dielétrico presente.

**E2.** $\Delta=3{,}75$ mm, aproximadamente oito vezes mais memória e dezesseis vezes mais trabalho. O passo de tempo cai pela metade, e o número de passos dobra.

**E3.** Não. O preenchimento interpola a representação espectral, mas não acrescenta dados físicos. A escala $1/\Delta f=1\,\mu$s indica um tempo de observação maior a investigar; a separação efetiva também depende da janela, do amortecimento e da relação sinal-ruído.

**E4.** Não há evidência de convergência dentro de uma tolerância menor que essas variações. Faça uma sequência de refinamentos com fronteiras absorvedoras já verificadas e, separadamente, aumente espessura/distância da PML com malha física fixa. Declare a tolerância da grandeza observada e teste também o tempo de decaimento.

## Referências e ferramentas

- **FDTD original:** K. S. Yee, "Numerical solution of initial boundary value problems involving maxwell's equations in isotropic media," *IEEE Transactions on Antennas and Propagation*, vol. 14, no. 3, pp. 302-307, May 1966.
- **TLM original:** P. B. Johns e R. L. Beurle, "Numerical solution of 2-dimensional scattering problems using a transmission-line matrix," *Proceedings of the IEE*, vol. 118, no. 9, pp. 1203–1208, 1971. [Contexto e referência no tutorial do Clemson CVEL](https://cecas.clemson.edu/cvel/modeling/tutorials/techniques/tlm/transmission_line_matrix.html).
- **Implementação e validação:** [Meep — introdução ao FDTD](https://meep.readthedocs.io/en/latest/Introduction/) e [PML e suas limitações](https://meep.readthedocs.io/en/latest/Perfectly_Matched_Layer/).
