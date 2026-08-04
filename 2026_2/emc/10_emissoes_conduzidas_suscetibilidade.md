# Emissões conduzidas e suscetibilidade

Emissões conduzidas são correntes ou tensões de RF que saem do equipamento por cabos de alimentação ou sinal. Suscetibilidade conduzida é a resposta indesejada quando perturbações entram por essas interfaces. O diagnóstico começa separando dois mecanismos: **modo diferencial**, entre os condutores do circuito, e **modo comum**, dos condutores em conjunto para o chassi ou ambiente.

## Sumário

1. [Medição com LISN](#medição-com-lisn)
2. [Correntes de modo diferencial e comum](#correntes-de-modo-diferencial-e-comum)
3. [Filtros de alimentação](#filtros-de-alimentação)
4. [Topologia e estabilidade](#topologia-e-estabilidade)
5. [Fontes de alimentação](#fontes-de-alimentação)
6. [Suscetibilidade conduzida](#suscetibilidade-conduzida)
7. [Roteiro de diagnóstico](#roteiro-de-diagnóstico)
8. [Exemplo resolvido — Separação modal](#exemplo-resolvido--separação-modal)
9. [Exemplo resolvido — Limite imposto pela ESL](#exemplo-resolvido--limite-imposto-pela-esl)
10. [Exemplo de diagnóstico](#exemplo-de-diagnóstico)
11. [Limites e segurança](#limites-e-segurança)
12. [Exercícios](#exercícios)
13. [Respostas selecionadas](#respostas-selecionadas)
14. [Exemplo numérico adicional — Cálculo de correntes modais](#exemplo-numérico-adicional--cálculo-de-correntes-modais)
15. [Código Python — Decomposição modal](#código-python--decomposição-modal)
16. [Código Python — Perda de inserção de filtro](#código-python--perda-de-inserção-de-filtro)
17. [Exemplo numérico adicional — Impedância de LISN](#exemplo-numérico-adicional--impedância-de-lisn)
18. [Rede ABCD da LISN](#rede-abcd-da-lisn)
19. [Simulação — filtro sob impedâncias variáveis](#simulação--filtro-sob-impedâncias-variáveis)
20. [Detectores e tempo de observação](#detectores-e-tempo-de-observação)
21. [Laboratório SPICE — filtro diferencial com LISN simplificada](#laboratório-spice--filtro-diferencial-com-lisn-simplificada)
22. [Referência principal](#referência-principal)

## Medição com LISN

A *Line Impedance Stabilization Network* (LISN) apresenta ao equipamento uma impedância de RF definida, desacopla ruído vindo da rede e entrega a tensão perturbadora ao receptor. Isso melhora a repetibilidade entre laboratórios. A montagem deve respeitar plano de referência, comprimentos de cabo, aterramento e posição prescritos pelo método de ensaio.

O receptor mede em bandas definidas e pode usar detectores de pico, quase-pico ou média. A comparação com limites exige registrar largura de banda, detector, perdas de cabo, fatores de transdutor e incerteza. Uma sonda de corrente fornece diagnóstico complementar, mas não substitui a configuração normativa.

> Limites, bandas e detalhes da LISN dependem da norma e de sua edição vigente.

## Correntes de modo diferencial e comum

### Conceito fundamental: por que separar modos?

Para correntes $I_1$ e $I_2$ medidas no mesmo sentido nos dois condutores, uma convenção útil é

$$I_{CM}=\frac{I_1+I_2}{2},\qquad I_{DM}=\frac{I_1-I_2}{2}.$$

No modo diferencial, a corrente sai por um condutor e retorna pelo outro. No modo comum, ela flui no mesmo sentido nos dois e fecha o circuito por capacitâncias parasitas, terra, chassi ou cabos externos. Pequena corrente de modo comum frequentemente domina a emissão radiada por usar um cabo grande como antena.

> **Insight para Estudantes**: Imagine dois condutores paralelos. Se as correntes são iguais e opostas, os campos magnéticos se cancelam fora do par — é o modo diferencial. Se as correntes são iguais e no mesmo sentido, os campos se somam — é o modo comum, que irradia eficientemente como uma antena monopolo.

### Prova da decomposição modal

**Teorema**: As correntes de dois condutores podem ser decompostas unicamente em componentes comum e diferencial pela definição

$$I_{CM}=\frac{I_1+I_2}{2},\qquad I_{DM}=\frac{I_1-I_2}{2}.$$

**Prova**: Somando e subtraindo as definições,

$$I_1=I_{CM}+I_{DM},\qquad I_2=I_{CM}-I_{DM}.$$

A transformação é linear e sua matriz possui determinante não nulo:

$$\det\begin{pmatrix}1 & 1 \\ 1 & -1\end{pmatrix}=-2\neq0.$$

Portanto a decomposição é única. $\square$

### Capacitor entre linhas e modo comum

**Proposição**: Um capacitor $C_X$ ideal ligado entre as linhas não conduz corrente de modo comum ideal.

**Prova**: Em modo comum, os dois terminais do capacitor têm a mesma tensão instantânea. Logo, $v_C=0$ e $i_C=C_Xdv_C/dt=0$. Assimetrias e parasitas quebram essa idealização. $\square$

## Filtros de alimentação

Um filtro funciona por divisor de impedância. O desempenho real depende das impedâncias da fonte e da carga, não só da resposta em 50 Ω. Elementos básicos:

- capacitor entre linhas ($C_X$): desvia principalmente modo diferencial;
- capacitores linha–chassi ($C_Y$): desviam modo comum, limitados por corrente de fuga e segurança;
- indutor série: opõe-se à corrente diferencial, mas pode saturar;
- choque de modo comum: alta impedância para modo comum e baixa para corrente útil diferencial;
- resistor ou elemento dissipativo: reduz o fator de qualidade e antirressonâncias.

A perda de inserção é

$$IL=20\log_{10}\left|\frac{V_{sem\ filtro}}{V_{com\ filtro}}\right|,$$

mas só é transferível ao produto quando as impedâncias e a montagem são equivalentes. Parasitismos fazem a atenuação cair acima da autorressonância.

## Topologia e estabilidade

Em geral, um elemento série é mais eficaz diante de baixa impedância e um elemento shunt diante de alta impedância. Filtros $L$, $\pi$ e $T$ devem ser escolhidos considerando fonte, carga e estabilidade do conversor. Um filtro de entrada pode interagir com a impedância negativa incremental de uma fonte chaveada e produzir oscilação.

A entrada e a saída do filtro precisam ser fisicamente separadas. Acoplamento capacitivo, indutivo ou por impedância comum contornando o filtro reduz drasticamente seu desempenho. O filtro de rede deve ficar junto ao ponto de entrada e ter conexão curta e larga ao chassi.

## Fontes de alimentação

### Fontes lineares

Para muitos anos o fornecedor linear foi o método predominante. Um transformador reduz a tensão da rede, seguida por um retificador de onda completa e um capacitor de armazenamento ($C_B$). Um regulador transistorizado mantém a tensão de saída constante sob variação de carga, dissipando potência em sua região linear.

### Fontes chaveadas (SMPS)

Uma fonte chaveada (SMPS) usa um elemento de comutação (MOSFET) excitado por uma onda quadrada de frequência $f_s$ e ciclo de trabalho $D=t/T$. A tensão média na saída é

$$V_{av}=D\cdot V_{dc}.$$

O indutor e o capacitor formam um filtro passa-baixas que mantém a tensão de saída com ripple controlado. A regulação é feita ajustando $D$ por um modulador de largura de pulso (PWM).

**Proposição**: Aumentar a resistência no gate do MOSFET aumenta os tempos de subida/descida da onda de comutação, reduzindo o conteúdo espectral do ruído, mas aumenta a dissipação no transistor.

**Prova**: O tempo de transição $t_r$ é proporcional à constante de tempo $R_G C_{gs}$. A energia dissipada na comutação é proporcional a $t_r$. Reduzir $df/df$ reduz as componentes de alta frequência, mas aumenta as perdas na região ativa. $\square$

### Capacitância primário–secundário e blindagem Faraday

Transformadores têm capacitância parasita entre primário e secundário. Uma blindagem Faraday inserida entre os enrolamentos reduz esse acoplamento. A conexão correta da blindagem é ao lado primário (terra da rede) para evitar que correntes de ruído fluam pela LISN.

## Suscetibilidade conduzida

Perturbações contínuas de RF podem ser demoduladas por junções não lineares. EFT, surge e interrupções têm grande energia ou grande $dv/dt$ e $di/dt$. O caminho de imunidade deve ser analisado como fonte–acoplamento–vítima:

1. limitar a tensão ou corrente na interface;
2. desviar a perturbação por um caminho curto para chassi/retorno apropriado;
3. filtrar o resíduo antes do circuito sensível;
4. garantir distância, isolamento e capacidade energética;
5. preservar o funcionamento ou recuperar-se de forma controlada.

TVS, MOV, centelhadores, filtros feedthrough e choques têm funções diferentes. A coordenação energética e a indutância da conexão determinam a tensão realmente aplicada à vítima.

## Roteiro de diagnóstico

1. Reproduzir a falha ou pico em montagem controlada.
2. Correlacionar frequências com clocks, conversores e eventos de comutação.
3. Medir correntes de modo comum e diferencial separadamente.
4. Localizar o laço fonte e o caminho de retorno.
5. Aplicar uma alteração por vez no mecanismo dominante.
6. Repetir a medição completa e registrar margem e incerteza.

## Exemplo resolvido — Separação modal

Uma sonda mede $I_1=8$ mA e $I_2=-6$ mA, com sentidos de referência iguais:

$$I_{CM}=\frac{8-6}{2}=1\ \text{mA},$$

$$I_{DM}=\frac{8-(-6)}{2}=7\ \text{mA}.$$

Embora o modo comum seja menor, ele pode dominar a radiação se os dois condutores e o ambiente formarem uma antena eficiente.

## Exemplo resolvido — Limite imposto pela ESL

Um capacitor $C_Y=2{,}2$ nF possui ESL total de 8 nH. Sua autorressonância é

$$f_{SR}=\frac{1}{2\pi\sqrt{8\times10^{-9}\cdot2{,}2\times10^{-9}}}=37{,}9\ \text{MHz}.$$

Acima dessa região, aumentar o valor nominal não garante melhor desvio de RF; conexão mais curta ou capacitor feedthrough pode ser necessário.

## Exemplo de diagnóstico

Há pico em 12 MHz e harmônicos. A corrente medida abraçando os dois condutores cai 15 dB ao instalar temporariamente um choque de modo comum, enquanto um $C_X$ quase não altera o pico. A evidência favorece modo comum. O próximo passo não é simplesmente manter a ferrite: deve-se localizar a capacitância ou assimetria que converte a comutação interna em corrente para o ambiente.

## Limites e segurança

Capacitores entre rede e chassi devem possuir classe de segurança apropriada. MOVs, centelhadores e TVS têm modos de falha, energia e coordenação próprios. Cálculos educacionais não substituem distâncias de escoamento, isolamento, corrente de fuga ou ensaios da norma aplicável.

## Lista de Exercícios Propostos

**E.1** Dados $I_1=8$ mA e $I_2=-6$ mA, calcule $I_{CM}$ e $I_{DM}$ pela convenção acima.

**E.2** Explique por que o desempenho de catálogo de um filtro medido em 50 Ω pode não ocorrer no produto.

**E.3** Desenhe caminhos de modo comum e diferencial em uma fonte chaveada isolada.

**E.4** Proponha uma sequência para diagnosticar um pico conduzido na frequência de chaveamento e seus harmônicos.

**E.5** Explique por que colocar o filtro longe do conector pode permitir que o ruído o contorne.

**E.6** Demonstre que $I_1+I_2=2I_{CM}$.

**E.7** Um filtro reduz a leitura de 86 para 58 dBµV. Qual é a melhoria em dB e a razão de tensões?

**E.8** Um indutor de 100 µH conduz 1 A DC e satura em 0,7 A. Explique por que o cálculo de atenuação com $L=100$ µH é inválido.

## Gabarito

**E.1** Cálculo de $I_{CM}$ e $I_{DM}$ para $I_1=8$ mA e $I_2=-6$ mA.

Equações: $I_{CM}=(I_1+I_2)/2$ e $I_{DM}=(I_1-I_2)/2$.

$I_{CM}=(8+(-6))/2=2/2=1$ mA.

$I_{DM}=(8-(-6))/2=(8+6)/2=14/2=7$ mA.

Resposta: $I_{CM}=1$ mA e $I_{DM}=7$ mA.

**E.6** Demonstração de $I_1+I_2=2I_{CM}$.

Dadas as definições: $I_1=I_{CM}+I_{DM}$ e $I_2=I_{CM}-I_{DM}$.

Somando: $I_1+I_2=(I_{CM}+I_{DM})+(I_{CM}-I_{DM})=I_{CM}+I_{CM}+I_{DM}-I_{DM}=2I_{CM}$.

Portanto, $I_1+I_2=2I_{CM}$. $\square$

**E.7** Melhoria de filtro de 86 para 58 dBµV. Cálculo da melhoria em dB e razão de tensões.

Melhoria em dB: $86-58=28$ dB.

Razão de tensões: $V_{ratio}=10^{28/20}=10^{1.4}=25{,}1$.

Resposta: Melhoria de 28 dB; razão de tensões $25{,}1$.

**E.8** Indutor de 100 µH conduz 1 A DC e satura em 0,7 A. Por que o cálculo de atenuação com $L=100$ µH é inválido.

Quando um indutor satura, a permeabilidade incremental e a indutância caem drasticamente sob polarização DC. O valor de 100 µH é válido apenas para corrente pequena (região linear). Acima de 0,7 A (ponto de saturação), a indutância efetiva cai, e o cálculo de atenuação usando $L=100$ µH superestima a reatância $X_L=2\pi f L$. Deve-se usar a curva $L(I,f,T)$ para a indutância incremental na corrente de operação.

## Exemplo numérico adicional — Cálculo de correntes modais

Medição: $I_1=12$ mA, $I_2=-8$ mA (sentidos de referência iguais).

$$I_{CM}=\frac{12+(-8)}{2}=2\ \text{mA},$$
$$I_{DM}=\frac{12-(-8)}{2}=10\ \text{mA}.$$

Verificação: $I_1=I_{CM}+I_{DM}=2+10=12$ mA, $I_2=I_{CM}-I_{DM}=2-10=-8$ mA.

## Código Python — Decomposição modal

```python
import numpy as np
import matplotlib.pyplot as plt

# Simulação de correntes medida nos dois condutores
f = np.logspace(4, 7, 100)  # 10 kHz a 10 MHz

# Correntes simuladas (modo comum + diferencial)
I_CM_sim = 2e-3 * np.exp(-f/1e6)  # Decai com frequência
I_DM_sim = 10e-3 * np.ones_like(f)  # Constante

I1 = I_CM_sim + I_DM_sim
I2 = I_CM_sim - I_DM_sim

# Recuperação modal
I_CM_rec = (I1 + I2) / 2
I_DM_rec = (I1 - I2) / 2

plt.figure(figsize=(10, 6))
plt.subplot(2, 1, 1)
plt.semilogx(f, np.abs(I1)*1e3, 'b-', label='I1 (mA)')
plt.semilogx(f, np.abs(I2)*1e3, 'r-', label='I2 (mA)')
plt.xlabel('Frequência (Hz)')
plt.ylabel('Corrente (mA)')
plt.title('Correntes Medidas nos Condutores')
plt.legend()
plt.grid(True, which='both', linestyle='--')

plt.subplot(2, 1, 2)
plt.semilogx(f, np.abs(I_CM_rec)*1e3, 'g-', label='I_CM recuperada (mA)')
plt.semilogx(f, np.abs(I_CM_sim)*1e3, 'g--', label='I_CM simulada (mA)')
plt.semilogx(f, np.abs(I_DM_rec)*1e3, 'm-', label='I_DM recuperada (mA)')
plt.xlabel('Frequência (Hz)')
plt.ylabel('Corrente Modal (mA)')
plt.title('Decomposição Modal: Comum e Diferencial')
plt.legend()
plt.grid(True, which='both', linestyle='--')

plt.tight_layout()
plt.show()
```

## Código Python — Perda de inserção de filtro

```python
import numpy as np
import matplotlib.pyplot as plt

# Parâmetros do filtro LC
L = 100e-6      # 100 µH
C = 10e-6       # 10 µF
f = np.logspace(3, 6, 500)  # 1 kHz a 1 MHz
w = 2 * np.pi * f

# Insertion loss para filtro passa-baixas LC
# IL = 20*log10|1 - (f/f0)^2| para f < f0, onde f0 = 1/(2*pi*sqrt(LC))
f0 = 1 / (2 * np.pi * np.sqrt(L * C))

# Insertion loss teórica (dB)
IL_dB = 20 * np.log10(np.abs(1 - (f/f0)**2 + 1j*0.1*(f/f0)))

plt.figure(figsize=(8, 5))
plt.semilogx(f, IL_dB, 'b-', linewidth=2)
plt.axvline(f0, color='r', linestyle='--', label=f'f0 = {f0/1e3:.1f} kHz')
plt.xlabel('Frequência (Hz)')
plt.ylabel('Insertion Loss (dB)')
plt.title('Insertion Loss de Filtro LC Passa-Baixas')
plt.legend()
plt.grid(True, which='both', linestyle='--')
plt.ylim(-5, 60)
plt.show()
```

## Exemplo numérico adicional — Impedância de LISN

**Problema**: Uma LISN apresenta 50 Ω em 150 kHz. Qual é a corrente correspondente a 66 dBµV?

**Solução**:

66 dBµV = $10^{66/20}$ µV = $2000$ µV = $2$ mV.

Corrente: $I=V/Z=2\times10^{-3}/50=40\ \mu$A.

Em dBmA: $20\log_{10}(40\times10^{-3})=20\log_{10}(0.04)=-27.96$ dBmA.

> **Insight para Estudantes**: A LISN padroniza a impedância para 50 Ω para que medições feitas em laboratórios diferentes sejam comparáveis. Sem essa padronização, a impedância da rede elétrica variaria, tornando as medições de emissões conduzidas irreprodutíveis.

## Rede ABCD da LISN

Uma LISN estabiliza a impedância vista pelo equipamento e encaminha RF ao receptor sem expô-lo diretamente à rede. Seu circuito exato depende da norma e da porta; um modelo educacional deve incluir indutor de isolamento, capacitor de acoplamento, resistência de medição e parasitas.

### Conversões de leitura

Para entrada de 50 Ω,

$$
V[\text{dBµV}]=20\log_{10}\frac{V_{rms}}{1\,\mu V},
$$

$$
P[\text{dBm}]=V[\text{dBµV}]-107.
$$

Assim, 66 dBµV correspondem a aproximadamente 2 mV RMS e $-41$ dBm em 50 Ω. A segunda relação não vale se a impedância ou a definição de tensão forem diferentes.

## Simulação — filtro sob impedâncias variáveis

```python
import numpy as np
import matplotlib.pyplot as plt
f = np.logspace(3, 8, 1000); w = 2*np.pi*f
L, C = 10e-6, 100e-9
ZL = 1j*w*L + 0.1
ZC = 1/(1j*w*C) + 0.03 + 1j*w*1e-9

for Zs, load in [(50,50), (1,50), (50,1), (1,1)]:
    # L série e C em paralelo com a carga
    Zp = 1/(1/ZC + 1/load)
    H = Zp/(Zs + ZL + Zp)
    H0 = load/(Zs + load)
    IL = 20*np.log10(abs(H0/H))
    plt.semilogx(f, IL, label=f'{Zs} Ω / {load} Ω')
plt.axhline(0, color='k', lw=.8)
plt.xlabel('Frequência (Hz)'); plt.ylabel('Perda de inserção (dB)')
plt.grid(True, which='both', alpha=.3); plt.legend(title='fonte/carga'); plt.tight_layout()
```

## Detectores e tempo de observação

Detector de pico responde ao maior valor dentro da banda de resolução; média pondera ocupação temporal; quase-pico aplica constantes de carga e descarga definidas pelo instrumento normativo. Um algoritmo genérico de “máximo da FFT” não reproduz quase-pico. Para comparação válida, registre RBW, detector, tempo de permanência e correções do arranjo.

## Laboratório SPICE — filtro diferencial com LISN simplificada

```spice
* Fonte de ruido, impedancia LISN didatica e filtro DM
Vnoise sw 0 AC 1
Rsource sw in 2
Lfilter in nL 10u
R_L nL out 100m
L_ESL out c1 1n
R_ESR c1 c2 30m
Cfilter c2 0 100n
Rmeas out 0 50
.ac dec 200 1k 100Meg
.print ac db(v(out))
.end
```

O circuito é educacional, não uma LISN normativa. Compare com/sem filtro usando a mesma porta de medição e varie as impedâncias de fonte/carga.

## Referência principal

Síntese do Capítulo 6, "Conducted Emissions and Susceptibility", de C. R. Paul, *Introduction to Electromagnetic Compatibility*, 2ª ed., Wiley, 2006, pp. 377–419.
