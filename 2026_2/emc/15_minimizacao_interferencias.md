# Minimização de interferências EMC

> Os mecanismos físicos já foram desenvolvidos nos capítulos 6–12. Este capítulo ensina a escolher, combinar e verificar mitigações sem depender de regras isoladas.

## Objetivos de aprendizagem

Ao final, você deve ser capaz de:

1. converter um diagnóstico confirmado em requisito de atenuação;
2. comparar intervenções na fonte, no caminho e na vítima;
3. selecionar mitigação compatível com modo, frequência e impedâncias;
4. antecipar ressonâncias, conversão de modo e efeitos colaterais;
5. demonstrar melhoria com medição antes/depois e margem.

## Sumário

1. [Da causa à meta de mitigação](#da-causa-à-meta-de-mitigação)
2. [Três pontos de intervenção](#três-pontos-de-intervenção)
3. [Árvore de seleção por mecanismo](#árvore-de-seleção-por-mecanismo)
4. [Filtros: escolha pelo modo e pelas impedâncias](#filtros-escolha-pelo-modo-e-pelas-impedâncias)
5. [Blindagem, cabos e interfaces](#blindagem-cabos-e-interfaces)
6. [PCB e PDN](#pcb-e-pdn)
7. [Robustez a ESD, EFT e surge](#robustez-a-esd-eft-e-surge)
8. [Matriz de decisão](#matriz-de-decisão)
9. [Protocolo de verificação](#protocolo-de-verificação)
10. [Casos de decisão](#casos-de-decisão)
11. [Exercícios](#exercícios)
12. [Orçamento probabilístico de margem](#orçamento-probabilístico-de-margem)
13. [Exemplo multicritério](#exemplo-multicritério)
14. [Laboratório SPICE — escolha de snubber](#laboratório-spice--escolha-de-snubber)
15. [Checklist de saída](#checklist-de-saída)

## Da causa à meta de mitigação

Mitigação começa depois de uma hipótese razoavelmente confirmada. Defina:

- grandeza a reduzir: corrente CM/DM, tensão, campo, acoplamento ou resposta da vítima;
- banda e condição operacional;
- valor inicial e limite;
- margem adicional para incerteza, unidade, temperatura e envelhecimento;
- restrições de segurança, sinal, potência, custo, peso e prazo.

Se uma emissão medida é $E_m$ e a meta é $E_t$, a redução nominal requerida é

$$
A_{req}=20\log_{10}\left(\frac{E_m}{E_t}\right).
$$

Grandezas e detectores precisam ser comparáveis. Acrescente a margem de projeto explicitamente; não a esconda no arredondamento.

## Três pontos de intervenção

| Local | Estratégia | Exemplos | Risco típico |
|---|---|---|---|
| fonte | reduzir energia ou conteúdo espectral | diminuir loop quente, $dv/dt$, $di/dt$, usar *snubber* | eficiência, dissipação, temporização |
| caminho | reduzir transferência ou conversão | controlar retorno, separar, terminar, filtrar, blindar | ressonância, corrente de fuga, peso |
| vítima | aumentar imunidade | filtrar porta, histerese, proteção, isolamento | banda, latência, capacitância, custo |

Atuar na fonte costuma beneficiar vários caminhos, mas não é universalmente possível ou ótimo. A melhor opção é aquela que atinge a meta com margem e efeitos colaterais aceitáveis.

## Árvore de seleção por mecanismo

### Impedância comum

Se $V_n=I_sZ_{comum}$ domina, reduza a corrente, a impedância compartilhada ou separe os retornos funcionais. Em alta frequência, conexão curta e larga pode importar mais que baixa resistência DC. Consulte componentes/condutores no [capítulo Comportamento não ideal de componentes](06_componentes_nao_ideais.md) e integração no [capítulo Projeto de sistemas para EMC](17_projeto_sistemas_emc.md).

### Acoplamento capacitivo

Se $I_c=C_m\,dv/dt$ domina, reduza $dv/dt$, área paralela, capacitância mútua ou impedância da vítima; interponha uma tela ligada a uma referência apropriada quando necessário. Verifique se a tela não cria um novo retorno CM.

### Acoplamento indutivo

Se $V_m=M\,di/dt$ domina, reduza área dos loops, indutância mútua ou $di/dt$; aproxime ida e retorno, mude orientação ou use par trançado. O modelo detalhado de acoplamento está no [capítulo Crosstalk](09_crosstalk.md).

### Reflexão e descontinuidade

Se overshoot ou ringing depende de comprimento e carga, controle $Z_0$, terminação e caminho de retorno. Não trate reflexão como “ruído” a ser filtrado antes de verificar o [capítulo Linhas de transmissão e integridade de sinal](07_linhas_transmissao_integridade_sinal.md).

### Corrente de modo comum e radiação

Se cabo ou estrutura irradia em CM, reduza conversão DM→CM, ofereça retorno de baixa impedância no conector, filtre o modo correto e controle a terminação da blindagem. A física de antenas está no [capítulo Antenas](08_antenas.md), a medição radiada no [capítulo Emissões radiadas e suscetibilidade](11_emissoes_radiadas_suscetibilidade.md) e blindagem no [capítulo Blindagem](12_blindagem.md).

## Filtros: escolha pelo modo e pelas impedâncias

Um filtro deve ser definido por porta, modo, banda, corrente/tensão, $Z_S(f)$ e $Z_L(f)$. A perda de inserção em 50 Ω não garante o resultado no produto.

### Modo diferencial

Capacitores entre linhas e elementos série atuam principalmente em DM. Verifique corrente de ripple, estabilidade da fonte, queda de tensão e ressonância com a impedância da rede.

### Modo comum

Choques de modo comum e capacitores para chassi podem reduzir CM. Verifique indutância de fuga, saturação, capacitância entre enrolamentos, corrente de fuga e requisitos de segurança. O caminho físico até o chassi deve ser curto na banda de interesse.

### Componentes reais e layout

Acima da autorressonância, aumentar capacitância nominal pode não melhorar o filtro. Inclua ESR, ESL e montagem conforme o [capítulo Comportamento não ideal de componentes](06_componentes_nao_ideais.md). Para cálculo e validação como rede, use o [capítulo Modelagem de problemas EMC](14_modelagem_problemas_emc.md); para LISN e modos, use o [capítulo Emissões conduzidas e suscetibilidade](10_emissoes_conduzidas_suscetibilidade.md).

## Blindagem, cabos e interfaces

Blindagem é uma fronteira completa, não apenas uma chapa.

1. identifique campo próximo elétrico/magnético ou onda distante;
2. escolha material e espessura pela banda e mecanismo;
3. trate juntas, aberturas, ventilação e penetrações;
4. termine blindagens de cabo com baixa impedância na circunferência quando apropriado;
5. posicione filtros/proteções na entrada da fronteira;
6. verifique ressonâncias e corrente transferida para o chassi.

Um *pigtail* pode anular em alta frequência a vantagem de uma boa malha. Uma abertura ou cabo não tratado pode dominar toda a eficácia. Cálculos de reflexão, absorção e aberturas estão somente no [capítulo Blindagem](12_blindagem.md).

## PCB e PDN

No nível de placa, priorize continuidade de retorno, área de loop, posição de conectores, *stack-up*, localização de desacoplamento e separação orientada por correntes. “Separar analógico e digital” sem desenhar os retornos pode piorar a conversão de modo.

Para PDN, defina impedância-alvo,

$$
Z_{target}=\frac{\Delta V_{permitida}}{\Delta I},
$$

e verifique ressonâncias com componentes e montagem reais. As regras e o processo de revisão pertencem a **Projeto de PCBs considerando técnicas EMC**; a integração com chassi e cabos pertence a **Projeto de sistemas para EMC**.

## Robustez a ESD, EFT e surge

Crie um caminho deliberado para a corrente transitória antes que ela alcance circuitos sensíveis. Proteção eficaz combina:

- fronteira e ponto de entrada bem definidos;
- conexão de baixa indutância ao chassi/retorno apropriado;
- limitação de corrente/tensão coordenada em estágios;
- distância e isolamento compatíveis com segurança;
- proteção próxima da porta, sem trilha desprotegida longa;
- recuperação funcional e firmware robusto quando aplicável.

O arranjo de ensaio está em [Normas, Padronizações e Ensaios de EMC](04_normas_padronizacoes_ensaios.md) e a modelagem transitória em [Modelagem de problemas EMC](14_modelagem_problemas_emc.md).

## Matriz de decisão

Avalie cada alternativa em escala consistente, documentando evidência e premissas.

| Critério | Pergunta |
|---|---|
| eficácia | atinge a redução em toda a banda e estados? |
| robustez | tolera variação, montagem, cabo e envelhecimento? |
| efeito funcional | afeta potência, SI, banda, latência ou controle? |
| segurança | altera fuga, isolação, temperatura ou energia? |
| integração | cabe na PCB, conector, chassi e processo? |
| verificabilidade | é possível medir o mecanismo antes/depois? |
| custo total | inclui componente, montagem, teste e retrabalho? |

Combinações independentes podem fornecer margem, mas somar dB de mitigações sem considerar interação e impedâncias é incorreto.

## Protocolo de verificação

1. congele configuração e registre a linha de base;
2. meça a grandeza ligada ao mecanismo, não só o sintoma final;
3. aplique uma alteração reversível;
4. repita com a mesma banda, detector, posição e estado;
5. restaure o original para confirmar causalidade;
6. implemente a solução representativa de produção;
7. repita em unidades, cabos e estados críticos;
8. calcule margem incluindo incerteza;
9. realize pré-conformidade e, depois, ensaio formal aplicável.

### Registro antes/depois

| Item | Antes | Depois | Meta | Incerteza |
|---|---:|---:|---:|---:|
| grandeza do mecanismo |  |  |  |  |
| sintoma/critério funcional |  |  |  |  |
| efeito colateral |  |  |  |  |

## Casos de decisão

### Harmônico de clock irradiado pelo cabo

Meça corrente CM. Compare: redução de *slew rate*; restauração do retorno no conector; choque CM; terminação de blindagem. A solução preferida reduz $I_{CM}$ com menor impacto funcional, não necessariamente a que mais reduz campo em um único arranjo.

### Buck falha em emissão conduzida

Separe DM e CM antes de escolher componentes. Para DM, avalie loop de comutação e filtro com impedâncias reais. Para CM, avalie capacitância do nó rápido ao chassi/dissipador e retorno. Um filtro único pode deslocar a energia para outro modo.

### Entrada reinicia durante ESD

Mapeie o caminho de corrente na fronteira, observe reset/PDN e compare proteção na porta, conexão ao chassi e filtragem. A melhora precisa sobreviver ao layout de produção; um fio de bancada curto pode não representar a solução final.

## Exercícios

**E.1** Uma emissão está 8 dB acima do limite e a incerteza expandida é 3 dB. Proponha uma meta de redução e justifique a margem adicional.

**E.2** Para cada mecanismo da seção “Árvore de seleção por mecanismo”, proponha uma intervenção discriminante e uma solução de produção.

**E.3** Um filtro reduz DM em 20 dB, mas aumenta CM em 6 dB. Explique duas causas físicas e o próximo teste.

**E.4** Compare conexão de blindagem por *pigtail* e terminação circunferencial na faixa de 100 MHz, considerando indutância.

**E.5** Construa matriz de decisão para: reduzir *slew rate*, acrescentar blindagem ou filtrar a porta de uma vítima.

**E.6** Elabore protocolo antes/depois para uma correção de ESD incluindo critério funcional e restauração do original.

### Respostas orientativas

**E.1** A correção deve cobrir os 8 dB de excesso, os 3 dB de incerteza e uma margem de engenharia justificada por variabilidade. Uma meta como 14–17 dB pode ser razoável, mas deve derivar do risco, das unidades e do ciclo de vida, não de um número universal.

**E.3** O filtro pode estar convertendo DM em CM por assimetria ou criando novo retorno capacitivo ao chassi. Meça correntes modais nas duas portas e varie simetria/retorno mantendo o restante fixo.

## Orçamento probabilístico de margem

Se emissão, correção e erro de medição variam, a margem também é uma variável aleatória:

$$
M=L_{limite}-(L_{base}-A_{mit})-U.
$$

```python
import numpy as np
rng = np.random.default_rng(7)
n = 200_000
base = rng.normal(52, 1.8, n)       # dBµV/m
atten = rng.normal(14, 2.5, n)     # dB
measurement = rng.normal(0, 1.2, n)
limit = 40
margin = limit - (base - atten + measurement)
print('P(passar)=', np.mean(margin >= 0))
print('percentis da margem:', np.percentile(margin, [1, 5, 50, 95, 99]))
```

Não some desvios-padrão como se fossem margens determinísticas. Declare distribuições, correlações e se a incerteza é padrão ou expandida.

## Exemplo multicritério

Uma decisão pode usar pontuação ponderada, mas os pesos não substituem requisitos obrigatórios.

```python
import numpy as np
names = ['reduzir slew', 'choque CM', 'blindagem']
# colunas: eficácia, robustez, custo, impacto funcional; 0 ruim, 10 bom
scores = np.array([[7, 8, 9, 5], [8, 7, 7, 8], [9, 9, 3, 9]], float)
weights = np.array([0.40, 0.25, 0.20, 0.15])
total = scores @ weights
for name, value in sorted(zip(names, total), key=lambda x: -x[1]):
    print(f'{name:15s}: {value:.2f}')
```

Faça análise de sensibilidade dos pesos. Se a alternativa vencedora muda com pequenas variações, a decisão exige mais evidência.

## Laboratório SPICE — escolha de snubber

```spice
Vstep src 0 PULSE(0 24 0 2n 2n 100n 250n)
Lpar src sw 50n
Cpar sw 0 100p
Rload sw 0 100
Rsnub sw sn 22
Csnub sn 0 220p
.tran 20p 1u 0 100p
.print tran v(sw) v(sn)
.end
```

Simule sem o ramo RC, depois varra $R$ e $C$. Registre pico de tensão, tempo de acomodação e energia dissipada; minimizar apenas overshoot pode criar perda inaceitável. Parasitas e forma de excitação devem representar o circuito real.

## Checklist de saída

- mecanismo confirmado e capítulo físico consultado;
- redução requerida e margem definidas;
- modo, banda e impedâncias declarados;
- componentes e montagem não ideais incluídos;
- segurança e função verificadas;
- medição antes/depois repetível;
- solução de produção testada em condições críticas;
- resultado ligado ao plano de conformidade.
