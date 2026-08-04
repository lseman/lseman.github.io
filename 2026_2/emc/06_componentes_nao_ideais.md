# Comportamento não ideal de componentes

Em EMC, o símbolo no esquema é apenas uma aproximação. Fios, trilhas, terminais e encapsulamentos acrescentam resistência, indutância e capacitância parasitas; esses elementos podem dominar o circuito quando a frequência aumenta ou quando a corrente varia rapidamente. O circuito que realmente determina emissões e imunidade é, portanto, o **esquema oculto** formado pelos componentes intencionais e seus parasitas.

## Sumário

1. [Condutores: fios e trilhas de PCB](#condutores-fios-e-trilhas-de-pcb)
2. [Efeito dos terminais](#efeito-dos-terminais)
3. [Resistores reais](#resistores-reais)
4. [Capacitores reais](#capacitores-reais)
5. [Indutores reais](#indutores-reais)
6. [Materiais ferromagnéticos e ferrites](#materiais-ferromagnéticos-e-ferrites)
7. [Choques de modo comum](#choques-de-modo-comum)
8. [Dispositivos eletromecânicos e contatos](#dispositivos-eletromecânicos-e-contatos)
9. [Arco em contatos mecânicos](#arco-em-contatos-mecânicos)
10. [Dispositivos digitais](#dispositivos-digitais)
11. [Variabilidade e modelagem](#variabilidade-e-modelagem)
12. [Checklist de projeto](#checklist-de-projeto)
13. [Teoremas e derivações fundamentais](#teoremas-e-derivações-fundamentais)
14. [Exemplos resolvidos](#exemplos-resolvidos)
15. [Insight: o componente e sua montagem formam um único dispositivo](#insight-o-componente-e-sua-montagem-formam-um-único-dispositivo)
16. [Exercícios](#exercícios)
17. [Respostas selecionadas](#respostas-selecionadas)
18. [Exemplo numérico adicional — Impedância de capacitor real vs. frequência](#exemplo-numérico-adicional--impedância-de-capacitor-real-vs-frequência)
19. [Código Python — Impedância de capacitor real vs. frequência](#código-python--impedância-de-capacitor-real-vs-frequência)
20. [Código Python — Impedância de indutor real vs. frequência](#código-python--impedância-de-indutor-real-vs-frequência)
21. [Exemplo numérico adicional — Efeito pelicular em fio de cobre](#exemplo-numérico-adicional--efeito-pelicular-em-fio-de-cobre)
22. [Código Python — Resistência DC e AC vs. frequência](#código-python--resistência-dc-e-ac-vs-frequência)
23. [Antirressonância de bancos de capacitores](#antirressonância-de-bancos-de-capacitores)
24. [Monte Carlo de autorressonância](#monte-carlo-de-autorressonância)
25. [Laboratório SPICE — antirressonância de desacoplamento](#laboratório-spice--antirressonância-de-desacoplamento)
26. [Referência principal](#referência-principal)

## Condutores: fios e trilhas de PCB

### Resistência DC vs. AC

Para um fio de comprimento $l$, raio $r$, condutividade $\sigma$ e área $A$, a resistência em corrente contínua é

$$R_{dc}=\frac{l}{\sigma A}.$$

Em alta frequência, o efeito pelicular concentra a corrente em uma camada de profundidade

$$\delta=\sqrt{\frac{2}{\omega\mu\sigma}},$$

e a resistência cresce aproximadamente com $\sqrt f$. 

> **Insight para Estudantes**: O efeito pelicular não é um 

## Efeito dos terminais

O terminal de um componente adiciona indutância série e capacitância para condutores próximos. Como regra de ordem de grandeza, um terminal ou fio reto possui cerca de alguns nH por centímetro, mas o valor exato depende do retorno. Consequências práticas:

- capacitores com terminais longos deixam de desviar ruído em alta frequência;
- resistores podem apresentar resposta indutiva ou capacitiva;
- a conexão de um filtro pode ser mais importante que o valor nominal do componente;
- dois componentes fisicamente próximos podem se acoplar por capacitância ou indutância mútua.

## Resistores reais

Um resistor real pode ser representado por $R$ em paralelo com uma capacitância parasita $C_p$ e em série com uma indutância $L_s$. Sua impedância aproximada é

$$Z_R(\omega)=j\omega L_s+\left(\frac{1}{R}+j\omega C_p\right)^{-1}.$$

Resistores de fio são particularmente indutivos; resistores de filme e SMD tendem a ter melhor desempenho em RF. Em valores altos, $C_p$ reduz a impedância em alta frequência. A potência e a tensão máximas também limitam sua utilização em absorção de transientes.

## Capacitores reais

O modelo mínimo de um capacitor contém capacitância $C$, resistência série equivalente (ESR), indutância série equivalente (ESL) e uma resistência de fuga:

$$Z_C(\omega)\approx ESR+j\omega ESL+\frac{1}{j\omega C}.$$

A frequência de autorressonância é aproximadamente

$$f_{SR}=\frac{1}{2\pi\sqrt{ESL\,C}}.$$

Abaixo de $f_{SR}$ o componente é predominantemente capacitivo; acima dela, indutivo. O módulo mínimo de impedância é limitado pela ESR. Para desacoplamento de alta frequência, importam encapsulamento pequeno, conexão curta, via próxima e pequena área do laço capacitor–carga–retorno. Colocar vários valores em paralelo não garante banda larga: as ESLs e capacitâncias podem formar antirressonâncias.

## Indutores reais

Um indutor inclui resistência do enrolamento, capacitância entre espiras e perdas no núcleo. Um modelo simples é $L$ e resistência série em paralelo com $C_p$. Acima da autorressonância, o componente se torna capacitivo. Além disso:

- a corrente DC pode saturar o núcleo e reduzir $L$;
- perdas por histerese e correntes parasitas aumentam com a frequência;
- o campo de dispersão pode acoplar ruído a trilhas vizinhas;
- a orientação e a distância entre indutores alteram a indutância mútua.

## Materiais ferromagnéticos e ferrites

A permeabilidade é complexa e dependente de frequência:

$$\mu=\mu'-j\mu''.$$

$\mu'$ representa armazenamento de energia; $\mu''$, perdas. Ferrites usadas para supressão são escolhidas para apresentar impedância elevada e frequentemente resistiva na banda do ruído. Uma ferrite bead não é um indutor ideal: sua impedância varia com frequência, corrente de polarização, temperatura e material.

## Choques de modo comum

Um choque de modo comum enrola os condutores de ida e volta no mesmo núcleo. Para corrente diferencial, os fluxos tendem a se cancelar e a impedância é pequena. Para corrente de modo comum, os fluxos se somam e a impedância é grande. Imperfeições aparecem como indutância de fuga, capacitância entre enrolamentos e saturação. O componente deve ser dimensionado com curvas de impedância na banda de interesse e com a corrente diferencial máxima.

## Dispositivos eletromecânicos e contatos

Motores, solenoides e relés combinam indutância, comutação e, muitas vezes, escovas. A interrupção de corrente gera

$$v=L\frac{di}{dt},$$

podendo causar arco, ringing e espectro largo. Diodo de roda livre, TVS, varistor e redes RC reduzem o transiente, mas alteram o tempo de desligamento. Contatos mecânicos também produzem bounce e arcos repetitivos; a supressão deve ser colocada próxima à fonte e dimensionada para a energia armazenada.

## Arco em contatos mecânicos

Quando a tensão entre contatos excede o limite de ruptura do gás (ar), ocorre uma descarga. A curva tensão-corrente tem três regiões:

1. **Região de Townsend**: elétrons livres são acelerados pelo campo, colidem com moléculas de gás e criam pares elétron-íon.
2. **Região de brilho (glow discharge)**: a corrente é sustentada pelo processo de avalanche, com tensão de cerca de 280 V para ar.
3. **Região de arco**: o cátodo se vaporiza, a tensão cai para cerca de 12 V e a corrente pode ser de centenas de mA a vários amperes.

Para cargas indutivas, ao abrir o contato, a corrente é desviada para a capacitância parasita, gerando uma sequência de tensões crescentes e quedas bruscas conhecida como **arco de chuveiro** (showering arc).

## Dispositivos digitais

A emissão de um circuito digital é determinada mais pelo tempo de subida e pela corrente comutada que pela frequência de clock. Corrente de crossover, carga e descarga de capacitâncias e simultaneidade de saídas provocam ruído na alimentação e ground bounce. Selecionar a família lógica mais lenta que cumpra o requisito funcional costuma reduzir a banda excitada.

## Variabilidade e modelagem

Valores nominais não bastam. Tolerância, polarização, temperatura, envelhecimento e dispersão de montagem devem entrar na análise. Um modelo útil para EMC deve:

1. cobrir a banda do fenômeno;
2. incluir parasitas dominantes e conexões;
3. usar dados medidos ou curvas do fabricante;
4. ser confrontado com casos-limite e medição de impedância;
5. representar tolerâncias por varredura ou Monte Carlo quando a margem for pequena.

## Checklist de projeto

- Identificar $di/dt$ e $dv/dt$ elevados.
- Desenhar o caminho completo de ida e retorno.
- Incluir ESL, ESR, capacitâncias e indutâncias mútuas relevantes.
- Verificar autorressonância e saturação na banda e no ponto de operação.
- Colocar supressores e filtros junto à interface ou à fonte.
- Minimizar área de laço, comprimento de terminal e compartilhamento de impedância.
- Medir a impedância montada; o componente fora da placa pode se comportar de modo diferente.

## Teoremas e derivações fundamentais

**Teorema**: No modelo série $R$–$L$–$C$, o módulo da impedância é mínimo na frequência de autorressonância $\omega_0=1/\sqrt{LC}$ e vale $R$.

**Prova**: A impedância é

$$Z=R+j\left(\omega L-\frac{1}{\omega C}\right).$$

Logo,

$$|Z|^2=R^2+\left(\omega L-\frac{1}{\omega C}\right)^2.$$

O segundo termo é não negativo e se anula quando $\omega L=1/(\omega C)$, isto é, $\omega_0=1/\sqrt{LC}$. Nesse ponto, $|Z|=R$. $\square$

Corolário: Um capacitor real é capacitivo abaixo da autorressonância e indutivo acima dela. Aumentar apenas $C$ pode reduzir $f_{SR}$ e piorar o desacoplamento na banda mais alta.

**Teorema (Antirressonância de dois capacitores em paralelo)**: Dois capacitores reais em paralelo, com capacitâncias $C_1$, $C_2$ e indutâncias série equivalentes $L_{e1}$, $L_{e2}$, apresentam um pico de impedância (antirressonância) na frequência

$$f_{anti}=\frac{1}{2\pi}\sqrt{\frac{C_1+C_2}{C_1 C_2 (L_{e1}+L_{e2})}}.$$

**Prova**: A impedância de cada capacitor real é $Z_1=L_{e1}s+ESR_1+1/(C_1 s)$ e $Z_2=L_{e2}s+ESR_2+1/(C_2 s)$. Na primeira aproximação, desconsiderando ESRs, a impedância equivalente é

$$Z_{eq}=\frac{Z_1 Z_2}{Z_1+Z_2}=\frac{(L_{e1}s+1/(C_1 s))(L_{e2}s+1/(C_2 s))}{(L_{e1}+L_{e2})s+(1/C_1+1/C_2)s}.$$

O denominador de $Z_{eq}$ se anula quando

$$(L_{e1}+L_{e2})s^2+\frac{C_1+C_2}{C_1 C_2}=0,$$

ou seja, $s^2=-(C_1+C_2)/(C_1 C_2 (L_{e1}+L_{e2}))$. Substituindo $s=j\omega$, obtém-se

$$\omega_{anti}^2=\frac{C_1+C_2}{C_1 C_2 (L_{e1}+L_{e2})},$$

e portanto $f_{anti}=\omega_{anti}/(2\pi)$. $\square$

**Proposição**: Para uma borda de corrente aproximadamente linear, a tensão máxima numa indutância parasita é inversamente proporcional ao tempo de subida:

$$V_L\approx L\frac{\Delta I}{t_r}.$$

**Prova**: Durante uma rampa linear, $di/dt=\Delta I/t_r$. Substitua em $v=Ldi/dt$. $\square$

**Teorema (Energia armazenada em indutor)**: A energia armazenada em um indutor de indutância $L$ com corrente $I$ é

$$W=\frac{1}{2}LI^2.$$

**Prova**: A potência instantânea fornecida ao indutor é $p(t)=v(t)i(t)=L\frac{di}{dt}i(t)$. A energia fornecida de $0$ a $t$ é

$$W=\int_0^t L\frac{di}{dt}i(t)\,dt=L\int_0^{i(t)} i\,di=\frac{1}{2}L[i(t)]^2.$$

Para $i(t)=I$, $W=\frac{1}{2}LI^2$. $\square$

## Exemplos resolvidos

### Exemplo 1 — Autorressonância de um capacitor

Um capacitor de 100 nF possui ESL de 1 nH e ESR de 30 mΩ:

$$f_{SR}=\frac{1}{2\pi\sqrt{10^{-9}\cdot100\times10^{-9}}}=15{,}9\ \text{MHz}.$$

Em torno dessa frequência, a impedância mínima idealizada é 30 mΩ. A 100 MHz, a reatância da ESL é

$$X_L=2\pi(100\times10^6)(1\times10^{-9})=0{,}628\ \Omega,$$

portanto o componente já se comporta principalmente como indutor.

### Exemplo 2 — Ground bounce por conexão

Uma conexão total de 6 nH conduz variação de 0,8 A em 1,5 ns:

$$V=6\times10^{-9}\frac{0{,}8}{1{,}5\times10^{-9}}=3{,}2\ \text{V}.$$

O resultado mostra por que "apenas alguns nanohenries" não são desprezíveis. Na prática, a forma da corrente, o acoplamento mútuo e a distribuição do retorno refinam o valor.

### Exemplo 3 — Energia de uma bobina e supressor

Uma bobina de 40 mH conduz 0,2 A. A energia antes do desligamento é

$$W=\frac{1}{2}LI^2=\frac{1}{2}(0{,}04)(0{,}2)^2=0{,}8\ \text{mJ}.$$

O supressor deve absorver pelo menos essa ordem de energia por evento, com margem térmica para a taxa de repetição. Um diodo limita fortemente a tensão e prolonga o desligamento; uma TVS permite tensão maior e desmagnetização mais rápida.

## Insight: o componente e sua montagem formam um único dispositivo

Um capacitor SMD de baixa ESL ligado por trilha longa pode ter pior desempenho que um valor menor colocado diretamente entre os pinos. Da mesma forma, uma ferrite eficaz em fixture de 50 Ω pode ser pouco útil se a impedância real do caminho permitir acoplamento por outra rota. Sempre modele componente, pads, vias, planos, retorno e vizinhança.

## Lista de Exercícios Propostos

**E.1** Um capacitor de 100 nF possui ESL de 1 nH. Estime sua frequência de autorressonância.

**E.2** Calcule a tensão em uma indutância parasita de 8 nH quando a corrente varia 1 A em 2 ns.

**E.3** Explique por que um capacitor de maior valor pode desacoplar pior em alta frequência.

**E.4** Proponha dois métodos de supressão para a bobina de um relé e compare o efeito no tempo de desligamento.

**E.5** Esboce o modelo não ideal de um resistor, um capacitor e um indutor e indique a região em que cada um deixa de cumprir sua função nominal.

**E.6** Um resistor de 10 kΩ possui capacitância paralela de 0,4 pF. Em que frequência $|X_C|=R$?

**E.7** Uma ferrite apresenta $Z=20+j80\ \Omega$ na frequência de interesse. Calcule $|Z|$ e explique se o comportamento é predominantemente dissipativo ou reativo.

**E.8** Dois capacitores reais em paralelo podem formar uma antirressonância. Explique o mecanismo usando a ESL do capacitor maior e a capacitância do menor.

## Gabarito

**E.1** Frequência de autorressonância de um capacitor de 100 nF com ESL de 1 nH.

Equação: $f_{SR}=1/(2\pi\sqrt{ESL\cdot C})$.

Substituindo: $f_{SR}=1/(2\pi\sqrt{10^{-9}\cdot100\times10^{-9}})=1/(2\pi\sqrt{10^{-16}})=1/(2\pi\cdot10^{-8})=15{,}9\times10^6$ Hz.

Resposta: $15{,}9$ MHz.

**E.2** Tensão em indutância parasita de 8 nH quando a corrente varia 1 A em 2 ns.

Equação: $V=L\cdot di/dt$.

Para variação linear: $di/dt=\Delta I/t_r=1\text{ A}/2\text{ ns}=0{,}5\times10^9$ A/s.

$V=8\times10^{-9}\cdot0{,}5\times10^9=4$ V.

Resposta: $4$ V.

**E.3** Por que um capacitor de maior valor pode desacoplar pior em alta frequência.

Um capacitor de maior valor $C$ tem frequência de autorressonância $f_{SR}=1/(2\pi\sqrt{ESL\cdot C})$ menor. Se $f_{SR}$ cair abaixo da frequência de ruído de interesse, o capacitor se comporta indutivamente e sua impedância aumenta com a frequência, tornando-o ineficaz para desacoplamento. Além disso, capacitores maiores geralmente possuem ESL maior devido ao encapsulamento, o que agrava o problema.

**E.4** Dois métodos de supressão para bobina de relé e comparação do efeito no tempo de desligamento.

Método 1: Diodo de roda livre em paralelo com a bobina. O diodo limita a tensão de comutação a cerca de 0,7 V, mas a corrente decae lentamente com constante de tempo $L/R_{diodo}$, prolongando significativamente o tempo de desligamento.

Método 2: TVS (Diodo Supressor de Transientes) ou rede RC snubber. A TVS permite tensão maior (ex: 12-24 V), o que acelera a desmagnetização da bobina e reduz o tempo de desligamento. A rede RC absorve energia sem prolongar excessivamente o tempo de corrente.

**E.6** Frequência onde $|X_C|=R$ para resistor de 10 kΩ com capacitância paralela de 0,4 pF.

Condição: $|X_C|=1/(2\pi f C)=R$.

Logo: $f=1/(2\pi R C)=1/(2\pi\cdot10^4\cdot0{,}4\times10^{-12})=1/(2\pi\cdot4\times10^{-9})=1/(2{,}513\times10^{-8})=39{,}8\times10^6$ Hz.

Resposta: $39{,}8$ MHz.

**E.7** Cálculo de $|Z|$ para ferrite com $Z=20+j80\ \Omega$.

$|Z|=\sqrt{R^2+X^2}=\sqrt{20^2+80^2}=\sqrt{400+6400}=\sqrt{6800}=82{,}46\ \Omega$.

A parcela reativa ($X=80\ \Omega$) é 4 vezes maior que a resistiva ($R=20\ \Omega$), portanto o comportamento é predominantemente indutivo/reativo, não dissipativo.

**E.8** Mecanismo de antirressonância de dois capacitores reais em paralelo.

Quando dois capacitores com valores diferentes são colocados em paralelo, cada um possui sua própria frequência de autorressonância determinada por $f_{SR}=1/(2\pi\sqrt{ESL\cdot C})$. O capacitor maior tem $f_{SR}$ mais baixa e comporta-se como indutor acima dessa frequência. O capacitor menor tem $f_{SR}$ mais alta e ainda é capacitivo na faixa entre as duas autorressonâncias. Nesse intervalo, a ESL do capacitor maior ressona com a capacitância do capacitor menor, criando um pico de impedância (antirressonância) que pode degradar o desempenho da PDN.

## Exemplo numérico adicional — Impedância de capacitor real vs. frequência

Dados: $C=100$ nF, $ESL=1$ nH, $ESR=30$ mΩ.

Frequência de ressonância: $f_{SR}=1/(2\pi\sqrt{ESL\cdot C})=15{,}9$ MHz.

A 1 MHz: $X_C=-1/(2\pi\cdot10^6\cdot100\times10^{-9})=-1{,}59\ \Omega$,
$X_L=2\pi\cdot10^6\cdot10^{-9}=0{,}00628\ \Omega$.
Impedância dominante: capacitiva.

A 100 MHz: $X_C=-0{,}159\ \Omega$, $X_L=0{,}628\ \Omega$.
Impedância dominante: indutiva.

## Código Python — Impedância de capacitor real vs. frequência

```python
import numpy as np
import matplotlib.pyplot as plt

# Parâmetros do capacitor
C = 100e-9      # 100 nF
ESL = 1e-9      # 1 nH
ESR = 0.03      # 30 mΩ

# Faixa de frequência
f = np.logspace(4, 9, 500)  # 10 kHz a 1 GHz
w = 2 * np.pi * f

# Impedância
Z_C = ESR + 1j * w * ESL + 1j / (w * C)
Z_mag = np.abs(Z_C)

# Frequência de ressonância
f_SR = 1 / (2 * np.pi * np.sqrt(ESL * C))

plt.figure(figsize=(10, 6))
plt.loglog(f, Z_mag, 'b-', linewidth=2, label='|Z_C|')
plt.axvline(f_SR, color='r', linestyle='--', label=f'f_SR = {f_SR/1e6:.2f} MHz')
plt.xlabel('Frequência (Hz)')
plt.ylabel('Módulo da Impedância (Ω)')
plt.title('Impedância de Capacitor Real vs Frequência')
plt.legend()
plt.grid(True, which='both', linestyle='--')
plt.show()
```

## Código Python — Impedância de indutor real vs. frequência

```python
import numpy as np
import matplotlib.pyplot as plt

# Parâmetros do indutor
L = 10e-6       # 10 µH
ESR_ind = 0.5   # 0.5 Ω
C_p = 1e-12     # 1 pF

f = np.logspace(5, 9, 500)  # 100 kHz a 1 GHz
w = 2 * np.pi * f

# Impedância: L em série com ESR, em paralelo com C_p
Z_L_series = ESR_ind + 1j * w * L
Z_C_p = 1 / (1j * w * C_p)
Z_total = (Z_L_series * Z_C_p) / (Z_L_series + Z_C_p)
Z_mag = np.abs(Z_total)

plt.figure(figsize=(10, 6))
plt.loglog(f, Z_mag, 'g-', linewidth=2, label='|Z_L|')
plt.xlabel('Frequência (Hz)')
plt.ylabel('Módulo da Impedância (Ω)')
plt.title('Impedância de Indutor Real vs Frequência')
plt.legend()
plt.grid(True, which='both', linestyle='--')
plt.show()
```

## Exemplo numérico adicional — Efeito pelicular em fio de cobre

**Problema**: Calcule a profundidade pelicular $\delta$ para cobre ($\sigma=5.8\times10^7$ S/m, $\mu_r=1$) em 1 MHz, 100 MHz, e 1 GHz.

**Solução**:

Para $f=1$ MHz: $\omega=2\pi\times10^6$.
$\delta=\sqrt{2/(\omega\mu_0\sigma)}=\sqrt{2/(2\pi\times10^6\cdot4\pi\times10^{-7}\cdot5.8\times10^7)}$
$=\sqrt{2/(1.45\times10^8)}=\sqrt{1.38\times10^{-8}}=1.17\times10^{-4}$ m $=117$ µm.

Para $f=100$ MHz: $\delta$ diminui por fator $\sqrt{100}=10$, logo $\delta=11.7$ µm.

Para $f=1$ GHz: $\delta$ diminui por fator $\sqrt{1000}=31.6$, logo $\delta=3.7$ µm.

> **Insight para Estudantes**: Note que a profundidade pelicular diminui com $1/\sqrt{f}$. Isso significa que em alta frequência, apenas a superfície do condutor é utilizada, aumentando a resistência efetiva.

## Código Python — Resistência DC e AC vs. frequência

```python
import numpy as np
import matplotlib.pyplot as plt

# Parâmetros do fio de cobre
sigma = 5.8e7      # Condutividade (S/m)
mu_r = 1.0
mu_0 = 4 * np.pi * 1e-7
l = 1.0            # Comprimento = 1 m
r_wire = 1e-3      # Raio = 1 mm
A = np.pi * r_wire**2

# Faixa de frequência
f = np.logspace(3, 9, 100)  # 1 kHz a 1 GHz
w = 2 * np.pi * f

# Resistência DC
R_dc = l / (sigma * A)

# Resistência AC (aproximação para fio cilíndrico)
# R_ac ≈ R_dc * (r_wire / (2*delta)) para delta << r_wire
delta = np.sqrt(2 / (w * mu_0 * mu_r * sigma))
R_ac = R_dc * (r_wire / (2 * delta + 1e-10))  # Evitar divisão por zero

plt.figure(figsize=(8, 5))
plt.semilogx(f, R_dc * np.ones_like(f), 'b--', linewidth=2, label='R_DC')
plt.semilogx(f, R_ac, 'r-', linewidth=2, label='R_AC (aproximada)')
plt.xlabel('Frequência (Hz)')
plt.ylabel('Resistência (Ω)')
plt.title('Resistência DC vs AC vs Frequência (Fio de Cobre, r=1mm, l=1m)')
plt.legend()
plt.grid(True, which='both', linestyle='--')
plt.show()
```

## Antirressonância de bancos de capacitores

Dois capacitores reais em paralelo não equivalem simplesmente a $C_1+C_2$. Entre suas autorressonâncias, a ESL de um ramo pode ressoar com a capacitância do outro e criar um pico de impedância.

```python
import numpy as np
import matplotlib.pyplot as plt

f = np.logspace(3, 10, 2000); w = 2*np.pi*f
parts = [(10e-6, 8e-3, 1.5e-9), (100e-9, 25e-3, 0.6e-9)]
Z = [esr + 1j*w*esl + 1/(1j*w*c) for c, esr, esl in parts]
Zeq = 1/sum(1/z for z in Z)

for z, (c, _, _) in zip(Z, parts):
    plt.loglog(f, abs(z), '--', label=f'{c:g} F')
plt.loglog(f, abs(Zeq), lw=2.5, label='paralelo')
plt.xlabel('Frequência (Hz)'); plt.ylabel('|Z| (Ω)')
plt.grid(True, which='both', alpha=.3); plt.legend(); plt.tight_layout()
```

**Corolário.** Adicionar um capacitor pode elevar a impedância máxima da PDN. ESR controlada, valores intermediários, montagem e amortecimento precisam ser avaliados como rede.

## Monte Carlo de autorressonância

```python
import numpy as np
rng = np.random.default_rng(42)
n = 100_000
C = rng.normal(100e-9, 0.10*100e-9, n)
ESL = rng.normal(0.8e-9, 0.15*0.8e-9, n)
valid = (C > 0) & (ESL > 0)
fsr = 1/(2*np.pi*np.sqrt(C[valid]*ESL[valid]))
print(np.percentile(fsr/1e6, [1, 5, 50, 95, 99]), 'MHz')
```

O resultado deve ser apresentado por percentis, pois tolerâncias de geometria e montagem não garantem distribuição perfeitamente normal.

## Laboratório SPICE — antirressonância de desacoplamento

```spice
* Dois capacitores reais em paralelo; injecao AC de 1 A
Itest 0 vcc AC 1
Rleak rail 0 1G
Lmount vcc rail 500p
Xc1 rail 0 CAP_REAL C=10u  ESR=8m  ESL=1.5n
Xc2 rail 0 CAP_REAL C=100n ESR=25m ESL=600p
.subckt CAP_REAL p n params: C=100n ESR=30m ESL=1n
Lx p a {ESL}
Rx a b {ESR}
Cx b n {C}
.ends CAP_REAL
.ac dec 200 1k 3G
.print ac vm(vcc)
.end
```

Como a fonte injeta 1 A, `vm(vcc)` é numericamente $|Z|$. Remova um capacitor por vez, compare os mínimos e identifique eventual pico de antirressonância. Varra ESR antes de concluir que “menor ESR é sempre melhor”.

## Referência principal

Este capítulo sintetiza o Capítulo 5, "Nonideal Behavior of Components", de C. R. Paul, *Introduction to Electromagnetic Compatibility*, 2ª ed., Wiley, 2006, pp. 299–375.
