# Projeto de sistemas para EMC

EMC deve ser projetada desde a arquitetura. Corrigir um protótipo no fim do ciclo tende a exigir ferrites, blindagens e retrabalho caros, enquanto decisões precoces sobre retorno, interfaces, placement e banda de sinais frequentemente evitam o problema sem custo adicional. O princípio central é sempre identificar **fonte, caminho e vítima**.

## Sumário

1. [O esquema oculto](#o-esquema-oculto)
2. [Segurança, sinal e chassi](#segurança-sinal-e-chassi)
3. [Correntes retornam à fonte](#correntes-retornam-à-fonte)
4. [Indutância parcial e ground bounce](#indutância-parcial-e-ground-bounce)
5. [Aterramento em ponto único, multiponto e híbrido](#aterramento-em-ponto-único-multiponto-e-híbrido)
6. [Projeto de PCB](#projeto-de-pcb)
7. [Configuração do sistema](#configuração-do-sistema)
8. [ESD](#esd)
9. [Diagnóstico e efeito dominante](#diagnóstico-e-efeito-dominante)
10. [Revisão por fases](#revisão-por-fases)
11. [Princípios demonstrados](#princípios-demonstrados)
12. [Exemplo resolvido — Impedância-alvo da PDN](#exemplo-resolvido--impedância-alvo-da-pdn)
13. [Exemplo resolvido — Divisão de corrente de retorno](#exemplo-resolvido--divisão-de-corrente-de-retorno)
14. [Estudo de caso integrado](#estudo-de-caso-integrado)
15. [Insight: margem é uma propriedade do conjunto](#insight-margem-é-uma-propriedade-do-conjunto)
16. [Exercícios](#exercícios)
17. [Respostas selecionadas](#respostas-selecionadas)
18. [Exemplo numérico adicional — Impedância-alvo da PDN com múltiplos capacitores](#exemplo-numérico-adicional--impedância-alvo-da-pdn-com-múltiplos-capacitores)
19. [Código Python — Impedância da PDN com múltiplos capacitores](#código-python--impedância-da-pdn-com-múltiplos-capacitores)
20. [Exemplo numérico adicional — Ground bounce e redução](#exemplo-numérico-adicional--ground-bounce-e-redução)
21. [Modelo integrado de porta, cabo e chassi](#modelo-integrado-de-porta-cabo-e-chassi)
22. [Estudo de caso — revisão em quatro fronteiras](#estudo-de-caso--revisão-em-quatro-fronteiras)
23. [Laboratório SPICE — retorno por chassi e cabo](#laboratório-spice--retorno-por-chassi-e-cabo)
24. [Referência principal](#referência-principal)

## O esquema oculto

### Por que "terra" não é equipotencial?

O esquema lógico omite indutâncias de fios e vias, capacitâncias para chassi, impedâncias de planos, acoplamentos e antenas formadas por cabos. "Terra" não é um nó equipotencial em toda frequência. A tensão entre dois pontos de um retorno é

$$V=ZI,$$

e, durante transientes rápidos, a parcela indutiva $L\,di/dt$ pode dominar. O projeto precisa desenhar os caminhos reais de corrente.

> **Insight para Estudantes**: Em DC, um fio é apenas um condutor com resistência baixa. Em RF, o mesmo fio é um indutor com reatância $X_L=\omega L$. Para $L=10$ nH e $f=100$ MHz, $X_L=2\pi\cdot10^8\cdot10\times10^{-9}=6.28\ \Omega$. Se $1$ A flui, há $6.28$ V de queda de tensão apenas na indutância do fio! Isso explica por que "terra" tem potenciais diferentes em pontos distintos da placa.

## Segurança, sinal e chassi

Terra de proteção tem função de segurança; retorno de sinal fecha correntes funcionais; chassi controla correntes e campos na fronteira. Eles podem se conectar, mas os pontos e impedâncias devem ser escolhidos deliberadamente. Requisitos de segurança prevalecem sobre recomendações genéricas de EMC.

## Correntes retornam à fonte

Em baixa frequência, o retorno favorece baixa resistência. Em alta frequência, favorece baixa impedância e, portanto, baixa indutância: tende a fluir no plano imediatamente sob a trilha. Uma fenda força desvio, aumenta área de laço e eleva emissão e suscetibilidade.

Planos próximos exploram indutância mútua para manter o retorno junto ao sinal. Em mudanças de camada, uma via de retorno ou capacitor de costura apropriado deve permitir a transição entre referências.

## Indutância parcial e ground bounce

Indutância parcial permite modelar segmentos antes de fechar explicitamente o laço; termos próprios e mútuos combinam-se no circuito completo. Muitas saídas comutando simultaneamente produzem ground bounce por indutância comum de encapsulamento, vias e retorno:

$$V_{bounce}\approx L_{comum}\frac{dI_{total}}{dt}.$$

Reduz-se o efeito com encapsulamentos de baixa indutância, múltiplos pinos/vias de retorno, planos, desacoplamento local e controle de slew rate.

## Aterramento em ponto único, multiponto e híbrido

Ponto único pode ser apropriado quando as dimensões são eletricamente pequenas e impedância comum é controlável. Multiponto oferece conexões curtas em alta frequência. Sistemas híbridos usam componentes dependentes de frequência. Nenhuma topologia é universal: deve-se verificar a banda, os caminhos de corrente e a possibilidade de laços ou conversão de modo.

## Projeto de PCB

### Seleção, velocidade e placement

Use componentes com bordas apenas tão rápidas quanto necessário. Agrupe funções pelo fluxo de sinal e posicione conectores, filtros e proteção na borda. Mantenha nós de alto $dv/dt$, laços de alto $di/dt$, clocks e conversores longe de entradas sensíveis e cabos.

### Planos e retorno

Prefira plano de referência contínuo. Reduza área de laço e evite sinais rápidos sobre splits. Quando não houver plano interno, uma malha de retorno densa pode reduzir a indutância, mas seu desempenho é inferior e mais dependente da geometria.

### Distribuição de energia e desacoplamento

O desacoplamento fornece corrente local durante a borda. O laço pino de alimentação–capacitor–retorno deve ser mínimo. A rede de distribuição de potência deve manter impedância abaixo do alvo:

$$Z_{target}=\frac{\Delta V_{permitida}}{\Delta I}.$$

Capacitores reais, planos, vias e regulador formam ressonâncias; valores e placement devem ser avaliados como rede, não isoladamente.

### Sinais mistos

Particionar é controlar correntes, não apenas desenhar regiões no layout. Um plano sólido frequentemente produz retorno mais previsível que planos divididos. Conversores devem ficar na fronteira entre funções, com sinais analógicos e digitais roteados de forma que seus retornos não atravessem áreas sensíveis.

## Configuração do sistema

- Definir a fronteira do chassi e terminar blindagens de cabo nela.
- Colocar filtro de alimentação na entrada, separando fisicamente lados sujo e limpo.
- Minimizar número e comprimento de cabos internos.
- Posicionar conectores para impedir que correntes de interface atravessem a PCB.
- Evitar acoplamento entre filtro e fonte ruidosa.
- Suprimir motores e cargas indutivas junto à fonte.
- Planejar correntes de ESD para o chassi sem atravessar eletrônica sensível.

## ESD

ESD pode acoplar por descarga direta, campo e corrente sobre cabos ou chassi. O projeto combina isolamento, desvio e robustez:

1. impedir acesso a nós vulneráveis;
2. fornecer caminho curto e de baixa indutância ao chassi;
3. limitar o resíduo com TVS e elementos série;
4. filtrar antes do circuito;
5. garantir recuperação de firmware e ausência de estado perigoso.

## Diagnóstico e efeito dominante

Problemas EMC contêm muitos acoplamentos, mas geralmente um domina em uma banda. O diagnóstico deve buscar a intervenção que produz maior mudança mensurável:

1. definir sintoma e critério de falha;
2. medir referência repetível;
3. relacionar frequências a fontes internas;
4. medir correntes em cabos e campos próximos;
5. testar uma hipótese por vez;
6. corrigir na fonte ou no caminho dominante;
7. revalidar todas as configurações e margens.

Ferrites móveis, folha condutora, absorvedor, ponte temporária de retorno e capacitores de teste são úteis para diagnóstico, mas a solução final precisa ser reproduzível, segura e qualificada.

## Revisão por fases

### Arquitetura

- requisitos e normas aplicáveis;
- interfaces e fronteiras EMC;
- orçamento de ruído e margem;
- estratégia de chassi, alimentação e cabos.

### Esquemático e layout

- fontes de $dv/dt$ e $di/dt$;
- filtros, proteção e retornos;
- stack-up, impedâncias e mudanças de referência;
- placement, desacoplamento e particionamento por correntes.

### Protótipo e validação

- pré-conformidade desde a primeira placa;
- varredura de campo próximo e corrente de modo comum;
- testes de imunidade com monitoração funcional;
- registro de configuração, incerteza, margem e correções.

## Princípios demonstrados

**Teorema**: Entre caminhos de retorno paralelos, a corrente senoidal se divide segundo as admitâncias, e não apenas segundo as resistências.

**Prova**: Se os caminhos compartilham a mesma tensão $V$, então $I_k=V/Z_k=VY_k$. A corrente total é $I=V\sum_kY_k$, de modo que

$$\frac{I_k}{I}=\frac{Y_k}{\sum_nY_n}.$$

Assim, um caminho de baixa resistência pode transportar pouca corrente em alta frequência se sua indutância o tornar alta impedância. $\square$

**Proposição**: Reduzir simultaneamente a indutância comum e a taxa de variação da corrente reduz ground bounce multiplicativamente.

**Prova**: De $V_{bounce}=L_{comum}\,dI/dt$, se $L$ é reduzida por $a$ e $dI/dt$ por $b$, a tensão é reduzida por $ab$. $\square$

## Exemplo resolvido — Impedância-alvo da PDN

Uma carga varia 0,8 A e admite desvio de 40 mV:

$$Z_{target}=\frac{0{,}04}{0{,}8}=0{,}05\ \Omega=50\ \text{m}\Omega.$$

A PDN deve permanecer abaixo dessa ordem de impedância na banda em que o regulador e os capacitores precisam fornecer a corrente. O cálculo não escolhe sozinho os capacitores; ele define uma meta verificável.

## Exemplo resolvido — Divisão de corrente de retorno

Dois caminhos paralelos têm $Z_1=0{,}1+j0{,}2\ \Omega$ e $Z_2=0{,}5+j0\ \Omega$. Calculando as admitâncias:

$$Y_1=\frac{1}{0{,}1+j0{,}2}=2-j4\ \text{S},\qquad Y_2=2\ \text{S}.$$

Logo,

$$\frac{I_1}{I}=\frac{2-j4}{4-j4}=0{,}75-j0{,}25.$$

A divisão possui amplitude e fase; falar apenas em "caminho de menor resistência" seria insuficiente.

## Estudo de caso integrado

Um produto falha em emissão radiada a 180 MHz e reinicia sob ESD no conector. A sonda de corrente mostra modo comum no cabo; a inspeção revela blindagem terminada por pigtail, filtro 8 cm para dentro da placa e trilha rápida cruzando uma fenda.

Hipótese fonte–caminho–vítima:

- fonte: harmônicos do clock e corrente de ESD;
- caminho: conversão de modo na fenda, cabo e pigtail indutivo;
- vítima: entrada de reset e referência local.

Correções coerentes são terminar a blindagem em 360° no chassi, mover filtro/proteção à entrada, restaurar o retorno da trilha e afastar/proteger reset. Cada correção deve ser medida isoladamente e depois em conjunto para evitar atribuição indevida.

## Insight: margem é uma propriedade do conjunto

Uma placa pode passar isolada e falhar no gabinete por causa de cabo, fonte, montagem e firmware. A revisão EMC deve controlar variantes, estados operacionais, orientação de cabos e tolerâncias. "Passou uma vez" é evidência de uma configuração, não prova universal de robustez.

## Lista de Exercícios Propostos

**E.1** Explique por que "terra" não é necessariamente equipotencial em alta frequência.

**E.2** Desenhe o retorno de uma trilha que cruza uma fenda e proponha correção.

**E.3** Calcule $Z_{target}$ para variação de corrente de 0,8 A e ripple permitido de 40 mV.

**E.4** Compare aterramento em ponto único e multiponto para um sistema de áudio com processador digital.

**E.5** Elabore uma checklist de revisão EMC para uma PCB com fonte chaveada, MCU, ADC e dois cabos externos.

**E.6** Uma conexão de retorno tem 12 nH e conduz 0,5 A em 1 ns. Estime ground bounce.

**E.7** A indutância é reduzida pela metade e o tempo de subida é dobrado. Qual é a redução ideal de $V_{bounce}$?

**E.8** Monte uma árvore fonte–caminho–vítima para falha de ADC quando um motor é acionado.

## Gabarito

**E.3** Cálculo de $Z_{target}$ para variação de corrente de 0,8 A e ripple permitido de 40 mV.

Equação: $Z_{target}=\Delta V/\Delta I$.

Com $\Delta V=40$ mV=0,04 V e $\Delta I=0{,}8$ A: $Z_{target}=0{,}04/0{,}8=0{,}05\ \Omega=50$ mΩ.

Resposta: $Z_{target}=50$ mΩ.

**E.6** Ground bounce para conexão de retorno com 12 nH e corrente de 0,5 A em 1 ns.

Equação: $V_{bounce}=L\cdot di/dt$.

$di/dt=0{,}5\text{ A}/1\text{ ns}=0{,}5\times10^9$ A/s.

$V_{bounce}=12\times10^{-9}\cdot0{,}5\times10^9=6$ V.

Resposta: $V_{bounce}=6$ V.

**E.7** Redução ideal de $V_{bounce}$ quando indutância é reduzida pela metade e tempo de subida é dobrado.

Equação: $V_{bounce}=L\cdot \Delta I/t_r$.

Se $L$ é reduzida pela metade: $L_{new}=L/2$.

Se $t_r$ é dobrado: $t_{r,new}=2t_r$.

$V_{bounce,new}=(L/2)\cdot \Delta I/(2t_r)=L\cdot \Delta I/(4t_r)=V_{bounce}/4$.

Redução por fator 4, isto é, aproximadamente 12 dB em amplitude ($20\log_{10}(4)\approx12$ dB).

Resposta: Fator 4, isto é, aproximadamente 12 dB em amplitude.

**E.8** Árvore fonte–caminho–vítima para falha de ADC quando motor é acionado.

Fonte: arco/PWM do motor gera transientes de corrente e tensão.

Caminhos possíveis:
1. Alimentação comum: transientes de corrente na alimentação afetam a referência de tensão do ADC.
2. Campo magnético: campo gerado pelo motor induz tensão em trilhas de referência ou entrada do ADC.
3. Cabo: cabo do motor acopla ruído de modo comum ao cabo de referência/entrada do ADC.

Cada ramo pede medição específica: medição de ruído na alimentação, medição de campo próximo, medição de corrente de modo comum no cabo.

Resposta: Possibilidades: arco/PWM do motor → alimentação comum, campo magnético ou cabo → referência/entrada do ADC; cada ramo pede medição específica.

## Exemplo numérico adicional — Impedância-alvo da PDN com múltiplos capacitores
$Z_{target}=0.04/0.8=0.05\ \Omega=50$ mΩ.

Se temos capacitores de 10 µF, 100 nF, 10 nF com ESLs de 5 nH, 1 nH, 0.5 nH:

Para 10 µF: $f_{SR}=1/(2\pi\sqrt{5\times10^{-9}\cdot10\times10^{-6}})=71.2$ kHz.
Para 100 nF: $f_{SR}=1/(2\pi\sqrt{1\times10^{-9}\cdot100\times10^{-9}})=15.9$ MHz.
Para 10 nF: $f_{SR}=1/(2\pi\sqrt{0.5\times10^{-9}\cdot10\times10^{-9}})=22.5$ MHz.

A PDN deve manter $Z<50$ mΩ na banda de 100 kHz a 100 MHz.

## Código Python — Impedância da PDN com múltiplos capacitores

```python
import numpy as np
import matplotlib.pyplot as plt

# Parâmetros da PDN
f = np.logspace(4, 8, 500)  # 10 kHz a 100 MHz
w = 2 * np.pi * f

# Capacitores com ESL e ESR
caps = [
    {'C': 10e-6, 'ESL': 5e-9, 'ESR': 0.05},   # 10 µF
    {'C': 100e-9, 'ESL': 1e-9, 'ESR': 0.03},  # 100 nF
    {'C': 10e-9, 'ESL': 0.5e-9, 'ESR': 0.02}  # 10 nF
]

# Impedância total da PDN
Z_total = np.zeros_like(f, dtype=complex)

for cap in caps:
    C = cap['C']
    ESL = cap['ESL']
    ESR = cap['ESR']
    
    Z_cap = ESR + 1j * w * ESL + 1 / (1j * w * C)
    Z_total += Z_cap

# Impedância equivalente: soma explícita das admitâncias
Y_total = np.zeros_like(f, dtype=complex)
for cap in caps:
    C = cap['C']
    ESL = cap['ESL']
    ESR = cap['ESR']
    Y_total += 1 / (ESR + 1j * w * ESL + 1 / (1j * w * C))

Z_eq = 1 / Y_total

Z_eq_total = 1 / np.abs(Y_total)

# Target impedance
Z_target = 0.05  # 50 mΩ

plt.figure(figsize=(8, 5))
plt.semilogx(f, Z_eq_total, 'b-', linewidth=2, label='Impedância PDN')
plt.axhline(Z_target, color='r', linestyle='--', label=f'Z_target = {Z_target*1000:.0f} mΩ')
plt.xlabel('Frequência (Hz)')
plt.ylabel('Impedância (Ω)')
plt.title('Impedância da PDN vs Frequência')
plt.legend()
plt.grid(True, which='both', linestyle='--')
plt.show()
```

## Exemplo numérico adicional — Ground bounce e redução

**Problema**: Um circuito tem $L_{comum}=10$ nH e $dI/dt=1$ A/ns. Qual é o ground bounce? Se reduzirmos $L$ pela metade e $dI/dt$ pela metade, qual é a nova tensão?

**Solução**:

Tensão original: $V_{bounce}=L\cdot dI/dt=10\times10^{-9}\cdot10^9=10$ V.

Nova indutância: $L'=5$ nH.
Nova taxa: $dI/dt'=0.5$ A/ns.

Nova tensão: $V'_{bounce}=5\times10^{-9}\cdot0.5\times10^9=2.5$ V.

Redução: fator de 4 (ou 6 dB em amplitude).

> **Insight para Estudantes**: Ground bounce é proporcional ao produto $L\cdot dI/dt$. Reduzir apenas um dos fatores pela metade reduz a tensão pela metade. Reduzir ambos pela metade reduz a tensão por um fator de 4. Por isso, múltiplas vias de retorno (reduzindo $L$) e controle de slew rate (reduzindo $dI/dt$) são estratégias complementares eficazes.

## Modelo integrado de porta, cabo e chassi

Considere uma corrente CM gerada por capacitância parasita $C_p$ a partir de um nó rápido. Ela se divide entre retorno de chassi $Z_{ch}$ e cabo $Z_{cab}$:

$$
I_{CM}=j\omega C_pV_n,qquad
I_{cab}=I_{CM}\frac{Z_{ch}}{Z_{ch}+Z_{cab}}.
$$

**Corolário.** Reduzir $Z_{ch}$ próximo ao conector desvia corrente do cabo e pode reduzir emissão, desde que o novo caminho não atravesse circuitos sensíveis.

```python
import numpy as np
import matplotlib.pyplot as plt
f = np.logspace(5, 9, 800); w = 2*np.pi*f
Cp, Vn = 20e-12, 10.0
Zcab = 150 + 1j*w*0.2e-6
for Lch in [20e-9, 5e-9, 1e-9]:
    Zch = 20e-3 + 1j*w*Lch
    Icm = 1j*w*Cp*Vn
    Icab = Icm*Zch/(Zch+Zcab)
    plt.loglog(f, abs(Icab), label=f'Lch={Lch*1e9:g} nH')
plt.xlabel('Frequência (Hz)'); plt.ylabel('|I no cabo| (A)')
plt.grid(True, which='both', alpha=.3); plt.legend(); plt.tight_layout()
```

## Estudo de caso — revisão em quatro fronteiras

Para um controlador com SMPS, Ethernet, caixa metálica e sensor externo, revise:

1. **fonte:** loop quente, capacitância ao dissipador e bordas;
2. **placa:** planos, PDN, retorno sob sinais e posição de proteção;
3. **fronteira:** conectores, terminação de blindagem e filtros;
4. **sistema:** cabos, chassi, alimentação, montagem e estados operacionais.

Produza um diagrama de correntes para baixa frequência, harmônicos de chaveamento e ESD. Um único desenho de “terra” não descreve as três faixas.

## Laboratório SPICE — retorno por chassi e cabo

```spice
Vnode fast 0 AC 1
VsenseCp fast cpnode 0
Cp cpnode chassis 20p
RleakCp cpnode 0 1G
Rch chassis chret 20m
Lch chret 0 5n
VsenseCable chassis cablein 0
Rcable cablein cable 150
Lcable cable 0 200n
.ac dec 200 100k 1G
.print ac mag(vsensecp#branch) mag(vsensecable#branch) vm(chassis)
.end
```

`Rch` e `Lch` formam uma conexão série $R+j\omega L$. Varra `Lch` e observe quanto da corrente injetada por `Cp` é desviada para o cabo.

## Referência principal

Síntese do Capítulo 11, "System Design for EMC", de C. R. Paul, *Introduction to Electromagnetic Compatibility*, 2ª ed., Wiley, 2006, pp. 753–857.
