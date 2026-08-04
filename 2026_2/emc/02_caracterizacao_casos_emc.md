# Caracterização e diagnóstico de casos EMC

> Este capítulo ensina a transformar um sintoma em um problema testável. Ele apresenta o modelo fonte–caminho–vítima e encaminha as derivações aos capítulos especializados, evitando repetir teoria de linhas, antenas, crosstalk, blindagem e projeto de sistemas.

## Objetivos de aprendizagem

Ao final, você deve ser capaz de:

1. definir o sintoma e o critério de falha sem ambiguidade;
2. descrever fonte, caminho e vítima por grandezas mensuráveis;
3. distinguir acoplamento conduzido, capacitivo, indutivo e radiado;
4. separar modo diferencial (DM), modo comum (CM) e conversão de modo;
5. propor hipóteses concorrentes e uma medição que as discrimine;
6. demonstrar causalidade por previsão, intervenção e repetição;
7. registrar margem, incerteza e limites do diagnóstico.

## Sumário

1. [O problema EMC como sistema](#o-problema-emc-como-sistema)
2. [Ficha mínima de caracterização](#ficha-mínima-de-caracterização)
3. [Caracterização da fonte](#caracterização-da-fonte)
4. [Caracterização do caminho](#caracterização-do-caminho)
5. [Caracterização da vítima](#caracterização-da-vítima)
6. [Método de diagnóstico em sete passos](#método-de-diagnóstico-em-sete-passos)
7. [Casos integradores](#casos-integradores)
8. [Escolha da mitigação](#escolha-da-mitigação)
9. [Exercícios de consolidação](#exercícios-de-consolidação)
10. [Laboratório — pontuação de hipóteses](#laboratório--pontuação-de-hipóteses)
11. [Entrega recomendada: relatório de diagnóstico](#entrega-recomendada-relatório-de-diagnóstico)

## O problema EMC como sistema

Uma interferência exige simultaneamente três elementos:

$$
\boxed{\text{fonte}\longrightarrow\text{caminho de acoplamento}\longrightarrow\text{vítima}}
$$

- **Fonte:** produz energia indesejada na banda relevante.
- **Caminho:** transporta ou converte essa energia.
- **Vítima:** responde à perturbação e apresenta degradação funcional.

Mitigar qualquer elemento pode resolver o caso, mas isso não significa que interromper o caminho seja sempre a melhor solução. A decisão depende de eficácia, custo, segurança, robustez e possibilidade de alterar cada elemento.

Para um sistema aproximadamente linear e invariante no tempo,

$$
Y(f)=S(f)H_c(f)H_v(f),
$$

em que $S(f)$ descreve a fonte, $H_c(f)$ o caminho e $H_v(f)$ a resposta da vítima. Em transientes, não linearidades ou saturação, esse produto é apenas um modelo inicial: é preciso trabalhar no tempo e incluir os estados do equipamento.

### Correlação não é causalidade

Um pico no espectro na frequência do clock é uma pista, não uma prova. Uma conclusão forte combina:

1. **previsão:** a hipótese antecipa frequência, polarização, dependência geométrica ou estado operacional;
2. **intervenção:** uma mudança seletiva no elemento previsto altera o sintoma;
3. **repetição:** o efeito reaparece ao restaurar a condição original;
4. **controle:** configuração, cabos, instrumentos e software permanecem comparáveis.

## Ficha mínima de caracterização

Antes de escolher filtros ou blindagem, preencha a ficha. Campos desconhecidos tornam-se itens de medição, não palpites.

| Elemento | O que registrar | Grandezas típicas |
|---|---|---|
| Sintoma | função afetada, severidade, duração, taxa de ocorrência | erro, reset, BER, desvio, critério A/B/C |
| Estado | modos da fonte e da vítima, carga, firmware, cabos | tensão, corrente, potência, tráfego, temperatura |
| Fonte | forma de onda, repetição, bordas, espectro, impedância | $V$, $I$, $dv/dt$, $di/dt$, $f$, $t_r$, $Z_s(f)$ |
| Caminho | condutores, retornos, parasitas, distância, orientação | $Z(f)$, $C_m$, $M$, função de transferência |
| Vítima | porta de entrada, banda, limiar e modo de falha | $Z_{in}(f)$, ganho, limiar, janela temporal |
| Evidência | instrumento, detector, banda e geometria | RBW/VBW, tempo de aquisição, posição, incerteza |
| Margem | diferença entre perturbação e limite | dB, V, A, V/m, A/m |

Uma boa descrição é operacional: “o ADC excede 5 LSB em 18% das conversões quando o buck entra em *burst mode*” é melhor que “o sensor fica ruidoso”.

## Caracterização da fonte

### Domínio do tempo

Registre amplitude, duração, repetição, *duty cycle*, tempo de subida e simultaneidade com o sintoma. Bordas rápidas, não apenas a frequência fundamental, definem a banda excitada. Como estimativa de ordem de grandeza,

$$
f_{\text{knee}}\approx\frac{0{,}35}{t_r},
$$

desde que se declare a convenção usada para $t_r$ e para a largura de banda. O capítulo [Fontes de ruído](03_fontes_ruido.md) desenvolve fontes naturais, chaveamento, arcos e transmissores; [Componentes não ideais](06_componentes_nao_ideais.md) explica como parasitas modificam as bordas.

### Domínio da frequência

Em fontes periódicas, procure fundamental, harmônicos, bandas laterais e modulação pelo estado de carga. Em ruído aleatório ou transientes, registre densidade espectral, distribuição temporal e condições de disparo. Não compare diretamente pico temporal, valor RMS, espectro por bin e leitura de detector quase-pico: são grandezas diferentes.

### Impedância e modo

A mesma tensão de circuito aberto pode injetar correntes muito diferentes. Caracterize $Z_s(f)$ e o retorno. Para dois condutores, adotando uma convenção simétrica,

$$
I_{CM}=\frac{I_1+I_2}{2},\qquad
I_{DM}=\frac{I_1-I_2}{2},
$$

$$
I_1=I_{CM}+I_{DM},\qquad I_2=I_{CM}-I_{DM}.
$$

O fator $1/2$ é uma convenção e deve ser mantido em todo o cálculo. Assimetrias convertem DM em CM; cabos podem então irradiar mesmo que o ruído tenha começado como diferencial. A decomposição e a medição são tratadas em [Emissões conduzidas](10_emissoes_conduzidas_suscetibilidade.md) e [Emissões radiadas](11_emissoes_radiadas_suscetibilidade.md).

## Caracterização do caminho

Mais de um caminho pode coexistir. A classificação indica qual variável alterar primeiro.

| Mecanismo | Modelo inicial | Evidência que favorece a hipótese | Intervenção discriminante |
|---|---|---|---|
| impedância comum | $V_n=I_sZ_{comum}$ | sintoma acompanha corrente de carga | separar ou reduzir o retorno comum |
| capacitivo | $I_c=C_m\,dv/dt$ | forte efeito de proximidade e impedância da vítima | reduzir $dv/dt$, $C_m$ ou $Z_{in}$ |
| indutivo | $V_m=M\,di/dt$ | efeito de área/orientação dos loops | reduzir loop, $di/dt$ ou $M$ |
| linha de transmissão | reflexões por descontinuidade de $Z_0$ | efeito de comprimento e terminação | terminar ou alterar comprimento controladamente |
| radiado | antena emissora + propagação + antena receptora | efeito de distância, polarização e cabo | reduzir corrente CM ou eficiência da antena |
| conversão de modo | desbalanceamento DM $\leftrightarrow$ CM | assimetria em filtro, conector ou retorno | restaurar simetria e medir os dois modos |

Os modelos completos pertencem a:

- [Linhas de transmissão](07_linhas_transmissao_integridade_sinal.md): propagação, reflexões e terminações;
- [Antenas](08_antenas.md): campos, ganho, abertura e regiões de campo;
- [Crosstalk](09_crosstalk.md): acoplamentos capacitivo e indutivo, NEXT e FEXT;
- [Blindagem](12_blindagem.md): reflexão, absorção, aberturas, cabos e conectores.

### Campo próximo e campo distante

$r\approx\lambda/(2\pi)$ é uma referência útil para a transição entre termos reativos e radiativos de uma fonte pequena, não uma fronteira universal. Para uma antena de maior dimensão $D$, a condição de campo distante também depende de $2D^2/\lambda$. Registre frequência, maior dimensão, distância e natureza da fonte antes de aplicar relações de onda plana.

## Caracterização da vítima

A vítima não é apenas “o equipamento”. Localize a porta física e a etapa funcional em que a energia indesejada se torna erro.

### Curva de suscetibilidade

Meça ou estime o limiar de falha em função de frequência, amplitude, modulação, polarização, porta e estado operacional. Uma única amplitude de ensaio não descreve a vítima inteira. Ressonâncias, proteção não linear, filtros e janelas de amostragem podem produzir regiões estreitas de alta suscetibilidade.

Para uma exigência $A_{req}$ e um limiar de falha $A_{fail}$, ambos na mesma grandeza e condição,

$$
M_{imunidade}=20\log_{10}\!\left(\frac{A_{fail}}{A_{req}}\right).
$$

Margem positiva indica que o limiar está acima do nível requerido. Inclua incerteza e variabilidade; uma margem nominal pequena não demonstra robustez.

### Critério funcional

Defina antes do ensaio se são aceitáveis degradação temporária, autorrecuperação ou perda de dados. Os critérios e níveis vêm da norma de produto e do plano de ensaio aplicáveis; veja [Normas e ensaios](04_normas_padronizacoes_ensaios.md). Não transforme um exemplo didático em limite regulatório.

## Método de diagnóstico em sete passos

### Passo 1 — Tornar o sintoma reproduzível

Fixe configuração, cabos, carga, software, temperatura e sequência. Registre taxa-base e critério objetivo.

### Passo 2 — Construir a linha do tempo

Correlacione evento da fonte, grandeza acoplada e falha. Use disparo comum quando possível. Cuidado com atrasos de firmware e mecanismos de proteção.

### Passo 3 — Formular hipóteses concorrentes

Cada hipótese deve nomear fonte, caminho, porta da vítima e uma previsão exclusiva. Exemplo: “corrente CM do buck retorna pela blindagem do cabo e entra no ADC pelo conector” é testável; “é EMI” não é.

### Passo 4 — Ordenar por evidência e custo

Priorize hipóteses que explicam mais observações e que possam ser testadas com alteração reversível e segura.

### Passo 5 — Medir sem perturbar excessivamente

Declare largura de banda, carga da ponta, piso de ruído, detector e posição. Uma ponta longa de osciloscópio ou uma sonda de campo próxima demais pode criar o resultado que se pretendia observar.

### Passo 6 — Alterar uma variável por vez

Exemplos: ferrite temporário no cabo, terminação controlada, redução de *slew rate*, placa metálica provisória, rotação de loop ou alimentação isolada. A intervenção deve selecionar um mecanismo, não apenas “melhorar tudo”.

### Passo 7 — Confirmar e documentar margem

Restaure a condição original, reproduza a falha, aplique novamente a correção e repita em unidades e estados representativos. Registre antes/depois, incerteza, efeitos colaterais e margem.

### Matriz de hipóteses

| Hipótese | Predição | Medição | Confirma se | Refuta se |
|---|---|---|---|---|
| ripple DM na entrada | pico acompanha $f_{sw}$ nas duas linhas em oposição | LISN ou duas sondas de corrente | componente DM acompanha o sintoma | só CM muda |
| cabo como antena CM | emissão muda com posição/comprimento | clamp de corrente + variação geométrica | campo e $I_{CM}$ variam juntos | $I_{CM}$ permanece no piso |
| crosstalk local | erro cresce com $dv/dt$, $di/dt$ e paralelismo | sonda local + alteração de borda | resposta segue geometria/borda | alteração seletiva não tem efeito |
| descontinuidade de retorno | problema coincide com troca de plano/via | TDR ou inspeção de retorno | stitching próximo reduz conversão | caminho de retorno já é contínuo |
| ressonância da PDN | erro coincide com pico de $|Z_{PDN}|$ | VNA/injeção de impedância | amortecimento desloca/reduz ambos | pico e falha não se correlacionam |

## Casos integradores

### Buck interfere em sensor analógico

**Sintoma:** erro do ADC aparece apenas sob carga leve.

**Hipóteses:** ripple DM pela alimentação; corrente CM pelo acoplamento do nó de comutação; acoplamento local do loop quente ao sinal.

**Teste discriminante:** medir simultaneamente o nó de comutação, a alimentação do sensor e o erro; decompor a corrente no cabo em CM/DM; variar *slew rate* sem mudar $f_{sw}$; aproximar uma sonda magnética do loop quente.

**Encaminhamento:** fonte no [cap. 3](03_fontes_ruido.md), componentes e parasitas no [cap. 6](06_componentes_nao_ideais.md), condução no [cap. 10](10_emissoes_conduzidas_suscetibilidade.md) e projeto sistêmico no [cap. 16](16_projeto_sistemas_emc.md).

### Clock digital causa emissão em cabo

**Sintoma:** pico radiado em harmônico do clock muda quando o cabo é movido.

**Hipótese principal:** descontinuidade de retorno converte corrente DM em CM; o cabo é a antena eficiente.

**Teste discriminante:** medir corrente CM no cabo; reduzir temporariamente o *slew rate*; acrescentar conexão de chassi de baixa indutância no conector; comparar polarização e posição.

**Armadilha:** blindar apenas a trilha do clock pode não alterar a corrente de modo comum que efetivamente irradia.

### ESD na carcaça reinicia o equipamento

**Sintoma:** reset durante descarga, sem dano permanente.

**Hipóteses:** corrente pela referência lógica; acoplamento por abertura; disparo de pino de reset; queda da PDN.

**Teste discriminante:** monitorar pino de reset e alimentação com técnica apropriada; mapear corrente na carcaça; variar o ponto de descarga e o fechamento das juntas; injetar perturbação controlada nas portas suspeitas.

**Segurança:** ensaios de ESD exigem arranjo, gerador, calibração e proteção definidos. Consulte o [cap. 4](04_normas_padronizacoes_ensaios.md) e modele transientes conforme o [cap. 13](13_modelagem_problemas_emc.md).

### Reflexão confundida com crosstalk

**Sintoma:** overshoot em uma entrada digital após mudança de comprimento da trilha.

**Hipóteses:** reflexão por desadaptação; crosstalk de uma linha vizinha; *ground bounce* no encapsulamento.

**Teste discriminante:** observar dependência com comprimento e terminação; silenciar a linha agressora; medir referência local da vítima. Use o [cap. 7](07_linhas_transmissao_integridade_sinal.md) para reflexões e o [cap. 9](09_crosstalk.md) para acoplamento entre linhas.

## Escolha da mitigação

Depois de identificar o mecanismo, escolha a intervenção mais próxima da causa e verifique efeitos colaterais.

| Atuação | Exemplos | Possíveis custos |
|---|---|---|
| fonte | reduzir borda, loop quente, amplitude ou corrente CM | dissipação, temporização, eficiência |
| caminho | controlar retorno, separar, filtrar, terminar, blindar | área, peso, ressonância, corrente de fuga |
| vítima | filtrar porta, aumentar histerese, proteger, corrigir software | latência, banda, capacitância, mascaramento de falha |

As técnicas são reunidas em [Minimização de interferências](14_minimizacao_interferencias.md), detalhadas em [Projeto de PCBs](15_projeto_pcbs_emc.md) e integradas em [Projeto de sistemas](16_projeto_sistemas_emc.md). A implementação e a simulação prática aparecem em [KiCad](18_projeto_e_simulacao_com_kicad.md).

## Exercícios de consolidação

**E.1** Um conversor de 500 kHz causa erro em um termopar somente quando o cabo passa perto do indutor. Escreva três hipóteses completas e uma medição discriminante para cada uma.

**E.2** Duas correntes medidas são $I_1=32\,\text{mA}$ e $I_2=-28\,\text{mA}$. Calcule $I_{CM}$ e $I_{DM}$ pela convenção deste capítulo e reconstrua $I_1$ e $I_2$.

**E.3** Um equipamento falha a $3\,\text{V/m}$ e deve operar a $10\,\text{V/m}$. Calcule a margem nominal e explique por que o valor sozinho não encerra a avaliação.

**E.4** Liste as evidências que distinguem reflexão, crosstalk e *ground bounce* em um sinal digital com overshoot.

**E.5** Construa uma ficha de caracterização para um reset durante ESD, marcando como “desconhecido” tudo que exigiria medição.

**E.6** Explique por que multiplicar o pico temporal de corrente ESD por uma impedância conhecida apenas em 100 MHz não determina a tensão transitória na vítima.

**E.7** Um pico radiado diminui 12 dB com ferrite no cabo, mas a corrente DM não muda. Qual hipótese ganhou força? Que repetição ou controle ainda é necessário?

### Respostas orientativas

**E.2** $I_{CM}=2\,\text{mA}$ e $I_{DM}=30\,\text{mA}$; portanto $I_1=2+30=32\,\text{mA}$ e $I_2=2-30=-28\,\text{mA}$.

**E.3** $20\log_{10}(3/10)=-10{,}46\,\text{dB}$. A margem é negativa; ainda se devem declarar modulação, banda, polarização, critério funcional, incerteza e estado operacional.

**E.6** Pico temporal e impedância fasorial monofrequencial pertencem a descrições diferentes. É necessário obter $I(f)$ e $Z(f)$ na banda relevante e calcular $v(t)=\mathcal{F}^{-1}\{I(f)Z(f)\}$, incluindo não linearidades e a resposta da vítima.

**E.7** Ganha força a hipótese de emissão por corrente CM no cabo. É preciso medir $I_{CM}$ antes/depois, restaurar a condição original, repetir a intervenção e controlar posição do cabo, estado do equipamento e configuração de medição.

## Laboratório — pontuação de hipóteses

Pontuação não prova causalidade, mas torna explícita a atualização das hipóteses. Use pesos definidos antes do teste e preserve resultados que contradigam a hipótese favorita.

```python
import numpy as np
hypotheses = ['DM pela alimentação', 'CM pelo cabo', 'crosstalk local']
tests = ['muda com LISN/filtro DM', 'muda com ferrite no cabo',
         'muda com orientação/sonda local']
# linhas: hipóteses; colunas: previsão de resposta (0 a 1)
prediction = np.array([[.9, .2, .3], [.2, .9, .5], [.2, .3, .9]])
observed = np.array([.1, .9, .7])
error = np.sum((prediction-observed)**2, axis=1)
score = np.exp(-error)
score /= score.sum()
for h, s in sorted(zip(hypotheses, score), key=lambda x: -x[1]):
    print(f'{h:24s}: {s:.3f}')
```

Repita com outros pesos e inclua uma hipótese “mecanismo não modelado”. A etapa decisiva continua sendo intervenção seletiva, restauração e repetição.

## Entrega recomendada: relatório de diagnóstico

Um relatório curto e auditável deve conter:

1. sintoma, critério de falha e configuração;
2. diagrama fonte–caminho–vítima;
3. hipóteses e previsões;
4. instrumentos, banda, detector, geometria e incerteza;
5. resultados antes/depois;
6. hipótese confirmada e alternativas ainda abertas;
7. correção, efeitos colaterais e margem;
8. condições para repetir o ensaio.

Esse relatório é a ponte entre a caracterização introdutória, os mecanismos dos capítulos 6–12 e a síntese dos capítulos 13–16. Ele evita duas falhas comuns: aplicar uma solução por hábito e confundir melhora ocasional com compreensão do mecanismo.
