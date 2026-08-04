# Introdução ao SPICE para problemas EMC

> SPICE é um simulador de circuitos. Em EMC, ele é especialmente útil para parasitas, filtros, PDN, transientes, linhas de transmissão e proteção de portas. Ele não substitui um solucionador de campos nem um ensaio de conformidade.

Uma das implementações de código aberto mais utilizadas é o [ngspice](https://ngspice.sourceforge.io/), disponível para Linux, macOS e Windows e frequentemente integrado ao KiCad.

## Objetivos de aprendizagem

Ao final, você deve ser capaz de:

1. ler e escrever uma netlist SPICE;
2. escolher análises de ponto de operação, AC, transiente e Fourier;
3. representar componentes reais e caminhos parasitas;
4. usar modelos, subcircuitos, parâmetros e varreduras;
5. verificar passo temporal, convergência e casos-limite;
6. distinguir resultado de circuito, estimativa EMC e conformidade.

## Sumário

1. [O que o SPICE resolve](#o-que-o-spice-resolve)
2. [Anatomia de uma netlist](#anatomia-de-uma-netlist)
3. [Análises fundamentais](#análises-fundamentais)
4. [Componentes reais](#componentes-reais)
5. [Fontes úteis em EMC](#fontes-úteis-em-emc)
6. [Linhas de transmissão](#linhas-de-transmissão)
7. [Parâmetros, varreduras e medidas](#parâmetros-varreduras-e-medidas)
8. [Exemplo completo — impedância de uma PDN](#exemplo-completo--impedância-de-uma-pdn)
9. [Convergência e integridade numérica](#convergência-e-integridade-numérica)
10. [O que SPICE não demonstra](#o-que-spice-não-demonstra)
11. [Protocolo de uma simulação auditável](#protocolo-de-uma-simulação-auditável)
12. [Exercícios](#exercícios)
13. [Referências e compatibilidade](#referências-e-compatibilidade)

## O que o SPICE resolve

SPICE formula as equações do circuito por análise nodal modificada. Resistores, fontes, capacitores, indutores e dispositivos não lineares tornam-se um sistema algébrico ou diferencial. Em forma compacta,

$$
\mathbf C(\mathbf x)\frac{d\mathbf x}{dt}+\mathbf G(\mathbf x)\mathbf x
=\mathbf u(t).
$$

Na análise AC, o circuito é linearizado em torno do ponto de operação e resolvido para cada frequência:

$$
\left(\mathbf G+j\omega\mathbf C\right)\mathbf X=\mathbf U.
$$

Consequentemente, a análise AC não representa saturação harmônica de grande sinal; ela representa a resposta incremental do circuito linearizado.

## Anatomia de uma netlist

Cada elemento ocupa uma linha. O primeiro caractere identifica o tipo; o nó `0` é a referência global.

```spice
* comentário: filtro RC
V1 in 0 DC 0 AC 1
R1 in out 1k
C1 out 0 10n
.ac dec 40 100 10Meg
.print ac vm(out) vp(out)
.end
```

- `V1`: fonte entre `in` e `0`;
- `R1`: resistor entre `in` e `out`;
- `C1`: capacitor entre `out` e `0`;
- `.ac dec 40`: 40 pontos por década, aqui suficientes para localizar o polo de 15,9 kHz;
- `vm` e `vp`: magnitude e fase.

Sufixos comuns incluem `p`, `n`, `u`, `m`, `k`, `meg` e `g`. Em muitas variantes SPICE, `M` significa *milli*, não mega; use `Meg` para evitar ambiguidade.

## Análises fundamentais

### Ponto de operação

`.op` calcula tensões e correntes DC. É indispensável antes de uma análise AC de circuitos com semicondutores, pois define o ponto de linearização.

### Varredura AC

```spice
V1 in 0 DC 0 AC 1
R1 in out 50
L1 out n1 10u
C1 n1 0 100n
Rload n1 0 50
.ac dec 50 1k 10Meg
.print ac vm(n1) vp(n1)
.end
```

Com `AC 1`, a tensão de saída também representa diretamente a função de transferência, desde que a grandeza desejada seja tensão e as portas estejam corretamente definidas.

### Análise transiente

```spice
Vclk in 0 PULSE(0 3.3 0 500p 500p 5n 10n)
Rsrc in line 33
Cload line 0 20p
Rleak line 0 1G
.tran 50p 30n 0 25p
.print tran v(in) v(line)
.end
```

Em `.tran tstep tstop tstart tmax`, `tstep` define o espaçamento solicitado para a saída e `tmax` limita o passo interno máximo. Para capturar uma borda, use inicialmente $t_{max}\le t_r/20$, salve ao menos 10 pontos por borda e repita com metade de `tmax`. Simule apenas os períodos necessários para observar a partida e o regime permanente.

### Fourier e espectro

```spice
.tran 1n 2u 1u 500p
.four 10Meg v(line)
```

Ignore o início transitório antes de analisar regime periódico. Neste exemplo, o período é 100 ns; o trecho salvo após `tstart` contém 10 períodos e a saída tem 100 amostras por período. A diretiva `.four` calcula os harmônicos a partir do período final; uma FFT do visualizador depende da janela temporal, amostragem e número inteiro de períodos.

## Componentes reais

### Capacitor com ESR e ESL

```spice
.subckt CAP_REAL p n params: C=100n ESR=30m ESL=1n
L_esl p x {ESL}
R_esr x y {ESR}
C_main y n {C}
.ends CAP_REAL

Xc out 0 CAP_REAL C=100n ESR=25m ESL=700p
```

A autorressonância ideal do modelo série é

$$
f_{SR}=\frac{1}{2\pi\sqrt{ESL\,C}}.
$$

### Indutor real

```spice
.subckt IND_REAL p n params: L=10u ESR=100m CP=5p
R_esr p x {ESR}
L_main x n {L}
C_par p n {CP}
.ends IND_REAL
```

Acima da ressonância paralela, o componente deixa de se comportar predominantemente como indutor.

### Acoplamento magnético

```spice
Lpri p1 p2 1m
Lsec s1 s2 1m
K1 Lpri Lsec 0.98
```

O coeficiente $k$ define $M=k\sqrt{L_1L_2}$. Para choques de modo comum, mantenha a convenção dos pontos coerente com a soma de fluxo no modo comum.

## Fontes úteis em EMC

### Pulso com bordas finitas

`PULSE(V1 V2 TD TR TF PW PER)` deve sempre declarar tempos de subida e descida realistas. Bordas zero forçam banda infinita e podem gerar resultados numéricos sem significado físico.

### Fonte arbitrária comportamental

```spice
BESD esd 0 V = 8000*(exp(-time/30n)-exp(-time/0.8n))
```

A sintaxe de fontes comportamentais varia entre simuladores. Confirme a documentação e normalize a forma para o pico desejado.

### Excitação por corrente

```spice
Icm chassis 0 PULSE(0 200m 0 1n 5n 5n 1u)
```

Em muitos problemas EMC, fonte de corrente representa melhor $C_p\,dv/dt$ ou uma descarga do que uma fonte ideal de tensão.

## Linhas de transmissão

Quando atraso e reflexão importam, prefira o elemento de linha disponível no simulador:

```spice
V1 src 0 PULSE(0 1 0 100p 100p 5n 10n)
Rsrc src in 50
T1 in 0 out 0 Z0=50 TD=2n
Rload out 0 100
.tran 10p 20n 0 5p
.print tran v(in) v(out)
.end
```

Uma escada LC é útil para ensino ou quando o elemento distribuído não está disponível, mas exige estudo de convergência com o número de seções.

## Parâmetros, varreduras e medidas

```spice
.param Cdec=100n Resr=30m
Xc vcc 0 CAP_REAL C={Cdec} ESR={Resr} ESL=1n
.step param Resr list 10m 30m 100m
.ac dec 60 1k 1G
.meas ac Zmin MIN mag(v(vcc)/i(Vtest))
```

Nem todas as variantes aceitam as mesmas expressões em `.meas` ou `.step`. Para portabilidade, mantenha uma versão de referência e registre o simulador usado.

## Exemplo completo — impedância de uma PDN

```spice
* injeta 1 A AC: V(vcc) numericamente igual a Z_PDN
Itest 0 vcc AC 1
Rleak vcc 0 1G
Rplane vcc n1 2m
Lplane n1 n2 500p
Xbulk n2 0 CAP_REAL C=10u ESR=20m ESL=2n
Xdec  n2 0 CAP_REAL C=100n ESR=30m ESL=600p
.subckt CAP_REAL p n params: C=100n ESR=30m ESL=1n
L_esl p x {ESL}
R_esr x y {ESR}
C_main y n {C}
.ends CAP_REAL
.ac dec 100 100 1G
.print ac vm(vcc)
.end
```

**Verificações:** em baixa frequência, a impedância deve ser capacitiva; nos mínimos, compare ESR; em alta frequência, verifique a inclinação indutiva. Acrescente perdas reais para evitar ressonâncias idealizadas infinitas.

Os 100 pontos por década deste exemplo são deliberados: a PDN pode apresentar mínimos e antirressonâncias mais estreitos que os filtros anteriores. Para exploração inicial, use 30 a 50 pontos por década; refine a banda ao redor dos extremos antes de extrair valores finais.

## Convergência e integridade numérica

Problemas comuns:

- nós flutuantes sem caminho DC;
- fontes ideais incompatíveis em paralelo;
- indutores ideais em série com fontes ideais;
- transições abruptas demais;
- elementos sem perdas formando ressonadores de $Q$ infinito;
- modelos de fabricante fora da faixa válida;
- passo temporal insuficiente.

Tempo de simulação excessivo também é um sintoma de configuração ruim. Em AC, comece com uma malha moderada e refine apenas perto de polos e ressonâncias. Em transiente, escolha `tstop` pelo maior tempo de acomodação ou pelo número de períodos necessário, `tmax` pela dinâmica mais rápida e `tstep` pela resolução realmente necessária no arquivo de saída.

Estratégia de diagnóstico:

1. simplifique até o caso mínimo que converge;
2. confira `.op`;
3. adicione resistências físicas pequenas, não “resistores mágicos” sem registro;
4. refine passo e tolerâncias gradualmente;
5. compare energia, casos-limite e resultado analítico.

## O que SPICE não demonstra

SPICE não calcula automaticamente:

- radiação tridimensional de uma PCB ou cabo;
- campos próximos dependentes da geometria;
- eficácia de gabinete com aberturas complexas;
- acoplamento distribuído sem um modelo fornecido;
- aprovação em ensaio normativo.

Esses efeitos podem entrar como parâmetros extraídos, linhas acopladas, fontes equivalentes ou redes de múltiplas portas. A validade passa a depender da extração.

## Protocolo de uma simulação auditável

Registre:

1. pergunta e decisão de engenharia;
2. versão do simulador;
3. netlist completa e modelos externos;
4. origem e tolerância dos parâmetros;
5. análise, banda, passo e condições iniciais;
6. casos-limite e estudo de convergência;
7. comparação com cálculo ou medição;
8. faixa de validade e limitações.

## Exercícios

**E.1** Simule o filtro RC da seção “Anatomia de uma netlist” e compare $f_c$ com $1/(2\pi RC)$.

**E.2** Varra ESR e ESL do capacitor real; identifique mínimo e autorressonância.

**E.3** Compare uma linha ideal de 2 ns com escadas de 5, 10 e 40 seções.

**E.4** Simule uma carga aberta, casada e em curto; confirme os coeficientes de reflexão.

**E.5** Construa uma PDN com dois capacitores e localize a antirressonância.

**E.6** Modele corrente $C_pdv/dt$ de um nó de comutação para o chassi.

**E.7** Repita um transiente com $t_{max}$, $t_{max}/2$ e $t_{max}/4$ e reporte convergência.

### Respostas orientativas

**E.1** $f_c=1/(2\pi\cdot1\,k\Omega\cdot10\,nF)\approx15{,}9$ kHz; a saída deve estar cerca de −3 dB nesse ponto para fonte ideal e carga infinita.

**E.4** Para linha de 50 Ω: $\Gamma_L=+1$ em aberto, $0$ em 50 Ω e $-1$ em curto.

**E.7** O resultado está numericamente convergido quando as grandezas relevantes mudam menos que a tolerância definida pelo problema, não quando as curvas apenas “parecem iguais”.

## Referências e compatibilidade

Os exemplos usam sintaxe próxima de [ngspice](https://ngspice.sourceforge.io/), uma implementação de código aberto frequentemente integrada ao KiCad. LTspice, PSpice e outros dialetos podem exigir ajustes em fontes comportamentais, parâmetros, medidas e modelos de linha. Consulte sempre a documentação da implementação usada.
