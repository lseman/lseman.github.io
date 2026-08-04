# Compatibilidade Eletromagnética — Índice

Esta apostila aborda EMC como engenharia de sistemas: uma fonte produz energia, um caminho a acopla e uma vítima responde. O objetivo é aprender a medir, modelar, mitigar e demonstrar conformidade.

## Organização pedagógica

### Unidade I — Contexto e diagnóstico

1. [Aspectos econômicos](01_aspectos_economicos.md) — prevenção, falha, certificação e decisões de projeto.
2. [Caracterização e diagnóstico](02_caracterizacao_casos_emc.md) — fonte–caminho–vítima, hipóteses e causalidade.

### Unidade II — Fontes e requisitos

3. [Fontes de ruído](03_fontes_ruido.md) — fontes naturais, industriais e intencionais.
4. [Normas e ensaios](04_normas_padronizacoes_ensaios.md) — emissão, imunidade, procedimentos e incerteza.

### Unidade III — Simulação, fundamentos e mecanismos

5. [Introdução ao SPICE para EMC](05_introducao_spice_para_emc.md) — netlists, AC, transiente, modelos reais, linhas, PDN e convergência.
6. [Componentes não ideais](06_componentes_nao_ideais.md) — condutores, passivos, ferrites, contatos e parasitas.
7. [Linhas de transmissão e integridade de sinal](07_linhas_transmissao_integridade_sinal.md) — propagação, reflexões e terminações.
8. [Antenas](08_antenas.md) — dipolos, laços, regiões de campo, ganho e recepção.
9. [Crosstalk](09_crosstalk.md) — acoplamentos capacitivo/indutivo, NEXT e FEXT.
10. [Emissões conduzidas e suscetibilidade](10_emissoes_conduzidas_suscetibilidade.md) — LISN, modos, filtros e imunidade.
11. [Emissões radiadas e suscetibilidade](11_emissoes_radiadas_suscetibilidade.md) — loops, cabos, sondas e ensaios.
12. [Blindagem](12_blindagem.md) — reflexão, absorção, aberturas, cabos e conectores.

### Unidade IV — Simulação numérica e modelagem de campo

13. [Simulação numérica de EMC: FDTD e TLM](13_simulacao_numerica_emc_fdtl_tlm.md) — grade de Yee, FDTD, TLM, PML e limitações numéricas.

### Unidade V — Síntese, projeto e aplicação

14. [Modelagem de problemas EMC](14_modelagem_problemas_emc.md) — seleção, faixa de validade, transientes e validação.
15. [Minimização de interferências](15_minimizacao_interferencias.md) — decisão e verificação antes/depois.
16. [Projeto de PCBs para EMC](16_projeto_pcbs_emc.md) — stack-up, PDN, roteamento e conectores.
17. [Projeto de sistemas para EMC](17_projeto_sistemas_emc.md) — retornos, chassi, cabos e ESD.
18. [Radiações e ser humano](18_efeitos_radiacoes_ser_humano.md) — bioeletromagnetismo e exposição.
19. [Projeto e simulação com KiCad](19_projeto_e_simulacao_com_kicad.md) — implementação, ngspice e verificação.

## Rotas de leitura

- **Formação completa:** capítulos 1–19.
- **Diagnóstico de bancada:** 2 → 3 → 5–6 → 9–11 → 14 → 17.
- **PCB e integridade de sinal:** 2 → 5–7 → 9 → 16–17 → 19.
- **Conformidade:** 1 → 2 → 4 → 10–12 → 15–17.
- **Simulação de campo completo:** 13 → 14.

## Mapa de propriedade do conteúdo

| Tema | Capítulo-dono | Uso nos capítulos de síntese |
|---|---:|---|
| fontes, espectro e bordas | 3 | entrada de modelos e diagnósticos |
| sintaxe e validação SPICE | 5 | base das netlists posteriores |
| componentes e parasitas | 6 | filtros, PDN e interconexões reais |
| propagação e reflexões | 7 | modelos distribuídos e terminações |
| antenas e regiões de campo | 8 | emissão, recepção e cabos |
| acoplamento entre condutores | 9 | crosstalk e conversão de modo |
| fenômenos conduzidos | 10 | medição modal e filtragem |
| fenômenos radiados | 11 | loops, cabos e suscetibilidade |
| materiais e fronteiras blindadas | 12 | eficácia, aberturas e interfaces |
| simulação numérica FDTD/TLM | 13 | onda completa, malhas e PML |
| seleção e validação de modelos | 14 | integração quantitativa e transientes |
| decisão de mitigação | 15 | comparação de alternativas |
| implementação em placa | 16 | stack-up, PDN e roteamento |
| integração de equipamento | 17 | chassi, cabos e aterramento |

## Mapa de decisão

| Evidência | Hipótese inicial | Medição inicial | Capítulos |
|---|---|---|---|
| falha coincide com chaveamento | fonte conduzida ou radiada | osciloscópio + sonda de corrente/campo | 2, 3, 5–6, 10–11 |
| harmônicos do clock irradiados | retorno ou cabo como antena | espectro + campo próximo | 2, 8, 11, 16–17 |
| falha durante ESD/EFT/surge | caminho transitório | tensão/corrente + inspeção de retorno | 4, 14, 17 |
| margem muda com posição de cabo | modo comum/radiação | clamp de corrente + geometria | 2, 8, 11–12 |
| pico de impedância na alimentação | ressonância da PDN | VNA ou injeção | 5–6, 14, 16–17 |

## Como estudar e experimentar

Os exercícios em Python, o SPICE de **Introdução ao SPICE para problemas EMC**, a simulação de **Simulação numérica de EMC: FDTD e TLM** e o fluxo de **Projeto e simulação com KiCad** permitem comparar reflexão, ressonância, acoplamento, mitigação e onda completa. Para cada experimento, registre sintoma, hipótese, parâmetros, configuração, incerteza, resultado antes/depois e faixa de validade.

Em Python e SPICE, use unidades consistentes, declare aproximações e confira ao menos um caso-limite. Gráficos devem indicar eixos, unidades e parâmetros; netlists devem registrar simulador, modelos e critérios de convergência. Em FDTD/TLM, registre tamanho da célula, passo de tempo CFL, condições de contorno e tempo de simulação.

## Escopo normativo

Normas, limites e processos regulatórios mudam. Projetos reais devem consultar a edição vigente, seus *amendments*, a regulamentação aplicável e o laboratório responsável.

---

*Plano de aprendizagem: [ementa](ementa.md).*
