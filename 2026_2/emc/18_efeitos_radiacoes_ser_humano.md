# Efeitos das Radiações Eletromagnéticas no Ser Humano

> Compatibilidade Eletromagnética — Apostila de Curso
> Tópicos: Interação RF com Tecidos · Radiação Ionizante vs. Não-Ionizante · Efeitos Térmicos · Limites ICNIRP/IEEE · Efeitos Não-Térmicos · Exposição por Dispositivos Portáteis

## Antes de começar

Ao final, você deve distinguir radiação ionizante de não ionizante, restrição básica de nível de referência e evidência de perigo de avaliação de risco. **Diagnóstico:** detectar um efeito biológico demonstra automaticamente dano à saúde nas condições reais de exposição? **Evidência mínima:** resolver um caso com frequência, duração, campo, distância, população, média espacial/temporal e diretriz identificados.

> **Atenção:** este capítulo é educacional, não constitui avaliação médica, ocupacional ou regulatória. Use a edição vigente da diretriz aplicável e profissionais habilitados em situações reais.

## Sumário

1. [Interação RF com Tecidos Biológicos](#interação-rf-com-tecidos-biológicos)
2. [Fundamentos Físicos da Radiação EM](#fundamentos-físicos-da-radiação-em)
3. [Efeitos Térmicos das Radiações](#efeitos-térmicos-das-radiações)
4. [Limites de Exposição — Normas ICNIRP e IEEE](#limites-de-exposição--normas-icnirp-e-ieee)
5. [Efeitos Não-Térmicos](#efeitos-não-térmicos)
6. [Dispositivos Portáteis e Exposição do Público](#dispositivos-portáteis-e-exposição-do-público)
7. [Exercícios Resolvidos em Python](#exercícios-resolvidos-em-python)
8. [Lista de Exercícios Propostos](#lista-de-exercícios-propostos)
9. [Exemplo quantitativo com incerteza](#exemplo-quantitativo-com-incerteza)
10. [Gabarito](#gabarito)

## Interação RF com Tecidos Biológicos

### Fundamentos da Interação Campo-Organismo

Quando uma onda eletromagnética incide sobre um organismo biológico, ocorrem processos de absorção, reflexão e transmissão. A fração de energia absorvida depende da frequência da onda, das propriedades dielétricas do tecido e da geometria do corpo.

Os tecidos biológicos podem ser modelados como meios dielétricos com condutividade finita. A constante dielétrica complexa descreve a resposta do tecido:

$$
\boxed{\varepsilon_r^*(\omega) = \varepsilon_r'(\omega) - j\frac{\sigma(\omega)}{\omega\varepsilon_0}}
$$

onde $\varepsilon_r'$ é a permissividade relativa (armazenamento de energia) e $\sigma$ é a condutividade elétrica (dissipação). A parte imaginária representa a perda por condução, convertida em calor.

**Parâmetros dielétricos de tecidos humanos** (frequência ~1 GHz, 37 °C):

| Tecido | $\varepsilon_r'$ | $\sigma$ (S/m) | Densidade $\rho$ (kg/m³) |
|---|---|---|---|
| Couro cabeludo | 36,3 | 0,41 | 1090 |
| Cérebro | 43,0 | 0,91 | 1050 |
| Músculo (perpendicular) | 52,0 | 1,53 | 1068 |
| Músculo (paralelo) | 57,0 | 2,44 | 1068 |
| Gordura | 8,7 | 0,04 | 930 |
| Osso (cabeça) | 14,2 | 0,07 | 1740 |
| Pele | 37,0 | 0,55 | 1160 |

### Mecanismos de Interação: Térmico e Não-Térmico

Os efeitos das radiações EM sobre organismos biológicos classificam-se em duas categorias fundamentais:

**Mecanismo térmico (absorção de energia):** A energia EM é absorvida pelos tecidos, causando aumento da temperatura. A taxa de aquecimento é proporcional à potência absorvida por unidade de massa. É o mecanismo dominante em altas frequências (acima de ~100 MHz), onde o comprimento de onda é comparável ou menor que as dimensões corporais.

**Mecanismo não-térmico (efeitos em membranas e interfaces):** Campos EM de baixa intensidade podem influenciar processos bioquímicos sem aquecimento significativo. Mecanismos propostos incluem:

- Polarização de interfaces membrana-célula (efeito de Maxwell-Wagner)
- Modulação de canais iônicos por campos elétricos
- Alteração na permeabilidade de membranas celulares
- Efeitos em reações químicas com momentos de dipolo

### Taxa de Absorção Específica — SAR

A grandeza usada para quantificar a absorção de energia EM por tecido biológico é a **Taxa de Absorção Específica** (*Specific Absorption Rate*, SAR), definida como a potência absorvida por unidade de massa de tecido. Para campo elétrico interno senoidal expresso em valor **RMS**:

$$
\boxed{\text{SAR} = \frac{\sigma |\vec{E}|^2}{\rho} \quad [\text{W/kg}]}
$$

onde:

- $\sigma$ é a condutividade elétrica do tecido (S/m)
- $\vec{E}$ é o vetor campo elétrico interno ao tecido (V/m)
- $\rho$ é a densidade do tecido (kg/m³)

**Definição:** A SAR é a taxa de conversão de energia eletromagnética em energia térmica por unidade de massa de tecido biológico. Sua unidade no SI é W/kg.

**Convenção de amplitude:** se $E_0$ for amplitude de pico de uma senoide, $E_{\mathrm{RMS}}=E_0/\sqrt2$ e a SAR média temporal será $\sigma E_0^2/(2\rho)$. Misturar valor de pico com fórmula RMS introduz erro de fator 2.

Para uma onda plana que incide sobre um meio, o campo elétrico interno $\vec{E}$ está relacionado ao campo incidente $\vec{E}_i$ pelos coeficientes de transmissão da interface. Em geral, a SAR não é uniforme no corpo — varia com a frequência, polarização e orientação da onda em relação ao corpo.

**Penetração nos tecidos:** A profundidade de penetração (skin depth) determina a profundidade na qual a intensidade do campo decai a $1/e$ de seu valor superficial:

$$
\boxed{\delta = \frac{1}{\alpha} = \sqrt{\frac{2}{\omega \mu \sigma}} = \sqrt{\frac{1}{\pi f \mu \sigma}} \quad [\text{m}]}
$$

onde $\alpha$ é a constante de atenuação, $\omega = 2\pi f$, $\mu$ é a permeabilidade magnética e $\sigma$ é a condutividade.

**Observação:** Em baixas frequências (< 10 MHz), a penetração é profunda (centenas de cm). Em frequências de micro-ondas (1–10 GHz), a penetração é de poucos mm a cm, concentrando a absorção na superfície. No intervalo de ressonância corporal (~70–100 MHz), a penetração é máxima e a absorção total é maximizada.

## Fundamentos Físicos da Radiação EM

### Espectro Eletromagnético

O espectro eletromagnético abrange desde frequências extremamente baixas (ELF) até raios gama. Para fins de compatibilidade eletromagnética (EMC), as faixas de interesse são aquelas que podem causar interferência ou efeitos biológicos em frequências não-ionizantes.

O espectro relevante para EMC e efeitos biológicos:

| Faixa | Nome | Faixa de Frequência | Comprimento de Onda |
|---|---|---|---|
| ELF | Extremely Low Frequency | 3 Hz – 3 kHz | > 100 Mm |
| VLF | Very Low Frequency | 3 – 30 kHz | 10 – 100 Mm |
| LF | Low Frequency | 30 – 300 kHz | 1 – 10 Mm |
| MF | Medium Frequency | 300 kHz – 3 MHz | 100 – 1 Mm |
| HF | High Frequency | 3 – 30 MHz | 10 – 100 km |
| VHF | Very High Frequency | 30 – 300 MHz | 1 – 10 km |
| UHF | Ultra High Frequency | 300 MHz – 3 GHz | 10 cm – 1 m |
| SHF | Super High Frequency | 3 – 30 GHz | 1 – 10 cm |
| EHF | Extremely High Frequency | 30 – 300 GHz | 1 – 10 mm |

### Energia do Fóton e Ionização

A radiação EM pode ser descrita como um fluxo de fótons. A energia de cada fóton é proporcional à frequência da radiação:

$$
\boxed{E = hf = \frac{hc}{\lambda}}
$$

onde:

- $h = 6{,}626 \times 10^{-34}\,\text{J·s}$ é a constante de Planck
- $f$ é a frequência (Hz)
- $c = 2{,}998 \times 10^8\,\text{m/s}$ é a velocidade da luz no vácuo
- $\lambda$ é o comprimento de onda (m)

**Teorema: Limite de Ionização**

Radiação com energia de fóton maior que a energia de ionização de moléculas biológicas (tipicamente > 10–12 eV para DNA e água) é classificada como **ionizante**, podendo remover elétrons de átomos e moléculas, causando danos diretos ao DNA.

O limite entre radiação ionizante e não-ionizante ocorre aproximadamente na faixa do ultravioleta:

$$
\boxed{f_{\text{ion}} \approx 10^{15}\,\text{Hz}, \quad \lambda_{\text{ion}} \approx 300\,\text{nm}}
$$

Para $f < f_{\text{ion}}$ (ou $\lambda > 300\,\text{nm}$), a radiação é **não-ionizante** — a faixa de interesse para EMC.

**Resultado: Energia de fótons em faixas de EMC**

Energia do fóton para frequências típicas de EMC:

$$
E = hf = (6{,}626 \times 10^{-34}\,\text{J·s}) \times f
$$

- EM de potência (50 Hz): $E \approx 3{,}3 \times 10^{-32}\,\text{eV}$
- FM 100 MHz: $E \approx 4{,}1 \times 10^{-7}\,\text{eV}$
- Wi-Fi 2,4 GHz: $E \approx 1{,}0 \times 10^{-5}\,\text{eV}$
- 5G mmWave 28 GHz: $E \approx 1{,}2 \times 10^{-4}\,\text{eV}$
- UV limite ionização (~10¹⁵ Hz): $E \approx 4{,}1\,\text{eV}$

**Importante:** A energia dos fótons na faixa de EMC é ordens de magnitude menor que a energia de ligação de moléculas biológicas (~1–10 eV). Portanto, **radiações na faixa de EMC são não-ionizantes** e não podem causar ionização direta nem danos ao DNA por esse mecanismo.

### Escopo de RF e exposição humana

As diretrizes ICNIRP 2020 para exposição humana a RF cobrem de $100\,\text{kHz}$ a $300\,\text{GHz}$. Elas são diretrizes de proteção contra exposição, não normas de compatibilidade eletromagnética de equipamentos. Requisitos regulatórios e métodos de avaliação devem ser consultados na edição aplicável à jurisdição e ao produto.

## Efeitos Térmicos das Radiações

### Absorção de Energia e Aquecimento Tecidual

A potência absorvida por unidade de volume em um tecido dielétrico é:

$$
\boxed{Q = \sigma |\vec{E}|^2 \quad [\text{W/m}^3]}
$$

onde $\sigma$ é a condutividade do tecido e $\vec{E}$ é o campo elétrico RMS no interior do tecido. Esta potência é convertida em calor, elevando a temperatura do tecido.

Para um volume de massa $m$ e calor específico $c$, o aumento de temperatura no tempo $t$ é:

$$
\boxed{\Delta T = \frac{\text{SAR} \cdot t}{c} = \frac{\sigma |\vec{E}|^2 \cdot t}{\rho \cdot c}}
$$

onde:

- $c$ é o calor específico do tecido (J/(kg·K)), tipicamente ~3500 J/(kg·K) para a maioria dos tecidos
- $\rho$ é a densidade (kg/m³)

### Equação de Bioheat Transfer de Pennes

A distribuição de temperatura em tecidos biológicos é governada pela **Equação de Bioheat Transfer** proposta por Pennes (1948):

$$
\boxed{\rho c \frac{\partial T}{\partial t} = \nabla \cdot (k \nabla T) + \rho_b c_b \omega_b (T_a - T) + Q}
$$

onde:

- $T(\vec{r},t)$ é a temperatura (K)
- $\rho$ é a densidade do tecido (kg/m³)
- $c$ é o calor específico (J/(kg·K))
- $k$ é a condutividade térmica (W/(m·K))
- $\rho_b$ é a densidade do sangue (kg/m³)
- $c_b$ é o calor específico do sangue (J/(kg·K))
- $\omega_b$ é a taxa de fluxo sanguíneo por unidade de volume (1/s)
- $T_a$ é a temperatura arterial (K)
- $Q$ é a densidade de potência absorvida da EM (W/m³)

**Termos da equação:**

1. **$\rho c \frac{\partial T}{\partial t}$** — taxa de variação temporal de energia térmica
2. **$\nabla \cdot (k \nabla T)$** — condução de calor no tecido
3. **$\rho_b c_b \omega_b (T_a - T)$** — troca de calor com o sangue perfundindo (efeito de resfriamento)
4. **$Q$** — fonte de aquecimento por absorção de energia EM

### Termorregulação do Organismo

O corpo humano possui mecanismos eficientes de termorregulação:

- **Vasodilatação periférica:** aumento do fluxo sanguíneo para a pele, transportando calor para a superfície
- **Sudorese (suor):** evaporação remove ~2400 J/g de calor
- **Aumento da respiração:** perda de calor por convecção e evaporação
- **Redução do metabolismo:** diminuição da produção interna de calor

Quando a taxa de aquecimento por SAR excede a capacidade de termorregulação, ocorre hipertermia. O limiar de desconforto térmico é aproximadamente $\Delta T \approx 1\,\text{°C}$. Aumento de $5\,\text{°C}$ pode causar danos teciduais irreversíveis.

### Ressonância Corporal

Quando o comprimento de onda da radiação incidente é comparável às dimensões corporais, ocorre ressonância, maximizando a absorção. Para um corpo humano médio (~1,7 m de altura), a frequência de ressonância fundamental é:

$$
\boxed{f_{\text{res}} \approx \frac{c}{2L_{\text{body}}} \approx \frac{3 \times 10^8}{2 \times 1{,}7} \approx 88\,\text{MHz}}
$$

Em frequências próximas a $f_{\text{res}}$, o corpo absorve mais energia (SAR máximo) e o comprimento de onda é tal que o corpo se comporta como uma antena eficiente.

**Observação:** A ressonância corporal é um fenômeno de acoplamento eletromagnético entre a onda incidente e a geometria do corpo. Na ressonância, a seção de absorção é maximizada e o SAR médio corporal pode ser significativamente maior que em frequências fora da ressonância.

## Limites de Exposição — Normas ICNIRP e IEEE

> **Uso responsável:** os valores apresentados são material didático. Avaliações reais exigem a edição oficial, regras nacionais, dosimetria adequada e análise de incerteza. As diretrizes ICNIRP 2020 de RF abrangem $100\,\text{kHz}$ a $300\,\text{GHz}$.

### Diretrizes ICNIRP 2020

A **Comissão Internacional de Proteção contra Radiações Não-Ionizantes** (ICNIRP) publica diretrizes de exposição. A publicação de RF de **2020 cobre 100 kHz a 300 GHz**. Frequências inferiores são tratadas em outras diretrizes; não se deve combinar tabelas de documentos diferentes como se pertencessem a uma única edição.

**Princípio das diretrizes:** Os limites são estabelecidos em dois níveis:

1. **Restrições básicas** — grandezas internas ou absorvidas ligadas aos efeitos estabelecidos, como SAR e densidade de potência absorvida;
2. **Níveis de referência** — grandezas externas mais diretamente mensuráveis, como $E$, $H$ e densidade de potência incidente, derivadas para cenários especificados.

Os campos de referência são derivados dos limites básicos usando modelos de exposição e coeficientes de conversão conservadores.

### Limites de SAR — Ocupacional vs. Público

Para exposição de pelo menos 30 minutos, as restrições básicas ICNIRP 2020 incluem os valores abaixo. A faixa exata e as condições de média temporal/espacial devem ser lidas na tabela oficial.

**Limites básicos ICNIRP 2020:**

| Grandeza | Ocupacional | Público Geral |
|---|---|---|
| SAR médio corporal | 0,4 W/kg | 0,08 W/kg |
| SAR local cabeça/torso, média sobre 10 g cúbicos | 10 W/kg | 2 W/kg |
| SAR local membros, média sobre 10 g cúbicos | 20 W/kg | 4 W/kg |

**Definição:** Exposição **ocupacional** aplica-se a indivíduos expostos como consequência de sua ocupação, após avaliação e controle específicos. Exposição do **público geral** aplica-se à população incluindo grupos sensíveis (crianças, idosos, doentes).

Acima de 6 GHz, a proteção local passa a ser formulada principalmente em termos de **densidade de potência absorvida**, com regras próprias de área e tempo de média. Isso evita extrapolar SAR local para uma faixa em que a absorção se concentra superficialmente.

### Densidade de Potência e níveis de referência

A densidade de potência de uma onda plana é:

$$
\boxed{S = \frac{|\vec{E}|^2}{\eta_0} = \frac{|\vec{H}|^2 \eta_0} \quad [\text{W/m}^2]}
$$

onde $\eta_0 = \sqrt{\frac{\mu_0}{\varepsilon_0}} \approx 377\,\Omega$ é a impedância intrínseca do vácuo.

No campo distante de uma onda plana, $S=E_{\mathrm{RMS}}^2/\eta_0=\eta_0H_{\mathrm{RMS}}^2$. Perto de antenas, contudo, $E/H$ pode não valer $\eta_0$, e medir somente uma componente não basta. Além disso, os níveis de referência ICNIRP são funções por trechos, com condições de média e regras de soma para múltiplas frequências.

**Procedimento pedagógico seguro:** (1) identifique frequência e categoria de exposição; (2) determine se o cenário é próximo ou distante; (3) consulte a linha da tabela oficial; (4) aplique médias espacial e temporal; (5) agregue contribuições multifrequência conforme a regra; (6) inclua incerteza. Este capítulo não reproduz uma curva simplificada porque omitir qualquer desses passos pode inverter uma conclusão.

<!-- slides: columns -->

### Normas IEEE C95.1-2019

A norma **IEEE C95.1-2019** cobre 0 Hz a 300 GHz e usa uma estrutura própria de *dosimetric reference limits* e *exposure reference levels*. Ela não deve ser convertida em ICNIRP por um fator único.

Diferenças de terminologia, faixa, área/massa de média, tempo de média e categoria de exposição impedem copiar um número isolado entre documentos. “Mais conservadora” só faz sentido depois de fixar a mesma frequência, geometria, grandeza e regra de média.

<!-- slides: column -->

### Brasil: da diretriz à exigência regulatória

No Brasil, a **Lei nº 11.934/2009** estabelece limites de exposição humana e a Anatel regulamenta a avaliação associada a estações transmissoras pela **Resolução nº 700/2018**. Requisitos técnicos complementares foram atualizados pelo **Ato nº 17.865/2023**, que substituiu o Ato nº 458/2019. Para equipamentos portáteis próximos ao corpo, consulte o requisito técnico vigente da família; a orientação da Anatel informa limite de $2\,\text{W/kg}$ para cabeça e tronco, avaliado como maior média em 10 g de tecido contíguo.

**Distinção essencial:** ICNIRP e IEEE publicam diretrizes/padrões técnicos; a obrigação legal decorre da norma adotada pela jurisdição. Demonstrar conformidade requer o método regulatório aplicável, não apenas comparar uma simulação simples com um número da diretriz.

<!-- slides: end-columns -->
## Efeitos Não-Térmicos

### Estimulação Nervosa e Muscular

Campos magnéticos variáveis no tempo induzem campos elétricos nos tecidos pela lei de Faraday:

$$
\boxed{\nabla \times \vec{E} = -\frac{\partial \vec{B}}{\partial t} \quad\Rightarrow\quad \oint_C \vec{E} \cdot d\vec{\ell} = -\frac{d}{dt}\int_S \vec{B} \cdot d\vec{A}}
$$

Para um campo magnético sinusoidal $B(t) = B_0 \sin(\omega t)$, a densidade de corrente induzida em um tecido com condutividade $\sigma$ é:

$$
\boxed{J = \sigma E}
$$

Os nervos e músculos são estimulados por correntes elétricas induzidas. O limiar de percepção depende da frequência:

- **Baixas frequências (< 100 Hz):** a corrente induzida diretamente estimula nervos, causando sensação de formigamento ou contração muscular
- **Frequências intermediárias (100 Hz – 10 kHz):** limiar de percepção mais baixo, risco de estimulação cardíaca
- **Altas frequências (10 kHz – 10 MHz):** a corrente induzida é distribuída pelo corpo, efeito de estimulação diminui
- **RF suficientemente alta:** a absorção e o aquecimento passam a dominar as restrições; não descreva a estimulação como “inexistente” por causa de uma fronteira única, pois a transição depende da frequência e da forma temporal.

Valores de limiar dependem da frequência, forma de onda, duração, região anatômica e métrica dosimétrica. Por isso, uma densidade de corrente escalar genérica não deve ser usada como “limiar de percepção” universal.

### Efeitos em Frequências de Ressonância

Na frequência de ressonância corporal ($\approx 70$–100 MHz), a interação campo-organismo é maximizada. O campo elétrico interno ao corpo pode ser significativamente amplificado em relação ao campo externo:

$$
\boxed{E_{\text{int}} \approx \chi \cdot E_{\text{ext}}}
$$

onde $\chi$ é o fator de acoplamento, que pode atingir valores de 3–5 na ressonância para ondas polarizadas verticalmente.

### Efeitos em Frequências de Rádio (RF)

Estudos epidemiológicos têm investigado possíveis efeitos à saúde da exposição crônica a RF de baixa intensidade, particularmente de telefonia celular:

- **Estudo INTERPHONE:** não encontrou evidência causal consistente entre uso de celular e glioma ou meningioma
- **Estudo NTP (EUA):** exposição crônica a campos de RF em SAR de 1,5 e 6 W/kg em ratos mostrou aumento de tumores cardíacos (schwannomas) em machos, mas os níveis de SAR foram muito acima dos limites de exposição
- **Avaliação IARC (2011):** campos de RF são classificados como "possivelmente cancerígenos para humanos" (Grupo 2B), com base em evidência limitada

**Comunicação responsável:** a existência de lacunas de conhecimento não autoriza concluir risco nem ausência absoluta de risco. Avaliações devem separar perigo, exposição e risco, usar revisões sistemáticas e aplicar os limites e procedimentos adotados pela jurisdição competente.

### Resumo dos Efeitos Não-Térmicos

| Regime | Interação relevante | Grandeza que o estudante deve procurar |
|---|---|---|
| Baixas frequências | estimulação de nervos e sentidos por campo interno induzido | campo elétrico interno, com média espacial e temporal definida |
| Transição para RF | estimulação e aquecimento podem exigir avaliação conjunta | restrições básicas da diretriz aplicável |
| RF | absorção de energia e aumento de temperatura | SAR de corpo inteiro/local e respectivas médias |
| RF mais alta, absorção superficial | aquecimento localizado na superfície | densidade de potência absorvida com área/tempo de média |

Esta tabela organiza mecanismos; não fornece limiares clínicos. Os valores de proteção devem vir da diretriz e jurisdição vigentes.

## Dispositivos Portáteis e Exposição do Público

### Smartphones e SAR

Os smartphones são fontes de RF de uso próximo ao corpo. Cada modelo vendido comercialmente deve atender a limites de SAR.

**Limites máximos de SAR para dispositivos portáteis:**

| Região/regime ilustrativo | Massa de média | Limite local cabeça/torso |
|---|---|---|
| EUA (FCC) | 1 g | 1,6 W/kg |
| ICNIRP 2020, público geral | 10 g cúbicos | 2,0 W/kg |
| Brasil (requisito Anatel citado) | 10 g de tecido contíguo | 2,0 W/kg |

Os números não são diretamente intercambiáveis: mudar a massa/forma de média altera o máximo obtido. A certificação deve seguir o método e os requisitos da jurisdição, inclusive posição, separação, modos de transmissão e incerteza.

A medição de SAR é feita com phantoms (simuladores de tecido) preenchidos com líquido dielétrico que simula as propriedades do tecido humano, usando sondas de campo elétrico para mapear o SAR espacial.

### Antena no Corpo e Distância de Uso

Para um dispositivo com potência de transmissão $P_{\text{tx}}$ e ganho de antena $G$, a densidade de potência a uma distância $r$ (na região de campo distante) é:

$$
\boxed{S(r) = \frac{P_{\text{tx}} \cdot G}{4\pi r^2} \quad [\text{W/m}^2]}
$$

A distância de transição entre campo próximo e campo distante é:

$$
\boxed{r_{\text{far}} \approx \frac{2D^2}{\lambda}}
$$

onde $D$ é a dimensão máxima da antena.

**Estimativa de triagem em campo distante:** se a fonte puder ser aproximada por radiação isotrópica no campo distante, a distância na qual a estimativa $PG/(4\pi r^2)$ cruza um valor de triagem $S_t$ é:

$$
\boxed{r_t = \sqrt{\frac{P_{\text{tx}} \cdot G}{4\pi S_t}}}
$$

Como ilustração puramente algébrica, para $P_{\text{tx}}=0{,}25\,\text{W}$, $G=1$ e $S_t=10\,\text{W/m}^2$:

$$
r_t \approx \sqrt{\frac{0{,}25}{4\pi \cdot 10}} \approx 0{,}045\,\text{m} \approx 4{,}5\,\text{cm}
$$

Esse resultado **não é uma distância de segurança**: junto ao telefone, o campo pode ser próximo, a antena não é isotrópica e a avaliação de dispositivo junto ao corpo usa dosimetria/SAR ou potência absorvida conforme o método aplicável. Antes de usar a expressão, verifique $r_t>r_{\rm far}$ e as demais hipóteses.

### 5G e Millimeter-Wave

A tecnologia 5G utiliza bandas de frequência mais altas, incluindo mmWave (24–47 GHz). Nessas frequências:

- A absorção torna-se mais superficial à medida que a frequência aumenta; a profundidade quantitativa depende da permissividade complexa do tecido e da definição de penetração
- A energia é absorvida principalmente na pele e nos olhos
- O SAR médio corporal é baixo, mas o SAR local na superfície pode ser significativo

Não aplique automaticamente a aproximação de profundidade pelicular de bom condutor. Em tecido, calcule $\alpha$ a partir de $\gamma=\sqrt{j\omega\mu(\sigma+j\omega\varepsilon)}$ usando propriedades dielétricas na frequência desejada e então use $\delta=1/\alpha$ para decaimento de amplitude.

### Wi-Fi, Bluetooth e Níveis Típicos de Exposição

Níveis típicos de densidade de potência em ambientes internos:

| Fonte hipotética | Potência usada | Distância usada | $PG/(4\pi r^2)$ com $G=1$ |
|---|---|---|---|
| Roteador | 0,1 W | 1 m | $0{,}008\,\text{W/m}^2$ |
| Dispositivo junto ao corpo | 0,2 W | 0,03 m | fórmula não apropriada sem verificar campo distante |
| Dispositivo de baixa potência | 0,001 W | 0,02 m | fórmula não apropriada sem verificar campo distante |
| Transmissor remoto | 10 W | 10 m | $0{,}008\,\text{W/m}^2$ |

**Importante:** a tabela acima é apenas uma estimativa idealizada; não prova conformidade nem representa toda instalação. Exposição real depende de potência efetiva, ciclo de atividade, ganho, distância, campo próximo, reflexões e múltiplas fontes. Dispositivos e estações devem ser avaliados pelo procedimento aplicável.

## Exercícios Resolvidos em Python

### Protocolo computacional

**Objetivo:** explorar SAR, potência absorvida e aquecimento sem emitir diagnóstico médico ou declaração de conformidade. **Rastreabilidade:** declare frequência, tecido, média espacial/temporal e fonte dos parâmetros. **Validação:** diferencie campo externo, campo interno, restrição básica e nível de referência.

### Cálculo de SAR para Campo Elétrico Dado

**Exercício:** Calcule a SAR em tecido muscular para um campo elétrico interno de $E = 50\,\text{V/m}$ RMS. Use $\sigma = 1{,}53\,\text{S/m}$ e $\rho = 1068\,\text{kg/m}^3$.

```python
import numpy as np

def sar_calc(E, sigma, rho):
    """Calcula SAR a partir do campo elétrico interno.
    
    Parâmetros:
        E: campo elétrico RMS (V/m)
        sigma: condutividade do tecido (S/m)
        rho: densidade do tecido (kg/m³)
    
    Retorna:
        SAR em W/kg
    """
    return sigma * E**2 / rho

# Parâmetros de tecido muscular a ~1 GHz
sigma_muscle = 1.53      # S/m
rho_muscle = 1068        # kg/m³
E_field = 50.0           # V/m

sar = sar_calc(E_field, sigma_muscle, rho_muscle)
print(f"SAR no tecido muscular com E={E_field} V/m: {sar:.3f} W/kg")

# Comparação com limites
sar_limite_geral = 0.08     # W/kg (SAR médio corporal, público)
sar_limite_local = 2.0      # W/kg (SAR em 10g, público)
print(f"Limite SAR médio corporal (público): {sar_limite_geral} W/kg")
print(f"Limite SAR local 10g (público): {sar_limite_local} W/kg")
print(f"Margem em relação ao limite local: {sar_limite_local/sar:.1f}x")
```

### Auditoria de uma avaliação de exposição

Em vez de programar uma curva normativa de memória, construa uma ficha de auditoria. Para cada ponto de medição, registre:

| Campo | Pergunta de verificação |
|---|---|
| Fonte normativa | Qual documento, edição, emenda, Ato e cláusula? |
| Cenário | Público ou ocupacional? Campo próximo ou distante? |
| Grandeza | $E$, $H$, potência incidente, potência absorvida ou SAR? |
| Média | Qual duração, área, massa e forma geométrica de média? |
| Multifrequência | Como as contribuições foram combinadas? |
| Instrumentação | Faixa, isotropia, calibração, linearidade e resposta temporal? |
| Incerteza | Qual orçamento e qual regra de decisão? |

**Atividade:** use a tabela oficial vigente para preencher essa ficha em uma frequência escolhida. Depois implemente apenas a conversão ou soma explicitamente prescrita e faça dois testes de unidade. Isso ensina rastreabilidade e evita transformar código desatualizado em falsa evidência de segurança.

### Simulação de Aquecimento Tecidual

```python
import numpy as np
import matplotlib.pyplot as plt

def aquecimento_tecidual(SAR, tempo, c=3500.0, T_inicial=37.0):
    """Simula o aumento de temperatura devido à absorção de SAR.
    
    Parâmetros:
        SAR: taxa de absorção específica (W/kg)
        tempo: array de tempos (s)
        c: calor específico do tecido (J/(kg·K))
        T_inicial: temperatura inicial (°C)
    
    Retorna:
        T: array de temperaturas (°C)
    """
    # Equação: dT/dt = SAR / c  →  T(t) = T_inicial + (SAR/c) * t
    dTdt = SAR / c
    T = T_inicial + dTdt * tempo
    return T

def aquecimento_com_termorregulacao(SAR, tempo, c=3500.0, 
                                    rho_b=1060, c_b=3620, 
                                    omega_b=0.001, T_arterial=37.0,
                                    k_termo=0.001):
    """Simula aquecimento com termorregulação (modelo simplificado de Pennes).
    
    dT/dt = SAR/c - omega_b * (rho_b * c_b / (rho * c)) * (T - T_arterial)
    """
    rho = 1060.0
    T = np.zeros_like(tempo)
    T[0] = T_arterial
    dt = np.diff(tempo, prepend=0)
    for i in range(1, len(tempo)):
        # Termo de aquecimento EM
        Q = SAR / c
        # Termo de resfriamento por perfusão sanguínea
        perfusion_rate = omega_b * rho_b * c_b / (rho * c)
        T[i] = T[i-1] + (Q - perfusion_rate * (T[i-1] - T_arterial)) * dt[i]
    return T

# Parâmetros
SAR_baixo = 0.08      # W/kg (limite público)
SAR_medio = 1.0       # W/kg
SAR_alto = 10.0       # W/kg
tempo = np.linspace(0, 3600, 1000)  # 1 hora

# Simulação sem termorregulação
T_baixo = aquecimento_tecidual(SAR_baixo, tempo)
T_medio = aquecimento_tecidual(SAR_medio, tempo)
T_alto = aquecimento_tecidual(SAR_alto, tempo)

# Simulação com termorregulação
T_baixo_tr = aquecimento_com_termorregulacao(SAR_baixo, tempo)
T_medio_tr = aquecimento_com_termorregulacao(SAR_medio, tempo)
T_alto_tr = aquecimento_com_termorregulacao(SAR_alto, tempo)

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))

# Sem termorregulação
ax1.plot(tempo/60, T_baixo, label=f'SAR = {SAR_baixo} W/kg')
ax1.plot(tempo/60, T_medio, label=f'SAR = {SAR_medio} W/kg')
ax1.plot(tempo/60, T_alto, label=f'SAR = {SAR_alto} W/kg')
ax1.axhline(38.0, color='red', linestyle='--', alpha=0.5, label='Limiar desconforto (38°C)')
ax1.axhline(42.0, color='darkred', linestyle='--', alpha=0.5, label='Dano tecidual (42°C)')
ax1.set_xlabel('Tempo [min]')
ax1.set_ylabel('Temperatura [°C]')
ax1.set_title('Aquecimento Tecidual (sem termorregulação)')
ax1.legend(fontsize=8)
ax1.grid(alpha=0.3)

# Com termorregulação
ax2.plot(tempo/60, T_baixo_tr, label=f'SAR = {SAR_baixo} W/kg')
ax2.plot(tempo/60, T_medio_tr, label=f'SAR = {SAR_medio} W/kg')
ax2.plot(tempo/60, T_alto_tr, label=f'SAR = {SAR_alto} W/kg')
ax2.axhline(38.0, color='red', linestyle='--', alpha=0.5)
ax2.set_xlabel('Tempo [min]')
ax2.set_ylabel('Temperatura [°C]')
ax2.set_title('Aquecimento Tecidual (com termorregulação)')
ax2.legend(fontsize=8)
ax2.grid(alpha=0.3)

plt.tight_layout()
```

**Saída esperada:**

- **Cálculo de SAR:** SAR ≈ $0{,}112\,\text{W/kg}$ para $E = 50\,\text{V/m}$ em músculo — abaixo do limite local de $2\,\text{W/kg}$
- **Auditoria normativa:** frequência e um valor de campo não bastam; documento, cenário, grandeza, médias, multifrequência e incerteza fazem parte da conclusão
- **Aquecimento tecidual:** sem termorregulação, SAR de $10\,\text{W/kg}$ eleva a temperatura em ~2 °C em 1 hora. Com termorregulação, o equilíbrio térmico mantém o aumento abaixo de 0,1 °C

## Lista de Exercícios Propostos

**E.1** Um colega propõe calcular a profundidade de penetração no tecido usando $\delta=\sqrt{1/(\pi f\mu\sigma)}$ apenas com $\sigma=0{,}04\,\text{S/m}$. Verifique a hipótese de bom condutor $\sigma\gg\omega\varepsilon$ e explique quais dados faltam para um cálculo confiável em 900 MHz, 2,4 GHz e 28 GHz. Escreva a expressão geral usando a constante de propagação complexa.

**E.2** Um campo elétrico interno de $E = 200\,\text{V/m}$ é medido no tecido cerebral de uma pessoa exposta a uma fonte de RF. Calcule a SAR no cérebro ($\sigma = 0{,}91\,\text{S/m}$, $\rho = 1050\,\text{kg/m}^3$). Este valor excede o limite de SAR local (2,0 W/kg)?

**E.3** Determine a frequência de ressonância de um corpo humano de altura $h = 1{,}75\,\text{m}$ e de um criança de altura $h = 1{,}1\,\text{m}$. Compare com as faixas de frequência de Wi-Fi e celular.

**E.4** Uma onda de densidade de potência incidente $S=5\,\text{W/m}^2$ atinge tecido com $\sigma=1{,}0\,\text{S/m}$. Explique por que $S$, $\sigma$, $c$ e $\rho$ não bastam para obter a taxa local de aquecimento. Se uma análise dosimétrica independente fornecer $\text{SAR}=0{,}25\,\text{W/kg}$ no ponto, calcule a taxa inicial adiabática para $c=3500\,\text{J/(kg·K)}$.

**E.5** Calcule a energia de um fóton em: (a) 50 Hz (rede elétrica); (b) 100 MHz (FM); (c) 2,4 GHz (Wi-Fi); (d) 28 GHz (5G mmWave); (e) 550 THz (luz visível verde). Compare com a energia de ionização da água (~12,6 eV).

**E.6** Em um modelo térmico concentrado, $d\Delta T/dt=\text{SAR}/c-\beta\Delta T$. Para $\text{SAR}=0{,}8\,\text{W/kg}$, $c=3500\,\text{J/(kg·K)}$ e $\beta=2{,}0\times10^{-3}\,\text{s}^{-1}$, obtenha $\Delta T(t)$ para $\Delta T(0)=0$, o valor de equilíbrio e a constante de tempo. Liste duas limitações do modelo.

**E.7** Para uma fonte hipotética com $P_{\text{tx}}=0{,}5\,\text{W}$, $G=2$, dimensão máxima $D=0{,}10\,\text{m}$ e $f=900\,\text{MHz}$, calcule a distância de triagem correspondente a $S_t=10\,\text{W/m}^2$ pela fórmula isotrópica. Verifique $r_t>2D^2/\lambda$ e explique o alcance da conclusão.

**E.8** Determine a impedância intrínseca $\eta$ de um tecido muscular a 1 GHz, dado $\varepsilon_r' = 52$, $\sigma = 1{,}53\,\text{S/m}$:

$$
\eta = \sqrt{\frac{j\omega\mu}{\sigma + j\omega\varepsilon_0\varepsilon_r'}}
$$

Calcule o módulo e o ângulo de fase.

**E.9** Em um modelo homogêneo a 80 MHz, a SAR média é $0{,}3\,\text{W/kg}$, com $\sigma=0{,}8\,\text{S/m}$ e $\rho=1000\,\text{kg/m}^3$. Calcule o campo RMS interno equivalente. Explique por que não é válido convertê-lo em densidade de corrente e compará-lo com um limiar de estimulação de outra frequência/documento.

**E.10** (Desafio) Derive a expressão do SAR em termos da densidade de potência incidente $S_0$ e da seção de absorção $A_{\text{abs}}$:

$$
\text{SAR}_{\text{médio}} = \frac{S_0 \cdot A_{\text{abs}}}{m}
$$

Estime $A_{\text{abs}}$ para um corpo humano como $\approx 0{,}8\,\text{m}^2$ e $m \approx 70\,\text{kg}$, e calcule o SAR médio para $S_0 = 10\,\text{W/m}^2$.

**E.11** (Desafio) O coeficiente de reflexão na interface ar-tecido para uma onda normal é:

$$
\Gamma = \frac{\eta_{\text{tecido}} - \eta_0}{\eta_{\text{tecido}} + \eta_0}
$$

Calcule $|\Gamma|^2$ (fração de potência refletida) para tecido muscular a 900 MHz. Qual fração da potência incidente é refletida?

**E.12** Calcule a densidade de corrente local $J=\sigma E$ em tecido muscular ($\sigma=1{,}53\,\text{S/m}$) para um campo elétrico interno $E=10\,\text{V/m}$. Explique por que esse cálculo isolado não basta para declarar conformidade com uma diretriz de exposição.

## Exemplo quantitativo com incerteza

Para $SAR=\sigma E_{rms}^2/\rho$, considere $\sigma=1{,}0\pm0{,}15$ S/m, $E=40\pm4$ V/m e $\rho=1000\pm30$ kg/m³ como exemplo didático. A não linearidade em $E^2$ torna útil a propagação Monte Carlo.

```python
import numpy as np
rng = np.random.default_rng(16)
n = 200_000
sigma = rng.normal(1.0, .15, n)
E = rng.normal(40, 4, n)
rho = rng.normal(1000, 30, n)
valid = (sigma > 0) & (E > 0) & (rho > 0)
sar = sigma[valid]*E[valid]**2/rho[valid]
print('SAR (W/kg), percentis:', np.percentile(sar, [2.5, 50, 97.5]))
```

O resultado não deve ser comparado automaticamente a um limite: média espacial/temporal, tecido, frequência, população e condição de exposição precisam coincidir com a avaliação aplicável.

## Gabarito

**E.1** A expressão proposta é a aproximação de bom condutor e exige $\sigma\gg\omega\varepsilon$. Como o enunciado não fornece $\varepsilon_r(f)$ e os tecidos são dispersivos, a hipótese nem sequer pode ser testada. Use
$\gamma=\alpha+j\beta=\sqrt{j\omega\mu(\sigma+j\omega\varepsilon)}$ e defina profundidade de penetração de amplitude como $\delta=1/\alpha$. São necessários $\varepsilon'(f)$, perdas (por $\sigma$ efetiva ou $\varepsilon''$), temperatura e a convenção do banco de propriedades. Os três números anteriormente obtidos pela fórmula de bom condutor não são respostas confiáveis para tecido em RF.

**E.2** $\text{SAR} = \dfrac{\sigma E_{\rm RMS}^2}{\rho} = \dfrac{0{,}91 \cdot 200^2}{1050} \approx 34{,}7\,\text{W/kg}$, supondo que os $200\,\text{V/m}$ sejam RMS e que os parâmetros sejam locais. Esse valor local calculado não pode ser comparado diretamente com $2\,\text{W/kg}$ sem obter a maior média sobre 10 g cúbicos e a média temporal prescrita. Ele sinaliza necessidade de avaliação dosimétrica completa; o exercício não autoriza diagnóstico de perigo individual.

**E.3** $f_{\text{res}} \approx \dfrac{c}{2h}$:

- Adulto (1,75 m): $f_{\text{res}} \approx \dfrac{3\times 10^8}{2 \cdot 1{,}75} \approx 86\,\text{MHz}$
- Criança (1,1 m): $f_{\text{res}} \approx \dfrac{3\times 10^8}{2 \cdot 1{,}1} \approx 136\,\text{MHz}$
O modelo de meia onda prevê que a menor altura desloca a frequência para cima. Ele é apenas uma aproximação geométrica: postura, aterramento, orientação, propriedades dos tecidos e ambiente alteram o acoplamento. Não permite concluir genericamente que crianças “absorvem mais”; isso exige dosimetria comparável por frequência e cenário.

**E.4** A potência incidente não determina o campo interno: faltam frequência, permissividade complexa, reflexão, geometria e distribuição do campo. Dada separadamente a SAR local, a taxa inicial adiabática é $dT/dt=\text{SAR}/c=0{,}25/3500=7{,}14\times10^{-5}\,\text{K/s}\approx0{,}257\,\text{K/h}$. Esse valor inicial despreza condução e perfusão e não deve ser extrapolado linearmente por longos períodos.

**E.5** $E = hf = hf / (1{,}602\times 10^{-19})\,\text{eV}$:

- (a) 50 Hz: $E = 3{,}3\times 10^{-13}\,\text{eV}$
- (b) 100 MHz: $E = 4{,}1\times 10^{-7}\,\text{eV}$
- (c) 2,4 GHz: $E = 9{,}9\times 10^{-6}\,\text{eV}$
- (d) 28 GHz: $E = 1{,}2\times 10^{-4}\,\text{eV}$
- (e) 550 THz: $E = 2{,}3\,\text{eV}$
Apenas a luz visível (e) está próxima da energia de ionização (~12,6 eV); todas as faixas de RF estão ~10⁴–10¹⁹ vezes abaixo.

**E.6** A solução da EDO é $\Delta T(t)=\dfrac{\text{SAR}}{c\beta}(1-e^{-\beta t})$. Logo $\Delta T_\infty=0{,}8/[3500(0{,}002)]=\boxed{0{,}114\,\text{K}}$ e $\tau=1/\beta=\boxed{500\,\text{s}}$. O modelo concentra a temperatura em um único nó e lineariza a remoção de calor; não representa gradientes espaciais, condução, perfusão variável, metabolismo ou termorregulação não linear.

**E.7** $r_t=\sqrt{PG/(4\pi S_t)}\approx\boxed{0{,}089\,\text{m}}$. Em 900 MHz, $\lambda\approx0{,}333\,\text{m}$ e $r_{\rm far}=2(0{,}10)^2/0{,}333\approx0{,}060\,\text{m}$; portanto $r_t>r_{\rm far}$ nesse modelo. Isso valida apenas a consistência da aproximação usada, não certifica um aparelho nem define distância segura: padrão de radiação, corpo, reflexões, ciclo de atividade, múltiplas fontes e método regulatório não foram modelados.

**E.8** $\varepsilon = \varepsilon_0 \varepsilon_r' - j\dfrac{\sigma}{\omega} = 8{,}854\times 10^{-12} \cdot 52 - j\dfrac{1{,}53}{2\pi \cdot 10^9}$. $\omega\varepsilon_0\varepsilon_r' = 2\pi \cdot 10^9 \cdot 8{,}854\times 10^{-12} \cdot 52 \approx 2{,}90\,\text{S/m}$. Como $\sigma = 1{,}53\,\text{S/m}$, a perda por condução é significativa mas menor que a polarização. $\eta \approx \sqrt{\dfrac{j\omega\mu_0}{\sigma + j\omega\varepsilon}} \approx 57 + j5{,}2\,\Omega$. $|\eta| \approx 57{,}2\,\Omega$.

**E.9** $E_{\text{RMS}}=\sqrt{\text{SAR}\,\rho/\sigma}=\sqrt{0{,}3(1000)/0{,}8}\approx\boxed{19{,}4\,\text{V/m}}$. Trata-se de um campo equivalente do modelo homogêneo. Uma comparação de $J=\sigma E$ com um limite de baixa frequência seria inválida porque a métrica, frequência, média espacial e base normativa diferem; em 80 MHz, a avaliação deve seguir as restrições RF aplicáveis.

**E.10** $\text{SAR}_{\text{médio}} = \dfrac{S_0 \cdot A_{\text{abs}}}{m} = \dfrac{10 \cdot 0{,}8}{70} \approx 0{,}114\,\text{W/kg}$. Abaixo do limite de $0{,}08\,\text{W/kg}$? Não — ligeiramente acima. $A_{\text{abs}}$ depende fortemente da frequência e orientação.

**E.11** $\Gamma = \dfrac{\eta_{\text{tecido}} - 377}{\eta_{\text{tecido}} + 377}$. A 900 MHz, $\eta_{\text{tecido}} \approx \sqrt{\dfrac{j\omega\mu_0}{\sigma + j\omega\varepsilon}} \approx 45 + j7\,\Omega$. $|\Gamma|^2 = \left|\dfrac{45+j7-377}{45+j7+377}\right|^2 \approx \left|\dfrac{-332+j7}{422+j7}\right|^2 \approx 0{,}62$. ~62% da potência incidente é refletida.

**E.12** $J=\sigma E=1{,}53\cdot10=15{,}3\,\text{A/m}^2$. Esse é um valor local do modelo constitutivo. Uma conclusão de conformidade ainda exige frequência, distribuição espacial, grandeza básica aplicável, média espacial/temporal, incerteza e método de dosimetria definidos pela edição normativa adotada. Não se deve converter esse único valor em uma declaração de segurança por comparação com um limite de outra faixa de frequência.
