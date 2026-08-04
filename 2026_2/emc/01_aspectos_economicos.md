# Aspectos Econômicos da Compatibilidade Eletromagnética

> Compatibilidade Eletromagnética — Apostila de Curso
> Tópicos: Custos da EMC · Análise de ROI · Normas e Regulamentações · Estudos de Caso · Design-for-EMC · Exercícios em Python (80 horas)

---

## Antes de começar

Ao final, você deve conseguir comparar prevenção, pré-conformidade, redesign, atraso e falha em campo por custo esperado — sem tratar valores ilustrativos como dados universais. **Diagnóstico:** qual decisão muda se a probabilidade de falha cair pela metade, mas o custo de teste dobrar? **Evidência mínima:** explicitar premissas, fazer análise de sensibilidade e justificar uma decisão *design-for-EMC*.

## Sumário

1. [Introdução à EMC e seu Contexto Econômico](#introdução-à-emc-e-seu-contexto-econômico)
2. [Análise de Custos da Compatibilidade Eletromagnética](#análise-de-custos-da-compatibilidade-eletromagnética)
3. [Normas e Regulamentações — Barreiras Comerciais](#normas-e-regulamentações--barreiras-comerciais)
4. [Estudos de Caso: O Custo da Não-Compatibilidade](#estudos-de-caso-o-custo-da-não-compatibilidade)
5. [Estratégias Econômicas de Projeto EMC](#estratégias-econômicas-de-projeto-emc)
6. [Exercícios Resolvidos em Python](#exercícios-resolvidos-em-python)
7. [Lista de Exercícios Propostos](#lista-de-exercícios-propostos)
8. [Gabarito](#gabarito)

---

## Introdução à EMC e seu Contexto Econômico

<!-- slides: break -->

### O que é Compatibilidade Eletromagnética

A **Compatibilidade Eletromagnética (EMC)** é a capacidade de um equipamento ou sistema eletroeletrônico funcionar adequadamente em seu ambiente eletromagnético sem introduzir interferências eletromagnéticas intoleráveis a outros equipamentos nesse mesmo ambiente.

A definição formal do **IEEE Std 100** (Standard Dictionary of Electrical and Electronic Terms) é:

> A capacidade de um equipamento desempenhar sua função sem sofrer degradação por causa de interferências eletromagnéticas produzidas por outros equipamentos, e a capacidade de não produzir interferências eletromagnéticas intoleráveis a outros equipamentos.

Em linguagem mais precisa:

$$
\boxed{\text{EMC} \equiv \text{EMI} + \text{EMS}}
$$

onde:

- **EMI** (*Electromagnetic Interference*) — emissão: a capacidade do equipamento de **não gerar** interferências;
- **EMS** (*Electromagnetic Susceptibility* ou *Immunity*) — imunidade: a capacidade do equipamento de **não ser afetado** por interferências externas.

Um sistema EMC-compatível satisfaz simultaneamente:

$$
E_{\text{emitido}}(f) \leq L_{\text{limite}}(f) \qquad\text{e}\qquad I_{\text{recebido}}(f) < I_{\text{limiar}}(f)
$$

para toda frequência $f$ no domínio de interesse, onde $E_{\text{emitido}}$ é o espectro de emissão, $L_{\text{limite}}$ é o limite regulatório, $I_{\text{recebido}}$ é o nível de interferência acoplado ao sistema e $I_{\text{limiar}}$ é o limiar de degradação funcional.

### Por que EMC é um Problema Econômico

A EMC não é apenas uma questão técnica — é uma **variável econômica crítica** que afeta diretamente:

1. **Recalls de produtos**: quando um produto certificado falha em campo, o custo de recall pode exceder em ordens de grandeza o investimento original em projeto EMC.
2. **Multas regulatórias**: agências como a FCC (EUA), ANATEL (Brasil) e a Comissão Europeia aplicam multas significativas por não-conformidade.
3. **Atrasos de lançamento**: cada trimestre de atraso no *time-to-market* representa perda de receita potencial e vantagem competitiva.
4. **Custo de garantia**: falhas de EMC em campo geram chamados de suporte, devoluções e danos à marca.

**Modelo didático, não lei empírica universal:** correções tardias tendem a envolver mais artefatos, estoque e cronograma. Uma curva exponencial pode representar essa ideia:

$$
C_{\text{corr}}(t) = C_0 \cdot e^{k(t-t_0)}
$$

onde $C_0$ é o custo inicial, $k$ é parâmetro a ser **calibrado com dados da organização** e $t_0$ é a referência. Não trate “fase” como unidade física nem use uma faixa genérica de $k$ como previsão.

### Custo do *Compliance* vs. Custo do Não-*Compliance*

Defina:

- $C_{\text{comp}}$ = custo total de conformidade EMC (projeto + teste + certificação)
- $C_{\text{não-comp}}$ = custo esperado de não-conformidade (multas + recalls + perda de receita + reputação)

A decisão econômica ótima satisfaz:

$$
\boxed{C_{\text{comp}}^{*} = \arg\min_{C_{\text{comp}}} \bigl[C_{\text{comp}} + \mathbb{E}[C_{\text{não-comp}} \mid \text{nível de compliance alcançado por } C_{\text{comp}}]\bigr]}
$$

Tabela de cenários ilustrativos para análise de sensibilidade:

| Fase do Projeto | Custo Relativo de Correção | Fator de Multiplicação |
|---|---|---|
| Conceito / Especificação | $1\times$ (base) | 1,0 |
| Projeto Conceitual | $2\text{--}3\times$ | $2\text{--}3$ |
| Projeto Detalhado | $5\text{--}10\times$ | $5\text{--}10$ |
| Protótipo | $10\text{--}50\times$ | $10\text{--}50$ |
| Pré-produção | $50\text{--}100\times$ | $50\text{--}100$ |
| Produção / Campo | $100\text{--}1000\times$ | $100\text{--}1000$ |

**Observação:** sem fonte e base de dados do projeto, esses multiplicadores são hipóteses. Substitua-os por faixas otimista/base/pessimista e registre moeda, ano-base, volume e itens incluídos.

### Ciclo de Vida do Produto e Onde a EMC Entra

O ciclo de vida de um produto eletroeletrônico típico compreende as seguintes fases:

$$
\text{Conceito} \to \text{Projeto Conceitual} \to \text{Projeto Detalhado} \to \text{Protótipo} \to \text{Validação} \to \text{Certificação} \to \text{Produção} \to \text{Campo} \to \text{Pós-venda}
$$

A EMC deve ser considerada em **cada fase**, com diferentes níveis de profundidade:

1. **Conceito**: definição dos requisitos EMC (normas aplicáveis, limites, nível de ambiente).
2. **Projeto Conceitual**: escolha de arquitetura, topologias de blindagem, técnicas de filtração.
3. **Projeto Detalhado**: layout de PCB, projeto de gabinetes, especificação de componentes de supressão.
4. **Protótipo**: medições preliminares, identificação de problemas, correções.
5. **Validação**: testes de conformidade em laboratório acreditado, ajustes finos.
6. **Certificação**: submissão a organismo notificado, obtenção de marcação.
7. **Produção**: controle de qualidade EMC, testes de lote.
8. **Campo**: monitoramento de falhas, feedback para próximas iterações.

$$
\boxed{\text{Investimento em EMC na fase } t \propto \frac{1}{\text{Margem de correção disponível em } t}}
$$

Quanto mais cedo a EMC é considerada, maior a margem de correção disponível e menor o custo.

---

## Análise de Custos da Compatibilidade Eletromagnética

### Custo de Projeto Preventivo

O **custo de projeto preventivo** inclui todas as atividades realizadas antecipadamente para garantir a compatibilidade eletromagnética:

$$
C_{\text{design}} = C_{\text{consultoria}} + C_{\text{ferramentas}} + C_{\text{treinamento}} + C_{\text{simulação}} + C_{\text{componentes}}
$$

onde:

- $C_{\text{consultoria}}$: engenheiros de EMC dedicados ao projeto.
- $C_{\text{ferramentas}}$: softwares de simulação (SI/PI/EMC), instrumentação.
- $C_{\text{treinamento}}$: qualificação da equipe de projeto.
- $C_{\text{simulação}}$: horas de simulação EM (FDTD, FEM, Method of Moments).
- $C_{\text{componentes}}$: filtros, blindagens, materiais absorventes, conectores blindados.

Para um produto eletrônico de porte médio, estimativas típicas:

$$
C_{\text{design}} \approx \alpha \cdot P_{\text{base}}
$$

onde $P_{\text{base}}$ é o custo base do projeto (sem EMC) e $\alpha$ é um fator de acréscimo que varia entre $3\%$ e $15\%$, dependendo do setor e dos requisitos.

**Valor típico de $\alpha$ por setor**:

| Setor | $\alpha_{\min}$ | $\alpha_{\max}$ | Comentário |
|---|---|---|---|
| Consumidor | 3% | 7% | Limites mais brandos, volumes altos |
| Industrial | 7% | 12% | Ambiente hostil, requisitos rigorosos |
| Automotivo | 10% | 18% | VDA 5083, ISO 11452, volumes enormes |
| Médico | 10% | 20% | IEC 60601-1-2, risco de vida |
| Aeroespacial | 12% | 25% | MIL-STD-461, custo de falha extremo |

### Custo de Correção e a Curva Exponencial

O **custo de correção** $C_{\text{corr}}$ é o custo adicional necessário quando um problema de EMC é identificado após o ponto ideal de correção. A dependência temporal segue um modelo exponencial:

$$
\boxed{C_{\text{corr}}(t) = C_{\text{corr}}(t_0) \cdot e^{k(t - t_0)}}
$$

Onde $t_0$ é a fase de conceito e $k$ é o parâmetro de "inflação de custo":

- Produtos simples: $k \approx 0{,}8$ por fase
- Produtos complexos: $k \approx 1{,}5\text{--}2{,}0$ por fase
- Sistemas integrados (SoC + RF + mecânica): $k \approx 2{,}0\text{--}3{,}0$ por fase

A **razão de correção** $R(t)$, definida como o custo de corrigir na fase $t$ dividido pelo custo de prevenir na fase $t_0$, é:

$$
R(t) = \frac{C_{\text{corr}}(t)}{C_{\text{design}}} = e^{k(t-t_0)}
$$

Para um produto com $k=1{,}5$ descoberto na fase de protótipo ($t-t_0 = 3$ fases):

$$
R(3) = e^{1{,}5 \times 3} = e^{4{,}5} \approx 90
$$

Ou seja, corrigir no protótipo custa ~90× mais que prevenir no conceito.

### Modelo de Custo Total

O **custo total de EMC** para um produto ao longo de seu ciclo de vida é modelado por:

$$
\boxed{C_{\text{total}} = C_{\text{design}} + C_{\text{test}} + C_{\text{corr}} + C_{\text{failure}}}
$$

Onde cada componente é definido a seguir.

#### Custo de teste ($C_{\text{test}}$)

Inclui todos os custos de medição e certificação:

$$
C_{\text{test}} = C_{\text{pre-test}} + C_{\text{cert-test}} + C_{\text{re-test}} + C_{\text{ongoing}}
$$

- $C_{\text{pre-test}}$: testes de pré-conformidade em laboratório interno ou terceirizado.
- $C_{\text{cert-test}}$: testes de certificação em organismo acreditado (FCC, CE, etc.).
- $C_{\text{re-test}}$: retestes após correções.
- $C_{\text{ongoing}}$: testes de produção (Q.C.) em linha.

Estimativas típicas:

| Tipo de Teste | Custo Unitário (USD) | Frequência |
|---|---|---|
| Pré-teste interno | 5.000 -- 15.000 | 2--5 vezes |
| Certificação FCC | 10.000 -- 30.000 | 1 vez |
| Certificação CE/CISPR | 15.000 -- 40.000 | 1 vez |
| Teste de conformidade automotiva | 20.000 -- 60.000 | 1--3 vezes |
| Teste de linha de produção | 500 -- 2.000 / unidade | Cada unidade |

#### Custo de falha ($C_{\text{failure}}$)

O custo esperado de falha de EMC em campo é modelado como:

$$
C_{\text{failure}} = N \cdot p_f \cdot c_f
$$

Onde:

- $N$ = número de unidades vendidas
- $p_f$ = probabilidade de falha de EMC em campo
- $c_f$ = custo médio por falha (garantia + suporte + reputação)

A probabilidade $p_f$ é função do esforço de projeto e teste:

$$
p_f = p_0 \cdot e^{-\beta \cdot E}
$$

onde $p_0$ é uma probabilidade-base, $E$ deve ter unidade declarada e $\beta$ deve ter unidade inversa para que $\beta E$ seja adimensional. A exponencial é uma hipótese de resposta, a ser calibrada; investimento financeiro sozinho não determina probabilidade técnica.

#### Modelo completo

Substituindo:

$$
\boxed{C_{\text{total}}(E) = \underbrace{\alpha \cdot P_{\text{base}}}_{C_{\text{design}}(E)} + \underbrace{C_{\text{test}}(E)}_{\text{testes}} + \underbrace{C_{\text{corr}}(E)}_{\text{correções}} + \underbrace{N \cdot p_0 \cdot e^{-\beta E} \cdot c_f}_{C_{\text{failure}}(E)}}
$$

O ótimo de investimento $E^{*}$ satisfaz:

$$
\frac{dC_{\text{total}}}{dE}\bigg|_{E=E^{*}} = 0
$$

### ROI de Investimento em EMC

O **Retorno sobre Investimento (ROI)** de um programa EMC é definido como:

$$
\boxed{\text{ROI} = \frac{B - C}{C} \times 100\%}
$$

Onde:

- $C = C_{\text{design}} + C_{\text{test}}$ = investimento total em EMC
- $B = \mathbb{E}[C_{\text{failure}\, \text{sem EMC}}] - \mathbb{E}[C_{\text{failure}\, \text{com EMC}}]$ = benefícios (custos de falha evitados)

$$
B = N \cdot c_f \cdot p_0 \cdot (1 - e^{-\beta E})
$$

Logo:

$$
\boxed{\text{ROI} = \frac{N \cdot c_f \cdot p_0 \cdot (1 - e^{-\beta E}) - E}{E} \times 100\%}
$$

**Exemplo numérico**: Para um dispositivo médico ($N = 10.000$ unidades, $c_f = 50.000$ USD/falha, $p_0 = 0{,}10$, $\beta = 0{,}10$/USD$k$, $E = 200$k USD):

$$
B = 10000 \times 50000 \times 0{,}10 \times (1 - e^{-0{,}10 \times 200}) = 50.000.000 \times (1 - e^{-20})
$$

$$
B \approx 50.000.000 \times (1 - 2{,}06\times10^{-9}) \approx 50.000.000\ \text{USD}
$$

$$
\text{ROI} = \frac{50.000.000 - 200.000}{200.000} \times 100\% = \frac{49.800.000}{200.000} \times 100\% = 24.900\%
$$

**Interpretação:** o ROI enorme é consequência direta de supor 1.000 falhas esperadas a 50 mil USD cada e quase eliminação total por uma exponencial não calibrada. É um cenário, não evidência de ROI típico. Faça sensibilidade em $p_0,c_f,\beta$ e dependência/correlação das falhas.

### Valor Presente Líquido de Investimentos EMC

Quando custos e benefícios se distribuem ao longo do tempo, usamos o **valor presente** (VP):

$$
\boxed{PV = \frac{FV}{(1+r)^n}}
$$

Onde $FV$ é o valor futuro, $r$ a taxa de desconto e $n$ o número de períodos.

O **Valor Presente Líquido (VPL)** do programa EMC:

$$
\boxed{\text{VPL}=-C_0+\sum_{t=1}^{T}\frac{B_t-C_t}{(1+r)^t}}
$$

onde $C_0$ fica fora da soma e $B_t,C_t$ são fluxos posteriores. Alternativamente, inclua $t=0$ na soma e não subtraia $C_0$ outra vez.

Condição de viabilidade: $\text{VPL} > 0$.

---

## Normas e Regulamentações — Barreiras Comerciais

### Panorama Global de Normas EMC

A conformidade EMC é **requisito legal** para comercialização na maioria dos países. O panorama normativo é fragmentado por região:

#### Estados Unidos — FCC

A **Federal Communications Commission (FCC)** regula emissões eletromagnéticas nos EUA. As partes relevantes são:

- **47 CFR Part 15**: equipamentos digitais e transmissores无意 (intentional/unintentional radiators).
  - Seção 15.107: limites de campo irradiado e conduzido para equipamentos digitais.
  - Seção 15.209: limites de campo irradiado acima de 1 GHz.

Os limites de condução (exemplo, classe A — comercial/industrial):

$$
\boxed{20\log_{10}\!\left(\frac{V_{\text{ruído}}}{1\,\mu\text{V}}\right) \leq 79 - 20\log_{10}(f_{\text{MHz}})\quad\text{para }0{,}15\leq f \leq 0{,}5\,\text{MHz}}
$$

$$
\boxed{73\ \text{dB}\mu\text{V}\quad\text{para }0{,}5 < f \leq 5\,\text{MHz}}
$$

$$
\boxed{73 - 10\log_{10}\!\left(\frac{B}{1\,\text{kHz}}\right)\ \text{dB}\mu\text{V}\quad\text{para }5 < f \leq 30\,\text{MHz}}
$$

Classe B (residencial) é ~20--30 dB mais restritiva.

#### Europa — CE / CISPR

A marca **CE** exige conformidade com as diretivas europeias, harmonizadas por normas **CISPR** (Comité International Spécial des Perturbations Electriques) e **IEC**:

- **CISPR 32**: multimídia equipment — emissões.
- **CISPR 35**: equipamentos de TI e áudio/vídeo — emissões e imunidade.
- **IEC 61000-6-2**: imunidade para ambiente industrial.
- **IEC 61000-6-4**: emissões para ambiente industrial.

O limite CISPR 32 Classe A de radiação (campo próximo, 10 m):

$$
\boxed{E(f) \leq
\begin{cases}
30\ \text{dB}\mu\text{V/m} & 30\leq f < 230\,\text{MHz} \\
37\ \text{dB}\mu\text{V/m} & 230\leq f < 1000\,\text{MHz}
\end{cases}}
$$

#### Normas Internacionais — IEC / ANSI

O **IEC** (International Electrotechnical Commission) publica a série **IEC 61000** (Compatibilidade Eletromagnética), base para a maioria das normas nacionais:

- **IEC 61000-4-x**: série de normas de ensaio de imunidade (estático, surto, fast burst, surge, etc.).
- **IEC 61000-3-x**: limites de emissão em redes de baixa tensão.

Nos EUA, o **ANSI** adota versões das normas IEC/CISPR:

- **ANSI C63.19**: procedimento de medição de exposição a campos RF.
- **ANSI/IEEE 299**: procedimentos de medição de blindagem.

### Conformidade como Requisito de Mercado

A conformidade EMC funciona como **barreira de entrada** e **requisito de acesso** ao mercado:

$$
\boxed{\text{Acesso}_m = \prod_{r \in \mathcal{R}_m} \mathbb{I}[\text{conforme}_r]}
$$

Onde $\mathcal{R}_m$ é o conjunto de regiões onde o produto $m$ pretende ser comercializado e $\mathbb{I}[\cdot]$ é a função indicadora (1 se conforme, 0 se não).

**Implicação**: para vender em $n$ regiões com requisitos EMC diferentes, o produto deve satisfazer **todas** simultaneamente. Isso impõe:

$$
L_{\text{efetivo}}(f) = \min_{r \in \mathcal{R}_m} L_{r}(f)
$$

Ou seja, o limite efetivo é o **mais restritivo** entre todas as regiões — o que pode exigir projeto significativamente mais custoso do que o mínimo necessário para uma única região.

### Custo de Certificação por Região

Custos estimados de certificação EMC (USD):

| Região | Órgão / Marcas | Custo Estimado | Prazo |
|---|---|---|---|
| EUA | FCC (DoC ou TCB) | 10.000 -- 50.000 | 2--8 semanas |
| Europa | CE (Notified Body) | 15.000 -- 60.000 | 4--12 semanas |
| Japão | VCCI / TELEC | 8.000 -- 30.000 | 3--8 semanas |
| China | CCC | 12.000 -- 40.000 | 4--10 semanas |
| Coréia | KC | 8.000 -- 25.000 | 3--6 semanas |
| Brasil | ANATEL | 5.000 -- 20.000 | 4--8 semanas |
| Canadá | IC | 8.000 -- 30.000 | 3--8 semanas |

**Custo total para acesso global simultâneo**: tipicamente 50.000 -- 200.000 USD, sem incluir retestes e adequações de projeto.

### Exemplo: Produto Multirregional

Considere um dispositivo IoT com destino a EUA, Europa e Ásia. Requisitos EMC:

| Norma | Limite Condução (150 kHz -- 30 MHz) | Limite Radiação (30 MHz -- 1 GHz) |
|---|---|---|
| FCC Class B | 40 dBµV | 30 dBµV/m (3 m) |
| CISPR 32 Class B | 30 dBµV (média) | 24 dBµV/m (10 m) |
| VCCI Class B | 30 dBµV | 24 dBµV/m (30 m) |

Limite efetivo (o mais restritivo):

$$
L_{\text{efetivo, conduzido}} = 30\ \text{dB}\mu\text{V}, \qquad L_{\text{efetivo, irradiado}} = 24\ \text{dB}\mu\text{V/m}
$$

Comparado ao FCC Class B (40/30 dB), o projeto deve atender **10 dB** a mais de margem para condução e **6 dB** para radiação, o que exige:

- Blindagem adicional: custo $+C_{\text{blindagem}} \approx 5.000\text{--}20.000$ USD
- Filtros de entrada mais rigorosos: custo $+C_{\text{filtro}} \approx 2.000\text{--}10.000$ USD
- PCB com camadas de terra dedicadas: custo $+C_{\text{PCB}} \approx 3.000\text{--}15.000$ USD

---

## Estudos de Caso: O Custo da Não-Compatibilidade

### Caso 1: Recall de Veículo por Interferência em Sistema de Freio

**Contexto**: fabricante de veículos elétricos identifica falhas intermitentes no sistema de freio eletrónico (EBS) quando o veículo opera próximo a estações de telecomunicações de alta potência (torres 5G).

**Causa raiz**: acoplamento de RF de 3,5 GHz no fio de comunicação CAN bus do sistema de freio. A blindagem do cabo não atendia ao requisito CISPR 12 / ISO 11452-4.

**Análise financeira**:

$$
N = 85.000 \text{ unidades} \quad (\text{produzidas em 3 anos})
$$

$$
p_f = 0{,}02 \quad (\text{2\% das unidades apresentam falha})
$$

$$
c_{\text{recall\_unit}} = 1.200\ \text{USD} \quad (\text{revisão do cabeamento + teste})
$$

$$
C_{\text{recall}} = N \cdot p_f \cdot c_{\text{recall\_unit}} = 85000 \times 0{,}02 \times 1200
$$

$$
\boxed{C_{\text{recall}} = 2.040.000\ \text{USD}}
$$

Custos adicionais:

- Custos legais: $\approx 500.000$ USD
- Perda de reputação (estimada por queda de 2% nas vendas do ano seguinte): $\approx 15.000.000$ USD
- Multa regulatória (NCAP): $\approx 1.000.000$ USD

**Custo total do incidente**: $\approx 18.540.000$ USD

**Custo preventivo que teria evitado o problema**: teste CISPR 11452-4 no protótipo $\approx 30.000$ USD, mais blindagem adequada no projeto $\approx 50.000$ USD.

$$
\boxed{\text{Razão custo/custo-preventivo} = \frac{18.540.000}{80.000} \approx 232}
$$

### Caso 2: Multa FCC — Exemplo com Números Reais

**Contexto**: fabricante de equipamentos de rede Wi-Fi comercializa produto sem certificação FCC, alegando "uso interno corporativo" para burlar a exigência de certificação Part 15.

**Violação**: emissões conduzidas acima do limite da Seção 15.107 na faixa de 150 kHz -- 30 MHz, interferindo com serviços de rádio amador.

**Multa aplicada** (exemplo baseado em casos reais):

$$
\boxed{M_{\text{FCC}} = 117.000\ \text{USD por infração} \times 12\ \text{infrações} = 1.404.000\ \text{USD}}
$$

Custos adicionais:

- Produto recolhido do mercado: $\approx 300.000$ USD em estoque obsoleto
- Retrabalho para certificação: $\approx 50.000$ USD
- Perda de receita durante o período de proibição de venda (6 meses): $\approx 2.000.000$ USD

$$
\boxed{C_{\text{total}} = 1.404.000 + 300.000 + 50.000 + 2.000.000 = 3.754.000\ \text{USD}}
$$

**Custo da certificação adequada teria sido**: $\approx 30.000$ USD.

$$
\boxed{\text{Razão} = \frac{3.754.000}{30.000} \approx 125}
$$

### Caso 3: Atraso de Lançamento de Dispositivo Médico

**Contexto**: dispositivo de monitoramento cardíaco implantável enfrenta falhas de imunidade aos testes de certificação IEC 60601-1-2. Necessidade de redesenho completo do gabinete blindado.

**Impacto temporal**: atraso de 8 meses no lançamento.

**Análise de valor presente do atraso**:

$$
R_{\text{mensal}} = 500.000\ \text{USD/mês} \quad (\text{receita projetada})
$$

$$
r = 0{,}08\ \text{ano}^{-1} \quad \Rightarrow \quad r_{\text{mensal}} = (1{,}08)^{1/12}-1 \approx 0{,}00643
$$

$$
PV_{\text{atraso}} = R_{\text{mensal}} \sum_{k=1}^{8} \frac{1}{(1+r_{\text{mensal}})^k}
$$

$$
PV_{\text{atraso}} = 500.000 \cdot \frac{1 - (1{,}00643)^{-8}}{0{,}00643} \approx 500.000 \cdot 7{,}584 \approx 3.792.000\ \text{USD}
$$

Custos de redesenho:

- Redesenho do gabinete blindado: $\approx 150.000$ USD
- Novos protótipos: $\approx 80.000$ USD
- Re-testes de certificação: $\approx 40.000$ USD

$$
\boxed{C_{\text{total}} = 3.792.000 + 150.000 + 80.000 + 40.000 = 4.062.000\ \text{USD}}
$$

**Custo preventivo**: simulação EMC no projeto conceitual $\approx 50.000$ USD + teste de pré-conformidade $\approx 30.000$ USD.

$$
\boxed{\text{Razão} = \frac{4.062.000}{80.000} \approx 50{,}8}
$$

### Síntese dos Estudos de Caso

| Caso | Custo Total | Custo Preventivo | Razão |
|---|---|---|---|
| Recall veicular | 18.540.000 USD | 80.000 USD | ~232× |
| Multa FCC | 3.754.000 USD | 30.000 USD | ~125× |
| Atraso médico | 4.062.000 USD | 80.000 USD | ~51× |

**Média ponderada**: fator de 50--230× entre o custo corretivo e o preventivo.

---

## Estratégias Econômicas de Projeto EMC

### Design-for-EMC: Economia Preventiva

O **Design-for-EMC (DfEMC)** é a filosofia de incorporar soluções de compatibilidade eletromagnética desde as fases iniciais do projeto, minimizando custos de correção.

Princípios fundamentais do DfEMC:

1. **Separação de domínios**: manter caminhos de retorno de corrente curtos e controlados.
2. **Camadas de guarda**: usar planos de terra contínuos como escudo entre sinais sensíveis e ruidosos.
3. **Filtragem na entrada**: filtrar todo sinal que atravessa o limite do sistema.
4. **Blindagem estratégica**: blindar apenas as áreas críticas, não todo o sistema.
5. **Isolamento galvânico**: usar isoladores ópticos ou transformadores para romper laços de terra.

O benefício econômico do DfEMC é quantificado pela **economia preventiva líquida**:

$$
\boxed{E_{\text{preventiva}} = C_{\text{corr, evitada}} - C_{\text{design}}}
$$

Onde $C_{\text{corr, evitada}}$ é o custo de correção que não ocorreu porque o problema foi antecipado.

### Análise de *Trade-off*: Blindagem vs. Custo vs. Peso

A escolha de uma estratégia de blindagem envolve um **problema de otimização multivariável**:

$$
\boxed{\min_{t,\,m}\;\; C_{\text{blindagem}}(t,m) + \lambda_1 \cdot W(t,m) + \lambda_2 \cdot R(t,m)}
$$

Sujeito a:

$$
S(f, t, m) \geq S_{\text{requisito}}(f) \qquad \forall f \in [f_{\min},\,f_{\max}]
$$

Onde:

- $t$ = espessura do material de blindagem
- $m$ = tipo de material (condutividade $\sigma$, permeabilidade $\mu$)
- $W(t,m)$ = peso da blindagem
- $R(t,m)$ = complexidade de fabricação
- $\lambda_1, \lambda_2$ = pesos de otimização
- $S(f,t,m)$ = atenuação da blindagem

A **atenuação de blindagem** de uma parede plana é composta por três termos:

$$
\boxed{SE_{\text{total}} = R + A + M}
$$

Onde:

- **Reflexão** ($R$):
  $$
  R = 168 + 10\log_{10}\!\left(\frac{\sigma}{f \cdot \mu_r^3}\right)\ \text{dB}\qquad\text{(campo plano, fonte distante)}
  $$

- **Absorção** ($A$):
  $$
  A = 3{,}95 \cdot t \cdot \sqrt{f \cdot \mu_r \cdot \sigma}\ \text{dB} = \frac{t}{\delta} \cdot 8{,}686\ \text{dB}
  $$
  onde $\delta = \sqrt{\dfrac{2}{\omega \mu \sigma}}$ é a profundidade de pele.

- **Múltiplas reflexões** ($M$):
  $$
  M = 20\log_{10}\!\left|1 - 10^{(R/20)}\right|\ \text{dB}\qquad\text{(correção para }SE < 60\,\text{dB)}
  $$

**Exemplo de trade-off**: Para atingir 60 dB de atenuação a 100 MHz em alumínio ($\sigma = 3{,}5\times10^7\ \text{S/m}$, $\mu_r=1$):

Profundidade de pele:

$$
\delta = \sqrt{\frac{2}{2\pi \cdot 10^8 \cdot 4\pi\times10^{-7} \cdot 3{,}5\times10^7}} = \sqrt{\frac{2}{8{,}698\times10^{10}}} \approx 4{,}79\times10^{-6}\,\text{m} = 4{,}79\,\mu\text{m}
$$

Componente de absorção necessária: $A \approx 60\ \text{dB}$ (desprezando $R$, que para alumínio a 100 MHz é $\approx 25$ dB):

$$
t = \frac{A}{8{,}686} \cdot \delta = \frac{60}{8{,}686} \times 4{,}79 \approx 33{,}1\,\mu\text{m}
$$

Na prática, considera-se $R \approx 25$ dB, então $A$ necessária é $\approx 35$ dB:

$$
t = \frac{35}{8{,}686} \times 4{,}79 \approx 19{,}3\,\mu\text{m} \approx 0{,}02\,\text{mm}
$$

Espessura comercial mínima de chapa de alumínio: $0{,}5\,\text{mm}$. Assim, a espessura de 0,5 mm oferece:

$$
A = 3{,}95 \times 0{,}5 \times \sqrt{10^8 \times 1 \times 3{,}5\times10^7} \approx 3{,}95 \times 0{,}5 \times 59.161 \approx 116{,}8\ \text{dB}
$$

**Conclusão**: a blindagem por absorção em alumínio a 100 MHz é superabundante para 60 dB. O fator limitante é a **reflexão** (25 dB) e, mais importante, as **fendas e aberturas**. Para atingir 60 dB, é necessário tratar as fendas (vedação por contato metálico, malhas condutoras).

### Decisão *Build-vs-Buy* para Módulos Certificados

Quando um subsistema (ex.: módulo RF) pode ser comprado já certificado, a decisão entre desenvolver internamente (*build*) ou comprar (*buy*) deve considerar:

$$
C_{\text{build}} = C_{\text{desenv}} + C_{\text{test}} + C_{\text{corr}} + C_{\text{cert}}
$$

$$
C_{\text{buy}} = P_{\text{módulo}} + C_{\text{integr}} + C_{\text{test}}'
$$

A condição para *buy* ser economicamente viável:

$$
\boxed{P_{\text{módulo}} + C_{\text{integr}} + C_{\text{test}}' < C_{\text{desenv}} + C_{\text{corr}} + C_{\text{cert}}}
$$

**Fatores qualitativos** que favorecem *buy*:

- Ciclo de desenvolvimento curto (time-to-market crítico).
- Complexidade EMC elevada (requer expertise específica).
- Módulos repetíveis em vários produtos (economia de escala).
- Risco regulatório alto (produto em área médica/aeroespacial).

**Fatores qualitativos** que favorecem *build*:

- Volume alto (custo unitário do módulo certificado é proibitivo).
- Requisitos EMC muito específicos (módulos comerciais não atendem).
- Estratégia de propriedade intelectual.

### Planejamento de Orçamento EMC por Fase

Um **orçamento EMC** bem estruturado distribui recursos ao longo das fases do projeto:

| Fase | % do Orçamento EMC Total | Atividades |
|---|---|---|
| Conceito | 5% | Análise de requisitos, seleção de normas |
| Projeto Conceitual | 15% | Simulação EMC, análise de trade-off, seleção de tecnologias |
| Projeto Detalhado | 25% | Layout de PCB, projeto de blindagem, especificação de filtros |
| Protótipo | 20% | Pré-testes, identificação de problemas, primeiras correções |
| Validação | 15% | Retestes, ajustes finos, documentação de conformidade |
| Certificação | 10% | Testes em organismo acreditado |
| Produção | 5% | Controle de qualidade EMC em linha |
| Reserva (contingência) | 5% | Correções imprevistas |

**Regra prática**: se mais de 30% do orçamento EMC for gasto na fase de protótipo ou posterior, o projeto DfEMC não foi efetivo.

---

## Exercícios Resolvidos em Python

### Protocolo computacional

**Objetivo:** comparar custo preventivo, risco esperado, ROI e cronograma. **Hipóteses:** identifique valores ilustrativos, fontes e moeda/data-base. **Validação:** faça análise de sensibilidade; um ótimo econômico sem faixas de incerteza não deve ser tratado como previsão.

### Curva de Custo de Correção ao Longo do Ciclo de Vida

```python
import numpy as np
import matplotlib.pyplot as plt

# Fases do projeto (índices)
fases = np.arange(7)
nome_fases = ["Conceito", "Proj.\nConceitual", "Proj.\nDetalhado", "Protótipo",
              "Validação", "Certificação", "Produção"]

# Modelo exponencial: C_corr(t) = C0 * exp(k * t)
C0 = 1.0  # custo normalizado na fase de conceito
k = 1.5   # taxa de crescimento

C_corr = C0 * np.exp(k * fases)

fig, ax = plt.subplots(figsize=(9, 5))
ax.plot(fases, C_corr, "o-", color="#dc2626", markersize=8, linewidth=2, label="$C_{corr}(t) = C_0\\,e^{kt}$, $k=1{,}5$")
ax.set_xticks(fases)
ax.set_xticklabels(nome_fases, fontsize=9)
ax.set_ylabel("Custo Relativo de Correção", fontsize=11)
ax.set_xlabel("Fase do Projeto", fontsize=11)
ax.set_title("Crescimento Exponencial do Custo de Correção EMC", fontsize=13, weight="bold")
ax.set_yscale("log")
ax.grid(True, alpha=0.3, which="both")
ax.legend(fontsize=10)

# Adicionar anotações dos multiplicadores
for i, (f, c) in enumerate(zip(fases, C_corr)):
    ax.annotate(f"$\\times{c:,.0f}$", (f, c), textcoords="offset points",
                xytext=(0, 12), ha="center", fontsize=8)

plt.tight_layout()
```

**Resultado esperado**: gráfico logarítmico mostrando crescimento exponencial do custo relativo de correção, multiplicadores de 1× a ~600× ao longo do ciclo de vida.

### Curva de Otimização de Investimento EMC

```python
import numpy as np
import matplotlib.pyplot as plt

# Parâmetros do modelo
N = 10000       # unidades
c_f = 50000     # custo por falha (USD)
p_0 = 0.10      # probabilidade base de falha
beta = 0.05     # eficácia (por USD*k)
P_base = 500000 # custo base do projeto (USD)
alpha = 0.08    # fator de acréscimo EMC
C_test_base = 25000  # custo base de teste (USD)

# Faixa de investimento EMC
E = np.linspace(10, 400, 500)  # USD*k

# Componentes de custo
C_design = alpha * P_base * (E / 200)  # proporcional ao investimento
C_test = C_test_base * (E / 200)
C_failure = N * c_f * p_0 * np.exp(-beta * E)
C_total = C_design + C_test + C_failure

# Encontrar ótimo
E_opt = E[np.argmin(C_total)]
C_min = C_total.min()

fig, ax = plt.subplots(figsize=(9, 5))
ax.plot(E, C_design, label="$C_{design}$", color="#3b82f6", linewidth=1.5)
ax.plot(E, C_test, label="$C_{test}$", color="#10b981", linewidth=1.5, linestyle="--")
ax.plot(E, C_failure, label="$C_{failure}$", color="#f59e0b", linewidth=1.5, linestyle="--")
ax.plot(E, C_total, "k-", linewidth=2.5, label="$C_{total}$")

ax.axvline(E_opt, color="#dc2626", linestyle=":", label=f"Ótimo: ${E_opt:,.0f}$k")
ax.axhline(C_min, color="#dc2626", linestyle=":", alpha=0.5)
ax.plot(E_opt, C_min, "r*", markersize=15, label=f"VPL mínimo: ${C_min:,.0f}")

ax.set_xlabel("Investimento em EMC (USD k)", fontsize=11)
ax.set_ylabel("Custo (USD)", fontsize=11)
ax.set_title("Curva de Otimização de Investimento EMC", fontsize=13, weight="bold")
ax.set_xlim(0, 400)
ax.legend(fontsize=9, loc="upper right")
ax.grid(True, alpha=0.3)

plt.tight_layout()
```

### Análise Comparativa de ROI para Diferentes Estratégias

```python
import numpy as np
import matplotlib.pyplot as plt

# Estratégias EMC
estrategias = {
    "Reativo\n(sem EMC)": {"alpha": 0.02, "beta": 0.02, "investimento": 50},
    "Padrão\n(indústria)": {"alpha": 0.08, "beta": 0.08, "investimento": 200},
    "Rigoroso\n(médico/automotivo)": {"alpha": 0.15, "beta": 0.15, "investimento": 400},
    "Excelência\n(aeroespacial)": {"alpha": 0.25, "beta": 0.20, "investimento": 800},
}

N = 10000
c_f = 50000
p_0 = 0.10
P_base = 500000
C_test = 25000

nome_list = list(estrategias.keys())
roi_list = []
custo_total_list = []

for nome, params in estrategias.items():
    E = params["investimento"]  # USD*k
    alpha = params["alpha"]
    beta = params["beta"]
    
    C_design = alpha * P_base
    C_total = C_design + C_test + N * c_f * p_0 * np.exp(-beta * E)
    C_sem_emc = 0 + C_test + N * c_f * p_0  # investimento zero em design EMC
    
    roi = ((C_sem_emc - C_total) / C_design) * 100 if C_design > 0 else np.nan
    roi_list.append(roi)
    custo_total_list.append(C_total)

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

# ROI por estratégia
bars = ax1.bar(nome_list, roi_list, color=["#3b82f6", "#10b981", "#f59e0b", "#dc2626"])
ax1.set_ylabel("ROI (%)", fontsize=11)
ax1.set_title("ROI por Estratégia EMC", fontsize=13, weight="bold")
ax1.axhline(0, color="black", linewidth=0.8)
ax1.tick_params(axis="x", labelsize=8)
for bar, val in zip(bars, roi_list):
    ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 200,
             f"{val:,.0f}%", ha="center", fontsize=9)

# Custo total por estratégia
bars2 = ax2.bar(nome_list, custo_total_list, color=["#3b82f6", "#10b981", "#f59e0b", "#dc2626"])
ax2.set_ylabel("Custo Total (USD)", fontsize=11)
ax2.set_title("Custo Total por Estratégia EMC", fontsize=13, weight="bold")
ax2.tick_params(axis="x", labelsize=8)
for bar, val in zip(bars2, custo_total_list):
    ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 50000,
             f"${val:,.0f}", ha="center", fontsize=8)

plt.tight_layout()
```

**Resultado esperado**:

- ROI crescente com investimento EMC até um ponto ótimo.
- Custo total com "U" invertido — mínimo na região de investimento moderado.
- Estratégia "Reativo" tem ROI negativo (custa mais a falha do que o projeto).
- Estratégia "Excelência" tem ROI menor por dólar investido, mas maior proteção absoluta.

---

## Lista de Exercícios Propostos

### Problemas Teóricos

**E.1** Demonstre que a razão de crescimento exponencial $R(t) = e^{kt}$ implica que, se um problema de EMC é descoberto duas fases depois do ponto ideal, o custo de correção é pelo menos $e^{2k}$ vezes maior. Para $k=1{,}5$, calcule numericamente esse fator.

**E.2** Mostre que o valor presente de uma multa futura $M$ aplicada após $n$ anos, com taxa de desconto $r$, é $PV = M/(1+r)^n$. Calcule o VP de uma multa de 1 milhão de USD aplicada em $n=3$ anos, com $r=8\%$.

**E.3** Para $E\ge0$, mostre que $C(E)=aE+b+ce^{-\beta E}$ é estritamente convexa. Determine quando o mínimo é interior e quando ocorre na fronteira $E=0$.

**E.4** Para uma blindagem de parede plana de espessura $t$, mostre que a componente de absorção pode ser escrita como $A = 8{,}686 \cdot (t/\delta)$ dB, onde $\delta = \sqrt{2/(\omega\mu\sigma)}$. Calcule $A$ para uma chapa de cobre ($\sigma = 5{,}8\times10^7\ \text{S/m}$) de 0,5 mm a 1 GHz.

**E.5** Se um produto será vendido em 4 regiões com limites de emissão conduzida de 40, 30, 35 e 38 dBµV, determine o limite efetivo e a margem adicional (em dB) que o projeto deve fornecer em relação ao limite da região mais permissiva.

### Problemas Numéricos

**E.6** Em milhares de USD, modele $C(E)=E+15+100000e^{-0{,}08E}$, $E\ge0$. Calcule o investimento ótimo, o custo esperado mínimo e o ROI incremental $[B(E)-E]/E$, onde $B(E)=100000(1-e^{-0{,}08E})$. Depois explique por que o resultado depende criticamente do modelo de perda de 100 milhões USD.

(a) O investimento ótimo $E^{*}$ em EMC (minimizando $C_{\text{total}}$).

(b) O custo total mínimo.

(c) O ROI nessa configuração.

**E.7** Um veículo elétrico ($N = 120.000$ unidades) apresenta falha de EMC em campo com probabilidade $p_f = 0{,}015$. Custo unitário de recall: 800 USD. Custo de reputação: 5 milhões de USD. Multa regulatória: 500.000 USD. Qual foi o custo total do incidente? Se o custo preventivo tivesse sido 100.000 USD, qual seria a razão custo-corretivo/custo-preventivo?

**E.8** Um custo de recall é incerto: probabilidade $p\in[0{,}5\%,2\%]$, 120.000 unidades, custo unitário triangular (500, 800, 1.500 USD) e custo fixo de 5,5 milhões USD se houver campanha. Formule o custo esperado condicionado ao cenário e indique como uma simulação Monte Carlo deve amostrar sem confundir probabilidade de cada unidade com probabilidade de uma campanha sistêmica.

**E.9** Uma empresa pode comprar módulo por 15 USD/unidade ou desenvolver: 80.000 USD de desenvolvimento, 25.000 USD de certificação e 2 USD/unidade de fabricação/integração. Para 30.000 unidades, compare custos e calcule o volume de equilíbrio. Liste custos/riscos omitidos antes de recomendar.

**E.10** Um dispositivo médico deve ser certificado na EUA (FCC), Europa (CE), Japão (VCCI) e China (CCC). Custos de certificação: 30.000, 40.000, 20.000 e 35.000 USD, respectivamente. Prazos: 6, 10, 5 e 8 semanas. Se o lançamento é simultâneo em todas as regiões, qual é o prazo mínimo de certificação? Qual é o custo total? Se as certificações forem feitas em paralelo, qual o ganho de tempo?

---

## Gabarito

### Soluções dos Problemas Teóricos

**E.1** $R(t) = e^{kt}$. Para $t = 2$ fases de atraso:

$$
R(2) = e^{k \cdot 2} = e^{2k}
$$

Para $k = 1{,}5$: $e^{2 \times 1{,}5} = e^3 \approx \boxed{20{,}09}$

**E.2** $PV = M/(1+r)^n = 1.000.000/(1{,}08)^3 = 1.000.000/1{,}25971 \approx \boxed{793.832\ \text{USD}}$

**E.3** $C'=a-c\beta e^{-\beta E}$ e $C''=c\beta^2e^{-\beta E}>0$, logo há um único mínimo no domínio convexo. Se $c\beta>a$, o ponto interior é $E^*=\beta^{-1}\ln(c\beta/a)>0$. Se $c\beta\le a$, $C'(0)\ge0$ e o mínimo restrito é $\boxed{E^*=0}$. A versão anterior omitia essa condição de fronteira.

**E.4** $\delta=\sqrt{2/(\omega\mu_0\sigma)}\approx2{,}09\,\mu\text{m}$. Com $t=0{,}5\,\text{mm}$, $t/\delta\approx239$ e $A=8{,}686t/\delta\approx\boxed{2{,}08\times10^3\,\text{dB}}$ para folha homogênea ideal. Esse número excede a utilidade prática do modelo e a faixa dinâmica de ensaio; não significa gabinete perfeito, pois aberturas, juntas, cabos e contatos dominarão.

**E.5** Limite efetivo = $\min(40,\,30,\,35,\,38) = \boxed{30\ \text{dB}\mu\text{V}}$. Margem adicional em relação ao mais permissivo (40 dB): $40 - 30 = \boxed{10\ \text{dB}}$.

### Soluções dos Problemas Numéricos

**E.6** $C'(E)=1-8000e^{-0{,}08E}=0$, logo
$E^*=\ln(8000)/0{,}08\approx\boxed{112{,}34}$ mil USD. Nesse ponto, a perda residual é $100000/8000=12{,}5$ mil USD e
$C(E^*)=112{,}34+15+12{,}5\approx\boxed{139{,}84}$ mil USD.

O benefício esperado é $B\approx100000-12{,}5=99987{,}5$ mil USD. Assim, o ROI incremental definido no enunciado é $(99987{,}5-112{,}34)/112{,}34\times100\%\approx\boxed{88\,900\%}$. O valor extremo não é previsão: nasce da hipótese de perda-base de 100 milhões USD e da exponencial calibrada arbitrariamente. Varie perda, $\beta$ e dependência entre falhas antes de decidir.

**E.7** $C_{\text{recall}} = 120.000 \times 0{,}015 \times 800 = 1.440.000\ \text{USD}$

$C_{\text{total}} = 1.440.000 + 5.000.000 + 500.000 = \boxed{6.940.000\ \text{USD}}$

Razão = $6.940.000 / 100.000 = \boxed{69{,}4\times}$

**E.8** Condicionado a uma taxa unitária $p$ e custo unitário $C_u$, o componente variável é $120000pC_u$; se a campanha ocorrer, some 5,5 milhões USD. Em Monte Carlo, amostre $p$ no intervalo segundo distribuição justificada e $C_u\sim\mathrm{Triangular}(500,800,1500)$. Modele separadamente o evento sistêmico da campanha: uma única causa comum não corresponde a 120.000 Bernoullis independentes. Reporte média, mediana, percentis e sensibilidade às dependências.

**E.9** $C_{\rm buy}=15(30000)=\boxed{450000}$ USD. $C_{\rm build}=80000+25000+2(30000)=\boxed{165000}$ USD. O equilíbrio resolve $15x=105000+2x$, portanto $x\approx\boxed{8077}$ unidades. No modelo fornecido, desenvolver custa menos a 30.000 unidades. Antes de recomendar, inclua integração do módulo comprado, BOM completa interna, royalties, manutenção, recertificação do produto final, prazo, risco técnico, rendimento, suporte e valor da flexibilidade; módulo certificado não transfere automaticamente conformidade ao produto.

**E.10** Prazo mínimo (lançamento simultâneo): todas as certificações devem estar concluídas. Se feitas sequencialmente: $6 + 10 + 5 + 8 = \boxed{29\ \text{semanas}}$.

Se feitas em paralelo (recursos permitem): $\max(6,\,10,\,5,\,8) = \boxed{10\ \text{semanas}}$.

Custo total: $30.000 + 40.000 + 20.000 + 35.000 = \boxed{125.000\ \text{USD}}$ (igual em ambos os casos).

Ganho de tempo com paralelismo: $29 - 10 = \boxed{19\ \text{semanas}} \approx 4{,}5\ \text{meses}$.

---

