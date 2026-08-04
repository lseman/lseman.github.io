# Simulação numérica de EMC: FDTD e TLM

> Enquanto modelos de circuito e SPICE são poderosos para frequências baixas e parâmetros distribuídos, muitos problemas de EMC envolvem comprimentos de onda comparáveis às dimensões físicas do sistema. Nestes casos, métodos numéricos de onda completa como FDTD (Finite-Difference Time-Domain) e TLM (Transmission Line Matrix) são necessários para resolver as equações de Maxwell diretamente nos domínios do tempo ou da frequência.

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
2. [FDTD e a grade de Yee](#fdt-e-a-grade-de-yee)
3. [Condições de contorno e absorção](#condições-de-contorno-e-absorção)
4. [TLM — Transmission Line Matrix](#tlm--transmission-line-matrix)
5. [Comparação FDTD vs TLM](#comparação-fdt-vs-tlm)
6. [Limitações e considerações práticas](#limitações-e-considerações-práticas)

## O problema eletromagnético completo

As equações de Maxwell na forma diferencial, em um meio linear, isotrópico e sem fontes livres, são:

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

Com $\mathbf{D} = \varepsilon \mathbf{E}$ e $\mathbf{B} = \mu \mathbf{H}$. Para simulação no domínio do tempo, discretizamos o espaço e o tempo, transformando as derivadas parciais em diferenças finitas.

## FDTD e a grade de Yee

O método FDTD, introduzido por Kane Yee em 1966, discretiza o espaço usando uma grade escalonada conhecida como **célula de Yee**. Nesta célula, as componentes do campo elétrico ($E_x, E_y, E_z$) e as componentes do campo magnético ($H_x, H_y, H_z$) estão deslocadas por meio passo de grade no espaço.

### Esquema de discretização

Em uma célula de Yee cúbica com passo $\Delta x = \Delta y = \Delta z = \Delta$, os campos são atualizados iterativamente no tempo usando diferenças finitas centrais. Para a componente $H_x$:

$$
H_x^{n+1/2}\left(i,j+\tfrac{1}{2},k+\tfrac{1}{2}\right) = H_x^{n-1/2}\left(i,j+\tfrac{1}{2},k+\tfrac{1}{2}\right) - \frac{\Delta t}{\mu \Delta} \left[ E_y^n\left(i,j+\tfrac{1}{2},k+1\right) - E_y^n\left(i,j+\tfrac{1}{2},k\right) - E_z^n\left(i,j+1,k+\tfrac{1}{2}\right) + E_z^n\left(i,j,k+\tfrac{1}{2}\right) \right]
$$

Equações análogas valem para $H_y, H_z$ e para as componentes de $\mathbf{E}$, que são atualizadas a partir de $\mathbf{H}$ usando a lei de Ampère.

### Condição de estabilidade CFL

O esquema explícito FDTD requer uma condição de estabilidade para evitar divergência numérica. A condição de Courant-Friedrichs-Lewy (CFL) para uma grade cúbica é:

$$
\Delta t \leq \frac{\Delta}{c \sqrt{3}}
$$

onde $c$ é a velocidade da luz no meio. Para grades não cúbicas, a condição geral é:

$$
\frac{1}{\Delta t^2} \geq c^2 \left( \frac{1}{\Delta x^2} + \frac{1}{\Delta y^2} + \frac{1}{\Delta z^2} \right)
$$

## Condições de contorno e absorção

Para um domínio não limitado, o FDTD requer o truncamento do domínio computacional. Condições de contorno simples incluem:

- **PEC (Perfect Electric Conductor):** $\mathbf{E}_t = 0$ na superfície.
- **PMC (Perfect Magnetic Conductor):** $\mathbf{H}_t = 0$ na superfície.

Para fronteiras abertas (radiação para o espaço livre), usam-se **Condições de Contorno Absorvedoras (ABC)** ou **Camadas Perfeitamente Casadas (PML - Perfectly Matched Layer)**. A PML introduz um meio artificial com perdas concordantes que absorve as ondas incidentes sem reflexão, independentemente do ângulo ou frequência.

## TLM — Transmission Line Matrix

O método TLM, desenvolvido por John Shepherd, é outra técnica de domínio do tempo que modela o campo eletromagnético como uma rede de linhas de transmissão. Cada nó na malha TLM representa um ponto no espaço, e as linhas representam a propagação de ondas de tensão e corrente (análogas aos campos $\mathbf{E}$ e $\mathbf{H}$).

### Esquema de espalhamento e conexão

No TLM, a matriz de espalhamento em cada nó descreve como as ondas incidentes são refletidas e transmitidas. A evolução temporal é obtida resolvendo iterativamente os passos de **espalhamento** (scattering) e **conexão** (connection):

1. **Espalhamento:** Ondas incidentes chegam ao nó e são espalhadas de acordo com a matriz de espalhamento do nó (que depende das impedâncias características das linhas conectadas).
2. **Conexão:** Ondas espalhadas de um nó tornam-se ondas incidentes para os nós vizinhos, propagando-se ao longo das linhas de transmissão.

### Vantagens do TLM

O TLM é particularmente útil para modelar:

- Geometrias complexas e irregulares;
- Materiais anisotrópicos e não lineares;
- Problemas de acoplamento em eletrônica de potência.

A rede de linhas de transmissão pode ser adaptada facilmente para diferentes propriedades de material, modificando as impedâncias características e tempos de viagem das linhas.

## Comparação FDTD vs TLM

| Característica | FDTD | TLM |
|---|---|---|
| **Formulação base** | Discretização direta das equações de Maxwell (leis de Faraday e Ampère) | Rede equivalente de linhas de transmissão |
| **Grade espacial** | Grade de Yee (campos E e H escalonados) | Malha de nós com linhas de transmissão conectadas |
| **Variáveis de campo** | $\mathbf{E}$ e $\mathbf{H}$ diretamente | Tensões e correntes nas linhas (análogas a $\mathbf{E}$ e $\mathbf{H}$) |
| **Implementação** | Amplamente implementada em softwares de EMC e antenas (CST, Meep, L-CAD) | Uso histórico em engenharia de micro-ondas; aplicações específicas em EMI de potência |
| **Materiais complexos** | Requer modelos auxiliares (ADE, PSTD, Drude-Lorentz) | Adaptação natural via impedâncias e constantes de tempo das linhas |

Ambos os métodos são técnicas explícitas de domínio do tempo e exigem condições de estabilidade similares.

## Limitações e considerações práticas

### Dispersão numérica

A velocidade de fase numérica depende da frequência e da direção de propagação na grade. Para minimizar a dispersão numérica, o tamanho da célula deve ser pequeno o suficiente:

$$
\Delta \leq \frac{\lambda_{\min}}{10} \quad \text{ou} \quad \Delta \leq \frac{\lambda_{\min}}{20}
$$

onde $\lambda_{\min}$ é o menor comprimento de onda de interesse no meio.

### Dispersão material

Materiais com perdas ou dispersão (frequência-dependentes) requerem modelos auxiliares, como:

- Modelos de Drude, Lorentz e Debye para dielétricos dispersivos;
- Método ADE (Auxiliary Differential Equation) ou PSTD (Pseudospectral Time-Domain) para acoplar dispersão material com FDTD.

### Tempo de simulação

Simulações no domínio do tempo exigem muitas iterações para:

- Alcançar o regime permanente (para análise de frequência via transformada de Fourier);
- Capturar transientes de longa duração ou baixas frequências.

A transformada de Fourier de tempo finito (FTFT) ou a transformada discreta de Fourier (DFT) são aplicadas às campos registrados para obter a resposta em frequência.

### Recursos computacionais

FDTD e TLM são métodos *memory-intensive* e *compute-intensive*:

- O armazenamento dos campos $\mathbf{E}$ e $\mathbf{H}$ em 3D requer $O(N_x N_y N_z)$ palavras de memória;
- O passo de tempo $\Delta t$ é limitado pela menor célula da grade, o que pode exigir milhões de iterações para domínios grandes ou baixas frequências.

Técnicas de paralelização (MPI, GPU) e adaptabilidade de grade (unstructured grids, multigrid) são essenciais para simulações EMC de larga escala.

## Referências e ferramentas

- **FDTD original:** K. S. Yee, "Numerical solution of initial boundary value problems involving maxwell's equations in isotropic media," *IEEE Transactions on Antennas and Propagation*, vol. 14, no. 3, pp. 302-307, May 1966.
- **TLM original:** J. B. Shepherd, "The transmission-line matrix method for the solution of electromagnetic problems," *Proceedings of the IEE*, vol. 127, Part C, no. 3, pp. 139-144, 1980.
- **Softwares FDTD abertos:** [Meep](https://meep.readthedocs.io), [L-CAD](https://github.com/l-cad), [XFDTD](https://rfsoftware.com).
- **Softwares comerciais:** CST Studio Suite (solver Time Domain), ANSYS HFSS (solver transient), FEKO.
