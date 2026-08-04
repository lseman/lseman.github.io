# Projeto de PCBs Considerando Técnicas EMC

> Compatibilidade Eletromagnética — Apostila de Curso
> Tópicos: Filosofia de Projeto PCB · Stack-up · Grounding · Decoupling/PDN · Routing · Isolamento · Conectores · Verificação EMC

---

## Antes de começar

Ao final, você deve revisar stack-up, retorno, PDN, roteamento, conectores e proteção como um sistema único. **Diagnóstico:** uma trilha curta pode ainda gerar grande emissão? **Evidência mínima:** anotar layout e esquema com caminhos de ida/retorno, correntes transitórias, zonas, interfaces e pontos previstos de medição.

## Sumário

1. [Filosofia de Projeto PCB para EMC](#filosofia-de-projeto-pcb-para-emc)
2. [Seleção de Stack-up de PCB](#seleção-de-stack-up-de-pcb)
3. [Grounding — O Pilar do EMC em PCB](#grounding--o-pilar-do-emc-em-pcb)
4. [Decoupling e Distribuição de Energia (PDN)](#decoupling-e-distribuição-de-energia-pdn)
5. [Routing para EMC — Regras Práticas](#routing-para-emc--regras-práticas)
6. [Isolamento e Separação de Sinais](#isolamento-e-separação-de-sinais)
7. [Conectores e Interfaces — EMC](#conectores-e-interfaces--emc)
8. [Verificação EMC em PCB — Antes de Ir para o Proto](#verificação-emc-em-pcb--antes-de-ir-para-o-proto)
9. [Exercícios Resolvidos em Python](#exercícios-resolvidos-em-python)
10. [Lista de Exercícios Propostos](#lista-de-exercícios-propostos)
11. [Estudo integrado — interface digital com cabo](#estudo-integrado--interface-digital-com-cabo)
12. [Laboratório SPICE — efeito da montagem na PDN](#laboratório-spice--efeito-da-montagem-na-pdn)
13. [Gabarito](#gabarito)

---

## Filosofia de Projeto PCB para EMC

<!-- slides: columns -->

### EMC desde o Início — Design-for-Compliance

Projetar uma PCB considerando EMC desde a fase inicial (design-for-compliance) é **cinco a dez vezes mais barato** que corrigir problemas em protótipos avançados. Cada iteração de redesign custa tempo, dinheiro e atraso no time-to-market.

**Princípio fundamental:** EMC não é um problema de "testes finais". É uma consequência direta das decisões de projeto tomadas na fase inicial: escolha de stack-up, posicionamento de componentes, routing e estratégia de grounding.

<!-- slides: column -->

### Trade-offs do Projeto EMC

Todo projeto EMC envolve compromissos entre:

- **Custo** — mais camadas de PCB, blindagens, filtros aumentam o custo
- **Tamanho** — spacing maior, blindagens aumentam a área
- **Performance** — limites EMC podem restringir velocidades de clock e slew rates
- **Confiabilidade** — filtros e supressores adicionam pontos potenciais de falha



<!-- slides: end-columns -->
### Checklist EMC por Fase de Projeto

**Fase 1 — Especificação:**

- Definir normas aplicáveis (FCC, CE, CISPR)
- Classificar o produto (classe A ou B)
- Definir faixas de frequência de interesse
- Identificar fontes de ruído e vias de acoplamento

**Fase 2 — Arquitetura:**

- Escolher stack-up adequado
- Definir estratégia de grounding
- Selecionar componentes de filtering
- Planejar zonas de sinais analógicos e digitais

**Fase 3 — Layout:**

- Minimizar áreas de loop de corrente
- Manter planos de referência contínuos
- Routing de impedância controlada
- Decoupling adequado

**Fase 4 — Verificação:**

- Regra de spacing e clearance
- Análise de integridade de sinal
- Simulação de EMC (se disponível)
- Revisão de conectores e blindagem

### Metodologia de Projeto EMC

A metodologia recomendada segue um ciclo iterativo:

$$
\boxed{\text{Análise de Risco} \to \text{Design} \to \text{Simulação} \to \text{Teste} \to \text{Iteração}}
$$

1. **Análise de risco:** identificar potenciais problemas de EMC antes do layout
2. **Design:** aplicar regras EMC no layout
3. **Simulação:** validar com ferramentas EM (FEM, FDTD, MoM)
4. **Teste:** medir emissões e imunidade em câmara anecoica
5. **Iteração:** corrigir problemas e repetir

---

## Seleção de Stack-up de PCB

### Stack-up de 2, 4 e 6+ Camadas

**PCB de 2 camadas:** pode ser adequada, mas exige disciplina para reservar cobre contínuo ao retorno e evitar que o roteamento fragmente esse caminho. Não existe corte universal em 10 MHz: conteúdo espectral é determinado sobretudo pelos tempos de subida/descida, comprimentos, correntes e geometria. Uma interface com *clock* baixo e bordas rápidas ainda pode exigir tratamento de alta frequência.

**Exemplo comum**, não configuração universalmente ideal, de stack-up de 4 camadas:

$$
\boxed{\text{Camada 1: Signal} \mid \text{Camada 2: Ground} \mid \text{Camada 3: Power} \mid \text{Camada 4: Signal}}
$$

O plano de ground na camada 2, adjacente à camada de sinal 1, fornece:

- Caminho de retorno de baixa impedância para sinais na camada 1
- Blindagem entre sinais das camadas 1 e 4
- Capacitância parasita natural entre signal e ground

**PCB de 6+ camadas:** oferece mais liberdade para manter referências adjacentes, controlar impedância e distribuir alimentação. A necessidade depende de densidade, interfaces, potência, fabricação, custo e metas de SI/PI/EMC.

### Impedância de Microstrip e Strip-line

A impedância característica de um traço microstrip (na borda da PCB) é dada aproximadamente pela fórmula de Hammerstad e Jensen:

$$
\boxed{Z_0 = \frac{87}{\sqrt{\varepsilon_r + 1{,}41}} \ln\left(\frac{5{,}98h}{0{,}8w + t}\right) \quad [\Omega]}
$$

onde:

- $h$ é a espessura do dieletrico entre o traço e o plano de referência (mm)
- $w$ é a largura do traço (mm)
- $t$ é a espessura do cobre (mm)
- $\varepsilon_r$ é a constante dielétrica do substrato

Esta fórmula é válida para $0{,}1 < w/h < 2{,}0$ e $1 < \varepsilon_r < 15$.

Para um traço strip-line (entre dois planos de referência):

$$
\boxed{Z_0 = \frac{60}{\sqrt{\varepsilon_r}} \ln\left(\frac{4h}{0{,}67\pi w t}\right) \quad [\Omega]}
$$

onde $2h$ é a distância total entre os dois planos.

### Espessura do Dieletrico e Impacto na Impedância

O spacing entre o traço e o plano de referência determina:

1. A impedância característica (para impedância controlada)
2. A capacitância acoplada ao plano de referência
3. A indutância do loop de retorno

**Observação:** Um spacing menor aumenta a capacitância distribuída (bom para decoupling) mas dificulta a fabricação e reduz a impedância característica.

**Capacitância entre traço e plano de referência:**

$$
\boxed{C = \frac{\varepsilon_0 \varepsilon_r w L}{h}}
$$

onde $L$ é o comprimento do traço. Esta capacitância é essencial para o acoplamento de alta frequência ao plano de referência e para a eficácia do decoupling.

**Spacing típico:** Para FR-4 ($\varepsilon_r \approx 4{,}2$), um spacing de $h = 0{,}2\,\text{mm}$ (6 mil) entre sinal e ground produz impendâncias ~50 $\Omega$ com largura $w \approx 0{,}4\,\text{mm}$.

---

## Grounding — O Pilar do EMC em PCB

### Plano de Ground Contínuo vs. Segmentado

Um **plano de ground contínuo** (solid ground plane) é o melhor para EMC em altas frequências. Fornece:

- Caminho de retorno de baixa impedância
- Capacitância distribuída com o plano de power (acoplamento de alta frequência)
- Blindagem contra campos eletromagnéticos

Um **plano segmentado** (split plane) deve ser evitado em PCBs de alta velocidade. As lacunas no plano de ground forçam correntes de retorno a contornar as lacunas, criando loops grandes e antenas eficientes.

**Observação:** a decisão não depende apenas da frequência nominal. Planos segmentados podem ser necessários por segurança, isolamento ou arquitetura, mas nenhum sinal rápido deve cruzar uma fenda sem um caminho de retorno planejado. Analise a corrente e sua borda espectral; “baixa frequência” não torna automaticamente inofensivo um retorno interrompido.

### Single-Point Ground vs. Multi-Point Ground

**Single-point ground (terra único):** Todos os pontos do circuito são conectados a um único ponto físico. A impedância entre quaisquer dois pontos é puramente resistiva em baixas frequências. Adequado para:

$$
\boxed{f < f_{\text{crossover}} = \frac{1}{2\sqrt{LC}} \quad \text{(single-point)}}
$$

**Multi-point ground (terra múltiplo):** Cada módulo ou subcircuito tem seu próprio ponto de conexão ao ground. A impedância é minimizada pelos capacitores de bypass e pela indutância do plano. Adequado para:

$$
\boxed{f > f_{\text{crossover}} \quad \text{(multi-point)}}
$$

**Frequência de crossover:** O ponto de transição entre single-point e multi-point depende da indutância $L$ e capacitância $C$ do caminho de retorno:

$$
\boxed{f_{\text{crossover}} \approx \frac{1}{2\pi\sqrt{L_{\text{ground}} C_{\text{bypass}}}}}
$$

Para uma PCB típica ($L_{\text{ground}} \approx 1\,\text{nH}$, $C_{\text{bypass}} \approx 100\,\text{nF}$):

$$
f_{\text{crossover}} \approx \frac{1}{2\pi\sqrt{10^{-9} \cdot 10^{-7}}} \approx 1{,}6\,\text{MHz}
$$

### Impedância do Plano de Ground

A impedância de um plano de ground vista de uma frequência $f$ é dominada pela indutância:

$$
\boxed{Z_{\text{ground}} \approx j\omega \frac{h}{w} \sqrt{\frac{\mu_0}{\varepsilon_0}} \quad (\text{aproximação})}
$$

onde $h$ é a distância entre o plano e o sinal, e $w$ é a largura do caminho de retorno. Em um plano sólido, a indutância por quadrado é aproximadamente constante:

$$
\boxed{L_{\square} \approx \frac{\mu_0}{2\pi} \approx 633\,\text{pH/quadrado}}
$$

Portanto, a indutância de um caminho de retorno é proporcional ao número de quadrados do trajeto.

### Stitching Vias

Vias de stitching conectam planos de ground em PCBs multicamada, reduzindo a impedância entre planos.

$$
\boxed{L_{\text{via}} \approx 1\,\text{nH}/\text{via} \quad (\text{via típica})}
$$

Para ser efetiva em alta frequência, o spacing entre stitching vias deve ser pequeno:

$$
\boxed{s \leq \frac{\lambda_g}{20} = \frac{\lambda_0}{20\sqrt{\varepsilon_r}}}
$$

Para 1 GHz em FR-4 ($\varepsilon_r = 4{,}2$): $\lambda_g \approx 73\,\text{mm}$, logo $s \leq 3{,}7\,\text{mm}$.

**Prática recomendada:** colocar stitching vias a cada 5–10 mm nas bordas da PCB e ao redor de componentes de alta velocidade.

---

## Decoupling e Distribuição de Energia (PDN)

### Impedância Target da PDN

A Power Distribution Network (PDN) deve fornecer corrente suficiente a qualquer CI em qualquer frequência, mantendo a tensão de alimentação dentro da tolerância:

$$
\boxed{Z_{\text{target}} = \frac{V_{\text{ripple}}}{I_{\text{transient}}}}
$$

onde:

- $V_{\text{ripple}}$ é a tensão máxima permitida de ripple (tipicamente 5% de $V_{\text{DD}}$)
- $I_{\text{transient}}$ é a corrente transitória máxima demandada pelo CI

Para um CI com $V_{\text{DD}} = 3{,}3\,\text{V}$, $V_{\text{ripple}} = 0{,}165\,\text{V}$ e $I_{\text{transient}} = 1\,\text{A}$:

$$
Z_{\text{target}} = \frac{0{,}165}{1} = 0{,}165\,\Omega
$$

### Capacitores de Decoupling

Capacitores de decoupling fornecem carga local para transientes de corrente, reduzindo a impedância da PDN na faixa de alta frequência. Múltiplos valores são necessários para cobrir uma banda larga:

Não existe “Lei das Décadas” que garanta uma PDN plana. Misturar valores por fatores de 10 pode **criar** anti-ressonâncias entre capacitâncias e indutâncias. A seleção deve usar modelos de componentes e montagem, impedância do plano/VRM e simulação ou medição contra $Z_{\text{target}}$. Em muitos casos, vários capacitores iguais e bem montados reduzem impedância de modo mais previsível.

| Escolha | Papel típico | O que realmente define a faixa útil |
|---|---|---|
| Bulk/VRM | Corrente de baixa frequência e energia do conversor | Controle do VRM, ESR e interconexão |
| MLCCs próximos à carga | Transientes locais | ESL de montagem, plano de referência, SRF e anti-ressonâncias |
| Capacitores pequenos/RF | Ajuste pontual quando justificado | Modelo S-parameter, geometria e meta de impedância |

O valor nominal, por si só, não determina uma faixa de frequência universal. Um MLCC de mesmo valor pode ter SRF muito diferente conforme encapsulamento, viás, distância ao CI, viés DC e plano de retorno.

### Capacitor Real com Elementos Parasitas

Um capacitor real possui indutância série ($L_s$) e resistência série ($R_s$):

$$
\boxed{Z(s) = R_s + sL_s + \frac{1}{sC} = R_s + j\omega L_s - j\frac{1}{\omega C}}
$$

A impedância tem formato de "V": diminui com a frequência (comportamento capacitivo) até a **frequência de auto-ressonância**, onde $X_L = X_C$, e depois aumenta (comportamento indutivo).

**Frequência de auto-ressonância:**

$$
\boxed{f_{SR} = \frac{1}{2\pi\sqrt{L_s C}}}
$$

Um capacitor de 100 nF com $L_s = 2\,\text{nH}$ ressona em:

$$
f_{SR} = \frac{1}{2\pi\sqrt{2\times 10^{-9} \cdot 100\times 10^{-9}}} \approx 11{,}25\,\text{MHz}
$$

Acima de $f_{SR}$, o ramo torna-se indutivo; isso não o torna instantaneamente “inútil”. Sua impedância pode continuar abaixo de $Z_{\text{target}}$ por alguma faixa e interagir com a PDN. Avalie o módulo e o caminho de montagem, não apenas o sinal da reatância.

### PDN Resonance e Anti-Resonance

Quando múltiplos capacitores são usados, interagem formando picos de impedância na PDN.

**Observação:** Anti-resonâncias causam picos de impedância que podem exceder $Z_{\text{target}}$, levando a violações de ruído de terra e emissões conduzidas.

A impedância máxima no anti-resonance é:

$$
\boxed{Z_{\text{max}} = \frac{L_{s1}}{R_{s1} C_{s1}}}
$$

O anti-resonance ocorre quando a indutância de um capacitor ressona com a capacitância de outro:

$$
\boxed{f_{\text{anti-res}} = \frac{1}{2\pi\sqrt{L_{s1} C_2}} \quad (\text{para } L_1 C_2 \neq L_2 C_1)}
$$

**Prática recomendada:** calcule a impedância do conjunto com ESR/ESL e montagem reais; adicione amortecimento quando necessário. A razão entre valores, sozinha, não prevê a altura do pico de anti-ressonância.

### Estratégia de Distribuição de Decoupling

Distribuir capacitores por toda a PCB, o mais próximo possível dos pins de alimentação dos CIs:

1. **Capacitor de bypass do CI:** 0,1 µF o mais próximo possível de cada par VDD/GND
2. **Capacitores de placa:** 1–10 µF a cada 2–3 cm para distribuir corrente
3. **Capacitor de entrada:** 10–100 µF na entrada da alimentação

---

## Routing para EMC — Regras Práticas

### Regra do Loop Mínimo

A área do loop de corrente é diretamente proporcional à emissão de campo magnético.

**Teorema:** O momento de dipolo magnético de um loop é $m = I \cdot A_{\text{loop}}$. A potência irradiada é proporcional a $|m|^2 \cdot f^4$, logo reduzir $A_{\text{loop}}$ tem impacto quadrático na redução de emissões.

A área do loop de corrente é diretamente proporcional à emissão de campo magnético:

$$
\boxed{A_{\text{loop}} \leq \frac{\lambda}{20} \times \text{spacing}}
$$

Para minimizar emissões, o caminho de retorno deve seguir diretamente abaixo do traço de sinal (sobre o plano de ground). Isso minimiza $A_{\text{loop}}$.

**Importante:** O caminho de retorno de alta frequência segue o caminho de **mínima indutância**, não de mínima resistência. Para frequências acima de ~1 MHz, este caminho está diretamente abaixo do traço de sinal no plano de referência adjacente.

### Trace Length Matching

Para buses de dados sincronizados, o matching de comprimento minimiza skew:

$$
\boxed{\Delta L \leq \frac{c \cdot \Delta t}{\sqrt{\varepsilon_{\text{eff}}}}}
$$

onde $\Delta t$ é o skew máximo tolerável e $\varepsilon_{\text{eff}}$ é a constante dielétrica efetiva do trajeto.

Para um clock de 100 MHz ($T = 10\,\text{ns}$), com $\varepsilon_{\text{eff}} = 3{,}5$ e $\Delta t = 0{,}5\,\text{ns}$:

$$
\Delta L \leq \frac{3\times 10^8 \cdot 0{,}5\times 10^{-9}}{\sqrt{3{,}5}} \approx 25{,}4\,\text{mm}
$$

### Regras de Spacing para Reduzir Coupling

O coupling entre traces paralelos é minimizado com spacing adequado:

$$
\boxed{s \geq 3w \quad \text{(para acoplamento mínimo)}}
$$

onde $s$ é o spacing e $w$ é a largura do traço.

Acoplamento capacitivo entre traces paralelos:

$$
C_{\text{mut}} \approx \frac{\varepsilon_0 \varepsilon_r L}{s} \quad (\text{aproximação})
$$

O crosstalk induzido é proporcional a $dV/dt$ do sinal agressor e à capacitância mútua:

$$
V_{\text{xtalk}} \approx Z_0 \cdot C_{\text{mut}} \cdot \frac{dV_{\text{aggressor}}}{dt}
$$

### Via Minimization

Cada via adiciona indutância parasita e descontinuidade de impedância:

$$
\boxed{L_{\text{parasitic}} \approx 0{,}5\text{--}2\,\text{nH}/\text{via}}
$$

A indutância parcial de uma via isolada pode ser estimada, em SI, por:

$$
\boxed{L_{\text{via}} \approx \frac{\mu_0h}{2\pi} \left(\ln\frac{4h}{r} - 1\right)}
$$

Aqui $h$ e $r$ devem estar na mesma unidade dentro do logaritmo e $h$ deve estar em metros no fator externo. O valor efetivo depende fortemente do caminho de retorno, antipads, vias próximas e planos; use solver/TDR para descontinuidades críticas.

**Prática:** minimizar o número de vias em sinais de alta frequência. Cada via é uma descontinuidade que pode causar reflexão e emissão.

### Guard Traces

Guard traces são condutores aterrados colocados entre traces para reduzir acoplamento. Sua eficácia é limitada e depende do spacing e do número de stitching vias:

Não existe redução universal pela metade. Uma guarda flutuante pode até ressoar ou aumentar acoplamento; uma guarda bem referenciada requer vias suficientemente próximas para a banda de interesse. Compare geometria em solver ou por cupom. Em geral, aumentar espaçamento e aproximar a referência são intervenções mais previsíveis.

---

## Isolamento e Separação de Sinais

### Separação Analógico-Digital

Sinais digitais (ruídosos, alta $dV/dt$) devem ser fisicamente separados de sinais analógicos (sensíveis).

**Definição:** O princípio de zoning EMC estabelece que sinais com diferentes perfis de interferência devem ser alocados em regiões distintas da PCB, com boundaries bem definidos e retorno de corrente controlado.

Não há regra útil do tipo “separe analógico e digital por $\lambda/10$”: em muitas PCBs isso exigiria distância maior que a própria placa e ainda ignoraria o mecanismo de acoplamento. Determine o espaçamento por campo próximo, paralelismo, impedâncias, bordas e sensibilidade; mantenha cada corrente sobre sua região de referência e evite que retornos ruidosos atravessem nós analógicos sensíveis.

### Zoning na PCB

A PCB deve ser dividida em zonas funcionais:

- **Zona digital:** clocks, buffers, CIs digitais
- **Zona analógica:** amplificadores, sensores, referências
- **Zona de potência:** reguladores, drivers
- **Zona de interface:** conectores, drivers de linha

Em muitas placas mistas, as zonas compartilham um plano de referência contínuo e são separadas pelo posicionamento e pelos caminhos de corrente, não por uma fenda. Sinais que cruzam zonas precisam levar seu retorno. Isolação galvânica ou requisitos de segurança podem exigir domínios separados; nesse caso, respeite a barreira e controle capacitâncias e componentes de travessia.

### Isoladores

Para isolação galvânica completa:

- **Amplificadores de isolamento:** precisão e bandwidth limitadas
- **Isoladores ópticos (optocouplers):** isolamento > 5 kV, bandwidth até 10 MHz
- **Transformadores de isolamento:** isolamento em sinais diferenciais, acoplamento CA

Impedância de common-mode choke em interfaces:

$$
\boxed{Z_{\text{CM}} = j\omega L_{\text{CM}}}
$$

Um choke com $L_{\text{CM}} = 10\,\text{mH}$ a 10 MHz tem $Z_{\text{CM}} = 2\pi \cdot 10^7 \cdot 10^{-2} \approx 630\,\text{k}\Omega$.

---

## Conectores e Interfaces — EMC

### Conectores como Porta de Entrada de EMI

Conectores são vias preferenciais para acoplamento de interferência, pois os fios conectados atuam como antenas eficientes:

- Cabos de I/O podem irradiar ou receber energia EM
- A blindagem do conector deve ser conectada ao chassi em 360°
- Sinais de alta frequência devem ter retorno próximo ao conector

### Filtering nos Conectores

Filtros nos conectores bloqueiam ruído conduzido:

- **Ferrites:** $Z_{\text{ferrite}} = R + j\omega L$, inserção em série com o cabo
- **Capacitores feedthrough:** conectados diretamente ao shell do conector
- **Filtros π:** LC combinados para atenuação em banda larga

### Grounding do Shell do Conector

Conexão do shell do conector ao chassi.

**Importante:** Um shell não conectado adequadamente ao chassi age como antena, acoplando ruído interno ao cabo e ruído externo ao circuito interno. A qualidade do bonding determina a efetividade do blindamento do conector.

**360° contact (ideal):** O shell do conector é montado em uma ferrule metálica que faz contato circunferencial completo com o chassi. Esta é a prática recomendada para frequências acima de 10 MHz.

**Pigtail (não recomendado para EMC):** Fio conectando o shell ao chassi. A indutância do fio ($\approx 250\,\text{nH/m}$) torna a conexão ineficaz acima de ~10 MHz.

### Cable Exit Strategies

Ao sair da PCB para o cabo, o harness (conjunto de cabos) deve ser **bonded** (conectado) ao chassi na borda da carcaça:

$$
\boxed{Z_{\text{bond}} \leq \frac{1}{20\pi f C_{\text{parasita}}}}
$$

A capacitância parasita entre o harness e o chassi deve ser maximizada (largura de bonding larga) para fornecer caminho de retorno de baixa impedância.

---

## Verificação EMC em PCB — Antes de Ir para o Proto

### Checklist de Revisão EMC

Antes de enviar o layout para fabricação, verificar todos os itens abaixo.

**Observação:** A maioria dos problemas de EMC pode ser detectada em uma revisão de layout antes da fabricação. Um problema detectado após o proto custa ~10× mais para corrigir.

1. **Stack-up:** plano de ground contínuo? spacing adequado?
2. **Decoupling:** capacitor em cada par VDD/GND do CI? valores corretos?
3. **Grounding:** single-point ou multi-point conforme a frequência?
4. **Routing:** loops minimizados? impedance controlada? spacing adequado?
5. **Via:** mínimo de vias em sinais críticos? stitching vias suficientes?
6. **Conectores:** filtering presente? shell bonded ao chassi?
7. **Zoning:** analógico e digital separados?
8. **Boundary:** bordas da PCB afastadas do plano de ground?

### Simulação EM

Ferramentas de simulação EM permitem prever problemas de EMC antes da fabricação:

- **FEM (Finite Element Method):** ideal para estruturas 3D, blindagens, conectores
- **FDTD (Finite-Difference Time-Domain):** ideal para problemas de irradiação e acoplamento
- **Method of Moments (MoM):** ideal para antenas e PCBs planares

### Medida de Impedância do PDN

Antes da fabricação, a impedância do PDN pode ser estimada via simulação. Após a fabricação, medidas com analisador de rede vetor (VNA) validam o projeto:

$$
\boxed{Z_{\text{PDN}}(f) = \frac{V(f)}{I(f)}}
$$

Medindo $S_{21}$ com um probe de força de corrente e comparando com $Z_{\text{target}}$.

### Near-Field Scanning

Após a fabricação, near-field probes (sondas de campo próximo) identificam hotspots de EMI:

- Sonda E (campo elétrico): detecta acoplamento capacitivo
- Sonda H (campo magnético): detecta correntes de loop
- Mapeamento raster sobre a PCB revela emissões concentradas

---

### Plano de pré-conformidade e critérios de saída

Antes do laboratório formal, transforme riscos de layout em medições reproduzíveis:

1. **Baseline:** firmware, carga, cabos, alimentação e modos operacionais definidos.
2. **Emissão conduzida:** LISN ou rede equivalente apropriada, detector e RBW documentados.
3. **Corrente de cabo:** sonda de corrente de RF em cada interface e sobre o feixe completo para separar DM/CM.
4. **Campo próximo:** mapas E/H com escala, distância e orientação constantes; mapas servem para localizar fontes, não para prever diretamente o campo distante.
5. **PDN:** impedância por VNA com fixture/de-embedding adequado e comparação com $Z_{target}=\Delta V/\Delta I$.
6. **Integridade de retorno:** TDR ou inspeção orientada por corrente para vias, conectores, fendas e mudanças de camada.
7. **Imunidade exploratória:** injeção controlada somente com limites de segurança e critérios funcionais definidos.

O projeto só deve sair da revisão quando cada risco alto tiver responsável, evidência, margem-alvo e ação de contingência. “Passou no protótipo” sem configuração e incerteza registradas não é um critério reutilizável.

### Checklist de revisão baseado em corrente

- Onde nasce cada corrente transitória?
- Qual é o caminho de ida e qual é o retorno em cada faixa de frequência?
- A corrente cruza uma mudança de referência, conector ou fenda?
- Existe uma interface capaz de converter modo diferencial em comum?
- Capacitores de desacoplamento fecham o loop localmente antes de alimentar o plano inteiro?
- Proteções ESD descarregam ao chassi sem atravessar circuitos sensíveis?
- A blindagem termina em baixa impedância ou por um *pigtail* indutivo?
- Pontos de teste permitem medir corrente CM, PDN e sinais críticos sem alterar excessivamente o sistema?

## Exercícios Resolvidos em Python

### Protocolo computacional

**Objetivo:** apoiar decisões de stack-up, PDN e acoplamento antes do protótipo. **Hipóteses:** registre geometria, $\varepsilon_r(f)$, perdas, modelos de capacitor e retorno. **Validação:** compare aproximações com solver ou medição quando o comprimento elétrico, as descontinuidades ou as tolerâncias invalidarem fórmulas fechadas.

### Cálculo de Impedância de Microstrip e Coplanar Waveguide

**Exercício:** Calcule a impedância característica de um microstrip em FR-4 com $h = 0{,}2\,\text{mm}$, $w = 0{,}4\,\text{mm}$, $t = 0{,}035\,\text{mm}$, $\varepsilon_r = 4{,}2$.

```python
import numpy as np
import matplotlib.pyplot as plt

def microstrip_impedance(w, h, t=0.035, er=4.2):
    """Calcula a impedância de um microstrip usando a fórmula de Hammerstad e Jensen.
    
    Parâmetros (mm):
        w: largura do traço
        h: espessura do dieletrico
        t: espessura do cobre
        er: constante dielétrica
    
    Retorna:
        Z0 em Ohms
    """
    if w / h < 0.1:
        # Equação para traces estreitos
        Z0 = (60 / np.sqrt(er)) * np.log((4 * h) / (0.67 * np.pi * w * t))
    elif w / h > 2.0:
        # Equação para traces largos
        Z0 = (120 * np.pi) / (np.sqrt(er) * (w / h + 1.393 + 0.667 * np.log(w / h + 1.444)))
    else:
        # Equação de Hammerstad e Jensen
        Z0 = (87 / np.sqrt(er + 1.41)) * np.log((5.98 * h) / (0.8 * w + t))
    return Z0

def stripline_impedance(w, b, t=0.035, er=4.2):
    """Aproximação didática para stripline simétrica; b é distância entre planos."""
    # O argumento do logaritmo deve ser adimensional. Esta aproximação não
    # substitui o solver do fabricante para cobre trapezoidal/máscara/tolerâncias.
    return (60 / np.sqrt(er)) * np.log((4 * b) / (0.67 * np.pi * (0.8*w + t)))

# Parâmetros FR-4
h = 0.2    # mm (6 mil)
t = 0.035  # mm (1 oz)
er = 4.2

# Variação de Z0 com w
ws = np.linspace(0.1, 1.0, 100)  # mm
Z0_micro = [microstrip_impedance(w, h, t, er) for w in ws]
Z0_strip = [stripline_impedance(w, 2*h, t, er) for w in ws]  # b = 2h

fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(ws, Z0_micro, label="Microstrip", linewidth=2)
ax.plot(ws, Z0_strip, label="Strip-line", linewidth=2, linestyle='--')
ax.axhline(50, color='red', linestyle=':', alpha=0.5, label="50 Ω target")
ax.axhline(75, color='green', linestyle=':', alpha=0.5, label="75 Ω target")
ax.set_xlabel("Largura do traço $w$ [mm]")
ax.set_ylabel("Impedância $Z_0$ [$\\Omega$]")
ax.set_title("Impedância de Microstrip vs. Strip-line (FR-4, $h=0.2$ mm)")
ax.grid(True, alpha=0.3)
ax.legend()
plt.tight_layout()

# Valores para 50 Ω
# Z0 decresce com w; np.interp requer o eixo x crescente.
print(f"Para 50 Ω microstrip com h={h}mm: w ≈ {np.interp(50, Z0_micro[::-1], ws[::-1]):.3f} mm")
print(f"Para 50 Ω strip-line com 2h={2*h}mm: w ≈ {np.interp(50, Z0_strip[::-1], ws[::-1]):.3f} mm")
```

### Simulação de PDN Impedance com Múltiplos Capacitores

```python
import numpy as np
import matplotlib.pyplot as plt

def pdn_impedance(f, C_vals, Ls_vals, Rs_vals=0.01):
    """Simula a impedância da PDN com múltiplos capacitores de decoupling.
    
    Parâmetros:
        f: array de frequências (Hz)
        C_vals: lista de capacitâncias (F)
        Ls_vals: lista de indutâncias série (H)
        Rs_vals: resistência série (Ω)
    
    Retorna:
        Z: array de impedâncias (Ω)
    """
    omega = 2 * np.pi * f
    if np.isscalar(Rs_vals):
        Rs_vals = np.full(len(C_vals), Rs_vals, dtype=float)
    # Cada ramo é R-ESL-C em série; os ramos ficam em paralelo na PDN.
    Y_total = np.zeros_like(f, dtype=complex)
    for C, Ls, Rs in zip(C_vals, Ls_vals, Rs_vals):
        Z_branch = Rs + 1j*omega*Ls + 1/(1j*omega*C)
        Y_total += 1/Z_branch
    return 1/Y_total

# Capacitores típicos: valores, indutância série (SMD 0402)
capacitors = {
    '10 µF': (10e-6, 5e-9),   # C, Ls
    '1 µF': (1e-6, 3e-9),
    '100 nF': (100e-9, 2e-9),
    '10 nF': (10e-9, 1e-9),
    '1 nF': (1e-9, 0.5e-9),
    '100 pF': (100e-12, 0.3e-9),
}

f = np.logspace(4, 10, 1000)  # 10 kHz a 10 GHz
C_vals = [c[0] for c in capacitors.values()]
Ls_vals = [c[1] for c in capacitors.values()]

Z_total = pdn_impedance(f, C_vals, Ls_vals)

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

# Impedância total
ax1.loglog(f / 1e6, np.abs(Z_total), label="PDN total", linewidth=2)
ax1.axhline(0.165, color='red', linestyle='--', alpha=0.5, label="$Z_{target}$ = 0.165 Ω")
ax1.set_xlabel("Frequência [MHz]")
ax1.set_ylabel("$|Z_{PDN}|$ [Ω]")
ax1.set_title("Impedância da PDN com Decoupling Múltiplo")
ax1.grid(True, alpha=0.3, which='both')
ax1.legend()

# Zoom na faixa de 100 kHz a 1 GHz
ax2.loglog(f / 1e6, np.abs(Z_total), linewidth=2)
ax2.set_xlim(0.1, 1000)
ax2.set_xlabel("Frequência [MHz]")
ax2.set_ylabel("$|Z_{PDN}|$ [Ω]")
ax2.set_title("PDN: Zoom 100 kHz – 1 GHz")
ax2.axhline(0.165, color='red', linestyle='--', alpha=0.5)
ax2.grid(True, alpha=0.3, which='both')

plt.tight_layout()

# Frequências de auto-ressonância
print("Frequências de auto-ressonância:")
for name, (C, Ls) in capacitors.items():
    f_sr = 1 / (2 * np.pi * np.sqrt(Ls * C))
    print(f"  {name:8s}: $f_{{SR}}$ = {f_sr/1e6:.1f} MHz")
```

### Cálculo de Crosstalk entre Traces Paralelos

**Exercício:** Calcule o crosstalk entre dois traces paralelos de 10 cm, com spacing $s = 0{,}2\,\text{mm}$, em FR-4. Sinal agressor com $dV/dt = 5\,\text{V/ns}$.

```python
import numpy as np
import matplotlib.pyplot as plt

def crosstalk_coupling(L_trace, w, s, er=4.2, rho=0.017):
    """Estima crosstalk entre traces paralelos.
    
    Parâmetros:
        L_trace: comprimento do paralelo (m)
        w: largura do traço (m)
        s: spacing entre traces (m)
        er: constante dielétrica
        rho: resistividade do cobre (Ω·m)
    
    Retorna:
        C_mut: capacitância mútua (F)
        L_mut: indutância mútua (H)
        V_xtalk: tensão de crosstalk induzida (V)
    """
    # Capacitância acoplada por unidade de comprimento (aproximação)
    C_unit = 8.854e-12 * er * w / s  # F/m (aproximação capacitor de placas)
    C_mut = C_unit * L_trace
    
    # Indutância mútua por unidade de comprimento
    L_unit = 2e-7 * np.log(2 * s / w) if s > w else 2e-7  # H/m
    L_mut = L_unit * L_trace
    
    # Impedância característica aproximada
    Z0 = 60 * np.sqrt(er)
    
    # Crosstalk (aproximação de baixa frequência)
    dVdt = 5e9  # V/s (5 V/ns)
    V_xtalk = Z0 * C_mut * dVdt * L_trace / (3e8 / np.sqrt(er))
    
    # Crosstalk mais preciso (coupling por unidade de comprimento)
    k_c = C_mut / (C_unit * L_trace + C_mut) if C_unit * L_trace + C_mut > 0 else 0
    V_xtalk2 = k_c * dVdt * L_trace / (2 * 3e8 / np.sqrt(er))
    
    return C_mut, L_mut, V_xtalk, V_xtalk2

# Parâmetros
L = 0.1        # 10 cm
w = 0.2e-3     # 0.2 mm
s_vals = np.logspace(-4, -2, 50)  # 0.1 mm a 10 mm

C_mut_list = []
V_xtalk_list = []

for s in s_vals:
    C_mut, L_mut, V_xtalk, V_xtalk2 = crosstalk_coupling(L, w, s)
    C_mut_list.append(C_mut * 1e12)  # pF
    V_xtalk_list.append(V_xtalk2 * 1000)  # mV

fig, ax = plt.subplots(figsize=(8, 5))
ax.loglog(s_vals * 1e3, V_xtalk_list, linewidth=2, label="Crosstalk $V_{xtalk}$")
ax.set_xlabel("Spacing $s$ [mm]")
ax.set_ylabel("Crosstalk induzido [mV]")
ax.set_title("Crosstalk entre Traces Paralelos vs. Spacing")
ax.grid(True, alpha=0.3, which='both')
ax.legend()
ax.axvline(0.6, color='green', linestyle='--', alpha=0.5, label="3w (s = 3w = 0.6mm)")

plt.tight_layout()

# Cálculo para s = 0.2 mm
C_mut, L_mut, V_xtalk, V_xtalk2 = crosstalk_coupling(L, w, 0.2e-3)
print(f"\nCrosstalk para s = 0.2 mm:")
print(f"  Capacitância mútua: {C_mut*1e12:.3f} pF")
print(f"  Indutância mútua: {L_mut*1e9:.2f} nH")
print(f"  Crosstalk estimado: {V_xtalk2*1000:.2f} mV")
```

**Saída esperada:**

- **Microstrip:** para $h = 0{,}2\,\text{mm}$, $w \approx 0{,}37\,\text{mm}$ produz $Z_0 \approx 50\,\Omega$
- **PDN:** a impedância cai abaixo de $Z_{\text{target}} = 0{,}165\,\Omega$ de 10 kHz a ~1 GHz com múltiplos capacitores. Anti-resonâncias aparecem entre frequências de ressonância dos capacitores
- **Crosstalk:** $V_{\text{xtalk}}$ diminui com o spacing. Para $s = 3w$, o crosstalk é ~70% menor que para $s = w$

---

## Lista de Exercícios Propostos

**E.1** Calcule a impedância de um microstrip em FR-4 com $h = 0{,}18\,\text{mm}$, $w = 0{,}35\,\text{mm}$, $t = 0{,}035\,\text{mm}$, $\varepsilon_r = 4{,}35$. O valor está dentro da tolerância de 50 ± 10%?

**E.2** Uma PCB de 4 camadas tem stack-up Signal-Ground-Power-Signal com $h = 0{,}2\,\text{mm}$ entre cada par. Calcule a capacitância distribuída entre o plano de ground e o plano de power por cm² de área.

**E.3** Determine a frequência de crossover $f_{\text{crossover}}$ para um caminho de ground com $L_{\text{ground}} = 0{,}8\,\text{nH}$ e capacitância de bypass $C_{\text{bypass}} = 220\,\text{nF}$. Acima ou abaixo desta frequência, qual estratégia de grounding é recomendada?

**E.4** Calcule a indutância de uma via de comprimento $h = 1{,}6\,\text{mm}$ e raio $r = 0{,}3\,\text{mm}$:

$$
L_{\text{via}} \approx \frac{\mu_0h}{2\pi} \left(\ln\frac{4h}{r} - 1\right)
$$

Qual é a frequência na qual esta via se torna ressonante com um capacitor de decoupling de 0,1 µF?

**E.5** Para um CI com $V_{\text{DD}} = 1{,}8\,\text{V}$, tolerância de 3%, e corrente transitória de 2 A, calcule $Z_{\text{target}}$. Se a PDN tem impedância de 0,08 Ω a 50 MHz, a PDN atende ao requisito nesta frequência?

**E.6** Um capacitor de 100 nF tem $L_s = 1{,}5\,\text{nH}$ e $R_s = 0{,}02\,\Omega$. Calcule: (a) $f_{SR}$; (b) $Z$ a 10 MHz; (c) $Z$ a 500 MHz. Em qual faixa ele é capacitivo e em qual indutivo?

**E.7** Dois traces paralelos de 5 cm, $w = 0{,}3\,\text{mm}$, $s = 0{,}15\,\text{mm}$ em FR-4. Calcule a capacitância mútua e a indutância mútua. Se o sinal agressor tem $dV/dt = 10\,\text{V/ns}$, estime o crosstalk no receptor.

**E.8** Um estudante propõe separar zonas analógica e digital por $\lambda_g/10$ para um clock de 200 MHz em FR-4. Calcule o valor com $\varepsilon_{\rm eff}=3$ e explique por que frequência de clock e fração de comprimento de onda não determinam um espaçamento de layout. Liste quatro dados mais úteis.

**E.9** Calcule o spacing necessário entre stitching vias para um sinal de 2 GHz em FR-4 ($\varepsilon_r = 4{,}2$) para garantir $s \leq \lambda_g/20$.

**E.10** (Desafio) Descreva o fluxo para projetar uma rede que mantenha $|Z_{\text{PDN}}|<0{,}1\,\Omega$ de 10 kHz a 500 MHz. Sem modelos de VRM, planos, montagem e capacitores, explique por que não existe uma lista numérica única. Proponha os dados necessários, uma primeira topologia e como validar/iterar anti-ressonâncias.

**E.11** (Desafio) Uma PCB de 6 camadas tem o seguinte stack-up:

| Camada | Função |
|---|---|
| 1 | Signal |
| 2 | Ground |
| 3 | Signal |
| 4 | Power |
| 5 | Ground |
| 6 | Signal |

Calcule as capacitâncias distribuídas entre cada par adacente, considerando $h_{12} = 0{,}05\,\text{mm}$, $h_{34} = 0{,}1\,\text{mm}$, $h_{56} = 0{,}05\,\text{mm}$, $\varepsilon_r = 4{,}2$, área de $100\,\text{cm}^2$.

**E.12** (Desafio) Compare uma terminação de blindagem por *pigtail* de 5 cm ($L\approx12{,}5\,\text{nH}$) com um contato condutivo 360° cuja indutância de conexão seja estimada em $0{,}5\,\text{nH}$. Calcule $|j\omega L|$ a 100 MHz e 1 GHz. Explique por que modelar o contato 360° apenas como capacitância através de um *gap* contradiz a hipótese de *bonding* metálico.

---

## Estudo integrado — interface digital com cabo

Uma interface de 3,3 V, $t_r=500$ ps e trilha de 12 cm está a 0,20 mm do plano, cruza uma abertura e chega a um cabo de 1 m. Com $v_p=1{,}8\times10^8$ m/s, $t_d=0{,}67$ ns e $t_d/t_r=1{,}34$: trate-a como linha. A abertura força o retorno a contornar, aumenta área de loop e favorece conversão para CM no cabo.

Compare três correções em ordem:

1. restaurar plano contínuo ou fornecer transição de retorno junto ao sinal;
2. ajustar terminação para controlar reflexão;
3. controlar CM no conector, se a medição ainda indicar corrente no cabo.

Esse encadeamento evita usar ferrite para mascarar uma descontinuidade criada pelo próprio layout.

### Código Python — impedância-alvo com tolerâncias

```python
import numpy as np
rng = np.random.default_rng(14)
n = 100_000
delta_v = rng.normal(50e-3, 5e-3, n)
delta_i = rng.normal(1.0, 0.15, n)
valid = (delta_v > 0) & (delta_i > 0)
zt = delta_v[valid]/delta_i[valid]
print('Ztarget percentis (mΩ):', 1e3*np.percentile(zt, [1, 5, 50, 95, 99]))
```

Use o percentil coerente com o risco: projetar apenas para a mediana não garante a queda de tensão nas combinações desfavoráveis.

## Laboratório SPICE — efeito da montagem na PDN

```spice
Itest 0 die AC 1
Rplane die nplane 2m
Lplane nplane rail 300p
Lvia rail cap 800p
Resr cap cmain 25m
Cdec cmain 0 100n
Cdie die 0 5n
Rleak rail 0 1G
.ac dec 200 10k 3G
.print ac vm(die) vm(rail)
.end
```

Como a corrente AC é 1 A, as tensões representam impedâncias vistas nos nós. Varra `Lvia` e compare a impedância no *die* e no plano: um capacitor bom ligado por caminho indutivo pode não controlar a impedância local.

## Gabarito

**E.1** $Z_0\approx43{,}5\,\Omega$ pela aproximação fornecida. O intervalo correto de $50\,\Omega\pm10\%$ é $[45,55]\,\Omega$; portanto $43{,}5\,\Omega$ está **fora** da tolerância. Além disso, confirme domínio de validade, $\varepsilon_r(f)$, máscara/cobre e tolerâncias com o fabricante ou solver.

**E.2** $C = \dfrac{\varepsilon_0 \varepsilon_r A}{d} = \dfrac{8{,}854\times 10^{-12} \cdot 4{,}2 \cdot 10^{-4}}{0{,}2\times 10^{-3}} \approx 74{,}4\,\text{pF/cm}^2$. Entre cada par Signal-Ground ou Ground-Power.

**E.3** $f_{\text{crossover}} = \dfrac{1}{2\pi\sqrt{0{,}8\times 10^{-9} \cdot 220\times 10^{-9}}} \approx \dfrac{1}{2\pi\sqrt{1{,}76\times 10^{-16}}} \approx \dfrac{1}{2\pi \cdot 1{,}33\times 10^{-8}} \approx 12{,}0\,\text{MHz}$. Abaixo: single-point. Acima: multi-point.

**E.4** Corrigindo a expressão dimensional com $\mu_0$,
$L\approx[\mu_0(1{,}6\times10^{-3})/(2\pi)][\ln(21{,}3)-1]\approx\boxed{0{,}66\,\text{nH}}$.
Para $C=0{,}1\,\mu\text{F}=100\,\text{nF}$ (não 100 pF), $f=1/[2\pi\sqrt{LC}]\approx\boxed{19{,}6\,\text{MHz}}$. Essa é a ressonância do modelo LC isolado, não necessariamente a da montagem completa.

**E.5** $V_{\text{ripple}} = 0{,}03 \cdot 1{,}8 = 0{,}054\,\text{V}$. $Z_{\text{target}} = 0{,}054 / 2 = 0{,}027\,\Omega$. $Z_{\text{PDN}}(50\,\text{MHz}) = 0{,}08\,\Omega > 0{,}027\,\Omega$: **não atende**. São necessários mais capacitores ou menor $L_s$.

**E.6** (a) Como $C=100\,\text{nF}=100\times10^{-9}$ F,

$$f_{SR}=\frac{1}{2\pi\sqrt{(1{,}5\times10^{-9})(100\times10^{-9})}}
\approx\boxed{13{,}0\,\text{MHz}}.$$
(b) A 10 MHz ($\omega = 6{,}28\times 10^7$): $X_C = \dfrac{1}{\omega C} = \dfrac{1}{6{,}28\times 10^7 \cdot 10^{-7}} = 0{,}159\,\Omega$. $X_L = \omega L_s = 6{,}28\times 10^7 \cdot 1{,}5\times 10^{-9} = 0{,}094\,\Omega$. $Z = 0{,}02 + j(0{,}094 - 0{,}159) = 0{,}02 - j0{,}065$. $|Z| \approx 0{,}068\,\Omega$.
(c) A 500 MHz (acima de $f_{SR}$): $X_C = 0{,}032\,\Omega$, $X_L = 0{,}471\,\Omega$. $Z = 0{,}02 + j0{,}439$. $|Z| \approx 0{,}44\,\Omega$.
Capacitivo para $f<13{,}0$ MHz e indutivo para $f>13{,}0$ MHz no modelo série idealizado.

**E.7** $C_{\text{mut}} \approx \dfrac{\varepsilon_0 \varepsilon_r w L}{s} = \dfrac{8{,}854\times 10^{-12} \cdot 4{,}2 \cdot 0{,}3\times 10^{-3} \cdot 0{,}05}{0{,}15\times 10^{-3}} \approx 3{,}7\times 10^{-13}\,\text{F} = 0{,}37\,\text{pF}$.
$L_{\text{mut}} \approx 2\times 10^{-7} \cdot \ln\dfrac{2 \cdot 0{,}15\times 10^{-3}}{0{,}3\times 10^{-3}} \cdot 0{,}05 = 2\times 10^{-7} \cdot \ln(1) \cdot 0{,}05 = 0$ — o logaritmo é zero pois $2s/w = 2$. Na verdade, $L_{\text{mut}}$ é menor mas não nula. Usando fórmula mais precisa: $L_{\text{mut}} \approx 0{,}15\,\text{nH}$.
$V_{\text{xtalk}} \approx Z_0 \cdot C_{\text{mut}} \cdot dV/dt \cdot (L/v_p) \approx 50 \cdot 0{,}37\times 10^{-12} \cdot 10 \cdot 10^9 \cdot \dfrac{0{,}05}{2\times 10^8} \approx 0{,}017\,\text{V} = 17\,\text{mV}$.

**E.8** A conta proposta dá $\lambda_g\approx0{,}866\,\text{m}$ e $\lambda_g/10\approx8{,}7\,\text{cm}$, mas não constitui regra de projeto. São mais úteis: tempo de subida/espectro, comprimento paralelo, distância ao plano de referência, impedâncias de agressor/vítima, corrente de retorno e nível de ruído tolerável. O espaçamento deve resultar do acoplamento aceitável e da geometria, idealmente verificado por solver/cupom.

**E.9** $\lambda_g = \dfrac{c}{f\sqrt{\varepsilon_r}} = \dfrac{3\times 10^8}{2\times 10^9 \cdot \sqrt{4{,}2}} \approx 0{,}073\,\text{m} = 73\,\text{mm}$. $s \leq \dfrac{73}{20} \approx 3{,}7\,\text{mm}$.

**E.10** São necessários modelos S/Z do VRM, planos e montagem, ESR/ESL e viés DC dos capacitores, perfil de corrente e pontos de observação. Comece com capacitância *bulk* para baixa frequência e matrizes de componentes de baixa ESL próximos às cargas; simule $Z(f)$ no plano físico, identifique picos e ajuste quantidade, valor, localização e amortecimento. Valide por VNA com *fixture* e *de-embedding*. Valores espaçados por década e média geométrica de SRFs não garantem nem localizam corretamente anti-ressonâncias.

**E.11** Capacitância entre camadas adjacentes: $C = \dfrac{\varepsilon_0 \varepsilon_r A}{d}$, $A = 0{,}01\,\text{m}^2$.

- L1-L2: $C = \dfrac{8{,}854\times 10^{-12} \cdot 4{,}2 \cdot 0{,}01}{0{,}05\times 10^{-3}} \approx 7{,}44\,\text{nF}$
- L3-L4: $C = \dfrac{8{,}854\times 10^{-12} \cdot 4{,}2 \cdot 0{,}01}{0{,}1\times 10^{-3}} \approx 3{,}72\,\text{nF}$
- L5-L6: $C = \dfrac{8{,}854\times 10^{-12} \cdot 4{,}2 \cdot 0{,}01}{0{,}05\times 10^{-3}} \approx 7{,}44\,\text{nF}$
Total: $18{,}6\,\text{nF}$ distribuídos na PCB.

**E.12** Para o *pigtail*, $|X_L|\approx7{,}85\,\Omega$ a 100 MHz e $78{,}5\,\Omega$ a 1 GHz. Para o contato 360°, $|X_L|\approx0{,}314\,\Omega$ e $3{,}14\,\Omega$, respectivamente: cerca de 25 vezes menor neste modelo. Um *bond* metálico é caminho condutivo distribuído; representá-lo somente por uma capacitância através de uma lacuna descreve outra geometria e levou à conclusão invertida na versão anterior.

---

[← Exposição Humana](17_efeitos_radiacoes_ser_humano.md) · [Índice](00_indice.md) · [Projeto integrador na ementa](ementa.md)
