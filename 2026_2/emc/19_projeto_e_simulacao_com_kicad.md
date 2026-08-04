# Projeto e simulação com KiCad

> Pré-requisito recomendado: [Introdução ao SPICE para EMC](05_introducao_spice_para_emc.md). Este capítulo aplica a sintaxe e os critérios de validação ao fluxo KiCad/ngspice e ao layout de PCB.

O KiCad é uma suite de EDA (Electronic Design Automation) open-source amplamente utilizada para projeto de esquemáticos e PCBs. Para EMC e integridade de sinal, o KiCad oferece capacidades de simulação SPICE integradas (baseadas em Ngspice) que permitem analisar reflexões, ringing, impedância da PDN e espectro de sinais antes da fabricação.

## Sumário

1. [Introdução ao KiCad para EMC](#introdução-ao-kicad-para-emc)
2. [Configuração do simulador SPICE no KiCad](#configuração-do-simulador-spice-no-kicad)
3. [Modelagem de componentes não ideais no esquemático](#modelagem-de-componentes-não-ideais-no-esquemático)
4. [Regras de layout para EMC no PCB Editor](#regras-de-layout-para-emc-no-pcb-editor)
5. [Simulação SPICE integrada no KiCad](#simulação-spice-integrada-no-kicad)
6. [Exemplos práticos de simulação no KiCad](#exemplos-práticos-de-simulação-no-kicad)
7. [Fluxo de trabalho recomendado para EMC no KiCad](#fluxo-de-trabalho-recomendado-para-emc-no-kicad)
8. [Limitações das simulações no KiCad](#limitações-das-simulações-no-kicad)
9. [Código Python — Gerador de netlist SPICE para KiCad](#código-python--gerador-de-netlist-spice-para-kicad)
10. [Interpretação de resultados no simulador do KiCad](#interpretação-de-resultados-no-simulador-do-kicad)
11. [Exercícios práticos com KiCad](#exercícios-práticos-com-kicad)
12. [Validação cruzada KiCad–Python](#validação-cruzada-kicadpython)
13. [Netlist completa — filtro de entrada](#netlist-completa--filtro-de-entrada)
14. [Critérios de convergência e documentação](#critérios-de-convergência-e-documentação)
15. [Referência principal](#referência-principal)

## Introdução ao KiCad para EMC

O fluxo de trabalho do KiCad para projetos EMC inclui:

1. **Eeschema**: Captura esquemática com modelagem de componentes não ideais.
2. **PCBNew**: Layout de PCB com regras de EMC (planos de referência, roteamento diferenciado, etc.).
3. **Simulador SPICE**: Análise transiente, AC e Fourier para validação de integridade de sinal e emissões.

> **Insight para Estudantes**: O KiCad não é um simulador de campos eletromagnéticos 3D como CST ou HFSS. Ele é um simulador de circuitos (SPICE). Para EMC de baixa e média frequência (integridade de sinal, acoplamento por impedância comum, reflexões em linhas), o SPICE é suficiente e muito mais rápido. Para radiação direta e acoplamento por campo próximo complexo, ferramentas 3D são necessárias.

## Configuração do simulador SPICE no KiCad

No KiCad 8+, o simulador SPICE é integrado e baseado em Ngspice. Para configurar:

1. Abra o Eeschema e vá em `Simulação > Configuração do Simulador SPICE`.
2. Selecione o tipo de simulação: Transiente, AC, DC Sweep, ou Fourier.
3. Configure os parâmetros:
   - **Transiente**: tempo inicial, tempo final, passo de máxima.
   - **AC**: tipo de varredura (dec, lin, log), número de pontos por década, frequência inicial e final.
   - **Fourier**: frequência fundamental, número de harmônicos.

> **Dica Pedagógica**: Sempre valide se os modelos SPICE dos componentes estão corretos. Componentes padrão do KiCad podem não incluir ESL/ESR. Use modelos personalizados ou subcircuitos para precisão EMC.

## Modelagem de componentes não ideais no esquemático

Para simulações realistas de EMC, é crucial incluir parasitas:

- **Capacitores**: Inclua ESL e ESR nos modelos SPICE. No KiCad, isso é feito usando modelos SPICE personalizados ou subcircuitos.
- **Indutores**: Inclua capacitância parasita e resistência série.
- **Trilhas como linhas de transmissão**: Use modelos T-line ou delay lines no SPICE.

### Modelo SPICE de capacitor real

Um capacitor real pode ser modelado como:

```
.subckt REAL_CAP C_node E_node
R_esr C_node e1 {ESR}
L_esl e1 e2 {ESL}
C_main e2 E_node {C_val}
.ends REAL_CAP
```

No esquemático do KiCad, você pode usar um componente "SPICE: subcircuit" e vincular este modelo.

## Regras de layout para EMC no PCB Editor

### Planos de referência

- Mantenha um plano de terra contínuo sob trilhas de alta velocidade.
- Evite splits no plano sob trilhas críticas.

### Roteamento de sinais diferenciais

- Mantenha o espaçamento constante entre os pares.
- Roteie o par sobre o mesmo plano de referência.

### Desacoplamento e PDN

- Coloque capacitores de desacoplamento o mais próximo possível dos pinos de alimentação do CI.
- Use vias múltiplas para conectar capacitores aos planos.

## Simulação SPICE integrada no KiCad

O KiCad 8+ inclui um simulador SPICE integrado baseado em Ngspice. Para configurar:

1. No Eeschema, adicione as diretivas SPICE: `SPICE: transient`, `SPICE: ac`, `SPICE: fourier`.
2. Use o menu `Simulação > Simulador SPICE`.

### Simulação transiente para integridade de sinal

Para analisar reflexões e ringing em uma linha de transmissão, modele a linha como uma rede L-C pi ou use linhas de transmissão distribuídas.

**Netlist SPICE de exemplo para linha com reflexões:**

```
* Linha de transmissão modelada como rede L-C
Vsrc src 0 PULSE(0 3.3 0 50p 50p 1n 2n)
Rs src n1 50
* Modelo de linha: L=10nH, C=5pF
L1 n1 n2 10nH
C1 n2 n3 5pF
L2 n3 n4 10nH
C2 n4 0 5pF
Rload n4 0 50
.tran 0.05n 5n
.probe tran V(n4)
.end
```

No KiCad, você pode criar este esquemático usando componentes `R`, `L`, `C` e uma fonte `PULSE`. Execute a simulação transiente e observe a tensão em `n4`: para carga casada ($R_{load}=50\ \Omega$), não deve haver reflexões; para carga aberta, espera-se overshoot.

### Simulação AC para impedância da PDN

Para calcular a impedância da Power Distribution Network (PDN):

1. Crie um esquemático com a fonte de alimentação e os capacitores de desacoplamento.
2. Adicione uma fonte de corrente AC de 1 A entre VCC e GND no ponto de interesse.
3. Configure análise AC: `.ac dec 100 10k 100M`
4. Meça a tensão no nodo VCC: `Z_pdN = V(VCC)/I(Vsrc)`

**Netlist SPICE de exemplo para PDN:**

```
* PDN com capacitores de desacoplamento
Vcc vcc 0 DC 3.3
* Fonte de corrente AC para medição de impedância
Iac vcc 0 AC 1
* Capacitores: 10uF, 100nF, 10nF
C1 vcc gnd 10uF ESL=5nH ESR=50m
C2 vcc gnd 100nF ESL=1nH ESR=30m
C3 vcc gnd 10nF ESL=0.5nH ESR=20m
.ac dec 100 10k 100M
.probe ac V(vcc)
.end
```

> **Insight para Estudantes**: Na simulação AC do KiCad, a impedância é medida como $Z = V/I$. Como $I=1$ A AC, $Z$ em volts é numericamente igual a $Z$ em ohms. Plotando `V(vcc)` em escala logarítmica, você obtém diretamente a magnitude da impedância da PDN.

### Análise de Fourier para emissões espectrais

Para estimar as emissões conduzidas/radiadas a partir de sinais digitais:

1. Execute simulação transiente por vários ciclos em regime estacionário.
2. Adicione diretiva `.four N f0 V(nodo)`, onde `N` é o número de harmônicos e `f0` é a frequência fundamental.

**Exemplo de diretiva Fourier:**

```
.four 100MHz V(clock_node)
```

Isso gera os coeficientes de Fourier no arquivo de saída, permitindo estimar o espectro de emissões.

## Exemplos práticos de simulação no KiCad

### Exemplo: reflexão em linha aberta

**Esquemático SPICE:**

```
Vsrc src 0 PULSE(0 3.3 0 50p 50p 1n 2n)
Rs src n1 50
L1 n1 n2 10nH
C1 n2 0 5pF
Rload n2 0 open
.tran 0.1n 5n
```

No KiCad, use componentes `R`, `L`, `C` e configure a fonte PULSE. Execute a simulação transiente e observe a tensão em `n2`: para carga aberta, espera-se overshoot de 2x (6.6 V) após o atraso de propagação.

### Exemplo: impedância da PDN com múltiplos capacitores

**Configuração:**

- Fonte VCC = 3.3 V.
- Capacitores: 10 µF, 100 nF, 10 nF com ESL e ESR modelados.
- Fonte de corrente AC 1 A entre VCC e GND.

**Resultado esperado:** A impedância deve ser < 50 mΩ na faixa de 100 kHz a 10 MHz, com ressonâncias nas frequências de autorressonância dos capacitores.

## Fluxo de trabalho recomendado para EMC no KiCad

1. **Esquemático**: Inclua modelagem SPICE para componentes críticos.
2. **Simulação pré-layout**: Valide integridade de sinal e PDN com modelos simplificados.
3. **Layout PCB**: Aplique regras de EMC (planos, roteamento, decap).
4. **Extração parasita**: Após o layout, extraia L, C, R parasitas (se o KiCad ou ferramenta externa suportar).
5. **Simulação pós-layout**: Revalide com modelos realistas.

## Limitações das simulações no KiCad

O KiCad SPICE é limitado a modelos de circuito concentrado e linhas de transmissão distribuídas simples. Para:

- Acoplamento capacitivo/indutivo detalhado entre trilhas: use ferramentas de extrator de parasitas (como Q3D Extractor, que se integra ao KiCad).
- Simulação de radiação e antenas: use CST Studio, HFSS ou FEKO.
- Análise de campo próximo 3D: use ferramentas especializadas.

> **Insight para Estudantes**: O KiCad é excelente para a fase inicial de validação de conceitos e para simulações de integridade de sinal e PDN. Para problemas de EMC radiada e acoplamento complexo por campo, o fluxo típico é: KiCad para layout e extração de parasitas, depois ferramenta 3D para análise de campos.

## Código Python — Gerador de netlist SPICE para KiCad

Para facilitar a criação de modelos complexos, um script Python pode gerar netlists SPICE prontas para uso no KiCad:

```python
# generate_spice_netlist.py

def generate_transmission_line_netlist(length_m, z0_ohm, vp_m_s, pulse_amplitude, pulse_tr_ns, file_out='tl_line.sp'):
    """Gera netlist SPICE para linha de transmissão modelada como rede L-C pi."""
    # Parâmetros da linha
    # Z0 = sqrt(L/C), vp = 1/sqrt(LC)
    # L = Z0 / vp, C = 1 / (Z0 * vp)
    L_per_section = z0_ohm / vp_m_s  # H
    C_per_section = 1.0 / (z0_ohm * vp_m_s)  # F
    
    # Número de seções pi (regra prática: >= 5 para precisão)
    n_sections = 5
    L_sec = L_per_section * length_m / n_sections
    C_sec = C_per_section * length_m / n_sections
    
    with open(file_out, 'w') as f:
        f.write(f"* Linha de transmissão: L={length_m}m, Z0={z0_ohm}Ohm, vp={vp_m_s}m/s\n")
        f.write(f"Vsrc src 0 PULSE(0 {pulse_amplitude} 0 {pulse_tr_ns*1e-9} {pulse_tr_ns*1e-9} {2*pulse_tr_ns*1e-9} {10*pulse_tr_ns*1e-9})\n")
        f.write(f"Rs src n1 {z0_ohm}\n")
        
        # Rede L-C pi
        for i in range(n_sections):
            n_in = f"n{i+1}"
            n_mid = f"n{i+2}"
            f.write(f"L{i+1} {n_in} {n_mid} {L_sec*1e9}nH\n")
            if i == 0:
                f.write(f"C{i+1} {n_mid} 0 {C_sec*1e12}pF\n")
            else:
                f.write(f"C{i+1} {n_mid} 0 {C_sec*1e12}pF\n")
        
        f.write(f"Rload n{n_sections+1} 0 {z0_ohm}\n")
        f.write(f".tran 0.01n {10*pulse_tr_ns*1e-9}\n")
        f.write(f".probe tran V(n{n_sections+1})\n")
        f.write(".end\n")
    
    print(f"Netlist gerada: {file_out}")

# Exemplo de uso:
# generate_transmission_line_netlist(length_m=0.3, z0_ohm=50, vp_m_s=2e8, pulse_amplitude=3.3, pulse_tr_ns=0.1)
```

## Interpretação de resultados no simulador do KiCad

Após executar uma simulação no KiCad:

1. **Gráficos Transientes**: Use o visualizador para plotar tensões e correntes. Identifique ringing, overshoot, e tempo de estabilização.
2. **Gráficos AC**: Para impedância da PDN, plotee `V(vcc)` em escala logarítmica. A linha horizontal de `Z_target` (ex: 50 mΩ) deve ser respeitada.
3. **Saída Fourier**: O arquivo de texto gerado contém os coeficientes. Converta dBmV para estimar emissões.

> **Insight para Estudantes**: O simulador do KiCad é baseado em Ngspice, que usa métodos numéricos de integração. Para sinais com bordas muito rápidas (< 10 ps), reduza o passo de simulação máxima e verifique a convergência. Instabilidades numéricas podem gerar oscilações falsas.

## Exercícios práticos com KiCad

**E.1** Monte um esquemático no KiCad com uma fonte PULSE e linha de transmissão modelada como rede L-C. Execute simulação transiente e observe reflexões.

**E.2** Projete uma PDN com 3 capacitores e simule a impedância AC. Verifique se atinge < 50 mΩ na banda desejada.

**E.3** Simule um sinal clock com análise de Fourier e extraia os níveis dos harmônicos para estimar emissões.

**E.4** Use o script Python acima para gerar uma netlist de linha de transmissão e importe no KiCad para simulação.

## Validação cruzada KiCad–Python

Um experimento reproduzível deve usar os mesmos parâmetros em ambos os ambientes. Para um capacitor real,

```spice
* capacitor real: 100 nF, ESR 30 mΩ, ESL 1 nH
V1 in 0 DC 0 AC 1
L_esl in n1 1n
R_esr n1 n2 30m
C_main n2 0 100n
.ac dec 100 1k 1G
.print ac vm(in) mag(v1#branch)
.end
```

Compare $|Z|=|V/I|$ com o cálculo Python de **Comportamento não ideal de componentes**. Critérios mínimos:

- autorressonância dentro de 1% com a mesma discretização;
- assíntotas capacitivas e indutivas com inclinação correta;
- ESR igual ao mínimo de impedância no modelo série;
- análise repetida com passo mais fino.

## Netlist completa — filtro de entrada

```spice
* fonte, filtro LC real e carga
Vsrc src 0 AC 1
Rsrc src n1 5
L1 n1 n2 4.7u
R_L n2 n3 80m
Cpar n1 n3 8p
L_esl n3 n4 1.2n
R_esr n4 n5 30m
C1 n5 0 220n
Rload n3 0 20
.ac dec 100 1k 1G
.print ac vm(n3)
.end
```

Varra ESR, ESL, $Z_S$ e carga. Compare a perda de inserção com a rede ABCD de **Modelagem de problemas EMC**; diferenças indicam topologia ou convenções de porta inconsistentes.

## Critérios de convergência e documentação

Em transiente, limite o passo máximo a uma fração do menor tempo de subida ou atraso relevante e repita com metade do passo. Em AC, refine a malha em ressonâncias. Registre versão do KiCad/ngspice, modelos, opções do solver, condições iniciais e mensagens de convergência.

## Referência principal

Documentação do KiCad Simulation (Ngspice), Guias de Layout para EMC, e práticas de integridade de sinal em projetos open-source.
