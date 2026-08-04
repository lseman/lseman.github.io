# Normas, Padronizações e Ensaios de EMC

> Compatibilidade Eletromagnética — Apostila de Curso
> Tópicos: CISPR · IEC · IEEE · ANATEL · Classes de produtos · Ensaios de imunidade · Certificação CE/FCC · Python para limites CISPR

## Antes de começar

Ao final, você deve localizar a família normativa aplicável, distinguir emissão de imunidade e interpretar detector, distância, arranjo, margem e incerteza. **Diagnóstico:** ficar abaixo de uma curva desenhada no gráfico basta para declarar conformidade? **Evidência mínima:** escrever um plano de ensaio que identifique edição normativa, porta, faixa, detector, configuração, critério de desempenho e decisão de conformidade.

> **Atenção:** tabelas e níveis neste capítulo são educacionais. Confirme sempre a edição vigente, *amendments*, classificação do produto, condições do ensaio e regras da jurisdição.

## Sumário

1. [Arquitetura da Padronização EMC](#arquitetura-da-padronização-emc)
2. [Família CISPR — Estrutura e Escopo](#família-cispr--estrutura-e-escopo)
3. [Família IEC — Ensaios de Imunidade](#família-iec--ensaios-de-imunidade)
4. [Classes de Produtos e Requisitos por Classe](#classes-de-produtos-e-requisitos-por-classe)
5. [Ensaios de Conformidade — Metodologia](#ensaios-de-conformidade--metodologia)
6. [Certificação e Marcação CE/FCC](#certificação-e-marcação-cefcc)
7. [Exercícios Resolvidos em Python](#exercícios-resolvidos-em-python)
8. [Lista de Exercícios Propostos](#lista-de-exercícios-propostos)
9. [Gabarito](#gabarito)

## Arquitetura da Padronização EMC

> **Controle de edição:** limites, níveis e procedimentos dependem da edição, emendas, produto e jurisdição. As tabelas deste capítulo são didáticas e não substituem o texto normativo adquirido nem a avaliação do laboratório acreditado. Confirme sempre o catálogo oficial antes de elaborar um plano de conformidade.

A padronização em compatibilidade eletromagnética é uma estrutura internacional hierárquica, organizada para cobrir desde os equipamentos de medida até os limites de emissão e imunidade de produtos finais. As principais organizações são:

### CISPR — Comissão Internacional Especial de Ruído

O **CISPR** (Comité International Spécial des Perturbations Radioélectriques) foi criado em 1934 sob a égide da **IEC**. É o organismo central de padronização de emissões eletromagnéticas.

**Estrutura:**

| Subcomitê | Responsabilidade |
| --- | --- |
| CISPR/A | Métodos de medição e instrumentação de perturbações radioelétricas |
| CISPR/B | Interferência relacionada a equipamentos ISM, equipamentos de potência e linhas de transmissão |
| CISPR/D | EMC de equipamentos elétricos/eletrônicos em veículos e motores de combustão |
| CISPR/F | EMC de eletrodomésticos, ferramentas, luminárias e equipamentos semelhantes |
| CISPR/H | Limites para proteção de serviços de rádio e aspectos genéricos de emissão |
| CISPR/I | EMC de equipamentos de tecnologia da informação, multimídia e receptores |

**Como ler a tabela:** as letras identificam **subcomitês técnicos**, não classes de produto nem partes de uma única norma. Os títulos e a estrutura podem ser reorganizados; para um projeto real, consulte a página oficial do CISPR e o catálogo IEC.

**Atuação:** Publica as normas fundamentais de emissão (família CISPR) e os equipamentos de medida (CISPR 16).

### IEC — Comissão Eletrotécnica Internacional

A **IEC** (International Electrotechnical Commission) publica normas que abrangem toda a gama de EMC, incluindo imunidade. O **TC 77** coordena EMC, apoiado pelos subcomitês **SC 77A** (fenômenos de baixa frequência), **SC 77B** (fenômenos de alta frequência) e **SC 77C** (transientes de alta potência). O CISPR trata sobretudo de perturbações radioelétricas e proteção da recepção. A norma de produto aplicável pode ser elaborada por outro comitê, usando publicações básicas desses grupos.

A família **IEC 61000** é a norma guarda-chuva de EMC, dividida em partes:

- **Parte 1:** Generalidades (terminologia, níveis)
- **Parte 2:** Compatibilidade ambiental
- **Parte 3:** Limites de emissão
- **Parte 4:** Ensaios de imunidade e proteção
- **Parte 5:** Especificações de produto e norma de produto
- **Parte 6:** Normas genéricas

### IEEE — Normas Específicas

O **IEEE** (Institute of Electrical and Electronics Engineers) publica normas específicas para aplicações particulares:

| Norma | Escopo |
| --- | --- |
| IEEE P1100 | Práticas de proteção de equipamentos eletrônicos contra EMI |
| IEEE P519 | Controle de harmônicos em sistemas de potência |
| IEEE C62.41 | Surges em sistemas de baixa tensão |
| IEEE 1180 | Guia para avaliação de desempenho de blindagem |

### ANATEL no Brasil

A **ANATEL** (Agência Nacional de Telecomunicações) disciplina a avaliação da conformidade e a homologação de produtos para telecomunicações. O marco é o **Regulamento de Avaliação da Conformidade e de Homologação de Produtos para Telecomunicações**, aprovado pela **Resolução nº 715, de 23 de outubro de 2019**, com alterações posteriores e procedimentos/requisitos complementares publicados por Atos. Não existe, nesse contexto, uma “RDC 242/2019”. O processo contempla, conforme o produto:

- Limites de emissões conduzidas e irradiadas de equipamentos de telecomunicação
- Requisitos de imunidade para equipamentos de estação fixa e móvel
- requisitos técnicos e procedimentos operacionais aplicáveis à família do produto;
- ensaios em laboratórios reconhecidos quando exigidos;
- certificação ou declaração de conformidade, seguida de homologação.

**Observação:** não se deve concluir que todo equipamento eletroeletrônico geral é automaticamente regulado pelo Inmetro. A compulsoriedade depende do produto e do regulamento brasileiro específico. Primeiro classifique o produto e identifique as autoridades e programas aplicáveis; alguns produtos não têm certificação EMC compulsória genérica.

## Família CISPR — Estrutura e Escopo

### CISPR 16 — Equipamentos de Medida

A norma **CISPR 16-1-1** especifica aparelhos de medição de perturbação e imunidade, incluindo receptores de medição com detectores como pico, quasi-pico e média. “SESA” não é uma denominação normativa geral para receptor EMI.

| Detector | Aplicação |
| --- | --- |
| **Peak (P)** | Varredura rápida, máxima emissão |
| **Quasi-Peak (QP)** | Medida regulatória para EMI repetitiva |
| **Average (AVG)** | Medida para EMI contínua |

O detector **quasi-peak** é o mais importante para conformidade regulatória, pois pondera as emissões de acordo com sua frequência de repetição e amplitude — uma emissão rara terá leitura QP muito menor que a de pico, mesmo com a mesma amplitude.

**CISPR 16-2-1** especifica **métodos de medição de perturbações conduzidas**, especialmente de 9 kHz a 30 MHz. Ela não é uma especificação de analisadores de figura de ruído.

**CISPR 16-1-2** trata de **dispositivos de acoplamento para medições de perturbações conduzidas**, como redes artificiais. Requisitos de antenas e sítios para medição de perturbações radiadas aparecem em outras partes da série CISPR 16; por isso, o número completo da parte deve sempre acompanhar uma afirmação.

### CISPR 32 — Multimídia Equipment

A **CISPR 32** (substituindo CISPR 22 e CISPR 13) aplica-se a equipamentos de multimídia (computadores, TVs, equipamentos de comunicação integrados):

- **Emissões conduzidas:** 150 kHz – 30 MHz
- **Emissões irradiadas:** 30 MHz – 6 GHz (até 18 GHz opcional)
- **Classes:** A (industrial) e B (residencial)

A norma define limites em dBµV (conduzido) e dBµV/m (irradiado) para ambos os detectores QP e AVG.

### CISPR 35 — Equipamentos multimídia: imunidade

A **CISPR 35** estabelece requisitos de **imunidade para equipamentos multimídia**. Seu escopo é mais amplo que equipamentos de telecomunicações e complementa a abordagem de emissão da CISPR 32:

- Suscetibilidade a campos RF irradiados
- Suscetibilidade a transientes conduzidos
- Efeitos de emissões de outros equipamentos na funcionalidade

Em termos didáticos, CISPR 32 trata emissões e CISPR 35 trata imunidade do conjunto multimídia, mas a edição vigente e as exclusões de escopo precisam ser verificadas.


<!-- slides: columns -->

### CISPR 12 — Veículos

A **CISPR 12** estabelece limites de emissões de RF de veículos, embarcações e equipamentos movidos a motor:

- **Emissões conduzidas** nos terminais de bateria
- **Emissões irradiadas** do veículo em movimento

Esta norma é particularmente importante para veículos elétricos, cujos inversores geram emissões significativas.

<!-- slides: column -->

### CISPR 14-1 — Eletrodomésticos

A **CISPR 14-1** aplica-se a eletrodomésticos, ferramentas elétricas e aparelhos similares dentro de seu próprio escopo. Ela não foi incorporada genericamente à CISPR 32, que trata de equipamentos multimídia; a norma aplicável depende da função e classificação do produto.

- Eletrodomésticos domésticos
- Ferramentas elétricas portáteis
- Aparelhos de iluminação


<!-- slides: end-columns -->
### CISPR 11 — ISM Equipment

A **CISPR 11** cobre **equipamentos ISM** (Industrial, Scientific, Medical):

- Geradores de plasma
- Fornalhos a arco
- Equipamentos de diatermia
- Fornos de micro-ondas industriais

Os limites são mais flexíveis que para produtos de consumo, reconhecendo que o ruído de tais equipamentos é inerente à sua função.

## Família IEC — Ensaios de Imunidade

A família **IEC 61000-4** define os ensaios de imunidade eletromagnética. Cada parte aborda um tipo de distúrbio:

### IEC 61000-4-2 — ESD (Electro-Static Discharge)

O ensaio de descarga eletrostática simula a descarga de uma pessoa carregada contra o equipamento:

- **Nível de teste comum:** 8 kV contato (contact discharge), 15 kV ar (air discharge)
- **Gerador:** 150 pF, 330 Ω (modelo de descarga)
- **Polaridade:** positiva e negativa
- **Taxa:** 1 descarga/s (contato), 1 descarga/2s (ar)

**Parâmetros de forma de onda:**

$$
\boxed{
\begin{array}{ll}
\text{Tempo de subida:} & \leq 1\,\text{ns} \\
\text{Tempo de meia-pulso:} & 30\,\text{ns} \pm 15\,\text{ns}
\end{array}
}
$$

**Método de ensaio:**

| Tipo | Posição | Nível Contato | Nível Ar |
| --- | --- | --- | --- |
| Contato | Superfície acessível | ±8 kV | — |
| Ar | Superfície acessível | — | ±15 kV |
| Contato | Fendas e ranhuras | ±8 kV | — |

### IEC 61000-4-3 — Radiated, RF Electromagnetic Field

Ensaio com campo RF irradiado em antena:

- **Faixa de frequência:** 80 MHz – 6 GHz (ou até 8 GHz, 80 MHz – 1 GHz)
- **Modulação:** AM 80% a 1 kHz, 50% para 1 GHz – 6 GHz
- **Nível de teste ambiente residencial/comercial:** 3 V/m
- **Nível de teste ambiente industrial:** 10 V/m

**Mecanismo de acoplamento:** O campo RF se acopla aos cabos e estruturas do equipamento, convertendo-se em tensões correntes conduzidas.

### IEC 61000-4-4 — EFT/Burst (Electrical Fast Transient)

Ensaio de transientes rápidos (burst) injetados nos terminais de alimentação e sinal:

- **Nível de teste:** 2 kV (alimentação), 1 kV (sinal/entrada)
- **Forma de onda:** pulso de 5 ns de subida, 50 ns de largura (meia-altura)
- **Frequência de repetição do burst:** 5 kHz (burst de 100 µs)
- **Duração do burst:** 100 µs (500 pulsos)

**Parâmetros do gerador (circuito equivalente):**

$$
\boxed{
\begin{array}{l}
R_s = 50\,\Omega \\
C_s = 50\,\text{pF} \\
\text{Pulso: } 5\,\text{ns} \text{ (subida)},\; 50\,\text{ns} \text{ (meia-altura)} \\
\text{Burst: } 300\,\text{ms} \text{ intervalo entre bursts}
\end{array}
}
$$

### IEC 61000-4-5 — Surge

Ensaio de surtos (sobretensões de alta energia):

- **Nível de teste:** 1 kV diferencial (line-to-line), 2 kV common-mode (line-to-ground)
- **Forma de onda 1,2/50 µs:** tensão (1,2 µs de subida, 50 µs de meia-altura)
- **Forma de onda 5/50 µs:** corrente (5 µs de subida, 50 µs de meia-altura)

**Circuitos de injeção:**

$$
\boxed{
\begin{array}{ll}
\text{Diferencial:} & 32\,\Omega,\; 500\,\mu\text{H} \\
\text{Common-mode:} & 32\,\Omega,\; 500\,\mu\text{H}
\end{array}
}
$$

### IEC 61000-4-6 — Conducted Immunity

Ensaio de imunidade conduzida: injeta-se um sinal RF nos cabos de alimentação e sinal:

- **Frequência:** 150 kHz – 80 MHz
- **Nível de teste:** 10 V (alimentação), 3 V (sinal)
- **Modulação:** AM 80% a 1 kHz
- **Acoplamento:** via rede de acoplamento/desacoplamento (CDN) ou clamp indutivo

### IEC 61000-4-8 — Campo Magnético de Frequência da Rede

Ensaio para equipamentos próximos a linhas de transmissão:

- **Frequência:** 50 Hz ou 60 Hz
- **Nível de teste:** 1 A/m (ambiente residencial/comercial), 10 A/m (industrial)
- **Método:** bobina de Helmholtz ou solenoide

### IEC 61000-4-11 — Voltage Dips e Interruptions

Ensaio de mergulhos e interrupções de tensão:

| Teste | Tipo | Duração | Redução de tensão |
| --- | --- | --- | --- |
| 1 | Dip | 0,5 ciclo (10 ms @ 50 Hz) | 0% |
| 2 | Dip | 1 ciclo | 70% |
| 3 | Dip | 5 ciclos | 70% |
| 4 | Dip | 25 ciclos | 70% |
| 5 | Dip | 1 segundo | 70% |
| 6 | Interrupção | 1 segundo | 100% |
| 7 | Variation | 1 minuto | 5% |

## Classes de Produtos e Requisitos por Classe

### Classe A (Industrial) vs. Classe B (Residencial)

A classificação em classes reflete o **ambiente de uso** do produto:

**Classe A** — Equipamentos para ambiente industrial:

- Limites de emissão **mais permissivos**
- Considera que o ambiente industrial já possui interferências significativas
- Aplicável a máquinas industriais, equipamentos de telecomunicação de rede

**Classe B** — Equipamentos para ambiente residencial:

- Limites de emissão **mais restritivos**
- Considera a proximidade com receptores sensíveis (rádio, TV, dispositivos médicos)
- Aplicável a computadores pessoais, eletrodomésticos, dispositivos de consumo

### Limites de Emissão Conduzida — CISPR 32

Os limites de emissão conduzida da CISPR 32 para a banda de 150 kHz – 30 MHz são:

| Frequência (MHz) | Classe A (dBµV) | Classe B (dBµV) |
| --- | --- | --- |
| 0,15 – 0,5 | 79 QP / 66 AVG | 79 QP / 66 AVG |
| 0,5 – 30 | 73 QP / 60 AVG | 56 QP / 50 AVG |

**Observação:** Os limites acima são para medida em linha (L) e neutro (N), com rede de impedância de linha (LISN) de 50 Ω / 50 µH.

### Limites de Emissão Radiada — CISPR 32

Os limites de emissão irradiada para 30 MHz – 1 GHz:

| Frequência (MHz) | Classe A (dBµV/m) | Classe B (dBµV/m) |
| --- | --- | --- |
| 30 – 230 | 30 QP / 24 AVG | 30 QP / 24 AVG |
| 230 – 1000 | 37 QP / 30 AVG | 37 QP / 30 AVG |

Acima de 1 GHz, **não use uma fórmula logarítmica genérica** como substituto da tabela normativa. Limites, detectores (pico/média), largura de banda, distância e frequência superior de ensaio dependem da edição e das características do equipamento. O procedimento correto é localizar a linha aplicável na edição vigente da CISPR 32 (ou na adoção regional correspondente) e registrar todos esses parâmetros.

### Gráficos de Limites vs. Frequência

A figura abaixo ilustra a transição entre os diferentes regimes de limites:

```
Emissao Radiada (dBuV/m)
    50 +  |                                    A (acima de 1 GHz)
        45 +
        40 +  B (acima de 1 GHz)
        37 +----------------------------------- B (230-1000 MHz)
        30 +-------------------------------+-- A (230-1000 MHz)
        30 +-------------------------------+
        24 +                               |
         20 +                               |
           +---+---+---+---+---+---+---+---+---+
           0.1  0.5  1   10  30  100 1000 3000 (MHz)
```

## Ensaios de Conformidade — Metodologia

### Câmara Semianecóica

A **câmara semianecóica** é o ambiente de medida para ensaios de emissão radiada e imunidade radiada:

**Características:**

- **Paredes e teto:** cobertos com materiais absorventes (espuma de ferrite + carbônio)
- **Piso:** condutivo (grade metálica aterrada)
- **Dimensões mínimas:** determinadas pela frequência máxima de ensaio

O **PSL (Pre-Site Verification — Verificação de Site)** é realizado antes de cada campanha de medida para garantir a uniformidade do campo e a rejeição de reflexões:

$$
\boxed{\text{PSL} = \left| \frac{V_{\text{min}}}{V_{\text{max}}} \right|_{\text{site}} \leq 0{,}5 \quad \text{(ou } \leq -6\,\text{dB})}
$$

### Setup de Teste

O **equipamento de teste** típico inclui:

1. **Antena de medida** (dipolo log-periódico, horn)
2. **Receptor EMI** ou analisador de espectro com detector QP
3. **LISN** (Line Impedance Stabilization Network) para medidas conduzidas
4. **Mesa de teste** não condutiva (Classe B) ou condutiva aterrada (Classe A)
5. **DUT (Device Under Test)** com cabos em configuração de referência

### Procedimento de Medida

**Scan de emissão:**

1. Medir com detector **Peak** em todas as frequências (varredura rápida)
2. Medir com detector **QP** nas frequências onde o Peak excedeu o limite (verificação regulatória)
3. Medir com detector **Average** para caracterização adicional

**Rotations e heights:** A antena de medida é posicionada a 3 m, 5 m ou 10 m do DUT (dependendo do tamanho do DUT e da frequência). A altura da antena é varrida de 1 m a 4 m. O DUT é girado em 360°.

### Incerteza de Medida

A **incerteza expandida** de uma medida EMC é:

$$
\boxed{U = k \cdot u_c}
$$

onde:

- $u_c$ é a incerteza combinada (contribuições de antena, receptor, LISN, repetibilidade)
- $k = 2$ para nível de confiança de aproximadamente 95%

A CISPR 16-4-3 especifica as incertezas típicas:

| Tipo de medida | Incerteza expandida (k=2) |
| --- | --- |
| Emissão conduzida (QP) | 3–4 dB |
| Emissão radiada (QP) | 4–5 dB |
| Emissão radiada (Peak) | 3–4 dB |

**Importante:** Ao avaliar a conformidade, a margem de conformidade deve ser calculada como:

$$
\boxed{M = E_{\text{medida}} - E_{\text{limite}}}
$$

Se $M < -U$, o equipamento está **fora de conformidade**. Se $M > 0$, está **em conformidade**. Se $-U \leq M \leq 0$, o resultado é **inconclusivo** (medida adicional recomendada).

## Certificação e Marcação CE/FCC

### Processo de Certificação Passo-a-Passo

1. **Identificação das normas aplicáveis** — CISPR, IEC 61000, FCC Part 15, etc.
2. **Testes de pré-conformidade** — em câmara semianecóica de laboratório
3. **Correção de problemas** — blindagem, filtragem, layout
4. **Testes de conformidade** — em laboratório acreditado (NABCEL no Brasil, TB notified body na Europa)
5. **Montagem do dossier técnico** — relatórios de teste, desenhos, esquemas
6. **Declaração de Conformidade** — documento assinado pelo fabricante
7. **Afixação da marcação** — CE, FCC, etc.

### Marcação CE

A **marcação CE** indica conformidade com as diretivas europeias aplicáveis:

- **Diretiva EMC 2014/30/EU** — Compatibilidade Eletromagnética
- **Diretiva RED 2014/53/EU** — Equipamentos de Rádio
- **Diretiva LVD 2014/35/EU** — Baixa Tensão (segurança)

**Documentação obrigatória:**

- Declaração UE de Conformidade
- Dossier técnico (desenhos, esquemas, relatórios de teste)
- Manual de instalação e operação
- Marcação visível, legível e indelével no produto

### FCC Part 15 — Subpartes

A **Federal Communications Commission** (EUA) regula emissões por meio do **47 CFR Part 15**:

| Subparte | Aplicação |
| --- | --- |
| **15.31** | Procedimentos gerais de medição |
| **15.33** | Faixas de frequência de medição de emissões radiadas |
| **15.107** | Limites conduzidos para radiadores não intencionais |
| **15.109** | Limites radiados para radiadores não intencionais |
| **15.207** | Limites conduzidos gerais aplicáveis a muitos radiadores intencionais |
| **15.247** | Dispositivos de banda larga (ISM bands) |
| **15.249** | Transmissores de RF para dispositivos de baixa potência |

Os limites FCC são tabelas por faixa, classe, porta, detector e distância; não são um único valor constante para 30–1000 MHz e não distinguem linha e neutro por dois limites genéricos. Para um ensaio, consulte diretamente o parágrafo aplicável no **47 CFR vigente**. O raciocínio de conversão entre $\mu\text{V}$ e $\text{dB\mu V}$ continua válido, mas o valor de entrada deve vir da regra correta.

## Exercícios Resolvidos em Python

### Protocolo computacional

**Objetivo:** interpretar limites, detectores, margem e incerteza sem transformar exemplos em certificados. **Rastreabilidade:** registre edição normativa, distância, detector, RBW e classe. **Validação:** separe margem nominal, incerteza expandida e regra de decisão aplicada.

### Plot de Limites de Emissão CISPR 32 (Classe A vs. B)

```python
import numpy as np
import matplotlib.pyplot as plt

def cispr32_conducted_limits(f_MHz):
    """
    Calcula limites de emissao conduzida CISPR 32.
    f_MHz: frequencia em MHz.
    Retorna limites QP e AVG para Classe A e B em dBuV.
    """
    # Classe A
    if f_MHz <= 0.5:
        clsA_QP = 79.0
        clsA_AVG = 66.0
    else:
        clsA_QP = 73.0
        clsA_AVG = 60.0

    # Classe B
    if f_MHz <= 0.5:
        clsB_QP = 79.0
        clsB_AVG = 66.0
    else:
        clsB_QP = 56.0
        clsB_AVG = 50.0

    return clsA_QP, clsA_AVG, clsB_QP, clsB_AVG

# Plot
f_MHz = np.logspace(-0.8, 1.5, 500)  # 0.16 MHz a 31.6 MHz
clsA_QP, clsA_AVG, clsB_QP, clsB_AVG = [], [], [], []

for f in f_MHz:
    qa, aa, qb, ab = cispr32_conducted_limits(f)
    clsA_QP.append(qa); clsA_AVG.append(aa)
    clsB_QP.append(qb); clsB_AVG.append(ab)

fig, ax = plt.subplots(figsize=(10, 6))
ax.plot(f_MHz, clsA_QP, 'b-', linewidth=2, label='Classe A (QP)')
ax.plot(f_MHz, clsA_AVG, 'b--', linewidth=1.5, label='Classe A (AVG)')
ax.plot(f_MHz, clsB_QP, 'r-', linewidth=2, label='Classe B (QP)')
ax.plot(f_MHz, clsB_AVG, 'r--', linewidth=1.5, label='Classe B (AVG)')

ax.set_xscale('log')
ax.set_xlabel('Frequencia (MHz)')
ax.set_ylabel('Limite (dBuV)')
ax.set_title('Limites de Emissao Conduzida CISPR 32')
ax.legend()
ax.grid(True, which='both', alpha=0.3)
ax.set_xlim(0.15, 30)
plt.tight_layout()
plt.savefig('/tmp/cispr32_conducted.png', dpi=150)
plt.show()

print("Valores numericos:")
for f in [0.15, 0.5, 1, 10, 30]:
    qa, aa, qb, ab = cispr32_conducted_limits(f)
    print(f"  f={f:>5.2f} MHz: A(QP)={qa:.0f} A(AVG)={aa:.0f} B(QP)={qb:.0f} B(AVG)={ab:.0f}")
```

### Cálculo de Margem de Conformidade

```python
import numpy as np
import matplotlib.pyplot as plt

def compliance_margin(E_measure, E_limit, U_expanded=5.0):
    """
    Calcula margem de conformidade e status.
    E_measure, E_limit: em dBuV/m.
    U_expanded: incerteza expandida (k=2).
    Retorna: margem, status (pass/fail/uncertain).
    """
    margin = E_measure - E_limit
    if margin < -U_expanded:
        status = "FAIL"
    elif margin > 0:
        status = "PASS"
    else:
        status = "UNCERTAIN"
    return margin, status

# Simulacao: medidas de 20 produtos em 5 frequencias
np.random.seed(42)
frequencies = np.array([30, 50, 100, 200, 500])  # MHz
n_products = 20

fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Grafico 1: Medidas vs limites
for i in range(n_products):
    # Simula medidas com algum ruido
    E_meas = np.array([37 + np.random.normal(0, 3) for _ in frequencies])
    E_lim = np.full_like(frequencies, 37.0)
    axes[0].semilogx(frequencies, E_meas, 'b.', alpha=0.3)

axes[0].axhline(37, color='r', linewidth=2, label='Limite Classe B')
axes[0].set_xlabel('Frequencia (MHz)')
axes[0].set_ylabel('Emissao (dBuV/m)')
axes[0].set_title('Medidas de Emissao Radiada (20 produtos)')
axes[0].legend()
axes[0].grid(True, alpha=0.3)
axes[0].set_xlim(20, 1000)

# Grafico 2: Distribuicao de margens
margins = []
statuses = {'PASS': 0, 'FAIL': 0, 'UNCERTAIN': 0}
for i in range(n_products * 5):
    E_m = 35 + np.random.normal(0, 4)
    margin, status = compliance_margin(E_m, 37.0, 5.0)
    margins.append(margin)
    statuses[status] += 1

axes[1].hist(margins, bins=15, color='steelblue', edgecolor='black', alpha=0.7)
axes[1].axvline(0, color='green', linestyle='--', linewidth=2, label='Margem = 0')
axes[1].axvline(-5, color='red', linestyle='--', linewidth=2, label='Margem = -U')
axes[1].set_xlabel('Margem de Conformidade (dB)')
axes[1].set_ylabel('Numero de Medidas')
axes[1].set_title('Distribuicao de Margens')
axes[1].legend()
axes[1].grid(True, alpha=0.3)

# Resumo
print("Resumo de Conformidade:")
for status, count in statuses.items():
    print(f"  {status}: {count} medidas ({count/(n_products*5)*100:.1f}%)")

plt.tight_layout()
plt.savefig('/tmp/compliance_margin.png', dpi=150)
plt.show()

# Exemplo numerico
E_meas_example = 33.0
E_lim_example = 37.0
margin, status = compliance_margin(E_meas_example, E_lim_example, 5.0)
print(f"\nExemplo: Medida={E_meas_example} dBuV/m, Limite={E_lim_example} dBuV/m")
print(f"Margem = {margin:.1f} dB, Status = {status}")
```

### Simulação de Ensaio ESD — Curva de Tensão

```python
import numpy as np
import matplotlib.pyplot as plt

def esd_waveform(t, C=150e-12, R=330):
    """
    Simula a forma de onda de corrente de descarga ESD (modelo de 2 exponentes).
    t: array de tempos.
    C = 150 pF (capacitancia do modelo)
    R = 330 ohms (resistencia do modelo)
    """
    tau1 = 0.6e-9    # tempo de subida (600 ps)
    tau2 = 35e-9     # tempo de caida (35 ns)
    # Forma de onda de corrente normalizada
    i = np.exp(-t/tau2) - np.exp(-t/tau1)
    i = np.maximum(i, 0)
    # Normalizar para pico = 1
    return i / np.max(i)

def esd_current(t, voltage, C=150e-12, R=330):
    """Calcula corrente de descarga ESD para uma tensao de descarga."""
    normalized = esd_waveform(t, C, R)
    I_peak = voltage / R  # corrente de pico aproximada
    return I_peak * normalized

# Simular diferentes niveis de tensao
t = np.linspace(0, 100e-9, 5000)  # 0 a 100 ns
voltages = [4, 8, 15]  # kV
colors = ['g', 'b', 'r']

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8))

for V, c in zip(voltages, colors):
    I = esd_current(t, V * 1000)
    ax1.plot(t * 1e9, I, c=c, linewidth=2, label=f'{V} kV')

ax1.set_xlabel('Tempo (ns)')
ax1.set_ylabel('Corrente (A)')
ax1.set_title('Forma de Onda de Corrente ESD (IEC 61000-4-2)')
ax1.legend()
ax1.grid(True, alpha=0.3)
ax1.set_xlim(0, 50)

# Tensao no DUT (simulacao simplificada)
R_dut = 50  # impedancia do DUT (ohms)
for V, c in zip(voltages, colors):
    V_dut = esd_current(t, V * 1000) * R_dut
    ax2.plot(t * 1e9, V_dut, c=c, linewidth=2, label=f'{V} kV -> DUT')

ax2.set_xlabel('Tempo (ns)')
ax2.set_ylabel('Tensao no DUT (V)')
ax2.set_title('Tensao Induzida no Equipamento (DUT)')
ax2.legend()
ax2.grid(True, alpha=0.3)
ax2.set_xlim(0, 50)

plt.tight_layout()
plt.savefig('/tmp/esd_waveform.png', dpi=150)
plt.show()

# Parametros de forma de onda
print("Parametros IEC 61000-4-2 ESD:")
print(f"  Capacitancia do modelo: 150 pF")
print(f"  Resistencia do modelo: 330 ohms")
print(f"  Tempo de subida: <= 1 ns")
print(f"  Tempo de meia-pulso: 30 ns +/- 15 ns")
print(f"\nCorrentes de pico aproximadas:")
for V in voltages:
    print(f"  {V} kV -> I_peak ~ {V*1000/330:.0f} A")
```

## Lista de Exercícios Propostos

Use, quando necessário, $k_B = 1{,}381 \times 10^{-23}\,\text{J/K}$, $T_0 = 290\,\text{K}$.

**E.1** — Explique a diferença entre os detectores **Peak**, **Quasi-Peak** e **Average** de um receptor EMI. Por que a CISPR exige medida QP para conformidade regulatória e não apenas Peak?

**E.2** — Um produto deve ser certificado para a diretiva EMC europeia. Liste as etapas do processo de certificação CE e os documentos obrigatórios.

**E.3** — Explique por que não se pode calcular um limite CISPR 32 acima de $1\,\text{GHz}$ por uma fórmula universal dependente apenas da frequência. Liste os dados normativos que devem ser registrados ao extrair o limite aplicável.

**E.4** — Um ensaio de ESD é realizado a $8\,\text{kV}$ contato. Qual é a corrente de pico aproximada no modelo de descarga? Qual é a energia armazenada no capacitor de $150\,\text{pF}$ antes da descarga?

**E.5** — Um equipamento emite $42\,\text{dB\mu V/m}$ a $100\,\text{MHz}$ em um ensaio radiado. O limite CISPR 32 Classe B a $100\,\text{MHz}$ é $30\,\text{dB\mu V/m}$. Calcule (a) a margem de não conformidade, (b) se o resultado é conclusivo com incerteza expandida $U = 5\,\text{dB}$.

**E.6** — Um trem didático de EFT/Burst usa frequência de repetição de pulsos de $5\,\text{kHz}$ e duração ativa de $15\,\text{ms}$. Calcule (a) o número de pulsos em cada burst e (b) o tempo ativo acumulado em 3 bursts. Explique por que isso não determina sozinho a duração normativa total do ensaio.

**E.7** — Calcule os limites de emissão conduzida CISPR 32 Classe B em $\text{dB\mu V}$ e em $\mu\text{V}$ para $f = 1\,\text{MHz}$ (QP).

**E.8** — Um laboratório mede uma emissão radiada de $34\,\text{dB\mu V/m}$ a $300\,\text{MHz}$. O limite Classe B é $37\,\text{dB\mu V/m}$. A incerteza expandida é $4{,}5\,\text{dB}$. O produto é conforme? Justifique usando o conceito de margem de conformidade.

**E.9** — Compare os limites de emissão conduzida CISPR 32 Classe A e Classe B para $f = 10\,\text{MHz}$. Qual é a diferença em dB? O que essa diferença representa em termos de tensão no LISN?

**E.10** — Um receptor de banda $B = 1\,\text{kHz}$ opera com $T_{\text{sys}} = 290\,\text{K}$. Qual é a potência de ruído térmico disponível em dBm? Se o receptor precisa de $SNR = 10\,\text{dB}$ para operação, qual é a potência mínima do sinal?

**E.11 (desafio)** — A incerteza expandida $U = k \cdot u_c$ depende de múltiplas contribuições. Liste pelo menos 5 contribuições para a incerteza de uma medida de emissão radiada e indique quais tendem a dominar em cada faixa de frequência.

**E.12 (desafio)** — Explique por que não existe uma conversão universal entre leituras QP e AVG baseada apenas no *duty cycle*. Indique quais propriedades do pulso e do receptor precisariam ser conhecidas para prever as duas leituras.

## Gabarito

### E1

Os três detectores funcionam diferentemente:

- **Peak (P):** captura o valor máximo instantâneo do sinal. É o mais sensível e rápido, mas não reflete o impacto real da interferência no receptor.
- **Quasi-Peak (QP):** pondera a amplitude pela frequência de repetição. Um pulso isolado tem leitura QP muito menor que a de pico. Um pulso repetitivo tem QP ≈ Peak. A ponderação é feita por uma rede RC com constante de carga $0{,}2\,\text{ms}$ e descarga $1\,\text{s}$.
- **Average (AVG):** calcula a média do envelope ao longo do tempo de medição.

**Por que QP é usado para conformidade:** Porque QP reflete a **importância subjetiva da interferência**. Um sinal raro (baixa taxa de repetição) é menos perturbador que um contínuo, mesmo com a mesma amplitude de pico. A CISPR usa QP porque correlaciona melhor com a percepção humana de interferência em rádios AM.

### E2

**Etapas do processo de certificação CE:**

1. Identificar diretivas aplicáveis (EMC, RED, LVD)
2. Identificar normas harmonizadas (CISPR, IEC 61000)
3. Realizar testes de pré-conformidade em laboratório
4. Corrigir problemas EMC encontrados
5. Realizar a avaliação de conformidade e os ensaios pertinentes; laboratório acreditado e organismo notificado são usados quando exigidos ou escolhidos para sustentar a avaliação, mas não são sinônimos nem universalmente obrigatórios na Diretiva EMC
6. Elaborar **dossier técnico** (desenhos, esquemas, relatórios)
7. Redigir **Declaração UE de Conformidade**
8. Afixar marcação CE no produto
9. Manter documentação por 10 anos após comercialização

**Documentos obrigatórios:** Declaração UE de Conformidade, dossier técnico (relatórios de teste, desenhos, esquemas, manual), marcação CE visível.

### E3

O limite depende da edição/adopção normativa, classe do equipamento, faixa, distância de medição, detector, largura de banda e condições de configuração. Acima de $1\,\text{GHz}$ também se deve identificar a frequência máxima a ensaiar e os requisitos de pico e média. Portanto, frequência sozinha não determina o limite. Um registro rastreável inclui: documento e edição/emenda, cláusula/tabela, classe e porta, faixa, detector, RBW, distância/sítio, configuração do EUT e unidades.

### E4

Corrente de pico: $I_{\text{peak}} \approx \frac{V}{R} = \frac{8000}{330} = \boxed{24{,}2\,\text{A}}$.

Energia no capacitor: $E = \frac{1}{2} C V^2 = \frac{1}{2} \cdot 150 \times 10^{-12} \cdot 8000^2 = \boxed{4{,}8\,\text{mJ}}$.

### E5

(a) Com os valores **fornecidos no enunciado**, a margem em relação ao limite é
$M=42-30=\boxed{+12\,\text{dB}}$: a emissão medida excede o limite em 12 dB.

(b) Mesmo o extremo inferior do intervalo ilustrativo, $42-5=37\,\text{dB\mu V/m}$, permanece 7 dB acima do limite de 30 dBµV/m. Assim, sob uma regra que considera esse intervalo, a não conformidade é conclusiva. Em relatório real, a conclusão deve citar a regra de decisão prescrita/contratada; não basta inventar uma “zona cinza” genérica.

### E6

(a) $n=f_pt_b=(5\,000)(15\times10^{-3})=\boxed{75\text{ pulsos por burst}}$.

(b) O tempo **ativo** em três bursts é $3(15\,\text{ms})=\boxed{45\,\text{ms}}$. Esse não é o tempo total do ensaio: faltam o intervalo entre bursts, a duração de aplicação por polaridade/porta e demais condições definidas pelo plano e pela edição normativa.

(b) Tempo total para 3 bursts: cada burst dura $100\,\mu\text{s}$, intervalo de $300\,\text{ms}$. Tempo total ≈ $3 \cdot (100\,\mu\text{s} + 300\,\text{ms}) \approx \boxed{0{,}9\,\text{s}}$.

### E7

Para $f = 1\,\text{MHz}$, CISPR 32 Classe B: $56\,\text{dB\mu V}$ (QP).

Em $\mu\text{V}$: $V = 10^{56/20}\,\mu\text{V} = \boxed{631\,\mu\text{V}}$.

### E8

Margem: $M = 34 - 37 = -3\,\text{dB}$.

Zona de incerteza: $-U \leq M \leq 0$, isto é, $-4{,}5 \leq M \leq 0$.

Como $-4{,}5 \leq -3 \leq 0$, o resultado é $\boxed{\text{UNCERTAIN}}$. **Medida adicional recomendada** — o produto pode ser conforme ou não, dentro da incerteza da medida.

### E9

Para $f = 10\,\text{MHz}$:

- Classe A: QP = $73\,\text{dB\mu V}$, AVG = $60\,\text{dB\mu V}$
- Classe B: QP = $56\,\text{dB\mu V}$, AVG = $50\,\text{dB\mu V}$

Diferença QP: $73 - 56 = \boxed{17\,\text{dB}}$.

Em tensão: $\Delta V_{\text{dB}} = 20\log_{10}(V_A/V_B) = 17\,\text{dB} \Rightarrow \frac{V_A}{V_B} = 10^{17/20} = \boxed{7{,}08}$.

A Classe A permite aproximadamente **7 vezes mais tensão** conduzida que a Classe B.

### E10

(a) $P_n = k_B T B = (1{,}381 \times 10^{-23})(290)(1000) = 4{,}005 \times 10^{-18}\,\text{W}$.

$$
P_n\,[\text{dBm}] = 10\log_{10}(4{,}005 \times 10^{-15}) = \boxed{-144{,}0\,\text{dBm}}
$$

(b) $SNR = 10\,\text{dB} = 10\times$ linear. $P_{\text{sig}} = 10 \cdot P_n = 4{,}005 \times 10^{-17}\,\text{W} = \boxed{-134{,}0\,\text{dBm}}$.

### E11

Contribuições possíveis para a incerteza de emissão radiada:

1. calibração e interpolação do **fator da antena**;
2. perda, estabilidade e desadaptação do **cabo**;
3. leitura, linearidade, ruído e resposta do **receptor EMI**;
4. posicionamento, distância e repetibilidade da altura/polarização da antena e do EUT;
5. imperfeições do sítio, reflexões e validação do ambiente;
6. variação do EUT, da rede de alimentação e da configuração de cabos.

Não se pode declarar antecipadamente qual contribuição domina apenas pela frequência. Isso é determinado pelo orçamento de incerteza do sítio, método, instrumentação e configuração concretos; cada termo deve ter distribuição, divisor, coeficiente de sensibilidade e correlação documentados.

### E12

Não há uma conversão universal. O detector quasi-pico não é um medidor RMS multiplicado por $\sqrt D$: sua indicação resulta da largura de banda, constantes de carga/descarga e dinâmica do detector. O detector médio também depende da definição e do método normativo aplicável.

Dois trens de pulsos podem ter o mesmo *duty cycle* e amplitudes de pico iguais, mas taxas de repetição e larguras de pulso diferentes; o QP pode responder diferentemente porque há mais ou menos tempo para carregar e descarregar entre pulsos. Para prever leituras, seriam necessários pelo menos forma e amplitude dos pulsos, largura, taxa e regularidade de repetição, RBW, constantes do detector e tempo de observação. A resposta rigorosa é obtida pelo modelo especificado para o receptor ou por medição com detectores conformes.
