# Fontes de Ruído Eletromagnético — Natural, Industrial e Artificial

> Compatibilidade Eletromagnética — Apostila de Curso
> Tópicos: Classificação de fontes · Ruído natural (atmosférico, cósmico, térmico) · Ruído industrial (chaveamento, arcos) · Telecomunicações · Dispositivos domésticos · CISPR e limites · Análises em Python

## Antes de começar

Ao final, você deve classificar fontes por origem, espectro, repetitividade, modo e impedância, relacionando $dV/dt$ e $dI/dt$ aos caminhos de acoplamento. **Diagnóstico:** a frequência de chaveamento é necessariamente a maior frequência relevante para EMC? **Evidência mínima:** prever harmônicos a partir do tempo de subida e confrontar a previsão com uma FFT corretamente escalada.

## Sumário

1. [Classificação das Fontes de Ruído Eletromagnético](#classificação-das-fontes-de-ruído-eletromagnético)
2. [Fontes Naturais de Ruído](#fontes-naturais-de-ruído)
3. [Fontes Industriais de Ruído — Chaveamento](#fontes-industriais-de-ruído--chaveamento)
4. [Fontes Industriais — Arcos Elétricos e Solda](#fontes-industriais--arcos-elétricos-e-solda)
5. [Telecomunicações e Transmissores](#telecomunicações-e-transmissores)
6. [Dispositivos Domésticos e Pessoais](#dispositivos-domésticos-e-pessoais)
7. [Exercícios Resolvidos em Python](#exercícios-resolvidos-em-python)
8. [Lista de Exercícios Propostos](#lista-de-exercícios-propostos)
9. [Gabarito](#gabarito)

## Classificação das Fontes de Ruído Eletromagnético

A **compatibilidade eletromagnética** (EMC) exige que todo equipamento eletrônico opere em um ambiente eletromagnético sem sofrer degradação e sem emitir interferências além dos limites estabelecidos por normas. O primeiro passo para qualquer análise de EMC é identificar e classificar as **fontes de ruído** presentes no ambiente.

<!-- slides: break -->

### Fontes Naturais vs. Artificiais

Toda fonte de interferência eletromagnética (EMI) pertence a uma das duas categorias fundamentais:

| Categoria | Origem | Exemplos |
| --- | --- | --- |
| **Natural** | Fenômenos da natureza | Relâmpagos, radiação cósmica, ruído térmico, auroras |
| **Artificial** | Equipamentos e sistemas fabricados | Conversores DC-DC, transmissores, motores, computadores |

**Observação:** A distinção é importante porque as estratégias de mitigação são radicalmente diferentes. Fontes naturais são incontroláveis — a mitigação é feita por projeto do receptor (blindagem, filtragem, redução de ganho). Fontes artificiais podem ser controladas na origem (projeto do emissor, blindagem da fonte, filtragem de emissão).

### Espectro de Interferências no Ambiente RF

O espectro eletromagnético de interferências varia enormemente em frequência, potência e temporalidade. A figura conceitual a seguir esquematiza as principais regiões:

```
Frequência (Hz)    Fonte Dominante
──────────────────────────────────────────────────────
   0 – 10 kHz      Ruído galáctico + descargas atmosféricas
  10 kHz – 1 MHz   Ruído atmosférico intenso + ruído industrial
   1 – 30 MHz      Transmissores AM + ruído industrial + atmosférico residual
  30 – 300 MHz      Transmissores FM/TV + ruído térmico dominante
 300 MHz – 3 GHz    Telecomunicações (celular, Wi-Fi) + chaveamento digital
   3 – 30 GHz       Enlaces de micro-ondas + radar + ruído atmosférico
  30 GHz – 300 GHz   Absorção atmosférica (H₂O, O₂) + ruído térmico
```

### Classificação por Natureza Temporal

Além da origem, as fontes são classificadas pela **natureza do sinal** que geram.

**Contínua vs. Impulsiva:**

$$
\boxed{
\begin{array}{ll}
\text{Contínua (CW):} & s(t) = A\cos(2\pi f_0 t + \phi) \\
\text{Impulsiva:} & s(t) = \sum_{k} A_k \cdot p(t - t_k)
\end{array}
}
$$

onde $p(t)$ é um pulso com duração finita e $t_k$ são instantes de ocorrência estocásticos.

**Narrowband vs. Broadband:**

Uma fonte é **narrowband** quando sua energia está concentrada em uma banda estreita $\Delta f \ll f_c$:

$$
\boxed{S_{\text{narrow}}(f) \approx P_0 \cdot \delta(f - f_c) * W(f)}
$$

com $W(f)$ uma janela de largura $\Delta f$ centrada em $f_c$. Fontes narrowband típicas: transmissores de rádio, osciladores.

Uma fonte é **broadband** quando sua densidade espectral de potência (PSD) se estende sobre uma faixa ampla:

$$
\boxed{S_{\text{broad}}(f) \propto f^{-\alpha}, \quad \alpha > 0}
$$

Fontes broadband típicas: descargas elétricas, chaveamento de cargas indutivas, ruído térmico.

**Definição:** Uma fonte de ruído é caracterizada por quatro parâmetros fundamentais: (i) faixa de frequência de emissão, (ii) potência/espectro, (iii) natureza temporal (contínua/impulsiva), e (iv) mecanismo de acoplamento (conduzido ou irradiado).

## Fontes Naturais de Ruído

### Ruído Atmosférico (Descargas Elétricas)

O ruído atmosférico é gerado por **relâmpagos** — descargas eletrostáticas entre nuvens e entre nuvens e o solo. Cada relâmpago gera um pulso de corrente com duração de alguns microssegundos e amplitude de dezenas a centenas de quilamperes.

O espectro médio do ruído atmosférico é modelado pela **fórmula de Robinson** (ITU-R P.372):

$$
\boxed{P_{\text{atmos}}(f) \propto \frac{1}{1 + \left(\dfrac{f}{f_c}\right)^2}}
$$

com $f_c \approx 10\,\text{kHz}$. Acima desta frequência de corte, o ruído atmosférico decai com $6\,\text{dB}/\text{octave}$ (ou $20\,\text{dB}/\text{decada}$).

**Importante:** A intensidade do ruído atmosférico depende de:

- **Distância do equador** — máximo em regiões tropicais (maior atividade convectiva)
- **Hora do dia** — máximo durante a tarde (pico de atividade de tempestades)
- **Estação do ano** — máximo no verão
- **Topografia** — áreas montanhosas podem ter maior densidade de raios

O **índice de ruído atmosférico** $N$ em decibéis acima de $kTB$ (onde $k$ é a constante de Boltzmann, $T = 290\,\text{K}$, e $B$ é a largura de banda) é dado pela ITU-R P.372:

$$
N(f, \lambda) = A + B \cdot e^{-C(f-1)} + D(\lambda) \cdot e^{-E(f-1)}
$$

onde $f$ está em GHz, $\lambda$ é a latitude geográfica, e $A$–$E$ são parâmetros empíricos tabelados.

### Ruído Cósmico

A radiação cósmica de fundo e a radiação sincrotrão do Sol e de fontes extragalácticas contribuem para o ruído recebido por antenas orientadas para o céu. Para frequências abaixo de $\approx 1\,\text{GHz}$, a **temperatura de ruído do céu** é bem aproximada por:

$$
\boxed{T_{\text{sky}}(f) \approx 25\,000 \left(\frac{f}{1\,\text{MHz}}\right)^{-2.55}\,\text{K}}
$$

Esta lei de potência descreve a emissão sincrotrão de elétrons relativísticos nos campos magnéticos galácticos. A dependência $f^{-2.55}$ é característica de espectros sincrotrón com distribuição de energia de elétrons $N(E) \propto E^{-p}$, onde $p \approx 2.7$.

Para $f = 100\,\text{MHz}$:

$$
T_{\text{sky}}(100\,\text{MHz}) \approx 25\,000 \cdot (10^8)^{-2.55} = 25\,000 \cdot 10^{-20.4} \approx 0{,}063\,\text{K}
$$

Para $f = 10\,\text{MHz}$:

$$
T_{\text{sky}}(10\,\text{MHz}) \approx 25\,000 \cdot (10^7)^{-2.55} \approx 25\,000 \cdot 10^{-17.85} \approx 1\,330\,\text{K}
$$

**Observação:** A temperatura de ruído efetiva vista por uma antena é:

$$
T_{\text{ant}} = \eta_{\text{ant}} T_{\text{sky}} + (1 - \eta_{\text{ant}}) T_{\text{ground}}
$$

onde $\eta_{\text{ant}}$ é a eficiência de radiação e $T_{\text{ground}} \approx 290\,\text{K}$ é a temperatura física do solo. Para antenas com lóbulo principal baixo no horizonte, $T_{\text{ground}}$ domina.

### Ruído Térmico de Johnson-Nyquist

Todo condutor em equilíbrio térmico gera uma **tensão de ruído** devido ao movimento térmico aleatório dos portadores de carga. Este é o **ruído de Johnson-Nyquist**, fundamental em toda análise de sensibilidade de receptores.

**Teorema de Johnson-Nyquist (regime clássico):** um resistor $R$ à temperatura absoluta $T$ apresenta, em circuito aberto, PSD unilateral de tensão aproximadamente constante:

$$
\boxed{S_{V}(f) = 4\,k_B\,T\,R \quad [\text{V}^2/\text{Hz}]}
$$

onde $k_B = 1{,}381 \times 10^{-23}\,\text{J/K}$ é a constante de Boltzmann.

**Convenção:** aqui $S_V(f)$ é unilateral ($f\ge0$) e $B$ é a largura de banda equivalente de ruído. Na convenção bilateral, cada lado possui $2k_BTR$. A aproximação branca clássica requer $hf\ll k_BT$; não se integra $4k_BTR$ até frequência infinita.

A tensão RMS medida em uma banda $B$ é:

$$
\boxed{V_n = \sqrt{4\,k_B\,T\,R\,B}}
$$

Da mesma forma, a potência de ruído disponível (potência máxima transferível para uma carga casada) é:

$$
\boxed{P_n = k_B\,T\,B}
$$

Em decibéis em relação a 1 watt ($\text{dBW}$):

$$
P_n\,[\text{dBW}] = 10\log_{10}(k_B T B)
$$

Para $T = 290\,\text{K}$ e $B = 1\,\text{Hz}$:

$$
k_B T = (1{,}381 \times 10^{-23})(290) \approx 4{,}005 \times 10^{-21}\,\text{W}
$$

$$
k_B T\,[\text{dBW/Hz}] = 10\log_{10}(4{,}005 \times 10^{-21}) \approx -204\,\text{dBW/Hz}
$$

Em unidades de $\text{dBm/Hz}$ ($1\,\text{mW} = 10^{-3}\,\text{W}$):

$$
k_B T\,[\text{dBm/Hz}] = -204 + 30 = \boxed{-174\,\text{dBm/Hz}}
$$

**Este número — $-174\,\text{dBm/Hz}$ a $290\,\text{K}$ — é um dos mais importantes em telecomunicações.**

**Exemplo:** Calcule a tensão de ruído RMS de um resistor de $50\,\Omega$ a $T = 300\,\text{K}$ em uma banda de $B = 10\,\text{MHz}$:

$$
V_n = \sqrt{4 \cdot (1{,}381\times 10^{-23}) \cdot 300 \cdot 50 \cdot (10\times 10^6)}
$$

$$
V_n = \sqrt{4 \cdot 1{,}381 \cdot 300 \cdot 50 \cdot 10^{-17}} = \sqrt{8{,}286 \times 10^{-13}} \approx 9{,}10 \times 10^{-7}\,\text{V} = 910\,\text{nV RMS}
$$

### Ruído de Fundo Cósmico (CMB)

O **Fundo Cósmico de Micro-ondas** (CMB — Cosmic Microwave Background) é a radiação eletromagnética remanescente do Big Bang, com espectro de corpo negro a $T_{\text{CMB}} \approx 2{,}725\,\text{K}$. Sua contribuição para o ruído de antena é significativa apenas em frequências acima de $\approx 5\,\text{GHz}$, onde o ruído cósmico sincrotrón já decaiu enormemente.

A densidade espectral de potência do CMB é dada pela **lei de Planck**:

$$
\boxed{B_{\nu}(T) = \frac{2h\nu^3}{c^2} \cdot \frac{1}{e^{h\nu/(k_B T)} - 1}}
$$

No limite de baixas frequências ($h\nu \ll k_B T$), recupera-se a **lei de Rayleigh-Jeans**:

$$
B_{\nu}(T) \approx \frac{2\nu^2}{c^2} k_B T
$$

### Limite de Friis para Sensibilidade do Receptor

O piso de sensibilidade de um receptor é determinado pelo ruído referido à entrada e pelo critério de detecção. Não confunda a **equação de transmissão de Friis** (potência recebida em um enlace) com a **fórmula de Friis para ruído** (cascata de fatores de ruído); são resultados diferentes associados ao mesmo autor.

**Equação de sensibilidade:** a potência mínima detectável depende do ruído total referido à entrada e da SNR mínima exigida. Há duas formas equivalentes, desde que não sejam misturadas.

Se a fonte está na temperatura padrão $T_0=290\,\text{K}$ e o receptor tem fator de ruído $F$:

$$
\boxed{P_{\text{min}}=k_BT_0BF\,(SNR)_{\text{min}}}
$$

Se a antena tem temperatura $T_{\text{ant}}$ e o receptor adiciona temperatura equivalente $T_e=(F-1)T_0$:

$$
\boxed{P_{\text{min}}=k_B(T_{\text{ant}}+T_e)B\,(SNR)_{\text{min}}}
$$

onde $T_{\text{sys}}=T_{\text{ant}}+T_e$ (mais outras contribuições referidas ao mesmo plano). Portanto,

$$
\boxed{P_{\text{min}}=k_BT_{\text{sys}}B\,(SNR)_{\text{min}}}.
$$

**Erro comum:** não multiplique $k_BT_{\text{sys}}B$ por $F$ se $T_{\text{sys}}$ já inclui $T_e$; isso contaria o ruído do receptor duas vezes.

Nas expressões:

- $T_{\text{sys}}$ é a temperatura de ruído total referida à entrada,
- $B$ é a largura de banda,
- $(SNR)_{\text{min}}$ é a relação sinal-ruído mínima necessária para detecção,
- $F$ é o **fator de ruído** do receptor (em linear).

O **fator de ruído** é definido como:

$$
\boxed{F \equiv \frac{(SNR)_{\text{in}}}{(SNR)_{\text{out}}} \geq 1}
$$

Em decibéis:

$$
F_{\text{dB}} = 10\log_{10} F
$$

Para um amplificador com ganho $G$ e fator de ruído $F$, a temperatura de ruído equivalente é:

$$
\boxed{T_e = (F - 1) T_0}
$$

onde $T_0 = 290\,\text{K}$ é a temperatura de referência.

Para estágios em cascata, a **fórmula de Friis para fator de ruído** é:

$$
\boxed{F_{\text{total}} = F_1 + \frac{F_2 - 1}{G_1} + \frac{F_3 - 1}{G_1 G_2} + \cdots}
$$

**Importante:** O primeiro estágio é dominante. Por isso, LNA (Low-Noise Amplifier) com baixo $F$ e alto $G$ é sempre o primeiro componente na cadeia de recepção.

Mais precisamente, o LNA deve aparecer cedo, depois das perdas passivas inevitáveis e da proteção necessária. Um filtro ou cabo antes dele adiciona sua perda ao orçamento e degrada a figura de ruído; “sempre o primeiro componente” não é uma regra física absoluta.

## Fontes Industriais de Ruído — Chaveamento

### Conversores DC-DC, Inversores e Drives de Motor

Fontes chaveadas são a **fonte de ruído industrial mais ubíqua**. Inversores, drives de motor, fontes chaveadas de alimentação e conversores DC-DC operam abrindo e fechando chaves eletrônicas (MOSFETs, IGBTs) a frequências de dezenas de kHz a dezenas de MHz.

O mecanismo fundamental de geração de ruído é o **chaveamento**: uma transição rápida entre dois estados gera harmônicos em larga faixa de frequência e correntes/transições de tensão elevadas.

### Forma de Onda de Chaveamento e Harmônicos

Considere um conversor buck básico com onda quadrada de tensão. A tensão de saída é uma onda quadrada de amplitude $V_{dc}$ e período $T = 1/f_s$, com ciclo de serviço $D$:

$$
v(t) = \begin{cases}
V_{dc}, & 0 \leq t < DT \\
0, & DT \leq t < T
\end{cases}
$$

expandindo em série de Fourier:

$$
\boxed{v(t) = D V_{dc} + \sum_{n=1}^{\infty} \frac{2V_{dc}}{n\pi} \sin(n\pi D) \cos(n\omega_0 t)}
$$

com $\omega_0 = 2\pi f_s$. Os harmônicos têm amplitudes:

$$
V_n = \frac{2V_{dc}}{n\pi} |\sin(n\pi D)|
$$

Para onda quadrada simétrica ($D = 0{,}5$):

$$
\boxed{v(t) = \frac{V_{dc}}{2} + \sum_{k=0}^{\infty} \frac{4V_{dc}}{(2k+1)\pi} \sin((2k+1)\omega_0 t)}
$$

Somente harmônicos ímpares. O $n$-ésimo harmônico decai com $1/n$ (ou $-20\,\text{dB}/\text{decada}$).

### dV/dt e dI/dt como Mecanismos de Acoplamento

As transições rápidas de chaveamento geram altos valores de dV/dt e dI/dt, que são os **mecanismos primários de acoplamento de EMI**:

**Acoplamento capacitivo (via dV/dt):**

$$
\boxed{i_{\text{coupled}} = C_{\text{parasita}} \frac{dV}{dt}}
$$

onde $C_{\text{parasita}}$ é a capacitância parasita entre a chave e o circuito sensível.

**Acoplamento indutivo (via dI/dt):**

$$
\boxed{v_{\text{coupled}} = M \frac{dI}{dt}}
$$

onde $M$ é a indutância mútua parasita entre o laço de comutação e o circuito afetado.

**Exemplo:** Um MOSFET chaveando $400\,\text{V}$ em $t_r = 10\,\text{ns}$ com $C_p = 1\,\text{pF}$ gera:

$$
i_{\text{coupled}} = 10^{-12} \cdot \frac{400}{10 \times 10^{-9}} = 40\,\text{mA}
$$

Esta corrente injetada em um circuito de medição de $1\,\text{k}\Omega$ gera $40\,\text{V}$ de interferência.

### Frequência de Chaveamento e Espectro de EMI

O espectro de emissão de uma fonte chaveada possui três regiões distintas (modelagem de McCroskey):

1. **Região de harmônicos discretos** ($f < 1/(2\pi\tau_r)$): harmônicos da frequência de chaveamento com decaimento $-20\,\text{dB}/\text{decada}$
2. **Região de transição** ($f \approx 1/(2\pi\tau_r)$): pico de máxima emissão
3. **Região de decaimento rápido** ($f > 1/(2\pi\tau_r)$): decaimento $-40\,\text{dB}/\text{decada}$

onde $\tau_r$ é o tempo de subida da chave.

A **frequência de corte do espectro** é:

$$
\boxed{f_{\text{max}} \approx \frac{0{,}35}{\tau_r}}
$$

Reduzir $\tau_r$ aumenta a largura de banda das emissões (piora EMI), mas aumentar $\tau_r$ aumenta as perdas de chaveamento ($P_{\text{sw}} \propto \tau_r$). Este é um **trade-off fundamental** do projeto EMC.

### Mitigação de Ruído de Chaveamento

As técnicas principais são:

1. **Snubbers** (RC ou RCD) — reduzem dV/dt e dI/dt
2. **Filtros EMI** (LC, π, T) — atenuam emissões conduzidas
3. **Blindagem** — contêm emissões irradiadas
4. **Spread Spectrum Clocking** — espalham energia harmônica
5. **Layout otimizado** — minimizar laços de comutação e acoplamentos parasitas

## Fontes Industriais — Arcos Elétricos e Solda

### Ruído de Solda

Processos de solda (MIG, TIG, eletrodo revestido) geram ruído de banda larga através do **arco elétrico** — um plasma condutor com temperatura de $5\,000$ a $20\,000\,\text{K}$. O espectro do ruído de solda segue uma lei de potência:

$$
\boxed{S_{\text{weld}}(f) \propto f^{-\alpha}}
$$

com $\alpha$ tipicamente entre $0{,}5$ e $2{,}0$, dependendo do tipo de solda e dos parâmetros de processo.

O arco de solda se comporta como um **gerador de corrente aleatória** com componentes em toda a faixa de RF. As emissões podem ser particularmente intensas entre $10\,\text{kHz}$ e $100\,\text{MHz}$.

**Definição:** Uma fonte de arco elétrico é modelada como um resistor não-linear variável no tempo:

$$
R_{\text{arc}}(t) = \frac{V_{\text{arc}}}{I_{\text{arc}}(t)}
$$

com $V_{\text{arc}} \approx 20\text{--}50\,\text{V}$ e $I_{\text{arc}}$ com flutuações aleatórias de alta frequência.

### Motores com Escovas

Motores DC com escovas de carbono geram EMI por **faiscamento** entre as escovas e o comutador. A cada comutação, há uma faísca transiente com espectro de banda larga:

$$
S_{\text{brush}}(f) \propto \frac{1}{f} \quad \text{(ruído tipo } 1/f \text{ adicional ao térmico)}
$$

As faíscas são pulsos de duração $\tau \approx 1\text{--}10\,\text{ns}$, o que implica componentes espectrais até $f_{\text{max}} \approx 35\text{--}350\,\text{MHz}$.

### Fornos a Arco

Fornos a arco (usados na siderurgia) são fontes de interferência de **altíssima potência**. Modelados como fontes de corrente impulsivas:

$$
\boxed{I_{\text{arc}}(t) = \sum_{k} I_k \cdot \exp\left(-\frac{(t - t_k)^2}{2\sigma^2}\right) \cos(2\pi f_c (t - t_k))}
$$

onde $I_k$ é a amplitude do $k$-ésimo pulso, $\sigma$ controla a largura temporal e $f_c \approx 50\text{--}60\,\text{Hz}$ é a frequência da rede.

**Importante:** Fornecedores a arco podem injetar **correntes de sequência negativa** e harmônicas na rede elétrica, afetando todo o sistema de distribuição.

## Telecomunicações e Transmissores

### Transmissores de Rádio, TV e Celular

Transmissores de comunicação são fontes **intencionais** de ruído — eles emitem sinais, mas podem causar interferência não-intencional quando seus harmônicos, intermodulações ou emissões espúrias atingem frequências não autorizadas.

### Potência Irradiada Efetiva (EIRP)

A **potência irradiada efetiva** é a potência aparente irradiada por um transmissor, incluindo o ganho da antena e as perdas do cabo:

$$
\boxed{EIRP = P_{\text{trans}} + G_{\text{ant}} - L_{\text{cable}}}
$$

Todas as grandezas em $\text{dBW}$ (ou $\text{dBm}$). Em linear:

$$
EIRP_{\text{linear}} = P_{\text{trans}} \cdot G_{\text{ant}} \cdot L_{\text{cable}}
$$

onde $P_{\text{trans}}$ é a potência do transmissor, $G_{\text{ant}}$ é o ganho da antena (linear, $>1$), e $L_{\text{cable}}$ é a perda do cabo (linear, $<1$).

**Exemplo:** Transmissor de $10\,\text{W}$ ($40\,\text{dBm}$), antena com ganho de $15\,\text{dBi}$, cabo com perda de $2\,\text{dB}$:

$$
EIRP = 40 + 15 - 2 = 53\,\text{dBm} = 200\,\text{W}
$$

### Interferência Co-Canal, Adjacente e Intermodulação

**Interferência co-canál:** Dois transmissores na mesma frequência ocupando a mesma área de cobertura. Causa colisão direta.

**Interferência adjacente:** Transmissor em frequência vizinha invade o canal do receptor devido à seletividade finita do filtro do receptor.

**Intermodulação:** Quando dois ou mais sinais de frequências $f_1$ e $f_2$ passam por um componente não-linear (amplificador, conector oxidado, etc.), são geradas frequências de intermodulação:

$$
\boxed{f_{IM3} = 2f_1 - f_2 \quad \text{e} \quad f_{IM3}' = 2f_2 - f_1}
$$

Estas são as **intermodulações de terceira ordem**, as mais problemáticas pois caem próximas aos sinais originais e são difíceis de filtrar.

O **ponto de intercepção de terceira ordem** (IP3) é um parâmetro de especificação:

$$
\boxed{P_{IM3} = 3P_{\text{in}} - 2IP3}
$$

onde $P_{IM3}$ e $P_{\text{in}}$ estão em dBm e IP3 é em dBm. A **interceptação** ocorre quando $P_{IM3} = P_{\text{in}}$, logo:

$$
IP3 = \frac{3P_{\text{in}} - P_{IM3}}{2}
$$

### Interferência Co-Canal em Sistemas Celulares

A relação sinal-interferência (SIR) em uma célula com reutilização de frequência é:

$$
\boxed{SIR = \frac{P_r(d_0)}{P_r(d_i)} = \left(\frac{d_i}{d_0}\right)^{\gamma}}
$$

onde $d_0$ é a distância do transmissor desejado, $d_i$ é a distância dos transmissores co-canais interferentes, e $\gamma$ é o expoente de propagação ($2\text{--}4$ típicos).

## Dispositivos Domésticos e Pessoais

### Wi-Fi, Bluetooth e Micro-ondas

Dispositivos domésticos modernos são fontes significativas de EMI:

| Dispositivo | Frequência | Potência Típica | Tipo de EMI |
| --- | --- | --- | --- |
| Wi-Fi (802.11ac/ax) | 2,4 GHz / 5 GHz / 6 GHz | 100 mW | Narrowband (portadora) |
| Bluetooth | 2,4 GHz | 10 mW | Narrowband (FHSS) |
| Forno micro-ondas | 2,45 GHz | 700–1200 W | Broadband (faiscamento) |
| LED driver | 50 Hz – MHz | Varies | Broadband (chaveamento) |
| Carro elétrico (carregador) | 3–22 kW | 3–22 kW | Broadband (chaveamento) |

### Ruído Conduzido pela Rede Elétrica

Dispositivos com fontes chaveadas injetam ruído na rede elétrica, que se propaga para outros equipamentos conectados à mesma rede. O **ruído conduzido de banda larga** é particularmente problemático em instalações industriais com muitos drives de motor.

A densidade espectral de ruído conduzido de uma fonte chaveada é aproximadamente:

$$
\boxed{V_{\text{noise}}(f) \approx \frac{V_{\text{sw}}}{\pi f L_{\text{line}}} \quad \text{para } f \gg f_s}
$$

onde $V_{\text{sw}}$ é a tensão de chaveamento, $f_s$ é a frequência de chaveamento e $L_{\text{line}}$ é a indutância do cabo de alimentação.

### CISPR 32 / EN 55032 — Norma de Emissão

A norma **CISPR 32** (substituindo CISPR 22 e CISPR 13) estabelece os limites de emissão para equipamentos de multimídia. Aborda:

- **Emissões conduzidas** (150 kHz – 30 MHz)
- **Emissões irradiadas** (30 MHz – 6 GHz)

Os limites são especificados em dBµV para emissões conduzidas e dBµV/m para irradiadas, com duas bandas de medida:

- **Quasi-peak (QP)** — para sinais repetitivos e impulsivos
- **Média (Average)** — para sinais contínuos

## Exercícios Resolvidos em Python

### Protocolo computacional

**Objetivo:** caracterizar ruído térmico, espectro de chaveamento, EIRP e intermodulação. **Reprodutibilidade:** declare RBW, janela, amostragem e convenção de PSD. **Validação:** confira $kTB$, Friis em unidades lineares, Parseval e inclinações harmônicas esperadas.

### Cálculo de Ruído Térmico e SNR

```python
import numpy as np

# Constantes fundamentais
k_B = 1.381e-23        # J/K - constante de Boltzmann
T0  = 290              # K - temperatura de referencia

def noise_power_bw(T, B):
    """Potencia de ruido termico em uma banda B (Hz)."""
    return k_B * T * B

def noise_power_dBm(T, B):
    """Potencia de ruido em dBm."""
    P_w = noise_power_bw(T, B)
    return 10 * np.log10(P_w / 1e-3)

def noise_voltage(R, T, B):
    """Tensao de ruido RMS de Johnson-Nyquist."""
    return np.sqrt(4 * k_B * T * R * B)

def snr_linear_from_Tsys(P_signal, T_sys, B):
    """SNR com temperatura total de sistema referida a entrada."""
    P_noise = k_B * T_sys * B
    return P_signal / P_noise

def snr_dB_from_Tsys(P_signal_dBm, T_sys, B):
    """SNR em dB; T_sys ja inclui o ruido adicionado pelo receptor."""
    P_signal_w = 1e-3 * 10**(P_signal_dBm / 10)
    return 10 * np.log10(snr_linear_from_Tsys(P_signal_w, T_sys, B))

# --- Exemplo 1: Ruído termico ---
print("=" * 50)
print("EXEMPLO 1: Potencia de ruído termico")
print("=" * 50)

Bands = [1e3, 10e3, 100e3, 1e6, 10e6, 100e6]
for B in Bands:
    P_dBm = noise_power_dBm(T0, B)
    print(f"B = {B/1e6:>8.2f} MHz  ->  P_n = {P_dBm:10.2f} dBm")

# --- Exemplo 2: SNR em um receptor ---
print("\n" + "=" * 50)
print("EXEMPLO 2: SNR de um receptor de radio")
print("=" * 50)

P_sig_dBm = -100          # sinal de -100 dBm
T_sys = 500               # K (sistema com LNA)
B = 200e3                 # 200 kHz (FM)

SNR = snr_dB_from_Tsys(P_sig_dBm, T_sys, B)
print(f"Sinal: {P_sig_dBm} dBm")
print(f"Banda: {B/1e3:.0f} kHz")
print(f"Temperatura total de sistema: {T_sys} K")
print(f"SNR de saida: {SNR:.1f} dB")

# --- Exemplo 3: Fator de ruido em cascata ---
print("\n" + "=" * 50)
print("EXEMPLO 3: Fator de ruido em cascata (Friis)")
print("=" * 50)

# Estagio 1: LNA, G1 = 20 dB, F1 = 2 dB
# Estagio 2: Filtro, G2 = -3 dB, F2 = 5 dB
# Estagio 3: Amplificador, G3 = 15 dB, F3 = 8 dB
G1_dB, F1_dB = 20, 2
G2_dB, F2_dB = -3, 5
G3_dB, F3_dB = 15, 8

G1 = 10**(G1_dB/10)
F1 = 10**(F1_dB/10)
F2 = 10**(F2_dB/10)
F3 = 10**(F3_dB/10)

F_total = F1 + (F2 - 1)/G1 + (F3 - 1)/(G1 * 10**(G2_dB/10))
F_total_dB = 10*np.log10(F_total)

print(f"F_total = {F_total_dB:.2f} dB")
print(f"  Contribuicoes: F1={F1:.2f} + (F2-1)/G1={(F2-1)/G1:.4f} + (F3-1)/(G1*G2)={(F3-1)/(G1*10**(G2_dB/10)):.4f}")
```

### Simulação de Espectro de Fonte Chaveada (FFT)

```python
import numpy as np
import matplotlib.pyplot as plt

def switching_wave(D, Vdc, num_harm=50):
    """
    Gera uma onda quadrada de chaveamento e seus coeficientes de Fourier.
    D = duty cycle, Vdc = amplitude DC.
    Retorna coeficientes harmonicos até num_harm.
    """
    a0 = D * Vdc
    harmonics = []
    for n in range(1, num_harm + 1):
        an = (2 * Vdc / (n * np.pi)) * np.sin(n * np.pi * D)
        harmonics.append(an)
    return a0, np.array(harmonics)

def plot_switching_spectrum(D=0.5, Vdc=12.0, max_harm=100):
    """Plota o espectro de uma onda quadrada de chaveamento."""
    a0, harmonics = switching_wave(D, Vdc, max_harm)
    f = np.arange(1, max_harm + 1)
    amp_linear = np.abs(harmonics)

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

    # Grafico linear
    ax1.stem(f, amp_linear, linefmt='b-', markerfmt='bo', basefmt='k-')
    ax1.set_xlabel('Numero do Harmônico (n)')
    ax1.set_ylabel('Amplitude (V)')
    ax1.set_title(f'Espectro de Onda Quadrada (D={D}, Vdc={Vdc}V)')
    ax1.grid(True, alpha=0.3)
    ax1.set_xlim(0, max_harm)

    # Grafico em dB
    amp_dB = 20 * np.log10(amp_linear + 1e-12)
    ax2.semilogy(f, amp_linear, 'b-', linewidth=1.5, label='Espectro real')
    ref = amp_linear[0] * (f / f[0])**(-1)
    ax2.semilogy(f, ref, 'r--', linewidth=1, alpha=0.5, label='-20 dB/dec')
    ax2.set_xlabel('Numero do Harmônico (n)')
    ax2.set_ylabel('Amplitude (V) log')
    ax2.set_title('Espectro em Escala Log')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    ax2.set_xlim(0, max_harm)

    plt.tight_layout()
    plt.savefig('/tmp/spectrum.png', dpi=150)
    plt.show()

    # Decaimento dos harmonicos
    if D == 0.5:
        odd_h = harmonics[::2]  # impares
        ratios = np.abs(odd_h[:-1] / odd_h[1:])
        print(f"Relacoes de decaimento (impares): {ratios[:5]}")
        print(f"Esperado: cada par diminui por fator ~{2*odd_h[0]/odd_h[1]:.1f}")

plot_switching_spectrum()
```

### Plot de Curva de Ruído Atmosférico vs. Frequência

```python
import numpy as np
import matplotlib.pyplot as plt

def atmos_noise_index(f_MHz, latitude=0, time=6):
    """
    Modelo simplificado de ruido atmosferico (ITU-R P.372).
    f_MHz: frequencia em MHz, latitude: latitude geografica.
    Retorna N em dB acima de kTB.
    """
    f = f_MHz / 1e3  # converter para GHz
    A = 118.0 + 30 * np.log10(f + 0.1)
    B = 20.0 * np.exp(-f * 0.5)
    C = 5.0 * (1 + 0.1 * abs(latitude))
    N = A + B + C - 10 * np.log10(1 + (f / 0.01)**2)
    return np.maximum(N, 0)

# Gerar grafico
f_kHz = np.logspace(0, 5, 1000)  # 1 kHz a 100 MHz
f_MHz = f_kHz / 1e3
N_trop = atmos_noise_index(f_MHz, latitude=0)    # equador
N_mid  = atmos_noise_index(f_MHz, latitude=40)   # temperada
N_pol  = atmos_noise_index(f_MHz, latitude=70)   # polar

fig, ax = plt.subplots(figsize=(10, 6))
ax.semilogx(f_MHz, N_trop, 'b-', linewidth=2, label='Equador (0 deg)')
ax.semilogx(f_MHz, N_mid,  'r-', linewidth=2, label='Temperada (40 deg)')
ax.semilogx(f_MHz, N_pol,  'g-', linewidth=2, label='Polar (70 deg)')
ax.set_xlabel('Frequencia (MHz)')
ax.set_ylabel('Indice de Ruido (dB acima de kTB)')
ax.set_title('Ruido Atmosferico vs. Frequencia (ITU-R P.372)')
ax.legend()
ax.grid(True, which='both', alpha=0.3)
ax.set_xlim(0.01, 100)

# Marcar fc = 10 kHz
ax.axvline(0.01, color='k', linestyle='--', alpha=0.3)
ax.text(0.015, ax.get_ylim()[1]*0.9, 'fc ~ 10 kHz', fontsize=9)
plt.tight_layout()
plt.savefig('/tmp/atmos_noise.png', dpi=150)
plt.show()

# Valores numericos
print("\nValores de indice de ruido atmosferico:")
for f in [0.01, 0.1, 1, 10, 100, 1000, 10000]:
    print(f"  f = {f:>8.2f} MHz: N = {atmos_noise_index(f, 0):6.1f} dB")
```

### Cálculo de EIRP e Intermodulação de Terceira Ordem

```python
import numpy as np
import matplotlib.pyplot as plt

def eirp_db(P_trans_dBm, G_ant_dBi, L_cable_dB):
    """Calcula EIRP em dBm."""
    return P_trans_dBm + G_ant_dBi - L_cable_dB

def im3_power(P_in_dBm, IP3_dBm):
    """Potencia do sinal de intermodulacao de terceira ordem."""
    return 3 * P_in_dBm - 2 * IP3_dBm

def ip3_from_measurements(P_in_dBm, P_im3_dBm):
    """Determina IP3 a partir de medidas."""
    return (3 * P_in_dBm - P_im3_dBm) / 2

# --- Exemplo: EIRP ---
print("=" * 50)
print("EXEMPLO: Calculo de EIRP")
print("=" * 50)

P_tx = 40        # dBm (10 W)
G_ant = 15       # dBi
L_cable = 2      # dB
EIRP = eirp_db(P_tx, G_ant, L_cable)
print(f"Transmissor: {P_tx} dBm ({10**(P_tx/10)*1e-3:.1f} W)")
print(f"Ganho da antena: {G_ant} dBi")
print(f"Perda do cabo: {L_cable} dB")
print(f"EIRP = {EIRP} dBm ({10**(EIRP/10)*1e-3:.1f} W)")

# --- Exemplo: Intermodulacao ---
print("\n" + "=" * 50)
print("EXEMPLO: Intermodulacao de Terceira Ordem")
print("=" * 50)

IP3 = 30  # dBm
P_in_range = np.linspace(-30, 10, 100)
P_fund = P_in_range
P_IM3 = 3 * P_in_range - 2 * IP3

fig, ax = plt.subplots(figsize=(9, 5))
ax.plot(P_in_range, P_fund, 'b-', linewidth=2, label='Sinal fundamental')
ax.plot(P_in_range, P_IM3, 'r--', linewidth=2, label='IM3 (2f1 - f2)')
ax.axhline(IP3, color='k', linestyle=':', alpha=0.5)
ax.axvline(IP3, color='k', linestyle=':', alpha=0.5)
ax.text(IP3 + 1, IP3 - 3, f'IP3 = {IP3} dBm', fontsize=10)
ax.set_xlabel('Poder de Entrada (dBm)')
ax.set_ylabel('Poder de Saida (dBm)')
ax.set_title('Intermodulacao de Terceira Ordem')
ax.legend()
ax.grid(True, alpha=0.3)
ax.set_xlim(-30, 10)
ax.set_ylim(-80, 35)
plt.tight_layout()
plt.savefig('/tmp/im3.png', dpi=150)
plt.show()

# Determinar IP3 a partir de medidas
P_in_meas = -10
P_im3_meas = -50
IP3_calc = ip3_from_measurements(P_in_meas, P_im3_meas)
print(f"P_in = {P_in_meas} dBm, P_IM3 = {P_im3_meas} dBm")
print(f"IP3 calculado = {IP3_calc} dBm")
```

## Lista de Exercícios Propostos

Use, quando necessário, $k_B = 1{,}381 \times 10^{-23}\,\text{J/K}$, $T_0 = 290\,\text{K}$, $c = 2{,}998 \times 10^8\,\text{m/s}$, $\eta_0 = 376{,}7\,\Omega$.

**E.1** — Calcule a potência de ruído térmico disponível de um resistor a $T = 300\,\text{K}$ em uma banda de $B = 1\,\text{MHz}$. Expresse o resultado em (a) watts, (b) dBm, (c) dBµW.

**E.2** — Uma antena recebe ruído atmosférico com $T_{\text{sky}} = 15\,000\,\text{K}$ a $f = 5\,\text{MHz}$. O receptor tem fator de ruído $F = 4\,\text{dB}$ e banda $B = 10\,\text{kHz}$. Calcule (a) a temperatura de ruído equivalente $T_e$, (b) a temperatura total do sistema, (c) a potência de ruído na entrada do receptor.

**E.3** — Mostre que para uma onda quadrada simétrica ($D = 0{,}5$), os harmônicos pares são nulos. Deduza a amplitude do 1º, 3º e 5º harmônico.

**E.4** — Um conversor buck opera com $V_{dc} = 48\,\text{V}$, $f_s = 100\,\text{kHz}$ e $D = 0{,}35$. Calcule (a) a componente DC da tensão, (b) a amplitude do 1º harmônico, (c) a amplitude do 5º harmônico, (d) a razão entre o 1º harmônico e a componente DC em dB.

**E.5** — Um MOSFET apresenta uma rampa aproximadamente linear de $0$ a $600\,\text{V}$ em $20\,\text{ns}$. Uma capacitância parasita $C_p=2\,\text{pF}$ acopla o nó a uma entrada. Calcule (a) $dV/dt$ e (b) a corrente durante a rampa. (c) A aproximação $v=iZ$ com $Z=10\,\text{k}\Omega$ produz qual valor? Explique por que ele é apenas uma estimativa local em frequência/tempo e quais elementos faltam para prever a forma e o pico reais.

**E.6** — Um transmissor de $50\,\text{W}$ alimenta uma antena com ganho $G = 12\,\text{dBi}$ através de um cabo com perda de $1{,}5\,\text{dB}$. Calcule (a) o EIRP em dBW, (b) o EIRP em watts, (c) a densidade de potência a $1\,\text{km}$ (assumindo irradiação isotrópica).

**E.7** — Dois transmissores operam em $f_1 = 900\,\text{MHz}$ e $f_2 = 901\,\text{MHz}$ através de um amplificador não-linear com $IP3 = 25\,\text{dBm}$. Calcule (a) as frequências de intermodulação de terceira ordem $f_{IM3}$ e $f_{IM3}'$, (b) se alguma cai dentro da banda $899\text{--}902\,\text{MHz}$.

**E.8** — Um sistema de recepção tem três estágios: LNA ($G_1 = 25\,\text{dB}$, $F_1 = 1{,}5\,\text{dB}$), filtro ($G_2 = -1{,}5\,\text{dB}$, $F_2 = 3\,\text{dB}$), receptor ($G_3 = 30\,\text{dB}$, $F_3 = 6\,\text{dB}$). Calcule o fator de ruído total usando a fórmula de Friis.

**E.9** — Mostre que o ruído térmico de Johnson-Nyquist tem densidade espectral plana (white noise). Considere um resistor $R$ conectado a um amperímetro ideal de banda infinita. Explique por que a potência total de ruído diverge e como isso se resolve fisicamente.

**E.10** — Um forno de micro-ondas opera em $2{,}45\,\text{GHz}$ com potência de $1000\,\text{W}$. Calcule (a) o comprimento de onda, (b) a energia de um fóton em eV, (c) a densidade de potência a $0{,}5\,\text{m}$ (assumindo $G = 0\,\text{dBi}$ isotrópico).

**E.11 (desafio)** — Deduza que, para uma transição de chaveamento com tempo de subida $\tau_r$, a frequência de corte do espectro de emissão é $f_{\text{max}} \approx 0{,}35/\tau_r$. Dica: considere o espectro de um pulso gaussiano de largura $\tau_r$.

**E.12 (desafio)** — Um enunciado afirma: “um receptor com $B=1\,\text{MHz}$, $P_{\min}=-120\,\text{dBm}$ e $T_{\text{sys}}=500\,\text{K}$ permite calcular $F$, SNR de saída e $T_e$”. (a) Mostre por que os dados são insuficientes e parcialmente redundantes; (b) calcule $k_BT_{\text{sys}}B$; (c) determine a SNR mínima implícita; (d) explique quais dados adicionais permitiriam obter $F$ e $T_e$ sem dupla contagem.

## Gabarito

### E1

Dados: $T = 300\,\text{K}$, $B = 1\,\text{MHz} = 10^6\,\text{Hz}$.

(a) Potência em watts:

$$
P_n = k_B T B = (1{,}381 \times 10^{-23}) \cdot 300 \cdot 10^6 = 4{,}143 \times 10^{-15}\,\text{W}
$$

(b) Potência em dBm:

$$
P_n\,[\text{dBm}] = 10\log_{10}\left(\frac{4{,}143 \times 10^{-15}}{10^{-3}}\right) = 10\log_{10}(4{,}143 \times 10^{-12}) = \boxed{-113{,}8\,\text{dBm}}
$$

(c) Potência em dBµW:

$$
P_n\,[\text{dB\mu W}] = 10\log_{10}(4{,}143 \times 10^{-9}) = \boxed{-83{,}8\,\text{dB\mu W}}
$$

### E2

Dados: $T_{\text{sky}} = 15\,000\,\text{K}$, $F = 4\,\text{dB}$, $B = 10^4\,\text{Hz}$.

(a) $F_{\text{lin}} = 10^{4/10} = 2{,}512$. $T_e = (2{,}512 - 1) \cdot 290 = \boxed{438\,\text{K}}$.

(b) $T_{\text{sys}} = 15\,000 + 438 = \boxed{15\,438\,\text{K}}$.

(c) $P_n = k_B T_{\text{sys}} B = 2{,}132 \times 10^{-15}\,\text{W} = \boxed{-116{,}7\,\text{dBm}}$.

### E3

Para $D = 0{,}5$:

$$
V_n = \frac{2V_{dc}}{n\pi} |\sin(n\pi/2)|
$$

Para $n$ par, $n=2m$: $\sin(m\pi) = 0$, logo $V_{2m} = 0$. **Harmônicos pares são nulos.**

Para $n$ ímpar: $|\sin| = 1$:

$$
\boxed{V_1 = \frac{2V_{dc}}{\pi},\; V_3 = \frac{2V_{dc}}{3\pi},\; V_5 = \frac{2V_{dc}}{5\pi}}
$$

### E4

Dados: $V_{dc} = 48\,\text{V}$, $D = 0{,}35$.

(a) $V_{\text{DC}} = 0{,}35 \cdot 48 = \boxed{16{,}8\,\text{V}}$.

(b) $V_1 = \frac{96}{\pi} |\sin(0{,}35\pi)| = 30{,}56 \cdot 0{,}891 = \boxed{27{,}2\,\text{V}}$.

(c) $V_5 = \frac{96}{5\pi} |\sin(1{,}75\pi)| = 6{,}11 \cdot 0{,}707 = \boxed{4{,}32\,\text{V}}$.

(d) $20\log_{10}(27{,}2/16{,}8) = \boxed{4{,}19\,\text{dB}}$.

### E5

Dados: $V = 600\,\text{V}$, $t_r = 20\,\text{ns}$, $C_p = 2\,\text{pF}$, $Z = 10\,\text{k}\Omega$.

(a) $\frac{dV}{dt} = \frac{600}{20 \times 10^{-9}} = \boxed{30\,\text{V/ns}}$.

(b) $i_{\text{coupled}} = 2 \times 10^{-12} \cdot 3 \times 10^{10} = \boxed{60\,\text{mA}}$.

(c) A substituição direta dá $v=iZ=(60\,\text{mA})(10\,\text{k}\Omega)=\boxed{600\,\text{V}}$. Esse resultado extremo é um alerta sobre o modelo, não uma previsão completa: $Z$ deve ser a impedância complexa na faixa espectral da borda, e faltam capacitância da vítima, impedância da fonte, diodos de proteção, indutâncias, forma real da borda e retorno. A tensão não permanece em 600 V; é preciso resolver o circuito transitório (ou medir) para obter pico e duração.

### E6

Dados: $P = 50\,\text{W} = 16{,}99\,\text{dBW}$, $G = 12\,\text{dBi}$, $L = 1{,}5\,\text{dB}$.

(a) $EIRP = 16{,}99 + 12 - 1{,}5 = \boxed{27{,}5\,\text{dBW}}$.

(b) $EIRP = 10^{2{,}75} = \boxed{562\,\text{W}}$.

(c) $S = \frac{562}{4\pi \cdot 10^6} = 4{,}47 \times 10^{-5}\,\text{W/m}^2 = \boxed{44{,}7\,\mu\text{W/m}^2}$.

### E7

(a) $f_{IM3} = 2 \cdot 900 - 901 = \boxed{899\,\text{MHz}}$. $f_{IM3}' = 2 \cdot 901 - 900 = \boxed{902\,\text{MHz}}$.

(b) Ambas caem **nos limites** da banda $899\text{--}902\,\text{MHz}$. **Caso crítico**: adjacentes ao canal útil.

### E8

$$
F_1 = 1{,}413,\; G_1 = 316{,}2,\; F_2 = 1{,}995,\; G_2 = 0{,}708,\; F_3 = 3{,}981
$$

$$
F_{\text{total}} = 1{,}413 + \frac{0{,}995}{316{,}2} + \frac{2{,}981}{316{,}2 \cdot 0{,}708} = 1{,}413 + 0{,}0031 + 0{,}0133 = \boxed{1{,}430}
$$

$$
F_{\text{total,dB}} = \boxed{1{,}55\,\text{dB}}
$$

### E9

$S_V(f) = 4k_BTR$ é **constante** (independente de $f$), logo é **ruído branco**. A potência total $P = \int_0^{\infty} S_V(f)\,\frac{1}{4R}\,df$ diverge. **Resolução física**: para $f \gtrsim k_B T/h \approx 6\,\text{THz}$, a quantização exige a fórmula de Planck:

$$
S_V(f) = 4R \cdot \frac{hf}{e^{hf/(k_B T)} - 1}
$$

que decai exponencialmente, tornando a integral convergente. A fórmula clássica é válida para $hf \ll k_B T$.

### E10

Dados: $f = 2{,}45\,\text{GHz}$, $P = 1000\,\text{W}$.

(a) $\lambda = \frac{c}{f} = \frac{2{,}998 \times 10^8}{2{,}45 \times 10^9} = \boxed{12{,}2\,\text{cm}}$.

(b) $E = hf = (6{,}626 \times 10^{-34})(2{,}45 \times 10^9) / (1{,}602 \times 10^{-19}) = \boxed{10{,}1\,\mu\text{eV}}$.

(c) $S = \frac{1000}{4\pi \cdot 0{,}25} = \frac{1000}{\pi} = \boxed{318\,\text{W/m}^2}$.

### E11

Pulso gaussiano: $p(t) = \exp(-t^2/(2\tau_r^2))$. Sua transformada:

$$
P(f) = \tau_r\sqrt{2\pi}\,\exp(-2\pi^2 f^2 \tau_r^2)
$$

Espectro decai exponencialmente. Definindo $f_{\text{max}}$ quando o espectro cai a $1/e$ do valor em DC:

$$
\exp(-2\pi^2 f_{\text{max}}^2 \tau_r^2) = e^{-1} \Rightarrow 2\pi^2 f_{\text{max}}^2 \tau_r^2 = 1
$$

$$
f_{\text{max}} = \frac{1}{\pi\sqrt{2}\,\tau_r} \approx \frac{0{,}225}{\tau_r}
$$

Usando o critério mais conservador $f_{\text{max}} \approx \frac{0{,}35}{\tau_r}$ (baseado em pulso gaussiano de largura FWHM), obtém-se o resultado padrão da literatura EMC. $\blacksquare$

### E12

(a) $T_{\text{sys}}$ já representa o ruído total referido à entrada; multiplicá-lo novamente por $F$ seria dupla contagem. Além disso, sensibilidade só tem significado para uma SNR/BER/critério de detecção especificado. Sem separar $T_{\text{ant}}$ e $T_e$, não é possível inferir $F$.

(b) $k_BT_{\text{sys}}B=(1{,}381\times10^{-23})(500)(10^6)=6{,}905\times10^{-15}\,\text{W}=\boxed{-111{,}6\,\text{dBm}}$.

(c) $P_{\min}=-120\,\text{dBm}=10^{-15}\,\text{W}$ implicaria

$$
(SNR)_{\min}=\frac{P_{\min}}{k_BT_{\text{sys}}B}=0{,}145=\boxed{-8{,}39\,\text{dB}}.
$$

Isso não é automaticamente impossível: sistemas codificados ou detectores integradores podem operar com SNR numérica negativa, dependendo da definição de banda, taxa e critério. O resultado exige que esses elementos sejam declarados.

(d) Para obter $F$ e $T_e$, forneça $T_{\text{ant}}$ e deixe claro que $T_{\text{sys}}=T_{\text{ant}}+T_e$ no mesmo plano de referência. Então $T_e=T_{\text{sys}}-T_{\text{ant}}$ e $F=1+T_e/T_0$. Alternativamente, forneça diretamente $F$ e use a forma baseada em $T_0$.
